import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconCopy } from '../../../icons/copy';
import { IconExternal } from '../../../icons/external';
import { IconFile } from '../../../icons/file';
import type { MenuItem } from '../../../primitives/menu';
import { SplitActionButton } from './SplitActionButton';

export const meta: ComponentMeta = {
  slug: 'split-action-button',
  name: 'Split action button',
  category: 'actions',
  summary: 'One main action with alternatives behind a seam.',
  description: [
    'Most of the time people want the common action, so it gets most of the button. The rest live behind a narrow seam on the right, in a menu that opens below and flips above when there is no room.',
    'The menu sits in the top layer through the Popover API, so it is never clipped by a scrolling container.',
  ],
  usage: [
    'Put the action people choose most often on the main half, and keep the menu to a handful of alternatives.',
    'Give the menu button a `menuLabel` that says what is inside, such as “More ways to save”.',
    'Items can carry a `description`, an `icon`, a `hint` (such as a shortcut) and `separatorBefore`.',
  ],
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: 'On the main half, run the main action; on the menu button, open the menu.',
    },
    {
      keys: ['ArrowDown'],
      action:
        'On the menu button, open the menu on the first item. In the menu, move down (wraps).',
    },
    {
      keys: ['ArrowUp'],
      action: 'On the menu button, open the menu on the last item. In the menu, move up (wraps).',
    },
    { keys: ['Home', 'End'], action: 'Move to the first or last item.' },
    { keys: ['Escape'], action: 'Close the menu and return focus to the menu button.' },
    { keys: ['Tab'], action: 'Close the menu and move on.' },
    { keys: ['a–z'], action: 'Jump to the next item starting with that letter.' },
  ],
  accessibility: [
    'Two native buttons. The narrow one follows the WAI-ARIA menu button pattern: `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.',
    'The menu is a `menu` of `menuitem`s labelled by its button. Focus moves onto the items, and disabled items stay focusable so they can be discovered.',
    'Choosing an item, or pressing Escape, returns focus to the menu button.',
    'The menu closes on a click outside it and when focus leaves it.',
  ],
  reducedMotion: 'The menu appears without its short drop, and the chevron flips without turning.',
  props: [
    {
      kind: 'text',
      name: 'label',
      label: 'Main label',
      description: 'The main action.',
      default: 'Save chart',
    },
    {
      kind: 'select',
      name: 'variant',
      label: 'Variant',
      description: 'Button emphasis.',
      default: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
    },
    {
      kind: 'boolean',
      name: 'descriptions',
      label: 'Descriptions',
      description: 'Show a line of detail under each item.',
      default: true,
    },
  ],
  files: ['SplitActionButton.tsx', 'split-action-button.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'primitives/menu',
    'primitives/typeahead',
    'primitives/use-dismiss',
    'primitives/use-placement',
    'primitives/use-popover',
    'icons/chevron-down',
    'tokens',
  ],
};

function Demo({
  label = 'Save chart',
  variant = 'primary',
  descriptions = true,
  menuLabel = 'More ways to save',
}: {
  label?: string;
  variant?: 'primary' | 'secondary';
  descriptions?: boolean;
  menuLabel?: string;
}) {
  const [last, setLast] = useState('Nothing saved yet.');
  const actions: MenuItem[] = [
    {
      id: 'copy',
      label: 'Save a copy',
      description: 'Keeps the original as it is.',
      icon: <IconCopy />,
      onSelect: () => setLast('Saved a copy.'),
    },
    {
      id: 'template',
      label: 'Save as template',
      description: 'Reuse the layers on a new chart.',
      icon: <IconFile />,
      onSelect: () => setLast('Saved as a template.'),
    },
    {
      id: 'export',
      label: 'Export as image',
      description: 'A PNG at screen resolution.',
      icon: <IconExternal />,
      hint: 'Ctrl E',
      separatorBefore: true,
      onSelect: () => setLast('Exported an image.'),
    },
    {
      id: 'print',
      label: 'Print',
      description: 'Printing arrives in a later release.',
      disabled: true,
    },
  ].map((item) => (descriptions ? item : { ...item, description: undefined })) as MenuItem[];
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <SplitActionButton
        label={label}
        variant={variant}
        menuLabel={menuLabel}
        onAction={() => setLast('Saved.')}
        actions={actions}
      />
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
      id: 'save',
      name: 'Save options',
      description: 'A primary save with three alternatives and one unavailable item.',
      render: () => <Demo />,
    },
    {
      id: 'secondary',
      name: 'Secondary emphasis',
      description: 'For a split action that is not the main one in its view.',
      render: () => <Demo variant="secondary" label="Share route" menuLabel="More ways to share" />,
    },
    {
      id: 'compact',
      name: 'Plain menu',
      description: 'Items without descriptions.',
      render: () => <Demo descriptions={false} menuLabel="More save options" />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      label={String(values.label) || 'Save chart'}
      variant={values.variant as 'primary' | 'secondary'}
      descriptions={Boolean(values.descriptions)}
    />
  ),
};
