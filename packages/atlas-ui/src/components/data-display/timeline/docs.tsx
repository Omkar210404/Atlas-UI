import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Timeline, type TimelineEvent } from './Timeline';

export const meta: ComponentMeta = {
  slug: 'timeline',
  name: 'Timeline',
  category: 'data-display',
  summary: 'Events in order, with a progress line that follows scrolling.',
  description: [
    'A list of events in order along a vertical course line. As the timeline scrolls through the window, the line fills in behind you, like a track plotted on a chart.',
    'Events with details open in place. The current event is marked in magenta, the colour atlas-ui keeps for “you are here”.',
  ],
  usage: [
    'Give each event a `time` (and a machine-readable `dateTime` where you can) and a short `title`.',
    'Put longer notes in `details`; they stay hidden until asked for.',
    'Mark at most one event `current`.',
    'The scroll-linked fill is a CSS scroll-driven animation. Browsers without it show the line full.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move between events that have details.' },
    { keys: ['Enter', 'Space'], action: 'Show or hide an event’s details.' },
  ],
  accessibility: [
    'An ordered list, so its length and each event’s position are announced.',
    'Times are `<time>` elements; detail toggles are buttons with `aria-expanded` and `aria-controls`.',
    'The current event says “(now)” to screen readers as well as showing a magenta mark.',
  ],
  reducedMotion: 'The line is drawn full and does not follow scrolling.',
  props: [
    {
      kind: 'boolean',
      name: 'current',
      label: 'Mark current',
      description: 'Highlight the current event.',
      default: true,
    },
  ],
  files: ['Timeline.tsx', 'timeline.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['icons/chevron-down', 'tokens'],
};

const passage = (current: boolean): TimelineEvent[] => [
  {
    id: 'cast',
    time: '05:40',
    dateTime: '05:40',
    title: 'Cast off from Falmouth',
    details: 'Light northerly, ebb running. Engine off past the castle.',
  },
  {
    id: 'manacles',
    time: '07:15',
    dateTime: '07:15',
    title: 'Clear of the Manacles',
    details: 'Gave the reef a mile of sea room; bell buoy heard to starboard.',
  },
  {
    id: 'lizard',
    time: '09:30',
    dateTime: '09:30',
    title: 'Rounding the Lizard',
    current,
    details: 'Overfalls lively on the flood. Reefed the main.',
  },
  { id: 'mounts', time: '12:05', dateTime: '12:05', title: 'Mount’s Bay in sight' },
  {
    id: 'penzance',
    time: '13:20',
    dateTime: '13:20',
    title: 'Alongside in Penzance',
    details: 'Dock gates open two hours either side of high water.',
  },
];

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'passage',
      name: 'A passage log',
      description: 'Five events, one current, most with notes.',
      render: () => (
        <div style={{ width: 'min(28rem, 100%)' }}>
          <Timeline label="Falmouth to Penzance" events={passage(true)} />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: 'min(28rem, 100%)' }}>
      <Timeline label="Playground passage" events={passage(Boolean(values.current))} />
    </div>
  ),
};
