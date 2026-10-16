import { useId, type ReactNode } from 'react';
import { IconAlert } from '../icons/alert';
import './field.css';

export interface FieldIds {
  inputId: string;
  labelId: string;
  hintId: string;
  errorId: string;
}

export function useFieldIds(id?: string): FieldIds {
  const base = useId();
  return {
    inputId: id ?? `${base}-input`,
    labelId: `${base}-label`,
    hintId: `${base}-hint`,
    errorId: `${base}-error`,
  };
}

/** The `aria-describedby` value for a field: the error first, then the hint. */
export function describedBy(
  ids: FieldIds,
  hint?: ReactNode,
  error?: ReactNode,
): string | undefined {
  return (
    [error ? ids.errorId : null, hint ? ids.hintId : null].filter(Boolean).join(' ') || undefined
  );
}

interface FieldShellProps {
  ids: FieldIds;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Render the label as a `<label for>` (native inputs) or a plain element referenced by id. */
  labelAs?: 'label' | 'span';
  /** Hide the label visually; it still names the control. */
  hideLabel?: boolean;
  /** Content on the label row's right, such as a character counter. */
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label, hint and error around a control, wired together with ids. */
export function FieldShell({
  ids,
  label,
  hint,
  error,
  required,
  labelAs = 'label',
  hideLabel = false,
  aside,
  className,
  children,
}: FieldShellProps) {
  const labelContent = (
    <>
      {label}
      {required ? (
        <>
          {' '}
          <span className="atl-field__required">(required)</span>
        </>
      ) : null}
    </>
  );
  const labelClass = hideLabel ? 'atl-field__label atl-visually-hidden' : 'atl-field__label';
  return (
    <div
      className={['atl-field', className].filter(Boolean).join(' ')}
      data-invalid={error ? '' : undefined}
    >
      <div className="atl-field__top">
        {labelAs === 'label' ? (
          <label id={ids.labelId} htmlFor={ids.inputId} className={labelClass}>
            {labelContent}
          </label>
        ) : (
          <span id={ids.labelId} className={labelClass}>
            {labelContent}
          </span>
        )}
        {aside}
      </div>
      {children}
      {hint ? (
        <p id={ids.hintId} className="atl-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={ids.errorId} className="atl-field__error">
          <IconAlert size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
