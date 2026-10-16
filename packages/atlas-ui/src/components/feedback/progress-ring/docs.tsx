import { useEffect, useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { ProgressRing } from './ProgressRing';

export const meta: ComponentMeta = {
  slug: 'progress-ring',
  name: 'Progress ring',
  category: 'feedback',
  summary: 'Determinate and indeterminate progress in a ring.',
  description: [
    'Progress drawn as an arc inside a ring of bearing marks, like the bezel of a compass. With a value it fills toward completion; without one it sweeps around to say “working on it”.',
    'The percentage sits in the middle at larger sizes; small rings drop it and rely on their label.',
  ],
  usage: [
    'Pass `value` and `max` when you know how far along the work is; omit `value` when you do not.',
    'Give it a `label` that names the work, such as “Downloading charts”.',
    'Use `valueText` for progress that is not best said as a percentage: “3 of 8 charts”.',
  ],
  keyboard: [],
  accessibility: [
    'An element with the `progressbar` role, named by `label`.',
    'Determinate rings expose `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`; indeterminate rings leave the value out, as the ARIA spec requires.',
    'The drawing is decorative; the number in the middle is hidden from assistive technology because the role already carries it.',
  ],
  reducedMotion: 'The value changes without easing, and the indeterminate arc stays still.',
  props: [
    {
      kind: 'number',
      name: 'value',
      label: 'Value',
      description: 'Progress out of 100.',
      default: 64,
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
    },
    {
      kind: 'boolean',
      name: 'indeterminate',
      label: 'Indeterminate',
      description: 'Ignore the value.',
      default: false,
    },
    {
      kind: 'number',
      name: 'size',
      label: 'Size',
      description: 'Diameter.',
      default: 120,
      min: 32,
      max: 200,
      step: 8,
      unit: 'px',
    },
    {
      kind: 'select',
      name: 'tone',
      label: 'Tone',
      description: 'Colour of the arc.',
      default: 'ink',
      options: [
        { value: 'ink', label: 'Ink' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
      ],
    },
  ],
  files: ['ProgressRing.tsx', 'progress-ring.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

function Download() {
  const [done, setDone] = useState(0);
  const total = 8;
  useEffect(() => {
    if (done >= total) return;
    const timer = window.setTimeout(() => setDone((d) => d + 1), 600);
    return () => window.clearTimeout(timer);
  }, [done]);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <ProgressRing
        label="Downloading charts"
        value={done}
        max={total}
        size={128}
        valueText={`${done} of ${total} charts`}
        tone={done === total ? 'success' : 'ink'}
      />
      <Button size="s" onClick={() => setDone(0)} disabled={done < total}>
        Download again
      </Button>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'download',
      name: 'Counting up',
      description: 'Eight charts, then success.',
      render: () => <Download />,
    },
    {
      id: 'sizes',
      name: 'Indeterminate and small',
      description: 'An unknown wait, and a compact ring without its number.',
      render: () => (
        <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
          <ProgressRing label="Connecting to the harbour office" size={96} />
          <ProgressRing label="Uploading the logbook" value={40} size={40} />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <ProgressRing
      label="Playground progress"
      value={values.indeterminate ? undefined : Number(values.value)}
      size={Number(values.size)}
      tone={values.tone as 'ink' | 'success' | 'warning'}
    />
  ),
};
