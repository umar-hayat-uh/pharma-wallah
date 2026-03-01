"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, FileText, Database, Calculator, Bot,
  ArrowRight, CheckCircle, MessageSquare, Lightbulb, Target,
  Sparkles, GraduationCap, Brain, Library, Scan, Layers,
  // Background icons - only the most relevant
  Pill,
  FlaskConical,
  Beaker,
  Microscope,
  Dna,
  Stethoscope,
  Syringe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

// Selected pharmacy/medical icons with low opacity (0.2)
const iconList: BgIconItem[] = [
  { Icon: Pill, color: "text-blue-700/20" },
  { Icon: FlaskConical, color: "text-green-700/20" },
  { Icon: Beaker, color: "text-purple-700/20" },
  { Icon: Microscope, color: "text-amber-700/20" },
  { Icon: Dna, color: "text-blue-700/20" },
  { Icon: Stethoscope, color: "text-green-700/20" },
  { Icon: Syringe, color: "text-purple-700/20" },
];

// Generate only 6 icons, placed on left/right edges
const bgIcons: Array<{
  Icon: LucideIcon;
  color: string;
  left: string;
  top: string;
  size: number;
  rotate: number;
  delay: number;
}> = [
  // Left side
  { Icon: iconList[0].Icon, color: "text-blue-700/20", left: "5%", top: "10%", size: 40, rotate: -10, delay: 0 },
  { Icon: iconList[1].Icon, color: "text-green-700/20", left: "3%", top: "35%", size: 35, rotate: 15, delay: 0.5 },
  { Icon: iconList[2].Icon, color: "text-purple-700/20", left: "7%", top: "65%", size: 30, rotate: 5, delay: 1.0 },
  // Right side
  { Icon: iconList[3].Icon, color: "text-amber-700/20", left: "92%", top: "20%", size: 45, rotate: -20, delay: 0.2 },
  { Icon: iconList[4].Icon, color: "text-blue-700/20", left: "95%", top: "50%", size: 38, rotate: 25, delay: 0.7 },
  { Icon: iconList[5].Icon, color: "text-green-700/20", left: "90%", top: "80%", size: 42, rotate: -5, delay: 1.2 },
];

const featureGroups = {
  learning: {
    title: "Learning Resources",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-400",
    items: [
      {
        key: "Material",
        icon: BookOpen,
        description: "Curated study materials, notes, and textbooks designed by pharmacy experts.",
        highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"],
        accent: "#2563EB",
        stat: "500+ Resources",
        link: "/material",
      },
      {
        key: "Pharmacopedia",
        icon: Database,
        description: "A digital pharmaceutical encyclopedia covering drugs, terms, and dosages.",
        highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
        accent: "#059669",
        stat: "2,000+ Entries",
        link: "/pharmacopedia",
      },
      {
        key: "Books Library",
        icon: Library,
        description: "Access a growing collection of essential pharmacy textbooks and reference books online.",
        highlights: ["Standard Textbooks", "Reference Manuals", "Search Inside", "Bookmarks"],
        accent: "#8B5CF6",
        stat: "150+ Titles",
        link: "/books",
      },
      {
        key: "Flashcards",
        icon: Layers,
        description: "Master drug mechanisms and classifications with interactive flashcards for rapid recall.",
        highlights: ["MOA Cards", "Drug Classification", "Spaced Repetition", "Favourites"],
        accent: "#14B8A6",
        stat: "1,200+ Cards",
        link: "/flashcards",
      },
    ],
  },
  practice: {
    title: "Practice & Assessment",
    icon: Brain,
    color: "from-purple-500 to-pink-400",
    items: [
      {
        key: "MCQ's Bank",
        icon: FileText,
        description: "Thousands of exam-ready MCQs with explanations and performance tracking.",
        highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Questions"],
        accent: "#7C3AED",
        stat: "10,000+ Questions",
        link: "/mcqs",
      },
      {
        key: "Calculation Tools",
        icon: Calculator,
        description: "Interactive calculators for dosage, formulation, and pharmacokinetics.",
        highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],
        accent: "#D97706",
        stat: "15+ Calculators",
        link: "/calculation-tools",
      },
      {
        key: "Slide Spotting",
        icon: Scan,
        description: "Identify microscopic slides, drug samples, and pharmacy specimens with our spotting tool.",
        highlights: ["Micro Slides", "Drug Identification", "Specimen Library", "Self-Tests"],
        accent: "#EC4899",
        stat: "300+ Images",
        link: "/slide-spotting",
      },
    ],
  },
  ai: {
    title: "AI Assistant",
    icon: Sparkles,
    color: "from-sky-500 to-blue-400",
    items: [
      {
        key: "Expert AI Guide",
        icon: Bot,
        description: "An intelligent AI study companion trained on pharmacy curricula.",
        highlights: ["Instant Answers", "Concept Explainer", "Study Planner", "Exam Tips"],
        accent: "#0EA5E9",
        stat: "24/7 Available",
        link: "/ai-guide",
        isAI: true,
      },
    ],
  },
};

const Features = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background blobs behind icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons - only 6, on edges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bgIcons.map(({ Icon, color, left, top, size, rotate, delay }, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{ left, top }}
            initial={{ y: 0, rotate }}
            animate={{ y: [0, -10, 0], rotate: [rotate, rotate + 5, rotate] }}
            transition={{
              duration: 8,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={size} className={color} />
          </motion.div>
        ))}
      </div>

      {/* Subtle dot pattern (optional) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to excel in pharmacy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tools and resources built specifically for pharmacy students — from materials to AI-guided learning.
          </p>
        </motion.div>

        {/* Feature Groups */}
        {Object.entries(featureGroups).map(([groupKey, group], groupIdx) => (
          <motion.div
            key={groupKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: groupIdx * 0.1 }}
            className="mb-12 last:mb-0"
          >
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${group.color} shadow-lg`}>
                <group.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {group.title}
              </h3>
            </div>

            {/* Cards Grid */}
            <div
              className={`grid gap-6 ${
                groupKey === "learning"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : groupKey === "practice"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-xl mx-auto"
              }`}
            >
              {group.items.map((detail) => {
                const Icon = detail.icon;
                const isAI = "isAI" in detail && detail.isAI;

                return (
                  <motion.div
                    key={detail.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: groupIdx * 0.1 }}
                    onMouseEnter={() => setHovered(detail.key)}
                    onMouseLeave={() => setHovered(null)}
                    className="group relative h-full"
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />

                    {/* Card */}
                    <div className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300">
                      {isAI && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg">
                          <Lightbulb className="w-3 h-3" />
                          NEW
                        </div>
                      )}

                      {/* Icon */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${detail.accent}30, ${detail.accent}10)`,
                          color: detail.accent,
                        }}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{detail.key}</h4>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2"
                          style={{ background: detail.accent + "20", color: detail.accent }}
                        >
                          {detail.stat}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 flex-1">{detail.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {detail.highlights.map((h) => (
                          <span key={h} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" style={{ color: detail.accent }} />
                            {h}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-sm font-semibold mt-auto" style={{ color: detail.accent }}>
                        {isAI ? (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Chat with AI Guide</span>
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4" />
                            <span>Explore {detail.key}</span>
                          </>
                        )}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      <Link
                        href={detail.link}
                        className="absolute inset-0 z-10"
                        aria-label={`Explore ${detail.key}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Footer Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/all-features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-green-500 hover:shadow-lg transition"
          >
            View All Features <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90 transition"
          >
            <Bot className="w-4 h-4 text-sky-500" />
            Try AI Guide
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .pattern-medical {
          background-image: 
              radial-gradient(circle at 10px 10px, #3b82f6 1px, transparent 1px),
              radial-gradient(circle at 30px 30px, #10b981 1px, transparent 1px),
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59,130,246,0.05) 10px, rgba(59,130,246,0.05) 20px);
          background-size: 40px 40px, 40px 40px, 40px 40px;
        }
      `}</style>
    </section>
  );
};

export default Features;