import { useId, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { IconClose } from '../../../icons/close';
import { DialogShell } from '../../../primitives/dialog';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { Button } from '../../actions/button/Button';
import './drawer.css';

export interface DrawerProps {
  title: ReactNode;
  description?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Edge the sheet slides from. */
  side?: 'right' | 'left' | 'bottom';
  footer?: ReactNode;
  children?: ReactNode;
}

const CLOSE_FRACTION = 0.3;
const FLICK_SPEED = 0.6; // px per ms

/**
 * A sheet that slides in from an edge and can be dragged away. A modal dialog underneath:
 * focus stays inside while it is open and returns to the trigger when it closes.
 */
export function Drawer({
  title,
  description,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'right',
  footer,
  children,
}: DrawerProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; time: number; size: number } | null>(null);
  const [offset, setOffset] = useState(0);

  const axis = side === 'bottom' ? 'clientY' : 'clientX';
  // Positive offset always means "toward closed".
  const direction = side === 'left' ? -1 : 1;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest('button, a, input, select, textarea')
    )
      return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    drag.current = {
      start: event[axis],
      time: performance.now(),
      size: side === 'bottom' ? rect.height : rect.width,
    };
    panel.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOffset(Math.max(0, (event[axis] - drag.current.start) * direction));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const distance = Math.max(0, (event[axis] - d.start) * direction);
    const speed = distance / Math.max(performance.now() - d.time, 1);
    setOffset(0);
    if (distance > d.size * CLOSE_FRACTION || (speed > FLICK_SPEED && distance > 24))
      setOpen(false);
  };

  return (
    <DialogShell
      open={open}
      onClose={() => setOpen(false)}
      labelledBy={`${id}-title`}
      describedBy={description ? `${id}-description` : undefined}
      className="atl-dialog-surface atl-drawer"
    >
      <div
        ref={panelRef}
        className="atl-drawer__panel"
        data-side={side}
        data-dragging={offset > 0 || undefined}
        style={{ '--atl-drawer-drag': `${offset * direction}px` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="atl-drawer__handle" aria-hidden="true" />
        <div className="atl-dialog__header">
          <div className="atl-dialog__titles">
            <h2 id={`${id}-title`} className="atl-dialog__title">
              {title}
            </h2>
            {description ? (
              <p id={`${id}-description`} className="atl-dialog__description">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="quiet"
            size="s"
            icon={<IconClose />}
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="atl-dialog__body atl-drawer__body">{children}</div>
        {footer ? <div className="atl-dialog__footer">{footer}</div> : null}
      </div>
    </DialogShell>
  );
}
