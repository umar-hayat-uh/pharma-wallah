"use client";
import { useState } from 'react';
import { Thermometer, Zap, Activity, AlertCircle, Droplets, Wind } from 'lucide-react';

export default function HeatTransferAreaCalculator() {
    const [heatTransferRate, setHeatTransferRate] = useState<string>('');
    const [temperatureDifference, setTemperatureDifference] = useState<string>('');
    const [overallCoefficient, setOverallCoefficient] = useState<string>('');
    const [unitSystem, setUnitSystem] = useState<'si' | 'imperial'>('si');
    const [result, setResult] = useState<{
        area: number;
        interpretation: string;
        heatExchangerType: string;
        color: string;
    } | null>(null);

    const calculateArea = () => {
        const Q = parseFloat(heatTransferRate);
        const ΔT = parseFloat(temperatureDifference);
        const U = parseFloat(overallCoefficient);

        if (isNaN(Q) || isNaN(ΔT) || isNaN(U) || Q <= 0 || ΔT <= 0 || U <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // A = Q / (U * ΔT)
        const area = Q / (U * ΔT);

        let interpretation = '';
        let heatExchangerType = '';
        let color = '';

        if (area < 5) {
            interpretation = 'Small heat exchanger required';
            heatExchangerType = 'Compact/Small Scale';
            color = 'text-blue-600';
        } else if (area >= 5 && area < 50) {
            interpretation = 'Medium sized heat exchanger';
            heatExchangerType = 'Shell & Tube (Medium)';
            color = 'text-green-600';
        } else if (area >= 50 && area < 200) {
            interpretation = 'Large heat exchanger required';
            heatExchangerType = 'Shell & Tube (Large)';
            color = 'text-orange-600';
        } else {
            interpretation = 'Very large industrial heat exchanger';
            heatExchangerType = 'Plate & Frame or Multiple Units';
            color = 'text-red-600';
        }

        setResult({
            area,
            interpretation,
            heatExchangerType,
            color
        });
    };

    const resetCalculator = () => {
        setHeatTransferRate('');
        setTemperatureDifference('');
        setOverallCoefficient('');
        setResult(null);
    };

    const typicalUValues = [
        { fluids: 'Water to Water', value: '850-1700', unit: 'W/m²K' },
        { fluids: 'Steam to Water', value: '1500-4000', unit: 'W/m²K' },
        { fluids: 'Oil to Water', value: '100-350', unit: 'W/m²K' },
        { fluids: 'Gas to Gas', value: '10-50', unit: 'W/m²K' },
        { fluids: 'Condensing Steam', value: '2000-6000', unit: 'W/m²K' },
    ];

    const heatExchangerTypes = [
        { type: 'Double Pipe', area: '0.1-2 m²', application: 'Small duties' },
        { type: 'Shell & Tube', area: '5-1000 m²', application: 'General process' },
        { type: 'Plate & Frame', area: '0.1-2000 m²', application: 'High efficiency' },
        { type: 'Air Cooled', area: '10-500 m²', application: 'No cooling water' },
        { type: 'Spiral', area: '0.5-200 m²', application: 'Viscous fluids' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Thermometer className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Heat Transfer Area Calculator</h1>
                            <p className="text-gray-600">Calculate required heat exchanger surface area</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Thermometer className="w-6 h-6 mr-2" />
                            Heat Transfer Area Calculation
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Heat Transfer Rate (Q)
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={heatTransferRate}
                                        onChange={(e) => setHeatTransferRate(e.target.value)}
                                        className="flex-1 px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                        placeholder={unitSystem === 'si' ? "e.g., 100000 (W)" : "e.g., 341214 (BTU/h)"}
                                    />
                                    <select
                                        value={unitSystem}
                                        onChange={(e) => setUnitSystem(e.target.value as 'si' | 'imperial')}
                                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none"
                                    >
                                        <option value="si">Watts (W)</option>
                                        <option value="imperial">BTU/h</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Temperature Difference (ΔT)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={temperatureDifference}
                                        onChange={(e) => setTemperatureDifference(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder={unitSystem === 'si' ? "°C" : "°F"}
                                    />
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-purple-800 mb-3">
                                        Overall U (W/m²K)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={overallCoefficient}
                                        onChange={(e) => setOverallCoefficient(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                            </div>

                            {/* Formula Display */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-center text-lg font-mono text-blue-700">
                                    A = Q / (U × ΔT)
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateArea}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Area
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
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Required Heat Transfer Area</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.area.toFixed(2)} m²
                                        </div>
                                        <div className={`text-lg font-semibold mt-2 ${result.color}`}>
                                            {result.heatExchangerType}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reference Tables */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Typical U‑Values</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left">Fluids</th>
                                        <th className="py-2 px-3 text-left">U (W/m²K)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typicalUValues.map((item, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2 px-3">{item.fluids}</td>
                                            <td className="py-2 px-3">{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Heat Exchanger Types</h3>
                            <div className="space-y-2 text-sm">
                                {heatExchangerTypes.map((type, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="font-medium">{type.type}</span>
                                        <span className="text-gray-600">{type.area}</span>
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