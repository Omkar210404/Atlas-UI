import type { Category, TypeEntry } from '../catalog';
import { href, onLinkClick, type Route } from '../router';
import { useDocs } from './useDocs';

export function TypePage({ category, type }: { category: Category; type: TypeEntry }) {
  const docs = useDocs(category.slug, type.slug);
  const spec: Route = { level: 'spec', category: category.slug, type: type.slug };
  const region: Route = { level: 'region', category: category.slug };

  return (
    <div className="page page--type">
      <header className="type-header" style={{ viewTransitionName: `type-${type.slug}` }}>
        <p className="type-header__region">
          <a href={href(region)} onClick={(e) => onLinkClick(e, region)}>
            {category.name}
          </a>
        </p>
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          {type.name}
        </h1>
        <p className="page__lede">{type.summary}</p>
        {docs ? (
          <p className="type-header__actions">
            <a className="primary-link" href={href(spec)} onClick={(e) => onLinkClick(e, spec)}>
              Open the spec sheet
            </a>
            <span className="type-header__hint">
              Props, source, keyboard map and accessibility notes.
            </span>
          </p>
        ) : null}
      </header>

      {docs === null ? (
        <p className="page__lede">
          This type is not charted yet. It arrives in a later batch; the rest of {category.name} is
          on the{' '}
          <a href={href(region)} onClick={(e) => onLinkClick(e, region)}>
            region chart
          </a>
          .
        </p>
      ) : (
        <section className="specimens" aria-labelledby="presets-title">
          <h2 id="presets-title" className="section-title">
            Try it here
          </h2>
          <div className="specimens__grid">
            {docs
              ? docs.presets.map((preset, index) => (
                  <figure
                    key={preset.id}
                    className="specimen"
                    data-lead={index === 0 || undefined}
                    style={index === 0 ? { viewTransitionName: `stage-${type.slug}` } : undefined}
                  >
                    <div className="specimen__stage">{preset.render()}</div>
                    <figcaption className="specimen__caption">
                      <span className="specimen__name">{preset.name}</span>
                      <span className="specimen__description">{preset.description}</span>
                    </figcaption>
                  </figure>
                ))
              : [0, 1, 2].map((i) => (
                  <div key={i} className="specimen specimen--loading" aria-hidden="true" />
                ))}
          </div>
        </section>
      )}
    </div>
  );
}
