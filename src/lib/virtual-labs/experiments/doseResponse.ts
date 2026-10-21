/**
 * LAB 3 — Pharmacology: a graded dose–response curve on a SIMULATED isolated-tissue
 * preparation (an ileum-type smooth-muscle strip in an organ bath, contracted by an
 * acetylcholine-like agonist).
 *
 * Nothing here is animal or patient data. Responses come from the Hill equation with
 * documented teaching parameters (`MODEL`), plus small deterministic variation seeded per
 * run, and they respond to what the student does: a cold bath, no aeration, no
 * equilibration or no washout all change the curve, and the report explains how.
 * Concentrations are organ-bath concentrations for a teaching model — not doses for
 * any person or animal.
 */
import type { ControllerDef, ExperimentDefinition, ExperimentReport, Feedback, ObservationSection, Suggestion } from "../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round } from "../engine/machine";
import { concentrationFor, fitHill, hill, molarLabel, percentOfMax, stockVolumeUl } from "../calculations/doseResponse";
import { LABS } from "../catalog";

export const MODEL = {
  agonist: "Acetylcholine (simulated response)",
  emaxMm: 46, // full-scale contraction on the recorder for this teaching model
  ec50: 1e-7, // M — teaching value (pEC50 7.0)
  n: 1,
  variation: 0.06, // ±3 % deterministic trial-to-trial variation
  bathMl: 20,
  targetC: 37,
  equilibrationMin: 20,
  contactS: 30,
  /** Bath concentrations the student may choose (half-log steps). */
  concentrations: [1e-9, 3e-9, 1e-8, 3e-8, 1e-7, 3e-7, 1e-6, 3e-6, 1e-5],
  stocks: [1e-6, 1e-5, 1e-4, 1e-3], // M; the lab picks the stock giving a sensible volume
  readingToleranceMm: 1,
  minConcentrations: 6,
};

export function stockFor(c: number) {
  for (const s of MODEL.stocks) {
    const ul = stockVolumeUl(c, MODEL.bathMl, s);
    if (ul <= 200) return { stock: s, ul: round(ul, 1) };
  }
  const s = MODEL.stocks[MODEL.stocks.length - 1];
  return { stock: s, ul: round(stockVolumeUl(c, MODEL.bathMl, s), 1) };
}

const KEY_ITEMS = ["organ-bath", "thermostat", "aerator", "tissue", "transducer", "recorder", "stock", "micropipette", "pss"] as const;

export const VARIABLE_OPTIONS = {
  independent: [
    { id: "conc", text: "Agonist concentration in the bath", correct: true },
    { id: "height", text: "Height of contraction", correct: false },
    { id: "temp", text: "Bath temperature", correct: false },
  ],
  dependent: [
    { id: "height", text: "Height (amplitude) of contraction", correct: true },
    { id: "conc", text: "Agonist concentration", correct: false },
    { id: "time", text: "Contact time", correct: false },
  ],
};

export interface Trial {
  c: number; // nominal concentration added
  effectiveC: number; // concentration the tissue actually saw (residual + new)
  trueMm: number;
  recordedMm: number | null;
  washedBefore: boolean;
  /** The test sample of unknown concentration — kept out of the standard curve. */
  unknown?: boolean;
}

export interface DoseState {
  seed: number;
  inspected: string[];
  variablesOk: boolean;
  bathFilled: boolean;
  thermostatOn: boolean;
  aerationOn: boolean;
  tissueMounted: boolean;
  tensionSet: boolean;
  recorderZeroed: boolean;
  tempC: number;
  equilibratedMin: number;
  residualC: number; // agonist still in the bath
  washed: boolean;
  trials: Trial[];
  plottedLinear: boolean;
  plottedLog: boolean;
  emaxEntered: number | null;
  logEc50Entered: number | null;
  /** Hidden concentration of the test sample (M) — never shown before the report. */
  unknownC: number;
  unknownLogEntered: number | null;
  setupWarnings: string[];
}

export type DoseAction =
  | { type: "inspect"; id: string }
  | { type: "variables"; independent: string; dependent: string }
  | { type: "fillBath" }
  | { type: "thermostat"; on: boolean }
  | { type: "aeration"; on: boolean }
  | { type: "mountTissue" }
  | { type: "setTension" }
  | { type: "zeroRecorder" }
  | { type: "wait"; minutes: number }
  | { type: "addDose"; c: number }
  | { type: "recordResponse"; value: number }
  | { type: "wash" }
  | { type: "plot"; axis: "linear" | "log" }
  | { type: "estimate"; emaxMm: number; logEc50: number }
  | { type: "addUnknown" }
  | { type: "estimateUnknown"; logC: number };

/** Recorded standard-curve trials (the unknown sample is excluded). */
export function recorded(s: DoseState) {
  return s.trials.filter((t) => t.recordedMm !== null && !t.unknown) as (Trial & { recordedMm: number })[];
}

export function unknownTrials(s: DoseState) {
  return s.trials.filter((t) => t.unknown && t.recordedMm !== null) as (Trial & { recordedMm: number })[];
}

/** The concentration the student's own curve gives for the unknown's mean response. */
export function unknownFromCurve(s: DoseState) {
  const fit = studentFit(s);
  const u = unknownTrials(s);
  if (!fit || u.length === 0) return null;
  const mean = u.reduce((t, x) => t + x.recordedMm, 0) / u.length;
  const c = concentrationFor(mean / fit.emax, fit.ec50, fit.n);
  return { mean, c, logC: Math.log10(c), fraction: mean / fit.emax };
}

/** Mean recorded response per concentration — what the student's table and graph show. */
export function tableRows(s: DoseState) {
  const rows = new Map<number, number[]>();
  for (const t of recorded(s)) rows.set(t.c, [...(rows.get(t.c) ?? []), t.recordedMm]);
  const max = Math.max(0, ...recorded(s).map((t) => t.recordedMm));
  return Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([c, v]) => {
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      return { c, logC: Math.log10(c), n: v.length, mean, pct: percentOfMax(mean, max) };
    });
}

export function studentFit(s: DoseState) {
  return fitHill(tableRows(s).map((r) => ({ c: r.c, e: r.mean })));
}

/**
 * Does the student's own curve have a bottom and a top? Judged against their data, not
 * the model's Emax, so a tissue they weakened (cold, hypoxic) can still be analysed —
 * the report then explains why its maximum is low.
 */
export function coverage(s: DoseState) {
  const rows = tableRows(s);
  const max = Math.max(0, ...rows.map((r) => r.mean));
  const top = rows.slice(-2);
  return {
    distinct: rows.length,
    low: max > 0 && rows.some((r) => r.mean <= 0.25 * max),
    // plateau: the two highest concentrations give responses within ~12 % of each other
    high: top.length === 2 && top[1].mean > 0 && top[0].mean >= 0.88 * top[1].mean,
  };
}

const initial = (seed: number): DoseState => ({
  seed,
  inspected: [],
  variablesOk: false,
  bathFilled: false,
  thermostatOn: false,
  aerationOn: false,
  tissueMounted: false,
  tensionSet: false,
  recorderZeroed: false,
  tempC: 25,
  equilibratedMin: 0,
  residualC: 0,
  washed: true,
  trials: [],
  plottedLinear: false,
  plottedLog: false,
  emaxEntered: null,
  logEc50Entered: null,
  // between 10^-7.4 and 10^-6.6 M: inside the steep, readable part of the curve
  unknownC: 10 ** round(-7.4 + rand(seed, 201) * 0.8, 2),
  unknownLogEntered: null,
  setupWarnings: [],
});

/** One addition to the bath — a standard concentration or the unknown — and its response. */
function dose(s: DoseState, c: number, unknown: boolean): { state: DoseState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<DoseState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const pending = s.trials.find((t) => t.recordedMm === null);
      if (!s.recorderZeroed) return same(refuse("Finish the set-up: fill, warm, aerate, mount the tissue, set the tension and zero the recorder."));
  if (pending) return same(refuse("Read and record the last response before adding another dose."));
  const fb: Feedback[] = [];
  let factor = 1;
  if (s.trials.length === 0) {
    if (s.equilibratedMin < MODEL.equilibrationMin) {
      fb.push(mistake("not-equilibrated", 8, `First dose after only ${s.equilibratedMin} min of equilibration.`, `A freshly mounted tissue's baseline and sensitivity drift for the first ${MODEL.equilibrationMin}–30 minutes; early responses are smaller and erratic, distorting the bottom of the curve.`));
    }
  }
  if (s.equilibratedMin < MODEL.equilibrationMin) factor *= 0.75;
  if (s.tempC < MODEL.targetC - 1) {
    fb.push(mistake("cold-bath", 8, `Dosing at ${s.tempC.toFixed(1)} °C.`, "Mammalian smooth muscle is studied at body temperature; a cool bath gives weak, slow contractions. Switch the circulator on and wait."));
    factor *= Math.max(0.3, 0.4 + (0.6 * (s.tempC - 25)) / (MODEL.targetC - 25));
  }
  if (!s.aerationOn) {
    fb.push(mistake("no-aeration", 8, "Dosing without aeration.", "Without oxygen the tissue becomes hypoxic: responses fall trial after trial and the curve flattens."));
    factor *= 0.9 ** (s.trials.length + 1);
  }
  let effectiveC = c;
  if (!s.washed) {
    fb.push(mistake("no-wash", 8, "Dose added without washing out the previous one.", "The agonist already in the bath adds to the new dose (the tissue sees a higher concentration) and repeated exposure desensitises it. Wash out — three changes of solution — and let the baseline settle between doses."));
    effectiveC = c + s.residualC;
    factor *= 0.85;
  }
  const v = 1 + (rand(s.seed, 101, s.trials.length) - 0.5) * MODEL.variation;
  const trueMm = round(hill(effectiveC, MODEL.emaxMm, MODEL.ec50, MODEL.n) * factor * v, 1);
  const st = stockFor(c);
  return next(
    { trials: [...s.trials, { c, effectiveC, trueMm, recordedMm: null, washedBefore: s.washed, unknown }], residualC: effectiveC, washed: false },
    ...fb,
    info(unknown ? `100 µL of test sample U added. Contact ${MODEL.contactS} s; read the peak.` : `${st.ul} µL of ${molarLabel(st.stock)} stock added → ${molarLabel(c)} in the bath. Contact ${MODEL.contactS} s; read the peak on the recorder.`),
  );
}

function apply(s: DoseState, a: DoseAction): { state: DoseState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<DoseState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const pending = s.trials.find((t) => t.recordedMm === null);

  switch (a.type) {
    case "inspect":
      return s.inspected.includes(a.id) ? same() : next({ inspected: [...s.inspected, a.id] });

    case "variables": {
      const ind = VARIABLE_OPTIONS.independent.find((o) => o.id === a.independent);
      const dep = VARIABLE_OPTIONS.dependent.find((o) => o.id === a.dependent);
      if (!ind || !dep) return same(refuse("Choose both variables."));
      if (!ind.correct || !dep.correct) {
        return same(mistake("variables", 4, "Not quite.", "The experimenter changes the agonist concentration (independent variable) and measures the size of the contraction (dependent variable). Temperature, tension, bath volume and contact time are kept constant (controlled variables)."));
      }
      return next({ variablesOk: true }, ok("Independent: agonist concentration. Dependent: contraction height. Controlled: temperature, tension, bath volume, contact time."));
    }

    case "fillBath":
      if (s.bathFilled) return same(info("The bath is full."));
      return next({ bathFilled: true }, ok(`Organ bath filled with ${MODEL.bathMl} mL of physiological salt solution (Tyrode-type).`));

    case "thermostat":
      if (a.on && !s.bathFilled) return same(refuse("Fill the bath first — never heat an empty water jacket."));
      return next({ thermostatOn: a.on }, a.on ? info(`Circulator on, set to ${MODEL.targetC} °C.`) : info("Circulator off."));

    case "aeration":
      if (a.on && !s.bathFilled) return same(refuse("Fill the bath first."));
      return next({ aerationOn: a.on }, a.on ? info("Aeration on: fine, steady bubbles that do not shake the tissue.") : info("Aeration off."));

    case "mountTissue": {
      if (!s.bathFilled) return same(refuse("Fill the bath with physiological salt solution before mounting — the tissue must never dry."));
      if (s.tissueMounted) return same(info("The tissue is mounted."));
      return next({ tissueMounted: true }, ok("Simulated tissue strip tied to the bath hook below and the transducer thread above."));
    }

    case "setTension":
      if (!s.tissueMounted) return same(refuse("Mount the tissue first."));
      return next({ tensionSet: true }, ok("Resting tension set to 1 g."));

    case "zeroRecorder":
      if (!s.tensionSet) return same(refuse("Set the resting tension first, then zero the baseline."));
      return next({ recorderZeroed: true }, ok("Baseline zeroed on the recorder."));

    case "wait": {
      if (![1, 2, 5, 10].includes(a.minutes)) return same();
      const target = s.thermostatOn ? MODEL.targetC : 25;
      const tempC = round(target + (s.tempC - target) * Math.exp(-a.minutes / 3), 1);
      const eq = s.tissueMounted ? s.equilibratedMin + a.minutes : 0;
      return next({ tempC, equilibratedMin: eq }, info(`${a.minutes} min passed. Bath ${tempC.toFixed(1)} °C.`));
    }

    case "addDose":
      if (!MODEL.concentrations.includes(a.c)) return same();
      return dose(s, a.c, false);

    case "addUnknown":
      if (s.logEc50Entered === null) return same(refuse("Construct and analyse the standard curve first — the unknown is read off it."));
      return dose(s, s.unknownC, true);

    case "recordResponse": {
      if (!pending) return same(refuse("There is no response waiting to be recorded."));
      if (!Number.isFinite(a.value) || Math.abs(a.value - pending.trueMm) > MODEL.readingToleranceMm) {
        return same(mistake("misread-response", 3, `${fmt(a.value, 1)} mm does not match the peak on the trace.`, "Measure from the baseline to the top of the contraction, to the nearest 0.5 mm."));
      }
      const trials = s.trials.map((t) => (t === pending ? { ...t, recordedMm: round(a.value, 1) } : t));
      return next({ trials }, ok(`${a.value.toFixed(1)} mm recorded ${pending.unknown ? "for test sample U" : `at ${molarLabel(pending.c)}`}.`));
    }

    case "estimateUnknown": {
      const u = unknownFromCurve(s);
      if (!u) return same(refuse("Add the test sample, record its response, then read its concentration from your curve."));
      if (u.fraction < 0.1 || u.fraction > 0.9) return same(refuse("The unknown's response is outside the readable part of your curve (10–90 % of Emax)."));
      if (!Number.isFinite(a.logC) || Math.abs(a.logC - u.logC) > 0.2) {
        return same(mistake("unknown", 5, `log C ${fmt(a.logC, 2)} is not where your curve gives ${u.mean.toFixed(1)} mm.`, "Find the unknown's response on the y-axis, go across to your curve, then down to the log-concentration axis."));
      }
      return next({ unknownLogEntered: round(a.logC, 2) }, ok(`Unknown ≈ ${molarLabel(10 ** a.logC)} from your curve.`));
    }

    case "wash":
      if (s.trials.length === 0 && s.washed) return same(info("Nothing to wash out yet."));
      if (pending) return same(refuse("Record the response before washing — the peak must be read first."));
      return next({ washed: true, residualC: 0 }, ok("Washed three times with fresh solution; baseline restored."));

    case "plot": {
      const cov = coverage(s);
      if (cov.distinct < 3) return same(refuse("Record at least three concentrations before plotting."));
      if (a.axis === "linear") return next({ plottedLinear: true }, info("Linear axis: the curve rises steeply then flattens — a rectangular hyperbola. The low concentrations are crushed against the y-axis."));
      return next({ plottedLog: true }, ok("Log axis: the same data spread into a symmetrical sigmoid — the middle, where EC50 is read, is nearly straight."));
    }

    case "estimate": {
      if (!(s.plottedLinear && s.plottedLog)) return same(refuse("Plot your data on both axes first."));
      const cov = coverage(s);
      if (cov.distinct < MODEL.minConcentrations || !cov.low || !cov.high) return same(refuse("Your data do not yet define the curve — see the trials step."));
      const fit = studentFit(s);
      if (!fit) return same(refuse("Not enough data to fit."));
      const maxObs = Math.max(...tableRows(s).map((r) => r.mean));
      const fb: Feedback[] = [];
      if (!Number.isFinite(a.emaxMm) || Math.abs(a.emaxMm - maxObs) > Math.max(2, 0.08 * maxObs)) {
        return same(mistake("emax", 4, `Emax ${fmt(a.emaxMm, 1)} mm does not match your data.`, `Emax is the plateau — the largest response the agonist produces. Your largest recorded response is ${maxObs.toFixed(1)} mm.`));
      }
      if (!Number.isFinite(a.logEc50) || Math.abs(a.logEc50 - fit.logEc50) > 0.3) {
        return same(mistake("ec50", 5, `log EC50 ${fmt(a.logEc50, 2)} is not where your curve crosses 50 % of Emax.`, "Draw a horizontal line at half of Emax on the log-concentration graph; drop down to the x-axis and read log EC50."));
      }
      return next({ emaxEntered: round(a.emaxMm, 1), logEc50Entered: round(a.logEc50, 2) }, ...fb, ok(`Emax ≈ ${a.emaxMm.toFixed(1)} mm, EC50 ≈ ${molarLabel(10 ** a.logEc50)} (pEC50 ${(-a.logEc50).toFixed(2)}).`));
    }
  }
}

const STEP_DONE: Record<string, (s: DoseState) => boolean> = {
  inspect: (s) => KEY_ITEMS.every((k) => s.inspected.includes(k)),
  design: (s) => s.variablesOk,
  setup: (s) => s.recorderZeroed && s.thermostatOn && s.aerationOn,
  equilibrate: (s) => s.equilibratedMin >= MODEL.equilibrationMin || s.trials.length > 0,
  trials: (s) => {
    const c = coverage(s);
    return c.distinct >= MODEL.minConcentrations && c.low && c.high && !s.trials.some((t) => t.recordedMm === null);
  },
  plot: (s) => s.plottedLinear && s.plottedLog,
  analyse: (s) => s.logEc50Entered !== null,
  unknown: (s) => s.unknownLogEntered !== null,
};

/**
 * The instruments (2026-10-21 upgrade). Each physical action is available only from the
 * instrument it is done with; the run machine refuses it otherwise. Two deliberate
 * overlaps: `recordResponse` is on the dosing station as well as the recorder, because
 * the student reads the peak off the chart beside the bath while still holding the
 * pipette (the brief's "dose selector, run-trial control, response readout" station), and
 * `wait` is on both the bath and the circulator, which each show the bath temperature.
 * Washing out stays on the bath — it is the drain tap and the salt-solution reservoir,
 * not the pipette — so a trial is dose → read → wash, one tap between the two via `nearby`.
 */
const CONTROLLERS: ControllerDef[] = [
  { id: "notebook", name: "Lab notebook", equipment: ["notebook"], actions: ["variables"], brief: "Define what you will change and what you will measure.", howTo: ["The independent variable is the one you set.", "The dependent variable is the one you read."], nearby: ["organ-bath"] },
  { id: "organ-bath", name: "Organ bath", equipment: ["organ-bath", "pss"], actions: ["fillBath", "wash", "wait"], brief: `Fill with ${MODEL.bathMl} mL of salt solution, wash out between doses, and time the rest periods.`, howTo: ["Fill before heating, aerating or mounting anything.", "After each response is recorded, wash out three times."], nearby: ["thermostat", "aerator", "tissue", "dosing"] },
  { id: "thermostat", name: "Thermostatic circulator", equipment: ["thermostat"], actions: ["thermostat", "wait"], brief: `Keep the bath at ${MODEL.targetC} °C.`, howTo: ["Switch it on once the bath is full.", "Wait until the bath reads 37 °C."], nearby: ["organ-bath", "aerator"] },
  { id: "aerator", name: "Aeration line", equipment: ["aerator"], actions: ["aeration"], brief: "Oxygenate the tissue with fine, steady bubbles.", howTo: ["Turn it on once the bath is full and leave it on."], nearby: ["organ-bath", "thermostat"] },
  { id: "tissue", name: "Tissue and transducer", equipment: ["tissue", "transducer"], actions: ["mountTissue", "setTension"], brief: "Mount the tissue strip and set its resting tension.", howTo: ["Tie it to the bath hook below and the transducer above.", "Set 1 g resting tension before zeroing the recorder."], nearby: ["organ-bath", "recorder"] },
  { id: "dosing", name: "Micropipette", equipment: ["micropipette", "stock"], actions: ["addDose", "addUnknown", "recordResponse"], brief: "Choose a concentration, add it, read the peak.", howTo: ["Choose a concentration: the pipette is set to the stock volume that gives it.", "Read the peak from baseline to top, record it, then wash out at the bath."], nearby: ["organ-bath", "recorder"] },
  { id: "recorder", name: "Recorder", equipment: ["recorder"], actions: ["zeroRecorder", "recordResponse", "plot", "estimate", "estimateUnknown"], brief: "The trace, your data, and the graph.", howTo: ["Zero only after the resting tension is set.", "Plot on both axes, then read Emax and EC50 from the log plot."], nearby: ["dosing"] },
];

/**
 * Learning mode: the next correct move. It names an instrument and a control, never a
 * value — it points at "add a dose", not at which concentration; at the reading field,
 * not at the peak; at the analysis form, not at Emax, EC50 or the unknown.
 */
function suggest(s: DoseState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  if (!KEY_ITEMS.every((k) => s.inspected.includes(k))) return null; // inspection is finding, not operating
  if (!s.variablesOk) return to("notebook", "variables");
  if (!s.bathFilled) return to("organ-bath", "fillBath");
  if (!s.thermostatOn) return to("thermostat", "thermostat");
  if (!s.aerationOn) return to("aerator", "aeration");
  if (!s.tissueMounted) return to("tissue", "mountTissue");
  if (!s.tensionSet) return to("tissue", "setTension");
  if (!s.recorderZeroed) return to("recorder", "zeroRecorder");
  // a peak on the trace is read before anything else happens to the bath
  if (s.trials.some((t) => t.recordedMm === null)) return to("dosing", "recordResponse");
  if (!STEP_DONE.trials(s)) {
    if (s.trials.length > 0 && !s.washed) return to("organ-bath", "wash");
    if ((s.trials.length === 0 && s.equilibratedMin < MODEL.equilibrationMin) || s.tempC < MODEL.targetC - 1) return to("organ-bath", "wait");
    return to("dosing", "addDose");
  }
  if (!s.plottedLinear || !s.plottedLog) return to("recorder", "plot");
  if (s.logEc50Entered === null) return to("recorder", "estimate");
  if (s.unknownLogEntered === null) {
    if (!s.trials.some((t) => t.unknown)) return to(s.washed ? "dosing" : "organ-bath", s.washed ? "addUnknown" : "wash");
    return to("recorder", "estimateUnknown");
  }
  return null;
}

function observations(s: DoseState): ObservationSection[] {
  const rows = tableRows(s);
  return [
    {
      title: "Preparation (simulated)",
      rows: [
        { label: "Bath", value: `${MODEL.bathMl} mL physiological salt solution, ${s.tempC.toFixed(1)} °C, aeration ${s.aerationOn ? "on" : "off"}`, source: "observed" },
        { label: "Resting tension", value: s.tensionSet ? "1 g" : "—", source: "recorded" },
        { label: "Equilibration", value: `${s.equilibratedMin} min`, source: "observed" },
        { label: "Agonist", value: MODEL.agonist, source: "recorded" },
      ],
    },
    {
      title: "Responses (simulated observations)",
      rows: rows.length
        ? rows.map((r) => ({ label: `${molarLabel(r.c)} (log C ${r.logC.toFixed(1)})`, value: `${r.mean.toFixed(1)} mm${r.n > 1 ? ` (mean of ${r.n})` : ""} — ${r.pct.toFixed(0)} % of max`, source: "recorded" as const }))
        : [{ label: "Trials", value: "none recorded", source: "recorded" }],
    },
    {
      title: "Analysis",
      rows: [
        { label: "Emax (your estimate)", value: s.emaxEntered !== null ? `${s.emaxEntered.toFixed(1)} mm` : "—", source: "recorded" },
        { label: "EC50 (your estimate)", value: s.logEc50Entered !== null ? `${molarLabel(10 ** s.logEc50Entered)} (pEC50 ${(-s.logEc50Entered).toFixed(2)})` : "—", source: "recorded" },
        { label: "Test sample U — response", value: unknownTrials(s).length ? `${unknownTrials(s).map((t) => t.recordedMm.toFixed(1)).join(", ")} mm` : "—", source: "recorded" },
        { label: "Test sample U — concentration (your reading)", value: s.unknownLogEntered !== null ? `${molarLabel(10 ** s.unknownLogEntered)} (log C ${s.unknownLogEntered.toFixed(2)})` : "—", source: "recorded" },
      ],
    },
  ];
}

function report(s: DoseState): ExperimentReport {
  const fit = studentFit(s);
  return {
    headline: s.logEc50Entered !== null ? `EC50 ≈ ${molarLabel(10 ** s.logEc50Entered)}, Emax ≈ ${s.emaxEntered?.toFixed(1)} mm` : "Curve not analysed",
    calculations: [
      { label: "% of maximum", expression: "response ÷ largest response × 100", result: "per concentration (table)" },
      { label: "log concentration", expression: "log₁₀ (bath concentration, M)", result: "x-axis of the sigmoid" },
      { label: "Least-squares Hill fit of your data", expression: "E = Emax·Cⁿ / (EC50ⁿ + Cⁿ)", result: fit ? `Emax ${fit.emax.toFixed(1)} mm, EC50 ${molarLabel(fit.ec50)}, n ${fit.n.toFixed(2)}, R² ${fit.r2.toFixed(3)}` : "—" },
    ],
    outcome: [
      { label: "Your pEC50", value: s.logEc50Entered !== null ? (-s.logEc50Entered).toFixed(2) : "—", verdict: "info" },
      { label: "Teaching model's pEC50", value: (-Math.log10(MODEL.ec50)).toFixed(2), verdict: "info" },
      { label: "Unknown U: your reading / true value", value: s.unknownLogEntered !== null ? `${molarLabel(10 ** s.unknownLogEntered)} / ${molarLabel(s.unknownC)}` : "—", verdict: s.unknownLogEntered !== null ? (Math.abs(s.unknownLogEntered - Math.log10(s.unknownC)) <= 0.2 ? "pass" : "fail") : "info" },
      { label: "Concentrations tested", value: `${tableRows(s).length}`, verdict: tableRows(s).length >= MODEL.minConcentrations ? "pass" : "fail" },
      { label: "Washed between every dose", value: s.trials.every((t, i) => i === 0 || t.washedBefore) ? "yes" : "no", verdict: s.trials.every((t, i) => i === 0 || t.washedBefore) ? "pass" : "fail" },
    ],
    learning: [
      "Potency is about position (EC50: a lower EC50 means a more potent agonist); efficacy is about height (Emax).",
      "A log-concentration axis turns the hyperbola into a sigmoid that is nearly straight between 20 and 80 % — where EC50 is read most precisely.",
      "These are simulated observations from a teaching model. Real isolated-tissue work needs ethical approval and gives more variable data.",
    ],
  };
}

export const DOSE_RESPONSE: ExperimentDefinition<DoseState, DoseAction> = {
  meta: LABS["dose-response"],
  principle: [
    "In a graded dose–response experiment the size of a tissue's response rises with the concentration of agonist at its receptors, until every receptor that can contribute is occupied and the response reaches a maximum (Emax).",
    "The relationship is described by the Hill equation, E = Emax·Cⁿ/(EC50ⁿ + Cⁿ). EC50 — the concentration giving half the maximum response — measures potency; Emax measures efficacy.",
    "Plotted against concentration the curve is a rectangular hyperbola; plotted against log concentration it becomes a sigmoid, which spreads the low concentrations out and makes the central part almost linear.",
    `This lab is a SIMULATION. The tissue, the agonist's behaviour and every response come from a teaching model (Emax ${MODEL.emaxMm} mm, EC50 ${molarLabel(MODEL.ec50)}, Hill coefficient ${MODEL.n}) with small deterministic variation. They are not animal or patient data, and the concentrations are organ-bath concentrations, not doses for any person or animal.`,
  ],
  safety: [
    "Real isolated-tissue experiments need institutional ethical approval and training in humane handling; this simulation uses no animal.",
    "Agonist stock solutions are pharmacologically active: wear gloves, label every dilution and never pipette by mouth.",
    "Keep water and electrical equipment (circulator, transducer amplifier) apart; mop spills at once.",
  ],
  equipment: [
    { id: "organ-bath", name: "Organ bath (20 mL, water-jacketed)", description: "A glass chamber surrounded by a jacket of circulating warm water.", use: "Holds the tissue in physiological salt solution at 37 °C; drugs are added to it.", spec: "20 mL working volume" },
    { id: "thermostat", name: "Thermostatic circulator", description: "Pumps water at a set temperature through the bath jacket.", use: "Keeps the bath at 37 °C." },
    { id: "aerator", name: "Aeration line", description: "Delivers fine bubbles of air (or 95 % O₂/5 % CO₂) into the bath.", use: "Oxygenates the tissue and stirs the bath." },
    { id: "tissue", name: "Tissue strip (simulated)", description: "A smooth-muscle strip waiting in a dish of salt solution until it is mounted — a model, not a real preparation.", use: "Tied between the bath hook and the transducer, it contracts in response to the agonist." },
    { id: "transducer", name: "Isotonic transducer on a stand", description: "Converts the tissue's shortening into an electrical signal.", use: "Measures each contraction; it also sets the resting tension." },
    { id: "recorder", name: "Recorder (chart display)", description: "Plots the transducer signal against time.", use: "Each dose produces a peak; its height is the response you record." },
    { id: "stock", name: "Agonist stock solutions", description: `Labelled ${MODEL.stocks.map(molarLabel).join(", ")} stocks of the simulated agonist.`, use: "Small volumes are added to the bath to reach each concentration.", safety: "Pharmacologically active — gloves, no mouth pipetting." },
    { id: "micropipette", name: "Micropipette (10–200 µL)", description: "Adjustable pipette with disposable tips.", use: "Adds the stock volume to the bath." },
    { id: "pss", name: "Physiological salt solution reservoir", description: "Warmed, aerated Tyrode-type solution.", use: "Fills the bath and washes the drug out between doses." },
    { id: "notebook", name: "Lab notebook", description: "Your record of the experiment: the design, and every response you recorded.", use: "Define the independent and dependent variables before you start." },
  ],
  materials: [
    { id: "agonist", name: MODEL.agonist, detail: "Simulated cholinergic agonist" },
    { id: "pss", name: "Physiological salt solution (Tyrode-type)", detail: "Isotonic, buffered, with glucose" },
  ],
  steps: [
    { id: "inspect", title: "Inspect the apparatus", objective: "Inspect the organ bath, circulator, aerator, tissue, transducer, recorder, stocks, micropipette and salt-solution reservoir.", hints: ["Select each item to read what it does."], focus: [...KEY_ITEMS] },
    { id: "design", title: "Define the experiment", objective: "Identify the independent and dependent variables.", hints: ["What do you change? What do you measure?"], focus: ["notebook"] },
    { id: "setup", title: "Set up the bath", objective: "Fill the bath, switch on the circulator and aeration, mount the tissue, set 1 g tension and zero the recorder.", hints: ["Fill first — never heat or aerate an empty bath.", "Tension before zeroing."], focus: ["organ-bath", "thermostat", "aerator", "tissue", "transducer", "recorder"] },
    { id: "equilibrate", title: "Equilibrate", objective: `Let the tissue equilibrate for at least ${MODEL.equilibrationMin} minutes at 37 °C.`, hints: ["Wait at the bath or the circulator; watch the temperature reach 37 °C."], focus: ["organ-bath", "thermostat"] },
    { id: "trials", title: "Run the trials", objective: `Add at least ${MODEL.minConcentrations} different concentrations — from the foot of the curve (≤ 25 % of your largest response) up to the plateau — recording each peak and washing out between doses.`, hints: ["Start low and work up in half-log steps; the plateau is reached when a higher concentration gives about the same response.", "Add → read the peak → record → wash → next dose."], focus: ["micropipette", "stock", "organ-bath"] },
    { id: "plot", title: "Plot the curve", objective: "Plot response against concentration on a linear axis, then on a log axis.", hints: ["Compare the two shapes — which one lets you read EC50?"], focus: ["recorder"] },
    { id: "analyse", title: "Estimate Emax and EC50", objective: "Read Emax and log EC50 from your graph.", hints: ["Emax is the plateau.", "Half of Emax → across to the curve → down to log C."], focus: ["recorder"] },
    { id: "unknown", title: "Find the unknown concentration", objective: "Wash, add test sample U, record its response, and read its concentration from your standard curve.", hints: ["Treat it exactly like a standard: wash first, read the peak, record it.", "Across from its response to your curve, then down to log C."], focus: ["organ-bath", "micropipette", "recorder"] },
  ],
  controllers: CONTROLLERS,
  questions: [
    { id: "q1", kind: "design", prompt: "Why is the bath washed out between doses?", options: ["To clean the glass", "So each dose acts alone — residual agonist would add to it and desensitise the tissue", "To cool the tissue", "It is optional"], answer: 1, explanation: "Non-cumulative dosing needs the previous agonist removed and the baseline restored." },
    { id: "q2", kind: "interpretation", prompt: "Agonist B has a lower EC50 than agonist A on the same tissue. B is…", options: ["More potent", "More efficacious", "Less potent", "A partial agonist"], answer: 0, explanation: "Potency is position: a lower EC50 means less drug is needed for the same effect." },
    { id: "q3", kind: "interpretation", prompt: "Why is concentration plotted on a log scale?", options: ["It makes Emax larger", "It spreads a wide concentration range evenly and gives a sigmoid whose middle is nearly linear", "It removes variability", "It converts response to percentage"], answer: 1, explanation: "Concentrations span several orders of magnitude; the log axis shows them evenly." },
    { id: "q4", kind: "viva", prompt: "Efficacy is shown on a dose–response curve by…", options: ["The EC50", "The maximum response (Emax)", "The slope only", "The lowest concentration tested"], answer: 1, explanation: "Efficacy is the maximum effect an agonist can produce." },
    { id: "q5", kind: "design", prompt: "Why is the bath kept at 37 °C and aerated?", options: ["To keep the drug stable", "To keep the tissue physiological — warm and oxygenated — so responses are stable", "To evaporate the solution", "To sterilise the bath"], answer: 1, explanation: "Mammalian smooth muscle needs body temperature and oxygen to respond reproducibly." },
    { id: "q6", kind: "interpretation", prompt: "A competitive antagonist added to the bath would shift the log dose–response curve…", options: ["To the right, with the same maximum", "Down, with a lower maximum", "To the left", "Not at all"], answer: 0, explanation: "A surmountable antagonist reduces potency (higher EC50) without reducing Emax." },
    { id: "q7", kind: "viva", prompt: "What are the controlled variables in this experiment?", options: ["Concentration only", "Temperature, resting tension, bath volume and contact time", "Contraction height", "None"], answer: 1, explanation: "Everything except the concentration you vary is held constant so differences in response are due to concentration." },
  ],
  initial,
  suggest,
  apply,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

export function doseVisual(s: DoseState) {
  return {
    bathFilled: s.bathFilled,
    tempC: s.tempC,
    aeration: s.aerationOn,
    thermostat: s.thermostatOn,
    tissue: s.tissueMounted,
    tension: s.tensionSet,
    trace: s.trials.map((t) => t.trueMm),
    pending: s.trials.some((t) => t.recordedMm === null),
    washed: s.washed,
  };
}
