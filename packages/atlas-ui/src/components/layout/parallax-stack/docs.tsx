import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { ParallaxStack, type ParallaxLayer } from './ParallaxStack';

export const meta: ComponentMeta = {
  slug: 'parallax-stack',
  name: 'Parallax stack',
  category: 'layout',
  summary: 'Layers that drift at different speeds as you scroll.',
  description: [
    'A framed scene of layers, far to near, that move at different speeds as the frame scrolls through the window, so flat shapes read as distance: headlands behind headlands behind the sea.',
    'Where the browser supports scroll-driven animations, the movement is pure CSS and no script runs while you scroll. Elsewhere a small scroll listener does the same job.',
  ],
  usage: [
    'Give far layers a small `depth` (0.1–0.3) and near layers a larger one (0.6–1).',
    'Keep the movement modest; `travel` of 60–100 px is plenty.',
    'If the scene carries meaning, pass `label` to describe it; otherwise it is hidden from assistive technology as decoration.',
  ],
  keyboard: [],
  accessibility: [
    'With a `label` the scene is an image with that text alternative; without one it is hidden as decoration.',
    'Movement is tied to scrolling the person controls; nothing moves on its own.',
  ],
  reducedMotion: 'The layers stay in place.',
  props: [
    {
      kind: 'number',
      name: 'travel',
      label: 'Travel',
      description: 'How far the nearest layer moves.',
      default: 80,
      min: 20,
      max: 160,
      step: 10,
      unit: 'px',
    },
  ],
  files: ['ParallaxStack.tsx', 'parallax-stack.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-reduced-motion', 'tokens'],
};

const ridge = (d: string, fill: string) => (
  <svg
    viewBox="0 0 400 120"
    preserveAspectRatio="none"
    style={{ display: 'block', height: '9rem' }}
  >
    <path d={d} fill={fill} />
  </svg>
);

const scene: ParallaxLayer[] = [
  {
    id: 'far',
    depth: 0.15,
    content: ridge(
      'M0 120V70c40-10 70-30 110-26s70 20 110 10 90-30 180-12v78z',
      'color-mix(in oklch, var(--isobath) 35%, var(--sea-1))',
    ),
  },
  {
    id: 'mid',
    depth: 0.45,
    content: ridge(
      'M0 120V84c50-6 90-36 150-30s80 26 130 22 80-14 120-6v50z',
      'color-mix(in oklch, var(--isobath) 60%, var(--sea-1))',
    ),
  },
  {
    id: 'near',
    depth: 0.8,
    content: ridge('M0 120V96c60 4 110-18 170-14s100 18 230 6v32z', 'var(--reef)'),
  },
  {
    id: 'sea',
    depth: 1,
    content: ridge(
      'M0 120v-14c25-6 50 6 75 0s50-6 75 0 50 6 75 0 50-6 75 0 50 6 100 0v14z',
      'var(--shoal)',
    ),
  },
];

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'coast',
      name: 'Headlands',
      description: 'Four layers; scroll the page to see them part.',
      render: () => (
        <div style={{ width: '100%' }}>
          <ParallaxStack layers={scene} label="Headlands receding into the distance over the sea" />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <div style={{ width: '100%' }}>
      <ParallaxStack layers={scene} travel={Number(values.travel)} />
    </div>
  ),
};
