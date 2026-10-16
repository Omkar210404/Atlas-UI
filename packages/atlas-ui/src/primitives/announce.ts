export type Politeness = 'polite' | 'assertive';

const regions = new Map<Politeness, HTMLElement>();

function region(politeness: Politeness): HTMLElement {
  let el = regions.get(politeness);
  if (el && el.isConnected) return el;
  el = document.createElement('div');
  el.setAttribute('aria-live', politeness);
  el.setAttribute('aria-atomic', 'true');
  el.dataset.atlasAnnouncer = politeness;
  el.className = 'atl-visually-hidden';
  document.body.append(el);
  regions.set(politeness, el);
  return el;
}

/**
 * Announces a message to screen readers through a shared live region.
 * The region is cleared first so repeating the same message is announced again.
 */
export function announce(message: string, politeness: Politeness = 'polite'): void {
  const el = region(politeness);
  el.textContent = '';
  window.setTimeout(() => {
    el.textContent = message;
  }, 60);
}
