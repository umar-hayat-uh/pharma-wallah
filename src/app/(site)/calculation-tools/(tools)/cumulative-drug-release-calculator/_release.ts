/**
 * Cumulative drug release with sample-withdrawal correction: validation and
 * the two correction methods, kept apart from the page so the maths can be
 * checked on its own. Pure — ships inside the offline Android app.
 *
 * Assumption behind both methods: every withdrawn sample is replaced with the
 * same volume of fresh medium, so the vessel volume V stays constant. Without
 * replacement V would shrink at every sampling and neither formula applies.
 */

// Leaf modules rather than the kit barrels, which pull in React components:
// this file stays runnable on its own in Node for checking the maths.
import { toNumber } from "@/components/calculators/lab-math";
import {
  concentrationFromAbsorbance,
  firstNonIncreasing,
  mean,
  parseReplicates,
} from "@/components/calculators/lab-analysis/math";

export const MIN_POINTS = 2;
export const MAX_POINTS = 20;
export const MIN_REPLICATES = 1;
export const MAX_REPLICATES = 6;

/**
 * Concentration units whose amount is a mass, with the factor that turns the
 * unit into mg/mL. Molar and % w/v units are deliberately absent: converting
 * them to mg needs a molar mass or a density convention the practical does not
 * give, and a silent assumption would change the student's result.
 */
export const MG_PER_ML: Record<string, number> = {
  "µg/mL": 1e-3,
  "mg/mL": 1,
  "mg/L": 1e-3,
  "µg/L": 1e-6,
  "g/L": 1,
};
export const RELEASE_UNITS = Object.keys(MG_PER_ML);

export type Method = "A" | "B";

export const METHOD_NAMES: Record<Method, string> = {
  A: "Method A — Practical-sheet method (previous corrected concentration)",
  B: "Method B — Standard cumulative sampling correction",
};

export const METHOD_FORMULAS: Record<Method, string[]> = {
  A: [
    "Correction CFₙ = (Vsₙ₋₁ / V) × Ccorrₙ₋₁   (CF₀ = 0, Ccorr₀ = C₀)",
    "Corrected concentration Ccorrₙ = Cₙ + CFₙ",
    "Cumulative amount = Ccorrₙ × V",
    "% Release = (Cumulative amount / label claim) × 100",
  ],
  B: [
    "Correction amount = Σ (Cᵢ × Vsᵢ) over every earlier sample i = 0 … n − 1   (0 for the first sample)",
    "Cumulative amount = Cₙ × V + correction amount",
    "% Release = (Cumulative amount / label claim) × 100",
  ],
};

export type PointCells = { time: string; vs: string; readings: string[] };

export type ReleaseInputs = {
  volume: string;
  sampleVolume: string;
  labelClaim: string;
  dilution: string;
  intercept: string;
  slope: string;
  unit: string;
  rows: PointCells[];
};

/** What was measured at one time point — identical under both methods. */
export type TimePoint = {
  time: number;
  readings: number[];
  /** Mean absorbance Ȳ (AU). */
  average: number;
  /** (Ȳ − a) / b, before dilution, in the calibration unit. */
  cRaw: number;
  /** cRaw × DF, in the calibration unit. */
  c: number;
  /** c in mg/mL. */
  cMg: number;
  /** Volume withdrawn at this time (mL). */
  vs: number;
  /** True when the row's cell was blank and the default Vs was used. */
  vsFromDefault: boolean;
};

export type CorrectionTerm = { index: number; time: number; cMg: number; vs: number; amount: number };

/** One time point's result under one correction method. */
export type MethodRow = {
  /** Method A only: CFₙ in the calibration unit. Null for Method B. */
  correctionConc: number | null;
  /** Drug accounted for by earlier samples (mg). */
  correctionMg: number;
  /** Cumulative amount ÷ V, in the calibration unit. */
  correctedConc: number;
  cumulativeMg: number;
  percent: number;
  /** Method B only: every earlier sample's Cᵢ × Vsᵢ, in order. */
  terms: CorrectionTerm[];
};

export type ReleaseResult = {
  volume: number;
  sampleVolume: number;
  labelClaim: number;
  dilution: number;
  intercept: number;
  slope: number;
  unit: string;
  factor: number;
  points: TimePoint[];
  methods: Record<Method, MethodRow[]>;
};

export type GlobalField = "volume" | "sampleVolume" | "labelClaim" | "dilution";

export type ReleaseAnalysis = {
  fieldErrors: Partial<Record<GlobalField, string>>;
  /** Keyed `${rowIndex}:time`, `${rowIndex}:vs`, `${rowIndex}:r${k}`. */
  cellErrors: Record<string, string>;
  /** One message per row, shown under it. */
  rowErrors: (string | undefined)[];
  /** Problems that stop the calculation but belong to no single cell. */
  blocking: string[];
  result: ReleaseResult | null;
  warnings: string[];
};

function positive(raw: string, show: boolean, label: string): { value: number | null; error?: string } {
  if (raw.trim() === "") return { value: null, error: show ? "Required." : undefined };
  const value = toNumber(raw);
  if (value === null) return { value: null, error: "Enter a number." };
  if (value <= 0) return { value: null, error: `${label} must be greater than zero.` };
  return { value };
}

/* ─── Correction methods ─────────────────────────────────────────────────── */

/**
 * Method A — the practical sheet's correction: each time point adds a fraction
 * Vs/V of the PREVIOUS corrected concentration.
 *
 *   CF₀ = 0, Ccorr₀ = C₀;   CFₙ = (Vsₙ₋₁ / V) × Ccorrₙ₋₁;   Ccorrₙ = Cₙ + CFₙ
 *
 * Amounts: correction = CFₙ × V = Vsₙ₋₁ × Ccorrₙ₋₁ (mg); cumulative = Ccorrₙ × V.
 */
export function methodA(points: TimePoint[], volume: number, factor: number, labelClaim: number): MethodRow[] {
  const out: MethodRow[] = [];
  for (let n = 0; n < points.length; n++) {
    const correctionConc = n === 0 ? 0 : (points[n - 1].vs / volume) * out[n - 1].correctedConc;
    const correctedConc = points[n].c + correctionConc;
    const cumulativeMg = correctedConc * factor * volume;
    out.push({
      correctionConc,
      correctionMg: correctionConc * factor * volume,
      correctedConc,
      cumulativeMg,
      percent: (cumulativeMg / labelClaim) * 100,
      terms: [],
    });
  }
  return out;
}

/**
 * Method B — the standard cumulative correction: the drug in the vessel now,
 * plus every milligram carried out by earlier samples.
 *
 *   correctionₙ = Σᵢ₌₀ⁿ⁻¹ Cᵢ × Vsᵢ (mg);   cumulativeₙ = Cₙ × V + correctionₙ
 */
export function methodB(points: TimePoint[], volume: number, factor: number, labelClaim: number): MethodRow[] {
  const out: MethodRow[] = [];
  const terms: CorrectionTerm[] = [];
  let removed = 0;
  for (let n = 0; n < points.length; n++) {
    const cumulativeMg = points[n].cMg * volume + removed;
    out.push({
      correctionConc: null,
      correctionMg: removed,
      correctedConc: cumulativeMg / volume / factor,
      cumulativeMg,
      percent: (cumulativeMg / labelClaim) * 100,
      terms: terms.slice(),
    });
    const amount = points[n].cMg * points[n].vs;
    terms.push({ index: n, time: points[n].time, cMg: points[n].cMg, vs: points[n].vs, amount });
    removed += amount;
  }
  return out;
}

/* ─── Validation + calculation ───────────────────────────────────────────── */

export function analyseRelease(inputs: ReleaseInputs, replicates: number, show: boolean): ReleaseAnalysis {
  const fieldErrors: ReleaseAnalysis["fieldErrors"] = {};
  const cellErrors: Record<string, string> = {};
  const rowErrors: (string | undefined)[] = inputs.rows.map(() => undefined);
  const blocking: string[] = [];
  const warnings: string[] = [];

  const V = positive(inputs.volume, show, "V");
  if (V.error) fieldErrors.volume = V.error;

  const Vs = positive(inputs.sampleVolume, show, "Vs");
  if (Vs.error) fieldErrors.sampleVolume = Vs.error;
  else if (Vs.value !== null && V.value !== null && Vs.value >= V.value) {
    fieldErrors.sampleVolume = `Vs must be smaller than V (${inputs.volume.trim()} mL).`;
  }

  const label = positive(inputs.labelClaim, show, "The label claim");
  if (label.error) fieldErrors.labelClaim = label.error;

  const DF = positive(inputs.dilution, show, "The dilution factor");
  if (DF.error) fieldErrors.dilution = DF.error;
  else if (DF.value !== null && DF.value < 1) {
    warnings.push(`The dilution factor is ${inputs.dilution.trim()} (less than 1), which means the sample was concentrated before reading. Check it is not the reciprocal of the dilution.`);
  }

  // The calibration fields show their own messages; here they only gate the result.
  const a = toNumber(inputs.intercept);
  const b = toNumber(inputs.slope);
  const factor = MG_PER_ML[inputs.unit];
  if (factor === undefined) blocking.push(`"${inputs.unit}" cannot be converted to mg without a molar mass — choose a mass/volume unit.`);
  if (b === 0) blocking.push("The calibration slope b is 0, so C = (Y − a) / b would divide by zero.");

  // ── Rows ──
  const times: (number | null)[] = [];
  const vsValues: (number | null)[] = [];
  const readingSets: (number[] | null)[] = [];

  inputs.rows.forEach((row, i) => {
    const t = toNumber(row.time);
    if (row.time.trim() === "") {
      if (show) cellErrors[`${i}:time`] = "Required.";
    } else if (t === null) cellErrors[`${i}:time`] = "Enter a number.";
    else if (t < 0) cellErrors[`${i}:time`] = "Time cannot be negative.";
    times.push(cellErrors[`${i}:time`] ? null : t);

    let vs: number | null = null;
    if (row.vs.trim() === "") vs = Vs.value !== null && !fieldErrors.sampleVolume ? Vs.value : null;
    else {
      const value = toNumber(row.vs);
      if (value === null) cellErrors[`${i}:vs`] = "Enter a number.";
      else if (value <= 0) cellErrors[`${i}:vs`] = "Sample volume must be greater than zero.";
      else if (V.value !== null && value >= V.value) cellErrors[`${i}:vs`] = `Sample volume must be smaller than V (${inputs.volume.trim()} mL).`;
      else vs = value;
    }
    vsValues.push(vs);

    const raw = row.readings.slice(0, replicates);
    for (let k = 0; k < raw.length; k++) {
      if (raw[k].trim() === "") {
        if (show) cellErrors[`${i}:r${k}`] = "Required.";
      } else if (toNumber(raw[k]) === null) cellErrors[`${i}:r${k}`] = "Enter a number.";
    }
    // Every visible replicate is required: averaging only the filled ones would
    // silently change the divisor. Named in words ("Absorbance reading 2 is
    // empty."); the cell itself is already highlighted.
    const parsed = parseReplicates(raw, "Absorbance reading");
    readingSets.push(parsed.ok ? parsed.value : null);
    if (!parsed.ok && (show || !parsed.error.endsWith("is empty."))) rowErrors[i] = parsed.error;

    rowErrors[i] = cellErrors[`${i}:time`]
      ? `Time: ${cellErrors[`${i}:time`]}`
      : cellErrors[`${i}:vs`]
        ? `Sample volume: ${cellErrors[`${i}:vs`]}`
        : rowErrors[i];
  });

  // Sampling times must run forward in the order entered. They are never
  // sorted silently: the correction depends on which sample came first.
  if (times.every((t) => t !== null)) {
    const offender = firstNonIncreasing(times as number[]);
    if (offender > 0) {
      const message = `Must be later than the previous time point (${inputs.rows[offender - 1].time.trim()} min).`;
      cellErrors[`${offender}:time`] = message;
      rowErrors[offender] = `Time: ${message}`;
    }
  }

  const complete =
    Object.keys(fieldErrors).length === 0 &&
    Object.keys(cellErrors).length === 0 &&
    blocking.length === 0 &&
    V.value !== null && Vs.value !== null && label.value !== null && DF.value !== null &&
    a !== null && b !== null && factor !== undefined &&
    times.every((t) => t !== null) && vsValues.every((v) => v !== null) && readingSets.every((r) => r !== null);

  if (!complete) return { fieldErrors, cellErrors, rowErrors, blocking, result: null, warnings };

  const volume = V.value!;
  const points: TimePoint[] = [];
  for (let i = 0; i < inputs.rows.length; i++) {
    const readings = readingSets[i]!;
    const average = mean(readings)!;
    const cRaw = concentrationFromAbsorbance(average, a!, b!);
    if (!cRaw.ok) return { fieldErrors, cellErrors, rowErrors, blocking: [cRaw.error], result: null, warnings };
    const c = cRaw.value * DF.value!;
    points.push({
      time: times[i]!,
      readings,
      average,
      cRaw: cRaw.value,
      c,
      cMg: c * factor!,
      vs: vsValues[i]!,
      vsFromDefault: inputs.rows[i].vs.trim() === "",
    });
  }

  const negative = points.filter((p) => p.c < 0).map((p) => `${p.time}`);
  if (negative.length > 0) {
    warnings.push(`The average absorbance is below the intercept a at t = ${negative.join(", ")} min, so the concentration is negative. It is kept as calculated — check the blank and the calibration.`);
  }

  const result: ReleaseResult = {
    volume,
    sampleVolume: Vs.value!,
    labelClaim: label.value!,
    dilution: DF.value!,
    intercept: a!,
    slope: b!,
    unit: inputs.unit,
    factor: factor!,
    points,
    methods: {
      A: methodA(points, volume, factor!, label.value!),
      B: methodB(points, volume, factor!, label.value!),
    },
  };

  return { fieldErrors, cellErrors, rowErrors, blocking, result, warnings };
}

/** Warnings that depend on which method's numbers are shown. */
export function methodWarnings(result: ReleaseResult, method: Method): string[] {
  const rows = result.methods[method];
  const out: string[] = [];
  const over = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.percent > 100);
  if (over.length > 0) {
    out.push(
      `Cumulative release exceeds 100% of the label claim at t = ${over.map(({ i }) => result.points[i].time).join(", ")} min. Check the label claim, the dilution factor, the calibration unit and the absorbance readings (the tablet may also be above its nominal content).`,
    );
  }
  const falls = rows.map((r, i) => i).filter((i) => i > 0 && rows[i].cumulativeMg < rows[i - 1].cumulativeMg);
  if (falls.length > 0) {
    out.push(
      `Cumulative release falls at t = ${falls.map((i) => result.points[i].time).join(", ")} min. A cumulative amount should not decrease — check those readings.`,
    );
  }
  return out;
}
