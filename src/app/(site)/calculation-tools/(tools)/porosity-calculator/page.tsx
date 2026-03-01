"use client";
import { useState } from 'react';
import { Calculator, Box, Filter, AlertCircle, Info, PieChart, Droplet, Scale } from 'lucide-react';

export default function PorosityCalculator() {
    const [trueDensity, setTrueDensity] = useState<string>('');
    const [bulkDensity, setBulkDensity] = useState<string>('');
    const [volumeTotal, setVolumeTotal] = useState<string>('');
    const [volumeSolid, setVolumeSolid] = useState<string>('');
    const [method, setMethod] = useState<'density' | 'volume'>('density');
    const [result, setResult] = useState<{
        porosity: number;
        voidFraction: number;
        solidFraction: number;
        interpretation: string;
        classification: string;
    } | null>(null);

    const calculatePorosity = () => {
        if (method === 'density') {
            const ρ_true = parseFloat(trueDensity);
            const ρ_bulk = parseFloat(bulkDensity);

            if (isNaN(ρ_true) || isNaN(ρ_bulk) || ρ_true <= 0 || ρ_bulk <= 0) {
                alert('Please enter valid positive numbers for densities');
                return;
            }

            if (ρ_bulk > ρ_true) {
                alert('Bulk density cannot be greater than true density');
                return;
            }

            const porosity = (1 - (ρ_bulk / ρ_true)) * 100;
            calculateInterpretation(porosity);
        } else {
            const V_total = parseFloat(volumeTotal);
            const V_solid = parseFloat(volumeSolid);

            if (isNaN(V_total) || isNaN(V_solid) || V_total <= 0 || V_solid <= 0) {
                alert('Please enter valid positive numbers for volumes');
                return;
            }

            if (V_solid > V_total) {
                alert('Solid volume cannot be greater than total volume');
                return;
            }

            const porosity = ((V_total - V_solid) / V_total) * 100;
            calculateInterpretation(porosity);
        }
    };

    const calculateInterpretation = (porosity: number) => {
        const voidFraction = porosity / 100;
        const solidFraction = 1 - voidFraction;

        let interpretation = '';
        let classification = '';

        if (porosity < 10) {
            interpretation = 'Very low porosity, highly compact material.';
            classification = 'Non-porous';
        } else if (porosity < 25) {
            interpretation = 'Low porosity, well-compacted powder.';
            classification = 'Low Porosity';
        } else if (porosity < 40) {
            interpretation = 'Moderate porosity, typical for many pharmaceutical powders.';
            classification = 'Medium Porosity';
        } else if (porosity < 60) {
            interpretation = 'High porosity, good for dissolution but poor flow.';
            classification = 'High Porosity';
        } else {
            interpretation = 'Very high porosity, excellent for rapid dissolution.';
            classification = 'Very High Porosity';
        }

        setResult({
            porosity,
            voidFraction,
            solidFraction,
            interpretation,
            classification
        });
    };

    const resetCalculator = () => {
        setTrueDensity('');
        setBulkDensity('');
        setVolumeTotal('');
        setVolumeSolid('');
        setResult(null);
    };

    const sampleMaterials = [
        { name: 'Compressed Tablet', porosity: 5, method: 'density' },
        { name: 'Granules', porosity: 25, method: 'density' },
        { name: 'Powder Blend', porosity: 40, method: 'density' },
        { name: 'Porous Excipient', porosity: 60, method: 'volume' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Filter className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Porosity Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate porosity, void fraction, and solid fraction</p>
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
                                Porosity Calculation
                            </h2>

                            {/* Method Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setMethod('density')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${
                                            method === 'density'
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Density Method
                                    </button>
                                    <button
                                        onClick={() => setMethod('volume')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${
                                            method === 'volume'
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Volume Method
                                    </button>
                                </div>
                            </div>

                            {method === 'density' ? (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            <Scale className="inline w-5 h-5 mr-2" />
                                            True Density (g/mL)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={trueDensity}
                                            onChange={(e) => setTrueDensity(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 1.52"
                                        />
                                        <p className="text-sm text-gray-600 mt-2">Density excluding pores (helium pycnometry).</p>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            <Box className="inline w-5 h-5 mr-2" />
                                            Bulk Density (g/mL)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            value={bulkDensity}
                                            onChange={(e) => setBulkDensity(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="e.g., 0.65"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Total Volume (mL)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={volumeTotal}
                                            onChange={(e) => setVolumeTotal(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 100.0"
                                        />
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Solid Volume (mL)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={volumeSolid}
                                            onChange={(e) => setVolumeSolid(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="e.g., 60.0"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Quick Samples */}
                            <div className="bg-gray-50 rounded-xl p-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sample Materials</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleMaterials.map((material, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (material.method === 'density') {
                                                    setMethod('density');
                                                    setTrueDensity('1.5');
                                                    setBulkDensity(((1.5 * (100 - material.porosity)) / 100).toFixed(3));
                                                } else {
                                                    setMethod('volume');
                                                    setVolumeTotal('100');
                                                    setVolumeSolid(((100 * (100 - material.porosity)) / 100).toFixed(1));
                                                }
                                            }}
                                            className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                        >
                                            <div className="font-semibold text-blue-600">{material.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{material.porosity}%</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={calculatePorosity}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate Porosity
                                </button>
                                <button
                                    onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Results Display */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <PieChart className="w-6 h-6 mr-2 text-green-600" />
                                    Porosity Results
                                </h2>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-blue-700 mb-2">Porosity</div>
                                        <div className="text-4xl font-bold text-blue-600">
                                            {result.porosity.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-blue-600 mt-2">{result.classification}</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-green-700 mb-2">Void Fraction</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.voidFraction.toFixed(4)}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-purple-700 mb-2">Solid Fraction</div>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {result.solidFraction.toFixed(4)}
                                        </div>
                                    </div>
                                </div>

                                {/* Interpretation */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Interpretation</h3>
                                    <p className="text-gray-700">{result.interpretation}</p>
                                </div>

                                {/* Visualization */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Composition Visualization</h3>
                                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                            style={{ width: `${result.porosity}%` }}
                                        />
                                        <div
                                            className="h-full bg-gray-400 -mt-8"
                                            style={{ width: `${100 - result.porosity}%`, marginLeft: `${result.porosity}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                                        <span className="text-blue-600">Voids: {result.porosity.toFixed(1)}%</span>
                                        <span className="text-green-600">Solid: {(100 - result.porosity).toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Formulae */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                                Formulae
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-mono text-sm">ε = (1 - ρ_bulk/ρ_true) × 100%</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-mono text-sm">ε = (V_total - V_solid)/V_total × 100%</p>
                                </div>
                            </div>
                        </div>

                        {/* Significance */}
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Pharmaceutical Significance</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Affects dissolution rate</li>
                                <li>• Influences powder flow</li>
                                <li>• Impacts compression</li>
                                <li>• Affects drug loading</li>
                            </ul>
                        </div>

                        {/* Porosity Scale */}
                        <div className="bg-yellow-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Porosity Scale</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>0–10%:</span><span className="font-semibold">Very Low</span></div>
                                <div className="flex justify-between"><span>10–25%:</span><span className="font-semibold">Low</span></div>
                                <div className="flex justify-between"><span>25–40%:</span><span className="font-semibold">Medium</span></div>
                                <div className="flex justify-between"><span>40–60%:</span><span className="font-semibold">High</span></div>
                                <div className="flex justify-between"><span>60–100%:</span><span className="font-semibold">Very High</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}