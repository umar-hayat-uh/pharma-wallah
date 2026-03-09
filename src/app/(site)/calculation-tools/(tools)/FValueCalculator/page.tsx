"use client";
import { useState, useEffect } from 'react';
import { Activity, Calculator, Thermometer, RefreshCw, AlertCircle, Sigma, Flame, BookOpen, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FValueCalculator() {
    const [dValue, setDValue] = useState<string>('1.5');
    const [logReduction, setLogReduction] = useState<string>('6');
    const [fValue, setFValue] = useState<number | null>(null);
    const [referenceTemp, setReferenceTemp] = useState<string>('121');
    const [processTemp, setProcessTemp] = useState<string>('121');
    const [zValue, setZValue] = useState<string>('10');
    const [f0Value, setF0Value] = useState<number | null>(null);
    const [timeUnits] = useState<'minutes' | 'seconds'>('minutes');
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const D = parseFloat(dValue);
        const log = parseFloat(logReduction);
        const T = parseFloat(processTemp);
        const Tref = parseFloat(referenceTemp);
        const Z = parseFloat(zValue);

        if (isNaN(D) || isNaN(log) || D <= 0 || log <= 0) return;
        
        // Basic F = D × log reduction [citation:5][citation:10]
        const F = D * log;
        setFValue(F);

        // F₀ calculation (equivalent minutes at 121°C) [citation:4][citation:5]
        if (!isNaN(T) && !isNaN(Tref) && !isNaN(Z)) {
            const F0 = F * Math.pow(10, (T - Tref) / Z);
            setF0Value(F0);
        }
    };

    useEffect(() => { calculate(); }, [dValue, logReduction, processTemp, referenceTemp, zValue]);

    const reset = () => { 
        setDValue('1.5'); 
        setLogReduction('6'); 
        setProcessTemp('121');
        setReferenceTemp('121');
        setZValue('10');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Flame className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">F‑Value Calculator</h1>
                            <p className="text-blue-100 mt-2">F = D × log reduction · F₀ at 121°C </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Lethality Parameters</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">D‑value ({timeUnits})</label>
                                    <input type="number" step="0.1" value={dValue} onChange={(e) => setDValue(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Desired log reduction</label>
                                    <input type="number" step="0.5" value={logReduction} onChange={(e) => setLogReduction(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Process temp (°C)</label>
                                    <input type="number" step="1" value={processTemp} onChange={(e) => setProcessTemp(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Reference temp (°C)</label>
                                    <select value={referenceTemp} onChange={(e) => setReferenceTemp(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg">
                                        <option value="121">121°C (F₀ standard)</option>
                                        <option value="100">100°C</option>
                                        <option value="134">134°C (flash)</option>
                                    </select>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <label className="text-sm font-semibold mb-2">z‑value (°C)</label>
                                    <select value={zValue} onChange={(e) => setZValue(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-lg">
                                        <option value="10">10°C (B. stearothermophilus)</option>
                                        <option value="12">12°C (C. botulinum)</option>
                                        <option value="8">8°C (Thermophiles)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">F = D × log reduction </p>
                                <p className="text-sm font-mono mt-1">F₀ = F × 10^((T − Tref)/z) </p>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate F
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
                                    About F‑value & F₀
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">F‑value:</span> The equivalent exposure time at a reference temperature required to achieve a specified log reduction .</p>
                                    <p><span className="font-semibold">F₀:</span> Special case with reference temperature 121°C and z = 10°C (for B. stearothermophilus). Used in pharmaceutical sterilization validation .</p>
                                    <p><span className="font-semibold">12D concept:</span> For C. botulinum, 12‑log reduction requires F₀ ≥ 2.52 min (12 × 0.21 min) .</p>
                                    <p><span className="font-semibold">Overkill method:</span> Pharmaceutical industry uses F₀ ≥ 12 min to ensure sterility regardless of bioburden .</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">F‑Value Results</h2>
                            <div className="bg-white/20 rounded-xl p-4 mb-4 text-center">
                                <div className="text-sm">F = D × log reduction</div>
                                <div className="text-4xl font-bold">{fValue?.toFixed(2) ?? '—'}</div>
                                <div className="text-xs">{timeUnits}</div>
                            </div>
                            {f0Value !== null && (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm">F₀ (equivalent at 121°C)</div>
                                    <div className="text-3xl font-bold">{f0Value.toFixed(2)} min</div>
                                </div>
                            )}
                        </div>

                        {/* F₀ Reference Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                F₀ per minute at various temperatures 
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-2 px-3 text-left">Temp (°C)</th>
                                            <th className="py-2 px-3 text-left">F₀ (min⁻¹)</th>
                                            <th className="py-2 px-3 text-left">Application</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>100</td><td>0.008</td><td>Pasteurization</td></tr>
                                        <tr className="bg-gray-50"><td>110</td><td>0.077</td><td>Low‑temp sterilization</td></tr>
                                        <tr><td>115</td><td>0.245</td><td>Pharmaceuticals</td></tr>
                                        <tr className="bg-gray-50"><td>121</td><td>0.975</td><td>Reference (F₀ standard)</td></tr>
                                        <tr><td>125</td><td>2.448</td><td>High‑temp short time</td></tr>
                                        <tr className="bg-gray-50"><td>130</td><td>7.743</td><td>Flash sterilization</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">z = 10°C assumed [citation:5]</p>
                        </div>

                        {/* Industry Standards */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Sterilization Standards</h3>
                            <div className="space-y-2 text-sm">
                                <div className="p-2 bg-green-50 rounded"><span className="font-semibold">Overkill:</span> F₀ ≥ 12 min</div>
                                <div className="p-2 bg-blue-50 rounded"><span className="font-semibold">C. botulinum:</span> F₀ ≥ 2.52 min (12D)</div>
                                <div className="p-2 bg-yellow-50 rounded"><span className="font-semibold">Medical devices:</span> F₀ ≥ 8 min</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}