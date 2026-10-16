import { lazy, Suspense, useEffect, useState } from 'react';
import { canRender3d } from 'atlas-ui/primitives/three-host';

// three.js arrives in its own chunk, only after the page is idle, and only in Spatial view.
const AmbientBackground = lazy(() =>
  import('atlas-ui/spatial/ambient-background').then((m) => ({ default: m.AmbientBackground })),
);

/** The chart's water: a static contour pattern first, then the live field once idle. */
export function ChartBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canRender3d()) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => setReady(true), { timeout: 2500 } as IdleRequestOptions);
    return () => cancel(handle as number);
  }, []);

  return (
    <div className="chart-background" aria-hidden="true">
      {ready ? (
        <Suspense fallback={null}>
          <AmbientBackground className="atl-fill" density={7} speed={0.03} />
        </Suspense>
      ) : null}
    </div>
  );
}
