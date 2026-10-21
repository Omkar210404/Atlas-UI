/**
 * Builds the copy-paste registry from component metadata and source files:
 *   registry/registry.json         index of every item
 *   registry/r/<name>.json         one item: files with contents, npm and registry dependencies
 * Format "atlas-registry/1" is described by registry/schema.json and is meant for a future
 * `npx atlas-ui add <component>` (not built in v1).
 *
 * `--check` exits non-zero if the committed registry is out of date.
 */
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

interface Meta {
  slug: string;
  name: string;
  category: string;
  summary: string;
  files: readonly string[];
  dependencies: Readonly<Record<string, string>>;
  registryDependencies: readonly string[];
  keyboard: readonly { keys: readonly string[]; action: string }[];
  accessibility: readonly string[];
  reducedMotion: string;
}

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'packages/atlas-ui/src');
const outDir = join(root, 'registry');
const check = process.argv.includes('--check');
const pkg = JSON.parse(readFileSync(join(root, 'packages/atlas-ui/package.json'), 'utf8')) as {
  version: string;
};

// Bundle every docs module once, with React and three left external and CSS ignored, then
// import it to read `meta`. Presets are never rendered here.
const docsFiles = globSync('components/*/*/docs.tsx', { cwd: src })
  .map((f) => f.replace(/\\/g, '/'))
  .sort();
const tmp = join(root, 'node_modules/.cache/atlas-registry');
rmSync(tmp, { recursive: true, force: true });
await build({
  entryPoints: docsFiles.map((f) => join(src, f)),
  outdir: tmp,
  outbase: src,
  bundle: true,
  format: 'esm',
  platform: 'node',
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'motion',
    'motion/react',
    'three',
    'three/*',
  ],
  logLevel: 'silent',
});

const metas: Meta[] = [];
for (const file of docsFiles) {
  const mod = (await import(pathToFileURL(join(tmp, file.replace(/\.tsx$/, '.js'))).href)) as {
    meta: Meta;
  };
  metas.push(mod.meta);
}

const read = (path: string) => readFileSync(join(src, path), 'utf8').replace(/\r\n/g, '\n');
const kindOf = (path: string) =>
  path.endsWith('.css') ? 'style' : path.endsWith('index.ts') ? 'index' : 'source';

interface Item {
  $schema: string;
  format: 'atlas-registry/1';
  name: string;
  type: 'component' | 'primitive' | 'icon' | 'tokens';
  title: string;
  description?: string;
  category?: string;
  files: Array<{ path: string; kind: string; content: string }>;
  dependencies: Record<string, string>;
  registryDependencies: string[];
  accessibility?: { keyboard: Meta['keyboard']; notes: readonly string[]; reducedMotion: string };
  license: 'MIT';
}

const items = new Map<string, Item>();

for (const meta of metas) {
  const name = `${meta.category}/${meta.slug}`;
  items.set(name, {
    $schema: '../schema.json',
    format: 'atlas-registry/1',
    name,
    type: 'component',
    title: meta.name,
    description: meta.summary,
    category: meta.category,
    files: meta.files.map((f) => {
      const path = `components/${name}/${f}`;
      return { path, kind: kindOf(f), content: read(path) };
    }),
    dependencies: { ...meta.dependencies },
    registryDependencies: [...meta.registryDependencies],
    accessibility: {
      keyboard: meta.keyboard,
      notes: meta.accessibility,
      reducedMotion: meta.reducedMotion,
    },
    license: 'MIT',
  });
}

// Shared files referenced by components: primitives, icons and the token stylesheet.
const shared = new Set(metas.flatMap((m) => m.registryDependencies).filter((d) => !items.has(d)));
const queue = [...shared];
while (queue.length) {
  const name = queue.shift()!;
  if (items.has(name)) continue;
  if (name === 'tokens') {
    items.set(name, {
      $schema: '../schema.json',
      format: 'atlas-registry/1',
      name,
      type: 'tokens',
      title: 'Design tokens',
      files: [
        { path: 'tokens/tokens.css', kind: 'style', content: read('tokens/tokens.css') },
        { path: 'styles/base.css', kind: 'style', content: read('styles/base.css') },
      ],
      dependencies: {},
      registryDependencies: [],
      license: 'MIT',
    });
    continue;
  }
  const [group, base] = name.split('/') as [string, string];
  const candidates = [`${group}/${base}.ts`, `${group}/${base}.tsx`];
  const path = candidates.find((p) => existsSync(join(src, p)));
  if (!path) throw new Error(`Registry dependency "${name}" does not match a file in ${group}/.`);
  const content = read(path);
  const files = [{ path, kind: 'source', content }];
  const css = `${group}/${base}.css`;
  if (existsSync(join(src, css))) files.push({ path: css, kind: 'style', content: read(css) });
  // Follow relative imports to other shared files, so an item is complete on its own.
  const deps = [...content.matchAll(/from '\.\.?\/(?:\.\.\/)?([\w-]+\/)?([\w-]+)'/g)]
    .map((m) => (m[1] ? `${m[1].slice(0, -1)}/${m[2]}` : `${group}/${m[2]}`))
    .filter((d) => d !== name && !d.endsWith('.css'));
  for (const d of deps) if (!items.has(d)) queue.push(d);
  items.set(name, {
    $schema: '../schema.json',
    format: 'atlas-registry/1',
    name,
    type: group === 'icons' ? 'icon' : 'primitive',
    title: base,
    files,
    dependencies: { react: '>=19' },
    registryDependencies: deps,
    license: 'MIT',
  });
}

const sorted = [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
const index = {
  $schema: './schema.json',
  format: 'atlas-registry/1',
  name: 'atlas-ui',
  version: pkg.version,
  homepage: 'https://github.com/Omkar210404/atlas-ui',
  items: sorted.map(({ name, type, title, description, category }) => ({
    name,
    type,
    title,
    ...(description ? { description } : {}),
    ...(category ? { category } : {}),
    url: `r/${name.replace('/', '-')}.json`,
  })),
};

const outputs = new Map<string, string>();
outputs.set('registry.json', JSON.stringify(index, null, 2) + '\n');
for (const item of sorted)
  outputs.set(`r/${item.name.replace('/', '-')}.json`, JSON.stringify(item, null, 2) + '\n');

if (check) {
  const stale = [...outputs].filter(([file, text]) => {
    const path = join(outDir, file);
    return !existsSync(path) || readFileSync(path, 'utf8').replace(/\r\n/g, '\n') !== text;
  });
  if (stale.length) {
    console.error(
      `Registry is out of date (${stale.length} files). Run \`npm run registry\` and commit.`,
    );
    process.exit(1);
  }
  console.log(`Registry is up to date: ${sorted.length} items.`);
} else {
  rmSync(join(outDir, 'r'), { recursive: true, force: true });
  for (const [file, text] of outputs) {
    const path = join(outDir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }
  console.log(`Wrote ${sorted.length} registry items (${metas.length} components).`);
}
