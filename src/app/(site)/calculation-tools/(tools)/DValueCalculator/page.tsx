"use client";
import { useState, useEffect } from 'react';
import { Activity, Calculator, Thermometer, RefreshCw, AlertCircle, Sigma, Beaker, Info, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function DValueCalculator() {
    const [initialCount, setInitialCount] = useState<string>('1000000');
    const [finalCount, setFinalCount] = useState<string>('1000');
    const [time, setTime] = useState<string>('10');
    const [temperature, setTemperature] = useState<string>('121');
    const [dValue, setDValue] = useState<number | null>(null);
    const [logReduction, setLogReduction] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [timeUnits] = useState<'minutes' | 'seconds'>('minutes');
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const N0 = parseFloat(initialCount);
        const Nt = parseFloat(finalCount);
        const t = parseFloat(time);

        if (isNaN(N0) || isNaN(Nt) || isNaN(t) || N0 <= 0 || Nt <= 0 || Nt >= N0) return;

        const logRed = Math.log10(N0 / Nt);
        const D = t / logRed;

        setDValue(D);
        setLogReduction(logRed);

        // Generate survivor curve
        const data = [];
        for (let i = 0; i <= 60; i += 1) {
            const survivors = N0 * Math.pow(10, -i / D);
            data.push({ time: i, logCount: Math.log10(survivors) });
        }
        setChartData(data);
    };

    useEffect(() => { calculate(); }, [initialCount, finalCount, time]);

    const reset = () => { setInitialCount('1000000'); setFinalCount('1000'); setTime('10'); };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">D‑Value Calculator</h1>
                            <p className="text-blue-100 mt-2">Decimal Reduction Time – First‑order kinetics [citation:2][citation:7]</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Decimal Reduction Time</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Initial count N₀ (CFU)</label>
                                    <input type="number" step="1" value={initialCount} onChange={(e) => setInitialCount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Final count Nₜ (CFU)</label>
                                    <input type="number" step="1" value={finalCount} onChange={(e) => setFinalCount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Exposure time ({timeUnits})</label>
                                    <input type="number" step="0.1" value={time} onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Temperature (°C)</label>
                                    <input type="number" step="1" value={temperature} onChange={(e) => setTemperature(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                            </div>

                            {/* Survivor Curve */}
                            {chartData.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Survivor Curve (First‑order kinetics)</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {/* Increased margins to prevent label cutoff */}
                                            <LineChart data={chartData} margin={{ top: 20, right: 40, left: 40, bottom: 40 }}>
                                                <CartesianGrid strokeDasharray="3 3" />

                                                {/* Positioned label below the axis */}
                                                <XAxis
                                                    dataKey="time"
                                                    label={{ value: "Time (minutes)", position: "insideBottom", offset: -20 }}
                                                />

                                                {/* Rotated label to the side to prevent overlapping with numbers */}
                                                <YAxis
                                                    label={{ value: "log₁₀(N)", angle: -90, position: "insideLeft", offset: 10 }}
                                                    domain={[0, 'auto']}
                                                />

                                                <Tooltip />
                                                <Line type="monotone" dataKey="logCount" stroke="#3b82f6" strokeWidth={2} dot={false} />

                                                {/* Reference Line Label adjustment */}
                                                <ReferenceLine
                                                    y={Math.log10(parseFloat(initialCount) * 0.1)}
                                                    stroke="#ef4444"
                                                    strokeDasharray="3 3"
                                                    label={{ value: "90% reduction", position: "top", fill: "#ef4444", fontSize: 12 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-6">The D‑value is the time required for the survivor curve to traverse one log cycle.</p>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">D = t / log₁₀(N₀ / Nₜ) </p>
                                <p className="text-xs text-gray-600 mt-2">where D = decimal reduction time, t = exposure time, N₀ = initial count, Nₜ = final count</p>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate D
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About D‑Value (Decimal Reduction Time)
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> D‑value is the time (in minutes) required at a given temperature to reduce a microbial population by 90% (one log cycle) [citation:2][citation:7].</p>
                                    <p><span className="font-semibold">First‑order kinetics:</span> The thermal death of microorganisms follows log‑linear kinetics: log(Nₜ/N₀) = -t/D [citation:2][citation:10].</p>
                                    <p><span className="font-semibold">Applications:</span> D‑values are used to design sterilization cycles, compare heat resistance of different organisms, and validate processes [citation:4].</p>
                                    <p><span className="font-semibold">Factors affecting D‑value:</span> Temperature, microbial species, spore state, suspending medium, pH, water activity [citation:2].</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results & Reference */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">D‑Value</h2>
                            <div className="bg-white/20 rounded-xl p-4 mb-4 text-center">
                                <div className="text-4xl font-bold">{dValue?.toFixed(2) ?? '—'}</div>
                                <div className="text-sm">{timeUnits}</div>
                                {temperature && <div className="text-xs mt-1">at {temperature}°C</div>}
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-sm">Log reduction achieved</div>
                                <div className="text-2xl font-bold">{logReduction?.toFixed(2) ?? '—'}</div>
                            </div>
                        </div>

                        {/* D‑value Reference Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                D‑values of Common Organisms [citation:2][citation:4]
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-2 px-3 text-left">Organism</th>
                                            <th className="py-2 px-3 text-left">Temp (°C)</th>
                                            <th className="py-2 px-3 text-left">D‑value (min)</th>
                                            <th className="py-2 px-3 text-left">Medium</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>B. stearothermophilus</td><td>121</td><td>1.5–3.0</td><td>Water/glucose</td></tr>
                                        <tr className="bg-gray-50"><td>C. botulinum</td><td>121</td><td>0.2–0.3</td><td>Phosphate buffer</td></tr>
                                        <tr><td>C. sporogenes</td><td>121</td><td>0.8–1.5</td><td>Meat medium</td></tr>
                                        <tr className="bg-gray-50"><td>B. subtilis</td><td>121</td><td>0.5–0.8</td><td>Water</td></tr>
                                        <tr><td>E. coli</td><td>60</td><td>0.5–1.0</td><td>Culture medium</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">D‑values vary with temperature, strain, and suspending medium [citation:2].</p>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Interpretation [citation:7]</h3>
                            <p className="text-sm">Higher D‑value = greater heat resistance. For sterilization, processes are designed to achieve 12‑log reduction of C. botulinum (12D concept).</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}