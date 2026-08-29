"use client";

import { useState, useMemo } from 'react';
import {
    Baby,
    Pill,
    Calculator,
    AlertCircle,
    Info,
    BookOpen,
    RefreshCw,
    ChevronDown,
    Check,
    Copy,
    Scale,
    Clock,
    Sparkles,
    ShieldCheck,
    HelpCircle,
    ArrowRight
} from 'lucide-react';

type DosingRule = 'young' | 'clark' | 'fried' | 'mgkg';
type WeightUnit = 'kg' | 'lbs';

interface DrugPreset {
    name: string;
    category: string;
    adultDose: string;
    weightKg: string;
    ageYears: string;
    rule: DosingRule;
    mgPerKgTarget?: string;
    notes: string;
}

export default function PediatricDosingCalculator() {
    // Input states
    const [weight, setWeight] = useState<string>('20');
    const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
    const [age, setAge] = useState<string>('5');
    const [adultDose, setAdultDose] = useState<string>('500');
    const [mgKgInput, setMgKgInput] = useState<string>('15');
    const [rule, setRule] = useState<DosingRule>('mgkg');

    // UI toggle states
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [selectedDrug, setSelectedDrug] = useState<string | null>(null);

    // Common Drug Presets
    const commonDrugs: DrugPreset[] = [
        { name: 'Paracetamol', category: 'Antipyretic / Analgesic', adultDose: '1000', weightKg: '20', ageYears: '5', rule: 'mgkg', mgPerKgTarget: '15', notes: '10-15 mg/kg every 4-6h (max 60 mg/kg/day)' },
        { name: 'Ibuprofen', category: 'NSAID / Anti-inflammatory', adultDose: '400', weightKg: '20', ageYears: '5', rule: 'mgkg', mgPerKgTarget: '10', notes: '5-10 mg/kg every 6-8h (max 40 mg/kg/day)' },
        { name: 'Amoxicillin', category: 'Antibiotic', adultDose: '500', weightKg: '15', ageYears: '3', rule: 'mgkg', mgPerKgTarget: '25', notes: '25-45 mg/kg/day divided q12h' },
        { name: 'Prednisolone', category: 'Corticosteroid', adultDose: '40', weightKg: '20', ageYears: '5', rule: 'mgkg', mgPerKgTarget: '1', notes: '1-2 mg/kg/day in 1-2 divided doses' },
        { name: 'Diphenhydramine', category: 'Antihistamine', adultDose: '50', weightKg: '18', ageYears: '4', rule: 'young', mgPerKgTarget: '1.25', notes: '1.25 mg/kg every 6h (max 300 mg/day)' },
    ];

    // Normalized Weight in Kilograms
    const weightKg = useMemo(() => {
        const raw = parseFloat(weight);
        if (isNaN(raw) || raw <= 0) return 0;
        return weightUnit === 'lbs' ? raw / 2.20462 : raw;
    }, [weight, weightUnit]);

    const weightLbs = useMemo(() => {
        return weightKg * 2.20462;
    }, [weightKg]);

    const ageNum = useMemo(() => {
        const raw = parseFloat(age);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [age]);

    const adultDoseNum = useMemo(() => {
        const raw = parseFloat(adultDose);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [adultDose]);

    const mgKgTargetNum = useMemo(() => {
        const raw = parseFloat(mgKgInput);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [mgKgInput]);

    // Compute doses for all rules simultaneously for comparison & display
    const calculations = useMemo(() => {
        if (weightKg <= 0 || ageNum <= 0) return null;

        // Young's: [Age / (Age + 12)] * Adult Dose
        const youngDose = adultDoseNum > 0 ? adultDoseNum * (ageNum / (ageNum + 12)) : 0;
        // Clark's: [Weight (lbs) / 150] * Adult Dose
        const clarkDose = adultDoseNum > 0 ? adultDoseNum * (weightLbs / 150) : 0;
        // Fried's: [Age in Months / 150] * Adult Dose
        const friedDose = adultDoseNum > 0 ? adultDoseNum * ((ageNum * 12) / 150) : 0;
        // mg/kg: Target mg/kg * Weight (kg)
        const mgkgDose = mgKgTargetNum > 0 ? mgKgTargetNum * weightKg : 0;

        let activeDose = 0;
        let ruleName = '';
        let formulaString = '';

        switch (rule) {
            case 'young':
                activeDose = youngDose;
                ruleName = "Young's Rule";
                formulaString = `${ageNum}y / (${ageNum}y + 12) × ${adultDoseNum} mg`;
                break;
            case 'clark':
                activeDose = clarkDose;
                ruleName = "Clark's Rule";
                formulaString = `${weightLbs.toFixed(1)} lbs / 150 × ${adultDoseNum} mg`;
                break;
            case 'fried':
                activeDose = friedDose;
                ruleName = "Fried's Rule";
                formulaString = `${(ageNum * 12).toFixed(0)} mos / 150 × ${adultDoseNum} mg`;
                break;
            case 'mgkg':
            default:
                activeDose = mgkgDose;
                ruleName = "mg/kg Standard Dosing";
                formulaString = `${mgKgTargetNum} mg/kg × ${weightKg.toFixed(1)} kg`;
                break;
        }

        const calculatedMgPerKg = weightKg > 0 ? activeDose / weightKg : 0;
        const adultFraction = adultDoseNum > 0 ? (activeDose / adultDoseNum) * 100 : 0;

        // Clinical Interpretation check
        let interpretation = {
            level: 'normal' as 'normal' | 'high' | 'low',
            text: 'Appropriate pediatric dose range',
            description: 'Calculated dose matches standard expected safety margins.'
        };

        if (rule !== 'mgkg' && adultDoseNum > 0) {
            const standardAdultMgPerKg = adultDoseNum / 70; // 70kg standard adult baseline
            if (calculatedMgPerKg > standardAdultMgPerKg * 1.75) {
                interpretation = {
                    level: 'high',
                    text: 'High Dose Alert — Verification Advised',
                    description: 'Calculated dose yields a high mg/kg ratio compared to standard adult limits. Verify pediatric guideline.'
                };
            } else if (calculatedMgPerKg < standardAdultMgPerKg * 0.35) {
                interpretation = {
                    level: 'low',
                    text: 'Subtherapeutic / Low Dose Alert',
                    description: 'Calculated dose may fall below minimum effective pediatric concentration.'
                };
            }
        }

        return {
            activeDose,
            ruleName,
            formulaString,
            calculatedMgPerKg,
            adultFraction,
            interpretation,
            youngDose,
            clarkDose,
            friedDose,
            mgkgDose,
        };
    }, [weightKg, weightLbs, ageNum, adultDoseNum, mgKgTargetNum, rule]);

    // Load a drug preset
    const handleSelectDrug = (drug: DrugPreset) => {
        setSelectedDrug(drug.name);
        setWeight(drug.weightKg);
        setWeightUnit('kg');
        setAge(drug.ageYears);
        setAdultDose(drug.adultDose);
        setRule(drug.rule);
        if (drug.mgPerKgTarget) {
            setMgKgInput(drug.mgPerKgTarget);
        }
    };

    // Reset form
    const handleReset = () => {
        setWeight('');
        setAge('');
        setAdultDose('');
        setMgKgInput('');
        setSelectedDrug(null);
    };

    // Copy result to clipboard
    const handleCopyResult = () => {
        if (!calculations) return;
        const summary = `Pediatric Dose: ${calculations.activeDose.toFixed(1)} mg (${calculations.ruleName})\nPatient: ${weightKg.toFixed(1)} kg, ${ageNum} years\nDose Rate: ${calculations.calculatedMgPerKg.toFixed(2)} mg/kg`;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 pt-8 p-3 sm:p-5 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <Baby className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Pediatric Dosing Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> Clinical Edition
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    mg/kg standard dosing & historical rules (Young&apos;s, Clark&apos;s, Fried&apos;s)
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
                                {showInstructions ? 'Hide Instructions' : 'How to Use'}
                            </button>
                        </div>
                    </div>

                    {/* Decorative background glow */}
                    <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                </header>

                {/* STEP-BY-STEP DIRECTIONS / INSTRUCTIONS */}
                {showInstructions && (
                    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <span>Directions of Use & Clinical Guide</span>
                            </div>
                            <span className="text-xs text-gray-500">3 Easy Steps</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Dosing Method</strong>
                                    Choose <strong>mg/kg</strong> (recommended gold standard) or pick a common drug preset below.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Patient Vitals</strong>
                                    Type child&apos;s weight (kg or lbs), age, and adult reference or target mg/kg dose.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Review & Cross-Check</strong>
                                    View calculated dose, safe dose bounds, multi-rule comparison, and copy the summary.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN LAYOUT: 12 COLS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT / TOP: PARAMETERS & RULE SELECTOR (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* CARD: DRUG PRESETS */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Quick Drug Presets</h2>
                                </div>
                                <span className="text-xs font-medium text-gray-400">1-click fill</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                                {commonDrugs.map((d) => {
                                    const isSelected = selectedDrug === d.name;
                                    return (
                                        <button
                                            key={d.name}
                                            type="button"
                                            onClick={() => handleSelectDrug(d)}
                                            className={`group flex flex-col items-start p-2.5 rounded-xl text-left border transition-all text-xs ${isSelected
                                                ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-1 ring-blue-500'
                                                : 'border-gray-200 bg-gray-50/60 hover:bg-blue-50/40 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="font-bold text-gray-900 group-hover:text-blue-700 flex items-center justify-between w-full">
                                                <span>{d.name}</span>
                                                {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                                            </div>
                                            <span className="text-[11px] text-gray-500 mt-0.5">{d.mgPerKgTarget ? `${d.mgPerKgTarget} mg/kg` : `${d.adultDose}mg adult`}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CARD: PATIENT PARAMETERS */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-blue-600" />
                                    Patient & Dose Parameters
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 transition"
                                    title="Clear all fields"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Reset
                                </button>
                            </div>

                            {/* INPUT FIELDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                {/* 1. Weight */}
                                <div className="rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50/60 to-white p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="patient-weight" className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                                            <Scale className="h-3.5 w-3.5 text-blue-600" />
                                            Weight
                                        </label>
                                        <div className="inline-flex rounded-lg bg-blue-100/70 p-0.5 text-[11px] font-semibold text-blue-800">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('kg')}
                                                className={`rounded-md px-1.5 py-0.5 transition ${weightUnit === 'kg' ? 'bg-white text-blue-700 shadow-xs' : 'text-blue-600 hover:text-blue-900'}`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit('lbs')}
                                                className={`rounded-md px-1.5 py-0.5 transition ${weightUnit === 'lbs' ? 'bg-white text-blue-700 shadow-xs' : 'text-blue-600 hover:text-blue-900'}`}
                                            >
                                                lbs
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="patient-weight"
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="e.g. 20"
                                            value={weight}
                                            onChange={(e) => { setWeight(e.target.value); setSelectedDrug(null); }}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">
                                            {weightUnit}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-500">
                                        {weightUnit === 'lbs' && weightKg > 0 ? `≈ ${weightKg.toFixed(1)} kg` : weightUnit === 'kg' && weightKg > 0 ? `≈ ${weightLbs.toFixed(1)} lbs` : 'Required'}
                                    </p>
                                </div>

                                {/* 2. Age */}
                                <div className="rounded-xl border border-green-200/80 bg-gradient-to-b from-green-50/60 to-white p-4 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="patient-age" className="text-xs font-bold text-green-950 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-green-600" />
                                            Age (Years)
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="patient-age"
                                            type="number"
                                            step="0.1"
                                            min="0.05"
                                            placeholder="e.g. 5"
                                            value={age}
                                            onChange={(e) => { setAge(e.target.value); setSelectedDrug(null); }}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">
                                            yrs
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-500">
                                        {ageNum > 0 ? `≈ ${(ageNum * 12).toFixed(0)} months` : 'Required'}
                                    </p>
                                </div>

                                {/* 3. Adult Dose or mg/kg Dose */}
                                <div className="rounded-xl border border-teal-200/80 bg-gradient-to-b from-teal-50/60 to-white p-4 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-200 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="dosing-target" className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                                            <Pill className="h-3.5 w-3.5 text-teal-600" />
                                            {rule === 'mgkg' ? 'Target (mg/kg)' : 'Adult Dose (mg)'}
                                        </label>
                                    </div>
                                    <div className="relative">
                                        {rule === 'mgkg' ? (
                                            <input
                                                id="dosing-target"
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                placeholder="e.g. 15"
                                                value={mgKgInput}
                                                onChange={(e) => { setMgKgInput(e.target.value); setSelectedDrug(null); }}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none"
                                            />
                                        ) : (
                                            <input
                                                id="dosing-target"
                                                type="number"
                                                step="1"
                                                min="1"
                                                placeholder="e.g. 500"
                                                value={adultDose}
                                                onChange={(e) => { setAdultDose(e.target.value); setSelectedDrug(null); }}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none"
                                            />
                                        )}
                                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">
                                            {rule === 'mgkg' ? 'mg/kg' : 'mg'}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-gray-500">
                                        {rule === 'mgkg' ? 'Per-kg single dose target' : 'Standard 70kg adult dose'}
                                    </p>
                                </div>

                            </div>

                            {/* RULE SELECTION (SEGMENTED TABS) */}
                            <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                        Select Calculation Method
                                    </label>
                                    <span className="text-[11px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                                        ★ mg/kg is Clinical Standard
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {/* mg/kg */}
                                    <button
                                        type="button"
                                        onClick={() => setRule('mgkg')}
                                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${rule === 'mgkg'
                                            ? 'border-green-600 bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm">mg/kg Dose</span>
                                            {rule === 'mgkg' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <span className={`text-[11px] mt-1 ${rule === 'mgkg' ? 'text-green-100' : 'text-gray-500'}`}>
                                            Gold Standard
                                        </span>
                                    </button>

                                    {/* Young's Rule */}
                                    <button
                                        type="button"
                                        onClick={() => setRule('young')}
                                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${rule === 'young'
                                            ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm">Young&apos;s</span>
                                            {rule === 'young' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <span className={`text-[11px] mt-1 ${rule === 'young' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            Age 1–12 yrs
                                        </span>
                                    </button>

                                    {/* Clark's Rule */}
                                    <button
                                        type="button"
                                        onClick={() => setRule('clark')}
                                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${rule === 'clark'
                                            ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm">Clark&apos;s</span>
                                            {rule === 'clark' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <span className={`text-[11px] mt-1 ${rule === 'clark' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            Weight-based
                                        </span>
                                    </button>

                                    {/* Fried's Rule */}
                                    <button
                                        type="button"
                                        onClick={() => setRule('fried')}
                                        className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${rule === 'fried'
                                            ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-bold text-sm">Fried&apos;s</span>
                                            {rule === 'fried' && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <span className={`text-[11px] mt-1 ${rule === 'fried' ? 'text-blue-100' : 'text-gray-500'}`}>
                                            Infants &lt; 1 yr
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Extra context when non-mg/kg selected */}
                            {rule !== 'mgkg' && (
                                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold">Clinical Note:</span> Historical rules estimate dose from standard adult parameters. In contemporary practice, weight-based (mg/kg) guidelines from formularies (BNF for Children, Harriet Lane) supersede these rules.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACCORDION: EDUCATIONAL DOSING RULES REFERENCE */}
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-md shadow-gray-200/50 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full p-5 text-left font-bold text-gray-800 hover:bg-gray-50/80 transition"
                            >
                                <span className="flex items-center gap-2 text-sm sm:text-base">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    Pediatric Formulas & Clinical Reference
                                </span>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
                            </button>

                            {showDetails && (
                                <div className="p-5 pt-0 border-t border-gray-100 space-y-4 text-xs sm:text-sm text-gray-600 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                                            <div className="font-bold text-blue-900 mb-1">Young&apos;s Rule (Ages 1–12)</div>
                                            <div className="font-mono text-xs text-blue-800 bg-white p-2 rounded border border-blue-200/60 mb-1">
                                                Dose = [Age / (Age + 12)] × Adult Dose
                                            </div>
                                            <p className="text-[11px] text-gray-500">Based on child age. Tends to underestimate for older children.</p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-green-50/50 border border-green-100">
                                            <div className="font-bold text-green-900 mb-1">Clark&apos;s Rule (Weight-based)</div>
                                            <div className="font-mono text-xs text-green-800 bg-white p-2 rounded border border-green-200/60 mb-1">
                                                Dose = [Weight (lbs) / 150] × Adult Dose
                                            </div>
                                            <p className="text-[11px] text-gray-500">Assumes standard adult weight is 150 lbs (68-70 kg).</p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                                            <div className="font-bold text-purple-900 mb-1">Fried&apos;s Rule (Infants &lt; 1 yr)</div>
                                            <div className="font-mono text-xs text-purple-800 bg-white p-2 rounded border border-purple-200/60 mb-1">
                                                Dose = [Age in Months / 150] × Adult Dose
                                            </div>
                                            <p className="text-[11px] text-gray-500">Specifically developed for infants under 1-2 years.</p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                            <div className="font-bold text-emerald-900 mb-1">mg/kg Body Weight (Gold Standard)</div>
                                            <div className="font-mono text-xs text-emerald-800 bg-white p-2 rounded border border-emerald-200/60 mb-1">
                                                Dose = Target (mg/kg) × Weight (kg)
                                            </div>
                                            <p className="text-[11px] text-gray-500">Safest and most widely accepted contemporary clinical practice.</p>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-400 italic pt-2">
                                        References: Johns Hopkins ABX Guide, Harriet Lane Handbook, Pediatric Dosage Handbook (Lexicomp).
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT / BOTTOM: CALCULATION RESULTS & COMPARISON (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* RESULTS CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Calculated Result
                                    </span>
                                </div>
                                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                                    {calculations ? calculations.ruleName : 'Awaiting Input'}
                                </span>
                            </div>

                            {calculations ? (
                                <div className="space-y-4">
                                    {/* Big Number Output */}
                                    <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                        <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider block mb-1">
                                            Recommended Pediatric Dose
                                        </span>
                                        <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                                            {calculations.activeDose.toFixed(1)}{' '}
                                            <span className="text-2xl font-bold text-green-200">mg</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {calculations.formulaString}
                                        </div>
                                    </div>

                                    {/* Dose Rate & Metrics */}
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                                            <div className="text-[11px] text-blue-100 font-medium">Dose per kg</div>
                                            <div className="text-lg font-bold text-white mt-0.5">
                                                {calculations.calculatedMgPerKg.toFixed(2)}{' '}
                                                <span className="text-xs font-normal text-blue-200">mg/kg</span>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                                            <div className="text-[11px] text-blue-100 font-medium">% of Adult Dose</div>
                                            <div className="text-lg font-bold text-white mt-0.5">
                                                {calculations.adultFraction.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Dose Percentage Gauge */}
                                    {adultDoseNum > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[11px] text-blue-100">
                                                <span>Child Dose Fraction</span>
                                                <span className="font-semibold">{calculations.activeDose.toFixed(0)} mg / {adultDoseNum} mg</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-green-300 transition-all duration-500"
                                                    style={{ width: `${Math.min(calculations.adultFraction, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Safety Interpretation Box */}
                                    <div className="rounded-xl bg-white/20 p-3.5 backdrop-blur-md text-xs text-white border border-white/20">
                                        <div className="font-bold flex items-center gap-1.5 mb-1">
                                            <AlertCircle className="h-4 w-4 text-yellow-300" />
                                            {calculations.interpretation.text}
                                        </div>
                                        <p className="text-blue-100 text-[11px] leading-relaxed">
                                            {calculations.interpretation.description}
                                        </p>
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopyResult}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-blue-900 font-bold py-3 px-4 shadow-lg hover:bg-blue-50 transition active:scale-[0.98]"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 text-green-600" />
                                                <span>Summary Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 text-blue-700" />
                                                <span>Copy Dose Summary</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Please enter valid weight and age to calculate dose.</p>
                                </div>
                            )}
                        </div>

                        {/* LIVE MULTI-RULE COMPARISON TABLE */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-3.5">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                    Multi-Rule Comparison
                                </h3>
                                <span className="text-[11px] text-gray-400">All Formulas</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="py-2.5 px-3">Rule</th>
                                            <th className="py-2.5 px-2 text-right">Dose</th>
                                            <th className="py-2.5 px-3 text-right">mg/kg</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-600">
                                        {/* mg/kg row */}
                                        <tr className={rule === 'mgkg' ? 'bg-green-50/70 font-bold text-green-950' : 'hover:bg-gray-50'}>
                                            <td className="py-2.5 px-3 flex items-center gap-1.5">
                                                <span>mg/kg Standard</span>
                                                {rule === 'mgkg' && <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.2 rounded-full">Active</span>}
                                            </td>
                                            <td className="py-2.5 px-2 text-right font-mono">
                                                {calculations ? `${calculations.mgkgDose.toFixed(1)} mg` : '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">
                                                {mgKgTargetNum > 0 ? `${mgKgTargetNum.toFixed(1)}` : '—'}
                                            </td>
                                        </tr>

                                        {/* Young's row */}
                                        <tr className={rule === 'young' ? 'bg-blue-50/70 font-bold text-blue-950' : 'hover:bg-gray-50'}>
                                            <td className="py-2.5 px-3 flex items-center gap-1.5">
                                                <span>Young&apos;s (Age)</span>
                                                {rule === 'young' && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full">Active</span>}
                                            </td>
                                            <td className="py-2.5 px-2 text-right font-mono">
                                                {calculations && adultDoseNum > 0 ? `${calculations.youngDose.toFixed(1)} mg` : '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">
                                                {calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.youngDose / weightKg).toFixed(1)}` : '—'}
                                            </td>
                                        </tr>

                                        {/* Clark's row */}
                                        <tr className={rule === 'clark' ? 'bg-blue-50/70 font-bold text-blue-950' : 'hover:bg-gray-50'}>
                                            <td className="py-2.5 px-3 flex items-center gap-1.5">
                                                <span>Clark&apos;s (Weight)</span>
                                                {rule === 'clark' && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full">Active</span>}
                                            </td>
                                            <td className="py-2.5 px-2 text-right font-mono">
                                                {calculations && adultDoseNum > 0 ? `${calculations.clarkDose.toFixed(1)} mg` : '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">
                                                {calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.clarkDose / weightKg).toFixed(1)}` : '—'}
                                            </td>
                                        </tr>

                                        {/* Fried's row */}
                                        <tr className={rule === 'fried' ? 'bg-blue-50/70 font-bold text-blue-950' : 'hover:bg-gray-50'}>
                                            <td className="py-2.5 px-3 flex items-center gap-1.5">
                                                <span>Fried&apos;s (Infants)</span>
                                                {rule === 'fried' && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full">Active</span>}
                                            </td>
                                            <td className="py-2.5 px-2 text-right font-mono">
                                                {calculations && adultDoseNum > 0 ? `${calculations.friedDose.toFixed(1)} mg` : '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">
                                                {calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.friedDose / weightKg).toFixed(1)}` : '—'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* MANDATORY MEDICAL DISCLAIMER */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <AlertCircle className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Clinical Safety Reminder:</strong>
                                    Calculated values are estimation aids. Always verify individual dosing against standard pediatric formularies, patient renal/hepatic function, hydration state, and maximum daily pediatric thresholds.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}