"use client";
import { useState, useEffect } from 'react';
import { Calculator, Droplets, Activity, Syringe, Heart, Beaker, TestTube, AlertCircle, Thermometer } from 'lucide-react';

type CalculatorType = 'general' | 'serum' | 'plasma' | 'iv' | 'tpn' | 'buffer';

type Solute = {
    id: number;
    name: string;
    concentration: number;
    dissociation: number;
};

export default function OsmolarityCalculators() {
    const [calculatorType, setCalculatorType] = useState<CalculatorType>('general');
    const [results, setResults] = useState<any>(null);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-0 mt-5">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Droplets className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-white">Osmolarity Calculator Suite</h1>
                            <p className="text-white">Calculate osmolarity for various biological and pharmaceutical solutions</p>
                        </div>
                    </div>
                </div>

                {/* Calculator Selection */}
                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Select Calculator Type</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { type: 'general', label: 'General Osmolarity', icon: Calculator },
                            { type: 'serum', label: 'Serum Osmolarity', icon: Activity },
                            { type: 'plasma', label: 'Plasma Osmolarity', icon: Heart },
                            { type: 'iv', label: 'IV Fluid Osmolarity', icon: Syringe },
                            { type: 'tpn', label: 'TPN Osmolarity', icon: Beaker },
                            { type: 'buffer', label: 'Buffer Osmolarity', icon: TestTube },
                        ].map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={() => setCalculatorType(type as CalculatorType)}
                                className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${calculatorType === type
                                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon className="w-6 h-6 mb-2" />
                                <span className="text-sm font-semibold text-center">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculator Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        {calculatorType === 'general' && <GeneralOsmolarityCalculator setResults={setResults} />}
                        {calculatorType === 'serum' && <SerumOsmolarityCalculator setResults={setResults} />}
                        {calculatorType === 'plasma' && <PlasmaOsmolarityCalculator setResults={setResults} />}
                        {calculatorType === 'iv' && <IVFluidOsmolarityCalculator setResults={setResults} />}
                        {calculatorType === 'tpn' && <TPNOsmolarityCalculator setResults={setResults} />}
                        {calculatorType === 'buffer' && <BufferOsmolarityCalculator setResults={setResults} />}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {results && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>
                                <div className="space-y-4">
                                    {results.osmolarity && (
                                        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                            <div className="text-sm font-semibold text-gray-600 mb-2">
                                                Calculated Osmolarity
                                            </div>
                                            <div className="text-4xl font-bold text-green-600">
                                                {results.osmolarity.toFixed(0)}
                                            </div>
                                            <div className="text-lg font-semibold text-gray-700 mt-2">
                                                mOsm/L
                                            </div>
                                            {results.tonicity && (
                                                <div className="mt-4 p-3 rounded-lg bg-blue-50">
                                                    <div className="font-semibold text-blue-800">Tonicity:</div>
                                                    <div className="text-lg font-bold text-blue-600">{results.tonicity}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {results.interpretation && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 mb-2">Interpretation</h4>
                                            <p className="text-sm text-gray-700">{results.interpretation}</p>
                                        </div>
                                    )}

                                    {results.formula && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 mb-2">Formula Used</h4>
                                            <div className="text-center text-sm font-mono bg-gray-50 p-3 rounded">
                                                {results.formula}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                {calculatorType.charAt(0).toUpperCase() + calculatorType.slice(1)} Calculator Info
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                {calculatorType === 'general' && (
                                    <>
                                        <p><strong>Osmolarity:</strong> Total concentration of osmotically active particles</p>
                                        <p><strong>Formula:</strong> Σ(C × i) where C is concentration and i is dissociation factor</p>
                                        <p><strong>Units:</strong> mOsm/L (milliosmoles per liter)</p>
                                    </>
                                )}
                                {calculatorType === 'serum' && (
                                    <>
                                        <p><strong>Normal range:</strong> 275-295 mOsm/L</p>
                                        <p><strong>Critical values:</strong> &lt;260 or &gt;320 mOsm/L</p>
                                        <p><strong>Clinical use:</strong> Evaluate fluid balance and renal function</p>
                                    </>
                                )}
                                {calculatorType === 'iv' && (
                                    <>
                                        <p><strong>Isotonic:</strong> 250-375 mOsm/L (matches blood)</p>
                                        <p><strong>Hypotonic:</strong> &lt;250 mOsm/L (causes hemolysis)</p>
                                        <p><strong>Hypertonic:</strong> &gt;375 mOsm/L (causes dehydration)</p>
                                    </>
                                )}
                                {calculatorType === 'tpn' && (
                                    <>
                                        <p><strong>Peripheral TPN:</strong> &lt;900 mOsm/L</p>
                                        <p><strong>Central TPN:</strong> Up to 1800 mOsm/L</p>
                                        <p><strong>Critical:</strong> Monitor for phlebitis and thrombosis</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Applications Card */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Clinical Applications
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Fluid therapy planning</li>
                                <li>• TPN formulation</li>
                                <li>• IV compatibility checking</li>
                                <li>• Renal function assessment</li>
                                <li>• Electrolyte balance monitoring</li>
                                <li>• Pharmaceutical formulation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Reference Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Osmolarity Reference Values</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Solution/Fluid</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Osmolarity (mOsm/L)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Tonicity</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">pH</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clinical Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Normal Saline (0.9% NaCl)</td>
                                    <td className="py-3 px-4">308</td>
                                    <td className="py-3 px-4">Isotonic</td>
                                    <td className="py-3 px-4">5.5</td>
                                    <td className="py-3 px-4">Fluid resuscitation</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Lactated Ringer's</td>
                                    <td className="py-3 px-4">273</td>
                                    <td className="py-3 px-4">Isotonic</td>
                                    <td className="py-3 px-4">6.5</td>
                                    <td className="py-3 px-4">Surgery, burns</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">D5W (5% Dextrose)</td>
                                    <td className="py-3 px-4">252</td>
                                    <td className="py-3 px-4">Isotonic (initially)</td>
                                    <td className="py-3 px-4">4.0</td>
                                    <td className="py-3 px-4">Free water replacement</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">TPN Standard</td>
                                    <td className="py-3 px-4">1200-1800</td>
                                    <td className="py-3 px-4">Hypertonic</td>
                                    <td className="py-3 px-4">5.5-6.5</td>
                                    <td className="py-3 px-4">Nutrition support</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">Human Plasma</td>
                                    <td className="py-3 px-4">275-295</td>
                                    <td className="py-3 px-4">-</td>
                                    <td className="py-3 px-4">7.35-7.45</td>
                                    <td className="py-3 px-4">Physiological reference</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 1. General Osmolarity Calculator
function GeneralOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [solutes, setSolutes] = useState<Solute[]>([
        { id: 1, name: 'NaCl', concentration: 150, dissociation: 2 },
        { id: 2, name: 'Glucose', concentration: 5.5, dissociation: 1 },
    ]);
    const [newSolute, setNewSolute] = useState({ name: '', concentration: '', dissociation: '1' });

    const calculateOsmolarity = () => {
        let totalOsmolarity = 0;
        solutes.forEach(solute => {
            totalOsmolarity += solute.concentration * solute.dissociation;
        });

        let tonicity = 'Isotonic';
        if (totalOsmolarity < 250) tonicity = 'Hypotonic';
        else if (totalOsmolarity > 375) tonicity = 'Hypertonic';

        setResults({
            osmolarity: totalOsmolarity,
            tonicity,
            interpretation: tonicity === 'Isotonic'
                ? 'Solution matches physiological osmolarity'
                : tonicity === 'Hypotonic'
                    ? 'May cause hemolysis in red blood cells'
                    : 'May cause cellular dehydration',
            formula: 'Osmolarity = Σ(Concentration × Dissociation factor)'
        });
    };

    const addSolute = () => {
        if (!newSolute.name || !newSolute.concentration) return;

        const newId = Math.max(...solutes.map(s => s.id)) + 1;
        setSolutes([
            ...solutes,
            {
                id: newId,
                name: newSolute.name,
                concentration: parseFloat(newSolute.concentration),
                dissociation: parseFloat(newSolute.dissociation),
            }
        ]);
        setNewSolute({ name: '', concentration: '', dissociation: '1' });
    };

    const removeSolute = (id: number) => {
        setSolutes(solutes.filter(s => s.id !== id));
    };

    const sampleSolutes = [
        { name: 'NaCl', concentration: '154', dissociation: '2' },
        { name: 'KCl', concentration: '5', dissociation: '2' },
        { name: 'CaCl₂', concentration: '2.5', dissociation: '3' },
        { name: 'Glucose', concentration: '5.5', dissociation: '1' },
        { name: 'Urea', concentration: '5', dissociation: '1' },
    ];

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2" />
                General Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                {/* Solutes Table */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Solutes in Solution</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Solute</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Concentration (mmol/L)</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Dissociation (i)</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Contribution</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solutes.map((solute) => (
                                    <tr key={solute.id} className="border-b border-blue-200">
                                        <td className="py-2 px-4">{solute.name}</td>
                                        <td className="py-2 px-4">{solute.concentration}</td>
                                        <td className="py-2 px-4">{solute.dissociation}</td>
                                        <td className="py-2 px-4">{solute.concentration * solute.dissociation} mOsm/L</td>
                                        <td className="py-2 px-4">
                                            <button
                                                onClick={() => removeSolute(solute.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add New Solute */}
                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Add New Solute</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Solute Name</label>
                            <input
                                type="text"
                                value={newSolute.name}
                                onChange={(e) => setNewSolute({ ...newSolute, name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., NaCl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Concentration (mmol/L)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={newSolute.concentration}
                                onChange={(e) => setNewSolute({ ...newSolute, concentration: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., 150"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dissociation Factor (i)</label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                max="5"
                                value={newSolute.dissociation}
                                onChange={(e) => setNewSolute({ ...newSolute, dissociation: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="1-5"
                            />
                        </div>
                    </div>
                    <button
                        onClick={addSolute}
                        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                    >
                        Add Solute
                    </button>
                </div>

                {/* Sample Solutes */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Solutes</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {sampleSolutes.map((solute, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    const newId = Math.max(...solutes.map(s => s.id)) + 1;
                                    setSolutes([
                                        ...solutes,
                                        {
                                            id: newId,
                                            name: solute.name,
                                            concentration: parseFloat(solute.concentration),
                                            dissociation: parseFloat(solute.dissociation),
                                        }
                                    ]);
                                }}
                                className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-blue-50 transition-colors text-center"
                            >
                                <div className="font-semibold text-blue-600">{solute.name}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {solute.concentration} mM · i={solute.dissociation}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculate Button */}
                <button
                    onClick={calculateOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Osmolarity
                </button>
            </div>
        </>
    );
}

// 2. Serum Osmolarity Calculator
function SerumOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [sodium, setSodium] = useState<string>('140');
    const [glucose, setGlucose] = useState<string>('100');
    const [bun, setBun] = useState<string>('15');
    const [method, setMethod] = useState<'standard' | 'advanced'>('standard');

    const calculateSerumOsmolarity = () => {
        const na = parseFloat(sodium);
        const glu = parseFloat(glucose);
        const urea = parseFloat(bun);

        let osmolarity = 0;
        let formula = '';

        if (method === 'standard') {
            // Standard formula: 2*Na + Glucose/18 + BUN/2.8
            osmolarity = (2 * na) + (glu / 18) + (urea / 2.8);
            formula = '2×Na + Glucose/18 + BUN/2.8';
        } else {
            // Advanced formula with ethanol
            osmolarity = (2 * na) + (glu / 18) + (urea / 2.8);
            formula = '2×Na + Glucose/18 + BUN/2.8 + Ethanol/4.6';
        }

        let interpretation = '';
        if (osmolarity < 275) interpretation = 'Hypotonic - Possible water intoxication';
        else if (osmolarity <= 295) interpretation = 'Normal serum osmolarity';
        else if (osmolarity <= 320) interpretation = 'Hypertonic - Mild dehydration';
        else interpretation = 'Severely hypertonic - Critical condition';

        const osmolarGap = osmolarity - (2 * na + glu / 18 + urea / 2.8);
        let gapInterpretation = '';
        if (osmolarGap < 10) gapInterpretation = 'Normal osmolar gap';
        else if (osmolarGap <= 20) gapInterpretation = 'Moderately elevated - possible toxins';
        else gapInterpretation = 'Markedly elevated - toxic alcohols likely';

        setResults({
            osmolarity,
            interpretation: `${interpretation}. ${gapInterpretation}`,
            formula,
            osmolarGap: osmolarGap.toFixed(1),
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2" />
                Serum Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                {/* Method Selection */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setMethod('standard')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'standard' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Standard Formula
                        </button>
                        <button
                            onClick={() => setMethod('advanced')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'advanced' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Advanced (with Ethanol)
                        </button>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Serum Parameters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sodium (Na⁺) - mmol/L
                            </label>
                            <input
                                type="number"
                                value={sodium}
                                onChange={(e) => setSodium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Normal: 135-145"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Glucose - mg/dL
                            </label>
                            <input
                                type="number"
                                value={glucose}
                                onChange={(e) => setGlucose(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="Normal: 70-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                BUN (Blood Urea Nitrogen) - mg/dL
                            </label>
                            <input
                                type="number"
                                value={bun}
                                onChange={(e) => setBun(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Normal: 7-20"
                            />
                        </div>
                        {method === 'advanced' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ethanol - mg/dL (Optional)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="If applicable"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sample Values */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Scenarios</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Normal', na: '140', glu: '100', bun: '15' },
                            { label: 'Hyperglycemia', na: '130', glu: '450', bun: '18' },
                            { label: 'Dehydration', na: '155', glu: '120', bun: '30' },
                        ].map((scenario, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSodium(scenario.na);
                                    setGlucose(scenario.glu);
                                    setBun(scenario.bun);
                                }}
                                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                            >
                                <div className="font-semibold text-blue-600">{scenario.label}</div>
                                <div className="text-xs text-gray-600 mt-2">
                                    Na: {scenario.na} | Glu: {scenario.glu} | BUN: {scenario.bun}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={calculateSerumOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Serum Osmolarity
                </button>
            </div>
        </>
    );
}

// 3. Plasma Osmolarity Calculator
function PlasmaOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [sodium, setSodium] = useState<string>('142');
    const [potassium, setPotassium] = useState<string>('4.0');
    const [glucose, setGlucose] = useState<string>('5.5');
    const [urea, setUrea] = useState<string>('5.0');

    const calculatePlasmaOsmolarity = () => {
        const na = parseFloat(sodium);
        const k = parseFloat(potassium);
        const glu = parseFloat(glucose); // in mmol/L
        const ur = parseFloat(urea); // in mmol/L

        // Plasma formula: 2(Na + K) + Glucose + Urea
        const osmolarity = 2 * (na + k) + glu + ur;

        let interpretation = '';
        if (osmolarity < 280) interpretation = 'Hypo-osmolar - Consider SIADH, water intoxication';
        else if (osmolarity <= 300) interpretation = 'Normal plasma osmolarity';
        else if (osmolarity <= 320) interpretation = 'Mild hyper-osmolarity - Monitor hydration';
        else interpretation = 'Severe hyper-osmolarity - Requires immediate attention';

        setResults({
            osmolarity,
            interpretation,
            formula: '2×(Na⁺ + K⁺) + Glucose + Urea',
            components: {
                electrolytes: 2 * (na + k),
                glucose: glu,
                urea: ur,
            }
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2" />
                Plasma Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Plasma Parameters (mmol/L)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sodium (Na⁺)</label>
                            <input
                                type="number"
                                value={sodium}
                                onChange={(e) => setSodium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="135-145"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Potassium (K⁺)</label>
                            <input
                                type="number"
                                value={potassium}
                                onChange={(e) => setPotassium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="3.5-5.0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Glucose</label>
                            <input
                                type="number"
                                value={glucose}
                                onChange={(e) => setGlucose(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="3.9-5.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Urea</label>
                            <input
                                type="number"
                                value={urea}
                                onChange={(e) => setUrea(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="2.5-6.5"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={calculatePlasmaOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Plasma Osmolarity
                </button>
            </div>
        </>
    );
}

// 4. IV Fluid Osmolarity Calculator
function IVFluidOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [selectedFluid, setSelectedFluid] = useState<string>('ns');
    const [customNaCl, setCustomNaCl] = useState<string>('0.9');
    const [customDextrose, setCustomDextrose] = useState<string>('0');

    const fluids = [
        { id: 'ns', name: 'Normal Saline (0.9% NaCl)', osmolarity: 308 },
        { id: 'halfns', name: 'Half Normal Saline (0.45% NaCl)', osmolarity: 154 },
        { id: 'd5w', name: 'D5W (5% Dextrose)', osmolarity: 252 },
        { id: 'lr', name: "Lactated Ringer's", osmolarity: 273 },
        { id: 'd5ns', name: 'D5 Normal Saline', osmolarity: 560 },
        { id: 'custom', name: 'Custom Fluid', osmolarity: 0 },
    ];

    const calculateIVOsmolarity = () => {
        let osmolarity = 0;
        let formula = '';
        let interpretation = '';

        if (selectedFluid === 'custom') {
            const nacl = parseFloat(customNaCl);
            const dextrose = parseFloat(customDextrose);

            // NaCl: 0.9% = 154 mmol/L = 308 mOsm/L
            // Dextrose: 5% = 278 mmol/L = 278 mOsm/L
            osmolarity = (nacl / 0.9) * 308 + (dextrose / 5) * 278;
            formula = `(${customNaCl}% NaCl × 308) + (${customDextrose}% Dextrose × 278)`;
        } else {
            const fluid = fluids.find(f => f.id === selectedFluid);
            osmolarity = fluid?.osmolarity || 0;
            formula = 'Pre-calculated value';
        }

        if (osmolarity < 250) {
            interpretation = 'Hypotonic - May cause hemolysis if given rapidly';
        } else if (osmolarity <= 375) {
            interpretation = 'Isotonic - Safe for peripheral administration';
        } else if (osmolarity <= 900) {
            interpretation = 'Moderately hypertonic - Consider central line';
        } else {
            interpretation = 'Highly hypertonic - Requires central line';
        }

        setResults({
            osmolarity,
            interpretation,
            formula,
            tonicity: osmolarity < 250 ? 'Hypotonic' : osmolarity <= 375 ? 'Isotonic' : 'Hypertonic',
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Syringe className="w-6 h-6 mr-2" />
                IV Fluid Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                {/* Fluid Selection */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Select IV Fluid</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {fluids.map((fluid) => (
                            <button
                                key={fluid.id}
                                onClick={() => setSelectedFluid(fluid.id)}
                                className={`p-4 rounded-lg transition-all duration-300 ${selectedFluid === fluid.id ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
                            >
                                <div className="font-semibold">{fluid.name}</div>
                                {fluid.osmolarity > 0 && (
                                    <div className="text-sm mt-1">{fluid.osmolarity} mOsm/L</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Fluid Inputs */}
                {selectedFluid === 'custom' && (
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Custom Fluid Composition</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    NaCl Concentration (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={customNaCl}
                                    onChange={(e) => setCustomNaCl(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 0.9"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Dextrose Concentration (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={customDextrose}
                                    onChange={(e) => setCustomDextrose(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={calculateIVOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate IV Fluid Osmolarity
                </button>
            </div>
        </>
    );
}

// 5. TPN Osmolarity Calculator
function TPNOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [aminoAcids, setAminoAcids] = useState<string>('40');
    const [dextrose, setDextrose] = useState<string>('15');
    const [lipids, setLipids] = useState<string>('20');
    const [electrolytes, setElectrolytes] = useState({
        na: '40',
        k: '30',
        ca: '4.5',
        mg: '5',
        po4: '15',
    });

    const calculateTPNOsmolarity = () => {
        const aa = parseFloat(aminoAcids);
        const dex = parseFloat(dextrose);
        const lip = parseFloat(lipids);
        const na = parseFloat(electrolytes.na);
        const k = parseFloat(electrolytes.k);
        const ca = parseFloat(electrolytes.ca);
        const mg = parseFloat(electrolytes.mg);
        const po4 = parseFloat(electrolytes.po4);

        // Approximation formulas for TPN components
        const aaOsm = aa * 100; // ~100 mOsm/L per 1% AA
        const dexOsm = dex * 50; // ~50 mOsm/L per 1% dextrose
        const lipidOsm = lip * 20; // ~20 mOsm/L per 1% lipid
        const electrolyteOsm = (na + k) * 2 + ca * 3 + mg * 2 + po4 * 4;

        const totalOsmolarity = aaOsm + dexOsm + lipidOsm + electrolyteOsm;

        let route = '';
        if (totalOsmolarity < 900) {
            route = 'Suitable for peripheral administration';
        } else if (totalOsmolarity < 1200) {
            route = 'Borderline - Consider central line';
        } else {
            route = 'Requires central venous access';
        }

        setResults({
            osmolarity: totalOsmolarity,
            interpretation: route,
            formula: 'Amino Acids × 100 + Dextrose × 50 + Lipids × 20 + Electrolytes',
            components: {
                aminoAcids: aaOsm,
                dextrose: dexOsm,
                lipids: lipidOsm,
                electrolytes: electrolyteOsm,
            }
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Beaker className="w-6 h-6 mr-2" />
                TPN Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                {/* Macronutrients */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Macronutrients (g/L)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Amino Acids</label>
                            <input
                                type="number"
                                value={aminoAcids}
                                onChange={(e) => setAminoAcids(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., 40"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dextrose</label>
                            <input
                                type="number"
                                value={dextrose}
                                onChange={(e) => setDextrose(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="e.g., 15"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Lipids</label>
                            <input
                                type="number"
                                value={lipids}
                                onChange={(e) => setLipids(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., 20"
                            />
                        </div>
                    </div>
                </div>

                {/* Electrolytes */}
                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Electrolytes (mmol/L)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(electrolytes).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {key.toUpperCase()}
                                </label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setElectrolytes({ ...electrolytes, [key]: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder={`e.g., ${value}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sample Formulations */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample TPN Formulations</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Peripheral TPN', aa: '20', dex: '10', lip: '20' },
                            { label: 'Standard Central TPN', aa: '40', dex: '25', lip: '20' },
                            { label: 'High Protein', aa: '60', dex: '20', lip: '20' },
                            { label: 'Renal Formula', aa: '35', dex: '35', lip: '20' },
                        ].map((formula, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setAminoAcids(formula.aa);
                                    setDextrose(formula.dex);
                                    setLipids(formula.lip);
                                }}
                                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                            >
                                <div className="font-semibold text-blue-600">{formula.label}</div>
                                <div className="text-xs text-gray-600 mt-2">
                                    AA: {formula.aa}g · Dex: {formula.dex}g · Lipids: {formula.lip}g
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={calculateTPNOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate TPN Osmolarity
                </button>
            </div>
        </>
    );
}

// 6. Buffer Osmolarity Calculator
function BufferOsmolarityCalculator({ setResults }: { setResults: any }) {
    const [bufferType, setBufferType] = useState<string>('pbs');
    const [concentration, setConcentration] = useState<string>('1');
    const [pH, setPH] = useState<string>('7.4');

    const buffers = [
        { id: 'pbs', name: 'Phosphate Buffered Saline', baseOsmolarity: 290 },
        { id: 'tris', name: 'Tris Buffer', baseOsmolarity: 250 },
        { id: 'hepes', name: 'HEPES Buffer', baseOsmolarity: 280 },
        { id: 'acetate', name: 'Acetate Buffer', baseOsmolarity: 270 },
        { id: 'carbonate', name: 'Carbonate Buffer', baseOsmolarity: 300 },
        { id: 'custom', name: 'Custom Buffer', baseOsmolarity: 0 },
    ];

    const calculateBufferOsmolarity = () => {
        const conc = parseFloat(concentration);
        const pHValue = parseFloat(pH);

        let osmolarity = 0;
        let formula = '';

        const buffer = buffers.find(b => b.id === bufferType);
        if (buffer && buffer.id !== 'custom') {
            osmolarity = buffer.baseOsmolarity * conc;
            formula = `Base osmolarity (${buffer.baseOsmolarity} mOsm/L) × Concentration`;
        } else {
            // Custom buffer approximation
            osmolarity = 300 * conc; // Approximation
            formula = 'Estimated 300 mOsm/L × Concentration';
        }

        // Adjust for pH (approximation)
        const pHAdjustment = Math.abs(pHValue - 7.4) * 10;
        osmolarity += pHAdjustment;

        let interpretation = '';
        if (osmolarity < 250) interpretation = 'Hypotonic buffer - May affect cell volume';
        else if (osmolarity <= 350) interpretation = 'Physiological buffer - Suitable for most applications';
        else interpretation = 'Hypertonic buffer - Use with caution for cell work';

        setResults({
            osmolarity,
            interpretation,
            formula,
            pH: pHValue,
            recommendedUse: bufferType === 'pbs' ? 'Cell culture, immunohistochemistry' :
                bufferType === 'tris' ? 'DNA/RNA work, protein assays' :
                    bufferType === 'hepes' ? 'Cell culture, enzyme assays' :
                        'General laboratory use',
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TestTube className="w-6 h-6 mr-2" />
                Buffer Osmolarity Calculator
            </h2>

            <div className="space-y-6">
                {/* Buffer Selection */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Select Buffer Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {buffers.map((buffer) => (
                            <button
                                key={buffer.id}
                                onClick={() => setBufferType(buffer.id)}
                                className={`p-4 rounded-lg transition-all duration-300 ${bufferType === buffer.id ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
                            >
                                <div className="font-semibold">{buffer.name}</div>
                                {buffer.baseOsmolarity > 0 && (
                                    <div className="text-sm mt-1">~{buffer.baseOsmolarity} mOsm/L (1×)</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Buffer Parameters */}
                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Buffer Parameters</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Concentration (×)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={concentration}
                                onChange={(e) => setConcentration(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                pH
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="1"
                                max="14"
                                value={pH}
                                onChange={(e) => setPH(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="e.g., 7.4"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={calculateBufferOsmolarity}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Buffer Osmolarity
                </button>
            </div>
        </>
    );
}