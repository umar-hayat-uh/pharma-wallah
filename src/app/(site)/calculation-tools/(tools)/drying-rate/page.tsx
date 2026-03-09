"use client";
import { useState, useEffect } from 'react';
import { Droplets, Activity, Filter, AlertCircle, Info, BookOpen, Gauge, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const materialData = [
        { material: 'Food Grains', initial: '0.20', final: '0.14', note: 'Wheat, rice' },
        { material: 'Ceramics', initial: '0.25', final: '0.02', note: 'Clay, tiles' },
        { material: 'Pharmaceuticals', initial: '0.15', final: '0.05', note: 'Granules, powders' },
        { material: 'Wood', initial: '0.40', final: '0.12', note: 'Lumber' },
        { material: 'Textiles', initial: '0.30', final: '0.08', note: 'Fabric' },
    ];

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

        // Generate drying curve
        const data = [];
        for (let mc = X1; mc >= X2; mc -= (X1 - X2) / 20) {
            const rate = (M * (X1 - mc)) / (t * A); // simplified linear
            data.push({ moisture: mc, rate });
        }
        setChartData(data);
    };

    const reset = () => {
        setInitialMoisture('');
        setFinalMoisture('');
        setDryingTime('');
        setMaterialMass('');
        setDryingArea('');
        setResult(null);
        setChartData([]);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Drying Rate Calculator</h1>
                            <p className="text-blue-100 mt-2">N = [M·(X₁−X₂)] / (t·A) </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Drying Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Initial moisture X₁ (kg/kg)</label>
                                    <input type="number" step="0.001" value={initialMoisture} onChange={(e) => setInitialMoisture(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 0.25" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Final moisture X₂ (kg/kg)</label>
                                    <input type="number" step="0.001" value={finalMoisture} onChange={(e) => setFinalMoisture(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 0.05" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Drying time t (h)</label>
                                    <input type="number" step="0.1" value={dryingTime} onChange={(e) => setDryingTime(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 8" />
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Dry mass M (kg)</label>
                                    <input type="number" step="0.1" value={materialMass} onChange={(e) => setMaterialMass(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" placeholder="e.g., 100" />
                                </div>
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                                    <label className="text-sm font-semibold mb-2">Drying area A (m²)</label>
                                    <input type="number" step="0.01" value={dryingArea} onChange={(e) => setDryingArea(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg" placeholder="e.g., 10" />
                                </div>
                            </div>

                            {/* Drying Rate Chart */}
                            {chartData.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Drying Rate vs. Moisture Content</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                                {/* reversed={true} is standard for drying: moisture goes from high to low */}
                                                <XAxis
                                                    dataKey="moisture"
                                                    reversed={true}
                                                    fontSize={12}
                                                    label={{
                                                        value: "Moisture Content (X, kg/kg)",
                                                        position: "insideBottom",
                                                        offset: -25,
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <YAxis
                                                    fontSize={12}
                                                    width={65}
                                                    label={{
                                                        value: "Drying Rate (R, kg/m²·h)",
                                                        angle: -90,
                                                        position: "insideLeft",
                                                        style: { textAnchor: 'middle' },
                                                        offset: -25,
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <Tooltip
                                                    formatter={(value) => [Number(value).toFixed(3), "Rate"]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="rate"
                                                    stroke="#f59e0b" // Amber color for drying
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">N = [M·(X₁−X₂)] / (t·A) </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateDryingRate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Drying Rate
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
                                    About Drying Rate
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> Drying rate N = mass of water removed per unit time per unit area .</p>
                                    <p><span className="font-semibold">Periods:</span> Constant rate (surface evaporation), falling rate (internal diffusion controlled).</p>
                                    <p><span className="font-semibold">Critical moisture:</span> transition between constant and falling rate.</p>
                                    <p><span className="font-semibold">Applications:</span> Dryer design, process optimization, energy consumption.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Drying Rate</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.dryingRate.toFixed(3)} kg/m²·h</div>
                                    <div className={`text-lg font-bold ${result.color}`}>{result.dryingPhase}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4 grid grid-cols-2 gap-2">
                                    <div><span className="font-semibold">Avg rate</span> {result.avgRate.toFixed(2)} kg/h</div>
                                    <div><span className="font-semibold">Water removed</span> {result.moistureRemoved.toFixed(2)} kg</div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Typical Moisture Contents
                            </h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr><th className="py-2 px-3 text-left">Material</th><th>Initial</th><th>Final</th></tr>
                                </thead>
                                <tbody>
                                    {materialData.map((m, i) => (
                                        <tr key={i} className="border-b"><td className="py-2 px-3">{m.material}</td><td>{m.initial}</td><td>{m.final}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Drying Phases</h3>
                            <ul className="text-sm space-y-1">
                                <li><span className="font-semibold">Constant rate:</span> surface moisture removal</li>
                                <li><span className="font-semibold">Falling rate:</span> internal diffusion</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}