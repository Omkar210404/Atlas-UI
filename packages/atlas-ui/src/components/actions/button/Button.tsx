import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 's' | 'm' | 'l';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  /** `primary` is for the one main action in a view; `quiet` for low-emphasis actions. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** An icon shown before (or after) the label. Decorative; the label names the button. */
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  children?: ReactNode;
}

/**
 * The base button. `disabled` keeps its native meaning; pass `aria-disabled` instead when
 * the button must stay focusable (for example while it explains why it cannot be used).
 */
export function Button({
  ref,
  variant = 'secondary',
  size = 'm',
  icon,
  iconPosition = 'start',
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const ariaDisabled = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';
  return (
    <button
      ref={ref}
      type={type}
      className={['atl-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-icon-only={!children || undefined}
      onClick={(event) => {
        if (ariaDisabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {icon && iconPosition === 'start' ? (
        <span className="atl-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children ? <span className="atl-button__label">{children}</span> : null}
      {icon && iconPosition === 'end' ? (
        <span className="atl-button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
