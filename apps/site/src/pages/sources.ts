export interface Source {
  code: string;
  html: string;
}

// Each file is highlighted at build time by plugins/highlight.ts and loaded on demand.
const sources = import.meta.glob<Source>(
  [
    '../../../../packages/atlas-ui/src/components/*/*/*.{ts,tsx,css}',
    '!**/*.test.tsx',
    '!**/docs.tsx',
  ],
  { query: '?highlight' },
);

export async function loadSource(category: string, slug: string, file: string): Promise<Source | null> {
  const load = sources[`../../../../packages/atlas-ui/src/components/${category}/${slug}/${file}`];
  if (!load) return null;
  const module = await load();
  return { code: module.code, html: module.html };
}
