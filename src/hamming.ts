/**
 * Hamming distance — number of positions where two equal-length strings differ.
 * Throws `RangeError` if lengths differ (use `hammingPad` for unequal lengths).
 */
export function hamming(a: string, b: string): number {
  if (a.length !== b.length) {
    throw new RangeError(`hamming: strings must have equal length (${a.length} vs ${b.length})`);
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

/**
 * Hamming distance on strings of unequal length — pads the shorter string with
 * null bytes on the right so lengths match, then counts differing positions.
 */
export function hammingPad(a: string, b: string): number {
  const len = Math.max(a.length, b.length);
  let dist = 0;
  for (let i = 0; i < len; i++) {
    if ((a[i] ?? "\0") !== (b[i] ?? "\0")) dist++;
  }
  return dist;
}

/**
 * Normalized Hamming similarity in [0, 1] (1 = identical).
 * Uses `hammingPad` internally so strings need not be equal length.
 */
export function hammingSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const len = Math.max(a.length, b.length);
  if (len === 0) return 1;
  return 1 - hammingPad(a, b) / len;
}
