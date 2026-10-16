import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { MagneticButton } from './MagneticButton';

const offset = (el: HTMLElement) => ({
  x: parseFloat(el.style.getPropertyValue('--atl-magnet-x') || '0'),
  y: parseFloat(el.style.getPropertyValue('--atl-magnet-y') || '0'),
});

function Example(props: { strength?: number; reach?: number }) {
  return (
    <div style={{ padding: 120 }}>
      <MagneticButton {...props}>Pull me</MagneticButton>
      <button type="button" style={{ marginLeft: 400 }}>
        Far away
      </button>
    </div>
  );
}

afterEach(() => {
  delete document.documentElement.dataset.motion;
});

describe('Magnetic button', () => {
  it('leans toward a nearby pointer and settles back when it leaves', async () => {
    render(<Example />);
    const button = screen.getByRole('button', { name: 'Pull me' });
    await userEvent.hover(button, { position: { x: 2, y: 2 } });
    await vi.waitFor(() => {
      const { x, y } = offset(button);
      expect(x).toBeLessThan(-1);
      expect(y).toBeLessThan(-1);
    });
    await userEvent.hover(screen.getByRole('button', { name: 'Far away' }));
    await vi.waitFor(() => {
      const { x, y } = offset(button);
      expect(Math.abs(x)).toBeLessThan(0.5);
      expect(Math.abs(y)).toBeLessThan(0.5);
    });
  });

  it('caps the pull inside its footprint', async () => {
    render(<Example strength={1} reach={40} />);
    const button = screen.getByRole('button', { name: 'Pull me' });
    await userEvent.hover(button, { position: { x: 0, y: 0 }, force: true });
    await new Promise((r) => setTimeout(r, 400));
    // 40% of a 40px reach is 16px; the spring may overshoot it slightly before settling.
    expect(Math.abs(offset(button).x)).toBeLessThanOrEqual(16 * 1.1);
  });

  it('does not move under reduced motion', async () => {
    document.documentElement.dataset.motion = 'reduce';
    render(<Example />);
    const button = screen.getByRole('button', { name: 'Pull me' });
    expect(button.hasAttribute('data-magnetic')).toBe(false);
    await userEvent.hover(button, { position: { x: 2, y: 2 } });
    await new Promise((r) => setTimeout(r, 200));
    expect(offset(button)).toEqual({ x: 0, y: 0 });
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        const onClick = vi.fn();
        render(<MagneticButton onClick={onClick}>Go</MagneticButton>);
        screen.getByRole('button').focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onClick).toHaveBeenCalledTimes(2);
      },
      Tab: async () => {
        render(<Example />);
        const button = screen.getByRole('button', { name: 'Pull me' });
        button.focus();
        await new Promise((r) => setTimeout(r, 100));
        expect(offset(button)).toEqual({ x: 0, y: 0 });
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Far away' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
