import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { AmbientBackground } from './AmbientBackground';

export const meta: ComponentMeta = {
  slug: 'ambient-background',
  name: 'WebGL ambient background',
  category: 'spatial',
  summary: 'A slow contour field behind the page.',
  description: [
    'A field of contour lines that drifts slowly behind the content and leans a little toward the pointer, as if the sea floor were shifting under the chart. The atlas on this site uses it behind its islands.',
    'It is a TSL shader for three.js’s WebGPURenderer, which uses WebGPU where available and falls back to WebGL2. Isolines are drawn with screen-space derivatives, so they stay one pixel wide at any size.',
  ],
  usage: [
    'Place it absolutely behind your content; it fills its own box.',
    'three.js loads only when the component mounts, so it never weighs on a first page load. Load it after the page is interactive.',
    'Use `renderer="none"` to show the static pattern, for example on low-power devices.',
  ],
  keyboard: [],
  accessibility: [
    'Decorative: hidden from assistive technology and ignores pointer events.',
    'Never required: where WebGPU and WebGL2 are both missing, or loading fails, a static CSS contour pattern is shown instead.',
    'Pauses when off screen or when the tab is hidden, and holds one still frame under reduced motion.',
    'The pixel ratio is capped at 1.5 to limit GPU work on high-density screens.',
  ],
  reducedMotion: 'Draws a single still frame of the field.',
  props: [
    {
      kind: 'select',
      name: 'renderer',
      label: 'Renderer',
      description: 'Try WebGPU, force WebGL2, or show the still pattern.',
      default: 'auto',
      options: [
        { value: 'auto', label: 'WebGPU or WebGL2' },
        { value: 'webgl', label: 'WebGL2' },
        { value: 'none', label: 'Still pattern' },
      ],
    },
    {
      kind: 'number',
      name: 'density',
      label: 'Contours',
      description: 'Lines across the field.',
      default: 9,
      min: 3,
      max: 18,
      step: 1,
    },
    {
      kind: 'number',
      name: 'speed',
      label: 'Drift',
      description: 'How fast it moves.',
      default: 0.05,
      min: 0,
      max: 0.2,
      step: 0.01,
    },
  ],
  files: ['AmbientBackground.tsx', 'ambient-background.css', 'index.ts'],
  dependencies: { react: '>=19', three: '>=0.180' },
  registryDependencies: ['primitives/three-host', 'primitives/use-reduced-motion', 'tokens'],
};

const frame = (child: React.ReactNode) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '16rem',
      borderRadius: 'var(--radius-panel)',
      overflow: 'hidden',
    }}
  >
    {child}
  </div>
);

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'field',
      name: 'Contour field',
      description: 'WebGPU where available, WebGL2 otherwise.',
      render: () => frame(<AmbientBackground className="atl-fill" />),
    },
    {
      id: 'still',
      name: 'Still fallback',
      description: 'What browsers without 3D rendering see.',
      render: () => frame(<AmbientBackground renderer="none" className="atl-fill" />),
    },
  ],
  Playground: ({ values }) =>
    frame(
      <AmbientBackground
        key={String(values.renderer)}
        className="atl-fill"
        renderer={values.renderer as 'auto' | 'webgl' | 'none'}
        density={Number(values.density)}
        speed={Number(values.speed)}
      />,
    ),
};
