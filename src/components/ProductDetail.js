import { csvProducts } from '../data/csvProducts.js';
import { categories, getCategoryBySlugOrAlias, matchProductCategory } from '../data/categories.js';
import { store } from '../utils/store.js';
import { icon } from './icons.js';

export function formatProductDescription(raw) {
  if (!raw) return '';

  // 1. Clean escaped sequences: literal backslash-r and backslash-n, carriage returns, tabs
  let text = String(raw)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/&nbsp;/gi, ' ');

  // 2. Remove redundant raw 'Description' label if present at start
  text = text.replace(/^\s*<strong>\s*Description\s*<\/strong>\s*/i, '');
  text = text.replace(/^\s*Description\s*[\n:]+/i, '');

  // 3. Transform "Key Features" headers into a beautifully styled section header
  text = text.replace(
    /<(?:h[1-6]|strong|b)>\s*(?:<b>|<strong>)?\s*Key Features\s*(?:<\/strong>|<\/b>)?\s*<\/(?:h[1-6]|strong|b)>/gi, 
    '<div class="pdp-features-badge-header"><span class="features-badge-icon">✦</span> Key Features & Specifications</div>'
  );
  text = text.replace(
    /<strong>\s*Key Features\s*<\/strong>/gi, 
    '<div class="pdp-features-badge-header"><span class="features-badge-icon">✦</span> Key Features & Specifications</div>'
  );

  // 4. Clean messy WordPress inline attributes on list items & spans
  text = text.replace(/style="[^"]*"/gi, '');
  text = text.replace(/aria-level="[^"]*"/gi, '');
  text = text.replace(/<\/?span[^>]*>/gi, '');

  // 5. Clean up lists
  text = text.replace(/<ul>\s*/gi, '<ul class="pdp-features-clean-list">');
  text = text.replace(/<li[^>]*>\s*/gi, '<li>');
  text = text.replace(/\s*<\/li>/gi, '</li>');

  // 6. Split by the feature header and list blocks to structure paragraphs cleanly
  const parts = text.split(/(<div class="pdp-features-badge-header">[\s\S]*?<\/div>|<ul[\s\S]*?<\/ul>)/i);

  let formatted = parts.map(part => {
    if (part.startsWith('<div class="pdp-features-badge-header"') || part.startsWith('<ul')) {
      return part;
    }
    // Clean whitespace and split paragraphs on double newlines
    const paragraphs = part
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return paragraphs.map(p => {
      // If already has markup like <p> or <div>, return as is
      if (p.startsWith('<p') || p.startsWith('<div')) return p;
      const cleanP = p.replace(/\n+/g, ' ').trim();
      return cleanP ? `<p class="pdp-clean-paragraph">${cleanP}</p>` : '';
    }).filter(Boolean).join('');
  }).join('');

  return formatted;
}

export function renderProductDetail(state) {
  const productId = state.selectedProductId;
  const product = csvProducts.find(p => p.id === productId || p.slug === productId) || csvProducts[0];

  const matchedCatObj = getCategoryBySlugOrAlias(product.primaryCategory) || categories.find(c => 
    product.categories.some(cat => (c.matchCategories || c.match || []).some(m => m.toLowerCase() === cat.toLowerCase()))
  ) || { id: 'all', name: product.primaryCategory, slug: 'all', count: 0 };

  // Find real related products in the same category (excluding current)
  const related = csvProducts
    .filter(p => p.id !== product.id && (
      matchProductCategory(p, matchedCatObj.slug || matchedCatObj.id) ||
      p.categories.some(c => product.categories.includes(c))
    ))
    .slice(0, 4);

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : [product.primaryImage];
  const isDrinkware = /\b(mug|glass|cup|tumbler)\b/i.test(`${product.name} ${product.primaryCategory || ''} ${(product.categories || []).join(' ')}`);

  return `
    <div class="product-detail-page">
      <div class="container">
        <!-- Breadcrumb Navigation -->
        <nav class="product-breadcrumb" aria-label="Breadcrumb">
          <a href="#" class="breadcrumb-link" data-view="home">Home</a>
          <span class="breadcrumb-sep">/</span>
          <a href="#" class="breadcrumb-link" data-cat="${matchedCatObj.id}">${matchedCatObj.name}</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${product.name}</span>
        </nav>

        <div class="product-detail-grid">
          <!-- Left Column: Image Gallery -->
          <div class="product-gallery-section">
            <div class="main-image-container">
              <img 
                src="${images[0]}" 
                alt="${product.name}" 
                id="pdp-main-image" 
                class="pdp-main-img" 
                loading="eager"
              />
              ${isDrinkware ? '<div class="drinkware-print-preview" id="drinkware-print-preview" aria-live="polite" hidden></div>' : ''}
              <span class="pdp-badge">Handcrafted Quality</span>
            </div>

            ${images.length > 1 ? `
              <div class="pdp-thumbnails-strip">
                ${images.map((img, idx) => `
                  <button 
                    type="button" 
                    class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" 
                    data-img-src="${img}"
                    aria-label="View photo ${idx + 1}"
                  >
                    <img src="${img}" alt="Thumbnail ${idx + 1}" />
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <!-- Trust Highlights -->
            <div class="pdp-trust-cards">
              <div class="trust-item">
                <span class="trust-icon">${icon.gem}</span>
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
              <span class="cat-pill" data-cat="${matchedCatObj.id}">
                ${matchedCatObj.name}
              </span>
              <span class="sku-pill">ID: GD-${product.id}</span>
            </div>

            <h1 class="pdp-product-title">${product.name}</h1>

            <div class="pdp-status-row">
              <span class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                <span class="stock-dot"></span>
                ${product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              <span class="dispatch-time">${product.type === 'variable' ? 'Product variants available' : 'Product ID: GD-' + product.id}</span>
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
                ${isDrinkware ? `
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
                ` : ''}
              </div>

              <div class="order-field-group">
                <label class="field-checkbox">
                  <input type="checkbox" id="pdp-logo-check" />
                  <span>I want to include a Company Logo / Custom Graphic</span>
                </label>
              </div>

              <div class="order-qty-row">
                <label class="field-label">Quantity:</label>
                <div class="qty-counter">
                  <button type="button" class="qty-btn" id="pdp-qty-minus">-</button>
                  <input type="number" id="pdp-qty-input" class="qty-num-input" value="1" min="1" max="10000" />
                  <button type="button" class="qty-btn" id="pdp-qty-plus">+</button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pdp-action-buttons">
                <!-- Direct WhatsApp Buying/Enquiry -->
                <button type="button" class="btn btn-buy-now" id="pdp-whatsapp-btn" data-action="buy-now" data-id="${product.id}">
                  <span>${icon.bag}</span>
                  <span>Buy Now</span>
                </button>

                <!-- Add to Inquiry Bag -->
                <button type="button" class="btn btn-add-bag" id="pdp-add-bag-btn" data-id="${product.id}">
                  <span>${icon.bag}</span>
                  <span>Add to Inquiry Bag</span>
                </button>

                <!-- Request Corporate Quote Modal -->
                <button type="button" class="btn btn-quote-modal" id="pdp-quote-btn" data-id="${product.id}">
                  <span>📋</span>
                  <span>Request Official Quote</span>
                </button>
              </div>
            </div>

            <!-- Authentic Description & Features from WooCommerce CSV -->
            <div class="pdp-description-tabs">
              <div class="pdp-tab-header">
                <button class="pdp-tab-btn active" data-tab="desc">Product Description & Specs</button>
                <button class="pdp-tab-btn" data-tab="delivery">Customization & Delivery</button>
              </div>

              <div class="pdp-tab-content active" id="tab-desc">
                <div class="pdp-formatted-description">
                  ${product.description ? formatProductDescription(product.description) : `<p class="pdp-clean-paragraph">Product details have not been provided in the source catalogue.</p>`}
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

        <!-- Related Products Section (Clean 4-column responsive grid) -->
        ${related.length > 0 ? `
          <div class="related-products-section" id="related-products-section">
            <div class="section-heading-row related-heading-row">
              <div>
                <span class="eyebrow-accent">✦ EXPLORE MORE IN COLLECTION</span>
                <h2 class="related-section-title">Related Items in ${matchedCatObj.name}</h2>
              </div>
              <button type="button" class="btn btn-gd-outline" data-cat="${matchedCatObj.slug || matchedCatObj.id}">
                <span>View All ${matchedCatObj.name} (${matchedCatObj.count})</span>
                <span>→</span>
              </button>
            </div>

            <div class="products-grid-4col related-grid-4col">
              ${related.map(p => {
                const isWishlisted = store.isWishlisted(p.id);

                return `
                  <div class="product-card" data-product-id="${p.id}">
                    <div class="product-card-img-wrap" data-action="view-pdp" data-id="${p.id}">
                      <img 
                        src="${p.primaryImage}" 
                        alt="${p.name}" 
                        class="product-card-img" 
                        loading="lazy" 
                      />
                      
                      <button 
                        type="button" 
                        class="wishlist-btn-pill ${isWishlisted ? 'active' : ''}" 
                        data-action="wishlist" 
                        data-id="${p.id}" 
                        title="${isWishlisted ? 'Saved' : 'Save to Wishlist'}"
                        aria-label="Wishlist"
                      >
                        ${icon.heart}
                      </button>

                      <div class="card-hover-overlay">
                        <span class="view-pill">Quick View</span>
                      </div>
                    </div>

                    <div class="product-card-body">
                      <span class="product-card-cat" data-cat="${matchedCatObj.slug || matchedCatObj.id}">${matchedCatObj.name}</span>
                      <h3 class="product-card-title" data-action="view-pdp" data-id="${p.id}" title="${p.name}">
                        ${p.name}
                      </h3>
                      
                      <div class="product-card-status">
                        <span class="stock-indicator ${p.inStock ? 'in-stock' : 'out-of-stock'}">
                          <span class="stock-dot"></span> ${p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span class="custom-ready">${p.type === 'variable' ? 'Product variants' : 'Product details'}</span>
                      </div>

                      <div class="product-card-actions">
                        <button 
                          type="button" 
                          class="btn-view-details" 
                          data-action="view-pdp" 
                          data-id="${p.id}"
                        >
                          <span>View Details</span>
                          <span>→</span>
                        </button>

                        <button 
                          type="button" 
                          class="btn-buy-now" 
                          data-action="buy-now" 
                          data-id="${p.id}"
                          title="Buy ${p.name}"
                          aria-label="Buy ${p.name} now"
                        >
                          ${icon.bag}<span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
