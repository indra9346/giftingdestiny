<?php
/** @var array $product */
$cats = gd_categories();
$matched = gd_category_by_slug_or_alias($product['primaryCategory'] ?? '');
if (!$matched) {
    foreach ($cats as $c) {
        if (gd_categories_match($product['categories'], $c['match'])) { $matched = $c; break; }
    }
}
$matched = $matched ?: ['id' => 'all', 'name' => $product['primaryCategory'] ?? 'Gifts', 'slug' => 'all', 'count' => 0];
$related = [];
foreach (gd_products() as $p) {
    if ($p['id'] === $product['id']) continue;
    if (gd_match_product_category($p, $matched['slug'] ?? $matched['id']) || array_intersect($p['categories'], $product['categories'])) $related[] = $p;
    if (count($related) === 4) break;
}
$images = !empty($product['images']) ? $product['images'] : [$product['primaryImage']];
$isDrinkware = gd_is_drinkware($product);
$catHref = ($matched['id'] ?? 'all') === 'all' ? url('/shop') : url('/shop?category=' . $matched['id']);
$productData = [
    'id' => $product['id'], 'slug' => $product['slug'], 'name' => $product['name'],
    'category' => $product['primaryCategory'] ?? 'Gift Item', 'image' => url($product['primaryImage']),
];
?>
    <div class="product-detail-page" data-product='<?= e(json_encode($productData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) ?>'>
      <div class="container">
        <!-- Breadcrumb Navigation -->
        <nav class="product-breadcrumb" aria-label="Breadcrumb">
          <a href="<?= e(url('/')) ?>" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-sep">/</span>
          <a href="<?= e($catHref) ?>" class="breadcrumb-link"><?= e($matched['name']) ?></a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current"><?= e($product['name']) ?></span>
        </nav>

        <div class="product-detail-grid">
          <!-- Left Column: Image Gallery -->
          <div class="product-gallery-section">
            <div class="main-image-container<?= $isDrinkware ? ' has-print-preview' : '' ?>">
              <img
                src="<?= e(url($images[0])) ?>"
                alt="<?= e($product['name']) ?>"
                id="pdp-main-image"
                class="pdp-main-img"
                loading="eager"
                fetchpriority="high"
              />
<?php if ($isDrinkware): ?>
              <div class="drinkware-print-preview" id="drinkware-print-preview" aria-live="polite" hidden></div>
              <script type="application/json" id="mug-print-areas"><?= json_encode(gd_mug_print_areas(), JSON_UNESCAPED_SLASHES) ?></script>
<?php endif; ?>
              <span class="pdp-badge">Handcrafted Quality</span>
            </div>

<?php if (count($images) > 1): ?>
            <div class="pdp-thumbnails-strip">
<?php foreach ($images as $idx => $img): ?>
              <button
                type="button"
                class="pdp-thumb-btn <?= $idx === 0 ? 'active' : '' ?>"
                data-img-src="<?= e(url($img)) ?>"
                aria-label="View photo <?= $idx + 1 ?>"
              >
                <img src="<?= e(url($img)) ?>" alt="Thumbnail <?= $idx + 1 ?>" />
              </button>
<?php endforeach; ?>
            </div>
<?php endif; ?>

            <!-- Trust Highlights -->
            <div class="pdp-trust-cards">
              <div class="trust-item">
                <span class="trust-icon"><?= icon('gem') ?></span>
                <div>
                  <strong>Precision Personalization</strong>
                  <p>Laser engraving & vibrant sublimation</p>
                </div>
              </div>
              <div class="trust-item">
                <span class="trust-icon">📦</span>
                <div>
                  <strong>Safe Transit Packing</strong>
                  <p>Pan-India padded, shock-proof boxing</p>
                </div>
              </div>
              <div class="trust-item">
                <span class="trust-icon">🏢</span>
                <div>
                  <strong>Corporate Discounts</strong>
                  <p>Tiered pricing for 25+ bulk pieces</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Product Information & Purchase/Enquiry Options -->
          <div class="product-info-section">
            <div class="pdp-category-tag">
              <span class="cat-pill" data-cat="<?= e($matched['id']) ?>">
                <?= e($matched['name']) ?>

              </span>
              <span class="sku-pill">ID: GD-<?= e($product['id']) ?></span>
            </div>

            <h1 class="pdp-product-title"><?= e($product['name']) ?></h1>

            <div class="pdp-status-row">
              <span class="stock-status <?= !empty($product['inStock']) ? 'in-stock' : 'out-of-stock' ?>">
                <span class="stock-dot"></span>
                <?= !empty($product['inStock']) ? 'In Stock' : 'Out of Stock' ?>

              </span>
              <span class="dispatch-time"><?= ($product['type'] ?? '') === 'variable' ? 'Product variants available' : 'Product ID: GD-' . e($product['id']) ?></span>
            </div>

            <!-- Price & Order Note -->
            <div class="pdp-pricing-box">
              <div class="pdp-pricing-header">
                <div>
                  <span class="pricing-label">Pricing Format</span>
                  <div class="pricing-main-callout">Custom Order / Bulk Pricing</div>
                </div>
                <div class="pricing-verified-badge">
                  <span>✔</span> Direct Atelier
                </div>
              </div>
              <p class="pricing-note">
                Prices vary based on customization complexity (laser engraving, screen printing, or full color sublimation) and quantity tiers. Request an instant quote or buy directly via WhatsApp.
              </p>
            </div>

            <!-- Personalization & Buying Box -->
            <div class="pdp-order-box">
              <h3 class="order-box-title">Order & Personalization Details</h3>

              <div class="order-field-group">
                <label for="pdp-custom-text" class="field-label">
                  Custom Name / Text to Engrave or Print <span class="optional">(Optional)</span>:
                </label>
                <input
                  type="text"
                  id="pdp-custom-text"
                  class="pdp-input"
                  placeholder="e.g. Vikram Sharma, Congratulations Dr. Priya"
                  maxlength="50"
                />
<?php if ($isDrinkware): ?>
                <div class="drinkware-print-options">
                  <span class="field-label">Print color:</span>
                  <div class="print-color-swatches" role="group" aria-label="Choose print color">
                    <button type="button" class="print-color-swatch active" data-print-color="#172554" style="--swatch-color:#172554" aria-label="Navy blue" aria-pressed="true"></button>
                    <button type="button" class="print-color-swatch" data-print-color="#111827" style="--swatch-color:#111827" aria-label="Black" aria-pressed="false"></button>
                    <button type="button" class="print-color-swatch" data-print-color="#8b1e3f" style="--swatch-color:#8b1e3f" aria-label="Ruby red" aria-pressed="false"></button>
                    <button type="button" class="print-color-swatch" data-print-color="#b7791f" style="--swatch-color:#b7791f" aria-label="Gold" aria-pressed="false"></button>
                    <button type="button" class="print-color-swatch" data-print-color="#db2777" style="--swatch-color:#db2777" aria-label="Pink" aria-pressed="false"></button>
                  </div>
                  <span class="field-label print-style-label">Lettering style:</span>
                  <div class="print-style-options" role="group" aria-label="Choose lettering style">
                    <button type="button" class="print-style-option active" data-print-style="serif" aria-pressed="true">Classic</button>
                    <button type="button" class="print-style-option" data-print-style="sans" aria-pressed="false">Modern</button>
                    <button type="button" class="print-style-option" data-print-style="script" aria-pressed="false">Script</button>
                  </div>
                  <span class="drinkware-preview-hint">Preview is a placement guide; final print follows the curve of the drinkware.</span>
                </div>
<?php endif; ?>
              </div>

              <div class="order-field-group">
                <label class="field-checkbox">
                  <input type="checkbox" id="pdp-logo-check" />
                  <span>I want to include a Company Logo / Custom Graphic</span>
                </label>
              </div>

              <div class="order-qty-row">
                <label class="field-label" for="pdp-qty-input">Quantity:</label>
                <div class="qty-counter">
                  <button type="button" class="qty-btn" id="pdp-qty-minus" aria-label="Decrease quantity">-</button>
                  <input type="number" id="pdp-qty-input" class="qty-num-input" value="1" min="1" max="10000" />
                  <button type="button" class="qty-btn" id="pdp-qty-plus" aria-label="Increase quantity">+</button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pdp-action-buttons">
                <button type="button" class="btn btn-buy-now" id="pdp-whatsapp-btn" data-action="buy-now" data-id="<?= e($product['id']) ?>">
                  <span><?= icon('bag') ?></span>
                  <span>Buy Now</span>
                </button>

                <button type="button" class="btn btn-add-bag" id="pdp-add-bag-btn" data-id="<?= e($product['id']) ?>">
                  <span><?= icon('bag') ?></span>
                  <span>Add to Inquiry Bag</span>
                </button>

                <button type="button" class="btn btn-quote-modal" id="pdp-quote-btn" data-id="<?= e($product['id']) ?>">
                  <span>📋</span>
                  <span>Request Official Quote</span>
                </button>
              </div>
            </div>

            <!-- Description & Features -->
            <div class="pdp-description-tabs">
              <div class="pdp-tab-header">
                <button class="pdp-tab-btn active" data-tab="desc" type="button">Product Description & Specs</button>
                <button class="pdp-tab-btn" data-tab="delivery" type="button">Customization & Delivery</button>
              </div>

              <div class="pdp-tab-content active" id="tab-desc">
                <div class="pdp-formatted-description">
                  <?= !empty($product['description']) ? gd_format_product_description($product['description']) : '<p class="pdp-clean-paragraph">Product details have not been provided in the source catalogue.</p>' ?>

                </div>
              </div>

              <div class="pdp-tab-content" id="tab-delivery" style="display: none;">
                <div class="delivery-details-card">
                  <h4>How Customization & Fulfillment Works:</h4>
                  <ol class="fulfillment-steps">
                    <li><strong>Design Preview:</strong> Our Bangalore design team shares a high-resolution digital mock-up before production begins.</li>
                    <li><strong>Precision Crafting:</strong> Sublimation heat press or high-precision fiber laser etching is performed.</li>
                    <li><strong>Quality Check & Packing:</strong> Every unit is polished, boxed, and packed with shock-resistant cushioning.</li>
                    <li><strong>Pan-India Express Dispatch:</strong> Dispatched via trusted couriers with tracking link shared on WhatsApp.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

<?php if ($related): ?>
        <!-- Related Products Section -->
        <div class="related-products-section" id="related-products-section">
          <div class="section-heading-row related-heading-row">
            <div>
              <span class="eyebrow-accent">✦ EXPLORE MORE IN COLLECTION</span>
              <h2 class="related-section-title">Related Items in <?= e($matched['name']) ?></h2>
            </div>
            <a href="<?= e($catHref) ?>" class="btn btn-gd-outline">
              <span>View All <?= e($matched['name']) ?> (<?= (int)$matched['count'] ?>)</span>
              <span>→</span>
            </a>
          </div>

          <div class="products-grid-4col related-grid-4col">
<?php foreach ($related as $i => $p): ?>
<?= view('partials/product-card', ['p' => $p, 'index' => $i, 'related' => true, 'relatedCat' => $matched]) ?>
<?php endforeach; ?>
          </div>
        </div>
<?php endif; ?>
      </div>
    </div>
