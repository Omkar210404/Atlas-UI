import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { LoadingStateButton } from './LoadingStateButton';

const labels = {
  idle: 'Save',
  loading: 'Saving…',
  success: 'Saved',
  error: 'Couldn’t save. Try again',
};

function deferred() {
  let resolve!: () => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const announced = (politeness: 'polite' | 'assertive') =>
  document.querySelector(`[data-atlas-announcer="${politeness}"]`)?.textContent;

describe('Loading-state button', () => {
  it('goes idle → loading → success → idle and keeps its name in sync', async () => {
    const work = deferred();
    render(<LoadingStateButton labels={labels} onAction={() => work.promise} resetAfter={200} />);
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Saving…' })).toBe(button);
    await vi.waitFor(() => expect(announced('polite')).toBe('Saving…'));
    work.resolve();
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Saved' })).toBe(button));
    await vi.waitFor(() => expect(announced('polite')).toBe('Saved'));
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBe(button));
  });

  it('shows the error state and announces it assertively', async () => {
    render(<LoadingStateButton labels={labels} onAction={() => Promise.reject(new Error('no'))} />);
    await userEvent.click(screen.getByRole('button'));
    await vi.waitFor(() => expect(screen.getByRole('button', { name: labels.error })).toBeTruthy());
    await vi.waitFor(() => expect(announced('assertive')).toBe(labels.error));
  });

  it('ignores presses while busy', async () => {
    const work = deferred();
    const onAction = vi.fn(() => work.promise);
    render(<LoadingStateButton labels={labels} onAction={onAction} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.click(button, { force: true });
    expect(onAction).toHaveBeenCalledOnce();
    work.resolve();
  });

  it('keeps the same width in every state', async () => {
    const work = deferred();
    render(<LoadingStateButton labels={labels} onAction={() => work.promise} />);
    const button = screen.getByRole('button');
    const idle = button.getBoundingClientRect().width;
    await userEvent.click(button);
    expect(button.getBoundingClientRect().width).toBe(idle);
    work.reject(new Error('no'));
    await vi.waitFor(() => expect(button.dataset.state).toBe('error'));
    expect(button.getBoundingClientRect().width).toBe(idle);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        const onAction = vi.fn(() => Promise.reject(new Error('no')));
        render(<LoadingStateButton labels={labels} onAction={onAction} />);
        const button = screen.getByRole('button');
        button.focus();
        await userEvent.keyboard('{Enter}');
        await vi.waitFor(() => expect(button.dataset.state).toBe('error'));
        await userEvent.keyboard(' ');
        expect(onAction).toHaveBeenCalledTimes(2);
      },
      Tab: async () => {
        const work = deferred();
        render(
          <>
            <LoadingStateButton labels={labels} onAction={() => work.promise} />
            <button type="button">Next</button>
          </>,
        );
        const button = screen.getByRole('button', { name: 'Save' });
        button.focus();
        await userEvent.keyboard('{Enter}');
        expect(document.activeElement).toBe(button);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }));
        work.resolve();
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
