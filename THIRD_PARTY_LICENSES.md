# Third-party licences

atlas-ui itself is MIT licensed (see `LICENSE`). Every component, icon and illustration in this
repository is original work. This file lists what the project uses from others.

## Fonts (shipped with the showcase site)

The site serves subsets of these fonts, made by `scripts/subset-fonts.ts` (Latin characters
only, with some variation axes narrowed or fixed). None of the three declares a Reserved Font
Name, so the OFL allows these modified versions to keep their names. The full licence texts
ship with the site in `apps/site/public/licenses/`.

| Font | Authors | Licence | Source package |
|---|---|---|---|
| Bricolage Grotesque | The Bricolage Grotesque Project Authors | SIL Open Font License 1.1 | `@fontsource-variable/bricolage-grotesque` |
| Newsreader | The Newsreader Project Authors (Production Type) | SIL Open Font License 1.1 | `@fontsource-variable/newsreader` |
| JetBrains Mono | The JetBrains Mono Project Authors | SIL Open Font License 1.1 | `@fontsource-variable/jetbrains-mono` |

## Runtime dependencies

| Package | Licence | Used by |
|---|---|---|
| react, react-dom | MIT | All components and the site |
| motion | MIT | Magnetic button (spring follow) and Expandable card (shared-layout expand) |
| three | MIT | The Spatial and 3D components and the site's ambient background, loaded on demand through `primitives/three-host.ts` |

## Build and test tools (not shipped to browsers)

| Package | Licence | Purpose |
|---|---|---|
| vite, @vitejs/plugin-react | MIT | Build |
| typescript | Apache-2.0 | Type checking |
| eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y | MIT | Linting |
| vitest, @vitest/browser-playwright | MIT | Unit and interaction tests |
| @testing-library/react, @testing-library/dom, @testing-library/user-event | MIT | Test utilities |
| playwright, @playwright/test | Apache-2.0 | Browser tests |
| axe-core, @axe-core/playwright | MPL-2.0 | Accessibility checks |
| shiki | MIT | Build-time syntax highlighting |
| esbuild | MIT | Per-component bundle budgets |
| subset-font | BSD-3-Clause | Font subsetting (uses harfbuzzjs, MIT) |
| prettier | MIT | Formatting |
| lighthouse, chrome-launcher | Apache-2.0 | Performance measurement (`scripts/measure.ts`) |
| web-vitals | Apache-2.0 | Lab INP, CLS and LCP in `scripts/measure.ts` |
| gifenc, pngjs | MIT | Encoding the README GIF from screenshots (`scripts/record-media.ts`) |
