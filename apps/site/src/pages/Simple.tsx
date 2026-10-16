import { categories, chartedCount, isCharted, plannedCount, type Category } from '../catalog';
import { href, onLinkClick, type Route } from '../router';

function TypeList({ category }: { category: Category }) {
  return (
    <ul className="simple__types">
      {category.types.map((type) => {
        const to: Route = { level: 'type', category: category.slug, type: type.slug };
        const charted = isCharted(category.slug, type.slug);
        return (
          <li key={type.slug}>
            {charted ? (
              <a href={href(to)} data-type-link={type.slug} onClick={(e) => onLinkClick(e, to)}>
                {type.name}
              </a>
            ) : (
              <span className="simple__uncharted">{type.name}</span>
            )}
            <span className="simple__summary">
              {type.summary}
              {charted ? null : ' Not charted yet.'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** The atlas as a plain document: every region and type as headings, lists and links. */
export function SimpleAtlas() {
  return (
    <div className="page simple">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          An atlas of interfaces.
        </h1>
        <p className="page__lede">
          Original React components, grouped into eight regions. {chartedCount} of {plannedCount}{' '}
          are charted so far.
        </p>
      </header>
      {categories.map((category) => {
        const to: Route = { level: 'region', category: category.slug };
        return (
          <section
            key={category.slug}
            className="simple__region"
            aria-labelledby={`region-${category.slug}`}
          >
            <h2 id={`region-${category.slug}`}>
              <a
                href={href(to)}
                data-region-link={category.slug}
                onClick={(e) => onLinkClick(e, to)}
              >
                {category.name}
              </a>
            </h2>
            <p className="simple__description">{category.description}</p>
            <TypeList category={category} />
          </section>
        );
      })}
    </div>
  );
}

export function SimpleRegion({ category }: { category: Category }) {
  const charted = category.types.filter((t) => isCharted(category.slug, t.slug)).length;
  return (
    <div className="page simple">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          {category.name}
        </h1>
        <p className="page__lede">{category.description}</p>
        <p className="page__meta">
          {charted} of {category.types.length} types charted.
        </p>
      </header>
      <TypeList category={category} />
    </div>
  );
}
