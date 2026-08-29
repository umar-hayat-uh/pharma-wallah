"use client";

import { useState, useMemo } from 'react';
import {
    Droplet,
    Clock,
    Calculator,
    AlertCircle,
    Info,
    BookOpen,
    RefreshCw,
    ChevronDown,
    Check,
    Copy,
    Sparkles,
    ShieldCheck,
    HelpCircle,
    Activity,
    Gauge,
    Zap
} from 'lucide-react';

type TimeUnit = 'hours' | 'minutes';

interface InfusionPreset {
    name: string;
    tag: string;
    volume: string;
    time: string;
    timeUnit: TimeUnit;
    dropFactor: string;
    notes: string;
}

export default function IVDripRateCalculator() {
    // Input states
    const [volume, setVolume] = useState<string>('1000');
    const [time, setTime] = useState<string>('8');
    const [timeUnit, setTimeUnit] = useState<TimeUnit>('hours');
    const [dropFactor, setDropFactor] = useState<string>('20');

    // UI toggle states
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [activePreset, setActivePreset] = useState<string | null>('Standard NS (1000mL / 8h)');

    // Drop Factor Options
    const dropFactorOptions = [
        { value: '10', name: '10 gtt/mL', label: 'Blood Set', desc: 'Blood & blood products' },
        { value: '15', name: '15 gtt/mL', label: 'Macrodrip', desc: 'Standard IV fluids' },
        { value: '20', name: '20 gtt/mL', label: 'Standard', desc: 'General infusions' },
        { value: '60', name: '60 gtt/mL', label: 'Microdrip', desc: 'Pediatric / ICU / Precise' },
    ];

    // Common Clinical Presets
    const presets: InfusionPreset[] = [
        { name: 'Standard NS', tag: '1000mL / 8h', volume: '1000', time: '8', timeUnit: 'hours', dropFactor: '20', notes: 'Routine adult maintenance hydration' },
        { name: 'Antibiotic (IVPB)', tag: '100mL / 30m', volume: '100', time: '30', timeUnit: 'minutes', dropFactor: '15', notes: 'Intermittent secondary infusion' },
        { name: 'Pediatric IVF', tag: '100mL / 2h', volume: '100', time: '2', timeUnit: 'hours', dropFactor: '60', notes: 'Microdrip calibrated for precision' },
        { name: 'Emergency Bolus', tag: '500mL / 30m', volume: '500', time: '30', timeUnit: 'minutes', dropFactor: '15', notes: 'Rapid fluid resuscitation' },
        { name: 'Slow KVO Line', tag: '250mL / 24h', volume: '250', time: '24', timeUnit: 'hours', dropFactor: '60', notes: 'Keep Vein Open patency maintenance' },
    ];

    // Parsed Numeric Values
    const volNum = useMemo(() => {
        const v = parseFloat(volume);
        return isNaN(v) || v <= 0 ? 0 : v;
    }, [volume]);

    const timeNum = useMemo(() => {
        const t = parseFloat(time);
        return isNaN(t) || t <= 0 ? 0 : t;
    }, [time]);

    const factorNum = useMemo(() => {
        const f = parseFloat(dropFactor);
        return isNaN(f) || f <= 0 ? 0 : f;
    }, [dropFactor]);

    // Calculations
    const results = useMemo(() => {
        if (volNum <= 0 || timeNum <= 0 || factorNum <= 0) return null;

        const timeInMinutes = timeUnit === 'hours' ? timeNum * 60 : timeNum;
        const timeInHours = timeUnit === 'hours' ? timeNum : timeNum / 60;

        // Drip Rate = (Volume in mL * Drop Factor) / Time in Minutes
        const rawDripRate = (volNum * factorNum) / timeInMinutes;
        const dripRateRounded = Math.round(rawDripRate);
        const dripRateExact = Math.round(rawDripRate * 10) / 10;

        // Infusion Rate = Volume in mL / Time in Hours
        const rawInfusionRate = volNum / timeInHours;
        const infusionRateExact = Math.round(rawInfusionRate * 10) / 10;

        // Bedside count: Seconds per drop = 60 / Drip Rate
        const secondsPerDrop = rawDripRate > 0 ? (60 / rawDripRate).toFixed(1) : '0';

        // Total Drops in Entire Bag
        const totalDrops = Math.round(volNum * factorNum);

        // Infusion velocity badge
        let velocityBadge = {
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Standard Rate'
        };
        if (rawInfusionRate >= 500) {
            velocityBadge = { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rapid Bolus Rate' };
        } else if (rawInfusionRate <= 25) {
            velocityBadge = { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Low / KVO Rate' };
        }

        return {
            dripRateRounded,
            dripRateExact,
            infusionRateExact,
            timeInMinutes,
            timeInHours,
            secondsPerDrop,
            totalDrops,
            velocityBadge,
        };
    }, [volNum, timeNum, timeUnit, factorNum]);

    // Load a preset
    const handleSelectPreset = (p: InfusionPreset) => {
        setActivePreset(`${p.name} (${p.tag})`);
        setVolume(p.volume);
        setTime(p.time);
        setTimeUnit(p.timeUnit);
        setDropFactor(p.dropFactor);
    };

    // Quick Volume Select
    const handleQuickVolume = (vol: string) => {
        setVolume(vol);
        setActivePreset(null);
    };

    // Reset Calculator
    const handleReset = () => {
        setVolume('');
        setTime('');
        setTimeUnit('hours');
        setDropFactor('20');
        setActivePreset(null);
    };

    // Copy Calculation Summary
    const handleCopy = () => {
        if (!results) return;
        const summary = `IV Infusion Summary:\n• Drip Rate: ${results.dripRateRounded} gtt/min (${results.dripRateExact} exact)\n• Infusion Pump Rate: ${results.infusionRateExact} mL/hr\n• Timing: 1 drop every ${results.secondsPerDrop} seconds\n• Parameters: ${volNum} mL over ${timeNum} ${timeUnit} (Factor: ${dropFactor} gtt/mL)`;
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
                                <Droplet className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        IV Drip Rate Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> Bedside & Pump
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Gravity drip rates (gtt/min), pump flow rates (mL/hr), and drop interval timing
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
                                <span>Directions of Use & Administration Guidelines</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Volume & Time</strong>
                                    Type fluid volume in mL (or pick a bag size) and set infusion time in hours or minutes.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Drop Factor (gtt/mL)</strong>
                                    Check the IV tubing package: 10 (blood), 15 or 20 (macrodrip), or 60 (microdrip).
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Calibrate & Count</strong>
                                    Use <strong>mL/hr</strong> for electric pumps or <strong>gtt/min (drops/sec)</strong> for gravity clamps.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN LAYOUT: 12 COLS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: PARAMETERS, PRESETS & FORMULAS (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* PRESETS CARD */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Clinical Presets</h2>
                                </div>
                                <span className="text-xs font-medium text-gray-400">1-click configuration</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                                {presets.map((p) => {
                                    const isSelected = activePreset === `${p.name} (${p.tag})`;
                                    return (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleSelectPreset(p)}
                                            className={`group flex flex-col items-start p-2.5 rounded-xl text-left border transition-all text-xs ${isSelected
                                                ? 'border-blue-600 bg-blue-50/90 shadow-sm ring-1 ring-blue-500'
                                                : 'border-gray-200 bg-gray-50/60 hover:bg-blue-50/40 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="font-bold text-gray-900 group-hover:text-blue-700 flex items-center justify-between w-full">
                                                <span>{p.name}</span>
                                                {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                                            </div>
                                            <span className="text-[11px] text-gray-500 mt-0.5 font-medium">{p.tag}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* MAIN INPUTS CARD */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-blue-600" />
                                    Infusion Parameters
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* 1. Volume */}
                                <div className="rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50/60 to-white p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="iv-volume" className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                                            <Droplet className="h-3.5 w-3.5 text-blue-600" />
                                            Total Volume (mL)
                                        </label>
                                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/70 px-1.5 py-0.5 rounded">
                                            Fluid Bag
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="iv-volume"
                                            type="number"
                                            step="1"
                                            min="1"
                                            placeholder="e.g. 1000"
                                            value={volume}
                                            onChange={(e) => { setVolume(e.target.value); setActivePreset(null); }}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">
                                            mL
                                        </span>
                                    </div>
                                    {/* Quick Bag Chips */}
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {['50', '100', '250', '500', '1000'].map((vol) => (
                                            <button
                                                key={vol}
                                                type="button"
                                                onClick={() => handleQuickVolume(vol)}
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition ${volume === vol
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {vol}mL
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Infusion Duration */}
                                <div className="rounded-xl border border-green-200/80 bg-gradient-to-b from-green-50/60 to-white p-4 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="iv-time" className="text-xs font-bold text-green-950 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-green-600" />
                                            Infusion Duration
                                        </label>
                                        <div className="inline-flex rounded-lg bg-green-100/70 p-0.5 text-[11px] font-semibold text-green-800">
                                            <button
                                                type="button"
                                                onClick={() => { setTimeUnit('hours'); setActivePreset(null); }}
                                                className={`rounded-md px-2 py-0.5 transition ${timeUnit === 'hours' ? 'bg-white text-green-800 shadow-xs' : 'text-green-700 hover:text-green-950'}`}
                                            >
                                                Hours
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setTimeUnit('minutes'); setActivePreset(null); }}
                                                className={`rounded-md px-2 py-0.5 transition ${timeUnit === 'minutes' ? 'bg-white text-green-800 shadow-xs' : 'text-green-700 hover:text-green-950'}`}
                                            >
                                                Mins
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="iv-time"
                                            type="number"
                                            step={timeUnit === 'hours' ? '0.25' : '1'}
                                            min="0.1"
                                            placeholder={timeUnit === 'hours' ? 'e.g. 8' : 'e.g. 60'}
                                            value={time}
                                            onChange={(e) => { setTime(e.target.value); setActivePreset(null); }}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400">
                                            {timeUnit}
                                        </span>
                                    </div>
                                    <p className="mt-2.5 text-[11px] text-gray-500">
                                        {timeNum > 0 && timeUnit === 'hours' ? `Total duration = ${(timeNum * 60).toFixed(0)} minutes` : timeNum > 0 && timeUnit === 'minutes' ? `Total duration = ${(timeNum / 60).toFixed(2)} hours` : 'Enter duration'}
                                    </p>
                                </div>

                            </div>

                            {/* 3. DROP FACTOR SELECTOR */}
                            <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Activity className="h-4 w-4 text-blue-600" />
                                        IV Tubing Drop Factor (gtt/mL)
                                    </label>
                                    <span className="text-[11px] text-gray-500">Printed on IV tubing package</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {dropFactorOptions.map((opt) => {
                                        const isSelected = dropFactor === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => { setDropFactor(opt.value); setActivePreset(null); }}
                                                className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${isSelected
                                                    ? 'border-green-600 bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-md'
                                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-bold text-sm">{opt.name}</span>
                                                    {isSelected && <Check className="h-4 w-4 text-white" />}
                                                </div>
                                                <span className={`text-xs font-semibold mt-0.5 ${isSelected ? 'text-green-100' : 'text-blue-700'}`}>
                                                    {opt.label}
                                                </span>
                                                <span className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {opt.desc}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ACCORDION: FORMULA & CLINICAL REFERENCE */}
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-md shadow-gray-200/50 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full p-5 text-left font-bold text-gray-800 hover:bg-gray-50/80 transition"
                            >
                                <span className="flex items-center gap-2 text-sm sm:text-base">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    IV Formulas, Drop Standards & Conversion Guide
                                </span>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
                            </button>

                            {showDetails && (
                                <div className="p-5 pt-0 border-t border-gray-100 space-y-4 text-xs sm:text-sm text-gray-600 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">

                                        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                                            <div className="font-bold text-blue-900 mb-1">1. Gravity Drip Rate (gtt/min)</div>
                                            <div className="font-mono text-xs text-blue-800 bg-white p-2 rounded border border-blue-200/60 mb-1.5">
                                                Drip Rate = (Volume [mL] × Drop Factor [gtt/mL]) ÷ Time [mins]
                                            </div>
                                            <p className="text-[11px] text-gray-500">Always round gravity drops to the nearest whole drop per minute.</p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-green-50/50 border border-green-100">
                                            <div className="font-bold text-green-900 mb-1">2. Volumetric Pump Rate (mL/hr)</div>
                                            <div className="font-mono text-xs text-green-800 bg-white p-2 rounded border border-green-200/60 mb-1.5">
                                                Infusion Rate = Total Volume (mL) ÷ Time (Hours)
                                            </div>
                                            <p className="text-[11px] text-gray-500">Programmed into electronic smart infusion pumps.</p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
                                            <div className="font-bold text-purple-900 mb-1">3. Bedside Drop Count (Seconds / Drop)</div>
                                            <div className="font-mono text-xs text-purple-800 bg-white p-2 rounded border border-purple-200/60 mb-1.5">
                                                Interval = 60 Seconds ÷ Drip Rate (gtt/min)
                                            </div>
                                            <p className="text-[11px] text-gray-500">Allows accurate roller clamp adjustment with a second-hand watch.</p>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                            <div className="font-bold text-emerald-900 mb-1">4. Drop Factor Tubing Standards</div>
                                            <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
                                                <li><strong>10 gtt/mL:</strong> Blood and thick viscous fluids</li>
                                                <li><strong>15–20 gtt/mL:</strong> Standard adult macrodrip tubing</li>
                                                <li><strong>60 gtt/mL:</strong> Microdrip (1 mL = 60 drops, mL/hr = gtt/min)</li>
                                            </ul>
                                        </div>

                                    </div>

                                    <p className="text-[11px] text-gray-400 italic pt-1">
                                        Guideline source: Infusion Nurses Society (INS) Standards of Practice & Clinical Pharmacology Nursing Manuals.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT: RESULTS, CADENCE VISUALIZER & SAFETY (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* RESULTS CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Infusion Calculations
                                    </span>
                                </div>
                                {results && (
                                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
                                        {results.velocityBadge.label}
                                    </span>
                                )}
                            </div>

                            {results ? (
                                <div className="space-y-4">

                                    {/* Primary Output Cards: Drip Rate & Flow Rate */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        {/* Gravity Drip Rate */}
                                        <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-md ring-1 ring-white/20">
                                            <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider block mb-1">
                                                Gravity Drip Rate
                                            </span>
                                            <div className="text-4xl font-black text-white">
                                                {results.dripRateRounded}
                                            </div>
                                            <div className="text-sm font-bold text-green-200 mt-0.5">
                                                gtt / min
                                            </div>
                                            <span className="text-[10px] text-blue-200 block mt-1">
                                                ({results.dripRateExact} exact)
                                            </span>
                                        </div>

                                        {/* Electronic Pump Rate */}
                                        <div className="rounded-xl bg-white/15 p-4 text-center backdrop-blur-md ring-1 ring-white/20">
                                            <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider block mb-1">
                                                Infusion Pump Rate
                                            </span>
                                            <div className="text-4xl font-black text-white">
                                                {results.infusionRateExact}
                                            </div>
                                            <div className="text-sm font-bold text-green-200 mt-0.5">
                                                mL / hr
                                            </div>
                                            <span className="text-[10px] text-blue-200 block mt-1">
                                                Volumetric flow
                                            </span>
                                        </div>

                                    </div>

                                    {/* Bedside Timing Banner: 1 drop every X seconds */}
                                    <div className="rounded-xl bg-white/20 p-3.5 backdrop-blur-md text-white border border-white/25 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                                                <Clock className="h-5 w-5 text-yellow-300" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-blue-100 font-medium">Bedside Count Cadence</div>
                                                <div className="text-sm font-extrabold text-white">
                                                    1 drop every {results.secondsPerDrop} seconds
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-[11px] text-blue-100">
                                            <div>Total Drops</div>
                                            <div className="font-bold text-white">{results.totalDrops.toLocaleString()} gtt</div>
                                        </div>
                                    </div>

                                    {/* Animated Drip Chamber Visualizer */}
                                    <div className="rounded-xl bg-black/15 p-4 backdrop-blur-sm border border-white/10 text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-2">
                                            <Droplet className="h-4 w-4 text-green-300 animate-bounce" />
                                            <span className="text-xs font-semibold text-blue-100">Drip Chamber Simulation</span>
                                        </div>

                                        {/* Droplet Metronome Visual */}
                                        <div className="flex items-center justify-center gap-2 py-2">
                                            {[0, 1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-3 w-3 rounded-full bg-green-300/80 animate-pulse shadow-sm"
                                                    style={{ animationDelay: `${i * 200}ms` }}
                                                />
                                            ))}
                                        </div>

                                        <div className="text-[11px] font-mono text-blue-100 mt-1">
                                            ({volNum} mL × {dropFactor} gtt/mL) ÷ {results.timeInMinutes} mins = {results.dripRateExact} gtt/min
                                        </div>
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-blue-900 font-bold py-3 px-4 shadow-lg hover:bg-blue-50 transition active:scale-[0.98]"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 text-green-600" />
                                                <span>Infusion Summary Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 text-blue-700" />
                                                <span>Copy Calculation Summary</span>
                                            </>
                                        )}
                                    </button>

                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <Droplet className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Please enter fluid volume and duration to calculate rates.</p>
                                </div>
                            )}
                        </div>

                        {/* QUICK AUDIT SUMMARY TABLE */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-3.5">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    Parameters Audit Breakdown
                                </h3>
                                <span className="text-[11px] text-gray-400">Live Verification</span>
                            </div>

                            <div className="space-y-2.5 text-xs text-gray-600">
                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">Fluid Volume:</span>
                                    <span className="font-semibold text-gray-900">{volNum} mL</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">Total Infusion Time:</span>
                                    <span className="font-semibold text-gray-900">
                                        {timeNum} {timeUnit} ({results ? `${results.timeInMinutes} mins` : '—'})
                                    </span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">IV Set Drop Calibration:</span>
                                    <span className="font-semibold text-blue-700">{dropFactor} drops/mL</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">Calculated Flow Speed:</span>
                                    <span className="font-semibold text-green-700">
                                        {results ? `${results.infusionRateExact} mL/hr` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MANDATORY CLINICAL SAFETY WARNING */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Nursing Safety Standards:</strong>
                                    Always practice independent double-checks with high-alert IV medications (electrolytes, vasopressors, heparin, insulin). Routinely inspect the IV insertion site for infiltration, phlebitis, or extravasation.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}