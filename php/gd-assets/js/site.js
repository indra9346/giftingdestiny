/*
 * Gifting Destiny – browser script for the PHP site.
 * The pages are built by PHP; this file adds what needs the browser: the order bag and wishlist
 * (kept in this browser), live search, drawers and pop-ups, the product name preview on mugs,
 * the collection slider, the header cloth banner, blog filters and the enquiry forms.
 * Ported from the previous single-page app (src/main.js and its components).
 */
(function () {
  'use strict';

  var GD = window.GD || {};
  var BASE = GD.base || '';
  var PHONE = GD.phone || '918660940018';
  var LOGO = BASE + '/assets/gifting-destiny-original-logo.jpg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function link(path) { return BASE + path; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function readJSON(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (err) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
  }

  var ICON = {
    bag: '<svg  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    gift: '<svg  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M2 8h20v4H2zM12 8H7.5a2.5 2.5 0 1 1 2.5-2.5V8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5V8Z"/></svg>',
    user: '<svg  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>',
    heart: '<svg  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>',
    whatsapp: '<svg class="whatsapp-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 2.67a13.22 13.22 0 0 0-11.3 20.08L2.9 29.33l6.75-1.77a13.24 13.24 0 1 0 6.39-24.89Zm0 24.27c-2 0-3.96-.54-5.67-1.57l-.4-.24-4.01 1.05 1.07-3.91-.26-.41a10.98 10.98 0 1 1 9.27 5.08Zm6.03-8.23c-.33-.16-1.95-.96-2.25-1.07-.3-.11-.52-.16-.74.16-.22.33-.85 1.07-1.04 1.29-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.51.14-.67.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56l-.63-.01c-.22 0-.57.08-.87.41-.3.33-1.14 1.12-1.14 2.74s1.17 3.18 1.33 3.4c.16.22 2.3 3.52 5.58 4.94.78.34 1.39.55 1.87.7.79.25 1.5.21 2.06.13.63-.09 1.95-.8 2.22-1.56.27-.77.27-1.42.19-1.56-.08-.14-.3-.22-.63-.38Z"/></svg>'
  };

  // ---------------------------------------------------------------------------
  // State kept in this browser: order bag and wishlist
  // ---------------------------------------------------------------------------
  var state = {
    cart: (function () {
      var saved = readJSON('gd-cart', []);
      return Array.isArray(saved) ? saved.filter(function (item) { return item && item.id && item.name; }) : [];
    })(),
    wishlist: (function () {
      var saved = readJSON('gd-wishlist', []);
      return Array.isArray(saved) ? saved.filter(function (id) { return typeof id === 'string'; }) : [];
    })(),
    cartOpen: false,
    enquiryOpen: false,
    enquirySource: 'enquiry',
    modal: null
  };

  function saveCart() { writeJSON('gd-cart', state.cart); }
  function saveWishlist() { writeJSON('gd-wishlist', state.wishlist); }
  function cartCount() {
    return state.cart.reduce(function (sum, item) { return sum + (parseInt(item.quantity, 10) || 0); }, 0);
  }

  var catalogPromise = null;
  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(link('/api/catalog'), { credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('catalog ' + r.status); return r.json(); })
        .then(function (list) {
          var ids = {};
          list.forEach(function (p) { ids[p.id] = true; });
          // Drop saved items that are no longer in the catalogue (as the old site did).
          var kept = state.wishlist.filter(function (id) { return ids[id]; });
          if (kept.length !== state.wishlist.length) { state.wishlist = kept; saveWishlist(); renderHeaderCounts(); }
          return list;
        })
        .catch(function (err) { catalogPromise = null; throw err; });
    }
    return catalogPromise;
  }

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------
  function showToast(message, icon) {
    var existing = document.getElementById('luxury-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'luxury-toast';
    toast.className = 'luxury-toast';
    toast.innerHTML = '<span class="toast-icon"></span><span class="toast-msg"></span>';
    toast.querySelector('.toast-icon').textContent = icon || '✨';
    toast.querySelector('.toast-msg').textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  function celebrate(options) {
    if (typeof window.confetti === 'function' && !reduceMotion) window.confetti(options);
  }

  // ---------------------------------------------------------------------------
  // Header counts
  // ---------------------------------------------------------------------------
  function renderHeaderCounts() {
    var count = cartCount();
    var btn = document.getElementById('header-cart-btn');
    if (btn) {
      btn.classList.toggle('has-items', count > 0);
      btn.style.setProperty('--bag-fill', Math.min(count * 12, 100) + '%');
      btn.setAttribute('aria-label', 'Order bag with ' + count + ' items');
      var badge = btn.querySelector('.cart-badge');
      badge.textContent = count;
      badge.classList.toggle('has-items', count > 0);
      btn.querySelector('.cart-btn-sub').textContent = count + ' item' + (count === 1 ? '' : 's');
    }
    var place = document.getElementById('header-place-order-btn');
    if (place) place.hidden = !count;

    var wbtn = document.getElementById('header-wishlist-btn');
    if (wbtn) {
      var wbadge = wbtn.querySelector('.action-badge');
      if (state.wishlist.length) {
        if (!wbadge) {
          wbadge = document.createElement('span');
          wbadge.className = 'action-badge';
          wbtn.insertBefore(wbadge, wbtn.querySelector('.action-label'));
        }
        wbadge.textContent = state.wishlist.length;
      } else if (wbadge) {
        wbadge.remove();
      }
    }
  }

  function renderWishlistButtons() {
    $$('[data-action="wishlist"].wishlist-btn-pill').forEach(function (btn) {
      var on = state.wishlist.indexOf(btn.getAttribute('data-id')) > -1;
      btn.classList.toggle('active', on);
      btn.title = on ? 'Saved' : 'Save to Wishlist';
    });
  }

  // ---------------------------------------------------------------------------
  // Products on the page
  // ---------------------------------------------------------------------------
  function pdpProduct() {
    var page = document.querySelector('.product-detail-page[data-product]');
    if (!page) return null;
    try { return JSON.parse(page.getAttribute('data-product')); } catch (err) { return null; }
  }

  function productFor(el, id) {
    var card = el && el.closest('.product-card');
    if (card && card.getAttribute('data-product-id') === id) {
      return {
        id: id,
        slug: card.getAttribute('data-slug'),
        name: card.getAttribute('data-name'),
        category: card.getAttribute('data-category') || 'Gift Item',
        image: card.getAttribute('data-image')
      };
    }
    var pdp = pdpProduct();
    if (pdp && pdp.id === id) return pdp;
    return null;
  }

  function addToCart(product, options) {
    options = options || {};
    var notes = options.customNotes || '';
    var logo = Boolean(options.logoRequirement);
    var qty = options.quantity || 1;
    var existing = -1;
    state.cart.forEach(function (item, index) {
      if (existing === -1 && item.id === product.id && item.customNotes === notes && item.logoRequirement === logo) existing = index;
    });
    if (existing > -1) {
      state.cart[existing].quantity = Math.min(100000, state.cart[existing].quantity + qty);
    } else {
      state.cart.push({
        id: product.id,
        slug: product.slug || '',
        name: product.name,
        category: product.category || 'Gift Item',
        image: product.image,
        quantity: qty,
        customNotes: notes,
        logoRequirement: logo
      });
    }
    saveCart();
    showToast('Added "' + product.name + '" to your inquiry bag!', '🎁');
    renderHeaderCounts();
    renderCartDrawer();
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCart();
    renderHeaderCounts();
    renderCartDrawer();
  }

  function updateQuantity(index, delta) {
    var item = state.cart[index];
    if (!item) return;
    item.quantity = Math.min(100000, item.quantity + delta);
    if (item.quantity <= 0) { removeFromCart(index); return; }
    saveCart();
    renderHeaderCounts();
    renderCartDrawer();
  }

  function setQuantity(index, quantity) {
    var item = state.cart[index];
    var next = Math.floor(Number(quantity));
    if (!item || !isFinite(next) || next < 1) return;
    item.quantity = Math.min(next, 100000);
    saveCart();
    renderHeaderCounts();
    renderCartDrawer();
  }

  function toggleWishlist(id) {
    var idx = state.wishlist.indexOf(id);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      showToast('Item removed from saved list.', '🤍');
    } else {
      state.wishlist.push(id);
      showToast('Item saved to your wishlist!', '❤️');
    }
    saveWishlist();
    renderHeaderCounts();
    renderWishlistButtons();
    if (state.modal === 'wishlist') renderModal();
  }

  function openCartOrderWhatsApp() {
    var items = state.cart;
    if (!items.length) return;
    var lines = items.map(function (item, index) {
      return [
        (index + 1) + '. *' + item.name + '* (ID: GD-' + item.id + ')',
        '   Category: ' + item.category,
        '   Quantity: ' + item.quantity,
        item.customNotes ? '   Personalization: ' + item.customNotes : '',
        item.logoRequirement ? '   Company logo: Yes' : '',
        item.slug ? '   Product: ' + location.origin + link('/product/' + item.slug) : ''
      ].filter(Boolean).join('\n');
    }).join('\n\n');
    var message = 'Hello Gifting Destiny! I would like to place an order for:\n\n' + lines + '\n\nTotal quantity: ' + cartCount()
      + ' item(s). Please confirm pricing, mock-up and delivery schedule.';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  }

  function animateProductIntoBag(source, product) {
    var sourceImage = (source.closest('.product-card') && source.closest('.product-card').querySelector('.product-card-img'))
      || document.getElementById('pdp-main-image');
    var bagIcon = document.querySelector('#header-cart-btn .cart-icon-wrapper');
    if (!sourceImage || !bagIcon || !sourceImage.getBoundingClientRect().width) return;
    if (reduceMotion || !sourceImage.animate) {
      bagIcon.classList.add('bag-impact');
      setTimeout(function () { bagIcon.classList.remove('bag-impact'); }, 550);
      return;
    }
    var from = sourceImage.getBoundingClientRect();
    var to = bagIcon.getBoundingClientRect();
    var flight = document.createElement('div');
    flight.className = 'buy-now-flight';
    flight.style.left = (from.left + from.width / 2 - 38) + 'px';
    flight.style.top = (from.top + from.height / 2 - 38) + 'px';
    var image = document.createElement('img');
    image.src = sourceImage.currentSrc || sourceImage.src;
    image.alt = '';
    var label = document.createElement('span');
    label.textContent = product.name;
    flight.appendChild(image);
    flight.appendChild(label);
    document.body.appendChild(flight);
    var dx = to.left + to.width / 2 - (from.left + from.width / 2);
    var dy = to.top + to.height / 2 - (from.top + from.height / 2);
    var motion = flight.animate([
      { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)', opacity: 1 },
      { offset: 0.72, transform: 'translate3d(' + (dx * 0.78) + 'px,' + (dy * 0.78) + 'px,0) scale(.72) rotate(8deg)', opacity: 1 },
      { transform: 'translate3d(' + dx + 'px,' + dy + 'px,0) scale(.18) rotate(16deg)', opacity: 0.15 }
    ], { duration: 850, easing: 'cubic-bezier(.2,.78,.25,1)', fill: 'forwards' });
    motion.onfinish = function () {
      flight.remove();
      bagIcon.classList.add('bag-impact');
      setTimeout(function () { bagIcon.classList.remove('bag-impact'); }, 550);
    };
  }

  // ---------------------------------------------------------------------------
  // Order bag drawer
  // ---------------------------------------------------------------------------
  function renderCartDrawer() {
    var root = document.getElementById('cart-drawer-root');
    if (!root) return;
    var items = state.cart;
    var count = cartCount();
    var list = items.length === 0
      ? '<div class="cart-empty-state">'
        + '<span class="cart-empty-icon">' + ICON.gift + '</span>'
        + '<h4>Your WhatsApp bag is empty</h4>'
        + '<p>Explore our personalized pens, bottles, fur cushions, and luxury gift hampers to assemble your order.</p>'
        + '<a class="btn btn-gd-primary" id="cart-start-shopping-btn" href="' + esc(link('/shop')) + '"><span>Browse Collections</span><span>→</span></a>'
        + '</div>'
      : '<div class="cart-items-list">' + items.map(function (item, idx) {
          return '<div class="cart-item-row">'
            + '<img src="' + esc(item.image) + '" alt="' + esc(item.name) + '" class="cart-item-thumbnail" />'
            + '<div class="cart-item-info">'
            + '<span class="cart-item-category">' + esc(item.category) + '</span>'
            + '<h4 class="cart-item-title">' + esc(item.name) + '</h4>'
            + (item.customNotes ? '<div class="cart-item-custom-note">✍️ "' + esc(item.customNotes) + '"</div>' : '')
            + '<div class="cart-item-qty-row"><div class="qty-counter-small">'
            + '<button class="qty-btn-sm" data-cart-delta="-1" data-idx="' + idx + '" aria-label="Decrease ' + esc(item.name) + ' quantity">−</button>'
            + '<input type="number" class="qty-val" data-cart-quantity data-idx="' + idx + '" value="' + esc(item.quantity) + '" min="1" max="100000" step="1" inputmode="numeric" aria-label="Quantity for ' + esc(item.name) + '" />'
            + '<button class="qty-btn-sm" data-cart-delta="1" data-idx="' + idx + '" aria-label="Increase ' + esc(item.name) + ' quantity">+</button>'
            + '</div><button class="cart-remove-link" data-cart-remove="' + idx + '">Remove</button></div>'
            + '</div></div>';
        }).join('') + '</div>';

    root.innerHTML = '<div class="cart-drawer-overlay' + (state.cartOpen ? ' open' : '') + '" id="cart-drawer-overlay">'
      + '<div class="cart-drawer" role="dialog" aria-label="WhatsApp Order Bag">'
      + '<div class="cart-header"><div class="cart-title-wrap"><span class="cart-title-icon">' + ICON.bag + '</span><div>'
      + '<h3 class="cart-title">WhatsApp Order Bag</h3><span class="cart-subtitle">' + count + ' item' + (count === 1 ? '' : 's') + ' in your bag</span>'
      + '</div></div><button class="cart-close-btn" id="cart-close-btn" title="Close" aria-label="Close Bag">&times;</button></div>'
      + '<div class="cart-notice-bar"><span>Direct Bengaluru Atelier Dispatch · Pan-India Delivery</span></div>'
      + '<div class="cart-items-scroll">' + list + '</div>'
      + (items.length ? '<div class="cart-footer">'
        + '<div class="cart-summary-line"><span>Total Selected Items:</span><strong>' + count + ' unit' + (count === 1 ? '' : 's') + '</strong></div>'
        + '<p class="cart-disclaimer-note">Order processing, custom mock-ups, and dispatch timelines are finalized directly with our Bengaluru atelier team.</p>'
        + '<div class="cart-actions-stack">'
        + '<button type="button" class="btn btn-whatsapp-order" id="cart-whatsapp-order-btn"><span>' + ICON.whatsapp + ' Place Order on WhatsApp (+91 8660940018)</span></button>'
        + '<button type="button" class="btn btn-quote-order" id="cart-quote-order-btn"><span>📋 Submit Official Quote Request</span></button>'
        + '</div></div>' : '')
      + '</div></div>';
  }

  function toggleCartDrawer(open) {
    state.cartOpen = open == null ? !state.cartOpen : open;
    renderCartDrawer();
  }

  // ---------------------------------------------------------------------------
  // Enquiry drawer and forms (saved for the team in the admin panel)
  // ---------------------------------------------------------------------------
  function toggleEnquiryDrawer(open, source) {
    state.enquiryOpen = open == null ? !state.enquiryOpen : open;
    if (state.enquiryOpen) state.enquirySource = source || 'enquiry';
    var overlay = document.getElementById('enquiry-drawer-overlay');
    if (overlay) overlay.classList.toggle('open', state.enquiryOpen);
    if (state.enquiryOpen) {
      var first = document.getElementById('enquiry-name');
      if (first && window.innerWidth > 768) setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
    }
  }

  function formValues(form) {
    var data = {};
    $$('input[name], select[name], textarea[name]', form).forEach(function (field) { data[field.name] = field.value; });
    return data;
  }

  function sendEnquiry(form, payload, errorBox) {
    var button = form.querySelector('[type="submit"]');
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    if (errorBox) errorBox.hidden = true;
    payload.page_url = location.href;
    return fetch(link('/api/enquiry'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false }; }).then(function (body) {
        if (!r.ok || !body.ok) throw new Error(body.error || 'We could not send your enquiry. Please try again or message us on WhatsApp.');
        return body;
      });
    }).catch(function (err) {
      var message = err && err.message && err.message.indexOf('Failed to fetch') === -1 ? err.message
        : 'We could not send your enquiry. Please check your connection or message us on WhatsApp.';
      if (errorBox) { errorBox.textContent = message; errorBox.hidden = false; }
      throw err;
    }).finally(function () {
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
    });
  }

  function bindForms() {
    var enquiryForm = document.getElementById('enquiry-drawer-form');
    if (enquiryForm) {
      enquiryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var values = formValues(enquiryForm);
        var payload = Object.assign({}, values, { source: state.enquirySource });
        var pdp = pdpProduct();
        var items = state.cart.slice();
        if (pdp && state.enquirySource === 'quote' && !items.some(function (i) { return i.id === pdp.id; })) {
          var notes = readPdpPersonalization().text;
          items.unshift({ id: pdp.id, name: pdp.name, quantity: parseInt(($('#pdp-qty-input') || {}).value || '1', 10) || 1, customNotes: notes, logoRequirement: Boolean(($('#pdp-logo-check') || {}).checked) });
        }
        payload.items = items;
        sendEnquiry(enquiryForm, payload, document.getElementById('enquiry-form-error')).then(function () {
          var name = values.name || 'Client';
          toggleEnquiryDrawer(false);
          showToast('Thank you, ' + name + '! Your enquiry for ' + (values.quantity || '1') + ' unit(s) has been received. Our studio will reach out at ' + values.phone + '.', '✨');
          celebrate({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors: ['#800020', '#b8860b', '#2c3e50', '#ffffff'] });
          enquiryForm.reset();
        }).catch(function () {});
      });
    }

    var consultation = document.getElementById('consultation-form');
    if (consultation) {
      consultation.addEventListener('submit', function (e) {
        e.preventDefault();
        var values = formValues(consultation);
        sendEnquiry(consultation, Object.assign({}, values, { source: 'consultation' }), document.getElementById('consultation-form-error')).then(function () {
          showToast('Thank you, ' + (values.name || 'Client') + '! Your consultation request was received. We will call you within 2 hours.', '✨');
          celebrate({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          consultation.reset();
        }).catch(function () {});
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Account and wishlist pop-ups
  // ---------------------------------------------------------------------------
  function openModal(type) { state.modal = type; renderModal(); }
  function closeModal() { state.modal = null; renderModal(); }

  function renderModal() {
    var root = document.getElementById('modal-root');
    if (!root) return;
    if (!state.modal) { root.innerHTML = ''; return; }
    if (state.modal === 'account') {
      root.innerHTML = '<div class="modal-overlay active" id="active-modal-overlay"><div class="modal-card modal-account">'
        + '<button class="modal-close-btn" id="modal-close-btn" aria-label="Close">&times;</button>'
        + '<div class="modal-header"><span class="modal-icon">' + ICON.user + '</span><h3 class="modal-title">Gifting Destiny Account</h3>'
        + '<p class="modal-subtitle">Track orders, manage saved gifts, and review corporate inquiries.</p></div>'
        + '<div class="account-notice-box"><p>Your account &amp; order history are secured through Gifting Destiny\'s official WordPress WooCommerce portal.</p>'
        + '<div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">'
        + '<a href="https://giftingdestiny.com/my-account/" target="_blank" rel="noopener" class="btn btn-gd-primary"><span>Open Official WooCommerce My Account →</span></a>'
        + '<a href="https://wa.me/' + PHONE + '?text=Hi%20Gifting%20Destiny,%20I%20want%20to%20track%20my%20order" target="_blank" rel="noopener" class="btn btn-whatsapp-order"><span>' + ICON.whatsapp + ' Track Order on WhatsApp (+91 8660940018)</span></a>'
        + '</div></div></div></div>';
      return;
    }
    if (state.modal === 'wishlist') {
      var draw = function (catalog) {
        if (state.modal !== 'wishlist') return;
        var byId = {};
        (catalog || []).forEach(function (p) { byId[p.id] = p; });
        var saved = state.wishlist.map(function (id) { return byId[id]; }).filter(Boolean);
        root.innerHTML = '<div class="modal-overlay active" id="active-modal-overlay"><div class="modal-card modal-wishlist" role="dialog" aria-modal="true" aria-label="Saved wishlist">'
          + '<button class="modal-close-btn" id="modal-close-btn" aria-label="Close wishlist">&times;</button>'
          + '<div class="modal-header"><span class="modal-icon" aria-hidden="true">' + ICON.heart + '</span><h3 class="modal-title">Your Saved Gifts</h3>'
          + '<p class="modal-subtitle">' + (catalog ? saved.length + ' item' + (saved.length === 1 ? '' : 's') + ' saved for later' : 'Loading your saved gifts…') + '</p></div>'
          + (!catalog ? '' : saved.length
            ? '<div class="wishlist-items">' + saved.map(function (p) {
                return '<article class="wishlist-item"><img src="' + esc(p.primaryImage) + '" alt="' + esc(p.name) + '" loading="lazy" />'
                  + '<div class="wishlist-item-copy"><span>' + esc(p.primaryCategory || 'Gift') + '</span><h4>' + esc(p.name) + '</h4>'
                  + '<a class="wishlist-view-link" href="' + esc(link('/product/' + p.slug)) + '">View product →</a></div>'
                  + '<button type="button" class="wishlist-remove" data-action="wishlist" data-id="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + ' from saved gifts">Remove</button></article>';
              }).join('') + '</div>'
            : '<div class="wishlist-empty"><p>Your saved list is empty. Tap the heart on any product to keep it here.</p>'
              + '<a class="btn btn-gd-primary" id="wishlist-browse-btn" href="' + esc(link('/shop')) + '">Browse gifts</a></div>')
          + '</div></div>';
      };
      draw(null);
      loadCatalog().then(draw).catch(function () {
        if (state.modal !== 'wishlist') return;
        var sub = root.querySelector('.modal-subtitle');
        if (sub) sub.textContent = 'Your saved gifts could not load. Please check your connection.';
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation for buttons that carry data-view / data-cat (links already have real addresses)
  // ---------------------------------------------------------------------------
  function viewUrl(view, cat) {
    if (view === 'home') return link('/');
    if (view === 'shop') return link('/shop' + (cat && cat !== 'all' ? '?category=' + encodeURIComponent(cat) : ''));
    if (['corporate', 'about', 'contact', 'faq', 'blog'].indexOf(view) > -1) return link('/' + view);
    return null;
  }

  function closeMobileDrawer() {
    var drawer = document.getElementById('mobile-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    var toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  // ---------------------------------------------------------------------------
  // Home: category pills filter the full listing in place
  // ---------------------------------------------------------------------------
  function filterHome(cat) {
    var section = document.getElementById('products-catalog-section');
    if (!section) return;
    var shown = 0;
    $$('.product-card', section).forEach(function (card) {
      var cats = (card.getAttribute('data-cats') || '').split(' ');
      var match = cat === 'all' || cats.indexOf(cat) > -1;
      card.hidden = !match;
      if (match) shown += 1;
    });
    var activePill = null;
    $$('[data-home-cat]', section).forEach(function (pill) {
      var on = pill.getAttribute('data-home-cat') === cat;
      pill.classList.toggle('active', on);
      if (on) activePill = pill;
    });
    var title = document.getElementById('catalog-title');
    if (title) title.textContent = cat === 'all' ? 'All Collections' : (activePill && activePill.getAttribute('data-cat-name')) || 'All Collections';
    var countEl = document.getElementById('catalog-count');
    if (countEl) countEl.textContent = shown;
    try {
      history.replaceState(null, '', link('/') + (cat === 'all' ? '' : '?category=' + encodeURIComponent(cat)));
    } catch (err) {}
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var header = document.querySelector('.site-header');
        var top = section.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
    bindPhotoLoading();
  }

  // ---------------------------------------------------------------------------
  // Clicks across the page
  // ---------------------------------------------------------------------------
  function onDocumentClick(e) {
    var t = e.target;
    if (!(t instanceof Element)) return;

    var buy = t.closest('[data-action="buy-now"]');
    if (buy) {
      e.preventDefault();
      e.stopPropagation();
      var pid = buy.getAttribute('data-id');
      var product = productFor(buy, pid);
      if (!product) return;
      var isPdp = buy.id === 'pdp-whatsapp-btn';
      var quantity = isPdp ? Math.max(1, parseInt((document.getElementById('pdp-qty-input') || {}).value || '1', 10) || 1) : 1;
      var customNotes = isPdp ? readPdpPersonalization().text : '';
      var logo = isPdp && Boolean((document.getElementById('pdp-logo-check') || {}).checked);
      animateProductIntoBag(buy, product);
      addToCart(product, { quantity: quantity, customNotes: customNotes, logoRequirement: logo });
      if (isPdp) toggleCartDrawer(true);
      return;
    }

    var wish = t.closest('[data-action="wishlist"]');
    if (wish) {
      e.preventDefault();
      e.stopPropagation();
      var wid = wish.getAttribute('data-id');
      if (wid) toggleWishlist(wid);
      return;
    }

    var homePill = t.closest('[data-home-cat]');
    if (homePill) { filterHome(homePill.getAttribute('data-home-cat')); return; }

    var more = t.closest('[data-action="load-more-products"]');
    if (more) {
      e.preventDefault();
      var hidden = $$('#products-grid .product-card[hidden]');
      var step = parseInt(more.getAttribute('data-step') || '16', 10);
      hidden.slice(0, step).forEach(function (card) { card.hidden = false; });
      var remaining = hidden.length - step;
      if (remaining <= 0) more.closest('.catalog-view-all-row').remove();
      else more.querySelector('[data-remaining]').textContent = remaining;
      bindPhotoLoading();
      return;
    }

    if (t.closest('[data-action="open-enquiry"], [data-action="open-quote"]')) {
      e.preventDefault();
      toggleEnquiryDrawer(true, 'enquiry');
      return;
    }

    // Product cards: anywhere except buttons and links opens the product page.
    var card = t.closest('.product-card');
    if (card && !t.closest('button:not([data-action="view-pdp"]), a')) {
      var href = card.getAttribute('data-href');
      if (href) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) window.open(href, '_blank');
        else location.href = href;
      }
      return;
    }

    var nav = t.closest('[data-view], [data-cat]');
    if (nav && !(nav.tagName === 'A' && nav.getAttribute('href'))) {
      var view = nav.getAttribute('data-view');
      var cat = nav.getAttribute('data-cat') || 'all';
      var target = view ? viewUrl(view, cat) : viewUrl('shop', cat);
      if (target) {
        e.preventDefault();
        closeMobileDrawer();
        location.href = target;
      }
      return;
    }

    if (t.closest('#header-account-btn')) { openModal('account'); return; }
    if (t.closest('#header-wishlist-btn')) { openModal('wishlist'); return; }
    if (t.closest('#header-cart-btn')) { toggleCartDrawer(true); return; }
    if (t.closest('#header-place-order-btn')) { openCartOrderWhatsApp(); return; }

    // Bag drawer
    if (t.closest('#cart-close-btn')) { toggleCartDrawer(false); return; }
    if (t.id === 'cart-drawer-overlay') { toggleCartDrawer(false); return; }
    var delta = t.closest('[data-cart-delta]');
    if (delta) { updateQuantity(parseInt(delta.getAttribute('data-idx'), 10), parseInt(delta.getAttribute('data-cart-delta'), 10)); return; }
    var remove = t.closest('[data-cart-remove]');
    if (remove) { removeFromCart(parseInt(remove.getAttribute('data-cart-remove'), 10)); return; }
    if (t.closest('#cart-whatsapp-order-btn')) { openCartOrderWhatsApp(); return; }
    if (t.closest('#cart-quote-order-btn')) { toggleCartDrawer(false); toggleEnquiryDrawer(true, 'quote'); return; }

    // Enquiry drawer
    if (t.closest('#enquiry-close-btn')) { toggleEnquiryDrawer(false); return; }
    if (t.id === 'enquiry-drawer-overlay') { toggleEnquiryDrawer(false); return; }

    // Pop-ups
    if (t.closest('#modal-close-btn')) { closeModal(); return; }
    if (t.id === 'active-modal-overlay') { closeModal(); return; }

    // Mobile menu
    if (t.closest('#mobile-menu-toggle')) {
      var drawer = document.getElementById('mobile-drawer-overlay');
      if (drawer) drawer.classList.add('open');
      t.closest('#mobile-menu-toggle').setAttribute('aria-expanded', 'true');
      return;
    }
    if (t.closest('#mobile-drawer-close-btn') || t.id === 'mobile-drawer-overlay') { closeMobileDrawer(); return; }

    if (t.closest('#corp-wa-btn')) {
      var msg = 'Hi Gifting Destiny Corporate Team! I would like to inquire about bulk employee onboarding kits / corporate gifting solutions.';
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
    }
  }

  function onDocumentChange(e) {
    var t = e.target;
    if (t.matches && t.matches('[data-cart-quantity]')) {
      var idx = parseInt(t.getAttribute('data-idx'), 10);
      var quantity = Number(t.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
        t.value = state.cart[idx] ? state.cart[idx].quantity : 1;
        return;
      }
      setQuantity(idx, quantity);
    }
    if (t.id === 'catalog-sort-select') {
      var params = new URLSearchParams(location.search);
      if (t.value === 'featured') params.delete('sort'); else params.set('sort', t.value);
      var query = params.toString();
      var section = document.getElementById('products-catalog-section');
      var onHome = section && section.getAttribute('data-showall') === '1';
      location.href = (onHome ? link('/') : link('/shop')) + (query ? '?' + query : '') + '#products-catalog-section';
    }
  }

  function onKeydown(e) {
    if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-cart-quantity]')) e.target.blur();
    if (e.key !== 'Escape') return;
    if (state.modal) closeModal();
    else if (state.cartOpen) toggleCartDrawer(false);
    else if (state.enquiryOpen) toggleEnquiryDrawer(false);
    else closeMobileDrawer();
  }

  // ---------------------------------------------------------------------------
  // Live search with suggestions
  // ---------------------------------------------------------------------------
  function initLiveSearch() {
    var form = document.getElementById('header-search-form');
    var input = document.getElementById('header-search-input');
    var clearBtn = document.getElementById('header-search-clear');
    var dropdown = document.getElementById('search-suggestions-dropdown');
    if (!input || !dropdown) return;
    var debounceTimer = null;
    var highlighted = -1;

    function goSearch(query) {
      location.href = link('/shop') + (query ? '?q=' + encodeURIComponent(query) : '');
    }

    function renderSuggestions(query, catalog) {
      if (!query) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        if (clearBtn) clearBtn.style.display = 'none';
        return;
      }
      if (clearBtn) clearBtn.style.display = 'block';
      var q = query.toLowerCase();
      var matches = catalog.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) > -1
          || (p.sku && p.sku.toLowerCase().indexOf(q) > -1)
          || ('gd-' + p.id).indexOf(q) > -1
          || p.categories.some(function (c) { return c.toLowerCase().indexOf(q) > -1; })
          || (p.search && p.search.indexOf(q) > -1);
      });
      highlighted = -1;
      if (!matches.length) {
        dropdown.innerHTML = '<div class="search-no-results"><span>🔍</span><strong>No gifts found matching "' + esc(query) + '"</strong>'
          + '<p style="font-size: 0.82rem; margin-top: 0.35rem;">Try searching for \'Bottle\', \'Pen\', \'Fur Cushion\', \'Diary\', or \'Keychains\'.</p></div>';
        dropdown.style.display = 'block';
        return;
      }
      dropdown.innerHTML = '<div class="search-dropdown-header"><span>Suggested Products (' + matches.length + ')</span>'
        + '<span style="font-size: 0.72rem; color: #64748b;">Press Enter to view all</span></div>'
        + '<div class="search-suggestions-list">' + matches.slice(0, 6).map(function (p, idx) {
          var title = p.name;
          var start = title.toLowerCase().indexOf(q);
          var shown = start === -1 ? esc(title)
            : esc(title.substring(0, start)) + '<mark>' + esc(title.substring(start, start + q.length)) + '</mark>' + esc(title.substring(start + q.length));
          return '<div class="search-suggestion-item" data-suggestion-index="' + idx + '" data-href="' + esc(link('/product/' + p.slug)) + '" role="option">'
            + '<img src="' + esc(p.primaryImage) + '" alt="' + esc(p.name) + '" class="suggestion-thumb" loading="lazy" />'
            + '<div class="suggestion-details"><div class="suggestion-title">' + shown + '</div>'
            + '<div class="suggestion-meta"><span class="suggestion-cat-pill">' + esc(p.primaryCategory) + '</span>'
            + '<span class="suggestion-code">GD-' + esc(p.id) + '</span><span>• Custom Quote / Atelier Order</span></div></div>'
            + '<span class="suggestion-action-arrow">→</span></div>';
        }).join('') + '</div>'
        + '<div class="search-dropdown-footer"><button type="button" id="search-view-all-results-btn">View all ' + matches.length
        + ' matching products for "' + esc(query) + '" →</button></div>';
      dropdown.style.display = 'block';
    }

    function suggest(value) {
      if (!value) { renderSuggestions('', []); return; }
      loadCatalog().then(function (catalog) {
        if (input.value.trim() === value) renderSuggestions(value, catalog);
      }).catch(function () {});
    }

    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var value = input.value.trim();
      debounceTimer = setTimeout(function () { suggest(value); }, 160);
    });
    input.addEventListener('focus', function () {
      loadCatalog().catch(function () {});
      var value = input.value.trim();
      if (value) suggest(value);
    });
    dropdown.addEventListener('click', function (e) {
      var item = e.target.closest('.search-suggestion-item');
      if (item) { dropdown.style.display = 'none'; location.href = item.getAttribute('data-href'); return; }
      if (e.target.closest('#search-view-all-results-btn')) { dropdown.style.display = 'none'; goSearch(input.value.trim()); }
    });
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        dropdown.style.display = 'none';
        goSearch(input.value.trim());
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.style.display = 'none';
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        if (new URLSearchParams(location.search).get('q')) goSearch('');
      });
    }
    input.addEventListener('keydown', function (e) {
      var items = dropdown.querySelectorAll('.search-suggestion-item');
      if (dropdown.style.display === 'none' || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted = e.key === 'ArrowDown' ? (highlighted + 1) % items.length : (highlighted - 1 + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle('highlighted', i === highlighted); });
        items[highlighted].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && highlighted >= 0 && items[highlighted]) {
        e.preventDefault();
        dropdown.style.display = 'none';
        location.href = items[highlighted].getAttribute('data-href');
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });
    document.addEventListener('click', function (e) {
      if (form && !form.contains(e.target)) dropdown.style.display = 'none';
    });
  }

  // ---------------------------------------------------------------------------
  // Product page: photos, name preview on mugs, quantity, tabs
  // ---------------------------------------------------------------------------
  function readPdpPersonalization() {
    var input = document.getElementById('pdp-custom-text');
    var text = input ? input.value.trim() : '';
    var activeColor = document.querySelector('.print-color-swatch.active');
    var activeStyle = document.querySelector('.print-style-option.active');
    var colorName = activeColor ? activeColor.getAttribute('aria-label') : '';
    var styleName = activeStyle ? activeStyle.textContent.trim() : '';
    return {
      text: text ? text + (colorName ? ' (Print color: ' + colorName + ')' : '') + (styleName ? ' (Lettering: ' + styleName + ')' : '') : '',
      color: activeColor ? activeColor.getAttribute('data-print-color') : '#172554'
    };
  }

  var mugAreas = null;
  function getMugPrintArea(src) {
    if (!src) return null;
    if (!mugAreas) {
      var el = document.getElementById('mug-print-areas');
      try { mugAreas = el ? JSON.parse(el.textContent) : {}; } catch (err) { mugAreas = {}; }
    }
    var file = decodeURIComponent(src.split('?')[0].split('/').pop() || '');
    return mugAreas[file] || null;
  }

  function measurePrintText(preview, text) {
    var probe = document.createElement('span');
    probe.className = 'drinkware-print-probe';
    probe.dataset.printStyle = preview.dataset.printStyle;
    probe.textContent = text;
    preview.parentElement.appendChild(probe);
    var width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }

  // Places the typed name on the mug's printable face in the photo that is showing.
  function placeMugPrint(preview, text) {
    var image = document.getElementById('pdp-main-image');
    var area = getMugPrintArea(image && (image.currentSrc || image.src));
    if (!image || !area || !image.naturalWidth || !text) return false;
    var style = getComputedStyle(image);
    var padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    var padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    var boxW = image.clientWidth - padX;
    var boxH = image.clientHeight - padY;
    var scale = Math.min(boxW / image.naturalWidth, boxH / image.naturalHeight);
    var drawnW = image.naturalWidth * scale;
    var drawnH = image.naturalHeight * scale;
    var left = image.offsetLeft + parseFloat(style.paddingLeft) + (boxW - drawnW) / 2;
    var top = image.offsetTop + parseFloat(style.paddingTop) + (boxH - drawnH) / 2;
    var faceW = (area.w / 100) * drawnW;
    var maxSize = drawnH * 0.075;
    var minOneLine = drawnH * 0.03;
    var lines = [text];
    var size = Math.min(maxSize, (faceW * 0.96 * 100) / measurePrintText(preview, text));
    var words = text.split(/\s+/);
    if (size < minOneLine && words.length > 1) {
      var best = null;
      for (var i = 1; i < words.length; i += 1) {
        var pair = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
        var widest = Math.max(measurePrintText(preview, pair[0]), measurePrintText(preview, pair[1]));
        if (!best || widest < best.widest) best = { pair: pair, widest: widest };
      }
      lines = best.pair;
      size = Math.min(drawnH * 0.06, (faceW * 0.96 * 100) / best.widest);
    }
    preview.textContent = lines.join('\n');
    preview.style.left = (left + (area.x / 100) * drawnW) + 'px';
    preview.style.top = (top + (area.y / 100) * drawnH) + 'px';
    preview.style.width = faceW + 'px';
    preview.style.fontSize = size + 'px';
    preview.style.transform = 'translate(-50%, -50%) rotate(' + area.rot + 'deg)';
    return true;
  }

  function updateDrinkwarePreview() {
    var input = document.getElementById('pdp-custom-text');
    var preview = document.getElementById('drinkware-print-preview');
    if (!input || !preview) return;
    var color = document.querySelector('.print-color-swatch.active');
    var styleBtn = document.querySelector('.print-style-option.active');
    preview.style.setProperty('--print-color', color ? color.getAttribute('data-print-color') : '#172554');
    preview.dataset.printStyle = styleBtn ? styleBtn.getAttribute('data-print-style') : 'serif';
    preview.hidden = !placeMugPrint(preview, input.value.trim());
  }

  function initProductPage() {
    var page = document.querySelector('.product-detail-page');
    if (!page) return;
    $$('.pdp-thumb-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.pdp-thumb-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var main = document.getElementById('pdp-main-image');
        if (main && btn.getAttribute('data-img-src')) main.src = btn.getAttribute('data-img-src');
      });
    });
    var custom = document.getElementById('pdp-custom-text');
    if (custom) custom.addEventListener('input', updateDrinkwarePreview);
    if (document.getElementById('drinkware-print-preview')) {
      var mainImg = document.getElementById('pdp-main-image');
      if (mainImg) {
        mainImg.addEventListener('load', updateDrinkwarePreview);
        if ('ResizeObserver' in window) new ResizeObserver(updateDrinkwarePreview).observe(mainImg);
      }
    }
    function choose(selector) {
      $$(selector).forEach(function (button) {
        button.addEventListener('click', function () {
          $$(selector).forEach(function (other) { other.classList.remove('active'); other.setAttribute('aria-pressed', 'false'); });
          button.classList.add('active');
          button.setAttribute('aria-pressed', 'true');
          updateDrinkwarePreview();
        });
      });
    }
    choose('.print-color-swatch');
    choose('.print-style-option');

    var qty = document.getElementById('pdp-qty-input');
    var minus = document.getElementById('pdp-qty-minus');
    var plus = document.getElementById('pdp-qty-plus');
    if (minus && qty) minus.addEventListener('click', function () { qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) - 1); });
    if (plus && qty) plus.addEventListener('click', function () { qty.value = (parseInt(qty.value, 10) || 0) + 1; });

    var addBag = document.getElementById('pdp-add-bag-btn');
    if (addBag) {
      addBag.addEventListener('click', function () {
        var product = pdpProduct();
        if (!product) return;
        addToCart(product, {
          quantity: Math.max(1, parseInt((qty || {}).value || '1', 10) || 1),
          customNotes: readPdpPersonalization().text,
          logoRequirement: Boolean((document.getElementById('pdp-logo-check') || {}).checked)
        });
        toggleCartDrawer(true);
      });
    }
    var quote = document.getElementById('pdp-quote-btn');
    if (quote) quote.addEventListener('click', function () { toggleEnquiryDrawer(true, 'quote'); });

    $$('.pdp-tab-btn').forEach(function (tabBtn) {
      tabBtn.addEventListener('click', function () {
        $$('.pdp-tab-btn').forEach(function (b) { b.classList.remove('active'); });
        tabBtn.classList.add('active');
        var desc = document.getElementById('tab-desc');
        var deliv = document.getElementById('tab-delivery');
        var showDesc = tabBtn.getAttribute('data-tab') === 'desc';
        if (desc) desc.style.display = showDesc ? 'block' : 'none';
        if (deliv) deliv.style.display = showDesc ? 'none' : 'block';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Collection slider: endless auto-scroll, arrows, dots
  // ---------------------------------------------------------------------------
  function initCollectionSlider() {
    var track = document.getElementById('collection-cards-track');
    if (!track) return;
    var prevBtn = document.getElementById('collection-prev-btn');
    var nextBtn = document.getElementById('collection-next-btn');
    var dots = $$('#collection-slider-dots .slider-dot');
    var getScrollStep = function () {
      var a = track.children[0], b = track.children[1];
      return a && b ? (b.offsetLeft - a.offsetLeft) : 300;
    };
    var realCount = track.querySelectorAll('.collection-slide-card:not([data-loop-copy])').length;
    var getLoopWidth = function () {
      var first = track.children[0], copy = track.children[realCount];
      return first && copy ? copy.offsetLeft - first.offsetLeft : 0;
    };
    var jumpTo = function (left) { track.scrollTo({ left: left, behavior: 'instant' }); };
    var wrapPosition = function () {
      var loop = getLoopWidth();
      if (!loop) return;
      if (track.scrollLeft >= loop) jumpTo(track.scrollLeft - loop);
      else if (track.scrollLeft < 0) jumpTo(track.scrollLeft + loop);
    };
    var paused = false, resumeTimer, lastFrameTime = 0, position = track.scrollLeft;
    var pauseAutoScroll = function () {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; position = track.scrollLeft; }, 3000);
    };
    if (prevBtn) prevBtn.addEventListener('click', function () {
      pauseAutoScroll();
      var step = getScrollStep();
      if (track.scrollLeft - step < 0) jumpTo(track.scrollLeft + getLoopWidth());
      track.scrollBy({ left: -step, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      pauseAutoScroll();
      var step = getScrollStep();
      if (track.scrollLeft + step >= getLoopWidth()) jumpTo(track.scrollLeft - getLoopWidth());
      track.scrollBy({ left: step, behavior: 'smooth' });
    });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        pauseAutoScroll();
        wrapPosition();
        var card = track.children[parseInt(dot.getAttribute('data-slide-index'), 10)];
        if (card) track.scrollTo({ left: card.offsetLeft - track.children[0].offsetLeft, behavior: 'smooth' });
      });
    });
    track.addEventListener('focusin', function () { paused = true; });
    track.addEventListener('focusout', function () { paused = false; });
    track.addEventListener('pointerdown', pauseAutoScroll);
    track.addEventListener('wheel', pauseAutoScroll, { passive: true });
    track.addEventListener('scroll', function () {
      var activeIdx = 0, closest = Infinity;
      var origin = track.children[0] ? track.children[0].offsetLeft : 0;
      for (var i = 0; i < track.children.length; i += 1) {
        var distance = Math.abs(track.children[i].offsetLeft - origin - track.scrollLeft);
        if (distance < closest) { closest = distance; activeIdx = i; }
      }
      dots.forEach(function (d, i) { d.classList.toggle('active', i === activeIdx % Math.max(realCount, 1)); });
    });
    if (reduceMotion) return;
    track.classList.add('is-auto-scrolling');
    var step = function (time) {
      if (!track.isConnected) return;
      var elapsed = lastFrameTime ? Math.min(time - lastFrameTime, 50) : 0;
      lastFrameTime = time;
      var loop = getLoopWidth();
      if (!paused && loop > 0) {
        // One card every ~4 s, looping forever.
        position += elapsed * (getScrollStep() / 4000);
        if (position >= loop) position -= loop;
        track.scrollLeft = position;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------------------
  // Home hero film
  // ---------------------------------------------------------------------------
  function initHeroVideo() {
    var video = document.getElementById('hero-bgv');
    if (!video) return;
    var header = document.querySelector('.site-header');
    var fit = function () {
      if (!header) return;
      var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      var available = Math.max(320, Math.floor(vh - header.getBoundingClientRect().height));
      document.documentElement.style.setProperty('--hero-viewport-height', available + 'px');
    };
    fit();
    if ('ResizeObserver' in window && header) new ResizeObserver(fit).observe(header);
    window.addEventListener('resize', fit, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit, { passive: true });
    video.defaultPlaybackRate = 1.0;
    video.playbackRate = 1.0;
    var source = video.querySelector('source');
    var triedBackup = false;
    video.addEventListener('error', function () {
      if (triedBackup || !source) return;
      triedBackup = true;
      source.src = link('/gifting-destiny-brand-film.mp4');
      video.load();
      video.play().catch(function () {});
    });
    video.addEventListener('canplay', function () { video.play().catch(function () {}); }, { once: true });
    video.play().catch(function () {});
  }

  // ---------------------------------------------------------------------------
  // Photos: fall back to the full photo or a labelled box, shimmer until loaded, top progress bar
  // ---------------------------------------------------------------------------
  function handleImageFailure(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.siteImageFailed === 'true') return;
    var isBrand = image.classList.contains('brand-logo-img') || image.classList.contains('footer-logo-img-large')
      || (image.alt || '').toLowerCase().indexOf('logo') > -1;
    if (isBrand && !image.dataset.localLogoAttempted && image.src.indexOf(LOGO) === -1) {
      image.dataset.localLogoAttempted = 'true';
      image.src = LOGO;
      return;
    }
    var fallback = image.getAttribute('data-fallback');
    if (fallback && !image.dataset.fallbackTried) {
      image.dataset.fallbackTried = 'true';
      image.removeAttribute('srcset');
      image.src = fallback;
      return;
    }
    image.dataset.siteImageFailed = 'true';
    var thumb = image.closest('.pdp-thumb-btn');
    if (thumb) { thumb.hidden = true; return; }
    if (!image.closest('.product-card, .product-gallery-section, .collection-slide-card')) return;
    var card = image.closest('.product-card');
    var label = (card && card.getAttribute('data-name')) || image.alt || 'Photo temporarily unavailable';
    var box = document.createElement('div');
    box.className = 'product-image-fallback site-image-fallback';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Photo unavailable for ' + label);
    box.innerHTML = '<svg class="site-image-fallback-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9" r="1.5"></circle><path d="m21 15-5-5L5 20"></path></svg><span class="site-image-fallback-label"></span>';
    box.querySelector('.site-image-fallback-label').textContent = label;
    image.replaceWith(box);
  }

  function bindSiteImageHandling() {
    document.addEventListener('error', function (event) { handleImageFailure(event.target); }, true);
    $$('img').forEach(function (image) {
      image.decoding = 'async';
      if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) handleImageFailure(image);
    });
  }

  function bindPhotoLoading() {
    $$('.product-card-img, .slide-card-img').forEach(function (image) {
      var wrap = image.parentElement;
      if (!wrap || wrap.classList.contains('photo-ready')) return;
      if (image.complete && image.naturalWidth > 0) { wrap.classList.add('photo-ready', 'photo-instant'); return; }
      var done = function () { wrap.classList.add('photo-ready'); };
      image.addEventListener('load', done, { once: true });
      image.addEventListener('error', done, { once: true });
    });
  }

  function trackFirstScreenPhotos() {
    var limit = window.innerHeight * 1.6;
    var pending = $$('main img').filter(function (image) {
      if (image.complete) return false;
      var rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.top < limit && rect.bottom > -100;
    });
    if (!pending.length) return;
    var bar = document.createElement('div');
    bar.id = 'gd-photo-progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<span></span>';
    document.body.appendChild(bar);
    var fill = bar.firstElementChild;
    var loaded = 0;
    var update = function () {
      fill.style.transform = 'scaleX(' + (0.08 + 0.92 * (loaded / pending.length)) + ')';
      if (loaded >= pending.length) setTimeout(function () { bar.classList.remove('is-active'); }, 350);
    };
    bar.classList.add('is-active');
    update();
    pending.forEach(function (image) {
      var step = function () { loaded += 1; update(); };
      image.addEventListener('load', step, { once: true });
      image.addEventListener('error', step, { once: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Header cloth banner: pulled out of the round GD logo, sways, wound back in
  // ---------------------------------------------------------------------------
  function initBrandCloth() {
    if (reduceMotion) return;
    var REPLAY_MS = 45000, PULL_MS = 1500, HOLD_MS = 3200, REWIND_MS = 1150;
    var layer = null, playing = false, lastRun = 0;

    function buildLayer() {
      layer = document.createElement('div');
      layer.id = 'gd-cloth-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = '<div class="gd-cloth"><div class="gd-cloth-face"><div class="gd-cloth-print">'
        + '<img class="gd-cloth-badge" src="' + LOGO + '" alt="" />'
        + '<span class="gd-cloth-stack"><span class="gd-cloth-name">Gifting Destiny</span><span class="gd-cloth-sub">Personalised Gifts · Bengaluru</span></span>'
        + '<span class="gd-cloth-sep tier-m">✦</span><span class="gd-cloth-script tier-m">Crafted with Love &amp; Care</span>'
        + '<span class="gd-cloth-sep tier-l">✦</span><span class="gd-cloth-item tier-l">Personalised &amp; Corporate Gifts</span>'
        + '<span class="gd-cloth-sep tier-xl">✦</span><span class="gd-cloth-item tier-xl">Pan-India Delivery</span>'
        + '<span class="gd-cloth-sep tier-m">✦</span><span class="gd-cloth-item gd-cloth-phone tier-m">☎ +91 86609 40018</span>'
        + '</div><span class="gd-cloth-tag"><img src="' + LOGO + '" alt="" /></span></div></div>'
        + '<div class="gd-reel"><img src="' + LOGO + '" alt="" /><span class="gd-reel-spool"></span></div>';
      document.body.appendChild(layer);
    }
    function parts() {
      return { logo: document.querySelector('.site-header .brand-logo-img'), actions: document.querySelector('.site-header .header-actions') };
    }
    function canPlay() {
      if (playing || document.hidden) return false;
      if (document.querySelector('.mobile-drawer-overlay.open, .modal-overlay, .cart-drawer-overlay.open, .enquiry-drawer-overlay.open')) return false;
      if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.site-header')) return false;
      var p = parts();
      if (!p.logo || !p.actions) return false;
      var rect = p.logo.getBoundingClientRect();
      return rect.width > 0 && rect.top >= -2 && rect.bottom <= window.innerHeight;
    }
    var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeInQuart = function (t) { return Math.pow(t, 4); };
    function tween(duration, onFrame) {
      return new Promise(function (resolve) {
        var start = performance.now();
        var frame = function (now) {
          var t = Math.min(1, (now - start) / duration);
          onFrame(t);
          if (t < 1) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
    }
    var wait = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };

    function play() {
      if (!canPlay()) return;
      if (!layer) buildLayer();
      var p = parts();
      var logoRect = p.logo.getBoundingClientRect();
      var actionsRect = p.actions.getBoundingClientRect();
      var size = logoRect.width, radius = size / 2;
      var centerX = logoRect.left + radius, centerY = logoRect.top + logoRect.height / 2;
      var clothH = Math.max(30, Math.round(size * 0.74));
      var width = Math.round(actionsRect.left - 10 - centerX);
      if (width < 150) return;
      playing = true;
      lastRun = Date.now();
      var cloth = layer.querySelector('.gd-cloth');
      var face = layer.querySelector('.gd-cloth-face');
      var reel = layer.querySelector('.gd-reel');
      var reelImg = reel.querySelector('img');
      var spool = layer.querySelector('.gd-reel-spool');
      layer.style.setProperty('--cloth-h', clothH + 'px');
      layer.style.setProperty('--reel-r', radius + 'px');
      cloth.style.cssText = 'left:' + centerX + 'px; top:' + (centerY - clothH / 2) + 'px; width:' + width + 'px; height:' + clothH + 'px;';
      face.style.width = width + 'px';
      reel.style.cssText = 'left:' + logoRect.left + 'px; top:' + logoRect.top + 'px; width:' + size + 'px; height:' + logoRect.height + 'px;';
      var logoStyle = getComputedStyle(p.logo);
      reelImg.style.objectFit = logoStyle.objectFit;
      reelImg.style.borderRadius = logoStyle.borderRadius;
      var degPerPx = (360 / (Math.PI * size)) * 0.35;
      var place = function (offset) {
        face.style.transform = 'translate3d(' + (offset - width) + 'px, 0, 0)';
        reel.style.transform = 'rotate(' + (offset * degPerPx) + 'deg)';
      };
      place(0);
      layer.classList.remove('is-holding');
      layer.classList.add('is-on');
      document.documentElement.classList.add('gd-reel-on');
      var print = layer.querySelector('.gd-cloth-print');
      var tag = layer.querySelector('.gd-cloth-tag');
      ['xl', 'l', 'm', 's', 'xs'].some(function (tier) {
        layer.dataset.tier = tier;
        var shown = Array.prototype.filter.call(print.children, function (el) { return getComputedStyle(el).display !== 'none'; });
        var end = Math.max.apply(null, shown.map(function (el) { return el.getBoundingClientRect().right; }));
        return end <= tag.getBoundingClientRect().left - 4;
      });
      tween(PULL_MS, function (t) { place(width * easeOutCubic(t)); })
        .then(function () { return tween(380, function (t) { place(width + Math.sin(t * Math.PI) * 7 * (1 - t)); }); })
        .then(function () { layer.classList.add('is-holding'); return wait(HOLD_MS); })
        .then(function () { layer.classList.remove('is-holding'); return tween(220, function (t) { place(width + Math.sin(t * Math.PI) * 10); }); })
        .then(function () { return tween(REWIND_MS, function (t) { place(width * (1 - easeInQuart(t))); }); })
        .then(function () {
          spool.animate([
            { opacity: 0, transform: 'scale(1)' },
            { opacity: 1, transform: 'scale(1.06)', offset: 0.3 },
            { opacity: 0, transform: 'scale(1.1)' }
          ], { duration: 520, easing: 'ease-out' });
          return reel.animate([
            { transform: 'rotate(0deg) scale(1)' },
            { transform: 'rotate(-14deg) scale(1.05)', offset: 0.3 },
            { transform: 'rotate(5deg) scale(0.98)', offset: 0.65 },
            { transform: 'rotate(0deg) scale(1)' }
          ], { duration: 480, easing: 'ease-out' }).finished.catch(function () {});
        })
        .then(function () {
          layer.classList.remove('is-on');
          document.documentElement.classList.remove('gd-reel-on');
          playing = false;
        });
    }

    setTimeout(play, 1400);
    setInterval(function () { if (Date.now() - lastRun >= REPLAY_MS - 500) play(); }, REPLAY_MS);
    document.addEventListener('pointerover', function (event) {
      if (event.pointerType !== 'mouse') return;
      if (!event.target.closest || !event.target.closest('.site-header .brand-logo')) return;
      if (Date.now() - lastRun > 12000) play();
    });
  }

  // ---------------------------------------------------------------------------
  // Blog pages: reveals, topic filters, search, contents, reading progress, tilt, films
  // ---------------------------------------------------------------------------
  function initBlogPage() {
    var root = document.querySelector('.gdb');
    if (!root) return;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var filter = { topic: 'all', query: '' };

    var revealEls = $$('[data-reveal]', root);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible', 'gdb-instant'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
      revealEls.forEach(function (el) { io.observe(el); });
    }

    var heroVideo = root.querySelector('.gdb-hero-video');
    if (heroVideo) {
      heroVideo.muted = true;
      if (reduceMotion) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); } else heroVideo.play().catch(function () {});
    }
    var autoVideos = $$('[data-gdb-autoplay]', root);
    if (autoVideos.length && 'IntersectionObserver' in window && !reduceMotion) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            if (video.preload === 'none') video.preload = 'auto';
            video.play().catch(function () {});
          } else video.pause();
        });
      }, { threshold: 0.25 });
      autoVideos.forEach(function (video) { video.muted = true; vio.observe(video); });
    } else autoVideos.forEach(function (video) { video.controls = true; });

    function scrollToElement(el) {
      var header = document.querySelector('.site-header');
      var offset = (header ? header.getBoundingClientRect().height : 0) + 18;
      var top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    function applyFilters() {
      var needle = filter.query.trim().toLowerCase();
      var shown = 0;
      $$('[data-gdb-item]', root).forEach(function (item) {
        var topics = (item.getAttribute('data-topics') || '').split(' ');
        var match = (filter.topic === 'all' || topics.indexOf(filter.topic) > -1)
          && (!needle || (item.getAttribute('data-search') || '').indexOf(needle) > -1);
        if (match) {
          shown += 1;
          if (item.hidden) {
            item.hidden = false;
            item.classList.add('gdb-enter');
            requestAnimationFrame(function () { requestAnimationFrame(function () { item.classList.remove('gdb-enter'); }); });
          }
          item.classList.add('is-visible');
        } else item.hidden = true;
      });
      $$('[data-gdb-topic]', root).forEach(function (chip) {
        var active = chip.getAttribute('data-gdb-topic') === filter.topic;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      var empty = root.querySelector('#gdb-filter-empty');
      if (empty) empty.hidden = shown > 0;
    }

    root.addEventListener('click', function (event) {
      var topic = event.target.closest('[data-gdb-topic]');
      if (topic) { filter.topic = topic.getAttribute('data-gdb-topic'); applyFilters(); return; }
      var jump = event.target.closest('[data-gdb-jump]');
      if (jump) {
        var target = document.getElementById(jump.getAttribute('data-gdb-jump'));
        if (target) scrollToElement(target);
        var details = jump.closest('details');
        if (details) details.removeAttribute('open');
        return;
      }
      var actionEl = event.target.closest('[data-gdb-action]');
      var action = actionEl && actionEl.getAttribute('data-gdb-action');
      if (action === 'scroll-stories') {
        var stories = document.getElementById('gdb-stories');
        if (stories) scrollToElement(stories);
      } else if (action === 'clear-filters') {
        filter.topic = 'all';
        filter.query = '';
        var input = root.querySelector('#gdb-search');
        if (input) input.value = '';
        applyFilters();
      } else if (action === 'copy-link') {
        var url = actionEl.getAttribute('data-url') || location.href;
        var copied = function () { showToast('Story link copied', '🔗'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(copied).catch(function () { window.prompt('Copy this link', url); });
        else window.prompt('Copy this link', url);
      }
    });

    var search = root.querySelector('#gdb-search');
    var searchTimer = null;
    if (search) search.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { filter.query = search.value; applyFilters(); }, 120);
    });

    if (finePointer && !reduceMotion) {
      $$('.gdb-card-link, .gdb-featured-link', root).forEach(function (cardLink) {
        var frame = 0;
        cardLink.addEventListener('pointermove', function (event) {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(function () {
            var rect = cardLink.getBoundingClientRect();
            var x = (event.clientX - rect.left) / rect.width - 0.5;
            var y = (event.clientY - rect.top) / rect.height - 0.5;
            var strength = cardLink.classList.contains('gdb-featured-link') ? 3 : 6;
            cardLink.style.setProperty('--rx', (-y * strength).toFixed(2) + 'deg');
            cardLink.style.setProperty('--ry', (x * strength).toFixed(2) + 'deg');
            cardLink.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
            cardLink.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
          });
        });
        cardLink.addEventListener('pointerleave', function () {
          cancelAnimationFrame(frame);
          cardLink.style.removeProperty('--rx');
          cardLink.style.removeProperty('--ry');
        });
      });
    }

    var bar = root.querySelector('#gdb-progress-bar');
    var article = root.querySelector('.gdb-article');
    var cover = root.querySelector('[data-gdb-parallax]');
    var heroMedia = root.querySelector('.gdb-hero-media');
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        if (bar && article) {
          var rect = article.getBoundingClientRect();
          var total = rect.height - window.innerHeight * 0.6;
          var progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
          bar.style.transform = 'scaleX(' + progress + ')';
        }
        if (!reduceMotion && cover) {
          var c = cover.getBoundingClientRect();
          if (c.bottom > 0 && c.top < window.innerHeight) cover.style.setProperty('--py', (c.top * -0.06).toFixed(1) + 'px');
        }
        if (!reduceMotion && heroMedia && window.scrollY < window.innerHeight * 1.2) {
          heroMedia.style.setProperty('--hy', (window.scrollY * 0.35).toFixed(1) + 'px');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var tocButtons = $$('[data-gdb-toc]', root);
    if (tocButtons.length && 'IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocButtons.forEach(function (btn) { btn.classList.toggle('is-active', btn.getAttribute('data-gdb-toc') === entry.target.id); });
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      tocButtons.forEach(function (btn) {
        var heading = document.getElementById(btn.getAttribute('data-gdb-toc'));
        if (heading) tio.observe(heading);
      });
    }

    $$('img.gdb-img, .gdb-article-body img', root).forEach(function (img) {
      if (img.complete) img.classList.add('is-loaded');
      else img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
    });
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  function start() {
    renderHeaderCounts();
    renderWishlistButtons();
    renderCartDrawer();
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('change', onDocumentChange);
    document.addEventListener('keydown', onKeydown);
    initLiveSearch();
    bindForms();
    initProductPage();
    initCollectionSlider();
    initHeroVideo();
    bindSiteImageHandling();
    bindPhotoLoading();
    trackFirstScreenPhotos();
    initBlogPage();
    initBrandCloth();
    // Bag and wishlist changed in another tab: keep this one in step.
    window.addEventListener('storage', function (e) {
      if (e.key === 'gd-cart') { state.cart = readJSON('gd-cart', []); renderHeaderCounts(); renderCartDrawer(); }
      if (e.key === 'gd-wishlist') { state.wishlist = readJSON('gd-wishlist', []); renderHeaderCounts(); renderWishlistButtons(); }
    });
    // Warm the catalogue for search and wishlist once the page is idle.
    var warm = function () { loadCatalog().catch(function () {}); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 6000 });
    else setTimeout(warm, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
