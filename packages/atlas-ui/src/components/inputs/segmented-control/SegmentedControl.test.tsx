import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'm', label: 'Metres' },
  { value: 'ft', label: 'Feet' },
  { value: 'fm', label: 'Fathoms' },
];

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <>
      <button type="button">Before</button>
      <SegmentedControl label="Units" options={options} onValueChange={onValueChange} />
      <button type="button">After</button>
    </>
  );
}

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement;

describe('Segmented control', () => {
  it('is a labelled radio group with the first option selected', () => {
    render(<Example />);
    expect(screen.getByRole('radiogroup', { name: 'Units' })).toBeTruthy();
    expect(radio('Metres').checked).toBe(true);
  });

  it('selects on click and moves the marker', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(radio('Fathoms'));
    expect(radio('Fathoms').checked).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith('fm');
    const track = screen.getByRole('radiogroup');
    const option = radio('Fathoms').closest('label')!;
    await vi.waitFor(() =>
      expect(track.style.getPropertyValue('--atl-seg-x')).toBe(`${option.offsetLeft}px`),
    );
  });

  it('keeps separate controls in separate groups', async () => {
    render(
      <>
        <SegmentedControl label="A" options={options} />
        <SegmentedControl label="B" options={options} />
      </>,
    );
    const [, feetB] = screen.getAllByRole('radio', { name: 'Feet' }) as HTMLInputElement[];
    await userEvent.click(feetB!);
    const [metresA] = screen.getAllByRole('radio', { name: 'Metres' }) as HTMLInputElement[];
    expect(metresA!.checked).toBe(true);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(<Example />);
        screen.getByRole('button', { name: 'Before' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(radio('Metres'));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
      },
      'ArrowRight / ArrowDown': async () => {
        render(<Example />);
        radio('Metres').focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(radio('Feet').checked).toBe(true);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        expect(radio('Metres').checked).toBe(true);
      },
      'ArrowLeft / ArrowUp': async () => {
        render(<Example />);
        radio('Metres').focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(radio('Fathoms').checked).toBe(true);
        await userEvent.keyboard('{ArrowUp}');
        expect(radio('Feet').checked).toBe(true);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
