"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

// ──────────────────────────────────────
// DATA MODELS & CONSTANTS
// ──────────────────────────────────────

type GramReaction = "positive" | "negative" | "n/a";
type Morphology = "cocci" | "rods";
type Arrangement = "clusters" | "chains" | "pairs" | "single";

interface Bacterium {
  id: string;
  name: string;
  gram: GramReaction;
  morphology: Morphology;
  arrangement: Arrangement;
  hasSpore: boolean;
  hasCapsule: boolean;
}

const BACTERIA: Bacterium[] = [
  { id: "sa", name: "Staphylococcus aureus", gram: "positive", morphology: "cocci", arrangement: "clusters", hasSpore: false, hasCapsule: false },
  { id: "ec", name: "Escherichia coli", gram: "negative", morphology: "rods", arrangement: "single", hasSpore: false, hasCapsule: false },
  { id: "bs", name: "Bacillus subtilis", gram: "positive", morphology: "rods", arrangement: "chains", hasSpore: true, hasCapsule: false },
  { id: "sp", name: "Streptococcus pneumoniae", gram: "positive", morphology: "cocci", arrangement: "pairs", hasSpore: false, hasCapsule: true },
  { id: "pa", name: "Pseudomonas aeruginosa", gram: "negative", morphology: "rods", arrangement: "single", hasSpore: false, hasCapsule: false },
];

const TUTORIAL_SLIDES = [
  { emoji: "🔬", title: "Why Stain Bacteria?", text: "Bacterial cells are largely transparent. Staining adds contrast to reveal their shape, size, and arrangement under a microscope." },
  { emoji: "🎨", title: "Types of Staining", text: "Simple stains show basic morphology. Differential stains (like Gram) distinguish cell wall types. Special stains reveal specific structures like capsules or spores." },
  { emoji: "📋", title: "Staining Steps", text: "Most methods involve preparing a smear, heat‑fixing it to the slide, applying specific chemical reagents, rinsing, and observing under oil immersion." },
  { emoji: "🏥", title: "Clinical Relevance", text: "Rapid staining helps doctors choose the right antibiotics quickly. Detecting capsules or spores indicates specific virulence factors and resistance." },
];

const QUIZ_QUESTIONS = [
  { q: "What is the primary purpose of heat‑fixing a smear?", options: ["To make bacteria move faster", "To adhere bacteria to the slide and kill them", "To decolorize the cells", "To create a capsule"], answer: 1, exp: "Heat‑fixing kills the bacteria and permanently adheres them to the glass slide." },
  { q: "What color do Gram‑positive bacteria retain after a Gram stain?", options: ["Pink", "Green", "Purple", "Colorless"], answer: 2, exp: "Gram‑positive bacteria have thick peptidoglycan layers that trap the purple Crystal Violet stain." },
  { q: "Which reagent acts as a mordant in the Gram stain?", options: ["Crystal Violet", "Gram's Iodine", "Decolorizer (Alcohol)", "Safranin"], answer: 1, exp: "Gram's Iodine forms a complex with Crystal Violet, making it harder to wash out." },
  { q: "What structure does a capsule stain reveal?", options: ["The nucleus", "Flagella", "Peptidoglycan wall", "An outer polysaccharide layer"], answer: 3, exp: "The capsule is a thick, protective polysaccharide layer outside the cell wall." },
];

type StainingMethod = "gram" | "simple" | "capsule" | "spore";

interface Reagent {
  id: string;
  name: string;
  colorHex: string;
}

const METHODS_CONFIG: Record<StainingMethod, Reagent[]> = {
  gram: [
    { id: "cv", name: "Crystal Violet", colorHex: "#8B5CF6" },
    { id: "iod", name: "Gram's Iodine", colorHex: "#B45309" },
    { id: "alc", name: "Decolorizer", colorHex: "#D1D5DB" },
    { id: "saf", name: "Safranin", colorHex: "#EF4444" },
  ],
  simple: [{ id: "mb", name: "Methylene Blue", colorHex: "#3B82F6" }],
  capsule: [
    { id: "cr", name: "Congo Red", colorHex: "#DC2626" },
    { id: "man", name: "Maneval's Stain", colorHex: "#3B82F6" },
  ],
  spore: [
    { id: "mg", name: "Malachite Green", colorHex: "#10B981" },
    { id: "saf", name: "Safranin", colorHex: "#EF4444" },
  ],
};

// ──────────────────────────────────────
// CUSTOM SVG COMPONENTS (unchanged)
// ──────────────────────────────────────

const WireLoopTool = ({ used, onInteract }: { used: boolean; onInteract: () => void }) => (
  <motion.div
    drag dragSnapToOrigin dragElastic={0.2}
    onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 30 || Math.abs(info.offset.x) > 30) onInteract(); }}
    onClick={onInteract}
    className="relative cursor-pointer flex flex-col items-center group w-16"
  >
    <svg width="24" height="120" viewBox="0 0 24 120">
      <rect x="8" y="40" width="8" height="80" fill="#8B4513" rx="2" />
      <line x1="12" y1="10" x2="12" y2="40" stroke="#9CA3AF" strokeWidth="2" />
      <circle cx="12" cy="6" r="4" fill="none" stroke="#9CA3AF" strokeWidth="2" />
    </svg>
    <div className="mt-2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Wire Loop</div>
    {used && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 text-[10px]">✅</div>}
  </motion.div>
);

const BunsenBurner = ({ active }: { active: boolean }) => (
  <div className="flex flex-col items-center">
    <svg width="60" height="100" viewBox="0 0 60 100">
      <path d="M15 90 L45 90 L40 95 L20 95 Z" fill="#4B5563" />
      <rect x="25" y="40" width="10" height="50" fill="#9CA3AF" />
      <circle cx="30" cy="80" r="3" fill="#1F2937" />
      <AnimatePresence>
        {active && (
          <motion.path
            initial={{ opacity: 0, scaleY: 0.5 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
            d="M30 10 C20 30, 20 40, 30 40 C40 40, 40 30, 30 10 Z" fill="#F59E0B"
            style={{ transformOrigin: "bottom" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <motion.path
            initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
            d="M30 20 C25 35, 25 40, 30 40 C35 40, 35 35, 30 20 Z" fill="#3B82F6"
            style={{ transformOrigin: "bottom" }}
          />
        )}
      </AnimatePresence>
    </svg>
    <div className="mt-2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Bunsen Burner</div>
  </div>
);

const Slide = ({ hasSmear, smearColor, heatFixed }: { hasSmear: boolean; smearColor: string; heatFixed: boolean }) => (
  <div
    className="relative w-48 h-20 bg-white/50 backdrop-blur-sm border-2 shadow-inner flex items-center justify-center transition-all duration-300"
    style={{ borderColor: heatFixed ? "#F97316" : "#E5E7EB", borderRadius: "4px" }}
  >
    <div
      className="w-12 h-12 rounded-full transition-colors duration-500 ease-in-out border border-dashed border-gray-300"
      style={{ backgroundColor: hasSmear ? smearColor : "transparent", opacity: hasSmear ? 0.8 : 0 }}
    />
    {heatFixed && <span className="absolute top-1 right-1 text-sm">🔥</span>}
    <div className="absolute bottom-1 left-2 text-[10px] text-gray-400 font-mono">SLIDE‑01</div>
  </div>
);

const ReagentBottle = ({ reagent, applied, onInteract }: { reagent: Reagent; applied: boolean; onInteract: () => void }) => (
  <motion.div
    drag dragSnapToOrigin dragElastic={0.2}
    onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 30 || Math.abs(info.offset.x) > 30) onInteract(); }}
    onClick={onInteract}
    className="relative cursor-pointer flex flex-col items-center group w-16"
  >
    <svg width="36" height="60" viewBox="0 0 36 60">
      <rect x="14" y="0" width="8" height="10" fill="#1F2937" rx="2" />
      <path d="M10 10 L26 10 L30 20 L30 60 L6 60 L6 20 Z" fill="#374151" />
      <path d="M8 30 L28 30 L28 58 L8 58 Z" fill={reagent.colorHex} opacity="0.9" />
      <rect x="10" y="35" width="16" height="15" fill="white" rx="1" />
    </svg>
    <div className="mt-1 text-[10px] font-bold text-gray-700 text-center leading-tight bg-white px-1 py-0.5 rounded shadow-sm">
      {reagent.name}
    </div>
    {applied && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 text-[10px]">✅</div>}
  </motion.div>
);

const WashBottleTool = ({ used, onInteract }: { used: boolean; onInteract: () => void }) => (
  <motion.div
    drag dragSnapToOrigin dragElastic={0.2}
    onDragEnd={(_, info) => { if (Math.abs(info.offset.y) > 30 || Math.abs(info.offset.x) > 30) onInteract(); }}
    onClick={onInteract}
    className="relative cursor-pointer flex flex-col items-center group w-16"
  >
    <svg width="40" height="70" viewBox="0 0 40 70">
      <path d="M10 5 Q30 -10, 35 10" fill="none" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
      <rect x="16" y="10" width="8" height="10" fill="#1E3A8A" rx="2" />
      <rect x="8" y="20" width="24" height="46" fill="#BFDBFE" rx="4" opacity="0.8" />
      <text x="20" y="45" fontSize="10" textAnchor="middle" fill="#1E3A8A" fontWeight="bold">H₂O</text>
    </svg>
    <div className="mt-2 text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">Distilled Water</div>
    {used && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 text-[10px]">✅</div>}
  </motion.div>
);

// ──────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────

export default function StainingLabPage() {
  const [phase, setPhase] = useState<"tutorial" | "quiz" | "sim">("tutorial");
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [notif, setNotif] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  // Simulation state
  const [bacterium, setBacterium] = useState<Bacterium>(BACTERIA[0]);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<StainingMethod | null>(null);
  const [smear, setSmear] = useState(false);
  const [heat, setHeat] = useState(false);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [decoTime, setDecoTime] = useState(5);
  const [rinsed, setRinsed] = useState(false);
  const [showMicro, setShowMicro] = useState(false);

  // Set page metadata
  useEffect(() => {
    document.title = "Staining Lab – PharmaWallah";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = "Perform Gram, Simple, Capsule, and Spore staining on unknown bacteria. Identify organisms with realistic lab tools and a virtual microscope.";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Pick random bacterium on load
  useEffect(() => { resetSimulation(); }, []);

  const resetSimulation = () => {
    const randomBact = BACTERIA[Math.floor(Math.random() * BACTERIA.length)];
    setBacterium(randomBact);
    setStep(1);
    setMethod(null);
    setSmear(false);
    setHeat(false);
    setApplied({});
    setDecoTime(5);
    setRinsed(false);
    setShowMicro(false);
  };

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2800);
  };

  // Compute smear color
  const computeColor = () => {
    if (!smear) return "transparent";
    if (!method) return "#E5E7EB";
    if (method === "simple") return applied["mb"] ? "#3B82F6" : "#E5E7EB";
    if (method === "capsule") {
      if (applied["man"]) return "#3B82F6";
      if (applied["cr"]) return "#DC2626";
      return "#E5E7EB";
    }
    if (method === "spore") {
      if (applied["saf"]) return bacterium.hasSpore ? "#10B981" : "#EF4444";
      if (applied["mg"]) return bacterium.hasSpore ? "#10B981" : "#D1D5DB";
      return "#E5E7EB";
    }
    if (method === "gram") {
      const isPos = bacterium.gram === "positive";
      let c = "#E5E7EB";
      if (applied["cv"] || applied["iod"]) c = "#8B5CF6";
      if (applied["alc"]) c = isPos && decoTime <= 7 ? "#8B5CF6" : "#FDE68A";
      if (applied["saf"]) c = applied["alc"] ? (isPos && decoTime <= 7 ? "#8B5CF6" : "#EF4444") : "#8B5CF6";
      return c;
    }
    return "#E5E7EB";
  };

  const currentColor = computeColor();

  // ── ACCURATE OBSERVATION TEXT ──────────────────────────────
  const getObservation = (): string => {
    if (!method || !bacterium) return "No observation available.";
    const morph = bacterium.morphology;
    const arr = bacterium.arrangement;

    let colorDesc = currentColor; // fallback hex string
    let specialNote = "";

    if (method === "gram") {
      const isPos = bacterium.gram === "positive";
      const overDeco = isPos && decoTime > 7;
      if (applied["saf"]) {
        colorDesc = overDeco ? "pink (due to over‑decolorization)" : isPos ? "purple" : "pink";
      } else if (applied["alc"]) {
        colorDesc = overDeco ? "pale yellow (over‑decolorized)" : isPos ? "purple" : "colorless / faint yellow";
      } else {
        colorDesc = "purple";
      }
      if (overDeco) specialNote = "Over‑decolorization may cause Gram‑positive cells to appear Gram‑negative.";
    } else if (method === "simple") {
      colorDesc = applied["mb"] ? "blue" : "unstained";
    } else if (method === "capsule") {
      colorDesc = applied["man"] ? (bacterium.hasCapsule ? "blue cells surrounded by a clear halo" : "blue cells, no capsule visible") : applied["cr"] ? "red background" : "unstained";
    } else if (method === "spore") {
      if (applied["saf"]) {
        colorDesc = bacterium.hasSpore ? "green spores with pink vegetative cells" : "pink cells, no spores visible";
      } else if (applied["mg"]) {
        colorDesc = bacterium.hasSpore ? "green spores" : "no stained spores";
      } else {
        colorDesc = "unstained";
      }
    }

    return `Observed ${colorDesc} ${morph} in ${arr} arrangement.${specialNote ? " " + specialNote : ""}`;
  };

  const observationText = getObservation();

  // ── MICROSCOPE FIELD ─────────────────────────────────────────
  const MicroscopeField = () => {
    const items: JSX.Element[] = [];
    const isCapsule = method === "capsule" && applied["man"];
    const color = currentColor;

    const generateCoords = () => {
      if (bacterium.arrangement === "single") {
        return Array.from({ length: 15 }).map(() => ({ x: 20 + Math.random() * 160, y: 20 + Math.random() * 160, rot: Math.random() * 180 }));
      }
      if (bacterium.arrangement === "pairs") {
        return Array.from({ length: 10 }).map(() => ({ x: 30 + Math.random() * 140, y: 30 + Math.random() * 140, rot: Math.random() * 180 }));
      }
      if (bacterium.arrangement === "chains") {
        return Array.from({ length: 4 }).map(() => ({ x: 40 + Math.random() * 100, y: 40 + Math.random() * 100, rot: Math.random() * 180 }));
      }
      // clusters
      return Array.from({ length: 5 }).map(() => ({ x: 50 + Math.random() * 100, y: 50 + Math.random() * 100, rot: 0 }));
    };

    const clusters = generateCoords();
    let keyCounter = 0;

    clusters.forEach((pos) => {
      const drawCell = (cx: number, cy: number, rot: number) => {
        keyCounter++;
        return (
          <g key={keyCounter} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
            {bacterium.hasCapsule && isCapsule && (
              <rect
                x={bacterium.morphology === "rods" ? -15 : -12}
                y={bacterium.morphology === "rods" ? -8 : -12}
                width={bacterium.morphology === "rods" ? 30 : 24}
                height={bacterium.morphology === "rods" ? 16 : 24}
                rx="8" ry="8" fill="transparent" stroke="#FDE047" strokeWidth="4" opacity="0.6"
              />
            )}
            {bacterium.morphology === "rods" ? (
              <rect x="-10" y="-4" width="20" height="8" rx="4" ry="4" fill={color} />
            ) : (
              <circle cx="0" cy="0" r="6" fill={color} />
            )}
            {bacterium.hasSpore && method === "spore" && applied["mg"] && (
              <ellipse cx="0" cy="0" rx="3" ry="2" fill="#10B981" />
            )}
          </g>
        );
      };

      if (bacterium.arrangement === "single") {
        items.push(drawCell(pos.x, pos.y, pos.rot));
      } else if (bacterium.arrangement === "pairs") {
        items.push(drawCell(pos.x - 7, pos.y, pos.rot));
        items.push(drawCell(pos.x + 7, pos.y, pos.rot));
      } else if (bacterium.arrangement === "chains") {
        for (let i = 0; i < 6; i++) {
          items.push(drawCell(pos.x + i * 16, pos.y, pos.rot));
        }
      } else if (bacterium.arrangement === "clusters") {
        for (let i = 0; i < 8; i++) {
          items.push(drawCell(pos.x + (Math.random() * 20 - 10), pos.y + (Math.random() * 20 - 10), Math.random() * 180));
        }
      }
    });

    return (
      <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-8 border-gray-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] bg-[#111827]">
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-90">
          {items}
        </svg>
      </div>
    );
  };

  // ── REPORT GENERATION ──────────────────────────────────────
  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 28, "F");
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 26, pageWidth, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PharmaWallah", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Microbiology Staining Lab Report", pageWidth / 2, 22, { align: "center" });
    doc.text(new Date().toLocaleString("en-PK"), pageWidth - 15, 14, { align: "right" });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Staining Report", 14, 42);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const details = [
      ["Method", method?.toUpperCase() ?? "N/A"],
      ["Organism", bacterium.name],
      ["Observation", observationText],
      ["Gram Reaction", bacterium.gram],
      ["Morphology", bacterium.morphology],
      ["Arrangement", bacterium.arrangement],
      ["Spores", bacterium.hasSpore ? "Present" : "Absent"],
      ["Capsule", bacterium.hasCapsule ? "Present" : "Absent"],
    ];

    let y = 52;
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 18, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 58, y);
      y += 8;
    });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Generated by PharmaWallah – Pakistan’s #1 Pharmacy eLearning Platform", pageWidth / 2, 280, { align: "center" });

    doc.save(`PharmaWallah_Staining_${bacterium.name.replace(/\s+/g, "_")}.pdf`);
  };

  const handleApplyReagent = (reagentId: string) => {
    setApplied((prev) => ({ ...prev, [reagentId]: true }));
    showToast(`Applied ${METHODS_CONFIG[method as StainingMethod].find((r) => r.id === reagentId)?.name}`, "info");
  };

  const handleQuizAnswer = (idx: number) => {
    const isCorrect = idx === QUIZ_QUESTIONS[quizStep].answer;
    if (isCorrect) {
      setScore((s) => s + 1);
      showToast(`✅ Correct! ${QUIZ_QUESTIONS[quizStep].exp}`, "success");
    } else {
      showToast(`❌ Incorrect. ${QUIZ_QUESTIONS[quizStep].exp}`, "error");
    }
    setTimeout(() => {
      if (quizStep < 3) setQuizStep((s) => s + 1);
      else setPhase("sim");
    }, 3000);
  };

  const btnGradient = { backgroundImage: "linear-gradient(135deg, #2563EB, #10B981)" };
  const pageGradient = { backgroundImage: "linear-gradient(145deg, #EFF6FF 0%, #F0FDF4 50%, #EFF6FF 100%)" };

  return (
    <div style={pageGradient} className="min-h-screen text-gray-800 font-sans p-4 flex flex-col items-center selection:bg-blue-200">
      {/* Toast */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 z-50 px-6 py-3 rounded-full shadow-lg font-medium text-white max-w-sm text-center ${notif.type === "error" ? "bg-red-500" : notif.type === "success" ? "bg-green-500" : "bg-blue-600"
              }`}
          >
            {notif.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-md rounded-[20px] shadow-xl border border-gray-200 overflow-hidden min-h-[600px] flex flex-col relative">
        {/* Header */}
        <header className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">🔬</span> PharmaWallah Lab
          </h1>
          {phase === "sim" && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`w-2.5 h-2.5 rounded-full ${step > s ? "bg-green-500" : step === s ? "bg-blue-500" : "bg-gray-200"}`} />
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <AnimatePresence mode="wait">
            {/* Tutorial */}
            {phase === "tutorial" && (
              <motion.div key="tutorial" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full justify-center text-center">
                <div className="text-6xl mb-6">{TUTORIAL_SLIDES[slideIndex].emoji}</div>
                <h2 className="text-2xl font-bold mb-4 text-blue-900">{TUTORIAL_SLIDES[slideIndex].title}</h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">{TUTORIAL_SLIDES[slideIndex].text}</p>
                <div className="mt-auto flex justify-between items-center">
                  <button onClick={() => setSlideIndex((s) => Math.max(0, s - 1))} disabled={slideIndex === 0} className="px-4 py-2 font-semibold text-gray-500 disabled:opacity-30">Prev</button>
                  <div className="flex gap-1">{TUTORIAL_SLIDES.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === slideIndex ? "bg-blue-500" : "bg-gray-300"}`} />)}</div>
                  {slideIndex < TUTORIAL_SLIDES.length - 1 ? (
                    <button onClick={() => setSlideIndex((s) => Math.min(TUTORIAL_SLIDES.length - 1, s + 1))} style={btnGradient} className="px-6 py-2 rounded-[14px] text-white font-bold shadow-md">Next</button>
                  ) : (
                    <button onClick={() => setPhase("quiz")} style={btnGradient} className="px-6 py-2 rounded-[14px] text-white font-bold shadow-md">Take Quiz ▶</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quiz */}
            {phase === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-900">Knowledge Check</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">Q {quizStep + 1}/4</span>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-6">{QUIZ_QUESTIONS[quizStep].q}</p>
                <div className="flex flex-col gap-3">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                    <button key={i} onClick={() => handleQuizAnswer(i)} className="p-4 text-left border-2 border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium text-gray-700 active:scale-95">{opt}</button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Simulation Steps */}
            {phase === "sim" && step === 1 && (
              <motion.div key="sim-step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Step 1: Select Staining Method</h2>
                <p className="text-gray-500 mb-6 text-sm">Choose a laboratory technique to proceed with the sample.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "gram", emoji: "🧫", title: "Gram Stain", desc: "Differentiate cell walls" },
                    { id: "simple", emoji: "🔵", title: "Simple Stain", desc: "Basic morphology" },
                    { id: "capsule", emoji: "🛡️", title: "Capsule Stain", desc: "Reveal outer layers" },
                    { id: "spore", emoji: "🌱", title: "Spore Stain", desc: "Detect endospores" },
                  ].map((m) => (
                    <button key={m.id} onClick={() => { setMethod(m.id as StainingMethod); setStep(2); }} className="p-4 border border-gray-200 rounded-[14px] bg-white hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="font-bold text-gray-800">{m.title}</span>
                      <span className="text-xs text-gray-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === "sim" && step === 2 && (
              <motion.div key="sim-step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full items-center text-center">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Step 2: Prepare Smear</h2>
                <p className="text-gray-500 mb-8 text-sm">Drag or tap the wire loop to smear bacteria. Then heat fix.</p>
                <div className="flex gap-8 mb-12 items-end">
                  <WireLoopTool used={smear} onInteract={() => { setSmear(true); showToast("Smear applied!", "success"); }} />
                  <BunsenBurner active={!heat} />
                </div>
                <Slide hasSmear={smear} smearColor={currentColor} heatFixed={heat} />
                <div className="mt-auto w-full flex justify-between gap-4 pt-6">
                  <button disabled={!smear || heat} onClick={() => { setHeat(true); showToast("Slide heat‑fixed!", "success"); }} className="flex-1 py-3 rounded-[14px] font-bold transition-all bg-orange-100 text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-200">🔥 Heat Fix Slide</button>
                  <button disabled={!heat} onClick={() => setStep(3)} style={heat ? btnGradient : {}} className={`flex-1 py-3 rounded-[14px] font-bold text-white transition-all ${!heat ? "bg-gray-300" : "shadow-md"}`}>Next ➔</button>
                </div>
              </motion.div>
            )}

            {phase === "sim" && step === 3 && method && (
              <motion.div key="sim-step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full items-center text-center">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Step 3: Apply Reagents</h2>
                <p className="text-gray-500 mb-6 text-sm">Tap or drag reagents onto the slide. Order matters!</p>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {METHODS_CONFIG[method].map((r) => (
                    <ReagentBottle key={r.id} reagent={r} applied={!!applied[r.id]} onInteract={() => handleApplyReagent(r.id)} />
                  ))}
                </div>
                {method === "gram" && applied["alc"] && !applied["saf"] && (
                  <div className="w-full px-4 mb-6">
                    <label className="text-xs font-bold text-gray-600 block mb-2">Decolorization Time (sec): {decoTime}s</label>
                    <input type="range" min="0" max="15" value={decoTime} onChange={(e) => setDecoTime(parseInt(e.target.value))} className="w-full accent-blue-500" />
                    {decoTime > 7 && <p className="text-red-500 text-xs mt-1 font-bold">⚠️ Over‑decolorized!</p>}
                  </div>
                )}
                <Slide hasSmear={smear} smearColor={currentColor} heatFixed={heat} />
                <div className="mt-auto w-full pt-6">
                  <button disabled={Object.keys(applied).length < METHODS_CONFIG[method].length} onClick={() => setStep(4)} style={Object.keys(applied).length >= METHODS_CONFIG[method].length ? btnGradient : {}} className={`w-full py-3 rounded-[14px] font-bold text-white transition-all ${Object.keys(applied).length < METHODS_CONFIG[method].length ? "bg-gray-300" : "shadow-md"}`}>Rinse & Observe ➔</button>
                </div>
              </motion.div>
            )}

            {phase === "sim" && step === 4 && (
              <motion.div key="sim-step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full items-center text-center">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Step 4: Rinse & Observe</h2>
                <p className="text-gray-500 mb-8 text-sm">Gently rinse the slide with water, then view under microscope.</p>
                <div className="flex gap-8 mb-12 items-end">
                  <WashBottleTool used={rinsed} onInteract={() => { setRinsed(true); showToast("Slide rinsed!", "info"); }} />
                </div>
                <Slide hasSmear={smear} smearColor={currentColor} heatFixed={heat} />
                <div className="mt-auto w-full pt-6">
                  <button disabled={!rinsed} onClick={() => setShowMicro(true)} style={rinsed ? btnGradient : {}} className={`w-full py-3 rounded-[14px] font-bold text-white transition-all flex items-center justify-center gap-2 ${!rinsed ? "bg-gray-300" : "shadow-md"}`}>
                    <span className="text-lg">🔬</span> View Under Microscope
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "sim" && step === 5 && (
              <motion.div key="sim-step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Results & Report</h2>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">Identified: <span className="italic">{bacterium.name}</span></h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex justify-between"><strong>Gram Reaction:</strong> <span className="capitalize">{bacterium.gram}</span></li>
                    <li className="flex justify-between"><strong>Morphology:</strong> <span className="capitalize">{bacterium.morphology}</span></li>
                    <li className="flex justify-between"><strong>Arrangement:</strong> <span className="capitalize">{bacterium.arrangement}</span></li>
                    <li className="flex justify-between"><strong>Spores:</strong> <span>{bacterium.hasSpore ? "✅ Present" : "❌ Absent"}</span></li>
                    <li className="flex justify-between"><strong>Capsule:</strong> <span>{bacterium.hasCapsule ? "✅ Present" : "❌ Absent"}</span></li>
                  </ul>
                </div>
                <div className="mt-auto flex gap-4">
                  <button onClick={resetSimulation} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-[14px] hover:bg-gray-200 transition-colors">🔄 New</button>
                  <button onClick={generateReport} style={btnGradient} className="flex-[2] py-3 text-white font-bold rounded-[14px] shadow-md hover:opacity-90 transition-opacity">📄 Download Report</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Microscope Modal */}
        <AnimatePresence>
          {showMicro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-6"
            >
              <h3 className="text-white font-bold text-lg mb-6">Oil Immersion (1000×)</h3>
              <MicroscopeField />
              <p className="text-gray-300 mt-8 mb-6 text-center italic max-w-xs leading-relaxed">
                {observationText}
              </p>
              <button
                onClick={() => { setShowMicro(false); setStep(5); }}
                style={btnGradient}
                className="px-8 py-3 rounded-full font-bold text-white shadow-lg shadow-blue-500/30"
              >
                Continue to Results ➔
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}