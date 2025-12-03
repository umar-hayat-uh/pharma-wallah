"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical } from 'lucide-react';

export default function NormalityCalculator() {
    // State variables for calculator inputs with proper TypeScript typing
    const [mass, setMass] = useState(''); // Mass of solute in grams
    const [equivalentWeight, setEquivalentWeight] = useState(''); // Equivalent weight in g/eq
    const [volume, setVolume] = useState(''); // Volume in liters
    const [result, setResult] = useState<{
        normality?: string;
        equivalents?: string;
        error?: string | null;
    } | null>(null); // Calculated normality result with proper TypeScript typing

    /**
     * Calculate normality using the formula: N = (mass / equivalent weight) / volume
     * Normality (N) = equivalents / volume in liters
     * Where equivalents = mass (g) / equivalent weight (g/eq)
     * 
     * Normality is the number of gram equivalents of solute per liter of solution
     */
    const calculateNormality = () => {
        // Parse input values to floats
        const massValue = parseFloat(mass);
        const equivalentWeightValue = parseFloat(equivalentWeight);
        const volumeValue = parseFloat(volume);

        // Validate inputs - check if all values are valid numbers and greater than 0
        if (
            isNaN(massValue) ||
            isNaN(equivalentWeightValue) ||
            isNaN(volumeValue) ||
            massValue <= 0 ||
            equivalentWeightValue <= 0 ||
            volumeValue <= 0
        ) {
            setResult({
                error: 'Please enter valid positive numbers for all fields'
            });
            return;
        }

        // Calculate equivalents from mass and equivalent weight
        const equivalentsValue = massValue / equivalentWeightValue;

        // Calculate normality (equivalents per liter)
        const normalityValue = equivalentsValue / volumeValue;

        // Store calculation results
        setResult({
            normality: normalityValue.toFixed(4),
            equivalents: equivalentsValue.toFixed(4),
            error: null
        });
    };

    /**
     * Reset all input fields and clear results
     */
    const handleReset = () => {
        setMass('');
        setEquivalentWeight('');
        setVolume('');
        setResult(null);
    };

    return (
        <section id="normality-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="mt-6 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Beaker className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Normality Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Calculate the normality of a solution from mass, equivalent weight, and volume
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
                                Normality (N) = (Mass / Equivalent Weight) / Volume
                            </p>
                            <p className="text-center text-xs text-blue-700 mt-2">
                                N = (g / g·eq⁻¹) / L = eq·L⁻¹
                            </p>
                            <p className="text-center text-xs text-blue-700 mt-1">
                                Equivalent Weight = Molecular Weight / n-factor
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Weight of the solute in grams
                                </p>
                            </div>

                            {/* Equivalent Weight Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Equivalent Weight (g/eq)
                                </label>
                                <input
                                    type="number"
                                    value={equivalentWeight}
                                    onChange={(e) => setEquivalentWeight(e.target.value)}
                                    placeholder="Enter equivalent weight"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Molecular weight divided by n-factor (valency/basicity/acidity)
                                </p>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Total volume of the solution in liters
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateNormality}
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

                                        {/* Normality Result */}
                                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Normality</p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {result.normality} <span className="text-lg">N</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                eq/L or equivalents per liter
                                            </p>
                                        </div>

                                        {/* Equivalents Result */}
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">Number of Equivalents</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {result.equivalents} <span className="text-base">eq</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Gram equivalents
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Information Section */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                About Normality
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                Normality (N) is a measure of concentration equal to the gram equivalent weight 
                                of solute per liter of solution. It's particularly useful in acid-base and 
                                redox titrations. The equivalent weight depends on the reaction type and is 
                                calculated by dividing molecular weight by the n-factor.
                            </p>
                            
                            <div className="bg-blue-50 rounded-lg p-4 mb-3">
                                <p className="text-xs font-semibold text-blue-800 mb-2">N-Factor Guide:</p>
                                <ul className="text-xs text-blue-700 space-y-1.5">
                                    <li>• <strong>Acids:</strong> Number of replaceable H⁺ ions (e.g., HCl = 1, H₂SO₄ = 2)</li>
                                    <li>• <strong>Bases:</strong> Number of replaceable OH⁻ ions (e.g., NaOH = 1, Ca(OH)₂ = 2)</li>
                                    <li>• <strong>Salts:</strong> Total positive or negative charge</li>
                                    <li>• <strong>Redox:</strong> Number of electrons transferred</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-green-800 mb-2">Relationship with Molarity:</p>
                                <p className="text-xs text-green-700">
                                    Normality (N) = Molarity (M) × n-factor
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}