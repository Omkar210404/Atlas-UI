import type { CategorySlug, ComponentDocs } from 'atlas-ui/docs/types';

export interface TypeEntry {
  slug: string;
  name: string;
  /** One-line summary. For charted types a test checks it matches the docs metadata. */
  summary: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  types: readonly TypeEntry[];
}

/** The eight regions of the atlas, in reading order. */
export const categories: readonly Category[] = [
  {
    slug: 'actions',
    name: 'Actions',
    description: 'Buttons that respond to how you reach for them.',
    types: [
      { slug: 'button', name: 'Button', summary: 'The base button every other action builds on.' },
      {
        slug: 'magnetic-button',
        name: 'Magnetic button',
        summary: 'A button that leans toward the pointer.',
      },
      {
        slug: 'morphing-icon-button',
        name: 'Morphing icon button',
        summary: 'A toggle whose icon reshapes between states.',
      },
      {
        slug: 'split-action-button',
        name: 'Split action button',
        summary: 'One main action with alternatives behind a seam.',
      },
      {
        slug: 'loading-state-button',
        name: 'Loading-state button',
        summary: 'Shows progress and the outcome without changing size.',
      },
    ],
  },
  {
    slug: 'inputs',
    name: 'Inputs and forms',
    description: 'Fields and controls for entering and choosing values.',
    types: [
      {
        slug: 'otp-input',
        name: 'OTP input',
        summary: 'One-time codes, drawn as cells, typed as one field.',
      },
      {
        slug: 'animated-select',
        name: 'Animated select',
        summary: 'A select whose options unroll from the trigger.',
      },
      {
        slug: 'range-slider',
        name: 'Range slider',
        summary: 'One or two thumbs with a live value readout.',
      },
      {
        slug: 'segmented-control',
        name: 'Segmented control',
        summary: 'A small set of exclusive options with a sliding marker.',
      },
      { slug: 'switch', name: 'Switch', summary: 'An on/off setting that applies at once.' },
      {
        slug: 'text-field',
        name: 'Text field',
        summary: 'A labelled field with hint and error text.',
      },
    ],
  },
  {
    slug: 'navigation',
    name: 'Navigation',
    description: 'Ways to find your bearings and move between places.',
    types: [
      {
        slug: 'floating-dock',
        name: 'Floating dock',
        summary: 'A compact toolbar whose items grow as the pointer approaches.',
      },
      {
        slug: 'command-palette',
        name: 'Command palette',
        summary: 'Jump anywhere by typing a few letters.',
      },
      {
        slug: 'breadcrumb-trail',
        name: 'Breadcrumb trail',
        summary: 'The path to the current page, folding its middle when space runs out.',
      },
      {
        slug: 'tab-bar',
        name: 'Tab bar',
        summary: 'Tabs with an indicator that glides to the selected tab.',
      },
    ],
  },
  {
    slug: 'data-display',
    name: 'Data display',
    description: 'Numbers and series, readable at a glance and on demand.',
    types: [
      { slug: 'sparkline', name: 'Sparkline', summary: 'A word-sized line chart you can scrub.' },
      {
        slug: 'stat-counter',
        name: 'Animated stat counter',
        summary: 'A figure that rolls to its new value.',
      },
      {
        slug: 'heat-grid',
        name: 'Heat-grid',
        summary: 'A grid of cells shaded by value, navigable by keyboard.',
      },
      {
        slug: 'timeline',
        name: 'Timeline',
        summary: 'Events in order, with a progress line that follows scrolling.',
      },
      {
        slug: 'code-panel',
        name: 'Code panel',
        summary: 'Highlighted source with line numbers and copy.',
      },
    ],
  },
  {
    slug: 'feedback',
    name: 'Feedback',
    description: 'Telling people what happened, and what is still happening.',
    types: [
      {
        slug: 'toast-stack',
        name: 'Toast stack',
        summary: 'Brief messages that stack, pause and dismiss.',
      },
      {
        slug: 'skeleton',
        name: 'Skeleton shimmer system',
        summary: 'Placeholders shaped like the content to come.',
      },
      {
        slug: 'progress-ring',
        name: 'Progress ring',
        summary: 'Determinate and indeterminate progress in a ring.',
      },
      {
        slug: 'empty-states',
        name: 'Empty-state illustrations',
        summary: 'Original chart-style illustrations for empty screens.',
      },
    ],
  },
  {
    slug: 'overlays',
    name: 'Overlays',
    description: 'Layers above the page: dialogs, sheets, menus and tips.',
    types: [
      { slug: 'drawer', name: 'Drawer', summary: 'A sheet from the edge that you can drag away.' },
      {
        slug: 'popover',
        name: 'Popover',
        summary: 'Anchored content that flips and shifts to stay visible.',
      },
      { slug: 'modal', name: 'Modal', summary: 'A dialog that holds focus until you close it.' },
      {
        slug: 'context-menu',
        name: 'Context menu',
        summary: 'Right-click and keyboard menus with submenus.',
      },
      {
        slug: 'tooltip',
        name: 'Tooltip',
        summary: 'A short label on hover and focus that you can dismiss.',
      },
    ],
  },
  {
    slug: 'layout',
    name: 'Layout and cards',
    description: 'Surfaces and arrangements for grouping content.',
    types: [
      { slug: 'tilt-card', name: 'Tilt card', summary: 'A card that tilts toward the pointer.' },
      {
        slug: 'bento-grid',
        name: 'Bento grid',
        summary: 'A spanning grid that reflows with its container.',
      },
      {
        slug: 'expandable-card',
        name: 'Expandable card',
        summary: 'A card that opens into its details in place.',
      },
      {
        slug: 'parallax-stack',
        name: 'Parallax stack',
        summary: 'Layers that drift at different speeds as you scroll.',
      },
    ],
  },
  {
    slug: 'spatial',
    name: 'Spatial and 3D',
    description: 'Depth, perspective and light. Never required to use the page.',
    types: [
      {
        slug: 'depth-layers-card',
        name: 'Depth-layers card',
        summary: 'Planes that separate in CSS 3D.',
      },
      {
        slug: 'carousel-3d',
        name: '3D carousel',
        summary: 'A ring of slides you rotate by key or button.',
      },
      {
        slug: 'ambient-background',
        name: 'WebGL ambient background',
        summary: 'A slow contour field behind the page.',
      },
      {
        slug: 'particle-field',
        name: 'Cursor-reactive particle field',
        summary: 'Particles that drift and part around the cursor.',
      },
    ],
  },
];

const docsModules = import.meta.glob<{ docs: ComponentDocs }>(
  '../../../packages/atlas-ui/src/components/*/*/docs.tsx',
);

const docsPath = (category: string, slug: string) =>
  `../../../packages/atlas-ui/src/components/${category}/${slug}/docs.tsx`;

/** A type is "charted" when its component and docs exist in the library. */
export function isCharted(category: string, slug: string): boolean {
  return docsPath(category, slug) in docsModules;
}

const docsCache = new Map<string, ComponentDocs>();

export async function loadDocs(category: string, slug: string): Promise<ComponentDocs | null> {
  const path = docsPath(category, slug);
  const cached = docsCache.get(path);
  if (cached) return cached;
  const load = docsModules[path];
  if (!load) return null;
  const { docs } = await load();
  docsCache.set(path, docs);
  return docs;
}

/** Docs that have already loaded, so a page can render them in its first frame. */
export function peekDocs(category: string, slug: string): ComponentDocs | null | undefined {
  if (!isCharted(category, slug)) return null;
  return docsCache.get(docsPath(category, slug));
}

export function findCategory(slug: string | undefined): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function findType(category: Category | undefined, slug: string | undefined) {
  return category?.types.find((t) => t.slug === slug);
}

export const chartedCount = categories.reduce(
  (sum, c) => sum + c.types.filter((t) => isCharted(c.slug, t.slug)).length,
  0,
);
export const plannedCount = categories.reduce((sum, c) => sum + c.types.length, 0);
