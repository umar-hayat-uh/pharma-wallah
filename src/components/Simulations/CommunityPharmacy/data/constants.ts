// ============================================================
// Community Pharmacy Simulation — fixed vocabulary
// ============================================================
//
// Everything here is the language of the counter rather than the content of a
// case: the risk bands, the frequency codes, the ten clinical checks and the
// concerns a student may record against each, the nine verification lines, the
// counselling checkpoints and the referral red flags.
//
// Kept separate from `scenarios.ts` so a new case is written by describing a
// patient and a prescription, never by inventing new vocabulary.

import type {
  CheckSpec,
  CompetencyId,
  CounsellingTopic,
  FrequencyOption,
  PanelId,
  RiskBand,
  RiskLevel,
  ShelfCategory,
  VerificationSpec,
} from "../types";

// ─── Risk bands ──────────────────────────────────────────────────────────────

/**
 * Four bands, each with a word.
 *
 * The word is not decoration: a warning carried by colour alone is invisible
 * to a colour-blind student, so every marker in the UI prints `label` too.
 */
export const RISK_BANDS: Record<RiskLevel, RiskBand> = {
  critical: {
    level: "critical",
    label: "Critical",
    color: "#DC2626",
    surface: "bg-rose-50 text-rose-800 border-rose-200",
  },
  caution: {
    level: "caution",
    label: "Caution",
    color: "#EA580C",
    surface: "bg-orange-50 text-orange-800 border-orange-200",
  },
  review: {
    level: "review",
    label: "Review",
    color: "#CA8A04",
    surface: "bg-amber-50 text-amber-900 border-amber-200",
  },
  ok: {
    level: "ok",
    label: "Appropriate",
    color: "#21B67A",
    surface: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

/** Order used whenever findings are sorted worst-first. */
export const RISK_ORDER: RiskLevel[] = ["critical", "caution", "review", "ok"];

export function riskRank(level: RiskLevel): number {
  return RISK_ORDER.indexOf(level);
}

// ─── Frequencies and routes ──────────────────────────────────────────────────

/**
 * `perDay: 0` means "as needed" — days' supply cannot be computed from a PRN
 * order, and the quantity module says so rather than printing a wrong number.
 */
export const FREQUENCIES: FrequencyOption[] = [
  { code: "OD", label: "OD — once daily", perDay: 1, timing: "Same time each day" },
  { code: "BD", label: "BD — twice daily", perDay: 2, timing: "Morning and evening, about 12 hours apart" },
  { code: "TDS", label: "TDS — three times daily", perDay: 3, timing: "Morning, afternoon and evening, about 8 hours apart" },
  { code: "QDS", label: "QDS — four times daily", perDay: 4, timing: "About 6 hours apart" },
  { code: "QHS", label: "QHS — at night", perDay: 1, timing: "At bedtime" },
  { code: "Q12H", label: "Q12H — every 12 hours", perDay: 2, timing: "Every 12 hours" },
  { code: "Q8H", label: "Q8H — every 8 hours", perDay: 3, timing: "Every 8 hours" },
  { code: "Q6H", label: "Q6H — every 6 hours", perDay: 4, timing: "Every 6 hours" },
  { code: "PRN", label: "PRN — as needed", perDay: 0, timing: "Only when required, respecting the maximum" },
];

export function frequencyByCode(code: string): FrequencyOption | undefined {
  return FREQUENCIES.find((f) => f.code === code);
}

export const ROUTES = ["Oral", "Topical", "Inhaled", "Rectal", "Ophthalmic", "Otic", "Intramuscular", "Subcutaneous"];

// ─── The ten clinical checks ─────────────────────────────────────────────────

/**
 * The student opens a check, reads the evidence the console lays out, and
 * records their own verdict. The simulation never pre-announces a problem —
 * finding it is the exercise.
 *
 * `concerns` is a fixed list per check, identical for every scenario, so the
 * options themselves never hint at which case this is.
 */
export const CHECK_SPECS: CheckSpec[] = [
  {
    id: "allergy",
    label: "Drug–allergy check",
    question: "Does anything on this prescription conflict with the patient's recorded allergies?",
    howTo:
      "Compare each product's drug class against every recorded allergy — not just the brand name. Cross-reactivity within a class is the trap.",
    concerns: [
      { id: "documented-allergy", label: "Documented allergy to this drug or its class" },
      { id: "cross-reactivity", label: "Cross-reactivity risk with a related class" },
      { id: "allergy-undocumented", label: "Allergy status incomplete — must be confirmed first" },
    ],
  },
  {
    id: "interaction",
    label: "Drug–drug interaction check",
    question: "Does anything here interact with what the patient already takes?",
    howTo:
      "Work down the patient's current medicines one at a time against each new item. Note the mechanism, not just that an alert exists.",
    concerns: [
      { id: "major-ddi", label: "Major interaction with a current medicine" },
      { id: "moderate-ddi", label: "Moderate interaction — needs monitoring or spacing" },
      { id: "food-interaction", label: "Clinically important food or supplement interaction" },
    ],
  },
  {
    id: "duplicate",
    label: "Duplicate therapy check",
    question: "Is the patient already taking something that does the same job?",
    howTo:
      "Match therapeutic classes, not brand names. Two brands of the same class, or the same drug inside a combination product, both count.",
    concerns: [
      { id: "same-drug", label: "The same drug is already on the patient's list" },
      { id: "same-class", label: "Another drug of the same therapeutic class is already supplied" },
      { id: "additive-effect", label: "Additive pharmacological effect from two classes" },
    ],
  },
  {
    id: "dose",
    label: "Dose check",
    question: "Is the dose written appropriate for this patient?",
    howTo:
      "Compare the prescribed dose against the usual range, then against anything about this patient that shifts it — age, weight, renal function.",
    concerns: [
      { id: "dose-high", label: "Dose above the usual range for this patient" },
      { id: "dose-low", label: "Dose below the usual effective range" },
      { id: "not-weight-adjusted", label: "Dose not adjusted for body weight" },
      { id: "not-organ-adjusted", label: "Dose not adjusted for renal or hepatic function" },
    ],
  },
  {
    id: "max-dose",
    label: "Maximum dose check",
    question: "Does the total daily dose stay within the maximum?",
    howTo:
      "Multiply the dose by the frequency, then add anything else the patient takes that contains the same drug — combination products are where maximums are breached.",
    concerns: [
      { id: "exceeds-max-daily", label: "Total daily dose exceeds the stated maximum" },
      { id: "duplicate-source", label: "Maximum exceeded once other products containing the same drug are counted" },
    ],
  },
  {
    id: "frequency",
    label: "Frequency check",
    question: "Is the dosing interval right for this drug?",
    howTo: "Check the interval against the drug's usual regimen, and against what the directions actually tell the patient to do.",
    concerns: [
      { id: "too-frequent", label: "Interval shorter than the drug allows" },
      { id: "too-infrequent", label: "Interval too long to maintain effect" },
      { id: "timing-wrong", label: "Frequency written does not match the intended regimen" },
    ],
  },
  {
    id: "duration",
    label: "Duration check",
    question: "Is the length of the course appropriate, and does the quantity match it?",
    howTo:
      "Dose × frequency × days should equal the quantity. A mismatch is either a quantity error or a duration error — decide which.",
    concerns: [
      { id: "too-short", label: "Course too short for the indication" },
      { id: "too-long", label: "Course longer than recommended" },
      { id: "quantity-mismatch", label: "Quantity written does not match the stated duration" },
    ],
  },
  {
    id: "age",
    label: "Age-appropriateness check",
    question: "Is this suitable at this patient's age?",
    howTo: "Check both the drug and the formulation. A drug can be fine while the dosage form is not.",
    concerns: [
      { id: "contraindicated-age", label: "Contraindicated in this age group" },
      { id: "caution-age", label: "Needs caution or a dose change at this age" },
      { id: "formulation-unsuitable", label: "Formulation unsuitable for this age" },
    ],
  },
  {
    id: "weight",
    label: "Weight-based dose check",
    question: "For anything dosed by weight, does the dose match this patient's weight?",
    howTo: "Recalculate mg/kg/day yourself and compare. If no weight is recorded, that is itself the finding.",
    concerns: [
      { id: "weight-missing", label: "Weight is needed to verify this dose and is not recorded" },
      { id: "dose-mismatch-weight", label: "Dose does not match the patient's weight" },
    ],
  },
  {
    id: "contraindication",
    label: "Contraindication check",
    question: "Does any recorded condition or status make this unsafe?",
    howTo:
      "Read the condition list and the pregnancy status against each product's contraindications before you read anything else.",
    concerns: [
      { id: "condition-contraindicated", label: "Contraindicated by a recorded condition" },
      { id: "pregnancy-contraindicated", label: "Contraindicated or unsafe in pregnancy or breastfeeding" },
      { id: "caution-condition", label: "Caution needed with a recorded condition" },
    ],
  },
];

export function checkSpec(id: string): CheckSpec | undefined {
  return CHECK_SPECS.find((c) => c.id === id);
}

export function concernLabel(checkId: string, concernId: string): string {
  const spec = checkSpec(checkId);
  const found = spec?.concerns.find((c) => c.id === concernId);
  return found ? found.label : concernId;
}

// ─── The nine verification lines ─────────────────────────────────────────────

export const VERIFICATION_SPECS: VerificationSpec[] = [
  { id: "right-patient", label: "Right patient", detail: "The name on the label matches the patient in front of you." },
  { id: "right-medicine", label: "Right medicine", detail: "The product in the tray is the drug the prescriber wrote." },
  { id: "right-strength", label: "Right strength", detail: "The strength on the pack matches the strength prescribed." },
  { id: "right-form", label: "Right dosage form", detail: "Tablet, capsule, suspension — as written, and swallowable by this patient." },
  { id: "right-quantity", label: "Right quantity", detail: "The units dispensed cover the course without a surplus." },
  { id: "right-directions", label: "Right directions", detail: "The label's dose, frequency and duration match the prescription." },
  { id: "expiry-checked", label: "Expiry checked", detail: "The batch expires after the course finishes." },
  { id: "allergies-checked", label: "Allergies checked", detail: "The drug–allergy check has been performed for this patient." },
  { id: "interactions-checked", label: "Interactions checked", detail: "The interaction and duplicate-therapy checks have been performed." },
];

// ─── Counselling checkpoints ─────────────────────────────────────────────────

export const COUNSELLING_TOPICS: { id: CounsellingTopic; label: string; question: string }[] = [
  { id: "purpose", label: "Purpose", question: "What is this medicine for?" },
  { id: "administration", label: "Administration", question: "How should it be taken?" },
  { id: "timing", label: "Timing", question: "When should it be taken?" },
  { id: "duration", label: "Duration", question: "How long should it be continued?" },
  { id: "side-effects", label: "Side effects", question: "What common effects should be explained?" },
  { id: "precautions", label: "Precautions", question: "What should the patient avoid?" },
  { id: "storage", label: "Storage", question: "How should it be stored?" },
  { id: "missed-dose", label: "Missed dose", question: "What if a dose is missed?" },
];

// ─── Referral red flags ──────────────────────────────────────────────────────

/**
 * One shared list for every minor-ailment case. Because it never changes, a
 * student cannot infer the answer from which flags are offered — they have to
 * read the history.
 */
export const RED_FLAGS: { id: string; label: string }[] = [
  { id: "duration-prolonged", label: "Symptoms lasting longer than self-care allows" },
  { id: "severe-pain", label: "Severe or worsening pain" },
  { id: "blood-loss", label: "Blood in stool, vomit, urine or sputum" },
  { id: "weight-loss", label: "Unexplained weight loss" },
  { id: "high-fever", label: "High or persistent fever" },
  { id: "breathlessness", label: "Breathlessness or wheeze at rest" },
  { id: "chest-pain", label: "Chest pain or tightness" },
  { id: "persistent-vomiting", label: "Persistent vomiting or inability to keep fluids down" },
  { id: "dehydration", label: "Signs of dehydration" },
  { id: "sudden-headache", label: "Sudden, severe or unusual headache" },
  { id: "neck-stiffness", label: "Neck stiffness, rash or photophobia" },
  { id: "visual-disturbance", label: "Visual disturbance" },
  { id: "jaundice", label: "Jaundice" },
  { id: "infant-under-three-months", label: "Infant under three months old" },
  { id: "pregnancy", label: "Pregnancy or breastfeeding" },
  { id: "suspected-adr", label: "Symptoms suggest an adverse drug reaction" },
  { id: "treatment-failure", label: "No improvement after appropriate self-care" },
  { id: "comorbidity", label: "Significant existing condition or interacting medicine" },
];

export function redFlagLabel(id: string): string {
  const flag = RED_FLAGS.find((f) => f.id === id);
  return flag ? flag.label : id;
}

// ─── Shelf bays ──────────────────────────────────────────────────────────────

export const SHELF_BAYS: { id: ShelfCategory; label: string; blurb: string; accent: string }[] = [
  { id: "analgesics", label: "Analgesics", blurb: "Pain and fever", accent: "#1C7BD9" },
  { id: "antibiotics", label: "Antibiotics", blurb: "Anti-infectives", accent: "#0EA5A4" },
  { id: "antihistamines", label: "Antihistamines", blurb: "Allergy", accent: "#8B5CF6" },
  { id: "antacids", label: "Antacids & GI", blurb: "Acid and gut", accent: "#F59E0B" },
  { id: "antihypertensives", label: "Antihypertensives", blurb: "Cardiovascular", accent: "#DC2626" },
  { id: "antidiabetics", label: "Antidiabetics", blurb: "Glycaemic control", accent: "#7C3AED" },
  { id: "respiratory", label: "Respiratory", blurb: "Airways", accent: "#0891B2" },
  { id: "dermatology", label: "Dermatology", blurb: "Skin preparations", accent: "#DB2777" },
  { id: "vitamins", label: "Vitamins", blurb: "Supplements", accent: "#65A30D" },
  { id: "otc", label: "OTC counter", blurb: "Pharmacy-only sales", accent: "#21B67A" },
];

// ─── Competencies ────────────────────────────────────────────────────────────

export const COMPETENCIES: { id: CompetencyId; label: string; blurb: string }[] = [
  { id: "prescription-assessment", label: "Prescription assessment", blurb: "Reading the order and finding what is wrong with it" },
  { id: "medicine-selection", label: "Medicine selection", blurb: "Right product, right strength, usable batch" },
  { id: "dose-verification", label: "Dose verification", blurb: "Quantity, days' supply and the directions on the label" },
  { id: "counselling", label: "Counselling", blurb: "What the patient is told before they leave" },
  { id: "communication", label: "Communication", blurb: "How questions at the window are answered" },
  { id: "documentation", label: "Documentation", blurb: "The record left behind for the next pharmacist" },
];

// ─── Control panel ───────────────────────────────────────────────────────────

export const PANELS: { id: PanelId; label: string; blurb: string }[] = [
  { id: "queue", label: "Patient queue", blurb: "Who is waiting" },
  { id: "prescription", label: "Prescription", blurb: "The order and the prescriber" },
  { id: "dispensing", label: "Dispensing", blurb: "Shelf, tray and verification" },
  { id: "counselling", label: "Counselling", blurb: "What to tell the patient" },
  { id: "inventory", label: "Inventory", blurb: "Stock, batches and expiry" },
  { id: "interactions", label: "Interactions", blurb: "Clinical check console" },
  { id: "calculations", label: "Calculations", blurb: "Bench calculators" },
  { id: "references", label: "Reference desk", blurb: "Drug information" },
  { id: "documentation", label: "Documentation", blurb: "Intervention record" },
  { id: "help", label: "Help", blurb: "How the counter works" },
];

// ─── Stage copy ──────────────────────────────────────────────────────────────

/**
 * One primary action per stage (§ "what should I do next as a pharmacist?").
 * The machine picks the stage; this is only the wording.
 */
export const STAGE_COPY: Record<string, { title: string; hint: string; action: string; panel: PanelId }> = {
  arrival: { title: "Patient arriving", hint: "Someone has joined the queue at the counter.", action: "Call the next patient", panel: "queue" },
  receive: { title: "Receive the prescription", hint: "Take the prescription and look at it before anything else.", action: "Open the prescription", panel: "prescription" },
  complaint: { title: "Hear the complaint", hint: "The patient has no prescription. Listen to what they are asking for.", action: "Take the complaint", panel: "queue" },
  "patient-assessment": { title: "Assess the patient", hint: "Read the profile: age, weight, allergies, conditions and current medicines.", action: "Review the patient profile", panel: "queue" },
  wwham: { title: "WWHAM assessment", hint: "Ask the five questions before you consider any product.", action: "Start the assessment", panel: "counselling" },
  assessment: { title: "Look for red flags", hint: "Decide what in this history needs a doctor rather than a pharmacist.", action: "Record red flags", panel: "counselling" },
  interpretation: { title: "Interpret the prescription", hint: "Transcribe what is written — drug, strength, dose, frequency, duration, quantity.", action: "Transcribe the order", panel: "prescription" },
  "safety-checks": { title: "Clinical safety checks", hint: "Ten checks. Record your own verdict on each one.", action: "Open the check console", panel: "interactions" },
  intervention: { title: "Act on what you found", hint: "Decide what to do about each problem you identified.", action: "Record the intervention", panel: "interactions" },
  decision: { title: "Self-care or referral", hint: "Decide whether this is a pharmacy supply or a referral.", action: "Make the decision", panel: "counselling" },
  selection: { title: "Select the medicine", hint: "Find the product on the shelf. Compare the name and the strength.", action: "Go to the shelves", panel: "dispensing" },
  product: { title: "Select a product", hint: "Choose an appropriate pharmacy medicine for this complaint.", action: "Go to the shelves", panel: "dispensing" },
  "stock-expiry": { title: "Check stock and expiry", hint: "Pick a batch that outlasts the course, and check what it leaves on the shelf.", action: "Choose a batch", panel: "inventory" },
  quantity: { title: "Calculate the quantity", hint: "Dose × frequency × days. Work it out before you count anything.", action: "Calculate the quantity", panel: "calculations" },
  dispensing: { title: "Dispense into the tray", hint: "Move the packs into the dispensing tray.", action: "Fill the tray", panel: "dispensing" },
  labelling: { title: "Generate the label", hint: "Write directions a patient can follow without you in the room.", action: "Write the label", panel: "dispensing" },
  "final-verification": { title: "Final verification", hint: "Nine lines. Only tick what you have actually confirmed.", action: "Verify before dispensing", panel: "dispensing" },
  counselling: { title: "Counsel the patient", hint: "Eight checkpoints, then whatever the patient asks you.", action: "Counsel the patient", panel: "counselling" },
  documentation: { title: "Document the encounter", hint: "Record what you assessed, supplied, advised and referred.", action: "Write the record", panel: "documentation" },
  payment: { title: "Complete the sale", hint: "Total the items and take payment.", action: "Open the till", panel: "dispensing" },
  complete: { title: "Case complete", hint: "The encounter is finished.", action: "See your performance", panel: "queue" },
};
