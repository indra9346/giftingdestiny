<?php
declare(strict_types=1);

// PHP hosting entry point for the Gifting Destiny static frontend.
// Keep index.html, assets/, and the MP4 files beside this file.
$htmlFile = __DIR__ . '/index.html';

if (!is_file($htmlFile)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Gifting Destiny site files are incomplete: index.html is missing.';
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($htmlFile);
