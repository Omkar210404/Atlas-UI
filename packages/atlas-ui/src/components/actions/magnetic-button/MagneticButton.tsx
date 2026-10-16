import { useSpring } from 'motion/react';
import { useEffect, useRef } from 'react';
import { springs } from '../../../tokens/tokens';
import { useReducedMotion } from '../../../primitives/use-reduced-motion';
import { Button, type ButtonProps } from '../button/Button';
import './magnetic-button.css';

export interface MagneticButtonProps extends ButtonProps {
  /** How far the button follows the pointer, from 0 (not at all) to 1 (fully). */
  strength?: number;
  /** Distance in px beyond the button's edge at which the pull begins. */
  reach?: number;
}

/**
 * A button that leans toward the pointer when it comes near, and settles back with a
 * spring when it leaves. The label leans a little further than the body, which gives the
 * button depth. Mouse and pen only; never under reduced motion.
 */
export function MagneticButton({
  strength = 0.35,
  reach = 56,
  className,
  disabled,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, springs.buoy);
  const y = useSpring(0, springs.buoy);
  const inactive = reduced || disabled || props['aria-disabled'] === 'true' || strength <= 0;

  // Write spring values straight to custom properties: no React render per frame.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = () => {
      el.style.setProperty('--atl-magnet-x', `${x.get().toFixed(2)}px`);
      el.style.setProperty('--atl-magnet-y', `${y.get().toFixed(2)}px`);
    };
    const offX = x.on('change', write);
    const offY = y.on('change', write);
    return () => {
      offX();
      offY();
    };
  }, [x, y]);

  useEffect(() => {
    if (inactive) {
      x.jump(0);
      y.jump(0);
      return;
    }
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Measure from the resting position: undo the current offset first.
        const cx = rect.left + rect.width / 2 - x.get();
        const cy = rect.top + rect.height / 2 - y.get();
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const near =
          Math.abs(dx) <= rect.width / 2 + reach && Math.abs(dy) <= rect.height / 2 + reach;
        const limit = Math.max(8, reach * 0.4);
        x.set(near ? Math.max(-limit, Math.min(limit, dx * strength)) : 0);
        y.set(near ? Math.max(-limit, Math.min(limit, dy * strength)) : 0);
      });
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [inactive, reach, strength, x, y]);

  return (
    <Button
      ref={ref}
      className={['atl-magnetic', className].filter(Boolean).join(' ')}
      disabled={disabled}
      data-magnetic={inactive ? undefined : ''}
      {...props}
    />
  );
}
