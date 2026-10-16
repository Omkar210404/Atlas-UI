import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { StatCounter } from '../../data-display/stat-counter/StatCounter';
import { BentoGrid, BentoItem } from './BentoGrid';

export const meta: ComponentMeta = {
  slug: 'bento-grid',
  name: 'Bento grid',
  category: 'layout',
  summary: 'A spanning grid that reflows with its container.',
  description: [
    'A dense grid of tiles that can span two or more columns or rows, for dashboards and overviews. It responds to the width of its own container through container queries, so it re-flows correctly in a sidebar as well as on a full page.',
    'At medium widths it becomes two columns; at narrow widths, one column in source order.',
  ],
  usage: [
    'Give the most important tile `colSpan={2}` and `tone="raised"`.',
    'Order items in the source as they should be read; the grid never reorders them for screen readers, only fills gaps visually at wider sizes.',
    'Pass `label` to make the grid a named group.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move through the controls inside the tiles, in source order.' },
  ],
  accessibility: [
    'Reading and Tab order follow the source order at every width.',
    'At one column, dense packing is turned off so the visual order matches the source exactly.',
    'With `label`, the grid is a `group` with an accessible name.',
  ],
  reducedMotion: 'Nothing animates.',
  props: [
    {
      kind: 'select',
      name: 'columns',
      label: 'Columns',
      description: 'At full width.',
      default: '4',
      options: [
        { value: '4', label: 'Four' },
        { value: '3', label: 'Three' },
      ],
    },
    {
      kind: 'number',
      name: 'width',
      label: 'Container width',
      description: 'Watch it re-flow.',
      default: 720,
      min: 280,
      max: 900,
      step: 20,
      unit: 'px',
    },
  ],
  files: ['BentoGrid.tsx', 'bento-grid.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

function Overview({ columns = 4, width = 720 }: { columns?: 3 | 4; width?: number }) {
  const tile = (title: string, body: string) => (
    <>
      <p style={{ fontWeight: 600 }}>{title}</p>
      <p style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }}>{body}</p>
    </>
  );
  return (
    <div style={{ width: `min(${width}px, 100%)` }}>
      <BentoGrid columns={columns} label="Season overview">
        <BentoItem colSpan={2} rowSpan={2} tone="raised">
          <StatCounter label="Nautical miles logged" value={1284} detail="Since 1 April" />
        </BentoItem>
        <BentoItem>{tile('Passages', '38 this season')}</BentoItem>
        <BentoItem>{tile('Nights at anchor', '21')}</BentoItem>
        <BentoItem colSpan={2}>{tile('Longest passage', 'Falmouth to Roscoff, 98 nm')}</BentoItem>
        <BentoItem>{tile('Crew', 'Six aboard')}</BentoItem>
        <BentoItem>{tile('Harbours', '14 visited')}</BentoItem>
      </BentoGrid>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'overview',
      name: 'Season overview',
      description: 'One raised feature tile and smaller tiles around it.',
      render: () => <Overview />,
    },
    {
      id: 'narrow',
      name: 'In a narrow box',
      description: 'The same grid in a 340 px container: one column.',
      render: () => <Overview width={340} />,
    },
  ],
  Playground: ({ values }) => (
    <Overview columns={Number(values.columns) as 3 | 4} width={Number(values.width)} />
  ),
};
