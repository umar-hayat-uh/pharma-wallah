/**
 * The Pharmaceutics room's CONTRACT (2026-10-25) between the three shortlisted experiments
 * (pure definitions) and the one Babylon.js room that draws them. Written before either
 * side, so they could be built in parallel and still meet:
 *
 *  - equipment ids: the room registers exactly these as interactive for the active
 *    experiment; the experiment's `equipment[]` and `controllers[].equipment` use them;
 *  - FIXED items stand at their station; STORED items live in a cabinet (drawn inside it
 *    while not `common.out`) and stand at their bench place once retrieved;
 *  - the `<X>Visual` interfaces: the ONLY thing the room reads. Each experiment's
 *    `<x>Visual(state)` returns exactly this shape; the room never computes a number.
 *
 * Changing a field means changing both sides. Add OPTIONAL fields only, and say so here.
 * Simple Syrup keeps its own ids and `syrupVisual` (experiments/syrup.ts) unchanged.
 */
import type { CabinetId, CommonVisual } from "./common";

export const PHARMACEUTICS_EXPERIMENTS = ["solution-preparation", "liquid-properties", "solubility-dissolution"] as const;
export type PharmaceuticsExperimentId = (typeof PHARMACEUTICS_EXPERIMENTS)[number];

/** Fixtures the room always builds; interactive only when the active experiment lists them. */
export const FIXTURES = ["cabinet-glass", "cabinet-instruments", "cabinet-reagents", "sink", "waste-station", "notebook"] as const;

/** Per experiment: items standing at their station, and items kept in a cabinet. */
export const EQUIPMENT_PLAN: Record<PharmaceuticsExperimentId, { fixed: string[]; stored: Record<string, CabinetId> }> = {
  "solution-preparation": {
    // balance: analytical, 0.1 mg; water: purified-water wash bottle at the bench
    fixed: ["balance", "water"],
    stored: {
      boat: "cabinet-instruments", // weighing boat
      spatula: "cabinet-instruments",
      nacl: "cabinet-reagents", // labelled solute jar (the solute is the experiment's choice; label from `labels`)
      beaker: "cabinet-glass", // 100 mL beaker
      rod: "cabinet-glass", // glass stirring rod
      funnel: "cabinet-glass", // small glass funnel for quantitative transfer
      "flask-a": "cabinet-glass", // 100 mL Class A volumetric flask + stopper (stock / solution)
      "flask-b": "cabinet-glass", // 100 mL Class A volumetric flask + stopper (dilution)
      pipette: "cabinet-glass", // 10 mL Class A bulb pipette with a pipette filler
    },
  },
  "liquid-properties": {
    // water-bath: thermostatic, holds the viscometer and sample bottles at the set temperature
    fixed: ["balance", "water-bath"],
    stored: {
      thermometer: "cabinet-instruments",
      stopwatch: "cabinet-instruments",
      pycnometer: "cabinet-glass", // 25 mL specific-gravity bottle with capillary stopper
      viscometer: "cabinet-glass", // Ostwald U-tube viscometer
      pipette: "cabinet-glass", // 10 mL pipette + filler, charges the viscometer
      capillary: "cabinet-glass", // capillary tube on a holder with a mm scale
      beaker: "cabinet-glass", // 50 mL beaker the capillary dips into
      "sample-water": "cabinet-reagents", // purified water (reference)
      "sample-ethanol": "cabinet-reagents",
      "sample-glycerol": "cabinet-reagents", // a glycerol–water mixture (strength is the experiment's)
    },
  },
  "solubility-dissolution": {
    // oven: drying oven; tester: single-vessel paddle dissolution apparatus; spectro: UV-Vis
    fixed: ["balance", "water-bath", "water", "oven", "tester", "spectro"],
    stored: {
      spatula: "cabinet-instruments",
      boat: "cabinet-instruments",
      "syringe-filter": "cabinet-instruments", // syringe + membrane filter for the saturated solution
      sampler: "cabinet-instruments", // dissolution sampling syringe with cannula filter
      cuvette: "cabinet-instruments", // quartz cuvette
      flask: "cabinet-glass", // stoppered conical flask for saturation
      pipette: "cabinet-glass",
      dish: "cabinet-glass", // evaporating dish (tared)
      cylinder: "cabinet-glass", // 1000 mL measuring cylinder for the medium
      tubes: "cabinet-glass", // sample-tube rack
      drug: "cabinet-reagents", // drug powder jar
      tablets: "cabinet-reagents", // tablet container
      medium: "cabinet-reagents", // dissolution medium (buffer) carboy
    },
  },
};

/** A volumetric flask as drawn: the meniscus relative to the graduation mark. */
export type MeniscusAt = "empty" | "below" | "at" | "above";

export interface FlaskVisual {
  ml: number;
  meniscus: MeniscusAt;
  stoppered: boolean;
  /** Inverted to mix at least the required number of times. */
  mixed: boolean;
  labelled: boolean;
  /** 0 = colourless; 0–1 tint strength if the solute is coloured (room may ignore). */
  tint: number;
}

export interface SolutionPrepVisual {
  common: CommonVisual;
  /** The balance LCD (g) exactly as it should read — tare and drift already applied. */
  balance: { reading: number; boatOn: boolean };
  boatSolidG: number;
  beakerMl: number;
  /** Undissolved solid still visible in the beaker, g. */
  beakerSolidG: number;
  stirring: boolean;
  funnelIn: "flask-a" | null;
  flaskA: FlaskVisual;
  flaskB: FlaskVisual;
  /** Liquid in the pipette, mL (0 when empty), and where it is. */
  pipette: { ml: number; over: "flask-a" | "flask-b" | null };
  /** Text for the solute jar's label and the flask labels (room prints them). */
  labels: { solute: string; flaskA: string; flaskB: string };
}

export type LiquidActivity = "density" | "viscosity" | "surface";

export interface LiquidPropertiesVisual {
  common: CommonVisual;
  activity: LiquidActivity;
  /** The bottle in use: "sample-water" | "sample-ethanol" | "sample-glycerol" | null. */
  sample: string | null;
  bathC: number;
  balance: { reading: number };
  pycnometer: { content: "empty" | "sample-water" | "sample-ethanol" | "sample-glycerol"; onBalance: boolean; stoppered: boolean; dried: boolean };
  viscometer: {
    inBath: boolean;
    charged: boolean;
    /**
     * Liquid position through the timing bulb, 0 → 1: 0 = drawn up above the upper mark,
     * the UPPER mark at 0.1, the LOWER mark at 0.9, 1 = drained below it. The room draws
     * the two etched marks at exactly 0.1 and 0.9 of the bulb's travel.
     */
    level: number;
    flowing: boolean;
  };
  stopwatch: { running: boolean; seconds: number };
  /** riseMm is the true vertical rise; tiltDeg (optional, added 2026-10-25) lets the room draw an untrue holder. */
  capillary: { dipped: boolean; riseMm: number; tiltDeg?: number };
  /** Liquid in the small beaker the capillary dips into. */
  beakerMl: number;
}

export type SolubilityActivity = "solubility" | "dissolution";

export interface SolubilityDissolutionVisual {
  common: CommonVisual;
  activity: SolubilityActivity;
  balance: { reading: number };
  flask: { waterMl: number; solidG: number; inBath: boolean; shaking: boolean; stoppered: boolean };
  /** Filtered saturated solution in the syringe, mL. */
  syringeMl: number;
  dish: { ml: number; residueG: number; inOven: boolean; onBalance: boolean };
  bathC: number;
  ovenC: number;
  tester: {
    mediumMl: number;
    tempC: number;
    rpm: number;
    running: boolean;
    tabletIn: boolean;
    /** Fraction of the dose still undissolved (draws the tablet shrinking). */
    remaining: number;
    elapsedMin: number;
  };
  /** Sample tubes filled so far. */
  tubes: number;
  spectro: { cuvetteIn: boolean; reading: number | null };
}
