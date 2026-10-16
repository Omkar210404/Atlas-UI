import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { ContextMenu } from '../context-menu/ContextMenu';
import { meta as contextMeta } from '../context-menu/docs';
import { meta as tooltipMeta } from '../tooltip/docs';
import { Tooltip } from '../tooltip/Tooltip';
import { meta } from './docs';
import { Popover } from './Popover';

describe('Popover', () => {
  function Example() {
    return (
      <>
        <Popover label="Depth key" title="Depth key">
          <p>Soundings in metres.</p>
          <a href="#more">More</a>
        </Popover>
        <button type="button">Elsewhere</button>
      </>
    );
  }
  const trigger = () => screen.getByRole('button', { name: 'Depth key' });
  const panel = () => document.querySelector('.atl-popover') as HTMLElement;

  it('opens a labelled non-modal dialog and moves focus into it', async () => {
    render(<Example />);
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    await userEvent.click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'Depth key' })).toBe(panel());
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'More' }));
  });

  it('flips to the side with room and keeps the arrow on the anchor', async () => {
    render(
      <div style={{ position: 'fixed', right: 4, top: 200 }}>
        <Popover label="Edge" title="Edge" side="right">
          <p>Wide content that cannot fit on the right of this button.</p>
        </Popover>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Edge' }));
    await vi.waitFor(() => expect(panel().dataset.side).toBe('left'));
    const anchor = screen.getByRole('button', { name: 'Edge' }).getBoundingClientRect();
    const rect = panel().getBoundingClientRect();
    const arrow = parseFloat(panel().style.getPropertyValue('--atl-arrow'));
    expect(Math.abs(rect.top + arrow - (anchor.top + anchor.height / 2))).toBeLessThan(2);
  });

  it('closes on an outside click', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        render(<Example />);
        trigger().focus();
        await userEvent.keyboard('{Enter}');
        expect(trigger().getAttribute('aria-expanded')).toBe('true');
        trigger().focus();
        await userEvent.keyboard(' ');
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
      },
      Tab: async () => {
        render(<Example />);
        await userEvent.click(trigger());
        await userEvent.keyboard('{Tab}');
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
      },
      Escape: async () => {
        render(<Example />);
        await userEvent.click(trigger());
        await userEvent.keyboard('{Escape}');
        expect(trigger().getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(trigger());
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Tooltip', () => {
  function Example() {
    return (
      <>
        <button type="button">Before</button>
        <Tooltip content="Ctrl C" delay={50}>
          <button type="button" aria-label="Copy position">
            C
          </button>
        </Tooltip>
      </>
    );
  }
  const tip = () => screen.getByRole('tooltip', { hidden: true });
  const isOpen = () => tip().matches(':popover-open');

  it('describes its trigger', () => {
    render(<Example />);
    const button = screen.getByRole('button', { name: 'Copy position' });
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
  });

  it('shows on hover after the delay and stays while hovered', async () => {
    render(<Example />);
    await userEvent.hover(screen.getByRole('button', { name: 'Copy position' }));
    await vi.waitFor(() => expect(isOpen()).toBe(true));
    await userEvent.hover(tip());
    await new Promise((r) => setTimeout(r, 200));
    expect(isOpen()).toBe(true);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(tooltipMeta, {
      Tab: async () => {
        render(<Example />);
        screen.getByRole('button', { name: 'Before' }).focus();
        await userEvent.keyboard('{Tab}');
        await vi.waitFor(() => expect(isOpen()).toBe(true));
      },
      Escape: async () => {
        render(<Example />);
        screen.getByRole('button', { name: 'Before' }).focus();
        await userEvent.keyboard('{Tab}');
        await vi.waitFor(() => expect(isOpen()).toBe(true));
        await userEvent.keyboard('{Escape}');
        expect(isOpen()).toBe(false);
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Copy position' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Context menu', () => {
  function Example({
    onCopy = () => {},
    onLink = () => {},
  }: {
    onCopy?: () => void;
    onLink?: () => void;
  }) {
    return (
      <ContextMenu
        label="Chart actions"
        items={[
          { id: 'anchor', label: 'Drop anchor' },
          { id: 'copy', label: 'Copy position', onSelect: onCopy },
          {
            id: 'share',
            label: 'Share',
            items: [
              { id: 'link', label: 'Copy link', onSelect: onLink },
              { id: 'image', label: 'Export image' },
            ],
          },
        ]}
      >
        <div style={{ height: 160 }}>Chart</div>
      </ContextMenu>
    );
  }
  const area = () => screen.getByRole('group', { name: 'Chart actions' });
  const item = (name: string) => screen.getByRole('menuitem', { name });
  const openWithKeys = async () => {
    area().focus();
    await userEvent.keyboard('{Shift>}{F10}{/Shift}');
  };

  it('opens at the pointer on right-click and runs an item', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    await userEvent.click(area(), { button: 'right', position: { x: 60, y: 80 } });
    expect(screen.getByRole('menu', { name: 'Chart actions' })).toBeTruthy();
    await userEvent.click(item('Copy position'));
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(area());
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(contextMeta, {
      'Shift+F10 / ContextMenu': async () => {
        render(<Example />);
        await openWithKeys();
        expect(document.activeElement).toBe(item('Drop anchor'));
        await userEvent.keyboard('{Escape}');
        area().focus();
        await userEvent.keyboard('{ContextMenu}');
        expect(screen.getByRole('menu')).toBeTruthy();
      },
      'ArrowDown / ArrowUp': async () => {
        render(<Example />);
        await openWithKeys();
        await userEvent.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(item('Copy position'));
        await userEvent.keyboard('{ArrowUp}{ArrowUp}');
        expect(document.activeElement).toBe(item('Share'));
      },
      ArrowRight: async () => {
        render(<Example />);
        await openWithKeys();
        await userEvent.keyboard('{End}{ArrowRight}');
        expect(item('Share').getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(item('Copy link'));
      },
      ArrowLeft: async () => {
        render(<Example />);
        await openWithKeys();
        await userEvent.keyboard('{End}{ArrowRight}{ArrowLeft}');
        expect(item('Share').getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(item('Share'));
      },
      'Enter / Space': async () => {
        const onLink = vi.fn();
        render(<Example onLink={onLink} />);
        await openWithKeys();
        await userEvent.keyboard('{End}{Enter}');
        expect(document.activeElement).toBe(item('Copy link'));
        await userEvent.keyboard(' ');
        expect(onLink).toHaveBeenCalledOnce();
        expect(screen.queryByRole('menu')).toBeNull();
      },
      Escape: async () => {
        render(<Example />);
        await openWithKeys();
        await userEvent.keyboard('{End}{ArrowRight}{Escape}');
        expect(document.activeElement).toBe(item('Share'));
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(area());
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
