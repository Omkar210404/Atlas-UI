import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { MenuList, type MenuCloseReason, type MenuItem } from '../../../primitives/menu';
import { useDismiss } from '../../../primitives/use-dismiss';
import { usePlacement } from '../../../primitives/use-placement';
import { usePopover } from '../../../primitives/use-popover';
import './context-menu.css';

export interface ContextMenuProps {
  /** Names the menu and the target area, for example "Chart actions". */
  label: string;
  items: readonly MenuItem[];
  /** The area that responds to right-click and to the keyboard shortcut. */
  children: ReactNode;
  className?: string;
}

/**
 * A menu of actions for an area, opened with a right-click (or long-press, where the
 * browser reports it as a context menu), Shift+F10 or the Menu key. Supports submenus.
 */
export function ContextMenu({ label, items, children, className }: ContextMenuProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const open = point !== null;

  usePopover(popoverRef, open);
  const placement = usePlacement(anchorRef, popoverRef, open, {
    side: 'bottom',
    align: 'start',
    offset: 2,
  });
  useDismiss({ open, layerRef: popoverRef, escape: false, onDismiss: () => setPoint(null) });

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPoint({ x: event.clientX, y: event.clientY });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setPoint({ x: rect.left + 16, y: rect.top + 16 });
    }
  };

  const close = (reason: MenuCloseReason) => {
    setPoint(null);
    if (reason !== 'tab') targetRef.current?.focus();
  };

  return (
    // The area must take focus so Shift+F10 and the Menu key can open its menu; it is a
    // labelled group with a hint that names those keys.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={targetRef}
      role="group"
      aria-label={label}
      aria-describedby={`${id}-hint`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className={['atl-context', className].filter(Boolean).join(' ')}
      data-open={open || undefined}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
    >
      <span id={`${id}-hint`} className="atl-visually-hidden">
        Press Shift+F10 or the Menu key for actions.
      </span>
      {children}
      {open ? (
        <>
          <span
            ref={anchorRef}
            className="atl-context__anchor"
            style={{ left: point.x, top: point.y }}
          />
          <div
            ref={popoverRef}
            popover="manual"
            className="atl-menu-popover"
            style={
              placement ? { left: placement.x, top: placement.y } : { left: 0, top: 0, opacity: 0 }
            }
          >
            <MenuList items={items} label={label} onSelect={() => {}} onClose={close} />
          </div>
        </>
      ) : null}
    </div>
  );
}
