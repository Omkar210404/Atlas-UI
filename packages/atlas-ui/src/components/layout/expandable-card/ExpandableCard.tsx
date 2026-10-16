import { AnimatePresence, motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { IconChevronDown } from '../../../icons/chevron-down';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { useReducedMotion } from '../../../primitives/use-reduced-motion';
import { springs } from '../../../tokens/tokens';
import './expandable-card.css';

export interface ExpandableCardProps {
  title: string;
  /** Always visible under the title. */
  summary?: ReactNode;
  /** Revealed when the card opens. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heading level of the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * A card that opens into its details in place. The card's size animates with a spring
 * (motion's layout animation), the heading stays where it is, and focus never moves:
 * the toggle you pressed is still focused when the card has opened.
 */
export function ExpandableCard({
  title,
  summary,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  headingLevel = 3,
  className,
}: ExpandableCardProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const reduced = useReducedMotion();
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  const transition = reduced ? { duration: 0 } : { type: 'spring' as const, ...springs.mooring };

  return (
    <motion.article
      layout
      transition={transition}
      className={['atl-expand', className].filter(Boolean).join(' ')}
      data-open={open || undefined}
      style={{ borderRadius: 12 }}
    >
      <motion.div layout="position" transition={transition} className="atl-expand__head">
        <Heading className="atl-expand__title">
          <button
            type="button"
            className="atl-expand__toggle"
            aria-expanded={open}
            aria-controls={`${id}-details`}
            onClick={() => setOpen((o) => !o)}
          >
            {title}
            <IconChevronDown className="atl-expand__chevron" size={18} />
          </button>
        </Heading>
        {summary ? <div className="atl-expand__summary">{summary}</div> : null}
      </motion.div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="details"
            id={`${id}-details`}
            className="atl-expand__details"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.12 } }}
            transition={reduced ? { duration: 0 } : { duration: 0.24, delay: 0.06 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
