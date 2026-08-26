"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Calculator,
    Info,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    ShieldAlert,
    Activity,
    RotateCcw,
    Sparkles,
    FlaskConical,
    Baby,
    User,
    Scale,
    Gauge,
    ChevronDown,
    ChevronUp,
    XCircle,
    BookOpen,
    HeartPulse,
    ArrowRightLeft,
} from "lucide-react";

// ─── TYPES & INTERFACES ─────────────────────────────────────────────

// Removed "export" from type
type PatientPopulation = "adult" | "pediatric";

// Removed "export" from interface
interface MacroSource {
    id: string;
    label: string;
    concentrationPct: number; // e.g. 10 for "10%"
    kcalPerGram: number;
    proteinFraction?: number; // for amino acids, g N per g AA (used for nitrogen calc)
}

// Removed "export" from interface
interface ElectrolyteAdditive {
    id: string;
    label: string;
    unit: "mEq" | "mmol" | "units";
    amount: string;
    perKg: boolean; // whether the entered amount is per-kg-per-day
}

// ─── MACRONUTRIENT SOURCE DATABASE ──────────────────────────────────

// Removed "export" from const
const AMINO_ACID_SOURCES: MacroSource[] = [
    { id: "aa-10", label: "Amino Acids 10%", concentrationPct: 10, kcalPerGram: 4, proteinFraction: 0.16 },
    { id: "aa-15", label: "Amino Acids 15%", concentrationPct: 15, kcalPerGram: 4, proteinFraction: 0.16 },
    { id: "aa-8.5", label: "Amino Acids 8.5%", concentrationPct: 8.5, kcalPerGram: 4, proteinFraction: 0.16 },
];

// Removed "export" from const
const DEXTROSE_SOURCES: MacroSource[] = [
    { id: "dex-50", label: "Dextrose 50%", concentrationPct: 50, kcalPerGram: 3.4 },
    { id: "dex-70", label: "Dextrose 70%", concentrationPct: 70, kcalPerGram: 3.4 },
    { id: "dex-20", label: "Dextrose 20%", concentrationPct: 20, kcalPerGram: 3.4 },
];

// Removed "export" from const
const LIPID_SOURCES: MacroSource[] = [
    { id: "lip-20", label: "Lipid Emulsion 20%", concentrationPct: 20, kcalPerGram: 10 },
    { id: "lip-30", label: "Lipid Emulsion 30%", concentrationPct: 30, kcalPerGram: 10 },
    { id: "lip-10", label: "Lipid Emulsion 10%", concentrationPct: 10, kcalPerGram: 9 },
];

// ─── ELECTROLYTE DEFAULT RANGES (ASPEN-referenced, adult maintenance) ─
// Removed "export" from interface
interface ElectrolyteDef {
    id: string;
    label: string;
    unit: "mEq" | "mmol";
    adultRangePerDay: string;
    pedRangePerKgDay: string;
    mOsmPerUnit: number; // approximate osmotic contribution per mEq or mmol added to solution
}

// Removed "export" from const
const ELECTROLYTE_DEFS: ElectrolyteDef[] = [
    { id: "sodium", label: "Sodium (as NaCl/NaAc)", unit: "mEq", adultRangePerDay: "1–2 mEq/kg/day", pedRangePerKgDay: "2–5 mEq/kg/day", mOsmPerUnit: 2 },
    { id: "potassium", label: "Potassium (as KCl/KPhos)", unit: "mEq", adultRangePerDay: "1–2 mEq/kg/day", pedRangePerKgDay: "2–4 mEq/kg/day", mOsmPerUnit: 2 },
    { id: "calcium", label: "Calcium Gluconate", unit: "mEq", adultRangePerDay: "10–15 mEq/day", pedRangePerKgDay: "0.5–4 mEq/kg/day", mOsmPerUnit: 1.4 },
    { id: "magnesium", label: "Magnesium Sulfate", unit: "mEq", adultRangePerDay: "8–20 mEq/day", pedRangePerKgDay: "0.3–0.5 mEq/kg/day", mOsmPerUnit: 1 },
    { id: "phosphate", label: "Phosphate (as KPhos/NaPhos)", unit: "mmol", adultRangePerDay: "20–40 mmol/day", pedRangePerKgDay: "0.5–2 mmol/kg/day", mOsmPerUnit: 2 },
];

export default function TPNCalculator() {
    // ─── PATIENT PARAMETERS ─────────────────────────────────────────
    const [population, setPopulation] = useState<PatientPopulation>("adult");
    const [weightKg, setWeightKg] = useState<string>("70");
    const [totalFluidMlKg, setTotalFluidMlKg] = useState<string>("30");
    const [totalFluidOverrideMl, setTotalFluidOverrideMl] = useState<string>("");
    const [useFluidOverride, setUseFluidOverride] = useState<boolean>(false);

    // ─── MACRONUTRIENT TARGETS ───────────────────────────────────────
    const [proteinGKgDay, setProteinGKgDay] = useState<string>("1.2");
    const [aaSourceId, setAaSourceId] = useState<string>("aa-10");

    const [dextroseGKgDay, setDextroseGKgDay] = useState<string>("3");
    const [dexSourceId, setDexSourceId] = useState<string>("dex-70");

    const [lipidGKgDay, setLipidGKgDay] = useState<string>("1");
    const [lipSourceId, setLipSourceId] = useState<string>("lip-20");

    // ─── LINE TYPE (for osmolarity check) ───────────────────────────
    const [lineType, setLineType] = useState<"central" | "peripheral">("central");

    // ─── ELECTROLYTES (amounts entered as totals for the day) ───────
    const [electrolyteAmounts, setElectrolyteAmounts] = useState<Record<string, string>>({
        sodium: "100",
        potassium: "80",
        calcium: "10",
        magnesium: "12",
        phosphate: "20",
    });

    // ─── ADDITIVES ────────────────────────────────────────────────────
    const [insulinUnits, setInsulinUnits] = useState<string>("0");
    const [heparinUnits, setHeparinUnits] = useState<string>("0");
    const [mviMl, setMviMl] = useState<string>("10");
    const [traceElementsMl, setTraceElementsMl] = useState<string>("1");

    // ─── UI STATE ─────────────────────────────────────────────────────
    const [copiedLabel, setCopiedLabel] = useState<boolean>(false);
    const [showFormulas, setShowFormulas] = useState<boolean>(false);
    const [showAspenGuide, setShowAspenGuide] = useState<boolean>(false);
    const [showTpnIntro, setShowTpnIntro] = useState<boolean>(true);

    // ─── RESET TO DEFAULTS ───────────────────────────────────────────
    const handleReset = () => {
        setPopulation("adult");
        setWeightKg("70");
        setTotalFluidMlKg("30");
        setUseFluidOverride(false);
        setTotalFluidOverrideMl("");
        setProteinGKgDay("1.2");
        setAaSourceId("aa-10");
        setDextroseGKgDay("3");
        setDexSourceId("dex-70");
        setLipidGKgDay("1");
        setLipSourceId("lip-20");
        setLineType("central");
        setElectrolyteAmounts({ sodium: "100", potassium: "80", calcium: "10", magnesium: "12", phosphate: "20" });
        setInsulinUnits("0");
        setHeparinUnits("0");
        setMviMl("10");
        setTraceElementsMl("1");
    };

    // ─── ACTIVE SOURCE LOOKUPS ────────────────────────────────────────
    const activeAaSource = useMemo(() => AMINO_ACID_SOURCES.find((s) => s.id === aaSourceId) || AMINO_ACID_SOURCES[0], [aaSourceId]);
    const activeDexSource = useMemo(() => DEXTROSE_SOURCES.find((s) => s.id === dexSourceId) || DEXTROSE_SOURCES[0], [dexSourceId]);
    const activeLipSource = useMemo(() => LIPID_SOURCES.find((s) => s.id === lipSourceId) || LIPID_SOURCES[0], [lipSourceId]);

    // ─── CORE TPN CALCULATION ENGINE ──────────────────────────────────
    const calc = useMemo(() => {
        const wt = parseFloat(weightKg) || 0;

        // Total fluid target
        const fluidPerKg = parseFloat(totalFluidMlKg) || 0;
        const targetFluidMl = useFluidOverride
            ? parseFloat(totalFluidOverrideMl) || 0
            : wt * fluidPerKg;

        // ── Protein / Amino Acids ──
        const proteinGKg = parseFloat(proteinGKgDay) || 0;
        const totalProteinG = proteinGKg * wt;
        const aaVolumeMl = activeAaSource.concentrationPct > 0 ? (totalProteinG / (activeAaSource.concentrationPct / 100)) : 0;
        const proteinKcal = totalProteinG * activeAaSource.kcalPerGram;
        const nitrogenG = totalProteinG * (activeAaSource.proteinFraction || 0.16);

        // ── Dextrose ──
        const dexGKg = parseFloat(dextroseGKgDay) || 0;
        const totalDextroseG = dexGKg * wt;
        const dexVolumeMl = activeDexSource.concentrationPct > 0 ? (totalDextroseG / (activeDexSource.concentrationPct / 100)) : 0;
        const dextroseKcal = totalDextroseG * activeDexSource.kcalPerGram;
        // GIR = mg/kg/min
        const girMgKgMin = wt > 0 ? (totalDextroseG * 1000) / (wt * 1440) : 0;

        // ── Lipids ──
        const lipGKg = parseFloat(lipidGKgDay) || 0;
        const totalLipidG = lipGKg * wt;
        const lipVolumeMl = activeLipSource.concentrationPct > 0 ? (totalLipidG / (activeLipSource.concentrationPct / 100)) : 0;
        const lipidKcal = totalLipidG * activeLipSource.kcalPerGram;

        // ── Calories ──
        const nonProteinKcal = dextroseKcal + lipidKcal;
        const totalKcal = proteinKcal + nonProteinKcal;
        const kcalPerKg = wt > 0 ? totalKcal / wt : 0;
        const nonProteinKcalPerGN = nitrogenG > 0 ? nonProteinKcal / nitrogenG : 0;
        const dextrosePctOfNonProtein = nonProteinKcal > 0 ? (dextroseKcal / nonProteinKcal) * 100 : 0;
        const lipidPctOfNonProtein = nonProteinKcal > 0 ? (lipidKcal / nonProteinKcal) * 100 : 0;
        const lipidPctOfTotalKcal = totalKcal > 0 ? (lipidKcal / totalKcal) * 100 : 0;

        // ── Additives volumes ──
        const mviVol = parseFloat(mviMl) || 0;
        const traceVol = parseFloat(traceElementsMl) || 0;

        // ── Electrolyte osmotic contribution & volume (assume negligible added volume, ~nominal) ──
        let electrolyteMOsm = 0;
        let electrolyteAddedVolMl = 0;
        ELECTROLYTE_DEFS.forEach((e) => {
            const amt = parseFloat(electrolyteAmounts[e.id]) || 0;
            electrolyteMOsm += amt * e.mOsmPerUnit;
            // approximate: most concentrated electrolyte stock solutions ~ 0.05 mL per mEq/mmol
            electrolyteAddedVolMl += amt * 0.05;
        });

        // ── Macronutrient base osmolarity contribution (approximate clinical formula) ──
        // Dextrose: ~5 mOsm/g ; Amino acids: ~10 mOsm/g ; Lipids: contribute minimally (~cal/mL ~ isotonic-ish, ignored in simplified calc)
        const dextroseMOsmContribution = totalDextroseG * 5;
        const aminoAcidMOsmContribution = totalProteinG * 10;
        const totalMOsmLoad = dextroseMOsmContribution + aminoAcidMOsmContribution + electrolyteMOsm;

        // ── Total Volume (sum of all components) ──
        const totalVolumeMl = aaVolumeMl + dexVolumeMl + lipVolumeMl + mviVol + traceVol + electrolyteAddedVolMl;

        // ── Final Osmolarity (mOsm/L) ──
        const finalOsmolarity = totalVolumeMl > 0 ? (totalMOsmLoad / totalVolumeMl) * 1000 : 0;

        // ── Peripheral line safety threshold ──
        const exceedsPeripheralLimit = lineType === "peripheral" && finalOsmolarity > 900;
        const nearPeripheralLimit = lineType === "peripheral" && finalOsmolarity > 750 && finalOsmolarity <= 900;

        // ── Fluid balance check: does component volume exceed/undershoot target fluid? ──
        const volumeDifferenceMl = totalVolumeMl - targetFluidMl;
        const freeWaterNeededMl = Math.max(0, targetFluidMl - totalVolumeMl);
        const finalBagVolumeMl = totalVolumeMl + freeWaterNeededMl;

        // ── Rate if run over 24h ──
        const infusionRateMlHr = finalBagVolumeMl / 24;

        // ── Lipid dose safety flag (max 2.5 g/kg/day adult, 3-4 g/kg/day neonate typically; using conservative adult/ped split) ──
        const lipidMaxGKg = population === "pediatric" ? 3 : 2.5;
        const lipidExceedsMax = lipGKg > lipidMaxGKg;

        // ── Dextrose GIR safety flag (max ~4-5 mg/kg/min adult non-critical; up to 7 in some ICU; ped neonates up to 12-14) ──
        const girMaxMgKgMin = population === "pediatric" ? 13 : 5;
        const girExceedsMax = girMgKgMin > girMaxMgKgMin;

        return {
            wt,
            targetFluidMl,
            totalProteinG,
            aaVolumeMl,
            proteinKcal,
            nitrogenG,
            totalDextroseG,
            dexVolumeMl,
            dextroseKcal,
            girMgKgMin,
            totalLipidG,
            lipVolumeMl,
            lipidKcal,
            nonProteinKcal,
            totalKcal,
            kcalPerKg,
            nonProteinKcalPerGN,
            dextrosePctOfNonProtein,
            lipidPctOfNonProtein,
            lipidPctOfTotalKcal,
            mviVol,
            traceVol,
            electrolyteMOsm,
            electrolyteAddedVolMl,
            totalMOsmLoad,
            totalVolumeMl,
            finalOsmolarity,
            exceedsPeripheralLimit,
            nearPeripheralLimit,
            volumeDifferenceMl,
            freeWaterNeededMl,
            finalBagVolumeMl,
            infusionRateMlHr,
            lipidMaxGKg,
            lipidExceedsMax,
            girMaxMgKgMin,
            girExceedsMax,
            isValid: wt > 0 && targetFluidMl > 0,
        };
    }, [
        weightKg,
        totalFluidMlKg,
        useFluidOverride,
        totalFluidOverrideMl,
        proteinGKgDay,
        activeAaSource,
        dextroseGKgDay,
        activeDexSource,
        lipidGKgDay,
        activeLipSource,
        mviMl,
        traceElementsMl,
        electrolyteAmounts,
        lineType,
        population,
    ]);

    // ─── COPY TPN ORDER SUMMARY TO CLIPBOARD ──────────────────────────
    const handleCopyOrder = useCallback(() => {
        const text = `
=== PHARMAWALLAH TPN (TOTAL PARENTERAL NUTRITION) ORDER SUMMARY ===
Patient: ${population === "pediatric" ? "Pediatric" : "Adult"} | Weight: ${calc.wt} kg
Line Type: ${lineType === "central" ? "Central Line (CVC/PICC)" : "Peripheral Line"}
Target Fluid Volume: ${calc.targetFluidMl.toFixed(0)} mL/day

MACRONUTRIENTS:
Amino Acids (${activeAaSource.label}): ${calc.totalProteinG.toFixed(1)} g (${proteinGKgDay} g/kg/day) → ${calc.aaVolumeMl.toFixed(1)} mL | ${calc.proteinKcal.toFixed(0)} kcal | N: ${calc.nitrogenG.toFixed(2)} g
Dextrose (${activeDexSource.label}): ${calc.totalDextroseG.toFixed(1)} g (${dextroseGKgDay} g/kg/day) → ${calc.dexVolumeMl.toFixed(1)} mL | ${calc.dextroseKcal.toFixed(0)} kcal | GIR: ${calc.girMgKgMin.toFixed(2)} mg/kg/min
Lipids (${activeLipSource.label}): ${calc.totalLipidG.toFixed(1)} g (${lipidGKgDay} g/kg/day) → ${calc.lipVolumeMl.toFixed(1)} mL | ${calc.lipidKcal.toFixed(0)} kcal

CALORIE SUMMARY:
Total Calories: ${calc.totalKcal.toFixed(0)} kcal (${calc.kcalPerKg.toFixed(1)} kcal/kg/day)
Non-Protein Calories: ${calc.nonProteinKcal.toFixed(0)} kcal
Non-Protein Cal:N Ratio: ${calc.nonProteinKcalPerGN.toFixed(0)}:1
Lipid % of Total Calories: ${calc.lipidPctOfTotalKcal.toFixed(1)}%

ELECTROLYTES (per day):
${ELECTROLYTE_DEFS.map((e) => `${e.label}: ${electrolyteAmounts[e.id] || 0} ${e.unit}`).join("\n")}

ADDITIVES:
Multivitamin: ${mviMl} mL | Trace Elements: ${traceElementsMl} mL
Insulin: ${insulinUnits} units | Heparin: ${heparinUnits} units

FINAL ADMIXTURE:
Total Component Volume: ${calc.totalVolumeMl.toFixed(1)} mL
Free Water / Sterile Water Adjustment: ${calc.freeWaterNeededMl.toFixed(1)} mL
Final Bag Volume: ${calc.finalBagVolumeMl.toFixed(1)} mL
Final Osmolarity: ${calc.finalOsmolarity.toFixed(0)} mOsm/L ${calc.exceedsPeripheralLimit ? "⚠ EXCEEDS 900 mOsm/L PERIPHERAL LIMIT" : ""}
Infusion Rate (24h): ${calc.infusionRateMlHr.toFixed(1)} mL/hr

Generated at: ${new Date().toLocaleString()}
=====================================================================
`.trim();

        navigator.clipboard.writeText(text);
        setCopiedLabel(true);
        setTimeout(() => setCopiedLabel(false), 2500);
    }, [calc, population, lineType, activeAaSource, activeDexSource, activeLipSource, proteinGKgDay, dextroseGKgDay, lipidGKgDay, electrolyteAmounts, mviMl, traceElementsMl, insulinUnits, heparinUnits]);

    const updateElectrolyte = (id: string, value: string) => {
        setElectrolyteAmounts((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ─── HERO HEADER ────────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-500 p-8 text-white shadow-xl"
                >
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                PharmaWallah Clinical Suite
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/30 backdrop-blur-md text-emerald-100 border border-emerald-300/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ASPEN-Referenced Osmolarity Engine
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Total Parenteral Nutrition (TPN) Calculator
                        </h1>
                        <p className="text-blue-50 text-sm sm:text-base leading-relaxed">
                            Calculate macronutrient volumes, non-protein calories, nitrogen balance, dextrose infusion rate, and final admixture osmolarity with automated peripheral/central line safety checks.
                        </p>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 opacity-10 pointer-events-none hidden lg:block">
                        <FlaskConical className="w-80 h-80 text-white" />
                    </div>
                </motion.header>


                {/* ─── PATIENT PARAMETERS BAR ─────────────────────────────── */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-800">Patient Parameters</h2>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Population Toggle */}
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => setPopulation("adult")}
                                    className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${population === "adult" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Adult
                                </button>
                                <button
                                    onClick={() => setPopulation("pediatric")}
                                    className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${population === "pediatric" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    <Baby className="w-3.5 h-3.5" />
                                    Pediatric
                                </button>
                            </div>
                            <button
                                onClick={handleReset}
                                title="Reset all fields"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Weight */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Patient Weight
                            </label>
                            <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weightKg}
                                    onChange={(e) => setWeightKg(e.target.value)}
                                    placeholder="e.g. 70"
                                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                    kg
                                </span>
                            </div>
                        </div>

                        {/* Fluid Requirement */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                                <span>Total Fluid Requirement</span>
                                <button
                                    onClick={() => setUseFluidOverride(!useFluidOverride)}
                                    className="text-[11px] text-blue-600 font-normal hover:underline"
                                >
                                    {useFluidOverride ? "Use mL/kg" : "Override total mL"}
                                </button>
                            </label>
                            {!useFluidOverride ? (
                                <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                    <input
                                        type="number"
                                        step="1"
                                        value={totalFluidMlKg}
                                        onChange={(e) => setTotalFluidMlKg(e.target.value)}
                                        placeholder="e.g. 30"
                                        className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-16"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                        mL/kg
                                    </span>
                                </div>
                            ) : (
                                <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                    <input
                                        type="number"
                                        step="10"
                                        value={totalFluidOverrideMl}
                                        onChange={(e) => setTotalFluidOverrideMl(e.target.value)}
                                        placeholder="e.g. 2100"
                                        className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                        mL
                                    </span>
                                </div>
                            )}
                            <p className="text-[11px] text-slate-400 mt-1">Target: {calc.targetFluidMl.toFixed(0)} mL/day</p>
                        </div>

                        {/* Line Type */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Access Line Type
                            </label>
                            <select
                                value={lineType}
                                onChange={(e) => setLineType(e.target.value as "central" | "peripheral")}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                            >
                                <option value="central">Central Line (CVC / PICC)</option>
                                <option value="peripheral">Peripheral Line (PIV)</option>
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {lineType === "peripheral" ? "Limit: ≤900 mOsm/L" : "No standard osmolarity ceiling"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── MAIN WORKBENCH (GRID: INPUTS VS RESULTS) ───────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ─── LEFT COLUMN: MACRONUTRIENT & ADDITIVE INPUTS (7 COLS) ─── */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Step 1: Amino Acids */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Amino Acids (Protein)</h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Macronutrient</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Protein Dose</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={proteinGKgDay}
                                            onChange={(e) => setProteinGKgDay(e.target.value)}
                                            placeholder="e.g. 1.2"
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-20"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                            g/kg/day
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Total: {calc.totalProteinG.toFixed(1)} g/day</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amino Acid Source</label>
                                    <select
                                        value={aaSourceId}
                                        onChange={(e) => setAaSourceId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                                    >
                                        {AMINO_ACID_SOURCES.map((s) => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">Volume: {calc.aaVolumeMl.toFixed(1)} mL</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Dextrose */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Dextrose (Carbohydrate)</h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Macronutrient</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dextrose Dose</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={dextroseGKgDay}
                                            onChange={(e) => setDextroseGKgDay(e.target.value)}
                                            placeholder="e.g. 3"
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-20"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                            g/kg/day
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Total: {calc.totalDextroseG.toFixed(1)} g/day</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dextrose Source</label>
                                    <select
                                        value={dexSourceId}
                                        onChange={(e) => setDexSourceId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium text-slate-800"
                                    >
                                        {DEXTROSE_SOURCES.map((s) => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">Volume: {calc.dexVolumeMl.toFixed(1)} mL</p>
                                </div>
                            </div>

                            <div className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${calc.girExceedsMax ? "bg-red-50 border-red-200 text-red-900" : "bg-slate-50 border-slate-200 text-slate-600"
                                }`}>
                                {calc.girExceedsMax ? (
                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                ) : (
                                    <Gauge className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <strong>Glucose Infusion Rate (GIR): {calc.girMgKgMin.toFixed(2)} mg/kg/min.</strong>{" "}
                                    {calc.girExceedsMax
                                        ? `Exceeds typical ${population} maximum of ${calc.girMaxMgKgMin} mg/kg/min — reassess for hyperglycemia risk.`
                                        : `Within typical ${population} range (max ~${calc.girMaxMgKgMin} mg/kg/min).`}
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Lipids */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Lipid Emulsion (Fat)</h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Macronutrient</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lipid Dose</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={lipidGKgDay}
                                            onChange={(e) => setLipidGKgDay(e.target.value)}
                                            placeholder="e.g. 1"
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-20"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                            g/kg/day
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Total: {calc.totalLipidG.toFixed(1)} g/day</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lipid Source</label>
                                    <select
                                        value={lipSourceId}
                                        onChange={(e) => setLipSourceId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium text-slate-800"
                                    >
                                        {LIPID_SOURCES.map((s) => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">Volume: {calc.lipVolumeMl.toFixed(1)} mL</p>
                                </div>
                            </div>

                            {calc.lipidExceedsMax && (
                                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] leading-relaxed flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Lipid dose exceeds recommended maximum</strong> of {calc.lipidMaxGKg} g/kg/day for {population} patients. Reassess order.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 4: Electrolytes */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">4</div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Electrolytes</h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Per day totals</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ELECTROLYTE_DEFS.map((e) => (
                                    <div key={e.id}>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">{e.label}</label>
                                        <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-600">
                                            <input
                                                type="number"
                                                step="1"
                                                value={electrolyteAmounts[e.id] || ""}
                                                onChange={(ev) => updateElectrolyte(e.id, ev.target.value)}
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-14"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                                {e.unit}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {population === "pediatric" ? e.pedRangePerKgDay : e.adultRangePerDay}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 5: Additives */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">5</div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Additives</h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Optional</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Multivitamin (MVI)</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-600">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={mviMl}
                                            onChange={(e) => setMviMl(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">mL</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trace Elements</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-600">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={traceElementsMl}
                                            onChange={(e) => setTraceElementsMl(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">mL</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Insulin (Regular)</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-600">
                                        <input
                                            type="number"
                                            step="1"
                                            value={insulinUnits}
                                            onChange={(e) => setInsulinUnits(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-14"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">units</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Heparin</label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-600">
                                        <input
                                            type="number"
                                            step="100"
                                            value={heparinUnits}
                                            onChange={(e) => setHeparinUnits(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-14"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">units</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ─── RIGHT COLUMN: HERO RESULTS & SAFETY (5 COLS) ─────────── */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* HERO RESULTS CARD */}
                        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-900/50 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 text-white">
                                        <FlaskConical className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-white">TPN Admixture Output</h3>
                                        <p className="text-xs text-blue-200/80">Final Bag Composition</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyOrder}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                                >
                                    {copiedLabel ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy Order
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Main Osmolarity Highlight */}
                            <div className={`rounded-2xl p-5 border backdrop-blur-sm ${calc.exceedsPeripheralLimit
                                ? "bg-gradient-to-r from-red-600/30 to-red-500/20 border-red-400/40"
                                : calc.nearPeripheralLimit
                                    ? "bg-gradient-to-r from-amber-600/30 to-amber-500/20 border-amber-400/40"
                                    : "bg-gradient-to-r from-blue-600/30 to-emerald-500/30 border-emerald-400/30"
                                }`}>
                                <div className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${calc.exceedsPeripheralLimit ? "text-red-300" : calc.nearPeripheralLimit ? "text-amber-300" : "text-emerald-300"
                                    }`}>
                                    {calc.exceedsPeripheralLimit ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Final Osmolarity
                                </div>
                                <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                                    {calc.finalOsmolarity.toFixed(0)}{" "}
                                    <span className="text-xl font-medium text-blue-200">mOsm/L</span>
                                </div>
                                <div className="mt-2 text-xs text-blue-100 flex items-center gap-1.5">
                                    {calc.exceedsPeripheralLimit ? (
                                        <>
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                            <span>Exceeds 900 mOsm/L — unsafe for peripheral administration. Requires central access.</span>
                                        </>
                                    ) : calc.nearPeripheralLimit ? (
                                        <>
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span>Approaching 900 mOsm/L peripheral limit — monitor closely.</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                            <span>{lineType === "peripheral" ? "Within safe peripheral limit (≤900 mOsm/L)." : "Suitable for central line administration."}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Core Breakdown Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Total Calories</span>
                                    <div className="text-lg font-bold text-white mt-0.5">
                                        {calc.totalKcal.toFixed(0)} <span className="text-xs font-normal text-blue-200">kcal</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{calc.kcalPerKg.toFixed(1)} kcal/kg/day</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Non-Protein Calories</span>
                                    <div className="text-lg font-bold text-white mt-0.5">
                                        {calc.nonProteinKcal.toFixed(0)} <span className="text-xs font-normal text-blue-200">kcal</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Dex + Lipid</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">NPC:N Ratio</span>
                                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                                        {calc.nonProteinKcalPerGN.toFixed(0)}:1
                                    </div>
                                    <span className="text-[10px] text-slate-400">Target ~100-150:1</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Nitrogen</span>
                                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                                        {calc.nitrogenG.toFixed(2)} <span className="text-xs font-normal text-blue-200">g</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Per day</span>
                                </div>
                            </div>

                            {/* Volume / Fluid Balance */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                                <div className="flex items-center justify-between text-xs font-semibold text-blue-200">
                                    <span>Final Bag Volume & Rate</span>
                                    <span className="text-emerald-400">{calc.finalBagVolumeMl.toFixed(0)} mL</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-400 text-[11px]">Component Volume:</span>
                                        <div className="font-bold text-white text-sm">{calc.totalVolumeMl.toFixed(1)} mL</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px]">Free Water Added:</span>
                                        <div className="font-bold text-white text-sm">{calc.freeWaterNeededMl.toFixed(1)} mL</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px]">Target Fluid Goal:</span>
                                        <div className="font-bold text-white text-sm">{calc.targetFluidMl.toFixed(0)} mL</div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 text-[11px]">Infusion Rate (24h):</span>
                                        <div className="font-bold text-emerald-400 text-sm">{calc.infusionRateMlHr.toFixed(1)} mL/hr</div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Volume Composition Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[11px] text-slate-300">
                                    <span>Bag Volume Composition:</span>
                                    <span>{calc.finalBagVolumeMl.toFixed(0)} mL Total</span>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-white/10">
                                    <div style={{ width: `${(calc.aaVolumeMl / (calc.finalBagVolumeMl || 1)) * 100}%` }} className="bg-blue-500 h-full" title="Amino Acids" />
                                    <div style={{ width: `${(calc.dexVolumeMl / (calc.finalBagVolumeMl || 1)) * 100}%` }} className="bg-teal-400 h-full" title="Dextrose" />
                                    <div style={{ width: `${(calc.lipVolumeMl / (calc.finalBagVolumeMl || 1)) * 100}%` }} className="bg-amber-400 h-full" title="Lipids" />
                                    <div style={{ width: `${(calc.freeWaterNeededMl / (calc.finalBagVolumeMl || 1)) * 100}%` }} className="bg-slate-500 h-full" title="Free Water" />
                                </div>
                                <div className="flex flex-wrap justify-between gap-x-3 text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />AA ({calc.aaVolumeMl.toFixed(0)} mL)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />Dex ({calc.dexVolumeMl.toFixed(0)} mL)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Lipid ({calc.lipVolumeMl.toFixed(0)} mL)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />Water ({calc.freeWaterNeededMl.toFixed(0)} mL)</span>
                                </div>
                            </div>
                        </div>

                        {/* Calorie Distribution Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <h4 className="font-bold text-sm text-slate-900">Calorie & Macronutrient Distribution</h4>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Protein Calories</span>
                                    <span className="font-semibold text-slate-900">{calc.proteinKcal.toFixed(0)} kcal</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Dextrose Calories</span>
                                    <span className="font-semibold text-slate-900">{calc.dextroseKcal.toFixed(0)} kcal ({calc.dextrosePctOfNonProtein.toFixed(0)}% of NPC)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Lipid Calories</span>
                                    <span className="font-semibold text-slate-900">{calc.lipidKcal.toFixed(0)} kcal ({calc.lipidPctOfNonProtein.toFixed(0)}% of NPC)</span>
                                </div>

                                {calc.lipidPctOfTotalKcal > 60 && (
                                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2 mt-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>Lipids provide {calc.lipidPctOfTotalKcal.toFixed(0)}% of total calories — typically kept under 60% to reduce essential fatty acid imbalance risk.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─── EDUCATIONAL ACCORDIONS & CLINICAL REFERENCE ─────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Formulas Accordion */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                        <button
                            onClick={() => setShowFormulas(!showFormulas)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-base text-slate-900">TPN Calculation Formulas</h3>
                            </div>
                            {showFormulas ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>

                        {showFormulas && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed"
                            >
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-2">
                                    <div className="text-blue-700 font-semibold">1. Component Volume (mL):</div>
                                    <div>Volume = Total Grams ÷ (Stock Concentration % ÷ 100)</div>

                                    <div className="text-blue-700 font-semibold pt-1">2. Non-Protein Calories:</div>
                                    <div>NPC = (Dextrose g × 3.4 kcal/g) + (Lipid g × 10 kcal/g)</div>

                                    <div className="text-blue-700 font-semibold pt-1">3. Nitrogen Balance Input:</div>
                                    <div>Nitrogen (g) = Protein (g) × 0.16 (≈ 6.25 g protein per 1 g N)</div>

                                    <div className="text-blue-700 font-semibold pt-1">4. NPC:Nitrogen Ratio:</div>
                                    <div>NPC:N = Non-Protein Calories ÷ Nitrogen (g) — target ~100–150:1</div>

                                    <div className="text-blue-700 font-semibold pt-1">5. Glucose Infusion Rate (GIR):</div>
                                    <div>GIR (mg/kg/min) = (Dextrose g × 1000) ÷ (Weight kg × 1440 min)</div>

                                    <div className="text-blue-700 font-semibold pt-1">6. Final Osmolarity:</div>
                                    <div>mOsm/L = Total mOsm Load ÷ Final Volume (L)</div>
                                </div>

                                <div className="text-slate-600">
                                    <strong className="text-slate-900">Why Osmolarity Matters:</strong> Peripheral veins tolerate solutions up to approximately 900 mOsm/L before risking phlebitis and vessel damage. Central venous access (CVC/PICC) allows higher-osmolarity admixtures because of rapid dilution in high-flow central circulation. This calculator estimates osmotic load from dextrose, amino acid, and electrolyte concentrations — always verify against your institution's compounding software and pharmacist review.
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ASPEN Guidelines Accordion */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                        <button
                            onClick={() => setShowAspenGuide(!showAspenGuide)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-base text-slate-900">ASPEN Guidelines & Safety Checks</h3>
                            </div>
                            {showAspenGuide ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>

                        {showAspenGuide && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed"
                            >
                                <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                                    <li>
                                        <strong className="text-slate-800">Protein Targets:</strong> ASPEN generally recommends 1.2–2.0 g/kg/day for adult critically ill patients, and up to 2.5–3.5 g/kg/day for neonates/infants depending on gestational age.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Dextrose (GIR) Ceiling:</strong> Adult GIR is typically capped near 4–5 mg/kg/min initially (up to 7 mg/kg/min in select ICU settings) to avoid hyperglycemia and hepatic steatosis; neonates may tolerate higher rates (~10–14 mg/kg/min).
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Lipid Dose Ceiling:</strong> Adult lipid dosing is generally capped at 2.5 g/kg/day (some protocols to 1 g/kg/day in sepsis); pediatric/neonatal dosing may go up to 3–4 g/kg/day with close triglyceride monitoring.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Peripheral Osmolarity Limit:</strong> Keep peripheral parenteral nutrition (PPN) admixtures ≤900 mOsm/L (INS/ASPEN consensus) — anything higher requires central venous access.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Refeeding Syndrome:</strong> In malnourished patients, initiate TPN cautiously (start low, advance over 2–3 days) and monitor phosphate, potassium, and magnesium closely during the first 72 hours.
                                    </li>
                                </ul>
                            </motion.div>
                        )}
                    </div>

                </div>



                {/* ─── TPN EDUCATIONAL OVERVIEW (WHAT / WHY / ADULT vs PED) ── */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                    <button
                        onClick={() => setShowTpnIntro(!showTpnIntro)}
                        className="w-full flex items-center justify-between text-left focus:outline-none"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-800">Understanding TPN</h2>
                        </div>
                        {showTpnIntro ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                    </button>

                    {showTpnIntro && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* What is TPN + Why we need it — two cards side by side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                                            <FlaskConical className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900">What is TPN?</h3>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        Total Parenteral Nutrition (TPN) is a method of feeding that delivers a complete, sterile mixture of amino acids (protein), dextrose (carbohydrate), lipids (fat), electrolytes, vitamins, and trace elements directly into the bloodstream through an IV line — bypassing the gastrointestinal tract entirely. It is compounded per-patient as a single admixture, tailored to that individual&apos;s calorie, protein, fluid, and electrolyte needs for the day.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                                            <HeartPulse className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-sm text-slate-900">Why Do We Need It?</h3>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        TPN is used when a patient cannot safely tolerate oral or enteral (tube) feeding — for example due to bowel obstruction, short bowel syndrome, severe pancreatitis, prolonged ileus, high-output fistulas, or critical illness requiring gut rest. Without adequate nutrition, patients risk malnutrition, impaired wound healing, muscle wasting, and worse clinical outcomes, so TPN provides complete nutrition until the gut can be used again.
                                    </p>
                                </div>
                            </div>

                            {/* Adult vs Pediatric differences */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                                    <h3 className="font-bold text-sm text-slate-900">Adult vs. Pediatric TPN: Key Calculation Differences</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Adult Card */}
                                    <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-slate-700 text-white">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900">Adult</h4>
                                        </div>
                                        <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                                            <li><strong className="text-slate-800">Protein:</strong> 1.2–2.0 g/kg/day (weight-based, not per-day flat dosing)</li>
                                            <li><strong className="text-slate-800">Dextrose (GIR):</strong> Capped near 4–5 mg/kg/min initially, up to ~7 mg/kg/min in select ICU cases</li>
                                            <li><strong className="text-slate-800">Lipids:</strong> Typically ≤2.5 g/kg/day (some sepsis protocols restrict to ~1 g/kg/day)</li>
                                            <li><strong className="text-slate-800">Fluid:</strong> Usually dosed as ~25–35 mL/kg/day, adjusted for cardiac/renal status</li>
                                            <li><strong className="text-slate-800">Electrolytes:</strong> Dosed largely as fixed daily totals (e.g. mEq/day) with modest weight adjustment</li>
                                        </ul>
                                    </div>

                                    {/* Pediatric Card */}
                                    <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-pink-500 text-white">
                                                <Baby className="w-4 h-4" />
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900">Pediatric / Neonatal</h4>
                                        </div>
                                        <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                                            <li><strong className="text-slate-800">Protein:</strong> Higher needs, up to 2.5–3.5 g/kg/day depending on gestational/postnatal age — supports rapid growth</li>
                                            <li><strong className="text-slate-800">Dextrose (GIR):</strong> Tolerate much higher rates, up to ~10–14 mg/kg/min in neonates, due to higher metabolic/glucose turnover</li>
                                            <li><strong className="text-slate-800">Lipids:</strong> Can be advanced up to 3–4 g/kg/day, with closer triglyceride monitoring in small infants</li>
                                            <li><strong className="text-slate-800">Fluid:</strong> Highly age/weight dependent (mL/kg/day varies widely from neonates to older children) and far less fluid tolerance margin</li>
                                            <li><strong className="text-slate-800">Electrolytes:</strong> Almost always dosed strictly per kg/day (mEq or mmol/kg/day), since small absolute errors have proportionally larger impact</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        Pediatric and neonatal patients have far smaller safety margins for fluid, dextrose, and electrolyte dosing errors than adults. This calculator adjusts its GIR and lipid safety-flag thresholds when &quot;Pediatric&quot; is selected above, but every pediatric TPN order should still undergo independent pharmacist double-check per institutional policy.
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </section>

                {/* ─── CLINICAL DISCLAIMER & REGULATORY FOOTER ─────────────── */}
                <footer className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs text-slate-500">
                    <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-slate-700">Official Clinical Compounding Disclaimer: </span>
                            This calculator is designed as a clinical decision support tool for pharmacists, pharmacy technicians, and healthcare professionals verifying total parenteral nutrition (TPN) orders. Osmolarity, GIR, and lipid-dose estimates are approximations based on commonly cited clinical formulas and do not replace institutional TPN compounding software, pharmacist clinical judgment, or patient-specific renal/hepatic/electrolyte considerations. Always verify against current ASPEN guidelines and institutional protocols before compounding or administration.
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex flex-wrap justify-between items-center gap-2">
                        <span>PharmaWallah Clinical• Updated for 2026 Parenteral Standards</span>
                        <span>Referenced against ASPEN Clinical Guidelines & Institutional TPN Standards</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}