import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { createTypeahead } from '../../../primitives/typeahead';
import { meta } from './docs';
import { SplitActionButton } from './SplitActionButton';

function Example({ onAction = () => {}, onCopy = () => {} }: { onAction?: () => void; onCopy?: () => void }) {
  return (
    <>
      <SplitActionButton
        label="Save"
        menuLabel="More ways to save"
        onAction={onAction}
        actions={[
          { id: 'copy', label: 'Save a copy', onSelect: onCopy },
          { id: 'template', label: 'Save as template' },
          { id: 'export', label: 'Export image' },
          { id: 'print', label: 'Print', disabled: true },
        ]}
      />
      <button type="button">After</button>
    </>
  );
}

const trigger = () => screen.getByRole('button', { name: 'More ways to save' });
const menu = () => screen.queryByRole('menu');
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('createTypeahead', () => {
  it('cycles through items with the same first letter and builds longer searches', () => {
    const search = createTypeahead();
    const labels = ['Save a copy', 'Save as template', 'Export image', 'Print'];
    expect(search('s', labels, 0)).toBe(1);
    expect(search('s', labels, 1)).toBe(0);
    const fresh = createTypeahead();
    expect(fresh('e', labels, 0)).toBe(2);
  });
});

describe('Split action button', () => {
  it('runs the main action from the main half', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('opens a labelled menu from the menu button', async () => {
    render(<Example />);
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(menu()?.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(trigger().getAttribute('aria-controls')).toBe(menu()?.id);
    expect(document.activeElement).toBe(item('Save a copy'));
  });

  it('runs an item, closes and returns focus to the menu button', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    await userEvent.click(trigger());
    await userEvent.click(item('Save a copy'));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('keeps disabled items focusable but inert', async () => {
    render(<Example />);
    trigger().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(item('Print'));
    await userEvent.keyboard('{Enter}');
    expect(menu()).not.toBeNull();
  });

  it('closes on an outside click', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(menu()).toBeNull();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        const onAction = vi.fn();
        render(<Example onAction={onAction} />);
        screen.getByRole('button', { name: 'Save' }).focus();
        await userEvent.keyboard('{Enter}');
        expect(onAction).toHaveBeenCalledOnce();
        trigger().focus();
        await userEvent.keyboard(' ');
        expect(menu()).not.toBeNull();
      },
      ArrowDown: async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(item('Save a copy'));
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(item('Save as template'));
      },
      ArrowUp: async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(item('Print'));
        await userEvent.keyboard('{ArrowUp}');
        expect(document.activeElement).toBe(item('Export image'));
      },
      'Home / End': async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}{End}');
        expect(document.activeElement).toBe(item('Print'));
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(item('Save a copy'));
      },
      Escape: async () => {
        const outer = vi.fn();
        const listener = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && !e.defaultPrevented) outer();
        };
        document.addEventListener('keydown', listener);
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}{Escape}');
        expect(menu()).toBeNull();
        expect(document.activeElement).toBe(trigger());
        expect(outer).not.toHaveBeenCalled();
        document.removeEventListener('keydown', listener);
      },
      Tab: async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}{Tab}');
        expect(menu()).toBeNull();
      },
      'a–z': async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{ArrowDown}e');
        expect(document.activeElement).toBe(item('Export image'));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
