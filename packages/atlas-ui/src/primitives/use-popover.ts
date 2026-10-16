import { useLayoutEffect, type RefObject } from 'react';

/**
 * Shows an element with the `popover` attribute in the top layer while `open` is true, so
 * it is never clipped by an ancestor's overflow or stacking context. Falls back to leaving
 * it in place when the Popover API is missing.
 */
export function usePopover(ref: RefObject<HTMLElement | null>, open: boolean): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== 'function') return;
    if (open && !el.matches(':popover-open')) el.showPopover();
    if (!open && el.matches(':popover-open')) el.hidePopover();
  }, [ref, open]);
}
