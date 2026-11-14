<?php
declare(strict_types=1);

$path = gd_request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
// Pages are always checked with the server, so a blog saved in the admin shows at once (no stale CDN copy).
header('Cache-Control: no-cache, must-revalidate');

// Admin panel.
if ($path === '/admin' || str_starts_with($path, '/admin/')) {
    require GD_APP . '/admin_routes.php';
    exit;
}

// Small JSON endpoints used by the site's script.
if ($path === '/api/catalog') {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    echo json_encode(gd_catalog_for_browser(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
if ($path === '/api/enquiry') {
    if ($method !== 'POST') json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
    $input = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')
        ? (json_decode((string)file_get_contents('php://input'), true) ?: [])
        : $_POST;
    $result = gd_enquiry_save($input);
    json_out($result, $result['ok'] ? 200 : 422);
}

// Old addresses (WordPress/WooCommerce and the previous site) go to their new pages.
$moved = ['/index.html' => '/', '/about-us' => '/about', '/faqs' => '/faq', '/shop-2' => '/shop', '/blog-grid' => '/blog',
    '/blogs' => '/blog', '/home' => '/'];
$trimmed = rtrim($path, '/') ?: '/';
if (isset($moved[$trimmed])) redirect($moved[$trimmed] . (empty($_SERVER['QUERY_STRING']) ? '' : '?' . $_SERVER['QUERY_STRING']), 301);
if (preg_match('~^/product-category/([^/]+)/?$~', $path, $m)) redirect('/shop?category=' . rawurlencode($m[1]), 301);
if ($path !== '/' && str_ends_with($path, '/')) redirect(rtrim($path, '/') . (empty($_SERVER['QUERY_STRING']) ? '' : '?' . $_SERVER['QUERY_STRING']), 301);

if ($method !== 'GET' && $method !== 'HEAD') {
    http_response_code(405);
    exit;
}

$category = isset($_GET['category']) && is_string($_GET['category']) ? trim($_GET['category']) : 'all';
$query = isset($_GET['q']) && is_string($_GET['q']) ? trim($_GET['q']) : '';
$sort = isset($_GET['sort']) && in_array($_GET['sort'], ['featured', 'name-asc', 'name-desc'], true) ? $_GET['sort'] : 'featured';

switch (true) {
    case $path === '/':
        echo view('layout', [
            'page' => 'home',
            'content' => view('pages/home', ['category' => $category, 'sort' => $sort]),
        ]);
        break;

    case $path === '/shop':
        $cat = gd_category_by_slug_or_alias($category);
        $title = $query !== '' ? 'Search: ' . $query : ($cat ? $cat['name'] : 'All Products');
        echo view('layout', [
            'page' => 'shop',
            'category' => $category,
            'title' => $title . ' | ' . GD_SITE_NAME,
            'description' => $cat['description'] ?? null,
            'content' => view('pages/shop', ['category' => $category, 'query' => $query, 'sort' => $sort]),
        ]);
        break;

    case (bool)preg_match('~^/product/([^/]+)$~', $path, $m):
        $product = gd_find_product($m[1]);
        if (!$product) not_found();
        if ($product['slug'] !== $m[1]) redirect('/product/' . $product['slug'], 301);
        $plain = trim(preg_replace('/\s+/', ' ', strip_tags(gd_format_product_description($product['description'] ?? ''))));
        echo view('layout', [
            'page' => 'product',
            'title' => $product['name'] . ' | ' . GD_SITE_NAME,
            'description' => $plain !== '' ? str_trim_words($plain, 160) : null,
            'ogImage' => absolute_url($product['primaryImage']),
            'content' => view('pages/product', ['product' => $product]),
        ]);
        break;

    case in_array($path, ['/corporate', '/about', '/contact', '/faq'], true):
        $titles = ['/corporate' => 'Corporate Gifting Solutions', '/about' => 'The Gifting Destiny Story',
            '/contact' => 'Contact & Studio Inquiries', '/faq' => 'Frequently Asked Questions'];
        echo view('layout', [
            'page' => ltrim($path, '/'),
            'title' => $titles[$path] . ' | ' . GD_SITE_NAME,
            'content' => view('pages/' . ltrim($path, '/')),
        ]);
        break;

    case $path === '/blog':
        $posts = gd_blog_published();
        echo view('layout', [
            'page' => 'blog',
            'title' => 'Blog – Gifting Ideas & Guides | Gifting Destiny',
            'description' => 'Gift ideas, corporate gifting guides and personalisation tips from the Gifting Destiny studio in Bengaluru.',
            'content' => view('pages/blog', ['posts' => $posts]),
        ]);
        break;

    case (bool)preg_match('~^/blog/([^/]+)$~', $path, $m):
        $preview = isset($_GET['preview']) && admin_user() !== null;
        $post = gd_blog_by_slug($m[1], $preview);
        if (!$post && slugify($m[1]) !== $m[1] && gd_blog_by_slug(slugify($m[1]), $preview)) redirect('/blog/' . slugify($m[1]), 301);
        if (!$post) {
            http_response_code(404);
            echo view('layout', [
                'page' => 'blogPost',
                'title' => 'Blog | Gifting Destiny',
                'robots' => 'noindex',
                'content' => view('pages/blog-missing'),
            ]);
            break;
        }
        $all = gd_blog_published();
        echo view('layout', [
            'page' => 'blogPost',
            'title' => ($post['meta_title'] !== '' ? $post['meta_title'] : $post['title'] . ' | Gifting Destiny Blog'),
            'description' => $post['meta_description'] !== '' ? $post['meta_description'] : $post['excerpt'],
            'keywords' => $post['meta_keywords'],
            'ogImage' => $post['image'] ? (preg_match('~^https?://~', $post['image']['card']) ? $post['image']['card'] : absolute_url(substr($post['image']['card'], strlen(gd_base())))) : null,
            'ogType' => 'article',
            'robots' => $post['status'] !== 'active' ? 'noindex' : null,
            'content' => view('pages/blog-post', ['post' => $post, 'related' => gd_blog_related($post, $all, 3), 'preview' => $post['status'] !== 'active']),
        ]);
        break;

    default:
        not_found();
}
