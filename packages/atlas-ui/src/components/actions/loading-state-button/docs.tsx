import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import type { ButtonVariant } from '../button/Button';
import { LoadingStateButton, type LoadState } from './LoadingStateButton';

export const meta: ComponentMeta = {
  slug: 'loading-state-button',
  name: 'Loading-state button',
  category: 'actions',
  summary: 'Shows progress and the outcome without changing size.',
  description: [
    'A button that keeps you informed about the work it starts: idle, busy, done or failed. Every state’s label sits in the same place, so the button keeps the width of its longest label and nothing around it shifts.',
    'Pass a function that returns a promise and the button runs the states itself. A failure leaves the button in its error state, ready to try again.',
  ],
  usage: [
    'Use one verb through every state: “Save”, “Saving…”, “Saved”, “Couldn’t save. Try again”.',
    'Make the error label say what to do next, not just that something failed.',
    'Pass `state` and `onStateChange` to drive it from your own data layer instead.',
    'Success returns to idle after `resetAfter` milliseconds (2400 by default); errors stay until the next press.',
  ],
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'Start the action, or retry after a failure. Ignored while busy.' },
    { keys: ['Tab'], action: 'Move focus to and from the button. Focus stays on it while busy.' },
  ],
  accessibility: [
    'While busy the button sets `aria-busy` and `aria-disabled` rather than `disabled`, so it keeps focus and keyboard users are not dropped to the top of the page.',
    'Each new state’s label is announced through a live region: politely for progress and success, assertively for failure.',
    'Only the current label is exposed; the others are hidden from assistive technology.',
    'Success and failure are shown with an icon and a coloured edge as well as the label, so colour is never the only signal.',
  ],
  reducedMotion: 'The spinner does not turn, and labels change without sliding. The label still says the work is in progress.',
  props: [
    {
      kind: 'select',
      name: 'outcome',
      label: 'Outcome',
      description: 'Whether the simulated save succeeds.',
      default: 'success',
      options: [
        { value: 'success', label: 'Succeeds' },
        { value: 'error', label: 'Fails' },
      ],
    },
    { kind: 'number', name: 'delay', label: 'Work time', description: 'How long the simulated save takes.', default: 1400, min: 200, max: 4000, step: 100, unit: 'ms' },
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
  ],
  files: ['LoadingStateButton.tsx', 'loading-state-button.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'icons/check',
    'icons/alert',
    'primitives/announce',
    'primitives/use-controllable-state',
    'primitives/use-latest',
    'tokens',
  ],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const labels = { idle: 'Save chart', loading: 'Saving…', success: 'Saved', error: 'Couldn’t save. Try again' };

function Demo({ outcome = 'success', delay = 1400, variant = 'primary' }: { outcome?: string; delay?: number; variant?: ButtonVariant }) {
  return (
    <LoadingStateButton
      variant={variant}
      size="l"
      icon={<IconAnchor />}
      labels={labels}
      onAction={async () => {
        await wait(delay);
        if (outcome === 'error') throw new Error('Simulated failure');
      }}
    />
  );
}

function Controlled() {
  const [state, setState] = useState<LoadState>('idle');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <LoadingStateButton
        variant="secondary"
        labels={{ idle: 'Sync logbook', loading: 'Syncing…', success: 'Synced', error: 'Sync failed. Try again' }}
        state={state}
        onStateChange={setState}
        onAction={() => wait(900)}
      />
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }}>State: {state}</span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    { id: 'save', name: 'Save that succeeds', description: 'Idle, saving, saved, then back to idle.', render: () => <Demo /> },
    { id: 'failure', name: 'Save that fails', description: 'Ends in the error state, ready to retry.', render: () => <Demo outcome="error" delay={900} /> },
    { id: 'controlled', name: 'Controlled state', description: 'The page owns the state and shows it.', render: () => <Controlled /> },
  ],
  Playground: ({ values }) => (
    <Demo outcome={String(values.outcome)} delay={Number(values.delay)} variant={values.variant as ButtonVariant} />
  ),
};
