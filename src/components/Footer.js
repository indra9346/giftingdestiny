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
                src="/assets/gifting-destiny-original-logo.jpg" 
                alt="Gifting Destiny logo" 
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
              <li><a href="javascript:void(0)" data-view="blog">Blog</a></li>
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
              <svg class="footer-heart" viewBox="0 0 32 32" role="img" aria-label="love"><defs><linearGradient id="gdHeartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff4d6d"/><stop offset="100%" stop-color="#d90429"/></linearGradient><linearGradient id="gdHeartGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3b0"/><stop offset="100%" stop-color="#f5b400"/></linearGradient></defs><path d="M16 28.5C15.6 28.5 15.2 28.3 14.9 28C11.5 24.6 3 17.5 3 10.5C3 5.8 6.8 2 11.5 2C13.8 2 15.1 3.1 16 4.2C16.9 3.1 18.2 2 20.5 2C25.2 2 29 5.8 29 10.5C29 17.5 20.5 24.6 17.1 28C16.8 28.3 16.4 28.5 16 28.5Z" fill="url(#gdHeartFill)" stroke="#f5b400" stroke-opacity="0.45" stroke-width="1.2" stroke-linejoin="round"/><path class="footer-gold-spark" pathLength="100" d="M16 28.5C15.6 28.5 15.2 28.3 14.9 28C11.5 24.6 3 17.5 3 10.5C3 5.8 6.8 2 11.5 2C13.8 2 15.1 3.1 16 4.2" stroke="url(#gdHeartGold)" stroke-width="1.8" stroke-linecap="round" fill="none"/><path class="footer-gold-spark" pathLength="100" d="M16 28.5C16.4 28.5 16.8 28.3 17.1 28C20.5 24.6 29 17.5 29 10.5C29 5.8 25.2 2 20.5 2C18.2 2 16.9 3.1 16 4.2" stroke="url(#gdHeartGold)" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>
              by
            </span>
            <a
              class="footer-developer-link"
              href="https://webhostingbaba.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Hosting Baba official website"
            >
              <span class="footer-developer-mark">
                <img
                class="footer-developer-logo"
                src="https://webhostingbaba.com/images/logo3.png"
                alt="Hosting Baba"
                loading="lazy"
              />
                <!-- Gold sparks rise up both sides of the Baba face (beard tip to topknot), in step with the heart. Traced on logo3.png pixels (900 x 224). -->
                <svg class="footer-baba-sparks" viewBox="0 0 900 224" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="footer-gold-spark" pathLength="100" d="M657 213 L655 211 L654 204 L644 197 L642 190 L634 183 L634 176 L633 169 L630 162 L628 155 L629 148 L625 141 L623 134 L623 127 L622 120 L622 113 L621 106 L621 99 L619 92 L620 85 L622 78 L624 71 L631 64 L640 57 L648 50 L657 43 L658 36 L661 29 L674 21" stroke="url(#gdHeartGold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path class="footer-gold-spark" pathLength="100" d="M657 213 L661 211 L666 204 L672 197 L676 190 L678 183 L678 176 L679 169 L683 162 L685 155 L686 148 L691 141 L693 134 L691 127 L692 120 L692 113 L694 106 L700 99 L702 92 L701 85 L697 78 L697 71 L693 64 L690 57 L687 50 L692 43 L692 36 L689 29 L674 21" stroke="url(#gdHeartGold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
              </span>
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
