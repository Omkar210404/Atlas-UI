import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { AnimatedSelect } from './AnimatedSelect';
import { meta } from './docs';

const options = [
  { value: 'falmouth', label: 'Falmouth' },
  { value: 'fowey', label: 'Fowey' },
  { value: 'plymouth', label: 'Plymouth' },
  { value: 'weymouth', label: 'Weymouth', disabled: true },
  { value: 'poole', label: 'Poole' },
];

function Example({
  onValueChange,
  defaultValue,
}: {
  onValueChange?: (v: string) => void;
  defaultValue?: string;
}) {
  return (
    <form>
      <AnimatedSelect
        label="Home port"
        name="port"
        options={options}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
      />
      <button type="button">After</button>
    </form>
  );
}

const combo = () => screen.getByRole('combobox', { name: 'Home port' });
const active = () => {
  const id = combo().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};
const isOpen = () => combo().getAttribute('aria-expanded') === 'true';

describe('Animated select', () => {
  it('is a labelled select-only combobox controlling a listbox', () => {
    render(<Example />);
    expect(combo().getAttribute('aria-haspopup')).toBe('listbox');
    expect(
      document.getElementById(combo().getAttribute('aria-controls')!)?.getAttribute('role'),
    ).toBe('listbox');
    expect(isOpen()).toBe(false);
  });

  it('opens on click, chooses an option and submits it', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(combo());
    expect(isOpen()).toBe(true);
    await userEvent.click(screen.getByRole('option', { name: 'Plymouth' }));
    expect(onValueChange).toHaveBeenCalledWith('plymouth');
    expect(isOpen()).toBe(false);
    expect(combo().textContent).toContain('Plymouth');
    expect(new FormData(document.querySelector('form')!).get('port')).toBe('plymouth');
    expect(document.activeElement).toBe(combo());
  });

  it('skips disabled options', async () => {
    render(<Example defaultValue="plymouth" />);
    combo().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toBe('Poole');
  });

  it('closes on an outside click without changing the choice', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(combo());
    // The label sits above the trigger, outside both the trigger and the open list.
    await userEvent.click(screen.getByText('Home port'));
    expect(isOpen()).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'ArrowDown / ArrowUp': async () => {
        render(<Example defaultValue="fowey" />);
        combo().focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(isOpen()).toBe(true);
        expect(active()).toBe('Fowey');
        await userEvent.keyboard('{ArrowDown}');
        expect(active()).toBe('Plymouth');
        await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
        expect(active()).toBe('Falmouth');
      },
      'Enter / Space': async () => {
        const onValueChange = vi.fn();
        render(<Example onValueChange={onValueChange} />);
        combo().focus();
        await userEvent.keyboard('{Enter}');
        expect(isOpen()).toBe(true);
        await userEvent.keyboard('{ArrowDown}{Enter}');
        expect(onValueChange).toHaveBeenLastCalledWith('fowey');
        await userEvent.keyboard(' ');
        expect(isOpen()).toBe(true);
        await userEvent.keyboard('{ArrowDown} ');
        expect(onValueChange).toHaveBeenLastCalledWith('plymouth');
      },
      'Home / End': async () => {
        render(<Example />);
        combo().focus();
        await userEvent.keyboard('{End}');
        expect(isOpen()).toBe(true);
        expect(active()).toBe('Poole');
        await userEvent.keyboard('{Home}');
        expect(active()).toBe('Falmouth');
      },
      'PageUp / PageDown': async () => {
        render(<Example />);
        combo().focus();
        await userEvent.keyboard('{ArrowDown}{PageDown}');
        expect(active()).toBe('Poole');
        await userEvent.keyboard('{PageUp}');
        expect(active()).toBe('Falmouth');
      },
      Escape: async () => {
        const onValueChange = vi.fn();
        render(<Example onValueChange={onValueChange} />);
        combo().focus();
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}');
        expect(isOpen()).toBe(false);
        expect(onValueChange).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(combo());
      },
      Tab: async () => {
        const onValueChange = vi.fn();
        render(<Example onValueChange={onValueChange} />);
        combo().focus();
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{Tab}');
        expect(onValueChange).toHaveBeenCalledWith('fowey');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
      },
      'a–z': async () => {
        render(<Example />);
        combo().focus();
        await userEvent.keyboard('p');
        expect(isOpen()).toBe(true);
        expect(active()).toBe('Plymouth');
        await userEvent.keyboard('p');
        expect(active()).toBe('Poole');
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
