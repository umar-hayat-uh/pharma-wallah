"use client";
// src/app/(site)/mcqs-bank/page.tsx
// MCQ Bank Hub — pulls ALL subjects from SemesterData, no duplication

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, ChevronRight, Search, X,
  BookOpen, Zap, GraduationCap, ArrowRight,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
  Trophy, Layers, Filter,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";

const GRAD = "from-blue-600 to-green-400";

const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

// Gradient per semester slot
const SEM_GRADS = [
  "from-blue-600 to-cyan-400",
  "from-violet-600 to-purple-400",
  "from-emerald-600 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-600 to-pink-400",
  "from-cyan-600 to-sky-400",
  "from-indigo-600 to-blue-400",
  "from-green-600 to-lime-400",
  "from-orange-600 to-red-400",
  "from-fuchsia-600 to-violet-400",
];

const AVAILABLE_SLUGS = new Set([
  "pharmaceutical-biochemistry",
  "physiology-histology-i",
  // add more slugs here as you create question banks
]);

export default function MCQBankHubPage() {
  const [search, setSearch] = useState("");
  const [activeSem, setActiveSem] = useState<string>("All");

  const semOptions = ["All", ...SemesterData.map(s => s.semester)];

  const totalSubjects = SemesterData.reduce((s, sem) => s + sem.subjects.length, 0);
  const availableCount = SemesterData.reduce((s, sem) =>
    s + sem.subjects.filter(sub => AVAILABLE_SLUGS.has(subjectToSlug(sub.name))).length, 0
  );

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
    <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO ══ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-6 opacity-[0.08] pointer-events-none hidden sm:block">
          <ClipboardList size={120} className="text-white" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">MCQ Bank</span>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Practice · All Semesters
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">
            MCQ Bank
            <span className="block text-green-200 mt-1">Practice Questions</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mb-8">
            Exam-focused multiple choice questions across all semesters. Select your subject, answer questions, and get instant feedback with detailed explanations.
          </p>
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: String(SemesterData.length), l: "Semesters"          },
              { n: String(totalSubjects),        l: "Subjects"           },
              { n: String(availableCount),       l: "Available Now"      },
              { n: "Free",                       l: "Always"             },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                <div className="text-xs text-white/70 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Search + semester filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search subjects…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {semOptions.map(s => (
              <button key={s} onClick={() => setActiveSem(s)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
                  activeSem === s ? `bg-gradient-to-r ${GRAD} text-white shadow-md` : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300"
                }`}>{s === "All" ? "All" : s.replace("Semester ", "Sem ")}</button>
            ))}
          </div>
        </div>

        {/* Semester sections */}
        <div className="space-y-8 sm:space-y-10">
          {filtered.map((sem, semIdx) => {
            const semSlug = semesterToSlug(sem.semester);
            const semGrad = SEM_GRADS[SemesterData.findIndex(s => s.semester === sem.semester) % SEM_GRADS.length];
            return (
              <div key={sem.semester}>
                {/* Semester header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${semGrad} flex items-center justify-center shrink-0 shadow-sm`}>
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-gray-900">{sem.semester}</h2>
                      <p className="text-xs text-gray-400">{sem.subjects.length} subject{sem.subjects.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Link href={`/mcqs-bank/${semSlug}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${semGrad} text-white text-xs font-extrabold shadow-sm hover:-translate-y-0.5 transition-all shrink-0`}>
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Subject cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {sem.subjects.map(sub => {
                    const subSlug  = subjectToSlug(sub.name);
                    const isAvail  = AVAILABLE_SLUGS.has(subSlug);
                    const href     = `/mcqs-bank/${semSlug}/${subSlug}`;
                    return (
                      <div key={sub.name}
                        className={`group relative rounded-2xl border-2 bg-white overflow-hidden transition-all duration-300 ${
                          isAvail ? "border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : "border-gray-100 opacity-60 cursor-default"
                        }`}>
                        <div className={`h-[3px] bg-gradient-to-r ${semGrad}`} />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2.5">
                            <div className="text-xl shrink-0">{typeof sub.icon === "string" ? sub.icon : "📚"}</div>
                            {isAvail ? (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 uppercase tracking-wide">Available</span>
                            ) : (
                              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-400 uppercase tracking-wide">Soon</span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug mb-1.5 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {sub.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{sub.description}</p>
                          {isAvail ? (
                            <Link href={href}
                              className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r ${semGrad} text-white text-xs font-extrabold shadow-sm hover:-translate-y-0.5 transition-all`}>
                              <Trophy className="w-3.5 h-3.5" /> Start Quiz
                            </Link>
                          ) : (
                            <div className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-extrabold">
                              <ClipboardList className="w-3.5 h-3.5" /> Coming Soon
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No subjects found</p>
            <button onClick={() => { setSearch(""); setActiveSem("All"); }}
              className="mt-4 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition">Clear filters</button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className={`mt-12 sm:mt-16 relative rounded-2xl bg-gradient-to-r ${GRAD} overflow-hidden p-5 sm:p-8`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Want to study first?</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">Review course notes before tackling the MCQs.</p>
            </div>
            <Link href="/courses"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
              <BookOpen className="w-4 h-4" /> Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}