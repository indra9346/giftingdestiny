<?php
/** @var array $posts  published posts, newest first */
view('partials/blog-bits');
$latest = $posts[0] ?? null;
$topics = array_values(array_filter(gd_blog_topics(), function ($topic) use ($posts) {
    if ($topic['id'] === 'all') return true;
    foreach ($posts as $post) if (in_array($topic['id'], $post['topics'], true)) return true;
    return false;
}));
?>
    <div class="gdb gdb-list" data-gdb-route="blog">
      <section class="gdb-hero">
        <div class="gdb-hero-media" aria-hidden="true">
          <video class="gdb-hero-video" muted loop playsinline autoplay preload="metadata"><source src="<?= e(url('/gifting-destiny-brand-film.mp4')) ?>" type="video/mp4" /></video>
          <div class="gdb-hero-shade"></div>
          <div class="gdb-hero-sweep"></div>
          <?= gdb_sparks(14) ?>

        </div>
        <div class="container gdb-hero-inner">
          <div class="gdb-hero-badge">
            <span class="gdb-hero-ring"></span><span class="gdb-hero-ring r2"></span>
            <img src="<?= e(gdb_logo()) ?>" alt="Gifting Destiny logo" width="112" height="112" />
          </div>
          <span class="gdb-eyebrow">✦ The Gifting Destiny Journal</span>
          <h1 class="gdb-hero-title"><?= gdb_kinetic('Stories that make every gift unforgettable', ['unforgettable']) ?></h1>
          <p class="gdb-hero-sub">Gift ideas, corporate gifting guides and personalisation tips from our Bengaluru studio.</p>
          <div class="gdb-hero-stats">
<?php if ($latest): ?>
            <span><strong><?= count($posts) ?></strong> stories</span>
            <span>Updated <strong><?= e(gd_date($latest['date'])) ?></strong></span>
<?php endif; ?>
            <span>Personalised · Corporate · Festive</span>
          </div>
          <button type="button" class="gdb-scroll-cue" data-gdb-action="scroll-stories">
            <span>Start reading</span><span class="gdb-scroll-mouse" aria-hidden="true"><span></span></span>
          </button>
        </div>
      </section>

      <section class="gdb-canvas" id="gdb-stories">
        <div class="container">
<?php if ($posts): ?>
          <div class="gdb-toolbar" data-reveal data-reveal-key="toolbar">
            <div class="gdb-chips" role="group" aria-label="Filter stories by topic">
<?php foreach ($topics as $topic): ?>
              <button type="button" class="gdb-chip<?= $topic['id'] === 'all' ? ' is-active' : '' ?>" data-gdb-topic="<?= e($topic['id']) ?>" aria-pressed="<?= $topic['id'] === 'all' ? 'true' : 'false' ?>"><?= e($topic['label']) ?></button>
<?php endforeach; ?>
            </div>
            <label class="gdb-search">
              <span class="gdb-search-icon" aria-hidden="true">⌕</span>
              <input type="search" id="gdb-search" placeholder="Search stories" value="" autocomplete="off" aria-label="Search blog stories" />
            </label>
          </div>

          <article class="gdb-featured" data-reveal data-reveal-key="featured-<?= e($latest['slug']) ?>" data-gdb-item
            data-topics="<?= e(implode(' ', $latest['topics'])) ?>" data-search="<?= e(mb_strtolower($latest['title'] . ' ' . $latest['excerpt'])) ?>">
            <a class="gdb-featured-link" href="<?= e(gdb_post_url($latest)) ?>">
              <div class="gdb-featured-media">
                <?= gdb_image($latest, 'cover', true) ?>

                <span class="gdb-latest"><span class="gdb-latest-dot"></span>Latest story</span>
              </div>
              <div class="gdb-featured-body">
                <span class="gdb-chip-static"><?= e($latest['badge']) ?></span>
                <?= gdb_meta($latest) ?>

                <h2 class="gdb-featured-title"><?= e($latest['title']) ?></h2>
                <p class="gdb-featured-excerpt"><?= e($latest['excerpt']) ?></p>
                <span class="gdb-btn gdb-btn-gold">Read the story <span class="gdb-arrow" aria-hidden="true">→</span></span>
              </div>
            </a>
          </article>
          <section class="gdb-film" data-reveal data-reveal-key="film">
            <div class="gdb-film-frame">
              <video class="gdb-film-video" muted loop playsinline preload="none" data-gdb-autoplay aria-label="Gifting Destiny product film">
                <source src="<?= e(url('/gifting-destiny-hd-promo-v2.mp4')) ?>" type="video/mp4" />
              </video>
              <span class="gdb-film-corner tl"></span><span class="gdb-film-corner br"></span>
            </div>
            <div class="gdb-film-copy">
              <span class="gdb-eyebrow gdb-eyebrow-dark">▶ Gifting in motion</span>
              <h2 class="gdb-film-title"><?= gdb_kinetic('Crafted with love & care in Bengaluru', ['love', 'care']) ?></h2>
              <p>Personalised mugs, bottles, pens, keychains, LED frames and corporate gift sets, finished in our Bengaluru studio.</p>
              <div class="gdb-film-actions">
                <a class="gdb-btn gdb-btn-gold" href="<?= e(url('/shop')) ?>">Browse all products <span class="gdb-arrow" aria-hidden="true">→</span></a>
              </div>
            </div>
          </section>
          <div class="gdb-section-head" data-reveal data-reveal-key="more-head">
            <h2>More from the journal</h2>
            <p>Ideas for birthdays, anniversaries, festivals and corporate events.</p>
          </div>
          <div class="gdb-grid" id="gdb-grid"><?php foreach (array_slice($posts, 1) as $i => $post) echo gdb_card($post, $i); ?></div>
          <p class="gdb-empty" id="gdb-filter-empty" hidden>
            No stories match that search yet. <button type="button" class="gdb-link-btn" data-gdb-action="clear-filters">Show all stories</button>
          </p>
<?php else: ?>
          <p class="gdb-empty">New stories are on their way. Please check back soon.</p>
<?php endif; ?>
        </div>
      </section>
      <?= gdb_cta_band() ?>

    </div>
