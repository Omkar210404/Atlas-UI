import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { Button } from './Button';
import { meta } from './docs';

describe('Button', () => {
  it('is a native button that does not submit by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.dataset.variant).toBe('secondary');
  });

  it('ignores clicks while aria-disabled but stays focusable', async () => {
    const onClick = vi.fn();
    render(
      <Button aria-disabled="true" onClick={onClick}>
        Export
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Export' });
    await userEvent.click(button, { force: true });
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('meets the target size at every size', () => {
    render(
      <>
        <Button size="s">S</Button>
        <Button size="m">M</Button>
        <Button size="l">L</Button>
      </>,
    );
    for (const name of ['S', 'M', 'L']) {
      expect(
        screen.getByRole('button', { name }).getBoundingClientRect().height,
      ).toBeGreaterThanOrEqual(32);
    }
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Go</Button>);
        screen.getByRole('button').focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onClick).toHaveBeenCalledTimes(2);
      },
      Tab: async () => {
        render(
          <>
            <Button>One</Button>
            <Button>Two</Button>
          </>,
        );
        screen.getByRole('button', { name: 'One' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
