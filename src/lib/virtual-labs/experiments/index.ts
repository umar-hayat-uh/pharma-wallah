/**
 * Every experiment definition, keyed by experiment id (catalog.ts EXPERIMENT_IDS). The
 * test suite asserts the registry and the catalogue list the same experiments.
 */
import type { ExperimentDefinition } from "../engine/types";
import type { ExperimentId } from "../catalog";
import { TITRATION } from "./titration";
import { SYRUP } from "./syrup";
import { DOSE_RESPONSE } from "./doseResponse";
import { CLOVE } from "./clove";
import { LABS } from "../catalog";
import { SOLUTION_PREP, PROCEDURE as SOLUTION_PROCEDURE } from "./pharmaceutics/solutionPrep";
import { LIQUID_PROPERTIES, PROCEDURE as LIQUID_PROCEDURE } from "./pharmaceutics/liquidProperties";
import { SOLUBILITY_DISSOLUTION, PROCEDURE as SOLUBILITY_PROCEDURE } from "./pharmaceutics/solubilityDissolution";

// Each Pharmaceutics experiment owns its method record (sources, assumptions, status);
// it is attached to the catalogue entry here, the one place that sees both, so the
// briefing and anything reading `def.meta` show it (catalog.ts cannot import the
// definitions — they import the catalogue).
LABS["solution-preparation"].procedure = SOLUTION_PROCEDURE;
LABS["liquid-properties"].procedure = LIQUID_PROCEDURE;
LABS["solubility-dissolution"].procedure = SOLUBILITY_PROCEDURE;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXPERIMENTS: Record<ExperimentId, ExperimentDefinition<any, any>> = {
  "acid-base-titration": TITRATION,
  "solution-preparation": SOLUTION_PREP,
  "liquid-properties": LIQUID_PROPERTIES,
  "solubility-dissolution": SOLUBILITY_DISSOLUTION,
  "simple-syrup": SYRUP,
  "dose-response": DOSE_RESPONSE,
  "powdered-clove": CLOVE,
};
