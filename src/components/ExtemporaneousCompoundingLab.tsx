"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Activity,
  Download,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertCircle,
  Scale,
  Package,
  ClipboardList,
  Pill,
  Tag,
} from "lucide-react";
import jsPDF from "jspdf";

// ============================================================
// DATA MODELS & PRESETS
// ============================================================

interface Ingredient {
  id: string;
  name: string;
  role: string; // e.g. "Active", "Base", "Vehicle"
  target: number; // grams (or mL if unit is mL)
  unit: "g" | "mL";
}

interface Formulation {
  name: string;
  dosageForm: "ointment" | "capsule" | "gel" | "suppository";
  strengthLabel: string;
  batchLabel: string;
  ingredients: Ingredient[];
  mixingMethod: "Geometric Dilution" | "Trituration" | "Levigation";
  container: "Ointment Jar" | "Amber Capsule Bottle" | "Gel Jar" | "Suppository Mould Strip";
  beyondUseDays: number;
  storage: string;
}

const FORMULATIONS: Formulation[] = [
  {
    name: "Hydrocortisone Ointment 1%",
    dosageForm: "ointment",
    strengthLabel: "1% w/w",
    batchLabel: "30 g",
    ingredients: [
      { id: "hc", name: "Hydrocortisone powder", role: "Active", target: 0.3, unit: "g" },
      { id: "petro", name: "White petroleum jelly", role: "Base", target: 29.7, unit: "g" },
    ],
    mixingMethod: "Levigation",
    container: "Ointment Jar",
    beyondUseDays: 90,
    storage: "Store at room temperature. Protect from heat.",
  },
  {
    name: "Progesterone Capsules 100 mg",
    dosageForm: "capsule",
    strengthLabel: "100 mg / capsule",
    batchLabel: "30 capsules",
    ingredients: [
      { id: "prog", name: "Progesterone powder", role: "Active", target: 3.0, unit: "g" },
      { id: "lact", name: "Lactose monohydrate", role: "Filler", target: 6.0, unit: "g" },
    ],
    mixingMethod: "Geometric Dilution",
    container: "Amber Capsule Bottle",
    beyondUseDays: 180,
    storage: "Store in a tight, light-resistant container at room temperature.",
  },
  {
    name: "Chlorhexidine Gluconate Gel 2%",
    dosageForm: "gel",
    strengthLabel: "2% w/w",
    batchLabel: "60 g",
    ingredients: [
      { id: "chx", name: "Chlorhexidine gluconate 20% solution", role: "Active", target: 6.0, unit: "mL" },
      { id: "carbo", name: "Carbopol gel base", role: "Vehicle", target: 54.0, unit: "g" },
    ],
    mixingMethod: "Levigation",
    container: "Gel Jar",
    beyondUseDays: 60,
    storage: "Refrigerate between 2–8°C. Do not freeze.",
  },
  {
    name: "Diclofenac Sodium Suppositories 50 mg",
    dosageForm: "suppository",
    strengthLabel: "50 mg / suppository",
    batchLabel: "10 suppositories",
    ingredients: [
      { id: "dic", name: "Diclofenac sodium powder", role: "Active", target: 0.5, unit: "g" },
      { id: "wit", name: "Witepsol suppository base", role: "Base", target: 19.5, unit: "g" },
    ],
    mixingMethod: "Trituration",
    container: "Suppository Mould Strip",
    beyondUseDays: 180,
    storage: "Refrigerate between 2–8°C.",
  },
];

const TUTORIAL_SLIDES = [
  {
    emoji: "⚗️",
    title: "1. What Is Pharmaceutical Compounding?",
    text: "Compounding is the preparation of a personalised medication for a patient who cannot use a standard commercial product — for example, a different strength, a dye-free formula, or a dosage form a patient can actually swallow or apply.\n\nIt is one of the oldest pharmacy skills, and one of the highest-stakes: every gram matters.",
  },
  {
    emoji: "📐",
    title: "2. Calculations Before You Weigh",
    text: "Before touching a balance, the compounder must confirm:\n\n1. The **quantity** of each ingredient needed for the batch size.\n2. Any **displacement value** adjustments for suppositories or capsules.\n3. Whether the **potency** of the active ingredient (assay %) requires a correction factor.\n\nGetting this step wrong propagates through the entire preparation.",
  },
  {
    emoji: "🥣",
    title: "3. Mixing Techniques",
    text: "**Geometric dilution** — mixing a small, potent quantity of drug with progressively larger, equal portions of diluent so it's evenly distributed.\n\n**Trituration** — reducing particle size by grinding powders in a mortar, improving uniformity and dissolution.\n\n**Levigation** — wetting a powder with a small amount of vehicle to form a smooth paste before incorporating it into an ointment or gel base.",
  },
  {
    emoji: "🏷️",
    title: "4. Packaging, Labelling & Documentation",
    text: "A compounded product is only as safe as its label and record.\n\nEvery preparation needs: the correct **container** for its dosage form, a **label** with drug, strength, storage conditions and beyond-use date, and a **compounding record** documenting exactly what was done — this is what protects the patient and the pharmacist.",
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "Why is compounding considered high-stakes even for simple preparations?",
    options: [
      "It always requires sterile technique",
      "Small errors in weighing or calculation directly affect patient dosing",
      "It is rarely reviewed by a pharmacist",
      "The equipment is difficult to clean",
    ],
    ans: 1,
  },
  {
    q: "Which technique involves mixing a potent powder with successively larger, equal portions of diluent?",
    options: ["Levigation", "Trituration", "Geometric dilution", "Fusion moulding"],
    ans: 2,
  },
  {
    q: "Levigation is most useful when incorporating a powder into which dosage form?",
    options: ["A hard gelatin capsule", "An ointment or gel base", "An oral solution", "A suppository mould"],
    ans: 1,
  },
  {
    q: "What must every compounding label include, at minimum?",
    options: [
      "Just the drug name",
      "Only the pharmacist's initials",
      "Drug name, strength, storage instructions, and beyond-use date",
      "The wholesale cost of the ingredients",
    ],
    ans: 2,
  },
];

const CONTAINER_OPTIONS: Formulation["container"][] = [
  "Ointment Jar",
  "Amber Capsule Bottle",
  "Gel Jar",
  "Suppository Mould Strip",
];

const METHOD_OPTIONS: Formulation["mixingMethod"][] = [
  "Geometric Dilution",
  "Trituration",
  "Levigation",
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CompoundingLab() {
  const [phase, setPhase] = useState<"tutorial" | "quiz" | "simulation">("tutorial");

  // Tutorial & Quiz
  const [slide, setSlide] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);

  // Sim state
  const [simStep, setSimStep] = useState(1);
  const [formulation, setFormulation] = useState<Formulation | null>(null);

  // Step 2: Weighing
  const [activeIngredientIdx, setActiveIngredientIdx] = useState(0);
  const [spatulaLoaded, setSpatulaLoaded] = useState(false);
  const [currentMass, setCurrentMass] = useState(0);
  const [weighedMasses, setWeighedMasses] = useState<Record<string, number>>({});
  const [weighingComplete, setWeighingComplete] = useState(false);

  // Step 3: Mixing
  const [methodChoice, setMethodChoice] = useState<string | null>(null);
  const [methodAttempts, setMethodAttempts] = useState(0);
  const [mixing, setMixing] = useState(false);
  const [mixed, setMixed] = useState(false);

  // Step 4: Packaging & Labelling
  const [containerChoice, setContainerChoice] = useState<string | null>(null);
  const [containerAttempts, setContainerAttempts] = useState(0);
  const [labelGenerated, setLabelGenerated] = useState(false);

  // Step 5: Documentation
  const [batchNumber] = useState(() => `CMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [checklist, setChecklist] = useState({
    calculations: false,
    ingredients: false,
    appearance: false,
    weight: false,
  });

  // ──────────────── DERIVED ────────────────

  const allChecked = Object.values(checklist).every(Boolean);

  const score = formulation
    ? (weighingComplete ? 20 : 0) +
    (weighingComplete ? 15 : 0) + // volume/measurement accuracy bundled with weighing completion
    (methodAttempts === 1 ? 20 : methodAttempts > 1 ? 12 : 0) +
    (containerAttempts === 1 ? 15 : containerAttempts > 1 ? 8 : 0) +
    (allChecked ? 15 : Math.round(15 * (Object.values(checklist).filter(Boolean).length / 4))) +
    (labelGenerated ? 15 : 0)
    : 0;

  // ──────────────── HANDLERS ────────────────

  const handleQuizAnswer = (idx: number) => {
    if (idx === QUIZ_QUESTIONS[quizStep].ans) {
      setQuizFeedback("correct");
    } else {
      setQuizFeedback("incorrect");
    }
    setTimeout(() => {
      setQuizFeedback(null);
      if (quizStep < QUIZ_QUESTIONS.length - 1) {
        setQuizStep((s) => s + 1);
      } else {
        setPhase("simulation");
      }
    }, 1500);
  };

  const startSimulation = (f: Formulation) => {
    setFormulation(f);
    setSimStep(2);
    setActiveIngredientIdx(0);
    setSpatulaLoaded(false);
    setCurrentMass(0);
    setWeighedMasses({});
    setWeighingComplete(false);
    setMethodChoice(null);
    setMethodAttempts(0);
    setMixing(false);
    setMixed(false);
    setContainerChoice(null);
    setContainerAttempts(0);
    setLabelGenerated(false);
    setChecklist({ calculations: false, ingredients: false, appearance: false, weight: false });
  };

  const handleSpatulaToBalance = () => {
    if (!spatulaLoaded || !formulation) return;
    const target = formulation.ingredients[activeIngredientIdx].target;
    const remaining = target - currentMass;

    let added = 0;
    if (remaining > target * 0.3) added = remaining * (0.4 + Math.random() * 0.2);
    else if (remaining > target * 0.05) added = remaining * (0.3 + Math.random() * 0.2);
    else added = remaining; // final snap

    const newMass = parseFloat((currentMass + added).toFixed(4));
    setCurrentMass(newMass);
    setSpatulaLoaded(false);

    if (newMass >= target - target * 0.01) {
      const ing = formulation.ingredients[activeIngredientIdx];
      setWeighedMasses((prev) => ({ ...prev, [ing.id]: newMass }));
      if (activeIngredientIdx >= formulation.ingredients.length - 1) {
        setTimeout(() => setWeighingComplete(true), 700);
      }
    }
  };

  const nextIngredient = () => {
    setActiveIngredientIdx((i) => i + 1);
    setCurrentMass(0);
  };

  const chooseMethod = (m: string) => {
    if (methodChoice || !formulation) return;
    setMethodAttempts((n) => n + 1);
    if (m === formulation.mixingMethod) {
      setMethodChoice(m);
    } else {
      setMethodChoice("__wrong__");
      setTimeout(() => setMethodChoice(null), 900);
    }
  };

  const runMixing = () => {
    setMixing(true);
    setTimeout(() => {
      setMixing(false);
      setMixed(true);
    }, 1800);
  };

  const chooseContainer = (c: string) => {
    if (containerChoice || !formulation) return;
    setContainerAttempts((n) => n + 1);
    if (c === formulation.container) {
      setContainerChoice(c);
    } else {
      setContainerChoice("__wrong__");
      setTimeout(() => setContainerChoice(null), 900);
    }
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = () => {
    if (!formulation) return;
    const doc = new jsPDF();
    const bud = new Date();
    bud.setDate(bud.getDate() + formulation.beyondUseDays);

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PharmaWallah", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Compounding Record & Assessment Report", 20, 28);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(formulation.name, 20, 55);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 60, 190, 60);

    doc.setFontSize(14);
    doc.text("1. Formulation Details", 20, 75);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 80, 170, 32, "F");
    doc.text(`Batch Number: ${batchNumber}`, 25, 90);
    doc.text(`Strength: ${formulation.strengthLabel}`, 120, 90);
    doc.text(`Batch Size: ${formulation.batchLabel}`, 25, 100);
    doc.text(`Beyond-Use Date: ${bud.toLocaleDateString()}`, 120, 100);
    doc.text(`Mixing Method: ${formulation.mixingMethod}`, 25, 108);

    doc.setFont("helvetica", "bold");
    doc.text("2. Gravimetric Data", 20, 128);
    doc.setFont("helvetica", "normal");
    const ingRowsHeight = 10 + formulation.ingredients.length * 8;
    doc.rect(20, 133, 170, ingRowsHeight);
    let y = 143;
    formulation.ingredients.forEach((ing) => {
      const weighed = weighedMasses[ing.id] ?? 0;
      doc.text(`${ing.name}: ${weighed.toFixed(4)} ${ing.unit}`, 25, y);
      doc.text(`Target: ${ing.target.toFixed(4)} ${ing.unit}`, 120, y);
      y += 8;
    });

    const sec3y = 133 + ingRowsHeight + 15;
    doc.setFont("helvetica", "bold");
    doc.text("3. Packaging & Labelling", 20, sec3y);
    doc.setFont("helvetica", "normal");
    doc.rect(20, sec3y + 5, 170, 25);
    doc.text(`Container Used: ${containerChoice ?? "N/A"}`, 25, sec3y + 15);
    doc.text(`Storage: ${formulation.storage}`, 25, sec3y + 23);

    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("4. Assessment Score Breakdown", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const rows: [string, number][] = [
      ["Accurate weighing (±5%)", weighingComplete ? 20 : 0],
      ["Accurate volume measurement (±5%)", weighingComplete ? 15 : 0],
      ["Correct mixing technique", methodAttempts === 1 ? 20 : methodAttempts > 1 ? 12 : 0],
      ["Correct container & labelling", containerAttempts === 1 ? 15 : containerAttempts > 1 ? 8 : 0],
      ["Documentation completeness", allChecked ? 15 : Math.round(15 * (Object.values(checklist).filter(Boolean).length / 4))],
      ["Final product quality check", labelGenerated ? 15 : 0],
    ];
    let ry = 32;
    rows.forEach(([label, pts]) => {
      doc.text(label, 25, ry);
      doc.text(`${pts} pts`, 165, ry);
      ry += 9;
    });
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(37, 99, 235);
    doc.line(20, ry, 190, ry);
    doc.text(`Total Score: ${score} / 100`, 25, ry + 10);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by PharmaWallah Compounding Lab Simulator", 20, 285);

    doc.save(`PharmaWallah_Compounding_${formulation.name.replace(/\s+/g, "_")}.pdf`);
  };

  // ============================================================
  // SVG ASSETS (adapted from Buffer Lab: bottle, spatula, balance)
  // ============================================================

  const ChemicalBottleSVG = ({ label }: { label: string }) => (
    <svg width="80" height="120" viewBox="0 0 120 180" className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all group-active:scale-95 max-w-[70px] md:max-w-none">
      <path
        d="M20 60 Q20 40 40 40 L80 40 Q100 40 100 60 L100 170 Q100 180 90 180 L30 180 Q20 180 20 170 Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="4"
      />
      <rect x="35" y="10" width="50" height="30" rx="4" fill="#3b82f6" />
      <rect x="45" y="40" width="30" height="10" fill="#e2e8f0" />
      <rect x="25" y="80" width="70" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
      <text x="60" y="105" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
        {label}
      </text>
    </svg>
  );

  const SpatulaSVG = ({ loaded, color }: { loaded: boolean; color: string }) => (
    <svg width="80" height="24" viewBox="0 0 140 40" className="drop-shadow-md">
      <rect x="0" y="15" width="80" height="10" rx="5" fill="#ef4444" />
      <path d="M80 18 L130 18 Q140 20 130 22 L80 22 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
      {loaded && <ellipse cx="120" cy="17" rx="10" ry="4" fill={color} />}
    </svg>
  );

  const BalanceSVG = ({ massLabel, color }: { massLabel: string; color: string }) => (
    <svg width="200" height="180" viewBox="0 0 240 220" className="drop-shadow-xl">
      <rect x="20" y="20" width="200" height="130" fill="#f1f5f9" opacity="0.4" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M10 150 L230 150 L240 210 L0 210 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
      <rect x="60" y="165" width="120" height="30" rx="4" fill="#020617" />
      <text x="120" y="186" textAnchor="middle" fill="#4ade80" fontSize="16" fontFamily="monospace" fontWeight="bold">
        {massLabel}
      </text>
      <ellipse cx="120" cy="110" rx="45" ry="15" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      <rect x="110" y="110" width="20" height="40" fill="#94a3b8" />
      <path d="M75 95 L165 95 L145 110 L95 110 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <ellipse cx="120" cy="100" rx="20" ry="6" fill={color} />
    </svg>
  );

  const MortarPestleSVG = ({ spinning }: { spinning: boolean }) => (
    <svg width="180" height="160" viewBox="0 0 220 200" className="drop-shadow-xl">
      <ellipse cx="110" cy="150" rx="80" ry="20" fill="#e2e8f0" />
      <path d="M40 100 Q40 160 110 165 Q180 160 180 100 L180 90 L40 90 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="4" />
      <ellipse cx="110" cy="90" rx="70" ry="14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
      <ellipse cx="110" cy="92" rx="55" ry="9" fill="#fde68a" opacity="0.85" />
      <g style={{ transformOrigin: "150px 60px" }}>
        <motion.g
          animate={spinning ? { rotate: [0, 25, -15, 20, 0], x: [0, 8, -6, 6, 0] } : { rotate: 0, x: 0 }}
          transition={{ duration: 0.6, repeat: spinning ? Infinity : 0 }}
        >
          <rect x="140" y="15" width="16" height="80" rx="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="148" cy="95" rx="14" ry="10" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        </motion.g>
      </g>
    </svg>
  );

  const OintmentJarSVG = () => (
    <svg width="90" height="90" viewBox="0 0 120 120">
      <rect x="20" y="35" width="80" height="70" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
      <rect x="15" y="20" width="90" height="20" rx="4" fill="#3b82f6" />
      <ellipse cx="60" cy="45" rx="35" ry="6" fill="#e2e8f0" />
    </svg>
  );

  const CapsuleBottleSVG = () => (
    <svg width="90" height="90" viewBox="0 0 120 120">
      <path d="M35 40 L85 40 L90 105 Q90 112 82 112 L38 112 Q30 112 30 105 Z" fill="#7c4a1e" opacity="0.85" stroke="#5c3512" strokeWidth="2" />
      <rect x="30" y="18" width="60" height="22" rx="4" fill="#334155" />
      <ellipse cx="60" cy="40" rx="27" ry="5" fill="#1e293b" opacity="0.4" />
    </svg>
  );

  const GelJarSVG = () => (
    <svg width="90" height="90" viewBox="0 0 120 120">
      <path d="M40 30 L80 30 L85 105 Q85 112 77 112 L43 112 Q35 112 35 105 Z" fill="#bae6fd" opacity="0.8" stroke="#94a3b8" strokeWidth="3" />
      <rect x="38" y="15" width="44" height="18" rx="4" fill="#0ea5e9" />
    </svg>
  );

  const SuppositoryMouldSVG = () => (
    <svg width="90" height="90" viewBox="0 0 120 120">
      <rect x="15" y="45" width="90" height="35" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={30 + i * 16} cy="62" rx="6" ry="11" fill="#fef3c7" stroke="#d4a373" strokeWidth="1.5" />
      ))}
    </svg>
  );

  const containerSVG = (c: string) => {
    switch (c) {
      case "Ointment Jar":
        return <OintmentJarSVG />;
      case "Amber Capsule Bottle":
        return <CapsuleBottleSVG />;
      case "Gel Jar":
        return <GelJarSVG />;
      case "Suppository Mould Strip":
        return <SuppositoryMouldSVG />;
      default:
        return null;
    }
  };

  // ============================================================
  // RENDER HELPERS — Tutorial & Quiz (same shell as Buffer Lab)
  // ============================================================

  const renderTutorial = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto"
    >
      <div className="text-center mb-6">
        <div className="text-5xl md:text-6xl mb-4">{TUTORIAL_SLIDES[slide].emoji}</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{TUTORIAL_SLIDES[slide].title}</h2>
      </div>
      <div className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
        {TUTORIAL_SLIDES[slide].text.split("\n").map((line, i) => (
          <p key={i} className="mb-2">
            {line.includes("**") ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            ) : (
              line
            )}
          </p>
        ))}
      </div>
      <div className="flex justify-between items-center border-t pt-4 md:pt-6">
        <button
          onClick={() => setSlide((s) => Math.max(0, s - 1))}
          disabled={slide === 0}
          className="p-2 md:p-3 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex space-x-2">
          {TUTORIAL_SLIDES.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${i === slide ? "bg-blue-600" : "bg-gray-200"}`} />
          ))}
        </div>
        {slide === TUTORIAL_SLIDES.length - 1 ? (
          <button
            onClick={() => setPhase("quiz")}
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
          >
            Start Quiz
          </button>
        ) : (
          <button
            onClick={() => setSlide((s) => Math.min(TUTORIAL_SLIDES.length - 1, s + 1))}
            className="p-2 md:p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderQuiz = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto"
    >
      <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Knowledge Check</h2>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Q {quizStep + 1} / {QUIZ_QUESTIONS.length}
        </span>
      </div>
      <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 font-medium">{QUIZ_QUESTIONS[quizStep].q}</p>
      <div className="space-y-3 md:space-y-4">
        {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => {
          const isCorrectAns = i === QUIZ_QUESTIONS[quizStep].ans;
          let btnClass = "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
          if (quizFeedback === "correct" && isCorrectAns) btnClass = "bg-green-100 border-green-500 text-green-800";
          if (quizFeedback === "incorrect" && !isCorrectAns) btnClass = "bg-red-50 border-red-200 text-red-500 opacity-50";
          if (quizFeedback === "incorrect" && isCorrectAns) btnClass = "bg-green-50 border-green-300 text-green-700";
          return (
            <button
              key={i}
              onClick={() => handleQuizAnswer(i)}
              disabled={quizFeedback !== null}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 text-sm md:text-base ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-6 h-12">
        <AnimatePresence>
          {quizFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-xl flex items-center justify-center font-bold text-sm ${quizFeedback === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {quizFeedback === "correct" ? <CheckCircle2 className="mr-2" size={18} /> : <AlertCircle className="mr-2" size={18} />}
              <span>{quizFeedback === "correct" ? "Correct!" : "Not quite."}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  // ============================================================
  // RENDER — Sim Step 1: Select Compound
  // ============================================================

  const dosageIcon = (form: Formulation["dosageForm"]) => {
    switch (form) {
      case "ointment":
        return <FlaskConical size={32} className="md:w-10 md:h-10" />;
      case "capsule":
        return <Pill size={32} className="md:w-10 md:h-10" />;
      case "gel":
        return <Activity size={32} className="md:w-10 md:h-10" />;
      case "suppository":
        return <Package size={32} className="md:w-10 md:h-10" />;
    }
  };

  const renderSimStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Select a Compound</h2>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Choose a formulation to prepare in the virtual compounding lab.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {FORMULATIONS.map((f, i) => (
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            key={i}
            onClick={() => startSimulation(f)}
            className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-xl transition-all group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-green-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
              {dosageIcon(f.dosageForm)}
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">{f.name}</h3>
            <div className="w-full h-px bg-gray-100 my-3 md:my-4" />
            <div className="text-xs md:text-sm text-gray-600 space-y-2 w-full text-left bg-gray-50 p-3 rounded-lg">
              <p className="flex justify-between">
                <span>Strength:</span> <strong className="text-blue-600">{f.strengthLabel}</strong>
              </p>
              <p className="flex justify-between">
                <span>Batch:</span> <strong>{f.batchLabel}</strong>
              </p>
              <p className="flex justify-between">
                <span>Form:</span> <strong className="capitalize">{f.dosageForm}</strong>
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // RENDER — Sim Step 2: Weighing
  // ============================================================

  const renderSimStep2 = () => {
    if (!formulation) return null;
    const ing = formulation.ingredients[activeIngredientIdx];
    const color = activeIngredientIdx === 0 ? "#fcd34d" : "#bae6fd";

    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
          <Scale className="mr-3 text-blue-600" size={24} /> Ingredient Preparation
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          <div className="lg:col-span-8 relative h-[380px] md:h-[420px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
            <div className="w-full h-full relative flex flex-col items-center justify-center">
              <div
                className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 cursor-pointer group z-10"
                onClick={() => setSpatulaLoaded(true)}
              >
                <ChemicalBottleSVG label={ing.name} />
                {!spatulaLoaded && currentMass < ing.target && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-blue-500 animate-ping opacity-30" />
                  </div>
                )}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow whitespace-nowrap">
                  Tap to load spatula
                </div>
              </div>

              <div className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 scale-[0.65] md:scale-100 origin-right">
                <BalanceSVG massLabel={`${currentMass.toFixed(4)} ${ing.unit}`} color={color} />
              </div>

              <motion.div
                drag
                dragConstraints={{ left: 0, right: 200, top: 0, bottom: 120 }}
                dragElastic={0.1}
                onDragEnd={(e, info) => {
                  if (info.point.x > 160) handleSpatulaToBalance();
                }}
                className="absolute left-[80px] md:left-[150px] top-[40px] md:top-[100px] z-50 cursor-grab active:cursor-grabbing"
              >
                <SpatulaSVG loaded={spatulaLoaded} color={color} />
                {spatulaLoaded && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shadow whitespace-nowrap">
                    Drag to Balance
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col space-y-4 text-sm md:text-base">
            <div className="bg-blue-50 p-4 md:p-5 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-2 text-sm md:text-base">Status Box</h3>
              <ul className="text-sm space-y-2 md:space-y-3 font-medium text-blue-800">
                {formulation.ingredients.map((i2) => (
                  <li key={i2.id} className="flex justify-between items-center">
                    <span>{i2.name}:</span>
                    <span className="bg-white px-2 py-1 rounded border shadow-sm text-xs md:text-sm">
                      {(weighedMasses[i2.id] ?? (i2.id === ing.id ? currentMass : 0)).toFixed(4)} / {i2.target.toFixed(4)} {i2.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-grow flex flex-col justify-center space-y-4">
              <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                <strong>Current Task:</strong> Weigh exactly <strong>{ing.target.toFixed(4)} {ing.unit}</strong> of {ing.name} ({ing.role}). Tap the bottle to load the spatula, then drag it to the balance.
              </div>

              {currentMass >= ing.target - ing.target * 0.01 && activeIngredientIdx < formulation.ingredients.length - 1 && (
                <button
                  onClick={nextIngredient}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm md:text-base"
                >
                  Next: Weigh {formulation.ingredients[activeIngredientIdx + 1].name}
                </button>
              )}
              {weighingComplete && (
                <button
                  onClick={() => setSimStep(3)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 text-sm md:text-base"
                >
                  Proceed to Mixing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER — Sim Step 3: Mixing
  // ============================================================

  const renderSimStep3 = () => {
    if (!formulation) return null;
    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
          <Activity className="mr-3 text-blue-600" size={24} /> Mixing
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="relative h-[300px] md:h-[360px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-inner">
            <MortarPestleSVG spinning={mixing} />
          </div>
          <div className="flex flex-col justify-center space-y-5">
            <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
              <strong>Current Task:</strong> Select the correct mixing technique for <strong>{formulation.name}</strong>.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METHOD_OPTIONS.map((m) => {
                const isPicked = methodChoice === m;
                const isWrongFlash = methodChoice === "__wrong__";
                return (
                  <button
                    key={m}
                    onClick={() => chooseMethod(m)}
                    disabled={!!methodChoice && methodChoice !== "__wrong__"}
                    className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${isPicked
                        ? "bg-green-100 border-green-500 text-green-800"
                        : isWrongFlash
                          ? "bg-red-50 border-red-300 text-red-500"
                          : "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700"
                      }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            {methodChoice && methodChoice !== "__wrong__" && !mixed && (
              <button
                onClick={runMixing}
                disabled={mixing}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 disabled:opacity-60 text-sm md:text-base flex items-center justify-center"
              >
                {mixing ? "Mixing…" : "Begin Mixing"}
              </button>
            )}

            {mixed && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-xl mb-4 font-bold flex items-center justify-center border border-green-200 shadow-sm text-sm md:text-base">
                  <CheckCircle2 className="mr-2" size={20} /> Mixture Complete
                </div>
                <button
                  onClick={() => setSimStep(4)}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                >
                  Proceed to Packaging &amp; Labelling
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER — Sim Step 4: Packaging & Labelling
  // ============================================================

  const renderSimStep4 = () => {
    if (!formulation) return null;
    const bud = new Date();
    bud.setDate(bud.getDate() + formulation.beyondUseDays);

    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
          <Package className="mr-3 text-blue-600" size={24} /> Packaging &amp; Labelling
        </h2>

        {!containerChoice || containerChoice === "__wrong__" ? (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
              <strong>Current Task:</strong> Choose the correct container for a <strong>{formulation.dosageForm}</strong>.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CONTAINER_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => chooseContainer(c)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all ${containerChoice === "__wrong__" && c !== formulation.container
                      ? "border-gray-200"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                >
                  {containerSVG(c)}
                  <span className="text-xs md:text-sm font-bold text-gray-700 mt-2">{c}</span>
                </button>
              ))}
            </div>
            {containerChoice === "__wrong__" && (
              <div className="text-red-500 text-sm font-bold text-center">Not the right container for this dosage form — try again.</div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200 p-8 shadow-inner">
              {containerSVG(containerChoice)}
              <span className="mt-3 font-bold text-slate-700 text-sm">{containerChoice}</span>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {!labelGenerated ? (
                <>
                  <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                    Container selected correctly. Now generate the label for this preparation.
                  </div>
                  <button
                    onClick={() => setLabelGenerated(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm md:text-base flex items-center justify-center"
                  >
                    <Tag className="mr-2" size={18} /> Generate Label
                  </button>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50">
                    <p className="text-[10px] uppercase tracking-wide text-blue-500 font-bold mb-1">Patient</p>
                    <p className="font-bold text-slate-800 mb-2">Sample Patient</p>
                    <p className="text-[10px] uppercase tracking-wide text-blue-500 font-bold mb-1">Preparation</p>
                    <p className="font-bold text-slate-800">{formulation.name}</p>
                    <p className="text-sm text-slate-600 mb-2">{formulation.strengthLabel} · {formulation.batchLabel}</p>
                    <p className="text-[10px] uppercase tracking-wide text-blue-500 font-bold mb-1">Storage</p>
                    <p className="text-sm text-slate-600 mb-2">{formulation.storage}</p>
                    <p className="text-[10px] uppercase tracking-wide text-blue-500 font-bold mb-1">Beyond-Use Date</p>
                    <p className="text-sm font-bold text-slate-800">{bud.toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setSimStep(5)}
                    className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                  >
                    Proceed to Documentation
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER — Sim Step 5: Documentation
  // ============================================================

  const renderSimStep5 = () => {
    if (!formulation) return null;
    const items: { key: keyof typeof checklist; label: string }[] = [
      { key: "calculations", label: "Calculations verified against formulation card" },
      { key: "ingredients", label: "All ingredients and lot quantities recorded" },
      { key: "appearance", label: "Final product appearance checked (color, consistency)" },
      { key: "weight", label: "Final product weight/count confirmed against batch size" },
    ];
    return (
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
          <ClipboardList className="mr-3 text-blue-600" size={24} /> Compounding Record
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Batch Number:</span> <strong>{batchNumber}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Formula:</span> <strong>{formulation.name}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Mixing Method:</span> <strong>{formulation.mixingMethod}</strong></p>
            <p className="flex justify-between"><span className="text-slate-500">Container:</span> <strong>{containerChoice}</strong></p>
            {formulation.ingredients.map((i2) => (
              <p key={i2.id} className="flex justify-between">
                <span className="text-slate-500">{i2.name}:</span>
                <strong>{(weighedMasses[i2.id] ?? 0).toFixed(4)} {i2.unit}</strong>
              </p>
            ))}
          </div>
          <div className="flex flex-col space-y-4">
            <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
              <strong>Current Task:</strong> Complete the final product check before releasing the batch.
            </div>
            <div className="space-y-3">
              {items.map((it) => (
                <button
                  key={it.key}
                  onClick={() => toggleCheck(it.key)}
                  className="w-full flex items-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all text-left"
                >
                  {checklist[it.key] ? (
                    <CheckCircle2 className="text-green-600 mr-3 flex-shrink-0" size={20} />
                  ) : (
                    <Circle className="text-gray-300 mr-3 flex-shrink-0" size={20} />
                  )}
                  <span className="text-sm font-medium text-gray-700">{it.label}</span>
                </button>
              ))}
            </div>
            {allChecked && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSimStep(6)}
                className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg flex justify-center items-center"
              >
                Finish Lab &amp; View Report <ChevronRight className="ml-2" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER — Sim Step 6: Assessment & Report
  // ============================================================

  const renderSimStep6 = () => {
    if (!formulation) return null;
    const rows: [string, number, number][] = [
      ["Accurate weighing (±5%)", weighingComplete ? 20 : 0, 20],
      ["Accurate volume measurement (±5%)", weighingComplete ? 15 : 0, 15],
      ["Correct mixing technique", methodAttempts === 1 ? 20 : methodAttempts > 1 ? 12 : 0, 20],
      ["Correct container & labelling", containerAttempts === 1 ? 15 : containerAttempts > 1 ? 8 : 0, 15],
      ["Documentation completeness", allChecked ? 15 : 0, 15],
      ["Final product quality check", labelGenerated ? 15 : 0, 15],
    ];
    return (
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100 max-w-4xl w-full mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-green-400" />
        <div className="text-center mb-8 md:mb-10 mt-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner border-4 border-green-100">
            <CheckCircle2 size={40} className="md:w-12 md:h-12" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">Lab Certification Complete</h2>
          <p className="text-gray-500 mt-2 md:mt-3 text-base md:text-lg">
            {formulation.name} — batch {batchNumber} prepared, packaged, and documented.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="bg-slate-50 p-5 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center border-b pb-3">
              <Scale className="mr-2 text-blue-500" size={20} /> Preparation Summary
            </h3>
            <ul className="space-y-3 md:space-y-4 text-slate-600 font-medium text-sm md:text-base">
              <li className="flex justify-between items-center">
                <span>Formulation:</span>
                <strong className="text-slate-900 bg-white px-3 py-1 rounded shadow-sm border">{formulation.name}</strong>
              </li>
              <li className="flex justify-between items-center">
                <span>Mixing Method:</span>
                <strong className="text-slate-900 bg-white px-3 py-1 rounded shadow-sm border">{formulation.mixingMethod}</strong>
              </li>
              <li className="flex justify-between items-center">
                <span>Container:</span>
                <strong className="text-slate-900 bg-white px-3 py-1 rounded shadow-sm border">{containerChoice}</strong>
              </li>
              {formulation.ingredients.map((i2) => (
                <li key={i2.id} className="flex justify-between items-center">
                  <span>{i2.name}:</span>
                  <strong className="text-slate-900">{(weighedMasses[i2.id] ?? 0).toFixed(4)} {i2.unit}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-5 md:p-8 rounded-2xl border-2 border-blue-100 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4 md:mb-6 flex items-center border-b border-blue-200 pb-3">
              <ClipboardList className="mr-2 text-blue-500" size={20} /> Score Breakdown
            </h3>
            <ul className="space-y-2 text-sm">
              {rows.map(([label, pts, max]) => (
                <li key={label} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-blue-100">
                  <span className="text-slate-600">{label}</span>
                  <strong className="text-blue-700">{pts} / {max}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-white p-3 md:p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
              <span className="font-bold text-slate-600 text-sm md:text-base">Total Score:</span>
              <span className="font-extrabold text-blue-700 text-xl md:text-2xl">{score} / 100</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
          <button
            onClick={generatePDF}
            className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm md:text-lg w-full sm:w-auto"
          >
            <Download className="mr-2 md:mr-3" size={20} /> Download Report
          </button>
          <button
            onClick={() => setSimStep(1)}
            className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm md:text-lg w-full sm:w-auto"
          >
            <PlayCircle className="mr-2 md:mr-3" size={20} /> Start New Compound
          </button>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

  const STEP_LABELS = ["Select Compound", "Weigh Ingredients", "Mixing", "Package & Label", "Documentation"];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 md:pb-24 selection:bg-blue-200">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white font-extrabold shadow-md text-sm md:text-lg">
              P
            </div>
            <span className="text-lg md:text-2xl font-extrabold tracking-tight text-slate-800">
              Pharma<span className="text-blue-600">Wallah</span> Compounding Lab
            </span>
          </div>
          <div className="flex space-x-1 md:space-x-3 text-xs md:text-sm font-bold bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setPhase("tutorial")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "tutorial" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
              Theory
            </button>
            <button
              onClick={() => setPhase("quiz")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "quiz" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
              Quiz
            </button>
            <button
              onClick={() => setPhase("simulation")}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "simulation" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
              Simulation
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-10">
        <AnimatePresence mode="wait">
          {phase === "tutorial" && <motion.div key="tutorial">{renderTutorial()}</motion.div>}
          {phase === "quiz" && <motion.div key="quiz">{renderQuiz()}</motion.div>}
          {phase === "simulation" && (
            <motion.div key="sim" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
              {simStep < 6 && (
                <div className="flex items-center justify-between bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto max-w-4xl mx-auto">
                  {STEP_LABELS.map((label, idx) => {
                    const isActive = simStep === idx + 1;
                    const isPassed = simStep > idx + 1;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center whitespace-nowrap px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex-1 justify-center ${isActive ? "bg-blue-50 text-blue-700 border border-blue-100" : isPassed ? "text-slate-600" : "text-slate-400"
                          }`}
                      >
                        <div
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-2 text-xs transition-colors ${isActive ? "bg-blue-600 text-white shadow-md" : isPassed ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-500"
                            }`}
                        >
                          {isPassed ? <CheckCircle2 size={14} /> : idx + 1}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="max-w-5xl mx-auto">
                {simStep === 1 && renderSimStep1()}
                {simStep === 2 && renderSimStep2()}
                {simStep === 3 && renderSimStep3()}
                {simStep === 4 && renderSimStep4()}
                {simStep === 5 && renderSimStep5()}
                {simStep === 6 && renderSimStep6()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}