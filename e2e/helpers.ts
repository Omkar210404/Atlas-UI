import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

export type Theme = 'night' | 'day';
export const themes: Theme[] = ['night', 'day'];

const components = fileURLToPath(new URL('../packages/atlas-ui/src/components/', import.meta.url));

/** Every charted component, found from the docs files on disk: `${category}/${slug}`. */
export const charted: Array<{ category: string; slug: string }> = globSync('*/*/docs.tsx', {
  cwd: components,
})
  .map((file) => file.replace(/\\/g, '/').split('/'))
  .map(([category, slug]) => ({ category: category!, slug: slug! }))
  .sort((a, b) => `${a.category}/${a.slug}`.localeCompare(`${b.category}/${b.slug}`));

/**
 * Seeds saved preferences before the first load (later reloads keep whatever the page saved),
 * and skips the first-visit chart drawing.
 */
export async function usePrefs(
  page: Page,
  prefs: {
    theme?: Theme;
    view?: 'spatial' | 'simple' | null;
    motion?: 'system' | 'reduce' | 'full';
  },
) {
  await page.addInitScript((value) => {
    if (window.localStorage.getItem('atlas-ui:prefs')) return;
    window.localStorage.setItem(
      'atlas-ui:prefs',
      JSON.stringify({ theme: 'night', view: 'spatial', motion: 'system', ...value }),
    );
    window.sessionStorage.setItem('atlas-ui:unfolded', '1');
  }, prefs);
}

/**
 * Waits for fonts and for running CSS transitions and animations to finish, for at most 3 s
 * so a page that keeps animating cannot hold a test until it times out.
 */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const finished = Promise.all(
      document
        .getAnimations()
        // Infinite animations (spinners, carets) never finish, and scroll-driven ones only
        // move when the page scrolls; only wait for time-based animations that end.
        .filter(
          (animation) =>
            animation.timeline === document.timeline &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
    await Promise.race([finished, new Promise((resolve) => setTimeout(resolve, 3000))]);
  });
}
