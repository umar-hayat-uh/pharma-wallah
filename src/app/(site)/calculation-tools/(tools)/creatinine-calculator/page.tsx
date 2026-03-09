"use client";
import { useState, useEffect } from 'react';
import { Filter, Calculator, Activity, AlertCircle, Users, Droplet, Scale, Info, BookOpen, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CreatinineClearanceCalculator() {
    const [age, setAge] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [serumCreatinine, setSerumCreatinine] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [useIdealWeight, setUseIdealWeight] = useState<boolean>(false);
    const [result, setResult] = useState<{
        clearance: number;
        category: string;
        dosingAdjustment: string;
        gfrStage: string;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateIdealWeight = (heightCm: number, gender: 'male' | 'female'): number => {
        // Devine formula
        if (gender === 'male') return 50 + 0.91 * (heightCm - 152.4);
        return 45.5 + 0.91 * (heightCm - 152.4);
    };

    const calculateClearance = () => {
        const a = parseFloat(age);
        const w = parseFloat(weight);
        const scr = parseFloat(serumCreatinine);

        if (isNaN(a) || isNaN(w) || isNaN(scr) || a <= 0 || w <= 0 || scr <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let adjustedWeight = w;
        if (useIdealWeight) adjustedWeight = calculateIdealWeight(170, gender); // assume height 170 cm

        // Cockcroft-Gault
        let clearance = ((140 - a) * adjustedWeight) / (72 * scr);
        if (gender === 'female') clearance *= 0.85;

        let category = '', dosingAdjustment = '', gfrStage = '';
        if (clearance >= 90) { category = 'Normal'; dosingAdjustment = 'Standard dosing'; gfrStage = 'Stage 1'; }
        else if (clearance >= 60) { category = 'Mild impairment'; dosingAdjustment = 'Monitor renal function'; gfrStage = 'Stage 2'; }
        else if (clearance >= 30) { category = 'Moderate impairment'; dosingAdjustment = 'Adjust renally cleared drugs'; gfrStage = 'Stage 3'; }
        else if (clearance >= 15) { category = 'Severe impairment'; dosingAdjustment = 'Significant dose adjustments'; gfrStage = 'Stage 4'; }
        else { category = 'Renal failure'; dosingAdjustment = 'Avoid renally cleared drugs'; gfrStage = 'Stage 5'; }

        setResult({ clearance, category, dosingAdjustment, gfrStage });

        // CrCl vs age curve for given weight and scr
        const data = [];
        for (let yr = 20; yr <= 80; yr += 5) {
            let cl = ((140 - yr) * adjustedWeight) / (72 * scr);
            if (gender === 'female') cl *= 0.85;
            data.push({ age: yr, clearance: cl });
        }
        setChartData(data);
    };

    useEffect(() => {
        if (age && weight && serumCreatinine) calculateClearance();
    }, [age, weight, serumCreatinine, gender, useIdealWeight]);

    const reset = () => {
        setAge('');
        setWeight('');
        setSerumCreatinine('');
        setGender('male');
        setUseIdealWeight(false);
        setResult(null);
        setChartData([]);
    };

    const samplePatients = [
        { label: 'Young adult', age: '30', weight: '70', scr: '0.8', gender: 'male' as const },
        { label: 'Elderly', age: '65', weight: '80', scr: '1.2', gender: 'male' as const },
        { label: 'Middle-aged F', age: '45', weight: '60', scr: '1.0', gender: 'female' as const },
        { label: 'Geriatric', age: '75', weight: '65', scr: '1.5', gender: 'female' as const },
        { label: 'Obese', age: '50', weight: '100', scr: '1.8', gender: 'male' as const },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Filter className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Creatinine Clearance Calculator</h1>
                                <p className="text-blue-100 mt-2">Cockcroft‑Gault: CrCl = ((140‑age)×weight)/(72×SCr) </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Droplet className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Renal Dosing</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Patient Data</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Age (years)</label>
                                    <input type="number" step="1" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 65" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Weight (kg)</label>
                                    <input type="number" step="0.1" min="1" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 70" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Serum Creatinine (mg/dL)</label>
                                    <input type="number" step="0.01" min="0.1" value={serumCreatinine} onChange={(e) => setSerumCreatinine(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 1.2" />
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                    <label className="text-sm font-semibold mb-2">Gender</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setGender('male')}
                                            className={`py-2 rounded-lg text-sm ${gender === 'male' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border border-gray-300'}`}>Male</button>
                                        <button onClick={() => setGender('female')}
                                            className={`py-2 rounded-lg text-sm ${gender === 'female' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border border-gray-300'}`}>Female</button>
                                    </div>
                                </div>
                            </div>

                            {/* Ideal weight toggle */}
                            <div className="mt-4 flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div>
                                    <span className="font-semibold text-gray-800">Use ideal body weight</span>
                                    <p className="text-xs text-gray-600">Recommended for BMI ≥ 30</p>
                                </div>
                                <button onClick={() => setUseIdealWeight(!useIdealWeight)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${useIdealWeight ? 'bg-green-600' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useIdealWeight ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Example patients */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Example Patients</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => { setAge(p.age); setWeight(p.weight); setSerumCreatinine(p.scr); setGender(p.gender); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.label}</div>
                                            <div>SCr {p.scr}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateClearance}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Clearance
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* CrCl vs Age chart */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Creatinine Clearance (CrCl) vs. Age</h3>
                                {/* Increased height to h-64 for better layout */}
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 10, right: 30, left: 45, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                                            <XAxis
                                                dataKey="age"
                                                fontSize={12}
                                                tickMargin={8}
                                                label={{
                                                    value: "Age (years)",
                                                    position: "insideBottom",
                                                    offset: -25,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    fill: '#4b5563'
                                                }}
                                            />

                                            <YAxis
                                                fontSize={12}
                                                width={50} // Reserves space for 3-digit numbers
                                                label={{
                                                    value: "CrCl (mL/min)",
                                                    angle: -90,
                                                    position: "insideLeft",
                                                    style: { textAnchor: 'middle' },
                                                    offset: -30, // Moves label away from numbers
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    fill: '#4b5563'
                                                }}
                                            />

                                            <Tooltip
                                                formatter={(value) => typeof value === 'number' ? [`${value.toFixed(1)} mL/min`, "CrCl"] : ["N/A", "CrCl"]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="clearance"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 italic text-center">Note: This trend assumes constant serum creatinine and body weight.</p>
                            </div>
                        )}

                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Cockcroft‑Gault
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p>Formula: CrCl = ((140‑age) × weight) / (72 × SCr) (×0.85 for women).</p>
                                    <p>Limitations: Not accurate in rapidly changing renal function, extremes of weight, or muscle wasting.</p>
                                    <p>Use ideal body weight in obesity.</p>
                                    <p className="text-xs italic">Source: Cockcroft DW, Gault MH. Nephron 1976;16:31‑41.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Creatinine Clearance</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.clearance.toFixed(1)} mL/min</div>
                                    <div className="text-lg">{result.category}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">GFR Stage: {result.gfrStage}</p>
                                    <p className="text-sm mt-2">{result.dosingAdjustment}</p>
                                </div>
                            </div>
                        )}

                        {/* Dosing guidelines */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Dosing Adjustment by CrCl
                            </h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <tr><th>CrCl (mL/min)</th><th>Adjustment</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>{'>'}50</td><td>Normal dose</td></tr>
                                    <tr className="bg-gray-50"><td>30‑50</td><td>Reduce 25‑50%</td></tr>
                                    <tr><td>10‑30</td><td>Reduce 50‑75%</td></tr>
                                    <tr className="bg-gray-50"><td>{'<'}10</td><td>Avoid or minimal</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Renally cleared drugs */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Common Renally Cleared Drugs</h3>
                            <p className="text-xs">Gentamicin, Vancomycin, Piperacillin, Metformin, Digoxin</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}