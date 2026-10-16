import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Sparkline, type SparklinePoint } from './Sparkline';

export const meta: ComponentMeta = {
  slug: 'sparkline',
  name: 'Sparkline',
  category: 'data-display',
  summary: 'A word-sized line chart you can scrub.',
  description: [
    'A small line chart that fits beside a number or inside a table cell. Move the pointer along it, or focus it and use the arrow keys, to read each point.',
    'Screen readers get the shape in words: first and last values, lowest and highest. The exact numbers are one click away in a table.',
  ],
  usage: [
    'Give each point a `label` (a day, an hour) and a `value`.',
    'Use `formatValue` for units; the same text is used for the readout and for assistive technology.',
    'Keep `table` on unless the numbers appear elsewhere on the page.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Focus the chart to inspect it.' },
    { keys: ['ArrowRight', 'ArrowLeft'], action: 'Move to the next or previous point.' },
    { keys: ['Home', 'End'], action: 'Go to the first or last point.' },
  ],
  accessibility: [
    'The drawing is an image with a written summary as its name: range, lowest and highest.',
    'The scrubber is a `slider` whose value text is the point’s label and value, such as “Thu: 1.8 m”.',
    'A disclosure reveals the full data as a table with row headers.',
    'The highlighted point is drawn as a ring and a guide line, not by colour alone.',
  ],
  reducedMotion: 'Nothing animates; the readout updates instantly.',
  props: [
    {
      kind: 'boolean',
      name: 'area',
      label: 'Area fill',
      description: 'Shade under the line.',
      default: true,
    },
    {
      kind: 'boolean',
      name: 'table',
      label: 'Data table',
      description: 'Offer the numbers as a table.',
      default: true,
    },
    {
      kind: 'number',
      name: 'width',
      label: 'Width',
      description: 'Chart width.',
      default: 220,
      min: 120,
      max: 360,
      step: 10,
      unit: 'px',
    },
  ],
  files: ['Sparkline.tsx', 'sparkline.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

const waves: SparklinePoint[] = [
  { label: 'Mon', value: 1.2 },
  { label: 'Tue', value: 1.6 },
  { label: 'Wed', value: 2.4 },
  { label: 'Thu', value: 1.8 },
  { label: 'Fri', value: 0.9 },
  { label: 'Sat', value: 1.1 },
  { label: 'Sun', value: 1.7 },
];
const metres = (v: number) => `${v.toFixed(1)} m`;

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'waves',
      name: 'Wave height',
      description: 'A week of readings with a table.',
      render: () => (
        <Sparkline label="Wave height this week" data={waves} formatValue={metres} width={240} />
      ),
    },
    {
      id: 'inline',
      name: 'Beside a figure',
      description: 'A line only, next to the current value.',
      render: () => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-m)' }}>
          <span style={{ fontSize: 'var(--step-3)', fontWeight: 650 }}>1.7 m</span>
          <Sparkline
            label="Wave height, last seven days"
            data={waves}
            formatValue={metres}
            area={false}
            table={false}
            width={140}
            height={36}
          />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <Sparkline
      label="Wave height this week"
      data={waves}
      formatValue={metres}
      area={Boolean(values.area)}
      table={Boolean(values.table)}
      width={Number(values.width)}
    />
  ),
};
