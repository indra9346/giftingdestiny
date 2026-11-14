<?php
declare(strict_types=1);

// Blog HTML clean-up. An allow-list, so scripts, page styles and builder markup never reach the site.
// 'import' mode is the old site's WordPress clean-up (src/data/blog.js) ported to PHP;
// 'admin' mode also keeps the editor's colours, alignment, tables and YouTube/Vimeo videos.

const GD_HTML_DROP = ['script', 'style', 'link', 'meta', 'object', 'embed', 'form', 'input', 'textarea', 'select',
    'button', 'noscript', 'template', 'svg', 'math', 'video', 'audio', 'canvas', 'title', 'head'];
const GD_HTML_KEEP = ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'img', 'br', 'hr',
    'blockquote', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'span', 'u', 'sup', 'sub'];
const GD_HTML_KEEP_ADMIN = ['s', 'del', 'pre', 'code', 'iframe'];
const GD_STYLE_PROPS = ['color', 'background-color', 'text-align', 'font-weight', 'font-style', 'text-decoration',
    'text-decoration-line', 'font-size', 'font-family'];

function gd_dom_load(string $html): DOMDocument
{
    $doc = new DOMDocument('1.0', 'UTF-8');
    $previous = libxml_use_internal_errors(true);
    $doc->loadHTML('<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>'
        . $html . '</body></html>', LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    return $doc;
}

function gd_dom_body(DOMDocument $doc): DOMElement
{
    $body = $doc->getElementsByTagName('body')->item(0);
    if (!$body) {
        $body = $doc->createElement('body');
        $doc->appendChild($body);
    }
    return $body;
}

function gd_dom_inner(DOMNode $node): string
{
    $html = '';
    foreach ($node->childNodes as $child) $html .= $node->ownerDocument->saveHTML($child);
    return $html;
}

function gd_dom_unwrap(DOMNode $node): void
{
    $parent = $node->parentNode;
    if (!$parent) return;
    while ($node->firstChild) $parent->insertBefore($node->firstChild, $node);
    $parent->removeChild($node);
}

function gd_dom_rename(DOMElement $node, string $tag): DOMElement
{
    $new = $node->ownerDocument->createElement($tag);
    foreach (iterator_to_array($node->attributes ?? []) as $attr) $new->setAttribute($attr->name, $attr->value);
    while ($node->firstChild) $new->appendChild($node->firstChild);
    $node->parentNode->replaceChild($new, $node);
    return $new;
}

/** True when $node is $ancestor or sits inside it (DOMNode::contains() needs PHP 8.3). */
function gd_dom_is_inside(DOMNode $node, DOMNode $ancestor): bool
{
    for ($n = $node; $n !== null; $n = $n->parentNode) if ($n === $ancestor) return true;
    return false;
}

function gd_text(DOMNode $node): string
{
    return str_replace("\xC2\xA0", ' ', $node->textContent ?? '');
}

/** Old site's link rules for imported posts: WordPress pages become this site's pages. */
function gd_rewrite_import_href(string $href): ?string
{
    $href = trim($href);
    if ($href === '') return null;
    $wpBase = 'https://giftingdestiny.webhostingbaba.com';
    if (str_starts_with($href, '/')) $href = $wpBase . $href;
    $parts = parse_url($href);
    if (!$parts || empty($parts['scheme'])) return null;
    $scheme = strtolower($parts['scheme']);
    if (!in_array($scheme, ['http', 'https', 'mailto', 'tel'], true)) return null;
    if ($scheme === 'mailto' || $scheme === 'tel') return $href;
    $host = strtolower($parts['host'] ?? '');
    $path = $parts['path'] ?? '/';
    if (preg_match('/(^|\.)google\.[a-z.]+$/', $host) && $path === '/search') {
        parse_str($parts['query'] ?? '', $q);
        if (preg_match('/giftingdestiny\.com/i', (string)($q['q'] ?? ''))) return '/';
    }
    if (preg_match('/^(www\.)?giftingdestiny\.com$/', $host) || $host === 'giftingdestiny.webhostingbaba.com') {
        $segments = array_values(array_filter(explode('/', $path), 'strlen'));
        $routes = ['' => '/', 'about-us' => '/about', 'contact' => '/contact', 'faqs' => '/faq', 'shop' => '/shop',
            'shop-2' => '/shop', 'blog-grid' => '/blog', 'blog' => '/blog'];
        if (($segments[0] ?? '') === 'product' && !empty($segments[1])) return '/product/' . $segments[1];
        if (($segments[0] ?? '') === 'product-category' && !empty($segments[1])) return '/shop?category=' . rawurlencode($segments[1]);
        if (count($segments) <= 1 && array_key_exists($segments[0] ?? '', $routes)) return $routes[$segments[0] ?? ''];
        if (count($segments) === 1) return '/blog/' . $segments[0];
        if (str_starts_with($path, '/wp-content/')) return $wpBase . $path;
    }
    return $href;
}

function gd_safe_href(string $href): ?string
{
    $href = trim($href);
    if ($href === '') return null;
    if (str_starts_with($href, '#')) return $href;
    if (str_starts_with($href, '/') && !str_starts_with($href, '//')) return $href;
    if (preg_match('~^(https?:|mailto:|tel:)~i', $href)) return $href;
    if (preg_match('~^[a-z0-9.-]+\.[a-z]{2,}(/|$)~i', $href)) return 'https://' . $href;
    return null;
}

function gd_safe_src(string $src): ?string
{
    $src = trim(preg_replace('~^https?://(www\.)?giftingdestiny\.com/wp-content/~i', 'https://giftingdestiny.webhostingbaba.com/wp-content/', $src));
    if (preg_match('~^https?://~i', $src)) return $src;
    if (str_starts_with($src, '/') && !str_starts_with($src, '//')) return $src;
    return null;
}

function gd_safe_style(string $style, bool $isImage): string
{
    $keep = [];
    foreach (explode(';', $style) as $rule) {
        if (!str_contains($rule, ':')) continue;
        [$prop, $value] = array_map('trim', explode(':', $rule, 2));
        $prop = strtolower($prop);
        $allowed = GD_STYLE_PROPS;
        if ($isImage) $allowed = array_merge($allowed, ['width', 'float', 'max-width']);
        if (!in_array($prop, $allowed, true)) continue;
        if ($value === '' || !preg_match('/^[#a-z0-9(),.%\s\'"\-]+$/i', $value) || preg_match('/url|expression|javascript/i', $value)) continue;
        if ($prop === 'float' && !in_array(strtolower($value), ['left', 'right', 'none'], true)) continue;
        $keep[] = $prop . ': ' . $value;
    }
    return implode('; ', $keep);
}

function gd_is_video_embed(string $src): bool
{
    return (bool)preg_match('~^https://(www\.)?(youtube\.com|youtube-nocookie\.com)/embed/[\w\-?=&;%]+$|^https://player\.vimeo\.com/video/\d+~i', $src);
}

function gd_has_block_child(DOMElement $el): bool
{
    foreach ($el->childNodes as $c) {
        if ($c instanceof DOMElement && in_array(strtolower($c->tagName), ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'table', 'blockquote', 'div', 'figure', 'pre', 'hr'], true)) return true;
    }
    return false;
}

function gd_clean_node(DOMNode $node, string $mode): void
{
    $keep = $mode === 'admin' ? array_merge(GD_HTML_KEEP, GD_HTML_KEEP_ADMIN) : GD_HTML_KEEP;
    foreach (iterator_to_array($node->childNodes) as $child) {
        if ($child instanceof DOMComment) {
            $node->removeChild($child);
            continue;
        }
        if (!$child instanceof DOMElement) continue;
        $tag = strtolower($child->tagName);
        if (in_array($tag, GD_HTML_DROP, true) || ($tag === 'iframe' && ($mode !== 'admin' || !gd_is_video_embed($child->getAttribute('src'))))) {
            $node->removeChild($child);
            continue;
        }
        gd_clean_node($child, $mode);
        if ($tag === 'h1' || $tag === 'h5' || $tag === 'h6') {
            gd_dom_rename($child, $tag === 'h1' ? 'h2' : 'h4');
            continue;
        }
        if ($tag === 'font' && $mode === 'admin') {
            $color = $child->getAttribute('color');
            $child = gd_dom_rename($child, 'span');
            foreach (iterator_to_array($child->attributes) as $attr) $child->removeAttribute($attr->name);
            if ($color !== '' && preg_match('/^#?[0-9a-z]+$/i', $color)) $child->setAttribute('style', 'color: ' . $color);
            continue;
        }
        if ($tag === 'div' && $mode === 'admin' && $node->nodeName === 'body' && !gd_has_block_child($child)) {
            // Editor paragraphs sometimes come as <div>; keep them as paragraphs.
            $child = gd_dom_rename($child, 'p');
            $tag = 'p';
        } elseif (!in_array($tag, $keep, true)) {
            gd_dom_unwrap($child);
            continue;
        }

        $style = $child->getAttribute('style');
        foreach (iterator_to_array($child->attributes) as $attr) {
            $name = strtolower($attr->name);
            $allowed = match ($tag) {
                'a' => ['href'],
                'img' => ['src', 'srcset', 'sizes', 'alt', 'width', 'height'],
                'th', 'td' => ['colspan', 'rowspan'],
                'iframe' => ['src', 'width', 'height', 'allowfullscreen'],
                default => [],
            };
            if (!in_array($name, $allowed, true)) $child->removeAttribute($attr->name);
        }
        if ($mode === 'admin' && $style !== '' && in_array($tag, ['p', 'span', 'h2', 'h3', 'h4', 'li', 'td', 'th', 'img', 'strong', 'em', 'u', 'b', 'i', 'blockquote'], true)) {
            $clean = gd_safe_style($style, $tag === 'img');
            if ($clean !== '') $child->setAttribute('style', $clean);
        }

        if ($tag === 'a') {
            $href = $child->getAttribute('href');
            $next = $mode === 'import' ? gd_rewrite_import_href($href) : gd_safe_href($href);
            if ($next === null || trim(gd_text($child)) === '' && !$child->getElementsByTagName('img')->length) {
                gd_dom_unwrap($child);
                continue;
            }
            $child->setAttribute('href', $next);
            if (preg_match('~^https?://~i', $next) && !str_starts_with($next, 'https://giftingdestiny.webhostingbaba.com')) {
                $child->setAttribute('target', '_blank');
                $child->setAttribute('rel', 'noopener noreferrer');
            }
        }
        if ($tag === 'img') {
            $src = gd_safe_src($child->getAttribute('src'));
            if ($src === null) {
                $child->parentNode->removeChild($child);
                continue;
            }
            $child->setAttribute('src', $src);
            if ($child->hasAttribute('srcset')) {
                $child->setAttribute('srcset', preg_replace('~https?://(www\.)?giftingdestiny\.com/wp-content/~i', 'https://giftingdestiny.webhostingbaba.com/wp-content/', $child->getAttribute('srcset')));
            }
            $child->setAttribute('loading', 'lazy');
            $child->setAttribute('decoding', 'async');
            if (!$child->hasAttribute('alt')) $child->setAttribute('alt', '');
        }
        if ($tag === 'iframe') {
            $child->setAttribute('loading', 'lazy');
            $child->setAttribute('allowfullscreen', '');
            $child->setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            $child->setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            $child->setAttribute('title', 'Video');
        }
    }
}

/** Pasted Markdown ("## Heading", "**bold**", "- item") becomes real markup (import only, like the old site). */
function gd_fix_markdown(DOMDocument $doc, string $title): void
{
    $body = gd_dom_body($doc);
    foreach (iterator_to_array($doc->getElementsByTagName('p')) as $p) {
        $text = trim(gd_text($p));
        if (!preg_match('/^(#{1,4})\s+(.+)$/u', $text, $m)) continue;
        $heading = trim(str_replace('*', '', $m[2]));
        if (strlen($m[1]) === 1 && mb_strtolower($heading) === mb_strtolower($title)) {
            $p->parentNode->removeChild($p);
            continue;
        }
        $el = $doc->createElement(strlen($m[1]) <= 2 ? 'h2' : 'h3');
        $el->appendChild($doc->createTextNode($heading));
        $p->parentNode->replaceChild($el, $p);
    }
    $bullet = '/^\s*[–—•\-]\s+/u';
    foreach (iterator_to_array($doc->getElementsByTagName('p')) as $p) {
        if (!preg_match($bullet, gd_text($p))) continue;
        for ($a = $p->parentNode; $a; $a = $a->parentNode) if ($a->nodeName === 'li') continue 2;
        $prev = $p->previousSibling;
        while ($prev && $prev->nodeType === XML_TEXT_NODE && trim($prev->textContent) === '') $prev = $prev->previousSibling;
        if ($prev instanceof DOMElement && $prev->nodeName === 'ul' && $prev->getAttribute('data-from-dashes')) {
            $list = $prev;
        } else {
            $list = $doc->createElement('ul');
            $list->setAttribute('data-from-dashes', '1');
            $p->parentNode->insertBefore($list, $p);
        }
        $li = $doc->createElement('li');
        while ($p->firstChild) $li->appendChild($p->firstChild);
        if ($li->firstChild && $li->firstChild->nodeType === XML_TEXT_NODE) {
            $li->firstChild->nodeValue = preg_replace($bullet, '', $li->firstChild->nodeValue);
        }
        $list->appendChild($li);
        $p->parentNode->removeChild($p);
    }
    foreach (iterator_to_array($doc->getElementsByTagName('ul')) as $ul) $ul->removeAttribute('data-from-dashes');

    $xpath = new DOMXPath($doc);
    foreach (iterator_to_array($xpath->query('//body//text()')) as $node) {
        if (!str_contains($node->nodeValue, '*')) continue;
        $parent = strtolower($node->parentNode->nodeName ?? '');
        if (in_array($parent, ['strong', 'b', 'em', 'i'], true)) {
            $node->nodeValue = str_replace('*', '', $node->nodeValue);
            continue;
        }
        if (!preg_match('/\*\*[^*]+\*\*|\*[^*\s][^*]*\*/', $node->nodeValue)) continue;
        $html = htmlspecialchars($node->nodeValue, ENT_NOQUOTES, 'UTF-8');
        $html = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $html);
        $html = preg_replace('/\*([^*\s][^*]*)\*/', '<em>$1</em>', $html);
        $frag = gd_dom_load($html);
        $fragBody = gd_dom_body($frag);
        foreach (iterator_to_array($fragBody->childNodes) as $c) {
            $node->parentNode->insertBefore($doc->importNode($c, true), $node);
        }
        $node->parentNode->removeChild($node);
    }
}

function gd_remove_empty(DOMDocument $doc): void
{
    $xpath = new DOMXPath($doc);
    $nodes = $xpath->query('//body//*[self::p or self::li or self::h2 or self::h3 or self::h4 or self::strong or self::em or self::span or self::ul or self::ol or self::blockquote]');
    foreach (array_reverse(iterator_to_array($nodes)) as $el) {
        if (!$el->parentNode) continue;
        if (trim(gd_text($el)) !== '') continue;
        if ($xpath->query('.//img|.//br|.//hr|.//iframe', $el)->length) continue;
        $el->parentNode->removeChild($el);
    }
}

/**
 * Cleans blog HTML. Returns ['html', 'words', 'first_image' => [src, srcset, alt, leading] | null, 'without_leading'].
 */
function gd_sanitize_blog_html(string $raw, string $title = '', string $mode = 'admin'): array
{
    $doc = gd_dom_load($raw);
    if ($mode === 'import') gd_fix_markdown($doc, $title);
    $body = gd_dom_body($doc);
    gd_clean_node($body, $mode);
    gd_remove_empty($doc);

    $firstImage = null;
    $withoutLeading = null;
    $img = $body->getElementsByTagName('img')->item(0);
    if ($img) {
        $firstBlock = null;
        foreach ($body->childNodes as $c) if ($c instanceof DOMElement) { $firstBlock = $c; break; }
        $leading = $firstBlock && gd_dom_is_inside($img, $firstBlock) && trim(gd_text($firstBlock)) === '';
        $firstImage = ['src' => $img->getAttribute('src'), 'srcset' => $img->getAttribute('srcset'), 'alt' => $img->getAttribute('alt'), 'leading' => $leading];
        if ($leading) {
            $clone = $body->cloneNode(true);
            foreach ($clone->childNodes as $c) if ($c instanceof DOMElement) { $clone->removeChild($c); break; }
            $withoutLeading = gd_dom_inner($clone);
        }
    }
    $text = trim(preg_replace('/\s+/u', ' ', gd_text($body)));
    $words = $text === '' ? 0 : count(preg_split('/\s+/u', $text));
    return ['html' => trim(gd_dom_inner($body)), 'words' => $words, 'first_image' => $firstImage, 'without_leading' => $withoutLeading];
}

/** For showing a post: ids on h2 for the contents list, tables wrapped for sideways scroll, videos wrapped. */
function gd_prepare_post_html(string $html): array
{
    $doc = gd_dom_load($html);
    $body = gd_dom_body($doc);
    foreach (iterator_to_array($body->getElementsByTagName('table')) as $table) {
        $wrap = $doc->createElement('div');
        $wrap->setAttribute('class', 'gdb-table-wrap');
        $table->parentNode->replaceChild($wrap, $table);
        $wrap->appendChild($table);
    }
    foreach (iterator_to_array($body->getElementsByTagName('iframe')) as $frame) {
        $wrap = $doc->createElement('div');
        $wrap->setAttribute('class', 'gdb-video-wrap');
        $frame->parentNode->replaceChild($wrap, $frame);
        $wrap->appendChild($frame);
    }
    $headings = [];
    $i = 0;
    foreach (iterator_to_array($body->getElementsByTagName('h2')) as $h2) {
        $i++;
        $label = trim(preg_replace('/\s+/u', ' ', gd_text($h2)));
        if ($label === '') continue;
        $id = 'section-' . $i;
        $h2->setAttribute('id', $id);
        $headings[] = ['id' => $id, 'label' => mb_strlen($label) > 70 ? mb_substr($label, 0, 67) . '…' : $label];
    }
    return ['html' => gd_dom_inner($body), 'headings' => $headings];
}

/** Card summary text (old cleanExcerpt). */
function gd_make_excerpt(string $html, string $title = ''): string
{
    $text = preg_replace('/<[^>]+>/', ' ', $html);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\[(?:…|&hellip;|\.\.\.)\]/u', '', $text);
    $text = preg_replace('/[#*]+/', '', $text);
    $text = trim(preg_replace('/\s+/u', ' ', $text));
    if ($title !== '' && str_starts_with(mb_strtolower($text), mb_strtolower($title))) $text = trim(mb_substr($text, mb_strlen($title)));
    $text = preg_replace('/^(introduction|corporate gifting guide 2026)\s*:?\s*/i', '', $text);
    if (mb_strlen($text) > 210) $text = preg_replace('/\s+\S*$/u', '', mb_substr($text, 0, 200)) . '…';
    return $text;
}
