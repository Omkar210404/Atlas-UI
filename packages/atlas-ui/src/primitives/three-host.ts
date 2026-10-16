import type * as ThreeCore from './three-core';
import { prefersReducedMotion } from './use-reduced-motion';

export type RendererChoice = 'auto' | 'webgl';

export interface HostFrame {
  /** Seconds of animated time (paused time does not count). */
  time: number;
  /** Seconds since the previous frame, clamped. */
  delta: number;
  /** Pointer in -1…1 inside the canvas, or null when outside. */
  pointer: { x: number; y: number } | null;
  width: number;
  height: number;
}

export interface SceneHandle {
  /** Called once per frame while running. */
  frame: (frame: HostFrame) => void;
  /** Called on resize, after the renderer has been resized. */
  resize?: (width: number, height: number) => void;
  /** Called when the theme changes, to re-read colours. */
  theme?: () => void;
  dispose?: () => void;
}

export type Three = typeof ThreeCore;

export interface HostInfo {
  backend: 'webgpu' | 'webgl2';
}

/** True when the browser can run WebGPU or WebGL2. */
export function canRender3d(): boolean {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) return true;
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/** Reads a token colour (any CSS colour) from an element as a three.js-friendly hex string. */
export function tokenColour(el: Element, name: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  el.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
}

/**
 * Runs a three.js scene on a canvas with WebGPU (falling back to WebGL2), and takes care of
 * the things every decorative 3D scene needs: pixel-ratio cap, resizing, pausing when the
 * canvas is off screen or the tab is hidden, one still frame under reduced motion, and
 * re-reading colours when the theme changes. three.js is imported here, lazily, so it is
 * never part of a page's first load.
 */
export async function startHost(
  canvas: HTMLCanvasElement,
  build: (
    three: Three,
    scene: InstanceType<Three['Scene']>,
    info: HostInfo,
    camera: InstanceType<Three['OrthographicCamera']> | InstanceType<Three['PerspectiveCamera']>,
  ) => SceneHandle,
  options: {
    renderer?: RendererChoice;
    camera?: 'ortho' | 'perspective';
    maxPixelRatio?: number;
  } = {},
): Promise<() => void> {
  const three = await import('./three-core');
  const renderer = new three.WebGPURenderer({
    canvas,
    antialias: true,
    alpha: true,
    forceWebGL: options.renderer === 'webgl',
  });
  await renderer.init();
  const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend
    ? 'webgpu'
    : 'webgl2';
  canvas.dataset.backend = backend;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.maxPixelRatio ?? 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new three.Scene();
  const camera =
    options.camera === 'perspective'
      ? new three.PerspectiveCamera(50, 1, 0.1, 100)
      : new three.OrthographicCamera(-1, 1, 1, -1, 0, 10);
  camera.position.z = options.camera === 'perspective' ? 5 : 1;
  const handle = build(three, scene, { backend }, camera);

  let width = 1;
  let height = 1;
  const resize = () => {
    width = Math.max(canvas.clientWidth, 1);
    height = Math.max(canvas.clientHeight, 1);
    renderer.setSize(width, height, false);
    if (camera instanceof three.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    handle.resize?.(width, height);
  };
  resize();

  let pointer: HostFrame['pointer'] = null;
  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointer = Math.abs(x) <= 1.2 && Math.abs(y) <= 1.2 ? { x, y } : null;
  };

  let visible = true;
  let pageVisible = document.visibilityState === 'visible';
  let time = 0;
  let last = performance.now();
  let disposed = false;

  const draw = (delta: number) => {
    handle.frame({ time, delta, pointer, width, height });
    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += delta;
    draw(delta);
  };

  const update = () => {
    if (disposed) return;
    const run = visible && pageVisible && !prefersReducedMotion();
    if (run) {
      last = performance.now();
      void renderer.setAnimationLoop(loop);
    } else {
      void renderer.setAnimationLoop(null);
      draw(0); // one still frame, so the scene is never blank
    }
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    update();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(() => {
    resize();
    if (!visible || !pageVisible || prefersReducedMotion()) draw(0);
  });
  ro.observe(canvas);
  const onVisibility = () => {
    pageVisible = document.visibilityState === 'visible';
    update();
  };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', update);
  const themeObserver = new MutationObserver(() => {
    handle.theme?.();
    update();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-motion'],
  });
  update();

  return () => {
    disposed = true;
    void renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    media.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointerMove);
    handle.dispose?.();
    renderer.dispose();
  };
}
