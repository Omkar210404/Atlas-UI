import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { announce } from '../../../primitives/announce';
import { describedBy, FieldShell, useFieldIds } from '../../../primitives/field';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './text-field.css';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'prefix'
>;

export interface TextFieldProps extends NativeProps {
  ref?: Ref<HTMLInputElement & HTMLTextAreaElement>;
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  hint?: ReactNode;
  /** An error message. Setting it marks the field invalid. */
  error?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Grow into a multi-line textarea with this many rows. */
  multiline?: number;
  /** Text or an icon shown inside the box before the input, such as a unit or a search icon. */
  prefix?: ReactNode;
  suffix?: ReactNode;
  hideLabel?: boolean;
}

/**
 * A labelled text field with hint, error and an optional character counter. The label sits
 * above the box and never floats away; the error is announced through `aria-describedby`.
 */
export function TextField({
  ref,
  id,
  label,
  hint,
  error,
  value,
  defaultValue = '',
  onValueChange,
  multiline,
  prefix,
  suffix,
  required,
  maxLength,
  hideLabel,
  className,
  ...rest
}: TextFieldProps) {
  const ids = useFieldIds(id);
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const remaining = maxLength ? maxLength - text.length : null;
  const countId = `${ids.inputId}-count`;
  // undefined until the first render's check, then the last milestone announced (or null).
  const lastAnnounced = useRef<number | null | undefined>(undefined);

  // Announce the remaining count once it gets low, at most at a few milestones.
  useEffect(() => {
    if (remaining === null) return;
    const milestone = remaining <= 0 ? 0 : remaining <= 5 ? 5 : remaining <= 10 ? 10 : null;
    if (milestone === null) {
      lastAnnounced.current = null;
      return;
    }
    // A field that starts near its limit says so on focus (aria-describedby), not on load.
    if (lastAnnounced.current === undefined) {
      lastAnnounced.current = milestone;
      return;
    }
    if (lastAnnounced.current === milestone) return;
    lastAnnounced.current = milestone;
    const note = remaining <= 0 ? 'Character limit reached' : `${remaining} characters left`;
    announce(note);
  }, [remaining]);

  const shared = {
    id: ids.inputId,
    className: 'atl-text-field__input',
    value: text,
    required,
    maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-describedby':
      [describedBy(ids, hint, error), maxLength ? countId : null].filter(Boolean).join(' ') ||
      undefined,
    onChange: (event: { target: { value: string } }) => setText(event.target.value),
  };

  return (
    <FieldShell
      ids={ids}
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={['atl-text-field', className].filter(Boolean).join(' ')}
      aside={
        maxLength ? (
          <span
            className="atl-text-field__counter"
            data-low={remaining !== null && remaining <= 10 ? '' : undefined}
          >
            <span aria-hidden="true">
              {text.length}/{maxLength}
            </span>
            <span id={countId} className="atl-visually-hidden">
              {text.length} of {maxLength} characters used
            </span>
          </span>
        ) : null
      }
    >
      <div
        className="atl-control-box atl-text-field__box"
        data-multiline={multiline ? '' : undefined}
      >
        {prefix ? (
          <span className="atl-text-field__affix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        {multiline ? (
          <textarea ref={ref} rows={multiline} {...shared} {...(rest as object)} />
        ) : (
          <input ref={ref} {...shared} {...rest} />
        )}
        {suffix ? (
          <span className="atl-text-field__affix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}
