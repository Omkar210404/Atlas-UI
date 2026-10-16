import { useEffect, useRef, useState } from 'react';
import { Button } from 'atlas-ui/actions/button';
import { useReducedMotion } from 'atlas-ui/primitives/use-reduced-motion';
import { Chart, useLayoutForViewport } from './atlas/Chart';
import { RegionPanel } from './atlas/RegionPanel';
import { findCategory, findType } from './catalog';
import { AtlasIntro } from './pages/AtlasIntro';
import { NotFound } from './pages/NotFound';
import { Principles } from './pages/Principles';
import { SimpleAtlas, SimpleRegion } from './pages/Simple';
import { SpecPage } from './pages/SpecPage';
import { TypePage } from './pages/TypePage';
import { autoSimpleReason, setPref, usePrefs } from './prefs';
import {
  depth,
  navigate,
  parent,
  previousRoute,
  setTransitionPolicy,
  useRoute,
  type Route,
} from './router';
import { Header } from './shell/Header';
import { InsetMap } from './shell/InsetMap';
import { ScaleBar } from './shell/ScaleBar';
import { SiteDock } from './shell/SiteDock';
import { SitePalette } from './shell/SitePalette';

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
  );
}

/** Moves focus after a navigation: back to where you came from when zooming out, else to the new heading. */
function useFocusOnNavigate(route: Route) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const from = previousRoute();
    const frame = requestAnimationFrame(() => {
      let target: HTMLElement | null = null;
      if (route.level === 'atlas' && from?.level === 'region') {
        target = document.querySelector<HTMLElement>(
          `[data-island-link][data-region="${from.category}"], [data-region-link="${from.category}"]`,
        );
      } else if (route.level === 'region' && (from?.level === 'type' || from?.level === 'spec')) {
        target = document.querySelector<HTMLElement>(
          `[data-type-card="${from.type}"] a, [data-type-link="${from.type}"]`,
        );
      }
      target ??= document.getElementById('level-title');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);
}

export function App() {
  const route = useRoute();
  const prefs = usePrefs();
  const reduced = useReducedMotion();
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const layout = useLayoutForViewport();

  const reason = prefs.view === null ? autoSimpleReason(reduced) : null;
  const view = prefs.view ?? (reason ? 'simple' : 'spatial');

  useEffect(() => {
    setTransitionPolicy(() => view === 'spatial');
    document.documentElement.dataset.view = view;
  }, [view]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sea',
      `var(--sea-${Math.min(depth[route.level], 3)})`,
    );
    document.documentElement.dataset.level = route.level;
  }, [route.level]);

  useFocusOnNavigate(route);

  // Escape or "-" zooms out one level, unless something else already handled the key.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== 'Escape' && event.key !== '-') return;
      if (isEditable(event.target) || document.querySelector('dialog[open]')) return;
      const up = parent(route);
      if (!up) return;
      event.preventDefault();
      navigate(up);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [route]);

  const category = 'category' in route ? findCategory(route.category) : undefined;
  const type = 'type' in route ? findType(category, route.type) : undefined;
  const known =
    route.level === 'atlas' ||
    route.level === 'principles' ||
    (route.level === 'region' && category) ||
    ((route.level === 'type' || route.level === 'spec') && category && type);

  let content;
  if (!known) {
    content = <NotFound />;
  } else if (route.level === 'atlas' || route.level === 'region') {
    content =
      view === 'spatial' ? (
        <Chart route={route} layout={layout}>
          {route.level === 'region' && category ? (
            <RegionPanel category={category} />
          ) : (
            <AtlasIntro />
          )}
        </Chart>
      ) : route.level === 'region' && category ? (
        <SimpleRegion category={category} />
      ) : (
        <SimpleAtlas />
      );
  } else if (route.level === 'principles') {
    content = <Principles />;
  } else if (route.level === 'type' && category && type) {
    content = <TypePage category={category} type={type} />;
  } else if (route.level === 'spec' && category && type) {
    content = <SpecPage category={category} type={type} />;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header route={route} view={view} onViewChange={(v) => setPref('view', v)} />
      {reason && !noticeDismissed ? (
        <aside className="notice" aria-label="About this view">
          <p>{reason}</p>
          <Button variant="primary" size="s" onClick={() => setPref('view', 'spatial')}>
            Use the Spatial view
          </Button>
          <Button variant="quiet" size="s" onClick={() => setNoticeDismissed(true)}>
            Dismiss
          </Button>
        </aside>
      ) : null}
      <main id="main" className="main" data-view={view} data-level={route.level} tabIndex={-1}>
        {content}
      </main>
      {route.level !== 'atlas' ? <InsetMap route={route} /> : null}
      <ScaleBar route={route} />
      <SiteDock route={route} view={view} />
      <SitePalette view={view} />
    </>
  );
}
