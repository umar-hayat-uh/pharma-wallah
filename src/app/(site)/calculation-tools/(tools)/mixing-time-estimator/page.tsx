"use client";
import { useState, useEffect } from 'react';
import { Clock, Activity, Gauge, AlertCircle, Info, BookOpen, BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MixingTimeEstimator() {
    const [tankDiameter, setTankDiameter] = useState<string>('');
    const [impellerDiameter, setImpellerDiameter] = useState<string>('');
    const [impellerSpeed, setImpellerSpeed] = useState<string>('');
    const [fluidViscosity, setFluidViscosity] = useState<string>('0.001');
    const [fluidDensity, setFluidDensity] = useState<string>('1000');
    const [mixingType, setMixingType] = useState<string>('blending');
    const [result, setResult] = useState<{
        mixingTime: number;
        powerNumber: number;
        reynoldsNumber: number;
        flowRegime: string;
        color: string;
        impellerType: string;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    // Impeller power numbers
    const impellerData = [
        { type: 'Rushton Turbine', Np: 5.0, application: 'Gas dispersion' },
        { type: 'Pitched Blade', Np: 1.5, application: 'Blending' },
        { type: 'Propeller', Np: 0.3, application: 'Low power blending' },
        { type: 'Anchor', Np: 0.3, application: 'High viscosity' },
        { type: 'Helical Ribbon', Np: 0.3, application: 'Very viscous' },
    ];

    const mixingConstants = {
        blending: 4,
        suspension: 8,
        reaction: 6,
        dispersion: 10,
    };

    const calculateMixingTime = () => {
        const D = parseFloat(tankDiameter);
        const d = parseFloat(impellerDiameter);
        const N = parseFloat(impellerSpeed);
        const μ = parseFloat(fluidViscosity);
        const ρ = parseFloat(fluidDensity);

        if (isNaN(D) || isNaN(d) || isNaN(N) || isNaN(μ) || isNaN(ρ) || D <= 0 || d <= 0 || N <= 0 || μ <= 0 || ρ <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Reynolds number
        const Re = (ρ * N * Math.pow(d, 2)) / μ;

        // Estimate power number based on Re and typical impeller (Rushton turbine as reference)
        let Np = 0;
        let flowRegime = '';
        if (Re < 10) {
            Np = 70 / Re;
            flowRegime = 'LAMINAR';
        } else if (Re < 10000) {
            Np = 70 / Math.pow(Re, 0.5);
            flowRegime = 'TRANSITIONAL';
        } else {
            Np = 5.0; // turbulent value for Rushton
            flowRegime = 'TURBULENT';
        }

        // Mixing time constant
        const K = mixingConstants[mixingType as keyof typeof mixingConstants] || 4;
        const mixingTime = K * Math.pow(D / d, 2) * (1 / N) * 60; // seconds

        // Determine impeller type recommendation
        let impellerType = 'Rushton Turbine';
        if (Re < 100) impellerType = 'Anchor / Helical Ribbon';
        else if (Re < 1000) impellerType = 'Pitched Blade';
        else impellerType = 'Rushton Turbine / Propeller';

        let color = mixingTime < 60 ? 'text-green-600' : mixingTime < 300 ? 'text-blue-600' : mixingTime < 600 ? 'text-yellow-600' : 'text-red-600';

        setResult({ mixingTime, powerNumber: Np, reynoldsNumber: Re, flowRegime, color, impellerType });

        // Generate mixing time vs speed curve
        const data = [];
        for (let n = 0.5; n <= N * 2; n += N / 10) {
            const t = K * Math.pow(D / d, 2) * (1 / n) * 60;
            data.push({ speed: n, time: t });
        }
        setChartData(data);
    };

    useEffect(() => {
        if (result) calculateMixingTime();
    }, [mixingType]);

    const reset = () => {
        setTankDiameter('');
        setImpellerDiameter('');
        setImpellerSpeed('');
        setFluidViscosity('0.001');
        setFluidDensity('1000');
        setMixingType('blending');
        setResult(null);
        setChartData([]);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Mixing Time Estimator</h1>
                                <p className="text-blue-100 mt-2">tₘ = K × (D/d)² × (1/N) </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Gauge className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Agitated Vessel Design</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                                Vessel & Impeller Parameters
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Tank diameter D (m)</label>
                                    <input type="number" step="0.01" value={tankDiameter} onChange={(e) => setTankDiameter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 1.5" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Impeller diameter d (m)</label>
                                    <input type="number" step="0.01" value={impellerDiameter} onChange={(e) => setImpellerDiameter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 0.5" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Impeller speed N (rps)</label>
                                    <input type="number" step="0.1" value={impellerSpeed} onChange={(e) => setImpellerSpeed(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 4" />
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Viscosity μ (Pa·s)</label>
                                    <input type="number" step="0.001" value={fluidViscosity} onChange={(e) => setFluidViscosity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                                    <label className="text-sm font-semibold mb-2">Density ρ (kg/m³)</label>
                                    <input type="number" step="1" value={fluidDensity} onChange={(e) => setFluidDensity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-200">
                                    <label className="text-sm font-semibold mb-2">Mixing objective</label>
                                    <select value={mixingType} onChange={(e) => setMixingType(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg">
                                        <option value="blending">Blending (K=4)</option>
                                        <option value="suspension">Solid suspension (K=8)</option>
                                        <option value="reaction">Chemical reaction (K=6)</option>
                                        <option value="dispersion">Dispersion (K=10)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mixing time vs speed chart */}
                            {chartData.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Mixing Time vs. Impeller Speed</h3>
                                    {/* Increased height to h-64 for better breathing room */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {/* Added margins to ensure labels have space */}
                                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 25, bottom: 35 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                                <XAxis
                                                    dataKey="speed"
                                                    fontSize={12}
                                                    label={{
                                                        value: "Speed (rps)",
                                                        position: "insideBottom",
                                                        offset: -25,
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <YAxis
                                                    fontSize={12}
                                                    label={{
                                                        value: "Time (s)",
                                                        angle: -90,
                                                        position: "insideLeft",
                                                        offset: -10,
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="time"
                                                    stroke="#2563eb"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: '#2563eb' }} // Added dots for clarity on speed points
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Formula */}
                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">tₘ = K × (D/d)² × (1/N) </p>
                                <p className="text-xs text-gray-600 mt-1">K depends on objective: blending 4, suspension 8, reaction 6, dispersion 10 .</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateMixingTime}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Estimate Mixing Time
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
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
                                    About Mixing Time
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> Mixing time is the time required to achieve a specified degree of homogeneity in a stirred vessel .</p>
                                    <p><span className="font-semibold">Correlation:</span> tₘ ∝ (D/d)² / N, with proportionality constant K depending on impeller type and process objective .</p>
                                    <p><span className="font-semibold">Reynolds number:</span> Re = ρ N d² / μ – indicates flow regime (laminar, transitional, turbulent).</p>
                                    <p><span className="font-semibold">Power number:</span> Np = P / (ρ N³ d⁵) – characterizes power consumption.</p>
                                    <p><span className="font-semibold">Applications:</span> Scale‑up, process optimization, equipment selection.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Results & Reference */}
                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <Clock className="w-7 h-7 mr-3" />
                                    Mixing Time
                                </h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.mixingTime.toFixed(0)} s</div>
                                    <div className={`text-lg font-bold ${result.color}`}>{result.flowRegime}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4 grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="font-semibold">Re</span> {result.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                    <div><span className="font-semibold">Np</span> {result.powerNumber.toFixed(2)}</div>
                                    <div className="col-span-2 mt-2"><span className="font-semibold">Recommended impeller:</span> {result.impellerType}</div>
                                </div>
                            </div>
                        )}

                        {/* Impeller Power Numbers */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Impeller Power Numbers
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <tr><th className="py-2 px-3 text-left">Impeller</th><th className="py-2 px-3 text-left">Np</th><th className="py-2 px-3 text-left">Application</th></tr>
                                    </thead>
                                    <tbody>
                                        {impellerData.map((imp, i) => (
                                            <tr key={i} className="border-b"><td className="py-2 px-3">{imp.type}</td><td>{imp.Np}</td><td className="text-gray-600">{imp.application}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Flow regime guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Flow Regime</h3>
                            <p>Re &lt; 10: Laminar<br />10 ≤ Re &lt; 10⁴: Transitional<br />Re ≥ 10⁴: Turbulent</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}