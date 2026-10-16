import { fileURLToPath } from 'node:url';
import type { Alias } from 'vite';

const lib = fileURLToPath(new URL('./packages/atlas-ui/src/', import.meta.url));

/** Resolves `atlas-ui/...` imports to library source, mirroring the published `exports` map. */
export const atlasAliases: Alias[] = [
  { find: /^atlas-ui\/tokens\.css$/, replacement: `${lib}tokens/tokens.css` },
  { find: /^atlas-ui\/base\.css$/, replacement: `${lib}styles/base.css` },
  { find: /^atlas-ui\/(tokens|primitives|motion|icons|docs)\/(.*)$/, replacement: `${lib}$1/$2` },
  { find: /^atlas-ui\/([a-z-]+)\/([a-z-]+)$/, replacement: `${lib}components/$1/$2` },
];
