/**
 * Drug stability kinetics from a Time vs Absorbance practical.
 *
 * Reproduces the Pharm-D accelerated-degradation practical ("effect of % drug
 * remaining at 50 °C on the stability of Procaine HCl"): absorbance is turned
 * into % drug remaining with Beer–Lambert (A ∝ C), the three linearised plots
 * are fitted by least squares, the order with the highest R² is chosen, and k,
 * t½ and t90 follow from that order with C₀ = 100 %.
 *
 * Nothing about the order is assumed — on the sheet's own data zero order wins
 * by a small margin over first order, which is exactly the case a hard-coded
 * "first order" would get wrong.
 *
 * Pure — no React, no DOM, no I/O — so it ships in the offline apps and is
 * checked on its own by `node --test scripts/stability-kinetics.test.mts`.
 * Imports reach past the `lab-analysis` barrel because that barrel pulls in
 * React UI (MEMORY.md gotcha 69).
 */

import { toNumber } from "@/components/calculators/lab-math";
import { duplicateIndexes, fail, linearFit, ok, type Checked, type LinearFit } from "@/components/calculators/lab-analysis/math";

/** Three points is the least that makes R² mean anything: two always give R² = 1. */
export const MIN_OBSERVATIONS = 3;
export const MAX_OBSERVATIONS = 30;

/** C₀ when the data are expressed as % remaining — the practical's convention. */
export const C0_PERCENT = 100;
/** The constants the practical sheet writes, used as written (ln 2 ≈ 0.693, −ln 0.9 ≈ 0.10536). */
export const LN2_SHEET = 0.693;
export const T90_FIRST_ORDER = 0.10536;
/** Below this R² gap the plots are reported as barely distinguishable. */
export const CLOSE_R2_MARGIN = 0.01;

export type Order = "zero" | "first" | "second";
export const ORDERS: Order[] = ["zero", "first", "second"];

export const ORDER_LABEL: Record<Order, string> = { zero: "Zero", first: "First", second: "Second" };
export const ORDER_PLOT: Record<Order, string> = {
  zero: "% Remaining vs Time",
  first: "ln(% Remaining) vs Time",
  second: "1/% Remaining vs Time",
};

export type ObservationCells = { time: string; absorbance: string };

export type ObservationRow = {
  index: number;
  /** Entered values, kept as typed for printing a lab record verbatim. */
  timeRaw: string;
  absorbanceRaw: string;
  time: number;
  absorbance: number;
  /** (Aₜ / A₀) × 100 */
  percent: number;
  /** ln(% remaining) — natural log, as the first-order plot uses. */
  lnPercent: number;
  /** 1 / (% remaining) */
  inversePercent: number;
};

export type OrderFit = {
  order: Order;
  fit: LinearFit;
  /** k from the slope: −slope for zero and first order, +slope for second. */
  k: number;
};

export type Derived = {
  order: Order;
  k: number;
  /** Null with a reason when k ≤ 0 — no degradation, so no half-life. */
  halfLife: Checked<number>;
  t90: Checked<number>;
};

export type StabilityAnalysis = {
  /** Keyed `${rowIndex}:time` / `${rowIndex}:absorbance`. */
  cellErrors: Record<string, string>;
  a0Error?: string;
  temperatureError?: string;
  /** Reasons nothing can be calculated. */
  blocking: string[];
  a0: number | null;
  rows: ObservationRow[] | null;
  /** One per order, in zero → first → second order. A failed fit carries its reason. */
  fits: { order: Order; result: Checked<OrderFit> }[] | null;
  /** The order with the highest R². */
  best: OrderFit | null;
  /** R² of the best order minus the next best — how decisively it won. */
  margin: number | null;
  runnerUp: Order | null;
  derived: Derived | null;
  warnings: string[];
};

/* ─── Units ──────────────────────────────────────────────────────────────── */

/** k's unit for an order and time unit, as the practical writes it. */
export function kUnit(order: Order, timeUnit: string): string {
  if (order === "zero") return `% ${timeUnit}⁻¹`;
  if (order === "first") return `${timeUnit}⁻¹`;
  return `%⁻¹ ${timeUnit}⁻¹`;
}

/* ─── Half-life and shelf life ───────────────────────────────────────────── */

/**
 * t½ and t90 for an order, with C₀ = 100 %.
 *
 *   zero:   t½ = C₀ / 2k          t90 = 0.10 C₀ / k
 *   first:  t½ = 0.693 / k        t90 = 0.10536 / k
 *   second: t½ = 1 / (k C₀)       t90 = 1/(90k) − 1/(100k) = 1 / (900k)
 */
export function deriveFromK(order: Order, k: number): Derived {
  if (!(k > 0)) {
    const why = k === 0
      ? "k = 0: the fitted line is flat, so no degradation was measured and the half-life and shelf life are not defined."
      : `k is negative (${order === "second" ? "the slope is negative" : "the slope is positive"}): % drug remaining rises with time in this fit, which is not degradation. Check A₀ and the absorbance readings.`;
    return { order, k, halfLife: fail(why), t90: fail(why) };
  }
  if (order === "zero") return { order, k, halfLife: ok(C0_PERCENT / (2 * k)), t90: ok((0.1 * C0_PERCENT) / k) };
  if (order === "first") return { order, k, halfLife: ok(LN2_SHEET / k), t90: ok(T90_FIRST_ORDER / k) };
  return { order, k, halfLife: ok(1 / (k * C0_PERCENT)), t90: ok(1 / (k * 90) - 1 / (k * C0_PERCENT)) };
}

/**
 * % remaining predicted by an order's fitted line, back-transformed — for the
 * trend line on the % remaining graph. Null where the model leaves the
 * physical range (1/C ≤ 0 on a second-order line).
 */
export function predictPercent(fit: OrderFit, time: number): number | null {
  const y = fit.fit.intercept + fit.fit.slope * time;
  if (fit.order === "zero") return y;
  if (fit.order === "first") return Math.exp(y);
  return y > 0 ? 1 / y : null;
}

/* ─── Analysis ───────────────────────────────────────────────────────────── */

/**
 * Validate the inputs and compute everything.
 *
 * `show` is the Calculate-pressed flag: an empty field is only reported as
 * missing once the student has asked for an answer.
 */
export function analyseStability(
  a0Raw: string,
  temperatureRaw: string,
  observations: ObservationCells[],
  show: boolean,
): StabilityAnalysis {
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const blocking: string[] = [];
  const empty = { fits: null, best: null, margin: null, runnerUp: null, derived: null, rows: null };

  // ── Reference absorbance ──
  const a0 = toNumber(a0Raw);
  let a0Error: string | undefined;
  if (a0Raw.trim() === "") {
    if (show) a0Error = "Required.";
  } else if (a0 === null) a0Error = "Enter a number.";
  else if (a0 <= 0) a0Error = "A₀ must be greater than zero — every % remaining divides by it.";

  // ── Temperature: an experimental condition, printed, never used in the maths ──
  let temperatureError: string | undefined;
  if (temperatureRaw.trim() !== "" && toNumber(temperatureRaw) === null) temperatureError = "Enter a number.";

  // ── Observations ──
  const times: number[] = [];
  const absorbances: number[] = [];
  observations.forEach((row, index) => {
    const time = toNumber(row.time);
    const absorbance = toNumber(row.absorbance);

    if (row.time.trim() === "") {
      if (show) cellErrors[`${index}:time`] = "Required.";
    } else if (time === null) cellErrors[`${index}:time`] = "Enter a number.";
    else if (time < 0) cellErrors[`${index}:time`] = "Time cannot be negative.";

    if (row.absorbance.trim() === "") {
      if (show) cellErrors[`${index}:absorbance`] = "Required.";
    } else if (absorbance === null) cellErrors[`${index}:absorbance`] = "Enter a number.";
    // ln(% remaining) and 1/% remaining both need a positive value.
    else if (absorbance <= 0) cellErrors[`${index}:absorbance`] = "Must be greater than zero — ln and 1/x of % remaining need a positive value.";

    if (time !== null && time >= 0 && absorbance !== null && absorbance > 0) {
      times.push(time);
      absorbances.push(absorbance);
    }
  });

  if (observations.length < MIN_OBSERVATIONS) {
    blocking.push(`At least ${MIN_OBSERVATIONS} time points are needed — with two, every straight line fits perfectly (R² = 1) and the orders cannot be compared.`);
  }

  const complete =
    a0 !== null && a0Error === undefined && temperatureError === undefined &&
    times.length === observations.length && Object.keys(cellErrors).length === 0;

  if (!complete || blocking.length > 0) {
    return { cellErrors, a0Error, temperatureError, blocking, a0, warnings, ...empty };
  }

  const reference = a0 as number;
  const rows: ObservationRow[] = times.map((time, index) => {
    const percent = (absorbances[index] / reference) * 100;
    return {
      index,
      timeRaw: observations[index].time.trim(),
      absorbanceRaw: observations[index].absorbance.trim(),
      time,
      absorbance: absorbances[index],
      percent,
      lnPercent: Math.log(percent),
      inversePercent: 1 / percent,
    };
  });

  // ── Data checks that do not stop the calculation, but must not pass silently ──
  const duplicates = duplicateIndexes(times);
  if (duplicates.length > 0) {
    warnings.push(
      `Row${duplicates.length > 1 ? "s" : ""} ${duplicates.map((i) => i + 1).join(", ")} repeat${duplicates.length > 1 ? "" : "s"} a time already entered. Repeated readings are fitted as separate points.`,
    );
  }
  const above = rows.filter((row) => row.percent > 100);
  if (above.length > 0) {
    warnings.push(
      `${above.length === 1 ? "One reading is" : `${above.length} readings are`} above A₀, giving more than 100 % remaining (t = ${above.map((r) => r.timeRaw).join(", ")}). Check the reference absorbance and the blank.`,
    );
  }

  // ── The three linearised fits ──
  const series: Record<Order, number[]> = {
    zero: rows.map((r) => r.percent),
    first: rows.map((r) => r.lnPercent),
    second: rows.map((r) => r.inversePercent),
  };
  const fits = ORDERS.map((order) => {
    const fitted = linearFit(rows.map((r, i) => ({ x: r.time, y: series[order][i] })));
    if (!fitted.ok) return { order, result: fail<OrderFit>(fitted.error) };
    if (fitted.value.r2 === null) {
      return { order, result: fail<OrderFit>("Every value on this plot is the same, so SST = 0 and R² is undefined — no degradation was measured.") };
    }
    const k = order === "second" ? fitted.value.slope : -fitted.value.slope;
    return { order, result: ok<OrderFit>({ order, fit: fitted.value, k }) };
  });

  const usable = fits.flatMap((f) => (f.result.ok ? [f.result.value] : []));
  if (usable.length === 0) {
    const reason = fits[0].result.ok ? "" : fits[0].result.error;
    return { cellErrors, a0Error, temperatureError, blocking: [reason], a0, warnings, ...empty, rows };
  }

  // Highest R² wins. Sorting is stable, so an exact tie keeps the lower order.
  const ranked = [...usable].sort((a, b) => (b.fit.r2 as number) - (a.fit.r2 as number));
  const best = ranked[0];
  const runnerUp = ranked[1] ?? null;
  const margin = runnerUp ? (best.fit.r2 as number) - (runnerUp.fit.r2 as number) : null;

  if (runnerUp && margin !== null && margin < CLOSE_R2_MARGIN) {
    warnings.push(
      `${ORDER_LABEL[best.order]} and ${ORDER_LABEL[runnerUp.order].toLowerCase()} order fit almost equally well (R² differs by ${margin.toFixed(4)}). The order is chosen by the highest R², as the practical requires, but the data do not separate the two models strongly — more time points, or degradation followed further, would.`,
    );
  }

  const derived = deriveFromK(best.order, best.k);
  if (!derived.halfLife.ok) warnings.push(derived.halfLife.error);

  return {
    cellErrors, a0Error, temperatureError, blocking, a0, rows, fits, best,
    margin, runnerUp: runnerUp?.order ?? null, derived, warnings,
  };
}

/* ─── Interpretation ─────────────────────────────────────────────────────── */

/**
 * The practical's conclusion, filled in from the numbers. The last sentence is
 * fixed on purpose: an accelerated-temperature estimate is not a label shelf
 * life, and the record must say so.
 */
export function interpretation({
  drug,
  temperature,
  order,
  r2,
  rateConstant,
  halfLife,
  t90,
  falling,
}: {
  drug: string;
  temperature: string;
  order: Order;
  r2: string;
  rateConstant: string;
  halfLife: string;
  t90: string;
  /** Whether % remaining fell from the first to the last reading. */
  falling: boolean;
}): string[] {
  const at = temperature ? `At ${temperature} °C` : "Under the test conditions";
  return [
    `${at}, the % drug remaining of ${drug} ${falling ? "decreases with increasing time, indicating degradation of the drug" : "does not fall from the first reading to the last, so this data set shows no clear degradation"}. The reaction order is determined by comparing the linearity (R²) of zero-, first- and second-order kinetic plots; the model with the highest R² is taken as the best-fit kinetic order.`,
    `The experimentally determined order is ${ORDER_LABEL[order].toLowerCase()} order with R² = ${r2}.`,
    `${at}, the calculated rate constant is k = ${rateConstant}.`,
    `The estimated half-life is ${halfLife}.`,
    `The estimated shelf life (t90) is ${t90}.`,
    `These values are an experimental, accelerated-degradation estimate at ${temperature ? `${temperature} °C` : "the test temperature"}. They are not the labelled shelf life of ${drug}, which is set from long-term studies at the recommended storage condition.`,
  ];
}
