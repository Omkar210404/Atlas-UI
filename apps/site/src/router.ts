import { useSyncExternalStore, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from 'atlas-ui/primitives/use-reduced-motion';

export type Route =
  | { level: 'atlas' }
  | { level: 'region'; category: string }
  | { level: 'type'; category: string; type: string }
  | { level: 'spec'; category: string; type: string }
  | { level: 'principles' }
  | { level: 'not-found'; path: string };

export type Level = Route['level'];

/** Depth of each level on the chart, used for the depth tint and the scale bar. */
export const depth: Record<Level, number> = {
  atlas: 0,
  region: 1,
  type: 2,
  spec: 3,
  principles: 3,
  'not-found': 0,
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function parse(pathname: string): Route {
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c, d] = parts;
  if (parts.length === 0) return { level: 'atlas' };
  if (parts.length === 1 && a === 'principles') return { level: 'principles' };
  if (parts.length === 1 && a) return { level: 'region', category: a };
  if (parts.length === 2 && a && b) return { level: 'type', category: a, type: b };
  if (parts.length === 3 && a && b && c === 'spec') return { level: 'spec', category: a, type: b };
  return { level: 'not-found', path: [a, b, c, d].filter(Boolean).join('/') };
}

export function href(route: Route): string {
  switch (route.level) {
    case 'atlas':
      return `${base}/`;
    case 'principles':
      return `${base}/principles`;
    case 'region':
      return `${base}/${route.category}`;
    case 'type':
      return `${base}/${route.category}/${route.type}`;
    case 'spec':
      return `${base}/${route.category}/${route.type}/spec`;
    case 'not-found':
      return `${base}/${route.path}`;
  }
}

/** The level above this one, for "zoom out". */
export function parent(route: Route): Route | null {
  switch (route.level) {
    case 'region':
    case 'principles':
    case 'not-found':
      return { level: 'atlas' };
    case 'type':
      return { level: 'region', category: route.category };
    case 'spec':
      return { level: 'type', category: route.category, type: route.type };
    case 'atlas':
      return null;
  }
}

let current: Route = parse(window.location.pathname);
let previous: Route | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current);
}

/** The route before the latest navigation, so a level can restore focus to where you came from. */
export function previousRoute(): Route | null {
  return previous;
}

/** Levels drawn by the chart camera; moving between them is a camera move, not a page swap. */
const onChart = (route: Route) => route.level === 'atlas' || route.level === 'region';

const webKitOnly =
  /AppleWebKit/.test(navigator.userAgent) &&
  !/Chrome|Chromium|Edg|Firefox/.test(navigator.userAgent);

let transitionOverride: ((route: Route) => boolean) | null = null;

/** Lets the shell turn page transitions off, for example in Simple view. */
export function setTransitionPolicy(policy: (route: Route) => boolean) {
  transitionOverride = policy;
}

function commit(next: Route, mode: 'push' | 'replace' | 'pop') {
  previous = current;
  current = next;
  if (mode === 'push') window.history.pushState(null, '', href(next));
  if (mode === 'replace') window.history.replaceState(null, '', href(next));
  emit();
}

function go(next: Route, mode: 'push' | 'replace' | 'pop') {
  const from = current;
  const zoom = depth[next.level] >= depth[from.level] ? 'in' : 'out';
  const canTransition =
    typeof document.startViewTransition === 'function' &&
    !prefersReducedMotion() &&
    !(onChart(from) && onChart(next)) &&
    // WebKit's page process crashed on view transitions that start or end on the chart
    // (seen in Playwright's WebKit, October 2026; the trigger is not isolated yet), so
    // WebKit swaps those pages directly. Page-to-page transitions still animate there.
    !(webKitOnly && (onChart(from) || onChart(next))) &&
    (transitionOverride ? transitionOverride(next) : true);

  const update = () => {
    flushSync(() => commit(next, mode));
    if (mode !== 'pop') window.scrollTo({ top: 0 });
  };

  if (!canTransition) {
    update();
    return;
  }
  document.documentElement.dataset.zoom = zoom;
  const transition = document.startViewTransition(update);
  transition.finished.finally(() => {
    delete document.documentElement.dataset.zoom;
  });
}

export function navigate(to: Route, options: { replace?: boolean } = {}) {
  if (href(to) === href(current)) return;
  go(to, options.replace ? 'replace' : 'push');
}

window.addEventListener('popstate', () => {
  go(parse(window.location.pathname), 'pop');
});

/** Click handler for in-app links: lets modified clicks open new tabs as usual. */
export function onLinkClick(event: MouseEvent<HTMLElement>, to: Route) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  navigate(to);
}
