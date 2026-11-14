<?php
declare(strict_types=1);

// Products and categories: the same 99 WooCommerce products and 9 categories as the old site
// (app/data/products.json was exported from src/data/csvProducts.js).

function gd_products(): array
{
    static $products = null;
    if ($products === null) {
        $products = json_decode((string)file_get_contents(GD_APP . '/data/products.json'), true) ?: [];
    }
    return $products;
}

function gd_find_product(string $idOrSlug): ?array
{
    foreach (gd_products() as $product) {
        if ($product['id'] === $idOrSlug || $product['slug'] === $idOrSlug) return $product;
    }
    return null;
}

function gd_categories(): array
{
    static $categories = null;
    if ($categories !== null) return $categories;
    $list = [
        ['slug' => 'bottle', 'name' => 'Bottle', 'match' => ['Bottle', 'Bottles'],
            'description' => 'Insulated stainless steel water bottles, flasks, and infusers with custom laser branding.'],
        ['slug' => 'keychains', 'name' => 'Keychains', 'match' => ['Keychains', 'Keychain'],
            'description' => 'Custom engraved metal, bamboo, and premium leatherette keychains.'],
        ['slug' => 'pen', 'name' => 'Pen', 'match' => ['Pen', 'Pens'],
            'description' => 'Executive metallic, matte, and glossy ballpoint pens with precision laser engraving.'],
        ['slug' => 'combo-sets', 'name' => 'Combo sets', 'match' => ['Combo sets', 'Combo set', 'Combo'],
            'description' => 'Curated corporate gifting hampers, executive bundles, and VIP presentation sets.'],
        ['slug' => 'pillow', 'name' => 'Pillow', 'match' => ['Pillow', 'Pillows', 'Cushion', 'Cushions'],
            'description' => 'Customizable plush fur cushions, heart-shaped photo pillows, and keepsake cushions.'],
        ['slug' => 'machine', 'name' => 'Machine', 'match' => ['Machine', 'Machines'],
            'description' => 'Industrial sublimation heat presses and machinery for mugs, caps, and garments.'],
        ['slug' => 'sublimation-mugs', 'name' => 'Sublimation Mugs', 'match' => ['Sublimation Mugs', 'Sublimation Mug', 'Mugs', 'Mug'],
            'description' => 'Ceramic dual-tone, heart-handle, and color interior sublimation coffee mugs.'],
        ['slug' => 'led-light-frames', 'name' => 'LED Light Frames', 'match' => ['LED Light Frames', 'LED Light Frame', 'LED Frames', 'Frames'],
            'description' => 'Personalized wooden finish backlit LED photo frames and glowing wall decor.'],
        ['slug' => 'sublimation-accessories', 'name' => 'Sublimation Accessories', 'match' => ['Sublimation Accessories', 'Sublimation Accessory', 'Accessories'],
            'description' => 'High-density sublimation inks, thermal tapes, and custom sublimation blanks.'],
    ];
    $categories = [];
    foreach ($list as $cat) {
        $count = 0;
        foreach (gd_products() as $p) {
            if (($p['categorySlug'] ?? '') === $cat['slug'] || gd_categories_match($p['categories'], $cat['match'])) $count++;
        }
        $cat['id'] = $cat['slug'];
        $cat['image'] = '/images/categories/' . $cat['slug'] . '.webp';
        $cat['count'] = $count;
        $categories[] = $cat;
    }
    return $categories;
}

function gd_categories_match(array $productCats, array $match): bool
{
    foreach ($productCats as $c) {
        foreach ($match as $m) {
            if (mb_strtolower($m) === mb_strtolower(trim($c))) return true;
        }
    }
    return false;
}

function gd_category_aliases(): array
{
    return [
        'bottles' => 'bottle', 'bottle' => 'bottle',
        'pens' => 'pen', 'pen' => 'pen',
        'keychains' => 'keychains', 'keychain' => 'keychains',
        'combo' => 'combo-sets', 'combo sets' => 'combo-sets', 'combo-sets' => 'combo-sets', 'combos' => 'combo-sets',
        'pillows' => 'pillow', 'pillow' => 'pillow', 'pillows & cushions' => 'pillow', 'pillows-cushions' => 'pillow',
        'cushion' => 'pillow', 'cushions' => 'pillow',
        'machines' => 'machine', 'machine' => 'machine',
        'sublimation-mugs' => 'sublimation-mugs', 'sublimation mugs' => 'sublimation-mugs', 'mugs' => 'sublimation-mugs', 'mug' => 'sublimation-mugs',
        'led-light-frames' => 'led-light-frames', 'led light frames' => 'led-light-frames', 'frames' => 'led-light-frames',
        'frame' => 'led-light-frames', 'led-frames' => 'led-light-frames',
        'sublimation-accessories' => 'sublimation-accessories', 'sublimation accessories' => 'sublimation-accessories',
        'accessories' => 'sublimation-accessories', 'accessory' => 'sublimation-accessories',
    ];
}

function gd_canonical_category(string $idOrAlias): string
{
    $key = mb_strtolower(trim($idOrAlias));
    return gd_category_aliases()[$key] ?? $key;
}

function gd_category_by_slug_or_alias(?string $idOrAlias): ?array
{
    if ($idOrAlias === null || $idOrAlias === '' || $idOrAlias === 'all') return null;
    $key = mb_strtolower(trim($idOrAlias));
    $slug = gd_category_aliases()[$key] ?? $key;
    foreach (gd_categories() as $cat) {
        if ($cat['slug'] === $slug || mb_strtolower($cat['name']) === $key) return $cat;
    }
    return null;
}

function gd_match_product_category(array $product, ?string $selected): bool
{
    if ($selected === null || $selected === '' || $selected === 'all') return true;
    $key = mb_strtolower(trim($selected));
    $slug = gd_category_aliases()[$key] ?? $key;
    if (!empty($product['categorySlug']) && $product['categorySlug'] === $slug) return true;
    foreach (gd_categories() as $cat) {
        if ($cat['slug'] === $slug) return gd_categories_match($product['categories'], $cat['match']);
    }
    foreach ($product['categories'] as $c) {
        $norm = mb_strtolower(trim($c));
        if ($norm === $slug || $norm === $key) return true;
    }
    return false;
}

/** Category, search and sort, as on the old catalogue. */
function gd_filter_products(string $category = 'all', string $query = '', string $sort = 'featured'): array
{
    $needle = mb_strtolower(trim($query));
    $out = [];
    foreach (gd_products() as $p) {
        if (!gd_match_product_category($p, $category)) continue;
        if ($needle !== '') {
            $hit = str_contains(mb_strtolower($p['name']), $needle)
                || (bool)array_filter($p['categories'], fn($c) => str_contains(mb_strtolower($c), $needle))
                || (!empty($p['description']) && str_contains(mb_strtolower($p['description']), $needle));
            if (!$hit) continue;
        }
        $out[] = $p;
    }
    if ($sort === 'name-asc') usort($out, fn($a, $b) => gd_compare_names($a['name'], $b['name']));
    if ($sort === 'name-desc') usort($out, fn($a, $b) => gd_compare_names($b['name'], $a['name']));
    return $out;
}

function gd_compare_names(string $a, string $b): int
{
    static $collator = null;
    if ($collator === null) $collator = class_exists('Collator') ? new Collator('en_IN') : false;
    return $collator ? $collator->compare($a, $b) : strcasecmp($a, $b);
}

/** Card-size photo copies (images/thumbs/400 and /720) for product and category photos. */
function gd_thumb_set(string $path): array
{
    if (!preg_match('~^/images/(products|categories)/~', $path)) return ['src' => url($path), 'srcset' => ''];
    $rel = substr($path, strlen('/images/'));
    return [
        'src' => url('/images/thumbs/400/' . $rel),
        'srcset' => url('/images/thumbs/400/' . $rel) . ' 400w, ' . url('/images/thumbs/720/' . $rel) . ' 720w',
    ];
}

const GD_CARD_SIZES = '(max-width: 768px) 46vw, (max-width: 1200px) 30vw, 300px';

/** Where a customer's name sits on each calibrated mug photo (old site's mugPrintAreas.js). */
function gd_mug_print_areas(): array
{
    return [
        '2-2-34-6.webp' => ['x' => 46.5, 'y' => 53.5, 'w' => 31, 'rot' => 2.5],
        'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Mandys-Pink-Colored-Interior-Handle.webp' => ['x' => 51.9, 'y' => 47.6, 'w' => 28, 'rot' => 19],
        'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle.webp' => ['x' => 50.1, 'y' => 37.6, 'w' => 27.5, 'rot' => 8.5],
        'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Orange-Colored-Interior-Handle.webp' => ['x' => 40, 'y' => 55, 'w' => 28, 'rot' => 0],
        'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Red-Colored-Interior-Handle.webp' => ['x' => 51, 'y' => 45.5, 'w' => 28, 'rot' => 10],
        '1-2-1.webp' => ['x' => 65.5, 'y' => 50.5, 'w' => 25, 'rot' => -21],
        'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Yellow-Green-Colored-Interior-Handle.webp' => ['x' => 51.1, 'y' => 34.3, 'w' => 27, 'rot' => 22],
    ];
}

function gd_mug_print_area(string $src): ?array
{
    $file = rawurldecode(basename(explode('?', $src)[0]));
    return gd_mug_print_areas()[$file] ?? null;
}

/** Name preview only for real mugs/cups whose photos are calibrated (not the mug press machines). */
function gd_is_drinkware(array $product): bool
{
    $images = !empty($product['images']) ? $product['images'] : [$product['primaryImage']];
    $text = $product['name'] . ' ' . ($product['primaryCategory'] ?? '') . ' ' . implode(' ', $product['categories'] ?? []);
    if (!preg_match('/\b(mug|glass|cup|tumbler)\b/i', $text)) return false;
    if (preg_match('/\b(machine|press)\b/i', $product['name'])) return false;
    foreach ($images as $image) if (gd_mug_print_area($image)) return true;
    return false;
}

/** Turns the raw WooCommerce description into clean paragraphs and feature lists (old formatProductDescription). */
function gd_format_product_description(?string $raw): string
{
    if ($raw === null || $raw === '') return '';
    $text = str_replace('\\r\\n', "\n", $raw);
    $text = str_replace('\\n', "\n", $text);
    $text = str_replace('\\r', "\n", $text);
    $text = str_replace("\r\n", "\n", $text);
    $text = str_replace("\r", "\n", $text);
    $text = str_replace("\t", ' ', $text);
    $text = preg_replace('/&nbsp;/i', ' ', $text);

    $text = preg_replace('/^\s*<strong>\s*Description\s*<\/strong>\s*/i', '', $text);
    $text = preg_replace('/^\s*Description\s*[\n:]+/i', '', $text);

    $badge = '<div class="pdp-features-badge-header"><span class="features-badge-icon">✦</span> Key Features & Specifications</div>';
    $text = preg_replace('/<(?:h[1-6]|strong|b)>\s*(?:<b>|<strong>)?\s*Key Features\s*(?:<\/strong>|<\/b>)?\s*<\/(?:h[1-6]|strong|b)>/i', $badge, $text);
    $text = preg_replace('/<strong>\s*Key Features\s*<\/strong>/i', $badge, $text);

    $text = preg_replace('/style="[^"]*"/i', '', $text);
    $text = preg_replace('/aria-level="[^"]*"/i', '', $text);
    $text = preg_replace('/<\/?span[^>]*>/i', '', $text);

    $text = preg_replace('/<ul>\s*/i', '<ul class="pdp-features-clean-list">', $text);
    $text = preg_replace('/<li[^>]*>\s*/i', '<li>', $text);
    $text = preg_replace('/\s*<\/li>/i', '</li>', $text);

    $parts = preg_split('/(<div class="pdp-features-badge-header">[\s\S]*?<\/div>|<ul[\s\S]*?<\/ul>)/i', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
    $html = '';
    foreach ($parts as $part) {
        if (str_starts_with($part, '<div class="pdp-features-badge-header"') || str_starts_with($part, '<ul')) {
            $html .= $part;
            continue;
        }
        foreach (preg_split('/\n\s*\n/', $part) as $p) {
            $p = trim($p);
            if ($p === '') continue;
            if (str_starts_with($p, '<p') || str_starts_with($p, '<div')) {
                $html .= $p;
                continue;
            }
            $clean = trim(preg_replace('/\n+/', ' ', $p));
            if ($clean !== '') $html .= '<p class="pdp-clean-paragraph">' . $clean . '</p>';
        }
    }
    return $html;
}

/** Compact product list for the browser (live search, wishlist, bag). */
function gd_catalog_for_browser(): array
{
    $out = [];
    foreach (gd_products() as $p) {
        $out[] = [
            'id' => $p['id'],
            'slug' => $p['slug'],
            'name' => $p['name'],
            'sku' => $p['sku'] ?? '',
            'categories' => $p['categories'],
            'primaryCategory' => $p['primaryCategory'] ?? '',
            'primaryImage' => url($p['primaryImage']),
            'inStock' => (bool)($p['inStock'] ?? true),
            'search' => mb_strtolower($p['description'] ?? ''),
        ];
    }
    return $out;
}
