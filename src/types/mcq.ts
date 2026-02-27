// src/types/mcq.ts

export interface Option {
  id: string;
  text: string;
}

export interface MCQ {
  id: number;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  reference?: string;
  difficulty: 'easy' | 'medium' | 'hard'; // or `difficulty: string` if you prefer
}