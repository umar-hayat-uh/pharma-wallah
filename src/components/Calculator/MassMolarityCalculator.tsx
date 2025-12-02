"use client";

import { useState } from 'react';
import { Beaker, Calculator, RefreshCw, Info } from 'lucide-react';

export default function MassMolarityCalculator() {
    const [mass, setMass] = useState('');
    const [molarMass, setMolarMass] = useState('');
    const [volume, setVolume] = useState('');
    const [result, setResult] = useState(null);

    const calculateMolarity = () => {
        const m = parseFloat(mass);
        const mm = parseFloat(molarMass);
        const v = parseFloat(volume);

        if (isNaN(m) || isNaN(mm) || isNaN(v) || v === 0 || mm === 0) {
            alert('Please enter valid numbers for all fields');
            return;
        }

        // Molarity (M) = (mass in grams / molar mass) / volume in liters
        const moles = m / mm;
        const molarity = moles / v;

        setResult({
            moles: moles.toFixed(4),
            molarity: molarity.toFixed(4)
        });
    };

    const reset = () => {
        setMass('');
        setMolarMass('');
        setVolume('');
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-400 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4 border-2 border-white/30 shadow-lg">
                        <Beaker className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        Mass Molarity Calculator
                    </h1>
                    <p className="text-white/90 text-lg">
                        Calculate molarity from mass, molar mass, and volume
                    </p>
                </div>

                {/* Main Calculator Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6">
                    {/* Info Box */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <strong>Formula:</strong> Molarity (M) = (mass / molar mass) / volume (L)
                            <br />
                            <strong>Units:</strong> Mass in grams, Molar Mass in g/mol, Volume in liters
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Mass (grams)
                            </label>
                            <input
                                type="number"
                                value={mass}
                                onChange={(e) => setMass(e.target.value)}
                                placeholder="Enter mass in grams"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Molar Mass (g/mol)
                            </label>
                            <input
                                type="number"
                                value={molarMass}
                                onChange={(e) => setMolarMass(e.target.value)}
                                placeholder="Enter molar mass"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-lg">
                                Volume (liters)
                            </label>
                            <input
                                type="number"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value)}
                                placeholder="Enter volume in liters"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={calculateMolarity}
                            className="flex-1  bg-primary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Calculator className="w-5 h-5" />
                            Calculate
                        </button>
                        <button
                            onClick={reset}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Reset
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="mt-8 space-y-4 animate-fade-in">
                            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 rounded-2xl p-6 border-2 border-purple-300">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Beaker className="w-6 h-6 text-purple-600" />
                                    Results
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white/80 rounded-xl p-4">
                                        <p className="text-gray-600 text-sm mb-1">Number of Moles</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {result.moles} <span className="text-lg">mol</span>
                                        </p>
                                    </div>
                                    <div className="bg-white/80 rounded-xl p-4">
                                        <p className="text-gray-600 text-sm mb-1">Molarity</p>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                                            {result.molarity} <span className="text-lg">M</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center text-white/90 text-sm">
                    <p>Made with pride 🏳️‍🌈 By Shayan Hussain for chemistry calculations</p>
                </div>
            </div>
        </div>
    );
}