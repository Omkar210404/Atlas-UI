import { expect, test } from '@playwright/test';
import { charted, settle, themes, usePrefs } from './helpers';

for (const theme of themes) {
  for (const { category, slug } of charted) {
    test(`${slug} (${theme})`, async ({ page }) => {
      await usePrefs(page, { theme });
      await page.goto(`${category}/${slug}/spec`);
      const stage = page.locator('.stage__frame').first();
      await expect(stage).toBeVisible();
      await settle(page);
      await expect(stage).toHaveScreenshot(`${slug}-${theme}.png`, { animations: 'disabled' });
    });
  }

  test(`atlas (${theme})`, async ({ page }) => {
    await usePrefs(page, { theme });
    await page.goto('');
    await settle(page);
    await expect(page).toHaveScreenshot(`atlas-${theme}.png`, { animations: 'disabled' });
  });

  test(`navigation region (${theme})`, async ({ page }) => {
    await usePrefs(page, { theme });
    await page.goto('navigation');
    await expect(page.locator('.type-card__preview').first()).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot(`region-navigation-${theme}.png`, {
      animations: 'disabled',
    });
  });
}
