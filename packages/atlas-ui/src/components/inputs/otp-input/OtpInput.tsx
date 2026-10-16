import { useRef, useState, type ReactNode } from 'react';
import { describedBy, FieldShell, useFieldIds } from '../../../primitives/field';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './otp-input.css';

export interface OtpInputProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Number of characters in the code. */
  length?: number;
  /** `numeric` accepts digits; `alphanumeric` accepts letters and digits (shown in capitals). */
  mode?: 'numeric' | 'alphanumeric';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once the code reaches its full length. */
  onComplete?: (code: string) => void;
  /** Show dots instead of characters. */
  mask?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function sanitizeCode(
  raw: string,
  length: number,
  mode: 'numeric' | 'alphanumeric',
): string {
  const allowed = mode === 'numeric' ? /\d/ : /[\dA-Za-z]/;
  return Array.from(raw)
    .filter((c) => allowed.test(c))
    .join('')
    .toUpperCase()
    .slice(0, length);
}

/**
 * A one-time code drawn as cells but typed into a single native input, so paste, SMS
 * autofill and password managers work, and screen readers hear one field, not six.
 */
export function OtpInput({
  label,
  hint,
  error,
  length = 6,
  mode = 'numeric',
  value,
  defaultValue = '',
  onValueChange,
  onComplete,
  mask = false,
  disabled = false,
  name,
  className,
}: OtpInputProps) {
  const ids = useFieldIds();
  const [code, setCode] = useControllableState({
    value,
    defaultValue: sanitizeCode(defaultValue, length, mode),
    onChange: onValueChange,
  });
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Editing only happens at the end, so the caret cell is always the next empty one.
  const keepCaretAtEnd = () => {
    const input = inputRef.current;
    if (!input) return;
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end)
      input.setSelectionRange(end, end);
  };

  const activeIndex = Math.min(code.length, length - 1);

  return (
    <FieldShell
      ids={ids}
      label={label}
      hint={hint}
      error={error}
      className={['atl-otp', className].filter(Boolean).join(' ')}
    >
      <div
        className="atl-otp__frame"
        data-focused={focused || undefined}
        data-disabled={disabled || undefined}
      >
        <input
          ref={inputRef}
          id={ids.inputId}
          className="atl-otp__input"
          type="text"
          inputMode={mode === 'numeric' ? 'numeric' : 'text'}
          autoComplete="one-time-code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          pattern={mode === 'numeric' ? '[0-9]*' : '[0-9A-Za-z]*'}
          // No maxLength: it would cut a pasted "123 456" before the separators are removed.
          value={code}
          disabled={disabled}
          name={name}
          aria-describedby={describedBy(ids, hint, error)}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            const next = sanitizeCode(event.target.value, length, mode);
            setCode(next);
            if (next.length === length && next !== code) onComplete?.(next);
          }}
          onFocus={() => {
            setFocused(true);
            requestAnimationFrame(keepCaretAtEnd);
          }}
          onBlur={() => setFocused(false)}
          onSelect={keepCaretAtEnd}
          onClick={keepCaretAtEnd}
        />
        <div className="atl-otp__cells" aria-hidden="true">
          {Array.from({ length }, (_, index) => {
            const char = code[index];
            return (
              <span
                key={index}
                className="atl-otp__cell"
                data-filled={char ? '' : undefined}
                data-active={focused && index === activeIndex ? '' : undefined}
                data-gap={length >= 6 && index === length / 2 ? '' : undefined}
              >
                {char ? (mask ? '•' : char) : null}
              </span>
            );
          })}
        </div>
      </div>
    </FieldShell>
  );
}
