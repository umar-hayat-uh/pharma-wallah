"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    Thermometer,
    RefreshCw,
    AlertCircle,
    Sigma,
    Beaker
} from 'lucide-react';

export default function DValueCalculator() {
    const [initialCount, setInitialCount] = useState<string>('1000000');
    const [finalCount, setFinalCount] = useState<string>('1000');
    const [time, setTime] = useState<string>('10');
    const [dValue, setDValue] = useState<number | null>(null);
    const [logReduction, setLogReduction] = useState<number | null>(null);
    const [timeUnits] = useState<'minutes' | 'seconds'>('minutes');

    const calculateD = () => {
        const N0 = parseFloat(initialCount);
        const Nt = parseFloat(finalCount);
        const t = parseFloat(time);

        if (isNaN(N0) || isNaN(Nt) || isNaN(t) || N0 <= 0 || Nt <= 0 || Nt >= N0) return;

        const logRed = Math.log10(N0 / Nt);
        const D = t / logRed;

        setDValue(D);
        setLogReduction(logRed);
    };

    useEffect(() => {
        calculateD();
    }, [initialCount, finalCount, time]);

    const reset = () => {
        setInitialCount('1000000');
        setFinalCount('1000');
        setTime('10');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">D‑Value Calculator</h1>
                                <p className="text-blue-100 mt-2">Decimal reduction time for sterilization</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Sterilization validation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Microbial Reduction Data
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Initial microbial count (N₀)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={initialCount}
                                            onChange={(e) => setInitialCount(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Final microbial count (Nₜ)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={finalCount}
                                            onChange={(e) => setFinalCount(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Exposure time ({timeUnits})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Formula:</strong> D = t / log₁₀(N₀/Nₜ)
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateD}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate D‑Value
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-sm font-semibold text-blue-100">D‑Value</div>
                                    <div className="text-3xl font-bold">
                                        {dValue !== null ? dValue.toFixed(2) : '—'}
                                    </div>
                                    <div className="text-sm">{timeUnits}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-sm font-semibold mb-1">Log reduction</div>
                                    <div className="text-2xl font-bold">{logReduction !== null ? logReduction.toFixed(2) : '—'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                D‑value is the time required to reduce the microbial population by 90% (one log) under defined conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}