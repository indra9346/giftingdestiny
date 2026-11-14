<?php
$faqs = [
    ['q' => 'How do I place an order for personalized gifts?', 'a' => 'You can browse any product, add it to your Inquiry Bag, and click "Order via WhatsApp" or "Submit Quote Request". Our Bengaluru team will confirm your customization text or logo, share a free digital preview, and process your order.'],
    ['q' => 'What is the dispatch turnaround time?', 'a' => 'Single custom pieces and individual orders are usually prepared and dispatched from our Bengaluru workshop within 24 to 48 hours. Corporate bulk orders (50 to 500+ pieces) typically take 3 to 5 business days.'],
    ['q' => 'Do you offer Pan-India shipping and tracking?', 'a' => 'Yes! We ship across India through trusted express courier partners. We provide air-cushioned shock-resistant packaging and share live tracking links directly on WhatsApp as soon as your parcel is dispatched.'],
    ['q' => 'Can I see a mock-up of my logo or name before printing?', 'a' => 'Absolutely. For both individual and corporate orders, our design team prepares a 2D digital visual rendering for your approval before laser engraving or sublimation printing begins.'],
    ['q' => 'What payment methods do you accept?', 'a' => 'We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, NEFT/RTGS for enterprise orders, and official corporate purchase orders.'],
    ['q' => 'Do you supply sublimation blanks and heat press machines to businesses?', 'a' => 'Yes, Gifting Destiny supplies commercial 5-in-1 combo heat press machines, mug presses, premium sublimation paper, inks, and blank substrates for printing studios and entrepreneurs across India.'],
];
?>
    <div class="faq-page">
      <div class="page-hero-banner">
        <div class="container">
          <div class="section-eyebrow">✦ HELP &amp; GUIDELINES</div>
          <h1 class="page-hero-title">Frequently Asked Questions</h1>
          <p class="page-hero-subtitle">
            Everything you need to know about customizing, ordering, bulk quotes, and Pan-India delivery.
          </p>
        </div>
      </div>

      <div class="container section">
        <div class="faq-container">
<?php foreach ($faqs as $faq): ?>
          <details class="faq-item">
            <summary class="faq-question">
              <span><?= e($faq['q']) ?></span>
              <span class="faq-icon">+</span>
            </summary>
            <div class="faq-answer">
              <p><?= e($faq['a']) ?></p>
            </div>
          </details>
<?php endforeach; ?>

          <div class="faq-help-box">
            <h3>Have a special request or bulk requirement?</h3>
            <p>Our team at Prem Nagar, Bengaluru is available to help customize your gifting solution.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
              <a href="<?= e(wa_link('Hello Gifting Destiny, I have a question')) ?>" target="_blank" rel="noopener" class="btn btn-wa-quick">
                <span><?= icon('whatsapp') ?> Chat on WhatsApp (+91 8660940018)</span>
              </a>
              <a href="<?= e(url('/contact')) ?>" class="btn btn-gd-outline">
                <span>Contact Page →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
