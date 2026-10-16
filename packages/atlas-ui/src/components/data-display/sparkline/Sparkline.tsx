import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import './sparkline.css';

export interface SparklinePoint {
  label: string;
  value: number;
}

export interface SparklineProps {
  /** Names the series, for example "Wave height this week". */
  label: string;
  data: readonly SparklinePoint[];
  /** Formats values for the readout and for assistive technology. */
  formatValue?: (value: number) => string;
  width?: number;
  height?: number;
  /** Shade the area under the line. */
  area?: boolean;
  /** Offer the numbers as a table, revealed by a disclosure. */
  table?: boolean;
  className?: string;
}

/**
 * A word-sized line chart you can scrub. The chart is summarised in words for screen
 * readers; a focusable scrubber reads out each point; the full data is one click away as a
 * table.
 */
export function Sparkline({
  label,
  data,
  formatValue = (v) => String(v),
  width = 200,
  height = 48,
  area = true,
  table = true,
  className,
}: SparklineProps) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 4;
  const x = (i: number) => pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`)
    .join('');
  const last = data.at(-1);
  const first = data[0];
  const minPoint = data[values.indexOf(min)];
  const maxPoint = data[values.indexOf(max)];
  const summary =
    first && last && minPoint && maxPoint
      ? `${label}: from ${formatValue(first.value)} (${first.label}) to ${formatValue(last.value)} (${last.label}). Lowest ${formatValue(min)} on ${minPoint.label}, highest ${formatValue(max)} on ${maxPoint.label}.`
      : label;
  const current = active === null ? null : data[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (active ?? -1) + 1,
      ArrowLeft: (active ?? data.length) - 1,
      Home: 0,
      End: data.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(Math.min(Math.max(next, 0), data.length - 1));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    setActive(Math.round(Math.min(Math.max(fraction, 0), 1) * (data.length - 1)));
  };

  return (
    <figure className={['atl-spark', className].filter(Boolean).join(' ')}>
      <div className="atl-spark__chart" style={{ width, height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={summary}
        >
          {area ? (
            <path
              className="atl-spark__area"
              d={`${line}L${x(data.length - 1)} ${height}L${x(0)} ${height}Z`}
            />
          ) : null}
          <path className="atl-spark__line" d={line} />
          {last ? (
            <circle className="atl-spark__end" cx={x(data.length - 1)} cy={y(last.value)} r={2.5} />
          ) : null}
          {current && active !== null ? (
            <g className="atl-spark__cursor">
              <line x1={x(active)} x2={x(active)} y1={0} y2={height} />
              <circle cx={x(active)} cy={y(current.value)} r={3.5} />
            </g>
          ) : null}
        </svg>
        <div
          className="atl-spark__scrub"
          role="slider"
          tabIndex={0}
          aria-label={`Inspect ${label}`}
          aria-valuemin={0}
          aria-valuemax={data.length - 1}
          aria-valuenow={active ?? data.length - 1}
          aria-valuetext={
            current
              ? `${current.label}: ${formatValue(current.value)}`
              : 'Use arrow keys to read each point'
          }
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
        />
      </div>
      <figcaption className="atl-spark__caption">
        <span className="atl-spark__label">{label}</span>
        <span className="atl-spark__readout" aria-hidden="true">
          {current
            ? `${current.label} · ${formatValue(current.value)}`
            : last
              ? `${last.label} · ${formatValue(last.value)}`
              : ''}
        </span>
      </figcaption>
      {table ? (
        <details className="atl-spark__table">
          <summary>Show as a table</summary>
          <table aria-labelledby={`${id}-caption`}>
            <caption id={`${id}-caption`} className="atl-visually-hidden">
              {label}
            </caption>
            <tbody>
              {data.map((d) => (
                <tr key={d.label}>
                  <th scope="row">{d.label}</th>
                  <td>{formatValue(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ) : null}
    </figure>
  );
}
