import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { announce } from './announce';
import { place } from './place';
import { rovingIndex } from './roving';
import { nearestInDirection } from './spatial';
import { useControllableState } from './use-controllable-state';

const viewport = { x: 0, y: 0, width: 1000, height: 800 };

describe('place', () => {
  it('centres below the anchor by default', () => {
    const p = place(
      { x: 400, y: 100, width: 100, height: 40 },
      { width: 200, height: 100 },
      viewport,
    );
    expect(p).toMatchObject({ side: 'bottom', x: 350, y: 148 });
    expect(p.arrow).toBe(100);
  });

  it('flips to the top when there is no room below', () => {
    const p = place(
      { x: 400, y: 720, width: 100, height: 40 },
      { width: 200, height: 100 },
      viewport,
    );
    expect(p.side).toBe('top');
    expect(p.y).toBe(720 - 8 - 100);
  });

  it('keeps the preferred side when the opposite side is even smaller', () => {
    const p = place(
      { x: 400, y: 350, width: 100, height: 40 },
      { width: 200, height: 600 },
      viewport,
    );
    expect(p.side).toBe('bottom');
  });

  it('shifts inside the viewport padding and moves the arrow to keep pointing at the anchor', () => {
    const p = place(
      { x: 0, y: 100, width: 40, height: 40 },
      { width: 200, height: 100 },
      viewport,
      {
        padding: 8,
      },
    );
    expect(p.x).toBe(8);
    expect(p.arrow).toBe(12);
  });

  it('places on the right and flips to the left at the edge', () => {
    const right = place(
      { x: 100, y: 100, width: 40, height: 40 },
      { width: 200, height: 100 },
      viewport,
      {
        side: 'right',
      },
    );
    expect(right).toMatchObject({ side: 'right', x: 148 });
    const flipped = place(
      { x: 900, y: 100, width: 40, height: 40 },
      { width: 200, height: 100 },
      viewport,
      {
        side: 'right',
      },
    );
    expect(flipped.side).toBe('left');
  });
});

describe('rovingIndex', () => {
  it('moves and wraps horizontally', () => {
    expect(rovingIndex('ArrowRight', 0, 3, { orientation: 'horizontal' })).toBe(1);
    expect(rovingIndex('ArrowRight', 2, 3, { orientation: 'horizontal' })).toBe(0);
    expect(rovingIndex('ArrowLeft', 0, 3, { orientation: 'horizontal' })).toBe(2);
  });

  it('stops at the ends when loop is off', () => {
    expect(rovingIndex('ArrowRight', 2, 3, { orientation: 'horizontal', loop: false })).toBe(2);
  });

  it('ignores keys for the other axis and handles Home/End', () => {
    expect(rovingIndex('ArrowDown', 0, 3, { orientation: 'horizontal' })).toBeNull();
    expect(rovingIndex('Home', 2, 3, { orientation: 'vertical' })).toBe(0);
    expect(rovingIndex('End', 0, 3, { orientation: 'vertical' })).toBe(2);
  });

  it('reverses left and right in RTL', () => {
    expect(rovingIndex('ArrowRight', 1, 3, { orientation: 'horizontal', rtl: true })).toBe(0);
  });
});

describe('nearestInDirection', () => {
  const box = (x: number, y: number) => ({ x, y, width: 10, height: 10 });
  const from = box(100, 100);
  const candidates = [box(200, 100), box(160, 180), box(0, 100), box(100, 0)];

  it('finds the nearest box in each direction', () => {
    expect(nearestInDirection(from, candidates, 'right')).toBe(0);
    expect(nearestInDirection(from, candidates, 'down')).toBe(1);
    expect(nearestInDirection(from, candidates, 'left')).toBe(2);
    expect(nearestInDirection(from, candidates, 'up')).toBe(3);
  });

  it('returns -1 when nothing lies that way', () => {
    expect(nearestInDirection(box(500, 500), [box(0, 0)], 'right')).toBe(-1);
  });
});

function Counter(props: { value?: number; onChange?: (v: number) => void }) {
  const [count, setCount] = useControllableState({ ...props, defaultValue: 0 });
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      {count}
    </button>
  );
}

describe('useControllableState', () => {
  it('keeps its own state when uncontrolled', async () => {
    const onChange = vi.fn();
    render(<Counter onChange={onChange} />);
    await act(async () => screen.getByRole('button').click());
    expect(screen.getByRole('button').textContent).toBe('1');
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('only reports changes when controlled', async () => {
    const onChange = vi.fn();
    render(<Counter value={5} onChange={onChange} />);
    await act(async () => screen.getByRole('button').click());
    expect(screen.getByRole('button').textContent).toBe('5');
    expect(onChange).toHaveBeenCalledWith(6);
  });
});

describe('announce', () => {
  it('writes the message into a shared polite live region', async () => {
    announce('Copied');
    await vi.waitFor(() => {
      const region = document.querySelector('[data-atlas-announcer="polite"]');
      expect(region?.getAttribute('aria-live')).toBe('polite');
      expect(region?.textContent).toBe('Copied');
    });
  });
});
