import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';
import { sampleSpring } from './spring';
import { boundaryPairs, textPairs, themes, type ThemeName } from './tokens';

describe.each(Object.keys(themes) as ThemeName[])('%s theme contrast', (theme) => {
  const colours = themes[theme];

  it.each(textPairs)('text %s on %s reaches 4.5:1', (fg, bg) => {
    expect(contrastRatio(colours[fg], colours[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(boundaryPairs)('boundary %s on %s reaches 3:1', (fg, bg) => {
    expect(contrastRatio(colours[fg], colours[bg])).toBeGreaterThanOrEqual(3);
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });
});

describe('sampleSpring', () => {
  it('starts at 0, ends at 1 and settles in finite time', () => {
    const { samples, durationMs } = sampleSpring(300, 24);
    expect(samples[0]).toBe(0);
    expect(samples.at(-1)).toBe(1);
    expect(durationMs).toBeGreaterThan(100);
    expect(durationMs).toBeLessThan(2000);
  });
});
