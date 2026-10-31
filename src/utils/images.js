// Card-size copies of product and category photos, made by
// scripts/make-thumbs.py. The full-size originals stay for product pages.
export const CARD_SIZES = '(max-width: 768px) 46vw, (max-width: 1200px) 30vw, 300px';

export function thumbSet(path) {
  if (!/^\/images\/(products|categories)\//.test(path || '')) return { src: path, srcset: '' };
  const rel = path.slice('/images/'.length);
  return {
    src: `/images/thumbs/400/${rel}`,
    srcset: `/images/thumbs/400/${rel} 400w, /images/thumbs/720/${rel} 720w`
  };
}
