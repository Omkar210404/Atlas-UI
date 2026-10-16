import { useEffect, useState } from 'react';
import type { ComponentDocs } from 'atlas-ui/docs/types';
import { loadDocs, peekDocs } from '../catalog';

/** Loads a component's docs module. `undefined` while loading, `null` if not charted. */
export function useDocs(category: string, slug: string): ComponentDocs | null | undefined {
  const [state, setState] = useState(() => ({ key: `${category}/${slug}`, docs: peekDocs(category, slug) }));
  const key = `${category}/${slug}`;
  const docs = state.key === key ? state.docs : peekDocs(category, slug);

  useEffect(() => {
    if (docs !== undefined) return;
    let alive = true;
    loadDocs(category, slug).then((result) => {
      if (alive) setState({ key, docs: result });
    });
    return () => {
      alive = false;
    };
  }, [category, slug, key, docs]);

  return docs;
}
