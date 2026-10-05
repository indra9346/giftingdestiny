import { categories } from '../data/categories.js';

export function renderCollectionSlider() {
  // Ordered categories matching live site reference in Pic 3
  const sliderItems = [
    {
      id: 'pens',
      title: 'Pens',
      subtitle: 'Corporate',
      image: '/images/categories/pens.jpg',
      badge: 'Bestseller'
    },
    {
      id: 'bottles',
      title: 'Bottles',
      subtitle: 'Steel',
      image: '/images/categories/bottles.jpg',
      badge: 'Trending'
    },
    {
      id: 'combo',
      title: 'Combo',
      subtitle: 'Bundles',
      image: '/images/categories/combo.jpg',
      badge: 'VIP Sets'
    },
    {
      id: 'pillows',
      title: 'Pillows',
      subtitle: 'Print',
      image: '/images/categories/pillows.jpg',
      badge: 'Photo Gifts'
    },
    {
      id: 'keychains',
      title: 'Keychains',
      subtitle: 'Custom',
      image: '/images/categories/keychains.jpg',
      badge: 'Popular'
    },
    {
      id: 'diaries',
      title: 'Diaries',
      subtitle: 'Executive',
      image: '/images/categories/diaries.jpg',
      badge: 'Notebooks'
    },
    {
      id: 'sublimation-mugs',
      title: 'Sublimation Mugs',
      subtitle: 'Ceramic',
      image: '/images/categories/sublimation-mugs.jpg',
      badge: 'Dual Tone'
    },
    {
      id: 'machines',
      title: 'Machines',
      subtitle: 'Press',
      image: '/images/categories/machines.jpg',
      badge: 'Heavy Duty'
    },
    {
      id: 'frames',
      title: 'Frames',
      subtitle: 'LED Light',
      image: '/images/categories/frames.jpg',
      badge: 'Acrylic 3D'
    }
  ];

  return `
    <section class="section collection-slider-section" id="collection-slider-section">
      <div class="container">
        <!-- Section Header matching Pic 3 -->
        <div class="section-header collection-slider-header">
          <div class="section-eyebrow">
            <span>OUR COLLECTION</span>
          </div>
          <h2 class="section-title">
            Premium Gifting Products
          </h2>
          <div class="header-divider-accent"></div>
        </div>

        <!-- Slider Wrapper with Navigation Arrows -->
        <div class="slider-outer-wrapper">
          <!-- Left Arrow Button -->
          <button 
            type="button" 
            class="slider-nav-arrow slider-prev-btn" 
            id="collection-prev-btn" 
            aria-label="Previous Category"
          >
            &#10094;
          </button>

          <!-- Sliding Track -->
          <div class="collection-cards-track" id="collection-cards-track" aria-label="Gift collections">
            ${[...sliderItems, ...sliderItems].map((item, index) => `
              <div class="collection-slide-card" ${index >= sliderItems.length ? 'aria-hidden="true"' : ''}>
                <div class="slide-card-img-wrap">
                  <img 
                    src="${item.image}" 
                    alt="${item.title}" 
                    class="slide-card-img" 
                    loading="lazy" 
                  />
                  <div class="slide-card-wood-deck"></div>
                </div>

                <div class="slide-card-body">
                  <h3 class="slide-card-title">${item.title}</h3>
                  <span class="slide-card-subtitle">${item.subtitle}</span>
                  
                  <button type="button" class="slide-card-view-btn" data-cat="${item.id}" tabindex="${index >= sliderItems.length ? '-1' : '0'}">
                    View
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right Arrow Button -->
          <button 
            type="button" 
            class="slider-nav-arrow slider-next-btn" 
            id="collection-next-btn" 
            aria-label="Next Category"
          >
            &#10095;
          </button>
        </div>

        <!-- Slider Progress Indicator Dots -->
        <div class="slider-dots-row" id="collection-slider-dots">
          ${sliderItems.map((_, idx) => `
            <button 
              type="button" 
              class="slider-dot ${idx === 0 ? 'active' : ''}" 
              data-slide-index="${idx}" 
              aria-label="Go to slide ${idx + 1}"
            ></button>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
