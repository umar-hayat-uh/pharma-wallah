"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Pill,
    FlaskConical,
    Stethoscope,
    Microscope,
    Beaker,
    Leaf,
    ShoppingCart,
    RotateCw,
    Clock,
    AlertTriangle,
    CheckCircle,
    User,
} from "lucide-react";

// ── Background floating icons ────────────────────────────────────
const bgIcons = [
    { Icon: Pill, top: "6%", left: "2%", size: 32 },
    { Icon: Beaker, top: "25%", left: "1%", size: 28 },
    { Icon: Stethoscope, top: "55%", left: "1.5%", size: 30 },
    { Icon: Leaf, top: "78%", left: "2%", size: 26 },
    { Icon: Microscope, top: "8%", left: "95%", size: 32 },
    { Icon: FlaskConical, top: "35%", left: "96%", size: 28 },
    { Icon: Pill, top: "60%", left: "95%", size: 24 },
    { Icon: Leaf, top: "82%", left: "96%", size: 22 },
];

// ── Types ─────────────────────────────────────────────────────────
interface CounselingQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    rationale: string;
}

interface PrescriptionCase {
    id: string;
    patientName: string;
    patientAge: number;
    avatarSeed: { skin: string; hair: string; shirt: string };
    rxCursiveText: string;
    correctDrug: string;
    correctDose: string;
    correctFrequency: string;
    shelfItems: { id: string; name: string; dose: string; isLookAlike: boolean }[];
    counseling: CounselingQuestion[];
}

// ── Complete cases data ──────────────────────────────────────────
const PHARMACY_CASES: PrescriptionCase[] = [
    {
        id: "rx-001",
        patientName: "Mr. Ahmed",
        patientAge: 52,
        avatarSeed: { skin: "#fdba74", hair: "#9ca3af", shirt: "#2563eb" },
        rxCursiveText: "Metformin 500mg\nSig: 1 tab BD\n#30",
        correctDrug: "Metformin",
        correctDose: "500 mg",
        correctFrequency: "BD",
        shelfItems: [
            { id: "s1", name: "Metformin", dose: "500 mg", isLookAlike: false },
            { id: "s2", name: "Diazepam", dose: "5 mg", isLookAlike: true },
            { id: "s3", name: "Diltiazem", dose: "30 mg", isLookAlike: true },
            { id: "s4", name: "Metronidazole", dose: "400 mg", isLookAlike: false },
            { id: "s5", name: "Paracetamol", dose: "500 mg", isLookAlike: false },
        ],
        counseling: [
            {
                question: "How should Mr. Ahmed take this medicine?",
                options: ["On empty stomach", "With meals to reduce stomach upset", "At bedtime only", "Crush the tablet"],
                correctIndex: 1,
                rationale: "Metformin should be taken with meals to minimize GI side effects.",
            },
            {
                question: "What is a common side effect of Metformin?",
                options: ["Weight gain", "Dry cough", "Gastrointestinal discomfort", "Hair loss"],
                correctIndex: 2,
                rationale: "GI upset is the most common adverse effect of Metformin.",
            },
        ],
    },
    {
        id: "rx-002",
        patientName: "Mrs. Salma",
        patientAge: 48,
        avatarSeed: { skin: "#fed7aa", hair: "#1e293b", shirt: "#d946ef" },
        rxCursiveText: "Amlodipine 5mg\nSig: 1 tab daily\n#30",
        correctDrug: "Amlodipine",
        correctDose: "5 mg",
        correctFrequency: "OD",
        shelfItems: [
            { id: "s1", name: "Amlodipine", dose: "5 mg", isLookAlike: false },
            { id: "s2", name: "Atenolol", dose: "50 mg", isLookAlike: false },
            { id: "s3", name: "Enalapril", dose: "10 mg", isLookAlike: true },
            { id: "s4", name: "Furosemide", dose: "40 mg", isLookAlike: false },
            { id: "s5", name: "Atorvastatin", dose: "20 mg", isLookAlike: false },
        ],
        counseling: [
            {
                question: "When should Mrs. Salma take this medicine?",
                options: ["Morning", "Night", "After food", "Any time, but same time daily"],
                correctIndex: 3,
                rationale: "Amlodipine can be taken at any time of day, but consistency is important.",
            },
            {
                question: "Which side effect should be reported immediately?",
                options: ["Swollen ankles", "Dry mouth", "Increased appetite", "Hair loss"],
                correctIndex: 0,
                rationale: "Peripheral edema is a common side effect of calcium channel blockers and should be monitored.",
            },
        ],
    },
    {
        id: "rx-003",
        patientName: "Child Ayesha",
        patientAge: 6,
        avatarSeed: { skin: "#fcd34d", hair: "#78350f", shirt: "#f43f5e" },
        rxCursiveText: "Paracetamol 250mg/5ml syrup\nSig: 5ml TDS\n#60ml",
        correctDrug: "Paracetamol",
        correctDose: "250 mg/5ml",
        correctFrequency: "TDS",
        shelfItems: [
            { id: "s1", name: "Paracetamol Syrup", dose: "250 mg/5ml", isLookAlike: false },
            { id: "s2", name: "Ibuprofen Syrup", dose: "100 mg/5ml", isLookAlike: true },
            { id: "s3", name: "Cough Syrup", dose: "N/A", isLookAlike: false },
            { id: "s4", name: "Amoxicillin Susp", dose: "125 mg/5ml", isLookAlike: false },
            { id: "s5", name: "Cetirizine Syrup", dose: "5 mg/5ml", isLookAlike: false },
        ],
        counseling: [
            {
                question: "How should this syrup be stored?",
                options: ["Refrigerator", "Cool dry place", "Freezer", "Bathroom cabinet"],
                correctIndex: 1,
                rationale: "Store at room temperature in a cool, dry place away from direct sunlight.",
            },
            {
                question: "Maximum daily dose of paracetamol for a child?",
                options: ["1g", "2g", "According to weight", "4g"],
                correctIndex: 2,
                rationale: "Pediatric dosing is weight‑based to avoid hepatotoxicity.",
            },
        ],
    },
];

type GameStep = "intro" | "interpret" | "select" | "counsel" | "result";

// ── SVG Components ───────────────────────────────────────────────
const PillBottleSVG = ({ color = "#f97316", label = "Rx" }: { color?: string; label?: string }) => (
    <svg viewBox="0 0 60 90" className="w-12 h-16 drop-shadow-sm mx-auto">
        <rect x="15" y="0" width="30" height="12" rx="3" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="20" y="12" width="20" height="6" fill="#94a3b8" />
        <rect x="5" y="18" width="50" height="68" rx="8" fill={color} stroke="#b45309" strokeWidth="1.5" />
        <rect x="10" y="32" width="40" height="36" fill="#ffffff" rx="2" />
        <rect x="14" y="40" width="32" height="4" fill="#ef4444" />
        <text x="30" y="58" fontSize="14" textAnchor="middle" fontWeight="bold" fill="#1e293b">{label}</text>
    </svg>
);

const PatientSVG = ({ seed }: { seed: { skin: string; hair: string; shirt: string } }) => (
    <svg viewBox="0 0 120 160" className="w-32 h-44 drop-shadow-md">
        <circle cx="60" cy="50" r="28" fill={seed.skin} />
        <path d="M32 40 Q60 15 88 40 Q60 30 32 40" fill={seed.hair} />
        <circle cx="50" cy="48" r="3" fill="#1e293b" />
        <circle cx="70" cy="48" r="3" fill="#1e293b" />
        <path d="M52 64 Q60 70 68 64" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M20 120 Q60 90 100 120 L110 160 L10 160 Z" fill={seed.shirt} />
        <rect x="42" y="105" width="36" height="15" fill="#f8fafc" rx="2" stroke="#cbd5e1" />
        <text x="60" y="115" fontSize="8" textAnchor="middle" fill="#64748b" fontWeight="bold">VISITOR</text>
    </svg>
);

const PreceptorSVG = () => (
    <svg viewBox="0 0 120 160" className="w-24 h-32">
        <circle cx="60" cy="45" r="24" fill="#fed7aa" />
        <path d="M35 30 Q60 5 85 30" fill="#475569" />
        <rect x="44" y="38" width="32" height="10" fill="none" stroke="#1e293b" strokeWidth="1.5" rx="1" />
        <circle cx="50" cy="43" r="2" fill="#1e293b" />
        <circle cx="70" cy="43" r="2" fill="#1e293b" />
        <path d="M54 56 Q60 60 66 56" stroke="#1e293b" strokeWidth="2" fill="none" />
        <path d="M15 110 Q60 95 105 110 L115 160 L5 160 Z" fill="#0284c7" />
        <path d="M35 110 L60 160 L85 110" fill="#f8fafc" stroke="#cbd5e1" />
        <rect x="75" y="120" width="20" height="12" fill="#ef4444" rx="1" />
        <text x="85" y="129" fontSize="8" textAnchor="middle" fill="#ffffff" fontWeight="bold">RPh</text>
    </svg>
);

// ── Main Component ───────────────────────────────────────────────
export default function PharmacyCounterContent() {
    const [caseIndex, setCaseIndex] = useState(0);
    const currentCase = PHARMACY_CASES[caseIndex];

    const [step, setStep] = useState<GameStep>("intro");
    const [errorsCount, setErrorsCount] = useState(0);
    const [score, setScore] = useState(100);
    const [startTime, setStartTime] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [inputDrug, setInputDrug] = useState("");
    const [inputDose, setInputDose] = useState("");
    const [inputFreq, setInputFreq] = useState("");

    const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [preceptorFeedback, setPreceptorFeedback] = useState<string | null>(null);

    // Timer
    useEffect(() => {
        if (step !== "result" && step !== "intro") {
            const timer = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, startTime]);

    const startSimulation = () => {
        setStartTime(Date.now());
        setStep("interpret");
        setErrorsCount(0);
        setScore(100);
        setInputDrug("");
        setInputDose("");
        setInputFreq("");
        setSelectedShelfId(null);
        setCurrentQuestionIdx(0);
        setPreceptorFeedback(null);
    };

    const triggerPreceptorIntervention = (message: string) => {
        setErrorsCount(prev => prev + 1);
        setScore(prev => Math.max(10, prev - 15));
        setPreceptorFeedback(message);
        setTimeout(() => setPreceptorFeedback(null), 5000);
    };

    const handleVerifyInterpretation = () => {
        const checkDrug = inputDrug.trim().toLowerCase() === currentCase.correctDrug.toLowerCase();
        const checkDose = inputDose.trim().toLowerCase() === currentCase.correctDose.toLowerCase();
        if (!checkDrug) {
            triggerPreceptorIntervention("Incorrect drug name. Re‑examine the prescription carefully.");
            return;
        }
        if (!checkDose) {
            triggerPreceptorIntervention("Dosage strength does not match the script.");
            return;
        }
        setStep("select");
    };

    const handleShelfSelection = (itemId: string, itemName: string, itemDose: string) => {
        setSelectedShelfId(itemId);
        if (
            itemName.toLowerCase() === currentCase.correctDrug.toLowerCase() &&
            itemDose.toLowerCase() === currentCase.correctDose.toLowerCase()
        ) {
            setTimeout(() => setStep("counsel"), 800);
        } else {
            triggerPreceptorIntervention(
                "Look‑alike / Sound‑alike (LASA) or dose mismatch! Inspect labels carefully."
            );
        }
    };

    const handleCounselingAnswer = (optionIdx: number) => {
        const targetQuestion = currentCase.counseling[currentQuestionIdx];
        if (optionIdx === targetQuestion.correctIndex) {
            if (currentQuestionIdx + 1 < currentCase.counseling.length) {
                setCurrentQuestionIdx(prev => prev + 1);
            } else {
                setStep("result");
            }
        } else {
            triggerPreceptorIntervention(`Counseling Error: ${targetQuestion.rationale}`);
        }
    };

    const nextCaseInstance = () => {
        setCaseIndex(prev => (prev + 1) % PHARMACY_CASES.length);
        setStep("intro");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 font-sans pb-12 relative overflow-hidden">
            {/* Floating pharmacy icons */}
            {bgIcons.map(({ Icon, top, left, size }, i) => (
                <div key={i} className="absolute pointer-events-none text-blue-200/40 hidden md:block" style={{ top, left }}>
                    <Icon size={size} strokeWidth={1.4} />
                </div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-10 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Pharmacy Counter</h1>
                            <p className="text-sm text-gray-500">Objective Clinical Dispensing Simulation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="bg-white rounded-lg border border-gray-200 px-3 py-1.5 shadow-sm flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="font-mono font-bold">{elapsedTime}s</span>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 px-3 py-1.5 shadow-sm">
                            <span className="font-bold text-blue-600">{score}%</span>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 px-3 py-1.5 shadow-sm">
                            <span className="font-bold text-red-500">{errorsCount} err</span>
                        </div>
                    </div>
                </div>

                {/* Preceptor feedback popup */}
                <AnimatePresence>
                    {preceptorFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-red-50 border-2 border-red-300 text-red-800 p-4 rounded-2xl flex items-start gap-4 shadow-lg"
                        >
                            <div className="flex-shrink-0 bg-white p-1 rounded-lg border border-red-200">
                                <PreceptorSVG />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-600 uppercase text-sm">Pharmacist‑in‑Charge</h4>
                                <p className="text-sm mt-1">{preceptorFeedback}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main interactive area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Pharmacy scene */}
                    <section className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between relative overflow-hidden min-h-[350px]">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-green-400 opacity-80" />
                        <div className="flex flex-col items-center justify-center pt-6 flex-grow">
                            {step !== "result" && (
                                <motion.div
                                    key={currentCase.id}
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                    className="text-center"
                                >
                                    <PatientSVG seed={currentCase.avatarSeed} />
                                    <p className="mt-2 text-sm font-semibold text-gray-700">
                                        {currentCase.patientName} ({currentCase.patientAge}yo)
                                    </p>
                                </motion.div>
                            )}
                        </div>
                        <div className="bg-gradient-to-r from-blue-100 to-green-50 h-14 rounded-t-xl border border-gray-200 p-2 flex items-center justify-between shadow-inner">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider pl-2">
                                Consult Counter
                            </span>
                            <div className="flex gap-2">
                                {step !== "intro" && step !== "result" && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 text-xs font-bold text-amber-700">
                                        Rx Active
                                    </div>
                                )}
                                {selectedShelfId && step !== "result" && (
                                    <div className="transform scale-75">
                                        <PillBottleSVG color="#2563eb" label="Rx" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Right: Task panel */}
                    <section className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 flex flex-col">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Intro */}
                            {step === "intro" && (
                                <motion.div
                                    key="intro"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="h-full flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900">Patient Intake</h3>
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                            <blockquote className="border-l-4 border-blue-500 pl-4 text-blue-700 italic text-sm">
                                                "Hello, I need to get this prescription filled."
                                            </blockquote>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startSimulation}
                                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        Accept Prescription
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: Interpret */}
                            {step === "interpret" && (
                                <motion.div
                                    key="interpret"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-bold text-gray-900">Prescription Interpretation</h3>
                                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                        <span className="font-serif text-2xl font-bold text-amber-800">℞</span>
                                        <p className="font-serif italic text-lg text-gray-800 whitespace-pre-wrap mt-2">
                                            {currentCase.rxCursiveText}
                                        </p>
                                        <div className="border-t border-dashed border-amber-300 mt-3 pt-2 text-xs text-amber-700 font-mono">
                                            Provider: Dr. A. Khan · Date: Today
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Drug name"
                                            value={inputDrug}
                                            onChange={e => setInputDrug(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dose (e.g., 500mg)"
                                            value={inputDose}
                                            onChange={e => setInputDose(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <select
                                            value={inputFreq}
                                            onChange={e => setInputFreq(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none col-span-full sm:col-span-1"
                                        >
                                            <option value="">Select frequency</option>
                                            <option value="Once daily at bedtime">Once daily at bedtime</option>
                                            <option value="Twice daily with meals">Twice daily with meals</option>
                                            <option value="Three times daily">Three times daily</option>
                                            <option value="Every 4 to 6 hours as needed">Every 4‑6 hours PRN</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleVerifyInterpretation}
                                        className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                                    >
                                        Verify Interpretation
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 3: Select drug */}
                            {step === "select" && (
                                <motion.div
                                    key="select"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-bold text-gray-900">Select Medicine</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {currentCase.shelfItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleShelfSelection(item.id, item.name, item.dose)}
                                                className={`p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-1 ${selectedShelfId === item.id
                                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                                    : "border-gray-200 bg-white hover:border-blue-300"
                                                    }`}
                                            >
                                                <PillBottleSVG
                                                    color={item.isLookAlike ? "#b45309" : "#2563eb"}
                                                    label="Rx"
                                                />
                                                <span className="text-xs font-bold text-gray-800">{item.name}</span>
                                                <span className="text-[10px] text-gray-500">{item.dose}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                                        Required: <strong>{currentCase.correctDrug} {currentCase.correctDose}</strong>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: Counsel */}
                            {step === "counsel" && (
                                <motion.div
                                    key="counsel"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-lg font-bold text-gray-900">Patient Counseling</h3>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-600 to-green-400 transition-all"
                                            style={{ width: `${((currentQuestionIdx + 1) / currentCase.counseling.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {currentCase.counseling[currentQuestionIdx].question}
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {currentCase.counseling[currentQuestionIdx].options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleCounselingAnswer(idx)}
                                                    className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 5: Result */}
                            {step === "result" && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-5 text-center"
                                >
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                    <h3 className="text-xl font-bold text-gray-900">Dispensing Complete</h3>
                                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">
                                        {score}/100
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={startSimulation}
                                            className="px-6 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-400 transition-all"
                                        >
                                            Retry
                                        </button>
                                        <button
                                            onClick={nextCaseInstance}
                                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            Next Case
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>
            </div>
        </div>
    );
}