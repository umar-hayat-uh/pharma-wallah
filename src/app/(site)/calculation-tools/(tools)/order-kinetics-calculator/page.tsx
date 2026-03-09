"use client";
import { useState, useEffect } from 'react';
import {
    TrendingDown,
    Calculator,
    BarChart,
    RefreshCw,
    AlertCircle,
    CalendarCheck2Icon,
    Zap,
    Clock,
    Activity,
    ShieldAlertIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type KineticsType = 'first-order' | 'zero-order' | 'mixed' | 'comparison';

export default function KineticsCalculator() {
    const [kineticsType, setKineticsType] = useState<KineticsType>('first-order');
    const [initialConcentration, setInitialConcentration] = useState<string>('100');
    const [eliminationConstant, setEliminationConstant] = useState<string>('0.1');
    const [maxRate, setMaxRate] = useState<string>('10');
    const [km, setKm] = useState<string>('50');
    const [timePoints] = useState<number[]>([0, 1, 2, 4, 6, 8, 12, 24]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [halfLife, setHalfLife] = useState<number | null>(null);
    const [timeToEliminate, setTimeToEliminate] = useState<number | null>(null);

    const calculateKinetics = () => {
        const c0 = parseFloat(initialConcentration);
        const ke = parseFloat(eliminationConstant);
        const vmax = parseFloat(maxRate);
        const kmVal = parseFloat(km);

        if (isNaN(c0) || c0 <= 0) return;

        const data: any[] = [];
        let firstOrder: number[] = [], zeroOrder: number[] = [], mixed: number[] = [];

        // First-order: C(t) = C0 * e^(-ke*t) [citation:7]
        timePoints.forEach(t => {
            firstOrder.push(c0 * Math.exp(-ke * t));
        });

        // Zero-order: C(t) = C0 - vmax*t (until zero) [citation:7]
        timePoints.forEach(t => {
            zeroOrder.push(Math.max(0, c0 - vmax * t));
        });

        // Michaelis-Menten (simplified Euler integration)
        let currentC = c0;
        timePoints.forEach((t, idx) => {
            if (idx === 0) {
                mixed.push(currentC);
            } else {
                const dt = t - timePoints[idx-1];
                const rate = (vmax * currentC) / (kmVal + currentC);
                currentC = Math.max(0, currentC - rate * dt);
                mixed.push(currentC);
            }
        });

        // Build chart data
        const chartRows = timePoints.map((t, idx) => ({
            time: t,
            'First-Order': firstOrder[idx],
            'Zero-Order': zeroOrder[idx],
            'Mixed': mixed[idx],
        }));
        setChartData(chartRows);

        // Calculate half-life for first-order [citation:7]
        setHalfLife(0.693 / ke);
        setTimeToEliminate(c0 / vmax);
    };

    const resetCalculator = () => {
        setInitialConcentration('100');
        setEliminationConstant('0.1');
        setMaxRate('10');
        setKm('50');
        setChartData([]);
        setHalfLife(null);
        setTimeToEliminate(null);
    };

    const sampleDrugs = [
        { name: 'Ethanol (Zero-order)', type: 'zero-order', c0: '100', vmax: '10', note: 'Saturable metabolism' },
        { name: 'Most Drugs (First-order)', type: 'first-order', c0: '100', ke: '0.1', note: 'Linear elimination' },
        { name: 'Phenytoin (Mixed)', type: 'mixed', c0: '20', vmax: '8', km: '6', note: 'Michaelis-Menten' },
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setKineticsType(drug.type as KineticsType);
        setInitialConcentration(drug.c0);
        if (drug.vmax) setMaxRate(drug.vmax);
        if (drug.ke) setEliminationConstant(drug.ke);
        if (drug.km) setKm(drug.km);
    };

    const getKineticsDescription = (type: KineticsType) => {
        switch (type) {
            case 'first-order': return 'Rate proportional to concentration – constant half‑life';
            case 'zero-order': return 'Constant rate independent of concentration – time to eliminate depends on dose';
            case 'mixed': return 'Saturable (Michaelis-Menten) kinetics – shifts from first to zero at high doses';
            case 'comparison': return 'Compare first-order and zero-order models';
        }
    };

    useEffect(() => {
        calculateKinetics();
    }, [kineticsType, initialConcentration, eliminationConstant, maxRate, km]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Kinetics Calculator</h1>
                                <p className="text-blue-100 mt-2">First‑order, zero‑order & Michaelis‑Menten elimination models</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <LineChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Elimination Models</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Model Selection
                            </h2>

                            {/* Model Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <button onClick={() => setKineticsType('first-order')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'first-order' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <TrendingDown className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">First-Order</span>
                                </button>
                                <button onClick={() => setKineticsType('zero-order')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'zero-order' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <BarChart className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Zero-Order</span>
                                </button>
                                <button onClick={() => setKineticsType('mixed')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'mixed' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Mixed</span>
                                </button>
                                <button onClick={() => setKineticsType('comparison')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'comparison' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <CalendarCheck2Icon className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Compare</span>
                                </button>
                            </div>

                            {/* Description */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-700">{getKineticsDescription(kineticsType)}</p>
                            </div>

                            {/* Inputs */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Initial Conditions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">C₀ (mg/L)</label>
                                        <input type="number" step="0.1" value={initialConcentration}
                                            onChange={(e) => setInitialConcentration(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                </div>

                                {kineticsType !== 'comparison' && (
                                    <div className="mt-4">
                                        {kineticsType === 'first-order' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">kₑ (h⁻¹)</label>
                                                <input type="number" step="0.01" value={eliminationConstant}
                                                    onChange={(e) => setEliminationConstant(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                            </div>
                                        )}
                                        {kineticsType === 'zero-order' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">V_max (mg/L/h)</label>
                                                <input type="number" step="0.1" value={maxRate}
                                                    onChange={(e) => setMaxRate(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                            </div>
                                        )}
                                        {kineticsType === 'mixed' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">V_max (mg/L/h)</label>
                                                    <input type="number" step="0.1" value={maxRate}
                                                        onChange={(e) => setMaxRate(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">K_m (mg/L)</label>
                                                    <input type="number" step="0.1" value={km}
                                                        onChange={(e) => setKm(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sample Drugs */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Examples</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sampleDrugs.map((drug, index) => (
                                        <button key={index} onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center">
                                            <div className="font-semibold text-blue-700">{drug.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">{drug.note}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateKinetics}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Simulate Kinetics
                                </button>
                                <button onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    <div className="space-y-6">
                        {/* Results Summary */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <LineChart className="w-7 h-7 mr-3" />
                                Results
                            </h2>
                            <div className="space-y-4">
                                {halfLife !== null && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                        <div className="text-sm font-semibold text-blue-100">Half-Life</div>
                                        <div className="text-3xl font-bold">{halfLife.toFixed(2)} h</div>
                                    </div>
                                )}
                                {timeToEliminate !== null && (
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <div className="text-sm font-semibold mb-1">Time to Eliminate</div>
                                        <div className="text-2xl font-bold">{timeToEliminate.toFixed(1)} h</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Concentration-Time Profile</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" label="Time (h)" />
                                            <YAxis label="Conc (mg/L)" />
                                            <Tooltip />
                                            <Legend />
                                            {kineticsType === 'comparison' ? (
                                                <>
                                                    <Line type="monotone" dataKey="First-Order" stroke="#3b82f6" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="Zero-Order" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                                                </>
                                            ) : (
                                                <Line type="monotone" dataKey={
                                                    kineticsType === 'first-order' ? 'First-Order' :
                                                    kineticsType === 'zero-order' ? 'Zero-Order' : 'Mixed'
                                                } stroke="#3b82f6" strokeWidth={2} />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Clinical Implications */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Clinical Implications
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• First‑order: Safe, predictable elimination; dose proportional [citation:7]</li>
                                <li>• Zero‑order: Risk of accumulation at high doses; small dose changes can cause large concentration swings [citation:7]</li>
                                <li>• Mixed kinetics: Requires therapeutic drug monitoring (phenytoin, theophylline)</li>
                            </ul>
                        </div>

                        {/* Model Comparison Table */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Model Comparison</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span className="font-semibold">Parameter</span>
                                    <span className="font-semibold">First-Order</span>
                                    <span className="font-semibold">Zero-Order</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>Rate</span>
                                    <span>k·C</span>
                                    <span>V_max</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>Half-life</span>
                                    <span>Constant</span>
                                    <span>Variable</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white/50 rounded">
                                    <span>Examples</span>
                                    <span>Most drugs</span>
                                    <span>Ethanol, Aspirin (high dose)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}