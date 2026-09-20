// ============================================================
// What a check puts in front of the student
// ============================================================
//
// Each check lays out the facts a pharmacist would look at, and stops there.
// It never says whether there is a problem — finding that is the exercise.
//
// The line between "evidence" and "the answer" is drawn deliberately:
//   - class lists, doses, dates and the patient's own record are shown, because
//     that is what a real screen puts in front of you;
//   - a product's contraindications are NOT inlined into the age and
//     contraindication checks. They are one tap away at the reference desk, so
//     the student has to go and look, which is the habit being taught.

import type { CheckId, Patient, RxItem, Medicine } from "../types";
import { frequencyByCode } from "../data/constants";
import { creatinineClearance } from "../data/patients";
import { dailyDose, mgPerKgPerDay, requiredQuantity } from "./clinical";

export interface EvidenceRow {
  label: string;
  value: string;
  /** Rendered as a second, quieter line. */
  note?: string;
}

export interface EvidenceBlock {
  heading: string;
  rows: EvidenceRow[];
  /** Shown when the block has nothing in it. */
  empty?: string;
}

export interface Evidence {
  blocks: EvidenceBlock[];
  /** Where to look it up, when the answer is not on this screen. */
  lookUp?: string;
}

const dash = "—";

export function evidenceFor(
  checkId: CheckId,
  item: RxItem | null,
  m: Medicine | undefined,
  patient: Patient,
): Evidence {
  const freq = item ? frequencyByCode(item.frequencyCode) : undefined;

  switch (checkId) {
    case "allergy":
      return {
        blocks: [
          {
            heading: "Recorded allergies",
            rows: patient.allergies.map((a) => ({
              label: a.label,
              value: a.classes.join(", "),
              note: `${a.reaction} · ${a.severity}`,
            })),
            empty: "No allergies recorded. Confirm this with the patient rather than assuming it.",
          },
          {
            heading: "This product belongs to",
            rows: m
              ? [{ label: `${m.brand} (${m.generic})`, value: m.allergyClasses.length ? m.allergyClasses.join(", ") : "No allergy class recorded" }]
              : [],
            empty: "No product selected.",
          },
        ],
        lookUp: "Compare the classes, not the names. A brand name carries no warning about what is in it.",
      };

    case "interaction":
      return {
        blocks: [
          {
            heading: "Current medicines",
            rows: patient.currentMedicines.map((c) => ({ label: c.label, value: c.interactionTags.join(", ") || dash })),
            empty: "No current medicines recorded.",
          },
          {
            heading: "This product",
            rows: m ? [{ label: `${m.brand} (${m.generic})`, value: m.interactionTags.join(", ") || dash }] : [],
            empty: "No product selected.",
          },
        ],
        lookUp: "An interaction matters when the mechanism reaches this patient. Name the mechanism before you record it.",
      };

    case "duplicate":
      return {
        blocks: [
          {
            heading: "Classes the patient already takes",
            rows: patient.currentMedicines.map((c) => ({ label: c.label, value: c.therapeuticClasses.join(", ") || dash })),
            empty: "No current medicines recorded.",
          },
          {
            heading: "Classes on this prescription",
            rows: m ? [{ label: `${m.brand} (${m.generic})`, value: m.therapeuticClasses.join(", ") }] : [],
            empty: "No product selected.",
          },
        ],
        lookUp: "Look for the same drug under two names, and for two drugs doing the same job.",
      };

    case "dose": {
      const daily = item && m ? dailyDose(item, m) : null;
      const crcl = creatinineClearance(patient);
      return {
        blocks: [
          {
            heading: "As prescribed",
            rows: item
              ? [
                  { label: "Dose per administration", value: `${item.doseUnits} ${m ? unitWord(m) : "units"}` },
                  { label: "Frequency", value: freq ? freq.label : item.frequencyCode },
                  { label: "Total each day", value: daily === null ? "As needed — no fixed daily total" : `${round(daily)} ${baseUnit(m)}` },
                ]
              : [],
          },
          {
            heading: "Usual adult range",
            rows: m && m.usualAdultDose
              ? [{ label: "Per administration", value: `${m.usualAdultDose.min}–${m.usualAdultDose.max} ${m.usualAdultDose.unit}` }]
              : [],
            empty: "No usual range recorded for this product — check the reference desk.",
          },
          {
            heading: "About this patient",
            rows: [
              { label: "Age", value: patient.ageLabel },
              { label: "Weight", value: patient.weightKg ? `${patient.weightKg} kg` : "Not recorded" },
              { label: "Creatinine clearance", value: crcl !== null ? `${crcl} mL/min` : patient.ageYears < 18 ? "Not applicable" : "Cannot be calculated" },
            ],
          },
        ],
        lookUp: "A dose is right or wrong for a patient, not in the abstract. Read the range, then read the patient.",
      };
    }

    case "max-dose": {
      const daily = item && m ? dailyDose(item, m) : null;
      const sameDrug = m
        ? patient.currentMedicines.filter((c) => c.therapeuticClasses.some((t) => m.therapeuticClasses.indexOf(t) !== -1))
        : [];
      return {
        blocks: [
          {
            heading: "Daily total from this item",
            rows: [{ label: "Prescribed", value: daily === null ? "As needed" : `${round(daily)} ${baseUnit(m)}` }],
          },
          {
            heading: "Stated maximum",
            rows: m && m.maxDailyDose ? [{ label: "Maximum", value: `${m.maxDailyDose.value} ${m.maxDailyDose.unit}`, note: m.maxDailyDose.note }] : [],
            empty: "No maximum recorded for this product — check the reference desk.",
          },
          {
            heading: "Other products sharing a class with this one",
            rows: sameDrug.map((c) => ({ label: c.label, value: c.therapeuticClasses.join(", ") })),
            empty: "Nothing on the patient's list shares a class with this item.",
          },
        ],
        lookUp: "Maximums are breached by addition. Count every source of the same drug, including combination products.",
      };
    }

    case "frequency":
      return {
        blocks: [
          {
            heading: "As prescribed",
            rows: item
              ? [
                  { label: "Frequency", value: freq ? freq.label : item.frequencyCode },
                  { label: "Interval", value: freq ? freq.timing : dash },
                  { label: "Administrations per day", value: freq ? String(freq.perDay || "as needed") : dash },
                ]
              : [],
          },
        ],
        lookUp: "Check the interval against how the drug is normally given, and against what the label will tell the patient to do.",
      };

    case "duration": {
      const required = item ? requiredQuantity(item) : null;
      return {
        blocks: [
          {
            heading: "The arithmetic",
            rows: item
              ? [
                  { label: "Dose × frequency × days", value: `${item.doseUnits} × ${freq ? freq.perDay : "?"} × ${item.durationDays}` },
                  { label: "Quantity that needs", value: required === null ? "Cannot be calculated for a PRN order" : `${required} units` },
                  { label: "Quantity written", value: `${item.quantityWritten} units` },
                ]
              : [],
          },
        ],
        lookUp: "If the two disagree, decide which one is wrong — the quantity or the duration — before you ring anyone.",
      };
    }

    case "age":
      return {
        blocks: [
          {
            heading: "This patient",
            rows: [
              { label: "Age", value: patient.ageLabel },
              { label: "Formulation prescribed", value: m ? `${m.form} · ${m.strength}` : dash },
            ],
          },
        ],
        lookUp:
          "The product's age restrictions are on its monograph — open the reference desk for this item and read them, rather than working from memory.",
      };

    case "weight": {
      const perKg = item && m ? mgPerKgPerDay(item, m, patient) : null;
      return {
        blocks: [
          {
            heading: "Recalculate it yourself",
            rows: [
              { label: "Weight recorded", value: patient.weightKg ? `${patient.weightKg} kg` : "Not recorded" },
              { label: "Prescribed daily dose", value: item && m ? `${round(dailyDose(item, m) || 0)} ${baseUnit(m)}` : dash },
              { label: "Works out at", value: perKg === null ? "Cannot be calculated" : `${perKg} mg/kg/day` },
            ],
          },
          {
            heading: "Weight-based range for this product",
            rows: m && m.paediatricDose
              ? [{ label: "Range", value: `${m.paediatricDose.minPerKg}–${m.paediatricDose.maxPerKg} ${m.paediatricDose.unit}`, note: m.paediatricDose.note }]
              : [],
            empty: "This product does not carry a weight-based dose in the catalogue.",
          },
        ],
        lookUp: "The calculator on the bench will do the arithmetic. Deciding whether the answer is acceptable is yours.",
      };
    }

    case "contraindication":
      return {
        blocks: [
          {
            heading: "This patient",
            rows: [
              { label: "Conditions", value: patient.conditions.length ? patient.conditions.join(", ") : "None recorded" },
              {
                label: "Pregnancy status",
                value:
                  patient.pregnancy === "not-applicable"
                    ? "Not applicable"
                    : patient.pregnancy === "none"
                      ? "Not pregnant or breastfeeding"
                      : patient.pregnancy === "unknown"
                        ? "Not established — ask"
                        : patient.pregnancy === "pregnant"
                          ? "Pregnant"
                          : "Breastfeeding",
              },
            ],
          },
        ],
        lookUp:
          "Read this product's contraindications at the reference desk and check them against the list above, one at a time.",
      };

    default:
      return { blocks: [] };
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function baseUnit(m: Medicine | undefined): string {
  if (!m) return "units";
  return m.strengthUnit.indexOf("mcg") !== -1 ? "mcg" : "mg";
}

function unitWord(m: Medicine): string {
  if (m.form === "Suspension" || m.form === "Syrup") return "mL";
  if (m.form === "Inhaler") return "puffs";
  return m.packUnit;
}
