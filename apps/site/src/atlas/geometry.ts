/**
 * Island geometry for the atlas. Every category gets a contour island generated from a
 * seed derived from its slug, so the chart is identical on every visit.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Island {
  slug: string;
  centre: Point;
  radius: number;
  /** Outer coastline path. */
  coast: string;
  /** Inner contour rings, from outermost to the summit. */
  rings: string[];
  /** Open curve above the coast that the region name is set along. */
  labelPath: string;
  labelSize: number;
  /** Positions of the type soundings inside the island. */
  soundings: Point[];
  bounds: Bounds;
}

export interface Layout {
  name: 'wide' | 'tall';
  world: Bounds;
  islands: Island[];
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, seeded PRNG. */
function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Harmonic {
  k: number;
  amplitude: number;
  phase: number;
}

function harmonics(rand: () => number): Harmonic[] {
  return [2, 3, 4, 5, 7].map((k) => ({
    k,
    amplitude: (0.05 + rand() * 0.09) / Math.sqrt(k - 1),
    phase: rand() * Math.PI * 2,
  }));
}

function radiusAt(theta: number, base: number, shape: Harmonic[], wobble = 0): number {
  let r = 1;
  for (const h of shape) r += h.amplitude * Math.sin(h.k * theta + h.phase + wobble * h.k);
  return base * r;
}

const STEPS = 72;

function ring(centre: Point, base: number, shape: Harmonic[], wobble = 0): Point[] {
  return Array.from({ length: STEPS }, (_, i) => {
    const theta = (i / STEPS) * Math.PI * 2;
    const r = radiusAt(theta, base, shape, wobble);
    return { x: centre.x + r * Math.cos(theta), y: centre.y + r * Math.sin(theta) };
  });
}

const f = (n: number) => Number(n.toFixed(1));

/** Catmull-Rom spline through the points, written as cubic Béziers. */
export function smoothPath(points: Point[], closed: boolean): string {
  const n = points.length;
  const at = (i: number) =>
    closed ? points[(i + n) % n]! : points[Math.min(Math.max(i, 0), n - 1)]!;
  let d = `M${f(points[0]!.x)} ${f(points[0]!.y)}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? `${d}Z` : d;
}

export function makeIsland(
  slug: string,
  centre: Point,
  radius: number,
  typeCount: number,
  labelScale: number,
): Island {
  const rand = random(hash(slug));
  const shape = harmonics(rand);
  const coastPoints = ring(centre, radius, shape);

  // Inner rings drift toward an off-centre summit, like real contours.
  const summit = {
    x: centre.x + (rand() - 0.5) * radius * 0.3,
    y: centre.y + (rand() - 0.5) * radius * 0.3,
  };
  const rings = [0.78, 0.58, 0.4, 0.22].map((scale, i) => {
    const t = 1 - scale;
    const c = { x: centre.x + (summit.x - centre.x) * t, y: centre.y + (summit.y - centre.y) * t };
    return smoothPath(ring(c, radius * scale, shape, (i + 1) * 0.18), true);
  });

  // The label follows the coast over the top, from upper left to upper right.
  const labelPoints = Array.from({ length: 13 }, (_, i) => {
    const theta = Math.PI * (1.17 + (0.66 * i) / 12);
    const r = radiusAt(theta, radius, shape) * 1.1 + radius * 0.08;
    return { x: centre.x + r * Math.cos(theta), y: centre.y + r * Math.sin(theta) };
  });

  // Soundings sit on a ring halfway in, evenly spread with a little jitter.
  const soundings = Array.from({ length: typeCount }, (_, i) => {
    const theta = -Math.PI / 2 + (i + 0.5) * ((Math.PI * 2) / typeCount) + (rand() - 0.5) * 0.3;
    const r = radius * (0.42 + rand() * 0.12);
    return { x: centre.x + r * Math.cos(theta), y: centre.y + r * Math.sin(theta) };
  });
  // Top to bottom, so on the region chart the leader lines run to cards in the same order.
  soundings.sort((a, b) => a.y - b.y);

  const xs = coastPoints.map((p) => p.x).concat(labelPoints.map((p) => p.x));
  const ys = coastPoints.map((p) => p.y).concat(labelPoints.map((p) => p.y - radius * 0.25));
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return {
    slug,
    centre,
    radius,
    coast: smoothPath(coastPoints, true),
    rings,
    labelPath: smoothPath(labelPoints, false),
    labelSize: radius * 0.2 * labelScale,
    soundings,
    bounds: { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY },
  };
}

interface Placement {
  slug: string;
  x: number;
  y: number;
  r: number;
}

// The top-left of the wide chart is left as open water for the title cartouche.
const wide: Placement[] = [
  { slug: 'actions', x: 290, y: 540, r: 140 },
  { slug: 'inputs', x: 760, y: 230, r: 150 },
  { slug: 'navigation', x: 1130, y: 250, r: 150 },
  { slug: 'data-display', x: 1465, y: 380, r: 128 },
  { slug: 'spatial', x: 215, y: 870, r: 118 },
  { slug: 'layout', x: 580, y: 800, r: 138 },
  { slug: 'overlays', x: 935, y: 620, r: 150 },
  { slug: 'feedback', x: 1320, y: 780, r: 128 },
];

const tall: Placement[] = [
  { slug: 'actions', x: 215, y: 240, r: 150 },
  { slug: 'inputs', x: 590, y: 300, r: 160 },
  { slug: 'navigation', x: 220, y: 640, r: 158 },
  { slug: 'data-display', x: 590, y: 700, r: 145 },
  { slug: 'feedback', x: 215, y: 1040, r: 140 },
  { slug: 'overlays', x: 590, y: 1100, r: 160 },
  { slug: 'layout', x: 220, y: 1450, r: 150 },
  { slug: 'spatial', x: 590, y: 1480, r: 140 },
];

export function buildLayout(name: 'wide' | 'tall', typeCounts: Record<string, number>): Layout {
  const placements = name === 'wide' ? wide : tall;
  const world =
    name === 'wide'
      ? { x: 0, y: 0, width: 1600, height: 1000 }
      : { x: 0, y: 0, width: 800, height: 1700 };
  return {
    name,
    world,
    islands: placements.map((p) =>
      makeIsland(
        p.slug,
        { x: p.x, y: p.y },
        p.r,
        typeCounts[p.slug] ?? 4,
        name === 'wide' ? 1 : 1.35,
      ),
    ),
  };
}
