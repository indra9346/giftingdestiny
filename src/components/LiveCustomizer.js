export function renderLiveCustomizer() {
  return `
    <section class="section customizer-section" id="customizer-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>✨</span>
            <span>INTERACTIVE STUDIO</span>
          </div>
          <h2 class="section-title">
            Design Your <span class="text-foil">Personalized Gift</span> in Real-Time
          </h2>
          <p class="section-subtitle">
            See your recipient's name, initials, or heartfelt quote rendered instantly on our premium gifts before our artisans engrave or sublimate them.
          </p>
        </div>

        <div class="customizer-container">
          <!-- 3D Preview Stage Canvas -->
          <div class="preview-stage-wrapper" id="customizer-stage">
            <div class="stage-product-base">
              <img 
                id="customizer-preview-img" 
                src="https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle-600x648.webp" 
                alt="Personalized Gift Preview" 
              />
              <div class="stage-live-overlay">
                <span class="live-custom-text script" id="live-custom-display">Priya & Vikram</span>
                <span id="live-custom-subtext" style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.25rem; font-family: var(--font-cinzel); letter-spacing: 0.15em;">EST. 2026</span>
              </div>
            </div>

            <div class="live-badge-glow">
              <span>✦</span>
              <span>Live Sublimation & Laser Preview</span>
            </div>
          </div>

          <!-- Studio Customization Controls -->
          <div class="customizer-controls">
            <!-- 1. Select Product -->
            <div class="control-group">
              <label class="control-label">1. Choose Canvas Item</label>
              <div class="product-picker-pills" id="custom-product-picker">
                <div class="pill-item active" data-product="mug" data-img="https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle-600x648.webp" data-name="Heart-Handle Sublimation Mug" data-price="399" data-id="gd-mug-01">
                  ☕ Heart Mug
                </div>
                <div class="pill-item" data-product="pen" data-img="https://giftingdestiny.com/wp-content/uploads/2026/01/Pen-1.webp" data-name="Matte Black Laser Pen" data-price="499" data-id="gd-pen-01">
                  ✒️ Laser Pen
                </div>
                <div class="pill-item" data-product="bottle" data-img="https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Sublimation-White-Stainless-Steel-Water-Bottle-1.webp" data-name="Insulated Stainless Bottle" data-price="799" data-id="gd-bottle-01">
                  🍶 Steel Flask
                </div>
                <div class="pill-item" data-product="cushion" data-img="https://giftingdestiny.com/wp-content/uploads/2026/01/Premium-Customizable-Heart-Shaped-Fur-Cushion-%E2%80%93-Elegant-Gold-Plush-with-White-Personalization-Panel-1.webp" data-name="Gilded Heart Fur Cushion" data-price="899" data-id="gd-pillow-01">
                  🛋️ Fur Cushion
                </div>
              </div>
            </div>

            <!-- 2. Custom Inscription Text -->
            <div class="control-group">
              <label class="control-label">2. Recipient Name or Custom Message</label>
              <input 
                type="text" 
                class="custom-input" 
                id="custom-text-input" 
                value="Priya & Vikram" 
                placeholder="Enter recipient name, monogram, or quote..." 
                maxlength="32"
              />
              <div style="display: flex; justify-content: space-between; margin-top: 0.4rem; font-size: 0.72rem; color: var(--text-muted);">
                <span>Max 32 characters for ideal engraving clarity</span>
                <span id="char-counter">14/32</span>
              </div>
            </div>

            <!-- 3. Choose Typography Style -->
            <div class="control-group">
              <label class="control-label">3. Typography & Engraving Style</label>
              <div class="font-picker-group" id="font-picker">
                <div class="font-option script-font active" data-font="script">
                  Signature Script
                </div>
                <div class="font-option serif-font" data-font="serif">
                  Modern Serif
                </div>
                <div class="font-option modern-font" data-font="modern">
                  Classic Roman
                </div>
              </div>
            </div>

            <!-- 4. Metallic Foil / Ink Color -->
            <div class="control-group">
              <label class="control-label">4. Foil & Engraving Hue</label>
              <div class="color-swatches" id="color-swatches">
                <div class="swatch active" style="background: linear-gradient(135deg, #d4af37, #aa771c);" data-color="#d4af37" title="Champagne Gold"></div>
                <div class="swatch" style="background: linear-gradient(135deg, #ff758f, #c9184a);" data-color="#ff758f" title="Rose Gold"></div>
                <div class="swatch" style="background: #ffffff;" data-color="#ffffff" title="Pure White"></div>
                <div class="swatch" style="background: #111827; border: 1px solid #d4af37;" data-color="#111827" title="Obsidian Black"></div>
              </div>
            </div>

            <!-- Pricing & Action Row -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); margin-top: 2rem;">
              <div>
                <span style="font-size: 0.78rem; color: var(--text-muted); display: block;">Item + Custom Inscription:</span>
                <span style="font-family: var(--font-cinzel); font-size: 1.6rem; font-weight: 700; color: var(--gold-light);" id="customizer-price">₹399</span>
              </div>

              <button class="btn btn-primary" id="add-customized-cart-btn">
                <span>✨ Add Personalized to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
