import type { ReactNode } from 'react';

/**
 * Original line illustrations in the chart style, drawn on a 160 × 120 grid.
 * Lines use `currentColor`; the `.sea` and `.mark` classes pick up theme tokens.
 */
export const illustrations = {
  /** A blank chart sheet with an unfinished coast: nothing here yet. */
  uncharted: (
    <>
      <path className="sea" d="M14 92c18-6 34 6 52 0s34-6 52 0 22 4 28 2" />
      <path d="M40 18h64l16 16v62H40z" />
      <path d="M104 18v16h16" />
      <path className="dash" d="M52 70c6-14 18-16 24-8s16 10 22-2" />
      <circle cx="96" cy="52" r="9" />
      <path className="mark" d="m96 45 2.5 7-2.5 7-2.5-7z" />
      <path d="M52 44h18M52 50h12" />
    </>
  ),
  /** An anchor resting on the seabed: no results. */
  anchor: (
    <>
      <path className="sea" d="M10 40c12-5 24 5 36 0s24-5 36 0 24 5 36 0 22-4 32 0" />
      <path className="sea" d="M24 54c10-4 20 4 30 0s20-4 30 0 20 4 30 0" />
      <path d="M80 30v52" />
      <circle cx="80" cy="25" r="5" />
      <path d="M68 40h24" />
      <path d="M58 70c4 14 14 20 22 20s18-6 22-20" />
      <path d="m54 74 4-6 6 4M106 74l-4-6-6 4" />
      <path className="dash" d="M20 100h120" />
      <path d="M36 100c4-4 10-4 14 0M110 100c4-5 9-5 13 0" />
    </>
  ),
  /** A lone buoy: an empty list waiting for its first item. */
  buoy: (
    <>
      <path className="sea" d="M12 86c14-6 28 6 42 0s28-6 42 0 28 6 42 0 12-3 18 0" />
      <path className="sea" d="M30 100c12-4 24 4 36 0s24-4 36 0 24 4 36 0" />
      <path d="M68 84 74 46h12l6 38z" />
      <path d="M72 62h16M70 74h20" />
      <path d="M80 46V34" />
      <circle className="mark-fill" cx="80" cy="30" r="4" />
      <path className="dash" d="M64 24 58 18M96 24l6-6M80 20v-8" />
    </>
  ),
  /** A lighthouse whose beam has gone out: offline or failed to load. */
  lighthouse: (
    <>
      <path className="sea" d="M10 96c14-5 28 5 42 0s28-5 42 0 28 5 42 0 14-3 24 0" />
      <path d="M66 92 70 42h20l4 50z" />
      <path d="M66 42h28v-8H66z" />
      <path d="M70 34v-8h20v8" />
      <path d="M80 26v-8" />
      <path d="M69 58h22M68 74h24" />
      <path className="dash" d="M96 30h28M96 22l24-8M96 38l24 8" />
      <path d="M112 64h22M120 58v12" />
    </>
  ),
  /** A message in a bottle drifting by: no messages. */
  bottle: (
    <>
      <path className="sea" d="M8 78c14-6 28 6 42 0s28-6 42 0 28 6 42 0 16-4 26 0" />
      <path className="sea" d="M22 94c12-4 24 4 36 0s24-4 36 0 24 4 36 0" />
      <path d="M50 66c-2-12 4-20 18-24l30-8c8-2 14 2 16 8l1 4c2 6-2 12-10 14l-30 8c-14 4-23 4-25-2z" />
      <path d="m114 40 12-4 3 10-12 4" />
      <path className="dash" d="M62 56c10-2 22-6 34-10" />
      <path d="M66 62c8-2 18-5 26-7" />
    </>
  ),
  /** Fog over the water, an island just visible: nothing matched the search. */
  fog: (
    <>
      <path className="sea" d="M10 92c14-5 28 5 42 0s28-5 42 0 28 5 42 0 14-3 24 0" />
      <path className="dash" d="M38 78c10-18 24-26 38-26s26 10 34 26" />
      <path d="M20 44h56M88 44h52M30 58h36M78 58h56M14 72h40M100 72h40" />
      <path className="dash" d="M44 30h72" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IllustrationName = keyof typeof illustrations;
