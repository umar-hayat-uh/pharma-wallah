"use client";
import { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ED50TD50LD50Calculator() {
    const [ed50, setEd50] = useState<string>('');
    const [td50, setTd50] = useState<string>('');
    const [ld50, setLd50] = useState<string>('');
    const [dose, setDose] = useState<string>('');
    const [responseType, setResponseType] = useState<string>('therapeutic');
    const [result, setResult] = useState<{
        therapeuticIndex: number;
        safetyMargin: number;
        classification: string;
        color: string;
        riskLevel: string;
        doseResponse: string;
    } | null>(null);

    const calculateSafety = () => {
        const ED50 = parseFloat(ed50);
        const TD50 = parseFloat(td50);
        const LD50 = parseFloat(ld50);
        const D = parseFloat(dose);

        if (isNaN(ED50) || ED50 <= 0) {
            alert('Please enter a valid ED50');
            return;
        }

        let therapeuticIndex = 0;
        let safetyMargin = 0;
        let classification = '';
        let color = '';
        let riskLevel = '';
        let doseResponse = '';

        // Calculate based on available data
        if (!isNaN(TD50) && TD50 > 0) {
            therapeuticIndex = TD50 / ED50;
            safetyMargin = TD50 / D;

            if (therapeuticIndex < 3) {
                classification = 'NARROW THERAPEUTIC INDEX';
                color = 'text-red-600';
                riskLevel = 'HIGH RISK';
            } else if (therapeuticIndex < 10) {
                classification = 'MODERATE THERAPEUTIC INDEX';
                color = 'text-yellow-600';
                riskLevel = 'MODERATE RISK';
            } else {
                classification = 'WIDE THERAPEUTIC INDEX';
                color = 'text-green-600';
                riskLevel = 'LOW RISK';
            }
        }

        if (!isNaN(LD50) && LD50 > 0) {
            const lethalMargin = LD50 / ED50;
            if (lethalMargin < 10) {
                riskLevel = 'HIGH LETHALITY RISK';
                color = 'text-red-600';
            }
        }

        if (!isNaN(D) && D > 0) {
            const relativeDose = D / ED50;
            if (relativeDose < 0.5) {
                doseResponse = 'SUB-THERAPEUTIC';
            } else if (relativeDose >= 0.5 && relativeDose < 2) {
                doseResponse = 'THERAPEUTIC RANGE';
            } else if (relativeDose >= 2 && relativeDose < 5) {
                doseResponse = 'SUPRATHERAPEUTIC';
            } else {
                doseResponse = 'TOXIC RANGE';
            }
        }

        setResult({
            therapeuticIndex,
            safetyMargin,
            classification,
            color,
            riskLevel,
            doseResponse
        });
    };

    const resetCalculator = () => {
        setEd50('');
        setTd50('');
        setLd50('');
        setDose('');
        setResult(null);
    };

    const safetyDefinitions = [
        { term: 'ED50', definition: 'Effective Dose 50% - Dose producing therapeutic effect in 50% of population', unit: 'mg/kg' },
        { term: 'TD50', definition: 'Toxic Dose 50% - Dose producing toxicity in 50% of population', unit: 'mg/kg' },
        { term: 'LD50', definition: 'Lethal Dose 50% - Dose causing death in 50% of population', unit: 'mg/kg' },
        { term: 'TI', definition: 'Therapeutic Index - Ratio of TD50 to ED50 (higher is safer)', unit: 'Unitless' },
    ];

    const exampleDrugs = [
        { drug: 'Digoxin', ED50: '0.8', TD50: '2.0', LD50: '3.5', TI: '2.5' },
        { drug: 'Aspirin', ED50: '100', TD50: '500', LD50: '1500', TI: '5.0' },
        { drug: 'Morphine', ED50: '5', TD50: '15', LD50: '50', TI: '3.0' },
        { drug: 'Penicillin', ED50: '10', TD50: '500', LD50: '5000', TI: '50' },
        { drug: 'Warfarin', ED50: '1.5', TD50: '3.0', LD50: '10', TI: '2.0' },
    ];

    return (
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">

            <div className="max-w-7xl mx-auto  bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center mb-6">
                    <Activity className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">ED50, TD50, LD50 Calculator</h2>
                        <p className="text-gray-600">Calculate drug safety parameters and therapeutic indices</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    ED50 (mg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={ed50}
                                    onChange={(e) => setEd50(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                    placeholder="e.g., 10"
                                />
                                <p className="text-xs text-gray-600 mt-1">Effective dose 50%</p>
                            </div>

                            <div className="bg-yellow-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    TD50 (mg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={td50}
                                    onChange={(e) => setTd50(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-yellow-300 rounded-lg focus:border-yellow-400 focus:outline-none"
                                    placeholder="e.g., 50"
                                />
                                <p className="text-xs text-gray-600 mt-1">Toxic dose 50%</p>
                            </div>

                            <div className="bg-red-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    LD50 (mg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={ld50}
                                    onChange={(e) => setLd50(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                    placeholder="e.g., 200"
                                />
                                <p className="text-xs text-gray-600 mt-1">Lethal dose 50%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Test Dose (mg/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={dose}
                                    onChange={(e) => setDose(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    placeholder="e.g., 25"
                                />
                            </div>

                            <div className="bg-purple-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Response Type
                                </label>
                                <select
                                    value={responseType}
                                    onChange={(e) => setResponseType(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                >
                                    <option value="therapeutic">Therapeutic Effect</option>
                                    <option value="toxic">Toxic Effect</option>
                                    <option value="lethal">Lethal Effect</option>
                                </select>
                            </div>
                        </div>

                        {/* Dose-Response Visualization */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4 text-center">Dose-Response Relationship</h3>
                            <div className="relative h-48">
                                {/* Response curves */}
                                <div className="absolute inset-0">
                                    {/* Therapeutic response curve */}
                                    <svg className="absolute inset-0 w-full h-full">
                                        <path
                                            d="M 0,80 Q 40,60 80,40 T 160,20"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="3"
                                            strokeDasharray="5,5"
                                        />
                                    </svg>

                                    {/* Toxic response curve */}
                                    <svg className="absolute inset-0 w-full h-full">
                                        <path
                                            d="M 0,90 Q 50,70 100,50 T 200,30"
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="3"
                                        />
                                    </svg>

                                    {/* Lethal response curve */}
                                    <svg className="absolute inset-0 w-full h-full">
                                        <path
                                            d="M 0,95 Q 60,80 120,60 T 240,40"
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="3"
                                            strokeDasharray="3,3"
                                        />
                                    </svg>
                                </div>

                                {/* ED50, TD50, LD50 markers */}
                                {ed50 && (
                                    <div
                                        className="absolute top-1/2 w-6 h-6 bg-green-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${Math.min((parseFloat(ed50) / 100) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-green-600">
                                                ED50
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {td50 && (
                                    <div
                                        className="absolute top-2/3 w-6 h-6 bg-yellow-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${Math.min((parseFloat(td50) / 100) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-yellow-600">
                                                TD50
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {ld50 && (
                                    <div
                                        className="absolute top-3/4 w-6 h-6 bg-red-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${Math.min((parseFloat(ld50) / 100) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-red-600">
                                                LD50
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Test dose marker */}
                                {dose && (
                                    <div
                                        className="absolute bottom-4 w-8 h-1 bg-blue-600 transform -translate-x-1/2"
                                        style={{ left: `${Math.min((parseFloat(dose) / 100) * 100, 95)}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                            <div className="bg-blue-600 text-white px-2 py-1 rounded shadow text-xs font-bold">
                                                Test Dose
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Axes */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                                {/* Labels */}
                                <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0 mg/kg</div>
                                <div className="absolute -bottom-6 right-0 text-xs text-gray-600">100 mg/kg</div>
                                <div className="absolute -left-8 top-0 text-xs text-gray-600 -rotate-90">Response %</div>
                            </div>

                            {/* Legend */}
                            <div className="mt-4 flex justify-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1 border border-dashed"></div>
                                    <span className="text-xs">Therapeutic</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                                    <span className="text-xs">Toxic</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1 border border-dashed"></div>
                                    <span className="text-xs">Lethal</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={calculateSafety}
                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Calculate Safety Parameters
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Results and Reference Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Safety Analysis Results</h3>

                                <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Therapeutic Index</div>
                                    {td50 ? (
                                        <div className="text-4xl font-bold text-green-400 mb-2">
                                            {result.therapeuticIndex.toFixed(2)}
                                        </div>
                                    ) : (
                                        <div className="text-lg text-gray-500">Enter TD50 to calculate TI</div>
                                    )}
                                    <div className={`text-lg font-bold ${result.color}`}>
                                        {result.classification}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Dose Assessment</div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {result.doseResponse}
                                        </div>
                                        {dose && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Test dose: {dose} mg/kg ({(parseFloat(dose) / parseFloat(ed50)).toFixed(1)}× ED50)
                                            </p>
                                        )}
                                    </div>

                                    {result.riskLevel && (
                                        <div className={`rounded-lg p-4 ${result.color.replace('text', 'bg')} bg-opacity-20`}>
                                            <div className="font-semibold mb-1">Risk Assessment</div>
                                            <p className={`${result.color} font-bold`}>{result.riskLevel}</p>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Safety Parameters</div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <div className="font-bold text-green-600">ED50</div>
                                                <div>{ed50} mg/kg</div>
                                            </div>
                                            {td50 && (
                                                <div>
                                                    <div className="font-bold text-yellow-600">TD50</div>
                                                    <div>{td50} mg/kg</div>
                                                </div>
                                            )}
                                            {ld50 && (
                                                <div>
                                                    <div className="font-bold text-red-600">LD50</div>
                                                    <div>{ld50} mg/kg</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Safety Definitions */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-5 h-5 text-green-400 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Safety Parameter Definitions</h3>
                            </div>

                            <div className="space-y-3">
                                {safetyDefinitions.map((def, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="font-bold text-gray-800">{def.term}</div>
                                            <div className="text-sm text-gray-600">{def.unit}</div>
                                        </div>
                                        <p className="text-sm text-gray-600">{def.definition}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Example Drugs */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Example Drug Safety Data</h3>
                            <div className="space-y-3">
                                {exampleDrugs.map((drug, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setEd50(drug.ED50);
                                            setTd50(drug.TD50);
                                            setLd50(drug.LD50);
                                        }}
                                        className="w-full bg-white rounded-lg p-4 hover:bg-blue-50 transition-colors text-left"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800">{drug.drug}</div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${parseFloat(drug.TI) < 3 ? 'bg-red-100 text-red-800' :
                                                parseFloat(drug.TI) < 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                TI: {drug.TI}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                                            <div>
                                                <div className="font-bold text-green-600">ED50</div>
                                                <div>{drug.ED50}</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-yellow-600">TD50</div>
                                                <div>{drug.TD50}</div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-red-600">LD50</div>
                                                <div>{drug.LD50}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}