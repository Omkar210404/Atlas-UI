import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { IconCompass } from '../../../icons/compass';
import { meta } from './docs';
import { DockItem, DockSeparator, FloatingDock } from './FloatingDock';

function Example({
  onSearch = () => {},
  magnify = true,
}: {
  onSearch?: () => void;
  magnify?: boolean;
}) {
  return (
    <>
      <button type="button">Before</button>
      <FloatingDock label="Site" floating={false} magnify={magnify}>
        <DockItem label="Home" icon={<IconCompass />} href="#home" current />
        <DockItem label="Search" icon={<IconCompass />} shortcut="Control+K" onClick={onSearch} />
        <DockSeparator />
        <DockItem label="Theme" icon={<IconCompass />} pressed={false} onClick={() => {}} />
        <DockItem label="Locked" icon={<IconCompass />} disabled />
      </FloatingDock>
      <button type="button">After</button>
    </>
  );
}

const item = (name: string) =>
  screen.queryByRole('link', { name }) ?? screen.getByRole('button', { name });

describe('Floating dock', () => {
  it('is a labelled toolbar of named items', () => {
    render(<Example />);
    expect(screen.getByRole('toolbar', { name: 'Site' })).toBeTruthy();
    expect(item('Home').getAttribute('aria-current')).toBe('page');
    expect(item('Search').getAttribute('aria-keyshortcuts')).toBe('Control+K');
    expect(item('Theme').getAttribute('aria-pressed')).toBe('false');
    expect(item('Locked').getAttribute('aria-disabled')).toBe('true');
  });

  it('has exactly one item in the Tab order', () => {
    render(<Example />);
    const tabbable = Array.from(document.querySelectorAll('[data-dock-item]')).filter(
      (el) => (el as HTMLElement).tabIndex === 0,
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(item('Home'));
  });

  it('does not activate disabled items', async () => {
    const onClick = vi.fn();
    render(
      <FloatingDock label="Site" floating={false}>
        <DockItem label="Locked" icon={<IconCompass />} disabled onClick={onClick} />
      </FloatingDock>,
    );
    await userEvent.click(item('Locked'), { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('grows the item under the pointer and resets on leave', async () => {
    render(<Example />);
    const search = item('Search');
    await userEvent.hover(search);
    await vi.waitFor(() =>
      expect(Number(search.style.getPropertyValue('--atl-dock-scale'))).toBeGreaterThan(1.3),
    );
    await userEvent.hover(screen.getByRole('button', { name: 'After' }));
    await vi.waitFor(() => expect(search.style.getPropertyValue('--atl-dock-scale')).toBe('1.000'));
  });

  it('does not grow items when magnification is off', async () => {
    render(<Example magnify={false} />);
    const search = item('Search');
    await userEvent.hover(search);
    await new Promise((r) => setTimeout(r, 50));
    expect(search.style.getPropertyValue('--atl-dock-scale')).toBe('');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(<Example />);
        await userEvent.click(screen.getByRole('button', { name: 'Before' }));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(item('Home'));
        await userEvent.keyboard('{ArrowRight}{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(item('Search'));
      },
      ArrowRight: async () => {
        render(<Example />);
        item('Home').focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement).toBe(item('Search'));
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(document.activeElement).toBe(item('Home'));
      },
      ArrowLeft: async () => {
        render(<Example />);
        item('Home').focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(document.activeElement).toBe(item('Theme'));
      },
      Home: async () => {
        render(<Example />);
        item('Theme').focus();
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(item('Home'));
      },
      End: async () => {
        render(<Example />);
        item('Home').focus();
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(item('Theme'));
      },
      'Enter / Space': async () => {
        const onSearch = vi.fn();
        render(<Example onSearch={onSearch} />);
        item('Search').focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onSearch).toHaveBeenCalledTimes(2);
      },
      Escape: async () => {
        const outer = vi.fn();
        const listener = (event: KeyboardEvent) => {
          if (event.key === 'Escape' && !event.defaultPrevented) outer();
        };
        document.addEventListener('keydown', listener);
        render(<Example />);
        item('Home').focus();
        await userEvent.keyboard('{Escape}');
        expect(screen.getByRole('toolbar').hasAttribute('data-tips-hidden')).toBe(true);
        expect(document.activeElement).toBe(item('Home'));
        expect(outer).not.toHaveBeenCalled();
        await userEvent.keyboard('{Escape}');
        expect(outer).toHaveBeenCalledTimes(1);
        document.removeEventListener('keydown', listener);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
