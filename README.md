# strsimkit

<!-- ALL-CONTRIBUTORS-BADGE:START --><!-- ALL-CONTRIBUTORS-BADGE:END -->
[![npm version](https://img.shields.io/npm/v/strsimkit.svg)](https://www.npmjs.com/package/strsimkit)
[![npm downloads](https://img.shields.io/npm/dm/strsimkit.svg)](https://www.npmjs.com/package/strsimkit)
[![CI](https://img.shields.io/github/actions/workflow/status/trananhtung/strsimkit/ci.yml?branch=main)](https://github.com/trananhtung/strsimkit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero-dependency string similarity and distance algorithms — the maintained replacement for the archived `string-similarity` package.**

Inspired by Python's [`textdistance`](https://github.com/life4/textdistance) (34 algorithms) and [`jellyfish`](https://github.com/jamesturk/jellyfish), now in pure TypeScript with no runtime dependencies.

```ts
import { levenshteinSimilarity, jaroWinkler, bestMatch, soundex } from "strsimkit";

jaroWinkler("MARTHA", "MARHTA");           // 0.961
levenshteinSimilarity("kitten", "sitting"); // 0.571

bestMatch("appl", ["apple", "banana", "apricot"]);
// { bestMatch: "apple", rating: 0.889, index: 0 }

soundex("Robert") === soundex("Rupert"); // true — sound alike
```

## Why strsimkit?

The dominant npm string-similarity package (`string-similarity`, 2.18M weekly downloads) was **deprecated and archived in 2023** — yet it still has millions of weekly downloads because no maintained replacement existed. `strsimkit` fills that gap with a comprehensive, TypeScript-native, zero-dependency library.

## Features

- **Edit distance**: Levenshtein (O(n) space), Damerau-Levenshtein (with transpositions)
- **Jaro / Jaro-Winkler**: industry-standard record linkage algorithms
- **Token-based**: Dice/bigram (Python difflib ratio), Jaccard, Overlap coefficient
- **Hamming**: bit-error distance, with padding for unequal lengths
- **LCS**: Longest Common Subsequence similarity + Longest Common Substring length
- **Phonetic**: Soundex, Double Metaphone, `soundsLike()` predicate
- **`bestMatch()`**: drop-in replacement for `string-similarity`'s API
- **`rankMatches()`**: rate + sort all candidates, return top-N
- All similarity functions are normalized to **[0, 1]**
- Zero dependencies, TypeScript-first, ESM + CJS, tree-shakeable

## Install

```bash
npm install strsimkit
```

## Usage

### Drop-in `string-similarity` replacement

```ts
import { bestMatch, levenshteinSimilarity } from "strsimkit";

// Was: stringSimilarity.findBestMatch(query, candidates)
const result = bestMatch("javascript", ["python", "javascript", "typescript"]);
result.bestMatch;  // "javascript"
result.rating;     // 1
result.index;      // 1

// Was: stringSimilarity.compareTwoStrings(a, b)
levenshteinSimilarity("hello", "helo"); // 0.889
```

### Edit distance algorithms

```ts
import { levenshtein, levenshteinSimilarity, damerauLevenshtein } from "strsimkit";

levenshtein("kitten", "sitting");         // 3
levenshteinSimilarity("kitten", "sitting"); // 0.571

// Damerau-Levenshtein counts transpositions as 1 edit
damerauLevenshtein("abc", "acb"); // 1  (swap b↔c)
levenshtein("abc", "acb");        // 2  (substitute + substitute)
```

### Jaro / Jaro-Winkler

```ts
import { jaro, jaroWinkler } from "strsimkit";

jaro("MARTHA", "MARHTA");        // 0.944
jaroWinkler("MARTHA", "MARHTA"); // 0.961  — higher for common prefix
jaroWinkler("DWAYNE", "DUANE");  // 0.840
```

### Token-based similarity

```ts
import { dice, jaccard, overlap } from "strsimkit";

// Dice bigram — same as Python difflib SequenceMatcher.ratio()
dice("night", "nacht"); // 0.25

// Jaccard on character n-grams
jaccard("abc", "abd");          // 0.5   (bigrams)
jaccard("abc", "abd", 1);       // 0.667 (unigrams)

// Overlap coefficient
overlap("abc", "abcd");         // 1.0  (smaller set is subset)
```

### Hamming distance

```ts
import { hamming, hammingPad, hammingSimilarity } from "strsimkit";

hamming("karolin", "kathrin"); // 3
hammingPad("abc", "abcde");    // 2  (pads shorter with null bytes)
hammingSimilarity("abc", "aXc"); // 0.667
```

### LCS similarity

```ts
import { lcsLength, lcsSimilarity, longestCommonSubstring } from "strsimkit";

lcsLength("ABCBDAB", "BDCABA");    // 4
lcsSimilarity("hello", "hallo");   // 0.8
longestCommonSubstring("abcdef", "bcdfgh"); // 3 ("bcd")
```

### Phonetic algorithms

```ts
import { soundex, doubleMetaphone, soundsLike } from "strsimkit";

soundex("Robert"); // "R163"
soundex("Rupert"); // "R163" — same code!
soundsLike("Robert", "Rupert"); // true

const [primary, secondary] = doubleMetaphone("Smith");
```

### `bestMatch` and `rankMatches`

```ts
import { bestMatch, rankMatches, jaroWinkler } from "strsimkit";

// Best match with default (Levenshtein similarity)
bestMatch("hello", ["helo", "world", "hell"]);
// { bestMatch: "hell", rating: 0.8, index: 2 }

// Best match with custom algorithm
bestMatch("hello", ["helo", "jello"], jaroWinkler);

// Rank all candidates
rankMatches("night", ["nacht", "night", "knight"]);
// [{ candidate: "night", rating: 1 }, { candidate: "knight", rating: 0.857 }, ...]
```

## API

| Export | Description |
|--------|-------------|
| `levenshtein(a, b)` | Edit distance (insert/delete/substitute). |
| `levenshteinSimilarity(a, b)` | Normalized [0,1] Levenshtein. |
| `damerauLevenshtein(a, b)` | Edit distance including transpositions. |
| `jaro(a, b)` | Jaro similarity [0,1]. |
| `jaroWinkler(a, b, p?)` | Jaro-Winkler similarity [0,1]. |
| `dice(a, b)` | Sørensen-Dice bigram similarity [0,1]. |
| `jaccard(a, b, n?)` | Jaccard n-gram similarity [0,1]. |
| `overlap(a, b, n?)` | Overlap coefficient [0,1]. |
| `hamming(a, b)` | Hamming distance (equal length required). |
| `hammingPad(a, b)` | Hamming distance with padding. |
| `hammingSimilarity(a, b)` | Normalized [0,1] Hamming. |
| `lcsLength(a, b)` | Longest Common Subsequence length. |
| `lcsSimilarity(a, b)` | LCS-based similarity [0,1]. |
| `longestCommonSubstring(a, b)` | Length of longest common contiguous substring. |
| `soundex(s)` | Soundex phonetic code (4 chars). |
| `doubleMetaphone(s)` | `[primary, secondary]` Double Metaphone codes. |
| `soundsLike(a, b)` | `true` if Soundex codes match. |
| `bestMatch(query, candidates, fn?)` | Best candidate + score + index. |
| `rankMatches(query, candidates, fn?)` | All candidates sorted by score desc. |

## vs. alternatives

| Package | TypeScript | ESM | Algorithms | Phonetic | Maintained |
|---------|-----------|-----|------------|----------|------------|
| **strsimkit** | ✅ | ✅ | 12+ | ✅ | ✅ |
| string-similarity | ❌ | ❌ | 1 | ❌ | ❌ archived 2023 |
| natural | partial | ❌ | many | ✅ | ⚠️ heavy |
| talisman | partial | ✅ | many | ✅ | ⚠️ last release 2022 |

## Contributors ✨

Contributions of any kind are welcome! See the [contributing guide](https://github.com/all-contributors/all-contributors) and add yourself via `@all-contributors please add @<username> for <contributions>`.

<!-- ALL-CONTRIBUTORS-LIST:START --><!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT © [trananhtung](https://github.com/trananhtung)
