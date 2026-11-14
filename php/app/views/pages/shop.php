<?php
/** @var string $category  @var string $query  @var string $sort */
$activeCat = gd_category_by_slug_or_alias($category);
$catTitle = $activeCat ? $activeCat['name'] : ($category === 'all' ? 'All Collections' : ($category ?: 'Catalogue'));
$catSubtitle = $activeCat
    ? ($activeCat['description'] ?: $activeCat['name'] . ' collection (' . $activeCat['count'] . ' items)')
    : 'Browse 118 authentic personalized gifts, laser engraved stationery, and sublimation blanks.';
?>
    <div class="page-hero-banner">
      <div class="container">
        <div class="section-eyebrow">✦ BENGALURU ATELIER CATALOGUE</div>
        <h1 class="page-hero-title"><?= e($catTitle) ?></h1>
        <p class="page-hero-subtitle">
          <?= e($catSubtitle) ?>

        </p>
      </div>
    </div>
<?= view('partials/catalog', ['category' => $category, 'query' => $query, 'sort' => $sort, 'isFullPage' => true, 'showAll' => false]) ?>
