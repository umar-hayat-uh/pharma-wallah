// ============================================================
// PharmaWallah — Community Pharmacy Simulation Lab: shared types
// ============================================================
//
// Route: /pharmacy-counter
//
// The lab is split the same way the Disk Diffusion lab is: this file, `data/`
// and `engine/` hold the model and are pure (no React, no DOM), so what the
// simulation *decides* can be reasoned about — and tested — without rendering
// anything. `scripts/pharmacy-counter.test.mts` runs against these modules.
//
// The domain vocabulary is deliberately the one a pharmacist uses: a
// prescription has items, an item is checked, a medicine is picked from a
// shelf bay, a batch has an expiry, a label carries directions. Keeping the
// names honest is half of what makes the simulation teach the workflow rather
// than a click sequence.

// ─── Risk ────────────────────────────────────────────────────────────────────

/**
 * The four bands the whole simulation speaks in (§ red flag system).
 *
 * Every place a band is shown must also carry its word — "Critical", not just
 * a red dot. Colour alone fails a colour-blind student and fails WCAG 1.4.1.
 */
export type RiskLevel = "critical" | "caution" | "review" | "ok";

export interface RiskBand {
  level: RiskLevel;
  /** The word shown beside the marker. Never rely on the colour alone. */
  label: string;
  /** Hex for the marker. Paired with a text label everywhere it is used. */
  color: string;
  /** Tailwind-safe surface classes for chips and banners. */
  surface: string;
}

// ─── Medicines ───────────────────────────────────────────────────────────────

export type DosageForm =
  | "Tablet"
  | "Capsule"
  | "Suspension"
  | "Syrup"
  | "Injection"
  | "Cream"
  | "Ointment"
  | "Drops"
  | "Inhaler"
  | "Sachet"
  | "Suppository";

/** The bays on the shelf wall behind the counter. */
export type ShelfCategory =
  | "analgesics"
  | "antibiotics"
  | "antihistamines"
  | "antacids"
  | "antihypertensives"
  | "antidiabetics"
  | "respiratory"
  | "dermatology"
  | "vitamins"
  | "otc";

/** The eight counselling checkpoints, in the order the module asks them. */
export type CounsellingTopic =
  | "purpose"
  | "administration"
  | "timing"
  | "duration"
  | "side-effects"
  | "precautions"
  | "storage"
  | "missed-dose";

/**
 * What a pharmacist should be able to say about a medicine, per checkpoint.
 *
 * `points` are the statements that belong in the counselling; `distractors`
 * are plausible-but-wrong statements the module mixes in, so choosing well is
 * a judgement rather than picking the only sentence on screen.
 */
export interface CounsellingContent {
  points: string[];
  distractors: string[];
}

export interface Medicine {
  id: string;
  generic: string;
  brand: string;
  /** Display strength, e.g. "500 mg" or "125 mg/5 mL". */
  strength: string;
  /** Numeric strength in `strengthUnit`, for the dose arithmetic. */
  strengthValue: number;
  strengthUnit: string;
  form: DosageForm;
  /** Units in one pack — capsules, tablets, mL. */
  packSize: number;
  packUnit: string;
  manufacturer: string;
  category: ShelfCategory;
  storage: string;
  /** Retail price of one pack, in PKR. */
  pricePkr: number;
  /** True when it may be supplied without a prescription. */
  otc: boolean;
  /**
   * Allergy classes this product belongs to. Matched against a patient's
   * recorded allergy classes — this is what makes the allergy check real
   * rather than a string compare on the drug name.
   */
  allergyClasses: string[];
  /** Therapeutic classes, used to detect duplicate therapy. */
  therapeuticClasses: string[];
  /** Tags other medicines' interaction rules match on. */
  interactionTags: string[];
  /** Recommended auxiliary labels for this product. */
  auxLabels: string[];
  /** Maximum ordinary adult daily dose, for the max-dose check. */
  maxDailyDose?: { value: number; unit: string; note?: string };
  /** Usual dose range per administration, for the dose check. */
  usualAdultDose?: { min: number; max: number; unit: string };
  /** Weight-based dose, where the product is normally dosed that way. */
  paediatricDose?: { minPerKg: number; maxPerKg: number; unit: string; note: string };
  counselling: Record<CounsellingTopic, CounsellingContent>;
  /** One-paragraph monograph for the Reference Desk. */
  reference: {
    summary: string;
    indications: string[];
    contraindications: string[];
    adverseEffects: string[];
    pregnancy: string;
  };
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface Batch {
  id: string;
  batchNo: string;
  /** ISO "YYYY-MM". Compared against the scenario's clock, never `Date.now()`. */
  expiry: string;
  /** Packs held in this batch. */
  packs: number;
}

export interface StockLine {
  medicineId: string;
  /** Sum of the batches' packs. Kept derived — never edited directly. */
  packs: number;
  reorderLevel: number;
  batches: Batch[];
}

export type StockStatus = "in-stock" | "low" | "out";

export type ExpiryStatus = "expired" | "expiring-soon" | "normal";

// ─── Patients ────────────────────────────────────────────────────────────────

export interface Allergy {
  /** What the patient reports, e.g. "Penicillin". */
  label: string;
  /** Classes it covers — matched against `Medicine.allergyClasses`. */
  classes: string[];
  reaction: string;
  severity: "mild" | "moderate" | "severe";
}

export interface CurrentMedicine {
  label: string;
  /** Therapeutic classes, for duplicate-therapy detection. */
  therapeuticClasses: string[];
  /** Tags that another product's interaction rules match on. */
  interactionTags: string[];
}

export type PregnancyStatus = "not-applicable" | "none" | "pregnant" | "breastfeeding" | "unknown";

export interface Patient {
  id: string;
  name: string;
  /** Age in years. Infants are expressed in fractions, with `ageLabel` shown. */
  ageYears: number;
  ageLabel: string;
  sex: "male" | "female";
  weightKg?: number;
  heightCm?: number;
  serumCreatinine?: number;
  pregnancy: PregnancyStatus;
  allergies: Allergy[];
  conditions: string[];
  currentMedicines: CurrentMedicine[];
  /** Short lines shown under "previous pharmacy records". */
  history: string[];
  chiefComplaint: string;
  /** Flat colours for the drawn figure — no photographs of real people. */
  avatar: { skin: string; hair: string; shirt: string };
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export interface Prescriber {
  name: string;
  qualification: string;
  registration: string;
  clinic: string;
}

/** Frequency codes the transcription select offers. */
export interface FrequencyOption {
  code: string;
  label: string;
  /** Administrations per day. 0 means "as needed" — days' supply is undefined. */
  perDay: number;
  timing: string;
}

export interface RxItem {
  id: string;
  /** Exactly as written on the prescription, abbreviations and all. */
  written: string;
  /** The product the prescriber intended. */
  medicineId: string;
  /** Units per administration, e.g. 1 capsule or 5 mL. */
  doseUnits: number;
  frequencyCode: string;
  route: string;
  durationDays: number;
  /** The quantity written on the prescription — which may itself be wrong. */
  quantityWritten: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriber: Prescriber;
  /** Display date. The simulation's clock, not the wall clock. */
  date: string;
  items: RxItem[];
  /** The handwritten lines, as the scanned image would show them. */
  handwritten: string[];
  legibility: "clear" | "rushed" | "poor";
}

// ─── Clinical checks ─────────────────────────────────────────────────────────

export type CheckId =
  | "allergy"
  | "interaction"
  | "duplicate"
  | "dose"
  | "max-dose"
  | "frequency"
  | "duration"
  | "age"
  | "weight"
  | "contraindication";

export interface CheckSpec {
  id: CheckId;
  label: string;
  /** The question the student is answering when they run this check. */
  question: string;
  /** What to look at — shown beside the evidence, so the check teaches. */
  howTo: string;
  /** The concerns a student may record for this check. */
  concerns: { id: string; label: string }[];
}

export type CheckVerdict = "ok" | "concern";

/** What the student recorded for one check. */
export interface CheckRecord {
  checkId: CheckId;
  verdict: CheckVerdict;
  /** Set when `verdict === "concern"`. */
  concernId?: string;
  /** The prescription item the concern was recorded against. */
  itemId?: string;
}

/**
 * A real clinical problem in a scenario.
 *
 * The student never sees these until they have recorded their own verdict —
 * that is the whole point of the check console (§ "do not give the answer").
 */
export interface Finding {
  id: string;
  checkId: CheckId;
  /** Must match one of the check's `concerns` ids. */
  concernId: string;
  itemId?: string;
  severity: RiskLevel;
  title: string;
  detail: string;
  /** What a pharmacist should do about it. */
  action: string;
  /** Shown in the debrief whether or not the student found it. */
  learningPoint: string;
  /**
   * True when dispensing must not proceed until the prescriber is contacted.
   * A critical allergy or a contraindicated combination is not overridable.
   */
  blocksDispensing: boolean;
}

/** How the student resolved a finding they identified. */
export type InterventionAction = "contact-prescriber" | "counsel-and-dispense" | "refuse-supply" | "dispense-as-written";

export interface InterventionRecord {
  findingId: string;
  action: InterventionAction;
  note?: string;
}

// ─── Dispensing ──────────────────────────────────────────────────────────────

export interface TrayItem {
  id: string;
  /** The prescription item this was picked for. */
  itemId: string;
  /** The product the student actually took off the shelf. */
  medicineId: string;
  batchId: string;
  /** Packs moved to the tray. */
  packs: number;
  /** Dispensed units (capsules/tablets/mL) — what the label will state. */
  units: number;
}

/** The nine attestations of the pre-dispensing verification. */
export type VerificationId =
  | "right-patient"
  | "right-medicine"
  | "right-strength"
  | "right-form"
  | "right-quantity"
  | "right-directions"
  | "expiry-checked"
  | "allergies-checked"
  | "interactions-checked";

export interface VerificationSpec {
  id: VerificationId;
  label: string;
  /** What the student should compare to satisfy this line. */
  detail: string;
}

/**
 * The result of testing one attestation against the tray and the checks.
 *
 * `truth` is what the state actually supports. A student who ticks a line that
 * is not true gets an intervention, not a "wrong" — see the error-handling
 * rule in the spec.
 */
export interface VerificationTruth {
  id: VerificationId;
  truth: boolean;
  /** Why it is false, phrased as something to re-check. */
  problem?: string;
}

// ─── Label ───────────────────────────────────────────────────────────────────

export interface LabelDraft {
  itemId: string;
  patientName: string;
  medicineLine: string;
  doseUnits: string;
  route: string;
  frequencyCode: string;
  durationDays: string;
  quantity: string;
  specialInstructions: string[];
  storage: string;
}

export interface LabelIssue {
  field: keyof LabelDraft | "auxiliary";
  message: string;
  severity: RiskLevel;
}

// ─── Counselling ─────────────────────────────────────────────────────────────

export interface CounsellingSelection {
  topic: CounsellingTopic;
  /** The statements the student chose to say. */
  chosen: string[];
}

/** One thing the patient says at the consultation window. */
export interface DialogueTurn {
  id: string;
  /** The patient's own words. */
  question: string;
  options: DialogueOption[];
}

export interface DialogueOption {
  id: string;
  text: string;
  /**
   * Each response is judged on the five dimensions the spec names, 0–2 each.
   * A response can be accurate but unprofessional, or kind but unsafe — which
   * is exactly the distinction students need to feel.
   */
  scores: { accuracy: number; safety: number; communication: number; professionalism: number; completeness: number };
  /** Why this answer is good, adequate or harmful. */
  feedback: string;
}

// ─── OTC / minor ailment ─────────────────────────────────────────────────────

export type WwhamField = "who" | "what" | "howLong" | "action" | "medication";

export interface WwhamQuestion {
  field: WwhamField;
  prompt: string;
  /** The answers this patient gives, one of which the student elicits. */
  options: { id: string; text: string; correct: boolean }[];
}

export type OtcOutcome = "self-care" | "refer";

export interface OtcCase {
  complaint: string;
  wwham: WwhamQuestion[];
  /** Red flags actually present. The student selects from a shared list. */
  redFlagIds: string[];
  correctOutcome: OtcOutcome;
  /** When self-care is right, the products that are appropriate. */
  appropriateMedicineIds: string[];
  /** Why — shown in the debrief either way. */
  rationale: string;
  referralReason?: string;
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

export type ScenarioTier =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "clinical-challenge"
  | "otc-challenge"
  | "emergency-referral";

export type ScenarioKind = "rx" | "otc";

export interface ScenarioTemplate {
  id: string;
  kind: ScenarioKind;
  tier: ScenarioTier;
  title: string;
  /** One line shown on the case card, with no spoilers in it. */
  brief: string;
  patientId: string;
  /** Rx scenarios only. */
  prescription?: Omit<Prescription, "id" | "date">;
  findings: Finding[];
  /** Extra decoy products to put on the shelf for this case. */
  decoyMedicineIds: string[];
  dialogue: DialogueTurn[];
  otc?: OtcCase;
  /** Minutes the case is expected to take. Never a countdown — see below. */
  expectedMinutes: number;
}

/** A template plus the per-run variation the generator applied. */
export interface Scenario {
  templateId: string;
  /** Deterministic: the same seed reproduces the same case exactly. */
  seed: number;
  caseNumber: number;
  kind: ScenarioKind;
  tier: ScenarioTier;
  title: string;
  brief: string;
  patient: Patient;
  prescription?: Prescription;
  findings: Finding[];
  /** Medicine ids on the shelf for this case, decoys included and shuffled. */
  shelfMedicineIds: string[];
  dialogue: DialogueTurn[];
  otc?: OtcCase;
  expectedMinutes: number;
  /** The simulated date this case happens on — drives every expiry decision. */
  today: string;
}

// ─── Workflow ────────────────────────────────────────────────────────────────

/**
 * The stages of the counter workflow, in order.
 *
 * The machine always exposes exactly one primary action (§ "what should I do
 * next as a pharmacist?"), derived from the stage plus what is outstanding.
 */
export type RxStage =
  | "arrival"
  | "receive"
  | "patient-assessment"
  | "interpretation"
  | "safety-checks"
  | "intervention"
  | "selection"
  | "stock-expiry"
  | "quantity"
  | "dispensing"
  | "labelling"
  | "final-verification"
  | "counselling"
  | "documentation"
  | "payment"
  | "complete";

export type OtcStage =
  | "arrival"
  | "complaint"
  | "wwham"
  | "assessment"
  | "decision"
  | "product"
  | "counselling"
  | "documentation"
  | "payment"
  | "complete";

export type Stage = RxStage | OtcStage;

/** The drawers of the control panel (§ control panel). */
export type PanelId =
  | "queue"
  | "prescription"
  | "dispensing"
  | "counselling"
  | "inventory"
  | "interactions"
  | "calculations"
  | "references"
  | "documentation"
  | "help";

// ─── Assessment ──────────────────────────────────────────────────────────────

export type CompetencyId =
  | "prescription-assessment"
  | "medicine-selection"
  | "dose-verification"
  | "counselling"
  | "communication"
  | "documentation";

export interface CompetencyScore {
  id: CompetencyId;
  label: string;
  /** 0–100, rounded. `max === 0` means the case did not exercise it. */
  percent: number;
  earned: number;
  max: number;
}

export interface ErrorEntry {
  id: string;
  title: string;
  /** What happened, in the student's own workflow terms. */
  detail: string;
  severity: RiskLevel;
  /** The teaching — never just "wrong". */
  learningPoint: string;
}

export interface PerformanceReport {
  caseNumber: number;
  scenarioTitle: string;
  competencies: CompetencyScore[];
  /** Mean of the competencies the case exercised. */
  overallPercent: number;
  errors: ErrorEntry[];
  /** Things done well, so a debrief is not only a list of faults. */
  strengths: string[];
  /** Minutes the student actually took. */
  minutesTaken: number;
  /** True when a critical finding was missed — the debrief leads with it. */
  criticalMissed: boolean;
}

// ─── Documentation ───────────────────────────────────────────────────────────

export interface DocumentationDraft {
  complaint: string;
  assessment: string;
  supplied: string;
  counselling: string;
  intervention: string;
  referral: string;
  followUp: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PaymentMethod = "cash" | "card" | "digital";

export interface PosLine {
  medicineId: string;
  description: string;
  packs: number;
  unitPricePkr: number;
  totalPkr: number;
}

export interface PosTotals {
  lines: PosLine[];
  subtotalPkr: number;
  discountPkr: number;
  totalPkr: number;
}

// ─── Persisted progress ──────────────────────────────────────────────────────

export interface CaseResult {
  templateId: string;
  caseNumber: number;
  scenarioTitle: string;
  tier: ScenarioTier;
  overallPercent: number;
  criticalMissed: boolean;
  completedAt: string;
  minutesTaken: number;
  competencies: { id: CompetencyId; percent: number }[];
}

export interface SavedProgress {
  version: 1;
  results: CaseResult[];
  /** Inventory carries across cases — dispensing depletes it (§ inventory). */
  stock: StockLine[];
  /** Intervention records the student has filed. */
  records: { id: string; caseNumber: number; patientName: string; createdAt: string; body: string }[];
  nextCaseNumber: number;
}

// ─── Transcription ───────────────────────────────────────────────────────────

/**
 * What the student read off the prescription.
 *
 * Kept separate from the `RxItem` it is checked against: transcribing is a
 * skill in its own right, and a mis-read strength here is the error that the
 * rest of the workflow is supposed to catch.
 */
export interface TranscriptionEntry {
  itemId: string;
  drug: string;
  strength: string;
  frequencyCode: string;
  doseUnits: string;
  quantity: string;
}
