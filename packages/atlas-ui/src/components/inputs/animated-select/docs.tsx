import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { AnimatedSelect, type SelectOption } from './AnimatedSelect';

export const meta: ComponentMeta = {
  slug: 'animated-select',
  name: 'Animated select',
  category: 'inputs',
  summary: 'A select whose options unroll from the trigger.',
  description: [
    'A single-choice select that opens like a chart being unrolled: the list reveals itself downward from the trigger (or upward when it has to open above), and its options settle in one after another.',
    'It behaves like a native select for keyboard and screen-reader users. Focus never leaves the trigger, typing a letter jumps to a matching option, and Tab keeps the highlighted choice.',
  ],
  usage: [
    'Use it for one choice from more than five options; for two to five, a segmented control shows them all at once.',
    'Give options a `description` when the label alone is ambiguous.',
    'Pass `name` to submit the value with a form.',
    'The list sits in the top layer through the Popover API, so it is never clipped by a scrolling panel.',
  ],
  keyboard: [
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action:
        'Open the list on the selected option; when open, move the highlight (stops at the ends).',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Open the list, or choose the highlighted option and close.',
    },
    {
      keys: ['Home', 'End'],
      action: 'Highlight the first or last option (opening the list if needed).',
    },
    { keys: ['PageUp', 'PageDown'], action: 'Move the highlight ten options.' },
    { keys: ['Escape'], action: 'Close without changing the choice.' },
    { keys: ['Tab'], action: 'Choose the highlighted option, close and move on.' },
    { keys: ['a–z'], action: 'Highlight the next option starting with those letters.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA select-only combobox pattern: a `combobox` with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`, and a `listbox` of `option`s with `aria-selected`.',
    'Focus stays on the combobox; the highlighted option is exposed with `aria-activedescendant`.',
    'The label, hint and error are wired with `aria-labelledby` and `aria-describedby`; errors set `aria-invalid`.',
    'The selected option is marked with a tick and bold text as well as by state.',
    'Options are at least 44 px tall.',
  ],
  reducedMotion: 'The list appears in place without unrolling, and options appear together.',
  props: [
    {
      kind: 'text',
      name: 'label',
      label: 'Label',
      description: 'Names the select.',
      default: 'Home port',
    },
    {
      kind: 'text',
      name: 'placeholder',
      label: 'Placeholder',
      description: 'Shown before a choice is made.',
      default: 'Choose a port…',
    },
    {
      kind: 'boolean',
      name: 'descriptions',
      label: 'Descriptions',
      description: 'Show a detail line under each option.',
      default: true,
    },
    {
      kind: 'text',
      name: 'error',
      label: 'Error',
      description: 'Leave empty for no error.',
      default: '',
    },
  ],
  files: ['AnimatedSelect.tsx', 'animated-select.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'primitives/field',
    'primitives/typeahead',
    'primitives/use-controllable-state',
    'primitives/use-dismiss',
    'primitives/use-placement',
    'primitives/use-popover',
    'icons/check',
    'icons/chevron-down',
    'tokens',
  ],
};

const ports: SelectOption[] = [
  { value: 'falmouth', label: 'Falmouth', description: 'Deep natural harbour, Cornwall' },
  { value: 'fowey', label: 'Fowey', description: 'River estuary, all-tide access' },
  { value: 'plymouth', label: 'Plymouth', description: 'Large sound with several marinas' },
  { value: 'salcombe', label: 'Salcombe', description: 'Bar at the entrance; check the tide' },
  { value: 'dartmouth', label: 'Dartmouth', description: 'Steep-sided river mouth' },
  {
    value: 'weymouth',
    label: 'Weymouth',
    description: 'Closed for dredging this season',
    disabled: true,
  },
  { value: 'poole', label: 'Poole', description: 'Wide natural harbour, shallow in places' },
];

function Demo({
  label = 'Home port',
  placeholder = 'Choose a port…',
  descriptions = true,
  error,
}: {
  label?: string;
  placeholder?: string;
  descriptions?: boolean;
  error?: string;
}) {
  const [port, setPort] = useState('');
  const options = descriptions ? ports : ports.map(({ description: _d, ...o }) => o);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', width: 'min(22rem, 100%)' }}>
      <AnimatedSelect
        label={label}
        placeholder={placeholder}
        options={options}
        value={port}
        onValueChange={setPort}
        error={error}
      />
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }}>
        {port
          ? `Charting a course from ${ports.find((p) => p.value === port)?.label}.`
          : 'No port chosen yet.'}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'ports',
      name: 'Ports with details',
      description: 'Seven options, one closed for the season.',
      render: () => <Demo />,
    },
    {
      id: 'plain',
      name: 'Plain list',
      description: 'Labels only, with a default choice.',
      render: () => (
        <div style={{ width: 'min(18rem, 100%)' }}>
          <AnimatedSelect
            label="Chart scale"
            defaultValue="50k"
            options={[
              { value: '25k', label: '1 : 25,000' },
              { value: '50k', label: '1 : 50,000' },
              { value: '100k', label: '1 : 100,000' },
              { value: '250k', label: '1 : 250,000' },
            ]}
          />
        </div>
      ),
    },
    {
      id: 'error',
      name: 'With an error',
      description: 'Required, with a message that says what to do.',
      render: () => <Demo error="Choose a home port to continue." />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      label={String(values.label) || 'Select'}
      placeholder={String(values.placeholder)}
      descriptions={Boolean(values.descriptions)}
      error={String(values.error) || undefined}
    />
  ),
};
