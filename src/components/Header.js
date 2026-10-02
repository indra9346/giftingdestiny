import { store } from '../utils/store.js';
import { categories } from '../data/categories.js';
import { icon } from './icons.js';

export function renderHeader(state) {
  const cartCount = store.getCartCount();
  const wishlistCount = state.wishlist.length;

  return `
    <header class="site-header">
      <!-- Main Header Row -->
      <div class="header-main">
        <div class="container header-container">
          <!-- Brand Logo -->
          <a href="#" class="brand-logo" data-view="home" aria-label="Gifting Destiny Home">
            <img src="https://giftingdestiny.com/wp-content/uploads/2026/01/cropped-546388500_759687593642332_2147221703036924897_n.png" alt="Gifting Destiny Logo" class="brand-logo-img" />
            <div class="brand-text">
              <span class="brand-title">Gifting Destiny</span>
              <span class="brand-tagline">Crafted with Love &amp; Care</span>
            </div>
          </a>

          <!-- Prominent Search Bar (Real-time Instant Search with Autocomplete Panel) -->
          <div class="header-search-box">
            <form id="header-search-form" class="search-form" role="search">
              <div class="search-input-wrapper">
                <span class="search-icon">${icon.search}</span>
                <input 
                  type="text" 
                  id="header-search-input" 
                  placeholder="Search 118 gifts by name, SKU, category..." 
                  value="${state.searchQuery || ''}"
                  autocomplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-dropdown"
                />
                <button 
                  type="button" 
                  id="header-search-clear" 
                  class="search-clear-btn" 
                  aria-label="Clear search query"
                  style="${state.searchQuery ? 'display: block;' : 'display: none;'}"
                >
                  ✕
                </button>
              </div>
              <button type="submit" class="search-submit-btn">Search</button>

              <!-- Live Autocomplete Suggestion Dropdown -->
              <div id="search-suggestions-dropdown" class="search-suggestions-dropdown" style="display: none;" role="listbox"></div>
            </form>
          </div>

          <!-- Header Right Actions (Account, Wishlist & Cart/Inquiry Controls, NO phone/email) -->
          <div class="header-actions">
            <!-- Account / Profile Button -->
            <button class="action-btn account-action-btn" id="header-account-btn" title="My Account" aria-label="My Account">
              <span class="action-icon">${icon.user}</span>
              <span class="action-label">Account</span>
            </button>

            <!-- Wishlist Button -->
            <button class="action-btn wishlist-action-btn" id="header-wishlist-btn" title="Saved Wishlist" aria-label="Wishlist">
              <span class="action-icon">${icon.heart}</span>
              ${wishlistCount > 0 ? `<span class="action-badge">${wishlistCount}</span>` : ''}
              <span class="action-label">Wishlist</span>
            </button>

            <!-- Order / Inquiry Bag Button -->
            <div class="cart-order-group">
              <button class="action-btn cart-action-btn ${cartCount ? 'has-items' : ''}" id="header-cart-btn" title="Your order bag" aria-label="Order bag with ${cartCount} items" style="--bag-fill:${Math.min(cartCount * 12, 100)}%">
                <div class="cart-icon-wrapper">
                  <span class="action-icon">${icon.bag}</span>
                  <span class="cart-badge ${cartCount ? 'has-items' : ''}">${cartCount}</span>
                </div>
                <div class="cart-btn-text">
                  <span class="cart-btn-title">Your Bag</span>
                  <span class="cart-btn-sub">${cartCount} item${cartCount === 1 ? '' : 's'}</span>
                </div>
              </button>
              ${cartCount ? '<button type="button" class="cart-place-order" id="header-place-order-btn">Place Order</button>' : ''}
            </div>

            <!-- Mobile Hamburger Toggle -->
            <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Open navigation menu" aria-controls="mobile-drawer-overlay" aria-expanded="false">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Category Navigation Sub-Bar (Printsoon & GD Inspired) -->
      <nav class="header-nav-bar" id="header-nav-bar">
        <div class="container nav-scroll-container">
          <ul class="category-nav-list">
            <li>
              <a href="#" class="nav-item ${state.currentView === 'home' ? 'active' : ''}" data-view="home">
                Home
              </a>
            </li>
            <li>
              <a href="#" class="nav-item ${state.currentView === 'shop' && state.selectedCategory === 'all' ? 'active' : ''}" data-view="shop" data-cat="all">
                All Products
              </a>
            </li>
            ${categories.map(cat => `
              <li>
                <a href="#" class="nav-item ${state.currentView === 'shop' && state.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                  ${cat.name}
                </a>
              </li>
            `).join('')}
            <li>
              <a href="#" class="nav-item ${state.currentView === 'corporate' ? 'active' : ''}" data-view="corporate">
                Corporate Gifting
              </a>
            </li>
            <li>
              <a href="#" class="nav-item ${state.currentView === 'about' ? 'active' : ''}" data-view="about">
                About Us
              </a>
            </li>
            <li>
              <a href="#" class="nav-item ${state.currentView === 'contact' ? 'active' : ''}" data-view="contact">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer-overlay" id="mobile-drawer-overlay">
        <div class="mobile-drawer" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div class="mobile-drawer-header">
            <div class="mobile-brand">
              <img src="https://giftingdestiny.com/wp-content/uploads/2026/01/cropped-546388500_759687593642332_2147221703036924897_n.png" alt="Gifting Destiny Logo" />
              <span>Gifting Destiny</span>
            </div>
            <button class="mobile-drawer-close" id="mobile-drawer-close-btn" type="button" aria-label="Close navigation menu">&times;</button>
          </div>

          <div class="mobile-search-wrapper">
            <form id="mobile-search-form" class="search-form">
              <input type="text" id="mobile-search-input" placeholder="Search gifts..." value="${state.searchQuery || ''}" />
              <button type="submit" class="search-submit-btn">Go</button>
            </form>
          </div>

          <div class="mobile-drawer-nav">
            <div class="mobile-nav-title">Categories</div>
            <ul class="mobile-category-list">
              <li><a href="#" class="mobile-nav-link" data-cat="all">All Products (118)</a></li>
              ${categories.map(c => `
                <li><a href="#" class="mobile-nav-link" data-cat="${c.id}">${c.name} (${c.count})</a></li>
              `).join('')}
            </ul>

            <div class="mobile-nav-title" style="margin-top: 1.5rem;">Explore More</div>
            <ul class="mobile-category-list">
              <li><a href="#" class="mobile-nav-link" data-view="home">Home</a></li>
              <li><a href="#" class="mobile-nav-link" data-view="corporate">Corporate Gifting (B2B)</a></li>
              <li><a href="#" class="mobile-nav-link" data-view="about">About Atelier</a></li>
              <li><a href="#" class="mobile-nav-link" data-view="contact">Contact &amp; Workshop</a></li>
              <li><a href="#" class="mobile-nav-link" data-view="faq">FAQs &amp; Orders</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `;
}
