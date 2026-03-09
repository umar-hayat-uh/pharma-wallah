"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Calculator, TrendingUp, RefreshCw, AlertCircle, Target, Info } from 'lucide-react';

export default function EmaxModelCalculator() {
    const [emax, setEmax] = useState<string>('100');
    const [ec50, setEc50] = useState<string>('5');
    const [hill, setHill] = useState<string>('1');
    const [baseline, setBaseline] = useState<string>('0');
    const [conc, setConc] = useState<string>('10');
    const [effect, setEffect] = useState<number | null>(null);
    const [curveData, setCurveData] = useState<any[]>([]);
    const [logCurveData, setLogCurveData] = useState<any[]>([]);

    const calculateEffect = () => {
        const Em = parseFloat(emax);
        const EC50 = parseFloat(ec50);
        const n = parseFloat(hill);
        const C = parseFloat(conc);
        const base = parseFloat(baseline);

        if (isNaN(Em) || isNaN(EC50) || isNaN(n) || isNaN(C) || EC50 <= 0) return;

        // Hill equation
        const E = base + (Em * Math.pow(C, n)) / (Math.pow(EC50, n) + Math.pow(C, n));
        setEffect(E);

        // Linear scale data (from 0 to 5*EC50)
        const linear = [];
        const maxLinear = Math.max(EC50 * 5, C * 1.5);
        for (let x = 0; x <= maxLinear; x += maxLinear / 200) {
            const y = base + (Em * Math.pow(x, n)) / (Math.pow(EC50, n) + Math.pow(x, n));
            linear.push({ conc: x, effect: Math.min(y, 100) });
        }
        setCurveData(linear);

        // Log scale data (from EC50/100 to EC50*100)
        const logData = [];
        const minLog = Math.log10(EC50 / 100);
        const maxLog = Math.log10(EC50 * 100);
        for (let logC = minLog; logC <= maxLog; logC += (maxLog - minLog) / 200) {
            const x = Math.pow(10, logC);
            const y = base + (Em * Math.pow(x, n)) / (Math.pow(EC50, n) + Math.pow(x, n));
            logData.push({ logConc: logC, effect: Math.min(y, 100) });
        }
        setLogCurveData(logData);
    };

    useEffect(() => {
        calculateEffect();
    }, [emax, ec50, hill, baseline, conc]);

    const reset = () => {
        setEmax('100');
        setEc50('5');
        setHill('1');
        setBaseline('0');
        setConc('10');
    };

    const sampleDrugs = [
        { name: 'Morphine', ec50: 10, emax: 100, hill: 1.2 },
        { name: 'Aspirin', ec50: 100, emax: 80, hill: 1.0 },
        { name: 'Fentanyl', ec50: 0.1, emax: 100, hill: 1.5 },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Emax Model Calculator</h1>
                                <p className="text-blue-100 mt-2">Sigmoidal Emax (Hill) equation</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">PK‑PD modeling</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Model Parameters</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emax (%)</label>
                                    <input type="number" step="1" value={emax} onChange={(e) => setEmax(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">EC₅₀ (nM)</label>
                                    <input type="number" step="0.1" value={ec50} onChange={(e) => setEc50(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hill coefficient</label>
                                    <input type="number" step="0.1" value={hill} onChange={(e) => setHill(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Baseline (%)</label>
                                    <input type="number" step="1" value={baseline} onChange={(e) => setBaseline(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Concentration (nM)</label>
                                    <input type="number" step="0.1" value={conc} onChange={(e) => setConc(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            {/* Sample Drugs */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Drugs</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {sampleDrugs.map((drug, idx) => (
                                        <button key={idx} onClick={() => { setEc50(drug.ec50.toString()); setEmax(drug.emax.toString()); setHill(drug.hill.toString()); setBaseline('0'); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{drug.name}</div>
                                            <div>EC₅₀ {drug.ec50}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateEffect}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Calculate Effect
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl">
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="space-y-6">
                        {/* Effect Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Effect at [C]</h2>
                            <div className="bg-white/20 rounded-xl p-6 text-center">
                                {effect !== null ? (
                                    <>
                                        <div className="text-5xl font-bold mb-2">{effect.toFixed(1)}%</div>
                                        <div className="text-lg">of maximum</div>
                                    </>
                                ) : (
                                    <div className="text-3xl font-bold">Enter values</div>
                                )}
                            </div>
                        </div>

                        {/* Linear Scale Plot */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Linear Scale</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={curveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="conc" label={{ value: 'Concentration (nM)', position: 'insideBottom', offset: -5 }} />
                                        <YAxis domain={[0, 100]} label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="effect" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <ReferenceLine x={parseFloat(ec50)} stroke="#ef4444" strokeDasharray="3 3" label="EC₅₀" />
                                        <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="50%" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Log Scale Plot */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Log‑Dose Scale</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={logCurveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="logConc" label={{ value: 'log₁₀ Concentration (nM)', position: 'insideBottom', offset: -5 }} tickFormatter={(v) => v.toFixed(1)} />
                                        <YAxis domain={[0, 100]} label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="effect" stroke="#10b981" strokeWidth={2} dot={false} />
                                        <ReferenceLine x={Math.log10(parseFloat(ec50))} stroke="#ef4444" strokeDasharray="3 3" label="EC₅₀" />
                                        <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="50%" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                {effect !== null && (
                                    <>
                                        {effect < 50 && 'Below EC₅₀ – effect less than half maximal.'}
                                        {effect >= 50 && effect < 80 && 'Therapeutic range – between 50% and 80% of Emax.'}
                                        {effect >= 80 && 'Near maximal effect – plateau region.'}
                                    </>
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Hill coefficient n &gt; 1 indicates positive cooperativity.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}