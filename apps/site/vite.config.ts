import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { atlasAliases } from '../../vite.aliases.ts';
import { highlight } from './plugins/highlight.ts';
import { preloadFonts, spaFallback } from './plugins/pages.ts';

export default defineConfig({
  // Pages serves a project site at /<repository name>/, so the deploy workflow passes the real
  // name (its case matters); local builds and tests use /atlas-ui/.
  base: process.env.SITE_BASE ?? '/atlas-ui/',
  plugins: [
    highlight(),
    react(),
    preloadFonts(['bricolage-grotesque', 'newsreader-italic']),
    spaFallback(),
  ],
  resolve: { alias: atlasAliases },
  build: {
    target: 'es2023',
    assetsInlineLimit: 0,
    reportCompressedSize: true,
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
