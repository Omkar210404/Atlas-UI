import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import { IconBell } from '../../../icons/bell';
import { IconCompass } from '../../../icons/compass';
import { IconFolder } from '../../../icons/folder';
import { IconSearch } from '../../../icons/search';
import { IconSettings } from '../../../icons/settings';
import { IconTheme } from '../../../icons/theme';
import { DockItem, DockSeparator, FloatingDock } from './FloatingDock';

export const meta: ComponentMeta = {
  slug: 'floating-dock',
  name: 'Floating dock',
  category: 'navigation',
  summary: 'A compact toolbar whose items grow as the pointer approaches.',
  description: [
    'A row of icon actions that floats over the page. Items near the pointer grow smoothly, so a small target becomes a large one exactly when you reach for it.',
    'Every item has a visible label on hover and focus, and a text name for assistive technology. The dock this site uses at the bottom of the screen is this component.',
  ],
  usage: [
    'Keep it to the handful of actions people need everywhere; five to seven items reads well.',
    'Pass `href` for navigation and `onClick` for actions. Use `pressed` for toggles and `current` for the page you are on.',
    'Set `floating={false}` to place the dock inside your own layout.',
    'Magnification uses resting positions measured when the pointer enters, so items never chase the cursor.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move into the dock (to the last focused item) and out again.' },
    { keys: ['ArrowRight'], action: 'Move to the next item (wraps).' },
    { keys: ['ArrowLeft'], action: 'Move to the previous item (wraps).' },
    { keys: ['Home'], action: 'Move to the first item.' },
    { keys: ['End'], action: 'Move to the last item.' },
    { keys: ['Enter', 'Space'], action: 'Activate the focused item.' },
    { keys: ['Escape'], action: 'Hide the visible label without moving focus.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA toolbar pattern: one Tab stop for the whole dock and arrow keys inside it (roving tabindex).',
    'Each item has its label as real text (visually hidden), so its name does not depend on the tooltip.',
    'Toggles expose `aria-pressed`; the current page link exposes `aria-current="page"` and shows a magenta mark that does not rely on colour alone (it is a shape).',
    'Labels appear on hover and keyboard focus, stay while hovered, and can be dismissed with Escape (WCAG 1.4.13).',
    'Resting item size is 44 × 44 px, meeting the enhanced target size guideline.',
    'Shortcuts are exposed with `aria-keyshortcuts`.',
  ],
  reducedMotion: 'Items keep their resting size; only the hover colour changes.',
  props: [
    {
      kind: 'boolean',
      name: 'magnify',
      label: 'Magnify',
      description: 'Grow items near the pointer.',
      default: true,
    },
    {
      kind: 'number',
      name: 'maxScale',
      label: 'Largest scale',
      description: 'Scale of the item right under the pointer.',
      default: 1.55,
      min: 1.1,
      max: 2,
      step: 0.05,
    },
    {
      kind: 'number',
      name: 'reach',
      label: 'Reach',
      description: 'Distance over which growth fades out.',
      default: 132,
      min: 60,
      max: 240,
      step: 4,
      unit: 'px',
    },
  ],
  files: ['FloatingDock.tsx', 'floating-dock.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/roving', 'primitives/use-reduced-motion', 'tokens'],
};

function Demo({ magnify = true, maxScale = 1.55, reach = 132 }: { magnify?: boolean; maxScale?: number; reach?: number }) {
  const [night, setNight] = useState(true);
  const [current, setCurrent] = useState('charts');
  const go = (id: string) => () => setCurrent(id);
  return (
    <FloatingDock label="Demo dock" floating={false} magnify={magnify} maxScale={maxScale} reach={reach}>
      <DockItem label="Home" icon={<IconCompass />} current={current === 'home'} onClick={go('home')} />
      <DockItem label="Charts" icon={<IconFolder />} current={current === 'charts'} onClick={go('charts')} />
      <DockItem label="Harbours" icon={<IconAnchor />} current={current === 'harbours'} onClick={go('harbours')} />
      <DockItem label="Alerts" icon={<IconBell />} current={current === 'alerts'} onClick={go('alerts')} />
      <DockSeparator />
      <DockItem label="Search" icon={<IconSearch />} shortcut="Control+K" onClick={() => {}} />
      <DockItem label="Night chart" icon={<IconTheme />} pressed={night} onClick={() => setNight((n) => !n)} />
      <DockItem label="Settings" icon={<IconSettings />} disabled />
    </FloatingDock>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'default',
      name: 'Magnifying dock',
      description: 'Navigation, a separator, a toggle and a disabled item.',
      render: () => <Demo />,
    },
    {
      id: 'subtle',
      name: 'Subtle growth',
      description: 'A smaller scale over a shorter reach.',
      render: () => <Demo maxScale={1.25} reach={90} />,
    },
    {
      id: 'static',
      name: 'Without magnification',
      description: 'Fixed-size items, for dense layouts.',
      render: () => <Demo magnify={false} />,
    },
  ],
  Playground: ({ values }) => (
    <Demo magnify={Boolean(values.magnify)} maxScale={Number(values.maxScale)} reach={Number(values.reach)} />
  ),
};
