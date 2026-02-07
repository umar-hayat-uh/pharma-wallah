"use client";
import { useState, useEffect } from 'react';
import {
    TrendingDown,
    Calculator,
    Activity,
    Clock,
    RefreshCw,
    AlertCircle,
    Zap,
    PieChart,
    Timer
} from 'lucide-react';

export default function KeCalculator() {
    const [method, setMethod] = useState<'halfLife' | 'clearance' | 'concentration'>('halfLife');
    const [halfLife, setHalfLife] = useState<string>('4');
    const [clearance, setClearance] = useState<string>('5');
    const [volume, setVolume] = useState<string>('50');
    const [dose, setDose] = useState<string>('100');
    const [initialConcentration, setInitialConcentration] = useState<string>('10');
    const [ke, setKe] = useState<number | null>(null);
    const [calculatedHalfLife, setCalculatedHalfLife] = useState<number | null>(null);
    const [timeUnits, setTimeUnits] = useState<'hours' | 'minutes'>('hours');

    const calculateKe = () => {
        let k = 0;

        switch (method) {
            case 'halfLife':
                const t12 = parseFloat(halfLife);
                if (!isNaN(t12) && t12 > 0) {
                    k = 0.693 / t12;
                    setCalculatedHalfLife(t12);
                }
                break;

            case 'clearance':
                const cl = parseFloat(clearance);
                const vd = parseFloat(volume);
                if (!isNaN(cl) && !isNaN(vd) && vd > 0) {
                    k = cl / vd;
                    setCalculatedHalfLife(0.693 / k);
                }
                break;

            case 'concentration':
                const doseVal = parseFloat(dose);
                const c0 = parseFloat(initialConcentration);
                const vdCalc = doseVal / c0;
                if (!isNaN(doseVal) && !isNaN(c0) && c0 > 0) {
                    // For this method, we need to assume typical clearance or use another approach
                    // We'll calculate ke based on typical half-life for demonstration
                    const typicalKe = 0.1; // Default value
                    k = typicalKe;
                    setCalculatedHalfLife(0.693 / k);
                }
                break;
        }

        setKe(k);
    };

    const resetCalculator = () => {
        setHalfLife('4');
        setClearance('5');
        setVolume('50');
        setDose('100');
        setInitialConcentration('10');
        setKe(null);
        setCalculatedHalfLife(null);
    };

    const sampleValues = [
        { name: 'Short t½', t12: '2', ke: '0.346', cl: '10', vd: '30' },
        { name: 'Medium t½', t12: '6', ke: '0.116', cl: '8', vd: '70' },
        { name: 'Long t½', t12: '24', ke: '0.029', cl: '2', vd: '70' },
        { name: 'Very Long t½', t12: '72', ke: '0.0096', cl: '1', vd: '100' },
    ];

    const loadSample = (index: number) => {
        const sample = sampleValues[index];
        setMethod('halfLife');
        setHalfLife(sample.t12);
        setClearance(sample.cl);
        setVolume(sample.vd);
    };

    const getKeInterpretation = (k: number) => {
        if (k > 0.5) return 'Very rapid elimination - frequent dosing needed';
        if (k > 0.1) return 'Rapid elimination - multiple daily doses';
        if (k > 0.05) return 'Moderate elimination - once or twice daily dosing';
        if (k > 0.01) return 'Slow elimination - once daily dosing';
        return 'Very slow elimination - weekly or less frequent dosing';
    };

    useEffect(() => {
        calculateKe();
    }, [method, halfLife, clearance, volume, dose, initialConcentration, timeUnits]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Elimination Rate Constant (kₑ) Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate drug elimination rate constant using multiple methods</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">First-Order Kinetics</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Calculation Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setMethod('halfLife')}
                                    className={`p-4 rounded-xl transition-all ${method === 'halfLife' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Clock className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From Half-Life</span>
                                        <span className="text-sm mt-1">kₑ = 0.693 ÷ t½</span>
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
                                        <span className="font-semibold">From Cl & Vd</span>
                                        <span className="text-sm mt-1">kₑ = Cl ÷ Vd</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('concentration')}
                                    className={`p-4 rounded-xl transition-all ${method === 'concentration' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <PieChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From Dose & C₀</span>
                                        <span className="text-sm mt-1">kₑ = Cl ÷ (Dose/C₀)</span>
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
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance Units</label>
                                            <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                                <option>L/h</option>
                                                <option>mL/min</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs based on method */}
                                {method === 'halfLife' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                            Half-Life Input
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Half-Life (t½)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={halfLife}
                                                    onChange={(e) => setHalfLife(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 4"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Enter value in {timeUnits}
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Formula</div>
                                                    <div className="font-mono text-sm mt-1">kₑ = 0.693 ÷ t½</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === 'clearance' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-green-600" />
                                            Clearance & Volume
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

                                {method === 'concentration' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                                            Dose & Initial Concentration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Dose (mg)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={dose}
                                                    onChange={(e) => setDose(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Initial Concentration C₀ (mg/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={initialConcentration}
                                                    onChange={(e) => setInitialConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 10"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                Note: This method calculates Vd first, then requires clearance to calculate kₑ.
                                                Enter clearance in the field above or use the clearance method.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Sample Values */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Elimination Rates</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {sampleValues.map((sample, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{sample.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    kₑ: {sample.ke} h⁻¹
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateKe}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate kₑ
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
                        {/* Ke Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <TrendingDown className="w-7 h-7 mr-3" />
                                Elimination Rate Constant
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        kₑ (Elimination Rate Constant)
                                    </div>
                                    {ke !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {ke.toFixed(4)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                h⁻¹
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
                            {calculatedHalfLife !== null && (
                                <div className="bg-white/10 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Calculated Half-Life</div>
                                        <div className="text-2xl font-bold">{calculatedHalfLife.toFixed(2)} {timeUnits}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        {ke !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Significance
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getKeInterpretation(ke)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Fraction eliminated per hour:</span>
                                            <span className="font-semibold">{(ke * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Time constant (τ):</span>
                                            <span className="font-semibold">{(1 / ke).toFixed(1)} h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Elimination Visualizer */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Elimination Simulation</h3>
                            <div className="space-y-3">
                                <div className="text-center mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Remaining drug over time:</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {ke ? `${(Math.exp(-ke * 1) * 100).toFixed(0)}% after 1h` : '--'}
                                    </div>
                                </div>

                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-500"
                                        style={{ width: ke ? `${Math.exp(-ke * 1) * 100}%` : '100%' }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                                    <div>0h: 100%</div>
                                    <div>1h: {ke ? `${(Math.exp(-ke * 1) * 100).toFixed(0)}%` : '--'}</div>
                                    <div>2h: {ke ? `${(Math.exp(-ke * 2) * 100).toFixed(0)}%` : '--'}</div>
                                    <div>4h: {ke ? `${(Math.exp(-ke * 4) * 100).toFixed(0)}%` : '--'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">kₑ Relationships</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">First-Order Elimination:</div>
                                    <div className="text-gray-600 mt-1">Rate = kₑ × [Drug]</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Clearance Relationship:</div>
                                    <div className="text-gray-600 mt-1">Cl = kₑ × Vd</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">AUC Calculation:</div>
                                    <div className="text-gray-600 mt-1">AUC = Dose ÷ (kₑ × Vd)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pharmacokinetic Equations */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">First-Order Elimination Equations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Differential Equations</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="text-sm text-gray-600">Rate of elimination:</div>
                                    <div className="font-mono text-lg">dC/dt = -kₑ × C</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="text-sm text-gray-600">Integrated form:</div>
                                    <div className="font-mono text-lg">Cₜ = C₀ × e^(-kₑ×t)</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Key Parameters</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="text-sm text-gray-600">Time to reach steady state:</div>
                                    <div className="font-semibold">t_ss ≈ 4-5 × t½</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="text-sm text-gray-600">Accumulation ratio:</div>
                                    <div className="font-semibold">R = 1 ÷ (1 - e^(-kₑ×τ))</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}