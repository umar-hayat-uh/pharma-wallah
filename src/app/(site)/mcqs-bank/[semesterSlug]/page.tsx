"use client";
// src/app/(site)/mcqs-bank/[semesterSlug]/page.tsx

import Link from "next/link";
import {
  ChevronRight, ChevronLeft, BookOpen, Trophy, ClipboardList,
  GraduationCap, Zap, Layers,
  Microscope, FlaskConical, Beaker, Stethoscope, Leaf, Pill,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";

interface PageProps { params: { semesterSlug: string } }

const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const AVAILABLE_SLUGS = new Set([
  "pharmaceutical-biochemistry",
]);

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

export default function MCQBankSemesterPage({ params }: PageProps) {
  const { semesterSlug } = params;

  const semIdx = SemesterData.findIndex(s => semesterToSlug(s.semester) === semesterSlug);
  const sem    = SemesterData[semIdx];

  if (!sem) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-extrabold text-gray-900 mb-2">Semester not found</p>
        <Link href="/mcqs-bank" className="text-blue-600 text-sm font-semibold hover:underline">← Back to MCQ Bank</Link>
      </div>
    </div>
  );

  const semGrad    = SEM_GRADS[semIdx % SEM_GRADS.length];
  const prevSem    = semIdx > 0                       ? SemesterData[semIdx - 1] : null;
  const nextSem    = semIdx < SemesterData.length - 1 ? SemesterData[semIdx + 1] : null;
  const availCount = sem.subjects.filter(s => AVAILABLE_SLUGS.has(subjectToSlug(s.name))).length;

  return (
    <section className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* HERO */}
      <div className={`relative bg-gradient-to-r ${semGrad} overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-6 opacity-[0.08] pointer-events-none hidden sm:block">
          <GraduationCap size={120} className="text-white" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/mcqs-bank" className="hover:text-white transition flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5" /> MCQ Bank
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{sem.semester}</span>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> {sem.semester} · MCQ Practice
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight">
            {sem.semester}
            <span className="block text-white/70 text-2xl sm:text-3xl mt-1">MCQ Practice</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mb-8">
            {sem.subjects.length} subjects · {availCount} available now · Select a subject to begin your practice session.
          </p>
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: String(sem.subjects.length), l: "Subjects"      },
              { n: String(availCount),           l: "Available"     },
              { n: String(sem.subjects.length - availCount), l: "Coming Soon" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                <div className="text-xs text-white/70 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {sem.subjects.map((sub, i) => {
            const subSlug = subjectToSlug(sub.name);
            const isAvail = AVAILABLE_SLUGS.has(subSlug);
            const href    = `/mcqs-bank/${semesterSlug}/${subSlug}`;
            return (
              <div key={sub.name}
                className={`group relative rounded-2xl border-2 bg-white overflow-hidden transition-all duration-300 ${
                  isAvail ? "border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5" : "border-gray-100 opacity-60"
                }`}>
                <div className={`h-[3px] bg-gradient-to-r ${semGrad}`} />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl shrink-0">{typeof sub.icon === "string" ? sub.icon : "📚"}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">#{i + 1}</span>
                      {isAvail ? (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 uppercase">Available</span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 uppercase">Soon</span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{sub.description}</p>
                  {isAvail ? (
                    <Link href={href}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${semGrad} text-white text-xs font-extrabold shadow-sm hover:-translate-y-0.5 transition-all`}>
                      <Trophy className="w-3.5 h-3.5" /> Start Quiz
                    </Link>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-extrabold">
                      <ClipboardList className="w-3.5 h-3.5" /> Questions Coming Soon
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Semester nav */}
        <div className="grid grid-cols-2 gap-3 mt-8 sm:mt-10">
          {prevSem ? (
            <Link href={`/mcqs-bank/${semesterToSlug(prevSem.semester)}`}
              className="group relative flex items-center gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${SEM_GRADS[(semIdx - 1) % SEM_GRADS.length]}`} />
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <ChevronLeft size={15} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Previous</p>
                <p className="text-xs font-extrabold text-gray-900 truncate">{prevSem.semester}</p>
              </div>
            </Link>
          ) : <div />}
          {nextSem ? (
            <Link href={`/mcqs-bank/${semesterToSlug(nextSem.semester)}`}
              className="group relative flex items-center justify-end gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden text-right">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${SEM_GRADS[(semIdx + 1) % SEM_GRADS.length]}`} />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                <p className="text-xs font-extrabold text-gray-900 truncate">{nextSem.semester}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <ChevronRight size={15} className="text-gray-500" />
              </div>
            </Link>
          ) : <div />}
        </div>

        {/* Back link */}
        <div className="mt-6 flex justify-center">
          <Link href="/mcqs-bank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all">
            <Layers className="w-4 h-4" /> All Semesters
          </Link>
        </div>
      </div>
    </section>
  );
}