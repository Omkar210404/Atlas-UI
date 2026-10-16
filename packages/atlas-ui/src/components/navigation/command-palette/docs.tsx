import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { IconAnchor } from '../../../icons/anchor';
import { IconBell } from '../../../icons/bell';
import { IconFile } from '../../../icons/file';
import { IconFolder } from '../../../icons/folder';
import { IconSearch } from '../../../icons/search';
import { IconSettings } from '../../../icons/settings';
import { IconUser } from '../../../icons/user';
import { CommandPalette, type CommandItem } from './CommandPalette';
import '../../../docs/demo.css';

export const meta: ComponentMeta = {
  slug: 'command-palette',
  name: 'Command palette',
  category: 'navigation',
  summary: 'Jump anywhere by typing a few letters.',
  description: [
    'A searchable list of places and actions in a modal dialog. Type a few letters of any word and the best matches rise to the top, with the matched letters marked.',
    'Matching is fuzzy and in order: “cmpl” finds “Command palette”. Matches at the start of words and in unbroken runs rank higher. Each word you type must match, so “nav tab” narrows to the tab bar in Navigation.',
  ],
  usage: [
    'Give every item a plain label; put synonyms in `keywords` rather than in the label.',
    'Group related items with `group`. Groups keep their first-seen order and results stay ranked inside each group.',
    'Pass `recentIds` to show recent picks first while the query is empty.',
    'The default shortcut is Ctrl+K (⌘K on Apple devices). Set `hotkey={null}` if the page already uses it.',
    'The first Escape clears the query; the second closes the palette.',
  ],
  keyboard: [
    { keys: ['Mod+K'], action: 'Open or close the palette from anywhere on the page.' },
    { keys: ['ArrowDown'], action: 'Move to the next result (wraps to the first).' },
    { keys: ['ArrowUp'], action: 'Move to the previous result (wraps to the last).' },
    { keys: ['Enter'], action: 'Open the highlighted result.' },
    { keys: ['Escape'], action: 'Clear the query, or close the palette when it is empty.' },
  ],
  accessibility: [
    'Built on the native modal `<dialog>`: the rest of the page is inert while it is open, and the dialog is labelled.',
    'The input is a `combobox` that controls a `listbox`. Results are `option`s inside labelled `group`s, and the highlighted option is exposed with `aria-activedescendant`, so focus never leaves the input.',
    'The number of results is announced through a polite live region once you stop typing.',
    'Focus returns to whatever was focused before the palette opened.',
    'A visible Close button is provided for touch and pointer users; a click on the backdrop also closes it.',
    'Matched letters are marked with weight and an underline, not colour alone.',
  ],
  reducedMotion: 'The dialog appears and disappears without the short rise and fade.',
  props: [
    {
      kind: 'text',
      name: 'placeholder',
      label: 'Placeholder',
      description: 'Hint shown in the empty input.',
      default: 'Search or jump to…',
    },
    {
      kind: 'boolean',
      name: 'grouped',
      label: 'Grouped',
      description: 'Show results under group headings.',
      default: true,
    },
    {
      kind: 'boolean',
      name: 'recents',
      label: 'Recents',
      description: 'Show recent picks first while the query is empty.',
      default: false,
    },
  ],
  files: ['CommandPalette.tsx', 'fuzzy.ts', 'command-palette.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'icons/search',
    'icons/close',
    'icons/arrows-vertical',
    'icons/enter-key',
    'primitives/announce',
    'primitives/use-controllable-state',
    'tokens',
  ],
};

const sample: CommandItem[] = [
  { id: 'charts', label: 'Open charts', group: 'Places', icon: <IconFolder />, keywords: ['maps'] },
  { id: 'harbours', label: 'Harbour guides', group: 'Places', icon: <IconAnchor /> },
  { id: 'logbook', label: 'Logbook entries', group: 'Places', icon: <IconFile />, hint: 'Ctrl L' },
  { id: 'crew', label: 'Crew list', group: 'Places', icon: <IconUser /> },
  { id: 'new-entry', label: 'New logbook entry', group: 'Actions', icon: <IconFile />, keywords: ['create', 'add'] },
  { id: 'alerts', label: 'Weather alerts', group: 'Actions', icon: <IconBell />, keywords: ['storm', 'wind'] },
  { id: 'find', label: 'Find on chart', group: 'Actions', icon: <IconSearch /> },
  { id: 'settings', label: 'Settings', group: 'Actions', icon: <IconSettings />, keywords: ['preferences'] },
  { id: 'export', label: 'Export route (coming later)', group: 'Actions', disabled: true },
];

function Demo({
  placeholder = 'Search or jump to…',
  grouped = true,
  recents = false,
  label,
}: {
  placeholder?: string;
  grouped?: boolean;
  recents?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const items = grouped ? sample : sample.map(({ group: _group, ...item }) => item);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'start' }}>
      <button type="button" className="atl-demo-button" onClick={() => setOpen(true)}>
        <IconSearch size={18} /> {label}
      </button>
      <p style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }} aria-live="polite">
        {picked ? `Opened: ${picked}` : 'Nothing opened yet.'}
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        placeholder={placeholder}
        recentIds={recents ? ['logbook', 'alerts'] : []}
        hotkey={null}
        onSelect={(item) => setPicked(item.label)}
      />
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'grouped',
      name: 'Grouped results',
      description: 'Places and actions under their own headings.',
      render: () => <Demo label="Search the logbook" />,
    },
    {
      id: 'recents',
      name: 'With recents',
      description: 'Recent picks come first until you type.',
      render: () => <Demo recents label="Search, recents first" />,
    },
    {
      id: 'flat',
      name: 'Single list',
      description: 'One ranked list without headings.',
      render: () => <Demo grouped={false} label="Search, one list" />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      placeholder={String(values.placeholder)}
      grouped={Boolean(values.grouped)}
      recents={Boolean(values.recents)}
      label="Open the palette"
    />
  ),
};
