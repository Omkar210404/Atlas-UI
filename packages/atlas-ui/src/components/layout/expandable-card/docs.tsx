import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { ExpandableCard } from './ExpandableCard';

export const meta: ComponentMeta = {
  slug: 'expandable-card',
  name: 'Expandable card',
  category: 'layout',
  summary: 'A card that opens into its details in place.',
  description: [
    'A card with a summary that opens into its full details where it stands. The card grows with a spring, using the motion library’s layout animation, while its heading stays put.',
    'Focus stays on the toggle you pressed, so keyboard users never lose their place, and the content around the card moves smoothly out of the way.',
  ],
  usage: [
    'Use it for lists where people compare summaries and open one or two for detail.',
    'Keep the summary short enough to decide from.',
    'Set `headingLevel` to fit the page outline.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move to the card’s toggle.' },
    { keys: ['Enter', 'Space'], action: 'Open or close the card.' },
  ],
  accessibility: [
    'A disclosure: the title is a button inside a heading, with `aria-expanded` and `aria-controls`.',
    'Focus does not move when the card opens or closes.',
    'Hidden details are removed from the page, so they are not read or reached while closed.',
  ],
  reducedMotion: 'The card opens and closes at once, without the spring or the fade.',
  props: [
    {
      kind: 'boolean',
      name: 'defaultOpen',
      label: 'Start open',
      description: 'Open on first render.',
      default: false,
    },
  ],
  files: ['ExpandableCard.tsx', 'expandable-card.css', 'index.ts'],
  dependencies: { react: '>=19', motion: '>=12' },
  registryDependencies: [
    'primitives/use-controllable-state',
    'primitives/use-reduced-motion',
    'icons/chevron-down',
    'tokens',
  ],
};

const harbours = [
  {
    name: 'Fowey',
    summary: 'All-tide river harbour, visitor moorings.',
    body: 'Enter between Gribbin Head and St Catherine’s Point. Visitor pontoons on the east bank; water taxi until late.',
  },
  {
    name: 'Salcombe',
    summary: 'Sheltered estuary behind a bar.',
    body: 'Cross the bar after half-flood in any swell. Plenty of visitor buoys in the Bag.',
  },
  {
    name: 'Dartmouth',
    summary: 'Deep, steep-sided river mouth.',
    body: 'Easy entry at any state of tide. Strong streams off the town quay on the ebb.',
  },
];

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'list',
      name: 'A list of harbours',
      description: 'Open one or more; the others move aside.',
      render: () => (
        <div style={{ display: 'grid', gap: 'var(--space-s)', width: 'min(28rem, 100%)' }}>
          {harbours.map((h) => (
            <ExpandableCard key={h.name} title={h.name} summary={h.summary} headingLevel={4}>
              <p>{h.body}</p>
            </ExpandableCard>
          ))}
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: 'min(28rem, 100%)' }}>
      <ExpandableCard
        key={String(values.defaultOpen)}
        title="Fowey"
        summary={harbours[0]!.summary}
        defaultOpen={Boolean(values.defaultOpen)}
        headingLevel={4}
      >
        <p>{harbours[0]!.body}</p>
      </ExpandableCard>
    </div>
  ),
};
