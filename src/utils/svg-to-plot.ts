export interface Pt {
  x: number;
  y: number;
}

const SHAPES = 'path, polygon, polyline, rect, circle, ellipse';
const SAMPLES = 2000;

/** Ramer–Douglas–Peucker: turns densely sampled straight edges back into corners. */
function simplify(pts: Pt[], tolerance: number): Pt[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    // A closed ring starts and ends on the same point, so there is no baseline to measure against.
    const d =
      len < 1e-9
        ? Math.hypot(pts[i].x - a.x, pts[i].y - a.y)
        : Math.abs((b.x - a.x) * (a.y - pts[i].y) - (a.x - pts[i].x) * (b.y - a.y)) / len;
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [a, b];
  return [...simplify(pts.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(pts.slice(index), tolerance)];
}

/** Sample a geometry element's outline, in the element's own coordinates. */
function outline(el: SVGGeometryElement): Pt[] {
  if (el instanceof SVGPolygonElement || el instanceof SVGPolylineElement) {
    return Array.from(el.points, (p) => ({ x: p.x, y: p.y }));
  }
  if (el instanceof SVGRectElement) {
    const { x, y, width, height } = el.getBBox();
    return [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ];
  }

  const total = el.getTotalLength();
  const step = total / SAMPLES;
  const runs: Pt[][] = [[]];
  let prev: Pt | null = null;
  for (let i = 0; i <= SAMPLES; i++) {
    const p = el.getPointAtLength(i * step);
    // A jump means a new subpath started; keep each subpath separate.
    if (prev && Math.hypot(p.x - prev.x, p.y - prev.y) > step * 3) runs.push([]);
    runs[runs.length - 1].push({ x: p.x, y: p.y });
    prev = p;
  }
  // The outer boundary is the longest subpath.
  return runs.reduce((a, b) => (b.length > a.length ? b : a));
}

function area(pts: Pt[]) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2);
}

/**
 * Pull the plot outline out of an SVG file: the largest shape in it, flattened
 * to straight-edged vertices in SVG user units with all transforms applied.
 */
export function svgToPlotOutline(text: string): { points: Pt[]; width: number; height: number } | null {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const parsed = doc.querySelector('svg');
  if (!parsed || doc.querySelector('parsererror')) return null;

  // Geometry and transform maths need the SVG laid out in the page.
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;';
  const svg = document.importNode(parsed, true) as SVGSVGElement;
  host.appendChild(svg);
  document.body.appendChild(host);

  try {
    const rootInverse = svg.getScreenCTM()?.inverse();
    let best: Pt[] | null = null;
    let bestArea = 0;

    for (const el of svg.querySelectorAll<SVGGeometryElement>(SHAPES)) {
      const ctm = el.getScreenCTM();
      if (!ctm || !rootInverse) continue;
      const toRoot = rootInverse.multiply(ctm);
      const pts = outline(el).map((p) => {
        const q = new DOMPoint(p.x, p.y).matrixTransform(toRoot);
        return { x: q.x, y: q.y };
      });
      if (pts.length < 3) continue;
      const a = area(pts);
      if (a > bestArea) {
        best = pts;
        bestArea = a;
      }
    }
    if (!best) return null;

    const span = (pts: Pt[]) => {
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    };

    const raw = span(best);
    let points = simplify(best, Math.hypot(raw.width, raw.height) * 0.004);
    const first = points[0];
    const last = points[points.length - 1];
    if (points.length > 3 && Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) points = points.slice(0, -1);
    // Measure the vertices actually returned, so scaling to a typed width is exact.
    return { points, ...span(points) };
  } finally {
    host.remove();
  }
}
