import { clientTestimonials } from '../data/products.js';

export function renderTestimonials() {
  return `
    <section class="section testimonials-section" id="testimonials-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>⭐</span>
            <span>VERIFIED PRAISE</span>
          </div>
          <h2 class="section-title">
            Loved by Individuals & <span class="text-gold-gradient">India’s Top Teams</span>
          </h2>
          <p class="section-subtitle">
            Read what our clients say about our laser accuracy, prompt doorstep delivery, and the unforgettable reactions of their recipients.
          </p>
        </div>

        <div class="testimonial-carousel" id="testimonial-carousel">
          <div class="testimonial-card">
            <div class="quote-mark">“</div>
            <p class="testimonial-text" id="active-testimonial-text">
              "${clientTestimonials[0].quote}"
            </p>

            <div class="testimonial-author-box">
              <img 
                src="${clientTestimonials[0].avatar}" 
                alt="${clientTestimonials[0].author}" 
                class="author-avatar" 
                id="active-testimonial-avatar"
              />
              <div class="author-info">
                <div class="author-name" id="active-testimonial-name">${clientTestimonials[0].author}</div>
                <div class="author-role" id="active-testimonial-role">${clientTestimonials[0].role}, ${clientTestimonials[0].company}</div>
                <div class="author-company" id="active-testimonial-order" style="color: var(--gold-light); margin-top: 0.2rem;">
                  Ordered: ${clientTestimonials[0].orderType}
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Controls -->
          <div class="carousel-nav">
            <button class="btn-icon" id="prev-testimonial-btn" title="Previous Review">
              <span>←</span>
            </button>
            <div style="display: flex; gap: 0.5rem;" id="testimonial-dots">
              ${clientTestimonials.map((_, i) => `
                <span class="testimonial-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" style="width: ${i === 0 ? '24px' : '8px'}; height: 8px; border-radius: 4px; background: ${i === 0 ? 'var(--gold-primary)' : 'rgba(255,255,255,0.2)'}; display: inline-block; cursor: pointer; transition: all 0.3s ease;"></span>
              `).join('')}
            </div>
            <button class="btn-icon" id="next-testimonial-btn" title="Next Review">
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}
