"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    Thermometer,
    RefreshCw,
    AlertCircle,
    Sigma,
    Flame
} from 'lucide-react';

export default function FValueCalculator() {
    const [dValue, setDValue] = useState<string>('1.5');
    const [logReduction, setLogReduction] = useState<string>('6');
    const [fValue, setFValue] = useState<number | null>(null);
    const [timeUnits] = useState<'minutes' | 'seconds'>('minutes');

    const calculateF = () => {
        const D = parseFloat(dValue);
        const logRed = parseFloat(logReduction);

        if (isNaN(D) || isNaN(logRed) || D <= 0 || logRed <= 0) return;

        setFValue(D * logRed);
    };

    useEffect(() => {
        calculateF();
    }, [dValue, logReduction]);

    const reset = () => {
        setDValue('1.5');
        setLogReduction('6');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Flame className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">F‑Value Calculator</h1>
                                <p className="text-blue-100 mt-2">Sterilization lethality (thermal process)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Thermal process evaluation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Lethality Parameters
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            D‑value ({timeUnits})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={dValue}
                                            onChange={(e) => setDValue(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Desired log reduction
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={logReduction}
                                            onChange={(e) => setLogReduction(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Formula:</strong> F = D × log reduction
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateF}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate F‑Value
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
                                F‑Value Result
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">Sterilization lethality</div>
                                    {fValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {fValue.toFixed(2)}
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
                                F‑value is the equivalent exposure time at a reference temperature required to achieve a specified log reduction.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}