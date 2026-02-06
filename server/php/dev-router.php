<?php
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = $path === '' ? '/' : $path;
$filePath = __DIR__ . $path;

if ($path !== '/' && file_exists($filePath)) {
    return false;
}

require __DIR__ . '/index.php';
