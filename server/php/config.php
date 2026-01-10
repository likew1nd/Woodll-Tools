<?php
declare(strict_types=1);

// Minimal config for PHP API (override with env if needed).
define('ADMIN_USERNAME', getenv('ADMIN_USERNAME') ?: 'admin');
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'admin123');
define('ADMIN_TOKEN_TTL', 60 * 60 * 12); // 12 hours
define('ADMIN_DB_PATH', __DIR__ . '/../data/admin.sqlite');
