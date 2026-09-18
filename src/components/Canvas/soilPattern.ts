/** Warm beige ground, the colour behind the whole plan. */
export const SOIL_BASE = '#E8DDC8';

let tile: HTMLCanvasElement | null = null;

/**
 * A small repeating tile of soil speckle: fine grains, a few pebbles and
 * faint darker patches. Built once and shared by every draw.
 */
export function soilTile(): HTMLCanvasElement {
  if (tile) return tile;
  const size = 160;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = SOIL_BASE;
  ctx.fillRect(0, 0, size, size);

  // Fixed seed so the ground looks the same on every visit.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Faint round patches of damper earth, drawn wrapped so the tile repeats without seams.
  for (let i = 0; i < 6; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 25 + rand() * 25;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const g = ctx.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, r);
        g.addColorStop(0, 'rgba(140, 110, 70, 0.06)');
        g.addColorStop(1, 'rgba(140, 110, 70, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }
    }
  }
  // Fine grains, dark and light.
  for (let i = 0; i < 700; i++) {
    const dark = rand() < 0.6;
    ctx.fillStyle = dark ? `rgba(110, 85, 55, ${0.08 + rand() * 0.12})` : `rgba(255, 250, 240, ${0.2 + rand() * 0.25})`;
    ctx.fillRect(rand() * size, rand() * size, 1, 1);
  }
  // A few small pebbles.
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(150, 130, 105, ${0.18 + rand() * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(rand() * size, rand() * size, 1 + rand() * 1.5, 0.8 + rand(), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  tile = c;
  return c;
}
