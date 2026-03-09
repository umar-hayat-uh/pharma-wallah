"use client";
import { useState, useEffect } from 'react';
import { Calculator, Activity, Syringe, Pill, TrendingUp, AlertCircle, Heart, Clock, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    const [chartData, setChartData] = useState<any[]>([]);

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

        // Update chart data (typical values by route)
        setChartData([
            { name: 'Oral', value: route === 'oral' ? f : 80 },
            { name: 'IV', value: 100 },
            { name: 'IM', value: 95 },
            { name: 'SC', value: 90 },
            { name: 'Transdermal', value: 85 },
        ]);
    };

    const calculateFromDose = () => {
        const doseA = parseFloat(doseAdministered);
        const doseR = parseFloat(doseReference);

        if (isNaN(doseA) || isNaN(doseR)) {
            alert('Please enter valid doses');
            return;
        }

        // Typical bioavailability by route (from literature)
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
        setChartData([
            { name: 'Oral', value: route === 'oral' ? relativeF : 80 },
            { name: 'IV', value: 100 },
            { name: 'IM', value: 95 },
            { name: 'SC', value: 90 },
            { name: 'Transdermal', value: 85 },
        ]);
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
        setChartData([]);
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

    useEffect(() => {
        // Optionally recalc when inputs change
    }, []);

    const getInterpretation = (f: number) => {
        if (f >= 80) return 'Excellent bioavailability – minimal first‑pass effect';
        if (f >= 50) return 'Good bioavailability – suitable for oral administration';
        if (f >= 30) return 'Moderate bioavailability – may require dose adjustment';
        return 'Low bioavailability – consider alternative routes or formulations';
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Bioavailability Calculator</h1>
                                <p className="text-blue-100 mt-2">Absolute & relative bioavailability using AUC ratio</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">F = (AUCₜ/Dₜ)/(AUCᵣ/Dᵣ)</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Administration Route
                            </h2>

                            {/* Route Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                                <button onClick={() => setRoute('oral')}
                                    className={`p-4 rounded-xl transition-all ${route === 'oral' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Pill className="w-6 h-6 mb-1 mx-auto" />
                                    <span className="text-xs font-semibold">Oral</span>
                                </button>
                                <button onClick={() => setRoute('iv')}
                                    className={`p-4 rounded-xl transition-all ${route === 'iv' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Syringe className="w-6 h-6 mb-1 mx-auto" />
                                    <span className="text-xs font-semibold">IV</span>
                                </button>
                                <button onClick={() => setRoute('im')}
                                    className={`p-4 rounded-xl transition-all ${route === 'im' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-6 h-6 mb-1 mx-auto" />
                                    <span className="text-xs font-semibold">IM</span>
                                </button>
                                <button onClick={() => setRoute('sc')}
                                    className={`p-4 rounded-xl transition-all ${route === 'sc' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-6 h-6 mb-1 mx-auto" />
                                    <span className="text-xs font-semibold">SC</span>
                                </button>
                                <button onClick={() => setRoute('transdermal')}
                                    className={`p-4 rounded-xl transition-all ${route === 'transdermal' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-6 h-6 mb-1 mx-auto" />
                                    <span className="text-xs font-semibold">Transdermal</span>
                                </button>
                            </div>

                            {/* Test Formulation */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                    Test Formulation
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                        <input type="number" step="0.001" value={doseAdministered}
                                            onChange={(e) => setDoseAdministered(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">AUC (mg·h/L)</label>
                                        <input type="number" step="0.001" value={aucAdministered}
                                            onChange={(e) => setAucAdministered(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Reference Formulation */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Syringe className="w-5 h-5 mr-2 text-green-600" />
                                    Reference (IV or Standard)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                        <input type="number" step="0.001" value={doseReference}
                                            onChange={(e) => setDoseReference(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">AUC (mg·h/L)</label>
                                        <input type="number" step="0.001" value={aucReference}
                                            onChange={(e) => setAucReference(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500" />
                                    </div>
                                </div>
                            </div>

                            {/* PK Parameters */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pharmacokinetic Parameters (optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance (L/h)</label>
                                        <input type="number" step="0.001" value={clearance}
                                            onChange={(e) => setClearance(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Volume of Distribution (L)</label>
                                        <input type="number" step="0.001" value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Example Drugs */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {sampleDrugs.map((drug, index) => (
                                        <button key={index} onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center">
                                            <div className="font-semibold text-blue-700">{drug.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                F={drug.f}% · t½={drug.t12}h
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={calculateBioavailability}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Calculate Bioavailability
                                </button>
                                <button onClick={calculateFromDose}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg">
                                    Estimate from Dose
                                </button>
                                <button onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results & Info Sidebar */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {bioavailability !== null && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <TrendingUp className="w-7 h-7 mr-3" />
                                    Bioavailability
                                </h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">F (AUC ratio)</div>
                                    <div className="text-5xl font-bold mb-2">{bioavailability.toFixed(1)}%</div>
                                    <div className="text-xl">{route.toUpperCase()}</div>
                                </div>
                                {halfLife !== null && (
                                    <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">Half-life (t½)</div>
                                            <div className="text-2xl font-bold">{halfLife.toFixed(2)} h</div>
                                        </div>
                                        <Clock className="w-8 h-8 opacity-80" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interpretation */}
                        {bioavailability !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Interpretation
                                </h3>
                                <p className="text-gray-700">{getInterpretation(bioavailability)}</p>
                            </div>
                        )}

                        {/* Chart */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Route Comparison</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3b82f6">
                                                {chartData.map((entry, idx) => (
                                                    <Cell key={idx} fill={entry.name === route ? '#10b981' : '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Typical Values */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Typical Bioavailability</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span>IV</span><span className="font-semibold">100%</span></div>
                                <div className="flex justify-between"><span>IM</span><span className="font-semibold">75–100%</span></div>
                                <div className="flex justify-between"><span>Oral</span><span className="font-semibold">0–100%</span></div>
                                <div className="flex justify-between"><span>Transdermal</span><span className="font-semibold">70–95%</span></div>
                            </div>
                        </div>

                        {/* BCS Classes */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">BCS Classification</h3>
                            <div className="space-y-2 text-sm">
                                <div className="p-2 bg-green-100 rounded"><span className="font-semibold">Class I:</span> High solubility, high permeability</div>
                                <div className="p-2 bg-blue-100 rounded"><span className="font-semibold">Class II:</span> Low solubility, high permeability</div>
                                <div className="p-2 bg-yellow-100 rounded"><span className="font-semibold">Class III:</span> High solubility, low permeability</div>
                                <div className="p-2 bg-red-100 rounded"><span className="font-semibold">Class IV:</span> Low solubility, low permeability</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}