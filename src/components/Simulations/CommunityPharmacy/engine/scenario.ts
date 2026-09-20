// ============================================================
// Building a case from a template
// ============================================================
//
// A template describes the clinical content; this adds the per-run variation —
// which decoys sit on the shelf, in what order, and in what order the dialogue
// options appear — from an explicit seed. Same seed, same case, exactly.

import type { Scenario, ScenarioTemplate } from "../types";
import { MEDICINES } from "../data/medicines";
import { PATIENT_INDEX } from "../data/patients";
import { hashString, makeRng, shuffle } from "./rng";

/** Shelf items beyond the prescribed products and the template's decoys. */
const SHELF_PADDING = 4;

export function buildScenario(
  template: ScenarioTemplate,
  seed: number,
  caseNumber: number,
  today: string,
): Scenario {
  const rng = makeRng(seed ^ hashString(template.id));
  const patientRecord = PATIENT_INDEX[template.patientId];
  if (!patientRecord) throw new Error(`Unknown patient: ${template.patientId}`);

  const prescribed = template.prescription ? template.prescription.items.map((i) => i.medicineId) : [];

  // The shelf is the prescribed products, the template's deliberate decoys and
  // a little padding, so the correct pack is never the only plausible one.
  const ids: string[] = [];
  const add = (id: string) => {
    if (id && ids.indexOf(id) === -1) ids.push(id);
  };
  prescribed.forEach(add);
  template.decoyMedicineIds.forEach(add);
  shuffle(MEDICINES.map((m) => m.id), rng)
    .slice(0, SHELF_PADDING)
    .forEach(add);

  return {
    templateId: template.id,
    seed,
    caseNumber,
    kind: template.kind,
    tier: template.tier,
    title: template.title,
    brief: template.brief,
    patient: patientRecord,
    prescription: template.prescription
      ? { ...template.prescription, id: `RX-${String(caseNumber).padStart(4, "0")}`, date: today }
      : undefined,
    findings: template.findings,
    shelfMedicineIds: shuffle(ids, rng),
    // Option order is shuffled so the right answer is not always in the same
    // place — but the option `id`s are stable, which is what scoring uses.
    dialogue: template.dialogue.map((turn) => ({ ...turn, options: shuffle(turn.options, rng) })),
    otc: template.otc
      ? { ...template.otc, wwham: template.otc.wwham.map((q) => ({ ...q, options: shuffle(q.options, rng) })) }
      : undefined,
    expectedMinutes: template.expectedMinutes,
    today,
  };
}

/** A seed from the case number plus the day, so cases differ but replay. */
export function seedFor(templateId: string, caseNumber: number): number {
  return (hashString(`${templateId}:${caseNumber}`) >>> 0) % 100000;
}
