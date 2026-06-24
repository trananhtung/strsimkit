/** Build a sorted array of all overlapping n-grams from string `s`. */
function ngrams(s: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i <= s.length - n; i++) out.push(s.slice(i, i + n));
  return out;
}

/**
 * Sørensen-Dice coefficient (bigram similarity) in [0, 1].
 * The algorithm used by Python's `difflib.SequenceMatcher` ratio.
 * Fast and works well for short strings.
 */
export function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const aBigrams = ngrams(a, 2);
  const bMap = new Map<string, number>();
  for (const bg of ngrams(b, 2)) bMap.set(bg, (bMap.get(bg) ?? 0) + 1);

  let intersection = 0;
  for (const bg of aBigrams) {
    const cnt = bMap.get(bg) ?? 0;
    if (cnt > 0) {
      intersection++;
      bMap.set(bg, cnt - 1);
    }
  }

  return (2 * intersection) / (aBigrams.length + (b.length - 1));
}

/**
 * Jaccard similarity on character n-gram sets in [0, 1].
 * J(A, B) = |A ∩ B| / |A ∪ B|
 *
 * @param n - n-gram size (default 2).
 */
export function jaccard(a: string, b: string, n = 2): number {
  if (a === b) return 1;
  if (a.length < n && b.length < n) return a === b ? 1 : 0;

  const aSet = new Set(ngrams(a, n));
  const bSet = new Set(ngrams(b, n));

  let intersection = 0;
  for (const g of aSet) if (bSet.has(g)) intersection++;
  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * Overlap coefficient (Szymkiewicz-Simpson) in [0, 1].
 * min(|A|, |B|) / (|A ∩ B|) — 1 if smaller set is subset of larger.
 *
 * @param n - n-gram size (default 2).
 */
export function overlap(a: string, b: string, n = 2): number {
  if (a === b) return 1;
  if (a.length < n || b.length < n) return 0;

  const aSet = new Set(ngrams(a, n));
  const bSet = new Set(ngrams(b, n));

  let intersection = 0;
  for (const g of aSet) if (bSet.has(g)) intersection++;
  const minSize = Math.min(aSet.size, bSet.size);
  return minSize === 0 ? 0 : intersection / minSize;
}
