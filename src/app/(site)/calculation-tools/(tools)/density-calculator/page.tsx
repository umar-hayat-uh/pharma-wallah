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
                if (density < 1) interpretation = 'Material will float on water';
                else if (density < 2) interpretation = 'Typical for many pharmaceutical powders';
                else interpretation = 'High density material';
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Density Calculator</h1>
                                <p className="text-blue-100 mt-2">True, Bulk, and Tapped Density for pharmaceutical materials</p>
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
                                Density Calculation
                            </h2>

                            {/* Density Type Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Select Density Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setDensityType('true')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${
                                            densityType === 'true'
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Weight className="inline w-5 h-5 mr-2" />
                                        True
                                    </button>
                                    <button
                                        onClick={() => setDensityType('bulk')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${
                                            densityType === 'bulk'
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Beaker className="inline w-5 h-5 mr-2" />
                                        Bulk
                                    </button>
                                    <button
                                        onClick={() => setDensityType('tapped')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${
                                            densityType === 'tapped'
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Droplets className="inline w-5 h-5 mr-2" />
                                        Tapped
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Mass Input */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        <Weight className="inline w-5 h-5 mr-2" />
                                        Mass (g)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={mass}
                                        onChange={(e) => setMass(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter mass"
                                    />
                                </div>

                                {/* Volume Input */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        <Beaker className="inline w-5 h-5 mr-2" />
                                        Volume (mL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="Enter volume"
                                    />
                                </div>

                                {/* Optional container fields */}
                                {densityType === 'bulk' && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Container Mass (g) – Optional
                                        </label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={containerMass}
                                            onChange={(e) => setContainerMass(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="Mass of empty container"
                                        />
                                    </div>
                                )}

                                {densityType === 'tapped' && (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Container Volume (mL) – Optional
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={containerVolume}
                                            onChange={(e) => setContainerVolume(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="Volume of empty container"
                                        />
                                    </div>
                                )}

                                {/* Quick Samples */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Common Materials</h3>
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
                                                <div className="text-sm text-gray-600 mt-1">{material.density} g/mL</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateDensity}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Density
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
                                    <Scale className="w-6 h-6 mr-2 text-green-600" />
                                    Density Result
                                </h2>

                                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-8 text-center">
                                    <div className="text-sm font-semibold text-blue-700 mb-2">
                                        {densityType.charAt(0).toUpperCase() + densityType.slice(1)} Density
                                    </div>
                                    <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-2">
                                        {result.density.toFixed(4)}
                                    </div>
                                    <div className="text-2xl font-semibold text-blue-700">
                                        {result.unit}
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Formula Used</h3>
                                        <p className="font-mono text-sm">{result.formula}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Interpretation</h3>
                                        <p className="text-gray-700">{result.interpretation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Density Types Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Density Types</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">True Density</h4>
                                    <p className="text-sm text-gray-600">Mass excluding pores and voids.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Bulk Density</h4>
                                    <p className="text-sm text-gray-600">Mass including pores and voids.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-600">Tapped Density</h4>
                                    <p className="text-sm text-gray-600">Bulk density after tapping.</p>
                                </div>
                            </div>
                        </div>

                        {/* Applications */}
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Tablet formulation</li>
                                <li>• Capsule filling</li>
                                <li>• Powder flow</li>
                                <li>• Quality control</li>
                            </ul>
                        </div>

                        {/* Reference Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Densities</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Water</span><span className="font-semibold">1.0 g/mL</span></div>
                                <div className="flex justify-between"><span>Lactose</span><span className="font-semibold">1.52 g/mL</span></div>
                                <div className="flex justify-between"><span>MCC</span><span className="font-semibold">1.5 g/mL</span></div>
                                <div className="flex justify-between"><span>Mg Stearate</span><span className="font-semibold">1.1 g/mL</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}