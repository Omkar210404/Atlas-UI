import { useId, useState, type ReactNode } from 'react';
import { IconChevronDown } from '../../../icons/chevron-down';
import './timeline.css';

export interface TimelineEvent {
  id: string;
  /** When it happened, as shown: "06:12" or "14 Oct". Also given to `<time dateTime>`. */
  time: string;
  dateTime?: string;
  title: string;
  /** Detail revealed by the event's disclosure button. */
  details?: ReactNode;
  /** Marks the event as the current position on the timeline. */
  current?: boolean;
}

export interface TimelineProps {
  label: string;
  events: readonly TimelineEvent[];
  className?: string;
}

/**
 * Events in order on a vertical line. The line fills as the timeline scrolls through the
 * viewport (a CSS scroll-driven animation where supported); each event can open its details.
 */
export function Timeline({ label, events, className }: TimelineProps) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const id = useId();
  const toggle = (eventId: string) =>
    setOpen((set) => {
      const next = new Set(set);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

  return (
    <ol className={['atl-timeline', className].filter(Boolean).join(' ')} aria-label={label}>
      {events.map((event) => {
        const expanded = open.has(event.id);
        const detailsId = `${id}-${event.id}`;
        return (
          <li
            key={event.id}
            className="atl-timeline__event"
            data-current={event.current || undefined}
          >
            <span className="atl-timeline__mark" aria-hidden="true" />
            <time className="atl-timeline__time" dateTime={event.dateTime}>
              {event.time}
            </time>
            {event.details ? (
              <button
                type="button"
                className="atl-timeline__title"
                aria-expanded={expanded}
                aria-controls={detailsId}
                onClick={() => toggle(event.id)}
              >
                {event.title}
                <IconChevronDown size={16} className="atl-timeline__chevron" />
              </button>
            ) : (
              <span className="atl-timeline__title">{event.title}</span>
            )}
            {event.current ? <span className="atl-visually-hidden"> (now)</span> : null}
            {event.details ? (
              <div id={detailsId} className="atl-timeline__details" hidden={!expanded}>
                {event.details}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
