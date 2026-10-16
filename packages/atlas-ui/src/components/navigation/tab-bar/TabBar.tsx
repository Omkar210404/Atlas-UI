import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { rovingIndex } from '../../../primitives/roving';
import { useControllableState } from '../../../primitives/use-controllable-state';
import './tab-bar.css';

type Activation = 'automatic' | 'manual';

interface TabsContextValue {
  baseId: string;
  value: string;
  select: (value: string) => void;
  activation: Activation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${part}> must be used inside <Tabs>.`);
  return context;
}

const safe = (value: string) => value.replace(/[^\w-]/g, '_');
const tabId = (base: string, value: string) => `${base}-tab-${safe(value)}`;
const panelId = (base: string, value: string) => `${base}-panel-${safe(value)}`;

export interface TabsProps {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * `automatic` selects a tab as soon as it receives focus. `manual` waits for Enter or
   * Space, which suits panels that are slow to render.
   */
  activation?: Activation;
  className?: string;
  children: ReactNode;
}

export function Tabs({
  value,
  defaultValue = '',
  onValueChange,
  activation = 'automatic',
  className,
  children,
}: TabsProps) {
  const baseId = useId();
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  return (
    <TabsContext.Provider value={{ baseId, value: selected, select: setSelected, activation }}>
      <div className={['atl-tabs', className].filter(Boolean).join(' ')}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabBarProps {
  /** Accessible name for the tab list, for example "Documentation sections". */
  label: string;
  /** `line` draws a magenta rule under the selected tab; `chip` slides a filled chip behind it. */
  variant?: 'line' | 'chip';
  className?: string;
  children: ReactNode;
}

export function TabBar({ label, variant = 'line', className, children }: TabBarProps) {
  const { value, select, activation } = useTabs('TabBar');
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) {
        list.style.setProperty('--atl-indicator-w', '0px');
        return;
      }
      list.style.setProperty('--atl-indicator-x', `${tab.offsetLeft}px`);
      list.style.setProperty('--atl-indicator-w', `${tab.offsetWidth}px`);
    };
    measure();
    // Only animate after the first placement, so the indicator does not slide in from 0.
    const frame = requestAnimationFrame(() => list.setAttribute('data-ready', ''));
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value, children]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = rovingIndex(event.key, current, tabs.length, { orientation: 'horizontal', rtl });
    if (next === null || current === -1) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (activation === 'automatic' && tab.dataset.value) select(tab.dataset.value);
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className={['atl-tabbar', className].filter(Boolean).join(' ')}
      data-variant={variant}
      onKeyDown={onKeyDown}
    >
      <span className="atl-tabbar__indicator" aria-hidden="true" />
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

export function Tab({ value, disabled = false, children }: TabProps) {
  const { baseId, value: selected, select } = useTabs('Tab');
  const isSelected = value === selected;
  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      data-value={value}
      className="atl-tab"
      onClick={() => select(value)}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabPanel({ value, className, children }: TabPanelProps) {
  const { baseId, value: selected } = useTabs('TabPanel');
  const hidden = value !== selected;
  return (
    <div
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      hidden={hidden}
      tabIndex={0}
      className={['atl-tabpanel', className].filter(Boolean).join(' ')}
    >
      {hidden ? null : children}
    </div>
  );
}
