import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { HeatGrid } from './HeatGrid';

export const meta: ComponentMeta = {
  slug: 'heat-grid',
  name: 'Heat-grid',
  category: 'data-display',
  summary: 'A grid of cells shaded by value, navigable by keyboard.',
  description: [
    'A grid of values shaded in five depth tints, for spotting patterns across two dimensions: days and hours, months and places.',
    'Hover or focus a cell to read its value; arrow keys move around the grid like a spreadsheet. A legend gives the range of each tint.',
  ],
  usage: [
    'Pass `rows`, `columns` and `values[row][column]`.',
    'Use `formatValue` for units; each cell is read as “row, column: value”.',
    'Turn on `showValues` when exact numbers matter more than the overall pattern.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move into the grid (to the last focused cell) and out again.' },
    { keys: ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], action: 'Move one cell.' },
    { keys: ['Home', 'End'], action: 'Go to the first or last cell in the row.' },
    { keys: ['Control+Home', 'Control+End'], action: 'Go to the first or last cell in the grid.' },
  ],
  accessibility: [
    'Follows the WAI-ARIA grid pattern: `grid`, `row`, `columnheader`, `rowheader` and `gridcell`, with one Tab stop (roving tabindex).',
    'Every cell is named with its row, column and value, so the colour is never needed to read it.',
    'Values appear inside the cell on hover and focus, with text colour chosen per tint for contrast.',
    'The grid scrolls sideways inside its own box on narrow screens instead of shrinking cells below 36 px.',
  ],
  reducedMotion: 'Nothing animates.',
  props: [
    {
      kind: 'boolean',
      name: 'showValues',
      label: 'Show values',
      description: 'Print every value.',
      default: false,
    },
  ],
  files: ['HeatGrid.tsx', 'heat-grid.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['00', '03', '06', '09', '12', '15', '18', '21'];
// Deterministic sample: a daily sea-breeze cycle with a windy midweek.
const wind = days.map((_, d) =>
  hours.map((_, h) =>
    Math.round(
      8 +
        6 * Math.sin(((h - 2) / 8) * Math.PI * 2) +
        (d >= 2 && d <= 3 ? 8 : 0) +
        ((d * 7 + h * 3) % 5),
    ),
  ),
);

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'wind',
      name: 'Wind by day and hour',
      description: 'A week of three-hourly wind speeds.',
      render: () => (
        <HeatGrid
          label="Wind speed by day and hour"
          rows={days}
          columns={hours}
          values={wind}
          formatValue={(v) => `${v} kn`}
        />
      ),
    },
    {
      id: 'values',
      name: 'With values',
      description: 'Every cell labelled.',
      render: () => (
        <HeatGrid
          label="Wind speed, with values"
          rows={days.slice(0, 4)}
          columns={hours}
          values={wind.slice(0, 4)}
          formatValue={(v) => `${v}`}
          showValues
        />
      ),
    },
  ],
  Playground: ({ values }) => (
    <HeatGrid
      label="Playground wind grid"
      rows={days}
      columns={hours}
      values={wind}
      formatValue={(v) => `${v} kn`}
      showValues={Boolean(values.showValues)}
    />
  ),
};
