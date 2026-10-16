/**
 * Type-to-select for lists and menus: typing letters moves to the next item whose label
 * starts with them. Letters typed within `timeout` ms build up a longer search string;
 * repeating one letter cycles through items that start with it.
 */
export function createTypeahead(timeout = 600) {
  let buffer = '';
  let last = 0;

  return function search(key: string, labels: readonly string[], current: number): number {
    if (key.length !== 1 || key === ' ') return -1;
    const now = Date.now();
    buffer = now - last > timeout ? key : buffer + key;
    last = now;
    const query = buffer.toLowerCase();
    const repeated = query.split('').every((c) => c === query[0]);
    const needle = repeated ? query[0]! : query;
    const start = repeated || buffer.length === 1 ? current + 1 : current;
    for (let i = 0; i < labels.length; i++) {
      const index = (start + i) % labels.length;
      if (labels[index]?.toLowerCase().startsWith(needle)) return index;
    }
    return -1;
  };
}
