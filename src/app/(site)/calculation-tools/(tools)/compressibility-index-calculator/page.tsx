"use client";
import { useState } from 'react';
import { Calculator, Compass, BarChart3, AlertCircle, Info, Layers } from 'lucide-react';

export default function CompressibilityIndexCalculator() {
    const [initialVolume, setInitialVolume] = useState<string>('');
    const [finalVolume, setFinalVolume] = useState<string>('');
    const [mass, setMass] = useState<string>('');
    const [result, setResult] = useState<{
        compressibilityIndex: number;
        bulkDensity: number;
        tappedDensity: number;
        interpretation: string;
        recommendation: string;
    } | null>(null);

    const calculateCompressibility = () => {
        const V0 = parseFloat(initialVolume);
        const Vf = parseFloat(finalVolume);
        const m = parseFloat(mass);

        if (isNaN(V0) || isNaN(Vf) || isNaN(m) || V0 <= 0 || Vf <= 0 || m <= 0) {
            alert('Please enter valid positive numbers for all fields');
            return;
        }

        if (Vf >= V0) {
            alert('Final volume must be less than initial volume after tapping');
            return;
        }

        // Calculate densities
        const bulkDensity = m / V0;
        const tappedDensity = m / Vf;
        
        // Calculate compressibility index
        const compressibilityIndex = ((V0 - Vf) / V0) * 100;

        // Interpretation
        let interpretation = '';
        let recommendation = '';

        if (compressibilityIndex < 10) {
            interpretation = 'Excellent flow properties';
            recommendation = 'Suitable for direct compression, no glidant needed';
        } else if (compressibilityIndex >= 10 && compressibilityIndex < 15) {
            interpretation = 'Good flow properties';
            recommendation = 'May require minimal glidant for consistent flow';
        } else if (compressibilityIndex >= 15 && compressibilityIndex < 20) {
            interpretation = 'Fair flow properties';
            recommendation = 'Requires glidant addition for tableting';
        } else if (compressibilityIndex >= 20 && compressibilityIndex < 25) {
            interpretation = 'Passable flow properties';
            recommendation = 'Needs significant glidant and may require granulation';
        } else if (compressibilityIndex >= 25 && compressibilityIndex < 31) {
            interpretation = 'Poor flow properties';
            recommendation = 'Granulation recommended before compression';
        } else {
            interpretation = 'Very poor flow properties';
            recommendation = 'Not suitable for direct compression methods';
        }

        setResult({
            compressibilityIndex,
            bulkDensity,
            tappedDensity,
            interpretation,
            recommendation
        });
    };

    const resetCalculator = () => {
        setInitialVolume('');
        setFinalVolume('');
        setMass('');
        setResult(null);
    };

    return ( 
        <section className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Compass className="w-10 h-10 text-orange-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Compressibility Index Calculator</h1>
                            <p className="text-gray-600">Calculate powder compressibility for pharmaceutical formulations</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Enter Measurement Values
                        </h2>

                        <div className="space-y-6">
                            {/* Mass Input */}
                            <div className="bg-orange-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-orange-800 mb-3">
                                    <Layers className="inline w-5 h-5 mr-2" />
                                    Powder Mass (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={mass}
                                    onChange={(e) => setMass(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                    placeholder="e.g., 25.0"
                                />
                            </div>

                            {/* Initial Volume Input */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Initial Bulk Volume (mL)
                                </label>
                                <p className="text-sm text-gray-600 mb-3">Volume of powder before tapping</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={initialVolume}
                                    onChange={(e) => setInitialVolume(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 50.0"
                                />
                            </div>

                            {/* Final Volume Input */}
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Final Tapped Volume (mL)
                                </label>
                                <p className="text-sm text-gray-600 mb-3">Volume of powder after standard tapping</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={finalVolume}
                                    onChange={(e) => setFinalVolume(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                    placeholder="e.g., 40.0"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateCompressibility}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Calculate Compressibility
                                </button>
                                <button
                                    onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Compressibility Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-semibold text-orange-700">Compressibility Index</span>
                                            <span className="text-2xl font-bold text-orange-600">
                                                {result.compressibilityIndex.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 font-semibold text-green-700">
                                            {result.interpretation}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-semibold text-blue-700">Bulk Density</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {result.bulkDensity.toFixed(4)} g/mL
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-semibold text-red-700">Tapped Density</span>
                                            <span className="text-xl font-bold text-red-600">
                                                {result.tappedDensity.toFixed(4)} g/mL
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Recommendation</h4>
                                        <p className="text-sm text-gray-700">{result.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interpretation Guide */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Compressibility Index Scale</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                    <span className="text-sm font-semibold">5-15%</span>
                                    <span className="text-sm">Excellent to Good Flow</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                    <span className="text-sm font-semibold">16-20%</span>
                                    <span className="text-sm">Fair Flow</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                    <span className="text-sm font-semibold">21-25%</span>
                                    <span className="text-sm">Passable Flow</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                    <span className="text-sm font-semibold">26-31%</span>
                                    <span className="text-sm">Poor Flow</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                                    <span className="text-sm font-semibold">&gt;31%</span>
                                    <span className="text-sm">Very Poor Flow</span>
                                </div>
                            </div>
                        </div>

                        {/* Information Card */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formula</h3>
                            <div className="text-center text-xl font-mono bg-white p-4 rounded-lg">
                                CI = (V₀ - Vₜ) / V₀ × 100
                            </div>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>Where:</p>
                                <p>V₀ = Initial bulk volume (mL)</p>
                                <p>Vₜ = Final tapped volume (mL)</p>
                                <p>CI = Compressibility Index (%)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Technical Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Measurement Procedure</h3>
                            <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
                                <li>Weigh 25-100g of powder accurately</li>
                                <li>Pour powder into graduated cylinder</li>
                                <li>Record initial volume (V₀)</li>
                                <li>Tap cylinder 500-1250 times</li>
                                <li>Record final volume (Vₜ)</li>
                                <li>Calculate using formula</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pharmaceutical Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Tablet compression formulation</li>
                                <li>• Capsule filling optimization</li>
                                <li>• Powder blending assessment</li>
                                <li>• Excipient selection</li>
                                <li>• Process validation</li>
                                <li>• Quality control testing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}