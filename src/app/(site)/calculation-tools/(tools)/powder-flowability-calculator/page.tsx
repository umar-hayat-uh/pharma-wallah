"use client";
import { useState } from 'react';
import { Calculator, Scale, TrendingUp, AlertCircle, Info, Droplets, Wind, Activity } from 'lucide-react';

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

        const carrsIndex = ((tapped - bulk) / tapped) * 100;
        const hausnerRatio = tapped / bulk;

        let flowability = '';
        let compressibility = '';
        let quality = '';

        if (carrsIndex < 10) {
            flowability = 'Excellent';
            compressibility = 'Very Low';
            quality = 'Excellent flow, no glidant needed.';
        } else if (carrsIndex < 15) {
            flowability = 'Good';
            compressibility = 'Low';
            quality = 'Good flow, may require minimal glidant.';
        } else if (carrsIndex < 20) {
            flowability = 'Fair';
            compressibility = 'Moderate';
            quality = 'Fair flow, may require glidant.';
        } else if (carrsIndex < 25) {
            flowability = 'Passable';
            compressibility = 'High';
            quality = 'Poor flow, requires glidant.';
        } else if (carrsIndex < 31) {
            flowability = 'Poor';
            compressibility = 'Very High';
            quality = 'Very poor flow, needs significant glidant.';
        } else {
            flowability = 'Very Poor';
            compressibility = 'Extremely High';
            quality = 'Extremely poor flow, not suitable for direct compression.';
        }

        let hausnerQuality = '';
        if (hausnerRatio < 1.2) hausnerQuality = 'Excellent flow';
        else if (hausnerRatio < 1.25) hausnerQuality = 'Good flow';
        else if (hausnerRatio < 1.4) hausnerQuality = 'Fair flow';
        else hausnerQuality = 'Poor flow';

        setResult({
            carrsIndex,
            hausnerRatio,
            flowability,
            compressibility,
            quality: `${quality} Hausner Ratio indicates: ${hausnerQuality}.`
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Wind className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Powder Flowability Index Calculator</h1>
                                <p className="text-blue-100 mt-2">Carr's Index & Hausner Ratio for powder flow assessment</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Enter Powder Density Values
                            </h2>

                            <div className="space-y-6">
                                {/* Bulk Density Input */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
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
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 0.45"
                                    />
                                </div>

                                {/* Tapped Density Input */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
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
                                        className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 0.55"
                                    />
                                </div>

                                {/* Quick Samples */}
                                <div className="bg-gray-50 rounded-xl p-6">
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
                                                    {sample.bulk} / {sample.tapped} g/mL
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateFlowability}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Flowability
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Display */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Activity className="w-6 h-6 mr-2 text-green-600" />
                                    Flowability Results
                                </h2>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-blue-700 mb-2">Carr's Index</div>
                                        <div className={`text-4xl font-bold ${
                                            result.carrsIndex < 15 ? 'text-green-600' : result.carrsIndex < 25 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {result.carrsIndex.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-blue-600 mt-2">{result.flowability}</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-green-700 mb-2">Hausner Ratio</div>
                                        <div className={`text-4xl font-bold ${
                                            result.hausnerRatio < 1.2 ? 'text-green-600' : result.hausnerRatio < 1.4 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {result.hausnerRatio.toFixed(3)}
                                        </div>
                                        <div className="text-sm text-green-600 mt-2">Target: &lt;1.25</div>
                                    </div>
                                </div>

                                {/* Interpretation */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Interpretation</h3>
                                    <p className="text-gray-700">{result.quality}</p>
                                </div>

                                {/* Flow Scale */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Flowability Scale</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <span>Carr's Index &lt;10%: Excellent</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <span>10–15%: Good</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <span>16–20%: Fair</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                            <span>21–25%: Passable</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                            <span>&gt;25%: Poor</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Formula Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                                Formulae
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-mono text-sm">Carr's Index = (ρₜ - ρᵦ)/ρₜ × 100</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-mono text-sm">Hausner Ratio = ρₜ / ρᵦ</p>
                                </div>
                                <p className="text-xs text-gray-500">ρₜ = tapped density, ρᵦ = bulk density</p>
                            </div>
                        </div>

                        {/* Applications */}
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Tablet manufacturing</li>
                                <li>• Capsule filling</li>
                                <li>• Powder blending</li>
                                <li>• Quality control</li>
                            </ul>
                        </div>

                        {/* Factors Affecting Flow */}
                        <div className="bg-yellow-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Factors Affecting Flow
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Particle size & distribution</li>
                                <li>• Particle shape & surface texture</li>
                                <li>• Moisture content</li>
                                <li>• Cohesive forces</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}