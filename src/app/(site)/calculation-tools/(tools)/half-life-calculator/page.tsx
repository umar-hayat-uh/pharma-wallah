"use client";
import { useState, useEffect } from 'react';
import {
    Clock,
    Calculator,
    Activity,
    TrendingDown,
    Zap,
    RefreshCw,
    AlertCircle,
    PieChart,
    Timer
} from 'lucide-react';

type HalfLifeMethod = 'ke' | 'clearance' | 'fraction';

export default function HalfLifeCalculator() {
    const [method, setMethod] = useState<HalfLifeMethod>('ke');
    const [eliminationConstant, setEliminationConstant] = useState<string>('0.1');
    const [clearance, setClearance] = useState<string>('5');
    const [volume, setVolume] = useState<string>('50');
    const [initialConcentration, setInitialConcentration] = useState<string>('100');
    const [remainingConcentration, setRemainingConcentration] = useState<string>('50');
    const [timeElapsed, setTimeElapsed] = useState<string>('6');
    const [halfLife, setHalfLife] = useState<number | null>(null);
    const [eliminationRate, setEliminationRate] = useState<number | null>(null);
    const [timeUnits, setTimeUnits] = useState<'hours' | 'minutes' | 'days'>('hours');
    const [concentrationUnits, setConcentrationUnits] = useState<'mg/L' | 'mcg/mL' | 'ng/mL'>('mg/L');

    const calculateHalfLife = () => {
        let tHalf = 0;

        switch (method) {
            case 'ke':
                const ke = parseFloat(eliminationConstant);
                if (!isNaN(ke) && ke > 0) {
                    tHalf = 0.693 / ke;
                }
                break;

            case 'clearance':
                const cl = parseFloat(clearance);
                const vd = parseFloat(volume);
                if (!isNaN(cl) && !isNaN(vd) && cl > 0 && vd > 0) {
                    const keCalc = cl / vd;
                    tHalf = 0.693 / keCalc;
                    setEliminationRate(keCalc);
                }
                break;

            case 'fraction':
                const c0 = parseFloat(initialConcentration);
                const ct = parseFloat(remainingConcentration);
                const t = parseFloat(timeElapsed);

                if (!isNaN(c0) && !isNaN(ct) && !isNaN(t) && c0 > 0 && ct > 0 && t > 0 && ct < c0) {
                    const keCalc = (Math.log(c0) - Math.log(ct)) / t;
                    tHalf = 0.693 / keCalc;
                    setEliminationRate(keCalc);
                }
                break;
        }

        // Convert units if needed
        if (timeUnits === 'minutes') {
            tHalf *= 60;
        } else if (timeUnits === 'days') {
            tHalf /= 24;
        }

        setHalfLife(tHalf);
    };

    const resetCalculator = () => {
        setEliminationConstant('0.1');
        setClearance('5');
        setVolume('50');
        setInitialConcentration('100');
        setRemainingConcentration('50');
        setTimeElapsed('6');
        setHalfLife(null);
        setEliminationRate(null);
    };

    const sampleDrugs = [
        { name: 'Aspirin', t12: '0.25', ke: '2.77', cl: '15', vd: '11' },
        { name: 'Propranolol', t12: '4', ke: '0.173', cl: '60', vd: '280' },
        { name: 'Digoxin', t12: '36', ke: '0.019', cl: '6.6', vd: '440' },
        { name: 'Gentamicin', t12: '2', ke: '0.346', cl: '4.3', vd: '18' },
        { name: 'Warfarin', t12: '40', ke: '0.017', cl: '0.2', vd: '10' },
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setMethod('ke');
        setEliminationConstant(drug.ke);
        setClearance(drug.cl);
        setVolume(drug.vd);

        // Calculate approximate concentrations for fraction method
        const c0 = 100;
        const t = parseFloat(drug.t12);
        const ke = parseFloat(drug.ke);
        const ct = c0 * Math.exp(-ke * t);

        setInitialConcentration(c0.toString());
        setRemainingConcentration(ct.toFixed(2));
        setTimeElapsed(drug.t12);
    };

    const getHalfLifeInterpretation = (t12: number) => {
        if (t12 < 1) return 'Very short half-life - frequent dosing required';
        if (t12 < 6) return 'Short half-life - multiple daily doses';
        if (t12 < 24) return 'Intermediate half-life - once or twice daily dosing';
        if (t12 < 48) return 'Long half-life - once daily dosing';
        return 'Very long half-life - less frequent dosing possible';
    };

    useEffect(() => {
        calculateHalfLife();
    }, [method, eliminationConstant, clearance, volume, initialConcentration, remainingConcentration, timeElapsed, timeUnits]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Half-Life Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate drug elimination half-life using multiple methods</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Timer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Elimination Kinetics</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Method Selection */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Calculation Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setMethod('ke')}
                                    className={`p-4 rounded-xl transition-all ${method === 'ke' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <TrendingDown className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Using kₑ</span>
                                        <span className="text-sm mt-1">t½ = 0.693/kₑ</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('clearance')}
                                    className={`p-4 rounded-xl transition-all ${method === 'clearance' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Using Cl & Vd</span>
                                        <span className="text-sm mt-1">t½ = (0.693 × Vd)/Cl</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('fraction')}
                                    className={`p-4 rounded-xl transition-all ${method === 'fraction' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <PieChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From Concentration</span>
                                        <span className="text-sm mt-1">t½ = (t × 0.693)/ln(C₀/Cₜ)</span>
                                    </div>
                                </button>
                            </div>

                            {/* Calculation Inputs */}
                            <div className="space-y-6">
                                {/* Units Selection */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Time Units</label>
                                            <select
                                                value={timeUnits}
                                                onChange={(e) => setTimeUnits(e.target.value as any)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="hours">Hours</option>
                                                <option value="minutes">Minutes</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Concentration Units</label>
                                            <select
                                                value={concentrationUnits}
                                                onChange={(e) => setConcentrationUnits(e.target.value as any)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="mg/L">mg/L</option>
                                                <option value="mcg/mL">μg/mL</option>
                                                <option value="ng/mL">ng/mL</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs based on method */}
                                {method === 'ke' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
                                            Elimination Rate Constant (kₑ)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    kₑ (h⁻¹)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={eliminationConstant}
                                                    onChange={(e) => setEliminationConstant(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 0.1"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Formula</div>
                                                    <div className="font-mono text-sm mt-1">t½ = 0.693 ÷ kₑ</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === 'clearance' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-green-600" />
                                            Clearance & Volume Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Clearance (L/h)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={clearance}
                                                    onChange={(e) => setClearance(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Volume of Distribution (L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={volume}
                                                    onChange={(e) => setVolume(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === 'fraction' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                                            Concentration-Time Data
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Initial C₀ ({concentrationUnits})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={initialConcentration}
                                                    onChange={(e) => setInitialConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Final Cₜ ({concentrationUnits})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={remainingConcentration}
                                                    onChange={(e) => setRemainingConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Time Elapsed ({timeUnits})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={timeElapsed}
                                                    onChange={(e) => setTimeElapsed(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sample Drugs */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {sampleDrugs.map((drug, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{drug.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    t½: {drug.t12}h
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateHalfLife}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Half-Life
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Half-Life Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Clock className="w-7 h-7 mr-3" />
                                Half-Life Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Elimination Half-Life (t½)
                                    </div>
                                    {halfLife !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {halfLife.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {timeUnits}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Results */}
                            {eliminationRate !== null && (
                                <div className="bg-white/10 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Elimination Rate Constant (kₑ)</div>
                                        <div className="text-2xl font-bold">{eliminationRate.toFixed(4)} h⁻¹</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        {halfLife !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Interpretation
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getHalfLifeInterpretation(halfLife)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Time to 90% eliminated:</span>
                                            <span className="font-semibold">{(halfLife * 3.32).toFixed(1)} {timeUnits}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Time to 99% eliminated:</span>
                                            <span className="font-semibold">{(halfLife * 6.64).toFixed(1)} {timeUnits}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Elimination Visualizer */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Elimination Pattern</h3>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className="flex items-center">
                                        <div className="w-16 text-sm text-gray-600">
                                            {num} × t½
                                        </div>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-green-400"
                                                style={{ width: `${100 * Math.pow(0.5, num)}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-16 text-right text-sm font-semibold">
                                            {Math.round(100 * Math.pow(0.5, num))}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Steady State</span>
                                    <span className="font-semibold text-blue-600">~4-5 × t½</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Loading Dose</span>
                                    <span className="font-semibold text-green-600">Based on Vd</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Dosing Interval</span>
                                    <span className="font-semibold text-purple-600">~1 × t½</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pharmacokinetic Relationships */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Pharmacokinetic Relationships</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Elimination Rate Constant (kₑ)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• kₑ = 0.693 ÷ t½</p>
                                <p>• kₑ = Cl ÷ Vd</p>
                                <p>• Units: time⁻¹ (h⁻¹)</p>
                                <p>• Represents fraction eliminated per unit time</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3">Clearance (Cl)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Volume of plasma cleared per unit time</p>
                                <p>• Cl = kₑ × Vd</p>
                                <p>• Units: volume/time (L/h)</p>
                                <p>• Independent of concentration for first-order kinetics</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3">Volume of Distribution (Vd)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Apparent distribution volume</p>
                                <p>• Vd = Dose ÷ C₀</p>
                                <p>• Vd = Cl ÷ kₑ</p>
                                <p>• Theoretical, not physiological volume</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}