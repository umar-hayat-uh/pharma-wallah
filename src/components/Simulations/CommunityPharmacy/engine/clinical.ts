// ============================================================
// The clinical model: quantities, checks, verification, labels
// ============================================================
//
// Pure. No React, no DOM. Every number the student is shown — days' supply,
// required quantity, whether an attestation is true — comes from a function
// here, so it can be checked by hand and by `scripts/pharmacy-counter.test.mts`.

import type {
  CheckId,
  CheckRecord,
  Finding,
  LabelDraft,
  LabelIssue,
  Medicine,
  Patient,
  RiskLevel,
  RxItem,
  TrayItem,
  VerificationId,
  VerificationTruth,
} from "../types";
import { CHECK_SPECS, frequencyByCode } from "../data/constants";
import { medicine } from "../data/medicines";
import { addDays, monthsUntilExpiry, toMonth } from "./dates";

// ─── Quantities ──────────────────────────────────────────────────────────────

/**
 * Units needed for the course: dose × administrations per day × days.
 *
 * `null` for a PRN order — days' supply is undefined when the frequency is
 * "as needed", and printing a number there would be a lie the student learns.
 */
export function requiredQuantity(item: RxItem): number | null {
  const freq = frequencyByCode(item.frequencyCode);
  if (!freq || freq.perDay === 0) return null;
  return item.doseUnits * freq.perDay * item.durationDays;
}

/** Days a given quantity lasts. `null` for PRN, for the same reason. */
export function daysSupply(quantity: number, doseUnits: number, frequencyCode: string): number | null {
  const freq = frequencyByCode(frequencyCode);
  if (!freq || freq.perDay === 0 || doseUnits <= 0) return null;
  const perDay = doseUnits * freq.perDay;
  if (perDay <= 0) return null;
  return Math.floor(quantity / perDay);
}

/**
 * The quantity arithmetic, written out line by line.
 *
 * Shown to the student rather than only the answer: the point of the stage is
 * that they can reproduce it, not that the counter can.
 */
export function quantityWorking(item: RxItem): string[] {
  const freq = frequencyByCode(item.frequencyCode);
  if (!freq || freq.perDay === 0) {
    return ["This is an as-needed order, so a days' supply cannot be calculated from the directions."];
  }
  const perDay = item.doseUnits * freq.perDay;
  const total = perDay * item.durationDays;
  return [
    `${item.doseUnits} per dose × ${freq.perDay} doses each day = ${perDay} per day`,
    `${perDay} per day × ${item.durationDays} days = ${total} units for the course`,
    `Quantity written on the prescription: ${item.quantityWritten}`,
  ];
}

/** Whole packs needed to supply `units`, given the pack size. */
export function packsNeeded(units: number, packSize: number): number {
  if (packSize <= 0) return 0;
  return Math.ceil(units / packSize);
}

/** Total daily dose in the medicine's own strength unit. */
export function dailyDose(item: RxItem, m: Medicine): number | null {
  const freq = frequencyByCode(item.frequencyCode);
  if (!freq || freq.perDay === 0) return null;
  // For a liquid the strength is per 5 mL, so the dose in mg is volume/5 × strength.
  const perDoseUnits = m.strengthUnit.indexOf("/5 mL") !== -1 ? (item.doseUnits / 5) * m.strengthValue : item.doseUnits * m.strengthValue;
  return perDoseUnits * freq.perDay;
}

/** mg/kg/day, when both a weight and a sensible strength are available. */
export function mgPerKgPerDay(item: RxItem, m: Medicine, patient: Patient): number | null {
  const daily = dailyDose(item, m);
  if (daily === null || !patient.weightKg) return null;
  return Math.round((daily / patient.weightKg) * 10) / 10;
}

// ─── The check console ───────────────────────────────────────────────────────

export type CheckOutcome = "not-run" | "correct-clear" | "identified" | "partial" | "missed" | "over-called";

export interface CheckGrade {
  checkId: CheckId;
  outcome: CheckOutcome;
  /** Findings the student named correctly. */
  matched: Finding[];
  /** Real problems they did not name. */
  missed: Finding[];
  /** Concerns recorded that do not correspond to a real problem. */
  spurious: CheckRecord[];
}

function sameConcern(record: CheckRecord, finding: Finding): boolean {
  if (record.concernId !== finding.concernId) return false;
  // A finding pinned to an item must be recorded against that item. A finding
  // with no item (a whole-prescription concern) matches any record.
  if (!finding.itemId) return true;
  return record.itemId === finding.itemId;
}

/** True once the student has recorded any verdict for this check. */
export function checkRun(records: CheckRecord[], checkId: CheckId): boolean {
  return records.some((r) => r.checkId === checkId);
}

/** Every check has been run — the gate on leaving the safety-check stage. */
export function allChecksRun(records: CheckRecord[]): boolean {
  return CHECK_SPECS.every((spec) => checkRun(records, spec.id));
}

export function checksOutstanding(records: CheckRecord[]): CheckId[] {
  return CHECK_SPECS.filter((spec) => !checkRun(records, spec.id)).map((spec) => spec.id);
}

export function gradeCheck(checkId: CheckId, records: CheckRecord[], findings: Finding[]): CheckGrade {
  const mine = records.filter((r) => r.checkId === checkId);
  const real = findings.filter((f) => f.checkId === checkId);

  if (mine.length === 0) {
    return { checkId, outcome: "not-run", matched: [], missed: real, spurious: [] };
  }

  const concerns = mine.filter((r) => r.verdict === "concern");
  const matched = real.filter((f) => concerns.some((r) => sameConcern(r, f)));
  const missed = real.filter((f) => matched.indexOf(f) === -1);
  const spurious = concerns.filter((r) => !real.some((f) => sameConcern(r, f)));

  let outcome: CheckOutcome;
  if (real.length === 0) {
    outcome = concerns.length === 0 ? "correct-clear" : "over-called";
  } else if (matched.length === real.length) {
    outcome = "identified";
  } else if (matched.length > 0) {
    outcome = "partial";
  } else {
    // They recorded something, but nothing that names the real problem. If they
    // said "no concern" that is a miss; if they said the wrong thing it is
    // still a miss, but the debrief distinguishes them by `spurious`.
    outcome = "missed";
  }

  return { checkId, outcome, matched, missed, spurious };
}

export function gradeAllChecks(records: CheckRecord[], findings: Finding[]): CheckGrade[] {
  return CHECK_SPECS.map((spec) => gradeCheck(spec.id, records, findings));
}

/** Findings the student identified, across every check. */
export function identifiedFindings(records: CheckRecord[], findings: Finding[]): Finding[] {
  const grades = gradeAllChecks(records, findings);
  const out: Finding[] = [];
  grades.forEach((g) => g.matched.forEach((f) => out.push(f)));
  return out;
}

export function missedFindings(records: CheckRecord[], findings: Finding[]): Finding[] {
  const grades = gradeAllChecks(records, findings);
  const out: Finding[] = [];
  grades.forEach((g) => g.missed.forEach((f) => out.push(f)));
  return out;
}

/**
 * Findings that stop the supply.
 *
 * Unresolved means: a blocking problem exists and the student has not recorded
 * an intervention that deals with it. This is what makes a critical allergy
 * different from an interaction worth a phone call.
 */
export function blockingFindings(findings: Finding[], resolvedIds: string[]): Finding[] {
  return findings.filter((f) => f.blocksDispensing && resolvedIds.indexOf(f.id) === -1);
}

export function worstSeverity(findings: Finding[]): RiskLevel {
  if (findings.some((f) => f.severity === "critical")) return "critical";
  if (findings.some((f) => f.severity === "caution")) return "caution";
  if (findings.some((f) => f.severity === "review")) return "review";
  return "ok";
}

// ─── Verification ────────────────────────────────────────────────────────────

export interface VerificationContext {
  item: RxItem;
  tray?: TrayItem;
  patient: Patient;
  label?: LabelDraft;
  records: CheckRecord[];
  /** Expiry month of the batch the student picked. */
  batchExpiry?: string;
  today: string;
}

/**
 * What the state actually supports, line by line.
 *
 * The student ticks what they believe; this says what is true. A tick on a
 * false line is not scored as "wrong" — it produces the review intervention,
 * which is the whole point of a final check.
 */
export function verificationTruths(ctx: VerificationContext): VerificationTruth[] {
  const prescribed = medicine(ctx.item.medicineId);
  const dispensed = ctx.tray ? medicine(ctx.tray.medicineId) : undefined;
  const required = requiredQuantity(ctx.item);
  const out: VerificationTruth[] = [];

  const push = (id: VerificationId, truth: boolean, problem?: string) => out.push({ id, truth, problem });

  push(
    "right-patient",
    !!ctx.label && ctx.label.patientName.trim().toLowerCase() === ctx.patient.name.trim().toLowerCase(),
    "The name on the label does not match the patient at the counter.",
  );
  push(
    "right-medicine",
    !!dispensed && !!prescribed && dispensed.generic === prescribed.generic,
    dispensed && prescribed ? `The tray holds ${dispensed.generic}; the prescription is for ${prescribed.generic}.` : "Nothing has been dispensed into the tray yet.",
  );
  push(
    "right-strength",
    !!dispensed && !!prescribed && dispensed.strength === prescribed.strength,
    dispensed && prescribed ? `The tray holds ${dispensed.strength}; the prescription says ${prescribed.strength}.` : "No product selected.",
  );
  push(
    "right-form",
    !!dispensed && !!prescribed && dispensed.form === prescribed.form,
    dispensed && prescribed ? `The tray holds a ${dispensed.form.toLowerCase()}; the prescription says ${prescribed.form.toLowerCase()}.` : "No product selected.",
  );
  push(
    "right-quantity",
    required === null ? !!ctx.tray && ctx.tray.units > 0 : !!ctx.tray && ctx.tray.units === required,
    required === null ? "Nothing has been counted out." : `The course needs ${required} units; the tray holds ${ctx.tray ? ctx.tray.units : 0}.`,
  );
  push("right-directions", labelIssues(ctx).length === 0, "The label's directions do not match the prescription.");

  const courseEnd = addDays(ctx.today, ctx.item.durationDays);
  const covers = ctx.batchExpiry ? monthsUntilExpiry(ctx.batchExpiry, toMonth(courseEnd)) >= 0 : false;
  push("expiry-checked", covers, ctx.batchExpiry ? "The batch you selected expires before the course finishes." : "No batch has been selected.");

  push("allergies-checked", checkRun(ctx.records, "allergy"), "The drug–allergy check has not been run for this patient.");
  push(
    "interactions-checked",
    checkRun(ctx.records, "interaction") && checkRun(ctx.records, "duplicate"),
    "The interaction and duplicate-therapy checks have not both been run.",
  );

  return out;
}

export function truthFor(truths: VerificationTruth[], id: VerificationId): VerificationTruth | undefined {
  return truths.find((t) => t.id === id);
}

/** The lines the student ticked that are not actually true. */
export function falseAttestations(truths: VerificationTruth[], ticked: VerificationId[]): VerificationTruth[] {
  return truths.filter((t) => ticked.indexOf(t.id) !== -1 && !t.truth);
}

// ─── The label ───────────────────────────────────────────────────────────────

/** A label the student has not edited yet — prefilled from the prescription. */
export function draftLabel(item: RxItem, patient: Patient, m: Medicine | undefined, units: number | null): LabelDraft {
  return {
    itemId: item.id,
    patientName: patient.name,
    medicineLine: m ? `${m.generic.toUpperCase()} ${m.strength} ${m.form.toUpperCase()}` : "",
    doseUnits: String(item.doseUnits),
    route: item.route,
    frequencyCode: item.frequencyCode,
    durationDays: String(item.durationDays),
    quantity: units === null ? "" : String(units),
    specialInstructions: m ? m.auxLabels.slice() : [],
    storage: m ? m.storage : "",
  };
}

/**
 * Directions a patient can follow without the pharmacist in the room.
 *
 * "As directed" is the classic failure, so it is rejected explicitly.
 */
export function directionsLine(draft: LabelDraft, m: Medicine | undefined): string {
  const freq = frequencyByCode(draft.frequencyCode);
  const unitWord = m ? (m.form === "Suspension" || m.form === "Syrup" ? "mL" : m.form === "Inhaler" ? "puff" : m.packUnit.replace(/s$/, "")) : "unit";
  const dose = draft.doseUnits;
  const plural = Number(dose) === 1 ? "" : "s";
  const timing = freq ? freq.label.split("— ")[1] || freq.label : draft.frequencyCode;
  const days = draft.durationDays ? ` for ${draft.durationDays} days` : "";
  return `Take ${dose} ${unitWord}${plural} ${timing}${days}.`;
}

export function labelIssues(ctx: VerificationContext): LabelIssue[] {
  const issues: LabelIssue[] = [];
  const draft = ctx.label;
  if (!draft) return [{ field: "medicineLine", message: "No label has been written yet.", severity: "review" }];

  const m = medicine(ctx.item.medicineId);
  const required = requiredQuantity(ctx.item);

  if (!draft.patientName.trim()) {
    issues.push({ field: "patientName", message: "A label must carry the patient's name.", severity: "critical" });
  } else if (draft.patientName.trim().toLowerCase() !== ctx.patient.name.trim().toLowerCase()) {
    issues.push({ field: "patientName", message: `The label says "${draft.patientName}"; the patient is ${ctx.patient.name}.`, severity: "critical" });
  }

  if (Number(draft.doseUnits) !== ctx.item.doseUnits) {
    issues.push({ field: "doseUnits", message: `The prescription says ${ctx.item.doseUnits} per dose.`, severity: "critical" });
  }
  if (draft.frequencyCode !== ctx.item.frequencyCode) {
    issues.push({ field: "frequencyCode", message: `The prescription says ${ctx.item.frequencyCode}.`, severity: "critical" });
  }
  if (Number(draft.durationDays) !== ctx.item.durationDays) {
    issues.push({ field: "durationDays", message: `The prescription says ${ctx.item.durationDays} days.`, severity: "caution" });
  }
  if (required !== null && Number(draft.quantity) !== required) {
    issues.push({ field: "quantity", message: `The course needs ${required} units.`, severity: "caution" });
  }
  if (!draft.route.trim()) {
    issues.push({ field: "route", message: "State the route — a label without one is ambiguous.", severity: "caution" });
  }

  // The auxiliary labels that genuinely belong to this product.
  if (m) {
    const missing = m.auxLabels.filter((l) => draft.specialInstructions.indexOf(l) === -1);
    const extra = draft.specialInstructions.filter((l) => m.auxLabels.indexOf(l) === -1);
    if (missing.length) {
      issues.push({ field: "auxiliary", message: `Missing warning: ${missing.join("; ")}.`, severity: "caution" });
    }
    if (extra.length) {
      issues.push({ field: "auxiliary", message: `These warnings do not belong on this product: ${extra.join("; ")}.`, severity: "review" });
    }
  }

  return issues;
}

/** The printed label, as text — reused by the preview, the copy button and the record. */
export function renderLabel(draft: LabelDraft, m: Medicine | undefined, pharmacy: string, dateLabel: string): string[] {
  const lines = [pharmacy, "", draft.medicineLine, "", directionsLine(draft, m)];
  draft.specialInstructions.forEach((s) => lines.push(s.toUpperCase()));
  lines.push("");
  lines.push(`Quantity: ${draft.quantity}`);
  lines.push(`Patient: ${draft.patientName}`);
  lines.push(`Date: ${dateLabel}`);
  if (draft.storage) lines.push(draft.storage);
  lines.push("Keep out of the reach of children.");
  return lines;
}
