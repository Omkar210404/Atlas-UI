import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './range-slider.css';

export type SliderValue = number | readonly [number, number];

export interface RangeSliderProps<V extends SliderValue = SliderValue> {
  label: ReactNode;
  hideLabel?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** A number for one thumb, a pair for a range with two thumbs. */
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Called when a drag ends or a key changes the value: a good moment to save. */
  onValueCommit?: (value: V) => void;
  /** Formats values for the tooltip, the scale and assistive technology. */
  formatValue?: (value: number) => string;
  /** When to show the value above the thumb. */
  tooltip?: 'auto' | 'always' | 'never';
  /** Draw this many evenly spaced ticks along the track (with labels at both ends). */
  ticks?: number;
  /** Names for the two thumbs of a range. */
  thumbLabels?: readonly [string, string];
  disabled?: boolean;
  name?: string;
  className?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

function snap(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  // Trim floating-point noise to the step's precision.
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(snapped.toFixed(decimals));
}

/**
 * A slider with one or two thumbs and a value that rides above the thumb on a sounding
 * line. Follows the WAI-ARIA slider (and multi-thumb slider) pattern. Thumbs never cross.
 */
export function RangeSlider<V extends SliderValue>({
  label,
  hideLabel = false,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  formatValue = (v) => String(v),
  tooltip = 'auto',
  ticks,
  thumbLabels = ['Minimum', 'Maximum'],
  disabled = false,
  name,
  className,
}: RangeSliderProps<V>) {
  const [current, setCurrent] = useControllableState<V>({
    value,
    defaultValue: (defaultValue ?? min) as V,
    onChange: onValueChange,
  });
  const values: number[] = Array.isArray(current)
    ? [...(current as readonly number[])]
    : [current as number];
  const isRange = values.length === 2;
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const id = useId();
  const labelId = `${id}-label`;
  const pageStep = Math.max(step, snap((max - min) / 10, 0, step));

  const toValue = (next: number[]) => (isRange ? ([next[0], next[1]] as const) : next[0]) as V;
  const percent = (v: number) => ((v - min) / (max - min)) * 100;

  const update = (index: number, raw: number): number[] => {
    const next = [...values];
    const lo = isRange && index === 1 ? values[0]! : min;
    const hi = isRange && index === 0 ? values[1]! : max;
    next[index] = clamp(snap(raw, min, step), lo, hi);
    if (next[index] !== values[index]) setCurrent(toValue(next));
    return next;
  };

  const valueAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return min + clamp((clientX - rect.left) / rect.width, 0, 1) * (max - min);
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const v = values[index]!;
    const moves: Record<string, number> = {
      ArrowRight: v + step,
      ArrowUp: v + step,
      ArrowLeft: v - step,
      ArrowDown: v - step,
      PageUp: v + pageStep,
      PageDown: v - pageStep,
      Home: min,
      End: max,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    // Update first: `onValueCommit?.(update(...))` would skip the update without a callback.
    const next = update(index, target);
    onValueCommit?.(toValue(next));
  };

  const onTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    const raw = valueAt(event.clientX);
    // Move the nearest thumb. When both sit together, move the one on the side of the press.
    let index = 0;
    if (isRange) {
      const d0 = Math.abs(raw - values[0]!);
      const d1 = Math.abs(raw - values[1]!);
      index = d0 < d1 ? 0 : d1 < d0 ? 1 : raw > values[1]! ? 1 : 0;
    }
    event.preventDefault();
    trackRef.current!.setPointerCapture(event.pointerId);
    setDragging(index);
    update(index, raw);
    trackRef.current!.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();
  };

  const onTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    update(dragging, valueAt(event.clientX));
  };

  const endDrag = () => {
    if (dragging === null) return;
    setDragging(null);
    onValueCommit?.(toValue(values));
  };

  const tickValues =
    ticks && ticks > 0
      ? Array.from({ length: ticks + 1 }, (_, i) => min + ((max - min) * i) / ticks)
      : [];

  return (
    <div
      className={['atl-slider', className].filter(Boolean).join(' ')}
      data-tooltip={tooltip}
      data-disabled={disabled || undefined}
      data-range={isRange || undefined}
      style={
        {
          '--atl-slider-from': `${isRange ? percent(values[0]!) : 0}%`,
          '--atl-slider-to': `${percent(values[isRange ? 1 : 0]!)}%`,
        } as React.CSSProperties
      }
    >
      <span id={labelId} className={hideLabel ? 'atl-visually-hidden' : 'atl-slider__label'}>
        {label}
      </span>
      <div
        ref={trackRef}
        className="atl-slider__track"
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="atl-slider__rail" aria-hidden="true" />
        <span className="atl-slider__fill" aria-hidden="true" />
        {tickValues.map((t) => (
          <span
            key={t}
            className="atl-slider__tick"
            style={{ left: `${percent(t)}%` }}
            aria-hidden="true"
          />
        ))}
        {values.map((v, index) => {
          const thumbLabelId = `${id}-thumb-${index}`;
          return (
            <div
              key={index}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              className="atl-slider__thumb"
              data-dragging={dragging === index || undefined}
              style={{ left: `${percent(v)}%` }}
              aria-labelledby={isRange ? `${labelId} ${thumbLabelId}` : labelId}
              aria-valuemin={isRange && index === 1 ? values[0] : min}
              aria-valuemax={isRange && index === 0 ? values[1] : max}
              aria-valuenow={v}
              aria-valuetext={formatValue(v)}
              aria-orientation="horizontal"
              aria-disabled={disabled || undefined}
              onKeyDown={onKeyDown(index)}
            >
              {isRange ? (
                <span id={thumbLabelId} className="atl-visually-hidden">
                  {thumbLabels[index]}
                </span>
              ) : null}
              {tooltip !== 'never' ? (
                <span className="atl-slider__tip" aria-hidden="true">
                  {formatValue(v)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {tickValues.length ? (
        <div className="atl-slider__scale" aria-hidden="true">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      ) : null}
      {name
        ? values.map((v, index) => (
            <input
              key={index}
              type="hidden"
              name={isRange ? `${name}[${index}]` : name}
              value={v}
            />
          ))
        : null}
    </div>
  );
}
