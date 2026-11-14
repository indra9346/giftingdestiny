<?php
declare(strict_types=1);

// Admin panel: /admin (dashboard), /admin/blogs, /admin/enquiries, /admin/password.

header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store, private');
header("Content-Security-Policy: frame-ancestors 'none'");

$path = rtrim(gd_request_path(), '/') ?: '/admin';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$isAjax = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest';

function admin_page(string $view, array $vars = []): void
{
    echo view('admin/layout', $vars + ['content' => view('admin/' . $view, $vars)]);
    exit;
}

/** Reads and checks the blog form. Returns [data, errors]. */
function admin_blog_input(): array
{
    $str = fn(string $key, int $max) => mb_substr(trim((string)($_POST[$key] ?? '')), 0, $max);
    $data = [
        'name' => $str('name', 160),
        'title' => $str('title', 220),
        'category' => $str('category', 80),
        'content' => (string)($_POST['content'] ?? ''),
        'status' => ($_POST['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active',
        'slug' => $str('slug', 120),
        'thumbnail_alt' => $str('thumbnail_alt', 200),
    ];
    $errors = [];
    if ($data['name'] === '') $errors[] = 'Please enter the Blog Name.';
    if ($data['title'] === '') $data['title'] = $data['name'];
    $plain = trim(html_entity_decode(strip_tags($data['content']), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if ($plain === '' && !preg_match('/<(img|iframe)\b/i', $data['content'])) $errors[] = 'Please write the Blog Description.';
    if (strlen($data['content']) > 2000000) $errors[] = 'The Blog Description is too long. Please remove some pictures pasted into the text.';
    $when = trim((string)($_POST['published_at'] ?? ''));
    $ts = $when !== '' ? strtotime($when) : time();
    if ($ts === false) $errors[] = 'Please choose a valid Blog Date.';
    $data['published_at'] = date('Y-m-d\TH:i:s', $ts ?: time());
    return [$data, $errors];
}

// ---- Sign in / out -----------------------------------------------------------------------------
if ($path === '/admin/login') {
    if (admin_user()) redirect('/admin');
    $error = null;
    $username = '';
    if ($method === 'POST') {
        csrf_check();
        $username = (string)($_POST['username'] ?? '');
        $error = admin_attempt_login($username, (string)($_POST['password'] ?? ''));
        if ($error === null) {
            $next = (string)($_POST['next'] ?? '');
            redirect(preg_match('~^/admin(/[a-z0-9/_-]*)?$~', $next) ? $next : '/admin');
        }
    }
    echo view('admin/login', ['error' => $error, 'username' => $username]);
    exit;
}

if ($path === '/admin/logout') {
    if ($method === 'POST') {
        csrf_check();
        admin_logout();
    }
    redirect('/admin/login');
}

$user = require_admin();

// ---- Dashboard ---------------------------------------------------------------------------------
if ($path === '/admin') {
    $recent = db()->query('SELECT id, name, title, slug, status, published_at FROM blogs ORDER BY published_at DESC, id DESC LIMIT 5')->fetchAll();
    $latestEnquiries = db()->query('SELECT * FROM enquiries ORDER BY created_at DESC, id DESC LIMIT 5')->fetchAll();
    admin_page('dashboard', ['user' => $user, 'active' => 'dashboard', 'pageTitle' => 'Dashboard',
        'counts' => gd_blog_counts(), 'newEnquiries' => gd_enquiry_new_count(),
        'totalEnquiries' => (int)db()->query('SELECT COUNT(*) FROM enquiries')->fetchColumn(),
        'recent' => $recent, 'latestEnquiries' => $latestEnquiries]);
}

// ---- Blogs -------------------------------------------------------------------------------------
if ($path === '/admin/blogs' && $method === 'GET') {
    $blogs = db()->query('SELECT id, name, title, slug, category, status, published_at, updated_at, thumbnail, thumbnail_card,
        meta_title, meta_description, meta_keywords FROM blogs ORDER BY published_at DESC, id DESC')->fetchAll();
    admin_page('blogs', ['user' => $user, 'active' => 'blogs', 'pageTitle' => 'Blog Management', 'blogs' => $blogs,
        'categories' => gd_blog_category_suggestions()]);
}

if (preg_match('~^/admin/blogs/(\d+)$~', $path, $m) && $method === 'GET') {
    $blog = gd_blog_find((int)$m[1]);
    if (!$blog) json_out(['ok' => false, 'error' => 'This blog no longer exists.'], 404);
    $blog['published_local'] = substr($blog['published_at'], 0, 16);
    $blog['thumbnail_url'] = $blog['thumbnail'] !== '' ? gd_media_url($blog['thumbnail_card'] ?: $blog['thumbnail']) : '';
    json_out(['ok' => true, 'blog' => $blog]);
}

if ($path === '/admin/blogs/save' && $method === 'POST') {
    csrf_check();
    $id = (int)($_POST['id'] ?? 0);
    $existing = $id ? gd_blog_find($id) : null;
    if ($id && !$existing) json_out(['ok' => false, 'error' => 'This blog no longer exists. Please reload the page.'], 404);
    [$data, $errors] = admin_blog_input();
    $hasUpload = isset($_FILES['thumbnail']) && ($_FILES['thumbnail']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
    if (!$existing && !$hasUpload) $errors[] = 'Please choose a Blog Thumbnail picture (JPG, JPEG, PNG or WEBP).';
    if ($errors) json_out(['ok' => false, 'error' => implode(' ', $errors)], 422);

    $old = null;
    if ($hasUpload) {
        try {
            $stored = gd_store_upload($_FILES['thumbnail']);
        } catch (RuntimeException $ex) {
            json_out(['ok' => false, 'error' => $ex->getMessage()], 422);
        }
        $data['thumbnail'] = $stored['main'];
        $data['thumbnail_card'] = $stored['card'];
        $data['thumbnail_srcset'] = $stored['srcset'];
        if ($existing) $old = $existing;
    } elseif (!empty($_POST['remove_thumbnail']) && $existing) {
        $data['thumbnail'] = $data['thumbnail_card'] = $data['thumbnail_srcset'] = '';
        $old = $existing;
    }
    if ($data['thumbnail_alt'] === '' && $hasUpload) $data['thumbnail_alt'] = $data['title'];

    $savedId = gd_blog_save($data, $id);
    if ($old) {
        foreach (['thumbnail', 'thumbnail_card'] as $key) {
            if ($old[$key] !== '' && $old[$key] !== ($data[$key] ?? '')) gd_upload_delete($old[$key]);
        }
    }
    $saved = gd_blog_find($savedId);
    flash('success', $existing ? 'Blog "' . $saved['name'] . '" updated.' : 'Blog "' . $saved['name'] . '" added.');
    json_out(['ok' => true, 'id' => $savedId, 'slug' => $saved['slug'], 'url' => url('/blog/' . $saved['slug'])]);
}

if (preg_match('~^/admin/blogs/(\d+)/(delete|status|seo)$~', $path, $m) && $method === 'POST') {
    csrf_check();
    $id = (int)$m[1];
    $blog = gd_blog_find($id);
    if (!$blog) {
        flash('error', 'That blog no longer exists.');
        redirect('/admin/blogs');
    }
    if ($m[2] === 'delete') {
        gd_blog_delete($id);
        flash('success', 'Blog "' . $blog['name'] . '" deleted.');
    } elseif ($m[2] === 'status') {
        $next = $blog['status'] === 'active' ? 'inactive' : 'active';
        db()->prepare('UPDATE blogs SET status = ?, updated_at = ? WHERE id = ?')->execute([$next, now_iso(), $id]);
        flash('success', 'Blog "' . $blog['name'] . '" is now ' . ($next === 'active' ? 'Active (shown on the website).' : 'Inactive (hidden from the website).'));
    } else {
        $slugWanted = trim((string)($_POST['slug'] ?? ''));
        $slug = $slugWanted === '' || slugify($slugWanted) === $blog['slug'] ? $blog['slug'] : gd_blog_unique_slug($slugWanted, $id);
        db()->prepare('UPDATE blogs SET meta_title = ?, meta_description = ?, meta_keywords = ?, slug = ?, updated_at = ? WHERE id = ?')
            ->execute([
                mb_substr(trim((string)($_POST['meta_title'] ?? '')), 0, 200),
                mb_substr(trim((string)($_POST['meta_description'] ?? '')), 0, 400),
                mb_substr(trim((string)($_POST['meta_keywords'] ?? '')), 0, 300),
                $slug, now_iso(), $id,
            ]);
        flash('success', 'SEO details saved for "' . $blog['name'] . '".' . ($slug !== $blog['slug'] ? ' New web address: /blog/' . $slug : ''));
    }
    redirect('/admin/blogs');
}

// Pictures added inside the Blog Description editor.
if ($path === '/admin/upload-image' && $method === 'POST') {
    csrf_check();
    if (!isset($_FILES['image'])) json_out(['ok' => false, 'error' => 'No picture was received.'], 422);
    try {
        $stored = gd_store_upload($_FILES['image'], 1400, 0);
    } catch (RuntimeException $ex) {
        json_out(['ok' => false, 'error' => $ex->getMessage()], 422);
    }
    json_out(['ok' => true, 'url' => url($stored['main'])]);
}

// ---- Enquiries ---------------------------------------------------------------------------------
if ($path === '/admin/enquiries' && $method === 'GET') {
    $rows = db()->query('SELECT * FROM enquiries ORDER BY created_at DESC, id DESC')->fetchAll();
    admin_page('enquiries', ['user' => $user, 'active' => 'enquiries', 'pageTitle' => 'Enquiries', 'rows' => $rows]);
}

if (preg_match('~^/admin/enquiries/(\d+)/(read|unread|delete)$~', $path, $m) && $method === 'POST') {
    csrf_check();
    if ($m[2] === 'delete') {
        db()->prepare('DELETE FROM enquiries WHERE id = ?')->execute([(int)$m[1]]);
        flash('success', 'Enquiry deleted.');
    } else {
        db()->prepare('UPDATE enquiries SET status = ? WHERE id = ?')->execute([$m[2] === 'read' ? 'read' : 'new', (int)$m[1]]);
        if ($isAjax) json_out(['ok' => true]);
    }
    redirect('/admin/enquiries');
}

// ---- Password ----------------------------------------------------------------------------------
if ($path === '/admin/password') {
    $error = null;
    if ($method === 'POST') {
        csrf_check();
        $error = admin_change_password((int)$user['id'], (string)($_POST['current'] ?? ''), (string)($_POST['new'] ?? ''), (string)($_POST['confirm'] ?? ''));
        if ($error === null) {
            flash('success', 'Your password has been changed.');
            redirect('/admin');
        }
    }
    admin_page('password', ['user' => $user, 'active' => 'password', 'pageTitle' => 'Change Password', 'error' => $error]);
}

http_response_code(404);
admin_page('notfound', ['user' => $user, 'active' => '', 'pageTitle' => 'Not found']);
