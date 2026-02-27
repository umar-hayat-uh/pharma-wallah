"use client";
import { useState } from 'react';
import { Droplets, Activity, Filter, AlertCircle } from 'lucide-react';

export default function DryingRateCalculator() {
    const [initialMoisture, setInitialMoisture] = useState<string>('');
    const [finalMoisture, setFinalMoisture] = useState<string>('');
    const [dryingTime, setDryingTime] = useState<string>('');
    const [materialMass, setMaterialMass] = useState<string>('');
    const [dryingArea, setDryingArea] = useState<string>('');
    const [result, setResult] = useState<{
        dryingRate: number;
        avgRate: number;
        moistureRemoved: number;
        dryingPhase: string;
        color: string;
    } | null>(null);

    const calculateDryingRate = () => {
        const X1 = parseFloat(initialMoisture);
        const X2 = parseFloat(finalMoisture);
        const t = parseFloat(dryingTime);
        const M = parseFloat(materialMass);
        const A = parseFloat(dryingArea);

        if (isNaN(X1) || isNaN(X2) || isNaN(t) || isNaN(M) || isNaN(A) || t <= 0 || M <= 0 || A <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const moistureRemoved = M * (X1 - X2);
        const dryingRate = (moistureRemoved / t) / A;
        const avgRate = moistureRemoved / t;

        let dryingPhase = '', color = '';
        if (X2 > 0.5) {
            dryingPhase = 'CONSTANT RATE PERIOD';
            color = 'text-blue-600';
        } else if (X2 > 0.1) {
            dryingPhase = 'FIRST FALLING RATE PERIOD';
            color = 'text-yellow-600';
        } else {
            dryingPhase = 'SECOND FALLING RATE PERIOD';
            color = 'text-red-600';
        }

        setResult({ dryingRate, avgRate, moistureRemoved, dryingPhase, color });
    };

    const resetCalculator = () => {
        setInitialMoisture('');
        setFinalMoisture('');
        setDryingTime('');
        setMaterialMass('');
        setDryingArea('');
        setResult(null);
    };

    const materialProperties = [
        { material: 'Food Grains', initial: '0.20', final: '0.14', rate: '0.5-2' },
        { material: 'Ceramics', initial: '0.25', final: '0.02', rate: '0.1-1' },
        { material: 'Pharmaceuticals', initial: '0.15', final: '0.05', rate: '0.2-1.5' },
        { material: 'Wood', initial: '0.40', final: '0.12', rate: '0.05-0.3' },
        { material: 'Textiles', initial: '0.30', final: '0.08', rate: '1-5' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Droplets className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Drying Rate Calculator</h1>
                            <p className="text-gray-600">Calculate drying rates and moisture removal</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Droplets className="w-6 h-6 mr-2" />
                            Drying Rate Calculation
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Initial Moisture (kg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={initialMoisture}
                                    onChange={(e) => setInitialMoisture(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 0.25"
                                />
                            </div>
                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    Final Moisture (kg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={finalMoisture}
                                    onChange={(e) => setFinalMoisture(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 0.05"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-purple-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-purple-800 mb-3">
                                    Drying Time (h)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={dryingTime}
                                    onChange={(e) => setDryingTime(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., 8"
                                />
                            </div>
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Material Mass (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={materialMass}
                                    onChange={(e) => setMaterialMass(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                    placeholder="e.g., 100"
                                />
                            </div>
                            <div className="bg-amber-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-amber-800 mb-3">
                                    Drying Area (m²)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={dryingArea}
                                    onChange={(e) => setDryingArea(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
                                    placeholder="e.g., 10"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mt-4">
                            <div className="text-center text-lg font-mono text-blue-700">
                                Drying Rate = [M × (X₁ – X₂)] / (t × A)
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateDryingRate}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Drying Rate
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
                        {result && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Drying Rate</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.dryingRate.toFixed(3)} kg/m²·h
                                        </div>
                                        <div className={`text-lg font-semibold mt-2 ${result.color}`}>
                                            {result.dryingPhase}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-sm">Moisture Removed</div>
                                            <div className="text-xl font-bold">{result.moistureRemoved.toFixed(2)} kg</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-sm">Average Rate</div>
                                            <div className="text-xl font-bold">{result.avgRate.toFixed(2)} kg/h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reference Table */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Typical Drying Data</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left">Material</th>
                                        <th className="py-2 px-3 text-left">Initial</th>
                                        <th className="py-2 px-3 text-left">Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materialProperties.map((m, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2 px-3">{m.material}</td>
                                            <td className="py-2 px-3">{m.initial}</td>
                                            <td className="py-2 px-3">{m.final}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}