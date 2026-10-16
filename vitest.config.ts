import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { atlasAliases } from './vite.aliases.ts';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: atlasAliases, dedupe: ['react', 'react-dom'] },
  optimizeDeps: {
    include: [
      'motion/react',
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      '@testing-library/react',
    ],
  },
  test: {
    include: [
      'motion/react','packages/**/*.test.{ts,tsx}', 'apps/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
  },
});
