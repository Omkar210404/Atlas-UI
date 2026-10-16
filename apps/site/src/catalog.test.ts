import { describe, expect, it } from 'vitest';
import { categories, isCharted, loadDocs } from './catalog';
import { parse, href, parent } from './router';

describe('catalog', () => {
  it('has eight regions with unique slugs', () => {
    expect(categories).toHaveLength(8);
    const slugs = categories.flatMap((c) => c.types.map((t) => t.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  const charted = categories.flatMap((c) =>
    c.types.filter((t) => isCharted(c.slug, t.slug)).map((t) => [c.slug, t] as const),
  );

  it('has at least one charted component', () => {
    expect(charted.length).toBeGreaterThan(0);
  });

  it.each(charted)('%s/%o matches its docs metadata', async (category, type) => {
    const docs = await loadDocs(category, type.slug);
    expect(docs?.meta.slug).toBe(type.slug);
    expect(docs?.meta.name).toBe(type.name);
    expect(docs?.meta.category).toBe(category);
    expect(docs?.meta.summary).toBe(type.summary);
    expect(docs?.presets.length).toBeGreaterThan(0);
  });
});

describe('router', () => {
  it('round-trips every level through href and parse', () => {
    const routes = [
      { level: 'atlas' },
      { level: 'principles' },
      { level: 'region', category: 'navigation' },
      { level: 'type', category: 'navigation', type: 'tab-bar' },
      { level: 'spec', category: 'navigation', type: 'tab-bar' },
    ] as const;
    for (const route of routes) expect(parse(href(route))).toEqual(route);
  });

  it('treats unknown shapes as not found', () => {
    expect(parse('/atlas-ui/a/b/c/d').level).toBe('not-found');
    expect(parse('/atlas-ui/a/b/notspec').level).toBe('not-found');
  });

  it('zooms out one level at a time', () => {
    expect(parent({ level: 'spec', category: 'navigation', type: 'tab-bar' })).toEqual({
      level: 'type',
      category: 'navigation',
      type: 'tab-bar',
    });
    expect(parent({ level: 'region', category: 'navigation' })).toEqual({ level: 'atlas' });
    expect(parent({ level: 'atlas' })).toBeNull();
  });
});
