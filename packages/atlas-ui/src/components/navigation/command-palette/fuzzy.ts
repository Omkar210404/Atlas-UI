export interface FuzzyResult {
  score: number;
  /** Indices in the text that matched, for highlighting. */
  indices: number[];
}

const WORD_START = 8;
const FIRST_CHAR = 4;
const CONSECUTIVE = 7;
const MATCH = 1;
const GAP = 0.6;
const GAP_OPEN = 3;
const PREFIX = 12;

function isWordStart(text: string, index: number): boolean {
  if (index === 0) return true;
  const previous = text[index - 1] ?? '';
  const current = text[index] ?? '';
  if (/[\s\-_./:(]/.test(previous)) return true;
  return previous === previous.toLowerCase() && current !== current.toLowerCase();
}

/**
 * Scores how well `query` matches `text` as an in-order subsequence. Prefers matches at
 * word starts and in consecutive runs, and penalises gaps. Dynamic programming finds the
 * best alignment, not just the first one. Returns null when some character is missing.
 */
export function fuzzyScore(query: string, text: string): FuzzyResult | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const m = q.length;
  const n = t.length;
  if (m === 0) return { score: 0, indices: [] };
  if (m > n) return null;

  // score[i][j]: best score for q[0..i] with q[i] matched at t[j]; from[i][j]: where q[i-1] sat.
  const score: Float64Array[] = [];
  const from: Int32Array[] = [];
  for (let i = 0; i < m; i++) {
    score.push(new Float64Array(n).fill(-Infinity));
    from.push(new Int32Array(n).fill(-1));
  }

  for (let j = 0; j < n; j++) {
    if (t[j] !== q[0]) continue;
    let s = MATCH;
    if (isWordStart(text, j)) s += WORD_START;
    if (j === 0) s += FIRST_CHAR;
    score[0]![j] = s - j * 0.1;
  }

  for (let i = 1; i < m; i++) {
    let best = -Infinity;
    let bestAt = -1;
    for (let j = i; j < n; j++) {
      // best[k] for k < j - 1, with the gap penalty applied as we move right
      const previous = score[i - 1]![j - 1]!;
      if (best !== -Infinity) best -= GAP;
      if (t[j] === q[i]) {
        let s = -Infinity;
        let at = -1;
        if (previous !== -Infinity) {
          s = previous + MATCH + CONSECUTIVE;
          at = j - 1;
        }
        if (best !== -Infinity) {
          const gapped = best - GAP_OPEN + MATCH + (isWordStart(text, j) ? WORD_START : 0);
          if (gapped > s) {
            s = gapped;
            at = bestAt;
          }
        }
        score[i]![j] = s;
        from[i]![j] = at;
      }
      if (previous > best) {
        best = previous;
        bestAt = j - 1;
      }
    }
  }

  let end = -1;
  let total = -Infinity;
  for (let j = 0; j < n; j++) {
    if (score[m - 1]![j]! > total) {
      total = score[m - 1]![j]!;
      end = j;
    }
  }
  if (end === -1) return null;

  const indices: number[] = [];
  for (let i = m - 1, j = end; i >= 0 && j >= 0; i--) {
    indices.unshift(j);
    j = from[i]![j]!;
  }
  if (t.startsWith(q)) total += PREFIX;
  return { score: total, indices };
}

export interface SearchableItem {
  label: string;
  keywords?: readonly string[] | undefined;
}

/**
 * Matches a whole query against an item. Each space-separated word must match the label
 * or one of the keywords; keyword matches count for less and are not highlighted.
 */
export function matchItem(query: string, item: SearchableItem): FuzzyResult | null {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { score: 0, indices: [] };
  let total = 0;
  const indices = new Set<number>();
  for (const word of words) {
    const onLabel = fuzzyScore(word, item.label);
    let best = onLabel ? onLabel.score : -Infinity;
    for (const keyword of item.keywords ?? []) {
      const onKeyword = fuzzyScore(word, keyword);
      if (onKeyword && onKeyword.score * 0.6 > best) best = onKeyword.score * 0.6;
    }
    if (best === -Infinity) return null;
    total += best;
    if (onLabel && onLabel.score >= best) onLabel.indices.forEach((i) => indices.add(i));
  }
  return { score: total, indices: [...indices].sort((a, b) => a - b) };
}
