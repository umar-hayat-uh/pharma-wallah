"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, FlaskConical, Pill, Sparkles } from "lucide-react";
// Background icons and blobs (same as other pages)
import {
    Pill as PillIcon,
    FlaskConical as FlaskIcon,
    Beaker,
    Microscope,
    Atom,
    Dna,
    HeartPulse,
    Leaf,
    Syringe,
    TestTube,
    Tablet,
    ClipboardList,
    Stethoscope,
    Bandage,
    Droplet,
    Eye,
    Bone,
    Brain,
    Heart,
    Activity,
    AlertCircle,
    Scissors,
    Thermometer,
    Wind,
    Droplets,
    FlaskRound,
    Scale,
    Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
    Icon: LucideIcon;
    color: string;
}

const iconList: BgIconItem[] = [
    { Icon: PillIcon, color: "text-blue-800/10" },
    { Icon: FlaskIcon, color: "text-green-800/10" },
    { Icon: Beaker, color: "text-purple-800/10" },
    { Icon: Microscope, color: "text-amber-800/10" },
    { Icon: Atom, color: "text-blue-800/10" },
    { Icon: Dna, color: "text-green-800/10" },
    { Icon: HeartPulse, color: "text-purple-800/10" },
    { Icon: Leaf, color: "text-amber-800/10" },
    { Icon: Syringe, color: "text-blue-800/10" },
    { Icon: TestTube, color: "text-green-800/10" },
    { Icon: Tablet, color: "text-purple-800/10" },
    { Icon: ClipboardList, color: "text-amber-800/10" },
    { Icon: Stethoscope, color: "text-blue-800/10" },
    { Icon: Bandage, color: "text-green-800/10" },
    { Icon: Droplet, color: "text-purple-800/10" },
    { Icon: Eye, color: "text-amber-800/10" },
    { Icon: Bone, color: "text-blue-800/10" },
    { Icon: Brain, color: "text-green-800/10" },
    { Icon: Heart, color: "text-purple-800/10" },
    { Icon: Activity, color: "text-amber-800/10" },
    { Icon: AlertCircle, color: "text-blue-800/10" },
    { Icon: Scissors, color: "text-green-800/10" },
    { Icon: Thermometer, color: "text-purple-800/10" },
    { Icon: Wind, color: "text-amber-800/10" },
    { Icon: Droplets, color: "text-green-800/10" },
    { Icon: FlaskRound, color: "text-purple-800/10" },
    { Icon: Scale, color: "text-blue-800/10" },
    { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
    const item = iconList[i % iconList.length];
    bgIcons.push({
        Icon: item.Icon,
        color:
            i % 4 === 0
                ? "text-blue-800/10"
                : i % 4 === 1
                    ? "text-green-800/10"
                    : i % 4 === 2
                        ? "text-purple-800/10"
                        : "text-amber-800/10",
    });
}

// Sample data – replace with your own
const moaData = [
    { drug: "Methotrexate", moa: "Inhibits dihydrofolate reductase (DHFR), depleting tetrahydrofolate and inhibiting DNA synthesis. At higher doses, this leads to cytotoxic effects in cancer; at lower doses, it exhibits anti-inflammatory and immunomodulatory effects (partly through increased extracellular adenosine)." },    
    { drug: "Omeprazole", moa: "Proton pump inhibitor – irreversibly blocks H+/K+ ATPase in gastric parietal cells." },
    { drug: "Atenolol", moa: "Cardioselective β1-adrenergic antagonist – reduces heart rate and contractility." },
    { drug: "Lisinopril", moa: "ACE inhibitor – prevents conversion of angiotensin I to II, vasodilation." },
    { drug: "Metformin", moa: "Biguanide – decreases hepatic glucose production, increases insulin sensitivity." },
    { drug: "Warfarin", moa: "Vitamin K antagonist – inhibits synthesis of clotting factors II, VII, IX, X." },
    { drug: "Simvastatin", moa: "HMG‑CoA reductase inhibitor – lowers LDL cholesterol." },
    { drug: "Furosemide", moa: "Loop diuretic – inhibits Na+/K+/2Cl⁻ symporter in ascending loop of Henle." },
    { drug: "Ciprofloxacin", moa: "Fluoroquinolone – inhibits DNA gyrase and topoisomerase IV." },
];

const classificationData = [
    { drug: "Amlodipine", classification: "Calcium channel blocker (dihydropyridine)" },
    { drug: "Ranitidine", classification: "H2 receptor antagonist" },
    { drug: "Diphenhydramine", classification: "First‑generation antihistamine (H1 antagonist)" },
    { drug: "Albuterol", classification: "Short‑acting β2 agonist" },
    { drug: "Levothyroxine", classification: "Thyroid hormone (T4)" },
    { drug: "Insulin glargine", classification: "Long‑acting insulin analogue" },
    { drug: "Clopidogrel", classification: "P2Y12 platelet inhibitor" },
    { drug: "Morphine", classification: "Opioid analgesic" },
];

export default function FlashcardsPage() {
    const [activeTab, setActiveTab] = useState<"moa" | "classification">("moa");
    const [searchQuery, setSearchQuery] = useState("");

    const data = activeTab === "moa" ? moaData : classificationData;
    const filteredData = data.filter((item) =>
        item.drug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-x-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </div>

            {/* Floating background icons */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {bgIcons.map(({ Icon, color }, index) => {
                    const left = `${(index * 13) % 90 + 5}%`;
                    const top = `${(index * 19) % 90 + 5}%`;
                    const size = 30 + (index * 7) % 90;
                    const rotate = (index * 23) % 360;
                    return (
                        <Icon
                            key={index}
                            size={size}
                            className={`absolute ${color}`}
                            style={{ left, top, transform: `rotate(${rotate}deg)` }}
                        />
                    );
                })}
            </div>

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                            Drug Flashcards
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
                            Master mechanisms of action and drug classifications – flip to reveal the answer.
                        </p>
                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                            <input
                                type="text"
                                placeholder="Search drug..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
                {/* Tab Switcher */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex p-1 bg-white/30 backdrop-blur-md rounded-full border border-white/50">
                        <button
                            onClick={() => setActiveTab("moa")}
                            className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${activeTab === "moa"
                                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-white/30"
                                }`}
                        >
                            Mechanism of Action
                        </button>
                        <button
                            onClick={() => setActiveTab("classification")}
                            className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${activeTab === "classification"
                                    ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-white/30"
                                }`}
                        >
                            Classification
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                {filteredData.length > 0 ? (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredData.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group perspective"
                            >
                                <div className="relative w-full h-64 preserve-3d group-hover:rotate-y-180 transition-transform duration-500">
                                    {/* Front */}
                                    <div className="absolute inset-0 backface-hidden bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 flex flex-col items-center justify-center text-center">
                                        <Pill className="w-12 h-12 text-blue-600 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-800">{item.drug}</h3>
                                        <p className="text-sm text-gray-500 mt-2">Tap to reveal</p>
                                    </div>
                                    {/* Back */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl border border-white/50 shadow-lg p-6 flex items-center justify-center text-center text-white">
                                        <div>
                                            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-80" />
                                            <p className="text-sm font-medium">
                                                {activeTab === "moa" ? "MOA:" : "Classification:"}
                                            </p>
                                            <p className="text-sm mt-1">
                                                {activeTab === "moa" ? (item as typeof moaData[0]).moa : (item as typeof classificationData[0]).classification}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No flashcards found for "{searchQuery}"</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .group:hover .group-hover\\:rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </section>
    );
}