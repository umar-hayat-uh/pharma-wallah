"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, X, GraduationCap, BookOpen } from "lucide-react";
import {
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf,
  Dna, Activity,
} from "lucide-react";
import { SemesterData } from "@/app/api/semester-data";

const bgIcons = [
  { Icon: Pill,        top: "8%",  left: "1.5%",  size: 30, delay: 0   },
  { Icon: Beaker,      top: "38%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "70%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "8%",  left: "96.5%", size: 30, delay: 0.4 },
  { Icon: FlaskConical,top: "38%", left: "97%",   size: 28, delay: 0.8 },
  { Icon: Leaf,        top: "70%", left: "96.5%", size: 28, delay: 0.6 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } } };

export default function MaterialPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSemesters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SemesterData;
    return SemesterData
      .map(sem => ({ ...sem, subjects: sem.subjects.filter(s => s.name.toLowerCase().includes(q)) }))
      .filter(sem => sem.subjects.length > 0);
  }, [searchQuery]);

  const totalSubjects = SemesterData.reduce((a, s) => a + s.subjects.length, 0);

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* Symmetric floating bg icons */}
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div key={i} className="fixed pointer-events-none text-blue-200 z-0"
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4   opacity-15"><Dna      size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6      opacity-15"><Activity size={40} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <GraduationCap className="w-3.5 h-3.5" /> Pharm-D Study Resources
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Study Material
            <span className="block text-green-200 mt-1">Semester Wise</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Semester-organised lecture notes, handouts and subject guides — structured to help you ace sessionals, finals, vivas, and competitive exams.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-lg mx-auto">
            <div className="absolute -inset-0.5 rounded-2xl bg-white/20 blur-sm" />
            <div className="relative flex items-center bg-white rounded-2xl border border-white/30 shadow-sm overflow-hidden">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search subjects..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent" />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.28 }}
            className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {[
              { n: `${SemesterData.length}`, l: "Semesters" },
              { n: `${totalSubjects}+`,      l: "Subjects"  },
              { n: "UOK & HEC",                    l: "Aligned"   },
            ].map(({ n, l }) => (
              <div key={l} className="flex items-center gap-2 text-white/80">
                <span className="text-2xl font-extrabold text-white">{n}</span>
                <span className="text-sm">{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* No results */}
        <AnimatePresence>
          {filteredSemesters.length === 0 && searchQuery && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No subjects found for <span className="font-semibold text-gray-600">"{searchQuery}"</span>
              </p>
              <button onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition">
                Clear search
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Semester sections */}
        {filteredSemesters.map(({ semester, subjects }) => (
          <motion.div key={semester}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4 }}
            id={semester.replace(/\s+/g, "-").toLowerCase()} className="mb-16 scroll-mt-24">

            {/* Semester heading */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{semester}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
                {subjects.length} subjects
              </span>
            </div>

            {/* Subject cards */}
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {subjects.map(subj => {
                const href = `/material/${subj.name.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <motion.div key={subj.name} variants={fadeUp}>
                    <Link href={href} className="group block h-full">
                      <motion.div
                        whileHover={{ y: -6, boxShadow: "0 16px 36px rgba(37,99,235,0.10)" }}
                        transition={{ type: "spring", stiffness: 260 }}
                        className="relative h-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 transition-all duration-300 overflow-hidden">
                        {/* Top stripe */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                        {/* Hover tint */}
                        <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />

                        {/* Icon box */}
                        <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-2xl
                          group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 transition-all duration-300">
                          {subj.icon}
                        </div>

                        <h3 className="relative z-10 text-sm font-extrabold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {subj.name}
                        </h3>
                        <p className="relative z-10 text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">
                          {subj.description}
                        </p>

                        <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[11px] font-semibold text-blue-600">View Material</span>
                          <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-sm">→</span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}