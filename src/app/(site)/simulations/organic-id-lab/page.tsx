"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  FlaskConical,
  Beaker,
  TestTube,
  BookOpen,
  HelpCircle,
  Microscope,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  Info,
  Droplets,
  Flame
} from "lucide-react";

// --- TYPES & DATA ---

interface OrganicCompound {
  id: string;
  name: string;
  formula: string;
  state: "solid" | "liquid";
  color: string;
  odor: string;
  solubility: { water: boolean; ether: boolean; NaOH: boolean; NaHCO3: boolean; HCl: boolean };
  functionalTests: {
    DNP: boolean;
    Tollens: boolean;
    Fehling: boolean;
    FeCl3: boolean;
    NaHCO3_eff: boolean;
    Br2_water: boolean;
    Liebermann: boolean;
  };
}

const PRESET_COMPOUNDS: OrganicCompound[] = [
  {
    id: "benzoic_acid",
    name: "Benzoic Acid",
    formula: "C7H6O2",
    state: "solid",
    color: "white",
    odor: "odorless",
    solubility: { water: false, ether: true, NaOH: true, NaHCO3: true, HCl: false },
    functionalTests: { DNP: false, Tollens: false, Fehling: false, FeCl3: false, NaHCO3_eff: true, Br2_water: false, Liebermann: false },
  },
  {
    id: "glucose",
    name: "Glucose",
    formula: "C6H12O6",
    state: "solid",
    color: "white",
    odor: "odorless",
    solubility: { water: true, ether: false, NaOH: false, NaHCO3: false, HCl: false },
    functionalTests: { DNP: false, Tollens: true, Fehling: true, FeCl3: false, NaHCO3_eff: false, Br2_water: false, Liebermann: false },
  },
  {
    id: "urea",
    name: "Urea",
    formula: "CH4N2O",
    state: "solid",
    color: "white",
    odor: "slight ammonia",
    solubility: { water: true, ether: false, NaOH: false, NaHCO3: false, HCl: false },
    functionalTests: { DNP: false, Tollens: false, Fehling: false, FeCl3: false, NaHCO3_eff: false, Br2_water: false, Liebermann: false },
  },
  {
    id: "aniline",
    name: "Aniline",
    formula: "C6H7N",
    state: "liquid",
    color: "pale yellow",
    odor: "fishy",
    solubility: { water: false, ether: true, NaOH: false, NaHCO3: false, HCl: true },
    functionalTests: { DNP: false, Tollens: false, Fehling: false, FeCl3: false, NaHCO3_eff: false, Br2_water: true, Liebermann: true },
  },
  {
    id: "benzaldehyde",
    name: "Benzaldehyde",
    formula: "C7H6O",
    state: "liquid",
    color: "colorless",
    odor: "almond",
    solubility: { water: false, ether: true, NaOH: false, NaHCO3: false, HCl: false },
    functionalTests: { DNP: true, Tollens: true, Fehling: false, FeCl3: false, NaHCO3_eff: false, Br2_water: false, Liebermann: false },
  },
  {
    id: "acetone",
    name: "Acetone",
    formula: "C3H6O",
    state: "liquid",
    color: "colorless",
    odor: "fruity",
    solubility: { water: true, ether: true, NaOH: false, NaHCO3: false, HCl: false },
    functionalTests: { DNP: true, Tollens: false, Fehling: false, FeCl3: false, NaHCO3_eff: false, Br2_water: false, Liebermann: false },
  },
  {
    id: "phenol",
    name: "Phenol",
    formula: "C6H6O",
    state: "solid",
    color: "pink",
    odor: "characteristic",
    solubility: { water: false, ether: true, NaOH: true, NaHCO3: false, HCl: false },
    functionalTests: { DNP: false, Tollens: false, Fehling: false, FeCl3: true, NaHCO3_eff: false, Br2_water: true, Liebermann: false },
  },
];

const TUTORIAL_SLIDES = [
  { 
    title: "Introduction to Organic Compound Identification", 
    text: "The identification of an unknown organic compound follows a systematic approach. We start broad by examining the physical state, move to specific solubility classifications, and finally use functional group tests. This 'decision tree' approach allows us to eliminate entire classes of compounds step-by-step.",
  },
  { 
    title: "Organoleptic Evaluation", 
    text: "The first step is evaluating the state, color, and odor. These properties provide powerful early clues. For example, an almond smell strongly suggests benzaldehyde, a fishy odor indicates an amine, and a pungent smell hints at a carboxylic acid. Note: In a real lab, never inhale directly; always waft the scent.",
  },
  { 
    title: "Solubility Tests — Water & Ether", 
    text: "Water solubility tells us if the compound is highly polar, ionic, or capable of significant hydrogen bonding (e.g., small alcohols, sugars). Ether solubility indicates nonpolar/lipophilic nature. A compound soluble in both is typically a small, versatile molecule like acetone or ethanol.",
  },
  { 
    title: "Solubility Tests — NaOH, NaHCO₃, HCl", 
    text: "NaOH dissolves acidic compounds, including both phenols and carboxylic acids. NaHCO₃ is a weaker base and only dissolves STRONG acids (like carboxylic acids) with effervescence, distinguishing them from phenols. HCl dissolves basic compounds, primarily amines.",
  },
  { 
    title: "The 2,4-DNP Test & Tollens' Test", 
    text: "2,4-DNP (dinitrophenylhydrazine) forms a bright orange or yellow precipitate with all carbonyl compounds (aldehydes and ketones). Tollens' reagent is more selective: it only reacts with aldehydes to produce a brilliant silver mirror. Using both tells you exactly which carbonyl you have.",
  },
  { 
    title: "Fehling's Test & FeCl₃ Test", 
    text: "Fehling's solution (containing blue Cu²⁺) is reduced by aliphatic aldehydes and reducing sugars to a brick-red Cu₂O precipitate upon heating. The Ferric Chloride (FeCl₃) test yields an intense violet-purple complex in the presence of phenols and enols.",
  },
  { 
    title: "Bromine Water & Liebermann Test", 
    text: "Bromine water (orange-brown) is rapidly decolorized by compounds with C=C double bonds, phenols, and primary amines—a quick test for unsaturation or highly activated rings. The Liebermann test uses NaNO₂ and H₂SO₄ to detect phenols and some amines, yielding deep green or blue colors.",
  },
  { 
    title: "How to Identify: The Decision Flowchart", 
    text: "By chaining these tests together, you create a logical pathway. State and odor narrow the field. Solubility in NaHCO₃ confirms an acid. A positive DNP but negative Tollens' confirms a ketone. With just 3 to 4 well-chosen tests, you can uniquely identify almost any common unknown compound.",
  }
];

const QUIZ_QUESTIONS = [
  { q: "Which reagent produces a silver mirror reaction?", opts: ["2,4-DNP", "Tollens' Reagent", "Fehling's Solution", "Ferric Chloride"], ans: 1, exp: "Tollens' reagent contains diamminesilver(I) which is reduced by aldehydes to metallic silver, forming a mirror." },
  { q: "A compound dissolves in HCl but not water — which class does it likely belong to?", opts: ["Carboxylic Acid", "Phenol", "Amine", "Ketone"], ans: 2, exp: "Amines are basic. They react with the acid (HCl) to form a water-soluble ammonium salt." },
  { q: "FeCl₃ gives a violet complex with which functional group?", opts: ["Aldehyde", "Alcohol", "Carboxylic Acid", "Phenol"], ans: 3, exp: "Phenols (and enols) form intensely colored coordination complexes with Fe(III) ions, typically violet or green." },
  { q: "NaHCO₃ effervescence confirms the presence of which class?", opts: ["Strong Acid (Carboxylic)", "Weak Acid (Phenol)", "Ketone", "Amine"], ans: 0, exp: "Only acids stronger than carbonic acid (like carboxylic acids) can displace CO₂ from bicarbonate, causing effervescence." },
  { q: "Fehling's test requires heating — what does a brick-red precipitate indicate?", opts: ["Aromatic aldehyde", "Ketone", "Reducing sugar / Aliphatic aldehyde", "Amine"], ans: 2, exp: "Fehling's test reduces blue Cu²⁺ to brick-red Cu₂O in the presence of aliphatic aldehydes and reducing sugars." }
];

// --- CUSTOM SVG COMPONENTS (INLINE) ---

const Flowchart1SVG = () => (
  <svg viewBox="0 0 400 200" className="w-full h-48 drop-shadow-sm">
    <rect x="140" y="10" width="120" height="30" rx="8" fill="#1d4ed8" />
    <text x="200" y="30" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Unknown Compound</text>
    <path d="M200 40 v20" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
    
    <rect x="140" y="60" width="120" height="30" rx="8" fill="#0284c7" />
    <text x="200" y="80" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Solid / Liquid</text>
    <path d="M200 90 v20" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

    <rect x="140" y="110" width="120" height="30" rx="8" fill="#0369a1" />
    <text x="200" y="130" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Solubility Tests</text>
    <path d="M200 140 v20" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />

    <rect x="140" y="160" width="120" height="30" rx="8" fill="#16a34a" />
    <text x="200" y="180" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">Functional Tests</text>

    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
      </marker>
    </defs>
  </svg>
);

const PetriDishSVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-48 drop-shadow-md">
    {/* Dish */}
    <circle cx="100" cy="100" r="70" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
    <circle cx="100" cy="100" r="65" fill="transparent" stroke="#e2e8f0" strokeWidth="2" />
    {/* Crystals */}
    <path d="M90 90 l10 -15 l15 10 l-5 20 z" fill="#38bdf8" opacity="0.8" />
    <path d="M110 85 l12 -5 l8 12 l-15 8 z" fill="#7dd3fc" opacity="0.9" />
    <path d="M85 100 l15 -5 l5 15 l-12 10 z" fill="#bae6fd" opacity="0.8" />
    <path d="M105 105 l10 -8 l12 10 l-8 15 z" fill="#0284c7" opacity="0.7" />
    {/* Mag Glass */}
    <circle cx="140" cy="60" r="20" fill="rgba(255,255,255,0.4)" stroke="#475569" strokeWidth="3" />
    <line x1="154" y1="74" x2="175" y2="95" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
    {/* Nose/Odor */}
    <path d="M40 70 Q30 90 40 110 Q50 115 45 125 Q40 135 50 140" fill="transparent" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 70 Q60 50 80 40" fill="transparent" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M55 85 Q70 65 90 60" fill="transparent" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
    
    <text x="100" y="190" fontSize="14" fill="#334155" textAnchor="middle" fontWeight="bold">State • Colour • Odour</text>
  </svg>
);

const Tube = ({ x, y, label, color, liquidH, isSeparate, pptColor, silver, bubble }: any) => (
  <g transform={`translate(${x}, ${y})`}>
    <path d="M10 0 v60 a10 10 0 0 0 20 0 v-60" fill="rgba(255,255,255,0.6)" stroke="#94a3b8" strokeWidth="2" />
    <path d="M5 0 h30" stroke="#94a3b8" strokeWidth="2" />
    {/* Liquid */}
    {liquidH > 0 && (
      <path d={`M12 ${68-liquidH} L28 ${68-liquidH} L28 68 A8 8 0 0 1 12 68 Z`} fill={color} opacity="0.8" />
    )}
    {/* Layer */}
    {isSeparate && (
      <path d={`M12 28 L28 28 L28 48 Z`} fill="#fef08a" opacity="0.6" />
    )}
    {/* Precipitate */}
    {pptColor && (
      <circle cx="20" cy="64" r="4" fill={pptColor} />
    )}
    {/* Silver Mirror */}
    {silver && (
      <path d="M12 20 L28 20 L28 68 A8 8 0 0 1 12 68 Z" fill="url(#silverGrad)" opacity="0.9" />
    )}
    {/* Bubbles */}
    {bubble && (
      <g>
        <circle cx="16" cy="40" r="1.5" fill="white" />
        <circle cx="22" cy="50" r="2" fill="white" />
        <circle cx="18" cy="30" r="1" fill="white" />
      </g>
    )}
    <text x="20" y="90" fontSize="12" fill="#334155" textAnchor="middle" fontWeight="bold">{label}</text>
  </g>
);

const WaterEtherSVG = () => (
  <svg viewBox="0 0 200 150" className="w-full h-40 drop-shadow-md">
    <Tube x="40" y="20" label="H₂O (Clear)" color="#bae6fd" liquidH="40" />
    <Tube x="120" y="20" label="Ether (Layers)" color="#bae6fd" liquidH="40" isSeparate />
  </svg>
);

const SolventsSVG = () => (
  <svg viewBox="0 0 300 150" className="w-full h-40 drop-shadow-md">
    <rect x="30" y="60" width="240" height="15" fill="#d6d3d1" rx="4" />
    <Tube x="50" y="20" label="NaOH" color="#86efac" liquidH="40" />
    <Tube x="130" y="20" label="NaHCO₃" color="#fdba74" liquidH="40" bubble />
    <Tube x="210" y="20" label="HCl" color="#fca5a5" liquidH="40" />
  </svg>
);

const DNPTollensSVG = () => (
  <svg viewBox="0 0 200 150" className="w-full h-40 drop-shadow-md">
    <defs>
      <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d1d5db" />
        <stop offset="50%" stopColor="#f3f4f6" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
    </defs>
    <Tube x="40" y="20" label="2,4-DNP" color="transparent" liquidH="40" pptColor="#ea580c" />
    {/* Simulate extra ppt */}
    <circle cx="56" cy="80" r="3" fill="#ea580c" />
    <circle cx="64" cy="82" r="2.5" fill="#ea580c" />
    
    <Tube x="120" y="20" label="Tollens'" color="transparent" liquidH="40" silver />
    <text x="60" y="15" fontSize="10" fill="#ea580c" fontWeight="bold">C=O</text>
    <text x="140" y="15" fontSize="10" fill="#64748b" fontWeight="bold">CHO only</text>
  </svg>
);

const FehlingFeCl3SVG = () => (
  <svg viewBox="0 0 200 150" className="w-full h-40 drop-shadow-md">
    {/* Fehling tube with gradient blue to red */}
    <defs>
      <linearGradient id="fehlingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
    </defs>
    <g transform="translate(40, 20)">
      <path d="M10 0 v60 a10 10 0 0 0 20 0 v-60" fill="rgba(255,255,255,0.6)" stroke="#94a3b8" strokeWidth="2" />
      <path d="M12 28 L28 28 L28 68 A8 8 0 0 1 12 68 Z" fill="url(#fehlingGrad)" opacity="0.9" />
      <text x="20" y="90" fontSize="12" fill="#334155" textAnchor="middle" fontWeight="bold">Fehling's</text>
    </g>
    <Flame className="text-orange-500 w-6 h-6 absolute" style={{ transform: "translate(48px, 95px)" }} />
    
    <Tube x="120" y="20" label="FeCl₃ (Violet)" color="#9333ea" liquidH="40" />
  </svg>
);

const Br2LiebermannSVG = () => (
  <svg viewBox="0 0 200 150" className="w-full h-40 drop-shadow-md">
    <Tube x="40" y="20" label="Br₂ (Clear)" color="#f1f5f9" liquidH="40" />
    <path d="M30 45 L40 45" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrow)" />
    <text x="10" y="48" fontSize="10" fill="#f97316" fontWeight="bold">Br₂</text>
    
    <Tube x="120" y="20" label="Liebermann" color="#15803d" liquidH="40" />
  </svg>
);

const Flowchart2SVG = () => (
  <svg viewBox="0 0 400 250" className="w-full h-56 drop-shadow-sm">
    <rect x="150" y="10" width="100" height="26" rx="6" fill="#1d4ed8" />
    <text x="200" y="27" fill="white" fontSize="10" textAnchor="middle">Unknown</text>
    
    <path d="M200 36 v14" stroke="#94a3b8" strokeWidth="2" />
    <path d="M100 50 h200" stroke="#94a3b8" strokeWidth="2" />
    
    <path d="M100 50 v10" stroke="#94a3b8" strokeWidth="2" />
    <rect x="60" y="60" width="80" height="24" rx="6" fill="#0284c7" />
    <text x="100" y="75" fill="white" fontSize="10" textAnchor="middle">Solid</text>

    <path d="M300 50 v10" stroke="#94a3b8" strokeWidth="2" />
    <rect x="260" y="60" width="80" height="24" rx="6" fill="#0284c7" />
    <text x="300" y="75" fill="white" fontSize="10" textAnchor="middle">Liquid</text>
    
    <path d="M100 84 v16" stroke="#94a3b8" strokeWidth="2" />
    <rect x="50" y="100" width="100" height="24" rx="4" fill="#64748b" />
    <text x="100" y="115" fill="white" fontSize="9" textAnchor="middle">NaOH Soluble?</text>
    
    <path d="M300 84 v16" stroke="#94a3b8" strokeWidth="2" />
    <rect x="250" y="100" width="100" height="24" rx="4" fill="#64748b" />
    <text x="300" y="115" fill="white" fontSize="9" textAnchor="middle">DNP Test</text>

    <path d="M100 124 v16" stroke="#94a3b8" strokeWidth="2" />
    <rect x="50" y="140" width="100" height="24" rx="4" fill="#16a34a" />
    <text x="100" y="155" fill="white" fontSize="9" textAnchor="middle">Phenol / Acid</text>

    <path d="M300 124 v16" stroke="#94a3b8" strokeWidth="2" />
    <rect x="250" y="140" width="100" height="24" rx="4" fill="#16a34a" />
    <text x="300" y="155" fill="white" fontSize="9" textAnchor="middle">Aldehyde / Ketone</text>
  </svg>
);

const BottleSVG = ({ label, color = "#e2e8f0" }: { label: string; color?: string }) => (
  <svg viewBox="0 0 100 120" className="w-16 h-16 drop-shadow-md">
    <path d="M40 10 h20 v20 h10 v80 h-40 v-80 h10 z" fill="rgba(255,255,255,0.7)" stroke="#64748b" strokeWidth="2" />
    <path d="M35 30 h30 v80 h-30 z" fill={color} opacity="0.6" />
    <rect x="42" y="5" width="16" height="6" fill="#475569" />
    <text x="50" y="70" fontSize="14" textAnchor="middle" fill="#0f172a" fontWeight="bold">{label}</text>
  </svg>
);

const SimTestTubeSVG = ({ fillLevel = 0, color = "transparent", particles = false, silver = false }) => (
  <svg viewBox="0 0 40 120" className="w-10 h-32 drop-shadow-sm">
    <path d="M10 5 v100 a10 10 0 0 0 20 0 v-100" fill="rgba(255,255,255,0.4)" stroke="#94a3b8" strokeWidth="2" />
    <path d="M5 5 h30" stroke="#94a3b8" strokeWidth="2" />
    {fillLevel > 0 && (
      <motion.path 
        initial={{ d: `M12 105 L28 105 L28 105 A8 8 0 0 1 12 105 Z` }}
        animate={{ d: `M12 ${105 - fillLevel} L28 ${105 - fillLevel} L28 105 A8 8 0 0 1 12 105 Z` }}
        fill={color} 
        opacity="0.8" 
        transition={{ duration: 0.5 }}
      />
    )}
    {silver && (
      <path d="M12 40 L28 40 L28 105 A8 8 0 0 1 12 105 Z" fill="url(#silverGrad)" opacity="0.9" />
    )}
    {particles && (
      <g>
        {[...Array(15)].map((_, i) => (
          <motion.circle 
            key={i} 
            cx={14 + Math.random()*12} 
            initial={{ cy: 40 }}
            animate={{ cy: 95 + Math.random()*8 }}
            transition={{ duration: 1 + Math.random() }}
            r="1.5" 
            fill="#ea580c" 
          />
        ))}
      </g>
    )}
  </svg>
);

// --- MAIN COMPONENT ---

export default function OrganicIDLab() {
  const [activeTab, setActiveTab] = useState<"tutorial" | "quiz" | "simulation">("tutorial");
  
  // Tutorial State
  const [tutSlide, setTutSlide] = useState(0);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  // Sim State
  const [simStep, setSimStep] = useState(1);
  const [compound, setCompound] = useState<OrganicCompound | null>(null);
  const [organoleptic, setOrganoleptic] = useState({ state: "", color: "", odor: "" });
  const [solubility, setSolubility] = useState<Record<string, boolean | null>>({ water: null, ether: null, NaOH: null, NaHCO3: null, HCl: null });
  const [funcTests, setFuncTests] = useState<Record<string, boolean>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'info'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg: string, type: 'success'|'error'|'info' = 'info') => setToast({ msg, type });

  // Quiz Handlers
  const handleQuizAnswer = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    if (idx === QUIZ_QUESTIONS[quizStep].ans) {
      setScore(s => s + 1);
    }
  };

  const nextQuizQ = () => {
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(s => s + 1);
      setSelectedAns(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Sim Handlers
  const startSimulation = () => {
    const randomCompound = PRESET_COMPOUNDS[Math.floor(Math.random() * PRESET_COMPOUNDS.length)];
    setCompound(randomCompound);
    setSimStep(2);
    showToast(`Unknown Compound assigned!`, "success");
    setActiveTab("simulation");
  };

  const handleSolubilityDrop = (solvent: string) => {
    if (!compound) return;
    const isSoluble = compound.solubility[solvent as keyof typeof compound.solubility];
    setSolubility(prev => ({ ...prev, [solvent]: isSoluble }));
  };

  const performTest = (testKey: string) => {
    if (!compound) return;
    const result = compound.functionalTests[testKey as keyof typeof compound.functionalTests];
    setFuncTests(prev => ({ ...prev, [testKey]: result }));
  };

  const generatePDF = () => {
    if (!compound) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(29, 78, 216); // #1d4ed8
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PharmaWallah", 15, 17);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Organic Compound ID Report", 140, 16);
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 35);
    doc.text(`Student Identity Verified`, 15, 42);
    
    doc.setFont("helvetica", "bold");
    doc.text("Conclusion", 15, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Identified Compound: ${compound.name} (${compound.formula})`, 15, 62);
    
    doc.setFont("helvetica", "bold");
    doc.text("1. Organoleptic Properties", 15, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`State: ${organoleptic.state || compound.state}`, 20, 82);
    doc.text(`Color: ${organoleptic.color || compound.color}`, 20, 89);
    doc.text(`Odor: ${organoleptic.odor || compound.odor}`, 20, 96);
    
    doc.setFont("helvetica", "bold");
    doc.text("2. Solubility Profile", 15, 110);
    doc.setFont("helvetica", "normal");
    let y = 117;
    Object.entries(solubility).forEach(([solv, res]) => {
      if(res !== null) {
        doc.text(`- ${solv}: ${res ? "Soluble" : "Insoluble"}`, 20, y);
        y += 7;
      }
    });

    doc.setFont("helvetica", "bold");
    doc.text("3. Functional Group Tests", 15, y + 10);
    doc.setFont("helvetica", "normal");
    y += 17;
    Object.entries(funcTests).forEach(([test, res]) => {
      doc.text(`- ${test.replace('_', ' ')}: ${res ? "Positive" : "Negative"}`, 20, y);
      y += 7;
    });

    // Disclaimer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated by PharmaWallah E-Learning Platform. For educational purposes only.", 15, 280);

    doc.save("Organic_ID_Report.pdf");
  };

  const getTutSVG = (idx: number) => {
    switch(idx) {
      case 0: return <Flowchart1SVG />;
      case 1: return <PetriDishSVG />;
      case 2: return <WaterEtherSVG />;
      case 3: return <SolventsSVG />;
      case 4: return <DNPTollensSVG />;
      case 5: return <FehlingFeCl3SVG />;
      case 6: return <Br2LiebermannSVG />;
      case 7: return <Flowchart2SVG />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-slate-800 font-sans p-4 md:p-8 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }} 
            animate={{ opacity: 1, y: 0, x: "-50%" }} 
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
              toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-2.5 rounded-xl shadow-md">
            <FlaskConical className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}>
              PharmaWallah
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organic ID Lab</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: "tutorial", icon: BookOpen, label: "Tutorial" },
            { id: "quiz", icon: HelpCircle, label: "Quiz" },
            { id: "simulation", icon: Microscope, label: "Simulation" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-blue-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <tab.icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
        
        {/* === PHASE 1: TUTORIAL === */}
        {activeTab === "tutorial" && (
          <div className="flex-1 flex flex-col p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">Theory & Procedures</h2>
              <span className="font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full text-sm">Slide {tutSlide + 1} of {TUTORIAL_SLIDES.length}</span>
            </div>

            <motion.div 
              key={tutSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-full md:w-1/2">
                <h3 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">{TUTORIAL_SLIDES[tutSlide].title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {TUTORIAL_SLIDES[tutSlide].text}
                </p>
              </div>
              <div className="w-full md:w-1/2 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center justify-center min-h-[250px]">
                {getTutSVG(tutSlide)}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <button 
                onClick={() => setTutSlide(s => Math.max(0, s - 1))}
                disabled={tutSlide === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
              >
                <ArrowLeft className="w-5 h-5" /> Prev
              </button>
              
              <div className="flex gap-2">
                {TUTORIAL_SLIDES.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === tutSlide ? 'bg-blue-600 scale-125' : 'bg-slate-200'}`} />
                ))}
              </div>

              {tutSlide < TUTORIAL_SLIDES.length - 1 ? (
                <button 
                  onClick={() => setTutSlide(s => s + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-md transition transform hover:-translate-y-0.5"
                  style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab("quiz")}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-md transition transform hover:-translate-y-0.5 bg-slate-800"
                >
                  Take Quiz <HelpCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* === PHASE 2: QUIZ === */}
        {activeTab === "quiz" && (
          <div className="flex-1 flex flex-col p-6 md:p-10 bg-slate-50/50">
            {!quizFinished ? (
              <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
                <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <HelpCircle className="text-blue-600" /> Knowledge Check
                  </h2>
                  <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                    Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <motion.div key={quizStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                    {QUIZ_QUESTIONS[quizStep].q}
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    {QUIZ_QUESTIONS[quizStep].opts.map((opt, i) => {
                      let btnClass = "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
                      if (selectedAns !== null) {
                        if (i === QUIZ_QUESTIONS[quizStep].ans) btnClass = "border-green-500 bg-green-50 text-green-800";
                        else if (i === selectedAns) btnClass = "border-red-500 bg-red-50 text-red-800";
                        else btnClass = "border-slate-200 opacity-50";
                      }
                      
                      return (
                        <button 
                          key={i} 
                          disabled={selectedAns !== null}
                          onClick={() => handleQuizAnswer(i)}
                          className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedAns !== null && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        className="mt-6 p-4 rounded-2xl bg-blue-50 text-blue-800 border border-blue-100"
                      >
                        <p className="font-bold mb-1 flex items-center gap-2">
                          <Info className="w-5 h-5"/> Explanation
                        </p>
                        <p className="text-sm">{QUIZ_QUESTIONS[quizStep].exp}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={selectedAns === null}
                    onClick={nextQuizQ}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white disabled:opacity-50 transition transform hover:-translate-y-0.5 bg-slate-800"
                  >
                    {quizStep < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-4xl font-black text-slate-800 mb-4">Quiz Complete!</h2>
                <p className="text-2xl font-bold text-slate-600 mb-8">You scored <span className="text-blue-600">{score}</span> out of {QUIZ_QUESTIONS.length}</p>
                <button 
                  onClick={startSimulation}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-xl transition transform hover:-translate-y-1 hover:shadow-2xl text-lg"
                  style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}
                >
                  <Microscope className="w-6 h-6" /> Start Virtual Lab
                </button>
              </div>
            )}
          </div>
        )}

        {/* === PHASE 3: SIMULATION === */}
        {activeTab === "simulation" && (
          <div className="flex-1 flex flex-col bg-slate-50/50">
            
            {/* Steps Progress */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-wrap justify-center gap-2 md:gap-4 shadow-sm z-10 relative">
              {['Select', 'Organoleptic', 'Solubility', 'Functional', 'Identify'].map((label, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-2xl transition ${simStep === i + 1 ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200 shadow-sm' : simStep > i + 1 ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${simStep === i + 1 ? 'bg-blue-600 text-white' : simStep > i + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                    {simStep > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 p-6 md:p-10 flex flex-col relative overflow-hidden">
              
              {/* STEP 1: Select Compound */}
              {simStep === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h2 className="text-3xl font-black mb-10 text-slate-800">Select an Unknown Sample</h2>
                  <div className="flex flex-wrap justify-center gap-10">
                    {["A", "B", "C", "D", "E"].map((l) => (
                      <motion.div 
                        whileHover={{ scale: 1.1, y: -5 }}
                        key={l} 
                        className="cursor-pointer flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
                        onClick={startSimulation}
                      >
                        <BottleSVG label={l} />
                        <span className="mt-4 font-bold text-slate-700 bg-slate-100 px-4 py-1 rounded-full">Unknown {l}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Organoleptic */}
              {simStep === 2 && compound && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-10 items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div className="w-72 h-72 bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border-4 border-slate-100 shadow-inner relative overflow-hidden">
                       <span className="absolute top-4 left-4 bg-white font-bold text-slate-400 text-xs px-2 py-1 rounded-md shadow-sm">Benchtop View</span>
                       {compound.state === 'liquid' ? (
                          <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="text-center">
                             <BottleSVG label="Unk" color={compound.color === 'colorless' ? '#f8fafc' : '#fef08a'} />
                          </motion.div>
                       ) : (
                          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center relative top-8">
                             <div className="w-40 h-16 bg-slate-200 rounded-[100%] flex items-center justify-center shadow-md border-b-4 border-slate-300 relative z-10">
                                <div className={`w-24 h-8 rounded-[100%] opacity-90 blur-[2px] ${compound.color === 'white' ? 'bg-white' : compound.color === 'pink' ? 'bg-pink-200' : 'bg-slate-300'}`}></div>
                             </div>
                             <p className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest relative z-0">Watch Glass</p>
                          </motion.div>
                       )}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <h2 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4">Record Observations</h2>
                    
                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 uppercase text-xs tracking-widest">Physical State</h3>
                      <div className="flex gap-2">
                        {['solid', 'liquid'].map(s => (
                          <button key={s} onClick={() => setOrganoleptic({...organoleptic, state: s})} className={`px-5 py-2.5 rounded-xl font-bold border-2 transition ${organoleptic.state === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 uppercase text-xs tracking-widest">Apparent Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {['white', 'colorless', 'yellow', 'pale yellow', 'pink'].map(c => (
                          <button key={c} onClick={() => setOrganoleptic({...organoleptic, color: c})} className={`px-4 py-2 rounded-xl font-bold border-2 transition ${organoleptic.color === c ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 uppercase text-xs tracking-widest">Odor</h3>
                      <div className="flex flex-wrap gap-2">
                        {['odorless', 'pungent', 'fruity', 'fishy', 'almond', 'slight ammonia', 'characteristic'].map(o => (
                          <button key={o} onClick={() => setOrganoleptic({...organoleptic, odor: o})} className={`px-4 py-2 rounded-xl font-bold border-2 transition ${organoleptic.odor === o ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{o}</button>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      disabled={!organoleptic.state || !organoleptic.color || !organoleptic.odor}
                      onClick={() => setSimStep(3)}
                      className="mt-6 py-4 rounded-2xl font-black text-white shadow-md disabled:opacity-50 disabled:shadow-none transition hover:opacity-90"
                      style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}
                    >
                      Proceed to Solubility Tests
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Solubility */}
              {simStep === 3 && (
                <div className="flex-1 flex flex-col bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">Solubility Profile</h2>
                      <p className="text-slate-500 font-medium">Drag solvent bottles over the test tubes to add them to the unknown.</p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold text-sm">
                      Remaining: {5 - Object.values(solubility).filter(v => v !== null).length}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center justify-center mt-4">
                    {/* Rack */}
                    <div className="flex gap-6 p-8 bg-gradient-to-b from-amber-800/10 to-amber-900/20 rounded-3xl border-b-[12px] border-amber-900/30 relative">
                      {['water', 'ether', 'NaOH', 'NaHCO3', 'HCl'].map((solv) => {
                         const res = solubility[solv];
                         const isTested = res !== null;
                         return (
                           <div key={solv} className="flex flex-col items-center gap-3 w-16 relative">
                             {/* Drop Target Hint */}
                             {!isTested && (
                               <div className="absolute -top-16 opacity-0 hover:opacity-100 w-full text-center text-xs font-black text-blue-500 pointer-events-none transition">
                                 DROP HERE
                               </div>
                             )}
                             <SimTestTubeSVG 
                               fillLevel={isTested ? 50 : 15} 
                               color={isTested ? (res ? "rgba(56, 189, 248, 0.4)" : "rgba(203, 213, 225, 0.6)") : "rgba(203, 213, 225, 0.4)"} 
                               particles={isTested && !res && compound?.state === 'solid'}
                             />
                             <span className="text-xs font-black text-slate-700 bg-white shadow-sm border border-slate-200 px-2 py-1 rounded-md w-full text-center truncate">{solv}</span>
                             {isTested && (
                               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute -bottom-10 text-[10px] font-black px-2 py-1 rounded-full shadow-sm border ${res ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                 {res ? 'SOLUBLE' : 'INSOL.'}
                               </motion.div>
                             )}
                           </div>
                         );
                      })}
                    </div>

                    {/* Solvents palette */}
                    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-8">
                       {['water', 'ether', 'NaOH', 'NaHCO3', 'HCl'].map((solv) => (
                          <motion.div 
                            key={`drag-${solv}`}
                            drag 
                            dragSnapToOrigin 
                            onDragEnd={(e, info) => {
                              // Simple overlap detection based on drag distance
                              if (Math.abs(info.offset.x) > 60 || Math.abs(info.offset.y) > 60) {
                                handleSolubilityDrop(solv);
                              }
                            }}
                            whileDrag={{ scale: 1.2, zIndex: 50, rotate: -15 }}
                            className={`cursor-grab active:cursor-grabbing flex flex-col items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 ${solubility[solv] !== null ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                          >
                            <BottleSVG label={solv} color="#bae6fd" />
                            <span className="text-xs font-bold text-slate-400 mt-2">Drag</span>
                          </motion.div>
                       ))}
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button 
                      disabled={Object.values(solubility).some(v => v === null)}
                      onClick={() => setSimStep(4)}
                      className="px-8 py-4 rounded-2xl font-black text-white disabled:opacity-50 transition transform hover:-translate-y-0.5"
                      style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}
                    >
                      Next: Functional Groups <ArrowRight className="w-5 h-5 inline" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Functional */}
              {simStep === 4 && (
                <div className="flex-1 flex flex-col bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800">Functional Group Tests</h2>
                    <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Completed: {Object.keys(funcTests).length} / 7</span>
                  </div>
                  
                  {!activeTest ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['DNP', 'Tollens', 'Fehling', 'FeCl3', 'NaHCO3_eff', 'Br2_water', 'Liebermann'].map(test => {
                        const isDone = funcTests[test] !== undefined;
                        const isPos = funcTests[test] === true;
                        return (
                        <div key={test} className={`border-2 p-5 rounded-2xl flex items-center justify-between transition ${isDone ? (isPos ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50') : 'border-slate-200 hover:border-blue-400'}`}>
                          <div>
                            <h4 className="font-bold text-slate-800">{test.replace('_', ' ')}</h4>
                            <p className="text-xs font-bold mt-1.5 flex items-center gap-1">
                              {isDone ? (isPos ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Positive</span> : <span className="text-slate-500 flex items-center gap-1"><XCircle className="w-3 h-3"/> Negative</span>) : <span className="text-slate-400">Not performed</span>}
                            </p>
                          </div>
                          <button onClick={() => setActiveTest(test)} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${isDone ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                            {isDone ? 'Re-test' : 'Run'}
                          </button>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8">
                       <div className="absolute top-8 left-8">
                         <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold bg-slate-100 px-4 py-2 rounded-xl">
                           <ArrowLeft className="w-4 h-4" /> Back
                         </button>
                       </div>
                       
                       <h3 className="text-3xl font-black mb-2 text-slate-800">{activeTest.replace('_', ' ')}</h3>
                       <p className="text-slate-500 font-medium mb-12">Drag the reagent to the test tube to observe the reaction.</p>
                       
                       <div className="flex items-end gap-16 mb-12 bg-slate-50 p-12 rounded-[3rem] border border-slate-100 shadow-inner">
                          {/* Tube */}
                          <div className="relative">
                            <SimTestTubeSVG 
                              fillLevel={funcTests[activeTest] !== undefined ? 50 : 20} 
                              color={
                                funcTests[activeTest] === undefined ? "rgba(203,213,225,0.4)" :
                                (activeTest === 'DNP' && funcTests[activeTest] ? "transparent" :
                                activeTest === 'FeCl3' && funcTests[activeTest] ? "rgba(147, 51, 234, 0.9)" : 
                                activeTest === 'Fehling' && funcTests[activeTest] ? "rgba(185, 28, 28, 0.8)" : 
                                activeTest === 'Br2_water' && funcTests[activeTest] ? "transparent" :
                                activeTest === 'Liebermann' && funcTests[activeTest] ? "rgba(21, 128, 61, 0.9)" :
                                "rgba(203,213,225,0.4)")
                              }
                              particles={
                                (activeTest === 'DNP' && funcTests[activeTest]) || 
                                (activeTest === 'Fehling' && funcTests[activeTest])
                              }
                              silver={activeTest === 'Tollens' && funcTests[activeTest]}
                            />
                            {/* Heat source for Fehling */}
                            {activeTest === 'Fehling' && funcTests[activeTest] !== undefined && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-orange-500">
                                <Flame className="w-8 h-8 animate-pulse" />
                              </motion.div>
                            )}
                            {/* Effervescence */}
                            {activeTest === 'NaHCO3_eff' && funcTests[activeTest] && (
                              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
                                <motion.div animate={{ y: -50, opacity: 0 }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-white rounded-full border border-slate-300"></motion.div>
                                <motion.div animate={{ y: -60, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-3 h-3 bg-white rounded-full border border-slate-300"></motion.div>
                              </div>
                            )}
                          </div>

                          {/* Reagent Drag Source */}
                          {funcTests[activeTest] === undefined ? (
                            <motion.div 
                              drag dragSnapToOrigin 
                              onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 40) performTest(activeTest); }}
                              className="cursor-grab active:cursor-grabbing flex flex-col items-center bg-white p-4 rounded-2xl shadow-md border border-slate-200"
                            >
                              <BottleSVG label="Reagent" color={activeTest === 'Fehling' ? '#3b82f6' : activeTest === 'DNP' ? '#f59e0b' : activeTest === 'Br2_water' ? '#ea580c' : '#94a3b8'} />
                              <span className="text-sm font-black text-blue-600 mt-2 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Drag Me</span>
                            </motion.div>
                          ) : (
                             <div className="w-24 flex flex-col items-center">
                               <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                               <span className="font-bold text-slate-600">Recorded</span>
                             </div>
                          )}
                       </div>

                       {funcTests[activeTest] !== undefined && (
                         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center gap-4">
                           <div className={`px-6 py-3 rounded-full font-black text-lg border-2 ${funcTests[activeTest] ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                             Result: {funcTests[activeTest] ? 'POSITIVE Reaction' : 'NEGATIVE / No Change'}
                           </div>
                           <button onClick={() => setActiveTest(null)} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-700">
                             Return to Test Menu
                           </button>
                         </motion.div>
                       )}
                    </motion.div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full"><Info className="inline w-4 h-4 mr-1"/> Need at least 2 tests.</span>
                    <button 
                      disabled={Object.keys(funcTests).length < 2}
                      onClick={() => setSimStep(5)}
                      className="px-8 py-4 rounded-2xl font-black text-white disabled:opacity-50 transition transform hover:-translate-y-0.5"
                      style={{ backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 50%, #16a34a 100%)' }}
                    >
                      Identify Compound <ArrowRight className="w-5 h-5 inline" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Identify */}
              {simStep === 5 && compound && (
                <div className="flex-1 flex flex-col bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-y-auto">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Data Summary Panel */}
                    <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 h-fit">
                      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-xl border-b border-slate-200 pb-4">
                        <Search className="w-5 h-5 text-blue-600"/> Lab Data Summary
                      </h3>
                      
                      <div className="space-y-4 text-sm">
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <strong className="text-slate-500 uppercase tracking-widest text-[10px] block mb-1">Organoleptic</strong>
                          <div className="font-bold text-slate-700">{organoleptic.state} • {organoleptic.color} • {organoleptic.odor}</div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <strong className="text-slate-500 uppercase tracking-widest text-[10px] block mb-1">Solubility</strong>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(solubility).map(([s, res]) => res !== null && (
                              <div key={s} className="flex items-center gap-1 font-bold text-slate-600">
                                {res ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <XCircle className="w-3 h-3 text-red-400"/>} {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <strong className="text-slate-500 uppercase tracking-widest text-[10px] block mb-1">Functional Tests</strong>
                          <div className="space-y-1 mt-2">
                            {Object.entries(funcTests).map(([t, res]) => (
                              <div key={t} className="flex justify-between items-center font-bold text-slate-600 text-xs">
                                <span>{t.replace('_',' ')}</span>
                                <span className={res ? 'text-green-600' : 'text-slate-400'}>{res ? 'POSITIVE' : 'NEGATIVE'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Identification Form */}
                    <div className="lg:col-span-7">
                      <h2 className="text-2xl font-black text-slate-800 mb-2">Final Identification</h2>
                      <p className="text-slate-500 mb-8 font-medium">Based on your lab data, what is the identity of the unknown compound?</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {PRESET_COMPOUNDS.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => {
                              if (c.id === compound.id) {
                                showToast(`Correct! Identity confirmed.`, 'success');
                                setSimStep(6);
                              } else {
                                showToast(`Incorrect. Review your data carefully.`, 'error');
                              }
                            }}
                            className="p-4 border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex flex-col gap-1"
                          >
                            <span className="text-lg">{c.name}</span>
                            <span className="text-xs text-slate-400 font-mono bg-slate-100 w-fit px-2 py-0.5 rounded">{c.formula}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 6: Success & Report */}
              {simStep === 6 && compound && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-200">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 mb-3">Lab Complete!</h2>
                  <p className="text-xl text-slate-600 mb-10">You successfully identified the compound as <strong className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{compound.name}</strong>.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                    <button onClick={generatePDF} className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black flex justify-center items-center gap-2 hover:bg-slate-900 transition shadow-md hover:shadow-lg">
                      <Download className="w-5 h-5" /> Download PDF Report
                    </button>
                    <button onClick={() => {
                        setCompound(null);
                        setOrganoleptic({state:'', color:'', odor:''});
                        setSolubility({water:null, ether:null, NaOH:null, NaHCO3:null, HCl:null});
                        setFuncTests({});
                        setSimStep(1);
                      }} 
                      className="flex-1 px-6 py-4 bg-blue-100 text-blue-700 rounded-2xl font-black flex justify-center items-center gap-2 hover:bg-blue-200 transition"
                    >
                      <RefreshCw className="w-5 h-5" /> New Unknown
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}