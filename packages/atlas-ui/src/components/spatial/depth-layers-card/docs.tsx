import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { DepthLayersCard, type DepthLayer } from './DepthLayersCard';

export const meta: ComponentMeta = {
  slug: 'depth-layers-card',
  name: 'Depth-layers card',
  category: 'spatial',
  summary: 'Planes that separate in CSS 3D.',
  description: [
    'A card whose picture is a stack of flat planes — the sea, the contours, the labels — that lift apart in 3D when you hover the card or focus anything in it, the way a chart is built up from separate printing plates.',
    'It is pure CSS 3D: no canvas and no WebGL, so it costs almost nothing and works everywhere.',
  ],
  usage: [
    'Pass the planes back to front in `layers`; each one fills the picture area.',
    'Put the card’s readable content and actions in `children`; the picture is decorative.',
    'Use `spread` for how far the planes separate.',
  ],
  keyboard: [
    {
      keys: ['Tab'],
      action: 'Focus a control in the card; the planes open out while it has focus.',
    },
  ],
  accessibility: [
    'The layered picture is decorative and hidden from assistive technology; the content below carries the meaning.',
    'Keyboard focus inside the card opens it out just as hover does.',
  ],
  reducedMotion: 'The planes lie flat and do not move.',
  props: [
    {
      kind: 'number',
      name: 'spread',
      label: 'Spread',
      description: 'Distance between planes when open.',
      default: 22,
      min: 8,
      max: 40,
      step: 2,
      unit: 'px',
    },
  ],
  files: ['DepthLayersCard.tsx', 'depth-layers-card.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

const plate = (children: React.ReactNode, background?: string) => (
  <svg viewBox="0 0 200 120" style={{ background, borderRadius: 8 }}>
    {children}
  </svg>
);

const layers: DepthLayer[] = [
  { id: 'sea', content: plate(null, 'var(--reef)') },
  {
    id: 'land',
    content: plate(
      <path
        d="M30 90c10-30 40-50 70-46s50 30 70 16v40H30z"
        fill="var(--shoal)"
        stroke="var(--isobath)"
      />,
    ),
  },
  {
    id: 'contours',
    content: plate(
      <g fill="none" stroke="var(--ink-soft)" strokeWidth="1">
        <path d="M50 92c12-20 34-34 56-32s38 18 54 10" />
        <path d="M70 94c10-12 24-20 38-18s24 10 34 6" />
      </g>,
    ),
  },
  {
    id: 'labels',
    content: plate(
      <>
        <circle cx="150" cy="40" r="4" fill="var(--chart-magenta)" />
        <text
          x="160"
          y="44"
          fontSize="11"
          fontStyle="italic"
          fill="var(--ink)"
          style={{ fontFamily: 'var(--font-prose)' }}
        >
          Fowey
        </text>
      </>,
    ),
  },
];

function Card({ spread }: { spread?: number }) {
  return (
    <div style={{ width: 'min(20rem, 100%)' }}>
      <DepthLayersCard layers={layers} spread={spread}>
        <h3 style={{ fontSize: 'var(--step-1)' }}>Fowey approaches</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }}>
          Four plates: sea, land, contours, names.
        </p>
        <Button size="s" style={{ justifySelf: 'start' }}>
          Open chart
        </Button>
      </DepthLayersCard>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'plates',
      name: 'Chart plates',
      description: 'Hover, or tab to the button, to lift the plates apart.',
      render: () => <Card />,
    },
  ],
  Playground: ({ values }) => <Card spread={Number(values.spread)} />,
};
