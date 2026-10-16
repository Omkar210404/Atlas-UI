import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { EmptyState } from './EmptyState';
import { illustrations, type IllustrationName } from './illustrations';

export const meta: ComponentMeta = {
  slug: 'empty-states',
  name: 'Empty-state illustrations',
  category: 'feedback',
  summary: 'Original chart-style illustrations for empty screens.',
  description: [
    'Six line drawings made for atlas-ui, in the same hand as the chart: a blank chart sheet, an anchor on the seabed, a lone buoy, a lighthouse gone dark, a bottle adrift and a fog bank.',
    'Paired with a plain title and a next step, they turn an empty screen into a direction instead of a dead end. They follow the theme through `currentColor` and the token colours.',
  ],
  usage: [
    'Say what is empty, then what to do: “No anchorages saved. Drop an anchor on the chart to save one.”',
    'Match the drawing to the situation: `uncharted` for nothing yet, `anchor` or `fog` for no results, `lighthouse` for offline or failed, `bottle` for no messages, `buoy` for an empty list.',
    'Set `headingLevel` so the title fits the page’s heading outline.',
  ],
  keyboard: [],
  accessibility: [
    'The illustrations are decorative (`aria-hidden`); the title and description carry the message.',
    'The title is a real heading at the level you choose.',
    'Lines use theme tokens, so the drawings keep their contrast in both themes and in forced colours.',
  ],
  reducedMotion: 'Nothing moves; the drawings are still.',
  props: [
    {
      kind: 'select',
      name: 'illustration',
      label: 'Illustration',
      description: 'Which drawing.',
      default: 'uncharted',
      options: Object.keys(illustrations).map((name) => ({
        value: name,
        label: name[0]!.toUpperCase() + name.slice(1),
      })),
    },
    {
      kind: 'text',
      name: 'title',
      label: 'Title',
      description: 'What is empty.',
      default: 'No anchorages saved',
    },
    {
      kind: 'boolean',
      name: 'action',
      label: 'Action',
      description: 'Show a next step.',
      default: true,
    },
  ],
  files: ['EmptyState.tsx', 'illustrations.tsx', 'empty-states.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

const gallery: Array<[IllustrationName, string]> = [
  ['uncharted', 'Nothing charted yet'],
  ['anchor', 'No results'],
  ['buoy', 'An empty list'],
  ['lighthouse', 'Offline'],
  ['bottle', 'No messages'],
  ['fog', 'Nothing matched'],
];

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'saved',
      name: 'Empty list with a next step',
      description: 'A title that says what is missing and a button that fixes it.',
      render: () => (
        <EmptyState
          illustration="uncharted"
          title="No anchorages saved"
          description="Drop an anchor on the chart to save your first one."
          action={<Button variant="primary">Open the chart</Button>}
        />
      ),
    },
    {
      id: 'gallery',
      name: 'All six drawings',
      description: 'The full set.',
      render: () => (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
            gap: 'var(--space-s)',
            width: '100%',
          }}
        >
          {gallery.map(([name, title]) => (
            <EmptyState key={name} illustration={name} title={title} headingLevel={4} />
          ))}
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <EmptyState
      illustration={values.illustration as IllustrationName}
      title={String(values.title) || 'Empty'}
      description="A plain sentence about what to do next."
      action={values.action ? <Button>Take the next step</Button> : undefined}
    />
  ),
};
