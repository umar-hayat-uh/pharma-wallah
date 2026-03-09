"use client";
import { useState, useEffect } from 'react';
import { Calculator, Filter, Activity, AlertCircle, Clock, Droplet, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ClearanceCalculator() {
    const [method, setMethod] = useState<'single' | 'steady'>('single');
    const [dose, setDose] = useState<string>('');
    const [auc, setAuc] = useState<string>('');
    const [concentration, setConcentration] = useState<string>('');
    const [infusionRate, setInfusionRate] = useState<string>('');
    const [volume, setVolume] = useState<string>(''); // optional for half-life
    const [result, setResult] = useState<{
        clearance: number;
        clearancePerKg: number;
        halfLife: number | null;
        interpretation: string;
        organInvolved: string;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    const calculateClearance = () => {
        if (method === 'single') {
            const D = parseFloat(dose);
            const AUC = parseFloat(auc);

            if (isNaN(D) || isNaN(AUC) || D <= 0 || AUC <= 0) {
                alert('Please enter valid positive numbers for dose and AUC');
                return;
            }

            const clearance = D / AUC; // L/h
            calculateInterpretation(clearance);
        } else {
            const Css = parseFloat(concentration);
            const R0 = parseFloat(infusionRate);

            if (isNaN(Css) || isNaN(R0) || Css <= 0 || R0 <= 0) {
                alert('Please enter valid positive numbers for steady‑state concentration and infusion rate');
                return;
            }

            const clearance = R0 / Css;
            calculateInterpretation(clearance);
        }
    };

    const calculateInterpretation = (clearance: number) => {
        const V = parseFloat(volume);
        const halfLife = !isNaN(V) && V > 0 ? (0.693 * V) / clearance : null;

        // Per 70 kg patient
        const clearancePerKg = clearance / 70;

        let interpretation = '';
        let organInvolved = '';

        if (clearance < 0.5) {
            interpretation = 'Very low clearance – severely impaired elimination';
            organInvolved = 'Severe hepatic/renal impairment';
        } else if (clearance < 2) {
            interpretation = 'Low clearance – reduced elimination capacity';
            organInvolved = 'Moderate hepatic/renal impairment';
        } else if (clearance < 10) {
            interpretation = 'Normal clearance – typical elimination';
            organInvolved = 'Normal hepatic/renal function';
        } else if (clearance < 30) {
            interpretation = 'High clearance – efficient elimination';
            organInvolved = 'Enhanced metabolism/excretion';
        } else {
            interpretation = 'Very high clearance – blood flow limited';
            organInvolved = 'Liver blood flow limited';
        }

        setResult({ clearance, clearancePerKg, halfLife, interpretation, organInvolved });

        // Prepare pie data for organ contribution (illustrative)
        setChartData([
            { name: 'Liver', value: clearance > 10 ? 70 : 40 },
            { name: 'Kidneys', value: clearance < 10 ? 60 : 20 },
            { name: 'Other', value: 10 },
        ]);
    };

    const resetCalculator = () => {
        setDose('');
        setAuc('');
        setConcentration('');
        setInfusionRate('');
        setVolume('');
        setResult(null);
        setChartData([]);
    };

    const sampleDrugs = [
        { name: 'Digoxin', clearance: 0.12, method: 'single' },
        { name: 'Theophylline', clearance: 0.04, method: 'single' },
        { name: 'Gentamicin', clearance: 0.1, method: 'steady' },
        { name: 'Lidocaine', clearance: 0.95, method: 'steady' },
        { name: 'Propranolol', clearance: 1.2, method: 'single' },
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setMethod(drug.method as 'single' | 'steady');
        if (drug.method === 'single') {
            setDose('100');
            setAuc((100 / drug.clearance).toFixed(2));
        } else {
            setConcentration('10');
            setInfusionRate((10 * drug.clearance).toFixed(2));
        }
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Filter className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Clearance (CL) Calculator</h1>
                                <p className="text-blue-100 mt-2">Dose / AUC or Infusion rate / Css</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Gauge className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Elimination capacity</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Calculation Method
                            </h2>

                            {/* Method Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <button onClick={() => setMethod('single')}
                                    className={`p-4 rounded-xl transition-all ${method === 'single' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Single Dose</span>
                                        <span className="text-xs mt-1">CL = Dose / AUC</span>
                                    </div>
                                </button>
                                <button onClick={() => setMethod('steady')}
                                    className={`p-4 rounded-xl transition-all ${method === 'steady' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <div className="flex flex-col items-center">
                                        <Gauge className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Steady‑State</span>
                                        <span className="text-xs mt-1">CL = R₀ / Css</span>
                                    </div>
                                </button>
                            </div>

                            {/* Inputs */}
                            {method === 'single' ? (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                        <input type="number" step="0.001" value={dose} onChange={(e) => setDose(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">AUC (mg·h/L)</label>
                                        <input type="number" step="0.001" value={auc} onChange={(e) => setAuc(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Steady‑State Conc. (mg/L)</label>
                                        <input type="number" step="0.001" value={concentration} onChange={(e) => setConcentration(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Infusion Rate (mg/h)</label>
                                        <input type="number" step="0.001" value={infusionRate} onChange={(e) => setInfusionRate(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                </div>
                            )}

                            {/* Volume (optional) */}
                            <div className="mt-6 bg-gray-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Volume of Distribution (L) – optional</label>
                                <input type="number" step="0.001" value={volume} onChange={(e) => setVolume(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                <p className="text-xs text-gray-500 mt-2">Enter to calculate half‑life: t½ = 0.693·Vd/CL</p>
                            </div>

                            {/* Example Drugs */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {sampleDrugs.map((drug, index) => (
                                        <button key={index} onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center">
                                            <div className="font-semibold text-blue-700">{drug.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">CL = {drug.clearance} L/h</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateClearance}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Calculate Clearance
                                </button>
                                <button onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results & Info Sidebar */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <Filter className="w-7 h-7 mr-3" />
                                    Clearance Result
                                </h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">CL</div>
                                    <div className="text-4xl font-bold mb-2">{result.clearance.toFixed(3)} L/h</div>
                                    <div className="text-lg">({result.clearancePerKg.toFixed(4)} L/h/kg)</div>
                                </div>
                                {result.halfLife !== null && (
                                    <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">Half-life (t½)</div>
                                            <div className="text-2xl font-bold">{result.halfLife.toFixed(2)} h</div>
                                        </div>
                                        <Clock className="w-8 h-8 opacity-80" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interpretation */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Interpretation
                                </h3>
                                <p className="text-gray-700 mb-2">{result.interpretation}</p>
                                <p className="text-sm text-gray-600"><strong>Primary organ:</strong> {result.organInvolved}</p>
                            </div>
                        )}

                        {/* Organ Contribution Pie */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Organ Contribution (illustrative)</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                                {chartData.map((entry, idx) => (
                                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formulae</h3>
                            <div className="space-y-2 text-sm">
                                <div className="p-2 bg-white rounded">CL = Dose / AUC (single dose)</div>
                                <div className="p-2 bg-white rounded">CL = R₀ / Css (steady‑state)</div>
                                <div className="p-2 bg-white rounded">t½ = 0.693 × Vd / CL</div>
                            </div>
                        </div>

                        {/* Clearance Scale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Clearance Scale</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>&lt;0.5 L/h</span><span className="text-red-600">Severe impairment</span></div>
                                <div className="flex justify-between"><span>0.5–2 L/h</span><span className="text-orange-600">Reduced</span></div>
                                <div className="flex justify-between"><span>2–10 L/h</span><span className="text-green-600">Normal</span></div>
                                <div className="flex justify-between"><span>10–30 L/h</span><span className="text-blue-600">High</span></div>
                                <div className="flex justify-between"><span>&gt;30 L/h</span><span className="text-purple-600">Flow‑limited</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}