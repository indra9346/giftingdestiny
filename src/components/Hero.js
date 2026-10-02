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
          aria-label="Gifting Destiny brand film"
        >
          <source src="/gifting-destiny-hd-promo-v2.mp4" type="video/mp4" />
        </video>
      </div>
      <div class="hero-video-content-wrap">
        <div class="hero-video-text-box">
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
        </div>
      </div>
    </section>
  `;
}
