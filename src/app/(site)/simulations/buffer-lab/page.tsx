"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FlaskConical,
    Activity,
    Download,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Droplet,
    PlayCircle,
    AlertCircle,
    Scale,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";

// --- DATA MODELS & PRESETS ---

interface BufferSystem {
    name: string;
    acidComponent: string;
    baseComponent: string;
    acidMass: number;
    baseMass: number;
    pKa: number;
    targetVolume: number;
    targetpH: number;
    acidConc: number;
    baseConc: number;
}

const BUFFER_PRESETS: BufferSystem[] = [
    {
        name: "Phosphate Buffer (pH 7.4)",
        acidComponent: "KH₂PO₄",
        baseComponent: "K₂HPO₄",
        acidMass: 0.68,
        baseMass: 0.87,
        pKa: 7.2,
        targetVolume: 100,
        targetpH: 7.4,
        acidConc: 0.05,
        baseConc: 0.05,
    },
    {
        name: "Acetate Buffer (pH 4.5)",
        acidComponent: "CH₃COOH",
        baseComponent: "CH₃COONa",
        acidMass: 0.6,
        baseMass: 0.82,
        pKa: 4.76,
        targetVolume: 100,
        targetpH: 4.5,
        acidConc: 0.1,
        baseConc: 0.1,
    },
    {
        name: "Ammonia Buffer (pH 9.25)",
        acidComponent: "NH₄Cl",
        baseComponent: "NH₃ (aq)",
        acidMass: 0.53,
        baseMass: 0.85,
        pKa: 9.25,
        targetVolume: 100,
        targetpH: 9.25,
        acidConc: 0.1,
        baseConc: 0.1,
    },
];

const TUTORIAL_SLIDES = [
    {
        emoji: "🛡️",
        title: "1. The Concept of a Buffer",
        text: "A buffer solution resists pH changes when small amounts of acid or base are added. In pharmacy, buffers are essential for drug stability, solubility, and physiological compatibility (e.g., eye drops, IV fluids).",
    },
    {
        emoji: "🧮",
        title: "2. The Henderson-Hasselbalch Equation",
        text: "Buffer pH is described by the equation:\n\n**pH = pKa + log([Conjugate Base] / [Weak Acid])**\n\nWhen the concentrations are equal, pH = pKa. A buffer works best within ±1 pH unit of its pKa.",
    },
    {
        emoji: "⚖️",
        title: "3. Laboratory Preparation Steps",
        text: "1. Calculate required masses of acid and conjugate base.\n2. Weigh using an analytical balance.\n3. Dissolve in ~80% of the target volume of purified water.\n4. Adjust pH with 0.1M HCl or NaOH using a pH meter.\n5. Transfer to a volumetric flask and fill to the mark.",
    },
    {
        emoji: "📈",
        title: "4. Buffer Capacity (β)",
        text: "Buffer capacity is the moles of strong acid or base required to change the pH of 1 litre of buffer by 1 unit.\n\nIt depends on:\n1. Total concentration (higher conc. → higher capacity).\n2. Component ratio (max capacity when pH = pKa).",
    },
];

const QUIZ_QUESTIONS = [
    {
        q: "According to the Henderson-Hasselbalch equation, what is the pH of a buffer when [A⁻] = [HA]?",
        options: ["pH = 7.0", "pH = pKa", "pH = pKa + 1", "pH = 14.0"],
        ans: 1,
    },
    {
        q: "Why is it recommended to dissolve buffer salts in ~80% of the final volume before adjusting pH?",
        options: [
            "To save water",
            "Because adding acid/base will change the total volume",
            "To prevent precipitation",
            "It is just tradition",
        ],
        ans: 1,
    },
    {
        q: "Which instrument is used for accurate weighing of buffer salts?",
        options: [
            "Kitchen scale",
            "Spring balance",
            "Analytical balance (0.0001 g)",
            "Top-loading balance (0.1 g)",
        ],
        ans: 2,
    },
    {
        q: "What happens to buffer capacity when the buffer is diluted with water?",
        options: [
            "It increases",
            "It decreases",
            "It stays the same",
            "The pH changes dramatically",
        ],
        ans: 1,
    },
];

// --- MAIN COMPONENT ---

export default function BufferLab() {
    const [phase, setPhase] = useState<"tutorial" | "quiz" | "simulation">("tutorial");

    // Tutorial & Quiz
    const [slide, setSlide] = useState(0);
    const [quizStep, setQuizStep] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);

    // Sim State
    const [simStep, setSimStep] = useState(1);
    const [selectedBuffer, setSelectedBuffer] = useState<BufferSystem | null>(null);

    // Step 2: Weighing
    const [activeComponent, setActiveComponent] = useState<"acid" | "base">("acid");
    const [spatulaLoaded, setSpatulaLoaded] = useState(false);
    const [currentMass, setCurrentMass] = useState(0);
    const [acidMassWeighed, setAcidMassWeighed] = useState(0);
    const [baseMassWeighed, setBaseMassWeighed] = useState(0);
    const [isWeighingComplete, setIsWeighingComplete] = useState(false);

    // Step 2: Transfer
    const [mode, setMode] = useState<"weigh" | "transfer">("weigh");
    const [powderTransferred, setPowderTransferred] = useState(false);
    const [waterAdded, setWaterAdded] = useState(false);
    const [dissolved, setDissolved] = useState(false);

    // Step 3: pH
    const [currentPH, setCurrentPH] = useState<number>(0);
    const [electrodeInserted, setElectrodeInserted] = useState(false);
    const [pHAdjusted, setPHAdjusted] = useState(false);

    // Step 4: Capacity
    const [capacityData, setCapacityData] = useState<{ titrantVol: number; pH: number }[]>([]);
    const [titrantAdded, setTitrantAdded] = useState(0);
    const [acidMoles, setAcidMoles] = useState(10);
    const [baseMoles, setBaseMoles] = useState(10);

    // ──────────────── HANDLERS ────────────────

    const handleQuizAnswer = (idx: number) => {
        if (idx === QUIZ_QUESTIONS[quizStep].ans) {
            setScore((s) => s + 1);
            setQuizFeedback("correct");
        } else {
            setQuizFeedback("incorrect");
        }
        setTimeout(() => {
            setQuizFeedback(null);
            if (quizStep < QUIZ_QUESTIONS.length - 1) {
                setQuizStep((s) => s + 1);
            } else {
                setPhase("simulation");
            }
        }, 1500);
    };

    const startSimulation = (buffer: BufferSystem) => {
        setSelectedBuffer(buffer);
        setSimStep(2);
        setMode("weigh");
        setActiveComponent("acid");
        setCurrentMass(0);
        setAcidMassWeighed(0);
        setBaseMassWeighed(0);
        setIsWeighingComplete(false);
        setPowderTransferred(false);
        setWaterAdded(false);
        setDissolved(false);
        setSpatulaLoaded(false);

        // Start pH near the target but with a random offset
        const error = (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.25);
        setCurrentPH(buffer.targetpH + error);
        setCapacityData([]);
        setTitrantAdded(0);
        setAcidMoles(10);
        setBaseMoles(10);
    };

    const handleSpatulaToBalance = () => {
        if (!spatulaLoaded || !selectedBuffer) return;

        const target = activeComponent === "acid" ? selectedBuffer.acidMass : selectedBuffer.baseMass;
        const remaining = target - currentMass;

        let added = 0;
        if (remaining > 0.2) added = 0.15 + Math.random() * 0.05;
        else if (remaining > 0.05) added = 0.04 + Math.random() * 0.02;
        else added = remaining; // final snap

        const newMass = parseFloat((currentMass + added).toFixed(4));
        setCurrentMass(newMass);
        setSpatulaLoaded(false);

        if (newMass >= target - 0.005) {
            if (activeComponent === "acid") {
                setAcidMassWeighed(newMass);
            } else {
                setBaseMassWeighed(newMass);
                setTimeout(() => setIsWeighingComplete(true), 1000);
            }
        }
    };

    const adjustPH = (type: "acid" | "base") => {
        if (!electrodeInserted || !selectedBuffer) return;
        const increment = type === "acid" ? -0.02 : 0.02;
        setCurrentPH((prev) => {
            const newPH = prev + increment;
            if (Math.abs(newPH - selectedBuffer.targetpH) <= 0.01) {
                setPHAdjusted(true);
            }
            return newPH;
        });
    };

    const testCapacity = (type: "acid" | "base") => {
        if (!selectedBuffer) return;
        setTitrantAdded((prev) => prev + 1);
        const addedMoles = 1;
        let newAcidM = acidMoles;
        let newBaseM = baseMoles;

        if (type === "acid") {
            newAcidM += addedMoles;
            newBaseM -= addedMoles;
        } else {
            newAcidM -= addedMoles;
            newBaseM += addedMoles;
        }
        if (newBaseM <= 0.1) newBaseM = 0.1;
        if (newAcidM <= 0.1) newAcidM = 0.1;

        setAcidMoles(newAcidM);
        setBaseMoles(newBaseM);

        const newPH = selectedBuffer.pKa + Math.log10(newBaseM / newAcidM);
        setCapacityData((prev) => [
            ...prev,
            { titrantVol: titrantAdded + 1, pH: parseFloat(newPH.toFixed(2)) },
        ]);
    };

    const generatePDF = () => {
        if (!selectedBuffer) return;
        const doc = new jsPDF();

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PharmaWallah", 20, 20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Virtual Laboratory Report", 20, 28);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Buffer Preparation & Validation", 20, 55);

        doc.setDrawColor(200, 200, 200);
        doc.line(20, 60, 190, 60);

        // Section 1
        doc.setFontSize(14);
        doc.text("1. System Specifications", 20, 75);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setFillColor(245, 247, 250);
        doc.rect(20, 80, 170, 35, "F");
        doc.text(`Buffer: ${selectedBuffer.name}`, 25, 90);
        doc.text(`Target pH: ${selectedBuffer.targetpH}`, 120, 90);
        doc.text(`Acid: ${selectedBuffer.acidComponent}`, 25, 100);
        doc.text(`Base: ${selectedBuffer.baseComponent}`, 120, 100);
        doc.text(`Final Volume: ${selectedBuffer.targetVolume} mL`, 25, 110);

        // Section 2
        doc.setFont("helvetica", "bold");
        doc.text("2. Gravimetric Data", 20, 135);
        doc.setFont("helvetica", "normal");
        doc.rect(20, 140, 170, 30);
        doc.text(`Acid Weighed: ${acidMassWeighed.toFixed(4)} g`, 25, 150);
        doc.text(`Target Acid: ${selectedBuffer.acidMass.toFixed(4)} g`, 120, 150);
        doc.text(`Base Weighed: ${baseMassWeighed.toFixed(4)} g`, 25, 160);
        doc.text(`Target Base: ${selectedBuffer.baseMass.toFixed(4)} g`, 120, 160);

        // Section 3
        doc.setFont("helvetica", "bold");
        doc.text("3. pH Verification", 20, 185);
        doc.setFont("helvetica", "normal");
        doc.rect(20, 190, 170, 35);
        doc.text("Henderson-Hasselbalch:", 25, 200);
        doc.setFont("courier", "normal");
        doc.text(`pH = ${selectedBuffer.pKa} + log(${selectedBuffer.baseConc}/${selectedBuffer.acidConc}) = ${selectedBuffer.targetpH}`, 30, 210);
        doc.setFont("helvetica", "bold");
        doc.text(`Adjusted pH: ${currentPH.toFixed(2)}`, 25, 220);

        // Capacity data
        if (capacityData.length > 0) {
            doc.addPage();
            doc.setFont("helvetica", "bold");
            doc.text("4. Buffer Capacity Log", 20, 20);
            doc.setFont("helvetica", "normal");
            let yOffset = 30;
            capacityData.forEach((d) => {
                doc.text(`${d.titrantVol} mL titrant added`, 25, yOffset);
                doc.text(`pH = ${d.pH}`, 120, yOffset);
                yOffset += 8;
            });
        }

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated by PharmaWallah Lab Simulator", 20, 285);

        doc.save(`PharmaWallah_Report_${selectedBuffer.name.replace(/\s+/g, "_")}.pdf`);
    };

    // ────────────── RENDER HELPERS ──────────────

    const renderTutorial = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto"
        >
            <div className="text-center mb-6">
                <div className="text-5xl md:text-6xl mb-4">{TUTORIAL_SLIDES[slide].emoji}</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{TUTORIAL_SLIDES[slide].title}</h2>
            </div>
            <div className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                {TUTORIAL_SLIDES[slide].text.split("\n").map((line, i) => (
                    <p key={i} className="mb-2">
                        {line.includes("**") ? (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                                }}
                            />
                        ) : (
                            line
                        )}
                    </p>
                ))}
            </div>

            <div className="flex justify-between items-center border-t pt-4 md:pt-6">
                <button
                    onClick={() => setSlide((s) => Math.max(0, s - 1))}
                    disabled={slide === 0}
                    className="p-2 md:p-3 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-30"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-2">
                    {TUTORIAL_SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${i === slide ? "bg-blue-600" : "bg-gray-200"
                                }`}
                        />
                    ))}
                </div>
                {slide === TUTORIAL_SLIDES.length - 1 ? (
                    <button
                        onClick={() => setPhase("quiz")}
                        className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
                    >
                        Start Quiz
                    </button>
                ) : (
                    <button
                        onClick={() => setSlide((s) => Math.min(TUTORIAL_SLIDES.length - 1, s + 1))}
                        className="p-2 md:p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </motion.div>
    );

    const renderQuiz = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto"
        >
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Knowledge Check</h2>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Q {quizStep + 1} / {QUIZ_QUESTIONS.length}
                </span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 font-medium">
                {QUIZ_QUESTIONS[quizStep].q}
            </p>
            <div className="space-y-3 md:space-y-4">
                {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => {
                    const isCorrectAns = i === QUIZ_QUESTIONS[quizStep].ans;
                    let btnClass =
                        "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
                    if (quizFeedback === "correct" && isCorrectAns)
                        btnClass = "bg-green-100 border-green-500 text-green-800";
                    if (quizFeedback === "incorrect" && !isCorrectAns)
                        btnClass = "bg-red-50 border-red-200 text-red-500 opacity-50";
                    if (quizFeedback === "incorrect" && isCorrectAns)
                        btnClass = "bg-green-50 border-green-300 text-green-700";

                    return (
                        <button
                            key={i}
                            onClick={() => handleQuizAnswer(i)}
                            disabled={quizFeedback !== null}
                            className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 text-sm md:text-base ${btnClass}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
            <div className="mt-6 h-12">
                <AnimatePresence>
                    {quizFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`p-3 rounded-xl flex items-center justify-center font-bold text-sm ${quizFeedback === "correct"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            {quizFeedback === "correct" ? (
                                <CheckCircle2 className="mr-2" size={18} />
                            ) : (
                                <AlertCircle className="mr-2" size={18} />
                            )}
                            <span>{quizFeedback === "correct" ? "Correct!" : "Incorrect."}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    const renderSimStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Select a Buffer System</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                    Choose a buffer to prepare in the virtual lab.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {BUFFER_PRESETS.map((buf, i) => (
                    <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={i}
                        onClick={() => startSimulation(buf)}
                        className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-xl transition-all group"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-green-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                            <FlaskConical size={32} className="md:w-10 md:h-10" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{buf.name}</h3>
                        <div className="w-full h-px bg-gray-100 my-3 md:my-4" />
                        <div className="text-xs md:text-sm text-gray-600 space-y-2 w-full text-left bg-gray-50 p-3 rounded-lg">
                            <p className="flex justify-between">
                                <span>Target pH:</span>{" "}
                                <strong className="text-blue-600">{buf.targetpH}</strong>
                            </p>
                            <p className="flex justify-between">
                                <span>Acid:</span> <strong>{buf.acidComponent}</strong>
                            </p>
                            <p className="flex justify-between">
                                <span>Base:</span> <strong>{buf.baseComponent}</strong>
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );

    const renderSimStep2 = () => {
        const targetMass =
            activeComponent === "acid" ? selectedBuffer?.acidMass : selectedBuffer?.baseMass;
        const currentCompName =
            activeComponent === "acid"
                ? selectedBuffer?.acidComponent
                : selectedBuffer?.baseComponent;

        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Scale className="mr-3 text-blue-600" size={24} />
                    {mode === "weigh" ? "Gravimetric Preparation" : "Dilution & Dissolution"}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Work Area */}
                    <div className="lg:col-span-8 relative h-[380px] md:h-[450px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                        {mode === "weigh" ? (
                            <div className="w-full h-full relative flex flex-col items-center justify-center">
                                {/* Chemical Bottle */}
                                <div
                                    className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 cursor-pointer group z-10"
                                    onClick={() => setSpatulaLoaded(true)}
                                >
                                    <svg
                                        width="80"
                                        height="120"
                                        viewBox="0 0 120 180"
                                        className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all group-active:scale-95 max-w-[70px] md:max-w-none"
                                    >
                                        <path
                                            d="M20 60 Q20 40 40 40 L80 40 Q100 40 100 60 L100 170 Q100 180 90 180 L30 180 Q20 180 20 170 Z"
                                            fill="#ffffff"
                                            stroke="#cbd5e1"
                                            strokeWidth="4"
                                        />
                                        <rect x="35" y="10" width="50" height="30" rx="4" fill="#3b82f6" />
                                        <rect x="45" y="40" width="30" height="10" fill="#e2e8f0" />
                                        <rect
                                            x="25"
                                            y="80"
                                            width="70"
                                            height="60"
                                            rx="4"
                                            fill="#f8fafc"
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                        />
                                        <text
                                            x="60"
                                            y="100"
                                            textAnchor="middle"
                                            fontSize="14"
                                            fontWeight="bold"
                                            fill="#0f172a"
                                        >
                                            {activeComponent.toUpperCase()}
                                        </text>
                                        <text
                                            x="60"
                                            y="120"
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="#475569"
                                        >
                                            {currentCompName}
                                        </text>
                                        {!spatulaLoaded && currentMass < (targetMass || 0) && (
                                            <circle
                                                cx="60"
                                                cy="90"
                                                r="25"
                                                fill="#3b82f6"
                                                className="animate-ping opacity-30"
                                            />
                                        )}
                                    </svg>
                                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow whitespace-nowrap">
                                        Tap to load spatula
                                    </div>
                                </div>

                                {/* Analytical Balance */}
                                <div className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 scale-[0.65] md:scale-100 origin-right">
                                    <svg
                                        width="200"
                                        height="180"
                                        viewBox="0 0 240 220"
                                        className="drop-shadow-xl"
                                    >
                                        <rect
                                            x="20"
                                            y="20"
                                            width="200"
                                            height="130"
                                            fill="#f1f5f9"
                                            opacity="0.4"
                                            stroke="#cbd5e1"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M10 150 L230 150 L240 210 L0 210 Z"
                                            fill="#e2e8f0"
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                        />
                                        <rect x="60" y="165" width="120" height="30" rx="4" fill="#020617" />
                                        <text
                                            x="120"
                                            y="186"
                                            textAnchor="middle"
                                            fill="#4ade80"
                                            fontSize="18"
                                            fontFamily="monospace"
                                            fontWeight="bold"
                                        >
                                            {currentMass.toFixed(4)} g
                                        </text>
                                        <ellipse cx="120" cy="110" rx="45" ry="15" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                                        <rect x="110" y="110" width="20" height="40" fill="#94a3b8" />
                                        <path
                                            d="M75 95 L165 95 L145 110 L95 110 Z"
                                            fill="#ffffff"
                                            stroke="#e2e8f0"
                                            strokeWidth="2"
                                        />
                                        {currentMass > 0 && (
                                            <ellipse
                                                cx="120"
                                                cy="100"
                                                rx={20 + (currentMass / (targetMass || 1)) * 20}
                                                ry={5 + (currentMass / (targetMass || 1)) * 5}
                                                fill={activeComponent === "acid" ? "#fcd34d" : "#bae6fd"}
                                            />
                                        )}
                                    </svg>
                                </div>

                                {/* Spatula */}
                                <motion.div
                                    drag
                                    dragConstraints={{ left: 0, right: 200, top: 0, bottom: 120 }}
                                    dragElastic={0.1}
                                    onDragEnd={(e, info) => {
                                        if (info.point.x > 160) {
                                            handleSpatulaToBalance();
                                        }
                                    }}
                                    className="absolute left-[80px] md:left-[150px] top-[40px] md:top-[100px] z-50 cursor-grab active:cursor-grabbing"
                                >
                                    <svg
                                        width="80"
                                        height="24"
                                        viewBox="0 0 140 40"
                                        className="drop-shadow-md"
                                    >
                                        <rect x="0" y="15" width="80" height="10" rx="5" fill="#ef4444" />
                                        <path
                                            d="M80 18 L130 18 Q140 20 130 22 L80 22 Z"
                                            fill="#cbd5e1"
                                            stroke="#94a3b8"
                                            strokeWidth="1"
                                        />
                                        {spatulaLoaded && (
                                            <ellipse
                                                cx="120"
                                                cy="17"
                                                rx="10"
                                                ry="4"
                                                fill={activeComponent === "acid" ? "#fcd34d" : "#bae6fd"}
                                            />
                                        )}
                                    </svg>
                                    {spatulaLoaded && (
                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shadow whitespace-nowrap">
                                            Drag to Balance
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        ) : (
                            /* Transfer mode */
                            <div className="w-full h-full relative flex flex-col items-center justify-center">
                                <div className="relative z-10 scale-[0.7] md:scale-100">
                                    <svg width="140" height="220" viewBox="0 0 180 260">
                                        <defs>
                                            <clipPath id="flaskClip">
                                                <path d="M75 20 L105 20 L105 120 Q105 140 140 180 A 60 60 0 0 1 40 180 Q75 140 75 120 Z" />
                                            </clipPath>
                                        </defs>
                                        <path
                                            d="M75 20 L105 20 L105 120 Q105 140 140 180 A 60 60 0 0 1 40 180 Q75 140 75 120 Z"
                                            fill="rgba(255,255,255,0.8)"
                                            stroke="#94a3b8"
                                            strokeWidth="4"
                                        />
                                        <line x1="65" y1="80" x2="115" y2="80" stroke="#ef4444" strokeWidth="3" />
                                        <text x="125" y="85" fontSize="12" fill="#ef4444" fontWeight="bold">
                                            {selectedBuffer?.targetVolume} mL
                                        </text>
                                        <g clipPath="url(#flaskClip)">
                                            <rect
                                                x="0"
                                                y={waterAdded ? 80 : 200}
                                                width="180"
                                                height="180"
                                                fill={dissolved ? "#bae6fd" : "#e0f2fe"}
                                                className="transition-all duration-[2000ms] ease-in-out"
                                            />
                                            {!dissolved && powderTransferred && (
                                                <g>
                                                    <circle cx="80" cy="220" r="15" fill="#fcd34d" opacity="0.9" />
                                                    <circle cx="100" cy="230" r="18" fill="#93c5fd" opacity="0.9" />
                                                </g>
                                            )}
                                        </g>
                                        {!powderTransferred && (
                                            <path
                                                d="M50 -20 L130 -20 L100 30 L80 30 Z"
                                                fill="rgba(255,255,255,0.9)"
                                                stroke="#cbd5e1"
                                                strokeWidth="2"
                                            />
                                        )}
                                    </svg>
                                </div>

                                {!powderTransferred && (
                                    <motion.div
                                        drag
                                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                                        onDragEnd={() => setPowderTransferred(true)}
                                        className="absolute top-2 right-2 md:top-10 md:right-20 cursor-grab drop-shadow-lg z-50"
                                    >
                                        <svg width="60" height="24" viewBox="0 0 80 40">
                                            <path
                                                d="M10 20 L70 20 L60 30 L20 30 Z"
                                                fill="#ffffff"
                                                stroke="#e2e8f0"
                                                strokeWidth="2"
                                            />
                                            <ellipse cx="40" cy="25" rx="20" ry="5" fill="#fcd34d" />
                                            <ellipse cx="45" cy="25" rx="15" ry="4" fill="#93c5fd" />
                                        </svg>
                                        <div className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded shadow mt-1 text-center">
                                            Drag to funnel
                                        </div>
                                    </motion.div>
                                )}

                                {powderTransferred && !waterAdded && (
                                    <motion.div
                                        drag
                                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                                        onDragEnd={() => setWaterAdded(true)}
                                        className="absolute top-2 left-2 md:top-10 md:left-20 cursor-grab drop-shadow-lg z-50"
                                    >
                                        <svg width="60" height="100" viewBox="0 0 80 140">
                                            <path
                                                d="M30 40 L50 40 L50 130 A 10 10 0 0 1 30 130 Z"
                                                fill="#60a5fa"
                                                opacity="0.8"
                                            />
                                            <path
                                                d="M40 40 L40 10 Q10 10 10 30"
                                                fill="none"
                                                stroke="#f1f5f9"
                                                strokeWidth="6"
                                            />
                                            <path
                                                d="M40 40 L40 10 Q10 10 10 30"
                                                fill="none"
                                                stroke="#cbd5e1"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                        <div className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded shadow mt-1 text-center">
                                            Drag to fill
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Instructions Panel */}
                    <div className="lg:col-span-4 flex flex-col space-y-4 text-sm md:text-base">
                        <div className="bg-blue-50 p-4 md:p-5 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-2 text-sm md:text-base">
                                Status Box
                            </h3>
                            <ul className="text-sm space-y-2 md:space-y-3 font-medium text-blue-800">
                                <li className="flex justify-between items-center">
                                    <span>Acid Weighed:</span>
                                    <span className="bg-white px-2 py-1 rounded border shadow-sm text-xs md:text-sm">
                                        {acidMassWeighed.toFixed(4)} / {selectedBuffer?.acidMass.toFixed(4)} g
                                    </span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Base Weighed:</span>
                                    <span className="bg-white px-2 py-1 rounded border shadow-sm text-xs md:text-sm">
                                        {baseMassWeighed.toFixed(4)} / {selectedBuffer?.baseMass.toFixed(4)} g
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex-grow flex flex-col justify-center">
                            {mode === "weigh" ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                                        <strong>Current Task:</strong> Weigh exactly{" "}
                                        <strong>{targetMass?.toFixed(4)} g</strong> of {currentCompName}.
                                        Tap the bottle to load the spatula, then drag the spatula to the balance.
                                    </div>

                                    {currentMass >= (targetMass || 0) - 0.005 &&
                                        activeComponent === "acid" && (
                                            <button
                                                onClick={() => {
                                                    setActiveComponent("base");
                                                    setCurrentMass(0);
                                                }}
                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm md:text-base"
                                            >
                                                Next: Weigh Base Component
                                            </button>
                                        )}
                                    {isWeighingComplete && (
                                        <button
                                            onClick={() => setMode("transfer")}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 text-sm md:text-base"
                                        >
                                            Proceed to Transfer
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                                        <strong>Current Task:</strong> Transfer powders to the volumetric
                                        flask, add water, and dissolve.
                                    </div>

                                    {waterAdded && !dissolved && (
                                        <button
                                            onClick={() => setDissolved(true)}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center shadow-md text-sm md:text-base"
                                        >
                                            <Activity className="mr-2" size={20} /> Sonicate / Dissolve
                                        </button>
                                    )}
                                    {dissolved && (
                                        <button
                                            onClick={() => setSimStep(3)}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm md:text-base"
                                        >
                                            Next: pH Adjustment
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSimStep3 = () => (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                <Activity className="mr-3 text-blue-600" size={24} /> Fine pH Adjustment
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Work Area */}
                <div className="relative h-[350px] md:h-[400px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                    {/* Beaker & Stirrer */}
                    <div className="absolute bottom-8 md:bottom-10 flex flex-col items-center scale-[0.7] md:scale-100">
                        <svg width="160" height="200" viewBox="0 0 160 200" className="z-10 relative">
                            <ellipse cx="80" cy="30" rx="60" ry="10" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                            <path
                                d="M20 30 L20 180 A 10 10 0 0 0 30 190 L130 190 A 10 10 0 0 0 140 180 L140 30"
                                fill="rgba(255,255,255,0.5)"
                                stroke="#cbd5e1"
                                strokeWidth="4"
                            />
                            <path d="M20 30 A 60 10 0 0 0 140 30" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                            <path d="M15 30 Q10 20 20 20 Q30 20 25 30" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                            <path
                                d="M22 80 L22 180 A 8 8 0 0 0 30 188 L130 188 A 8 8 0 0 0 138 180 L138 80 Z"
                                fill="#bae6fd"
                                opacity="0.8"
                            />
                            <ellipse cx="80" cy="80" rx="58" ry="8" fill="#7dd3fc" opacity="0.8" />
                            <g transform="translate(80, 182)">
                                <rect
                                    x="-20"
                                    y="-4"
                                    width="40"
                                    height="8"
                                    rx="4"
                                    fill="#ffffff"
                                    stroke="#94a3b8"
                                    strokeWidth="1"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0"
                                        to="360"
                                        dur="0.3s"
                                        repeatCount="indefinite"
                                    />
                                </rect>
                            </g>
                        </svg>
                        <svg width="200" height="40" viewBox="0 0 200 40" className="mt-[-10px] z-0">
                            <rect x="10" y="10" width="180" height="20" rx="5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                            <rect x="30" y="10" width="140" height="5" fill="#94a3b8" />
                        </svg>
                    </div>

                    {/* pH Probe */}
                    {!electrodeInserted ? (
                        <motion.div
                            drag
                            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                            dragElastic={0.2}
                            onDragEnd={() => setElectrodeInserted(true)}
                            className="absolute top-6 right-6 md:top-10 md:right-10 cursor-grab z-50 flex flex-col items-center drop-shadow-xl"
                        >
                            <svg width="40" height="160" viewBox="0 0 40 180">
                                <path d="M20 0 Q40 -20 20 -40" fill="none" stroke="#1e293b" strokeWidth="4" />
                                <rect x="12" y="0" width="16" height="140" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="8" />
                                <rect x="16" y="140" width="8" height="30" fill="rgba(56,189,248,0.3)" stroke="#94a3b8" strokeWidth="1" />
                                <circle cx="20" cy="175" r="5" fill="rgba(56,189,248,0.5)" stroke="#38bdf8" strokeWidth="1" />
                            </svg>
                            <div className="bg-white px-2 py-1 text-[10px] md:text-xs font-bold text-gray-600 rounded shadow mt-2">
                                Drag into Beaker
                            </div>
                        </motion.div>
                    ) : (
                        <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 z-20">
                            <svg width="40" height="240" viewBox="0 0 40 240">
                                <rect x="12" y="0" width="16" height="200" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="8" />
                                <rect x="16" y="200" width="8" height="30" fill="rgba(56,189,248,0.3)" stroke="#94a3b8" strokeWidth="1" />
                                <circle cx="20" cy="235" r="5" fill="rgba(56,189,248,0.5)" stroke="#38bdf8" strokeWidth="1" />
                            </svg>
                        </div>
                    )}

                    {/* pH Meter Display */}
                    {electrodeInserted && (
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-slate-800 p-3 md:p-4 rounded-xl shadow-2xl border-4 border-slate-700 flex flex-col items-center">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                pH Meter
                            </div>
                            <div className="bg-green-950 px-3 md:px-4 py-2 rounded-lg border-2 border-green-900 shadow-inner min-w-[100px] md:min-w-[120px] text-center">
                                <span className="font-mono text-3xl md:text-4xl font-bold text-green-400 tracking-widest drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
                                    {currentPH.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
                            Target pH: <span className="text-blue-600">{selectedBuffer?.targetpH.toFixed(2)}</span>
                        </h3>
                        <p className="text-sm text-slate-600 mb-6 px-2 md:px-4">
                            Insert the pH electrode, then carefully add drops of 0.1M HCl or NaOH to reach the
                            precise target pH (±0.01).
                        </p>

                        <div className="flex justify-center space-x-4 md:space-x-6 mb-6">
                            <button
                                disabled={!electrodeInserted || pHAdjusted}
                                onClick={() => adjustPH("acid")}
                                className="flex flex-col items-center p-3 md:p-4 bg-white rounded-2xl shadow-sm border-2 border-red-100 hover:border-red-400 hover:shadow-md disabled:opacity-50 transition-all active:scale-95 w-28 md:w-32"
                            >
                                <div className="w-14 h-16 md:w-16 md:h-20 bg-red-50 rounded-xl relative mb-2 md:mb-3 flex justify-center pt-3 border-2 border-red-200">
                                    <div className="w-5 h-3 md:w-6 md:h-3 bg-red-300 rounded absolute -top-3 border border-red-400" />
                                    <Droplet className="text-red-500 mt-2" size={28} />
                                </div>
                                <span className="font-bold text-red-600 text-xs md:text-sm">Add 0.1M HCl</span>
                            </button>

                            <button
                                disabled={!electrodeInserted || pHAdjusted}
                                onClick={() => adjustPH("base")}
                                className="flex flex-col items-center p-3 md:p-4 bg-white rounded-2xl shadow-sm border-2 border-blue-100 hover:border-blue-400 hover:shadow-md disabled:opacity-50 transition-all active:scale-95 w-28 md:w-32"
                            >
                                <div className="w-14 h-16 md:w-16 md:h-20 bg-blue-50 rounded-xl relative mb-2 md:mb-3 flex justify-center pt-3 border-2 border-blue-200">
                                    <div className="w-5 h-3 md:w-6 md:h-3 bg-blue-300 rounded absolute -top-3 border border-blue-400" />
                                    <Droplet className="text-blue-500 mt-2" size={28} />
                                </div>
                                <span className="font-bold text-blue-600 text-xs md:text-sm">Add 0.1M NaOH</span>
                            </button>
                        </div>

                        {pHAdjusted && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-xl mb-4 font-bold flex items-center justify-center border border-green-200 shadow-sm text-sm md:text-base">
                                    <CheckCircle2 className="mr-2" size={20} /> Target pH Achieved!
                                </div>
                                <button
                                    onClick={() => setSimStep(4)}
                                    className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                                >
                                    Proceed to Buffer Capacity Test
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSimStep4 = () => (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                <Activity className="mr-3 text-blue-600" size={24} /> Buffer Capacity (Titration)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Controls & Setup */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col items-center shadow-inner relative overflow-hidden h-[220px] md:h-[250px]">
                        <svg width="120" height="180" viewBox="0 0 140 200" className="absolute bottom-2 md:bottom-4 scale-75 md:scale-100">
                            <rect x="20" y="180" width="100" height="20" rx="4" fill="#94a3b8" />
                            <path d="M35 80 L35 180 A 5 5 0 0 0 40 185 L100 185 A 5 5 0 0 0 105 180 L105 80 Z" fill="none" stroke="#cbd5e1" strokeWidth="4" />
                            <line x1="30" y1="80" x2="110" y2="80" stroke="#cbd5e1" strokeWidth="4" />
                            <rect x="37" y="110" width="66" height="73" fill="#bae6fd" opacity="0.7" />
                            <rect x="65" y="0" width="10" height="60" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                            <polygon points="65,60 75,60 72,75 68,75" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                            <g transform="translate(70, 175)">
                                <ellipse cx="0" cy="0" rx="15" ry="4" fill="#fff" stroke="#ccc" strokeWidth="1">
                                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.2s" repeatCount="indefinite" />
                                </ellipse>
                            </g>
                        </svg>
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 font-mono text-xl md:text-2xl font-bold text-green-500 bg-slate-900 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border-2 border-slate-700 shadow-lg">
                            {capacityData.length > 0 ? capacityData[capacityData.length - 1].pH.toFixed(2) : currentPH.toFixed(2)}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 text-center font-medium">
                        Add strong acid or base to test the buffer's resistance.
                    </p>

                    <div className="flex space-x-3 md:space-x-4">
                        <button
                            onClick={() => testCapacity("acid")}
                            className="flex-1 py-3 md:py-4 bg-red-50 text-red-700 border-2 border-red-200 font-bold rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm active:scale-95 text-sm md:text-base"
                        >
                            +1 mL Acid
                        </button>
                        <button
                            onClick={() => testCapacity("base")}
                            className="flex-1 py-3 md:py-4 bg-blue-50 text-blue-700 border-2 border-blue-200 font-bold rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-sm active:scale-95 text-sm md:text-base"
                        >
                            +1 mL Base
                        </button>
                    </div>

                    {capacityData.length >= 6 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => setSimStep(5)}
                            className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg flex justify-center items-center"
                        >
                            Finish Lab & View Report <ChevronRight className="ml-2" />
                        </motion.button>
                    )}
                </div>

                {/* Graph Area */}
                <div className="lg:col-span-2 h-[350px] md:h-[450px] bg-white border-2 border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-4 text-center text-sm md:text-base">
                        Titration Curve (Buffer Capacity)
                    </h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={
                                    capacityData.length > 0
                                        ? capacityData
                                        : [{ titrantVol: 0, pH: currentPH }]
                                }
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="titrantVol"
                                    label={{
                                        value: "Titrant Added (mL)",
                                        position: "bottom",
                                        offset: 0,
                                        style: { fontWeight: "bold", fill: "#64748b" },
                                    }}
                                    tick={{ fill: "#64748b" }}
                                />
                                <YAxis
                                    domain={["auto", "auto"]}
                                    label={{
                                        value: "Measured pH",
                                        angle: -90,
                                        position: "insideLeft",
                                        style: { fontWeight: "bold", fill: "#64748b" },
                                    }}
                                    tick={{ fill: "#64748b" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                        fontWeight: "bold",
                                    }}
                                    labelStyle={{ color: "#64748b" }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="pH"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{
                                        r: 6,
                                        fill: "#3b82f6",
                                        strokeWidth: 3,
                                        stroke: "#fff",
                                    }}
                                    activeDot={{ r: 8 }}
                                    animationDuration={500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSimStep5 = () => (
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100 max-w-4xl w-full mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-green-400" />
            <div className="text-center mb-8 md:mb-10 mt-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner border-4 border-green-100">
                    <CheckCircle2 size={40} className="md:w-12 md:h-12" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    Lab Certification Complete
                </h2>
                <p className="text-gray-500 mt-2 md:mt-3 text-base md:text-lg">
                    Buffer preparation, pH adjustment, and capacity validation successful.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
                <div className="bg-slate-50 p-5 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center border-b pb-3">
                        <Scale className="mr-2 text-blue-500" size={20} /> Preparation Summary
                    </h3>
                    <ul className="space-y-3 md:space-y-4 text-slate-600 font-medium text-sm md:text-base">
                        <li className="flex justify-between items-center">
                            <span>Buffer System:</span>
                            <strong className="text-slate-900 bg-white px-3 py-1 rounded shadow-sm border">
                                {selectedBuffer?.name}
                            </strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Target pH:</span>
                            <strong className="text-slate-900 bg-white px-3 py-1 rounded shadow-sm border">
                                {selectedBuffer?.targetpH}
                            </strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Final pH Achieved:</span>
                            <strong className="text-green-600 bg-green-50 px-3 py-1 rounded shadow-sm border border-green-200">
                                {currentPH.toFixed(2)}
                            </strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Acid Weighed:</span>
                            <strong className="text-slate-900">{acidMassWeighed.toFixed(4)} g</strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Base Weighed:</span>
                            <strong className="text-slate-900">{baseMassWeighed.toFixed(4)} g</strong>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-50 p-5 md:p-8 rounded-2xl border-2 border-blue-100 shadow-sm">
                    <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-4 md:mb-6 flex items-center border-b border-blue-200 pb-3">
                        <Activity className="mr-2 text-blue-500" size={20} /> Theoretical Verification
                    </h3>
                    <div className="bg-white p-3 md:p-4 rounded-xl border border-blue-100 shadow-sm mb-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                            Henderson-Hasselbalch
                        </p>
                        <p className="font-mono text-blue-800 mb-2 text-sm md:text-base">
                            pH = pKa + log([A⁻]/[HA])
                        </p>
                        <p className="font-mono text-blue-800 text-sm md:text-base">
                            pH = {selectedBuffer?.pKa} + log({selectedBuffer?.baseConc}/{selectedBuffer?.acidConc})
                        </p>
                    </div>
                    <div className="bg-white p-3 md:p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                        <span className="font-bold text-slate-600 text-sm md:text-base">Calculated Ideal pH:</span>
                        <span className="font-extrabold text-blue-700 text-xl md:text-2xl">
                            {selectedBuffer?.targetpH}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <button
                    onClick={generatePDF}
                    className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm md:text-lg w-full sm:w-auto"
                >
                    <Download className="mr-2 md:mr-3" size={20} /> Download Report
                </button>
                <button
                    onClick={() => setSimStep(1)}
                    className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm md:text-lg w-full sm:w-auto"
                >
                    <PlayCircle className="mr-2 md:mr-3" size={20} /> Start New Buffer Lab
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 md:pb-24 selection:bg-blue-200">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white font-extrabold shadow-md text-sm md:text-lg">
                            P
                        </div>
                        <span className="text-lg md:text-2xl font-extrabold tracking-tight text-slate-800">
                            Pharma<span className="text-blue-600">Wallah</span> Labs
                        </span>
                    </div>
                    <div className="flex space-x-1 md:space-x-3 text-xs md:text-sm font-bold bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setPhase("tutorial")}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "tutorial" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                                }`}
                        >
                            Theory
                        </button>
                        <button
                            onClick={() => setPhase("quiz")}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "quiz" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                                }`}
                        >
                            Quiz
                        </button>
                        <button
                            onClick={() => setPhase("simulation")}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all ${phase === "simulation" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                                }`}
                        >
                            Simulation
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-10">
                <AnimatePresence mode="wait">
                    {phase === "tutorial" && (
                        <motion.div key="tutorial">{renderTutorial()}</motion.div>
                    )}
                    {phase === "quiz" && (
                        <motion.div key="quiz">{renderQuiz()}</motion.div>
                    )}
                    {phase === "simulation" && (
                        <motion.div key="sim" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                            {/* Stepper */}
                            {simStep < 5 && (
                                <div className="flex items-center justify-between bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto max-w-4xl mx-auto">
                                    {[
                                        "Select System",
                                        "Weigh & Transfer",
                                        "pH Adjustment",
                                        "Capacity Test",
                                    ].map((label, idx) => {
                                        const isActive = simStep === idx + 1;
                                        const isPassed = simStep > idx + 1;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center whitespace-nowrap px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex-1 justify-center ${isActive
                                                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                        : isPassed
                                                            ? "text-slate-600"
                                                            : "text-slate-400"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-2 text-xs transition-colors ${isActive
                                                            ? "bg-blue-600 text-white shadow-md"
                                                            : isPassed
                                                                ? "bg-slate-800 text-white"
                                                                : "bg-slate-200 text-slate-500"
                                                        }`}
                                                >
                                                    {isPassed ? <CheckCircle2 size={14} /> : idx + 1}
                                                </div>
                                                <span className="hidden sm:inline">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="max-w-5xl mx-auto">
                                {simStep === 1 && renderSimStep1()}
                                {simStep === 2 && renderSimStep2()}
                                {simStep === 3 && renderSimStep3()}
                                {simStep === 4 && renderSimStep4()}
                                {simStep === 5 && renderSimStep5()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}