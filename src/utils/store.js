import { csvProducts } from '../data/csvProducts.js';

function readWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem('gd-wishlist') || '[]');
    return Array.isArray(saved) ? saved.filter(id => csvProducts.some(product => product.id === id)) : [];
  } catch {
    return [];
  }
}

class AppStore {
  constructor() {
    this.state = {
      currentView: 'home', // 'home', 'shop', 'product', 'corporate', 'about', 'contact', 'blog', 'faq'
      selectedCategory: 'all',
      selectedProductId: null,
      searchQuery: '',
      sortBy: 'featured',
      visibleProducts: 16,
      cart: [], // items: { id, name, category, image, quantity, customNotes }
      wishlist: readWishlist(),
      cartDrawerOpen: false,
      enquiryDrawerOpen: false,
      activeModal: null, // { type: 'account'|'quickView', data: any }
      theme: 'light' // default clean modern aesthetic matching reference
    };
    
    this.listeners = [];
  }

  toggleEnquiryDrawer(open = null) {
    this.state.enquiryDrawerOpen = open !== null ? open : !this.state.enquiryDrawerOpen;
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  setView(view, category = 'all') {
    this.state.currentView = view;
    this.state.activeModal = null;
    if (category) {
      this.state.selectedCategory = category;
    }
    this.state.visibleProducts = 16;
    this.syncLocation();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.notify();
  }

  navigateToProduct(productId) {
    const prod = csvProducts.find(p => p.id === productId || p.slug === productId);
    if (prod) {
      this.state.selectedProductId = prod.id;
      this.state.currentView = 'product';
      this.state.activeModal = null;
      this.syncLocation();
      window.scrollTo({ top: 0, behavior: 'instant' });
      this.notify();
    }
  }

  navigateToCategory(catId) {
    this.state.selectedCategory = catId;
    this.state.currentView = 'shop';
    this.state.activeModal = null;
    this.state.cartDrawerOpen = false;
    this.state.searchQuery = '';
    this.state.visibleProducts = 16;
    this.syncLocation();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.notify();
  }

  syncLocation() {
    const { currentView, selectedCategory, selectedProductId } = this.state;
    const route = currentView === 'product'
      ? `/product/${encodeURIComponent(csvProducts.find(p => p.id === selectedProductId)?.slug || selectedProductId)}`
      : currentView === 'shop'
        ? `/shop${selectedCategory && selectedCategory !== 'all' ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`
        : currentView === 'home' ? '/' : `/${currentView}`;
    if (location.hash.slice(1) !== route) history.pushState({}, '', `#${route}`);
  }

  restoreLocation() {
    const route = location.hash.slice(1) || '/';
    const [path, query = ''] = route.split('?');
    const view = path.split('/').filter(Boolean);
    if (view[0] === 'product' && view[1]) {
      const product = csvProducts.find(p => p.slug === decodeURIComponent(view[1]) || p.id === decodeURIComponent(view[1]));
      if (product) {
        this.state.currentView = 'product';
        this.state.selectedProductId = product.id;
      } else this.state.currentView = 'shop';
    } else if (view[0] === 'shop') {
      this.state.currentView = 'shop';
      this.state.selectedCategory = new URLSearchParams(query).get('category') || 'all';
    } else if (['corporate', 'about', 'contact', 'blog', 'faq'].includes(view[0])) {
      this.state.currentView = view[0];
    } else this.state.currentView = 'home';
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.notify();
  }

  setCategory(category) {
    this.state.selectedCategory = category;
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.state.visibleProducts = 16;
    if (this.state.currentView !== 'shop') {
      this.state.currentView = 'shop';
    }
    this.notify();
  }

  loadMoreProducts() {
    this.state.visibleProducts += 16;
    this.notify();
  }

  setSortBy(sortBy) {
    this.state.sortBy = sortBy;
    this.notify();
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.notify();
  }

  toggleCartDrawer(open = null) {
    this.state.cartDrawerOpen = open !== null ? open : !this.state.cartDrawerOpen;
    this.notify();
  }

  addToCart(product, customOptions = {}) {
    const existingIndex = this.state.cart.findIndex(
      item => item.id === product.id &&
              item.customNotes === (customOptions.customNotes || '') &&
              item.logoRequirement === Boolean(customOptions.logoRequirement)
    );

    const qty = customOptions.quantity || 1;

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += qty;
    } else {
      this.state.cart.push({
        id: product.id,
        name: product.name,
        category: product.primaryCategory || 'Gift Item',
        image: product.primaryImage || product.image,
        quantity: qty,
        customNotes: customOptions.customNotes || '',
        logoRequirement: customOptions.logoRequirement || false
      });
    }

    this.showToast(`Added "${product.name}" to your inquiry bag!`, '🎁');
    this.notify();
  }

  removeFromCart(index) {
    this.state.cart.splice(index, 1);
    this.notify();
  }

  updateQuantity(index, delta) {
    if (this.state.cart[index]) {
      this.state.cart[index].quantity = Math.min(100000, this.state.cart[index].quantity + delta);
      if (this.state.cart[index].quantity <= 0) {
        this.removeFromCart(index);
      } else {
        this.notify();
      }
    }
  }

  setQuantity(index, quantity) {
    const item = this.state.cart[index];
    const nextQuantity = Math.floor(Number(quantity));
    if (!item || !Number.isFinite(nextQuantity) || nextQuantity < 1) return;
    item.quantity = Math.min(nextQuantity, 100000);
    this.notify();
  }

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  toggleWishlist(productId) {
    const idx = this.state.wishlist.indexOf(productId);
    if (idx > -1) {
      this.state.wishlist.splice(idx, 1);
      this.showToast('Item removed from saved list.', '🤍');
    } else {
      this.state.wishlist.push(productId);
      this.showToast('Item saved to your wishlist!', '❤️');
    }
    try { localStorage.setItem('gd-wishlist', JSON.stringify(this.state.wishlist)); } catch {}
    this.notify();
  }

  isWishlisted(productId) {
    return this.state.wishlist.includes(productId);
  }

  openModal(modalConfig) {
    this.state.activeModal = modalConfig;
    this.notify();
  }

  closeModal() {
    this.state.activeModal = null;
    this.notify();
  }

  showToast(message, icon = '✨') {
    const existing = document.getElementById('luxury-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'luxury-toast';
    toast.className = 'luxury-toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}

export const store = new AppStore();
