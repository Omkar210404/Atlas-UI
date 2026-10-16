import { useMemo, useState } from 'react';
import { IconChart } from 'atlas-ui/icons/chart';
import { IconFile } from 'atlas-ui/icons/file';
import { IconList } from 'atlas-ui/icons/list';
import { IconSetSquare } from 'atlas-ui/icons/set-square';
import { IconSounding } from 'atlas-ui/icons/sounding';
import { IconTheme } from 'atlas-ui/icons/theme';
import { CommandPalette, type CommandItem } from 'atlas-ui/navigation/command-palette';
import { categories, isCharted } from '../catalog';
import { setPref, usePrefs, type ViewChoice } from '../prefs';
import { navigate, type Route } from '../router';
import { setPaletteOpen, usePaletteOpen } from './SiteDock';

const RECENTS_KEY = 'atlas-ui:recent';

function readRecents(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(RECENTS_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function SitePalette({ view }: { view: ViewChoice }) {
  const open = usePaletteOpen();
  const prefs = usePrefs();
  const [recents, setRecents] = useState(readRecents);

  const { items, routes } = useMemo(() => {
    const list: CommandItem[] = [];
    const targets = new Map<string, Route>();
    const add = (item: CommandItem, route?: Route) => {
      list.push(item);
      if (route) targets.set(item.id, route);
    };

    for (const category of categories) {
      add(
        {
          id: `region:${category.slug}`,
          label: category.name,
          group: 'Regions',
          hint: `${category.types.length} types`,
          keywords: [category.description],
          icon: <IconChart />,
        },
        { level: 'region', category: category.slug },
      );
    }
    for (const category of categories) {
      for (const type of category.types) {
        const charted = isCharted(category.slug, type.slug);
        add(
          {
            id: `type:${type.slug}`,
            label: type.name,
            group: 'Components',
            hint: charted ? category.name : 'Not charted yet',
            keywords: [category.name, type.summary],
            icon: <IconSounding />,
            disabled: !charted,
          },
          { level: 'type', category: category.slug, type: type.slug },
        );
        if (charted) {
          add(
            {
              id: `spec:${type.slug}`,
              label: `${type.name} spec sheet`,
              group: 'Spec sheets',
              hint: category.name,
              keywords: ['source', 'props', 'keyboard', 'accessibility', 'code'],
              icon: <IconFile />,
            },
            { level: 'spec', category: category.slug, type: type.slug },
          );
        }
      }
    }
    add(
      { id: 'page:principles', label: 'Principles', group: 'Pages', icon: <IconSetSquare />, keywords: ['tokens', 'colour', 'type', 'motion'] },
      { level: 'principles' },
    );
    add({ id: 'pref:atlas', label: 'Back to the atlas', group: 'Pages', icon: <IconChart />, keywords: ['home', 'map'] }, { level: 'atlas' });
    add({
      id: 'pref:theme',
      label: prefs.theme === 'night' ? 'Switch to the light theme' : 'Switch to the dark theme',
      group: 'Settings',
      icon: <IconTheme />,
      keywords: ['day', 'night', 'colour', 'mode'],
    });
    add({
      id: 'pref:view',
      label: view === 'simple' ? 'Switch to the Spatial view' : 'Switch to the Simple view',
      group: 'Settings',
      icon: <IconList />,
      keywords: ['list', 'map', 'plain'],
    });
    add({
      id: 'pref:motion',
      label: prefs.motion === 'reduce' ? 'Allow motion again' : 'Reduce motion',
      group: 'Settings',
      keywords: ['animation', 'accessibility'],
    });
    return { items: list, routes: targets };
  }, [prefs.theme, prefs.motion, view]);

  const onSelect = (item: CommandItem) => {
    if (item.id === 'pref:theme') setPref('theme', prefs.theme === 'night' ? 'day' : 'night');
    else if (item.id === 'pref:view') setPref('view', view === 'simple' ? 'spatial' : 'simple');
    else if (item.id === 'pref:motion') setPref('motion', prefs.motion === 'reduce' ? 'system' : 'reduce');
    const route = routes.get(item.id);
    if (route) {
      const next = [item.id, ...recents.filter((id) => id !== item.id)].slice(0, 4);
      setRecents(next);
      try {
        window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // Recents are a convenience; nothing breaks without storage.
      }
      navigate(route);
    }
  };

  return (
    <CommandPalette
      items={items}
      open={open}
      onOpenChange={setPaletteOpen}
      onSelect={onSelect}
      recentIds={recents}
      placeholder="Jump to a region, component or setting…"
      slashOpens
    />
  );
}
