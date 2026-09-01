"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    Droplet,
    ExternalLink,
    Info,
    AlertTriangle,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
    RotateCcw,
    Layers,
    Sparkles,
    FlaskConical,
    Clock,
    Thermometer,
    Syringe,
    ArrowRight,
    Search,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    ShieldCheck,
    Gauge,
    Zap,
} from "lucide-react";

// ─── TYPES & INTERFACES (not exported) ─────────────────────────────
interface ReconstitutionPreset {
    id: string;
    drugName: string;
    brandName: string;
    vialStrengthMg: number;
    vialLabel: string;
    route: "IV Push" | "IV Piggyback" | "IM" | "IV / IM";
    displacementVolMl: number;
    standardDiluentVolMl: number;
    resultingConcMgMl: number;
    recommendedDiluents: string[];
    stability: {
        roomTemp: string;
        refrigerated: string;
        frozen?: string;
    };
    clinicalNotes: string;
    fdaLink: string;
}

type CalcMode = "doseToVol" | "volToDose" | "targetConc";
type ActiveTab = "vial-reconstitution" | "iv-bag-dilution" | "monograph-reference";

// ─── COMPREHENSIVE CLINICAL PARENTERAL DATABASE (not exported) ─────
const RECONSTITUTION_DATABASE: ReconstitutionPreset[] = [
    {
        id: "ceftriaxone-1g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.4,
        standardDiluentVolMl: 9.6,
        resultingConcMgMl: 100,
        recommendedDiluents: ["Sterile Water for Injection (SWFI)", "0.9% Sodium Chloride (NS)", "5% Dextrose (D5W)"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
            frozen: "26 weeks (-20°C)",
        },
        clinicalNotes: "CONTRAINDICATION: Do NOT mix or co-infuse with calcium-containing IV solutions (e.g., Lactated Ringer's) due to risk of fatal calcium-ceftriaxone crystalline precipitation in lungs/kidneys.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-1g-im",
        drugName: "Ceftriaxone (IM)",
        brandName: "Rocephin IM",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IM",
        displacementVolMl: 0.7,
        standardDiluentVolMl: 2.1,
        resultingConcMgMl: 350,
        recommendedDiluents: ["1% Lidocaine HCl (without epi)", "SWFI"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Reconstitute with 1% Lidocaine (no epi) to reduce severe injection pain. Inject deep into large muscle mass (gluteal). Max recommended IM volume is 2-3 mL per site.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-2g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 19.2,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Standard reconstitution yields 100 mg/mL. Dilute further into 50-100 mL IVPB and infuse over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "piptazo-3375g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 3375,
        vialLabel: "3.375 g Vial (3g / 0.375g)",
        route: "IV Piggyback",
        displacementVolMl: 1.8,
        standardDiluentVolMl: 15.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W", "Bacteriostatic Water"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Shake vigorously until completely dissolved. For extended infusion regimens, infuse over 3-4 hours after secondary dilution into 50-100 mL NS/D5W.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "piptazo-45g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 4500,
        vialLabel: "4.5 g Vial (4g / 0.5g)",
        route: "IV Piggyback",
        displacementVolMl: 2.4,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Yields 200 mg/mL total drug. Dilute in ≥50-100 mL compatible IV carrier solution prior to patient infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "vancomycin-1g",
        drugName: "Vancomycin HCl",
        brandName: "Vancocin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Lyophilized Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.5,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (vial)",
            refrigerated: "14 days (vial)",
        },
        clinicalNotes: "CRITICAL: NEVER GIVE IV PUSH OR IM. MUST be further diluted to ≤5 mg/mL (e.g. 1 g in ≥200 mL) and infused at ≤10 mg/min (≥60 min per 1 g) to prevent severe infusion reaction (Red Man Syndrome).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42217bc4-e223-455b-a25e-e0ef9f50e7b8",
    },
    {
        id: "ampicillin-1g",
        drugName: "Ampicillin Sodium",
        brandName: "Principen",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 3.4,
        resultingConcMgMl: 250,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "1 hour in D5W (rapid loss of potency!), 8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "RAPID DEGRADATION: Use reconstituted solution promptly. Avoid dextrose solutions as ampicillin hydrolyzes quickly at acidic pH.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=233e72eb-9174-4b53-a5bc-b73a388b1442",
    },
    {
        id: "unasyn-3g",
        drugName: "Ampicillin / Sulbactam",
        brandName: "Unasyn",
        vialStrengthMg: 3000,
        vialLabel: "3 g Vial (2g / 1g)",
        route: "IV Piggyback",
        displacementVolMl: 1.6,
        standardDiluentVolMl: 6.4,
        resultingConcMgMl: 375,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "Yields 375 mg/mL total (250 mg ampicillin + 125 mg sulbactam per mL). Dilute further to 3–45 mg/mL in NS for IV infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1f66bfad-1d11-4770-b184-a1db024f2b90",
    },
    {
        id: "cefazolin-1g",
        drugName: "Cefazolin Sodium",
        brandName: "Ancef",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.5,
        standardDiluentVolMl: 2.5,
        resultingConcMgMl: 330,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "For IV Push: Reconstitute with 10 mL SWFI (yields 100 mg/mL) and inject slowly over 3-5 minutes. For IM: Reconstitute with 2.5 mL SWFI (yields 330 mg/mL).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29a91079-8800-47b2-bd79-a78b40875e53",
    },
    {
        id: "meropenem-1g",
        drugName: "Meropenem",
        brandName: "Merrem",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.1,
        recommendedDiluents: ["SWFI", "0.9% NS", "5% Dextrose"],
        stability: {
            roomTemp: "2 hours in SWFI, 1 hour in D5W",
            refrigerated: "15 hours in SWFI, 24 hours in NS",
        },
        clinicalNotes: "Shake until clear. Infuse IV Push over 3-5 min or IVPB over 15-30 min (or 3-hour extended infusion for resistant pathogens).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=80e7228a-6b45-4ae0-b490-410a5e8e89f8",
    },
    {
        id: "cefepime-2g",
        drugName: "Cefepime HCl",
        brandName: "Maxipime",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 2.6,
        standardDiluentVolMl: 17.4,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "7 days (2-8°C)",
        },
        clinicalNotes: "Reconstituted solution may range from colorless to amber without loss of potency. Infuse IVPB over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=361d9cf1-33ea-44a6-98dc-a734fa096df6",
    },
];

// ─── MODULE 1: PRIMARY VIAL RECONSTITUTION COMPONENT (not exported) ─
function VialReconstitutionModule({
    vialStrength,
    setVialStrength,
    vialStrengthUnit,
    setVialStrengthUnit,
    displacementVol,
    setDisplacementVol,
    diluentAdded,
    setDiluentAdded,
    targetConc,
    setTargetConc,
    prescribedDose,
    setPrescribedDose,
    prescribedDoseUnit,
    setPrescribedDoseUnit,
    withdrawalVol,
    setWithdrawalVol,
    calcMode,
    setCalcMode,
    calculations,
    activePreset,
}: {
    vialStrength: string;
    setVialStrength: (v: string) => void;
    vialStrengthUnit: "mg" | "g";
    setVialStrengthUnit: (u: "mg" | "g") => void;
    displacementVol: string;
    setDisplacementVol: (v: string) => void;
    diluentAdded: string;
    setDiluentAdded: (v: string) => void;
    targetConc: string;
    setTargetConc: (v: string) => void;
    prescribedDose: string;
    setPrescribedDose: (v: string) => void;
    prescribedDoseUnit: "mg" | "g";
    setPrescribedDoseUnit: (u: "mg" | "g") => void;
    withdrawalVol: string;
    setWithdrawalVol: (v: string) => void;
    calcMode: CalcMode;
    setCalcMode: (m: CalcMode) => void;
    calculations: any;
    activePreset: ReconstitutionPreset | null;
}) {
    return (
        <div className="space-y-6">
            {/* Mode Selector Tabs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Select Calculation Target Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setCalcMode("doseToVol")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${calcMode === "doseToVol"
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Syringe className="h-3.5 w-3.5" />
                        Dose → Withdrawal Volume
                    </button>

                    <button
                        type="button"
                        onClick={() => setCalcMode("volToDose")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${calcMode === "volToDose"
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Calculator className="h-3.5 w-3.5" />
                        Volume → Delivered Dose
                    </button>

                    <button
                        type="button"
                        onClick={() => setCalcMode("targetConc")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${calcMode === "targetConc"
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        <Droplet className="h-3.5 w-3.5" />
                        Target Conc → Diluent Needed
                    </button>
                </div>
            </div>

            {/* Step 1: Vial Parameters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            1
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            Vial Strength & Powder Displacement
                        </h3>
                    </div>
                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Vial Baseline
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Total Vial Strength */}
                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                            Total Drug in Vial
                        </label>
                        <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-blue-500">
                            <input
                                type="number"
                                step="any"
                                value={vialStrength}
                                onChange={(e) => setVialStrength(e.target.value)}
                                placeholder="e.g. 1000"
                                className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none"
                            />
                            <select
                                value={vialStrengthUnit}
                                onChange={(e) => setVialStrengthUnit(e.target.value as "mg" | "g")}
                                className="bg-gray-100 px-3 text-xs font-bold text-gray-700 border-l border-gray-300 focus:outline-none"
                            >
                                <option value="mg">mg</option>
                                <option value="g">g</option>
                            </select>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Labeled active drug per vial</p>
                    </div>

                    {/* Powder Displacement Volume */}
                    <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase">
                                Powder Displacement Volume
                            </label>
                            <span className="text-[10px] text-green-700 font-semibold bg-green-100 px-1.5 py-0.2 rounded">
                                USP &lt;797&gt;
                            </span>
                        </div>
                        <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-green-500">
                            <input
                                type="number"
                                step="0.01"
                                value={displacementVol}
                                onChange={(e) => setDisplacementVol(e.target.value)}
                                placeholder="e.g. 0.4"
                                className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none pr-10"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                mL
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Volume added by dry drug powder</p>
                    </div>
                </div>
            </div>

            {/* Step 2: Diluent Addition */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                            2
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            Diluent Addition & Yield Concentration
                        </h3>
                    </div>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        Step 2
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {calcMode !== "targetConc" ? (
                        <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3.5">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                Diluent Volume to Add
                            </label>
                            <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-teal-500">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={diluentAdded}
                                    onChange={(e) => setDiluentAdded(e.target.value)}
                                    placeholder="e.g. 9.6"
                                    className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none pr-10"
                                />
                                <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                    mL
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Yields {calculations.finalReconstitutedVol.toFixed(2)} mL total solution
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3.5">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                Target Desired Concentration
                            </label>
                            <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-teal-500">
                                <input
                                    type="number"
                                    step="1"
                                    value={targetConc}
                                    onChange={(e) => setTargetConc(e.target.value)}
                                    placeholder="e.g. 100"
                                    className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none pr-14"
                                />
                                <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                    mg/mL
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Requires adding {calculations.diluentVolume.toFixed(2)} mL diluent
                            </p>
                        </div>
                    )}

                    {/* Primary Result Concentration Badge */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-gray-500">Resulting Concentration</span>
                        <div className="text-xl font-black text-gray-900 mt-0.5">
                            {calculations.finalConcMgMl > 0 ? (
                                <>
                                    {calculations.finalConcMgMl.toFixed(1)}{" "}
                                    <span className="text-xs font-bold text-blue-700">mg/mL</span>
                                </>
                            ) : (
                                <span className="text-xs text-gray-400">Enter valid volumes</span>
                            )}
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                            Total Yield Volume = <strong>{calculations.finalReconstitutedVol.toFixed(1)} mL</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3: Prescribed Dose & Syringe Withdrawal */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                            3
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            {calcMode === "volToDose" ? "Measured Syringe Volume" : "Patient Ordered Dose"}
                        </h3>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Syringe Draw
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {calcMode !== "volToDose" ? (
                        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                Prescribed Patient Dose
                            </label>
                            <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-emerald-500">
                                <input
                                    type="number"
                                    step="any"
                                    value={prescribedDose}
                                    onChange={(e) => setPrescribedDose(e.target.value)}
                                    placeholder="e.g. 750"
                                    className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none"
                                />
                                <select
                                    value={prescribedDoseUnit}
                                    onChange={(e) => setPrescribedDoseUnit(e.target.value as "mg" | "g")}
                                    className="bg-gray-100 px-3 text-xs font-bold text-gray-700 border-l border-gray-300 focus:outline-none"
                                >
                                    <option value="mg">mg</option>
                                    <option value="g">g</option>
                                </select>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Ordered dose on prescription</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5">
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                Volume Withdrawn in Syringe
                            </label>
                            <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-emerald-500">
                                <input
                                    type="number"
                                    step="0.05"
                                    value={withdrawalVol}
                                    onChange={(e) => setWithdrawalVol(e.target.value)}
                                    placeholder="e.g. 7.5"
                                    className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none pr-10"
                                />
                                <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                    mL
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Volume measured in syringe</p>
                        </div>
                    )}

                    {/* Syringe Callout Card */}
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-3.5 flex flex-col justify-center">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            {calcMode === "volToDose" ? "Delivered Dose" : "Withdrawal Volume Required"}
                        </span>
                        <div className="text-2xl font-black text-emerald-950 mt-0.5">
                            {calcMode === "volToDose" ? (
                                <>
                                    {calculations.calculatedDeliveredDoseMg.toFixed(1)}{" "}
                                    <span className="text-sm font-bold text-emerald-700">mg</span>
                                </>
                            ) : (
                                <>
                                    {calculations.calculatedWithdrawalVol.toFixed(2)}{" "}
                                    <span className="text-sm font-bold text-emerald-700">mL</span>
                                </>
                            )}
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                            Represents {calculations.vialFractionUsed.toFixed(1)}% of total reconstituted vial
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MODULE 2: SECONDARY IV BAG DILUTION & PUMP RATE (not exported) ─
function IVBagDilutionModule({
    carrierBagVol,
    setCarrierBagVol,
    infusionDurationMin,
    setInfusionDurationMin,
    calculations,
    activePreset,
}: {
    carrierBagVol: string;
    setCarrierBagVol: (v: string) => void;
    infusionDurationMin: string;
    setInfusionDurationMin: (v: string) => void;
    calculations: any;
    activePreset: ReconstitutionPreset | null;
}) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            Secondary IV Piggyback (IVPB) Carrier Dilution
                        </h3>
                    </div>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                        Pump Programming
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* IV Carrier Bag Selection */}
                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                            IV Carrier Bag Volume
                        </label>
                        <select
                            value={carrierBagVol}
                            onChange={(e) => setCarrierBagVol(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="50">50 mL (Small Volume IVPB)</option>
                            <option value="100">100 mL (Standard IVPB Bag)</option>
                            <option value="250">250 mL (Vancomycin / Diluted)</option>
                            <option value="500">500 mL (Moderate Volume)</option>
                            <option value="1000">1000 mL (1 Liter Continuous)</option>
                        </select>
                        <p className="text-[11px] text-gray-500 mt-1">Standard compatible 0.9% NS or D5W bag</p>
                    </div>

                    {/* Infusion Duration */}
                    <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                            Target Infusion Duration
                        </label>
                        <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-green-500">
                            <input
                                type="number"
                                step="5"
                                min="5"
                                value={infusionDurationMin}
                                onChange={(e) => setInfusionDurationMin(e.target.value)}
                                placeholder="e.g. 30"
                                className="w-full px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none pr-12"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                mins
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                            ≈ {(parseFloat(infusionDurationMin) / 60 || 0).toFixed(2)} hours
                        </p>
                    </div>
                </div>

                {/* Smart Pump Rate Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-200 text-center">
                        <span className="text-[11px] font-bold text-blue-900 uppercase">Total Infusion Volume</span>
                        <div className="text-xl font-black text-blue-950 mt-0.5">
                            {calculations.totalBagVolume.toFixed(1)}{" "}
                            <span className="text-xs font-normal text-blue-700">mL</span>
                        </div>
                        <span className="text-[10px] text-blue-700">Carrier + Drug Syringe</span>
                    </div>

                    <div className="rounded-xl bg-green-50 p-3.5 border border-green-200 text-center">
                        <span className="text-[11px] font-bold text-green-900 uppercase">Smart Pump Rate</span>
                        <div className="text-xl font-black text-green-950 mt-0.5">
                            {calculations.infusionRateMlHr.toFixed(1)}{" "}
                            <span className="text-xs font-bold text-green-700">mL / hr</span>
                        </div>
                        <span className="text-[10px] text-green-700">Volumetric setting</span>
                    </div>

                    <div className="rounded-xl bg-teal-50 p-3.5 border border-teal-200 text-center">
                        <span className="text-[11px] font-bold text-teal-900 uppercase">Final Bag Conc.</span>
                        <div className="text-xl font-black text-teal-950 mt-0.5">
                            {calculations.finalBagConc.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-teal-700">mg/mL</span>
                        </div>
                        <span className="text-[10px] text-teal-700">In carrier bag</span>
                    </div>
                </div>

                {/* Safety Warnings for Secondary Infusions */}
                {activePreset?.id.includes("vancomycin") && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold block mb-0.5">Vancomycin Infusion Safety Alert:</strong>
                            Concentration must not exceed 5 mg/mL (current: {calculations.finalBagConc.toFixed(2)} mg/mL). Infusion rate must not exceed 10 mg/min (current: {calculations.doseDeliveryRateMgMin.toFixed(1)} mg/min). Minimum 60 minutes required per 1000 mg.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── MASTER COMPONENT: RECONSTITUTION SUITE (DEFAULT EXPORT) ────────
export default function ReconstitutionCalculator() {
    // Navigation
    const [activeTab, setActiveTab] = useState<ActiveTab>("vial-reconstitution");

    // State Management
    const [selectedPresetId, setSelectedPresetId] = useState<string>("ceftriaxone-1g-iv");
    const [calcMode, setCalcMode] = useState<CalcMode>("doseToVol");

    // Parameters
    const [vialStrength, setVialStrength] = useState<string>("1000");
    const [vialStrengthUnit, setVialStrengthUnit] = useState<"mg" | "g">("mg");
    const [displacementVol, setDisplacementVol] = useState<string>("0.4");
    const [diluentAdded, setDiluentAdded] = useState<string>("9.6");
    const [targetConc, setTargetConc] = useState<string>("100");
    const [prescribedDose, setPrescribedDose] = useState<string>("750");
    const [prescribedDoseUnit, setPrescribedDoseUnit] = useState<"mg" | "g">("mg");
    const [withdrawalVol, setWithdrawalVol] = useState<string>("7.5");

    // Secondary Bag Dilution
    const [carrierBagVol, setCarrierBagVol] = useState<string>("100");
    const [infusionDurationMin, setInfusionDurationMin] = useState<string>("30");

    // UI States
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [copiedLabel, setCopiedLabel] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

    // Preset Selection
    const handleSelectPreset = useCallback((presetId: string) => {
        setSelectedPresetId(presetId);
        if (presetId === "custom") return;

        const preset = RECONSTITUTION_DATABASE.find((p) => p.id === presetId);
        if (preset) {
            setVialStrength(preset.vialStrengthMg.toString());
            setVialStrengthUnit("mg");
            setDisplacementVol(preset.displacementVolMl.toString());
            setDiluentAdded(preset.standardDiluentVolMl.toString());
            setTargetConc(preset.resultingConcMgMl.toString());

            const defaultDose = preset.vialStrengthMg === 1000 ? 750 : preset.vialStrengthMg;
            setPrescribedDose(defaultDose.toString());
            setPrescribedDoseUnit("mg");
        }
    }, []);

    const activePreset = useMemo(() => {
        return RECONSTITUTION_DATABASE.find((p) => p.id === selectedPresetId) || null;
    }, [selectedPresetId]);

    const filteredPresets = useMemo(() => {
        if (!searchFilter.trim()) return RECONSTITUTION_DATABASE;
        const q = searchFilter.toLowerCase();
        return RECONSTITUTION_DATABASE.filter(
            (p) =>
                p.drugName.toLowerCase().includes(q) ||
                p.brandName.toLowerCase().includes(q) ||
                p.route.toLowerCase().includes(q)
        );
    }, [searchFilter]);

    // Calculations Engine
    const calculations = useMemo(() => {
        const rawStrength = parseFloat(vialStrength) || 0;
        const totalVialMg = vialStrengthUnit === "g" ? rawStrength * 1000 : rawStrength;
        const powderDisplacement = parseFloat(displacementVol) || 0;

        let diluentVolume = parseFloat(diluentAdded) || 0;
        let finalConcMgMl = 0;
        let finalReconstitutedVol = 0;

        if (calcMode === "targetConc") {
            const desiredConc = parseFloat(targetConc) || 0;
            if (desiredConc > 0 && totalVialMg > 0) {
                finalReconstitutedVol = totalVialMg / desiredConc;
                diluentVolume = Math.max(0, finalReconstitutedVol - powderDisplacement);
                finalConcMgMl = desiredConc;
            }
        } else {
            finalReconstitutedVol = diluentVolume + powderDisplacement;
            if (finalReconstitutedVol > 0 && totalVialMg > 0) {
                finalConcMgMl = totalVialMg / finalReconstitutedVol;
            }
        }

        const rawPrescribedDose = parseFloat(prescribedDose) || 0;
        const doseMg = prescribedDoseUnit === "g" ? rawPrescribedDose * 1000 : rawPrescribedDose;

        let calculatedWithdrawalVol = 0;
        let calculatedDeliveredDoseMg = 0;

        if (finalConcMgMl > 0) {
            if (calcMode === "volToDose") {
                const volInput = parseFloat(withdrawalVol) || 0;
                calculatedWithdrawalVol = volInput;
                calculatedDeliveredDoseMg = volInput * finalConcMgMl;
            } else {
                calculatedWithdrawalVol = doseMg / finalConcMgMl;
                calculatedDeliveredDoseMg = doseMg;
            }
        }

        const carrierVol = parseFloat(carrierBagVol) || 0;
        const totalBagVolume = carrierVol + calculatedWithdrawalVol;
        const finalBagConc = totalBagVolume > 0 ? calculatedDeliveredDoseMg / totalBagVolume : 0;
        const infusionMin = parseFloat(infusionDurationMin) || 0;
        const infusionRateMlHr = infusionMin > 0 ? (totalBagVolume / infusionMin) * 60 : 0;
        const doseDeliveryRateMgMin = infusionMin > 0 ? calculatedDeliveredDoseMg / infusionMin : 0;
        const vialFractionUsed = finalReconstitutedVol > 0 ? (calculatedWithdrawalVol / finalReconstitutedVol) * 100 : 0;

        return {
            totalVialMg,
            powderDisplacement,
            diluentVolume,
            finalReconstitutedVol,
            finalConcMgMl,
            doseMg,
            calculatedWithdrawalVol,
            calculatedDeliveredDoseMg,
            totalBagVolume,
            finalBagConc,
            infusionRateMlHr,
            doseDeliveryRateMgMin,
            vialFractionUsed,
            isValid: totalVialMg > 0 && finalReconstitutedVol > 0 && finalConcMgMl > 0,
        };
    }, [
        vialStrength,
        vialStrengthUnit,
        displacementVol,
        diluentAdded,
        targetConc,
        prescribedDose,
        prescribedDoseUnit,
        withdrawalVol,
        calcMode,
        carrierBagVol,
        infusionDurationMin,
    ]);

    // Copy Compounding Record
    const handleCopyCompoundingLog = useCallback(() => {
        const drugLabel = activePreset ? `${activePreset.drugName} (${activePreset.brandName})` : "Parenteral Drug";
        const text = `=== STERILE COMPOUNDING & RECONSTITUTION RECORD ===
DRUG: ${drugLabel}
- Vial Strength: ${calculations.totalVialMg} mg
- Powder Displacement: ${calculations.powderDisplacement.toFixed(2)} mL
- Diluent to Add: ${calculations.diluentVolume.toFixed(2)} mL
- Total Reconstituted Yield: ${calculations.finalReconstitutedVol.toFixed(2)} mL
- Yield Concentration: ${calculations.finalConcMgMl.toFixed(2)} mg/mL

DOSE PREPARATION:
- Target Ordered Dose: ${calculations.calculatedDeliveredDoseMg.toFixed(1)} mg
- Volume to Withdraw: ${calculations.calculatedWithdrawalVol.toFixed(2)} mL (${calculations.vialFractionUsed.toFixed(1)}% of vial)

SECONDARY IV BAG DILUTION (IF APPLICABLE):
- Carrier Solution: ${carrierBagVol} mL (0.9% NS / D5W)
- Total IVPB Volume: ${calculations.totalBagVolume.toFixed(1)} mL
- Infusion Concentration: ${calculations.finalBagConc.toFixed(2)} mg/mL
- Infusion Duration: ${infusionDurationMin} min
- Smart Pump Rate: ${calculations.infusionRateMlHr.toFixed(1)} mL/hr (${calculations.doseDeliveryRateMgMin.toFixed(1)} mg/min)

STABILITY & STORAGE:
- Room Temp: ${activePreset?.stability.roomTemp || "Standard aseptic protocol"}
- Refrigerated: ${activePreset?.stability.refrigerated || "Standard aseptic protocol"}
- Clinical Notes: ${activePreset?.clinicalNotes || "Standard sterile technique"}
Generated: ${new Date().toLocaleString()}
===================================================`.trim();

        navigator.clipboard.writeText(text);
        setCopiedLabel(true);
        setTimeout(() => setCopiedLabel(false), 2400);
    }, [calculations, activePreset, carrierBagVol, infusionDurationMin]);

    // Reset
    const handleReset = () => {
        handleSelectPreset("ceftriaxone-1g-iv");
        setCalcMode("doseToVol");
        setCarrierBagVol("100");
        setInfusionDurationMin("30");
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <FlaskConical className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Parenteral Reconstitution & IV Dilution Suite
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> USP &lt;797&gt; Displacement Engine
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Powder displacement physics, syringe withdrawal volumes, and secondary IVPB smart pump rates
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

                {/* ─── STEP-BY-STEP DIRECTIONS / INSTRUCTIONS ─────────────────────── */}
                {showInstructions && (
                    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <span>Directions of Use & Sterile Compounding Steps</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Drug Preset or Custom</strong>
                                    Pick a monograph preset (e.g. Rocephin, Zosyn, Vancocin) to auto-fill exact powder displacement.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Primary Reconstitution (Module 1)</strong>
                                    Review required diluent volume, displacement-corrected yield, and calculate syringe withdrawal volume.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Secondary IVPB Dilution (Module 2)</strong>
                                    Switch to Module 2 to calculate carrier bag dilution, infusion concentration, and smart pump rate (mL/hr).
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PRESET SELECTOR & SEARCH BAR ─────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-md shadow-gray-200/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-blue-600" />
                            <h2 className="text-sm sm:text-base font-bold text-gray-900">
                                Parenteral Antibiotic Monographs
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search drug (e.g. Zosyn, Rocephin)..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-gray-900"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleReset}
                                title="Reset all fields"
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-gray-200"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Preset Buttons Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {filteredPresets.map((preset) => {
                            const isSelected = selectedPresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`p-2.5 rounded-xl text-left transition border ${isSelected
                                        ? "bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500"
                                        : "bg-gray-50/70 border-gray-200 hover:bg-blue-50/50 hover:border-blue-300"
                                        }`}
                                >
                                    <div className="font-bold text-xs text-gray-900 truncate">{preset.drugName}</div>
                                    <div className="text-[11px] text-gray-500 truncate">{preset.vialLabel}</div>
                                    <span className="mt-1 inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                                        {preset.route}
                                    </span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => setSelectedPresetId("custom")}
                            className={`p-2.5 rounded-xl text-left transition border ${selectedPresetId === "custom"
                                ? "bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500"
                                : "bg-gray-50/70 border-gray-200 hover:bg-blue-50/50 hover:border-blue-300"
                                }`}
                        >
                            <div className="font-bold text-xs text-gray-900">Custom Drug</div>
                            <div className="text-[11px] text-gray-500">Manual Entry</div>
                            <span className="mt-1 inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-200 text-gray-800">
                                Any Vial
                            </span>
                        </button>
                    </div>
                </div>

                {/* ─── MODULE SWITCHER TABS (TWO DEDICATED PARTS) ───────────────────── */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("vial-reconstitution")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === "vial-reconstitution"
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        <FlaskConical className="h-4 w-4" />
                        Module 1: Primary Vial Reconstitution
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("iv-bag-dilution")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${activeTab === "iv-bag-dilution"
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        <Gauge className="h-4 w-4" />
                        Module 2: Secondary IV Bag & Pump Rate
                    </button>
                </div>

                {/* ─── WORKBENCH GRID: 12 COLS ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: ACTIVE MODULE INPUTS (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        {activeTab === "vial-reconstitution" ? (
                            <VialReconstitutionModule
                                vialStrength={vialStrength}
                                setVialStrength={setVialStrength}
                                vialStrengthUnit={vialStrengthUnit}
                                setVialStrengthUnit={setVialStrengthUnit}
                                displacementVol={displacementVol}
                                setDisplacementVol={setDisplacementVol}
                                diluentAdded={diluentAdded}
                                setDiluentAdded={setDiluentAdded}
                                targetConc={targetConc}
                                setTargetConc={setTargetConc}
                                prescribedDose={prescribedDose}
                                setPrescribedDose={setPrescribedDose}
                                prescribedDoseUnit={prescribedDoseUnit}
                                setPrescribedDoseUnit={setPrescribedDoseUnit}
                                withdrawalVol={withdrawalVol}
                                setWithdrawalVol={setWithdrawalVol}
                                calcMode={calcMode}
                                setCalcMode={setCalcMode}
                                calculations={calculations}
                                activePreset={activePreset}
                            />
                        ) : (
                            <IVBagDilutionModule
                                carrierBagVol={carrierBagVol}
                                setCarrierBagVol={setCarrierBagVol}
                                infusionDurationMin={infusionDurationMin}
                                setInfusionDurationMin={setInfusionDurationMin}
                                calculations={calculations}
                                activePreset={activePreset}
                            />
                        )}
                    </div>

                    {/* RIGHT: COMPOUNDING HERO OUTPUT & AUDIT (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* RESULTS HERO CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Compounding Output
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyCompoundingLog}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30"
                                >
                                    {copiedLabel ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-green-300" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Log</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Main Highlight: Syringe Draw or Delivered Dose */}
                                <div className="rounded-xl bg-white/15 p-4 sm:p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                    <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                                        {calcMode === "volToDose" ? "Delivered Patient Dose" : "Syringe Volume to Withdraw"}
                                    </span>
                                    <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                                        {calcMode === "volToDose" ? (
                                            <>
                                                {calculations.calculatedDeliveredDoseMg.toFixed(1)}{" "}
                                                <span className="text-2xl font-bold text-green-200">mg</span>
                                            </>
                                        ) : (
                                            <>
                                                {calculations.calculatedWithdrawalVol.toFixed(2)}{" "}
                                                <span className="text-2xl font-bold text-green-200">mL</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                        {calcMode === "volToDose"
                                            ? `${calculations.calculatedWithdrawalVol.toFixed(2)} mL @ ${calculations.finalConcMgMl.toFixed(1)} mg/mL`
                                            : `Yields ${calculations.calculatedDeliveredDoseMg.toFixed(1)} mg (${calculations.vialFractionUsed.toFixed(1)}% of vial)`}
                                    </div>
                                </div>

                                {/* Primary Breakdown Metrics */}
                                <div className="grid grid-cols-2 gap-2.5 text-center text-xs">
                                    <div className="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                                        <span className="text-[10px] text-blue-100 font-medium block">Diluent to Add</span>
                                        <span className="text-base font-bold text-white mt-0.5 block">
                                            {calculations.diluentVolume.toFixed(2)} mL
                                        </span>
                                    </div>

                                    <div className="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                                        <span className="text-[10px] text-blue-100 font-medium block">Displacement</span>
                                        <span className="text-base font-bold text-white mt-0.5 block">
                                            +{calculations.powderDisplacement.toFixed(2)} mL
                                        </span>
                                    </div>

                                    <div className="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                                        <span className="text-[10px] text-blue-100 font-medium block">Total Vial Yield</span>
                                        <span className="text-base font-bold text-white mt-0.5 block">
                                            {calculations.finalReconstitutedVol.toFixed(2)} mL
                                        </span>
                                    </div>

                                    <div className="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                                        <span className="text-[10px] text-blue-100 font-medium block">Vial Concentration</span>
                                        <span className="text-base font-bold text-white mt-0.5 block">
                                            {calculations.finalConcMgMl.toFixed(1)} mg/mL
                                        </span>
                                    </div>
                                </div>

                                {/* Visual Fluid Displacement Bar */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[11px] text-blue-100">
                                        <span>Reconstitution Volume Composition:</span>
                                        <span className="font-semibold">{calculations.finalReconstitutedVol.toFixed(1)} mL Total</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden flex border border-white/20">
                                        <div
                                            style={{
                                                width: `${(calculations.diluentVolume / (calculations.finalReconstitutedVol || 1)) * 100}%`,
                                            }}
                                            className="bg-blue-300 h-full"
                                        />
                                        <div
                                            style={{
                                                width: `${(calculations.powderDisplacement / (calculations.finalReconstitutedVol || 1)) * 100}%`,
                                            }}
                                            className="bg-green-300 h-full"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-blue-100">
                                        <span>Diluent ({calculations.diluentVolume.toFixed(1)} mL)</span>
                                        <span>Powder Displacement ({calculations.powderDisplacement.toFixed(1)} mL)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MONOGRAPH & STABILITY DETAILS */}
                        {activePreset && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-bold text-sm text-gray-900">
                                            {activePreset.drugName} Monograph
                                        </h4>
                                    </div>
                                    <a
                                        href={activePreset.fdaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                    >
                                        DailyMed <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>

                                <div className="space-y-2 text-xs text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <Droplet className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-gray-900">Diluents: </strong>
                                            {activePreset.recommendedDiluents.join(", ")}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Thermometer className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-gray-900">Stability: </strong>
                                            RT: {activePreset.stability.roomTemp} | Ref: {activePreset.stability.refrigerated}
                                        </div>
                                    </div>

                                    {activePreset.clinicalNotes && (
                                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2 mt-1">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>{activePreset.clinicalNotes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MANDATORY USP <797> SAFETY NOTICE */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldAlert className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Sterile Compounding Requirement:</strong>
                                    Perform vial reconstitutions inside a certified ISO Class 5 Primary Engineering Control (PEC). Swab stoppers with sterile 70% IPA and verify all displacement values against specific generic lot package inserts.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical Parenteral Engineering:</strong> Compliant with USP &lt;797&gt; Pharmaceutical Compounding — Sterile Preparations and FDA Center for Drug Evaluation & Research (CDER) standards.
                    </p>
                    <p className="text-gray-400">
                        © 2024–2026 Advanced Parenteral Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}