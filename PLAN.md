# atlas-ui — Plan

> An atlas of interfaces.

A collection of original React UI components, and a showcase site built only from those components. You explore the site like a chart: you zoom from a category region, to a type, to a component.

Status: **approved 2026-10-16.** M1 (foundation, spatial shell, Navigation category) is built and waiting for look-and-feel approval. See §13 for what changed from this plan during M1.

---

## 0. Environment checked (2026-10-16)

| Item | Found | Consequence |
|---|---|---|
| Node / npm | 22.16.0 / 10.9.2 | `react-router@8` (needs ≥22.22) and `jsdom@30` (needs ≥22.22.2) are out. Everything chosen below runs on 22.16. CI runs on Node 24 LTS. |
| Git | 2.49 | `main` branch, initialised. |
| ffmpeg | not installed | The README GIF is built from Playwright frames in Node with `gifenc` (MIT). |
| Machine for fps numbers | Ryzen 5 5600H, 15.3 GB RAM, Radeon iGPU + RTX 3050 Laptop, Windows 11 | Every fps figure will name this machine and the GPU used. |
| frontend-design skill | Not installed as an active skill. Its file in the official plugin cache was read and applied (Section 1.6). | — |

### Versions verified on npm today

| Package | Version | Note |
|---|---|---|
| react, react-dom | 19.3.1 | |
| vite | 8.3.4 | Rolldown-based. |
| @vitejs/plugin-react | 6.1.2 | |
| typescript | **6.0.3** | 7.0.2 (the native port) is latest, but `typescript-eslint@8.71` only supports `<6.1`. I'll pin 6.0.x and revisit later. |
| motion | 14.3.0 | Imported from `motion/react` with `LazyMotion` + `m` to keep it small. |
| three | 0.186.1 | `three/webgpu` (WebGPURenderer, automatic WebGL2 fallback, TSL shaders). Lazy chunk only. |
| vitest | 5.0.5 | Browser mode through `@vitest/browser-playwright`, so tests run in real Chromium (focus, pointer capture and layout are real). This also avoids jsdom. |
| @testing-library/react / user-event | 16.3.3 / 14.6.8 | |
| @playwright/test | 1.64.1 | |
| axe-core / @axe-core/playwright | 4.14.0 | |
| eslint | **9.39.5** | ESLint 10 is out, but `eslint-plugin-jsx-a11y@6.10` doesn't support it yet. I'm keeping the a11y lint rules. |
| typescript-eslint, eslint-plugin-react-hooks | 8.71.2, 7.1.1 | |
| esbuild | 0.28.2 | Per-component bundles for the budget gate (`scripts/check-budgets.ts`). Replaced size-limit during M1, see §13. |
| lighthouse | 13.5.0 | Run from a Node script against `vite preview`. |
| web-vitals | 6.2.3 | Lab INP/CLS/LCP capture inside Playwright. |
| shiki | build-time only | Syntax highlighting happens at build time, so no highlighter ships to the browser. |
| Fonts | @fontsource-variable/bricolage-grotesque, /newsreader, /jetbrains-mono 5.3.0 | All OFL-1.1. |

### Browser support verified

| Feature | Support | How it's used |
|---|---|---|
| Same-document View Transitions | Chrome/Edge 111, Safari 18, Firefox 144 ([Chrome blog](https://developer.chrome.com/blog/view-transitions-in-2025)) | Zoom between levels. Feature-detected. Without it, a `motion` camera tween runs instead. |
| `view-transition-class`, `match-element` | Interop 2025 set; per-engine status not confirmed | Progressive only. Explicit `view-transition-name`s carry the core effect. |
| CSS anchor positioning | Firefox 147 (Jan 2026); Chrome; Safari 26. `position-try` in Firefox unconfirmed | **Not relied on.** Popover/menu/tooltip placement uses my own flip/shift code on top of the Popover API top layer. |
| WebGPU, three.js WebGPURenderer | Renderer falls back to WebGL2 automatically ([three.js manual](https://threejs.org/manual/en/webgpurenderer)) | Background and two 3D components only. Static SVG fallback when neither is available. |
| `@property`, `color-mix()`, `oklch()`, `:has()`, container queries, Popover API, `<dialog>` | Baseline (2023–2024) | Used freely. |
| `animation-timeline: scroll()/view()` | Not in every engine | Progressive. `motion`'s `useScroll` is the fallback. |

---

## 1. Art direction

### 1.1 Concept: the nautical chart

An *atlas* is a cartographic object, so the visual language comes from **nautical and bathymetric charts**, not from software dashboards. Charts have conventions that suit a component atlas well:

- **Depth tints (bathymetry).** Charts shade water darker as it gets deeper. On the site, *zoom level is depth*: the atlas is shallow water, a category is deeper, a component is deepest. The surface tint deepens as you zoom, so you can feel where you are without reading anything.
- **Contour lines (isobaths).** Elevation is drawn with nested contour lines, not drop shadows. Regions are irregular islands traced by contour rings, not rectangles. Raised UI gets a contour edge. Only top-layer overlays get a real shadow.
- **Hydrographic lettering.** Charts name water features in letter-spaced *italic serif*, often set along a curve. Region names on the atlas are set on SVG `textPath` curves that follow each island's shape. **This is the one memorable element.** Everything else stays quiet.
- **Chart magenta.** Charts use magenta for the information that matters most (lights, cautions, routes). Here it marks focus, the current location and primary actions. Nothing else uses it.
- **The inset map and the scale bar.** Charts carry an inset locator map and a scale. The site's mini-map is an inset chart. The scale bar is a *real* indicator: it shows the current zoom level (Atlas · Region · Type · Component).

### 1.2 Colour

Two themes, named after chart modes. Base colours are authored as sRGB hex in `tokens.ts` (so the contrast test can compute exact ratios), and states are derived with `color-mix(in oklch, …)`.

**Night chart (dark).** Designed first.

| Token | Hex | Role |
|---|---|---|
| `--deep` | `#0E1E2B` | Page background: deep water. Saturated navy, not tinted black. |
| `--shoal` | `#15293A` | Surface level 1 (regions, panels). |
| `--reef` | `#1D3A4C` | Surface level 2 (raised, active). |
| `--ink` | `#DCE6E4` | Text. |
| `--ink-soft` | `#9DB4B8` | Secondary text. |
| `--chart-magenta` | `#E683C6` | Focus, current location, primary action. |
| `--isobath` | `#4F7C88` | Contour lines (decorative). |
| `--starboard` / `--port` / `--caution` | `#74D3A0` / `#F2907F` / `#E9BD68` | Success / danger / warning. |

**Day chart (light).**

| Token | Hex | Role |
|---|---|---|
| `--deep` | `#EEF3F1` | Background: cool chart paper, deliberately not cream. |
| `--shoal` | `#DFEBEC` | Surface 1. |
| `--reef` | `#CBDFE3` | Surface 2. |
| `--ink` | `#15283A` | Text: survey-ink navy. |
| `--ink-soft` | `#465D6D` | Secondary text. |
| `--chart-magenta` | `#A0186C` | Focus, location, primary. |
| `--isobath` | `#7FA0A8` | Contour lines (decorative). |
| `--starboard` / `--port` / `--caution` | `#1E6A46` / `#A4322A` / `#765000` | Success / danger / warning. |

**Contrast, computed today (WCAG 2.x ratio).** Every text colour passes AA (≥4.5:1) on every surface in both themes. The weakest pairs are Night magenta on `--reef` at 4.78:1 and Day starboard on `--reef` at 4.74:1. Decorative `--isobath` lines are 3.69:1 (night) and 2.50:1 (day), so they are never used as control boundaries. A separate `--edge` token (≥3:1, WCAG 1.4.11) is used for input borders and focus rings. A unit test computes every text/surface and edge/surface pair from the token source and fails on any regression.

**Default theme.** Night chart on first visit, because you preferred dark-first UIs in earlier projects. The choice is saved, and Day chart is one toggle away. (See Decision 2.)

### 1.3 Type

| Role | Face | Licence | Why |
|---|---|---|---|
| Display and UI | **Bricolage Grotesque** (variable: `wght`, `wdth`, `opsz`) | OFL-1.1 | It has character at display sizes and tightens up at small optical sizes. The width axis gives condensed labels without a second family. |
| Prose and hydrographic labels | **Newsreader** (variable, with italics, `opsz`) | OFL-1.1 | Usage notes and region names along curves, in letter-spaced italic, the way charts name water. |
| Code and key caps only | **JetBrains Mono** (variable) | OFL-1.1 | Lazy-loaded with the first code panel. Never used for data labels. |

- Scale: ratio 1.25 (major third) from a 17px body: 13.6 · 17 · 21.25 · 26.6 · 33.2 · 41.5 · 51.9 · 64.8. The display uses `clamp()` between two steps.
- Body line length is capped at 68ch. Serif prose gets line-height 1.6, sans UI text 1.45.
- No all-caps labels and no eyebrows above headings. A headline never accents just one word.
- Only the `latin` subset is preloaded, and `font-display: swap` uses metric-matched fallbacks (`size-adjust`) to protect CLS.

### 1.4 Grid and spacing

- **Spacing:** 4px base. Steps: 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 (`--space-3xs` … `--space-4xl`).
- **Page grid:** 12 columns, 24px gutters, max 1280px. Doc content sits in columns 2–8, and the live stage takes 9–12 on wide screens.
- **Graticule:** on the spatial atlas, a faint latitude/longitude grid every 96px. It sits on the same grid as the layout, so islands line up with the graticule.
- **Radius follows hierarchy, not one value everywhere:** controls 6px, panels 12px, overlays 16px, chips fully round. Regions are free-form contour shapes with no radius at all.
- **Elevation:** level 0 is flat. Levels 1–2 use a tint step plus a contour edge (one inner 1px `--edge` line plus a second offset hairline). Level 3 (top-layer overlays only) gets a single shadow, tinted with `--deep`, never grey.
- **Components** use container queries, so a component adapts to the space it's given, not to the viewport.

### 1.5 Motion language

Motion only answers something you did, with two exceptions: the ambient background, and one first-visit "chart unfolds" sequence on the atlas. Both pause when hidden, when off-screen, and when motion is reduced.

| Name | Value | Used for |
|---|---|---|
| `--ease-anchor` | `cubic-bezier(.2, 0, 0, 1)` | Decisive stops: presses, toggles, indicators settling. |
| `--ease-drift` | `cubic-bezier(.22, .61, .24, 1)` | Long glides: zooming between levels, panning. |
| `--ease-ebb` | `cubic-bezier(.4, 0, 1, 1)` | Exits: things leaving speed up as they go. |
| `--ease-current` | `linear()` approximation of a light spring | Indicators that follow the pointer (tabs, dock). |
| `--dur-tick` | 90ms | Hover and press feedback. |
| `--dur-step` | 160ms | Small state changes. |
| `--dur-glide` | 280ms | Panels, menus, overlays. |
| `--dur-voyage` | 560ms | Zoom transitions between levels. |
| `spring.buoy` | stiffness 380, damping 30 | Physical follow (magnetic, tilt). |
| `spring.mooring` | stiffness 220, damping 26 | Layout changes (expandable card, toast stack). |

**Reduced motion.** `prefers-reduced-motion: reduce`, or the in-site "Reduce motion" setting, sets every duration token to 0ms or an opacity-only crossfade of `--dur-step`. Springs become instant, and the pointer-driven effects (magnetic, tilt, parallax, particles) turn off. Each component documents exactly what it does instead.

Durations and easings live in one source (`tokens.ts`). That file generates `tokens.css`, and the JS motion presets import the same values. CI fails if the generated CSS drifts from the source.

### 1.6 Review against the frontend-design calibration list

I checked the first draft against the skill's list of generated-design defaults and revised it:

- **Cream paper with a serif display and a clay accent.** My first idea for the light theme was a buff "land" paper, which is basically cream, so I replaced it with cool chart-paper green-grey. The serif here is for prose and curved labels, not the hero display. The accent is chart magenta.
- **Near-black with one acid accent.** The dark theme is a saturated navy with three layered depth tints, not tinted black. Magenta is reserved for location and focus.
- **The SaaS card kit.** No uniform rounded cards with grey shadows. Regions are contour islands, radius follows hierarchy, and elevation is drawn with tint and contour rather than shadows.
- **Template chrome.** No ALL-CAPS eyebrows, no "A · B · C" meta strings, no "→" on buttons, no mono data labels, and no numbered markers except on the Timeline, which really is a sequence.
- **Where the boldness goes.** It goes into the curved hydrographic labels and the depth-tint zoom. Everything else is plain.

### 1.7 Icons and illustrations

- About 30 **original icons** drawn for this project: 20px grid, 1.5px stroke, round joins, as inline SVG React components. Each one is its own module, so it tree-shakes.
- **Six original empty-state illustrations** in chart style (uncharted water, a dropped anchor, a lone buoy, and so on). They use `currentColor` plus tokens, so they follow both themes.
- No stock imagery and no emoji.

---

## 2. Tokens

Tokens are authored in `packages/atlas-ui/src/tokens/tokens.ts` (typed, the single source of truth). From there `scripts/build-tokens.ts` generates `tokens.css`, which defines CSS custom properties under `@layer atlas.tokens` for `:root`, `[data-theme="day"]` and `[data-theme="night"]`.

| Group | Examples |
|---|---|
| Colour (semantic) | `--deep`, `--shoal`, `--reef`, `--ink`, `--ink-soft`, `--edge`, `--isobath`, `--chart-magenta`, `--starboard`, `--port`, `--caution`, `--focus-ring` |
| Type | `--font-ui`, `--font-prose`, `--font-code`, `--step--1 … --step-6`, `--leading-ui`, `--leading-prose`, `--measure` |
| Space | `--space-3xs … --space-4xl` |
| Radius | `--radius-control`, `--radius-panel`, `--radius-overlay`, `--radius-round` |
| Elevation | `--elev-1`, `--elev-2` (contour edges), `--elev-overlay` (shadow) |
| Motion | `--ease-*`, `--dur-*` (zeroed under reduced motion) |
| Focus and targets | `--focus-ring` (2px magenta + 2px `--deep` offset, visible on any surface), `--target-min: 24px`, `--target-comfort: 44px` |
| Z / layers | `@layer atlas.tokens, atlas.base, atlas.components, atlas.site`. Overlays use the top layer, so there's no z-index war. |

`@property` registrations (`--tilt-x`, `--sheen-angle`, `--progress`) let those values animate in CSS without JS.

---

## 3. Folder structure

npm workspaces (pnpm isn't installed, and I don't need it).

```
atlas-ui/
├─ packages/atlas-ui/                 # the library
│  ├─ src/
│  │  ├─ tokens/        tokens.ts → tokens.css (generated), themes
│  │  ├─ primitives/    focus-trap, roving-focus, dismissable-layer, place (flip/shift),
│  │  │                 live-announcer, use-controllable, use-reduced-motion, visually-hidden
│  │  ├─ motion/        presets (eases, springs), view-transition helper, LazyMotion setup
│  │  ├─ icons/         original SVG icons (1 file each)
│  │  └─ components/
│  │     └─ navigation/command-palette/
│  │        ├─ CommandPalette.tsx
│  │        ├─ command-palette.css
│  │        ├─ meta.ts            # docs + playground schema + registry data
│  │        ├─ demos.tsx          # live presets shown at the Type level
│  │        └─ CommandPalette.test.tsx
│  ├─ package.json     # "exports" map: one subpath per component, "sideEffects": ["*.css"]
│  └─ vite.config.ts   # library build, preserveModules, so every component imports alone
├─ apps/site/                          # the showcase, built only from atlas-ui
│  ├─ src/ atlas/ (spatial scene, camera, mini-map), simple/ (list view),
│  │       docs/ (spec sheet assembled from meta), pages/principles, router.ts
│  └─ vite.config.ts   # base: /atlas-ui/, build-time shiki, ?raw source imports
├─ e2e/                 # Playwright: axe, visual, smoke, perf (frame timing, web-vitals)
├─ scripts/             build-tokens, build-registry, lighthouse-report, record-gif
├─ registry/            registry.json + r/<slug>.json (generated, committed)
├─ reports/             perf.md, a11y.md (real measured numbers only)
├─ .github/workflows/   ci.yml, pages.yml
├─ LICENSE (MIT), THIRD_PARTY_LICENSES.md, README.md, PLAN.md
```

---

## 4. Components (v1)

**Decision 1 below affects this section.** The brief asks for 8 categories × about 4 types for about 32 components, which works out to one component per type. My recommendation: **a type is a component family**. At the Type level you see that component's 2–3 presets as live objects you can use straight away. Picking one opens the Component level: the full spec sheet with playground, source, keyboard map and notes.

The ARIA pattern for each comes from the WAI-ARIA Authoring Practices, used for behaviour only. Every implementation and visual is my own.

| # | Category | Type / component | ARIA pattern | Signature idea (original) |
|---|---|---|---|---|
| 1 | Actions | Magnetic button | button | Pulls toward the pointer inside a radius. Its contour ring tightens on press. |
| 2 | | Morphing icon button | toggle button (`aria-pressed`) | Own SVG path interpolation between matched-point glyphs. |
| 3 | | Split action button | button + menu button | Primary action, and a seam that opens a menu of alternatives. |
| 4 | | Loading-state button | button, `aria-busy`, live status | Width-stable idle → loading → done/failed, with announcements. |
| 5 | Inputs & forms | OTP input | single `<input autocomplete="one-time-code">`, drawn as cells | Paste and autofill work because it really is one input. |
| 6 | | Animated select | select-only combobox + listbox | Options unroll like a chart unfolding. Typeahead. |
| 7 | | Range slider with live tooltip | slider (1 or 2 thumbs) | Sounding-line tooltip that follows the thumb. Tick snapping. |
| 8 | | Segmented control | radiogroup | Indicator slides with `--ease-current`. |
| 9 | Navigation | Floating dock | toolbar (roving tabindex) | Proximity magnification. Labels as tooltips. |
| 10 | | Command palette | dialog + combobox + listbox | Own fuzzy scorer, grouped results, recents, match highlighting. |
| 11 | | Breadcrumb trail with overflow | `nav` + `aria-current` + disclosure | Container-query collapse of the middle crumbs into a menu. |
| 12 | | Tab bar with sliding indicator | tabs (automatic or manual activation) | Indicator glides between tabs, and the panel uses a view transition. |
| 13 | Data display | Sparkline | `role="img"` + text summary + optional table | Pointer and keyboard scrubbing with a value readout. |
| 14 | | Animated stat counter | text, final value only exposed | Digit roll on tabular figures. Nothing is announced mid-roll. |
| 15 | | Heat-grid | grid (roving cell focus) | Depth-tint scale with ≥3:1 steps, plus a legend and cell values on focus. |
| 16 | | Timeline | ordered list + disclosures | Scroll-linked progress line (scroll timeline, or motion fallback). |
| 17 | Feedback | Toast stack | `role="status"`/`alert` per tone, focusable region | Fanned stack that expands on hover or focus, pauses, and swipes to dismiss. |
| 18 | | Skeleton shimmer system | container `aria-busy` | Primitives (line, block, avatar). Shimmer angle driven by `@property`. |
| 19 | | Progress ring | progressbar | Determinate and indeterminate. A contour-ring style track. |
| 20 | | Empty-state illustrations | decorative SVG + message | Six original chart-style illustrations. |
| 21 | Overlays | Drawer | modal dialog | Edge sheet, drag to dismiss, `inert` background. |
| 22 | | Popover with collision handling | Popover API + own flip/shift | Arrow tracks the anchor after it flips. |
| 23 | | Modal with focus trap | native `<dialog>` + focus management | Returns focus, scroll lock, nested-dialog safe. |
| 24 | | Context menu | menu / menuitem | Right-click, Shift+F10 or Menu key. Submenus, typeahead. |
| 25 | Layout & cards | Tilt card | none (container) | Pointer tilt with a contour sheen. Focus gives a small lift. |
| 26 | | Bento grid | none (layout) | Span API plus container-query re-flow. |
| 27 | | Expandable card | disclosure | Shared-layout expansion that keeps focus in place. |
| 28 | | Parallax stack | none (layout) | Scroll-driven layer offsets. |
| 29 | Spatial & 3D ⓢ | Depth-layers card | none | CSS 3D planes that separate on hover or focus. **No WebGL.** |
| 30 | | 3D carousel | carousel (rotation control, slide labels) | CSS 3D ring. Keyboard and button rotation. **No WebGL.** |
| 31 | | WebGL ambient background ⓦ | decorative (`aria-hidden`) | TSL contour-field shader. Static SVG fallback. |
| 32 | | Cursor-reactive particle field ⓦ | decorative | Particles drift along a contour flow field and part around the cursor. |

ⓢ marks the Spatial category, ⓦ marks the two WebGL components. Both WebGL components load lazily, need neither JS nor WebGL for the page to work, and pause when hidden.

**Supporting components the shell needs.** These are full library components with docs. They are filed under their category as extra types:

- **Switch** (Inputs)
- **Text field** (Inputs; label, hint, error)
- **Tooltip** (Overlays; hoverable and persistent per WCAG 1.4.13)
- **Code panel** (Data display; copy, line numbers, build-time highlighting)

Total: 36.

Every component gets:

- live preview (presets)
- props playground (generated from the `meta.ts` schema)
- copy-paste source (shown via `?raw`, plus a copy button)
- usage notes
- keyboard map
- accessibility notes (roles, labels, focus)
- reduced-motion behaviour
- Night and Day themes

**Original work.** Nothing is copied or closely imitated from shadcn/ui, Aceternity, Magic UI, Radix Themes or any other library. Runtime dependencies are only `react`, `react-dom`, `motion` and (in the two ⓦ components) `three`, all MIT. Positioning is my own code, so no positioning dependency is needed.

---

## 5. The spatial showcase

### 5.1 Levels and URLs

| Level | URL | What you see | Depth tint |
|---|---|---|---|
| Atlas | `/atlas-ui/` | 8 contour islands on a graticule. Region names in curved italic. | `--deep` (shallowest feel) |
| Region (category) | `/atlas-ui/navigation/` | The island fills the view. Its types are soundings placed on it, each showing a live thumbnail. | one step deeper |
| Type | `/atlas-ui/navigation/command-palette/` | The component's presets as live objects you can use straight away. | deeper |
| Component | `/atlas-ui/navigation/command-palette/spec` | Spec sheet: stage, playground, source, notes, keyboard map, a11y, reduced motion. | deepest |
| Principles | `/atlas-ui/principles` | The art direction above, shown with the real tokens. | — |

A small custom History-API router (~120 lines) is used, not react-router, so each zoom wraps exactly one state change in `document.startViewTransition`. GitHub Pages deep links use the standard `404.html` redirect.

### 5.2 Wireframes

```
ATLAS                                              REGION (Navigation)
┌─────────────────────────────────────────────┐   ┌─────────────────────────────────────────────┐
│ ╎    ╎    ╎    ╎    ╎    ╎    ╎    ╎    ╎   │   │ Atlas › Navigation            ┌─inset──┐   │
│   ╭───╮          ╭─────╮       ╭──╮        │   │                               │ ▪ ▫ ▫  │   │
│  ( Actions )    ( Inputs  )   (Nav )       │   │   ╭──────────────────────────╮│ ▫ ▫ ▫  │   │
│   ╰─ ⌒ ─╯      ╰─  ⌒  ─╯    ╰⌒─╯         │   │  (  ◉ Floating dock         ) └────────┘   │
│        ╭──────╮        ╭────╮              │   │  (     [live dock]           )              │
│       ( Data   )      (Over )   ╭───╮      │   │  (  ◉ Command palette   ◉ Tab bar  )        │
│        ╰─ ⌒ ──╯       ╰ ⌒ ╯   (Feed)      │   │  (    [live ⌘K]          [live tabs])       │
│   ╭─────╮       ╭────────╮      ╰─╯        │   │  (  ◉ Breadcrumb trail      )               │
│  (Layout )     ( Spatial  )                │   │   ╰──────────────────────────╯              │
│   ╰──⌒─╯       ╰───⌒────╯                 │   │                                             │
│ scale ▕▔▔▔▔▕▔▔▔▕  Atlas                     │   │ scale ▕▔▔▔▔▕▔▔▔▔▕ Region                    │
│              [ dock: ⌂  ⌕  ◐  ▤  ? ]       │   │            [ dock: ⌂  ⌕  ◐  ▤  ? ]          │
└─────────────────────────────────────────────┘   └─────────────────────────────────────────────┘
  ⌒ = curved italic region label along the coastline       ◉ = sounding marker (a type)

TYPE (Command palette)                             COMPONENT spec sheet
┌─────────────────────────────────────────────┐   ┌─────────────────────────────────────────────┐
│ Atlas › Navigation › Command palette  inset │   │ Atlas › … › Command palette › Spec   inset  │
│                                             │   │ Command palette                             │
│  ┌ preset: Default ─┐ ┌ preset: Grouped ─┐ │   │ Jump anywhere by typing.  (prose, ≤68ch)    │
│  │  [usable live]    │ │  [usable live]    │ │   │ ┌ stage (live) ───────────┐┌ playground ┐  │
│  └───────────────────┘ └───────────────────┘ │   │ │                          ││ placeholder│  │
│  ┌ preset: With recents ┐                    │   │ │                          ││ groups  ◉○ │  │
│  │  [usable live]       │  Open spec sheet   │   │ └──────────────────────────┘└────────────┘  │
│  └──────────────────────┘                    │   │ [Usage] [Source] [Keyboard] [A11y] [Motion]│
│              [ dock ]                        │   │  (tab bar from the library)  [ dock ]      │
└─────────────────────────────────────────────┘   └─────────────────────────────────────────────┘

SIMPLE VIEW (same URLs, plain document)
┌─────────────────────────────────────────────┐
│ atlas-ui        View: (Spatial|Simple)  ◐   │
│ An atlas of interfaces.                     │
│ Actions                                     │
│   • Magnetic button: pulls toward…         │
│   • …                                       │
│ Inputs and forms                            │
│   • …   (headings h2/h3, plain links)       │
└─────────────────────────────────────────────┘
```

Alignment: text is left-aligned throughout. The atlas scene is the only place things are centred, around the camera.

### 5.3 How it works

- **The scene is DOM and SVG, not WebGL.** Islands are SVG paths from a seeded contour generator (fixed per category, so the map never changes between visits). Each island is a real `<a>`. A "camera" is a CSS `transform` (translate + scale) on the scene layer, animated with `motion`. WebGL only paints the background behind it, so screen readers and keyboards get a normal link structure.
- **Zoom (shared elements).** On enter, the island path gets `view-transition-name: region-navigation`. The next level's header island carries the same name, so the browser morphs one into the other. Sounding → type header and preset → spec stage work the same way. View transition groups use `--ease-drift` over `--dur-voyage`. Only one name is assigned at a time (the element being entered), which avoids duplicate-name errors and keeps snapshots cheap.
- **Without View Transitions:** a `motion` camera tween (scale toward the island's bounding box), then a crossfade.
- **Reduced motion:** opacity crossfade at `--dur-step`, or instant.

**Input**

| Input | Action |
|---|---|
| Click, Enter or Space on a region/sounding | Enter it. |
| Escape, Backspace, or the `-` key | Zoom out one level. |
| Arrow keys | Move focus spatially to the nearest island or sounding in that direction (roving tabindex). Tab still goes in DOM order. |
| Drag (pointer) | Pan the chart, with inertia and edges you can't pan past. |
| Wheel / trackpad scroll | Pans. Page scrolling is never hijacked on the Spec and Simple pages. |
| Ctrl/⌘ + wheel or pinch | Past a threshold, enter the focused or nearest region, or zoom out. |
| `Ctrl/⌘ K` or `/` | Command palette (the library component) to jump anywhere. |

**Always knowing where you are.**

- **Breadcrumb trail** (library) at the top left.
- **Inset mini-map** (top right): the whole atlas in miniature, current region outlined in magenta. It's clickable, and also a `nav` landmark with links.
- **Scale bar** showing the current level.
- The **floating dock** (library) holds: Atlas home, Search, Theme, View (Spatial/Simple), Principles.

**Simple view.** Same URLs, rendered as a normal document: headings, lists and links, with no transforms and no WebGL. You switch with the visible "Spatial | Simple" segmented control in the header (also in the dock), and your choice is saved. Simple view turns on **automatically** when:

- `prefers-reduced-motion: reduce` is set, or
- neither WebGPU nor WebGL2 is available, or
- the device reports `saveData`.

When it was switched on automatically, a dismissible note says why and offers Spatial anyway. The **spec sheet** is the same in both views, because it's already a normal page.

**Ambient background.** Lazy-loaded after the first idle moment, never in Simple view. It pauses on `visibilitychange`, when off-screen (IntersectionObserver), after 30s without input, and under reduced motion. Device pixel ratio is capped at 1.5. A static SVG contour pattern is painted first, so the WebGL layer only enhances it.

---

## 6. Accessibility approach

- **Patterns:** the WAI-ARIA APG pattern for each interactive component (Section 4 table). Behaviour is studied there, the code is my own.
- **Shared primitives** (each one unit-tested): focus trap with return-to-trigger, roving tabindex with spatial and linear modes, dismissable layer (Escape, outside click, focus leaving), `inert` on background content, a live-region announcer (polite and assertive), and controlled/uncontrolled state handling.
- **Focus:** always visible through `:focus-visible`, using a 2px magenta ring plus a 2px `--deep` offset, so it reads on every surface and in both themes. It's never removed.
- **Targets:** at least 24×24 CSS px everywhere (WCAG 2.2 SC 2.5.8). 44×44 for the dock, primary actions and mobile.
- **Contrast:** token-pair test (Section 1.2) plus axe colour-contrast on rendered pages.
- **Motion:** `prefers-reduced-motion` and an in-site override. No motion is required to understand or operate anything.
- **Landmarks and headings:** one `h1` per level and a logical heading outline. A skip link goes to the main content. Route changes announce the new location and move focus to the level heading.
- **Pointer-only effects** (magnetic, tilt, particles) are enhancements. Every component works fully by keyboard and touch.
- **Automated checks:** axe on every spec page in both themes, plus the atlas and Simple view. **CI fails on any violation.** If I ever need to suppress a rule, it goes in `e2e/axe-exceptions.ts` with a written reason, and the README shows that count.
- **Manual checks I'll do and report:** keyboard-only passes through every component, and a quick NVDA + Firefox pass on Windows for the slice. I'll report only what I actually did.

---

## 7. Performance budgets

All numbers are measured on real runs and reported with the date, machine and conditions. Where a budget is missed, the report says so with the actual number.

| Metric | Budget | How it's measured | Gate? |
|---|---|---|---|
| Initial JS, atlas route (gzip) | ≤ 110 KB | `scripts/check-budgets.ts`: entry script + modulepreloads read from the built index.html | **CI fails** |
| Initial CSS (gzip) | ≤ 25 KB | `check-budgets.ts` | **CI fails** |
| Per component, JS + CSS (gzip, excluding react/motion) | ≤ 6 KB | `check-budgets.ts`: esbuild bundle per component, minified, React external | **CI fails** |
| Lazy 3D chunk (three/webgpu + scenes, gzip) | ≤ 250 KB, never on the initial route | `check-budgets.ts`, plus an e2e check that it doesn't load in Simple view | **CI fails** |
| Fonts preloaded | ≤ 2 files, ≤ 90 KB | build manifest check | report |
| LCP | ≤ 2.0 s | Lighthouse 13, mobile preset (simulated throttling), 3 runs, median | report |
| CLS | ≤ 0.05 | Lighthouse and web-vitals in Playwright | report |
| TBT (lab proxy for INP) | ≤ 150 ms | Lighthouse | report |
| INP (lab) | ≤ 200 ms | Playwright + web-vitals across scripted interactions (open palette, zoom, drag, playground edits). Clearly labelled as lab, not field. | report |
| Lighthouse Accessibility | 100 | Lighthouse | report |
| Frame timing during zoom and drag | p95 ≤ 16.7 ms (60 fps) | Playwright + rAF frame sampler and CDP tracing, on the machine above, unthrottled. Also reported at 4× CPU throttle (no budget, for honesty). | report |

Lighthouse and frame numbers are noisy on shared CI runners, so they're reported rather than gated. The bundle budgets are deterministic, so they gate CI.

---

## 8. Test plan

| Layer | Tool | Covers |
|---|---|---|
| Unit and interaction | Vitest 5, browser mode (Chromium via Playwright), Testing Library, user-event | Keyboard maps from each `meta.ts` (a test walks the declared keys, so the docs can't drift from the behaviour); focus trap enter/exit and return; roving focus; controlled vs uncontrolled state; `onChange` contracts; reduced-motion branches; the fuzzy scorer; flip/shift placement maths; the router; the token contrast test. |
| Accessibility | @axe-core/playwright | Every spec page × {Night, Day}, plus Atlas, Region, Type and Simple view. Fails on any violation. |
| Visual | Playwright `toHaveScreenshot` | Each component's default preset × {Night, Day}, Chromium, animations disabled, fonts awaited. Baselines are OS-specific: Linux baselines (CI) are authoritative. A `workflow_dispatch` job regenerates them as an artifact. |
| Smoke | Playwright (Chromium, Firefox, WebKit) | Atlas → Region → Type → Spec and back, by mouse and by keyboard only; palette jump; Spatial ↔ Simple toggle; auto-Simple under emulated reduced motion; deep-link reload on the Pages base path. |
| Performance | Playwright + web-vitals, Lighthouse script | Section 7 numbers, written to `reports/perf.md`. |

**CI (`.github/workflows/ci.yml`, Node 24):** install → lint → typecheck → tokens drift check → unit tests → build (lib + site) → bundle budgets (**gate**) → registry drift check → Playwright axe + smoke (**axe gate**) → visual (Chromium). Reports are uploaded as artifacts.

**Deploy (`pages.yml`):** builds the site with `base: /atlas-ui/` and deploys to GitHub Pages on push to `main`.

---

## 9. Distribution and registry (v1)

- Copy-paste: every spec sheet shows the full source files with a copy button.
- `registry/registry.json` (index) and `registry/r/<slug>.json` (one per component) are generated from `meta.ts` plus the source files by `scripts/build-registry.ts`.
- **Format** `atlas-registry/1`, documented by a JSON Schema in `registry/schema.json`:
  - `name`, `slug`, `category`, `type`
  - `files[]` with `path`, `content`, `kind`
  - `dependencies` (npm packages and their versions)
  - `registryDependencies` (shared primitives, icons, tokens)
  - `tokensUsed[]`, `a11y` summary, `license`
- This is enough for a v2 `npx atlas-ui add <component>` to resolve and write files. **The CLI isn't built in v1.**

---

## 10. Milestones

| # | Milestone | Ends with |
|---|---|---|
| M0 | This plan | **STOP: your approval.** |
| M1 | Foundation and vertical slice: tooling, CI skeleton, tokens and themes, fonts, icons (initial set), primitives, motion utilities, the spatial shell (atlas, all 8 islands, region/type/spec levels, mini-map, scale bar, view transitions with fallback, Simple view, Principles page), and **the Navigation category end to end** (dock, command palette, breadcrumb trail, tab bar) with docs, unit tests, axe, visual and smoke tests. Islands for the other 7 categories exist but are marked "not charted yet". | **STOP: screenshots (Night and Day, each level, Simple view) for your look-and-feel approval.** |
| M2 | Batch A: Actions and Inputs (+ Switch, Text field). Playground controls switch from the slice's styled native controls to these components. | Tests green, screenshots. |
| M3 | Batch B: Overlays (+ Tooltip) and Feedback. | Tests green. |
| M4 | Batch C: Data display (+ Code panel) and Layout & cards. | Tests green. |
| M5 | Batch D: Spatial & 3D, including the WebGL background going live (lazy, with fallback). | Tests green, 3D budget checked. |
| M6 | Registry, perf + a11y reports with real numbers, README (screenshot, GIF, principles, component list, measured results, how to run, contributing, licences), Pages deploy. | Final report. |

**Why Navigation is the slice:** the shell runs on it (dock, palette, breadcrumbs, the tab bar on spec sheets), so the slice is a real proof of the "the site is built from the library" claim.

**One honest gap in the slice:** the playground uses token-styled *native* inputs until M2 delivers the library's Inputs. They're accessible and on-brand, and they get swapped in M2.

Commits stay small and descriptive, with **no Co-Authored-By or Claude-Session trailers**. `.claude/settings.json` sets attribution to empty, and `.claude/` is git-ignored.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Scope: 36 components at this level of polish is a lot. | Vertical slice first. Each batch ships complete (docs and tests) before the next starts. If something has to slip, I'll say exactly what, not hide it. |
| three.js WebGPURenderer and TSL behaviour differs between the WebGPU and WebGL2 backends. | Test both (`forceWebGL`). The only WebGL use is decorative, and it has a static fallback. |
| View Transitions differ between engines (`view-transition-class`, nested groups). | Core effect uses only named transitions. A `motion` fallback path. Smoke tests in all 3 engines. |
| Visual snapshot baselines differ by OS and fonts. | Linux CI baselines are authoritative. Local Windows runs are informative only. |
| Lab metrics on localhost and shared CI are noisy. | Median of 3 runs, conditions stated, and Pages URL numbers reported once deployed. |
| TypeScript 7 / ESLint 10 are the newest, but the lint ecosystem lags. | Pinned to TS 6.0.3 and ESLint 9.39 and noted. Upgrade when typescript-eslint and jsx-a11y support them. |
| Local Node 22.16 is older than some tools now prefer. | Dependencies chosen to run on it. CI uses Node 24 LTS. Upgrading locally to 24 is optional. |

---

## 12. Decisions I need from you

1. **Type vs component.** With about 32 components in about 32 types, I recommend *type = component family*, with presets shown live at the Type level and the spec sheet as the Component level. The alternative is fewer, larger types (for example Actions → "Buttons" with 4 components), which gives a deeper Type level but fewer regions to explore.
2. **Default theme.** Night chart (dark) on first visit, as planned, or follow the OS setting?
3. **Vertical-slice category.** Navigation, as recommended, or another one?
4. **Auto-Simple under reduced motion.** The brief says to switch to Simple automatically. I'll do that, but still let reduced-motion users choose Spatial, with crossfades only. Is that OK?

---

## 13. Changes during M1

Recorded so the plan stays an honest description of the code.

- **Decisions (§12), taken as recommended:** a type is a component family; Night chart (dark) on first visit; Navigation is the slice; Simple view is automatic under reduced motion, with a button to choose Spatial anyway.
- **Bundle budgets:** size-limit's config validation would not let site chunks skip bundling, and bundling already-built chunks gives wrong numbers. `scripts/check-budgets.ts` replaces it: it reads the built `index.html` for the true initial load and bundles each component with esbuild.
- **Colour authoring:** base colours are hex in `tokens.ts` rather than oklch, so the contrast test works on exact values. Derived states still use `color-mix(in oklch, …)`.
- **Fonts:** the Fontsource Latin files were 128–143 KB each. `scripts/subset-fonts.ts` narrows axes to what the design uses (Bricolage width fixed at 100; Newsreader Italic weight fixed at 440), bringing the two preloaded fonts to 83.8 KB together.
- **Camera vs. view transitions:** Atlas ↔ Region is a camera move on one persistent SVG (vector-sharp at every frame). Region → Type and Type → Spec use shared-element view transitions (`type-<slug>` card → header, `stage-<slug>` preset → stage).
- **WebKit:** in Playwright's WebKit build (Windows, October 2026) the page process crashed on view transitions that start or end on the chart. I could not isolate the trigger (an empty SVG in the same place did not crash in isolation). WebKit swaps those pages without a transition; Type ↔ Spec still animates there. Chromium and Firefox are unaffected.
- **`motion` not used yet:** the slice needed no physics or layout animation beyond CSS and a small token-driven tween (`motion/tween.ts`), so the `motion` package was removed until a component needs it (Actions, Feedback and Layout are the likely first users).
- **Visual baselines:** no Docker or WSL on this machine, so Windows baselines are local only (git-ignored). CI writes the Linux baselines on its first run and uploads them as an artifact to commit.
- **Playground controls:** token-styled native inputs, as planned, until the Inputs category lands in M2.

