import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { StatCounter } from './StatCounter';

export const meta: ComponentMeta = {
  slug: 'stat-counter',
  name: 'Animated stat counter',
  category: 'data-display',
  summary: 'A figure that rolls to its new value.',
  description: [
    'A headline number whose digits roll into place like an odometer, each one a moment after the last, when it first appears and whenever it changes.',
    'Digits sit on tabular figures, so the number never jitters sideways while it rolls. Separators and units stay put.',
  ],
  usage: [
    'Use it for one or two key figures in a view, not for every number in a table.',
    'Pass `format` for units and separators; only the digits roll.',
    'Put the comparison or period in `detail`, such as “Since 1 April”.',
  ],
  keyboard: [],
  accessibility: [
    'Only the final value is exposed to assistive technology, as plain text; the rolling digits are hidden from it.',
    'It is not a live region, so changes are not announced by themselves; announce important changes separately.',
    'The label is visible text beneath the number.',
  ],
  reducedMotion: 'The value appears at once, with no roll.',
  props: [
    {
      kind: 'number',
      name: 'value',
      label: 'Value',
      description: 'The figure.',
      default: 1284,
      min: 0,
      max: 99999,
      step: 37,
    },
    {
      kind: 'text',
      name: 'label',
      label: 'Label',
      description: 'What it counts.',
      default: 'Nautical miles logged',
    },
  ],
  files: ['StatCounter.tsx', 'stat-counter.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-reduced-motion', 'tokens'],
};

function Log() {
  const [miles, setMiles] = useState(1284);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-m)', justifyItems: 'start' }}>
      <StatCounter
        label="Nautical miles logged"
        value={miles}
        format={(v) => `${v.toLocaleString('en-GB')} nm`}
        detail="Since 1 April"
      />
      <Button size="s" onClick={() => setMiles((m) => m + 47)}>
        Log a 47 nm passage
      </Button>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'log',
      name: 'A changing figure',
      description: 'Rolls on first view and on every change.',
      render: () => <Log />,
    },
    {
      id: 'pair',
      name: 'Side by side',
      description: 'Two figures with units and details.',
      render: () => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2xl)' }}>
          <StatCounter label="Passages" value={38} detail="This season" />
          <StatCounter
            label="Hours under sail"
            value={212}
            format={(v) => `${v} h`}
            detail="Up from 164 h"
          />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <StatCounter label={String(values.label) || 'Label'} value={Number(values.value)} />
  ),
};
