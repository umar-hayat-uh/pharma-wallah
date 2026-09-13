/**
 * Number parsing, formatting and unit tables shared by the laboratory
 * calculators (yield, recovery, hemocytometry, density bottle, dilution, UV).
 *
 * Pure functions, no I/O — this file ships inside the offline Android app.
 */

/** Set to "true" only by the Android build (mobile/next.config.mjs). */
export const IS_MOBILE_APP = process.env.NEXT_PUBLIC_IS_MOBILE_APP === "true";

/**
 * A text field's value as a finite number, or null.
 *
 * `parseFloat("12abc")` is 12 and `Number("")` is 0 — both would let a
 * half-typed or empty field silently become a number in a lab result, so this
 * accepts only a string that is entirely a number.
 */
export function toNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * The validation message for one numeric field, or undefined when it is fine.
 *
 * `show` is false until the student presses Calculate or types into the
 * field, so an untouched empty form is not a wall of red — but a negative
 * number is flagged the moment it is typed.
 */
export function fieldError(
  raw: string,
  {
    show,
    allowZero = false,
    required = true,
    max,
  }: { show: boolean; allowZero?: boolean; required?: boolean; max?: number },
): string | undefined {
  const value = toNumber(raw);
  if (raw.trim() === "") return required && show ? "Required." : undefined;
  if (value === null) return "Enter a number.";
  if (value < 0) return "Cannot be negative.";
  if (value === 0 && !allowZero) return "Must be greater than zero.";
  if (max !== undefined && value > max) return `Must be at most ${max}.`;
  return undefined;
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

/** 1.23e-5 → "1.23 × 10⁻⁵" — how a lab notebook writes it, not how JS does. */
export function formatScientific(value: number, sig = 3): string {
  const [mantissa, exponent] = value.toExponential(Math.max(sig - 1, 0)).split("e");
  const exp = String(Number(exponent)).split("").map((c) => SUPERSCRIPT[c] ?? c).join("");
  return `${mantissa} × 10${exp}`;
}

/**
 * Display formatting with a fixed number of significant figures.
 *
 * Very large or very small magnitudes switch to scientific notation; everything
 * else is grouped ("7,500") with trailing zeros trimmed. Round only for display —
 * callers keep full precision for any further arithmetic.
 */
export function formatSig(value: number, sig = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e9 || abs < 1e-4) return formatScientific(value, sig);
  const rounded = Number(value.toPrecision(sig));
  // Digits after the point needed to keep `sig` figures: 0.01234 needs 5, 7,500 needs 0.
  const fractionDigits = sig - 1 - Math.floor(Math.log10(Math.abs(rounded)));
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: Math.min(Math.max(fractionDigits, 0), 20),
  });
}

/** Fixed decimals with thousands separators, e.g. percentages "87.35". */
export function formatFixed(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ─── Units ──────────────────────────────────────────────────────────────── */

/** Mass units → grams. */
export const MASS_TO_G = { "µg": 1e-6, mg: 1e-3, g: 1, kg: 1e3 } as const;
export type MassUnit = keyof typeof MASS_TO_G;

/** Volume units → millilitres. */
export const VOLUME_TO_ML = { "µL": 1e-3, mL: 1, L: 1e3 } as const;
export type VolumeUnit = keyof typeof VOLUME_TO_ML;

/** Amount-of-substance units → moles. */
export const AMOUNT_TO_MOL = { "µmol": 1e-6, mmol: 1e-3, mol: 1 } as const;
export type AmountUnit = keyof typeof AMOUNT_TO_MOL;

/**
 * A link to another calculator, with values carried in the query string.
 *
 * The Android export uses `trailingSlash: true` and Capacitor resolves
 * `/slug/` to `slug/index.html`, so the app needs the slash; the web does not
 * (Next redirects it away, keeping the query, but a redirect is a wasted hop).
 */
export function calculatorHref(slug: string, params: Record<string, string | number>): string {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  ).toString();
  return `/calculation-tools/${slug}${IS_MOBILE_APP ? "/" : ""}${query ? `?${query}` : ""}`;
}

/** Reads the page's query string on the client. Returns an empty map during SSR. */
export function readQuery(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}
