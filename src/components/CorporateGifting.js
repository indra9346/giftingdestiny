import { icon } from './icons.js';

export function renderCorporateGifting() {
  return `
    <section class="section gd-corporate-banner-section" id="corporate-gifting-section">
      <div class="container">
        <!-- Main Corporate Banner matching Screenshot 3 -->
        <div class="gd-corporate-banner">
          <div class="corp-banner-content">
            <h2 class="corp-banner-title">Corporate Gifting Solutions</h2>
            
            <div class="corp-divider">
              <span class="corp-dash"></span>
              <span class="corp-icon">❖</span>
              <span class="corp-dash"></span>
            </div>

            <p class="corp-banner-desc">
              Strengthen relationships with thoughtfully curated corporate gifts that reflect your brand's values. Perfect for:
            </p>

            <div class="corp-tags-list">
              <div class="corp-tag-btn">
                <span class="tag-bullet">✦</span>
                <span>Employee onboarding &amp; rewards</span>
              </div>
              <div class="corp-tag-btn">
                <span class="tag-bullet">✦</span>
                <span>Client appreciation</span>
              </div>
              <div class="corp-tag-btn">
                <span class="tag-bullet">✦</span>
                <span>Festive &amp; seasonal gifting</span>
              </div>
              <div class="corp-tag-btn">
                <span class="tag-bullet">✦</span>
                <span>Events, conferences &amp; promotions</span>
              </div>
            </div>

            <div class="corp-action-row">
              <button type="button" class="btn btn-navy-enquire" id="corp-enquire-btn" data-action="open-enquiry">
                Enquire Now
              </button>
              <button type="button" class="btn btn-wa-direct" id="corp-wa-btn">
                <span>${icon.whatsapp} Corporate WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Right: Real local executive gift set photo -->
          <div class="corp-banner-visual">
            <img 
              src="/images/categories/combo-sets.webp"
              alt="Executive gift set with a pen, diary and keychain"
              class="corp-box-img"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  `;
}
