import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { EmptyState } from '../empty-states/EmptyState';
import { illustrations } from '../empty-states/illustrations';
import { ProgressRing } from '../progress-ring/ProgressRing';
import { Skeleton, SkeletonGroup } from '../skeleton/Skeleton';
import { meta } from './docs';
import { ToastProvider, useToast, type ToastOptions } from './ToastStack';

function Trigger(options: ToastOptions) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(options)}>
      Notify
    </button>
  );
}

const notify = () => userEvent.click(screen.getByRole('button', { name: 'Notify' }));
const toasts = () => Array.from(document.querySelectorAll('.atl-toast'));

describe('Toast stack', () => {
  it('announces new toasts and lists them in a labelled region', async () => {
    render(
      <ToastProvider>
        <Trigger title="Copied" description="TabBar.tsx" />
      </ToastProvider>,
    );
    await notify();
    expect(screen.getByRole('region', { name: 'Notifications' }).textContent).toContain('Copied');
    await vi.waitFor(() =>
      expect(document.querySelector('[data-atlas-announcer="polite"]')?.textContent).toBe(
        'Copied. TabBar.tsx',
      ),
    );
  });

  it('announces errors assertively', async () => {
    render(
      <ToastProvider>
        <Trigger title="Sync failed" tone="error" />
      </ToastProvider>,
    );
    await notify();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-atlas-announcer="assertive"]')?.textContent).toBe(
        'Sync failed',
      ),
    );
  });

  it('dismisses itself after its duration, but not while hovered', async () => {
    render(
      <ToastProvider>
        <Trigger title="Saved" duration={300} />
      </ToastProvider>,
    );
    await notify();
    await userEvent.hover(toasts()[0]!, { force: true });
    await new Promise((r) => setTimeout(r, 450));
    expect(toasts()).toHaveLength(1);
    await userEvent.hover(screen.getByRole('button', { name: 'Notify' }));
    await vi.waitFor(() => expect(toasts()).toHaveLength(0), { timeout: 1500 });
  });

  it('closes from its named close button and runs actions', async () => {
    const onAction = vi.fn();
    render(
      <ToastProvider>
        <Trigger title="Route deleted" duration={0} action={{ label: 'Undo', onAction }} />
      </ToastProvider>,
    );
    await notify();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(toasts()).toHaveLength(0);
    await notify();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss: Route deleted' }));
    expect(toasts()).toHaveLength(0);
  });

  it('keeps at most `max` toasts', async () => {
    render(
      <ToastProvider max={2}>
        <Trigger title="One of many" duration={0} />
      </ToastProvider>,
    );
    await notify();
    await notify();
    await notify();
    expect(toasts()).toHaveLength(2);
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      F8: async () => {
        render(
          <ToastProvider>
            <Trigger title="Saved" duration={0} />
          </ToastProvider>,
        );
        await notify();
        await userEvent.keyboard('{F8}');
        expect(document.activeElement).toBe(toasts()[0]);
      },
      Tab: async () => {
        render(
          <ToastProvider>
            <Trigger title="Saved" duration={0} />
          </ToastProvider>,
        );
        await notify();
        await userEvent.keyboard('{F8}{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dismiss: Saved' }));
        expect(screen.getByRole('region').hasAttribute('data-expanded')).toBe(true);
      },
      'Enter / Space': async () => {
        render(
          <ToastProvider>
            <Trigger title="Saved" duration={0} />
          </ToastProvider>,
        );
        await notify();
        screen.getByRole('button', { name: 'Dismiss: Saved' }).focus();
        await userEvent.keyboard('{Enter}');
        expect(toasts()).toHaveLength(0);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Skeleton', () => {
  it('marks the group busy with a status while loading, then shows content', () => {
    const { rerender } = render(
      <SkeletonGroup loading label="Loading harbour details" placeholder={<Skeleton lines={3} />}>
        <p>Fowey</p>
      </SkeletonGroup>,
    );
    const group = document.querySelector('.atl-skeleton-group')!;
    expect(group.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status').textContent).toBe('Loading harbour details');
    expect(document.querySelectorAll('.atl-skeleton')).toHaveLength(3);
    rerender(
      <SkeletonGroup loading={false} label="Loading harbour details" placeholder={<Skeleton />}>
        <p>Fowey</p>
      </SkeletonGroup>,
    );
    expect(group.getAttribute('aria-busy')).toBe('false');
    expect(screen.getByText('Fowey')).toBeTruthy();
  });
});

describe('Progress ring', () => {
  it('exposes value, range and value text when determinate', () => {
    render(<ProgressRing label="Downloading charts" value={3} max={8} valueText="3 of 8 charts" />);
    const ring = screen.getByRole('progressbar', { name: 'Downloading charts' });
    expect(ring.getAttribute('aria-valuenow')).toBe('3');
    expect(ring.getAttribute('aria-valuemax')).toBe('8');
    expect(ring.getAttribute('aria-valuetext')).toBe('3 of 8 charts');
  });

  it('leaves the value out when indeterminate', () => {
    render(<ProgressRing label="Connecting" />);
    const ring = screen.getByRole('progressbar', { name: 'Connecting' });
    expect(ring.hasAttribute('aria-valuenow')).toBe(false);
    expect(ring.hasAttribute('data-indeterminate')).toBe(true);
  });
});

describe('Empty state', () => {
  it.each(Object.keys(illustrations) as Array<keyof typeof illustrations>)(
    '%s renders a decorative drawing and a heading',
    (name) => {
      render(<EmptyState illustration={name} title={`Empty ${name}`} headingLevel={2} />);
      expect(screen.getByRole('heading', { level: 2, name: `Empty ${name}` })).toBeTruthy();
      expect(document.querySelector('.atl-empty__art')?.getAttribute('aria-hidden')).toBe('true');
    },
  );
});
