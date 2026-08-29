"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    Ruler,
    Scale,
    Calculator,
    Activity,
    AlertTriangle,
    TrendingUp,
    Target,
    BookOpen,
    RefreshCw,
    Check,
    Copy,
    Sparkles,
    ShieldCheck,
    HelpCircle,
    Zap,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    FlaskConical,
    Heart,
    User,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type BSAFormula = "mosteller" | "dubois" | "haycock" | "gehan_george" | "boyd";
export type HeightUnit = "cm" | "in";
export type WeightUnit = "kg" | "lbs";

export interface ChemoPreset {
    name: string;
    regimen: string;
    dosePerM2: number;
    doseUnit: string;
    indication: string;
    route: string;
    cycle: string;
    pearls: string;
}

export interface PatientPreset {
    label: string;
    tag: string;
    height: string;
    heightUnit: HeightUnit;
    weight: string;
    weightUnit: WeightUnit;
    formula: BSAFormula;
    chemoDose: string;
}

// ─── ONCOLOGY CHEMOTHERAPY PRESETS ───────────────────────────────────

const CHEMO_PRESETS: ChemoPreset[] = [
    {
        name: "5-Fluorouracil (5-FU) Bolus",
        regimen: "FOLFOX / FOLFIRI",
        dosePerM2: 400,
        doseUnit: "mg/m²",
        indication: "Colorectal / GI Cancers",
        route: "IV Push Bolus",
        cycle: "Day 1 Q2W",
        pearls: "Followed by 2400 mg/m² continuous 46-hr infusion. Screen for DPYD deficiency before initiation.",
    },
    {
        name: "Doxorubicin (Adriamycin)",
        regimen: "AC / CHOP",
        dosePerM2: 60,
        doseUnit: "mg/m²",
        indication: "Breast Cancer, Lymphoma",
        route: "IV Push / Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Cumulative lifetime limit 450–550 mg/m² due to cardiotoxicity risk (irreversible cardiomyopathy).",
    },
    {
        name: "Paclitaxel (Taxol)",
        regimen: "Standard Paclitaxel",
        dosePerM2: 175,
        doseUnit: "mg/m²",
        indication: "Ovarian, Breast, NSCLC",
        route: "IV 3-hr Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Requires non-PVC tubing and 0.22-micron in-line filter. Premedicate with Dexamethasone + Diphenhydramine + H2RA.",
    },
    {
        name: "Docetaxel (Taxotere)",
        regimen: "TAC / TCG",
        dosePerM2: 75,
        doseUnit: "mg/m²",
        indication: "Breast, Prostate, Gastric",
        route: "IV 1-hr Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Premedicate with oral Dexamethasone 8 mg BID for 3 days starting 1 day prior to prevent fluid retention.",
    },
    {
        name: "Cisplatin",
        regimen: "Cisplatin High-Dose",
        dosePerM2: 75,
        doseUnit: "mg/m²",
        indication: "Head & Neck, Lung, Bladder",
        route: "IV Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Highly emetogenic & nephrotoxic. Requires pre/post IV hydration with Mannitol. Monitor CrCl and electrolytes.",
    },
    {
        name: "Cyclophosphamide (Cytoxan)",
        regimen: "AC / CHOP / CMF",
        dosePerM2: 600,
        doseUnit: "mg/m²",
        indication: "Breast Cancer, NHL",
        route: "IV Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Risk of acrolein-induced hemorrhagic cystitis. Ensure vigorous hydration (2–3 L/day).",
    },
    {
        name: "Rituximab (Rituxan)",
        regimen: "R-CHOP",
        dosePerM2: 375,
        doseUnit: "mg/m²",
        indication: "CD20+ B-cell Lymphoma",
        route: "IV Slow Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Screen for Hepatitis B reactivation. Premedicate with Acetaminophen and Diphenhydramine.",
    },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function BSACalculator() {
    // Input State
    const [height, setHeight] = useState<string>("172");
    const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
    const [weight, setWeight] = useState<string>("70");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [formula, setFormula] = useState<BSAFormula>("mosteller");

    // Clinical Dosing Inputs
    const [chemoDosePerM2, setChemoDosePerM2] = useState<string>("100");
    const [selectedChemo, setSelectedChemo] = useState<string>("custom");
    const [cardiacOutput, setCardiacOutput] = useState<string>("5.0"); // Optional CI

    // UI States
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showFormulas, setShowFormulas] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Patient Archetypes
    const samplePatients: PatientPreset[] = [
        { label: "Pediatric Patient", tag: "Child (8y, 25kg)", height: "125", heightUnit: "cm", weight: "25", weightUnit: "kg", formula: "haycock", chemoDose: "100" },
        { label: "Average Female", tag: "162cm, 62kg", height: "162", heightUnit: "cm", weight: "62", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
        { label: "Average Male", tag: "178cm, 78kg", height: "178", heightUnit: "cm", weight: "78", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
        { label: "Bariatric / Obese", tag: "BMI 38 kg/m²", height: "170", heightUnit: "cm", weight: "110", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
        { label: "Cachectic Oncology", tag: "Underweight (44kg)", height: "168", heightUnit: "cm", weight: "44", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
    ];

    // Numeric Normalization
    const rawH = parseFloat(height) || 0;
    const rawW = parseFloat(weight) || 0;
    const rawChemo = parseFloat(chemoDosePerM2) || 0;
    const rawCo = parseFloat(cardiacOutput) || 0;

    // Normalized Height in cm
    const heightCm = useMemo(() => {
        if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
        return rawH;
    }, [rawH, heightUnit]);

    // Normalized Weight in kg
    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
        return rawW;
    }, [rawW, weightUnit]);

    // Body Mass Index (BMI)
    const bmi = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return 0;
        const heightM = heightCm / 100;
        return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    }, [heightCm, weightKg]);

    // ─── BSA MULTI-FORMULA COMPARISONS ──────────────────────────────────
    const bsaCalculations = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return null;

        // 1. Mosteller (1987): sqrt( (cm * kg) / 3600 )
        const bsaMosteller = Math.sqrt((heightCm * weightKg) / 3600);

        // 2. DuBois & DuBois (1916): 0.007184 * cm^0.725 * kg^0.425
        const bsaDubois = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

        // 3. Haycock (1978): 0.024265 * cm^0.3964 * kg^0.5378
        const bsaHaycock = 0.024265 * Math.pow(heightCm, 0.3964) * Math.pow(weightKg, 0.5378);

        // 4. Gehan & George (1970): 0.0235 * cm^0.42246 * kg^0.51456
        const bsaGehan = 0.0235 * Math.pow(heightCm, 0.42246) * Math.pow(weightKg, 0.51456);

        // 5. Boyd (1935): weight in grams = kg * 1000
        const weightGrams = weightKg * 1000;
        const exponent = 0.7285 - 0.0188 * (Math.log(weightGrams) / Math.LN10);
        const bsaBoyd = 0.0003207 * Math.pow(heightCm, 0.3) * Math.pow(weightGrams, exponent);

        // Active Formula Selection
        let activeBsa = bsaMosteller;
        let formulaName = "Mosteller (1987)";

        if (formula === "dubois") {
            activeBsa = bsaDubois;
            formulaName = "DuBois & DuBois (1916)";
        } else if (formula === "haycock") {
            activeBsa = bsaHaycock;
            formulaName = "Haycock (1978 - Pediatric Gold Standard)";
        } else if (formula === "gehan_george") {
            activeBsa = bsaGehan;
            formulaName = "Gehan & George (1970 - Cancer Trials)";
        } else if (formula === "boyd") {
            activeBsa = bsaBoyd;
            formulaName = "Boyd (1935)";
        }

        // Category
        let category = "Normal Adult";
        let categoryColor = "text-blue-800 bg-blue-50 border-blue-200";
        let clinicalImplication = "Standard oncology and hemodynamic reference range.";

        if (activeBsa < 1.2) {
            category = "Pediatric / Small Surface Area (< 1.2 m²)";
            categoryColor = "text-amber-800 bg-amber-50 border-amber-200";
            clinicalImplication = "Small body surface area. Common in pediatric, adolescent, or cachectic adults.";
        } else if (activeBsa <= 2.1) {
            category = "Average Adult Surface Area (1.2–2.1 m²)";
            categoryColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
            clinicalImplication = "Standard adult physiological parameters for chemotherapy and cardiac index.";
        } else {
            category = "Large / Obese Surface Area (> 2.1 m²)";
            categoryColor = "text-purple-800 bg-purple-50 border-purple-200";
            clinicalImplication = "Elevated BSA. ASCO guidelines recommend full actual weight-based dosing without arbitrary capping for curative therapy.";
        }

        // Chemotherapy Total Dose
        const calculatedChemoDose = Math.round(rawChemo * activeBsa * 10) / 10;

        // Cardiac Index (CI) = CO / BSA
        const cardiacIndex = rawCo > 0 ? Math.round((rawCo / activeBsa) * 100) / 100 : null;

        return {
            activeBsa: Math.round(activeBsa * 1000) / 1000,
            activeBsaFormatted: activeBsa.toFixed(2),
            bsaMosteller: Math.round(bsaMosteller * 1000) / 1000,
            bsaDubois: Math.round(bsaDubois * 1000) / 1000,
            bsaHaycock: Math.round(bsaHaycock * 1000) / 1000,
            bsaGehan: Math.round(bsaGehan * 1000) / 1000,
            bsaBoyd: Math.round(bsaBoyd * 1000) / 1000,
            formulaName,
            category,
            categoryColor,
            clinicalImplication,
            calculatedChemoDose,
            cardiacIndex,
        };
    }, [heightCm, weightKg, formula, rawChemo, rawCo]);

    // Handle Preset Drug Selection
    const handleSelectChemoPreset = (drugName: string) => {
        setSelectedChemo(drugName);
        const drug = CHEMO_PRESETS.find((d) => d.name === drugName);
        if (drug) {
            setChemoDosePerM2(drug.dosePerM2.toString());
        }
    };

    // Active Monograph
    const activeChemoMonograph = useMemo(() => {
        return CHEMO_PRESETS.find((d) => d.name === selectedChemo) || null;
    }, [selectedChemo]);

    // Load Patient Preset
    const handleLoadPatientPreset = (p: PatientPreset) => {
        setHeight(p.height);
        setHeightUnit(p.heightUnit);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setFormula(p.formula);
        setChemoDosePerM2(p.chemoDose);
        setSelectedChemo("custom");
    };

    // Reset
    const handleReset = () => {
        setHeight("172");
        setHeightUnit("cm");
        setWeight("70");
        setWeightUnit("kg");
        setFormula("mosteller");
        setChemoDosePerM2("100");
        setSelectedChemo("custom");
        setCardiacOutput("5.0");
    };

    // Copy Consult Note
    const handleCopyConsultNote = useCallback(() => {
        if (!bsaCalculations) return;

        const note = `=== CLINICAL BODY SURFACE AREA (BSA) & CHEMOTHERAPY CONSULT ===
PATIENT ANTHROPOMETRICS:
- Height: ${heightCm} cm (${rawH} ${heightUnit}) | Weight: ${weightKg} kg (${rawW} ${weightUnit})
- Body Mass Index (BMI): ${bmi} kg/m²
- CALCULATED BSA: ${bsaCalculations.activeBsa} m² (Formula: ${bsaCalculations.formulaName})
- BSA Classification: ${bsaCalculations.category}

MULTI-FORMULA COMPARISON:
- Mosteller (1987): ${bsaCalculations.bsaMosteller} m²
- DuBois & DuBois (1916): ${bsaCalculations.bsaDubois} m²
- Haycock (Pediatric): ${bsaCalculations.bsaHaycock} m²
- Gehan & George (Trials): ${bsaCalculations.bsaGehan} m²
- Boyd (1935): ${bsaCalculations.bsaBoyd} m²

CHEMOTHERAPY DOSING EVALUATION:
- Regimen / Agent: ${activeChemoMonograph ? `${activeChemoMonograph.name} (${activeChemoMonograph.regimen})` : "Custom Protocol"}
- Prescribed Regimen Dose: ${rawChemo} mg/m²
- INDIVIDUAL PATIENT DOSE: ${bsaCalculations.calculatedChemoDose} mg [${rawChemo} mg/m² × ${bsaCalculations.activeBsaFormatted} m²]
${activeChemoMonograph?.pearls ? `Clinical Pearl: ${activeChemoMonograph.pearls}` : ""}

ASCO OBESE DOSING GUIDELINE ADVISORY:
Full weight-based chemotherapy doses should be utilized in obese cancer patients, particularly when the goal is cure. Arbitrary dose capping (e.g. at 2.0 m²) is discouraged by ASCO guidelines.
Generated: ${new Date().toLocaleString()}`;

        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    }, [bsaCalculations, heightCm, rawH, heightUnit, weightKg, rawW, weightUnit, bmi, activeChemoMonograph, rawChemo]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 pt-8 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <Ruler className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Body Surface Area (BSA) Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> Oncology & Hemodynamics
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Mosteller, DuBois, Haycock & Gehan-George formulas with smart chemotherapy dose calculator
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowInstructions((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs md:text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
                            >
                                <HelpCircle className="h-4 w-4" />
                                {showInstructions ? "Hide Instructions" : "Clinical Guide"}
                            </button>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                </header>

                {/* ─── STEP-BY-STEP DIRECTIONS / CLINICAL GUIDE ─────────────────────── */}
                {showInstructions && (
                    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <span>Clinical BSA Directions & Oncology Workflow</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Height & Weight</strong>
                                    Type measurements in cm/in and kg/lbs. The engine calculates BMI and multi-formula BSA in real time.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Chemotherapy Regimen</strong>
                                    Choose a high-yield chemotherapy monograph (5-FU, Paclitaxel, Doxorubicin) or enter custom mg/m².
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Verify Dose & Copy Note</strong>
                                    Check the total mg dose, ASCO obesity safety guidance, Cardiac Index, and copy the EHR chart note.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── QUICK CLINICAL ARCHETYPES BAR ────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-md shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Quick Patient Archetypes (1-Click Presets)
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-400">Clinical Scenarios</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {samplePatients.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => handleLoadPatientPreset(p)}
                                className="group p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition flex flex-col justify-between"
                            >
                                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                                    {p.label}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                    {p.tag}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: PATIENT MEASUREMENTS & CHEMOTHERAPY SELECTOR (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* CARD 1: MEASUREMENTS & ANTHROPOMETRICS */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    1. Anthropometric Measurements
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Height & Weight Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Height */}
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3.5">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                                <Ruler className="h-3.5 w-3.5 text-blue-600" /> Height
                                            </label>
                                            <div className="inline-flex rounded bg-blue-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setHeightUnit("cm")}
                                                    className={`px-1.5 py-0.5 rounded ${heightUnit === "cm" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    cm
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setHeightUnit("in")}
                                                    className={`px-1.5 py-0.5 rounded ${heightUnit === "in" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    in
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="1"
                                                value={height}
                                                onChange={(e) => setHeight(e.target.value)}
                                                placeholder="e.g. 172"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                                                {heightUnit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Weight */}
                                    <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3.5">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                                <Scale className="h-3.5 w-3.5 text-green-600" /> Weight
                                            </label>
                                            <div className="inline-flex rounded bg-green-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setWeightUnit("kg")}
                                                    className={`px-1.5 py-0.5 rounded ${weightUnit === "kg" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                                                >
                                                    kg
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setWeightUnit("lbs")}
                                                    className={`px-1.5 py-0.5 rounded ${weightUnit === "lbs" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                                                >
                                                    lbs
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="1"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="e.g. 70"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-base font-bold text-gray-900 focus:outline-none focus:border-green-500"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                                                {weightUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* BMI and Metric Readout */}
                                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                                    <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-200">
                                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Normalized Height</span>
                                        <span className="text-sm font-black text-gray-800">{heightCm} cm</span>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-200">
                                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Body Mass Index (BMI)</span>
                                        <span className="text-sm font-black text-gray-800">{bmi} kg/m²</span>
                                    </div>
                                </div>

                                {/* Formula Selection Tabs */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Select Primary BSA Equation
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs font-bold">
                                        {[
                                            { id: "mosteller", name: "Mosteller", sub: "Standard of Care" },
                                            { id: "dubois", name: "DuBois & DuBois", sub: "Classic (1916)" },
                                            { id: "haycock", name: "Haycock", sub: "Pediatric Gold Std" },
                                            { id: "gehan_george", name: "Gehan & George", sub: "Cancer Trials" },
                                            { id: "boyd", name: "Boyd", sub: "Metabolic Eq." },
                                        ].map((f) => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => setFormula(f.id as BSAFormula)}
                                                className={`p-2 rounded-xl border transition text-center flex flex-col items-center justify-center ${formula === f.id
                                                        ? "border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-1 ring-blue-500 font-extrabold"
                                                        : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{f.name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{f.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: CHEMOTHERAPY & DOSE PROTOCOL SELECTOR */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <FlaskConical className="h-5 w-5 text-emerald-600" />
                                2. Chemotherapy Regimen & Dosing Protocol
                            </h2>

                            <div className="space-y-3.5">
                                {/* Chemo Presets Dropdown */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                        Quick Chemotherapy Regimen Presets
                                    </label>
                                    <select
                                        value={selectedChemo}
                                        onChange={(e) => handleSelectChemoPreset(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="custom">-- Custom Protocol (Enter mg/m² Below) --</option>
                                        {CHEMO_PRESETS.map((c) => (
                                            <option key={c.name} value={c.name}>
                                                {c.name} ({c.regimen}) - {c.dosePerM2} mg/m² [{c.indication}]
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dose per m2 Input */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Prescribed Regimen Dose
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0.1"
                                            value={chemoDosePerM2}
                                            onChange={(e) => {
                                                setChemoDosePerM2(e.target.value);
                                                setSelectedChemo("custom");
                                            }}
                                            placeholder="e.g. 100"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Dose Unit
                                        </label>
                                        <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-600 text-center">
                                            mg/m²
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Cardiac Output for Cardiac Index */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                            <Heart className="h-3.5 w-3.5 text-rose-500" /> Optional: Cardiac Output (for CI)
                                        </label>
                                        <span className="text-[10px] text-gray-400">L/min</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={cardiacOutput}
                                        onChange={(e) => setCardiacOutput(e.target.value)}
                                        placeholder="e.g. 5.0"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: HERO BSA OUTPUT & CHEMO DOSE (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* HERO BSA CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Calculated Body Surface Area
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyConsultNote}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-green-300" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Consult</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {bsaCalculations ? (
                                <div className="space-y-4">
                                    {/* Big Number Output */}
                                    <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                        <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                                            {bsaCalculations.formulaName}
                                        </span>
                                        <div className="text-5xl font-black tracking-tight text-white">
                                            {bsaCalculations.activeBsa}{" "}
                                            <span className="text-2xl font-bold text-green-200">m²</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {bsaCalculations.category}
                                        </div>
                                    </div>

                                    {/* Calculated Chemotherapy Dose Hero Box */}
                                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/15 space-y-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-green-200 flex items-center gap-1">
                                            <FlaskConical className="h-4 w-4 text-green-300" /> Individual Patient Chemotherapy Dose
                                        </span>
                                        <div className="text-3xl font-black text-white">
                                            {bsaCalculations.calculatedChemoDose}{" "}
                                            <span className="text-lg font-normal text-blue-100">mg</span>
                                        </div>
                                        <p className="text-[11px] text-blue-100">
                                            Calculated as {rawChemo} mg/m² × {bsaCalculations.activeBsaFormatted} m²
                                        </p>
                                    </div>

                                    {/* Cardiac Index if provided */}
                                    {bsaCalculations.cardiacIndex && (
                                        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 flex items-center justify-between text-xs">
                                            <span className="text-blue-100 font-semibold flex items-center gap-1.5">
                                                <Heart className="h-4 w-4 text-rose-300" /> Cardiac Index (CI):
                                            </span>
                                            <span className="font-bold text-white text-sm">
                                                {bsaCalculations.cardiacIndex} L/min/m²{" "}
                                                <span className="text-[10px] text-green-200 font-normal">(Normal: 2.5–4.0)</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Enter height and weight to calculate BSA.</p>
                                </div>
                            )}
                        </div>

                        {/* VISUAL BSA REFERENCE GAUGE */}
                        {bsaCalculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-700 flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        BSA Population Reference Gauge
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] ${bsaCalculations.categoryColor}`}>
                                        {bsaCalculations.activeBsa} m²
                                    </span>
                                </div>

                                <div className="relative pt-6 pb-2">
                                    {/* Gauge Track */}
                                    <div className="h-3 bg-gradient-to-r from-blue-300 via-green-300 to-purple-400 rounded-full w-full relative overflow-hidden" />

                                    {/* Marker Pin */}
                                    <div
                                        className="absolute top-1 transition-all duration-300 -translate-x-1/2"
                                        style={{
                                            left: `${Math.min(100, Math.max(0, ((bsaCalculations.activeBsa - 0.5) / (3.0 - 0.5)) * 100))}%`,
                                        }}
                                    >
                                        <div className="bg-gray-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                            {bsaCalculations.activeBsa} m²
                                        </div>
                                        <div className="w-0.5 h-3 bg-gray-900 mx-auto" />
                                    </div>

                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5 mt-1">
                                        <span>0.5 m² (Infant)</span>
                                        <span>1.2 m²</span>
                                        <span>1.73 m² (Avg Adult)</span>
                                        <span>2.5 m²</span>
                                        <span>3.0+ m²</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MULTI-FORMULA COMPARISON TABLE */}
                        {bsaCalculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                    Comparison Across 5 Clinical Equations
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Formula</th>
                                                <th className="py-2.5 px-3">Calculated BSA</th>
                                                <th className="py-2.5 px-3">Chemo Dose</th>
                                                <th className="py-2.5 px-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {[
                                                { id: "mosteller", name: "Mosteller (1987)", val: bsaCalculations.bsaMosteller },
                                                { id: "dubois", name: "DuBois & DuBois", val: bsaCalculations.bsaDubois },
                                                { id: "haycock", name: "Haycock (Pediatric)", val: bsaCalculations.bsaHaycock },
                                                { id: "gehan_george", name: "Gehan & George", val: bsaCalculations.bsaGehan },
                                                { id: "boyd", name: "Boyd (1935)", val: bsaCalculations.bsaBoyd },
                                            ].map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className={formula === item.id ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}
                                                >
                                                    <td className="py-2 px-3">{item.name}</td>
                                                    <td className="py-2 px-3">{item.val} m²</td>
                                                    <td className="py-2 px-3">{Math.round(rawChemo * item.val * 10) / 10} mg</td>
                                                    <td className="py-2 px-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormula(item.id as BSAFormula)}
                                                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                        >
                                                            Apply
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ACTIVE MONOGRAPH PEARLS */}
                        {activeChemoMonograph && (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm text-blue-950 space-y-1.5">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-800">
                                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span>{activeChemoMonograph.name} Monograph Pearls</span>
                                </div>
                                <p className="text-xs leading-relaxed text-blue-900">
                                    <strong>Indication:</strong> {activeChemoMonograph.indication} | <strong>Route/Cycle:</strong> {activeChemoMonograph.route}, {activeChemoMonograph.cycle}
                                </p>
                                <div className="text-[11px] text-blue-800 bg-white/70 p-2.5 rounded-lg border border-blue-100">
                                    <strong>Clinical Pearl:</strong> {activeChemoMonograph.pearls}
                                </div>
                            </div>
                        )}

                        {/* ASCO OBESE DOSING SAFETY WARNING */}
                        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">ASCO Clinical Practice Guideline Advisory:</strong>
                                    The American Society of Clinical Oncology (ASCO) recommends utilizing full actual weight-based chemotherapy dosing for adult cancer patients without arbitrary dose capping (e.g. at 2.0 m²), to avoid compromising curative treatment outcomes.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* ─── COLLAPSIBLE FORMULAS & EVIDENCE REFERENCE ────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowFormulas(!showFormulas)}
                        className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Mathematical Equations & Clinical Trials Evidence
                        </span>
                        {showFormulas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showFormulas && (
                        <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                            <div>
                                <strong className="text-gray-900 block mb-0.5">1. Mosteller (1987) — Standard of Care:</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    BSA (m²) = √[ (Height in cm × Weight in kg) / 3600 ]
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">2. DuBois & DuBois (1916):</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    BSA (m²) = 0.007184 × (Height in cm)^0.725 × (Weight in kg)^0.425
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">3. Haycock (1978) — Pediatric Protocol:</strong>
                                <code className="text-green-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    BSA (m²) = 0.024265 × (Height in cm)^0.3964 × (Weight in kg)^0.5378
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">4. Gehan & George (1970) — Cancer Clinical Trials:</strong>
                                <code className="text-teal-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    BSA (m²) = 0.0235 × (Height in cm)^0.42246 × (Weight in kg)^0.51456
                                </code>
                            </div>
                            <p className="text-[11px] text-gray-400 italic pt-1">
                                Guideline references: Mosteller RD (N Engl J Med 1987), ASCO Appropriate Chemotherapy Dosing for Obese Adult Patients (J Clin Oncol 2012/2021).
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Oncology & Hemodynamic Advisory:</strong> For investigational or high-dose chemotherapy regimens, always verify patient-specific organ function (CrCl, LFTs) and institutional protocols before preparation.
                    </p>
                    <p className="text-gray-400">
                        &copy; 2024–2026 Advanced Body Surface Area Clinical Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}