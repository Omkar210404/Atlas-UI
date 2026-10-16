import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { AmbientBackground } from '../ambient-background/AmbientBackground';
import { DepthLayersCard } from '../depth-layers-card/DepthLayersCard';
import { meta as depthMeta } from '../depth-layers-card/docs';
import { flowAngle, ParticleField } from '../particle-field/ParticleField';
import { Carousel3D } from './Carousel3D';
import { meta } from './docs';

const slides = ['Falmouth', 'Fowey', 'Plymouth', 'Salcombe'].map((name) => ({
  id: name,
  label: name,
  content: <a href={`#${name}`}>Read {name}</a>,
}));

// Inert slides leave the accessibility tree, so find slides by position instead.
const slide = (n: number) => document.querySelectorAll<HTMLElement>('.atl-carousel__slide')[n - 1]!;

describe('3D carousel', () => {
  it('is a labelled carousel whose inactive slides cannot be reached', () => {
    render(<Carousel3D label="Harbour guides" slides={slides} />);
    expect(
      screen.getByRole('region', { name: 'Harbour guides' }).getAttribute('aria-roledescription'),
    ).toBe('carousel');
    expect(slide(1).getAttribute('aria-roledescription')).toBe('slide');
    expect(slide(1).hasAttribute('inert')).toBe(false);
    expect(slide(2).hasAttribute('inert')).toBe(true);
    expect(screen.queryByRole('link', { name: 'Read Fowey' })).toBeNull();
  });

  it('takes the short way round to a picked slide', async () => {
    render(<Carousel3D label="Guides" slides={slides} />);
    await userEvent.click(screen.getByRole('button', { name: 'Salcombe' }));
    const ring = document.querySelector('.atl-carousel') as HTMLElement;
    expect(ring.style.getPropertyValue('--atl-turn')).toBe('-1');
    expect(screen.getByRole('button', { name: 'Salcombe' }).getAttribute('aria-current')).toBe(
      'true',
    );
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      ArrowRight: async () => {
        render(<Carousel3D label="Guides" slides={slides} />);
        screen.getByRole('button', { name: 'Next slide' }).focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(slide(2).hasAttribute('inert')).toBe(false);
      },
      ArrowLeft: async () => {
        render(<Carousel3D label="Guides" slides={slides} />);
        screen.getByRole('button', { name: 'Next slide' }).focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(slide(4).hasAttribute('inert')).toBe(false);
      },
      Tab: async () => {
        render(<Carousel3D label="Guides" slides={slides} />);
        screen.getByRole('button', { name: 'Next slide' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Read Falmouth' }));
      },
      'Enter / Space': async () => {
        render(<Carousel3D label="Guides" slides={slides} />);
        screen.getByRole('button', { name: 'Next slide' }).focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(slide(3).hasAttribute('inert')).toBe(false);
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Depth-layers card', () => {
  it('hides the picture from assistive technology and keeps content usable', () => {
    render(
      <DepthLayersCard layers={[{ id: 'a', content: <div /> }]}>
        <button type="button">Open chart</button>
      </DepthLayersCard>,
    );
    expect(document.querySelector('.atl-depth__stage')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Open chart' })).toBeTruthy();
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(depthMeta, {
      Tab: async () => {
        render(
          <DepthLayersCard
            layers={[
              { id: 'a', content: <div /> },
              { id: 'b', content: <div /> },
            ]}
          >
            <button type="button">Open chart</button>
          </DepthLayersCard>,
        );
        await userEvent.keyboard('{Tab}');
        const layer = document.querySelectorAll<HTMLElement>('.atl-depth__layer')[1]!;
        await vi.waitFor(() =>
          expect(getComputedStyle(layer).transform).not.toBe(
            'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1)',
          ),
        );
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});

describe('Ambient background and particle field', () => {
  it('show the still fallback when asked, hidden from assistive technology', () => {
    render(
      <>
        <AmbientBackground renderer="none" />
        <ParticleField renderer="none" />
      </>,
    );
    for (const el of document.querySelectorAll('.atl-ambient, .atl-particles')) {
      expect(el.getAttribute('aria-hidden')).toBe('true');
      expect(el.getAttribute('data-status')).toBe('fallback');
      expect(el.querySelector('canvas')).toBeNull();
    }
  });

  it('start a renderer, or fall back, but never leave a broken state', async () => {
    render(
      <div style={{ position: 'relative', width: 300, height: 200 }}>
        <AmbientBackground className="atl-fill" />
      </div>,
    );
    const el = document.querySelector('.atl-ambient') as HTMLElement;
    await vi.waitFor(() => expect(['running', 'fallback']).toContain(el.dataset.status), {
      timeout: 10000,
    });
    if (el.dataset.status === 'running') {
      expect(['webgpu', 'webgl2']).toContain(el.querySelector('canvas')?.dataset.backend);
    }
  });

  it('flow field is smooth: nearby points drift in nearly the same direction', () => {
    const a = flowAngle(0.3, 0.2, 1);
    const b = flowAngle(0.301, 0.2, 1);
    expect(Math.abs(a - b)).toBeLessThan(0.01);
  });
});
