import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { Side } from '../../../primitives/place';
import { usePlacement } from '../../../primitives/use-placement';
import { usePopover } from '../../../primitives/use-popover';
import './tooltip.css';

export interface TooltipProps {
  /** Short text that adds to the trigger's name; never the only place information lives. */
  content: ReactNode;
  /** One focusable element, such as a button. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  side?: Side;
  /** Milliseconds of hover before showing. Keyboard focus shows it at once. */
  delay?: number;
}

/**
 * A short description shown on hover and keyboard focus. Meets WCAG 1.4.13: it can be
 * dismissed with Escape without moving focus, it stays while the pointer is over it, and it
 * stays until the pointer or focus leaves.
 */
export function Tooltip({ content, children, side = 'top', delay = 300 }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // The anchor is a wrapper around the trigger, so the trigger's own ref is left alone.
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  usePopover(tipRef, open);
  const placement = usePlacement(anchorRef, tipRef, open, { side, offset: 8 });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = (wait: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), wait);
  };
  // A short grace period lets the pointer travel from the trigger onto the tooltip.
  const hide = (wait = 100) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), wait);
  };

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      })
    : children;

  return (
    <>
      {/* Pointer, focus and Escape events bubble up from the trigger to this wrapper. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <span
        ref={anchorRef}
        className="atl-tooltip-anchor"
        onPointerEnter={(event: PointerEvent) => {
          if (event.pointerType !== 'touch') show(delay);
        }}
        onPointerLeave={() => hide()}
        onFocus={(event: FocusEvent) => {
          if ((event.target as HTMLElement).matches(':focus-visible')) show(0);
        }}
        onBlur={() => hide(0)}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            window.clearTimeout(timer.current);
            setOpen(false);
          }
        }}
      >
        {trigger}
      </span>
      <div
        ref={tipRef}
        id={id}
        role="tooltip"
        popover="manual"
        className="atl-tooltip"
        data-side={placement?.side ?? side}
        style={
          placement ? { left: placement.x, top: placement.y } : { left: 0, top: 0, opacity: 0 }
        }
        onPointerEnter={() => window.clearTimeout(timer.current)}
        onPointerLeave={() => hide()}
      >
        {content}
      </div>
    </>
  );
}
