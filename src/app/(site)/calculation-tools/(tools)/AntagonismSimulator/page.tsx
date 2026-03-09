"use client";
import { useState, useEffect } from 'react';
import { Activity, Calculator, FlaskConical, RefreshCw, AlertCircle, GitMerge, Sigma, CalculatorIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AntagonismType = 'competitive' | 'noncompetitive' | 'uncompetitive';

export default function AntagonismSimulator() {
    const [antagType, setAntagType] = useState<AntagonismType>('competitive');
    const [agonistConc, setAgonistConc] = useState<string>('10');
    const [antagonistConc, setAntagonistConc] = useState<string>('5');
    const [ka, setKa] = useState<string>('0.5'); // agonist affinity (1/µM)
    const [kb, setKb] = useState<string>('0.2'); // antagonist affinity (1/µM)
    const [emax, setEmax] = useState<string>('100');
    const [response, setResponse] = useState<number | null>(null);
    const [ec50Shift, setEc50Shift] = useState<number | null>(null);
    const [units] = useState<'µM' | 'nM' | 'mM'>('µM');
    const [doseResponseData, setDoseResponseData] = useState<any[]>([]);

    const calculateResponse = () => {
        const A = parseFloat(agonistConc);
        const B = parseFloat(antagonistConc);
        const KdA = 1 / parseFloat(ka);
        const KdB = 1 / parseFloat(kb);
        const Em = parseFloat(emax);

        if (isNaN(A) || isNaN(B) || isNaN(KdA) || isNaN(KdB) || isNaN(Em) || A <= 0) return;

        let occupancy = 0;
        let ratio = 1;

        // Gaddum equation for competitive antagonism [citation:1][citation:6]
        switch (antagType) {
            case 'competitive':
                occupancy = A / (A + KdA * (1 + B / KdB));
                ratio = 1 + B / KdB; // Schild equation: dose ratio = 1 + [B]/KdB
                break;
            case 'noncompetitive':
                occupancy = (A / (A + KdA)) * (1 - B / (B + KdB));
                ratio = 1; // no EC50 shift
                break;
            case 'uncompetitive':
                occupancy = (A / (A + KdA)) * (KdB / (KdB + B));
                ratio = 1; // simplified – affects both Emax and EC50
                break;
        }

        setResponse(occupancy * Em);
        setEc50Shift(ratio);

        // Generate dose-response curve for visualization
        const data = [];
        for (let logA = -2; logA <= 2; logA += 0.1) {
            const conc = Math.pow(10, logA) * 1; // relative to KdA
            let occ;
            if (antagType === 'competitive') {
                occ = conc / (conc + 1 * (1 + B / KdB));
            } else if (antagType === 'noncompetitive') {
                occ = (conc / (conc + 1)) * (1 - B / (B + KdB));
            } else {
                occ = (conc / (conc + 1)) * (KdB / (KdB + B));
            }
            data.push({
                logConc: logA,
                response: occ * Em
            });
        }
        setDoseResponseData(data);
    };

    useEffect(() => {
        calculateResponse();
    }, [antagType, agonistConc, antagonistConc, ka, kb, emax]);

    const reset = () => {
        setAntagType('competitive');
        setAgonistConc('10');
        setAntagonistConc('5');
        setKa('0.5');
        setKb('0.2');
        setEmax('100');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <GitMerge className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Antagonism Simulator</h1>
                                <p className="text-blue-100 mt-2">Model receptor‑antagonist interactions</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Sigma className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Pharmacodynamics</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Antagonism Parameters
                            </h2>

                            {/* Antagonism type cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button onClick={() => setAntagType('competitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'competitive' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Competitive</span>
                                    <span className="text-xs">EC₅₀ ↑, Emax ↔</span>
                                </button>
                                <button onClick={() => setAntagType('noncompetitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'noncompetitive' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <FlaskConical className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Non‑competitive</span>
                                    <span className="text-xs">Emax ↓, EC₅₀ ↔</span>
                                </button>
                                <button onClick={() => setAntagType('uncompetitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'uncompetitive' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <GitMerge className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="font-semibold block">Uncompetitive</span>
                                    <span className="text-xs">Both affected</span>
                                </button>
                            </div>

                            {/* Input fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agonist [A] ({units})</label>
                                    <input type="number" step="0.1" value={agonistConc} onChange={(e) => setAgonistConc(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Antagonist [B] ({units})</label>
                                    <input type="number" step="0.1" value={antagonistConc} onChange={(e) => setAntagonistConc(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agonist affinity kₐ ({units}⁻¹)</label>
                                    <input type="number" step="0.01" value={ka} onChange={(e) => setKa(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Antagonist affinity k_b ({units}⁻¹)</label>
                                    <input type="number" step="0.01" value={kb} onChange={(e) => setKb(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Maximal Response Emax (%)</label>
                                    <input type="number" step="1" value={emax} onChange={(e) => setEmax(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button onClick={calculateResponse}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Simulate
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Dose-Response Curve */}
                        {doseResponseData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Dose‑Response Curve</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={doseResponseData}
                                            margin={{ top: 20, right: 30, left: 50, bottom: 30 }} // extra space for labels
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="logConc"
                                                label={{ value: "log [A] (relative)", position: "insideBottom", offset: -5 }}
                                            // If the label still overlaps, uncomment the next lines:
                                            // angle={-20}
                                            // textAnchor="end"
                                            // height={60}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                label={{ value: "Response (%)", angle: -90, position: "insideLeft" }}
                                            />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="response" stroke="#3b82f6" strokeWidth={2} name="With antagonist" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results & Info Sidebar */}
                    <div className="space-y-6">
                        {/* Response Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Response
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                <div className="text-sm font-semibold text-blue-100 mb-2">Predicted Effect</div>
                                {response !== null ? (
                                    <>
                                        <div className="text-5xl font-bold mb-2">{response.toFixed(1)}%</div>
                                        <div className="text-xl">of Emax</div>
                                    </>
                                ) : (
                                    <div className="text-3xl font-bold text-blue-100">Enter values</div>
                                )}
                            </div>
                            {ec50Shift !== null && (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">EC₅₀ shift factor</div>
                                    <div className="text-2xl font-bold">{ec50Shift.toFixed(2)}x</div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                {antagType === 'competitive' && 'Competitive antagonist shifts curve right without affecting maximum. Higher agonist dose can overcome blockade. [citation:1][citation:6]'}
                                {antagType === 'noncompetitive' && 'Non‑competitive antagonist reduces maximum response. Increasing agonist cannot fully overcome effect.'}
                                {antagType === 'uncompetitive' && 'Uncompetitive antagonist binds only to agonist‑receptor complex, reducing both potency and efficacy. [citation:1]'}
                            </p>
                        </div>

                        {/* Schild equation */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Schild Equation</h3>
                            <p className="text-sm font-mono">log(DR - 1) = log[B] - log K<sub>B</sub></p>
                            <p className="text-xs text-gray-600 mt-2">DR = dose ratio; slope = 1 for competitive antagonism [citation:6]</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}