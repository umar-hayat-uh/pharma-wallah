import { NextResponse } from 'next/server';

const MCQ_BANK = [
  { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2 },
  { question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Deoxyribose Nucleic Acid", "Dinitrogen Acid"], answer: 0 },
  { question: "What is the speed of light in vacuum?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁹ m/s", "300,000 km/s"], answer: 0 },
  { question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
];

export async function GET() {
  const shuffled = [...MCQ_BANK].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  return NextResponse.json(selected);
}