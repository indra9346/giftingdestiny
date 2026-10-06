import { icon } from './icons.js';

export function renderAboutSection(isFullPage = false) {
  return `
    <section class="section gd-story-section" id="about-section">
      <div class="container">
        <div class="gd-story-grid">
          <!-- Left: Stacked photos from the local product catalogue -->
          <div class="gd-story-visual-wrap">
            <div class="story-img-main">
              <img 
                src="/images/categories/combo-sets.webp"
                alt="Executive gift set with a pen, diary and keychain"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            </div>
            <div class="story-img-floating">
              <img 
                src="/images/categories/pillow.webp"
                alt="Red heart-shaped decorative gift cushion"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
            </div>
          </div>

          <!-- Right: Gifting Destiny Authentic Text (Screenshot 2) -->
          <div class="gd-story-content">
            <div class="story-eyebrow-line">
              <span class="eyebrow-dash"></span>
              <span class="eyebrow-text">GIFTING DESTINY</span>
              <span class="eyebrow-dash"></span>
            </div>

            <h2 class="gd-story-title">
              Your One-Stop Destination for <span class="highlight-maroon">Meaningful &amp; Memorable Gifts</span>
            </h2>

            <div class="gd-story-divider">
              <span class="divider-dot">✦</span>
            </div>

            <p class="gd-story-paragraph">
              Your trusted destination for premium, personalized and purposeful gifting solutions. We believe every gift tells a story of appreciation, celebration, gratitude and connection. Crafted with love and care, our curated gifting collections are designed to leave a lasting impression, whether for personal celebrations or professional milestones.
            </p>

            <div class="gd-story-actions">
              <button type="button" class="btn btn-navy-enquire" id="story-enquire-btn" data-action="open-enquiry">
                Enquire Now
              </button>
              <button type="button" class="btn btn-gd-outline" data-view="shop">
                Explore Collections →
              </button>
            </div>

            <!-- Pillars -->
            <div class="story-features-row">
              <div class="story-feat-item">
                <span class="feat-icon">${icon.gem}</span>
                <span class="feat-text">Premium Materials</span>
              </div>
              <div class="story-feat-item">
                <span class="feat-icon">🎨</span>
                <span class="feat-text">Laser &amp; Sublimation</span>
              </div>
              <div class="story-feat-item">
                <span class="feat-icon">${icon.pin}</span>
                <span class="feat-text">Bengaluru Studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
