export function renderBlogPage() {
  const articles = [
    {
      id: 'post-1',
      title: 'The Art of Corporate Onboarding: Why Personalized Gifts Create Lasting Loyalty',
      category: 'Corporate Gifting',
      date: 'January 2026',
      readTime: '4 min read',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/Gift-01.webp',
      excerpt: 'First impressions matter. Learn how bespoke engraved pens, smart temperature flasks, and custom notebooks elevate welcome kits for modern hybrid teams.'
    },
    {
      id: 'post-2',
      title: 'Laser Engraving vs Sublimation: Choosing the Right Technique for Your Gifts',
      category: 'Craftsmanship',
      date: 'February 2026',
      readTime: '5 min read',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/6-4.webp',
      excerpt: 'Discover the technical differences between high-precision vector laser etching on metals and molecular dye sublimation on ceramics and cushions.'
    },
    {
      id: 'post-3',
      title: 'Personalized Mugs & Cushions: Heartfelt Keepsakes for Milestone Celebrations',
      category: 'Personal Gifting',
      date: 'March 2026',
      readTime: '3 min read',
      image: 'https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle-600x648.webp',
      excerpt: 'How custom photo printing on plush heart cushions and dual-tone ceramic mugs turns simple photographs into cherished daily memories.'
    }
  ];

  return `
    <div class="blog-page">
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">✦ JOURNAL &amp; INSIGHTS</div>
          <h1 class="page-hero-title">Stories, Ideas &amp; Craftsmanship</h1>
          <p class="page-hero-subtitle">
            Tips on corporate gifting etiquette, sublimation care, and bespoke personalization from our Bengaluru studio.
          </p>
        </div>
      </div>

      <div class="container section">
        <div class="blog-grid">
          ${articles.map(art => `
            <article class="blog-card">
              <div class="blog-img-wrap">
                <img src="${art.image}" alt="${art.title}" loading="lazy" />
                <span class="blog-cat-badge">${art.category}</span>
              </div>
              <div class="blog-content">
                <div class="blog-meta">
                  <span>${art.date}</span> • <span>${art.readTime}</span>
                </div>
                <h2 class="blog-title">${art.title}</h2>
                <p class="blog-excerpt">${art.excerpt}</p>
                <button type="button" class="blog-read-btn" data-view="contact">
                  Discuss with Atelier →
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
