import { durations, easings } from '../tokens/tokens';
import { prefersReducedMotion } from '../primitives/use-reduced-motion';

export type Easing = (t: number) => number;

/** CSS-equivalent cubic-bezier easing, solved with Newton-Raphson and a bisection fallback. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Easing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-6) return t;
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const value = sampleX(t);
      if (Math.abs(value - x) < 1e-6) return t;
      if (x > value) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return t;
  };

  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}

/** The named easings from the token file, as functions. */
export const ease = {
  anchor: cubicBezier(...easings.anchor),
  drift: cubicBezier(...easings.drift),
  ebb: cubicBezier(...easings.ebb),
};

export { durations };

interface TweenOptions {
  duration: number;
  ease?: Easing;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * Runs `onUpdate` with eased progress from 0 to 1 on animation frames.
 * Under reduced motion it jumps straight to 1. Returns a function that cancels it.
 */
export function tween({ duration, ease: easing = ease.drift, onUpdate, onComplete }: TweenOptions) {
  if (duration <= 0 || prefersReducedMotion()) {
    onUpdate(1);
    onComplete?.();
    return () => {};
  }
  let frame = 0;
  let start: number | null = null;
  const step = (now: number) => {
    start ??= now;
    const t = Math.min((now - start) / duration, 1);
    onUpdate(easing(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else onComplete?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
