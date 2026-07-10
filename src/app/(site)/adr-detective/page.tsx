"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Pill, AlertTriangle, CheckCircle, BookOpen, Star, ArrowRight,
  ChevronRight, RefreshCw, Zap, Flame, Trophy, Shield, Clock,
  Lightbulb, X, Award, Home, Lock, Sparkles
} from "lucide-react";

// ─── PATIENT AVATAR SVG (same) ──────────────────────────────────────────────
const PatientAvatar = ({
  skin = "#F5CBA7",
  hair = "#4A235A",
  shirt = "#2980B9",
  size = 80,
}: {
  skin?: string;
  hair?: string;
  shirt?: string;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="95" rx="28" ry="22" fill={shirt} />
    <rect x="44" y="64" width="12" height="14" rx="4" fill={skin} />
    <circle cx="50" cy="52" r="22" fill={skin} />
    <ellipse cx="50" cy="33" rx="22" ry="12" fill={hair} />
    <ellipse cx="30" cy="46" rx="6" ry="14" fill={hair} />
    <ellipse cx="70" cy="46" rx="6" ry="14" fill={hair} />
    <circle cx="42" cy="50" r="3" fill="#2c3e50" />
    <circle cx="58" cy="50" r="3" fill="#2c3e50" />
    <circle cx="43" cy="49" r="1" fill="white" />
    <circle cx="59" cy="49" r="1" fill="white" />
    <path d="M 43 58 Q 50 64 57 58" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 40 78 L 50 88 L 60 78" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);

// ─── TYPES & EXPANDED DATA (now includes 10 hospital/antibiotic cases) ─────

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface CaseStudy {
  id: number;
  patientName: string;
  patientAge: number;
  avatarSeed: { skin: string; hair: string; shirt: string };
  symptoms: string[];
  medications: string[];
  culpritDrug: string;
  culpritIndex: number;
  clue: string;
  studyGuide: {
    overview: string;
    pharmacology: string;
    mechanism: string;
    keyTakeaways: string[];
    references: string;
  };
  justificationQuestions: Question[];
  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
  timeLimit: number;
}

const CASES: CaseStudy[] = [
  // -- 1. ACE inhibitor cough (Easy) --
  {
    id: 1,
    patientName: "David Miller",
    patientAge: 51,
    avatarSeed: { skin: "#F5CBA7", hair: "#4A235A", shirt: "#2980B9" },
    symptoms: ["Persistent dry cough", "No fever", "No rhinorrhoea", "Lungs clear"],
    medications: ["Lisinopril 10 mg QD", "Metformin 500 mg BID", "Atorvastatin 20 mg QD"],
    culpritDrug: "Lisinopril",
    culpritIndex: 0,
    clue: "ACE inhibitor‑induced cough due to bradykinin accumulation.",
    studyGuide: {
      overview: "David has been on lisinopril for hypertension. After 3 weeks, he developed a dry, hacking cough. This is a classic class effect of ACE inhibitors.",
      pharmacology: "ACE inhibitors block the conversion of angiotensin I to angiotensin II, but also inhibit the breakdown of bradykinin. Accumulation of bradykinin and substance P in the airways causes cough.",
      mechanism: "Bradykinin‑induced sensitisation of C‑fibres in the respiratory tract triggers a non‑productive cough. Switching to an ARB usually resolves it.",
      keyTakeaways: [
        "ACE inhibitor cough is dose‑independent and can occur any time during therapy.",
        "ARBs (e.g., losartan) are a suitable alternative.",
        "Never stop an ACE inhibitor abruptly without consulting the prescriber."
      ],
      references: "Dicpinigaitis PV. ACCP guidelines. Chest. 2006.",
    },
    justificationQuestions: [
      {
        q: "Which enzyme is responsible for bradykinin degradation?",
        options: ["Angiotensin‑converting enzyme (ACE)", "Chymase", "Renin", "CYP3A4"],
        correct: 0,
        explanation: "ACE also degrades bradykinin; its inhibition leads to bradykinin accumulation."
      },
      {
        q: "What is the first‑line alternative to lisinopril in this patient?",
        options: ["Candesartan", "Amlodipine", "Hydrochlorothiazide", "Propranolol"],
        correct: 0,
        explanation: "An ARB such as candesartan blocks angiotensin II directly without affecting bradykinin."
      }
    ],
    difficulty: "Easy",
    xp: 40,
    timeLimit: 180,
  },
  // -- 2. Amlodipine oedema (Easy) --
  {
    id: 2,
    patientName: "Clara Jenkins",
    patientAge: 65,
    avatarSeed: { skin: "#FAD7A0", hair: "#784212", shirt: "#8E44AD" },
    symptoms: ["Bilateral ankle swelling", "Mild headache", "Normal renal function"],
    medications: ["Amlodipine 5 mg QD", "Atorvastatin 40 mg QD", "Aspirin 75 mg QD"],
    culpritDrug: "Amlodipine",
    culpritIndex: 0,
    clue: "Dihydropyridine calcium channel blocker‑induced peripheral oedema.",
    studyGuide: {
      overview: "Clara has been on amlodipine for hypertension. She now complains of swollen ankles. This is a common adverse effect of dihydropyridine CCBs.",
      pharmacology: "Dihydropyridines preferentially dilate arterioles over veins, increasing capillary hydrostatic pressure and fluid extravasation.",
      mechanism: "Arteriolar vasodilation without proportional venodilation leads to increased capillary pressure and peripheral oedema. Not related to fluid retention or renal dysfunction.",
      keyTakeaways: [
        "Peripheral oedema with amlodipine is dose‑dependent.",
        "Adding an ACE inhibitor or ARB can reduce the swelling.",
        "It is usually benign but can affect adherence."
      ],
      references: "Messerli FH. Am J Med. 2002.",
    },
    justificationQuestions: [
      {
        q: "Why does amlodipine cause more oedema than verapamil?",
        options: ["Greater arteriolar selectivity", "Greater venodilation", "Slower onset", "Higher protein binding"],
        correct: 0,
        explanation: "Dihydropyridines are more arteriolar‑selective, leading to capillary pressure imbalance."
      },
      {
        q: "Which add‑on therapy may alleviate the oedema?",
        options: ["Lisinopril", "Furosemide", "Metoprolol", "Clonidine"],
        correct: 0,
        explanation: "An ACE inhibitor causes venodilation, balancing the arteriolar dilation and reducing capillary pressure."
      }
    ],
    difficulty: "Easy",
    xp: 40,
    timeLimit: 180,
  },
  // -- 3. Naproxen GI bleed (Medium) --
  {
    id: 3,
    patientName: "Harold Whitfield",
    patientAge: 78,
    avatarSeed: { skin: "#E8BEAC", hair: "#B0B0B0", shirt: "#2C3E50" },
    symptoms: ["Black tarry stools", "Epigastric pain", "Orthostatic hypotension"],
    medications: ["Naproxen 500 mg BID", "Warfarin 5 mg QD", "Pantoprazole 40 mg QD"],
    culpritDrug: "Naproxen",
    culpritIndex: 0,
    clue: "NSAID‑induced GI bleeding potentiated by warfarin.",
    studyGuide: {
      overview: "Harold, on warfarin, started naproxen for arthritis. He now shows signs of GI bleeding. The combination is dangerous.",
      pharmacology: "NSAIDs inhibit COX‑1, reducing protective prostaglandins in the gastric mucosa, while warfarin impairs coagulation. Together, they dramatically increase bleeding risk.",
      mechanism: "COX‑1 inhibition → decreased mucosal defence + impaired platelet thromboxane A2 → additive effect with warfarin.",
      keyTakeaways: [
        "Avoid NSAIDs in patients on anticoagulants if possible.",
        "If necessary, use a COX‑2 inhibitor with a PPI.",
        "Monitor for signs of GI bleeding: melena, haemodynamic changes."
      ],
      references: "Chest Guidelines for Antithrombotic Therapy.",
    },
    justificationQuestions: [
      {
        q: "Which enzyme does naproxen primarily inhibit?",
        options: ["COX‑1", "COX‑2", "5‑LOX", "Phospholipase A2"],
        correct: 0,
        explanation: "Naproxen is non‑selective but inhibits COX‑1 strongly, reducing gastric protection."
      },
      {
        q: "What is the safer analgesic alternative for this patient?",
        options: ["Paracetamol", "Celecoxib", "Ibuprofen", "Diclofenac"],
        correct: 0,
        explanation: "Paracetamol has no antiplatelet effect and does not cause GI ulceration."
      }
    ],
    difficulty: "Medium",
    xp: 60,
    timeLimit: 200,
  },
  // -- 4. Hyperkalemia (Medium) --
  {
    id: 4,
    patientName: "Maria Gonzalez",
    patientAge: 61,
    avatarSeed: { skin: "#C68642", hair: "#2C3E50", shirt: "#E67E22" },
    symptoms: ["Muscle weakness", "Palpitations", "ECG shows peaked T waves"],
    medications: ["Lisinopril 20 mg QD", "Hydrochlorothiazide 25 mg QD", "K‑Dur 20 mEq BID"],
    culpritDrug: "K‑Dur",
    culpritIndex: 2,
    clue: "Potassium supplement + ACE inhibitor causing hyperkalemia.",
    studyGuide: {
      overview: "Maria is on lisinopril and a potassium supplement. She now presents with signs of hyperkalemia.",
      pharmacology: "ACE inhibitors reduce aldosterone, decreasing renal potassium excretion. Adding exogenous potassium can lead to dangerous hyperkalemia.",
      mechanism: "Aldosterone promotes K⁺ secretion in the distal nephron. Lisinopril lowers aldosterone → reduced K⁺ excretion. K‑Dur adds more K⁺.",
      keyTakeaways: [
        "Always check renal function and potassium before adding potassium supplements to ACE inhibitors.",
        "Salt substitutes are often potassium‑based and should be avoided.",
        "ECG changes: peaked T waves, loss of P waves, widened QRS."
      ],
      references: "KDIGO Guidelines for Potassium Management.",
    },
    justificationQuestions: [
      {
        q: "How does aldosterone affect potassium levels?",
        options: ["Promotes K⁺ secretion", "Inhibits K⁺ reabsorption", "Stimulates Na⁺/K⁺ ATPase", "Blocks K⁺ channels"],
        correct: 0,
        explanation: "Aldosterone stimulates epithelial sodium channels (ENaC), indirectly promoting K⁺ secretion."
      },
      {
        q: "Which ECG change is characteristic of severe hyperkalemia?",
        options: ["Peaked T waves", "ST depression", "Prolonged QT", "U waves"],
        correct: 0,
        explanation: "Peaked T waves are an early sign; later, P waves flatten and QRS widens."
      }
    ],
    difficulty: "Medium",
    xp: 60,
    timeLimit: 200,
  },
  // -- 5. Methotrexate + Bactrim (Hard) --
  {
    id: 5,
    patientName: "Robert Chen",
    patientAge: 53,
    avatarSeed: { skin: "#FDEBD0", hair: "#1C2833", shirt: "#27AE60" },
    symptoms: ["Fever", "Sore throat", "Easy bruising", "Pancytopenia on CBC"],
    medications: ["Methotrexate 15 mg weekly", "Bactrim DS BID × 7 days", "Folic acid 1 mg QD"],
    culpritDrug: "Bactrim DS",
    culpritIndex: 1,
    clue: "Trimethoprim synergistically exacerbates methotrexate’s antifolate effects.",
    studyGuide: {
      overview: "Robert was on stable methotrexate therapy. After starting Bactrim for a UTI, he developed severe bone marrow suppression.",
      pharmacology: "Both methotrexate and trimethoprim inhibit dihydrofolate reductase (DHFR), though with different affinities. The combination causes profound folate depletion and myelosuppression.",
      mechanism: "Sequential blockade of folate metabolism → inhibition of DNA synthesis → pancytopenia. Folic acid supplementation is insufficient to overcome the synergistic effect.",
      keyTakeaways: [
        "Trimethoprim should be avoided in patients on methotrexate.",
        "Nitrofurantoin or fosfomycin are safer alternatives for UTI.",
        "Monitor CBC closely if co‑administration is unavoidable."
      ],
      references: "ASHP Guidelines on Drug Interactions.",
    },
    justificationQuestions: [
      {
        q: "Which enzyme is inhibited by both methotrexate and trimethoprim?",
        options: ["Dihydrofolate reductase", "Thymidylate synthase", "CYP2D6", "Xanthine oxidase"],
        correct: 0,
        explanation: "DHFR is a key enzyme in folate metabolism; its inhibition blocks DNA synthesis."
      },
      {
        q: "What is the recommended alternative antibiotic for this patient’s UTI?",
        options: ["Nitrofurantoin", "Ciprofloxacin", "Cephalexin", "Azithromycin"],
        correct: 0,
        explanation: "Nitrofurantoin does not interfere with folate metabolism and is safe with methotrexate."
      }
    ],
    difficulty: "Hard",
    xp: 80,
    timeLimit: 180,
  },
  // -- 6. Oxybutynin anticholinergic (Hard) --
  {
    id: 6,
    patientName: "Evelyn Smith",
    patientAge: 84,
    avatarSeed: { skin: "#FAD7A0", hair: "#E0E0E0", shirt: "#8E44AD" },
    symptoms: ["Confusion", "Dry mouth", "Constipation", "Difficulty urinating"],
    medications: ["Ditropan XL 10 mg QD", "Tamsulosin 0.4 mg QD", "Metformin 850 mg BID"],
    culpritDrug: "Ditropan XL",
    culpritIndex: 0,
    clue: "Anticholinergic adverse effects in an elderly patient.",
    studyGuide: {
      overview: "Evelyn was prescribed oxybutynin for overactive bladder. She now has classic anticholinergic toxicity, exacerbated by her age and BPH.",
      pharmacology: "Oxybutynin is a tertiary amine anticholinergic that blocks muscarinic receptors, reducing bladder contractions but also causing central effects (confusion) and peripheral effects (dry mouth, constipation, urinary retention).",
      mechanism: "Non‑selective muscarinic antagonism in the CNS and periphery. In elderly patients, blood‑brain barrier penetration and reduced clearance increase toxicity risk.",
      keyTakeaways: [
        "Anticholinergics are on the Beers list for potentially inappropriate medications in older adults.",
        "Mirabegron (β3‑agonist) is a safer alternative for overactive bladder.",
        "Always review medication lists for anticholinergic burden."
      ],
      references: "Beers Criteria, 2019 Update.",
    },
    justificationQuestions: [
      {
        q: "Which receptor subtype does oxybutynin primarily block?",
        options: ["M3 muscarinic", "α1 adrenergic", "β2 adrenergic", "D2 dopaminergic"],
        correct: 0,
        explanation: "M3 receptors mediate detrusor contraction; blockade leads to urinary retention."
      },
      {
        q: "Why are elderly patients more susceptible to central anticholinergic effects?",
        options: ["Increased blood‑brain barrier permeability", "Higher drug absorption", "Lower gastric pH", "Reduced protein binding"],
        correct: 0,
        explanation: "Age‑related changes in the BBB allow more drug penetration, leading to confusion."
      }
    ],
    difficulty: "Hard",
    xp: 80,
    timeLimit: 180,
  },
  // -- 7. Vancomycin – Red Man Syndrome (NEW) --
  {
    id: 7,
    patientName: "Nadia R.",
    patientAge: 34,
    avatarSeed: { skin: "#F5CBA7", hair: "#1A1A2E", shirt: "#E74C3C" },
    symptoms: ["Flushing of face/neck", "Pruritus", "Mild hypotension", "Occurred during IV infusion"],
    medications: ["Vancomycin 1g IV q12h (infused over 60 min)"],
    culpritDrug: "Vancomycin",
    culpritIndex: 0,
    clue: "Rapid infusion of vancomycin causes histamine release (Red Man Syndrome).",
    studyGuide: {
      overview: "Nadia developed flushing and pruritus during a vancomycin infusion. This is a classic infusion‑related reaction, not an allergy.",
      pharmacology: "Vancomycin causes mast cell degranulation and histamine release, which is rate‑dependent. Slowing the infusion prevents the reaction.",
      mechanism: "Histamine release from mast cells → vasodilation, flushing, and hypotension. Not IgE‑mediated.",
      keyTakeaways: [
        "Red Man Syndrome is not a true allergy.",
        "Pre‑treat with antihistamines if rechallenging.",
        "Infuse over ≥60 minutes (or ≥90 min for doses >1g)."
      ],
      references: "Sivagnanam S, Deleu D. Red man syndrome. Crit Care. 2003.",
    },
    justificationQuestions: [
      {
        q: "What is the primary mediator released in Red Man Syndrome?",
        options: ["Histamine", "Leukotrienes", "Prostaglandins", "Cytokines"],
        correct: 0,
        explanation: "Vancomycin triggers histamine release from mast cells in a dose‑ and rate‑dependent manner."
      },
      {
        q: "How can Red Man Syndrome be prevented?",
        options: ["Slowing the infusion rate", "Adding diphenhydramine pre‑medication", "Both A and B", "Using a different antibiotic"],
        correct: 2,
        explanation: "Slower infusion (≥60 min) and pre‑medication with antihistamines can prevent or reduce the reaction."
      }
    ],
    difficulty: "Medium",
    xp: 60,
    timeLimit: 200,
  },
  // -- 8. Gentamicin – Nephrotoxicity (NEW) --
  {
    id: 8,
    patientName: "Ahmed N.",
    patientAge: 72,
    avatarSeed: { skin: "#E8BEAC", hair: "#787878", shirt: "#2C3E50" },
    symptoms: ["Rising creatinine", "Oliguria (early)", "Normal urinalysis"],
    medications: ["Gentamicin 5 mg/kg IV daily (trough level 2.8 µg/mL)"],
    culpritDrug: "Gentamicin",
    culpritIndex: 0,
    clue: "Aminoglycoside accumulation in proximal tubules causes dose‑dependent nephrotoxicity.",
    studyGuide: {
      overview: "Ahmed was started on gentamicin for osteomyelitis. His serum creatinine is rising with a trough level above target.",
      pharmacology: "Gentamicin accumulates in proximal tubular cells, causing cellular injury and decreased glomerular filtration.",
      mechanism: "Dose‑dependent uptake into tubular cells → mitochondrial damage → cell death and impaired reabsorption.",
      keyTakeaways: [
        "Therapeutic drug monitoring (trough levels) is essential.",
        "Extended‑interval dosing reduces nephrotoxicity.",
        "Avoid concurrent nephrotoxic agents (NSAIDs, contrast)."
      ],
      references: "Mingeot-Leclercq MP, Tulkens PM. Aminoglycosides: nephrotoxicity. Antimicrob Agents Chemother. 1999.",
    },
    justificationQuestions: [
      {
        q: "Which part of the nephron is most affected by aminoglycosides?",
        options: ["Proximal tubule", "Distal tubule", "Collecting duct", "Loop of Henle"],
        correct: 0,
        explanation: "Aminoglycosides accumulate in proximal tubular cells due to megalin‑mediated endocytosis."
      },
      {
        q: "What is the recommended trough target for gentamicin when given once daily?",
        options: ["< 1 µg/mL", "< 2 µg/mL", "2–4 µg/mL", "> 5 µg/mL"],
        correct: 0,
        explanation: "With once‑daily dosing, the trough should be < 1 µg/mL to minimise toxicity."
      }
    ],
    difficulty: "Hard",
    xp: 80,
    timeLimit: 200,
  },
  // -- 9. Ceftriaxone – Hemolytic Anemia (NEW) --
  {
    id: 9,
    patientName: "Zara K.",
    patientAge: 52,
    avatarSeed: { skin: "#FAD7A0", hair: "#4A235A", shirt: "#9B59B6" },
    symptoms: ["Jaundice", "Dark urine", "Fatigue", "Anaemia (Hb 8.2 g/dL)"],
    medications: ["Ceftriaxone 2g IV OD"],
    culpritDrug: "Ceftriaxone",
    culpritIndex: 0,
    clue: "Cephalosporin‑induced immune hemolytic anemia (DAT positive).",
    studyGuide: {
      overview: "Zara developed haemolytic anaemia after 7 days of ceftriaxone. This is a rare immunologic reaction.",
      pharmacology: "Ceftriaxone binds to red blood cell membrane, forming a hapten‑antibody complex that activates complement.",
      mechanism: "Complement‑mediated lysis of RBCs → extravascular and intravascular haemolysis.",
      keyTakeaways: [
        "Immune hemolytic anaemia is rare but serious.",
        "Direct antiglobulin test (DAT) is positive.",
        "Withdraw drug immediately; supportive care."
      ],
      references: "Garratty G. Immune hemolytic anemia associated with drug therapy. Blood Rev. 2010.",
    },
    justificationQuestions: [
      {
        q: "Which test is most characteristic of drug‑induced immune hemolytic anaemia?",
        options: ["Positive DAT (C3d)", "Elevated haptoglobin", "Negative Coombs", "Low serum iron"],
        correct: 0,
        explanation: "DAT (direct Coombs) detects antibodies or complement on RBCs; C3d positivity suggests drug‑mediated immune haemolysis."
      },
      {
        q: "What is the primary treatment for this adverse reaction?",
        options: ["Discontinue the drug", "Corticosteroids", "Blood transfusion", "All of the above"],
        correct: 3,
        explanation: "Stop the offending drug; corticosteroids may be used, and transfusion if severe anaemia."
      }
    ],
    difficulty: "Hard",
    xp: 80,
    timeLimit: 200,
  },
  // -- 10. Ciprofloxacin – Tendon Rupture (NEW) --
  {
    id: 10,
    patientName: "Usman H.",
    patientAge: 44,
    avatarSeed: { skin: "#FDEBD0", hair: "#1C2833", shirt: "#2980B9" },
    symptoms: ["Achilles pain", "Swelling", "Inability to plantarflex foot", "Recent ciprofloxacin"],
    medications: ["Ciprofloxacin 500 mg BID"],
    culpritDrug: "Ciprofloxacin",
    culpritIndex: 0,
    clue: "Fluoroquinolone‑induced tendon damage (type B).",
    studyGuide: {
      overview: "Usman took ciprofloxacin and suffered an Achilles tendon rupture. Fluoroquinolones are a well‑known cause of tendinopathy.",
      pharmacology: "Fluoroquinolones increase matrix metalloproteinase activity and reduce collagen synthesis, weakening tendons.",
      mechanism: "Stimulation of MMP‑2 and MMP‑9 → degradation of extracellular matrix → tendon thinning and rupture.",
      keyTakeaways: [
        "Risk increases with age, corticosteroids, and renal disease.",
        "Avoid fluoroquinolones in patients with history of tendon disorders.",
        "If tendon pain occurs, stop the drug immediately."
      ],
      references: "Alves C, et al. Fluoroquinolone-induced tendon rupture. Br J Clin Pharmacol. 2008.",
    },
    justificationQuestions: [
      {
        q: "Which enzyme is upregulated by fluoroquinolones leading to tendon damage?",
        options: ["Matrix metalloproteinases", "Collagenase", "Elastase", "Hyaluronidase"],
        correct: 0,
        explanation: "MMPs degrade extracellular matrix, weakening the tendon structure."
      },
      {
        q: "What is the preferred alternative antibiotic for a patient with a fluoroquinolone allergy?",
        options: ["Azithromycin", "Cephalexin", "Doxycycline", "All of the above"],
        correct: 3,
        explanation: "Depending on the infection, macrolides, cephalosporins, or tetracyclines may be used."
      }
    ],
    difficulty: "Medium",
    xp: 60,
    timeLimit: 200,
  },
];

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 150;

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────
const FloatingIcon = ({ icon: Icon, style }: { icon: any; style: React.CSSProperties }) => (
  <motion.div
    className="absolute text-blue-400 pointer-events-none z-0 hidden sm:block"
    style={{ ...style, opacity: 0.15 }}
    animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <Icon size={32} />
  </motion.div>
);

const XPBar = ({ xp }: { xp: number }) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const pct = (into / XP_PER_LEVEL) * 100;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">{level}</div>
      <div className="w-24 sm:w-32 md:w-40">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Lv {level}</span>
          <span className="text-[10px] font-bold text-slate-400">{into}/{XP_PER_LEVEL}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
    </div>
  );
};

const ComboBadge = ({ streak }: { streak: number }) => (
  <motion.div
    animate={streak >= 3 ? { scale: [1, 1.15, 1] } : {}}
    transition={{ duration: 0.6, repeat: streak >= 3 ? Infinity : 0, repeatDelay: 0.4 }}
    className="flex items-center gap-1.5 sm:gap-2 bg-rose-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-rose-200/50"
  >
    <Flame className={`text-rose-500 ${streak >= 3 ? "fill-rose-500" : ""}`} size={14} />
    <span className="font-bold text-rose-900 text-xs sm:text-sm">{streak}</span>
  </motion.div>
);

const TimerBar = ({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) => {
  const pct = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));
  const color = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase"><Clock size={13} /> Time Left</span>
        <span className={`text-xs font-black tabular-nums ${pct <= 20 ? "text-rose-600" : "text-slate-500"}`}>{timeLeft}s</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className={`h-full ${color} rounded-full`} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>
    </div>
  );
};

const LevelUpModal = ({ level, onClose }: { level: number; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-xs w-full overflow-hidden">
      <Trophy size={36} className="text-indigo-600 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-slate-900">Level {level}!</h2>
      <p className="text-sm text-slate-500 mt-2">Your diagnostic skills are improving.</p>
      <button onClick={onClose} className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg">Keep Going</button>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, icon: Icon }: { message: string; icon: any }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold">
    <Icon size={16} className="text-amber-400" /> {message}
  </motion.div>
);

// ─── CASE MAP NODE ──────────────────────────────────────────────────────────
const CaseNode = ({
  caseData, index, unlocked, prog, onSelect,
}: {
  caseData: CaseStudy; index: number; unlocked: boolean; prog?: { completed: boolean; stars: number }; onSelect: () => void;
}) => {
  const difficultyColors: Record<string, string> = {
    Easy: "border-emerald-400 text-emerald-600 bg-emerald-50",
    Medium: "border-amber-400 text-amber-600 bg-amber-50",
    Hard: "border-rose-400 text-rose-600 bg-rose-50",
  };
  const col = difficultyColors[caseData.difficulty] || "";
  const alignRight = index % 2 === 1;
  return (
    <div className={`relative z-10 flex w-full ${alignRight ? "justify-end pr-2 sm:pr-10" : "justify-start pl-2 sm:pl-10"}`}>
      <motion.button whileHover={unlocked ? { scale: 1.05 } : {}} whileTap={unlocked ? { scale: 0.95 } : {}} onClick={onSelect} disabled={!unlocked}
        className={`flex flex-col items-center gap-2 w-24 sm:w-32 ${!unlocked ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 shadow-lg ${unlocked ? col : "border-slate-200"} bg-white`}>
          {unlocked ? (
            <User size={28} className={col.split(" ")[1]} />
          ) : (
            <Lock size={20} className="text-slate-400" />
          )}
          {caseData.difficulty === "Hard" && unlocked && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Hard</span>
          )}
        </div>
        <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{caseData.patientName}</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <Star key={i} size={11} className={i < (prog?.stars || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200"} />
          ))}
        </div>
      </motion.button>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdverseReactionSleuth() {
  const [screen, setScreen] = useState<"map" | "brief" | "lab" | "result">("map");
  const [activeIdx, setActiveIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<Record<number, { completed: boolean; stars: number }>>({});
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showStudyGuide, setShowStudyGuide] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hypothesis, setHypothesis] = useState<number | null>(null);
  const [justifyAnswers, setJustifyAnswers] = useState<number[]>([]);
  const [justifySubmitted, setJustifySubmitted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const currentCase = CASES[activeIdx];
  const isUnlocked = (idx: number) => idx === 0 || !!progress[CASES[idx - 1]?.id]?.completed;

  // ── Auto‑scroll to top on screen changes ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen, showStudyGuide]);

  // ── Timer ──
  useEffect(() => {
    if (screen !== "lab" || !timerActive || timedOut) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setTimerActive(false);
      evaluateCase(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timerIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [screen, timerActive, timeLeft, timedOut]);

  const showToast = useCallback((msg: string, icon: any) => {
    setToast({ message: msg, icon });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const evaluateCase = (isTimeout: boolean) => {
    let stars = 0;
    let correct = false;
    if (!isTimeout) {
      correct = hypothesis === currentCase.culpritIndex && justifyAnswers.every((ans, i) => ans === currentCase.justificationQuestions[i].correct);
      if (correct) stars = hintUsed ? 2 : 3;
      else if (hypothesis === currentCase.culpritIndex) stars = 1;
    }
    const prevLevel = Math.floor(xp / XP_PER_LEVEL);
    const xpGain = correct ? currentCase.xp : 0;
    const newXp = xp + xpGain;
    setXp(newXp);
    setStreak(correct ? s => s + 1 : 0);
    const newLevel = Math.floor(newXp / XP_PER_LEVEL);
    if (newLevel > prevLevel) setTimeout(() => setLevelUpTo(newLevel), 700);
    setProgress(prev => ({ ...prev, [currentCase.id]: { completed: true, stars } }));
    if (correct) showToast("Perfect diagnosis!", Award);
    setTimerActive(false);
    setScreen("result");
  };

  const startCase = (idx: number) => {
    if (!isUnlocked(idx)) return;
    setActiveIdx(idx);
    setScreen("brief");
    setShowStudyGuide(true);
    setHypothesis(null);
    setJustifyAnswers([]);
    setJustifySubmitted(false);
    setHintUsed(false);
    setTimedOut(false);
    setTimeLeft(CASES[idx].timeLimit);
  };

  const beginLab = () => {
    setShowStudyGuide(false);
    setScreen("lab");
    setTimerActive(true);
  };

  const handleSuspect = (index: number) => {
    setHypothesis(index);
  };

  const handleJustify = (qIdx: number, optionIdx: number) => {
    const updated = [...justifyAnswers];
    updated[qIdx] = optionIdx;
    setJustifyAnswers(updated);
  };

  const submitJustification = () => {
    setJustifySubmitted(true);
    evaluateCase(false);
  };

  const backToMap = () => {
    setScreen("map");
    setTimerActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      <FloatingIcon icon={Pill} style={{ top: "15%", left: "5%" }} />
      <FloatingIcon icon={AlertTriangle} style={{ top: "40%", right: "8%" }} />
      <FloatingIcon icon={Shield} style={{ top: "70%", left: "6%" }} />

      <AnimatePresence>{toast && <Toast message={toast.message} icon={toast.icon} />}</AnimatePresence>
      <AnimatePresence>{levelUpTo && <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />}</AnimatePresence>

      {/* Header HUD */}
      <div className="sticky top-0 z-40 pt-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <button onClick={backToMap} className="flex items-center gap-2 shrink-0">
            <Shield className="text-indigo-600" size={22} />
            <span className="font-bold text-slate-900 text-lg hidden sm:block">Adverse Reaction Sleuth</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <XPBar xp={xp} />
            <ComboBadge streak={streak} />
          </div>
        </div>
      </div>

      {/* STUDY GUIDE OVERLAY */}
      <AnimatePresence>
        {showStudyGuide && screen === "brief" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <BookOpen className="text-indigo-600" size={28} />
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Case Study #{currentCase.id} — {currentCase.patientName}</h2>
                  <p className="text-slate-500 text-sm">Adverse Reaction Investigation</p>
                </div>
              </div>
              <div className="flex gap-4 items-center bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <PatientAvatar {...currentCase.avatarSeed} size={64} />
                <div>
                  <p className="font-bold text-slate-800">{currentCase.patientName}</p>
                  <p className="text-sm text-slate-600">Age {currentCase.patientAge} yrs</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-indigo-700"><AlertTriangle size={18} className="inline mr-2" />Clinical Overview</h3>
                  <p className="text-sm text-slate-700 mt-1">{currentCase.studyGuide.overview}</p>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-emerald-700"><Pill size={18} className="inline mr-2" />Pharmacology</h3>
                  <p className="text-sm text-slate-700 mt-1">{currentCase.studyGuide.pharmacology}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <h3 className="text-lg font-extrabold text-rose-700"><AlertTriangle size={18} className="inline mr-2" />Mechanism</h3>
                  <p className="text-sm text-slate-700 mt-1">{currentCase.studyGuide.mechanism}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h3 className="text-lg font-extrabold text-emerald-700"><Star size={18} className="inline mr-2" />Key Takeaways</h3>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-700">
                    {currentCase.studyGuide.keyTakeaways.map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </div>
                <p className="text-xs text-slate-400 italic">Reference: {currentCase.studyGuide.references}</p>
              </div>
              <button onClick={beginLab} className="w-full bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition">
                Begin Investigation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAP SCREEN */}
      {screen === "map" && (
        <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Adverse Reaction Cases</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Identify the culprit drug in each clinical mystery.</p>
          </motion.div>
          <div className="relative flex flex-col gap-10 py-4">
            <div className="absolute left-1/2 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300 -translate-x-1/2 z-0" />
            {CASES.map((c, idx) => (
              <CaseNode key={c.id} caseData={c} index={idx} unlocked={isUnlocked(idx)} prog={progress[c.id]} onSelect={() => startCase(idx)} />
            ))}
          </div>
        </div>
      )}

      {/* BRIEF SCREEN (without study guide) */}
      {screen === "brief" && !showStudyGuide && (
        <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl border p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-4">
              <PatientAvatar {...currentCase.avatarSeed} size={64} />
              <div>
                <h2 className="text-xl font-bold">{currentCase.patientName}</h2>
                <p className="text-sm text-slate-500">Age {currentCase.patientAge} yrs</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 font-serif italic text-amber-900">
              Presenting symptoms: {currentCase.symptoms.join(", ")}
            </div>
            <p className="text-sm text-slate-600">{currentCase.studyGuide.overview}</p>
            <button onClick={beginLab} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">
              Start Investigation
            </button>
          </motion.div>
        </div>
      )}

      {/* LAB SCREEN */}
      {screen === "lab" && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-4 lg:col-span-1 h-fit">
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <TimerBar timeLeft={timeLeft} timeLimit={currentCase.timeLimit} />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
              <PatientAvatar {...currentCase.avatarSeed} size={72} />
              <h3 className="font-bold mt-2">{currentCase.patientName}</h3>
              <p className="text-xs text-slate-500">Age {currentCase.patientAge}</p>
              <div className="mt-3 bg-rose-50 rounded-xl p-3">
                <p className="text-xs font-bold text-rose-600 uppercase">Symptoms</p>
                <ul className="text-xs text-rose-700 list-disc list-inside mt-1">
                  {currentCase.symptoms.map(s => <li key={s}>{s}</li>)}
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Current Medications</p>
              {currentCase.medications.map((med, i) => (
                <div key={med} className={`p-2 rounded-lg mb-1 cursor-pointer border ${hypothesis === i ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:bg-slate-50"}`}
                  onClick={() => handleSuspect(i)}>
                  {med}
                </div>
              ))}
            </div>
            <button onClick={() => setHintUsed(true)} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 w-full text-sm font-semibold text-amber-700">
              <Lightbulb size={16} /> Hint
            </button>
            {hintUsed && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                {currentCase.clue}
              </div>
            )}
          </aside>

          {/* Main area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="text-indigo-600" /> Suspected Drug</h2>
              <p className="text-sm text-slate-600 mt-2">Select the medication most likely responsible for the symptoms.</p>
              {hypothesis !== null && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="font-bold text-indigo-800">You suspect: {currentCase.medications[hypothesis]}</p>
                </div>
              )}
            </div>

            {hypothesis !== null && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-indigo-600" /> Justification</h2>
                <p className="text-sm text-slate-600 mt-2">Answer these questions to support your diagnosis.</p>
                <div className="mt-4 space-y-4">
                  {currentCase.justificationQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="font-semibold text-slate-800">{q.q}</p>
                      <div className="mt-2 space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleJustify(qIdx, optIdx)}
                            disabled={justifySubmitted}
                            className={`w-full text-left p-2 rounded-lg border transition text-sm ${justifyAnswers[qIdx] === optIdx ? "bg-indigo-100 border-indigo-300 font-semibold" : "bg-white border-slate-200 hover:bg-indigo-50"} ${justifySubmitted && optIdx === q.correct ? "border-green-500 bg-green-50" : ""}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {justifySubmitted && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${justifyAnswers[qIdx] === q.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {justifyAnswers[qIdx] === q.correct ? "✅" : "❌"} {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {!justifySubmitted && (
                  <button
                    onClick={submitJustification}
                    disabled={justifyAnswers.length !== currentCase.justificationQuestions.length}
                    className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition">
                    Submit Justification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}
      {screen === "result" && (
        <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${timedOut ? "bg-slate-50 border-slate-200" : progress[currentCase.id]?.stars >= 3 ? "bg-emerald-50 border-emerald-200" : progress[currentCase.id]?.stars >= 1 ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"}`}>
            <div className="flex items-start gap-4">
              <Trophy size={32} className={timedOut ? "text-slate-600" : progress[currentCase.id]?.stars >= 3 ? "text-emerald-600" : "text-amber-600"} />
              <div>
                <h2 className="text-2xl font-black">{timedOut ? "Time Expired" : "Investigation Complete"}</h2>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map(i => (
                    <Star key={i} size={20} className={i < (progress[currentCase.id]?.stars || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300 fill-slate-200"} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {timedOut ? "You ran out of time." :
                   hypothesis === currentCase.culpritIndex ? `Correct culprit: ${currentCase.culpritDrug}` : `Incorrect; the culprit was ${currentCase.culpritDrug}.`}
                </p>
                {progress[currentCase.id]?.stars > 0 && (
                  <p className="text-xs font-bold text-indigo-600 mt-2">+{currentCase.xp} XP</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={backToMap} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 font-bold"><Home size={16} /> Case Map</button>
              {activeIdx + 1 < CASES.length && isUnlocked(activeIdx + 1) && (
                <button onClick={() => startCase(activeIdx + 1)} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl"><ArrowRight size={16} /> Next Case</button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}