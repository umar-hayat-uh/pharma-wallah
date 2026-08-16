export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // index into options
}

export const MCQ_BANK: MCQQuestion[] = [
  { id: "m01", question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { id: "m02", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { id: "m03", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2 },
  { id: "m04", question: "Which organ produces insulin?", options: ["Liver", "Pancreas", "Kidney", "Heart"], answer: 1 },
  { id: "m05", question: "What is the normal pH of blood?", options: ["7.0", "7.2", "7.4", "7.6"], answer: 2 },
  { id: "m06", question: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer: 3 },
  { id: "m07", question: "What is the main function of hemoglobin?", options: ["Fight infection", "Carry oxygen", "Digest food", "Regulate temperature"], answer: 1 },
  { id: "m08", question: "Which of the following is an antibiotic?", options: ["Aspirin", "Penicillin", "Paracetamol", "Ibuprofen"], answer: 1 },
  { id: "m09", question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], answer: 2 },
  { id: "m10", question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Deoxyribose Nucleic Acid", "Dinitrogen Acid"], answer: 0 },
  { id: "m11", question: "What is the speed of light in vacuum?", options: ["3\u00d710\u2078 m/s", "3\u00d710\u2076 m/s", "3\u00d710\u2079 m/s", "300,000 km/s only"], answer: 0 },
  { id: "m12", question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
  { id: "m13", question: "Which blood cells are responsible for clotting?", options: ["Red blood cells", "White blood cells", "Platelets", "Plasma cells"], answer: 2 },
  { id: "m14", question: "What is the generic name of Panadol?", options: ["Ibuprofen", "Paracetamol", "Aspirin", "Amoxicillin"], answer: 1 },
  { id: "m15", question: "Which organ filters blood to remove waste?", options: ["Liver", "Kidney", "Spleen", "Lungs"], answer: 1 },
  { id: "m16", question: "What is the medical term for high blood pressure?", options: ["Hypotension", "Hypertension", "Tachycardia", "Bradycardia"], answer: 1 },
  { id: "m17", question: "Which enzyme breaks down starch in saliva?", options: ["Pepsin", "Lipase", "Amylase", "Trypsin"], answer: 2 },
  { id: "m18", question: "What is the normal human body temperature in Celsius?", options: ["35\u00b0C", "37\u00b0C", "39\u00b0C", "40\u00b0C"], answer: 1 },
  { id: "m19", question: "Which hormone regulates blood sugar levels?", options: ["Adrenaline", "Insulin", "Thyroxine", "Cortisol"], answer: 1 },
  { id: "m20", question: "Which part of the brain controls balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla", "Hypothalamus"], answer: 1 },
];

export const FREE_TRIAL_MCQ_BANK: MCQQuestion[] = [
  { id: "t01", question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { id: "t02", question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 },
  { id: "t03", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2 },
  { id: "t04", question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Deoxyribose Nucleic Acid", "Dinitrogen Acid"], answer: 0 },
  { id: "t05", question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
];
