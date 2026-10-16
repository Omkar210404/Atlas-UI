/**
 * Measures the built site against PLAN.md §7 and writes reports/perf.json and reports/perf.md.
 * Run with the preview server up (`npm run preview`): node --experimental-strip-types scripts/measure.ts
 *
 * - Lighthouse 13, mobile preset (simulated throttling), median of 3 runs per page.
 * - Lab INP / CLS / LCP with web-vitals inside Playwright Chromium across scripted interactions.
 * - Frame timing (requestAnimationFrame deltas) during the atlas → region zoom and a chart drag,
 *   unthrottled and with 4× CPU throttling via the Chrome DevTools Protocol.
 * Numbers depend on the machine; the report records which one.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, totalmem } from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const base = 'http://localhost:4173/atlas-ui/';
const pages = [
  { name: 'Atlas (Spatial)', path: '' },
  { name: 'Spec sheet: Command palette', path: 'navigation/command-palette/spec' },
  { name: 'Atlas (Simple view)', path: '?view=simple' },
];

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
};
const percentile = (values: number[], p: number) => {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]!;
};

// Lighthouse -------------------------------------------------------------------------------------
const chromePath = chromium.executablePath();
const lighthouseResults: Array<Record<string, number | string>> = [];
for (const entry of pages) {
  const runs: Array<Record<string, number>> = [];
  for (let i = 0; i < 3; i++) {
    const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
    try {
      const url = base + entry.path;
      const result = await lighthouse(url, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility'],
      });
      const lhr = result!.lhr;
      runs.push({
        performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
        lcp: lhr.audits['largest-contentful-paint']?.numericValue ?? NaN,
        cls: lhr.audits['cumulative-layout-shift']?.numericValue ?? NaN,
        tbt: lhr.audits['total-blocking-time']?.numericValue ?? NaN,
        fcp: lhr.audits['first-contentful-paint']?.numericValue ?? NaN,
      });
    } finally {
      await chrome.kill();
    }
  }
  const pick = (key: string) => median(runs.map((r) => r[key]!));
  lighthouseResults.push({
    page: entry.name,
    performance: pick('performance'),
    accessibility: pick('accessibility'),
    lcpMs: Math.round(pick('lcp')),
    fcpMs: Math.round(pick('fcp')),
    cls: Number(pick('cls').toFixed(3)),
    tbtMs: Math.round(pick('tbt')),
  });
  console.log('lighthouse', entry.name, lighthouseResults.at(-1));
}

// Playwright: web-vitals and frame timing ---------------------------------------------------------
const browser = await chromium.launch();
const webVitals = readFileSync(require.resolve('web-vitals/dist/web-vitals.iife.js'), 'utf8');

async function freshPage(view: 'spatial' | 'simple' = 'spatial'): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript((v) => {
    localStorage.setItem('atlas-ui:prefs', JSON.stringify({ theme: 'night', view: v, motion: 'system' }));
    sessionStorage.setItem('atlas-ui:unfolded', '1');
  }, view);
  await context.addInitScript(webVitals);
  await context.addInitScript(() => {
    const w = window as unknown as { __vitals: Record<string, number>; webVitals: Record<string, (cb: (m: { name: string; value: number }) => void, o?: object) => void> };
    w.__vitals = {};
    const record = (m: { name: string; value: number }) => (w.__vitals[m.name] = m.value);
    addEventListener('DOMContentLoaded', () => {
      w.webVitals.onINP!(record, { reportAllChanges: true });
      w.webVitals.onCLS!(record, { reportAllChanges: true });
      w.webVitals.onLCP!(record, { reportAllChanges: true });
    });
  });
  return context.newPage();
}

const page = await freshPage();
await page.goto(base);
await page.waitForTimeout(1500);
// Scripted interactions: open and use the palette, zoom into a region, change theme.
await page.getByRole('button', { name: 'Search' }).click();
await page.keyboard.type('tab bar');
await page.keyboard.press('Escape');
await page.keyboard.press('Escape');
await page.getByRole('link', { name: /^Navigation:/ }).click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Dark theme' }).click();
await page.getByRole('link', { name: 'Command palette', exact: true }).click();
await page.waitForTimeout(800);
await page.getByRole('link', { name: 'Open the spec sheet' }).click();
await page.waitForTimeout(800);
await page.getByRole('tab', { name: 'Source', exact: true }).click();
await page.waitForTimeout(500);
// Visibility change finalises INP and CLS reporting.
await page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
});
await page.waitForTimeout(300);
const vitals = (await page.evaluate(() => (window as unknown as { __vitals: Record<string, number> }).__vitals)) as Record<string, number>;
await page.context().close();
console.log('web-vitals', vitals);

async function frameTiming(throttle: number) {
  const p = await freshPage();
  const cdp = await p.context().newCDPSession(p);
  await p.goto(base);
  await p.waitForTimeout(2500); // let the ambient field load and settle
  if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  const record = () =>
    p.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __stop: boolean };
      w.__frames = [];
      w.__stop = false;
      let last = performance.now();
      const tick = (now: number) => {
        w.__frames.push(now - last);
        last = now;
        if (!w.__stop) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  const collect = () =>
    p.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __stop: boolean };
      w.__stop = true;
      return w.__frames.slice(1);
    });

  await record();
  await p.getByRole('link', { name: /^Navigation:/ }).click();
  await p.waitForTimeout(900);
  const zoom = await collect();

  await p.goto(base);
  await p.waitForTimeout(1500);
  await record();
  await p.mouse.move(700, 450);
  await p.mouse.down();
  for (let i = 0; i < 60; i++) await p.mouse.move(700 - i * 6, 450 - i * 2);
  await p.mouse.up();
  await p.waitForTimeout(600);
  const drag = await collect();
  await p.context().close();

  const summarise = (frames: number[]) => ({
    frames: frames.length,
    p50Ms: Number(percentile(frames, 50).toFixed(1)),
    p95Ms: Number(percentile(frames, 95).toFixed(1)),
    over25MsPct: Number(((frames.filter((f) => f > 25).length / Math.max(frames.length, 1)) * 100).toFixed(1)),
  });
  return { throttle, zoom: summarise(zoom), drag: summarise(drag) };
}

const frames = [await frameTiming(1), await frameTiming(4)];
console.log('frames', JSON.stringify(frames));

// Is the 3D chunk ever requested in Simple view?
const simple = await freshPage('simple');
const requested: string[] = [];
simple.on('request', (r) => requested.push(r.url()));
await simple.goto(base);
await simple.waitForTimeout(4000);
const threeInSimple = requested.filter((u) => /three\./.test(u));
await simple.context().close();
await browser.close();

const bundle = JSON.parse(readFileSync(`${root}reports/bundle.json`, 'utf8')) as {
  results: Array<{ name: string; kb: number; limit: number; withinBudget: boolean }>;
};

const machine = {
  cpu: cpus()[0]?.model.trim(),
  cores: cpus().length,
  memoryGb: Number((totalmem() / 1024 ** 3).toFixed(1)),
  os: `${process.platform} ${process.arch}`,
  node: process.version,
  browser: `Playwright Chromium ${browser.version()}`,
};

const report = { measuredAt: new Date().toISOString(), machine, lighthouse: lighthouseResults, webVitals: vitals, frames, threeInSimple };
mkdirSync(`${root}reports`, { recursive: true });
writeFileSync(`${root}reports/perf.json`, JSON.stringify(report, null, 2) + '\n');

const ok = (pass: boolean) => (pass ? 'within budget' : '**missed**');
const md = [
  '# Performance report',
  '',
  `Measured ${report.measuredAt.slice(0, 10)} against the production build served by \`vite preview\` on localhost.`,
  `Machine: ${machine.cpu} (${machine.cores} threads), ${machine.memoryGb} GB RAM, ${machine.os}; ${machine.browser}.`,
  'Lab numbers, not field data. Lighthouse uses its mobile preset with simulated throttling; values are medians of 3 runs.',
  '',
  '## Lighthouse',
  '',
  '| Page | Performance | Accessibility | LCP | FCP | CLS | TBT |',
  '|---|---|---|---|---|---|---|',
  ...lighthouseResults.map(
    (r) => `| ${r.page} | ${r.performance} | ${r.accessibility} | ${r.lcpMs} ms | ${r.fcpMs} ms | ${r.cls} | ${r.tbtMs} ms |`,
  ),
  '',
  `Budgets: LCP ≤ 2000 ms (${ok(lighthouseResults.every((r) => Number(r.lcpMs) <= 2000))}), CLS ≤ 0.05 (${ok(lighthouseResults.every((r) => Number(r.cls) <= 0.05))}), TBT ≤ 150 ms (${ok(lighthouseResults.every((r) => Number(r.tbtMs) <= 150))}), Accessibility 100 (${ok(lighthouseResults.every((r) => Number(r.accessibility) === 100))}).`,
  '',
  '## Interaction (web-vitals in Playwright Chromium, unthrottled desktop)',
  '',
  'Scripted: open the palette and type, close it, zoom into a region, switch theme, open a type page and a spec sheet, switch tabs.',
  '',
  `- INP: ${vitals.INP !== undefined ? `${Math.round(vitals.INP)} ms` : 'not reported'} (budget ≤ 200 ms: ${ok((vitals.INP ?? Infinity) <= 200)})`,
  `- CLS: ${vitals.CLS !== undefined ? vitals.CLS.toFixed(3) : 'not reported'}`,
  `- LCP: ${vitals.LCP !== undefined ? `${Math.round(vitals.LCP)} ms` : 'not reported'}`,
  '',
  '## Frame timing',
  '',
  'requestAnimationFrame intervals while the camera zooms from the atlas into a region, and while the chart is dragged, with the ambient WebGL field running behind it.',
  '',
  '| CPU | Interaction | Frames | p50 | p95 | Frames over 25 ms |',
  '|---|---|---|---|---|---|',
  ...frames.flatMap((f) => [
    `| ${f.throttle === 1 ? 'unthrottled' : `${f.throttle}× slower`} | zoom | ${f.zoom.frames} | ${f.zoom.p50Ms} ms | ${f.zoom.p95Ms} ms | ${f.zoom.over25MsPct}% |`,
    `| ${f.throttle === 1 ? 'unthrottled' : `${f.throttle}× slower`} | drag | ${f.drag.frames} | ${f.drag.p50Ms} ms | ${f.drag.p95Ms} ms | ${f.drag.over25MsPct}% |`,
  ]),
  '',
  `60 fps budget (p95 ≤ 16.7 ms, unthrottled): zoom ${ok(frames[0]!.zoom.p95Ms <= 16.7)}, drag ${ok(frames[0]!.drag.p95Ms <= 16.7)}. Headless Chromium paces frames to the display rate it emulates, so p50 near 16.7 ms means frames arrive on time; the throttled rows show headroom, and have no budget.`,
  '',
  '## Bundles',
  '',
  '| Budget | Size | Limit | Result |',
  '|---|---|---|---|',
  ...bundle.results.map((r) => `| ${r.name} | ${r.kb} KB | ${r.limit / 1024} KB | ${ok(r.withinBudget)} |`),
  '',
  `three.js requested in Simple view: ${threeInSimple.length === 0 ? 'no' : `yes (${threeInSimple.join(', ')})`}.`,
  '',
].join('\n');
writeFileSync(`${root}reports/perf.md`, md);
console.log('wrote reports/perf.md');
