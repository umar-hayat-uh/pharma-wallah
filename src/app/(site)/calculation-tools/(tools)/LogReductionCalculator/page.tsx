"use client";
import { useState, useEffect } from 'react';
import { Activity, Calculator, RefreshCw, AlertCircle, Sigma, Minimize2, Target, BookOpen, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LogReductionCalculator() {
    const [initialCount, setInitialCount] = useState<string>('1000000');
    const [finalCount, setFinalCount] = useState<string>('100');
    const [logReduction, setLogReduction] = useState<number | null>(null);
    const [percentReduction, setPercentReduction] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const N0 = parseFloat(initialCount);
        const Nt = parseFloat(finalCount);

        if (isNaN(N0) || isNaN(Nt) || N0 <= 0 || Nt <= 0 || Nt > N0) return;

        const logRed = Math.log10(N0 / Nt);
        const percent = (1 - Nt / N0) * 100;

        setLogReduction(logRed);
        setPercentReduction(percent);

        setChartData([
            { name: 'Initial', count: N0 },
            { name: 'Final', count: Nt }
        ]);
    };

    useEffect(() => { calculate(); }, [initialCount, finalCount]);

    const reset = () => { setInitialCount('1000000'); setFinalCount('100'); };

    // Conversion table data
    const conversionTable = [
        { log: 1, percent: 90 },
        { log: 2, percent: 99 },
        { log: 3, percent: 99.9 },
        { log: 4, percent: 99.99 },
        { log: 5, percent: 99.999 },
        { log: 6, percent: 99.9999 },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Minimize2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Log Reduction Calculator</h1>
                            <p className="text-blue-100 mt-2">log₁₀(N₀/Nₜ) · Disinfection efficacy [citation:8]</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Microbial Counts (CFU)</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold mb-2">Initial (N₀)</label>
                                    <input type="number" step="1" value={initialCount} onChange={(e) => setInitialCount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold mb-2">Final (Nₜ)</label>
                                    <input type="number" step="1" value={finalCount} onChange={(e) => setFinalCount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                            </div>

                            {/* Bar chart */}
                            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                <h3 className="text-lg font-bold mb-4">Count Comparison (Log Scale)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />

                                            {/* 1. Set a fixed bottom domain (e.g., 0.1) so 0 or 1 are visible */}
                                            <YAxis
                                                scale="log"
                                                domain={[0.1, 'auto']}
                                                allowDataOverflow
                                                tickFormatter={(value) => value.toLocaleString()}
                                            />

                                            <Tooltip
                                                formatter={(value) => [(value ?? 0).toLocaleString(), "Count"]}
                                                cursor={{ fill: 'transparent' }}
                                            />

                                            {/* 2. minPointSize ensures the bar is visible even if the value is tiny */}
                                            <Bar
                                                dataKey="count"
                                                fill="#3b82f6"
                                                minPointSize={5}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">Log reduction = log₁₀(N₀ / Nₜ) </p>
                                <p className="text-sm font-mono mt-1">Percent reduction = (1 − Nₜ/N₀) × 100%</p>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Log Reduction
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> Log reduction measures the decrease in microbial population on a logarithmic scale. A 1‑log reduction = 90% kill, 2‑log = 99%, 3‑log = 99.9%, etc. </p>
                                    <p><span className="font-semibold">Regulatory requirements:</span></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Drinking water: 3‑log reduction for Giardia, 4‑log for viruses</li>
                                        <li>Medical sterilization: 6‑log reduction (10⁶ reduction)</li>
                                        <li>Food sterilization (C. botulinum): 12‑log reduction (12D concept)</li>
                                    </ul>
                                    <p><span className="font-semibold">Conversion:</span> Percent reduction = (1 − 10^-logRed) × 100% [citation:8]</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Results</h2>
                            <div className="bg-white/20 rounded-xl p-4 mb-4 text-center">
                                <div className="text-sm">Log reduction</div>
                                <div className="text-5xl font-bold">{logReduction?.toFixed(2) ?? '—'}</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-sm">Percent reduction</div>
                                <div className="text-3xl font-bold">{percentReduction?.toFixed(2) ?? '—'}%</div>
                            </div>
                        </div>

                        {/* Log‑Percent Conversion Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Log to Percent Conversion
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-100">
                                            <th className="py-3 px-3 text-left font-semibold text-gray-700">Log Reduction</th>
                                            <th className="py-3 px-3 text-left font-semibold text-gray-700">% Reduction</th>
                                            <th className="py-3 px-3 text-left font-semibold text-gray-700">Survivor Ratio</th>
                                            {/* Added the Final Count Header */}
                                            <th className="py-3 px-3 text-left font-semibold text-gray-700 text-blue-700">Final Count (N)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {conversionTable.map((item, idx) => {
                                            const reductionFactor = Math.pow(10, item.log);
                                            const factorLabel = reductionFactor.toLocaleString();

                                            // Logic: N = Initial Count / 10^Log
                                            const finalCountValue = parseFloat(initialCount) / reductionFactor;

                                            return (
                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-blue-50/30 transition-colors'}>
                                                    <td className="py-3 px-3 font-bold text-blue-600">{item.log}-log</td>
                                                    <td className="py-3 px-3 text-gray-700">{item.percent}%</td>
                                                    <td className="py-3 px-3 text-gray-500 italic text-xs">
                                                        1 in {factorLabel}
                                                    </td>
                                                    {/* The missing Final Count column */}
                                                    <td className="py-3 px-3 font-mono font-medium text-gray-900">
                                                        {finalCountValue < 1 && finalCountValue > 0
                                                            ? finalCountValue.toExponential(2)
                                                            : Math.round(finalCountValue).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Interpretation</h3>
                            <p className="text-sm">
                                {logReduction !== null && (
                                    <>
                                        {logReduction < 3 && 'Low – insufficient for disinfection.'}
                                        {logReduction >= 3 && logReduction < 5 && 'Moderate – acceptable for water treatment.'}
                                        {logReduction >= 5 && 'High – meets sterilization criteria.'}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}