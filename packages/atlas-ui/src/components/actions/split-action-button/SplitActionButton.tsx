import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { IconChevronDown } from '../../../icons/chevron-down';
import { MenuList, type MenuCloseReason, type MenuItem } from '../../../primitives/menu';
import { useDismiss } from '../../../primitives/use-dismiss';
import { usePlacement } from '../../../primitives/use-placement';
import { usePopover } from '../../../primitives/use-popover';
import { Button, type ButtonSize } from '../button/Button';
import './split-action-button.css';

export interface SplitActionButtonProps {
  /** The main action's label. */
  label: string;
  onAction: () => void;
  /** Alternatives offered behind the seam. */
  actions: readonly MenuItem[];
  /** Accessible name of the menu button, for example "More ways to save". */
  menuLabel: string;
  variant?: 'primary' | 'secondary';
  size?: ButtonSize;
  disabled?: boolean;
}

/**
 * One main action with alternatives behind a seam. The main half runs the common case in
 * one press; the narrow half is a WAI-ARIA menu button listing the rest.
 */
export function SplitActionButton({
  label,
  onAction,
  actions,
  menuLabel,
  variant = 'primary',
  size = 'm',
  disabled = false,
}: SplitActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [initialFocus, setInitialFocus] = useState<'first' | 'last'>('first');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const menuId = useId();

  usePopover(popoverRef, open);
  const placement = usePlacement(triggerRef, popoverRef, open, {
    side: 'bottom',
    align: 'end',
    offset: 6,
  });
  useDismiss({
    open,
    layerRef: popoverRef,
    triggerRef,
    escape: false,
    onDismiss: () => setOpen(false),
  });

  const openMenu = (focus: 'first' | 'last') => {
    setInitialFocus(focus);
    setOpen(true);
  };

  const close = (reason: MenuCloseReason) => {
    setOpen(false);
    if (reason !== 'tab') triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  return (
    <div className="atl-split" data-variant={variant} data-open={open || undefined}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        className="atl-split__main"
        onClick={onAction}
      >
        {label}
      </Button>
      <span className="atl-split__seam" aria-hidden="true" />
      <Button
        ref={triggerRef}
        id={triggerId}
        variant={variant}
        size={size}
        disabled={disabled}
        className="atl-split__more"
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        icon={<IconChevronDown />}
        onClick={() => (open ? setOpen(false) : openMenu('first'))}
        onKeyDown={onTriggerKeyDown}
      />
      {open ? (
        <div
          ref={popoverRef}
          popover="manual"
          className="atl-menu-popover"
          // Transparent rather than hidden until placed, so the first item can take focus at once.
          style={
            placement ? { left: placement.x, top: placement.y } : { left: 0, top: 0, opacity: 0 }
          }
        >
          <MenuList
            id={menuId}
            items={actions}
            labelledBy={triggerId}
            initialFocus={initialFocus}
            onSelect={() => {}}
            onClose={close}
          />
        </div>
      ) : null}
    </div>
  );
}
