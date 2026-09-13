/**
 * Display formatting for worked calculation steps. Display only — callers keep
 * full precision for arithmetic (rule: round only for display).
 */

import { formatSig } from "../lab-math";

/** A computed value in a worked step: 6 significant figures. */
export function num(value: number, sig = 6): string {
  // A typographic minus, as a lab record prints it — "-0.0005" reads as a dash.
  return formatSig(value, sig).replace(/^-/, "−");
}

/** A value inside a substitution: negatives in brackets, "(−0.012)". */
export function paren(value: number | string, sig = 6): string {
  const text = (typeof value === "number" ? num(value, sig) : value.trim()).replace(/^-/, "−");
  return text.startsWith("−") ? `(${text})` : text;
}

/** "+ 0.0123" or "− 0.0123" — the sign of a term written as a student would. */
export function signedTerm(value: number, sig = 6): string {
  return value < 0 ? `− ${num(Math.abs(value), sig)}` : `+ ${num(value, sig)}`;
}

/** Y = mX + c */
export function equationMXC(m: number, c: number, sig = 6): string {
  return `Y = ${num(m, sig)}X ${signedTerm(c, sig)}`;
}

/** Y = a + bX */
export function equationABX(a: number, b: number, sig = 6): string {
  return `Y = ${num(a, sig)} ${signedTerm(b, sig)}X`;
}
