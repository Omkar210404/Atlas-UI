import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useReducedMotion } from '../../../primitives/use-reduced-motion';
import './tilt-card.css';

export interface TiltCardProps {
  children: ReactNode;
  /** Largest tilt in degrees, at the card's edge. */
  maxTilt?: number;
  /** Show the contour sheen that follows the pointer. */
  sheen?: boolean;
  className?: string;
}

/**
 * A card that tilts toward the pointer, with a contour-line sheen that follows it. Tilt
 * angles are registered CSS properties, so the browser eases them; no animation loop runs.
 * Keyboard focus inside the card lifts it slightly instead.
 */
export function TiltCard({ children, maxTilt = 8, sheen = true, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--atl-tilt-x', `${((px - 0.5) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty('--atl-tilt-y', `${((0.5 - py) * 2 * maxTilt).toFixed(2)}deg`);
    el.style.setProperty('--atl-sheen-x', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--atl-sheen-y', `${(py * 100).toFixed(1)}%`);
    el.dataset.active = '';
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--atl-tilt-x', '0deg');
    el.style.setProperty('--atl-tilt-y', '0deg');
    delete el.dataset.active;
  };

  return (
    <div className={['atl-tilt', className].filter(Boolean).join(' ')}>
      <div
        ref={ref}
        className="atl-tilt__card"
        data-sheen={sheen && !reduced ? '' : undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {children}
      </div>
    </div>
  );
}
