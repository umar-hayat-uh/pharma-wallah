"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    RefreshCw,
    AlertCircle,
    Sigma,
    Minimize2
} from 'lucide-react';

export default function LogReductionCalculator() {
    const [initialCount, setInitialCount] = useState<string>('1000000');
    const [finalCount, setFinalCount] = useState<string>('100');
    const [logReduction, setLogReduction] = useState<number | null>(null);
    const [percentReduction, setPercentReduction] = useState<number | null>(null);

    const calculate = () => {
        const N0 = parseFloat(initialCount);
        const Nt = parseFloat(finalCount);

        if (isNaN(N0) || isNaN(Nt) || N0 <= 0 || Nt <= 0 || Nt > N0) return;

        const logRed = Math.log10(N0 / Nt);
        const percent = (1 - Nt / N0) * 100;

        setLogReduction(logRed);
        setPercentReduction(percent);
    };

    useEffect(() => {
        calculate();
    }, [initialCount, finalCount]);

    const reset = () => {
        setInitialCount('1000000');
        setFinalCount('100');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Minimize2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Log Reduction Calculator</h1>
                                <p className="text-blue-100 mt-2">Measure microbial reduction efficiency</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Sigma className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Disinfection efficiency</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Microbial Counts
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Initial microbial count (CFU)
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
                                            Final microbial count (CFU)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={finalCount}
                                            onChange={(e) => setFinalCount(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Formula:</strong> Log reduction = log₁₀(N₀/Nₜ)
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculate}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate
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
                                    <div className="text-sm font-semibold text-blue-100">Log reduction</div>
                                    <div className="text-3xl font-bold">
                                        {logReduction !== null ? logReduction.toFixed(2) : '—'}
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-sm font-semibold mb-1">Percent reduction</div>
                                    <div className="text-2xl font-bold">
                                        {percentReduction !== null ? percentReduction.toFixed(2) : '—'}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                {logReduction !== null && (
                                    <>
                                        {logReduction < 3 && 'Low reduction – insufficient for disinfection.'}
                                        {logReduction >= 3 && logReduction < 5 && 'Moderate reduction – acceptable for some applications.'}
                                        {logReduction >= 5 && 'High reduction – meets sterilization criteria.'}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}