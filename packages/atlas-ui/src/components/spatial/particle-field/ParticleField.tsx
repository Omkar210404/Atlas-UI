import { useEffect, useRef, useState } from 'react';
import {
  canRender3d,
  startHost,
  tokenColour,
  type RendererChoice,
} from '../../../primitives/three-host';
import './particle-field.css';

export interface ParticleFieldProps {
  /** Number of particles. */
  count?: number;
  /** Radius, in field units (the field is 2 high), within which particles part around the pointer. */
  reach?: number;
  renderer?: RendererChoice | 'none';
  className?: string;
}

type Status = 'loading' | 'running' | 'fallback';

/** A smooth, slowly changing flow field: the direction a particle at (x, y) drifts. */
export function flowAngle(x: number, y: number, t: number): number {
  return (
    Math.sin(y * 2.1 + t * 0.35) * 1.4 +
    Math.cos(x * 1.6 - t * 0.25) * 1.1 +
    Math.sin((x + y) * 0.9) * 0.6
  );
}

/**
 * Particles that drift along a flow field like plankton in a current, and part around the
 * cursor. Drawn as one instanced mesh, so it renders the same on WebGPU and WebGL2.
 * Decorative: hidden from assistive technology, paused off screen, still under reduced motion.
 */
export function ParticleField({
  count = 900,
  reach = 0.4,
  renderer = 'auto',
  className,
}: ParticleFieldProps) {
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

    startHost(
      canvas,
      (three, scene, _info, camera) => {
        const root = canvas.parentElement ?? document.documentElement;
        const material = new three.MeshBasicMaterial({
          color: tokenColour(root, '--ink-soft'),
          transparent: true,
          opacity: 0.75,
        });
        const mesh = new three.InstancedMesh(new three.CircleGeometry(1, 6), material, count);
        scene.add(mesh);

        let aspect = 1;
        // Seeded positions, so the field starts the same way every time.
        let seed = 7;
        const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const x = new Float32Array(count);
        const y = new Float32Array(count);
        const size = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          x[i] = random() * 2 - 1;
          y[i] = random() * 2 - 1;
          size[i] = 0.004 + random() * 0.006;
        }

        const write = () => {
          const m = mesh.instanceMatrix.array as Float32Array;
          for (let i = 0; i < count; i++) {
            const o = i * 16;
            m[o] = size[i]!;
            m[o + 5] = size[i]!;
            m[o + 10] = 1;
            m[o + 12] = x[i]! * aspect;
            m[o + 13] = y[i]!;
            m[o + 15] = 1;
          }
          mesh.instanceMatrix.needsUpdate = true;
        };
        write();

        return {
          frame: ({ time, delta, pointer }) => {
            const px = pointer ? pointer.x : 9;
            const py = pointer ? pointer.y : 9;
            for (let i = 0; i < count; i++) {
              const angle = flowAngle(x[i]!, y[i]!, time);
              let vx = Math.cos(angle) * 0.06;
              let vy = Math.sin(angle) * 0.06;
              const dx = x[i]! - px;
              const dy = y[i]! - py;
              const d = Math.hypot(dx * aspect, dy);
              if (d < reach && d > 1e-4) {
                const push = (1 - d / reach) * 1.2;
                vx += (dx / d) * push;
                vy += (dy / d) * push;
              }
              x[i] = x[i]! + vx * delta;
              y[i] = y[i]! + vy * delta;
              // Wrap at the edges so the field never empties.
              if (x[i]! > 1.05) x[i] = -1.05;
              if (x[i]! < -1.05) x[i] = 1.05;
              if (y[i]! > 1.05) y[i] = -1.05;
              if (y[i]! < -1.05) y[i] = 1.05;
            }
            write();
          },
          resize: (w, h) => {
            aspect = w / h;
            if (camera instanceof three.OrthographicCamera) {
              camera.left = -aspect;
              camera.right = aspect;
              camera.updateProjectionMatrix();
            }
            write();
          },
          theme: () => material.color.set(tokenColour(root, '--ink-soft')),
          dispose: () => {
            mesh.geometry.dispose();
            material.dispose();
          },
        };
      },
      { renderer: renderer === 'webgl' ? 'webgl' : 'auto' },
    )
      .then((s) => {
        stop = s;
        if (cancelled) s();
        else setStatus('running');
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback');
      });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [count, reach, renderer]);

  return (
    <div
      className={['atl-particles', className].filter(Boolean).join(' ')}
      data-status={status}
      aria-hidden="true"
    >
      <div className="atl-particles__fallback" />
      {status !== 'fallback' ? <canvas ref={canvasRef} className="atl-particles__canvas" /> : null}
    </div>
  );
}
