"use client";
// app/courses/sem-1/pharmaceutical-biochemistry/mcq/page.tsx
// Self-contained MCQ page — no external data import needed.
// Drop this file and the JSON data files, then update the import path.

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight, BookOpen,
  Trophy, RotateCcw, AlertTriangle, Zap, Layers, ArrowUp,
  ClipboardList, ChevronDown, ChevronUp, Award,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// BIOCHEMISTRY UNIT METADATA  (6 units from biochemistry-data.ts)
// ═══════════════════════════════════════════════════════════════════════════════
const UNITS = [
  { id: "unit1", label: "Unit 1", title: "Intro to Pharma Biochemistry",   emoji: "🔬", gradient: "from-blue-600 to-cyan-400"    },
  { id: "unit2", label: "Unit 2", title: "Carbohydrates",                  emoji: "🍬", gradient: "from-amber-500 to-orange-400" },
  { id: "unit3", label: "Unit 3", title: "Bioenergetics",                  emoji: "⚡", gradient: "from-yellow-500 to-lime-400"  },
  { id: "unit4", label: "Unit 4", title: "Lipids",                         emoji: "🧈", gradient: "from-rose-500 to-pink-400"    },
  { id: "unit5", label: "Unit 5", title: "Vitamins",                       emoji: "💊", gradient: "from-green-500 to-teal-400"   },
  { id: "unit6", label: "Unit 6", title: "Hormones",                       emoji: "🧬", gradient: "from-violet-600 to-purple-400"},
  { id: "all",   label: "All",    title: "All Units",                      emoji: "📚", gradient: "from-blue-600 to-green-400"   },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MCQ DATA  — 30 questions from the JSON provided (Unit 1)
// In production: replace this with dynamic import per unit
// ═══════════════════════════════════════════════════════════════════════════════
type Question = {
  id: number;
  unit: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  reference: string;
};

const ALL_QUESTIONS: Question[] = [
  { id:1, unit:"unit1", question:"Which field serves as the primary bridge between basic biochemistry and clinical pharmacy practice?", options:[{id:"A",text:"Molecular Biology"},{id:"B",text:"Toxicology"},{id:"C",text:"Pharmaceutical Biochemistry"},{id:"D",text:"Pharmacognosy"}], correctAnswer:"C", explanation:"Pharmaceutical biochemistry is the discipline that integrates biochemical principles with pharmaceutical sciences, serving as the essential bridge between fundamental biochemistry and clinical pharmacy practice. It focuses on molecular mechanisms of drug action, drug metabolism, and the biochemical basis of diseases, enabling rational design and use of therapeutics.", reference:"Rodwell VW, et al. Harper's Illustrated Biochemistry, 31st Ed., McGraw-Hill, Chapter 1." },
  { id:2, unit:"unit1", question:"A pharmacy student is studying how a new drug is broken down by the liver. Which core area of pharmaceutical biochemistry is this student directly engaged in?", options:[{id:"A",text:"Pharmacodynamics"},{id:"B",text:"Metabolic biochemistry"},{id:"C",text:"Clinical biochemistry"},{id:"D",text:"Molecular biochemistry"}], correctAnswer:"B", explanation:"Metabolic biochemistry deals with chemical processes and pathways involved in the metabolism of xenobiotics and endogenous compounds. Studying drug breakdown by the liver involves understanding Phase I and Phase II metabolic reactions, cytochrome P450 enzymes, and factors affecting drug metabolism — a core aspect of pharmaceutical biochemistry.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 4." },
  { id:3, unit:"unit1", question:"If a pharmaceutical company is investigating a new compound's effect on signal transduction pathways inside a cell, they are directly studying its:", options:[{id:"A",text:"Toxicological profile"},{id:"B",text:"ADME properties"},{id:"C",text:"Mechanism of action"},{id:"D",text:"Formulation stability"}], correctAnswer:"C", explanation:"The mechanism of action of a drug refers to the specific biochemical interaction through which it produces its pharmacological effects. Investigating signal transduction pathways such as G-protein coupled receptors, kinase cascades, or second messengers helps elucidate how a drug modulates cellular communication and function.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 2." },
  { id:4, unit:"unit1", question:"All of the following are fundamental concepts in pharmaceutical biochemistry EXCEPT:", options:[{id:"A",text:"Metabolism and energy transformations"},{id:"B",text:"The laws of thermodynamics in a closed system"},{id:"C",text:"The flow of genetic information"},{id:"D",text:"The role of enzymes as biological catalysts"}], correctAnswer:"B", explanation:"Pharmaceutical biochemistry focuses on biomolecules and their interactions in living (open) systems. The laws of thermodynamics in a closed system are more relevant to physical chemistry. Core concepts include metabolism, the central dogma, and enzyme catalysis — all operating in open biological systems.", reference:"Rodwell VW, et al. Harper's Illustrated Biochemistry, 31st Ed., Chapter 1." },
  { id:5, unit:"unit1", question:"Dextrose (IV fluids) and cellulose (tablet excipient) are pharmaceutical examples of which class of biomolecules?", options:[{id:"A",text:"Lipids"},{id:"B",text:"Proteins"},{id:"C",text:"Nucleic acids"},{id:"D",text:"Carbohydrates"}], correctAnswer:"D", explanation:"Carbohydrates are polyhydroxy aldehydes or ketones. Dextrose (glucose) is a monosaccharide used in IV fluids for energy and hydration. Cellulose is a polysaccharide used as a tablet binder and disintegrant. Both are carbohydrates — essential biomolecules in pharmacy.", reference:"Lehninger Principles of Biochemistry, 7th Ed., Chapter 7." },
  { id:6, unit:"unit1", question:"A patient is administered a medication that is a monoclonal antibody. This drug is a pharmaceutical preparation of which biomolecule?", options:[{id:"A",text:"Carbohydrate"},{id:"B",text:"Lipid"},{id:"C",text:"Protein"},{id:"D",text:"Nucleic acid"}], correctAnswer:"C", explanation:"Monoclonal antibodies (e.g., trastuzumab, rituximab) are large protein molecules produced by hybridoma or recombinant DNA technology. They are immunoglobulins that specifically bind to target antigens, making them a major class of biopharmaceuticals. Proteins are polymers of amino acids.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 55." },
  { id:7, unit:"unit1", question:"The process of catabolism is best described as:", options:[{id:"A",text:"The synthesis of complex molecules requiring energy."},{id:"B",text:"The breakdown of complex molecules to release energy."},{id:"C",text:"The conversion of genetic information into a protein."},{id:"D",text:"The communication between cells via second messengers."}], correctAnswer:"B", explanation:"Catabolism is the set of metabolic pathways that break down large molecules (carbohydrates, lipids, proteins) into smaller units, often releasing energy as ATP and reducing equivalents (NADH, FADH2). It is the opposite of anabolism. Catabolic processes include glycolysis, beta-oxidation, and proteolysis.", reference:"Rodwell VW, et al. Harper's Illustrated Biochemistry, 31st Ed., Chapter 8." },
  { id:8, unit:"unit1", question:"A researcher is studying the Michaelis-Menten kinetics of a new drug candidate. This study is crucial for understanding the drug's interaction with its target, which is most likely a(n):", options:[{id:"A",text:"Gene"},{id:"B",text:"Enzyme"},{id:"C",text:"Lipid bilayer"},{id:"D",text:"Second messenger"}], correctAnswer:"B", explanation:"Michaelis-Menten kinetics describes the rate of enzyme-catalyzed reactions as a function of substrate concentration. Key parameters include Km (Michaelis constant) and Vmax (maximum velocity). Studying these kinetics helps determine the affinity and efficacy of a drug acting as an enzyme inhibitor or substrate.", reference:"Lehninger Principles of Biochemistry, 7th Ed., Chapter 6." },
  { id:9, unit:"unit1", question:"What is the correct sequence of the central dogma of molecular biology?", options:[{id:"A",text:"RNA → DNA → Protein"},{id:"B",text:"Protein → RNA → DNA"},{id:"C",text:"DNA → RNA → Protein"},{id:"D",text:"DNA → Protein → RNA"}], correctAnswer:"C", explanation:"The central dogma, proposed by Francis Crick, describes the flow of genetic information: DNA is transcribed into RNA, which is then translated into protein. Some viruses have reverse transcription (RNA to DNA), but the classic sequence is DNA → RNA → Protein.", reference:"Rodwell VW, et al. Harper's Illustrated Biochemistry, 31st Ed., Chapter 24." },
  { id:10, unit:"unit1", question:"The identification of HMG-CoA reductase as the key enzyme in cholesterol synthesis is a classic example of which step in drug discovery?", options:[{id:"A",text:"Lead Optimization"},{id:"B",text:"Preclinical Development"},{id:"C",text:"Target Identification and Validation"},{id:"D",text:"High-throughput screening"}], correctAnswer:"C", explanation:"Target identification and validation involve finding a biological molecule that plays a key role in a disease and confirming that modulating it produces a therapeutic effect. HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis, was validated as a target, leading to the development of statins.", reference:"Drug Discovery and Development: Technology in Transition, 3rd Ed., Chapter 3." },
  { id:11, unit:"unit1", question:"A medicinal chemist modifies a drug molecule to increase its binding affinity for a specific receptor while decreasing its affinity for other related receptors. This process is known as:", options:[{id:"A",text:"Target validation"},{id:"B",text:"Lead Optimization"},{id:"C",text:"ADME profiling"},{id:"D",text:"Toxicology assessment"}], correctAnswer:"B", explanation:"Lead optimization is a phase where the chemical structure of a lead compound is modified to enhance its potency, selectivity, pharmacokinetic properties, and reduce toxicity. By improving binding affinity for the desired receptor and reducing off-target interactions, the therapeutic index is improved.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 3." },
  { id:12, unit:"unit1", question:"NSAIDs like ibuprofen work by inhibiting COX enzymes. This classifies them as:", options:[{id:"A",text:"Receptor agonists"},{id:"B",text:"Ion channel modulators"},{id:"C",text:"Enzyme inhibitors"},{id:"D",text:"Nucleic acid intercalators"}], correctAnswer:"C", explanation:"NSAIDs such as ibuprofen, aspirin, and naproxen inhibit cyclooxygenase (COX) enzymes, which convert arachidonic acid to prostaglandins. By inhibiting these enzymes, they reduce inflammation, pain, and fever. They are therefore classified as enzyme inhibitors.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 42." },
  { id:13, unit:"unit1", question:"In enzyme kinetics, the concentration of a drug required to inhibit an enzyme's activity by 50% is represented by which value?", options:[{id:"A",text:"Ki"},{id:"B",text:"Vmax"},{id:"C",text:"Km"},{id:"D",text:"IC50"}], correctAnswer:"D", explanation:"IC50 (half-maximal inhibitory concentration) measures the potency of a substance in inhibiting a specific biological function. In enzyme inhibition studies, it indicates the drug concentration needed to reduce enzyme activity by 50%. Ki is the inhibition constant (affinity), Km is the Michaelis constant, and Vmax is the maximum velocity.", reference:"Copeland RA. Enzymes: A Practical Introduction to Structure, Mechanism, and Data Analysis, 3rd Ed., Chapter 8." },
  { id:14, unit:"unit1", question:"A drug undergoes a metabolic reaction where a methyl group is transferred to it. This reaction is categorized as:", options:[{id:"A",text:"A Phase I oxidation reaction"},{id:"B",text:"A Phase I hydrolysis reaction"},{id:"C",text:"A Phase II conjugation reaction"},{id:"D",text:"A Phase II reduction reaction"}], correctAnswer:"C", explanation:"Phase II drug metabolism involves conjugation reactions that attach a hydrophilic moiety (glucuronic acid, sulfate, methyl group) to the drug or its Phase I metabolite, increasing water solubility. Methylation, catalyzed by methyltransferases, is a Phase II conjugation reaction, though less common than glucuronidation.", reference:"Shargel L, Yu A. Applied Biopharmaceutics & Pharmacokinetics, 8th Ed., Chapter 4." },
  { id:15, unit:"unit1", question:"A patient on warfarin is advised to maintain consistent intake of vitamin K-rich foods. This is because vitamin K can antagonize warfarin's effect, demonstrating a:", options:[{id:"A",text:"Genetic polymorphism"},{id:"B",text:"Drug-drug interaction"},{id:"C",text:"Drug-food interaction"},{id:"D",text:"Toxicological effect"}], correctAnswer:"C", explanation:"Warfarin inhibits vitamin K-dependent carboxylation of clotting factors. Vitamin K from dietary sources (leafy greens) reverses this inhibition, reducing warfarin's anticoagulant effect. Patients are advised to maintain consistent vitamin K intake to avoid INR fluctuations — a classic drug-food interaction.", reference:"Dipiro JT, et al. Pharmacotherapy: A Pathophysiologic Approach, 11th Ed., Chapter 18." },
  { id:16, unit:"unit1", question:"Which of the following is a clinical biomarker used specifically to monitor for drug-induced liver injury?", options:[{id:"A",text:"Blood glucose levels"},{id:"B",text:"Serum creatinine levels"},{id:"C",text:"Cardiac troponin levels"},{id:"D",text:"Liver enzyme (ALT, AST) levels"}], correctAnswer:"D", explanation:"ALT and AST are enzymes released into the bloodstream when hepatocytes are damaged. Elevated levels indicate hepatocellular injury and are key biomarkers for drug-induced liver injury (DILI). Blood glucose monitors diabetes, serum creatinine monitors renal function, and cardiac troponin monitors myocardial damage.", reference:"Clinical Chemistry: Principles, Techniques, and Correlations, 9th Ed., Chapter 22." },
  { id:17, unit:"unit1", question:"Therapeutic Drug Monitoring (TDM) is most critical for drugs that:", options:[{id:"A",text:"Are available over-the-counter."},{id:"B",text:"Have a narrow therapeutic index."},{id:"C",text:"Are taken only once a day."},{id:"D",text:"Are metabolized in the stomach."}], correctAnswer:"B", explanation:"TDM involves measuring drug concentrations in blood to optimize dosing, especially for drugs with a narrow therapeutic index (NTI) — where the effective dose is close to the toxic dose. Examples include digoxin, phenytoin, warfarin, and aminoglycosides. TDM maintains concentrations within the therapeutic window.", reference:"Winter ME. Basic Clinical Pharmacokinetics, 6th Ed., Chapter 1." },
  { id:18, unit:"unit1", question:"A patient with a genetic variant of the TPMT enzyme is at high risk for severe toxicity from standard doses of thiopurine drugs. This is a key concept in:", options:[{id:"A",text:"Formulation science"},{id:"B",text:"Pharmacogenomics"},{id:"C",text:"Nutritional biochemistry"},{id:"D",text:"Toxicology"}], correctAnswer:"B", explanation:"TPMT metabolizes thiopurine drugs. Genetic polymorphisms in the TPMT gene result in reduced enzyme activity, leading to accumulation of toxic metabolites and severe myelosuppression with standard doses. This is a classic example of pharmacogenomics, where genetic variation influences drug response and toxicity.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 7." },
  { id:19, unit:"unit1", question:"N-acetylcysteine (NAC) is used as an antidote for acetaminophen overdose. Its biochemical mechanism of action is to:", options:[{id:"A",text:"Chemically bind to acetaminophen in the stomach."},{id:"B",text:"Inhibit the CYP450 enzyme that creates the toxic metabolite."},{id:"C",text:"Replenish glutathione stores in the liver."},{id:"D",text:"Increase the renal excretion of acetaminophen."}], correctAnswer:"C", explanation:"Acetaminophen overdose depletes hepatic glutathione, allowing the toxic metabolite NAPQI to accumulate and cause liver damage. NAC acts as a precursor for glutathione synthesis, replenishing glutathione stores and enabling detoxification of NAPQI. It is most effective when given early.", reference:"Goldfrank's Toxicologic Emergencies, 11th Ed., Chapter 36." },
  { id:20, unit:"unit1", question:"The BCS categorizes drugs based on their solubility and permeability, which are fundamentally determined by their:", options:[{id:"A",text:"Price and market availability"},{id:"B",text:"Biochemical interactions with excipients"},{id:"C",text:"Interactions with food"},{id:"D",text:"Molecular properties"}], correctAnswer:"D", explanation:"The Biopharmaceutics Classification System (BCS) classifies drugs into four classes based on aqueous solubility and intestinal permeability, which are intrinsic properties determined by molecular structure — hydrophilicity/lipophilicity, ionization state, and molecular size. These properties influence absorption and bioavailability.", reference:"Amidon GL, et al. Pharm Res. 1995;12(3):413-420." },
  { id:21, unit:"unit1", question:"A new drug candidate is found to significantly induce the activity of CYP3A4 enzymes. A likely consequence of this is:", options:[{id:"A",text:"Increased toxicity of drugs metabolized by CYP3A4."},{id:"B",text:"Decreased plasma concentrations of other drugs metabolized by CYP3A4."},{id:"C",text:"Increased binding of the drug to plasma proteins."},{id:"D",text:"Decreased absorption of the drug from the gut."}], correctAnswer:"B", explanation:"CYP3A4 enzyme induction increases its activity, leading to faster metabolism of substrates and lower plasma concentrations of co-administered drugs metabolized by CYP3A4, potentially reducing their efficacy. For example, rifampin induces CYP3A4 and can decrease levels of oral contraceptives.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 4." },
  { id:22, unit:"unit1", question:"Herceptin (trastuzumab) is effective only in breast cancer patients who overexpress the HER2 protein. This is a prime example of:", options:[{id:"A",text:"A broad-spectrum antibiotic approach"},{id:"B",text:"Personalized medicine based on a biochemical marker"},{id:"C",text:"A standard nutritional intervention"},{id:"D",text:"A random clinical trial outcome"}], correctAnswer:"B", explanation:"Trastuzumab targets the HER2 receptor, overexpressed in ~20% of breast cancers. Its use is restricted to HER2-positive patients determined by IHC or FISH. This is personalized medicine — where a biochemical marker guides therapy to maximize efficacy and minimize unnecessary treatment.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 55." },
  { id:23, unit:"unit1", question:"Grapefruit juice is known to inhibit intestinal CYP3A4. What is the biochemical consequence on a patient taking felodipine, which is metabolized by CYP3A4?", options:[{id:"A",text:"Decreased drug absorption"},{id:"B",text:"Increased drug metabolism, leading to sub-therapeutic levels"},{id:"C",text:"Decreased drug metabolism, leading to higher blood levels"},{id:"D",text:"No effect on the drug's pharmacokinetics"}], correctAnswer:"C", explanation:"Grapefruit juice contains furanocoumarins that irreversibly inhibit intestinal CYP3A4, reducing the first-pass metabolism of drugs like felodipine. This leads to increased oral bioavailability and higher plasma concentrations, potentially causing toxicity (e.g., hypotension). A well-known drug-food interaction.", reference:"Bailey DG, et al. Br J Clin Pharmacol. 1998;46(2):101-110." },
  { id:24, unit:"unit1", question:"The biochemical principle of chelation therapy for heavy metal poisoning relies on:", options:[{id:"A",text:"Enzymes that oxidize the heavy metal"},{id:"B",text:"Antibodies that bind to the heavy metal"},{id:"C",text:"Compounds that form stable complexes with the metal ion"},{id:"D",text:"Induction of diuresis to flush out the metal"}], correctAnswer:"C", explanation:"Chelation therapy uses chelating agents (EDTA, dimercaprol, succimer) with multiple donor atoms that form stable, water-soluble complexes with toxic heavy metals (lead, mercury, arsenic). These complexes are then excreted via urine. The principle is based on coordination chemistry.", reference:"Goldfrank's Toxicologic Emergencies, 11th Ed., Chapter 24." },
  { id:25, unit:"unit1", question:"In drug development, biomarkers used as 'surrogate endpoints' in clinical trials are most valuable because they:", options:[{id:"A",text:"Can replace all other forms of safety monitoring."},{id:"B",text:"Can predict a clinical benefit or harm much earlier or more easily."},{id:"C",text:"Are always cheaper to measure than actual clinical outcomes."},{id:"D",text:"Guarantee the final approval of the drug by regulators."}], correctAnswer:"B", explanation:"Surrogate endpoints (blood pressure, cholesterol levels, viral load) substitute for direct measures of clinical benefit in clinical trials. They are valuable because they can be measured earlier, more easily, and with smaller sample sizes, allowing faster drug development. They must be validated to reliably predict clinical outcomes.", reference:"FDA Guidance: Surrogate Endpoint Resources for Drug and Biologic Development." },
  { id:26, unit:"unit1", question:"A researcher is studying a drug that blocks the breakdown of cAMP in a cell. This drug is directly affecting a:", options:[{id:"A",text:"Hormone receptor"},{id:"B",text:"Ion channel"},{id:"C",text:"Phase I metabolic enzyme"},{id:"D",text:"Second messenger system"}], correctAnswer:"D", explanation:"Cyclic AMP (cAMP) is a second messenger mediating cellular responses to hormones and neurotransmitters. It is synthesized by adenylyl cyclase and degraded by phosphodiesterases. A drug blocking cAMP breakdown inhibits phosphodiesterase, prolonging cAMP signaling — directly affecting the second messenger system.", reference:"Lehninger Principles of Biochemistry, 7th Ed., Chapter 12." },
  { id:27, unit:"unit1", question:"If a drug is a non-competitive inhibitor of an enzyme, how would increasing the substrate concentration affect the inhibition?", options:[{id:"A",text:"It would completely reverse the inhibition."},{id:"B",text:"It would have no effect on the level of inhibition."},{id:"C",text:"It would increase the inhibitory effect of the drug."},{id:"D",text:"It would change the inhibition to become competitive."}], correctAnswer:"B", explanation:"Non-competitive inhibitors bind to an allosteric site, reducing catalytic activity regardless of substrate concentration. They do not compete with substrate for the active site, so increasing substrate concentration does not overcome the inhibition. Vmax decreases while Km remains unchanged.", reference:"Lehninger Principles of Biochemistry, 7th Ed., Chapter 6." },
  { id:28, unit:"unit1", question:"A patient is a 'poor metabolizer' for CYP2D6. They would likely experience ______ from a standard dose of codeine, which is a prodrug activated by CYP2D6.", options:[{id:"A",text:"Increased efficacy and toxicity"},{id:"B",text:"Decreased analgesic effect"},{id:"C",text:"No change in drug effect"},{id:"D",text:"A faster onset of action"}], correctAnswer:"B", explanation:"Codeine requires O-demethylation by CYP2D6 to morphine for its analgesic effect. Poor metabolizers have reduced CYP2D6 activity, leading to lower morphine production and diminished pain relief. Ultrarapid metabolizers may experience toxicity. A pharmacogenomic phenomenon.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 7." },
  { id:29, unit:"unit1", question:"The rational design of ACE inhibitors, such as captopril, was directly guided by knowledge of the enzyme's:", options:[{id:"A",text:"Gene sequence on the chromosome"},{id:"B",text:"Role in protein synthesis"},{id:"C",text:"Active site structure and natural substrate"},{id:"D",text:"Rate of transcription in kidney cells"}], correctAnswer:"C", explanation:"Captopril development was based on the active site structure of ACE and its natural substrate, angiotensin I. Researchers designed a molecule mimicking the substrate's peptide sequence with a sulfhydryl group that binds the zinc ion in the active site — a classic example of rational drug design.", reference:"Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 30." },
  { id:30, unit:"unit1", question:"A key difference between Phase I and Phase II drug metabolism is that Phase II reactions:", options:[{id:"A",text:"Almost always result in a significant increase in the drug's water solubility."},{id:"B",text:"Are exclusively carried out by CYP450 enzymes in the liver."},{id:"C",text:"Always inactivate a drug, while Phase I reactions always activate prodrugs."},{id:"D",text:"Occur only in the intestines, while Phase I occurs only in the liver."}], correctAnswer:"A", explanation:"Phase II conjugation reactions (glucuronidation, sulfation, methylation) attach a large hydrophilic moiety, significantly increasing water solubility and facilitating renal or biliary excretion. Phase I reactions introduce/expose functional groups, increasing polarity but not always dramatically. Phase II uses transferases, not solely CYP450.", reference:"Shargel L, Yu A. Applied Biopharmaceutics & Pharmacokinetics, 8th Ed., Chapter 4." },
];

// ═══════════════════════════════════════════════════════════════════════════════
// BG ICONS
// ═══════════════════════════════════════════════════════════════════════════════
const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const GRAD = "from-blue-600 to-green-400";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+  Distinction",   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "🏆" };
  if (pct >= 80) return { label: "A  Excellent",       color: "text-green-700",   bg: "bg-green-50 border-green-200",     emoji: "🥇" };
  if (pct >= 70) return { label: "B  Good",            color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       emoji: "🎯" };
  if (pct >= 60) return { label: "C  Satisfactory",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     emoji: "📖" };
  if (pct >= 50) return { label: "D  Pass",            color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",   emoji: "✅" };
  return               { label: "F  Needs Revision",   color: "text-red-700",     bg: "bg-red-50 border-red-200",         emoji: "📚" };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function BiochemMCQPage() {
  // ── Filters ─────────────────────────────────────────────────────────────────
  const [activeUnit, setActiveUnit] = useState<string>("unit1");

  const questions = useMemo(() =>
    activeUnit === "all"
      ? ALL_QUESTIONS
      : ALL_QUESTIONS.filter(q => q.unit === activeUnit),
    [activeUnit]
  );

  // ── Quiz state ───────────────────────────────────────────────────────────────
  const [answers,   setAnswers]   = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Reset when unit changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setExpandedExplanations(new Set());
  }, [activeUnit]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!submitted) return null;
    const answered = Object.keys(answers).length;
    const correct  = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const wrong    = answered - correct;
    const skipped  = questions.length - answered;
    const pct      = Math.round((correct / questions.length) * 100);
    return { answered, correct, wrong, skipped, pct, total: questions.length };
  }, [submitted, answers, questions]);

  const answeredCount  = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSelect = (qId: number, optId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setExpandedExplanations(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExplanation = (qId: number) => {
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const activeUnitMeta = UNITS.find(u => u.id === activeUnit) ?? UNITS[0];

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-gray-50 relative overflow-x-hidden" ref={topRef}>

      {/* BG icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO ══ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-4 opacity-[0.08] pointer-events-none hidden sm:block">
          <ClipboardList size={120} className="text-white" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/courses" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/courses/sem-1/pharmaceutical-biochemistry" className="hover:text-white transition">
              Pharmaceutical Biochemistry
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">MCQ Practice</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" /> Semester 1 · MCQ Practice
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Pharmaceutical Biochemistry
            <span className="block text-green-200 mt-1">MCQ Practice</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mb-6">
            {questions.length} questions · Select your answers · Submit to see detailed stats and explanations for incorrect answers.
          </p>

          {/* Stats row */}
          {!submitted && (
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {[
                { n: questions.length, l: "Questions" },
                { n: answeredCount,    l: "Answered"  },
                { n: unansweredCount,  l: "Remaining" },
              ].map(({ n, l }) => (
                <div key={l} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}

          {submitted && stats && (
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {[
                { n: `${stats.correct}/${stats.total}`, l: "Correct",  col: "text-green-200" },
                { n: String(stats.wrong),               l: "Wrong",    col: "text-red-200"   },
                { n: String(stats.skipped),             l: "Skipped",  col: "text-yellow-200"},
                { n: `${stats.pct}%`,                   l: "Score",    col: "text-white"     },
              ].map(({ n, l, col }) => (
                <div key={l} className="text-center">
                  <div className={`text-2xl sm:text-3xl font-extrabold leading-none ${col}`}>{n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Unit filter tabs ── */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {UNITS.map(u => (
              <button key={u.id} onClick={() => setActiveUnit(u.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
                  activeUnit === u.id
                    ? `bg-gradient-to-r ${u.gradient} text-white shadow-md`
                    : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}>
                <span>{u.emoji}</span>
                <span>{u.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Results banner (after submit) ── */}
        {submitted && stats && (() => {
          const grade = getGrade(stats.pct);
          return (
            <div className={`mb-6 relative rounded-2xl border ${grade.bg} overflow-hidden p-4 sm:p-6`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-4xl sm:text-5xl shrink-0">{grade.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg sm:text-2xl font-extrabold ${grade.color}`}>{grade.label}</p>
                  <p className="text-gray-600 text-sm mt-0.5">
                    You scored <strong>{stats.correct}</strong> out of <strong>{stats.total}</strong> questions correctly ({stats.pct}%).
                    {stats.skipped > 0 && <span className="text-amber-600"> · {stats.skipped} question{stats.skipped > 1 ? "s" : ""} left unanswered.</span>}
                  </p>
                  {/* Score bar */}
                  <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${GRAD}`}
                      style={{ width: `${stats.pct}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs font-semibold text-gray-500">
                    <span className="text-green-600">✓ {stats.correct} Correct</span>
                    <span className="text-red-500">✗ {stats.wrong} Wrong</span>
                    {stats.skipped > 0 && <span className="text-amber-500">— {stats.skipped} Skipped</span>}
                  </div>
                </div>
                <button onClick={handleReset}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 transition-all`}>
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Question list ── */}
        <div className="space-y-4 sm:space-y-5">
          {questions.map((q, qIdx) => {
            const userAnswer   = answers[q.id];
            const isCorrect    = submitted && userAnswer === q.correctAnswer;
            const isWrong      = submitted && userAnswer !== undefined && userAnswer !== q.correctAnswer;
            const isSkipped    = submitted && userAnswer === undefined;
            const showExp      = submitted && (isWrong || isSkipped) && expandedExplanations.has(q.id);

            let cardBorder = "border-gray-200";
            let cardBg     = "bg-white";
            if (submitted) {
              if (isCorrect) { cardBorder = "border-green-300";  cardBg = "bg-green-50/40";   }
              if (isWrong)   { cardBorder = "border-red-300";    cardBg = "bg-red-50/30";     }
              if (isSkipped) { cardBorder = "border-amber-300";  cardBg = "bg-amber-50/30";   }
            }

            return (
              <div key={q.id}
                className={`relative rounded-2xl border-2 ${cardBorder} ${cardBg} overflow-hidden shadow-sm transition-all duration-300`}>
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${activeUnitMeta.gradient}`} />

                <div className="p-4 sm:p-6">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                      submitted && isCorrect ? "bg-green-100 text-green-700 border border-green-200" :
                      submitted && isWrong   ? "bg-red-100 text-red-700 border border-red-200" :
                      submitted && isSkipped ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      `bg-gradient-to-br ${activeUnitMeta.gradient} text-white`
                    }`}>
                      {submitted && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                       submitted && isWrong   ? <XCircle    className="w-4 h-4" /> :
                       submitted && isSkipped ? <AlertTriangle className="w-3.5 h-3.5" /> :
                       qIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Q{qIdx + 1} of {questions.length}
                        </span>
                        {submitted && isCorrect && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Correct</span>}
                        {submitted && isWrong   && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Incorrect</span>}
                        {submitted && isSkipped && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Unanswered</span>}
                      </div>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: q.question }} />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {q.options.map(opt => {
                      const isSelected  = userAnswer === opt.id;
                      const isCorrectOpt = opt.id === q.correctAnswer;

                      let cls = "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer";
                      if (!submitted && isSelected) cls = "border-blue-500 bg-blue-50 text-blue-800 cursor-pointer";
                      if (submitted) {
                        if (isCorrectOpt)            cls = "border-green-400 bg-green-50 text-green-900 cursor-default";
                        else if (isSelected)         cls = "border-red-400 bg-red-50 text-red-900 cursor-default";
                        else                         cls = "border-gray-100 bg-gray-50/50 text-gray-400 cursor-default opacity-60";
                      }

                      return (
                        <button key={opt.id} onClick={() => handleSelect(q.id, opt.id)} disabled={submitted}
                          className={`flex items-center gap-3 w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-150 ${cls}`}>
                          {/* Option letter badge */}
                          <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border transition-all ${
                            !submitted && isSelected   ? "bg-blue-600 text-white border-blue-600" :
                            submitted && isCorrectOpt  ? "bg-green-500 text-white border-green-500" :
                            submitted && isSelected    ? "bg-red-500 text-white border-red-500" :
                            "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {submitted && isCorrectOpt ? "✓" :
                             submitted && isSelected   ? "✗" :
                             opt.id}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-snug flex-1"
                            dangerouslySetInnerHTML={{ __html: opt.text }} />
                          {submitted && isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          {submitted && isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation toggle — only for wrong or skipped */}
                  {submitted && (isWrong || isSkipped) && (
                    <div className="mt-4">
                      <button onClick={() => toggleExplanation(q.id)}
                        className={`flex items-center gap-2 text-xs font-extrabold px-3 py-2 rounded-xl transition-all ${
                          expandedExplanations.has(q.id)
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                        }`}>
                        <BookOpen className="w-3.5 h-3.5" />
                        {expandedExplanations.has(q.id) ? "Hide Explanation" : "Show Explanation & Reference"}
                        {expandedExplanations.has(q.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showExp && (
                        <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 sm:p-4 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Correct Answer</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-green-100 text-green-700 border border-green-200">
                              {q.correctAnswer} — {q.options.find(o => o.id === q.correctAnswer)?.text}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Explanation</p>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                          </div>
                          <div className="pt-2 border-t border-indigo-100">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Reference</p>
                            <p className="text-xs text-gray-500 italic">{q.reference}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correct answer — expand for correct ones too (optional, less prominent) */}
                  {submitted && isCorrect && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Submit / Retry button ── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!submitted ? (
            <>
              {unansweredCount > 0 && (
                <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {unansweredCount} question{unansweredCount > 1 ? "s" : ""} unanswered — you can still submit
                </p>
              )}
              <button onClick={handleSubmit} disabled={answeredCount === 0}
                className={`inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:pointer-events-none`}>
                <Trophy className="w-5 h-5" /> Submit & See Results
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button onClick={handleReset}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all`}>
                <RotateCcw className="w-5 h-5" /> Retake Quiz
              </button>
              <Link href="/courses/sem-1/pharmaceutical-biochemistry"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all">
                <BookOpen className="w-4 h-4" /> Back to Study Notes
              </Link>
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div className={`mt-10 relative rounded-2xl bg-gradient-to-r ${GRAD} overflow-hidden p-5 sm:p-8`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Want to study more?</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">Return to unit notes and review before retaking the quiz.</p>
            </div>
            <Link href="/courses/sem-1/pharmaceutical-biochemistry"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
              <BookOpen className="w-4 h-4" /> Study Notes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${GRAD} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}