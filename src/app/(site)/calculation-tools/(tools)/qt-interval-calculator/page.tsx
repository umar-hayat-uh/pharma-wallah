"use client";
import { useState, useEffect } from 'react';
import { Heart, Calculator, Activity, AlertCircle, Clock, TrendingUp, Info, BookOpen, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function QTIntervalCalculator() {
    const [qtInterval, setQTInterval] = useState<string>('');
    const [rrInterval, setRRInterval] = useState<string>('');
    const [heartRate, setHeartRate] = useState<string>('');
    const [formula, setFormula] = useState<'bazett' | 'fridericia' | 'framingham'>('bazett');
    const [result, setResult] = useState<{
        qtc: number;
        interpretation: string;
        risk: string;
        action: string;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateQTc = () => {
        const qt = parseFloat(qtInterval);
        const rr = parseFloat(rrInterval);
        const hr = parseFloat(heartRate);

        let rrSec = 0;
        if (hr > 0) rrSec = 60 / hr;
        else if (rr > 0) rrSec = rr / 1000;
        else {
            alert('Please enter either RR interval or heart rate');
            return;
        }

        if (qt <= 0 || rrSec <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let qtc = 0;
        switch (formula) {
            case 'bazett':
                qtc = qt / Math.sqrt(rrSec);
                break;
            case 'fridericia':
                qtc = qt / Math.cbrt(rrSec);
                break;
            case 'framingham':
                qtc = qt + 0.154 * (1 - rrSec);
                break;
        }

        let interpretation = '', risk = '', action = '';
        if (qtc < 440) {
            interpretation = 'Normal QTc';
            risk = 'Low risk for Torsades de Pointes';
            action = 'No action needed';
        } else if (qtc <= 470) {
            interpretation = 'Borderline prolonged QTc';
            risk = 'Moderate risk';
            action = 'Monitor, consider risk factors';
        } else if (qtc <= 500) {
            interpretation = 'Prolonged QTc';
            risk = 'High risk';
            action = 'Review medications, ECG monitoring';
        } else {
            interpretation = 'Markedly prolonged QTc';
            risk = 'Very high risk';
            action = 'Immediate action required';
        }

        setResult({ qtc, interpretation, risk, action });

        // Generate QTc vs HR curve for selected formula
        const data = [];
        for (let h = 40; h <= 140; h += 5) {
            const r = 60 / h;
            let q;
            if (formula === 'bazett') q = qt / Math.sqrt(r);
            else if (formula === 'fridericia') q = qt / Math.cbrt(r);
            else q = qt + 0.154 * (1 - r);
            data.push({ hr: h, qtc: q });
        }
        setChartData(data);
    };

    useEffect(() => {
        if (qtInterval && (rrInterval || heartRate)) calculateQTc();
    }, [qtInterval, rrInterval, heartRate, formula]);

    const reset = () => {
        setQTInterval('');
        setRRInterval('');
        setHeartRate('');
        setResult(null);
        setChartData([]);
    };

    const sampleCases = [
        { qt: '400', hr: '60', formula: 'bazett', label: 'Normal' },
        { qt: '480', hr: '60', formula: 'bazett', label: 'Prolonged' },
        { qt: '380', hr: '120', formula: 'fridericia', label: 'Tachycardia' },
        { qt: '420', hr: '50', formula: 'framingham', label: 'Bradycardia' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">QT Interval Calculator</h1>
                                <p className="text-blue-100 mt-2">QTc = QT / √(RR) </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Torsades Risk Assessment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">ECG Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">QT interval (ms)</label>
                                    <input type="number" step="1" min="100" max="1000" value={qtInterval} onChange={(e) => setQTInterval(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 400" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">RR interval (ms)</label>
                                    <input type="number" step="1" min="100" max="2000" value={rrInterval} onChange={(e) => {
                                        setRRInterval(e.target.value);
                                        if (e.target.value) setHeartRate((60000 / parseFloat(e.target.value)).toFixed(0));
                                    }} className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 1000" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Heart rate (bpm)</label>
                                    <input type="number" step="1" min="20" max="200" value={heartRate} onChange={(e) => {
                                        setHeartRate(e.target.value);
                                        if (e.target.value) setRRInterval((60000 / parseFloat(e.target.value)).toFixed(0));
                                    }} className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 60" />
                                </div>
                            </div>

                            {/* Formula selection */}
                            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Correction Formula</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button onClick={() => setFormula('bazett')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${formula === 'bazett' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Bazett
                                    </button>
                                    <button onClick={() => setFormula('fridericia')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${formula === 'fridericia' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Fridericia
                                    </button>
                                    <button onClick={() => setFormula('framingham')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${formula === 'framingham' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Framingham
                                    </button>
                                </div>
                            </div>

                            {/* Sample cases */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Example Cases</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleCases.map((s, idx) => (
                                        <button key={idx} onClick={() => { setQTInterval(s.qt); setHeartRate(s.hr); setFormula(s.formula as any); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{s.label}</div>
                                            <div>QT {s.qt}, HR {s.hr}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateQTc}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate QTc
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* QTc vs HR Chart */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">QTc vs. Heart Rate</h3>
                                {/* Increased height to h-64 to stop label crowding */}
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 10, right: 30, left: 45, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                                            <XAxis
                                                dataKey="hr"
                                                fontSize={12}
                                                tickMargin={10}
                                                label={{
                                                    value: "Heart Rate (bpm)",
                                                    position: "insideBottom",
                                                    offset: -25,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    fill: '#4b5563'
                                                }}
                                            />

                                            <YAxis
                                                fontSize={12}
                                                width={50}
                                                domain={['auto', 'auto']} // Zooms in on the relevant QTc range
                                                label={{
                                                    value: "QTc (ms)",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    style: { textAnchor: 'middle' },
                                                    offset: -30,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    fill: '#4b5563'
                                                }}
                                            />

                                            <Tooltip
                                                formatter={(value) => [`${value !== undefined && value !== null ? Number(value).toFixed(0) : '0'} ms`, "QTc"]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="qtc"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                dot={false}
                                                animationDuration={1000}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About QT Correction
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Bazett:</span> QTc = QT / √(RR). Most common, overcorrects at high heart rates.</p>
                                    <p><span className="font-semibold">Fridericia:</span> QTc = QT / ∛(RR). More accurate at tachycardia.</p>
                                    <p><span className="font-semibold">Framingham:</span> QTc = QT + 0.154×(1‑RR). Linear correction.</p>
                                    <p><span className="font-semibold">Normal values:</span> Men {'<'}440 ms, Women {'<'}470 ms (Bazett).</p>
                                    <p className="text-xs italic">Sources: Circulation 2016;133(13):1301‑15, ACC/AHA Guidelines.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">QTc Result</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.qtc.toFixed(0)} ms</div>
                                    <div className="text-lg">{result.interpretation}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{result.risk}</p>
                                    <p className="text-sm mt-2"><span className="font-semibold">Action:</span> {result.action}</p>
                                </div>
                            </div>
                        )}

                        {/* QT‑prolonging drugs table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Common QT‑prolonging Drugs
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <tr><th className="py-2 px-3 text-left">Drug</th><th>Class</th><th>Risk</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Amiodarone</td><td>Antiarrhythmic</td><td className="text-red-600">High</td></tr>
                                        <tr className="bg-gray-50"><td>Haloperidol</td><td>Antipsychotic</td><td className="text-orange-600">Moderate</td></tr>
                                        <tr><td>Azithromycin</td><td>Macrolide</td><td className="text-yellow-600">Moderate</td></tr>
                                        <tr className="bg-gray-50"><td>Citalopram</td><td>SSRI</td><td className="text-yellow-600">Dose‑dependent</td></tr>
                                        <tr><td>Ondansetron</td><td>Antiemetic</td><td className="text-orange-600">Moderate</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Risk scale */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">QTc Risk Categories</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Normal</span><span>&lt;440 (M) / &lt;470 (F)</span></div>
                                <div className="flex justify-between"><span>Borderline</span><span>440‑470 (M) / 470‑480 (F)</span></div>
                                <div className="flex justify-between"><span>Prolonged</span><span>&gt;470 (M) / &gt;480 (F)</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}