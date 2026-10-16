import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const src = fileURLToPath(new URL('./src/', import.meta.url));

// One entry per public module, so each component, icon and primitive can be imported alone.
const entries = Object.fromEntries(
  globSync(
    [
      'components/*/*/index.ts',
      'icons/*.tsx',
      'primitives/*.ts',
      'motion/*.ts',
      'tokens/{tokens,contrast,spring}.ts',
    ],
    { cwd: src },
  )
    .filter((file) => !file.includes('.test.'))
    .map((file) => [file.replace(/\.(ts|tsx)$/, '').replace(/\\/g, '/'), `${src}${file}`]),
);

/**
 * Keeps `import './x.css'` in the output (so importing a component brings its styles) and
 * copies every stylesheet next to the module that imports it.
 */
function keepCss(): Plugin {
  return {
    name: 'atlas-keep-css',
    generateBundle() {
      for (const file of globSync('**/*.css', { cwd: src })) {
        this.emitFile({
          type: 'asset',
          fileName: file.replace(/\\/g, '/'),
          source: readFileSync(`${src}${file}`, 'utf8'),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), keepCss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: { entry: entries, formats: ['es'] },
    rolldownOptions: {
      external: (id) => /^react($|\/)|^react-dom($|\/)/.test(id) || id.endsWith('.css'),
      output: {
        preserveModules: true,
        preserveModulesRoot: src,
        entryFileNames: '[name].js',
      },
    },
  },
});
