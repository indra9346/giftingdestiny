// Header brand banner: a printed satin cloth is pulled out of the round GD
// logo across the header until its gold end tag reaches the header icons,
// sways for a moment, then the spring reel winds it back into the logo.
// The logo turns exactly as much as the cloth moves, like a real cable reel.
// It lives outside #app so re-renders never cut it off mid-animation, and it
// ignores clicks so the header stays usable.

const LOGO = '/assets/gifting-destiny-original-logo.jpg';
const REPLAY_MS = 45000;
const PULL_MS = 1500;
const HOLD_MS = 3200;
const REWIND_MS = 1150;

let layer = null;
let playing = false;
let lastRun = 0;

function buildLayer() {
  layer = document.createElement('div');
  layer.id = 'gd-cloth-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <div class="gd-cloth">
      <div class="gd-cloth-face">
        <div class="gd-cloth-print">
          <img class="gd-cloth-badge" src="${LOGO}" alt="" />
          <span class="gd-cloth-stack">
            <span class="gd-cloth-name">Gifting Destiny</span>
            <span class="gd-cloth-sub">Personalised Gifts · Bengaluru</span>
          </span>
          <span class="gd-cloth-sep tier-m">✦</span>
          <span class="gd-cloth-script tier-m">Crafted with Love &amp; Care</span>
          <span class="gd-cloth-sep tier-l">✦</span>
          <span class="gd-cloth-item tier-l">Personalised &amp; Corporate Gifts</span>
          <span class="gd-cloth-sep tier-xl">✦</span>
          <span class="gd-cloth-item tier-xl">Pan-India Delivery</span>
          <span class="gd-cloth-sep tier-m">✦</span>
          <span class="gd-cloth-item gd-cloth-phone tier-m">☎ +91 86609 40018</span>
        </div>
        <span class="gd-cloth-tag"><img src="${LOGO}" alt="" /></span>
      </div>
    </div>
    <div class="gd-reel"><img src="${LOGO}" alt="" /><span class="gd-reel-spool"></span></div>
  `;
  document.body.appendChild(layer);
}

function headerParts() {
  const logo = document.querySelector('.site-header .brand-logo-img');
  const actions = document.querySelector('.site-header .header-actions');
  return { logo, actions };
}

function canPlay() {
  if (playing || document.hidden) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (document.querySelector('.mobile-drawer-overlay.open, .modal-overlay')) return false;
  const { logo, actions } = headerParts();
  if (!logo || !actions) return false;
  const rect = logo.getBoundingClientRect();
  return rect.width > 0 && rect.top >= -2 && rect.bottom <= window.innerHeight;
}

const easeOutCubic = t => 1 - (1 - t) ** 3;
const easeInQuart = t => t ** 4;

function tween(duration, onFrame) {
  return new Promise(resolve => {
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      onFrame(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

export async function playBrandCloth() {
  if (!canPlay()) return;
  if (!layer) buildLayer();
  const { logo, actions } = headerParts();
  const logoRect = logo.getBoundingClientRect();
  const actionsRect = actions.getBoundingClientRect();
  const size = logoRect.width;
  const radius = size / 2;
  const centerX = logoRect.left + radius;
  const centerY = logoRect.top + logoRect.height / 2;
  const clothH = Math.max(30, Math.round(size * 0.74));
  // The free end stops just short of the first header icon.
  const width = Math.round(actionsRect.left - 10 - centerX);
  if (width < 150) return;

  playing = true;
  lastRun = Date.now();
  const cloth = layer.querySelector('.gd-cloth');
  const face = layer.querySelector('.gd-cloth-face');
  const reel = layer.querySelector('.gd-reel');
  const reelImg = reel.querySelector('img');
  const spool = layer.querySelector('.gd-reel-spool');

  layer.style.setProperty('--cloth-h', `${clothH}px`);
  layer.style.setProperty('--reel-r', `${radius}px`);
  cloth.style.cssText = `left:${centerX}px; top:${centerY - clothH / 2}px; width:${width}px; height:${clothH}px;`;
  face.style.width = `${width}px`;
  reel.style.cssText = `left:${logoRect.left}px; top:${logoRect.top}px; width:${size}px; height:${logoRect.height}px;`;
  // Match the header logo exactly so the swap is invisible.
  const logoStyle = getComputedStyle(logo);
  reelImg.style.objectFit = logoStyle.objectFit;
  reelImg.style.borderRadius = logoStyle.borderRadius;

  // One full turn per circumference of cloth would spin far too fast on a
  // wide header, so the reel turns at a fixed fraction of that.
  const degPerPx = (360 / (Math.PI * size)) * 0.35;
  const place = offset => {
    face.style.transform = `translate3d(${offset - width}px, 0, 0)`;
    reel.style.transform = `rotate(${offset * degPerPx}deg)`;
  };

  place(0);
  layer.classList.remove('is-holding');
  layer.classList.add('is-on');
  document.documentElement.classList.add('gd-reel-on');

  // Print as much as fits between the reel and the end tag, never clipped.
  const print = layer.querySelector('.gd-cloth-print');
  const tag = layer.querySelector('.gd-cloth-tag');
  for (const tier of ['xl', 'l', 'm', 's', 'xs']) {
    layer.dataset.tier = tier;
    const shown = [...print.children].filter(el => getComputedStyle(el).display !== 'none');
    const end = Math.max(...shown.map(el => el.getBoundingClientRect().right));
    if (end <= tag.getBoundingClientRect().left - 4) break;
  }

  // Pull out: quick at first, easing off as the tag reaches the icons.
  await tween(PULL_MS, t => place(width * easeOutCubic(t)));
  // The tag tugs against the icons and settles.
  await tween(380, t => place(width + Math.sin(t * Math.PI) * 7 * (1 - t)));
  layer.classList.add('is-holding');
  await wait(HOLD_MS);
  layer.classList.remove('is-holding');

  // A short lean back as the spring takes up the slack...
  await tween(220, t => place(width + Math.sin(t * Math.PI) * 10));
  // ...then the reel winds it in, faster and faster.
  await tween(REWIND_MS, t => place(width * (1 - easeInQuart(t))));

  // The tag snaps home: the reel kicks and settles.
  spool.animate([
    { opacity: 0, transform: 'scale(1)' },
    { opacity: 1, transform: 'scale(1.06)', offset: 0.3 },
    { opacity: 0, transform: 'scale(1.1)' }
  ], { duration: 520, easing: 'ease-out' });
  await reel.animate([
    { transform: 'rotate(0deg) scale(1)' },
    { transform: 'rotate(-14deg) scale(1.05)', offset: 0.3 },
    { transform: 'rotate(5deg) scale(0.98)', offset: 0.65 },
    { transform: 'rotate(0deg) scale(1)' }
  ], { duration: 480, easing: 'ease-out' }).finished.catch(() => {});

  layer.classList.remove('is-on');
  document.documentElement.classList.remove('gd-reel-on');
  playing = false;
}

export function initBrandCloth() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.setTimeout(playBrandCloth, 1400);
  window.setInterval(() => {
    if (Date.now() - lastRun >= REPLAY_MS - 500) playBrandCloth();
  }, REPLAY_MS);
  // Replay when the logo is hovered (after a rest since the last run).
  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse') return;
    if (!event.target.closest?.('.site-header .brand-logo')) return;
    if (Date.now() - lastRun > 12000) playBrandCloth();
  });
}
