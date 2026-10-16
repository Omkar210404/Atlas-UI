import { useState, type KeyboardEvent } from 'react';
import './heat-grid.css';

export interface HeatGridProps {
  /** Names the grid, for example "Wind speed by day and hour". */
  label: string;
  rows: readonly string[];
  columns: readonly string[];
  /** values[row][column] */
  values: readonly (readonly number[])[];
  formatValue?: (value: number) => string;
  /** Print each value inside its cell. */
  showValues?: boolean;
  className?: string;
}

const STEPS = 5;

/**
 * A grid of cells shaded by value, in five depth tints with a legend. Follows the WAI-ARIA
 * grid pattern: one Tab stop, arrow keys between cells, and every cell names its row,
 * column and value.
 */
export function HeatGrid({
  label,
  rows,
  columns,
  values,
  formatValue = (v) => String(v),
  showValues = false,
  className,
}: HeatGridProps) {
  const [focus, setFocus] = useState({ r: 0, c: 0 });
  const flat = values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const step = (v: number) =>
    Math.min(STEPS - 1, Math.floor(((v - min) / (max - min || 1)) * STEPS));
  const bounds = (v: number) => min + ((max - min) * v) / STEPS;

  const move = (r: number, c: number, el: HTMLElement) => {
    const next = {
      r: Math.min(Math.max(r, 0), rows.length - 1),
      c: Math.min(Math.max(c, 0), columns.length - 1),
    };
    setFocus(next);
    el.closest('[role="grid"]')
      ?.querySelector<HTMLElement>(`[data-cell="${next.r}-${next.c}"]`)
      ?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { r, c } = focus;
    const moves: Record<string, [number, number]> = {
      ArrowRight: [r, c + 1],
      ArrowLeft: [r, c - 1],
      ArrowDown: [r + 1, c],
      ArrowUp: [r - 1, c],
      Home: event.ctrlKey ? [0, 0] : [r, 0],
      End: event.ctrlKey ? [rows.length - 1, columns.length - 1] : [r, columns.length - 1],
    };
    const target = moves[event.key];
    if (!target) return;
    event.preventDefault();
    move(target[0], target[1], event.target as HTMLElement);
  };

  return (
    <figure className={['atl-heat', className].filter(Boolean).join(' ')}>
      {/* The cells take focus (roving tabindex); the grid only routes their arrow keys. */}
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        role="grid"
        aria-label={label}
        className="atl-heat__grid"
        onKeyDown={onKeyDown}
        style={{ '--cols': columns.length } as React.CSSProperties}
      >
        <div role="row" className="atl-heat__row">
          <span role="columnheader" className="atl-heat__corner" aria-hidden="true" />
          {columns.map((col) => (
            <span key={col} role="columnheader" className="atl-heat__colhead">
              {col}
            </span>
          ))}
        </div>
        {rows.map((row, r) => (
          <div key={row} role="row" className="atl-heat__row">
            <span role="rowheader" className="atl-heat__rowhead">
              {row}
            </span>
            {columns.map((col, c) => {
              const value = values[r]?.[c] ?? 0;
              return (
                // Keys are handled once on the grid (WAI-ARIA grid pattern).
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <span
                  key={col}
                  role="gridcell"
                  tabIndex={focus.r === r && focus.c === c ? 0 : -1}
                  data-cell={`${r}-${c}`}
                  data-step={step(value)}
                  className="atl-heat__cell"
                  aria-label={`${row}, ${col}: ${formatValue(value)}`}
                  onFocus={() => setFocus({ r, c })}
                  onClick={(event) => move(r, c, event.currentTarget)}
                >
                  <span
                    className="atl-heat__value"
                    aria-hidden="true"
                    data-visible={showValues || undefined}
                  >
                    {formatValue(value)}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <figcaption className="atl-heat__legend" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className="atl-heat__key">
            <span className="atl-heat__swatch" data-step={i} />
            {formatValue(Math.round(bounds(i)))}–{formatValue(Math.round(bounds(i + 1)))}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
