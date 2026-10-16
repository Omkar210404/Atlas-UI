import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { rovingIndex } from '../../../primitives/roving';
import { useReducedMotion } from '../../../primitives/use-reduced-motion';
import './floating-dock.css';

const ITEM = '[data-dock-item]:not([aria-disabled="true"])';

export interface FloatingDockProps {
  /** Accessible name of the toolbar, for example "Site". */
  label: string;
  /** Grow items near the pointer. Off for touch, and off under reduced motion. */
  magnify?: boolean;
  /** Largest scale an item reaches, right under the pointer. */
  maxScale?: number;
  /** Distance in px over which magnification fades out. */
  reach?: number;
  /** Fix the dock to the bottom centre of the viewport. Turn off to place it yourself. */
  floating?: boolean;
  className?: string;
  children: ReactNode;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function FloatingDock({
  label,
  magnify = true,
  maxScale = 1.55,
  reach = 132,
  floating = true,
  className,
  children,
}: FloatingDockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [tipsHidden, setTipsHidden] = useState(false);
  const reduced = useReducedMotion();
  const centres = useRef<number[]>([]);
  const frame = useRef(0);
  const magnifies = magnify && !reduced;

  // Roving tabindex: exactly one item is in the Tab order.
  useLayoutEffect(() => {
    ref.current
      ?.querySelectorAll<HTMLElement>('[data-dock-item]')
      .forEach((item) => (item.tabIndex = -1));
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);
    const active = items[Math.min(focusIndex, items.length - 1)];
    if (active) active.tabIndex = 0;
  });

  const items = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(ITEM) ?? []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (!tipsHidden) {
        // First Escape hides the visible label (WCAG 1.4.13); later ones pass through.
        event.preventDefault();
        setTipsHidden(true);
      }
      return;
    }
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = rovingIndex(event.key, current, list.length, { orientation: 'horizontal', rtl });
    if (next === null || current === -1) return;
    event.preventDefault();
    setFocusIndex(next);
    list[next]?.focus();
  };

  const setScales = (pointerX: number | null) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const list = Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-dock-item]') ?? []);
      list.forEach((item, i) => {
        const centre = centres.current[i];
        let scale = 1;
        if (pointerX !== null && centre !== undefined) {
          const t = Math.max(0, 1 - Math.abs(pointerX - centre) / reach);
          scale = 1 + (maxScale - 1) * smoothstep(t);
        }
        item.style.setProperty('--atl-dock-scale', scale.toFixed(3));
      });
    });
  };

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!magnifies || event.pointerType === 'touch') return;
    // Measure resting positions once, so growth does not feed back into the maths.
    centres.current = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-dock-item]'),
    ).map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!magnifies || event.pointerType === 'touch') return;
    setScales(event.clientX);
  };

  const onPointerLeave = () => {
    setScales(null);
    setTipsHidden(false);
  };

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      className={['atl-dock', className].filter(Boolean).join(' ')}
      data-floating={floating || undefined}
      data-magnify={magnifies || undefined}
      data-tips-hidden={tipsHidden || undefined}
      onKeyDown={onKeyDown}
      onFocus={(event) => {
        const index = items().indexOf(event.target as HTMLElement);
        if (index !== -1 && index !== focusIndex) setFocusIndex(index);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTipsHidden(false);
      }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}

export interface DockItemProps {
  label: string;
  icon: ReactNode;
  /** Renders a link instead of a button. */
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes the item a toggle button with `aria-pressed`. */
  pressed?: boolean;
  /** Marks the item as the current page with `aria-current="page"`. */
  current?: boolean;
  /** Shortcut shown in the label and exposed with `aria-keyshortcuts`, like `Control+K`. */
  shortcut?: string;
  disabled?: boolean;
}

export function DockItem({
  label,
  icon,
  href,
  onClick,
  pressed,
  current = false,
  shortcut,
  disabled = false,
}: DockItemProps) {
  const content = (
    <>
      <span className="atl-dock__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="atl-visually-hidden">{label}</span>
      <span className="atl-dock__tip" aria-hidden="true">
        {label}
        {shortcut ? <kbd>{shortcut.replace('Control', 'Ctrl')}</kbd> : null}
      </span>
    </>
  );
  const shared = {
    className: 'atl-dock__item',
    'data-dock-item': '',
    'data-current': current || undefined,
    'aria-keyshortcuts': shortcut,
    'aria-current': current ? ('page' as const) : undefined,
  };

  if (href && !disabled) {
    return (
      <a {...shared} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button
      {...shared}
      type="button"
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      onClick={(event) => {
        if (disabled) return;
        onClick?.(event);
      }}
    >
      {content}
    </button>
  );
}

export function DockSeparator() {
  return <span className="atl-dock__separator" role="separator" aria-orientation="vertical" />;
}
