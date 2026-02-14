"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    Clock,
    RefreshCw,
    AlertCircle,
    Sigma,
    Timer
} from 'lucide-react';

export default function MeanResidenceTimeCalculator() {
    const [method, setMethod] = useState<'halfLife' | 'aucAumc'>('halfLife');
    const [halfLife, setHalfLife] = useState<string>('24');
    const [auc, setAuc] = useState<string>('100');
    const [aumc, setAumc] = useState<string>('2400');
    const [mrt, setMrt] = useState<number | null>(null);
    const [timeUnits] = useState<'hours' | 'minutes' | 'days'>('hours');

    const calculateMRT = () => {
        if (method === 'halfLife') {
            const t12 = parseFloat(halfLife);
            if (!isNaN(t12) && t12 > 0) {
                // For one‑compartment model: MRT = 1.44 * t½
                setMrt(1.44 * t12);
            }
        } else {
            const aucVal = parseFloat(auc);
            const aumcVal = parseFloat(aumc);
            if (!isNaN(aucVal) && !isNaN(aumcVal) && aucVal > 0) {
                setMrt(aumcVal / aucVal);
            }
        }
    };

    useEffect(() => {
        calculateMRT();
    }, [method, halfLife, auc, aumc]);

    const reset = () => {
        setHalfLife('24');
        setAuc('100');
        setAumc('2400');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Timer className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Mean Residence Time Calculator</h1>
                                <p className="text-blue-100 mt-2">Average time a drug molecule stays in the body</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Sigma className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Drug persistence</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Calculation Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setMethod('halfLife')}
                                    className={`p-4 rounded-xl transition-all ${method === 'halfLife'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Clock className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From half‑life</span>
                                        <span className="text-xs mt-1">MRT = 1.44 × t½</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setMethod('aucAumc')}
                                    className={`p-4 rounded-xl transition-all ${method === 'aucAumc'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From AUC & AUMC</span>
                                        <span className="text-xs mt-1">MRT = AUMC / AUC</span>
                                    </div>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {method === 'halfLife' ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Elimination half‑life (t½, {timeUnits})
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={halfLife}
                                            onChange={(e) => setHalfLife(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                AUC (area under curve)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={auc}
                                                onChange={(e) => setAuc(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                AUMC (area under moment curve)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={aumc}
                                                onChange={(e) => setAumc(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateMRT}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate MRT
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
                                <Clock className="w-7 h-7 mr-3" />
                                MRT Result
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">Mean Residence Time</div>
                                    {mrt !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {mrt.toFixed(2)}
                                            </div>
                                            <div className="text-2xl">{timeUnits}</div>
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
                                Note
                            </h3>
                            <p className="text-sm text-gray-700">
                                MRT represents the average total time a drug molecule spends in the body. For a one‑compartment model, MRT ≈ 1.44 × t½.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}