export type Direction = 'up' | 'down' | 'left' | 'right';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const centre = (b: Box) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

/**
 * Finds the candidate nearest to `from` in the given direction, for arrow-key movement
 * across a 2D layout. Candidates behind or level with `from` are ignored; distance along
 * the cross axis costs more than distance along the direction of travel.
 * Returns the index into `candidates`, or -1 when nothing lies that way.
 */
export function nearestInDirection(from: Box, candidates: Box[], direction: Direction): number {
  const origin = centre(from);
  let best = -1;
  let bestScore = Infinity;
  candidates.forEach((candidate, index) => {
    const c = centre(candidate);
    const dx = c.x - origin.x;
    const dy = c.y - origin.y;
    const along = direction === 'left' ? -dx : direction === 'right' ? dx : direction === 'up' ? -dy : dy;
    const across = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
    if (along <= 1) return;
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}
