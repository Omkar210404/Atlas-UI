import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { focusables } from '../../../primitives/focus';
import type { Align, Side } from '../../../primitives/place';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { useDismiss } from '../../../primitives/use-dismiss';
import { usePlacement } from '../../../primitives/use-placement';
import { usePopover } from '../../../primitives/use-popover';
import { Button, type ButtonProps } from '../../actions/button/Button';
import './popover.css';

export interface PopoverProps {
  /** The trigger button's label. */
  label: ReactNode;
  /** Extra props for the trigger button, such as `variant` or `icon`. */
  triggerProps?: Omit<ButtonProps, 'children' | 'onClick'>;
  /** Names the popover. */
  title: ReactNode;
  children: ReactNode;
  side?: Side;
  align?: Align;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Content anchored to a button that stays visible near the viewport edge: it flips to the
 * other side when there is no room and shifts along the edge, and its arrow keeps pointing
 * at the button. A non-modal dialog in the top layer.
 */
export function Popover({
  label,
  triggerProps,
  title,
  children,
  side = 'bottom',
  align = 'center',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  usePopover(panelRef, open);
  const placement = usePlacement(triggerRef, panelRef, open, {
    side,
    align,
    offset: 12,
    padding: 12,
  });

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useDismiss({
    open,
    layerRef: panelRef,
    triggerRef,
    onDismiss: (reason) => close(reason === 'escape'),
  });

  // Move focus into the popover when it opens.
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    (focusables(panelRef.current)[0] ?? panelRef.current).focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <Button
        {...triggerProps}
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Button>
      <div
        ref={panelRef}
        id={`${id}-panel`}
        popover="manual"
        role="dialog"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        className="atl-popover"
        data-side={placement?.side ?? side}
        style={
          placement
            ? ({
                left: placement.x,
                top: placement.y,
                '--atl-arrow': `${placement.arrow}px`,
              } as React.CSSProperties)
            : { left: 0, top: 0, opacity: 0 }
        }
      >
        <span className="atl-popover__arrow" aria-hidden="true" />
        <h3 id={`${id}-title`} className="atl-popover__title">
          {title}
        </h3>
        <div className="atl-popover__body">{children}</div>
      </div>
    </>
  );
}
