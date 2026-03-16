"use client";
// src/app/(site)/mcqs-bank/[semesterSlug]/[subject]/page.tsx
// Dynamic quiz page — loads question bank by subjectSlug
// Supports: unit filtering, partial submission, full stats, expandable explanations

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  BookOpen, Trophy, RotateCcw, AlertTriangle, Zap, Layers,
  ClipboardList, ChevronDown, ChevronUp, Award, ArrowUp,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill, Filter,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";
import type { MCQBank } from "@/lib/mcq-utils";

// ── Dynamic import map — add subject slugs here as banks are created ──────────
// In Next.js we can't do fully dynamic imports at runtime in client components,
// so we maintain a registry. Add entries as you create new question banks.
import biochemBank from "@/app/api/mcq-data/pharmaceutical-biochemistry";

const BANK_REGISTRY: Record<string, MCQBank> = {
  "pharmaceutical-biochemistry": biochemBank,
  // "organic-chemistry": orgChemBank,   ← add new banks here
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface PageProps { params: { semesterSlug: string; subject: string } }

// ── BG Icons ──────────────────────────────────────────────────────────────────
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

// ── Grade helper ──────────────────────────────────────────────────────────────
function getGrade(pct: number) {
  if (pct >= 90) return { label: "A+  Distinction",   color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", emoji: "🏆" };
  if (pct >= 80) return { label: "A  Excellent",       color: "text-green-700",   bg: "bg-green-50 border-green-200",     emoji: "🥇" };
  if (pct >= 70) return { label: "B  Good",            color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       emoji: "🎯" };
  if (pct >= 60) return { label: "C  Satisfactory",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     emoji: "📖" };
  if (pct >= 50) return { label: "D  Pass",            color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",   emoji: "✅" };
  return               { label: "F  Needs Revision",   color: "text-red-700",     bg: "bg-red-50 border-red-200",         emoji: "📚" };
}

// ═════════════════════════════════════════════════════════════════════════════
export default function MCQBankQuizPage({ params }: PageProps) {
  const { semesterSlug, subject: subjectSlug } = params;

  // ── Resolve semester and subject from SemesterData ────────────────────────
  const semData = SemesterData.find(s => semesterToSlug(s.semester) === semesterSlug);
  const subData = semData?.subjects.find(s => subjectToSlug(s.name) === subjectSlug);
  const bank    = BANK_REGISTRY[subjectSlug] ?? null;

  const semGrad = SEM_GRADS[semesterSlug] ?? "from-blue-600 to-green-400";

  // ── Unit filter state ─────────────────────────────────────────────────────
  const units        = useMemo(() => bank ? ["All", ...(bank.units ?? [])] : [], [bank]);
  const [activeUnit, setActiveUnit] = useState("All");

  const questions = useMemo(() => {
    if (!bank) return [];
    if (activeUnit === "All") return bank.questions;
    return bank.questions.filter(q => q.unit === activeUnit);
  }, [bank, activeUnit]);

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [answers,     setAnswers]     = useState<Record<number, string>>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [expanded,    setExpanded]    = useState<Set<number>>(new Set());
  const [showTop,     setShowTop]     = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setExpanded(new Set());
  }, [activeUnit]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const answeredCount   = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const stats = useMemo(() => {
    if (!submitted) return null;
    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const wrong   = answeredCount - correct;
    const skipped = questions.length - answeredCount;
    const pct     = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, wrong, skipped, pct, total: questions.length };
  }, [submitted, answers, questions, answeredCount]);

  const handleSelect = useCallback((qId: number, optId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setExpanded(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleExp = useCallback((qId: number) => {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(qId) ? s.delete(qId) : s.add(qId);
      return s;
    });
  }, []);

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!semData || !subData) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
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
        <p className="text-gray-500 text-sm mb-6">
          Questions for <strong>{subData.name}</strong> are being prepared. Check back soon!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/mcqs-bank/${semesterSlug}`}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 transition-all`}>
            <ChevronLeft className="w-4 h-4" /> Back to {semData.semester}
          </Link>
          <Link href="/mcqs-bank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 transition-all">
            <Layers className="w-4 h-4" /> MCQ Bank
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO ══ */}
      <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-4 opacity-[0.08] pointer-events-none hidden sm:block">
          <ClipboardList size={120} className="text-white" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/mcqs-bank" className="hover:text-white transition flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5" /> MCQ Bank
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/mcqs-bank/${semesterSlug}`} className="hover:text-white transition">{semData.semester}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white truncate max-w-[160px] sm:max-w-none">{subData.name}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" /> {semData.semester} · MCQ Practice
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-1">
            {subData.name}
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mb-6">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
            {activeUnit !== "All" && ` · ${activeUnit}`}
            {!submitted && ` · ${answeredCount} answered`}
          </p>

          {/* Score pills after submit */}
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

          {/* Live counters before submit */}
          {!submitted && (
            <div className="flex flex-wrap gap-6">
              {[
                { n: questions.length,  l: "Questions" },
                { n: answeredCount,     l: "Answered"  },
                { n: unansweredCount,   l: "Remaining" },
              ].map(({ n, l }) => (
                <div key={l} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ── Unit filter tabs ── */}
        {units.length > 2 && (
          <div className="mb-6 overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              <Filter className="w-4 h-4 text-gray-400 self-center shrink-0" />
              {units.map(u => (
                <button key={u} onClick={() => setActiveUnit(u)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                    activeUnit === u
                      ? `bg-gradient-to-r ${semGrad} text-white shadow-md`
                      : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                  }`}>
                  {u === "All" ? "All Units" : u.split(":")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Results banner ── */}
        {submitted && stats && (() => {
          const grade = getGrade(stats.pct);
          return (
            <div className={`mb-6 relative rounded-2xl border-2 ${grade.bg} overflow-hidden p-4 sm:p-6`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-4xl sm:text-5xl shrink-0">{grade.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg sm:text-2xl font-extrabold ${grade.color}`}>{grade.label}</p>
                  <p className="text-gray-600 text-sm mt-0.5">
                    You scored <strong>{stats.correct}</strong> out of <strong>{stats.total}</strong> ({stats.pct}%).
                    {stats.skipped > 0 && <span className="text-amber-600 ml-1">{stats.skipped} unanswered.</span>}
                  </p>
                  <div className="mt-3 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${semGrad} transition-all duration-1000`}
                      style={{ width: `${stats.pct}%` }} />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs font-semibold">
                    <span className="text-green-600">✓ {stats.correct} Correct</span>
                    <span className="text-red-500">✗ {stats.wrong} Wrong</span>
                    {stats.skipped > 0 && <span className="text-amber-500">— {stats.skipped} Skipped</span>}
                  </div>
                </div>
                <button onClick={handleReset}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 transition-all`}>
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Question list ── */}
        <div className="space-y-4 sm:space-y-5">
          {questions.map((q, qIdx) => {
            const userAnswer  = answers[q.id];
            const isCorrect   = submitted && userAnswer === q.correctAnswer;
            const isWrong     = submitted && userAnswer !== undefined && userAnswer !== q.correctAnswer;
            const isSkipped   = submitted && userAnswer === undefined;
            const showExp     = submitted && (isWrong || isSkipped) && expanded.has(q.id);

            const cardBorder  = !submitted ? "border-gray-200"
              : isCorrect ? "border-green-300" : isWrong ? "border-red-300" : "border-amber-300";
            const cardBg      = !submitted ? "bg-white"
              : isCorrect ? "bg-green-50/40" : isWrong ? "bg-red-50/30" : "bg-amber-50/30";

            return (
              <div key={q.id} className={`relative rounded-2xl border-2 ${cardBorder} ${cardBg} overflow-hidden shadow-sm transition-all duration-300`}>
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${semGrad}`} />
                <div className="p-4 sm:p-6">

                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                      isCorrect ? "bg-green-100 text-green-700 border border-green-200" :
                      isWrong   ? "bg-red-100 text-red-700 border border-red-200" :
                      isSkipped ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      `bg-gradient-to-br ${semGrad} text-white`
                    }`}>
                      {isCorrect ? <CheckCircle className="w-4 h-4" /> :
                       isWrong   ? <XCircle className="w-4 h-4" /> :
                       isSkipped ? <AlertTriangle className="w-3.5 h-3.5" /> :
                       qIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Q{qIdx + 1} of {questions.length}
                        </span>
                        {q.unit && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">{q.unit.split(":")[0]}</span>}
                        {isCorrect && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">✓ Correct</span>}
                        {isWrong   && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">✗ Incorrect</span>}
                        {isSkipped && <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">— Unanswered</span>}
                      </div>
                      <p className="text-gray-900 font-semibold text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: q.question }} />
                    </div>
                  </div>

                  {/* Options — 2-col on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {q.options.map(opt => {
                      const isSel   = userAnswer === opt.id;
                      const isRight = opt.id === q.correctAnswer;
                      let cls = "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer";
                      if (!submitted && isSel)     cls = "border-blue-500 bg-blue-50 text-blue-800 cursor-pointer";
                      if (submitted) {
                        if (isRight)              cls = "border-green-400 bg-green-50 text-green-900 cursor-default";
                        else if (isSel)           cls = "border-red-400 bg-red-50 text-red-900 cursor-default";
                        else                      cls = "border-gray-100 bg-gray-50/50 text-gray-400 cursor-default opacity-60";
                      }
                      return (
                        <button key={opt.id} onClick={() => handleSelect(q.id, opt.id)} disabled={submitted}
                          className={`flex items-center gap-3 w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-150 ${cls}`}>
                          <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border ${
                            !submitted && isSel  ? "bg-blue-600 text-white border-blue-600" :
                            submitted && isRight ? "bg-green-500 text-white border-green-500" :
                            submitted && isSel   ? "bg-red-500 text-white border-red-500" :
                            "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {submitted && isRight ? "✓" : submitted && isSel ? "✗" : opt.id}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-snug flex-1"
                            dangerouslySetInnerHTML={{ __html: opt.text }} />
                          {submitted && isRight && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          {submitted && isSel && !isRight && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation — wrong/skipped only, expandable */}
                  {submitted && (isWrong || isSkipped) && (
                    <div className="mt-4">
                      <button onClick={() => toggleExp(q.id)}
                        className={`flex items-center gap-2 text-xs font-extrabold px-3 py-2 rounded-xl transition-all ${
                          expanded.has(q.id)
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                        }`}>
                        <BookOpen className="w-3.5 h-3.5" />
                        {expanded.has(q.id) ? "Hide Explanation" : "Show Explanation"}
                        {expanded.has(q.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showExp && (
                        <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 sm:p-4 space-y-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
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

                  {/* Inline explanation for correct answers */}
                  {submitted && isCorrect && (
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

        {/* ── Submit / Retry ── */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {!submitted ? (
            <>
              {unansweredCount > 0 && answeredCount > 0 && (
                <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {unansweredCount} question{unansweredCount > 1 ? "s" : ""} unanswered — you can still submit
                </p>
              )}
              <button onClick={handleSubmit} disabled={answeredCount === 0}
                className={`inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:pointer-events-none`}>
                <Trophy className="w-5 h-5" /> Submit & See Results
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button onClick={handleReset}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r ${semGrad} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all`}>
                <RotateCcw className="w-5 h-5" /> Retake Quiz
              </button>
              {subData.href && (
                <Link href={subData.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all">
                  <BookOpen className="w-4 h-4" /> Study Notes
                </Link>
              )}
              <Link href={`/mcqs-bank/${semesterSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all">
                <ChevronLeft className="w-4 h-4" /> More Subjects
              </Link>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className={`mt-10 relative rounded-2xl bg-gradient-to-r ${semGrad} overflow-hidden p-5 sm:p-8`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Explore more subjects</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">Test your knowledge across all semesters.</p>
            </div>
            <Link href="/mcqs-bank"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
              <ClipboardList className="w-4 h-4" /> MCQ Bank <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${semGrad} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}