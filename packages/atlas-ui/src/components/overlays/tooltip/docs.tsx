import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import { IconCopy } from '../../../icons/copy';
import { IconSettings } from '../../../icons/settings';
import type { Side } from '../../../primitives/place';
import { Button } from '../../actions/button/Button';
import { Tooltip } from './Tooltip';

export const meta: ComponentMeta = {
  slug: 'tooltip',
  name: 'Tooltip',
  category: 'overlays',
  summary: 'A short label on hover and focus that you can dismiss.',
  description: [
    'A one-line note that appears when you hover a control or reach it with the keyboard. It adds a detail to a control that already has a name, such as the shortcut for an icon button.',
    'It follows WCAG 1.4.13: Escape hides it without moving focus, you can move the pointer onto it without it vanishing, and it stays until you leave.',
  ],
  usage: [
    'Wrap one focusable element: `<Tooltip content="Ctrl C"><Button …/></Tooltip>`.',
    'Never put essential information only in a tooltip; touch users never see it.',
    'Keep it to a few words. For anything longer or interactive, use a popover.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Focus the trigger: the tooltip appears at once.' },
    { keys: ['Escape'], action: 'Hide the tooltip without moving focus.' },
  ],
  accessibility: [
    'The tooltip has `role="tooltip"` and describes its trigger through `aria-describedby`, so its text is read after the trigger’s name.',
    'It shows on keyboard focus (not on mouse focus), and on hover after a short delay.',
    'A 100 ms grace period lets the pointer cross from the trigger onto the tooltip.',
    'It is never shown for touch input, where hover does not exist.',
  ],
  reducedMotion: 'The tooltip appears without its short rise.',
  props: [
    {
      kind: 'text',
      name: 'content',
      label: 'Content',
      description: 'Tooltip text.',
      default: 'Copy position (Ctrl C)',
    },
    {
      kind: 'select',
      name: 'side',
      label: 'Side',
      description: 'Preferred side.',
      default: 'top',
      options: [
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      kind: 'number',
      name: 'delay',
      label: 'Hover delay',
      description: 'Before showing on hover.',
      default: 300,
      min: 0,
      max: 1000,
      step: 50,
      unit: 'ms',
    },
  ],
  files: ['Tooltip.tsx', 'tooltip.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'primitives/place',
    'primitives/use-placement',
    'primitives/use-popover',
    'tokens',
  ],
};

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'toolbar',
      name: 'Icon buttons',
      description: 'Each icon button has a name; the tooltip adds its shortcut.',
      render: () => (
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <Tooltip content="Ctrl C">
            <Button icon={<IconCopy />} aria-label="Copy position" />
          </Tooltip>
          <Tooltip content="Ctrl D">
            <Button icon={<IconAnchor />} aria-label="Drop anchor" />
          </Tooltip>
          <Tooltip content="Ctrl ,">
            <Button icon={<IconSettings />} aria-label="Settings" />
          </Tooltip>
        </div>
      ),
    },
    {
      id: 'text',
      name: 'Extra detail',
      description: 'A labelled button with a clarifying note.',
      render: () => (
        <Tooltip content="Clears the route but keeps your waypoints.">
          <Button variant="quiet">Reset route</Button>
        </Tooltip>
      ),
    },
  ],
  Playground: ({ values }) => (
    <Tooltip
      content={String(values.content) || 'Tooltip'}
      side={values.side as Side}
      delay={Number(values.delay)}
    >
      <Button>Hover or focus me</Button>
    </Tooltip>
  ),
};
