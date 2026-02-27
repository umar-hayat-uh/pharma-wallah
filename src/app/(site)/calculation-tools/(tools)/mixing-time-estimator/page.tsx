"use client";
import { useState } from 'react';
import { Clock, Activity, Gauge, AlertCircle } from 'lucide-react';

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
    } | null>(null);

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

        const Re = (ρ * N * Math.pow(d, 2)) / μ;

        let Np = 0;
        let flowRegime = '';
        if (Re < 10) {
            Np = 70 / Re;
            flowRegime = 'LAMINAR';
        } else if (Re < 10000) {
            Np = 70 / Math.pow(Re, 0.5);
            flowRegime = 'TRANSITIONAL';
        } else {
            Np = 5.0;
            flowRegime = 'TURBULENT';
        }

        let K = mixingType === 'blending' ? 4 : mixingType === 'suspension' ? 8 : mixingType === 'reaction' ? 6 : 10;
        const mixingTime = K * Math.pow(D / d, 2) * (1 / N) * 60; // seconds

        let color = mixingTime < 60 ? 'text-green-600' : mixingTime < 300 ? 'text-blue-600' : mixingTime < 600 ? 'text-yellow-600' : 'text-red-600';

        setResult({ mixingTime, powerNumber: Np, reynoldsNumber: Re, flowRegime, color });
    };

    const resetCalculator = () => {
        setTankDiameter('');
        setImpellerDiameter('');
        setImpellerSpeed('');
        setFluidViscosity('0.001');
        setFluidDensity('1000');
        setResult(null);
    };

    const impellerTypes = [
        { type: 'Rushton Turbine', Np: '5.0', application: 'Gas dispersion' },
        { type: 'Pitched Blade', Np: '1.5', application: 'Blending' },
        { type: 'Propeller', Np: '0.3', application: 'Low power blending' },
        { type: 'Anchor', Np: '0.3', application: 'High viscosity' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Clock className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Mixing Time Estimator</h1>
                            <p className="text-gray-600">Estimate mixing times for agitated vessels</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Clock className="w-6 h-6 mr-2" />
                            Mixing Time Calculation
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Tank Diameter (m)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tankDiameter}
                                    onChange={(e) => setTankDiameter(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 1.5"
                                />
                            </div>
                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    Impeller Diameter (m)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={impellerDiameter}
                                    onChange={(e) => setImpellerDiameter(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 0.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-purple-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-purple-800 mb-3">
                                    Impeller Speed (rps)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={impellerSpeed}
                                    onChange={(e) => setImpellerSpeed(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., 4"
                                />
                            </div>
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Viscosity (Pa·s)
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={fluidViscosity}
                                    onChange={(e) => setFluidViscosity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-amber-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-amber-800 mb-3">
                                    Density (kg/m³)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    value={fluidDensity}
                                    onChange={(e) => setFluidDensity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-indigo-800 mb-3">
                                    Mixing Objective
                                </label>
                                <select
                                    value={mixingType}
                                    onChange={(e) => setMixingType(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                                >
                                    <option value="blending">Blending</option>
                                    <option value="suspension">Solid Suspension</option>
                                    <option value="reaction">Chemical Reaction</option>
                                    <option value="dispersion">Dispersion</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mt-4">
                            <div className="text-center text-lg font-mono text-blue-700">
                                t_mix = K × (D/d)² × (1/N)  (K depends on objective)
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateMixingTime}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Estimate Mixing Time
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Mixing Time</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.mixingTime.toFixed(0)} s
                                        </div>
                                        <div className={`text-lg font-semibold mt-2 ${result.color}`}>
                                            {result.flowRegime}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-sm">Power Number</div>
                                            <div className="text-xl font-bold">{result.powerNumber.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-sm">Reynolds</div>
                                            <div className="text-xl font-bold">{result.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Impeller Reference */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Impeller Power Numbers</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr>
                                        <th className="py-2 px-3 text-left">Type</th>
                                        <th className="py-2 px-3 text-left">Nₚ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {impellerTypes.map((imp, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2 px-3">{imp.type}</td>
                                            <td className="py-2 px-3">{imp.Np}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}