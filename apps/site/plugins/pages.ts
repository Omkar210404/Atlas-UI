import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/** Preloads the two fonts the first screen needs, using their hashed build names. */
export function preloadFonts(names: string[]): Plugin {
  let base = '/';
  return {
    name: 'atlas-preload-fonts',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        const bundle = context.bundle ?? {};
        return Object.values(bundle)
          .filter(
            (chunk) =>
              chunk.type === 'asset' &&
              chunk.fileName.endsWith('.woff2') &&
              names.some((name) => chunk.fileName.includes(`/${name}-`)),
          )
          .map((chunk) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
              href: `${base}${chunk.fileName}`,
            },
            injectTo: 'head-prepend' as const,
          }));
      },
    },
  };
}

/**
 * GitHub Pages serves 404.html for unknown paths. Making it a copy of index.html lets the
 * client router handle deep links such as /atlas-ui/navigation/tab-bar on reload.
 */
export function spaFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'atlas-spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async writeBundle() {
      await copyFile(join(outDir, 'index.html'), join(outDir, '404.html'));
    },
  };
}
