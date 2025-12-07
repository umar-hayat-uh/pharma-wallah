"use client";
import { useState, useEffect } from 'react';
import { LineChart, BarChart3, Activity, Heart, Brain, AlertTriangle, Calculator, Target, Clock, Zap, Shield, RefreshCw, Info, TrendingUp, TrendingDown, Percent, Pill } from 'lucide-react';

export default function PharmacologyCalculators() {
    const [activeTab, setActiveTab] = useState<'dose-response' | 'therapeutic-index' | 'binding-affinity' | 'ed50' | 'half-life'>('dose-response');

    return (
        <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Pill className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Pharmacology Calculators</h1>
                            <p className="text-gray-600 text-lg mt-2">Advanced tools for drug development and pharmacodynamic analysis</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center mt-6">
                        <button
                            onClick={() => setActiveTab('dose-response')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dose-response'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <LineChart className="w-5 h-5 mr-2" />
                            Dose-Response Curve
                        </button>
                        <button
                            onClick={() => setActiveTab('therapeutic-index')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'therapeutic-index'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Therapeutic Index
                        </button>
                        <button
                            onClick={() => setActiveTab('binding-affinity')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'binding-affinity'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Target className="w-5 h-5 mr-2" />
                            Binding Affinity
                        </button>
                        <button
                            onClick={() => setActiveTab('ed50')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'ed50'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Activity className="w-5 h-5 mr-2" />
                            ED50/TD50/LD50
                        </button>
                        <button
                            onClick={() => setActiveTab('half-life')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'half-life'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Drug Half-Life
                        </button>
                    </div>
                </div>

                {/* Calculator Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {activeTab === 'dose-response' && <DoseResponseCurveGenerator />}
                    {activeTab === 'therapeutic-index' && <TherapeuticIndexCalculator />}
                    {activeTab === 'binding-affinity' && <DrugReceptorBindingAffinityTool />}
                    {activeTab === 'ed50' && <ED50TD50LD50Calculator />}
                    {activeTab === 'half-life' && <DrugHalfLifeCalculator />}
                </div>

                {/* Quick Reference Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-6">
                        <Info className="w-8 h-8 text-green-400 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Pharmacology Quick Reference</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                            <h4 className="font-bold text-purple-800 mb-4">Dose-Response</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>EC50 Range</span>
                                    <span className="font-semibold">nM - μM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hill Slope</span>
                                    <span className="font-semibold">0.5-2.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Emax</span>
                                    <span className="font-semibold">0-100%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                            <h4 className="font-bold text-blue-800 mb-4">Therapeutic Index</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Narrow</span>
                                    <span className="font-semibold text-red-600">TI {'<'} 3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Moderate</span>
                                    <span className="font-semibold text-yellow-600">3-10</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Wide</span>
                                    <span className="font-semibold text-green-600">TI {'>'} 10</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
                            <h4 className="font-bold text-red-800 mb-4">Binding Affinity</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>High Affinity</span>
                                    <span className="font-semibold">Kd {'<'} 1 nM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Medium</span>
                                    <span className="font-semibold">1 nM - 1 μM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Low Affinity</span>
                                    <span className="font-semibold">Kd {'>'} 1 μM</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                            <h4 className="font-bold text-green-800 mb-4">Drug Safety</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>ED50</span>
                                    <span className="font-semibold">Effective Dose</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TD50</span>
                                    <span className="font-semibold">Toxic Dose</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>LD50</span>
                                    <span className="font-semibold">Lethal Dose</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6">
                            <h4 className="font-bold text-amber-800 mb-4">Half-Life</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Short</span>
                                    <span className="font-semibold">{"<"} 4 hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Medium</span>
                                    <span className="font-semibold">4-24 hours</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Long</span>
                                    <span className="font-semibold">{'>'} 24 hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 1. Dose-Response Curve Generator
function DoseResponseCurveGenerator() {
    const [emax, setEmax] = useState<string>('100');
    const [ec50, setEc50] = useState<string>('10');
    const [hillCoefficient, setHillCoefficient] = useState<string>('1');
    const [baseline, setBaseline] = useState<string>('0');
    const [drugName, setDrugName] = useState<string>('Drug A');
    const [curveData, setCurveData] = useState<Array<{ x: number, y: number }>>([]);
    const [logCurveData, setLogCurveData] = useState<Array<{ x: number, y: number }>>([]);

    useEffect(() => {
        generateCurve();
    }, [emax, ec50, hillCoefficient, baseline]);

    const generateCurve = () => {
        const E_max = parseFloat(emax);
        const EC_50 = parseFloat(ec50);
        const n = parseFloat(hillCoefficient);
        const base = parseFloat(baseline);

        // Generate linear scale data
        const linearData = [];
        for (let x = 0; x <= 100; x += 1) {
            const y = base + (E_max * Math.pow(x, n)) / (Math.pow(EC_50, n) + Math.pow(x, n));
            linearData.push({ x, y: Math.min(y, 100) });
        }
        setCurveData(linearData);

        // Generate log scale data
        const logData = [];
        for (let x = -3; x <= 3; x += 0.1) {
            const concentration = Math.pow(10, x) * EC_50;
            const y = base + (E_max * Math.pow(concentration, n)) / (Math.pow(EC_50, n) + Math.pow(concentration, n));
            logData.push({ x: x + Math.log10(EC_50), y: Math.min(y, 100) });
        }
        setLogCurveData(logData);
    };

    const resetCalculator = () => {
        setEmax('100');
        setEc50('10');
        setHillCoefficient('1');
        setBaseline('0');
        setDrugName('Drug A');
    };

    const sampleDrugs = [
        { name: 'Morphine', EC50: '10', Emax: '100', Hill: '1.2' },
        { name: 'Aspirin', EC50: '100', Emax: '80', Hill: '1.0' },
        { name: 'Propranolol', EC50: '1', Emax: '100', Hill: '0.8' },
        { name: 'Fentanyl', EC50: '0.1', Emax: '100', Hill: '1.5' },
        { name: 'Diazepam', EC50: '20', Emax: '90', Hill: '1.1' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <LineChart className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dose-Response Curve Generator</h2>
                    <p className="text-gray-600">Generate and analyze dose-response curves using Hill equation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Maximum Effect (Emax) %
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={emax}
                                onChange={(e) => setEmax(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 100"
                            />
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                EC50 (nM)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.001"
                                value={ec50}
                                onChange={(e) => setEc50(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Hill Coefficient (n)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="5"
                                value={hillCoefficient}
                                onChange={(e) => setHillCoefficient(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 1"
                            />
                            <p className="text-xs text-gray-600 mt-1">Steepness of curve</p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Baseline Effect %
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={baseline}
                                onChange={(e) => setBaseline(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 0"
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Drug Name
                        </label>
                        <input
                            type="text"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                            placeholder="e.g., Morphine"
                        />
                    </div>

                    {/* Dose-Response Curve Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Dose-Response Curve (Linear Scale)</h3>
                        <div className="relative h-64">
                            {/* Grid */}
                            <div className="absolute inset-0">
                                {/* Horizontal grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <div key={y} className="absolute w-full h-px bg-gray-300" style={{ top: `${100 - y}%` }} />
                                ))}
                                {/* Vertical grid lines */}
                                {[0, 25, 50, 75, 100].map(x => (
                                    <div key={x} className="absolute h-full w-px bg-gray-300" style={{ left: `${x}%` }} />
                                ))}
                            </div>

                            {/* Axes */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                            {/* Curve */}
                            <svg className="absolute inset-0 w-full h-full">
                                <path
                                    d={`M 0,${100 - parseFloat(baseline)} ${curveData.map((point, i) => `L ${point.x},${100 - point.y}`).join(' ')}`}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                />

                                {/* EC50 point */}
                                <circle
                                    cx={parseFloat(ec50)}
                                    cy={100 - (parseFloat(baseline) + (parseFloat(emax) * 0.5))}
                                    r="4"
                                    fill="#ef4444"
                                />

                                {/* Emax line */}
                                <line
                                    x1="0"
                                    y1={100 - parseFloat(emax)}
                                    x2="100"
                                    y2={100 - parseFloat(emax)}
                                    stroke="#3b82f6"
                                    strokeWidth="1"
                                    strokeDasharray="5,5"
                                />
                            </svg>

                            {/* Labels */}
                            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0 nM</div>
                            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">100 nM</div>
                            <div className="absolute -left-8 top-0 text-xs text-gray-600 -rotate-90">Effect %</div>

                            {/* EC50 label */}
                            <div className="absolute" style={{ left: `${parseFloat(ec50)}%`, top: `${100 - (parseFloat(baseline) + (parseFloat(emax) * 0.5))}%` }}>
                                <div className="relative -left-6 -top-8 bg-white px-2 py-1 rounded shadow text-xs font-bold text-red-600">
                                    EC50
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                                <span className="text-xs">Response Curve</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                <span className="text-xs">EC50 Point</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1 border border-dashed"></div>
                                <span className="text-xs">Emax Line</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={generateCurve}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Generate Curve
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Log Scale Curve */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Log Dose-Response Curve</h3>

                        <div className="relative h-64">
                            {/* Grid */}
                            <div className="absolute inset-0">
                                {/* Horizontal grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <div key={y} className="absolute w-full h-px bg-gray-300" style={{ top: `${100 - y}%` }} />
                                ))}
                                {/* Vertical grid lines (log scale) */}
                                {[-2, -1, 0, 1, 2].map(x => (
                                    <div key={x} className="absolute h-full w-px bg-gray-300" style={{ left: `${((x + 3) / 6) * 100}%` }} />
                                ))}
                            </div>

                            {/* Axes */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                            {/* Curve */}
                            <svg className="absolute inset-0 w-full h-full">
                                <path
                                    d={`M ${((logCurveData[0]?.x + 3) / 6) * 100 || 0},${100 - logCurveData[0]?.y || 0} ${logCurveData.map(point => `L ${((point.x + 3) / 6) * 100},${100 - point.y}`).join(' ')}`}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                />

                                {/* EC50 point */}
                                <circle
                                    cx={50}
                                    cy={100 - (parseFloat(baseline) + (parseFloat(emax) * 0.5))}
                                    r="4"
                                    fill="#ef4444"
                                />
                            </svg>

                            {/* Labels */}
                            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0.001x EC50</div>
                            <div className="absolute -bottom-6 left-1/3 text-xs text-gray-600">0.1x EC50</div>
                            <div className="absolute -bottom-6 left-1/2 text-xs text-gray-600 font-bold">EC50</div>
                            <div className="absolute -bottom-6 right-1/3 text-xs text-gray-600">10x EC50</div>
                            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">1000x EC50</div>
                        </div>

                        <div className="mt-4 text-center">
                            <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                E = E₀ + (E_max × [C]ⁿ) / (EC₅₀ⁿ + [C]ⁿ)
                            </div>
                        </div>
                    </div>

                    {/* Curve Parameters */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Curve Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-sm font-semibold text-gray-600">EC50</div>
                                <div className="text-2xl font-bold text-green-600">{ec50} nM</div>
                                <div className="text-xs text-gray-500 mt-1">50% Effective Concentration</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="text-sm font-semibold text-gray-600">Emax</div>
                                <div className="text-2xl font-bold text-blue-600">{emax}%</div>
                                <div className="text-xs text-gray-500 mt-1">Maximum Response</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="text-sm font-semibold text-gray-600">Hill Coefficient</div>
                                <div className="text-2xl font-bold text-purple-600">{hillCoefficient}</div>
                                <div className="text-xs text-gray-500 mt-1">Curve Steepness</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm font-semibold text-gray-600">Baseline</div>
                                <div className="text-2xl font-bold text-gray-600">{baseline}%</div>
                                <div className="text-xs text-gray-500 mt-1">Zero Dose Response</div>
                            </div>
                        </div>
                    </div>

                    {/* Sample Drugs Reference */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Drug Parameters</h3>
                        <div className="space-y-3">
                            {sampleDrugs.map((drug, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setEc50(drug.EC50);
                                        setEmax(drug.Emax);
                                        setHillCoefficient(drug.Hill);
                                    }}
                                    className="w-full bg-white rounded-lg p-4 hover:bg-purple-50 transition-colors text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{drug.name}</div>
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                            EC50: {drug.EC50} nM
                                        </div>
                                    </div>
                                    <div className="flex text-sm text-gray-600 space-x-4">
                                        <div>Emax: {drug.Emax}%</div>
                                        <div>Hill: {drug.Hill}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Therapeutic Index Calculator
function TherapeuticIndexCalculator() {
    const [td50, setTd50] = useState<string>('');
    const [ed50, setEd50] = useState<string>('');
    const [drugName, setDrugName] = useState<string>('');
    const [result, setResult] = useState<{
        ti: number;
        margin: string;
        safety: string;
        color: string;
        interpretation: string;
    } | null>(null);

    const calculateTI = () => {
        const TD50 = parseFloat(td50);
        const ED50 = parseFloat(ed50);

        if (isNaN(TD50) || isNaN(ED50) || TD50 <= 0 || ED50 <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const ti = TD50 / ED50;

        let margin = '';
        let safety = '';
        let color = '';
        let interpretation = '';

        if (ti < 2) {
            margin = 'VERY NARROW';
            safety = 'HIGH RISK';
            color = 'text-red-600';
            interpretation = 'Drug requires close monitoring and precise dosing';
        } else if (ti >= 2 && ti < 5) {
            margin = 'NARROW';
            safety = 'MODERATE RISK';
            color = 'text-orange-600';
            interpretation = 'Caution required, therapeutic drug monitoring recommended';
        } else if (ti >= 5 && ti < 10) {
            margin = 'MODERATE';
            safety = 'ACCEPTABLE';
            color = 'text-yellow-600';
            interpretation = 'Standard precautions apply';
        } else {
            margin = 'WIDE';
            safety = 'SAFE';
            color = 'text-green-600';
            interpretation = 'Drug has good safety margin';
        }

        setResult({
            ti,
            margin,
            safety,
            color,
            interpretation
        });
    };

    const resetCalculator = () => {
        setTd50('');
        setEd50('');
        setDrugName('');
        setResult(null);
    };

    const sampleDrugs = [
        { name: 'Digoxin', ED50: '0.8', TD50: '2.0', TI: '2.5', safety: 'Narrow' },
        { name: 'Warfarin', ED50: '1.5', TD50: '3.0', TI: '2.0', safety: 'Very Narrow' },
        { name: 'Penicillin', ED50: '10', TD50: '500', TI: '50', safety: 'Wide' },
        { name: 'Lithium', ED50: '0.5', TD50: '1.5', TI: '3.0', safety: 'Narrow' },
        { name: 'Aspirin', ED50: '100', TD50: '500', TI: '5.0', safety: 'Moderate' },
    ];

    const safetyGuidelines = [
        { range: 'TI < 2', classification: 'Very Narrow', monitoring: 'Continuous TDM required' },
        { range: 'TI 2-5', classification: 'Narrow', monitoring: 'Regular TDM recommended' },
        { range: 'TI 5-10', classification: 'Moderate', monitoring: 'Routine monitoring' },
        { range: 'TI > 10', classification: 'Wide', monitoring: 'Minimal monitoring' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <BarChart3 className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Therapeutic Index Calculator</h2>
                    <p className="text-gray-600">Calculate therapeutic index and safety margin</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                            Effective Dose 50% (ED50)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={ed50}
                            onChange={(e) => setEd50(e.target.value)}
                            className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                            placeholder="e.g., 10 (mg/kg)"
                        />
                        <p className="text-sm text-gray-600 mt-2">Dose producing therapeutic effect in 50% of population</p>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                            Toxic Dose 50% (TD50)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={td50}
                            onChange={(e) => setTd50(e.target.value)}
                            className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                            placeholder="e.g., 50 (mg/kg)"
                        />
                        <p className="text-sm text-gray-600 mt-2">Dose producing toxicity in 50% of population</p>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Drug Name
                        </label>
                        <input
                            type="text"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                            placeholder="e.g., Digoxin"
                        />
                    </div>

                    {/* Safety Margin Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Therapeutic Window Visualization</h3>
                        <div className="relative h-48">
                            {/* Safety scale */}
                            <div className="absolute inset-x-0 top-1/2 h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"></div>

                            {/* Markers */}
                            {ed50 && td50 && (
                                <>
                                    {/* ED50 marker */}
                                    <div
                                        className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-600 rounded-full shadow-lg"
                                        style={{ left: `${Math.min((parseFloat(ed50) / (parseFloat(td50) * 2)) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold">
                                                ED50: {ed50}
                                            </div>
                                        </div>
                                    </div>

                                    {/* TD50 marker */}
                                    <div
                                        className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-red-600 rounded-full shadow-lg"
                                        style={{ left: `${Math.min((parseFloat(td50) / (parseFloat(td50) * 2)) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold">
                                                TD50: {td50}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Therapeutic window */}
                                    <div
                                        className="absolute top-1/2 transform -translate-y-1/2 h-4 bg-green-200 opacity-50"
                                        style={{
                                            left: `${Math.min((parseFloat(ed50) / (parseFloat(td50) * 2)) * 100, 95)}%`,
                                            width: `${Math.min(((parseFloat(td50) - parseFloat(ed50)) / (parseFloat(td50) * 2)) * 100, 95)}%`,
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-green-800">Therapeutic Window</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Labels */}
                            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">Low Dose</div>
                            <div className="absolute -bottom-6 left-1/3 text-xs text-gray-600">Safe Range</div>
                            <div className="absolute -bottom-6 right-1/3 text-xs text-gray-600">Toxic Range</div>
                            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">High Dose</div>
                        </div>

                        {/* Formula */}
                        <div className="mt-4 text-center">
                            <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                TI = TD₅₀ / ED₅₀
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateTI}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Therapeutic Index
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Therapeutic Index Analysis</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Therapeutic Index</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {result.ti.toFixed(2)}
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.margin} MARGIN
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Safety Assessment</div>
                                    <p className="text-gray-600">{result.interpretation}</p>
                                </div>

                                <div className={`rounded-lg p-4 ${result.color.replace('text', 'bg')} bg-opacity-20`}>
                                    <div className="font-semibold mb-1">Safety Level</div>
                                    <p className={`${result.color} font-bold`}>{result.safety}</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Calculation Details</div>
                                    <p className="text-sm text-gray-600">
                                        TI = {td50} mg/kg ÷ {ed50} mg/kg = {result.ti.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Guidelines */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Shield className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Therapeutic Index Guidelines</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-50 to-blue-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">TI Range</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Classification</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring Requirements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {safetyGuidelines.map((guideline, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{guideline.range}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${guideline.classification === 'Very Narrow' ? 'bg-red-100 text-red-800' :
                                                        guideline.classification === 'Narrow' ? 'bg-orange-100 text-orange-800' :
                                                            guideline.classification === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                                                    {guideline.classification}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{guideline.monitoring}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Example Drugs */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Drugs with Therapeutic Indices</h3>
                        <div className="space-y-3">
                            {sampleDrugs.map((drug, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{drug.name}</div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${drug.safety === 'Very Narrow' ? 'bg-red-100 text-red-800' :
                                                drug.safety === 'Narrow' ? 'bg-orange-100 text-orange-800' :
                                                    drug.safety === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                            }`}>
                                            TI: {drug.TI}
                                        </div>
                                    </div>
                                    <div className="flex text-sm text-gray-600">
                                        <div className="mr-4">
                                            <span className="font-medium">ED50:</span> {drug.ED50} mg/kg
                                        </div>
                                        <div>
                                            <span className="font-medium">TD50:</span> {drug.TD50} mg/kg
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 3. Drug-Receptor Binding Affinity Tool
function DrugReceptorBindingAffinityTool() {
    const [kd, setKd] = useState<string>('');
    const [ki, setKi] = useState<string>('');
    const [ic50, setIc50] = useState<string>('');
    const [ligandConcentration, setLigandConcentration] = useState<string>('10');
    const [receptorConcentration, setReceptorConcentration] = useState<string>('1');
    const [result, setResult] = useState<{
        affinity: string;
        occupancy: number;
        classification: string;
        color: string;
        bindingConstant: number;
    } | null>(null);

    const calculateAffinity = () => {
        let bindingConstant = 0;
        let affinity = '';

        // Use whichever parameter is provided
        if (kd) {
            bindingConstant = parseFloat(kd);
            affinity = `Kd = ${bindingConstant} nM`;
        } else if (ki) {
            bindingConstant = parseFloat(ki);
            affinity = `Ki = ${bindingConstant} nM`;
        } else if (ic50) {
            bindingConstant = parseFloat(ic50);
            // Convert IC50 to Ki using Cheng-Prusoff approximation
            const L = parseFloat(ligandConcentration);
            const Km = 100; // Assumed for calculation
            const kiValue = bindingConstant / (1 + (L / Km));
            bindingConstant = kiValue;
            affinity = `IC50 = ${ic50} nM (Ki ≈ ${kiValue.toFixed(2)} nM)`;
        } else {
            alert('Please enter at least one binding parameter');
            return;
        }

        // Calculate receptor occupancy
        const L = parseFloat(ligandConcentration);
        const R = parseFloat(receptorConcentration);
        const occupancy = (L * R) / (bindingConstant + L) * 100;

        let classification = '';
        let color = '';

        if (bindingConstant < 0.1) {
            classification = 'ULTRA-HIGH AFFINITY';
            color = 'text-purple-600';
        } else if (bindingConstant < 1) {
            classification = 'HIGH AFFINITY';
            color = 'text-green-600';
        } else if (bindingConstant < 100) {
            classification = 'MEDIUM AFFINITY';
            color = 'text-blue-600';
        } else if (bindingConstant < 1000) {
            classification = 'LOW AFFINITY';
            color = 'text-yellow-600';
        } else {
            classification = 'VERY LOW AFFINITY';
            color = 'text-red-600';
        }

        setResult({
            affinity,
            occupancy: Math.min(occupancy, 100),
            classification,
            color,
            bindingConstant
        });
    };

    const resetCalculator = () => {
        setKd('');
        setKi('');
        setIc50('');
        setLigandConcentration('10');
        setReceptorConcentration('1');
        setResult(null);
    };

    const bindingParameters = [
        { parameter: 'Kd', description: 'Dissociation Constant', unit: 'nM', typical: '0.1-1000' },
        { parameter: 'Ki', description: 'Inhibition Constant', unit: 'nM', typical: '0.1-1000' },
        { parameter: 'IC50', description: 'Half-Maximal Inhibitory Conc.', unit: 'nM', typical: '1-10000' },
    ];

    const exampleDrugs = [
        { drug: 'Fentanyl (μ-opioid)', Kd: '0.1', affinity: 'Ultra-High' },
        { drug: 'Propranolol (β-blocker)', Kd: '1.0', affinity: 'High' },
        { drug: 'Aspirin (COX-1)', Kd: '100', affinity: 'Medium' },
        { drug: 'Warfarin (VKOR)', Kd: '1000', affinity: 'Low' },
        { drug: 'Penicillin (PBPs)', Kd: '10000', affinity: 'Very Low' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Drug-Receptor Binding Affinity Tool</h2>
                    <p className="text-gray-600">Calculate binding affinity and receptor occupancy</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Kd (nM)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={kd}
                                onChange={(e) => setKd(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 10"
                            />
                            <p className="text-xs text-gray-600 mt-1">Dissociation constant</p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Ki (nM)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={ki}
                                onChange={(e) => setKi(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 5"
                            />
                            <p className="text-xs text-gray-600 mt-1">Inhibition constant</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                IC50 (nM)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={ic50}
                                onChange={(e) => setIc50(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 50"
                            />
                            <p className="text-xs text-gray-600 mt-1">Half-maximal inhibition</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Ligand [L] (nM)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={ligandConcentration}
                                onChange={(e) => setLigandConcentration(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 10"
                            />
                        </div>

                        <div className="bg-amber-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Receptor [R] (nM)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={receptorConcentration}
                                onChange={(e) => setReceptorConcentration(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-400 focus:outline-none"
                                placeholder="e.g., 1"
                            />
                        </div>
                    </div>

                    {/* Binding Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Drug-Receptor Binding Visualization</h3>
                        <div className="relative h-48">
                            {/* Receptors */}
                            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="absolute w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-blue-700"
                                        style={{ left: `${i * 30}px`, top: `${i * -15}px` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ligands */}
                            <div className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="absolute w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full"
                                        style={{ left: `${i * 25}px`, top: `${i * 15}px` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Binding complex */}
                            {result && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="relative">
                                        {Array.from({ length: Math.min(Math.floor(result.occupancy / 33.3), 3) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-4 border-purple-700"
                                                style={{ left: `${i * 30}px`, top: `${i * -10}px` }}
                                            >
                                                <div className="absolute inset-2 flex items-center justify-center">
                                                    <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Binding arrows */}
                            <div className="absolute top-1/2 left-1/3 right-1/3">
                                <div className="h-1 bg-gradient-to-r from-green-400 to-blue-400 opacity-50"></div>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-xs text-gray-600">
                                    Binding →
                                </div>
                            </div>

                            {/* Occupancy indicator */}
                            {result && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-white px-4 py-2 rounded-lg shadow">
                                        <div className="text-sm font-bold text-purple-600">
                                            Occupancy: {result.occupancy.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Formula */}
                        <div className="mt-4 text-center">
                            <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                Occupancy = ([L] × [R]) / (Kd + [L])
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateAffinity}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Binding Parameters
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Binding Analysis Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Binding Affinity</div>
                                <div className={`text-3xl font-bold ${result.color} mb-2`}>
                                    {result.affinity}
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.classification}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Receptor Occupancy</div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {result.occupancy.toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        At ligand concentration: {ligandConcentration} nM
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="font-semibold text-blue-800 mb-1">Binding Constant Interpretation</div>
                                    <p className="text-sm text-blue-700">
                                        Lower Kd/Ki values indicate stronger binding affinity
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Binding Parameters Reference */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Activity className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Binding Parameters Guide</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Parameter</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Range (nM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bindingParameters.map((param, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{param.parameter}</td>
                                            <td className="py-3 px-4 text-gray-600">{param.description}</td>
                                            <td className="py-3 px-4">{param.typical}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center text-yellow-800 mb-1">
                                <Info className="w-4 h-4 mr-2" />
                                <span className="font-semibold">Key Relationship</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                                Kd = Ki when [ligand] = [receptor]. For competitive inhibition: Ki = IC50 / (1 + [L]/Km)
                            </p>
                        </div>
                    </div>

                    {/* Example Drugs */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Drug Binding Affinities</h3>
                        <div className="space-y-3">
                            {exampleDrugs.map((drug, index) => (
                                <button
                                    key={index}
                                    onClick={() => setKd(drug.Kd)}
                                    className="w-full bg-white rounded-lg p-4 hover:bg-red-50 transition-colors text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{drug.drug}</div>
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                            Kd: {drug.Kd} nM
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Affinity: <span className="font-bold">{drug.affinity}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 4. ED50, TD50, LD50 Calculator
function ED50TD50LD50Calculator() {
    const [ed50, setEd50] = useState<string>('');
    const [td50, setTd50] = useState<string>('');
    const [ld50, setLd50] = useState<string>('');
    const [dose, setDose] = useState<string>('');
    const [responseType, setResponseType] = useState<string>('therapeutic');
    const [result, setResult] = useState<{
        therapeuticIndex: number;
        safetyMargin: number;
        classification: string;
        color: string;
        riskLevel: string;
        doseResponse: string;
    } | null>(null);

    const calculateSafety = () => {
        const ED50 = parseFloat(ed50);
        const TD50 = parseFloat(td50);
        const LD50 = parseFloat(ld50);
        const D = parseFloat(dose);

        if (isNaN(ED50) || ED50 <= 0) {
            alert('Please enter a valid ED50');
            return;
        }

        let therapeuticIndex = 0;
        let safetyMargin = 0;
        let classification = '';
        let color = '';
        let riskLevel = '';
        let doseResponse = '';

        // Calculate based on available data
        if (!isNaN(TD50) && TD50 > 0) {
            therapeuticIndex = TD50 / ED50;
            safetyMargin = TD50 / D;

            if (therapeuticIndex < 3) {
                classification = 'NARROW THERAPEUTIC INDEX';
                color = 'text-red-600';
                riskLevel = 'HIGH RISK';
            } else if (therapeuticIndex < 10) {
                classification = 'MODERATE THERAPEUTIC INDEX';
                color = 'text-yellow-600';
                riskLevel = 'MODERATE RISK';
            } else {
                classification = 'WIDE THERAPEUTIC INDEX';
                color = 'text-green-600';
                riskLevel = 'LOW RISK';
            }
        }

        if (!isNaN(LD50) && LD50 > 0) {
            const lethalMargin = LD50 / ED50;
            if (lethalMargin < 10) {
                riskLevel = 'HIGH LETHALITY RISK';
                color = 'text-red-600';
            }
        }

        if (!isNaN(D) && D > 0) {
            const relativeDose = D / ED50;
            if (relativeDose < 0.5) {
                doseResponse = 'SUB-THERAPEUTIC';
            } else if (relativeDose >= 0.5 && relativeDose < 2) {
                doseResponse = 'THERAPEUTIC RANGE';
            } else if (relativeDose >= 2 && relativeDose < 5) {
                doseResponse = 'SUPRATHERAPEUTIC';
            } else {
                doseResponse = 'TOXIC RANGE';
            }
        }

        setResult({
            therapeuticIndex,
            safetyMargin,
            classification,
            color,
            riskLevel,
            doseResponse
        });
    };

    const resetCalculator = () => {
        setEd50('');
        setTd50('');
        setLd50('');
        setDose('');
        setResult(null);
    };

    const safetyDefinitions = [
        { term: 'ED50', definition: 'Effective Dose 50% - Dose producing therapeutic effect in 50% of population', unit: 'mg/kg' },
        { term: 'TD50', definition: 'Toxic Dose 50% - Dose producing toxicity in 50% of population', unit: 'mg/kg' },
        { term: 'LD50', definition: 'Lethal Dose 50% - Dose causing death in 50% of population', unit: 'mg/kg' },
        { term: 'TI', definition: 'Therapeutic Index - Ratio of TD50 to ED50 (higher is safer)', unit: 'Unitless' },
    ];

    const exampleDrugs = [
        { drug: 'Digoxin', ED50: '0.8', TD50: '2.0', LD50: '3.5', TI: '2.5' },
        { drug: 'Aspirin', ED50: '100', TD50: '500', LD50: '1500', TI: '5.0' },
        { drug: 'Morphine', ED50: '5', TD50: '15', LD50: '50', TI: '3.0' },
        { drug: 'Penicillin', ED50: '10', TD50: '500', LD50: '5000', TI: '50' },
        { drug: 'Warfarin', ED50: '1.5', TD50: '3.0', LD50: '10', TI: '2.0' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Activity className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ED50, TD50, LD50 Calculator</h2>
                    <p className="text-gray-600">Calculate drug safety parameters and therapeutic indices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                ED50 (mg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={ed50}
                                onChange={(e) => setEd50(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 10"
                            />
                            <p className="text-xs text-gray-600 mt-1">Effective dose 50%</p>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                TD50 (mg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={td50}
                                onChange={(e) => setTd50(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-yellow-300 rounded-lg focus:border-yellow-400 focus:outline-none"
                                placeholder="e.g., 50"
                            />
                            <p className="text-xs text-gray-600 mt-1">Toxic dose 50%</p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                LD50 (mg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={ld50}
                                onChange={(e) => setLd50(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 200"
                            />
                            <p className="text-xs text-gray-600 mt-1">Lethal dose 50%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Test Dose (mg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={dose}
                                onChange={(e) => setDose(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 25"
                            />
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Response Type
                            </label>
                            <select
                                value={responseType}
                                onChange={(e) => setResponseType(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                            >
                                <option value="therapeutic">Therapeutic Effect</option>
                                <option value="toxic">Toxic Effect</option>
                                <option value="lethal">Lethal Effect</option>
                            </select>
                        </div>
                    </div>

                    {/* Dose-Response Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Dose-Response Relationship</h3>
                        <div className="relative h-48">
                            {/* Response curves */}
                            <div className="absolute inset-0">
                                {/* Therapeutic response curve */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 0,80 Q 40,60 80,40 T 160,20"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="3"
                                        strokeDasharray="5,5"
                                    />
                                </svg>

                                {/* Toxic response curve */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 0,90 Q 50,70 100,50 T 200,30"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="3"
                                    />
                                </svg>

                                {/* Lethal response curve */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 0,95 Q 60,80 120,60 T 240,40"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="3"
                                        strokeDasharray="3,3"
                                    />
                                </svg>
                            </div>

                            {/* ED50, TD50, LD50 markers */}
                            {ed50 && (
                                <div
                                    className="absolute top-1/2 w-6 h-6 bg-green-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${Math.min((parseFloat(ed50) / 100) * 100, 95)}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                        <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-green-600">
                                            ED50
                                        </div>
                                    </div>
                                </div>
                            )}

                            {td50 && (
                                <div
                                    className="absolute top-2/3 w-6 h-6 bg-yellow-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${Math.min((parseFloat(td50) / 100) * 100, 95)}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                        <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-yellow-600">
                                            TD50
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ld50 && (
                                <div
                                    className="absolute top-3/4 w-6 h-6 bg-red-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${Math.min((parseFloat(ld50) / 100) * 100, 95)}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                        <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-red-600">
                                            LD50
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Test dose marker */}
                            {dose && (
                                <div
                                    className="absolute bottom-4 w-8 h-1 bg-blue-600 transform -translate-x-1/2"
                                    style={{ left: `${Math.min((parseFloat(dose) / 100) * 100, 95)}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                        <div className="bg-blue-600 text-white px-2 py-1 rounded shadow text-xs font-bold">
                                            Test Dose
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Axes */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                            {/* Labels */}
                            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0 mg/kg</div>
                            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">100 mg/kg</div>
                            <div className="absolute -left-8 top-0 text-xs text-gray-600 -rotate-90">Response %</div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-1 border border-dashed"></div>
                                <span className="text-xs">Therapeutic</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                                <span className="text-xs">Toxic</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1 border border-dashed"></div>
                                <span className="text-xs">Lethal</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateSafety}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Safety Parameters
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Safety Analysis Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Therapeutic Index</div>
                                {td50 ? (
                                    <div className="text-4xl font-bold text-green-400 mb-2">
                                        {result.therapeuticIndex.toFixed(2)}
                                    </div>
                                ) : (
                                    <div className="text-lg text-gray-500">Enter TD50 to calculate TI</div>
                                )}
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.classification}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Dose Assessment</div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {result.doseResponse}
                                    </div>
                                    {dose && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Test dose: {dose} mg/kg ({(parseFloat(dose) / parseFloat(ed50)).toFixed(1)}× ED50)
                                        </p>
                                    )}
                                </div>

                                {result.riskLevel && (
                                    <div className={`rounded-lg p-4 ${result.color.replace('text', 'bg')} bg-opacity-20`}>
                                        <div className="font-semibold mb-1">Risk Assessment</div>
                                        <p className={`${result.color} font-bold`}>{result.riskLevel}</p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Safety Parameters</div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <div className="font-bold text-green-600">ED50</div>
                                            <div>{ed50} mg/kg</div>
                                        </div>
                                        {td50 && (
                                            <div>
                                                <div className="font-bold text-yellow-600">TD50</div>
                                                <div>{td50} mg/kg</div>
                                            </div>
                                        )}
                                        {ld50 && (
                                            <div>
                                                <div className="font-bold text-red-600">LD50</div>
                                                <div>{ld50} mg/kg</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Definitions */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Safety Parameter Definitions</h3>
                        </div>

                        <div className="space-y-3">
                            {safetyDefinitions.map((def, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-gray-800">{def.term}</div>
                                        <div className="text-sm text-gray-600">{def.unit}</div>
                                    </div>
                                    <p className="text-sm text-gray-600">{def.definition}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Example Drugs */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Drug Safety Data</h3>
                        <div className="space-y-3">
                            {exampleDrugs.map((drug, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setEd50(drug.ED50);
                                        setTd50(drug.TD50);
                                        setLd50(drug.LD50);
                                    }}
                                    className="w-full bg-white rounded-lg p-4 hover:bg-blue-50 transition-colors text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{drug.drug}</div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${parseFloat(drug.TI) < 3 ? 'bg-red-100 text-red-800' :
                                                parseFloat(drug.TI) < 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            TI: {drug.TI}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                                        <div>
                                            <div className="font-bold text-green-600">ED50</div>
                                            <div>{drug.ED50}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-yellow-600">TD50</div>
                                            <div>{drug.TD50}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-red-600">LD50</div>
                                            <div>{drug.LD50}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 5. Drug Half-Life Calculator (Multiple Dose)
function DrugHalfLifeCalculator() {
    const [halfLife, setHalfLife] = useState<string>('');
    const [dose, setDose] = useState<string>('');
    const [interval, setInterval] = useState<string>('24');
    const [doses, setDoses] = useState<string>('5');
    const [eliminationConstant, setEliminationConstant] = useState<string>('');
    const [result, setResult] = useState<{
        ke: number;
        steadyState: number;
        timeToSteady: number;
        accumulation: number;
        trough: number;
        peak: number;
    } | null>(null);

    useEffect(() => {
        if (halfLife) {
            const ke = 0.693 / parseFloat(halfLife);
            setEliminationConstant(ke.toFixed(4));
        }
    }, [halfLife]);

    const calculatePharmacokinetics = () => {
        const t_half = parseFloat(halfLife);
        const D = parseFloat(dose);
        const tau = parseFloat(interval);
        const n = parseFloat(doses);
        const ke = parseFloat(eliminationConstant);

        if (isNaN(t_half) || isNaN(D) || isNaN(tau) || isNaN(n) || t_half <= 0 || D <= 0 || tau <= 0 || n <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Calculate elimination constant if not provided
        const Ke = ke || (0.693 / t_half);

        // Steady state concentration factor
        const accumulationFactor = 1 / (1 - Math.exp(-Ke * tau));

        // Time to reach steady state (4-5 half-lives)
        const timeToSteady = t_half * 4.32;

        // Trough concentration approximation
        const trough = D * (Math.exp(-Ke * tau) / (1 - Math.exp(-Ke * tau)));

        // Peak concentration approximation
        const peak = D / (1 - Math.exp(-Ke * tau));

        // Accumulation ratio
        const accumulation = 1 / (1 - Math.exp(-Ke * tau));

        setResult({
            ke: Ke,
            steadyState: accumulationFactor,
            timeToSteady,
            accumulation,
            trough,
            peak
        });
    };

    const resetCalculator = () => {
        setHalfLife('');
        setDose('');
        setInterval('24');
        setDoses('5');
        setEliminationConstant('');
        setResult(null);
    };

    const exampleDrugs = [
        { drug: 'Amoxicillin', halfLife: '1.3', dose: '500', interval: '8', comment: 'Short half-life' },
        { drug: 'Metformin', halfLife: '6.2', dose: '500', interval: '12', comment: 'Medium half-life' },
        { drug: 'Digoxin', halfLife: '36', dose: '0.125', interval: '24', comment: 'Long half-life' },
        { drug: 'Warfarin', halfLife: '40', dose: '5', interval: '24', comment: 'Very long half-life' },
        { drug: 'Aspirin', halfLife: '0.25', dose: '325', interval: '4', comment: 'Very short half-life' },
    ];

    const halfLifeInterpretation = [
        { range: '< 4 hours', classification: 'Short', dosing: 'Multiple daily doses' },
        { range: '4-24 hours', classification: 'Medium', dosing: 'Once or twice daily' },
        { range: '24-48 hours', classification: 'Long', dosing: 'Once daily' },
        { range: '> 48 hours', classification: 'Very Long', dosing: 'Loading dose required' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Drug Half-Life Calculator (Multiple Dose)</h2>
                    <p className="text-gray-600">Calculate pharmacokinetic parameters for multiple dosing regimens</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Half-Life (t½) hours
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={halfLife}
                                onChange={(e) => setHalfLife(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 6"
                            />
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Dose (mg)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                value={dose}
                                onChange={(e) => setDose(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Dosing Interval (hours)
                            </label>
                            <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                            >
                                <option value="4">Q4H (6x daily)</option>
                                <option value="6">Q6H (4x daily)</option>
                                <option value="8">Q8H (3x daily)</option>
                                <option value="12">Q12H (2x daily)</option>
                                <option value="24">Q24H (1x daily)</option>
                                <option value="48">Q48H (Every 2 days)</option>
                            </select>
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Number of Doses
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                value={doses}
                                onChange={(e) => setDoses(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 5"
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Elimination Rate Constant (ke) 1/h
                        </label>
                        <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            value={eliminationConstant}
                            onChange={(e) => setEliminationConstant(e.target.value)}
                            className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                            placeholder="Auto-calculated from half-life"
                            readOnly={!!halfLife}
                        />
                        <p className="text-xs text-gray-600 mt-1">ke = 0.693 / t½</p>
                    </div>

                    {/* Plasma Concentration Curve */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Multiple Dose Plasma Concentration</h3>
                        <div className="relative h-48">
                            {/* Grid */}
                            <div className="absolute inset-0">
                                {/* Horizontal grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <div key={y} className="absolute w-full h-px bg-gray-300" style={{ top: `${100 - y}%` }} />
                                ))}
                                {/* Vertical grid lines */}
                                {[0, 25, 50, 75, 100].map(x => (
                                    <div key={x} className="absolute h-full w-px bg-gray-300" style={{ left: `${x}%` }} />
                                ))}
                            </div>

                            {/* Axes */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                            {/* Concentration curve */}
                            {result && (
                                <svg className="absolute inset-0 w-full h-full">
                                    {/* Generate sawtooth pattern for multiple doses */}
                                    {Array.from({ length: parseInt(doses) }).map((_, doseNum) => {
                                        const startX = (doseNum * 20);
                                        const peakY = 80 - (doseNum * 5); // Accumulating peaks
                                        const troughY = 40 + (doseNum * 5); // Accumulating troughs

                                        return (
                                            <g key={doseNum}>
                                                {/* Exponential decay from peak to trough */}
                                                <path
                                                    d={`M ${startX},${100 - peakY} Q ${startX + 5},${100 - (peakY + troughY) / 2} ${startX + 10},${100 - troughY}`}
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                />
                                                {/* Next dose administration */}
                                                {doseNum < parseInt(doses) - 1 && (
                                                    <line
                                                        x1={startX + 10}
                                                        y1={100 - troughY}
                                                        x2={startX + 20}
                                                        y2={100 - (troughY - 10)}
                                                        stroke="#3b82f6"
                                                        strokeWidth="2"
                                                    />
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* Steady state line */}
                                    <line
                                        x1="0"
                                        y1="20"
                                        x2="100"
                                        y2="20"
                                        stroke="#ef4444"
                                        strokeWidth="1"
                                        strokeDasharray="5,5"
                                    />
                                </svg>
                            )}

                            {/* Labels */}
                            <div className="absolute -bottom-6 left-0 text-xs text-gray-600">Time 0</div>
                            <div className="absolute -bottom-6 right-0 text-xs text-gray-600">
                                {parseInt(doses) * parseInt(interval)} hours
                            </div>
                            <div className="absolute -left-8 top-0 text-xs text-gray-600 -rotate-90">Concentration</div>

                            {/* Steady state label */}
                            {result && (
                                <div className="absolute top-4 right-4">
                                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-red-600">
                                        Steady State
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                                <span className="text-xs">Concentration</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                <span className="text-xs">Next Dose</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1 border border-dashed"></div>
                                <span className="text-xs">Steady State</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculatePharmacokinetics}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate PK Parameters
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Pharmacokinetic Analysis</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Elimination Rate Constant</div>
                                <div className="text-3xl font-bold text-green-400 mb-2">
                                    {result.ke.toFixed(4)} h⁻¹
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                    Half-Life: {halfLife} hours
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-xs font-semibold text-gray-600">Accumulation Ratio</div>
                                    <div className="text-xl font-bold text-blue-600 mt-1">
                                        {result.accumulation.toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-xs font-semibold text-gray-600">Time to Steady State</div>
                                    <div className="text-xl font-bold text-green-600 mt-1">
                                        {result.timeToSteady.toFixed(1)} hours
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Dosing Regimen</div>
                                    <p className="text-gray-600">
                                        {dose} mg every {interval} hours for {doses} doses
                                    </p>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="font-semibold text-purple-800 mb-1">Key Formulas</div>
                                    <div className="text-sm text-purple-700 space-y-1">
                                        <div>ke = 0.693 / t½</div>
                                        <div>Accumulation = 1 / (1 - e^(-ke × τ))</div>
                                        <div>Steady State ≈ 4.32 × t½</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Half-Life Interpretation */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Zap className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Half-Life Interpretation Guide</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Half-Life Range</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Classification</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Dosing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {halfLifeInterpretation.map((hl, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{hl.range}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${hl.classification === 'Short' ? 'bg-blue-100 text-blue-800' :
                                                        hl.classification === 'Medium' ? 'bg-green-100 text-green-800' :
                                                            hl.classification === 'Long' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {hl.classification}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{hl.dosing}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Example Drugs */}
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Drug Half-Lives</h3>
                        <div className="space-y-3">
                            {exampleDrugs.map((drug, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setHalfLife(drug.halfLife);
                                        setDose(drug.dose);
                                        setInterval(drug.interval);
                                    }}
                                    className="w-full bg-white rounded-lg p-4 hover:bg-yellow-50 transition-colors text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{drug.drug}</div>
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                            t½: {drug.halfLife}h
                                        </div>
                                    </div>
                                    <div className="flex text-sm text-gray-600">
                                        <div className="mr-4">
                                            <span className="font-medium">Dose:</span> {drug.dose}mg
                                        </div>
                                        <div>
                                            <span className="font-medium">Interval:</span> Q{drug.interval}H
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{drug.comment}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}