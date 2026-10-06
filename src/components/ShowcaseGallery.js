export function renderShowcaseGallery() {
  const galleryItems = [
    {
      title: 'Precision Metallic & Executive Pens',
      subtitle: 'Laser Engraved Branding',
      image: '/images/categories/pen.webp',
      cat: 'pen'
    },
    {
      title: 'Ceramic Sublimation Mugs',
      subtitle: 'Glossy Finish & Custom Prints',
      image: '/images/categories/sublimation-mugs.webp',
      cat: 'sublimation-mugs'
    },
    {
      title: 'Authentic Gifting Destiny Inks',
      subtitle: 'Vibrant Sublimation Inks & Accessories',
      image: '/images/categories/sublimation-accessories.webp',
      cat: 'sublimation-accessories'
    },
    {
      title: 'Luxury Executive Combo Hampers',
      subtitle: 'Corporate Presentation Boxes',
      image: '/images/categories/combo-sets.webp',
      cat: 'combo-sets'
    },
    {
      title: 'Industrial Sublimation Heat Presses',
      subtitle: 'Production Grade Printing Equipment',
      image: '/images/categories/machine.webp',
      cat: 'machine'
    },
    {
      title: 'Bespoke Keychains & Rings',
      subtitle: 'Laser Etched Metal & Bamboo',
      image: '/images/categories/keychains.webp',
      cat: 'keychains'
    }
  ];

  return `
    <section class="section gd-gallery-section" id="gallery-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>REAL ATELIER CREATIONS</span>
          </div>
          <h2 class="section-title">
            Crafted In Our <span class="highlight-maroon">Bengaluru Studio</span>
          </h2>
          <p class="section-subtitle">
            Authentic photography from our production floor: laser engraved stationery, sublimation blanks, and custom executive keepsakes.
          </p>
        </div>

        <div class="gd-gallery-grid">
          ${galleryItems.map(item => `
            <div class="gd-gallery-card" data-cat="${item.cat}">
              <div class="gallery-img-wrap">
                <img src="${item.image}" alt="${item.title}" loading="lazy" />
                <div class="gallery-overlay">
                  <div class="gallery-badge">Authentic Studio Photo</div>
                  <h3 class="gallery-title">${item.title}</h3>
                  <p class="gallery-subtitle">${item.subtitle}</p>
                  <button type="button" class="btn btn-outline-white gallery-cta-btn" data-cat="${item.cat}">
                    View Collection
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
