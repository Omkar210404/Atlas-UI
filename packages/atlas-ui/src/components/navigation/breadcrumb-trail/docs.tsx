import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { BreadcrumbTrail, type Crumb } from './BreadcrumbTrail';

export const meta: ComponentMeta = {
  slug: 'breadcrumb-trail',
  name: 'Breadcrumb trail',
  category: 'navigation',
  summary: 'The path to the current page, folding its middle when space runs out.',
  description: [
    'Shows where you are as a path from the top level, with the current page marked. When the trail is wider than its container, the middle levels fold into a button that lists them.',
    'Folding is measured, not guessed: the trail compares the real width of each level with the space it has, so it folds only as much as it needs to and unfolds again when there is room.',
  ],
  usage: [
    'Pass the full path; the last crumb is treated as the current page.',
    'The first and last crumbs never fold.',
    'In a client-side router, pass `onNavigate` and call `event.preventDefault()` before routing.',
    'Give the trail a width (for example by placing it in a flex row with `min-width: 0`) so it has something to fold against.',
  ],
  keyboard: [
    { keys: ['Tab'], action: 'Move between crumbs and the fold button.' },
    { keys: ['Enter'], action: 'Follow a crumb, or open and close the folded levels.' },
    { keys: ['Escape'], action: 'Close the folded levels and return focus to the fold button.' },
  ],
  accessibility: [
    'A `nav` landmark with an accessible name, containing an ordered list of links.',
    'The current page link has `aria-current="page"` and is marked by weight and a shape, not colour alone.',
    'The fold button names how many levels it hides and exposes `aria-expanded` and `aria-controls`.',
    'The folded list closes on Escape, on a click outside, and when focus leaves it.',
    'Separators are decorative and hidden from assistive technology.',
  ],
  reducedMotion: 'New crumbs and the folded list appear without sliding.',
  props: [
    {
      kind: 'number',
      name: 'depth',
      label: 'Depth',
      description: 'How many levels the path has.',
      default: 5,
      min: 2,
      max: 7,
      step: 1,
    },
    {
      kind: 'number',
      name: 'width',
      label: 'Container width',
      description: 'Width available to the trail.',
      default: 560,
      min: 180,
      max: 760,
      step: 10,
      unit: 'px',
    },
  ],
  files: ['BreadcrumbTrail.tsx', 'breadcrumb-trail.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'icons/more',
    'primitives/use-dismiss',
    'primitives/use-placement',
    'primitives/place',
    'tokens',
  ],
};

const path: Crumb[] = [
  { label: 'Charts', href: '#charts' },
  { label: 'North Atlantic', href: '#north-atlantic' },
  { label: 'Western approaches', href: '#western-approaches' },
  { label: 'Celtic Sea', href: '#celtic-sea' },
  { label: 'Approaches to Falmouth', href: '#falmouth-approaches' },
  { label: 'Carrick Roads', href: '#carrick-roads' },
  { label: 'Anchorage plan', href: '#anchorage-plan' },
];

function Demo({ depth, width, label }: { depth: number; width: number; label: string }) {
  const [trail, setTrail] = useState(() => path.slice(0, depth));
  return (
    <div style={{ width: `min(${width}px, 100%)`, display: 'grid', gap: 'var(--space-s)' }}>
      <div style={{ boxShadow: 'inset 0 -1px 0 var(--isobath)', paddingBottom: 'var(--space-xs)' }}>
        <BreadcrumbTrail
          label={label}
          items={trail}
          onNavigate={(crumb, event) => {
            event.preventDefault();
            const index = path.findIndex((p) => p.href === crumb.href);
            setTrail(path.slice(0, index + 1));
          }}
        />
      </div>
      <Button
        style={{ justifySelf: 'start' }}
        disabled={trail.length >= path.length}
        onClick={() => setTrail(path.slice(0, trail.length + 1))}
      >
        Go one level deeper
      </Button>
    </div>
  );
}

const named = (preset: string, instance?: string) =>
  ['Chart location', preset, instance].filter(Boolean).join(', ');

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'roomy',
      name: 'Room to spare',
      description: 'Every level fits, so nothing folds.',
      render: (instance) => <Demo depth={4} width={720} label={named('roomy', instance)} />,
    },
    {
      id: 'narrow',
      name: 'Narrow container',
      description: 'The middle levels fold into a button.',
      render: (instance) => <Demo depth={6} width={340} label={named('narrow', instance)} />,
    },
    {
      id: 'deep',
      name: 'Deep path',
      description: 'Seven levels, folding only what does not fit.',
      render: (instance) => <Demo depth={7} width={560} label={named('deep', instance)} />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      key={String(values.depth)}
      depth={Number(values.depth)}
      width={Number(values.width)}
      label="Chart location, playground"
    />
  ),
};
