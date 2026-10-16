import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Carousel3D, type CarouselSlide } from './Carousel3D';

export const meta: ComponentMeta = {
  slug: 'carousel-3d',
  name: '3D carousel',
  category: 'spatial',
  summary: 'A ring of slides you rotate by key or button.',
  description: [
    'Slides arranged on a ring in CSS 3D. Turn it with the buttons, the arrow keys or the slide picker, and it takes the short way round to the slide you chose.',
    'It never turns on its own, so nothing moves without being asked and there is no need for a pause button. No WebGL.',
  ],
  usage: [
    'Use it for a handful of related items (three to eight) where seeing the neighbours helps.',
    'Give every slide a `label`; it names the slide in the picker and to screen readers.',
    'Pass `index` and `onIndexChange` to control it.',
  ],
  keyboard: [
    { keys: ['ArrowRight'], action: 'With focus in the carousel, turn to the next slide.' },
    { keys: ['ArrowLeft'], action: 'With focus in the carousel, turn to the previous slide.' },
    { keys: ['Tab'], action: 'Move between the controls and into the current slide.' },
    { keys: ['Enter', 'Space'], action: 'Use the focused control or picker dot.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA carousel pattern: a labelled region with `aria-roledescription="carousel"`, slides as groups with `aria-roledescription="slide"` and labels like “2 of 6: Fowey”.',
    'Only the current slide can be reached; the others are `inert` and hidden from assistive technology.',
    'Once you start turning it, slide changes are announced politely.',
    'Picker dots have 24 px targets and names; the current one is marked with `aria-current`.',
  ],
  reducedMotion: 'The ring jumps to the chosen slide without turning.',
  props: [
    {
      kind: 'number',
      name: 'count',
      label: 'Slides',
      description: 'How many slides.',
      default: 6,
      min: 3,
      max: 8,
      step: 1,
    },
  ],
  files: ['Carousel3D.tsx', 'carousel-3d.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'primitives/use-controllable-state',
    'icons/chevron-right',
    'tokens',
  ],
};

const harbours = [
  'Falmouth',
  'Fowey',
  'Plymouth',
  'Salcombe',
  'Dartmouth',
  'Poole',
  'Weymouth',
  'Brixham',
];

const slides = (count: number): CarouselSlide[] =>
  harbours.slice(0, count).map((name, i) => ({
    id: name.toLowerCase(),
    label: name,
    content: (
      <div style={{ display: 'grid', alignContent: 'space-between', height: '100%' }}>
        <p
          style={{ fontFamily: 'var(--font-prose)', fontStyle: 'italic', color: 'var(--ink-soft)' }}
        >
          Harbour guide {i + 1}
        </p>
        <h4 style={{ fontSize: 'var(--step-2)' }}>{name}</h4>
        <a href={`#${name.toLowerCase()}`}>Read the guide</a>
      </div>
    ),
  }));

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'harbours',
      name: 'Harbour guides',
      description: 'Six slides; turn with the arrows or the dots.',
      render: (instance) => (
        <Carousel3D
          label={['Harbour guides', instance].filter(Boolean).join(', ')}
          slides={slides(6)}
        />
      ),
    },
  ],
  Playground: ({ values }) => (
    <Carousel3D
      key={String(values.count)}
      label="Playground carousel"
      slides={slides(Number(values.count))}
    />
  ),
};
