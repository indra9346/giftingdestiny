<?php
/**
 * @var array $p  product
 * @var int $index
 * @var bool $related  related-products variant (full photo, category of the page)
 * @var array|null $relatedCat
 * @var bool $hiddenCard  rendered but hidden until "Show More"
 */
$related = $related ?? false;
$primaryCat = $related ? $relatedCat['name'] : ($p['categories'][0] ?? 'Gifts');
$catAttr = $related ? ($relatedCat['slug'] ?? $relatedCat['id']) : $primaryCat;
$photo = $related ? ['src' => url($p['primaryImage']), 'srcset' => ''] : gd_thumb_set($p['primaryImage']);
$href = url('/product/' . $p['slug']);
$catSlugs = [];
foreach (gd_categories() as $c) if (gd_match_product_category($p, $c['id'])) $catSlugs[] = $c['id'];
?>
                <div class="product-card" data-product-id="<?= e($p['id']) ?>" data-href="<?= e($href) ?>" data-cats="<?= e(implode(' ', $catSlugs)) ?>" data-name="<?= e($p['name']) ?>" data-category="<?= e($p['primaryCategory'] ?? 'Gift Item') ?>" data-image="<?= e(url($p['primaryImage'])) ?>" data-slug="<?= e($p['slug']) ?>"<?= !empty($hiddenCard) ? ' hidden' : '' ?>>
                  <!-- Card Image Wrap -->
                  <div class="product-card-img-wrap" data-action="view-pdp" data-id="<?= e($p['id']) ?>">
                    <img
                      src="<?= e($photo['src']) ?>"
<?php if ($photo['srcset']): ?>
                      srcset="<?= e($photo['srcset']) ?>" sizes="<?= e(GD_CARD_SIZES) ?>"
                      data-fallback="<?= e(url($p['primaryImage'])) ?>"
<?php endif; ?>
<?php if (!$related): ?>
                      width="400" height="432"
<?php endif; ?>
                      alt="<?= e($p['name']) ?>"
                      class="product-card-img"
                      loading="<?= !$related && $index < 8 ? 'eager' : 'lazy' ?>"
<?php if (!$related && $index < 4): ?>
                      fetchpriority="high"
<?php endif; ?>
                      decoding="async"
                    />

                    <button
                      type="button"
                      class="wishlist-btn-pill"
                      data-action="wishlist"
                      data-id="<?= e($p['id']) ?>"
                      title="Save to Wishlist"
                      aria-label="Wishlist"
                    >
                      <?= icon('heart') ?>

                    </button>

                    <div class="card-hover-overlay">
                      <span class="view-pill">Quick View</span>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="product-card-body">
                    <span class="product-card-cat" data-cat="<?= e($catAttr) ?>"><?= e($primaryCat) ?></span>
                    <h3 class="product-card-title" data-action="view-pdp" data-id="<?= e($p['id']) ?>" title="<?= e($p['name']) ?>">
                      <a href="<?= e($href) ?>" class="product-card-title-link"><?= e($p['name']) ?></a>
                    </h3>

                    <div class="product-card-status">
                      <span class="stock-indicator <?= !empty($p['inStock']) ? 'in-stock' : 'out-of-stock' ?>">
                        <span class="stock-dot"></span> <?= !empty($p['inStock']) ? 'In Stock' : 'Out of Stock' ?>

                      </span>
                      <span class="custom-ready"><?= ($p['type'] ?? '') === 'variable' ? 'Product variants' : 'Product details' ?></span>
                    </div>

                    <!-- Card Actions -->
                    <div class="product-card-actions">
                      <button
                        type="button"
                        class="btn-view-details"
                        data-action="view-pdp"
                        data-id="<?= e($p['id']) ?>"
                      >
                        <span>View Details</span>
                        <span>→</span>
                      </button>

                      <button
                        type="button"
                        class="btn-buy-now"
                        data-action="buy-now"
                        data-id="<?= e($p['id']) ?>"
                        title="Buy <?= e($p['name']) ?>"
<?php if ($related): ?>
                        aria-label="Buy <?= e($p['name']) ?> now"
<?php endif; ?>
                        <?= !$related && empty($p['inStock']) ? 'disabled' : '' ?>

                      >
<?php if ($related): ?>
                        <?= icon('bag') ?><span>Buy Now</span>
<?php else: ?>
                        <span><?= icon('bag') ?></span><span>Buy Now</span>
<?php endif; ?>
                      </button>
                    </div>
                  </div>
                </div>
