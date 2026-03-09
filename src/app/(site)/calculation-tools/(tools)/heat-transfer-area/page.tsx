"use client";
import { useState, useEffect } from 'react';
import { Thermometer, Zap, Activity, AlertCircle, Droplets, Wind, Info, BookOpen, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateArea = () => {
        const Q = parseFloat(heatTransferRate);
        const ΔT = parseFloat(temperatureDifference);
        const U = parseFloat(overallCoefficient);

        if (isNaN(Q) || isNaN(ΔT) || isNaN(U) || Q <= 0 || ΔT <= 0 || U <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const area = Q / (U * ΔT);

        let interpretation = '', heatExchangerType = '', color = '';
        if (area < 5) {
            interpretation = 'Small heat exchanger required';
            heatExchangerType = 'Compact / Small Scale';
            color = 'text-blue-600';
        } else if (area < 50) {
            interpretation = 'Medium sized heat exchanger';
            heatExchangerType = 'Shell & Tube (Medium)';
            color = 'text-green-600';
        } else if (area < 200) {
            interpretation = 'Large heat exchanger required';
            heatExchangerType = 'Shell & Tube (Large)';
            color = 'text-orange-600';
        } else {
            interpretation = 'Very large industrial heat exchanger';
            heatExchangerType = 'Plate & Frame or Multiple Units';
            color = 'text-red-600';
        }

        setResult({ area, interpretation, heatExchangerType, color });

        // Generate area vs U curve
        const data = [];
        for (let u = U * 0.2; u <= U * 2; u += U / 10) {
            data.push({ U: u.toFixed(0), area: Q / (u * ΔT) });
        }
        setChartData(data);
    };

    const reset = () => {
        setHeatTransferRate('');
        setTemperatureDifference('');
        setOverallCoefficient('');
        setUnitSystem('si');
        setResult(null);
        setChartData([]);
    };

    const typicalUValues = [
        { fluids: 'Water to Water', value: '850–1700' },
        { fluids: 'Steam to Water', value: '1500–4000' },
        { fluids: 'Oil to Water', value: '100–350' },
        { fluids: 'Gas to Gas', value: '10–50' },
        { fluids: 'Condensing Steam', value: '2000–6000' },
    ];

    const exchangerTypes = [
        { type: 'Double Pipe', area: '0.1–2 m²' },
        { type: 'Shell & Tube', area: '5–1000 m²' },
        { type: 'Plate & Frame', area: '0.1–2000 m²' },
        { type: 'Air Cooled', area: '10–500 m²' },
        { type: 'Spiral', area: '0.5–200 m²' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Thermometer className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Heat Transfer Area Calculator</h1>
                            <p className="text-blue-100 mt-2">A = Q / (U · ΔT) </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Heat Exchanger Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                                    <label className="text-sm font-semibold mb-2">Heat load Q</label>
                                    <div className="flex gap-2">
                                        <input type="number" step="0.001" value={heatTransferRate} onChange={(e) => setHeatTransferRate(e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-red-200 rounded-lg" />
                                        <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value as any)}
                                            className="px-4 py-3 border-2 border-gray-300 rounded-lg">
                                            <option value="si">W</option><option value="imperial">BTU/h</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Temperature diff ΔT</label>
                                    <input type="number" step="0.1" value={temperatureDifference} onChange={(e) => setTemperatureDifference(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder={unitSystem==='si'?'°C':'°F'} />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Overall U</label>
                                    <input type="number" step="0.1" value={overallCoefficient} onChange={(e) => setOverallCoefficient(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 500" />
                                </div>
                            </div>

                            {chartData.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Required Area vs. U‑value</h3>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="U" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="area" fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">A = Q / (U · ΔT) </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateArea}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Area
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Heat Transfer Area
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Equation:</span> A = Q / (U·ΔT) – required heat exchanger surface area .</p>
                                    <p><span className="font-semibold">Q</span>: heat load (W or BTU/h); <span className="font-semibold">U</span>: overall heat transfer coefficient; <span className="font-semibold">ΔT</span>: mean temperature difference.</p>
                                    <p><span className="font-semibold">U‑values</span> depend on fluids, fouling, flow arrangement.</p>
                                    <p><span className="font-semibold">Applications:</span> Sizing heat exchangers, condensers, reboilers.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Area Required</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.area.toFixed(2)} m²</div>
                                    <div className={`text-lg font-bold ${result.color}`}>{result.heatExchangerType}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{result.interpretation}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Typical U‑values (W/m²K)
                            </h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr><th className="py-2 px-3 text-left">Fluids</th><th className="py-2 px-3 text-left">U range</th></tr>
                                </thead>
                                <tbody>
                                    {typicalUValues.map((item, i) => (
                                        <tr key={i} className="border-b"><td className="py-2 px-3">{item.fluids}</td><td>{item.value}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Exchanger Types</h3>
                            {exchangerTypes.map((t, i) => (
                                <div key={i} className="flex justify-between text-sm py-1"><span>{t.type}</span><span>{t.area}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}