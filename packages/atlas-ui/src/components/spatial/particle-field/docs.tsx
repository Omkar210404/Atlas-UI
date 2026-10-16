import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { ParticleField } from './ParticleField';

export const meta: ComponentMeta = {
  slug: 'particle-field',
  name: 'Cursor-reactive particle field',
  category: 'spatial',
  summary: 'Particles that drift and part around the cursor.',
  description: [
    'Hundreds of particles drifting along a smooth, slowly changing current, like plankton in a tideway. Move the pointer through them and they part around it, then close behind.',
    'They are drawn as one instanced mesh with three.js’s WebGPURenderer (WebGPU, or WebGL2 as a fallback), so a thousand particles cost one draw call.',
  ],
  usage: [
    'Use it as a decorative panel or hero background, not behind body text.',
    'Lower `count` on small panels; 600–1000 is plenty for most.',
    'three.js loads only when the component mounts.',
  ],
  keyboard: [],
  accessibility: [
    'Decorative: hidden from assistive technology; nothing in it can be operated.',
    'Never required: a still dot pattern is shown where 3D rendering is unavailable.',
    'Pauses when off screen or when the tab is hidden, and holds still under reduced motion.',
  ],
  reducedMotion: 'Draws one still frame of the particles.',
  props: [
    {
      kind: 'number',
      name: 'count',
      label: 'Particles',
      description: 'How many.',
      default: 900,
      min: 200,
      max: 3000,
      step: 100,
    },
    {
      kind: 'number',
      name: 'reach',
      label: 'Cursor reach',
      description: 'How wide a gap the pointer opens.',
      default: 0.4,
      min: 0.1,
      max: 0.8,
      step: 0.05,
    },
  ],
  files: ['ParticleField.tsx', 'particle-field.css', 'index.ts'],
  dependencies: { react: '>=19', three: '>=0.180' },
  registryDependencies: ['primitives/three-host', 'primitives/use-reduced-motion', 'tokens'],
};

const frame = (child: React.ReactNode) => (
  <div style={{ position: 'relative', width: '100%', height: '16rem' }}>{child}</div>
);

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'tideway',
      name: 'Tideway',
      description: 'Move the pointer through the field.',
      render: () => frame(<ParticleField className="atl-fill" />),
    },
    {
      id: 'still',
      name: 'Still fallback',
      description: 'What browsers without 3D rendering see.',
      render: () => frame(<ParticleField renderer="none" className="atl-fill" />),
    },
  ],
  Playground: ({ values }) =>
    frame(
      <ParticleField
        key={`${values.count}`}
        className="atl-fill"
        count={Number(values.count)}
        reach={Number(values.reach)}
      />,
    ),
};
