import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { TextField } from './TextField';

const announced = () => document.querySelector('[data-atlas-announcer="polite"]')?.textContent;

describe('Text field', () => {
  it('is labelled and described by its hint', () => {
    render(<TextField label="Harbour name" hint="As on the chart." />);
    const input = screen.getByRole('textbox', { name: 'Harbour name' });
    const hint = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(hint?.textContent).toBe('As on the chart.');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('marks itself invalid and puts the error first in its description', () => {
    render(<TextField label="Harbour name" hint="As on the chart." error="Enter a name." />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const [first] = input.getAttribute('aria-describedby')!.split(' ');
    expect(document.getElementById(first!)?.textContent).toBe('Enter a name.');
  });

  it('says "required" in words', () => {
    render(<TextField label="Harbour name" required />);
    expect(
      screen.getByRole('textbox', { name: 'Harbour name (required)' }).hasAttribute('required'),
    ).toBe(true);
  });

  it('works controlled and uncontrolled', async () => {
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('Fal');
      return (
        <TextField
          label="Controlled"
          value={value}
          onValueChange={(v) => (onValueChange(v), setValue(v.toUpperCase()))}
        />
      );
    }
    render(
      <>
        <TextField label="Free" defaultValue="Fal" />
        <Controlled />
      </>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Free' }), 'm');
    expect(screen.getByRole('textbox', { name: 'Free' })).toHaveProperty('value', 'Falm');
    await userEvent.type(screen.getByRole('textbox', { name: 'Controlled' }), 'm');
    expect(onValueChange).toHaveBeenLastCalledWith('Falm');
    expect(screen.getByRole('textbox', { name: 'Controlled' })).toHaveProperty('value', 'FALM');
  });

  it('counts characters and announces only near the limit', async () => {
    render(<TextField label="Notes" maxLength={14} />);
    const input = screen.getByRole('textbox');
    expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toBe(
      '0 of 14 characters used',
    );
    await userEvent.type(input, 'abc');
    expect(announced() ?? '').not.toMatch(/left/);
    await userEvent.type(input, 'def');
    await vi.waitFor(() => expect(announced()).toBe('10 characters left'));
    await userEvent.type(input, 'ghijklmnop');
    await vi.waitFor(() => expect(announced()).toBe('Character limit reached'));
    expect(input).toHaveProperty('value', 'abcdefghijklmn');
  });

  it('renders a textarea when multiline', () => {
    render(<TextField label="Passage notes" multiline={4} />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(
          <>
            <TextField label="One" />
            <TextField label="Two" />
          </>,
        );
        screen.getByRole('textbox', { name: 'One' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Two' }));
      },
      'a–z': async () => {
        render(<TextField label="Name" maxLength={10} />);
        await userEvent.type(screen.getByRole('textbox'), 'Falmouth');
        expect(screen.getByText('8/10')).toBeTruthy();
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
