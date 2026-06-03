"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  BookOpen,
  FileText,
  Database,
  Calculator,
  Bot,
  ArrowRight,
  GraduationCap,
  Brain,
  Library,
  Scan,
  Layers,
  FlaskConical,
  Microscope,
  Pill,
  Beaker,
  Stethoscope,
  Leaf,
  Dna,
} from "lucide-react";

/* ─── Floating Background Icons ────────────────────────────────────────── */
const floatingIcons = [
  { Icon: Pill, top: "6%", left: "2%", size: 44, color: "text-blue-400/25", rotate: 12 },
  { Icon: Beaker, top: "25%", left: "1%", size: 36, color: "text-green-400/25", rotate: -8 },
  { Icon: Stethoscope, top: "55%", left: "1.5%", size: 40, color: "text-blue-500/20", rotate: 15 },
  { Icon: Leaf, top: "78%", left: "2%", size: 34, color: "text-green-400/25", rotate: -12 },
  { Icon: Microscope, top: "8%", left: "95%", size: 42, color: "text-blue-400/25", rotate: -10 },
  { Icon: FlaskConical, top: "35%", left: "96%", size: 38, color: "text-green-400/25", rotate: 8 },
  { Icon: Dna, top: "60%", left: "95%", size: 32, color: "text-blue-500/20", rotate: -15 },
  { Icon: Pill, top: "82%", left: "96%", size: 30, color: "text-green-400/25", rotate: 6 },
  { Icon: BookOpen, top: "15%", left: "48%", size: 28, color: "text-blue-300/20", rotate: 20 },
  { Icon: Brain, top: "70%", left: "50%", size: 30, color: "text-green-300/20", rotate: -5 },
];

/* ─── Ticker Data ───────────────────────────────────────────────────────── */
const tickerItems = [
  { value: "10,000+", label: "MCQ Questions" },
  { value: "2,000+", label: "Drug Entries" },
  { value: "500+", label: "Study Resources" },
  { value: "1,200+", label: "Flashcards" },
  { value: "150+", label: "Textbook Titles" },
  { value: "300+", label: "Lab Specimens" },
  { value: "80+", label: "Calc Tools" },
  { value: "24/7", label: "AI Guide" },
];

/* ─── Feature Data ──────────────────────────────────────────────────────── */
const groups = [
  {
    key: "learning",
    label: "Learning Resources",
    items: [
      {
        num: "01", groupName: "STUDY MATERIAL", key: "Study Material", tag: "Core",
        Icon: BookOpen,
        desc: "Curated notes, PDFs and video lectures by pharmacy experts. Chapter-wise coverage built for exam success.",
        stat: "500+", statLabel: "Resources",
        highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"],
        link: "/courses",
      },
      {
        num: "02", groupName: "PHARMACOPEDIA", key: "Pharmacopedia", tag: "Reference",
        Icon: Database,
        desc: "Digital pharmaceutical encyclopedia covering drugs, terms, dosages and mechanisms in one place.",
        stat: "2,000+", statLabel: "Drug Entries",
        highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
        link: "/encyclopedia",
      },
      {
        num: "03", groupName: "BOOKS LIBRARY", key: "Books Library", tag: "Reading",
        Icon: Library,
        desc: "Essential pharmacy textbooks and reference manuals online — bookmark and search across all titles.",
        stat: "150+", statLabel: "Titles",
        highlights: ["Standard Texts", "Ref Manuals", "Bookmarks", "Full Search"],
        link: "/books-library",
      },
      {
        num: "04", groupName: "FLASHCARDS", key: "Flashcards", tag: "New",
        Icon: Layers,
        desc: "Master drug mechanisms with spaced-repetition flashcards. Proven memory system for long-term retention.",
        stat: "1,200+", statLabel: "Cards",
        highlights: ["MOA Cards", "Drug Classes", "Spaced Rep", "Favourites"],
        link: "/flash-cards",
      },
    ],
  },
  {
    key: "practice",
    label: "Practice & Assessment",
    items: [
      {
        num: "05", groupName: "MCQ BANK", key: "MCQ Bank", tag: "Editor's Pick",
        Icon: FileText,
        desc: "Thousands of exam-ready MCQs with detailed explanations, subject filters, and performance analytics.",
        stat: "10,000+", statLabel: "Questions",
        highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Qs"],
        link: "/mcqs-bank",
      },
      {
        num: "06", groupName: "CALC TOOLS", key: "Calculation Tools", tag: "Practical",
        Icon: Calculator,
        desc: "Interactive calculators for dosage, formulation, alligation, and pharmacokinetics — built for clinical accuracy.",
        stat: "80+", statLabel: "Calculators",
        highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],
        link: "/calculation-tools",
      },
      {
        num: "07", groupName: "SLIDE SPOTTING", key: "Slide Spotting", tag: "Visual",
        Icon: Microscope,
        desc: "Identify microscopic slides and pharmaceutical specimens interactively with self-test mode.",
        stat: "300+", statLabel: "Specimens",
        highlights: ["Micro Slides", "Drug ID", "Specimen Lib", "Self-Tests"],
        link: "/spotting",
      },
      {
        num: "08", groupName: "LAB SIMULATIONS", key: "Lab Simulations", tag: "New",
        Icon: FlaskConical,
        desc: "Virtual pharmacy lab — perform titrations, staining, dilutions, and more in a risk-free interactive environment.",
        stat: "7+", statLabel: "Simulations",
        highlights: ["Titration", "Staining", "Dilution", "Disk Diffusion"],
        link: "/simulations",
        isLab: true,
      },
    ],
  },
  {
    key: "ai",
    label: "AI-Powered",
    items: [
      {
        num: "09", groupName: "AI GUIDE", key: "Expert AI Guide", tag: "AI-Powered",
        Icon: Bot,
        desc: "Intelligent companion trained on pharmacy curricula. Answers complex questions, explains concepts step-by-step, plans your study sessions.",
        stat: "24/7", statLabel: "Available",
        highlights: ["Step-by-step", "Study Plans", "Concept Q&A", "Exam Prep"],
        link: "/ai-guide",
        isAi: true,
      },
    ],
  },
];

/* ─── Ticker Track ──────────────────────────────────────────────────────── */
const TickerTrack = () => {
  const duplicatedItems = [...tickerItems, ...tickerItems];
  return (
    <div className="w-full overflow-hidden border-b border-blue-500/10 bg-white/60 backdrop-blur-sm select-none">
      <div className="flex whitespace-nowrap min-w-full">
        <motion.div
          initial={{ translateX: "0%" }}
          animate={{ translateX: "-50%" }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="flex"
        >
          {duplicatedItems.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2 sm:py-3 text-xs tracking-wider text-gray-500 border-r border-blue-500/5 font-medium"
            >
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                {item.value}
              </span>{" "}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(" ")[0]}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Feature Row ───────────────────────────────────────────────────────── */
const FeatureRow = ({
  item,
  isActive,
  onMouseEnter,
}: {
  item: (typeof groups)[0]["items"][0] & { isLab?: boolean; isAi?: boolean };
  isActive: boolean;
  onMouseEnter: () => void;
}) => {
  const { Icon } = item;

  const rowBg = item.isAi
    ? "bg-gradient-to-r from-blue-50/40 to-green-50/20 border-l-4 border-blue-500"
    : item.isLab
    ? "bg-gradient-to-r from-green-50/30 to-blue-50/20 border-l-4 border-green-500"
    : "border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-green-50/10";

  return (
    <div
      onMouseEnter={onMouseEnter}
      className={`relative flex flex-col md:flex-row transition-all duration-300 ease-out cursor-pointer group ${rowBg}`}
    >
      {/* Active indicator */}
      {!item.isLab && !item.isAi && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-200 ${
            isActive ? "bg-gradient-to-b from-blue-600 to-green-400" : "bg-transparent"
          }`}
        />
      )}

      {/* Left Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-center md:border-r border-gray-100/80">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
          {item.num} — {item.groupName}
        </div>
        <div className="mb-2">
          <span
            className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              item.tag === "New" || item.tag === "AI-Powered"
                ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
                : item.tag === "Editor's Pick"
                ? "bg-amber-50 border border-amber-200 text-amber-700"
                : "bg-blue-50 border border-blue-100 text-blue-700"
            }`}
          >
            {item.tag}
          </span>
        </div>
        <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight mb-1.5 group-hover:text-blue-700 transition-colors duration-200">
          {item.key}
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl">{item.desc}</p>
      </div>

      {/* Right Metrics */}
      <div className="w-full md:w-72 p-4 sm:p-6 md:p-8 flex flex-col justify-center gap-3 bg-gray-50/30 group-hover:bg-gradient-to-r group-hover:from-blue-50/30 group-hover:to-green-50/20 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">
              {item.stat}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400">
              {item.statLabel}
            </span>
          </div>
          <Icon
            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${
              isActive || item.isAi
                ? "text-blue-600"
                : "text-gray-300 group-hover:text-blue-500"
            }`}
            strokeWidth={1.5}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {item.highlights.map((h) => (
            <span
              key={h}
              className={`text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-lg border transition-colors duration-200 ${
                isActive || item.isAi
                  ? "bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-700"
              }`}
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function Features() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState<string>("01");

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 sm:py-24 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 40%, #f0fdf6 100%)" }}
    >
      {/* ── Ambient mesh blobs ─── */}
      <div
        className="absolute top-0 left-1/4 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)" }}
      />

      {/* ── Dot grid ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.3]"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Large Colorful Floating Icons ─── */}
      {floatingIcons.map(({ Icon, top, left, size, color, rotate }, i) => (
        <motion.div
          key={i}
          className={`absolute pointer-events-none ${color} hidden md:block`}
          style={{ top, left }}
          animate={{ y: [0, -15, 0], rotate: [rotate, rotate + 5, rotate] }}
          transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        >
          <Icon size={size} strokeWidth={1.3} />
        </motion.div>
      ))}

      {/* ── Mobile floating icons (smaller, fewer) ─── */}
      {floatingIcons.slice(0, 4).map(({ Icon, top, left, size, color, rotate }, i) => (
        <motion.div
          key={`m-${i}`}
          className={`absolute pointer-events-none ${color} md:hidden`}
          style={{ top: `calc(${top} + 5%)`, left: `calc(${left} + 2%)` }}
          animate={{ y: [0, -8, 0], rotate: [rotate, rotate + 3, rotate] }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        >
          <Icon size={size * 0.65} strokeWidth={1.3} />
        </motion.div>
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────── */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-blue-200/70 shadow-sm mb-4 sm:mb-6">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold text-blue-700 uppercase tracking-widest">
              Platform Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-none mb-4 sm:mb-6">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              excel
            </span>{" "}
            in pharmacy
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed">
            A complete academic toolkit engineered for pharmacy students — from curated study material to AI-guided learning, all in one place.
          </p>
        </div>

        {/* ── Stats Ticker ─────────────────────────── */}
        <div className="mb-10 sm:mb-12">
          <TickerTrack />
        </div>

        {/* ── Feature Groups ───────────────────────── */}
        {groups.map((group) => (
          <div key={group.key} className="mb-10 sm:mb-14">
            {/* Group header */}
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-blue-600/60 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 select-none">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-600 to-green-400" />
              <span>{group.label}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/10 to-transparent" />
            </div>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100"
            >
              {group.items.map((item) => (
                <Link href={item.link} key={item.key} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
                  <FeatureRow
                    item={item}
                    isActive={activeIndex === item.num}
                    onMouseEnter={() => setActiveIndex(item.num)}
                  />
                </Link>
              ))}
            </motion.div>
          </div>
        ))}

        {/* ─── Bottom CTA ──────────────────────────── */}
        <div className="mt-12 sm:mt-16 p-5 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-gray-900">
              Ready to start learning?
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Join thousands of pharmacy students already on the platform.
            </div>
          </div>
          <Link href="/courses">
            <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-200 cursor-pointer active:scale-95 w-full sm:w-auto">
              Explore Platform
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}