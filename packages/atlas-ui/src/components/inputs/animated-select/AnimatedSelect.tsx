import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { IconCheck } from '../../../icons/check';
import { IconChevronDown } from '../../../icons/chevron-down';
import { describedBy, FieldShell, useFieldIds } from '../../../primitives/field';
import { createTypeahead } from '../../../primitives/typeahead';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { useDismiss } from '../../../primitives/use-dismiss';
import { usePlacement } from '../../../primitives/use-placement';
import { usePopover } from '../../../primitives/use-popover';
import './animated-select.css';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface AnimatedSelectProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * A select whose options unroll from the trigger like a chart unfolding. Follows the
 * WAI-ARIA select-only combobox pattern: focus stays on the trigger, the highlighted option
 * is exposed with `aria-activedescendant`, and typing jumps to matching options.
 */
export function AnimatedSelect({
  label,
  hideLabel,
  hint,
  error,
  options,
  value,
  defaultValue = '',
  onValueChange,
  placeholder = 'Choose…',
  name,
  required,
  disabled = false,
  className,
}: AnimatedSelectProps) {
  const ids = useFieldIds();
  const listId = `${ids.inputId}-list`;
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef(createTypeahead());

  usePopover(popoverRef, open);
  // The list is at least as wide as the trigger. Set before placement measures it.
  useLayoutEffect(() => {
    if (open && popoverRef.current && triggerRef.current) {
      popoverRef.current.style.minWidth = `${triggerRef.current.offsetWidth}px`;
    }
  }, [open]);
  const placement = usePlacement(triggerRef, popoverRef, open, {
    side: 'bottom',
    align: 'start',
    offset: 4,
  });
  useDismiss({
    open,
    layerRef: popoverRef,
    triggerRef,
    escape: false,
    focusOut: false,
    onDismiss: () => setOpen(false),
  });

  const selectedIndex = options.findIndex((o) => o.value === selected);
  const selectedOption = options[selectedIndex];
  const optionId = (index: number) => `${listId}-${index}`;
  const enabled = (index: number) => Boolean(options[index] && !options[index]!.disabled);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open && active >= 0)
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const openAt = (index: number) => {
    if (disabled) return;
    setActive(index);
    setOpen(true);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option && !option.disabled) setSelected(option.value);
    setOpen(false);
  };

  /** The next enabled index from `from` in direction `dir`, stopping at the ends. */
  const step = (from: number, dir: 1 | -1, count = 1) => {
    let index = from;
    let moved = 0;
    let candidate = from;
    while (moved < count) {
      candidate += dir;
      if (candidate < 0 || candidate >= options.length) break;
      if (enabled(candidate)) {
        index = candidate;
        moved += 1;
      }
    }
    return index;
  };
  const first = () => step(-1, 1);
  const last = () => step(options.length, -1);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const { key, altKey } = event;
    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openAt(selectedIndex >= 0 ? selectedIndex : first());
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault();
        openAt(key === 'Home' ? first() : last());
      } else {
        const match = typeahead.current(
          key,
          options.map((o) => o.label),
          selectedIndex,
        );
        if (match !== -1 && enabled(match)) {
          event.preventDefault();
          openAt(match);
        }
      }
      return;
    }
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive((i) => step(i, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (altKey) commit(active);
        else setActive((i) => step(i, -1));
        break;
      case 'PageDown':
        event.preventDefault();
        setActive((i) => step(i, 1, 10));
        break;
      case 'PageUp':
        event.preventDefault();
        setActive((i) => step(i, -1, 10));
        break;
      case 'Home':
        event.preventDefault();
        setActive(first());
        break;
      case 'End':
        event.preventDefault();
        setActive(last());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(active);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        break;
      case 'Tab':
        commit(active);
        break;
      default: {
        const match = typeahead.current(
          key,
          options.map((o) => o.label),
          active,
        );
        if (match !== -1 && enabled(match)) {
          event.preventDefault();
          setActive(match);
        }
      }
    }
  };

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      labelAs="span"
      className={['atl-select', className].filter(Boolean).join(' ')}
    >
      <div
        ref={triggerRef}
        id={ids.inputId}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        className="atl-control-box atl-select__trigger"
        aria-labelledby={ids.labelId}
        aria-describedby={describedBy(ids, hint, error)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        data-open={open || undefined}
        onClick={() =>
          open ? setOpen(false) : openAt(selectedIndex >= 0 ? selectedIndex : first())
        }
        onKeyDown={onKeyDown}
      >
        <span className="atl-select__value" data-placeholder={selectedOption ? undefined : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <IconChevronDown className="atl-select__chevron" size={18} />
      </div>
      <div
        ref={popoverRef}
        popover="manual"
        className="atl-select__popover"
        data-side={placement?.side ?? 'bottom'}
        style={
          placement ? { left: placement.x, top: placement.y } : { left: 0, top: 0, opacity: 0 }
        }
      >
        <div id={listId} role="listbox" aria-labelledby={ids.labelId} className="atl-select__list">
          {options.map((option, index) => (
            // Options are highlighted through aria-activedescendant from the combobox, which
            // keeps focus (WAI-ARIA select-only combobox), so they need no key handlers.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
            <div
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === selected}
              aria-disabled={option.disabled || undefined}
              data-active={index === active || undefined}
              className="atl-select__option"
              style={{ '--i': index } as React.CSSProperties}
              onPointerMove={() => {
                if (!option.disabled && active !== index) setActive(index);
              }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                if (option.disabled) return;
                commit(index);
                triggerRef.current?.focus();
              }}
            >
              <span className="atl-select__check" aria-hidden="true">
                {option.value === selected ? <IconCheck size={16} /> : null}
              </span>
              <span className="atl-select__text">
                <span>{option.label}</span>
                {option.description ? (
                  <span className="atl-select__description">{option.description}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>
      {name ? <input type="hidden" name={name} value={selected} /> : null}
    </FieldShell>
  );
}
