const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'summary',
].join(',');

/** Focusable, visible elements inside `root`, in Tab order. */
export function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[inert]') && el.getClientRects().length > 0,
  );
}

/**
 * Keeps Tab and Shift+Tab inside `root`, wrapping from the last element to the first and
 * back. Call from a keydown handler; returns true when it handled the key.
 */
export function trapTab(event: KeyboardEvent | React.KeyboardEvent, root: HTMLElement): boolean {
  if (event.key !== 'Tab') return false;
  const list = focusables(root);
  if (list.length === 0) {
    event.preventDefault();
    root.focus();
    return true;
  }
  const first = list[0]!;
  const last = list[list.length - 1]!;
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
