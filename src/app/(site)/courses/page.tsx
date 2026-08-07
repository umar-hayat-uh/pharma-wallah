"use client";

// src/app/(site)/courses/page.tsx
// Modernized E-Learning Courses Catalog — With Framer Motion & Auto Scroll-To-Top

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Search,
    X,
    GraduationCap,
    BookOpen,
    Trophy,
    ArrowRight,
    Filter,
    Pill,
    FlaskConical,
    Stethoscope,
    Microscope,
    Beaker,
    Leaf,
    Dna,
} from "lucide-react";
import { getSemesters, SUBJECTS } from "@/lib/courses/registry";

const BG_ICONS = [
    { Icon: Pill, top: "8%", left: "1.5%", size: 28, delay: 0 },
    { Icon: Beaker, top: "38%", left: "1%", size: 26, delay: 1.0 },
    { Icon: Stethoscope, top: "70%", left: "1.5%", size: 28, delay: 1.4 },
    { Icon: Microscope, top: "8%", left: "96.5%", size: 28, delay: 0.4 },
    { Icon: FlaskConical, top: "38%", left: "97%", size: 26, delay: 0.8 },
    { Icon: Leaf, top: "70%", left: "96.5%", size: 26, delay: 0.6 },
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

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function CoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSemFilter, setActiveSemFilter] = useState<string>("All");
    const semesters = useMemo(() => getSemesters(), []);

    const scrollToTop = useCallback(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const semOptions = useMemo(
        () => ["All", ...semesters.map((s) => s.semester)],
        [semesters]
    );

    const filteredSemesters = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return semesters
            .filter(
                (sem) => activeSemFilter === "All" || sem.semester === activeSemFilter
            )
            .map((sem) => ({
                ...sem,
                subjects: sem.subjects.filter(
                    (s) =>
                        !q ||
                        s.title.toLowerCase().includes(q) ||
                        s.description.toLowerCase().includes(q)
                ),
            }))
            .filter((sem) => sem.subjects.length > 0);
    }, [searchQuery, activeSemFilter, semesters]);

    const totalSubjects = SUBJECTS.length;

    const handleFilterClick = useCallback(
        (filter: string) => {
            setActiveSemFilter(filter);
            scrollToTop();
        },
        [scrollToTop]
    );

    const handleClearSearch = useCallback(() => {
        setSearchQuery("");
        setActiveSemFilter("All");
        scrollToTop();
    }, [scrollToTop]);

    return (
        <section className="min-h-screen bg-gray-50/80 relative overflow-x-hidden">
            {/* Animated Background Decorative Icons */}
            {BG_ICONS.map(({ Icon, top, left, size, delay }, i) => (
                <motion.div
                    key={i}
                    className="fixed pointer-events-none text-blue-100/50 z-0 hidden md:block"
                    style={{ top, left }}
                    animate={{ y: [0, -10, 0], opacity: [0.25, 0.45, 0.25] }}
                    transition={{
                        duration: 6,
                        delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    aria-hidden="true"
                >
                    <Icon size={size} strokeWidth={1.4} />
                </motion.div>
            ))}

            {/* ══ HERO HEADER ══ */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 overflow-hidden shadow-xl">
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 left-20 w-60 h-60 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute right-12 bottom-6 opacity-[0.08] pointer-events-none hidden lg:block">
                    <Dna size={180} className="text-white" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest mb-4 backdrop-blur-sm shadow-sm"
                    >
                        <GraduationCap className="w-3.5 h-3.5 text-yellow-300" /> Pharm-D
                        E-Learning Notes
                    </motion.span>

                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.06 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-3"
                    >
                        Structured Study Materials
                        <span className="block text-cyan-200 text-2xl sm:text-4xl md:text-5xl font-extrabold mt-1">
                            Semester & Unit Wise Guides
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.12 }}
                        className="text-white/85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
                    >
                        Comprehensive lecture handouts, clinical notes, and unit modules —
                        structured for sessionals, board finals, and pharmacy licensure
                        preparation.
                    </motion.p>

                    {/* Search Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.18 }}
                        className="relative max-w-xl mx-auto"
                    >
                        <div className="relative flex items-center bg-white rounded-3xl border-2 border-white/40 shadow-xl overflow-hidden p-1">
                            <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search subject (Biochemistry, Pharmacology)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-12 py-3 sm:py-3.5 text-sm text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none bg-transparent"
                                aria-label="Search courses"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        key="clear-search"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={handleClearSearch}
                                        className="absolute right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                                        aria-label="Clear search"
                                        type="button"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Hero Quick Metrics */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.24 }}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto mt-8"
                    >
                        {[
                            { n: `${semesters.length} Semesters`, l: "Complete Curriculum" },
                            { n: `${totalSubjects}+ Modules`, l: "High-Yield Subjects" },
                            { n: "HEC & Pharmacy", l: "Standardized Syllabus" },
                        ].map(({ n, l }) => (
                            <div
                                key={l}
                                className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2.5 rounded-2xl text-center"
                            >
                                <span className="text-sm sm:text-base font-black text-white block">
                                    {n}
                                </span>
                                <span className="text-[11px] text-white/80 font-bold block">
                                    {l}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ══ CONTENT BODY ══ */}
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Semester Filter Pills */}
                <div
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-gray-100 shadow-sm mb-8 flex items-center gap-2 overflow-x-auto scrollbar-none"
                    role="tablist"
                    aria-label="Filter by semester"
                >
                    <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1 hidden sm:block" />
                    {semOptions.map((s) => (
                        <button
                            key={s}
                            role="tab"
                            aria-selected={activeSemFilter === s}
                            onClick={() => handleFilterClick(s)}
                            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${activeSemFilter === s
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            type="button"
                        >
                            {s === "All" ? "All Semesters" : s.replace("Semester ", "Sem ")}
                        </button>
                    ))}
                </div>

                {/* Empty State */}
                <AnimatePresence>
                    {filteredSemesters.length === 0 && searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 bg-white rounded-3xl border-2 border-gray-100 shadow-sm max-w-md mx-auto"
                        >
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-900 font-extrabold text-lg">
                                No course modules found
                            </p>
                            <p className="text-gray-500 text-xs mt-1 mb-6">
                                No matching subjects for &quot;{searchQuery}&quot;. Try another
                                search term.
                            </p>
                            <button
                                onClick={handleClearSearch}
                                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition"
                                type="button"
                            >
                                Clear Search & Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Semester Modules */}
                {filteredSemesters.map(({ semester, semesterSlug, subjects }, idx) => {
                    const semGrad = SEM_GRADS[idx % SEM_GRADS.length];

                    return (
                        <motion.div
                            key={semesterSlug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            id={semesterSlug}
                            className="mb-10 sm:mb-14 scroll-mt-24"
                        >
                            {/* Semester Header */}
                            <div className="flex items-center justify-between gap-3 mb-5 border-b border-gray-200 pb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${semGrad} flex items-center justify-center shrink-0 shadow-md text-white font-black`}
                                    >
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-none">
                                            {semester}
                                        </h2>
                                        <p className="text-xs font-bold text-gray-400 mt-1">
                                            {subjects.length} Subject Module
                                            {subjects.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href={`/mcqs-bank/${semesterSlug}`}
                                    onClick={scrollToTop}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold hover:bg-indigo-100 transition-all shrink-0"
                                >
                                    <Trophy className="w-3.5 h-3.5 text-indigo-600" /> MCQ
                                    Practice <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Subject Cards Grid */}
                            <motion.div
                                variants={stagger}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            >
                                {subjects.map((subj) => {
                                    const href = `/courses/${subj.slug}`;

                                    return (
                                        <motion.div key={subj.slug} variants={fadeUp}>
                                            <Link
                                                href={href}
                                                onClick={scrollToTop}
                                                className="group block h-full"
                                            >
                                                <div className="relative h-full rounded-3xl border-2 border-gray-100 bg-white p-5 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 bg-gradient-to-r ${semGrad} rounded-t-3xl`}
                                                    />

                                                    <div className="pt-2">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 text-2xl group-hover:scale-105 transition-transform">
                                                            {subj.icon}
                                                        </div>

                                                        <h3 className="text-base font-black text-gray-900 mb-1.5 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {subj.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                                                            {subj.description}
                                                        </p>
                                                    </div>

                                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                                        <span className="text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                            View Course Notes{" "}
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </span>
                                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500">
                                                            {subj.units?.length ?? 5} Units
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}