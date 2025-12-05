"use client";
import { useState } from 'react';
import { Calculator, Activity, Droplets, Heart, Thermometer, TestTube, AlertCircle, Beaker, FlaskConical as Flask } from 'lucide-react';

type CalculatorType = 'general' | 'serum' | 'urine' | 'plasma' | 'blood';

export default function OsmolalityCalculators() {
    const [calculatorType, setCalculatorType] = useState<CalculatorType>('general');
    const [results, setResults] = useState<any>(null);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Thermometer className="w-10 h-10 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Osmolality Calculator Suite</h1>
                            <p className="text-gray-600">Calculate osmolality for clinical and laboratory applications</p>
                        </div>
                    </div>
                </div>

                {/* Calculator Selection */}
                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Select Calculator Type</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                            { type: 'general', label: 'General Osmolality', icon: Calculator },
                            { type: 'serum', label: 'Serum Osmolality', icon: Activity },
                            { type: 'urine', label: 'Urine Osmolality', icon: Droplets },
                            { type: 'plasma', label: 'Plasma Osmolality', icon: Heart },
                            { type: 'blood', label: 'Blood Osmolality', icon: TestTube },
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
                        {calculatorType === 'general' && <GeneralOsmolalityCalculator setResults={setResults} />}
                        {calculatorType === 'serum' && <SerumOsmolalityCalculator setResults={setResults} />}
                        {calculatorType === 'urine' && <UrineOsmolalityCalculator setResults={setResults} />}
                        {calculatorType === 'plasma' && <PlasmaOsmolalityCalculator setResults={setResults} />}
                        {calculatorType === 'blood' && <BloodOsmolalityCalculator setResults={setResults} />}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {results && (
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>
                                <div className="space-y-4">
                                    {results.osmolality && (
                                        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                            <div className="text-sm font-semibold text-gray-600 mb-2">
                                                Calculated Osmolality
                                            </div>
                                            <div className="text-4xl font-bold text-green-600">
                                                {results.osmolality.toFixed(0)}
                                            </div>
                                            <div className="text-lg font-semibold text-gray-700 mt-2">
                                                mOsm/kg H₂O
                                            </div>
                                            {results.interpretation && (
                                                <div className="mt-4 p-3 rounded-lg bg-blue-50">
                                                    <div className="font-semibold text-blue-800">Clinical Significance:</div>
                                                    <div className="text-lg font-bold text-blue-600">{results.interpretation}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {results.details && (
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-800 mb-2">Additional Details</h4>
                                            <p className="text-sm text-gray-700">{results.details}</p>
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
                                        <p><strong>Osmolality:</strong> Concentration of osmotically active particles per kg of solvent</p>
                                        <p><strong>Units:</strong> mOsm/kg H₂O (milliosmoles per kilogram of water)</p>
                                        <p><strong>Measurement:</strong> Measured by freezing point depression</p>
                                    </>
                                )}
                                {calculatorType === 'serum' && (
                                    <>
                                        <p><strong>Normal range:</strong> 275-295 mOsm/kg H₂O</p>
                                        <p><strong>Clinical use:</strong> Evaluate fluid and electrolyte balance</p>
                                        <p><strong>Critical values:</strong> &lt;260 or &gt;320 mOsm/kg H₂O</p>
                                    </>
                                )}
                                {calculatorType === 'urine' && (
                                    <>
                                        <p><strong>Normal range:</strong> 50-1200 mOsm/kg H₂O</p>
                                        <p><strong>Clinical use:</strong> Assess renal concentrating ability</p>
                                        <p><strong>Water deprivation test:</strong> Should reach &gt;800 mOsm/kg</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Clinical Applications Card */}
                        <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Clinical Applications
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Evaluation of dehydration/hydration status</li>
                                <li>• Assessment of renal function</li>
                                <li>• Diagnosis of SIADH (Syndrome of Inappropriate ADH)</li>
                                <li>• Monitoring diabetes insipidus</li>
                                <li>• Toxic alcohol ingestion detection</li>
                                <li>• Critical care fluid management</li>
                            </ul>
                        </div>

                        {/* Conversion Note */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Important Note</h3>
                            <p className="text-sm text-gray-600">
                                <strong>Osmolality vs Osmolarity:</strong> Osmolality (mOsm/kg H₂O) is measured per kg of solvent,
                                while osmolarity (mOsm/L) is measured per liter of solution. For dilute aqueous solutions,
                                they are numerically similar (~1-3% difference).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reference Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Osmolality Reference Values</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Fluid Type</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Normal Range (mOsm/kg)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clinical Significance</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Common Causes of Abnormalities</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold text-blue-700">Serum/Plasma</td>
                                    <td className="py-3 px-4">275-295</td>
                                    <td className="py-3 px-4">Fluid balance, renal function</td>
                                    <td className="py-3 px-4">Dehydration, diabetes, renal failure</td>
                                    <td className="py-3 px-4">Routine clinical assessment</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-semibold text-green-700">Urine</td>
                                    <td className="py-3 px-4">50-1200</td>
                                    <td className="py-3 px-4">Renal concentrating ability</td>
                                    <td className="py-3 px-4">DI, SIADH, renal tubular disorders</td>
                                    <td className="py-3 px-4">Water deprivation test</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4 font-semibold text-purple-700">Cerebrospinal Fluid</td>
                                    <td className="py-3 px-4">290-305</td>
                                    <td className="py-3 px-4">Blood-brain barrier integrity</td>
                                    <td className="py-3 px-4">Meningitis, CNS disorders</td>
                                    <td className="py-3 px-4">Neurological assessment</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4 font-semibold text-red-700">Ascitic Fluid</td>
                                    <td className="py-3 px-4">Similar to serum</td>
                                    <td className="py-3 px-4">Portal hypertension assessment</td>
                                    <td className="py-3 px-4">Liver cirrhosis, heart failure</td>
                                    <td className="py-3 px-4">Ascites evaluation</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 font-semibold text-yellow-700">Saliva</td>
                                    <td className="py-3 px-4">50-100</td>
                                    <td className="py-3 px-4">Salivary gland function</td>
                                    <td className="py-3 px-4">Sjögren's syndrome, dehydration</td>
                                    <td className="py-3 px-4">Dry mouth assessment</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 1. General Osmolality Calculator
function GeneralOsmolalityCalculator({ setResults }: { setResults: any }) {
    const [solutes, setSolutes] = useState([
        { id: 1, name: 'NaCl', concentration: 150, dissociation: 2 },
        { id: 2, name: 'Glucose', concentration: 5.5, dissociation: 1 },
    ]);
    const [newSolute, setNewSolute] = useState({ name: '', concentration: '', dissociation: '1' });
    const [temperature, setTemperature] = useState<string>('25');

    const calculateOsmolality = () => {
        // Sum of (concentration × dissociation factor)
        let total = 0;
        solutes.forEach(solute => {
            total += solute.concentration * solute.dissociation;
        });

        // Temperature correction factor (approximate)
        const temp = parseFloat(temperature);
        const tempCorrection = 1 + ((temp - 25) * 0.001); // 0.1% per °C

        const osmolality = total * tempCorrection;

        let interpretation = '';
        if (osmolality < 250) interpretation = 'Hypotonic solution';
        else if (osmolality <= 300) interpretation = 'Isotonic (physiological)';
        else interpretation = 'Hypertonic solution';

        setResults({
            osmolality,
            interpretation,
            formula: 'Σ(Concentration × i) × Temperature correction',
            details: `Sum of solute contributions: ${total.toFixed(1)} mOsm/kg × ${tempCorrection.toFixed(3)} (temp correction)`,
            components: solutes.map(s => ({
                name: s.name,
                contribution: (s.concentration * s.dissociation).toFixed(1)
            }))
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

    const commonSolutes = [
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
                General Osmolality Calculator
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
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Concentration (mmol/kg)</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Dissociation (i)</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Contribution (mOsm/kg)</th>
                                    <th className="py-2 px-4 text-left font-semibold text-blue-800">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solutes.map((solute) => (
                                    <tr key={solute.id} className="border-b border-blue-200">
                                        <td className="py-2 px-4">{solute.name}</td>
                                        <td className="py-2 px-4">{solute.concentration}</td>
                                        <td className="py-2 px-4">{solute.dissociation}</td>
                                        <td className="py-2 px-4">{solute.concentration * solute.dissociation}</td>
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

                {/* Add Solute & Temperature */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Add New Solute</h3>
                        <div className="space-y-4">
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Concentration (mmol/kg)</label>
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
                            <button
                                onClick={addSolute}
                                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                            >
                                Add Solute
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Measurement Conditions</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Temperature (°C)
                                </label>
                                <input
                                    type="number"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="25"
                                />
                                <p className="text-xs text-gray-600 mt-2">Standard measurement at 25°C</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">Common Dissociation Factors</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• NaCl: i = 1.85 (practical) or 2 (theoretical)</li>
                                    <li>• KCl: i = 1.85</li>
                                    <li>• CaCl₂: i = 2.5-3</li>
                                    <li>• Glucose: i = 1</li>
                                    <li>• Urea: i = 1</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Solutes */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Biological Solutes</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {commonSolutes.map((solute, idx) => (
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
                                    {solute.concentration} mmol/kg · i={solute.dissociation}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculate Button */}
                <button
                    onClick={calculateOsmolality}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Osmolality
                </button>
            </div>
        </>
    );
}

// 2. Serum Osmolality Calculator
function SerumOsmolalityCalculator({ setResults }: { setResults: any }) {
    const [sodium, setSodium] = useState<string>('140');
    const [glucose, setGlucose] = useState<string>('100');
    const [bun, setBun] = useState<string>('15');
    const [method, setMethod] = useState<'standard' | 'advanced' | 'measured'>('standard');
    const [ethanol, setEthanol] = useState<string>('0');

    const calculateSerumOsmolality = () => {
        const na = parseFloat(sodium);
        const glu = parseFloat(glucose); // mg/dL
        const urea = parseFloat(bun); // mg/dL
        const eth = parseFloat(ethanol); // mg/dL

        let osmolality = 0;
        let formula = '';
        let gap = 0;

        if (method === 'standard') {
            // Standard formula: 2*Na + Glucose/18 + BUN/2.8
            osmolality = (2 * na) + (glu / 18) + (urea / 2.8);
            formula = '2×Na⁺ + Glucose/18 + BUN/2.8';
        } else if (method === 'advanced') {
            // Advanced with ethanol
            osmolality = (2 * na) + (glu / 18) + (urea / 2.8) + (eth / 4.6);
            formula = '2×Na⁺ + Glucose/18 + BUN/2.8 + Ethanol/4.6';
        } else {
            // Using measured values directly
            osmolality = (2 * na) + (glu / 18) + (urea / 2.8);
            formula = 'Measured osmolality (input directly if known)';
        }

        // Calculate osmolar gap
        const calculated = (2 * na) + (glu / 18) + (urea / 2.8);
        gap = osmolality - calculated;

        let interpretation = '';
        if (osmolality < 275) interpretation = 'Hyposmolal - Possible water intoxication, SIADH';
        else if (osmolality <= 295) interpretation = 'Normal serum osmolality';
        else if (osmolality <= 320) interpretation = 'Hyperosmolal - Mild to moderate dehydration';
        else interpretation = 'Severely hyperosmolal - Medical emergency';

        let gapInterpretation = '';
        if (gap < 10) gapInterpretation = 'Normal osmolar gap';
        else if (gap <= 20) gapInterpretation = 'Elevated - consider toxins';
        else gapInterpretation = 'Markedly elevated - toxic alcohol ingestion likely';

        setResults({
            osmolality,
            interpretation,
            formula,
            details: `Osmolar gap: ${gap.toFixed(1)} mOsm/kg (${gapInterpretation})`,
            components: {
                sodium: (2 * na).toFixed(1),
                glucose: (glu / 18).toFixed(1),
                bun: (urea / 2.8).toFixed(1),
                ethanol: eth > 0 ? (eth / 4.6).toFixed(1) : '0',
            }
        });
    };

    const clinicalScenarios = [
        { label: 'Normal', na: '140', glu: '100', bun: '15', eth: '0' },
        { label: 'Hyperglycemia', na: '130', glu: '450', bun: '18', eth: '0' },
        { label: 'Dehydration', na: '155', glu: '120', bun: '30', eth: '0' },
        { label: 'Alcohol Intox', na: '140', glu: '100', bun: '15', eth: '300' },
    ];

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2" />
                Serum Osmolality Calculator
            </h2>

            <div className="space-y-6">
                {/* Method Selection */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setMethod('standard')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'standard' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Standard
                        </button>
                        <button
                            onClick={() => setMethod('advanced')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'advanced' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            With Ethanol
                        </button>
                        <button
                            onClick={() => setMethod('measured')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'measured' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Measured Value
                        </button>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Serum Parameters</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sodium (Na⁺) - mmol/L
                            </label>
                            <input
                                type="number"
                                value={sodium}
                                onChange={(e) => setSodium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="135-145"
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
                                placeholder="70-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                BUN - mg/dL
                            </label>
                            <input
                                type="number"
                                value={bun}
                                onChange={(e) => setBun(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="7-20"
                            />
                        </div>
                        {(method === 'advanced' || method === 'measured') && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ethanol - mg/dL
                                </label>
                                <input
                                    type="number"
                                    value={ethanol}
                                    onChange={(e) => setEthanol(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Clinical Scenarios */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Scenarios</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {clinicalScenarios.map((scenario, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setSodium(scenario.na);
                                    setGlucose(scenario.glu);
                                    setBun(scenario.bun);
                                    setEthanol(scenario.eth);
                                }}
                                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                            >
                                <div className="font-semibold text-blue-600">{scenario.label}</div>
                                <div className="text-xs text-gray-600 mt-2 space-y-1">
                                    <div>Na: {scenario.na} mmol/L</div>
                                    <div>Glu: {scenario.glu} mg/dL</div>
                                    {parseFloat(scenario.eth) > 0 && <div>Ethanol: {scenario.eth} mg/dL</div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={calculateSerumOsmolality}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Serum Osmolality
                </button>
            </div>
        </>
    );
}

// 3. Urine Osmolality Calculator
function UrineOsmolalityCalculator({ setResults }: { setResults: any }) {
    const [method, setMethod] = useState<'electrolytes' | 'specificGravity' | 'measured'>('electrolytes');
    const [sodium, setSodium] = useState<string>('60');
    const [potassium, setPotassium] = useState<string>('40');
    const [urea, setUrea] = useState<string>('400');
    const [specificGravity, setSpecificGravity] = useState<string>('1.015');
    const [glucose, setGlucose] = useState<string>('0');
    const [creatinine, setCreatinine] = useState<string>('100');

    const calculateUrineOsmolality = () => {
        let osmolality = 0;
        let formula = '';
        let interpretation = '';

        if (method === 'electrolytes') {
            const na = parseFloat(sodium);
            const k = parseFloat(potassium);
            const ur = parseFloat(urea);
            const glu = parseFloat(glucose);

            // Approximation: 2(Na+K) + Urea + Glucose
            osmolality = 2 * (na + k) + ur + glu;
            formula = '2×(Na⁺ + K⁺) + Urea + Glucose (all in mmol/L)';
        } else if (method === 'specificGravity') {
            const sg = parseFloat(specificGravity);
            // Approximation formula: (SG - 1) × 40,000
            osmolality = (sg - 1) * 40000;
            formula = '(Specific Gravity - 1) × 40,000';
        } else {
            // Direct input if measured
            osmolality = parseFloat(sodium) * 2; // Using sodium field for direct input
            formula = 'Direct measurement';
        }

        // Interpretation based on osmolality
        if (osmolality < 100) interpretation = 'Very dilute urine - Diabetes insipidus, polydipsia';
        else if (osmolality < 300) interpretation = 'Dilute urine - Normal hydration';
        else if (osmolality < 800) interpretation = 'Concentrated urine - Normal renal function';
        else interpretation = 'Highly concentrated - Dehydration, appropriate ADH response';

        // Calculate urine-to-plasma ratio (requires plasma osmolality input)
        const plasmaOsm = 290; // Assume normal
        const ratio = osmolality / plasmaOsm;

        setResults({
            osmolality,
            interpretation,
            formula,
            details: `Urine-to-plasma ratio: ${ratio.toFixed(1)} (Normal: 1-3, Max concentration: >3)`,
            renalFunction: osmolality > 800 ? 'Normal concentrating ability' : 'Impaired concentrating ability'
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Droplets className="w-6 h-6 mr-2" />
                Urine Osmolality Calculator
            </h2>

            <div className="space-y-6">
                {/* Method Selection */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setMethod('electrolytes')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'electrolytes' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            From Electrolytes
                        </button>
                        <button
                            onClick={() => setMethod('specificGravity')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'specificGravity' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            From Specific Gravity
                        </button>
                        <button
                            onClick={() => setMethod('measured')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'measured' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Direct Input
                        </button>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">
                        {method === 'electrolytes' ? 'Urine Electrolytes (mmol/L)' :
                            method === 'specificGravity' ? 'Urine Specific Gravity' :
                                'Direct Osmolality Input'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {method === 'electrolytes' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Sodium (Na⁺)
                                    </label>
                                    <input
                                        type="number"
                                        value={sodium}
                                        onChange={(e) => setSodium(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="10-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Potassium (K⁺)
                                    </label>
                                    <input
                                        type="number"
                                        value={potassium}
                                        onChange={(e) => setPotassium(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="20-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Urea
                                    </label>
                                    <input
                                        type="number"
                                        value={urea}
                                        onChange={(e) => setUrea(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="200-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Glucose
                                    </label>
                                    <input
                                        type="number"
                                        value={glucose}
                                        onChange={(e) => setGlucose(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </>
                        )}

                        {method === 'specificGravity' && (
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Specific Gravity
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="1.000"
                                    max="1.040"
                                    value={specificGravity}
                                    onChange={(e) => setSpecificGravity(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    placeholder="1.001-1.035"
                                />
                                <p className="text-xs text-gray-600 mt-2">
                                    Normal range: 1.003-1.030 | Concentrated: &gt;1.025 | Dilute: &lt;1.010
                                </p>
                            </div>
                        )}

                        {method === 'measured' && (
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Measured Osmolality (mOsm/kg)
                                </label>
                                <input
                                    type="number"
                                    value={sodium}
                                    onChange={(e) => setSodium(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    placeholder="50-1200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Water Deprivation Test Info */}
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Deprivation Test Reference</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-700 mb-2">Normal Response</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Urine osmolality: &gt;800 mOsm/kg</li>
                                <li>• Urine volume: &lt;0.5 mL/kg/hr</li>
                                <li>• Specific gravity: &gt;1.020</li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold text-red-700 mb-2">Diabetes Insipidus</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Urine osmolality: &lt;300 mOsm/kg</li>
                                <li>• Specific gravity: &lt;1.010</li>
                                <li>• Urine volume: &gt;2 mL/kg/hr</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    onClick={calculateUrineOsmolality}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Urine Osmolality
                </button>
            </div>
        </>
    );
}

// 4. Plasma Osmolality Calculator
function PlasmaOsmolalityCalculator({ setResults }: { setResults: any }) {
    const [sodium, setSodium] = useState<string>('142');
    const [potassium, setPotassium] = useState<string>('4.0');
    const [glucose, setGlucose] = useState<string>('5.5');
    const [urea, setUrea] = useState<string>('5.0');
    const [albumin, setAlbumin] = useState<string>('40');
    const [globulin, setGlobulin] = useState<string>('30');

    const calculatePlasmaOsmolality = () => {
        const na = parseFloat(sodium);
        const k = parseFloat(potassium);
        const glu = parseFloat(glucose); // mmol/L
        const ur = parseFloat(urea); // mmol/L
        const alb = parseFloat(albumin); // g/L
        const glob = parseFloat(globulin); // g/L

        // Standard formula: 2(Na + K) + Glucose + Urea
        let osmolality = 2 * (na + k) + glu + ur;

        // Protein contribution (approximate)
        const proteinContribution = (alb + glob) * 0.08; // Approximation
        osmolality += proteinContribution;

        let interpretation = '';
        if (osmolality < 280) interpretation = 'Hypo-osmolal plasma';
        else if (osmolality <= 300) interpretation = 'Normal plasma osmolality';
        else if (osmolality <= 320) interpretation = 'Mild hyper-osmolality';
        else interpretation = 'Severe hyper-osmolality';

        // Calculate effective osmolality (tonicity)
        const effectiveOsmolality = 2 * (na + k) + glu; // Urea is ineffective osmole

        setResults({
            osmolality,
            interpretation,
            formula: '2×(Na⁺ + K⁺) + Glucose + Urea + Protein contribution',
            details: `Effective osmolality (tonicity): ${effectiveOsmolality.toFixed(1)} mOsm/kg H₂O | Protein contribution: ${proteinContribution.toFixed(1)} mOsm/kg`,
            components: {
                electrolytes: (2 * (na + k)).toFixed(1),
                glucose: glu.toFixed(1),
                urea: ur.toFixed(1),
                proteins: proteinContribution.toFixed(1),
            }
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Heart className="w-6 h-6 mr-2" />
                Plasma Osmolality Calculator
            </h2>

            <div className="space-y-6">
                {/* Electrolytes and Small Molecules */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Plasma Components (mmol/L)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sodium (Na⁺)
                            </label>
                            <input
                                type="number"
                                value={sodium}
                                onChange={(e) => setSodium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="135-145"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Potassium (K⁺)
                            </label>
                            <input
                                type="number"
                                value={potassium}
                                onChange={(e) => setPotassium(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="3.5-5.0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Glucose
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={glucose}
                                onChange={(e) => setGlucose(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="3.9-5.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Urea
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={urea}
                                onChange={(e) => setUrea(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="2.5-6.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Proteins */}
                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Plasma Proteins (g/L)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Albumin
                            </label>
                            <input
                                type="number"
                                value={albumin}
                                onChange={(e) => setAlbumin(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="35-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Globulin
                            </label>
                            <input
                                type="number"
                                value={globulin}
                                onChange={(e) => setGlobulin(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="20-35"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Note: Proteins contribute approximately 0.08 mOsm/kg per g/L
                    </p>
                </div>

                <button
                    onClick={calculatePlasmaOsmolality}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Plasma Osmolality
                </button>
            </div>
        </>
    );
}

// 5. Blood Osmolality Calculator
function BloodOsmolalityCalculator({ setResults }: { setResults: any }) {
    const [hematocrit, setHematocrit] = useState<string>('45');
    const [plasmaOsmolality, setPlasmaOsmolality] = useState<string>('290');
    const [method, setMethod] = useState<'calculated' | 'measured'>('calculated');
    const [cellOsmolality, setCellOsmolality] = useState<string>('285');

    const calculateBloodOsmolality = () => {
        const hct = parseFloat(hematocrit); // percentage
        const plasmaOsm = parseFloat(plasmaOsmolality);
        const cellOsm = parseFloat(cellOsmolality);

        let bloodOsmolality = 0;
        let formula = '';
        let interpretation = '';

        if (method === 'calculated') {
            // Blood osmolality = Plasma osmolality (approximately)
            // But account for hematocrit effect if needed
            bloodOsmolality = plasmaOsm;
            formula = 'Blood osmolality ≈ Plasma osmolality';
        } else {
            // Using measured values with hematocrit correction
            const plasmaFraction = (100 - hct) / 100;
            const cellFraction = hct / 100;
            bloodOsmolality = (plasmaOsm * plasmaFraction) + (cellOsm * cellFraction);
            formula = `(Plasma osm × ${plasmaFraction.toFixed(2)}) + (Cell osm × ${cellFraction.toFixed(2)})`;
        }

        // Calculate transcellular water shift potential
        const osmolarGradient = plasmaOsm - cellOsm;
        let shift = '';
        if (osmolarGradient > 10) shift = 'Water moves from cells to plasma';
        else if (osmolarGradient < -10) shift = 'Water moves from plasma to cells';
        else shift = 'No significant water shift';

        interpretation = `Whole blood osmolality: ${bloodOsmolality.toFixed(1)} mOsm/kg | ${shift}`;

        setResults({
            osmolality: bloodOsmolality,
            interpretation,
            formula,
            details: `Hematocrit: ${hct}% | Osmolar gradient (plasma-cell): ${osmolarGradient.toFixed(1)} mOsm/kg`,
            components: {
                plasma: plasmaOsm,
                cells: cellOsm,
                hematocrit: hct,
            }
        });
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TestTube className="w-6 h-6 mr-2" />
                Blood Osmolality Calculator
            </h2>

            <div className="space-y-6">
                {/* Method Selection */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setMethod('calculated')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'calculated' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Standard Calculation
                        </button>
                        <button
                            onClick={() => setMethod('measured')}
                            className={`p-4 rounded-lg transition-all duration-300 ${method === 'measured' ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            With Hematocrit Correction
                        </button>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Blood Parameters</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Hematocrit (%)
                            </label>
                            <input
                                type="number"
                                value={hematocrit}
                                onChange={(e) => setHematocrit(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="36-46"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plasma Osmolality (mOsm/kg)
                            </label>
                            <input
                                type="number"
                                value={plasmaOsmolality}
                                onChange={(e) => setPlasmaOsmolality(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                                placeholder="275-295"
                            />
                        </div>
                        {method === 'measured' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Cell Osmolality (mOsm/kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={cellOsmolality}
                                        onChange={(e) => setCellOsmolality(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="280-290"
                                    />
                                </div>
                                <div className="col-span-2 bg-white p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>Note:</strong> Cell osmolality is typically slightly lower than plasma osmolality
                                        due to the Donnan effect and cellular impermeant solutes.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Clinical Scenarios */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Clinical Conditions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Normal', hct: '45', plasma: '290', cell: '285' },
                            { label: 'Anemia', hct: '30', plasma: '290', cell: '285' },
                            { label: 'Polycythemia', hct: '55', plasma: '290', cell: '285' },
                            { label: 'Dehydration', hct: '50', plasma: '320', cell: '310' },
                        ].map((condition, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setHematocrit(condition.hct);
                                    setPlasmaOsmolality(condition.plasma);
                                    setCellOsmolality(condition.cell);
                                }}
                                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                            >
                                <div className="font-semibold text-blue-600">{condition.label}</div>
                                <div className="text-xs text-gray-600 mt-2">
                                    Hct: {condition.hct}% | Plasma: {condition.plasma} | Cells: {condition.cell}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={calculateBloodOsmolality}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                    Calculate Blood Osmolality
                </button>
            </div>
        </>
    );
}