"use client";

// src/app/(site)/mcqs-bank/[semesterSlug]/[subject]/page.tsx
// ── Interactive & Gamified E-Learning MCQ Platform (Fully Responsive) ──

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  BookOpen, Trophy, RotateCcw, AlertTriangle, Zap, Layers,
  ClipboardList, ChevronDown, ChevronUp, Award, ArrowUp,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
  Timer, Play, FileText, Hash, Target,
  BookMarked, Sparkles, CheckSquare, Clock, Volume2, VolumeX,
  Flame, Flag, Eye, Grid, Maximize2, ShieldCheck, HelpCircle,
  BarChart3, Brain, Compass, Sparkle, RefreshCw, Lightbulb,
  ThumbsUp, Frown, KeyRound, ArrowRight
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";
import type { MCQBank } from "@/lib/mcq-utils";
import jsPDF from "jspdf";
import { useTracker } from "@/hooks/useTracker";

import biochemBank from "@/app/api/mcq-data/pharmaceutical-biochemistry";
import physioBank from "@/app/api/mcq-data/physiology-histology-i";
import organicChemBank from "@/app/api/mcq-data/organic-chemistry";
import physicalPharmacyBank from "@/app/api/mcq-data/physical-pharmacy";

const BANK_REGISTRY: Record<string, MCQBank> = {
  "pharmaceutical-biochemistry": biochemBank,
  "physiology-histology-i": physioBank,
  "organic-chemistry": organicChemBank,
  "physical-pharmacy": physicalPharmacyBank,
};


interface PageProps {
  params: { semesterSlug: string; subject: string };
}

type QuizMode = "practice" | "exam";
type ViewMode = "focus" | "list";
type Screen = "unit-select" | "lobby" | "quiz" | "results";
type ConfidenceLevel = "low" | "medium" | "high";

const QUIZ_DURATION_SECONDS = 15 * 60;

const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 28 },
  { Icon: Beaker, top: "38%", left: "1%", size: 26 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 28 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 26 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 26 },
];

const SEM_GRADS: Record<string, string> = {
  "semester-1": "from-blue-600 via-indigo-600 to-cyan-500",
  "semester-2": "from-violet-600 via-purple-600 to-fuchsia-500",
  "semester-3": "from-emerald-600 via-teal-600 to-cyan-500",
  "semester-4": "from-amber-500 via-orange-600 to-yellow-500",
  "semester-5": "from-rose-600 via-pink-600 to-red-400",
  "semester-6": "from-cyan-600 via-sky-600 to-blue-500",
  "semester-7": "from-indigo-600 via-blue-600 to-violet-500",
  "semester-8": "from-green-600 via-emerald-600 to-teal-400",
  "semester-9": "from-orange-600 via-red-600 to-amber-500",
  "semester-10": "from-fuchsia-600 via-violet-600 to-purple-500",
};

const SEM_SOLID: Record<string, string> = {
  "semester-1": "#2563eb",
  "semester-2": "#7c3aed",
  "semester-3": "#059669",
  "semester-4": "#d97706",
  "semester-5": "#e11d48",
  "semester-6": "#0891b2",
  "semester-7": "#4f46e5",
  "semester-8": "#16a34a",
  "semester-9": "#ea580c",
  "semester-10": "#a21caf",
};

// ── Web Audio Sound FX Synthesizer ──
function playSound(type: "correct" | "wrong" | "click" | "complete" | "streak", soundEnabled: boolean) {
  if (!soundEnabled || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === "correct") {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "triangle";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.07);
      osc1.frequency.setValueAtTime(783.99, now + 0.14);
      osc2.frequency.setValueAtTime(1046.50, now + 0.21);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === "wrong") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "streak") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.09, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } else if (type === "complete") {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    }
  } catch (e) {
    // Fail silently if browser blocks autoplay
  }
}

function getGrade(pct: number) {
  if (pct >= 90) return {
    label: "Excellent Command of the Material",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    emoji: "🏆",
    pdfLabel: "Excellent Command of the Material",
    title: "Excellent Performance",
    remark: "You demonstrated a thorough and reliable understanding of this unit. Keep reinforcing this level with periodic review to retain long-term recall.",
  };
  if (pct >= 80) return {
    label: "Strong Understanding",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    emoji: "🥇",
    pdfLabel: "Strong Understanding",
    title: "Strong Performance",
    remark: "You have a solid grasp of most concepts in this unit. Review the questions you missed to close the remaining gaps before your exam.",
  };
  if (pct >= 70) return {
    label: "Good Grasp, Minor Gaps",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    emoji: "🎯",
    pdfLabel: "Good Grasp, Minor Gaps",
    title: "Good Performance",
    remark: "Your foundation is good, with a few recurring gaps. Focused revision on the incorrect items below will meaningfully improve your score.",
  };
  if (pct >= 60) return {
    label: "Developing — Needs Practice",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    emoji: "📖",
    pdfLabel: "Developing — Needs Practice",
    title: "Developing Performance",
    remark: "You're building a working understanding, but several concepts still need reinforcement. Revisit the explanations and retake this unit after review.",
  };
  if (pct >= 50) return {
    label: "Below Target — Review Recommended",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    emoji: "🔎",
    pdfLabel: "Below Target — Review Recommended",
    title: "Below Target",
    remark: "This score falls below the recommended benchmark. Go through each explanation carefully and retake the unit once you've reviewed the material.",
  };
  return {
    label: "Needs Focused Revision",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    emoji: "📚",
    pdfLabel: "Needs Focused Revision",
    title: "Needs Focused Revision",
    remark: "This unit needs a full review before moving on. Work through the material systematically, then retake the quiz to check your progress.",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF GENERATOR (unchanged logic — output document, not UI)
// ═══════════════════════════════════════════════════════════════════════════
function generatePDF(params: {
  subjectName: string;
  semesterName: string;
  unitName: string;
  stats: { correct: number; wrong: number; skipped: number; pct: number; total: number };
  timeTaken: number;
  questions: any[];
  answers: Record<number, string>;
  accentColor: string;
}) {
  const { subjectName, semesterName, unitName, stats, timeTaken, questions, answers, accentColor } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210;
  const PH = 297;
  const ML = 14;
  const MR = 14;
  const CW = PW - ML - MR;

  const FOOTER_H = 11;
  const SAFE_BOTTOM = PH - FOOTER_H - 4;

  const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const accent = hexToRgb(accentColor);
  const accentLight: [number, number, number] = [
    Math.round(accent[0] * 0.12 + 255 * 0.88),
    Math.round(accent[1] * 0.12 + 255 * 0.88),
    Math.round(accent[2] * 0.12 + 255 * 0.88),
  ];

  const C = {
    accent, accentLight,
    white: [255, 255, 255] as [number, number, number],
    dark: [15, 23, 42] as [number, number, number],
    mid: [51, 65, 85] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    light: [241, 245, 249] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    green: [5, 150, 105] as [number, number, number],
    greenBg: [240, 253, 244] as [number, number, number],
    red: [185, 28, 28] as [number, number, number],
    redBg: [254, 242, 242] as [number, number, number],
    amber: [146, 64, 14] as [number, number, number],
    amberBg: [255, 251, 235] as [number, number, number],
    indigo: [67, 56, 202] as [number, number, number],
  };

  const fill = (col: [number, number, number]) => doc.setFillColor(...col);
  const text = (col: [number, number, number]) => doc.setTextColor(...col);
  const draw = (col: [number, number, number]) => doc.setDrawColor(...col);
  const strip = (s: string) => (s ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&Delta;/g, "Δ")
    .replace(/&nbsp;/g, " ");

  const lh = (fs: number) => fs * 0.3528 * 1.45;

  let y = 0;
  let pageNo = 1;

  const drawFooter = () => {
    fill(C.light);
    doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
    draw(C.border);
    doc.setLineWidth(0.25);
    doc.line(0, PH - FOOTER_H, PW, PH - FOOTER_H);
    text(C.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Generated by PharmaWallah  ·  pharmawallah.com  ·  Interactive E-Learning Report", ML, PH - 3.5);
    text(accent);
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNo}`, PW - MR, PH - 3.5, { align: "right" });
  };

  const drawRunningHeader = () => {
    fill(accent);
    doc.rect(0, 0, PW, 9, "F");
    text(C.white);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("PharmaWallah  ·  MCQ Interactive Assessment", ML, 6);
    doc.setFont("helvetica", "normal");
    const headerRight = `${subjectName.length > 35 ? subjectName.slice(0, 33) + "…" : subjectName}`;
    doc.text(headerRight, PW - MR, 6, { align: "right" });
  };

  const addPage = () => {
    drawFooter();
    doc.addPage();
    pageNo++;
    drawRunningHeader();
    y = 14;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > SAFE_BOTTOM) addPage();
  };

  fill(accent);
  doc.rect(0, 0, PW, 60, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.circle(PW - 18, 8, 28, "S");
  doc.circle(PW - 30, 55, 15, "S");
  doc.circle(20, 58, 14, "S");

  fill(C.white);
  doc.roundedRect(ML, 7, 38, 11, 2, 2, "F");
  text(accent);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("PHARMAWALLAH", ML + 19, 14, { align: "center" });

  text(C.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, PW - MR, 13, { align: "right" });

  text(C.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MCQ Assessment Report", ML, 37);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subLine = `${semesterName}  ·  ${subjectName}`;
  doc.text(subLine.length > 80 ? subLine.slice(0, 78) + "…" : subLine, ML, 46);

  doc.setFontSize(7.5);
  const uLine = `Unit: ${unitName}`;
  doc.text(uLine.length > 95 ? uLine.slice(0, 93) + "…" : uLine, ML, 53);

  y = 68;

  const grade = getGrade(stats.pct);
  const timeMins = Math.floor(timeTaken / 60);
  const timeSecs = timeTaken % 60;

  doc.setFontSize(7.3);
  doc.setFont("helvetica", "normal");
  const remarkLines = doc.splitTextToSize(grade.remark, CW - 39 - 4);
  const summaryBoxH = 27 + remarkLines.length * lh(7.3) + 3;

  fill(accentLight);
  doc.roundedRect(ML, y, CW, summaryBoxH, 3, 3, "F");
  draw(accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, CW, summaryBoxH, 3, 3, "S");

  text(accent);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${stats.pct}%`, ML + 13, y + 17);

  draw(accent);
  doc.setLineWidth(0.4);
  doc.line(ML + 34, y + 5, ML + 34, y + 22);

  text(C.dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const pdfLabelLines = doc.splitTextToSize(grade.pdfLabel, CW - 39 - 4);
  doc.text(pdfLabelLines, ML + 39, y + 11);

  text(C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Time: ${timeMins}m ${timeSecs}s  ·  Questions: ${stats.total}  ·  Date: ${dateStr}`, ML + 39, y + 11 + pdfLabelLines.length * lh(12) + 2);

  text(C.mid);
  doc.setFontSize(7.3);
  doc.setFont("helvetica", "italic");
  doc.text(remarkLines, ML + 39, y + 11 + pdfLabelLines.length * lh(12) + 2 + lh(7) + 3);

  y += summaryBoxH + 6;

  const GAP = 3;
  const BW = (CW - GAP * 3) / 4;
  const BH = 22;

  [
    { label: "Correct", val: String(stats.correct), colFg: C.green, colBg: C.greenBg },
    { label: "Wrong", val: String(stats.wrong), colFg: C.red, colBg: C.redBg },
    { label: "Skipped", val: String(stats.skipped), colFg: C.amber, colBg: C.amberBg },
    { label: "Score", val: `${stats.pct}%`, colFg: accent, colBg: accentLight },
  ].forEach(({ label, val, colFg, colBg }, i) => {
    const bx = ML + i * (BW + GAP);
    fill(colBg);
    doc.roundedRect(bx, y, BW, BH, 2, 2, "F");
    draw(colFg);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, BW, BH, 2, 2, "S");
    fill(colFg);
    doc.roundedRect(bx, y, BW, 4, 2, 2, "F");
    doc.rect(bx, y + 2, BW, 2, "F");

    text(colFg);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(val, bx + BW / 2, y + 14, { align: "center" });

    text(C.muted);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(label, bx + BW / 2, y + 20, { align: "center" });
  });

  y += BH + 5;

  fill(C.border);
  doc.roundedRect(ML, y, CW, 4.5, 2, 2, "F");
  fill(accent);
  const barW = Math.max(5, CW * stats.pct / 100);
  doc.roundedRect(ML, y, barW, 4.5, 2, 2, "F");

  y += 11;

  draw(C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);

  fill(accent);
  doc.rect(ML, y - 0.5, 4, 7.5, "F");
  text(C.dark);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Question Breakdown & Rationale", ML + 7, y + 5.5);

  text(C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${stats.correct} correct  ·  ${stats.wrong} wrong  ·  ${stats.skipped} skipped`, PW - MR, y + 5.5, { align: "right" });

  y += 13;

  const STRIPE_W = 4;
  const PAD = 4;
  const TEXT_X = ML + STRIPE_W + PAD + 8;
  const TEXT_W = CW - STRIPE_W - PAD - 8 - PAD - 2;

  questions.forEach((q, idx) => {
    const ua = answers[q.id];
    const isCorrect = ua === q.correctAnswer;
    const isWrong = ua !== undefined && ua !== q.correctAnswer;
    const isSkipped = ua === undefined;

    const sColor: [number, number, number] = isCorrect ? C.green : isWrong ? C.red : C.amber;
    const sBg: [number, number, number] = isCorrect ? C.greenBg : isWrong ? C.redBg : C.amberBg;
    const sLabel = isCorrect ? "CORRECT" : isWrong ? "WRONG" : "SKIPPED";

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const qLines = doc.splitTextToSize(strip(q.question), TEXT_W - 22);

    const corrOpt = q.options.find((o: any) => o.id === q.correctAnswer);
    const corrStr = `Correct: ${q.correctAnswer})  ${strip(corrOpt?.text ?? "")}`;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const corrLines = doc.splitTextToSize(corrStr, TEXT_W);

    let expLines: string[] = [];
    let refLines: string[] = [];
    if ((isWrong || isSkipped) && q.explanation) {
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      expLines = doc.splitTextToSize(strip(q.explanation), TEXT_W);
    }
    if ((isWrong || isSkipped) && q.reference) {
      doc.setFontSize(6);
      refLines = doc.splitTextToSize(`Ref: ${strip(q.reference)}`, TEXT_W);
    }

    const qH_ = qLines.length * lh(7.5);
    const corrH_ = corrLines.length * lh(7);
    const expH_ = expLines.length > 0 ? expLines.length * lh(6.5) + 7 : 0;
    const refH_ = refLines.length > 0 ? refLines.length * lh(6) + 2 : 0;
    const cardH = PAD + 4 + qH_ + 2 + corrH_ + expH_ + refH_ + PAD;

    ensureSpace(cardH + 3);

    const cy = y;
    const cx = ML;

    fill(sBg);
    doc.roundedRect(cx, cy, CW, cardH, 2, 2, "F");
    draw(sColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, CW, cardH, 2, 2, "S");

    fill(sColor);
    doc.roundedRect(cx, cy, STRIPE_W, cardH, 1.5, 1.5, "F");
    doc.rect(cx + 1.5, cy, STRIPE_W - 1.5, cardH, "F");

    fill(sColor);
    const circX = cx + STRIPE_W + PAD + 4;
    const circY = cy + PAD + 4;
    doc.circle(circX, circY, 4, "F");
    text(C.white);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(String(idx + 1), circX, circY + 2, { align: "center" });

    const BDGW = 20;
    const BDGX = cx + CW - BDGW - PAD;
    fill(sColor);
    doc.roundedRect(BDGX, cy + PAD - 1, BDGW, 5.5, 1, 1, "F");
    text(C.white);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.text(sLabel, BDGX + BDGW / 2, cy + PAD + 3.2, { align: "center" });

    let iy = cy + PAD;

    text(C.muted);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Q${idx + 1}  of  ${questions.length}`, TEXT_X, iy + 3);
    iy += 4 + 1;

    text(C.dark);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(qLines, TEXT_X, iy + lh(7.5));
    iy += qLines.length * lh(7.5) + 2;

    text(sColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(corrLines, TEXT_X, iy + lh(7));
    iy += corrLines.length * lh(7) + 2;

    if ((isWrong || isSkipped) && expLines.length > 0) {
      draw(sColor);
      doc.setLineWidth(0.2);
      doc.line(TEXT_X, iy + 1, cx + CW - PAD, iy + 1);
      iy += 4;

      text(C.indigo);
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      doc.text("EXPLANATION", TEXT_X, iy);
      iy += lh(5.5) + 1;

      text(C.mid);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(expLines, TEXT_X, iy);
      iy += expLines.length * lh(6.5) + 1;

      if (refLines.length > 0) {
        text(C.muted);
        doc.setFontSize(6);
        doc.setFont("helvetica", "italic");
        doc.text(refLines, TEXT_X, iy + 1);
      }
    }

    y += cardH + 3;
  });

  drawFooter();
  doc.save(`PharmaWallah_${subjectName.replace(/\s+/g, "_")}_MCQ_Report.pdf`);
}

// ════════════════════════════════════════════════════════════════════════
// STICKY GLASSMORPHIC TOP CONTROL BAR — responsive rework
// ════════════════════════════════════════════════════════════════════════
function TopQuizBar({
  secondsLeft,
  semGrad,
  answeredCount,
  totalCount,
  streak,
  xp,
  viewMode,
  setViewMode,
  soundEnabled,
  setSoundEnabled,
  quizMode,
}: {
  secondsLeft: number;
  semGrad: string;
  answeredCount: number;
  totalCount: number;
  streak: number;
  xp: number;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  quizMode: QuizMode;
}) {
  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const isUrgent = secondsLeft <= 60;
  const isWarn = secondsLeft <= 180 && !isUrgent;
  const pct = totalCount ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div
      className="sticky z-40 backdrop-blur-md bg-white/95 border-b border-gray-200/80 shadow-sm transition-all"
      style={{ top: "var(--navbar-height, 64px)" }}
    >
      {/* Row 1 (all breakpoints): timer/mode, streak, xp, controls */}
      <div className="max-w-5xl mx-auto px-2.5 xs:px-3 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 min-w-0">
          {quizMode === "exam" ? (
            <div className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl font-mono font-extrabold text-[11px] sm:text-xs shrink-0 shadow-sm ${isUrgent
              ? "bg-red-500 text-white animate-pulse"
              : isWarn
                ? "bg-amber-500 text-white"
                : `bg-gradient-to-r ${semGrad} text-white`
              }`}>
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              {mm}:{ss}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[11px] sm:text-xs shrink-0">
              <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden xs:inline">Practice</span>
            </span>
          )}

          {streak > 1 && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl bg-orange-500 text-white font-extrabold text-[10px] sm:text-[11px] shadow-sm animate-pulse shrink-0">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" /> {streak}
            </span>
          )}

          <span className="hidden xs:inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl bg-amber-100 text-amber-800 font-extrabold text-[10px] sm:text-[11px] border border-amber-200 shrink-0">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 fill-amber-500" /> {xp} XP
          </span>
        </div>

        {/* Center Progress Bar — hidden on very small screens, shown in row 2 instead */}
        <div className="hidden sm:block flex-1 max-w-xs mx-1">
          <div className="flex items-center justify-between text-xs font-black text-gray-500 mb-0.5">
            <span>Progress</span>
            <span>{answeredCount} / {totalCount} ({pct}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
            <div
              className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${semGrad}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${soundEnabled
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
            title={soundEnabled ? "Mute sound FX" : "Enable sound FX"}
            aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <div className="flex items-center bg-gray-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode("focus")}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-extrabold transition-all ${viewMode === "focus"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
                }`}
              aria-label="Focus card view"
            >
              <Maximize2 className="w-3 h-3" /> <span className="hidden xs:inline">Focus</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-extrabold transition-all ${viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
                }`}
              aria-label="List view"
            >
              <Grid className="w-3 h-3" /> <span className="hidden xs:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: progress bar, mobile-only */}
      <div className="sm:hidden max-w-5xl mx-auto px-2.5 xs:px-3 pb-2 -mt-0.5">
        <div className="flex items-center justify-between text-[10px] font-black text-gray-500 mb-0.5">
          <span>Progress</span>
          <span>{answeredCount}/{totalCount} ({pct}%)</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
          <div
            className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${semGrad}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function MCQBankQuizPage({ params }: PageProps) {
  const { semesterSlug, subject: subjectSlug } = params;

  const semData = SemesterData.find(s => semesterToSlug(s.semester) === semesterSlug);
  const subData = semData?.subjects.find(s => subjectToSlug(s.name) === subjectSlug);
  const bank = BANK_REGISTRY[subjectSlug] ?? null;
  const semGrad = SEM_GRADS[semesterSlug] ?? "from-blue-600 to-cyan-400";
  const accentColor = SEM_SOLID[semesterSlug] ?? "#2563eb";

  const [screen, setScreen] = useState<Screen>("unit-select");
  const [quizMode, setQuizMode] = useState<QuizMode>("practice");
  const [viewMode, setViewMode] = useState<ViewMode>("focus");
  const [activeUnit, setActiveUnit] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [confidence, setConfidence] = useState<Record<number, ConfidenceLevel>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showTop, setShowTop] = useState(false);
  const [quizStart, setQuizStart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [timeTaken, setTimeTaken] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [resultFilter, setResultFilter] = useState<"all" | "wrong" | "flagged" | "low-confidence">("all");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const AUTO_ADVANCE_DELAY_MS = 1400;

  const { trackQuiz } = useTracker();

  const units = useMemo(() => bank ? (bank.units ?? []) : [], [bank]);
  const questions = useMemo(() => {
    if (!bank) return [];
    if (!activeUnit) return bank.questions;
    return bank.questions.filter((q: any) => q.unit === activeUnit);
  }, [bank, activeUnit]);

  const answeredCount = Object.keys(answers);
  const currentQ = questions[currentIdx];

  // Helper function for instant smooth scroll to top of viewport
  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // AUTO SCROLL TO TOP ON EVERY STEP / QUESTION INDEX / SCREEN CHANGE
  useEffect(() => {
    scrollToTop();
  }, [currentIdx, screen, activeUnit, viewMode, scrollToTop]);

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Timer logic
  useEffect(() => {
    if (screen !== "quiz" || submitted || quizMode !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, submitted, quizMode]); // eslint-disable-line

  const handleSelectUnit = (unit: string | null) => {
    setActiveUnit(unit);
    setScreen("lobby");
    scrollToTop();
  };

  const handleStartQuiz = () => {
    setAnswers({});
    setFlagged(new Set());
    setConfidence({});
    setSubmitted(false);
    setExpanded(new Set());
    setCurrentIdx(0);
    setStreak(0);
    setXp(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setQuizStart(Date.now());
    setScreen("quiz");
    scrollToTop();
  };

  const handleSelectAnswer = useCallback((qId: number, optId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));

    playSound("click", soundEnabled);

    if (quizMode === "practice" && currentQ) {
      const isCorrect = optId === currentQ.correctAnswer;
      if (isCorrect) {
        setStreak(prev => {
          const next = prev + 1;
          if (next >= 3) playSound("streak", soundEnabled);
          else playSound("correct", soundEnabled);
          return next;
        });
        setXp(prev => prev + 10 + Math.min(streak * 2, 20));
      } else {
        setStreak(0);
        playSound("wrong", soundEnabled);
      }
    }
  }, [submitted, quizMode, currentQ, soundEnabled, streak]);

  const toggleFlag = useCallback((qId: number) => {
    setFlagged(prev => {
      const s = new Set(prev);
      if (s.has(qId)) s.delete(qId);
      else s.add(qId);
      return s;
    });
    playSound("click", soundEnabled);
  }, [soundEnabled]);

  const setConfidenceForQ = useCallback((qId: number, level: ConfidenceLevel) => {
    setConfidence(prev => ({ ...prev, [qId]: level }));
    playSound("click", soundEnabled);
  }, [soundEnabled]);

  // Keyboard navigation for Focus Card View
  useEffect(() => {
    if (screen !== "quiz" || viewMode !== "focus" || !currentQ || submitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key)) {
        handleSelectAnswer(currentQ.id, key);
      } else if (["1", "2", "3", "4"].includes(key)) {
        const idx = parseInt(key) - 1;
        if (currentQ.options[idx]) handleSelectAnswer(currentQ.id, currentQ.options[idx].id);
      } else if (e.key === "ArrowRight") {
        if (currentIdx < questions.length - 1) {
          setCurrentIdx(prev => prev + 1);
          scrollToTop();
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIdx > 0) {
          setCurrentIdx(prev => prev - 1);
          scrollToTop();
        }
      } else if (key === "F") {
        toggleFlag(currentQ.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, viewMode, currentQ, currentIdx, questions.length, submitted, handleSelectAnswer, toggleFlag, scrollToTop]);

  const doSubmit = useCallback((latestAnswers: Record<number, string>) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - quizStart) / 1000);
    const correct = questions.filter((q: any) => latestAnswers[q.id] === q.correctAnswer).length;
    setTimeTaken(elapsed);
    setSubmitted(true);
    setScreen("results");
    playSound("complete", soundEnabled);
    scrollToTop();

    trackQuiz({
      quizId: `${subjectSlug}-${activeUnit ?? "all"}-${Date.now()}`,
      subject: subData?.name ?? subjectSlug,
      score: correct,
      total: questions.length,
      timeTakenMin: Math.max(1, Math.round(elapsed / 60)),
      href: `/mcqs-bank/${semesterSlug}/${subjectSlug}`,
    });
  }, [quizStart, questions, trackQuiz, subjectSlug, activeUnit, subData, semesterSlug, soundEnabled, scrollToTop]);

  const handleSubmit = useCallback(() => doSubmit(answers), [answers, doSubmit]);
  const handleAutoSubmit = useCallback(() => doSubmit(answersRef.current), [doSubmit]);

  // AUTO-ADVANCE: in Practice mode + Focus view, once the current question is
  // answered, briefly show correct/incorrect feedback then move on automatically.
  // On the final question, auto-submit instead of advancing.
  useEffect(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }

    if (
      screen !== "quiz" ||
      viewMode !== "focus" ||
      quizMode !== "practice" ||
      submitted ||
      !currentQ
    ) {
      return;
    }

    const isAnswered = answers[currentQ.id] !== undefined;
    if (!isAnswered) return;

    const isLastQuestion = currentIdx === questions.length - 1;

    autoAdvanceRef.current = setTimeout(() => {
      if (isLastQuestion) {
        handleSubmit();
      } else {
        setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
        scrollToTop();
      }
    }, AUTO_ADVANCE_DELAY_MS);

    return () => {
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQ, currentIdx, questions.length, screen, viewMode, quizMode, submitted]);

  const handleReset = useCallback(() => {
    setScreen("unit-select");
    setActiveUnit(null);
    setAnswers({});
    setFlagged(new Set());
    setConfidence({});
    setSubmitted(false);
    setExpanded(new Set());
    setCurrentIdx(0);
    scrollToTop();
  }, [scrollToTop]);

  const stats = useMemo(() => {
    if (!submitted) return null;
    const correct = questions.filter((q: any) => answers[q.id] === q.correctAnswer).length;
    const wrong = Object.keys(answers).length - correct;
    const skipped = questions.length - Object.keys(answers).length;
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, skipped, pct, total: questions.length };
  }, [submitted, answers, questions]);

  const handleDownloadPDF = () => {
    if (!stats) return;
    generatePDF({
      subjectName: subData?.name ?? subjectSlug,
      semesterName: semData?.semester ?? semesterSlug,
      unitName: activeUnit ?? "All Units",
      stats,
      timeTaken,
      questions,
      answers,
      accentColor,
    });
  };

  const getUnitLabel = (u: string | null) => {
    if (!u) return "All Units";
    const i = u.indexOf(":");
    return i !== -1 ? u.slice(0, i).trim() : u.trim();
  };
  const getUnitDetail = (u: string | null) => {
    if (!u) return null;
    const i = u.indexOf(":");
    return i !== -1 ? u.slice(i + 1).trim() : null;
  };

  if (!semData || !subData) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl max-w-sm w-full">
        <p className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">Subject not found</p>
        <Link href="/mcqs-bank" className="text-blue-600 text-sm font-bold hover:underline inline-flex items-center gap-1">
          ← Return to MCQ Bank
        </Link>
      </div>
    </div>
  );

  if (!bank) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">MCQs Coming Soon</h2>
        <p className="text-gray-500 text-sm mb-6">Questions for <strong>{subData.name}</strong> are currently in production.</p>
        <Link href={`/mcqs-bank/${semesterSlug}`} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 transition-all`}>
          <ChevronLeft className="w-4 h-4" /> Back to {semData.semester}
        </Link>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 1 — UNIT SELECTION
  // ════════════════════════════════════════════════════════════════════
  if (screen === "unit-select") return (
    <section className="min-h-screen bg-gray-50 pt-6 sm:pt-8 relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100/60 z-0 hidden lg:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden shadow-lg`}>
        <div className="absolute -top-16 -right-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          <div className="flex items-center gap-1 sm:gap-1.5 text-white/80 text-[11px] sm:text-xs font-bold mb-3 flex-wrap">
            <Link href="/mcqs-bank" className="hover:text-white transition flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> MCQ Bank</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/mcqs-bank/${semesterSlug}`} className="hover:text-white transition">{semData.semester}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">{subData.name}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-3 backdrop-blur-sm">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" /> Interactive E-Learning Module
          </span>
          <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 break-words">{subData.name}</h1>
          <p className="text-white/85 text-xs sm:text-base max-w-2xl font-medium">Select a target unit or launch complete syllabus practice with real-time feedback & explanations.</p>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Full Syllabus Challenge
        </p>

        <button onClick={() => handleSelectUnit(null)}
          className={`w-full group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${semGrad} p-4 xs:p-5 sm:p-7 text-left shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 mb-5 sm:mb-6 border border-white/20`}>
          <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 opacity-10 sm:opacity-15 pointer-events-none transition-transform group-hover:scale-110 duration-500">
            <Layers size={72} className="text-white sm:w-[100px] sm:h-[100px]" />
          </div>
          <div className="flex items-center gap-3 xs:gap-4 sm:gap-5">
            <div className="w-11 h-11 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 xs:w-7 xs:h-7 sm:w-8 sm:h-8 text-yellow-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-md bg-white/20 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">Recommended</span>
              <p className="text-white font-black text-base xs:text-lg sm:text-2xl leading-tight">All Units — Complete Mastery Practice</p>
              <p className="text-white/80 text-[11px] xs:text-xs sm:text-sm mt-1 font-medium">{bank.questions.length} Questions · Timed/Practice Options · Dynamic Analytics</p>
            </div>
            <div className="shrink-0 w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white text-white group-hover:text-blue-600 transition-all shadow-md">
              <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </button>

        {units.length > 0 && (
          <>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 sm:mb-4 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Unit Wise Modules
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {units.map((unit: string, i: number) => {
                const unitQCount = bank.questions.filter((q: any) => q.unit === unit).length;
                const label = getUnitLabel(unit);
                const detail = getUnitDetail(unit);
                return (
                  <button key={unit} onClick={() => handleSelectUnit(unit)}
                    className="group relative text-left bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-100 hover:border-blue-500 active:border-blue-500 hover:shadow-xl transition-all duration-200 overflow-hidden p-3.5 xs:p-4 sm:p-5 flex flex-col justify-between">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${semGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                    <div className="flex items-start gap-3 xs:gap-3.5 mb-2.5">
                      <div className={`shrink-0 w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">{label}</p>
                        {detail && <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed line-clamp-2">{detail}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-2 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700">
                          <Hash className="w-3 h-3 text-gray-400" /> {unitQCount} MCQs
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600">
                          <Clock className="w-3 h-3 text-blue-500" /> 15 min
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                        Start <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 2 — LOBBY
  // ════════════════════════════════════════════════════════════════════
  if (screen === "lobby") {
    const label = getUnitLabel(activeUnit);
    return (
      <section className="min-h-screen bg-gray-50 pt-6 sm:pt-8">
        <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden shadow-lg py-6 sm:py-10`}>
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
            <button onClick={() => { setScreen("unit-select"); scrollToTop(); }} className="flex items-center gap-1 text-white/80 hover:text-white text-xs font-bold mb-3 sm:mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Change Unit
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-2 backdrop-blur-sm">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" /> Quiz Lobby
            </span>
            <h1 className="text-xl xs:text-2xl sm:text-4xl font-black text-white tracking-tight mb-1 break-words">{subData.name}</h1>
            <p className="text-white/85 text-xs sm:text-base font-medium">{label}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-100 overflow-hidden shadow-xl p-4 xs:p-5 sm:p-8">
            <div className="mb-5 sm:mb-6">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Select Practice Mode
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <button
                  onClick={() => setQuizMode("practice")}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${quizMode === "practice"
                    ? "border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl bg-blue-100 text-blue-800 font-extrabold text-[11px] sm:text-xs">
                      <Brain className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Practice Mode
                    </span>
                    {quizMode === "practice" && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-gray-900 font-extrabold text-sm mb-1">Instant Feedback & Explanations</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Instant answer checking, sound FX, streak multipliers 🔥, and detailed rationale after every question.
                  </p>
                </button>

                <button
                  onClick={() => setQuizMode("exam")}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${quizMode === "exam"
                    ? "border-violet-600 bg-violet-50/60 shadow-md ring-2 ring-violet-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl bg-violet-100 text-violet-800 font-extrabold text-[11px] sm:text-xs">
                      <Timer className="w-3.5 h-3.5 text-violet-600 shrink-0" /> Exam Simulation
                    </span>
                    {quizMode === "exam" && <CheckCircle className="w-5 h-5 text-violet-600 shrink-0" />}
                  </div>
                  <p className="text-gray-900 font-extrabold text-sm mb-1">Timed & Distraction-Free</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Strict 15-min countdown timer, flag questions for review, locked answers until full submission.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
              {[{ Icon: Hash, label: "Total MCQs", val: questions.length }, { Icon: Timer, label: "Time Limit", val: quizMode === "exam" ? "15 min" : "Untimed" }, { Icon: Zap, label: "XP Multiplier", val: "Up to 3x" }].map(({ Icon, label: l, val }) => (
                <div key={l} className="flex flex-col items-center justify-center bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 py-2.5 sm:py-3 px-1.5 sm:px-2 text-center gap-1">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  <p className="text-gray-900 font-black text-base sm:text-xl leading-none">{val}</p>
                  <p className="text-gray-400 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider leading-tight">{l}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartQuiz}
              className={`w-full inline-flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r ${semGrad} text-white font-black text-xs xs:text-sm sm:text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-center px-2`}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
              <span>Launch {quizMode === "exam" ? "Exam" : "Practice"} — {questions.length} Questions</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 3 — ACTIVE QUIZ (Fully responsive Focus + List views)
  // ════════════════════════════════════════════════════════════════════
  if (screen === "quiz") {
    const userAnswer = currentQ ? answers[currentQ.id] : undefined;
    const isCurrentFlagged = currentQ ? flagged.has(currentQ.id) : false;
    const currentConf = currentQ ? confidence[currentQ.id] : undefined;
    const isAnswered = userAnswer !== undefined;
    const isRightAnswer = currentQ && userAnswer === currentQ.correctAnswer;

    return (
      <section className="min-h-screen bg-gray-50/80 pt-6 sm:pt-8 relative flex flex-col justify-between">
        <style>{`
          @keyframes autoAdvanceDrain {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
        {/* Sticky Glassmorphic Header */}
        <TopQuizBar
          secondsLeft={timeLeft}
          semGrad={semGrad}
          answeredCount={answeredCount.length}
          totalCount={questions.length}
          streak={streak}
          xp={xp}
          viewMode={viewMode}
          setViewMode={setViewMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          quizMode={quizMode}
        />

        {/* FOCUS VIEW MODE */}
        {viewMode === "focus" && currentQ && (
          <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto px-2.5 xs:px-3 sm:px-6 py-3 sm:py-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-140px)] transition-all">
              <div className={`h-1.5 bg-gradient-to-r ${semGrad} shrink-0`} />

              {/* Scrollable Card Body */}
              <div className="p-3.5 xs:p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-3.5 sm:space-y-4">

                {/* Badge & Flag Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl shrink-0">
                      Q{currentIdx + 1} of {questions.length}
                    </span>
                    {currentQ.unit && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-gray-100 text-gray-500 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
                        {currentQ.unit.split(":")[0]}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFlag(currentQ.id)}
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-extrabold transition-all shrink-0 ${isCurrentFlagged
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    <Flag className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isCurrentFlagged ? "fill-white" : ""}`} />
                    <span className="hidden xs:inline">{isCurrentFlagged ? "Flagged" : "Flag"}</span>
                  </button>
                </div>

                {/* Question Stem */}
                <h3
                  className="text-sm xs:text-base sm:text-lg md:text-xl font-extrabold text-gray-900 leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: currentQ.question }}
                />

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {currentQ.options.map((opt: any) => {
                    const sel = userAnswer === opt.id;
                    const isRight = opt.id === currentQ.correctAnswer;
                    const showFeedback = quizMode === "practice" && isAnswered;

                    let cardStyle = "border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50/40";
                    let badgeStyle = "bg-gray-100 text-gray-600 border-gray-200";

                    if (showFeedback) {
                      if (isRight) {
                        cardStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30";
                        badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                      } else if (sel && !isRight) {
                        cardStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400/30";
                        badgeStyle = "bg-rose-600 text-white border-rose-600";
                      } else {
                        cardStyle = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60";
                      }
                    } else if (sel) {
                      cardStyle = "border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-md ring-2 ring-blue-500/20";
                      badgeStyle = "bg-blue-600 text-white border-blue-600";
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.id)}
                        className={`flex items-start gap-2.5 sm:gap-3 w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-150 relative active:scale-[0.99] ${cardStyle}`}
                      >
                        <span className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black border-2 transition-all mt-0.5 ${badgeStyle}`}>
                          {opt.id}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-normal flex-1 break-words" dangerouslySetInnerHTML={{ __html: opt.text }} />
                        <div className="shrink-0 pt-0.5">
                          {showFeedback && isRight && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          {showFeedback && sel && !isRight && <XCircle className="w-4 h-4 text-rose-600" />}
                          {!showFeedback && sel && <CheckCircle className="w-4 h-4 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Box */}
                {quizMode === "practice" && isAnswered && (
                  <div className={`rounded-xl sm:rounded-2xl border-2 p-3.5 sm:p-5 transition-all space-y-2 animate-fadeIn ${isRightAnswer
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : "bg-rose-50/80 border-rose-300 text-rose-950"
                    }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isRightAnswer ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                            <ThumbsUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Spot On! Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider">
                            <Frown className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-extrabold text-gray-500">
                        {isRightAnswer ? "+10 XP Earned" : "Learn & Retry"}
                      </span>
                    </div>

                    {currentQ.explanation && (
                      <div className="pt-1">
                        <p className="text-xs sm:text-sm leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: currentQ.explanation }} />
                      </div>
                    )}

                    {/* Auto-advance progress cue */}
                    <div className="pt-1.5 flex items-center gap-2">
                      <div className={`h-1 flex-1 rounded-full overflow-hidden ${isRightAnswer ? "bg-emerald-200/70" : "bg-rose-200/70"}`}>
                        <div
                          key={currentQ.id}
                          className={`h-full rounded-full ${isRightAnswer ? "bg-emerald-600" : "bg-rose-600"}`}
                          style={{
                            animation: `autoAdvanceDrain ${AUTO_ADVANCE_DELAY_MS}ms linear forwards`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 shrink-0">
                        {currentIdx === questions.length - 1 ? "Submitting…" : "Next question…"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Confidence Metacognition Selector */}
                {isAnswered && (
                  <div className="pt-2 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 border-t border-gray-100 text-xs">
                    <span className="font-bold text-gray-500 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Metacognition rating:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { level: "low" as ConfidenceLevel, label: "Unsure 😬" },
                        { level: "medium" as ConfidenceLevel, label: "Fair 🙂" },
                        { level: "high" as ConfidenceLevel, label: "Certain 🎯" },
                      ].map(({ level, label }) => (
                        <button
                          key={level}
                          onClick={() => setConfidenceForQ(currentQ.id, level)}
                          className={`px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold border transition-all ${currentConf === level
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Navigation */}
              <div className="bg-gray-50 px-3 xs:px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => {
                    setCurrentIdx(prev => Math.max(0, prev - 1));
                    scrollToTop();
                  }}
                  disabled={currentIdx === 0}
                  className="inline-flex items-center gap-1 px-2.5 xs:px-3.5 py-2 rounded-lg sm:rounded-xl border border-gray-200 text-gray-700 font-extrabold text-[11px] sm:text-xs bg-white hover:bg-gray-100 disabled:opacity-30 transition-all shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Prev</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIdx === questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={answeredCount.length === 0}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 xs:px-5 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${semGrad} text-white font-black text-[11px] sm:text-xs shadow-md transition-all disabled:opacity-40`}
                    >
                      <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span>Submit Quiz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
                        scrollToTop();
                      }}
                      className={`inline-flex items-center gap-1 sm:gap-1.5 px-3.5 xs:px-5 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${semGrad} text-white font-black text-[11px] sm:text-xs shadow-md transition-all`}
                    >
                      <span className="hidden xs:inline">Next</span><span className="xs:hidden">Next</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW MODE */}
        {viewMode === "list" && (
          <div className="max-w-4xl mx-auto px-2.5 xs:px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
            {questions.map((q: any, qIdx: number) => {
              const userAnswer = answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isAnswered = userAnswer !== undefined;
              const isRightAnswer = userAnswer === q.correctAnswer;
              const showFeedback = quizMode === "practice" && isAnswered;

              return (
                <div key={q.id} className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className={`h-1.5 bg-gradient-to-r ${semGrad}`} />

                  <div className="p-3.5 xs:p-5 sm:p-7">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3.5 sm:mb-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black shrink-0 ${userAnswer ? `bg-gradient-to-br ${semGrad} text-white shadow-sm` : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}>
                          {qIdx + 1}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider truncate">Question {qIdx + 1} of {questions.length}</span>
                      </div>

                      <button
                        onClick={() => toggleFlag(q.id)}
                        className={`p-1.5 rounded-lg sm:rounded-xl border text-xs flex items-center gap-1 shrink-0 ${isFlagged ? "bg-amber-500 text-white border-amber-500" : "bg-gray-50 text-gray-400 border-gray-200"
                          }`}
                      >
                        <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline text-[11px] font-bold">{isFlagged ? "Flagged" : "Flag"}</span>
                      </button>
                    </div>

                    {/* Stem */}
                    <h3 className="text-sm xs:text-base sm:text-lg font-extrabold text-gray-900 leading-relaxed mb-4 sm:mb-5 break-words" dangerouslySetInnerHTML={{ __html: q.question }} />

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
                      {q.options.map((opt: any) => {
                        const sel = userAnswer === opt.id;
                        const isRight = opt.id === q.correctAnswer;

                        let style = "border-gray-200 bg-white text-gray-700 hover:border-blue-400";
                        let badgeStyle = "bg-gray-100 text-gray-500 border-gray-200";

                        if (showFeedback) {
                          if (isRight) {
                            style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                            badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                          } else if (sel && !isRight) {
                            style = "border-rose-500 bg-rose-50 text-rose-950 font-bold";
                            badgeStyle = "bg-rose-600 text-white border-rose-600";
                          } else {
                            style = "border-gray-100 bg-gray-50/50 text-gray-400 opacity-60";
                          }
                        } else if (sel) {
                          style = "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm";
                          badgeStyle = "bg-blue-600 text-white border-blue-600";
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectAnswer(q.id, opt.id)}
                            className={`flex items-start gap-2.5 sm:gap-3 w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all active:scale-[0.99] ${style}`}
                          >
                            <span className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black border-2 mt-0.5 ${badgeStyle}`}>
                              {opt.id}
                            </span>
                            <span className="text-xs sm:text-sm font-medium flex-1 pt-0.5 break-words" dangerouslySetInnerHTML={{ __html: opt.text }} />
                            {showFeedback && isRight && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {showFeedback && sel && !isRight && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {showFeedback && q.explanation && (
                      <div className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border-2 text-xs leading-relaxed break-words ${isRightAnswer ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
                        }`}>
                        <span className="font-black uppercase tracking-wider block mb-1">
                          {isRightAnswer ? "🎉 Correct Rationale" : "💡 Learning Point"}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 sm:pt-4 text-center">
              <button
                onClick={handleSubmit}
                disabled={answeredCount.length === 0}
                className={`w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${semGrad} text-white font-black text-xs sm:text-sm shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40`}
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> Submit Quiz & See Final Results
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 4 — RESULTS & GAMIFIED ANALYTICS DASHBOARD
  // ════════════════════════════════════════════════════════════════════
  if (screen === "results" && stats) {
    const grade = getGrade(stats.pct);
    const timeMins = Math.floor(timeTaken / 60);
    const timeSecs = timeTaken % 60;
    const unitLabel = getUnitLabel(activeUnit);

    const filteredQuestions = questions.filter((q: any) => {
      const ua = answers[q.id];
      if (resultFilter === "wrong") return ua !== undefined && ua !== q.correctAnswer;
      if (resultFilter === "flagged") return flagged.has(q.id);
      if (resultFilter === "low-confidence") return confidence[q.id] === "low";
      return true;
    });

    return (
      <section className="min-h-screen bg-gray-50/80 relative pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden shadow-lg py-6 sm:py-12 text-white`}>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-3 backdrop-blur-sm">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300" /> {grade.title}
            </span>
            <h1 className="text-xl xs:text-2xl sm:text-4xl font-black tracking-tight mb-1 break-words">{subData.name}</h1>
            <p className="text-white/80 text-[11px] sm:text-sm font-medium">{unitLabel} · Completed in {timeMins}m {timeSecs}s</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-2.5 xs:px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">

          {/* Performance Summary Banner */}
          <div className={`rounded-2xl sm:rounded-3xl border-2 ${grade.bg} p-4 xs:p-5 sm:p-8 shadow-xl relative overflow-hidden`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">

              {/* Circular Gauge SVG */}
              <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200 stroke-current"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600 stroke-current transition-all duration-1000 ease-out"
                      strokeDasharray={`${stats.pct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-lg xs:text-xl sm:text-2xl font-black text-gray-900">{stats.pct}%</span>
                    <span className="block text-[8px] sm:text-[9px] font-extrabold uppercase text-gray-400">Score</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="text-xl xs:text-2xl sm:text-3xl">{grade.emoji}</span>
                  <h2 className={`text-lg xs:text-xl sm:text-2xl font-black ${grade.color} break-words`}>{grade.label}</h2>
                  <p className="text-gray-600 text-[11px] xs:text-xs sm:text-sm font-medium mt-1">
                    You answered <strong>{stats.correct}</strong> out of <strong>{stats.total}</strong> correctly.
                  </p>
                </div>
              </div>

              {/* Professional Examiner's Remark */}
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-black/5">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Examiner's Remark
                </p>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  {grade.remark}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-200 text-blue-700 font-extrabold text-[11px] sm:text-xs hover:bg-blue-50 active:bg-blue-100 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Download PDF Report
                </button>
                <button
                  onClick={handleReset}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-[11px] sm:text-xs shadow-md hover:shadow-lg transition-all`}
                >
                  <RotateCcw className="w-4 h-4" /> Retake Practice
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar for Question Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
              <h3 className="text-sm xs:text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" /> Review Questions
              </h3>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm text-[10px] sm:text-xs font-bold flex-wrap w-full sm:w-auto overflow-x-auto">
                {[
                  { key: "all", label: `All (${questions.length})` },
                  { key: "wrong", label: `Incorrect (${stats.wrong})` },
                  { key: "flagged", label: `Flagged (${flagged.size})` },
                  { key: "low-confidence", label: "Unsure" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setResultFilter(key as any)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition-all whitespace-nowrap shrink-0 ${resultFilter === key ? "bg-blue-600 text-white font-extrabold shadow" : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Question Cards */}
            <div className="space-y-3.5 sm:space-y-4">
              {filteredQuestions.map((q: any, qIdx: number) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                const isWrong = userAnswer !== undefined && userAnswer !== q.correctAnswer;
                const isSkipped = userAnswer === undefined;

                return (
                  <div key={q.id} className={`rounded-2xl sm:rounded-3xl border-2 overflow-hidden shadow-sm ${isCorrect ? "bg-emerald-50/20 border-emerald-200" : isWrong ? "bg-rose-50/20 border-rose-200" : "bg-amber-50/20 border-amber-200"
                    }`}>
                    <div className="p-3.5 xs:p-5 sm:p-6">
                      <div className="flex items-start gap-2.5 xs:gap-3.5 mb-3.5 sm:mb-4">
                        <div className={`shrink-0 w-8 h-8 xs:w-9 xs:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs font-black ${isCorrect ? "bg-emerald-100 text-emerald-700" : isWrong ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                          }`}>
                          {isCorrect ? <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" /> : isWrong ? <XCircle className="w-4 h-4 xs:w-5 xs:h-5" /> : <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: q.question }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-3.5 sm:mb-4">
                        {q.options.map((opt: any) => {
                          const isSel = userAnswer === opt.id;
                          const isRight = opt.id === q.correctAnswer;
                          let style = "border-gray-100 bg-white text-gray-400 opacity-60";
                          if (isRight) style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                          else if (isSel) style = "border-rose-500 bg-rose-50 text-rose-950 font-bold";

                          return (
                            <div key={opt.id} className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-xs ${style}`}>
                              <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center font-black shrink-0 ${isRight ? "bg-emerald-600 text-white" : isSel ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-500"
                                }`}>{opt.id}</span>
                              <span className="flex-1 font-medium break-words" dangerouslySetInnerHTML={{ __html: opt.text }} />
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="rounded-xl sm:rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3.5 sm:p-4 text-xs text-gray-700 break-words">
                          <span className="font-extrabold text-indigo-700 uppercase tracking-widest block mb-1">Rationale</span>
                          <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Back-to-top button */}
        {showTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${semGrad} text-white shadow-xl flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition-all`}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </section>
    );
  }

  return null;
}