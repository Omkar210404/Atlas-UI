export type Orientation = 'horizontal' | 'vertical' | 'both';

interface RovingOptions {
  orientation: Orientation;
  loop?: boolean;
  /** Reverses Left/Right in right-to-left layouts. */
  rtl?: boolean;
}

/**
 * Maps a key press to the next index in a roving-tabindex group, or null if the key
 * is not a navigation key for this orientation. Pure, so it is easy to test.
 */
export function rovingIndex(
  key: string,
  index: number,
  count: number,
  { orientation, loop = true, rtl = false }: RovingOptions,
): number | null {
  if (count <= 0) return null;
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  let delta = 0;
  if (horizontal && key === 'ArrowRight') delta = rtl ? -1 : 1;
  else if (horizontal && key === 'ArrowLeft') delta = rtl ? 1 : -1;
  else if (vertical && key === 'ArrowDown') delta = 1;
  else if (vertical && key === 'ArrowUp') delta = -1;
  else if (key === 'Home') return 0;
  else if (key === 'End') return count - 1;
  else return null;

  const next = index + delta;
  if (loop) return (next + count) % count;
  return Math.min(Math.max(next, 0), count - 1);
}
