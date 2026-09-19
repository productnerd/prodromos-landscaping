import type { PlantDefinition, MonthlyState } from '../../types/plant';

/** Needle trees get starbursts rather than a leafy canopy. */
const CONIFERS = new Set(['cedar', 'pine', 'black-pine']);

/** Small seeded random generator, so each plant keeps the same pattern. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/** A random point inside a circle of radius r, weighted evenly by area. */
function pointIn(rand: () => number, r: number) {
  const a = rand() * Math.PI * 2;
  const d = Math.sqrt(rand()) * r;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d };
}

function dots(c: CanvasRenderingContext2D, rand: () => number, r: number, count: number, size: number, color: string) {
  c.fillStyle = color;
  c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  c.lineWidth = size * 0.25;
  for (let i = 0; i < count; i++) {
    const p = pointIn(rand, r * 0.85);
    c.beginPath();
    c.arc(p.x, p.y, size * (0.8 + rand() * 0.4), 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}

/**
 * Draw a plant's texture into a circle of radius r centred on the origin, in
 * the colour it has this month. Fruit and flowers appear in their months;
 * deciduous trees show branches when bare.
 */
export function drawPlantTexture(
  c: CanvasRenderingContext2D,
  plant: PlantDefinition,
  state: MonthlyState,
  fill: string,
  r: number,
  seed: string,
) {
  const rand = rng(seed + plant.id);
  const dark = shade(fill, -0.45);
  const light = shade(fill, 0.35);
  const woody = plant.category === 'tree' || plant.category === 'bush';

  c.save();
  c.beginPath();
  c.arc(0, 0, r, 0, Math.PI * 2);
  c.clip();
  c.lineCap = 'round';

  if (woody && state === 'dormant') {
    // Bare branches seen from above: limbs from the trunk that fork outwards.
    c.strokeStyle = shade('#6B4F3A', -0.2);
    const limbs = 5 + Math.floor(rand() * 3);
    for (let i = 0; i < limbs; i++) {
      const a = (i / limbs) * Math.PI * 2 + rand() * 0.5;
      const mid = r * (0.45 + rand() * 0.15);
      c.lineWidth = Math.max(r * 0.05, 0.8);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(a) * mid, Math.sin(a) * mid);
      c.stroke();
      c.lineWidth = Math.max(r * 0.025, 0.5);
      for (const fork of [-0.35, 0.35]) {
        c.beginPath();
        c.moveTo(Math.cos(a) * mid, Math.sin(a) * mid);
        c.lineTo(Math.cos(a + fork) * r * 0.92, Math.sin(a + fork) * r * 0.92);
        c.stroke();
      }
    }
  } else if (CONIFERS.has(plant.id)) {
    // Needle clusters: starbursts from several branch tips.
    c.strokeStyle = dark;
    c.lineWidth = Math.max(r * 0.025, 0.5);
    const clusters = 7 + Math.floor(rand() * 4);
    for (let i = 0; i < clusters; i++) {
      const p = i === 0 ? { x: 0, y: 0 } : pointIn(rand, r * 0.7);
      const len = r * (0.18 + rand() * 0.08);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + rand() * 0.3;
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len);
        c.stroke();
      }
    }
  } else if (woody) {
    // Leafy canopy: overlapping clumps, shadowed below and lit above.
    const clumps = 14 + Math.floor(rand() * 6);
    c.lineWidth = Math.max(r * 0.03, 0.6);
    for (let i = 0; i < clumps; i++) {
      const p = pointIn(rand, r * 0.8);
      const size = r * (0.16 + rand() * 0.1);
      c.strokeStyle = dark;
      c.beginPath();
      c.arc(p.x, p.y, size, Math.PI * 0.1, Math.PI * 0.9);
      c.stroke();
      c.strokeStyle = light;
      c.beginPath();
      c.arc(p.x, p.y, size * 0.8, Math.PI * 1.15, Math.PI * 1.6);
      c.stroke();
    }
    // Scalloped crown edge.
    c.strokeStyle = dark;
    const bumps = 16;
    for (let i = 0; i < bumps; i++) {
      const a = (i / bumps) * Math.PI * 2;
      c.beginPath();
      c.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, r * 0.15, a - 1.2, a + 1.2);
      c.stroke();
    }
  } else if (plant.category === 'grass') {
    c.strokeStyle = dark;
    c.lineWidth = Math.max(r * 0.04, 0.5);
    for (let i = 0; i < 40; i++) {
      const p = pointIn(rand, r);
      const lean = (rand() - 0.5) * r * 0.3;
      c.beginPath();
      c.moveTo(p.x, p.y + r * 0.12);
      c.quadraticCurveTo(p.x, p.y, p.x + lean, p.y - r * 0.22);
      c.stroke();
    }
  } else if (state !== 'dormant') {
    // Herbs, bulbs, ground cover and vegetables: small scattered leaves.
    c.fillStyle = dark;
    for (let i = 0; i < 26; i++) {
      const p = pointIn(rand, r * 0.9);
      c.beginPath();
      c.ellipse(p.x, p.y, r * 0.09, r * 0.045, rand() * Math.PI, 0, Math.PI * 2);
      c.fill();
    }
  }

  if (CONIFERS.has(plant.id) && state === 'flowering') {
    // New cones: brown ovals with a few scale lines, in place of flowers.
    const size = Math.max(r * 0.08, 1.2);
    for (let i = 0; i < 9; i++) {
      const p = pointIn(rand, r * 0.8);
      const tilt = rand() * Math.PI;
      c.fillStyle = '#8B5A2B';
      c.strokeStyle = '#4E3218';
      c.lineWidth = size * 0.2;
      c.beginPath();
      c.ellipse(p.x, p.y, size * 1.4, size * 0.8, tilt, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      for (const t of [-0.5, 0, 0.5]) {
        c.beginPath();
        c.moveTo(p.x + Math.cos(tilt) * size * t * 2 - Math.sin(tilt) * size * 0.7, p.y + Math.sin(tilt) * size * t * 2 + Math.cos(tilt) * size * 0.7);
        c.lineTo(p.x + Math.cos(tilt) * size * t * 2 + Math.sin(tilt) * size * 0.7, p.y + Math.sin(tilt) * size * t * 2 - Math.cos(tilt) * size * 0.7);
        c.stroke();
      }
    }
  }
  if (state === 'flowering' && plant.tags.includes('flower')) {
    dots(c, rand, r, 14, Math.max(r * 0.07, 1.2), plant.flowerColor);
  }
  if ((state === 'fruiting' || state === 'fruit-ripe') && plant.tags.includes('fruit')) {
    dots(c, rand, r, state === 'fruit-ripe' ? 14 : 9, Math.max(r * 0.06, 1), plant.fruitColor);
  }
  c.restore();
}

/** A vine along a climber strip: a wavy stem with alternating leaves. */
export function drawVineTexture(
  c: CanvasRenderingContext2D,
  plant: PlantDefinition,
  state: MonthlyState,
  fill: string,
  w: number,
  h: number,
  seed: string,
) {
  const rand = rng(seed + plant.id);
  c.save();
  c.beginPath();
  c.rect(-w / 2, -h / 2, w, h);
  c.clip();
  c.lineCap = 'round';

  const wave = (x: number) => Math.sin((x / h) * 1.6) * h * 0.2;
  c.strokeStyle = state === 'dormant' ? '#6B4F3A' : shade(fill, -0.5);
  c.lineWidth = Math.max(h * 0.07, 0.6);
  c.beginPath();
  for (let x = -w / 2; x <= w / 2; x += h * 0.2) {
    if (x === -w / 2) c.moveTo(x, wave(x));
    else c.lineTo(x, wave(x));
  }
  c.stroke();

  if (state !== 'dormant') {
    c.fillStyle = shade(fill, -0.3);
    let side = 1;
    for (let x = -w / 2 + h * 0.4; x < w / 2; x += h * 0.55) {
      c.beginPath();
      c.ellipse(x, wave(x) + side * h * 0.2, h * 0.17, h * 0.09, side * 0.6, 0, Math.PI * 2);
      c.fill();
      side = -side;
    }
  }

  const accent =
    state === 'flowering' && plant.tags.includes('flower')
      ? plant.flowerColor
      : (state === 'fruiting' || state === 'fruit-ripe') && plant.tags.includes('fruit')
        ? plant.fruitColor
        : null;
  if (accent) {
    c.fillStyle = accent;
    c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    c.lineWidth = h * 0.02;
    for (let x = -w / 2 + h * 0.3; x < w / 2; x += h * (0.5 + rand() * 0.4)) {
      c.beginPath();
      c.arc(x, wave(x) + (rand() - 0.5) * h * 0.4, h * 0.1, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
  }
  c.restore();
}
