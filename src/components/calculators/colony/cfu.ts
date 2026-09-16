import type { PlateCount } from "./types";

/**
 * CFU maths. Pure — no React, no DOM — exercised by
 * `node --test scripts/colony-counter.test.mts`.
 *
 *   CFU/mL = colonies ÷ (dilution fraction × volume plated in mL)
 *
 * The dilution is the fraction of the original sample in the plated liquid:
 * 10⁻⁴ is 0.0001. That is the same as the older "colonies × dilution factor ÷
 * volume" with a dilution factor of 10 000.
 */

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export type DilutionPreset = { label: string; exponent: number };

export const DILUTION_PRESETS: DilutionPreset[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  label: `10${superscript(-n)}`,
  exponent: -n,
}));

export const VOLUME_PRESETS = [0.01, 0.1, 1];

/** A commonly used practical counting range — not a universal rule. */
export const COUNT_RANGE = { low: 30, high: 300 };


export function superscript(n: number): string {
  return String(n)
    .split("")
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join("");
}

/** Removes float dust (8899999.999999999 → 8900000) without hiding real digits. */
export function clean(value: number): number {
  return Number(value.toPrecision(12));
}

export type CfuResult =
  | { ok: true; cfuPerMl: number; divisor: number }
  | { ok: false; error: string };

export function calculateCfu({ colonies, dilution, volumeMl }: PlateCount): CfuResult {
  if (!Number.isFinite(colonies) || colonies < 0 || !Number.isInteger(colonies)) {
    return { ok: false, error: "The colony count must be a whole number, 0 or more." };
  }
  if (!Number.isFinite(dilution) || dilution <= 0 || dilution > 1) {
    return { ok: false, error: "Enter a valid dilution — a fraction greater than 0 and at most 1, such as 10⁻⁴." };
  }
  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    return { ok: false, error: "Volume plated must be greater than 0." };
  }
  const divisor = clean(dilution * volumeMl);
  return { ok: true, cfuPerMl: clean(colonies / divisor), divisor };
}

/**
 * Parses a typed dilution: "0.0001", "1e-4", "10^-4", "10-4", "10⁻⁴" or
 * "1/10000". Returns the fraction, or an error message.
 */
export function parseDilution(raw: string): { value: number | null; error?: string } {
  const text = raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => Object.keys(SUPERSCRIPT).find((k) => SUPERSCRIPT[k] === c) ?? c)
    .replace(/[−–]/g, "-")
    .replace(/[×x*]/gi, "×");
  if (text === "") return { value: null, error: "Enter a dilution." };

  let value: number | null = null;
  let m: RegExpMatchArray | null;
  if ((m = text.match(/^10\^?(-\d{1,2})$/))) value = 10 ** Number(m[1]);
  else if ((m = text.match(/^(\d+(?:\.\d+)?)×10\^?(-?\d{1,2})$/))) value = Number(m[1]) * 10 ** Number(m[2]);
  else if ((m = text.match(/^1\/(\d+(?:\.\d+)?)$/))) value = Number(m[1]) > 0 ? 1 / Number(m[1]) : null;
  else if (/^(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(text)) value = Number(text);

  if (value === null || !Number.isFinite(value)) {
    return { value: null, error: "Enter a valid dilution, e.g. 0.0001, 1e-4 or 10^-4." };
  }
  if (value <= 0) return { value: null, error: "The dilution must be greater than 0." };
  if (value > 1) {
    return {
      value: null,
      error: "Enter the dilution as a fraction (at most 1). A dilution factor of 10 000 is a dilution of 10⁻⁴.",
    };
  }
  return { value: clean(value) };
}

export function parseVolume(raw: string): { value: number | null; error?: string } {
  const text = raw.trim();
  if (text === "") return { value: null, error: "Enter the volume plated." };
  if (!/^(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(text)) return { value: null, error: "Enter a number in mL." };
  const value = Number(text);
  if (!(value > 0)) return { value: null, error: "Volume plated must be greater than 0." };
  return { value };
}

/** "8.9 × 10⁶" — up to three significant figures, trailing zeros dropped. */
export function formatScientific(value: number, sig = 3): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  let mantissa = Number((value / 10 ** exponent).toPrecision(sig));
  let exp = exponent;
  // 9.999 rounds to 10.0 → 1.0 × 10^(e+1)
  if (Math.abs(mantissa) >= 10) {
    mantissa /= 10;
    exp += 1;
  }
  const m = String(Number(mantissa.toPrecision(sig)));
  return exp === 0 ? m : `${m} × 10${superscript(exp)}`;
}

/** "8,900,000" — whole CFU when ≥ 1, otherwise up to three significant figures. */
export function formatPlain(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1) return Math.round(value).toLocaleString("en-US");
  return String(Number(value.toPrecision(3)));
}

/** How a dilution is written back to the student: a power of ten when it is one. */
export function formatDilution(value: number): string {
  const exponent = Math.log10(value);
  if (Math.abs(exponent - Math.round(exponent)) < 1e-9) return `10${superscript(Math.round(exponent))}`;
  return formatScientific(value);
}

export type CountWarning = { kind: "low" | "high"; title: string; text: string };

export function countWarning(colonies: number): CountWarning | null {
  const note =
    "A commonly used practical counting range is around 30–300 colonies, but the appropriate range depends on the laboratory method and protocol.";
  if (colonies < COUNT_RANGE.low) {
    return {
      kind: "low",
      title: "Low colony count",
      text: `The plate contains relatively few colonies. Consider whether another dilution/plate is appropriate for your laboratory protocol. ${note}`,
    };
  }
  if (colonies > COUNT_RANGE.high) {
    return {
      kind: "high",
      title: "High colony count",
      text: `The plate may be crowded. Individual colonies may be difficult to distinguish. ${note}`,
    };
  }
  return null;
}
