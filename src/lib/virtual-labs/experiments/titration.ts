/**
 * LAB 1 — Pharmaceutical Chemistry: assay of citric acid monohydrate by acid–base
 * titration with standardised 0.1 M sodium hydroxide (phenolphthalein).
 *
 * The method is an ILLUSTRATIVE teaching procedure written for this lab — it is not a
 * University of Karachi practical-manual procedure and not a pharmacopoeial monograph
 * (the official monographs assay a larger mass against 1 M NaOH; see
 * docs/virtual-labs/EXPERIMENT_CATALOG.md). Every number the student sees comes from
 * calculations/titration.ts, driven by what the student actually did: an unrinsed
 * burette dilutes the titrant, an air bubble inflates the titre, an over-filled flask
 * dilutes the sample, and the report shows the result those choices produce.
 */
import type { ControllerDef, ExperimentDefinition, Suggestion, Feedback, ObservationSection, ExperimentReport } from "../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round, warn } from "../engine/machine";
import {
  CITRIC,
  DEEP_PINK_FRACTION,
  FAINT_PINK_FRACTION,
  INDICATORS,
  assayPercent,
  citricPH,
  concordance,
  equivalenceFactorMg,
  equivalenceVolume,
  indicatorBaseFraction,
  type IndicatorDef,
} from "../calculations/titration";
import { LABS } from "../catalog";

// ── Method constants (teaching values, stated on screen) ────────────────────

export const METHOD = {
  sampleTargetG: [0.95, 1.05] as [number, number],
  flaskMl: 100, // Class A volumetric flask
  flaskToleranceMl: 0.08, // Class A 100 mL tolerance (ISO 1042 / BS EN ISO 1042)
  aliquotMl: 20, // Class A bulb pipette
  waterAddedMl: 25,
  buretteCapacityMl: 50,
  titrantNominal: 0.1,
  /** The bottle label's standardised molarity — a teaching value. */
  titrantMolar: 0.1012,
  boatMassG: 1.8732,
  readingToleranceMl: 0.02,
  /** Illustrative acceptance range for this exercise (not a monograph limit). */
  limits: [99.0, 101.0] as [number, number],
};

/** Effects of technique errors on the chemistry (documented teaching magnitudes). */
const EFFECT = {
  unrinsedBuretteDilution: 0.985, // residual water dilutes the titrant ~1.5 %
  bubbleMl: 0.18, // an air bubble in the tip escapes during the titration
  unrinsedPipetteDilution: 0.992,
  blowOutExtraMl: 0.03,
  boatLossFraction: 0.006, // sample left on an unrinsed boat and funnel
};

// ── Choices ─────────────────────────────────────────────────────────────────

export const APPARATUS_OPTIONS = [
  { id: "burette-50", name: "Burette, 50 mL Class A (0.1 mL divisions)", correct: true },
  { id: "stand", name: "Retort stand with burette clamp", correct: true },
  { id: "pipette-20", name: "Bulb (volumetric) pipette, 20 mL Class A, with pipette filler", correct: true },
  { id: "vol-flask-100", name: "Volumetric flask, 100 mL Class A, with stopper", correct: true },
  { id: "conical-250", name: "Conical (Erlenmeyer) flask, 250 mL", correct: true },
  { id: "tile", name: "White tile", correct: true },
  { id: "balance", name: "Analytical balance (0.1 mg) and weighing boat", correct: true },
  { id: "funnel", name: "Small glass funnel", correct: true },
  { id: "wash-bottle", name: "Wash bottle of purified water", correct: true },
  {
    id: "burette-25",
    name: "Burette, 25 mL",
    correct: false,
    why: "The expected titre is about 28.5 mL — more than a 25 mL burette holds, so it would need refilling mid-titration and two readings' errors would add up.",
  },
  {
    id: "cylinder-100",
    name: "Measuring cylinder, 100 mL (to measure the aliquot)",
    correct: false,
    why: "A measuring cylinder is accurate to about ±1 %. The aliquot defines how much sample is titrated, so it must be taken with a Class A pipette (±0.03 mL in 20 mL).",
  },
  {
    id: "beaker-250",
    name: "Beaker, 250 mL (as the titration vessel)",
    correct: false,
    why: "A beaker cannot be swirled without splashing; a conical flask lets you mix vigorously and see the colour change against the tile.",
  },
] as const;

export const SAMPLE_OPTIONS = [
  { id: "citric", name: "Citric acid monohydrate — sample for assay (bottle CA-01)", correct: true },
  {
    id: "bicarbonate",
    name: "Sodium bicarbonate",
    correct: false,
    why: "Sodium bicarbonate is a base. It is assayed by titration with an acid (HCl, methyl orange), not with sodium hydroxide.",
  },
  {
    id: "boric",
    name: "Boric acid",
    correct: false,
    why: "Boric acid (pKa ≈ 9.2) is too weak to give a sharp end-point with NaOH on its own; its assay needs mannitol or glycerol to form a stronger complex acid first.",
  },
] as const;

export const TITRANT_OPTIONS = [
  { id: "naoh", name: `Sodium hydroxide 0.1 M, standardised — label: ${METHOD.titrantMolar.toFixed(4)} M`, correct: true },
  { id: "hcl", name: "Hydrochloric acid 0.1 M", correct: false, why: "Citric acid is an acid: it must be titrated with a base." },
  { id: "agno3", name: "Silver nitrate 0.1 M", correct: false, why: "Silver nitrate is a precipitation titrant for halides (argentometry), not an acid–base titrant." },
] as const;

export const INDICATOR_OPTIONS: { id: IndicatorDef["id"]; correct: boolean; why: string }[] = [
  {
    id: "phenolphthalein",
    correct: true,
    why: "Correct. The equivalence point of a weak acid with a strong base is alkaline (≈ pH 9 here), inside phenolphthalein's 8.2–10.0 range.",
  },
  {
    id: "methyl-orange",
    correct: false,
    why: "Methyl orange changes at pH 3.1–4.4. Citric acid passes through that range after only about a third of the titrant, so the end-point would be far too early and the assay far too low.",
  },
  {
    id: "bromothymol-blue",
    correct: false,
    why: "Bromothymol blue changes at pH 6.0–7.6 — still before the equivalence point of citric acid's third proton (pKa 6.40), so the end-point would be early and the assay low.",
  },
];

const KEY_ITEMS = ["burette", "stand", "pipette", "vol-flask", "conical-flask", "indicator", "sample", "titrant"] as const;

// ── State ──────────────────────────────────────────────────────────────────

export interface Titration {
  initialTrue: number;
  initialRecorded: number;
  finalTrue: number;
  finalRecorded: number;
  endpoint: "under" | "faint" | "over";
}

export interface TitrationState {
  seed: number;
  /** True purity of this sample, % w/w as C₆H₈O₇·H₂O — what a perfect assay would find. */
  purity: number;
  inspected: string[];
  apparatusOk: boolean;
  sample: string | null;
  titrant: string | null;
  indicator: IndicatorDef["id"] | null;
  // balance
  boatOn: boolean;
  tareG: number;
  sampleOnBoatG: number;
  doorsClosed: boolean;
  additions: number;
  massRecorded: number | null;
  // volumetric flask
  transferredG: number; // sample mass actually in the flask
  transferred: boolean;
  rinsedBoat: boolean;
  dissolved: boolean;
  flaskWaterMl: number;
  flaskMixed: boolean;
  // aliquot in the conical flask
  pipetteRinsed: boolean;
  aliquotAcidMmol: number; // 0 = no aliquot
  aliquotVolMl: number;
  waterAdded: boolean;
  indicatorAdded: boolean;
  tileUnder: boolean;
  // burette
  buretteRinsed: boolean;
  buretteFilled: boolean;
  funnelRemoved: boolean;
  bubble: boolean;
  /** Level (reading) of the meniscus, mL from the 0 mark. */
  level: number;
  /** Titrant actually delivered into the current flask (≠ change in reading if a bubble escaped). */
  deliveredMl: number;
  initialRecorded: number | null;
  /** True meniscus level when the initial reading was taken. */
  startLevel: number;
  swirled: boolean;
  titrations: Titration[];
  // results
  titreEntered: number | null;
  assayEntered: number | null;
  verdict: "complies" | "fails" | null;
}

export type TitrationAction =
  | { type: "inspect"; id: string }
  | { type: "chooseApparatus"; ids: string[] }
  | { type: "chooseReagents"; sample: string; titrant: string; indicator: string }
  | { type: "placeBoat" }
  | { type: "tare" }
  | { type: "doors"; closed: boolean }
  | { type: "addSample"; amount: "scoop" | "tap" }
  | { type: "removeSample" }
  | { type: "recordMass"; value: number }
  | { type: "transfer" }
  | { type: "rinseBoat" }
  | { type: "dissolve" }
  | { type: "addWater"; ml: number }
  | { type: "mixFlask" }
  | { type: "discardFlask" }
  | { type: "rinsePipette" }
  | { type: "pipette"; style: "touch" | "blow" }
  | { type: "addDiluent" }
  | { type: "addIndicator" }
  | { type: "placeTile" }
  | { type: "rinseBurette" }
  | { type: "fillBurette" }
  | { type: "removeFunnel" }
  | { type: "expelBubble" }
  | { type: "runToZero" }
  | { type: "recordInitial"; value: number }
  | { type: "addTitrant"; ml: number }
  | { type: "swirl" }
  | { type: "recordFinal"; value: number }
  | { type: "newTitration" }
  | { type: "enterResults"; titre: number; assay: number }
  | { type: "verdict"; value: "complies" | "fails" };

const ADD_STEPS = [1, 0.5, 0.1, 0.05, 0.025];

// ── Derived chemistry ───────────────────────────────────────────────────────

export function flaskReading(s: TitrationState) {
  const ind = s.indicator ? INDICATORS[s.indicator] : null;
  const molar = METHOD.titrantMolar * (s.buretteRinsed ? 1 : EFFECT.unrinsedBuretteDilution);
  const volume = s.aliquotVolMl + (s.waterAdded ? METHOD.waterAddedMl : 0) + s.deliveredMl;
  const pH = s.aliquotAcidMmol > 0 ? citricPH(s.aliquotAcidMmol, s.deliveredMl * molar, volume) : 7;
  const f = ind && s.indicatorAdded ? indicatorBaseFraction(ind, pH) : 0;
  return { pH, f, ind, volume, molar };
}

function endpointOf(s: TitrationState): Titration["endpoint"] {
  const { f, ind } = flaskReading(s);
  if (!ind || ind.id !== "phenolphthalein") {
    // Other indicators: judged against the equivalence point instead of colour.
    const veq = equivalenceVolume(s.aliquotAcidMmol, flaskReading(s).molar);
    return s.deliveredMl < veq - 0.1 ? "under" : s.deliveredMl > veq + 0.25 ? "over" : "faint";
  }
  return f < FAINT_PINK_FRACTION ? "under" : f > DEEP_PINK_FRACTION ? "over" : "faint";
}

/** Balance display, g, 4 dp. Open doors let draughts move the last digits. */
export function balanceDisplay(s: TitrationState): { value: number; stable: boolean } {
  const gross = (s.boatOn ? METHOD.boatMassG : 0) + s.sampleOnBoatG;
  const drift = s.doorsClosed ? 0 : (rand(s.seed, 77, s.additions) - 0.5) * 0.0008;
  return { value: round(gross - s.tareG + drift, 4), stable: s.doorsClosed };
}

const flaskConc = (s: TitrationState) =>
  s.flaskWaterMl > 0 ? (s.transferredG * (s.purity / 100) / CITRIC.molarMassMonohydrate) * 1000 / s.flaskWaterMl : 0; // mmol/mL

export function recordedTitres(s: TitrationState) {
  return s.titrations.map((t) => round(t.finalRecorded - t.initialRecorded, 2));
}

/** What the student's own recorded numbers give — the reference for their calculation. */
export function expectedResult(s: TitrationState) {
  const titres = recordedTitres(s);
  const { mean } = concordance(titres);
  const assay = s.massRecorded
    ? assayPercent({ titreMl: mean, titrantMolar: METHOD.titrantMolar, aliquotMl: METHOD.aliquotMl, flaskMl: METHOD.flaskMl, sampleMassG: s.massRecorded })
    : NaN;
  return { titres, mean, assay };
}

// ── Definition ──────────────────────────────────────────────────────────────

const initial = (seed: number): TitrationState => ({
  seed,
  purity: round(98.9 + rand(seed, 1) * 1.9, 2),
  inspected: [],
  apparatusOk: false,
  sample: null,
  titrant: null,
  indicator: null,
  boatOn: false,
  tareG: 0,
  sampleOnBoatG: 0,
  doorsClosed: false,
  additions: 0,
  massRecorded: null,
  transferredG: 0,
  transferred: false,
  rinsedBoat: false,
  dissolved: false,
  flaskWaterMl: 0,
  flaskMixed: false,
  pipetteRinsed: false,
  aliquotAcidMmol: 0,
  aliquotVolMl: 0,
  waterAdded: false,
  indicatorAdded: false,
  tileUnder: false,
  buretteRinsed: false,
  buretteFilled: false,
  funnelRemoved: false,
  bubble: true,
  level: 0,
  deliveredMl: 0,
  initialRecorded: null,
  startLevel: 0,
  swirled: true,
  titrations: [],
  titreEntered: null,
  assayEntered: null,
  verdict: null,
});

function apply(s: TitrationState, a: TitrationAction): { state: TitrationState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<TitrationState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const reagentsChosen = s.sample === "citric" && s.titrant === "naoh" && !!s.indicator;

  switch (a.type) {
    case "inspect": {
      if (s.inspected.includes(a.id)) return same();
      return next({ inspected: [...s.inspected, a.id] });
    }

    case "chooseApparatus": {
      if (s.apparatusOk) return same(info("The apparatus is already set out on the bench."));
      const chosen = new Set(a.ids);
      const fb: Feedback[] = [];
      for (const opt of APPARATUS_OPTIONS) {
        if (!opt.correct && chosen.has(opt.id)) fb.push(mistake(`apparatus-${opt.id}`, 3, `${opt.name}: not suitable.`, opt.why));
      }
      const missing = APPARATUS_OPTIONS.filter((o) => o.correct && !chosen.has(o.id)).map((o) => o.name);
      if (fb.length) return same(...fb, refuse("Remove the unsuitable item(s) and confirm again."));
      if (missing.length) return same(refuse(`Still missing: ${missing.join("; ")}.`));
      return next({ apparatusOk: true }, ok("Correct apparatus set out on the bench."));
    }

    case "chooseReagents": {
      if (!s.apparatusOk) return same(refuse("Set out the apparatus first — reagents go on a bench that is ready for them."));
      if (s.indicatorAdded) return same(refuse("The indicator is already in the flask. Start a new titration to change it."));
      const sample = SAMPLE_OPTIONS.find((o) => o.id === a.sample);
      const titrant = TITRANT_OPTIONS.find((o) => o.id === a.titrant);
      const ind = INDICATOR_OPTIONS.find((o) => o.id === a.indicator);
      if (!sample || !titrant || !ind) return same(refuse("Choose a sample, a titrant and an indicator."));
      if (!sample.correct) return same(mistake("wrong-sample", 4, `${sample.name} is not this assay's sample.`, (sample as { why: string }).why));
      if (!titrant.correct) return same(mistake("wrong-titrant", 4, `${titrant.name} cannot be used here.`, (titrant as { why: string }).why));
      const fb: Feedback[] = [];
      if (!ind.correct) fb.push(mistake(`indicator-${ind.id}`, 10, `${INDICATORS[ind.id].name} selected.`, ind.why));
      else fb.push(ok(ind.why));
      return next({ sample: sample.id, titrant: titrant.id, indicator: ind.id }, ...fb);
    }

    case "placeBoat":
      if (!reagentsChosen) return same(refuse("Choose the sample and reagents first."));
      if (s.boatOn) return same(info("The weighing boat is already on the pan."));
      return next({ boatOn: true, doorsClosed: false }, info("Boat on the pan. Close the doors and tare before adding sample."));

    case "doors":
      return next({ doorsClosed: a.closed });

    case "tare": {
      if (!s.boatOn) return same(refuse("Put the empty weighing boat on the pan first, then tare, so the display reads the sample only."));
      if (s.sampleOnBoatG > 0) return same(refuse("Tare with the EMPTY boat. Remove the sample first, or the display will hide what you added."));
      const fb: Feedback[] = [];
      if (!s.doorsClosed) fb.push(warn("Tared with the draught shield open — close the doors and tare again for a stable zero."));
      return next({ tareG: METHOD.boatMassG }, ...(fb.length ? fb : [ok("Balance tared: 0.0000 g.")]));
    }

    case "addSample": {
      if (!s.boatOn) return same(refuse("Place a weighing boat on the pan first."));
      if (s.tareG === 0) return same(refuse("Tare the balance with the empty boat before adding sample — otherwise the reading includes the boat."));
      if (s.massRecorded !== null) return same(refuse("The mass is already recorded. Weighing more now would make the record wrong."));
      const r = rand(s.seed, 11, s.additions);
      const g = a.amount === "scoop" ? 0.18 + r * 0.08 : 0.008 + r * 0.012;
      return next({ sampleOnBoatG: round(s.sampleOnBoatG + g, 4), additions: s.additions + 1, doorsClosed: false });
    }

    case "removeSample": {
      if (s.sampleOnBoatG <= 0) return same(info("There is no sample on the boat."));
      if (s.massRecorded !== null) return same(refuse("The mass is already recorded."));
      const g = Math.min(s.sampleOnBoatG, 0.008 + rand(s.seed, 13, s.additions) * 0.01);
      return next({ sampleOnBoatG: round(s.sampleOnBoatG - g, 4), additions: s.additions + 1, doorsClosed: false });
    }

    case "recordMass": {
      if (s.sampleOnBoatG <= 0) return same(refuse("Weigh the sample first."));
      const disp = balanceDisplay(s);
      const [lo, hi] = METHOD.sampleTargetG;
      if (disp.value < lo || disp.value > hi) {
        return same(refuse(`The method asks for ${lo.toFixed(2)}–${hi.toFixed(2)} g. The display reads ${disp.value.toFixed(4)} g — adjust with scoops or taps.`));
      }
      const fb: Feedback[] = [];
      if (!disp.stable) fb.push(mistake("doors-open", 4, "Recorded with the draught shield open.", "Air currents move an analytical balance's last digits; a reading taken with the doors open can be wrong by several tenths of a milligram."));
      if (Math.abs(a.value - disp.value) > 0.00005) {
        return same(...fb, mistake("mass-transcription", 3, `You wrote ${fmt(a.value, 4)} g but the display reads ${disp.value.toFixed(4)} g.`, "Transcription errors carry straight into the assay. Copy every digit the balance shows."));
      }
      return next({ massRecorded: round(a.value, 4) }, ...fb, ok(`Mass recorded: ${a.value.toFixed(4)} g.`));
    }

    case "transfer":
      if (s.massRecorded === null) return same(refuse("Record the mass before transferring the sample."));
      if (s.transferred) return same(info("The sample is already in the flask."));
      return next(
        { transferred: true, transferredG: round(s.sampleOnBoatG * (1 - EFFECT.boatLossFraction), 5), sampleOnBoatG: 0 },
        info("Sample tipped into the volumetric flask through the funnel. Rinse the boat and funnel into the flask so nothing is left behind."),
      );

    case "rinseBoat":
      if (!s.transferred) return same(refuse("Transfer the sample first."));
      if (s.rinsedBoat) return same(info("Already rinsed."));
      return next({ rinsedBoat: true, transferredG: round(s.transferredG / (1 - EFFECT.boatLossFraction), 5), flaskWaterMl: s.flaskWaterMl + 10 }, ok("Boat and funnel rinsed into the flask — quantitative transfer."));

    case "dissolve": {
      if (!s.transferred) return same(refuse("There is nothing in the flask to dissolve yet."));
      if (s.dissolved) return same(info("The sample is dissolved."));
      const fb: Feedback[] = [];
      if (!s.rinsedBoat) fb.push(mistake("transfer-not-quantitative", 6, "The boat and funnel were not rinsed into the flask.", "Powder left on the boat and funnel never reaches the flask — about 0.6 % of the sample here — so the assay comes out low."));
      return next({ dissolved: true, rinsedBoat: true, flaskWaterMl: Math.max(s.flaskWaterMl, 50) }, ...fb, ok("About half-filled with water and swirled until every crystal dissolved."));
    }

    case "addWater": {
      if (!s.dissolved) return same(refuse("Dissolve the sample in about half the volume first — making up to the mark over undissolved solid gives a volume you cannot trust."));
      if (s.aliquotAcidMmol > 0 || s.titrations.length) return same(refuse("The solution is already in use."));
      if (![20, 5, 1, 0.2, 0.05].includes(a.ml)) return same();
      const vol = round(s.flaskWaterMl + a.ml, 2);
      const fb: Feedback[] = [];
      if (vol > METHOD.flaskMl + METHOD.flaskToleranceMl) {
        fb.push(mistake("flask-overshoot", 8, `The meniscus is above the mark (${vol.toFixed(2)} mL).`, "Over-filling dilutes the sample. You cannot take water back out: the honest correction is to discard and prepare the solution again."));
      }
      return next({ flaskWaterMl: vol, flaskMixed: false }, ...fb);
    }

    case "mixFlask":
      if (s.flaskWaterMl < 95) return same(refuse("Make up to the mark first, then stopper and invert."));
      return next({ flaskMixed: true }, ok("Stoppered and inverted about ten times — the solution is uniform."));

    case "discardFlask":
      if (!s.transferred) return same(info("Nothing to discard."));
      if (s.titrations.length) return same(refuse("You have already titrated from this solution."));
      return next(
        { transferred: false, transferredG: 0, rinsedBoat: false, dissolved: false, flaskWaterMl: 0, flaskMixed: false, massRecorded: null, sampleOnBoatG: 0, aliquotAcidMmol: 0, aliquotVolMl: 0, pipetteRinsed: false, indicatorAdded: false, waterAdded: false },
        info("Solution discarded. Weigh a fresh portion of sample."),
      );

    case "rinsePipette":
      if (!s.flaskMixed) return same(refuse("Prepare and mix the sample solution first."));
      return next({ pipetteRinsed: true }, ok("Pipette rinsed with a little of the sample solution, and the rinse discarded."));

    case "pipette": {
      if (s.flaskWaterMl < 99) return same(refuse(`The flask holds ${s.flaskWaterMl.toFixed(2)} mL — make up to the 100 mL mark before taking an aliquot.`));
      if (s.aliquotAcidMmol > 0) return same(refuse("There is already an aliquot in the conical flask. Titrate it, or start a new titration."));
      const fb: Feedback[] = [];
      let c = flaskConc(s);
      if (!s.flaskMixed) {
        fb.push(mistake("flask-not-mixed", 6, "Aliquot taken before the flask was stoppered and inverted.", "Water added at the mark sits on top until mixed; the aliquot's concentration is not the flask's average, so replicate titres disagree."));
        c *= 0.97 + rand(s.seed, 21, s.titrations.length) * 0.06;
      }
      if (Math.abs(s.flaskWaterMl - METHOD.flaskMl) > METHOD.flaskToleranceMl && s.flaskWaterMl < METHOD.flaskMl) {
        fb.push(mistake("flask-under", 6, `Flask only filled to ${s.flaskWaterMl.toFixed(2)} mL.`, "The calculation assumes 100.00 mL. Under-filling concentrates the solution and the assay comes out high."));
      }
      let vol = METHOD.aliquotMl;
      if (!s.pipetteRinsed) {
        fb.push(mistake("pipette-not-rinsed", 4, "Pipette not rinsed with the sample solution.", "Water left inside dilutes the first aliquot by about 1 %, so the titre — and the assay — come out low."));
        c *= EFFECT.unrinsedPipetteDilution;
      }
      if (a.style === "blow") {
        fb.push(mistake("blow-out", 3, "The last drop was blown out of the pipette.", "A Class A bulb pipette is calibrated TO DELIVER with the tip touched to the glass. Blowing out adds about 0.03 mL more than 20.00 mL."));
        vol += EFFECT.blowOutExtraMl;
      }
      return next({ aliquotAcidMmol: c * vol, aliquotVolMl: vol, pipetteRinsed: true }, ...fb, ok(`${METHOD.aliquotMl}.00 mL aliquot delivered into the conical flask.`));
    }

    case "addDiluent":
      if (s.aliquotAcidMmol === 0) return same(refuse("Pipette the aliquot into the flask first."));
      return next({ waterAdded: true }, info(`About ${METHOD.waterAddedMl} mL of water added. It does not change the amount of acid — only makes the colour change easier to see.`));

    case "addIndicator":
      if (s.aliquotAcidMmol === 0) return same(refuse("Pipette the aliquot first, then add the indicator to it."));
      if (s.indicatorAdded) return same(info("Two drops are enough. More indicator is itself a weak acid and shifts the end-point."));
      return next({ indicatorAdded: true }, ok(`Two drops of ${INDICATORS[s.indicator!].name.toLowerCase()} added.`));

    case "placeTile":
      return next({ tileUnder: true }, ok("White tile under the flask — the first faint colour is now easy to see."));

    case "rinseBurette":
      if (!reagentsChosen) return same(refuse("Choose the titrant first."));
      if (s.buretteFilled) return same(refuse("The burette is already filled."));
      return next({ buretteRinsed: true }, ok("Burette rinsed twice with small portions of the NaOH titrant, run out through the tip."));

    case "fillBurette": {
      if (!reagentsChosen) return same(refuse("Choose the titrant first."));
      if (s.buretteFilled) return same(info("The burette is already filled."));
      const fb: Feedback[] = [];
      if (!s.buretteRinsed) fb.push(mistake("burette-not-rinsed", 8, "Burette filled without rinsing it with titrant.", "Water inside dilutes the NaOH by about 1.5 %. More of it is then needed to reach the end-point, so the assay comes out about 1.5 % HIGH."));
      return next({ buretteFilled: true, funnelRemoved: false, bubble: true, level: -1.2, initialRecorded: null }, ...fb, info("Filled above the zero mark through a funnel, with the stopcock closed."));
    }

    case "removeFunnel":
      if (!s.buretteFilled) return same(refuse("Fill the burette first."));
      return next({ funnelRemoved: true }, ok("Funnel removed — liquid draining from it can no longer change the reading."));

    case "expelBubble": {
      if (!s.buretteFilled) return same(refuse("Fill the burette first."));
      if (!s.bubble) return same(info("No air remains in the tip."));
      const level = round(0.2 + rand(s.seed, 31, s.titrations.length) * 0.5, 2);
      return next({ bubble: false, level }, ok("Stopcock opened fully for a moment: the air bubble is flushed out of the tip."));
    }

    case "runToZero": {
      // A gentle run-out brings the meniscus onto the scale but does NOT flush the air
      // trapped below the stopcock — only a brief, fully open stream does that.
      if (!s.buretteFilled) return same(refuse("Fill the burette first."));
      if (s.level >= 0) return same(info("The meniscus is already on the scale."));
      const level = round(0.2 + rand(s.seed, 31, s.titrations.length) * 0.5, 2);
      return next({ level }, info("A little titrant run out slowly: the meniscus is now just below the zero mark."));
    }

    case "recordInitial": {
      if (!s.buretteFilled) return same(refuse("Fill the burette first."));
      if (s.initialRecorded !== null) return same(info("The initial reading is already recorded."));
      const fb: Feedback[] = [];
      if (s.level < 0) return same(refuse("The meniscus is above the zero mark — run a little out first (expel the air bubble) so it sits on the scale."));
      if (!s.funnelRemoved) fb.push(mistake("funnel-left", 4, "Initial reading taken with the funnel still in the burette.", "Liquid draining from the funnel raises the level after you read it, so the initial reading — and the titre — are wrong."));
      if (s.bubble) fb.push(mistake("bubble", 6, "Air bubble left in the burette tip.", `The bubble escapes during the titration: the reading changes by about ${EFFECT.bubbleMl} mL more than was delivered, so the titre is falsely high.`));
      if (Math.abs(a.value - s.level) > METHOD.readingToleranceMl) {
        return same(...fb, mistake("misread-initial", 4, `${fmt(a.value, 2)} mL does not match the meniscus.`, "Read the bottom of the meniscus at eye level, to two decimal places (the second estimated between 0.1 mL divisions)."));
      }
      return next({ initialRecorded: round(a.value, 2), startLevel: s.level }, ...fb, ok(`Initial reading ${a.value.toFixed(2)} mL recorded.`));
    }

    case "addTitrant": {
      if (!ADD_STEPS.includes(a.ml)) return same();
      if (s.initialRecorded === null) return same(refuse("Record the initial burette reading before running in any titrant."));
      if (s.aliquotAcidMmol === 0) return same(refuse("There is no aliquot in the conical flask."));
      if (!s.indicatorAdded) return same(refuse("Add the indicator before titrating, or you will not see the end-point."));
      const room = METHOD.buretteCapacityMl - s.level;
      if (room <= 0) return same(refuse("The burette is empty. Record what you have and refill."));
      const ml = Math.min(a.ml, room);
      // An air bubble escapes during the first big additions: the reading moves, nothing is delivered.
      const bubbleLoss = s.bubble ? Math.min(ml, EFFECT.bubbleMl) : 0;
      const after: TitrationState = { ...s, level: round(s.level + ml, 3), deliveredMl: round(s.deliveredMl + ml - bubbleLoss, 3), bubble: false, swirled: false };
      const fb: Feedback[] = [];
      const before = endpointOf(s);
      const now = endpointOf(after);
      if (!s.tileUnder) fb.push(mistake("no-tile", 2, "Titrating without a white tile.", "Against the dark bench the first faint pink is easy to miss, which tends to overshoot the end-point."));
      if (before !== "over" && now === "over") {
        fb.push(mistake("overshoot", 8, "End-point overshot — the solution is a deep pink.", "Excess titrant counts as if it reacted with the sample, so the assay comes out high. Near the end-point add titrant drop by drop, swirling after each."));
      }
      return { state: after, feedback: fb };
    }

    case "swirl":
      return next({ swirled: true });

    case "recordFinal": {
      if (s.initialRecorded === null) return same(refuse("Record the initial reading first."));
      if (s.deliveredMl === 0 && s.level <= (s.initialRecorded ?? 0)) return same(refuse("No titrant has been added yet."));
      const fb: Feedback[] = [];
      if (!s.swirled) fb.push(mistake("not-swirled", 3, "Final reading taken without swirling after the last addition.", "A local patch of colour where the drop landed is not the end-point. Swirl, then judge the colour of the whole solution."));
      const ep = endpointOf({ ...s, swirled: true });
      if (ep === "under") fb.push(mistake("stopped-early", 8, "The titration was stopped before the end-point.", "Unreacted acid remains, so the titre — and the assay — come out low."));
      if (Math.abs(a.value - s.level) > METHOD.readingToleranceMl) {
        return same(...fb, mistake("misread-final", 4, `${fmt(a.value, 2)} mL does not match the meniscus.`, "Read the bottom of the meniscus at eye level, to two decimal places."));
      }
      const t: Titration = { initialTrue: s.startLevel, initialRecorded: s.initialRecorded, finalTrue: s.level, finalRecorded: round(a.value, 2), endpoint: ep };
      return next({ titrations: [...s.titrations, t] }, ...fb, ok(`Final reading ${a.value.toFixed(2)} mL. Titre ${(a.value - (s.initialRecorded ?? 0)).toFixed(2)} mL.`));
    }

    case "newTitration": {
      if (s.titrations.length === 0) return same(refuse("Finish the first titration (record the final reading) before starting another."));
      if (s.titrations.length >= 3) return same(refuse("Three titrations is the limit for this exercise."));
      if (s.titreEntered !== null) return same(refuse("Results are already calculated."));
      return next(
        { aliquotAcidMmol: 0, aliquotVolMl: 0, waterAdded: false, indicatorAdded: false, deliveredMl: 0, buretteFilled: false, funnelRemoved: false, bubble: true, initialRecorded: null, swirled: true, level: 0 },
        info("Fresh conical flask. Take a new aliquot and refill the burette."),
      );
    }

    case "enterResults": {
      if (s.titrations.length === 0) return same(refuse("Complete a titration before calculating."));
      const exp = expectedResult(s);
      if (!Number.isFinite(a.titre) || !Number.isFinite(a.assay)) return same(refuse("Enter both the titre and the assay as numbers."));
      if (Math.abs(a.titre - exp.mean) > 0.011) {
        return same(mistake("calc-titre", 3, `Titre ${fmt(a.titre, 2)} mL is not final − initial (mean of your titrations: ${fmt(exp.mean, 2)} mL).`, "The titre is the difference between your final and initial readings; with replicates, use their mean."));
      }
      if (Math.abs(a.assay - exp.assay) > 0.1) {
        return same(mistake("calc-assay", 5, `Assay ${fmt(a.assay, 2)} % does not follow from your data.`, "Work it through: mmol NaOH = titre × molarity; ÷ 3 for citric acid; × 210.14 mg/mmol; × 100/20 for the dilution; ÷ sample mass (mg) × 100."));
      }
      return next({ titreEntered: round(a.titre, 2), assayEntered: round(a.assay, 2) }, ok("Calculation correct."));
    }

    case "verdict": {
      if (s.assayEntered === null) return same(refuse("Calculate the assay first."));
      const [lo, hi] = METHOD.limits;
      const complies = s.assayEntered >= lo && s.assayEntered <= hi;
      if ((a.value === "complies") !== complies) {
        return same(mistake("verdict", 4, "That conclusion does not match your result.", `The illustrative limit is ${lo.toFixed(1)}–${hi.toFixed(1)} %. ${s.assayEntered.toFixed(2)} % ${complies ? "is inside" : "is outside"} it.`));
      }
      return next({ verdict: a.value }, ok(complies ? "Complies with the illustrative limit." : "Does not comply — correctly reported. A failing result honestly reported is a correct result."));
    }
  }
}

const STEP_DONE: Record<string, (s: TitrationState) => boolean> = {
  inspect: (s) => KEY_ITEMS.every((k) => s.inspected.includes(k)),
  apparatus: (s) => s.apparatusOk,
  reagents: (s) => s.sample === "citric" && s.titrant === "naoh" && !!s.indicator,
  weigh: (s) => s.massRecorded !== null,
  solution: (s) => s.flaskMixed && s.flaskWaterMl >= 99,
  aliquot: (s) => (s.aliquotAcidMmol > 0 && s.indicatorAdded) || s.titrations.length > 0,
  burette: (s) => s.initialRecorded !== null || s.titrations.length > 0,
  titrate: (s) => s.titrations.length > 0,
  calculate: (s) => s.assayEntered !== null,
  compare: (s) => s.verdict !== null,
};

/**
 * The instruments (2026-10-21 upgrade). Each physical action is available only from the
 * instrument it is done with; the run machine refuses it otherwise. Swirling and the white
 * tile are on the burette too, because the student titrates with one hand on the stopcock
 * and the other swirling the flask beneath it.
 */
const CONTROLLERS: ControllerDef[] = [
  { id: "cupboard", name: "Glassware cupboard", equipment: ["cupboard"], actions: ["chooseApparatus"], brief: "Choose the apparatus this assay needs and set it out on the bench.", howTo: ["Tick only what the method needs.", "Exact volumes need Class A volumetric glassware."] },
  { id: "reagents", name: "Reagent shelf", equipment: ["sample", "titrant", "indicator"], actions: ["chooseReagents"], brief: "Select the sample, the titrant and the indicator.", howTo: ["Read each label before you choose.", "Match the indicator's range to the pH at equivalence."], nearby: ["balance"] },
  { id: "balance", name: "Analytical balance", equipment: ["balance"], actions: ["placeBoat", "doors", "tare", "addSample", "removeSample", "recordMass"], brief: "Weigh about 1 g of sample to 0.1 mg.", howTo: ["Boat on the pan, close the doors, then tare.", "Scoops to get close, taps to finish; read only when the display says stable."], nearby: ["vol-flask"] },
  { id: "vol-flask", name: "Volumetric flask", equipment: ["vol-flask", "wash-bottle"], actions: ["transfer", "rinseBoat", "dissolve", "addWater", "mixFlask", "discardFlask"], brief: "Dissolve the sample and make it up to exactly 100 mL.", howTo: ["Rinse the boat and funnel in so nothing is lost.", "Finish with drops until the bottom of the meniscus sits on the mark, then invert."], nearby: ["balance", "pipette"] },
  { id: "pipette", name: "Bulb pipette", equipment: ["pipette"], actions: ["rinsePipette", "pipette"], brief: "Deliver a 20.00 mL aliquot into the conical flask.", howTo: ["Rinse with a little of the sample solution first.", "Let it drain, then touch the tip against the glass."], nearby: ["vol-flask", "conical-flask"] },
  { id: "conical-flask", name: "Conical flask", equipment: ["conical-flask", "tile"], actions: ["addDiluent", "addIndicator", "placeTile", "swirl", "newTitration"], brief: "Prepare the aliquot for titration.", howTo: ["Add a little water and two drops of indicator.", "Stand it on the white tile under the burette."], nearby: ["pipette", "burette"] },
  { id: "burette", name: "Burette", equipment: ["burette", "stand"], actions: ["rinseBurette", "fillBurette", "removeFunnel", "expelBubble", "runToZero", "recordInitial", "addTitrant", "swirl", "placeTile", "recordFinal"], brief: "Fill, read and operate the stopcock.", howTo: ["Rinse with titrant, fill, remove the funnel, clear the air from the tip.", "Hold the valve for a stream; use single drops near the end-point and swirl after each."], nearby: ["conical-flask", "notebook"] },
  { id: "notebook", name: "Lab notebook", equipment: ["notebook"], actions: ["enterResults", "verdict"], brief: "Calculate the assay from your readings and state the conclusion.", howTo: ["Use the mean of your titres.", "Compare your own result with the limit."], nearby: ["burette"] },
];

/** Learning mode: the next correct move. Never reveals a reading or the end-point. */
function suggest(s: TitrationState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  if (!KEY_ITEMS.every((k) => s.inspected.includes(k))) return null; // inspection is finding, not operating
  if (!s.apparatusOk) return to("cupboard", "chooseApparatus");
  if (!STEP_DONE.reagents(s)) return to("reagents", "chooseReagents");
  if (s.massRecorded === null) {
    if (!s.boatOn) return to("balance", "placeBoat");
    if (s.tareG === 0) return to("balance", s.doorsClosed ? "tare" : "doors");
    const v = balanceDisplay(s).value;
    if (v < METHOD.sampleTargetG[0]) return to("balance", "addSample");
    if (v > METHOD.sampleTargetG[1]) return to("balance", "removeSample");
    return to("balance", s.doorsClosed ? "recordMass" : "doors");
  }
  if (!STEP_DONE.solution(s)) {
    if (!s.transferred) return to("vol-flask", "transfer");
    if (!s.rinsedBoat) return to("vol-flask", "rinseBoat");
    if (!s.dissolved) return to("vol-flask", "dissolve");
    if (s.flaskWaterMl > METHOD.flaskMl + METHOD.flaskToleranceMl) return to("vol-flask", "discardFlask");
    if (s.flaskWaterMl < METHOD.flaskMl - METHOD.flaskToleranceMl) return to("vol-flask", "addWater");
    return to("vol-flask", "mixFlask");
  }
  // A repeat titration is in progress once "new titration" has reset the flask and its
  // final reading is not yet on the record.
  const last = s.titrations[s.titrations.length - 1];
  const lastIsCurrent = !!last && last.initialRecorded === s.initialRecorded && last.finalTrue === s.level;
  if (s.titrations.length === 0 || (s.titreEntered === null && !lastIsCurrent)) {
    if (s.aliquotAcidMmol === 0) return to("pipette", s.pipetteRinsed ? "pipette" : "rinsePipette");
    if (!s.waterAdded) return to("conical-flask", "addDiluent");
    if (!s.indicatorAdded) return to("conical-flask", "addIndicator");
    if (!s.tileUnder) return to("conical-flask", "placeTile");
    if (!s.buretteFilled) return to("burette", s.buretteRinsed ? "fillBurette" : "rinseBurette");
    if (!s.funnelRemoved) return to("burette", "removeFunnel");
    if (s.bubble) return to("burette", "expelBubble");
    if (s.level < 0) return to("burette", "runToZero");
    if (s.initialRecorded === null) return to("burette", "recordInitial");
    // the end-point is the student's judgement: point at the valve, never at "stop"
    return to("burette", s.swirled ? "addTitrant" : "swirl");
  }
  if (s.titreEntered === null) return to("notebook", "enterResults");
  if (s.verdict === null) return to("notebook", "verdict");
  return null;
}

function observations(s: TitrationState): ObservationSection[] {
  const exp = expectedResult(s);
  const conc = concordance(exp.titres);
  return [
    {
      title: "Reagents",
      rows: [
        { label: "Sample", value: s.sample === "citric" ? "Citric acid monohydrate (CA-01)" : "—", source: "recorded" },
        { label: "Titrant", value: s.titrant === "naoh" ? `NaOH ${METHOD.titrantMolar.toFixed(4)} M` : "—", source: "recorded" },
        { label: "Indicator", value: s.indicator ? INDICATORS[s.indicator].name : "—", source: "recorded" },
      ],
    },
    {
      title: "Weighing and dilution",
      rows: [
        { label: "Mass of sample", value: s.massRecorded !== null ? `${s.massRecorded.toFixed(4)} g` : "—", source: "recorded" },
        { label: "Made up to", value: s.flaskWaterMl ? `${METHOD.flaskMl}.00 mL (meniscus at ${s.flaskWaterMl.toFixed(2)} mL)` : "—", source: "observed" },
        { label: "Aliquot", value: `${METHOD.aliquotMl}.00 mL`, source: "recorded" },
      ],
    },
    {
      title: "Burette readings",
      rows: s.titrations.length
        ? s.titrations.flatMap((t, i) => [
            { label: `Titration ${i + 1}: initial / final`, value: `${t.initialRecorded.toFixed(2)} / ${t.finalRecorded.toFixed(2)} mL`, source: "recorded" as const },
            { label: `Titration ${i + 1}: titre`, value: `${(t.finalRecorded - t.initialRecorded).toFixed(2)} mL — end-point ${t.endpoint === "faint" ? "faint permanent pink" : t.endpoint === "over" ? "overshot (deep pink)" : "not reached"}`, source: "calculated" as const },
          ])
        : [{ label: "Titrations", value: "none yet", source: "recorded" }],
    },
    {
      title: "Results",
      rows: [
        { label: "Mean titre", value: Number.isFinite(exp.mean) ? `${exp.mean.toFixed(2)} mL${exp.titres.length > 1 ? ` (range ${conc.range.toFixed(2)} mL, ${conc.concordant ? "concordant" : "not concordant"})` : ""}` : "—", source: "calculated" },
        { label: "Assay (your calculation)", value: s.assayEntered !== null ? `${s.assayEntered.toFixed(2)} % w/w` : "—", source: "recorded" },
        { label: "Conclusion", value: s.verdict ? (s.verdict === "complies" ? "Complies with the illustrative limit" : "Does not comply") : "—", source: "recorded" },
      ],
    },
  ];
}

function report(s: TitrationState): ExperimentReport {
  const exp = expectedResult(s);
  const eq = equivalenceFactorMg(METHOD.titrantMolar);
  const last = s.titrations[s.titrations.length - 1];
  const [lo, hi] = METHOD.limits;
  return {
    headline: s.assayEntered !== null ? `Assay ${s.assayEntered.toFixed(2)} % w/w C₆H₈O₇·H₂O` : "Assay not calculated",
    calculations: [
      { label: "Titre", expression: "final − initial reading (mean of replicates)", result: `${fmt(exp.mean, 2)} mL` },
      { label: "NaOH reacted", expression: `${fmt(exp.mean, 2)} mL × ${METHOD.titrantMolar.toFixed(4)} mmol/mL`, result: `${fmt(exp.mean * METHOD.titrantMolar, 4)} mmol` },
      { label: "Citric acid in aliquot", expression: "mmol NaOH ÷ 3 (three acidic protons)", result: `${fmt((exp.mean * METHOD.titrantMolar) / 3, 4)} mmol` },
      { label: "Mass in aliquot", expression: "mmol × 210.14 mg/mmol", result: `${fmt(((exp.mean * METHOD.titrantMolar) / 3) * CITRIC.molarMassMonohydrate, 2)} mg` },
      { label: "Equivalence factor", expression: `1 mL of ${METHOD.titrantMolar.toFixed(4)} M NaOH ≡`, result: `${eq.toFixed(3)} mg C₆H₈O₇·H₂O` },
      { label: "Assay", expression: `mass in aliquot × (100 ÷ 20) ÷ (${fmt(s.massRecorded ?? NaN, 4)} g × 1000) × 100`, result: `${fmt(exp.assay, 2)} %` },
    ],
    outcome: [
      { label: "Your assay", value: s.assayEntered !== null ? `${s.assayEntered.toFixed(2)} %` : "—", verdict: s.assayEntered !== null ? (s.assayEntered >= lo && s.assayEntered <= hi ? "pass" : "fail") : "info" },
      { label: "Illustrative limit", value: `${lo.toFixed(1)}–${hi.toFixed(1)} %`, verdict: "info" },
      { label: "True content of this simulated sample", value: `${s.purity.toFixed(2)} %`, verdict: "info" },
      { label: "Last end-point", value: last ? (last.endpoint === "faint" ? "faint permanent pink — correct" : last.endpoint === "over" ? "overshot" : "not reached") : "—", verdict: last ? (last.endpoint === "faint" ? "pass" : "fail") : "info" },
    ],
    learning: [
      "The gap between your assay and the sample's true content is your experimental error — each technique mistake in the list below contributed to it.",
      "Phenolphthalein turns faint pink just before the true equivalence point; that small indicator error is why methods are standardised with the same indicator.",
      "Replicate titres that agree within 0.10 mL (concordant) show the technique is reproducible; a single titre cannot.",
    ],
  };
}

export const TITRATION: ExperimentDefinition<TitrationState, TitrationAction> = {
  meta: LABS["acid-base-titration"],
  principle: [
    "Citric acid is a weak triprotic acid (pKa 3.13, 4.76, 6.40). Sodium hydroxide neutralises all three carboxyl groups: C₆H₈O₇ + 3 NaOH → Na₃C₆H₅O₇ + 3 H₂O, so 3 mol of NaOH react with 1 mol of citric acid.",
    "At the equivalence point the solution contains sodium citrate, a weak base, so the pH is alkaline (about 9). Phenolphthalein (colourless below pH 8.2, pink above about 9) marks it; indicators that change in acid solution do not.",
    "A known mass of sample is dissolved and made up to 100.00 mL; a 20.00 mL aliquot is titrated. The titre gives the moles of NaOH, hence the moles and mass of citric acid in the aliquot, scaled up by 100/20 to the whole sample.",
    "This is an illustrative scaled-down method. The official monographs (Ph. Eur. 0456 / USP Citric Acid Monohydrate) dissolve 0.550 g in 50 mL water and titrate directly with 1 M NaOH to phenolphthalein (1 mL ≡ 64.03 mg C₆H₈O₇), with limits of 99.5–100.5 % calculated on the anhydrous substance. Here the result is expressed as the monohydrate and the limit is a teaching value.",
    "Model assumptions: concentrations stand in for activities, 25 °C, additive volumes. The sample, its purity and the NaOH molarity are simulated teaching values.",
  ],
  safety: [
    "Wear a lab coat, safety glasses and gloves. Sodium hydroxide is corrosive to eyes and skin, even at 0.1 M.",
    "Never pipette by mouth — use a pipette filler.",
    "Fill the burette below eye level with a funnel, then remove the funnel.",
    "Rinse spills with plenty of water; report any splash to the eyes and use the eyewash station at once.",
  ],
  equipment: [
    { id: "burette", name: "Burette (50 mL, Class A)", description: "A graduated glass tube with a stopcock, delivering measured volumes of titrant.", use: "Holds the NaOH titrant; the titre is the difference between two readings.", spec: "0–50 mL, 0.1 mL divisions, tolerance ±0.05 mL", safety: "Fill below eye level." },
    { id: "stand", name: "Retort stand and burette clamp", description: "Holds the burette vertical and steady.", use: "A vertical burette reads correctly and drains evenly." },
    { id: "pipette", name: "Bulb pipette (20 mL, Class A) with filler", description: "Delivers one fixed volume with high accuracy.", use: "Transfers the 20.00 mL aliquot of sample solution.", spec: "20 mL ±0.03 mL, to deliver (Ex)", safety: "Always use the filler." },
    { id: "vol-flask", name: "Volumetric flask (100 mL, Class A)", description: "Contains exactly 100.00 mL at 20 °C when filled to the mark.", use: "The weighed sample is dissolved and made up to volume in it.", spec: "100 mL ±0.08 mL, to contain (In)" },
    { id: "conical-flask", name: "Conical flask (250 mL)", description: "Sloped walls let the contents be swirled without splashing.", use: "The aliquot is titrated in it, on the white tile." },
    { id: "balance", name: "Analytical balance", description: "Weighs to 0.1 mg inside a draught shield.", use: "Weighs the sample by difference from a tared boat.", spec: "Readability 0.0001 g" },
    { id: "indicator", name: "Indicator bottles", description: "Dropper bottles of acid–base indicators.", use: "Two drops of the chosen indicator mark the end-point." },
    { id: "sample", name: "Sample bottle CA-01 — citric acid monohydrate", description: "A simulated sample for assay. Colourless crystals, very soluble in water.", use: "About 1 g is weighed accurately for the assay." },
    { id: "titrant", name: "Sodium hydroxide 0.1 M (standardised)", description: `Volumetric solution; the label gives the standardised molarity, ${METHOD.titrantMolar.toFixed(4)} M.`, use: "The titrant in the burette.", safety: "Corrosive." },
    { id: "tile", name: "White tile", description: "A white background under the titration flask.", use: "Makes the first faint colour change visible." },
    { id: "wash-bottle", name: "Wash bottle", description: "Purified water.", use: "Quantitative rinsing, making up to volume, washing down the flask walls." },
    { id: "cupboard", name: "Glassware cupboard", description: "Volumetric and general glassware, with measuring cylinders and beakers alongside the Class A items.", use: "Choose the apparatus this assay needs and set it out on the bench." },
    { id: "notebook", name: "Lab notebook", description: "Your record of the experiment: every reading you recorded is already in it.", use: "Calculate the titre and the assay from your own readings, then state whether the sample complies." },
  ],
  materials: [
    { id: "citric", name: "Citric acid monohydrate (simulated sample CA-01)", detail: "C₆H₈O₇·H₂O, Mr 210.14", hazard: "Eye irritant." },
    { id: "naoh", name: `Sodium hydroxide, ${METHOD.titrantMolar.toFixed(4)} M`, detail: "Standardised volumetric solution", hazard: "Corrosive." },
    { id: "php", name: "Phenolphthalein solution", detail: "pH 8.2 colourless → 10.0 pink" },
    { id: "water", name: "Purified water", detail: "Carbon-dioxide-free water is preferred: dissolved CO₂ consumes NaOH." },
  ],
  steps: [
    { id: "inspect", title: "Inspect the bench", objective: "Find and inspect the burette, stand, pipette, volumetric flask, conical flask, indicator, sample and titrant.", hints: ["Hover or tap an item to see its name; select it to read its details.", "The items still to inspect are listed in the procedure panel."], focus: [...KEY_ITEMS] },
    { id: "apparatus", title: "Set out the apparatus", objective: "Choose the apparatus this assay needs, and only that.", hints: ["The aliquot volume must be exact, and the expected titre is about 28 mL.", "You need a 50 mL burette, a 20 mL bulb pipette and a 100 mL volumetric flask — not a measuring cylinder or beaker."], focus: ["cupboard"] },
    { id: "reagents", title: "Choose sample and reagents", objective: "Select the sample, the titrant and an indicator suited to a weak acid–strong base titration.", hints: ["The equivalence point of a weak acid titrated by a strong base is alkaline.", "Phenolphthalein changes colour between pH 8.2 and 10.0."], focus: ["sample", "titrant", "indicator"] },
    { id: "weigh", title: "Weigh the sample", objective: "Tare the empty boat, weigh 0.95–1.05 g of sample with the doors closed, and record the mass.", hints: ["Boat on the pan → close the doors → tare → add sample.", "Use scoops to get close, taps to fine-tune, and close the doors before reading."], focus: ["balance"], safety: "Citric acid irritates the eyes — do not spill it on the bench." },
    { id: "solution", title: "Prepare the sample solution", objective: "Transfer quantitatively, dissolve, make up to the 100 mL mark and mix.", hints: ["Rinse the boat and funnel into the flask so all the sample goes in.", "Bring the bottom of the meniscus exactly to the mark with drops, then stopper and invert."], focus: ["vol-flask"] },
    { id: "aliquot", title: "Take the aliquot", objective: "Rinse the pipette, deliver 20.00 mL into the conical flask, add water and two drops of indicator.", hints: ["Rinse the pipette with a little of the sample solution first.", "A bulb pipette is touched off against the glass — never blown out."], focus: ["pipette", "conical-flask"], safety: "Use the pipette filler." },
    { id: "burette", title: "Prepare the burette", objective: "Rinse with titrant, fill, remove the funnel, expel the air bubble and record the initial reading.", hints: ["Water left in the burette dilutes the titrant — rinse with it twice.", "Read the bottom of the meniscus at eye level, to 0.01 mL."], focus: ["burette", "stand"], safety: "Fill the burette below eye level." },
    { id: "titrate", title: "Titrate", objective: "Run in titrant with swirling until the first permanent faint pink, then record the final reading.", hints: ["Run in quickly at first, then drop by drop once the pink takes longer to fade.", "Swirl after every addition, and stop at the first pink that lasts 30 seconds."], focus: ["burette", "conical-flask", "tile"] },
    { id: "calculate", title: "Calculate", objective: "Enter the titre and the assay calculated from your own readings.", hints: ["Use the mean of your titres.", "Assay % = titre × M × 210.14/3 × (100/20) ÷ (mass × 1000) × 100."], focus: ["notebook"] },
    { id: "compare", title: "Compare with the limit", objective: "Decide whether your result complies with the illustrative limit.", hints: [`The illustrative limit is ${METHOD.limits[0].toFixed(1)}–${METHOD.limits[1].toFixed(1)} %.`], focus: ["notebook"] },
  ],
  questions: [
    { id: "q1", kind: "design", prompt: "Why is phenolphthalein, not methyl orange, used for citric acid with NaOH?", options: ["Phenolphthalein is cheaper", "The equivalence point is alkaline (≈ pH 9), inside phenolphthalein's range", "Methyl orange reacts with citric acid", "Phenolphthalein makes the titration faster"], answer: 1, explanation: "A weak acid titrated with a strong base gives an alkaline equivalence point; methyl orange would change after only a fraction of the acid had reacted." },
    { id: "q2", kind: "calculation", prompt: "How many moles of NaOH react with one mole of citric acid?", options: ["1", "2", "3", "4"], answer: 2, explanation: "Citric acid has three carboxyl groups, all neutralised by the phenolphthalein end-point." },
    { id: "q3", kind: "calculation", prompt: "1 mL of 0.1000 M NaOH is equivalent to how much C₆H₈O₇·H₂O?", options: ["21.01 mg", "7.005 mg", "10.51 mg", "6.404 mg"], answer: 1, explanation: "0.1 mmol NaOH ÷ 3 × 210.14 mg/mmol = 7.005 mg." },
    { id: "q4", kind: "design", prompt: "What happens to the assay if the burette is not rinsed with titrant before filling?", options: ["It comes out high", "It comes out low", "No effect", "The end-point disappears"], answer: 0, explanation: "Water dilutes the titrant, so more volume is needed; the calculation uses the label molarity, so the result is high." },
    { id: "q5", kind: "design", prompt: "Why is the aliquot taken with a bulb pipette rather than a measuring cylinder?", options: ["It is faster", "The aliquot volume defines how much sample is titrated, so it must be accurate", "Measuring cylinders are not glass", "The cylinder would react with NaOH"], answer: 1, explanation: "A Class A pipette is accurate to about ±0.15 %; a cylinder to about ±1 %." },
    { id: "q6", kind: "viva", prompt: "Why is carbon-dioxide-free water preferred for this titration?", options: ["CO₂ forms carbonic acid, which also consumes NaOH", "CO₂ changes the colour of citric acid", "CO₂ makes the burette leak", "It is not preferred"], answer: 0, explanation: "Dissolved CO₂ is an acid; it uses up titrant and blurs the phenolphthalein end-point." },
    { id: "q7", kind: "interpretation", prompt: "Two titres are 28.40 and 28.65 mL. What should you do?", options: ["Report the mean, 28.53 mL", "Report the lower one", "Perform another titration: they are not concordant (range > 0.10 mL)", "Report the higher one"], answer: 2, explanation: "Replicates should agree within 0.10 mL before a mean is trusted." },
    { id: "q8", kind: "viva", prompt: "What does 'Class A' on a volumetric flask or pipette mean?", options: ["It is made of plastic", "It meets the tightest volume tolerance in the standard", "It is for acids only", "It must be blown out"], answer: 1, explanation: "Class A glassware has the smallest permitted error (e.g. ±0.08 mL for a 100 mL flask)." },
  ],
  initial,
  apply,
  controllers: CONTROLLERS,
  suggest,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

/** What the 3D room and the 2D fallback draw. Derived, never stored. */
export function titrationVisual(s: TitrationState) {
  const fr = flaskReading(s);
  const ind = fr.ind;
  let colour: [number, number, number, number] = [0.93, 0.96, 1, 0.12];
  if (ind && s.indicatorAdded) {
    // Swirled: colourless until the engine's own faint-pink threshold. Until 2026-10-21 the
    // colour blended in continuously, so a student who stopped at the first pink that
    // lasted — as taught — was marked "stopped before the end-point" (found by the browser
    // harness reading the swatch). Unswirled: the local pink patch where the drop landed.
    const base = s.swirled ? (fr.f < FAINT_PINK_FRACTION ? 0 : fr.f) : Math.max(fr.f, 0.45);
    const mix = (i: number) => ind.acid[i] * (1 - base) + ind.base[i] * base;
    colour = [mix(0), mix(1), mix(2), Math.max(0.12, ind.acid[3] * (1 - base) + ind.base[3] * base * Math.min(1, base * 1.6))];
  }
  return {
    buretteLevel: s.buretteFilled ? s.level : null,
    bubble: s.buretteFilled && s.bubble,
    funnelIn: s.buretteFilled && !s.funnelRemoved,
    flaskVolume: s.aliquotAcidMmol > 0 ? fr.volume : 0,
    flaskColour: colour,
    volFlaskVolume: s.flaskWaterMl,
    boatOn: s.boatOn,
    sampleOnBoat: s.sampleOnBoatG,
    balance: balanceDisplay(s),
    doorsClosed: s.doorsClosed,
    tile: s.tileUnder,
    pH: fr.pH,
  };
}
