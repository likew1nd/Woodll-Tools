<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function get_db(): PDO {
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dataDir = dirname(ADMIN_DB_PATH);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $pdo = new PDO('sqlite:' . ADMIN_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec('CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        admin_id INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS tools_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        config_json TEXT,
        updated_at TEXT
    )');

    $pdo->exec('CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        title TEXT,
        title_description TEXT,
        description TEXT,
        logo_url TEXT,
        canonical_url TEXT,
        og_title TEXT,
        og_description TEXT,
        og_image_url TEXT,
        og_url TEXT,
        twitter_title TEXT,
        twitter_description TEXT,
        twitter_image_url TEXT,
        updated_at TEXT
    )');

    $columns = $pdo->query("PRAGMA table_info(site_config)")->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_map(static fn($column) => $column['name'], $columns);
    $missingColumns = [
        'title_description',
        'canonical_url',
        'og_title',
        'og_description',
        'og_image_url',
        'og_url',
        'twitter_title',
        'twitter_description',
        'twitter_image_url',
    ];
    foreach ($missingColumns as $column) {
        if (!in_array($column, $columnNames, true)) {
            $pdo->exec(sprintf('ALTER TABLE site_config ADD COLUMN %s TEXT', $column));
        }
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM admins');
    $stmt->execute();
    $count = (int) $stmt->fetchColumn();
    if ($count === 0) {
        $hash = password_hash(ADMIN_PASSWORD, PASSWORD_DEFAULT);
        $insert = $pdo->prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)');
        $insert->execute([ADMIN_USERNAME, $hash, gmdate('c')]);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM site_config');
    $stmt->execute();
    $siteCount = (int) $stmt->fetchColumn();
    if ($siteCount === 0) {
        $insertSite = $pdo->prepare('INSERT INTO site_config (id, title, title_description, description, logo_url, canonical_url, og_title, og_description, og_image_url, og_url, twitter_title, twitter_description, twitter_image_url, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insertSite->execute([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            gmdate('c'),
        ]);
    }

    return $pdo;
}

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

function bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header) {
        return null;
    }
    if (preg_match('/^Bearer\\s+(.*)$/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function require_auth(PDO $pdo): array {
    $token = bearer_token();
    if (!$token) {
        json_response(['error' => 'Unauthorized'], 401);
    }

    $stmt = $pdo->prepare('SELECT admin_id, expires_at FROM sessions WHERE token = ?');
    $stmt->execute([$token]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        json_response(['error' => 'Unauthorized'], 401);
    }

    if ((int) $row['expires_at'] < time()) {
        $pdo->prepare('DELETE FROM sessions WHERE token = ?')->execute([$token]);
        json_response(['error' => 'Unauthorized'], 401);
    }

    return $row;
}
