"use client";
import { useState } from 'react';
import { BarChart3, RefreshCw, Shield, Info } from 'lucide-react';

export default function TherapeuticIndexCalculator() {
    const [td50, setTd50] = useState<string>('');
    const [ed50, setEd50] = useState<string>('');
    const [drugName, setDrugName] = useState<string>('');
    const [result, setResult] = useState<{
        ti: number;
        margin: string;
        safety: string;
        color: string;
        interpretation: string;
    } | null>(null);

    const calculateTI = () => {
        const TD50 = parseFloat(td50);
        const ED50 = parseFloat(ed50);

        if (isNaN(TD50) || isNaN(ED50) || TD50 <= 0 || ED50 <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const ti = TD50 / ED50;

        let margin = '';
        let safety = '';
        let color = '';
        let interpretation = '';

        if (ti < 2) {
            margin = 'VERY NARROW';
            safety = 'HIGH RISK';
            color = 'text-red-600';
            interpretation = 'Drug requires close monitoring and precise dosing';
        } else if (ti >= 2 && ti < 5) {
            margin = 'NARROW';
            safety = 'MODERATE RISK';
            color = 'text-orange-600';
            interpretation = 'Caution required, therapeutic drug monitoring recommended';
        } else if (ti >= 5 && ti < 10) {
            margin = 'MODERATE';
            safety = 'ACCEPTABLE';
            color = 'text-yellow-600';
            interpretation = 'Standard precautions apply';
        } else {
            margin = 'WIDE';
            safety = 'SAFE';
            color = 'text-green-600';
            interpretation = 'Drug has good safety margin';
        }

        setResult({
            ti,
            margin,
            safety,
            color,
            interpretation
        });
    };

    const resetCalculator = () => {
        setTd50('');
        setEd50('');
        setDrugName('');
        setResult(null);
    };

    const sampleDrugs = [
        { name: 'Digoxin', ED50: '0.8', TD50: '2.0', TI: '2.5', safety: 'Narrow' },
        { name: 'Warfarin', ED50: '1.5', TD50: '3.0', TI: '2.0', safety: 'Very Narrow' },
        { name: 'Penicillin', ED50: '10', TD50: '500', TI: '50', safety: 'Wide' },
        { name: 'Lithium', ED50: '0.5', TD50: '1.5', TI: '3.0', safety: 'Narrow' },
        { name: 'Aspirin', ED50: '100', TD50: '500', TI: '5.0', safety: 'Moderate' },
    ];

    const safetyGuidelines = [
        { range: 'TI < 2', classification: 'Very Narrow', monitoring: 'Continuous TDM required' },
        { range: 'TI 2-5', classification: 'Narrow', monitoring: 'Regular TDM recommended' },
        { range: 'TI 5-10', classification: 'Moderate', monitoring: 'Routine monitoring' },
        { range: 'TI > 10', classification: 'Wide', monitoring: 'Minimal monitoring' },
    ];

    return (
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto  bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center mb-6">
                    <BarChart3 className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Therapeutic Index Calculator</h2>
                        <p className="text-gray-600">Calculate therapeutic index and safety margin</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Effective Dose 50% (ED50)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={ed50}
                                onChange={(e) => setEd50(e.target.value)}
                                className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 10 (mg/kg)"
                            />
                            <p className="text-sm text-gray-600 mt-2">Dose producing therapeutic effect in 50% of population</p>
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Toxic Dose 50% (TD50)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={td50}
                                onChange={(e) => setTd50(e.target.value)}
                                className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 50 (mg/kg)"
                            />
                            <p className="text-sm text-gray-600 mt-2">Dose producing toxicity in 50% of population</p>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Drug Name
                            </label>
                            <input
                                type="text"
                                value={drugName}
                                onChange={(e) => setDrugName(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                                placeholder="e.g., Digoxin"
                            />
                        </div>

                        {/* Safety Margin Visualization */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4 text-center">Therapeutic Window Visualization</h3>
                            <div className="relative h-48">
                                {/* Safety scale */}
                                <div className="absolute inset-x-0 top-1/2 h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"></div>

                                {/* Markers */}
                                {ed50 && td50 && (
                                    <>
                                        {/* ED50 marker */}
                                        <div
                                            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-600 rounded-full shadow-lg"
                                            style={{ left: `${Math.min((parseFloat(ed50) / (parseFloat(td50) * 2)) * 100, 95)}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                                <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold">
                                                    ED50: {ed50}
                                                </div>
                                            </div>
                                        </div>

                                        {/* TD50 marker */}
                                        <div
                                            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-red-600 rounded-full shadow-lg"
                                            style={{ left: `${Math.min((parseFloat(td50) / (parseFloat(td50) * 2)) * 100, 95)}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                                <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold">
                                                    TD50: {td50}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Therapeutic window */}
                                        <div
                                            className="absolute top-1/2 transform -translate-y-1/2 h-4 bg-green-200 opacity-50"
                                            style={{
                                                left: `${Math.min((parseFloat(ed50) / (parseFloat(td50) * 2)) * 100, 95)}%`,
                                                width: `${Math.min(((parseFloat(td50) - parseFloat(ed50)) / (parseFloat(td50) * 2)) * 100, 95)}%`,
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-green-800">Therapeutic Window</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Labels */}
                                <div className="absolute -bottom-6 left-0 text-xs text-gray-600">Low Dose</div>
                                <div className="absolute -bottom-6 left-1/3 text-xs text-gray-600">Safe Range</div>
                                <div className="absolute -bottom-6 right-1/3 text-xs text-gray-600">Toxic Range</div>
                                <div className="absolute -bottom-6 right-0 text-xs text-gray-600">High Dose</div>
                            </div>

                            {/* Formula */}
                            <div className="mt-4 text-center">
                                <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                    TI = TD₅₀ / ED₅₀
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={calculateTI}
                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Calculate Therapeutic Index
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Results and Reference Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Therapeutic Index Analysis</h3>

                                <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Therapeutic Index</div>
                                    <div className="text-4xl font-bold text-green-400 mb-2">
                                        {result.ti.toFixed(2)}
                                    </div>
                                    <div className={`text-lg font-bold ${result.color}`}>
                                        {result.margin} MARGIN
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Safety Assessment</div>
                                        <p className="text-gray-600">{result.interpretation}</p>
                                    </div>

                                    <div className={`rounded-lg p-4 ${result.color.replace('text', 'bg')} bg-opacity-20`}>
                                        <div className="font-semibold mb-1">Safety Level</div>
                                        <p className={`${result.color} font-bold`}>{result.safety}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Calculation Details</div>
                                        <p className="text-sm text-gray-600">
                                            TI = {td50} mg/kg ÷ {ed50} mg/kg = {result.ti.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Safety Guidelines */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <Shield className="w-5 h-5 text-green-400 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Therapeutic Index Guidelines</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-green-50 to-blue-50">
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">TI Range</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Classification</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring Requirements</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {safetyGuidelines.map((guideline, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                                <td className="py-3 px-4 font-medium">{guideline.range}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${guideline.classification === 'Very Narrow' ? 'bg-red-100 text-red-800' :
                                                        guideline.classification === 'Narrow' ? 'bg-orange-100 text-orange-800' :
                                                            guideline.classification === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {guideline.classification}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{guideline.monitoring}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Example Drugs */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Example Drugs with Therapeutic Indices</h3>
                            <div className="space-y-3">
                                {sampleDrugs.map((drug, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800">{drug.name}</div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${drug.safety === 'Very Narrow' ? 'bg-red-100 text-red-800' :
                                                drug.safety === 'Narrow' ? 'bg-orange-100 text-orange-800' :
                                                    drug.safety === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                TI: {drug.TI}
                                            </div>
                                        </div>
                                        <div className="flex text-sm text-gray-600">
                                            <div className="mr-4">
                                                <span className="font-medium">ED50:</span> {drug.ED50} mg/kg
                                            </div>
                                            <div>
                                                <span className="font-medium">TD50:</span> {drug.TD50} mg/kg
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}