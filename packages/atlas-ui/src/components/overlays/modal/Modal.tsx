import { useId, type ReactNode } from 'react';
import { IconClose } from '../../../icons/close';
import { DialogShell } from '../../../primitives/dialog';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { Button } from '../../actions/button/Button';
import './modal.css';

export interface ModalProps {
  /** Names the dialog. Required: every dialog needs a title. */
  title: ReactNode;
  description?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Buttons along the bottom, such as Cancel and Confirm. */
  footer?: ReactNode;
  size?: 's' | 'm' | 'l';
  /** Allow Escape, the backdrop and the close button to dismiss it. Turn off for decisions that must be made. */
  dismissible?: boolean;
  children?: ReactNode;
}

/**
 * A modal dialog that holds focus until it is closed. Built on `<dialog>`, with Tab
 * wrapping inside it, the page behind it inert and unscrollable, and focus returned to
 * whatever opened it.
 */
export function Modal({
  title,
  description,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  footer,
  size = 'm',
  dismissible = true,
  children,
}: ModalProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = useId();
  return (
    <DialogShell
      open={open}
      onClose={() => setOpen(false)}
      dismissible={dismissible}
      labelledBy={`${id}-title`}
      describedBy={description ? `${id}-description` : undefined}
      className="atl-dialog-surface atl-modal"
    >
      <div className="atl-modal__panel" data-size={size}>
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
          {dismissible ? (
            <Button
              variant="quiet"
              size="s"
              icon={<IconClose />}
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
          ) : null}
        </div>
        {children ? <div className="atl-dialog__body">{children}</div> : null}
        {footer ? <div className="atl-dialog__footer">{footer}</div> : null}
      </div>
    </DialogShell>
  );
}
