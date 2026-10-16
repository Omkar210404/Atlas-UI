/**
 * Generates packages/atlas-ui/src/tokens/tokens.css from tokens.ts.
 * `--check` exits non-zero if the committed CSS is out of date (used in CI).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  durations,
  easings,
  fonts,
  leading,
  radius,
  shadows,
  space,
  springs,
  targets,
  themes,
  typeScale,
  type ThemeColours,
  type ThemeName,
} from '../packages/atlas-ui/src/tokens/tokens.ts';
import { sampleSpring, toCssLinear } from '../packages/atlas-ui/src/tokens/spring.ts';

const outFile = fileURLToPath(new URL('../packages/atlas-ui/src/tokens/tokens.css', import.meta.url));

const colourNames: Record<keyof ThemeColours, string> = {
  sea0: '--sea-0',
  sea1: '--sea-1',
  sea2: '--sea-2',
  sea3: '--sea-3',
  shoal: '--shoal',
  reef: '--reef',
  ink: '--ink',
  inkSoft: '--ink-soft',
  edge: '--edge',
  isobath: '--isobath',
  magenta: '--chart-magenta',
  onMagenta: '--on-magenta',
  starboard: '--starboard',
  port: '--port',
  caution: '--caution',
};

const indent = (lines: string[], depth: number) => lines.map((l) => `${'  '.repeat(depth)}${l}`);

function themeBlock(name: ThemeName): string[] {
  const colours = themes[name];
  const [shadow, alpha] = shadows[name];
  return [
    `color-scheme: ${name === 'night' ? 'dark' : 'light'};`,
    ...Object.entries(colours).map(
      ([key, value]) => `${colourNames[key as keyof ThemeColours]}: ${value};`,
    ),
    `--shadow-tint: color-mix(in oklch, ${shadow} ${alpha}%, transparent);`,
  ];
}

const current = sampleSpring(springs.current.stiffness, springs.current.damping);

const shared = [
  `--font-ui: ${fonts.ui};`,
  `--font-prose: ${fonts.prose};`,
  `--font-code: ${fonts.code};`,
  ...Object.entries(typeScale).map(([step, rem]) => `--step-${step}: ${rem}rem;`),
  `--leading-ui: ${leading.ui};`,
  `--leading-prose: ${leading.prose};`,
  `--leading-tight: ${leading.tight};`,
  `--measure: 68ch;`,
  ...Object.entries(space).map(([name, px]) => `--space-${name}: ${px / 16}rem;`),
  `--radius-control: ${radius.control}px;`,
  `--radius-panel: ${radius.panel}px;`,
  `--radius-overlay: ${radius.overlay}px;`,
  `--radius-round: ${radius.round}px;`,
  `--target-min: ${targets.min}px;`,
  `--target-comfort: ${targets.comfort}px;`,
  ...Object.entries(easings).map(([name, b]) => `--ease-${name}: cubic-bezier(${b.join(', ')});`),
  `--ease-current: ${toCssLinear(current.samples)};`,
  ...Object.entries(durations).map(([name, ms]) => `--dur-${name}: ${ms}ms;`),
  `--dur-current: ${current.durationMs}ms;`,
  `--sea: var(--sea-0);`,
  `--magenta-wash: color-mix(in oklch, var(--chart-magenta) 16%, transparent);`,
  `--ink-wash: color-mix(in oklch, var(--ink) 7%, transparent);`,
  `--ink-wash-strong: color-mix(in oklch, var(--ink) 13%, transparent);`,
  `--focus-ring: 2px solid var(--chart-magenta);`,
  `--focus-offset: 2px;`,
  `--elev-gap: var(--sea);`,
  `--elev-1: 0 0 0 1px color-mix(in oklch, var(--isobath) 70%, transparent), 0 0 0 4px var(--elev-gap), 0 0 0 5px color-mix(in oklch, var(--isobath) 30%, transparent);`,
  `--elev-2: 0 0 0 1px var(--edge), 0 0 0 4px var(--elev-gap), 0 0 0 5px color-mix(in oklch, var(--isobath) 45%, transparent);`,
  `--elev-overlay: 0 0 0 1px color-mix(in oklch, var(--edge) 60%, transparent), 0 2px 4px var(--shadow-tint), 0 24px 56px -16px var(--shadow-tint);`,
];

const reducedMotion = [
  ...Object.keys(durations).map((name) => `--dur-${name}: 0ms;`),
  `--dur-current: 0ms;`,
];

const css = [
  '/* Generated from tokens.ts by scripts/build-tokens.ts. Do not edit by hand. */',
  '@layer atlas.tokens, atlas.base, atlas.components, atlas.site;',
  '',
  '@layer atlas.tokens {',
  '  :root {',
  ...indent(shared, 2),
  '  }',
  '',
  "  :root,\n  [data-theme='night'] {",
  ...indent(themeBlock('night'), 2),
  '  }',
  '',
  '  @media (prefers-color-scheme: light) {',
  '    :root:not([data-theme]) {',
  ...indent(themeBlock('day'), 3),
  '    }',
  '  }',
  '',
  "  [data-theme='day'] {",
  ...indent(themeBlock('day'), 2),
  '  }',
  '',
  '  @media (prefers-reduced-motion: reduce) {',
  "    :root:not([data-motion='full']) {",
  ...indent(reducedMotion, 3),
  '    }',
  '  }',
  '',
  "  :root[data-motion='reduce'] {",
  ...indent(reducedMotion, 2),
  '  }',
  '}',
  '',
].join('\n');

if (process.argv.includes('--check')) {
  const existing = readFileSync(outFile, 'utf8').replace(/\r\n/g, '\n');
  if (existing !== css) {
    console.error('tokens.css is out of date. Run `npm run tokens` and commit the result.');
    process.exit(1);
  }
  console.log('tokens.css is up to date.');
} else {
  writeFileSync(outFile, css);
  console.log(`Wrote ${outFile}`);
}
