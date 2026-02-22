"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, FileText, Database, Calculator, Bot,
    ArrowRight, CheckCircle, MessageSquare, Lightbulb, Target,
    Sparkles, GraduationCap, Brain, Library, Scan, Layers
} from "lucide-react";
import Link from "next/link";

const featureGroups = {
    learning: {
        title: "Learning Resources",
        items: [
            {
                key: "Material",
                icon: BookOpen,
                description: "Curated study materials, notes, and textbooks designed by pharmacy experts.",
                highlights: ["Detailed Notes", "Chapter PDFs", "Video Lectures", "Past Papers"],
                accent: "#2563EB",
                stat: "500+ Resources",
            },
            {
                key: "Pharmacopedia",
                icon: Database,
                description: "A digital pharmaceutical encyclopedia covering drugs, terms, and dosages.",
                highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
                accent: "#059669",
                stat: "2,000+ Entries",
            },
            {
                key: "Books Library",
                icon: Library,
                description: "Access a growing collection of essential pharmacy textbooks and reference books online.",
                highlights: ["Standard Textbooks", "Reference Manuals", "Search Inside", "Bookmarks"],
                accent: "#8B5CF6",
                stat: "150+ Titles",
            },
        ],
    },
    practice: {
        title: "Practice & Assessment",
        items: [
            {
                key: "MCQ's Bank",
                icon: FileText,
                description: "Thousands of exam-ready MCQs with explanations and performance tracking.",
                highlights: ["Subject MCQs", "Mock Tests", "Analytics", "Year Questions"],
                accent: "#7C3AED",
                stat: "10,000+ Questions",
            },
            {
                key: "Calculation Tools",
                icon: Calculator,
                description: "Interactive calculators for dosage, formulation, and pharmacokinetics.",
                highlights: ["Dosage Calc", "IV Flow Rate", "Alligation", "Concentration"],
                accent: "#D97706",
                stat: "15+ Calculators",
            },
            {
                key: "Slide Spotting",
                icon: Scan,
                description: "Identify microscopic slides, drug samples, and pharmacy specimens with our spotting tool.",
                highlights: ["Micro Slides", "Drug Identification", "Specimen Library", "Self-Tests"],
                accent: "#EC4899",
                stat: "300+ Images",
            },
        ],
    },
    revision: {
        title: "Quick Revision",
        items: [
            {
                key: "Flashcards (MOA & Classification)",
                icon: Layers,
                description: "Master drug mechanisms and classifications with interactive flashcards for rapid recall.",
                highlights: ["MOA Cards", "Drug Classification", "Spaced Repetition", "Favourites"],
                accent: "#14B8A6",
                stat: "1,200+ Cards",
            },
        ],
    },
    ai: {
        title: "AI Assistant",
        items: [
            {
                key: "Expert AI Guide",
                icon: Bot,
                description: "An intelligent AI study companion trained on pharmacy curricula.",
                highlights: ["Instant Answers", "Concept Explainer", "Study Planner", "Exam Tips"],
                accent: "#0EA5E9",
                stat: "24/7 Available",
                isAI: true,
            },
        ],
    },
};

const Features = () => {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
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

                {Object.entries(featureGroups).map(([groupKey, group]) => (
                    <div key={groupKey} className="mb-12 last:mb-0">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            {groupKey === 'learning' && <GraduationCap className="w-6 h-6 text-blue-600" />}
                            {groupKey === 'practice' && <Brain className="w-6 h-6 text-purple-600" />}
                            {groupKey === 'revision' && <Sparkles className="w-6 h-6 text-teal-600" />}
                            {groupKey === 'ai' && <Sparkles className="w-6 h-6 text-sky-600" />}
                            {group.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {group.items.map((detail) => {
                                const Icon = detail.icon;
                                const isHovered = hovered === detail.key;
                                const isAI = "isAI" in detail && detail.isAI;

                                return (
                                    <motion.div
                                        key={detail.key}
                                        onMouseEnter={() => setHovered(detail.key)}
                                        onMouseLeave={() => setHovered(null)}
                                        className="relative rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer"
                                        style={{
                                            borderColor: isHovered ? detail.accent : "#E5E7EB",
                                            background: isHovered ? detail.accent + "10" : "#FAFAFA",
                                            boxShadow: isHovered ? `0 4px 12px ${detail.accent}22` : "0 1px 3px #0000000A",
                                        }}
                                    >
                                        {isAI && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-sky-500 text-white">
                                                <Lightbulb className="w-3 h-3" />
                                                NEW
                                            </div>
                                        )}
                                        <div className="p-6">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                                style={{ background: isHovered ? detail.accent : "#F3F4F6" }}
                                            >
                                                <Icon className="w-5 h-5" style={{ color: isHovered ? "#fff" : detail.accent }} />
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-bold text-gray-900">{detail.key}</h4>
                                                <span
                                                    className="text-xs font-semibold px-2 py-1 rounded-full"
                                                    style={{ background: detail.accent + "20", color: detail.accent }}
                                                >
                                                    {detail.stat}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{detail.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {detail.highlights.map((h) => (
                                                    <span key={h} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                                        <CheckCircle className="w-3 h-3" style={{ color: detail.accent }} />
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: detail.accent }}>
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
                                        </div>
                                        <Link
                                            href={isAI ? "/ai-guide" : `/${detail.key.toLowerCase().replace(/[^a-z]/g, "-")}`}
                                            className="absolute inset-0 z-10"
                                            aria-label={`Explore ${detail.key}`}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="mt-12 flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/all-features"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-green-500 hover:shadow-lg transition"
                    >
                        View All Features <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/ai-guide"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 hover:border-gray-400 transition"
                    >
                        <Bot className="w-4 h-4 text-sky-500" />
                        Try AI Guide
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Features;