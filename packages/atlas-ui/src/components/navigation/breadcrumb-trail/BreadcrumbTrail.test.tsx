import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { BreadcrumbTrail, crumbsToHide, type Crumb } from './BreadcrumbTrail';
import { meta } from './docs';

const trail: Crumb[] = [
  { label: 'Atlas', href: '#atlas' },
  { label: 'Navigation', href: '#navigation' },
  { label: 'Command palette', href: '#palette' },
  { label: 'Specification sheet', href: '#spec' },
];

function Example({ width = 900, onNavigate }: { width?: number; onNavigate?: (c: Crumb) => void }) {
  return (
    <div style={{ width }}>
      <BreadcrumbTrail
        items={trail}
        onNavigate={(crumb, event) => {
          event.preventDefault();
          onNavigate?.(crumb);
        }}
      />
      <button type="button">After</button>
    </div>
  );
}

const visibleLinks = () =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>('.atl-crumbs > ol:first-child a')).map(
    (a) => a.textContent,
  );
const more = () => screen.getByRole('button', { name: /hidden level/ });

describe('crumbsToHide', () => {
  it('hides nothing when everything fits', () => {
    expect(crumbsToHide([50, 50, 50], 30, 200)).toBe(0);
  });
  it('hides from the second crumb onward and counts the fold button', () => {
    expect(crumbsToHide([50, 80, 80, 50], 30, 200)).toBe(2);
    expect(crumbsToHide([50, 80, 80, 50], 30, 220)).toBe(1);
  });
  it('never hides the first or last crumb', () => {
    expect(crumbsToHide([200, 200, 200], 30, 10)).toBe(1);
  });
});

describe('Breadcrumb trail', () => {
  it('is a labelled nav with an ordered list and a current page', () => {
    render(<Example />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.querySelector('ol')).toBeTruthy();
    const current = screen.getByRole('link', { name: 'Specification sheet' });
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(visibleLinks()).toEqual([
      'Atlas',
      'Navigation',
      'Command palette',
      'Specification sheet',
    ]);
  });

  it('folds the middle when narrow and unfolds when there is room', async () => {
    const { rerender } = render(<Example width={240} />);
    await vi.waitFor(() => expect(visibleLinks()).toEqual(['Atlas', 'Specification sheet']));
    expect(more().getAttribute('aria-label')).toBe('Show 2 hidden levels');
    rerender(<Example width={900} />);
    await vi.waitFor(() => expect(visibleLinks()).toHaveLength(4));
  });

  it('lists folded levels and navigates from them', async () => {
    const onNavigate = vi.fn();
    render(<Example width={240} onNavigate={onNavigate} />);
    await vi.waitFor(() => expect(more()).toBeTruthy());
    await userEvent.click(more());
    expect(more().getAttribute('aria-expanded')).toBe('true');
    const menu = document.getElementById(more().getAttribute('aria-controls')!)!;
    expect(menu.hidden).toBe(false);
    await userEvent.click(screen.getByRole('link', { name: 'Navigation' }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ href: '#navigation' }));
    expect(menu.hidden).toBe(true);
  });

  it('closes the folded levels on an outside click', async () => {
    render(<Example width={240} />);
    await vi.waitFor(() => expect(more()).toBeTruthy());
    await userEvent.click(more());
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(more().getAttribute('aria-expanded')).toBe('false');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      Tab: async () => {
        render(<Example width={240} />);
        await vi.waitFor(() => expect(more()).toBeTruthy());
        screen.getByRole('link', { name: 'Atlas' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(more());
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(
          screen.getByRole('link', { name: 'Specification sheet' }),
        );
      },
      Enter: async () => {
        const onNavigate = vi.fn();
        render(<Example width={240} onNavigate={onNavigate} />);
        await vi.waitFor(() => expect(more()).toBeTruthy());
        more().focus();
        await userEvent.keyboard('{Enter}');
        expect(more().getAttribute('aria-expanded')).toBe('true');
        screen.getByRole('link', { name: 'Command palette' }).focus();
        await userEvent.keyboard('{Enter}');
        expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ href: '#palette' }));
      },
      Escape: async () => {
        render(<Example width={240} />);
        await vi.waitFor(() => expect(more()).toBeTruthy());
        more().focus();
        await userEvent.keyboard('{Enter}');
        screen.getByRole('link', { name: 'Navigation' }).focus();
        await userEvent.keyboard('{Escape}');
        expect(more().getAttribute('aria-expanded')).toBe('false');
        expect(document.activeElement).toBe(more());
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
