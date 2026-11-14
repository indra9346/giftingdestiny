<?php
/**
 * Product listing (old renderProductCatalog).
 * @var string $category  @var string $query  @var string $sort
 * @var bool $isFullPage  shop page   @var bool $showAll  home page (every product, pills filter in place)
 */
$query = $query ?? '';
$selected = $category !== '' ? $category : 'all';
$canonical = gd_canonical_category($selected);
$activeCat = gd_category_by_slug_or_alias($selected);
$filtered = gd_filter_products($selected, $query, $sort);
$visible = (($_GET['show'] ?? '') === 'all') ? PHP_INT_MAX : 16;
$activeTitle = $activeCat ? $activeCat['name'] : 'All Collections';
$showListing = $isFullPage || $showAll;
$pillAttr = $showAll ? 'data-home-cat' : 'data-cat';
$all = gd_products();
$shopUrl = function (array $params) use ($selected, $query, $sort): string {
    $q = array_filter(array_merge(['category' => $selected !== 'all' ? $selected : null, 'q' => $query ?: null, 'sort' => $sort !== 'featured' ? $sort : null], $params), fn($v) => $v !== null && $v !== '');
    return url('/shop' . ($q ? '?' . http_build_query($q) : ''));
};
?>
    <section class="section catalog-section" id="products-catalog-section" data-showall="<?= $showAll ? '1' : '0' ?>">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header catalog-header">
          <div class="section-eyebrow">
            <span>OUR COLLECTION</span>
          </div>
          <h2 class="section-title" id="catalog-title">
            <?= e($showListing ? $activeTitle : 'Featured Product Catalogue') ?>

          </h2>
          <p class="section-subtitle" id="catalog-subtitle">
            <?= $showListing
                ? 'Showing <span id="catalog-count">' . count($filtered) . '</span> authentic handcrafted items available for bespoke customization &amp; bulk dispatch.'
                : 'Explore our signature personalized pens, sublimation bottles, plush fur cushions, and luxury gift hampers.' ?>

          </p>
        </div>

        <!-- Category Filter Pills Bar -->
        <div class="catalog-filter-bar">
          <div class="category-pills-scroll">
            <button
              type="button"
              class="cat-filter-pill <?= $canonical === 'all' || $selected === 'all' ? 'active' : '' ?>"
              <?= $pillAttr ?>="all"
            >
              All (<?= count($all) ?>)
            </button>
<?php foreach (gd_categories() as $c): ?>
            <button
              type="button"
              class="cat-filter-pill <?= $canonical === $c['id'] || $selected === $c['id'] ? 'active' : '' ?>"
              <?= $pillAttr ?>="<?= e($c['id']) ?>"
              data-cat-name="<?= e($c['name']) ?>"
            >
              <?= e($c['name']) ?> (<?= (int)$c['count'] ?>)
            </button>
<?php endforeach; ?>
          </div>

<?php if ($showListing): ?>
          <div class="catalog-sort-box">
            <label for="catalog-sort-select" class="sort-label">Sort By:</label>
            <select id="catalog-sort-select" class="sort-select">
              <option value="featured" <?= $sort === 'featured' ? 'selected' : '' ?>>Featured</option>
              <option value="name-asc" <?= $sort === 'name-asc' ? 'selected' : '' ?>>Name (A to Z)</option>
              <option value="name-desc" <?= $sort === 'name-desc' ? 'selected' : '' ?>>Name (Z to A)</option>
            </select>
          </div>
<?php endif; ?>
        </div>

        <!-- Products Grid -->
<?php if (!$filtered): ?>
        <div class="empty-results-box <?= $canonical === 'mugs' ? 'mugs-empty-box' : '' ?>">
          <span class="empty-icon"><?= icon('search') ?></span>
          <h3>No products found</h3>
          <p>
            We couldn't find any products matching "<?= e($query !== '' ? $query : $selected) ?>".
          </p>
          <div style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; margin-top: 1.25rem;">
            <a href="<?= e(url('/shop')) ?>" class="btn btn-gd-outline">
              <span>View All Products (<?= count($all) ?>)</span>
            </a>
          </div>
        </div>
<?php else: ?>
        <div class="products-grid-4col" id="products-grid">
<?php foreach ($filtered as $i => $p): ?>
<?= view('partials/product-card', ['p' => $p, 'index' => $i, 'hiddenCard' => $isFullPage && !$showAll && $i >= $visible]) ?>
<?php endforeach; ?>
        </div>
<?php endif; ?>

<?php if ($isFullPage && !$showAll && count($filtered) > $visible): ?>
        <div class="catalog-view-all-row">
          <a href="<?= e($shopUrl(['show' => 'all'])) ?>#products-grid" class="btn btn-gd-outline" data-action="load-more-products" data-step="16">
            Show More Products (<span data-remaining><?= count($filtered) - $visible ?></span> remaining)
          </a>
        </div>
<?php endif; ?>
      </div>
    </section>
