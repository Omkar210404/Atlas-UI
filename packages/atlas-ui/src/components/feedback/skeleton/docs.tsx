import { useEffect, useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { Skeleton, SkeletonGroup } from './Skeleton';

export const meta: ComponentMeta = {
  slug: 'skeleton',
  name: 'Skeleton shimmer system',
  category: 'feedback',
  summary: 'Placeholders shaped like the content to come.',
  description: [
    'Lines, blocks and circles that stand in for text, media and avatars while they load, so the layout does not jump when the real content arrives.',
    'A soft highlight sweeps across them. The sweep position is a registered CSS property (`@property`), so the browser animates it on its own with no script running.',
  ],
  usage: [
    'Shape placeholders like the real content: the same number of lines, the same image size.',
    'Wrap them in `SkeletonGroup` with a `label`, so screen readers hear “Loading harbour details” instead of nothing.',
    'Use `lines` for paragraphs; the last line comes out shorter, as real paragraphs do.',
    'For waits longer than a few seconds, add a progress ring or a message as well.',
  ],
  keyboard: [],
  accessibility: [
    '`SkeletonGroup` marks its region `aria-busy` while loading and contains a status message naming what is loading.',
    'The placeholder shapes are hidden from assistive technology; they carry no content.',
    'In forced-colours mode the shapes get a dashed outline so they stay visible.',
  ],
  reducedMotion: 'The shimmer stops; placeholders are shown as still shapes.',
  props: [
    {
      kind: 'number',
      name: 'lines',
      label: 'Lines',
      description: 'Lines of text in the placeholder.',
      default: 3,
      min: 1,
      max: 6,
      step: 1,
    },
    {
      kind: 'boolean',
      name: 'avatar',
      label: 'Avatar',
      description: 'Include a circle.',
      default: true,
    },
    {
      kind: 'boolean',
      name: 'media',
      label: 'Media block',
      description: 'Include an image block.',
      default: true,
    },
  ],
  files: ['Skeleton.tsx', 'skeleton.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: ['tokens'],
};

function Card({
  lines = 3,
  avatar = true,
  media = true,
}: {
  lines?: number;
  avatar?: boolean;
  media?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', width: 'min(22rem, 100%)' }}>
      {media ? <Skeleton shape="block" height="7rem" /> : null}
      <div style={{ display: 'flex', gap: 'var(--space-s)', alignItems: 'center' }}>
        {avatar ? <Skeleton shape="circle" /> : null}
        <Skeleton width="45%" />
      </div>
      <Skeleton lines={lines} />
    </div>
  );
}

function Loader() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(timer);
  }, [loading]);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-m)', justifyItems: 'start' }}>
      <SkeletonGroup
        loading={loading}
        label="Loading harbour details"
        placeholder={<Card media={false} lines={2} />}
      >
        <div style={{ width: 'min(22rem, 100%)' }}>
          <h3 style={{ fontSize: 'var(--step-1)' }}>Fowey</h3>
          <p style={{ fontFamily: 'var(--font-prose)', color: 'var(--ink-soft)' }}>
            River estuary with all-tide access and visitor moorings on the east bank.
          </p>
        </div>
      </SkeletonGroup>
      <Button size="s" onClick={() => setLoading(true)}>
        Load again
      </Button>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'card',
      name: 'Card placeholder',
      description: 'Media, an avatar and three lines.',
      render: () => <Card />,
    },
    {
      id: 'swap',
      name: 'Loading, then content',
      description: 'Placeholders give way to the real text after two seconds.',
      render: () => <Loader />,
    },
  ],
  Playground: ({ values }) => (
    <Card
      lines={Number(values.lines)}
      avatar={Boolean(values.avatar)}
      media={Boolean(values.media)}
    />
  ),
};
