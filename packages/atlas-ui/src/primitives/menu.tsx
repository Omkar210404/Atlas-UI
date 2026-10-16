import { useEffect, useRef, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { rovingIndex } from './roving';
import { createTypeahead } from './typeahead';
import './menu.css';

export interface MenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Shortcut text shown on the right, for example "Ctrl S". */
  hint?: string;
  disabled?: boolean;
  /** Draws a separator above this item. */
  separatorBefore?: boolean;
  onSelect?: () => void;
}

export type MenuCloseReason = 'escape' | 'tab' | 'select';

interface MenuListProps {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  items: readonly MenuItem[];
  /** Id of the element that names the menu (usually its trigger). */
  labelledBy?: string;
  label?: string;
  /** Which item gets focus when the menu opens. */
  initialFocus?: 'first' | 'last';
  onSelect: (item: MenuItem) => void;
  onClose: (reason: MenuCloseReason) => void;
}

/**
 * A WAI-ARIA menu: focus moves onto the items, arrow keys move between them (wrapping),
 * Home and End jump to the ends, typing a letter jumps to a matching item, Enter or Space
 * activates, Escape and Tab close. Disabled items are focusable but cannot be activated,
 * so they can still be discovered.
 */
export function MenuList({
  ref,
  id,
  items,
  labelledBy,
  label,
  initialFocus = 'first',
  onSelect,
  onClose,
}: MenuListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const typeahead = useRef(createTypeahead());

  const elements = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    const list = elements();
    const target = initialFocus === 'last' ? list.at(-1) : list[0];
    target?.focus({ preventScroll: true });
    // Focus only on mount: the menu is created when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activate = (item: MenuItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect(item);
    onClose('select');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = elements();
    const current = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose('escape');
      return;
    }
    if (event.key === 'Tab') {
      onClose('tab');
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const item = items[current];
      if (item) activate(item);
      return;
    }
    const next = rovingIndex(event.key, current, list.length, { orientation: 'vertical' });
    if (next !== null) {
      event.preventDefault();
      list[next]?.focus();
      return;
    }
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = typeahead.current(
        event.key,
        items.map((i) => i.label),
        current,
      );
      if (match !== -1) {
        event.preventDefault();
        list[match]?.focus();
      }
    }
  };

  return (
    <div
      ref={(el) => {
        listRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      aria-orientation="vertical"
      className="atl-menu"
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => (
        // Keys are handled once on the menu itself (WAI-ARIA menu pattern), not per item.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          key={item.id}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={item.disabled || undefined}
          className="atl-menu__item"
          data-separator={item.separatorBefore || undefined}
          onClick={() => activate(item)}
          onPointerMove={(event) => {
            if (document.activeElement !== event.currentTarget) event.currentTarget.focus();
          }}
        >
          {item.icon ? (
            <span className="atl-menu__icon" aria-hidden="true">
              {item.icon}
            </span>
          ) : null}
          <span className="atl-menu__text">
            <span className="atl-menu__label">{item.label}</span>
            {item.description ? <span className="atl-menu__description">{item.description}</span> : null}
          </span>
          {item.hint ? <span className="atl-menu__hint">{item.hint}</span> : null}
        </div>
      ))}
    </div>
  );
}
