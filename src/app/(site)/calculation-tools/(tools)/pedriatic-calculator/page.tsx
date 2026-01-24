"use client";
import { useState } from 'react';
import { Calculator, Baby, Users, Weight, Calendar, AlertCircle, Pill } from 'lucide-react';

export default function PediatricCalculator() {
    const [weight, setWeight] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [adultDose, setAdultDose] = useState<string>('');
    const [rule, setRule] = useState<'young' | 'clark' | 'fried'>('young');
    const [result, setResult] = useState<{
        pediatricDose: number;
        ruleUsed: string;
        interpretation: string;
        mgPerKg: number;
    } | null>(null);

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
        
        switch(rule) {
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
        }

        const mgPerKg = pediatricDose / w;
        
        let interpretation = '';
        if (mgPerKg > adult / 70 * 2) { // Assuming 70kg adult
            interpretation = 'High dose - verify with mg/kg dosing';
        } else if (mgPerKg < adult / 70 * 0.5) {
            interpretation = 'Low dose - consider minimum effective dose';
        } else {
            interpretation = 'Appropriate dose range';
        }

        setResult({
            pediatricDose,
            ruleUsed: ruleName,
            interpretation,
            mgPerKg
        });
    };

    const resetCalculator = () => {
        setWeight('');
        setAge('');
        setAdultDose('');
        setResult(null);
    };

    const commonDrugs = [
        { name: 'Paracetamol', adultDose: '1000', weight: '20', age: '6' },
        { name: 'Ibuprofen', adultDose: '400', weight: '25', age: '8' },
        { name: 'Amoxicillin', adultDose: '500', weight: '15', age: '4' },
        { name: 'Prednisolone', adultDose: '40', weight: '30', age: '10' },
        { name: 'Diphenhydramine', adultDose: '50', weight: '18', age: '5' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Baby className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Pediatric Dosing Calculator</h1>
                            <p className="text-gray-600">Calculate pediatric doses using Young's, Clark's, and Fried's rules</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Pediatric Dose Calculation
                        </h2>

                        {/* Rule Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Pediatric Rule</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setRule('young')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${rule === 'young' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Young's Rule
                                </button>
                                <button
                                    onClick={() => setRule('clark')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${rule === 'clark' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Clark's Rule
                                </button>
                                <button
                                    onClick={() => setRule('fried')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${rule === 'fried' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Fried's Rule
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3 flex items-center">
                                    <Weight className="w-5 h-5 mr-2" />
                                    Child's Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 20"
                                />
                                <p className="text-sm text-gray-600 mt-2">Patient weight in kilograms</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-green-800 mb-3 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Child's Age (years)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 6"
                                />
                                <p className="text-sm text-gray-600 mt-2">Patient age in years</p>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-purple-800 mb-3 flex items-center">
                                    <Pill className="w-5 h-5 mr-2" />
                                    Adult Dose (mg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    value={adultDose}
                                    onChange={(e) => setAdultDose(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., 500"
                                />
                                <p className="text-sm text-gray-600 mt-2">Standard adult dose in milligrams</p>
                            </div>
                        </div>

                        {/* Common Drugs */}
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Drugs</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {commonDrugs.map((drug, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setWeight(drug.weight);
                                            setAge(drug.age);
                                            setAdultDose(drug.adultDose);
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{drug.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Adult: {drug.adultDose}mg
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculatePediatricDose}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate Pediatric Dose
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Pediatric Dose Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Pediatric Dose</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.pediatricDose.toFixed(1)} mg
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            {result.ruleUsed}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Weight className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Dose per Kilogram</h4>
                                        </div>
                                        <div className="text-xl font-bold text-blue-600 text-center">
                                            {result.mgPerKg.toFixed(2)} mg/kg
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                                            <h4 className="font-semibold text-yellow-800">Important Note</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            These rules provide approximate doses. Always verify with official pediatric dosing guidelines and consider individual patient factors.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Pediatric Rules Formulae</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">Young's Rule</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        Dose = Adult Dose × [Age (years) / (Age + 12)]
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Clark's Rule</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        Dose = Adult Dose × [Weight (lbs) / 150]
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-700">Fried's Rule</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        Dose = Adult Dose × [Age (months) / 150]
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Age Groups */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Pediatric Age Groups</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Neonate (0-28 days)</span>
                                    <span className="font-semibold text-blue-600">Special dosing</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Infant (1-12 months)</span>
                                    <span className="font-semibold text-green-600">mg/kg dosing</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Child (1-12 years)</span>
                                    <span className="font-semibold text-yellow-600">Rules apply</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Adolescent (13-18)</span>
                                    <span className="font-semibold text-orange-600">Adult dosing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Rule Comparison (20kg, 6yo child)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Rule</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Formula</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">500mg Adult Dose</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Best Used For</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Limitations</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Young's Rule</td>
                                    <td className="py-3 px-4">Age/(Age+12)</td>
                                    <td className="py-3 px-4">166.7 mg</td>
                                    <td className="py-3 px-4">Children 1-12 years</td>
                                    <td className="py-3 px-4">Doesn't consider weight</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Clark's Rule</td>
                                    <td className="py-3 px-4">Weight(lbs)/150</td>
                                    <td className="py-3 px-4">146.7 mg</td>
                                    <td className="py-3 px-4">Weight-based dosing</td>
                                    <td className="py-3 px-4">Assumes 150lb adult</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Fried's Rule</td>
                                    <td className="py-3 px-4">Age(months)/150</td>
                                    <td className="py-3 px-4">240 mg</td>
                                    <td className="py-3 px-4">Infants {'<'} 1 year</td>
                                    <td className="py-3 px-4">For infants only</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Clinical Guidelines */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Guidelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">When to Use</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• For drugs without established pediatric dosing</li>
                                <li>• As a starting point for dose estimation</li>
                                <li>• For non-critical medications</li>
                                <li>• When specific pediatric data is unavailable</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Precautions</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Always verify with official references</li>
                                <li>• Consider organ function maturation</li>
                                <li>• Adjust for pharmacokinetic differences</li>
                                <li>• Monitor for efficacy and toxicity</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}