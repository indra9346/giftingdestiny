<?php
// Shared pieces of the blog pages (old BlogPage.js helpers).

if (!function_exists('gdb_kinetic')) {
    /** Splits a heading into word spans for the kinetic entrance. */
    function gdb_kinetic(string $text, array $goldWords = []): string
    {
        $gold = array_map('mb_strtolower', $goldWords);
        $out = [];
        $i = 0;
        foreach (preg_split('/\s+/u', trim($text)) as $word) {
            if ($word === '') continue;
            $isGold = in_array(preg_replace('/[^a-z&]/', '', mb_strtolower($word)), $gold, true);
            $out[] = '<span class="gdb-word' . ($isGold ? ' gdb-word-gold' : '') . '" style="--i:' . $i++ . '"><span>' . e($word) . '</span></span>';
        }
        return implode(' ', $out);
    }

    function gdb_sparks(int $count): string
    {
        $html = '';
        for ($i = 0; $i < $count; $i++) {
            $left = ($i * 37 + 11) % 100;
            $top = ($i * 53 + 7) % 90;
            $s = 0.6 + ($i % 4) * 0.25;
            $html .= '<span class="gdb-spark" style="--x:' . $left . '%;--y:' . $top . '%;--s:' . $s . ';--t:' . (3 + ($i % 5)) . 's;--d:' . (($i % 7) * 0.45) . 's"></span>';
        }
        return $html;
    }

    function gdb_logo(): string
    {
        return url('/assets/gifting-destiny-original-logo.jpg');
    }

    function gdb_image(array $post, string $variant = 'card', bool $eager = false): string
    {
        if (!$post['image']) {
            return '<div class="gdb-img-fallback" role="img" aria-label="' . e($post['title']) . '"><img src="' . e(gdb_logo()) . '" alt="" width="88" height="88" /></div>';
        }
        $src = $variant === 'card' ? $post['image']['card'] : $post['image']['src'];
        $sizes = $variant === 'card' ? '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' : '(max-width: 1100px) 94vw, 1100px';
        return '<img class="gdb-img" src="' . e($src) . '"' . ($post['image']['srcset'] ? ' srcset="' . e($post['image']['srcset']) . '" sizes="' . $sizes . '"' : '')
            . "\n    alt=\"" . e($post['image']['alt'] ?: $post['title']) . '" ' . ($eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') . ' decoding="async" />';
    }

    function gdb_meta(array $post): string
    {
        return '<div class="gdb-meta"><time datetime="' . e($post['date']) . '">' . e(gd_date($post['date'])) . '</time><span class="gdb-dot"></span><span>' . (int)$post['readMinutes'] . ' min read</span></div>';
    }

    function gdb_post_url(array $post): string
    {
        return url('/blog/' . $post['slug']);
    }

    function gdb_card(array $post, int $index, bool $filterable = true): string
    {
        $attrs = $filterable ? ' data-gdb-item data-topics="' . e(implode(' ', $post['topics'])) . '" data-search="' . e(mb_strtolower($post['title'] . ' ' . $post['excerpt'])) . '"' : '';
        return '
    <article class="gdb-card" data-reveal data-reveal-key="card-' . e($post['slug']) . '" style="--d:' . (($index % 3) * 90) . 'ms"' . $attrs . '>
      <a class="gdb-card-link" href="' . e(gdb_post_url($post)) . '">
        <div class="gdb-card-media">
          ' . gdb_image($post) . '
          <span class="gdb-card-badge">' . e($post['badge']) . '</span>
          <span class="gdb-card-sheen" aria-hidden="true"></span>
        </div>
        <div class="gdb-card-body">
          ' . gdb_meta($post) . '
          <h3 class="gdb-card-title">' . e($post['title']) . '</h3>
          <p class="gdb-card-excerpt">' . e($post['excerpt']) . '</p>
          <span class="gdb-card-cta">Read article <span class="gdb-arrow" aria-hidden="true">→</span></span>
        </div>
      </a>
    </article>';
    }

    function gdb_cta_band(): string
    {
        return '
    <section class="gdb-cta" data-reveal data-reveal-key="cta">
      <div class="gdb-cta-sweep" aria-hidden="true"></div>
      ' . gdb_sparks(8) . '
      <div class="container gdb-cta-inner">
        <img class="gdb-cta-logo" src="' . e(gdb_logo()) . '" alt="Gifting Destiny logo" width="84" height="84" loading="lazy" />
        <div class="gdb-cta-copy">
          <h2>Planning a gift for one person, or for your whole team?</h2>
          <p>Tell us the occasion and your budget. We\'ll suggest options and share a digital preview of your name or logo before anything is printed.</p>
        </div>
        <div class="gdb-cta-actions">
          <a class="gdb-btn gdb-btn-gold" href="' . e(wa_link('Hello Gifting Destiny! I read your blog and would like help choosing a gift.')) . '" target="_blank" rel="noopener">Chat on WhatsApp</a>
          <a class="gdb-btn gdb-btn-ghost" href="' . e(url('/corporate')) . '">Corporate gifting</a>
        </div>
      </div>
    </section>';
    }
}
