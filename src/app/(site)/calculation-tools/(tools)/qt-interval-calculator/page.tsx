"use client";
import { useState } from 'react';
import { Calculator, Heart, Activity, AlertCircle, Clock, TrendingUp } from 'lucide-react';

export default function QTIntervalCalculator() {
    const [qtInterval, setQTInterval] = useState<string>('');
    const [rrInterval, setRRInterval] = useState<string>('');
    const [heartRate, setHeartRate] = useState<string>('');
    const [formula, setFormula] = useState<'bazett' | 'fridericia' | 'framingham'>('bazett');
    const [result, setResult] = useState<{
        qtc: number;
        interpretation: string;
        risk: string;
        action: string;
    } | null>(null);

    const calculateQTc = () => {
        const qt = parseFloat(qtInterval);
        const rr = parseFloat(rrInterval);
        const hr = parseFloat(heartRate);

        let rrSec = 0;
        
        // Calculate RR interval if heart rate is provided
        if (hr > 0) {
            rrSec = 60 / hr;
        } else if (rr > 0) {
            rrSec = rr / 1000; // Convert ms to seconds
        } else {
            alert('Please enter either RR interval or heart rate');
            return;
        }

        if (qt <= 0 || rrSec <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let qtc = 0;
        
        switch(formula) {
            case 'bazett':
                // Bazett's formula: QTc = QT / √(RR)
                qtc = qt / Math.sqrt(rrSec);
                break;
            case 'fridericia':
                // Fridericia's formula: QTc = QT / ∛(RR)
                qtc = qt / Math.cbrt(rrSec);
                break;
            case 'framingham':
                // Framingham formula: QTc = QT + 0.154 × (1 - RR)
                qtc = qt + 0.154 * (1 - rrSec);
                break;
        }

        let interpretation = '';
        let risk = '';
        let action = '';

        if (qtc < 440) {
            interpretation = 'Normal QTc interval';
            risk = 'Low risk for Torsades de Pointes';
            action = 'No action needed';
        } else if (qtc >= 440 && qtc <= 470) {
            interpretation = 'Borderline prolonged QTc';
            risk = 'Moderate risk';
            action = 'Monitor, consider risk factors';
        } else if (qtc > 470 && qtc <= 500) {
            interpretation = 'Prolonged QTc interval';
            risk = 'High risk';
            action = 'Review medications, consider ECG monitoring';
        } else {
            interpretation = 'Markedly prolonged QTc';
            risk = 'Very high risk for Torsades';
            action = 'Immediate action required, consider medication review';
        }

        setResult({
            qtc,
            interpretation,
            risk,
            action
        });
    };

    const resetCalculator = () => {
        setQTInterval('');
        setRRInterval('');
        setHeartRate('');
        setResult(null);
    };

    const sampleCases = [
        { qt: '400', hr: '60', formula: 'bazett' as const, label: 'Normal' },
        { qt: '480', hr: '60', formula: 'bazett' as const, label: 'Prolonged' },
        { qt: '380', hr: '120', formula: 'fridericia' as const, label: 'Tachycardia' },
        { qt: '420', hr: '50', formula: 'framingham' as const, label: 'Bradycardia' },
        { qt: '520', hr: '70', formula: 'bazett' as const, label: 'Severe' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Heart className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">QT Interval Calculator</h1>
                            <p className="text-gray-600">Calculate corrected QT interval (QTc) using Bazett's, Fridericia, or Framingham formulas</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            QTc Calculation
                        </h2>

                        {/* Formula Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Select Correction Formula</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setFormula('bazett')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${formula === 'bazett' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Bazett's
                                </button>
                                <button
                                    onClick={() => setFormula('fridericia')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${formula === 'fridericia' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Fridericia's
                                </button>
                                <button
                                    onClick={() => setFormula('framingham')}
                                    className={`p-4 rounded-lg transition-all duration-300 ${formula === 'framingham' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Framingham
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-blue-800 mb-3">
                                    QT Interval (ms)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="100"
                                    max="1000"
                                    value={qtInterval}
                                    onChange={(e) => setQTInterval(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 400"
                                />
                                <p className="text-sm text-gray-600 mt-2">Measured QT interval in milliseconds</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-green-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-green-800 mb-3">
                                        RR Interval (ms)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="100"
                                        max="2000"
                                        value={rrInterval}
                                        onChange={(e) => {
                                            setRRInterval(e.target.value);
                                            if (e.target.value) {
                                                const rr = parseFloat(e.target.value);
                                                if (rr > 0) {
                                                    setHeartRate((60000 / rr).toFixed(0));
                                                }
                                            }
                                        }}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., 1000"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">RR interval in milliseconds (optional)</p>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-6">
                                    <label className="block text-lg font-semibold text-purple-800 mb-3">
                                        Heart Rate (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="20"
                                        max="200"
                                        value={heartRate}
                                        onChange={(e) => {
                                            setHeartRate(e.target.value);
                                            if (e.target.value) {
                                                const hr = parseFloat(e.target.value);
                                                if (hr > 0) {
                                                    setRRInterval((60000 / hr).toFixed(0));
                                                }
                                            }
                                        }}
                                        className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., 60"
                                    />
                                    <p className="text-sm text-gray-600 mt-2">Heart rate in beats per minute (optional)</p>
                                </div>
                            </div>
                        </div>

                        {/* Sample Cases */}
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Cases</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {sampleCases.map((sample, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQTInterval(sample.qt);
                                            setHeartRate(sample.hr);
                                            setFormula(sample.formula);
                                        }}
                                        className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                    >
                                        <div className="font-semibold text-blue-600">{sample.label}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            QT: {sample.qt}ms, HR: {sample.hr}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateQTc}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate QTc
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">QTc Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Corrected QT Interval</div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {result.qtc.toFixed(0)} ms
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            {formula === 'bazett' ? "Bazett's Formula" : 
                                             formula === 'fridericia' ? "Fridericia's Formula" : 
                                             "Framingham Formula"}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <Activity className="w-5 h-5 text-blue-500 mr-2" />
                                            <h4 className="font-semibold text-gray-800">Interpretation</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.interpretation}</p>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Torsades de Pointes Risk</h4>
                                        <p className="text-sm text-gray-700">{result.risk}</p>
                                    </div>

                                    <div className={`rounded-lg p-4 border ${
                                        result.qtc < 440 ? 'bg-green-50 border-green-200' :
                                        result.qtc <= 470 ? 'bg-yellow-50 border-yellow-200' :
                                        result.qtc <= 500 ? 'bg-orange-50 border-orange-200' :
                                        'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-center mb-2">
                                            <AlertCircle className={`w-5 h-5 mr-2 ${
                                                result.qtc < 440 ? 'text-green-600' :
                                                result.qtc <= 470 ? 'text-yellow-600' :
                                                result.qtc <= 500 ? 'text-orange-600' :
                                                'text-red-600'
                                            }`} />
                                            <h4 className="font-semibold text-gray-800">Recommended Action</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{result.action}</p>
                                    </div>

                                    {/* QTc Scale */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">QTc Reference Ranges</h4>
                                        <div className="h-6 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative">
                                            <div className="absolute top-0 bottom-0 w-1 bg-black" 
                                                style={{ left: `${Math.min((result.qtc / 600) * 100, 100)}%` }}>
                                                <div className="absolute -top-6 -ml-4 text-xs font-semibold">
                                                    {result.qtc.toFixed(0)}ms
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 mt-2">
                                            <span>350</span>
                                            <span>440</span>
                                            <span>470</span>
                                            <span>500</span>
                                            <span>600</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Normal</span>
                                            <span>Borderline</span>
                                            <span>Prolonged</span>
                                            <span>Severe</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">QTc Formulae</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700">Bazett's Formula</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        QTc = QT / √(RR)
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Most common, overcorrects at high HR</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-700">Fridericia's Formula</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        QTc = QT / ³√(RR)
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Better at high heart rates</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-700">Framingham Formula</h4>
                                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                                        QTc = QT + 0.154 × (1 - RR)
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">Linear correction</p>
                                </div>
                            </div>
                        </div>

                        {/* Risk Categories */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Categories</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>QTc &lt; 440 ms</span>
                                    <span className="font-semibold text-green-600">Normal</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>440-470 ms (M)</span>
                                    <span className="font-semibold text-yellow-600">Borderline</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>440-480 ms (F)</span>
                                    <span className="font-semibold text-yellow-600">Borderline</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&gt; 470 ms (M)</span>
                                    <span className="font-semibold text-red-600">Prolonged</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&gt; 480 ms (F)</span>
                                    <span className="font-semibold text-red-600">Prolonged</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QT-Prolonging Drugs */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Common QT-Prolonging Drugs</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug Class</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Examples</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Risk Level</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Monitoring</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Antiarrhythmics</td>
                                    <td className="py-3 px-4">Amiodarone, Sotalol</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">High</span>
                                    </td>
                                    <td className="py-3 px-4">Baseline & periodic ECG</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Antipsychotics</td>
                                    <td className="py-3 px-4">Haloperidol, Quetiapine</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Moderate-High</span>
                                    </td>
                                    <td className="py-3 px-4">ECG with dose changes</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Antibiotics</td>
                                    <td className="py-3 px-4">Azithromycin, Levofloxacin</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Moderate</span>
                                    </td>
                                    <td className="py-3 px-4">ECG if risk factors</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Antidepressants</td>
                                    <td className="py-3 px-4">Citalopram, Amitriptyline</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Moderate</span>
                                    </td>
                                    <td className="py-3 px-4">ECG at high doses</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Antiemetics</td>
                                    <td className="py-3 px-4">Ondansetron, Droperidol</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Moderate-High</span>
                                    </td>
                                    <td className="py-3 px-4">Avoid in LQTS</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Risk Factors & Management */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Factors & Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Risk Factors for TdP</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Female gender</li>
                                <li>• Age &gt; 65 years</li>
                                <li>• Structural heart disease</li>
                                <li>• Bradycardia</li>
                                <li>• Electrolyte disturbances (K+, Mg2+, Ca2+)</li>
                                <li>• Renal/hepatic impairment</li>
                                <li>• Drug interactions</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Management Steps</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>1. Discontinue QT-prolonging drugs if possible</li>
                                <li>2. Correct electrolyte abnormalities</li>
                                <li>3. Consider cardiac monitoring</li>
                                <li>4. Avoid drug combinations that prolong QT</li>
                                <li>5. Use lowest effective dose</li>
                                <li>6. Regular ECG monitoring in high-risk patients</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Formula Comparison */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Formula Comparison</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Formula</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Best For</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Limitations</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clinical Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-medium">Bazett's</td>
                                    <td className="py-3 px-4">Heart rate 60-100 bpm</td>
                                    <td className="py-3 px-4">Overcorrects at HR &gt; 100 bpm</td>
                                    <td className="py-3 px-4">Most common in clinical practice</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-medium">Fridericia's</td>
                                    <td className="py-3 px-4">All heart rates</td>
                                    <td className="py-3 px-4">Less validated than Bazett's</td>
                                    <td className="py-3 px-4">Preferred for research</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-medium">Framingham</td>
                                    <td className="py-3 px-4">Elderly patients</td>
                                    <td className="py-3 px-4">Less commonly used</td>
                                    <td className="py-3 px-4">Alternative when others fail</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}