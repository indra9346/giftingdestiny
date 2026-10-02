import { csvProducts } from '../data/csvProducts.js';
import { categories, matchProductCategory, getCategoryBySlugOrAlias, categoryAliases } from '../data/categories.js';
import { store } from '../utils/store.js';
import { icon } from './icons.js';

export function renderProductCatalog(state, isFullPage = false) {
  const selectedCatId = state.selectedCategory || 'all';
  const searchQuery = (state.searchQuery || '').toLowerCase().trim();

  // Find category object from authoritative live list or aliases
  const activeCategoryObj = getCategoryBySlugOrAlias(selectedCatId);
  const canonicalSlug = categoryAliases[selectedCatId.toLowerCase().trim()] || selectedCatId.toLowerCase().trim();

  // Filter products using the robust category matcher
  let filtered = csvProducts.filter(p => {
    const matchCat = matchProductCategory(p, selectedCatId);

    let matchSearch = true;
    if (searchQuery) {
      matchSearch = p.name.toLowerCase().includes(searchQuery) ||
        p.categories.some(c => c.toLowerCase().includes(searchQuery)) ||
        (p.description && p.description.toLowerCase().includes(searchQuery));
    }

    return matchCat && matchSearch;
  });

  // Sorting
  if (state.sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortBy === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  // If on homepage, display top 8 curated products
  const displayProducts = isFullPage ? filtered.slice(0, state.visibleProducts || 16) : filtered.slice(0, 8);
  const activeCategoryTitle = activeCategoryObj ? activeCategoryObj.name : 'All Collections';

  return `
    <section class="section catalog-section" id="products-catalog-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header catalog-header">
          <div class="section-eyebrow">
            <span>OUR COLLECTION</span>
          </div>
          <h2 class="section-title">
            ${isFullPage ? activeCategoryTitle : 'Featured Product Catalogue'}
          </h2>
          <p class="section-subtitle">
            ${isFullPage 
              ? `Showing ${filtered.length} authentic handcrafted items available for bespoke customization & bulk dispatch.`
              : 'Explore our signature personalized pens, sublimation bottles, plush fur cushions, and luxury gift hampers.'
            }
          </p>
        </div>

        <!-- Category Filter Pills Bar (Printsoon & GD Inspired) -->
        <div class="catalog-filter-bar">
          <div class="category-pills-scroll">
            <button 
              type="button" 
              class="cat-filter-pill ${canonicalSlug === 'all' || selectedCatId === 'all' ? 'active' : ''}" 
              data-cat="all"
            >
              All (${csvProducts.length})
            </button>
            ${categories.map(c => `
              <button 
                type="button" 
                class="cat-filter-pill ${canonicalSlug === c.id || selectedCatId === c.id ? 'active' : ''}" 
                data-cat="${c.id}"
              >
                ${c.name} (${c.count})
              </button>
            `).join('')}
          </div>

          ${isFullPage ? `
            <div class="catalog-sort-box">
              <label for="catalog-sort-select" class="sort-label">Sort By:</label>
              <select id="catalog-sort-select" class="sort-select">
                <option value="featured" ${state.sortBy === 'featured' ? 'selected' : ''}>Featured</option>
                <option value="name-asc" ${state.sortBy === 'name-asc' ? 'selected' : ''}>Name (A to Z)</option>
                <option value="name-desc" ${state.sortBy === 'name-desc' ? 'selected' : ''}>Name (Z to A)</option>
              </select>
            </div>
          ` : ''}
        </div>

        <!-- Products Grid (4 columns matching Screenshot 5 & Printsoon) -->
        ${filtered.length === 0 ? `
          <div class="empty-results-box ${canonicalSlug === 'mugs' ? 'mugs-empty-box' : ''}">
            <span class="empty-icon">${canonicalSlug === 'mugs' ? icon.cup : icon.search}</span>
            <h3>${canonicalSlug === 'mugs' ? 'Category "Mugs" (0 Published Products)' : 'No products found'}</h3>
            <p>
              ${canonicalSlug === 'mugs' 
                ? 'In the live WooCommerce catalogue, the generic <strong>Mugs</strong> category currently has 0 published products. All 7 customized ceramic mugs and heart-handle gift cups are catalogued under <strong>Sublimation Mugs</strong>.'
                : `We couldn't find any products matching "${state.searchQuery || selectedCatId}".`
              }
            </p>
            <div style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; margin-top: 1.25rem;">
              ${canonicalSlug === 'mugs' ? `
                <button type="button" class="btn btn-gd-primary" data-cat="sublimation-mugs">
                  <span>Browse Sublimation Mugs (7 Items) →</span>
                </button>
              ` : ''}
              <button type="button" class="btn btn-gd-outline" data-cat="all">
                <span>View All Products (${csvProducts.length})</span>
              </button>
            </div>
          </div>
        ` : `
          <div class="products-grid-4col">
            ${displayProducts.map(p => {
              const isWishlisted = store.isWishlisted(p.id);
              const primaryCat = p.categories[0] || 'Gifts';

              return `
                <div class="product-card" data-product-id="${p.id}">
                  <!-- Card Image Wrap -->
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

                  <!-- Card Body -->
                  <div class="product-card-body">
                    <span class="product-card-cat" data-cat="${primaryCat}">${primaryCat}</span>
                    <h3 class="product-card-title" data-action="view-pdp" data-id="${p.id}" title="${p.name}">
                      ${p.name}
                    </h3>
                    
                    <div class="product-card-status">
                      <span class="stock-indicator">
                        <span class="stock-dot"></span> In Stock
                      </span>
                      <span class="custom-ready">Customization Ready</span>
                    </div>

                    <!-- Card Actions -->
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
                      >
                        <span>${icon.bag}</span><span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

        ${isFullPage && displayProducts.length < filtered.length ? `
          <div class="catalog-view-all-row">
            <button type="button" class="btn btn-gd-outline" data-action="load-more-products">
              Show More Products (${filtered.length - displayProducts.length} remaining)
            </button>
          </div>
        ` : ''}

        ${!isFullPage && filtered.length > 8 ? `
          <div class="catalog-view-all-row">
            <button class="btn btn-gd-outline" data-view="shop" data-cat="${selectedCatId}">
              <span>View All ${activeCategoryTitle} (${filtered.length} Items)</span>
              <span>→</span>
            </button>
          </div>
        ` : ''}
      </div>
    </section>
  `;
}
