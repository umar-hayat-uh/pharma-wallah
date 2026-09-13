/**
 * Molar mass from a molecular formula, using IUPAC standard atomic weights
 * (abridged, 2021 — the same values as the Molecular Weight Finder tool).
 *
 * This is the only "database" the laboratory calculators use, and on purpose:
 * a molar mass computed from a formula the student typed is reproducible and
 * checkable, works offline inside the APK, and cannot silently return the
 * wrong compound the way a name search against a remote service can. The
 * student's own molecular weight always wins — this only offers a suggestion.
 *
 * Pure, no I/O.
 */

// Radioactive elements without a standard atomic weight are omitted rather
// than given a mass-number guess; a formula using one is reported as unknown.
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.18, Na: 22.99, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
  Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82,
  Sn: 118.71, Sb: 121.76, Te: 127.6, I: 126.9, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91,
  Ce: 140.12, Pr: 140.91, Nd: 144.24, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.5,
  Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84,
  Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59, Tl: 204.38, Pb: 207.2,
  Bi: 208.98, Th: 232.04, Pa: 231.04, U: 238.03,
};

export type FormulaResult =
  | { ok: true; molarMass: number; elements: Record<string, number> }
  | { ok: false; error: string };

/**
 * Parses formulas such as `C9H8O4`, `Ca(OH)2`, `K4[Fe(CN)6]`, `CuSO4·5H2O`
 * and `CuSO4.5H2O`. Charges and isotope labels are not supported and are
 * reported as errors rather than ignored.
 */
export function molarMassFromFormula(input: string): FormulaResult {
  const formula = input.replace(/\s+/g, "");
  if (!formula) return { ok: false, error: "Enter a formula." };
  if (/[+\-^]/.test(formula)) {
    return { ok: false, error: "Charges are not supported — enter the neutral formula." };
  }

  const total: Record<string, number> = {};
  // Hydrates and adducts: "CuSO4·5H2O" is CuSO4 plus 5 × H2O.
  for (const rawPart of formula.split(/[·•.*]/)) {
    if (!rawPart) return { ok: false, error: "Misplaced hydrate dot." };
    const match = rawPart.match(/^(\d+(?:\.\d+)?)?(.*)$/)!;
    const multiplier = match[1] ? Number(match[1]) : 1;
    const parsed = parseGroup(match[2]);
    if (!parsed.ok) return parsed;
    for (const [symbol, count] of Object.entries(parsed.elements)) {
      total[symbol] = (total[symbol] ?? 0) + count * multiplier;
    }
  }

  let molarMass = 0;
  for (const [symbol, count] of Object.entries(total)) {
    molarMass += ATOMIC_WEIGHTS[symbol] * count;
  }
  if (!(molarMass > 0)) return { ok: false, error: "The formula contains no atoms." };
  return { ok: true, molarMass, elements: total };
}

function parseGroup(
  source: string,
): { ok: true; elements: Record<string, number> } | { ok: false; error: string } {
  const stack: Record<string, number>[] = [{}];
  const closers: string[] = [];
  let i = 0;

  const readCount = () => {
    const match = source.slice(i).match(/^\d+(?:\.\d+)?/);
    if (!match) return 1;
    i += match[0].length;
    return Number(match[0]);
  };

  while (i < source.length) {
    const char = source[i];
    if (char === "(" || char === "[" || char === "{") {
      closers.push(char === "(" ? ")" : char === "[" ? "]" : "}");
      stack.push({});
      i += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      if (closers.pop() !== char || stack.length < 2) {
        return { ok: false, error: "Brackets do not match." };
      }
      i += 1;
      const count = readCount();
      const group = stack.pop()!;
      const parent = stack[stack.length - 1];
      for (const [symbol, n] of Object.entries(group)) parent[symbol] = (parent[symbol] ?? 0) + n * count;
    } else if (/[A-Z]/.test(char)) {
      const symbol = source.slice(i).match(/^[A-Z][a-z]?/)![0];
      // "Co" is cobalt but "CO" is carbon + oxygen: only take the lowercase
      // letter if the two-letter symbol exists.
      const resolved = symbol.length === 2 && !(symbol in ATOMIC_WEIGHTS) ? symbol[0] : symbol;
      if (!(resolved in ATOMIC_WEIGHTS)) {
        return { ok: false, error: `Unknown element symbol "${resolved}".` };
      }
      i += resolved.length;
      const count = readCount();
      const top = stack[stack.length - 1];
      top[resolved] = (top[resolved] ?? 0) + count;
    } else {
      return { ok: false, error: `Unexpected character "${char}". Element symbols start with a capital letter.` };
    }
  }

  if (stack.length !== 1) return { ok: false, error: "A bracket is not closed." };
  return { ok: true, elements: stack[0] };
}
