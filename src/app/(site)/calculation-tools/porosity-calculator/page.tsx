"use client";
import { useState } from 'react';
import { Calculator, Box, Filter, AlertCircle, Info, PieChart, Droplet } from 'lucide-react';

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
            interpretation = 'Very low porosity, highly compact material';
            classification = 'Non-porous';
        } else if (porosity >= 10 && porosity < 25) {
            interpretation = 'Low porosity, well-compacted powder';
            classification = 'Low Porosity';
        } else if (porosity >= 25 && porosity < 40) {
            interpretation = 'Moderate porosity, typical for many pharmaceutical powders';
            classification = 'Medium Porosity';
        } else if (porosity >= 40 && porosity < 60) {
            interpretation = 'High porosity, good for dissolution but poor flow';
            classification = 'High Porosity';
        } else {
            interpretation = 'Very high porosity, excellent for rapid dissolution';
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Filter className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Porosity Calculator</h1>
                            <p className="text-gray-600">Calculate porosity, void fraction, and solid fraction of pharmaceutical materials</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Porosity Calculation
                        </h2>

                        {/* Method Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMethod('density')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${method === 'density' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Density Method
                                </button>
                                <button
                                    onClick={() => setMethod('volume')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${method === 'volume' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Volume Method
                                </button>
                            </div>
                        </div>

                        {method === 'density' ? (
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        True Density (g/mL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={trueDensity}
                                        onChange={(e) => setTrueDensity(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 1.52"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Density excluding pores (helium pycnometry)</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Bulk Density (g/mL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={bulkDensity}
                                        onChange={(e) => setBulkDensity(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 0.65"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Density including pores (volumetric method)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Total Volume (mL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={volumeTotal}
                                        onChange={(e) => setVolumeTotal(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 100.0"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Total volume including pores</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Solid Volume (mL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={volumeSolid}
                                        onChange={(e) => setVolumeSolid(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 60.0"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Volume excluding pores</p>
                                </div>
                            </div>
                        )}

                        {/* Quick Samples */}
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
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
                                        <div className="text-sm text-gray-600 mt-1">
                                            Porosity: {material.porosity}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculatePorosity}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Porosity
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Porosity Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Porosity</div>
                                        <div className="text-4xl font-bold text-green-600">
                                            {result.porosity.toFixed(2)}%
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            Classification: {result.classification}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">Void Fraction</div>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {result.voidFraction.toFixed(4)}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">Solid Fraction</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {result.solidFraction.toFixed(4)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>

                                    {/* Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Composition Visualization</h4>
                                        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                                style={{ width: `${result.porosity}%` }}
                                                title={`Porosity: ${result.porosity.toFixed(1)}%`}
                                            ></div>
                                            <div 
                                                className="h-full bg-gray-300 -mt-6"
                                                style={{ width: `${100 - result.porosity}%`, marginLeft: `${result.porosity}%` }}
                                                title={`Solid: ${(100 - result.porosity).toFixed(1)}%`}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                                            <span className="text-blue-600">Voids: {result.porosity.toFixed(1)}%</span>
                                            <span className="text-green-600">Solid: {(100 - result.porosity).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formulae Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formulae</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">Density Method</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        ε = (1 - ρ_bulk/ρ_true) × 100%
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Volume Method</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        ε = (V_total - V_solid)/V_total × 100%
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-600">Void Fraction</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        φ = ε / 100
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Pharmaceutical Significance
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Affects dissolution rate of tablets</li>
                                <li>• Influences powder flow properties</li>
                                <li>• Impacts compression characteristics</li>
                                <li>• Affects drug loading capacity</li>
                                <li>• Influences stability and shelf life</li>
                                <li>• Important for controlled release systems</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Porosity Scale */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Porosity Classification Scale</h2>
                    <div className="space-y-4">
                        {[
                            { range: '0-10%', label: 'Very Low Porosity', color: 'from-blue-100 to-green-100', desc: 'Compressed tablets, dense materials' },
                            { range: '10-25%', label: 'Low Porosity', color: 'from-blue-200 to-green-200', desc: 'Well-compacted powders, granules' },
                            { range: '25-40%', label: 'Medium Porosity', color: 'from-blue-300 to-green-300', desc: 'Typical pharmaceutical powders' },
                            { range: '40-60%', label: 'High Porosity', color: 'from-blue-400 to-green-400', desc: 'Porous excipients, fast-dissolving' },
                            { range: '60-100%', label: 'Very High Porosity', color: 'from-blue-500 to-green-500', desc: 'Aerogels, highly porous carriers' },
                        ].map((item, index) => (
                            <div key={index} className={`p-4 rounded-lg bg-gradient-to-r ${item.color}`}>
                                <div className="font-semibold text-gray-800">{item.range} - {item.label}</div>
                                <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}