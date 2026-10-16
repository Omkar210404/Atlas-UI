import { useEffect, useRef, type ReactNode } from 'react';
import { IconAlert } from '../../../icons/alert';
import { IconCheck } from '../../../icons/check';
import { announce } from '../../../primitives/announce';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { useLatest } from '../../../primitives/use-latest';
import { Button, type ButtonProps } from '../button/Button';
import './loading-state-button.css';

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateButtonProps extends Omit<
  ButtonProps,
  'children' | 'onClick' | 'icon'
> {
  /** What the button says in each state. Use the same verb throughout: Save, Saving…, Saved. */
  labels: Record<LoadState, string>;
  /** The work to do. A returned promise drives the states; a rejection shows the error state. */
  onAction: () => unknown;
  /** Control the state yourself instead of letting the promise drive it. */
  state?: LoadState;
  onStateChange?: (state: LoadState) => void;
  /** Milliseconds before a success returns to idle. */
  resetAfter?: number;
  /** An icon for the idle state. */
  icon?: ReactNode;
}

function Spinner() {
  return (
    <svg
      className="atl-load__spinner"
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 3a7 7 0 0 1 7 7" />
    </svg>
  );
}

/**
 * A button that shows its work: idle, then busy, then the outcome, without ever changing
 * width. Each state's label is announced, failures assertively.
 */
export function LoadingStateButton({
  labels,
  onAction,
  state: stateProp,
  onStateChange,
  resetAfter = 2400,
  icon,
  className,
  ...props
}: LoadingStateButtonProps) {
  const [state, setState] = useControllableState<LoadState>({
    value: stateProp,
    defaultValue: 'idle',
    onChange: onStateChange,
  });
  const latestLabels = useLatest(labels);
  const first = useRef(true);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Announce every state change after the first render.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (state === 'idle') return;
    announce(latestLabels.current[state], state === 'error' ? 'assertive' : 'polite');
  }, [state, latestLabels]);

  useEffect(() => {
    if (state !== 'success') return;
    const timer = window.setTimeout(() => setState('idle'), resetAfter);
    return () => window.clearTimeout(timer);
  }, [state, resetAfter, setState]);

  const run = async () => {
    if (state === 'loading') return;
    setState('loading');
    try {
      await onAction();
      if (alive.current) setState('success');
    } catch {
      if (alive.current) setState('error');
    }
  };

  const faces: Array<[LoadState, ReactNode]> = [
    ['idle', icon],
    ['loading', <Spinner key="spinner" />],
    ['success', <IconCheck key="check" />],
    ['error', <IconAlert key="alert" />],
  ];

  return (
    <Button
      {...props}
      className={['atl-load', className].filter(Boolean).join(' ')}
      data-state={state}
      aria-busy={state === 'loading' || undefined}
      aria-disabled={state === 'loading' || props['aria-disabled'] === 'true' ? 'true' : undefined}
      onClick={() => {
        void run();
      }}
    >
      <span className="atl-load__stack">
        {faces.map(([face, faceIcon]) => (
          <span
            key={face}
            className="atl-load__face"
            data-active={face === state || undefined}
            // Hidden from assistive technology at once, even while it fades out visually.
            aria-hidden={face === state ? undefined : true}
          >
            {faceIcon ? (
              <span className="atl-load__icon" aria-hidden="true">
                {faceIcon}
              </span>
            ) : null}
            <span>{labels[face]}</span>
          </span>
        ))}
      </span>
    </Button>
  );
}
