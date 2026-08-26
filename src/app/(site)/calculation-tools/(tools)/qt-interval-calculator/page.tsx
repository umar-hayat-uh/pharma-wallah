"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    Calculator,
    Activity,
    AlertCircle,
    Clock,
    TrendingUp,
    Info,
    BookOpen,
    RefreshCw,
    ShieldAlert,
    CheckCircle2,
    Copy,
    Check,
    SlidersHorizontal,
    ExternalLink,
    Zap,
    Stethoscope,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

// ─── TYPES & CREDIBLEMEDS DRUG DATABASE ─────────────────────────────

// Removed "export" from interface – local to this file only
interface QTDrug {
    name: string;
    brand: string;
    class: string;
    riskCategory: "Known Risk of TdP" | "Possible Risk" | "Conditional Risk";
    doseRecommendation: string;
    guidelineNotes: string;
    link?: string;
}

// Removed "export" from const – local to this file only
const commonQTDrugs: QTDrug[] = [
    {
        name: "Amiodarone",
        brand: "Cordarone / Pacerone",
        class: "Class III Antiarrhythmic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Reduce dose or discontinue if QTc > 500 ms or increases by > 60 ms over baseline.",
        guidelineNotes: "Directly blocks IKr channels; lower incidence of TdP than other class III agents due to concurrent calcium/beta blockade, but requires baseline and serial ECGs.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Sotalol",
        brand: "Betapace",
        class: "Class III Antiarrhythmic / Beta-Blocker",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Strict dose reduction in renal impairment. Discontinue if QTc exceeds 500 ms.",
        guidelineNotes: "Marked reverse use-dependence (highest TdP risk at slower heart rates / bradycardia). 100% renally eliminated.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Haloperidol",
        brand: "Haldol",
        class: "Typical Antipsychotic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "IV administration carries substantially higher risk than PO. Limit IV doses or switch to atypical agent if QTc > 480 ms.",
        guidelineNotes: "FDA boxed warning for IV administration. Continuous telemetry recommended during IV therapy.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Citalopram",
        brand: "Celexa",
        class: "SSRI Antidepressant",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Max 40 mg/day (Max 20 mg/day in age > 60 yr, hepatic impairment, or CYP2C19 poor metabolizers).",
        guidelineNotes: "FDA safety communication warns against doses > 40 mg/day due to dose-dependent QTc prolongation.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Azithromycin",
        brand: "Zithromax",
        class: "Macrolide Antibiotic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Avoid in patients with baseline prolonged QTc, hypokalemia, hypomagnesemia, or bradycardia.",
        guidelineNotes: "FDA warning regarding fatal cardiac arrhythmias; consider Doxycycline or beta-lactams as safer alternatives in high-risk patients.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Levofloxacin / Ciprofloxacin",
        brand: "Levaquin / Cipro",
        class: "Fluoroquinolone Antibacterial",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Dose-adjust for renal clearance. Avoid co-administration with other QT-prolonging agents.",
        guidelineNotes: "Moxifloxacin carries highest risk among quinolones; Levofloxacin is intermediate; Ciprofloxacin is lowest.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Ondansetron",
        brand: "Zofran",
        class: "5-HT3 Receptor Antagonist Antiemetic",
        riskCategory: "Possible Risk",
        doseRecommendation: "Max single IV dose is 16 mg. Avoid repeat doses in patients with baseline QTc > 480 ms.",
        guidelineNotes: "ECG monitoring recommended in patients with electrolyte abnormalities or heart failure.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Methadone",
        brand: "Dolophine / Methadose",
        class: "Opioid Agonist",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Perform baseline ECG. Obtain follow-up ECG if daily dose exceeds 100 mg/day or if risk factors present.",
        guidelineNotes: "Potent hERG channel blocker. Clinically significant QTc prolongation commonly observed at doses > 100-120 mg/day.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Fluconazole",
        brand: "Diflucan",
        class: "Triazole Antifungal",
        riskCategory: "Possible Risk",
        doseRecommendation: "Renally adjust. Monitor closely when co-administered with CYP3A4/CYP2C9 substrates.",
        guidelineNotes: "Dual mechanism: direct IKr channel block and CYP inhibition increasing systemic levels of other QT drugs.",
        link: "https://www.crediblemeds.org",
    },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function QTIntervalCalculator() {
    // Inputs
    const [qtInterval, setQTInterval] = useState<string>("430");
    const [rrInterval, setRRInterval] = useState<string>("857");
    const [heartRate, setHeartRate] = useState<string>("70");
    const [sex, setSex] = useState<"male" | "female">("male");
    const [qrsWidth, setQrsWidth] = useState<string>("90");
    const [hasBBB, setHasBBB] = useState<boolean>(false);
    const [baselineQTc, setBaselineQTc] = useState<string>("");

    // Active Formula Selection
    const [selectedFormula, setSelectedFormula] = useState<
        "fridericia" | "bazett" | "framingham" | "hodges"
    >("fridericia");

    // Drug Search
    const [drugSearch, setDrugSearch] = useState<string>("");

    // UI States
    const [copiedNote, setCopiedNote] = useState<boolean>(false);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [showTisdale, setShowTisdale] = useState<boolean>(false);

    // Tisdale Risk Checklist States (Validated score for hospitalized patients)
    const [tisdaleFactors, setTisdaleFactors] = useState({
        age68: false, // 1 pt
        female: false, // 1 pt
        loopDiuretic: false, // 1 pt
        hypokalemia: false, // 2 pts (K+ <= 3.5)
        baselineQTc450: false, // 2 pts (QTc >= 450)
        acuteMI: false, // 2 pts
        twoOrMoreQTDrugs: false, // 3 pts
        sepsis: false, // 3 pts
        heartFailure: false, // 3 pts
    });

    // Handle Synchronized Heart Rate and RR Interval inputs
    const handleHeartRateChange = (val: string) => {
        setHeartRate(val);
        const hr = parseFloat(val);
        if (hr > 0) {
            setRRInterval(Math.round(60000 / hr).toString());
        }
    };

    const handleRRIntervalChange = (val: string) => {
        setRRInterval(val);
        const rr = parseFloat(val);
        if (rr > 0) {
            setHeartRate(Math.round(60000 / rr).toString());
        }
    };

    // Calculate Tisdale Risk Score
    const tisdaleScore = useMemo(() => {
        let score = 0;
        if (tisdaleFactors.age68) score += 1;
        if (sex === "female" || tisdaleFactors.female) score += 1;
        if (tisdaleFactors.loopDiuretic) score += 1;
        if (tisdaleFactors.hypokalemia) score += 2;
        if (tisdaleFactors.baselineQTc450) score += 2;
        if (tisdaleFactors.acuteMI) score += 2;
        if (tisdaleFactors.twoOrMoreQTDrugs) score += 3;
        if (tisdaleFactors.sepsis) score += 3;
        if (tisdaleFactors.heartFailure) score += 3;
        return score;
    }, [tisdaleFactors, sex]);

    const tisdaleRiskLevel = useMemo(() => {
        if (tisdaleScore <= 6) {
            return { level: "Low Risk (≤6)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
        } else if (tisdaleScore <= 10) {
            return { level: "Moderate Risk (7–10)", color: "text-amber-700 bg-amber-50 border-amber-200" };
        } else {
            return { level: "High Risk (≥11)", color: "text-rose-700 bg-rose-50 border-rose-300 font-black" };
        }
    }, [tisdaleScore]);

    // ─── QTc CALCULATION ENGINE ───────────────────────────────────────
    const calculations = useMemo(() => {
        const rawQT = parseFloat(qtInterval) || 0;
        const hr = parseFloat(heartRate) || 0;
        const qrs = parseFloat(qrsWidth) || 90;

        if (rawQT <= 0 || hr <= 0) return null;

        const rrSec = 60 / hr;

        // QRS / Bundle Branch Block Adjustment:
        // When QRS > 120 ms, Bogossian formula: QT_adj = QT - 0.5 * (QRS - 100)
        let effectiveQT = rawQT;
        if (hasBBB || qrs > 120) {
            effectiveQT = Math.max(rawQT - 0.5 * (Math.max(qrs, 120) - 100), 200);
        }

        // 1. Bazett: QTc = QT / sqrt(RR)
        const qtcBazett = Math.round(effectiveQT / Math.sqrt(rrSec));

        // 2. Fridericia: QTc = QT / cbrt(RR) (AHA/FDA preferred for tachycardia/bradycardia)
        const qtcFridericia = Math.round(effectiveQT / Math.cbrt(rrSec));

        // 3. Framingham: QTc = QT + 0.154 * (1 - RR)
        const qtcFramingham = Math.round(effectiveQT + 154 * (1 - rrSec));

        // 4. Hodges: QTc = QT + 1.75 * (HR - 60)
        const qtcHodges = Math.round(effectiveQT + 1.75 * (hr - 60));

        // Selected formula result
        let activeQTc = qtcFridericia;
        if (selectedFormula === "bazett") activeQTc = qtcBazett;
        else if (selectedFormula === "framingham") activeQTc = qtcFramingham;
        else if (selectedFormula === "hodges") activeQTc = qtcHodges;

        // Delta QTc calculation if baseline is entered
        const numBaseline = parseFloat(baselineQTc);
        const deltaQTc = numBaseline > 0 ? activeQTc - numBaseline : null;

        // Sex-Specific Thresholds (AHA/ACCF/HRS Standards):
        // Male: Normal < 450, Borderline 450-470, Prolonged > 470, Critical >= 500
        // Female: Normal < 460, Borderline 460-480, Prolonged > 480, Critical >= 500
        const normalCutoff = sex === "male" ? 450 : 460;
        const borderlineCutoff = sex === "male" ? 470 : 480;

        let riskCategory: "normal" | "borderline" | "prolonged" | "critical" | "short" = "normal";
        let interpretation = "";
        let clinicalRisk = "";
        let actionRecommendation = "";
        let badgeColor = "";

        if (activeQTc < 340) {
            riskCategory = "short";
            interpretation = "Short QT Interval (< 340 ms)";
            clinicalRisk = "Risk of Short QT Syndrome (SQTS), atrial/ventricular fibrillation.";
            actionRecommendation = "Cardiology consult; review hypercalcemia, hyperkalemia, or digitalis toxicity.";
            badgeColor = "bg-purple-100 text-purple-800 border-purple-300";
        } else if (activeQTc < normalCutoff) {
            riskCategory = "normal";
            interpretation = `Normal QTc (< ${normalCutoff} ms for ${sex === "male" ? "Men" : "Women"})`;
            clinicalRisk = "Very low baseline risk for Torsades de Pointes.";
            actionRecommendation = "Standard monitoring. Safe to initiate monitored QT-active medications if clinically indicated.";
            badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
        } else if (activeQTc <= borderlineCutoff) {
            riskCategory = "borderline";
            interpretation = `Borderline QTc (${normalCutoff}–${borderlineCutoff} ms)`;
            clinicalRisk = "Moderate risk. Repolarization reserve is slightly impaired.";
            actionRecommendation = "Maintain serum K⁺ ≥ 4.0 mEq/L and Mg²⁺ ≥ 2.0 mg/dL. Re-evaluate baseline before starting second QT-prolonging agent.";
            badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
        } else if (activeQTc < 500) {
            riskCategory = "prolonged";
            interpretation = `Prolonged QTc (${borderlineCutoff}–499 ms)`;
            clinicalRisk = "High risk for polymorphic ventricular tachycardia / TdP.";
            actionRecommendation = "Avoid initiating new QT-prolonging agents. Reduce doses of non-essential QT agents by 50%. Check repeat ECG in 24–48 hours.";
            badgeColor = "bg-orange-100 text-orange-800 border-orange-300";
        } else {
            riskCategory = "critical";
            interpretation = "Critically Prolonged QTc (≥ 500 ms)";
            clinicalRisk = "CRITICAL / SEVERE RISK of Torsades de Pointes and Sudden Cardiac Arrest.";
            actionRecommendation = "URGENT ACTION: Discontinue non-essential QT-prolonging drugs. Place on continuous telemetry. Replete K⁺ ≥ 4.0 mEq/L and Mg²⁺ ≥ 2.0 mg/dL. Have IV Magnesium Sulfate (1–2 g) and Isoproterenol/pacing ready.";
            badgeColor = "bg-rose-100 text-rose-900 border-rose-300 font-black";
        }

        // Check for severe Delta QTc
        const deltaCritical = deltaQTc !== null && deltaQTc >= 60;

        return {
            effectiveQT,
            rawQT,
            qrs,
            rrSec,
            hr,
            qtcFridericia,
            qtcBazett,
            qtcFramingham,
            qtcHodges,
            activeQTc,
            deltaQTc,
            deltaCritical,
            normalCutoff,
            borderlineCutoff,
            riskCategory,
            interpretation,
            clinicalRisk,
            actionRecommendation,
            badgeColor,
        };
    }, [qtInterval, heartRate, qrsWidth, hasBBB, selectedFormula, sex, baselineQTc]);

    // ─── QTc vs HR DYNAMIC CHART DATA ─────────────────────────────────
    const chartData = useMemo(() => {
        const rawQT = parseFloat(qtInterval) || 400;
        const qrs = parseFloat(qrsWidth) || 90;
        let effQT = rawQT;
        if (hasBBB || qrs > 120) {
            effQT = Math.max(rawQT - 0.5 * (Math.max(qrs, 120) - 100), 200);
        }

        const data = [];
        for (let h = 40; h <= 130; h += 5) {
            const r = 60 / h;
            const baz = Math.round(effQT / Math.sqrt(r));
            const frid = Math.round(effQT / Math.cbrt(r));
            const fram = Math.round(effQT + 154 * (1 - r));
            data.push({
                hr: h,
                Bazett: baz,
                Fridericia: frid,
                Framingham: fram,
            });
        }
        return data;
    }, [qtInterval, qrsWidth, hasBBB]);

    // Filter CredibleMeds Drugs
    const filteredDrugs = useMemo(() => {
        if (!drugSearch.trim()) return commonQTDrugs;
        const q = drugSearch.toLowerCase();
        return commonQTDrugs.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.brand.toLowerCase().includes(q) ||
                d.class.toLowerCase().includes(q) ||
                d.riskCategory.toLowerCase().includes(q)
        );
    }, [drugSearch]);

    // Reset Form
    const handleReset = () => {
        setQTInterval("430");
        setHeartRate("70");
        setRRInterval("857");
        setQrsWidth("90");
        setHasBBB(false);
        setBaselineQTc("");
        setSex("male");
        setSelectedFormula("fridericia");
    };

    // Copy Clinical SBAR Note
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const noteText = `=== CLINICAL ECG CONSULT: QTc & TORSADES (TdP) RISK ===
PATIENT PARAMETERS:
- Biological Sex: ${sex.toUpperCase()} | Heart Rate: ${calculations.hr} bpm (RR: ${Math.round(calculations.rrSec * 1000)} ms)
- Measured QT Interval: ${calculations.rawQT} ms | QRS Duration: ${calculations.qrs} ms ${hasBBB ? "(BBB Corrected)" : ""}
- Effective QT Used: ${calculations.effectiveQT} ms
${calculations.deltaQTc !== null ? `- Baseline QTc: ${baselineQTc} ms | Δ QTc Increase: +${calculations.deltaQTc} ms ${calculations.deltaCritical ? "(CRITICAL Δ ≥ 60 ms)" : ""}` : ""}

FORMULA COMPARISON:
- Fridericia (AHA/FDA Standard): ${calculations.qtcFridericia} ms
- Bazett (Historical): ${calculations.qtcBazett} ms
- Framingham (Linear): ${calculations.qtcFramingham} ms
- Hodges: ${calculations.qtcHodges} ms
* Active Displayed Formula: ${selectedFormula.toUpperCase()} (${calculations.activeQTc} ms)

CLINICAL INTERPRETATION (AHA/ACCF/HRS Thresholds):
- Status: ${calculations.interpretation}
- TdP Risk Level: ${calculations.clinicalRisk}
- Tisdale Hospital Risk Score: ${tisdaleScore} (${tisdaleRiskLevel.level})

RECOMMENDED ACTION PROTOCOL:
- ${calculations.actionRecommendation}
- Target Serum Electrolytes: Potassium (K⁺) ≥ 4.0 mEq/L, Magnesium (Mg²⁺) ≥ 2.0 mg/dL (1.0 mmol/L)

REFERENCES:
- CredibleMeds.org (AZCERT Consensus) & AHA/ACCF/HRS Scientific Statement on TdP Prevention in Hospital Settings.
- Disclaimer: Clinical decision support tool. Confirm with 12-lead ECG tracing & cardiologist consultation.`;

        navigator.clipboard.writeText(noteText);
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 3000);
    }, [
        calculations,
        sex,
        hasBBB,
        baselineQTc,
        selectedFormula,
        tisdaleScore,
        tisdaleRiskLevel,
    ]);

    return (
        <section className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ─── PHARMAWALLAH BRANDED HEADER ───────────────────────────── */}
                <header className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    {/* Top PharmaWallah Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                                <Heart className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                                AHA / ACCF / HRS & CredibleMeds Guidelines
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                QT Interval & TdP Risk Calculator
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                                Multi-formula rate correction (Fridericia, Bazett, Framingham, Hodges) with sex-specific
                                thresholds, bundle branch block adjustments, Tisdale risk stratification, and CredibleMeds drug precautions.
                            </p>
                        </div>

                        {/* Top quick badges */}
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>AHA Preferred: Fridericia (∛RR)</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Critical Danger: QTc ≥ 500 ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Prominent Clinical Notice */}
                    <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold text-amber-950 block sm:inline mr-1">
                                Clinical Advisory on Formula Selection:
                            </strong>
                            Bazett's formula significantly overcorrects at heart rates &gt; 80 bpm (generating false positives for prolonged QT)
                            and undercorrects at heart rates &lt; 60 bpm. The AHA/ACC and FDA strongly recommend{" "}
                            <strong className="text-blue-700 underline">Fridericia (QT / ∛RR)</strong> for primary clinical decision making.
                        </div>
                    </div>
                </header>

                {/* ─── MAIN TWO-COLUMN WORKSPACE ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: ECG PARAMETERS & RISK CHECKLIST (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* ECG Measurements Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-blue-600" />
                                    1. ECG Parameters
                                </h2>
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Sex Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Biological Sex (Affects Normal Cutoffs)
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setSex("male")}
                                            className={`py-2 text-xs font-bold rounded-lg transition ${sex === "male"
                                                ? "bg-white text-blue-700 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            Male (Cutoff: 450 ms)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSex("female")}
                                            className={`py-2 text-xs font-bold rounded-lg transition ${sex === "female"
                                                ? "bg-white text-blue-700 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            Female (Cutoff: 460 ms)
                                        </button>
                                    </div>
                                </div>

                                {/* QT Interval & Heart Rate */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            QT Interval (ms)
                                        </label>
                                        <input
                                            type="number"
                                            value={qtInterval}
                                            onChange={(e) => setQTInterval(e.target.value)}
                                            placeholder="e.g. 430"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Heart Rate (bpm)
                                        </label>
                                        <input
                                            type="number"
                                            value={heartRate}
                                            onChange={(e) => handleHeartRateChange(e.target.value)}
                                            placeholder="e.g. 70"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* RR Interval & Baseline QTc */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            RR Interval (ms)
                                        </label>
                                        <input
                                            type="number"
                                            value={rrInterval}
                                            onChange={(e) => handleRRIntervalChange(e.target.value)}
                                            placeholder="e.g. 857"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Baseline QTc (ms, Optional)
                                        </label>
                                        <input
                                            type="number"
                                            value={baselineQTc}
                                            onChange={(e) => setBaselineQTc(e.target.value)}
                                            placeholder="e.g. 410"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* Bundle Branch Block / Wide QRS Adjustment */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="bbbToggle"
                                                checked={hasBBB}
                                                onChange={(e) => setHasBBB(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                                            />
                                            <label htmlFor="bbbToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                                                Bundle Branch Block / Wide QRS (&gt; 120 ms)
                                            </label>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                                            Bogossian Adj
                                        </span>
                                    </div>

                                    {hasBBB && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="space-y-2 pt-1 border-t border-slate-200"
                                        >
                                            <label className="block text-[11px] font-semibold text-slate-600">
                                                Measured QRS Duration (ms):
                                            </label>
                                            <input
                                                type="number"
                                                value={qrsWidth}
                                                onChange={(e) => setQrsWidth(e.target.value)}
                                                placeholder="e.g. 140"
                                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-[11px] text-slate-500 leading-snug">
                                                Adjusted QT = QT − 0.5 × (QRS − 100) to isolate ventricular repolarization (JT interval) from bundle branch conduction delay.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Active Formula Selector */}
                                <div className="space-y-1.5 pt-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                        Primary Displayed Correction Formula
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                        {(
                                            [
                                                { key: "fridericia", label: "Fridericia" },
                                                { key: "bazett", label: "Bazett" },
                                                { key: "framingham", label: "Framingham" },
                                                { key: "hodges", label: "Hodges" },
                                            ] as const
                                        ).map((f) => (
                                            <button
                                                key={f.key}
                                                type="button"
                                                onClick={() => setSelectedFormula(f.key)}
                                                className={`py-2 rounded-lg font-bold transition ${selectedFormula === f.key
                                                    ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tisdale Risk Score Checklist for Hospitalized Patients */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        Tisdale QT Risk Score
                                    </h2>
                                    <span className="text-xs text-slate-500">Validated TdP Risk Stratification</span>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tisdaleRiskLevel.color}`}>
                                    Score: {tisdaleScore} ({tisdaleRiskLevel.level})
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowTisdale(!showTisdale)}
                                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                <span>{showTisdale ? "Hide Risk Factor Checklist" : "Show Clinical Risk Factors (+ Checklist)"}</span>
                                {showTisdale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <AnimatePresence>
                                {showTisdale && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100"
                                    >
                                        {[
                                            { key: "age68", label: "Age ≥ 68 years (+1 pt)" },
                                            { key: "loopDiuretic", label: "Loop Diuretic Therapy (Furosemide, etc.) (+1 pt)" },
                                            { key: "hypokalemia", label: "Serum Potassium ≤ 3.5 mEq/L (+2 pts)" },
                                            { key: "baselineQTc450", label: "Admission Baseline QTc ≥ 450 ms (+2 pts)" },
                                            { key: "acuteMI", label: "Acute Myocardial Infarction (+2 pts)" },
                                            { key: "heartFailure", label: "Heart Failure with reduced EF (+3 pts)" },
                                            { key: "sepsis", label: "Severe Sepsis / Septic Shock (+3 pts)" },
                                            { key: "twoOrMoreQTDrugs", label: "Taking ≥ 2 QT-prolonging Medications (+3 pts)" },
                                        ].map((item) => (
                                            <label
                                                key={item.key}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={(tisdaleFactors as any)[item.key]}
                                                    onChange={(e) =>
                                                        setTisdaleFactors({
                                                            ...tisdaleFactors,
                                                            [item.key]: e.target.checked,
                                                        })
                                                    }
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                                                />
                                                <span className="font-medium">{item.label}</span>
                                            </label>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREDICTION, MULTI-FORMULA MATRIX & RECOMMENDATIONS (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Primary Results Hero Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        Rate-Corrected Electrocardiographic Analysis
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        QTc Forecast & Arrhythmia Risk
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCopyConsultNote}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-bold transition shadow-sm self-start sm:self-center"
                                >
                                    {copiedNote ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Note Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy Consult Note</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {calculations ? (
                                <div className="space-y-6">
                                    {/* Big Metric Display */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block">
                                                QTc ({selectedFormula.toUpperCase()})
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {calculations.activeQTc}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">ms</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                Normal: &lt; {calculations.normalCutoff} ms
                                            </span>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">
                                                Fridericia (∛RR)
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {calculations.qtcFridericia}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">ms</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                AHA Gold Standard
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                                                Bazett (√RR)
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {calculations.qtcBazett}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">ms</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                {calculations.hr > 80 ? "⚠️ Overcorrects" : "Standard"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delta QTc Indicator */}
                                    {calculations.deltaQTc !== null && (
                                        <div
                                            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${calculations.deltaCritical
                                                ? "bg-rose-50 border-rose-300 text-rose-900"
                                                : "bg-blue-50 border-blue-200 text-blue-900"
                                                }`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <TrendingUp className="w-4 h-4" /> Delta QTc Increase from Baseline:
                                            </span>
                                            <span className="text-sm font-black">
                                                +{calculations.deltaQTc} ms{" "}
                                                {calculations.deltaCritical && "(CRITICAL INCREASE ≥ 60 ms)"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Actionable Clinical Recommendation Box */}
                                    <div
                                        className={`p-5 rounded-2xl border flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed ${calculations.riskCategory === "critical" || calculations.deltaCritical
                                            ? "bg-rose-50 border-rose-300 text-rose-950"
                                            : calculations.riskCategory === "prolonged"
                                                ? "bg-orange-50 border-orange-300 text-orange-950"
                                                : calculations.riskCategory === "borderline"
                                                    ? "bg-amber-50 border-amber-300 text-amber-950"
                                                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                                            }`}
                                    >
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-extrabold text-sm uppercase">
                                                    {calculations.interpretation}
                                                </span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${calculations.badgeColor}`}>
                                                    {calculations.riskCategory.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="font-medium text-slate-800">{calculations.clinicalRisk}</p>
                                            <div className="pt-1.5 border-t border-slate-200/60 font-semibold">
                                                <strong>Protocol Directive:</strong> {calculations.actionRecommendation}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Multi-Formula Comparison Matrix Table */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                                            Simultaneous Formula Comparison
                                        </h4>
                                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                                                    <tr>
                                                        <th className="py-2.5 px-3">Formula</th>
                                                        <th className="py-2.5 px-3">Equation</th>
                                                        <th className="py-2.5 px-3">Calculated QTc</th>
                                                        <th className="py-2.5 px-3">Clinical Evaluation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    <tr className={selectedFormula === "fridericia" ? "bg-blue-50/70 font-bold" : ""}>
                                                        <td className="py-2.5 px-3 text-blue-700 font-bold">Fridericia (Gold Standard)</td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">QT / ∛RR</td>
                                                        <td className="py-2.5 px-3 font-black text-slate-900">{calculations.qtcFridericia} ms</td>
                                                        <td className="py-2.5 px-3 text-slate-600">Preferred by AHA/FDA across all heart rates</td>
                                                    </tr>
                                                    <tr className={selectedFormula === "bazett" ? "bg-blue-50/70 font-bold" : ""}>
                                                        <td className="py-2.5 px-3 text-blue-700 font-bold">Bazett</td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">QT / √RR</td>
                                                        <td className="py-2.5 px-3 font-black text-slate-900">{calculations.qtcBazett} ms</td>
                                                        <td className="py-2.5 px-3 text-slate-600">Historical; overestimates in tachycardia</td>
                                                    </tr>
                                                    <tr className={selectedFormula === "framingham" ? "bg-blue-50/70 font-bold" : ""}>
                                                        <td className="py-2.5 px-3 text-blue-700 font-bold">Framingham (Linear)</td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">QT + 154(1−RR)</td>
                                                        <td className="py-2.5 px-3 font-black text-slate-900">{calculations.qtcFramingham} ms</td>
                                                        <td className="py-2.5 px-3 text-slate-600">Robust linear population regression</td>
                                                    </tr>
                                                    <tr className={selectedFormula === "hodges" ? "bg-blue-50/70 font-bold" : ""}>
                                                        <td className="py-2.5 px-3 text-blue-700 font-bold">Hodges</td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px]">QT + 1.75(HR−60)</td>
                                                        <td className="py-2.5 px-3 font-black text-slate-900">{calculations.qtcHodges} ms</td>
                                                        <td className="py-2.5 px-3 text-slate-600">Alternative linear model</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Interactive QTc vs Heart Rate Curve */}
                                    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                                QTc Trajectory Across Heart Rates (40–130 bpm)
                                            </h4>
                                            <span className="text-[10px] text-slate-500">Red Line: 500 ms Hazard</span>
                                        </div>

                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                    <XAxis
                                                        dataKey="hr"
                                                        fontSize={11}
                                                        tickLine={false}
                                                        label={{
                                                            value: "Heart Rate (bpm)",
                                                            position: "insideBottom",
                                                            offset: -12,
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <YAxis
                                                        fontSize={11}
                                                        domain={["auto", "auto"]}
                                                        tickLine={false}
                                                        label={{
                                                            value: "QTc (ms)",
                                                            angle: -90,
                                                            position: "insideLeft",
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Tooltip
                                                        formatter={(value: any) => [`${value} ms`]}
                                                        contentStyle={{
                                                            backgroundColor: "#ffffff",
                                                            borderRadius: "12px",
                                                            border: "1px solid #cbd5e1",
                                                            fontSize: "12px",
                                                        }}
                                                    />
                                                    <ReferenceLine y={500} stroke="#e11d48" strokeDasharray="4 4" strokeWidth={2} label={{ value: "500 ms (Critical)", fill: "#e11d48", fontSize: 10 }} />
                                                    <ReferenceLine y={calculations.normalCutoff} stroke="#059669" strokeDasharray="3 3" label={{ value: `Normal (${calculations.normalCutoff} ms)`, fill: "#059669", fontSize: 10 }} />
                                                    <Line type="monotone" dataKey="Fridericia" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Fridericia (Recommended)" />
                                                    <Line type="monotone" dataKey="Bazett" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Bazett" />
                                                    <Line type="monotone" dataKey="Framingham" stroke="#10b981" strokeWidth={1.5} dot={false} name="Framingham" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Enter valid QT interval and Heart Rate on the left to calculate rate-corrected intervals.
                                </div>
                            )}
                        </div>

                        {/* CredibleMeds High-Yield QT Prolonging Drugs Database */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        CredibleMeds QT Drug Precautions
                                    </h3>
                                    <span className="text-xs text-slate-500">Known & Possible Torsades de Pointes (TdP) Risk</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter medications..."
                                    value={drugSearch}
                                    onChange={(e) => setDrugSearch(e.target.value)}
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {filteredDrugs.map((drug, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <div className="flex items-center gap-2">
                                                <strong className="text-sm font-bold text-slate-900">{drug.name}</strong>
                                                <span className="text-[11px] text-slate-500 font-medium">({drug.brand})</span>
                                            </div>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${drug.riskCategory === "Known Risk of TdP"
                                                    ? "bg-rose-100 text-rose-800 border-rose-300"
                                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                                    }`}
                                            >
                                                {drug.riskCategory}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 font-semibold">
                                            <span className="text-blue-700">Dosing Guidance:</span> {drug.doseRecommendation}
                                        </p>
                                        <p className="text-slate-500 text-[11px] leading-relaxed">{drug.guidelineNotes}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expandable Official References & Guidelines */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowDetails(!showDetails)}
                                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    Clinical References & AHA / ACCF / HRS Consensus
                                </span>
                                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100 overflow-hidden leading-relaxed"
                                    >
                                        <p>
                                            <strong>1. Drew BJ et al.</strong> Prevention of Torsades de Pointes in Hospital Settings: A Scientific Statement From the American Heart Association and the American College of Cardiology Foundation. <em>Circulation</em>. 2010;121(8):1047-1060.
                                        </p>
                                        <p>
                                            <strong>2. Tisdale JE et al.</strong> Development and validation of a risk score for QT interval prolongation in hospitalized patients. <em>Circ Cardiovasc Qual Outcomes</em>. 2013;6(4):479-487.
                                        </p>
                                        <p>
                                            <strong>3. Bogossian H et al.</strong> QTc evaluation in patients with bundle branch block. <em>Ann Noninvasive Electrocardiol</em>. 2014;19(6):568-575.
                                        </p>
                                        <div className="pt-2">
                                            <a
                                                href="https://www.crediblemeds.org"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                            >
                                                Official CredibleMeds Drug Database <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ─── FOOTER & REGULATORY DISCLOSURES ───────────────────────── */}
                <footer className="border-t border-slate-200 pt-6 pb-10 text-center text-xs text-slate-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical ECG Advisory:</strong> Automated QTc measurements should be verified manually via the tangent method
                        in Lead II or V5. Always review serum potassium  and magnesium
                        before escalating therapy in patients with borderline or prolonged repolarization intervals.
                    </p>
                    <p className="text-slate-400">
                        © 2024–2026 Advanced QT/QTc Decision Support. PharmaWallah Gradient Edition.
                    </p>
                </footer>
            </div>
        </section>
    );
}