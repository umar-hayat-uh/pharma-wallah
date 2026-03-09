"use client";
import { useState } from 'react';
import { Target, RefreshCw, Activity, Info, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DrugReceptorBindingAffinityTool() {
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
    const [curveData, setCurveData] = useState<any[]>([]);

    const calculateAffinity = () => {
        let bindingConstant = 0;
        let affinity = '';

        if (kd) {
            bindingConstant = parseFloat(kd);
            affinity = `Kd = ${bindingConstant} nM`;
        } else if (ki) {
            bindingConstant = parseFloat(ki);
            affinity = `Ki = ${bindingConstant} nM`;
        } else if (ic50) {
            bindingConstant = parseFloat(ic50);
            // Cheng‑Prusoff for competitive inhibition 
            const L = parseFloat(ligandConcentration);
            const Km = 100; // assumed radioligand Kd
            const kiValue = bindingConstant / (1 + L / Km);
            bindingConstant = kiValue;
            affinity = `IC50 = ${ic50} nM → Ki ≈ ${kiValue.toFixed(2)} nM (Cheng‑Prusoff)`;
        } else {
            alert('Enter at least one binding parameter');
            return;
        }

        // Receptor occupancy: [LR] / R_total = [L] / (Kd + [L]) 
        const L = parseFloat(ligandConcentration);
        const R = parseFloat(receptorConcentration);
        const occupancy = (L * R) / (bindingConstant + L) * 100;

        let classification = '', color = '';
        if (bindingConstant < 0.1) { classification = 'ULTRA‑HIGH AFFINITY'; color = 'text-purple-600'; }
        else if (bindingConstant < 1) { classification = 'HIGH AFFINITY'; color = 'text-green-600'; }
        else if (bindingConstant < 100) { classification = 'MEDIUM AFFINITY'; color = 'text-blue-600'; }
        else if (bindingConstant < 1000) { classification = 'LOW AFFINITY'; color = 'text-yellow-600'; }
        else { classification = 'VERY LOW AFFINITY'; color = 'text-red-600'; }

        setResult({ affinity, occupancy: Math.min(occupancy, 100), classification, color, bindingConstant });

        // Generate saturation binding curve
        const data = [];
        for (let logL = -2; logL <= 2; logL += 0.1) {
            const conc = Math.pow(10, logL) * bindingConstant;
            const bound = (conc * R) / (bindingConstant + conc);
            data.push({ logL: parseFloat(logL.toFixed(2)), bound: parseFloat(bound.toFixed(2)) });
        }
        setCurveData(data);
    };

    const reset = () => {
        setKd(''); setKi(''); setIc50('');
        setLigandConcentration('10'); setReceptorConcentration('1');
        setResult(null); setCurveData([]);
    };

    const exampleDrugs = [
        { drug: 'Fentanyl (μ‑opioid)', Kd: '0.1', affinity: 'Ultra‑High' },
        { drug: 'Propranolol (β‑blocker)', Kd: '1.0', affinity: 'High' },
        { drug: 'Aspirin (COX‑1)', Kd: '100', affinity: 'Medium' },
        { drug: 'Warfarin (VKOR)', Kd: '1000', affinity: 'Low' },
        { drug: 'Penicillin (PBPs)', Kd: '10000', affinity: 'Very Low' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Drug‑Receptor Binding Affinity Tool</h1>
                                <p className="text-blue-100 mt-2">Kd, Ki, IC50 & receptor occupancy</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Binding Parameters</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kd (nM)</label>
                                    <input type="number" step="0.001" value={kd} onChange={(e) => setKd(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ki (nM)</label>
                                    <input type="number" step="0.001" value={ki} onChange={(e) => setKi(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">IC50 (nM)</label>
                                    <input type="number" step="0.001" value={ic50} onChange={(e) => setIc50(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ligand [L] (nM)</label>
                                    <input type="number" step="0.1" value={ligandConcentration} onChange={(e) => setLigandConcentration(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Receptor [R] (nM)</label>
                                    <input type="number" step="0.1" value={receptorConcentration} onChange={(e) => setReceptorConcentration(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-lg" />
                                </div>
                            </div>

                            {/* Example Drugs */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Drugs</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {exampleDrugs.map((drug, idx) => (
                                        <button key={idx} onClick={() => setKd(drug.Kd)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{drug.drug.split(' ')[0]}</div>
                                            <div>Kd {drug.Kd} nM</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateAffinity}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Calculate Affinity
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl">
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Saturation Binding Curve */}
                        {curveData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Saturation Binding</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={curveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="logL" 
                                                label={{ value: 'log ([L] / Kd)', position: 'insideBottom', offset: -5 }} 
                                            />
                                            <YAxis 
                                                label={{ value: 'Bound (nM)', angle: -90, position: 'insideLeft' }} 
                                            />
                                            <Tooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey="bound" 
                                                stroke="#3b82f6" 
                                                strokeWidth={2} 
                                                dot={false}
                                                name="Bound"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Theoretical saturation binding curve (Langmuir isotherm).</p>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                        {result && (
                            <>
                                <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                    <h2 className="text-2xl font-bold mb-4">Affinity Result</h2>
                                    <div className="bg-white/20 rounded-xl p-4 text-center">
                                        <div className="text-sm font-semibold text-blue-100 mb-2">Binding constant</div>
                                        <div className="text-3xl font-bold mb-2">{result.affinity}</div>
                                        <div className={`text-lg font-bold ${result.color}`}>{result.classification}</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Receptor Occupancy</h3>
                                    <p className="text-3xl font-bold text-purple-600">{result.occupancy.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600 mt-2">at [L] = {ligandConcentration} nM</p>
                                </div>
                            </>
                        )}

                        {/* Cheng‑Prusoff */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-600" />
                                Cheng‑Prusoff
                            </h3>
                            <p className="text-sm">Ki = IC₅₀ / (1 + [L]/Kd) </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}