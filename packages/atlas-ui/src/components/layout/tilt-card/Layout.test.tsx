import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { BentoGrid, BentoItem } from '../bento-grid/BentoGrid';
import { meta as bentoMeta } from '../bento-grid/docs';
import { meta as expandMeta } from '../expandable-card/docs';
import { ExpandableCard } from '../expandable-card/ExpandableCard';
import { ParallaxStack } from '../parallax-stack/ParallaxStack';
import { meta } from './docs';
import { TiltCard } from './TiltCard';

afterEach(() => {
  delete document.documentElement.dataset.motion;
});

const card = () => document.querySelector('.atl-tilt__card') as HTMLElement;

describe('Tilt card', () => {
  it('tilts toward the pointer and settles when it leaves', async () => {
    render(
      <div style={{ padding: 40 }}>
        <TiltCard maxTilt={10}>
          <div style={{ height: 160, width: 240 }}>Chart</div>
        </TiltCard>
        <button type="button">Away</button>
      </div>,
    );
    await userEvent.hover(card(), { position: { x: 230, y: 10 } });
    expect(parseFloat(card().style.getPropertyValue('--atl-tilt-x'))).toBeGreaterThan(2);
    expect(parseFloat(card().style.getPropertyValue('--atl-tilt-y'))).toBeGreaterThan(2);
    await userEvent.hover(screen.getByRole('button', { name: 'Away' }));
    expect(card().style.getPropertyValue('--atl-tilt-x')).toBe('0deg');
  });

  it('stays flat under reduced motion', async () => {
    document.documentElement.dataset.motion = 'reduce';
    render(
      <TiltCard>
        <div style={{ height: 160, width: 240 }}>Chart</div>
      </TiltCard>,
    );
    await userEvent.hover(card(), { position: { x: 230, y: 10 } });
    expect(card().style.getPropertyValue('--atl-tilt-x')).toBe('');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(
          <TiltCard>
            <button type="button">Open chart</button>
          </TiltCard>,
        );
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open chart' }));
        expect(getComputedStyle(card()).translate).not.toBe('none');
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Bento grid', () => {
  const grid = (width: number) => (
    <div style={{ width }}>
      <BentoGrid label="Overview">
        <BentoItem colSpan={2}>
          <button type="button">First</button>
        </BentoItem>
        <BentoItem>
          <button type="button">Second</button>
        </BentoItem>
      </BentoGrid>
    </div>
  );
  const columns = () =>
    getComputedStyle(document.querySelector('.atl-bento__grid')!).gridTemplateColumns.split(' ')
      .length;

  it('re-flows with its container width', () => {
    const { rerender } = render(grid(900));
    expect(columns()).toBe(4);
    rerender(grid(500));
    expect(columns()).toBe(2);
    rerender(grid(300));
    expect(columns()).toBe(1);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(bentoMeta, {
      Tab: async () => {
        render(grid(900));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Second' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Expandable card', () => {
  const example = (
    <ExpandableCard title="Fowey" summary="River harbour.">
      Visitor pontoons on the east bank.
    </ExpandableCard>
  );
  const toggle = () => screen.getByRole('button', { name: 'Fowey' });

  it('is a disclosure that keeps focus on its toggle', async () => {
    render(example);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(toggle().getAttribute('aria-controls')!)?.textContent).toContain(
      'Visitor pontoons',
    );
    expect(document.activeElement).toBe(toggle());
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(expandMeta, {
      Tab: async () => {
        render(example);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(toggle());
      },
      'Enter / Space': async () => {
        render(example);
        toggle().focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle().getAttribute('aria-expanded')).toBe('true');
        await userEvent.keyboard(' ');
        expect(toggle().getAttribute('aria-expanded')).toBe('false');
        await vi.waitFor(() =>
          expect(screen.queryByText('Visitor pontoons on the east bank.')).toBeNull(),
        );
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Parallax stack', () => {
  it('is decorative without a label and an image with one', () => {
    const layers = [{ id: 'a', depth: 0.5, content: <div /> }];
    const { rerender } = render(<ParallaxStack layers={layers} />);
    expect(document.querySelector('.atl-parallax')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<ParallaxStack layers={layers} label="Headlands" />);
    expect(screen.getByRole('img', { name: 'Headlands' })).toBeTruthy();
  });

  it('gives each layer its depth', () => {
    render(
      <ParallaxStack
        layers={[
          { id: 'a', depth: 0.25, content: <div /> },
          { id: 'b', depth: 1, content: <div /> },
        ]}
      />,
    );
    const depths = Array.from(document.querySelectorAll<HTMLElement>('.atl-parallax__layer')).map(
      (l) => l.style.getPropertyValue('--atl-depth'),
    );
    expect(depths).toEqual(['0.25', '1']);
  });
});
