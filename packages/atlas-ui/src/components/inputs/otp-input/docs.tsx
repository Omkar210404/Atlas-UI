import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { OtpInput } from './OtpInput';

export const meta: ComponentMeta = {
  slug: 'otp-input',
  name: 'OTP input',
  category: 'inputs',
  summary: 'One-time codes, drawn as cells, typed as one field.',
  description: [
    'A one-time code shown as a row of cells, with the next empty cell marked. Underneath it is one ordinary text input, so pasting the whole code, SMS autofill on phones and password managers all work.',
    'Characters that do not belong in a code are dropped as you type or paste, so “123 456” and “123-456” both become 123456.',
  ],
  usage: [
    'Use `onComplete` to verify the code as soon as the last character arrives, instead of making people press a button.',
    'Use `mode="alphanumeric"` for codes with letters; they are shown in capitals.',
    'Put where the code was sent in the `hint`, so people know where to look.',
    'Show a specific `error` if verification fails, and clear the value so they can type again.',
  ],
  keyboard: [
    { keys: ['0–9'], action: 'Type the next character; invalid characters are ignored.' },
    { keys: ['Backspace'], action: 'Delete the last character.' },
    { keys: ['Tab'], action: 'Move focus into and out of the field.' },
  ],
  accessibility: [
    'A single native `<input>` with a `<label>`, `autocomplete="one-time-code"` and the right `inputmode`, so it is announced as one text field with its whole value.',
    'The cells are decorative (`aria-hidden`); the input itself carries the value, hint and error.',
    'The hint and error are linked with `aria-describedby`; an error sets `aria-invalid` and turns every cell red with a thicker edge.',
    'Cells are 48 × 56 px (40 × 48 px on narrow screens).',
  ],
  reducedMotion: 'The caret in the next empty cell does not blink.',
  props: [
    {
      kind: 'number',
      name: 'length',
      label: 'Length',
      description: 'Characters in the code.',
      default: 6,
      min: 4,
      max: 8,
      step: 1,
    },
    {
      kind: 'select',
      name: 'mode',
      label: 'Characters',
      description: 'What the code may contain.',
      default: 'numeric',
      options: [
        { value: 'numeric', label: 'Digits' },
        { value: 'alphanumeric', label: 'Letters and digits' },
      ],
    },
    {
      kind: 'boolean',
      name: 'mask',
      label: 'Mask',
      description: 'Show dots instead of characters.',
      default: false,
    },
  ],
  files: ['OtpInput.tsx', 'otp-input.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'primitives/field',
    'primitives/use-controllable-state',
    'icons/alert',
    'tokens',
  ],
};

/** A demo that "verifies" codes locally: 246810 is correct, anything else fails. */
function Verify() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'bad'>('idle');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)' }}>
      <OtpInput
        label="Verification code"
        hint="Sent to the harbour office. For this demo, 246810 is correct."
        value={code}
        onValueChange={(next) => {
          setCode(next);
          if (status !== 'idle') setStatus('idle');
        }}
        onComplete={(full) => {
          if (full === '246810') setStatus('ok');
          else {
            setStatus('bad');
            setCode('');
          }
        }}
        error={status === 'bad' ? 'That code did not match. Type it again.' : undefined}
      />
      <span
        role="status"
        style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)', minHeight: '1.4em' }}
      >
        {status === 'ok' ? 'Verified. Berth confirmed.' : ''}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'verify',
      name: 'Verify on completion',
      description: 'Checks the code as soon as it is complete.',
      render: () => <Verify />,
    },
    {
      id: 'alphanumeric',
      name: 'Letters and digits',
      description: 'A shorter code with letters, shown in capitals.',
      render: () => (
        <OtpInput label="Berth reference" length={4} mode="alphanumeric" defaultValue="b7" />
      ),
    },
    {
      id: 'masked',
      name: 'Masked',
      description: 'Dots instead of characters, for codes typed in public.',
      render: () => <OtpInput label="Gate PIN" length={4} mask defaultValue="19" />,
    },
  ],
  Playground: ({ values }) => (
    <OtpInput
      key={`${values.length}-${values.mode}`}
      label="Playground code"
      length={Number(values.length)}
      mode={values.mode as 'numeric' | 'alphanumeric'}
      mask={Boolean(values.mask)}
    />
  ),
};
