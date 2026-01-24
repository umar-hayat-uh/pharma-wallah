"use client";
import { useState } from 'react';
import { Calculator, Ruler, Scale, Activity, AlertCircle, TrendingUp, Target } from 'lucide-react';

export default function BSACalculator() {
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [formula, setFormula] = useState<'mosteller' | 'dubois'>('mosteller');
    const [result, setResult] = useState<{
        bsa: number;
        category: string;
        clinicalUse: string;
        dosingAdjustment: string;
    } | null>(null);

    const calculateBSA = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            alert('Please enter valid positive numbers for height and weight');
            return;
        }

        let bsa: number;
        if (formula === 'mosteller') {
            // Mosteller formula: sqrt[(height(cm) × weight(kg))/3600]
            bsa = Math.sqrt((h * w) / 3600);
        } else {
            // DuBois formula: 0.007184 × height^0.725 × weight^0.425
            bsa = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
        }

        let category = '';
        let clinicalUse = '';
        let dosingAdjustment = '';

        if (bsa < 1.2) {
            category = 'Small Body Surface Area';
            clinicalUse = 'Pediatric or small adult dosing considerations';
            dosingAdjustment = 'Consider lower starting doses for chemotherapy';
        } else if (bsa >= 1.2 && bsa <= 2.0) {
            category = 'Normal Body Surface Area';
            clinicalUse = 'Standard adult dosing applicable';
            dosingAdjustment = 'Use standard dosing protocols';
        } else {
            category = 'Large Body Surface Area';
            clinicalUse = 'Increased dosing may be required';
            dosingAdjustment = 'May require dose adjustment for certain drugs';
        }

        setResult({
            bsa,
            category,
            clinicalUse,
            dosingAdjustment
        });
    };

    const resetCalculator = () => {
        setHeight('');
        setWeight('');
        setResult(null);
    };

    const samplePatients = [
        { name: 'Pediatric (8yo)', height: '130', weight: '28', formula: 'mosteller' },
        { name: 'Average Adult', height: '170', weight: '70', formula: 'mosteller' },
        { name: 'Obese Patient', height: '175', weight: '120', formula: 'dubois' },
        { name: 'Elderly Patient', height: '165', weight: '55', formula: 'mosteller' },
        { name: 'Athletic Build', height: '185', weight: '85', formula: 'dubois' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Ruler className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Body Surface Area (BSA) Calculator</h1>
                            <p className="text-gray-600">Calculate body surface area for chemotherapy dosing and medication adjustment</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            BSA Calculation
                        </h2>

                        {/* Formula Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Formula</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setFormula('mosteller')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${formula === 'mosteller' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Mosteller Formula
                                </button>
                                <button
                                    onClick={() => setFormula('dubois')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${formula === 'dubois' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    DuBois Formula
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3 flex items-center">
                                    <Ruler className="w-5 h-5 mr-2" />
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 170"
                                />
                                <p className="text-sm text-gray-600 mt-2">Patient height in centimeters</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3 flex items-center">
                                    <Scale className="w-5 h-5 mr-2" />
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
                                            setFormula(patient.formula as any);
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
                                onClick={calculateBSA}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate BSA
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">BSA Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Body Surface Area</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.bsa.toFixed(4)} m²
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            {formula === 'mosteller' ? 'Mosteller Formula' : 'DuBois Formula'}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Target className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Classification</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.category}</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Clinical Application</h4>
                                        <p className="text-sm text-gray-700">{result.clinicalUse}</p>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Dosing Consideration</h4>
                                        <p className="text-sm text-gray-700">{result.dosingAdjustment}</p>
                                    </div>

                                    {/* Visual Scale */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">BSA Scale</h4>
                                        <div className="h-4 bg-gradient-to-r from-blue-300 via-green-300 to-yellow-300 rounded-full relative">
                                            <div className="absolute top-0 bottom-0 w-1 bg-red-500" 
                                                style={{ left: `${Math.min(result.bsa * 40, 95)}%` }}>
                                                <div className="absolute -top-6 -ml-4 text-xs font-semibold text-red-600">
                                                    {result.bsa.toFixed(2)} m²
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                                            <span>1.0 m²</span>
                                            <span>2.0 m²</span>
                                            <span>3.0 m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formulae</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">Mosteller Formula</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        BSA (m²) = √[height(cm) × weight(kg) / 3600]
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">DuBois Formula</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        BSA = 0.007184 × height^0.725 × weight^0.425
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation Guide */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">BSA Interpretation</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>BSA &lt; 1.2 m²</span>
                                    <span className="font-semibold text-blue-600">Small</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>1.2 - 2.0 m²</span>
                                    <span className="font-semibold text-green-600">Normal</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&gt; 2.0 m²</span>
                                    <span className="font-semibold text-yellow-600">Large</span>
                                </div>
                                <div className="mt-4 p-2 bg-white rounded">
                                    <p className="text-xs text-gray-600">
                                        <strong>Note:</strong> Mosteller formula is most commonly used in clinical practice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Significance */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Significance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Dosing Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Chemotherapy dosing (most critical application)</li>
                                <li>• Glucocorticoid dosing</li>
                                <li>• Calculation of cardiac index</li>
                                <li>• Determining renal function (GFR/1.73m²)</li>
                                <li>• Adjusting drug doses in obese patients</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Clinical Notes</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Mosteller formula is preferred for simplicity</li>
                                <li>• BSA is a better indicator of metabolic mass than body weight</li>
                                <li>• Important in pediatric dosing</li>
                                <li>• Used in burn assessment (%BSA burned)</li>
                                <li>• Consider ideal body weight for obese patients</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BSA-Based Dosing Examples */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">BSA-Based Drug Dosing Examples</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Dose per m²</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Total Dose (70kg, 1.8m²)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clinical Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Carboplatin</td>
                                    <td className="py-3 px-4">AUC 5-7 mg/mL·min</td>
                                    <td className="py-3 px-4">450-630 mg</td>
                                    <td className="py-3 px-4">Chemotherapy</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Docetaxel</td>
                                    <td className="py-3 px-4">75 mg/m²</td>
                                    <td className="py-3 px-4">135 mg</td>
                                    <td className="py-3 px-4">Breast cancer</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Doxorubicin</td>
                                    <td className="py-3 px-4">50 mg/m²</td>
                                    <td className="py-3 px-4">90 mg</td>
                                    <td className="py-3 px-4">Various cancers</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Cyclophosphamide</td>
                                    <td className="py-3 px-4">750 mg/m²</td>
                                    <td className="py-3 px-4">1350 mg</td>
                                    <td className="py-3 px-4">Chemotherapy</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Methotrexate</td>
                                    <td className="py-3 px-4">12-15 g/m²</td>
                                    <td className="py-3 px-4">21.6-27 g</td>
                                    <td className="py-3 px-4">High-dose regimens</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* References */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">References</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Studies</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987</li>
                                <li>• Du Bois D, Du Bois EF. A formula to estimate the approximate surface area if height and weight be known. Arch Intern Med. 1916</li>
                                <li>• Gurney H. Dose calculation of anticancer drugs: a review of the current practice and introduction of an alternative. J Clin Oncol. 1996</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Clinical Guidelines</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• NCCN Guidelines: Chemotherapy dosing by BSA</li>
                                <li>• ASCO Recommendations: Dose adjustments in obesity</li>
                                <li>• FDA Guidance: BSA-based dosing for oncology drugs</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}