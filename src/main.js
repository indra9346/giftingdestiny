import './style.css';
import { store } from './utils/store.js';
import { csvProducts } from './data/csvProducts.js';
import { categories, matchProductCategory, getCategoryBySlugOrAlias } from './data/categories.js';

import { renderHeader } from './components/Header.js';
import { renderHero } from './components/Hero.js';
import { renderCollectionSlider } from './components/CollectionSlider.js';
import { renderProductCatalog } from './components/ProductCatalog.js';
import { renderProductDetail } from './components/ProductDetail.js';
import { renderCorporateGifting } from './components/CorporateGifting.js';
import { renderAboutSection } from './components/AboutSection.js';
import { renderShowcaseGallery } from './components/ShowcaseGallery.js';
import { renderContactSection } from './components/ContactSection.js';
import { renderBlogPage } from './components/BlogPage.js';
import { renderFaqPage } from './components/FaqPage.js';
import { renderFooter } from './components/Footer.js';
import { renderCartDrawer, renderEnquiryDrawer, renderActiveModal } from './components/Modals.js';
import confetti from 'canvas-confetti';

const GD_PHONE = '918660940018'; // Verified from live site footer in Pic 4
let collectionAutoScrollFrame = null;
let heroHeaderObserver = null;
let heroViewportResizeHandler = null;

function openCartOrderWhatsApp() {
  const items = store.state.cart;
  if (!items.length) return;

  const lines = items.map((item, index) => {
    const product = csvProducts.find(entry => entry.id === item.id);
    return [
      `${index + 1}. *${item.name}* (ID: GD-${item.id})`,
      `   Category: ${item.category}`,
      `   Quantity: ${item.quantity}`,
      item.customNotes ? `   Personalization: ${item.customNotes}` : '',
      item.logoRequirement ? '   Company logo: Yes' : '',
      product?.slug ? `   Product: https://giftingdestiny.com/product/${product.slug}` : ''
    ].filter(Boolean).join('\n');
  }).join('\n\n');
  const message = `Hello Gifting Destiny! I would like to place an order for:\n\n${lines}\n\nTotal quantity: ${store.getCartCount()} item(s). Please confirm pricing, mock-up and delivery schedule.`;
  window.open(`https://wa.me/${GD_PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function animateProductIntoBag(source, product) {
  const sourceImage = source.closest('.product-card')?.querySelector('.product-card-img')
    || document.getElementById('qv-main-img')
    || document.getElementById('pdp-main-image');
  const bagIcon = document.querySelector('#header-cart-btn .cart-icon-wrapper');
  if (!sourceImage || !bagIcon || !sourceImage.getBoundingClientRect().width) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bagIcon.classList.add('bag-impact');
    window.setTimeout(() => bagIcon.classList.remove('bag-impact'), 550);
    return;
  }

  const from = sourceImage.getBoundingClientRect();
  const to = bagIcon.getBoundingClientRect();
  const flight = document.createElement('div');
  flight.className = 'buy-now-flight';
  flight.style.left = `${from.left + from.width / 2 - 38}px`;
  flight.style.top = `${from.top + from.height / 2 - 38}px`;
  const image = document.createElement('img');
  image.src = sourceImage.currentSrc || sourceImage.src;
  image.alt = '';
  const label = document.createElement('span');
  label.textContent = product.name;
  flight.append(image, label);
  document.body.appendChild(flight);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const motion = flight.animate([
    { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', opacity: 1 },
    { offset: 0.72, transform: `translate3d(${dx * 0.78}px,${dy * 0.78}px,0) scale(.72) rotate(8deg)`, opacity: 1 },
    { transform: `translate3d(${dx}px,${dy}px,0) scale(.18) rotate(16deg)`, opacity: 0.15 }
  ], { duration: 850, easing: 'cubic-bezier(.2,.78,.25,1)', fill: 'forwards' });
  motion.onfinish = () => {
    flight.remove();
    document.querySelector('#header-cart-btn .cart-icon-wrapper')?.classList.add('bag-impact');
    window.setTimeout(() => document.querySelector('#header-cart-btn .cart-icon-wrapper')?.classList.remove('bag-impact'), 550);
  };
}

function bindSiteImageHandling() {
  const handleImageFailure = image => {
    if (!(image instanceof HTMLImageElement) || image.dataset.siteImageFailed === 'true') return;

    // Prefer the shipped local brand mark when a remote logo URL fails.
    const isBrandMark = image.classList.contains('brand-logo-img')
      || image.classList.contains('footer-logo-img-large')
      || image.alt?.toLowerCase().includes('logo');
    if (isBrandMark && !image.dataset.localLogoAttempted && !image.src.endsWith('/favicon.svg')) {
      image.dataset.localLogoAttempted = 'true';
      image.src = '/favicon.svg';
      return;
    }

    const productId = image.closest('[data-product-id]')?.dataset.productId
      || (image.id === 'pdp-main-image' || image.closest('.pdp-thumbnails-strip') ? store.state.selectedProductId : null);
    const product = csvProducts.find(item => item.id === productId);
    // Try only genuine alternate photos belonging to this product.
    const options = product ? [...new Set([
      ...(Array.isArray(product.images) ? product.images : []),
      product.secondaryImage,
      product.primaryImage
    ].filter(Boolean))] : [];

    const failed = new Set(JSON.parse(image.dataset.failedImageUrls || '[]'));
    failed.add(image.currentSrc || image.src);
    image.dataset.failedImageUrls = JSON.stringify([...failed]);
    const next = options.find(url => {
      try { return !failed.has(new URL(url, window.location.href).href); } catch { return false; }
    });

    if (next) {
      image.src = next;
      return;
    }

    image.dataset.siteImageFailed = 'true';
    const thumbnail = image.closest('.pdp-thumb-btn');
    if (thumbnail) {
      thumbnail.hidden = true;
      return;
    }

    const label = product?.name || image.alt || 'Photo temporarily unavailable';
    const fallback = document.createElement('div');
    fallback.className = 'product-image-fallback site-image-fallback';
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', `Photo unavailable for ${label}`);
    fallback.innerHTML = `
      <svg class="site-image-fallback-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <circle cx="8.5" cy="9" r="1.5"></circle>
        <path d="m21 15-5-5L5 20"></path>
      </svg>
      <span class="site-image-fallback-label"></span>
    `;
    fallback.querySelector('.site-image-fallback-label').textContent = label;
    image.replaceWith(fallback);
  };

  // Decode off the main thread where supported, and let the browser defer images
  // outside the first viewport. Keep branding and lead product photography eager.
  document.querySelectorAll('img').forEach(image => {
    image.decoding = 'async';
    const isLeadImage = image.closest('.site-header, .hero-section, .hero-video-section')
      || image.id === 'pdp-main-image'
      || image.id === 'qv-main-img';
    if (!image.hasAttribute('loading')) image.loading = isLeadImage ? 'eager' : 'lazy';
    if (isLeadImage) image.fetchPriority = 'high';
    // Cached failures can predate listener registration; send them through the
    // same recovery path after the event handler below is ready.
  });

  // Capture image errors so this also covers images created later (for example,
  // search suggestions and modal contents), not just the initial page markup.
  if (!document.documentElement.dataset.siteImageErrorsBound) {
    document.documentElement.dataset.siteImageErrorsBound = 'true';
    document.addEventListener('error', event => handleImageFailure(event.target), true);
  }
  document.querySelectorAll('img').forEach(image => {
    if (image.complete && image.naturalWidth === 0) queueMicrotask(() => handleImageFailure(image));
  });
}

function readPdpPersonalization() {
  const text = document.getElementById('pdp-custom-text')?.value.trim() || '';
  const activeColor = document.querySelector('.print-color-swatch.active');
  const activeStyle = document.querySelector('.print-style-option.active');
  const colorName = activeColor?.getAttribute('aria-label') || '';
  const styleName = activeStyle?.textContent.trim() || '';
  return {
    text: text ? `${text}${colorName ? ` (Print color: ${colorName})` : ''}${styleName ? ` (Lettering: ${styleName})` : ''}` : '',
    color: activeColor?.dataset.printColor || '#172554'
  };
}

function updateDrinkwarePreview() {
  const input = document.getElementById('pdp-custom-text');
  const preview = document.getElementById('drinkware-print-preview');
  if (!input || !preview) return;
  const text = input.value.trim();
  preview.textContent = text;
  preview.hidden = !text;
  preview.style.setProperty('--print-color', document.querySelector('.print-color-swatch.active')?.dataset.printColor || '#172554');
  preview.style.setProperty('--print-scale', String(Math.max(0.68, 1 - Math.max(0, text.length - 14) * 0.018)));
  preview.dataset.printStyle = document.querySelector('.print-style-option.active')?.dataset.printStyle || 'serif';
}

function renderApp() {
  const app = document.getElementById('app');
  const state = store.state;
  const oldVideo = document.getElementById('hero-bgv');
  const videoPosition = oldVideo && !oldVideo.paused ? oldVideo.currentTime : null;

  let mainContent = '';

  if (state.currentView === 'home') {
    mainContent = `
      ${renderHero()}
      ${renderCollectionSlider()}
      ${renderAboutSection(false)}
      ${renderCorporateGifting()}
      ${renderProductCatalog(state, false)}
      ${renderShowcaseGallery()}
      ${renderContactSection()}
    `;
  } else if (state.currentView === 'shop') {
    const activeCatObj = getCategoryBySlugOrAlias(state.selectedCategory);
    const catTitle = activeCatObj ? activeCatObj.name : (state.selectedCategory === 'all' ? 'All Collections' : (state.selectedCategory || 'Catalogue'));
    const catSubtitle = activeCatObj 
      ? (activeCatObj.description || `${activeCatObj.name} collection (${activeCatObj.count} items)`)
      : 'Browse 118 authentic personalized gifts, laser engraved stationery, and sublimation blanks.';

    mainContent = `
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">✦ BENGALURU ATELIER CATALOGUE</div>
          <h1 class="page-hero-title">${catTitle}</h1>
          <p class="page-hero-subtitle">
            ${catSubtitle}
          </p>
        </div>
      </div>
      ${renderProductCatalog(state, true)}
    `;
  } else if (state.currentView === 'product') {
    mainContent = renderProductDetail(state);
  } else if (state.currentView === 'corporate') {
    mainContent = `
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">🏢 ENTERPRISE &amp; BULK SOLUTIONS</div>
          <h1 class="page-hero-title">Corporate Gifting Solutions</h1>
          <p class="page-hero-subtitle">
            Curated onboarding hampers, client appreciation gifts, and event giveaways with custom logo branding.
          </p>
        </div>
      </div>
      ${renderCorporateGifting()}
      ${renderShowcaseGallery()}
      ${renderContactSection()}
    `;
  } else if (state.currentView === 'about') {
    mainContent = `
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">📍 OUR HERITAGE</div>
          <h1 class="page-hero-title">The Gifting Destiny Story</h1>
          <p class="page-hero-subtitle">
            Prem Nagar, Bengaluru bespoke personalization studio — crafted with love and care.
          </p>
        </div>
      </div>
      ${renderAboutSection(true)}
      ${renderShowcaseGallery()}
    `;
  } else if (state.currentView === 'contact') {
    mainContent = `
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">💬 REACH OUR ATELIER</div>
          <h1 class="page-hero-title">Contact &amp; Studio Inquiries</h1>
          <p class="page-hero-subtitle">
            Outer Ring Road, Prem Nagar, Bengaluru workshop visits, quotes, and sample requests.
          </p>
        </div>
      </div>
      ${renderContactSection()}
    `;
  } else if (state.currentView === 'blog') {
    mainContent = renderBlogPage();
  } else if (state.currentView === 'faq') {
    mainContent = renderFaqPage();
  }

  app.innerHTML = `
    ${renderHeader(state)}
    <main>${mainContent}</main>
    ${renderFooter()}
    ${renderCartDrawer(state)}
    ${renderEnquiryDrawer(state)}
    ${renderActiveModal(state)}
  `;

  bindEvents();
  bindSiteImageHandling();

  const newVideo = document.getElementById('hero-bgv');
  if (newVideo) {
    const header = document.querySelector('.site-header');
    const fitHeroToViewport = () => {
      if (!header || !document.getElementById('hero-bgv')) return;
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const availableHeight = Math.max(320, Math.floor(viewportHeight - header.getBoundingClientRect().height));
      document.documentElement.style.setProperty('--hero-viewport-height', `${availableHeight}px`);
    };
    fitHeroToViewport();
    heroHeaderObserver?.disconnect();
    if (header && 'ResizeObserver' in window) {
      heroHeaderObserver = new ResizeObserver(fitHeroToViewport);
      heroHeaderObserver.observe(header);
    }
    if (heroViewportResizeHandler) {
      window.removeEventListener('resize', heroViewportResizeHandler);
      window.visualViewport?.removeEventListener('resize', heroViewportResizeHandler);
    }
    heroViewportResizeHandler = fitHeroToViewport;
    window.addEventListener('resize', heroViewportResizeHandler, { passive: true });
    window.visualViewport?.addEventListener('resize', heroViewportResizeHandler, { passive: true });

    // Play the cinematic background video at smooth 1.0x native motion
    newVideo.defaultPlaybackRate = 1.0;
    newVideo.playbackRate = 1.0;
    if (videoPosition !== null && Number.isFinite(videoPosition)) {
      newVideo.addEventListener('loadedmetadata', () => {
        try { newVideo.currentTime = videoPosition; } catch {}
        newVideo.playbackRate = 1.0;
      }, { once: true });
    }
    const videoSource = newVideo.querySelector('source');
    let triedBackupVideo = false;
    newVideo.addEventListener('error', () => {
      if (triedBackupVideo || !videoSource) return;
      triedBackupVideo = true;
      videoSource.src = '/gifting-destiny-brand-film.mp4';
      newVideo.load();
      newVideo.play().catch(() => {});
    });
    newVideo.addEventListener('canplay', () => newVideo.play().catch(() => {}), { once: true });
    newVideo.play().catch(() => {});
  }
}

function bindEvents() {
  document.querySelectorAll('[data-action="buy-now"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const product = csvProducts.find(item => item.id === btn.getAttribute('data-id'));
      if (!product) return;

      const isPdp = btn.id === 'pdp-whatsapp-btn';
      const isQuickView = store.state.activeModal?.type === 'quickView';
      const quantity = isPdp ? Math.max(1, parseInt(document.getElementById('pdp-qty-input')?.value || '1', 10)) : 1;
      const customNotes = isPdp ? readPdpPersonalization().text : '';
      const logoRequirement = isPdp && Boolean(document.getElementById('pdp-logo-check')?.checked);
      animateProductIntoBag(btn, product);
      if (isQuickView) store.closeModal();
      store.addToCart(product, { quantity, customNotes, logoRequirement });
      if (isPdp) store.toggleCartDrawer(true);
    });
  });

  document.querySelectorAll('[data-action="load-more-products"]').forEach(btn => {
    btn.addEventListener('click', () => store.loadMoreProducts());
  });

  // Navigation Links
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const view = el.getAttribute('data-view');
      const cat = el.getAttribute('data-cat') || 'all';
      if (el.id === 'cart-start-shopping-btn') store.navigateToCategory(cat);
      else store.setView(view, cat);
      closeMobileDrawer();
    });
  });

  // Category Filtering Links
  document.querySelectorAll('[data-cat]').forEach(el => {
    if (el.hasAttribute('data-view')) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = el.getAttribute('data-cat');
      store.navigateToCategory(cat);
      closeMobileDrawer();
    });
  });

  // Product Navigation (Clicking card or "View Details")
  document.querySelectorAll('[data-action="view-pdp"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pid = el.getAttribute('data-id') || el.closest('[data-product-id]')?.getAttribute('data-product-id');
      if (pid) {
        if (store.state.activeModal?.type === 'wishlist') store.closeModal();
        store.navigateToProduct(pid);
      }
    });
  });

  // Clicking anywhere on product card (except explicit buttons)
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const pid = card.getAttribute('data-product-id');
      if (pid) {
        store.navigateToProduct(pid);
      }
    });
  });

  // Collection Slider Horizontal Navigation (Pic 3 Sliding Behavior)
  bindCollectionSliderEvents();

  // Wishlist Toggle
  document.querySelectorAll('[data-action="wishlist"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pid = btn.getAttribute('data-id');
      if (pid) store.toggleWishlist(pid);
    });
  });

  // Live Search with Autocomplete & Keyboard Navigation
  initLiveSearch();

  const mobileSearchForm = document.getElementById('mobile-search-form');
  mobileSearchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('mobile-search-input');
    if (input) {
      store.setSearchQuery(input.value.trim());
      closeMobileDrawer();
    }
  });

  // Sorting in catalog
  const sortSelect = document.getElementById('catalog-sort-select');
  sortSelect?.addEventListener('change', (e) => {
    store.setSortBy(e.target.value);
  });

  // Header Account Button
  document.getElementById('header-account-btn')?.addEventListener('click', () => {
    store.openModal({ type: 'account' });
  });

  // Header Wishlist Button
  document.getElementById('header-wishlist-btn')?.addEventListener('click', () => {
    store.openModal({ type: 'wishlist' });
  });

  // Header Cart/Inquiry Button
  document.getElementById('header-cart-btn')?.addEventListener('click', () => {
    store.toggleCartDrawer(true);
  });
  document.getElementById('header-place-order-btn')?.addEventListener('click', openCartOrderWhatsApp);

  // Cart Drawer Close
  document.getElementById('cart-close-btn')?.addEventListener('click', () => {
    store.toggleCartDrawer(false);
  });
  document.getElementById('cart-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'cart-drawer-overlay') {
      store.toggleCartDrawer(false);
    }
  });

  // Cart Item Delta / Remove
  document.querySelectorAll('[data-cart-delta]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const delta = parseInt(btn.getAttribute('data-cart-delta'), 10);
      store.updateQuantity(idx, delta);
    });
  });

  document.querySelectorAll('[data-cart-quantity]').forEach(input => {
    input.addEventListener('change', () => {
      const idx = Number.parseInt(input.getAttribute('data-idx'), 10);
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
        input.value = store.state.cart[idx]?.quantity ?? 1;
        return;
      }
      store.setQuantity(idx, quantity);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') input.blur();
    });
  });

  document.querySelectorAll('[data-cart-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-cart-remove'), 10);
      store.removeFromCart(idx);
    });
  });

  // Place the complete bag order in the official WhatsApp chat.
  document.getElementById('cart-whatsapp-order-btn')?.addEventListener('click', () => {
    openCartOrderWhatsApp();
  });

  // Cart Quote Order Button
  document.getElementById('cart-quote-order-btn')?.addEventListener('click', () => {
    store.toggleCartDrawer(false);
    store.toggleEnquiryDrawer(true);
  });

  // --- ENQUIRY DRAWER EVENTS (Replaces page-2 popup) ---
  document.querySelectorAll('[data-action="open-enquiry"], [data-action="open-quote"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      store.toggleEnquiryDrawer(true);
    });
  });

  document.getElementById('enquiry-close-btn')?.addEventListener('click', () => {
    store.toggleEnquiryDrawer(false);
  });

  document.getElementById('enquiry-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'enquiry-drawer-overlay') {
      store.toggleEnquiryDrawer(false);
    }
  });

  document.getElementById('enquiry-drawer-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('enquiry-name')?.value || 'Client';
    const phone = document.getElementById('enquiry-phone')?.value;
    const qty = document.getElementById('enquiry-qty')?.value || '1';

    store.toggleEnquiryDrawer(false);
    store.showToast(`Thank you, ${name}! Your enquiry for ${qty} unit(s) has been received. Our studio will reach out at ${phone}.`, '✨');

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#800020', '#b8860b', '#2c3e50', '#ffffff']
    });
  });

  // Mobile Drawer Toggle
  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    const drawer = document.getElementById('mobile-drawer-overlay');
    if (drawer) drawer.classList.add('open');
    document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('mobile-drawer-close-btn')?.addEventListener('click', closeMobileDrawer);
  document.getElementById('mobile-drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'mobile-drawer-overlay') closeMobileDrawer();
  });

  // --- PRODUCT DETAIL PAGE (PDP) SPECIFIC EVENTS ---
  bindProductDetailEvents();

  // --- MODAL EVENTS ---
  bindModalEvents();

  // --- FORMS ---
  bindFormEvents();
}

function bindCollectionSliderEvents() {
  if (collectionAutoScrollFrame !== null) cancelAnimationFrame(collectionAutoScrollFrame);
  collectionAutoScrollFrame = null;
  const track = document.getElementById('collection-cards-track');
  const prevBtn = document.getElementById('collection-prev-btn');
  const nextBtn = document.getElementById('collection-next-btn');
  const dots = document.querySelectorAll('#collection-slider-dots .slider-dot');

  if (!track) return;

  const getScrollStep = () => {
    const firstCard = track.children[0];
    const secondCard = track.children[1];
    return firstCard && secondCard ? (secondCard.offsetLeft - firstCard.offsetLeft) : 300;
  };

  const getMaxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  let paused = false;
  let resumeTimer;
  let lastFrameTime = 0;
  const pauseAutoScroll = () => {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { paused = false; }, 4500);
  };

  prevBtn?.addEventListener('click', () => {
    pauseAutoScroll();
    const step = getScrollStep();
    const maxScroll = getMaxScroll();
    if (track.scrollLeft <= 10) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: -step, behavior: 'smooth' });
    }
  });

  nextBtn?.addEventListener('click', () => {
    pauseAutoScroll();
    const step = getScrollStep();
    const maxScroll = getMaxScroll();
    if (track.scrollLeft >= maxScroll - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: step, behavior: 'smooth' });
    }
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      pauseAutoScroll();
      const idx = parseInt(dot.getAttribute('data-slide-index'), 10);
      const card = track.children[idx];
      if (card) {
        track.scrollTo({ left: card.offsetLeft - track.children[0].offsetLeft, behavior: 'smooth' });
      }
    });
  });

  // Pause during direct touch/drag, wheel, or focus interaction
  track.addEventListener('focusin', () => { paused = true; });
  track.addEventListener('focusout', () => { paused = false; });
  track.addEventListener('pointerdown', pauseAutoScroll);
  track.addEventListener('wheel', pauseAutoScroll, { passive: true });

  track.addEventListener('scroll', () => {
    let activeIdx = 0;
    let closestDistance = Infinity;
    const origin = track.children[0] ? track.children[0].offsetLeft : 0;
    for (let index = 0; index < track.children.length; index += 1) {
      const card = track.children[index];
      const distance = Math.abs(card.offsetLeft - origin - track.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIdx = index;
      }
    }
    dots.forEach((d, i) => {
      if (i === activeIdx) d.classList.add('active');
      else d.classList.remove('active');
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  track.classList.add('is-auto-scrolling');
  const step = (time) => {
    if (!track.isConnected) return;
    const elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 0;
    lastFrameTime = time;
    const maxScroll = getMaxScroll();
    if (!paused && maxScroll > 0) {
      track.scrollLeft += elapsed * 0.018; // Slow, smooth continuous motion
      if (track.scrollLeft >= maxScroll - 1) {
        pauseAutoScroll();
        window.setTimeout(() => {
          if (track.isConnected) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }, 1200);
      }
    }
    collectionAutoScrollFrame = requestAnimationFrame(step);
  };
  collectionAutoScrollFrame = requestAnimationFrame(step);
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  document.getElementById('mobile-menu-toggle')?.setAttribute('aria-expanded', 'false');
}

function bindProductDetailEvents() {
  // Thumbnail gallery switcher
  document.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newSrc = btn.getAttribute('data-img-src');
      const mainImg = document.getElementById('pdp-main-image');
      if (mainImg && newSrc) {
        mainImg.src = newSrc;
      }
    });
  });

  document.getElementById('pdp-custom-text')?.addEventListener('input', updateDrinkwarePreview);
  document.querySelectorAll('.print-color-swatch').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.print-color-swatch').forEach(swatch => {
        swatch.classList.remove('active');
        swatch.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      updateDrinkwarePreview();
    });
  });
  document.querySelectorAll('.print-style-option').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.print-style-option').forEach(option => {
        option.classList.remove('active');
        option.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      updateDrinkwarePreview();
    });
  });

  // PDP Quantity Counter
  const qtyInput = document.getElementById('pdp-qty-input');
  document.getElementById('pdp-qty-minus')?.addEventListener('click', () => {
    if (qtyInput) {
      const val = Math.max(1, parseInt(qtyInput.value, 10) - 1);
      qtyInput.value = val;
    }
  });
  document.getElementById('pdp-qty-plus')?.addEventListener('click', () => {
    if (qtyInput) {
      const val = parseInt(qtyInput.value, 10) + 1;
      qtyInput.value = val;
    }
  });

  // PDP Add to Bag Button
  document.getElementById('pdp-add-bag-btn')?.addEventListener('click', () => {
    const pid = document.getElementById('pdp-add-bag-btn').getAttribute('data-id');
    const product = csvProducts.find(p => p.id === pid);
    if (!product) return;

    const qty = parseInt(document.getElementById('pdp-qty-input')?.value || '1', 10);
    const customText = readPdpPersonalization().text;
    const logoCheck = document.getElementById('pdp-logo-check')?.checked || false;

    store.addToCart(product, {
      quantity: qty,
      customNotes: customText,
      logoRequirement: logoCheck
    });

    store.toggleCartDrawer(true);
  });

  // PDP Request Official Quote Modal
  document.getElementById('pdp-quote-btn')?.addEventListener('click', () => {
    store.toggleEnquiryDrawer(true);
  });

  // PDP Tabs (Description vs Delivery)
  document.querySelectorAll('.pdp-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.pdp-tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      const tabTarget = tabBtn.getAttribute('data-tab');
      
      const descContent = document.getElementById('tab-desc');
      const delivContent = document.getElementById('tab-delivery');
      if (tabTarget === 'desc') {
        if (descContent) descContent.style.display = 'block';
        if (delivContent) delivContent.style.display = 'none';
      } else {
        if (descContent) descContent.style.display = 'none';
        if (delivContent) delivContent.style.display = 'block';
      }
    });
  });
}

function bindModalEvents() {
  // Modal Close
  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    store.closeModal();
  });
  document.getElementById('active-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'active-modal-overlay') {
      store.closeModal();
    }
  });

  // Quick View to PDP
  document.getElementById('qv-goto-pdp')?.addEventListener('click', () => {
    const pid = document.getElementById('qv-goto-pdp').getAttribute('data-id');
    store.closeModal();
    if (pid) store.navigateToProduct(pid);
  });

  // Corporate WhatsApp button
  document.getElementById('corp-wa-btn')?.addEventListener('click', () => {
    const msg = `Hi Gifting Destiny Corporate Team! I would like to inquire about bulk employee onboarding kits / corporate gifting solutions.`;
    window.open(`https://wa.me/${GD_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function bindFormEvents() {
  // Consultation Form in Contact Section
  document.getElementById('consultation-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value || 'Client';
    store.showToast(`Thank you, ${name}! Your consultation request was received. We will call you within 2 hours.`, '✨');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    e.target.reset();
  });
}

function initLiveSearch() {
  const form = document.getElementById('header-search-form');
  const input = document.getElementById('header-search-input');
  const clearBtn = document.getElementById('header-search-clear');
  const dropdown = document.getElementById('search-suggestions-dropdown');

  if (!input || !dropdown) return;

  let debounceTimer = null;
  let highlightedIndex = -1;

  function renderSuggestions(query) {
    if (!query) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'block';

    const q = query.toLowerCase();
    const matches = csvProducts.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      `gd-${p.id}`.includes(q) ||
      p.categories.some(c => c.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="search-no-results">
          <span>🔍</span>
          <strong>No gifts found matching "${query}"</strong>
          <p style="font-size: 0.82rem; margin-top: 0.35rem;">Try searching for 'Bottle', 'Pen', 'Fur Cushion', 'Diary', or 'Keychains'.</p>
        </div>
      `;
      dropdown.style.display = 'block';
      highlightedIndex = -1;
      return;
    }

    const topMatches = matches.slice(0, 6);
    highlightedIndex = -1;

    dropdown.innerHTML = `
      <div class="search-dropdown-header">
        <span>Suggested Products (${matches.length})</span>
        <span style="font-size: 0.72rem; color: #64748b;">Press Enter to view all</span>
      </div>
      <div class="search-suggestions-list">
        ${topMatches.map((p, idx) => {
          const title = p.name;
          const matchStart = title.toLowerCase().indexOf(q);
          let highlightedTitle = title;
          if (matchStart !== -1) {
            highlightedTitle = title.substring(0, matchStart) +
              `<mark>${title.substring(matchStart, matchStart + q.length)}</mark>` +
              title.substring(matchStart + q.length);
          }

          return `
            <div class="search-suggestion-item" data-suggestion-index="${idx}" data-product-id="${p.id}" role="option">
              <img src="${p.primaryImage}" alt="${p.name}" class="suggestion-thumb" loading="lazy" />
              <div class="suggestion-details">
                <div class="suggestion-title">${highlightedTitle}</div>
                <div class="suggestion-meta">
                  <span class="suggestion-cat-pill">${p.primaryCategory}</span>
                  <span class="suggestion-code">GD-${p.id}</span>
                  <span>• Custom Quote / Atelier Order</span>
                </div>
              </div>
              <span class="suggestion-action-arrow">→</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="search-dropdown-footer">
        <button type="button" id="search-view-all-results-btn">
          View all ${matches.length} matching products for "${query}" →
        </button>
      </div>
    `;

    dropdown.style.display = 'block';

    // Click handler for suggestion items
    dropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const pid = item.getAttribute('data-product-id');
        dropdown.style.display = 'none';
        if (pid) store.navigateToProduct(pid);
      });
    });

    document.getElementById('search-view-all-results-btn')?.addEventListener('click', () => {
      dropdown.style.display = 'none';
      store.setSearchQuery(query);
    });
  }

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    debounceTimer = setTimeout(() => {
      renderSuggestions(val);
    }, 160);
  });

  input.addEventListener('focus', (e) => {
    const val = e.target.value.trim();
    if (val) renderSuggestions(val);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    dropdown.style.display = 'none';
    store.setSearchQuery(input.value.trim());
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    store.setSearchQuery('');
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.search-suggestion-item');
    if (dropdown.style.display !== 'none' && items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('highlighted', i === highlightedIndex));
        items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('highlighted', i === highlightedIndex));
        items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          e.preventDefault();
          const pid = items[highlightedIndex].getAttribute('data-product-id');
          dropdown.style.display = 'none';
          if (pid) store.navigateToProduct(pid);
        }
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (form && !form.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Initial mount and subscription to state
let renderPending = false;
store.subscribe(() => {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => {
    renderPending = false;
    renderApp();
  });
});

window.addEventListener('popstate', () => store.restoreLocation());
store.restoreLocation();
