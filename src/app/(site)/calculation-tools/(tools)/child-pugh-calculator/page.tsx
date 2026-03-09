"use client";
import { useState, useEffect } from 'react';
import { Calculator, Activity, AlertCircle, Droplet, Scale, Brain, Info, BookOpen, RefreshCw } from 'lucide-react';

export default function ChildPughCalculator() {
    const [bilirubin, setBilirubin] = useState<string>('');
    const [albumin, setAlbumin] = useState<string>('');
    const [inr, setInr] = useState<string>('');
    const [ascites, setAscites] = useState<'none' | 'mild' | 'moderate'>('none');
    const [encephalopathy, setEncephalopathy] = useState<'none' | 'grade1-2' | 'grade3-4'>('none');
    const [result, setResult] = useState<{
        score: number;
        class: string;
        mortality: string;
        surgicalRisk: string;
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateScore = () => {
        const bili = parseFloat(bilirubin);
        const alb = parseFloat(albumin);
        const inrVal = parseFloat(inr);

        if (isNaN(bili) || isNaN(alb) || isNaN(inrVal) || bili <= 0 || alb <= 0 || inrVal <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let score = 0;
        // Bilirubin
        if (bili < 2) score += 1;
        else if (bili <= 3) score += 2;
        else score += 3;

        // Albumin
        if (alb > 3.5) score += 1;
        else if (alb >= 2.8) score += 2;
        else score += 3;

        // INR
        if (inrVal < 1.7) score += 1;
        else if (inrVal <= 2.2) score += 2;
        else score += 3;

        // Ascites
        if (ascites === 'none') score += 1;
        else if (ascites === 'mild') score += 2;
        else score += 3;

        // Encephalopathy
        if (encephalopathy === 'none') score += 1;
        else if (encephalopathy === 'grade1-2') score += 2;
        else score += 3;

        let childClass = '', mortality = '', surgicalRisk = '';
        if (score <= 6) { childClass = 'A'; mortality = '100% 1‑year survival'; surgicalRisk = 'Good surgical risk'; }
        else if (score <= 9) { childClass = 'B'; mortality = '80% 1‑year survival'; surgicalRisk = 'Moderate surgical risk'; }
        else { childClass = 'C'; mortality = '45% 1‑year survival'; surgicalRisk = 'Poor surgical risk'; }

        setResult({ score, class: childClass, mortality, surgicalRisk });
    };

    useEffect(() => {
        if (bilirubin && albumin && inr) calculateScore();
    }, [bilirubin, albumin, inr, ascites, encephalopathy]);

    const reset = () => {
        setBilirubin('');
        setAlbumin('');
        setInr('');
        setAscites('none');
        setEncephalopathy('none');
        setResult(null);
    };

    const samplePatients = [
        { label: 'Compensated', bili: '1.2', alb: '4.0', inr: '1.2', ascites: 'none' as const, encephalopathy: 'none' as const },
        { label: 'Decompensated', bili: '2.5', alb: '3.0', inr: '1.8', ascites: 'mild' as const, encephalopathy: 'grade1-2' as const },
        { label: 'Severe', bili: '5.0', alb: '2.5', inr: '2.5', ascites: 'moderate' as const, encephalopathy: 'grade3-4' as const },
    ];

    const scoringTable = [
        { measure: 'Bilirubin (mg/dL)', points1: '<2', points2: '2‑3', points3: '>3' },
        { measure: 'Albumin (g/dL)', points1: '>3.5', points2: '2.8‑3.5', points3: '<2.8' },
        { measure: 'INR', points1: '<1.7', points2: '1.7‑2.2', points3: '>2.2' },
        { measure: 'Ascites', points1: 'None', points2: 'Mild', points3: 'Moderate' },
        { measure: 'Encephalopathy', points1: 'None', points2: 'Grade 1‑2', points3: 'Grade 3‑4' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Child‑Pugh Score Calculator</h1>
                                <p className="text-blue-100 mt-2">Assess severity of liver disease </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Brain className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Hepatic Function</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Bilirubin (mg/dL)</label>
                                    <input type="number" step="0.1" min="0.1" value={bilirubin} onChange={(e) => setBilirubin(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 1.2" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Albumin (g/dL)</label>
                                    <input type="number" step="0.1" min="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 3.5" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">INR</label>
                                    <input type="number" step="0.1" min="0.1" value={inr} onChange={(e) => setInr(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" placeholder="e.g., 1.2" />
                                </div>
                            </div>

                            {/* Clinical scores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Ascites</h4>
                                    <div className="space-y-2">
                                        <button onClick={() => setAscites('none')}
                                            className={`w-full py-2 rounded-lg ${ascites === 'none' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>None</button>
                                        <button onClick={() => setAscites('mild')}
                                            className={`w-full py-2 rounded-lg ${ascites === 'mild' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Mild</button>
                                        <button onClick={() => setAscites('moderate')}
                                            className={`w-full py-2 rounded-lg ${ascites === 'moderate' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Moderate/Severe</button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Encephalopathy</h4>
                                    <div className="space-y-2">
                                        <button onClick={() => setEncephalopathy('none')}
                                            className={`w-full py-2 rounded-lg ${encephalopathy === 'none' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>None</button>
                                        <button onClick={() => setEncephalopathy('grade1-2')}
                                            className={`w-full py-2 rounded-lg ${encephalopathy === 'grade1-2' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Grade 1‑2</button>
                                        <button onClick={() => setEncephalopathy('grade3-4')}
                                            className={`w-full py-2 rounded-lg ${encephalopathy === 'grade3-4' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>Grade 3‑4</button>
                                    </div>
                                </div>
                            </div>

                            {/* Example patients */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Example Patients</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => { setBilirubin(p.bili); setAlbumin(p.alb); setInr(p.inr); setAscites(p.ascites); setEncephalopathy(p.encephalopathy); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.label}</div>
                                            <div>Bil {p.bili}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateScore}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Score
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Child‑Pugh Score
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p>Used to assess prognosis in chronic liver disease and cirrhosis.</p>
                                    <p>Class A (5‑6): good hepatic function. Class B (7‑9): moderate compromise. Class C (10‑15): severe dysfunction.</p>
                                    <p className="text-xs italic">Source: Pugh RN, et al. Br J Surg 1973;60:646‑9.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Child‑Pugh Score</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.score} points</div>
                                    <div className={`text-2xl font-bold ${result.class === 'A' ? 'text-green-300' : result.class === 'B' ? 'text-yellow-300' : 'text-red-300'}`}>Class {result.class}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{result.mortality}</p>
                                    <p className="text-sm mt-2">{result.surgicalRisk}</p>
                                </div>
                            </div>
                        )}

                        {/* Scoring table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Scoring Criteria
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <tr><th></th><th>1 point</th><th>2 points</th><th>3 points</th></tr>
                                    </thead>
                                    <tbody>
                                        {scoringTable.map((row, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-2 px-3 font-medium">{row.measure}</td>
                                                <td className="py-2 px-3">{row.points1}</td>
                                                <td className="py-2 px-3">{row.points2}</td>
                                                <td className="py-2 px-3">{row.points3}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Drug dosing note */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Dosing in Liver Disease</h3>
                            <p className="text-sm">Reduce hepatically cleared drugs in Class B and avoid hepatotoxins in Class C.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}