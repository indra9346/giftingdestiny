// Header brand banner: a printed satin cloth unreels from the round GD logo
// across the header, waves for a moment, then winds back into the logo like
// a retractable cable reel. It lives outside #app so page re-renders never
// cut it off mid-animation, and it ignores clicks so the header stays usable.

const LOGO = '/assets/gifting-destiny-original-logo.jpg';
const REPLAY_MS = 45000;
const HOLD_MS = 3400;

let layer = null;
let playing = false;
let lastRun = 0;

function buildLayer() {
  layer = document.createElement('div');
  layer.id = 'gd-cloth-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <svg class="gd-cloth-defs" width="0" height="0" focusable="false">
      <filter id="gd-cloth-wave" x="-2%" y="-40%" width="104%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.05" numOctaves="2" seed="7" result="noise">
          <animate attributeName="baseFrequency" dur="5s" values="0.008 0.05;0.011 0.07;0.008 0.05" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    <div class="gd-cloth">
      <div class="gd-cloth-face">
        <div class="gd-cloth-print">
          <img class="gd-cloth-badge" src="${LOGO}" alt="" />
          <span class="gd-cloth-stack">
            <span class="gd-cloth-name">Gifting Destiny</span>
            <span class="gd-cloth-sub">Personalised Gifts · Bengaluru</span>
          </span>
          <span class="gd-cloth-sep tier-s">✦</span>
          <span class="gd-cloth-script tier-m">Crafted with Love &amp; Care</span>
          <span class="gd-cloth-sep tier-m">✦</span>
          <span class="gd-cloth-item tier-s">Personalised &amp; Corporate Gifts</span>
          <span class="gd-cloth-sep tier-l">✦</span>
          <span class="gd-cloth-item tier-l">Bengaluru Studio</span>
          <span class="gd-cloth-sep tier-l">✦</span>
          <span class="gd-cloth-item tier-xl">Pan-India Delivery</span>
          <span class="gd-cloth-sep tier-xl">✦</span>
          <span class="gd-cloth-item gd-cloth-phone tier-m">☎ +91 86609 40018</span>
        </div>
        <span class="gd-cloth-rod"></span>
      </div>
    </div>
    <div class="gd-reel"><img src="${LOGO}" alt="" /><span class="gd-reel-spool"></span></div>
  `;
  document.body.appendChild(layer);
}

function canPlay() {
  if (playing || document.hidden) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (document.querySelector('.mobile-drawer-overlay.active, .mobile-drawer-overlay.open, .modal-overlay')) return false;
  const logo = document.querySelector('.site-header .brand-logo-img');
  const header = document.querySelector('.site-header .header-container');
  if (!logo || !header) return false;
  const rect = logo.getBoundingClientRect();
  return rect.width > 0 && rect.top >= -2 && rect.bottom <= window.innerHeight;
}

export function playBrandCloth() {
  if (!canPlay()) return;
  if (!layer) buildLayer();
  const logo = document.querySelector('.site-header .brand-logo-img');
  const header = document.querySelector('.site-header .header-container');
  const logoRect = logo.getBoundingClientRect();
  const headerRect = header.getBoundingClientRect();
  const size = logoRect.width;
  const centerX = logoRect.left + size / 2;
  const centerY = logoRect.top + logoRect.height / 2;
  const clothH = Math.max(32, Math.round(size * 0.78));
  const width = Math.round(headerRect.right - centerX - 6);
  if (width < 160) return;

  playing = true;
  lastRun = Date.now();
  const cloth = layer.querySelector('.gd-cloth');
  const face = layer.querySelector('.gd-cloth-face');
  const reel = layer.querySelector('.gd-reel');
  const spool = layer.querySelector('.gd-reel-spool');

  layer.style.setProperty('--cloth-h', `${clothH}px`);
  layer.dataset.tier = width >= 1050 ? 'xl' : width >= 820 ? 'l' : width >= 560 ? 'm' : 's';
  cloth.style.cssText = `left:${centerX}px; top:${centerY - clothH / 2}px; width:${width}px; height:${clothH}px;`;
  face.style.width = `${width}px`;
  reel.style.cssText = `left:${logoRect.left}px; top:${logoRect.top}px; width:${size}px; height:${size}px;`;
  layer.classList.add('is-on');
  document.documentElement.classList.add('gd-reel-on');

  // Arc length / circumference would spin the reel many times; three turns
  // reads as a reel without looking frantic.
  const turns = Math.min(3, Math.max(1.5, width / 380)) * 360;
  const out = { duration: 1650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' };
  const back = { duration: 1350, easing: 'cubic-bezier(0.55, 0, 0.75, 0.2)', fill: 'forwards' };

  face.animate([
    { transform: `translateX(${-width}px)` },
    { transform: 'translateX(14px)', offset: 0.82 },
    { transform: 'translateX(0)' }
  ], out);
  reel.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${turns}deg)` }], out);
  spool.animate([{ opacity: 0.9, transform: 'scale(1.18)' }, { opacity: 0, transform: 'scale(1)' }], { duration: 900, fill: 'forwards' });

  window.setTimeout(() => {
    const retract = face.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${-width}px)` }
    ], back);
    reel.animate([{ transform: `rotate(${turns}deg)` }, { transform: 'rotate(0deg)' }], back);
    retract.onfinish = () => {
      spool.animate([{ opacity: 0, transform: 'scale(1)' }, { opacity: 0.95, transform: 'scale(1.22)' }, { opacity: 0, transform: 'scale(1.32)' }], { duration: 650, easing: 'ease-out' });
      reel.animate([
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-10deg) scale(1.1)', offset: 0.35 },
        { transform: 'rotate(4deg) scale(0.97)', offset: 0.7 },
        { transform: 'rotate(0deg) scale(1)' }
      ], { duration: 520, easing: 'ease-out' }).onfinish = () => {
        layer.classList.remove('is-on');
        document.documentElement.classList.remove('gd-reel-on');
        face.getAnimations().forEach(anim => anim.cancel());
        reel.getAnimations().forEach(anim => anim.cancel());
        playing = false;
      };
    };
  }, 1650 + HOLD_MS);
}

export function initBrandCloth() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.setTimeout(playBrandCloth, 1400);
  window.setInterval(() => {
    if (Date.now() - lastRun >= REPLAY_MS - 500) playBrandCloth();
  }, REPLAY_MS);
  // Replay when the logo is hovered (after a short rest since the last run).
  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse') return;
    if (!event.target.closest?.('.site-header .brand-logo')) return;
    if (Date.now() - lastRun > 12000) playBrandCloth();
  });
}
