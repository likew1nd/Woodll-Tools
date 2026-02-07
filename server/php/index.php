<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$pdo = get_db();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = $path ?: '/';

if (($path === '/share/vps' || $path === '/share/vps.svg' || strpos($path, '/share/vps/') === 0) && $method === 'GET') {
    $token = $_GET['token'] ?? '';
    if (!$token && preg_match('#^/share/vps/([a-f0-9]+)\.svg$#i', $path, $matches)) {
        $token = $matches[1];
    }
    if (!$token) {
        http_response_code(400);
        echo 'Missing token';
        exit;
    }

    $stmt = $pdo->prepare('SELECT payload_json, status FROM vps_share WHERE token = ?');
    $stmt->execute([$token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo 'Not found';
        exit;
    }

    $payload = json_decode($row['payload_json'], true);
    if (!is_array($payload)) {
        $payload = [];
    }
    $payload['sold'] = ($row['status'] ?? 'active') === 'sold';
    $svg = build_vps_svg($payload);
    output_svg($svg);
}

if (strpos($path, '/api/') !== 0) {
    json_response(['error' => 'Not found'], 404);
}

// Normalize path without leading /api
$route = substr($path, 4);

function escape_xml($value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_XML1, 'UTF-8');
}

function build_vps_svg(array $payload): string {
    $theme = (string) ($payload['theme'] ?? 'light');
    $isDark = $theme === 'dark';
    $isSold = (bool) ($payload['sold'] ?? false);
    $palette = [
        'bgStart' => $isDark ? '#0f172a' : '#fdf2f8',
        'bgEnd' => $isDark ? '#111827' : '#eef2ff',
        'cardBg' => $isDark ? '#0b1220' : '#ffffff',
        'cardStroke' => $isDark ? '#1f2937' : '#e2e8f0',
        'panelText' => $isDark ? '#e2e8f0' : '#3b0a2a',
        'mutedText' => '#94a3b8',
        'accentGreen' => $isDark ? '#22c55e' : '#16a34a',
        'iconGreen' => $isDark ? '#22c55e' : '#34d399',
        'barBg' => $isDark ? '#1f2937' : '#e2e8f0',
        'barFill' => '#7dd3fc',
        'timeCardBg' => $isDark ? '#0b1220' : '#ffffff',
        'timeCardStroke' => $isDark ? '#1f2937' : '#e2e8f0',
        'timeIconBg' => $isDark ? '#1e3a8a' : '#dbeafe',
        'timeIconText' => $isDark ? '#93c5fd' : '#2563eb',
        'timeNumber' => '#3b82f6',
    ];

    $currencySymbol = escape_xml($payload['currencySymbol'] ?? '$');
    $remainingValue = escape_xml($payload['remainingValue'] ?? '--');
    $premiumValueRaw = trim((string) ($payload['premiumValue'] ?? ''));
    $premiumValueEsc = escape_xml($premiumValueRaw);
    $premiumNumber = is_numeric($premiumValueRaw) ? (float) $premiumValueRaw : 0.0;
    $showPremium = $premiumNumber > 0;
    $discountMode = (bool) ($payload['discountMode'] ?? false);
    $premiumLabel = ($discountMode ? '折扣-' : '溢价+') . $premiumValueEsc;
    $premiumWidth = max(84, 18 + (strlen($premiumLabel) * 8));
    $premiumX = 380;
    $premiumY = 208;
    $badgeColor = $discountMode ? '#38bdf8' : '#ef4444';
    $premiumBadge = build_premium_badge_svg($showPremium, $premiumX, $premiumY, $premiumWidth, $premiumLabel, $badgeColor);
    $soldStamp = build_sold_stamp_svg($isSold);
    $remainingDays = escape_xml($payload['remainingDays'] ?? '--');
    $formattedAsOf = escape_xml($payload['formattedAsOf'] ?? '--');
    $formattedEnd = escape_xml($payload['formattedEnd'] ?? '--');
    $providerHost = escape_xml($payload['providerHost'] ?? '');
    $productName = escape_xml($payload['productName'] ?? '--');
    $configText = escape_xml($payload['configText'] ?? '--');
    $trafficText = escape_xml($payload['trafficText'] ?? '--');
    $billingPeriodLabel = escape_xml($payload['billingPeriodLabel'] ?? '--');
    $renewalText = escape_xml($payload['renewalText'] ?? '--');
    $remark = escape_xml($payload['remark'] ?? '--');
    $progress = (float) ($payload['progress'] ?? 0);
    $safeProgress = max(0, min(1, $progress));

    return <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="810" viewBox="0 0 600 810">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$palette['bgStart']}"/>
      <stop offset="100%" stop-color="{$palette['bgEnd']}"/>
    </linearGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="600" height="810" rx="28" fill="url(#bg)"/>
  <rect x="40" y="40" width="520" height="480" rx="22" fill="{$palette['cardBg']}" stroke="{$palette['cardStroke']}"/>
  <rect x="240" y="80" width="120" height="120" rx="24" fill="{$palette['iconGreen']}"/>
  <text x="300" y="155" text-anchor="middle" font-size="48" fill="#ffffff" font-family="sans-serif">{$currencySymbol}</text>
  <text x="300" y="230" text-anchor="middle" font-size="22" fill="{$palette['panelText']}" font-family="sans-serif">剩余价值</text>
  {$premiumBadge}
  <text x="300" y="300" text-anchor="middle" font-size="48" fill="{$palette['accentGreen']}" font-weight="700" font-family="sans-serif">{$remainingValue}</text>
  <rect x="120" y="318" width="360" height="8" rx="4" fill="url(#divider)"/>
  <text x="80" y="364" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">品名</text>
  <text x="520" y="364" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$productName}</text>
  <text x="80" y="392" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">配置</text>
  <text x="520" y="392" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$configText}</text>
  <text x="80" y="420" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">流量/网络速率</text>
  <text x="520" y="420" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$trafficText}</text>
  <text x="80" y="448" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">付费周期</text>
  <text x="520" y="448" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$billingPeriodLabel}</text>
  <text x="80" y="476" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">续费金额</text>
  <text x="520" y="476" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$renewalText}</text>
  <text x="80" y="504" font-size="13" fill="{$palette['mutedText']}" font-family="sans-serif">备注</text>
  <text x="520" y="504" text-anchor="end" font-size="15" font-weight="600" fill="{$palette['panelText']}" font-family="sans-serif">{$remark}</text>
  {$soldStamp}

  <rect x="40" y="540" width="520" height="220" rx="22" fill="{$palette['timeCardBg']}" stroke="{$palette['timeCardStroke']}"/>
  <circle cx="90" cy="600" r="26" fill="{$palette['timeIconBg']}"/>
  <text x="90" y="608" text-anchor="middle" font-size="18" fill="{$palette['timeIconText']}" font-family="sans-serif">⏱</text>
  <text x="140" y="600" font-size="20" fill="{$palette['panelText']}" font-family="sans-serif">剩余时间</text>
  <text x="140" y="630" font-size="14" fill="{$palette['mutedText']}" font-family="sans-serif">到期于 {$formattedEnd}</text>
  <text x="520" y="610" text-anchor="end" font-size="42" fill="{$palette['timeNumber']}" font-weight="700" font-family="sans-serif">{$remainingDays}</text>
  <text x="520" y="640" text-anchor="end" font-size="14" fill="{$palette['mutedText']}" font-family="sans-serif">天</text>
  <rect x="80" y="678" width="440" height="20" rx="10" fill="{$palette['barBg']}"/>
  <rect x="80" y="678" width="{440 * $safeProgress}" height="20" rx="10" fill="{$palette['barFill']}"/>
  <text x="80" y="730" font-size="14" fill="{$palette['mutedText']}" font-family="sans-serif">{$formattedAsOf}</text>
  <text x="520" y="730" text-anchor="end" font-size="14" fill="{$palette['mutedText']}" font-family="sans-serif">{$formattedEnd}</text>
  <text x="300" y="790" text-anchor="middle" font-size="12" fill="{$palette['mutedText']}" font-family="sans-serif">由 {$providerHost} 提供</text>
</svg>
SVG;
}

function output_svg(string $svg): void {
    header('Content-Type: image/svg+xml; charset=utf-8');
    echo $svg;
    exit;
}

function build_premium_badge_svg(bool $show, int $x, int $y, int $width, string $label, string $color): string {
    if (!$show) {
        return '';
    }
    $height = 26;
    $radius = 8;
    $textX = $x + (int) floor($width / 2);
    $textY = $y + 18;
    $safeLabel = escape_xml($label);
    return sprintf(
        '<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="%s" fill-opacity="0.24" stroke="%s" stroke-opacity="0.9"/>'
        . '<text x="%d" y="%d" text-anchor="middle" font-size="13" font-weight="700" fill="%s" font-family="sans-serif">%s</text>',
        $x,
        $y,
        $width,
        $height,
        $radius,
        $color,
        $color,
        $textX,
        $textY,
        $color,
        $safeLabel
    );
}

function build_sold_stamp_svg(bool $show): string {
    if (!$show) {
        return '';
    }
    $label = '已售';
    return <<<SVG
  <g transform="translate(300 350) rotate(-20)" opacity="0.7">
    <rect x="-155" y="-90" width="310" height="156" rx="6" fill="none" stroke="#ef4444" stroke-width="10"/>
    <text x="0" y="18" text-anchor="middle" font-size="100" font-weight="800" fill="#ef4444" font-family="sans-serif">{$label}</text>
  </g>
SVG;
}

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

if ($route === '/vps-remaining-value/share' && $method === 'POST') {
    $body = read_json_body();
    $ownerKey = trim((string) ($body['ownerKey'] ?? ''));
    $payload = $body['payload'] ?? null;
    $productName = trim((string) ($body['productName'] ?? ''));

    if ($ownerKey === '' || !is_array($payload)) {
        json_response(['error' => 'Invalid payload'], 400);
    }

    unset($payload['sold']);

    $token = bin2hex(random_bytes(16));
    $now = gmdate('c');
    $stmt = $pdo->prepare('INSERT INTO vps_share (owner_key, token, payload_json, product_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $ownerKey,
        $token,
        json_encode($payload, JSON_UNESCAPED_UNICODE),
        $productName,
        'active',
        $now,
        $now,
    ]);
    $id = (int) $pdo->lastInsertId();

    $scheme = 'http';
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'];
    }
    else if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        $scheme = 'https';
    }
    $host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
    $shareUrl = $scheme . '://' . $host . '/share/vps/' . $token . '.svg';

    json_response(['id' => $id, 'token' => $token, 'shareUrl' => $shareUrl, 'ownerKey' => $ownerKey]);
}

if ($route === '/vps-remaining-value/history' && $method === 'GET') {
    $ownerKey = trim((string) ($_GET['owner_key'] ?? ''));
    if ($ownerKey === '') {
        json_response(['error' => 'Missing owner_key'], 400);
    }

    $stmt = $pdo->prepare('SELECT id, token, product_name, status, created_at FROM vps_share WHERE owner_key = ? ORDER BY id DESC');
    $stmt->execute([$ownerKey]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['items' => $items]);
}

if ($route === '/vps-remaining-value/mark-sold' && $method === 'POST') {
    $body = read_json_body();
    $ownerKey = trim((string) ($body['ownerKey'] ?? ''));
    $id = (int) ($body['id'] ?? 0);
    $status = ($body['status'] ?? 'sold') === 'active' ? 'active' : 'sold';

    if ($ownerKey === '' || $id <= 0) {
        json_response(['error' => 'Invalid payload'], 400);
    }

    $stmt = $pdo->prepare('UPDATE vps_share SET status = ?, updated_at = ? WHERE id = ? AND owner_key = ?');
    $stmt->execute([$status, gmdate('c'), $id, $ownerKey]);
    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Not found'], 404);
    }

    json_response(['ok' => true]);
}

if ($route === '/vps-remaining-value/svg' && ($method === 'POST' || $method === 'GET')) {
    $payload = $method === 'POST' ? read_json_body() : [];
    $svg = build_vps_svg($payload);
    output_svg($svg);
}

if ($route === '/vps-remaining-value/svg/save' && $method === 'POST') {
    $payload = read_json_body();
    $svg = build_vps_svg($payload);

    $publicRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__), '/');
    $uploadDir = $publicRoot . '/uploads';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $fileName = 'vps_' . time() . '_' . bin2hex(random_bytes(6)) . '.svg';
    $filePath = $uploadDir . '/' . $fileName;
    $written = file_put_contents($filePath, $svg);
    if ($written === false) {
        json_response(['error' => 'Save failed'], 500);
    }

    $relativeUrl = '/uploads/' . $fileName;
    $scheme = 'http';
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'];
    }
    else if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        $scheme = 'https';
    }
    $host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
    $absoluteUrl = $scheme . '://' . $host . $relativeUrl;

    json_response(['url' => $absoluteUrl, 'path' => $relativeUrl]);
}

json_response(['error' => 'Not found'], 404);
