export interface FlashcardQuestion {
  id: string;
  term: string;
  answer: string;
}

export const FLASHCARD_BANK: FlashcardQuestion[] = [
  { id: "f01", term: "What is the active ingredient in Aspirin?", answer: "Acetylsalicylic acid" },
  { id: "f02", term: "What is the chemical formula of water?", answer: "H2O" },
  { id: "f03", term: "Which enzyme breaks down starch?", answer: "Amylase" },
  { id: "f04", term: "What is the powerhouse of the cell?", answer: "Mitochondria" },
  { id: "f05", term: "What does DNA stand for?", answer: "Deoxyribonucleic acid" },
  { id: "f06", term: "Which vitamin is called ascorbic acid?", answer: "Vitamin C" },
  { id: "f07", term: "What is the normal body temperature in Celsius?", answer: "37" },
  { id: "f08", term: "Which organ filters blood?", answer: "Kidney" },
  { id: "f09", term: "What is the medical term for high blood pressure?", answer: "Hypertension" },
  { id: "f10", term: "What is the generic name of Panadol?", answer: "Paracetamol" },
  { id: "f11", term: "What is the primary function of red blood cells?", answer: "Carry oxygen" },
  { id: "f12", term: "Which hormone regulates blood sugar levels?", answer: "Insulin" },
  { id: "f13", term: "What is the study of drugs called?", answer: "Pharmacology" },
  { id: "f14", term: "Which organ produces bile?", answer: "Liver" },
  { id: "f15", term: "What is the universal blood donor type?", answer: "O negative" },
  { id: "f16", term: "Which gland is known as the master gland?", answer: "Pituitary gland" },
];

/**
 * Fuzzy-ish matching for typed flashcard answers: case/whitespace insensitive,
 * strips common punctuation. Keeps the game from failing a correct answer
 * over a trailing period or extra space, without being a full fuzzy-match
 * engine (which would need a dependency and isn't worth it for this event).
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}
