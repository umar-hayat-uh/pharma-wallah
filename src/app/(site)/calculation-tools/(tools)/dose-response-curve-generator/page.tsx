"use client";
import { useState, useEffect } from 'react';
import { LineChart, RefreshCw } from 'lucide-react';

export default function DoseResponseCurveGenerator() {
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
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto  bg-gradient-to-br from-emerald-50 to-teal-50 p-5">

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

        </section>
    );
}