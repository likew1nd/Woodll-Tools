<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = get_db();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = $path ?: '/';

if (strpos($path, '/api/') !== 0) {
    json_response(['error' => 'Not found'], 404);
}

// Normalize path without leading /api
$route = substr($path, 4);

if ($route === '/auth/login' && $method === 'POST') {
    $body = read_json_body();
    $username = $body['username'] ?? '';
    $password = $body['password'] ?? '';
    if (!$username || !$password) {
        json_response(['error' => 'Missing credentials'], 400);
    }

    $stmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE username = ?');
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        json_response(['error' => 'Invalid credentials'], 401);
    }

    $token = bin2hex(random_bytes(32));
    $expires = time() + ADMIN_TOKEN_TTL;
    $insert = $pdo->prepare('INSERT INTO sessions (token, admin_id, expires_at) VALUES (?, ?, ?)');
    $insert->execute([$token, (int) $admin['id'], $expires]);

    json_response(['token' => $token]);
}

if ($route === '/auth/change-password' && $method === 'POST') {
    require_auth($pdo);
    $body = read_json_body();
    $oldPassword = $body['oldPassword'] ?? '';
    $newPassword = $body['newPassword'] ?? '';
    if (!$oldPassword || !$newPassword) {
        json_response(['error' => 'Missing credentials'], 400);
    }

    $stmt = $pdo->prepare('SELECT id, password_hash FROM admins LIMIT 1');
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$admin || !password_verify($oldPassword, $admin['password_hash'])) {
        json_response(['error' => 'Invalid credentials'], 401);
    }

    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $update = $pdo->prepare('UPDATE admins SET password_hash = ? WHERE id = ?');
    $update->execute([$hash, (int) $admin['id']]);
    json_response(['ok' => true]);
}

if ($route === '/tools-config' && $method === 'GET') {
    $stmt = $pdo->prepare('SELECT config_json FROM tools_config WHERE id = 1');
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $config = $row && $row['config_json'] ? json_decode($row['config_json'], true) : null;
    json_response(['config' => $config]);
}

if ($route === '/tools-config' && $method === 'PUT') {
  require_auth($pdo);
  $body = read_json_body();
  $config = $body['config'] ?? null;
    if (!is_array($config)) {
        json_response(['error' => 'Invalid config'], 400);
    }

    $stmt = $pdo->prepare('INSERT INTO tools_config (id, config_json, updated_at) VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json, updated_at = excluded.updated_at');
  $stmt->execute([json_encode($config, JSON_UNESCAPED_UNICODE), gmdate('c')]);
  json_response(['ok' => true]);
}

if ($route === '/site-config' && $method === 'GET') {
  $stmt = $pdo->prepare('SELECT title, title_description, description, logo_url, canonical_url FROM site_config WHERE id = 1');
  $stmt->execute();
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $config = [
    'title' => $row['title'] ?? '',
    'titleDescription' => $row['title_description'] ?? '',
    'description' => $row['description'] ?? '',
    'logoUrl' => $row['logo_url'] ?? '',
    'canonicalUrl' => $row['canonical_url'] ?? '',
  ];
  json_response(['config' => $config]);
}

if ($route === '/site-config' && $method === 'PUT') {
  require_auth($pdo);
  $body = read_json_body();
  $config = $body['config'] ?? null;
  if (!is_array($config)) {
    json_response(['error' => 'Invalid config'], 400);
  }

  $title = trim((string) ($config['title'] ?? ''));
  $titleDescription = trim((string) ($config['titleDescription'] ?? ''));
  $description = trim((string) ($config['description'] ?? ''));
  $logoUrl = trim((string) ($config['logoUrl'] ?? ''));
  $canonicalUrl = trim((string) ($config['canonicalUrl'] ?? ''));

  if ($title === '') {
    json_response(['error' => 'Title required'], 400);
  }

  $stmt = $pdo->prepare('INSERT INTO site_config (id, title, title_description, description, logo_url, canonical_url, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title = excluded.title, title_description = excluded.title_description, description = excluded.description, logo_url = excluded.logo_url, canonical_url = excluded.canonical_url, updated_at = excluded.updated_at');
  $stmt->execute([$title, $titleDescription, $description, $logoUrl, $canonicalUrl, gmdate('c')]);
  json_response(['ok' => true]);
}

if ($route === '/site-config/logo' && $method === 'POST') {
  require_auth($pdo);
  if (!isset($_FILES['logo'])) {
    json_response(['error' => 'Missing file'], 400);
  }

  $file = $_FILES['logo'];
  if ($file['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'Upload failed'], 400);
  }

  if (function_exists('mime_content_type')) {
    $mime = mime_content_type($file['tmp_name']);
  }
  else {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo ? finfo_file($finfo, $file['tmp_name']) : '';
    if ($finfo) {
      finfo_close($finfo);
    }
  }
  $allowed = [
    'image/png' => 'png',
    'image/jpeg' => 'jpg',
    'image/webp' => 'webp',
    'image/svg+xml' => 'svg',
  ];
  if (!isset($allowed[$mime])) {
    json_response(['error' => 'Invalid file type'], 400);
  }

  $publicRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__), '/');
  $uploadDir = $publicRoot . '/uploads';
  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }

  $ext = $allowed[$mime];
  $fileName = 'logo.' . $ext;
  $dest = $uploadDir . '/' . $fileName;
  if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_response(['error' => 'Upload failed'], 500);
  }

  $logoUrl = '/uploads/' . $fileName . '?v=' . time();
  $stmt = $pdo->prepare('UPDATE site_config SET logo_url = ?, updated_at = ? WHERE id = 1');
  $stmt->execute([$logoUrl, gmdate('c')]);

  json_response(['logoUrl' => $logoUrl]);
}

json_response(['error' => 'Not found'], 404);
