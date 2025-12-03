"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical } from 'lucide-react';

export default function MgMlMolarityCalculator() {
    // State variables for calculator inputs with proper TypeScript typing
    const [concentration, setConcentration] = useState(''); // Concentration in mg/mL
    const [molarMass, setMolarMass] = useState(''); // Molar mass in g/mol
    const [result, setResult] = useState<{
        molarity?: string;
        molarityMicro?: string;
        molarityMilli?: string;
        error?: string | null;
    } | null>(null); // Calculated molarity result with proper TypeScript typing

    /**
     * Calculate molarity from mg/mL concentration
     * Formula: Molarity (M) = (Concentration in mg/mL) / (Molar Mass in g/mol)
     * 
     * Conversion steps:
     * 1. mg/mL to g/L: multiply by 1 (since 1 mg/mL = 1 g/L)
     * 2. g/L to mol/L: divide by molar mass
     */
    const calculateMolarity = () => {
        // Parse input values to floats
        const concentrationValue = parseFloat(concentration);
        const molarMassValue = parseFloat(molarMass);

        // Validate inputs - check if all values are valid numbers and greater than 0
        if (
            isNaN(concentrationValue) ||
            isNaN(molarMassValue) ||
            concentrationValue <= 0 ||
            molarMassValue <= 0
        ) {
            setResult({
                error: 'Please enter valid positive numbers for all fields'
            });
            return;
        }

        // Convert mg/mL to g/L (1 mg/mL = 1 g/L)
        const concentrationInGperL = concentrationValue;

        // Calculate molarity: (g/L) / (g/mol) = mol/L
        const molarityValue = concentrationInGperL / molarMassValue;

        // Calculate alternative units for better readability
        const molarityInMilli = molarityValue * 1000; // millimolar (mM)
        const molarityInMicro = molarityValue * 1000000; // micromolar (μM)

        // Store calculation results
        setResult({
            molarity: molarityValue.toFixed(6),
            molarityMilli: molarityInMilli.toFixed(4),
            molarityMicro: molarityInMicro.toFixed(2),
            error: null
        });
    };

    /**
     * Reset all input fields and clear results
     */
    const handleReset = () => {
        setConcentration('');
        setMolarMass('');
        setResult(null);
    };

    return (
        <section id="mg-ml-molarity-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="mt-6 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Beaker className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                MG/ML to Molarity Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Convert concentration from mg/mL to molarity (M, mM, μM)
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
                            <p className="text-center text-blue-900 font-mono text-sm">
                                Molarity (M) = (Concentration in mg/mL) / (Molecular Weight in g/mol)
                            </p>
                            <p className="text-center text-xs text-blue-700 mt-2">
                                Note: 1 mg/mL = 1 g/L
                            </p>
                            <p className="text-center text-xs text-blue-700">
                                M = (mg/mL) / (g/mol) = (g/L) / (g/mol) = mol/L
                            </p>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-5">
                            {/* Concentration Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Concentration (mg/mL)
                                </label>
                                <input
                                    type="number"
                                    value={concentration}
                                    onChange={(e) => setConcentration(e.target.value)}
                                    placeholder="Enter concentration in mg/mL"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Also known as: mg per milliliter or milligrams per milliliter
                                </p>
                            </div>

                            {/* Molecular Weight Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Molecular Weight (g/mol)
                                </label>
                                <input
                                    type="number"
                                    value={molarMass}
                                    onChange={(e) => setMolarMass(e.target.value)}
                                    placeholder="Enter molecular weight"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Also known as molar mass (g/mol or g·mol⁻¹)
                                </p>
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

                                        {/* Molarity Result (M) */}
                                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Molarity</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {result.molarity} <span className="text-lg">M</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                mol/L or mol·L⁻¹
                                            </p>
                                        </div>

                                        {/* Millimolar Result (mM) */}
                                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Millimolar</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {result.molarityMilli} <span className="text-base">mM</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                millimol/L or mmol·L⁻¹
                                            </p>
                                        </div>

                                        {/* Micromolar Result (μM) */}
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Micromolar</p>
                                            <p className="text-2xl font-bold text-blue-500">
                                                {result.molarityMicro} <span className="text-base">μM</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                micromol/L or μmol·L⁻¹
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Information Section */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                About MG/ML to Molarity Conversion
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                Converting mg/mL to molarity is commonly needed in biochemistry and pharmacology. 
                                The key insight is that 1 mg/mL equals 1 g/L, which simplifies the calculation. 
                                Simply divide the concentration by the molar mass to get molarity.
                            </p>
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Quick Reference:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• 1 M = 1000 mM (millimolar)</li>
                                    <li>• 1 M = 1,000,000 μM (micromolar)</li>
                                    <li>• 1 mg/mL = 1 g/L</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}