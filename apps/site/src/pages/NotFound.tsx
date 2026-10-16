import { href, onLinkClick, type Route } from '../router';

export function NotFound() {
  const atlas: Route = { level: 'atlas' };
  return (
    <div className="page">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          This part of the chart is blank.
        </h1>
        <p className="page__lede">
          The address does not match a region or component. Check the spelling, or go back to the
          atlas and search with <kbd>/</kbd>.
        </p>
      </header>
      <p>
        <a className="text-link" href={href(atlas)} onClick={(e) => onLinkClick(e, atlas)}>
          Back to the atlas
        </a>
      </p>
    </div>
  );
}
