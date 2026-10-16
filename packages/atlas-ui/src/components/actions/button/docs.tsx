import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import { IconCopy } from '../../../icons/copy';
import { IconSettings } from '../../../icons/settings';
import { Button, type ButtonSize, type ButtonVariant } from './Button';

export const meta: ComponentMeta = {
  slug: 'button',
  name: 'Button',
  category: 'actions',
  summary: 'The base button every other action builds on.',
  description: [
    'A plain, solid button in four emphases and three sizes. The magnetic, split and loading buttons are built on it, and so is every button on this site.',
    'Use one primary button per view for the main action. Secondary suits most other actions; quiet suits actions that sit inside dense content.',
  ],
  usage: [
    'Name the button by what it does: “Save chart”, not “Submit”.',
    'Pass `icon` for a leading icon. An icon-only button needs `aria-label`.',
    'Use `aria-disabled="true"` instead of `disabled` when the button must stay focusable, for example so a hint next to it can explain why it is unavailable.',
  ],
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'Activate the button.' },
    { keys: ['Tab'], action: 'Move focus to and from the button.' },
  ],
  accessibility: [
    'A native `<button>` with `type="button"` by default, so it never submits a form by accident.',
    'Small buttons are 32 px tall, above the 24 px minimum target; the default is 40 px and large is 48 px.',
    'With `aria-disabled`, clicks are ignored but the button stays in the Tab order and keeps its name.',
    'In forced-colours mode the button gets a system-coloured border.',
  ],
  reducedMotion: 'The 1 px press dip is removed; colour changes stay.',
  props: [
    {
      kind: 'select',
      name: 'variant',
      label: 'Variant',
      description: 'How much emphasis the action gets.',
      default: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'quiet', label: 'Quiet' },
        { value: 'danger', label: 'Danger' },
      ],
    },
    {
      kind: 'select',
      name: 'size',
      label: 'Size',
      description: 'Height: 32, 40 or 48 px.',
      default: 'm',
      options: [
        { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' },
        { value: 'l', label: 'Large' },
      ],
    },
    {
      kind: 'text',
      name: 'label',
      label: 'Label',
      description: 'What the button says.',
      default: 'Save chart',
    },
    {
      kind: 'boolean',
      name: 'icon',
      label: 'Icon',
      description: 'Show a leading icon.',
      default: false,
    },
    {
      kind: 'boolean',
      name: 'disabled',
      label: 'Unavailable',
      description: 'Shown with aria-disabled.',
      default: false,
    },
  ],
  files: ['Button.tsx', 'button.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-s)', alignItems: 'center' }}>
      <Button variant="primary" onClick={() => setCount((c) => c + 1)}>
        Drop anchor
      </Button>
      <Button icon={<IconCopy />} onClick={() => setCount((c) => c + 1)}>
        Copy position
      </Button>
      <Button variant="quiet" onClick={() => setCount(0)}>
        Reset
      </Button>
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }} aria-live="polite">
        Pressed {count} {count === 1 ? 'time' : 'times'}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'emphasis',
      name: 'Emphasis levels',
      description: 'Primary, secondary and quiet together.',
      render: () => <Counter />,
    },
    {
      id: 'sizes',
      name: 'Sizes',
      description: 'Small, medium and large, plus an icon-only button.',
      render: () => (
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-s)', alignItems: 'center' }}
        >
          <Button size="s">Small</Button>
          <Button size="m">Medium</Button>
          <Button size="l" variant="primary" icon={<IconAnchor />}>
            Large
          </Button>
          <Button icon={<IconSettings />} aria-label="Settings" />
        </div>
      ),
    },
    {
      id: 'states',
      name: 'Danger and unavailable',
      description: 'A destructive action, and one that stays focusable while unavailable.',
      render: () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-s)' }}>
          <Button variant="danger">Delete route</Button>
          <Button aria-disabled="true">Export route</Button>
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <Button
      variant={values.variant as ButtonVariant}
      size={values.size as ButtonSize}
      icon={values.icon ? <IconAnchor /> : undefined}
      aria-disabled={values.disabled ? 'true' : undefined}
    >
      {String(values.label) || 'Button'}
    </Button>
  ),
};
