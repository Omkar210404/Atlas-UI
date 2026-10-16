import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../../primitives/use-reduced-motion';
import './stat-counter.css';

export interface StatCounterProps {
  /** What the number counts, shown under it: "Nautical miles logged". */
  label: string;
  value: number;
  /** Formats the number, for example with units or separators. Digits roll; other characters do not. */
  format?: (value: number) => string;
  /** A short line under the label, such as the comparison period. */
  detail?: string;
  className?: string;
}

const defaultFormat = (v: number) => v.toLocaleString('en-GB');

/**
 * A figure that rolls to its new value, digit by digit, like an odometer. Only the final
 * value is exposed to assistive technology, so nothing is read out mid-roll.
 */
export function StatCounter({
  label,
  value,
  format = defaultFormat,
  detail,
  className,
}: StatCounterProps) {
  const text = format(value);
  // Start at zero on first paint, then roll to the value; later changes roll from the last value.
  const [rolled, setRolled] = useState(() => prefersReducedMotion());
  useEffect(() => {
    if (rolled) return;
    const frame = requestAnimationFrame(() => setRolled(true));
    return () => cancelAnimationFrame(frame);
  }, [rolled]);
  const shown = rolled ? text : text.replace(/\d/g, '0');

  return (
    <div className={['atl-stat', className].filter(Boolean).join(' ')}>
      <p className="atl-stat__value">
        <span className="atl-visually-hidden">{text}</span>
        <span className="atl-stat__digits" aria-hidden="true">
          {shown.split('').map((char, i) => {
            const digit = /\d/.test(char) ? Number(char) : null;
            return digit === null ? (
              <span key={`${i}-${char}`} className="atl-stat__char">
                {char}
              </span>
            ) : (
              <span
                key={i}
                className="atl-stat__wheel"
                style={{ '--d': digit, '--i': i } as React.CSSProperties}
              >
                <span className="atl-stat__strip">
                  {Array.from({ length: 10 }, (_, n) => (
                    <span key={n}>{n}</span>
                  ))}
                </span>
                {/* Sizes the wheel to one digit. */}
                <span className="atl-stat__sizer">0</span>
              </span>
            );
          })}
        </span>
      </p>
      <p className="atl-stat__label">{label}</p>
      {detail ? <p className="atl-stat__detail">{detail}</p> : null}
    </div>
  );
}
