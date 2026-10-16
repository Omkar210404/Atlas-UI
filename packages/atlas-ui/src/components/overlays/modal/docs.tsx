import { useState } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { Modal } from './Modal';

export const meta: ComponentMeta = {
  slug: 'modal',
  name: 'Modal',
  category: 'overlays',
  summary: 'A dialog that holds focus until you close it.',
  description: [
    'A dialog for a decision or a short task that needs full attention. The page behind it dims, stops scrolling and cannot be reached until the dialog closes.',
    'It is built on the native `<dialog>` element, which puts it in the top layer and makes the rest of the page inert. atlas-ui adds the parts the element leaves out: Tab wraps inside the dialog, scrolling is locked, and focus goes back to the button that opened it.',
  ],
  usage: [
    'Always pass a `title`; it names the dialog for assistive technology.',
    'Put the actions in `footer`, with the safe choice first and the main action last.',
    'Set `dismissible={false}` only when a choice must be made; then the footer must offer a way out.',
    'Prefer a drawer for longer, browsable content and a popover for small, non-blocking detail.',
  ],
  keyboard: [
    {
      keys: ['Tab', 'Shift+Tab'],
      action: 'Move through the dialog’s controls; wraps from last to first and back.',
    },
    {
      keys: ['Escape'],
      action: 'Close the dialog (when dismissible) and return focus to its trigger.',
    },
  ],
  accessibility: [
    'A native modal `<dialog>` with `aria-modal`, labelled by its title and described by its description.',
    'The rest of the page is inert while it is open; focus cannot leave the dialog with Tab.',
    'Focus moves to the first focusable element on open and returns to the opener on close.',
    'Escape is consumed by the dialog, so it never also triggers shortcuts on the page behind.',
    'The close button has a text name and a 32 px target.',
  ],
  reducedMotion: 'The dialog appears and disappears without rising or fading.',
  props: [
    {
      kind: 'text',
      name: 'title',
      label: 'Title',
      description: 'Names the dialog.',
      default: 'Leave the harbour?',
    },
    {
      kind: 'select',
      name: 'size',
      label: 'Size',
      description: 'Maximum width.',
      default: 'm',
      options: [
        { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' },
        { value: 'l', label: 'Large' },
      ],
    },
    {
      kind: 'boolean',
      name: 'dismissible',
      label: 'Dismissible',
      description: 'Escape, backdrop and close button close it.',
      default: true,
    },
  ],
  files: ['Modal.tsx', 'modal.css', 'index.ts'],
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
  title = 'Leave the harbour?',
  size = 'm',
  dismissible = true,
  trigger = 'Plan departure',
}: {
  title?: string;
  size?: 's' | 'm' | 'l';
  dismissible?: boolean;
  trigger?: string;
}) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState('No decision yet.');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', justifyItems: 'center' }}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <span style={{ color: 'var(--ink-soft)', fontSize: 'var(--step--1)' }} aria-live="polite">
        {outcome}
      </span>
      <Modal
        title={title}
        description="The tide turns in 40 minutes."
        size={size}
        dismissible={dismissible}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button
              onClick={() => {
                setOutcome('Staying in harbour.');
                setOpen(false);
              }}
            >
              Stay moored
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setOutcome('Leaving on the ebb.');
                setOpen(false);
              }}
            >
              Leave now
            </Button>
          </>
        }
      >
        <p>
          Leaving now gives you the ebb past the headland. Waiting means motoring against the flood.
        </p>
      </Modal>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'decision',
      name: 'Decision',
      description: 'Two choices, safe one first.',
      render: () => <Demo />,
    },
    {
      id: 'required',
      name: 'Must choose',
      description: 'Not dismissible: one of the footer buttons must be used.',
      render: () => <Demo dismissible={false} trigger="Confirm the plan" />,
    },
  ],
  Playground: ({ values }) => (
    <Demo
      title={String(values.title) || 'Dialog'}
      size={values.size as 's' | 'm' | 'l'}
      dismissible={Boolean(values.dismissible)}
    />
  ),
};
