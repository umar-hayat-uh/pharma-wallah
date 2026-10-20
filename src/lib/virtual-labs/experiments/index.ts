/**
 * The four experiment definitions, keyed by lab id. Exactly four — the test suite
 * asserts it, matching the initial-release scope.
 */
import type { ExperimentDefinition } from "../engine/types";
import type { LabId } from "../catalog";
import { TITRATION } from "./titration";
import { SYRUP } from "./syrup";
import { DOSE_RESPONSE } from "./doseResponse";
import { CLOVE } from "./clove";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EXPERIMENTS: Record<LabId, ExperimentDefinition<any, any>> = {
  "acid-base-titration": TITRATION,
  "simple-syrup": SYRUP,
  "dose-response": DOSE_RESPONSE,
  "powdered-clove": CLOVE,
};
