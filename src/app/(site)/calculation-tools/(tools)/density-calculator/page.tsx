"use client";
import { useState } from 'react';
import { Calculator, Scale, Weight, Beaker, Droplets, AlertCircle, Box } from 'lucide-react';

type DensityType = 'true' | 'bulk' | 'tapped';

export default function DensityCalculator() {
    const [densityType, setDensityType] = useState<DensityType>('true');
    const [mass, setMass] = useState<string>('');
    const [volume, setVolume] = useState<string>('');
    const [containerMass, setContainerMass] = useState<string>('');
    const [containerVolume, setContainerVolume] = useState<string>('');
    const [result, setResult] = useState<{
        density: number;
        unit: string;
        interpretation: string;
        formula: string;
    } | null>(null);

    const calculateDensity = () => {
        const m = parseFloat(mass);
        const v = parseFloat(volume);
        const cm = containerMass ? parseFloat(containerMass) : 0;
        const cv = containerVolume ? parseFloat(containerVolume) : 0;

        if (isNaN(m) || isNaN(v) || m <= 0 || v <= 0) {
            alert('Please enter valid positive numbers for mass and volume');
            return;
        }

        let density = 0;
        let unit = 'g/mL';
        let interpretation = '';
        let formula = '';

        switch (densityType) {
            case 'true':
                density = m / v;
                formula = 'ρ = m / V';
                if (density < 1) {
                    interpretation = 'Material will float on water';
                } else if (density >= 1 && density < 2) {
                    interpretation = 'Typical for many pharmaceutical powders';
                } else {
                    interpretation = 'High density material';
                }
                break;

            case 'bulk':
                if (cm > 0) {
                    density = (m - cm) / v;
                    formula = 'ρ_bulk = (m_total - m_container) / V';
                } else {
                    density = m / v;
                    formula = 'ρ_bulk = m / V';
                }
                interpretation = 'Includes void spaces between particles';
                break;

            case 'tapped':
                if (cv > 0 && v > cv) {
                    density = m / (v - cv);
                    formula = 'ρ_tapped = m / (V_total - V_container)';
                } else {
                    density = m / v;
                    formula = 'ρ_tapped = m / V';
                }
                interpretation = 'Measured after standard tapping procedure';
                break;
        }

        setResult({
            density,
            unit,
            interpretation,
            formula
        });
    };

    const resetCalculator = () => {
        setMass('');
        setVolume('');
        setContainerMass('');
        setContainerVolume('');
        setResult(null);
    };

    const sampleMaterials = [
        { name: 'Water', density: 1.0, type: 'true' },
        { name: 'Lactose', density: 1.52, type: 'true' },
        { name: 'Microcrystalline Cellulose', density: 1.5, type: 'true' },
        { name: 'Magnesium Stearate', density: 1.1, type: 'bulk' },
        { name: 'Talc', density: 2.7, type: 'true' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Scale className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Density Calculator</h1>
                            <p className="text-gray-600">Calculate True, Bulk, and Tapped Density for pharmaceutical materials</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Density Calculation
                        </h2>

                        {/* Density Type Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Density Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setDensityType('true')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${densityType === 'true' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Weight className="inline w-5 h-5 mr-2" />
                                    True Density
                                </button>
                                <button
                                    onClick={() => setDensityType('bulk')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${densityType === 'bulk' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Beaker className="inline w-5 h-5 mr-2" />
                                    Bulk Density
                                </button>
                                <button
                                    onClick={() => setDensityType('tapped')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${densityType === 'tapped' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Droplets className="inline w-5 h-5 mr-2" />
                                    Tapped Density
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Mass Input */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    <Weight className="inline w-5 h-5 mr-2" />
                                    Mass (g)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={mass}
                                    onChange={(e) => setMass(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="Enter mass in grams"
                                />
                            </div>

                            {/* Volume Input */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    <Beaker className="inline w-5 h-5 mr-2" />
                                    Volume (mL)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="Enter volume in mL"
                                />
                            </div>

                            {/* Container Mass Input (for bulk density) */}
                            {densityType === 'bulk' && (
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Container Mass (g) - Optional
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={containerMass}
                                        onChange={(e) => setContainerMass(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="Mass of empty container"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Leave blank if mass already excludes container</p>
                                </div>
                            )}

                            {/* Container Volume Input (for tapped density) */}
                            {densityType === 'tapped' && (
                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Container Volume (mL) - Optional
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={containerVolume}
                                        onChange={(e) => setContainerVolume(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="Volume of empty container"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Leave blank if volume already excludes container</p>
                                </div>
                            )}

                            {/* Quick Samples */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Common Materials Reference</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {sampleMaterials.map((material, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setDensityType(material.type as DensityType);
                                                setMass('100');
                                                setVolume((100 / material.density).toFixed(2));
                                            }}
                                            className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                        >
                                            <div className="font-semibold text-blue-600">{material.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {material.density} g/mL
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateDensity}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                                >
                                    Calculate Density
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
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">
                                            {densityType.charAt(0).toUpperCase() + densityType.slice(1)} Density
                                        </div>
                                        <div className="text-4xl font-bold text-green-600">
                                            {result.density.toFixed(4)}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            {result.unit}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Formula Used</h4>
                                        <div className="text-center text-xl font-mono bg-gray-50 p-3 rounded">
                                            {result.formula}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Density Types</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">True Density</h4>
                                    <p className="text-sm text-gray-600">Mass per unit volume excluding pores and voids</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Bulk Density</h4>
                                    <p className="text-sm text-gray-600">Mass per unit volume including pores and voids</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-600">Tapped Density</h4>
                                    <p className="text-sm text-gray-600">Bulk density after standardized tapping</p>
                                </div>
                            </div>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Pharmaceutical Applications
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Tablet formulation design</li>
                                <li>• Capsule filling optimization</li>
                                <li>• Powder flow characterization</li>
                                <li>• Blending uniformity assessment</li>
                                <li>• Packaging volume calculation</li>
                                <li>• Quality control testing</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Conversion Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Density Conversion</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Material</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">True Density (g/mL)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Bulk Density (g/mL)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Tapped Density (g/mL)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Lactose Monohydrate</td>
                                    <td className="py-3 px-4">1.52</td>
                                    <td className="py-3 px-4">0.6-0.8</td>
                                    <td className="py-3 px-4">0.7-0.9</td>
                                    <td className="py-3 px-4">Filler/Diluent</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Microcrystalline Cellulose</td>
                                    <td className="py-3 px-4">1.5</td>
                                    <td className="py-3 px-4">0.3-0.5</td>
                                    <td className="py-3 px-4">0.4-0.6</td>
                                    <td className="py-3 px-4">Binder/Filler</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Calcium Phosphate</td>
                                    <td className="py-3 px-4">2.9</td>
                                    <td className="py-3 px-4">0.8-1.2</td>
                                    <td className="py-3 px-4">1.0-1.4</td>
                                    <td className="py-3 px-4">Filler</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="py-3 px-4">Magnesium Stearate</td>
                                    <td className="py-3 px-4">1.1</td>
                                    <td className="py-3 px-4">0.2-0.4</td>
                                    <td className="py-3 px-4">0.3-0.5</td>
                                    <td className="py-3 px-4">Lubricant</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}