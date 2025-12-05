"use client";
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, Tablet, Clock, Activity, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

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

    const calculateParameters = () => {
        // Calculate T50 (time for 50% completion)
        const t50Disint = calculateT50(timePoints, 'disintegration');
        const t50Dissol = calculateT50(timePoints, 'dissolution');

        // Calculate T90 (time for 90% dissolution)
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

        setT50Disintegration(t50Disint);
        setT50Dissolution(t50Dissol);
        setT90(t90Value);
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
    };

    const sampleProfiles = [
        {
            name: 'Fast Release', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 2, dis: 80, diss: 30 }, { time: 5, dis: 100, diss: 80 }, { time: 10, dis: 100, diss: 98 }
            ]
        },
        {
            name: 'Extended Release', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 10, dis: 40, diss: 15 }, { time: 30, dis: 100, diss: 50 }, { time: 60, dis: 100, diss: 85 }, { time: 120, dis: 100, diss: 98 }
            ]
        },
        {
            name: 'Immediate Release', data: [
                { time: 0, dis: 0, diss: 0 }, { time: 1, dis: 95, diss: 40 }, { time: 3, dis: 100, diss: 85 }, { time: 5, dis: 100, diss: 98 }
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

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Tablet className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tablet Disintegration & Dissolution Profile Plotter</h1>
                            <p className="text-gray-600">Plot and analyze tablet disintegration and dissolution profiles over time</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Enter Profile Data
                        </h2>

                        {/* Sample Profiles */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Sample Profiles</label>
                            <div className="grid grid-cols-3 gap-3">
                                {sampleProfiles.map((profile, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => loadSample(idx)}
                                        className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                                    >
                                        <div className="font-semibold text-blue-600">{profile.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">Click to load</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Entry */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">Add New Time Point</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time (min)</label>
                                        <input
                                            type="number"
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 15"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Disintegration (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newDisintegration}
                                            onChange={(e) => setNewDisintegration(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dissolution (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newDissolution}
                                            onChange={(e) => setNewDissolution(e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="0-100"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={addTimePoint}
                                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                                >
                                    Add Time Point
                                </button>
                            </div>

                            {/* Data Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3 border-b">
                                    <h3 className="font-semibold text-gray-800">Current Data Points</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Time (min)</th>
                                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Disintegration (%)</th>
                                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Dissolution (%)</th>
                                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timePoints.map((point, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-4">{point.time}</td>
                                                    <td className="py-3 px-4">{point.disintegration}</td>
                                                    <td className="py-3 px-4">{point.dissolution}</td>
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
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateParameters}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                                >
                                    Calculate Parameters
                                </button>
                                <button
                                    onClick={resetData}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Reset Data
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Plot</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timePoints}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis
                                            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="disintegration"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            name="Disintegration"
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="dissolution"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            name="Dissolution"
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Results Card */}
                        {(t50Disintegration !== null || t50Dissolution !== null || t90 !== null) && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Parameters</h2>
                                <div className="space-y-4">
                                    {t50Disintegration !== null && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-600">T₅₀ Disintegration</div>
                                                    <div className="text-2xl font-bold text-blue-600">{t50Disintegration.toFixed(1)} min</div>
                                                </div>
                                                <Clock className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2">Time for 50% disintegration</div>
                                        </div>
                                    )}
                                    {t50Dissolution !== null && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-600">T₅₀ Dissolution</div>
                                                    <div className="text-2xl font-bold text-green-600">{t50Dissolution.toFixed(1)} min</div>
                                                </div>
                                                <Activity className="w-8 h-8 text-green-500" />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2">Time for 50% dissolution</div>
                                        </div>
                                    )}
                                    {t90 !== null && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-600">T₉₀ Dissolution</div>
                                                    <div className="text-2xl font-bold text-purple-600">{t90.toFixed(1)} min</div>
                                                </div>
                                                <TrendingUp className="w-8 h-8 text-purple-500" />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2">Time for 90% dissolution</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Profile Interpretation</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-2"></div>
                                    <p><span className="font-semibold text-blue-700">Disintegration:</span> Breakdown of tablet into smaller particles</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-2"></div>
                                    <p><span className="font-semibold text-green-700">Dissolution:</span> Drug dissolving into solution</p>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="font-semibold text-gray-800">Acceptance Criteria:</p>
                                    <p>• Immediate Release: Q ≥ 80% in 30 min</p>
                                    <p>• Extended Release: Meet specified dissolution profile</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Dissolution Requirements (USP)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug Class</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Q Value</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Time Point</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Acceptance Criteria</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical T₉₀</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Immediate Release</td>
                                    <td className="py-3 px-4">75-80%</td>
                                    <td className="py-3 px-4">30-45 min</td>
                                    <td className="py-3 px-4">Q + 5% at each stage</td>
                                    <td className="py-3 px-4">30-45 min</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Extended Release</td>
                                    <td className="py-3 px-4">Varies</td>
                                    <td className="py-3 px-4">Multiple points</td>
                                    <td className="py-3 px-4">Meet dissolution profile</td>
                                    <td className="py-3 px-4">4-12 hours</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Enteric Coated</td>
                                    <td className="py-3 px-4">75%</td>
                                    <td className="py-3 px-4">pH 6.8 buffer</td>
                                    <td className="py-3 px-4">No release at pH 1.2</td>
                                    <td className="py-3 px-4">45-90 min</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="py-3 px-4">Highly Soluble</td>
                                    <td className="py-3 px-4">85%</td>
                                    <td className="py-3 px-4">15 min</td>
                                    <td className="py-3 px-4">Very rapid release</td>
                                    <td className="py-3 px-4">10-20 min</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}