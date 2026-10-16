import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import type { Align, Side } from '../../../primitives/place';
import { Popover } from './Popover';

export const meta: ComponentMeta = {
  slug: 'popover',
  name: 'Popover',
  category: 'overlays',
  summary: 'Anchored content that flips and shifts to stay visible.',
  description: [
    'A small panel attached to a button, for detail that should not interrupt the page. It opens on the side you ask for, flips to the opposite side when there is no room, and slides along the edge to stay on screen.',
    'Its arrow is placed after the flip and shift, so it always points at the middle of the button, even when the panel has moved.',
  ],
  usage: [
    'Use it for short, optional content: a definition, a preview, a few settings. Use a modal for anything that needs a decision.',
    'Give it a `title`; it names the popover for assistive technology.',
    'Set `side` and `align` for where you would like it; collision handling takes care of the rest.',
  ],
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'Open or close the popover from its button.' },
    { keys: ['Tab'], action: 'Move through the popover’s content; leaving it closes it.' },
    { keys: ['Escape'], action: 'Close the popover and return focus to its button.' },
  ],
  accessibility: [
    'The button exposes `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`.',
    'The panel is a non-modal `dialog` labelled by its title. The page stays usable while it is open.',
    'Focus moves into the popover when it opens and back to the button when Escape closes it.',
    'It closes on a click outside and when focus leaves it, so it never lingers unseen.',
    'It sits in the top layer through the Popover API, so no container can clip it.',
  ],
  reducedMotion: 'The popover appears without its short slide from the anchor.',
  props: [
    {
      kind: 'select',
      name: 'side',
      label: 'Side',
      description: 'Preferred side; it flips when there is no room.',
      default: 'bottom',
      options: [
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      kind: 'select',
      name: 'align',
      label: 'Align',
      description: 'Alignment along the button.',
      default: 'center',
      options: [
        { value: 'start', label: 'Start' },
        { value: 'center', label: 'Centre' },
        { value: 'end', label: 'End' },
      ],
    },
  ],
  files: ['Popover.tsx', 'popover.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'primitives/place',
    'primitives/use-placement',
    'primitives/use-popover',
    'primitives/use-dismiss',
    'primitives/focus',
    'primitives/use-controllable-state',
    'tokens',
  ],
};

const definition = (
  <p>
    A sounding is a measured depth of water, printed on charts in metres below the lowest
    astronomical tide.
  </p>
);

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'definition',
      name: 'Definition',
      description: 'A term explained in place.',
      render: () => (
        <Popover label="What is a sounding?" title="Sounding" triggerProps={{ variant: 'quiet' }}>
          {definition}
        </Popover>
      ),
    },
    {
      id: 'edge',
      name: 'At the edge',
      description:
        'Asked to open to the right at the right edge: it flips left, and the arrow follows.',
      render: () => (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Popover label="Depth key" title="Depth key" side="right">
            {definition}
          </Popover>
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <Popover
      key={`${values.side}-${values.align}`}
      label="Open popover"
      title="Sounding"
      side={values.side as Side}
      align={values.align as Align}
    >
      {definition}
    </Popover>
  ),
};
