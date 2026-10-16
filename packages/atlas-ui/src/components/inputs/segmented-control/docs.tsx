import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconChart } from '../../../icons/chart';
import { IconGrid } from '../../../icons/grid';
import { IconList } from '../../../icons/list';
import { SegmentedControl } from './SegmentedControl';

export const meta: ComponentMeta = {
  slug: 'segmented-control',
  name: 'Segmented control',
  category: 'inputs',
  summary: 'A small set of exclusive options with a sliding marker.',
  description: [
    'Two to five mutually exclusive options in one strip. A raised marker slides to the selection with a light spring.',
    'Under the surface it is a group of native radio buttons, so it works in forms, with arrow keys and with every screen reader, without custom key handling.',
  ],
  usage: [
    'Use it for two to five short options that change a view, such as units or a layout. For more options, use a select.',
    'It changes a value; it does not switch panels. For panels, use the tab bar.',
    'Options can carry an `icon`; keep the text label so the meaning is clear.',
    'This site’s Spatial and Simple view switch is this component.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move into the group (onto the selected option) and out again.' },
    { keys: ['ArrowRight', 'ArrowDown'], action: 'Select the next option (wraps).' },
    { keys: ['ArrowLeft', 'ArrowUp'], action: 'Select the previous option (wraps).' },
  ],
  accessibility: [
    'A `radiogroup` named by its label, containing native `<input type="radio">` elements, so the selected state and position (“2 of 3”) are announced by the browser.',
    'Arrow keys move and select, as they do for any radio group; only the selected option is in the Tab order.',
    'The selected option is marked by a raised marker with a magenta rule as well as text colour.',
    'Each option is at least 38 px tall (32 px in the small size).',
  ],
  reducedMotion: 'The marker jumps to the selection instead of sliding.',
  props: [
    {
      kind: 'select',
      name: 'size',
      label: 'Size',
      description: 'Option height.',
      default: 'm',
      options: [
        { value: 'm', label: 'Medium' },
        { value: 's', label: 'Small' },
      ],
    },
    {
      kind: 'boolean',
      name: 'icons',
      label: 'Icons',
      description: 'Show an icon in each option.',
      default: true,
    },
    {
      kind: 'boolean',
      name: 'hideLabel',
      label: 'Hide label',
      description: 'Keep the label for screen readers only.',
      default: false,
    },
  ],
  files: ['SegmentedControl.tsx', 'segmented-control.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-controllable-state', 'tokens'],
};

function Units() {
  const [unit, setUnit] = useState('m');
  const depth = 6.5;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <SegmentedControl
        label="Depth units"
        value={unit}
        onValueChange={setUnit}
        options={[
          { value: 'm', label: 'Metres' },
          { value: 'ft', label: 'Feet' },
          { value: 'fm', label: 'Fathoms' },
        ]}
      />
      <span style={{ fontFamily: 'var(--font-prose)', fontSize: 'var(--step-1)' }}>
        Anchor in{' '}
        {unit === 'm'
          ? `${depth} m`
          : unit === 'ft'
            ? `${(depth * 3.281).toFixed(1)} ft`
            : `${(depth / 1.829).toFixed(1)} fathoms`}
      </span>
    </div>
  );
}

const layouts = (icons: boolean) => [
  { value: 'chart', label: 'Chart', icon: icons ? <IconChart /> : undefined },
  { value: 'list', label: 'List', icon: icons ? <IconList /> : undefined },
  { value: 'grid', label: 'Grid', icon: icons ? <IconGrid /> : undefined },
];

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'units',
      name: 'Unit switch',
      description: 'Three units with a live conversion.',
      render: () => <Units />,
    },
    {
      id: 'icons',
      name: 'With icons',
      description: 'A layout switch with icons and labels.',
      render: () => <SegmentedControl label="Layout" options={layouts(true)} />,
    },
    {
      id: 'small',
      name: 'Small, one option unavailable',
      description: 'The compact size, with a disabled option skipped by the arrow keys.',
      render: () => (
        <SegmentedControl
          label="Tide view"
          size="s"
          options={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month', disabled: true },
          ]}
        />
      ),
    },
  ],
  Playground: ({ values }) => (
    <SegmentedControl
      label="Layout"
      size={values.size as 's' | 'm'}
      hideLabel={Boolean(values.hideLabel)}
      options={layouts(Boolean(values.icons))}
    />
  ),
};
