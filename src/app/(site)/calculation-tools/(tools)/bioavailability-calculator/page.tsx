"use client";
import { useState, useEffect } from 'react';
import { Calculator, Activity, Syringe, Pill, TrendingUp, AlertCircle, Heart, Clock } from 'lucide-react';

type RouteType = 'oral' | 'iv' | 'im' | 'sc' | 'transdermal';

export default function BioavailabilityCalculator() {
    const [route, setRoute] = useState<RouteType>('oral');
    const [doseAdministered, setDoseAdministered] = useState<string>('100');
    const [aucAdministered, setAucAdministered] = useState<string>('50');
    const [doseReference, setDoseReference] = useState<string>('100');
    const [aucReference, setAucReference] = useState<string>('100');
    const [bioavailability, setBioavailability] = useState<number | null>(null);
    const [clearance, setClearance] = useState<string>('');
    const [volume, setVolume] = useState<string>('');
    const [halfLife, setHalfLife] = useState<number | null>(null);

    const calculateBioavailability = () => {
        const doseA = parseFloat(doseAdministered);
        const aucA = parseFloat(aucAdministered);
        const doseR = parseFloat(doseReference);
        const aucR = parseFloat(aucReference);

        if (isNaN(doseA) || isNaN(aucA) || isNaN(doseR) || isNaN(aucR)) {
            alert('Please enter valid numbers');
            return;
        }

        if (doseR === 0 || aucR === 0) {
            alert('Reference values cannot be zero');
            return;
        }

        const f = ((aucA / doseA) / (aucR / doseR)) * 100;
        setBioavailability(f);

        // Calculate half-life if clearance and volume are provided
        const cl = parseFloat(clearance);
        const v = parseFloat(volume);
        if (!isNaN(cl) && !isNaN(v) && cl > 0 && v > 0) {
            const t12 = (0.693 * v) / cl;
            setHalfLife(t12);
        }
    };

    const calculateFromDose = () => {
        const doseA = parseFloat(doseAdministered);
        const doseR = parseFloat(doseReference);

        if (isNaN(doseA) || isNaN(doseR)) {
            alert('Please enter valid doses');
            return;
        }

        // Using typical bioavailability values by route
        const typicalF: Record<RouteType, number> = {
            oral: 80,
            iv: 100,
            im: 95,
            sc: 90,
            transdermal: 85
        };

        const f = typicalF[route];
        const effectiveDose = doseA * (f / 100);
        const relativeF = (effectiveDose / doseR) * 100;

        setBioavailability(relativeF);
        setAucAdministered((effectiveDose * 0.5).toFixed(2));
        setAucReference((doseR * 0.5).toFixed(2));
    };

    const resetCalculator = () => {
        setDoseAdministered('100');
        setAucAdministered('50');
        setDoseReference('100');
        setAucReference('100');
        setBioavailability(null);
        setClearance('');
        setVolume('');
        setHalfLife(null);
    };

    const sampleDrugs = [
        { name: 'Aspirin', route: 'oral', f: 80, dose: '325', t12: '0.25' },
        { name: 'Propranolol', route: 'oral', f: 26, dose: '40', t12: '4' },
        { name: 'Digoxin', route: 'iv', f: 100, dose: '0.25', t12: '36' },
        { name: 'Insulin', route: 'sc', f: 95, dose: '10', t12: '0.17' },
        { name: 'Nitroglycerin', route: 'transdermal', f: 75, dose: '0.4', t12: '0.04' },
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setRoute(drug.route as RouteType);
        setDoseAdministered(drug.dose);
        setDoseReference(drug.dose);
        setAucAdministered((parseFloat(drug.dose) * (drug.f / 100) * 0.5).toFixed(2));
        setAucReference((parseFloat(drug.dose) * 0.5).toFixed(2));
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Activity className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Bioavailability Calculator</h1>
                            <p className="text-gray-600">Calculate absolute and relative bioavailability of pharmaceutical compounds</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Bioavailability Calculation
                        </h2>

                        {/* Route Selection */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">Administration Route</label>
                            <div className="grid grid-cols-5 gap-3">
                                <button
                                    onClick={() => setRoute('oral')}
                                    className={`p-3 rounded-lg transition-all duration-300 ${route === 'oral' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Pill className="inline w-4 h-4 mr-2" />
                                    Oral
                                </button>
                                <button
                                    onClick={() => setRoute('iv')}
                                    className={`p-3 rounded-lg transition-all duration-300 ${route === 'iv' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Syringe className="inline w-4 h-4 mr-2" />
                                    IV
                                </button>
                                <button
                                    onClick={() => setRoute('im')}
                                    className={`p-3 rounded-lg transition-all duration-300 ${route === 'im' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Activity className="inline w-4 h-4 mr-2" />
                                    IM
                                </button>
                                <button
                                    onClick={() => setRoute('sc')}
                                    className={`p-3 rounded-lg transition-all duration-300 ${route === 'sc' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Activity className="inline w-4 h-4 mr-2" />
                                    SC
                                </button>
                                <button
                                    onClick={() => setRoute('transdermal')}
                                    className={`p-3 rounded-lg transition-all duration-300 ${route === 'transdermal' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Activity className="inline w-4 h-4 mr-2" />
                                    Transdermal
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Administered Drug */}
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">Test Formulation</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dose Administered (mg)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={doseAdministered}
                                            onChange={(e) => setDoseAdministered(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">AUC (mg·h/L)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={aucAdministered}
                                            onChange={(e) => setAucAdministered(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reference Drug */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">Reference (IV or Standard)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Dose (mg)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={doseReference}
                                            onChange={(e) => setDoseReference(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reference AUC (mg·h/L)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={aucReference}
                                            onChange={(e) => setAucReference(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PK Parameters */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pharmacokinetic Parameters (Optional)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance (L/h)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={clearance}
                                            onChange={(e) => setClearance(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none"
                                            placeholder="e.g., 5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Volume of Distribution (L)</label>
                                        <input
                                            type="number"
                                            step="0.001"
                                            value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none"
                                            placeholder="e.g., 50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sample Drugs */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    {sampleDrugs.map((drug, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                                        >
                                            <div className="font-semibold text-blue-600">{drug.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {drug.route.toUpperCase()} · F={drug.f}% · t½={drug.t12}h
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateBioavailability}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                                >
                                    Calculate Bioavailability
                                </button>
                                <button
                                    onClick={calculateFromDose}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg"
                                >
                                    Estimate from Dose
                                </button>
                                <button
                                    onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {bioavailability !== null && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Bioavailability Results</h2>

                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">
                                            {route.toUpperCase()} Bioavailability (F)
                                        </div>
                                        <div className="text-4xl font-bold text-green-600">
                                            {bioavailability.toFixed(1)}%
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            Relative to Reference
                                        </div>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm font-semibold text-gray-600">Formula Used</div>
                                            <div className="text-sm font-mono mt-1">F = (AUCₜ/Dₜ) / (AUCᵣ/Dᵣ) × 100%</div>
                                        </div>
                                    </div>

                                    {halfLife !== null && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-600">Half-Life (t½)</div>
                                                    <div className="text-2xl font-bold text-purple-600">{halfLife.toFixed(2)} hours</div>
                                                </div>
                                                <Clock className="w-8 h-8 text-purple-500" />
                                            </div>
                                            <div className="text-xs text-gray-600 mt-2">Calculated from clearance and volume</div>
                                        </div>
                                    )}

                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <h4 className="font-semibold text-blue-800 mb-2">Interpretation</h4>
                                        <p className="text-sm text-gray-700">
                                            {bioavailability >= 80 ? 'Excellent bioavailability - minimal first-pass effect' :
                                                bioavailability >= 50 ? 'Good bioavailability - suitable for oral administration' :
                                                    bioavailability >= 30 ? 'Moderate bioavailability - may require dose adjustment' :
                                                        'Low bioavailability - consider alternative routes or formulations'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Bioavailability Factors</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">First-pass metabolism:</span> Liver extraction after oral administration</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Solubility:</span> Affects dissolution and absorption</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></div>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Permeability:</span> Ability to cross biological membranes</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></div>
                                    <p className="text-sm text-gray-600"><span className="font-semibold">Food effect:</span> Can increase or decrease absorption</p>
                                </div>
                            </div>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Clinical Significance
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Dose adjustment for different routes</li>
                                <li>• Bioequivalence studies</li>
                                <li>• Formulation development</li>
                                <li>• Therapeutic window determination</li>
                                <li>• Drug-drug interaction assessment</li>
                                <li>• Patient variability considerations</li>
                            </ul>
                        </div>

                        {/* Typical Values */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Typical Bioavailability Ranges</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-blue-700">Intravenous (IV)</span>
                                        <span className="text-sm font-bold">100%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full w-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-blue-700">Intramuscular (IM)</span>
                                        <span className="text-sm font-bold">75-100%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-blue-700">Oral</span>
                                        <span className="text-sm font-bold">0-100%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full w-3/5"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-semibold text-blue-700">Transdermal</span>
                                        <span className="text-sm font-bold">70-95%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full w-4/5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BCS Classification */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Biopharmaceutics Classification System (BCS)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Class</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Solubility</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Permeability</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Bioavailability</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Examples</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Development Strategy</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold text-green-700">Class I</td>
                                    <td className="py-3 px-4">High</td>
                                    <td className="py-3 px-4">High</td>
                                    <td className="py-3 px-4">Well absorbed</td>
                                    <td className="py-3 px-4">Metoprolol, Propranolol</td>
                                    <td className="py-3 px-4">Standard formulation</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-semibold text-blue-700">Class II</td>
                                    <td className="py-3 px-4">Low</td>
                                    <td className="py-3 px-4">High</td>
                                    <td className="py-3 px-4">Dissolution rate limited</td>
                                    <td className="py-3 px-4">Naproxen, Carbamazepine</td>
                                    <td className="py-3 px-4">Enhance solubility</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold text-yellow-700">Class III</td>
                                    <td className="py-3 px-4">High</td>
                                    <td className="py-3 px-4">Low</td>
                                    <td className="py-3 px-4">Permeability limited</td>
                                    <td className="py-3 px-4">Cimetidine, Acyclovir</td>
                                    <td className="py-3 px-4">Enhance permeability</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="py-3 px-4 font-semibold text-red-700">Class IV</td>
                                    <td className="py-3 px-4">Low</td>
                                    <td className="py-3 px-4">Low</td>
                                    <td className="py-3 px-4">Poorly absorbed</td>
                                    <td className="py-3 px-4">Chlorthiazide, Taxol</td>
                                    <td className="py-3 px-4">Consider alternative routes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}