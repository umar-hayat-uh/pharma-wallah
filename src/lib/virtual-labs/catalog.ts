/**
 * The Virtual Labs catalogue — exactly four labs, one experiment each (the initial
 * release, 2026-10-20). `scripts/virtual-labs.test.mts` fails if a fifth appears: the
 * brief forbids padding the catalogue with unfinished experiments.
 *
 * Curriculum statuses are evidence, not marketing. See
 * docs/virtual-labs/CURRICULUM_MAPPING.md for what each one rests on.
 */
import type { LabMeta } from "./engine/types";
import { CURRICULUM } from "./curriculum";

export const LAB_IDS = ["acid-base-titration", "simple-syrup", "dose-response", "powdered-clove"] as const;
export type LabId = (typeof LAB_IDS)[number];

export const LABS: Record<LabId, LabMeta> = {
  "acid-base-titration": {
    id: "acid-base-titration",
    discipline: "pharmaceutical-chemistry",
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
  "simple-syrup": {
    id: "simple-syrup",
    discipline: "pharmaceutics",
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

export const LAB_LIST: LabMeta[] = LAB_IDS.map((id) => LABS[id]);

/** The URL segments: /virtual-labs/<discipline>/<experiment>. */
export function labByPath(discipline: string, experiment: string): LabMeta | undefined {
  return LAB_LIST.find((l) => l.discipline === discipline && l.id === experiment);
}
