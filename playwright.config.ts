import { defineConfig, devices } from '@playwright/test';

const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : [['list']],
  // Baselines depend on the OS's font rendering; Linux baselines from CI are the reference.
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    baseURL: 'http://localhost:4173/atlas-ui/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/atlas-ui/',
    reuseExistingServer: !ci,
    timeout: 60_000,
  },
  projects: [
    { name: 'axe', testMatch: /axe\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'visual',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'smoke-chromium', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'smoke-firefox', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'smoke-webkit', testMatch: /smoke\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
  ],
});
