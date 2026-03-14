"use client";
// app/spotting/histology/lessons/page.tsx — Upgraded Hub

import Link from "next/link";
import {
  Microscope, ChevronRight, BookOpen, Play,
  Layers, ArrowRight, Zap, Clock, CheckCircle,
  Video, GraduationCap, FlaskConical, Beaker,
  Stethoscope, Leaf, Pill,
} from "lucide-react";

const GRAD = "from-blue-600 to-green-400";

const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const LESSONS = [
  {
    id: "lungs",
    title: "Lungs",
    category: "Respiratory System",
    emoji: "🫁",
    gradient: "from-blue-600 to-green-400",
    points: ["Recognizable alveolar structure", "Visible bronchial passage", "Distinct lung lobes", "Pulmonary blood vessels"],
    readTime: 15,
    hasVideo: false,
    accentBg: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
  },
  {
    id: "stomach",
    title: "Stomach",
    category: "Digestive System",
    emoji: "🫀",
    gradient: "from-orange-500 to-amber-400",
    points: ["Gastric pits", "Gastric glands", "Mucosal lining", "Rugae (folds)"],
    readTime: 14,
    hasVideo: false,
    accentBg: "bg-orange-50",
    accentText: "text-orange-700",
    accentBorder: "border-orange-200",
  },
  {
    id: "kidney",
    title: "Kidney",
    category: "Urinary System",
    emoji: "🫘",
    gradient: "from-violet-600 to-indigo-400",
    points: ["Renal tubules", "Glomeruli", "Renal corpuscles", "Renal blood vessels"],
    readTime: 16,
    hasVideo: false,
    accentBg: "bg-violet-50",
    accentText: "text-violet-700",
    accentBorder: "border-violet-200",
  },
  {
    id: "small-intestine",
    title: "Small Intestine",
    category: "Digestive System",
    emoji: "🌀",
    gradient: "from-teal-600 to-cyan-400",
    points: ["Villi on mucosal surface", "Crypts of Lieberkühn", "Intestinal glands", "Peyer's patches"],
    readTime: 14,
    hasVideo: false,
    accentBg: "bg-teal-50",
    accentText: "text-teal-700",
    accentBorder: "border-teal-200",
  },
  {
    id: "large-intestine",
    title: "Large Intestine",
    category: "Digestive System",
    emoji: "🧫",
    gradient: "from-emerald-600 to-green-400",
    points: ["Numerous goblet cells", "Taeniae coli", "Lymphoid tissue in mucosa", "Haustra"],
    readTime: 12,
    hasVideo: false,
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
  },
  {
    id: "appendix",
    title: "Appendix",
    category: "Lymphoid / GI",
    emoji: "🌿",
    gradient: "from-lime-600 to-emerald-400",
    points: ["Abundant lymphoid tissue", "Mucosal folds", "Epithelial lining", "Submucosal lymphoid follicles"],
    readTime: 11,
    hasVideo: false,
    accentBg: "bg-lime-50",
    accentText: "text-lime-700",
    accentBorder: "border-lime-200",
  },
  {
    id: "smooth-muscle",
    title: "Smooth Muscle",
    category: "Muscle Tissue",
    emoji: "〰️",
    gradient: "from-sky-600 to-blue-400",
    points: ["Spindle-shaped cells", "Central nuclei", "Dense bodies / plaques", "Surrounding capillaries"],
    readTime: 12,
    hasVideo: false,
    accentBg: "bg-sky-50",
    accentText: "text-sky-700",
    accentBorder: "border-sky-200",
  },
  {
    id: "skeletal-muscle",
    title: "Skeletal Muscle",
    category: "Muscle Tissue",
    emoji: "💪",
    gradient: "from-amber-600 to-orange-400",
    points: ["Cross striations", "Multinucleated fibres", "Peripheral nuclei", "Alternating I and A bands"],
    readTime: 13,
    hasVideo: false,
    accentBg: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
  },
  {
    id: "rbcs",
    title: "Red Blood Cells",
    category: "Blood / Haematology",
    emoji: "🩸",
    gradient: "from-red-600 to-rose-400",
    points: ["Biconcave disc shape", "Red colour (haemoglobin)", "Flexible / deformable", "~7–8 µm diameter"],
    readTime: 13,
    hasVideo: false,
    accentBg: "bg-red-50",
    accentText: "text-red-700",
    accentBorder: "border-red-200",
  },
  {
    id: "stratified-squamous-epithelium",
    title: "Stratified Squamous Epithelium",
    category: "Epithelial Tissue",
    emoji: "🧱",
    gradient: "from-fuchsia-600 to-violet-400",
    points: ["Multiple cell layers", "Flattened surface cells", "Basal cuboidal cells", "Nuclei at various levels"],
    readTime: 14,
    hasVideo: false,
    accentBg: "bg-fuchsia-50",
    accentText: "text-fuchsia-700",
    accentBorder: "border-fuchsia-200",
  },
];

const BASE = "/spotting/histology/lessons";

export default function HistologyLessonsHub() {
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* BG icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden md:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO ══ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-10 bottom-6 opacity-[0.10] pointer-events-none hidden sm:block">
          <Microscope size={110} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/spotting" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Spotting Centre
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Histology Lessons</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Histology · 10 Lessons · Video Lessons Included
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">
            Histology
            <span className="block text-green-200 mt-1">Lesson Library</span>
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl mb-8">
            Detailed theory, points of identification, video lessons, and exam-ready notes for all 10 histology spotting slides — from organs of the GI tract and urinary system to muscle types, blood, and epithelium.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href={`${BASE}/lungs`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <BookOpen className="w-4 h-4" /> Start Lesson 1
            </Link>
            <Link href="/spotting/histology/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
              <Microscope className="w-4 h-4" /> Take Spotting Test
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: "10", l: "Lessons" },
              { n: "40", l: "ID Points" },
              { n: "Video", l: "Lessons" },
              { n: "Free", l: "Access" },
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

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Detailed Theory" },
            { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "Points of Identification" },
            { icon: <Video className="w-3.5 h-3.5" />, text: "Video Lessons" },
            { icon: <GraduationCap className="w-3.5 h-3.5" />, text: "Referenced Notes" },
          ].map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              {icon} {text}
            </span>
          ))}
        </div>

        {/* Lesson grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {LESSONS.map((lesson, idx) => (
            <Link
              key={lesson.id}
              href={`${BASE}/${lesson.id}`}
              className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
            >
              <div className={`h-[3px] bg-gradient-to-r ${lesson.gradient}`} />
              <div className="flex flex-col flex-1 p-4 sm:p-5">

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${lesson.accentBg} border ${lesson.accentBorder} flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    {lesson.emoji}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {lesson.hasVideo && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600">
                        <Play className="w-2.5 h-2.5" fill="currentColor" /> Video
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <span className={`text-[10px] font-extrabold uppercase tracking-wide ${lesson.accentText} mb-1.5`}>
                  {lesson.category}
                </span>

                {/* Title */}
                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                  {lesson.title}
                </h3>

                {/* ID Points preview */}
                <div className="space-y-1.5 flex-1 mb-3">
                  {lesson.points.slice(0, 3).map((point, pi) => (
                    <div key={pi} className="flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-md bg-gradient-to-br ${lesson.gradient} flex items-center justify-center text-white text-[8px] font-extrabold shrink-0 mt-0.5`}>
                        {pi + 1}
                      </span>
                      <span className="text-[11px] text-gray-600 leading-snug">{point}</span>
                    </div>
                  ))}
                  {lesson.points.length > 3 && (
                    <p className={`text-[10px] font-semibold ${lesson.accentText} pl-6`}>
                      +{lesson.points.length - 3} more points
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3" /> {lesson.readTime} min
                    </div>
                    {lesson.hasVideo && (
                      <div className="flex items-center gap-1 text-[11px] text-red-500 font-semibold">
                        <Video className="w-3 h-3" /> Video
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-extrabold ${lesson.accentText}`}>
                    Study <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA — Take Test */}
        <div className={`mt-12 sm:mt-16 relative rounded-2xl bg-gradient-to-r ${GRAD} overflow-hidden p-5 sm:p-8`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Microscope className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Ready to test yourself?</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">
                Put your identification skills to the test in the <span className="font-bold text-white">Histology Spotting Test</span> — 10 slides, 20 minutes, MCQ + recognition points.
              </p>
            </div>
            <Link href="/spotting/histology/test"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shrink-0">
              <Microscope className="w-4 h-4" /> Take the Test <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Sequential lesson path */}
        <div className="mt-8 relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Lesson Path</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {LESSONS.map((l, i) => (
                <Link key={l.id} href={`${BASE}/${l.id}`}
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-semibold text-gray-700 hover:text-blue-700">
                  <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white text-[9px] font-extrabold shrink-0">
                    {i + 1}
                  </span>
                  {l.emoji} {l.title}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}