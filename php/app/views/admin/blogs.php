<?php /** @var array $blogs  @var array $categories */ ?>
      <div class="adm-page-head">
        <div>
          <h1 class="adm-page-title">Blog Management</h1>
          <p class="adm-muted">Blogs marked <strong>Active</strong> show on the website's Blogs page, newest date first.</p>
        </div>
        <button type="button" class="adm-btn adm-btn-green" data-blog-add>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Add New Blog
        </button>
      </div>

      <section class="adm-card">
        <div class="adm-table-tools">
          <label class="adm-entries">Show
            <select class="adm-select-sm" data-table-size>
              <option value="10" selected>10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            entries
          </label>
          <label class="adm-search">Search:
            <input type="search" class="adm-input-sm" data-table-search placeholder="Name, title or category">
          </label>
        </div>

        <div class="adm-table-wrap">
          <table class="adm-table" data-table>
            <thead>
              <tr>
                <th style="width:48px">#</th>
                <th style="width:84px">Thumbnail</th>
                <th>Blog Name</th>
                <th>Blog Title</th>
                <th>Category</th>
                <th style="width:120px">Blog Date</th>
                <th style="width:96px">Status</th>
                <th style="width:250px">Action</th>
              </tr>
            </thead>
            <tbody>
<?php if (!$blogs): ?>
              <tr class="adm-empty-row"><td colspan="8">No blogs yet. Click <strong>Add New Blog</strong> to write the first one.</td></tr>
<?php endif; ?>
<?php foreach ($blogs as $i => $b):
    $thumb = $b['thumbnail_card'] ?: $b['thumbnail'];
    $hiddenReason = $b['status'] !== 'active' ? 'Hidden from the website' : ($b['published_at'] > now_iso() ? 'Scheduled: shows from this date' : '');
?>
              <tr data-row data-search="<?= e(mb_strtolower($b['name'] . ' ' . $b['title'] . ' ' . $b['category'] . ' ' . $b['slug'])) ?>">
                <td class="adm-num"><?= $i + 1 ?></td>
                <td><?php if ($thumb): ?><img class="adm-thumb" src="<?= e(gd_media_url($thumb)) ?>" alt="" loading="lazy"><?php else: ?><span class="adm-thumb adm-thumb-empty">No image</span><?php endif; ?></td>
                <td><strong><?= e($b['name']) ?></strong><div class="adm-sub">/blog/<?= e($b['slug']) ?></div></td>
                <td><?= e($b['title']) ?></td>
                <td><?= $b['category'] !== '' ? '<span class="adm-chip">' . e($b['category']) . '</span>' : '<span class="adm-sub">—</span>' ?></td>
                <td><?= e(gd_date($b['published_at'])) ?><?php if ($hiddenReason && $b['status'] === 'active'): ?><div class="adm-sub adm-warn"><?= e($hiddenReason) ?></div><?php endif; ?></td>
                <td>
                  <form method="post" action="<?= e(url('/admin/blogs/' . $b['id'] . '/status')) ?>">
                    <?= csrf_field() ?>
                    <button type="submit" class="adm-status <?= $b['status'] === 'active' ? 'is-on' : 'is-off' ?>" title="Click to make it <?= $b['status'] === 'active' ? 'Inactive (hide)' : 'Active (show)' ?>">
                      <?= $b['status'] === 'active' ? 'Active' : 'Inactive' ?>
                    </button>
                  </form>
                </td>
                <td>
                  <div class="adm-actions">
                    <button type="button" class="adm-btn-xs adm-xs-seo" data-blog-seo
                      data-id="<?= (int)$b['id'] ?>" data-name="<?= e($b['name']) ?>" data-slug="<?= e($b['slug']) ?>"
                      data-meta-title="<?= e($b['meta_title']) ?>" data-meta-description="<?= e($b['meta_description']) ?>" data-meta-keywords="<?= e($b['meta_keywords']) ?>">SEO</button>
                    <a class="adm-btn-xs adm-xs-view" href="<?= e(url('/blog/' . $b['slug'] . ($b['status'] !== 'active' || $b['published_at'] > now_iso() ? '?preview=1' : ''))) ?>" target="_blank" rel="noopener" title="View on the website">View</a>
                    <button type="button" class="adm-btn-xs adm-xs-edit" data-blog-edit="<?= (int)$b['id'] ?>">Edit</button>
                    <form method="post" action="<?= e(url('/admin/blogs/' . $b['id'] . '/delete')) ?>" data-confirm="Delete the blog &quot;<?= e($b['name']) ?>&quot;? This cannot be undone.">
                      <?= csrf_field() ?>
                      <button type="submit" class="adm-btn-xs adm-xs-delete">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
<?php endforeach; ?>
              <tr class="adm-empty-row" data-no-match hidden><td colspan="8">No blogs match your search.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="adm-table-foot">
          <span data-table-info></span>
          <div class="adm-pager" data-table-pager></div>
        </div>
      </section>

      <!-- Add / Edit Blog -->
      <div class="adm-modal" id="blog-modal" role="dialog" aria-modal="true" aria-labelledby="blog-modal-title" hidden>
        <div class="adm-modal-dialog adm-modal-lg">
          <form id="blog-form" class="adm-form" action="<?= e(url('/admin/blogs/save')) ?>" method="post" enctype="multipart/form-data" novalidate>
            <div class="adm-modal-head">
              <h2 id="blog-modal-title">Add New Blog</h2>
              <button type="button" class="adm-modal-x" data-modal-close aria-label="Close">&times;</button>
            </div>
            <div class="adm-modal-body">
              <?= csrf_field() ?>
              <input type="hidden" name="id" value="">

              <label class="adm-label" for="blog-name">Blog Name <span class="adm-req">*</span></label>
              <input class="adm-input" type="text" id="blog-name" name="name" maxlength="160" placeholder="Blog Name" required>
              <div class="adm-help">Short name for this blog. The web address is made from it: <span class="adm-slug-preview" data-slug-preview>/blog/…</span></div>

              <label class="adm-label" for="blog-thumbnail">Blog Thumbnail (JPG, JPEG, PNG, WEBP) <span class="adm-req" data-thumb-required>*</span></label>
              <div class="adm-file-row">
                <input class="adm-input adm-file" type="file" id="blog-thumbnail" name="thumbnail" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp">
                <div class="adm-thumb-preview" data-thumb-preview hidden><img alt="Thumbnail preview"></div>
              </div>
              <div class="adm-help">Shown on the blog card and at the top of the article. Wide pictures look best (about 1200 × 750). Up to 6 MB.</div>

              <label class="adm-label" for="blog-title">Blog Title</label>
              <input class="adm-input" type="text" id="blog-title" name="title" maxlength="220" placeholder="Blog Title">
              <div class="adm-help">The heading readers see on the website. Leave empty to use the Blog Name.</div>

              <div class="adm-grid-2">
                <div>
                  <label class="adm-label" for="blog-category">Blog Category</label>
                  <input class="adm-input" type="text" id="blog-category" name="category" maxlength="80" placeholder="Blog Category" list="blog-category-list">
                  <datalist id="blog-category-list">
<?php foreach ($categories as $c): ?>
                    <option value="<?= e($c) ?>"></option>
<?php endforeach; ?>
                  </datalist>
                </div>
                <div>
                  <label class="adm-label" for="blog-date">Blog Date</label>
                  <input class="adm-input" type="datetime-local" id="blog-date" name="published_at">
                </div>
              </div>

              <div class="adm-grid-2">
                <div>
                  <label class="adm-label" for="blog-status">Status</label>
                  <select class="adm-input" id="blog-status" name="status">
                    <option value="active">Active (show on website)</option>
                    <option value="inactive">Inactive (hidden)</option>
                  </select>
                </div>
                <div>
                  <label class="adm-label" for="blog-alt">Thumbnail description <span class="adm-muted">(optional)</span></label>
                  <input class="adm-input" type="text" id="blog-alt" name="thumbnail_alt" maxlength="200" placeholder="What the picture shows">
                </div>
              </div>

              <label class="adm-label" for="blog-content">Blog Description <span class="adm-req">*</span></label>
              <textarea id="blog-content" name="content" class="adm-input adm-editor-fallback" rows="14" placeholder="Write blog content here..."></textarea>

              <p class="adm-form-error" data-form-error role="alert" hidden></p>
            </div>
            <div class="adm-modal-foot">
              <button type="button" class="adm-btn adm-btn-grey" data-modal-close>Close</button>
              <button type="submit" class="adm-btn adm-btn-green" data-save-btn>Save Blog</button>
            </div>
          </form>
        </div>
      </div>

      <!-- SEO -->
      <div class="adm-modal" id="seo-modal" role="dialog" aria-modal="true" aria-labelledby="seo-modal-title" hidden>
        <div class="adm-modal-dialog">
          <form id="seo-form" class="adm-form" method="post" action="">
            <div class="adm-modal-head">
              <h2 id="seo-modal-title">SEO Details</h2>
              <button type="button" class="adm-modal-x" data-modal-close aria-label="Close">&times;</button>
            </div>
            <div class="adm-modal-body">
              <?= csrf_field() ?>
              <p class="adm-muted" data-seo-for></p>
              <label class="adm-label" for="seo-title">Meta Title</label>
              <input class="adm-input" type="text" id="seo-title" name="meta_title" maxlength="200" placeholder="Shown in Google results and the browser tab">
              <div class="adm-help"><span data-count-for="seo-title">0</span>/60 characters recommended. Empty = Blog Title.</div>
              <label class="adm-label" for="seo-description">Meta Description</label>
              <textarea class="adm-input" id="seo-description" name="meta_description" rows="3" maxlength="400" placeholder="One or two sentences that describe the blog"></textarea>
              <div class="adm-help"><span data-count-for="seo-description">0</span>/160 characters recommended. Empty = first lines of the blog.</div>
              <label class="adm-label" for="seo-keywords">Meta Keywords</label>
              <input class="adm-input" type="text" id="seo-keywords" name="meta_keywords" maxlength="300" placeholder="e.g. corporate gifts bangalore, personalised mugs">
              <label class="adm-label" for="seo-slug">Web address (URL)</label>
              <div class="adm-prefix-input"><span>/blog/</span><input class="adm-input" type="text" id="seo-slug" name="slug" maxlength="120"></div>
              <div class="adm-help">Changing the address breaks links already shared. Only change it if needed.</div>
            </div>
            <div class="adm-modal-foot">
              <button type="button" class="adm-btn adm-btn-grey" data-modal-close>Close</button>
              <button type="submit" class="adm-btn adm-btn-green">Save SEO</button>
            </div>
          </form>
        </div>
      </div>
