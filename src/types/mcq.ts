// src/types/mcq/index.ts

export interface MCQ {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  reference?: string; // optional reference source
}

export interface MCQSection {
  title: string;
  questions: MCQ[];
}