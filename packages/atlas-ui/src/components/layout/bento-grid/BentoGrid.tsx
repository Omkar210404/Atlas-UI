import type { ReactNode } from 'react';
import './bento-grid.css';

export interface BentoGridProps {
  children: ReactNode;
  /** Columns at full width: 3 or 4. The grid drops to 2 and then 1 as its container narrows. */
  columns?: 3 | 4;
  label?: string;
  className?: string;
}

export interface BentoItemProps {
  children: ReactNode;
  /** Columns to span at full width (capped as the grid narrows). */
  colSpan?: 1 | 2 | 3 | 4;
  /** Rows to span. */
  rowSpan?: 1 | 2;
  /** `raised` uses the second surface tint, for the item you want seen first. */
  tone?: 'plain' | 'raised';
  className?: string;
}

/**
 * A spanning grid that re-flows with its container, not the viewport, so it works the same
 * in a sidebar as on a full page. Reading order always follows source order.
 */
export function BentoGrid({ children, columns = 4, label, className }: BentoGridProps) {
  return (
    <div
      className={['atl-bento', className].filter(Boolean).join(' ')}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      <div className="atl-bento__grid" data-columns={columns}>
        {children}
      </div>
    </div>
  );
}

export function BentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  tone = 'plain',
  className,
}: BentoItemProps) {
  return (
    <div
      className={['atl-bento__item', className].filter(Boolean).join(' ')}
      data-col={colSpan}
      data-row={rowSpan}
      data-tone={tone}
    >
      {children}
    </div>
  );
}
