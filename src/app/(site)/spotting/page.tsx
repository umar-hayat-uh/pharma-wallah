"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Microscope, FlaskConical, Leaf, Beaker, Stethoscope, Pill,
  BookOpen, Trophy, ChevronRight, Zap, Layers,
  GraduationCap, Target, BarChart3, Star, Clock, ArrowRight, Users,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const CATEGORIES = [
  {
    id: "histology",
    title: "Histology",
    subtitle: "Microscopic tissue architecture",
    description: "Study normal and abnormal tissue sections stained with H&E and special stains. Identify cell types, tissue architecture, and morphological clues seen under light microscopy.",
    Icon: Microscope,
    gradient: "from-blue-600 to-green-400",
    lightBg: "from-blue-50/80 to-green-50/60",
    diffColor: "bg-blue-50 text-blue-700 border-blue-200",
    lessonCount: 8,
    topics: ["Epithelium", "Connective Tissue", "Bone & Muscle", "Glandular Tissue"],
    lessonPath: "/spotting/histology/lessons",
    testPath: "/spotting/histology/test",
    accentBg: "bg-blue-50",
    accentText: "text-blue-600",
  },
  {
    id: "pathology",
    title: "Pathology",
    subtitle: "Disease processes & lesion recognition",
    description: "Examine gross and microscopic features of diseased tissues. Recognise benign and malignant tumours, inflammatory conditions, and organ-specific pathological changes.",
    Icon: FlaskConical,
    // ▼▼▼ UPDATED COLOR SCHEME (H&E: purple/blue + pink/red) ▼▼▼
    gradient: "from-indigo-600 to-pink-500",
    lightBg: "from-indigo-50/80 to-pink-50/60",
    diffColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    lessonCount: 8,
    topics: ["Benign Tumours", "Malignant Neoplasms", "Inflammation", "Cell Injury"],
    lessonPath: "/spotting/pathology/lessons ",
    testPath: "/spotting/pathology/test",
    accentBg: "bg-indigo-50",
    accentText: "text-indigo-600",
  },
  {
    id: "powder-microscopy",
    title: "Powder Microscopy",
    subtitle: "Pharmacognostic powder analysis",
    description: "Identify crude drug powders using characteristic diagnostic elements — trichomes, calcium oxalate crystals, starch grains, fibres, tracheids, and other microscopic markers.",
    Icon: Leaf,
    gradient: "from-emerald-600 to-cyan-400",
    lightBg: "from-emerald-50/80 to-cyan-50/60",
    diffColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    lessonCount: 8,
    topics: ["Trichomes", "Starch Grains", "Crystals", "Fibres & Tracheids"],
    lessonPath: "/spotting/powder-microscopy/lessons",
    testPath: "/spotting/powder-microscopy/test",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-600",
  },
];

const STATS = [
  { n: "24+",  l: "Total Lessons",  Icon: BookOpen   },
  { n: "3",    l: "Categories",     Icon: Layers     },
  { n: "3",    l: "Practice Tests", Icon: Trophy     },
  { n: "100%", l: "Free to Use",    Icon: Star       },
];

const STEPS = [
  { Icon: GraduationCap, label: "Pick a category",  num: "01" },
  { Icon: BookOpen,      label: "Study the lessons", num: "02" },
  { Icon: Target,        label: "Take the test",     num: "03" },
  { Icon: BarChart3,     label: "See your score",    num: "04" },
];

export default function SpottingHubPage() {
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-24 bottom-6 opacity-[0.12] pointer-events-none"><Microscope size={90} className="text-white" /></div>
        <div className="absolute right-60 top-8   opacity-[0.12] pointer-events-none"><Leaf       size={55} className="text-white" /></div>
        <div className="absolute left-1/3 top-4   opacity-[0.07] pointer-events-none"><FlaskConical size={45} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" /> Spotting Practice Centre
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Slide Spotting<br />
            <span className="text-green-200">Centre</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Master microscopic identification across <span className="text-white font-bold">Histology</span>,{" "}
            <span className="text-white font-bold">Pathology</span>, and{" "}
            <span className="text-white font-bold">Powder Microscopy</span>. Study annotated lessons, then prove your knowledge with shuffled competitive spot tests.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6">
            {STATS.map(({ n, l, Icon: IcIcon }) => (
              <div key={l} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <IcIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white leading-none">{n}</div>
                  <div className="text-xs text-blue-200 mt-0.5">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works strip ── */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-1 justify-center md:justify-start">
            {STEPS.map(({ Icon: StIcon, label, num }, i) => (
              <div key={label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300 hidden md:block" />}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                    <StIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider leading-none">{num}</div>
                    <div className="text-xs font-bold text-gray-700 leading-tight">{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category cards ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14">

        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Choose a Category</h2>
            <p className="text-sm text-gray-400 mt-0.5">Each category has dedicated annotated lessons and a competitive spot test</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, ci) => (
            <motion.div key={cat.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.12, duration: 0.4 }}
              className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

              {/* Top stripe */}
              <div className={`h-1 w-full bg-gradient-to-r ${cat.gradient}`} />

              {/* Coloured header section */}
              <div className={`relative bg-gradient-to-br ${cat.lightBg} px-6 pt-6 pb-8 overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/60 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/50 pointer-events-none" />

                <div className="relative z-10">
                  {/* Difficulty + icon row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                      <cat.Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">{cat.title}</h3>
                  <p className="text-sm text-gray-500 font-semibold mt-0.5 mb-4">{cat.subtitle}</p>

                  {/* Mini stats */}
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${cat.accentText}`}>
                      <BookOpen className="w-3.5 h-3.5" /> {cat.lessonCount} lessons
                    </div>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> ~20 min test
                    </div>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-5 flex flex-col flex-1">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{cat.description}</p>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {cat.topics.map(t => (
                    <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-600">
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  {[
                    { href: cat.lessonPath, IcBtn: BookOpen, label: "Study Lessons", sub: "Annotated slides + notes" },
                    { href: cat.testPath,   IcBtn: Trophy,   label: "Take Test",     sub: "Shuffled MCQ + scoring"  },
                  ].map(({ href, IcBtn, label, sub }) => (
                    <Link key={href} href={href}
                      className="group relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all duration-250 overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cat.gradient}`} />
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                        <IcBtn className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">{label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{sub}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600">
                        Open <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-14 relative rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden p-8">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute right-40 top-4 opacity-[0.12] pointer-events-none"><Microscope size={60} className="text-white" /></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <p className="text-white font-extrabold text-lg">New to slide spotting?</p>
              </div>
              <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                Start with <span className="font-bold text-white">Histology Lessons</span> — they build the tissue-identification fundamentals that underpin all microscopy categories.
              </p>
            </div>
            <div className="flex gap-3 shrink-0 flex-wrap justify-center">
              <Link href="/spotting/histology/test"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
                <Trophy className="w-4 h-4" /> Take Test
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}