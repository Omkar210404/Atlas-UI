import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { Drawer } from '../drawer/Drawer';
import { meta as drawerMeta } from '../drawer/docs';
import { meta } from './docs';
import { Modal } from './Modal';

function Harness({
  dismissible = true,
  kind = 'modal',
}: {
  dismissible?: boolean;
  kind?: 'modal' | 'drawer';
}) {
  const [open, setOpen] = useState(false);
  const Shell = kind === 'modal' ? Modal : Drawer;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Shell
        title="Leave harbour?"
        description="The tide turns soon."
        open={open}
        onOpenChange={setOpen}
        {...(kind === 'modal' ? { dismissible } : {})}
        footer={
          <>
            <button type="button">Stay</button>
            <button type="button" onClick={() => setOpen(false)}>
              Go
            </button>
          </>
        }
      >
        <p>Body</p>
      </Shell>
    </>
  );
}

const dialog = () => document.querySelector('dialog') as HTMLDialogElement;

describe.each(['modal', 'drawer'] as const)('%s', (kind) => {
  it('opens as a labelled, described modal dialog and focuses inside', async () => {
    render(<Harness kind={kind} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(dialog().open).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Leave harbour?' })).toBe(dialog());
    expect(document.getElementById(dialog().getAttribute('aria-describedby')!)?.textContent).toBe(
      'The tide turns soon.',
    );
    expect(dialog().contains(document.activeElement)).toBe(true);
    expect(document.documentElement.hasAttribute('data-scroll-locked')).toBe(true);
  });

  it('returns focus to the trigger and unlocks scrolling on close', async () => {
    render(<Harness kind={kind} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }));
    expect(document.documentElement.hasAttribute('data-scroll-locked')).toBe(false);
  });
});

describe('Modal', () => {
  it('ignores Escape when not dismissible', async () => {
    render(<Harness dismissible={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.keyboard('{Escape}');
    expect(dialog().open).toBe(true);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Tab / Shift+Tab': async () => {
        render(<Harness />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        const close = screen.getByRole('button', { name: 'Close' });
        const go = screen.getByRole('button', { name: 'Go' });
        expect(document.activeElement).toBe(close);
        go.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(close);
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(go);
      },
      Escape: async () => {
        const outer = vi.fn();
        const listener = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && !e.defaultPrevented) outer();
        };
        document.addEventListener('keydown', listener);
        render(<Harness />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.keyboard('{Escape}');
        expect(dialog().open).toBe(false);
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }));
        expect(outer).not.toHaveBeenCalled();
        document.removeEventListener('keydown', listener);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Drawer', () => {
  it('closes when dragged far enough toward its edge', async () => {
    render(<Harness kind="drawer" />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const panel = document.querySelector('.atl-drawer__panel') as HTMLElement;
    const rect = panel.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const from = rect.left + 40;
    panel.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: from,
        clientY: y,
        button: 0,
        pointerId: 1,
      }),
    );
    panel.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        clientX: from + rect.width * 0.5,
        clientY: y,
        pointerId: 1,
      }),
    );
    panel.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        clientX: from + rect.width * 0.5,
        clientY: y,
        pointerId: 1,
      }),
    );
    await vi.waitFor(() => expect(dialog().open).toBe(false));
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(drawerMeta, {
      'Tab / Shift+Tab': async () => {
        render(<Harness kind="drawer" />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        screen.getByRole('button', { name: 'Go' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(dialog().contains(document.activeElement)).toBe(true);
      },
      Escape: async () => {
        render(<Harness kind="drawer" />);
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        await userEvent.keyboard('{Escape}');
        expect(dialog().open).toBe(false);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
