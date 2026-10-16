import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { CodePanel } from '../code-panel/CodePanel';
import { meta as codeMeta } from '../code-panel/docs';
import { meta as heatMeta } from '../heat-grid/docs';
import { HeatGrid } from '../heat-grid/HeatGrid';
import { StatCounter } from '../stat-counter/StatCounter';
import { meta as timelineMeta } from '../timeline/docs';
import { Timeline } from '../timeline/Timeline';
import { meta } from './docs';
import { Sparkline } from './Sparkline';

const data = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 3 },
  { label: 'Wed', value: 2 },
];

describe('Sparkline', () => {
  it('summarises the series in words and offers a table', () => {
    render(<Sparkline label="Waves" data={data} formatValue={(v) => `${v} m`} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Waves: from 1 m (Mon) to 2 m (Wed). Lowest 1 m on Mon, highest 3 m on Tue.',
    );
    expect(screen.getByRole('table', { hidden: true })).toBeTruthy();
  });

  describe('keyboard map', () => {
    const scrub = () => screen.getByRole('slider', { name: 'Inspect Waves' });
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(<Sparkline label="Waves" data={data} />);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(scrub());
      },
      'ArrowRight / ArrowLeft': async () => {
        render(<Sparkline label="Waves" data={data} formatValue={(v) => `${v} m`} />);
        scrub().focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(scrub().getAttribute('aria-valuetext')).toBe('Mon: 1 m');
        await userEvent.keyboard('{ArrowRight}');
        expect(scrub().getAttribute('aria-valuetext')).toBe('Tue: 3 m');
        await userEvent.keyboard('{ArrowLeft}');
        expect(scrub().getAttribute('aria-valuetext')).toBe('Mon: 1 m');
      },
      'Home / End': async () => {
        render(<Sparkline label="Waves" data={data} />);
        scrub().focus();
        await userEvent.keyboard('{End}');
        expect(scrub().getAttribute('aria-valuenow')).toBe('2');
        await userEvent.keyboard('{Home}');
        expect(scrub().getAttribute('aria-valuenow')).toBe('0');
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Stat counter', () => {
  it('exposes only the final value and rolls the digits to it', async () => {
    render(<StatCounter label="Miles" value={1284} format={(v) => `${v} nm`} />);
    expect(screen.getByText('1284 nm').className).toContain('atl-visually-hidden');
    expect(document.querySelector('.atl-stat__digits')?.getAttribute('aria-hidden')).toBe('true');
    await vi.waitFor(() => {
      const wheels = Array.from(document.querySelectorAll<HTMLElement>('.atl-stat__wheel'));
      expect(wheels.map((w) => w.style.getPropertyValue('--d'))).toEqual(['1', '2', '8', '4']);
    });
  });
});

describe('Heat-grid', () => {
  const grid = (
    <HeatGrid
      label="Wind"
      rows={['Mon', 'Tue']}
      columns={['00', '06', '12']}
      values={[
        [1, 5, 9],
        [2, 6, 10],
      ]}
      formatValue={(v) => `${v} kn`}
    />
  );
  const cell = (name: string) => screen.getByRole('gridcell', { name });

  it('names every cell with its row, column and value', () => {
    render(grid);
    expect(screen.getByRole('grid', { name: 'Wind' })).toBeTruthy();
    expect(cell('Tue, 06: 6 kn')).toBeTruthy();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(heatMeta, {
      Tab: async () => {
        render(grid);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(cell('Mon, 00: 1 kn'));
      },
      'ArrowRight / ArrowLeft / ArrowUp / ArrowDown': async () => {
        render(grid);
        cell('Mon, 00: 1 kn').focus();
        await userEvent.keyboard('{ArrowRight}{ArrowDown}');
        expect(document.activeElement).toBe(cell('Tue, 06: 6 kn'));
        await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
        expect(document.activeElement).toBe(cell('Mon, 00: 1 kn'));
      },
      'Home / End': async () => {
        render(grid);
        cell('Mon, 06: 5 kn').focus();
        await userEvent.keyboard('{End}');
        expect(document.activeElement).toBe(cell('Mon, 12: 9 kn'));
        await userEvent.keyboard('{Home}');
        expect(document.activeElement).toBe(cell('Mon, 00: 1 kn'));
      },
      'Control+Home / Control+End': async () => {
        render(grid);
        cell('Mon, 00: 1 kn').focus();
        await userEvent.keyboard('{Control>}{End}{/Control}');
        expect(document.activeElement).toBe(cell('Tue, 12: 10 kn'));
        await userEvent.keyboard('{Control>}{Home}{/Control}');
        expect(document.activeElement).toBe(cell('Mon, 00: 1 kn'));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Timeline', () => {
  const events = [
    { id: 'a', time: '05:40', title: 'Cast off', details: 'Ebb running.' },
    { id: 'b', time: '09:30', title: 'Rounding the Lizard', current: true },
  ];

  it('is an ordered list that marks the current event in words', () => {
    render(<Timeline label="Passage" events={events} />);
    expect(screen.getByRole('list', { name: 'Passage' }).tagName).toBe('OL');
    expect(screen.getByText('(now)')).toBeTruthy();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(timelineMeta, {
      Tab: async () => {
        render(<Timeline label="Passage" events={events} />);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cast off' }));
      },
      'Enter / Space': async () => {
        render(<Timeline label="Passage" events={events} />);
        const toggle = screen.getByRole('button', { name: 'Cast off' });
        toggle.focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByText('Ebb running.')).toBeTruthy();
        await userEvent.keyboard(' ');
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Code panel', () => {
  it('copies the code and confirms', async () => {
    const onCopied = vi.fn();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    render(<CodePanel code="const a = 1;" filename="a.ts" onCopied={onCopied} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await vi.waitFor(() => expect(onCopied).toHaveBeenCalledOnce());
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
    writeText.mockRestore();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(codeMeta, {
      Tab: async () => {
        render(<CodePanel code={'line\n'.repeat(80)} filename="long.ts" />);
        await userEvent.keyboard('{Tab}{Tab}');
        expect(document.activeElement?.tagName).toBe('PRE');
      },
      'ArrowDown / ArrowUp': async () => {
        render(
          <div style={{ height: 200 }}>
            <CodePanel code={'line\n'.repeat(200)} filename="long.ts" />
          </div>,
        );
        // The browser scrolls a focused overflow box with the arrow keys; what the panel must
        // guarantee is that the box can take focus and actually overflows.
        const pre = document.querySelector('pre')!;
        pre.focus();
        expect(document.activeElement).toBe(pre);
        expect(pre.scrollHeight).toBeGreaterThan(pre.clientHeight);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
