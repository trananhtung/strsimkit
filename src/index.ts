// Edit distance
export { levenshtein, levenshteinSimilarity, damerauLevenshtein } from "./levenshtein.js";

// Jaro / Jaro-Winkler
export { jaro, jaroWinkler } from "./jaro.js";

// Token-based
export { dice, jaccard, overlap } from "./token.js";

// Hamming
export { hamming, hammingPad, hammingSimilarity } from "./hamming.js";

// LCS / longest common substring
export { lcsLength, lcsSimilarity, longestCommonSubstring } from "./lcs.js";

// Phonetic
export { soundex, doubleMetaphone, soundsLike } from "./phonetic.js";

// Best-match utilities
export { bestMatch, rankMatches } from "./bestMatch.js";
export type { MatchResult, RatedMatch, SimilarityFn } from "./bestMatch.js";
