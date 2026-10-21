import { expect, test, type Page } from '@playwright/test';
import { usePrefs } from './helpers';

const title = (page: Page) => page.locator('#level-title');

test.describe('Spatial view', () => {
  test.beforeEach(async ({ page }) => {
    await usePrefs(page, { view: 'spatial' });
  });

  test('zooms from the atlas to a spec sheet and back out with Escape', async ({ page }) => {
    await page.goto('');
    await expect(title(page)).toHaveText('An atlas of interfaces.');

    await page.getByRole('link', { name: /^Navigation:/ }).click();
    await expect(title(page)).toHaveText('Navigation');
    await expect(page).toHaveURL(/\/atlas-ui\/navigation$/);

    await page.getByRole('link', { name: 'Command palette', exact: true }).click();
    await expect(title(page)).toHaveText('Command palette');

    await page.getByRole('link', { name: 'Open the spec sheet' }).click();
    await expect(page.getByRole('tablist', { name: 'Reference' })).toBeVisible();
    await expect(page).toHaveURL(/command-palette\/spec$/);

    await page.locator('body').press('Escape');
    await expect(page).toHaveURL(/command-palette$/);
    await page.locator('body').press('Escape');
    await expect(title(page)).toHaveText('Navigation');
    // Zooming out returns focus to the card you came from.
    await expect(page.getByRole('link', { name: 'Command palette', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(title(page)).toHaveText('An atlas of interfaces.');
    await expect(page.getByRole('link', { name: /^Navigation:/ })).toBeFocused();
  });

  test('moves between regions with arrow keys and enters with Enter', async ({ page }) => {
    await page.goto('');
    const inputs = page.getByRole('link', { name: /^Inputs and forms:/ });
    await inputs.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('link', { name: /^Navigation:/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('Navigation');
  });

  test('jumps anywhere from the command palette', async ({ page }) => {
    await page.goto('');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('combobox')).toBeFocused();
    await page.keyboard.type('tab bar spec');
    await page.keyboard.press('Enter');
    await expect(title(page)).toHaveText('Tab bar');
    await expect(page.getByRole('tablist', { name: 'Reference' })).toBeVisible();
  });

  test('switches to the Simple view and back', async ({ page }) => {
    await page.goto('');
    await page.getByRole('radio', { name: 'Simple' }).check();
    await expect(page.getByRole('heading', { level: 2, name: 'Navigation' })).toBeVisible();
    await expect(page.locator('svg.chart')).toHaveCount(0);
    await page.getByRole('radio', { name: 'Spatial' }).check();
    await expect(page.locator('svg.chart')).toBeVisible();
  });

  test('changes theme from the dock', async ({ page }) => {
    await page.goto('');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.getByRole('button', { name: 'Dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day');
  });
});

test.describe('Simple view', () => {
  test.beforeEach(async ({ page }) => {
    await usePrefs(page, { view: 'simple' });
  });

  test('navigates with plain links', async ({ page }) => {
    await page.goto('');
    await expect(page.locator('svg.chart')).toHaveCount(0);
    await page.getByRole('link', { name: 'Navigation', exact: true }).click();
    await expect(title(page)).toHaveText('Navigation');
    await page.getByRole('link', { name: 'Floating dock' }).click();
    await expect(title(page)).toHaveText('Floating dock');
    await page.goBack();
    await expect(title(page)).toHaveText('Navigation');
  });

  test('links every type in a region', async ({ page }) => {
    await page.goto('feedback');
    await expect(page.getByRole('link', { name: 'Toast stack', exact: true })).toBeVisible();
  });
});

test.describe('Automatic Simple view', () => {
  test('is used under reduced motion, with a way back', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => window.localStorage.removeItem('atlas-ui:prefs'));
    await page.goto('');
    await expect(page.getByText('Your device asks for reduced motion')).toBeVisible();
    await expect(page.locator('svg.chart')).toHaveCount(0);
    await page.getByRole('button', { name: 'Use the Spatial view' }).click();
    await expect(page.locator('svg.chart')).toBeVisible();
  });
});

test.describe('Addresses', () => {
  test('a deep link loads directly', async ({ page }) => {
    await usePrefs(page, {});
    await page.goto('navigation/breadcrumb-trail/spec');
    await expect(title(page)).toHaveText('Breadcrumb trail');
  });

  test('an unknown address explains itself', async ({ page }) => {
    await usePrefs(page, {});
    await page.goto('somewhere/that/does/not/exist');
    await expect(title(page)).toHaveText('This part of the chart is blank.');
  });
});
