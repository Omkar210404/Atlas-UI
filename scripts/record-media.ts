/**
 * Captures README media from the running preview site (`npm run preview`):
 *   docs/media/atlas.png, region.png, spec.png, simple.png   real screenshots
 *   docs/media/zoom.gif                                      the zoom navigation, frame by frame
 * The GIF is encoded in Node with gifenc (ffmpeg is not needed).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const { GIFEncoder, quantize, applyPalette } = require('gifenc') as {
  GIFEncoder: () => {
    writeFrame: (
      index: Uint8Array,
      w: number,
      h: number,
      opts: { palette: number[][]; delay: number },
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  };
  quantize: (rgba: Uint8Array, colours: number) => number[][];
  applyPalette: (rgba: Uint8Array, palette: number[][]) => Uint8Array;
};
const { PNG } = require('pngjs') as {
  PNG: { sync: { read: (b: Buffer) => { width: number; height: number; data: Buffer } } };
};

const out = fileURLToPath(new URL('../docs/media/', import.meta.url));
mkdirSync(out, { recursive: true });
const base = 'http://localhost:4173/atlas-ui/';
const browser = await chromium.launch();

async function open(
  path: string,
  view: 'spatial' | 'simple' = 'spatial',
  size = { width: 1440, height: 900 },
) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
  await context.addInitScript((v) => {
    localStorage.setItem(
      'atlas-ui:prefs',
      JSON.stringify({ theme: 'night', view: v, motion: 'system' }),
    );
    sessionStorage.setItem('atlas-ui:unfolded', '1');
  }, view);
  const page = await context.newPage();
  await page.goto(base + path);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  return page;
}

for (const [name, path, view] of [
  ['atlas', '', 'spatial'],
  ['region', 'navigation', 'spatial'],
  ['spec', 'inputs/range-slider/spec', 'spatial'],
  ['simple', '', 'simple'],
] as const) {
  const page = await open(path, view);
  await page.screenshot({ path: `${out}${name}.png` });
  await page.context().close();
  console.log('wrote', name);
}

// The GIF: atlas → zoom into Navigation → open the command palette type page → back out.
// Frames come from Chrome's screencast (one per repaint, with timestamps), so the camera
// moves at its real speed; they are thinned to about 15 fps and encoded afterwards.
const width = 960;
const height = 600;
const page: Page = await open('', 'spatial', { width, height });
const cdp = await page.context().newCDPSession(page);
const captured: Array<{ png: Buffer; t: number }> = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  captured.push({ png: Buffer.from(data, 'base64'), t: metadata.timestamp ?? Date.now() / 1000 });
  void cdp.send('Page.screencastFrameAck', { sessionId });
});
await cdp.send('Page.startScreencast', { format: 'png', maxWidth: width, maxHeight: height });

await page.waitForTimeout(1200);
await page.mouse.move(640, 190);
await page.waitForTimeout(600);
await page.getByRole('link', { name: /^Navigation:/ }).click();
await page.waitForTimeout(2200);
await page.getByRole('link', { name: 'Command palette', exact: true }).click();
await page.waitForTimeout(2400);
await page.keyboard.press('Escape');
await page.waitForTimeout(1600);
await page.keyboard.press('Escape');
await page.waitForTimeout(2000);
await cdp.send('Page.stopScreencast');

const kept = captured.filter((frame, i) => i === 0 || frame.t - captured[i - 1]!.t > 0);
const thinned: typeof kept = [];
for (const frame of kept) {
  const last = thinned.at(-1);
  if (!last || frame.t - last.t >= 1 / 15) thinned.push(frame);
}
const gif = GIFEncoder();
thinned.forEach((frame, i) => {
  const next = thinned[i + 1];
  const delay = next ? Math.round((next.t - frame.t) * 1000) : 1500;
  const png = PNG.sync.read(frame.png);
  const rgba = new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.length);
  const palette = quantize(rgba, 128);
  gif.writeFrame(applyPalette(rgba, palette), png.width, png.height, { palette, delay });
});
gif.finish();
writeFileSync(`${out}zoom.gif`, gif.bytes());
console.log(`wrote zoom.gif (${thinned.length} frames from ${captured.length} captured)`);
await browser.close();
