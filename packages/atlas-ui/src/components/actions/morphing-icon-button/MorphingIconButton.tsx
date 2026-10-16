import { useEffect, useRef, useState } from 'react';
import { ease, tween } from '../../../motion/tween';
import { durations } from '../../../tokens/tokens';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { Button, type ButtonProps } from '../button/Button';
import { glyphPath, glyphs, type GlyphName } from './glyphs';
import './morphing-icon-button.css';

export interface MorphingIconButtonProps extends Omit<
  ButtonProps,
  'icon' | 'children' | 'aria-pressed' | 'onChange'
> {
  /** Which pair of shapes to morph between. */
  glyph: GlyphName;
  /** Accessible name. It stays the same in both states; `aria-pressed` carries the state. */
  label: string;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/**
 * A toggle button whose icon reshapes from one state to the other: the play triangle
 * splits into pause bars, menu bars rotate into a cross. Shapes are interpolated in
 * JavaScript, so the morph works in every browser.
 */
export function MorphingIconButton({
  glyph,
  label,
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  onClick,
  ...props
}: MorphingIconButtonProps) {
  const [pressed, setPressed] = useControllableState({
    value: pressedProp,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useRef(pressed ? 1 : 0);
  const shape = glyphs[glyph];
  // React renders the first shape only; the effect owns `d` afterwards, so a re-render
  // can never snap the path to its end state in the middle of a morph.
  const [initialPath] = useState(() => glyphPath(shape, pressed ? 1 : 0));

  useEffect(() => {
    const from = progress.current;
    const to = pressed ? 1 : 0;
    if (from === to) {
      pathRef.current?.setAttribute('d', glyphPath(shape, to));
      return;
    }
    return tween({
      duration: durations.glide,
      ease: ease.anchor,
      onUpdate: (t) => {
        progress.current = from + (to - from) * t;
        pathRef.current?.setAttribute('d', glyphPath(shape, progress.current));
      },
    });
  }, [pressed, shape]);

  return (
    <Button
      {...props}
      className={['atl-morph', props.className].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={pressed}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setPressed((p) => !p);
      }}
      icon={
        <svg viewBox="0 0 24 24" width="24" height="24" className="atl-morph__glyph">
          <path ref={pathRef} d={initialPath} />
        </svg>
      }
    />
  );
}
