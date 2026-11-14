<?php
/** @var array $post  @var array $related  @var bool $preview */
view('partials/blog-bits');
$prepared = gd_prepare_post_html($post['content']);
$toc = count($prepared['headings']) >= 2 ? $prepared['headings'] : [];
$shareUrl = absolute_url('/blog/' . $post['slug']);
$shareText = $post['title'] . ' – Gifting Destiny';
?>
    <div class="gdb gdb-post" data-gdb-route="blog/<?= e($post['slug']) ?>">
<?php if (!empty($preview)): ?>
      <div class="gdb-preview-banner" role="status">Preview: this blog is <strong>hidden</strong> from visitors (Inactive or scheduled). Only signed-in admins can see this page.</div>
<?php endif; ?>
      <div class="gdb-progress" aria-hidden="true"><span id="gdb-progress-bar"></span></div>
      <header class="gdb-post-hero">
        <div class="gdb-post-hero-bg" aria-hidden="true"><?= $post['image'] ? '<img src="' . e($post['image']['card']) . '" alt="" />' : '' ?></div>
        <?= gdb_sparks(10) ?>

        <div class="container gdb-post-hero-inner">
          <nav class="gdb-crumbs" aria-label="Breadcrumb">
            <a href="<?= e(url('/blog')) ?>">Blog</a><span aria-hidden="true">/</span><span><?= e($post['badge']) ?></span>
          </nav>
          <h1 class="gdb-post-title"><?= gdb_kinetic($post['title']) ?></h1>
          <div class="gdb-post-meta">
            <img class="gdb-avatar" src="<?= e(gdb_logo()) ?>" alt="" width="48" height="48" />
            <div>
              <strong>Gifting Destiny</strong>
              <span><time datetime="<?= e($post['date']) ?>"><?= e(gd_date($post['date'])) ?></time> · <?= (int)$post['readMinutes'] ?> min read</span>
            </div>
          </div>
        </div>
      </header>

      <section class="gdb-canvas gdb-canvas-post">
<?php if ($post['image']): ?>
        <div class="container gdb-cover-wrap"><figure class="gdb-cover" data-gdb-parallax><?= gdb_image($post, 'cover', true) ?></figure></div>
<?php endif; ?>
        <div class="container gdb-post-layout<?= $toc ? '' : ' no-toc' ?>">
          <article class="gdb-article" data-reveal data-reveal-key="article-<?= e($post['slug']) ?>">
<?php if ($toc): ?>
            <details class="gdb-toc-mobile">
              <summary>On this page</summary>
              <ol><?php foreach ($toc as $item): ?><li><button type="button" data-gdb-jump="<?= e($item['id']) ?>"><?= e($item['label']) ?></button></li><?php endforeach; ?></ol>
            </details>
<?php endif; ?>
            <div class="gdb-article-body"><?= $prepared['html'] ?></div>
          </article>
          <aside class="gdb-aside">
<?php if ($toc): ?>
            <nav class="gdb-toc" aria-label="On this page">
              <span class="gdb-aside-label">On this page</span>
              <ol><?php foreach ($toc as $item): ?><li><button type="button" data-gdb-jump="<?= e($item['id']) ?>" data-gdb-toc="<?= e($item['id']) ?>"><?= e($item['label']) ?></button></li><?php endforeach; ?></ol>
            </nav>
<?php endif; ?>
            <div class="gdb-aside-card">
              <img src="<?= e(gdb_logo()) ?>" alt="Gifting Destiny logo" width="64" height="64" loading="lazy" />
              <strong>Like this idea?</strong>
              <p>We can personalise it with a name, photo or company logo.</p>
              <a class="gdb-btn gdb-btn-gold gdb-btn-block" href="<?= e(wa_link('Hello Gifting Destiny! I read "' . $post['title'] . '" and would like a gift suggestion.')) ?>" target="_blank" rel="noopener">Chat on WhatsApp</a>
              <a class="gdb-btn gdb-btn-ghost-dark gdb-btn-block" href="<?= e(url('/shop')) ?>">Browse products</a>
            </div>
            <div class="gdb-share">
              <span class="gdb-aside-label">Share this story</span>
              <div class="gdb-share-row">
                <a class="gdb-share-btn" href="https://wa.me/?text=<?= e(rawurlencode($shareText . ' ' . $shareUrl)) ?>" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>
                <button type="button" class="gdb-share-btn" data-gdb-action="copy-link" data-url="<?= e($shareUrl) ?>">Copy link</button>
              </div>
            </div>
          </aside>
        </div>

        <div class="container gdb-post-end">
<?php if ($related): ?>
          <div class="gdb-section-head" data-reveal data-reveal-key="related-head-<?= e($post['slug']) ?>">
            <h2>Keep reading</h2>
            <p>More gifting ideas from our studio.</p>
          </div>
          <div class="gdb-grid"><?php foreach ($related as $i => $item) echo gdb_card($item, $i, false); ?></div>
<?php endif; ?>
          <div class="gdb-back-row"><a class="gdb-btn gdb-btn-ghost-dark" href="<?= e(url('/blog')) ?>">← All stories</a></div>
        </div>
      </section>
      <?= gdb_cta_band() ?>

    </div>
    <script type="application/ld+json"><?= json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => $post['title'],
        'description' => $post['excerpt'],
        'datePublished' => date('c', strtotime($post['published_at'])),
        'dateModified' => date('c', strtotime($post['updated_at'])),
        'image' => $post['image'] ? [preg_match('~^https?://~', $post['image']['src']) ? $post['image']['src'] : absolute_url(substr($post['image']['src'], strlen(gd_base())))] : [],
        'author' => ['@type' => 'Organization', 'name' => 'Gifting Destiny'],
        'publisher' => ['@type' => 'Organization', 'name' => 'Gifting Destiny', 'logo' => ['@type' => 'ImageObject', 'url' => absolute_url('/assets/gifting-destiny-original-logo.jpg')]],
        'mainEntityOfPage' => $shareUrl,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
