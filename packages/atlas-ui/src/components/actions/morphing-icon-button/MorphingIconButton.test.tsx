import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { keyboardCases } from '../../../docs/keyboard-cases';
import { meta } from './docs';
import { glyphAt, glyphPath, glyphs } from './glyphs';
import { MorphingIconButton } from './MorphingIconButton';

const path = () => document.querySelector('.atl-morph__glyph path')!.getAttribute('d');

afterEach(() => {
  delete document.documentElement.dataset.motion;
});

describe('glyphs', () => {
  it.each(Object.entries(glyphs))('%s starts and ends on its two shapes', (_name, glyph) => {
    expect(glyphAt(glyph, 0)).toHaveLength(glyph.from.length);
    expect(glyphPath(glyph, 0)).not.toBe(glyphPath(glyph, 1));
  });

  it('rotates bars instead of shrinking them through the middle', () => {
    const [bar] = glyphAt(glyphs['plus-close'], 0.5);
    const [[x1, y1], [x2, y2]] = bar!;
    expect(Math.hypot(x2 - x1, y2 - y1)).toBeCloseTo(16, 5);
  });
});

describe('Morphing icon button', () => {
  it('is a toggle button whose name stays the same', async () => {
    render(<MorphingIconButton glyph="play-pause" label="Play" />);
    const button = screen.getByRole('button', { name: 'Play' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Play' })).toBe(button);
  });

  it('morphs the icon to the pressed shape', async () => {
    render(<MorphingIconButton glyph="play-pause" label="Play" />);
    expect(path()).toBe(glyphPath(glyphs['play-pause'], 0));
    await userEvent.click(screen.getByRole('button'));
    await vi.waitFor(() => expect(path()).toBe(glyphPath(glyphs['play-pause'], 1)));
  });

  it('switches at once under reduced motion', async () => {
    document.documentElement.dataset.motion = 'reduce';
    render(<MorphingIconButton glyph="menu-close" label="Menu" />);
    await userEvent.click(screen.getByRole('button'));
    expect(path()).toBe(glyphPath(glyphs['menu-close'], 1));
  });

  it('follows a controlled value', async () => {
    const onPressedChange = vi.fn();
    function Controlled() {
      const [on, setOn] = useState(true);
      return (
        <>
          <MorphingIconButton
            glyph="plus-close"
            label="Add"
            pressed={on}
            onPressedChange={(next) => {
              onPressedChange(next);
              setOn(next);
            }}
          />
          <button type="button" onClick={() => setOn(true)}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'Add' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(false);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  describe('keyboard map', () => {
    const cases = keyboardCases(meta, {
      'Enter / Space': async () => {
        render(<MorphingIconButton glyph="play-pause" label="Play" />);
        const button = screen.getByRole('button');
        button.focus();
        await userEvent.keyboard('{Enter}');
        expect(button.getAttribute('aria-pressed')).toBe('true');
        await userEvent.keyboard(' ');
        expect(button.getAttribute('aria-pressed')).toBe('false');
      },
      Tab: async () => {
        render(
          <>
            <MorphingIconButton glyph="play-pause" label="Play" />
            <button type="button">Next</button>
          </>,
        );
        screen.getByRole('button', { name: 'Play' }).focus();
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }));
      },
    });
    it.each(cases)('%s', async (_id, run) => run());
  });
});
