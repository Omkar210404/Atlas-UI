import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { IconMore } from '../../../icons/more';
import { useDismiss } from '../../../primitives/use-dismiss';
import { usePlacement } from '../../../primitives/use-placement';
import './breadcrumb-trail.css';

export interface Crumb {
  label: string;
  href: string;
}

export interface BreadcrumbTrailProps {
  /** The path from the top level to the current page. The last crumb is the current page. */
  items: readonly Crumb[];
  /** Accessible name of the navigation landmark. */
  label?: string;
  /**
   * Called when a crumb is clicked. Call `event.preventDefault()` to handle navigation
   * yourself, for example in a client-side router.
   */
  onNavigate?: (crumb: Crumb, event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

function Separator() {
  return (
    <svg className="atl-crumbs__sep" viewBox="0 0 8 16" width="8" height="16" aria-hidden="true">
      <path d="M6 2.5 2 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/**
 * How many crumbs after the first must be hidden for the trail to fit.
 * The first and last crumbs always stay visible.
 */
export function crumbsToHide(widths: number[], overflowWidth: number, available: number): number {
  const total = widths.reduce((sum, w) => sum + w, 0);
  if (total <= available) return 0;
  const hideable = Math.max(widths.length - 2, 0);
  let width = total + overflowWidth;
  for (let hidden = 1; hidden <= hideable; hidden++) {
    width -= widths[hidden] ?? 0;
    if (width <= available) return hidden;
  }
  return hideable;
}

export function BreadcrumbTrail({
  items,
  label = 'Breadcrumb',
  onNavigate,
  className,
}: BreadcrumbTrailProps) {
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [hidden, setHidden] = useState(0);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Measure natural widths from an invisible copy, then hide middle crumbs until it fits.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const update = () => {
      const entries = Array.from(measure.children) as HTMLElement[];
      const overflow = entries.pop();
      const widths = entries.map((el) => el.getBoundingClientRect().width);
      const next = crumbsToHide(widths, overflow?.getBoundingClientRect().width ?? 0, nav.clientWidth);
      setHidden(next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [items]);

  useDismiss({
    open,
    layerRef: menuRef,
    triggerRef,
    onDismiss: (reason) => {
      setOpen(false);
      if (reason === 'escape') triggerRef.current?.focus();
    },
  });
  const placement = usePlacement(triggerRef, menuRef, open, { side: 'bottom', align: 'start' });

  const collapsed = items.slice(1, 1 + hidden);
  const lastIndex = items.length - 1;

  const link = (crumb: Crumb, index: number, extra?: string) => (
    <a
      className={['atl-crumbs__link', extra].filter(Boolean).join(' ')}
      href={crumb.href}
      aria-current={index === lastIndex ? 'page' : undefined}
      onClick={(event) => {
        setOpen(false);
        onNavigate?.(crumb, event);
      }}
    >
      {crumb.label}
    </a>
  );

  const renderItems = (forMeasure: boolean): ReactNode[] =>
    items.flatMap((crumb, index) => {
      if (!forMeasure && index >= 1 && index <= hidden) {
        if (index !== 1) return [];
        return [
          <li key="overflow" className="atl-crumbs__item">
            <button
              ref={triggerRef}
              type="button"
              className="atl-crumbs__more"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={`Show ${collapsed.length} hidden level${collapsed.length === 1 ? '' : 's'}`}
              onClick={() => setOpen((o) => !o)}
            >
              <IconMore size={18} />
            </button>
            <Separator />
          </li>,
        ];
      }
      return [
        <li key={`${index}-${crumb.href}`} className="atl-crumbs__item">
          {forMeasure ? (
            <span
              className="atl-crumbs__link"
              aria-current={index === lastIndex ? 'page' : undefined}
            >
              {crumb.label}
            </span>
          ) : (
            link(crumb, index)
          )}
          {index < lastIndex ? <Separator /> : null}
        </li>,
      ];
    });

  return (
    <nav ref={navRef} aria-label={label} className={['atl-crumbs', className].filter(Boolean).join(' ')}>
      <ol className="atl-crumbs__list">{renderItems(false)}</ol>

      <ol ref={measureRef} className="atl-crumbs__list atl-crumbs__measure" aria-hidden="true" inert>
        {renderItems(true)}
        <li className="atl-crumbs__item">
          <span className="atl-crumbs__more">
            <IconMore size={18} />
          </span>
          <Separator />
        </li>
      </ol>

      {collapsed.length > 0 ? (
        <ul
          ref={menuRef}
          id={menuId}
          className="atl-crumbs__menu"
          hidden={!open}
          style={
            placement
              ? { left: placement.x, top: placement.y }
              : { left: -9999, top: 0, visibility: 'hidden' }
          }
        >
          {collapsed.map((crumb, i) => (
            <li key={crumb.href}>{link(crumb, i + 1, 'atl-crumbs__menu-link')}</li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
