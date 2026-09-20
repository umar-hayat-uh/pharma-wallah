// src/lib/ai-guide/modes.ts
//
// The five ways a student can ask the guide for the same topic.
//
// A mode is an id on the wire and nothing else. The prompt text lives here and
// is resolved server-side by `modeDirective()`, so a crafted request can pick a
// mode but can never supply its own instructions to the model.

import type { StudyModeId } from "./types";

export interface StudyMode {
  id: StudyModeId;
  label: string;
  /** Shown under the picker — what changes about the answer. */
  hint: string;
  /** Appended to the system prompt for this turn. */
  directive: string;
  /** Opening questions, phrased the way a Pharm-D student would ask them. */
  starters: string[];
}

export const STUDY_MODES: StudyMode[] = [
  {
    id: "tutor",
    label: "Explain",
    hint: "A clear teaching answer, built up from the basics.",
    directive:
      "Teach the topic. Start from what the student most likely already knows, define each term the first time it appears, and build up in short steps. Finish with a two-line recap of what matters most.",
    starters: [
      "Explain the mechanism of action of ACE inhibitors",
      "Why do beta-lactams stop working against resistant bacteria?",
      "What actually happens during first-pass metabolism?",
      "Explain zero-order vs first-order kinetics with an example",
    ],
  },
  {
    id: "exam",
    label: "Quiz me",
    hint: "Practice questions first, answers and reasoning after.",
    directive:
      "Act as an examiner. Write practice questions on the topic — a mix of MCQs and one short-answer question — and put ALL of them before any answers. Then give an 'Answers' heading with the correct option and a one-line reason for each. Never reveal an answer next to its question.",
    starters: [
      "Quiz me on autonomic pharmacology",
      "Give me 5 MCQs on tablet excipients",
      "Test me on antibiotic classes and their targets",
      "Practice questions on acid-base balance",
    ],
  },
  {
    id: "compare",
    label: "Compare",
    hint: "A table that separates things students mix up.",
    directive:
      "Differentiate the items the student named. Lead with a markdown table whose rows are the features that actually distinguish them — not a generic definition each. Below the table, add a short 'Where students slip' note naming the confusion this comparison exists to fix.",
    starters: [
      "Compare competitive and non-competitive antagonism",
      "Difference between suspensions and emulsions",
      "Compare the penicillins with the cephalosporins",
      "Bioavailability vs bioequivalence",
    ],
  },
  {
    id: "calc",
    label: "Calculate",
    hint: "Step-by-step working with the units kept visible.",
    directive:
      "Work the calculation. State the formula, list the known values with their units, substitute them, and carry the units through every line so the student can see them cancel. Box the final answer with its unit and sanity-check whether the magnitude is plausible. If a value is missing, say which one and stop — do not invent it.",
    starters: [
      "How do I calculate creatinine clearance for a 68-year-old?",
      "Work through a 1:5000 dilution from a 2% stock",
      "Calculate the loading dose given Vd and target concentration",
      "How many grams of NaCl make 500 mL isotonic?",
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    hint: "Framed the way it is used on the ward — with the safety caveats.",
    directive:
      "Answer in clinical-practice framing: what the pharmacist checks, what is monitored, the counselling points, and the red flags that require escalation. State clearly that this is educational and that a real patient decision needs the prescriber and local guidelines.",
    starters: [
      "What do I counsel a patient starting warfarin on?",
      "Which parameters do I monitor on aminoglycosides?",
      "How is a vancomycin dose adjusted in renal impairment?",
      "Common drug interactions with metformin",
    ],
  },
];

export const DEFAULT_MODE: StudyModeId = "tutor";

const MODE_IDS = new Set<string>(STUDY_MODES.map((m) => m.id));

/** Type guard used at the route boundary — anything else falls back to tutor. */
export function isStudyMode(value: unknown): value is StudyModeId {
  return typeof value === "string" && MODE_IDS.has(value);
}

export function getMode(id: StudyModeId): StudyMode {
  return STUDY_MODES.find((m) => m.id === id) ?? STUDY_MODES[0];
}

/** The prompt text for a mode. Unknown ids resolve to the default, never to
 *  caller-supplied text. */
export function modeDirective(id: unknown): string {
  return getMode(isStudyMode(id) ? id : DEFAULT_MODE).directive;
}
