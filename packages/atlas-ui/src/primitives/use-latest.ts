import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * A ref that always holds the latest value, updated after render. Lets effects and event
 * handlers call the newest callback without re-subscribing when it changes.
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
