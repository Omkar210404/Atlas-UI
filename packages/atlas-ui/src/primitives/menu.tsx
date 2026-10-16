import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { IconChevronRight } from '../icons/chevron-right';
import { rovingIndex } from './roving';
import { createTypeahead } from './typeahead';
import { usePlacement } from './use-placement';
import { usePopover } from './use-popover';
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
  /** A submenu. The item then opens it instead of being selected. */
  items?: readonly MenuItem[];
}

export type MenuCloseReason = 'escape' | 'tab' | 'select' | 'back';

interface MenuListProps {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  items: readonly MenuItem[];
  /** Id of the element that names the menu (usually its trigger). */
  labelledBy?: string;
  label?: string;
  /** Which item gets focus when the menu opens. */
  initialFocus?: 'first' | 'last';
  /** Set on submenus: ArrowLeft closes the menu and returns to its parent item. */
  nested?: boolean;
  onSelect: (item: MenuItem) => void;
  onClose: (reason: MenuCloseReason) => void;
}

function Submenu({
  anchor,
  item,
  onSelect,
  onClose,
}: {
  anchor: HTMLElement;
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onClose: (reason: MenuCloseReason) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLElement>(anchor);
  usePopover(popoverRef, true);
  const placement = usePlacement(anchorRef, popoverRef, true, {
    side: 'right',
    align: 'start',
    offset: 2,
  });
  return (
    <div
      ref={popoverRef}
      popover="manual"
      className="atl-menu-popover"
      style={
        placement ? { left: placement.x, top: placement.y - 4 } : { left: 0, top: 0, opacity: 0 }
      }
    >
      <MenuList
        items={item.items ?? []}
        label={item.label}
        nested
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>
  );
}

/**
 * A WAI-ARIA menu: focus moves onto the items, arrow keys move between them (wrapping),
 * Home and End jump to the ends, typing a letter jumps to a matching item, Enter or Space
 * activates, Escape and Tab close. Items with `items` open a submenu with ArrowRight,
 * Enter or Space (or on hover); ArrowLeft and Escape close just that submenu. Disabled
 * items are focusable but cannot be activated, so they can still be discovered.
 */
export function MenuList({
  ref,
  id,
  items,
  labelledBy,
  label,
  initialFocus = 'first',
  nested = false,
  onSelect,
  onClose,
}: MenuListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const typeahead = useRef(createTypeahead());
  const [submenu, setSubmenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);

  const elements = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>(':scope > [role="menuitem"]') ?? []);

  useEffect(() => {
    const list = elements();
    const target = initialFocus === 'last' ? list.at(-1) : list[0];
    target?.focus({ preventScroll: true });
    // Focus only on mount: the menu is created when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSubmenu = (item: MenuItem, element: HTMLElement) => {
    if (item.disabled || !item.items) return;
    setSubmenu({ id: item.id, anchor: element });
  };

  const activate = (item: MenuItem, element: HTMLElement) => {
    if (item.disabled) return;
    if (item.items) {
      openSubmenu(item, element);
      return;
    }
    item.onSelect?.();
    onSelect(item);
    onClose('select');
  };

  const closeSubmenu = (reason: MenuCloseReason) => {
    const anchor = submenu?.anchor;
    setSubmenu(null);
    if (reason === 'select' || reason === 'tab') onClose(reason);
    else anchor?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = elements();
    const current = list.indexOf(document.activeElement as HTMLElement);
    // Keys from a submenu bubble up through the DOM; that submenu already handled them.
    if (current === -1 && submenu) return;
    const item = items[current];
    const handled = () => {
      event.preventDefault();
      event.stopPropagation();
    };
    if (event.key === 'Escape') {
      handled();
      onClose('escape');
    } else if (event.key === 'ArrowLeft' && nested) {
      handled();
      onClose('back');
    } else if (event.key === 'Tab') {
      event.stopPropagation();
      onClose('tab');
    } else if ((event.key === 'Enter' || event.key === ' ') && item) {
      handled();
      activate(item, list[current]!);
    } else if (event.key === 'ArrowRight' && item?.items) {
      handled();
      openSubmenu(item, list[current]!);
    } else {
      const next = rovingIndex(event.key, current, list.length, { orientation: 'vertical' });
      if (next !== null) {
        handled();
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
          handled();
          list[match]?.focus();
        }
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
          aria-haspopup={item.items ? 'menu' : undefined}
          aria-expanded={item.items ? submenu?.id === item.id : undefined}
          className="atl-menu__item"
          data-separator={item.separatorBefore || undefined}
          onClick={(event) => activate(item, event.currentTarget)}
          onPointerMove={(event) => {
            const el = event.currentTarget;
            if (document.activeElement !== el && !el.contains(document.activeElement)) el.focus();
            if (item.items && submenu?.id !== item.id) openSubmenu(item, el);
            else if (!item.items && submenu) setSubmenu(null);
          }}
        >
          {item.icon ? (
            <span className="atl-menu__icon" aria-hidden="true">
              {item.icon}
            </span>
          ) : null}
          <span className="atl-menu__text">
            <span className="atl-menu__label">{item.label}</span>
            {item.description ? (
              <span className="atl-menu__description">{item.description}</span>
            ) : null}
          </span>
          {item.hint ? <span className="atl-menu__hint">{item.hint}</span> : null}
          {item.items ? <IconChevronRight className="atl-menu__more" size={16} /> : null}
        </div>
      ))}
      {submenu ? (
        <Submenu
          key={submenu.id}
          anchor={submenu.anchor}
          item={items.find((i) => i.id === submenu.id)!}
          onSelect={onSelect}
          onClose={closeSubmenu}
        />
      ) : null}
    </div>
  );
}
