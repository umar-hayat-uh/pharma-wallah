"use client";
// src/app/(site)/mcqs-bank/[semesterSlug]/[subject]/page.tsx
// ── Redesigned: Unit Selection → Quiz Lobby → Timed Quiz → Results + PDF ──

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  BookOpen, Trophy, RotateCcw, AlertTriangle, Zap, Layers,
  ClipboardList, ChevronDown, ChevronUp, Award, ArrowUp,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
  LayoutDashboard, Timer, Play, FileText, Hash, Target,
  BookMarked, Sparkles, CheckSquare, Clock,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";
import type { MCQBank } from "@/lib/mcq-utils";
import { useTracker } from "@/hooks/useTracker";
import { useUser } from "@clerk/nextjs";
import jsPDF from "jspdf";

import biochemBank from "@/app/api/mcq-data/pharmaceutical-biochemistry";
import physioBank  from "@/app/api/mcq-data/physiology-histology-i";

const BANK_REGISTRY: Record<string, MCQBank> = {
  "pharmaceutical-biochemistry": biochemBank,
  "physiology-histology-i":      physioBank,
};

interface PageProps { params: { semesterSlug: string; subject: string } }

const QUIZ_DURATION_SECONDS = 15 * 60;

const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const SEM_GRADS: Record<string, string> = {
  "semester-1":  "from-blue-600 to-cyan-400",
  "semester-2":  "from-violet-600 to-purple-400",
  "semester-3":  "from-emerald-600 to-teal-400",
  "semester-4":  "from-amber-500 to-orange-400",
  "semester-5":  "from-rose-600 to-pink-400",
  "semester-6":  "from-cyan-600 to-sky-400",
  "semester-7":  "from-indigo-600 to-blue-400",
  "semester-8":  "from-green-600 to-lime-400",
  "semester-9":  "from-orange-600 to-red-400",
  "semester-10": "from-fuchsia-600 to-violet-400",
};

const SEM_SOLID: Record<string, string> = {
  "semester-1":  "#2563eb",
  "semester-2":  "#7c3aed",
  "semester-3":  "#059669",
  "semester-4":  "#d97706",
  "semester-5":  "#e11d48",
  "semester-6":  "#0891b2",
  "semester-7":  "#4f46e5",
  "semester-8":  "#16a34a",
  "semester-9":  "#ea580c",
  "semester-10": "#a21caf",
};

function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+  Distinction",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "🏆", pdfLabel: "A+ Distinction"   };
  if (pct >= 80) return { label: "A  Excellent",      color: "text-green-700",   bg: "bg-green-50 border-green-200",     emoji: "🥇", pdfLabel: "A  Excellent"     };
  if (pct >= 70) return { label: "B  Good",           color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       emoji: "🎯", pdfLabel: "B  Good"          };
  if (pct >= 60) return { label: "C  Satisfactory",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     emoji: "📖", pdfLabel: "C  Satisfactory"  };
  if (pct >= 50) return { label: "D  Pass",           color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",   emoji: "✅", pdfLabel: "D  Pass"          };
  return              { label: "F  Needs Revision",  color: "text-red-700",     bg: "bg-red-50 border-red-200",         emoji: "📚", pdfLabel: "F  Needs Revision" };
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF GENERATOR — fully corrected: proper width, text wrapping, page breaks
// ═══════════════════════════════════════════════════════════════════════════
function generatePDF(params: {
  subjectName:  string;
  semesterName: string;
  unitName:     string;
  stats:        { correct: number; wrong: number; skipped: number; pct: number; total: number };
  timeTaken:    number;
  questions:    any[];
  answers:      Record<number, string>;
  accentColor:  string;
}) {
  const { subjectName, semesterName, unitName, stats, timeTaken, questions, answers, accentColor } = params;

  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW   = 210;
  const PH   = 297;
  const ML   = 14;
  const MR   = 14;
  const CW   = PW - ML - MR; // 182 mm

  const FOOTER_H    = 11;
  const SAFE_BOTTOM = PH - FOOTER_H - 4;

  // ── RGB helpers ────────────────────────────────────────────────────────
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
    white:    [255, 255, 255] as [number,number,number],
    dark:     [15,  23,  42 ] as [number,number,number],
    mid:      [51,  65,  85 ] as [number,number,number],
    muted:    [100, 116, 139] as [number,number,number],
    light:    [241, 245, 249] as [number,number,number],
    border:   [226, 232, 240] as [number,number,number],
    green:    [5,   150, 105] as [number,number,number],
    greenBg:  [240, 253, 244] as [number,number,number],
    red:      [185, 28,  28 ] as [number,number,number],
    redBg:    [254, 242, 242] as [number,number,number],
    amber:    [146, 64,  14 ] as [number,number,number],
    amberBg:  [255, 251, 235] as [number,number,number],
    indigo:   [67,  56,  202] as [number,number,number],
    indigoBg: [238, 242, 255] as [number,number,number],
  };

  const fill = (col: [number,number,number]) => doc.setFillColor(...col);
  const text = (col: [number,number,number]) => doc.setTextColor(...col);
  const draw = (col: [number,number,number]) => doc.setDrawColor(...col);
  const strip = (s: string) => (s ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&Delta;/g, "Δ")
    .replace(/&nbsp;/g, " ");

  // Line height in mm for a given font-size (pt)
  const lh = (fs: number) => fs * 0.3528 * 1.45;

  // ── Page state ─────────────────────────────────────────────────────────
  let y      = 0;
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
    doc.text("Generated by PharmaWallah  ·  pharmawallah.com  ·  For educational use only", ML, PH - 3.5);
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
    doc.text("PharmaWallah  ·  MCQ Assessment Report", ML, 6);
    doc.setFont("helvetica", "normal");
    // Truncate long names so they don't overflow
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

  // ════════════════════════════════════════════════════════════════════
  // PAGE 1 — REPORT CARD HEADER
  // ════════════════════════════════════════════════════════════════════
  // Large gradient header bar
  fill(accent);
  doc.rect(0, 0, PW, 60, "F");

  // Decorative circles (low opacity using white rects — jsPDF GState trick)
  // We use setFillColor with alpha via direct rect overlap
  doc.setFillColor(255, 255, 255);
  // We can't do actual opacity in basic jsPDF so we skip semi-transparent shapes
  // Instead use solid white circles at very small size for texture
  doc.circle(PW - 18, 10, 26, "S"); // just stroke for subtle shape
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.circle(PW - 18, 8, 28, "S");
  doc.circle(PW - 30, 55, 15, "S");
  doc.circle(20, 58, 14, "S");

  // Logo pill (white background)
  fill(C.white);
  doc.roundedRect(ML, 7, 38, 11, 2, 2, "F");
  text(accent);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("PHARMAWALLAH", ML + 19, 14, { align: "center" });

  // Date (top right)
  text(C.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, PW - MR, 13, { align: "right" });

  // Main title
  text(C.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MCQ Assessment Report", ML, 37);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const subLine = `${semesterName}  ·  ${subjectName}`;
  doc.text(subLine.length > 80 ? subLine.slice(0, 78) + "…" : subLine, ML, 46);

  // Unit line
  doc.setFontSize(7.5);
  const uLine = `Unit: ${unitName}`;
  doc.text(uLine.length > 95 ? uLine.slice(0, 93) + "…" : uLine, ML, 53);

  y = 68;

  // ── Result banner ──────────────────────────────────────────────────
  const grade    = getGrade(stats.pct);
  const timeMins = Math.floor(timeTaken / 60);
  const timeSecs = timeTaken % 60;

  fill(accentLight);
  doc.roundedRect(ML, y, CW, 27, 3, 3, "F");
  draw(accent);
  doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, CW, 27, 3, 3, "S");

  // Big percentage
  text(accent);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${stats.pct}%`, ML + 13, y + 17);

  // Vertical rule
  draw(accent);
  doc.setLineWidth(0.4);
  doc.line(ML + 34, y + 5, ML + 34, y + 22);

  // Grade text
  text(C.dark);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(grade.pdfLabel, ML + 39, y + 12);

  // Meta info
  text(C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Time: ${timeMins}m ${timeSecs}s  ·  Questions: ${stats.total}  ·  Date: ${dateStr}`, ML + 39, y + 21);

  y += 33;

  // ── 4 stat boxes ─────────────────────────────────────────────────────
  const GAP   = 3;
  const BW    = (CW - GAP * 3) / 4;
  const BH    = 22;

  [
    { label: "Correct",  val: String(stats.correct),      colFg: C.green, colBg: C.greenBg },
    { label: "Wrong",    val: String(stats.wrong),         colFg: C.red,   colBg: C.redBg   },
    { label: "Skipped",  val: String(stats.skipped),       colFg: C.amber, colBg: C.amberBg },
    { label: "Score",    val: `${stats.pct}%`,             colFg: accent,  colBg: accentLight },
  ].forEach(({ label, val, colFg, colBg }, i) => {
    const bx = ML + i * (BW + GAP);
    fill(colBg);
    doc.roundedRect(bx, y, BW, BH, 2, 2, "F");
    draw(colFg);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, BW, BH, 2, 2, "S");
    // Top stripe
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

  // ── Progress bar ──────────────────────────────────────────────────────
  fill(C.border);
  doc.roundedRect(ML, y, CW, 4.5, 2, 2, "F");
  fill(accent);
  const barW = Math.max(5, CW * stats.pct / 100);
  doc.roundedRect(ML, y, barW, 4.5, 2, 2, "F");

  y += 11;

  // ── Section header ────────────────────────────────────────────────────
  draw(C.border);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);

  fill(accent);
  doc.rect(ML, y - 0.5, 4, 7.5, "F");
  text(C.dark);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("Question-by-Question Breakdown", ML + 7, y + 5.5);

  text(C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${stats.correct} correct  ·  ${stats.wrong} wrong  ·  ${stats.skipped} skipped`, PW - MR, y + 5.5, { align: "right" });

  y += 13;

  // ════════════════════════════════════════════════════════════════════
  // QUESTION CARDS
  // ════════════════════════════════════════════════════════════════════
  const STRIPE_W  = 4;        // left colored stripe
  const PAD       = 4;        // card inner padding
  const TEXT_X    = ML + STRIPE_W + PAD + 8; // after stripe + pad + number circle diameter
  const TEXT_W    = CW - STRIPE_W - PAD - 8 - PAD - 2; // usable text width

  questions.forEach((q, idx) => {
    const ua        = answers[q.id];
    const isCorrect = ua === q.correctAnswer;
    const isWrong   = ua !== undefined && ua !== q.correctAnswer;
    const isSkipped = ua === undefined;

    const sColor: [number,number,number] = isCorrect ? C.green : isWrong ? C.red : C.amber;
    const sBg:    [number,number,number] = isCorrect ? C.greenBg : isWrong ? C.redBg : C.amberBg;
    const sLabel  = isCorrect ? "CORRECT" : isWrong ? "WRONG" : "SKIPPED";

    // ── Pre-measure text for accurate card height ──────────────────
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    const qLines = doc.splitTextToSize(strip(q.question), TEXT_W - 22); // leave room for badge

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

    const qH_    = qLines.length    * lh(7.5);
    const corrH_ = corrLines.length * lh(7);
    const expH_  = expLines.length  > 0 ? expLines.length  * lh(6.5) + 7 : 0; // +7 for label + divider
    const refH_  = refLines.length  > 0 ? refLines.length  * lh(6)   + 2 : 0;
    const cardH  = PAD + 4 + qH_ + 2 + corrH_ + expH_ + refH_ + PAD;

    // ── Page break ──────────────────────────────────────────────────
    ensureSpace(cardH + 3);

    const cy = y;
    const cx = ML;

    // Card bg
    fill(sBg);
    doc.roundedRect(cx, cy, CW, cardH, 2, 2, "F");
    draw(sColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, CW, cardH, 2, 2, "S");

    // Left colored stripe
    fill(sColor);
    doc.roundedRect(cx, cy, STRIPE_W, cardH, 1.5, 1.5, "F");
    doc.rect(cx + 1.5, cy, STRIPE_W - 1.5, cardH, "F"); // flush right side of stripe

    // Q-number badge circle
    fill(sColor);
    const circX = cx + STRIPE_W + PAD + 4; // center of circle
    const circY = cy + PAD + 4;
    doc.circle(circX, circY, 4, "F");
    text(C.white);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(String(idx + 1), circX, circY + 2, { align: "center" });

    // Status badge (top-right of card)
    const BDGW = 20;
    const BDGX = cx + CW - BDGW - PAD;
    fill(sColor);
    doc.roundedRect(BDGX, cy + PAD - 1, BDGW, 5.5, 1, 1, "F");
    text(C.white);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    doc.text(sLabel, BDGX + BDGW / 2, cy + PAD + 3.2, { align: "center" });

    let iy = cy + PAD;

    // Q label (small)
    text(C.muted);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Q${idx + 1}  of  ${questions.length}`, TEXT_X, iy + 3);
    iy += 4 + 1;

    // Question text
    text(C.dark);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(qLines, TEXT_X, iy + lh(7.5));
    iy += qLines.length * lh(7.5) + 2;

    // Correct answer
    text(sColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(corrLines, TEXT_X, iy + lh(7));
    iy += corrLines.length * lh(7) + 2;

    // Explanation (wrong/skipped only)
    if ((isWrong || isSkipped) && expLines.length > 0) {
      // thin rule
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

  // Footer on last page
  drawFooter();

  doc.save(`PharmaWallah_${subjectName.replace(/\s+/g, "_")}_MCQ_Report.pdf`);
}

// ════════════════════════════════════════════════════════════════════════
// STICKY TIMER
// Uses CSS variable --navbar-height so it sits flush below the site navbar.
// Add to your global CSS: :root { --navbar-height: 64px; }
// Adjust the pixel value to match your actual navbar height.
// ════════════════════════════════════════════════════════════════════════
function QuizTimer({ secondsLeft, semGrad }: { secondsLeft: number; semGrad: string }) {
  const pct      = (secondsLeft / QUIZ_DURATION_SECONDS) * 100;
  const mm       = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss       = (secondsLeft % 60).toString().padStart(2, "0");
  const isUrgent = secondsLeft <= 60;
  const isWarn   = secondsLeft <= 180 && !isUrgent;

  return (
    <div
      className={`sticky z-40 shadow-md ${
        isUrgent ? "bg-red-50 border-b-2 border-red-300"
        : isWarn ? "bg-amber-50 border-b border-amber-300"
                 : "bg-white border-b border-gray-200"
      }`}
      style={{ top: "var(--navbar-height, 64px)" }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-extrabold text-sm shrink-0 ${
          isUrgent ? "bg-red-100 text-red-700 border border-red-300 animate-pulse"
          : isWarn ? "bg-amber-100 text-amber-700 border border-amber-300"
                   : `bg-gradient-to-r ${semGrad} text-white shadow-sm`
        }`}>
          <Timer className="w-3.5 h-3.5" />
          {mm}:{ss}
        </div>
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent ? "bg-red-500" : isWarn ? "bg-amber-400" : `bg-gradient-to-r ${semGrad}`
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-bold shrink-0 ${isUrgent ? "text-red-600 animate-pulse" : isWarn ? "text-amber-600" : "text-gray-500"}`}>
          {isUrgent ? "⚠ Hurry!" : `${Math.ceil(secondsLeft / 60)}m left`}
        </span>
      </div>
    </div>
  );
}

type Screen = "unit-select" | "lobby" | "quiz" | "results";

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
export default function MCQBankQuizPage({ params }: PageProps) {
  const { semesterSlug, subject: subjectSlug } = params;
  const { isSignedIn } = useUser();
  const { trackQuiz, trackActivity, trackTimeOnUnmount } = useTracker();

  const semData     = SemesterData.find(s => semesterToSlug(s.semester) === semesterSlug);
  const subData     = semData?.subjects.find(s => subjectToSlug(s.name) === subjectSlug);
  const bank        = BANK_REGISTRY[subjectSlug] ?? null;
  const semGrad     = SEM_GRADS[semesterSlug] ?? "from-blue-600 to-green-400";
  const accentColor = SEM_SOLID[semesterSlug] ?? "#2563eb";

  const [screen,     setScreen]    = useState<Screen>("unit-select");
  const [activeUnit, setActiveUnit] = useState<string | null>(null);
  const [answers,    setAnswers]    = useState<Record<number, string>>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [expanded,   setExpanded]   = useState<Set<number>>(new Set());
  const [showTop,    setShowTop]    = useState(false);
  const [quizStart,  setQuizStart]  = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(QUIZ_DURATION_SECONDS);
  const [timeTaken,  setTimeTaken]  = useState(0);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const units = useMemo(() => bank ? (bank.units ?? []) : [], [bank]);
  const questions = useMemo(() => {
    if (!bank) return [];
    if (!activeUnit) return bank.questions;
    return bank.questions.filter((q: any) => q.unit === activeUnit);
  }, [bank, activeUnit]);

  const answeredCount   = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { const cleanup = trackTimeOnUnmount(); return cleanup; }, [subjectSlug]); // eslint-disable-line

  useEffect(() => {
    if (screen !== "quiz" || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleAutoSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, submitted]); // eslint-disable-line

  const handleSelectUnit = (unit: string | null) => { setActiveUnit(unit); setScreen("lobby"); };

  const handleStartQuiz = () => {
    setAnswers({}); setSubmitted(false); setExpanded(new Set());
    setTimeLeft(QUIZ_DURATION_SECONDS); setQuizStart(Date.now());
    setScreen("quiz"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = useCallback((qId: number, optId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  }, [submitted]);

  const doSubmit = useCallback((latestAnswers: Record<number, string>, forced = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - quizStart) / 1000);
    setTimeTaken(elapsed); setSubmitted(true); setScreen("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const correct  = questions.filter((q: any) => latestAnswers[q.id] === q.correctAnswer).length;
    const timeMins = Math.max(1, Math.round(elapsed / 60));
    trackQuiz({ quizId: `${subjectSlug}-${activeUnit ?? "all"}-${Date.now()}`, subject: subData?.name ?? subjectSlug, score: correct, total: questions.length, timeTakenMin: timeMins });
    trackActivity({ type: "quiz", label: `${forced ? "⏰ Time up — " : ""}${subData?.name ?? subjectSlug} MCQs — ${correct}/${questions.length} correct`, href: `/mcqs-bank/${semesterSlug}/${subjectSlug}` });
  }, [questions, quizStart, subjectSlug, subData, activeUnit, semesterSlug]); // eslint-disable-line

  const handleSubmit     = useCallback(() => doSubmit(answers), [answers, doSubmit]);
  const handleAutoSubmit = useCallback(() => doSubmit(answersRef.current, true), [doSubmit]);

  const handleReset = useCallback(() => {
    setScreen("unit-select"); setActiveUnit(null); setAnswers({}); setSubmitted(false); setExpanded(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleExp = useCallback((qId: number) => {
    setExpanded(prev => { const s = new Set(prev); s.has(qId) ? s.delete(qId) : s.add(qId); return s; });
  }, []);

  const stats = useMemo(() => {
    if (!submitted) return null;
    const correct = questions.filter((q: any) => answers[q.id] === q.correctAnswer).length;
    const wrong   = Object.keys(answers).length - correct;
    const skipped = questions.length - Object.keys(answers).length;
    const pct     = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, skipped, pct, total: questions.length };
  }, [submitted, answers, questions]);

  const handleDownloadPDF = () => {
    if (!stats) return;
    generatePDF({ subjectName: subData?.name ?? subjectSlug, semesterName: semData?.semester ?? semesterSlug, unitName: activeUnit ?? "All Units", stats, timeTaken, questions, answers, accentColor });
  };

  // ── Unit label helper ──
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xl font-extrabold text-gray-900 mb-2">Subject not found</p>
        <Link href="/mcqs-bank" className="text-blue-600 text-sm font-semibold hover:underline">← Back to MCQ Bank</Link>
      </div>
    </div>
  );

  if (!bank) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">MCQs Coming Soon</h2>
        <p className="text-gray-500 text-sm mb-6">Questions for <strong>{subData.name}</strong> are being prepared.</p>
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
    <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-4 opacity-[0.07] pointer-events-none hidden sm:block"><BookMarked size={140} className="text-white" /></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/mcqs-bank" className="hover:text-white transition flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> MCQ Bank</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/mcqs-bank/${semesterSlug}`} className="hover:text-white transition">{semData.semester}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-[180px] sm:max-w-none">{subData.name}</span>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" /> {semData.semester} · Select a Unit
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2">{subData.name}</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">Choose a unit below to begin your timed MCQ practice session.</p>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">Full Practice</p>
        <button onClick={() => handleSelectUnit(null)}
          className={`w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r ${semGrad} p-5 sm:p-7 text-left shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mb-8`}>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none"><Layers size={80} className="text-white" /></div>
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-md"><Sparkles className="w-7 h-7 text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-lg sm:text-xl leading-tight">All Units — Complete Practice</p>
              <p className="text-white/75 text-sm mt-1">{bank.questions.length} questions  ·  15 min timer  ·  Full syllabus coverage</p>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors"><ChevronRight className="w-5 h-5 text-white" /></div>
          </div>
        </button>

        {units.length > 0 && (
          <>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">Practice by Unit</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {units.map((unit: string, i: number) => {
                const unitQCount = bank.questions.filter((q: any) => q.unit === unit).length;
                const label      = getUnitLabel(unit);
                const detail     = getUnitDetail(unit);
                return (
                  <button key={unit} onClick={() => handleSelectUnit(unit)}
                    className="group relative text-left bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${semGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                    <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                      <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${semGrad} flex items-center justify-center text-white font-extrabold text-base shadow-sm`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-snug">{label}</p>
                        {detail && <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{detail}</p>}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600"><Hash className="w-2.5 h-2.5" /> {unitQCount} MCQs</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600"><Clock className="w-2.5 h-2.5" /> 15 min</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
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
    const label  = getUnitLabel(activeUnit);
    const detail = getUnitDetail(activeUnit);
    return (
      <section className="min-h-screen bg-gray-50">
        <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden`}>
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <button onClick={() => setScreen("unit-select")} className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-5 transition-colors"><ChevronLeft className="w-4 h-4" /> Change Unit</button>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4"><Target className="w-3.5 h-3.5" /> Quiz Lobby</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">{subData.name}</h1>
            <p className="text-white/80 text-sm">{label}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className={`h-1.5 bg-gradient-to-r ${semGrad}`} />
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-4 mb-7">
                <div className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center shadow-lg`}><BookMarked className="w-7 h-7 text-white" /></div>
                <div>
                  <p className="text-gray-900 font-extrabold text-lg leading-snug">{label}</p>
                  {detail && <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{detail}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-7">
                {[{ Icon: Hash, label: "Questions", val: questions.length }, { Icon: Timer, label: "Time Limit", val: "15 min" }, { Icon: CheckSquare, label: "Attempts", val: "Unlimited" }].map(({ Icon, label: l, val }) => (
                  <div key={l} className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 py-4 px-2 text-center gap-1">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900 font-extrabold text-xl leading-none">{val}</p>
                    <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-7">
                <p className="text-amber-800 font-extrabold text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Important Rules</p>
                <ul className="space-y-1.5">
                  {["Timer starts immediately when you click Start Quiz.", "Unanswered questions are marked WRONG when time expires.", "You may submit early at any time.", "A detailed PDF report is available after completion."].map(r => (
                    <li key={r} className="flex items-start gap-2 text-amber-700 text-xs font-medium"><span className="text-amber-400 mt-0.5 shrink-0">▸</span> {r}</li>
                  ))}
                </ul>
              </div>
              <button onClick={handleStartQuiz} className={`w-full inline-flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-base shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}>
                <Play className="w-5 h-5 fill-white" /> Start Quiz — {questions.length} Questions
              </button>
            </div>
          </div>
          <div className="text-center mt-4">
            <button onClick={() => setScreen("unit-select")} className="text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors">← Choose a different unit</button>
          </div>
        </div>
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 3 — ACTIVE QUIZ
  // ════════════════════════════════════════════════════════════════════
  if (screen === "quiz") {
    const unitLabel = getUnitLabel(activeUnit);
    return (
      <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
        {/* ── Sticky timer — uses CSS var for correct offset below navbar ── */}
        <QuizTimer secondsLeft={timeLeft} semGrad={semGrad} />

        {/* Sub-header */}
        <div className={`bg-gradient-to-r ${semGrad} py-4 sm:py-5`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white/70 text-xs font-semibold truncate">{subData.name}</p>
              <h2 className="text-white font-extrabold text-base sm:text-lg truncate">{unitLabel}</h2>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 bg-white/20 border border-white/30 px-3 sm:px-4 py-2 rounded-xl">
              <span className="text-white font-extrabold text-sm">{answeredCount}</span>
              <span className="text-white/50 text-xs">/</span>
              <span className="text-white/80 text-sm font-semibold">{questions.length}</span>
              <span className="text-white/50 text-xs hidden sm:inline ml-1">answered</span>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${semGrad} transition-all duration-500`}
                style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
            </div>
            <span className="text-xs font-extrabold text-gray-500 shrink-0 w-9 text-right">
              {questions.length ? Math.round((answeredCount / questions.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-4 sm:space-y-5">
          {questions.map((q: any, qIdx: number) => {
            const userAnswer = answers[q.id];
            return (
              <div key={q.id} className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${semGrad}`} />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-5">
                    <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all duration-200 ${userAnswer ? `bg-gradient-to-br ${semGrad} text-white shadow-sm` : "bg-gray-100 text-gray-500 border-2 border-gray-200"}`}>
                      {userAnswer ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : qIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Q{qIdx + 1} of {questions.length}</span>
                        {q.unit && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">{q.unit.split(":")[0]}</span>}
                        {userAnswer && <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r ${semGrad} text-white`}>Answered</span>}
                      </div>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: q.question }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {q.options.map((opt: any) => {
                      const sel = userAnswer === opt.id;
                      return (
                        <button key={opt.id} onClick={() => handleSelect(q.id, opt.id)}
                          className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 ${sel ? `border-blue-500 bg-blue-50 text-blue-800 shadow-sm` : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"}`}>
                          <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border-2 transition-all ${sel ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{opt.id}</span>
                          <span className="text-xs sm:text-sm font-medium leading-snug flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                          {sel && <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pb-12 mt-2 flex flex-col items-center gap-3">
          {unansweredCount > 0 && answeredCount > 0 && (
            <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} unanswered — will be marked wrong
            </p>
          )}
          <button onClick={handleSubmit} disabled={answeredCount === 0}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-40 disabled:pointer-events-none`}>
            <Trophy className="w-5 h-5" /> Submit & See Results
          </button>
        </div>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-5 right-5 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${semGrad} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
            <ArrowUp size={17} />
          </button>
        )}
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SCREEN 4 — RESULTS
  // ════════════════════════════════════════════════════════════════════
  if (screen === "results" && stats) {
    const grade    = getGrade(stats.pct);
    const timeMins = Math.floor(timeTaken / 60);
    const timeSecs = timeTaken % 60;
    const unitLabel = getUnitLabel(activeUnit);

    return (
      <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
        {BG_ICONS.map(({ Icon, top, left, size }, i) => (
          <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
            <Icon size={size} strokeWidth={1.4} />
          </div>
        ))}

        <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden`}>
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4"><Trophy className="w-3.5 h-3.5" /> Quiz Complete</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">{subData.name}</h1>
            <p className="text-white/80 text-sm mb-6">{unitLabel} · {stats.total} questions · {timeMins}m {timeSecs}s</p>
            <div className="flex flex-wrap gap-5 sm:gap-10">
              {[{ n: `${stats.correct}/${stats.total}`, l: "Correct", col: "text-green-200" }, { n: String(stats.wrong), l: "Wrong", col: "text-red-200" }, { n: String(stats.skipped), l: "Skipped", col: "text-yellow-200" }, { n: `${stats.pct}%`, l: "Score", col: "text-white" }].map(({ n, l, col }) => (
                <div key={l} className="text-center">
                  <div className={`text-2xl sm:text-3xl font-extrabold leading-none ${col}`}>{n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Grade card */}
          <div className={`mb-7 relative rounded-2xl border-2 ${grade.bg} overflow-hidden p-5 sm:p-7`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="text-5xl sm:text-6xl shrink-0 select-none">{grade.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl sm:text-2xl font-extrabold ${grade.color}`}>{grade.label}</p>
                <p className="text-gray-600 text-sm mt-1">
                  You scored <strong>{stats.correct}</strong> of <strong>{stats.total}</strong> ({stats.pct}%)
                  {stats.skipped > 0 && <span className="text-amber-600 ml-1.5">{stats.skipped} unanswered (marked wrong).</span>}
                </p>
                <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${semGrad} transition-all duration-1000`} style={{ width: `${stats.pct}%` }} />
                </div>
                <div className="flex gap-5 mt-2 text-xs font-bold">
                  <span className="text-green-600">✓ {stats.correct} Correct</span>
                  <span className="text-red-500">✗ {stats.wrong} Wrong</span>
                  {stats.skipped > 0 && <span className="text-amber-500">— {stats.skipped} Skipped</span>}
                </div>
                {isSignedIn && (
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    <LayoutDashboard className="w-3.5 h-3.5" /> View your progress in Dashboard →
                  </Link>
                )}
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button onClick={handleDownloadPDF}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-blue-200 text-blue-700 font-extrabold text-xs hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm">
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={handleReset}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition-all`}>
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="space-y-4 sm:space-y-5">
            {questions.map((q: any, qIdx: number) => {
              const userAnswer = answers[q.id];
              const isCorrect  = userAnswer === q.correctAnswer;
              const isWrong    = userAnswer !== undefined && userAnswer !== q.correctAnswer;
              const isSkipped  = userAnswer === undefined;
              const showExp    = (isWrong || isSkipped) && expanded.has(q.id);
              const cardBorder = isCorrect ? "border-green-300" : isWrong ? "border-red-300" : "border-amber-300";
              const cardBg     = isCorrect ? "bg-green-50/40"   : isWrong ? "bg-red-50/30"   : "bg-amber-50/30";

              return (
                <div key={q.id} className={`relative rounded-2xl border-2 ${cardBorder} ${cardBg} overflow-hidden shadow-sm`}>
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${semGrad}`} />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-extrabold ${isCorrect ? "bg-green-100 text-green-700 border-2 border-green-200" : isWrong ? "bg-red-100 text-red-700 border-2 border-red-200" : "bg-amber-100 text-amber-700 border-2 border-amber-200"}`}>
                        {isCorrect ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : isWrong ? <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Q{qIdx + 1} of {questions.length}</span>
                          {q.unit && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">{q.unit.split(":")[0]}</span>}
                          {isCorrect && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">✓ Correct</span>}
                          {isWrong   && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">✗ Incorrect</span>}
                          {isSkipped && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">— Unanswered</span>}
                        </div>
                        <p className="text-gray-900 font-semibold text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: q.question }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {q.options.map((opt: any) => {
                        const isSel = userAnswer === opt.id, isRight = opt.id === q.correctAnswer;
                        let cls = "border-gray-100 bg-gray-50/50 text-gray-400 cursor-default opacity-60";
                        if (isRight) cls = "border-green-400 bg-green-50 text-green-900 cursor-default";
                        else if (isSel) cls = "border-red-400 bg-red-50 text-red-900 cursor-default";
                        return (
                          <button key={opt.id} disabled className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${cls}`}>
                            <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border-2 ${isRight ? "bg-green-500 text-white border-green-500" : isSel ? "bg-red-500 text-white border-red-500" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                              {isRight ? "✓" : isSel ? "✗" : opt.id}
                            </span>
                            <span className="text-xs sm:text-sm font-medium leading-snug flex-1" dangerouslySetInnerHTML={{ __html: opt.text }} />
                            {isRight && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                            {isSel && !isRight && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {(isWrong || isSkipped) && (
                      <div className="mt-4">
                        <button onClick={() => toggleExp(q.id)}
                          className={`flex items-center gap-2 text-xs font-extrabold px-3 py-2 rounded-xl transition-all ${expanded.has(q.id) ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                          {expanded.has(q.id) ? "Hide Explanation" : "Show Explanation"}
                          {expanded.has(q.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {showExp && (
                          <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500">Correct Answer</span>
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-green-100 text-green-700 border border-green-200">
                                {q.correctAnswer} — {q.options.find((o: any) => o.id === q.correctAnswer)?.text}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Explanation</p>
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
                            </div>
                            {q.reference && (
                              <div className="pt-2 border-t border-indigo-100">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-1">Reference</p>
                                <p className="text-xs text-gray-500 italic">{q.reference}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {isCorrect && (
                      <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-700 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-blue-300 bg-blue-50 text-blue-700 font-extrabold text-sm hover:bg-blue-100 hover:border-blue-400 transition-all"><FileText className="w-5 h-5" /> Download PDF Report</button>
            <button onClick={handleReset} className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all`}><RotateCcw className="w-5 h-5" /> Try Another Unit</button>
            {isSignedIn && <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all"><LayoutDashboard className="w-4 h-4" /> My Dashboard</Link>}
            {subData.href && <Link href={subData.href} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all"><BookOpen className="w-4 h-4" /> Study Notes</Link>}
          </div>

          {/* Explore CTA */}
          <div className={`mt-10 relative rounded-2xl bg-gradient-to-r ${semGrad} overflow-hidden p-6 sm:p-8`}>
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1"><Award className="w-5 h-5 text-white" /><span className="text-white font-extrabold text-sm sm:text-base">Explore more subjects</span></div>
                <p className="text-white/80 text-xs sm:text-sm">Test your knowledge across all semesters.</p>
              </div>
              <Link href="/mcqs-bank" className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
                <ClipboardList className="w-4 h-4" /> MCQ Bank <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-5 right-5 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${semGrad} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
            <ArrowUp size={17} />
          </button>
        )}
      </section>
    );
  }

  return null;
}