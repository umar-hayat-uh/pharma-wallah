"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    Activity,
    AlertCircle,
    Droplet,
    Brain,
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
    Stethoscope,
    Pill,
    TrendingUp,
    Layers,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type AscitesGrade = "none" | "mild" | "moderate";
export type EncephalopathyGrade = "none" | "grade1-2" | "grade3-4";
export type BilirubinUnit = "mg/dL" | "umol/L";
export type AlbuminUnit = "g/dL" | "g/L";

export interface PatientPreset {
    label: string;
    tag: string;
    bili: string;
    biliUnit: BilirubinUnit;
    alb: string;
    albUnit: AlbuminUnit;
    inr: string;
    ascites: AscitesGrade;
    encephalopathy: EncephalopathyGrade;
    cholestatic: boolean;
    creatinine: string;
    sodium: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function ChildPughCalculator() {
    // Core Parameters
    const [bilirubin, setBilirubin] = useState<string>("1.4");
    const [biliUnit, setBiliUnit] = useState<BilirubinUnit>("mg/dL");
    const [albumin, setAlbumin] = useState<string>("3.6");
    const [albUnit, setAlbUnit] = useState<AlbuminUnit>("g/dL");
    const [inr, setInr] = useState<string>("1.2");
    const [ascites, setAscites] = useState<AscitesGrade>("none");
    const [encephalopathy, setEncephalopathy] = useState<EncephalopathyGrade>("none");

    // Advanced Options (Cholestatic & MELD-Na)
    const [isCholestatic, setIsCholestatic] = useState<boolean>(false);
    const [creatinine, setCreatinine] = useState<string>("1.0");
    const [sodium, setSodium] = useState<string>("138");
    const [enableMeld, setEnableMeld] = useState<boolean>(false);

    // UI States
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    // Patient Archetypes
    const samplePatients: PatientPreset[] = [
        { label: "Compensated (Class A)", tag: "5 pts, Good Prognosis", bili: "1.2", biliUnit: "mg/dL", alb: "4.0", albUnit: "g/dL", inr: "1.1", ascites: "none", encephalopathy: "none", cholestatic: false, creatinine: "0.9", sodium: "140" },
        { label: "Decompensated (Class B)", tag: "8 pts, Moderate Risk", bili: "2.4", biliUnit: "mg/dL", alb: "3.1", albUnit: "g/dL", inr: "1.8", ascites: "mild", encephalopathy: "grade1-2", cholestatic: false, creatinine: "1.3", sodium: "135" },
        { label: "Severe Cirrhosis (Class C)", tag: "13 pts, Poor Prognosis", bili: "5.6", biliUnit: "mg/dL", alb: "2.3", albUnit: "g/dL", inr: "2.6", ascites: "moderate", encephalopathy: "grade3-4", cholestatic: false, creatinine: "2.4", sodium: "128" },
        { label: "PBC / Cholestatic", tag: "Altered Bili Cutoffs", bili: "6.2", biliUnit: "mg/dL", alb: "3.4", albUnit: "g/dL", inr: "1.3", ascites: "none", encephalopathy: "none", cholestatic: true, creatinine: "1.0", sodium: "138" },
        { label: "Alcoholic Hepatitis", tag: "Class B, Encephalopathy", bili: "4.1", biliUnit: "mg/dL", alb: "2.9", albUnit: "g/dL", inr: "2.1", ascites: "mild", encephalopathy: "grade1-2", cholestatic: false, creatinine: "1.5", sodium: "133" },
    ];

    // Numeric Normalization
    const rawBili = parseFloat(bilirubin) || 0;
    const rawAlb = parseFloat(albumin) || 0;
    const rawInr = parseFloat(inr) || 0;
    const rawCr = parseFloat(creatinine) || 1.0;
    const rawNa = parseFloat(sodium) || 138;

    // Normalized Bilirubin in mg/dL
    const biliMgDl = useMemo(() => {
        if (biliUnit === "umol/L") return Math.round((rawBili / 17.1) * 10) / 10;
        return rawBili;
    }, [rawBili, biliUnit]);

    // Normalized Albumin in g/dL
    const albGDl = useMemo(() => {
        if (albUnit === "g/L") return Math.round((rawAlb / 10) * 10) / 10;
        return rawAlb;
    }, [rawAlb, albUnit]);

    // ─── CHILD-PUGH SCORING LOGIC ───────────────────────────────────────
    const calculations = useMemo(() => {
        if (biliMgDl <= 0 || albGDl <= 0 || rawInr <= 0) return null;

        let biliPoints = 1;
        if (isCholestatic) {
            // Primary Biliary Cholangitis / PSC Criteria
            if (biliMgDl < 4.0) biliPoints = 1;
            else if (biliMgDl <= 10.0) biliPoints = 2;
            else biliPoints = 3;
        } else {
            // Standard Cirrhosis Criteria
            if (biliMgDl < 2.0) biliPoints = 1;
            else if (biliMgDl <= 3.0) biliPoints = 2;
            else biliPoints = 3;
        }

        let albPoints = 1;
        if (albGDl > 3.5) albPoints = 1;
        else if (albGDl >= 2.8) albPoints = 2;
        else albPoints = 3;

        let inrPoints = 1;
        if (rawInr < 1.7) inrPoints = 1;
        else if (rawInr <= 2.2) inrPoints = 2;
        else inrPoints = 3;

        let ascitesPoints = 1;
        if (ascites === "none") ascitesPoints = 1;
        else if (ascites === "mild") ascitesPoints = 2;
        else ascitesPoints = 3;

        let encephPoints = 1;
        if (encephalopathy === "none") encephPoints = 1;
        else if (encephalopathy === "grade1-2") encephPoints = 2;
        else encephPoints = 3;

        const totalScore = biliPoints + albPoints + inrPoints + ascitesPoints + encephPoints;

        // Classification & Survival Stats
        let childClass = "A";
        let statusLabel = "Well-Compensated Cirrhosis";
        let oneYearSurvival = "100% 1-Year Survival";
        let twoYearSurvival = "85% 2-Year Survival";
        let surgicalRisk = "Low Perioperative Mortality (~10%)";
        let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
        let barColor = "bg-emerald-500";
        let dosingDirectives = "Standard hepatic dosing. Safe for most cardiovascular and metabolic therapies with routine monitoring.";

        if (totalScore <= 6) {
            childClass = "A";
            statusLabel = "Class A — Well Compensated";
            oneYearSurvival = "100% 1-Year Survival";
            twoYearSurvival = "85% 2-Year Survival";
            surgicalRisk = "Low Perioperative Mortality (~10%)";
            badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
            barColor = "bg-emerald-500";
            dosingDirectives = "Normal to mild hepatic compromise. Standard drug dosing. Monitor LFTs periodically.";
        } else if (totalScore <= 9) {
            childClass = "B";
            statusLabel = "Class B — Significant Functional Compromise";
            oneYearSurvival = "80% 1-Year Survival";
            twoYearSurvival = "60% 2-Year Survival";
            surgicalRisk = "Moderate Perioperative Mortality (~30%)";
            badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
            barColor = "bg-yellow-500";
            dosingDirectives = "Moderate hepatic impairment. Reduce dose by 25–50% for hepatically cleared drugs (e.g. DOACs, Statins, Beta-blockers). Avoid sedatives.";
        } else {
            childClass = "C";
            statusLabel = "Class C — Severe Decompensation";
            oneYearSurvival = "45% 1-Year Survival";
            twoYearSurvival = "35% 2-Year Survival";
            surgicalRisk = "High Perioperative Mortality (~75–80%)";
            badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
            barColor = "bg-rose-600";
            dosingDirectives = "Severe decompensated liver disease. Contraindicated for most DOACs, Statins, and hepatotoxins. Restrict Acetaminophen (≤ 2 g/day). Liver transplant evaluation indicated.";
        }

        // Optional MELD-Na Calculation (UNOS 2016 Refit)
        let meldNaScore: number | null = null;
        let meldMortality90d = "";

        if (enableMeld && rawCr > 0 && biliMgDl > 0 && rawInr > 0) {
            const crBound = Math.min(Math.max(rawCr, 1.0), 4.0);
            const biliBound = Math.max(biliMgDl, 1.0);
            const inrBound = Math.max(rawInr, 1.0);
            const naBound = Math.min(Math.max(rawNa, 125), 137);

            const meldInitial = 9.57 * Math.log(crBound) + 3.78 * Math.log(biliBound) + 11.2 * Math.log(inrBound) + 6.43;
            let finalMeld = Math.round(meldInitial);

            if (finalMeld > 11) {
                const meldNa = finalMeld + 1.32 * (137 - naBound) - 0.033 * finalMeld * (137 - naBound);
                finalMeld = Math.min(Math.max(Math.round(meldNa), 6), 40);
            }
            meldNaScore = finalMeld;

            if (finalMeld <= 9) meldMortality90d = "1.9% 90-Day Mortality";
            else if (finalMeld <= 19) meldMortality90d = "6.0% 90-Day Mortality";
            else if (finalMeld <= 29) meldMortality90d = "19.6% 90-Day Mortality";
            else if (finalMeld <= 39) meldMortality90d = "52.6% 90-Day Mortality";
            else meldMortality90d = "71.3% 90-Day Mortality";
        }

        return {
            totalScore,
            childClass,
            statusLabel,
            oneYearSurvival,
            twoYearSurvival,
            surgicalRisk,
            badgeColor,
            barColor,
            dosingDirectives,
            biliPoints,
            albPoints,
            inrPoints,
            ascitesPoints,
            encephPoints,
            meldNaScore,
            meldMortality90d,
        };
    }, [biliMgDl, albGDl, rawInr, ascites, encephalopathy, isCholestatic, enableMeld, rawCr, rawNa]);

    // Load Preset
    const handleLoadPreset = (p: PatientPreset) => {
        setBilirubin(p.bili);
        setBiliUnit(p.biliUnit);
        setAlbumin(p.alb);
        setAlbUnit(p.albUnit);
        setInr(p.inr);
        setAscites(p.ascites);
        setEncephalopathy(p.encephalopathy);
        setIsCholestatic(p.cholestatic);
        setCreatinine(p.creatinine);
        setSodium(p.sodium);
    };

    // Reset
    const handleReset = () => {
        setBilirubin("1.4");
        setBiliUnit("mg/dL");
        setAlbumin("3.6");
        setAlbUnit("g/dL");
        setInr("1.2");
        setAscites("none");
        setEncephalopathy("none");
        setIsCholestatic(false);
        setCreatinine("1.0");
        setSodium("138");
    };

    // Copy Consult Note
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL HEPATIC FUNCTION & CHILD-PUGH CONSULT ===
LABORATORY & CLINICAL PARAMETERS:
- Total Bilirubin: ${biliMgDl} mg/dL (${rawBili} ${biliUnit}) [${calculations.biliPoints} pt] ${isCholestatic ? "(PBC/PSC Cholestatic Criteria)" : ""}
- Serum Albumin: ${albGDl} g/dL (${rawAlb} ${albUnit}) [${calculations.albPoints} pt]
- International Normalized Ratio (INR): ${rawInr} [${calculations.inrPoints} pt]
- Ascites Status: ${ascites.toUpperCase()} [${calculations.ascitesPoints} pt]
- Hepatic Encephalopathy: ${encephalopathy === "none" ? "None (Grade 0)" : encephalopathy === "grade1-2" ? "Grade 1–2 (Mild Confusion / Asterixis)" : "Grade 3–4 (Stupor / Coma)"} [${calculations.encephPoints} pt]

CHILD-PUGH CLASSIFICATION & PROGNOSIS:
- TOTAL SCORE: ${calculations.totalScore} points (Class ${calculations.childClass})
- Clinical Status: ${calculations.statusLabel}
- Estimated 1-Year Survival: ${calculations.oneYearSurvival} (2-Year: ${calculations.twoYearSurvival})
- Perioperative Surgical Risk: ${calculations.surgicalRisk}
${calculations.meldNaScore !== null ? `- MELD-Na Score (UNOS 2016): ${calculations.meldNaScore} points (${calculations.meldMortality90d})` : ""}

HEPATIC DRUG DOSING & PHARMACOTHERAPY DIRECTIVE:
${calculations.dosingDirectives}

CLINICAL CAUTION:
- Avoid NSAIDs (risk of precipitating acute renal failure / Hepatorenal Syndrome and variceal bleeding).
- Max Acetaminophen dose: ≤ 2 grams/day in divided doses for Class A/B cirrhosis.
- Avoid Benzodiazepines / Opioids (risk of worsening Hepatic Encephalopathy).
Generated: ${new Date().toLocaleString()}`;

        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    }, [calculations, biliMgDl, rawBili, biliUnit, isCholestatic, albGDl, rawAlb, albUnit, rawInr, ascites, encephalopathy]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <Brain className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Child-Pugh Score & Hepatic Function Suite
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> Cirrhosis & Surgical Risk
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Assess severity of liver disease, 1-year mortality, surgical candidacy & MELD-Na score
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
                                <span>Hepatic Function Assessment & Child-Pugh Protocol</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Laboratory Values</strong>
                                    Input Bilirubin, Albumin, and INR. Toggle units (mg/dL or µmol/L) and PBC/PSC criteria if applicable.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Grade Ascites & Encephalopathy</strong>
                                    Select clinical findings for fluid retention (Ascites) and cognitive state (West Haven encephalopathy scale).
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Review Class & Dosing Guidance</strong>
                                    View Class A/B/C classification, perioperative surgical mortality risk, and export the clinical consult note.
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
                                onClick={() => handleLoadPreset(p)}
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

                    {/* LEFT: LAB INPUTS & CLINICAL SIGNS (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* CARD 1: LABORATORY PARAMETERS */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Droplet className="h-5 w-5 text-blue-600" />
                                    1. Laboratory Parameters
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
                                {/* Bilirubin & Albumin */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Total Bilirubin */}
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase">
                                                Total Bilirubin
                                            </label>
                                            <div className="inline-flex rounded bg-blue-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setBiliUnit("mg/dL")}
                                                    className={`px-1.5 py-0.5 rounded ${biliUnit === "mg/dL" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    mg/dL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setBiliUnit("umol/L")}
                                                    className={`px-1.5 py-0.5 rounded ${biliUnit === "umol/L" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                                >
                                                    µmol/L
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={bilirubin}
                                                onChange={(e) => setBilirubin(e.target.value)}
                                                placeholder="e.g. 1.4"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {biliUnit}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 block mt-1">
                                            {isCholestatic ? "< 4 (1pt), 4–10 (2pt), > 10 (3pt)" : "< 2 (1pt), 2–3 (2pt), > 3 (3pt)"}
                                        </span>
                                    </div>

                                    {/* Serum Albumin */}
                                    <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase">
                                                Serum Albumin
                                            </label>
                                            <div className="inline-flex rounded bg-green-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setAlbUnit("g/dL")}
                                                    className={`px-1.5 py-0.5 rounded ${albUnit === "g/dL" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                                                >
                                                    g/dL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAlbUnit("g/L")}
                                                    className={`px-1.5 py-0.5 rounded ${albUnit === "g/L" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                                                >
                                                    g/L
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={albumin}
                                                onChange={(e) => setAlbumin(e.target.value)}
                                                placeholder="e.g. 3.6"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-green-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {albUnit}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 block mt-1">
                                            &gt; 3.5 (1pt), 2.8–3.5 (2pt), &lt; 2.8 (3pt)
                                        </span>
                                    </div>
                                </div>

                                {/* INR Input */}
                                <div className="rounded-xl border border-purple-200/70 bg-purple-50/30 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-purple-950 uppercase">
                                            Prothrombin Time / INR
                                        </label>
                                        <span className="text-[10px] text-purple-700 font-semibold">Coagulation Status</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.05"
                                        min="0.5"
                                        value={inr}
                                        onChange={(e) => setInr(e.target.value)}
                                        placeholder="e.g. 1.2"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-purple-500"
                                    />
                                    <span className="text-[10px] text-gray-500 block mt-1">
                                        &lt; 1.7 (1pt), 1.7–2.2 (2pt), &gt; 2.2 (3pt)
                                    </span>
                                </div>

                                {/* Cholestatic PBC/PSC Checkbox */}
                                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="cholestaticToggle"
                                            checked={isCholestatic}
                                            onChange={(e) => setIsCholestatic(e.target.checked)}
                                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="cholestaticToggle" className="text-gray-800 font-semibold cursor-pointer">
                                            Primary Biliary Cholangitis (PBC) / PSC Bilirubin Criteria
                                        </label>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono">&lt;4, 4-10, &gt;10</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: CLINICAL FINDINGS (ASCITES & ENCEPHALOPATHY) */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Stethoscope className="h-5 w-5 text-emerald-600" />
                                2. Clinical Findings & Physical Signs
                            </h2>

                            <div className="space-y-4">
                                {/* Ascites Grade Selector */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Ascites Status
                                        </label>
                                        <span className="text-[10px] text-gray-400">Fluid overload</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                                        {[
                                            { id: "none", name: "None (1 pt)", sub: "No ascites" },
                                            { id: "mild", name: "Mild (2 pts)", sub: "Diuretic-responsive" },
                                            { id: "moderate", name: "Severe (3 pts)", sub: "Refractory / Tense" },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setAscites(item.id as AscitesGrade)}
                                                className={`p-2.5 rounded-xl border transition text-center flex flex-col items-center justify-center ${ascites === item.id
                                                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                                                        : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{item.name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{item.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hepatic Encephalopathy Selector */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase">
                                            Hepatic Encephalopathy (West Haven Criteria)
                                        </label>
                                        <span className="text-[10px] text-gray-400">Cognitive state</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                                        {[
                                            { id: "none", name: "None (1 pt)", sub: "Normal sensorium" },
                                            { id: "grade1-2", name: "Grade 1–2 (2 pts)", sub: "Mild confusion / Asterixis" },
                                            { id: "grade3-4", name: "Grade 3–4 (3 pts)", sub: "Stupor / Comatose" },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setEncephalopathy(item.id as EncephalopathyGrade)}
                                                className={`p-2.5 rounded-xl border transition text-center flex flex-col items-center justify-center ${encephalopathy === item.id
                                                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                                                        : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{item.name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{item.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Optional MELD-Na Calculator Accordion / Toggle */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                                            Optional: Calculate MELD-Na (UNOS 2016)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setEnableMeld(!enableMeld)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${enableMeld ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                                                }`}
                                        >
                                            {enableMeld ? "Enabled" : "Enable"}
                                        </button>
                                    </div>

                                    {enableMeld && (
                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                                    Serum Creatinine (mg/dL)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={creatinine}
                                                    onChange={(e) => setCreatinine(e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                                                    Serum Sodium (mEq/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={sodium}
                                                    onChange={(e) => setSodium(e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: HERO SCORE OUTPUT & CLINICAL DIRECTIVES (6 COLS) */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* HERO CHILD-PUGH CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Child-Pugh Classification
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
                                            {calculations.statusLabel}
                                        </span>
                                        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                                            Class {calculations.childClass}{" "}
                                            <span className="text-2xl font-bold text-green-200">({calculations.totalScore} pts)</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {calculations.oneYearSurvival} — {calculations.surgicalRisk}
                                        </div>
                                    </div>

                                    {/* MELD-Na Display if Enabled */}
                                    {calculations.meldNaScore !== null && (
                                        <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/15 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="text-green-200 font-bold block">UNOS MELD-Na Score:</span>
                                                <span className="text-[11px] text-blue-100">{calculations.meldMortality90d}</span>
                                            </div>
                                            <div className="text-2xl font-black text-white">
                                                {calculations.meldNaScore} <span className="text-xs font-normal text-blue-100">pts</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Survival & Surgical Statistics */}
                                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                                        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                                            <span className="text-blue-100 text-[10px] uppercase font-bold block">Survival Prognosis</span>
                                            <span className="text-sm font-bold text-white mt-0.5 block">{calculations.oneYearSurvival}</span>
                                            <span className="text-[10px] text-green-200 font-medium">{calculations.twoYearSurvival}</span>
                                        </div>

                                        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                                            <span className="text-blue-100 text-[10px] uppercase font-bold block">Surgical Candidacy</span>
                                            <span className="text-sm font-bold text-white mt-0.5 block">{calculations.surgicalRisk}</span>
                                            <span className="text-[10px] text-blue-200 font-medium">Perioperative Mortality</span>
                                        </div>
                                    </div>

                                    {/* Pharmacotherapy Directives */}
                                    <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 text-xs text-blue-100 space-y-1">
                                        <strong className="text-white block font-bold">Hepatic Drug Dosing Directive:</strong>
                                        <p className="leading-relaxed text-[11px]">{calculations.dosingDirectives}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Enter clinical parameters to compute score.</p>
                                </div>
                            )}
                        </div>

                        {/* VISUAL CHILD-PUGH CLASS GAUGE */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-700 flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        Severity Spectrum (5–15 Points)
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${calculations.badgeColor}`}>
                                        Class {calculations.childClass} ({calculations.totalScore} pts)
                                    </span>
                                </div>

                                <div className="relative pt-6 pb-2">
                                    {/* Gauge Track */}
                                    <div className="h-3.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-600 rounded-full w-full relative overflow-hidden" />

                                    {/* Marker Needle */}
                                    <div
                                        className="absolute top-1 transition-all duration-300 -translate-x-1/2"
                                        style={{
                                            left: `${Math.min(100, Math.max(0, ((calculations.totalScore - 5) / (15 - 5)) * 100))}%`,
                                        }}
                                    >
                                        <div className="bg-gray-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                            {calculations.totalScore} pts
                                        </div>
                                        <div className="w-0.5 h-3.5 bg-gray-900 mx-auto" />
                                    </div>

                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5 mt-1">
                                        <span>5 (Class A)</span>
                                        <span>7 (Class B)</span>
                                        <span>10 (Class C)</span>
                                        <span>15</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SCORING BREAKDOWN TABLE */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                                    Patient Scoring Breakdown (Points Awarded)
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                            <tr>
                                                <th className="py-2 px-3">Parameter</th>
                                                <th className="py-2 px-3">Patient Value</th>
                                                <th className="py-2 px-3">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-[11px]">
                                            <tr><td className="py-1.5 px-3 font-semibold">Total Bilirubin</td><td className="py-1.5 px-3">{biliMgDl} mg/dL</td><td className="py-1.5 px-3 font-bold text-blue-700">{calculations.biliPoints} pt</td></tr>
                                            <tr><td className="py-1.5 px-3 font-semibold">Serum Albumin</td><td className="py-1.5 px-3">{albGDl} g/dL</td><td className="py-1.5 px-3 font-bold text-blue-700">{calculations.albPoints} pt</td></tr>
                                            <tr><td className="py-1.5 px-3 font-semibold">INR</td><td className="py-1.5 px-3">{rawInr}</td><td className="py-1.5 px-3 font-bold text-blue-700">{calculations.inrPoints} pt</td></tr>
                                            <tr><td className="py-1.5 px-3 font-semibold">Ascites</td><td className="py-1.5 px-3 capitalize">{ascites}</td><td className="py-1.5 px-3 font-bold text-blue-700">{calculations.ascitesPoints} pt</td></tr>
                                            <tr><td className="py-1.5 px-3 font-semibold">Encephalopathy</td><td className="py-1.5 px-3 capitalize">{encephalopathy.replace("-", " ")}</td><td className="py-1.5 px-3 font-bold text-blue-700">{calculations.encephPoints} pt</td></tr>
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
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Hepatology Pharmacotherapy Advisory:</strong>
                                    In patients with cirrhosis (Class B and C), avoid NSAIDs due to severe risks of precipitating Hepatorenal Syndrome (HRS) and GI bleeding. Restrict Acetaminophen to &le; 2 g/day. Avoid Benzodiazepines and Opioids to prevent triggering severe Hepatic Encephalopathy.
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
                            Child-Pugh & MELD-Na Scoring Criteria & Evidence Reference
                        </span>
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showDetails && (
                        <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                            <div>
                                <strong className="text-gray-900 block mb-0.5">1. Child-Pugh Scoring System (Pugh RN et al. Br J Surg 1973):</strong>
                                <p className="text-gray-600">
                                    Evaluates 5 components: Bilirubin (&lt;2, 2–3, &gt;3 mg/dL), Albumin (&gt;3.5, 2.8–3.5, &lt;2.8 g/dL), INR (&lt;1.7, 1.7–2.2, &gt;2.2), Ascites (None, Mild, Moderate/Severe), and Encephalopathy (None, Grade 1–2, Grade 3–4).
                                </p>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">2. MELD-Na Equation (UNOS / OPTN 2016 Refit):</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    MELD(i) = 9.57 × ln(Cr) + 3.78 × ln(Bili) + 11.2 × ln(INR) + 6.43
                                    <br />
                                    If MELD(i) &gt; 11: MELD-Na = MELD(i) + 1.32 × (137 - Na) - [0.033 × MELD(i) × (137 - Na)]
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">3. Reference Citations:</strong>
                                <p className="text-gray-600">
                                    Pugh RN, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-649.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical Hepatology Advisory:</strong> Child-Pugh classification is designed for chronic liver disease prognosis and surgical risk assessment. For acute liver failure, liver transplant priority, or unstable patients, MELD-Na and clinical hepatology specialist review are recommended.
                    </p>
                    <p className="text-gray-400">
                        &copy; 2024–2026 Advanced Hepatic Function & Child-Pugh Clinical Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}