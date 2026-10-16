import { useEffect, useRef, type RefObject } from 'react';

interface DismissOptions {
  open: boolean;
  onDismiss: (reason: 'escape' | 'outside' | 'focus-out') => void;
  /** The layer that should stay open while interacted with. */
  layerRef: RefObject<HTMLElement | null>;
  /** The trigger: clicks on it are not "outside" (the trigger toggles on its own). */
  triggerRef?: RefObject<HTMLElement | null>;
  escape?: boolean;
  outside?: boolean;
  focusOut?: boolean;
}

/**
 * Closes a non-modal layer on Escape, a pointer press outside it, or focus leaving it.
 * Escape is consumed with preventDefault so outer handlers (for example the site's
 * "Escape zooms out") can ignore it by checking `event.defaultPrevented`.
 */
export function useDismiss({
  open,
  onDismiss,
  layerRef,
  triggerRef,
  escape = true,
  outside = true,
  focusOut = true,
}: DismissOptions): void {
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      Boolean(layerRef.current?.contains(target) || triggerRef?.current?.contains(target));

    const onKeyDown = (event: KeyboardEvent) => {
      if (!escape || event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      dismiss.current('escape');
    };
    const onPointerDown = (event: PointerEvent) => {
      if (outside && !inside(event.target)) dismiss.current('outside');
    };
    const onFocusIn = (event: FocusEvent) => {
      if (focusOut && !inside(event.target)) dismiss.current('focus-out');
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, escape, outside, focusOut, layerRef, triggerRef]);
}
