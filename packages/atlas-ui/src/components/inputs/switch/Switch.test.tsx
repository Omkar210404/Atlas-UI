import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a named switch with its description', () => {
    render(<Switch label="Show contours" description="Below 20 m." />);
    const control = screen.getByRole('switch', { name: 'Show contours' });
    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(document.getElementById(control.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Below 20 m.',
    );
  });

  it('toggles from the control and from its label', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Show contours" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole('switch');
    await userEvent.click(control);
    expect(control.getAttribute('aria-checked')).toBe('true');
    await userEvent.click(screen.getByText('Show contours'));
    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('follows a controlled value and submits with a form', () => {
    const { rerender } = render(
      <form>
        <Switch label="Lights" name="lights" checked={false} />
      </form>,
    );
    const form = document.querySelector('form')!;
    expect(new FormData(form).get('lights')).toBe('');
    rerender(
      <form>
        <Switch label="Lights" name="lights" checked />
      </form>,
    );
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
    expect(new FormData(form).get('lights')).toBe('on');
  });

  it('cannot be changed when disabled', async () => {
    render(<Switch label="Live tides" disabled />);
    const control = screen.getByRole('switch');
    await userEvent.click(control, { force: true });
    expect(control.getAttribute('aria-checked')).toBe('false');
  });

  it('gives a 44px target around a smaller track', () => {
    render(<Switch label="Big enough" />);
    const before = getComputedStyle(screen.getByRole('switch'), '::before');
    const track = screen.getByRole('switch').getBoundingClientRect();
    expect(track.height + Math.abs(parseFloat(before.top)) * 2).toBeGreaterThanOrEqual(44);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Space / Enter': async () => {
        render(<Switch label="Contours" />);
        const control = screen.getByRole('switch');
        control.focus();
        await userEvent.keyboard(' ');
        expect(control.getAttribute('aria-checked')).toBe('true');
        await userEvent.keyboard('{Enter}');
        expect(control.getAttribute('aria-checked')).toBe('false');
      },
      Tab: async () => {
        render(
          <>
            <Switch label="One" />
            <Switch label="Two" />
          </>,
        );
        screen.getByRole('switch', { name: 'One' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Two' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
