import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { durations, tween } from 'atlas-ui/motion/tween';
import { nearestInDirection, type Direction } from 'atlas-ui/primitives/spatial';
import { useLatest } from 'atlas-ui/primitives/use-latest';
import { prefersReducedMotion } from 'atlas-ui/primitives/use-reduced-motion';
import { categories, isCharted } from '../catalog';
import { href, navigate, onLinkClick, type Route } from '../router';
import {
  fit,
  lerpCamera,
  project,
  scaleOf,
  unproject,
  viewBox,
  type Camera,
  type Size,
} from './camera';
import { buildLayout, type Island, type Layout } from './geometry';
import { ChartBackground } from './ChartBackground';
import './chart.css';

const HEADER = 84;
const DOCK = 100;
const NARROW = 760;
const CARTOUCHE_TALL = 150;

interface CameraState {
  camera: Camera;
  viewport: Size;
}

interface CameraApi {
  get: () => CameraState;
  subscribe: (listener: () => void) => () => void;
  layout: Layout;
}

const CameraContext = createContext<CameraApi | null>(null);

export function useChartCamera(): CameraApi {
  const api = useContext(CameraContext);
  if (!api) throw new Error('useChartCamera must be used inside <Chart>.');
  return api;
}

function viewportSize(): Size {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function regionPanelWidth(viewport: Size): number {
  return Math.min(Math.max(viewport.width * 0.4, 360), 520);
}

function targetCamera(route: Route, layout: Layout, viewport: Size): Camera {
  const narrow = viewport.width < NARROW;
  if (route.level === 'region') {
    const island = layout.islands.find((i) => i.slug === route.category);
    if (island) {
      const pad = island.radius * 0.12;
      const bounds = {
        x: island.bounds.x - pad,
        y: island.bounds.y - pad,
        width: island.bounds.width + pad * 2,
        height: island.bounds.height + pad * 2,
      };
      return fit(
        bounds,
        viewport,
        narrow
          ? { top: HEADER, right: 16, bottom: viewport.height * 0.52, left: 16 }
          : { top: HEADER, right: regionPanelWidth(viewport) + 48, bottom: DOCK, left: 32 },
      );
    }
  }
  if (layout.name === 'tall') {
    // Tall screens fit the chart's width and pan vertically; the title cartouche sits on top.
    const scale = (viewport.width - 24) / layout.world.width;
    const top = HEADER + CARTOUCHE_TALL;
    return {
      x: layout.world.x + layout.world.width / 2,
      y: layout.world.y + (viewport.height / 2 - top) / scale,
      w: viewport.width / scale,
    };
  }
  return fit(layout.world, viewport, { top: HEADER + 8, right: 24, bottom: DOCK, left: 24 });
}

const typeCounts = Object.fromEntries(categories.map((c) => [c.slug, c.types.length]));

export function useLayoutForViewport(): Layout {
  const [name, setName] = useState<'wide' | 'tall'>(() =>
    window.innerWidth / window.innerHeight < 0.9 ? 'tall' : 'wide',
  );
  useEffect(() => {
    const onResize = () => setName(window.innerWidth / window.innerHeight < 0.9 ? 'tall' : 'wide');
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return useMemo(() => buildLayout(name, typeCounts), [name]);
}

interface ChartProps {
  route: Extract<Route, { level: 'atlas' | 'region' }>;
  layout: Layout;
  children?: ReactNode;
}

export function Chart({ route, layout, children }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const state = useRef<CameraState>({
    camera: targetCamera(route, layout, viewportSize()),
    viewport: viewportSize(),
  });
  const listeners = useRef(new Set<() => void>());
  const cancel = useRef<() => void>(() => {});
  const drag = useRef<{ x: number; y: number; camera: Camera; moved: boolean; id: number } | null>(
    null,
  );
  const velocity = useRef({ x: 0, y: 0, t: 0 });
  const suppressClick = useRef(false);
  const zoomAccumulator = useRef(0);
  const activeSlug = route.level === 'region' ? route.category : null;

  const apply = useCallback((camera: Camera) => {
    state.current.camera = camera;
    svgRef.current?.setAttribute('viewBox', viewBox(camera, state.current.viewport));
    svgRef.current?.style.setProperty(
      '--chart-scale',
      String(scaleOf(camera, state.current.viewport)),
    );
    listeners.current.forEach((listener) => listener());
  }, []);

  const flyTo = useCallback(
    (target: Camera, duration: number = durations.voyage) => {
      cancel.current();
      const from = state.current.camera;
      cancel.current = tween({
        duration,
        onUpdate: (t) => apply(lerpCamera(from, target, t)),
      });
    },
    [apply],
  );

  // Initial placement before paint.
  useLayoutEffect(() => {
    apply(state.current.camera);
  }, [apply]);

  // Fly to the level's framing whenever the route or the layout changes.
  useEffect(() => {
    flyTo(targetCamera(route, layout, state.current.viewport));
  }, [route, layout, flyTo]);

  useEffect(() => {
    const onResize = () => {
      state.current.viewport = viewportSize();
      cancel.current();
      apply(targetCamera(route, layout, state.current.viewport));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [route, layout, apply]);

  useEffect(() => () => cancel.current(), []);

  // Wheel: pan; Ctrl/⌘ + wheel or pinch: zoom between levels.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { camera, viewport } = state.current;
      if (event.ctrlKey || event.metaKey) {
        zoomAccumulator.current += event.deltaY;
        if (zoomAccumulator.current < -90 && route.level === 'atlas') {
          zoomAccumulator.current = 0;
          const world = unproject({ x: event.clientX, y: event.clientY }, camera, viewport);
          const nearest = [...layout.islands].sort(
            (a, b) =>
              Math.hypot(a.centre.x - world.x, a.centre.y - world.y) -
              Math.hypot(b.centre.x - world.x, b.centre.y - world.y),
          )[0];
          if (nearest) navigate({ level: 'region', category: nearest.slug });
        } else if (zoomAccumulator.current > 90 && route.level === 'region') {
          zoomAccumulator.current = 0;
          navigate({ level: 'atlas' });
        }
        return;
      }
      cancel.current();
      const s = scaleOf(camera, viewport);
      apply(
        clampCamera(
          { ...camera, x: camera.x + event.deltaX / s, y: camera.y + event.deltaY / s },
          layout,
        ),
      );
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [route.level, layout, apply]);

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    cancel.current();
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      camera: state.current.camera,
      moved: false,
      id: event.pointerId,
    };
    velocity.current = { x: 0, y: 0, t: performance.now() };
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.x;
    const dy = event.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.dragging = '';
    }
    const s = scaleOf(d.camera, state.current.viewport);
    const now = performance.now();
    const previous = state.current.camera;
    const next = clampCamera(
      { ...d.camera, x: d.camera.x - dx / s, y: d.camera.y - dy / s },
      layout,
    );
    const dt = Math.max(now - velocity.current.t, 1);
    velocity.current = { x: (next.x - previous.x) / dt, y: (next.y - previous.y) / dt, t: now };
    apply(next);
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (!d?.moved) return;
    suppressClick.current = true;
    // Glide on after release, decaying like a boat losing way.
    if (prefersReducedMotion()) return;
    let { x: vx, y: vy } = velocity.current;
    let last = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const decay = Math.pow(0.994, dt);
      vx *= decay;
      vy *= decay;
      const camera = state.current.camera;
      apply(clampCamera({ ...camera, x: camera.x + vx * dt, y: camera.y + vy * dt }, layout));
      if (Math.hypot(vx, vy) > 0.002) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    cancel.current = () => cancelAnimationFrame(frame);
  };

  const onClickCapture = (event: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const directions: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const direction = directions[event.key];
    const target = event.target as Element;
    if (!direction || !target.matches('[data-island-link]')) return;
    const links = Array.from(
      event.currentTarget.querySelectorAll<SVGAElement>('[data-island-link]'),
    );
    const others = links.filter((l) => l !== target);
    const index = nearestInDirection(
      target.getBoundingClientRect(),
      others.map((l) => l.getBoundingClientRect()),
      direction,
    );
    if (index === -1) return;
    event.preventDefault();
    others[index]?.focus();
  };

  // Keep the focused region on screen, so keyboard users never focus something they cannot see.
  const onFocus = (event: React.FocusEvent<SVGSVGElement>) => {
    const target = event.target as Element;
    if (!target.matches('[data-island-link]')) return;
    const rect = target.getBoundingClientRect();
    const { camera, viewport } = state.current;
    const inside =
      rect.top >= HEADER &&
      rect.bottom <= viewport.height - DOCK &&
      rect.left >= 0 &&
      rect.right <= viewport.width;
    if (inside) return;
    const centre = unproject(
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      camera,
      viewport,
    );
    flyTo(clampCamera({ ...camera, x: centre.x, y: centre.y }, layout), durations.glide);
  };

  const api = useMemo<CameraApi>(
    () => ({
      get: () => state.current,
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
      layout,
    }),
    [layout],
  );

  const [unfolding] = useState(() => {
    try {
      if (prefersReducedMotion() || sessionStorage.getItem('atlas-ui:unfolded')) return false;
      sessionStorage.setItem('atlas-ui:unfolded', '1');
      return true;
    } catch {
      return false;
    }
  });

  const graticule = useMemo(() => {
    const { world } = layout;
    const lines: string[] = [];
    const step = 100;
    for (let x = world.x - world.width; x <= world.x + world.width * 2; x += step) {
      lines.push(`M${x} ${world.y - world.height}V${world.y + world.height * 2}`);
    }
    for (let y = world.y - world.height; y <= world.y + world.height * 2; y += step) {
      lines.push(`M${world.x - world.width} ${y}H${world.x + world.width * 2}`);
    }
    return lines.join('');
  }, [layout]);

  return (
    <CameraContext.Provider value={api}>
      <ChartBackground />
      <svg
        ref={svgRef}
        className="chart"
        data-level={route.level}
        data-unfolding={unfolding || undefined}
        role="group"
        aria-label={route.level === 'atlas' ? 'Chart of component regions' : 'Region chart'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      >
        <path
          className="chart__graticule"
          d={graticule}
          vectorEffect="non-scaling-stroke"
          aria-hidden="true"
        />
        {layout.islands.map((island, index) => (
          <IslandShape
            key={island.slug}
            island={island}
            order={index}
            level={route.level}
            active={island.slug === activeSlug}
            dimmed={activeSlug !== null && island.slug !== activeSlug}
          />
        ))}
      </svg>
      {children}
    </CameraContext.Provider>
  );
}

function clampCamera(camera: Camera, layout: Layout): Camera {
  const { world } = layout;
  const margin = Math.max(world.width, world.height) * 0.25;
  return {
    ...camera,
    x: Math.min(Math.max(camera.x, world.x - margin), world.x + world.width + margin),
    y: Math.min(Math.max(camera.y, world.y - margin), world.y + world.height + margin),
  };
}

function IslandShape({
  island,
  order,
  level,
  active,
  dimmed,
}: {
  island: Island;
  order: number;
  level: 'atlas' | 'region';
  active: boolean;
  dimmed: boolean;
}) {
  const category = categories.find((c) => c.slug === island.slug);
  if (!category) return null;
  const charted = category.types.filter((t) => isCharted(category.slug, t.slug)).length;
  const labelId = `label-path-${island.slug}`;
  const to: Route = { level: 'region', category: category.slug };
  const name =
    charted === 0
      ? `${category.name}: ${category.types.length} types, not charted yet`
      : `${category.name}: ${charted} of ${category.types.length} types charted`;

  const shape = (
    <>
      <path className="island__halo" d={island.coast} vectorEffect="non-scaling-stroke" />
      <path
        className="island__coast"
        d={island.coast}
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
      {island.rings.map((d, i) => (
        <path
          key={i}
          className="island__ring"
          d={d}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          style={{ '--ring': i } as React.CSSProperties}
        />
      ))}
      {island.soundings.map((p, i) => {
        const type = category.types[i];
        const isOn = type ? isCharted(category.slug, type.slug) : false;
        return (
          <g
            key={i}
            className="island__sounding"
            data-charted={isOn || undefined}
            data-type={type?.slug}
          >
            <circle cx={p.x} cy={p.y} r={island.radius * 0.035} />
            <circle
              className="island__sounding-ring"
              cx={p.x}
              cy={p.y}
              r={island.radius * 0.085}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
      <path id={labelId} d={island.labelPath} fill="none" stroke="none" />
      <text className="island__label" style={{ fontSize: island.labelSize }} aria-hidden="true">
        <textPath href={`#${labelId}`} startOffset="50%" textAnchor="middle">
          {category.name}
        </textPath>
      </text>
    </>
  );

  return (
    <g
      className="island"
      data-slug={island.slug}
      data-active={active || undefined}
      data-dimmed={dimmed || undefined}
      data-charted={charted > 0 || undefined}
      style={{ '--order': order } as React.CSSProperties}
    >
      {level === 'atlas' || !active ? (
        <a
          href={href(to)}
          className="island__link"
          data-island-link={level === 'atlas' ? '' : undefined}
          data-region={island.slug}
          aria-label={name}
          tabIndex={level === 'atlas' ? 0 : -1}
          onClick={(event) => onLinkClick(event as unknown as React.MouseEvent<HTMLElement>, to)}
        >
          {shape}
        </a>
      ) : (
        shape
      )}
    </g>
  );
}

/** Screen position of a sounding on the active island, kept in sync with the camera. */
export function useSoundingPositions(
  slug: string,
  onChange: (points: { x: number; y: number }[]) => void,
) {
  const api = useChartCamera();
  const latest = useLatest(onChange);
  useEffect(() => {
    const island = api.layout.islands.find((i) => i.slug === slug);
    if (!island) return;
    const update = () => {
      const { camera, viewport } = api.get();
      latest.current(island.soundings.map((p) => project(p, camera, viewport)));
    };
    update();
    return api.subscribe(update);
  }, [api, slug, latest]);
}
