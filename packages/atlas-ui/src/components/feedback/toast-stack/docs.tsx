import { useRef, type ReactNode } from 'react';
import type { ComponentDocs, ComponentMeta } from '../../../docs/types';
import { Button } from '../../actions/button/Button';
import { ToastProvider, useToast, type ToastTone } from './ToastStack';

export const meta: ComponentMeta = {
  slug: 'toast-stack',
  name: 'Toast stack',
  category: 'feedback',
  summary: 'Brief messages that stack, pause and dismiss.',
  description: [
    'Short notes that confirm something happened, such as “Copied” or “Saved”. New toasts arrive at the front; older ones fan out behind. Hover or focus the stack and it opens out so every toast is readable, and the timers stop until you leave.',
    'Each toast is announced as it arrives, so it reaches screen-reader users even though focus never moves to it. Swipe a toast to the right, or use its close button, to dismiss it.',
  ],
  usage: [
    'Wrap your app in `ToastProvider` once, then call `toast({ title, description, tone })` from `useToast()`.',
    'Reuse the action’s verb: the Copy button produces a toast that says “Copied”.',
    'Do not put the only copy of important information in a toast; it goes away.',
    'An `action` (such as Undo) closes the toast after it runs. Errors stay for 9 seconds by default; pass `duration: 0` to keep a toast until it is closed.',
    'This site’s “Copied” messages on spec sheets are this component.',
  ],
  keyboard: [
    { keys: ['F8'], action: 'Move focus to the newest notification.' },
    {
      keys: ['Tab'],
      action: 'Move through toasts’ buttons; the stack stays open and paused while focused.',
    },
    { keys: ['Enter', 'Space'], action: 'Use the focused action or close button.' },
  ],
  accessibility: [
    'Toasts are announced through a live region when they arrive: politely, and assertively for errors.',
    'The stack is a labelled `region` landmark (“Notifications”) that F8 jumps to.',
    'Timers pause while the pointer is over the stack or focus is inside it (WCAG 2.2.1), so nothing disappears while you read it.',
    'Every close button names the toast it closes. Swiping is a shortcut, never the only way (WCAG 2.5.7).',
    'Tone is shown with an icon and a coloured edge, not colour alone.',
  ],
  reducedMotion: 'Toasts appear and rearrange without sliding or scaling.',
  props: [
    {
      kind: 'select',
      name: 'tone',
      label: 'Tone',
      description: 'Kind of message.',
      default: 'success',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'success', label: 'Success' },
        { value: 'warning', label: 'Warning' },
        { value: 'error', label: 'Error' },
      ],
    },
    {
      kind: 'text',
      name: 'title',
      label: 'Title',
      description: 'What happened.',
      default: 'Route saved',
    },
    {
      kind: 'boolean',
      name: 'action',
      label: 'Undo action',
      description: 'Add an Undo button.',
      default: false,
    },
  ],
  files: ['ToastStack.tsx', 'toast-stack.css', 'index.ts'],
  dependencies: { react: '>=19' },
  registryDependencies: [
    'actions/button',
    'primitives/announce',
    'icons/alert',
    'icons/bell',
    'icons/check',
    'icons/close',
    'tokens',
  ],
};

const samples: Array<{ title: string; description: string; tone: ToastTone }> = [
  { title: 'Route saved', description: 'Falmouth to Fowey, 22 nautical miles.', tone: 'success' },
  { title: 'Tide table updated', description: 'High water moves to 18:52.', tone: 'info' },
  { title: 'Wind rising', description: 'Force 6 expected after midnight.', tone: 'warning' },
  {
    title: 'Couldn’t sync the logbook',
    description: 'Check your connection and try again.',
    tone: 'error',
  },
];

function Trigger({
  tone,
  title,
  action,
  cycle,
}: {
  tone?: ToastTone;
  title?: string;
  action?: boolean;
  cycle?: boolean;
}) {
  const { toast } = useToast();
  const next = useRef(0);
  return (
    <Button
      variant="primary"
      onClick={() => {
        const sample = cycle ? samples[next.current++ % samples.length]! : samples[0]!;
        toast({
          ...sample,
          tone: tone ?? sample.tone,
          title: title ?? sample.title,
          action: action
            ? { label: 'Undo', onAction: () => toast({ title: 'Undone', tone: 'info' }) }
            : undefined,
        });
      }}
    >
      Show a toast
    </Button>
  );
}

function Stage({ children, name }: { children: ReactNode; name: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '18rem',
        display: 'grid',
        placeItems: 'start center',
      }}
    >
      <ToastProvider placement="contained" label={`Demo notifications, ${name}`}>
        {children}
      </ToastProvider>
    </div>
  );
}

export const docs: ComponentDocs = {
  meta,
  presets: [
    {
      id: 'stack',
      name: 'A stack of four',
      description: 'Each press adds the next kind of message.',
      render: (instance) => (
        <Stage name={['stack', instance].filter(Boolean).join(' ')}>
          <Trigger cycle />
        </Stage>
      ),
    },
    {
      id: 'undo',
      name: 'With an action',
      description: 'An Undo button that closes the toast after it runs.',
      render: (instance) => (
        <Stage name={['undo', instance].filter(Boolean).join(' ')}>
          <Trigger action />
        </Stage>
      ),
    },
  ],
  Playground: ({ values }) => (
    <Stage name="playground">
      <Trigger
        tone={values.tone as ToastTone}
        title={String(values.title) || 'Toast'}
        action={Boolean(values.action)}
      />
    </Stage>
  ),
};
