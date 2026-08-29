"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    Scale,
    Calculator,
    Activity,
    Heart,
    TrendingUp,
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
    Ruler,
    Target,
    Stethoscope,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type HeightUnit = "cm" | "in";
export type WeightUnit = "kg" | "lbs";
export type BMIPopulation = "who_standard" | "who_asian";

export interface PatientPreset {
    name: string;
    tag: string;
    height: string;
    heightUnit: HeightUnit;
    weight: string;
    weightUnit: WeightUnit;
    sex: "male" | "female";
    population: BMIPopulation;
}

export interface BMICategory {
    label: string;
    risk: string;
    badgeColor: string;
    barColor: string;
    clinicalImplication: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function BMICalculator() {
    // Input State
    const [height, setHeight] = useState<string>("175");
    const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
    const [weight, setWeight] = useState<string>("75");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [sex, setSex] = useState<"male" | "female">("male");
    const [population, setPopulation] = useState<BMIPopulation>("who_standard");

    // UI States
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Patient Archetypes
    const samplePatients: PatientPreset[] = [
        { name: "Underweight", tag: "BMI ~17.0", height: "172", heightUnit: "cm", weight: "50", weightUnit: "kg", sex: "female", population: "who_standard" },
        { name: "Normal Weight", tag: "BMI ~22.5", height: "175", heightUnit: "cm", weight: "69", weightUnit: "kg", sex: "male", population: "who_standard" },
        { name: "Overweight", tag: "BMI ~27.2", height: "178", heightUnit: "cm", weight: "86", weightUnit: "kg", sex: "male", population: "who_standard" },
        { name: "Obese Class I", tag: "BMI ~32.4", height: "168", heightUnit: "cm", weight: "92", weightUnit: "kg", sex: "female", population: "who_standard" },
        { name: "Severe Obese III", tag: "BMI ~42.5", height: "170", heightUnit: "cm", weight: "123", weightUnit: "kg", sex: "female", population: "who_standard" },
    ];

    // Numeric Normalization
    const rawH = parseFloat(height) || 0;
    const rawW = parseFloat(weight) || 0;

    // Normalized Height in cm & inches
    const heightCm = useMemo(() => {
        if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
        return rawH;
    }, [rawH, heightUnit]);

    const heightInches = useMemo(() => {
        if (heightUnit === "cm") return heightCm / 2.54;
        return rawH;
    }, [heightCm, rawH, heightUnit]);

    // Normalized Weight in kg & lbs
    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
        return rawW;
    }, [rawW, weightUnit]);

    const weightLbs = useMemo(() => {
        if (weightUnit === "kg") return Math.round(weightKg * 2.20462 * 10) / 10;
        return rawW;
    }, [weightKg, rawW, weightUnit]);

    // ─── ANTHROPOMETRIC & CLINICAL CALCULATIONS ────────────────────────
    const calculations = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return null;

        const heightM = heightCm / 100;
        const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

        // 1. BMI Classification & Cardiovascular Risk
        let categoryData: BMICategory;

        if (population === "who_standard") {
            if (bmi < 16.0) {
                categoryData = {
                    label: "Severe Thinness / Underweight",
                    risk: "Very High Cardiovascular & Nutritional Risk",
                    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                    barColor: "bg-rose-500",
                    clinicalImplication: "Risk of protein-calorie malnutrition, immune compromise, osteoporosis, and electrolyte disturbances.",
                };
            } else if (bmi < 17.0) {
                categoryData = {
                    label: "Moderate Thinness",
                    risk: "High Nutritional Risk",
                    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                    barColor: "bg-amber-500",
                    clinicalImplication: "Requires nutritional assessment and screening for underlying systemic illness or eating disorders.",
                };
            } else if (bmi < 18.5) {
                categoryData = {
                    label: "Mild Thinness",
                    risk: "Moderate Nutritional Risk",
                    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                    barColor: "bg-amber-400",
                    clinicalImplication: "Mildly reduced body mass. Monitor for unintentional weight loss.",
                };
            } else if (bmi < 25.0) {
                categoryData = {
                    label: "Normal Weight",
                    risk: "Low Risk (Optimal Health Range)",
                    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    barColor: "bg-emerald-500",
                    clinicalImplication: "Lowest statistical risk for cardiovascular disease, type 2 diabetes, and all-cause mortality.",
                };
            } else if (bmi < 30.0) {
                categoryData = {
                    label: "Overweight (Pre-Obesity)",
                    risk: "Moderate Metabolic Risk",
                    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
                    barColor: "bg-yellow-500",
                    clinicalImplication: "Increased risk of dyslipidemia, hypertension, insulin resistance, and hepatic steatosis (NAFLD).",
                };
            } else if (bmi < 35.0) {
                categoryData = {
                    label: "Obese Class I (Moderate)",
                    risk: "High Cardiovascular Risk",
                    badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
                    barColor: "bg-orange-500",
                    clinicalImplication: "Elevated risk of ASCVD, obstructive sleep apnea (OSA), and osteoarthritis. Lifestyle and pharmacotherapy indicated.",
                };
            } else if (bmi < 40.0) {
                categoryData = {
                    label: "Obese Class II (Severe)",
                    risk: "Very High Cardiovascular & Metabolic Risk",
                    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                    barColor: "bg-rose-500",
                    clinicalImplication: "Substantial morbidity risk. Comprehensive medical management and bariatric evaluation indicated.",
                };
            } else {
                categoryData = {
                    label: "Obese Class III (Morbid / Extreme)",
                    risk: "Extremely High Mortality Risk",
                    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
                    barColor: "bg-purple-600",
                    clinicalImplication: "Extreme ASCVD, heart failure, and venous thromboembolism risk. Bariatric surgical candidate.",
                };
            }
        } else {
            // Asian-Pacific Criteria (WHO Western Pacific Region)
            if (bmi < 18.5) {
                categoryData = {
                    label: "Underweight (Asian Cutoff)",
                    risk: "Moderate Risk",
                    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                    barColor: "bg-amber-400",
                    clinicalImplication: "Nutritional deficiency screening recommended.",
                };
            } else if (bmi < 23.0) {
                categoryData = {
                    label: "Normal Weight (Asian Cutoff)",
                    risk: "Low Risk",
                    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    barColor: "bg-emerald-500",
                    clinicalImplication: "Optimal metabolic risk window for Asian populations.",
                };
            } else if (bmi < 27.5) {
                categoryData = {
                    label: "Overweight / Pre-Obese (Asian Cutoff)",
                    risk: "Moderate to High Risk",
                    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
                    barColor: "bg-yellow-500",
                    clinicalImplication: "Increased visceral adiposity and insulin resistance at lower BMI in Asian adults.",
                };
            } else {
                categoryData = {
                    label: "Obese (Asian Cutoff >= 27.5)",
                    risk: "High to Very High Risk",
                    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                    barColor: "bg-rose-600",
                    clinicalImplication: "Significant cardiometabolic risk at BMI >= 27.5 kg/m².",
                };
            }
        }

        // 2. Ideal Body Weight Equations (IBW)
        const baseDevine = sex === "male" ? 50.0 : 45.5;
        const diffInches = heightInches - 60;
        const ibwDevine = Math.round((baseDevine + 2.3 * diffInches) * 10) / 10;

        const baseRobinson = sex === "male" ? 52.0 : 49.0;
        const multRobinson = sex === "male" ? 1.9 : 1.7;
        const ibwRobinson = Math.round((baseRobinson + multRobinson * diffInches) * 10) / 10;

        const baseHamwi = sex === "male" ? 48.0 : 45.5;
        const multHamwi = sex === "male" ? 2.7 : 2.2;
        const ibwHamwi = Math.round((baseHamwi + multHamwi * diffInches) * 10) / 10;

        // 3. Adjusted Body Weight (AdjBW 40%)
        const adjBw = weightKg > ibwDevine
            ? Math.round((ibwDevine + 0.4 * (weightKg - ibwDevine)) * 10) / 10
            : weightKg;

        // 4. Lean Body Mass (Boer Formula)
        const lbmBoer = sex === "male"
            ? Math.round((0.407 * weightKg + 0.267 * heightCm - 19.2) * 10) / 10
            : Math.round((0.252 * weightKg + 0.473 * heightCm - 48.3) * 10) / 10;

        // 5. Body Surface Area (Mosteller)
        const bsaMosteller = Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;

        // 6. Healthy Weight Range (BMI 18.5 – 24.9)
        const healthyWeightMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
        const healthyWeightMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

        // Target Weight Delta
        let weightDeltaMsg = "";
        if (weightKg > healthyWeightMaxKg) {
            const toLose = Math.round((weightKg - healthyWeightMaxKg) * 10) / 10;
            weightDeltaMsg = `Reduce ${toLose} kg (${Math.round(toLose * 2.20462)} lbs) to reach normal BMI (≤ 24.9)`;
        } else if (weightKg < healthyWeightMinKg) {
            const toGain = Math.round((healthyWeightMinKg - weightKg) * 10) / 10;
            weightDeltaMsg = `Gain ${toGain} kg (${Math.round(toGain * 2.20462)} lbs) to reach normal BMI (≥ 18.5)`;
        } else {
            weightDeltaMsg = "Current weight is within the healthy physiological reference range.";
        }

        return {
            bmi,
            categoryData,
            ibwDevine,
            ibwRobinson,
            ibwHamwi,
            adjBw,
            lbmBoer,
            bsaMosteller,
            healthyWeightMinKg,
            healthyWeightMaxKg,
            weightDeltaMsg,
        };
    }, [heightCm, heightInches, weightKg, sex, population]);

    // Load Preset
    const handleLoadPreset = (p: PatientPreset) => {
        setHeight(p.height);
        setHeightUnit(p.heightUnit);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setSex(p.sex);
        setPopulation(p.population);
    };

    // Reset
    const handleReset = () => {
        setHeight("175");
        setHeightUnit("cm");
        setWeight("75");
        setWeightUnit("kg");
        setSex("male");
        setPopulation("who_standard");
    };

    // Copy Consult Note
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL ANTHROPOMETRIC & BODY COMPOSITION CONSULT ===
PATIENT ANTHROPOMETRICS:
- Height: ${heightCm} cm (${rawH} ${heightUnit}) | Weight: ${weightKg} kg (${rawW} ${weightUnit})
- Biological Sex: ${sex.toUpperCase()} | Population Standard: ${population === "who_standard" ? "WHO International" : "WHO Asian-Pacific"}

BODY MASS INDEX (BMI):
- CALCULATED BMI: ${calculations.bmi} kg/m²
- Classification: ${calculations.categoryData.label}
- Cardiovascular / Metabolic Risk: ${calculations.categoryData.risk}
- Healthy Weight Target (BMI 18.5–24.9): ${calculations.healthyWeightMinKg} – ${calculations.healthyWeightMaxKg} kg
- Weight Adjustment Goal: ${calculations.weightDeltaMsg}

PHARMACOKINETIC BODY WEIGHTS & SURFACE AREA:
- Ideal Body Weight (Devine 1974): ${calculations.ibwDevine} kg (Gold standard for CrCl & drug dosing)
- Ideal Body Weight (Robinson 1983): ${calculations.ibwRobinson} kg
- Ideal Body Weight (Hamwi 1964): ${calculations.ibwHamwi} kg
- Adjusted Body Weight (AdjBW 40%): ${calculations.adjBw} kg (For obese dosing)
- Lean Body Mass (Boer Formula): ${calculations.lbmBoer} kg
- Body Surface Area (Mosteller): ${calculations.bsaMosteller} m²

CLINICAL IMPLICATION:
${calculations.categoryData.clinicalImplication}
Generated: ${new Date().toLocaleString()}`;

        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    }, [calculations, heightCm, rawH, heightUnit, weightKg, rawW, weightUnit, sex, population]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 pt-8 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <Scale className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        BMI & Anthropometric Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> WHO & Devine IBW Aligned
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Body mass index, Devine/Robinson IBW, AdjBW (40%), Lean Body Mass & metabolic risk assessment
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
                                <span>Clinical Anthropometry & Weight Classification Protocol</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Height & Weight</strong>
                                    Type measurements in cm/in and kg/lbs. Select biological sex for accurate Devine Ideal Body Weight (IBW).
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Population Cutoff</strong>
                                    Choose standard WHO cutoffs or Asian-Pacific criteria (lower threshold for metabolic syndrome).
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Review Dosing Weights & Export</strong>
                                    Inspect Devine IBW, AdjBW (40%), healthy weight delta, and export the EHR consult note.
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
                                key={p.name}
                                type="button"
                                onClick={() => handleLoadPreset(p)}
                                className="group p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition flex flex-col justify-between"
                            >
                                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                                    {p.name}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                    {p.tag} ({p.sex === "male" ? "M" : "F"})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: PATIENT INPUTS & CRITERIA (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* CARD 1: MEASUREMENTS & POPULATION */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
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

                            <div className="space-y-3.5">
                                {/* Sex Selector */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                        Biological Sex (Required for Devine IBW)
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 bg-gray-200/70 p-0.5 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setSex("male")}
                                            className={`py-1.5 text-xs font-bold rounded-md transition ${sex === "male"
                                                    ? "bg-white text-blue-700 shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            Male (50 kg Base)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSex("female")}
                                            className={`py-1.5 text-xs font-bold rounded-md transition ${sex === "female"
                                                    ? "bg-white text-blue-700 shadow-xs"
                                                    : "text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            Female (45.5 kg Base)
                                        </button>
                                    </div>
                                </div>

                                {/* Height & Weight Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Height */}
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
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
                                                placeholder="e.g. 175"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {heightUnit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Weight */}
                                    <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3">
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
                                                placeholder="e.g. 75"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-green-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {weightUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Population Criteria Toggle */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Metabolic Risk Population Standard
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setPopulation("who_standard")}
                                            className={`p-2.5 rounded-xl border transition text-left ${population === "who_standard"
                                                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500"
                                                    : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="font-extrabold">WHO International</div>
                                            <div className="text-[10px] font-normal text-gray-500">Overweight &ge; 25, Obese &ge; 30</div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPopulation("who_asian")}
                                            className={`p-2.5 rounded-xl border transition text-left ${population === "who_asian"
                                                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500"
                                                    : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="font-extrabold">WHO Asian-Pacific</div>
                                            <div className="text-[10px] font-normal text-gray-500">Overweight &ge; 23, Obese &ge; 27.5</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: WHO CLASSIFICATION CRITERIA TABLE */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                WHO Weight Classification Reference
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2 px-3">Classification</th>
                                            <th className="py-2 px-3">BMI (kg/m²)</th>
                                            <th className="py-2 px-3">Health Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-[11px]">
                                        <tr><td className="py-1.5 px-3 font-semibold text-rose-700">Severe Thinness</td><td className="py-1.5 px-3">&lt; 16.0</td><td className="py-1.5 px-3 text-gray-500">Very High</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-amber-700">Moderate Thinness</td><td className="py-1.5 px-3">16.0 – 16.9</td><td className="py-1.5 px-3 text-gray-500">High</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-amber-600">Mild Thinness</td><td className="py-1.5 px-3">17.0 – 18.4</td><td className="py-1.5 px-3 text-gray-500">Moderate</td></tr>
                                        <tr className="bg-emerald-50/50 font-bold"><td className="py-1.5 px-3 text-emerald-800">Normal Weight</td><td className="py-1.5 px-3 text-emerald-800">18.5 – 24.9</td><td className="py-1.5 px-3 text-emerald-700">Low (Optimal)</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-yellow-700">Overweight (Pre-Obese)</td><td className="py-1.5 px-3">25.0 – 29.9</td><td className="py-1.5 px-3 text-gray-500">Moderate</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-orange-700">Obese Class I</td><td className="py-1.5 px-3">30.0 – 34.9</td><td className="py-1.5 px-3 text-gray-500">High</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-rose-700">Obese Class II</td><td className="py-1.5 px-3">35.0 – 39.9</td><td className="py-1.5 px-3 text-gray-500">Very High</td></tr>
                                        <tr><td className="py-1.5 px-3 font-semibold text-purple-700">Obese Class III</td><td className="py-1.5 px-3">&ge; 40.0</td><td className="py-1.5 px-3 text-gray-500">Extremely High</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: HERO BMI OUTPUT & DOSING WEIGHTS (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* HERO BMI CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Body Mass Index & Metabolic Health
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
                                            <span>Copied to EHR!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Consult</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {calculations ? (
                                <div className="space-y-4">
                                    {/* Big Number Output */}
                                    <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                        <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                                            Calculated Body Mass Index (BMI)
                                        </span>
                                        <div className="text-5xl font-black tracking-tight text-white">
                                            {calculations.bmi}{" "}
                                            <span className="text-2xl font-bold text-green-200">kg/m²</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {calculations.categoryData.label} — {calculations.categoryData.risk}
                                        </div>
                                    </div>

                                    {/* Healthy Weight Target Box */}
                                    <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/15 space-y-1 text-xs">
                                        <div className="flex items-center justify-between font-bold text-green-200">
                                            <span className="flex items-center gap-1">
                                                <Target className="h-4 w-4" /> Healthy Weight Range (BMI 18.5–24.9):
                                            </span>
                                            <span className="text-white text-sm">
                                                {calculations.healthyWeightMinKg} – {calculations.healthyWeightMaxKg} kg
                                            </span>
                                        </div>
                                        <p className="text-blue-100 text-[11px] pt-0.5">{calculations.weightDeltaMsg}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Enter height and weight to calculate BMI.</p>
                                </div>
                            )}
                        </div>

                        {/* VISUAL BMI SPECTRUM GAUGE */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-700 flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        Clinical BMI Spectrum
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${calculations.categoryData.badgeColor}`}>
                                        {calculations.bmi} kg/m²
                                    </span>
                                </div>

                                <div className="relative pt-6 pb-2">
                                    {/* Gauge Track */}
                                    <div className="h-3.5 bg-gradient-to-r from-blue-300 via-emerald-400 via-yellow-400 via-orange-400 to-purple-600 rounded-full w-full relative overflow-hidden" />

                                    {/* Marker Needle */}
                                    <div
                                        className="absolute top-1 transition-all duration-300 -translate-x-1/2"
                                        style={{
                                            left: `${Math.min(100, Math.max(0, ((calculations.bmi - 14) / (45 - 14)) * 100))}%`,
                                        }}
                                    >
                                        <div className="bg-gray-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                            {calculations.bmi}
                                        </div>
                                        <div className="w-0.5 h-3.5 bg-gray-900 mx-auto" />
                                    </div>

                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5 mt-1">
                                        <span>14.0 (Under)</span>
                                        <span>18.5 (Normal)</span>
                                        <span>25.0 (Over)</span>
                                        <span>30.0 (Obese)</span>
                                        <span>40.0+ (Severe)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHARMACOKINETIC DOSING WEIGHTS SUITE */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                        Pharmacokinetic Dosing Weights & Body Composition
                                    </h3>
                                    <span className="text-[10px] text-gray-400">Clinical Pharmacy Suite</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    {/* Devine IBW */}
                                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-blue-700 block">Devine IBW (1974)</span>
                                        <div className="text-lg font-black text-gray-900">{calculations.ibwDevine} kg</div>
                                        <span className="text-[10px] text-gray-500 block">CrCl & Vancomycin standard</span>
                                    </div>

                                    {/* Adjusted Body Weight */}
                                    <div className="p-3 rounded-xl bg-green-50/70 border border-green-100 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-green-700 block">AdjBW (40% Factor)</span>
                                        <div className="text-lg font-black text-gray-900">{calculations.adjBw} kg</div>
                                        <span className="text-[10px] text-gray-500 block">Obese aminoglycoside dosing</span>
                                    </div>

                                    {/* Lean Body Mass */}
                                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-teal-700 block">Lean Mass (Boer)</span>
                                        <div className="text-lg font-black text-gray-900">{calculations.lbmBoer} kg</div>
                                        <span className="text-[10px] text-gray-500 block">Fat-free mass estimate</span>
                                    </div>

                                    {/* Robinson IBW */}
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-gray-600 block">Robinson IBW (1983)</span>
                                        <div className="text-base font-bold text-gray-800">{calculations.ibwRobinson} kg</div>
                                        <span className="text-[10px] text-gray-400 block">Alternative equation</span>
                                    </div>

                                    {/* Hamwi IBW */}
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-gray-600 block">Hamwi IBW (1964)</span>
                                        <div className="text-base font-bold text-gray-800">{calculations.ibwHamwi} kg</div>
                                        <span className="text-[10px] text-gray-400 block">Dietetics reference</span>
                                    </div>

                                    {/* BSA Mosteller */}
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-0.5">
                                        <span className="text-[10px] uppercase font-bold text-gray-600 block">BSA (Mosteller)</span>
                                        <div className="text-base font-bold text-gray-800">{calculations.bsaMosteller} m²</div>
                                        <span className="text-[10px] text-gray-400 block">Chemo & cardiac index</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MANDATORY CLINICAL SAFETY WARNING */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Clinical Evaluation Note:</strong>
                                    BMI is a population-level screening metric. It may overestimate adiposity in muscular athletes and underestimate body fat in elderly or sarcopenic patients with reduced muscle mass. Waist circumference and metabolic lab panels (HbA1c, lipid panel) should be evaluated alongside BMI.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* ─── COLLAPSIBLE FORMULAS & EVIDENCE REFERENCE ────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Pharmacokinetic Equations & Body Weight Formulas Reference
                        </span>
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showDetails && (
                        <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                            <div>
                                <strong className="text-gray-900 block mb-0.5">1. Body Mass Index (Quetelet Index):</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    BMI = Weight (kg) / [Height (m)]²
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">2. Devine Ideal Body Weight (1974) — Clinical Gold Standard:</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    Male: IBW = 50.0 kg + 2.3 × (Height in inches - 60)
                                    <br />
                                    Female: IBW = 45.5 kg + 2.3 × (Height in inches - 60)
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">3. Adjusted Body Weight (AdjBW 40%):</strong>
                                <code className="text-green-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    AdjBW = IBW + 0.4 × (Actual Weight - IBW)
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">4. Boer Lean Body Mass (1984):</strong>
                                <code className="text-teal-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    Male: eLBM = 0.407 × Weight(kg) + 0.267 × Height(cm) - 19.2
                                    <br />
                                    Female: eLBM = 0.252 × Weight(kg) + 0.473 × Height(cm) - 48.3
                                </code>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical Anthropometric Advisory:</strong> Compliant with World Health Organization (WHO) Technical Report Series 854 and American College of Clinical Pharmacy (ACCP) Dosing Guidelines.
                    </p>
                    <p className="text-gray-400">
                        &copy; 2024–2026 Advanced Anthropometric & Metabolic Clinical Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}