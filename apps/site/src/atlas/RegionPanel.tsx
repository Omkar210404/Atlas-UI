import { useEffect, useRef, useState } from 'react';
import type { ComponentDocs } from 'atlas-ui/docs/types';
import { isCharted, loadDocs, type Category } from '../catalog';
import { href, onLinkClick } from '../router';
import { useSoundingPositions } from './Chart';
import './region.css';

function useCategoryDocs(category: Category) {
  const [docs, setDocs] = useState<Record<string, ComponentDocs>>({});
  useEffect(() => {
    let alive = true;
    const charted = category.types.filter((t) => isCharted(category.slug, t.slug));
    Promise.all(charted.map(async (t) => [t.slug, await loadDocs(category.slug, t.slug)] as const)).then(
      (entries) => {
        if (!alive) return;
        setDocs(Object.fromEntries(entries.filter((e): e is [string, ComponentDocs] => e[1] !== null)));
      },
    );
    return () => {
      alive = false;
    };
  }, [category]);
  return docs;
}

function highlightSounding(category: string, type: string, on: boolean) {
  document
    .querySelector(`.island[data-slug="${category}"] .island__sounding[data-type="${type}"]`)
    ?.toggleAttribute('data-hover', on);
}

export function RegionPanel({ category }: { category: Category }) {
  const docs = useCategoryDocs(category);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const linesRef = useRef<SVGSVGElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const soundings = useRef<{ x: number; y: number }[]>([]);
  const charted = category.types.filter((t) => isCharted(category.slug, t.slug)).length;

  const drawLines = () => {
    const svg = linesRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll('path');
    soundings.current.forEach((from, i) => {
      const card = cardRefs.current[i];
      const path = paths[i];
      if (!card || !path) return;
      const rect = card.getBoundingClientRect();
      const to = { x: rect.left, y: rect.top + Math.min(28, rect.height / 2) };
      const visible = rect.bottom > 72 && rect.top < window.innerHeight - 80;
      const elbow = to.x - 28;
      path.setAttribute(
        'd',
        visible ? `M${from.x} ${from.y}L${elbow} ${to.y}H${to.x}` : '',
      );
    });
  };

  useSoundingPositions(category.slug, (points) => {
    soundings.current = points;
    drawLines();
  });

  useEffect(() => {
    const list = listRef.current;
    const frame = requestAnimationFrame(drawLines);
    const onScroll = () => requestAnimationFrame(drawLines);
    list?.closest('.region-panel')?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const observer = new ResizeObserver(onScroll);
    if (list) observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      list?.closest('.region-panel')?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();
    };
  }, [docs]);

  return (
    <>
      <svg ref={linesRef} className="leader-lines" aria-hidden="true">
        {category.types.map((t) => (
          <path key={t.slug} data-type={t.slug} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <section className="region-panel" aria-labelledby="level-title">
        <header className="region-panel__header">
          <h1 id="level-title" className="level-title" tabIndex={-1}>
            {category.name}
          </h1>
          <p className="region-panel__description">{category.description}</p>
          <p className="region-panel__count">
            {charted === 0
              ? `${category.types.length} types planned, none charted yet.`
              : `${charted} of ${category.types.length} types charted.`}
          </p>
        </header>
        <ul ref={listRef} className="region-panel__list">
          {category.types.map((type, i) => {
            const typeDocs = docs[type.slug];
            const ready = isCharted(category.slug, type.slug);
            const to = { level: 'type' as const, category: category.slug, type: type.slug };
            const preset = typeDocs?.presets[0];
            return (
              <li key={type.slug} style={{ '--i': i } as React.CSSProperties}>
                <article
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="type-card"
                  data-charted={ready || undefined}
                  data-type-card={type.slug}
                  style={ready ? { viewTransitionName: `type-${type.slug}` } : undefined}
                  onPointerEnter={() => highlightSounding(category.slug, type.slug, true)}
                  onPointerLeave={() => highlightSounding(category.slug, type.slug, false)}
                  onFocus={() => highlightSounding(category.slug, type.slug, true)}
                  onBlur={() => highlightSounding(category.slug, type.slug, false)}
                >
                  <h2 className="type-card__name">
                    {ready ? (
                      <a className="type-card__link" href={href(to)} onClick={(e) => onLinkClick(e, to)}>
                        {type.name}
                      </a>
                    ) : (
                      type.name
                    )}
                  </h2>
                  <p className="type-card__summary">{type.summary}</p>
                  {ready ? (
                    <div className="type-card__preview" aria-hidden="true" inert>
                      {preset ? preset.render() : <span className="type-card__loading" />}
                    </div>
                  ) : (
                    <p className="type-card__status">Not charted yet. It arrives in a later batch.</p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
