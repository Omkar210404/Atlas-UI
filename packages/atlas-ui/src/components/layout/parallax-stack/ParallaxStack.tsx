import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../../primitives/use-reduced-motion';
import './parallax-stack.css';

export interface ParallaxLayer {
  id: string;
  content: ReactNode;
  /** 0 stays still; 1 moves the most. Far layers small, near layers large. */
  depth: number;
}

export interface ParallaxStackProps {
  layers: readonly ParallaxLayer[];
  /** Height of the frame. */
  height?: string;
  /** Distance in px the nearest layer travels over a full pass through the viewport. */
  travel?: number;
  /** Text alternative for the whole scene, or leave empty if it is decorative. */
  label?: string;
  className?: string;
}

const supportsViewTimeline = () =>
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

/**
 * Layers that drift at different speeds as the frame scrolls through the viewport. Uses a
 * CSS scroll-driven animation where supported (no script runs while scrolling), and a
 * small scroll listener elsewhere.
 */
export function ParallaxStack({
  layers,
  height = '20rem',
  travel = 80,
  label,
  className,
}: ParallaxStackProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || supportsViewTimeline() || prefersReducedMotion()) return;
    // Fallback: progress through the viewport, 0 when entering, 1 when leaving.
    let frame = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      el.style.setProperty('--atl-parallax-p', Math.min(Math.max(progress, 0), 1).toFixed(3));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={['atl-parallax', className].filter(Boolean).join(' ')}
      style={{ height, '--atl-parallax-travel': `${travel}px` } as React.CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="atl-parallax__layer"
          style={{ '--atl-depth': layer.depth } as React.CSSProperties}
        >
          {layer.content}
        </div>
      ))}
    </div>
  );
}
