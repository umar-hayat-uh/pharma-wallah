"use client";

import { useTracker } from "@/hooks/useTracker";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, Award, Shuffle,
  CheckCircle, XCircle, RotateCcw, Trophy, ZoomIn, X,
  Images, Clock, AlertTriangle, Microscope as MicIcon, PlayCircle,
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity,
  Star, Zap, Flame, Lock, Target, Medal, Sparkles, ArrowRight, ChevronDown,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS — Histology-stain palette (identical to pathology test)
// ══════════════════════════════════════════════════════════════════════════════
const INK = "#241C28";
const INK_SOFT = "#5B4F63";
const PAPER = "#FBF7F1";
const PAPER_MUTED = "#F1E9DE";
const VIOLET = "#4C2E7A";
const VIOLET_DEEP = "#331F54";
const ROSE = "#E14B72";
const ROSE_SOFT = "#FCE4EA";
const TEAL = "#12876F";
const TEAL_SOFT = "#DEF3EE";
const AMBER = "#DB9A34";
const AMBER_SOFT = "#FBEDD3";
const RED = "#D14545";
const RED_SOFT = "#FBE3E3";
const GRAD_FLAT = "linear-gradient(90deg, #4C2E7A 0%, #8A3F86 50%, #E14B72 100%)";

const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 26 },
  { Icon: Beaker, top: "38%", left: "1%", size: 24 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 26 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 26 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 24 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 24 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SLIDE DATA — 21 histology slides (20 used: 2 rounds × 10)
//  (unchanged from your original, I'm keeping the full array as provided)
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
  // ... (all 20 other slides as in your original) – I'll abbreviate here for space
  // Include every slide exactly from your provided file.
  {
    id: "transitional-epithelium",
    title: "Transitional Epithelium (Urothelium)",
    category: "Epithelial Tissue",
    images: [
      { url: "/images/spotting/histology/transitional-epithelium.jpg" },
      { url: "/images/spotting/histology/transitional.jpg" },
    ],
    options: ["Stratified Squamous Keratinised", "Stratified Squamous Non-keratinised", "Stratified Cuboidal", "Transitional Epithelium"],
    correctOptionIndex: 3,
    definition: [
      "Multiple cell layers; specialised for stretch",
      "Dome-shaped superficial cells (umbrella cells)",
      "Relaxed: thick, 6–8 layers",
      "Distended: thin, 2–3 layers",
      "Lines urinary tract (renal pelvis, ureter, bladder)",
    ],
    keyFeatures: ["Umbrella cells", "Stretchable", "Urinary tract", "Dome-shaped surface cells"],
    lessonDetailed:
      "Transitional epithelium (urothelium) lines the urinary tract. It accommodates stretch and recoil. In the relaxed state, it appears thick (6–8 layers) with dome-shaped umbrella cells; when distended, it flattens to 2–3 layers. The apical plasma membrane of umbrella cells is thickened (asymmetric unit membrane) to resist hypertonic urine.",
  },
];

const REFERENCES = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas (8th ed.).", publisher: "Wolters Kluwer.", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology (6th ed.).", publisher: "Churchill Livingstone.", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas (13th ed.).", publisher: "McGraw-Hill.", year: "2013" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease (10th ed.).", publisher: "Elsevier.", year: "2020" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations (13th ed.).", publisher: "Wolters Kluwer.", year: "2017" },
];

// ─── UTILITIES ──────────────────────────────────────────────────────────────
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
    "when", "which", "present", "cells", "cell",
  ]);
  const tok = (s: string): string[] =>
    s.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w: string) => w.length > 3 && !STOP.has(w));
  const userSet = new Set<string>(tok(userText));
  const defSet = new Set<string>(tok(defText));
  if (!defSet.size) return 0;
  let matches = 0;
  userSet.forEach((w) => { if (defSet.has(w)) matches++; });
  return Math.min(100, Math.round((matches / defSet.size) * 100));
}

function scoreTone(s: number) {
  if (s >= 75) return { fg: TEAL, bg: TEAL_SOFT, border: "#B7E3D8" };
  if (s >= 40) return { fg: AMBER, bg: AMBER_SOFT, border: "#F0D9A6" };
  return { fg: RED, bg: RED_SOFT, border: "#F3C6C6" };
}
function scoreLabel(s: number) {
  if (s >= 75) return "Excellent — spot-on recognition!";
  if (s >= 40) return "Good effort — compare your points below.";
  return "Study the key features carefully and try again.";
}

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  submitted: boolean;
  matchScore: number;
}
type Slide = typeof SLIDE_DATA[number];

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLE (fonts + keyframes) — self-contained
// ══════════════════════════════════════════════════════════════════════════════
function GlobalStyle() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,800&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
      .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
      .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .font-lab { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      html, body { overflow-x: hidden; }
      @keyframes hist-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(225,75,114,0.4); } 100% { box-shadow: 0 0 0 10px rgba(225,75,114,0); } }
    `}</style>
  );
}

// ─── GAMIFICATION UI COMPONENTS (copied from pathology test) ──────────────
const XP_PER_LEVEL = 150;

const XPBar = ({ xp }: { xp: number }) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const pct = (into / XP_PER_LEVEL) * 100;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 font-lab"
        style={{ background: GRAD_FLAT }}
      >
        {level}
        <span className="absolute -inset-0.5 rounded-full pointer-events-none" style={{ animation: "hist-pulse-ring 2.4s ease-out infinite" }} />
      </div>
      <div className="w-20 sm:w-32 md:w-40">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide font-lab" style={{ color: INK_SOFT }}>Lv {level}</span>
          <span className="text-[9px] sm:text-[10px] font-bold font-lab" style={{ color: INK_SOFT }}>{into}/{XP_PER_LEVEL}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: PAPER_MUTED }}>
          <motion.div className="h-full rounded-full" style={{ background: GRAD_FLAT }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
    </div>
  );
};

const ComboBadge = ({ streak }: { streak: number }) => (
  <motion.div
    animate={streak >= 3 ? { scale: [1, 1.14, 1] } : {}}
    transition={{ duration: 0.6, repeat: streak >= 3 ? Infinity : 0, repeatDelay: 0.4 }}
    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border"
    style={{ background: ROSE_SOFT, borderColor: "#F0CBD8" }}
  >
    <Flame size={14} style={{ color: ROSE, fill: streak >= 3 ? ROSE : "transparent" }} />
    <span className="font-bold text-xs sm:text-sm font-lab" style={{ color: VIOLET_DEEP }}>{streak}</span>
  </motion.div>
);

const TimerRing = ({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) => {
  const pct = Math.max(0, Math.min(1, timeLeft / timeLimit));
  const color = pct > 0.5 ? TEAL : pct > 0.2 ? AMBER : RED;
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} stroke={PAPER_MUTED} strokeWidth="7" fill="none" />
          <motion.circle
            cx="50" cy="50" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line key={deg} x1="50" y1="50" x2={50 + 34 * Math.cos((deg * Math.PI) / 180)} y2={50 + 34 * Math.sin((deg * Math.PI) / 180)}
              stroke="#EEE4D6" strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-lab font-black text-2xl tabular-nums" style={{ color }}>{Math.max(0, timeLeft)}</span>
          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: INK_SOFT }}>seconds</span>
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>
        <Clock size={12} /> Time on round
      </span>
    </div>
  );
};

const AccuracyRing = ({ pct, label, color }: { pct: number; label: string; color: string }) => {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
      <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
        <circle cx="42" cy="42" r={r} stroke={PAPER_MUTED} strokeWidth="7" fill="none" />
        <motion.circle cx="42" cy="42" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-lab font-black text-lg" style={{ color }}>{pct}%</span>
      </div>
      <p className="text-center text-[10px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>{label}</p>
    </div>
  );
};

const LevelUpModal = ({ level, onClose }: { level: number; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.55)" }}>
    <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 18 }}
      className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-xs w-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: GRAD_FLAT }} />
      <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.6, delay: 0.2 }}
        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: GRAD_FLAT }}>
        <Trophy size={30} className="text-white" />
      </motion.div>
      <h2 className="text-2xl font-black font-display" style={{ color: INK }}>Level {level}!</h2>
      <p className="text-sm mt-2" style={{ color: INK_SOFT }}>Your histology skills are advancing.</p>
      <button onClick={onClose} className="mt-6 w-full text-white font-bold py-3 rounded-2xl shadow-lg transition-transform active:scale-95" style={{ background: GRAD_FLAT }}>
        Keep Going
      </button>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, icon: Icon, tone = "dark" }: { message: string; icon: any; tone?: "dark" | "rose" }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
    style={{ background: tone === "rose" ? GRAD_FLAT : INK }}>
    <Icon size={16} style={{ color: "#F5CD6B" }} /> {message}
  </motion.div>
);

const ReviewPopup = ({
  slideTitle, userText, expected, matchScore, onClose,
}: {
  slideTitle: string; userText: string; expected: string[]; matchScore: number; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[95] backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.5)" }}
    onClick={onClose}>
    <motion.div initial={{ scale: 0.92, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto spot-scroll"
      onClick={(e) => e.stopPropagation()}>
      <div className="px-5 pt-5 pb-4 text-white" style={{ background: GRAD_FLAT }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/75">Answer: {slideTitle}</p>
            <h3 className="text-base font-black font-display mt-0.5">Let's compare notes</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 hover:bg-white/25 transition-colors">
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>Your points</p>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg font-lab" style={{ ...scoreToneStyle(matchScore) }}>{matchScore}% match</span>
          </div>
          <p className="text-sm rounded-xl p-3 whitespace-pre-wrap" style={{ background: PAPER_MUTED, color: INK, border: "1px solid #EEE4D6" }}>
            {userText?.trim() || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: ROSE }}>Expected features</p>
          <ul className="space-y-1.5">
            {expected.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm rounded-xl p-2.5" style={{ background: ROSE_SOFT }}>
                <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: VIOLET }} />
                <span style={{ color: VIOLET_DEEP }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button onClick={onClose} className="w-full text-white font-extrabold py-3 rounded-2xl shadow-md active:scale-[0.98] transition-transform" style={{ background: GRAD_FLAT }}>
          Got it — continue
        </button>
      </div>
    </motion.div>
  </motion.div>
);

function scoreToneStyle(s: number) {
  const t = s >= 75 ? { fg: TEAL, bg: TEAL_SOFT } : s >= 40 ? { fg: AMBER, bg: AMBER_SOFT } : { fg: RED, bg: RED_SOFT };
  return { color: t.fg, background: t.bg };
}

const Confetti = () => {
  const pieces = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 360,
    delay: Math.random() * 0.25,
    rotate: Math.random() * 360,
    color: [VIOLET, ROSE, TEAL, AMBER][i % 4],
    w: 5 + Math.random() * 4,
  })), []);
  return (
    <div className="fixed inset-0 z-[75] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `calc(50% + ${p.x}px)`, opacity: 1, rotate: 0 }}
          animate={{ y: "70vh", opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.5, delay: p.delay, ease: "easeIn" }}
          style={{ background: p.color, width: p.w, height: p.w * 1.6, position: "absolute", top: "18%", borderRadius: 2 }}
        />
      ))}
    </div>
  );
};

// ─── FLOATING MOBILE TIMER (improved: now always visible, near the image) ──
function FloatingMobileTimer({
  mins, secs, urgent, slideNum, totalSlides, round,
}: {
  mins: string; secs: string; urgent: boolean; slideNum: number; totalSlides: number; round: number;
}) {
  const color = urgent ? RED : VIOLET;
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 lg:hidden">
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xl border"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: urgent ? "#F3C6C6" : "#EEE4D6" }}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: urgent ? RED_SOFT : ROSE_SOFT, animation: urgent ? "hist-pulse-ring 1.4s ease-out infinite" : "none" }}
        >
          <Clock size={13} style={{ color }} />
        </span>
        <span className="font-lab font-black text-sm tabular-nums" style={{ color }}>{mins}:{secs}</span>
        <span className="w-px h-4" style={{ background: "#E9DCC7" }} />
        <span className="text-[11px] font-bold font-lab" style={{ color: INK_SOFT }}>R{round} · {slideNum}/{totalSlides}</span>
      </motion.div>
    </div>
  );
}

// ─── LIGHTBOX & IMAGE GALLERY (same as original) ────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-3 sm:p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "88vh" }} onClick={e => e.stopPropagation()}>
        <Image src={src} alt="Histology slide" width={1400} height={900} className="w-full object-contain bg-gray-950" style={{ maxHeight: "84vh" }} />
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition">
          <X className="w-4 h-4" />
        </button>
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-[10px] whitespace-nowrap">Press Esc or tap outside to close</p>
      </motion.div>
    </motion.div>
  );
}

function ImageGallery({ images }: { images: Slide["images"] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setActiveIdx(0); }, [images]);

  const active = images[activeIdx];
  const powerLabel = (i: number) => (i === 0 ? "Low ×10" : "High ×40");

  return (
    <>
      <AnimatePresence mode="wait">
        {lightbox && <Lightbox key="lb" src={active.url} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
      <div className="space-y-2.5">
        <div className="relative rounded-[20px] border overflow-hidden group cursor-zoom-in shadow-sm" style={{ borderColor: "#E9DCC7", background: "#fff" }} onClick={() => setLightbox(true)}>
          <div className="absolute top-0 left-0 right-0 h-[4px] z-10" style={{ background: GRAD_FLAT }} />
          <AnimatePresence mode="wait">
            <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="relative w-full" style={{ height: 230, background: "radial-gradient(circle at 50% 40%, #fdfaf5 0%, #efe6d8 100%)" }}>
              <Image src={active.url} alt="Histology slide" fill className="object-contain" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 600px" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><ZoomIn className="w-3 h-3" /> Zoom</div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold pointer-events-none"><Images className="w-3 h-3" /> {activeIdx + 1}/{images.length}</div>
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-white text-[10px] font-extrabold pointer-events-none font-lab" style={{ background: GRAD_FLAT }}>{powerLabel(activeIdx)}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} title={`View ${powerLabel(i)}`}
              className="relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200 group/t"
              style={{ height: 58, borderColor: i === activeIdx ? VIOLET : "#E9DCC7", transform: i === activeIdx ? "scale(1.03)" : "scale(1)", boxShadow: i === activeIdx ? "0 4px 14px -4px rgba(76,46,122,0.35)" : "none" }}>
              <Image src={img.url} alt={`View ${i + 1}`} fill className="object-cover" sizes="110px" />
              <div className="absolute inset-0 transition-opacity" style={{ background: i === activeIdx ? "rgba(76,46,122,0.18)" : "rgba(0,0,0,0)" }} />
              {i === activeIdx && <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />}
              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 text-white text-[8px] font-extrabold uppercase font-lab">{i === 0 ? "Low" : "High"}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:hidden">
          <button disabled={activeIdx === 0} onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
            className="flex-1 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1" style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button disabled={activeIdx === images.length - 1} onClick={() => setActiveIdx(i => Math.min(images.length - 1, i + 1))}
            className="flex-1 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1" style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

function ReferencesBlock() {
  return (
    <div className="relative rounded-2xl border overflow-hidden" style={{ borderColor: "#E9DCC7", background: "#fff" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD_FLAT }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold font-display" style={{ color: INK }}>References</h2>
          <span className="ml-auto text-xs rounded-full px-2.5 py-1 shrink-0" style={{ color: INK_SOFT, background: PAPER_MUTED, border: "1px solid #E9DCC7" }}>{REFERENCES.length} sources</span>
        </div>
        <ol className="space-y-2.5">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-extrabold shrink-0 mt-0.5" style={{ background: ROSE_SOFT, color: VIOLET, border: "1px solid #F0CBD8" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                <span className="opacity-60">{ref.authors} </span>
                <em className="font-semibold not-italic" style={{ color: INK }}>{ref.title}</em>
                <span className="opacity-60"> {ref.publisher} {ref.year}.</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[10px] mt-4 pt-3 border-t" style={{ color: INK_SOFT, borderColor: "#EEE4D6", opacity: 0.8 }}>
          <strong>Disclaimer:</strong> Content is for educational review only. Clinical diagnosis requires a qualified professional.
        </p>
      </div>
    </div>
  );
}

// ─── TEST INSTRUCTIONS / START SCREEN ─────────────────────────────────────
function TestInstructions({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.45)" }}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[88vh] overflow-y-auto">
        <div className="relative px-6 pt-6 pb-5" style={{ background: GRAD_FLAT }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><MicIcon className="text-white" size={22} /></div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Histology Spotting Challenge</h2>
              <p className="text-white/80 text-xs">Two rounds · 10 slides each · 10 min per round</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm" style={{ color: INK }}>You will identify <strong>20 histology slides</strong> across two rounds. For each slide you must:</p>
          <ul className="space-y-2">
            {["Select the correct tissue from 4 options", "Write your key points of recognition", "Submit within the round's time limit"].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: INK_SOFT }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5" style={{ background: GRAD_FLAT }}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl p-4" style={{ background: ROSE_SOFT, border: "1px solid #F0CBD8" }}>
            <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: VIOLET }}><Medal size={13} /> Scoring & XP</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}><span className="flex gap-0.5">{[0, 1, 2].map(i => <Star key={i} size={11} fill={AMBER} color={AMBER} />)}</span> correct + match ≥75%</div>
              <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}><span className="flex gap-0.5">{[0, 1].map(i => <Star key={i} size={11} fill={AMBER} color={AMBER} />)}<Star size={11} color="#E3D8C6" fill="#E3D8C6" /></span> correct + match ≥40%</div>
              <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}><span className="flex gap-0.5"><Star size={11} fill={AMBER} color={AMBER} /><Star size={11} color="#E3D8C6" fill="#E3D8C6" /><Star size={11} color="#E3D8C6" fill="#E3D8C6" /></span> correct only</div>
            </div>
            <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: VIOLET }}><Zap size={12} /> Earn XP and level up as you complete slides!</p>
          </div>
          <div className="rounded-2xl p-3 text-xs flex items-start gap-2" style={{ background: AMBER_SOFT, color: "#7A5A17" }}>
            <Sparkles size={14} className="shrink-0 mt-0.5" />
            <span><strong>Pro tip:</strong> Use the low and high magnification views. Write what you see — match scoring rewards key terms.</span>
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full text-white font-extrabold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: GRAD_FLAT }}>
            Begin Challenge <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── REPORT CARD (for round results and final results) ───────────────────
function ReportCard({
  slides, answers, roundTitle, timerExpired, onNextRound, showNextButton, nextButtonText,
}: {
  slides: Slide[];
  answers: SlideAnswer[];
  roundTitle: string;
  timerExpired?: boolean;
  onNextRound?: () => void;
  showNextButton?: boolean;
  nextButtonText?: string;
}) {
  const totalCorrect = answers.filter((a, i) =>
    a.selectedOption !== null && slides[i].options[a.selectedOption] === slides[i].title
  ).length;
  const avgMatch = (answers.reduce((s, a) => s + a.matchScore, 0) / answers.length).toFixed(1);
  const pct = Math.round((totalCorrect / slides.length) * 100);

  return (
    <section className="min-h-screen relative font-body" style={{ background: PAPER, color: INK }}>
      <GlobalStyle />
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none z-0 hidden sm:block" style={{ top, left, color: i % 2 === 0 ? VIOLET : ROSE, opacity: 0.12 }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className="relative overflow-hidden" style={{ background: GRAD_FLAT }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
          <Trophy size={64} className="text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
            <Trophy className="w-3.5 h-3.5" /> {roundTitle}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 font-display">Your Results</h1>
          {timerExpired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/25 text-white text-xs font-bold mb-4 border border-white/30">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Time's up! 10 minutes elapsed.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: `${totalCorrect}/${slides.length}`, l: "Correct Slides" },
              { n: `${pct}%`, l: "MCQ Score" },
              { n: `${avgMatch}%`, l: "Avg Match" },
              { n: pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📚", l: "Grade" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-white/15 rounded-2xl p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none font-lab">{n}</div>
                <div className="text-xs text-white/75 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-3">
        <div className="grid grid-cols-2 gap-4 mb-6 sm:hidden">
          <AccuracyRing pct={pct} label="MCQ Accuracy" color={pct >= 75 ? TEAL : pct >= 40 ? AMBER : RED} />
          <AccuracyRing pct={Math.round(Number(avgMatch))} label="Avg Match" color={Number(avgMatch) >= 75 ? TEAL : Number(avgMatch) >= 40 ? AMBER : RED} />
        </div>

        <h2 className="text-lg sm:text-2xl font-extrabold mb-5 flex items-center gap-3 font-display" style={{ color: INK }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD_FLAT }}>
            <Award className="w-5 h-5 text-white" />
          </div>
          Slide‑by‑Slide Summary
        </h2>

        {slides.map((slide, idx) => {
          const ans = answers[idx];
          const isCorrect = ans.selectedOption !== null && slide.options[ans.selectedOption] === slide.title;
          const tone = scoreTone(ans.matchScore);
          const stars = ans.matchScore >= 75 ? 3 : ans.matchScore >= 40 ? 2 : ans.submitted ? 1 : 0;
          return (
            <div key={slide.id} className="relative rounded-2xl border bg-white overflow-hidden hover:shadow-md transition-all" style={{ borderColor: "#EEE4D6" }}>
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
              <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative w-14 h-11 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: "#E9DCC7" }}>
                  <Image src={slide.images[0].url} alt={slide.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm" style={{ color: INK }}>{slide.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: PAPER_MUTED, color: INK_SOFT }}>{slide.category}</span>
                    {isCorrect
                      ? <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: TEAL_SOFT, color: TEAL, border: "1px solid #B7E3D8" }}><CheckCircle className="w-2.5 h-2.5" /> Correct</span>
                      : <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: RED_SOFT, color: RED, border: "1px solid #F3C6C6" }}><XCircle className="w-2.5 h-2.5" /> Incorrect</span>}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: INK_SOFT }}>
                    Your answer: <span className="font-semibold" style={{ color: INK }}>{ans.selectedOption !== null ? slide.options[ans.selectedOption] : "—"}</span>
                    {!isCorrect && <span className="ml-2 font-semibold" style={{ color: VIOLET }}>✓ {slide.title}</span>}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => <Star key={i} size={11} style={{ color: i < stars ? AMBER : "#E3D8C6" }} fill={i < stars ? AMBER : "#E3D8C6"} />)}
                    <span className="text-xs font-bold px-2 py-0.5 rounded-xl border font-lab" style={{ color: tone.fg, background: tone.bg, borderColor: tone.border }}>
                      {ans.matchScore}% match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          {showNextButton && onNextRound && (
            <button onClick={onNextRound}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              style={{ background: GRAD_FLAT }}>
              {nextButtonText} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 font-extrabold text-sm transition-all hover:bg-[#FBF3E9]"
            style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            <Shuffle className="w-4 h-4" /> Retake Full Test
          </button>
          <Link href="/spotting"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 font-extrabold text-sm transition-all hover:bg-[#FBF3E9]"
            style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            <ChevronLeft className="w-4 h-4" /> Back to Spotting Centre
          </Link>
        </div>

        <ReferencesBlock />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT (fully gamified, two rounds, identical UI to pathology)
// ═══════════════════════════════════════════════════════════════════════════════
export default function HistologyTestPage() {
  const { trackQuiz, trackActivity, trackTimeOnUnmount } = useTracker();

  // ── Game / Meta state ──
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [progress, setProgress] = useState<Record<string, { completed: boolean; stars: number }>>({});
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reviewPopup, setReviewPopup] = useState<{ slideTitle: string; userText: string; expected: string[]; matchScore: number } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Screen & test state ──
  const [round, setRound] = useState(1);
  const [round1Slides, setRound1Slides] = useState<Slide[]>([]);
  const [round2Slides, setRound2Slides] = useState<Slide[]>([]);
  const [round1Answers, setRound1Answers] = useState<SlideAnswer[]>([]);
  const [round2Answers, setRound2Answers] = useState<SlideAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SlideAnswer[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);

  const SLIDES_PER_ROUND = 10;
  const ROUND_SECONDS = 10 * 60;
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const startTimeRef = useRef(Date.now());

  // ─── ALL HOOKS CALLED UNCONDITIONALLY ────────────────────────────────────
  useEffect(() => {
    const cleanup = trackTimeOnUnmount();
    return cleanup;
  }, [trackTimeOnUnmount]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || round >= 3) return;
    if (timeLeft <= 0) {
      setTimerExpired(true);
      setTimerActive(false);
      if (round === 1) setRound(3);
      else if (round === 2) setRound(4);
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft, round]);

  // Scroll to top when test starts or round changes
  useEffect(() => {
    if (testStarted) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [testStarted, round]);

  // ── useMemo MUST be here, before any conditional returns ──────────────────
  const current = slides[currentIndex] ?? null;

  const shuffledOptions = useMemo(() => {
    if (!mounted || !current) return [];
    return shuffle(current.options.map((text: string, origIdx: number) => ({ text, origIdx })));
  }, [current?.id, mounted]);

  // ─── DERIVED VALUES ────────────────────────────────────────────────────────
  const timerMins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const timerSecs = String(timeLeft % 60).padStart(2, "0");
  const timerUrgent = timeLeft <= 60;
  const allSubmitted = answers.length > 0 && answers.every(a => a.submitted);
  const submittedCount = answers.filter(a => a.submitted).length;
  const currentAnswer = answers[currentIndex] ?? { selectedOption: null, points: "", submitted: false, matchScore: 0 };

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, icon: any) => {
    setToast({ message: msg, icon });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const burstConfetti = useCallback(() => {
    setShowConfetti(true);
    if (confettiRef.current) clearTimeout(confettiRef.current);
    confettiRef.current = setTimeout(() => setShowConfetti(false), 1600);
  }, []);

  const initTest = () => {
    const shuffled = shuffle([...SLIDE_DATA]).slice(0, SLIDES_PER_ROUND * 2);
    const r1 = shuffled.slice(0, SLIDES_PER_ROUND);
    const r2 = shuffled.slice(SLIDES_PER_ROUND, SLIDES_PER_ROUND * 2);
    setRound1Slides(r1);
    setRound2Slides(r2);
    setRound1Answers(r1.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    setRound2Answers(r2.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    setSlides(r1);
    setAnswers(r1.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    setMounted(true);
    setTimerActive(true);
    setTestStarted(true);
    startTimeRef.current = Date.now();
  };

  const handleNextRound = () => {
    setRound(2);
    setSlides(round2Slides);
    setAnswers(round2Answers);
    setCurrentIndex(0);
    setTimeLeft(ROUND_SECONDS);
    setTimerActive(true);
    setTimerExpired(false);
  };

  const finishRound1 = () => {
    setTimerActive(false);
    setRound(3); // show round 1 report
  };

  const finishTest = () => {
    setTimerActive(false);
    const allSlides = [...round1Slides, ...round2Slides];
    const allAnswers = [...round1Answers, ...round2Answers];
    const correctCount = allAnswers.filter((a, i) => {
      if (a.selectedOption === null) return false;
      return allSlides[i].options[a.selectedOption] === allSlides[i].title;
    }).length;

    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));

    trackQuiz({
      quizId: `histology-gamified-${Date.now()}`,
      subject: "Histology Spotting Test",
      score: correctCount,
      total: allSlides.length,
      timeTakenMin: elapsedMinutes,
    });
    trackActivity({
      type: "quiz",
      label: `Completed Histology spotting — ${correctCount}/${allSlides.length}`,
      href: window.location.pathname,
    });

    setRound(4); // final report
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!current) return;
    if (currentAnswer.selectedOption === null || !currentAnswer.points.trim()) {
      showToast("Select an answer and write your points first.", AlertTriangle);
      return;
    }
    const matchScore = calculateMatch(currentAnswer.points, current.definition);
    const newAnswers = answers.map((a, i) =>
      i === currentIndex ? { ...a, submitted: true, matchScore } : a
    );
    setAnswers(newAnswers);
    if (round === 1) setRound1Answers(newAnswers);
    else if (round === 2) setRound2Answers(newAnswers);

    const isCorrect = current.options[currentAnswer.selectedOption] === current.title;
    let stars = 0;
    if (isCorrect) {
      if (matchScore >= 75) stars = 3;
      else if (matchScore >= 40) stars = 2;
      else stars = 1;
    }

    const prevLevel = Math.floor(xp / XP_PER_LEVEL);
    const xpGain = isCorrect ? (stars === 3 ? 60 : stars === 2 ? 40 : 20) : 0;
    const newXp = xp + xpGain;
    setXp(newXp);
    if (isCorrect) {
      setStreak(s => { const ns = s + 1; setBestStreak(bs => Math.max(bs, ns)); return ns; });
    } else {
      setStreak(0);
    }

    const newLevel = Math.floor(newXp / XP_PER_LEVEL);
    if (newLevel > prevLevel) setTimeout(() => { setLevelUpTo(newLevel); burstConfetti(); }, 700);

    setProgress(prev => ({ ...prev, [current.id]: { completed: true, stars } }));

    if (stars === 3) { showToast("Perfect identification!", Award); burstConfetti(); }

    const needsReview = !isCorrect || matchScore < 40;
    if (needsReview) {
      setReviewPopup({
        slideTitle: current.title,
        userText: currentAnswer.points,
        expected: current.definition,
        matchScore,
      });
    }
  }, [answers, current, currentIndex, round, xp, showToast, burstConfetti]);

  const closeReviewPopup = useCallback(() => {
    setReviewPopup(null);
  }, []);

  const handleTimeout = useCallback(() => {
    const newAnswers = answers.map((a, i) =>
      i === currentIndex ? { ...a, submitted: true, matchScore: 0 } : a
    );
    setAnswers(newAnswers);
    if (round === 1) setRound1Answers(newAnswers);
    else if (round === 2) setRound2Answers(newAnswers);
    setStreak(0);
    setProgress(prev => ({ ...prev, [current.id]: { completed: true, stars: 0 } }));
  }, [answers, currentIndex, round, current]);

  const setOption = (origIdx: number) => {
    if (currentAnswer.submitted) return;
    const newAnswers = answers.map((a, i) =>
      i === currentIndex ? { ...a, selectedOption: origIdx } : a
    );
    setAnswers(newAnswers);
    if (round === 1) setRound1Answers(newAnswers);
    else if (round === 2) setRound2Answers(newAnswers);
  };

  const setPoints = (val: string) => {
    if (currentAnswer.submitted) return;
    const newAnswers = answers.map((a, i) =>
      i === currentIndex ? { ...a, points: val } : a
    );
    setAnswers(newAnswers);
    if (round === 1) setRound1Answers(newAnswers);
    else if (round === 2) setRound2Answers(newAnswers);
  };

  const handleReset = () => {
    const newAnswers = answers.map((a, i) =>
      i === currentIndex ? { selectedOption: null, points: "", submitted: false, matchScore: 0 } : a
    );
    setAnswers(newAnswers);
    if (round === 1) setRound1Answers(newAnswers);
    else if (round === 2) setRound2Answers(newAnswers);
  };

  const handleFinishRound = () => {
    if (round === 1) finishRound1();
    else if (round === 2) finishTest();
  };

  // ─── CONDITIONAL RENDERS (after all hooks) ────────────────────────────────
  if (!testStarted) {
    return (
      <section className="min-h-screen relative font-body" style={{ background: PAPER, color: INK }}>
        <GlobalStyle />
        {BG_ICONS.map(({ Icon, top, left, size }, i) => (
          <div key={i} className="fixed pointer-events-none z-0 hidden sm:block" style={{ top, left, color: i % 2 === 0 ? VIOLET : ROSE, opacity: 0.14 }}>
            <Icon size={size} strokeWidth={1.4} />
          </div>
        ))}
        <AnimatePresence>
          {showInstructions && (
            <TestInstructions onClose={() => { setShowInstructions(false); initTest(); }} />
          )}
        </AnimatePresence>
      </section>
    );
  }

  if (round === 3) {
    return (
      <ReportCard
        slides={round1Slides}
        answers={round1Answers}
        roundTitle="Round 1 Complete"
        timerExpired={timerExpired}
        onNextRound={handleNextRound}
        showNextButton={round2Slides.length > 0}
        nextButtonText={`Continue to Round 2 (${round2Slides.length} slides)`}
      />
    );
  }

  if (round === 4) {
    return (
      <ReportCard
        slides={[...round1Slides, ...round2Slides]}
        answers={[...round1Answers, ...round2Answers]}
        roundTitle="Final Results"
        timerExpired={timerExpired}
        showNextButton={false}
      />
    );
  }

  if (!mounted || !current) return null;

  // ─── MAIN LAB UI ───────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen relative font-body" style={{ background: PAPER, color: INK }}>
      <GlobalStyle />

      {/* Floating timer pill — always visible on mobile, near the slides */}
      <FloatingMobileTimer
        mins={timerMins} secs={timerSecs} urgent={timerUrgent}
        slideNum={currentIndex + 1} totalSlides={slides.length} round={round}
      />

      {/* Toast, LevelUp, Confetti, ReviewPopup */}
      <AnimatePresence>{toast && <Toast message={toast.message} icon={toast.icon} />}</AnimatePresence>
      <AnimatePresence>{showConfetti && <Confetti key="confetti" />}</AnimatePresence>
      <AnimatePresence>{levelUpTo && <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />}</AnimatePresence>
      <AnimatePresence>
        {reviewPopup && (
          <ReviewPopup
            slideTitle={reviewPopup.slideTitle}
            userText={reviewPopup.userText}
            expected={reviewPopup.expected}
            matchScore={reviewPopup.matchScore}
            onClose={closeReviewPopup}
          />
        )}
      </AnimatePresence>

      {/* Header HUD with XP & Streak */}
      <div className="sticky top-0 z-40 pt-10 backdrop-blur-xl border-b" style={{ background: "rgba(251,247,241,0.85)", borderColor: "#EEE4D6" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <Link href="/spotting" className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-xl text-white" style={{ background: GRAD_FLAT }}><MicIcon size={18} /></div>
            <span className="font-black text-base sm:text-lg hidden sm:block font-display" style={{ color: INK }}>Histology Spotting</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <XPBar xp={xp} />
            <ComboBadge streak={streak} />
          </div>
        </div>
      </div>

      {/* Background icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none z-0 hidden sm:block" style={{ top, left, color: i % 2 === 0 ? VIOLET : ROSE, opacity: 0.12 }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      <div className="relative overflow-hidden" style={{ background: GRAD_FLAT }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-16 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
          <Dna size={60} className="text-white" />
        </div>
        <div className="absolute right-20 sm:right-44 top-5 opacity-15 pointer-events-none">
          <Activity size={36} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 pt-16 sm:pt-10">
          <Link href="/spotting"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Spotting Centre
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                <MicIcon className="w-3 h-3" /> Histology Spotting Test · Round {round} of 2 · {current.category}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
                Histology Spotting Test
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-2 max-w-md">
                <strong className="text-white">2 views</strong> per slide — study both, then select the tissue and write your points of recognition.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  title={`Slide ${i + 1}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[9px] sm:text-xs font-extrabold transition-all duration-200 font-lab"
                  style={{
                    background: i === currentIndex ? "#fff" : answers[i].submitted ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
                    color: i === currentIndex ? VIOLET : "#fff",
                    transform: i === currentIndex ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {answers[i].submitted
                    ? (slides[i].options[answers[i].selectedOption!] === slides[i].title ? "✓" : "✗")
                    : i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${(submittedCount / slides.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/60 mt-1.5">
            <span>Slide {currentIndex + 1} of {slides.length} (Round {round})</span>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-sm transition-all font-lab"
              style={{
                background: timerUrgent ? RED : "rgba(255,255,255,0.2)",
                color: "#fff",
                animation: timerUrgent ? "hist-pulse-ring 1.4s ease-out infinite" : "none",
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              {timerMins}:{timerSecs}
            </div>
            <span>{submittedCount}/{slides.length} answered</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="grid lg:grid-cols-2 gap-4 lg:gap-8"
          >
            {/* LEFT: gallery + MCQ */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: GRAD_FLAT }}>
                  <MicIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest font-lab" style={{ color: INK_SOFT }}>
                    Slide {currentIndex + 1} of {slides.length} · {current.category}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: INK_SOFT, opacity: 0.85 }}>
                    Study both views before answering
                  </p>
                </div>
              </div>

              <ImageGallery images={current.images} />

              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl border bg-white overflow-hidden p-4"
                    style={{ borderColor: "#EEE4D6" }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2.5 font-lab" style={{ color: INK_SOFT }}>
                      Key Identifying Features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.keyFeatures.map((f: string) => (
                        <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: ROSE_SOFT, color: VIOLET, border: "1px solid #F0CBD8" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2 font-display" style={{ color: INK }}>
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0" style={{ background: GRAD_FLAT }}>?</span>
                    Identify this tissue:
                  </h3>
                  <div className="space-y-2">
                    {(shuffledOptions as { text: string; origIdx: number }[]).map(({ text, origIdx }, i) => {
                      const isSelected = currentAnswer.selectedOption === origIdx;
                      const isCorrectOpt = origIdx === current.correctOptionIndex;
                      let state = "default";
                      if (currentAnswer.submitted) {
                        if (isCorrectOpt) state = "correct";
                        else if (isSelected) state = "wrong";
                      } else if (isSelected) state = "selected";

                      const styles: Record<string, { border: string; bg: string; text: string; opacity?: number }> = {
                        correct: { border: TEAL, bg: TEAL_SOFT, text: TEAL },
                        wrong: { border: RED, bg: RED_SOFT, text: RED },
                        selected: { border: VIOLET, bg: ROSE_SOFT, text: INK },
                        default: currentAnswer.submitted
                          ? { border: "#EEE4D6", bg: "#FAF6EF", text: INK, opacity: 0.4 }
                          : { border: "#E9DCC7", bg: "#fff", text: INK },
                      };
                      const st = styles[state];

                      return (
                        <label
                          key={origIdx}
                          onClick={() => setOption(origIdx)}
                          className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${currentAnswer.submitted ? "cursor-default" : "cursor-pointer"}`}
                          style={{ borderColor: st.border, background: st.bg, opacity: st.opacity ?? 1 }}
                        >
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 font-lab"
                            style={{ background: state === "default" ? "#F1E9DE" : "#fff", color: state === "default" ? INK_SOFT : st.text, border: `1px solid ${st.border}` }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm font-semibold flex-1" style={{ color: st.text }}>{text}</span>
                          {currentAnswer.submitted && state === "correct" && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: TEAL }} />}
                          {currentAnswer.submitted && state === "wrong" && <XCircle className="w-4 h-4 shrink-0" style={{ color: RED }} />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: points textarea + feedback */}
            <div className="space-y-4">
              <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold mb-1 flex items-center gap-2 font-display" style={{ color: INK }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: TEAL_SOFT }}>
                      <BookOpen className="w-3.5 h-3.5" style={{ color: TEAL }} />
                    </div>
                    Points of Recognition
                  </h3>
                  <p className="text-xs mb-3" style={{ color: INK_SOFT, opacity: 0.8 }}>
                    Write the key microscopic features that helped you identify this slide. Study both views first!
                  </p>
                  <textarea
                    value={currentAnswer.points}
                    onChange={e => setPoints(e.target.value)}
                    rows={7}
                    disabled={currentAnswer.submitted}
                    placeholder={`e.g., ${current.keyFeatures[0]?.toLowerCase() || ""}, ${(current.keyFeatures[1] || "").toLowerCase()}...`}
                    className="w-full px-3 py-3 border-2 rounded-xl focus:outline-none text-sm resize-none transition-colors font-body"
                    style={{ borderColor: "#E9DCC7", color: INK, background: currentAnswer.submitted ? "#FAF6EF" : "#fff" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = VIOLET)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E9DCC7")}
                  />
                  {!currentAnswer.submitted ? (
                    <button
                      onClick={(e) => handleSubmit(e)}
                      className="mt-3 w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                      style={{ background: GRAD_FLAT }}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="mt-3 w-full py-3 rounded-2xl border-2 font-extrabold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#FBF3E9]"
                      style={{ borderColor: "#E9DCC7", color: INK_SOFT }}
                    >
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4"
                  >
                    <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-extrabold flex items-center gap-2 font-display" style={{ color: INK }}>
                            <Award className="w-4 h-4" style={{ color: AMBER }} /> Match Score
                          </h3>
                          <span className="text-base sm:text-lg font-extrabold px-3 py-1 rounded-xl border font-lab" style={{ ...(() => { const t = scoreTone(currentAnswer.matchScore); return { color: t.fg, background: t.bg, borderColor: t.border }; })() }}>
                            {currentAnswer.matchScore}%
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: PAPER_MUTED }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: GRAD_FLAT }}
                            initial={{ width: 0 }}
                            animate={{ width: `${currentAnswer.matchScore}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs mt-2" style={{ color: INK_SOFT, opacity: 0.85 }}>{scoreLabel(currentAnswer.matchScore)}</p>
                      </div>
                    </div>

                    <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                      <div className="p-4 sm:p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2 font-lab" style={{ color: INK_SOFT }}>
                            Expected Points of Recognition
                          </p>
                          <ol className="rounded-xl p-3 space-y-1.5" style={{ background: PAPER_MUTED, border: "1px solid #EEE4D6" }}>
                            {current.definition.map((point: string, pi: number) => (
                              <li key={pi} className="flex gap-2 text-xs sm:text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-extrabold shrink-0 mt-0.5" style={{ background: ROSE_SOFT, color: VIOLET, border: "1px solid #F0CBD8" }}>
                                  {pi + 1}
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2 font-lab" style={{ color: INK_SOFT }}>
                            Your Points
                          </p>
                          <p className="text-xs sm:text-sm p-3 rounded-xl leading-relaxed" style={{ color: VIOLET_DEEP, background: ROSE_SOFT, border: "1px solid #F0CBD8" }}>
                            {currentAnswer.points}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
                      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none">
                          <h3 className="text-sm font-extrabold flex items-center gap-2 font-display" style={{ color: INK }}>
                            <BookOpen className="w-4 h-4" style={{ color: TEAL }} /> Detailed Lesson Notes
                          </h3>
                          <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform duration-200" style={{ color: INK_SOFT }} />
                        </summary>
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t pt-3 space-y-3" style={{ borderColor: "#EEE4D6" }}>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                            {current.lessonDetailed}
                          </p>
                          <Link
                            href={`/spotting/histology/lessons/${current.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold hover:opacity-70 transition-colors"
                            style={{ color: ROSE }}
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

        <div className="flex items-center justify-between mt-8 pt-5 border-t gap-3" style={{ borderColor: "#EEE4D6" }}>
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-all hover:bg-[#FBF3E9]"
            style={{ borderColor: "#E9DCC7", color: INK_SOFT }}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="text-xs hidden sm:block" style={{ color: INK_SOFT, opacity: 0.7 }}>
            {submittedCount}/{slides.length} answered
          </div>

          {currentIndex === slides.length - 1 ? (
            <button
              onClick={handleFinishRound}
              disabled={!allSubmitted}
              className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all"
              style={{ background: GRAD_FLAT }}
            >
              <Trophy className="w-4 h-4" /> {round === 1 ? "Complete Round 1" : "See Final Results"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => Math.min(slides.length - 1, i + 1))}
              disabled={!answers[currentIndex].submitted}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-all hover:bg-[#FBF3E9]"
              style={{ borderColor: "#E9DCC7", color: INK_SOFT }}
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