"use client";

import React, { useState } from "react";
import { headerData } from "@/components/Layout/Header/Navigation/menuData";
import {
  BookOpen,
  FileText,
  Database,
  Calculator,
  Bot,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Users,
  MessageSquare,
  Lightbulb,
  Target,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const featureDetails = {
  Material: {
    icon: BookOpen,
    description:
      "Curated study materials, notes, and textbooks designed by pharmacy experts.",
    highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"],
    accent: "#2563EB",
    lightBg: "#EFF6FF",
    stat: "500+ Resources",
  },
  "MCQ's Bank": {
    icon: FileText,
    description:
      "Thousands of exam-ready MCQs with explanations and performance tracking.",
    highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Questions"],
    accent: "#7C3AED",
    lightBg: "#F5F3FF",
    stat: "10,000+ Questions",
  },
  Pharmacopedia: {
    icon: Database,
    description:
      "A digital pharmaceutical encyclopedia covering drugs, terms, and dosages.",
    highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
    accent: "#059669",
    lightBg: "#ECFDF5",
    stat: "2,000+ Entries",
  },
  "Calculation Tools": {
    icon: Calculator,
    description:
      "Interactive calculators for dosage, formulation, and pharmacokinetics.",
    highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],
    accent: "#D97706",
    lightBg: "#FFFBEB",
    stat: "15+ Calculators",
  },
  "Expert AI Guide": {
    icon: Bot,
    description:
      "An intelligent AI study companion trained on pharmacy curricula to answer questions, explain concepts, and guide your learning 24/7.",
    highlights: ["Instant Answers", "Concept Explainer", "Study Planner", "Exam Tips"],
    accent: "#0EA5E9",
    lightBg: "#F0F9FF",
    stat: "AI-Powered",
    isAI: true,
  },
};

type FeatureKey = keyof typeof featureDetails;

const FEATURES_ORDER: FeatureKey[] = [
  "Material",
  "MCQ's Bank",
  "Pharmacopedia",
  "Calculation Tools",
  "Expert AI Guide",
];



const Features = () => {
  const [hovered, setHovered] = useState<FeatureKey | null>(null);

  return (
    <section className="py-24 bg-white relative">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: "#2563EB" }}
          >
            Platform Features
          </span>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
            style={{ fontFamily: "'Sora', 'Nunito', sans-serif", letterSpacing: "-0.02em" }}
          >
            Everything you need to{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              excel in pharmacy
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl">
            Tools and resources built specifically for pharmacy students — from materials to AI-guided learning.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES_ORDER.map((key) => {
            const detail = featureDetails[key];
            const Icon = detail.icon;
            const isHovered = hovered === key;
            const isAI = "isAI" in detail && detail.isAI;

            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer group ${
                  isAI
                    ? "md:col-span-2 lg:col-span-1"
                    : ""
                }`}
                style={{
                  borderColor: isHovered ? detail.accent : "#E5E7EB",
                  background: isHovered ? detail.lightBg : "#FAFAFA",
                  boxShadow: isHovered
                    ? `0 8px 32px 0 ${detail.accent}22, 0 1px 4px 0 ${detail.accent}11`
                    : "0 1px 4px 0 #0000000A",
                  transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                }}
              >
                {/* AI badge ribbon */}
                {isAI && (
                  <div
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: detail.accent, color: "#fff" }}
                  >
                    <Lightbulb className="w-3 h-3" />
                    NEW
                  </div>
                )}

                <div className="p-7">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                    style={{
                      background: isHovered ? detail.accent : "#F3F4F6",
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: isHovered ? "#fff" : detail.accent }}
                    />
                  </div>

                  {/* Title & stat */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{key}</h3>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full ml-2 shrink-0"
                      style={{
                        background: detail.lightBg,
                        color: detail.accent,
                        border: `1px solid ${detail.accent}30`,
                      }}
                    >
                      {detail.stat}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {detail.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {detail.highlights.map((h) => (
                      <span
                        key={h}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full"
                        style={{
                          background: "#F3F4F6",
                          color: "#374151",
                        }}
                      >
                        <CheckCircle
                          className="w-3 h-3"
                          style={{ color: detail.accent }}
                        />
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div
                    className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200"
                    style={{ color: detail.accent }}
                  >
                    {isAI ? (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat with AI Guide</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span>Explore {key}</span>
                      </>
                    )}
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </div>

                {/* Invisible full-card link */}
                <Link
                  href={isAI ? "/ai-guide" : `/${key.toLowerCase().replace(/[^a-z]/g, "-")}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Explore ${key}`}
                >
                  <span className="sr-only">Explore {key}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>


        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="/material"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(90deg, #2563EB, #0EA5E9)" }}
          >
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-guide"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold border border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-md transition-all duration-300"
          >
            <Bot className="w-4 h-4 text-sky-500" />
            Try AI Guide
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;