import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';

/**
 * True when motion should be reduced: the OS setting is on (unless the page sets
 * `data-motion="full"` on <html>), or the page sets `data-motion="reduce"`.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const override = document.documentElement.dataset.motion;
  if (override === 'reduce') return true;
  if (override === 'full') return false;
  return window.matchMedia(query).matches;
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(query);
  media.addEventListener('change', onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => {
    media.removeEventListener('change', onChange);
    observer.disconnect();
  };
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
