import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { IconAlert } from '../../../icons/alert';
import { IconBell } from '../../../icons/bell';
import { IconCheck } from '../../../icons/check';
import { IconClose } from '../../../icons/close';
import { announce } from '../../../primitives/announce';
import { Button } from '../../actions/button/Button';
import './toast-stack.css';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before it dismisses itself. Errors default to longer. `0` keeps it until closed. */
  duration?: number;
  action?: { label: string; onAction: () => void };
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Show and dismiss toasts from anywhere inside a `ToastProvider`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>.');
  return api;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** `fixed` pins the stack to the viewport corner; `contained` keeps it inside the nearest positioned box. */
  placement?: 'fixed' | 'contained';
  /** Names the notifications region. */
  label?: string;
  /** Toasts kept at once; the oldest are removed first. */
  max?: number;
}

let counter = 0;

/**
 * Holds the toast stack. Toasts are announced through a live region as they arrive; the
 * visible stack is a labelled region you can reach with F8.
 */
export function ToastProvider({
  children,
  placement = 'fixed',
  label = 'Notifications',
  max = 4,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const dismiss = useCallback(
    (id: string) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      counter += 1;
      const id = `toast-${counter}`;
      setToasts((list) => [...list, { ...options, id }].slice(-max));
      const text = options.description ? `${options.title}. ${options.description}` : options.title;
      announce(text, options.tone === 'error' ? 'assertive' : 'polite');
      return id;
    },
    [max],
  );

  // F8 moves focus to the notifications, a common convention for landmark regions.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F8' && toasts.length > 0) {
        event.preventDefault();
        regionRef.current?.querySelector<HTMLElement>('.atl-toast')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toasts.length]);

  // Measure each toast so the expanded stack can lay them out with their real heights.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.children) as HTMLElement[];
    let offset = 0;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!;
      item.style.setProperty('--atl-toast-offset', `${offset}px`);
      item.style.setProperty('--atl-toast-i', String(items.length - 1 - i));
      offset += item.offsetHeight + 8;
    }
    list.style.setProperty('--atl-toast-total', `${Math.max(offset - 8, 0)}px`);
    list.style.setProperty('--atl-toast-front', `${items.at(-1)?.offsetHeight ?? 0}px`);
  }, [toasts]);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        ref={regionRef}
        aria-label={label}
        className="atl-toasts"
        data-placement={placement}
        data-expanded={paused || undefined}
        data-empty={toasts.length === 0 || undefined}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          if (!regionRef.current?.contains(document.activeElement)) setPaused(false);
        }}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <ol ref={listRef} className="atl-toasts__list">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} paused={paused} onDismiss={() => dismiss(t.id)} />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

const icons: Record<ToastTone, ReactNode> = {
  info: <IconBell />,
  success: <IconCheck />,
  warning: <IconAlert />,
  error: <IconAlert />,
};

function Toast({
  toast,
  paused,
  onDismiss,
}: {
  toast: ToastRecord;
  paused: boolean;
  onDismiss: () => void;
}) {
  const tone = toast.tone ?? 'info';
  const duration = toast.duration ?? (tone === 'error' ? 9000 : 5000);
  const remaining = useRef(duration);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);

  // Count down only while the stack is not paused; resume from where it stopped.
  useEffect(() => {
    if (paused || duration === 0) return;
    const began = performance.now();
    const timer = window.setTimeout(onDismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - began;
    };
  }, [paused, duration, onDismiss]);

  const onPointerDown = (event: PointerEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    start.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLLIElement>) => {
    if (start.current === null) return;
    setDrag(Math.max(0, event.clientX - start.current));
  };
  const onPointerUp = () => {
    if (start.current === null) return;
    start.current = null;
    if (drag > 80) onDismiss();
    else setDrag(0);
  };

  return (
    <li
      className="atl-toast"
      data-tone={tone}
      data-dragging={drag > 0 || undefined}
      tabIndex={-1}
      style={{ '--atl-toast-drag': `${drag}px` } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="atl-toast__icon" aria-hidden="true">
        {icons[tone]}
      </span>
      <div className="atl-toast__text">
        <p className="atl-toast__title">{toast.title}</p>
        {toast.description ? <p className="atl-toast__description">{toast.description}</p> : null}
      </div>
      {toast.action ? (
        <Button
          size="s"
          onClick={() => {
            toast.action!.onAction();
            onDismiss();
          }}
        >
          {toast.action.label}
        </Button>
      ) : null}
      <Button
        variant="quiet"
        size="s"
        icon={<IconClose />}
        aria-label={`Dismiss: ${toast.title}`}
        onClick={onDismiss}
      />
    </li>
  );
}
