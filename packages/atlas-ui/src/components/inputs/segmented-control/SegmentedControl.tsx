import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './segmented-control.css';

export interface SegmentOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Names the group. Shown above it unless `hideLabel` is set. */
  label: ReactNode;
  hideLabel?: boolean;
  options: readonly SegmentOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated when omitted, so separate controls never share a group. */
  name?: string;
  size?: 's' | 'm';
  disabled?: boolean;
  className?: string;
}

/**
 * A small set of mutually exclusive options with a marker that slides to the selection.
 * Built on native radio buttons, so arrow keys, form submission and screen readers behave
 * exactly as they do for any radio group.
 */
export function SegmentedControl({
  label,
  hideLabel = false,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  size = 'm',
  disabled = false,
  className,
}: SegmentedControlProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? options[0]?.value ?? '',
    onChange: onValueChange,
  });
  const id = useId();
  const groupName = name ?? `${id}-segments`;
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const place = () => {
      const input = track.querySelector<HTMLInputElement>('input:checked');
      const option = input?.closest<HTMLElement>('.atl-seg__option');
      if (!option) {
        track.style.setProperty('--atl-seg-w', '0px');
        return;
      }
      track.style.setProperty('--atl-seg-x', `${option.offsetLeft}px`);
      track.style.setProperty('--atl-seg-w', `${option.offsetWidth}px`);
    };
    place();
    const frame = requestAnimationFrame(() => track.setAttribute('data-ready', ''));
    const observer = new ResizeObserver(place);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [selected, options]);

  return (
    <div className={['atl-seg', className].filter(Boolean).join(' ')} data-size={size}>
      <span id={`${id}-label`} className={hideLabel ? 'atl-visually-hidden' : 'atl-seg__label'}>
        {label}
      </span>
      <div
        ref={trackRef}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="atl-seg__track"
      >
        <span className="atl-seg__marker" aria-hidden="true" />
        {options.map((option) => (
          <label
            key={option.value}
            className="atl-seg__option"
            data-disabled={option.disabled || disabled || undefined}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={selected === option.value}
              disabled={option.disabled || disabled}
              onChange={() => setSelected(option.value)}
            />
            <span className="atl-seg__face">
              {option.icon ? (
                <span className="atl-seg__icon" aria-hidden="true">
                  {option.icon}
                </span>
              ) : null}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
