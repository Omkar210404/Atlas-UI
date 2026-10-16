import { useCallback, useRef, useState } from 'react';

interface Options<T> {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
}

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * Whether it is controlled is decided on first render, like native inputs.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: Options<T>): [T, (next: T | ((previous: T) => T)) => void] {
  const isControlled = useRef(value !== undefined).current;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? (value as T) : internal;

  const latest = useRef({ current, onChange });
  latest.current = { current, onChange };

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T)(latest.current.current) : next;
      if (Object.is(resolved, latest.current.current)) return;
      if (!isControlled) setInternal(resolved);
      latest.current.onChange?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue];
}
