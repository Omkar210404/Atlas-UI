# atlas-ui

An atlas of interfaces: original, accessible React components, shown on a chart you can zoom
through from region to type to component.

> **Status: work in progress.** The foundation, the spatial showcase and the Navigation category
> (4 of 36 planned components) are built. The other seven categories are on the chart but not
> charted yet. Measured performance and accessibility numbers, screenshots and the full README
> arrive with the final milestone; see [PLAN.md](PLAN.md).

## Run it

Needs Node 22.12 or newer (CI uses Node 24).

```sh
npm install
npx playwright install chromium   # browser for the unit tests
npm run dev                       # http://localhost:5173/atlas-ui/
```

| Command | What it does |
|---|---|
| `npm run build` | Generates tokens, builds the library (one module per component) and the site |
| `npm run preview` | Serves the built site at http://localhost:4173/atlas-ui/ |
| `npm test` | Unit and interaction tests in real Chromium (Vitest browser mode) |
| `npm run e2e` | Playwright: axe in both themes, smoke tests in three browsers, visual snapshots |
| `npm run size` | Checks bundle budgets after a build; fails when one is exceeded |
| `npm run lint` / `npm run typecheck` | ESLint (with jsx-a11y) and TypeScript |

## Licence

MIT for the code. Fonts are OFL-1.1; see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
