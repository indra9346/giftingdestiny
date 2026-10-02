import { icon } from './icons.js';

export function renderContactSection() {
  return `
    <section class="section contact-section" id="contact-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>${icon.pin}</span>
            <span>GET IN TOUCH</span>
          </div>
          <h2 class="section-title">
            Visit Our Atelier or <span class="text-gold-gradient">Request a Consultation</span>
          </h2>
          <p class="section-subtitle">
            Whether you need a single custom anniversary gift or 1,000 corporate welcome kits, our gifting specialists in Bengaluru are here to guide you.
          </p>
        </div>

        <div class="contact-grid">
          <!-- Left: Studio Details & Direct Links -->
          <div class="contact-info-card">
            <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: #ffffff; margin-bottom: 1.5rem;">
              Bengaluru Studio & Headquarters
            </h3>

            <div class="contact-item">
              <div class="contact-icon-box">${icon.pin}</div>
              <div>
                <div class="contact-detail-title">Address & Workshop</div>
                <div class="contact-detail-text">
                  108, 1st Main Road, 2nd Cross,<br>
                  Backside of Royalok Showroom, Outer Ring Road,<br>
                  Prem Nagar, Bengaluru, Karnataka 560058
                </div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box">${icon.phone}</div>
              <div>
                <div class="contact-detail-title">Direct Inquiries & Bulk Orders</div>
                <div class="contact-detail-text">
                  <a href="tel:+918660940018" style="color: var(--gold-light); font-weight: 700;">+91 8660940018</a>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">Mon - Sat, 9:30 AM - 8:00 PM IST</div>
                </div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box">${icon.mail}</div>
              <div>
                <div class="contact-detail-title">Email Correspondence</div>
                <div class="contact-detail-text">
                  <a href="mailto:support@giftingdestiny.com" style="color: var(--gold-light);">support@giftingdestiny.com</a>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">Average response time: &lt; 2 hours</div>
                </div>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon-box" style="background: rgba(37, 211, 102, 0.15); border-color: #25D366; color: #25D366;">${icon.whatsapp}</div>
              <div>
                <div class="contact-detail-title" style="color: #25D366;">Instant WhatsApp Channel</div>
                <div class="contact-detail-text">
                  Fastest mockups, logo evaluations & express quotes.
                  <div style="margin-top: 0.5rem;">
                    <a href="https://wa.me/918660940018?text=Hi%20Gifting%20Destiny,%20I%20would%20like%20to%20place%20an%20order" target="_blank" rel="noopener" class="btn btn-whatsapp" style="padding: 0.5rem 1.25rem; font-size: 0.82rem;">
                      <span>${icon.whatsapp} Chat on WhatsApp</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Quick Accordion -->
            <div style="margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
              <h4 style="font-family: var(--font-cinzel); font-size: 0.9rem; color: var(--gold-primary); margin-bottom: 0.85rem; letter-spacing: 0.08em;">
                FREQUENTLY ASKED QUESTIONS
              </h4>
              
              <details style="margin-bottom: 0.65rem; background: rgba(255, 255, 255, 0.03); padding: 0.65rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">What is the dispatch turnaround time?</summary>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">Personalized individual orders are dispatched within 24-48 hours. Corporate bulk orders usually take 3-5 business days depending on volume.</p>
              </details>

              <details style="margin-bottom: 0.65rem; background: rgba(255, 255, 255, 0.03); padding: 0.65rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">Can I send multiple individual employee gifts to home addresses?</summary>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">Yes! We provide multi-destination direct dispatch across 28,000+ pin codes in India with live tracking sent to each recipient.</p>
              </details>

              <details style="background: rgba(255, 255, 255, 0.03); padding: 0.65rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); cursor: pointer;">
                <summary style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">Do you supply blanks and sublimation heat press machines?</summary>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">Yes, we are authorized master distributors for 5-in-1 combo heat presses, polymer blank mugs, sublimation paper, and heat tape.</p>
              </details>
            </div>
          </div>

          <!-- Right: Interactive Consultation Form -->
          <div class="contact-form">
            <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: #ffffff; margin-bottom: 0.5rem;">
              Send an Enquiry
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.75rem;">
              Fill in your details below and our Bengaluru studio director will reach out within 2 hours.
            </p>

            <form id="consultation-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" id="form-name" required placeholder="e.g. Ananya Rao" />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" class="form-control" id="form-phone" required placeholder="+91 98765 43210" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input type="email" class="form-control" id="form-email" required placeholder="ananya@company.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Gifting Category</label>
                  <select class="form-control" id="form-category">
                    <option value="corporate-onboarding">Corporate Onboarding / Swag</option>
                    <option value="client-vip">VIP Client Appreciation</option>
                    <option value="personalized-gifts">Individual Personalized Gift</option>
                    <option value="sublimation-machine">Sublimation Machinery & Blanks</option>
                    <option value="other">Other Bespoke Requirement</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Estimated Quantity (Units)</label>
                <input type="number" class="form-control" id="form-qty" min="1" placeholder="e.g. 50 (or 1 for personal)" />
              </div>

              <div class="form-group">
                <label class="form-label">Customization Notes or Message</label>
                <textarea class="form-control" id="form-message" placeholder="Tell us about the occasion, preferred items, date required, or custom branding requirements..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.95rem; font-size: 1rem; margin-top: 0.5rem;">
                <span>✨ Submit Consultation Request</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}
