// Where a customer's name sits on each mug photo, measured from the photos
// (rim ends and body edges): centre x/y and print width in % of the photo,
// and rot = the mug's tilt in degrees (clockwise +). Keyed by file name.
export const MUG_PRINT_AREAS = {
  '2-2-34-6.webp': { x: 46.5, y: 53.5, w: 31, rot: 2.5 },
  'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Mandys-Pink-Colored-Interior-Handle.webp': { x: 51.9, y: 47.6, w: 28, rot: 19 },
  'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Navy-Blue-Colored-Interior-Handle.webp': { x: 50.1, y: 37.6, w: 27.5, rot: 8.5 },
  'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Orange-Colored-Interior-Handle.webp': { x: 40, y: 55, w: 28, rot: 0 },
  'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Red-Colored-Interior-Handle.webp': { x: 51, y: 45.5, w: 28, rot: 10 },
  '1-2-1.webp': { x: 65.5, y: 50.5, w: 25, rot: -21 },
  'Premium-Heart-Handle-Sublimation-Mug-White-Exterior-with-Yellow-Green-Colored-Interior-Handle.webp': { x: 51.1, y: 34.3, w: 27, rot: 22 }
};

export function getMugPrintArea(src) {
  if (!src) return null;
  const file = decodeURIComponent(src.split('?')[0].split('/').pop() || '');
  return MUG_PRINT_AREAS[file] || null;
}
