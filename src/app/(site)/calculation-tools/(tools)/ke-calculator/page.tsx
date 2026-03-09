"use client";
import { useState, useEffect } from 'react';
import {
    TrendingDown,
    Calculator,
    Activity,
    Clock,
    RefreshCw,
    AlertCircle,
    Zap,
    PieChart,
    Timer
} from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart } from 'recharts';

export default function KeCalculator() {
    const [method, setMethod] = useState<'halfLife' | 'clearance' | 'concentration'>('halfLife');
    const [halfLife, setHalfLife] = useState<string>('4');
    const [clearance, setClearance] = useState<string>('5');
    const [volume, setVolume] = useState<string>('50');
    const [dose, setDose] = useState<string>('100');
    const [initialConcentration, setInitialConcentration] = useState<string>('10');
    const [ke, setKe] = useState<number | null>(null);
    const [calculatedHalfLife, setCalculatedHalfLife] = useState<number | null>(null);
    const [timeUnits] = useState<'hours' | 'minutes'>('hours');
    const [chartData, setChartData] = useState<Array<{ time: number, conc: number }>>([]);

    const calculateKe = () => {
        let k = 0;

        switch (method) {
            case 'halfLife':
                const t12 = parseFloat(halfLife);
                if (!isNaN(t12) && t12 > 0) {
                    k = 0.693 / t12; // [citation:1]
                    setCalculatedHalfLife(t12);
                }
                break;

            case 'clearance':
                const cl = parseFloat(clearance);
                const vd = parseFloat(volume);
                if (!isNaN(cl) && !isNaN(vd) && vd > 0) {
                    k = cl / vd; // k = Cl / Vd [citation:1]
                    setCalculatedHalfLife(0.693 / k);
                }
                break;

            case 'concentration':
                const doseVal = parseFloat(dose);
                const c0 = parseFloat(initialConcentration);
                if (!isNaN(doseVal) && !isNaN(c0) && c0 > 0) {
                    const vdCalc = doseVal / c0;
                    // Assume typical clearance or use entered clearance
                    const cl = parseFloat(clearance);
                    if (!isNaN(cl)) {
                        k = cl / vdCalc;
                        setCalculatedHalfLife(0.693 / k);
                    }
                }
                break;
        }

        setKe(k);

        // Generate decay curve
        if (k > 0) {
            const data = [];
            for (let t = 0; t <= 10; t += 0.5) {
                data.push({ time: t, conc: Math.exp(-k * t) * 100 });
            }
            setChartData(data);
        }
    };

    const resetCalculator = () => {
        setHalfLife('4');
        setClearance('5');
        setVolume('50');
        setDose('100');
        setInitialConcentration('10');
        setKe(null);
        setCalculatedHalfLife(null);
        setChartData([]);
    };

    const sampleValues = [
        { name: 'Short t½', t12: '2', ke: '0.346', cl: '10', vd: '30' },
        { name: 'Medium t½', t12: '6', ke: '0.116', cl: '8', vd: '70' },
        { name: 'Long t½', t12: '24', ke: '0.029', cl: '2', vd: '70' },
    ];

    const loadSample = (index: number) => {
        const sample = sampleValues[index];
        setMethod('halfLife');
        setHalfLife(sample.t12);
        setClearance(sample.cl);
        setVolume(sample.vd);
    };

    const getKeInterpretation = (k: number) => {
        if (k > 0.5) return 'Very rapid elimination – multiple daily doses';
        if (k > 0.1) return 'Rapid elimination – multiple daily doses';
        if (k > 0.05) return 'Moderate elimination – once or twice daily';
        if (k > 0.01) return 'Slow elimination – once daily';
        return 'Very slow elimination – weekly or less';
    };

    useEffect(() => {
        calculateKe();
    }, [method, halfLife, clearance, volume, dose, initialConcentration]);

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
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Elimination Rate Constant (kₑ) Calculator</h1>
                                <p className="text-blue-100 mt-2">First-order elimination kinetics per MSD Manual</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">First-Order Kinetics</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Calculation Method
                            </h2>

                            {/* Method Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button onClick={() => setMethod('halfLife')}
                                    className={`p-4 rounded-xl transition-all ${method === 'halfLife' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Clock className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">From half-life</span>
                                    <span className="text-xs mt-1">kₑ = 0.693 / t½</span>
                                </button>
                                <button onClick={() => setMethod('clearance')}
                                    className={`p-4 rounded-xl transition-all ${method === 'clearance' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">From Cl & Vd</span>
                                    <span className="text-xs mt-1">kₑ = Cl / Vd</span>
                                </button>
                                <button onClick={() => setMethod('concentration')}
                                    className={`p-4 rounded-xl transition-all ${method === 'concentration' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <PieChart className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">From dose & C₀</span>
                                    <span className="text-xs mt-1">Vd = Dose/C₀, then kₑ = Cl/Vd</span>
                                </button>
                            </div>

                            {/* Inputs */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                {method === 'halfLife' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Half-Life (t½, {timeUnits})</label>
                                        <input type="number" step="0.1" value={halfLife} onChange={(e) => setHalfLife(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                )}
                                {method === 'clearance' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance (L/h)</label>
                                            <input type="number" step="0.1" value={clearance} onChange={(e) => setClearance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Volume of Distribution (L)</label>
                                            <input type="number" step="0.1" value={volume} onChange={(e) => setVolume(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                        </div>
                                    </div>
                                )}
                                {method === 'concentration' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                            <input type="number" step="0.1" value={dose} onChange={(e) => setDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">C₀ (mg/L)</label>
                                            <input type="number" step="0.1" value={initialConcentration} onChange={(e) => setInitialConcentration(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance (L/h)</label>
                                            <input type="number" step="0.1" value={clearance} onChange={(e) => setClearance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sample Values */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Examples</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sampleValues.map((sample, index) => (
                                        <button key={index} onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center">
                                            <div className="font-semibold text-blue-700">{sample.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">kₑ = {sample.ke} h⁻¹</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateKe}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Calculate kₑ
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
                        {/* Ke Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <TrendingDown className="w-7 h-7 mr-3" />
                                Elimination Rate
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                <div className="text-sm font-semibold text-blue-100 mb-2">kₑ</div>
                                {ke !== null ? (
                                    <>
                                        <div className="text-5xl font-bold mb-2">{ke.toFixed(4)}</div>
                                        <div className="text-2xl">{timeUnits}⁻¹</div>
                                    </>
                                ) : (
                                    <div className="text-3xl font-bold text-blue-100">Enter Values</div>
                                )}
                            </div>
                            {calculatedHalfLife !== null && (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">Calculated t½</div>
                                    <div className="text-2xl font-bold">{calculatedHalfLife.toFixed(2)} {timeUnits}</div>
                                </div>
                            )}
                        </div>

                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Elimination Curve</h3>
                                <div className="h-64">  {/* increased height */}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 50, bottom: 30 }}  // extra space
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="time"
                                                label="Time (h)"
                                                angle={-30}               // tilt labels
                                                textAnchor="end"
                                                height={70}                // room for angled text
                                                interval="preserveStartEnd" // or a number like 3
                                            />
                                            <YAxis
                                                label={{ value: "% Remaining", angle: -90, position: "insideLeft" }}
                                            />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="conc" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Interpretation */}
                        {ke !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Significance
                                </h3>
                                <p className="text-gray-700">{getKeInterpretation(ke)}</p>
                                <p className="text-xs text-gray-500 mt-2">Fraction eliminated per hour: {(ke * 100).toFixed(1)}%</p>
                            </div>
                        )}

                        {/* Key Relationships */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Key Relationships</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-2 bg-white/50 rounded">t½ = 0.693 / kₑ</div>
                                <div className="p-2 bg-white/50 rounded">Cl = kₑ × Vd</div>
                                <div className="p-2 bg-white/50 rounded">AUC = Dose / (kₑ × Vd)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}