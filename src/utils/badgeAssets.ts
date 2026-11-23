const AVATAR_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
  <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1e3a8a'/><stop offset='1' stop-color='#0e7490'/></linearGradient></defs>
  <rect width='200' height='200' fill='url(#g)'/>
  <circle cx='100' cy='80' r='34' fill='#e2e8f0'/>
  <path d='M28 200c0-46 32-74 72-74s72 28 72 74z' fill='#e2e8f0'/>
  <path d='M66 72c2-27 25-39 47-31 14 5 22 16 22 31-10-10-22-14-34-12-14 2-26 6-35 12z' fill='#0f172a'/></svg>`;

export const avatarSrc = `data:image/svg+xml;utf8,${encodeURIComponent(AVATAR_SVG)}`;

type Bar = { width: number; heightPct: number; opacity: number; gap: number };

export function buildBarcode(text: string): Bar[] {
  let h = 0;
  const bits: number[] = [];
  for (const ch of (text.toUpperCase() + '*')) {
    h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    for (let b = 0; b < 7; b++) {
      bits.push(((ch.charCodeAt(0) >> b) & 1) + 1 + ((h >> b) & 1));
    }
  }
  return bits.map((w, i) => ({
    width: w,
    heightPct: 72 + ((i * 7) % 28),
    opacity: 0.7 + (i % 3) * 0.12,
    gap: 1 + (w % 2),
  }));
}