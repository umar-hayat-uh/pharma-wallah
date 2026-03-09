"use client";
import { useState, useEffect } from 'react';
import { Filter, Calculator, BarChart, RefreshCw, AlertCircle, TrendingUp, Target, Activity, Info, BookOpen, LineChart, ChevronUp, ChevronDown } from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ResolutionUnit = 'minutes' | 'seconds';

export default function ChromatographicResolutionCalculator() {
    const [method, setMethod] = useState<'peaks' | 'efficiency'>('peaks');
    const [t1, setT1] = useState<string>('5.2');
    const [t2, setT2] = useState<string>('5.8');
    const [w1, setW1] = useState<string>('0.2');
    const [w2, setW2] = useState<string>('0.25');
    const [N, setN] = useState<string>('10000');
    const [k, setK] = useState<string>('2.5');
    const [α, setΑ] = useState<string>('1.1');
    const [resolution, setResolution] = useState<number | null>(null);
    const [unit, setUnit] = useState<ResolutionUnit>('minutes');
    const [peakData, setPeakData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        let R = 0;
        if (method === 'peaks') {
            const t1n = parseFloat(t1);
            const t2n = parseFloat(t2);
            const w1n = parseFloat(w1);
            const w2n = parseFloat(w2);
            if (!isNaN(t1n) && !isNaN(t2n) && !isNaN(w1n) && !isNaN(w2n) && w1n > 0 && w2n > 0) {
                R = 2 * (t2n - t1n) / (w1n + w2n);
            }
        } else {
            const Nn = parseFloat(N);
            const kn = parseFloat(k);
            const αn = parseFloat(α);
            if (!isNaN(Nn) && !isNaN(kn) && !isNaN(αn) && Nn > 0 && kn > 0 && αn > 0) {
                R = (Math.sqrt(Nn) / 4) * ((αn - 1) / αn) * (kn / (1 + kn));
            }
        }
        setResolution(R);

        // Generate simulated peaks
        const data = [];
        for (let i = 0; i <= 200; i++) {
            const x = i / 20;
            const peak1 = method === 'peaks' ? Math.exp(-Math.pow((x - parseFloat(t1)) * 5, 2)) : 0;
            const peak2 = method === 'peaks' ? Math.exp(-Math.pow((x - parseFloat(t2)) * 5, 2)) : 0;
            data.push({ time: x, signal: peak1 + peak2 });
        }
        setPeakData(data);
    };

    useEffect(() => { calculate(); }, [method, t1, t2, w1, w2, N, k, α, unit]);

    const reset = () => {
        setT1('5.2'); setT2('5.8'); setW1('0.2'); setW2('0.25');
        setN('10000'); setK('2.5'); setΑ('1.1');
        setUnit('minutes');
    };

    const samples = [
        { name: 'HPLC Method', t1: '5.2', t2: '5.8', w1: '0.2', w2: '0.25', R: '2.4' },
        { name: 'GC Method', t1: '3.5', t2: '4.0', w1: '0.15', w2: '0.18', R: '2.78' },
        { name: 'Poor Separation', t1: '8.0', t2: '8.3', w1: '0.4', w2: '0.45', R: '0.71' }
    ];
    const loadSample = (idx: number) => {
        const s = samples[idx];
        setMethod('peaks');
        setT1(s.t1); setT2(s.t2); setW1(s.w1); setW2(s.w2);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Filter className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Chromatographic Resolution Calculator</h1>
                                <p className="text-blue-100 mt-2">Rₛ = 2(t₂−t₁)/(w₁+w₂)</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Separation Science</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button onClick={() => setMethod('peaks')}
                                    className={`p-4 rounded-xl ${method === 'peaks' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-gray-100'}`}>
                                    From peak data
                                </button>
                                <button onClick={() => setMethod('efficiency')}
                                    className={`p-4 rounded-xl ${method === 'efficiency' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-gray-100'}`}>
                                    From efficiency
                                </button>
                            </div>

                            {method === 'peaks' ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Retention time 1</label>
                                        <input type="number" step="0.01" value={t1} onChange={(e) => setT1(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Retention time 2</label>
                                        <input type="number" step="0.01" value={t2} onChange={(e) => setT2(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Peak width 1</label>
                                        <input type="number" step="0.01" value={w1} onChange={(e) => setW1(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Peak width 2</label>
                                        <input type="number" step="0.01" value={w2} onChange={(e) => setW2(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Plate number N</label>
                                        <input type="number" step="1" value={N} onChange={(e) => setN(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Retention factor k</label>
                                        <input type="number" step="0.01" value={k} onChange={(e) => setK(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Selectivity α</label>
                                        <input type="number" step="0.01" value={α} onChange={(e) => setΑ(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {samples.map((s, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{s.name}</div>
                                            <div>Rₛ {s.R}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Resolution
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Resolution
                                </h3>
                                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Resolution (Rₛ):</span> A measure of how well two peaks are separated.</p>
                                    <p><span className="font-semibold">Rₛ = 1.5:</span> Baseline separation (USP requirement).</p>
                                    <p><span className="font-semibold">Rₛ = 1.0:</span> 94% separation, acceptable for quantification.</p>
                                    <p><span className="font-semibold">Parameters:</span> N (plate count), k (retention factor), α (selectivity).</p>
                                    <p className="text-xs italic">Sources: USP `&gt; 621, Snyder’s Introduction to Modern Liquid Chromatography.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {resolution !== null && (
                            <div className={`rounded-2xl shadow-xl p-6 text-white ${resolution >= 1.5 ? 'bg-gradient-to-br from-green-600 to-green-400' :
                                    resolution >= 1.0 ? 'bg-gradient-to-br from-yellow-600 to-yellow-400' :
                                        'bg-gradient-to-br from-red-600 to-red-400'
                                }`}>
                                <h2 className="text-2xl font-bold mb-4">Resolution</h2>
                                <div className="bg-white/20 rounded-xl p-6 text-center">
                                    <div className="text-5xl font-bold">{resolution.toFixed(2)}</div>
                                    <div className="mt-2 text-sm">
                                        {resolution < 1.0 ? 'Poor' : resolution < 1.5 ? 'Baseline not achieved' : resolution < 2.0 ? 'Good' : 'Excellent'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Simulated Peaks</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReLineChart
                                        data={peakData}
                                        margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fontSize: 10 }}
                                            label={{ value: 'Time', position: 'insideBottom', offset: -15 }}
                                            height={50}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            width={45}
                                        />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="signal" stroke="#3b82f6" dot={false} />
                                    </ReLineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Resolution Criteria</h3>
                            <p>Rₛ &gt; 1.5: baseline separation<br />Rₛ = 1.0: 94% separated<br />Rₛ &lt; 0.8: overlap</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}