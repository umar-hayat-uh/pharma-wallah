"use client";
import { useState } from 'react';
import { Calculator, Scale, Activity, AlertCircle, Heart, TrendingUp, Users } from 'lucide-react';

export default function BMICalculator() {
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [result, setResult] = useState<{
        bmi: number;
        category: string;
        risk: string;
        idealWeight: { min: number; max: number };
    } | null>(null);

    const calculateBMI = () => {
        const h = parseFloat(height) / 100; // convert cm to meters
        const w = parseFloat(weight);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            alert('Please enter valid positive numbers for height and weight');
            return;
        }

        const bmi = w / (h * h);

        let category = '';
        let risk = '';
        let idealMin = 18.5 * h * h;
        let idealMax = 24.9 * h * h;

        if (bmi < 16) {
            category = 'Severe Thinness';
            risk = 'Very high health risk';
        } else if (bmi < 17) {
            category = 'Moderate Thinness';
            risk = 'High health risk';
        } else if (bmi < 18.5) {
            category = 'Mild Thinness';
            risk = 'Moderate health risk';
        } else if (bmi < 25) {
            category = 'Normal Weight';
            risk = 'Low health risk';
        } else if (bmi < 30) {
            category = 'Overweight';
            risk = 'Moderate health risk';
        } else if (bmi < 35) {
            category = 'Obese Class I';
            risk = 'High health risk';
        } else if (bmi < 40) {
            category = 'Obese Class II';
            risk = 'Very high health risk';
        } else {
            category = 'Obese Class III';
            risk = 'Extremely high health risk';
        }

        setResult({
            bmi,
            category,
            risk,
            idealWeight: {
                min: parseFloat(idealMin.toFixed(1)),
                max: parseFloat(idealMax.toFixed(1))
            }
        });
    };

    const resetCalculator = () => {
        setHeight('');
        setWeight('');
        setResult(null);
    };

    const samplePatients = [
        { name: 'Underweight', height: '170', weight: '50' },
        { name: 'Normal', height: '170', weight: '65' },
        { name: 'Overweight', height: '170', weight: '80' },
        { name: 'Obese I', height: '170', weight: '95' },
        { name: 'Obese II', height: '170', weight: '110' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Scale className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Body Mass Index (BMI) Calculator</h1>
                            <p className="text-gray-600">Calculate BMI for weight classification and cardiovascular risk assessment</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            BMI Calculation
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 175"
                                />
                                <p className="text-sm text-gray-600 mt-2">Patient height in centimeters</p>
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
                                <p className="text-sm text-gray-600 mt-2">Patient weight in kilograms</p>
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
                                            setHeight(patient.height);
                                            setWeight(patient.weight);
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{patient.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {patient.height}cm / {patient.weight}kg
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateBMI}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate BMI
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">BMI Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Body Mass Index</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.bmi.toFixed(1)} kg/m²
                                        </div>
                                        <div className={`text-lg font-semibold mt-2 px-3 py-1 rounded-full inline-block ${
                                            result.bmi < 18.5 ? 'bg-yellow-100 text-yellow-800' :
                                            result.bmi < 25 ? 'bg-green-100 text-green-800' :
                                            result.bmi < 30 ? 'bg-orange-100 text-orange-800' :
                                            result.bmi < 35 ? 'bg-red-100 text-red-800' :
                                            result.bmi < 40 ? 'bg-red-200 text-red-900' :
                                            'bg-red-300 text-red-900'
                                        }`}>
                                            {result.category}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Health Risk Assessment</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.risk}</p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Ideal Weight Range</h4>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-700">
                                                {result.idealWeight.min} - {result.idealWeight.max} kg
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">For your height</p>
                                        </div>
                                    </div>

                                    {/* BMI Scale Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">BMI Classification Scale</h4>
                                        <div className="space-y-2">
                                            {[
                                                { range: '<16', label: 'Severe Thinness', color: 'bg-red-300' },
                                                { range: '16-17', label: 'Moderate Thinness', color: 'bg-orange-300' },
                                                { range: '17-18.5', label: 'Mild Thinness', color: 'bg-yellow-300' },
                                                { range: '18.5-25', label: 'Normal', color: 'bg-green-300' },
                                                { range: '25-30', label: 'Overweight', color: 'bg-yellow-300' },
                                                { range: '30-35', label: 'Obese I', color: 'bg-orange-300' },
                                                { range: '35-40', label: 'Obese II', color: 'bg-red-300' },
                                                { range: '>40', label: 'Obese III', color: 'bg-red-400' },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                                                    <span className="text-xs font-medium text-gray-700 w-12">{item.range}</span>
                                                    <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">BMI Formula</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-lg font-mono text-center text-blue-700">
                                    BMI = weight(kg) / [height(m)]²
                                </div>
                                <div className="mt-3 text-sm text-gray-600">
                                    <p>• Weight in kilograms</p>
                                    <p>• Height in meters (cm ÷ 100)</p>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Implications */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Clinical Implications</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>BMI &lt; 18.5:</strong> Increased surgical risk, impaired healing</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>BMI 18.5-25:</strong> Optimal for most health outcomes</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>BMI 25-30:</strong> Monitor for metabolic syndrome</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span><strong>BMI &gt; 30:</strong> Consider dose adjustment for lipophilic drugs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Health Risks Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">BMI-Associated Health Risks</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">BMI Category</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Relative Risk</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug Dosing</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Underweight (&lt;18.5)</td>
                                    <td className="py-3 px-4">↑ Infection risk</td>
                                    <td className="py-3 px-4">Consider reduced doses</td>
                                    <td className="py-3 px-4">Nutritional status</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Normal (18.5-25)</td>
                                    <td className="py-3 px-4">Baseline risk</td>
                                    <td className="py-3 px-4">Standard dosing</td>
                                    <td className="py-3 px-4">Routine</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Overweight (25-30)</td>
                                    <td className="py-3 px-4">↑ CVD risk</td>
                                    <td className="py-3 px-4">Standard dosing</td>
                                    <td className="py-3 px-4">Lipids, glucose</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Obese I (30-35)</td>
                                    <td className="py-3 px-4">↑↑ CVD risk</td>
                                    <td className="py-3 px-4">Consider ideal BW</td>
                                    <td className="py-3 px-4">Metabolic panel</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Obese II/III (&gt;35)</td>
                                    <td className="py-3 px-4">↑↑↑ CVD risk</td>
                                    <td className="py-3 px-4">Use adjusted BW</td>
                                    <td className="py-3 px-4">Comprehensive</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Drug Dosing Considerations */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Drug Dosing Considerations by BMI</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Underweight Patients</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Reduced volume of distribution</li>
                                <li>• Consider lower initial doses</li>
                                <li>• Monitor for toxicity</li>
                                <li>• Drugs: Aminoglycosides, vancomycin</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Obese Patients</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Increased volume of distribution for lipophilic drugs</li>
                                <li>• Use adjusted body weight for some calculations</li>
                                <li>• Monitor renal/hepatic function</li>
                                <li>• Drugs: Propofol, benzodiazepines</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}