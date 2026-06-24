import { levenshteinSimilarity } from "./levenshtein.js";

export interface MatchResult {
  /** The candidate string that scored highest. */
  bestMatch: string;
  /** Similarity score in [0, 1]. */
  rating: number;
  /** Index of `bestMatch` in the candidates array. */
  index: number;
}

export interface RatedMatch {
  candidate: string;
  rating: number;
}

export type SimilarityFn = (a: string, b: string) => number;

/**
 * Find the best matching string from `candidates` for the `query`.
 *
 * Drop-in replacement for the deprecated `string-similarity` package's API.
 *
 * @param query - The string to match against.
 * @param candidates - Pool of strings to search.
 * @param fn - Similarity function (default: levenshteinSimilarity).
 * @returns The best match with its score and index.
 */
export function bestMatch(
  query: string,
  candidates: string[],
  fn: SimilarityFn = levenshteinSimilarity,
): MatchResult {
  if (candidates.length === 0) {
    throw new RangeError("bestMatch: candidates array must not be empty");
  }

  let bestIdx = 0;
  let bestRating = -Infinity;

  for (let i = 0; i < candidates.length; i++) {
    const rating = fn(query, candidates[i]!);
    if (rating > bestRating) {
      bestRating = rating;
      bestIdx = i;
    }
  }

  return {
    bestMatch: candidates[bestIdx]!,
    rating: bestRating,
    index: bestIdx,
  };
}

/**
 * Rate every candidate against `query` and return results sorted by score
 * descending. Useful when you need the top-N matches.
 *
 * @param query - The string to compare.
 * @param candidates - Pool of strings to rate.
 * @param fn - Similarity function (default: levenshteinSimilarity).
 */
export function rankMatches(
  query: string,
  candidates: string[],
  fn: SimilarityFn = levenshteinSimilarity,
): RatedMatch[] {
  return candidates
    .map((candidate) => ({ candidate, rating: fn(query, candidate) }))
    .sort((a, b) => b.rating - a.rating);
}
