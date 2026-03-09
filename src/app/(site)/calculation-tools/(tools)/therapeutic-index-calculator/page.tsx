"use client";
import { useState } from 'react';
import { BarChart3, RefreshCw, Shield, Info, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

        const ti = TD50 / ED50; // [citation:4][citation:9]

        let margin = '', safety = '', color = '', interpretation = '';
        if (ti < 2) {
            margin = 'VERY NARROW';
            safety = 'HIGH RISK';
            color = 'text-red-600';
            interpretation = 'Drug requires close monitoring and precise dosing.';
        } else if (ti < 5) {
            margin = 'NARROW';
            safety = 'MODERATE RISK';
            color = 'text-orange-600';
            interpretation = 'Caution required, therapeutic drug monitoring recommended.';
        } else if (ti < 10) {
            margin = 'MODERATE';
            safety = 'ACCEPTABLE';
            color = 'text-yellow-600';
            interpretation = 'Standard precautions apply.';
        } else {
            margin = 'WIDE';
            safety = 'SAFE';
            color = 'text-green-600';
            interpretation = 'Drug has good safety margin.';
        }

        setResult({ ti, margin, safety, color, interpretation });
    };

    const reset = () => {
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
        { range: 'TI 2–5', classification: 'Narrow', monitoring: 'Regular TDM recommended' },
        { range: 'TI 5–10', classification: 'Moderate', monitoring: 'Routine monitoring' },
        { range: 'TI > 10', classification: 'Wide', monitoring: 'Minimal monitoring' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Therapeutic Index Calculator</h1>
                                <p className="text-blue-100 mt-2">TI = TD₅₀ / ED₅₀ – safety margin</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Enter Doses</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ED₅₀ (mg/kg)</label>
                                    <input type="number" step="0.001" value={ed50} onChange={(e) => setEd50(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                    <p className="text-xs text-gray-500 mt-1">Dose effective in 50% of population</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">TD₅₀ / LD₅₀ (mg/kg)</label>
                                    <input type="number" step="0.001" value={td50} onChange={(e) => setTd50(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-lg" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Drug Name</label>
                                    <input type="text" value={drugName} onChange={(e) => setDrugName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            {/* Sample Drugs */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Drugs</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {sampleDrugs.map((drug, idx) => (
                                        <button key={idx} onClick={() => { setEd50(drug.ED50); setTd50(drug.TD50); setDrugName(drug.name); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{drug.name}</div>
                                            <div>TI {drug.TI}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateTI}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Calculate TI
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl">
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Safety Guidelines Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">TI Safety Guidelines</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-2 px-4 text-left">TI Range</th>
                                        <th className="py-2 px-4 text-left">Classification</th>
                                        <th className="py-2 px-4 text-left">Monitoring</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safetyGuidelines.map((g, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2 px-4">{g.range}</td>
                                            <td className="py-2 px-4">{g.classification}</td>
                                            <td className="py-2 px-4">{g.monitoring}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Results & Info */}
                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Therapeutic Index</h2>
                                <div className="bg-white/20 rounded-xl p-6 text-center">
                                    <div className="text-5xl font-bold">{result.ti.toFixed(2)}</div>
                                    <div className={`mt-2 text-xl font-bold ${result.color}`}>{result.margin} MARGIN</div>
                                </div>
                                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                                    <p className="text-sm">{result.interpretation}</p>
                                    <p className="text-sm mt-2"><strong>Safety:</strong> {result.safety}</p>
                                </div>
                            </div>
                        )}

                        {/* TI Bar Chart */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Therapeutic Window</h3>
                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={[{ name: 'Therapeutic', ED: 1, TD: result.ti }]}>
                                            <CartesianGrid horizontal={false} />
                                            <XAxis type="number" domain={[0, Math.max(result.ti * 1.5, 10)]} />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Tooltip />
                                            <Bar dataKey="ED" fill="#3b82f6" stackId="a" />
                                            <Bar dataKey="TD" fill="#ef4444" stackId="a" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Red = toxic dose, Blue = effective dose</p>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="bg-yellow-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Note
                            </h3>
                            <p className="text-sm text-gray-700">TI derived from quantal dose‑response curves in animals [citation:4][citation:9]. For humans, therapeutic window based on population data.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}