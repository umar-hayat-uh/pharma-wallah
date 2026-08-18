export interface ConditionCard {
  id: string;
  condition: string;
  subtitle: string;
  description: string;
  targetDrugClass: string;
}

export interface PillDef {
  id: string;
  name: string;
  conditionId: string;
  isCorrect: boolean;
}

export const CONDITIONS: ConditionCard[] = [
  {
    id: "bacterial_infection",
    condition: "Bacterial Infection (Pneumonia / UTI)",
    subtitle: "EAT BLUE PILLS: Antibiotics Only!",
    description: "Target Drugs: Amoxicillin, Ciprofloxacin, Azithromycin, Ceftriaxone",
    targetDrugClass: "Antibiotics",
  },
  {
    id: "essential_hypertension",
    condition: "High Blood Pressure (Hypertension)",
    subtitle: "EAT BLUE PILLS: Antihypertensives Only!",
    description: "Target Drugs: Lisinopril, Amlodipine, Losartan, Hydrochlorothiazide",
    targetDrugClass: "Antihypertensives",
  },
  {
    id: "type2_diabetes",
    condition: "Type 2 Diabetes Mellitus",
    subtitle: "EAT BLUE PILLS: Antidiabetics Only!",
    description: "Target Drugs: Metformin, Empagliflozin, Sitagliptin, Glipizide",
    targetDrugClass: "Antidiabetics",
  },
  {
    id: "acute_pain",
    condition: "Severe Acute Pain & Inflammation",
    subtitle: "EAT BLUE PILLS: Analgesics / NSAIDs Only!",
    description: "Target Drugs: Morphine, Ibuprofen, Acetaminophen, Ketorolac",
    targetDrugClass: "Analgesics",
  },
];

export const PILL_DATABASE: Record<string, { correct: string[]; wrong: string[] }> = {
  bacterial_infection: {
    correct: ["Amoxicillin", "Cipro", "Azithromycin", "Ceftriaxone"],
    wrong: ["Lisinopril", "Metformin", "Omeprazole", "Warfarin"],
  },
  essential_hypertension: {
    correct: ["Lisinopril", "Amlodipine", "Losartan", "HCTZ"],
    wrong: ["Amoxicillin", "Ibuprofen", "Atorvastatin", "Metformin"],
  },
  type2_diabetes: {
    correct: ["Metformin", "Jardiance", "Sitagliptin", "Glipizide"],
    wrong: ["Warfarin", "Prednisone", "Thyroid", "Lisinopril"],
  },
  acute_pain: {
    correct: ["Morphine", "Ibuprofen", "Tylenol", "Ketorolac"],
    wrong: ["Lasix", "Albuterol", "Metformin", "Amlodipine"],
  },
};

export function pickRandomCondition(): ConditionCard {
  const idx = Math.floor(Math.random() * CONDITIONS.length);
  return CONDITIONS[idx];
}

export function pickRandomPill(conditionId: string): PillDef {
  const data = PILL_DATABASE[conditionId] || PILL_DATABASE.bacterial_infection;
  const isCorrect = Math.random() < 0.65;
  const pool = isCorrect ? data.correct : data.wrong;
  const name = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `${conditionId}_${name}_${Date.now()}`,
    name,
    conditionId,
    isCorrect,
  };
}

export function isPillCorrectForCondition(
  pill: PillDef,
  conditionId: string
): boolean {
  const data = PILL_DATABASE[conditionId];
  if (!data) return false;
  return data.correct.includes(pill.name);
}