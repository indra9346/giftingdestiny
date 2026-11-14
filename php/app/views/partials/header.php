<?php
/** @var string $page  @var string $category */
$cats = gd_categories();
$isShopAll = $page === 'shop' && ($category === 'all' || $category === '');
$query = isset($_GET['q']) && is_string($_GET['q']) ? $_GET['q'] : '';
$blogActive = $page === 'blog' || $page === 'blogPost';
?>
    <header class="site-header">
      <!-- Main Header Row -->
      <div class="header-main">
        <div class="container header-container">
          <!-- Brand Logo -->
          <a href="<?= e(url('/')) ?>" class="brand-logo" aria-label="Gifting Destiny Home">
            <img src="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>" alt="Gifting Destiny logo" class="brand-logo-img" width="48" height="48" />
            <div class="brand-text">
              <span class="brand-title">Gifting Destiny</span>
              <span class="brand-tagline">Crafted with Love &amp; Care</span>
            </div>
          </a>

          <!-- Prominent Search Bar (Real-time Instant Search with Autocomplete Panel) -->
          <div class="header-search-box">
            <form id="header-search-form" class="search-form" role="search" action="<?= e(url('/shop')) ?>" method="get">
              <div class="search-input-wrapper">
                <span class="search-icon"><?= icon('search') ?></span>
                <input
                  type="text"
                  id="header-search-input"
                  name="q"
                  placeholder="Search <?= count(gd_products()) ?> gifts by name, category..."
                  value="<?= e($query) ?>"
                  autocomplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-dropdown"
                />
                <button
                  type="button"
                  id="header-search-clear"
                  class="search-clear-btn"
                  aria-label="Clear search query"
                  style="<?= $query !== '' ? 'display: block;' : 'display: none;' ?>"
                >
                  ✕
                </button>
              </div>
              <button type="submit" class="search-submit-btn">Search</button>

              <!-- Live Autocomplete Suggestion Dropdown -->
              <div id="search-suggestions-dropdown" class="search-suggestions-dropdown" style="display: none;" role="listbox"></div>
            </form>
          </div>

          <!-- Header Right Actions: Blogs is always on top (phone and computer), never only inside a menu -->
          <div class="header-actions">
            <a href="<?= e(url('/blog')) ?>" class="header-blogs-btn<?= $blogActive ? ' active' : '' ?>" id="header-blogs-btn" title="Read our Blogs"<?= $blogActive ? ' aria-current="page"' : '' ?>>
              <span class="header-blogs-icon" aria-hidden="true"><?= icon('book') ?></span>
              <span class="header-blogs-label">Blogs</span>
            </a>

            <!-- Account / Profile Button -->
            <button class="action-btn account-action-btn" id="header-account-btn" title="My Account" aria-label="My Account">
              <span class="action-icon"><?= icon('user') ?></span>
              <span class="action-label">Account</span>
            </button>

            <!-- Wishlist Button -->
            <button class="action-btn wishlist-action-btn" id="header-wishlist-btn" title="Saved Wishlist" aria-label="Wishlist">
              <span class="action-icon"><?= icon('heart') ?></span>
              <span class="action-label">Wishlist</span>
            </button>

            <!-- Order / Inquiry Bag Button -->
            <div class="cart-order-group">
              <button class="action-btn cart-action-btn" id="header-cart-btn" title="Your order bag" aria-label="Order bag with 0 items" style="--bag-fill:0%">
                <div class="cart-icon-wrapper">
                  <span class="action-icon"><?= icon('bag') ?></span>
                  <span class="cart-badge">0</span>
                </div>
                <div class="cart-btn-text">
                  <span class="cart-btn-title">Your Bag</span>
                  <span class="cart-btn-sub">0 items</span>
                </div>
              </button>
              <button type="button" class="cart-place-order" id="header-place-order-btn" hidden>Place Order</button>
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

      <!-- Category Navigation Sub-Bar -->
      <nav class="header-nav-bar" id="header-nav-bar">
        <div class="container nav-scroll-container">
          <ul class="category-nav-list">
            <li>
              <a href="<?= e(url('/')) ?>" class="nav-item <?= $page === 'home' ? 'active' : '' ?>">
                Home
              </a>
            </li>
            <li>
              <a href="<?= e(url('/shop')) ?>" class="nav-item <?= $isShopAll ? 'active' : '' ?>">
                All Products
              </a>
            </li>
<?php foreach ($cats as $cat): ?>
            <li>
              <a href="<?= e(url('/shop?category=' . $cat['id'])) ?>" class="nav-item <?= $page === 'shop' && gd_canonical_category($category) === $cat['id'] ? 'active' : '' ?>">
                <?= e($cat['name']) ?>

              </a>
            </li>
<?php endforeach; ?>
            <li>
              <a href="<?= e(url('/corporate')) ?>" class="nav-item <?= $page === 'corporate' ? 'active' : '' ?>">
                Corporate Gifting
              </a>
            </li>
            <li>
              <a href="<?= e(url('/about')) ?>" class="nav-item <?= $page === 'about' ? 'active' : '' ?>">
                About Us
              </a>
            </li>
            <li>
              <a href="<?= e(url('/contact')) ?>" class="nav-item <?= $page === 'contact' ? 'active' : '' ?>">
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
              <img src="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>" alt="Gifting Destiny logo" width="40" height="40" />
              <span>Gifting Destiny</span>
            </div>
            <button class="mobile-drawer-close" id="mobile-drawer-close-btn" type="button" aria-label="Close navigation menu">&times;</button>
          </div>

          <div class="mobile-search-wrapper">
            <form id="mobile-search-form" class="search-form" action="<?= e(url('/shop')) ?>" method="get">
              <input type="text" id="mobile-search-input" name="q" placeholder="Search gifts..." value="<?= e($query) ?>" />
              <button type="submit" class="search-submit-btn">Go</button>
            </form>
          </div>

          <div class="mobile-drawer-nav">
            <div class="mobile-nav-title">Categories</div>
            <ul class="mobile-category-list">
              <li><a href="<?= e(url('/shop')) ?>" class="mobile-nav-link">All Products (<?= count(gd_products()) ?>)</a></li>
<?php foreach ($cats as $c): ?>
              <li><a href="<?= e(url('/shop?category=' . $c['id'])) ?>" class="mobile-nav-link"><?= e($c['name']) ?> (<?= (int)$c['count'] ?>)</a></li>
<?php endforeach; ?>
            </ul>

            <div class="mobile-nav-title" style="margin-top: 1.5rem;">Explore More</div>
            <ul class="mobile-category-list">
              <li><a href="<?= e(url('/')) ?>" class="mobile-nav-link">Home</a></li>
              <li><a href="<?= e(url('/corporate')) ?>" class="mobile-nav-link">Corporate Gifting (B2B)</a></li>
              <li><a href="<?= e(url('/about')) ?>" class="mobile-nav-link">About Atelier</a></li>
              <li><a href="<?= e(url('/contact')) ?>" class="mobile-nav-link">Contact &amp; Workshop</a></li>
              <li><a href="<?= e(url('/faq')) ?>" class="mobile-nav-link">FAQs &amp; Orders</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
