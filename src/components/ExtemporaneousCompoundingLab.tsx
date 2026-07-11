"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
    FlaskConical,
    Activity,
    Download,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Circle,
    PlayCircle,
    AlertCircle,
    Scale,
    Package,
    ClipboardList,
    Pill,
    Tag,
    Calculator,
    Lightbulb,
    Award,
    ArrowLeft,
    BookOpen,
    Beaker,
    Wrench,
} from "lucide-react";
import jsPDF from "jspdf";

// ============================================================
// DATA MODELS & PRESETS
// ============================================================

interface Ingredient {
    id: string;
    name: string;
    role: string;
    target: number;
    unit: "g" | "mL";
    calcPrompt: string;
    calcHint: string;
}

interface Formulation {
    name: string;
    dosageForm: "ointment" | "capsule" | "gel" | "suppository";
    strengthLabel: string;
    batchLabel: string;
    ingredients: Ingredient[];
    mixingMethod: "Geometric Dilution" | "Trituration" | "Levigation";
    container: "Ointment Jar" | "Amber Capsule Bottle" | "Gel Jar" | "Suppository Mould Strip";
    beyondUseDays: number;
    storage: string;
    equipment: string[];
    guidelines: string[];
}

const REFERENCES = [
    "USP General Chapter <795> — Pharmaceutical Compounding: Nonsterile Preparations",
    "Allen LV. The Art, Science, and Technology of Pharmaceutical Compounding.",
    "Remington: The Science and Practice of Pharmacy.",
];

const FORMULATIONS: Formulation[] = [
    {
        name: "Hydrocortisone Ointment 1%",
        dosageForm: "ointment",
        strengthLabel: "1% w/w",
        batchLabel: "30 g",
        ingredients: [
            {
                id: "hc",
                name: "Hydrocortisone powder",
                role: "Active",
                target: 0.3,
                unit: "g",
                calcPrompt: "This ointment is 1% w/w. Calculate the mass of hydrocortisone required for a 30 g batch.",
                calcHint: "mass = (strength% ÷ 100) × batch size = (1 ÷ 100) × 30 g",
            },
            {
                id: "petro",
                name: "White petroleum jelly",
                role: "Base",
                target: 29.7,
                unit: "g",
                calcPrompt: "Calculate the mass of white petroleum jelly needed to bring the batch to its full 30 g weight.",
                calcHint: "mass = batch size − active ingredient mass = 30 g − 0.3 g",
            },
        ],
        mixingMethod: "Levigation",
        container: "Ointment Jar",
        beyondUseDays: 90,
        storage: "Store at room temperature. Protect from heat.",
        equipment: ["Analytical balance", "Ointment slab or mixing pad", "Stainless steel spatula", "Weighing papers", "Ointment jar"],
        guidelines: [
            "Follow USP <795> nonsterile compounding standards throughout preparation.",
            "Levigate the hydrocortisone powder with a small portion of base before incorporating the remainder.",
            "Confirm the finished ointment is smooth and free of grit before packaging.",
            "Record lot numbers for both components in the compounding log.",
        ],
    },
    {
        name: "Progesterone Capsules 100 mg",
        dosageForm: "capsule",
        strengthLabel: "100 mg / capsule",
        batchLabel: "30 capsules",
        ingredients: [
            {
                id: "prog",
                name: "Progesterone powder",
                role: "Active",
                target: 3.0,
                unit: "g",
                calcPrompt: "Each capsule contains 100 mg of progesterone and the batch is 30 capsules. Calculate the total progesterone required.",
                calcHint: "mass = dose per capsule × number of capsules = 100 mg × 30 = 3000 mg = 3.0 g",
            },
            {
                id: "lact",
                name: "Lactose monohydrate",
                role: "Filler",
                target: 6.0,
                unit: "g",
                calcPrompt: "Each capsule is filled to a total weight of 300 mg. Calculate the total lactose (filler) required for the batch.",
                calcHint: "total fill = 300 mg × 30 = 9000 mg; filler = 9000 mg − 3000 mg = 6000 mg = 6.0 g",
            },
        ],
        mixingMethod: "Geometric Dilution",
        container: "Amber Capsule Bottle",
        beyondUseDays: 180,
        storage: "Store in a tight, light-resistant container at room temperature.",
        equipment: ["Analytical balance", "Mortar & pestle", "Capsule-filling tray", "Size 00 capsule shells", "Amber capsule bottle"],
        guidelines: [
            "Use geometric dilution to ensure uniform distribution of the potent active ingredient.",
            "Verify capsule shell size is appropriate for the total fill weight.",
            "Check fill weight uniformity on a sample of capsules before release.",
            "Store in a tight, light-resistant container away from moisture.",
        ],
    },
    {
        name: "Chlorhexidine Gluconate Gel 2%",
        dosageForm: "gel",
        strengthLabel: "2% w/w",
        batchLabel: "60 g",
        ingredients: [
            {
                id: "chx",
                name: "Chlorhexidine gluconate 20% solution",
                role: "Active",
                target: 6.0,
                unit: "mL",
                calcPrompt: "You are using a 20% w/v chlorhexidine stock solution to achieve a final 2% w/w concentration in a 60 g batch. Calculate the volume of stock solution required.",
                calcHint: "required active = (2 ÷ 100) × 60 g = 1.2 g; volume = 1.2 g ÷ (20 g/100 mL) = 6 mL",
            },
            {
                id: "carbo",
                name: "Carbopol gel base",
                role: "Vehicle",
                target: 54.0,
                unit: "g",
                calcPrompt: "Calculate the mass of gel base required to complete the 60 g batch.",
                calcHint: "mass = batch size − stock solution volume ≈ 60 g − 6 g = 54 g",
            },
        ],
        mixingMethod: "Levigation",
        container: "Gel Jar",
        beyondUseDays: 60,
        storage: "Refrigerate between 2–8°C. Do not freeze.",
        equipment: ["Analytical balance", "Graduated cylinder", "Glass mixing jar", "Spatula", "Gel jar"],
        guidelines: [
            "Measure the chlorhexidine stock solution using a calibrated graduated cylinder.",
            "Incorporate the active solution into the gel base gradually with continuous mixing.",
            "Check the final gel for uniform color and absence of lumps.",
            "Label for refrigerated storage due to reduced stability at room temperature.",
        ],
    },
    {
        name: "Diclofenac Sodium Suppositories 50 mg",
        dosageForm: "suppository",
        strengthLabel: "50 mg / suppository",
        batchLabel: "10 suppositories",
        ingredients: [
            {
                id: "dic",
                name: "Diclofenac sodium powder",
                role: "Active",
                target: 0.5,
                unit: "g",
                calcPrompt: "Each suppository contains 50 mg of diclofenac sodium, and the batch is 10 suppositories. Calculate the total active ingredient required.",
                calcHint: "mass = dose per unit × number of units = 50 mg × 10 = 500 mg = 0.5 g",
            },
            {
                id: "wit",
                name: "Witepsol suppository base",
                role: "Base",
                target: 19.5,
                unit: "g",
                calcPrompt: "Each mould cavity holds 2.0 g total. Calculate the mass of Witepsol base required (assume negligible displacement for this exercise).",
                calcHint: "total mass = 2.0 g × 10 = 20 g; base = 20 g − 0.5 g = 19.5 g",
            },
        ],
        mixingMethod: "Trituration",
        container: "Suppository Mould Strip",
        beyondUseDays: 180,
        storage: "Refrigerate between 2–8°C.",
        equipment: ["Analytical balance", "Suppository mould", "Fusion/water bath", "Mixing beaker", "Foil strip packaging"],
        guidelines: [
            "Calculate and apply the displacement value for the active ingredient before adding base.",
            "Melt the base gently to avoid degrading the heat-sensitive active ingredient.",
            "Pour into chilled moulds and allow to set fully before removing.",
            "Refrigerate the finished suppositories and dispense in a rigid, light-resistant container.",
        ],
    },
];

const BASE_QUIZ_QUESTIONS = [
    {
        q: "Why is compounding considered high-stakes even for simple preparations?",
        options: [
            "It always requires sterile technique",
            "Small errors in weighing or calculation directly affect patient dosing",
            "It is rarely reviewed by a pharmacist",
            "The equipment is difficult to clean",
        ],
        ans: 1,
    },
    {
        q: "Which technique involves mixing a potent powder with successively larger, equal portions of diluent?",
        options: ["Levigation", "Trituration", "Geometric dilution", "Fusion moulding"],
        ans: 2,
    },
    {
        q: "What must every compounding label include, at minimum?",
        options: [
            "Just the drug name",
            "Only the pharmacist's initials",
            "Drug name, strength, storage instructions, and beyond-use date",
            "The wholesale cost of the ingredients",
        ],
        ans: 2,
    },
];

const CONTAINER_OPTIONS: Formulation["container"][] = [
    "Ointment Jar",
    "Amber Capsule Bottle",
    "Gel Jar",
    "Suppository Mould Strip",
];

const METHOD_OPTIONS: Formulation["mixingMethod"][] = ["Geometric Dilution", "Trituration", "Levigation"];

// ============================================================
// SMALL UTILITIES
// ============================================================

const withinTolerance = (value: number, target: number, pct = 0.05) => Math.abs(value - target) <= target * pct;

const pointInRef = (point: { x: number; y: number }, ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return false;
    const rect = ref.current.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const right = rect.right + window.scrollX;
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
};

const mixHex = (hex1: string, hex2: string, t: number) => {
    const clamp = Math.max(0, Math.min(1, t));
    const a = parseInt(hex1.slice(1), 16);
    const b = parseInt(hex2.slice(1), 16);
    const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
    const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
    const rr = Math.round(ar + (br - ar) * clamp);
    const rg = Math.round(ag + (bg - ag) * clamp);
    const rb = Math.round(ab + (bb - ab) * clamp);
    return `rgb(${rr}, ${rg}, ${rb})`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CompoundingLab() {
    const topRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<"browse" | "study" | "quiz" | "simulation">("browse");
    const [formulation, setFormulation] = useState<Formulation | null>(null);

    // Quiz
    const [quizStep, setQuizStep] = useState(0);
    const [quizFeedback, setQuizFeedback] = useState<"correct" | "incorrect" | null>(null);

    const quizQuestions = useMemo(() => {
        if (!formulation) return BASE_QUIZ_QUESTIONS;
        const distractors = METHOD_OPTIONS.filter((m) => m !== formulation.mixingMethod);
        const options = [formulation.mixingMethod, ...distractors].sort(() => Math.random() - 0.5);
        return [
            ...BASE_QUIZ_QUESTIONS,
            {
                q: `Based on the study card, which mixing technique is correct for ${formulation.name}?`,
                options,
                ans: options.indexOf(formulation.mixingMethod),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formulation?.name]);

    // Sim step (1 Calculation, 2 Weighing, 3 Mixing, 4 Package, 5 Transfer, 6 Label, 7 Documentation, 8 Certificate)
    const [simStep, setSimStep] = useState(1);

    // Step 1: Calculation
    const [calcAnswers, setCalcAnswers] = useState<Record<string, string>>({});
    const [calcCorrect, setCalcCorrect] = useState<Record<string, boolean>>({});
    const [calcAttempts, setCalcAttempts] = useState<Record<string, number>>({});
    const [calcHintShown, setCalcHintShown] = useState<Record<string, boolean>>({});

    // Step 2: Weighing
    const [activeIngredientIdx, setActiveIngredientIdx] = useState(0);
    const [spatulaLoaded, setSpatulaLoaded] = useState(false);
    const [currentMass, setCurrentMass] = useState(0);
    const [weighedMasses, setWeighedMasses] = useState<Record<string, number>>({});
    const [weighingComplete, setWeighingComplete] = useState(false);
    const balanceZoneRef = useRef<HTMLDivElement>(null);

    // Step 3: Mixing
    const [methodChoice, setMethodChoice] = useState<string | null>(null);
    const [methodAttempts, setMethodAttempts] = useState(0);
    const [activeInMortar, setActiveInMortar] = useState(false);
    const [vehicleInMortar, setVehicleInMortar] = useState(false);
    const [grindCount, setGrindCount] = useState(0);
    const GRIND_NEEDED = 3;
    const [mixed, setMixed] = useState(false);
    const mortarZoneRef = useRef<HTMLDivElement>(null);
    const pestleControls = useAnimation();
    const [grindBurst, setGrindBurst] = useState(0);

    // Step 4: Package selection
    const [containerChoice, setContainerChoice] = useState<string | null>(null);
    const [containerAttempts, setContainerAttempts] = useState(0);
    const benchZoneRef = useRef<HTMLDivElement>(null);

    // Step 5: Transfer & Fill
    const [fillSpatulaLoaded, setFillSpatulaLoaded] = useState(false);
    const [fillProgress, setFillProgress] = useState(0);
    const [transferComplete, setTransferComplete] = useState(false);
    const containerZoneRef = useRef<HTMLDivElement>(null);

    // Step 6: Labelling
    const [labelPlaced, setLabelPlaced] = useState(false);
    const [labelAttempts, setLabelAttempts] = useState(0);
    const labelZoneRef = useRef<HTMLDivElement>(null);

    // Step 7: Documentation
    const [batchNumber] = useState(() => `CMP-${Math.floor(1000 + Math.random() * 9000)}`);
    const [checklist, setChecklist] = useState({
        calculations: false,
        ingredients: false,
        appearance: false,
        weight: false,
    });

    // Step 8: Certificate
    const [studentName, setStudentName] = useState("");

    // ──────────────── DERIVED ────────────────

    const allChecked = Object.values(checklist).every(Boolean);

    const calcCreditFor = (attempts: number) => (attempts <= 1 ? 1 : attempts === 2 ? 0.6 : 0.3);
    const calcScore = formulation
        ? Math.round(
              15 *
                  (formulation.ingredients.reduce((sum, ing) => sum + (calcCorrect[ing.id] ? calcCreditFor(calcAttempts[ing.id] || 1) : 0), 0) /
                      formulation.ingredients.length)
          )
        : 0;

    const score = formulation
        ? calcScore +
          (weighingComplete ? 15 : 0) +
          (methodAttempts === 1 && mixed ? 15 : mixed ? 9 : 0) +
          (containerAttempts === 1 ? 10 : containerAttempts > 1 ? 6 : 0) +
          (transferComplete ? 10 : 0) +
          (labelAttempts === 1 ? 10 : labelAttempts > 1 ? 6 : 0) +
          (allChecked ? 15 : Math.round(15 * (Object.values(checklist).filter(Boolean).length / 4))) +
          (labelPlaced && transferComplete ? 10 : 0)
        : 0;

    // ──────────────── EFFECTS ────────────────

    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [phase, simStep, quizStep]);

    // ──────────────── HANDLERS ────────────────

    const handleQuizAnswer = (idx: number) => {
        setQuizFeedback(idx === quizQuestions[quizStep].ans ? "correct" : "incorrect");
        setTimeout(() => {
            setQuizFeedback(null);
            if (quizStep < quizQuestions.length - 1) {
                setQuizStep((s) => s + 1);
            } else {
                setPhase("simulation");
            }
        }, 1500);
    };

    const selectFormulation = (f: Formulation) => {
        setFormulation(f);
        setPhase("study");
    };

    const startSimulation = () => {
        setSimStep(1);
        setCalcAnswers({});
        setCalcCorrect({});
        setCalcAttempts({});
        setCalcHintShown({});
        setActiveIngredientIdx(0);
        setSpatulaLoaded(false);
        setCurrentMass(0);
        setWeighedMasses({});
        setWeighingComplete(false);
        setMethodChoice(null);
        setMethodAttempts(0);
        setActiveInMortar(false);
        setVehicleInMortar(false);
        setGrindCount(0);
        setGrindBurst(0);
        setMixed(false);
        setContainerChoice(null);
        setContainerAttempts(0);
        setFillSpatulaLoaded(false);
        setFillProgress(0);
        setTransferComplete(false);
        setLabelPlaced(false);
        setLabelAttempts(0);
        setChecklist({ calculations: false, ingredients: false, appearance: false, weight: false });
        setQuizStep(0);
    };

    // Step 1: Calculation
    const checkCalc = (ing: Ingredient) => {
        const raw = parseFloat(calcAnswers[ing.id] ?? "");
        const attempts = (calcAttempts[ing.id] || 0) + 1;
        setCalcAttempts((p) => ({ ...p, [ing.id]: attempts }));
        if (!Number.isNaN(raw) && withinTolerance(raw, ing.target)) {
            setCalcCorrect((p) => ({ ...p, [ing.id]: true }));
        } else {
            setCalcCorrect((p) => ({ ...p, [ing.id]: false }));
        }
    };

    const allCalcCorrect = formulation ? formulation.ingredients.every((i) => calcCorrect[i.id]) : false;

    // Step 2: Weighing
    const handleSpatulaDragEnd = (info: { point: { x: number; y: number } }) => {
        if (!spatulaLoaded || !formulation) return;
        if (!pointInRef(info.point, balanceZoneRef)) return;
        const target = formulation.ingredients[activeIngredientIdx].target;
        const remaining = target - currentMass;
        let added = 0;
        if (remaining > target * 0.3) added = remaining * (0.4 + Math.random() * 0.2);
        else if (remaining > target * 0.05) added = remaining * (0.3 + Math.random() * 0.2);
        else added = remaining;
        const newMass = parseFloat((currentMass + added).toFixed(4));
        setCurrentMass(newMass);
        setSpatulaLoaded(false);
        if (newMass >= target - target * 0.01) {
            const ing = formulation.ingredients[activeIngredientIdx];
            setWeighedMasses((prev) => ({ ...prev, [ing.id]: newMass }));
            if (activeIngredientIdx >= formulation.ingredients.length - 1) {
                setTimeout(() => setWeighingComplete(true), 700);
            }
        }
    };

    const nextIngredient = () => {
        setActiveIngredientIdx((i) => i + 1);
        setCurrentMass(0);
    };

    // Step 3: Mixing
    const chooseMethod = (m: string) => {
        if (methodChoice || !formulation) return;
        setMethodAttempts((n) => n + 1);
        if (m === formulation.mixingMethod) {
            setMethodChoice(m);
        } else {
            setMethodChoice("__wrong__");
            setTimeout(() => setMethodChoice(null), 900);
        }
    };

    const handleTrayDragEnd = (info: { point: { x: number; y: number } }, which: "active" | "vehicle") => {
        if (!pointInRef(info.point, mortarZoneRef)) return;
        if (which === "active") setActiveInMortar(true);
        else setVehicleInMortar(true);
    };

    const handlePestleDragEnd = () => {
        if (!activeInMortar || !vehicleInMortar || mixed) return;
        pestleControls.start({ rotate: [0, -22, 16, -8, 0], y: [0, 6, 0] }, { duration: 0.45, ease: "easeOut" });
        setGrindBurst((b) => b + 1);
        setGrindCount((c) => {
            const next = c + 1;
            if (next >= GRIND_NEEDED) {
                setTimeout(() => {
                    setMixed(true);
                    pestleControls.start({ rotate: 360, scale: [1, 1.2, 1] }, { duration: 0.7, ease: "easeInOut" });
                }, 300);
            }
            return next;
        });
    };

    // Step 4: Package selection
    const handleContainerDragEnd = (info: { point: { x: number; y: number } }, c: string) => {
        if (containerChoice) return;
        if (!pointInRef(info.point, benchZoneRef)) return;
        setContainerAttempts((n) => n + 1);
        if (c === formulation?.container) {
            setContainerChoice(c);
        } else {
            setContainerChoice("__wrong__");
            setTimeout(() => setContainerChoice(null), 900);
        }
    };

    // Step 5: Transfer & Fill
    const handleFillDragEnd = (info: { point: { x: number; y: number } }) => {
        if (!fillSpatulaLoaded || transferComplete) return;
        if (!pointInRef(info.point, containerZoneRef)) return;
        setFillSpatulaLoaded(false);
        setFillProgress((p) => {
            const next = Math.min(100, p + 34);
            if (next >= 100) setTimeout(() => setTransferComplete(true), 400);
            return next;
        });
    };

    // Step 6: Labelling
    const handleLabelDragEnd = (info: { point: { x: number; y: number } }) => {
        if (labelPlaced) return;
        setLabelAttempts((n) => n + 1);
        if (pointInRef(info.point, labelZoneRef)) {
            setLabelPlaced(true);
        }
    };

    const toggleCheck = (key: keyof typeof checklist) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // ──────────────── PDF GENERATION ────────────────

    const generateReportPDF = () => {
        if (!formulation) return;
        const doc = new jsPDF();
        const bud = new Date();
        bud.setDate(bud.getDate() + formulation.beyondUseDays);

        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PharmaWallah", 20, 20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Compounding Record & Assessment Report", 20, 28);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(formulation.name, 20, 55);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 60, 190, 60);

        doc.setFontSize(14);
        doc.text("1. Formulation Details", 20, 75);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setFillColor(245, 247, 250);
        doc.rect(20, 80, 170, 32, "F");
        doc.text(`Batch Number: ${batchNumber}`, 25, 90);
        doc.text(`Strength: ${formulation.strengthLabel}`, 120, 90);
        doc.text(`Batch Size: ${formulation.batchLabel}`, 25, 100);
        doc.text(`Beyond-Use Date: ${bud.toLocaleDateString()}`, 120, 100);
        doc.text(`Mixing Method: ${formulation.mixingMethod}`, 25, 108);

        doc.setFont("helvetica", "bold");
        doc.text("2. Gravimetric Data", 20, 128);
        doc.setFont("helvetica", "normal");
        const ingRowsHeight = 10 + formulation.ingredients.length * 8;
        doc.rect(20, 133, 170, ingRowsHeight);
        let y = 143;
        formulation.ingredients.forEach((ing) => {
            const weighed = weighedMasses[ing.id] ?? 0;
            doc.text(`${ing.name}: ${weighed.toFixed(4)} ${ing.unit}`, 25, y);
            doc.text(`Target: ${ing.target.toFixed(4)} ${ing.unit}`, 120, y);
            y += 8;
        });

        const sec3y = 133 + ingRowsHeight + 15;
        doc.setFont("helvetica", "bold");
        doc.text("3. Packaging & Labelling", 20, sec3y);
        doc.setFont("helvetica", "normal");
        doc.rect(20, sec3y + 5, 170, 25);
        doc.text(`Container Used: ${containerChoice ?? "N/A"}`, 25, sec3y + 15);
        doc.text(`Storage: ${formulation.storage}`, 25, sec3y + 23);

        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("4. Assessment Score Breakdown", 20, 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const rows: [string, number][] = [
            ["Calculation accuracy", calcScore],
            ["Accurate weighing (±5%)", weighingComplete ? 15 : 0],
            ["Correct mixing technique", methodAttempts === 1 && mixed ? 15 : mixed ? 9 : 0],
            ["Correct container selection", containerAttempts === 1 ? 10 : containerAttempts > 1 ? 6 : 0],
            ["Transfer & fill technique", transferComplete ? 10 : 0],
            ["Labelling accuracy", labelAttempts === 1 ? 10 : labelAttempts > 1 ? 6 : 0],
            ["Documentation completeness", allChecked ? 15 : Math.round(15 * (Object.values(checklist).filter(Boolean).length / 4))],
            ["Final quality check", labelPlaced && transferComplete ? 10 : 0],
        ];
        let ry = 32;
        rows.forEach(([label, pts]) => {
            doc.text(label, 25, ry);
            doc.text(`${pts} pts`, 165, ry);
            ry += 9;
        });
        doc.setFont("helvetica", "bold");
        doc.setDrawColor(37, 99, 235);
        doc.line(20, ry, 190, ry);
        doc.text(`Total Score: ${score} / 100`, 25, ry + 10);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "normal");
        doc.text("Generated by PharmaWallah Compounding Lab Simulator", 20, 285);

        doc.save(`PharmaWallah_Compounding_${formulation.name.replace(/\s+/g, "_")}.pdf`);
    };

    const generateCertificatePDF = () => {
        if (!formulation) return;
        const name = studentName.trim() || "Pharm.D. Student";
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const W = 297;
        const H = 210;

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, W, H, "F");
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(2);
        doc.rect(8, 8, W - 16, H - 16);
        doc.setDrawColor(74, 222, 128);
        doc.setLineWidth(0.7);
        doc.rect(12, 12, W - 24, H - 24);

        doc.setFillColor(37, 99, 235);
        doc.circle(W / 2, 38, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("P", W / 2, 42, { align: "center" });

        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.text("Certificate of Completion", W / 2, 65, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("PharmaWallah Compounding Lab", W / 2, 74, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(71, 85, 105);
        doc.text("This certifies that", W / 2, 95, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235);
        doc.text(name, W / 2, 110, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(71, 85, 105);
        doc.text(`has successfully compounded and validated`, W / 2, 124, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.text(formulation.name, W / 2, 133, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Final Score: ${score} / 100`, W / 2, 148, { align: "center" });
        doc.text(`Batch Number: ${batchNumber}`, W / 2, 156, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 40, H - 30);
        doc.line(30, H - 40, 90, H - 40);
        doc.text("Date Issued", 45, H - 33);

        doc.line(W - 90, H - 40, W - 30, H - 40);
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(10);
        doc.text("PharmaWallah Faculty of Pharmacy", W - 90, H - 33);

        doc.save(`PharmaWallah_Certificate_${name.replace(/\s+/g, "_")}.pdf`);
    };

    // ============================================================
    // SVG ASSETS
    // ============================================================

    const ChemicalBottleSVG = ({ label }: { label: string }) => (
        <svg width="80" height="120" viewBox="0 0 120 180" className="drop-shadow-lg pointer-events-none">
            <path
                d="M20 60 Q20 40 40 40 L80 40 Q100 40 100 60 L100 170 Q100 180 90 180 L30 180 Q20 180 20 170 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="4"
            />
            <rect x="35" y="10" width="50" height="30" rx="4" fill="#3b82f6" />
            <rect x="45" y="40" width="30" height="10" fill="#e2e8f0" />
            <rect x="25" y="80" width="70" height="60" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <text x="60" y="105" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
                {label}
            </text>
        </svg>
    );

    const SpatulaSVG = ({ loaded, color }: { loaded: boolean; color: string }) => (
        <svg width="80" height="24" viewBox="0 0 140 40" className="drop-shadow-md pointer-events-none">
            <rect x="0" y="15" width="80" height="10" rx="5" fill="#ef4444" />
            <path d="M80 18 L130 18 Q140 20 130 22 L80 22 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            {loaded && <ellipse cx="120" cy="17" rx="10" ry="4" fill={color} />}
        </svg>
    );

    const BalanceSVG = ({ massLabel, color }: { massLabel: string; color: string }) => (
        <svg width="200" height="180" viewBox="0 0 240 220" className="drop-shadow-xl pointer-events-none">
            <rect x="20" y="20" width="200" height="130" fill="#f1f5f9" opacity="0.4" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M10 150 L230 150 L240 210 L0 210 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
            <rect x="60" y="165" width="120" height="30" rx="4" fill="#020617" />
            <text x="120" y="186" textAnchor="middle" fill="#4ade80" fontSize="16" fontFamily="monospace" fontWeight="bold">
                {massLabel}
            </text>
            <ellipse cx="120" cy="110" rx="45" ry="15" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
            <rect x="110" y="110" width="20" height="40" fill="#94a3b8" />
            <path d="M75 95 L165 95 L145 110 L95 110 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
            <ellipse cx="120" cy="100" rx="20" ry="6" fill={color} />
        </svg>
    );

    const MortarSVG = ({
        activeLoaded,
        vehicleLoaded,
        grindProgress = 0,
        activeColor = "#f59e0b",
        vehicleColor = "#0ea5e9",
    }: {
        activeLoaded: boolean;
        vehicleLoaded: boolean;
        grindProgress?: number;
        activeColor?: string;
        vehicleColor?: string;
    }) => {
        const t = Math.max(0, Math.min(1, grindProgress));
        const blended = mixHex(activeColor, vehicleColor, 0.5);
        const leftCx = 90 + t * 20;
        const rightCx = 130 - t * 20;
        const individualOpacity = 1 - t;
        const blendOpacity = t;
        const speckles = [
            [78, 96], [102, 100], [126, 97], [144, 101], [92, 104], [118, 103], [136, 95], [86, 98],
        ];
        return (
            <svg width="200" height="150" viewBox="0 0 220 200" className="pointer-events-none drop-shadow-md">
                <defs>
                    <radialGradient id="mortarBody" cx="35%" cy="25%" r="80%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="50%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#a8b3c4" />
                    </radialGradient>
                    <linearGradient id="mortarRim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#c3cbd7" />
                    </linearGradient>
                    <radialGradient id="mortarInnerShadow" cx="50%" cy="15%" r="85%">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
                        <stop offset="65%" stopColor="#64748b" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="grainA" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor={activeColor} />
                    </radialGradient>
                    <radialGradient id="grainB" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#e0f2fe" />
                        <stop offset="100%" stopColor={vehicleColor} />
                    </radialGradient>
                    <radialGradient id="grainBlend" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="100%" stopColor={blended} />
                    </radialGradient>
                </defs>

                {/* base contact shadow */}
                <ellipse cx="110" cy="158" rx="78" ry="14" fill="#0f172a" opacity="0.1" />

                {/* bowl body */}
                <path
                    d="M38 96 Q38 162 110 168 Q182 162 182 96 L182 88 L38 88 Z"
                    fill="url(#mortarBody)"
                    stroke="#94a3b8"
                    strokeWidth="3"
                />
                {/* inner depth shadow */}
                <path d="M38 96 Q38 162 110 168 Q182 162 182 96 L182 88 L38 88 Z" fill="url(#mortarInnerShadow)" />

                {/* contents: two separate mounds fading as they blend into one */}
                {(activeLoaded || vehicleLoaded) && (
                    <>
                        {activeLoaded && (
                            <motion.ellipse
                                animate={{ cx: leftCx, opacity: individualOpacity }}
                                transition={{ duration: 0.4 }}
                                cy="98" rx="24" ry="7" fill="url(#grainA)"
                            />
                        )}
                        {vehicleLoaded && (
                            <motion.ellipse
                                animate={{ cx: rightCx, opacity: individualOpacity }}
                                transition={{ duration: 0.4 }}
                                cy="100" rx="27" ry="8" fill="url(#grainB)"
                            />
                        )}
                        {activeLoaded && vehicleLoaded && (
                            <motion.ellipse
                                animate={{ opacity: blendOpacity, rx: 30 + t * 8, ry: 8 + t * 2 }}
                                transition={{ duration: 0.4 }}
                                cx="110" cy="99" fill="url(#grainBlend)"
                            />
                        )}
                        {t > 0.15 &&
                            speckles.map(([sx, sy], i) => (
                                <circle key={i} cx={sx} cy={sy - t * 2} r={1.1} fill="#78350f" opacity={0.25 * blendOpacity} />
                            ))}
                        {t >= 1 && <ellipse cx="98" cy="95" rx="14" ry="3" fill="#ffffff" opacity="0.35" />}
                    </>
                )}

                {/* rim */}
                <ellipse cx="110" cy="88" rx="72" ry="15" fill="none" stroke="url(#mortarRim)" strokeWidth="5" />
                <ellipse cx="110" cy="86" rx="70" ry="13" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
            </svg>
        );
    };

    const DustBurst = ({ burstKey }: { burstKey: number }) => {
        if (burstKey === 0) return null;
        const specks = [-18, -8, 0, 8, 18, -12, 12];
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {specks.map((dx, i) => (
                    <motion.div
                        key={`${burstKey}-${i}`}
                        initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
                        animate={{ opacity: 0, x: dx, y: -20 - Math.abs(dx), scale: 0.4 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
                    />
                ))}
            </div>
        );
    };

    const PestleSVG = ({ dragging }: { dragging: boolean }) => (
        <svg width="64" height="128" viewBox="0 0 64 128" className="drop-shadow-lg">
            <defs>
                <linearGradient id="pestleShaft" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="35%" stopColor="#f1f5f9" />
                    <stop offset="65%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <radialGradient id="pestleHead" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="55%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#8f9bb0" />
                </radialGradient>
            </defs>
            <rect x="23" y="4" width="18" height="78" rx="9" fill="url(#pestleShaft)" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="32" cy="96" rx="18" ry="14" fill="url(#pestleHead)" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="26" cy="90" rx="6" ry="4" fill="#ffffff" opacity="0.7" />
        </svg>
    );

    const OintmentJarSVG = () => (
        <svg width="90" height="90" viewBox="0 0 120 120" className="pointer-events-none">
            <rect x="20" y="35" width="80" height="70" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" />
            <rect x="15" y="20" width="90" height="20" rx="4" fill="#3b82f6" />
            <ellipse cx="60" cy="45" rx="35" ry="6" fill="#e2e8f0" />
        </svg>
    );

    const CapsuleBottleSVG = () => (
        <svg width="90" height="90" viewBox="0 0 120 120" className="pointer-events-none">
            <path d="M35 40 L85 40 L90 105 Q90 112 82 112 L38 112 Q30 112 30 105 Z" fill="#7c4a1e" opacity="0.85" stroke="#5c3512" strokeWidth="2" />
            <rect x="30" y="18" width="60" height="22" rx="4" fill="#334155" />
            <ellipse cx="60" cy="40" rx="27" ry="5" fill="#1e293b" opacity="0.4" />
        </svg>
    );

    const GelJarSVG = () => (
        <svg width="90" height="90" viewBox="0 0 120 120" className="pointer-events-none">
            <path d="M40 30 L80 30 L85 105 Q85 112 77 112 L43 112 Q35 112 35 105 Z" fill="#bae6fd" opacity="0.8" stroke="#94a3b8" strokeWidth="3" />
            <rect x="38" y="15" width="44" height="18" rx="4" fill="#0ea5e9" />
        </svg>
    );

    const SuppositoryMouldSVG = () => (
        <svg width="90" height="90" viewBox="0 0 120 120" className="pointer-events-none">
            <rect x="15" y="45" width="90" height="35" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((i) => (
                <ellipse key={i} cx={30 + i * 16} cy="62" rx="6" ry="11" fill="#fef3c7" stroke="#d4a373" strokeWidth="1.5" />
            ))}
        </svg>
    );

    const containerSVG = (c: string | null) => {
        switch (c) {
            case "Ointment Jar":
                return <OintmentJarSVG />;
            case "Amber Capsule Bottle":
                return <CapsuleBottleSVG />;
            case "Gel Jar":
                return <GelJarSVG />;
            case "Suppository Mould Strip":
                return <SuppositoryMouldSVG />;
            default:
                return null;
        }
    };

    const LabelTagSVG = () => (
        <svg width="90" height="60" viewBox="0 0 140 90" className="drop-shadow-md pointer-events-none">
            <rect x="5" y="5" width="130" height="80" rx="6" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="18" y1="24" x2="122" y2="24" stroke="#94a3b8" strokeWidth="3" />
            <line x1="18" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="18" y1="56" x2="110" y2="56" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="18" y1="72" x2="80" y2="72" stroke="#cbd5e1" strokeWidth="3" />
        </svg>
    );

    // ============================================================
    // TOP NAV
    // ============================================================

    const NavTabs = () => (
        <div className="flex space-x-1 md:space-x-3 text-xs md:text-sm font-bold bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
            <button
                onClick={() => setPhase("browse")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all flex-shrink-0 whitespace-nowrap ${phase === "browse" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
                Formulations
            </button>
            <button
                onClick={() => formulation && setPhase("study")}
                disabled={!formulation}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all disabled:opacity-30 flex-shrink-0 whitespace-nowrap ${phase === "study" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
                Study Card
            </button>
            <button
                onClick={() => formulation && setPhase("quiz")}
                disabled={!formulation}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all disabled:opacity-30 flex-shrink-0 whitespace-nowrap ${phase === "quiz" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
                Quiz
            </button>
            <button
                onClick={() => formulation && setPhase("simulation")}
                disabled={!formulation}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-all disabled:opacity-30 flex-shrink-0 whitespace-nowrap ${phase === "simulation" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
                Simulation
            </button>
        </div>
    );

    // ============================================================
    // PHASE: BROWSE
    // ============================================================

    const dosageIcon = (form: Formulation["dosageForm"]) => {
        switch (form) {
            case "ointment":
                return <FlaskConical size={32} className="md:w-10 md:h-10" />;
            case "capsule":
                return <Pill size={32} className="md:w-10 md:h-10" />;
            case "gel":
                return <Activity size={32} className="md:w-10 md:h-10" />;
            case "suppository":
                return <Package size={32} className="md:w-10 md:h-10" />;
        }
    };

    const renderBrowse = () => (
        <div className="space-y-6">
            <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Formulation Library</h2>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Select a formulation to review, quiz on, and compound.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {FORMULATIONS.map((f, i) => (
                    <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={i}
                        onClick={() => selectFormulation(f)}
                        className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-gray-100 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-xl transition-all group"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-green-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                            {dosageIcon(f.dosageForm)}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">{f.name}</h3>
                        <div className="w-full h-px bg-gray-100 my-3 md:my-4" />
                        <div className="text-xs md:text-sm text-gray-600 space-y-2 w-full text-left bg-gray-50 p-3 rounded-lg">
                            <p className="flex justify-between">
                                <span>Strength:</span> <strong className="text-blue-600">{f.strengthLabel}</strong>
                            </p>
                            <p className="flex justify-between">
                                <span>Batch:</span> <strong>{f.batchLabel}</strong>
                            </p>
                            <p className="flex justify-between">
                                <span>Form:</span> <strong className="capitalize">{f.dosageForm}</strong>
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );

    // ============================================================
    // PHASE: STUDY CARD
    // ============================================================

    const renderStudy = () => {
        if (!formulation) return null;
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
                <button onClick={() => setPhase("browse")} className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700">
                    <ArrowLeft size={16} className="mr-1" /> Back to Formulations
                </button>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between flex-wrap gap-3 border-b pb-5 mb-5">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{formulation.name}</h2>
                            <p className="text-gray-500 text-sm md:text-base mt-1 capitalize">{formulation.dosageForm} · {formulation.strengthLabel} · {formulation.batchLabel}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-green-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {dosageIcon(formulation.dosageForm)}
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-800 mb-3 flex items-center text-sm md:text-base">
                        <BookOpen className="mr-2 text-blue-500" size={18} /> Master Formula
                    </h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm border rounded-xl overflow-hidden">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="text-left p-3 font-bold">Ingredient</th>
                                    <th className="text-left p-3 font-bold">Role</th>
                                    <th className="text-right p-3 font-bold">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formulation.ingredients.map((ing) => (
                                    <tr key={ing.id} className="border-t">
                                        <td className="p-3 text-slate-700">{ing.name}</td>
                                        <td className="p-3 text-slate-500">{ing.role}</td>
                                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                                            {ing.target.toFixed(4)} {ing.unit}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center text-sm md:text-base">
                                <Wrench className="mr-2 text-blue-500" size={18} /> Equipment
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                {formulation.equipment.map((e, i) => (
                                    <li key={i} className="flex items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        <Beaker size={14} className="mr-2 text-blue-400 flex-shrink-0" /> {e}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center text-sm md:text-base">
                                <ClipboardList className="mr-2 text-blue-500" size={18} /> Guidelines
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                {formulation.guidelines.map((g, i) => (
                                    <li key={i} className="flex items-start bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                                        <CheckCircle2 size={14} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" /> {g}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                        <h3 className="font-bold text-slate-800 mb-2 text-sm">References</h3>
                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                            {REFERENCES.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => setPhase("quiz")}
                        className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                    >
                        Start Knowledge Check
                    </button>
                </div>
            </motion.div>
        );
    };

    // ============================================================
    // PHASE: QUIZ
    // ============================================================

    const renderQuiz = () => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 max-w-2xl w-full mx-auto">
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Knowledge Check</h2>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Q {quizStep + 1} / {quizQuestions.length}
                </span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 font-medium">{quizQuestions[quizStep].q}</p>
            <div className="space-y-3 md:space-y-4">
                {quizQuestions[quizStep].options.map((opt, i) => {
                    const isCorrectAns = i === quizQuestions[quizStep].ans;
                    let btnClass = "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
                    if (quizFeedback === "correct" && isCorrectAns) btnClass = "bg-green-100 border-green-500 text-green-800";
                    if (quizFeedback === "incorrect" && !isCorrectAns) btnClass = "bg-red-50 border-red-200 text-red-500 opacity-50";
                    if (quizFeedback === "incorrect" && isCorrectAns) btnClass = "bg-green-50 border-green-300 text-green-700";
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
                            className={`p-3 rounded-xl flex items-center justify-center font-bold text-sm ${quizFeedback === "correct" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                            {quizFeedback === "correct" ? <CheckCircle2 className="mr-2" size={18} /> : <AlertCircle className="mr-2" size={18} />}
                            <span>{quizFeedback === "correct" ? "Correct!" : "Not quite."}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    // ============================================================
    // SIM STEP 1: CALCULATION
    // ============================================================

    const renderSimStep1 = () => {
        if (!formulation) return null;
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Calculator className="mr-3 text-blue-600" size={24} /> Ingredient Calculations
                </h2>
                <div className="space-y-5">
                    {formulation.ingredients.map((ing) => {
                        const isCorrect = calcCorrect[ing.id];
                        const attempted = calcAttempts[ing.id] > 0;
                        return (
                            <div
                                key={ing.id}
                                className={`p-4 md:p-5 rounded-xl border-2 ${isCorrect ? "border-green-300 bg-green-50" : attempted ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                            >
                                <p className="font-bold text-slate-800 text-sm md:text-base mb-1">{ing.name} <span className="font-normal text-slate-500">({ing.role})</span></p>
                                <p className="text-sm text-slate-600 mb-3">{ing.calcPrompt}</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        disabled={isCorrect}
                                        value={calcAnswers[ing.id] ?? ""}
                                        onChange={(e) => setCalcAnswers((p) => ({ ...p, [ing.id]: e.target.value }))}
                                        placeholder={`Answer in ${ing.unit}`}
                                        className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:border-blue-400 focus:outline-none disabled:bg-white disabled:opacity-70"
                                    />
                                    {!isCorrect && (
                                        <button
                                            onClick={() => checkCalc(ing)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
                                        >
                                            Check Answer
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setCalcHintShown((p) => ({ ...p, [ing.id]: !p[ing.id] }))}
                                        className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-xs flex items-center hover:bg-amber-100"
                                    >
                                        <Lightbulb size={14} className="mr-1" /> {calcHintShown[ing.id] ? "Hide Hint" : "Show Hint"}
                                    </button>
                                    {isCorrect && (
                                        <span className="flex items-center text-green-700 font-bold text-sm">
                                            <CheckCircle2 size={16} className="mr-1" /> Correct
                                        </span>
                                    )}
                                    {attempted && !isCorrect && (
                                        <span className="flex items-center text-red-500 font-bold text-sm">
                                            <AlertCircle size={16} className="mr-1" /> Try again
                                        </span>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {calcHintShown[ing.id] && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 font-mono"
                                        >
                                            {ing.calcHint}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {allCalcCorrect && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSimStep(2)}
                        className="w-full mt-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg flex justify-center items-center"
                    >
                        Proceed to Weighing <ChevronRight className="ml-2" />
                    </motion.button>
                )}
            </div>
        );
    };

    // ============================================================
    // SIM STEP 2: WEIGHING (drag spatula → balance)
    // ============================================================

    const renderSimStep2 = () => {
        if (!formulation) return null;
        const ing = formulation.ingredients[activeIngredientIdx];
        const color = activeIngredientIdx === 0 ? "#fcd34d" : "#bae6fd";

        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Scale className="mr-3 text-blue-600" size={24} /> Ingredient Weighing
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    <div className="lg:col-span-8 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
                            <div className="flex flex-col items-center cursor-pointer group flex-shrink-0" onClick={() => setSpatulaLoaded(true)}>
                                <div className="relative">
                                    <ChemicalBottleSVG label={ing.name} />
                                    {!spatulaLoaded && currentMass < ing.target && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 animate-ping opacity-30" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow mt-2 whitespace-nowrap">
                                    Tap to load spatula
                                </span>
                            </div>

                            <motion.div
                                drag
                                dragSnapToOrigin
                                dragElastic={0.4}
                                dragMomentum={false}
                                style={{ touchAction: "none" }}
                                whileDrag={{ scale: 1.15, zIndex: 50 }}
                                onDragEnd={(e, info) => handleSpatulaDragEnd(info)}
                                className="flex flex-col items-center cursor-grab active:cursor-grabbing touch-none flex-shrink-0 relative z-20 py-3"
                            >
                                <SpatulaSVG loaded={spatulaLoaded} color={color} />
                                {spatulaLoaded && (
                                    <span className="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shadow mt-2 whitespace-nowrap animate-pulse">
                                        Drag to balance ↕
                                    </span>
                                )}
                            </motion.div>

                            <div ref={balanceZoneRef} className="flex flex-col items-center flex-shrink-0 scale-[0.8] sm:scale-90 md:scale-100">
                                <BalanceSVG massLabel={`${currentMass.toFixed(4)} ${ing.unit}`} color={color} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col space-y-4 text-sm md:text-base">
                        <div className="bg-blue-50 p-4 md:p-5 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-2 text-sm md:text-base">Status Box</h3>
                            <ul className="text-sm space-y-2 md:space-y-3 font-medium text-blue-800">
                                {formulation.ingredients.map((i2) => (
                                    <li key={i2.id} className="flex justify-between items-center">
                                        <span>{i2.name}:</span>
                                        <span className="bg-white px-2 py-1 rounded border shadow-sm text-xs md:text-sm">
                                            {(weighedMasses[i2.id] ?? (i2.id === ing.id ? currentMass : 0)).toFixed(4)} / {i2.target.toFixed(4)} {i2.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex-grow flex flex-col justify-center space-y-4">
                            <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                                <strong>Tip:</strong> Tap the bottle to load the spatula, then drag it fully onto the balance pan and release.
                            </div>

                            {currentMass >= ing.target - ing.target * 0.01 && activeIngredientIdx < formulation.ingredients.length - 1 && (
                                <button onClick={nextIngredient} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm md:text-base">
                                    Next: Weigh {formulation.ingredients[activeIngredientIdx + 1].name}
                                </button>
                            )}
                            {weighingComplete && (
                                <button onClick={() => setSimStep(3)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 text-sm md:text-base">
                                    Proceed to Mixing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // SIM STEP 3: MIXING (drag ingredients into mortar + drag pestle)
    // ============================================================

    const renderSimStep3 = () => {
        if (!formulation) return null;
        const active = formulation.ingredients[0];
        const vehicle = formulation.ingredients[1];
        const unlocked = !!methodChoice && methodChoice !== "__wrong__";

        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Activity className="mr-3 text-blue-600" size={24} /> Mixing
                </h2>

                {!unlocked && (
                    <div className="space-y-4 mb-6">
                        <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                            <strong>Step 1:</strong> Select the correct mixing technique for <strong>{formulation.name}</strong>.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {METHOD_OPTIONS.map((m) => {
                                const isWrongFlash = methodChoice === "__wrong__";
                                return (
                                    <button
                                        key={m}
                                        onClick={() => chooseMethod(m)}
                                        className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                            isWrongFlash ? "bg-red-50 border-red-300 text-red-500" : "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700"
                                        }`}
                                    >
                                        {m}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {unlocked && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        <div ref={mortarZoneRef} className="relative h-[280px] sm:h-[320px] md:h-[380px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-inner overflow-hidden">
                            <MortarSVG activeLoaded={activeInMortar} vehicleLoaded={vehicleInMortar} grindProgress={grindCount / GRIND_NEEDED} />
                            <DustBurst burstKey={grindBurst} />
                            {activeInMortar && vehicleInMortar && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        drag
                                        dragSnapToOrigin
                                        dragElastic={0.5}
                                        dragMomentum={false}
                                        style={{ touchAction: "none" }}
                                        whileDrag={{ scale: 1.1 }}
                                        whileHover={{ scale: 1.04 }}
                                        onDragEnd={handlePestleDragEnd}
                                        className="cursor-grab active:cursor-grabbing touch-none pointer-events-auto -translate-y-6"
                                        animate={pestleControls}
                                    >
                                        <PestleSVG dragging={false} />
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center space-y-4">
                            <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                                <strong>Method: {methodChoice}.</strong>{" "}
                                {!activeInMortar || !vehicleInMortar
                                    ? "Drag each ingredient tray item into the mortar."
                                    : !mixed
                                    ? `Drag the pestle to grind (${grindCount}/${GRIND_NEEDED}).`
                                    : "Mixture complete."}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {!activeInMortar && (
                                    <motion.div
                                        drag
                                        dragSnapToOrigin
                                        dragElastic={0.5}
                                        dragMomentum={false}
                                        style={{ touchAction: "none" }}
                                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                                        onDragEnd={(e, info) => handleTrayDragEnd(info, "active")}
                                        className="cursor-grab active:cursor-grabbing touch-none flex flex-col items-center relative z-20"
                                    >
                                        <div className="w-20 h-20 rounded-xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center p-1">
                                            <span className="text-[10px] font-bold text-amber-700 text-center leading-tight">{active.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">Drag to mortar</span>
                                    </motion.div>
                                )}
                                {!vehicleInMortar && (
                                    <motion.div
                                        drag
                                        dragSnapToOrigin
                                        dragElastic={0.5}
                                        dragMomentum={false}
                                        style={{ touchAction: "none" }}
                                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                                        onDragEnd={(e, info) => handleTrayDragEnd(info, "vehicle")}
                                        className="cursor-grab active:cursor-grabbing touch-none flex flex-col items-center relative z-20"
                                    >
                                        <div className="w-20 h-20 rounded-xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center p-1">
                                            <span className="text-[10px] font-bold text-sky-700 text-center leading-tight">{vehicle.name}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">Drag to mortar</span>
                                    </motion.div>
                                )}
                            </div>

                            {mixed && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-xl mb-4 font-bold flex items-center justify-center border border-green-200 shadow-sm text-sm md:text-base">
                                        <CheckCircle2 className="mr-2" size={20} /> Mixture Complete
                                    </div>
                                    <button
                                        onClick={() => setSimStep(4)}
                                        className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                                    >
                                        Proceed to Packaging
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ============================================================
    // SIM STEP 4: PACKAGE SELECTION (drag container onto bench)
    // ============================================================

    const renderSimStep4 = () => {
        if (!formulation) return null;
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Package className="mr-3 text-blue-600" size={24} /> Package Selection
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div ref={benchZoneRef} className="relative h-[280px] md:h-[320px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
                        {containerChoice && containerChoice !== "__wrong__" ? (
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                                {containerSVG(containerChoice)}
                                <span className="mt-2 font-bold text-slate-700 text-sm">{containerChoice}</span>
                            </motion.div>
                        ) : (
                            <span className="text-slate-400 text-sm font-bold">Drop the correct container here</span>
                        )}
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                        <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                            <strong>Task:</strong> Drag the correct container for a <strong>{formulation.dosageForm}</strong> onto the bench.
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            {CONTAINER_OPTIONS.map((c) => (
                                <motion.div
                                    key={c}
                                    drag={containerChoice !== c}
                                    dragSnapToOrigin
                                    dragElastic={0.5}
                                    dragMomentum={false}
                                    style={{ touchAction: "none" }}
                                    whileDrag={{ scale: 1.08, zIndex: 50 }}
                                    onDragEnd={(e, info) => handleContainerDragEnd(info, c)}
                                    className={`relative z-20 p-3 rounded-xl border-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing touch-none ${
                                        containerChoice === "__wrong__" ? "border-red-200" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                                    } ${containerChoice === c ? "opacity-30 pointer-events-none" : ""}`}
                                >
                                    {containerSVG(c)}
                                    <span className="text-xs font-bold text-gray-700 mt-2">{c}</span>
                                </motion.div>
                            ))}
                        </div>
                        {containerChoice === "__wrong__" && <div className="text-red-500 text-sm font-bold text-center">Not the right container for this dosage form — try again.</div>}

                        {containerChoice && containerChoice !== "__wrong__" && (
                            <button
                                onClick={() => setSimStep(5)}
                                className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                            >
                                Proceed to Transfer &amp; Fill
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // SIM STEP 5: TRANSFER & FILL (drag spatula from mortar to container)
    // ============================================================

    const renderSimStep5 = () => {
        if (!formulation) return null;
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Beaker className="mr-3 text-blue-600" size={24} /> Transfer &amp; Fill
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    <div className="lg:col-span-8 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-2">
                            <div className="flex flex-col items-center cursor-pointer group flex-shrink-0" onClick={() => !transferComplete && setFillSpatulaLoaded(true)}>
                                <MortarSVG activeLoaded vehicleLoaded grindProgress={1} />
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow mt-2 whitespace-nowrap">
                                    Tap to load spatula
                                </span>
                            </div>

                            <motion.div
                                drag={fillSpatulaLoaded}
                                dragSnapToOrigin
                                dragElastic={0.4}
                                dragMomentum={false}
                                style={{ touchAction: "none" }}
                                whileDrag={{ scale: 1.15, zIndex: 50 }}
                                onDragEnd={(e, info) => handleFillDragEnd(info)}
                                className={`flex flex-col items-center flex-shrink-0 relative z-20 py-3 touch-none min-h-[48px] justify-center ${fillSpatulaLoaded ? "cursor-grab active:cursor-grabbing" : "opacity-30"}`}
                            >
                                <SpatulaSVG loaded={fillSpatulaLoaded} color="#a3e635" />
                                {fillSpatulaLoaded && (
                                    <span className="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded shadow mt-2 whitespace-nowrap animate-pulse">
                                        Drag to container ↕
                                    </span>
                                )}
                            </motion.div>

                            <div ref={containerZoneRef} className="flex flex-col items-center flex-shrink-0">
                                {containerSVG(containerChoice)}
                                <div className="w-20 h-3 bg-slate-200 rounded-full overflow-hidden mt-2 border border-slate-300">
                                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-green-400" animate={{ width: `${fillProgress}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 mt-1">{fillProgress}% filled</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
                        <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                            <strong>Tip:</strong> Tap the mortar to load the spatula, then drag the mixture into the container. Repeat until full.
                        </div>
                        {transferComplete && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-xl mb-4 font-bold flex items-center justify-center border border-green-200 shadow-sm text-sm">
                                    <CheckCircle2 className="mr-2" size={18} /> Transfer Complete
                                </div>
                                <button
                                    onClick={() => setSimStep(6)}
                                    className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                                >
                                    Proceed to Labelling
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // SIM STEP 6: LABELLING (drag label onto container)
    // ============================================================

    const renderSimStep6 = () => {
        if (!formulation) return null;
        const bud = new Date();
        bud.setDate(bud.getDate() + formulation.beyondUseDays);
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <Tag className="mr-3 text-blue-600" size={24} /> Labelling
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div ref={labelZoneRef} className="relative h-[300px] md:h-[340px] bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center shadow-inner">
                        {containerSVG(containerChoice)}
                        <AnimatePresence>
                            {labelPlaced ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="mt-3 bg-white border-2 border-blue-300 rounded-xl p-3 text-left text-xs shadow-md w-56"
                                >
                                    <p className="font-bold text-slate-800">{formulation.name}</p>
                                    <p className="text-slate-500">{formulation.strengthLabel} · {formulation.batchLabel}</p>
                                    <p className="text-slate-500 mt-1">{formulation.storage}</p>
                                    <p className="text-slate-800 font-bold mt-1">BUD: {bud.toLocaleDateString()}</p>
                                </motion.div>
                            ) : (
                                <span className="mt-3 text-slate-400 text-xs font-bold">Drop the label here</span>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                        <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                            <strong>Task:</strong> Drag the blank label onto the container to attach it.
                        </div>
                        {!labelPlaced && (
                            <motion.div
                                drag
                                dragSnapToOrigin
                                dragElastic={0.5}
                                dragMomentum={false}
                                style={{ touchAction: "none" }}
                                whileDrag={{ scale: 1.1, zIndex: 50 }}
                                onDragEnd={(e, info) => handleLabelDragEnd(info)}
                                className="cursor-grab active:cursor-grabbing touch-none self-center md:self-start relative z-20"
                            >
                                <LabelTagSVG />
                                <span className="text-[10px] text-gray-500 block text-center mt-1">Drag to container</span>
                            </motion.div>
                        )}
                        {labelPlaced && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="bg-green-100 text-green-800 p-3 md:p-4 rounded-xl mb-4 font-bold flex items-center justify-center border border-green-200 shadow-sm text-sm">
                                    <CheckCircle2 className="mr-2" size={18} /> Labelled
                                </div>
                                <button
                                    onClick={() => setSimStep(7)}
                                    className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg"
                                >
                                    Proceed to Documentation
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // SIM STEP 7: DOCUMENTATION
    // ============================================================

    const renderSimStep7 = () => {
        if (!formulation) return null;
        const items: { key: keyof typeof checklist; label: string }[] = [
            { key: "calculations", label: "Calculations verified against formulation card" },
            { key: "ingredients", label: "All ingredients and lot quantities recorded" },
            { key: "appearance", label: "Final product appearance checked (color, consistency)" },
            { key: "weight", label: "Final product weight/count confirmed against batch size" },
        ];
        return (
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center border-b pb-4">
                    <ClipboardList className="mr-3 text-blue-600" size={24} /> Compounding Record
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 space-y-3 text-sm">
                        <p className="flex justify-between"><span className="text-slate-500">Batch Number:</span> <strong>{batchNumber}</strong></p>
                        <p className="flex justify-between"><span className="text-slate-500">Formula:</span> <strong>{formulation.name}</strong></p>
                        <p className="flex justify-between"><span className="text-slate-500">Mixing Method:</span> <strong>{formulation.mixingMethod}</strong></p>
                        <p className="flex justify-between"><span className="text-slate-500">Container:</span> <strong>{containerChoice}</strong></p>
                        {formulation.ingredients.map((i2) => (
                            <p key={i2.id} className="flex justify-between">
                                <span className="text-slate-500">{i2.name}:</span>
                                <strong>{(weighedMasses[i2.id] ?? 0).toFixed(4)} {i2.unit}</strong>
                            </p>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-4">
                        <div className="p-4 bg-gray-50 border rounded-xl text-sm text-gray-700">
                            <strong>Task:</strong> Complete the final product check before releasing the batch.
                        </div>
                        <div className="space-y-3">
                            {items.map((it) => (
                                <button key={it.key} onClick={() => toggleCheck(it.key)} className="w-full flex items-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all text-left">
                                    {checklist[it.key] ? <CheckCircle2 className="text-green-600 mr-3 flex-shrink-0" size={20} /> : <Circle className="text-gray-300 mr-3 flex-shrink-0" size={20} />}
                                    <span className="text-sm font-medium text-gray-700">{it.label}</span>
                                </button>
                            ))}
                        </div>
                        {allChecked && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSimStep(8)}
                                className="w-full py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-base md:text-lg flex justify-center items-center"
                            >
                                Finish Lab &amp; Get Certificate <ChevronRight className="ml-2" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ============================================================
    // SIM STEP 8: CERTIFICATE & REPORT
    // ============================================================

    const renderSimStep8 = () => {
        if (!formulation) return null;
        return (
            <div className="max-w-4xl w-full mx-auto space-y-6">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden p-6 md:p-10">
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="border-4 border-double border-blue-100 rounded-2xl p-6 md:p-10 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border-4 border-blue-100">
                            <Award size={32} />
                        </div>
                        <p className="text-xs md:text-sm uppercase tracking-widest text-slate-400 font-bold mb-2">PharmaWallah Compounding Lab</p>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-4">Certificate of Completion</h2>
                        <p className="text-slate-500 text-sm md:text-base mb-2">This certifies that</p>
                        <input
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter your name"
                            className="text-xl md:text-2xl font-bold text-blue-700 text-center border-b-2 border-dashed border-blue-200 focus:border-blue-500 focus:outline-none bg-transparent px-2 py-1 mb-4 w-full max-w-sm mx-auto"
                        />
                        <p className="text-slate-600 text-sm md:text-base mb-1">has successfully compounded and validated</p>
                        <p className="text-lg md:text-xl font-bold text-slate-800 mb-4">{formulation.name}</p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:text-sm md:text-base font-bold text-slate-700">
                            <span>Score: <span className="text-blue-600">{score} / 100</span></span>
                            <span>Batch: {batchNumber}</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-8">
                        <button
                            onClick={generateCertificatePDF}
                            className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm md:text-lg w-full sm:w-auto"
                        >
                            <Award className="mr-2 md:mr-3" size={20} /> Download Certificate
                        </button>
                        <button
                            onClick={generateReportPDF}
                            className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm md:text-lg w-full sm:w-auto"
                        >
                            <Download className="mr-2 md:mr-3" size={20} /> Download Full Report
                        </button>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-2xl border-2 border-slate-100 shadow-sm">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center border-b pb-3">
                        <ClipboardList className="mr-2 text-blue-500" size={20} /> Score Breakdown
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {[
                            ["Calculation accuracy", calcScore, 15],
                            ["Accurate weighing (±5%)", weighingComplete ? 15 : 0, 15],
                            ["Correct mixing technique", methodAttempts === 1 && mixed ? 15 : mixed ? 9 : 0, 15],
                            ["Correct container selection", containerAttempts === 1 ? 10 : containerAttempts > 1 ? 6 : 0, 10],
                            ["Transfer & fill technique", transferComplete ? 10 : 0, 10],
                            ["Labelling accuracy", labelAttempts === 1 ? 10 : labelAttempts > 1 ? 6 : 0, 10],
                            ["Documentation completeness", allChecked ? 15 : 0, 15],
                            ["Final quality check", labelPlaced && transferComplete ? 10 : 0, 10],
                        ].map(([label, pts, max]) => (
                            <li key={label as string} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <span className="text-slate-600">{label}</span>
                                <strong className="text-blue-700">{pts} / {max}</strong>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={() => {
                        startSimulation();
                        setPhase("browse");
                    }}
                    className="w-full flex items-center justify-center px-6 py-3 md:py-4 bg-white border-2 border-gray-200 text-slate-700 rounded-2xl font-bold hover:border-blue-300 transition-all text-sm md:text-lg"
                >
                    <PlayCircle className="mr-2 md:mr-3" size={20} /> Start a New Compound
                </button>
            </div>
        );
    };

    // ============================================================
    // MAIN RENDER
    // ============================================================

    const STEP_LABELS = ["Calculate", "Weigh", "Mix", "Package", "Transfer", "Label", "Document"];

    return (
        <div ref={topRef} className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16 md:pb-24 selection:bg-blue-200 scroll-mt-4">
            <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-white font-extrabold shadow-md text-sm md:text-lg">
                            P
                        </div>
                        <span className="text-lg md:text-2xl font-extrabold tracking-tight text-slate-800">
                            Pharma<span className="text-blue-600">Wallah</span> Compounding Lab
                        </span>
                    </div>
                    <NavTabs />
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-2 md:px-4 pt-6 md:pt-10">
                <AnimatePresence mode="wait">
                    {phase === "browse" && <motion.div key="browse">{renderBrowse()}</motion.div>}
                    {phase === "study" && <motion.div key="study">{renderStudy()}</motion.div>}
                    {phase === "quiz" && <motion.div key="quiz">{renderQuiz()}</motion.div>}
                    {phase === "simulation" && (
                        <motion.div key="sim" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                            {simStep < 8 && (
                                <div className="flex items-center justify-between bg-white p-2 md:p-3 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto max-w-4xl mx-auto">
                                    {STEP_LABELS.map((label, idx) => {
                                        const isActive = simStep === idx + 1;
                                        const isPassed = simStep > idx + 1;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center whitespace-nowrap px-2 md:px-3 py-2 rounded-xl text-[10px] md:text-sm font-bold transition-all flex-1 justify-center ${
                                                    isActive ? "bg-blue-50 text-blue-700 border border-blue-100" : isPassed ? "text-slate-600" : "text-slate-400"
                                                }`}
                                            >
                                                <div
                                                    className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-1 md:mr-2 text-[10px] md:text-xs transition-colors ${
                                                        isActive ? "bg-blue-600 text-white shadow-md" : isPassed ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-500"
                                                    }`}
                                                >
                                                    {isPassed ? <CheckCircle2 size={12} /> : idx + 1}
                                                </div>
                                                <span className="hidden sm:inline">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="max-w-5xl mx-auto">
                                {!formulation && (
                                    <div className="text-center py-16">
                                        <p className="text-slate-500 mb-4">Select a formulation first.</p>
                                        <button onClick={() => setPhase("browse")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
                                            Browse Formulations
                                        </button>
                                    </div>
                                )}
                                {formulation && simStep === 1 && renderSimStep1()}
                                {formulation && simStep === 2 && renderSimStep2()}
                                {formulation && simStep === 3 && renderSimStep3()}
                                {formulation && simStep === 4 && renderSimStep4()}
                                {formulation && simStep === 5 && renderSimStep5()}
                                {formulation && simStep === 6 && renderSimStep6()}
                                {formulation && simStep === 7 && renderSimStep7()}
                                {formulation && simStep === 8 && renderSimStep8()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}