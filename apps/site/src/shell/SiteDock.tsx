import { useSyncExternalStore } from 'react';
import { IconAscend } from 'atlas-ui/icons/ascend';
import { IconCompass } from 'atlas-ui/icons/compass';
import { IconList } from 'atlas-ui/icons/list';
import { IconSearch } from 'atlas-ui/icons/search';
import { IconSetSquare } from 'atlas-ui/icons/set-square';
import { IconTheme } from 'atlas-ui/icons/theme';
import { DockItem, DockSeparator, FloatingDock } from 'atlas-ui/navigation/floating-dock';
import { setPref, usePrefs, type ViewChoice } from '../prefs';
import { href, navigate, onLinkClick, parent, type Route } from '../router';

let paletteOpen = false;
const paletteListeners = new Set<() => void>();

export function setPaletteOpen(open: boolean) {
  paletteOpen = open;
  paletteListeners.forEach((listener) => listener());
}

export function usePaletteOpen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      paletteListeners.add(listener);
      return () => paletteListeners.delete(listener);
    },
    () => paletteOpen,
  );
}

export function SiteDock({ route, view }: { route: Route; view: ViewChoice }) {
  const prefs = usePrefs();
  const atlas: Route = { level: 'atlas' };
  const principles: Route = { level: 'principles' };
  const up = parent(route);
  const mac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

  return (
    <FloatingDock label="Site tools" className="site-dock">
      <DockItem
        label="Atlas"
        icon={<IconCompass />}
        href={href(atlas)}
        current={route.level === 'atlas'}
        onClick={(e) => onLinkClick(e, atlas)}
      />
      <DockItem
        label="Zoom out"
        icon={<IconAscend />}
        shortcut="Escape"
        disabled={!up}
        onClick={() => up && navigate(up)}
      />
      <DockItem
        label="Search"
        icon={<IconSearch />}
        shortcut={mac ? 'Meta+K' : 'Control+K'}
        onClick={() => setPaletteOpen(true)}
      />
      <DockSeparator />
      <DockItem
        label="Dark theme"
        icon={<IconTheme />}
        pressed={prefs.theme === 'night'}
        onClick={() => setPref('theme', prefs.theme === 'night' ? 'day' : 'night')}
      />
      <DockItem
        label="Simple view"
        icon={<IconList />}
        pressed={view === 'simple'}
        onClick={() => setPref('view', view === 'simple' ? 'spatial' : 'simple')}
      />
      <DockItem
        label="Principles"
        icon={<IconSetSquare />}
        href={href(principles)}
        current={route.level === 'principles'}
        onClick={(e) => onLinkClick(e, principles)}
      />
    </FloatingDock>
  );
}
