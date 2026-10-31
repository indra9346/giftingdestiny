import { store } from '../utils/store.js';
import {
  blogState, BLOG_TOPICS, getPostBySlug, getRelatedPosts, filterPosts, retryBlogPosts
} from '../data/blog.js';

const GD_PHONE = '918660940018';
const LOGO = '/assets/gifting-destiny-original-logo.jpg';
const HERO_FILM = '/gifting-destiny-brand-film.mp4';
const BAND_FILM = '/gifting-destiny-hd-promo-v2.mp4';
const SITE_URL = 'https://giftingdestiny.com';

// Filter choices survive re-renders (cart, wishlist) while the reader stays on the blog.
const filterState = { topic: 'all', query: '' };
// Intro animations play once per route; revealed blocks stay revealed on re-render.
const introPlayed = new Set();
const revealed = new Set();
let teardownFns = [];

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));
const formatDate = iso => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const postUrl = slug => `${SITE_URL}/#/blog/${slug}`;
const whatsappLink = text => `https://wa.me/${GD_PHONE}?text=${encodeURIComponent(text)}`;

// Splits a heading into word spans for the kinetic entrance.
function kinetic(text, goldWords = []) {
  const gold = new Set(goldWords.map(word => word.toLowerCase()));
  return text.split(/\s+/).filter(Boolean).map((word, index) => {
    const isGold = gold.has(word.toLowerCase().replace(/[^a-z&]/g, ''));
    return `<span class="gdb-word${isGold ? ' gdb-word-gold' : ''}" style="--i:${index}"><span>${esc(word)}</span></span>`;
  }).join(' ');
}

function sparks(count) {
  return Array.from({ length: count }, (_, index) => {
    const left = (index * 37 + 11) % 100;
    const top = (index * 53 + 7) % 90;
    return `<span class="gdb-spark" style="--x:${left}%;--y:${top}%;--s:${0.6 + (index % 4) * 0.25};--t:${3 + (index % 5)}s;--d:${(index % 7) * 0.45}s"></span>`;
  }).join('');
}

function postImage(post, variant = 'card', eager = false) {
  if (!post.image) {
    return `<div class="gdb-img-fallback" role="img" aria-label="${esc(post.title)}"><img src="${LOGO}" alt="" width="88" height="88" /></div>`;
  }
  const src = variant === 'card' ? post.image.card : post.image.src;
  const sizes = variant === 'card' ? '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px' : '(max-width: 1100px) 94vw, 1100px';
  return `<img class="gdb-img" src="${esc(src)}"${post.image.srcset ? ` srcset="${esc(post.image.srcset)}" sizes="${sizes}"` : ''}
    alt="${esc(post.image.alt || post.title)}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;
}

function matchesFilter(post) {
  return filterPosts([post], filterState.topic, filterState.query).length > 0;
}

function metaLine(post) {
  return `<div class="gdb-meta"><time datetime="${esc(post.date)}">${formatDate(post.date)}</time><span class="gdb-dot"></span><span>${post.readMinutes} min read</span></div>`;
}

function renderCard(post, index, { filterable = true } = {}) {
  const hidden = filterable && !matchesFilter(post);
  return `
    <article class="gdb-card" data-reveal data-reveal-key="card-${esc(post.slug)}" style="--d:${(index % 3) * 90}ms"
      ${filterable ? `data-gdb-item data-topics="${post.topics.join(' ')}" data-search="${esc(`${post.title} ${post.excerpt}`.toLowerCase())}"` : ''}
      ${hidden ? 'hidden' : ''}>
      <a class="gdb-card-link" href="#/blog/${esc(post.slug)}" data-post-slug="${esc(post.slug)}">
        <div class="gdb-card-media">
          ${postImage(post)}
          <span class="gdb-card-badge">${esc(post.badge)}</span>
          <span class="gdb-card-sheen" aria-hidden="true"></span>
        </div>
        <div class="gdb-card-body">
          ${metaLine(post)}
          <h3 class="gdb-card-title">${esc(post.title)}</h3>
          <p class="gdb-card-excerpt">${esc(post.excerpt)}</p>
          <span class="gdb-card-cta">Read article <span class="gdb-arrow" aria-hidden="true">→</span></span>
        </div>
      </a>
    </article>`;
}

function renderFeatured(post) {
  return `
    <article class="gdb-featured" data-reveal data-reveal-key="featured-${esc(post.slug)}" data-gdb-item
      data-topics="${post.topics.join(' ')}" data-search="${esc(`${post.title} ${post.excerpt}`.toLowerCase())}"
      ${matchesFilter(post) ? '' : 'hidden'}>
      <a class="gdb-featured-link" href="#/blog/${esc(post.slug)}" data-post-slug="${esc(post.slug)}">
        <div class="gdb-featured-media">
          ${postImage(post, 'cover', true)}
          <span class="gdb-latest"><span class="gdb-latest-dot"></span>Latest story</span>
        </div>
        <div class="gdb-featured-body">
          <span class="gdb-chip-static">${esc(post.badge)}</span>
          ${metaLine(post)}
          <h2 class="gdb-featured-title">${esc(post.title)}</h2>
          <p class="gdb-featured-excerpt">${esc(post.excerpt)}</p>
          <span class="gdb-btn gdb-btn-gold">Read the story <span class="gdb-arrow" aria-hidden="true">→</span></span>
        </div>
      </a>
    </article>`;
}

function renderSkeletonGrid(count) {
  return `<div class="gdb-grid">${Array.from({ length: count }, () => `
    <div class="gdb-card gdb-skeleton" aria-hidden="true">
      <div class="gdb-card-media gdb-shimmer"></div>
      <div class="gdb-card-body"><span class="gdb-shimmer gdb-line w40"></span><span class="gdb-shimmer gdb-line w90"></span><span class="gdb-shimmer gdb-line w70"></span><span class="gdb-shimmer gdb-line w80"></span></div>
    </div>`).join('')}</div>`;
}

function renderError(message) {
  return `
    <div class="gdb-error" role="alert">
      <img src="${LOGO}" alt="Gifting Destiny logo" width="72" height="72" />
      <h2>Our stories are taking a moment to load</h2>
      <p>${esc(message)}. Please check your connection and try again.</p>
      <div class="gdb-error-actions">
        <button type="button" class="gdb-btn gdb-btn-gold" data-gdb-action="retry">Try again</button>
        <a class="gdb-btn gdb-btn-ghost-dark" href="${whatsappLink('Hello Gifting Destiny! I would like some gift suggestions.')}" target="_blank" rel="noopener">Ask us on WhatsApp</a>
      </div>
    </div>`;
}

function renderCtaBand() {
  return `
    <section class="gdb-cta" data-reveal data-reveal-key="cta">
      <div class="gdb-cta-sweep" aria-hidden="true"></div>
      ${sparks(8)}
      <div class="container gdb-cta-inner">
        <img class="gdb-cta-logo" src="${LOGO}" alt="Gifting Destiny logo" width="84" height="84" loading="lazy" />
        <div class="gdb-cta-copy">
          <h2>Planning a gift for one person, or for your whole team?</h2>
          <p>Tell us the occasion and your budget. We'll suggest options and share a digital preview of your name or logo before anything is printed.</p>
        </div>
        <div class="gdb-cta-actions">
          <a class="gdb-btn gdb-btn-gold" href="${whatsappLink('Hello Gifting Destiny! I read your blog and would like help choosing a gift.')}" target="_blank" rel="noopener">Chat on WhatsApp</a>
          <a class="gdb-btn gdb-btn-ghost" href="#" data-gdb-view="corporate">Corporate gifting</a>
        </div>
      </div>
    </section>`;
}

export function renderBlogPage() {
  const { status, posts, error } = blogState;
  const route = 'blog';
  const intro = introPlayed.has(route) ? ' gdb-no-intro' : '';
  const latest = posts[0];
  const topics = BLOG_TOPICS.filter(topic => topic.id === 'all' || posts.some(post => post.topics.includes(topic.id)));

  let stories;
  if (status === 'error') stories = renderError(error);
  else if (status !== 'ready') stories = `<div class="gdb-featured gdb-skeleton" aria-hidden="true"><div class="gdb-featured-media gdb-shimmer"></div><div class="gdb-featured-body"><span class="gdb-shimmer gdb-line w40"></span><span class="gdb-shimmer gdb-line w90"></span><span class="gdb-shimmer gdb-line w80"></span></div></div>${renderSkeletonGrid(6)}`;
  else if (!posts.length) stories = '<p class="gdb-empty">New stories are on their way. Please check back soon.</p>';
  else {
    stories = `
      ${renderFeatured(latest)}
      <section class="gdb-film" data-reveal data-reveal-key="film">
        <div class="gdb-film-frame">
          <video class="gdb-film-video" muted loop playsinline preload="none" data-gdb-autoplay aria-label="Gifting Destiny product film">
            <source src="${BAND_FILM}" type="video/mp4" />
          </video>
          <span class="gdb-film-corner tl"></span><span class="gdb-film-corner br"></span>
        </div>
        <div class="gdb-film-copy">
          <span class="gdb-eyebrow gdb-eyebrow-dark">▶ Gifting in motion</span>
          <h2 class="gdb-film-title">${kinetic('Crafted with love & care in Bengaluru', ['love', 'care'])}</h2>
          <p>Personalised mugs, bottles, pens, keychains, LED frames and corporate gift sets, finished in our Bengaluru studio.</p>
          <div class="gdb-film-actions">
            <a class="gdb-btn gdb-btn-gold" href="#" data-gdb-view="shop">Browse all products <span class="gdb-arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
      <div class="gdb-section-head" data-reveal data-reveal-key="more-head">
        <h2>More from the journal</h2>
        <p>Ideas for birthdays, anniversaries, festivals and corporate events.</p>
      </div>
      <div class="gdb-grid" id="gdb-grid">${posts.slice(1).map((post, index) => renderCard(post, index)).join('')}</div>
      <p class="gdb-empty" id="gdb-filter-empty" ${filterPosts(posts, filterState.topic, filterState.query).length ? 'hidden' : ''}>
        No stories match that search yet. <button type="button" class="gdb-link-btn" data-gdb-action="clear-filters">Show all stories</button>
      </p>`;
  }

  return `
    <div class="gdb gdb-list${intro}" data-gdb-route="${route}">
      <section class="gdb-hero">
        <div class="gdb-hero-media" aria-hidden="true">
          <video class="gdb-hero-video" muted loop playsinline autoplay preload="metadata"><source src="${HERO_FILM}" type="video/mp4" /></video>
          <div class="gdb-hero-shade"></div>
          <div class="gdb-hero-sweep"></div>
          ${sparks(14)}
        </div>
        <div class="container gdb-hero-inner">
          <div class="gdb-hero-badge">
            <span class="gdb-hero-ring"></span><span class="gdb-hero-ring r2"></span>
            <img src="${LOGO}" alt="Gifting Destiny logo" width="112" height="112" />
          </div>
          <span class="gdb-eyebrow">✦ The Gifting Destiny Journal</span>
          <h1 class="gdb-hero-title">${kinetic('Stories that make every gift unforgettable', ['unforgettable'])}</h1>
          <p class="gdb-hero-sub">Gift ideas, corporate gifting guides and personalisation tips from our Bengaluru studio.</p>
          <div class="gdb-hero-stats">
            ${status === 'ready' && latest ? `
              <span><strong>${posts.length}</strong> stories</span>
              <span>Updated <strong>${formatDate(latest.date)}</strong></span>` : '<span class="gdb-shimmer-text">Loading stories…</span>'}
            <span>Personalised · Corporate · Festive</span>
          </div>
          <button type="button" class="gdb-scroll-cue" data-gdb-action="scroll-stories">
            <span>Start reading</span><span class="gdb-scroll-mouse" aria-hidden="true"><span></span></span>
          </button>
        </div>
      </section>

      <section class="gdb-canvas" id="gdb-stories">
        <div class="container">
          ${status === 'ready' && posts.length ? `
          <div class="gdb-toolbar" data-reveal data-reveal-key="toolbar">
            <div class="gdb-chips" role="group" aria-label="Filter stories by topic">
              ${topics.map(topic => `<button type="button" class="gdb-chip${filterState.topic === topic.id ? ' is-active' : ''}" data-gdb-topic="${topic.id}" aria-pressed="${filterState.topic === topic.id}">${esc(topic.label)}</button>`).join('')}
            </div>
            <label class="gdb-search">
              <span class="gdb-search-icon" aria-hidden="true">⌕</span>
              <input type="search" id="gdb-search" placeholder="Search stories" value="${esc(filterState.query)}" autocomplete="off" aria-label="Search blog stories" />
            </label>
          </div>` : ''}
          ${stories}
        </div>
      </section>
      ${renderCtaBand()}
    </div>`;
}

export function renderBlogPost(state) {
  const slug = state.selectedPostSlug;
  const route = `blog/${slug}`;
  const intro = introPlayed.has(route) ? ' gdb-no-intro' : '';

  if (blogState.status === 'error') {
    return `<div class="gdb gdb-post${intro}" data-gdb-route="${esc(route)}"><section class="gdb-canvas gdb-canvas-solo"><div class="container">${renderError(blogState.error)}</div></section></div>`;
  }
  if (blogState.status !== 'ready') {
    return `
      <div class="gdb gdb-post gdb-no-intro" data-gdb-route="${esc(route)}">
        <header class="gdb-post-hero"><div class="container gdb-post-hero-inner">
          <span class="gdb-shimmer gdb-line w30 on-dark"></span><span class="gdb-shimmer gdb-line w90 tall on-dark"></span><span class="gdb-shimmer gdb-line w60 tall on-dark"></span>
        </div></header>
        <section class="gdb-canvas"><div class="container gdb-reading"><div class="gdb-article gdb-skeleton">
          ${'<span class="gdb-shimmer gdb-line w90"></span><span class="gdb-shimmer gdb-line w80"></span><span class="gdb-shimmer gdb-line w70"></span>'.repeat(4)}
        </div></div></section>
      </div>`;
  }

  const post = getPostBySlug(slug);
  if (!post) {
    return `
      <div class="gdb gdb-post" data-gdb-route="${esc(route)}">
        <section class="gdb-canvas gdb-canvas-solo"><div class="container">
          <div class="gdb-error">
            <img src="${LOGO}" alt="Gifting Destiny logo" width="72" height="72" />
            <h2>This story isn't available</h2>
            <p>It may have been renamed or moved. Our latest stories are on the blog.</p>
            <div class="gdb-error-actions"><a class="gdb-btn gdb-btn-gold" href="#" data-gdb-view="blog">See all stories</a></div>
          </div>
        </div></section>
      </div>`;
  }

  const related = getRelatedPosts(post, 3);
  const shareText = `${post.title} – Gifting Destiny`;
  const toc = post.headings.length >= 2 ? post.headings : [];

  return `
    <div class="gdb gdb-post${intro}" data-gdb-route="${esc(route)}">
      <div class="gdb-progress" aria-hidden="true"><span id="gdb-progress-bar"></span></div>
      <header class="gdb-post-hero">
        <div class="gdb-post-hero-bg" aria-hidden="true">${post.image ? `<img src="${esc(post.image.card)}" alt="" />` : ''}</div>
        ${sparks(10)}
        <div class="container gdb-post-hero-inner">
          <nav class="gdb-crumbs" aria-label="Breadcrumb">
            <a href="#" data-gdb-view="blog">Blog</a><span aria-hidden="true">/</span><span>${esc(post.badge)}</span>
          </nav>
          <h1 class="gdb-post-title">${kinetic(post.title)}</h1>
          <div class="gdb-post-meta">
            <img class="gdb-avatar" src="${LOGO}" alt="" width="48" height="48" />
            <div>
              <strong>Gifting Destiny</strong>
              <span><time datetime="${esc(post.date)}">${formatDate(post.date)}</time> · ${post.readMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      <section class="gdb-canvas gdb-canvas-post">
        ${post.image ? `<div class="container gdb-cover-wrap"><figure class="gdb-cover" data-gdb-parallax>${postImage(post, 'cover', true)}</figure></div>` : ''}
        <div class="container gdb-post-layout${toc.length ? '' : ' no-toc'}">
          <article class="gdb-article" data-reveal data-reveal-key="article-${esc(post.slug)}">
            ${toc.length ? `
            <details class="gdb-toc-mobile">
              <summary>On this page</summary>
              <ol>${toc.map(item => `<li><button type="button" data-gdb-jump="${item.id}">${esc(item.label)}</button></li>`).join('')}</ol>
            </details>` : ''}
            <div class="gdb-article-body">${post.html}</div>
          </article>
          <aside class="gdb-aside">
            ${toc.length ? `
            <nav class="gdb-toc" aria-label="On this page">
              <span class="gdb-aside-label">On this page</span>
              <ol>${toc.map(item => `<li><button type="button" data-gdb-jump="${item.id}" data-gdb-toc="${item.id}">${esc(item.label)}</button></li>`).join('')}</ol>
            </nav>` : ''}
            <div class="gdb-aside-card">
              <img src="${LOGO}" alt="Gifting Destiny logo" width="64" height="64" loading="lazy" />
              <strong>Like this idea?</strong>
              <p>We can personalise it with a name, photo or company logo.</p>
              <a class="gdb-btn gdb-btn-gold gdb-btn-block" href="${whatsappLink(`Hello Gifting Destiny! I read "${post.title}" and would like a gift suggestion.`)}" target="_blank" rel="noopener">Chat on WhatsApp</a>
              <a class="gdb-btn gdb-btn-ghost-dark gdb-btn-block" href="#" data-gdb-view="shop">Browse products</a>
            </div>
            <div class="gdb-share">
              <span class="gdb-aside-label">Share this story</span>
              <div class="gdb-share-row">
                <a class="gdb-share-btn" href="https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl(post.slug)}`)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">WhatsApp</a>
                <button type="button" class="gdb-share-btn" data-gdb-action="copy-link" data-url="${esc(postUrl(post.slug))}">Copy link</button>
              </div>
            </div>
          </aside>
        </div>

        <div class="container gdb-post-end">
          ${related.length ? `
          <div class="gdb-section-head" data-reveal data-reveal-key="related-head-${esc(post.slug)}">
            <h2>Keep reading</h2>
            <p>More gifting ideas from our studio.</p>
          </div>
          <div class="gdb-grid">${related.map((item, index) => renderCard(item, index, { filterable: false })).join('')}</div>` : ''}
          <div class="gdb-back-row"><a class="gdb-btn gdb-btn-ghost-dark" href="#" data-gdb-view="blog">← All stories</a></div>
        </div>
      </section>
      ${renderCtaBand()}
    </div>`;
}

export function blogPageMeta(state) {
  if (state.currentView === 'blog') {
    return { title: 'Blog – Gifting Ideas & Guides | Gifting Destiny', description: 'Gift ideas, corporate gifting guides and personalisation tips from the Gifting Destiny studio in Bengaluru.' };
  }
  if (state.currentView === 'blogPost') {
    const post = blogState.status === 'ready' ? getPostBySlug(state.selectedPostSlug) : null;
    if (post) return { title: `${post.title} | Gifting Destiny Blog`, description: post.excerpt };
    return { title: 'Blog | Gifting Destiny', description: '' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Behaviour: reveals, filters, reading progress, contents, tilt, film playback
// ---------------------------------------------------------------------------

export function teardownBlogPage() {
  teardownFns.forEach(fn => fn());
  teardownFns = [];
}

// Called before every render: a new route means a fresh visit, so intros and
// scroll reveals play again.
let lastRoute = null;
export function noteBlogRoute(state) {
  const route = state.currentView === 'blogPost' ? `blog/${state.selectedPostSlug}` : state.currentView;
  if (route !== lastRoute) {
    introPlayed.clear();
    revealed.clear();
    lastRoute = route;
  }
}

// When posts arrive while the list is open, swap in the stories without
// re-rendering the hero, so its film and title animation carry on untouched.
export function refreshBlogStories() {
  const root = document.querySelector('.gdb-list');
  if (!root || store.state.currentView !== 'blog') return false;
  const template = document.createElement('template');
  template.innerHTML = renderBlogPage().trim();
  const fresh = template.content.firstElementChild;
  root.querySelector('#gdb-stories')?.replaceWith(fresh.querySelector('#gdb-stories'));
  root.querySelector('.gdb-hero-stats')?.replaceWith(fresh.querySelector('.gdb-hero-stats'));
  teardownBlogPage();
  initBlogPage();
  return true;
}

function scrollToElement(el) {
  const header = document.querySelector('.site-header');
  const offset = (header?.getBoundingClientRect().height || 0) + 18;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function applyFilters(root) {
  const items = [...root.querySelectorAll('[data-gdb-item]')];
  const needle = filterState.query.trim().toLowerCase();
  let shown = 0;
  items.forEach(item => {
    const topics = (item.dataset.topics || '').split(' ');
    const match = (filterState.topic === 'all' || topics.includes(filterState.topic))
      && (!needle || (item.dataset.search || '').includes(needle));
    if (match) {
      shown += 1;
      if (item.hidden) {
        item.hidden = false;
        item.classList.add('gdb-enter');
        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove('gdb-enter')));
      }
      item.classList.add('is-visible');
    } else {
      item.hidden = true;
    }
  });
  root.querySelectorAll('[data-gdb-topic]').forEach(chip => {
    const active = chip.dataset.gdbTopic === filterState.topic;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
  const empty = root.querySelector('#gdb-filter-empty');
  if (empty) empty.hidden = shown > 0;
}

export function initBlogPage() {
  const root = document.querySelector('.gdb');
  if (!root) return;
  const route = root.dataset.gdbRoute;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  // Later re-renders of this route (cart, wishlist) skip the intro.
  if (!root.classList.contains('gdb-no-intro')) introPlayed.add(route);

  // Scroll reveals (blocks already seen stay visible without replaying).
  const revealEls = [...root.querySelectorAll('[data-reveal]')];
  revealEls.forEach(el => {
    if (reduceMotion || revealed.has(el.dataset.revealKey)) el.classList.add('is-visible', 'gdb-instant');
  });
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        if (entry.target.dataset.revealKey) revealed.add(entry.target.dataset.revealKey);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    revealEls.filter(el => !el.classList.contains('is-visible')).forEach(el => io.observe(el));
    teardownFns.push(() => io.disconnect());
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Videos: hero plays straight away, the film band only while on screen.
  const heroVideo = root.querySelector('.gdb-hero-video');
  if (heroVideo) {
    heroVideo.muted = true;
    if (reduceMotion) heroVideo.removeAttribute('autoplay');
    else heroVideo.play().catch(() => {});
  }
  const autoVideos = [...root.querySelectorAll('[data-gdb-autoplay]')];
  if (autoVideos.length && 'IntersectionObserver' in window && !reduceMotion) {
    const vio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload === 'none') video.preload = 'auto';
          video.play().catch(() => {});
        } else video.pause();
      });
    }, { threshold: 0.25 });
    autoVideos.forEach(video => { video.muted = true; vio.observe(video); });
    teardownFns.push(() => vio.disconnect());
  } else autoVideos.forEach(video => { video.controls = true; });

  // Clicks inside the blog.
  const onClick = event => {
    const postLink = event.target.closest('[data-post-slug]');
    if (postLink) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return;
      event.preventDefault();
      store.navigateToPost(postLink.dataset.postSlug);
      return;
    }
    const viewLink = event.target.closest('[data-gdb-view]');
    if (viewLink) {
      event.preventDefault();
      store.setView(viewLink.dataset.gdbView);
      return;
    }
    const topic = event.target.closest('[data-gdb-topic]');
    if (topic) {
      filterState.topic = topic.dataset.gdbTopic;
      applyFilters(root);
      return;
    }
    const jump = event.target.closest('[data-gdb-jump]');
    if (jump) {
      const target = document.getElementById(jump.dataset.gdbJump);
      if (target) scrollToElement(target);
      jump.closest('details')?.removeAttribute('open');
      return;
    }
    const action = event.target.closest('[data-gdb-action]')?.dataset.gdbAction;
    if (action === 'retry') retryBlogPosts(() => store.notify());
    else if (action === 'scroll-stories') {
      const stories = document.getElementById('gdb-stories');
      if (stories) scrollToElement(stories);
    } else if (action === 'clear-filters') {
      filterState.topic = 'all';
      filterState.query = '';
      const input = root.querySelector('#gdb-search');
      if (input) input.value = '';
      applyFilters(root);
    } else if (action === 'copy-link') {
      const url = event.target.closest('[data-url]')?.dataset.url || location.href;
      navigator.clipboard?.writeText(url)
        .then(() => store.showToast('Story link copied', '🔗'))
        .catch(() => window.prompt('Copy this link', url));
    }
  };
  root.addEventListener('click', onClick);
  teardownFns.push(() => root.removeEventListener('click', onClick));

  const search = root.querySelector('#gdb-search');
  let searchTimer = null;
  search?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filterState.query = search.value;
      applyFilters(root);
    }, 120);
  });

  // Gentle 3D tilt on cards for mouse users.
  if (finePointer && !reduceMotion) {
    root.querySelectorAll('.gdb-card-link, .gdb-featured-link').forEach(link => {
      let frame = 0;
      link.addEventListener('pointermove', event => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = link.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          const strength = link.classList.contains('gdb-featured-link') ? 3 : 6;
          link.style.setProperty('--rx', `${(-y * strength).toFixed(2)}deg`);
          link.style.setProperty('--ry', `${(x * strength).toFixed(2)}deg`);
          link.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
          link.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
        });
      });
      link.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        link.style.removeProperty('--rx');
        link.style.removeProperty('--ry');
      });
    });
  }

  // Reading progress, cover parallax and hero drift.
  const bar = root.querySelector('#gdb-progress-bar');
  const article = root.querySelector('.gdb-article');
  const cover = root.querySelector('[data-gdb-parallax]');
  const heroMedia = root.querySelector('.gdb-hero-media');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (bar && article) {
        const rect = article.getBoundingClientRect();
        const total = rect.height - window.innerHeight * 0.6;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
        bar.style.transform = `scaleX(${progress})`;
      }
      if (!reduceMotion && cover) {
        const rect = cover.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) cover.style.setProperty('--py', `${(rect.top * -0.06).toFixed(1)}px`);
      }
      if (!reduceMotion && heroMedia && window.scrollY < window.innerHeight * 1.2) {
        heroMedia.style.setProperty('--hy', `${(window.scrollY * 0.35).toFixed(1)}px`);
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  teardownFns.push(() => window.removeEventListener('scroll', onScroll));

  // Highlight the contents entry for the section being read.
  const tocButtons = [...root.querySelectorAll('[data-gdb-toc]')];
  if (tocButtons.length && 'IntersectionObserver' in window) {
    const headings = tocButtons.map(btn => document.getElementById(btn.dataset.gdbToc)).filter(Boolean);
    const tio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.gdbToc === entry.target.id));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(heading => tio.observe(heading));
    teardownFns.push(() => tio.disconnect());
  }

  // Fade images in as they decode.
  root.querySelectorAll('img.gdb-img, .gdb-article-body img').forEach(img => {
    if (img.complete) img.classList.add('is-loaded');
    else img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  });
}
