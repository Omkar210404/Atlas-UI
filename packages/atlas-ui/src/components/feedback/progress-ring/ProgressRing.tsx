import './progress-ring.css';

export interface ProgressRingProps {
  /** Names the progress, for example "Downloading charts". */
  label: string;
  /** 0 to `max`. Leave undefined for indeterminate progress. */
  value?: number;
  max?: number;
  /** Diameter in px. */
  size?: number;
  /** Show the percentage in the middle. */
  showValue?: boolean;
  /** Text for assistive technology, such as "3 of 8 charts". Defaults to a percentage. */
  valueText?: string;
  tone?: 'ink' | 'success' | 'warning';
  className?: string;
}

/**
 * Progress drawn as a ring inside a bearing-style bezel. Determinate when it has a value,
 * indeterminate (a sweeping arc) when it does not. Follows the ARIA progressbar role.
 */
export function ProgressRing({
  label,
  value,
  max = 100,
  size = 96,
  showValue = true,
  valueText,
  tone = 'ink',
  className,
}: ProgressRingProps) {
  const determinate = value !== undefined;
  const fraction = determinate ? Math.min(Math.max(value / max, 0), 1) : 0.25;
  const percent = Math.round(fraction * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? max : undefined}
      aria-valuenow={determinate ? value : undefined}
      aria-valuetext={determinate ? (valueText ?? `${percent}%`) : undefined}
      className={['atl-ring', className].filter(Boolean).join(' ')}
      data-indeterminate={determinate ? undefined : ''}
      data-tone={tone}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {/* Bezel ticks every 10%, like the degree marks on a compass rose. */}
        <g className="atl-ring__ticks">
          {Array.from({ length: 40 }, (_, i) => (
            <line
              key={i}
              x1="50"
              y1={i % 4 === 0 ? 2 : 3.5}
              x2="50"
              y2="6"
              transform={`rotate(${i * 9} 50 50)`}
            />
          ))}
        </g>
        <circle className="atl-ring__track" cx="50" cy="50" r={radius} />
        <circle
          className="atl-ring__value"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      {determinate && showValue && size >= 56 ? (
        <span className="atl-ring__label" aria-hidden="true">
          {percent}
          <small>%</small>
        </span>
      ) : null}
    </div>
  );
}
