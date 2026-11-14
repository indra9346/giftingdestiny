<?php
declare(strict_types=1);

// Blog posts: stored in SQLite, written in the admin panel (/admin/blogs).

function gd_blog_topics(): array
{
    return [
        ['id' => 'all', 'label' => 'All stories', 'test' => null],
        ['id' => 'corporate', 'label' => 'Corporate gifting', 'test' => '/corporate|employee|client|brand|team|business|nexedge/i'],
        ['id' => 'personal', 'label' => 'Personalised gifts', 'test' => '/personali[sz]ed|custom|led light|keepsake|thoughtful/i'],
        ['id' => 'festive', 'label' => 'Festive & occasions', 'test' => '/diwali|festive|anniversary|occasion|wedding|birthday|couple/i'],
        ['id' => 'guides', 'label' => 'Guides & ideas', 'test' => '/guide|ideas|top \d+|\b\d+ |how to|tips|picks/i'],
    ];
}

/** Category suggestions in the admin form (the site's topic names). */
function gd_blog_category_suggestions(): array
{
    $list = ['Corporate gifting', 'Personalised gifts', 'Festive & occasions', 'Guides & ideas', 'Gifting tips'];
    foreach (db()->query("SELECT DISTINCT category FROM blogs WHERE category <> '' ORDER BY category")->fetchAll(PDO::FETCH_COLUMN) as $c) {
        if (!in_array($c, $list, true)) $list[] = $c;
    }
    return $list;
}

function gd_blog_topics_for(string $title, string $category = ''): array
{
    $ids = [];
    foreach (gd_blog_topics() as $topic) {
        if ($topic['test'] && preg_match($topic['test'], $title . ' ' . $category)) $ids[] = $topic['id'];
    }
    return $ids;
}

/** Adds what the pages need: topics, badge, image set. */
function gd_blog_decorate(array $row): array
{
    $row['topics'] = gd_blog_topics_for($row['title'], $row['category']);
    if ($row['category'] !== '') {
        $row['badge'] = $row['category'];
    } else {
        $row['badge'] = 'Gifting tips';
        foreach (['festive', 'corporate', 'personal', 'guides'] as $id) {
            if (in_array($id, $row['topics'], true)) {
                foreach (gd_blog_topics() as $t) if ($t['id'] === $id) $row['badge'] = $t['label'];
                break;
            }
        }
    }
    $row['image'] = null;
    if ($row['thumbnail'] !== '') {
        $row['image'] = [
            'src' => gd_media_url($row['thumbnail']),
            'card' => gd_media_url($row['thumbnail_card'] !== '' ? $row['thumbnail_card'] : $row['thumbnail']),
            'srcset' => gd_media_srcset($row['thumbnail_srcset']),
            'alt' => $row['thumbnail_alt'],
        ];
    }
    $row['date'] = $row['published_at'];
    $row['readMinutes'] = max(2, (int)$row['read_minutes']);
    return $row;
}

/** Stored paths are site paths ('/gd-uploads/...') or full addresses. */
function gd_media_url(string $path): string
{
    return preg_match('~^https?://~i', $path) ? $path : url($path);
}

function gd_media_srcset(string $srcset): string
{
    if ($srcset === '') return '';
    $parts = [];
    foreach (explode(',', $srcset) as $item) {
        $bits = preg_split('/\s+/', trim($item));
        if (!$bits || $bits[0] === '') continue;
        $parts[] = gd_media_url($bits[0]) . (isset($bits[1]) ? ' ' . $bits[1] : '');
    }
    return implode(', ', $parts);
}

/** Published posts, newest first. */
function gd_blog_published(): array
{
    $stmt = db()->prepare("SELECT * FROM blogs WHERE status = 'active' AND published_at <= ? ORDER BY published_at DESC, id DESC");
    $stmt->execute([now_iso()]);
    return array_map('gd_blog_decorate', $stmt->fetchAll());
}

function gd_blog_by_slug(string $slug, bool $includeHidden = false): ?array
{
    $stmt = db()->prepare('SELECT * FROM blogs WHERE slug = ?');
    $stmt->execute([$slug]);
    $row = $stmt->fetch();
    if (!$row) return null;
    if (!$includeHidden && ($row['status'] !== 'active' || $row['published_at'] > now_iso())) return null;
    return gd_blog_decorate($row);
}

function gd_blog_find(int $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function gd_blog_related(array $post, array $all, int $count = 3): array
{
    $others = array_values(array_filter($all, fn($p) => $p['slug'] !== $post['slug']));
    $shared = array_values(array_filter($others, fn($p) => (bool)array_intersect($p['topics'], $post['topics'])));
    $rest = array_values(array_filter($others, fn($p) => !in_array($p, $shared, true)));
    return array_slice(array_merge($shared, $rest), 0, $count);
}

function gd_blog_unique_slug(string $wanted, int $ignoreId = 0): string
{
    $base = slugify($wanted);
    $slug = $base;
    $n = 2;
    $stmt = db()->prepare('SELECT COUNT(*) FROM blogs WHERE slug = ? AND id <> ?');
    while (true) {
        $stmt->execute([$slug, $ignoreId]);
        if ((int)$stmt->fetchColumn() === 0) return $slug;
        $slug = $base . '-' . $n++;
    }
}

/**
 * Saves a post from the admin form. $data keys: name, title, category, content, published_at, status,
 * slug (optional), thumbnail fields (optional). Returns the saved id.
 */
function gd_blog_save(array $data, int $id = 0): int
{
    $clean = gd_sanitize_blog_html((string)($data['content'] ?? ''), (string)$data['title'], 'admin');
    $now = now_iso();
    $existing = $id ? gd_blog_find($id) : null;
    $slugSource = trim((string)($data['slug'] ?? '')) !== '' ? $data['slug'] : $data['name'];
    $slug = ($existing && trim((string)($data['slug'] ?? '')) === '') ? $existing['slug'] : gd_blog_unique_slug($slugSource, $id);

    $fields = [
        'name' => $data['name'],
        'slug' => $slug,
        'title' => $data['title'],
        'category' => $data['category'] ?? '',
        'content' => $clean['html'],
        'excerpt' => gd_make_excerpt($clean['html'], (string)$data['title']),
        'read_minutes' => max(2, (int)round($clean['words'] / 210)),
        'status' => ($data['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active',
        'published_at' => $data['published_at'] ?? $now,
        'updated_at' => $now,
    ];
    foreach (['thumbnail', 'thumbnail_card', 'thumbnail_srcset', 'thumbnail_alt', 'meta_title', 'meta_description', 'meta_keywords'] as $key) {
        if (array_key_exists($key, $data)) $fields[$key] = (string)$data[$key];
    }

    if ($existing) {
        $sets = implode(', ', array_map(fn($k) => "$k = :$k", array_keys($fields)));
        $stmt = db()->prepare("UPDATE blogs SET $sets WHERE id = :id");
        $stmt->execute(array_combine(array_map(fn($k) => ":$k", array_keys($fields)), array_values($fields)) + [':id' => $id]);
        return $id;
    }
    $fields['created_at'] = $now;
    $cols = implode(', ', array_keys($fields));
    $marks = implode(', ', array_map(fn($k) => ":$k", array_keys($fields)));
    $stmt = db()->prepare("INSERT INTO blogs ($cols) VALUES ($marks)");
    $stmt->execute(array_combine(array_map(fn($k) => ":$k", array_keys($fields)), array_values($fields)));
    return (int)db()->lastInsertId();
}

function gd_blog_delete(int $id): void
{
    $row = gd_blog_find($id);
    if (!$row) return;
    db()->prepare('DELETE FROM blogs WHERE id = ?')->execute([$id]);
    foreach (['thumbnail', 'thumbnail_card'] as $key) gd_upload_delete($row[$key]);
}

function gd_blog_counts(): array
{
    $row = db()->query("SELECT COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status <> 'active' THEN 1 ELSE 0 END) AS inactive FROM blogs")->fetch();
    return ['total' => (int)$row['total'], 'active' => (int)$row['active'], 'inactive' => (int)$row['inactive']];
}
