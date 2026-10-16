import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { IconArrowsVertical } from '../../../icons/arrows-vertical';
import { IconClose } from '../../../icons/close';
import { IconEnterKey } from '../../../icons/enter-key';
import { IconSearch } from '../../../icons/search';
import { announce } from '../../../primitives/announce';
import { useControllableState } from '../../../primitives/use-controllable-state';
import { matchItem } from './fuzzy';
import './command-palette.css';

export interface CommandItem {
  id: string;
  label: string;
  /** Items with the same group are listed under one heading, in first-seen order. */
  group?: string;
  /** Extra words that should find this item, such as synonyms. */
  keywords?: readonly string[];
  /** Short text on the right, such as a location or a shortcut. */
  hint?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  items: readonly CommandItem[];
  onSelect: (item: CommandItem) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the dialog. */
  label?: string;
  placeholder?: string;
  /** Item ids shown first under "Recent" while the query is empty. */
  recentIds?: readonly string[];
  /** Global shortcut that toggles the palette, like `Mod+K`. `null` turns it off. */
  hotkey?: string | null;
  /** Also open with `/` when focus is not in a text field. */
  slashOpens?: boolean;
  /** Shown when nothing matches. */
  emptyMessage?: (query: string) => ReactNode;
  maxResults?: number;
}

interface Row {
  item: CommandItem;
  group: string;
  indices: number[];
}

const RECENT = 'Recent';
const UNGROUPED = 'Results';

function matchesHotkey(event: globalThis.KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.split('+').map((p) => p.trim().toLowerCase());
  const key = parts.pop();
  const mac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  const wantsMod = parts.includes('mod');
  const mod = mac ? event.metaKey : event.ctrlKey;
  if (wantsMod !== mod) return false;
  if (parts.includes('shift') !== event.shiftKey) return false;
  if (parts.includes('alt') !== event.altKey) return false;
  return event.key.toLowerCase() === key;
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
  );
}

function Highlight({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;
  const marked = new Set(indices);
  const parts: ReactNode[] = [];
  let run = '';
  let runMarked = false;
  const flush = (key: number) => {
    if (!run) return;
    parts.push(runMarked ? <mark key={key}>{run}</mark> : run);
    run = '';
  };
  for (let i = 0; i < text.length; i++) {
    const isMarked = marked.has(i);
    if (isMarked !== runMarked) {
      flush(i);
      runMarked = isMarked;
    }
    run += text[i];
  }
  flush(text.length);
  return <>{parts}</>;
}

export function CommandPalette({
  items,
  onSelect,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  label = 'Command palette',
  placeholder = 'Search or jump to…',
  recentIds = [],
  hotkey = 'Mod+K',
  slashOpens = false,
  emptyMessage = (query) => <>Nothing matches “{query}”. Try a shorter word, or a category name.</>,
  maxResults = 60,
}: CommandPaletteProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const rows = useMemo<Row[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const byId = new Map(items.map((item) => [item.id, item]));
      const recent = recentIds
        .map((id) => byId.get(id))
        .filter((item): item is CommandItem => Boolean(item))
        .map((item) => ({ item, group: RECENT, indices: [] }));
      const recentSet = new Set(recent.map((r) => r.item.id));
      const rest = items
        .filter((item) => !recentSet.has(item.id))
        .map((item) => ({ item, group: item.group ?? UNGROUPED, indices: [] }));
      return [...recent, ...rest].slice(0, maxResults);
    }
    return items
      .map((item, order) => ({ item, order, match: matchItem(trimmed, item) }))
      .filter((r) => r.match !== null)
      .sort((a, b) => b.match!.score - a.match!.score || a.order - b.order)
      .slice(0, maxResults)
      .map((r) => ({ item: r.item, group: r.item.group ?? UNGROUPED, indices: r.match!.indices }));
  }, [items, query, recentIds, maxResults]);

  // Group in first-seen order while keeping the rank order inside each group.
  const groups = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const row of rows) {
      const list = map.get(row.group) ?? [];
      list.push(row);
      map.set(row.group, list);
    }
    return [...map.entries()];
  }, [rows]);

  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);
  const enabled = flat.filter((row) => !row.item.disabled);
  const activeRow = enabled[Math.min(active, enabled.length - 1)];
  const optionId = (id: string) => `${baseId}-opt-${id.replace(/[^\w-]/g, '_')}`;

  // Open and close the native modal dialog to match state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      const target = returnFocus.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    }
  }, [open]);

  // Global shortcut.
  useEffect(() => {
    if (!hotkey && !slashOpens) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (hotkey && matchesHotkey(event, hotkey)) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (slashOpens && event.key === '/' && !isEditable(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey, slashOpens, setOpen]);

  // Keep the active option in view.
  useEffect(() => {
    if (!activeRow) return;
    document.getElementById(optionId(activeRow.item.id))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRow?.item.id]);

  // Announce the result count once typing pauses.
  useEffect(() => {
    if (!open || !query.trim()) return;
    const timer = window.setTimeout(() => {
      announce(
        enabled.length === 0
          ? 'No results'
          : `${enabled.length} result${enabled.length === 1 ? '' : 's'}`,
      );
    }, 450);
    return () => window.clearTimeout(timer);
  }, [open, query, enabled.length]);

  const choose = (row: Row | undefined) => {
    if (!row || row.item.disabled) return;
    setOpen(false);
    onSelect(row.item);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const count = enabled.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count) setActive((i) => (Math.min(i, count - 1) + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) setActive((i) => (Math.min(i, count - 1) - 1 + count) % count);
        break;
      case 'Enter':
        event.preventDefault();
        choose(activeRow);
        break;
      case 'Escape':
        // Handled here rather than by the dialog, so the first Escape can clear the query
        // and outer listeners see the event as consumed.
        event.preventDefault();
        if (query) {
          setQuery('');
          setActive(0);
        } else setOpen(false);
        break;
    }
  };

  let optionIndex = -1;

  return (
    <dialog
      ref={dialogRef}
      className="atl-palette"
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        setOpen(false);
      }}
      onClick={(event) => {
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="atl-palette__panel">
        <div className="atl-palette__field">
          <IconSearch className="atl-palette__glass" size={22} />
          <input
            ref={inputRef}
            className="atl-palette__input"
            role="combobox"
            aria-label={label}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeRow ? optionId(activeRow.item.id) : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className="atl-palette__close"
            aria-label="Close"
            onClick={() => setOpen(false)}
          >
            <IconClose size={18} />
          </button>
        </div>

        <div
          ref={listRef}
          className="atl-palette__list"
          id={listId}
          role="listbox"
          aria-label="Results"
        >
          {groups.map(([group, list]) => {
            const headingId = `${baseId}-group-${group.replace(/[^\w-]/g, '_')}`;
            return (
              <div
                key={group}
                role="group"
                aria-labelledby={headingId}
                className="atl-palette__group"
              >
                <div id={headingId} role="presentation" className="atl-palette__heading">
                  {group}
                </div>
                {list.map((row) => {
                  const disabled = Boolean(row.item.disabled);
                  if (!disabled) optionIndex += 1;
                  const index = optionIndex;
                  const isActive = !disabled && activeRow?.item.id === row.item.id;
                  return (
                    <div
                      key={row.item.id}
                      id={optionId(row.item.id)}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={disabled || undefined}
                      className="atl-palette__option"
                      onPointerMove={() => {
                        if (!disabled && !isActive) setActive(index);
                      }}
                      onClick={() => choose(row)}
                    >
                      {row.item.icon ? (
                        <span className="atl-palette__icon" aria-hidden="true">
                          {row.item.icon}
                        </span>
                      ) : null}
                      <span className="atl-palette__label">
                        <Highlight text={row.item.label} indices={row.indices} />
                      </span>
                      {row.item.hint ? (
                        <span className="atl-palette__hint">{row.item.hint}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {flat.length === 0 ? (
            <p className="atl-palette__empty">{emptyMessage(query.trim())}</p>
          ) : null}
        </div>

        <div className="atl-palette__footer" aria-hidden="true">
          <span>
            <kbd>
              <IconArrowsVertical size={14} />
            </kbd>{' '}
            move
          </span>
          <span>
            <kbd>
              <IconEnterKey size={14} />
            </kbd>{' '}
            open
          </span>
          <span>
            <kbd>Esc</kbd> {query ? 'clear' : 'close'}
          </span>
        </div>
      </div>
    </dialog>
  );
}
