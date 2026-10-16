/**
 * Measures the built site and library against the budgets in PLAN.md §7 and fails (exit 1)
 * when one is exceeded. Run after `npm run build`. Writes reports/bundle.json.
 *
 * - Initial JS and CSS are read from the built index.html (entry script, modulepreloads and
 *   stylesheets), so they are exactly what the first page load fetches.
 * - Each component is bundled on its own from the library build with esbuild, minified, with
 *   React external, and its CSS counted alongside its JS.
 */
import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('..', import.meta.url));
const siteDist = join(root, 'apps/site/dist');
const libDist = join(root, 'packages/atlas-ui/dist');
const KB = 1024;

interface Result {
  name: string;
  bytes: number;
  limit: number;
  measure: string;
}

const gz = (buffer: Buffer | Uint8Array) => gzipSync(buffer, { level: 9 }).length;
const results: Result[] = [];

// Site: initial page load ------------------------------------------------------------------
const html = readFileSync(join(siteDist, 'index.html'), 'utf8');
const base = '/atlas-ui/';
const local = (url: string) => join(siteDist, url.startsWith(base) ? url.slice(base.length) : url);
const attr = (tag: string, name: string) => new RegExp(`${name}="([^"]+)"`).exec(tag)?.[1];
const tags = html.match(/<(script|link)\b[^>]*>/g) ?? [];

const initialJs = tags
  .filter((t) => (t.startsWith('<script') && attr(t, 'src')) || /rel="modulepreload"/.test(t))
  .map((t) => attr(t, 'src') ?? attr(t, 'href'))
  .filter((u): u is string => Boolean(u));
const initialCss = tags
  .filter((t) => /rel="stylesheet"/.test(t))
  .map((t) => attr(t, 'href'))
  .filter((u): u is string => Boolean(u));
const preloadedFonts = tags
  .filter((t) => /rel="preload"/.test(t) && /as="font"/.test(t))
  .map((t) => attr(t, 'href'))
  .filter((u): u is string => Boolean(u));

results.push({
  name: `Site: initial JS (${initialJs.length} file${initialJs.length === 1 ? '' : 's'})`,
  bytes: initialJs.reduce((sum, u) => sum + gz(readFileSync(local(u))), 0),
  limit: 110 * KB,
  measure: 'gzip',
});
results.push({
  name: 'Site: initial CSS',
  bytes: initialCss.reduce((sum, u) => sum + gz(readFileSync(local(u))), 0),
  limit: 25 * KB,
  measure: 'gzip',
});
results.push({
  name: `Site: preloaded fonts (${preloadedFonts.length} files)`,
  bytes: preloadedFonts.reduce((sum, u) => sum + readFileSync(local(u)).length, 0),
  limit: 90 * KB,
  measure: 'woff2',
});
if (preloadedFonts.length > 2) {
  console.error(`Budget allows 2 preloaded fonts; found ${preloadedFonts.length}.`);
  process.exitCode = 1;
}

// Library: one bundle per component ------------------------------------------------------------
const components = globSync('components/*/*/index.js', { cwd: libDist }).map((f) =>
  f.replace(/\\/g, '/'),
);
for (const entry of components) {
  const [, category, slug] = entry.split('/');
  const out = await build({
    entryPoints: [join(libDist, entry)],
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    outdir: 'out',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    logLevel: 'silent',
  });
  const bytes = out.outputFiles.reduce((sum, file) => sum + gz(file.contents), 0);
  results.push({
    name: `${category}/${slug}: JS + CSS, without React`,
    bytes,
    limit: 6 * KB,
    measure: 'gzip',
  });
}

// Report -----------------------------------------------------------------------------------------
const pad = (s: string, n: number) => s.padEnd(n);
let failed = false;
console.log(`\n${pad('Budget', 56)}${pad('Size', 12)}${pad('Limit', 12)}Result`);
for (const r of results) {
  const ok = r.bytes <= r.limit;
  if (!ok) failed = true;
  console.log(
    `${pad(r.name, 56)}${pad(`${(r.bytes / KB).toFixed(1)} KB`, 12)}${pad(`${r.limit / KB} KB`, 12)}${ok ? 'ok' : 'OVER BUDGET'} (${r.measure})`,
  );
}

const reportFile = join(root, 'reports/bundle.json');
mkdirSync(dirname(reportFile), { recursive: true });
writeFileSync(
  reportFile,
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      results: results.map((r) => ({
        ...r,
        kb: Number((r.bytes / KB).toFixed(2)),
        withinBudget: r.bytes <= r.limit,
      })),
    },
    null,
    2,
  ) + '\n',
);

if (failed || process.exitCode) {
  console.error('\nOne or more budgets were exceeded.');
  process.exit(1);
}
