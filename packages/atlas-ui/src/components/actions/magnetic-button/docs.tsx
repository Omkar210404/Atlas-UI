import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import type { ButtonVariant } from '../button/Button';
import { MagneticButton } from './MagneticButton';

export const meta: ComponentMeta = {
  slug: 'magnetic-button',
  name: 'Magnetic button',
  category: 'actions',
  summary: 'A button that leans toward the pointer.',
  description: [
    'When the pointer comes near, the button leans toward it and its label leans a little further, as if pulled by a current. When the pointer leaves, a spring brings it back to rest.',
    'A faint contour ring shows the extent of the pull; pressing tightens it onto the button. The effect is for mouse and pen only. With touch, keyboard or reduced motion it is an ordinary button.',
  ],
  usage: [
    'Reserve it for one or two inviting actions, such as the main call to action on a page. A whole toolbar of magnets is tiring.',
    'Keep `strength` below 0.5 so the target stays where people expect it.',
    'It accepts every Button prop: `variant`, `size`, `icon`, and the rest.',
  ],
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'Activate the button.' },
    { keys: ['Tab'], action: 'Move focus to and from the button. Focus never moves it.' },
  ],
  accessibility: [
    'A native `<button>`; the pull is purely visual and never changes focus or the accessible name.',
    'The pull is capped at 40% of the reach (at least 8 px), so the button never leaves its own footprint.',
    'Movement is driven by the pointer only. Touch input is ignored, so a tap lands where it was aimed.',
    'Spring updates write CSS variables directly, so no React render runs per frame.',
  ],
  reducedMotion:
    'The button does not move and the field ring does not appear. It behaves exactly like Button.',
  props: [
    {
      kind: 'number',
      name: 'strength',
      label: 'Strength',
      description: 'How far it follows the pointer.',
      default: 0.35,
      min: 0,
      max: 0.8,
      step: 0.05,
    },
    {
      kind: 'number',
      name: 'reach',
      label: 'Reach',
      description: 'Distance beyond the edge where the pull starts.',
      default: 56,
      min: 16,
      max: 120,
      step: 4,
      unit: 'px',
    },
    {
      kind: 'select',
      name: 'variant',
      label: 'Variant',
      description: 'Button emphasis.',
      default: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'quiet', label: 'Quiet' },
      ],
    },
  ],
  files: ['MagneticButton.tsx', 'magnetic-button.css', 'index.ts'],
  dependencies: { react: '>=19', motion: '>=12' },
  registryDependencies: ['actions/button', 'primitives/use-reduced-motion', 'tokens'],
};

function Launch({
  strength,
  reach,
  variant,
}: {
  strength?: number;
  reach?: number;
  variant?: ButtonVariant;
}) {
  const [launched, setLaunched] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <MagneticButton
        variant={variant ?? 'primary'}
        size="l"
        strength={strength}
        reach={reach}
        icon={<IconAnchor />}
        onClick={() => setLaunched((l) => !l)}
      >
        {launched ? 'Weigh anchor' : 'Drop anchor'}
      </MagneticButton>
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }} aria-live="polite">
        {launched ? 'Anchored.' : 'Under way.'}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'call-to-action',
      name: 'Call to action',
      description: 'A large primary button with the default pull.',
      render: () => <Launch />,
    },
    {
      id: 'gentle',
      name: 'Gentle pull',
      description: 'Low strength and a short reach, for secondary actions.',
      render: () => <Launch variant="secondary" strength={0.18} reach={32} />,
    },
    {
      id: 'strong',
      name: 'Strong pull',
      description: 'A wide field that is easy to feel.',
      render: () => <Launch strength={0.5} reach={100} />,
    },
  ],
  Playground: ({ values }) => (
    <Launch
      strength={Number(values.strength)}
      reach={Number(values.reach)}
      variant={values.variant as ButtonVariant}
    />
  ),
};
