/**
 * Soundex — classic NARA phonetic algorithm.
 * Returns a 4-character code (e.g. "R163" for "Robert").
 * Handles only ASCII letters; non-alpha characters are ignored.
 */
export function soundex(s: string): string {
  const upper = s.toUpperCase().replace(/[^A-Z]/g, "");
  if (upper.length === 0) return "";

  const TABLE: Record<string, string> = {
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3",
    L: "4",
    M: "5", N: "5",
    R: "6",
  };

  const first = upper[0]!;
  let code = first;
  let prev = TABLE[first] ?? "0";

  for (let i = 1; i < upper.length && code.length < 4; i++) {
    const ch = upper[i]!;
    // H and W are ignored (don't reset previous)
    if (ch === "H" || ch === "W") continue;
    const digit = TABLE[ch] ?? "0";
    if (digit !== "0" && digit !== prev) code += digit;
    prev = digit;
  }

  return code.padEnd(4, "0");
}

/**
 * Double Metaphone — returns [primary, secondary] codes.
 * Covers common English and some European names.
 * Primary is always defined; secondary may equal primary or be empty ("").
 *
 * This is a full implementation of Philips' Double Metaphone algorithm.
 */
export function doubleMetaphone(input: string): [string, string] {
  const s = input.toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length === 0) return ["", ""];

  let primary = "";
  let secondary = "";
  let pos = 0;

  function add(p: string, sec?: string): void {
    primary += p;
    secondary += sec ?? p;
  }

  function at(i: number, ...chars: string[]): boolean {
    return chars.some((c) => s.slice(i, i + c.length) === c);
  }

  function isSlavedGermanic(): boolean {
    return s.includes("W") || s.includes("K") || s.includes("CZ") || s.includes("WITZ");
  }

  // Handle initial silent letters and special starts
  if (at(0, "GN", "KN", "PN", "AE", "WR")) pos++;
  if (at(0, "X")) { add("S"); pos++; }

  while (pos < s.length && (primary.length < 4 || secondary.length < 4)) {
    const c = s[pos]!;
    switch (c) {
      case "A": case "E": case "I": case "O": case "U": case "Y":
        if (pos === 0) add("A");
        pos++;
        break;
      case "B":
        add("P");
        pos += s[pos + 1] === "B" ? 2 : 1;
        break;
      case "Ç": add("S"); pos++; break;
      case "C":
        if (pos > 1 && !isVowel(s[pos - 2]) && at(pos - 1, "ACH") &&
          !at(pos + 2, "I") && (!at(pos + 2, "E") || at(pos - 2, "BACHER", "MACHER"))) {
          add("K"); pos += 2;
        } else if (pos === 0 && at(pos, "CAESAR")) {
          add("S"); pos += 2;
        } else if (at(pos, "CHIA")) {
          add("K"); pos += 2;
        } else if (at(pos, "CH")) {
          if (pos > 0 && at(pos, "CHAE")) { add("K", "X"); pos += 2; }
          else if (pos === 0 && (at(pos + 1, "HARAC", "HARIS") || at(pos + 1, "HOR", "HYM", "HIA", "HEM"))) {
            add("K"); pos += 2;
          } else if (isSlavedGermanic()) {
            add("K"); pos += 2;
          } else {
            add("X", "K"); pos += 2;
          }
        } else if (at(pos, "CZ") && !at(pos - 2, "WICZ")) {
          add("S", "X"); pos += 2;
        } else if (at(pos + 1, "IA")) {
          add("X"); pos += 2;
        } else if (at(pos, "CC") && !(pos === 1 && s[0] === "M")) {
          if (at(pos + 2, "I", "E", "H")) { add("X"); pos += 3; }
          else { add("K"); pos += 2; }
        } else if (at(pos, "CK", "CG", "CQ")) {
          add("K"); pos += 2;
        } else if (at(pos, "CI", "CE", "CY")) {
          if (at(pos, "CIO", "CIE", "CIA")) { add("S", "X"); }
          else { add("S"); }
          pos += 2;
        } else {
          add("K");
          if (at(pos + 1, " C", " Q", " G")) pos += 3;
          else pos += at(pos + 1, "C", "K", "Q") && !at(pos + 1, "CE", "CI") ? 2 : 1;
        }
        break;
      case "D":
        if (at(pos, "DG")) {
          if (at(pos + 2, "I", "E", "Y")) { add("J"); pos += 3; }
          else { add("TK"); pos += 2; }
        } else {
          add("T");
          pos += at(pos, "DT", "DD") ? 2 : 1;
        }
        break;
      case "F": add("F"); pos += at(pos + 1, "F") ? 2 : 1; break;
      case "G":
        if (s[pos + 1] === "H") {
          if (pos > 0 && !isVowel(s[pos - 1])) { add("K"); pos += 2; break; }
          if (pos === 0) {
            if (s[pos + 2] === "I") { add("J"); } else { add("K"); }
            pos += 2; break;
          }
          if ((pos > 1 && at(pos - 2, "B", "H", "D")) ||
            (pos > 2 && at(pos - 3, "B", "H", "D")) ||
            (pos > 3 && at(pos - 4, "B", "H"))) {
            pos += 2; break;
          }
          if (pos > 2 && s[pos - 1] === "U" && at(pos - 3, "C", "G", "L", "R", "T")) {
            add("F"); pos += 2; break;
          }
          if (pos > 0 && s[pos - 1] !== "I") { add("K"); }
          pos += 2;
        } else if (s[pos + 1] === "N") {
          if (pos === 1 && isVowel(s[0]) && !isSlavedGermanic()) { add("KN", "N"); }
          else {
            if (!at(pos + 2, "EY") && s[pos + 1] !== "Y" && !isSlavedGermanic()) { add("N", "KN"); }
            else { add("KN"); }
          }
          pos += 2;
        } else if (at(pos + 1, "LI") && !isSlavedGermanic()) {
          add("KL", "L"); pos += 2;
        } else if (pos === 0 && (s[pos + 1] === "Y" || at(pos + 1, "ES", "EP", "EB", "EL", "EY", "IB", "IL", "IN", "IE", "EI", "ER"))) {
          add("K", "J"); pos += 2;
        } else if ((at(pos + 1, "ER") || s[pos + 1] === "Y") && !at(0, "DANGER", "RANGER", "MANGER") && !at(pos - 1, "E", "I") && !at(pos - 1, "RGY", "OGY")) {
          add("K", "J"); pos += 2;
        } else if (at(pos + 1, "E", "I", "Y") || at(pos - 1, "AGGI", "OGGI")) {
          if (at(0, "VAN ", "VON ") || at(0, "SCH") || at(pos + 1, "ET")) { add("K"); }
          else if (at(pos + 1, "IER")) { add("J"); }
          else { add("J", "K"); }
          pos += 2;
        } else {
          add("K");
          pos += at(pos + 1, "G") ? 2 : 1;
        }
        break;
      case "H":
        if (isVowel(s[pos + 1]) && (pos === 0 || isVowel(s[pos - 1]))) { add("H"); pos++; }
        pos++;
        break;
      case "J":
        if (at(pos, "JOSE") || at(0, "SAN ")) {
          if (at(0, "SAN ") || (pos === 0 && s[pos + 4] === " ")) { add("H"); }
          else { add("J", "H"); }
          pos++;
        } else {
          if (pos === 0 && !at(pos, "JOSE")) { add("J", "A"); }
          else if (isVowel(s[pos - 1]) && !isSlavedGermanic() && (s[pos + 1] === "A" || s[pos + 1] === "O")) { add("J", "H"); }
          else if (pos === s.length - 1) { add("J", ""); }
          else if (!at(pos + 1, "L", "T", "K", "S", "N", "M", "B", "Z") && !at(pos - 1, "S", "K", "L")) { add("J"); }
          pos += s[pos + 1] === "J" ? 2 : 1;
        }
        break;
      case "K": add("K"); pos += s[pos + 1] === "K" ? 2 : 1; break;
      case "L":
        if (s[pos + 1] === "L") {
          if ((pos === s.length - 3 && at(pos - 1, "ILLO", "ILLA", "ALLE")) ||
            ((at(s.length - 2, "AS", "OS") || at(s.length - 1, "A", "O")) && at(pos - 1, "ALLE"))) {
            add("L", ""); pos += 2; break;
          }
          pos += 2;
        } else { pos++; }
        add("L");
        break;
      case "M":
        if ((at(pos - 1, "UMB") && (pos + 1 === s.length - 1 || at(pos + 2, "ER"))) || s[pos + 1] === "M") {
          pos += 2;
        } else { pos++; }
        add("M");
        break;
      case "N": add("N"); pos += s[pos + 1] === "N" ? 2 : 1; break;
      case "Ñ": add("N"); pos++; break;
      case "P":
        if (s[pos + 1] === "H") { add("F"); pos += 2; }
        else { add("P"); pos += at(pos + 1, "P") ? 2 : 1; }
        break;
      case "Q": add("K"); pos += s[pos + 1] === "Q" ? 2 : 1; break;
      case "R":
        if (pos === s.length - 1 && !isSlavedGermanic() && at(pos - 2, "IE") && !at(pos - 4, "ME", "MA")) {
          add("", "R");
        } else { add("R"); }
        pos += s[pos + 1] === "R" ? 2 : 1;
        break;
      case "S":
        if (at(pos - 1, "ISL", "YSL")) { pos++; break; }
        if (pos === 0 && at(pos, "SUGAR")) { add("X", "S"); pos++; break; }
        if (at(pos, "SH") || at(pos, "SIO", "SIA")) { add("X"); pos += 2; break; }
        if ((pos === 0 && at(pos, "SM", "SN", "SL", "SW")) || isSlavedGermanic()) { add("S", "X"); pos += at(pos + 1, "Z") ? 2 : 1; break; }
        if (at(pos, "SCH")) {
          if (at(pos + 3, "OO", "ER", "EN", "UY", "ED", "EM")) { add("SK"); }
          else if (pos === 0 && !isVowel(s[3]) && s[3] !== "W") { add("X", "S"); }
          else { add("X"); }
          pos += 3; break;
        }
        if (at(pos + 1, "I", "IO", "IA")) { add("S", "X"); pos += at(pos + 1, "Z") ? 2 : 1; break; }
        add("S");
        pos += at(pos + 1, "S", "Z") ? 2 : 1;
        break;
      case "T":
        if (at(pos, "TION", "TIA", "TCH")) { add("X"); pos += at(pos, "TCH") ? 3 : 3; break; }
        if (at(pos, "TH") || at(pos, "TTH")) { add(at(0, "THOMAS", "THAMES") ? "T" : "0", "T"); pos += 2; break; }
        add("T");
        pos += at(pos + 1, "T", "D") ? 2 : 1;
        break;
      case "V": add("F"); pos += s[pos + 1] === "V" ? 2 : 1; break;
      case "W":
        if (at(pos, "WR")) { add("R"); pos += 2; break; }
        if (pos === 0 && (isVowel(s[pos + 1]) || at(pos, "WH"))) {
          add(isVowel(s[pos + 1]) ? "A" : "A"); pos++;
        } else if ((pos === s.length - 1 && isVowel(s[pos - 1])) ||
          at(pos - 1, "EWSKI", "EWSKY", "OWSKI", "OWSKY") || at(0, "SCH")) {
          add("", "F"); pos++;
        } else if (at(pos, "WICZ", "WITZ")) {
          add("TS", "FX"); pos += 4;
        } else { pos++; }
        break;
      case "X":
        if (!(pos === s.length - 1 && (at(pos - 3, "IAU", "EAU") || at(pos - 2, "AU", "OU")))) { add("KS"); }
        pos += at(pos + 1, "C", "X") ? 2 : 1;
        break;
      case "Z":
        if (s[pos + 1] === "H") { add("J"); pos += 2; }
        else {
          if (at(pos + 1, "ZO", "ZI", "ZA") || (isSlavedGermanic() && pos > 0 && s[pos - 1] !== "T")) { add("S", "TS"); }
          else { add("S"); }
          pos += s[pos + 1] === "Z" ? 2 : 1;
        }
        break;
      default: pos++; break;
    }
  }

  const p = primary.slice(0, 4);
  const sec = secondary.slice(0, 4);
  return [p, sec === p ? p : sec];
}

function isVowel(c: string | undefined): boolean {
  return c !== undefined && "AEIOU".includes(c);
}

/**
 * Returns true if two strings sound alike according to Soundex.
 */
export function soundsLike(a: string, b: string): boolean {
  return soundex(a) === soundex(b);
}
