/**
 * Longest Common Subsequence length. O(m·n) time, O(min(m,n)) space.
 */
export function lcsLength(a: string, b: string): number {
  if (a === b) return a.length;
  if (a.length === 0 || b.length === 0) return 0;
  if (a.length > b.length) [a, b] = [b, a];

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(m + 1).fill(0);
  let curr = new Array<number>(m + 1).fill(0);

  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      curr[i] = a[i - 1] === b[j - 1]
        ? prev[i - 1]! + 1
        : Math.max(prev[i]!, curr[i - 1]!);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[m]!;
}

/**
 * LCS-based similarity in [0, 1].
 * 2 * lcs(a, b) / (len(a) + len(b)) — equivalent to Python difflib ratio.
 */
export function lcsSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const total = a.length + b.length;
  if (total === 0) return 1;
  return (2 * lcsLength(a, b)) / total;
}

/**
 * Length of the Longest Common Substring (contiguous). O(m·n) time.
 */
export function longestCommonSubstring(a: string, b: string): number {
  if (a === b) return a.length;
  if (a.length === 0 || b.length === 0) return 0;

  const m = a.length;
  const n = b.length;
  let max = 0;
  let prev = new Array<number>(n + 1).fill(0);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1]! + 1 : 0;
      if (curr[j]! > max) max = curr[j]!;
    }
    prev = curr;
    curr = new Array<number>(n + 1).fill(0);
  }

  return max;
}
