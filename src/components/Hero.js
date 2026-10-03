export function renderHero() {
  return `
    <section class="hero-video-banner" aria-label="Gifting Destiny">
      <div class="hero-video-container">
        <video
          class="hero-video-element"
          id="hero-bgv"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          aria-label="Gifting Destiny luxury brand film"
        >
          <source src="/gifting-destiny-brand-film.mp4" type="video/mp4" />
        </video>
        <div class="hero-video-scrim" aria-hidden="true"></div>
      </div>
      <div class="hero-video-content-wrap">
        <div class="hero-video-text-box">
          <div class="hero-video-badge">
            <span class="badge-sparkle">✨</span>
            <span>BESPOKE PERSONALIZATION ATELIER • BENGALURU</span>
          </div>
          <h1 class="hero-video-title">Crafted with Love &amp; Care</h1>
          <p class="hero-video-subtitle">Personalised Gifts for Every Milestone</p>
          <p class="hero-video-desc">
            Laser-engraved thermal drinkware, executive presentation pens, bespoke corporate onboarding hampers, and handcrafted keepsakes.
          </p>
          <div class="hero-video-cta-row">
            <button type="button" class="btn btn-hero-gold" data-view="shop" data-cat="all">
              <span>Explore Collections</span><span aria-hidden="true">→</span>
            </button>
            <button type="button" class="btn btn-hero-enquire" data-action="open-enquiry">
              Enquire Now
            </button>
            <button type="button" class="btn btn-hero-translucent" data-view="corporate">
              Corporate Gifting
            </button>
          </div>
          <div class="hero-video-perks">
            <div class="perk-tag">
              <span class="perk-icon">⚡</span>
              <span>Fast Atelier Dispatch</span>
            </div>
            <div class="perk-tag">
              <span class="perk-icon">🎨</span>
              <span>Free Custom Mockup</span>
            </div>
            <div class="perk-tag">
              <span class="perk-icon">💼</span>
              <span>Bulk Corporate Pricing</span>
            </div>
            <div class="perk-tag">
              <span class="perk-icon">⭐</span>
              <span>4.9/5 Studio Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
