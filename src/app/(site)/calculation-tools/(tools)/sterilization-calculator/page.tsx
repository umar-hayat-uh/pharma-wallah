"use client";
import { useState, useEffect } from 'react';
import { Clock, Thermometer, Shield, RefreshCw, Info, AlertTriangle, Activity, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SterilizationCalculator() {
    const [temperature, setTemperature] = useState<string>('121');
    const [time, setTime] = useState<string>('');
    const [zValue, setZValue] = useState<string>('10');
    const [referenceTemp, setReferenceTemp] = useState<string>('121');
    const [sterilizationResult, setSterilizationResult] = useState<{
        f0Value: number;
        lethality: string;
        sterilizationLevel: string;
        description: string;
        color: string;
        decimalReduction: number;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateSterilization = () => {
        const T = parseFloat(temperature);
        const t = parseFloat(time);
        const Z = parseFloat(zValue);
        const Tref = parseFloat(referenceTemp);

        if (isNaN(T) || isNaN(t) || isNaN(Z) || isNaN(Tref) || t <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const exponent = (T - Tref) / Z;
        const f0Value = t * Math.pow(10, exponent);
        const decimalReduction = t * Math.pow(10, (T - Tref) / 10);

        let lethality = '';
        let sterilizationLevel = '';
        let description = '';
        let color = '';

        if (f0Value >= 12) {
            lethality = 'COMPLETE';
            sterilizationLevel = 'Commercial Sterility';
            description = '12‑log reduction of C. botulinum spores (F₀ ≥12) [citation:2]';
            color = 'text-green-600';
        } else if (f0Value >= 6) {
            lethality = 'HIGH';
            sterilizationLevel = 'Medical Sterility';
            description = '6‑log reduction of most pathogens (F₀ ≥6)';
            color = 'text-blue-600';
        } else if (f0Value >= 3) {
            lethality = 'MODERATE';
            sterilizationLevel = 'Food Industry Standard';
            description = 'Suitable for canned foods (F₀ ≥3) [citation:4]';
            color = 'text-yellow-600';
        } else {
            lethality = 'PARTIAL';
            sterilizationLevel = 'Pasteurization Level';
            description = 'Reduces vegetative cells only (F₀ <3)';
            color = 'text-orange-600';
        }

        setSterilizationResult({
            f0Value,
            lethality,
            sterilizationLevel,
            description,
            color,
            decimalReduction
        });

        // Generate lethality rate curve
        const data = [];
        for (let t = 0; t <= 60; t += 1) {
            data.push({ time: t, L: Math.pow(10, (T - Tref) / Z) });
        }
        setChartData(data);
    };

    useEffect(() => {
        if (time && temperature && zValue && referenceTemp) calculateSterilization();
    }, [temperature, time, zValue, referenceTemp]);

    const reset = () => {
        setTemperature('121');
        setTime('');
        setZValue('10');
        setReferenceTemp('121');
        setSterilizationResult(null);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Sterilization (F₀) Calculator</h1>
                            <p className="text-blue-100 mt-2">F₀ = t × 10^((T − 121)/z) </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Process Parameters</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <label className="text-sm font-semibold mb-2">Temperature (°C)</label>
                                    <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-lg" />
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Time (min)</label>
                                    <input type="number" step="0.1" value={time} onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">z‑value (°C)</label>
                                    <select value={zValue} onChange={(e) => setZValue(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg">
                                        <option value="10">10°C (B. stearothermophilus)</option>
                                        <option value="12">12°C (C. botulinum)</option>
                                        <option value="8">8°C (Thermophiles)</option>
                                    </select>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Reference T (°C)</label>
                                    <select value={referenceTemp} onChange={(e) => setReferenceTemp(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg">
                                        <option value="121">121°C (Standard)</option>
                                        <option value="115">115°C</option>
                                        <option value="134">134°C</option>
                                    </select>
                                </div>
                            </div>

                           {/* Lethality curve */}
{chartData.length > 0 && (
    <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
            Lethality Rate L(t) = 10^((T - T_ref) / z)
        </h3>
        {/* Increased height from h-48 to h-64 for better visibility */}
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                    data={chartData} 
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    
                    <XAxis 
                        dataKey="time" 
                        fontSize={12}
                        tickMargin={10}
                        label={{ value: "Time (min)", position: "insideBottom", offset: -20, fontSize: 14, fontWeight: 500 }} 
                    />
                    
                    <YAxis 
                        fontSize={12}
                        tickFormatter={(value) => value.toLocaleString()} 
                        label={{ 
                            value: "Lethality Rate", 
                            angle: -90, 
                            position: "insideLeft", 
                            style: { textAnchor: 'middle' },
                            offset: 0,
                            fontSize: 14,
                            fontWeight: 500
                        }} 
                    />
                    
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [typeof value === 'number' && value !== undefined ? value.toFixed(4) : 'N/A', "L(t)"]}
                    />
                    
                    <Line 
                        type="monotone" 
                        dataKey="L" 
                        stroke="#10b981"  // Changed to green to distinguish from the Survivor curve
                        strokeWidth={3} 
                        dot={false}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
)}

                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">F₀ = t × 10^((T − 121)/10) </p>
                                <p className="text-xs text-gray-600 mt-2">where z = 10°C for most spores, reference temperature 121°C</p>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateSterilization}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate F₀
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
                                    About F₀ Value
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> F₀ is the equivalent exposure time (in minutes) at 121°C that produces the same lethal effect as the actual time‑temperature profile [citation:4].</p>
                                    <p><span className="font-semibold">Significance:</span> F₀ allows comparison of sterilization cycles regardless of temperature variations. It accounts for the logarithmic relationship between temperature and microbial kill rate [citation:1][citation:5].</p>
                                    <p><span className="font-semibold">Z‑value:</span> The temperature change required to alter the D‑value by a factor of 10. For B. stearothermophilus (sterility indicator), z = 10°C [citation:5][citation:9].</p>
                                    <p><span className="font-semibold">Overkill design:</span> Pharmaceutical industry requires F₀ ≥ 12 minutes to ensure 10⁻⁶ sterility assurance level (SAL) [citation:9].</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results & Reference */}
                    <div className="space-y-6">
                        {sterilizationResult && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">F₀ Value</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-5xl font-bold mb-2">{sterilizationResult.f0Value.toFixed(2)} min</div>
                                    <div className="text-lg">{sterilizationResult.sterilizationLevel}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p>{sterilizationResult.description}</p>
                                </div>
                            </div>
                        )}

                        {/* F₀ Reference Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                F₀ Values per Minute [citation:5]
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-2 px-3 text-left">Temp (°C)</th>
                                            <th className="py-2 px-3 text-left">F₀ (min)</th>
                                            <th className="py-2 px-3 text-left">Application</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>100</td><td>0.008</td><td>Pasteurization</td></tr>
                                        <tr className="bg-gray-50"><td>110</td><td>0.077</td><td>Low‑temp</td></tr>
                                        <tr><td>115</td><td>0.245</td><td>Pharmaceuticals</td></tr>
                                        <tr className="bg-gray-50"><td>121</td><td>0.975</td><td>Standard</td></tr>
                                        <tr><td>125</td><td>2.448</td><td>HTST</td></tr>
                                        <tr className="bg-gray-50"><td>130</td><td>7.743</td><td>Flash</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Standards */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Sterilization Standards </h3>
                            <div className="space-y-2 text-sm">
                                <div className="p-2 bg-green-50 rounded"><span className="font-semibold">Overkill:</span> F₀ ≥ 12</div>
                                <div className="p-2 bg-blue-50 rounded"><span className="font-semibold">C. botulinum:</span> F₀ ≥ 2.52</div>
                                <div className="p-2 bg-yellow-50 rounded"><span className="font-semibold">Medical:</span> F₀ ≥ 8</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}