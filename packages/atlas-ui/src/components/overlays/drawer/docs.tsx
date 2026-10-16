import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { Switch } from '../../inputs/switch/Switch';
import { Drawer } from './Drawer';

export const meta: ComponentMeta = {
  slug: 'drawer',
  name: 'Drawer',
  category: 'overlays',
  summary: 'A sheet from the edge that you can drag away.',
  description: [
    'A panel that slides in from the right, the left or the bottom, for settings, filters or details that need more room than a popover. Drag it back toward its edge, or flick it, to close.',
    'It is a modal dialog underneath, so it has everything the modal has: Tab stays inside, the page behind is inert and still, and focus returns to the opener.',
  ],
  usage: [
    'Use the bottom side on phones: it sits under the thumb.',
    'Dragging is a shortcut, never the only way: the close button, Escape and a click beside the sheet all close it too.',
    'Releasing past 30% of the sheet, or flicking it, closes it; otherwise it springs back.',
  ],
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Move through the drawer’s controls; wraps inside it.' },
    { keys: ['Escape'], action: 'Close the drawer and return focus to its trigger.' },
  ],
  accessibility: [
    'A native modal `<dialog>` labelled by its title; the page behind is inert while it is open.',
    'Dragging is an enhancement for pointer users. Every way of closing has a keyboard and a button equivalent (WCAG 2.5.7).',
    'Drags that start on a button, link or field are ignored, so controls inside keep working.',
    'Focus moves into the drawer on open and back to the opener on close.',
  ],
  reducedMotion:
    'The sheet appears at once instead of sliding, and does not glide back after a short drag.',
  props: [
    {
      kind: 'select',
      name: 'side',
      label: 'Side',
      description: 'Edge it slides from.',
      default: 'right',
      options: [
        { value: 'right', label: 'Right' },
        { value: 'left', label: 'Left' },
        { value: 'bottom', label: 'Bottom' },
      ],
    },
    {
      kind: 'text',
      name: 'title',
      label: 'Title',
      description: 'Names the drawer.',
      default: 'Chart layers',
    },
  ],
  files: ['Drawer.tsx', 'drawer.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'primitives/dialog',
    'primitives/focus',
    'primitives/use-controllable-state',
    'icons/close',
    'tokens',
  ],
};

function Demo({
  side = 'right',
  title = 'Chart layers',
}: {
  side?: 'right' | 'left' | 'bottom';
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {side} drawer</Button>
      <Drawer
        title={title}
        description="Choose what the chart shows."
        side={side}
        open={open}
        onOpenChange={setOpen}
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
          <Switch label="Depth contours" defaultChecked />
          <Switch label="Harbour lights" defaultChecked />
          <Switch label="Anchorages" />
          <Switch label="Tidal streams" />
        </div>
      </Drawer>
    </>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'right',
      name: 'Settings sheet',
      description: 'From the right, with switches inside.',
      render: () => <Demo />,
    },
    {
      id: 'bottom',
      name: 'Bottom sheet',
      description: 'For small screens; drag it down to close.',
      render: () => <Demo side="bottom" />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      key={String(values.side)}
      side={values.side as 'right' | 'left' | 'bottom'}
      title={String(values.title) || 'Drawer'}
    />
  ),
};
