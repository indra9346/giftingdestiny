import { store } from '../utils/store.js';
import { csvProducts } from '../data/csvProducts.js';
import { icon } from './icons.js';

const GD_PHONE = '918660940018'; // Verified from live site footer in Pic 4

export function renderCartDrawer(state) {
  const isOpen = state.cartDrawerOpen;
  const items = state.cart;
  const count = store.getCartCount();

  return `
    <div class="cart-drawer-overlay ${isOpen ? 'open' : ''}" id="cart-drawer-overlay">
      <div class="cart-drawer" role="dialog" aria-label="WhatsApp Order Bag">
        <!-- Header -->
        <div class="cart-header">
          <div class="cart-title-wrap">
            <span class="cart-title-icon">${icon.bag}</span>
            <div>
              <h3 class="cart-title">WhatsApp Order Bag</h3>
              <span class="cart-subtitle">${count} item${count === 1 ? '' : 's'} in your bag</span>
            </div>
          </div>
          <button class="cart-close-btn" id="cart-close-btn" title="Close" aria-label="Close Bag">
            &times;
          </button>
        </div>

        <!-- Info Notice -->
        <div class="cart-notice-bar">
          <span>Direct Bengaluru Atelier Dispatch · Pan-India Delivery</span>
        </div>

        <!-- Items Scroll -->
        <div class="cart-items-scroll">
          ${items.length === 0 ? `
            <div class="cart-empty-state">
              <span class="cart-empty-icon">${icon.gift}</span>
              <h4>Your WhatsApp bag is empty</h4>
              <p>Explore our personalized pens, bottles, fur cushions, and luxury gift hampers to assemble your order.</p>
              <button class="btn btn-gd-primary" id="cart-start-shopping-btn" data-view="shop">
                <span>Browse Collections</span>
                <span>→</span>
              </button>
            </div>
          ` : `
            <div class="cart-items-list">
              ${items.map((item, idx) => `
                <div class="cart-item-row">
                  <img src="${item.image}" alt="${item.name}" class="cart-item-thumbnail" />
                  <div class="cart-item-info">
                    <span class="cart-item-category">${item.category}</span>
                    <h4 class="cart-item-title">${item.name}</h4>
                    ${item.customNotes ? `
                      <div class="cart-item-custom-note">
                        ✍️ "${item.customNotes}"
                      </div>
                    ` : ''}

                    <div class="cart-item-qty-row">
                      <div class="qty-counter-small">
                        <button class="qty-btn-sm" data-cart-delta="-1" data-idx="${idx}" aria-label="Decrease ${item.name} quantity">−</button>
                        <input
                          type="number"
                          class="qty-val"
                          data-cart-quantity
                          data-idx="${idx}"
                          value="${item.quantity}"
                          min="1"
                          max="100000"
                          step="1"
                          inputmode="numeric"
                          aria-label="Quantity for ${item.name}"
                        />
                        <button class="qty-btn-sm" data-cart-delta="1" data-idx="${idx}" aria-label="Increase ${item.name} quantity">+</button>
                      </div>

                      <button class="cart-remove-link" data-cart-remove="${idx}">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Footer Actions -->
        ${items.length > 0 ? `
          <div class="cart-footer">
            <div class="cart-summary-line">
              <span>Total Selected Items:</span>
              <strong>${count} unit${count === 1 ? '' : 's'}</strong>
            </div>
            
            <p class="cart-disclaimer-note">
              Order processing, custom mock-ups, and dispatch timelines are finalized directly with our Bengaluru atelier team.
            </p>

            <div class="cart-actions-stack">
              <!-- WhatsApp Checkout/Enquiry -->
              <button type="button" class="btn btn-whatsapp-order" id="cart-whatsapp-order-btn">
                <span>${icon.whatsapp} Place Order on WhatsApp (+91 8660940018)</span>
              </button>

              <!-- Official Quote Submission -->
              <button type="button" class="btn btn-quote-order" id="cart-quote-order-btn">
                <span>📋 Submit Official Quote Request</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderEnquiryDrawer(state) {
  const isOpen = state.enquiryDrawerOpen;

  return `
    <div class="enquiry-drawer-overlay ${isOpen ? 'open' : ''}" id="enquiry-drawer-overlay">
      <div class="enquiry-drawer" role="dialog" aria-label="Direct Atelier Enquiry">
        <div class="enquiry-drawer-header">
          <div class="drawer-title-group">
            <span class="enquiry-header-icon">${icon.gem}</span>
            <div>
              <h3 class="enquiry-drawer-title">Gifting Destiny Enquiry</h3>
              <span class="enquiry-drawer-subtitle">Direct Atelier Quotes &amp; Corporate Bulk Orders</span>
            </div>
          </div>
          <button class="enquiry-close-btn" id="enquiry-close-btn">&times;</button>
        </div>

        <div class="enquiry-drawer-body">
          <!-- WhatsApp Quick Action Banner -->
          <div class="enquiry-wa-banner">
            <div class="wa-banner-text">
              <strong>Need an immediate digital mock-up?</strong>
              <p>Chat directly with our Bengaluru studio director on WhatsApp.</p>
            </div>
            <a href="https://wa.me/${GD_PHONE}?text=Hello%20Gifting%20Destiny!%20I%20want%20to%20enquire%20about%20personalized%20gifting%20solutions." target="_blank" rel="noopener" class="btn btn-wa-banner">
              <span>${icon.whatsapp} Instant WhatsApp Chat</span>
            </a>
          </div>

          <!-- Structured Enquiry Form (Replaces raw page-2 popup) -->
          <form id="enquiry-drawer-form" class="enquiry-styled-form">
            <div class="form-section-label">Contact Details</div>
            
            <div class="form-row-2col">
              <div class="form-field">
                <label for="enquiry-name">Your Full Name <span class="required">*</span></label>
                <input type="text" id="enquiry-name" required placeholder="e.g. Rahul Verma" class="form-styled-input" />
              </div>

              <div class="form-field">
                <label for="enquiry-phone">Phone / WhatsApp <span class="required">*</span></label>
                <input type="tel" id="enquiry-phone" required placeholder="+91 86609 40018" class="form-styled-input" />
              </div>
            </div>

            <div class="form-row-2col">
              <div class="form-field">
                <label for="enquiry-email">Email Address <span class="required">*</span></label>
                <input type="email" id="enquiry-email" required placeholder="rahul@company.com" class="form-styled-input" />
              </div>

              <div class="form-field">
                <label for="enquiry-qty">Estimated Quantity <span class="required">*</span></label>
                <input type="number" id="enquiry-qty" min="1" value="1" class="form-styled-input" />
              </div>
            </div>

            <div class="form-section-label">Gifting Requirement</div>

            <div class="form-field">
              <label for="enquiry-category">Category of Interest</label>
              <select id="enquiry-category" class="form-styled-select">
                <option value="corporate-kits">Corporate Onboarding &amp; VIP Kits</option>
                <option value="pens">Engraved Executive Pens</option>
                <option value="bottles">Stainless Steel Insulated Bottles</option>
                <option value="pillows">Customized Fur &amp; Heart Cushions</option>
                <option value="combo-sets">Luxury Combo Gift Boxes</option>
                <option value="keychains">Metal &amp; Leather Keychains</option>
                <option value="machines">Sublimation Machinery &amp; Blanks</option>
                <option value="other">Other Bespoke Requirement</option>
              </select>
            </div>

            <div class="form-field">
              <label for="enquiry-company">Company / Event Occasion (Optional)</label>
              <input type="text" id="enquiry-company" placeholder="e.g. Infosys, Wedding, Milestone" class="form-styled-input" />
            </div>

            <div class="form-field">
              <label for="enquiry-notes">Customization Requirements &amp; Timeline</label>
              <textarea id="enquiry-notes" rows="3" placeholder="Tell us if you need laser engraving, full color printing, company logo, delivery city, or required date..." class="form-styled-textarea"></textarea>
            </div>

            <div class="enquiry-form-actions">
              <button type="submit" class="btn btn-gd-primary btn-submit-enquiry">
                <span>Submit Official Enquiry →</span>
              </button>
            </div>
          </form>

          <div class="enquiry-security-notice">
            <span>${icon.lock} Direct inquiry to Gifting Destiny atelier in Prem Nagar, Bengaluru. No spam guaranteed.</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderActiveModal(state) {
  const modal = state.activeModal;
  if (!modal) return '';

  if (modal.type === 'account') {
    return `
      <div class="modal-overlay active" id="active-modal-overlay">
        <div class="modal-card modal-account">
          <button class="modal-close-btn" id="modal-close-btn">&times;</button>
          
          <div class="modal-header">
            <span class="modal-icon">${icon.user}</span>
            <h3 class="modal-title">Gifting Destiny Account</h3>
            <p class="modal-subtitle">Track orders, manage saved gifts, and review corporate inquiries.</p>
          </div>

          <div class="account-notice-box">
            <p>
              Your account &amp; order history are secured through Gifting Destiny's official WordPress WooCommerce portal.
            </p>
            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="https://giftingdestiny.com/my-account/" target="_blank" rel="noopener" class="btn btn-gd-primary">
                <span>Open Official WooCommerce My Account →</span>
              </a>
              <a href="https://wa.me/${GD_PHONE}?text=Hi%20Gifting%20Destiny,%20I%20want%20to%20track%20my%20order" target="_blank" rel="noopener" class="btn btn-whatsapp-order">
                <span>${icon.whatsapp} Track Order on WhatsApp (+91 8660940018)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (modal.type === 'wishlist') {
    const savedProducts = state.wishlist
      .map(id => csvProducts.find(product => product.id === id))
      .filter(Boolean);
    return `
      <div class="modal-overlay active" id="active-modal-overlay">
        <div class="modal-card modal-wishlist" role="dialog" aria-modal="true" aria-label="Saved wishlist">
          <button class="modal-close-btn" id="modal-close-btn" aria-label="Close wishlist">&times;</button>
          <div class="modal-header">
            <span class="modal-icon" aria-hidden="true">${icon.heart}</span>
            <h3 class="modal-title">Your Saved Gifts</h3>
            <p class="modal-subtitle">${savedProducts.length} item${savedProducts.length === 1 ? '' : 's'} saved for later</p>
          </div>
          ${savedProducts.length ? `
            <div class="wishlist-items">
              ${savedProducts.map(product => `
                <article class="wishlist-item">
                  <img src="${product.primaryImage}" alt="${product.name}" loading="lazy" />
                  <div class="wishlist-item-copy">
                    <span>${product.primaryCategory || 'Gift'}</span>
                    <h4>${product.name}</h4>
                    <button type="button" class="wishlist-view-link" data-action="view-pdp" data-id="${product.id}">View product →</button>
                  </div>
                  <button type="button" class="wishlist-remove" data-action="wishlist" data-id="${product.id}" aria-label="Remove ${product.name} from saved gifts">Remove</button>
                </article>
              `).join('')}
            </div>
          ` : `
            <div class="wishlist-empty">
              <p>Your saved list is empty. Tap the heart on any product to keep it here.</p>
              <button type="button" class="btn btn-gd-primary" id="wishlist-browse-btn" data-view="shop">Browse gifts</button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  if (modal.type === 'quickView') {
    const product = csvProducts.find(p => p.id === modal.data?.id);
    if (!product) return '';

    return `
      <div class="modal-overlay active" id="active-modal-overlay">
        <div class="modal-card modal-quickview">
          <button class="modal-close-btn" id="modal-close-btn">&times;</button>
          
          <div class="quickview-layout">
            <div class="quickview-img-wrap">
              <img src="${product.primaryImage}" alt="${product.name}" id="qv-main-img" />
            </div>

            <div class="quickview-info">
              <span class="quickview-cat">${product.primaryCategory}</span>
              <h2 class="quickview-title">${product.name}</h2>
              <div class="quickview-stock">
                <span class="stock-dot"></span> In Stock &amp; Customization Ready
              </div>

              <div class="quickview-desc">
                ${product.description ? product.description.substring(0, 300) + '...' : ''}
              </div>

              <div class="quickview-actions">
                <button type="button" class="btn btn-gd-primary" id="qv-goto-pdp" data-id="${product.id}">
                  <span>View Full Product Page</span>
                  <span>→</span>
                </button>
                <button type="button" class="btn btn-buy-now" id="qv-whatsapp-btn" data-action="buy-now" data-id="${product.id}">
                  <span>${icon.bag} Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}
