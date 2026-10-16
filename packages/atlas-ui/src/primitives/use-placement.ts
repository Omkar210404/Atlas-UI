import { useLayoutEffect, useState, type RefObject } from 'react';
import { place, type Placement, type PlaceOptions } from './place';

/**
 * Keeps a fixed-position floating element next to its anchor while open, re-placing it
 * on resize and on scroll of any ancestor. The floating element should use
 * `position: fixed` (popovers in the top layer already do).
 */
export function usePlacement(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: PlaceOptions = {},
): Placement | null {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const { side, align, offset, padding } = options;

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    let frame = 0;
    const update = () => {
      const anchor = anchorRef.current;
      const floating = floatingRef.current;
      if (!anchor || !floating) return;
      const viewport = window.visualViewport;
      setPlacement(
        place(
          anchor.getBoundingClientRect(),
          { width: floating.offsetWidth, height: floating.offsetHeight },
          {
            x: 0,
            y: 0,
            width: viewport?.width ?? window.innerWidth,
            height: viewport?.height ?? window.innerHeight,
          },
          { side, align, offset, padding },
        ),
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const resize = new ResizeObserver(schedule);
    if (floatingRef.current) resize.observe(floatingRef.current);
    if (anchorRef.current) resize.observe(anchorRef.current);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [open, anchorRef, floatingRef, side, align, offset, padding]);

  return placement;
}
