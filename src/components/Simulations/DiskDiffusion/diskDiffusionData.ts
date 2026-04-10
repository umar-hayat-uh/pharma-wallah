// ============================================================
// PharmaWallah — Disk Diffusion Simulation Data
// Kirby-Bauer Antibiotic Susceptibility Test
// ============================================================

export interface Antibiotic {
  id: string;
  name: string;
  shortName: string;
  class: string;
  concentration: string;
  color: string;
  diskColor: string;
  breakpoints: {
    susceptible: number;   // ≥ this = S
    resistant: number;     // ≤ this = R
    // between = I
  };
  mechanism: string;
  clinicalNote: string;
}

export interface Organism {
  id: string;
  name: string;
  shortName: string;
  gramStain: 'positive' | 'negative';
  morphology: string;
  color: string;
  description: string;
  clinicalSignificance: string;
  agarColor: string;  // color of bacterial lawn
  zones: Record<string, number>;  // antibiotic id -> zone diameter mm
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedStep: number;
}

export interface SimStep {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  labTip: string;
}

// ─── Antibiotic Disks ───────────────────────────────────────

export const ANTIBIOTICS: Antibiotic[] = [
  {
    id: 'AMP',
    name: 'Ampicillin',
    shortName: 'AMP',
    class: 'Penicillin',
    concentration: '10 µg',
    color: '#3B82F6',
    diskColor: '#DBEAFE',
    breakpoints: { susceptible: 17, resistant: 13 },
    mechanism: 'Inhibits cell wall synthesis by binding PBPs',
    clinicalNote: 'First-line for susceptible E. coli UTIs; widespread resistance limits use',
  },
  {
    id: 'CIP',
    name: 'Ciprofloxacin',
    shortName: 'CIP',
    class: 'Fluoroquinolone',
    concentration: '5 µg',
    color: '#EC4899',
    diskColor: '#FCE7F3',
    breakpoints: { susceptible: 21, resistant: 15 },
    mechanism: 'Inhibits DNA gyrase and topoisomerase IV',
    clinicalNote: 'Broad-spectrum; used for UTIs, respiratory & GI infections',
  },
  {
    id: 'GEN',
    name: 'Gentamicin',
    shortName: 'GEN',
    class: 'Aminoglycoside',
    concentration: '10 µg',
    color: '#10B981',
    diskColor: '#D1FAE5',
    breakpoints: { susceptible: 15, resistant: 12 },
    mechanism: 'Irreversibly binds 30S ribosomal subunit → inhibits protein synthesis',
    clinicalNote: 'Reserve for serious infections; nephrotoxic, requires monitoring',
  },
  {
    id: 'TET',
    name: 'Tetracycline',
    shortName: 'TET',
    class: 'Tetracycline',
    concentration: '30 µg',
    color: '#F59E0B',
    diskColor: '#FEF3C7',
    breakpoints: { susceptible: 19, resistant: 14 },
    mechanism: 'Reversibly binds 30S ribosome → blocks aminoacyl-tRNA binding',
    clinicalNote: 'Avoid in pregnancy & children <8y; resistance common',
  },
  {
    id: 'CTX',
    name: 'Cefotaxime',
    shortName: 'CTX',
    class: '3rd-gen Cephalosporin',
    concentration: '30 µg',
    color: '#8B5CF6',
    diskColor: '#EDE9FE',
    breakpoints: { susceptible: 26, resistant: 22 },
    mechanism: 'Binds PBP3 → inhibits cell wall transpeptidation',
    clinicalNote: 'Drug of choice for meningitis; stable to many beta-lactamases',
  },
  {
    id: 'ERY',
    name: 'Erythromycin',
    shortName: 'ERY',
    class: 'Macrolide',
    concentration: '15 µg',
    color: '#EF4444',
    diskColor: '#FEE2E2',
    breakpoints: { susceptible: 23, resistant: 13 },
    mechanism: 'Binds 50S ribosomal subunit → blocks translocation',
    clinicalNote: 'Alternative to penicillin in allergic patients; atypical pathogens',
  },
  {
    id: 'VAN',
    name: 'Vancomycin',
    shortName: 'VAN',
    class: 'Glycopeptide',
    concentration: '30 µg',
    color: '#06B6D4',
    diskColor: '#CFFAFE',
    breakpoints: { susceptible: 15, resistant: 9 },
    mechanism: 'Binds D-Ala-D-Ala terminus → inhibits peptidoglycan polymerization',
    clinicalNote: 'Last resort for MRSA; requires TDM (trough monitoring)',
  },
];

// ─── Organisms ──────────────────────────────────────────────

export const ORGANISMS: Organism[] = [
  {
    id: 'ecoli',
    name: 'Escherichia coli',
    shortName: 'E. coli',
    gramStain: 'negative',
    morphology: 'Gram-negative rod (bacillus)',
    color: '#EF4444',
    description: 'ATCC 25922 — Standard QC strain for Gram-negative testing',
    clinicalSignificance: 'Most common cause of UTI, bacteremia, neonatal meningitis. Increasing resistance to ampicillin & fluoroquinolones.',
    agarColor: '#c8e6c9',
    zones: { AMP: 16, CIP: 30, GEN: 21, TET: 18, CTX: 29, ERY: 8, VAN: 0 },
  },
  {
    id: 'saureus',
    name: 'Staphylococcus aureus',
    shortName: 'S. aureus',
    gramStain: 'positive',
    morphology: 'Gram-positive coccus (clusters)',
    color: '#F59E0B',
    description: 'ATCC 25923 — Standard QC strain for Gram-positive testing',
    clinicalSignificance: 'Leading cause of skin infections, bacteremia, endocarditis. MRSA strains resist most beta-lactams.',
    agarColor: '#fff9c4',
    zones: { AMP: 27, CIP: 22, GEN: 19, TET: 24, CTX: 31, ERY: 26, VAN: 17 },
  },
  {
    id: 'paeruginosa',
    name: 'Pseudomonas aeruginosa',
    shortName: 'P. aeruginosa',
    gramStain: 'negative',
    morphology: 'Gram-negative rod, motile',
    color: '#10B981',
    description: 'ATCC 27853 — Intrinsically resistant non-fermenter',
    clinicalSignificance: 'Opportunistic pathogen in CF & immunocompromised. Intrinsic resistance to many antibiotics.',
    agarColor: '#b2dfdb',
    zones: { AMP: 6, CIP: 28, GEN: 17, TET: 10, CTX: 15, ERY: 0, VAN: 0 },
  },
  {
    id: 'kpneumoniae',
    name: 'Klebsiella pneumoniae',
    shortName: 'K. pneumoniae',
    gramStain: 'negative',
    morphology: 'Gram-negative rod, encapsulated',
    color: '#8B5CF6',
    description: 'ATCC 700603 — ESBL-producing reference strain',
    clinicalSignificance: 'Hospital-acquired pneumonia, UTI. ESBL producers resist most cephalosporins.',
    agarColor: '#e1bee7',
    zones: { AMP: 8, CIP: 24, GEN: 18, TET: 15, CTX: 12, ERY: 6, VAN: 0 },
  },
  {
    id: 'spyogenes',
    name: 'Streptococcus pyogenes',
    shortName: 'S. pyogenes',
    gramStain: 'positive',
    morphology: 'Gram-positive coccus (chains)',
    color: '#EC4899',
    description: 'ATCC 19615 — Group A Streptococcus',
    clinicalSignificance: 'Pharyngitis, impetigo, rheumatic fever. Universally susceptible to penicillin.',
    agarColor: '#fce4ec',
    zones: { AMP: 28, CIP: 19, GEN: 14, TET: 20, CTX: 32, ERY: 25, VAN: 18 },
  },
  {
    id: 'efaecalis',
    name: 'Enterococcus faecalis',
    shortName: 'E. faecalis',
    gramStain: 'positive',
    morphology: 'Gram-positive coccus (pairs/short chains)',
    color: '#06B6D4',
    description: 'ATCC 29212 — VRE testing reference strain',
    clinicalSignificance: 'UTI, endocarditis, hospital-acquired infections. VRE strains are a major therapeutic challenge.',
    agarColor: '#e0f7fa',
    zones: { AMP: 22, CIP: 16, GEN: 10, TET: 16, CTX: 14, ERY: 18, VAN: 11 },
  },
];

// ─── Simulation Steps ────────────────────────────────────────

export const SIM_STEPS: SimStep[] = [
  {
    id: 'intro',
    number: 0,
    title: 'Introduction',
    shortTitle: 'Intro',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    description: 'Learn about the Kirby-Bauer disk diffusion method and its clinical importance.',
    labTip: 'This test is standardized by CLSI (Clinical and Laboratory Standards Institute) guidelines.',
  },
  {
    id: 'selectOrganism',
    number: 1,
    title: 'Select Organism',
    shortTitle: 'Organism',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    description: 'Choose the bacterial organism to test antibiotic susceptibility against.',
    labTip: 'Always use ATCC reference strains for quality control alongside patient isolates.',
  },
  {
    id: 'prepMedia',
    number: 2,
    title: 'Prepare Media',
    shortTitle: 'Media',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    description: 'Pour and prepare Mueller-Hinton agar plates to CLSI specifications.',
    labTip: 'MHA must be poured to exactly 4mm depth. Check pH 7.2–7.4 before use.',
  },
  {
    id: 'inoculate',
    number: 3,
    title: 'Inoculate',
    shortTitle: 'Inoculate',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    description: 'Prepare 0.5 McFarland inoculum and swab the plate in 3 directions.',
    labTip: 'Match turbidity to 0.5 McFarland (≈1.5×10⁸ CFU/mL). Too dense = smaller zones; too light = larger zones.',
  },
  {
    id: 'placeDisks',
    number: 4,
    title: 'Place Disks',
    shortTitle: 'Disks',
    icon: 'M12 4v16m8-8H4',
    description: 'Select and place antibiotic-impregnated paper disks onto the inoculated plate.',
    labTip: 'Disks must be ≥24mm apart (center-to-center) and ≥15mm from the plate edge to prevent overlapping zones.',
  },
  {
    id: 'incubate',
    number: 5,
    title: 'Incubate',
    shortTitle: 'Incubate',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    description: 'Incubate inverted at 35–37°C for 16–18 hours. Zones of inhibition will form.',
    labTip: 'Place plate inverted to prevent condensation on agar. CO₂ incubators should NOT be used unless specified.',
  },
  {
    id: 'measure',
    number: 6,
    title: 'Measure Zones',
    shortTitle: 'Measure',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    description: 'Measure zone diameters using a ruler or digital caliper in millimeters.',
    labTip: 'Measure from the back of the plate using reflected light. Include the diameter of the disk (6mm) in your measurement.',
  },
  {
    id: 'interpret',
    number: 7,
    title: 'Interpret',
    shortTitle: 'Interpret',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    description: 'Compare measured zones to CLSI breakpoints. Report S (susceptible), I (intermediate), or R (resistant).',
    labTip: 'Always report as S/I/R — never as "sensitive" or "insensitive". Intermediate may require dose adjustment.',
  },
  {
    id: 'report',
    number: 8,
    title: 'Download Report',
    shortTitle: 'Report',
    icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    description: 'Generate and download a professional lab report with your results.',
    labTip: 'Clinical reports should include patient ID, organism, collection date, and reference ranges.',
  },
];

// ─── Quiz Questions ──────────────────────────────────────────

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the recommended agar depth for Mueller-Hinton plates used in disk diffusion?',
    options: ['2 mm', '4 mm', '6 mm', '8 mm'],
    correctIndex: 1,
    explanation: 'CLSI mandates 4 mm depth. Plates thinner than 4 mm produce falsely large zones; thicker plates give falsely small zones.',
    relatedStep: 2,
  },
  {
    id: 'q2',
    question: 'The 0.5 McFarland turbidity standard equals approximately how many CFU/mL?',
    options: ['1.5 × 10⁶', '1.5 × 10⁷', '1.5 × 10⁸', '1.5 × 10⁹'],
    correctIndex: 2,
    explanation: '0.5 McFarland = ~1.5×10⁸ CFU/mL. This standardizes bacterial density for reproducible zone sizes.',
    relatedStep: 3,
  },
  {
    id: 'q3',
    question: 'Ampicillin gave a zone of 10mm against an E. coli isolate. What is the interpretation?',
    options: ['Susceptible (S)', 'Intermediate (I)', 'Resistant (R)', 'Invalid — repeat test'],
    correctIndex: 2,
    explanation: 'CLSI breakpoints for Ampicillin: S ≥17mm, R ≤13mm. Zone of 10mm falls ≤13mm → Resistant. Do not use Ampicillin.',
    relatedStep: 7,
  },
  {
    id: 'q4',
    question: 'Why must antibiotic disks be placed ≥24mm apart center-to-center?',
    options: [
      'To fit more disks on the plate',
      'To prevent overlapping inhibition zones that complicate reading',
      'To reduce antibiotic diffusion speed',
      'To maintain temperature gradients'
    ],
    correctIndex: 1,
    explanation: 'Overlapping zones make it impossible to accurately measure each individual zone boundary. 24mm spacing ensures clean, readable zones.',
    relatedStep: 4,
  },
  {
    id: 'q5',
    question: 'Vancomycin shows no zone around its disk against P. aeruginosa. This indicates:',
    options: [
      'A defective disk — repeat the test',
      'Intrinsic resistance — P. aeruginosa lacks the vancomycin target',
      'The organism is susceptible',
      'The incubation time was too short'
    ],
    correctIndex: 1,
    explanation: 'P. aeruginosa is intrinsically resistant to vancomycin. Gram-negative outer membrane prevents vancomycin penetration. No zone = expected resistance.',
    relatedStep: 7,
  },
  {
    id: 'q6',
    question: 'Which incubation temperature is correct for standard disk diffusion?',
    options: ['25–28°C', '30–32°C', '35–37°C', '40–42°C'],
    correctIndex: 2,
    explanation: 'CLSI specifies 35±2°C (35–37°C) for 16–18 hours. CO₂ incubators are NOT used unless specifically required (e.g., H. influenzae).',
    relatedStep: 5,
  },
  {
    id: 'q7',
    question: 'What does an "Intermediate (I)" susceptibility result mean clinically?',
    options: [
      'The antibiotic will definitely work',
      'The antibiotic will definitely fail',
      'The antibiotic may work at higher doses or at body sites where drug concentrates',
      'The test needs to be repeated'
    ],
    correctIndex: 2,
    explanation: 'Intermediate indicates a zone in the buffer zone between S and R breakpoints. The antibiotic may be clinically effective with dose adjustment or at naturally concentrating sites (e.g., urine for UTI treatment).',
    relatedStep: 7,
  },
];

export type InterpretResult = 'S' | 'I' | 'R';

export function interpretZone(antibioticId: string, zoneMm: number): InterpretResult {
  const ab = ANTIBIOTICS.find(a => a.id === antibioticId);
  if (!ab || zoneMm === 0) return 'R';
  if (zoneMm >= ab.breakpoints.susceptible) return 'S';
  if (zoneMm <= ab.breakpoints.resistant) return 'R';
  return 'I';
}

export function getScoreLabel(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'A+ — Outstanding', color: '#10B981' };
  if (pct >= 80) return { label: 'A — Excellent', color: '#10B981' };
  if (pct >= 70) return { label: 'B — Good', color: '#3B82F6' };
  if (pct >= 60) return { label: 'C — Satisfactory', color: '#F59E0B' };
  return { label: 'F — Needs Review', color: '#EF4444' };
}