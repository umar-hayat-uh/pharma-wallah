"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
    CheckCircle,
    AlertCircle,
    X,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    Download,
    FlaskConical,
    Droplets,
    Calculator,
    Beaker,
    FileText,
    Zap,
    ArrowRight,
    ArrowLeft,
    BookOpen,
    HelpCircle,
    Pipette,
    Info,
    Star,
    Clock,
    Menu,
    Trophy,
} from "lucide-react";
import jsPDF from "jspdf";

// ────────────────────────────────────────────────
// TYPES & PRESETS
// ────────────────────────────────────────────────

interface Problem {
    compound: string;
    formula: string;
    stockConc: number; // mol/L
    targetConc: number; // mol/L
    targetVol: number; // mL
    color: string;
}

const PRESETS: Problem[] = [
    { compound: "Sodium chloride", formula: "NaCl", stockConc: 5, targetConc: 0.5, targetVol: 250, color: "#2563eb" },
    { compound: "Sodium hydroxide", formula: "NaOH", stockConc: 2, targetConc: 0.1, targetVol: 500, color: "#16a34a" },
    { compound: "Hydrochloric acid", formula: "HCl", stockConc: 6, targetConc: 1, targetVol: 200, color: "#dc2626" },
    { compound: "Glucose", formula: "C₆H₁₂O₆", stockConc: 1, targetConc: 0.05, targetVol: 100, color: "#ea580c" },
    { compound: "Potassium permanganate", formula: "KMnO₄", stockConc: 0.5, targetConc: 0.02, targetVol: 300, color: "#7c3aed" },
];

const TUTORIAL_SLIDES = [
    {
        title: "Why Dilute?",
        text: "In the lab, we often need lower concentrations from a stock solution. Dilution adds solvent while keeping the amount of solute constant.",
        icon: "🧪",
        color: "from-blue-600 to-cyan-500",
    },
    {
        title: "The Dilution Equation",
        text: "C₁V₁ = C₂V₂\nC₁ = stock concentration, V₁ = volume of stock needed\nC₂ = target concentration, V₂ = target final volume",
        icon: "📐",
        color: "from-purple-600 to-pink-500",
    },
    {
        title: "Volumetric Glassware",
        text: "Use a volumetric flask for precise final volume. A pipette measures the stock solution accurately.",
        icon: "⚗️",
        color: "from-green-600 to-emerald-500",
    },
    {
        title: "Technique",
        text: "1. Pipette the calculated stock volume.\n2. Transfer to flask.\n3. Add solvent until the meniscus touches the calibration mark.\n4. Stopper and invert to mix.",
        icon: "💧",
        color: "from-amber-500 to-orange-500",
    },
];

const QUIZ_QUESTIONS = [
    {
        q: "What does the dilution equation C₁V₁ = C₂V₂ represent?",
        opts: ["Conservation of mass", "Constant moles of solute", "Ideal gas law", "Beer-Lambert law"],
        correct: 1,
        explanation: "The moles of solute remain constant: moles = C × V.",
    },
    {
        q: "Which glassware provides the most precise final volume?",
        opts: ["Beaker", "Graduated cylinder", "Volumetric flask", "Erlenmeyer flask"],
        correct: 2,
        explanation: "Volumetric flasks are calibrated to contain a specific volume with high accuracy.",
    },
    {
        q: "What is the correct order of steps?",
        opts: ["Pipette → Top up → Transfer → Mix", "Pipette → Transfer → Top up → Mix", "Transfer → Pipette → Top up → Mix", "Mix → Pipette → Transfer → Top up"],
        correct: 1,
        explanation: "First pipette the stock, then transfer it to the flask, then add solvent to the mark, and finally mix.",
    },
    {
        q: "Why should you avoid overshooting the calibration mark?",
        opts: ["It changes the concentration unpredictably", "It wastes solvent", "It causes the flask to overflow", "It breaks the glass"],
        correct: 0,
        explanation: "Once you overshoot, the final volume is no longer exact, making the concentration inaccurate.",
    },
];

const GRAD = "from-blue-600 to-green-400";

// ────────────────────────────────────────────────
// CUSTOM SVG COMPONENTS
// ────────────────────────────────────────────────

function PipetteSVG({ fillPercent, color }: { fillPercent: number; color: string }) {
    const liquidH = Math.max(0, Math.min(140, fillPercent * 140));
    const liquidY = 165 - liquidH;
    return (
        <svg viewBox="0 0 50 200" width="70" height="180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pipGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d1d5db" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
            </defs>
            <ellipse cx="25" cy="12" rx="14" ry="8" fill="#cbd5e1" stroke="#9ca3af" strokeWidth="1" />
            <rect x="21" y="18" width="8" height="8" fill="#9ca3af" />
            <rect x="22.5" y="25" width="5" height="140" fill="url(#pipGlass)" stroke="#9ca3af" strokeWidth="0.8" />
            <rect x="23" y={liquidY} width="4" height={liquidH} fill={color} opacity="0.85"
                style={{ transition: "y 0.3s ease, height 0.3s ease" }} />
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((frac, i) => {
                const y = 165 - frac * 140;
                return <line key={i} x1="28" y1={y} x2="36" y2={y} stroke="#6b7280" strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />;
            })}
            <rect x="22" y="165" width="6" height="15" rx="1" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.8" />
            <polygon points="22,165 28,178 25,180 22,178" fill="#9ca3af" />
        </svg>
    );
}

function VolumetricFlaskSVG({ fillLevel, solutionColor, showStopper }: {
    fillLevel: number;
    solutionColor: string;
    showStopper: boolean;
}) {
    const maxY = 175;
    const minY = 35;
    const liquidHeight = maxY - minY;
    const currentY = maxY - liquidHeight * Math.min(fillLevel, 1);
    return (
        <svg viewBox="0 0 120 230" width="130" height="230" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="flaskGlass" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
                <clipPath id="flaskClip">
                    <path d="M42,18 L42,160 Q42,210 60,210 Q78,210 78,160 L78,18 Z" />
                </clipPath>
            </defs>
            <path d="M42,18 L42,160 Q42,210 60,210 Q78,210 78,160 L78,18 Z" fill="url(#flaskGlass)" stroke="#9ca3af" strokeWidth="1.2" />
            <rect x="44" y="14" width="32" height="40" fill="none" stroke="#9ca3af" strokeWidth="1.2" />
            <line x1="44" y1={minY} x2="76" y2={minY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" />
            <text x="82" y={minY + 4} fontSize="6" fill="#3b82f6" fontWeight="bold">{100} mL</text>
            <g clipPath="url(#flaskClip)">
                <rect x="42" y={currentY} width="36" height={maxY - currentY} fill={solutionColor} opacity="0.8"
                    style={{ transition: "y 0.4s ease, height 0.4s ease" }} />
                <ellipse cx="60" cy={currentY + 1} rx="18" ry="2.5" fill="rgba(255,255,255,0.3)" />
            </g>
            {showStopper && (
                <g>
                    <rect x="56" y="2" width="8" height="14" rx="2" fill="#f87171" stroke="#dc2626" strokeWidth="0.8" />
                    <ellipse cx="60" cy="2" rx="10" ry="3" fill="#f87171" stroke="#dc2626" strokeWidth="0.8" />
                </g>
            )}
            <path d="M45,20 L45,155" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        </svg>
    );
}

function WashBottleSVG() {
    return (
        <svg viewBox="0 0 80 110" width="70" height="100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="washGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="50%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
            </defs>
            <rect x="20" y="25" width="40" height="65" rx="12" fill="url(#washGrad)" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="30" y="12" width="20" height="18" rx="4" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="32" y="10" width="16" height="8" rx="2" fill="#0ea5e9" />
            <path d="M40,10 L40,0" stroke="#0ea5e9" strokeWidth="2.5" />
            <circle cx="40" cy="-3" r="3" fill="#0ea5e9" />
            <rect x="25" y="40" width="30" height="20" rx="3" fill="white" opacity="0.9" />
            <text x="40" y="52" fontSize="5" textAnchor="middle" fill="#0369a1" fontWeight="bold">dH₂O</text>
        </svg>
    );
}

// ────────────────────────────────────────────────
// PDF GENERATOR
// ────────────────────────────────────────────────

const generateReportPDF = (
    problem: Problem,
    userStockVol: number,
    pipetteVol: number,
    finalVol: number,
    toppedUp: boolean,
    mixed: boolean,
    grade: string,
    score: number,
    timeTaken: number,
) => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const accent = [37, 99, 235] as [number, number, number];
    const accentGreen = [22, 163, 74] as [number, number, number];

    // Header
    doc.setFillColor(...accent);
    doc.rect(0, 0, W, 28, "F");
    doc.setFillColor(...accentGreen);
    doc.rect(0, 26, W, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PharmaWallah", 14, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Dilution Lab Report", 14, 22);
    doc.text(new Date().toLocaleString("en-PK"), W - 14, 14, { align: "right" });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Solution Preparation Report", 14, 40);

    // Task info card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 46, W - 28, 55, 3, 3, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Compound: ${problem.compound} (${problem.formula})`, 18, 54);
    doc.text(`Stock concentration: ${problem.stockConc} M`, 18, 63);
    doc.text(`Target concentration: ${problem.targetConc} M`, 18, 72);
    doc.text(`Target final volume: ${problem.targetVol} mL`, 18, 81);
    doc.text(`Stock volume needed (calculated): ${problem.targetConc * problem.targetVol / problem.stockConc} mL`, 18, 90);
    doc.setFont("helvetica", "bold");
    doc.text(`Volume used: ${pipetteVol.toFixed(2)} mL`, 18, 99);

    // Verification
    const actualConc = (pipetteVol * problem.stockConc) / finalVol;
    const diff = Math.abs(actualConc - problem.targetConc);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Verification", 14, 112);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Final volume: ${finalVol} mL  |  Mixed: ${mixed ? "Yes" : "No"}`, 18, 120);
    doc.text(`Achieved concentration: ${actualConc.toFixed(4)} M`, 18, 128);
    doc.setFont("helvetica", "bold");
    doc.text(diff < 0.001 ? "✓ Accurate preparation!" : "✗ Deviation detected.", 18, 136);

    // Score & grade
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, 143, W - 28, 18, 3, 3, "F");
    doc.text(`Score: ${score}/500  |  Grade: ${grade}  |  Time: ${String(Math.floor(timeTaken / 60)).padStart(2, "0")}:${String(timeTaken % 60).padStart(2, "0")}`, 20, 153);

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(0, H - 18, W, 18, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text("Generated by PharmaWallah – Pakistan's #1 Pharmacy eLearning Platform", W / 2, H - 8, { align: "center" });
    doc.text("For educational purposes only.", W / 2, H - 4, { align: "center" });

    doc.save(`PharmaWallah_Dilution_${problem.compound.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
};

// ────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────

export default function DilutionLab() {
    // Phase & step state
    const [phase, setPhase] = useState<"tutorial" | "quiz" | "sim">("tutorial");
    const [tutSlide, setTutSlide] = useState(0);
    const [quizIdx, setQuizIdx] = useState(0);
    const [quizChosen, setQuizChosen] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    // Simulation state
    const [step, setStep] = useState(1); // 1-4
    const [problem, setProblem] = useState<Problem>(PRESETS[0]);
    const [userAnswer, setUserAnswer] = useState("");
    const [calculatedOk, setCalculatedOk] = useState(false);
    const [calculatedStockVol, setCalculatedStockVol] = useState<number | null>(null);
    const [pipetteVolume, setPipetteVolume] = useState(0);
    const [transferDone, setTransferDone] = useState(false);
    const [flaskFill, setFlaskFill] = useState(0); // 0-1 (fraction of target volume)
    const [isFilling, setIsFilling] = useState(false);
    const [toppedUp, setToppedUp] = useState(false);
    const [mixed, setMixed] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

    // Refs for drag targets
    const stockBottleRef = useRef<HTMLDivElement>(null);
    const flaskRef = useRef<HTMLDivElement>(null);
    const fillIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Derived
    const expectedStockVol = problem.targetConc * problem.targetVol / problem.stockConc;
    const totalVolume = (transferDone ? pipetteVolume : 0) + flaskFill * problem.targetVol;
    const grade = score >= 450 ? "A+" : score >= 400 ? "A" : score >= 350 ? "B" : score >= 250 ? "C" : "F";

    // Notification helper
    const notify = useCallback((msg: string, type: "success" | "error" | "info" = "info") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Scoring
    const addScore = useCallback((pts: number, reason?: string) => {
        setScore(p => Math.min(500, p + pts));
        if (reason) notify(`${reason} (+${pts} XP)`, "success");
    }, [notify]);

    const deductScore = useCallback((pts: number, reason: string) => {
        setScore(p => Math.max(0, p - pts));
        notify(`${reason} (−${pts} XP)`, "error");
    }, [notify]);

    // Timer
    useEffect(() => {
        if (!timerActive) return;
        const id = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(id);
    }, [timerActive]);

    useEffect(() => {
        if (phase === "sim" && step === 1) setTimerActive(true);
        else if (phase !== "sim") setTimerActive(false);
    }, [phase, step]);

    // Continuous fill when wash bottle is over flask (step 3)
    useEffect(() => {
        if (!isFilling || toppedUp) return;
        fillIntervalRef.current = setInterval(() => {
            setFlaskFill(prev => {
                const next = Math.min(1, prev + 0.02);
                if (next >= 1) {
                    setToppedUp(true);
                    setIsFilling(false);
                    addScore(75, "Meniscus reached the mark");
                    notify("Perfect! Meniscus exactly at the calibration mark.", "success");
                    return 1;
                }
                return next;
            });
        }, 100);
        return () => { if (fillIntervalRef.current) clearInterval(fillIntervalRef.current); };
    }, [isFilling, toppedUp, addScore, notify]);

    // Step 1: Validate calculation
    const handleCheckCalculation = () => {
        const val = parseFloat(userAnswer);
        if (isNaN(val)) {
            notify("Please enter a valid number.", "error");
            return;
        }
        if (Math.abs(val - expectedStockVol) <= 0.5) {
            setCalculatedStockVol(val);
            setCalculatedOk(true);
            addScore(50, "Correct calculation");
            notify(`Correct! You need ${val.toFixed(2)} mL.`, "success");
        } else {
            deductScore(20, "Incorrect calculation");
            notify(`Try again – remember C₁V₁ = C₂V₂. Expected ${expectedStockVol.toFixed(2)} mL.`, "error");
        }
    };

    // Step 2: Pipette volume check
    const handlePipetteCheck = () => {
        if (Math.abs(pipetteVolume - expectedStockVol) <= 0.2) {
            addScore(50, "Volume set correctly");
            notify("Pipette volume set accurately.", "success");
            setTransferDone(false); // ready to transfer
        } else {
            deductScore(10, "Wrong pipette volume");
            notify(`Adjust to the calculated value: ${expectedStockVol.toFixed(2)} mL.`, "error");
        }
    };

    // Step 3: Transfer (click button)
    const handleTransfer = () => {
        if (!transferDone && pipetteVolume > 0) {
            setTransferDone(true);
            setFlaskFill(pipetteVolume / problem.targetVol); // initial fill from stock
            addScore(50, "Stock transferred to flask");
            notify("Stock solution transferred!", "success");
        }
    };

    // Step 3: Top up instantly (button alternative)
    const handleTopUp = () => {
        if (!toppedUp) {
            setFlaskFill(1);
            setToppedUp(true);
            setIsFilling(false);
            addScore(50, "Flask topped up");
            notify("Flask filled to the mark.", "success");
        }
    };

    // Step 4: Mix
    const handleMix = () => {
        if (!mixed) {
            setMixed(true);
            addScore(50, "Solution mixed");
            notify("Solution homogeneous – lab complete!", "success");
        }
    };

    // Navigation
    const canAdvance = (): boolean => {
        switch (step) {
            case 1: return calculatedOk;
            case 2: return pipetteVolume > 0 && Math.abs(pipetteVolume - expectedStockVol) <= 0.2;
            case 3: return transferDone && toppedUp;
            case 4: return mixed;
            default: return false;
        }
    };

    const advanceStep = () => {
        if (step === 4 && mixed) {
            setReportVisible(true);
            return;
        }
        if (canAdvance()) setStep(s => s + 1);
        else notify("Complete the current step first.", "error");
    };

    const goBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    // New problem
    const handleNewProblem = () => {
        const newProblem = PRESETS[Math.floor(Math.random() * PRESETS.length)];
        setProblem(newProblem);
        setStep(1);
        setUserAnswer("");
        setCalculatedOk(false);
        setCalculatedStockVol(null);
        setPipetteVolume(0);
        setTransferDone(false);
        setFlaskFill(0);
        setIsFilling(false);
        setToppedUp(false);
        setMixed(false);
        setReportVisible(false);
        setScore(0);
        setTimer(0);
        setTimerActive(true);
    };

    // Draggable wash bottle handlers
    const handleWashBottleDrag = useCallback((_: any, info: PanInfo) => {
        if (step !== 3 || toppedUp) return;
        const flaskEl = flaskRef.current?.getBoundingClientRect();
        if (!flaskEl) return;
        const overFlask = info.point.x > flaskEl.left && info.point.x < flaskEl.right &&
            info.point.y > flaskEl.top && info.point.y < flaskEl.bottom;
        setIsFilling(overFlask && !toppedUp);
    }, [step, toppedUp]);

    const handleWashBottleDragEnd = useCallback(() => {
        setIsFilling(false);
    }, []);

    // ── Render helpers ──

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${s < step ? "bg-green-500 text-white" :
                            s === step ? "bg-blue-600 text-white" :
                                "bg-gray-200 text-gray-500"}`}>
                        {s}
                    </div>
                    {s < 4 && <div className={`h-1 w-8 rounded ${s < step ? "bg-green-500" : "bg-gray-200"}`} />}
                </div>
            ))}
        </div>
    );

    // ── Phase: Tutorial ──
    if (phase === "tutorial") {
        const slide = TUTORIAL_SLIDES[tutSlide];
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div key={tutSlide} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
                            <div className={`bg-gradient-to-r ${slide.color} rounded-2xl p-6 text-white mb-5`}>
                                <div className="text-5xl mb-3">{slide.icon}</div>
                                <h1 className="text-2xl font-extrabold mb-2">{slide.title}</h1>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{slide.text}</p>
                            <div className="flex justify-between items-center mt-8">
                                <button onClick={() => tutSlide > 0 && setTutSlide(t => t - 1)} disabled={tutSlide === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold disabled:opacity-30">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <span className="text-xs text-gray-400">{tutSlide + 1}/{TUTORIAL_SLIDES.length}</span>
                                {tutSlide < TUTORIAL_SLIDES.length - 1 ? (
                                    <button onClick={() => setTutSlide(t => t + 1)}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white font-bold`}>
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => setPhase("quiz")}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white font-bold`}>
                                        Take Quiz <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // ── Phase: Quiz ──
    if (phase === "quiz") {
        const q = QUIZ_QUESTIONS[quizIdx];
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
                    <AnimatePresence mode="wait">
                        {!quizDone ? (
                            <motion.div key={quizIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-8 max-w-xl mx-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                            style={{ width: `${((quizIdx) / QUIZ_QUESTIONS.length) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">Q{quizIdx + 1}/{QUIZ_QUESTIONS.length}</span>
                                </div>
                                <h2 className="text-lg font-bold mb-4">{q.q}</h2>
                                <div className="space-y-2">
                                    {q.opts.map((opt, i) => {
                                        const isAnswered = quizChosen !== null;
                                        const isCorrect = i === q.correct;
                                        const isChosen = quizChosen === i;
                                        let cls = "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";
                                        if (!isAnswered) cls += "border-gray-200 bg-gray-50 hover:border-indigo-300";
                                        else if (isCorrect) cls += "border-green-400 bg-green-50 text-green-800";
                                        else if (isChosen) cls += "border-red-400 bg-red-50 text-red-800";
                                        else cls += "border-gray-100 bg-gray-50 text-gray-400";
                                        return (
                                            <button key={i} className={cls} onClick={() => { if (!isAnswered) { setQuizChosen(i); if (i === q.correct) setQuizScore(s => s + 1); } }} disabled={isAnswered}>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {quizChosen !== null && (
                                    <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                                        <span className="font-bold">{quizChosen === q.correct ? "Correct! " : "Explanation: "}</span>
                                        {q.explanation}
                                    </div>
                                )}
                                {quizChosen !== null && (
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={() => {
                                            if (quizIdx < QUIZ_QUESTIONS.length - 1) { setQuizIdx(i => i + 1); setQuizChosen(null); }
                                            else setQuizDone(true);
                                        }} className={`flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold`}>
                                            {quizIdx < QUIZ_QUESTIONS.length - 1 ? "Next" : "Finish"} <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 max-w-md mx-auto text-center">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="text-xl font-bold mb-2">Quiz Complete!</h2>
                                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">{quizScore}/{QUIZ_QUESTIONS.length}</p>
                                <p className="text-gray-500 mt-2 mb-6">{quizScore === QUIZ_QUESTIONS.length ? "Perfect! You're ready." : "Good, let's practice."}</p>
                                <button onClick={() => { setPhase("sim"); setTimerActive(true); }}
                                    className={`px-6 py-3 rounded-xl bg-gradient-to-r ${GRAD} text-white font-bold shadow-md`}>
                                    Start Dilution Lab
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // ── Phase: Simulation ──
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 pt-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${GRAD} text-white`}><FlaskConical className="w-5 h-5" /></div>
                    <div>
                        <h1 className="text-sm font-extrabold text-gray-800">Dilution Lab</h1>
                        <p className="text-xs text-gray-500">Step {step} of 4: {["Calculate", "Pipette", "Dilute", "Mix & Report"][step - 1]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-mono font-bold">{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold">{score}/500</span>
                    </div>
                    <button onClick={handleNewProblem} className="p-2 rounded-xl hover:bg-gray-100"><RotateCcw className="w-5 h-5 text-gray-500" /></button>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`mx-4 mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border
              ${notification.type === "success" ? "bg-green-50 text-green-700 border-green-200" :
                                notification.type === "error" ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> :
                            notification.type === "error" ? <AlertCircle className="w-4 h-4" /> :
                                <Info className="w-4 h-4" />}
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step indicator */}
            <div className="py-4">
                <StepIndicator />
            </div>

            {/* Main content */}
            <div className="flex-1 px-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                        className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-8 max-w-3xl mx-auto">

                        {/* Step 1: Calculation */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-4">Step 1: Calculate Required Stock Volume</h2>
                                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        You have a <strong>{problem.stockConc} M</strong> stock solution of <strong>{problem.compound}</strong>.
                                        Prepare <strong>{problem.targetVol} mL</strong> of <strong>{problem.targetConc} M</strong> solution.
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-gray-700 mb-2">C₁ = {problem.stockConc} M  |  C₂ = {problem.targetConc} M  |  V₂ = {problem.targetVol} mL</p>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">V₁ (volume of stock needed, mL):</label>
                                <div className="flex items-center gap-3">
                                    <input type="number" value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                                        disabled={calculatedOk} className="border border-gray-200 rounded-xl px-4 py-2 w-40 focus:ring-2 focus:ring-blue-200 outline-none" />
                                    <button onClick={handleCheckCalculation} disabled={calculatedOk}
                                        className={`px-5 py-2 rounded-xl font-bold text-sm ${calculatedOk ? 'bg-green-100 text-green-700' : `bg-gradient-to-r ${GRAD} text-white`} disabled:opacity-50`}>
                                        {calculatedOk ? "✓ Correct" : "Check"}
                                    </button>
                                </div>
                                {calculatedOk && (
                                    <p className="mt-3 text-sm text-green-700 font-semibold">You need <strong>{calculatedStockVol?.toFixed(2)} mL</strong> of stock.</p>
                                )}
                            </div>
                        )}

                        {/* Step 2: Pipette the stock */}
                        {step === 2 && (
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-4">Step 2: Pipette the Stock Solution</h2>
                                <p className="text-gray-600 mb-4">Set the pipette volume to <strong>{calculatedStockVol?.toFixed(2)} mL</strong> using the slider.</p>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <PipetteSVG fillPercent={pipetteVolume / 25} color={problem.color} />
                                    <div className="flex-1 w-full">
                                        <input type="range" min="0" max="25" step="0.1" value={pipetteVolume}
                                            onChange={e => setPipetteVolume(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0 mL</span><span>{pipetteVolume.toFixed(1)} mL</span><span>25 mL</span>
                                        </div>
                                        <button onClick={handlePipetteCheck}
                                            disabled={Math.abs(pipetteVolume - (calculatedStockVol ?? 0)) <= 0.2}
                                            className={`mt-4 w-full py-2 rounded-xl font-bold text-sm ${Math.abs(pipetteVolume - (calculatedStockVol ?? 0)) <= 0.2 ? 'bg-green-100 text-green-700' : `bg-gradient-to-r ${GRAD} text-white`}`}>
                                            {Math.abs(pipetteVolume - (calculatedStockVol ?? 0)) <= 0.2 ? "✓ Volume Set" : "Check Volume"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Transfer & Dilute */}
                        {step === 3 && (
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-4">Step 3: Transfer to Volumetric Flask & Dilute</h2>
                                <div className="flex flex-col sm:flex-row gap-6 items-center">
                                    <div ref={flaskRef} className="relative">
                                        <VolumetricFlaskSVG fillLevel={flaskFill} solutionColor={problem.color} showStopper={false} />
                                        <p className="text-center text-xs text-gray-500 mt-1">{Math.round(totalVolume)} / {problem.targetVol} mL</p>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {!transferDone ? (
                                            <button onClick={handleTransfer}
                                                className={`w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r ${GRAD} text-white shadow-md`}>
                                                Transfer Stock to Flask
                                            </button>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-gray-700">Add solvent (distilled water) to reach the mark.</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[10, 50, 100].map(ml => (
                                                        <button key={ml} onClick={() => {
                                                            const newFill = Math.min(1, flaskFill + ml / problem.targetVol);
                                                            setFlaskFill(newFill);
                                                            if (newFill >= 1) { setToppedUp(true); addScore(30, "Top up"); }
                                                        }} disabled={toppedUp}
                                                            className="py-2 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 text-sm font-bold">
                                                            +{ml} mL
                                                        </button>
                                                    ))}
                                                    <button onClick={handleTopUp} disabled={toppedUp}
                                                        className="py-2 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-sm font-bold text-blue-700">
                                                        Top up to mark
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500 italic">Or drag the wash bottle over the flask:</div>
                                                <motion.div drag dragElastic={0.1} onDrag={handleWashBottleDrag} onDragEnd={handleWashBottleDragEnd}
                                                    className="cursor-grab active:cursor-grabbing mx-auto" style={{ touchAction: "none" }}>
                                                    <WashBottleSVG />
                                                </motion.div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Mix & Report */}
                        {step === 4 && (
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-800 mb-4">Step 4: Mix & Final Report</h2>
                                <div className="flex flex-col items-center gap-4 mb-6">
                                    <VolumetricFlaskSVG fillLevel={flaskFill} solutionColor={problem.color} showStopper={mixed} />
                                    {!mixed ? (
                                        <button onClick={handleMix}
                                            className={`px-6 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white font-bold shadow-md`}>
                                            Stopper & Invert to Mix
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                            <p className="text-green-700 font-bold">Solution Ready!</p>
                                        </div>
                                    )}
                                </div>
                                {mixed && (
                                    <div className="bg-blue-50 rounded-2xl p-4 text-sm space-y-1">
                                        <p><strong>Compound:</strong> {problem.compound} ({problem.formula})</p>
                                        <p><strong>Stock concentration:</strong> {problem.stockConc} M</p>
                                        <p><strong>Target:</strong> {problem.targetConc} M, {problem.targetVol} mL</p>
                                        <p><strong>Stock used:</strong> {pipetteVolume.toFixed(2)} mL</p>
                                        <p><strong>Final volume:</strong> {Math.round(totalVolume)} mL</p>
                                        <p><strong>Score:</strong> {score}/500 | <strong>Grade:</strong> {grade}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-7 border-t border-gray-200">
                            <button onClick={goBack} disabled={step === 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button onClick={advanceStep}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm ${step === 4 && mixed ? `bg-gradient-to-r ${GRAD} text-white shadow-md` : canAdvance() ? `bg-gradient-to-r ${GRAD} text-white shadow-md` : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                disabled={!canAdvance() && !(step === 4 && mixed)}>
                                {step === 4 ? "View Report" : "Next"} <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {reportVisible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden">
                            <div className={`bg-gradient-to-r ${GRAD} p-5 flex justify-between items-center`}>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Lab Report</h2>
                                    <p className="text-white/80 text-xs">{problem.compound} {problem.targetConc} M</p>
                                </div>
                                <button onClick={() => setReportVisible(false)} className="text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Score</span><span className="font-bold">{score}/500</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Grade</span><span className="font-bold">{grade}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Time</span><span className="font-mono">{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</span>
                                </div>
                                <button onClick={() => generateReportPDF(problem, expectedStockVol, pipetteVolume, Math.round(totalVolume), toppedUp, mixed, grade, score, timer)}
                                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${GRAD} text-white font-bold flex items-center justify-center gap-2 mt-4`}>
                                    <Download className="w-5 h-5" /> Download PDF Report
                                </button>
                                <button onClick={handleNewProblem} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold">
                                    New Problem
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}