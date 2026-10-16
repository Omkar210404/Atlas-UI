import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { RangeSlider } from './RangeSlider';

export const meta: ComponentMeta = {
  slug: 'range-slider',
  name: 'Range slider',
  category: 'inputs',
  summary: 'One or two thumbs with a live value readout.',
  description: [
    'Pick a value, or a range between two values, by dragging, clicking the track or using the keyboard. The current value rides above the thumb on a thin sounding line while you adjust it.',
    'With two thumbs the range is shaded between them, and the thumbs stop at each other rather than crossing, so the low end is always the low end.',
  ],
  usage: [
    'Pass a number for one thumb or a pair for a range: `defaultValue={[4, 12]}`.',
    'Use `formatValue` to add units; the same text is used by screen readers, so “6.5 m” is read as “6.5 m”.',
    'Use `onValueCommit` to save once a drag or key press finishes, rather than on every movement.',
    'For exact numbers, pair the slider with a text field; sliders suit approximate choices.',
  ],
  keyboard: [
    { keys: ['ArrowRight', 'ArrowUp'], action: 'Increase by one step.' },
    { keys: ['ArrowLeft', 'ArrowDown'], action: 'Decrease by one step.' },
    { keys: ['PageUp', 'PageDown'], action: 'Change by a tenth of the range.' },
    { keys: ['Home', 'End'], action: 'Go to the lowest or highest value allowed.' },
    { keys: ['Tab'], action: 'Move between thumbs, then on.' },
  ],
  accessibility: [
    'Each thumb is a `slider` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`, following the WAI-ARIA slider and multi-thumb slider patterns.',
    'In a range, each thumb’s limits are the other thumb’s value, so assistive technology knows how far it can go.',
    'Thumbs are named by the slider’s label plus “Minimum” or “Maximum” (configurable with `thumbLabels`).',
    'The visible thumb is 22 px; an invisible ring extends its target to 44 px.',
    'The value shown above the thumb is decorative; the same text reaches screen readers through `aria-valuetext`.',
  ],
  reducedMotion: 'The thumb and the value bubble respond without growing or sliding.',
  props: [
    {
      kind: 'boolean',
      name: 'range',
      label: 'Two thumbs',
      description: 'Choose a range instead of one value.',
      default: true,
    },
    {
      kind: 'number',
      name: 'step',
      label: 'Step',
      description: 'Size of one step.',
      default: 0.5,
      min: 0.5,
      max: 5,
      step: 0.5,
    },
    {
      kind: 'select',
      name: 'tooltip',
      label: 'Value bubble',
      description: 'When to show the value above the thumb.',
      default: 'auto',
      options: [
        { value: 'auto', label: 'While adjusting' },
        { value: 'always', label: 'Always' },
        { value: 'never', label: 'Never' },
      ],
    },
    {
      kind: 'number',
      name: 'ticks',
      label: 'Ticks',
      description: 'Tick marks along the track (0 for none).',
      default: 6,
      min: 0,
      max: 12,
      step: 1,
    },
  ],
  files: ['RangeSlider.tsx', 'range-slider.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-controllable-state', 'tokens'],
};

const metres = (v: number) => `${v} m`;

function DepthRange() {
  const [range, setRange] = useState<readonly [number, number]>([4, 12]);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', width: 'min(26rem, 100%)' }}>
      <RangeSlider
        label="Safe anchoring depth"
        min={0}
        max={30}
        step={0.5}
        value={range}
        onValueChange={setRange}
        formatValue={metres}
        ticks={6}
      />
      <p style={{ fontFamily: 'var(--font-prose)', color: 'var(--ink-soft)' }}>
        Show anchorages between {metres(range[0])} and {metres(range[1])}.
      </p>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'range',
      name: 'Depth range',
      description: 'Two thumbs, with units and ticks.',
      render: () => <DepthRange />,
    },
    {
      id: 'single',
      name: 'Single value',
      description: 'One thumb, value always shown.',
      render: () => (
        <div style={{ width: 'min(24rem, 100%)' }}>
          <RangeSlider
            label="Chart opacity"
            defaultValue={70}
            formatValue={(v) => `${v}%`}
            tooltip="always"
          />
        </div>
      ),
    },
    {
      id: 'stepped',
      name: 'Coarse steps',
      description: 'Five-knot steps for wind speed.',
      render: () => (
        <div style={{ width: 'min(24rem, 100%)' }}>
          <RangeSlider
            label="Wind limit"
            min={0}
            max={40}
            step={5}
            defaultValue={20}
            formatValue={(v) => `${v} knots`}
            ticks={8}
          />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: 'min(26rem, 100%)' }}>
      <RangeSlider
        key={String(values.range)}
        label="Playground depth"
        min={0}
        max={30}
        step={Number(values.step)}
        defaultValue={values.range ? ([5, 15] as const) : 10}
        formatValue={metres}
        tooltip={values.tooltip as 'auto' | 'always' | 'never'}
        ticks={Number(values.ticks)}
      />
    </div>
  ),
};
