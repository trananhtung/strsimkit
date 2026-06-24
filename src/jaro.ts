/**
 * Jaro similarity in [0, 1].
 * Based on matching characters within a window and transpositions.
 */
export function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matchDist = Math.max(Math.floor(Math.max(a.length, b.length) / 2) - 1, 0);

  const aMatched = new Array<boolean>(a.length).fill(false);
  const bMatched = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
}

/**
 * Jaro-Winkler similarity in [0, 1].
 * Boosts the Jaro score for strings sharing a common prefix (up to 4 chars).
 *
 * @param p - Scaling factor for the common prefix (default 0.1, max 0.25).
 */
export function jaroWinkler(a: string, b: string, p = 0.1): number {
  const jaroScore = jaro(a, b);
  const prefixLen = Math.min(
    commonPrefixLen(a, b),
    4,
  );
  return jaroScore + prefixLen * p * (1 - jaroScore);
}

function commonPrefixLen(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
