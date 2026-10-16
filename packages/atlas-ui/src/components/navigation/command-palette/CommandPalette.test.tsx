import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { CommandPalette, type CommandItem } from './CommandPalette';
import { meta } from './docs';
import { fuzzyScore, matchItem } from './fuzzy';

const items: CommandItem[] = [
  { id: 'dock', label: 'Floating dock', group: 'Navigation' },
  { id: 'palette', label: 'Command palette', group: 'Navigation', keywords: ['search'] },
  { id: 'tabs', label: 'Tab bar', group: 'Navigation' },
  { id: 'magnetic', label: 'Magnetic button', group: 'Actions' },
  { id: 'off', label: 'Disabled thing', group: 'Actions', disabled: true },
];

function Harness({ onSelect = () => {}, recentIds }: { onSelect?: (item: CommandItem) => void; recentIds?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <CommandPalette
        items={items}
        open={open}
        onOpenChange={setOpen}
        onSelect={onSelect}
        recentIds={recentIds}
      />
    </>
  );
}

const input = () => screen.getByRole('combobox');
const dialog = () => document.querySelector('dialog') as HTMLDialogElement;
const activeOption = () => {
  const id = input().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
};

async function openPalette() {
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(dialog().open).toBe(true);
}

describe('fuzzyScore', () => {
  it('matches an in-order subsequence and returns the matched indices', () => {
    expect(fuzzyScore('cmp', 'Command palette')?.indices).toEqual([0, 2, 8]);
    expect(fuzzyScore('xyz', 'Command palette')).toBeNull();
  });

  it('ranks prefixes and word starts above scattered letters', () => {
    const prefix = fuzzyScore('tab', 'Tab bar')!.score;
    const scattered = fuzzyScore('tab', 'Floating dock with a bar')!.score;
    expect(prefix).toBeGreaterThan(scattered);
    const wordStart = fuzzyScore('pa', 'Command palette')!.score;
    const mid = fuzzyScore('pa', 'Map area')!.score;
    expect(wordStart).toBeGreaterThan(mid);
  });

  it('finds the best alignment, not the first one', () => {
    // The first "p" is inside "Map"; the better match is the word start of "palette".
    expect(fuzzyScore('pal', 'Map palette')!.indices).toEqual([4, 5, 6]);
  });

  it('requires every word and falls back to keywords', () => {
    expect(matchItem('nav tab', { label: 'Tab bar', keywords: ['navigation'] })).not.toBeNull();
    expect(matchItem('nav zzz', { label: 'Tab bar', keywords: ['navigation'] })).toBeNull();
  });
});

describe('Command palette', () => {
  it('opens as a labelled modal dialog with the input focused', async () => {
    render(<Harness />);
    await openPalette();
    expect(dialog().getAttribute('aria-label')).toBe('Command palette');
    expect(document.activeElement).toBe(input());
    expect(input().getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
  });

  it('groups results under labelled groups', async () => {
    render(<Harness />);
    await openPalette();
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getByRole('group', { name: 'Navigation' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
  });

  it('filters, ranks and highlights as you type', async () => {
    render(<Harness />);
    await openPalette();
    await userEvent.type(input(), 'tab');
    const options = screen.getAllByRole('option');
    expect(options[0]?.textContent).toBe('Tab bar');
    expect(options[0]?.querySelector('mark')?.textContent).toBe('Tab');
  });

  it('matches keywords', async () => {
    render(<Harness />);
    await openPalette();
    await userEvent.type(input(), 'search');
    expect(screen.getAllByRole('option')[0]?.textContent).toBe('Command palette');
  });

  it('shows an empty message that names the query', async () => {
    render(<Harness />);
    await openPalette();
    await userEvent.type(input(), 'qqqq');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(dialog().textContent).toContain('Nothing matches “qqqq”');
  });

  it('shows recents first while the query is empty', async () => {
    render(<Harness recentIds={['magnetic']} />);
    await openPalette();
    const recent = screen.getByRole('group', { name: 'Recent' });
    expect(recent.textContent).toContain('Magnetic button');
    expect(activeOption()?.textContent).toBe('Magnetic button');
  });

  it('selects with a click, closes and returns focus to the trigger', async () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await openPalette();
    await userEvent.click(screen.getByRole('option', { name: 'Tab bar' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'tabs' }));
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }));
  });

  it('skips disabled items when moving', async () => {
    render(<Harness />);
    await openPalette();
    await userEvent.keyboard('{ArrowUp}');
    expect(activeOption()?.textContent).toBe('Magnetic button');
  });

  it('closes from the Close button', async () => {
    render(<Harness />);
    await openPalette();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog().open).toBe(false);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Mod+K': async () => {
        render(<CommandPalette items={items} onSelect={() => {}} />);
        const mac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
        await userEvent.keyboard(mac ? '{Meta>}k{/Meta}' : '{Control>}k{/Control}');
        expect(dialog().open).toBe(true);
        await userEvent.keyboard(mac ? '{Meta>}k{/Meta}' : '{Control>}k{/Control}');
        expect(dialog().open).toBe(false);
      },
      ArrowDown: async () => {
        render(<Harness />);
        await openPalette();
        expect(activeOption()?.textContent).toBe('Floating dock');
        await userEvent.keyboard('{ArrowDown}');
        expect(activeOption()?.textContent).toBe('Command palette');
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        expect(activeOption()?.textContent).toBe('Floating dock');
      },
      ArrowUp: async () => {
        render(<Harness />);
        await openPalette();
        await userEvent.keyboard('{ArrowUp}');
        expect(activeOption()?.textContent).toBe('Magnetic button');
      },
      Enter: async () => {
        const onSelect = vi.fn();
        render(<Harness onSelect={onSelect} />);
        await openPalette();
        await userEvent.keyboard('{ArrowDown}{Enter}');
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'palette' }));
        expect(dialog().open).toBe(false);
      },
      Escape: async () => {
        const outer = vi.fn();
        const listener = (event: KeyboardEvent) => {
          if (event.key === 'Escape' && !event.defaultPrevented) outer();
        };
        document.addEventListener('keydown', listener);
        render(<Harness />);
        await openPalette();
        await userEvent.type(input(), 'tab');
        await userEvent.keyboard('{Escape}');
        expect(input()).toHaveProperty('value', '');
        expect(dialog().open).toBe(true);
        await userEvent.keyboard('{Escape}');
        expect(dialog().open).toBe(false);
        expect(outer).not.toHaveBeenCalled();
        document.removeEventListener('keydown', listener);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
