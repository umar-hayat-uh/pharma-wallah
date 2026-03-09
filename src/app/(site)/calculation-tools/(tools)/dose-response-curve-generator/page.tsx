"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';
import { Activity, RefreshCw, TrendingUp, Plus, Trash2, Settings, Target } from 'lucide-react';

interface CurveParams {
    id: string;
    name: string;
    emax: number;
    ec50: number;
    hill: number;
    baseline: number;
    color: string;
}

export default function DoseResponseCurveGenerator() {
    const [curves, setCurves] = useState<CurveParams[]>([
        { id: '1', name: 'Drug A', emax: 100, ec50: 10, hill: 1, baseline: 0, color: '#3b82f6' }
    ]);
    const [maxConc, setMaxConc] = useState<number>(100);
    const [pointsPerCurve] = useState<number>(150);
    const [linearData, setLinearData] = useState<any[]>([]);
    const [logData, setLogData] = useState<any[]>([]);
    const [nextId, setNextId] = useState<number>(2);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Generate data for all curves
    const generateAllData = () => {
        if (curves.length === 0) return;

        // Linear scale points (from 0 to maxConc)
        const linearPoints: any[] = [];
        const step = maxConc / pointsPerCurve;
        for (let i = 0; i <= pointsPerCurve; i++) {
            const conc = i * step;
            const point: any = { conc };
            curves.forEach(curve => {
                // Safeguard against zero or negative ec50
                const ec = curve.ec50 <= 0 ? 0.001 : curve.ec50;
                const effect = curve.baseline + (curve.emax * Math.pow(conc, curve.hill)) /
                    (Math.pow(ec, curve.hill) + Math.pow(conc, curve.hill));
                point[curve.id] = Math.min(effect, 100);
            });
            linearPoints.push(point);
        }
        setLinearData(linearPoints);

        // Log scale points (log concentration)
        const minLog = Math.log10(0.01 * Math.min(...curves.map(c => c.ec50 <= 0 ? 0.001 : c.ec50)));
        const maxLog = Math.log10(100 * Math.max(...curves.map(c => c.ec50 <= 0 ? 0.001 : c.ec50)));
        const logStep = (maxLog - minLog) / pointsPerCurve;
        const logPoints: any[] = [];
        for (let i = 0; i <= pointsPerCurve; i++) {
            const logConc = minLog + i * logStep;
            const conc = Math.pow(10, logConc);
            const point: any = { logConc, conc };
            curves.forEach(curve => {
                const ec = curve.ec50 <= 0 ? 0.001 : curve.ec50;
                const effect = curve.baseline + (curve.emax * Math.pow(conc, curve.hill)) /
                    (Math.pow(ec, curve.hill) + Math.pow(conc, curve.hill));
                point[curve.id] = Math.min(effect, 100);
            });
            logPoints.push(point);
        }
        setLogData(logPoints);
    };

    useEffect(() => {
        generateAllData();
    }, [curves, maxConc]);

    const addCurve = () => {
        const newCurve: CurveParams = {
            id: nextId.toString(),
            name: `Drug ${String.fromCharCode(65 + curves.length)}`,
            emax: 100,
            ec50: 10,
            hill: 1,
            baseline: 0,
            color: colorPalette[curves.length % colorPalette.length]
        };
        setCurves([...curves, newCurve]);
        setNextId(nextId + 1);
    };

    const removeCurve = (id: string) => {
        if (curves.length <= 1) return;
        setCurves(curves.filter(c => c.id !== id));
    };

    const updateCurve = (id: string, field: keyof CurveParams, value: number | string) => {
        setCurves(curves.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const reset = () => {
        setCurves([{ id: '1', name: 'Drug A', emax: 100, ec50: 10, hill: 1, baseline: 0, color: '#3b82f6' }]);
        setMaxConc(100);
        setNextId(2);
    };

    const sampleDrugs = [
        { name: 'Morphine', ec50: 10, emax: 100, hill: 1.2 },
        { name: 'Aspirin', ec50: 100, emax: 80, hill: 1.0 },
        { name: 'Propranolol', ec50: 1, emax: 100, hill: 0.8 },
        { name: 'Fentanyl', ec50: 0.1, emax: 100, hill: 1.5 },
        { name: 'Diazepam', ec50: 20, emax: 90, hill: 1.1 },
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setCurves([{
            id: '1',
            name: drug.name,
            emax: drug.emax,
            ec50: drug.ec50,
            hill: drug.hill,
            baseline: 0,
            color: '#3b82f6'
        }]);
    };

    // EC50 points for scatter
    const ec50Points = curves.map(curve => ({
        conc: curve.ec50,
        effect: curve.baseline + curve.emax / 2,
        name: curve.name,
        color: curve.color
    }));

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Dose‑Response Curve Generator</h1>
                                <p className="text-blue-100 mt-2">Advanced Hill equation with multiple curves</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" /> Settings
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Curve List */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Curves</h2>
                                <button
                                    onClick={addCurve}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <Plus className="w-4 h-4" /> Add Curve
                                </button>
                            </div>
                            <div className="space-y-4">
                                {curves.map((curve) => (
                                    <div key={curve.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: curve.color }} />
                                                <input
                                                    type="text"
                                                    value={curve.name}
                                                    onChange={(e) => updateCurve(curve.id, 'name', e.target.value)}
                                                    className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                            {curves.length > 1 && (
                                                <button
                                                    onClick={() => removeCurve(curve.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-600">Emax (%)</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="200"
                                                    value={curve.emax}
                                                    onChange={(e) => updateCurve(curve.id, 'emax', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600">EC₅₀ (nM)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.001"
                                                    value={curve.ec50}
                                                    onChange={(e) => updateCurve(curve.id, 'ec50', parseFloat(e.target.value) || 0.001)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600">Hill (n)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="5"
                                                    value={curve.hill}
                                                    onChange={(e) => updateCurve(curve.id, 'hill', parseFloat(e.target.value) || 0.1)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600">Baseline</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    max="100"
                                                    value={curve.baseline}
                                                    onChange={(e) => updateCurve(curve.id, 'baseline', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Settings */}
                            {showSettings && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-3">Plot Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Concentration (nM)</label>
                                            <input
                                                type="number"
                                                min="10"
                                                max="1000"
                                                value={maxConc}
                                                onChange={(e) => setMaxConc(parseFloat(e.target.value) || 100)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sample Drugs */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Drugs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {sampleDrugs.map((drug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                                        >
                                            <div className="font-semibold">{drug.name}</div>
                                            <div>EC₅₀ {drug.ec50}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={generateAllData}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg"
                                >
                                    Update Curves
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Plots */}
                    <div className="space-y-6">
                        {/* Linear Scale Plot */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Linear Scale</h3>
                            <div className="h-80">
                                {linearData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={linearData} margin={{ top: 30, right: 30, left: 20, bottom: 25 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="conc"
                                                label={{ value: 'Concentration (nM)', position: 'insideBottom', offset: -5 }}
                                                domain={[0, maxConc]}
                                                tickCount={6}
                                            />
                                            <YAxis domain={[0, 100]} label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 10 }} />
                                            {curves.map(curve => (
                                                <Line
                                                    key={curve.id}
                                                    type="monotone"
                                                    dataKey={curve.id}
                                                    stroke={curve.color}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name={curve.name}
                                                />
                                            ))}
                                            {curves.length <= 2 && curves.map(curve => (
                                                <ReferenceLine
                                                    key={`v-${curve.id}`}
                                                    x={curve.ec50}
                                                    stroke={curve.color}
                                                    strokeDasharray="3 3"
                                                    label={{ value: curve.name, position: 'top', fill: curve.color, fontSize: 10 }}
                                                />
                                            ))}
                                            <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="50%" />
                                            <Scatter
                                                data={ec50Points.map(p => ({ conc: p.conc, effect: p.effect }))}
                                                fill="#000"
                                                shape="circle"
                                                legendType="none"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No data – adjust parameters or add curves.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Log‑Dose Scale Plot */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Log‑Dose Scale</h3>
                            <div className="h-80">
                                {logData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={logData} margin={{ top: 30, right: 30, left: 20, bottom: 25 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="logConc"
                                                label={{ value: 'log₁₀ Concentration (nM)', position: 'insideBottom', offset: -5 }}
                                                tickFormatter={(v) => v.toFixed(1)}
                                                tickCount={6}
                                            />
                                            <YAxis domain={[0, 100]} label={{ value: 'Effect (%)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 10 }} />
                                            {curves.map(curve => (
                                                <Line
                                                    key={curve.id}
                                                    type="monotone"
                                                    dataKey={curve.id}
                                                    stroke={curve.color}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name={curve.name}
                                                />
                                            ))}
                                            {curves.length <= 2 && curves.map(curve => (
                                                <ReferenceLine
                                                    key={`log-${curve.id}`}
                                                    x={Math.log10(curve.ec50)}
                                                    stroke={curve.color}
                                                    strokeDasharray="3 3"
                                                    label={{ value: curve.name, position: 'top', fill: curve.color, fontSize: 10 }}
                                                />
                                            ))}
                                            <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" label="50%" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No data – adjust parameters or add curves.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formula Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Hill Equation</h3>
                            <p className="text-sm font-mono">E = E₀ + (Emax·Cⁿ) / (EC₅₀ⁿ + Cⁿ)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}