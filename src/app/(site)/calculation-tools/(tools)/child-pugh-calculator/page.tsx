"use client";
import { useState } from 'react';
import { Calculator, Activity, AlertCircle, Droplet, Scale, Brain } from 'lucide-react';

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

    const calculateScore = () => {
        const bili = parseFloat(bilirubin);
        const alb = parseFloat(albumin);
        const inrVal = parseFloat(inr);

        if (isNaN(bili) || isNaN(alb) || isNaN(inrVal) || bili <= 0 || alb <= 0 || inrVal <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let score = 0;

        // Bilirubin scoring
        if (bili < 2) score += 1;
        else if (bili >= 2 && bili <= 3) score += 2;
        else score += 3;

        // Albumin scoring
        if (alb > 3.5) score += 1;
        else if (alb >= 2.8 && alb <= 3.5) score += 2;
        else score += 3;

        // INR scoring
        if (inrVal < 1.7) score += 1;
        else if (inrVal >= 1.7 && inrVal <= 2.2) score += 2;
        else score += 3;

        // Ascites scoring
        if (ascites === 'none') score += 1;
        else if (ascites === 'mild') score += 2;
        else score += 3;

        // Encephalopathy scoring
        if (encephalopathy === 'none') score += 1;
        else if (encephalopathy === 'grade1-2') score += 2;
        else score += 3;

        let childClass = '';
        let mortality = '';
        let surgicalRisk = '';

        if (score <= 6) {
            childClass = 'A';
            mortality = 'Low (100% 1-year survival)';
            surgicalRisk = 'Good surgical risk';
        } else if (score <= 9) {
            childClass = 'B';
            mortality = 'Moderate (80% 1-year survival)';
            surgicalRisk = 'Moderate surgical risk';
        } else {
            childClass = 'C';
            mortality = 'High (45% 1-year survival)';
            surgicalRisk = 'Poor surgical risk';
        }

        setResult({
            score,
            class: childClass,
            mortality,
            surgicalRisk
        });
    };

    const resetCalculator = () => {
        setBilirubin('');
        setAlbumin('');
        setInr('');
        setAscites('none');
        setEncephalopathy('none');
        setResult(null);
    };

    const samplePatients = [
        { bili: '1.2', alb: '4.0', inr: '1.2', ascites: 'none' as const, encephalopathy: 'none' as const, label: 'Compensated' },
        { bili: '2.5', alb: '3.0', inr: '1.8', ascites: 'mild' as const, encephalopathy: 'grade1-2' as const, label: 'Decompensated' },
        { bili: '5.0', alb: '2.5', inr: '2.5', ascites: 'moderate' as const, encephalopathy: 'grade3-4' as const, label: 'Severe' },
        { bili: '1.8', alb: '3.2', inr: '1.5', ascites: 'none' as const, encephalopathy: 'none' as const, label: 'Mild Cirrhosis' },
        { bili: '3.5', alb: '2.7', inr: '2.0', ascites: 'mild' as const, encephalopathy: 'grade1-2' as const, label: 'Moderate' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <AlertCircle className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Child-Pugh Score Calculator</h1>
                            <p className="text-gray-600">Assess severity of liver disease and predict surgical risk</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Child-Pugh Calculation
                        </h2>

                        <div className="space-y-6">
                            {/* Laboratory Parameters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Bilirubin (mg/dL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={bilirubin}
                                        onChange={(e) => setBilirubin(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 1.2"
                                    />
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Albumin (g/dL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={albumin}
                                        onChange={(e) => setAlbumin(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 3.5"
                                    />
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-purple-800 mb-3">
                                        INR
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.1"
                                        value={inr}
                                        onChange={(e) => setInr(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., 1.2"
                                    />
                                </div>
                            </div>

                            {/* Clinical Parameters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Ascites
                                    </label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setAscites('none')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${ascites === 'none' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            None
                                        </button>
                                        <button
                                            onClick={() => setAscites('mild')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${ascites === 'mild' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Mild
                                        </button>
                                        <button
                                            onClick={() => setAscites('moderate')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${ascites === 'moderate' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Moderate/Severe
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Hepatic Encephalopathy
                                    </label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setEncephalopathy('none')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${encephalopathy === 'none' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            None
                                        </button>
                                        <button
                                            onClick={() => setEncephalopathy('grade1-2')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${encephalopathy === 'grade1-2' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Grade 1-2
                                        </button>
                                        <button
                                            onClick={() => setEncephalopathy('grade3-4')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${encephalopathy === 'grade3-4' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Grade 3-4
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sample Patients */}
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Patients</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {samplePatients.map((patient, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setBilirubin(patient.bili);
                                            setAlbumin(patient.alb);
                                            setInr(patient.inr);
                                            setAscites(patient.ascites);
                                            setEncephalopathy(patient.encephalopathy);
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{patient.label}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Bili: {patient.bili}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateScore}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Score
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Child-Pugh Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Total Score</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.score} points
                                        </div>
                                        <div className={`text-xl font-bold mt-2 px-4 py-2 rounded-full ${
                                            result.class === 'A' ? 'bg-green-100 text-green-800' :
                                            result.class === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            Class {result.class}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">1-Year Survival</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.mortality}</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Surgical Risk</h4>
                                        <p className="text-sm text-gray-700">{result.surgicalRisk}</p>
                                    </div>

                                    {/* Score Breakdown */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Score Components</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Bilirubin: {bilirubin} mg/dL</span>
                                                <span className="font-semibold">{calculateBilirubinScore(parseFloat(bilirubin))} pts</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Albumin: {albumin} g/dL</span>
                                                <span className="font-semibold">{calculateAlbuminScore(parseFloat(albumin))} pts</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>INR: {inr}</span>
                                                <span className="font-semibold">{calculateINRScore(parseFloat(inr))} pts</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ascites: {ascites}</span>
                                                <span className="font-semibold">{calculateAscitesScore(ascites)} pts</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Encephalopathy: {encephalopathy}</span>
                                                <span className="font-semibold">{calculateEncephalopathyScore(encephalopathy)} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scoring Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Child-Pugh Scoring</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-blue-700">Bilirubin (mg/dL)</h4>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        <div className="text-center p-2 bg-green-100 rounded">＜2 (1)</div>
                                        <div className="text-center p-2 bg-yellow-100 rounded">2-3 (2)</div>
                                        <div className="text-center p-2 bg-red-100 rounded">＞3 (3)</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Albumin (g/dL)</h4>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        <div className="text-center p-2 bg-green-100 rounded">＞3.5 (1)</div>
                                        <div className="text-center p-2 bg-yellow-100 rounded">2.8-3.5 (2)</div>
                                        <div className="text-center p-2 bg-red-100 rounded">＜2.8 (3)</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-700">INR</h4>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        <div className="text-center p-2 bg-green-100 rounded">＜1.7 (1)</div>
                                        <div className="text-center p-2 bg-yellow-100 rounded">1.7-2.2 (2)</div>
                                        <div className="text-center p-2 bg-red-100 rounded">＞2.2 (3)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Interpretation</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Class A (5-6)</span>
                                    <span className="font-semibold text-green-600">Good prognosis</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Class B (7-9)</span>
                                    <span className="font-semibold text-yellow-600">Moderate prognosis</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Class C (10-15)</span>
                                    <span className="font-semibold text-red-600">Poor prognosis</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Applications */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Applications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Liver Transplant</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Class C: High priority for transplant</li>
                                <li>• Class B: Moderate priority</li>
                                <li>• Class A: Low priority</li>
                                <li>• MELD score now more commonly used</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Drug Dosing</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Class A: Normal dosing</li>
                                <li>• Class B: Reduce hepatically cleared drugs</li>
                                <li>• Class C: Avoid hepatotoxic drugs</li>
                                <li>• Monitor drug levels when possible</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Surgical Risk</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Class A: Acceptable risk</li>
                                <li>• Class B: Increased risk</li>
                                <li>• Class C: High mortality risk</li>
                                <li>• Consider non-surgical alternatives</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Drug Considerations */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Drug Dosing in Liver Disease</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug Class</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Child-Pugh A</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Child-Pugh B</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Child-Pugh C</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Opioids</td>
                                    <td className="py-3 px-4">Standard dose</td>
                                    <td className="py-3 px-4">Reduce 50%</td>
                                    <td className="py-3 px-4">Avoid or reduce 75%</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Benzodiazepines</td>
                                    <td className="py-3 px-4">Standard dose</td>
                                    <td className="py-3 px-4">Reduce 50%</td>
                                    <td className="py-3 px-4">Avoid</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Statins</td>
                                    <td className="py-3 px-4">Standard dose</td>
                                    <td className="py-3 px-4">Reduce dose</td>
                                    <td className="py-3 px-4">Avoid</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">NSAIDs</td>
                                    <td className="py-3 px-4">Caution</td>
                                    <td className="py-3 px-4">Avoid</td>
                                    <td className="py-3 px-4">Contraindicated</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Helper functions for scoring
function calculateBilirubinScore(bili: number): number {
    if (bili < 2) return 1;
    if (bili >= 2 && bili <= 3) return 2;
    return 3;
}

function calculateAlbuminScore(alb: number): number {
    if (alb > 3.5) return 1;
    if (alb >= 2.8 && alb <= 3.5) return 2;
    return 3;
}

function calculateINRScore(inr: number): number {
    if (inr < 1.7) return 1;
    if (inr >= 1.7 && inr <= 2.2) return 2;
    return 3;
}

function calculateAscitesScore(ascites: string): number {
    if (ascites === 'none') return 1;
    if (ascites === 'mild') return 2;
    return 3;
}

function calculateEncephalopathyScore(encephalopathy: string): number {
    if (encephalopathy === 'none') return 1;
    if (encephalopathy === 'grade1-2') return 2;
    return 3;
}