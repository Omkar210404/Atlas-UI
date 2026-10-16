import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import type { ButtonVariant } from '../button/Button';
import type { GlyphName } from './glyphs';
import { MorphingIconButton } from './MorphingIconButton';

export const meta: ComponentMeta = {
  slug: 'morphing-icon-button',
  name: 'Morphing icon button',
  category: 'actions',
  summary: 'A toggle whose icon reshapes between states.',
  description: [
    'An icon toggle that shows its new state by changing shape rather than swapping pictures: the play triangle splits into two pause bars, the menu’s bars rotate into a cross.',
    'Polygons are interpolated point by point and bars by angle and length, so the shape stays solid through the whole change and the morph runs the same in every browser.',
  ],
  usage: [
    'Give it a `label` that names the thing being toggled, such as “Play” or “Menu”. The label stays the same; the pressed state tells assistive technology whether it is on.',
    'Use `pressed` and `onPressedChange` to control it, or `defaultPressed` to let it manage itself.',
    'Available glyphs: `play-pause`, `menu-close` and `plus-close`.',
  ],
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'Toggle the state.' },
    { keys: ['Tab'], action: 'Move focus to and from the button.' },
  ],
  accessibility: [
    'A toggle button: a native `<button>` with `aria-pressed`, following the WAI-ARIA button pattern.',
    'The accessible name does not change between states, as the pattern recommends; screen readers announce “pressed” or “not pressed”.',
    'The icon is decorative (`aria-hidden`); the name comes from `label`.',
    'Pressed buttons also get a tinted fill and outline, so the state is not carried by the shape alone.',
  ],
  reducedMotion: 'The icon switches to its new shape at once, without the morph.',
  props: [
    {
      kind: 'select',
      name: 'glyph',
      label: 'Glyph',
      description: 'Which pair of shapes to morph between.',
      default: 'play-pause',
      options: [
        { value: 'play-pause', label: 'Play and pause' },
        { value: 'menu-close', label: 'Menu and close' },
        { value: 'plus-close', label: 'Plus and close' },
      ],
    },
    {
      kind: 'select',
      name: 'variant',
      label: 'Variant',
      description: 'Button emphasis.',
      default: 'secondary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'quiet', label: 'Quiet' },
      ],
    },
    {
      kind: 'select',
      name: 'size',
      label: 'Size',
      description: 'Button height.',
      default: 'l',
      options: [
        { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' },
        { value: 'l', label: 'Large' },
      ],
    },
  ],
  files: ['MorphingIconButton.tsx', 'glyphs.ts', 'morphing-icon-button.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['actions/button', 'motion/tween', 'primitives/use-controllable-state', 'tokens'],
};

function Player() {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-m)' }}>
      <MorphingIconButton glyph="play-pause" label="Play" variant="primary" size="l" pressed={playing} onPressedChange={setPlaying} />
      <span style={{ fontFamily: 'var(--font-prose)', fontSize: 'var(--step-1)' }} aria-live="polite">
        {playing ? 'Playing the tide recording' : 'Tide recording, paused'}
      </span>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    { id: 'player', name: 'Play and pause', description: 'A controlled toggle with a status line beside it.', render: () => <Player /> },
    {
      id: 'menu',
      name: 'Menu toggle',
      description: 'Three bars rotate into a cross.',
      render: () => <MorphingIconButton glyph="menu-close" label="Menu" size="l" />,
    },
    {
      id: 'set',
      name: 'Icon set',
      description: 'Every glyph, quiet and compact.',
      render: () => (
        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          <MorphingIconButton glyph="play-pause" label="Play" variant="quiet" />
          <MorphingIconButton glyph="menu-close" label="Menu" variant="quiet" />
          <MorphingIconButton glyph="plus-close" label="Add layer" variant="quiet" />
        </div>
      ),
    },
  ],
  Playground: ({ values }) => (
    <MorphingIconButton
      key={String(values.glyph)}
      glyph={values.glyph as GlyphName}
      label="Playground toggle"
      variant={values.variant as ButtonVariant}
      size={values.size as 's' | 'm' | 'l'}
    />
  ),
};
