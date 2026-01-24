"use client";
import { useState } from 'react';
import { Calculator, TrendingUp, Activity, AlertCircle, Users, BarChart } from 'lucide-react';

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

    const calculateGFR = () => {
        const a = parseFloat(age);
        const scr = parseFloat(serumCreatinine);

        if (isNaN(a) || isNaN(scr) || a <= 0 || scr <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // MDRD formula (simplified)
        let gfr = 175 * Math.pow(scr, -1.154) * Math.pow(a, -0.203);
        
        // Adjustments
        if (gender === 'female') {
            gfr *= 0.742;
        }
        if (race === 'black') {
            gfr *= 1.212;
        }

        let stage = '';
        let risk = '';
        let management = '';

        if (gfr >= 90) {
            stage = 'Stage 1: Normal or High';
            risk = 'Low risk';
            management = 'Monitor annually if CKD risk factors present';
        } else if (gfr >= 60) {
            stage = 'Stage 2: Mild Reduction';
            risk = 'Moderately increased risk';
            management = 'Monitor every 6-12 months';
        } else if (gfr >= 45) {
            stage = 'Stage 3a: Mild-Moderate';
            risk = 'Moderate risk';
            management = 'Monitor every 3-6 months';
        } else if (gfr >= 30) {
            stage = 'Stage 3b: Moderate-Severe';
            risk = 'High risk';
            management = 'Refer to nephrology, monitor every 3 months';
        } else if (gfr >= 15) {
            stage = 'Stage 4: Severe Reduction';
            risk = 'Very high risk';
            management = 'Prepare for renal replacement therapy';
        } else {
            stage = 'Stage 5: Kidney Failure';
            risk = 'Highest risk';
            management = 'Renal replacement therapy required';
        }

        setResult({
            gfr,
            stage,
            risk,
            management
        });
    };

    const resetCalculator = () => {
        setAge('');
        setSerumCreatinine('');
        setResult(null);
    };

    const samplePatients = [
        { age: '30', creatinine: '0.8', gender: 'male' as const, race: 'non-black' as const, label: 'Young Healthy' },
        { age: '65', creatinine: '1.2', gender: 'male' as const, race: 'non-black' as const, label: 'Elderly' },
        { age: '45', creatinine: '1.0', gender: 'female' as const, race: 'black' as const, label: 'Middle-aged' },
        { age: '75', creatinine: '1.8', gender: 'female' as const, race: 'non-black' as const, label: 'Geriatric' },
        { age: '50', creatinine: '2.5', gender: 'male' as const, race: 'black' as const, label: 'CKD' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <TrendingUp className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">GFR Calculator (MDRD)</h1>
                            <p className="text-gray-600">Calculate estimated glomerular filtration rate for chronic kidney disease staging</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            GFR Calculation
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
                                    Serum Creatinine (mg/dL)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    value={serumCreatinine}
                                    onChange={(e) => setSerumCreatinine(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 1.2"
                                />
                            </div>

                            {/* Demographics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">Gender</label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setGender('male')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${gender === 'male' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Male
                                        </button>
                                        <button
                                            onClick={() => setGender('female')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${gender === 'female' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Female (× 0.742)
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">Race</label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setRace('black')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${race === 'black' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Black/African American (× 1.212)
                                        </button>
                                        <button
                                            onClick={() => setRace('non-black')}
                                            className={`w-full p-3 rounded-lg transition-all duration-300 ${race === 'non-black' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            Non-Black
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
                                            setAge(patient.age);
                                            setSerumCreatinine(patient.creatinine);
                                            setGender(patient.gender);
                                            setRace(patient.race);
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
                                onClick={calculateGFR}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate GFR
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">GFR Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Estimated GFR</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.gfr.toFixed(1)} mL/min/1.73m²
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            MDRD Formula
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Activity className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">CKD Stage</h4>
                                        </div>
                                        <div className={`text-xl font-bold text-center px-4 py-2 rounded-lg ${
                                            result.stage.includes('Stage 1') ? 'bg-green-100 text-green-800' :
                                            result.stage.includes('Stage 2') ? 'bg-yellow-100 text-yellow-800' :
                                            result.stage.includes('Stage 3a') ? 'bg-orange-100 text-orange-800' :
                                            result.stage.includes('Stage 3b') ? 'bg-red-100 text-red-800' :
                                            result.stage.includes('Stage 4') ? 'bg-red-200 text-red-900' :
                                            'bg-red-300 text-red-900'
                                        }`}>
                                            {result.stage}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Cardiovascular Risk</h4>
                                        <p className="text-sm text-gray-700">{result.risk}</p>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Management</h4>
                                        <p className="text-sm text-gray-700">{result.management}</p>
                                    </div>

                                    {/* CKD Stage Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">CKD Stages</h4>
                                        <div className="space-y-2">
                                            {[
                                                { stage: 'Stage 1', range: '≥90', color: 'bg-green-400' },
                                                { stage: 'Stage 2', range: '60-89', color: 'bg-yellow-400' },
                                                { stage: 'Stage 3a', range: '45-59', color: 'bg-orange-400' },
                                                { stage: 'Stage 3b', range: '30-44', color: 'bg-red-400' },
                                                { stage: 'Stage 4', range: '15-29', color: 'bg-red-500' },
                                                { stage: 'Stage 5', range: '<15', color: 'bg-red-600' },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                                                    <span className="text-xs font-medium text-gray-700 w-16">{item.stage}</span>
                                                    <span className="text-xs text-gray-600 w-16">{item.range}</span>
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                                        <div className={`h-full ${item.color} rounded-full`} 
                                                            style={{ width: item.range.includes('≥') ? '100%' : 
                                                                item.range.includes('<') ? '10%' : '50%' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">MDRD Formula</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm font-mono text-blue-700 mb-2">
                                    GFR = 175 × SCr⁻¹·¹⁵⁴ × Age⁻⁰·²⁰³
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>• × 0.742 if female</p>
                                    <p>• × 1.212 if African American</p>
                                    <p>• Normalized to 1.73m² body surface area</p>
                                </div>
                            </div>
                        </div>

                        {/* Drug Dosing */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Drug Dosing by GFR</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>GFR &gt; 60</span>
                                    <span className="font-semibold text-green-600">Normal dose</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>GFR 30-60</span>
                                    <span className="font-semibold text-yellow-600">Reduce 25-50%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>GFR 15-30</span>
                                    <span className="font-semibold text-orange-600">Reduce 50-75%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>GFR &lt; 15</span>
                                    <span className="font-semibold text-red-600">Avoid renally cleared</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CKD Complications */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">CKD Complications by Stage</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">CKD Stage</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">GFR Range</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Complications</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Stage 1-2</td>
                                    <td className="py-3 px-4">≥60 mL/min</td>
                                    <td className="py-3 px-4">Hypertension, albuminuria</td>
                                    <td className="py-3 px-4">Annual SCr, urine albumin</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Stage 3</td>
                                    <td className="py-3 px-4">30-59 mL/min</td>
                                    <td className="py-3 px-4">Anemia, bone disease, CVD</td>
                                    <td className="py-3 px-4">Q6-12 month labs</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Stage 4</td>
                                    <td className="py-3 px-4">15-29 mL/min</td>
                                    <td className="py-3 px-4">Metabolic acidosis, hyperK+</td>
                                    <td className="py-3 px-4">Q3 month labs</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Stage 5</td>
                                    <td className="py-3 px-4">&lt;15 mL/min</td>
                                    <td className="py-3 px-4">Uremia, fluid overload</td>
                                    <td className="py-3 px-4">Monthly labs, prepare for RRT</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Clinical Notes */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Notes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">MDRD Limitations</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Not validated in acute kidney injury</li>
                                <li>• Less accurate at GFR &gt; 60 mL/min</li>
                                <li>• Not for use in children</li>
                                <li>• CKD-EPI formula preferred for GFR &gt; 60</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">When to Use</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• CKD diagnosis and staging</li>
                                <li>• Drug dosing adjustments</li>
                                <li>• Timing of nephrology referral</li>
                                <li>• Prognostication and risk stratification</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}