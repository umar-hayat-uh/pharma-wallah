"use client";

// ============================================================
// The counter's state machine
// ============================================================
//
// One reducer owns the whole encounter. Everything it decides is derived from
// `engine/` — this file holds *what happened*, not *what is true*, so the rules
// stay testable without React.
//
// Two behaviours are worth reading before changing anything here:
//
// 1. A mistake raises a **review**, not a failure. The student is told what to
//    re-check and is left able to fix it. Nothing is scored until the case is
//    submitted, so a corrected error is a corrected error.
// 2. A **blocking finding stops the supply**. A critical allergy or a
//    contraindicated combination cannot be dispensed past, however many times
//    the button is pressed — the only way forward is to record an intervention.

import { useCallback, useMemo, useReducer } from "react";

import type {
  CaseResult,
  CheckId,
  CheckRecord,
  CheckVerdict,
  CounsellingTopic,
  DocumentationDraft,
  Finding,
  InterventionAction,
  InterventionRecord,
  LabelDraft,
  PanelId,
  PaymentMethod,
  PerformanceReport,
  RiskLevel,
  SavedProgress,
  Scenario,
  Stage,
  StockLine,
  TranscriptionEntry,
  TrayItem,
  VerificationId,
  WwhamField,
} from "./types";
import { SCENARIOS, scenarioTemplate } from "./data/scenarios";
import { medicine } from "./data/medicines";
import { CHECK_SPECS, STAGE_COPY, VERIFICATION_SPECS } from "./data/constants";
import { buildScenario, seedFor } from "./engine/scenario";
import { buildInventory, dispensePacks, removeBatch, receivePacks, currentMonth } from "./engine/inventory";
import {
  blockingFindings,
  draftLabel,
  packsNeeded,
  requiredQuantity,
  verificationTruths,
} from "./engine/clinical";
import { buildReport, type CaseSubmission } from "./engine/scoring";
import { progressPercent, stageComplete, stageFlow, stageSkipped, stageUnlocked, nextStage, type FlowState } from "./engine/flow";

export const PHARMACY_NAME = "PharmaWallah Community Pharmacy";
export const STORAGE_KEY = "pw-community-pharmacy-v1";

/** The professional intervention shown instead of "Wrong!". */
export interface ReviewNotice {
  title: string;
  body: string;
  /** Concrete things to re-check, as a list. */
  items: string[];
  tone: RiskLevel;
}

export interface CounterState {
  screen: "home" | "counter" | "debrief";
  hydrated: boolean;
  /** The pharmacy's own date. Set after mount — never read during render. */
  today: string;
  stock: StockLine[];
  results: CaseResult[];
  savedRecords: SavedProgress["records"];
  nextCaseNumber: number;
  /** A case interrupted by a reload, offered back as "Continue". */
  savedSession: CounterState | null;

  scenario: Scenario | null;
  stage: Stage;
  seen: Stage[];
  panel: PanelId | null;

  records: CheckRecord[];
  revealed: string[];
  interventions: InterventionRecord[];
  interventionsDone: boolean;
  transcription: TranscriptionEntry[];
  transcriptionDone: boolean;

  selectedMedicineId: Record<string, string>;
  selectedBatchId: Record<string, string>;
  quantityConfirmed: Record<string, boolean>;
  tray: TrayItem[];
  labels: Record<string, LabelDraft>;
  labelsWritten: Record<string, boolean>;
  ticked: VerificationId[];
  /** Attestations the student tried to tick that were not true. */
  reviewsRaised: VerificationId[];

  counselling: { topic: CounsellingTopic; chosen: string[] }[];
  counsellingDone: CounsellingTopic[];
  dialogue: { turnId: string; optionId: string }[];

  wwham: { field: WwhamField; optionId: string }[];
  redFlags: string[];
  redFlagsRecorded: boolean;
  otcDecision: { outcome: "self-care" | "refer"; medicineId: string | null } | null;

  documentation: DocumentationDraft;
  documentationDone: boolean;

  payment: PaymentMethod | null;
  discountPkr: number;
  paid: boolean;

  startedAt: number | null;
  /** True when earlier stages were completed for the student (a drill). */
  drill: Stage | null;
  report: PerformanceReport | null;
  review: ReviewNotice | null;
  toast: { message: string; tone: RiskLevel } | null;
}

const EMPTY_DOC: DocumentationDraft = {
  complaint: "",
  assessment: "",
  supplied: "",
  counselling: "",
  intervention: "",
  referral: "",
  followUp: "",
};

export type CounterAction =
  | { type: "hydrate"; payload: Partial<SavedProgress>; today: string; session?: CounterState | null }
  | { type: "resume" }
  | { type: "discard-session" }
  | { type: "start-case"; templateId: string }
  | { type: "drill"; templateId: string; stage: Stage }
  | { type: "exit-case" }
  | { type: "open-panel"; panel: PanelId | null }
  | { type: "go-stage"; stage: Stage }
  | { type: "advance" }
  | { type: "see" }
  | { type: "set-transcription"; itemId: string; patch: Partial<TranscriptionEntry> }
  | { type: "submit-transcription" }
  | { type: "record-check"; checkId: CheckId; verdict: CheckVerdict; concernId?: string; itemId?: string }
  | { type: "clear-check"; checkId: CheckId }
  | { type: "record-intervention"; findingId: string; action: InterventionAction; note?: string }
  | { type: "finish-interventions" }
  | { type: "select-medicine"; itemId: string; medicineId: string }
  | { type: "select-batch"; itemId: string; batchId: string }
  | { type: "confirm-quantity"; itemId: string }
  | { type: "fill-tray"; itemId: string; units: number }
  | { type: "empty-tray"; itemId: string }
  | { type: "set-label"; itemId: string; patch: Partial<LabelDraft> }
  | { type: "toggle-aux"; itemId: string; label: string }
  | { type: "confirm-label"; itemId: string }
  | { type: "toggle-tick"; id: VerificationId }
  | { type: "set-counselling"; topic: CounsellingTopic; chosen: string[] }
  | { type: "confirm-counselling"; topic: CounsellingTopic }
  | { type: "answer-dialogue"; turnId: string; optionId: string }
  | { type: "answer-wwham"; field: WwhamField; optionId: string }
  | { type: "toggle-red-flag"; id: string }
  | { type: "confirm-red-flags" }
  | { type: "decide-otc"; outcome: "self-care" | "refer" }
  | { type: "choose-otc-product"; medicineId: string | null }
  | { type: "set-doc"; field: keyof DocumentationDraft; value: string }
  | { type: "confirm-doc" }
  | { type: "set-payment"; method: PaymentMethod }
  | { type: "set-discount"; amount: number }
  | { type: "take-payment" }
  | { type: "finish-case" }
  | { type: "dismiss-review" }
  | { type: "dismiss-toast" }
  | { type: "discard-batch"; medicineId: string; batchId: string }
  | { type: "receive-stock"; medicineId: string; batchId: string; packs: number }
  | { type: "reset-progress" };

export function initialState(today: string): CounterState {
  return {
    screen: "home",
    hydrated: false,
    today,
    stock: buildInventory(currentMonth(today)),
    results: [],
    savedRecords: [],
    nextCaseNumber: 1,
    savedSession: null,
    scenario: null,
    stage: "arrival",
    seen: [],
    panel: null,
    records: [],
    revealed: [],
    interventions: [],
    interventionsDone: false,
    transcription: [],
    transcriptionDone: false,
    selectedMedicineId: {},
    selectedBatchId: {},
    quantityConfirmed: {},
    tray: [],
    labels: {},
    labelsWritten: {},
    ticked: [],
    reviewsRaised: [],
    counselling: [],
    counsellingDone: [],
    dialogue: [],
    wwham: [],
    redFlags: [],
    redFlagsRecorded: false,
    otcDecision: null,
    documentation: { ...EMPTY_DOC },
    documentationDone: false,
    payment: null,
    discountPkr: 0,
    paid: false,
    startedAt: null,
    drill: null,
    report: null,
    review: null,
    toast: null,
  };
}

/** The slice `engine/flow` needs. Kept in one place so the two cannot drift. */
export function flowState(s: CounterState): FlowState {
  return {
    scenario: s.scenario,
    stage: s.stage,
    seen: s.seen,
    records: s.records,
    transcriptionDone: s.transcriptionDone,
    interventionsDone: s.interventionsDone,
    selectedMedicineId: s.selectedMedicineId,
    selectedBatchId: s.selectedBatchId,
    quantityConfirmed: s.quantityConfirmed,
    tray: s.tray,
    labelsWritten: s.labelsWritten,
    ticked: s.ticked,
    counsellingTopicsDone: s.counsellingDone.length,
    dialogueAnswered: s.dialogue.length,
    documentationDone: s.documentationDone,
    wwhamAsked: s.wwham.length,
    redFlagsRecorded: s.redFlagsRecorded,
    otcDecided: !!s.otcDecision,
    otcProductChosen: !!s.otcDecision,
    paid: s.paid,
  };
}

/** Findings that still stop the supply, given what has been recorded. */
function unresolvedBlockers(s: CounterState): Finding[] {
  if (!s.scenario) return [];
  const resolved = s.interventions
    .filter((i) => i.action === "contact-prescriber" || i.action === "refuse-supply")
    .map((i) => i.findingId);
  return blockingFindings(s.scenario.findings, resolved);
}

function reducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "hydrate": {
      const p = action.payload;
      return {
        ...state,
        hydrated: true,
        today: action.today,
        stock: p.stock && p.stock.length ? p.stock : buildInventory(currentMonth(action.today)),
        results: p.results || [],
        savedRecords: p.records || [],
        nextCaseNumber: p.nextCaseNumber || 1,
        savedSession: action.session && action.session.scenario ? action.session : null,
      };
    }

    case "resume": {
      const session = state.savedSession;
      if (!session || !session.scenario) return state;
      // The saved case comes back as it was, but the shelf and the results
      // history stay whatever they are now — those are the pharmacy's, not
      // the interrupted encounter's.
      return {
        ...session,
        hydrated: true,
        today: state.today,
        stock: state.stock,
        results: state.results,
        savedRecords: state.savedRecords,
        nextCaseNumber: state.nextCaseNumber,
        savedSession: null,
        review: null,
        toast: null,
      };
    }

    case "discard-session":
      return { ...state, savedSession: null };

    case "start-case": {
      const template = scenarioTemplate(action.templateId);
      if (!template) return state;
      const caseNumber = state.nextCaseNumber;
      const scenario = buildScenario(template, seedFor(template.id, caseNumber), caseNumber, state.today);
      const fresh = initialState(state.today);
      return {
        ...fresh,
        hydrated: true,
        stock: state.stock,
        results: state.results,
        savedRecords: state.savedRecords,
        nextCaseNumber: state.nextCaseNumber,
        screen: "counter",
        scenario,
        stage: "arrival",
        seen: [],
        transcription: (template.prescription ? template.prescription.items : []).map((i) => ({
          itemId: i.id,
          drug: "",
          strength: "",
          frequencyCode: "",
          doseUnits: "",
          quantity: "",
        })),
        // The clock starts when the patient arrives, and is only ever reported
        // as elapsed time — this simulation has no countdown. Rushing a safety
        // check is the opposite of what it should teach.
        startedAt: Date.now(),
      };
    }

    case "drill": {
      // A drill drops the student straight into one stage with the earlier
      // steps already correct, so they can rehearse dispensing or counselling
      // without walking the whole encounter first. The debrief for a drill
      // reports only the competencies that stage exercises — see `Debrief`.
      const started = reducer(state, { type: "start-case", templateId: action.templateId });
      const sc = started.scenario;
      if (!sc || !sc.prescription) return started;

      const records: CheckRecord[] = CHECK_SPECS.map((spec) => {
        const real = sc.findings.filter((f) => f.checkId === spec.id);
        if (real.length === 0) return { checkId: spec.id, verdict: "ok" as const };
        return { checkId: spec.id, verdict: "concern" as const, concernId: real[0].concernId, itemId: real[0].itemId };
      });

      const transcription = sc.prescription.items.map((i) => {
        const m = medicine(i.medicineId);
        return {
          itemId: i.id,
          drug: m ? m.generic : "",
          strength: m ? m.strength : "",
          frequencyCode: i.frequencyCode,
          doseUnits: String(i.doseUnits),
          quantity: String(i.quantityWritten),
        };
      });

      const interventions: InterventionRecord[] = sc.findings.map((f) => ({
        findingId: f.id,
        action: f.blocksDispensing ? ("contact-prescriber" as const) : ("counsel-and-dispense" as const),
        note: "Pre-filled for this drill.",
      }));

      let next: CounterState = {
        ...started,
        drill: action.stage,
        stage: action.stage,
        seen: ["arrival", "receive", "patient-assessment"],
        records,
        revealed: sc.findings.map((f) => f.id),
        transcription,
        transcriptionDone: true,
        interventions,
        interventionsDone: true,
        panel: null,
      };

      // A counselling drill also needs the product picked, counted and labelled.
      if (action.stage === "counselling") {
        sc.prescription.items.forEach((item) => {
          const m = medicine(item.medicineId);
          const line = next.stock.find((l) => l.medicineId === item.medicineId);
          const batch = line ? line.batches.slice().sort((a, b) => b.expiry.localeCompare(a.expiry))[0] : undefined;
          const units = requiredQuantity(item) || item.quantityWritten;
          if (!m || !batch) return;
          next = {
            ...next,
            selectedMedicineId: { ...next.selectedMedicineId, [item.id]: m.id },
            selectedBatchId: { ...next.selectedBatchId, [item.id]: batch.id },
            quantityConfirmed: { ...next.quantityConfirmed, [item.id]: true },
            tray: next.tray.concat([
              { id: `${item.id}-tray`, itemId: item.id, medicineId: m.id, batchId: batch.id, packs: packsNeeded(units, m.packSize), units },
            ]),
            labels: { ...next.labels, [item.id]: { ...draftLabel(item, sc.patient, m, units) } },
            labelsWritten: { ...next.labelsWritten, [item.id]: true },
            ticked: VERIFICATION_SPECS.map((v) => v.id),
          };
        });
      }

      return next;
    }

    case "exit-case":
      return { ...state, screen: "home", scenario: null, panel: null, review: null, savedSession: null };

    case "open-panel":
      return { ...state, panel: action.panel };

    case "see":
      return state.seen.indexOf(state.stage) === -1 ? { ...state, seen: state.seen.concat(state.stage) } : state;

    case "go-stage": {
      if (!stageUnlocked(action.stage, flowState(state))) {
        const copy = STAGE_COPY[action.stage];
        return {
          ...state,
          review: {
            title: "Not yet",
            body: `"${copy ? copy.title : action.stage}" needs the earlier steps finished first.`,
            items: ["Complete the current step, then move on."],
            tone: "review",
          },
        };
      }
      // Deliberately does NOT open that stage's drawer. The drawers are
      // modal, and popping one on every stage change buried the workstation
      // behind a dialog the student had to dismiss each step.
      return {
        ...state,
        stage: action.stage,
        seen: state.seen.indexOf(action.stage) === -1 ? state.seen.concat(action.stage) : state.seen,
      };
    }

    case "advance": {
      const fs = flowState(state);
      if (!stageComplete(state.stage, fs)) {
        return { ...state, review: outstandingReview(state) };
      }
      // Dispensing is where a blocking finding actually bites.
      if (state.stage === "intervention" || state.stage === "selection") {
        const blockers = unresolvedBlockers(state);
        if (blockers.length > 0 && state.stage === "selection") {
          return {
            ...state,
            review: {
              title: "Supply cannot proceed",
              body: "A problem on this prescription must be resolved with the prescriber before anything is dispensed.",
              items: blockers.map((b) => `${b.title} — ${b.action}`),
              tone: "critical",
            },
          };
        }
      }
      const next = nextStage(fs);
      if (!next) return state;
      // Reaching "complete" is what ends the encounter: the report is built
      // here rather than by a separate button, so a student cannot arrive at
      // the debrief without the case actually being finished.
      if (next === "complete") return reducer(state, { type: "finish-case" });
      return {
        ...state,
        stage: next,
        seen: state.seen.indexOf(next) === -1 ? state.seen.concat(next) : state.seen,
        review: null,
      };
    }

    case "set-transcription": {
      return {
        ...state,
        transcription: state.transcription.map((t) => (t.itemId === action.itemId ? { ...t, ...action.patch } : t)),
      };
    }

    case "submit-transcription":
      return { ...state, transcriptionDone: true };

    case "record-check": {
      // One "no concern" replaces everything for that check; a concern is added
      // to any already recorded, because one check can raise several.
      const others = state.records.filter((r) => r.checkId !== action.checkId);
      const mine = state.records.filter((r) => r.checkId === action.checkId);
      let updated: CheckRecord[];
      if (action.verdict === "ok") {
        updated = others.concat([{ checkId: action.checkId, verdict: "ok" }]);
      } else {
        const entry: CheckRecord = {
          checkId: action.checkId,
          verdict: "concern",
          concernId: action.concernId,
          itemId: action.itemId,
        };
        const already = mine.some((r) => r.verdict === "concern" && r.concernId === entry.concernId && r.itemId === entry.itemId);
        const kept = mine.filter((r) => r.verdict === "concern");
        updated = others.concat(already ? kept : kept.concat([entry]));
      }
      // Findings for this check become readable once a verdict is on record —
      // never before. This is the one place the answer key is unlocked.
      const revealed = state.scenario
        ? state.revealed.concat(
            state.scenario.findings.filter((f) => f.checkId === action.checkId && state.revealed.indexOf(f.id) === -1).map((f) => f.id),
          )
        : state.revealed;
      return { ...state, records: updated, revealed };
    }

    case "clear-check":
      return { ...state, records: state.records.filter((r) => r.checkId !== action.checkId) };

    case "record-intervention": {
      const rest = state.interventions.filter((i) => i.findingId !== action.findingId);
      return {
        ...state,
        interventions: rest.concat([{ findingId: action.findingId, action: action.action, note: action.note }]),
      };
    }

    case "finish-interventions":
      return { ...state, interventionsDone: true };

    case "select-medicine": {
      const m = medicine(action.medicineId);
      return {
        ...state,
        selectedMedicineId: { ...state.selectedMedicineId, [action.itemId]: action.medicineId },
        // Changing the product invalidates the batch chosen for the old one.
        selectedBatchId: { ...state.selectedBatchId, [action.itemId]: "" },
        toast: m ? { message: `${m.brand} ${m.strength} taken from the shelf`, tone: "ok" } : null,
      };
    }

    case "select-batch":
      // Only the id is stored. The expiry is read back out of `stock` by
      // `batchExpiryFor`, so there is one copy of it and it cannot go stale
      // when a batch is discarded or restocked.
      return { ...state, selectedBatchId: { ...state.selectedBatchId, [action.itemId]: action.batchId } };

    case "confirm-quantity":
      return { ...state, quantityConfirmed: { ...state.quantityConfirmed, [action.itemId]: true } };

    case "fill-tray": {
      if (!state.scenario || !state.scenario.prescription) return state;
      const blockers = unresolvedBlockers(state);
      if (blockers.length > 0) {
        return {
          ...state,
          review: {
            title: "Supply cannot proceed",
            body: "This prescription carries a problem that must be resolved with the prescriber before dispensing.",
            items: blockers.map((b) => `${b.title} — ${b.action}`),
            tone: "critical",
          },
        };
      }
      const item = state.scenario.prescription.items.find((i) => i.id === action.itemId);
      const medicineId = state.selectedMedicineId[action.itemId];
      const batchId = state.selectedBatchId[action.itemId];
      const m = medicine(medicineId);
      if (!item || !m || !batchId) return state;

      const packs = packsNeeded(action.units, m.packSize);
      const entry: TrayItem = { id: `${action.itemId}-tray`, itemId: action.itemId, medicineId, batchId, packs, units: action.units };
      const tray = state.tray.filter((t) => t.itemId !== action.itemId).concat([entry]);

      // Dispensing depletes the shelf. Inventory is shared state across cases,
      // so this is the moment the stock figure actually moves.
      const stock = dispensePacks(state.stock, medicineId, batchId, packs);

      const label = state.labels[action.itemId] || draftLabel(item, state.scenario.patient, m, action.units);
      return {
        ...state,
        tray,
        stock,
        labels: { ...state.labels, [action.itemId]: { ...label, quantity: String(action.units) } },
        toast: { message: `${action.units} ${m.packUnit} into the tray (${packs} pack${packs === 1 ? "" : "s"})`, tone: "ok" },
      };
    }

    case "empty-tray": {
      const entry = state.tray.find((t) => t.itemId === action.itemId);
      if (!entry) return state;
      // Putting it back restores the stock it came from.
      const stock = receivePacks(state.stock, entry.medicineId, entry.batchId, entry.packs);
      return { ...state, tray: state.tray.filter((t) => t.itemId !== action.itemId), stock };
    }

    case "set-label": {
      const existing = state.labels[action.itemId];
      if (!existing) return state;
      return { ...state, labels: { ...state.labels, [action.itemId]: { ...existing, ...action.patch } } };
    }

    case "toggle-aux": {
      const existing = state.labels[action.itemId];
      if (!existing) return state;
      const has = existing.specialInstructions.indexOf(action.label) !== -1;
      const specialInstructions = has
        ? existing.specialInstructions.filter((l) => l !== action.label)
        : existing.specialInstructions.concat([action.label]);
      return { ...state, labels: { ...state.labels, [action.itemId]: { ...existing, specialInstructions } } };
    }

    case "confirm-label":
      return { ...state, labelsWritten: { ...state.labelsWritten, [action.itemId]: true } };

    case "toggle-tick": {
      if (state.ticked.indexOf(action.id) !== -1) {
        return { ...state, ticked: state.ticked.filter((t) => t !== action.id) };
      }
      const truth = currentTruths(state).find((t) => t.id === action.id);
      if (truth && !truth.truth) {
        const spec = VERIFICATION_SPECS.find((v) => v.id === action.id);
        return {
          ...state,
          reviewsRaised: state.reviewsRaised.indexOf(action.id) === -1 ? state.reviewsRaised.concat(action.id) : state.reviewsRaised,
          review: {
            title: "Review required",
            body: `This line cannot be confirmed yet: ${spec ? spec.detail.toLowerCase() : ""}`,
            items: [truth.problem || "Re-check this before confirming."],
            tone: "caution",
          },
        };
      }
      return { ...state, ticked: state.ticked.concat(action.id) };
    }

    case "set-counselling": {
      const rest = state.counselling.filter((c) => c.topic !== action.topic);
      return { ...state, counselling: rest.concat([{ topic: action.topic, chosen: action.chosen }]) };
    }

    case "confirm-counselling":
      return {
        ...state,
        counsellingDone: state.counsellingDone.indexOf(action.topic) === -1 ? state.counsellingDone.concat(action.topic) : state.counsellingDone,
      };

    case "answer-dialogue": {
      if (state.dialogue.some((d) => d.turnId === action.turnId)) return state;
      return { ...state, dialogue: state.dialogue.concat([{ turnId: action.turnId, optionId: action.optionId }]) };
    }

    case "answer-wwham": {
      const rest = state.wwham.filter((w) => w.field !== action.field);
      return { ...state, wwham: rest.concat([{ field: action.field, optionId: action.optionId }]) };
    }

    case "toggle-red-flag": {
      const has = state.redFlags.indexOf(action.id) !== -1;
      return { ...state, redFlags: has ? state.redFlags.filter((f) => f !== action.id) : state.redFlags.concat(action.id) };
    }

    case "confirm-red-flags":
      return { ...state, redFlagsRecorded: true };

    case "decide-otc":
      return { ...state, otcDecision: { outcome: action.outcome, medicineId: null } };

    case "choose-otc-product": {
      if (!state.otcDecision) return state;
      const m = action.medicineId ? medicine(action.medicineId) : null;
      let tray = state.tray;
      let stock = state.stock;
      if (m) {
        const batch = state.stock.find((l) => l.medicineId === m.id)?.batches.find((b) => b.packs > 0);
        if (batch) {
          tray = [{ id: `${m.id}-tray`, itemId: "otc", medicineId: m.id, batchId: batch.id, packs: 1, units: m.packSize }];
          stock = dispensePacks(state.stock, m.id, batch.id, 1);
        }
      } else {
        tray = [];
      }
      return { ...state, otcDecision: { ...state.otcDecision, medicineId: action.medicineId }, tray, stock };
    }

    case "set-doc":
      return { ...state, documentation: { ...state.documentation, [action.field]: action.value } };

    case "confirm-doc":
      return { ...state, documentationDone: true };

    case "set-payment":
      return { ...state, payment: action.method };

    case "set-discount":
      return { ...state, discountPkr: Math.max(0, action.amount) };

    case "take-payment":
      return state.payment ? { ...state, paid: true } : state;

    case "finish-case": {
      if (!state.scenario) return state;
      const minutes = state.startedAt ? Math.max(1, Math.round((Date.now() - state.startedAt) / 60000)) : 0;
      const report = buildReport(buildSubmission(state, minutes));
      const result: CaseResult = {
        templateId: state.scenario.templateId,
        caseNumber: state.scenario.caseNumber,
        scenarioTitle: state.scenario.title,
        tier: state.scenario.tier,
        overallPercent: report.overallPercent,
        criticalMissed: report.criticalMissed,
        completedAt: state.today,
        minutesTaken: minutes,
        competencies: report.competencies.map((c) => ({ id: c.id, percent: c.percent })),
      };
      return {
        ...state,
        screen: "debrief",
        report,
        stage: "complete",
        results: state.results.concat(result),
        nextCaseNumber: state.nextCaseNumber + 1,
        savedRecords: state.savedRecords.concat([
          {
            id: `rec-${state.scenario.caseNumber}`,
            caseNumber: state.scenario.caseNumber,
            patientName: state.scenario.patient.name,
            createdAt: state.today,
            body: state.documentation.assessment || state.documentation.complaint || "Record filed.",
          },
        ]),
      };
    }

    case "discard-batch":
      return { ...state, stock: removeBatch(state.stock, action.medicineId, action.batchId), toast: { message: "Expired batch removed from the shelf", tone: "ok" } };

    case "receive-stock":
      return { ...state, stock: receivePacks(state.stock, action.medicineId, action.batchId, action.packs) };

    case "dismiss-review":
      return { ...state, review: null };

    case "dismiss-toast":
      return { ...state, toast: null };

    case "reset-progress":
      return { ...initialState(state.today), hydrated: true };

    default:
      return state;
  }
}

/** The verification truths for the item currently being worked on. */
function currentTruths(state: CounterState) {
  if (!state.scenario || !state.scenario.prescription) return [];
  const item = state.scenario.prescription.items[0];
  return verificationTruths({
    item,
    tray: state.tray.find((t) => t.itemId === item.id),
    patient: state.scenario.patient,
    label: state.labels[item.id],
    records: state.records,
    batchExpiry: batchExpiryFor(state, item.id),
    today: state.today,
  });
}

/** Expiry of the batch selected for an item, read back out of the stock list. */
export function batchExpiryFor(state: CounterState, itemId: string): string | undefined {
  const batchId = state.selectedBatchId[itemId];
  const medicineId = state.selectedMedicineId[itemId];
  if (!batchId || !medicineId) return undefined;
  const line = state.stock.find((l) => l.medicineId === medicineId);
  const batch = line ? line.batches.find((b) => b.id === batchId) : undefined;
  return batch ? batch.expiry : undefined;
}

export function buildSubmission(state: CounterState, minutes: number): CaseSubmission {
  const batchExpiry: Record<string, string> = {};
  if (state.scenario && state.scenario.prescription) {
    state.scenario.prescription.items.forEach((i) => {
      const e = batchExpiryFor(state, i.id);
      if (e) batchExpiry[i.id] = e;
    });
  }
  return {
    scenario: state.scenario as Scenario,
    records: state.records,
    interventions: state.interventions,
    transcription: state.transcription,
    tray: state.tray,
    batchExpiry,
    labels: state.labels,
    ticked: state.ticked,
    counselling: state.counselling,
    dialogue: state.dialogue,
    documentation: state.documentation,
    wwham: state.wwham,
    redFlags: state.redFlags,
    otcDecision: state.otcDecision,
    minutesTaken: minutes,
  };
}

/** What is still outstanding in the current stage, phrased as a next step. */
function outstandingReview(state: CounterState): ReviewNotice {
  const copy = STAGE_COPY[state.stage];
  const items: string[] = [];
  const fs = flowState(state);
  const sc = state.scenario;

  if (state.stage === "safety-checks" && sc) {
    const run = state.records.map((r) => r.checkId).filter((id, i, all) => all.indexOf(id) === i).length;
    items.push(`${10 - run} of the ten checks have no verdict recorded yet.`);
    if (run === 0) items.push("Open a check, read the evidence, and record whether you have a concern.");
  } else if (state.stage === "final-verification") {
    VERIFICATION_SPECS.filter((v) => fs.ticked.indexOf(v.id) === -1).forEach((v) => items.push(`${v.label} — ${v.detail}`));
  } else if (state.stage === "counselling" && sc) {
    if (state.counsellingDone.length < 8) items.push(`${8 - state.counsellingDone.length} counselling checkpoints still to cover.`);
    if (state.dialogue.length < sc.dialogue.length) items.push("The patient still has a question for you.");
  } else if (copy) {
    items.push(copy.hint);
  }

  return {
    title: "Still to do",
    body: copy ? `Before moving on from "${copy.title}":` : "This step is not finished yet.",
    items: items.length ? items : ["Finish this step before moving on."],
    tone: "review",
  };
}

// ─── The hook ────────────────────────────────────────────────────────────────

export function useCounterMachine(today: string) {
  const [state, dispatch] = useReducer(reducer, today, initialState);

  const fs = useMemo(() => flowState(state), [state]);
  const flow = useMemo(() => stageFlow(state.scenario), [state.scenario]);
  const progress = useMemo(() => progressPercent(fs), [fs]);
  const canAdvance = useMemo(() => stageComplete(state.stage, fs), [state.stage, fs]);
  const blockers = useMemo(() => unresolvedBlockers(state), [state]);

  const visibleFindings = useMemo(() => {
    if (!state.scenario) return [] as Finding[];
    return state.scenario.findings.filter((f) => state.revealed.indexOf(f.id) !== -1);
  }, [state.scenario, state.revealed]);

  const requiredUnits = useCallback(
    (itemId: string): number | null => {
      if (!state.scenario || !state.scenario.prescription) return null;
      const item = state.scenario.prescription.items.find((i) => i.id === itemId);
      return item ? requiredQuantity(item) : null;
    },
    [state.scenario],
  );

  const stageIsSkipped = useCallback((stage: Stage) => stageSkipped(stage, fs), [fs]);
  const stageIsUnlocked = useCallback((stage: Stage) => stageUnlocked(stage, fs), [fs]);
  const stageIsComplete = useCallback((stage: Stage) => stageComplete(stage, fs), [fs]);

  return {
    state,
    dispatch,
    flow,
    progress,
    canAdvance,
    blockers,
    visibleFindings,
    requiredUnits,
    stageIsSkipped,
    stageIsUnlocked,
    stageIsComplete,
    scenarios: SCENARIOS,
  };
}
