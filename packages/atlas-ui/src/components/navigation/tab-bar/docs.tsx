import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Tab, TabBar, TabPanel, Tabs } from './TabBar';

export const meta: ComponentMeta = {
  slug: 'tab-bar',
  name: 'Tab bar',
  category: 'navigation',
  summary: 'Tabs with an indicator that glides to the selected tab.',
  description: [
    'A set of tabs that switch between panels in place. The indicator follows the selection with a light spring, so you see where you came from and where you landed.',
    'Use it for sibling views of the same thing, such as the sections of a spec sheet. For moving between pages, use links instead.',
  ],
  usage: [
    'Keep tab labels short: one or two words.',
    'Choose `manual` activation when a panel is slow to render, so arrowing past a tab does not load it.',
    'The `chip` variant suits compact switchers; `line` suits section headers.',
    'The tab list scrolls sideways when it runs out of room, and the focused tab is kept in view.',
  ],
  keyboard: [
    { keys: ['ArrowRight'], action: 'Move focus to the next tab (wraps to the first).' },
    { keys: ['ArrowLeft'], action: 'Move focus to the previous tab (wraps to the last).' },
    { keys: ['Home'], action: 'Move focus to the first tab.' },
    { keys: ['End'], action: 'Move focus to the last tab.' },
    { keys: ['Enter', 'Space'], action: 'Select the focused tab (manual activation).' },
    { keys: ['Tab'], action: 'Move from the selected tab into its panel.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA tabs pattern: `tablist`, `tab` and `tabpanel`, with `aria-selected`, `aria-controls` and `aria-labelledby` wired up.',
    'Only the selected tab is in the Tab order (roving tabindex); arrow keys move between tabs.',
    'Each panel is focusable, so keyboard users can reach panels that have no focusable content.',
    'Right-to-left layouts reverse the arrow keys.',
    'In forced-colours mode the indicator uses the system highlight colour and the selected label is underlined.',
  ],
  reducedMotion:
    'The indicator jumps to the selected tab instead of gliding, and panels appear without the short fade.',
  props: [
    {
      kind: 'select',
      name: 'variant',
      label: 'Variant',
      description: 'Line under the tab, or a chip behind it.',
      default: 'line',
      options: [
        { value: 'line', label: 'Line' },
        { value: 'chip', label: 'Chip' },
      ],
    },
    {
      kind: 'select',
      name: 'activation',
      label: 'Activation',
      description: 'Select on focus, or wait for Enter or Space.',
      default: 'automatic',
      options: [
        { value: 'automatic', label: 'Automatic' },
        { value: 'manual', label: 'Manual' },
      ],
    },
    {
      kind: 'number',
      name: 'count',
      label: 'Tabs',
      description: 'How many tabs to show.',
      default: 4,
      min: 2,
      max: 6,
      step: 1,
    },
  ],
  files: ['TabBar.tsx', 'tab-bar.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/roving', 'primitives/use-controllable-state', 'tokens'],
};

const sections = [
  { value: 'tides', label: 'Tides', body: 'High water at 06:12 and 18:40. Range 3.1 m.' },
  { value: 'currents', label: 'Currents', body: 'Flood sets north-east at up to 1.5 knots.' },
  { value: 'hazards', label: 'Hazards', body: 'Drying rocks on the western approach.' },
  { value: 'lights', label: 'Lights', body: 'Harbour light flashes white every 5 seconds.' },
  { value: 'anchorage', label: 'Anchorage', body: 'Good holding in sand, 6 to 8 m.' },
  { value: 'notes', label: 'Notes', body: 'Charted from a 2026 survey.' },
];

function Demo({
  variant,
  activation,
  count,
  label,
}: {
  variant: 'line' | 'chip';
  activation: 'automatic' | 'manual';
  count: number;
  label: string;
}) {
  const shown = sections.slice(0, count);
  return (
    <Tabs defaultValue={shown[0]?.value ?? ''} activation={activation}>
      <TabBar label={label} variant={variant}>
        {shown.map((s) => (
          <Tab key={s.value} value={s.value}>
            {s.label}
          </Tab>
        ))}
      </TabBar>
      {shown.map((s) => (
        <TabPanel key={s.value} value={s.value}>
          <p style={{ padding: 'var(--space-m) var(--space-2xs)', fontFamily: 'var(--font-prose)' }}>
            {s.body}
          </p>
        </TabPanel>
      ))}
    </Tabs>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'line',
      name: 'Section tabs',
      description: 'The line variant, for headers over a panel.',
      render: () => <Demo variant="line" activation="automatic" count={4} label="Harbour notes" />,
    },
    {
      id: 'chip',
      name: 'Compact switcher',
      description: 'The chip variant, for a small set of views.',
      render: () => <Demo variant="chip" activation="automatic" count={3} label="Harbour data" />,
    },
    {
      id: 'manual',
      name: 'Manual activation',
      description: 'Arrow keys move focus; Enter or Space selects.',
      render: () => <Demo variant="line" activation="manual" count={5} label="Harbour notes, manual" />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      key={`${values.activation}-${values.count}`}
      variant={values.variant as 'line' | 'chip'}
      activation={values.activation as 'automatic' | 'manual'}
      count={Number(values.count)}
      label="Playground tabs"
    />
  ),
};
