"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, FileText, Database, Calculator, Bot,
    ArrowRight, CheckCircle, MessageSquare, Lightbulb, Target,
    Sparkles, GraduationCap, Brain, Library, Scan, Layers
} from "lucide-react";
import Link from "next/link";
// Import background icons and blobs (same as other sections)
import {
    Pill as PillIcon,
    FlaskConical as FlaskIcon,
    Beaker as BeakerIcon,
    Microscope as MicroscopeIcon,
    Atom,
    Dna as DnaIcon,
    HeartPulse as HeartIcon,
    Leaf,
    Syringe as SyringeIcon,
    TestTube,
    Tablet,
    ClipboardList,
    Stethoscope as StethIcon,
    Bandage,
    Droplet,
    Eye,
    Bone,
    Brain as BrainIcon,
    Heart,
    Activity,
    AlertCircle,
    Scissors,
    Thermometer,
    Wind,
    Droplets,
    FlaskRound,
    Scale,
    Calculator as CalcIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
    revision: {
        title: "Quick Revision",
        icon: Sparkles,
        color: "from-teal-500 to-emerald-400",
        items: [
            {
                key: "Flashcards (MOA & Classification)",
                icon: Layers,
                description: "Master drug mechanisms and classifications with interactive flashcards for rapid recall.",
                highlights: ["MOA Cards", "Drug Classification", "Spaced Repetition", "Favourites"],
                accent: "#14B8A6",
                stat: "1,200+ Cards",
                link: "/flashcards",
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

    // Background icons
    const bgIconList: LucideIcon[] = [
        PillIcon, FlaskIcon, BeakerIcon, MicroscopeIcon, Atom, DnaIcon, HeartIcon, Leaf,
        SyringeIcon, TestTube, Tablet, ClipboardList, StethIcon, Bandage, Droplet, Eye,
        Bone, BrainIcon, Heart, Activity, AlertCircle, Scissors, Thermometer, Wind, Droplets,
        FlaskRound, Scale, CalcIcon,
    ];
    const bgIcons = Array.from({ length: 30 }, (_, i) => ({
        Icon: bgIconList[i % bgIconList.length],
        left: `${(i * 17) % 90 + 5}%`,
        top: `${(i * 23) % 90 + 5}%`,
        size: 20 + (i * 3) % 40,
        rotate: (i * 27) % 360,
    }));

    // Animation variants for cards
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            </div>

            {/* Floating background icons */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {bgIcons.map(({ Icon, left, top, size, rotate }, idx) => (
                    <Icon
                        key={idx}
                        size={size}
                        className="absolute text-gray-800/5"
                        style={{ left, top, transform: `rotate(${rotate}deg)` }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

                {Object.entries(featureGroups).map(([groupKey, group], groupIdx) => (
                    <motion.div
                        key={groupKey}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: groupIdx * 0.1 }}
                        className="mb-12 last:mb-0"
                    >
                        {/* Group Header with glass effect */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${group.color} shadow-lg`}>
                                <group.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                {group.title}
                            </h3>
                        </div>

                        {/* Cards Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${group.items.length} gap-5`}
                        >
                            {group.items.map((detail) => {
                                const Icon = detail.icon;
                                const isHovered = hovered === detail.key;
                                const isAI = "isAI" in detail && detail.isAI;

                                return (
                                    <motion.div
                                        key={detail.key}
                                        variants={cardVariants}
                                        onMouseEnter={() => setHovered(detail.key)}
                                        onMouseLeave={() => setHovered(null)}
                                        className="group relative rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Gradient border on hover */}
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-green-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-[1px]`} />

                                        {/* Main card - glass style */}
                                        <div className="relative bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden p-6 h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                            {isAI && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg">
                                                    <Lightbulb className="w-3 h-3" />
                                                    NEW
                                                </div>
                                            )}

                                            {/* Icon with gradient background */}
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-md"
                                                style={{
                                                    background: `linear-gradient(135deg, ${detail.accent}20, ${detail.accent}05)`,
                                                    color: detail.accent,
                                                }}
                                            >
                                                <Icon className="w-6 h-6" />
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
                        </motion.div>
                    </motion.div>
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
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90 transition"
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