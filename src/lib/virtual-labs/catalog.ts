/**
 * The Virtual Labs catalogue — FOUR ROOMS (`ROOM_IDS`, the disciplines) and the
 * experiments registered into them (`EXPERIMENT_IDS`). An experiment runs in its room;
 * it never gets a room or route of its own (owner's standard, 2026-10-25).
 * Pharmaceutics holds the owner's three shortlisted experiments plus Simple Syrup (kept,
 * pending the owner's decision). `scripts/virtual-labs.test.mts` pins this exact list:
 * the brief forbids padding the catalogue with unfinished experiments.
 *
 * Curriculum statuses are evidence, not marketing. See
 * docs/virtual-labs/CURRICULUM_MAPPING.md for what each one rests on.
 */
import type { DisciplineId, LabMeta } from "./engine/types";
import { CURRICULUM } from "./curriculum";

export const ROOM_IDS: readonly DisciplineId[] = ["pharmaceutical-chemistry", "pharmaceutics", "pharmacology", "pharmacognosy"];

export const ROOMS: Record<DisciplineId, { label: string; labName: string; image: string }> = {
  "pharmaceutical-chemistry": { label: "Pharmaceutical Chemistry", labName: "Pharmaceutical Chemistry Laboratory", image: "/images/virtual-labs/acid-base-titration.webp" },
  pharmaceutics: { label: "Pharmaceutics", labName: "Pharmaceutics Laboratory", image: "/images/virtual-labs/simple-syrup.webp" },
  pharmacology: { label: "Pharmacology", labName: "Pharmacology Laboratory", image: "/images/virtual-labs/dose-response.webp" },
  pharmacognosy: { label: "Pharmacognosy", labName: "Pharmacognosy Laboratory", image: "/images/virtual-labs/powdered-clove.webp" },
};

export const EXPERIMENT_IDS = [
  "acid-base-titration",
  "solution-preparation",
  "liquid-properties",
  "solubility-dissolution",
  "simple-syrup",
  "dose-response",
  "powdered-clove",
] as const;
export type ExperimentId = (typeof EXPERIMENT_IDS)[number];

export const LABS: Record<ExperimentId, LabMeta> = {
  "acid-base-titration": {
    id: "acid-base-titration",
    discipline: "pharmaceutical-chemistry",
    course: "Pharmaceutical Analysis",
    seo: {
      title: "Acid–Base Titration Virtual Lab: Assay of Citric Acid",
      description: "A 3D pharmaceutical chemistry lab: weigh citric acid on an analytical balance, make it up to volume, pipette an aliquot and titrate with standardised NaOH to a phenolphthalein end-point, then calculate the assay from your own readings.",
    },
    image: "/images/virtual-labs/acid-base-titration.webp",
    disciplineLabel: "Pharmaceutical Chemistry",
    labName: "Pharmaceutical Chemistry Laboratory",
    experimentTitle: "Assay of citric acid by acid–base titration",
    href: "/virtual-labs/pharmaceutical-chemistry/acid-base-titration",
    summary:
      "Weigh a sample on an analytical balance, make it up in a volumetric flask, pipette an aliquot and titrate it with standardised sodium hydroxide to a phenolphthalein end-point — then calculate the assay from your own readings.",
    objectives: [
      "Choose apparatus and an indicator suited to a weak acid–strong base titration",
      "Weigh, dilute and pipette quantitatively",
      "Read a burette to 0.01 mL and judge a faint permanent end-point",
      "Calculate an assay with the correct stoichiometry and units",
    ],
    minutes: 30,
    difficulty: "Intermediate",
    curriculum: CURRICULUM["acid-base-titration"],
  },
  "solution-preparation": {
    id: "solution-preparation",
    discipline: "pharmaceutics",
    course: "Physical Pharmacy",
    seo: {
      title: "Solution Preparation & Dilution Virtual Lab",
      description: "A 3D pharmaceutics lab: calculate, weigh and dissolve a solute, make up to volume in a volumetric flask, then pipette a dilution — with cabinets, a sink, segregated waste and RoboPharma guiding every step.",
    },
    image: "/images/virtual-labs/solution-preparation.webp",
    disciplineLabel: "Pharmaceutics",
    labName: "Pharmaceutics Laboratory",
    experimentTitle: "Pharmaceutical solution preparation & dilution",
    href: "/virtual-labs/pharmaceutics/solution-preparation",
    summary:
      "Calculate the mass of solute for a stated concentration, weigh it on an analytical balance, dissolve and transfer it quantitatively to a volumetric flask, make up to the mark, then prepare an accurate dilution with a bulb pipette — and verify both concentrations.",
    objectives: [
      "Choose the right expression of concentration and calculate the quantity needed",
      "Weigh and transfer a solute quantitatively",
      "Make up to volume correctly at the graduation mark and mix",
      "Prepare a dilution with C₁V₁ = C₂V₂ using volumetric glassware",
    ],
    minutes: 25,
    difficulty: "Introductory",
    curriculum: CURRICULUM["solution-preparation"],
  },
  "liquid-properties": {
    id: "liquid-properties",
    discipline: "pharmaceutics",
    course: "Physical Pharmacy",
    seo: {
      title: "Physical Properties of Liquids Virtual Lab: Density, Viscosity, Surface Tension",
      description: "A 3D physical pharmacy lab: specific gravity with a pycnometer, viscosity with an Ostwald viscometer and surface tension by capillary rise — real readings, temperature control and calculations you check yourself.",
    },
    image: "/images/virtual-labs/liquid-properties.webp",
    disciplineLabel: "Pharmaceutics",
    labName: "Pharmaceutics Laboratory",
    experimentTitle: "Physical properties of liquids — density, viscosity, surface tension",
    href: "/virtual-labs/pharmaceutics/liquid-properties",
    summary:
      "Three connected activities in one practical: determine density and specific gravity with a pycnometer, relative viscosity with an Ostwald viscometer, and surface tension by capillary rise — each against water at a controlled temperature.",
    objectives: [
      "Distinguish density from dimensionless specific gravity, with the temperature convention",
      "Use a pycnometer, an Ostwald viscometer and a capillary tube correctly",
      "Apply each method's own equation and its assumptions",
      "Compare liquids and explain the effect of temperature",
    ],
    minutes: 35,
    difficulty: "Intermediate",
    curriculum: CURRICULUM["liquid-properties"],
  },
  "solubility-dissolution": {
    id: "solubility-dissolution",
    discipline: "pharmaceutics",
    course: "Physical Pharmacy & Biopharmaceutics",
    seo: {
      title: "Solubility & Dissolution Virtual Lab",
      description: "A 3D pharmaceutics lab: determine a drug's equilibrium solubility gravimetrically, then run a paddle dissolution test, sample at set times, measure absorbance and plot the corrected dissolution profile.",
    },
    image: "/images/virtual-labs/solubility-dissolution.webp",
    disciplineLabel: "Pharmaceutics",
    labName: "Pharmaceutics Laboratory",
    experimentTitle: "Solubility & dissolution studies",
    href: "/virtual-labs/pharmaceutics/solubility-dissolution",
    summary:
      "Saturate a solvent with excess drug at a controlled temperature, filter and evaporate an aliquot to find the solubility; then run a paddle dissolution test, withdraw samples on time, read them on a spectrophotometer and build the dissolution profile with the sampling correction.",
    objectives: [
      "Tell equilibrium solubility from visual disappearance, and control temperature and time",
      "Calculate solubility and classify it with the pharmacopoeial descriptive terms",
      "Set up and run a dissolution test under defined conditions",
      "Calculate cumulative % dissolved with the correct sampling correction and plot the profile",
    ],
    minutes: 40,
    difficulty: "Intermediate",
    curriculum: CURRICULUM["solubility-dissolution"],
  },
  "simple-syrup": {
    id: "simple-syrup",
    discipline: "pharmaceutics",
    course: "Pharmaceutical Dosage Forms",
    seo: {
      title: "Simple Syrup Virtual Lab: Preparation and Evaluation",
      description: "A 3D pharmaceutics compounding lab: calculate the formula, tare and weigh sucrose, dissolve it with gentle heat, make up to volume when cool, pack, label and evaluate your Simple Syrup with a full batch record.",
    },
    image: "/images/virtual-labs/simple-syrup.webp",
    disciplineLabel: "Pharmaceutics",
    labName: "Pharmaceutics Laboratory",
    experimentTitle: "Preparation and evaluation of Simple Syrup",
    href: "/virtual-labs/pharmaceutics/simple-syrup",
    summary:
      "Calculate the formula for your batch, tare and weigh the sucrose, dissolve it in purified water with gentle heat and stirring, make up to volume when cool, pack, label and evaluate it — with a batch record of everything you did.",
    objectives: [
      "Scale a formula to a batch size",
      "Weigh on a tared top-pan balance within tolerance",
      "Dissolve sucrose without inverting or caramelising it, and make up to volume at room temperature",
      "Evaluate appearance, volume and density, and complete a batch record",
    ],
    minutes: 25,
    difficulty: "Introductory",
    curriculum: CURRICULUM["simple-syrup"],
  },
  "dose-response": {
    id: "dose-response",
    discipline: "pharmacology",
    course: "Pharmacology",
    seo: {
      title: "Dose–Response Curve Virtual Lab (Simulated Organ Bath)",
      description: "A 3D pharmacology lab: set up a simulated isolated-tissue organ bath, record graded responses to an agonist, plot linear and log dose–response curves, estimate Emax and EC50 and find an unknown concentration.",
    },
    image: "/images/virtual-labs/dose-response.webp",
    disciplineLabel: "Pharmacology",
    labName: "Pharmacology Laboratory",
    experimentTitle: "Graded dose–response curve (simulated isolated tissue)",
    href: "/virtual-labs/pharmacology/dose-response",
    summary:
      "Set up a simulated isolated-tissue organ bath, add an agonist at concentrations you choose, record the contractions, wash between doses, and plot the graded dose–response curve on linear and logarithmic axes to find Emax and EC50.",
    objectives: [
      "Identify the independent and dependent variables of a dose–response experiment",
      "Run trials with correct contact time, washout and recovery",
      "Plot response against concentration and against log concentration",
      "Estimate Emax and EC50 and explain potency and efficacy",
    ],
    minutes: 25,
    difficulty: "Intermediate",
    curriculum: CURRICULUM["dose-response"],
  },
  "powdered-clove": {
    id: "powdered-clove",
    discipline: "pharmacognosy",
    course: "Pharmacognosy",
    seo: {
      title: "Powdered Clove Microscopy Virtual Lab",
      description: "A 3D pharmacognosy lab: mount powdered clove in chloral hydrate, focus a compound microscope at low and high power, find the diagnostic elements and identify the drug with the evidence that supports it.",
    },
    image: "/images/virtual-labs/powdered-clove.webp",
    disciplineLabel: "Pharmacognosy",
    labName: "Pharmacognosy Laboratory",
    experimentTitle: "Microscopical identification of powdered clove",
    href: "/virtual-labs/pharmacognosy/powdered-clove",
    summary:
      "Select the crude-drug sample, mount it in chloral hydrate, place the slide on a compound microscope, focus at low and high power, scan the field for diagnostic elements and identify the drug with the evidence that supports it.",
    objectives: [
      "Prepare a cleared powder mount without air bubbles",
      "Use coarse and fine focus correctly at low and high power",
      "Recognise the diagnostic elements of clove powder",
      "Distinguish genuine clove from clove-stalk and mother-clove adulteration",
    ],
    minutes: 25,
    difficulty: "Introductory",
    curriculum: CURRICULUM["powdered-clove"],
  },
};

export const LAB_LIST: LabMeta[] = EXPERIMENT_IDS.map((id) => LABS[id]);

/** The room an experiment runs in. */
export const roomOf = (id: ExperimentId): DisciplineId => LABS[id].discipline;

/** Experiments registered in one room, in catalogue order. */
export const experimentsIn = (room: DisciplineId): LabMeta[] => LAB_LIST.filter((l) => l.discipline === room);

/** The URL segments: /virtual-labs/<discipline>/<experiment>. */
export function labByPath(discipline: string, experiment: string): LabMeta | undefined {
  return LAB_LIST.find((l) => l.discipline === discipline && l.id === experiment);
}
