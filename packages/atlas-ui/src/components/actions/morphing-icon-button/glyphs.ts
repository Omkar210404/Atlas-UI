/**
 * Two-state glyphs for the morphing icon button, drawn on a 24px grid.
 *
 * A glyph is either a set of polygons whose points correspond one to one between states
 * (interpolated point by point), or a set of bars described by centre, length, thickness and
 * angle (interpolated by parameter, so bars rotate instead of collapsing mid-way).
 */
type Point = readonly [number, number];
type Polygon = readonly Point[];

interface Bar {
  cx: number;
  cy: number;
  length: number;
  thickness: number;
  /** Degrees. */
  angle: number;
}

export type Glyph =
  | { kind: 'polygons'; from: readonly Polygon[]; to: readonly Polygon[] }
  | { kind: 'bars'; from: readonly Bar[]; to: readonly Bar[] };

export const glyphs = {
  'play-pause': {
    kind: 'polygons',
    // The play triangle is split in two so each half can become one pause bar.
    from: [
      [
        [7, 5],
        [12.5, 8.5],
        [12.5, 15.5],
        [7, 19],
      ],
      [
        [12.5, 8.5],
        [18, 12],
        [18, 12],
        [12.5, 15.5],
      ],
    ],
    to: [
      [
        [6.5, 5],
        [10.25, 5],
        [10.25, 19],
        [6.5, 19],
      ],
      [
        [13.75, 5],
        [17.5, 5],
        [17.5, 19],
        [13.75, 19],
      ],
    ],
  },
  'menu-close': {
    kind: 'bars',
    from: [
      { cx: 12, cy: 6.75, length: 16, thickness: 1.75, angle: 0 },
      { cx: 12, cy: 12, length: 16, thickness: 1.75, angle: 0 },
      { cx: 12, cy: 17.25, length: 16, thickness: 1.75, angle: 0 },
    ],
    to: [
      { cx: 12, cy: 12, length: 17, thickness: 1.75, angle: 45 },
      { cx: 12, cy: 12, length: 0, thickness: 1.75, angle: 0 },
      { cx: 12, cy: 12, length: 17, thickness: 1.75, angle: -45 },
    ],
  },
  'plus-close': {
    kind: 'bars',
    from: [
      { cx: 12, cy: 12, length: 16, thickness: 2, angle: 0 },
      { cx: 12, cy: 12, length: 16, thickness: 2, angle: 90 },
    ],
    to: [
      { cx: 12, cy: 12, length: 16, thickness: 2, angle: 45 },
      { cx: 12, cy: 12, length: 16, thickness: 2, angle: 135 },
    ],
  },
} as const satisfies Record<string, Glyph>;

export type GlyphName = keyof typeof glyphs;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function barPolygon({ cx, cy, length, thickness, angle }: Bar): Polygon {
  const r = (angle * Math.PI) / 180;
  const ux = Math.cos(r);
  const uy = Math.sin(r);
  const hl = length / 2;
  const ht = thickness / 2;
  return [
    [cx - ux * hl + uy * ht, cy - uy * hl - ux * ht],
    [cx + ux * hl + uy * ht, cy + uy * hl - ux * ht],
    [cx + ux * hl - uy * ht, cy + uy * hl + ux * ht],
    [cx - ux * hl - uy * ht, cy - uy * hl + ux * ht],
  ];
}

/** The glyph's polygons at progress `t` (0 = first state, 1 = second). */
export function glyphAt(glyph: Glyph, t: number): Polygon[] {
  if (glyph.kind === 'polygons') {
    return glyph.from.map((polygon, i) =>
      polygon.map(([x, y], j) => {
        const [tx, ty] = glyph.to[i]![j]!;
        return [lerp(x, tx, t), lerp(y, ty, t)] as Point;
      }),
    );
  }
  return glyph.from.map((bar, i) => {
    const to = glyph.to[i]!;
    return barPolygon({
      cx: lerp(bar.cx, to.cx, t),
      cy: lerp(bar.cy, to.cy, t),
      length: lerp(bar.length, to.length, t),
      thickness: lerp(bar.thickness, to.thickness, t),
      angle: lerp(bar.angle, to.angle, t),
    });
  });
}

export function glyphPath(glyph: Glyph, t: number): string {
  return glyphAt(glyph, t)
    .map((polygon) => `M${polygon.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`)
    .join('');
}
