<?php
declare(strict_types=1);

// PHP entry point for the compiled Gifting Destiny frontend.
// Keep index.html, assets/, and the public media files beside this file.
$htmlFile = __DIR__ . DIRECTORY_SEPARATOR . 'index.html';

if (!is_file($htmlFile)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Gifting Destiny site files are incomplete: index.html is missing.';
    exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($htmlFile);
