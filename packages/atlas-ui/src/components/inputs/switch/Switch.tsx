import { useId, type ReactNode } from 'react';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './switch.css';

export interface SwitchProps {
  /** Visible label, said together with the state ("Show depth contours, on"). */
  label: ReactNode;
  /** Extra detail under the label. */
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Submit with a form under this name, as "on" when checked. */
  name?: string;
  value?: string;
  /** Put the switch before the label instead of after it. */
  labelPosition?: 'start' | 'end';
  className?: string;
}

/**
 * An on/off setting that takes effect at once. Follows the WAI-ARIA switch pattern: a
 * button with `role="switch"` and `aria-checked`. The thumb carries a mark when on, so the
 * state never relies on colour.
 */
export function Switch({
  label,
  description,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
  value = 'on',
  labelPosition = 'end',
  className,
}: SwitchProps) {
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      disabled={disabled}
      className="atl-switch__control"
      onClick={() => setChecked((c) => !c)}
    >
      <span className="atl-switch__thumb" aria-hidden="true">
        <svg viewBox="0 0 12 12" width="12" height="12">
          <path d="M2.5 6.5 5 9l4.5-6" />
        </svg>
      </span>
    </button>
  );

  return (
    <div
      className={['atl-switch', className].filter(Boolean).join(' ')}
      data-label-position={labelPosition}
      data-disabled={disabled || undefined}
    >
      {labelPosition === 'start' ? control : null}
      <span className="atl-switch__text">
        {/* Clicking the label toggles too, like a native checkbox label. */}
        <label id={labelId} htmlFor={id} className="atl-switch__label">
          {label}
        </label>
        {description ? (
          <span id={descriptionId} className="atl-switch__description">
            {description}
          </span>
        ) : null}
      </span>
      {labelPosition === 'end' ? control : null}
      {name ? <input type="hidden" name={name} value={checked ? value : ''} /> : null}
    </div>
  );
}
