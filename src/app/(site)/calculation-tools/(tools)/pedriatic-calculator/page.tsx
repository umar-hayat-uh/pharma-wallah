"use client";
import { useState, useEffect } from 'react';
import { Calculator, Baby, Users, Weight, Calendar, AlertCircle, Pill, Info, BookOpen, RefreshCw, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PediatricDosingCalculator() {
    const [weight, setWeight] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [adultDose, setAdultDose] = useState<string>('');
    const [rule, setRule] = useState<'young' | 'clark' | 'fried' | 'mgkg'>('young');
    const [result, setResult] = useState<{
        pediatricDose: number;
        ruleUsed: string;
        interpretation: string;
        mgPerKg: number;
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculatePediatricDose = () => {
        const w = parseFloat(weight);
        const a = parseFloat(age);
        const adult = parseFloat(adultDose);

        if (isNaN(w) || isNaN(a) || isNaN(adult) || w <= 0 || a <= 0 || adult <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let pediatricDose = 0;
        let ruleName = '';

        switch (rule) {
            case 'young':
                // Young's Rule: (Age / (Age + 12)) × Adult Dose 
                pediatricDose = adult * (a / (a + 12));
                ruleName = "Young's Rule";
                break;
            case 'clark':
                // Clark's Rule: (Child's Weight (lb) / 150) × Adult Dose
                const weightLbs = w * 2.20462; // Convert kg to lbs
                pediatricDose = adult * (weightLbs / 150);
                ruleName = "Clark's Rule";
                break;
            case 'fried':
                // Fried's Rule: (Age (months) / 150) × Adult Dose
                const ageMonths = a * 12;
                pediatricDose = adult * (ageMonths / 150);
                ruleName = "Fried's Rule";
                break;
            case 'mgkg':
                // Weight‑based (mg/kg) dosing: dose = mg/kg × weight
                pediatricDose = adult * w;
                ruleName = "mg/kg Dosing";
                break;
        }

        const mgPerKg = pediatricDose / w;

        let interpretation = '';
        // Compare with typical adult mg/kg (assuming 70kg adult)
        const adultMgPerKg = (rule === 'mgkg') ? adult : adult / 70;
        if (mgPerKg > adultMgPerKg * 2) {
            interpretation = 'High dose – verify with mg/kg dosing';
        } else if (mgPerKg < adultMgPerKg * 0.5) {
            interpretation = 'Low dose – consider minimum effective dose';
        } else {
            interpretation = 'Appropriate dose range';
        }

        setResult({ pediatricDose, ruleUsed: ruleName, interpretation, mgPerKg });
    };

    useEffect(() => {
        if (weight && age && adultDose) calculatePediatricDose();
    }, [weight, age, adultDose, rule]);

    const reset = () => {
        setWeight('');
        setAge('');
        setAdultDose('');
        setResult(null);
    };

    const commonDrugs = [
        { name: 'Paracetamol', adultDose: '1000', weight: '20', age: '6', rule: 'young' },
        { name: 'Ibuprofen', adultDose: '400', weight: '25', age: '8', rule: 'young' },
        { name: 'Amoxicillin', adultDose: '500', weight: '15', age: '4', rule: 'young' },
        { name: 'Prednisolone', adultDose: '40', weight: '30', age: '10', rule: 'young' },
        { name: 'Diphenhydramine', adultDose: '50', weight: '18', age: '5', rule: 'young' },
    ];

    const ruleComparison = [
        { rule: "Young's", formula: 'Age/(Age+12)', example: '6yo → 0.33×adult', best: '1‑12 years' },
        { rule: "Clark's", formula: 'Weight(lb)/150', example: '20kg(44lb) → 0.29×adult', best: 'Weight‑based' },
        { rule: "Fried's", formula: 'Age(months)/150', example: '6yo(72m) → 0.48×adult', best: 'Infants <1yr' },
        { rule: "mg/kg", formula: 'mg/kg × weight', example: '15 mg/kg × 20kg = 300mg', best: 'Most accurate' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Baby className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Pediatric Dosing Calculator</h1>
                                <p className="text-blue-100 mt-2">Young's, Clark's, Fried's Rules & mg/kg dosing </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Pill className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Pediatric Dose Estimation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Patient Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Weight (kg)</label>
                                    <input type="number" step="0.1" min="1" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 20" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Age (years)</label>
                                    <input type="number" step="0.1" min="0.1" value={age} onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 6" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">
                                        {rule === 'mgkg' ? 'Dose (mg/kg)' : 'Adult dose (mg)'}
                                    </label>
                                    <input type="number" step="0.1" min="1" value={adultDose} onChange={(e) => setAdultDose(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg"
                                        placeholder={rule === 'mgkg' ? "e.g., 15" : "e.g., 500"} />
                                </div>
                            </div>

                            {/* Rule Selection */}
                            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Select Pediatric Rule</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button onClick={() => setRule('young')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${rule === 'young' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Young's
                                    </button>
                                    <button onClick={() => setRule('clark')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${rule === 'clark' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Clark's
                                    </button>
                                    <button onClick={() => setRule('fried')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${rule === 'fried' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Fried's
                                    </button>
                                    <button onClick={() => setRule('mgkg')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${rule === 'mgkg' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        mg/kg
                                    </button>
                                </div>
                            </div>

                            {/* Common Drugs */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Common Drugs (adult doses shown)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {commonDrugs.map((d, idx) => (
                                        <button key={idx} onClick={() => { setWeight(d.weight); setAge(d.age); setAdultDose(d.adultDose); setRule('young'); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{d.name}</div>
                                            <div>{d.weight}kg, {d.age}y</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculatePediatricDose}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Dose
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>
                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full group transition-all"
                            >
                                <h3 className="text-lg font-bold text-gray-800 flex items-center group-hover:text-blue-600 transition-colors">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Pediatric Dosing Rules
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showDetails && (
                                <div className="mt-6 space-y-4 text-sm text-gray-600 border-t border-gray-50 pt-4 animate-in fade-in slide-in-from-top-2">

                                    {/* Young's Rule */}
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800">Young's Rule (Ages 1–12):</p>
                                        <div className="bg-blue-50/50 p-2 rounded text-blue-800 font-mono text-xs">
                                            Dose = [Age / (Age + 12)] × Adult Dose
                                        </div>
                                    </div>

                                    {/* Clark's Rule */}
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800">Clark's Rule (Weight-based):</p>
                                        <div className="bg-green-50/50 p-2 rounded text-green-800 font-mono text-xs">
                                            Dose = [Weight(lb) / 150] × Adult Dose
                                        </div>
                                    </div>

                                    {/* Fried's Rule */}
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800">Fried's Rule (Infants):</p>
                                        <div className="bg-purple-50/50 p-2 rounded text-purple-800 font-mono text-xs">
                                            Dose = [Age(months) / 150] × Adult Dose
                                        </div>
                                    </div>

                                    {/* Clinical Note and Sources */}
                                    <div className="pt-4 border-t border-gray-50 mt-4">
                                        <p className="leading-relaxed italic text-xs text-gray-500">
                                            <span className="font-semibold">Note:</span> mg/kg dosing is the current clinical gold standard. Historical rules are primarily for reference or when modern guidelines are unavailable.
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2">Sources: Johns Hopkins ABX Guide, Pediatric Dosage Handbook.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results & Reference */}
                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Pediatric Dose</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.pediatricDose.toFixed(1)} mg</div>
                                    <div className="text-lg">{result.ruleUsed}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{result.interpretation}</p>
                                    <p className="text-sm mt-2">Dose per kg: {result.mgPerKg.toFixed(2)} mg/kg</p>
                                </div>
                            </div>
                        )}

                        {/* Rule Comparison Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Rule Comparison
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <tr><th className="py-2 px-3 text-left">Rule</th><th>Formula</th><th>Example</th><th>Best Use</th></tr>
                                    </thead>
                                    <tbody>
                                        {ruleComparison.map((r, i) => (
                                            <tr key={i} className="border-b"><td className="py-2 px-3 font-medium">{r.rule}</td><td>{r.formula}</td><td>{r.example}</td><td>{r.best}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Clinical Note */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Important</h3>
                            <p className="text-sm">These rules provide approximate doses. Always verify with official pediatric references and consider individual patient factors (organ function, disease state).</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}