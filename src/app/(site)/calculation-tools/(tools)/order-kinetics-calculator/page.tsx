"use client";
import { useState, useEffect } from 'react';
import {
    TrendingDown,
    Calculator,
    LineChart,
    BarChart,
    RefreshCw,
    AlertCircle,
    Zap,
    Clock,
    Activity
} from 'lucide-react';

type KineticsType = 'first-order' | 'zero-order' | 'mixed' | 'comparison';

export default function KineticsCalculator() {
    const [kineticsType, setKineticsType] = useState<KineticsType>('first-order');
    const [initialConcentration, setInitialConcentration] = useState<string>('100');
    const [eliminationConstant, setEliminationConstant] = useState<string>('0.1');
    const [maxRate, setMaxRate] = useState<string>('10');
    const [km, setKm] = useState<string>('50');
    const [timePoints, setTimePoints] = useState<number[]>([0, 1, 2, 4, 6, 8, 12, 24]);
    const [concentrationData, setConcentrationData] = useState<number[]>([]);
    const [halfLife, setHalfLife] = useState<number | null>(null);
    const [timeToEliminate, setTimeToEliminate] = useState<number | null>(null);
    const [showComparison, setShowComparison] = useState<boolean>(false);

    const calculateKinetics = () => {
        const c0 = parseFloat(initialConcentration);
        const ke = parseFloat(eliminationConstant);
        const vmax = parseFloat(maxRate);
        const kmVal = parseFloat(km);

        if (isNaN(c0) || c0 <= 0) return;

        const concentrations: number[] = [];

        switch (kineticsType) {
            case 'first-order':
                // First-order: C(t) = C0 * e^(-ke*t)
                timePoints.forEach(t => {
                    const ct = c0 * Math.exp(-ke * t);
                    concentrations.push(ct);
                });
                setHalfLife(0.693 / ke);
                setTimeToEliminate(null); // Never reaches exactly zero
                break;

            case 'zero-order':
                // Zero-order: C(t) = C0 - vmax*t (until zero)
                timePoints.forEach(t => {
                    const ct = Math.max(0, c0 - vmax * t);
                    concentrations.push(ct);
                });
                setHalfLife(null); // Not constant
                setTimeToEliminate(c0 / vmax);
                break;

            case 'mixed':
                // Michaelis-Menten: -dC/dt = (vmax*C)/(km + C)
                // Numerical integration for simplicity
                let currentC = c0;
                timePoints.forEach(t => {
                    // Simple Euler integration
                    if (currentC > 0) {
                        const rate = (vmax * currentC) / (kmVal + currentC);
                        const deltaT = t - (concentrations.length > 0 ? timePoints[concentrations.length - 1] : 0);
                        currentC = Math.max(0, currentC - rate * deltaT);
                    }
                    concentrations.push(currentC);
                });
                setHalfLife(null);
                setTimeToEliminate(null);
                break;

            case 'comparison':
                // Calculate both first-order and zero-order for comparison
                const foConcentrations = timePoints.map(t => c0 * Math.exp(-ke * t));
                const zoConcentrations = timePoints.map(t => Math.max(0, c0 - vmax * t));
                setConcentrationData([...foConcentrations, ...zoConcentrations]);
                setHalfLife(0.693 / ke);
                setTimeToEliminate(c0 / vmax);
                return;
        }

        setConcentrationData(concentrations);
    };

    const resetCalculator = () => {
        setInitialConcentration('100');
        setEliminationConstant('0.1');
        setMaxRate('10');
        setKm('50');
        setConcentrationData([]);
        setHalfLife(null);
        setTimeToEliminate(null);
        setShowComparison(false);
    };

    const sampleDrugs = [
        {
            name: 'Ethanol (Zero-order)',
            type: 'zero-order' as KineticsType,
            c0: '100',
            vmax: '10',
            ke: '0.1',
            note: 'Saturable metabolism'
        },
        {
            name: 'Most Drugs (First-order)',
            type: 'first-order' as KineticsType,
            c0: '100',
            vmax: '10',
            ke: '0.1',
            note: 'Linear elimination'
        },
        {
            name: 'Phenytoin (Mixed)',
            type: 'mixed' as KineticsType,
            c0: '20',
            vmax: '8',
            km: '6',
            note: 'Michaelis-Menten kinetics'
        },
        {
            name: 'Comparison',
            type: 'comparison' as KineticsType,
            c0: '100',
            vmax: '10',
            ke: '0.1',
            note: 'First vs Zero order'
        }
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setKineticsType(drug.type);
        setInitialConcentration(drug.c0);
        setMaxRate(drug.vmax);
        setEliminationConstant(drug.ke || '0.1');
        if (drug.km) setKm(drug.km);
        setShowComparison(drug.type === 'comparison');
    };

    const getKineticsDescription = (type: KineticsType) => {
        switch (type) {
            case 'first-order': return 'Rate proportional to concentration';
            case 'zero-order': return 'Constant rate independent of concentration';
            case 'mixed': return 'Saturable (Michaelis-Menten) kinetics';
            case 'comparison': return 'Compare first-order and zero-order';
        }
    };

    useEffect(() => {
        calculateKinetics();
    }, [kineticsType, initialConcentration, eliminationConstant, maxRate, km, timePoints, showComparison]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Kinetics Calculator</h1>
                                <p className="text-blue-100 mt-2">Compare First-Order and Zero-Order elimination kinetics</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <LineChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Elimination Models</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Kinetics Model Selection
                            </h2>

                            {/* Model Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <button
                                    onClick={() => setKineticsType('first-order')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'first-order' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <TrendingDown className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">First-Order</span>
                                        <span className="text-sm mt-1">Linear</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setKineticsType('zero-order')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'zero-order' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <BarChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Zero-Order</span>
                                        <span className="text-sm mt-1">Constant rate</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setKineticsType('mixed')}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'mixed' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Mixed</span>
                                        <span className="text-sm mt-1">Saturable</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setKineticsType('comparison');
                                        setShowComparison(true);
                                    }}
                                    className={`p-4 rounded-xl transition-all ${kineticsType === 'comparison' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <LineChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Compare</span>
                                        <span className="text-sm mt-1">Both models</span>
                                    </div>
                                </button>
                            </div>

                            {/* Model Description */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-gray-700">
                                    <span className="font-semibold">{kineticsType.toUpperCase()} Kinetics:</span> {getKineticsDescription(kineticsType)}
                                </p>
                            </div>

                            {/* Input Parameters */}
                            <div className="space-y-6">
                                {/* Common Parameters */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Initial Conditions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Initial Concentration C₀ (mg/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={initialConcentration}
                                                onChange={(e) => setInitialConcentration(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                <div className="text-sm font-semibold text-gray-600">Time Points (h)</div>
                                                <div className="text-sm text-gray-600">
                                                    {timePoints.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Model-specific Parameters */}
                                {(kineticsType === 'first-order' || kineticsType === 'comparison') && (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
                                            First-Order Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Elimination Rate Constant kₑ (h⁻¹)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={eliminationConstant}
                                                    onChange={(e) => setEliminationConstant(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 0.1"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Equation</div>
                                                    <div className="font-mono text-sm mt-1">C(t) = C₀ × e^(-kₑ×t)</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(kineticsType === 'zero-order' || kineticsType === 'comparison') && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <BarChart className="w-5 h-5 mr-2 text-purple-600" />
                                            Zero-Order Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Maximum Rate V_max (mg/L/h)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={maxRate}
                                                    onChange={(e) => setMaxRate(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 10"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Equation</div>
                                                    <div className="font-mono text-sm mt-1">C(t) = C₀ - V_max×t</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {kineticsType === 'mixed' && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-yellow-600" />
                                            Michaelis-Menten Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    V_max (mg/L/h)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={maxRate}
                                                    onChange={(e) => setMaxRate(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                                                    placeholder="e.g., 10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    K_m (mg/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={km}
                                                    onChange={(e) => setKm(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-white rounded-lg">
                                            <div className="text-sm font-semibold text-gray-600">Michaelis-Menten Equation</div>
                                            <div className="font-mono text-sm mt-1">-dC/dt = (V_max × C) ÷ (K_m + C)</div>
                                        </div>
                                    </div>
                                )}

                                {/* Sample Drugs */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {sampleDrugs.map((drug, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{drug.name}</div>
                                                <div className="text-xs text-gray-600 mt-2">
                                                    Type: {drug.type.replace('-', ' ')}<br />
                                                    C₀: {drug.c0} mg/L
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">{drug.note}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateKinetics}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Simulate Kinetics
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Summary */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <LineChart className="w-7 h-7 mr-3" />
                                Kinetics Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-4">
                                        {kineticsType.toUpperCase()} Model
                                    </div>

                                    <div className="space-y-4">
                                        {halfLife !== null && (
                                            <div>
                                                <div className="text-sm font-semibold">Half-Life (t½)</div>
                                                <div className="text-3xl font-bold">{halfLife.toFixed(2)} hours</div>
                                            </div>
                                        )}

                                        {timeToEliminate !== null && (
                                            <div>
                                                <div className="text-sm font-semibold">Time to Eliminate</div>
                                                <div className="text-3xl font-bold">{timeToEliminate.toFixed(1)} hours</div>
                                            </div>
                                        )}

                                        {!halfLife && !timeToEliminate && (
                                            <div className="text-lg">
                                                See chart for elimination pattern
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Current Rate */}
                            {concentrationData.length > 0 && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Initial Elimination Rate</div>
                                        <div className="text-xl font-bold">
                                            {kineticsType === 'first-order' ?
                                                `${(parseFloat(eliminationConstant) * parseFloat(initialConcentration)).toFixed(2)} mg/L/h` :
                                                kineticsType === 'zero-order' ?
                                                    `${maxRate} mg/L/h` :
                                                    `${((parseFloat(maxRate) * parseFloat(initialConcentration)) / (parseFloat(km) + parseFloat(initialConcentration))).toFixed(2)} mg/L/h`
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Concentration Chart */}
                        {concentrationData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Concentration-Time Profile</h3>
                                <div className="h-64 relative border-l border-b border-gray-300">
                                    {/* Simplified chart visualization */}
                                    <div className="absolute inset-0 flex items-end">
                                        {/* Y-axis labels */}
                                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 w-8">
                                            <span>{parseFloat(initialConcentration).toFixed(0)}</span>
                                            <span>{(parseFloat(initialConcentration) * 0.75).toFixed(0)}</span>
                                            <span>{(parseFloat(initialConcentration) * 0.5).toFixed(0)}</span>
                                            <span>{(parseFloat(initialConcentration) * 0.25).toFixed(0)}</span>
                                            <span>0</span>
                                        </div>

                                        {/* X-axis labels */}
                                        <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-gray-500 h-6 items-end">
                                            {timePoints.map(t => (
                                                <span key={t}>{t}h</span>
                                            ))}
                                        </div>

                                        {/* Chart area */}
                                        <div className="absolute left-8 right-0 top-0 bottom-6">
                                            {/* Grid lines */}
                                            <div className="absolute inset-0">
                                                {[0.25, 0.5, 0.75, 1].map((frac, i) => (
                                                    <div key={i} className="absolute w-full border-t border-gray-100"
                                                        style={{ bottom: `${frac * 100}%` }}></div>
                                                ))}
                                            </div>

                                            {/* Data points and lines */}
                                            {showComparison ? (
                                                <>
                                                    {/* First-order line */}
                                                    <svg className="absolute inset-0">
                                                        <polyline
                                                            points={timePoints.map((t, i) =>
                                                                `${(i / (timePoints.length - 1)) * 100},${(1 - concentrationData[i] / parseFloat(initialConcentration)) * 100}`
                                                            ).join(' ')}
                                                            fill="none"
                                                            stroke="#3b82f6"
                                                            strokeWidth="2"
                                                        />
                                                        {/* Zero-order line */}
                                                        <polyline
                                                            points={timePoints.map((t, i) =>
                                                                `${(i / (timePoints.length - 1)) * 100},${(1 - concentrationData[timePoints.length + i] / parseFloat(initialConcentration)) * 100}`
                                                            ).join(' ')}
                                                            fill="none"
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                            strokeDasharray="4"
                                                        />
                                                    </svg>
                                                </>
                                            ) : (
                                                <svg className="absolute inset-0">
                                                    <polyline
                                                        points={timePoints.map((t, i) =>
                                                            `${(i / (timePoints.length - 1)) * 100},${(1 - concentrationData[i] / parseFloat(initialConcentration)) * 100}`
                                                        ).join(' ')}
                                                        fill="none"
                                                        stroke="#3b82f6"
                                                        strokeWidth="2"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                {showComparison && (
                                    <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                                        <div className="flex items-center">
                                            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
                                            <span>First-Order</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-4 h-0.5 bg-red-500 mr-2" style={{ borderBottom: '2px dashed #ef4444' }}></div>
                                            <span>Zero-Order</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Model Characteristics */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Model Characteristics</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">First-Order:</div>
                                    <div className="text-gray-600 mt-1">• Constant half-life<br />• Rate ∝ concentration<br />• Most drugs</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Zero-Order:</div>
                                    <div className="text-gray-600 mt-1">• Constant rate<br />• Fixed amount eliminated/time<br />• Ethanol, high-dose phenytoin</div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Implications */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Clinical Implications
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• First-order: Safe, predictable elimination</li>
                                <li>• Zero-order: Risk of accumulation at high doses</li>
                                <li>• Mixed kinetics: Non-linear, requires careful dosing</li>
                                <li>• Therapeutic drug monitoring crucial for non-linear drugs</li>
                                <li>• Small dose changes can cause large concentration changes with saturation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Kinetics Comparison Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Kinetics Comparison</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Feature</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">First-Order</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Zero-Order</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Mixed (MM)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold">Rate Equation</td>
                                    <td className="py-3 px-4">-dC/dt = k × C</td>
                                    <td className="py-3 px-4">-dC/dt = V_max</td>
                                    <td className="py-3 px-4">-dC/dt = (V_max × C)/(K_m + C)</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">Half-Life</td>
                                    <td className="py-3 px-4">Constant (t½ = 0.693/k)</td>
                                    <td className="py-3 px-4">Variable (decreases with C)</td>
                                    <td className="py-3 px-4">Variable</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold">AUC-Dose Relationship</td>
                                    <td className="py-3 px-4">Proportional</td>
                                    <td className="py-3 px-4">Exponential</td>
                                    <td className="py-3 px-4">Non-linear</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">Clearance</td>
                                    <td className="py-3 px-4">Constant</td>
                                    <td className="py-3 px-4">Increases with C</td>
                                    <td className="py-3 px-4">Decreases with C</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold">Examples</td>
                                    <td className="py-3 px-4">Most drugs</td>
                                    <td className="py-3 px-4">Ethanol, Aspirin (high dose)</td>
                                    <td className="py-3 px-4">Phenytoin, Theophylline</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}