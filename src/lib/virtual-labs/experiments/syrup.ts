/**
 * LAB 2 — Pharmaceutics: preparation and evaluation of Simple Syrup.
 *
 * Formula: the USP "Syrup" proportions (sucrose 850 g, purified water to 1000 mL), scaled
 * to the student's batch. It is ILLUSTRATIVE until checked against the University of
 * Karachi practical manual, and it is a teaching preparation, not a validated clinical
 * or manufacturing formula. Everything a teacher would change lives in `FORMULA`.
 *
 * The model follows the student: an untared balance weighs the boat as sucrose, too much
 * starting water overshoots the batch volume, making up while hot leaves the batch short
 * once it cools, and long heating above 90 °C inverts and colours the sucrose.
 */
import type { ControllerDef, ExperimentDefinition, ExperimentReport, Feedback, ObservationSection, Suggestion } from "../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round, warn } from "../engine/machine";
import { SYRUP_EXPANSION_PER_C, densityAt20, deviationPercent, solutionVolume, sucroseForBatch, waterInBatch, wwFromWv } from "../calculations/syrup";
import { LABS } from "../catalog";

export const FORMULA = {
  name: "Syrup (Simple Syrup)",
  basis: "USP proportions: sucrose 850 g, purified water to 1000 mL",
  sucroseGPer100mL: 85,
  batchOptionsMl: [50, 100] as const,
  /** Starting water as a fraction of batch volume — the USP method dissolves 850 g in about 450 mL. */
  startWaterFraction: 0.45,
  startWaterAcceptable: [0.4, 0.46] as [number, number],
  weighToleranceGPer100: 0.5, // ±0.5 g per 100 mL batch (≈ ±0.6 %), a teaching tolerance
  volumeToleranceMl: 0.5, // half a cylinder division
  boatMassG: 3.12,
  roomC: 25,
  /** Teaching thresholds, stated on screen. */
  overheatC: 90,
  makeUpMaxC: 30,
  /**
   * Evaluation range. The lower bound is the USP Syrup limit (specific gravity not less
   * than 1.30); the upper bound is the top of BP Syrup's weight per mL (1.315–1.333 g).
   */
  densityRange: [1.3, 1.333] as [number, number],
  concentrationRange: [83.3, 86.7] as [number, number], // ±2 % of 85 g/100 mL
};

/** Solubility of sucrose, g per g water (standard values, e.g. CRC Handbook). */
const SOLUBILITY: [number, number][] = [
  [0, 1.79],
  [20, 2.04],
  [40, 2.38],
  [60, 2.87],
  [80, 3.62],
  [100, 4.87],
];
function solubility(tC: number) {
  const t = SOLUBILITY;
  if (tC <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) if (tC <= t[i][0]) return t[i - 1][1] + ((tC - t[i - 1][0]) / (t[i][0] - t[i - 1][0])) * (t[i][1] - t[i - 1][1]);
  return t[t.length - 1][1];
}

export const CONTAINER_OPTIONS = [
  { id: "amber", name: "Clean, dry amber glass bottle with screw cap", correct: true, why: "Clean, dry, well closed — good. Amber is not essential for syrup but does no harm." },
  { id: "clear", name: "Clean, dry clear glass bottle with screw cap", correct: true, why: "Clean, dry and well closed — suitable; sucrose is not light-sensitive." },
  { id: "beaker", name: "The beaker, covered with paper", correct: false, why: "Not a closed container: syrup absorbs moisture and dust, the surface dilutes and supports mould growth." },
  { id: "rinsed", name: "Bottle rinsed with tap water and still wet", correct: false, why: "Water left in the bottle dilutes the surface layer below the self-preserving concentration, and tap water is not purified water." },
] as const;

export const STORAGE_OPTIONS = [
  { id: "cool", text: "Store in a well-closed container in a cool place", correct: true },
  { id: "fridge", text: "Store in a refrigerator at 2–8 °C", correct: false, why: "Cold storage of an 85 % syrup encourages sucrose to crystallise out; a cool place is enough." },
  { id: "none", text: "No storage statement", correct: false, why: "Every label carries storage directions." },
] as const;

export const APPEARANCE_OPTIONS = [
  { id: "clear", text: "Clear, colourless, viscous liquid" },
  { id: "crystals", text: "Viscous liquid with undissolved crystals" },
  { id: "yellow", text: "Clear but pale yellow to brown" },
  { id: "thin", text: "Clear, colourless, noticeably thin (watery)" },
] as const;

const KEY_ITEMS = ["balance", "boat", "sucrose", "beaker", "cylinder", "rod", "water", "hotplate", "bottle"] as const;

export interface SyrupState {
  seed: number;
  inspected: string[];
  batchMl: number | null;
  calcSucrose: number | null;
  calcWater: number | null;
  // balance
  boatOn: boolean;
  tareG: number;
  sucroseOnBoat: number;
  scoops: number;
  massRecorded: number | null;
  // water measurement
  cylinderMl: number; // true volume in the measuring cylinder (starting water)
  cylinderRead: number | null;
  // beaker
  beakerWaterG: number;
  sucroseInBeaker: number;
  sucroseAddedFirst: boolean;
  lumpy: boolean;
  onHotplate: boolean;
  setpoint: number; // 0 = off
  tempC: number;
  stirring: boolean;
  dissolvedG: number;
  heatDamageS: number; // seconds above the overheat threshold
  elapsedS: number;
  dissolveDone: boolean;
  // make-up
  vessel: "cylinder" | "beaker-marks" | null;
  inVessel: boolean;
  rinsed: boolean;
  madeUpAtC: number | null;
  qsWaterG: number;
  mixedAfterQs: boolean;
  finalRead: number | null;
  // pack & evaluate
  container: string | null;
  storage: string | null;
  labelled: boolean;
  appearance: string | null;
  densityMassG: number | null; // displayed mass of 50.0 mL
  densityRecorded: number | null;
  signed: boolean;
}

export type SyrupAction =
  | { type: "inspect"; id: string }
  | { type: "calculate"; batchMl: number; sucroseG: number; waterMl: number }
  | { type: "placeBoat" }
  | { type: "tare" }
  | { type: "addSucrose"; amount: "large" | "scoop" | "tap" }
  | { type: "removeSucrose" }
  | { type: "recordMass"; value: number }
  | { type: "pourWater"; ml: number }
  | { type: "readCylinder"; value: number }
  | { type: "waterToBeaker" }
  | { type: "sucroseToBeaker" }
  | { type: "beakerOnHotplate" }
  | { type: "setHeat"; setpoint: number }
  | { type: "stir"; on: boolean }
  | { type: "wait"; seconds: number }
  | { type: "finishDissolving" }
  | { type: "chooseVessel"; vessel: "cylinder" | "beaker-marks" }
  | { type: "transferToVessel" }
  | { type: "rinseBeaker" }
  | { type: "qs"; ml: number }
  | { type: "mixAfterQs" }
  | { type: "readFinal"; value: number }
  | { type: "pack"; container: string }
  | { type: "label"; storage: string }
  | { type: "observe"; appearance: string }
  | { type: "weighDensity" }
  | { type: "recordDensity"; value: number }
  | { type: "sign" };

// ── Derived quantities ──────────────────────────────────────────────────────

/** Sucrose genuinely on the boat vs what the display says. */
export function syrupBalance(s: SyrupState) {
  const gross = (s.boatOn ? FORMULA.boatMassG : 0) + s.sucroseOnBoat;
  return round(gross - s.tareG, 2);
}

export function batchFigures(s: SyrupState) {
  const water = s.beakerWaterG + s.qsWaterG;
  const undissolved = Math.max(0, s.sucroseInBeaker - s.dissolvedG);
  const volume20 = water > 0 ? solutionVolume(s.sucroseInBeaker, water, 20) : 0;
  const volumeNow = water > 0 ? solutionVolume(s.sucroseInBeaker, water, s.tempC) : 0;
  const ww = water > 0 ? (s.sucroseInBeaker / (s.sucroseInBeaker + water)) * 100 : 0;
  const density = densityAt20(ww);
  const wv = volume20 > 0 ? (s.sucroseInBeaker / volume20) * 100 : 0;
  return { water, undissolved, volume20, volumeNow, ww, density, wv };
}

export function trueAppearance(s: SyrupState): (typeof APPEARANCE_OPTIONS)[number]["id"] {
  const f = batchFigures(s);
  if (s.heatDamageS > 120) return "yellow";
  if (f.undissolved > 0.3 || s.dissolvedG < s.sucroseInBeaker - 0.3) return "crystals";
  if (f.wv > 0 && f.wv < 78) return "thin";
  return "clear";
}

function advance(s: SyrupState, seconds: number): SyrupState {
  let { tempC, dissolvedG, heatDamageS, beakerWaterG } = s;
  const target = s.onHotplate && s.setpoint > 0 ? s.setpoint : FORMULA.roomC;
  const tau = target > tempC ? 90 : 240; // heats faster than it cools in air
  const dt = 5;
  for (let t = 0; t < seconds; t += dt) {
    tempC += (target - tempC) * (1 - Math.exp(-dt / tau));
    const boil = 100 + (dissolvedG / Math.max(1, beakerWaterG)) * 4; // boiling-point elevation, rough
    if (tempC > boil) tempC = boil;
    if (tempC >= FORMULA.overheatC) heatDamageS += dt;
    if (tempC >= boil - 0.5) beakerWaterG = Math.max(1, beakerWaterG - 0.03 * dt); // evaporation at the boil
    if (s.sucroseInBeaker > dissolvedG && beakerWaterG > 0) {
      const cap = Math.min(s.sucroseInBeaker, solubility(tempC) * beakerWaterG);
      const k = 0.004 * (1 + Math.max(0, tempC - 25) / 25) * (s.stirring ? 1 : 0.15) * (s.lumpy ? 0.6 : 1);
      if (cap > dissolvedG) dissolvedG += (cap - dissolvedG) * (1 - Math.exp(-k * dt));
    }
  }
  return { ...s, tempC: round(tempC, 1), dissolvedG: round(dissolvedG, 3), heatDamageS, beakerWaterG: round(beakerWaterG, 2), elapsedS: s.elapsedS + seconds };
}

const initial = (seed: number): SyrupState => ({
  seed,
  inspected: [],
  batchMl: null,
  calcSucrose: null,
  calcWater: null,
  boatOn: false,
  tareG: 0,
  sucroseOnBoat: 0,
  scoops: 0,
  massRecorded: null,
  cylinderMl: 0,
  cylinderRead: null,
  beakerWaterG: 0,
  sucroseInBeaker: 0,
  sucroseAddedFirst: false,
  lumpy: false,
  onHotplate: false,
  setpoint: 0,
  tempC: FORMULA.roomC,
  stirring: false,
  dissolvedG: 0,
  heatDamageS: 0,
  elapsedS: 0,
  dissolveDone: false,
  vessel: null,
  inVessel: false,
  rinsed: false,
  madeUpAtC: null,
  qsWaterG: 0,
  mixedAfterQs: false,
  finalRead: null,
  container: null,
  storage: null,
  labelled: false,
  appearance: null,
  densityMassG: null,
  densityRecorded: null,
  signed: false,
});

function apply(s: SyrupState, a: SyrupAction): { state: SyrupState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<SyrupState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const batch = s.batchMl ?? 100;

  switch (a.type) {
    case "inspect":
      return s.inspected.includes(a.id) ? same() : next({ inspected: [...s.inspected, a.id] });

    case "calculate": {
      if (!(FORMULA.batchOptionsMl as readonly number[]).includes(a.batchMl)) return same(refuse("Choose a batch size of 50 or 100 mL."));
      const need = sucroseForBatch(FORMULA.sucroseGPer100mL, a.batchMl);
      if (!Number.isFinite(a.sucroseG) || Math.abs(a.sucroseG - need) > 0.005) {
        return same(mistake("calc-sucrose", 4, `${fmt(a.sucroseG, 2)} g of sucrose is not right for ${a.batchMl} mL.`, `The formula is ${FORMULA.sucroseGPer100mL} g per 100 mL, so a ${a.batchMl} mL batch needs ${FORMULA.sucroseGPer100mL} × ${a.batchMl}/100 g.`));
      }
      const [lo, hi] = FORMULA.startWaterAcceptable;
      if (!Number.isFinite(a.waterMl) || a.waterMl < lo * a.batchMl - 1e-9 || a.waterMl > hi * a.batchMl + 1e-9) {
        const finalWater = waterInBatch(FORMULA.sucroseGPer100mL, a.batchMl);
        return same(refuse(`Start with about ${Math.round(FORMULA.startWaterFraction * a.batchMl)} mL (${Math.round(lo * 100)}–${Math.round(hi * 100)} % of the batch). The finished batch contains only about ${finalWater.toFixed(1)} g of water in total — start with more and you overshoot the volume; much less and the sucrose cannot dissolve.`));
      }
      return next({ batchMl: a.batchMl, calcSucrose: round(need, 2), calcWater: a.waterMl }, ok(`Batch ${a.batchMl} mL: sucrose ${need.toFixed(2)} g, start with ${a.waterMl} mL purified water, then purified water to ${a.batchMl} mL.`));
    }

    case "placeBoat":
      if (s.calcSucrose === null) return same(refuse("Calculate the quantities first — you need to know what to weigh."));
      return s.boatOn ? same(info("The boat is already on the pan.")) : next({ boatOn: true }, info("Weighing boat on the pan. Tare before adding sucrose."));

    case "tare":
      if (!s.boatOn) return same(refuse("Place the empty weighing boat on the pan, then tare."));
      if (s.sucroseOnBoat > 0) return same(refuse("Tare with the empty boat only."));
      return next({ tareG: FORMULA.boatMassG }, ok("Tared: 0.00 g."));

    case "addSucrose": {
      if (!s.boatOn) return same(refuse("Place a weighing boat on the pan first."));
      if (s.massRecorded !== null) return same(refuse("The weight is already recorded."));
      const r = rand(s.seed, 41, s.scoops);
      const g = a.amount === "large" ? 9 + r * 2 : a.amount === "scoop" ? 1.6 + r * 0.8 : 0.12 + r * 0.16;
      const fb: Feedback[] = [];
      if (s.tareG === 0 && s.sucroseOnBoat === 0) fb.push(mistake("not-tared", 8, "Sucrose added without taring the boat.", `The display now includes the boat (${FORMULA.boatMassG} g). Weighing "to ${s.calcSucrose} g" this way puts in ${FORMULA.boatMassG} g too little sucrose, so the syrup is weak and loses its self-preserving concentration.`));
      return next({ sucroseOnBoat: round(s.sucroseOnBoat + g, 2), scoops: s.scoops + 1 }, ...fb);
    }

    case "removeSucrose":
      if (s.sucroseOnBoat <= 0 || s.massRecorded !== null) return same();
      return next({ sucroseOnBoat: round(Math.max(0, s.sucroseOnBoat - (0.12 + rand(s.seed, 43, s.scoops) * 0.16)), 2), scoops: s.scoops + 1 });

    case "recordMass": {
      if (s.sucroseOnBoat <= 0) return same(refuse("Weigh the sucrose first."));
      const disp = syrupBalance(s);
      if (Math.abs(a.value - disp) > 0.005) return same(mistake("mass-transcription", 3, `You wrote ${fmt(a.value, 2)} g; the display reads ${disp.toFixed(2)} g.`, "Record exactly what the balance shows."));
      const tol = FORMULA.weighToleranceGPer100 * (batch / 100);
      const fb: Feedback[] = [];
      if (Math.abs(s.sucroseOnBoat - (s.calcSucrose ?? 0)) > tol) {
        const dev = deviationPercent(s.sucroseOnBoat, s.calcSucrose ?? NaN);
        fb.push(mistake("weight-out-of-tolerance", 8, `The sucrose actually weighed (${s.sucroseOnBoat.toFixed(2)} g) is ${dev > 0 ? "above" : "below"} the target by ${Math.abs(dev).toFixed(1)} %.`, dev < 0 ? "Too little sucrose gives a weaker syrup: below about 85 % w/v it is no longer self-preserving and can support microbial growth." : "Too much sucrose gives a supersaturated syrup that crystallises on standing, especially when cool."));
      }
      return next({ massRecorded: round(a.value, 2) }, ...fb, ok(`Weight recorded: ${a.value.toFixed(2)} g.`));
    }

    case "pourWater": {
      if (s.calcWater === null) return same(refuse("Calculate the quantities first."));
      if (s.beakerWaterG > 0) return same(refuse("The water is already in the beaker."));
      if (![10, 5, 1, 0.5, -1, -0.5].includes(a.ml)) return same();
      return next({ cylinderMl: round(Math.max(0, Math.min(100, s.cylinderMl + a.ml)), 1), cylinderRead: null });
    }

    case "readCylinder": {
      if (s.cylinderMl <= 0) return same(refuse("Pour purified water into the measuring cylinder first."));
      if (Math.abs(a.value - s.cylinderMl) > 0.25) return same(mistake("misread-cylinder", 3, `${fmt(a.value, 1)} mL does not match the meniscus.`, "Read the bottom of the meniscus at eye level, with the cylinder standing on the bench."));
      const fb: Feedback[] = [];
      if (Math.abs(s.cylinderMl - (s.calcWater ?? 0)) > 1) fb.push(warn(`You calculated ${s.calcWater} mL but measured ${s.cylinderMl} mL.`));
      return next({ cylinderRead: round(a.value, 1) }, ...fb, ok(`${a.value.toFixed(1)} mL of purified water measured.`));
    }

    case "waterToBeaker": {
      if (s.cylinderRead === null) return same(refuse("Read and record the cylinder volume first."));
      if (s.beakerWaterG > 0) return same(info("Already poured."));
      const fb: Feedback[] = [];
      if (s.sucroseInBeaker > 0) {
        fb.push(mistake("water-onto-sugar", 4, "Water poured onto sucrose already in the beaker.", "Water poured onto a heap of sugar forms a hard, slow-dissolving cake. Add the sucrose gradually to the water while stirring."));
      }
      return next({ beakerWaterG: s.cylinderMl * 0.997, cylinderMl: 0, lumpy: s.sucroseInBeaker > 0 }, ...fb, ok("Water poured into the beaker."));
    }

    case "sucroseToBeaker": {
      if (s.massRecorded === null) return same(refuse("Record the weight of sucrose first."));
      if (s.sucroseInBeaker > 0) return same(info("The sucrose is already in the beaker."));
      const fb: Feedback[] = [];
      let lumpy = s.lumpy;
      if (s.beakerWaterG === 0) {
        fb.push(mistake("sugar-first", 3, "Sucrose put into an empty beaker before the water.", "Pouring water onto dry sucrose cakes it; dissolution is much slower. Add sucrose to the water."));
        lumpy = true;
      } else if (!s.stirring) {
        fb.push(mistake("no-stir-on-add", 3, "Sucrose tipped in without stirring.", "Unstirred sucrose settles into a dense layer that dissolves slowly; add it gradually while stirring."));
        lumpy = true;
      }
      return next({ sucroseInBeaker: s.sucroseOnBoat, sucroseOnBoat: 0, lumpy, sucroseAddedFirst: s.beakerWaterG === 0 }, ...fb, info("Sucrose transferred to the beaker."));
    }

    case "beakerOnHotplate":
      return s.onHotplate ? same() : next({ onHotplate: true }, info("Beaker on the hot plate, thermometer in."));

    case "setHeat": {
      if (![0, 40, 60, 80, 100, 120].includes(a.setpoint)) return same();
      if (!s.onHotplate && a.setpoint > 0) return same(refuse("Put the beaker on the hot plate first."));
      const fb: Feedback[] = [];
      if (a.setpoint >= 100) fb.push(warn(`A ${a.setpoint} °C setting will boil the syrup. Above about ${FORMULA.overheatC} °C sucrose inverts (to glucose and fructose) and caramelises, and water boils off.`));
      return next({ setpoint: a.setpoint }, ...fb);
    }

    case "stir":
      if (s.beakerWaterG === 0 && s.sucroseInBeaker === 0) return same(refuse("There is nothing in the beaker to stir."));
      return next({ stirring: a.on });

    case "wait": {
      if (![15, 30, 60, 120, 300].includes(a.seconds)) return same();
      const after = advance(s, a.seconds);
      const fb: Feedback[] = [];
      if (s.heatDamageS <= 60 && after.heatDamageS > 60) {
        fb.push(mistake("overheated", 10, `Held above ${FORMULA.overheatC} °C for over a minute.`, "Prolonged heating inverts sucrose to glucose and fructose and caramelises it: the syrup turns yellow, its taste changes and invert sugar ferments more readily. Use gentle heat (about 60 °C) and stir."));
      }
      if (after.beakerWaterG < s.beakerWaterG - 0.5) fb.push(warn("Water is boiling off — the syrup is concentrating."));
      return { state: after, feedback: fb };
    }

    case "finishDissolving": {
      if (s.sucroseInBeaker === 0 || s.beakerWaterG === 0) return same(refuse("Both the water and the sucrose must be in the beaker."));
      if (s.dissolveDone) return same(info("Dissolution is finished."));
      const fb: Feedback[] = [];
      const left = s.sucroseInBeaker - s.dissolvedG;
      if (left > 0.3) fb.push(mistake("incomplete-dissolution", 10, `About ${left.toFixed(1)} g of sucrose is still undissolved.`, "Undissolved crystals seed crystallisation of the whole batch, the syrup is not uniform, and the concentration of the liquid is below the formula. Keep stirring with gentle heat until no crystals remain."));
      return next({ dissolveDone: true, stirring: false }, ...fb, ok(left > 0.3 ? "Moving on with crystals present." : "All sucrose dissolved: a clear, colourless liquid."));
    }

    case "chooseVessel":
      if (!s.dissolveDone) return same(refuse("Finish dissolving first."));
      if (a.vessel === "beaker-marks") return next({ vessel: a.vessel }, mistake("beaker-marks", 6, "Making up to volume on a beaker's graduations.", "Beaker marks are approximate (±5 % or worse). Make up to volume in a measuring cylinder or a calibrated container."));
      return next({ vessel: a.vessel }, ok(`A ${batch} mL measuring cylinder: graduated to 1 mL.`));

    case "transferToVessel": {
      if (!s.vessel) return same(refuse("Choose the vessel you will make up the volume in."));
      if (s.inVessel) return same(info("Already transferred."));
      const fb: Feedback[] = [];
      const after = { ...s, setpoint: 0, onHotplate: false };
      const vol = batchFigures(after).volumeNow;
      if (vol > batch + FORMULA.volumeToleranceMl) {
        fb.push(mistake("start-water-too-much", 8, `The syrup already measures ${vol.toFixed(1)} mL — more than the ${batch} mL batch before any water is added.`, "Too much starting water: the batch can no longer be made up to volume at the formula's concentration. It is too dilute to be self-preserving."));
      }
      return next({ inVessel: true, setpoint: 0, onHotplate: false }, ...fb, info("Poured into the measuring cylinder."));
    }

    case "rinseBeaker": {
      if (!s.inVessel) return same(refuse("Transfer the syrup first."));
      if (s.rinsed) return same(info("Already rinsed."));
      return next({ rinsed: true, qsWaterG: s.qsWaterG + 2 }, ok("Beaker and rod rinsed with about 2 mL of purified water into the cylinder — no syrup left behind."));
    }

    case "qs": {
      if (!s.inVessel) return same(refuse("Transfer the syrup into the measuring cylinder first."));
      if (s.finalRead !== null) return same(refuse("The final volume is recorded."));
      if (![5, 1, 0.5, 0.2].includes(a.ml)) return same();
      const fb: Feedback[] = [];
      if (s.madeUpAtC === null && s.tempC > FORMULA.makeUpMaxC) {
        fb.push(mistake("made-up-hot", 8, `Making up to volume at ${s.tempC.toFixed(0)} °C.`, `The syrup contracts as it cools (about ${(SYRUP_EXPANSION_PER_C * 100).toFixed(2)} % per °C): a batch made up to the mark while hot will be short of volume — and its concentration off — at room temperature. Cool first.`));
      }
      const after = { ...s, qsWaterG: round(s.qsWaterG + a.ml * 0.997, 2), mixedAfterQs: false, madeUpAtC: s.madeUpAtC ?? s.tempC };
      if (batchFigures(after).volumeNow > batch + FORMULA.volumeToleranceMl && batchFigures(s).volumeNow <= batch + FORMULA.volumeToleranceMl) {
        fb.push(mistake("qs-overshoot", 6, "Made up past the mark.", "Extra water dilutes the batch below 85 % w/v. Add the last millilitres in small portions."));
      }
      return { state: after, feedback: fb };
    }

    case "mixAfterQs":
      if (s.qsWaterG === 0 && !s.inVessel) return same(refuse("Make up to volume first."));
      return next({ mixedAfterQs: true }, ok("Stirred thoroughly: the water added at the top is mixed through the dense syrup."));

    case "readFinal": {
      if (!s.inVessel) return same(refuse("Make up to volume in the measuring cylinder first."));
      const f = batchFigures(s);
      if (Math.abs(a.value - f.volumeNow) > 0.3) return same(mistake("misread-final", 3, `${fmt(a.value, 1)} mL does not match the meniscus.`, "Read the bottom of the meniscus at eye level; let a viscous syrup drain down the walls first."));
      const fb: Feedback[] = [];
      if (s.tempC > FORMULA.makeUpMaxC) {
        fb.push(mistake("made-up-hot", 8, `Final volume read at ${s.tempC.toFixed(0)} °C.`, `A hot syrup occupies more volume than it will at room temperature (about ${(SYRUP_EXPANSION_PER_C * 100).toFixed(2)} % per °C). A batch that reads ${batch} mL now will be short once it cools. Cool to ${FORMULA.makeUpMaxC} °C or below first.`));
      }
      if (!s.mixedAfterQs) fb.push(mistake("not-mixed-after-qs", 6, "Volume recorded without mixing after the final water.", "Water added to make up to volume floats on the denser syrup; unmixed, the top of the batch is weak and the bottom strong."));
      if (Math.abs(f.volumeNow - batch) > FORMULA.volumeToleranceMl) fb.push(warn(`The batch is ${f.volumeNow.toFixed(1)} mL, not ${batch} mL.`));
      return next({ finalRead: round(a.value, 1), mixedAfterQs: true }, ...fb, ok(`Final volume ${a.value.toFixed(1)} mL recorded.`));
    }

    case "pack": {
      if (s.finalRead === null) return same(refuse("Record the final volume first."));
      const c = CONTAINER_OPTIONS.find((o) => o.id === a.container);
      if (!c) return same();
      if (!c.correct) return same(mistake(`container-${c.id}`, 5, `${c.name}: unsuitable.`, c.why));
      return next({ container: c.id }, ok(c.why));
    }

    case "label": {
      if (!s.container) return same(refuse("Pack the syrup before labelling."));
      const o = STORAGE_OPTIONS.find((x) => x.id === a.storage);
      if (!o) return same();
      if (!o.correct) return same(mistake(`storage-${o.id}`, 3, `"${o.text}" — not right for syrup.`, (o as { why: string }).why));
      return next({ storage: o.id, labelled: true }, ok("Labelled: product name, batch number, quantity, date of preparation, storage and 'For practice — not for use'."));
    }

    case "observe": {
      if (!s.labelled) return same(refuse("Pack and label the batch before evaluating it."));
      const o = APPEARANCE_OPTIONS.find((x) => x.id === a.appearance);
      if (!o) return same();
      const truth = trueAppearance(s);
      if (o.id !== truth) return same(mistake("appearance", 3, "Look again — that is not what the bottle shows.", "Record what you see, not what the batch should look like. An honest observation is the point of an evaluation."));
      return next({ appearance: o.id }, ok(`Appearance recorded: ${o.text}.`));
    }

    case "weighDensity": {
      if (!s.appearance) return same(refuse("Record the appearance first."));
      const f = batchFigures(s);
      const noise = (rand(s.seed, 61) - 0.5) * 0.04;
      return next({ densityMassG: round(f.density * 50 + noise, 2) }, info(`50.0 mL of syrup in a tared cylinder weighs ${(f.density * 50 + noise).toFixed(2)} g.`));
    }

    case "recordDensity": {
      if (s.densityMassG === null) return same(refuse("Weigh 50.0 mL of the syrup first."));
      const expect = s.densityMassG / 50;
      if (Math.abs(a.value - expect) > 0.0011) return same(mistake("calc-density", 3, `${fmt(a.value, 3)} g/mL does not follow from ${s.densityMassG.toFixed(2)} g in 50.0 mL.`, "Density = mass ÷ volume."));
      return next({ densityRecorded: round(a.value, 3) }, ok(`Density ${a.value.toFixed(3)} g/mL recorded.`));
    }

    case "sign":
      if (s.densityRecorded === null) return same(refuse("Complete the evaluation before signing the batch record."));
      return next({ signed: true }, ok("Batch record signed."));
  }
}

const STEP_DONE: Record<string, (s: SyrupState) => boolean> = {
  inspect: (s) => KEY_ITEMS.every((k) => s.inspected.includes(k)),
  calculate: (s) => s.calcSucrose !== null,
  weigh: (s) => s.massRecorded !== null,
  water: (s) => s.beakerWaterG > 0,
  dissolve: (s) => s.dissolveDone,
  cool: (s) => s.inVessel,
  makeup: (s) => s.finalRead !== null,
  pack: (s) => s.labelled,
  evaluate: (s) => s.densityRecorded !== null && s.appearance !== null,
  record: (s) => s.signed,
};

/**
 * The instruments (2026-10-21). Each equipment id opens exactly one controller (the
 * engine picks the first that lists it), so the sucrose jar and the boat open the
 * balance, and the purified-water carboy opens the measuring cylinder it is poured into.
 * Overlap in `actions` is deliberate: stirring can be done from the rod, the beaker or
 * the hot plate, so a phone student is not made to hop for every stir.
 */
const CONTROLLERS: ControllerDef[] = [
  { id: "notebook", name: "Batch record", equipment: ["notebook"], actions: ["calculate", "recordDensity", "sign"], brief: "Calculate the formula before you start; review and sign the record at the end.", howTo: [`Sucrose = ${FORMULA.sucroseGPer100mL} g per 100 mL of batch.`, `Start with about ${Math.round(FORMULA.startWaterFraction * 100)} % of the batch volume as water.`], nearby: ["balance"] },
  { id: "balance", name: "Top-pan balance", equipment: ["balance", "boat", "sucrose"], actions: ["placeBoat", "tare", "addSucrose", "removeSucrose", "recordMass", "weighDensity", "recordDensity"], brief: "Weigh the sucrose in a tared boat; later, weigh 50.0 mL of the syrup.", howTo: ["Boat on the pan, then tare to 0.00 g.", "Large scoops to get close, small scoops and taps to finish."], nearby: ["notebook", "beaker"] },
  { id: "cylinder", name: "Measuring cylinder", equipment: ["cylinder", "water"], actions: ["pourWater", "readCylinder", "waterToBeaker", "chooseVessel", "transferToVessel", "rinseBeaker", "wait", "qs", "mixAfterQs", "readFinal"], brief: "Measure the starting water; later, make the syrup up to volume in it.", howTo: ["Stand it on the bench and read the bottom of the meniscus at eye level.", "Add the last millilitres in small portions."], nearby: ["beaker", "rod"] },
  { id: "beaker", name: "Beaker (mixing vessel)", equipment: ["beaker"], actions: ["waterToBeaker", "sucroseToBeaker", "beakerOnHotplate", "stir", "wait", "finishDissolving", "chooseVessel", "transferToVessel", "rinseBeaker"], brief: "Dissolve the sucrose in the starting water, then transfer the syrup.", howTo: ["Water first, then the sucrose gradually while stirring.", "Gentle heat; stir until no crystals remain."], nearby: ["hotplate", "rod", "cylinder"] },
  { id: "hotplate", name: "Hot plate", equipment: ["hotplate"], actions: ["beakerOnHotplate", "setHeat", "stir", "wait", "finishDissolving"], brief: "Gentle heat speeds dissolution; switch it off to cool.", howTo: ["About 60 °C is enough.", `Above ${FORMULA.overheatC} °C sucrose inverts and colours.`], nearby: ["beaker", "rod"] },
  { id: "rod", name: "Glass stirring rod", equipment: ["rod"], actions: ["stir", "mixAfterQs"], brief: "Stir while the sucrose dissolves, and again after making up to volume.", howTo: ["Keep stirring while you add the sucrose.", "Water added at the top floats on syrup — stir it through."], nearby: ["beaker", "cylinder"] },
  { id: "bottle", name: "Dispensing bottle", equipment: ["bottle"], actions: ["pack", "label", "observe"], brief: "Pack, label and look at the finished syrup.", howTo: ["Choose a suitable container and storage statement.", "Record what you actually see."], nearby: ["balance", "notebook"] },
];

/**
 * Learning mode: the next correct move. It points at controls, never at a value: it goes
 * quiet (null) while the student brings a meniscus to the mark, and it never pre-selects
 * the container, the storage statement or the appearance — those are assessed choices.
 */
function suggest(s: SyrupState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  if (!KEY_ITEMS.every((k) => s.inspected.includes(k))) return null; // inspection is finding, not operating
  if (s.calcSucrose === null) return to("notebook", "calculate");
  const batch = s.batchMl ?? 100;
  if (s.massRecorded === null) {
    if (!s.boatOn) return to("balance", "placeBoat");
    if (s.tareG === 0 && s.sucroseOnBoat === 0) return to("balance", "tare");
    // driven by the LCD the student can see, exactly as a demonstrator would point
    const v = syrupBalance(s);
    const tol = FORMULA.weighToleranceGPer100 * (batch / 100);
    if (v < s.calcSucrose - tol) return to("balance", "addSucrose");
    if (v > s.calcSucrose + tol) return to("balance", "removeSucrose");
    return to("balance", "recordMass");
  }
  if (s.beakerWaterG === 0) {
    if (s.cylinderRead === null) {
      // Far from the target the cylinder obviously needs water; near it, reading the
      // meniscus is the skill, so Learning mode says nothing.
      const want = s.calcWater ?? 0;
      if (s.cylinderMl <= 0 || Math.abs(s.cylinderMl - want) > 5) return to("cylinder", "pourWater");
      return null;
    }
    return to("cylinder", "waterToBeaker");
  }
  if (!s.dissolveDone) {
    if (!s.onHotplate) return to("beaker", "beakerOnHotplate");
    if (s.setpoint === 0 || s.setpoint >= 100) return to("hotplate", "setHeat"); // setting it ≥ 100 °C already warned
    if (!s.stirring) return to("beaker", "stir");
    if (s.sucroseInBeaker === 0) return to("beaker", "sucroseToBeaker");
    // the beaker panel describes the crystals on the same threshold, so this adds nothing
    if (s.sucroseInBeaker - s.dissolvedG > 0.3) return to("beaker", "wait");
    return to("beaker", "finishDissolving");
  }
  if (!s.inVessel) {
    if (s.onHotplate && s.setpoint > 0) return to("hotplate", "setHeat");
    if (s.tempC > FORMULA.makeUpMaxC) return to("beaker", "wait");
    if (!s.vessel) return to("beaker", "chooseVessel");
    return to("beaker", "transferToVessel");
  }
  if (s.finalRead === null) {
    if (!s.rinsed && s.qsWaterG === 0) return to("beaker", "rinseBeaker");
    if (s.madeUpAtC === null && s.tempC > FORMULA.makeUpMaxC) return to("cylinder", "wait");
    if (batchFigures(s).volumeNow < batch - 3) return to("cylinder", "qs");
    // Bringing the meniscus to the mark is the student's call. Once they have mixed,
    // pointing at the reading field gives nothing away.
    return s.mixedAfterQs ? to("cylinder", "readFinal") : null;
  }
  if (!s.container) return to("bottle", "pack");
  if (!s.labelled) return to("bottle", "label");
  if (!s.appearance) return to("bottle", "observe");
  if (s.densityMassG === null) return to("balance", "weighDensity");
  if (s.densityRecorded === null) return to("balance", "recordDensity");
  if (!s.signed) return to("notebook", "sign");
  return null;
}

function observations(s: SyrupState): ObservationSection[] {
  const f = batchFigures(s);
  return [
    {
      title: "Formula and quantities",
      rows: [
        { label: "Formula", value: `${FORMULA.name} — ${FORMULA.basis}`, source: "recorded" },
        { label: "Batch size", value: s.batchMl ? `${s.batchMl} mL` : "—", source: "recorded" },
        { label: "Sucrose (calculated / weighed)", value: s.calcSucrose !== null ? `${s.calcSucrose.toFixed(2)} g / ${s.massRecorded !== null ? `${s.massRecorded.toFixed(2)} g` : "—"}` : "—", source: "recorded" },
        { label: "Starting water", value: s.cylinderRead !== null ? `${s.cylinderRead.toFixed(1)} mL` : "—", source: "recorded" },
      ],
    },
    {
      title: "Process",
      rows: [
        { label: "Highest temperature held", value: s.heatDamageS > 0 ? `≥ ${FORMULA.overheatC} °C for ${s.heatDamageS} s` : `below ${FORMULA.overheatC} °C`, source: "observed" },
        { label: "Dissolution", value: s.dissolveDone ? (s.sucroseInBeaker - s.dissolvedG > 0.3 ? "incomplete" : "complete") : "—", source: "observed" },
        { label: "Made up to volume at", value: s.madeUpAtC !== null ? `${s.madeUpAtC.toFixed(0)} °C` : "—", source: "observed" },
      ],
    },
    {
      title: "Evaluation",
      rows: [
        { label: "Appearance", value: s.appearance ? APPEARANCE_OPTIONS.find((o) => o.id === s.appearance)!.text : "—", source: "recorded" },
        { label: "Final volume", value: s.finalRead !== null ? `${s.finalRead.toFixed(1)} mL` : "—", source: "recorded" },
        { label: "Density", value: s.densityRecorded !== null ? `${s.densityRecorded.toFixed(3)} g/mL (${s.densityMassG?.toFixed(2)} g / 50.0 mL)` : "—", source: "recorded" },
        { label: "Concentration (at 20 °C)", value: f.volume20 ? `${f.wv.toFixed(1)} % w/v (${f.ww.toFixed(1)} % w/w)` : "—", source: "calculated" },
      ],
    },
  ];
}

function report(s: SyrupState): ExperimentReport {
  const f = batchFigures(s);
  const [dlo, dhi] = FORMULA.densityRange;
  const [clo, chi] = FORMULA.concentrationRange;
  const target = wwFromWv(FORMULA.sucroseGPer100mL);
  return {
    headline: `${FORMULA.name}, ${s.batchMl ?? "—"} mL — ${f.wv ? `${f.wv.toFixed(1)} % w/v sucrose` : "not made"}`,
    calculations: [
      { label: "Sucrose", expression: `${FORMULA.sucroseGPer100mL} g/100 mL × ${s.batchMl ?? "—"} mL ÷ 100`, result: s.calcSucrose !== null ? `${s.calcSucrose.toFixed(2)} g` : "—" },
      { label: "Target strength", expression: `${FORMULA.sucroseGPer100mL} % w/v ≡ % w/w × density`, result: `${target.toFixed(1)} % w/w, ${densityAt20(target).toFixed(3)} g/mL` },
      { label: "Weighing deviation", expression: "(weighed − calculated) ÷ calculated × 100", result: s.massRecorded !== null && s.calcSucrose ? `${deviationPercent(s.sucroseInBeaker || s.massRecorded, s.calcSucrose).toFixed(2)} %` : "—" },
      { label: "Density", expression: "mass of 50.0 mL ÷ 50.0 mL", result: s.densityRecorded !== null ? `${s.densityRecorded.toFixed(3)} g/mL` : "—" },
    ],
    outcome: [
      { label: "Concentration", value: f.wv ? `${f.wv.toFixed(1)} % w/v` : "—", verdict: f.wv >= clo && f.wv <= chi ? "pass" : "fail" },
      { label: "Density (illustrative range)", value: s.densityRecorded !== null ? `${s.densityRecorded.toFixed(3)} g/mL (${dlo.toFixed(2)}–${dhi.toFixed(2)})` : "—", verdict: s.densityRecorded !== null && s.densityRecorded >= dlo && s.densityRecorded <= dhi ? "pass" : "fail" },
      { label: "Final volume", value: s.finalRead !== null ? `${s.finalRead.toFixed(1)} mL of ${s.batchMl} mL` : "—", verdict: s.finalRead !== null && Math.abs(f.volume20 - (s.batchMl ?? 0)) <= 1 ? "pass" : "fail" },
      { label: "Appearance", value: APPEARANCE_OPTIONS.find((o) => o.id === trueAppearance(s))!.text, verdict: trueAppearance(s) === "clear" ? "pass" : "fail" },
    ],
    learning: [
      "At about 85 % w/v, syrup has so little free water that microorganisms cannot grow — it is self-preserving. Weaker syrups need a preservative; stronger ones crystallise.",
      "Gentle heat speeds dissolution; prolonged strong heat inverts and caramelises sucrose.",
      "Syrups are made up to volume only when cool, because they contract on cooling.",
    ],
  };
}

export const SYRUP: ExperimentDefinition<SyrupState, SyrupAction> = {
  meta: LABS["simple-syrup"],
  principle: [
    "Simple Syrup is a nearly saturated solution of sucrose in purified water. The USP proportions — 850 g sucrose made up to 1000 mL — give 85 % w/v, about 64.7 % w/w, with a density near 1.31 g/mL.",
    "At this concentration there is too little free water for bacteria and moulds to grow, so the syrup preserves itself. A weaker syrup can ferment; a stronger one crystallises on standing.",
    "Sucrose dissolves faster with gentle heat and stirring. Strong or prolonged heating hydrolyses (inverts) sucrose to glucose and fructose and caramelises it, colouring the syrup.",
    "The finished batch is made up to volume with purified water only when it has cooled, because a hot syrup contracts as it cools.",
    "The official texts differ in detail: USP Syrup is 850 g sucrose made up to 1000 mL with specific gravity not less than 1.30, and the USP prefers dissolving it without heat (percolation); BP Syrup is 66.7 % w/w with a weight per mL of 1.315–1.333 g. This lab uses the USP proportions with the hot method commonly taught in dispensing practicals.",
    `Illustrative formula: quantities and limits on this page are teaching values (configurable), not a validated clinical or manufacturing formula.`,
  ],
  safety: [
    "Hot syrup sticks to skin and burns. Handle the hot beaker with tongs or a heat-resistant glove.",
    "Never leave the hot plate on and unattended; switch it off before moving the beaker.",
    "Wipe sugar spills at once — a sticky floor is a slip hazard.",
    "This is a practice preparation: it is labelled 'For practice — not for use' and never given to anyone.",
  ],
  equipment: [
    { id: "balance", name: "Top-pan balance", description: "An electronic balance reading to 0.01 g.", use: "Weighs the sucrose in a tared boat.", spec: "Readability 0.01 g, capacity 600 g" },
    { id: "boat", name: "Weighing boat", description: "A disposable plastic boat.", use: "Holds the sucrose on the pan; it is tared first." },
    { id: "sucrose", name: "Sucrose (labelled jar)", description: "Pharmaceutical-grade sucrose, white crystalline powder.", use: `${FORMULA.sucroseGPer100mL} g per 100 mL of syrup.` },
    { id: "beaker", name: "Beaker, 150 mL (borosilicate)", description: "Heat-resistant glass beaker.", use: "Sucrose is dissolved in the starting water in it." },
    { id: "cylinder", name: "Measuring cylinder", description: "Graduated cylinder, 1 mL divisions.", use: "Measures the starting water, then the syrup is made up to volume in it." },
    { id: "rod", name: "Glass stirring rod", description: "A glass rod.", use: "Stirs while the sucrose dissolves and after making up to volume." },
    { id: "water", name: "Purified water", description: "Purified water in a wash bottle and a carboy.", use: "The vehicle, and for making up to volume." },
    { id: "hotplate", name: "Hot plate with thermometer", description: "Hot plate with set-points and a glass thermometer in the beaker.", use: "Gentle heat (about 60 °C) speeds dissolution.", safety: "Hot surface." },
    { id: "bottle", name: "Dispensing bottle and label", description: "Clean, dry glass bottle with screw cap.", use: "The finished syrup is packed and labelled in it." },
    { id: "notebook", name: "Lab notebook (batch record)", description: "Your batch record: every quantity you weighed, measured and recorded is already in it.", use: "Calculate the formula before you start, and review and sign the batch record at the end." },
  ],
  materials: [
    { id: "sucrose", name: "Sucrose", detail: "C₁₂H₂₂O₁₁, white crystalline powder" },
    { id: "water", name: "Purified water", detail: "Vehicle" },
  ],
  steps: [
    { id: "inspect", title: "Inspect the bench", objective: "Inspect the balance, boat, sucrose, beaker, measuring cylinder, stirring rod, purified water, hot plate and the bottle.", hints: ["Select each item to read what it is for.", "Items still to inspect are listed in the procedure panel."], focus: [...KEY_ITEMS] },
    { id: "calculate", title: "Calculate the formula", objective: "Choose a batch size and calculate the sucrose and the starting water.", hints: [`Sucrose = ${FORMULA.sucroseGPer100mL} g per 100 mL.`, `Start with about ${Math.round(FORMULA.startWaterFraction * 100)} % of the batch volume as water.`], focus: ["notebook"] },
    { id: "weigh", title: "Weigh the sucrose", objective: "Tare the boat, weigh the sucrose within tolerance, and record the weight.", hints: ["Boat on → tare → add sucrose.", "Large scoops to get close, small scoops and taps to finish."], focus: ["balance", "boat", "sucrose"] },
    { id: "water", title: "Measure the water", objective: "Measure the starting water in the measuring cylinder, read it, and pour it into the beaker.", hints: ["Read the bottom of the meniscus at eye level.", "Water goes in the beaker before the sucrose."], focus: ["cylinder", "water", "beaker"] },
    { id: "dissolve", title: "Dissolve", objective: "Put the beaker on the hot plate, warm gently, add the sucrose while stirring, and stir until no crystals remain.", hints: ["About 60 °C with continuous stirring dissolves it in a few minutes.", `Above ${FORMULA.overheatC} °C the sucrose inverts and colours.`], focus: ["hotplate", "beaker", "rod"], safety: "Hot surface and hot syrup." },
    { id: "cool", title: "Cool and transfer", objective: `Switch off the heat, let the syrup cool to ${FORMULA.makeUpMaxC} °C or below, and transfer it to the measuring cylinder.`, hints: ["Wait with the heat off; the thermometer shows the temperature.", "Rinse the beaker into the cylinder with a little purified water."], focus: ["hotplate", "beaker", "cylinder"] },
    { id: "makeup", title: "Make up to volume", objective: "Add purified water to the batch volume, mix, and record the final volume.", hints: ["Add the last millilitres in 0.5 and 0.2 mL portions.", "Stir after making up — the water floats on the syrup."], focus: ["cylinder", "water", "rod"] },
    { id: "pack", title: "Pack and label", objective: "Pack into a suitable container and choose the storage statement.", hints: ["A clean, dry, well-closed glass bottle.", "Syrup is stored in a cool place — not refrigerated."], focus: ["bottle"] },
    { id: "evaluate", title: "Evaluate", objective: "Record the appearance, then weigh 50.0 mL and calculate the density.", hints: ["Look at the bottle in the room or in the panel.", "Density = mass ÷ 50.0 mL."], focus: ["bottle", "balance"] },
    { id: "record", title: "Batch record", objective: "Review the batch record and sign it.", hints: ["Everything you did is already in the record — check it, then sign."], focus: ["notebook"] },
  ],
  questions: [
    { id: "q1", kind: "viva", prompt: "Why is Simple Syrup at 85 % w/v self-preserving?", options: ["Sucrose is an antibiotic", "There is too little free water (low water activity) for microbes to grow", "The heat sterilises it permanently", "It contains a preservative"], answer: 1, explanation: "Nearly saturated sugar binds the water; osmotic pressure prevents microbial growth." },
    { id: "q2", kind: "calculation", prompt: "How much sucrose is needed for 60 mL of Simple Syrup (85 g/100 mL)?", options: ["51 g", "60 g", "85 g", "42.5 g"], answer: 0, explanation: "85 × 60 / 100 = 51 g." },
    { id: "q3", kind: "design", prompt: "Why is the syrup made up to volume only after it has cooled?", options: ["Hot syrup is sterile", "It contracts on cooling, so a batch made up hot ends up short", "Water evaporates at room temperature", "To prevent inversion"], answer: 1, explanation: "Liquids expand when warm; volumetric measurement is made at room temperature." },
    { id: "q4", kind: "viva", prompt: "What is 'inversion' of sucrose?", options: ["Crystallisation", "Hydrolysis to glucose and fructose", "Oxidation to CO₂", "Polymerisation"], answer: 1, explanation: "Heat and acid hydrolyse sucrose; the mixture rotates polarised light the opposite way — hence 'invert sugar'." },
    { id: "q5", kind: "interpretation", prompt: "Your syrup's density is 1.25 g/mL. The most likely cause?", options: ["Too much sucrose", "Too little sucrose or too much water", "It was heated gently", "It was stored in amber glass"], answer: 1, explanation: "Density falls as the sucrose concentration falls; 85 % w/v syrup is about 1.31 g/mL." },
    { id: "q6", kind: "design", prompt: "Why is the balance tared with the empty weighing boat?", options: ["To calibrate it", "So the display shows the sucrose only", "To warm it up", "It is not necessary"], answer: 1, explanation: "Taring subtracts the container's mass." },
    { id: "q7", kind: "viva", prompt: "Which storage statement suits Simple Syrup?", options: ["Store at 2–8 °C", "Store in a well-closed container in a cool place", "Store in the freezer", "Store open to the air"], answer: 1, explanation: "Refrigeration encourages crystallisation; a cool place in a well-closed container is enough." },
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

export function syrupVisual(s: SyrupState) {
  const f = batchFigures(s);
  const appearance = trueAppearance(s);
  // The tint appears exactly when trueAppearance() calls the syrup yellow (> 120 s above
  // the overheat threshold). A ramp from zero showed a yellow beaker the engine still
  // graded "clear", so a student who recorded what they saw was marked wrong.
  const yellow = appearance === "yellow" ? Math.min(1, s.heatDamageS / 240) : 0;
  return {
    boatOn: s.boatOn,
    sucroseOnBoat: s.sucroseOnBoat,
    balance: s.densityMassG !== null && s.densityRecorded === null ? s.densityMassG : syrupBalance(s),
    cylinderMl: s.inVessel ? f.volumeNow : s.cylinderMl,
    cylinderSyrup: s.inVessel,
    beakerMl: s.inVessel ? 0 : s.beakerWaterG > 0 || s.sucroseInBeaker > 0 ? (s.beakerWaterG > 0 ? solutionVolume(s.dissolvedG, s.beakerWaterG, s.tempC) : 0) : 0,
    beakerSolid: s.inVessel ? 0 : Math.max(0, s.sucroseInBeaker - s.dissolvedG),
    tempC: s.tempC,
    heating: s.onHotplate && s.setpoint > 0,
    setpoint: s.setpoint,
    onHotplate: s.onHotplate,
    stirring: s.stirring,
    yellow,
    bottleFilled: !!s.container,
    labelled: s.labelled,
    appearance,
  };
}
