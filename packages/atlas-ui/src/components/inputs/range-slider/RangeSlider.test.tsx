import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { RangeSlider } from './RangeSlider';

const sliders = () => screen.getAllByRole('slider');
const now = (el: HTMLElement) => Number(el.getAttribute('aria-valuenow'));

function Single(props: {
  onValueChange?: (v: number) => void;
  onValueCommit?: (v: number) => void;
}) {
  return (
    <div style={{ width: 300 }}>
      <RangeSlider label="Opacity" defaultValue={50} formatValue={(v) => `${v}%`} {...props} />
    </div>
  );
}

function Range() {
  return (
    <div style={{ width: 300 }}>
      <RangeSlider
        label="Depth"
        min={0}
        max={30}
        defaultValue={[4, 12] as const}
        formatValue={(v) => `${v} m`}
      />
    </div>
  );
}

describe('Range slider', () => {
  it('exposes value, limits and value text', () => {
    render(<Single />);
    const [thumb] = sliders();
    expect(thumb!.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb!.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb!.getAttribute('aria-valuetext')).toBe('50%');
    expect(screen.getByRole('slider', { name: 'Opacity' })).toBe(thumb);
  });

  it('names both thumbs of a range and limits each by the other', () => {
    render(<Range />);
    const [low, high] = sliders();
    expect(screen.getByRole('slider', { name: 'Depth Minimum' })).toBe(low);
    expect(low!.getAttribute('aria-valuemax')).toBe('12');
    expect(high!.getAttribute('aria-valuemin')).toBe('4');
  });

  it('stops thumbs at each other instead of crossing', async () => {
    render(<Range />);
    const [low] = sliders();
    low!.focus();
    await userEvent.keyboard('{End}');
    expect(now(low!)).toBe(12);
  });

  it('moves the nearest thumb when the track is pressed', async () => {
    render(<Range />);
    const track = document.querySelector('.atl-slider__track') as HTMLElement;
    const width = track.getBoundingClientRect().width;
    await userEvent.click(track, { position: { x: width * 0.9, y: 22 } });
    const [low, high] = sliders();
    expect(now(low!)).toBe(4);
    expect(now(high!)).toBe(27);
    expect(document.activeElement).toBe(high);
  });

  it('reports changes and commits once per key press', async () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(<Single onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    sliders()[0]!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(51);
    expect(onValueCommit).toHaveBeenCalledWith(51);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'ArrowRight / ArrowUp': async () => {
        render(<Single />);
        const [thumb] = sliders();
        thumb!.focus();
        await userEvent.keyboard('{ArrowRight}{ArrowUp}');
        expect(now(thumb!)).toBe(52);
      },
      'ArrowLeft / ArrowDown': async () => {
        render(<Single />);
        const [thumb] = sliders();
        thumb!.focus();
        await userEvent.keyboard('{ArrowLeft}{ArrowDown}');
        expect(now(thumb!)).toBe(48);
      },
      'PageUp / PageDown': async () => {
        render(<Single />);
        const [thumb] = sliders();
        thumb!.focus();
        await userEvent.keyboard('{PageUp}');
        expect(now(thumb!)).toBe(60);
        await userEvent.keyboard('{PageDown}{PageDown}');
        expect(now(thumb!)).toBe(40);
      },
      'Home / End': async () => {
        render(<Range />);
        const [low, high] = sliders();
        low!.focus();
        await userEvent.keyboard('{Home}');
        expect(now(low!)).toBe(0);
        high!.focus();
        await userEvent.keyboard('{End}');
        expect(now(high!)).toBe(30);
      },
      Tab: async () => {
        render(<Range />);
        const [low, high] = sliders();
        low!.focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(high);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
