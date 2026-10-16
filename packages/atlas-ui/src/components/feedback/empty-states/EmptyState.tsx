import type { ReactNode } from 'react';
import { illustrations, type IllustrationName } from './illustrations';
import './empty-states.css';

export interface EmptyStateProps {
  illustration: IllustrationName;
  /** What is empty, said plainly: "No anchorages saved". */
  title: string;
  /** What to do next. */
  description?: ReactNode;
  /** A next step, such as a button. */
  action?: ReactNode;
  /** Heading level for the title, so it fits the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** An empty screen that says what is missing and what to do, with an original illustration. */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  headingLevel = 3,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={['atl-empty', className].filter(Boolean).join(' ')}>
      <svg className="atl-empty__art" viewBox="0 0 160 120" aria-hidden="true">
        {illustrations[illustration]}
      </svg>
      <Heading className="atl-empty__title">{title}</Heading>
      {description ? <p className="atl-empty__description">{description}</p> : null}
      {action ? <div className="atl-empty__action">{action}</div> : null}
    </div>
  );
}
