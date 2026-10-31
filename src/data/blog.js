// Blog posts are written in the Gifting Destiny WordPress (wp-admin on the
// webhostingbaba.com subdomain) and read here through its public REST API, so a
// post published there shows up on this site without a rebuild.
export const WP_BASE = 'https://giftingdestiny.webhostingbaba.com';

const POSTS_URL = `${WP_BASE}/wp-json/wp/v2/posts?per_page=100&_embed=wp:featuredmedia`
  + '&_fields=id,slug,date,modified,title,excerpt,content,featured_media,_links.wp:featuredmedia,_embedded';
const CACHE_KEY = 'gd-blog-posts-v2';
const CACHE_TTL_MS = 10 * 60 * 1000;

export const BLOG_TOPICS = [
  { id: 'all', label: 'All stories' },
  { id: 'corporate', label: 'Corporate gifting', test: /corporate|employee|client|brand|team|business|nexedge/i },
  { id: 'personal', label: 'Personalised gifts', test: /personali[sz]ed|custom|led light|keepsake|thoughtful/i },
  { id: 'festive', label: 'Festive & occasions', test: /diwali|festive|anniversary|occasion|wedding|birthday|couple/i },
  { id: 'guides', label: 'Guides & ideas', test: /guide|ideas|top \d+|\b\d+ |how to|tips|picks/i }
];
const BADGE_ORDER = ['festive', 'corporate', 'personal', 'guides'];

export const blogState = {
  status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  posts: [],
  error: ''
};

let pending = null;

function readCache() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (saved && Date.now() - saved.at < CACHE_TTL_MS && Array.isArray(saved.posts)) return saved.posts;
  } catch {}
  return null;
}

function writeCache(posts) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), posts })); } catch {}
}

// Starts the one-time download of all posts. `onChange` runs when the state
// moves to ready or error so the caller can re-render.
export function ensureBlogPosts(onChange) {
  if (blogState.status === 'ready' || pending) return;
  const cached = readCache();
  if (cached) {
    blogState.posts = cached;
    blogState.status = 'ready';
    return;
  }
  blogState.status = 'loading';
  blogState.error = '';
  pending = fetchAllPosts()
    .then(raw => {
      blogState.posts = raw.map(normalizePost).filter(Boolean);
      blogState.status = 'ready';
      writeCache(blogState.posts);
    })
    .catch(err => {
      blogState.status = 'error';
      blogState.error = err?.message || 'Could not load the blog';
    })
    .finally(() => {
      pending = null;
      onChange?.();
    });
}

export function retryBlogPosts(onChange) {
  blogState.status = 'idle';
  ensureBlogPosts(onChange);
  onChange?.();
}

async function fetchAllPosts() {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const response = await fetch(`${POSTS_URL}&page=${page}`, { credentials: 'omit' });
    if (!response.ok) throw new Error(`Blog server answered ${response.status}`);
    all.push(...await response.json());
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
    if (page >= totalPages) break;
  }
  return all;
}

export function getPostBySlug(slug) {
  return blogState.posts.find(post => post.slug === slug) || null;
}

export function getRelatedPosts(post, count = 3) {
  const others = blogState.posts.filter(item => item.slug !== post.slug);
  const shared = others.filter(item => item.topics.some(topic => post.topics.includes(topic)));
  return [...shared, ...others.filter(item => !shared.includes(item))].slice(0, count);
}

export function filterPosts(posts, topic, query) {
  const needle = (query || '').trim().toLowerCase();
  return posts.filter(post => (topic === 'all' || post.topics.includes(topic))
    && (!needle || `${post.title} ${post.excerpt}`.toLowerCase().includes(needle)));
}

// ---------------------------------------------------------------------------
// Normalising WordPress posts
// ---------------------------------------------------------------------------

function decodeEntities(text) {
  const area = document.createElement('textarea');
  area.innerHTML = text || '';
  return area.value;
}

function cleanTitle(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function cleanExcerpt(html, title) {
  let text = decodeEntities((html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\[(?:…|&hellip;|\.\.\.)\]/g, '')
    .replace(/[#*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (title && text.toLowerCase().startsWith(title.toLowerCase())) text = text.slice(title.length).trim();
  text = text.replace(/^(introduction|corporate gifting guide 2026)\s*:?\s*/i, '');
  if (text.length > 210) text = `${text.slice(0, 200).replace(/\s+\S*$/, '')}…`;
  return text;
}

function mediaFromEmbed(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media?.source_url) return null;
  const sizes = media.media_details?.sizes || {};
  const pick = name => sizes[name]?.source_url;
  const srcset = ['medium_large', 'large', 'full']
    .filter(name => sizes[name])
    .map(name => `${sizes[name].source_url} ${sizes[name].width}w`)
    .join(', ');
  return {
    src: pick('large') || media.source_url,
    card: pick('medium_large') || pick('large') || media.source_url,
    srcset,
    alt: media.alt_text || '',
    width: media.media_details?.width || 0,
    height: media.media_details?.height || 0
  };
}

function topicsFor(title) {
  return BLOG_TOPICS.filter(topic => topic.test?.test(title)).map(topic => topic.id);
}

function normalizePost(post) {
  if (!post?.slug) return null;
  const title = cleanTitle(post.title?.rendered || '');
  const { html, firstImage, headings, words } = sanitizeContent(post.content?.rendered || '', title);
  let image = mediaFromEmbed(post);
  let bodyHtml = html;
  if (!image && firstImage) {
    image = { src: firstImage.src, card: firstImage.src, srcset: firstImage.srcset, alt: firstImage.alt, width: 0, height: 0 };
  }
  // Elementor posts open with the cover image again; drop that copy from the body.
  if (image && firstImage?.leading && sameImage(image.src, firstImage.src)) bodyHtml = firstImage.withoutLeading;
  const topics = topicsFor(title);
  const badgeId = BADGE_ORDER.find(id => topics.includes(id));
  return {
    id: post.id,
    slug: post.slug,
    title,
    excerpt: cleanExcerpt(post.excerpt?.rendered, title),
    date: post.date,
    modified: post.modified,
    image,
    html: bodyHtml,
    headings,
    readMinutes: Math.max(2, Math.round(words / 210)),
    topics,
    badge: BLOG_TOPICS.find(topic => topic.id === badgeId)?.label || 'Gifting tips'
  };
}

function sameImage(a, b) {
  const base = url => (url || '').split('/').pop().replace(/-\d+x\d+(?=\.\w+$)/, '').replace(/\?.*$/, '');
  return Boolean(a && b) && base(a) === base(b);
}

// ---------------------------------------------------------------------------
// Sanitising post HTML: an allow-list, so page styles, scripts and Elementor
// markup from WordPress never leak into this site.
// ---------------------------------------------------------------------------

const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT',
  'TEXTAREA', 'SELECT', 'BUTTON', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'VIDEO', 'AUDIO', 'CANVAS']);
const KEEP_TAGS = new Set(['P', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'A', 'IMG', 'BR', 'HR',
  'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'SPAN', 'U', 'SUP', 'SUB']);
const KEEP_ATTRS = {
  A: ['href'],
  IMG: ['src', 'srcset', 'sizes', 'alt', 'width', 'height'],
  TH: ['colspan', 'rowspan'],
  TD: ['colspan', 'rowspan']
};
const SITE_ROUTES = { '': '#/', 'about-us': '#/about', contact: '#/contact', faqs: '#/faq', shop: '#/shop', 'shop-2': '#/shop', 'blog-grid': '#/blog', blog: '#/blog' };

function rewriteHref(href) {
  let url;
  try { url = new URL(href, WP_BASE); } catch { return null; }
  if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return null;
  // Some posts link to a Google search for the site instead of the site itself.
  if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && url.pathname === '/search') {
    const query = url.searchParams.get('q') || '';
    if (/giftingdestiny\.com/i.test(query)) return '#/';
  }
  if (/^(www\.)?giftingdestiny\.com$/i.test(url.hostname) || url.hostname === new URL(WP_BASE).hostname) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'product' && parts[1]) return `#/product/${parts[1]}`;
    if (parts[0] === 'product-category' && parts[1]) return `#/shop?category=${parts[1]}`;
    if (parts.length <= 1 && (parts[0] || '') in SITE_ROUTES) return SITE_ROUTES[parts[0] || ''];
    if (parts.length === 1) return `#/blog/${parts[0]}`;
    if (url.pathname.startsWith('/wp-content/')) return `${WP_BASE}${url.pathname}`;
  }
  return url.href;
}

function rewriteSrc(src) {
  if (!src) return '';
  return src.replace(/^https?:\/\/(www\.)?giftingdestiny\.com\/wp-content\//i, `${WP_BASE}/wp-content/`);
}

// Turns pasted Markdown ("## Heading", "**bold**", "*word*") into real markup.
function fixMarkdownArtifacts(doc, title) {
  doc.querySelectorAll('p').forEach(p => {
    const text = p.textContent.replace(/ /g, ' ').trim();
    const match = text.match(/^(#{1,4})\s+(.+)$/);
    if (!match) return;
    const heading = match[2].replace(/\*+/g, '').trim();
    if (match[1].length === 1 && heading.toLowerCase() === title.toLowerCase()) {
      p.remove();
      return;
    }
    const level = match[1].length <= 2 ? 'h2' : 'h3';
    const el = doc.createElement(level);
    el.textContent = heading;
    p.replaceWith(el);
  });
  // Paragraphs typed as "– item" / "- item" / "• item" become a real list.
  const bullet = /^\s*[–—•\-]\s+/;
  doc.querySelectorAll('p').forEach(p => {
    if (!bullet.test(p.textContent) || p.closest('li')) return;
    const prev = p.previousElementSibling;
    const list = prev?.tagName === 'UL' && prev.dataset.fromDashes ? prev : doc.createElement('ul');
    if (list !== prev) {
      list.dataset.fromDashes = '1';
      p.before(list);
    }
    const li = doc.createElement('li');
    li.append(...p.childNodes);
    const first = li.firstChild;
    if (first?.nodeType === Node.TEXT_NODE) first.nodeValue = first.nodeValue.replace(bullet, '');
    list.appendChild(li);
    p.remove();
  });
  doc.querySelectorAll('ul[data-from-dashes]').forEach(list => list.removeAttribute('data-from-dashes'));

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!/\*/.test(node.nodeValue)) return;
    const parentTag = node.parentElement?.tagName;
    if (parentTag === 'STRONG' || parentTag === 'B' || parentTag === 'EM' || parentTag === 'I') {
      node.nodeValue = node.nodeValue.replace(/\*+/g, '');
      return;
    }
    if (!/\*\*[^*]+\*\*|\*[^*\s][^*]*\*/.test(node.nodeValue)) return;
    const holder = doc.createElement('span');
    holder.innerHTML = node.nodeValue
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>');
    node.replaceWith(...holder.childNodes);
  });
}

function cleanNode(node) {
  [...node.children].forEach(child => {
    const tag = child.tagName;
    if (DROP_TAGS.has(tag)) {
      child.remove();
      return;
    }
    cleanNode(child);
    if (tag === 'H1' || tag === 'H5' || tag === 'H6') {
      const replacement = child.ownerDocument.createElement(tag === 'H1' ? 'h2' : 'h4');
      replacement.append(...child.childNodes);
      child.replaceWith(replacement);
      return;
    }
    if (!KEEP_TAGS.has(tag)) {
      child.replaceWith(...child.childNodes);
      return;
    }
    const allowed = KEEP_ATTRS[tag] || [];
    [...child.attributes].forEach(attr => {
      if (!allowed.includes(attr.name)) child.removeAttribute(attr.name);
    });
    if (tag === 'A') {
      const href = child.getAttribute('href');
      const next = href ? rewriteHref(href) : null;
      if (!next || !child.textContent.trim()) {
        child.replaceWith(...child.childNodes);
        return;
      }
      child.setAttribute('href', next);
      if (/^https?:/.test(next) && !next.startsWith(WP_BASE)) {
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer');
      }
    }
    if (tag === 'IMG') {
      const src = rewriteSrc(child.getAttribute('src'));
      if (!/^https?:/.test(src)) {
        child.remove();
        return;
      }
      child.setAttribute('src', src);
      if (child.hasAttribute('srcset')) {
        child.setAttribute('srcset', child.getAttribute('srcset').replace(/https?:\/\/(www\.)?giftingdestiny\.com\/wp-content\//gi, `${WP_BASE}/wp-content/`));
      }
      child.setAttribute('loading', 'lazy');
      child.setAttribute('decoding', 'async');
      if (!child.hasAttribute('alt')) child.setAttribute('alt', '');
    }
  });
}

function removeEmpty(doc) {
  doc.querySelectorAll('p, li, h2, h3, h4, strong, em, span, ul, ol, blockquote').forEach(el => {
    if (!el.textContent.replace(/ /g, ' ').trim() && !el.querySelector('img, br, hr')) el.remove();
  });
}

function sanitizeContent(rawHtml, title) {
  const doc = new DOMParser().parseFromString(`<body>${rawHtml}</body>`, 'text/html');
  fixMarkdownArtifacts(doc, title);
  cleanNode(doc.body);
  removeEmpty(doc);

  doc.querySelectorAll('table').forEach(table => {
    const wrap = doc.createElement('div');
    wrap.className = 'gdb-table-wrap';
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });

  const headings = [];
  doc.querySelectorAll('h2').forEach((h2, index) => {
    const label = h2.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const id = `section-${index + 1}`;
    h2.id = id;
    headings.push({ id, label: label.length > 70 ? `${label.slice(0, 67)}…` : label });
  });

  let firstImage = null;
  const img = doc.querySelector('img');
  if (img) {
    const firstBlock = doc.body.firstElementChild;
    const leading = Boolean(firstBlock && (firstBlock === img || firstBlock.contains(img)) && !firstBlock.textContent.trim());
    firstImage = { src: img.getAttribute('src'), srcset: img.getAttribute('srcset') || '', alt: img.getAttribute('alt') || '', leading };
    if (firstImage.leading) {
      const clone = doc.body.cloneNode(true);
      clone.firstElementChild?.remove();
      firstImage.withoutLeading = clone.innerHTML;
    }
  }

  const words = doc.body.textContent.trim().split(/\s+/).filter(Boolean).length;
  return { html: doc.body.innerHTML, firstImage, headings, words };
}
