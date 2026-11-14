    <div class="enquiry-drawer-overlay" id="enquiry-drawer-overlay">
      <div class="enquiry-drawer" role="dialog" aria-label="Direct Atelier Enquiry">
        <div class="enquiry-drawer-header">
          <div class="drawer-title-group">
            <span class="enquiry-header-icon"><?= icon('gem') ?></span>
            <div>
              <h3 class="enquiry-drawer-title">Gifting Destiny Enquiry</h3>
              <span class="enquiry-drawer-subtitle">Direct Atelier Quotes &amp; Corporate Bulk Orders</span>
            </div>
          </div>
          <button class="enquiry-close-btn" id="enquiry-close-btn" type="button" aria-label="Close enquiry form">&times;</button>
        </div>

        <div class="enquiry-drawer-body">
          <!-- WhatsApp Quick Action Banner -->
          <div class="enquiry-wa-banner">
            <div class="wa-banner-text">
              <strong>Need an immediate digital mock-up?</strong>
              <p>Chat directly with our Bengaluru studio director on WhatsApp.</p>
            </div>
            <a href="<?= e(wa_link('Hello Gifting Destiny! I want to enquire about personalized gifting solutions.')) ?>" target="_blank" rel="noopener" class="btn btn-wa-banner">
              <span><?= icon('whatsapp') ?> Instant WhatsApp Chat</span>
            </a>
          </div>

          <!-- Structured Enquiry Form (saved for the team in the admin panel) -->
          <form id="enquiry-drawer-form" class="enquiry-styled-form">
            <div class="form-section-label">Contact Details</div>

            <div class="form-row-2col">
              <div class="form-field">
                <label for="enquiry-name">Your Full Name <span class="required">*</span></label>
                <input type="text" id="enquiry-name" name="name" required maxlength="120" placeholder="e.g. Rahul Verma" class="form-styled-input" autocomplete="name" />
              </div>

              <div class="form-field">
                <label for="enquiry-phone">Phone / WhatsApp <span class="required">*</span></label>
                <input type="tel" id="enquiry-phone" name="phone" required maxlength="40" placeholder="+91 86609 40018" class="form-styled-input" autocomplete="tel" />
              </div>
            </div>

            <div class="form-row-2col">
              <div class="form-field">
                <label for="enquiry-email">Email Address <span class="required">*</span></label>
                <input type="email" id="enquiry-email" name="email" required maxlength="160" placeholder="rahul@company.com" class="form-styled-input" autocomplete="email" />
              </div>

              <div class="form-field">
                <label for="enquiry-qty">Estimated Quantity <span class="required">*</span></label>
                <input type="number" id="enquiry-qty" name="quantity" min="1" value="1" class="form-styled-input" />
              </div>
            </div>

            <div class="form-section-label">Gifting Requirement</div>

            <div class="form-field">
              <label for="enquiry-category">Category of Interest</label>
              <select id="enquiry-category" name="category" class="form-styled-select">
                <option value="Corporate Onboarding & VIP Kits">Corporate Onboarding &amp; VIP Kits</option>
                <option value="Engraved Executive Pens">Engraved Executive Pens</option>
                <option value="Stainless Steel Insulated Bottles">Stainless Steel Insulated Bottles</option>
                <option value="Customized Fur & Heart Cushions">Customized Fur &amp; Heart Cushions</option>
                <option value="Luxury Combo Gift Boxes">Luxury Combo Gift Boxes</option>
                <option value="Metal & Leather Keychains">Metal &amp; Leather Keychains</option>
                <option value="Sublimation Machinery & Blanks">Sublimation Machinery &amp; Blanks</option>
                <option value="Other Bespoke Requirement">Other Bespoke Requirement</option>
              </select>
            </div>

            <div class="form-field">
              <label for="enquiry-company">Company / Event Occasion (Optional)</label>
              <input type="text" id="enquiry-company" name="company" maxlength="160" placeholder="e.g. Infosys, Wedding, Milestone" class="form-styled-input" />
            </div>

            <div class="form-field">
              <label for="enquiry-notes">Customization Requirements &amp; Timeline</label>
              <textarea id="enquiry-notes" name="message" rows="3" maxlength="4000" placeholder="Tell us if you need laser engraving, full color printing, company logo, delivery city, or required date..." class="form-styled-textarea"></textarea>
            </div>

            <div class="gd-hp-field" aria-hidden="true">
              <label for="enquiry-website">Website</label>
              <input type="text" id="enquiry-website" name="website" tabindex="-1" autocomplete="off" />
            </div>

            <p class="gd-form-error" id="enquiry-form-error" role="alert" hidden></p>

            <div class="enquiry-form-actions">
              <button type="submit" class="btn btn-gd-primary btn-submit-enquiry">
                <span>Submit Official Enquiry →</span>
              </button>
            </div>
          </form>

          <div class="enquiry-security-notice">
            <span><?= icon('lock') ?> Direct inquiry to Gifting Destiny atelier in Prem Nagar, Bengaluru. No spam guaranteed.</span>
          </div>
        </div>
      </div>
    </div>
