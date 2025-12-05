"use client";
import { useState } from 'react';
import { Calculator, Scale, TrendingUp, AlertCircle, Info, Droplets, Wind } from 'lucide-react';

export default function PowderFlowabilityCalculator() {
    const [bulkDensity, setBulkDensity] = useState<string>('');
    const [tappedDensity, setTappedDensity] = useState<string>('');
    const [result, setResult] = useState<{
        carrsIndex: number;
        hausnerRatio: number;
        flowability: string;
        compressibility: string;
        quality: string;
    } | null>(null);

    const calculateFlowability = () => {
        const bulk = parseFloat(bulkDensity);
        const tapped = parseFloat(tappedDensity);

        if (isNaN(bulk) || isNaN(tapped) || bulk <= 0 || tapped <= 0) {
            alert('Please enter valid positive numbers for both densities');
            return;
        }

        if (bulk >= tapped) {
            alert('Bulk density must be less than tapped density');
            return;
        }

        // Calculate Carr's Index
        const carrsIndex = ((tapped - bulk) / tapped) * 100;
        
        // Calculate Hausner Ratio
        const hausnerRatio = tapped / bulk;

        // Determine flowability based on Carr's Index
        let flowability = '';
        let compressibility = '';
        let quality = '';

        if (carrsIndex < 10) {
            flowability = 'Excellent';
            compressibility = 'Very Low';
            quality = 'Excellent flow, requires no glidant';
        } else if (carrsIndex >= 10 && carrsIndex < 15) {
            flowability = 'Good';
            compressibility = 'Low';
            quality = 'Good flow, may require minimal glidant';
        } else if (carrsIndex >= 15 && carrsIndex < 20) {
            flowability = 'Fair';
            compressibility = 'Moderate';
            quality = 'Fair flow, may require glidant';
        } else if (carrsIndex >= 20 && carrsIndex < 25) {
            flowability = 'Passable';
            compressibility = 'High';
            quality = 'Poor flow, requires glidant';
        } else if (carrsIndex >= 25 && carrsIndex < 31) {
            flowability = 'Poor';
            compressibility = 'Very High';
            quality = 'Very poor flow, needs significant glidant';
        } else {
            flowability = 'Very Poor';
            compressibility = 'Extremely High';
            quality = 'Extremely poor flow, not suitable for direct compression';
        }

        // Determine based on Hausner Ratio
        let hausnerQuality = '';
        if (hausnerRatio < 1.2) {
            hausnerQuality = 'Excellent flow';
        } else if (hausnerRatio >= 1.2 && hausnerRatio < 1.25) {
            hausnerQuality = 'Good flow';
        } else if (hausnerRatio >= 1.25 && hausnerRatio < 1.4) {
            hausnerQuality = 'Fair flow';
        } else {
            hausnerQuality = 'Poor flow';
        }

        setResult({
            carrsIndex,
            hausnerRatio,
            flowability,
            compressibility,
            quality: `${quality}. Hausner Ratio indicates: ${hausnerQuality}`
        });
    };

    const resetCalculator = () => {
        setBulkDensity('');
        setTappedDensity('');
        setResult(null);
    };

    const sampleValues = [
        { bulk: 0.45, tapped: 0.55, label: 'Excellent Flow' },
        { bulk: 0.50, tapped: 0.60, label: 'Good Flow' },
        { bulk: 0.40, tapped: 0.55, label: 'Poor Flow' },
        { bulk: 0.35, tapped: 0.50, label: 'Very Poor Flow' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Wind className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Powder Flowability Index Calculator</h1>
                            <p className="text-gray-600">Calculate Carr's Index & Hausner Ratio for powder flow assessment</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Enter Powder Density Values
                        </h2>

                        <div className="space-y-6">
                            {/* Bulk Density Input */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    <Scale className="inline w-5 h-5 mr-2" />
                                    Bulk Density (g/mL)
                                </label>
                                <p className="text-sm text-gray-600 mb-3">Mass of powder divided by its bulk volume</p>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={bulkDensity}
                                    onChange={(e) => setBulkDensity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 0.45"
                                />
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <Info className="w-4 h-4 mr-1" />
                                    Typically ranges from 0.3 to 0.8 g/mL
                                </div>
                            </div>

                            {/* Tapped Density Input */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    <Droplets className="inline w-5 h-5 mr-2" />
                                    Tapped Density (g/mL)
                                </label>
                                <p className="text-sm text-gray-600 mb-3">Mass of powder divided by its tapped volume</p>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={tappedDensity}
                                    onChange={(e) => setTappedDensity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 0.55"
                                />
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <Info className="w-4 h-4 mr-1" />
                                    Should be higher than bulk density
                                </div>
                            </div>

                            {/* Quick Samples */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Samples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleValues.map((sample, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setBulkDensity(sample.bulk.toString());
                                                setTappedDensity(sample.tapped.toString());
                                            }}
                                            className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                        >
                                            <div className="font-semibold text-blue-600">{sample.label}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Bulk: {sample.bulk} g/mL
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Tapped: {sample.tapped} g/mL
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateFlowability}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                                >
                                    Calculate Flowability
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
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-semibold text-blue-700">Carr's Index</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {result.carrsIndex.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Flowability: <span className="font-semibold text-green-700">{result.flowability}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Compressibility: <span className="font-semibold">{result.compressibility}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-lg font-semibold text-green-700">Hausner Ratio</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {result.hausnerRatio.toFixed(3)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {result.quality}
                                        </div>
                                    </div>
                                </div>

                                {/* Interpretation Guide */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Interpretation Guide</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <span>Carr's Index &lt; 10%: Excellent flow</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <span>Carr's Index 10-15%: Good flow</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <span>Carr's Index 16-20%: Fair flow</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                            <span>Carr's Index 21-25%: Passable flow</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                            <span>Carr's Index &gt; 25%: Poor flow</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">About Powder Flowability</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>
                                    <strong>Carr's Index (%)</strong> measures powder compressibility:
                                </p>
                                <p className="font-mono bg-gray-50 p-2 rounded">
                                    Carr's Index = (Tapped Density - Bulk Density) / Tapped Density × 100
                                </p>
                                <p>
                                    <strong>Hausner Ratio</strong> indicates flow properties:
                                </p>
                                <p className="font-mono bg-gray-50 p-2 rounded">
                                    Hausner Ratio = Tapped Density / Bulk Density
                                </p>
                                <p className="mt-4">
                                    <strong>Applications:</strong> Tablet manufacturing, capsule filling, powder blending, and powder characterization in pharmaceuticals.
                                </p>
                            </div>
                        </div>

                        {/* Factors Affecting Flow */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Factors Affecting Powder Flow
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Particle size and distribution</li>
                                <li>• Particle shape and surface texture</li>
                                <li>• Moisture content</li>
                                <li>• Cohesive forces</li>
                                <li>• Electrostatic charges</li>
                                <li>• Storage conditions</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Formulae Section */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Formulae & Calculations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3">Carr's Index Formula</h3>
                            <div className="text-center text-2xl font-mono bg-white p-4 rounded-lg">
                                CI = (ρₜ - ρᵦ) / ρₜ × 100
                            </div>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>Where:</p>
                                <p>ρₜ = Tapped Density (g/mL)</p>
                                <p>ρᵦ = Bulk Density (g/mL)</p>
                                <p>CI = Carr's Index (%)</p>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-800 mb-3">Hausner Ratio Formula</h3>
                            <div className="text-center text-2xl font-mono bg-white p-4 rounded-lg">
                                HR = ρₜ / ρᵦ
                            </div>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>Where:</p>
                                <p>ρₜ = Tapped Density (g/mL)</p>
                                <p>ρᵦ = Bulk Density (g/mL)</p>
                                <p>HR = Hausner Ratio (unitless)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Standards Reference */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Industry Standards & References</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800 mb-2">USP Standards</h4>
                            <p className="text-sm text-gray-600">Chapter &lt;1174&gt; Powder Flow</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800 mb-2">Pharmaceutical Application</h4>
                            <p className="text-sm text-gray-600">Tablet compression, capsule filling</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800 mb-2">Measurement Method</h4>
                            <p className="text-sm text-gray-600">Volumetric method using graduated cylinder</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}