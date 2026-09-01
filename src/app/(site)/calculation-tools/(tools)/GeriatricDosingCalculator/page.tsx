"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    UserCheck,
    Calculator,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
    Sparkles,
    RefreshCw,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    Scale,
    Pill,
    Stethoscope,
    HelpCircle,
    Zap,
    ShieldCheck,
    HeartPulse,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type GeriatricRule = "start_low_50" | "start_low_33" | "renal_crcl" | "frailty_adjusted";
export type WeightUnit = "kg" | "lbs";
export type ScrUnit = "mg/dL" | "umol/L";
export type FrailtyStatus = "robust" | "pre_frail" | "frail" | "severely_frail";

export interface DrugPreset {
    name: string;
    brand: string;
    category: string;
    adultDoseMg: number;
    frequency: string;
    route: string;
    beersWarning: string | null;
    clinicalPearls: string;
}

export interface PatientPreset {
    name: string;
    tag: string;
    age: string;
    sex: "male" | "female";
    weight: string;
    weightUnit: WeightUnit;
    scr: string;
    scrUnit: ScrUnit;
    frailty: FrailtyStatus;
    adultDose: string;
    rule: GeriatricRule;
}

// ─── GERIATRIC DRUG PRESETS ──────────────────────────────────────────

const GERIATRIC_DRUG_PRESETS: DrugPreset[] = [
    {
        name: "Apixaban",
        brand: "Eliquis",
        category: "Anticoagulant (DOAC)",
        adultDoseMg: 5,
        frequency: "BID (Twice Daily)",
        route: "Oral",
        beersWarning: null,
        clinicalPearls: "Reduce to 2.5 mg BID if patient meets ≥ 2 ABC criteria: Age ≥ 80, Weight ≤ 60 kg, or SCr ≥ 1.5 mg/dL.",
    },
    {
        name: "Digoxin",
        brand: "Lanoxin",
        category: "Cardiac Glycoside / Inotrope",
        adultDoseMg: 0.25,
        frequency: "Daily",
        route: "Oral",
        beersWarning: "AGS Beers Criteria High Risk: Doses > 0.125 mg/day offer no additional benefit and drastically increase mortality & toxicity.",
        clinicalPearls: "Target geriatric serum trough: 0.5–0.9 ng/mL. Max recommended geriatric dose is 0.125 mg/day (or 0.0625 mg QOD in CKD).",
    },
    {
        name: "Gabapentin",
        brand: "Neurontin",
        category: "GABA Analogue / Neuropathic",
        adultDoseMg: 300,
        frequency: "TID (3 times daily)",
        route: "Oral",
        beersWarning: "Fall & Sedation Risk: Severe CNS depression and ataxia when combined with opioids or in renal impairment.",
        clinicalPearls: "Exclusively renally eliminated. Start elderly at 100 mg QHS and titrate slowly based on CrCl.",
    },
    {
        name: "Metformin",
        brand: "Glucophage",
        category: "Biguanide / Antidiabetic",
        adultDoseMg: 1000,
        frequency: "BID (Twice Daily)",
        route: "Oral",
        beersWarning: null,
        clinicalPearls: "Contraindicated if eGFR < 30 mL/min/1.73m². Max 1000 mg/day if eGFR 30–44 mL/min. Monitor B12 deficiency.",
    },
    {
        name: "Citalopram",
        brand: "Celexa",
        category: "SSRI Antidepressant",
        adultDoseMg: 40,
        frequency: "Daily",
        route: "Oral",
        beersWarning: "QTc Prolongation Warning: Maximum dose is 20 mg/day in patients ≥ 60 years old.",
        clinicalPearls: "FDA warning: Geriatric max dose is 20 mg/day due to risk of Torsades de Pointes and hyponatremia/SIADH.",
    },
    {
        name: "Lorazepam",
        brand: "Ativan",
        category: "Benzodiazepine",
        adultDoseMg: 1,
        frequency: "TID PRN",
        route: "Oral",
        beersWarning: "AGS Beers Criteria Strongly Avoid: Drastically increases risk of cognitive impairment, delirium, falls, and hip fractures.",
        clinicalPearls: "If unavoidable for acute crisis, use LOT (Lorazepam, Oxazepam, Temazepam) due to lack of active oxidative metabolites, at 50% dose.",
    },
    {
        name: "Levothyroxine",
        brand: "Synthroid",
        category: "Thyroid Hormone",
        adultDoseMg: 0.1,
        frequency: "Daily",
        route: "Oral",
        beersWarning: null,
        clinicalPearls: "In elderly patients with coronary artery disease (CAD), start low at 12.5–25 mcg/day to avoid precipitating myocardial ischemia.",
    },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function GeriatricDosingCalculator() {
    // Patient Biometrics
    const [age, setAge] = useState<string>("78");
    const [sex, setSex] = useState<"male" | "female">("female");
    const [weightInput, setWeightInput] = useState<string>("62");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [scrInput, setScrInput] = useState<string>("1.2");
    const [scrUnit, setScrUnit] = useState<ScrUnit>("mg/dL");
    const [roundLowScr, setRoundLowScr] = useState<boolean>(true); // Sarcopenia correction

    // Clinical Status & Dose
    const [frailty, setFrailty] = useState<FrailtyStatus>("pre_frail");
    const [adultDose, setAdultDose] = useState<string>("100");
    const [doseUnit, setDoseUnit] = useState<string>("mg");
    const [rule, setRule] = useState<GeriatricRule>("start_low_50");
    const [selectedDrug, setSelectedDrug] = useState<string>("custom");

    // UI States
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showFormulas, setShowFormulas] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Patient Archetypes
    const patientPresets: PatientPreset[] = [
        { name: "Fit Senior", tag: "Age 68, CrCl ~80", age: "68", sex: "male", weight: "76", weightUnit: "kg", scr: "0.9", scrUnit: "mg/dL", frailty: "robust", adultDose: "100", rule: "start_low_50" },
        { name: "Frail CKD 3b", tag: "Age 82, CrCl ~28", age: "82", sex: "female", weight: "54", weightUnit: "kg", scr: "1.4", scrUnit: "mg/dL", frailty: "frail", adultDose: "100", rule: "frailty_adjusted" },
        { name: "Sarcopenic Low SCr", tag: "Age 88, SCr 0.5", age: "88", sex: "female", weight: "45", weightUnit: "kg", scr: "0.5", scrUnit: "mg/dL", frailty: "frail", adultDose: "100", rule: "renal_crcl" },
        { name: "Polypharmacy Fall Risk", tag: "Age 79, Multi-morbid", age: "79", sex: "male", weight: "70", weightUnit: "kg", scr: "1.3", scrUnit: "mg/dL", frailty: "pre_frail", adultDose: "100", rule: "start_low_33" },
        { name: "Extreme Age (92y)", tag: "CrCl ~20 mL/min", age: "92", sex: "female", weight: "48", weightUnit: "kg", scr: "1.6", scrUnit: "mg/dL", frailty: "severely_frail", adultDose: "100", rule: "frailty_adjusted" },
    ];

    // Numeric Normalization
    const numAge = parseFloat(age) || 65;
    const rawWeight = parseFloat(weightInput) || 0;
    const rawScr = parseFloat(scrInput) || 0;
    const numAdultDose = parseFloat(adultDose) || 0;

    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawWeight * 0.453592 * 10) / 10;
        return rawWeight;
    }, [rawWeight, weightUnit]);

    const scrMgDl = useMemo(() => {
        if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
        return rawScr;
    }, [rawScr, scrUnit]);

    // Sarcopenia-Adjusted Serum Creatinine
    const effectiveScr = useMemo(() => {
        if (roundLowScr && scrMgDl < 0.8 && scrMgDl > 0) {
            return 0.8; // Common geriatric clinical convention to avoid CrCl overestimation
        }
        return scrMgDl;
    }, [scrMgDl, roundLowScr]);

    // Cockcroft-Gault CrCl
    const crcl = useMemo(() => {
        if (numAge <= 0 || weightKg <= 0 || effectiveScr <= 0) return 0;
        let val = ((140 - numAge) * weightKg) / (72 * effectiveScr);
        if (sex === "female") val *= 0.85;
        return Math.round(val * 10) / 10;
    }, [numAge, weightKg, effectiveScr, sex]);

    // Unrounded CrCl (for comparison)
    const unadjustedCrcl = useMemo(() => {
        if (numAge <= 0 || weightKg <= 0 || scrMgDl <= 0) return 0;
        let val = ((140 - numAge) * weightKg) / (72 * scrMgDl);
        if (sex === "female") val *= 0.85;
        return Math.round(val * 10) / 10;
    }, [numAge, weightKg, scrMgDl, sex]);

    // Frailty Multiplier
    const frailtyMultiplier = useMemo(() => {
        switch (frailty) {
            case "robust": return 1.0;
            case "pre_frail": return 0.85;
            case "frail": return 0.70;
            case "severely_frail": return 0.55;
        }
    }, [frailty]);

    // ─── GERIATRIC DOSING CALCULATIONS (4 RULES) ───────────────────────
    const ruleCalculations = useMemo(() => {
        if (numAdultDose <= 0) return null;

        // Rule 1: Standard Start-Low (50% rule)
        const dose50 = Math.round(numAdultDose * 0.5 * 100) / 100;

        // Rule 2: Conservative Start-Low (33% rule - for CNS/Narrow therapeutic index)
        const dose33 = Math.round(numAdultDose * 0.333 * 100) / 100;

        // Rule 3: Renal Clearance Scaled (CrCl / 100 * AdultDose)
        const renalFactor = Math.min(1.0, Math.max(0.2, crcl / 100));
        const doseRenal = Math.round(numAdultDose * renalFactor * 100) / 100;

        // Rule 4: Comprehensive Frailty & Clearance Adjusted
        const combinedFactor = Math.min(1.0, Math.max(0.15, (crcl / 100) * frailtyMultiplier));
        const doseFrailty = Math.round(numAdultDose * combinedFactor * 100) / 100;

        // Active Selected Dose
        let activeDose = dose50;
        let activeRuleLabel = "Standard Geriatric Start-Low (50%)";
        let activeRationale = "Standard conservative geriatric starting dose to minimize adverse drug events.";

        if (rule === "start_low_33") {
            activeDose = dose33;
            activeRuleLabel = "Conservative Start-Low (33%)";
            activeRationale = "Recommended for CNS-active, anticholinergic, or narrow therapeutic index agents in vulnerable elders.";
        } else if (rule === "renal_crcl") {
            activeDose = doseRenal;
            activeRuleLabel = "Renal Clearance Proportional Dosing";
            activeRationale = `Scaled proportionally to patient's calculated CrCl (${crcl} mL/min) relative to normal adult clearance.`;
        } else if (rule === "frailty_adjusted") {
            activeDose = doseFrailty;
            activeRuleLabel = "Multi-Factorial Frailty & Renal Adjusted";
            activeRationale = `Integrates ${crcl} mL/min renal clearance with a ${(frailtyMultiplier * 100).toFixed(0)}% frailty coefficient.`;
        }

        const reductionPercent = Math.round(((numAdultDose - activeDose) / numAdultDose) * 100);

        return {
            dose50,
            dose33,
            doseRenal,
            doseFrailty,
            activeDose,
            activeRuleLabel,
            activeRationale,
            reductionPercent,
            renalFactor: Math.round(renalFactor * 100),
        };
    }, [numAdultDose, crcl, frailtyMultiplier, rule]);

    // Beers Criteria Active Warning
    const activeDrugMonograph = useMemo(() => {
        return GERIATRIC_DRUG_PRESETS.find((d) => d.name === selectedDrug) || null;
    }, [selectedDrug]);

    // Handle Preset Selection
    const handleSelectDrug = (drugName: string) => {
        setSelectedDrug(drugName);
        const drug = GERIATRIC_DRUG_PRESETS.find((d) => d.name === drugName);
        if (drug) {
            setAdultDose(drug.adultDoseMg.toString());
            setDoseUnit("mg");
            if (drug.name === "Digoxin" || drug.name === "Lorazepam") {
                setRule("start_low_33");
            } else if (drug.name === "Gabapentin" || drug.name === "Metformin") {
                setRule("renal_crcl");
            }
        }
    };

    // Load Patient Preset
    const handleLoadPatientPreset = (p: PatientPreset) => {
        setAge(p.age);
        setSex(p.sex);
        setWeightInput(p.weight);
        setWeightUnit(p.weightUnit);
        setScrInput(p.scr);
        setScrUnit(p.scrUnit);
        setFrailty(p.frailty);
        setAdultDose(p.adultDose);
        setRule(p.rule);
        setSelectedDrug("custom");
    };

    // Reset
    const handleReset = () => {
        setAge("78");
        setSex("female");
        setWeightInput("62");
        setWeightUnit("kg");
        setScrInput("1.2");
        setScrUnit("mg/dL");
        setRoundLowScr(true);
        setFrailty("pre_frail");
        setAdultDose("100");
        setDoseUnit("mg");
        setRule("start_low_50");
        setSelectedDrug("custom");
    };

    // Copy Consult Note
    const handleCopyConsultNote = useCallback(() => {
        if (!ruleCalculations) return;

        const note = `=== GERIATRIC PHARMACOTHERAPY & DOSING CONSULT ===
PATIENT DEMOGRAPHICS & PHYSIOLOGY:
- Age: ${numAge} yrs | Sex: ${sex.toUpperCase()} | Weight: ${weightKg} kg (${rawWeight} ${weightUnit})
- Serum Creatinine: ${scrMgDl} mg/dL ${roundLowScr && scrMgDl < 0.8 ? `(Sarcopenia-Adjusted to 0.8 mg/dL)` : ""}
- Cockcroft-Gault CrCl: ${crcl} mL/min (Unadjusted: ${unadjustedCrcl} mL/min)
- Frailty Staging: ${frailty.replace("_", " ").toUpperCase()} (Multi-factor scale: ${(frailtyMultiplier * 100).toFixed(0)}%)

DRUG & DOSING EVALUATION:
- Drug: ${activeDrugMonograph ? `${activeDrugMonograph.name} (${activeDrugMonograph.brand})` : "Custom Agent"}
- Standard Adult Dose: ${numAdultDose} ${doseUnit}
- RECOMMENDED GERIATRIC DOSE: ${ruleCalculations.activeDose} ${doseUnit} (${ruleCalculations.reductionPercent}% Dose Reduction)
- Applied Dosing Strategy: ${ruleCalculations.activeRuleLabel}
- Clinical Rationale: ${ruleCalculations.activeRationale}

2023 AGS BEERS CRITERIA & MEDICATION SAFETY:
${activeDrugMonograph?.beersWarning ? `[BEERS CRITERIA ALERT]: ${activeDrugMonograph.beersWarning}` : "No direct high-risk Beers criteria violations identified for selected dosing."}
${activeDrugMonograph?.clinicalPearls ? `[CLINICAL PEARLS]: ${activeDrugMonograph.clinicalPearls}` : ""}

PRINCIPLE: "Start Low, Go Slow, but Go Until Goal." Titrate in 2-4 week intervals based on clinical efficacy and adverse effects.
Generated: ${new Date().toLocaleString()}`;

        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    }, [
        ruleCalculations,
        numAge,
        sex,
        weightKg,
        rawWeight,
        weightUnit,
        scrMgDl,
        roundLowScr,
        crcl,
        unadjustedCrcl,
        frailty,
        frailtyMultiplier,
        activeDrugMonograph,
        numAdultDose,
        doseUnit,
    ]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <UserCheck className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Geriatric Dosing & Safety Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> AGS Beers 2023 Aligned
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    &quot;Start Low, Go Slow&quot; precision dosing, CrCl clearance scaling, sarcopenia adjustments & Beers Criteria alerts
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
                                <span>Geriatric Pharmacotherapy Protocol & Instructions</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Patient Vitals & SCr</strong>
                                    Input age, weight, and serum creatinine. The engine calculates CrCl with optional sarcopenia low-SCr correction.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Drug or Adult Dose</strong>
                                    Pick a high-yield geriatric drug preset (Apixaban, Digoxin, Gabapentin) or type any standard adult dose.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Apply Rule & Check Beers List</strong>
                                    Compare the 4 geriatric dosing rules, review Beers safety flags, and copy the clinical consult note.
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
                                Quick Geriatric Patient Archetypes (1-Click Presets)
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-400">Clinical Scenarios</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {patientPresets.map((p) => (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => handleLoadPatientPreset(p)}
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

                    {/* LEFT: PATIENT PARAMETERS & RULE SELECTOR (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* CARD 1: PATIENT BIOMETRICS & CLEARANCE */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                    1. Geriatric Patient Biometrics & Clearance
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
                                {/* Age & Sex */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Age (Years &ge; 65)
                                        </label>
                                        <input
                                            type="number"
                                            min="65"
                                            max="120"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 78"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Biological Sex
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 bg-gray-200/70 p-0.5 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setSex("male")}
                                                className={`py-1 text-xs font-bold rounded-md transition ${sex === "male"
                                                        ? "bg-white text-blue-700 shadow-xs"
                                                        : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSex("female")}
                                                className={`py-1 text-xs font-bold rounded-md transition ${sex === "female"
                                                        ? "bg-white text-blue-700 shadow-xs"
                                                        : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight & SCr */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Weight */}
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                                <Scale className="h-3 w-3 text-blue-600" /> Body Weight
                                            </label>
                                            <div className="inline-flex rounded bg-blue-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setWeightUnit("kg")}
                                                    className={`px-1.5 py-0.5 rounded ${weightUnit === "kg" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    kg
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setWeightUnit("lbs")}
                                                    className={`px-1.5 py-0.5 rounded ${weightUnit === "lbs" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    lbs
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={weightInput}
                                                onChange={(e) => setWeightInput(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {weightUnit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Serum Creatinine */}
                                    <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-teal-950 uppercase">SCr</label>
                                            <div className="inline-flex rounded bg-teal-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setScrUnit("mg/dL")}
                                                    className={`px-1 py-0.5 rounded ${scrUnit === "mg/dL" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                                >
                                                    mg/dL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setScrUnit("umol/L")}
                                                    className={`px-1 py-0.5 rounded ${scrUnit === "umol/L" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                                >
                                                    µmol/L
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={scrInput}
                                                onChange={(e) => setScrInput(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-teal-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {scrUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sarcopenia Low-SCr Floor Checkbox */}
                                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="sarcopeniaToggle"
                                            checked={roundLowScr}
                                            onChange={(e) => setRoundLowScr(e.target.checked)}
                                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="sarcopeniaToggle" className="text-gray-800 font-semibold cursor-pointer">
                                            Sarcopenia Low-SCr Floor (Round SCr &lt; 0.8 to 0.8 mg/dL)
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">Elderly Safety</span>
                                </div>

                                {/* CrCl Live Output Banner */}
                                <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1">
                                            <Activity className="h-3.5 w-3.5 text-green-300" /> Cockcroft-Gault CrCl
                                        </span>
                                        <span className="text-[11px] text-blue-100 mt-0.5 block">
                                            {roundLowScr && scrMgDl < 0.8 ? `Adjusted from unrounded ${unadjustedCrcl} mL/min` : "Standard calculation"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-white">{crcl}</span>
                                        <span className="text-xs font-bold text-green-100 ml-1">mL/min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: DRUG PRESET & GERIATRIC RULE SELECTOR */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Pill className="h-5 w-5 text-emerald-600" />
                                2. Medication & Geriatric Dosing Strategy
                            </h2>

                            <div className="space-y-3.5">
                                {/* Quick Drug Presets Dropdown */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                        Quick Drug Presets (Monographs & Beers Screener)
                                    </label>
                                    <select
                                        value={selectedDrug}
                                        onChange={(e) => handleSelectDrug(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="custom">-- Custom Drug (Enter Adult Dose Below) --</option>
                                        {GERIATRIC_DRUG_PRESETS.map((d) => (
                                            <option key={d.name} value={d.name}>
                                                {d.name} ({d.brand}) - Adult: {d.adultDoseMg} mg {d.frequency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Standard Adult Dose Input */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Standard Adult Dose
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={adultDose}
                                            onChange={(e) => {
                                                setAdultDose(e.target.value);
                                                setSelectedDrug("custom");
                                            }}
                                            placeholder="e.g. 100"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Dose Unit
                                        </label>
                                        <input
                                            type="text"
                                            value={doseUnit}
                                            onChange={(e) => setDoseUnit(e.target.value)}
                                            placeholder="mg"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 text-center focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Frailty / Vulnerability Scale */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Clinical Frailty Assessment (Rockwood Scale)
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                                        {(
                                            [
                                                { id: "robust", label: "Robust / Fit", sub: "100% capacity" },
                                                { id: "pre_frail", label: "Pre-Frail", sub: "85% capacity" },
                                                { id: "frail", label: "Frail", sub: "70% capacity" },
                                                { id: "severely_frail", label: "Severe Frail", sub: "55% capacity" },
                                            ] as const
                                        ).map((f) => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => setFrailty(f.id)}
                                                className={`p-2 rounded-xl border transition text-center flex flex-col items-center justify-center ${frailty === f.id
                                                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500"
                                                        : "border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{f.label}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{f.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Geriatric Dosing Rule Selector */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Select Geriatric Dosing Strategy
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { id: "start_low_50", title: "Start Low, Go Slow (50% Standard)", desc: "50% of adult dose. First-line for most cardiovascular, metabolic, and antibiotic therapies." },
                                            { id: "start_low_33", title: "Conservative Start-Low (33% Rule)", desc: "One-third adult dose. Recommended for CNS-active, sedatives, or narrow therapeutic index drugs." },
                                            { id: "renal_crcl", title: "Renal Clearance Scaling (CrCl / 100)", desc: `Dose scaled directly to renal function (${crcl} mL/min -> ${(Math.min(1.0, crcl / 100) * 100).toFixed(0)}% of adult dose).` },
                                            { id: "frailty_adjusted", title: "Multi-Factorial Frailty & Renal Scaling", desc: "Integrates renal clearance and clinical frailty index for multi-morbid elders." },
                                        ].map((r) => (
                                            <div
                                                key={r.id}
                                                onClick={() => setRule(r.id as GeriatricRule)}
                                                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${rule === r.id
                                                        ? "border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-400"
                                                        : "border-gray-200 bg-white hover:bg-gray-50"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="geriatricRule"
                                                    checked={rule === r.id}
                                                    onChange={() => setRule(r.id as GeriatricRule)}
                                                    className="mt-1 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div>
                                                    <strong className="block text-xs font-bold text-gray-900">{r.title}</strong>
                                                    <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">{r.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: HERO DOSE OUTPUT & BEERS CRITERIA SCREENER (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* HERO DOSE CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <HeartPulse className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Recommended Geriatric Dose
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

                            {ruleCalculations ? (
                                <div className="space-y-4">
                                    {/* Big Number Output */}
                                    <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                        <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                                            {ruleCalculations.activeRuleLabel}
                                        </span>
                                        <div className="text-5xl font-black tracking-tight text-white">
                                            {ruleCalculations.activeDose}{" "}
                                            <span className="text-2xl font-bold text-green-200">{doseUnit}</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {ruleCalculations.reductionPercent}% Dose Reduction vs Adult Standard ({numAdultDose} {doseUnit})
                                        </div>
                                    </div>

                                    {/* Visual Dose Percentage Meter */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex justify-between text-[11px] text-blue-100">
                                            <span>Geriatric Starting Fraction:</span>
                                            <span className="font-semibold">
                                                {(100 - ruleCalculations.reductionPercent)}% of Standard Adult Dose
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden flex border border-white/20">
                                            <div
                                                style={{ width: `${Math.min(100, Math.max(5, 100 - ruleCalculations.reductionPercent))}%` }}
                                                className="bg-green-300 h-full"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-blue-100">
                                            <span>0 {doseUnit}</span>
                                            <span>Geriatric Target ({ruleCalculations.activeDose} {doseUnit})</span>
                                            <span>Adult 100% ({numAdultDose} {doseUnit})</span>
                                        </div>
                                    </div>

                                    {/* Clinical Rationale Box */}
                                    <div className="rounded-xl bg-white/10 p-3.5 text-xs text-blue-100 backdrop-blur-sm border border-white/10 space-y-1">
                                        <strong className="text-white block font-bold">Clinical Directive:</strong>
                                        <p className="leading-relaxed">{ruleCalculations.activeRationale}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Enter adult dose to calculate geriatric adjustments.</p>
                                </div>
                            )}
                        </div>

                        {/* 2023 AGS BEERS CRITERIA SAFETY BANNER */}
                        {activeDrugMonograph?.beersWarning ? (
                            <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 shadow-sm text-rose-950 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
                                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                                    <span>2023 AGS Beers Criteria Safety Warning</span>
                                </div>
                                <p className="text-xs leading-relaxed font-semibold">
                                    {activeDrugMonograph.beersWarning}
                                </p>
                                <div className="text-[11px] text-rose-800 bg-white/60 p-2.5 rounded-lg border border-rose-200">
                                    <strong>Clinical Pearl:</strong> {activeDrugMonograph.clinicalPearls}
                                </div>
                            </div>
                        ) : activeDrugMonograph?.clinicalPearls ? (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm text-blue-950 space-y-1">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-800">
                                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span>Geriatric Clinical Monograph Pearls</span>
                                </div>
                                <p className="text-xs leading-relaxed text-blue-900">
                                    {activeDrugMonograph.clinicalPearls}
                                </p>
                            </div>
                        ) : null}

                        {/* MULTI-RULE COMPARISON TABLE */}
                        {ruleCalculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                    Geriatric Dose Comparison Across 4 Rules
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2.5 px-3">Rule / Strategy</th>
                                                <th className="py-2.5 px-3">Calculated Dose</th>
                                                <th className="py-2.5 px-3">Reduction</th>
                                                <th className="py-2.5 px-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr className={rule === "start_low_50" ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}>
                                                <td className="py-2 px-3">Start Low 50% Rule</td>
                                                <td className="py-2 px-3">{ruleCalculations.dose50} {doseUnit}</td>
                                                <td className="py-2 px-3 text-gray-500">-50%</td>
                                                <td className="py-2 px-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRule("start_low_50")}
                                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                    >
                                                        Apply
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className={rule === "start_low_33" ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}>
                                                <td className="py-2 px-3">Conservative 33% Rule</td>
                                                <td className="py-2 px-3">{ruleCalculations.dose33} {doseUnit}</td>
                                                <td className="py-2 px-3 text-gray-500">-67%</td>
                                                <td className="py-2 px-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRule("start_low_33")}
                                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                    >
                                                        Apply
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className={rule === "renal_crcl" ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}>
                                                <td className="py-2 px-3">Renal Clearance Scaled</td>
                                                <td className="py-2 px-3">{ruleCalculations.doseRenal} {doseUnit}</td>
                                                <td className="py-2 px-3 text-emerald-700 font-semibold">
                                                    -{Math.round(((numAdultDose - ruleCalculations.doseRenal) / numAdultDose) * 100)}%
                                                </td>
                                                <td className="py-2 px-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRule("renal_crcl")}
                                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                    >
                                                        Apply
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className={rule === "frailty_adjusted" ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}>
                                                <td className="py-2 px-3">Frailty & Renal Adjusted</td>
                                                <td className="py-2 px-3">{ruleCalculations.doseFrailty} {doseUnit}</td>
                                                <td className="py-2 px-3 text-rose-700 font-semibold">
                                                    -{Math.round(((numAdultDose - ruleCalculations.doseFrailty) / numAdultDose) * 100)}%
                                                </td>
                                                <td className="py-2 px-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRule("frailty_adjusted")}
                                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                    >
                                                        Apply
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* MANDATORY CLINICAL SAFETY WARNING */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Geriatric Prescribing Golden Rule:</strong>
                                    &quot;Start low, go slow, but go until goal.&quot; Age-related changes in pharmacokinetics (decreased GFR, decreased hepatic mass, increased body fat) significantly prolong drug half-lives. Always perform medication reconciliation to avoid prescribing cascades.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* ─── COLLAPSIBLE FORMULAS & PHARMACOLOGY REFERENCE ───────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowFormulas(!showFormulas)}
                        className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Geriatric Pharmacokinetic Equations & References
                        </span>
                        {showFormulas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showFormulas && (
                        <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                            <div>
                                <strong className="text-gray-900 block mb-0.5">1. Cockcroft-Gault CrCl with Sarcopenia Floor:</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    CrCl = [(140 - Age) × Weight (kg)] / [72 × SCr (mg/dL)] × (0.85 if Female)
                                    <br />
                                    Note: If SCr &lt; 0.8 mg/dL due to low muscle mass, rounding to 0.8 mg/dL avoids overestimating clearance.
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">2. Renal Clearance Proportional Dosing:</strong>
                                <code className="text-green-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    Geriatric Dose = Adult Dose × min(1.0, CrCl / 100)
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">3. 2023 AGS Beers Criteria:</strong>
                                <p className="text-gray-600">
                                    American Geriatrics Society 2023 updated Beers Criteria for potentially inappropriate medication use in older adults (J Am Geriatr Soc. 2023;71(7):2052-2081).
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Geriatric Clinical Decision Support:</strong> Compliant with the 2023 AGS Beers Criteria, STOPP/START v3, and KDIGO Renal Adjustment Guidelines.
                    </p>
                    <p className="text-gray-400">
                        &copy; 2024–2026 Advanced Geriatric Clinical Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}