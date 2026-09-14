/*
 * Serial Dose Calculator — the maths, moved out of page.tsx unchanged.
 *
 * Everything here is copied from the pre-redesign page (commit 5dbe98c): the
 * same parsing (parseFloat, so an empty or zero aliquot falls back to 1 mL),
 * the same 10× auto-plan capped at six tubes, the same 4-dp rounding of planned
 * volumes and the same display formatters. The redesign changes how the chain
 * is shown, never what it computes (calculator-tool skill, "Migrating").
 * Known quirks are recorded in .claude/redesign-tracker.md, not fixed here.
 *
 * Pure module, no I/O — it ships inside the offline Android app.
 */

export interface DilutionStep {
  id: string;
  stepNumber: number;
  /** A number once planned or edited; "" while the student has cleared the field. */
  aliquot: number | string;
  addDiluent: number | string;
}

export interface ComputedRow {
  kind: "stock" | "dilute";
  stepNumber: number;
  label: string;
  aliquot: number;
  addDiluent: number;
  newTotalVol: number;
  prevConc: number;
  conc: number;
  id: string;
  dilutionFactor: number;
}

export interface ComputedChain {
  rows: ComputedRow[];
  finalConc: number;
  doseDelivered: number;
  doseError: number;
  totalDilutionFactor: number;
}

export interface WorkedPreset {
  label: string;
  drug: string;
  sub: string;
  adultDose: string;
  dissolveVol: string;
  targetDose: string;
  deliverVol: string;
}

/* ─── Formatting ─────────────────────────────────────────────────────────── */

export function fmt(n: number, maxDp = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  let dp = maxDp;
  if (abs >= 100) dp = 2;
  else if (abs >= 10) dp = 3;
  else if (abs >= 1) dp = 3;
  return Number(n.toFixed(dp)).toString();
}

export function fmtConc(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n > 0 && n < 0.0001) return n.toExponential(3);
  return fmt(n, 4);
}

export function fmtUg(mg: number): string {
  if (!Number.isFinite(mg)) return "—";
  return `${fmt(mg * 1000, 2)} µg`;
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/* ─── Planning ───────────────────────────────────────────────────────────── */

/** The most tubes the auto-plan will lay out. */
export const AUTO_PLAN_MAX_TUBES = 6;

export function autoPlanSteps(totalFactorNeeded: number, aliquotDefault: number): DilutionStep[] {
  const steps: DilutionStep[] = [];
  let remaining = totalFactorNeeded;
  let guard = 0;

  while (remaining > 1.0001 && guard < AUTO_PLAN_MAX_TUBES) {
    guard++;
    const stepFactor = remaining >= 10 ? 10 : remaining;
    const newTotalVol = aliquotDefault * stepFactor;
    const addDiluent = Math.max(0, newTotalVol - aliquotDefault);
    steps.push({
      id: `step-${guard}`,
      stepNumber: guard,
      aliquot: round4(aliquotDefault),
      addDiluent: round4(addDiluent),
    });
    remaining = remaining / stepFactor;
  }

  if (steps.length === 0) {
    steps.push({
      id: "step-1",
      stepNumber: 1,
      aliquot: round4(aliquotDefault),
      addDiluent: 0,
    });
  }
  return steps;
}

/**
 * The part of the dilution the auto-plan could not fit into its six tubes
 * (1 when it fitted). Diagnostic only — it changes no number; the page uses it
 * to say out loud what the old page dropped silently.
 */
export function autoPlanShortfall(totalFactorNeeded: number): number {
  let remaining = totalFactorNeeded;
  for (let i = 0; i < AUTO_PLAN_MAX_TUBES && remaining > 1.0001; i++) {
    remaining /= remaining >= 10 ? 10 : remaining;
  }
  return remaining > 1.0001 ? remaining : 1;
}

/* ─── Inputs → chain ─────────────────────────────────────────────────────── */

export type DoseInputs = {
  adultDose: string;
  dissolveVol: string;
  targetDose: string;
  deliverVol: string;
  aliquotDefault: string;
};

export function parseDoseInputs(raw: DoseInputs) {
  const nAdult = parseFloat(raw.adultDose);
  const nDissolve = parseFloat(raw.dissolveVol);
  const nTarget = parseFloat(raw.targetDose);
  const nDeliver = parseFloat(raw.deliverVol);
  const nAliquot = parseFloat(raw.aliquotDefault) || 1;

  const inputsValid = nAdult > 0 && nDissolve > 0 && nTarget > 0 && nDeliver > 0 && nAliquot > 0;

  const c0 = inputsValid ? nAdult / nDissolve : 0;
  const requiredFinalConc = inputsValid ? nTarget / nDeliver : 0;
  const totalFactorNeeded = inputsValid && requiredFinalConc > 0 ? c0 / requiredFinalConc : 0;

  return { nAdult, nDissolve, nTarget, nDeliver, nAliquot, inputsValid, c0, requiredFinalConc, totalFactorNeeded };
}

export type ParsedDose = ReturnType<typeof parseDoseInputs>;

export function planAutoSteps(p: ParsedDose): DilutionStep[] {
  if (!p.inputsValid || p.totalFactorNeeded <= 0) return [];
  if (p.totalFactorNeeded < 1) return [];
  return autoPlanSteps(p.totalFactorNeeded, p.nAliquot);
}

/** Forward chain: stock → each tube → the syringe. */
export function computeChain(p: ParsedDose, steps: DilutionStep[]): ComputedChain | null {
  if (!p.inputsValid || p.c0 <= 0) return null;

  const rows: ComputedRow[] = [];
  let conc = p.c0;

  rows.push({
    kind: "stock",
    stepNumber: 0,
    label: "Stock (Tube 0)",
    aliquot: 0,
    addDiluent: p.nDissolve,
    newTotalVol: p.nDissolve,
    prevConc: p.c0,
    conc: p.c0,
    id: "stock-0",
    dilutionFactor: 1,
  });

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const aliquot = typeof s.aliquot === "number" ? s.aliquot : parseFloat(s.aliquot) || 0;
    const addDiluent = typeof s.addDiluent === "number" ? s.addDiluent : parseFloat(s.addDiluent) || 0;
    const newTotalVol = aliquot + addDiluent;
    const prevConc = conc;
    const stepFactor = aliquot > 0 ? newTotalVol / aliquot : 0;
    const newConc = newTotalVol > 0 && aliquot > 0 ? (prevConc * aliquot) / newTotalVol : 0;

    conc = newConc;
    rows.push({
      kind: "dilute",
      stepNumber: i + 1,
      label: `Tube ${i + 1}`,
      aliquot,
      addDiluent,
      newTotalVol,
      prevConc,
      conc: newConc,
      id: s.id,
      dilutionFactor: stepFactor,
    });
  }

  const finalConc = conc;
  const doseDelivered = Number.isFinite(finalConc) ? finalConc * p.nDeliver : 0;
  const doseError =
    Number.isFinite(doseDelivered) && p.nTarget > 0 ? ((doseDelivered - p.nTarget) / p.nTarget) * 100 : 0;

  return { rows, finalConc, doseDelivered, doseError, totalDilutionFactor: p.totalFactorNeeded };
}

/** The page's acceptance band: delivered dose within ±5% of the target. */
export function isWithinTolerance(chain: ComputedChain | null): boolean {
  return chain && Number.isFinite(chain.doseError) ? Math.abs(chain.doseError) <= 5 : false;
}

/** A tube edit, parsed the way the original page parsed it. */
export function parseStepEdit(value: string): number | "" {
  return value === "" ? "" : Math.max(0, parseFloat(value) || 0);
}

/* ─── Presets ────────────────────────────────────────────────────────────── */

export const PRESETS: WorkedPreset[] = [
  {
    label: "Mouse Analgesic",
    drug: "Carprofen",
    sub: "25 mg tab → 0.009 mg (9 µg) in 0.1 ml",
    adultDose: "25",
    dissolveVol: "10",
    targetDose: "0.009",
    deliverVol: "0.1",
  },
  {
    label: "Rat Steroid",
    drug: "Prednisolone",
    sub: "20 mg tab → 0.035 mg (35 µg) in 0.2 ml",
    adultDose: "20",
    dissolveVol: "10",
    targetDose: "0.035",
    deliverVol: "0.2",
  },
  {
    label: "Micro-Dose Sedative",
    drug: "Diazepam",
    sub: "10 mg tab → 0.002 mg (2 µg) in 0.05 ml",
    adultDose: "10",
    dissolveVol: "10",
    targetDose: "0.002",
    deliverVol: "0.05",
  },
  {
    label: "Standard 1:10 Dilution",
    drug: "Test Solute",
    sub: "50 mg → 0.05 mg in 0.1 ml",
    adultDose: "50",
    dissolveVol: "10",
    targetDose: "0.05",
    deliverVol: "0.1",
  },
];
