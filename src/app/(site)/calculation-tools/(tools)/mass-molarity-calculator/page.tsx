"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical } from 'lucide-react';

export default function MassMolarityCalculator() {
    // State variables for calculator inputs
    const [mass, setMass] = useState(''); // Mass in grams
    const [molarMass, setMolarMass] = useState(''); // Molar mass in g/mol
    const [volume, setVolume] = useState(''); // Volume in liters
    const [result, setResult] = useState<{
        molarity?: string;
        moles?: string;
        error?: string | null;
    } | null>(null); // Calculated molarity result with proper TypeScript typing

    /**
     * Calculate molarity using the formula: M = (mass / molar mass) / volume
     * Molarity (M) = moles / volume in liters
     * Where moles = mass (g) / molar mass (g/mol)
     */
    const calculateMolarity = () => {
        // Parse input values to floats
        const massValue = parseFloat(mass);
        const molarMassValue = parseFloat(molarMass);
        const volumeValue = parseFloat(volume);

        // Validate inputs - check if all values are valid numbers and greater than 0
        if (
            isNaN(massValue) ||
            isNaN(molarMassValue) ||
            isNaN(volumeValue) ||
            massValue <= 0 ||
            molarMassValue <= 0 ||
            volumeValue <= 0
        ) {
            setResult({
                error: 'Please enter valid positive numbers for all fields'
            });
            return;
        }

        // Calculate moles from mass and molar mass
        const moles = massValue / molarMassValue;

        // Calculate molarity (moles per liter)
        const molarity = moles / volumeValue;

        // Store calculation results
        setResult({
            molarity: molarity.toFixed(4),
            moles: moles.toFixed(4),
            error: null
        });
    };

    /**
     * Reset all input fields and clear results
     */
    const handleReset = () => {
        setMass('');
        setMolarMass('');
        setVolume('');
        setResult(null);
    };

    return (
        <section className='bg-gradient-to-br from-blue-50 to-green-50'>

            <div className="min-h-screen py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Beaker className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Mass Molarity Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Calculate the molarity of a solution from mass, molar mass, and volume
                        </p>
                    </div>

                    {/* Calculator Card */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Formula Display */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <FlaskConical className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="text-sm font-semibold text-blue-800">Formula</h3>
                            </div>
                            <p className="text-center text-blue-900 font-mono">
                                Molarity (M) = (Mass / Molar Mass) / Volume
                            </p>
                            <p className="text-center text-xs text-blue-700 mt-1">
                                M = (g / g·mol⁻¹) / L = mol·L⁻¹
                            </p>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-5">
                            {/* Mass Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mass of Solute (g)
                                </label>
                                <input
                                    type="number"
                                    value={mass}
                                    onChange={(e) => setMass(e.target.value)}
                                    placeholder="Enter mass in grams"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.01"
                                />
                            </div>

                            {/* Molar Mass Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Molar Mass (g/mol)
                                </label>
                                <input
                                    type="number"
                                    value={molarMass}
                                    onChange={(e) => setMolarMass(e.target.value)}
                                    placeholder="Enter molar mass"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.01"
                                />
                            </div>

                            {/* Volume Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Volume of Solution (L)
                                </label>
                                <input
                                    type="number"
                                    value={volume}
                                    onChange={(e) => setVolume(e.target.value)}
                                    placeholder="Enter volume in liters"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.001"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateMolarity}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <Calculator className="w-5 h-5 mr-2" />
                                Calculate
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Results Section */}
                        {result && (
                            <div className="mt-6">
                                {result.error ? (
                                    // Error Message Display
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-red-800 text-center font-medium">
                                            {result.error}
                                        </p>
                                    </div>
                                ) : (
                                    // Success Results Display
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                            Calculation Results
                                        </h3>

                                        {/* Molarity Result */}
                                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Molarity</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {result.molarity} <span className="text-lg">M</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                mol/L or mol·L⁻¹
                                            </p>
                                        </div>

                                        {/* Moles Result */}
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Number of Moles</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {result.moles} <span className="text-base">mol</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Information Section */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                About Molarity
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Molarity (M) is a measure of concentration expressed as moles of solute
                                per liter of solution. It's one of the most common units used in chemistry
                                to describe solution concentrations. To calculate molarity, first determine
                                the number of moles by dividing the mass by the molar mass, then divide
                                by the volume in liters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}