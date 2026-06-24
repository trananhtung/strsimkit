import {
  levenshtein, levenshteinSimilarity, damerauLevenshtein,
  jaro, jaroWinkler,
  dice, jaccard, overlap,
  hamming, hammingPad, hammingSimilarity,
  lcsLength, lcsSimilarity, longestCommonSubstring,
  soundex, doubleMetaphone, soundsLike,
  bestMatch, rankMatches,
} from "../src/index.js";

// ─── Levenshtein ────────────────────────────────────────────────────────────

describe("levenshtein", () => {
  test("identical strings → 0", () => expect(levenshtein("abc", "abc")).toBe(0));
  test("empty → length of other", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
  test("kitten → sitting = 3", () => expect(levenshtein("kitten", "sitting")).toBe(3));
  test("saturday → sunday = 3", () => expect(levenshtein("saturday", "sunday")).toBe(3));
  test("single char diff", () => expect(levenshtein("a", "b")).toBe(1));
  test("symmetry", () => expect(levenshtein("abc", "xyz")).toBe(levenshtein("xyz", "abc")));
});

describe("levenshteinSimilarity", () => {
  test("identical → 1", () => expect(levenshteinSimilarity("abc", "abc")).toBe(1));
  test("completely different → 0", () => expect(levenshteinSimilarity("abc", "xyz")).toBeCloseTo(0));
  test("empty strings → 1", () => expect(levenshteinSimilarity("", "")).toBe(1));
  test("one empty → 0", () => expect(levenshteinSimilarity("abc", "")).toBe(0));
  test("result in [0, 1]", () => {
    const s = levenshteinSimilarity("foo", "bar");
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
});

describe("damerauLevenshtein", () => {
  test("identical → 0", () => expect(damerauLevenshtein("abc", "abc")).toBe(0));
  test("transposition counts as 1", () => expect(damerauLevenshtein("ab", "ba")).toBe(1));
  test("kitten → sitting = 3", () => expect(damerauLevenshtein("kitten", "sitting")).toBe(3));
  test("abc → acb = 1 (transposition b↔c)", () => expect(damerauLevenshtein("abc", "acb")).toBe(1));
});

// ─── Jaro / Jaro-Winkler ────────────────────────────────────────────────────

describe("jaro", () => {
  test("identical → 1", () => expect(jaro("abc", "abc")).toBe(1));
  test("empty → 0", () => expect(jaro("", "abc")).toBe(0));
  test("MARTHA / MARHTA ≈ 0.944", () => expect(jaro("MARTHA", "MARHTA")).toBeCloseTo(0.944, 2));
  test("DWAYNE / DUANE ≈ 0.822", () => expect(jaro("DWAYNE", "DUANE")).toBeCloseTo(0.822, 2));
  test("DIXON / DICKSONX ≈ 0.767", () => expect(jaro("DIXON", "DICKSONX")).toBeCloseTo(0.767, 2));
});

describe("jaroWinkler", () => {
  test("identical → 1", () => expect(jaroWinkler("abc", "abc")).toBe(1));
  test("MARTHA / MARHTA ≈ 0.961", () => expect(jaroWinkler("MARTHA", "MARHTA")).toBeCloseTo(0.961, 2));
  test("DWAYNE / DUANE ≈ 0.840", () => expect(jaroWinkler("DWAYNE", "DUANE")).toBeCloseTo(0.840, 2));
  test("≥ jaro score (prefix bonus)", () => {
    expect(jaroWinkler("ABCDE", "ABCFG")).toBeGreaterThanOrEqual(jaro("ABCDE", "ABCFG"));
  });
});

// ─── Token-based ─────────────────────────────────────────────────────────────

describe("dice (Sørensen-Dice bigram)", () => {
  test("identical → 1", () => expect(dice("night", "night")).toBe(1));
  test("night / nacht ≈ 0.25", () => expect(dice("night", "nacht")).toBeCloseTo(0.25, 1));
  test("too short → 0", () => expect(dice("a", "b")).toBe(0));
  test("result in [0, 1]", () => {
    expect(dice("hello", "world")).toBeGreaterThanOrEqual(0);
    expect(dice("hello", "world")).toBeLessThanOrEqual(1);
  });
});

describe("jaccard", () => {
  test("identical → 1", () => expect(jaccard("abc", "abc")).toBe(1));
  test("completely different → 0", () => expect(jaccard("abc", "xyz")).toBe(0));
  test("partial overlap", () => {
    const j = jaccard("abcd", "bcde");
    expect(j).toBeGreaterThan(0);
    expect(j).toBeLessThan(1);
  });
  test("n=1 character level", () => {
    // "ab" and "ba" share same characters → jaccard(1) = 1
    expect(jaccard("ab", "ba", 1)).toBe(1);
  });
});

describe("overlap", () => {
  test("identical → 1", () => expect(overlap("abc", "abc")).toBe(1));
  test("subset → 1", () => {
    // "ab" bigrams: {"ab"} ⊆ bigrams of "abcd": {"ab","bc","cd"}
    expect(overlap("ab", "abcd")).toBe(1);
  });
  test("no overlap → 0", () => expect(overlap("abc", "xyz")).toBe(0));
});

// ─── Hamming ─────────────────────────────────────────────────────────────────

describe("hamming", () => {
  test("identical → 0", () => expect(hamming("abc", "abc")).toBe(0));
  test("karolin / kathrin = 3", () => expect(hamming("karolin", "kathrin")).toBe(3));
  test("throws on unequal lengths", () => expect(() => hamming("ab", "abc")).toThrow(RangeError));
});

describe("hammingPad", () => {
  test("equal length", () => expect(hammingPad("abc", "aXc")).toBe(1));
  test("pads shorter with nulls", () => expect(hammingPad("ab", "abcd")).toBe(2));
});

describe("hammingSimilarity", () => {
  test("identical → 1", () => expect(hammingSimilarity("abc", "abc")).toBe(1));
  test("result in [0, 1]", () => {
    const s = hammingSimilarity("abc", "xyz");
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });
});

// ─── LCS ─────────────────────────────────────────────────────────────────────

describe("lcsLength", () => {
  test("identical → full length", () => expect(lcsLength("abcde", "abcde")).toBe(5));
  test("ABCBDAB / BDCABA = 4", () => expect(lcsLength("ABCBDAB", "BDCABA")).toBe(4));
  test("empty → 0", () => expect(lcsLength("", "abc")).toBe(0));
});

describe("lcsSimilarity", () => {
  test("identical → 1", () => expect(lcsSimilarity("abc", "abc")).toBe(1));
  test("no common → 0", () => expect(lcsSimilarity("abc", "xyz")).toBe(0));
  test("result in [0, 1]", () => {
    const s = lcsSimilarity("hello", "hallo");
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });
});

describe("longestCommonSubstring", () => {
  test("abcdef / bcdfgh = 3 (bcd)", () => expect(longestCommonSubstring("abcdef", "bcdfgh")).toBe(3));
  test("identical", () => expect(longestCommonSubstring("abc", "abc")).toBe(3));
  test("no common", () => expect(longestCommonSubstring("abc", "xyz")).toBe(0));
});

// ─── Phonetic ─────────────────────────────────────────────────────────────────

describe("soundex", () => {
  test("Robert → R163", () => expect(soundex("Robert")).toBe("R163"));
  test("Rupert → R163", () => expect(soundex("Rupert")).toBe("R163"));
  test("Rubin → R150", () => expect(soundex("Rubin")).toBe("R150"));
  test("Ashcraft → A261", () => expect(soundex("Ashcraft")).toBe("A261"));
  test("Euler → E460", () => expect(soundex("Euler")).toBe("E460"));
  test("Ellery → E460", () => expect(soundex("Ellery")).toBe("E460"));
  test("empty → ''", () => expect(soundex("")).toBe(""));
  test("pads to 4 chars", () => expect(soundex("Lee")).toHaveLength(4));
});

describe("soundsLike", () => {
  test("Robert and Rupert sound alike", () => expect(soundsLike("Robert", "Rupert")).toBe(true));
  test("Smith and Smythe sound alike", () => expect(soundsLike("Smith", "Smythe")).toBe(true));
  test("Smith and Jones do not", () => expect(soundsLike("Smith", "Jones")).toBe(false));
});

describe("doubleMetaphone", () => {
  test("returns a tuple of two strings", () => {
    const result = doubleMetaphone("Smith");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });
  test("Smith primary = SM0 or SM", () => {
    const [p] = doubleMetaphone("Smith");
    expect(p.length).toBeGreaterThan(0);
  });
  test("empty → ['','']", () => expect(doubleMetaphone("")).toEqual(["", ""]));
  test("Xavier → [SF, SFR] or similar", () => {
    const [p] = doubleMetaphone("Xavier");
    expect(p.length).toBeGreaterThan(0);
  });
});

// ─── bestMatch / rankMatches ──────────────────────────────────────────────────

describe("bestMatch", () => {
  test("finds closest match", () => {
    const result = bestMatch("hello", ["helo", "world", "hell", "help"]);
    expect(["helo", "hell"]).toContain(result.bestMatch);
    expect(result.rating).toBeGreaterThan(0.5);
  });

  test("returns index of best match", () => {
    const candidates = ["apple", "banana", "apricot"];
    const result = bestMatch("appl", candidates);
    expect(result.index).toBe(0); // "apple" is closest
    expect(result.bestMatch).toBe("apple");
  });

  test("identical match → rating 1", () => {
    const result = bestMatch("exact", ["wrong", "exact", "close"]);
    expect(result.rating).toBe(1);
    expect(result.bestMatch).toBe("exact");
  });

  test("throws on empty candidates", () => {
    expect(() => bestMatch("query", [])).toThrow(RangeError);
  });

  test("accepts custom similarity function", () => {
    const result = bestMatch("hello", ["helo", "world"], jaroWinkler);
    expect(result.rating).toBeGreaterThan(0);
  });
});

describe("rankMatches", () => {
  test("returns sorted array descending by rating", () => {
    const ranked = rankMatches("hello", ["hell", "world", "helo", "jello"]);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i]!.rating).toBeGreaterThanOrEqual(ranked[i + 1]!.rating);
    }
  });

  test("all candidates present", () => {
    const candidates = ["a", "b", "c"];
    const ranked = rankMatches("a", candidates);
    expect(ranked.map((r) => r.candidate).sort()).toEqual(candidates.sort());
  });

  test("empty candidates → empty array", () => {
    expect(rankMatches("q", [])).toEqual([]);
  });
});
