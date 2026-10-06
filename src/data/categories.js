import { csvProducts } from './csvProducts.js';

/**
 * The 9 Official WooCommerce Categories from http://giftingdestiny.webhostingbaba.com
 * Accurately matching live categories and original product photography.
 */
export const liveWooCommerceCategories = [
  {
    slug: 'bottle',
    name: 'Bottle',
    match: ['Bottle', 'Bottles'],
    description: 'Insulated stainless steel water bottles, flasks, and infusers with custom laser branding.',
    image: '/images/categories/bottle.webp',
    icon: 'droplets'
  },
  {
    slug: 'keychains',
    name: 'Keychains',
    match: ['Keychains', 'Keychain'],
    description: 'Custom engraved metal, bamboo, and premium leatherette keychains.',
    image: '/images/categories/keychains.webp',
    icon: 'key'
  },
  {
    slug: 'pen',
    name: 'Pen',
    match: ['Pen', 'Pens'],
    description: 'Executive metallic, matte, and glossy ballpoint pens with precision laser engraving.',
    image: '/images/categories/pen.webp',
    icon: 'pen-tool'
  },
  {
    slug: 'combo-sets',
    name: 'Combo sets',
    match: ['Combo sets', 'Combo set', 'Combo'],
    description: 'Curated corporate gifting hampers, executive bundles, and VIP presentation sets.',
    image: '/images/categories/combo-sets.webp',
    icon: 'gift'
  },
  {
    slug: 'pillow',
    name: 'Pillow',
    match: ['Pillow', 'Pillows', 'Cushion', 'Cushions'],
    description: 'Customizable plush fur cushions, heart-shaped photo pillows, and keepsake cushions.',
    image: '/images/categories/pillow.webp',
    icon: 'heart'
  },
  {
    slug: 'machine',
    name: 'Machine',
    match: ['Machine', 'Machines'],
    description: 'Industrial sublimation heat presses and machinery for mugs, caps, and garments.',
    image: '/images/categories/machine.webp',
    icon: 'cpu'
  },
  {
    slug: 'sublimation-mugs',
    name: 'Sublimation Mugs',
    match: ['Sublimation Mugs', 'Sublimation Mug', 'Mugs', 'Mug'],
    description: 'Ceramic dual-tone, heart-handle, and color interior sublimation coffee mugs.',
    image: '/images/categories/sublimation-mugs.webp',
    icon: 'coffee'
  },
  {
    slug: 'led-light-frames',
    name: 'LED Light Frames',
    match: ['LED Light Frames', 'LED Light Frame', 'LED Frames', 'Frames'],
    description: 'Personalized wooden finish backlit LED photo frames and glowing wall decor.',
    image: '/images/categories/led-light-frames.webp',
    icon: 'sun'
  },
  {
    slug: 'sublimation-accessories',
    name: 'Sublimation Accessories',
    match: ['Sublimation Accessories', 'Sublimation Accessory', 'Accessories'],
    description: 'High-density sublimation inks, thermal tapes, and custom sublimation blanks.',
    image: '/images/categories/sublimation-accessories.webp',
    icon: 'layers'
  }
].map(cat => {
  const count = csvProducts.filter(p =>
    (p.categorySlug === cat.slug) ||
    p.categories.some(c => cat.match.some(m => m.toLowerCase() === c.toLowerCase()))
  ).length;
  return {
    ...cat,
    id: cat.slug,
    matchCategories: cat.match,
    count
  };
});

/**
 * Authoritative category navigation list (all 9 live categories)
 */
export const categories = liveWooCommerceCategories;

/**
 * Mapping table from user/design aliases to canonical slugs
 */
export const categoryAliases = {
  // Singular / Plural aliases
  'bottles': 'bottle',
  'bottle': 'bottle',
  
  'pens': 'pen',
  'pen': 'pen',
  
  'keychains': 'keychains',
  'keychain': 'keychains',
  
  'combo': 'combo-sets',
  'combo sets': 'combo-sets',
  'combo-sets': 'combo-sets',
  'combos': 'combo-sets',
  
  'pillows': 'pillow',
  'pillow': 'pillow',
  'pillows & cushions': 'pillow',
  'pillows-cushions': 'pillow',
  'cushion': 'pillow',
  'cushions': 'pillow',
  
  'machines': 'machine',
  'machine': 'machine',
  
  'sublimation-mugs': 'sublimation-mugs',
  'sublimation mugs': 'sublimation-mugs',
  'mugs': 'sublimation-mugs',
  'mug': 'sublimation-mugs',
  
  'led-light-frames': 'led-light-frames',
  'led light frames': 'led-light-frames',
  'frames': 'led-light-frames',
  'frame': 'led-light-frames',
  'led-frames': 'led-light-frames',
  
  'sublimation-accessories': 'sublimation-accessories',
  'sublimation accessories': 'sublimation-accessories',
  'accessories': 'sublimation-accessories',
  'accessory': 'sublimation-accessories'
};

/**
 * Resolves category identifier or alias to its canonical category object
 */
export function getCategoryBySlugOrAlias(idOrAlias) {
  if (!idOrAlias || idOrAlias === 'all') return null;
  const key = idOrAlias.toLowerCase().trim();
  const canonicalSlug = categoryAliases[key] || key;
  return liveWooCommerceCategories.find(c => c.slug === canonicalSlug || c.name.toLowerCase() === key) || null;
}

/**
 * Determines whether a product belongs to the requested category
 */
export function matchProductCategory(product, selectedCatId) {
  if (!selectedCatId || selectedCatId === 'all') return true;

  const key = selectedCatId.toLowerCase().trim();
  const canonicalSlug = categoryAliases[key] || key;

  if (product.categorySlug && product.categorySlug === canonicalSlug) {
    return true;
  }

  const catObj = liveWooCommerceCategories.find(c => c.slug === canonicalSlug);
  if (catObj) {
    return product.categories.some(c =>
      catObj.match.some(m => m.toLowerCase() === c.toLowerCase().trim())
    );
  }

  return product.categories.some(c => {
    const norm = c.toLowerCase().trim();
    return norm === canonicalSlug || norm === key;
  });
}
