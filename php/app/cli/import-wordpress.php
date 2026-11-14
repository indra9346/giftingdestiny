<?php
declare(strict_types=1);

// One-time import of the WordPress blog posts into app/data/seed-blogs.json (+ cover pictures in
// gd-uploads/blogs/seed/). Run from a computer, never from the web:
//   php app/cli/import-wordpress.php https://giftingdestiny.webhostingbaba.com
// The site loads seed-blogs.json into its database the first time it runs.

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

define('GD_APP', dirname(__DIR__));
define('GD_ROOT', dirname(GD_APP));
require GD_APP . '/config.php';
date_default_timezone_set(GD_TIMEZONE);
require GD_APP . '/lib/helpers.php';
require GD_APP . '/lib/html.php';
require GD_APP . '/lib/blog.php';

$wp = rtrim($argv[1] ?? 'https://giftingdestiny.webhostingbaba.com', '/');

function http_get(string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 60,
        CURLOPT_USERAGENT => 'GiftingDestiny-Importer/1.0', CURLOPT_HEADER => true]);
    $raw = curl_exec($ch);
    if ($raw === false) throw new RuntimeException('Download failed: ' . $url . ' ' . curl_error($ch));
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $headers = [];
    foreach (explode("\r\n", substr($raw, 0, $headerSize)) as $line) {
        if (str_contains($line, ':')) {
            [$k, $v] = explode(':', $line, 2);
            $headers[strtolower(trim($k))] = trim($v);
        }
    }
    return ['status' => $status, 'headers' => $headers, 'body' => substr($raw, $headerSize)];
}

function same_image(string $a, string $b): bool
{
    $base = fn($u) => preg_replace('/\?.*$/', '', preg_replace('/-\d+x\d+(?=\.\w+$)/', '', basename(parse_url($u, PHP_URL_PATH) ?: '')));
    return $a !== '' && $b !== '' && $base($a) === $base($b);
}

$posts = [];
for ($page = 1; $page <= 5; $page++) {
    $url = $wp . '/wp-json/wp/v2/posts?per_page=100&page=' . $page . '&_embed=wp:featuredmedia'
        . '&_fields=id,slug,date,modified,title,excerpt,content,featured_media,_links.wp:featuredmedia,_embedded';
    $res = http_get($url);
    if ($res['status'] !== 200) throw new RuntimeException("WordPress answered {$res['status']} for page $page");
    $posts = array_merge($posts, json_decode($res['body'], true) ?: []);
    if ($page >= (int)($res['headers']['x-wp-totalpages'] ?? 1)) break;
}
fwrite(STDOUT, count($posts) . " posts from WordPress\n");

$seedDir = GD_ROOT . '/gd-uploads/blogs/seed';
if (!is_dir($seedDir)) mkdir($seedDir, 0755, true);
$out = [];

foreach ($posts as $post) {
    // WordPress keeps some slugs percent-encoded (e.g. the rupee sign); use a plain web-safe one here.
    $slug = preg_match('/^[a-z0-9-]+$/', $post['slug']) ? $post['slug'] : slugify(rawurldecode($post['slug']));
    $title = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($post['title']['rendered'] ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
    $clean = gd_sanitize_blog_html($post['content']['rendered'] ?? '', $title, 'import');
    $html = $clean['html'];

    $thumb = ['thumbnail' => '', 'thumbnail_card' => '', 'thumbnail_srcset' => '', 'thumbnail_alt' => ''];
    $media = $post['_embedded']['wp:featuredmedia'][0] ?? null;
    $coverSrc = '';
    if (!empty($media['source_url'])) {
        $sizes = $media['media_details']['sizes'] ?? [];
        $large = $sizes['large'] ?? ($sizes['full'] ?? ['source_url' => $media['source_url'], 'width' => $media['media_details']['width'] ?? 1200]);
        $card = $sizes['medium_large'] ?? $large;
        $coverSrc = $large['source_url'];
        $saved = [];
        foreach (['large' => $large, 'card' => $card] as $key => $size) {
            $ext = strtolower(pathinfo(parse_url($size['source_url'], PHP_URL_PATH), PATHINFO_EXTENSION)) ?: 'jpg';
            $file = $slug . '-' . $key . '.' . $ext;
            $res = http_get($size['source_url']);
            if ($res['status'] !== 200 || !@getimagesizefromstring($res['body'])) throw new RuntimeException('Cover download failed: ' . $size['source_url']);
            file_put_contents("$seedDir/$file", $res['body']);
            $saved[$key] = ['path' => '/gd-uploads/blogs/seed/' . $file, 'width' => (int)($size['width'] ?? 0)];
        }
        $thumb['thumbnail'] = $saved['large']['path'];
        $thumb['thumbnail_card'] = $saved['card']['path'];
        if ($saved['card']['path'] !== $saved['large']['path'] && $saved['card']['width'] && $saved['large']['width'] && $saved['card']['width'] !== $saved['large']['width']) {
            $thumb['thumbnail_srcset'] = $saved['card']['path'] . ' ' . $saved['card']['width'] . 'w, ' . $saved['large']['path'] . ' ' . $saved['large']['width'] . 'w';
        }
        $thumb['thumbnail_alt'] = $media['alt_text'] ?? '';
    } elseif ($clean['first_image']) {
        $coverSrc = $clean['first_image']['src'];
        $thumb['thumbnail'] = $thumb['thumbnail_card'] = $coverSrc;
        $thumb['thumbnail_srcset'] = $clean['first_image']['srcset'];
        $thumb['thumbnail_alt'] = $clean['first_image']['alt'];
    }
    // Elementor posts open with the cover image again; drop that copy from the body (as the old site did).
    if ($coverSrc !== '' && !empty($clean['first_image']['leading']) && same_image($coverSrc, $clean['first_image']['src'])) {
        $html = trim((string)$clean['without_leading']);
    }

    $topics = gd_blog_topics_for($title);
    $category = '';
    foreach (['festive', 'corporate', 'personal', 'guides'] as $id) {
        if (in_array($id, $topics, true)) {
            foreach (gd_blog_topics() as $t) if ($t['id'] === $id) $category = $t['label'];
            break;
        }
    }

    $out[] = [
        'wp_id' => $post['id'],
        'name' => $title,
        'slug' => $slug,
        'title' => $title,
        'category' => $category,
        'content' => $html,
        'excerpt' => gd_make_excerpt($post['excerpt']['rendered'] ?? '', $title),
        'read_minutes' => max(2, (int)round($clean['words'] / 210)),
        'status' => 'active',
        'published_at' => substr($post['date'], 0, 19),
        'created_at' => substr($post['date'], 0, 19),
        'updated_at' => substr($post['modified'] ?? $post['date'], 0, 19),
    ] + $thumb;
    fwrite(STDOUT, "  {$post['slug']}  ({$category})\n");
}

file_put_contents(GD_APP . '/data/seed-blogs.json', json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
fwrite(STDOUT, 'Wrote ' . count($out) . " posts to app/data/seed-blogs.json\n");
