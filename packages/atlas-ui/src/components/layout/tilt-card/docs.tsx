import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { TiltCard } from './TiltCard';

export const meta: ComponentMeta = {
  slug: 'tilt-card',
  name: 'Tilt card',
  category: 'layout',
  summary: 'A card that tilts toward the pointer.',
  description: [
    'A card that leans toward the pointer as it moves across it, with a sheen of contour rings centred under the pointer, like light catching an embossed chart.',
    'The tilt angles are registered CSS properties, so the browser eases them toward each new value; no animation loop runs. Keyboard users get a small lift when focus is inside the card instead.',
  ],
  usage: [
    'Use it for a few showcase cards, not for every card in a list.',
    'Keep `maxTilt` small (under 10°) so text stays easy to read.',
    'Put real controls inside: links and buttons work normally while it tilts.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move to the controls inside; the card lifts while one is focused.' },
  ],
  accessibility: [
    'The card is a plain container; it adds no role and no Tab stop of its own.',
    'Tilt is pointer-only and never needed to read or use the content.',
    'The sheen is decorative and ignores pointer events.',
  ],
  reducedMotion: 'The card stays flat; there is no tilt and no sheen.',
  props: [
    {
      kind: 'number',
      name: 'maxTilt',
      label: 'Largest tilt',
      description: 'At the card’s edge.',
      default: 8,
      min: 2,
      max: 16,
      step: 1,
      unit: '°',
    },
    {
      kind: 'boolean',
      name: 'sheen',
      label: 'Sheen',
      description: 'Contour rings under the pointer.',
      default: true,
    },
  ],
  files: ['TiltCard.tsx', 'tilt-card.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['primitives/use-reduced-motion', 'tokens'],
};

function Card({ maxTilt, sheen }: { maxTilt?: number; sheen?: boolean }) {
  return (
    <div style={{ width: 'min(20rem, 100%)' }}>
      <TiltCard maxTilt={maxTilt} sheen={sheen}>
        <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
          <p
            style={{
              fontFamily: 'var(--font-prose)',
              fontStyle: 'italic',
              color: 'var(--ink-soft)',
            }}
          >
            Chart 32
          </p>
          <h3 style={{ fontSize: 'var(--step-2)' }}>Falmouth Harbour</h3>
          <p style={{ color: 'var(--ink-soft)' }}>1 : 12,500. Soundings in metres.</p>
          <Button size="s" style={{ justifySelf: 'start' }}>
            Open chart
          </Button>
        </div>
      </TiltCard>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'chart',
      name: 'Chart card',
      description: 'Default tilt and sheen, with a button inside.',
      render: () => <Card />,
    },
    {
      id: 'subtle',
      name: 'Subtle',
      description: 'A gentler tilt without the sheen.',
      render: () => <Card maxTilt={4} sheen={false} />,
    },
  ],
  Playground: ({ values }) => (
    <Card maxTilt={Number(values.maxTilt)} sheen={Boolean(values.sheen)} />
  ),
};
