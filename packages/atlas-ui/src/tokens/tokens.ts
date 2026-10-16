/**
 * atlas-ui design tokens: the single source of truth.
 *
 * `scripts/build-tokens.ts` turns this file into `tokens.css` (CSS custom properties).
 * JS that needs a motion value imports it from here, so CSS and JS never disagree.
 * This file must stay dependency-free: it is loaded directly by Node in the build script.
 */

export type ThemeName = 'night' | 'day';

/** Semantic colours per theme. Names follow nautical-chart conventions (see PLAN.md §1). */
export interface ThemeColours {
  /** Page background at the shallowest level (the atlas). */
  sea0: string;
  /** Background one level deeper (a region). */
  sea1: string;
  /** Background at the type level. */
  sea2: string;
  /** Background at the component spec level, the deepest. */
  sea3: string;
  /** Surface level 1: panels, regions. */
  shoal: string;
  /** Surface level 2: raised or active surfaces. */
  reef: string;
  /** Body text. */
  ink: string;
  /** Secondary text. */
  inkSoft: string;
  /** Control boundaries and focus offsets. Must reach 3:1 against every surface. */
  edge: string;
  /** Decorative contour lines. Never used as the only boundary of a control. */
  isobath: string;
  /** Focus, current location and primary actions. Reserved: nothing else uses it. */
  magenta: string;
  /** Text placed on a magenta fill. */
  onMagenta: string;
  /** Success. */
  starboard: string;
  /** Danger. */
  port: string;
  /** Warning. */
  caution: string;
}

export const themes: Record<ThemeName, ThemeColours> = {
  night: {
    sea0: '#0E1E2B',
    sea1: '#0C1A26',
    sea2: '#0A1721',
    sea3: '#09141D',
    shoal: '#15293A',
    reef: '#1D3A4C',
    ink: '#DCE6E4',
    inkSoft: '#9DB4B8',
    edge: '#6F98A4',
    isobath: '#4F7C88',
    magenta: '#E683C6',
    onMagenta: '#0E1E2B',
    starboard: '#74D3A0',
    port: '#F2907F',
    caution: '#E9BD68',
  },
  day: {
    sea0: '#EEF3F1',
    sea1: '#E8F0EF',
    sea2: '#E2ECEC',
    sea3: '#DDE8E9',
    shoal: '#DFEBEC',
    reef: '#CBDFE3',
    ink: '#15283A',
    inkSoft: '#465D6D',
    edge: '#5E7F89',
    isobath: '#7FA0A8',
    magenta: '#A0186C',
    onMagenta: '#FFFFFF',
    starboard: '#1E6A46',
    port: '#A4322A',
    caution: '#765000',
  },
};

/** Overlay shadows are tinted from the theme's deep water, never neutral grey. [colour, opacity %]. */
export const shadows: Record<ThemeName, readonly [string, number]> = {
  night: ['#02080D', 72],
  day: ['#15283A', 22],
};

/** Pairs that carry text and must reach 4.5:1 (WCAG 1.4.3). [foreground, background]. */
export const textPairs: Array<[keyof ThemeColours, keyof ThemeColours]> = [
  ...(['ink', 'inkSoft', 'magenta', 'starboard', 'port', 'caution'] as const).flatMap((fg) =>
    (['sea0', 'sea1', 'sea2', 'sea3', 'shoal', 'reef'] as const).map(
      (bg) => [fg, bg] as [keyof ThemeColours, keyof ThemeColours],
    ),
  ),
  ['onMagenta', 'magenta'],
];

/** Pairs that form control boundaries and must reach 3:1 (WCAG 1.4.11). */
export const boundaryPairs: Array<[keyof ThemeColours, keyof ThemeColours]> = (
  ['sea0', 'sea1', 'sea2', 'sea3', 'shoal', 'reef'] as const
).flatMap((bg) => [
  ['edge', bg] as [keyof ThemeColours, keyof ThemeColours],
  ['magenta', bg] as [keyof ThemeColours, keyof ThemeColours],
]);

export const fonts = {
  ui: "'Bricolage Grotesque', 'Bricolage Fallback', ui-sans-serif, system-ui, sans-serif",
  prose: "'Newsreader', 'Newsreader Fallback', ui-serif, Georgia, serif",
  code: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace",
} as const;

/** Type scale: major third (1.25) from a 17px body. Values in rem (16px root). */
export const typeScale = {
  '-1': 0.85,
  '0': 1.0625,
  '1': 1.328,
  '2': 1.66,
  '3': 2.075,
  '4': 2.594,
  '5': 3.242,
  '6': 4.053,
} as const;

export const leading = { ui: 1.45, prose: 1.6, tight: 1.08 } as const;

/** 4px base. */
export const space = {
  '3xs': 2,
  '2xs': 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
} as const;

/** Radius follows hierarchy, not one value everywhere. */
export const radius = { control: 6, panel: 12, overlay: 16, round: 999 } as const;

export const targets = { min: 24, comfort: 44 } as const;

export const easings = {
  /** Decisive stops: presses, toggles, indicators settling. */
  anchor: [0.2, 0, 0, 1],
  /** Long glides: zooming between levels, panning. */
  drift: [0.22, 0.61, 0.24, 1],
  /** Exits: things leaving accelerate away. */
  ebb: [0.4, 0, 1, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Durations in milliseconds. All of them become 0 under reduced motion. */
export const durations = {
  tick: 90,
  step: 160,
  glide: 280,
  voyage: 560,
} as const;

/** Springs for motion (stiffness, damping, mass 1). */
export const springs = {
  /** Physical follow: magnetic, tilt, dock magnification. */
  buoy: { stiffness: 380, damping: 30 },
  /** Layout changes: expandable card, toast stack. */
  mooring: { stiffness: 220, damping: 26 },
  /** Indicators that follow a selection (tabs, segmented control). Also emitted as a CSS linear() easing. */
  current: { stiffness: 300, damping: 24 },
} as const;
