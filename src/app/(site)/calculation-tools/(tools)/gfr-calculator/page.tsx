"use client";
import { useState } from 'react';
import { Calculator, TrendingUp, Activity, AlertCircle, Users, BarChart, Info, BookOpen, RefreshCw } from 'lucide-react';

export default function GFRCalculator() {
    const [age, setAge] = useState<string>('');
    const [serumCreatinine, setSerumCreatinine] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [race, setRace] = useState<'black' | 'non-black'>('non-black');
    const [result, setResult] = useState<{
        gfr: number;
        stage: string;
        risk: string;
        management: string;
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const a = parseFloat(age);
        const scr = parseFloat(serumCreatinine);
        if (isNaN(a) || isNaN(scr) || a <= 0 || scr <= 0) {
            alert('Please enter valid numbers');
            return;
        }

        let gfr = 175 * Math.pow(scr, -1.154) * Math.pow(a, -0.203);
        if (gender === 'female') gfr *= 0.742;
        if (race === 'black') gfr *= 1.212;

        let stage = '', risk = '', management = '';
        if (gfr >= 90) {
            stage = 'Stage 1: Normal';
            risk = 'Low risk';
            management = 'Monitor annually if CKD risk factors present.';
        } else if (gfr >= 60) {
            stage = 'Stage 2: Mild Reduction';
            risk = 'Moderate risk';
            management = 'Monitor every 6‑12 months.';
        } else if (gfr >= 45) {
            stage = 'Stage 3a: Mild‑Moderate';
            risk = 'High risk';
            management = 'Monitor every 3‑6 months.';
        } else if (gfr >= 30) {
            stage = 'Stage 3b: Moderate‑Severe';
            risk = 'High risk';
            management = 'Refer to nephrology, monitor every 3 months.';
        } else if (gfr >= 15) {
            stage = 'Stage 4: Severe Reduction';
            risk = 'Very high risk';
            management = 'Prepare for renal replacement therapy.';
        } else {
            stage = 'Stage 5: Kidney Failure';
            risk = 'Highest risk';
            management = 'Renal replacement therapy required.';
        }

        setResult({ gfr, stage, risk, management });
    };

    const reset = () => {
        setAge('');
        setSerumCreatinine('');
        setGender('male');
        setRace('non-black');
        setResult(null);
    };

    const samplePatients = [
        { label: 'Young Healthy', age: '30', scr: '0.8', gender: 'male', race: 'non-black' },
        { label: 'Elderly', age: '65', scr: '1.2', gender: 'male', race: 'non-black' },
        { label: 'Middle‑aged F', age: '45', scr: '1.0', gender: 'female', race: 'black' },
        { label: 'Geriatric', age: '75', scr: '1.8', gender: 'female', race: 'non-black' },
        { label: 'CKD', age: '50', scr: '2.5', gender: 'male', race: 'black' },
    ];

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setAge(p.age);
        setSerumCreatinine(p.scr);
        setGender(p.gender as 'male' | 'female');
        setRace(p.race as 'black' | 'non-black');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">GFR Calculator (MDRD)</h1>
                                <p className="text-blue-100 mt-2">eGFR = 175 × SCr⁻¹·¹⁵⁴ × Age⁻⁰·²⁰³ </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">CKD Staging</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Input Parameters</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold">Age (years)</label>
                                    <input type="number" step="1" value={age} onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg mt-2" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold">Serum Creatinine (mg/dL)</label>
                                    <input type="number" step="0.01" value={serumCreatinine} onChange={(e) => setSerumCreatinine(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg mt-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold mb-2">Gender</label>
                                    <button onClick={() => setGender('male')}
                                        className={`w-full py-2 rounded-lg ${gender === 'male' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Male</button>
                                    <button onClick={() => setGender('female')}
                                        className={`w-full py-2 rounded-lg mt-2 ${gender === 'female' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Female</button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold mb-2">Race</label>
                                    <button onClick={() => setRace('black')}
                                        className={`w-full py-2 rounded-lg ${race === 'black' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Black</button>
                                    <button onClick={() => setRace('non-black')}
                                        className={`w-full py-2 rounded-lg mt-2 ${race === 'non-black' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Non‑Black</button>
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.label}</div>
                                            <div>SCr {p.scr}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate GFR
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About MDRD
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p>Not validated in AKI, children, or extremes of muscle mass.</p>
                                    <p>CKD‑EPI preferred for GFR {'>'}60 mL/min.</p>
                                    <p>Source: Levey AS et al., Ann Intern Med 2006.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">eGFR</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.gfr.toFixed(1)}</div>
                                    <div className="text-sm">mL/min/1.73m²</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="font-semibold">{result.stage}</p>
                                    <p className="text-sm mt-2">{result.risk}</p>
                                    <p className="text-sm mt-2">{result.management}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4">CKD Stages</h3>
                            <div className="space-y-1 text-sm">
                                <div>Stage 1: ≥90</div>
                                <div>Stage 2: 60‑89</div>
                                <div>Stage 3a: 45‑59</div>
                                <div>Stage 3b: 30‑44</div>
                                <div>Stage 4: 15‑29</div>
                                <div>Stage 5: {'<'}15</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Drug Dosing</h3>
                            <p className="text-sm">GFR {'>'}60: normal; 30‑60: reduce; {'<'}30: avoid many.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}