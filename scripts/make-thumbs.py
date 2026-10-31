"""Makes small WebP copies of product and category photos for fast cards.

Originals stay in public/images/products and public/images/categories (used on
product pages). Card-size copies go to public/images/thumbs/<width>/<same path>.
Re-run after adding products:  python scripts/make-thumbs.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'public'
SOURCES = [ROOT / 'images' / 'products', ROOT / 'images' / 'categories']
WIDTHS = (400, 720)
QUALITY = 74


def main():
    made = skipped = 0
    before = after = 0
    for source in SOURCES:
        for original in sorted(source.rglob('*.webp')):
            rel = original.relative_to(ROOT / 'images')
            for width in WIDTHS:
                target = ROOT / 'images' / 'thumbs' / str(width) / rel
                if target.exists() and target.stat().st_mtime >= original.stat().st_mtime:
                    skipped += 1
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with Image.open(original) as im:
                    im = im.convert('RGBA') if im.mode in ('P', 'LA') else im
                    if im.width > width:
                        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
                    im.save(target, 'WEBP', quality=QUALITY, method=6)
                made += 1
                if width == WIDTHS[0]:
                    before += original.stat().st_size
                    after += target.stat().st_size
    print(f'made {made}, up to date {skipped}')
    if before:
        print(f'{WIDTHS[0]}px copies: {before // 1024} KB -> {after // 1024} KB')


if __name__ == '__main__':
    main()
