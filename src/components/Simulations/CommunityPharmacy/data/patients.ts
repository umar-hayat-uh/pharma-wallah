// ============================================================
// Community Pharmacy Simulation — the people at the counter
// ============================================================
//
// Ten fictional patients. Names are Pakistani because the students using this
// are, and a counter that sounds like theirs is easier to rehearse in.
//
// Nothing here describes a real person. Figures are drawn from flat colours —
// the simulation never shows a photograph of anyone.
//
// The allergy `classes` and the current medicines' `therapeuticClasses` /
// `interactionTags` are what make the checks real: the engine matches on those,
// never on a drug's printed name, so "Septran" and "co-trimoxazole" behave the
// same way and a student cannot pass by string-matching.

import type { Patient } from "../types";

const PATIENTS: Patient[] = [
  {
    id: "ayesha-siddiqui",
    name: "Ayesha Siddiqui",
    ageYears: 28,
    ageLabel: "28 years",
    sex: "female",
    weightKg: 62,
    pregnancy: "none",
    allergies: [],
    conditions: [],
    currentMedicines: [],
    history: ["First visit to this pharmacy", "No regular medicines recorded"],
    chiefComplaint: "Productive cough and fever for four days; seen at the clinic this morning.",
    avatar: { skin: "#E8BFA0", hair: "#2B1B12", shirt: "#1C7BD9" },
  },
  {
    id: "imran-qureshi",
    name: "Imran Qureshi",
    ageYears: 34,
    ageLabel: "34 years",
    sex: "male",
    weightKg: 78,
    pregnancy: "not-applicable",
    allergies: [],
    conditions: [],
    currentMedicines: [],
    history: ["Collected paracetamol two months ago", "No chronic conditions recorded"],
    chiefComplaint: "Dental abscess; seen by a dentist who prescribed an antibiotic.",
    avatar: { skin: "#D9A67C", hair: "#1A1A1A", shirt: "#0EA5A4" },
  },
  {
    id: "rashid-mehmood",
    name: "Rashid Mehmood",
    ageYears: 65,
    ageLabel: "65 years",
    sex: "male",
    weightKg: 84,
    pregnancy: "not-applicable",
    allergies: [{ label: "Aspirin", classes: ["aspirin", "salicylate"], reaction: "Stomach upset and mild wheeze", severity: "mild" }],
    conditions: ["Stable angina", "Hypertension", "Hypercholesterolaemia", "Erectile dysfunction"],
    currentMedicines: [
      { label: "Sildenafil 50 mg as needed", therapeuticClasses: ["pde5-inhibitor"], interactionTags: ["pde5-inhibitor", "hypotensive"] },
      { label: "Atorvastatin 40 mg at night", therapeuticClasses: ["statin", "lipid-lowering"], interactionTags: ["statin", "cyp3a4-substrate", "myopathy-risk"] },
      { label: "Amlodipine 5 mg each morning", therapeuticClasses: ["calcium-channel-blocker", "antihypertensive"], interactionTags: ["hypotensive", "cyp3a4-substrate"] },
    ],
    history: ["Regular monthly collection", "Sildenafil supplied privately — added to the record at his request"],
    chiefComplaint: "Increasing angina on exertion; cardiologist has added a preventive medicine.",
    avatar: { skin: "#C98F63", hair: "#8A8A8A", shirt: "#334155" },
  },
  {
    id: "nadia-farooq",
    name: "Nadia Farooq",
    ageYears: 58,
    ageLabel: "58 years",
    sex: "female",
    weightKg: 71,
    pregnancy: "none",
    allergies: [],
    conditions: ["Hypercholesterolaemia", "Type 2 diabetes"],
    currentMedicines: [
      { label: "Atorvastatin 40 mg at night", therapeuticClasses: ["statin", "lipid-lowering"], interactionTags: ["statin", "cyp3a4-substrate", "myopathy-risk"] },
      { label: "Metformin 500 mg twice daily", therapeuticClasses: ["antidiabetic", "biguanide"], interactionTags: ["metformin"] },
    ],
    history: ["Statin started eight months ago", "Last HbA1c recorded as stable"],
    chiefComplaint: "Chest infection not settling; the doctor has prescribed an antibiotic.",
    avatar: { skin: "#E3B591", hair: "#3E2723", shirt: "#8B5CF6" },
  },
  {
    id: "daud-miraj",
    name: "Daud Miraj",
    ageYears: 51,
    ageLabel: "51 years",
    sex: "male",
    weightKg: 88,
    pregnancy: "not-applicable",
    allergies: [
      { label: "Sulfonamides (sulfa)", classes: ["sulfonamide"], reaction: "Widespread rash and facial swelling in 2019", severity: "severe" },
      { label: "Penicillin", classes: ["penicillin", "beta-lactam"], reaction: "Childhood rash", severity: "moderate" },
    ],
    conditions: ["Type 2 diabetes", "Hypertension"],
    currentMedicines: [
      { label: "Metformin 500 mg twice daily", therapeuticClasses: ["antidiabetic", "biguanide"], interactionTags: ["metformin"] },
      { label: "Lisinopril 10 mg each morning", therapeuticClasses: ["ace-inhibitor", "antihypertensive"], interactionTags: ["ace-inhibitor", "hyperkalaemia-risk"] },
    ],
    history: ["Allergy card issued 2019 — sulfa rash", "Regular collection every 28 days"],
    chiefComplaint: "Burning on passing urine for two days; seen at the clinic.",
    avatar: { skin: "#B97F52", hair: "#4A2C17", shirt: "#DC2626" },
  },
  {
    id: "hooriya-tariq",
    name: "Hooriya Tariq",
    ageYears: 4,
    ageLabel: "4 years",
    sex: "female",
    weightKg: 16,
    pregnancy: "not-applicable",
    allergies: [],
    conditions: [],
    currentMedicines: [],
    history: ["Accompanied by her mother", "Weight measured at the clinic today: 16 kg"],
    chiefComplaint: "Earache and fever for two days; diagnosed with acute otitis media.",
    avatar: { skin: "#F0C9A8", hair: "#241409", shirt: "#21B67A" },
  },
  {
    id: "ghulam-abbas",
    name: "Ghulam Abbas",
    ageYears: 74,
    ageLabel: "74 years",
    sex: "male",
    weightKg: 63,
    serumCreatinine: 1.6,
    pregnancy: "not-applicable",
    allergies: [],
    conditions: ["Atrial fibrillation", "Osteoarthritis", "Chronic kidney disease, stage 3"],
    currentMedicines: [
      { label: "Warfarin 5 mg daily, dose per INR", therapeuticClasses: ["anticoagulant"], interactionTags: ["anticoagulant-bleed", "warfarin", "vitamin-k-sensitive"] },
      { label: "Paracetamol 1 g up to four times daily", therapeuticClasses: ["analgesic", "paracetamol"], interactionTags: ["paracetamol"] },
    ],
    history: ["INR clinic every 4 weeks; last INR 2.6", "Anticoagulant card carried", "eGFR recorded as 42 mL/min/1.73 m²"],
    chiefComplaint: "Urinary infection and worsening knee pain; two items prescribed today.",
    avatar: { skin: "#D3A57A", hair: "#D6D3D1", shirt: "#0891B2" },
  },
  {
    id: "sana-javed",
    name: "Sana Javed",
    ageYears: 23,
    ageLabel: "23 years",
    sex: "female",
    weightKg: 55,
    pregnancy: "none",
    allergies: [],
    conditions: [],
    currentMedicines: [],
    history: ["Buys hay-fever remedies each spring"],
    chiefComplaint: "Sneezing, itchy eyes and a runny nose since the weather changed.",
    avatar: { skin: "#EFC7A4", hair: "#20140C", shirt: "#DB2777" },
  },
  {
    id: "bilal-ahmed",
    name: "Bilal Ahmed (infant)",
    ageYears: 0.75,
    ageLabel: "9 months",
    sex: "male",
    weightKg: 8.4,
    pregnancy: "not-applicable",
    allergies: [],
    conditions: [],
    currentMedicines: [],
    history: ["Brought in by his father", "Immunisations up to date"],
    chiefComplaint: "Loose stools for three days; father is asking for something to stop it.",
    avatar: { skin: "#F2CDAB", hair: "#2E1B10", shirt: "#F59E0B" },
  },
  {
    id: "tanveer-shah",
    name: "Tanveer Shah",
    ageYears: 54,
    ageLabel: "54 years",
    sex: "male",
    weightKg: 92,
    pregnancy: "not-applicable",
    allergies: [],
    conditions: ["Hypertension", "Ex-smoker"],
    currentMedicines: [
      { label: "Amlodipine 5 mg each morning", therapeuticClasses: ["calcium-channel-blocker", "antihypertensive"], interactionTags: ["hypotensive"] },
    ],
    history: ["Blood pressure checked here six weeks ago: 148/92", "Stopped smoking three years ago"],
    chiefComplaint: "Asking for a strong antacid — says he has indigestion that will not settle.",
    avatar: { skin: "#C08A5E", hair: "#57534E", shirt: "#65A30D" },
  },
];

export const PATIENT_INDEX: Record<string, Patient> = {};
PATIENTS.forEach((p) => {
  PATIENT_INDEX[p.id] = p;
});

export { PATIENTS };

export function patient(id: string): Patient | undefined {
  return PATIENT_INDEX[id];
}

/** True when the patient's age makes a plain tablet or capsule a poor choice. */
export function needsLiquidFormulation(p: Patient): boolean {
  return p.ageYears < 6;
}

/**
 * Cockcroft-Gault creatinine clearance, in mL/min.
 *
 * Returned only when weight and serum creatinine are both recorded — a missing
 * value is a finding in its own right, not something to guess around.
 */
export function creatinineClearance(p: Patient): number | null {
  if (!p.weightKg || !p.serumCreatinine || p.ageYears < 18) return null;
  const base = ((140 - p.ageYears) * p.weightKg) / (72 * p.serumCreatinine);
  return Math.round((p.sex === "female" ? base * 0.85 : base) * 10) / 10;
}
