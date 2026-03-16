// lib/mcq-utils.ts
// Shared utility — slug helpers used by both /courses and /mcqs-bank

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function semesterToSlug(semester: string): string {
  // "Semester 1" → "semester-1"
  return toSlug(semester);
}

export function subjectToSlug(name: string): string {
  // "Pharmaceutical Biochemistry" → "pharmaceutical-biochemistry"
  // "Pharmaceutical (Organic Chemistry)" → "pharmaceutical-organic-chemistry"
  return toSlug(name.replace(/[()]/g, ""));
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── MCQ types ────────────────────────────────────────────────────────────────
export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: number;
  unit?: string;
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation: string;
  reference: string;
}

export interface MCQBank {
  subject: string;
  subjectSlug: string;
  semester: string;
  totalQuestions: number;
  units?: string[];
  questions: MCQQuestion[];
}