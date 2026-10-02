import { categories } from '../data/categories.js';

export function renderCategoryGrid() {
  return `
    <section class="section category-bar-section" id="categories-section">
      <div class="container">
        <!-- Category Row matching Gifting Destiny WordPress Reference (Screenshot 2 & 3) -->
        <div class="gd-category-slider-row">
          ${categories.slice(0, 6).map(cat => `
            <div class="gd-category-item-card" data-cat="${cat.id}">
              <div class="gd-cat-icon-circle">
                ${getCategorySvgIcon(cat.id)}
              </div>
              <div class="gd-cat-info">
                <span class="gd-cat-title">${cat.name}</span>
                <span class="gd-cat-subtitle">${cat.tagline.split(' ')[0]} Collection</span>
              </div>
              <button type="button" class="gd-cat-view-btn" data-cat="${cat.id}">
                View
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function getCategorySvgIcon(catId) {
  switch (catId) {
    case 'keychains':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4"/><path d="M10.85 10.85L19 19"/><path d="M16 16l3 3"/><path d="M19 13l2 2"/></svg>`;
    case 'pens':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;
    case 'bottles':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v3H9z"/><path d="M10 5v2.5a3 3 0 0 1-.88 2.12l-.24.24a5 5 0 0 0-1.46 3.54V20a2 2 0 0 0 2 2h5.16a2 2 0 0 0 2-2v-6.6a5 5 0 0 0-1.46-3.54l-.24-.24A3 3 0 0 1 14 7.5V5"/></svg>`;
    case 'pillows':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    case 'diaries':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`;
    case 'machines':
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>`;
    default:
      return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
  }
}
