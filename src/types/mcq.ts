export interface MCQOption {
  id: string; // a, b, c, d
  text: string;
}

export interface MCQ {
  id: number;
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface MCQSection {
  title: string;
  questions: MCQ[];
}
