// ============================================================
// The debrief: competencies, errors and what to learn from them
// ============================================================
//
// Two rules shape everything here.
//
// 1. Score the *technique*, not the outcome. Refusing to supply is a correct
//    outcome; so is finding nothing wrong with a clean prescription. What is
//    scored is whether the student did the work that would have found a
//    problem had there been one.
// 2. Never report an error without the teaching. Every `ErrorEntry` carries a
//    `learningPoint`, because "you missed the allergy" on its own teaches a
//    student to be anxious rather than systematic.

import type {
  CheckRecord,
  CompetencyId,
  CompetencyScore,
  CounsellingSelection,
  DocumentationDraft,
  ErrorEntry,
  Finding,
  InterventionRecord,
  LabelDraft,
  OtcOutcome,
  PerformanceReport,
  Scenario,
  TranscriptionEntry,
  TrayItem,
  VerificationId,
  WwhamField,
} from "../types";
import { COMPETENCIES, RED_FLAGS, redFlagLabel } from "../data/constants";
import { medicine } from "../data/medicines";
import { expiryStatus } from "./inventory";
import { toMonth, addDays } from "./dates";
import {
  falseAttestations,
  gradeAllChecks,
  labelIssues,
  missedFindings,
  requiredQuantity,
  verificationTruths,
} from "./clinical";
import { counsellingPercent, dialoguePercent, gradeCounselling, gradeDialogue, gradeRedFlags, gradeOtcDecision, gradeWwham } from "./counselling";

export interface CaseSubmission {
  scenario: Scenario;
  records: CheckRecord[];
  interventions: InterventionRecord[];
  transcription: TranscriptionEntry[];
  tray: TrayItem[];
  /** Expiry month of the batch chosen, keyed by prescription item id. */
  batchExpiry: Record<string, string>;
  labels: Record<string, LabelDraft>;
  ticked: VerificationId[];
  counselling: CounsellingSelection[];
  dialogue: { turnId: string; optionId: string }[];
  documentation: DocumentationDraft;
  wwham: { field: WwhamField; optionId: string }[];
  redFlags: string[];
  otcDecision: { outcome: OtcOutcome; medicineId: string | null } | null;
  minutesTaken: number;
}

interface Bucket {
  earned: number;
  max: number;
}

const add = (b: Bucket, earned: number, max: number) => {
  b.earned += earned;
  b.max += max;
};

function competency(id: CompetencyId, bucket: Bucket): CompetencyScore {
  const meta = COMPETENCIES.find((c) => c.id === id);
  return {
    id,
    label: meta ? meta.label : id,
    percent: bucket.max === 0 ? 0 : Math.round((bucket.earned / bucket.max) * 100),
    earned: Math.round(bucket.earned * 10) / 10,
    max: bucket.max,
  };
}

export function buildReport(sub: CaseSubmission): PerformanceReport {
  const { scenario } = sub;
  const errors: ErrorEntry[] = [];
  const strengths: string[] = [];

  const assessment: Bucket = { earned: 0, max: 0 };
  const selection: Bucket = { earned: 0, max: 0 };
  const doseVerification: Bucket = { earned: 0, max: 0 };
  const counselling: Bucket = { earned: 0, max: 0 };
  const communication: Bucket = { earned: 0, max: 0 };
  const documentation: Bucket = { earned: 0, max: 0 };

  if (scenario.kind === "rx" && scenario.prescription) {
    gradeRxAssessment(sub, assessment, errors, strengths);
    gradeRxSelection(sub, selection, errors, strengths);
    gradeRxDose(sub, doseVerification, errors, strengths);
    gradeRxCounselling(sub, counselling, strengths);
  } else if (scenario.otc) {
    gradeOtc(sub, assessment, selection, counselling, errors, strengths);
  }

  // Communication is the same skill whichever workflow produced it.
  const dialogueGrades = gradeDialogue(scenario.dialogue, sub.dialogue);
  if (dialogueGrades.length > 0) {
    add(communication, dialoguePercent(dialogueGrades), 100);
    dialogueGrades.forEach((g) => {
      if (g.percent < 60) {
        errors.push({
          id: `dialogue-${g.turnId}`,
          title: "Response to the patient fell short",
          detail: g.option.text,
          severity: g.option.scores.safety === 0 ? "critical" : "caution",
          learningPoint: g.option.feedback,
        });
      }
    });
    if (dialogueGrades.every((g) => g.percent >= 90)) strengths.push("Every question at the window was answered accurately, safely and in plain language.");
  }

  gradeDocumentation(sub, documentation, errors, strengths);

  const competencies = [
    competency("prescription-assessment", assessment),
    competency("medicine-selection", selection),
    competency("dose-verification", doseVerification),
    competency("counselling", counselling),
    competency("communication", communication),
    competency("documentation", documentation),
  ];

  const exercised = competencies.filter((c) => c.max > 0);
  const overallPercent = exercised.length === 0 ? 0 : Math.round(exercised.reduce((s, c) => s + c.percent, 0) / exercised.length);

  const criticalMissed = errors.some((e) => e.severity === "critical");

  return {
    caseNumber: scenario.caseNumber,
    scenarioTitle: scenario.title,
    competencies,
    overallPercent,
    // Worst first: a debrief that opens with a tick when a critical problem was
    // missed teaches the wrong lesson about priority.
    errors: errors.sort((a, b) => severityRank(a.severity) - severityRank(b.severity)),
    strengths,
    minutesTaken: sub.minutesTaken,
    criticalMissed,
  };
}

function severityRank(level: string): number {
  return ["critical", "caution", "review", "ok"].indexOf(level);
}

// ─── Prescription workflow ───────────────────────────────────────────────────

function gradeRxAssessment(sub: CaseSubmission, bucket: Bucket, errors: ErrorEntry[], strengths: string[]) {
  const { scenario } = sub;
  const grades = gradeAllChecks(sub.records, scenario.findings);

  grades.forEach((g) => {
    let earned = 0;
    if (g.outcome === "correct-clear" || g.outcome === "identified") earned = 2;
    else if (g.outcome === "partial" || g.outcome === "over-called") earned = 1;
    add(bucket, earned, 2);

    if (g.outcome === "not-run") {
      errors.push({
        id: `check-not-run-${g.checkId}`,
        title: "A safety check was never run",
        detail: `The ${g.checkId.replace("-", " ")} check was left unopened for this prescription.`,
        severity: g.missed.length > 0 ? "critical" : "caution",
        learningPoint:
          "The value of the checks is that they are run every time, including on prescriptions that look routine. A check skipped is a problem you have decided not to find.",
      });
    }
    if (g.outcome === "over-called") {
      errors.push({
        id: `check-over-${g.checkId}`,
        title: "A concern was recorded where there was none",
        detail: `You recorded a concern on the ${g.checkId.replace("-", " ")} check, but nothing in this case supports it.`,
        severity: "review",
        learningPoint:
          "Over-calling has a real cost: it delays the patient, it uses the prescriber's time, and it trains colleagues to ignore your flags. Record a concern when the evidence supports one.",
      });
    }
  });

  missedFindings(sub.records, scenario.findings).forEach((f) => {
    errors.push({
      id: `missed-${f.id}`,
      title: `Missed: ${f.title}`,
      detail: f.detail,
      severity: f.severity,
      learningPoint: f.learningPoint,
    });
  });

  // Transcription — reading the order correctly is its own skill.
  if (scenario.prescription) {
    scenario.prescription.items.forEach((item) => {
      const entry = sub.transcription.find((t) => t.itemId === item.id);
      const m = medicine(item.medicineId);
      const expected = [
        (m ? m.generic : "").toLowerCase(),
        (m ? m.strength : "").toLowerCase(),
        item.frequencyCode.toLowerCase(),
        String(item.quantityWritten),
      ];
      const got = entry
        ? [entry.drug.trim().toLowerCase(), entry.strength.trim().toLowerCase(), entry.frequencyCode.trim().toLowerCase(), entry.quantity.trim()]
        : ["", "", "", ""];
      let correct = 0;
      for (let i = 0; i < expected.length; i++) if (expected[i] && got[i] === expected[i]) correct += 1;
      add(bucket, correct, 4);
      if (entry && correct < 4) {
        errors.push({
          id: `transcription-${item.id}`,
          title: "Transcription did not match the prescription",
          detail: `Written: ${item.written}. You recorded: ${entry.drug} ${entry.strength}, ${entry.frequencyCode}, quantity ${entry.quantity}.`,
          severity: "caution",
          learningPoint:
            "Transcription errors travel the whole way to the label. Read the drug, the strength, the frequency and the quantity as four separate facts, and check each against the paper rather than against your memory of it.",
        });
      }
    });
  }

  const allIdentified = scenario.findings.length > 0 && missedFindings(sub.records, scenario.findings).length === 0;
  if (allIdentified) strengths.push("Every clinical problem on this prescription was identified.");
  if (scenario.findings.length === 0 && grades.every((g) => g.outcome === "correct-clear")) {
    strengths.push("All ten checks were run and correctly cleared — a clean prescription recognised as clean.");
  }
}

function gradeRxSelection(sub: CaseSubmission, bucket: Bucket, errors: ErrorEntry[], strengths: string[]) {
  const { scenario } = sub;
  if (!scenario.prescription) return;
  let perfect = true;

  scenario.prescription.items.forEach((item) => {
    const prescribed = medicine(item.medicineId);
    const tray = sub.tray.find((t) => t.itemId === item.id);
    const dispensed = tray ? medicine(tray.medicineId) : undefined;

    const rightDrug = !!dispensed && !!prescribed && dispensed.generic === prescribed.generic;
    const rightStrength = !!dispensed && !!prescribed && dispensed.strength === prescribed.strength;
    const rightForm = !!dispensed && !!prescribed && dispensed.form === prescribed.form;
    add(bucket, rightDrug ? 2 : 0, 2);
    add(bucket, rightStrength ? 2 : 0, 2);
    add(bucket, rightForm ? 1 : 0, 1);

    if (tray && !rightDrug) {
      perfect = false;
      errors.push({
        id: `wrong-drug-${item.id}`,
        title: "The wrong medicine reached the tray",
        detail: `Dispensed ${dispensed ? dispensed.generic : "nothing"} against a prescription for ${prescribed ? prescribed.generic : "?"}.`,
        severity: "critical",
        learningPoint:
          "Look-alike and sound-alike packs are the commonest dispensing error in community practice. Read the generic name on the pack, not the brand and not the shelf position.",
      });
    } else if (tray && !rightStrength) {
      perfect = false;
      errors.push({
        id: `wrong-strength-${item.id}`,
        title: "The strength does not match the prescription",
        detail: `Dispensed ${dispensed ? dispensed.strength : "?"} against ${prescribed ? prescribed.strength : "?"}.`,
        severity: "critical",
        learningPoint:
          "The same brand in two strengths sits side by side on the shelf. Check the strength as a separate step from checking the name — they are two different reads.",
      });
    }

    // The batch: expired, or not lasting the course.
    const expiry = sub.batchExpiry[item.id];
    const courseEndMonth = toMonth(addDays(scenario.today, item.durationDays));
    const stillGood = !!expiry && expiryStatus(expiry, toMonth(scenario.today)) !== "expired";
    const covers = !!expiry && expiry >= courseEndMonth;
    add(bucket, stillGood ? 1 : 0, 1);
    add(bucket, covers ? 1 : 0, 1);
    if (expiry && !stillGood) {
      perfect = false;
      errors.push({
        id: `expired-${item.id}`,
        title: "An expired batch was selected",
        detail: `The batch chosen expired in ${expiry}.`,
        severity: "critical",
        learningPoint: "Expiry is checked on the pack in your hand at the moment of dispensing, not on the shelf label or the system.",
      });
    } else if (expiry && !covers) {
      perfect = false;
      errors.push({
        id: `short-dated-${item.id}`,
        title: "The batch expires before the course finishes",
        detail: `The batch expires ${expiry}; the course runs to ${courseEndMonth}.`,
        severity: "caution",
        learningPoint:
          "A pack in date today is not necessarily in date on the last day of the course. Compare the expiry against the end of the treatment, not against today.",
      });
    }
  });

  if (perfect && sub.tray.length > 0) strengths.push("Right product, right strength and a batch that outlasts the course.");
}

function gradeRxDose(sub: CaseSubmission, bucket: Bucket, errors: ErrorEntry[], strengths: string[]) {
  const { scenario } = sub;
  if (!scenario.prescription) return;

  scenario.prescription.items.forEach((item) => {
    const tray = sub.tray.find((t) => t.itemId === item.id);
    const required = requiredQuantity(item);
    const quantityRight = required === null ? !!tray && tray.units > 0 : !!tray && tray.units === required;
    add(bucket, quantityRight ? 3 : 0, 3);
    if (tray && !quantityRight && required !== null) {
      errors.push({
        id: `quantity-${item.id}`,
        title: "The quantity dispensed does not cover the course",
        detail: `Counted out ${tray.units}; the course needs ${required}.`,
        severity: "caution",
        learningPoint: "Dose × times per day × days. Work it out before you count, and check it again against what you counted.",
      });
    }

    const label = sub.labels[item.id];
    const issues = label
      ? labelIssues({ item, tray, patient: scenario.patient, label, records: sub.records, batchExpiry: sub.batchExpiry[item.id], today: scenario.today })
      : [{ field: "medicineLine" as const, message: "No label was produced.", severity: "critical" as const }];
    const clean = issues.length === 0;
    add(bucket, clean ? 5 : Math.max(0, 5 - issues.length), 5);
    issues.forEach((issue, index) => {
      errors.push({
        id: `label-${item.id}-${index}`,
        title: "The label is not right",
        detail: issue.message,
        severity: issue.severity,
        learningPoint:
          "The label is the only instruction the patient takes home. Directions must be specific enough to follow without you — 'as directed' is not a direction, and a missing warning is a warning not given.",
      });
    });
  });

  // Honesty at the final check.
  const firstItem = scenario.prescription.items[0];
  const truths = verificationTruths({
    item: firstItem,
    tray: sub.tray.find((t) => t.itemId === firstItem.id),
    patient: scenario.patient,
    label: sub.labels[firstItem.id],
    records: sub.records,
    batchExpiry: sub.batchExpiry[firstItem.id],
    today: scenario.today,
  });
  const lies = falseAttestations(truths, sub.ticked);
  add(bucket, lies.length === 0 ? 2 : 0, 2);
  lies.forEach((l) => {
    errors.push({
      id: `attestation-${l.id}`,
      title: "A verification line was ticked that was not true",
      detail: l.problem || "The state of the dispensing did not support this attestation.",
      severity: "critical",
      learningPoint:
        "The final check only protects a patient if each line is confirmed before it is ticked. Ticking down a list without looking is how a verified error reaches the counter.",
    });
  });
  if (lies.length === 0 && sub.ticked.length > 0) strengths.push("Every line of the final verification was true when it was ticked.");
}

function gradeRxCounselling(sub: CaseSubmission, bucket: Bucket, strengths: string[]) {
  const { scenario } = sub;
  if (!scenario.prescription || sub.counselling.length === 0) return;
  const firstItem = scenario.prescription.items[0];
  const tray = sub.tray.find((t) => t.itemId === firstItem.id);
  const m = medicine(tray ? tray.medicineId : firstItem.medicineId);
  if (!m) return;
  const grades = gradeCounselling(m, sub.counselling);
  const percent = counsellingPercent(grades);
  add(bucket, percent, 100);
  if (percent >= 85) strengths.push("Counselling covered the points that matter, without saying anything untrue.");
}

// ─── Minor-ailment workflow ──────────────────────────────────────────────────

function gradeOtc(
  sub: CaseSubmission,
  assessment: Bucket,
  selection: Bucket,
  counselling: Bucket,
  errors: ErrorEntry[],
  strengths: string[],
) {
  const otc = sub.scenario.otc;
  if (!otc) return;

  const wwham = gradeWwham(otc, sub.wwham);
  wwham.forEach((w) => {
    add(assessment, w.elicited ? 2 : w.asked ? 1 : 0, 2);
    if (!w.asked) {
      errors.push({
        id: `wwham-${w.field}`,
        title: "Part of the assessment was skipped",
        detail: `You did not establish: ${w.field}.`,
        severity: "caution",
        learningPoint:
          "WWHAM is a floor, not a ceiling. The question you skip is the one carrying the red flag — most commonly 'what else are they taking' and 'how long has it been going on'.",
      });
    }
  });

  const flags = gradeRedFlags(otc, sub.redFlags);
  add(assessment, flags.percent, 100);
  flags.missed.forEach((id) => {
    errors.push({
      id: `flag-${id}`,
      title: "A red flag was not recognised",
      detail: redFlagLabel(id),
      severity: "critical",
      learningPoint:
        "Red flags are the boundary of pharmacy practice. Missing one does not mean choosing the wrong product — it means treating a patient who needed a doctor.",
    });
  });
  flags.spurious.forEach((id) => {
    errors.push({
      id: `flag-extra-${id}`,
      title: "A red flag was recorded that was not present",
      detail: redFlagLabel(id),
      severity: "review",
      learningPoint: "Referring a patient who did not need it has a cost too — their time, the clinic's, and their trust in your judgement next time.",
    });
  });
  if (flags.missed.length === 0 && flags.spurious.length === 0) {
    strengths.push(otc.redFlagIds.length ? "Every red flag in the history was recognised." : "Correctly found no red flags in a history that had none.");
  }

  if (sub.otcDecision) {
    const decision = gradeOtcDecision(otc, sub.otcDecision.outcome, sub.otcDecision.medicineId);
    add(selection, decision.correct ? 6 : 0, 6);
    if (!decision.correct) {
      errors.push({
        id: "otc-decision",
        title: decision.unsafeSupply ? "Supplied a medicine to a patient who needed referral" : "Referred a patient who could have been treated here",
        detail: decision.unsafeSupply
          ? otc.referralReason || "This presentation needed medical assessment."
          : "Self-care was appropriate for this presentation.",
        severity: decision.unsafeSupply ? "critical" : "review",
        learningPoint: otc.rationale,
      });
    } else {
      strengths.push(decision.expected === "refer" ? "Correctly referred rather than supplying." : "Correctly treated this as a pharmacy supply.");
    }
    if (decision.chosen === "self-care") {
      add(selection, decision.productAppropriate ? 4 : 0, 4);
      if (!decision.productAppropriate) {
        errors.push({
          id: "otc-product",
          title: "The product chosen was not the best option",
          detail: "Another product on the shelf suited this patient better.",
          severity: "caution",
          learningPoint: otc.rationale,
        });
      }
    }
  }

  if (sub.counselling.length > 0 && sub.otcDecision && sub.otcDecision.medicineId) {
    const m = medicine(sub.otcDecision.medicineId);
    if (m) {
      const percent = counsellingPercent(gradeCounselling(m, sub.counselling));
      add(counselling, percent, 100);
      if (percent >= 85) strengths.push("The counselling on the product supplied was thorough and accurate.");
    }
  }
}

// ─── Documentation ───────────────────────────────────────────────────────────

const DOC_FIELDS: { key: keyof DocumentationDraft; label: string }[] = [
  { key: "complaint", label: "Presenting complaint" },
  { key: "assessment", label: "Assessment" },
  { key: "supplied", label: "Medicine supplied" },
  { key: "counselling", label: "Counselling provided" },
  { key: "intervention", label: "Intervention" },
  { key: "referral", label: "Referral" },
  { key: "followUp", label: "Follow-up advice" },
];

function gradeDocumentation(sub: CaseSubmission, bucket: Bucket, errors: ErrorEntry[], strengths: string[]) {
  const filled = DOC_FIELDS.filter((f) => (sub.documentation[f.key] || "").trim().length >= 3);
  add(bucket, filled.length, DOC_FIELDS.length);

  const needsReferral =
    (sub.scenario.otc && sub.scenario.otc.correctOutcome === "refer") || sub.scenario.findings.some((f) => f.blocksDispensing);
  if (needsReferral && !(sub.documentation.referral || "").trim()) {
    errors.push({
      id: "doc-referral",
      title: "The referral or prescriber contact was not documented",
      detail: "This case required contacting a prescriber or referring the patient, and the record does not say so.",
      severity: "caution",
      learningPoint:
        "An intervention that is not documented cannot be defended, audited or followed up. The note is part of the intervention, not paperwork after it.",
    });
  }
  if (filled.length === DOC_FIELDS.length) strengths.push("A complete record was left for the next pharmacist.");
}

/** The professional record, as text — used for the preview, copy and print. */
export function renderDocumentation(sub: CaseSubmission, pharmacyName: string): string[] {
  const { scenario, documentation } = sub;
  const lines = [
    `${pharmacyName} — PHARMACY INTERVENTION RECORD`,
    `Case ${String(scenario.caseNumber).padStart(4, "0")} · ${scenario.today}`,
    "",
    `Patient: ${scenario.patient.name} (${scenario.patient.ageLabel})`,
    scenario.prescription ? `Prescription: ${scenario.prescription.id} · ${scenario.prescription.prescriber.name}` : "Presentation: minor ailment consultation",
    "",
  ];
  DOC_FIELDS.forEach((f) => {
    const value = (documentation[f.key] || "").trim();
    lines.push(`${f.label.toUpperCase()}`);
    lines.push(value || "— not recorded —");
    lines.push("");
  });
  lines.push("Recorded by: pharmacist on duty (simulation)");
  lines.push("This record was produced in a training simulation and relates to no real patient.");
  return lines;
}

export { DOC_FIELDS };

/** The intervention a student recorded for a finding, for the record's prose. */
export function describeInterventions(interventions: InterventionRecord[], findings: Finding[]): string {
  if (interventions.length === 0) return "";
  return interventions
    .map((i) => {
      const f = findings.find((x) => x.id === i.findingId);
      const what = f ? f.title : i.findingId;
      const action = {
        "contact-prescriber": "prescriber contacted",
        "counsel-and-dispense": "supplied with counselling",
        "refuse-supply": "supply refused",
        "dispense-as-written": "dispensed as written",
      }[i.action];
      return `${what} — ${action}${i.note ? `: ${i.note}` : ""}`;
    })
    .join("; ");
}

export const ALL_RED_FLAG_IDS = RED_FLAGS.map((f) => f.id);
