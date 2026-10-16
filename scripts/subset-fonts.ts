/**
 * Subsets the site's variable fonts to the characters the site uses, keeping every
 * variation axis. All three families are OFL-1.1 without Reserved Font Names, so
 * subsetting without renaming is permitted; their licences ship in THIRD_PARTY_LICENSES.md.
 *
 * Output: apps/site/src/fonts/*.woff2 (committed, so builds do not depend on this script).
 */
import { readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const subsetFont = require('subset-font') as (
  buffer: Buffer,
  text: string,
  options: {
    targetFormat: 'woff2';
    variationAxes?: Record<string, number | { min: number; max: number }>;
  },
) => Promise<Buffer>;

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('');

// Basic Latin plus the typographic marks and key glyphs the site uses. The site copy is
// English, so accented letters are left out to keep the files small.
const text = range(0x20, 0x7e) + '–—‘’“”…•·×−©←↑→↓↵⇧⌘⌥⎋';

const fontsource = (pkg: string, file: string) =>
  require.resolve(`@fontsource-variable/${pkg}/files/${file}`);

const fonts = [
  {
    out: 'bricolage-grotesque.woff2',
    src: fontsource('bricolage-grotesque', 'bricolage-grotesque-latin-standard-normal.woff2'),
    // Width is fixed at 100; weight 400-700 and the full optical-size range are kept.
    axes: { wdth: 100, wght: { min: 400, max: 700 } },
  },
  {
    out: 'newsreader.woff2',
    src: fontsource('newsreader', 'newsreader-latin-opsz-normal.woff2'),
    axes: { wght: { min: 400, max: 600 }, opsz: { min: 12, max: 36 } },
  },
  {
    out: 'newsreader-italic.woff2',
    src: fontsource('newsreader', 'newsreader-latin-opsz-italic.woff2'),
    // Italic is only used for hydrographic labels and headings, so its weight is fixed.
    axes: { wght: 440, opsz: { min: 14, max: 40 } },
  },
  {
    out: 'jetbrains-mono.woff2',
    src: fontsource('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2'),
    axes: { wght: { min: 400, max: 600 } },
  },
];

const outDir = fileURLToPath(new URL('../apps/site/src/fonts/', import.meta.url));
mkdirSync(outDir, { recursive: true });

for (const font of fonts) {
  const input = readFileSync(font.src);
  const output = await subsetFont(input, text, { targetFormat: 'woff2', variationAxes: font.axes });
  writeFileSync(outDir + font.out, output);
  const before = (statSync(font.src).size / 1024).toFixed(1);
  const after = (output.length / 1024).toFixed(1);
  console.log(`${font.out}: ${before} KB -> ${after} KB`);
}
