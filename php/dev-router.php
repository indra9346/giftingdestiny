<?php
// Local testing only (php -S localhost:8090 dev-router.php). Not uploaded to the server.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (preg_match('~^/app(/|$)~', $path)) { http_response_code(403); exit('Forbidden'); }
if ($path !== '/' && is_file(__DIR__ . $path)) {
    if (preg_match('~^/gd-uploads/.*\.(php|phtml|html?|svg)$~i', $path)) { http_response_code(403); exit('Forbidden'); }
    return false;
}
// Product photos, logo and films live in the Vite project's public folder; serve them from there.
$public = dirname(__DIR__) . '/public' . $path;
if ($path !== '/' && is_file($public) && strpos(realpath($public), realpath(dirname(__DIR__) . '/public')) === 0) {
    $types = ['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'svg' => 'image/svg+xml', 'mp4' => 'video/mp4'];
    $ext = strtolower(pathinfo($public, PATHINFO_EXTENSION));
    header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
    header('Content-Length: ' . filesize($public));
    readfile($public);
    return true;
}
$_SERVER['SCRIPT_NAME'] = '/gd-index.php';
require __DIR__ . '/gd-index.php';
