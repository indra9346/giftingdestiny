import { icon } from './icons.js';

export function renderFooter() {
  const GD_PHONE = '918660940018'; // Verified from live site footer in Pic 4

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-main-grid">
          <!-- Column 1: Brand & Logo (Matching Pic 4) -->
          <div class="footer-col footer-brand-col">
            <div class="footer-brand-header">
              <img 
                src="/assets/logo.svg" 
                alt="Gifting Destiny Logo" 
                class="footer-logo-img-large" 
                width="140"
                height="140"
              />
            </div>
            
            <div class="footer-social-links-row">
              <a href="https://share.google/0StuE1c7UemMGpSlY" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Facebook">
                ${icon.facebook}
              </a>
              <a href="https://www.instagram.com/giftingdestiny.in?stkn=MTg5eHhwMG4ybW9meg==" target="_blank" rel="noopener" class="footer-social-btn" aria-label="Instagram">
                ${icon.instagram}
              </a>
              <a href="https://youtube.com/@giftingdestiny" target="_blank" rel="noopener" class="footer-social-btn" aria-label="YouTube">
                ${icon.youtube}
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links (Exact Pic 4) -->
          <div class="footer-col">
            <h4 class="footer-heading">Quick Links</h4>
            <ul class="footer-nav-list">
              <li><a href="javascript:void(0)" data-view="home">Home</a></li>
              <li><a href="javascript:void(0)" data-view="about">About Us</a></li>
              <li><a href="javascript:void(0)" data-view="contact">Contact us</a></li>
            </ul>
          </div>

          <!-- Column 3: Products (Exact Pic 4 with Real WooCommerce Slugs) -->
          <div class="footer-col">
            <h4 class="footer-heading">Products</h4>
            <ul class="footer-nav-list">
              <li><a href="javascript:void(0)" data-cat="keychains">Keychain</a></li>
              <li><a href="javascript:void(0)" data-cat="pen">Pen</a></li>
              <li><a href="javascript:void(0)" data-cat="bottle">Bottle</a></li>
              <li><a href="javascript:void(0)" data-cat="combo-sets">Combo Sets</a></li>
              <li><a href="javascript:void(0)" data-cat="machine">Machine</a></li>
              <li><a href="javascript:void(0)" data-cat="sublimation-mugs">Sublimation Mugs</a></li>
              <li><a href="javascript:void(0)" data-cat="sublimation-accessories">Sublimation Accessories</a></li>
              <li><a href="javascript:void(0)" data-cat="led-light-frames">LED Light Frames</a></li>
            </ul>
          </div>

          <!-- Column 4: Get In Touch (Exact Pic 4) -->
          <div class="footer-col footer-contact-col">
            <h4 class="footer-heading">Get In Touch</h4>
            <div class="contact-detail-item">
              <span class="detail-text">
                108, 1st main road 2nd cross, Back side of royalok showroom, Outer Ring Rd, Prem Nagar, Bengaluru, Karnataka 560058
              </span>
            </div>
            <div class="contact-detail-item">
              <a href="tel:+918660940018" class="contact-link phone-link">+91 8660940018</a>
            </div>
            <div class="contact-detail-item">
              <a href="mailto:support@giftingdestiny.com" class="contact-link">support@giftingdestiny.com</a>
            </div>
          </div>
        </div>

        <!-- Footer Bottom Bar (Matching Pic 4) -->
        <div class="footer-bottom-bar">
          <div class="footer-credit-line">
            <span class="footer-credit-copy">
              © 2026 Gifting Destiny · Designed &amp; Developed with
              <span class="footer-heartbeat" role="img" aria-label="love">❤️</span>
              by
            </span>
            <a
              class="footer-developer-link"
              href="https://webhostingbaba.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Hosting Baba official website"
            >
              <img
                class="footer-developer-logo"
                src="https://webhostingbaba.com/images/logo3.png"
                alt="Hosting Baba"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Floating Authentic WhatsApp Action at Right Bottom Corner -->
      <a 
        href="https://wa.me/${GD_PHONE}?text=Hello%20Gifting%20Destiny!%20I%20would%20like%20to%20inquire%20about%20your%20customized%20gifting%20solutions." 
        target="_blank" 
        rel="noopener" 
        class="floating-whatsapp-pill" 
        id="floating-wa-btn" 
        title="Direct Atelier WhatsApp (+91 8660940018)"
        aria-label="Chat with Gifting Destiny on WhatsApp"
      >
        ${icon.whatsapp}
        <span class="pill-text">Chat on WhatsApp</span>
      </a>
    </footer>
  `;
}
