import { videoReels } from '../data/products.js';

export function renderVideoReels() {
  return `
    <section class="section reels-section" id="video-reels-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>▶</span>
            <span>GIFTING IN MOTION</span>
          </div>
          <h2 class="section-title">
            Watch the <span class="text-gold-gradient">Magic Unfold</span>
          </h2>
          <p class="section-subtitle">
            Experience the genuine emotion, precision laser crafting, dye-sublimation heat pressing, and luxury box unboxings captured live at our Bengaluru studio.
          </p>
        </div>

        <div class="reels-grid">
          ${videoReels.map((reel) => `
            <div class="reel-card" data-video-src="${reel.videoUrl}" data-title="${reel.title}" data-product="${reel.productLinked}">
              <video 
                class="reel-video" 
                muted 
                loop 
                playsinline 
                preload="metadata"
                poster="${reel.poster}"
              >
                <source src="${reel.videoUrl}" type="video/mp4" />
              </video>

              <div class="reel-overlay">
                <div class="reel-top">
                  <span class="reel-badge">${reel.category}</span>
                  <div class="reel-views">
                    <span>👁️</span>
                    <span>${reel.views}</span>
                  </div>
                </div>

                <div class="reel-center-play">
                  <span>▶</span>
                </div>

                <div class="reel-bottom">
                  <h3 class="reel-title">${reel.title}</h3>
                  <p class="reel-desc">${reel.description}</p>
                  
                  <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.72rem; color: var(--gold-light);">⏱️ ${reel.duration}</span>
                    <button class="reel-action-btn" data-product-id="${reel.productLinked}">
                      <span>🎁 View Item</span>
                      <span>→</span>
                    </button>
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
