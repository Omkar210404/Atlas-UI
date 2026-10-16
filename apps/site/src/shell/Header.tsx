import { BreadcrumbTrail, type Crumb } from 'atlas-ui/navigation/breadcrumb-trail';
import { findCategory, findType } from '../catalog';
import type { ViewChoice } from '../prefs';
import { href, navigate, onLinkClick, parse, type Route } from '../router';

export function trailFor(route: Route): Crumb[] {
  const atlas: Crumb = { label: 'Atlas', href: href({ level: 'atlas' }) };
  if (route.level === 'principles') {
    return [atlas, { label: 'Principles', href: href(route) }];
  }
  if (!('category' in route)) return [atlas];
  const category = findCategory(route.category);
  const crumbs = [atlas];
  if (!category) return crumbs;
  crumbs.push({ label: category.name, href: href({ level: 'region', category: category.slug }) });
  if (route.level === 'region') return crumbs;
  const type = findType(category, route.type);
  if (!type) return crumbs;
  crumbs.push({
    label: type.name,
    href: href({ level: 'type', category: category.slug, type: type.slug }),
  });
  if (route.level === 'spec') crumbs.push({ label: 'Spec sheet', href: href(route) });
  return crumbs;
}

interface HeaderProps {
  route: Route;
  view: ViewChoice;
  onViewChange: (view: ViewChoice) => void;
}

export function Header({ route, view, onViewChange }: HeaderProps) {
  const atlas: Route = { level: 'atlas' };
  return (
    <header className="site-header">
      <a className="brand" href={href(atlas)} onClick={(e) => onLinkClick(e, atlas)}>
        <svg className="brand__mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
          <path
            d="M16 4.5c5.5 0 9.8 3.6 10.9 8.2 1.3 5.4-1.9 11.4-7.4 13.4-5.9 2.1-12.6-1-14.3-6.6C3.4 13.7 8.4 4.5 16 4.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M16 9.5c3.3 0 6 2.4 6.3 5.4.4 3.6-2.4 6.9-6.1 7-3.9.2-6.8-2.9-6.5-6.5.3-3.3 3-5.9 6.3-5.9Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="15.5" r="2.4" fill="var(--chart-magenta)" />
        </svg>
        <span className="brand__name">atlas-ui</span>
      </a>

      <BreadcrumbTrail
        className="site-header__trail"
        label="You are here"
        items={trailFor(route)}
        onNavigate={(crumb, event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          navigate(parse(new URL(crumb.href, window.location.origin).pathname));
        }}
      />

      <fieldset className="view-toggle">
        <legend className="atl-visually-hidden">View</legend>
        {(['spatial', 'simple'] as const).map((option) => (
          <label key={option} className="view-toggle__option">
            <input
              type="radio"
              name="site-view"
              value={option}
              checked={view === option}
              onChange={() => onViewChange(option)}
            />
            <span>{option === 'spatial' ? 'Spatial' : 'Simple'}</span>
          </label>
        ))}
      </fieldset>
    </header>
  );
}
