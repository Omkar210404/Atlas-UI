import { readFile } from 'node:fs/promises';
import { createCssVariablesTheme, createHighlighter, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';

const SUFFIX = '?highlight';

/**
 * `import source from './File.tsx?highlight'` yields `{ code, html }` with the file's source
 * and its syntax-highlighted HTML. Highlighting runs at build time; token colours are CSS
 * variables (`--code-*`), so the same HTML follows both themes and no highlighter ships
 * to the browser.
 */
export function highlight(): Plugin {
  let highlighter: Promise<Highlighter> | null = null;
  const theme = createCssVariablesTheme({ name: 'atlas', variablePrefix: '--code-', fontStyle: true });

  return {
    name: 'atlas-highlight',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith(SUFFIX)) return null;
      const file = id.slice(0, -SUFFIX.length);
      this.addWatchFile(file);
      const code = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
      const lang = file.endsWith('.css') ? 'css' : file.endsWith('.tsx') ? 'tsx' : 'ts';
      highlighter ??= createHighlighter({ themes: [theme], langs: ['tsx', 'ts', 'css'] });
      const html = (await highlighter).codeToHtml(code, { lang, theme: 'atlas' });
      return `export const code = ${JSON.stringify(code)};\nexport const html = ${JSON.stringify(html)};\nexport default { code, html };`;
    },
  };
}
