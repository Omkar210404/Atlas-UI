import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { OtpInput, sanitizeCode } from './OtpInput';

const input = () => screen.getByRole('textbox') as HTMLInputElement;
const cells = () =>
  Array.from(document.querySelectorAll('.atl-otp__cell')).map((c) => c.textContent);

describe('sanitizeCode', () => {
  it('keeps only allowed characters, in capitals, up to the length', () => {
    expect(sanitizeCode('123-456 789', 6, 'numeric')).toBe('123456');
    expect(sanitizeCode('ab-12', 6, 'alphanumeric')).toBe('AB12');
  });
});

describe('OTP input', () => {
  it('is one labelled text field set up for one-time codes', () => {
    render(<OtpInput label="Code" hint="Sent by text." />);
    const field = screen.getByRole('textbox', { name: 'Code' });
    expect(field.getAttribute('autocomplete')).toBe('one-time-code');
    expect(field.getAttribute('inputmode')).toBe('numeric');
    expect(document.getElementById(field.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Sent by text.',
    );
    expect(document.querySelector('.atl-otp__cells')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('fills cells as you type and reports completion once', async () => {
    const onComplete = vi.fn();
    render(<OtpInput label="Code" length={4} onComplete={onComplete} />);
    await userEvent.type(input(), '12a3');
    expect(cells()).toEqual(['1', '2', '3', '']);
    await userEvent.type(input(), '49');
    expect(input().value).toBe('1234');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('cleans pasted codes', async () => {
    render(<OtpInput label="Code" />);
    await userEvent.fill(input(), '246 810');
    expect(input().value).toBe('246810');
  });

  it('marks every cell on error', () => {
    render(<OtpInput label="Code" error="Did not match." />);
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector('.atl-otp')?.hasAttribute('data-invalid')).toBe(true);
  });

  it('can mask characters', async () => {
    render(<OtpInput label="PIN" length={4} mask />);
    await userEvent.type(input(), '19');
    expect(cells()).toEqual(['•', '•', '', '']);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      '0–9': async () => {
        render(<OtpInput label="Code" />);
        await userEvent.type(input(), '9x8');
        expect(input().value).toBe('98');
        expect(document.querySelector('.atl-otp__cell[data-active]')).toBe(
          document.querySelectorAll('.atl-otp__cell')[2],
        );
      },
      Backspace: async () => {
        render(<OtpInput label="Code" defaultValue="123" />);
        await userEvent.click(input());
        await userEvent.keyboard('{Backspace}');
        expect(input().value).toBe('12');
      },
      Tab: async () => {
        render(
          <>
            <OtpInput label="Code" />
            <button type="button">Verify</button>
          </>,
        );
        input().focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Verify' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
