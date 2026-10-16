import { useEffect, useRef, useState } from 'react';
import {
  canRender3d,
  startHost,
  tokenColour,
  type RendererChoice,
} from '../../../primitives/three-host';
import './ambient-background.css';

export interface AmbientBackgroundProps {
  /** `auto` tries WebGPU then WebGL2; `webgl` forces WebGL2; `none` shows the still fallback. */
  renderer?: RendererChoice | 'none';
  /** Contour lines across the field. */
  density?: number;
  /** How fast the field drifts. 0 holds it still. */
  speed?: number;
  className?: string;
}

type Status = 'loading' | 'running' | 'fallback';

/**
 * A slow field of contour lines, drawn by a TSL shader on WebGPU (or WebGL2), drifting
 * behind the page and leaning a little toward the pointer. Decorative: hidden from
 * assistive technology, paused when off screen, still under reduced motion, and replaced by
 * a static SVG pattern where 3D rendering is unavailable.
 */
export function AmbientBackground({
  renderer = 'auto',
  density = 9,
  speed = 0.05,
  className,
}: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>(() =>
    renderer === 'none' || (typeof window !== 'undefined' && !canRender3d())
      ? 'fallback'
      : 'loading',
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || renderer === 'none' || !canRender3d()) return;
    let stop: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      const tsl = await import('../../../primitives/three-core');
      const {
        uniform,
        uv,
        vec2,
        vec3,
        mix,
        abs,
        fract,
        fwidth,
        smoothstep,
        mx_noise_float,
        float,
      } = tsl;
      stop = await startHost(
        canvas,
        (three, scene) => {
          const root = canvas.parentElement ?? document.documentElement;
          const deep = uniform(new three.Color(tokenColour(root, '--sea')));
          const line = uniform(new three.Color(tokenColour(root, '--isobath')));
          const time = uniform(0);
          const aspect = uniform(1);
          const lean = uniform(new three.Vector2(0, 0));
          const levels = uniform(density);

          // Height field: smooth noise in 3D (x, y, time) leaning toward the pointer.
          const p = uv().sub(0.5).mul(vec2(aspect, 1)).mul(2.4).add(lean.mul(0.12));
          const height = mx_noise_float(vec3(p, time)).mul(0.5).add(0.5).mul(levels);
          // Distance to the nearest whole level, in screen pixels via fwidth: crisp 1px isolines.
          const distance = abs(fract(height.add(0.5)).sub(0.5));
          const isoline = float(1).sub(smoothstep(float(0), fwidth(height).mul(1.2), distance));

          const material = new three.MeshBasicNodeMaterial();
          material.colorNode = mix(deep, line, isoline.mul(0.7));
          scene.add(new three.Mesh(new three.PlaneGeometry(2, 2), material));

          return {
            frame: ({ delta, pointer }) => {
              time.value += delta * speed;
              const target = pointer ?? { x: 0, y: 0 };
              lean.value.x += (target.x - lean.value.x) * Math.min(delta * 2, 1);
              lean.value.y += (target.y - lean.value.y) * Math.min(delta * 2, 1);
            },
            resize: (w, h) => {
              aspect.value = w / h;
            },
            theme: () => {
              deep.value.set(tokenColour(root, '--sea'));
              line.value.set(tokenColour(root, '--isobath'));
            },
            dispose: () => material.dispose(),
          };
        },
        { renderer: renderer === 'webgl' ? 'webgl' : 'auto' },
      );
      if (cancelled) stop();
      else setStatus('running');
    })().catch(() => {
      if (!cancelled) setStatus('fallback');
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [renderer, density, speed]);

  return (
    <div
      className={['atl-ambient', className].filter(Boolean).join(' ')}
      data-status={status}
      aria-hidden="true"
    >
      <div className="atl-ambient__fallback" />
      {status !== 'fallback' ? <canvas ref={canvasRef} className="atl-ambient__canvas" /> : null}
    </div>
  );
}
