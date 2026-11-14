<?php
/** @var string $content  @var string $page */
$defaultTitle = 'Gifting Destiny – Your One-Stop Destination for Meaningful & Memorable Gifts';
$defaultDescription = "Bengaluru's premier bespoke gifting atelier. Discover personalized sublimation mugs, laser-etched executive pens, VIP corporate hampers, heart cushions, and custom LED frames crafted with love & care.";
$pageTitle = $title ?? $defaultTitle;
$pageDescription = $description ?? $defaultDescription;
$shareImage = $ogImage ?? absolute_url('/assets/share-preview-logo.png');
$canonical = absolute_url(gd_request_path() === '/' ? '/' : gd_request_path())
    . (gd_request_path() === '/shop' && !empty($category) && $category !== 'all' ? '?category=' . rawurlencode($category) : '');
?><!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= e(GD_GA_ID) ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '<?= e(GD_GA_ID) ?>');
    </script>
    <script>
      // Links from the previous site (#/product/..., #/blog/...) open the matching page.
      (function () {
        var h = location.hash;
        if (h.indexOf('#/') !== 0) return;
        var route = h.slice(1), base = <?= json_encode(gd_base()) ?>;
        if (route === '/' || route === '') { history.replaceState(null, '', base + '/'); return; }
        location.replace(base + route);
      })();
    </script>
    <link rel="icon" type="image/jpeg" href="<?= e(url('/assets/gifting-destiny-original-logo.jpg')) ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($pageDescription) ?>" />
<?php if (!empty($keywords)): ?>
    <meta name="keywords" content="<?= e($keywords) ?>" />
<?php endif; ?>
<?php if (!empty($robots)): ?>
    <meta name="robots" content="<?= e($robots) ?>" />
<?php endif; ?>
    <link rel="canonical" href="<?= e($canonical) ?>" />

    <!-- Open Graph / Meta -->
    <meta property="og:title" content="<?= e($title ?? 'Gifting Destiny – Crafted with Love & Care') ?>" />
    <meta property="og:description" content="<?= e($description ?? 'Personalized Gifts, Sublimation Creations & Luxury Corporate Hampers Handcrafted in Bengaluru.') ?>" />
    <meta property="og:image" content="<?= e($shareImage) ?>" />
    <meta property="og:image:secure_url" content="<?= e($shareImage) ?>" />
<?php if (empty($ogImage)): ?>
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="204" />
    <meta property="og:image:height" content="203" />
<?php endif; ?>
    <meta property="og:type" content="<?= e($ogType ?? 'website') ?>" />
    <meta property="og:url" content="<?= e($canonical) ?>" />
    <meta property="og:site_name" content="Gifting Destiny" />

    <!-- Social link previews -->
    <meta name="twitter:card" content="<?= empty($ogImage) ? 'summary' : 'summary_large_image' ?>" />
    <meta name="twitter:title" content="<?= e($title ?? 'Gifting Destiny – Crafted with Love & Care') ?>" />
    <meta name="twitter:description" content="<?= e($description ?? 'Personalized Gifts, Sublimation Creations & Luxury Corporate Hampers Handcrafted in Bengaluru.') ?>" />
    <meta name="twitter:image" content="<?= e($shareImage) ?>" />

    <!-- Preconnect Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(asset('/gd-assets/css/style.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('/gd-assets/css/blog.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('/gd-assets/css/storefront.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('/gd-assets/css/site.css')) ?>">
  </head>
  <body data-page="<?= e($page) ?>">
    <div id="app">
      <?= view('partials/header', ['page' => $page, 'category' => $category ?? 'all']) ?>
      <script>
        // Bag and wishlist counts come from this browser, so fill them in before the page shows.
        (function () {
          try {
            var cart = JSON.parse(localStorage.getItem('gd-cart') || '[]'), wish = JSON.parse(localStorage.getItem('gd-wishlist') || '[]');
            var count = 0;
            if (Array.isArray(cart)) cart.forEach(function (i) { count += Math.max(0, parseInt(i && i.quantity, 10) || 0); });
            window.__gdHeaderCounts = { cart: count, wishlist: Array.isArray(wish) ? wish.length : 0 };
            var btn = document.getElementById('header-cart-btn');
            if (count && btn) {
              btn.classList.add('has-items');
              btn.style.setProperty('--bag-fill', Math.min(count * 12, 100) + '%');
              btn.setAttribute('aria-label', 'Order bag with ' + count + ' items');
              btn.querySelector('.cart-badge').textContent = count;
              btn.querySelector('.cart-badge').classList.add('has-items');
              btn.querySelector('.cart-btn-sub').textContent = count + ' item' + (count === 1 ? '' : 's');
              var place = document.getElementById('header-place-order-btn');
              if (place) place.hidden = false;
            }
            var wl = window.__gdHeaderCounts.wishlist, wbtn = document.getElementById('header-wishlist-btn');
            if (wl && wbtn) {
              var badge = document.createElement('span');
              badge.className = 'action-badge';
              badge.textContent = wl;
              wbtn.insertBefore(badge, wbtn.querySelector('.action-label'));
            }
          } catch (err) {}
        })();
      </script>
      <main><?= $content ?></main>
      <?= view('partials/footer') ?>
      <div id="cart-drawer-root"></div>
      <?= view('partials/enquiry-drawer') ?>
      <div id="modal-root"></div>
    </div>
    <div id="toast-container" class="toast-container"></div>
    <script>
      window.GD = {
        base: <?= json_encode(gd_base()) ?>,
        phone: <?= json_encode(GD_PHONE) ?>,
        page: <?= json_encode($page) ?>,
        productCount: <?= count(gd_products()) ?>
      };
    </script>
    <script src="<?= e(asset('/gd-assets/js/confetti.browser.js')) ?>" defer></script>
    <script src="<?= e(asset('/gd-assets/js/site.js')) ?>" defer></script>
  </body>
</html>
