<?php /** @var array $counts  @var int $newEnquiries  @var int $totalEnquiries  @var array $recent  @var array $latestEnquiries */ ?>
      <div class="adm-page-head">
        <div>
          <h1 class="adm-page-title">Dashboard</h1>
          <p class="adm-muted">Gifting Destiny website · <?= e(date('l, j F Y')) ?></p>
        </div>
        <a class="adm-btn adm-btn-green" href="<?= e(url('/admin/blogs?add=1')) ?>">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Add New Blog
        </a>
      </div>

      <div class="adm-stats">
        <a class="adm-stat" href="<?= e(url('/admin/blogs')) ?>"><span class="adm-stat-num"><?= (int)$counts['total'] ?></span><span class="adm-stat-label">Total Blogs</span></a>
        <a class="adm-stat is-green" href="<?= e(url('/admin/blogs')) ?>"><span class="adm-stat-num"><?= (int)$counts['active'] ?></span><span class="adm-stat-label">Active (on website)</span></a>
        <a class="adm-stat is-grey" href="<?= e(url('/admin/blogs')) ?>"><span class="adm-stat-num"><?= (int)$counts['inactive'] ?></span><span class="adm-stat-label">Inactive (hidden)</span></a>
        <a class="adm-stat is-gold" href="<?= e(url('/admin/enquiries')) ?>"><span class="adm-stat-num"><?= (int)$newEnquiries ?></span><span class="adm-stat-label">New Enquiries (<?= (int)$totalEnquiries ?> total)</span></a>
      </div>

      <div class="adm-grid-2 adm-gap-lg">
        <section class="adm-card">
          <div class="adm-card-head"><h2>Latest blogs</h2><a href="<?= e(url('/admin/blogs')) ?>">Manage blogs →</a></div>
<?php if (!$recent): ?>
          <p class="adm-muted">No blogs yet.</p>
<?php else: ?>
          <ul class="adm-list">
<?php foreach ($recent as $b): ?>
            <li>
              <a href="<?= e(url('/blog/' . $b['slug'] . ($b['status'] !== 'active' ? '?preview=1' : ''))) ?>" target="_blank" rel="noopener"><?= e($b['title']) ?></a>
              <span class="adm-sub"><?= e(gd_date($b['published_at'])) ?> · <span class="adm-dot <?= $b['status'] === 'active' ? 'is-on' : 'is-off' ?>"></span><?= $b['status'] === 'active' ? 'Active' : 'Inactive' ?></span>
            </li>
<?php endforeach; ?>
          </ul>
<?php endif; ?>
        </section>

        <section class="adm-card">
          <div class="adm-card-head"><h2>Latest enquiries</h2><a href="<?= e(url('/admin/enquiries')) ?>">All enquiries →</a></div>
<?php if (!$latestEnquiries): ?>
          <p class="adm-muted">No enquiries yet. Enquiry, quote and consultation forms on the website are saved here.</p>
<?php else: ?>
          <ul class="adm-list">
<?php foreach ($latestEnquiries as $q): ?>
            <li>
              <strong><?= e($q['name']) ?></strong> <?= $q['status'] === 'new' ? '<span class="adm-chip adm-chip-gold">New</span>' : '' ?>
              <span class="adm-sub"><?= e(gd_date($q['created_at'])) ?> · <?= e(ucfirst($q['source'])) ?> · <a href="tel:<?= e(preg_replace('/[^0-9+]/', '', $q['phone'])) ?>"><?= e($q['phone']) ?></a></span>
            </li>
<?php endforeach; ?>
          </ul>
<?php endif; ?>
        </section>
      </div>

      <section class="adm-card adm-tips">
        <h2>How to add a blog</h2>
        <ol>
          <li>Open <strong>Blogs</strong> and click <strong>Add New Blog</strong>.</li>
          <li>Fill in Blog Name, choose a Blog Thumbnail picture, then the Blog Title and Category.</li>
          <li>Write the Blog Description in the editor. Use the <em>Style</em> menu for headings (Header 2 adds the article to the "On this page" list).</li>
          <li>Click <strong>Save Blog</strong>. Active blogs appear on the website's Blogs page straight away.</li>
        </ol>
      </section>
