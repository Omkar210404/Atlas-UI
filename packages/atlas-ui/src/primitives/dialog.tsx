import { useEffect, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react';
import { focusables, trapTab } from './focus';
import { useLatest } from './use-latest';
import './dialog.css';

let locks = 0;
function lockScroll() {
  locks += 1;
  if (locks === 1) {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--atl-scrollbar-gap', `${gap}px`);
    document.documentElement.dataset.scrollLocked = '';
  }
  return () => {
    locks -= 1;
    if (locks === 0) {
      delete document.documentElement.dataset.scrollLocked;
      document.documentElement.style.removeProperty('--atl-scrollbar-gap');
    }
  };
}

export interface DialogShellProps {
  ref?: Ref<HTMLDialogElement>;
  open: boolean;
  onClose: () => void;
  /** Close on Escape and on a click on the backdrop. */
  dismissible?: boolean;
  /** Id of the element that names the dialog (its title). */
  labelledBy: string;
  describedBy?: string;
  /** Element to focus on open; defaults to the first focusable element, then the dialog. */
  initialFocus?: () => HTMLElement | null | undefined;
  className?: string;
  children: ReactNode;
}

/**
 * A modal dialog on the native `<dialog>` element: top layer, inert page behind it, labelled
 * by its title. Adds what the element leaves out: Tab wraps inside the dialog, the page
 * behind does not scroll, and focus returns to where it was when the dialog closes.
 */
export function DialogShell({
  ref,
  open,
  onClose,
  dismissible = true,
  labelledBy,
  describedBy,
  initialFocus,
  className,
  children,
}: DialogShellProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const close = useLatest(onClose);
  const focusFirst = useLatest(initialFocus);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      const target = focusFirst.current?.() ?? focusables(dialog)[0] ?? dialog;
      target.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
      if (returnTo.current?.isConnected) returnTo.current.focus({ preventScroll: true });
    }
  }, [open, focusFirst]);

  useEffect(() => (open ? lockScroll() : undefined), [open]);

  return (
    // The backdrop is part of the dialog element; a click on it is a click on the dialog
    // itself. Keyboard users close with Escape or the dialog's own close button.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={(el) => {
        dialogRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={className}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-modal="true"
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) close.current();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // Handled here so outer listeners can see it was consumed.
          event.preventDefault();
          event.stopPropagation();
          if (dismissible) close.current();
          return;
        }
        if (dialogRef.current) trapTab(event, dialogRef.current);
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) close.current();
      }}
    >
      {children}
    </dialog>
  );
}
