"use client";
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calculator, Tablet, Clock, Activity, TrendingUp, AlertCircle, RefreshCw, Target, Scale, FileText } from 'lucide-react';

type TimePoint = {
    time: number;
    disintegration: number;
    dissolution: number;
};

export default function TabletProfilePlotter() {
    const [timePoints, setTimePoints] = useState<TimePoint[]>([
        { time: 0, disintegration: 0, dissolution: 0 },
        { time: 5, disintegration: 15, dissolution: 5 },
        { time: 10, disintegration: 65, dissolution: 25 },
        { time: 15, disintegration: 100, dissolution: 60 },
        { time: 20, disintegration: 100, dissolution: 85 },
        { time: 30, disintegration: 100, dissolution: 98 },
    ]);
    const [newTime, setNewTime] = useState<string>('');
    const [newDisintegration, setNewDisintegration] = useState<string>('');
    const [newDissolution, setNewDissolution] = useState<string>('');
    const [t50Disintegration, setT50Disintegration] = useState<number | null>(null);
    const [t50Dissolution, setT50Dissolution] = useState<number | null>(null);
    const [t90, setT90] = useState<number | null>(null);
    const [td, setTd] = useState<number | null>(null); // Disintegration time (time for 100% disintegration)

    const calculateParameters = () => {
        // Calculate T50 for disintegration and dissolution
        const t50Disint = calculateT50(timePoints, 'disintegration');
        const t50Dissol = calculateT50(timePoints, 'dissolution');

        // Calculate T90 for dissolution
        let t90Value = null;
        for (let i = 0; i < timePoints.length; i++) {
            if (timePoints[i].dissolution >= 90) {
                if (i === 0) {
                    t90Value = timePoints[i].time;
                } else {
                    // Linear interpolation
                    const prev = timePoints[i - 1];
                    const curr = timePoints[i];
                    const ratio = (90 - prev.dissolution) / (curr.dissolution - prev.dissolution);
                    t90Value = prev.time + ratio * (curr.time - prev.time);
                }
                break;
            }
        }

        // Calculate disintegration time (time for 100% disintegration)
        let tdValue = null;
        for (let i = 0; i < timePoints.length; i++) {
            if (timePoints[i].disintegration >= 100) {
                if (i === 0) {
                    tdValue = timePoints[i].time;
                } else {
                    const prev = timePoints[i - 1];
                    const curr = timePoints[i];
                    const ratio = (100 - prev.disintegration) / (curr.disintegration - prev.disintegration);
                    tdValue = prev.time + ratio * (curr.time - prev.time);
                }
                break;
            }
        }

        setT50Disintegration(t50Disint);
        setT50Dissolution(t50Dissol);
        setT90(t90Value);
        setTd(tdValue);
    };

    const calculateT50 = (data: TimePoint[], type: 'disintegration' | 'dissolution') => {
        for (let i = 0; i < data.length; i++) {
            if (data[i][type] >= 50) {
                if (i === 0) return data[i].time;
                // Linear interpolation
                const prev = data[i - 1];
                const curr = data[i];
                const ratio = (50 - prev[type]) / (curr[type] - prev[type]);
                return prev.time + ratio * (curr.time - prev.time);
            }
        }
        return null;
    };

    const addTimePoint = () => {
        const time = parseFloat(newTime);
        const disint = parseFloat(newDisintegration);
        const dissol = parseFloat(newDissolution);

        if (isNaN(time) || isNaN(disint) || isNaN(dissol)) {
            alert('Please enter valid numbers');
            return;
        }

        if (disint < 0 || disint > 100 || dissol < 0 || dissol > 100) {
            alert('Percentages must be between 0 and 100');
            return;
        }

        const newPoint = { time, disintegration: disint, dissolution: dissol };
        const updated = [...timePoints, newPoint].sort((a, b) => a.time - b.time);
        setTimePoints(updated);
        setNewTime('');
        setNewDisintegration('');
        setNewDissolution('');
    };

    const removeTimePoint = (index: number) => {
        if (timePoints.length <= 2) {
            alert('At least 2 time points are required');
            return;
        }
        const updated = timePoints.filter((_, i) => i !== index);
        setTimePoints(updated);
    };

    const resetData = () => {
        setTimePoints([
            { time: 0, disintegration: 0, dissolution: 0 },
            { time: 5, disintegration: 15, dissolution: 5 },
            { time: 10, disintegration: 65, dissolution: 25 },
            { time: 15, disintegration: 100, dissolution: 60 },
            { time: 20, disintegration: 100, dissolution: 85 },
            { time: 30, disintegration: 100, dissolution: 98 },
        ]);
        setT50Disintegration(null);
        setT50Dissolution(null);
        setT90(null);
        setTd(null);
    };

    const sampleProfiles = [
        {
            name: 'Immediate Release', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 2, dis: 95, diss: 40 }, { time: 5, dis: 100, diss: 85 }, { time: 10, dis: 100, diss: 98 }
            ]
        },
        {
            name: 'Extended Release', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 10, dis: 40, diss: 15 }, { time: 30, dis: 100, diss: 50 }, { time: 60, dis: 100, diss: 85 }, { time: 120, dis: 100, diss: 98 }
            ]
        },
        {
            name: 'Fast Disintegrating', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 1, dis: 80, diss: 10 }, { time: 3, dis: 100, diss: 35 }, { time: 10, dis: 100, diss: 75 }, { time: 20, dis: 100, diss: 95 }
            ]
        },
    ];

    const loadSample = (index: number) => {
        const sample = sampleProfiles[index];
        const formatted = sample.data.map(d => ({
            time: d.time,
            disintegration: d.dis,
            dissolution: d.diss
        }));
        setTimePoints(formatted);
    };

    // Check if Q value criteria is met (e.g., Q=80% at 30 min)
    const checkQValue = (time: number = 30, q: number = 80) => {
        const point = timePoints.find(p => p.time === time);
        if (!point) return null;
        return {
            meets: point.dissolution >= q,
            value: point.dissolution,
            required: q
        };
    };

    const qResult = checkQValue(30, 80);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Tablet className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Tablet Disintegration & Dissolution Profile Plotter</h1>
                                <p className="text-blue-100 mt-2">USP &lt;711&gt; compliant profile analysis with T₅₀, T₉₀, and disintegration time</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => loadSample(0)}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                                IR
                            </button>
                            <button
                                onClick={() => loadSample(1)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                                ER
                            </button>
                            <button
                                onClick={() => loadSample(2)}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                            >
                                ODT
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Profile Data Entry
                            </h2>

                            {/* Add New Point */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Time Point</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time (min)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 15"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Disintegration (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={newDisintegration}
                                            onChange={(e) => setNewDisintegration(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dissolution (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={newDissolution}
                                            onChange={(e) => setNewDissolution(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={addTimePoint}
                                            className="w-full bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
                                        >
                                            Add Point
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Time (min)</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Disintegration (%)</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Dissolution (%)</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timePoints.map((point, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{point.time}</td>
                                                <td className="py-3 px-4">
                                                    <span className={point.disintegration >= 100 ? 'text-green-600 font-semibold' : ''}>
                                                        {point.disintegration}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={point.dissolution >= 80 ? 'text-green-600 font-semibold' : ''}>
                                                        {point.dissolution}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => removeTimePoint(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={calculateParameters}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate Parameters
                                </button>
                                <button
                                    onClick={resetData}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Activity className="w-6 h-6 mr-2 text-green-600" />
                                Profile Plot
                            </h2>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timePoints} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -10 }}
                                            domain={[0, 'dataMax']}
                                        />
                                        <YAxis
                                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend />
                                        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Q = 80%', position: 'right' }} />
                                        <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '50%', position: 'right' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="disintegration"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            name="Disintegration"
                                            dot={{ r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="dissolution"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            name="Dissolution"
                                            dot={{ r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Results & Info Sidebar */}
                    <div className="space-y-6">
                        {/* Key Parameters */}
                        {(t50Disintegration !== null || t50Dissolution !== null || t90 !== null || td !== null) && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                                    Key Parameters
                                </h2>
                                <div className="space-y-4">
                                    {td !== null && (
                                        <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-blue-700">Disintegration Time</div>
                                                    <div className="text-2xl font-bold text-blue-600">{td.toFixed(1)} min</div>
                                                </div>
                                                <Clock className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">Time for 100% disintegration</p>
                                        </div>
                                    )}
                                    {t50Disintegration !== null && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-indigo-700">T₅₀ Disintegration</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{t50Disintegration.toFixed(1)} min</div>
                                                </div>
                                                <Clock className="w-8 h-8 text-indigo-500" />
                                            </div>
                                        </div>
                                    )}
                                    {t50Dissolution !== null && (
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-green-700">T₅₀ Dissolution</div>
                                                    <div className="text-2xl font-bold text-green-600">{t50Dissolution.toFixed(1)} min</div>
                                                </div>
                                                <Activity className="w-8 h-8 text-green-500" />
                                            </div>
                                        </div>
                                    )}
                                    {t90 !== null && (
                                        <div className="bg-gradient-to-r from-purple-50 to-violet-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-purple-700">T₉₀ Dissolution</div>
                                                    <div className="text-2xl font-bold text-purple-600">{t90.toFixed(1)} min</div>
                                                </div>
                                                <TrendingUp className="w-8 h-8 text-purple-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Q Value Assessment */}
                        {qResult && (
                            <div className={`rounded-2xl shadow-lg p-6 ${qResult.meets ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200' : 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-200'}`}>
                                <h3 className="text-lg font-bold text-gray-800 mb-3">USP Q Value Assessment</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">At 30 minutes:</p>
                                        <p className="text-2xl font-bold">{qResult.value.toFixed(1)}% dissolved</p>
                                    </div>
                                    <div className={`text-lg font-semibold ${qResult.meets ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {qResult.meets ? '✓ Meets Q=80%' : '⚠ Below Q=80%'}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">USP &lt;711&gt; acceptance: Q + 5% at S1 [citation:1]</p>
                            </div>
                        )}

                        {/* USP Acceptance Criteria */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                USP &lt;711&gt; Acceptance [citation:1][citation:3]
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="font-semibold text-green-700">S1 (n=6)</p>
                                    <p>Each unit ≥ Q + 5%</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="font-semibold text-yellow-700">S2 (n=12)</p>
                                    <p>Average ≥ Q, no unit &lt; Q - 15%</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <p className="font-semibold text-orange-700">S3 (n=24)</p>
                                    <p>Average ≥ Q, ≤2 units &lt; Q-15%, none &lt; Q-25%</p>
                                </div>
                            </div>
                        </div>

                        {/* IVIVC Correlation */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">IVIVC Correlation Levels [citation:10]</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold text-blue-700">Level A:</span> Point-to-point relationship</p>
                                <p><span className="font-semibold text-green-700">Level B:</span> Statistical moments (MDT vs MRT)</p>
                                <p><span className="font-semibold text-purple-700">Level C:</span> Single point (T₅₀, T₉₀ vs Cmax, AUC)</p>
                            </div>
                        </div>

                        {/* Profile Comparison */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Profile Similarity [citation:7]</h3>
                            <p className="text-sm text-gray-600 mb-2">f₂ similarity factor:</p>
                            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                                {'f₂ = 50·log{[1 + (1/n)Σ(Rᵢ - Tᵢ)²]⁻⁰·⁵ × 100}'}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">f₂ ≥ 50 indicates similarity</p>
                            <p className="text-xs text-gray-500 mt-1">≥85% dissolved in 15 min → profiles considered similar without f₂ [citation:7]</p>
                        </div>

                        {/* ODT Guidance */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">ODT Requirements [citation:9]</h3>
                            <ul className="space-y-2 text-sm">
                                <li>• Disintegration ≤ 30 seconds</li>
                                <li>• Tablet weight ≤ 500 mg</li>
                                <li>• No need for water</li>
                                <li>• Rapid oral disintegration</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Reference Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Dissolution Requirements by Dosage Form</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Dosage Form</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Apparatus</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Speed (rpm)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Medium</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Q Value</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Time Point</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="py-2 px-4">Immediate Release</td><td>I or II</td><td>50-100</td><td>0.1N HCl, buffer</td><td>75-80%</td><td>30-45 min</td></tr>
                                <tr className="border-b bg-gray-50"><td>Extended Release</td><td>I or II</td><td>50-100</td><td>Multiple pH</td><td>Varies</td><td>Multiple</td></tr>
                                <tr className="border-b"><td>Enteric Coated</td><td>I or II</td><td>50-100</td><td>Acid then buffer</td><td>75% (buffer)</td><td>45-120 min</td></tr>
                                <tr><td>Orally Disintegrating</td><td>USP &lt;701&gt;</td><td>N/A</td><td>Water</td><td>N/A</td><td>≤30 sec</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Source:USP &lt;701&gt; FDA Guidance [citation:1][citation:9]</p>
                </div>
            </div>
        </section>
    );
}