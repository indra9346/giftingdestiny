<?php
declare(strict_types=1);

/** Escapes text for HTML (body text and attribute values). */
function e($value): string
{
    return htmlspecialchars((string)($value ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** The folder the site runs from ('' at the domain root, '/store' in a sub-folder). */
function gd_base(): string
{
    static $base = null;
    if ($base === null) {
        $dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
        $base = ($dir === '/' || $dir === '.') ? '' : rtrim($dir, '/');
    }
    return $base;
}

/** A site address, e.g. url('/shop') or url('/product/' . $slug). */
function url(string $path = '/'): string
{
    if (preg_match('~^(https?:)?//|^(mailto|tel):~i', $path)) return $path;
    return gd_base() . '/' . ltrim($path, '/');
}

/** A versioned address for this site's own CSS/JS so new uploads are never stale. */
function asset(string $path): string
{
    $full = GD_ROOT . '/' . ltrim($path, '/');
    $version = is_file($full) ? (string)filemtime($full) : GD_ASSET_VERSION;
    return url($path) . '?v=' . $version;
}

/** Full address with scheme and host, for share links and meta tags. */
function absolute_url(string $path = '/'): string
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
    $host = $_SERVER['HTTP_HOST'] ?? 'giftingdestiny.com';
    $host = preg_replace('/[^A-Za-z0-9.\-:\[\]]/', '', $host);
    return ($https ? 'https' : 'http') . '://' . $host . url($path);
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

/** The request path without the site folder, always starting with '/'. */
function gd_request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = rawurldecode($path);
    $base = gd_base();
    if ($base !== '' && strncmp($path, $base, strlen($base)) === 0) $path = substr($path, strlen($base));
    if ($path === '' || $path === false) $path = '/';
    // /gd-index.php and /gd-index.php/blog also work (handy before the .htaccess rules are in place).
    if ($path === '/gd-index.php') $path = '/';
    elseif (str_starts_with($path, '/gd-index.php/')) $path = substr($path, strlen('/gd-index.php'));
    return '/' . ltrim($path, '/');
}

function wa_link(string $text, string $phone = GD_PHONE): string
{
    return 'https://wa.me/' . $phone . '?text=' . rawurlencode($text);
}

/** Renders a view file with variables and returns the HTML. */
function view(string $name, array $vars = []): string
{
    extract($vars, EXTR_SKIP);
    ob_start();
    require GD_APP . '/views/' . $name . '.php';
    return (string)ob_get_clean();
}

function redirect(string $path, int $status = 302): void
{
    header('Location: ' . (preg_match('~^https?://~', $path) ? $path : url($path)), true, $status);
    exit;
}

function json_out($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function request_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return substr(preg_replace('/[^0-9a-fA-F:.]/', '', $ip), 0, 45);
}

/** Date like the old site's en-IN format: "14 Nov 2026" (September is "Sept"). */
function gd_date(string $iso): string
{
    $ts = strtotime($iso);
    if (!$ts) return '';
    $month = date('n', $ts) === '9' ? 'Sept' : date('M', $ts);
    return date('j', $ts) . ' ' . $month . ' ' . date('Y', $ts);
}

function now_iso(): string
{
    return date('Y-m-d\TH:i:s');
}

/** Shortens text to $max characters on a word boundary. */
function str_trim_words(string $text, int $max): string
{
    if (mb_strlen($text) <= $max) return $text;
    $cut = mb_substr($text, 0, $max);
    $cut = preg_replace('/\s+\S*$/u', '', $cut);
    return rtrim($cut) . '…';
}

function slugify(string $text): string
{
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text);
    $text = str_replace(['&', '₹'], [' and ', ' rs '], $text);
    $text = preg_replace('/[^a-z0-9]+/u', '-', $text);
    $text = trim((string)$text, '-');
    return substr($text, 0, 90) ?: 'blog-' . date('YmdHis');
}

/** Sends the not-found status and the site's 404 page. */
function not_found(): void
{
    http_response_code(404);
    echo view('layout', [
        'page' => 'notfound',
        'title' => 'Page not found | ' . GD_SITE_NAME,
        'content' => view('pages/notfound'),
    ]);
    exit;
}
