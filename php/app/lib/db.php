<?php
declare(strict_types=1);

// One SQLite file (app/storage/gd.sqlite) holds blogs, enquiries and the admin login.
// It is created on first use, so uploading a new version of the site never replaces it.

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $dir = GD_APP . '/storage';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $file = $dir . '/gd.sqlite';
    $pdo = new PDO('sqlite:' . $file, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('PRAGMA foreign_keys = ON');
    db_migrate($pdo);
    return $pdo;
}

function db_migrate(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT ''
    )");
    $version = (int)($pdo->query("SELECT value FROM settings WHERE key = 'schema_version'")->fetchColumn() ?: 0);
    if ($version >= 1) {
        db_seed($pdo);
        return;
    }

    $pdo->beginTransaction();
    $pdo->exec("CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        excerpt TEXT NOT NULL DEFAULT '',
        read_minutes INTEGER NOT NULL DEFAULT 2,
        thumbnail TEXT NOT NULL DEFAULT '',
        thumbnail_card TEXT NOT NULL DEFAULT '',
        thumbnail_srcset TEXT NOT NULL DEFAULT '',
        thumbnail_alt TEXT NOT NULL DEFAULT '',
        meta_title TEXT NOT NULL DEFAULT '',
        meta_description TEXT NOT NULL DEFAULT '',
        meta_keywords TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        published_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        wp_id INTEGER
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS blogs_published ON blogs (status, published_at)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_login_at TEXT
    )");
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        username TEXT NOT NULL DEFAULT '',
        success INTEGER NOT NULL DEFAULT 0,
        attempted_at TEXT NOT NULL
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS login_attempts_ip ON login_attempts (ip, attempted_at)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'enquiry',
        name TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        quantity TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        items TEXT NOT NULL DEFAULT '',
        page_url TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL
    )");
    $pdo->exec("CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries (created_at)");
    $pdo->exec("INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '1')");
    $pdo->commit();
    db_seed($pdo);
}

/** First run only: the imported blog posts and the first admin login. */
function db_seed(PDO $pdo): void
{
    $seeded = $pdo->query("SELECT value FROM settings WHERE key = 'blogs_seeded'")->fetchColumn();
    if (!$seeded) {
        $file = GD_APP . '/data/seed-blogs.json';
        $count = (int)$pdo->query('SELECT COUNT(*) FROM blogs')->fetchColumn();
        if ($count === 0 && is_file($file)) {
            $posts = json_decode((string)file_get_contents($file), true) ?: [];
            $insert = $pdo->prepare('INSERT OR IGNORE INTO blogs (name, slug, title, category, content, excerpt, read_minutes,
                thumbnail, thumbnail_card, thumbnail_srcset, thumbnail_alt, meta_title, meta_description, meta_keywords,
                status, published_at, created_at, updated_at, wp_id)
                VALUES (:name, :slug, :title, :category, :content, :excerpt, :read_minutes, :thumbnail, :thumbnail_card,
                :thumbnail_srcset, :thumbnail_alt, :meta_title, :meta_description, :meta_keywords, :status, :published_at,
                :created_at, :updated_at, :wp_id)');
            $pdo->beginTransaction();
            foreach ($posts as $post) {
                $insert->execute([
                    ':name' => $post['name'], ':slug' => $post['slug'], ':title' => $post['title'],
                    ':category' => $post['category'] ?? '', ':content' => $post['content'] ?? '',
                    ':excerpt' => $post['excerpt'] ?? '', ':read_minutes' => (int)($post['read_minutes'] ?? 2),
                    ':thumbnail' => $post['thumbnail'] ?? '', ':thumbnail_card' => $post['thumbnail_card'] ?? '',
                    ':thumbnail_srcset' => $post['thumbnail_srcset'] ?? '', ':thumbnail_alt' => $post['thumbnail_alt'] ?? '',
                    ':meta_title' => $post['meta_title'] ?? '', ':meta_description' => $post['meta_description'] ?? '',
                    ':meta_keywords' => $post['meta_keywords'] ?? '', ':status' => $post['status'] ?? 'active',
                    ':published_at' => $post['published_at'], ':created_at' => $post['created_at'] ?? now_iso(),
                    ':updated_at' => $post['updated_at'] ?? now_iso(), ':wp_id' => $post['wp_id'] ?? null,
                ]);
            }
            $pdo->commit();
        }
        $pdo->exec("INSERT OR REPLACE INTO settings (key, value) VALUES ('blogs_seeded', '1')");
    }

    if (GD_ADMIN_INITIAL_USER !== '' && GD_ADMIN_INITIAL_HASH !== ''
        && (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() === 0) {
        $stmt = $pdo->prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)');
        $stmt->execute([GD_ADMIN_INITIAL_USER, GD_ADMIN_INITIAL_HASH, now_iso()]);
    }
}
