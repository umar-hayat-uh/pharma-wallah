"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, FileText, Database, Calculator, Bot, ArrowRight, CheckCircle,
  MessageSquare, Sparkles, GraduationCap, Brain, Library, Scan, Layers,
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30, delay: 0,   color: "text-blue-400"  },
  { Icon: Beaker,      top: "50%", left: "1%",    size: 28, delay: 1.0, color: "text-green-400" },
  { Icon: Stethoscope, top: "84%", left: "1.5%",  size: 30, delay: 1.4, color: "text-purple-400" },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30, delay: 0.4, color: "text-amber-400"  },
  { Icon: FlaskConical,top: "50%", left: "97%",   size: 28, delay: 0.8, color: "text-teal-400"   },
  { Icon: Leaf,        top: "84%", left: "96.5%", size: 28, delay: 0.6, color: "text-red-400"    },
];

const groups = [
  {
    key: "learning", label: "Learning Resources", Icon: GraduationCap,
    items: [
      { key: "Study Material",  Icon: BookOpen,  desc: "Curated notes, PDFs, and video lectures by pharmacy experts.",                    stat: "500+ Resources",    highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"], link: "/material"      },
      { key: "Pharmacopedia",   Icon: Database,  desc: "Digital pharmaceutical encyclopedia covering drugs, terms, and dosages.",          stat: "2,000+ Entries",    highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],  link: "/pharmacopedia" },
      { key: "Books Library",   Icon: Library,   desc: "Essential pharmacy textbooks and reference books, all online.",                    stat: "150+ Titles",       highlights: ["Standard Texts", "Reference Manuals", "Bookmarks", "Search"],     link: "/books"         },
      { key: "Flashcards",      Icon: Layers,    desc: "Master drug mechanisms with spaced-repetition flashcards.",                       stat: "1,200+ Cards",      highlights: ["MOA Cards", "Drug Classes", "Spaced Repetition", "Favourites"],    link: "/flashcards"    },
    ],
  },
  {
    key: "practice", label: "Practice & Assessment", Icon: Brain,
    items: [
      { key: "MCQ Bank",          Icon: FileText,   desc: "Thousands of exam-ready MCQs with detailed explanations.",                    stat: "10,000+ Questions", highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Questions"],     link: "/mcqs"             },
      { key: "Calculation Tools", Icon: Calculator, desc: "Interactive calculators for dosage, formulation, and pharmacokinetics.",       stat: "15+ Calculators",   highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],   link: "/calculation-tools" },
      { key: "Slide Spotting",    Icon: Scan,       desc: "Identify microscopic slides and pharmaceutical specimens interactively.",      stat: "300+ Images",       highlights: ["Micro Slides", "Drug ID", "Specimen Library", "Self-Tests"],     link: "/slide-spotting"    },
    ],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const FeatureCard = ({ feat }: { feat: typeof groups[0]["items"][0] }) => {
  const { Icon } = feat;
  return (
    <motion.div variants={item} className="group">
      <Link href={feat.link} className="block h-full">
        <div className="relative h-full rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-6 flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
          {/* Gradient top stripe */}
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
          {/* Subtle hover tint */}
          <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />

          <div className="relative z-10 w-11 h-11 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/60 flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 transition-all duration-300">
            <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-bold text-gray-900">{feat.key}</h4>
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {feat.stat}
            </span>
          </div>

          <p className="relative z-10 text-xs text-gray-600 leading-relaxed mb-4 flex-1">{feat.desc}</p>

          <div className="relative z-10 flex flex-wrap gap-1.5 mb-4">
            {feat.highlights.map(h => (
              <span key={h} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-gray-50/90 text-gray-600 border border-gray-200">
                <CheckCircle className="w-2.5 h-2.5 text-blue-500" />{h}
              </span>
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-1 text-xs font-semibold text-blue-600 mt-auto">
            Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function Features() {
  return (
    <section className="w-full py-24 bg-gradient-to-b from-blue-50/30 via-white/50 to-green-50/30 relative overflow-hidden">
      {/* Soft background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-green-100/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMTBhMjAgMjAgMCAwIDEgMjAgMjAgMjAgMjAgMCAwIDEtNDAgMCAyMCAyMCAwIDAgMSAyMC0yMHoiIGZpbGw9InJnYmEoMzcsOTksMjM1LDAuMDMpIiAvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />

      {bgIcons.map(({ Icon, top, left, size, delay, color }, i) => (
        <motion.div key={i} className={`absolute pointer-events-none ${color}`}
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-xs font-bold text-blue-600 uppercase tracking-widest mb-5">
            <GraduationCap className="w-3.5 h-3.5" /> Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">excel in pharmacy</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Tools and resources built specifically for pharmacy students — from study materials to AI-guided learning.
          </p>
        </motion.div>

        {groups.map(g => (
          <div key={g.key} className="mb-12">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex items-center gap-3 mb-7">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                <g.Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-600">{g.label}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </motion.div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
              className={`grid gap-5 ${g.key === "learning" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
              {g.items.map(f => <FeatureCard key={f.key} feat={f} />)}
            </motion.div>
          </div>
        ))}

        {/* AI Banner */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-green-400">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 left-16 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-60 top-3 opacity-20"><Stethoscope size={42} className="text-white" /></div>
          <div className="absolute right-44 bottom-3 opacity-15"><Pill size={30} className="text-white" /></div>

          <div className="relative z-10 p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
            <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3">
                <Sparkles className="w-3 h-3" /> AI-POWERED · NEW
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-2">Expert AI Guide</h3>
              <p className="text-blue-100 text-sm max-w-lg">An intelligent AI companion trained on pharmacy curricula — answers questions, explains concepts, and plans your study sessions 24/7.</p>
            </div>
            <Link href="/ai-guide">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="shrink-0 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white font-bold text-sm text-blue-600 hover:bg-blue-50 shadow-xl cursor-pointer transition">
                <MessageSquare className="w-4 h-4" /> Chat with AI Guide
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}