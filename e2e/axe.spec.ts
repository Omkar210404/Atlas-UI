import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { charted, settle, themes, usePrefs } from './helpers';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function expectNoViolations(page: Page, context: string) {
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
  );
  expect(summary, `axe violations on ${context}`).toEqual([]);
}

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    const pages: Array<{ name: string; path: string; view?: 'spatial' | 'simple' }> = [
      { name: 'atlas (spatial)', path: '' },
      { name: 'atlas (simple)', path: '', view: 'simple' },
      { name: 'region, charted (spatial)', path: 'navigation' },
      { name: 'region, uncharted (spatial)', path: 'feedback' },
      { name: 'region (simple)', path: 'navigation', view: 'simple' },
      { name: 'principles', path: 'principles' },
      { name: 'not found', path: 'nowhere/at/all/here' },
    ];

    for (const entry of pages) {
      test(entry.name, async ({ page }) => {
        await usePrefs(page, { theme, view: entry.view ?? 'spatial' });
        await page.goto(entry.path);
        await expect(page.locator('#level-title')).toBeVisible();
        await expectNoViolations(page, entry.name);
      });
    }

    test('command palette open', async ({ page }) => {
      await usePrefs(page, { theme });
      await page.goto('');
      await page.getByRole('button', { name: 'Search' }).click();
      await expect(page.getByRole('combobox')).toBeFocused();
      await page.keyboard.type('tab');
      await expectNoViolations(page, 'command palette');
    });

    for (const { category, slug } of charted) {
      test(`${slug}: type page`, async ({ page }) => {
        await usePrefs(page, { theme });
        await page.goto(`${category}/${slug}`);
        await expect(page.locator('.specimen').first()).toBeVisible();
        await expectNoViolations(page, `${slug} type page`);
      });

      test(`${slug}: spec sheet, every reference tab`, async ({ page }) => {
        await usePrefs(page, { theme });
        await page.goto(`${category}/${slug}/spec`);
        await expect(page.getByRole('tablist', { name: 'Reference' })).toBeVisible();
        await expectNoViolations(page, `${slug} spec sheet`);
        for (const tab of ['Source', 'Keyboard', 'Accessibility', 'Reduced motion']) {
          await page.getByRole('tab', { name: tab, exact: true }).click();
          if (tab === 'Source') await expect(page.locator('.code-panel__body pre')).toBeVisible();
          await expectNoViolations(page, `${slug} spec sheet, ${tab} tab`);
        }
      });

      test(`${slug}: spec sheet, both themes side by side`, async ({ page }) => {
        await usePrefs(page, { theme });
        await page.goto(`${category}/${slug}/spec`);
        await page.getByRole('radio', { name: 'Both' }).check();
        await expect(page.locator('.stage__frame')).toHaveCount(2);
        await expectNoViolations(page, `${slug} preview in both themes`);
      });
    }
  });
}
