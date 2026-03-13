"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, Award, Shuffle,
  CheckCircle, XCircle, RotateCcw, Trophy, ZoomIn, X,
  Images, Clock, AlertTriangle, Microscope as MicIcon,
} from "lucide-react";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity,
} from "lucide-react";

// ─── Site-wide gradient ───────────────────────────────────────────────────────
const GRAD = "from-blue-600 to-green-400";

// ─── Fixed BG icons ───────────────────────────────────────────────────────────
const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE DATA — 10 histology slides · 2 images each
// ═══════════════════════════════════════════════════════════════════════════════
const SLIDE_DATA = [
  {
    id: "lungs",
    title: "Lungs",
    category: "Respiratory System",
    images: [
      { url: "/images/spotting/histology/lungs.jpg" },
      { url: "/images/spotting/histology/lungs-high.jpg" },
    ],
    options: ["Lungs", "Kidney", "Liver", "Spleen"],
    correctOptionIndex: 0,
    definition: [
      "Recognizable alveolar structure",
      "Visible bronchial passage",
      "Presence of lung tissue with distinct lobes",
      "Observation of pulmonary blood vessels",
    ],
    keyFeatures: ["Alveolar structures", "Bronchial passage", "Distinct lung lobes", "Pulmonary blood vessels"],
    lessonDetailed:
      "Lung histology is characterised by thin-walled alveoli — the gas-exchange units — lined by type I (flat) and type II (cuboidal) pneumocytes. Bronchioles lead air into alveolar ducts and alveolar sacs. The interstitium contains a rich capillary network for O₂/CO₂ exchange. Distinct lobes are separated by connective tissue septa.",
  },
  {
    id: "stomach",
    title: "Stomach",
    category: "Digestive System",
    images: [
      { url: "/images/spotting/histology/stomach.jpg" },
      { url: "/images/spotting/histology/stomach-high.jpg" },
    ],
    options: ["Stomach", "Small Intestine", "Oesophagus", "Large Intestine"],
    correctOptionIndex: 0,
    definition: [
      "Identification of gastric pits",
      "Observation of gastric glands",
      "Detection of mucosal lining",
      "Presence of rugae (folds) in the stomach lining",
    ],
    keyFeatures: ["Gastric pits", "Gastric glands", "Mucosal lining", "Rugae (folds)"],
    lessonDetailed:
      "The stomach wall has four layers — mucosa, submucosa, muscularis externa, and serosa. The mucosa is thrown into longitudinal folds called rugae. Simple columnar epithelium dips down to form gastric pits, opening into tubular gastric glands containing parietal cells (HCl), chief cells (pepsinogen), and mucous neck cells.",
  },
  {
    id: "kidney",
    title: "Kidney",
    category: "Urinary System",
    images: [
      { url: "/images/spotting/histology/kidney.jpg" },
      { url: "/images/spotting/histology/kidney-high.jpg" },
    ],
    options: ["Kidney", "Liver", "Adrenal Gland", "Pancreas"],
    correctOptionIndex: 0,
    definition: [
      "Observation of renal tubules",
      "Detection of glomeruli",
      "Recognition of renal corpuscles",
      "Visualization of renal blood vessels",
    ],
    keyFeatures: ["Renal tubules", "Glomeruli", "Renal corpuscles", "Renal blood vessels"],
    lessonDetailed:
      "Kidney cortex contains renal corpuscles — a glomerulus (capillary tuft) enclosed in Bowman's capsule — alongside proximal and distal convoluted tubules. The medulla contains loops of Henle and collecting ducts arranged in pyramids. Rich peritubular capillary networks support tubular reabsorption and secretion.",
  },
  {
    id: "small-intestine",
    title: "Small Intestine",
    category: "Digestive System",
    images: [
      { url: "/images/spotting/histology/small-intestine.jpg" },
      { url: "/images/spotting/histology/small-intestine-high.jpg" },
    ],
    options: ["Small Intestine", "Large Intestine", "Stomach", "Appendix"],
    correctOptionIndex: 0,
    definition: [
      "Detection of villi on the mucosal surface",
      "Identification of intestinal crypts (Crypts of Lieberkühn)",
      "Observation of intestinal glands",
      "Presence of Peyer's patches",
    ],
    keyFeatures: ["Villi on mucosal surface", "Crypts of Lieberkühn", "Intestinal glands", "Peyer's patches"],
    lessonDetailed:
      "The small intestine mucosa has finger-like villi that project into the lumen, dramatically increasing surface area, lined by enterocytes with microvilli (brush border). Crypts of Lieberkühn at the base contain stem cells, Paneth cells, and goblet cells. Peyer's patches — aggregated lymphoid nodules — are prominent in the ileum submucosa.",
  },
  {
    id: "large-intestine",
    title: "Large Intestine",
    category: "Digestive System",
    images: [
      { url: "/images/spotting/histology/large-intestine.jpg" },
      { url: "/images/spotting/histology/large-intestine-high.jpg" },
    ],
    options: ["Large Intestine", "Small Intestine", "Rectum", "Appendix"],
    correctOptionIndex: 0,
    definition: [
      "Identification of numerous goblet cells",
      "Observation of prominent taeniae coli",
      "Visualization of abundant lymphoid tissue in the mucosa",
      "Detection of haustra in the colon",
    ],
    keyFeatures: ["Numerous goblet cells", "Taeniae coli", "Abundant mucosal lymphoid tissue", "Haustra"],
    lessonDetailed:
      "The large intestine lacks villi. Its mucosa has straight, parallel crypts packed with goblet cells secreting mucus. The outer longitudinal muscle layer condenses into three bands called taeniae coli; their contraction creates sacculations known as haustra. Abundant lymphoid tissue is scattered throughout the lamina propria.",
  },
  {
    id: "appendix",
    title: "Appendix",
    category: "Lymphoid / GI",
    images: [
      { url: "/images/spotting/histology/appendix.jpg" },
      { url: "/images/spotting/histology/appendix-high.jpg" },
    ],
    options: ["Appendix", "Large Intestine", "Small Intestine", "Lymph Node"],
    correctOptionIndex: 0,
    definition: [
      "Identification of abundant lymphoid tissue",
      "Observation of mucosal folds",
      "Detection of epithelial lining",
      "Presence of lymphoid follicles in the submucosa",
    ],
    keyFeatures: ["Abundant lymphoid tissue", "Mucosal folds", "Epithelial lining", "Submucosal lymphoid follicles"],
    lessonDetailed:
      "The appendix resembles the large intestine but is distinguished by its enormous lymphoid tissue load — prominent follicles span the mucosa and submucosa. The lumen is small and irregular with mucosal folds. Simple columnar epithelium lines the crypts; goblet cells are present but fewer than in the colon.",
  },
  {
    id: "smooth-muscle",
    title: "Smooth Muscle",
    category: "Muscle Tissue",
    images: [
      { url: "/images/spotting/histology/smooth-muscle.jpg" },
      { url: "/images/spotting/histology/smooth-muscle-high.jpg" },
    ],
    options: ["Smooth Muscle", "Skeletal Muscle", "Cardiac Muscle", "Dense Connective Tissue"],
    correctOptionIndex: 0,
    definition: [
      "Observation of spindle-shaped cells",
      "Presence of central nuclei",
      "Detection of dense bodies or plaques",
      "Visualization of capillaries around muscle bundles",
    ],
    keyFeatures: ["Spindle-shaped cells", "Central nuclei", "Dense bodies / plaques", "Surrounding capillaries"],
    lessonDetailed:
      "Smooth muscle is non-striated, involuntary muscle found in hollow viscera, blood vessels, and airways. Cells are elongated spindles with a single, centrally placed oval nucleus. Thick and thin filaments attach to dense bodies (intracellular) and dense plaques (membrane-associated). No sarcomeres → no striations.",
  },
  {
    id: "skeletal-muscle",
    title: "Skeletal Muscle",
    category: "Muscle Tissue",
    images: [
      { url: "/images/spotting/histology/skeletal-muscle.jpg" },
      { url: "/images/spotting/histology/skeletal-muscle-high.jpg" },
    ],
    options: ["Skeletal Muscle", "Smooth Muscle", "Cardiac Muscle", "Tendon"],
    correctOptionIndex: 0,
    definition: [
      "Presence of striations",
      "Observation of multinucleated muscle fibres",
      "Detection of peripheral nuclei",
      "Identification of alternating light (I) and dark (A) bands",
    ],
    keyFeatures: ["Cross striations", "Multinucleated fibres", "Peripheral nuclei", "Alternating I and A bands"],
    lessonDetailed:
      "Skeletal muscle is striated voluntary muscle. Each fibre is a syncytium — multiple nuclei pushed to the periphery beneath the sarcolemma. The regular arrangement of sarcomeres (actin I-bands + myosin A-bands with H-zone and Z-lines) creates characteristic cross-striations. Fibres are grouped into fascicles by perimysium.",
  },
  {
    id: "rbcs",
    title: "Red Blood Cells (RBCs)",
    category: "Blood / Haematology",
    images: [
      { url: "/images/spotting/histology/rbcs.jpg" },
      { url: "/images/spotting/histology/rbcs-high.jpg" },
    ],
    options: ["Red Blood Cells (RBCs)", "Platelets", "White Blood Cells", "Reticulocytes"],
    correctOptionIndex: 0,
    definition: [
      "Observation of biconcave disc shape",
      "Identification of red colouration due to haemoglobin",
      "Recognition of flexible and deformable structure",
      "Measurement of approximately 7–8 micrometres in diameter",
    ],
    keyFeatures: ["Biconcave disc shape", "Red colour (haemoglobin)", "Flexible / deformable", "~7–8 µm diameter"],
    lessonDetailed:
      "Mature RBCs (erythrocytes) are anucleate biconcave discs optimised for oxygen transport. The biconcave shape maximises surface-area-to-volume ratio for gas diffusion and creates central pallor on H&E. They are filled with haemoglobin (eosinophilic staining) and are highly deformable. Diameter ~7–8 µm — used as a histological size reference.",
  },
  {
    id: "stratified-squamous-epithelium",
    title: "Stratified Squamous Epithelium",
    category: "Epithelial Tissue",
    images: [
      { url: "/images/spotting/histology/stratified-squamous-epithelium.jpg" },
      { url: "/images/spotting/histology/stratified-squamous-epithelium-high.jpg" },
    ],
    options: ["Stratified Squamous Epithelium", "Simple Columnar Epithelium", "Transitional Epithelium", "Pseudostratified Epithelium"],
    correctOptionIndex: 0,
    definition: [
      "Recognition of multiple layers of cells",
      "Identification of flattened cells at the surface",
      "Detection of cuboidal / columnar basal cells at the base",
      "Presence of nuclei at various levels throughout the layers",
    ],
    keyFeatures: ["Multiple cell layers", "Flattened surface cells", "Basal cuboidal/columnar cells", "Nuclei at various levels"],
    lessonDetailed:
      "Stratified squamous epithelium provides mechanical protection in areas subject to abrasion — skin (keratinised) and oral cavity, oesophagus, vagina (non-keratinised). Multiple layers: columnar/cuboidal basal cells on the basement membrane, intermediate polygonal cells, and progressively flattened surface cells. Nuclei are present at all levels in non-keratinised forms.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════
const REFERENCES = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas (8th ed.).", publisher: "Wolters Kluwer.", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology (6th ed.).", publisher: "Churchill Livingstone.", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas (13th ed.).", publisher: "McGraw-Hill.", year: "2013" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease (10th ed.).", publisher: "Elsevier.", year: "2020" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations (13th ed.).", publisher: "Wolters Kluwer.", year: "2017" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calculateMatch(userText: string, definition: string[]): number {
  const defText = definition.join(" ");
  const STOP = new Set<string>([
    "the", "and", "for", "with", "that", "this", "are", "was", "from", "into", "have", "also",
    "they", "its", "not", "but", "all", "has", "our", "more", "some", "been", "their", "there",
    "when", "which", "present", "cells", "cell", "of", "in", "at", "to",
  ]);
  const tok = (s: string): string[] =>
    s.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w: string) => w.length > 3 && !STOP.has(w));
  const userSet = new Set<string>(tok(userText));
  const defSet  = new Set<string>(tok(defText));
  if (!defSet.size) return 0;
  let matches = 0;
  userSet.forEach((w) => { if (defSet.has(w)) matches++; });
  return Math.min(100, Math.round((matches / defSet.size) * 100));
}

function scoreBadge(s: number) {
  if (s >= 75) return "text-green-700 bg-green-50 border-green-200";
  if (s >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}
function scoreLabel(s: number) {
  if (s >= 75) return "Excellent — spot-on recognition!";
  if (s >= 40) return "Good effort — compare your points below.";
  return "Study the key features carefully and try again.";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  submitted: boolean;
  matchScore: number;
}
type Slide = typeof SLIDE_DATA[number];

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════════════════════════════════
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        <Image src={src} alt="Histology slide" width={1400} height={900}
          className="w-full object-contain bg-gray-950" style={{ maxHeight: "84vh" }} />
        <button onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition">
          <X className="w-4 h-4" />
        </button>
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-[10px] whitespace-nowrap">
          Press Esc or tap outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE GALLERY  — 2 images (Low power / High power)
// ═══════════════════════════════════════════════════════════════════════════════
function ImageGallery({ images }: { images: Slide["images"] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox,  setLightbox]  = useState(false);
  useEffect(() => { setActiveIdx(0); }, [images]);

  const active     = images[activeIdx];
  const powerLabel = (i: number) => (["Low ×", "High ×"])[i] ?? `${i + 1}×`;

  return (
    <>
      <AnimatePresence mode="wait">
        {lightbox && <Lightbox key="lb" src={active.url} onClose={() => setLightbox(false)} />}
      </AnimatePresence>

      <div className="space-y-2">
        {/* Main image */}
        <div
          className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden group cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD} z-10`} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="relative w-full bg-gray-50"
              style={{ height: 230 }}
            >
              <Image
                src={active.url} alt="Histology slide" fill
                className="object-contain"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 600px"
              />
              {/* Zoom badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-3 h-3" /> Zoom
              </div>
              {/* Counter */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold pointer-events-none">
                <Images className="w-3 h-3" /> {activeIdx + 1}/{images.length}
              </div>
              {/* Power badge */}
              <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r ${GRAD} text-white text-[10px] font-extrabold pointer-events-none`}>
                {powerLabel(activeIdx)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              title={`${powerLabel(i)} power`}
              className={`relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200 group/t ${
                i === activeIdx
                  ? "border-blue-500 shadow-md shadow-blue-200/40 scale-[1.03]"
                  : "border-gray-200 hover:border-blue-300 hover:scale-[1.02]"
              }`}
              style={{ height: 58 }}
            >
              <Image src={img.url} alt={`View ${i + 1}`} fill className="object-cover" sizes="200px" />
              <div className={`absolute inset-0 transition-opacity ${
                i === activeIdx ? "bg-blue-600/15" : "bg-black/0 group-hover/t:bg-black/10"
              }`} />
              {i === activeIdx && (
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
              )}
              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 text-white text-[8px] font-extrabold uppercase">
                {(["Low", "High"])[i] ?? i + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Mobile prev / next */}
        <div className="flex gap-2 sm:hidden">
          <button
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            disabled={activeIdx === images.length - 1}
            onClick={() => setActiveIdx(i => Math.min(images.length - 1, i + 1))}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES BLOCK
// ═══════════════════════════════════════════════════════════════════════════════
function ReferencesBlock() {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">References</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 shrink-0">
            {REFERENCES.length} sources
          </span>
        </div>
        <ol className="space-y-2.5">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[9px] font-extrabold text-blue-700 shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="text-gray-400">{ref.authors} </span>
                <em className="font-semibold text-gray-900">{ref.title}</em>
                <span className="text-gray-400"> {ref.publisher} {ref.year}.</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
          <strong className="text-gray-500">Disclaimer:</strong> Content is for educational review only. Clinical diagnosis requires a qualified professional.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HistologyTestPage() {
  const [slides,   setSlides]   = useState<typeof SLIDE_DATA>(SLIDE_DATA);
  const [mounted,  setMounted]  = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SlideAnswer[]>(
    SLIDE_DATA.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 }))
  );
  const [testCompleted, setTestCompleted] = useState(false);

  // ── 20-min timer ────────────────────────────────────────────────────────────
  const TOTAL_SECONDS = 20 * 60;
  const [timeLeft,     setTimeLeft]     = useState(TOTAL_SECONDS);
  const [timerActive,  setTimerActive]  = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const shuffled = shuffle([...SLIDE_DATA]);
    setSlides(shuffled);
    setAnswers(shuffled.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    setMounted(true);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (!timerActive || testCompleted) return;
    if (timeLeft <= 0) {
      setTimerExpired(true);
      setTimerActive(false);
      setTestCompleted(true);
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft, testCompleted]);

  const timerMins   = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const timerSecs   = String(timeLeft % 60).padStart(2, "0");
  const timerUrgent = timeLeft <= 120;

  const current       = slides[currentIndex];
  const currentAnswer = answers[currentIndex];
  const allSubmitted  = answers.every(a => a.submitted);
  const submittedCount = answers.filter(a => a.submitted).length;

  const shuffledOptions = useMemo(() => {
    if (!mounted) return current.options.map((text, origIdx) => ({ text, origIdx }));
    return shuffle(current.options.map((text, origIdx) => ({ text, origIdx })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.selectedOption === null || !currentAnswer.points.trim()) {
      alert("Please select an answer and write your recognition points before submitting.");
      return;
    }
    const score = calculateMatch(currentAnswer.points, current.definition);
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { ...a, submitted: true, matchScore: score } : a
    ));
  };

  const handleReset = () => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { selectedOption: null, points: "", submitted: false, matchScore: 0 } : a
    ));
  };

  const setOption = (origIdx: number) => {
    if (currentAnswer.submitted) return;
    setAnswers(prev => prev.map((a, i) => i === currentIndex ? { ...a, selectedOption: origIdx } : a));
  };
  const setPoints = (val: string) => {
    if (currentAnswer.submitted) return;
    setAnswers(prev => prev.map((a, i) => i === currentIndex ? { ...a, points: val } : a));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (testCompleted) {
    const totalCorrect = answers.filter((a, i) =>
      a.selectedOption !== null && slides[i].options[a.selectedOption] === slides[i].title
    ).length;
    const avgMatch = (answers.reduce((s, a) => s + a.matchScore, 0) / answers.length).toFixed(1);
    const pct      = Math.round((totalCorrect / slides.length) * 100);

    return (
      <section className="min-h-screen bg-white relative overflow-x-hidden">
        {BG_ICONS.map(({ Icon, top, left, size }, i) => (
          <div key={i} className="fixed pointer-events-none text-blue-100 z-0" style={{ top, left }}>
            <Icon size={size} strokeWidth={1.4} />
          </div>
        ))}

        {/* Hero */}
        <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
            <Trophy size={64} className="text-white" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
              <Trophy className="w-3.5 h-3.5" /> Test Complete
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Your Results</h1>
            {timerExpired && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 text-white text-xs font-bold mb-4 border border-red-400/60">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Time&apos;s up! 20 minutes elapsed.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { n: `${totalCorrect}/${slides.length}`, l: "Correct Slides" },
                { n: `${pct}%`,                          l: "MCQ Score"       },
                { n: `${avgMatch}%`,                     l: "Avg Match Score" },
                { n: pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📚", l: "Grade"  },
              ].map(({ n, l }) => (
                <div key={l} className="bg-white/15 rounded-2xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                  <div className="text-xs text-green-100 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-slide summary */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-3">
          <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            Slide-by-Slide Summary
          </h2>

          {slides.map((slide, idx) => {
            const ans       = answers[idx];
            const isCorrect = ans.selectedOption !== null && slide.options[ans.selectedOption] === slide.title;
            return (
              <div key={slide.id} className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* thumbnail */}
                  <div className="relative w-14 h-11 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <Image src={slide.images[0].url} alt={slide.title} fill className="object-cover" sizes="56px" />
                  </div>
                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-gray-900 text-sm">{slide.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{slide.category}</span>
                      {isCorrect
                        ? <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700"><CheckCircle className="w-2.5 h-2.5" /> Correct</span>
                        : <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700"><XCircle className="w-2.5 h-2.5" /> Incorrect</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your answer: <span className="font-semibold text-gray-600">{ans.selectedOption !== null ? slide.options[ans.selectedOption] : "—"}</span>
                      {!isCorrect && <span className="ml-2 text-blue-600">✓ <strong>{slide.title}</strong></span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {slide.keyFeatures.slice(0, 3).map(f => (
                        <span key={f} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">{f}</span>
                      ))}
                    </div>
                  </div>
                  {/* score + lesson link */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${scoreBadge(ans.matchScore)}`}>
                      {ans.matchScore}% match
                    </span>
                    <Link href={`/spotting/histology/lessons/${slide.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-green-600 transition-colors">
                      Lesson <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button onClick={() => window.location.reload()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all`}>
              <Shuffle className="w-4 h-4" /> Retake (Reshuffled)
            </button>
            <Link href="/spotting"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back to Spotting Centre
            </Link>
          </div>

          <ReferencesBlock />
        </div>
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN TEST UI
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ════ HERO ════ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-16 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
          <Dna size={60} className="text-white" />
        </div>
        <div className="absolute right-20 sm:right-44 top-5 opacity-15 pointer-events-none">
          <Activity size={36} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
          <Link href="/spotting"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Spotting Centre
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                <MicIcon className="w-3 h-3" /> Histology Spotting Test · {current.category}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Histology Spotting Test
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-2 max-w-md">
                <strong className="text-white">{current.images.length} views</strong> per slide — study both, then select the tissue and write your identification points.
              </p>
            </div>

            {/* Slide progress pills */}
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  title={`Slide ${i + 1}`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[9px] sm:text-xs font-extrabold transition-all duration-200 ${
                    i === currentIndex
                      ? "bg-white text-blue-700 shadow-md scale-110"
                      : answers[i].submitted
                        ? "bg-white/30 text-white"
                        : "bg-white/15 text-white/60 hover:bg-white/25"
                  }`}
                >
                  {answers[i].submitted
                    ? (slides[i].options[answers[i].selectedOption!] === slides[i].title ? "✓" : "✗")
                    : i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${(submittedCount / slides.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/60 mt-1.5">
            <span>Slide {currentIndex + 1} of {slides.length}</span>
            {/* Timer */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-sm transition-all ${
              timerUrgent
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                : "bg-white/20 text-white"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {timerMins}:{timerSecs}
            </div>
            <span>{submittedCount}/{slides.length} answered</span>
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="grid lg:grid-cols-2 gap-4 lg:gap-8"
          >
            {/* ── LEFT: gallery + MCQ ── */}
            <div className="space-y-4">

              {/* Slide chip */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0 shadow-md shadow-blue-200/40`}>
                  <MicIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                    Slide {currentIndex + 1} of {slides.length} · {current.category}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    Study both views before answering
                  </p>
                </div>
              </div>

              {/* Image gallery */}
              <ImageGallery images={current.images} />

              {/* Key features — revealed after submit */}
              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-4"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">
                      Key Identifying Features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.keyFeatures.map(f => (
                        <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MCQ */}
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0">?</span>
                    Identify this tissue:
                  </h3>
                  <div className="space-y-2">
                    {shuffledOptions.map(({ text, origIdx }) => {
                      const isSelected    = currentAnswer.selectedOption === origIdx;
                      const isCorrectOpt  = origIdx === current.correctOptionIndex;
                      let state = "default";
                      if (currentAnswer.submitted) {
                        if (isCorrectOpt) state = "correct";
                        else if (isSelected) state = "wrong";
                      } else if (isSelected) state = "selected";

                      return (
                        <label
                          key={origIdx}
                          onClick={() => setOption(origIdx)}
                          className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${
                            state === "correct"  ? "border-green-400 bg-green-50 cursor-default" :
                            state === "wrong"    ? "border-red-400 bg-red-50 cursor-default" :
                            state === "selected" ? "border-blue-500 bg-blue-50 cursor-pointer" :
                            currentAnswer.submitted ? "border-gray-100 bg-gray-50/50 cursor-default opacity-40" :
                            "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                          }`}
                        >
                          <input
                            type="radio" name="slideOption" value={origIdx}
                            checked={isSelected} disabled={currentAnswer.submitted}
                            onChange={() => setOption(origIdx)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0"
                          />
                          <span className={`text-sm font-semibold flex-1 ${
                            state === "correct" ? "text-green-800" :
                            state === "wrong"   ? "text-red-700"   : "text-gray-800"
                          }`}>{text}</span>
                          {currentAnswer.submitted && state === "correct" && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                          {currentAnswer.submitted && state === "wrong"   && <XCircle    className="w-4 h-4 text-red-500 shrink-0"   />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: points textarea + feedback ── */}
            <div className="space-y-4">

              {/* Points textarea */}
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    Points of Identification
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Write the key histological features that helped you identify this tissue. Study both views first!
                  </p>
                  <textarea
                    value={currentAnswer.points}
                    onChange={e => setPoints(e.target.value)}
                    rows={7}
                    disabled={currentAnswer.submitted}
                    placeholder={`e.g., ${current.keyFeatures[0].toLowerCase()}, ${(current.keyFeatures[1] ?? "").toLowerCase()}...`}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm text-gray-800 placeholder:text-gray-400 bg-white disabled:bg-gray-50 disabled:text-gray-500 resize-none transition-colors"
                  />
                  {!currentAnswer.submitted ? (
                    <button
                      onClick={handleSubmit}
                      className={`mt-3 w-full py-3 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="mt-3 w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4"
                  >
                    {/* Match score */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" /> Match Score
                          </h3>
                          <span className={`text-base sm:text-lg font-extrabold px-3 py-1 rounded-xl border ${scoreBadge(currentAnswer.matchScore)}`}>
                            {currentAnswer.matchScore}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${GRAD} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${currentAnswer.matchScore}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{scoreLabel(currentAnswer.matchScore)}</p>
                      </div>
                    </div>

                    {/* Points comparison */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <div className="p-4 sm:p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                            Expected Points of Identification
                          </p>
                          <ol className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                            {current.definition.map((point, pi) => (
                              <li key={pi} className="flex gap-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                                <span className="w-5 h-5 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-[9px] font-extrabold text-blue-700 shrink-0 mt-0.5">
                                  {pi + 1}
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                            Your Points
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 bg-blue-50 border border-blue-100 p-3 rounded-xl leading-relaxed">
                            {currentAnswer.points}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lesson notes (expandable) */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-green-600" /> Detailed Lesson Notes
                          </h3>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform duration-200" />
                        </summary>
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-3 space-y-3">
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {current.lessonDetailed}
                          </p>
                          <Link
                            href={`/spotting/histology/lessons/${current.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-green-600 transition-colors"
                          >
                            Open full lesson <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </details>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ════ NAVIGATION ════ */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100 gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs sm:text-sm font-bold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="text-xs text-gray-400 hidden sm:block">
            {submittedCount}/{slides.length} answered
          </div>

          {currentIndex === slides.length - 1 ? (
            <button
              onClick={() => setTestCompleted(true)}
              disabled={!allSubmitted}
              className={`inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r ${GRAD} text-white text-xs sm:text-sm font-extrabold shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all`}
            >
              <Trophy className="w-4 h-4" /> See Results
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => Math.min(slides.length - 1, i + 1))}
              disabled={!answers[currentIndex].submitted}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs sm:text-sm font-bold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-8">
          <ReferencesBlock />
        </div>
      </div>
    </section>
  );
}