import { csvProducts } from './csvProducts.js';

/**
 * 16 Live WooCommerce Categories exported from WordPress database
 * Verified with wc-product-export-1-10-2026-1790836882239.csv and live site
 */
export const liveWooCommerceCategories = [
  {
    slug: 'pen',
    name: 'Pen',
    match: ['Pen'],
    description: 'Executive metallic, matte, and glossy ballpoint pens with laser engraving.',
    image: '/images/categories/pens.jpg',
    icon: 'pen-tool'
  },
  {
    slug: 'bottle',
    name: 'Bottle',
    match: ['Bottle'],
    description: 'Insulated stainless steel water bottles and flasks with temperature display.',
    image: '/images/categories/bottles.jpg',
    icon: 'droplets'
  },
  {
    slug: 'keychains',
    name: 'Keychains',
    match: ['Keychains'],
    description: 'Premium metal, leatherette, and custom engraved keychains.',
    image: '/images/categories/keychains.jpg',
    icon: 'key'
  },
  {
    slug: 'combo-sets',
    name: 'Combo sets',
    match: ['Combo sets'],
    description: 'Curated corporate gifting hampers, luxury executive bundles, and VIP gift sets.',
    image: '/images/categories/combo.jpg',
    icon: 'gift'
  },
  {
    slug: 'pillow',
    name: 'Pillow',
    match: ['Pillow'],
    description: 'Customizable plush fur cushions and heart-shaped photo pillows.',
    image: '/images/categories/pillows.jpg',
    icon: 'heart'
  },
  {
    slug: 'diery',
    name: 'Diery',
    match: ['Diery'],
    description: 'Executive PU leather diaries, organizers, and notebooks with magnetic clasp.',
    image: '/images/categories/diaries.jpg',
    icon: 'book'
  },
  {
    slug: 'sublimation-mugs',
    name: 'Sublimation Mugs',
    match: ['Sublimation Mugs'],
    description: 'Ceramic dual-tone, heart-handle, and patch sublimation coffee mugs.',
    image: '/images/categories/sublimation-mugs.jpg',
    icon: 'coffee'
  },
  {
    slug: 'machine',
    name: 'Machine',
    match: ['Machine'],
    description: 'Industrial sublimation heat presses and machinery for mugs, caps, and t-shirts.',
    image: '/images/categories/machines.jpg',
    icon: 'cpu'
  },
  {
    slug: 'sublimation-accessories',
    name: 'Sublimation Accessories',
    match: ['Sublimation Accessories'],
    description: 'High-density sublimation inks, thermal tapes, and blank mouse pads.',
    image: '/images/categories/sublimation-accessories.jpg',
    icon: 'layers'
  },
  {
    slug: 'led-light-frames',
    name: 'LED Light Frames',
    match: ['LED Light Frames'],
    description: 'Personalized wooden finish backlit LED photo frames.',
    image: '/images/categories/frames.jpg',
    icon: 'sun'
  },
  {
    slug: 'wallet-combo-set',
    name: 'Wallet Combo set',
    match: ['Wallet Combo set'],
    description: 'Men’s bi-fold genuine leather wallets and 3-in-1 / 4-in-1 combo gift boxes.',
    image: '/images/categories/wallets.jpg',
    icon: 'briefcase'
  },
  {
    slug: 'fabric-diary',
    name: 'Fabric Diary',
    match: ['Fabric Diary'],
    description: 'Textured fabric finish executive journals and corporate diary sets.',
    image: '/images/categories/fabric-diary.jpg',
    icon: 'book-open'
  },
  {
    slug: 'card-holder',
    name: 'Card Holder',
    match: ['Card Holder'],
    description: 'Sleek metal and leather business visiting card cases.',
    image: '/images/categories/combo.jpg',
    icon: 'credit-card'
  },
  {
    slug: 'pen-keychain',
    name: 'Pen & Keychain',
    match: ['Pen & Keychain'],
    description: '2-in-1 matched luxury executive pen and keychain gift sets in presentation boxes.',
    image: '/images/categories/pens.jpg',
    icon: 'award'
  },
  {
    slug: 'wall-decor',
    name: 'Wall Decor',
    match: ['Wall Decor'],
    description: 'Glowing personalized wall art and decorative illuminated plaques.',
    image: '/images/categories/frames.jpg',
    icon: 'image'
  },
  {
    slug: 'mugs',
    name: 'Mugs',
    match: ['Mugs'],
    description: 'Mug collection (all 7 current custom mugs are catalogued under Sublimation Mugs).',
    image: '/images/categories/sublimation-mugs.jpg',
    icon: 'coffee'
  }
].map(cat => {
  const count = csvProducts.filter(p =>
    p.categories.some(c => cat.match.some(m => m.toLowerCase() === c.toLowerCase()))
  ).length;
  return {
    ...cat,
    id: cat.slug, // ID is canonical WooCommerce slug
    matchCategories: cat.match,
    count
  };
});

/**
 * Primary navigation categories shown in the header and catalog pills.
 * Uses real WooCommerce slugs and truthful counts.
 * "Mugs" (0 items) is intentionally omitted from the primary menu to prevent landing on empty lists,
 * while "Sublimation Mugs" (7 items) is prominently featured.
 */
export const categories = liveWooCommerceCategories.filter(c => c.count > 0);

/**
 * Mapping table from user/design aliases to canonical WooCommerce slugs
 */
export const categoryAliases = {
  // Plural/singular mappings
  'bottles': 'bottle',
  'bottle': 'bottle',
  
  'pens': 'pen',
  'pen': 'pen',
  
  'pillows': 'pillow',
  'pillow': 'pillow',
  'pillows & cushions': 'pillow',
  'pillows-cushions': 'pillow',
  
  'combo': 'combo-sets',
  'combo sets': 'combo-sets',
  'combo-sets': 'combo-sets',
  
  'diaries': 'diery',
  'diary': 'diery',
  'diery': 'diery',
  'diaries & wallets': 'diery',
  'diaries-wallets': 'diery',
  
  'accessories': 'sublimation-accessories',
  'sublimation-accessories': 'sublimation-accessories',
  'sublimation accessories': 'sublimation-accessories',
  
  'frames': 'led-light-frames',
  'frames & decor': 'led-light-frames',
  'frames-decor': 'led-light-frames',
  'led-light-frames': 'led-light-frames',
  'led light frames': 'led-light-frames',
  
  'mugs': 'mugs',
  'mug': 'mugs',
  
  'machines': 'machine',
  'machine': 'machine',
  
  'keychains': 'keychains',
  'keychain': 'keychains',
  
  'sublimation-mugs': 'sublimation-mugs',
  'sublimation mugs': 'sublimation-mugs',
  
  'wallet-combo-set': 'wallet-combo-set',
  'wallet combo set': 'wallet-combo-set',
  
  'fabric-diary': 'fabric-diary',
  'fabric diary': 'fabric-diary',
  
  'card-holder': 'card-holder',
  'card holder': 'card-holder',
  
  'pen-keychain': 'pen-keychain',
  'pen & keychain': 'pen-keychain',
  
  'wall-decor': 'wall-decor',
  'wall decor': 'wall-decor'
};

/**
 * Resolves any category identifier (slug, name, or design label alias)
 * to its canonical category object from liveWooCommerceCategories.
 */
export function getCategoryBySlugOrAlias(idOrAlias) {
  if (!idOrAlias || idOrAlias === 'all') return null;
  const key = idOrAlias.toLowerCase().trim();
  const canonicalSlug = categoryAliases[key] || key;
  return liveWooCommerceCategories.find(c => c.slug === canonicalSlug || c.name.toLowerCase() === key) || null;
}

/**
 * Determines whether a product belongs to the requested category.
 * Handles canonical WooCommerce slugs, exact names, and design reference aliases.
 */
export function matchProductCategory(product, selectedCatId) {
  if (!selectedCatId || selectedCatId === 'all') return true;

  const key = selectedCatId.toLowerCase().trim();
  const canonicalSlug = categoryAliases[key] || key;

  // Find category in authoritative live list
  const catObj = liveWooCommerceCategories.find(c => 
    c.slug === canonicalSlug || 
    c.name.toLowerCase() === key || 
    c.name.toLowerCase() === canonicalSlug
  );

  if (catObj) {
    // If the category has no match items or is "mugs" with 0 items, return false (truthful empty state)
    if (catObj.slug === 'mugs') {
      return false;
    }
    return product.categories.some(c =>
      catObj.match.some(m => m.toLowerCase() === c.toLowerCase().trim())
    );
  }

  // Fallback direct matching with product categories
  return product.categories.some(c => {
    const norm = c.toLowerCase().trim();
    return norm === canonicalSlug || norm === key;
  });
}
