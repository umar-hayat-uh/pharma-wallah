"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Lightbulb,
    X,
    AlertTriangle,
    CheckCircle,
    Clock,
    User,
    Pill,
    FlaskConical,
    Activity,
    ChevronRight,
    RefreshCw,
    SkipForward,
    Star,
    BookOpen,
    Shield,
    Tag,
    MessageCircle,
} from "lucide-react";

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface DURAlert {
    alertTitle: string;
    severity: "Moderate" | "Severe" | "Critical";
    description: string;
    correctAction: "override" | "call_doctor";
    rationale: string;
}

interface ShelfItem {
    id: string;
    name: string;
    dose: string;
    form: string;
    isLookAlike: boolean;
}

interface CounselingQ {
    question: string;
    options: string[];
    correctIndex: number;
    rationale: string;
}

interface PrescriptionCase {
    id: number;
    patientName: string;
    patientDob: string;
    patientAge: number;
    allergies: string[];
    currentMedications: string[];
    avatarSeed: { skin: string; hair: string; shirt: string };
    rxCursiveText: string;
    correctDrug: string;
    correctDose: string;
    correctFrequency: string;
    correctQty: number;
    durAlert: DURAlert;
    shelfItems: ShelfItem[];
    availableAuxiliaryLabels: string[];
    requiredAuxiliaryLabels: string[];
    counseling: CounselingQ[];
}

// ─────────────────────────────────────────────
//  CASE DATA
// ─────────────────────────────────────────────
const CASES: PrescriptionCase[] = [
    {
        id: 1,
        patientName: "David Miller",
        patientDob: "1973-04-12",
        patientAge: 51,
        allergies: ["Sulfonamides (Sulfa)", "Penicillin"],
        currentMedications: ["Metformin 500 mg BID", "Lisinopril 10 mg QD"],
        avatarSeed: { skin: "#F5CBA7", hair: "#4A235A", shirt: "#2980B9" },
        rxCursiveText:
            "Bactrim DS\n800/160 mg\nBID × 10 days\nQty: 20 tabs\nDr. A. Torres",
        correctDrug: "Bactrim DS",
        correctDose: "800/160 mg",
        correctFrequency: "BID",
        correctQty: 20,
        durAlert: {
            alertTitle: "CRITICAL ALLERGY — Sulfonamide",
            severity: "Critical",
            description:
                "Patient has a documented ALLERGY to Sulfonamides. Bactrim DS (sulfamethoxazole/trimethoprim) is a sulfonamide antibiotic. Dispensing may cause a life-threatening allergic reaction including anaphylaxis.",
            correctAction: "call_doctor",
            rationale:
                "A Critical sulfa allergy alert MUST NOT be overridden. The prescriber must be contacted to select an alternative antibiotic such as Nitrofurantoin or Fosfomycin.",
        },
        shelfItems: [
            { id: "s1", name: "Bactrim DS", dose: "800/160 mg", form: "Tablet", isLookAlike: false },
            { id: "s2", name: "Bactrim", dose: "400/80 mg", form: "Tablet", isLookAlike: true },
            { id: "s3", name: "Septra DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "SMX-TMP DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Cipro", dose: "500 mg", form: "Tablet", isLookAlike: false },
            { id: "s6", name: "Amoxicillin", dose: "500 mg", form: "Capsule", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with plenty of water",
            "Avoid prolonged sun exposure",
            "Complete the full course",
            "May cause dizziness",
            "Take with food",
            "Keep refrigerated",
            "Shake well before use",
        ],
        requiredAuxiliaryLabels: [
            "Take with plenty of water",
            "Avoid prolonged sun exposure",
            "Complete the full course",
        ],
        counseling: [
            {
                question:
                    "David asks, 'How much water should I drink while taking this antibiotic?' What is the best response?",
                options: [
                    "Just drink normally, water doesn't matter.",
                    "Drink at least 8 full glasses of water daily to prevent kidney stones.",
                    "Limit fluids to avoid stomach upset.",
                    "Only drink water if you feel thirsty.",
                ],
                correctIndex: 1,
                rationale:
                    "Sulfonamides can crystallize in the renal tubules (crystalluria). Adequate hydration (≥8 glasses/day) is essential to maintain high urine flow and prevent nephrotoxicity.",
            },
            {
                question:
                    "David plans a beach vacation next week. What sun-exposure counseling should you provide?",
                options: [
                    "Sun exposure is fine; no special precautions needed.",
                    "Apply sunscreen only if you burn easily.",
                    "Avoid prolonged sun exposure and use SPF 30+ sunscreen; sulfonamides cause photosensitivity.",
                    "Wear a hat only if it is very sunny.",
                ],
                correctIndex: 2,
                rationale:
                    "Sulfonamides are known photosensitizers. Patients should minimize UV exposure, use broad-spectrum SPF ≥30 sunscreen, and wear protective clothing.",
            },
        ],
    },
    {
        id: 2,
        patientName: "Clara Jenkins",
        patientDob: "1959-08-27",
        patientAge: 65,
        allergies: ["Latex", "Aspirin (mild intolerance)"],
        currentMedications: [
            "Sildenafil (Viagra) 50 mg PRN",
            "Atorvastatin 40 mg QD",
            "Amlodipine 5 mg QD",
        ],
        avatarSeed: { skin: "#FAD7A0", hair: "#784212", shirt: "#8E44AD" },
        rxCursiveText:
            "Imdur (ISMN ER)\n30 mg\nQD\nQty: 30 tabs\nDr. R. Patel",
        correctDrug: "Imdur",
        correctDose: "30 mg",
        correctFrequency: "QD",
        correctQty: 30,
        durAlert: {
            alertTitle: "CRITICAL DDI — Nitrate + PDE5 Inhibitor",
            severity: "Critical",
            description:
                "Patient takes Sildenafil (PDE5 inhibitor). Adding Isosorbide Mononitrate (Imdur), an organic nitrate, creates a potentially fatal synergistic vasodilation. Severe hypotension, syncope, myocardial infarction, or death may result.",
            correctAction: "call_doctor",
            rationale:
                "This is an absolute contraindication. The prescriber must be notified immediately. An alternative anti-anginal agent (e.g., a beta-blocker or calcium channel blocker) must be substituted.",
        },
        shelfItems: [
            { id: "s1", name: "Imdur", dose: "30 mg", form: "ER Tablet", isLookAlike: false },
            { id: "s2", name: "Imdur", dose: "60 mg", form: "ER Tablet", isLookAlike: true },
            { id: "s3", name: "ISMO", dose: "20 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "Monoket", dose: "30 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Isordil", dose: "10 mg", form: "Tablet", isLookAlike: true },
            { id: "s6", name: "NitroStat", dose: "0.4 mg", form: "SL Tablet", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Do NOT crush or chew",
            "May cause headache initially",
            "Do not take with erectile dysfunction drugs",
            "Take on empty stomach",
            "Take with food",
            "Keep refrigerated",
            "Avoid grapefruit",
        ],
        requiredAuxiliaryLabels: [
            "Do NOT crush or chew",
            "May cause headache initially",
            "Do not take with erectile dysfunction drugs",
        ],
        counseling: [
            {
                question:
                    "Clara asks why she can't take her sildenafil while on this new heart medication. What is the best explanation?",
                options: [
                    "They have the same active ingredient and would double the dose.",
                    "Both medications lower blood pressure; combining them can cause dangerously low blood pressure leading to fainting or a heart attack.",
                    "Sildenafil increases the metabolism of nitrates, making them less effective.",
                    "There is no real interaction; this is just a precaution.",
                ],
                correctIndex: 1,
                rationale:
                    "Nitrates and PDE5 inhibitors both dilate blood vessels through complementary pathways (cGMP potentiation). Co-administration can cause severe, potentially fatal hypotension. This is an absolute contraindication.",
            },
            {
                question:
                    "Clara's Imdur is an extended-release tablet. What administration instruction is critical?",
                options: [
                    "Crush the tablet and mix in applesauce for easier swallowing.",
                    "Swallow the tablet whole; crushing destroys the extended-release mechanism and causes a dangerous dose dump.",
                    "Break the tablet in half if it seems too large.",
                    "It can be crushed; the 'ER' just means it is extended in size.",
                ],
                correctIndex: 1,
                rationale:
                    "Extended-release formulations must never be crushed or chewed. Doing so destroys the controlled-release matrix, releasing the full dose at once (dose dumping), which can cause severe hypotension.",
            },
        ],
    },
];

// ─────────────────────────────────────────────
//  STEP HINTS
// ─────────────────────────────────────────────
const STEP_HINTS: Record<number, string> = {
    0: "Review all allergies carefully before accepting. Check for drug-allergy conflicts now — it is easier to flag early.",
    1: "Common abbreviations: QD = once daily, BID = twice/day, TID = three/day. Verify drug NAME and DOSE exactly as written.",
    2: "Severity matters. Critical alerts almost always require contacting the prescriber. Never override a critical allergy.",
    3: "LASA drugs look similar! Compare BOTH the name AND the strength/dose before selecting.",
    4: "Select ONLY the labels that are specifically required for this medication. More is not always better.",
    5: "Draw on the DUR information you reviewed earlier — it often directly answers the counseling question.",
};

// ─────────────────────────────────────────────
//  SVG COMPONENTS
// ─────────────────────────────────────────────
const PatientAvatar = ({
    skin,
    hair,
    shirt,
    size = 80,
}: {
    skin: string;
    hair: string;
    shirt: string;
    size?: number;
}) => (
    <svg width={size} height={size} viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="95" rx="28" ry="22" fill={shirt} />
        <rect x="44" y="64" width="12" height="14" rx="4" fill={skin} />
        <circle cx="50" cy="52" r="22" fill={skin} />
        <ellipse cx="50" cy="33" rx="22" ry="12" fill={hair} />
        <ellipse cx="30" cy="46" rx="6" ry="14" fill={hair} />
        <ellipse cx="70" cy="46" rx="6" ry="14" fill={hair} />
        <circle cx="42" cy="50" r="3" fill="#2c3e50" />
        <circle cx="58" cy="50" r="3" fill="#2c3e50" />
        <circle cx="43" cy="49" r="1" fill="white" />
        <circle cx="59" cy="49" r="1" fill="white" />
        <path d="M 43 58 Q 50 64 57 58" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 40 78 L 50 88 L 60 78" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
);

const PillBottleSVG = ({
    color = "#3b82f6",
    isSelected = false,
    isWrong = false,
    isLookAlike = false,
}: {
    color?: string;
    isSelected?: boolean;
    isWrong?: boolean;
    isLookAlike?: boolean;
}) => (
    <svg width="56" height="80" viewBox="0 0 56 80" xmlns="http://www.w3.org/2000/svg">
        <rect
            x="12" y="2" width="32" height="14" rx="4"
            fill={isWrong ? "#ef4444" : isSelected ? "#16a34a" : "#d97706"}
        />
        <rect
            x="8" y="14" width="40" height="58" rx="6"
            fill={color} opacity="0.85"
            stroke={isSelected ? "#16a34a" : isWrong ? "#ef4444" : "#93c5fd"}
            strokeWidth={isSelected || isWrong ? "2.5" : "1"}
        />
        <rect x="12" y="22" width="32" height="38" rx="3" fill="white" opacity="0.9" />
        <ellipse cx="21" cy="35" rx="5" ry="3" fill="#ef4444" opacity="0.7" />
        <ellipse cx="35" cy="35" rx="5" ry="3" fill="#3b82f6" opacity="0.7" />
        <ellipse cx="28" cy="42" rx="5" ry="3" fill="#22c55e" opacity="0.7" />
        <ellipse cx="21" cy="49" rx="5" ry="3" fill="#ef4444" opacity="0.7" />
        <ellipse cx="35" cy="49" rx="5" ry="3" fill="#3b82f6" opacity="0.7" />
        {isLookAlike && (
            <>
                <rect x="8" y="66" width="40" height="8" rx="0" fill="#f59e0b" opacity="0.95" />
                <text x="28" y="73" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">
                    LASA
                </text>
            </>
        )}
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} x={14 + i * 2.5} y="55" width="1.2" height="7" fill="#334155" opacity="0.4" />
        ))}
    </svg>
);

// ─────────────────────────────────────────────
//  FLOATING AMBIENT ICONS  (low-opacity on light bg)
// ─────────────────────────────────────────────
const FloatingIcon = ({
    icon: Icon,
    style,
}: {
    icon: React.ElementType;
    style: React.CSSProperties;
}) => (
    <motion.div
        className="absolute text-blue-400 pointer-events-none"
        style={{ ...style, opacity: 0.18 }}
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <Icon size={32} />
    </motion.div>
);

// ─────────────────────────────────────────────
//  SEVERITY BADGE
// ─────────────────────────────────────────────
const SeverityBadge = ({ severity }: { severity: string }) => {
    const map: Record<string, string> = {
        Critical: "bg-red-600 text-white",
        Severe: "bg-orange-500 text-white",
        Moderate: "bg-amber-400 text-gray-900",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${map[severity] || "bg-gray-400 text-white"}`}>
            {severity}
        </span>
    );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function PharmacySimulation() {
    const [caseIdx, setCaseIdx] = useState(0);
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(100);
    const [errors, setErrors] = useState(0);
    const [timer, setTimer] = useState(0);
    const [running, setRunning] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [preceptorMsg, setPreceptorMsg] = useState<string | null>(null);
    const [correction, setCorrection] = useState<{
        title: string;
        explanation: string;
        correct: string;
    } | null>(null);

    const [txDrug, setTxDrug] = useState("");
    const [txDose, setTxDose] = useState("");
    const [txFreq, setTxFreq] = useState("QD");
    const [txQty, setTxQty] = useState("");
    const [selectedBottle, setSelectedBottle] = useState<string | null>(null);
    const [wrongBottle, setWrongBottle] = useState<string | null>(null);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [counselingIdx, setCounselingIdx] = useState(0);
    const [counselingDone, setCounselingDone] = useState(false);
    const [done, setDone] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const preceptorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeCase = CASES[caseIdx % CASES.length];

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [running]);

    const showPreceptor = useCallback((msg: string) => {
        setPreceptorMsg(msg);
        if (preceptorRef.current) clearTimeout(preceptorRef.current);
        preceptorRef.current = setTimeout(() => setPreceptorMsg(null), 6000);
    }, []);

    const penalise = useCallback(
        (correctionData: { title: string; explanation: string; correct: string }, preceptorText: string) => {
            setScore((s) => Math.max(0, s - 12));
            setErrors((e) => e + 1);
            setCorrection(correctionData);
            showPreceptor(preceptorText);
        },
        [showPreceptor]
    );

    const resetForCase = (idx: number) => {
        setCaseIdx(idx);
        setStep(0);
        setScore(100);
        setErrors(0);
        setTimer(0);
        setRunning(false);
        setTxDrug("");
        setTxDose("");
        setTxFreq("QD");
        setTxQty("");
        setSelectedBottle(null);
        setWrongBottle(null);
        setSelectedLabels([]);
        setCounselingIdx(0);
        setCounselingDone(false);
        setDone(false);
        setPreceptorMsg(null);
        setCorrection(null);
        setShowHint(false);
    };

    // ── STEP HANDLERS ──────────────────────────

    const handleAccept = () => { setRunning(true); setStep(1); };

    const handleTranscription = () => {
        const c = activeCase;
        const drugOk = txDrug.trim().toLowerCase() === c.correctDrug.toLowerCase();
        const doseOk = txDose.trim().toLowerCase() === c.correctDose.toLowerCase();
        const freqOk = txFreq === c.correctFrequency;
        const qtyOk = parseInt(txQty) === c.correctQty;

        if (!drugOk || !doseOk || !freqOk || !qtyOk) {
            const wrongs: string[] = [];
            if (!drugOk) wrongs.push(`Drug (correct: ${c.correctDrug})`);
            if (!doseOk) wrongs.push(`Dose (correct: ${c.correctDose})`);
            if (!freqOk) wrongs.push(`Frequency (correct: ${c.correctFrequency})`);
            if (!qtyOk) wrongs.push(`Quantity (correct: ${c.correctQty})`);
            penalise(
                {
                    title: "Transcription Error",
                    explanation: `The following field(s) were incorrect: ${wrongs.join(", ")}.`,
                    correct: `${c.correctDrug} | ${c.correctDose} | ${c.correctFrequency} | Qty: ${c.correctQty}`,
                },
                "⚠️ Preceptor: Transcription mismatch detected. Verify the prescription carefully."
            );
            return;
        }
        setStep(2);
    };

    const handleDUR = (action: "override" | "call_doctor") => {
        if (action !== activeCase.durAlert.correctAction) {
            penalise(
                {
                    title: "Incorrect DUR Action",
                    explanation: `You chose to ${action === "override" ? "override" : "call the doctor"}, but the correct action was ${activeCase.durAlert.correctAction === "override" ? "to override" : "to call the prescriber"}.`,
                    correct: activeCase.durAlert.rationale,
                },
                "⚠️ Preceptor: Incorrect DUR response. A Critical alert must go to the prescriber."
            );
            return;
        }
        setStep(3);
    };

    const handleBottleClick = (item: ShelfItem) => {
        const c = activeCase;
        if (item.name === c.correctDrug && item.dose === c.correctDose) {
            setSelectedBottle(item.id);
            setTimeout(() => setStep(4), 700);
        } else {
            setWrongBottle(item.id);
            penalise(
                {
                    title: "LASA Selection Error",
                    explanation: `You selected "${item.name} ${item.dose}" which is ${item.isLookAlike ? "a look-alike/sound-alike medication" : "an incorrect medication"}.`,
                    correct: `${c.correctDrug} ${c.correctDose} ${c.shelfItems.find((s) => s.name === c.correctDrug && s.dose === c.correctDose)?.form || ""}`,
                },
                "⚠️ Preceptor: LASA error. Always verify the exact drug name AND strength."
            );
            setTimeout(() => setWrongBottle(null), 1200);
        }
    };

    const handleLabels = () => {
        const req = [...activeCase.requiredAuxiliaryLabels].sort().join("|");
        const sel = [...selectedLabels].sort().join("|");
        if (req !== sel) {
            const missing = activeCase.requiredAuxiliaryLabels.filter((l) => !selectedLabels.includes(l));
            const extra = selectedLabels.filter((l) => !activeCase.requiredAuxiliaryLabels.includes(l));
            penalise(
                {
                    title: "Auxiliary Label Error",
                    explanation: `${missing.length ? `Missing: ${missing.join(", ")}. ` : ""}${extra.length ? `Extra (not required): ${extra.join(", ")}.` : ""}`,
                    correct: activeCase.requiredAuxiliaryLabels.join(" | "),
                },
                "⚠️ Preceptor: Incorrect auxiliary labels. Each drug has specific required warnings."
            );
            return;
        }
        setStep(5);
    };

    const handleCounseling = (idx: number) => {
        const q = activeCase.counseling[counselingIdx];
        if (idx !== q.correctIndex) {
            penalise(
                {
                    title: "Counseling Error",
                    explanation: `"${q.options[idx]}" is not the best answer.`,
                    correct: `${q.options[q.correctIndex]} — ${q.rationale}`,
                },
                "⚠️ Preceptor: Review the drug's pharmacology to counsel patients accurately."
            );
            return;
        }
        if (counselingIdx + 1 < activeCase.counseling.length) {
            setCounselingIdx((i) => i + 1);
        } else {
            setCounselingDone(true);
            setRunning(false);
            setDone(true);
        }
    };

    // ── RENDER HELPERS ─────────────────────────

    const fmtTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    // Score color for light backgrounds (PharmaWallah semantic colors)
    const scoreColor =
        score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";

    const STEP_LABELS = ["Intake", "Transcription", "DUR Review", "Shelf Select", "Labeling", "Counseling"];

    // ── JSX ────────────────────────────────────
    return (
        // ── PAGE BACKGROUND: PharmaWallah light gradient ──
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-900 font-sans relative overflow-hidden">

            {/* Background dot-grid texture */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    opacity: 0.18,
                }}
            />

            {/* Ambient floating icons */}
            {[
                { icon: Pill, style: { top: "8%", left: "3%" } },
                { icon: FlaskConical, style: { top: "20%", right: "4%" } },
                { icon: Activity, style: { top: "55%", left: "2%" } },
                { icon: Shield, style: { top: "70%", right: "3%" } },
                { icon: BookOpen, style: { top: "40%", left: "5%" } },
                { icon: Star, style: { top: "85%", left: "40%" } },
            ].map(({ icon, style }, i) => (
                <FloatingIcon key={i} icon={icon} style={style} />
            ))}

            {/* ── HEADER — PharmaWallah primary gradient ── */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 shadow-lg border-b border-blue-800">
                <div className="max-w-7xl mx-auto px-4 py-3 pt-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-xl p-2 backdrop-blur">
                            <ShoppingCart className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Virtual Pharmacy Counter
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur">
                            <Clock size={14} className="text-blue-100" />
                            <span className="font-mono font-bold text-white">{fmtTime(timer)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur">
                            <Star size={14} className="text-yellow-300" />
                            <span className="font-bold text-white">{score} pts</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-blue-800/50 h-1.5">
                    <motion.div
                        className="h-1.5 bg-gradient-to-r from-white/70 to-green-300"
                        animate={{ width: `${(step / 6) * 100}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                {/* Step pills */}
                <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
                    {STEP_LABELS.map((label, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${i < step
                                    ? "bg-white/25 text-white border border-white/40 font-medium"
                                    : i === step
                                        ? "bg-white text-blue-700 border border-white font-bold shadow-sm"
                                        : "bg-transparent text-green-100/50 border border-transparent"
                                }`}
                        >
                            {i < step
                                ? <CheckCircle size={10} />
                                : <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                            }
                            {label}
                        </div>
                    ))}
                </div>
            </header>

            {/* ── PRECEPTOR ALERT BANNER ── */}
            <AnimatePresence>
                {preceptorMsg && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-red-600 border-b-2 border-red-500 px-6 py-3 flex items-center justify-between shadow-2xl"
                    >
                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                            <AlertTriangle size={18} className="animate-pulse" />
                            {preceptorMsg}
                        </div>
                        <button onClick={() => setPreceptorMsg(null)} className="text-red-200 hover:text-white transition">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CORRECTION SIDE PANEL ── */}
            <AnimatePresence>
                {correction && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-24 bottom-0 w-full max-w-sm z-50 bg-white border-l border-gray-200 shadow-2xl flex flex-col"
                    >
                        {/* Panel header */}
                        <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-200" />
                                <h3 className="font-bold text-white text-sm">{correction.title}</h3>
                            </div>
                            <button onClick={() => setCorrection(null)} className="text-red-200 hover:text-white transition">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Panel body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600 font-semibold mb-1">What went wrong:</p>
                                <p className="text-sm text-gray-700">{correction.explanation}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-600 font-semibold mb-1 flex items-center gap-1">
                                    <CheckCircle size={14} /> Correct Answer:
                                </p>
                                <p className="text-sm text-green-800 font-semibold">{correction.correct}</p>
                            </div>
                            <p className="text-xs text-gray-400 text-center">−12 points applied. Learn and continue.</p>
                        </div>
                        {/* Panel footer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setCorrection(null)}
                                className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-bold py-2.5 rounded-xl transition shadow-md hover:shadow-lg text-sm"
                            >
                                Understood — Continue
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MAIN LAYOUT ── */}
            <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT: Patient Profile ── */}
                <aside className="lg:sticky lg:top-36 space-y-4 lg:col-span-1 h-fit">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <User size={18} className="text-blue-600" />
                            </div>
                            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                                Patient Profile
                            </h2>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <PatientAvatar
                                    skin={activeCase.avatarSeed.skin}
                                    hair={activeCase.avatarSeed.hair}
                                    shirt={activeCase.avatarSeed.shirt}
                                    size={90}
                                />
                            </motion.div>
                            <div className="text-center">
                                <p className="font-extrabold text-gray-900 text-lg leading-tight">
                                    {activeCase.patientName}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    DOB: {activeCase.patientDob} · Age: {activeCase.patientAge}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {/* Allergies — error semantic color */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <AlertTriangle size={11} /> Allergies
                                </p>
                                {activeCase.allergies.map((a) => (
                                    <span key={a} className="inline-block bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full mr-1 mb-1 font-semibold">
                                        {a}
                                    </span>
                                ))}
                            </div>
                            {/* Medications */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Pill size={11} /> Current Medications
                                </p>
                                {activeCase.currentMedications.map((m) => (
                                    <p key={m} className="text-blue-800 text-xs mb-0.5">• {m}</p>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Prescription card — amber/parchment feel */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-amber-50 border-2 border-amber-200  rounded-2xl p-5 shadow-sm"
                    >
                        <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <BookOpen size={11} /> Prescription
                        </p>
                        <pre
                            className=" bg-white font-serif italic text-amber-900 text-sm leading-relaxed whitespace-pre-wrap"
                            style={{ fontFamily: "'Dancing Script', 'Palatino', cursive" }}
                        >
                            {activeCase.rxCursiveText}
                        </pre>
                        <div className="mt-3 border-t border-amber-200 pt-2">
                            <p className="text-amber-600 text-xs">Rx # {1000 + activeCase.id} · DEA Licensed</p>
                        </div>
                    </motion.div>
                </aside>

                {/* ── RIGHT: Interactive Steps ── */}
                <div className="lg:col-span-2 relative">

                    {/* Hint toggle */}
                    <button
                        onClick={() => setShowHint((h) => !h)}
                        className="absolute top-0 right-0 z-10 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl px-3 py-2 text-xs font-semibold transition shadow-sm"
                    >
                        <Lightbulb size={14} />
                        Hint
                    </button>

                    {/* Hint card */}
                    <AnimatePresence>
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute top-10 right-0 z-20 w-72 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xl text-sm text-amber-800"
                            >
                                <div className="flex items-center gap-2 mb-2 font-bold text-amber-700">
                                    <Lightbulb size={14} /> Step Hint
                                </div>
                                <p className="leading-relaxed">{STEP_HINTS[step]}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">

                        {/* ──────── STEP 0: INTAKE ──────── */}
                        {step === 0 && !done && (
                            <motion.div
                                key="intake"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 rounded-xl p-2">
                                        <CheckCircle className="text-green-600" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">Step 1 — Patient Intake</h2>
                                        <p className="text-gray-500 text-xs">Review the patient profile and accept the prescription.</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-gray-700 leading-relaxed">
                                    <p>
                                        <strong className="text-gray-900">{activeCase.patientName}</strong> has arrived at the
                                        counter and handed you a written prescription. Before accepting, review:
                                    </p>
                                    <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm">
                                        <li>
                                            Allergies:{" "}
                                            <span className="text-red-600 font-semibold">
                                                {activeCase.allergies.join(", ")}
                                            </span>
                                        </li>
                                        <li>
                                            Current medications:{" "}
                                            <span className="text-blue-700 font-medium">
                                                {activeCase.currentMedications.join("; ")}
                                            </span>
                                        </li>
                                    </ul>
                                    <p className="mt-3 text-gray-500 text-xs">
                                        Scan the prescription note on the left panel, note the drug and any potential flags,
                                        then click Accept to begin.
                                    </p>
                                </div>
                                <button
                                    onClick={handleAccept}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-extrabold py-3.5 rounded-xl transition shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Accept Order & Start Timer
                                </button>
                            </motion.div>
                        )}

                        {/* ──────── STEP 1: TRANSCRIPTION ──────── */}
                        {step === 1 && !done && (
                            <motion.div
                                key="transcription"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 rounded-xl p-2">
                                        <BookOpen className="text-blue-600" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">Step 2 — Transcription</h2>
                                        <p className="text-gray-500 text-xs">
                                            Interpret the handwritten Rx and enter the details below.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="space-y-1.5">
                                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Drug Name *</span>
                                        <input
                                            value={txDrug}
                                            onChange={(e) => setTxDrug(e.target.value)}
                                            placeholder="e.g. Amoxicillin"
                                            className="w-full bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition placeholder-gray-400"
                                        />
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Dose / Strength *</span>
                                        <input
                                            value={txDose}
                                            onChange={(e) => setTxDose(e.target.value)}
                                            placeholder="e.g. 500 mg"
                                            className="w-full bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition placeholder-gray-400"
                                        />
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Frequency *</span>
                                        <select
                                            value={txFreq}
                                            onChange={(e) => setTxFreq(e.target.value)}
                                            className="w-full bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition"
                                        >
                                            <option value="QD">QD — Once daily</option>
                                            <option value="BID">BID — Twice daily</option>
                                            <option value="TID">TID — Three times daily</option>
                                            <option value="QID">QID — Four times daily</option>
                                            <option value="PRN">PRN — As needed</option>
                                        </select>
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Quantity *</span>
                                        <input
                                            type="number"
                                            value={txQty}
                                            onChange={(e) => setTxQty(e.target.value)}
                                            placeholder="e.g. 30"
                                            min={1}
                                            className="w-full bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-gray-900 text-sm outline-none transition placeholder-gray-400"
                                        />
                                    </label>
                                </div>
                                <button
                                    onClick={handleTranscription}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-extrabold py-3.5 rounded-xl transition shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2"
                                >
                                    <ChevronRight size={18} />
                                    Verify & Submit Transcription
                                </button>
                            </motion.div>
                        )}

                        {/* ──────── STEP 2: DUR ──────── */}
                        {step === 2 && !done && (
                            <motion.div
                                key="dur"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-4"
                            >
                                {/* Alert card — error semantic */}
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="bg-red-500 rounded-full p-3 shrink-0"
                                        >
                                            <AlertTriangle size={24} className="text-white" />
                                        </motion.div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <h2 className="text-xl font-extrabold text-gray-900">
                                                    {activeCase.durAlert.alertTitle}
                                                </h2>
                                                <SeverityBadge severity={activeCase.durAlert.severity} />
                                            </div>
                                            <p className="text-sm text-red-700 leading-relaxed">
                                                {activeCase.durAlert.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-red-100 rounded-xl p-3 text-xs text-red-600 border border-red-200">
                                        <strong>Clinical Context:</strong> This alert was triggered during automated Drug
                                        Utilization Review (DUR). Your response is mandatory before dispensing can proceed.
                                    </div>
                                </div>

                                {/* Action buttons — outline style per design system */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleDUR("call_doctor")}
                                        className="bg-white hover:bg-blue-50 border-2 border-blue-400 text-blue-700 font-extrabold py-5 px-6 rounded-2xl transition shadow-md hover:shadow-lg text-base flex flex-col items-center gap-2"
                                    >
                                        <MessageCircle size={24} className="text-blue-500" />
                                        Call Prescriber
                                        <span className="text-xs font-normal text-blue-500">
                                            Contact the doctor for alternative
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleDUR("override")}
                                        className="bg-white hover:bg-orange-50 border-2 border-orange-400 text-orange-700 font-extrabold py-5 px-6 rounded-2xl transition shadow-md hover:shadow-lg text-base flex flex-col items-center gap-2"
                                    >
                                        <Shield size={24} className="text-orange-500" />
                                        Force Override
                                        <span className="text-xs font-normal text-orange-500">
                                            Proceed with pharmacist override
                                        </span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ──────── STEP 3: SHELF SELECTION ──────── */}
                        {step === 3 && !done && (
                            <motion.div
                                key="shelf"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 rounded-xl p-2">
                                        <Tag className="text-purple-600" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">Step 4 — Shelf Selection</h2>
                                        <p className="text-gray-500 text-xs">
                                            Select the correct medication. Beware of LASA drugs!
                                        </p>
                                    </div>
                                </div>

                                {/* LASA warning — warning semantic */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                                    LASA alert active: Look-alike/sound-alike drugs are present on the shelf. Verify the exact name AND dose.
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {activeCase.shelfItems.map((item) => (
                                        <motion.button
                                            key={item.id}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleBottleClick(item)}
                                            className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition cursor-pointer ${selectedBottle === item.id
                                                    ? "border-green-500 bg-green-50 shadow-md"
                                                    : wrongBottle === item.id
                                                        ? "border-red-500 bg-red-50 animate-pulse"
                                                        : item.isLookAlike
                                                            ? "border-amber-300 bg-amber-50 hover:border-amber-500 hover:shadow-md"
                                                            : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md"
                                                }`}
                                        >
                                            {item.isLookAlike && (
                                                <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                                    LASA
                                                </span>
                                            )}
                                            <PillBottleSVG
                                                isSelected={selectedBottle === item.id}
                                                isWrong={wrongBottle === item.id}
                                                isLookAlike={item.isLookAlike}
                                                color={item.isLookAlike ? "#f59e0b" : "#3b82f6"}
                                            />
                                            <div className="text-center">
                                                <p className="text-gray-900 font-bold text-sm leading-tight">{item.name}</p>
                                                <p className="text-blue-600 text-xs font-medium">{item.dose}</p>
                                                <p className="text-gray-400 text-xs">{item.form}</p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ──────── STEP 4: LABELING ──────── */}
                        {step === 4 && !done && (
                            <motion.div
                                key="labeling"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 rounded-xl p-2">
                                        <Tag className="text-orange-600" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">Step 5 — Auxiliary Labeling</h2>
                                        <p className="text-gray-500 text-xs">
                                            Select ONLY the required warning labels for this medication.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {activeCase.availableAuxiliaryLabels.map((label) => {
                                        const isSelected = selectedLabels.includes(label);
                                        return (
                                            <motion.button
                                                key={label}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() =>
                                                    setSelectedLabels((prev) =>
                                                        isSelected ? prev.filter((l) => l !== label) : [...prev, label]
                                                    )
                                                }
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-sm font-medium text-left ${isSelected
                                                        ? "border-blue-500 bg-blue-50 text-blue-800"
                                                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${isSelected ? "border-blue-500 bg-blue-600" : "border-gray-300 bg-white"}`}>
                                                    {isSelected && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                {label}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <p className="text-gray-400 text-xs text-center">
                                    {selectedLabels.length} label(s) selected
                                </p>
                                <button
                                    onClick={handleLabels}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-extrabold py-3.5 rounded-xl transition shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2"
                                >
                                    <Tag size={18} />
                                    Confirm Labels & Package
                                </button>
                            </motion.div>
                        )}

                        {/* ──────── STEP 5: COUNSELING ──────── */}
                        {step === 5 && !done && (
                            <motion.div
                                key="counseling"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-100 rounded-xl p-2">
                                        <MessageCircle className="text-teal-600" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900">Step 6 — Patient Counseling</h2>
                                        <p className="text-gray-500 text-xs">
                                            Question {counselingIdx + 1} of {activeCase.counseling.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Chat bubble */}
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                                    <div className="flex items-start gap-3">
                                        <motion.div
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <PatientAvatar
                                                skin={activeCase.avatarSeed.skin}
                                                hair={activeCase.avatarSeed.hair}
                                                shirt={activeCase.avatarSeed.shirt}
                                                size={60}
                                            />
                                        </motion.div>
                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 leading-relaxed flex-1 shadow-sm">
                                            <p className="text-blue-600 text-xs font-bold mb-1">
                                                {activeCase.patientName} asks:
                                            </p>
                                            {activeCase.counseling[counselingIdx]?.question}
                                        </div>
                                    </div>
                                </div>

                                {/* Answer options */}
                                <div className="space-y-3">
                                    {activeCase.counseling[counselingIdx]?.options.map((opt, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleCounseling(i)}
                                            className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 text-sm text-gray-800 transition shadow-sm"
                                        >
                                            <span className="w-7 h-7 rounded-full bg-gray-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ──────── RESULTS ──────── */}
                        {done && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center space-y-6"
                            >
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.6 }}
                                    className="flex justify-center"
                                >
                                    <div className="bg-green-100 border-2 border-green-500 rounded-full p-6">
                                        <CheckCircle size={52} className="text-green-500" />
                                    </div>
                                </motion.div>

                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">Dispensing Complete!</h2>
                                    <p className="text-gray-500 text-sm">
                                        Case {activeCase.id} — {activeCase.patientName}
                                    </p>
                                </div>

                                {/* Stat cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Final Score</p>
                                        <p className={`text-3xl font-black ${scoreColor}`}>{score}</p>
                                        <p className="text-gray-400 text-xs">/ 100 pts</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Errors</p>
                                        <p className={`text-3xl font-black ${errors === 0 ? "text-green-600" : "text-red-500"}`}>
                                            {errors}
                                        </p>
                                        <p className="text-gray-400 text-xs">mistake(s)</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Time</p>
                                        <p className="text-3xl font-black text-blue-600">{fmtTime(timer)}</p>
                                        <p className="text-gray-400 text-xs">elapsed</p>
                                    </div>
                                </div>

                                {score === 100 && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-semibold flex items-center justify-center gap-2">
                                        <Star className="text-yellow-500" size={16} />
                                        Perfect Score! Zero errors — excellent clinical judgment.
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => resetForCase(caseIdx)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 font-bold py-3 rounded-xl transition shadow-sm"
                                    >
                                        <RefreshCw size={16} />
                                        Retry Case
                                    </button>
                                    <button
                                        onClick={() => resetForCase(caseIdx + 1)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg"
                                    >
                                        Next Patient
                                        <SkipForward size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}