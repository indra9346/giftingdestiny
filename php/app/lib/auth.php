<?php
declare(strict_types=1);

// Admin sign-in: hashed passwords, a session cookie only for /admin, CSRF tokens on every form,
// and a lock after repeated wrong passwords from the same address.

const GD_LOGIN_MAX_FAILS = 5;          // wrong passwords allowed ...
const GD_LOGIN_WINDOW_MIN = 15;        // ... per this many minutes, per address
const GD_SESSION_IDLE_MIN = 120;       // signed out after 2 hours without activity

function admin_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('GDADMIN');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => (gd_base() ?: '') . '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
}

function admin_user(): ?array
{
    admin_session_start();
    $id = (int)($_SESSION['admin_id'] ?? 0);
    if (!$id) return null;
    if (time() - (int)($_SESSION['admin_seen'] ?? 0) > GD_SESSION_IDLE_MIN * 60) {
        admin_logout();
        return null;
    }
    $stmt = db()->prepare('SELECT id, username, last_login_at FROM admins WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user) {
        admin_logout();
        return null;
    }
    $_SESSION['admin_seen'] = time();
    return $user;
}

function require_admin(): array
{
    $user = admin_user();
    if (!$user) {
        if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest' || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
            json_out(['ok' => false, 'error' => 'Your session ended. Please sign in again.'], 401);
        }
        redirect('/admin/login');
    }
    return $user;
}

function csrf_token(): string
{
    admin_session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    admin_session_start();
    $sent = $_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!is_string($sent) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest') json_out(['ok' => false, 'error' => 'This page expired. Please reload it and try again.'], 419);
        http_response_code(419);
        exit('This page expired. Please go back, reload the page and try again.');
    }
}

function login_locked(string $ip): bool
{
    $since = date('Y-m-d\TH:i:s', time() - GD_LOGIN_WINDOW_MIN * 60);
    $stmt = db()->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND success = 0 AND attempted_at >= ?');
    $stmt->execute([$ip, $since]);
    return (int)$stmt->fetchColumn() >= GD_LOGIN_MAX_FAILS;
}

/** Returns null on success or a message for the login form. */
function admin_attempt_login(string $username, string $password): ?string
{
    $ip = request_ip();
    if (login_locked($ip)) return 'Too many wrong attempts. Please wait ' . GD_LOGIN_WINDOW_MIN . ' minutes and try again.';
    $stmt = db()->prepare('SELECT * FROM admins WHERE username = ?');
    $stmt->execute([trim($username)]);
    $user = $stmt->fetch();
    // Same work whether or not the user exists, so timing does not reveal usernames.
    $hash = $user['password_hash'] ?? '$2y$10$aP1Isn9IQbMniO0/VIBYC.vFVVZOIGE2F1W9z1lVsRdjyAjsN7eqm';
    $ok = password_verify($password, $hash) && $user;
    db()->prepare('INSERT INTO login_attempts (ip, username, success, attempted_at) VALUES (?, ?, ?, ?)')
        ->execute([$ip, mb_substr(trim($username), 0, 60), $ok ? 1 : 0, now_iso()]);
    db()->prepare('DELETE FROM login_attempts WHERE attempted_at < ?')->execute([date('Y-m-d\TH:i:s', time() - 30 * 86400)]);
    if (!$ok) return 'Wrong username or password.';

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }
    admin_session_start();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$user['id'];
    $_SESSION['admin_seen'] = time();
    $_SESSION['previous_login'] = $user['last_login_at'];
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    db()->prepare('UPDATE admins SET last_login_at = ? WHERE id = ?')->execute([now_iso(), $user['id']]);
    return null;
}

function admin_logout(): void
{
    admin_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 42000, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
    }
    session_destroy();
}

/** Returns null on success or a message. */
function admin_change_password(int $id, string $current, string $new, string $confirm): ?string
{
    $stmt = db()->prepare('SELECT password_hash FROM admins WHERE id = ?');
    $stmt->execute([$id]);
    $hash = (string)$stmt->fetchColumn();
    if (!password_verify($current, $hash)) return 'Your current password is not correct.';
    if (mb_strlen($new) < 10) return 'The new password needs at least 10 characters.';
    if ($new !== $confirm) return 'The two new passwords do not match.';
    if ($new === $current) return 'Please choose a password different from the current one.';
    db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $id]);
    return null;
}

function flash(string $type, string $message): void
{
    admin_session_start();
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function take_flashes(): array
{
    admin_session_start();
    $list = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $list;
}
