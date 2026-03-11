"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microscope, FlaskConical, Leaf, Beaker, Stethoscope, Pill,
  BookOpen, ChevronRight, ChevronLeft, Search, X,
  Clock, Tag, Zap, Layers, GraduationCap, ArrowRight,
} from "lucide-react";
import { BiochemUnits, SUBJECT_META, DIFF_BADGE } from "@/app/api/biochemistry-data";

// ─── Fixed BG icons ───────────────────────────────────────────────────────────
const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

// ─── Hero gradient ────────────────────────────────────────────────────────────
const HERO_GRAD = "from-blue-600 to-green-400";
const BASE_PATH = `/courses/${SUBJECT_META.semesterSlug}/${SUBJECT_META.slug}`;

export default function BiochemUnitsPage() {
  const [search, setSearch] = useState("");
  const [activeDiff, setActiveDiff] = useState("All");

  const diffs = ["All", "Easy", "Medium", "Hard"];

  const filtered = useMemo(() =>
    BiochemUnits.filter(u =>
      (activeDiff === "All" || u.difficulty === activeDiff) &&
      u.title.toLowerCase().includes(search.toLowerCase())
    ),
    [search, activeDiff]
  );

  const easyCount = BiochemUnits.filter(u => u.difficulty === "Easy").length;
  const mediumCount = BiochemUnits.filter(u => u.difficulty === "Medium").length;
  const hardCount = BiochemUnits.filter(u => u.difficulty === "Hard").length;

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════ HERO */}
      <div className={`relative bg-gradient-to-r ${HERO_GRAD} overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-16 sm:right-24 bottom-6 opacity-[0.12] pointer-events-none">
          <FlaskConical size={90} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/courses" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/courses/${SUBJECT_META.semesterSlug}`} className="hover:text-white transition">
              {SUBJECT_META.semester}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Pharmaceutical Biochemistry</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> {SUBJECT_META.semester} · {SUBJECT_META.subjectCode}
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">
            Pharmaceutical
            <span className="block text-green-200 mt-1">Biochemistry</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg font-semibold mb-3">
            {SUBJECT_META.description}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href={`${BASE_PATH}/${BiochemUnits[0].id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <BookOpen className="w-4 h-4" /> Start Unit 1
            </Link>
            <Link href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
              <ChevronLeft className="w-4 h-4" /> All Courses
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: String(BiochemUnits.length), l: "Units" },
              { n: String(easyCount), l: "Easy" },
              { n: String(mediumCount), l: "Medium" },
              { n: String(hardCount), l: "Hard" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                <div className="text-xs text-white/70 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search units…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
            {diffs.map(d => (
              <button key={d} onClick={() => setActiveDiff(d)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200 ${activeDiff === d
                    ? `bg-gradient-to-r ${HERO_GRAD} text-white shadow-md`
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
            {filtered.length} unit{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Unit grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((unit, i) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`${BASE_PATH}/${unit.id}`}
                    className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
                  >
                    {/* top accent stripe */}
                    <div className={`h-[3px] bg-gradient-to-r ${unit.gradient}`} />

                    {/* Preview image thumbnail */}
                    {unit.previewImage && (
                      <div className="w-full h-36 bg-gray-100 overflow-hidden">
                        <img
                          src={unit.previewImage}
                          alt={unit.shortTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}

                    {/* card body */}
                    <div className="flex flex-col flex-1 p-5">
                      {/* icon + unit number + difficulty */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl ${unit.color.icon} border flex items-center justify-center text-2xl shrink-0
                          group-hover:bg-gradient-to-br group-hover:${unit.gradient} transition-all duration-300`}>
                          {unit.emoji}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_BADGE[unit.difficulty]}`}>
                          {unit.difficulty}
                        </span>
                      </div>

                      {/* unit number badge */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag className={`w-3 h-3 shrink-0 ${unit.color.iconText}`} />
                        <span className={`text-[10px] font-extrabold uppercase tracking-wide ${unit.color.iconText}`}>
                          Unit {i + 1} of {BiochemUnits.length}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                        {unit.shortTitle}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                        {unit.description}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                          <Clock className="w-3 h-3" /> {unit.readTime} min
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600">
                          Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">No units match your search</p>
              <button
                onClick={() => { setSearch(""); setActiveDiff("All"); }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        <div className={`mt-12 sm:mt-16 relative rounded-2xl bg-gradient-to-r ${HERO_GRAD} overflow-hidden p-6 sm:p-8`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Ready to dive in?</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">
                Start with <span className="font-bold text-white">Unit 1</span> and work through all 6 units at your own pace.
              </p>
            </div>
            <Link href={`${BASE_PATH}/${BiochemUnits[0].id}`}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-600 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shrink-0">
              <BookOpen className="w-4 h-4" /> Begin Unit 1 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}