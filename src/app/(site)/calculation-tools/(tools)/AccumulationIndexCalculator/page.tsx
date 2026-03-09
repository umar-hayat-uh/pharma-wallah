"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Clock,
    Sigma,
    Zap
} from 'lucide-react';

export default function AccumulationIndexCalculator() {
    const [halfLife, setHalfLife] = useState<string>('24');
    const [interval, setInterval] = useState<string>('24');
    const [ke, setKe] = useState<number | null>(null);
    const [index, setIndex] = useState<number | null>(null);
    const [ssFraction, setSsFraction] = useState<number | null>(null);
    const [timeUnits] = useState<'hours' | 'days'>('hours');

    const calculate = () => {
        const t12 = parseFloat(halfLife);
        const tau = parseFloat(interval);

        if (isNaN(t12) || isNaN(tau) || t12 <= 0 || tau <= 0) return;

        const k = 0.693 / t12; // elimination rate constant [citation:1]
        const R = 1 / (1 - Math.exp(-k * tau)); // accumulation index [citation:6]
        const fraction = 1 - Math.exp(-k * tau * 4); // fraction at 4 half‑lives

        setKe(k);
        setIndex(R);
        setSsFraction(fraction * 100);
    };

    const reset = () => {
        setHalfLife('24');
        setInterval('24');
    };

    const getAccumulationCategory = (R: number) => {
        if (R < 1.2) return 'No to weak accumulation';
        if (R < 2) return 'Weak accumulation';
        if (R < 5) return 'Moderate accumulation';
        return 'Strong accumulation';
    };

    useEffect(() => {
        calculate();
    }, [halfLife, interval]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Accumulation Index Calculator</h1>
                                <p className="text-blue-100 mt-2">Predict drug accumulation with repeated dosing</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Sigma className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Multiple Dosing</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Dosing Parameters
                            </h2>

                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Elimination half‑life (t½, {timeUnits})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={halfLife}
                                            onChange={(e) => setHalfLife(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Dosing interval (τ, {timeUnits})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={interval}
                                            onChange={(e) => setInterval(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-700">
                                        <strong>Formula:</strong> Accumulation index R = 1 / (1 – e<sup>-k·τ</sup>), where k = 0.693 / t½ [citation:6]
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                    <button onClick={calculate}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                        Calculate
                                    </button>
                                    <button onClick={reset}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-sm font-semibold text-blue-100">Accumulation Index (R)</div>
                                    <div className="text-3xl font-bold">{index !== null ? index.toFixed(2) : '—'}</div>
                                    {index !== null && (
                                        <div className="text-sm mt-2 text-blue-100">
                                            {getAccumulationCategory(index)}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-sm font-semibold mb-1">Elimination rate constant (k)</div>
                                    <div className="text-xl font-bold">{ke !== null ? ke.toFixed(3) : '—'} {timeUnits}⁻¹</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-sm font-semibold mb-1">Steady state reached</div>
                                    <div className="text-xl font-bold">{ssFraction !== null ? ssFraction.toFixed(1) : '—'}%</div>
                                    <div className="text-xs mt-1">after 4 half‑lives</div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Note */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Clinical Implications
                            </h3>
                            <p className="text-sm text-gray-700">
                                {index !== null && (
                                    <>
                                        {index < 1.2 && 'Minimal accumulation – suitable for once‑daily dosing.'}
                                        {index >= 1.2 && index < 2 && 'Weak accumulation – monitor for side effects.'}
                                        {index >= 2 && index < 5 && 'Moderate accumulation – consider dose adjustment.'}
                                        {index >= 5 && 'Strong accumulation – risk of toxicity, TDM recommended.'}
                                    </>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Per systematic review of 122 studies [citation:6]</p>
                        </div>

                        {/* Accumulation Scale */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Accumulation Scale</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>R &lt; 1.2</span> <span className="font-semibold text-green-600">No to weak</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>1.2 ≤ R &lt; 2</span> <span className="font-semibold text-yellow-600">Weak</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>2 ≤ R &lt; 5</span> <span className="font-semibold text-orange-600">Moderate</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>R ≥ 5</span> <span className="font-semibold text-red-600">Strong</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}