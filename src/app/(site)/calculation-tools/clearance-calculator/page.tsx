"use client";
import { useState } from 'react';
import { Calculator, Filter, Activity, AlertCircle, Clock, Droplet } from 'lucide-react';

export default function ClearanceCalculator() {
    const [dose, setDose] = useState<string>('');
    const [auc, setAuc] = useState<string>('');
    const [concentration, setConcentration] = useState<string>('');
    const [infusionRate, setInfusionRate] = useState<string>('');
    const [method, setMethod] = useState<'single' | 'steady'>('single');
    const [result, setResult] = useState<{
        clearance: number;
        clearancePerKg: number;
        halfLife: number;
        interpretation: string;
        organInvolved: string;
    } | null>(null);

    const calculateClearance = () => {
        if (method === 'single') {
            const D = parseFloat(dose);
            const AUC = parseFloat(auc);

            if (isNaN(D) || isNaN(AUC) || D <= 0 || AUC <= 0) {
                alert('Please enter valid positive numbers for dose and AUC');
                return;
            }

            const clearance = D / AUC;
            calculateInterpretation(clearance);
        } else {
            const Css = parseFloat(concentration);
            const R0 = parseFloat(infusionRate);

            if (isNaN(Css) || isNaN(R0) || Css <= 0 || R0 <= 0) {
                alert('Please enter valid positive numbers for steady-state concentration and infusion rate');
                return;
            }

            const clearance = R0 / Css;
            calculateInterpretation(clearance);
        }
    };

    const calculateInterpretation = (clearance: number) => {
        const clearancePerKg = clearance / 70; // Assume 70kg patient
        const halfLife = (0.693 * 10) / clearance; // Assume Vd = 10L for calculation

        let interpretation = '';
        let organInvolved = '';

        if (clearance < 0.5) {
            interpretation = 'Very low clearance - severely impaired elimination';
            organInvolved = 'Severe hepatic/renal impairment';
        } else if (clearance >= 0.5 && clearance < 2) {
            interpretation = 'Low clearance - reduced elimination capacity';
            organInvolved = 'Moderate hepatic/renal impairment';
        } else if (clearance >= 2 && clearance < 10) {
            interpretation = 'Normal clearance - typical elimination';
            organInvolved = 'Normal hepatic/renal function';
        } else if (clearance >= 10 && clearance < 30) {
            interpretation = 'High clearance - efficient elimination';
            organInvolved = 'Enhanced metabolism/excretion';
        } else {
            interpretation = 'Very high clearance - blood flow limited';
            organInvolved = 'Liver blood flow limited';
        }

        setResult({
            clearance,
            clearancePerKg,
            halfLife,
            interpretation,
            organInvolved
        });
    };

    const resetCalculator = () => {
        setDose('');
        setAuc('');
        setConcentration('');
        setInfusionRate('');
        setResult(null);
    };

    const sampleDrugs = [
        { name: 'Digoxin', clearance: 0.12, method: 'single' },
        { name: 'Theophylline', clearance: 0.04, method: 'single' },
        { name: 'Gentamicin', clearance: 0.1, method: 'steady' },
        { name: 'Lidocaine', clearance: 0.95, method: 'steady' },
        { name: 'Propranolol', clearance: 1.2, method: 'single' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Filter className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Clearance (CL) Calculator</h1>
                            <p className="text-gray-600">Calculate drug clearance for pharmacokinetic analysis and dosing adjustment</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Clearance Calculation
                        </h2>

                        {/* Method Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMethod('single')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${method === 'single' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Single Dose Method
                                </button>
                                <button
                                    onClick={() => setMethod('steady')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${method === 'steady' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Steady-State Method
                                </button>
                            </div>
                        </div>

                        {method === 'single' ? (
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Dose (mg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={dose}
                                        onChange={(e) => setDose(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 500"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Administered intravenous dose</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Area Under Curve (AUC) (mg·h/L)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={auc}
                                        onChange={(e) => setAuc(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 50"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Area under plasma concentration-time curve</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-blue-800 mb-3">
                                        Steady-State Concentration (mg/L)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={concentration}
                                        onChange={(e) => setConcentration(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 10"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Plasma concentration at steady-state</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        Infusion Rate (mg/h)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0.001"
                                        value={infusionRate}
                                        onChange={(e) => setInfusionRate(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 100"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Rate of intravenous infusion</p>
                                </div>
                            </div>
                        )}

                        {/* Sample Drugs */}
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Drugs</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {sampleDrugs.map((drug, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setMethod(drug.method as 'single' | 'steady');
                                            if (drug.method === 'single') {
                                                setDose('100');
                                                setAuc((100 / drug.clearance).toFixed(2));
                                            } else {
                                                setConcentration('10');
                                                setInfusionRate((10 * drug.clearance).toFixed(2));
                                            }
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{drug.name}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            CL: {drug.clearance} L/h
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Clearance Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Total Clearance</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.clearance.toFixed(3)} L/h
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            ({result.clearancePerKg.toFixed(5)} L/h/kg)
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Clock className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Estimated Half-life</h4>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {result.halfLife.toFixed(2)} hours
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Primary Organ Involvement</h4>
                                        <p className="text-sm text-gray-700">{result.organInvolved}</p>
                                    </div>

                                    {/* Organ Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Elimination Organs</h4>
                                        <div className="flex items-center justify-around">
                                            <div className="text-center">
                                                <Filter className={`w-8 h-8 mx-auto mb-1 ${result.clearance > 2 ? 'text-green-500' : 'text-gray-300'}`} />
                                                <div className="text-xs">Liver</div>
                                            </div>
                                            <div className="text-center">
                                                <Droplet className={`w-8 h-8 mx-auto mb-1 ${result.clearance < 10 ? 'text-blue-500' : 'text-gray-300'}`} />
                                                <div className="text-xs">Kidneys</div>
                                            </div>
                                            <div className="text-center">
                                                <Activity className={`w-8 h-8 mx-auto mb-1 ${result.clearance > 30 ? 'text-red-500' : 'text-gray-300'}`} />
                                                <div className="text-xs">Metabolism</div>
                                            </div>
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
                                    <h4 className="font-semibold text-blue-700">Single Dose Method</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        CL = Dose / AUC
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Steady-State Method</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        CL = R₀ / Css
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-600">Half-life Relation</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        t₁/₂ = 0.693 × Vd / CL
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation Guide */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Clearance Interpretation</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>CL &lt; 0.5 L/h</span>
                                    <span className="font-semibold text-red-600">Severe impairment</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>0.5-2 L/h</span>
                                    <span className="font-semibold text-orange-600">Reduced clearance</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>2-10 L/h</span>
                                    <span className="font-semibold text-green-600">Normal clearance</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>10-30 L/h</span>
                                    <span className="font-semibold text-blue-600">High clearance</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&gt;30 L/h</span>
                                    <span className="font-semibold text-purple-600">Flow-limited</span>
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
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Dosing Implications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Low clearance → Higher plasma concentrations</li>
                                <li>• High clearance → Lower plasma concentrations</li>
                                <li>• Adjust doses in renal/hepatic impairment</li>
                                <li>• Determine dosing intervals</li>
                                <li>• Predict drug accumulation</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Therapeutic Monitoring</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Essential for narrow therapeutic index drugs</li>
                                <li>• Monitor in organ dysfunction</li>
                                <li>• Adjust for drug interactions</li>
                                <li>• Important in elderly patients</li>
                                <li>• Critical in pediatric dosing</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Drug Clearance Examples */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Drug Clearance Characteristics</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clearance (L/h)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Primary Route</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Dosing Consideration</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Digoxin</td>
                                    <td className="py-3 px-4">0.12</td>
                                    <td className="py-3 px-4">Renal</td>
                                    <td className="py-3 px-4">Reduce dose in renal impairment</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Theophylline</td>
                                    <td className="py-3 px-4">0.04</td>
                                    <td className="py-3 px-4">Hepatic</td>
                                    <td className="py-3 px-4">Affected by liver disease, smoking</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Gentamicin</td>
                                    <td className="py-3 px-4">0.1</td>
                                    <td className="py-3 px-4">Renal</td>
                                    <td className="py-3 px-4">Monitor levels, adjust for renal function</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Lidocaine</td>
                                    <td className="py-3 px-4">0.95</td>
                                    <td className="py-3 px-4">Hepatic</td>
                                    <td className="py-3 px-4">Reduce dose in heart failure, liver disease</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">Propranolol</td>
                                    <td className="py-3 px-4">1.2</td>
                                    <td className="py-3 px-4">Hepatic</td>
                                    <td className="py-3 px-4">Extensive first-pass metabolism</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}