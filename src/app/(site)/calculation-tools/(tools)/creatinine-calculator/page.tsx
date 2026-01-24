"use client";
import { useState } from 'react';
import { Calculator, Filter, Activity, AlertCircle, Users, Droplet } from 'lucide-react';

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

    const calculateIdealWeight = (heightCm: number, gender: 'male' | 'female') => {
        // Simple ideal weight calculation
        if (gender === 'male') {
            return 50 + 0.91 * (heightCm - 152.4);
        } else {
            return 45.5 + 0.91 * (heightCm - 152.4);
        }
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
        if (useIdealWeight) {
            // For simplicity, using 170cm height for ideal weight calculation
            adjustedWeight = calculateIdealWeight(170, gender);
        }

        // Cockcroft-Gault formula
        let clearance = ((140 - a) * adjustedWeight) / (72 * scr);
        if (gender === 'female') {
            clearance *= 0.85;
        }

        let category = '';
        let dosingAdjustment = '';
        let gfrStage = '';

        if (clearance >= 90) {
            category = 'Normal Renal Function';
            dosingAdjustment = 'Standard dosing';
            gfrStage = 'Stage 1';
        } else if (clearance >= 60) {
            category = 'Mild Renal Impairment';
            dosingAdjustment = 'Monitor renal function';
            gfrStage = 'Stage 2';
        } else if (clearance >= 30) {
            category = 'Moderate Renal Impairment';
            dosingAdjustment = 'Adjust doses of renally cleared drugs';
            gfrStage = 'Stage 3';
        } else if (clearance >= 15) {
            category = 'Severe Renal Impairment';
            dosingAdjustment = 'Significant dose adjustments required';
            gfrStage = 'Stage 4';
        } else {
            category = 'Renal Failure';
            dosingAdjustment = 'Avoid or drastically reduce renally cleared drugs';
            gfrStage = 'Stage 5';
        }

        setResult({
            clearance,
            category,
            dosingAdjustment,
            gfrStage
        });
    };

    const resetCalculator = () => {
        setAge('');
        setWeight('');
        setSerumCreatinine('');
        setResult(null);
    };

    const samplePatients = [
        { age: '30', weight: '70', creatinine: '0.8', gender: 'male' as const, label: 'Young Adult' },
        { age: '65', weight: '80', creatinine: '1.2', gender: 'male' as const, label: 'Elderly' },
        { age: '45', weight: '60', creatinine: '1.0', gender: 'female' as const, label: 'Middle-aged' },
        { age: '75', weight: '65', creatinine: '1.5', gender: 'female' as const, label: 'Geriatric' },
        { age: '50', weight: '100', creatinine: '1.8', gender: 'male' as const, label: 'Obese' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Filter className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Creatinine Clearance Calculator</h1>
                            <p className="text-gray-600">Calculate creatinine clearance using Cockcroft-Gault formula for renal dosing adjustments</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Creatinine Clearance Calculation
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Age (years)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="120"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 65"
                                />
                            </div>

                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 70"
                                />
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-purple-800 mb-3">
                                    Serum Creatinine (mg/dL)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={serumCreatinine}
                                    onChange={(e) => setSerumCreatinine(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., 1.2"
                                />
                            </div>

                            {/* Gender Selection */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Gender</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setGender('male')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${gender === 'male' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Male
                                    </button>
                                    <button
                                        onClick={() => setGender('female')}
                                        className={`p-4 rounded-lg transition-all duration-300 ${gender === 'female' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Female (× 0.85)
                                    </button>
                                </div>
                            </div>

                            {/* Ideal Weight Toggle */}
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div>
                                    <label className="font-semibold text-gray-800">Use Ideal Body Weight</label>
                                    <p className="text-sm text-gray-600">Recommended for obese patients (BMI ≥ 30)</p>
                                </div>
                                <button
                                    onClick={() => setUseIdealWeight(!useIdealWeight)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${useIdealWeight ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${useIdealWeight ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
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
                                            setAge(patient.age);
                                            setWeight(patient.weight);
                                            setSerumCreatinine(patient.creatinine);
                                            setGender(patient.gender);
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{patient.label}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Age: {patient.age}, SCr: {patient.creatinine}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateClearance}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Clearance
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Creatinine Clearance Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Creatinine Clearance</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.clearance.toFixed(1)} mL/min
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            {result.category}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Activity className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">GFR Stage</h4>
                                        </div>
                                        <div className={`text-xl font-bold text-center px-4 py-2 rounded-lg ${
                                            result.gfrStage === 'Stage 1' ? 'bg-green-100 text-green-800' :
                                            result.gfrStage === 'Stage 2' ? 'bg-yellow-100 text-yellow-800' :
                                            result.gfrStage === 'Stage 3' ? 'bg-orange-100 text-orange-800' :
                                            result.gfrStage === 'Stage 4' ? 'bg-red-100 text-red-800' :
                                            'bg-red-200 text-red-900'
                                        }`}>
                                            {result.gfrStage}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Dosing Recommendation</h4>
                                        <p className="text-sm text-gray-700">{result.dosingAdjustment}</p>
                                    </div>

                                    {/* Renal Function Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Renal Function Scale</h4>
                                        <div className="h-6 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative">
                                            <div className="absolute top-0 bottom-0 w-1 bg-black" 
                                                style={{ left: `${Math.min((result.clearance / 120) * 100, 100)}%` }}>
                                                <div className="absolute -top-6 -ml-6 text-xs font-semibold">
                                                    {result.clearance.toFixed(0)} mL/min
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                                            <span>0</span>
                                            <span>60</span>
                                            <span>120</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Failure</span>
                                            <span>Normal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Cockcroft-Gault Formula</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-lg font-mono text-center text-blue-700 mb-2">
                                    CrCl = [(140 - Age) × Weight] / (72 × SCr)
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>• Multiply by 0.85 for females</p>
                                    <p>• Use ideal body weight if obese</p>
                                    <p>• SCr in mg/dL</p>
                                </div>
                            </div>
                        </div>

                        {/* Dosing Guidelines */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Dosing Adjustments</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>CrCl &gt; 50 mL/min</span>
                                    <span className="font-semibold text-green-600">Normal dose</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>30-50 mL/min</span>
                                    <span className="font-semibold text-yellow-600">Reduce 25-50%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>10-30 mL/min</span>
                                    <span className="font-semibold text-orange-600">Reduce 50-75%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&lt; 10 mL/min</span>
                                    <span className="font-semibold text-red-600">Avoid or minimal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Renally Cleared Drugs */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Common Renally Cleared Drugs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug Class</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Examples</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Adjustment Required</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Aminoglycosides</td>
                                    <td className="py-3 px-4">Gentamicin, Tobramycin</td>
                                    <td className="py-3 px-4">Dose & interval adjustment</td>
                                    <td className="py-3 px-4">Trough levels essential</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Vancomycin</td>
                                    <td className="py-3 px-4">Vancomycin</td>
                                    <td className="py-3 px-4">Dose adjustment</td>
                                    <td className="py-3 px-4">Trough levels</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Penicillins</td>
                                    <td className="py-3 px-4">Penicillin, Ampicillin</td>
                                    <td className="py-3 px-4">CrCl &lt; 30 mL/min</td>
                                    <td className="py-3 px-4">Renal function</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">ACE Inhibitors</td>
                                    <td className="py-3 px-4">Lisinopril, Enalapril</td>
                                    <td className="py-3 px-4">CrCl &lt; 30 mL/min</td>
                                    <td className="py-3 px-4">K+, SCr, BP</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Metformin</td>
                                    <td className="py-3 px-4">Metformin</td>
                                    <td className="py-3 px-4">Avoid if CrCl &lt; 30</td>
                                    <td className="py-3 px-4">SCr, lactate</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Clinical Considerations */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Considerations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Limitations</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Not accurate in rapidly changing renal function</li>
                                <li>• Less accurate in elderly and cachectic patients</li>
                                <li>• Overestimates in patients with low muscle mass</li>
                                <li>• Use ideal body weight in obese patients</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">When to Use</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• For drug dosing adjustments</li>
                                <li>• Assessing renal function for contrast use</li>
                                <li>• Pre-operative assessment</li>
                                <li>• Monitoring chronic kidney disease</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}