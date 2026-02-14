"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Sigma,
    LineChart
} from 'lucide-react';

export default function EmaxModelCalculator() {
    const [emax, setEmax] = useState<string>('100');
    const [ec50, setEc50] = useState<string>('5');
    const [hill, setHill] = useState<string>('1');
    const [conc, setConc] = useState<string>('10');
    const [effect, setEffect] = useState<number | null>(null);

    const calculateEffect = () => {
        const Em = parseFloat(emax);
        const EC50 = parseFloat(ec50);
        const n = parseFloat(hill);
        const C = parseFloat(conc);

        if (isNaN(Em) || isNaN(EC50) || isNaN(n) || isNaN(C) || EC50 <= 0) return;

        const E = Em * (Math.pow(C, n) / (Math.pow(EC50, n) + Math.pow(C, n)));
        setEffect(E);
    };

    useEffect(() => {
        calculateEffect();
    }, [emax, ec50, hill, conc]);

    const reset = () => {
        setEmax('100');
        setEc50('5');
        setHill('1');
        setConc('10');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Emax Model Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate drug effect from concentration</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <LineChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">PK‑PD modeling</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Model Parameters
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Emax (maximal effect, %)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={emax}
                                            onChange={(e) => setEmax(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            EC₅₀ (concentration for 50% effect)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={ec50}
                                            onChange={(e) => setEc50(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hill coefficient (n)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={hill}
                                            onChange={(e) => setHill(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Drug concentration (C)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={conc}
                                            onChange={(e) => setConc(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateEffect}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Effect
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
                                Result
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">Effect (E)</div>
                                    {effect !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {effect.toFixed(1)}%
                                            </div>
                                            <div className="text-xl">of Emax</div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">Enter values</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                {effect !== null && (
                                    <>
                                        {effect < 50 && 'Below EC₅₀ – effect is less than half maximal.'}
                                        {effect >= 50 && effect < 80 && 'Therapeutic range – effect between 50% and 80% of Emax.'}
                                        {effect >= 80 && 'Near maximal effect – plateau region.'}
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