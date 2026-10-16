import { useMemo } from 'react';
import { buildLayout } from '../atlas/geometry';
import { categories } from '../catalog';
import { href, onLinkClick, type Route } from '../router';

const typeCounts = Object.fromEntries(categories.map((c) => [c.slug, c.types.length]));

/** The whole atlas in miniature, like the locator inset on a chart. Current region in magenta. */
export function InsetMap({ route }: { route: Route }) {
  const layout = useMemo(() => buildLayout('wide', typeCounts), []);
  const current = 'category' in route ? route.category : null;
  const { world } = layout;

  return (
    <nav className="inset-map" aria-label="Inset map">
      <svg viewBox={`${world.x - 40} ${world.y - 40} ${world.width + 80} ${world.height + 80}`} role="presentation">
        <rect
          className="inset-map__frame"
          x={world.x - 40}
          y={world.y - 40}
          width={world.width + 80}
          height={world.height + 80}
          vectorEffect="non-scaling-stroke"
        />
        {layout.islands.map((island) => {
          const category = categories.find((c) => c.slug === island.slug);
          if (!category) return null;
          const to: Route = { level: 'region', category: category.slug };
          const isCurrent = island.slug === current;
          return (
            <a
              key={island.slug}
              href={href(to)}
              aria-label={category.name}
              aria-current={isCurrent ? 'location' : undefined}
              data-region-link={category.slug}
              className="inset-map__island"
              onClick={(event) => onLinkClick(event as unknown as React.MouseEvent<HTMLElement>, to)}
            >
              <path d={island.coast} vectorEffect="non-scaling-stroke" />
            </a>
          );
        })}
      </svg>
    </nav>
  );
}
