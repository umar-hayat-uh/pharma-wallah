"use client";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  BookOpen, FileText, Database, Calculator, Bot, ArrowRight, CheckCircle,
  MessageSquare, Sparkles, GraduationCap, Brain, Library, Scan, Layers,
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf, ChevronRight,
  Star, TrendingUp, Zap,
} from "lucide-react";

/* ─── Background ambient icons ─────────────────────────────────────────── */
const bgIcons = [
  { Icon: Pill,        top: "8%",  left: "2%",   size: 36, color: "text-blue-400/20" },
  { Icon: Beaker,      top: "35%", left: "1%",   size: 32, color: "text-green-400/20" },
  { Icon: Stethoscope, top: "65%", left: "2%",   size: 34, color: "text-blue-500/20" },
  { Icon: Leaf,        top: "88%", left: "1.5%", size: 30, color: "text-green-400/20" },
  { Icon: Microscope,  top: "8%",  left: "96%",  size: 36, color: "text-blue-400/20" },
  { Icon: FlaskConical,top: "35%", left: "96.5%",size: 32, color: "text-green-400/20" },
  { Icon: Pill,        top: "65%", left: "96%",  size: 30, color: "text-blue-500/20" },
  { Icon: Leaf,        top: "88%", left: "96.5%",size: 28, color: "text-green-400/20" },
];

/* ─── Feature data ──────────────────────────────────────────────────────── */
const groups = [
  {
    key: "learning",
    label: "Learning Resources",
    Icon: GraduationCap,
    description: "Comprehensive study materials crafted by pharmacy experts",
    items: [
      {
        key: "Study Material",
        Icon: BookOpen,
        desc: "Curated notes, PDFs, and video lectures by pharmacy experts.",
        stat: "500+",
        statLabel: "Resources",
        highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"],
        link: "/courses",
        accentFrom: "from-blue-600",
        accentTo: "to-blue-400",
        badge: "Most Popular",
      },
      {
        key: "Pharmacopedia",
        Icon: Database,
        desc: "Digital pharmaceutical encyclopedia covering drugs, terms, and dosages.",
        stat: "2,000+",
        statLabel: "Entries",
        highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
        link: "/encyclopedia",
        accentFrom: "from-blue-500",
        accentTo: "to-green-400",
        badge: null,
      },
      {
        key: "Books Library",
        Icon: Library,
        desc: "Essential pharmacy textbooks and reference books, all online.",
        stat: "150+",
        statLabel: "Titles",
        highlights: ["Standard Texts", "Reference Manuals", "Bookmarks", "Search"],
        link: "/books-library",
        accentFrom: "from-green-500",
        accentTo: "to-blue-400",
        badge: null,
      },
      {
        key: "Flashcards",
        Icon: Layers,
        desc: "Master drug mechanisms with spaced-repetition flashcards.",
        stat: "1,200+",
        statLabel: "Cards",
        highlights: ["MOA Cards", "Drug Classes", "Spaced Repetition", "Favourites"],
        link: "/flash-cards",
        accentFrom: "from-green-600",
        accentTo: "to-green-400",
        badge: "New",
      },
    ],
  },
  {
    key: "practice",
    label: "Practice & Assessment",
    Icon: Brain,
    description: "Test your knowledge and sharpen exam-ready skills",
    items: [
      {
        key: "MCQ Bank",
        Icon: FileText,
        desc: "Thousands of exam-ready MCQs with detailed explanations.",
        stat: "10,000+",
        statLabel: "Questions",
        highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Questions"],
        link: "/mcqs-bank",
        accentFrom: "from-blue-600",
        accentTo: "to-green-500",
        badge: "Editor's Pick",
      },
      {
        key: "Calculation Tools",
        Icon: Calculator,
        desc: "Interactive calculators for dosage, formulation, and pharmacokinetics.",
        stat: "15+",
        statLabel: "Calculators",
        highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],
        link: "/calculation-tools",
        accentFrom: "from-blue-500",
        accentTo: "to-blue-400",
        badge: null,
      },
      {
        key: "Slide Spotting",
        Icon: Scan,
        desc: "Identify microscopic slides and pharmaceutical specimens interactively.",
        stat: "300+",
        statLabel: "Images",
        highlights: ["Micro Slides", "Drug ID", "Specimen Library", "Self-Tests"],
        link: "/spotting",
        accentFrom: "from-green-500",
        accentTo: "to-blue-500",
        badge: null,
      },
    ],
  },
];

/* ─── Animations ────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Stat pill ─────────────────────────────────────────────────────────── */
const StatPill = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-end">
    <span className="text-lg font-black text-gray-900 leading-none">{value}</span>
    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mt-0.5">{label}</span>
  </div>
);

/* ─── Feature Card ──────────────────────────────────────────────────────── */
const FeatureCard = ({ feat, index }: { feat: typeof groups[0]["items"][0]; index: number }) => {
  const { Icon } = feat;
  return (
    <motion.div variants={cardVariants} className="group h-full">
      <Link href={feat.link} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
        <div className="relative h-full rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col overflow-hidden
          hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1 hover:border-blue-200/70
          transition-all duration-300 ease-out cursor-pointer">

          {/* Gradient top bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${feat.accentFrom} ${feat.accentTo} flex-shrink-0`} />

          {/* Card body */}
          <div className="flex flex-col flex-1 p-6">

            {/* Top row: icon + stat */}
            <div className="flex items-start justify-between mb-5">
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feat.accentFrom} ${feat.accentTo}
                flex items-center justify-center shadow-md flex-shrink-0
                group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                {/* Glow ring on hover */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feat.accentFrom} ${feat.accentTo} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`} />
              </div>
              <StatPill value={feat.stat} label={feat.statLabel} />
            </div>

            {/* Title + badge */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-base font-bold text-gray-900 leading-snug">{feat.key}</h4>
              {feat.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${feat.accentFrom} ${feat.accentTo} text-white`}>
                  {feat.badge}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{feat.desc}</p>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-1.5 mb-5">
              {feat.highlights.map(h => (
                <div key={h} className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="truncate font-medium">{h}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600
              group-hover:text-blue-700 mt-auto pt-3 border-t border-gray-100">
              <span>Explore</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── Section Header ────────────────────────────────────────────────────── */
const GroupHeader = ({ group }: { group: typeof groups[0] }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="flex items-center gap-4 mb-8"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md flex-shrink-0">
      <group.Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 leading-none">{group.label}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{group.description}</p>
    </div>
    <div className="flex-1 hidden sm:block">
      <div className="h-px bg-gradient-to-r from-gray-200 via-blue-100 to-transparent ml-4" />
    </div>
  </motion.div>
);

/* ─── Stats Bar ─────────────────────────────────────────────────────────── */
const statsBar = [
  { icon: TrendingUp, value: "10,000+", label: "MCQ Questions", color: "text-blue-600" },
  { icon: Star,       value: "2,000+",  label: "Drug Entries",  color: "text-green-500" },
  { icon: Zap,        value: "500+",    label: "Study Resources",color: "text-blue-500" },
  { icon: Brain,      value: "1,200+",  label: "Flashcards",    color: "text-green-600" },
];

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Features() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section className="relative w-full py-24 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 40%, #f0fdf6 100%)" }}>

      {/* ── Ambient mesh blobs ─── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />

      {/* ── Dot grid ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* ── Ambient side icons ─── */}
      {bgIcons.map(({ Icon, top, left, size, color }, i) => (
        <div key={i} className={`absolute pointer-events-none ${color}`} style={{ top, left }}>
          <Icon size={size} strokeWidth={1.2} />
        </div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Section header ─── */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 28 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white border border-blue-200/70 shadow-sm mb-6">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Platform Features</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.08]">
            Everything you need to{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                excel in pharmacy
              </span>
              {/* Underline accent */}
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
                <path d="M0 3 Q75 0 150 3 Q225 6 300 3" stroke="url(#ul)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="ul" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            A complete academic toolkit built specifically for pharmacy students —
            from curated study material to AI-guided learning, all in one place.
          </p>
        </motion.div>

        {/* ── Stats bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-20"
        >
          {statsBar.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-3 bg-white/90 border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div>
                <div className="text-lg font-extrabold text-gray-900 leading-none">{value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Feature groups ─── */}
        {groups.map(g => (
          <div key={g.key} className="mb-16">
            <GroupHeader group={g} />
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className={`grid gap-5 ${
                g.key === "learning"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-3"
              }`}
            >
              {g.items.map((f, i) => (
                <FeatureCard key={f.key} feat={f} index={i} />
              ))}
            </motion.div>
          </div>
        ))}

        {/* ── AI Guide Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-135 from-blue-700 via-blue-600 to-green-500"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #16a34a 100%)" }} />

            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

            {/* Decorative orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 left-24 w-48 h-48 rounded-full bg-green-400/20 blur-2xl" />
            <div className="absolute top-6 right-56 opacity-10"><Stethoscope size={56} className="text-white" /></div>
            <div className="absolute bottom-6 right-40 opacity-[0.08]"><Pill size={40} className="text-white" /></div>

            {/* Content */}
            <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">

              {/* Icon block */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20
                  flex items-center justify-center shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping opacity-30" />
              </div>

              {/* Text */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                  bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-POWERED · NEW FEATURE
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Expert AI Guide</h3>
                <p className="text-blue-100/90 text-base max-w-xl leading-relaxed">
                  An intelligent AI companion trained on pharmacy curricula — answers complex questions,
                  explains concepts step-by-step, and plans your study sessions around the clock.
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0">
                <Link href="/ai-guide">
                  <span className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                    bg-white text-blue-700 font-bold text-sm shadow-xl
                    hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95
                    transition-all duration-200 cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI Guide
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}