import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Switch } from './Switch';

export const meta: ComponentMeta = {
  slug: 'switch',
  name: 'Switch',
  category: 'inputs',
  summary: 'An on/off setting that applies at once.',
  description: [
    'For settings that take effect the moment they change, such as showing a layer on a chart. For choices that wait for a Save button, use a checkbox instead.',
    'The thumb glides with the same spring as every indicator in atlas-ui and shows a tick when on, so the state reads without colour.',
  ],
  usage: [
    'Write the label as the setting, not the action: “Show depth contours”, not “Turn on contours”.',
    'Use `description` for a short consequence, such as what turning it on costs.',
    'Pass `name` to submit it with a form; it sends `value` (default “on”) when checked.',
  ],
  keyboard: [
    { keys: ['Space', 'Enter'], action: 'Toggle the switch.' },
    { keys: ['Tab'], action: 'Move focus to and from the switch.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA switch pattern: a `button` with `role="switch"` and `aria-checked`, named by its visible label through `aria-labelledby`.',
    'The description is linked with `aria-describedby`.',
    'Clicking the label toggles the switch, like a native checkbox label.',
    'The visible track is 28 px tall; an invisible extension gives it a 44 px target.',
    'The on state shows a tick inside the thumb and a solid track; colour is not the only signal.',
  ],
  reducedMotion: 'The thumb jumps to its new side instead of gliding.',
  props: [
    {
      kind: 'text',
      name: 'label',
      label: 'Label',
      description: 'The setting.',
      default: 'Show depth contours',
    },
    {
      kind: 'text',
      name: 'description',
      label: 'Description',
      description: 'Optional detail.',
      default: 'Draws soundings below 20 m.',
    },
    {
      kind: 'boolean',
      name: 'disabled',
      label: 'Disabled',
      description: 'Cannot be changed.',
      default: false,
    },
    {
      kind: 'select',
      name: 'labelPosition',
      label: 'Label side',
      description: 'Where the label sits.',
      default: 'end',
      options: [
        { value: 'end', label: 'Switch after label' },
        { value: 'start', label: 'Switch before label' },
      ],
    },
  ],
  files: ['Switch.tsx', 'switch.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-controllable-state', 'tokens'],
};

function Settings() {
  const [contours, setContours] = useState(true);
  const [lights, setLights] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-xs)', width: 'min(26rem, 100%)' }}>
      <Switch
        label="Show depth contours"
        description="Draws soundings below 20 m."
        checked={contours}
        onCheckedChange={setContours}
      />
      <Switch label="Show harbour lights" checked={lights} onCheckedChange={setLights} />
      <Switch
        label="Live tide overlay"
        description="Needs a connection; arrives in a later release."
        disabled
      />
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'settings',
      name: 'Settings list',
      description: 'Three settings, one unavailable.',
      render: () => <Settings />,
    },
    {
      id: 'leading',
      name: 'Switch first',
      description: 'The switch before its label, for compact lists.',
      render: () => <Switch label="Night colours" labelPosition="start" defaultChecked />,
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: 'min(26rem, 100%)' }}>
      <Switch
        label={String(values.label) || 'Setting'}
        description={String(values.description) || undefined}
        disabled={Boolean(values.disabled)}
        labelPosition={values.labelPosition as 'start' | 'end'}
      />
    </div>
  ),
};
