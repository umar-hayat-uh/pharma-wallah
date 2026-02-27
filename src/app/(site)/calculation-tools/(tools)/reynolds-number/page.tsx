"use client";
import { useState } from 'react';
import { Wind, Activity, Droplet, Gauge, AlertCircle } from 'lucide-react';

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
    };

    const resetCalculator = () => {
        setDensity('1000');
        setVelocity('');
        setDiameter('');
        setViscosity('0.001');
        setResult(null);
    };

    const fluidProperties = [
        { fluid: 'Water (20°C)', density: '998', viscosity: '0.001002' },
        { fluid: 'Air (20°C)', density: '1.204', viscosity: '0.0000181' },
        { fluid: 'Ethanol', density: '789', viscosity: '0.0012' },
        { fluid: 'Glycerin', density: '1260', viscosity: '1.49' },
        { fluid: 'Oil (SAE 30)', density: '920', viscosity: '0.29' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Wind className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Reynolds Number Calculator</h1>
                            <p className="text-gray-600">Determine flow regime in pipes and channels</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Wind className="w-6 h-6 mr-2" />
                            Reynolds Number Calculation
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Density (ρ) kg/m³
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={density}
                                    onChange={(e) => setDensity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    Velocity (v) m/s
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={velocity}
                                    onChange={(e) => setVelocity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 2.5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-purple-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-purple-800 mb-3">
                                    Diameter (D) m
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={diameter}
                                    onChange={(e) => setDiameter(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., 0.1"
                                />
                            </div>
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Viscosity (μ) Pa·s
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={viscosity}
                                    onChange={(e) => setViscosity(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Fluid Quick Picks */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-2">Quick Select Fluid</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {fluidProperties.map((f, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setDensity(f.density); setViscosity(f.viscosity); }}
                                        className="p-2 bg-white border rounded hover:bg-blue-50 text-xs"
                                    >
                                        {f.fluid.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mt-4">
                            <div className="text-center text-lg font-mono text-blue-700">
                                Re = (ρ × v × D) / μ
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateReynolds}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Re
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
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Reynolds Number</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.re.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className={`text-lg font-semibold mt-2 ${result.color}`}>
                                            {result.flowRegime}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Flow Characteristics</h4>
                                        <p className="text-sm text-gray-700">{result.description}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-800 mb-1">Friction Factor (f)</h4>
                                        <div className="text-2xl font-bold text-blue-600">{result.fFactor.toFixed(4)}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Flow Regime Reference */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Flow Regime Guide</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Laminar</span>
                                    <span className="text-blue-600 font-semibold">Re &lt; 2000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Transitional</span>
                                    <span className="text-yellow-600 font-semibold">2000 ≤ Re &lt; 4000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Turbulent</span>
                                    <span className="text-red-600 font-semibold">Re ≥ 4000</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Pipe sizing and pressure drop</li>
                                <li>Heat transfer coefficient estimation</li>
                                <li>Mixing equipment design</li>
                                <li>Scale-up of chemical processes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}