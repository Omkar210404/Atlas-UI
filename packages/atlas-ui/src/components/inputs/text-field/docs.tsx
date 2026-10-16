import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconSearch } from '../../../icons/search';
import { TextField } from './TextField';

export const meta: ComponentMeta = {
  slug: 'text-field',
  name: 'Text field',
  category: 'inputs',
  summary: 'A labelled field with hint and error text.',
  description: [
    'A text input with its label above it, an optional hint below, and an error message that replaces guesswork with a specific fix. The label never floats away or hides inside the box.',
    'Set `maxLength` for a character counter. It is announced only at a few milestones near the limit, so typing is not drowned in announcements.',
  ],
  usage: [
    'Always pass a visible `label`; a placeholder is not a label.',
    'Put formatting rules in `hint` before people type, rather than only in `error` afterwards.',
    'Write errors as instructions: “Enter a harbour name”, not “Invalid input”.',
    'Use `prefix` and `suffix` for units and icons, `multiline` for a textarea with that many rows.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move focus into and out of the field.' },
    { keys: ['a–z'], action: 'Type. The counter updates as you go.' },
  ],
  accessibility: [
    'A native `<input>` (or `<textarea>`) with a `<label for>`.',
    'The error and the hint are linked with `aria-describedby`, error first, and the field sets `aria-invalid` while an error is shown.',
    'The counter is described to screen readers as “12 of 40 characters used” and announced at 10 and 5 characters left and at the limit.',
    'Required fields say “(required)” in words, not with an asterisk alone.',
    'The error state uses a thicker red edge and an icon, not colour alone.',
  ],
  reducedMotion: 'Nothing in the field moves. Focus and error edges change instantly.',
  props: [
    {
      kind: 'text',
      name: 'label',
      label: 'Label',
      description: 'Names the field.',
      default: 'Harbour name',
    },
    {
      kind: 'text',
      name: 'hint',
      label: 'Hint',
      description: 'Help shown below the field.',
      default: 'As it appears on the chart.',
    },
    {
      kind: 'text',
      name: 'error',
      label: 'Error',
      description: 'Leave empty for no error.',
      default: '',
    },
    {
      kind: 'number',
      name: 'maxLength',
      label: 'Character limit',
      description: '0 hides the counter.',
      default: 40,
      min: 0,
      max: 80,
      step: 5,
    },
    {
      kind: 'boolean',
      name: 'required',
      label: 'Required',
      description: 'Marks the field as required.',
      default: false,
    },
    {
      kind: 'boolean',
      name: 'multiline',
      label: 'Multi-line',
      description: 'Use a textarea.',
      default: false,
    },
  ],
  files: ['TextField.tsx', 'text-field.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'primitives/field',
    'primitives/announce',
    'primitives/use-controllable-state',
    'icons/alert',
    'tokens',
  ],
};

function Validating() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const error =
    touched && value.trim().length < 3
      ? 'Enter at least 3 letters of the harbour name.'
      : undefined;
  return (
    <div style={{ width: 'min(24rem, 100%)' }}>
      <TextField
        label="Harbour name"
        hint="As it appears on the chart."
        required
        value={value}
        onValueChange={setValue}
        onBlur={() => setTouched(true)}
        error={error}
      />
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'validating',
      name: 'Validated on blur',
      description: 'Required, with an error that says how to fix it.',
      render: () => <Validating />,
    },
    {
      id: 'affixes',
      name: 'Prefix and suffix',
      description: 'A search icon and a unit inside the box.',
      render: () => (
        <div style={{ display: 'grid', gap: 'var(--space-m)', width: 'min(24rem, 100%)' }}>
          <TextField
            label="Search the logbook"
            hideLabel
            prefix={<IconSearch size={18} />}
            placeholder="Search the logbook"
          />
          <TextField label="Anchor depth" suffix="metres" inputMode="decimal" defaultValue="6.5" />
        </div>
      ),
    },
    {
      id: 'counter',
      name: 'Notes with a limit',
      description: 'A multi-line field with a character counter.',
      render: () => (
        <div style={{ width: 'min(28rem, 100%)' }}>
          <TextField
            label="Passage notes"
            multiline={3}
            maxLength={120}
            hint="A line or two for the next crew."
          />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: 'min(26rem, 100%)' }}>
      <TextField
        key={`${values.multiline}`}
        label={String(values.label) || 'Label'}
        hint={String(values.hint) || undefined}
        error={String(values.error) || undefined}
        maxLength={Number(values.maxLength) || undefined}
        required={Boolean(values.required)}
        multiline={values.multiline ? 3 : undefined}
      />
    </div>
  ),
};
