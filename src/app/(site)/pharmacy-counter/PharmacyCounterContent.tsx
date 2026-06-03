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
    Clock,
    AlertTriangle,
    CheckCircle,
    User,
    ShieldAlert,
    FileText,
    Tag,
    HelpCircle,
    UserCheck,
    ArrowRight,
    RotateCw,
    ChevronRight,
    Lightbulb,
    Info,
    X,
    Circle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Background Floating Icons
   ───────────────────────────────────────────── */
const bgIcons = [
    { Icon: Pill, top: "6%", left: "2%", size: 30, color: "text-blue-400/25", rotate: 12 },
    { Icon: Beaker, top: "25%", left: "1%", size: 26, color: "text-green-400/25", rotate: -8 },
    { Icon: Stethoscope, top: "55%", left: "1.5%", size: 28, color: "text-blue-500/20", rotate: 15 },
    { Icon: Leaf, top: "78%", left: "2%", size: 24, color: "text-green-400/25", rotate: -12 },
    { Icon: Microscope, top: "8%", left: "95%", size: 30, color: "text-blue-400/25", rotate: -10 },
    { Icon: FlaskConical, top: "35%", left: "96%", size: 26, color: "text-green-400/25", rotate: 8 },
    { Icon: Pill, top: "60%", left: "95%", size: 22, color: "text-blue-500/20", rotate: 6 },
    { Icon: Leaf, top: "82%", left: "96%", size: 20, color: "text-green-400/25", rotate: -6 },
];

/* ─────────────────────────────────────────────
   Types & Data
   ───────────────────────────────────────────── */
interface CounselingQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    rationale: string;
}

interface DurScreen {
    alertTitle: string;
    severity: "Moderate" | "Severe" | "Critical";
    description: string;
    correctAction: "override" | "call_doctor";
    rationale: string;
}

interface PrescriptionCase {
    id: string;
    patientName: string;
    patientDob: string;
    patientAge: number;
    allergies: string;
    currentMedications: string;
    avatarSeed: { skin: string; hair: string; shirt: string };
    rxCursiveText: string;
    correctDrug: string;
    correctDose: string;
    correctFrequency: string;
    correctQty: number;
    durAlert: DurScreen;
    shelfItems: { id: string; name: string; dose: string; form: string; isLookAlike: boolean }[];
    requiredAuxiliaryLabels: string[];
    availableAuxiliaryLabels: string[];
    counseling: CounselingQuestion[];
}

const PHARMACY_CASES: PrescriptionCase[] = [
    {
        id: "rx-2026-001",
        patientName: "David Miller",
        patientDob: "10/14/1974",
        patientAge: 51,
        allergies: "Sulfa Drugs",
        currentMedications: "Lisinopril 10mg, Atorvastatin 40mg",
        avatarSeed: { skin: "#fdba74", hair: "#4b5563", shirt: "#1e3a8a" },
        rxCursiveText: "Bactrim DS (800-160)\nSig: 1 tab PO BID x 10 days\nQty: 20 tabs\nRefills: 0",
        correctDrug: "Bactrim DS",
        correctDose: "800-160 mg",
        correctFrequency: "BID",
        correctQty: 20,
        durAlert: {
            alertTitle: "Critical Allergy Conflict Detected",
            severity: "Critical",
            description:
                "Patient profile displays a documented 'Sulfa Drugs' allergy. Sulfamethoxazole/Trimethoprim (Bactrim) cross-reactivity triggers severe hypersensitivity reactions.",
            correctAction: "call_doctor",
            rationale:
                "Never fill a systemic sulfonamide antibiotic for a patient with verified sulfa hypersensitivity. Call the physician to switch therapy lines.",
        },
        shelfItems: [
            { id: "s1", name: "Bactrim DS", dose: "800-160 mg", form: "Tablets", isLookAlike: false },
            { id: "s2", name: "Baclofen", dose: "10 mg", form: "Tablets", isLookAlike: true },
            {
                id: "s3",
                name: "Bactrim Regular Strength",
                dose: "400-80 mg",
                form: "Tablets",
                isLookAlike: true,
            },
            { id: "s4", name: "Ciprofloxacin", dose: "500 mg", form: "Tablets", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with food or milk",
            "Finish all of this medication unless otherwise directed",
            "Avoid prolonged exposure to sunlight",
            "May cause drowsiness",
        ],
        requiredAuxiliaryLabels: [
            "Finish all of this medication unless otherwise directed",
            "Avoid prolonged exposure to sunlight",
        ],
        counseling: [
            {
                question:
                    "What primary adherence counseling point applies to this short-course medication cycle?",
                options: [
                    "Stop taking immediately when acute indicators subside",
                    "Finish the entire continuous course to eradicate residual pathology and avoid resistance",
                    "Take double doses if you miss a scheduled application window",
                    "Store exclusively within localized deep freezing infrastructure",
                ],
                correctIndex: 1,
                rationale:
                    "Antibiotics must be completed fully to eliminate underlying infection pathways and prevent microbial resistance mutations.",
            },
        ],
    },
    {
        id: "rx-2026-002",
        patientName: "Clara Jenkins",
        patientDob: "03/22/1961",
        patientAge: 65,
        allergies: "NKA (No Known Allergies)",
        currentMedications: "Amlodipine 5mg, Sildenafil 50mg PRN",
        avatarSeed: { skin: "#fed7aa", hair: "#e5e7eb", shirt: "#047857" },
        rxCursiveText:
            "Isosorbide Mononitrate 30mg ER\nSig: 1 tab PO daily every morning\nQty: 30 tablets\nRefills: 3",
        correctDrug: "Isosorbide Mononitrate ER",
        correctDose: "30 mg",
        correctFrequency: "QD",
        correctQty: 30,
        durAlert: {
            alertTitle: "Severe Drug-Drug Interaction Warning",
            severity: "Critical",
            description:
                "Co-administration of organic nitrates (Isosorbide) and PDE5 Inhibitors (Sildenafil) triggers dangerous, life-threatening drops in blood pressure (severe hypotension).",
            correctAction: "call_doctor",
            rationale:
                "Nitrates mixed with PDE-5 inhibitors can induce catastrophic cardiovascular collapse. This fill requires immediate physician consultation.",
        },
        shelfItems: [
            {
                id: "cl1",
                name: "Isosorbide Mononitrate ER",
                dose: "30 mg",
                form: "Tablets",
                isLookAlike: false,
            },
            { id: "cl2", name: "Isosorbide Dinitrate", dose: "10 mg", form: "Tablets", isLookAlike: true },
            { id: "cl3", name: "Amlodipine", dose: "5 mg", form: "Tablets", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Do not crush or chew extended-release formulations",
            "May cause dizziness or fainting upon standing",
            "Avoid drinking alcohol while taking this medicine",
            "Keep stored in local refrigeration units",
        ],
        requiredAuxiliaryLabels: [
            "Do not crush or chew extended-release formulations",
            "May cause dizziness or fainting upon standing",
        ],
        counseling: [
            {
                question:
                    "How should the patient manage position modifications or sudden standing transitions?",
                options: [
                    "Jump up rapidly to stimulate micro-circulatory fluid feedback loops",
                    "Rise slowly from sitting or lying profiles to minimize orthostatic hypotension events",
                    "Consume a fast-acting glucose supplement prior to any muscle movement",
                    "Hold breath for thirty seconds upon standing to build pressure gradients",
                ],
                correctIndex: 1,
                rationale:
                    "Nitrates cause systemic vasodilation. Patients should change positions slowly to prevent postural dizziness or syncope.",
            },
        ],
    },
];

type GameStep = "intake" | "interpret" | "dur" | "select" | "labeling" | "counsel" | "result";

/* ─────────────────────────────────────────────
   Helper SVG Components
   ───────────────────────────────────────────── */
export function PillBottleSVG({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* 3D Amber Bottle Gradient */}
                <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#92400E" />
                    <stop offset="25%" stopColor="#D97706" />
                    <stop offset="60%" stopColor="#F59E0B" />
                    <stop offset="90%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* Plastic Cap Gradient */}
                <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="20%" stopColor="#FFFFFF" />
                    <stop offset="80%" stopColor="#E5E7EB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>

                {/* Label Gradient */}
                <linearGradient id="labelGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F3F4F6" />
                    <stop offset="10%" stopColor="#FFFFFF" />
                    <stop offset="90%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>

                {/* Subtle Shadow */}
                <filter id="pltShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Bottle Body */}
            <rect
                x="11" y="11" width="18" height="24" rx="3"
                fill="url(#bottleGrad)"
                filter="url(#pltShadow)"
            />

            {/* Inner Liquid/Pill Level Transparency Highlight (Optional Depth) */}
            <rect x="12" y="13" width="16" height="21" rx="2" fill="#FFFFFF" opacity="0.08" />

            {/* White Prescription Label */}
            <rect x="11" y="16" width="18" height="14" fill="url(#labelGrad)" />

            {/* Label Fake Text Lines */}
            <line x1="13" y1="19" x2="21" y2="19" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" />
            <line x1="13" y1="22" x2="27" y2="22" stroke="#D1D5DB" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="13" y1="25" x2="25" y2="25" stroke="#D1D5DB" strokeWidth="0.8" strokeLinecap="round" />

            {/* Warning Rx Block on Label */}
            <rect x="13" y="27" width="3" height="2" rx="0.5" fill="#EF4444" opacity="0.8" />

            {/* Bottle Neck Safety Ring */}
            <rect x="12" y="9" width="16" height="2" rx="0.5" fill="url(#capGrad)" />

            {/* Ridged Cap */}
            <rect x="10" y="4" width="20" height="6" rx="1.5" fill="url(#capGrad)" filter="url(#pltShadow)" />

            {/* Cap Vertical Ridges Texture */}
            <path d="
                M 12 5 L 12 9 M 14 5 L 14 9 M 16 5 L 16 9 M 18 5 L 18 9 
                M 20 5 L 20 9 M 22 5 L 22 9 M 24 5 L 24 9 M 26 5 L 26 9 M 28 5 L 28 9
            " stroke="#9CA3AF" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />

            {/* Specular Glow/Highlight running down the left side */}
            <path d="M 13 12 L 13 33" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
        </svg>
    );
}

export function PatientAvatar({ seed }: { seed: { skin: string; hair: string; shirt: string } }) {
    return (
        <svg
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16"
        >
            <defs>
                {/* Global drop shadow for realism */}
                <filter id="avatarShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.12" />
                </filter>
                {/* Clip path to keep shirt and clothing perfectly inside the avatar bounds */}
                <clipPath id="avatarClip">
                    <circle cx="28" cy="28" r="26" />
                </clipPath>
            </defs>

            {/* Optional Background Circle to anchor the avatar */}
            <circle cx="28" cy="28" r="26" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1" />

            <g clipPath="url(#avatarClip)">
                {/* Neck */}
                <rect x="23" y="30" width="10" height="10" rx="2" fill={seed.skin} />
                {/* Neck Shadow (Under Chin) */}
                <path d="M 23 32 C 23 32, 28 35, 33 32 L 33 35 L 23 35 Z" fill="#000000" opacity="0.12" />

                {/* Torso / Realistic Curved Shoulders */}
                <path
                    d="M 6 48 C 6 41.5, 13 38, 28 38 C 43 38, 50 41.5, 50 48 L 50 58 L 6 58 Z"
                    fill={seed.shirt}
                />

                {/* Shirt Collar / Depth Shadow */}
                <path d="M 22 38 C 22 38, 28 42, 34 38" stroke="#000000" strokeWidth="1.5" opacity="0.15" strokeLinecap="round" />

                {/* Head (Anatomically proportioned) */}
                <circle cx="28" cy="21" r="10.5" fill={seed.skin} filter="url(#avatarShadow)" />

                {/* Minimalist Facial Details for Realism */}
                {/* Eyes */}
                <circle cx="24.5" cy="20.5" r="0.9" fill="#374151" opacity="0.8" />
                <circle cx="31.5" cy="20.5" r="0.9" fill="#374151" opacity="0.8" />
                {/* Soft Smile */}
                <path d="M 26 24 C 26 25.2, 30 25.2, 30 24" stroke="#374151" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />

                {/* Hair - Layered to frame face realistically */}
                <path
                    d="M 16.5 21 C 15.5 14, 20 9, 28 9 C 36 9, 40.5 14, 39.5 21 C 40 21, 38.5 15, 36.5 14 C 34.5 13, 31 14, 28 14 C 24 14, 21.5 13, 19.5 14 C 17.5 15, 16 21, 16.5 21 Z"
                    fill={seed.hair}
                />
                {/* Hair Volume Shadow Overlay */}
                <path
                    d="M 17.5 19 C 20 12, 36 12, 38.5 19 C 37 14, 19 14, 17.5 19 Z"
                    fill="#000000"
                    opacity="0.08"
                />
            </g>
        </svg>
    );
}
/* ─────────────────────────────────────────────
   Hint Definitions per Step
   ───────────────────────────────────────────── */
const HINTS: Record<GameStep, string> = {
    intake: "Check the patient's allergies and current medications. Look for any red flags before accepting the order.",
    interpret:
        "Read the cursive prescription carefully. Drug name, strength, frequency (BID = twice daily, QD = once daily), and quantity are critical.",
    dur: "Drug utilization review alerts exist for a reason. If the alert is critical (allergy or life-threatening interaction), you must call the prescriber.",
    select:
        "Look for the exact drug and strength. Be careful of look‑alike/sound‑alike (LASA) bottles – a similar name may be the wrong product.",
    labeling:
        "Auxiliary labels warn patients about important precautions. For antibiotics, 'Finish all' and 'Sunlight' warnings are common.",
    counsel:
        "Always counsel on how to take the medication correctly and what to expect. Think about adherence, administration, and potential side effects.",
    result: "",
};

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */
export default function PharmacyCounterPage() {
    const [caseIndex, setCaseIndex] = useState(0);
    const currentCase = PHARMACY_CASES[caseIndex];

    const [step, setStep] = useState<GameStep>("intake");
    const [errorsCount, setErrorsCount] = useState(0);
    const [score, setScore] = useState(100);
    const [startTime, setStartTime] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [inputDrug, setInputDrug] = useState("");
    const [inputDose, setInputDose] = useState("");
    const [inputFreq, setInputFreq] = useState("");
    const [inputQty, setInputQty] = useState("");

    const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);
    const [selectedAuxLabels, setSelectedAuxLabels] = useState<string[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [preceptorFeedback, setPreceptorFeedback] = useState<string | null>(null);

    // Hint & Correction states
    const [showHint, setShowHint] = useState(false);
    const [showCorrection, setShowCorrection] = useState(false);
    const [correctionData, setCorrectionData] = useState<{
        title: string;
        details: string;
        correctAnswer: string;
    } | null>(null);

    useEffect(() => {
        if (step !== "result" && step !== "intake") {
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
        setInputQty("");
        setSelectedShelfId(null);
        setSelectedAuxLabels([]);
        setCurrentQuestionIdx(0);
        setPreceptorFeedback(null);
        setShowHint(false);
        setShowCorrection(false);
        setCorrectionData(null);
    };

    const triggerPreceptorIntervention = (
        message: string,
        correction?: { title: string; details: string; correctAnswer: string }
    ) => {
        setErrorsCount((prev) => prev + 1);
        setScore((prev) => Math.max(0, prev - 12));
        setPreceptorFeedback(message);
        if (correction) {
            setCorrectionData(correction);
            setShowCorrection(true);
        }
        setTimeout(() => setPreceptorFeedback(null), 6000);
    };

    // Step transitions
    const handleVerifyProfileIntake = () => setStep("interpret");

    const handleVerifyInterpretation = () => {
        const checkDrug = inputDrug.trim().toLowerCase() === currentCase.correctDrug.toLowerCase();
        const checkDose = inputDose.trim().toLowerCase() === currentCase.correctDose.toLowerCase();
        const checkFreq = inputFreq.trim().toUpperCase() === currentCase.correctFrequency.toUpperCase();
        const checkQty = parseInt(inputQty.trim(), 10) === currentCase.correctQty;
        if (!checkDrug) {
            triggerPreceptorIntervention(
                `Transcription Error: Incorrect drug name. Expected '${currentCase.correctDrug}'.`,
                {
                    title: "Drug Name Mismatch",
                    details: "The handwritten prescription states the drug name clearly. Cross‑reference with the patient profile.",
                    correctAnswer: `Correct drug: ${currentCase.correctDrug}`,
                }
            );
            return;
        }
        if (!checkDose) {
            triggerPreceptorIntervention(
                `Dosage strength mismatch. Target is '${currentCase.correctDose}'.`,
                {
                    title: "Incorrect Strength",
                    details: "The prescribed strength must be entered exactly as written.",
                    correctAnswer: `Correct dose: ${currentCase.correctDose}`,
                }
            );
            return;
        }
        if (!checkFreq) {
            triggerPreceptorIntervention(
                `SIG frequency translation failure. Should be '${currentCase.correctFrequency}'.`,
                {
                    title: "Frequency Error",
                    details: "Common abbreviations: QD = once daily, BID = twice daily, TID = three times daily.",
                    correctAnswer: `Correct frequency: ${currentCase.correctFrequency}`,
                }
            );
            return;
        }
        if (!checkQty) {
            triggerPreceptorIntervention(
                `Dispense quantity deviation. Expected value: ${currentCase.correctQty}.`,
                {
                    title: "Quantity Mismatch",
                    details: "Calculate the total tablets/capsules based on days supply and dosage.",
                    correctAnswer: `Correct quantity: ${currentCase.correctQty}`,
                }
            );
            return;
        }
        setStep("dur");
    };

    const handleDurResolve = (action: "override" | "call_doctor") => {
        if (action === currentCase.durAlert.correctAction) {
            setStep("select");
        } else {
            triggerPreceptorIntervention(
                `Clinical Intervention Error: ${currentCase.durAlert.rationale}`,
                {
                    title: "Incorrect DUR Action",
                    details: currentCase.durAlert.rationale,
                    correctAnswer: `Required action: ${currentCase.durAlert.correctAction === "call_doctor" ? "Call Prescriber" : "Override with documentation"
                        }`,
                }
            );
        }
    };

    const handleShelfSelection = (itemId: string, itemName: string, itemDose: string) => {
        setSelectedShelfId(itemId);
        if (
            itemName.toLowerCase() === currentCase.correctDrug.toLowerCase() &&
            itemDose.toLowerCase() === currentCase.correctDose.toLowerCase()
        ) {
            setTimeout(() => setStep("labeling"), 800);
        } else {
            triggerPreceptorIntervention(
                "Product Selection Misstep: Look‑Alike/Sound‑Alike (LASA) inventory bottle selected.",
                {
                    title: "LASA Error",
                    details: "A drug with a similar name or appearance was chosen. Always verify the NDC and strength.",
                    correctAnswer: `Correct product: ${currentCase.correctDrug} ${currentCase.correctDose}`,
                }
            );
        }
    };

    const toggleAuxiliaryLabel = (label: string) => {
        setSelectedAuxLabels((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );
    };

    const verifyLabelingConfiguration = () => {
        const missedLabels = currentCase.requiredAuxiliaryLabels.filter(
            (l) => !selectedAuxLabels.includes(l)
        );
        const incorrectLabels = selectedAuxLabels.filter(
            (l) => !currentCase.requiredAuxiliaryLabels.includes(l)
        );
        if (missedLabels.length === 0 && incorrectLabels.length === 0) {
            setStep("counsel");
        } else {
            triggerPreceptorIntervention(
                "Label Validation Warning: Missing required auxiliary labels or incorrect ones selected.",
                {
                    title: "Labeling Error",
                    details:
                        "Auxiliary labels must include all required warnings and should not include irrelevant ones.",
                    correctAnswer: `Required labels: ${currentCase.requiredAuxiliaryLabels.join(", ")}`,
                }
            );
        }
    };

    const handleCounselingAnswer = (optionIdx: number) => {
        const targetQuestion = currentCase.counseling[currentQuestionIdx];
        if (optionIdx === targetQuestion.correctIndex) {
            if (currentQuestionIdx + 1 < currentCase.counseling.length) {
                setCurrentQuestionIdx((prev) => prev + 1);
            } else {
                setStep("result");
            }
        } else {
            triggerPreceptorIntervention(
                `Counseling Clinical Inaccuracy: ${targetQuestion.rationale}`,
                {
                    title: "Incorrect Counseling",
                    details: targetQuestion.rationale,
                    correctAnswer: `Correct answer: ${targetQuestion.options[targetQuestion.correctIndex]}`,
                }
            );
        }
    };

    const nextCaseInstance = () => {
        setCaseIndex((prev) => (prev + 1) % PHARMACY_CASES.length);
        setStep("intake");
    };

    // Progress calculations
    const stepsOrder: GameStep[] = ["intake", "interpret", "dur", "select", "labeling", "counsel", "result"];
    const currentStepIndex = stepsOrder.indexOf(step);
    const progressPercent = ((currentStepIndex) / (stepsOrder.length - 2)) * 100; // exclude result

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-12 font-sans relative overflow-hidden">
            {/* Floating pharmacy icons */}
            {bgIcons.map(({ Icon, top, left, size, color, rotate }, i) => (
                <motion.div
                    key={i}
                    className={`absolute pointer-events-none hidden md:block ${color}`}
                    style={{ top, left }}
                    animate={{ y: [0, -10, 0], rotate: [rotate, rotate + 3, rotate] }}
                    transition={{
                        duration: 5 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.7,
                    }}
                >
                    <Icon size={size} strokeWidth={1.4} />
                </motion.div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
                {/* Header */}
                <header className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 text-white shadow-lg">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                                Virtual Pharmacy Counter
                            </h1>
                            <p className="text-xs text-gray-500">Dispensing Simulation & Clinical Verification</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-mono font-bold">{elapsedTime}s</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5">
                            <span className="text-gray-500">Score:</span>
                            <span className={`font-bold ${score > 80 ? "text-green-600" : "text-amber-600"}`}>
                                {score}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-1.5">
                            <span className="text-gray-500">Errors:</span>
                            <span className={`font-bold ${errorsCount > 0 ? "text-red-500" : "text-gray-400"}`}>
                                {errorsCount}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Progress bar */}
                {step !== "result" && (
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}

                {/* Step indicator */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[
                        { key: "intake", label: "1. Intake" },
                        { key: "interpret", label: "2. Transcribe" },
                        { key: "dur", label: "3. DUR" },
                        { key: "select", label: "4. Pick" },
                        { key: "labeling", label: "5. Label" },
                        { key: "counsel", label: "6. Counsel" },
                    ].map((s) => {
                        const isActive = step === s.key;
                        return (
                            <div
                                key={s.key}
                                className={`text-center py-2 px-1 rounded-lg text-xs font-bold transition-all border ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-green-400 text-white border-transparent shadow-md"
                                    : "bg-white border-gray-200 text-gray-400"
                                    }`}
                            >
                                {s.label}
                            </div>
                        );
                    })}
                </div>

                {/* Preceptor Feedback Banner */}
                <AnimatePresence>
                    {preceptorFeedback && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3"
                        >
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-red-700">Preceptor Intervention</h4>
                                <p className="text-sm mt-0.5">{preceptorFeedback}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel - Patient Profile */}
                    <section className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-green-400 text-white">
                            <h3 className="text-sm font-bold flex items-center gap-1.5">
                                <User className="w-4 h-4" /> Patient Profile
                            </h3>
                            <p className="text-xs text-white/70 font-mono">CASE: {currentCase.id}</p>
                        </div>
                        <div className="p-6 flex flex-col items-center text-center flex-grow justify-center space-y-4">
                            {step !== "result" && (
                                <motion.div
                                    key={currentCase.id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full space-y-4"
                                >
                                    <div className="flex justify-center">
                                        <PatientAvatar seed={currentCase.avatarSeed} />
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-3">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                Name
                                            </label>
                                            <p className="text-base font-bold text-gray-900">
                                                {currentCase.patientName}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                    DOB
                                                </label>
                                                <p className="text-xs text-gray-600">{currentCase.patientDob}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                    Age
                                                </label>
                                                <p className="text-xs text-gray-600">{currentCase.patientAge} yrs</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-red-500 tracking-wider">
                                                Allergies
                                            </label>
                                            <p
                                                className={`text-xs font-bold ${currentCase.allergies.includes("NKA")
                                                    ? "text-gray-600"
                                                    : "text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 inline-block"
                                                    }`}
                                            >
                                                {currentCase.allergies}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                Current Meds
                                            </label>
                                            <p className="text-xs text-gray-500 italic">
                                                {currentCase.currentMedications}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>

                    {/* Right Panel - Interactive Work Area */}
                    <section className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between relative">
                        {/* Hint button */}
                        {step !== "intake" && step !== "result" && (
                            <div className="absolute top-3 right-3 z-10">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="p-2 bg-amber-100 hover:bg-amber-200 rounded-full text-amber-600 transition-colors"
                                    title="Show Hint"
                                >
                                    <Lightbulb className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-72 bg-white border border-amber-200 rounded-2xl p-4 shadow-lg text-sm text-amber-800"
                                        >
                                            <div className="flex items-start gap-2">
                                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                                <p>{HINTS[step]}</p>
                                            </div>
                                            <button
                                                onClick={() => setShowHint(false)}
                                                className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                                            >
                                                Got it
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* INTRO */}
                            {step === "intake" && (
                                <motion.div
                                    key="intake"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <UserCheck className="w-5 h-5 text-blue-600" /> Patient Drop‑Off
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Cross‑reference the patient profile before starting the order.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                        <blockquote className="text-gray-700 italic text-sm">
                                            "Hi, I need to get this prescription filled as soon as possible."
                                        </blockquote>
                                    </div>
                                    <button
                                        onClick={handleVerifyProfileIntake}
                                        className="w-full bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        Accept Order & Start <ArrowRight className="w-4 h-4 inline ml-1" />
                                    </button>
                                </motion.div>
                            )}

                            {/* INTERPRET */}
                            {step === "interpret" && (
                                <motion.div
                                    key="interpret"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" /> Prescription Transcription
                                    </h3>
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                        <span className="font-serif text-3xl text-amber-600">℞</span>
                                        <p className="font-serif italic text-lg text-amber-800 whitespace-pre-wrap leading-relaxed mt-1">
                                            {currentCase.rxCursiveText}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Drug name"
                                            value={inputDrug}
                                            onChange={(e) => setInputDrug(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dose (e.g., 800-160 mg)"
                                            value={inputDose}
                                            onChange={(e) => setInputDose(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                        <select
                                            value={inputFreq}
                                            onChange={(e) => setInputFreq(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                        >
                                            <option value="">Frequency</option>
                                            <option value="QD">QD (Once Daily)</option>
                                            <option value="BID">BID (Twice Daily)</option>
                                            <option value="TID">TID (Three Times Daily)</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={inputQty}
                                            onChange={(e) => setInputQty(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleVerifyInterpretation}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        Verify & Run DUR
                                    </button>
                                </motion.div>
                            )}

                            {/* DUR */}
                            {step === "dur" && (
                                <motion.div
                                    key="dur"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
                                        <div className="flex items-center gap-3 text-red-600">
                                            <AlertTriangle className="w-6 h-6 animate-bounce" />
                                            <div>
                                                <h3 className="text-base font-bold text-red-800">
                                                    {currentCase.durAlert.alertTitle}
                                                </h3>
                                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                                                    {currentCase.durAlert.severity} ALERT
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-red-700">{currentCase.durAlert.description}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleDurResolve("override")}
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-400 text-left transition-all"
                                        >
                                            <span className="text-sm font-bold">Force Override</span>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Log benefit‑outweighs‑risk waiver
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => handleDurResolve("call_doctor")}
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 text-left transition-all"
                                        >
                                            <span className="text-sm font-bold">Call Prescriber</span>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Hold order, request alternative
                                            </p>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* SELECT */}
                            {step === "select" && (
                                <motion.div
                                    key="select"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-base font-bold text-gray-800">Select Medicine from Shelf</h3>
                                    <p className="text-xs text-gray-500">
                                        Watch for look‑alike/sound‑alike packages.
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {currentCase.shelfItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    handleShelfSelection(item.id, item.name, item.dose)
                                                }
                                                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${selectedShelfId === item.id
                                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                                    : "border-gray-200 bg-white hover:border-blue-300"
                                                    }`}
                                            >
                                                <PillBottleSVG className="w-10 h-10" />
                                                <span className="text-xs font-bold text-gray-700">
                                                    {item.name}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {item.dose} · {item.form}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
                                        Target: <strong>{currentCase.correctDrug} {currentCase.correctDose}</strong>
                                    </div>
                                </motion.div>
                            )}

                            {/* LABELING */}
                            {step === "labeling" && (
                                <motion.div
                                    key="labeling"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-blue-600" /> Auxiliary Labels
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Select required warning labels for the medication.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentCase.availableAuxiliaryLabels.map((label, idx) => {
                                            const isSelected = selectedAuxLabels.includes(label);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleAuxiliaryLabel(label)}
                                                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between gap-2 ${isSelected
                                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <span>{label}</span>
                                                    <div
                                                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected
                                                            ? "bg-blue-500 border-blue-500"
                                                            : "border-gray-300"
                                                            }`}
                                                    >
                                                        {isSelected && (
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={verifyLabelingConfiguration}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                    >
                                        Confirm Labels & Package
                                    </button>
                                </motion.div>
                            )}

                            {/* COUNSEL */}
                            {step === "counsel" && (
                                <motion.div
                                    key="counsel"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-blue-600" /> Patient Counseling
                                    </h3>
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                        <p className="text-sm text-blue-800 font-medium">
                                            {currentCase.counseling[currentQuestionIdx].question}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {currentCase.counseling[currentQuestionIdx].options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleCounselingAnswer(idx)}
                                                className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-all"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* RESULT */}
                            {step === "result" && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6 text-center py-4"
                                >
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                    <h3 className="text-xl font-bold text-gray-800">Dispensing Complete</h3>
                                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">
                                        {score}/100
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Errors: {errorsCount} | Time: {elapsedTime}s
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={startSimulation}
                                            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                        >
                                            <RotateCw className="w-4 h-4 inline mr-1" /> Retry
                                        </button>
                                        <button
                                            onClick={nextCaseInstance}
                                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            Next Case <ChevronRight className="w-4 h-4 inline ml-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Correction Details Panel (slides from right) */}
                        <AnimatePresence>
                            {showCorrection && correctionData && (
                                <motion.div
                                    initial={{ x: "100%", opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: "100%", opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute top-0 right-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl rounded-l-3xl p-6 z-20 overflow-y-auto"
                                >
                                    <div className="flex items-start justify-between">
                                        <h4 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" /> Correction Details
                                        </h4>
                                        <button
                                            onClick={() => setShowCorrection(false)}
                                            className="p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                            <p className="text-sm font-semibold text-red-800">
                                                {correctionData.title}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                What went wrong?
                                            </p>
                                            <p className="text-sm text-gray-700 mt-1">{correctionData.details}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-wide">
                                                Correct Answer
                                            </p>
                                            <p className="text-sm font-medium text-green-800 bg-green-50 p-3 rounded-xl mt-1 border border-green-100">
                                                {correctionData.correctAnswer}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowCorrection(false)}
                                            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </main>
            </div>
        </div>
    );
}