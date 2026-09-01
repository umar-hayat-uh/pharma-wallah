"use client";

// src/app/(site)/mcqs-bank/page.tsx
// MCQ Bank Hub — Modern E-Learning Design with Auto Scroll-To-Top

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList, ChevronRight, Search, X,
  BookOpen, Zap, GraduationCap, ArrowRight,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
  Trophy, Layers, Filter, Sparkles, CheckCircle2, Flame, Brain
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";

const GRAD = "from-blue-600 via-indigo-600 to-cyan-500";

const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 28 },
  { Icon: Beaker, top: "38%", left: "1%", size: 26 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 28 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 26 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 26 },
];

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

const AVAILABLE_SLUGS = new Set([
  "pharmaceutical-biochemistry",
  "physiology-histology-i",
  "organic-chemistry",
  "physical-pharmacy",
]);

export default function MCQBankHubPage() {
  const [search, setSearch] = useState("");
  const [activeSem, setActiveSem] = useState<string>("All");

  const semOptions = ["All", ...SemesterData.map(s => s.semester)];

  const totalSubjects = SemesterData.reduce((s, sem) => s + sem.subjects.length, 0);
  const availableCount = SemesterData.reduce((s, sem) =>
    s + sem.subjects.filter(sub => AVAILABLE_SLUGS.has(subjectToSlug(sub.name))).length, 0
  );

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleSelectSem = (s: string) => {
    setActiveSem(s);
    scrollToTop();
  };

  const filtered = useMemo(() => {
    return SemesterData
      .filter(sem => activeSem === "All" || sem.semester === activeSem)
      .map(sem => ({
        ...sem,
        subjects: sem.subjects.filter(sub =>
          sub.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter(sem => sem.subjects.length > 0);
  }, [search, activeSem]);

  return (
    <section className="min-h-screen bg-gray-50/80 pt-8 relative overflow-x-hidden">
      {/* Background Floating Decorative Icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100/60 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO HEADER ══ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden shadow-xl`}>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 left-20 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-12 bottom-6 opacity-[0.08] pointer-events-none hidden lg:block">
          <ClipboardList size={160} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-4 flex-wrap">
            <Link href="/" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">MCQ Bank Hub</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest mb-4 backdrop-blur-sm shadow-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> Interactive E-Learning Bank
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-3">
            Pharmacy MCQ Bank
            <span className="block text-cyan-200 mt-1 text-2xl sm:text-4xl md:text-5xl">Exam-Focused Question Modules</span>
          </h1>

          <p className="text-white/85 text-sm sm:text-base max-w-2xl mb-8 font-medium leading-relaxed">
            Master your pharmacy coursework with timed exams, practice flashcards, instant explanations, and downloadable PDF report cards across all semesters.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            {[
              { n: String(SemesterData.length), l: "Semesters", icon: GraduationCap },
              { n: String(totalSubjects), l: "Total Subjects", icon: BookOpen },
              { n: String(availableCount), l: "Ready Now", icon: Sparkles },
              { n: "100%", l: "Free Access", icon: Trophy },
            ].map(({ n, l, icon: Icon }) => (
              <div key={l} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white leading-none">{n}</div>
                  <div className="text-[11px] text-white/80 font-bold mt-0.5">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT BODY ══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Sticky Glassmorphic Filter & Search Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-gray-100 shadow-lg mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">

            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subject (e.g. Biochemistry, Physiology)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm text-gray-800 font-medium placeholder:text-gray-400 bg-gray-50/50 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Semester Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
              <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1 hidden sm:block" />
              {semOptions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSelectSem(s)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${activeSem === s
                    ? `bg-gradient-to-r ${GRAD} text-white shadow-md`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {s === "All" ? "All Semesters" : s.replace("Semester ", "Sem ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Semester Sections & Cards */}
        <div className="space-y-10 sm:space-y-12">
          {filtered.map((sem) => {
            const semSlug = semesterToSlug(sem.semester);
            const semIdx = SemesterData.findIndex(s => s.semester === sem.semester);
            const semGrad = SEM_GRADS[semIdx % SEM_GRADS.length];

            return (
              <div key={sem.semester} className="space-y-4">
                {/* Semester Section Header */}
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center shrink-0 shadow-md text-white font-black`}>
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-none">{sem.semester}</h2>
                      <p className="text-xs font-bold text-gray-400 mt-1">
                        {sem.subjects.length} Course Module{sem.subjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/mcqs-bank/${semSlug}`}
                    onClick={scrollToTop}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${semGrad} text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all shrink-0`}
                  >
                    View Semester <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Subject Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sem.subjects.map(sub => {
                    const subSlug = subjectToSlug(sub.name);
                    const isAvail = AVAILABLE_SLUGS.has(subSlug);
                    const href = `/mcqs-bank/${semSlug}/${subSlug}`;

                    return (
                      <div
                        key={sub.name}
                        className={`group relative rounded-3xl border-2 bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between ${isAvail
                          ? "border-gray-100 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                          : "border-gray-100 opacity-60 cursor-default"
                          }`}
                      >
                        <div className={`h-1.5 bg-gradient-to-r ${semGrad}`} />

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="text-3xl shrink-0 p-2 rounded-2xl bg-gray-50 border border-gray-100">
                                {typeof sub.icon === "string" ? sub.icon : "📚"}
                              </div>
                              {isAvail ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wider">
                                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Ready Now
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-400 uppercase tracking-wider">
                                  Coming Soon
                                </span>
                              )}
                            </div>

                            <h3 className="font-black text-gray-900 text-base leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">
                              {sub.name}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{sub.description}</p>
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            {isAvail ? (
                              <Link
                                href={href}
                                onClick={scrollToTop}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r ${semGrad} text-white text-xs font-black shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]`}
                              >
                                <Trophy className="w-4 h-4" /> Start Practice
                              </Link>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-100 text-gray-400 text-xs font-bold">
                                <ClipboardList className="w-4 h-4" /> Bank In Progress
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-gray-100 shadow-sm max-w-md mx-auto">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-extrabold text-lg">No subjects matched your search</p>
            <p className="text-gray-500 text-xs mt-1 mb-6">Try searching for a different keyword or select another semester filter.</p>
            <button
              onClick={() => { setSearch(""); setActiveSem("All"); scrollToTop(); }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className={`mt-14 sm:mt-16 relative rounded-3xl bg-gradient-to-r ${GRAD} overflow-hidden p-6 sm:p-10 shadow-2xl`}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-6 h-6 text-yellow-300" />
                <span className="text-white font-black text-lg sm:text-xl">Looking for Study Notes First?</span>
              </div>
              <p className="text-white/85 text-xs sm:text-sm font-medium">Review lecture slide notes and reference textbooks before taking the quiz.</p>
            </div>
            <Link
              href="/courses"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4" /> Browse Course Notes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}