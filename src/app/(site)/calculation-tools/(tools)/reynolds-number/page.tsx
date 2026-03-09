"use client";
import { useState, useEffect } from 'react';
import { Wind, Activity, Droplet, Gauge, AlertCircle, Info, BookOpen, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReynoldsNumberCalculator() {
    const [density, setDensity] = useState<string>('1000');
    const [velocity, setVelocity] = useState<string>('');
    const [diameter, setDiameter] = useState<string>('');
    const [viscosity, setViscosity] = useState<string>('0.001');
    const [result, setResult] = useState<{
        re: number;
        flowRegime: string;
        description: string;
        color: string;
        fFactor: number;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const fluidProperties = [
        { fluid: 'Water (20°C)', density: '998', viscosity: '0.001002' },
        { fluid: 'Air (20°C)', density: '1.204', viscosity: '0.0000181' },
        { fluid: 'Ethanol', density: '789', viscosity: '0.0012' },
        { fluid: 'Glycerin', density: '1260', viscosity: '1.49' },
        { fluid: 'Oil (SAE 30)', density: '920', viscosity: '0.29' },
    ];

    const calculateReynolds = () => {
        const ρ = parseFloat(density);
        const v = parseFloat(velocity);
        const D = parseFloat(diameter);
        const μ = parseFloat(viscosity);

        if (isNaN(ρ) || isNaN(v) || isNaN(D) || isNaN(μ) || ρ <= 0 || v <= 0 || D <= 0 || μ <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const re = (ρ * v * D) / μ;

        let flowRegime = '', description = '', color = '', fFactor = 0;
        if (re < 2000) {
            flowRegime = 'LAMINAR FLOW';
            description = 'Smooth, predictable flow with parallel streamlines';
            color = 'text-blue-600';
            fFactor = 64 / re;
        } else if (re < 4000) {
            flowRegime = 'TRANSITIONAL FLOW';
            description = 'Unstable flow regime between laminar and turbulent';
            color = 'text-yellow-600';
            fFactor = 0.316 / Math.pow(re, 0.25);
        } else {
            flowRegime = 'TURBULENT FLOW';
            description = 'Chaotic flow with eddies and mixing';
            color = 'text-red-600';
            fFactor = 0.316 / Math.pow(re, 0.25);
        }

        setResult({ re, flowRegime, description, color, fFactor });

        // Generate Re vs velocity curve
        const data = [];
        for (let vel = 0.1; vel <= v * 2; vel += v / 10) {
            data.push({ velocity: vel, Re: (ρ * vel * D) / μ });
        }
        setChartData(data);
    };

    useEffect(() => {
        if (velocity && diameter) calculateReynolds();
    }, [density, velocity, diameter, viscosity]);

    const reset = () => {
        setDensity('1000');
        setVelocity('');
        setDiameter('');
        setViscosity('0.001');
        setResult(null);
        setChartData([]);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center">
                        <div className="bg-white/20 p-3 rounded-xl mr-4">
                            <Wind className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Reynolds Number Calculator</h1>
                            <p className="text-blue-100 mt-2">Re = ρ v D / μ </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Flow Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Density ρ (kg/m³)</label>
                                    <input type="number" step="0.001" value={density} onChange={(e) => setDensity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Velocity v (m/s)</label>
                                    <input type="number" step="0.01" value={velocity} onChange={(e) => setVelocity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 2.5" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Diameter D (m)</label>
                                    <input type="number" step="0.001" value={diameter} onChange={(e) => setDiameter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 0.1" />
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Viscosity μ (Pa·s)</label>
                                    <input type="number" step="0.000001" value={viscosity} onChange={(e) => setViscosity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                            </div>

                            {/* Fluid quick picks */}
                            <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Common Fluids</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {fluidProperties.map((f, i) => (
                                        <button key={i} onClick={() => { setDensity(f.density); setViscosity(f.viscosity); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            {f.fluid.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Re vs. Velocity chart */}
                            {chartData.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Reynolds Number (Re) vs. Velocity</h3>
                                    {/* Height increased to h-64 to accommodate labels */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 10, right: 30, left: 40, bottom: 40 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                                <XAxis
                                                    dataKey="velocity"
                                                    fontSize={12}
                                                    tickMargin={10}
                                                    label={{
                                                        value: "Velocity (m/s)",
                                                        position: "insideBottom",
                                                        offset: -20,
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <YAxis
                                                    fontSize={12}
                                                    width={60} // Added width to prevent large Re numbers from overlapping the label
                                                    tickFormatter={(value) => value.toLocaleString()}
                                                    label={{
                                                        value: "Reynolds Number (Re)",
                                                        angle: -90,
                                                        position: "insideLeft",
                                                        style: { textAnchor: 'middle' },
                                                        offset: -25, // Pushes label further left
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                />

                                                <Tooltip
                                                    formatter={(value) => [value !== undefined ? value.toLocaleString() : '0', "Re"]}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />

                                                <Line
                                                    type="monotone"
                                                    dataKey="Re"
                                                    stroke="#ef4444" // Using red for Reynolds Number
                                                    strokeWidth={3}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                            <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                <p className="text-sm font-mono">Re = ρ v D / μ </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateReynolds}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Re
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
                                    About Reynolds Number
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> Re is the ratio of inertial forces to viscous forces, indicating flow regime .</p>
                                    <p><span className="font-semibold">Laminar (Re &lt; 2000):</span> Smooth, ordered flow.</p>
                                    <p><span className="font-semibold">Transitional (2000 ≤ Re &lt; 4000):</span> Unstable, alternating between laminar and turbulent.</p>
                                    <p><span className="font-semibold">Turbulent (Re ≥ 4000):</span> Chaotic, eddies, enhanced mixing.</p>
                                    <p><span className="font-semibold">Applications:</span> Pipe sizing, heat transfer, mixing, scale‑up.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Reynolds Number</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.re.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                    <div className={`text-lg font-bold ${result.color}`}>{result.flowRegime}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p>{result.description}</p>
                                    <p className="text-sm mt-2">Friction factor f = {result.fFactor.toFixed(4)}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Flow Regime Guide</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Laminar</span><span className="text-blue-600 font-semibold">Re &lt; 2000</span></div>
                                <div className="flex justify-between"><span>Transitional</span><span className="text-yellow-600">2000–4000</span></div>
                                <div className="flex justify-between"><span>Turbulent</span><span className="text-red-600">Re ≥ 4000</span></div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Applications</h3>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Pipe sizing</li>
                                <li>Heat transfer coefficients</li>
                                <li>Mixing equipment</li>
                                <li>Scale‑up</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}