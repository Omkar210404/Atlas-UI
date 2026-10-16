export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlaceOptions {
  side?: Side | undefined;
  align?: Align | undefined;
  /** Gap between anchor and floating element. */
  offset?: number | undefined;
  /** Minimum distance from the viewport edge. */
  padding?: number | undefined;
}

export interface Placement {
  x: number;
  y: number;
  side: Side;
  /** Where the anchor's centre falls along the floating element's edge, for an arrow. */
  arrow: number;
  /** Space available on the chosen side, so the element can cap its size. */
  available: number;
}

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

function spaceOn(side: Side, anchor: Rect, viewport: Rect, gap: number): number {
  switch (side) {
    case 'top':
      return anchor.y - viewport.y - gap;
    case 'bottom':
      return viewport.y + viewport.height - (anchor.y + anchor.height) - gap;
    case 'left':
      return anchor.x - viewport.x - gap;
    case 'right':
      return viewport.x + viewport.width - (anchor.x + anchor.width) - gap;
  }
}

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

/**
 * Positions a floating box next to an anchor inside a viewport.
 * Flips to the opposite side when the preferred side is too small and the opposite has
 * more room, then shifts along the cross axis to stay `padding` away from the edges.
 */
export function place(
  anchor: Rect,
  floating: { width: number; height: number },
  viewport: Rect,
  { side = 'bottom', align = 'center', offset = 8, padding = 8 }: PlaceOptions = {},
): Placement {
  const gap = offset + padding;
  const vertical = side === 'top' || side === 'bottom';
  const needed = vertical ? floating.height : floating.width;
  let chosen = side;
  const preferredSpace = spaceOn(side, anchor, viewport, gap);
  const oppositeSpace = spaceOn(opposite[side], anchor, viewport, gap);
  if (preferredSpace < needed && oppositeSpace > preferredSpace) chosen = opposite[side];

  let x: number;
  let y: number;
  if (chosen === 'top' || chosen === 'bottom') {
    y = chosen === 'top' ? anchor.y - offset - floating.height : anchor.y + anchor.height + offset;
    const start = anchor.x;
    const centre = anchor.x + anchor.width / 2 - floating.width / 2;
    const end = anchor.x + anchor.width - floating.width;
    x = align === 'start' ? start : align === 'end' ? end : centre;
    x = clamp(x, viewport.x + padding, viewport.x + viewport.width - padding - floating.width);
  } else {
    x = chosen === 'left' ? anchor.x - offset - floating.width : anchor.x + anchor.width + offset;
    const start = anchor.y;
    const centre = anchor.y + anchor.height / 2 - floating.height / 2;
    const end = anchor.y + anchor.height - floating.height;
    y = align === 'start' ? start : align === 'end' ? end : centre;
    y = clamp(y, viewport.y + padding, viewport.y + viewport.height - padding - floating.height);
  }

  const arrow =
    chosen === 'top' || chosen === 'bottom'
      ? clamp(anchor.x + anchor.width / 2 - x, 12, floating.width - 12)
      : clamp(anchor.y + anchor.height / 2 - y, 12, floating.height - 12);

  return {
    x,
    y,
    side: chosen,
    arrow,
    available: Math.max(spaceOn(chosen, anchor, viewport, gap), 0),
  };
}
