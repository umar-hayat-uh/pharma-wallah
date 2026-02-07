"use client";
import { useState, useEffect } from 'react';
import {
    Filter,
    Calculator,
    BarChart,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    Target,
    Activity,
    LineChart,
    Zap
} from 'lucide-react';

type ResolutionUnit = 'minutes' | 'seconds';

export default function ChromatographicResolutionCalculator() {
    const [method, setMethod] = useState<'peaks' | 'efficiency'>('peaks');
    const [peak1Time, setPeak1Time] = useState<string>('5.2');
    const [peak2Time, setPeak2Time] = useState<string>('5.8');
    const [peak1Width, setPeak1Width] = useState<string>('0.2');
    const [peak2Width, setPeak2Width] = useState<string>('0.25');
    const [plateCount, setPlateCount] = useState<string>('10000');
    const [retentionFactor, setRetentionFactor] = useState<string>('2.5');
    const [selectivity, setSelectivity] = useState<string>('1.1');
    const [resolution, setResolution] = useState<number | null>(null);
    const [unit, setUnit] = useState<ResolutionUnit>('minutes');
    const [resolutionClass, setResolutionClass] = useState<string>('');

    const calculateResolution = () => {
        let R = 0;

        switch (method) {
            case 'peaks':
                const t1 = parseFloat(peak1Time);
                const t2 = parseFloat(peak2Time);
                const w1 = parseFloat(peak1Width);
                const w2 = parseFloat(peak2Width);

                if (!isNaN(t1) && !isNaN(t2) && !isNaN(w1) && !isNaN(w2) && w1 > 0 && w2 > 0) {
                    // Convert to same unit if needed
                    const scale = unit === 'minutes' ? 1 : 60;
                    const t1Scaled = t1 * scale;
                    const t2Scaled = t2 * scale;
                    const w1Scaled = w1 * scale;
                    const w2Scaled = w2 * scale;

                    R = (2 * (t2Scaled - t1Scaled)) / (w1Scaled + w2Scaled);
                }
                break;

            case 'efficiency':
                const N = parseFloat(plateCount);
                const k = parseFloat(retentionFactor);
                const α = parseFloat(selectivity);

                if (!isNaN(N) && !isNaN(k) && !isNaN(α) && N > 0 && k > 0 && α > 0) {
                    R = (Math.sqrt(N) / 4) * ((α - 1) / α) * (k / (1 + k));
                }
                break;
        }

        setResolution(R);

        // Determine resolution class
        if (R < 1.0) {
            setResolutionClass('Poor - peaks overlap significantly');
        } else if (R < 1.5) {
            setResolutionClass('Baseline separation not achieved');
        } else if (R < 2.0) {
            setResolutionClass('Good - baseline separation');
        } else {
            setResolutionClass('Excellent - complete separation');
        }
    };

    const resetCalculator = () => {
        setPeak1Time('5.2');
        setPeak2Time('5.8');
        setPeak1Width('0.2');
        setPeak2Width('0.25');
        setPlateCount('10000');
        setRetentionFactor('2.5');
        setSelectivity('1.1');
        setResolution(null);
        setResolutionClass('');
    };

    const sampleMethods = [
        {
            name: 'HPLC Method A',
            t1: '5.2', t2: '5.8',
            w1: '0.2', w2: '0.25',
            R: '2.4',
            note: 'Good separation'
        },
        {
            name: 'GC Method B',
            t1: '3.5', t2: '4.0',
            w1: '0.15', w2: '0.18',
            R: '2.78',
            note: 'Excellent resolution'
        },
        {
            name: 'Poor Separation',
            t1: '8.0', t2: '8.3',
            w1: '0.4', w2: '0.45',
            R: '0.71',
            note: 'Peaks overlap'
        },
        {
            name: 'Efficiency Based',
            N: '5000', k: '2.0', α: '1.05',
            R: '1.12',
            note: 'Theoretical calculation'
        }
    ];

    const loadSample = (index: number) => {
        const method = sampleMethods[index];
        if (method.t1) {
            setMethod('peaks');
            setPeak1Time(method.t1);
            setPeak2Time(method.t2 || '');
            setPeak1Width(method.w1 || '');
            setPeak2Width(method.w2 || '');
        } else {
            setMethod('efficiency');
            setPlateCount(method.N || '');
            setRetentionFactor(method.k || '');
            setSelectivity(method.α || '');
        }
    };

    useEffect(() => {
        calculateResolution();
    }, [method, peak1Time, peak2Time, peak1Width, peak2Width, plateCount, retentionFactor, selectivity, unit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Filter className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Chromatographic Resolution Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate separation efficiency in chromatography</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Separation Science</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Resolution Calculation Method
                            </h2>

                            {/* Method Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setMethod('peaks')}
                                        className={`p-4 rounded-xl transition-all ${method === 'peaks' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <LineChart className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">From Peak Data</span>
                                            <span className="text-sm mt-1">R = 2(t₂ - t₁)/(w₁ + w₂)</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMethod('efficiency')}
                                        className={`p-4 rounded-xl transition-all ${method === 'efficiency' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Activity className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">From Efficiency</span>
                                            <span className="text-sm mt-1">R = (√N/4) × ((α-1)/α) × (k/(1+k))</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Units Selection */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time Units</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['minutes', 'seconds'] as ResolutionUnit[]).map((timeUnit) => (
                                                <button
                                                    key={timeUnit}
                                                    onClick={() => setUnit(timeUnit)}
                                                    className={`py-2 rounded-lg transition-all ${unit === timeUnit ?
                                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                                                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {timeUnit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                            <div className="text-sm font-semibold text-gray-600">Note</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Peak widths should be in same units as retention times
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input Fields Based on Method */}
                            {method === 'peaks' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Peak Retention Times
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Peak 1 Retention Time (tᵣ₁)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={peak1Time}
                                                    onChange={(e) => setPeak1Time(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 5.2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Peak 2 Retention Time (tᵣ₂)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={peak2Time}
                                                    onChange={(e) => setPeak2Time(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 5.8"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                            Peak Widths
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Peak 1 Width at Base (w₁)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={peak1Width}
                                                    onChange={(e) => setPeak1Width(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 0.2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Peak 2 Width at Base (w₂)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={peak2Width}
                                                    onChange={(e) => setPeak2Width(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 0.25"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {method === 'efficiency' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-blue-600" />
                                            Column Efficiency
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Plate Number (N)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={plateCount}
                                                    onChange={(e) => setPlateCount(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 10000"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Theoretical plates
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Efficiency Ranges</div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        HPLC: 5,000-20,000<br />
                                                        UHPLC: 20,000-200,000<br />
                                                        GC: 1,000-50,000
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Zap className="w-5 h-5 mr-2 text-purple-600" />
                                            Retention & Selectivity
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Retention Factor (k)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={retentionFactor}
                                                    onChange={(e) => setRetentionFactor(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Selectivity (α)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={selectivity}
                                                    onChange={(e) => setSelectivity(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 1.1"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                          α = tᵣ₂'/tᵣ₁'`{'>'}` 1
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formula Display */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Resolution Formulas</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                                        <div className="text-sm font-semibold text-gray-600">From Peak Data:</div>
                                        <div className="font-mono text-sm mt-1">Rₛ = 2(tᵣ₂ - tᵣ₁)/(w₁ + w₂)</div>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                                        <div className="text-sm font-semibold text-gray-600">From Efficiency:</div>
                                        <div className="font-mono text-sm mt-1">Rₛ = (√N/4) × ((α-1)/α) × (k/(1+k))</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Methods */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Methods</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {sampleMethods.map((method, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-blue-700">{method.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                R: {method.R}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-2">{method.note}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={calculateResolution}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate Resolution
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

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Resolution Result */}
                        <div className={`rounded-2xl shadow-xl p-6 md:p-8 text-white ${resolution !== null ?
                                resolution >= 1.5 ? 'bg-gradient-to-br from-green-600 to-green-400' :
                                    resolution >= 1.0 ? 'bg-gradient-to-br from-yellow-600 to-yellow-400' :
                                        'bg-gradient-to-br from-red-600 to-red-400' :
                                'bg-gradient-to-br from-blue-600 to-green-400'
                            }`}>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Filter className="w-7 h-7 mr-3" />
                                Resolution (Rₛ)
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Chromatographic Resolution
                                    </div>
                                    {resolution !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {resolution.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                Rₛ
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resolution Class */}
                            {resolutionClass && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Separation Quality</div>
                                        <div className="text-lg font-bold">{resolutionClass}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resolution Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Resolution Standards
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {[
                                        { R: 0.5, label: 'Poor', desc: 'Severe overlap' },
                                        { R: 1.0, label: 'Baseline', desc: '94% separated' },
                                        { R: 1.5, label: 'USP', desc: '99.7% separated' },
                                        { R: 2.0, label: 'Excellent', desc: 'Complete separation' },
                                    ].map((item, index) => (
                                        <div key={index} className={`p-3 rounded-lg border ${resolution !== null && Math.abs(resolution - item.R) < 0.3
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-gray-700">{item.label}</div>
                                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                                </div>
                                                <div className="font-bold text-blue-600">Rₛ = {item.R}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Peak Visualization */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Peak Separation</h3>
                            <div className="h-48 relative border-l border-b border-gray-300">
                                {/* Simplified peak visualization */}
                                <svg className="w-full h-full">
                                    {/* Peak 1 */}
                                    <path
                                        d="M20,100 Q70,20 120,100"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                    />
                                    {/* Peak 2 */}
                                    <path
                                        d="M80,100 Q130,20 180,100"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                    />
                                    {/* Resolution indicator */}
                                    <line x1="120" y1="80" x2="80" y2="80" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
                                    <text x="100" y="75" textAnchor="middle" className="text-xs fill-red-600">Δtᵣ</text>
                                </svg>
                            </div>
                            <div className="text-center text-sm text-gray-600 mt-4">
                                Δtᵣ = {Math.abs(parseFloat(peak2Time) - parseFloat(peak1Time)).toFixed(2)} {unit}
                            </div>
                        </div>

                        {/* Improving Resolution */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Improving Resolution</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Increase N:</div>
                                    <div className="text-gray-600 mt-1">Smaller particles, longer column</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Increase α:</div>
                                    <div className="text-gray-600 mt-1">Change mobile phase, temperature</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Optimize k:</div>
                                    <div className="text-gray-600 mt-1">Adjust solvent strength (1-10 optimal)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chromatographic Principles */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Resolution Parameters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Efficiency (N)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• N = 16(tᵣ/w)²</p>
                                <p>• Higher N = narrower peaks</p>
                                <p>• Depends on particle size, flow rate</p>
                                <p>• Typical HPLC: 5,000-20,000</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Retention (k)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• k = (tᵣ - t₀)/t₀</p>
                                <p>• t₀ = column dead time</p>
                                <p>• Optimal range: 1-10</p>
                                <p>• Too high = long analysis time</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Selectivity (α)</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• α = k₂/k₁</p>
                                <p>• Must be `{'>'}` 1 for separation</p>
                                <p>• α `{'>'}` 1.1 usually needed</p>
                                <p>• Depends on chemistry differences</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}