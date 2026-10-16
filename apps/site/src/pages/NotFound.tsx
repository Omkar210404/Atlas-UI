import { EmptyState } from 'atlas-ui/feedback/empty-states';
import { href, onLinkClick, type Route } from '../router';

export function NotFound() {
  const atlas: Route = { level: 'atlas' };
  return (
    <div className="page">
      <header className="page__header">
        <h1 id="level-title" className="level-title" tabIndex={-1}>
          This part of the chart is blank.
        </h1>
      </header>
      <EmptyState
        illustration="fog"
        title="Nothing at this address"
        headingLevel={2}
        description={
          <>
            The address does not match a region or component. Check the spelling, or go back to the
            atlas and search with <kbd>/</kbd>.
          </>
        }
        action={
          <a className="primary-link" href={href(atlas)} onClick={(e) => onLinkClick(e, atlas)}>
            Back to the atlas
          </a>
        }
      />
    </div>
  );
}
