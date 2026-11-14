<?php
declare(strict_types=1);

// Loaded by gd-index.php for every request.
define('GD_APP', __DIR__);
define('GD_ROOT', dirname(__DIR__));

if (is_file(GD_APP . '/config.local.php')) require GD_APP . '/config.local.php';
require GD_APP . '/config.php';

date_default_timezone_set(GD_TIMEZONE);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Any unexpected error: log it privately, show visitors a short message (JSON for the admin's background saves).
set_exception_handler(function (Throwable $e): void {
    $line = date('c') . ' ' . get_class($e) . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() . PHP_EOL;
    @file_put_contents(GD_APP . '/storage/error.log', $line, FILE_APPEND | LOCK_EX);
    error_log($line);
    if (!headers_sent()) http_response_code(500);
    $wantsJson = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest' || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
    if ($wantsJson) {
        if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Something went wrong on the server. Please try again; if it keeps happening, tell the developer (details are in app/storage/error.log).']);
    } else {
        echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gifting Destiny</title>'
            . '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:15vh auto;padding:0 20px;text-align:center">'
            . '<h1 style="font-size:22px">Sorry, something went wrong</h1><p>Please refresh the page in a moment. You can also reach us on '
            . '<a href="https://wa.me/918660940018">WhatsApp</a>.</p></div>';
    }
});
mb_internal_encoding('UTF-8');

require GD_APP . '/lib/helpers.php';
require GD_APP . '/lib/icons.php';
require GD_APP . '/lib/db.php';
require GD_APP . '/lib/catalog.php';
require GD_APP . '/lib/html.php';
require GD_APP . '/lib/blog.php';
require GD_APP . '/lib/uploads.php';
require GD_APP . '/lib/auth.php';
require GD_APP . '/lib/enquiries.php';
