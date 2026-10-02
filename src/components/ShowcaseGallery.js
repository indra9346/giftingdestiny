export function renderShowcaseGallery() {
  const galleryItems = [
    {
      title: 'Precision Metallic & Executive Pens',
      subtitle: 'Laser Engraved Branding',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/6-4.webp',
      cat: 'pens'
    },
    {
      title: 'Ceramic Sublimation Mugs',
      subtitle: 'Glossy Finish & Custom Prints',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle-600x648.webp',
      cat: 'sublimation-mugs'
    },
    {
      title: 'Authentic Gifting Destiny Inks',
      subtitle: 'Vibrant Sublimation Inks & Accessories',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/case-studies-img-4.webp',
      cat: 'accessories'
    },
    {
      title: 'Luxury Leatherette Wallets & Sets',
      subtitle: 'Corporate Presentation Boxes',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/2-2-1.webp',
      cat: 'diaries'
    },
    {
      title: 'Industrial Sublimation Heat Presses',
      subtitle: 'Production Grade Printing Equipment',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/Machine-1.webp',
      cat: 'machines'
    },
    {
      title: 'Bespoke Keychains & Rings',
      subtitle: 'Laser Etched Metal & Leather',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/1-2.webp',
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
                  <div class="gallery-overlay-content">
                    <span class="gallery-badge">Gifting Destiny</span>
                    <h3 class="gallery-item-title">${item.title}</h3>
                    <p class="gallery-item-sub">${item.subtitle}</p>
                    <span class="gallery-explore-link">Browse Collection →</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
