"use client";

// src/app/(site)/mcqs-bank/[semesterSlug]/page.tsx
// MCQ Bank Semester Page — Modern E-Learning Design (With Auto Scroll-To-Top)

import { useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, BookOpen, Trophy, ClipboardList,
  GraduationCap, Zap, Layers, Sparkles, CheckCircle2, ArrowLeft,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";

interface PageProps { params: { semesterSlug: string } }

const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 28 },
  { Icon: Beaker, top: "38%", left: "1%", size: 26 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 28 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 26 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 26 },
];

const AVAILABLE_SLUGS = new Set([
  "pharmaceutical-biochemistry",
  "physiology-histology-i",
]);

const SEM_GRADS = [
  "from-blue-600 via-indigo-600 to-cyan-500",
  "from-violet-600 via-purple-600 to-fuchsia-500",
  "from-emerald-600 via-teal-600 to-cyan-500",
  "from-amber-500 via-orange-600 to-yellow-500",
  "from-rose-600 via-pink-600 to-red-400",
  "from-cyan-600 via-sky-600 to-blue-500",
  "from-indigo-600 via-blue-600 to-violet-500",
  "from-green-600 via-emerald-600 to-teal-400",
  "from-orange-600 via-red-600 to-amber-500",
  "from-fuchsia-600 via-violet-600 to-purple-500",
];

export default function MCQBankSemesterPage({ params }: PageProps) {
  const { semesterSlug } = params;

  const semIdx = SemesterData.findIndex(s => semesterToSlug(s.semester) === semesterSlug);
  const sem = SemesterData[semIdx];

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  if (!sem) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-sm">
        <p className="text-xl font-black text-gray-900 mb-2">Semester Not Found</p>
        <Link href="/mcqs-bank" onClick={scrollToTop} className="text-blue-600 text-sm font-extrabold hover:underline inline-flex items-center gap-1">
          ← Return to MCQ Bank Hub
        </Link>
      </div>
    </div>
  );

  const semGrad = SEM_GRADS[semIdx % SEM_GRADS.length];
  const prevSem = semIdx > 0 ? SemesterData[semIdx - 1] : null;
  const nextSem = semIdx < SemesterData.length - 1 ? SemesterData[semIdx + 1] : null;
  const availCount = sem.subjects.filter(s => AVAILABLE_SLUGS.has(subjectToSlug(s.name))).length;

  return (
    <section className="min-h-screen bg-gray-50/80 pt-8 relative overflow-x-hidden">
      {/* Background Decorative Icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100/60 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO HEADER ══ */}
      <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden shadow-xl`}>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 left-20 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 bottom-6 opacity-[0.08] pointer-events-none hidden lg:block">
          <GraduationCap size={160} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-4 flex-wrap">
            <Link href="/mcqs-bank" onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5" /> MCQ Bank
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{sem.semester}</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest mb-4 backdrop-blur-sm shadow-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> {sem.semester} Modules
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-3">
            {sem.semester}
            <span className="block text-white/80 text-2xl sm:text-4xl mt-1">Interactive MCQ Practice</span>
          </h1>

          <p className="text-white/85 text-sm sm:text-base max-w-2xl mb-8 font-medium leading-relaxed">
            Choose a subject module below to start practice sessions with instant rationale, streak multipliers, and downloadable performance reports.
          </p>

          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: String(sem.subjects.length), l: "Total Subjects" },
              { n: String(availCount), l: "Available Now" },
              { n: String(sem.subjects.length - availCount), l: "In Production" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-left">
                <div className="text-2xl sm:text-3xl font-black text-white leading-none">{n}</div>
                <div className="text-xs text-white/80 font-bold mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT BODY ══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {sem.subjects.map((sub, i) => {
            const subSlug = subjectToSlug(sub.name);
            const isAvail = AVAILABLE_SLUGS.has(subSlug);
            const href = `/mcqs-bank/${semesterSlug}/${subSlug}`;

            return (
              <div
                key={sub.name}
                className={`group relative rounded-3xl border-2 bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between ${isAvail
                    ? "border-gray-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    : "border-gray-100 opacity-60 cursor-default"
                  }`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${semGrad}`} />

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="text-3xl shrink-0 p-2.5 rounded-2xl bg-gray-50 border border-gray-100">
                        {typeof sub.icon === "string" ? sub.icon : "📚"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                          #{i + 1}
                        </span>
                        {isAvail ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-wider">
                            Soon
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-black text-gray-900 text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{sub.description}</p>
                  </div>

                  <div className="pt-2">
                    {isAvail ? (
                      <Link
                        href={href}
                        onClick={scrollToTop}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r ${semGrad} text-white text-xs font-black shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]`}
                      >
                        <Trophy className="w-4 h-4" /> Start Interactive Quiz
                      </Link>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-400 text-xs font-bold">
                        <ClipboardList className="w-4 h-4" /> Questions Coming Soon
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Semester Navigation Bar */}
        <div className="grid grid-cols-2 gap-4 mt-10 sm:mt-12">
          {prevSem ? (
            <Link
              href={`/mcqs-bank/${semesterToSlug(prevSem.semester)}`}
              onClick={scrollToTop}
              className="group relative flex items-center gap-3 bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-4 sm:p-5 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${SEM_GRADS[(semIdx - 1) % SEM_GRADS.length]}`} />
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Previous Semester</p>
                <p className="text-xs sm:text-sm font-black text-gray-900 truncate">{prevSem.semester}</p>
              </div>
            </Link>
          ) : <div />}

          {nextSem ? (
            <Link
              href={`/mcqs-bank/${semesterToSlug(nextSem.semester)}`}
              onClick={scrollToTop}
              className="group relative flex items-center justify-end gap-3 bg-white rounded-3xl border-2 border-gray-100 shadow-sm p-4 sm:p-5 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden text-right"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${SEM_GRADS[(semIdx + 1) % SEM_GRADS.length]}`} />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Next Semester</p>
                <p className="text-xs sm:text-sm font-black text-gray-900 truncate">{nextSem.semester}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Return Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/mcqs-bank"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-black text-xs hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4" /> Return to All Semesters
          </Link>
        </div>
      </div>
    </section>
  );
}