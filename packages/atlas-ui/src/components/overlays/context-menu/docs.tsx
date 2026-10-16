import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import { IconCopy } from '../../../icons/copy';
import { IconExternal } from '../../../icons/external';
import type { MenuItem } from '../../../primitives/menu';
import { ContextMenu } from './ContextMenu';

export const meta: ComponentMeta = {
  slug: 'context-menu',
  name: 'Context menu',
  category: 'overlays',
  summary: 'Right-click and keyboard menus with submenus.',
  description: [
    'A menu of actions for whatever is under the pointer, opened with a right-click, or with Shift+F10 or the Menu key once the area has focus. Items can open submenus to the side.',
    'It opens at the pointer and is kept on screen by the same flip-and-shift placement as every atlas-ui overlay.',
  ],
  usage: [
    'Offer the same actions somewhere visible too; many people never right-click.',
    'Wrap the area that the actions apply to, and give it a `label` such as “Chart actions”.',
    'Group long lists with `separatorBefore`, and nest related actions with `items`.',
  ],
  keyboard: [
    { keys: ['Shift+F10', 'ContextMenu'], action: 'With the area focused, open the menu.' },
    { keys: ['ArrowDown', 'ArrowUp'], action: 'Move between items (wraps).' },
    { keys: ['ArrowRight'], action: 'Open the focused item’s submenu.' },
    { keys: ['ArrowLeft'], action: 'Close the submenu and return to its item.' },
    { keys: ['Enter', 'Space'], action: 'Activate the item, or open its submenu.' },
    { keys: ['Escape'], action: 'Close the current menu level.' },
  ],
  accessibility: [
    'The target area is a focusable, labelled `group`, described by a hidden hint that names the keyboard shortcut.',
    'The menu follows the WAI-ARIA menu pattern; items with submenus expose `aria-haspopup="menu"` and `aria-expanded`.',
    'Choosing an item, or pressing Escape, returns focus to the target area.',
    'Escape and ArrowLeft close one level at a time, so you never lose your place.',
  ],
  reducedMotion: 'Menus appear without their short drop.',
  props: [
    {
      kind: 'boolean',
      name: 'submenus',
      label: 'Submenus',
      description: 'Include a nested menu.',
      default: true,
    },
  ],
  files: ['ContextMenu.tsx', 'context-menu.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'primitives/menu',
    'primitives/typeahead',
    'primitives/use-dismiss',
    'primitives/use-placement',
    'primitives/use-popover',
    'icons/chevron-right',
    'tokens',
  ],
};

function Demo({ submenus = true }: { submenus?: boolean }) {
  const [last, setLast] = useState('Right-click the chart, or focus it and press Shift+F10.');
  const items: MenuItem[] = [
    {
      id: 'anchor',
      label: 'Drop anchor here',
      icon: <IconAnchor />,
      onSelect: () => setLast('Anchor dropped.'),
    },
    {
      id: 'copy',
      label: 'Copy position',
      icon: <IconCopy />,
      hint: 'Ctrl C',
      onSelect: () => setLast('Position copied.'),
    },
    ...(submenus
      ? [
          {
            id: 'share',
            label: 'Share',
            icon: <IconExternal />,
            items: [
              { id: 'link', label: 'Copy link', onSelect: () => setLast('Link copied.') },
              { id: 'image', label: 'Export as image', onSelect: () => setLast('Image exported.') },
            ],
          },
        ]
      : []),
    { id: 'measure', label: 'Measure distance', separatorBefore: true, disabled: true },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', width: 'min(26rem, 100%)' }}>
      <ContextMenu label="Chart actions" items={items}>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            minHeight: '9rem',
            borderRadius: 'var(--radius-panel)',
            background: 'var(--sea-1)',
            boxShadow: 'inset 0 0 0 1px var(--isobath)',
            fontFamily: 'var(--font-prose)',
            fontStyle: 'italic',
          }}
        >
          Falmouth Bay, 1 : 25,000
        </div>
      </ContextMenu>
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }} aria-live="polite">
        {last}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'chart',
      name: 'Chart actions',
      description: 'Actions, a shortcut hint, a submenu and an unavailable item.',
      render: () => <Demo />,
    },
    {
      id: 'flat',
      name: 'Flat menu',
      description: 'No submenus.',
      render: () => <Demo submenus={false} />,
    },
  ],
  Playground: ({ values }) => <Demo submenus={Boolean(values.submenus)} />,
};
