"use client";
import { useState } from 'react';
import { Calculator, Activity, Heart, Brain, AlertCircle } from 'lucide-react';

export default function VolumeDistributionCalculator() {
    const [dose, setDose] = useState<string>('');
    const [concentration, setConcentration] = useState<string>('');
    const [patientWeight, setPatientWeight] = useState<string>('');
    const [result, setResult] = useState<{
        vd: number;
        vdPerKg: number;
        interpretation: string;
        distributionType: string;
        clinicalSignificance: string;
    } | null>(null);

    const calculateVd = () => {
        const D = parseFloat(dose);
        const Cp = parseFloat(concentration);
        const W = patientWeight ? parseFloat(patientWeight) : 70; // Default 70kg if not provided

        if (isNaN(D) || isNaN(Cp) || D <= 0 || Cp <= 0) {
            alert('Please enter valid positive numbers for dose and concentration');
            return;
        }

        // Calculate Volume of Distribution
        const vd = D / Cp;
        const vdPerKg = vd / W;

        // Interpretation
        let interpretation = '';
        let distributionType = '';
        let clinicalSignificance = '';

        if (vdPerKg < 0.1) {
            interpretation = 'Confined to plasma compartment';
            distributionType = 'Plasma Volume';
            clinicalSignificance = 'Drug stays primarily in blood, minimal tissue distribution';
        } else if (vdPerKg >= 0.1 && vdPerKg < 0.3) {
            interpretation = 'Distributed in extracellular fluid';
            distributionType = 'Extracellular Fluid';
            clinicalSignificance = 'Moderate tissue distribution, limited intracellular penetration';
        } else if (vdPerKg >= 0.3 && vdPerKg < 0.7) {
            interpretation = 'Distributed in total body water';
            distributionType = 'Total Body Water';
            clinicalSignificance = 'Good tissue distribution throughout body water compartments';
        } else if (vdPerKg >= 0.7 && vdPerKg < 2) {
            interpretation = 'Moderate tissue binding';
            distributionType = 'Tissue Binding';
            clinicalSignificance = 'Significant tissue binding, longer half-life expected';
        } else if (vdPerKg >= 2 && vdPerKg < 10) {
            interpretation = 'Extensive tissue binding';
            distributionType = 'Extensive Distribution';
            clinicalSignificance = 'High tissue affinity, very long half-life, accumulates in tissues';
        } else {
            interpretation = 'Extreme tissue binding and accumulation';
            distributionType = 'Extreme Distribution';
            clinicalSignificance = 'Very high tissue affinity, potential for long-term accumulation';
        }

        setResult({
            vd,
            vdPerKg,
            interpretation,
            distributionType,
            clinicalSignificance
        });
    };

    const resetCalculator = () => {
        setDose('');
        setConcentration('');
        setPatientWeight('');
        setResult(null);
    };

    const sampleDrugs = [
        { name: 'Warfarin', vd: 0.14, dose: '5', conc: '1.5' },
        { name: 'Gentamicin', vd: 0.25, dose: '5', conc: '8' },
        { name: 'Theophylline', vd: 0.5, dose: '400', conc: '10' },
        { name: 'Digoxin', vd: 7, dose: '0.5', conc: '1' },
        { name: 'Chloroquine', vd: 200, dose: '500', conc: '0.05' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <Activity className="w-10 h-10 text-red-600 mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Volume of Distribution (Vd) Calculator</h1>
                            <p className="text-gray-600">Calculate apparent volume of distribution for pharmacokinetic analysis</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <Calculator className="w-6 h-6 mr-2" />
                            Enter Pharmacokinetic Parameters
                        </h2>

                        <div className="space-y-6">
                            {/* Dose Input */}
                            <div className="bg-red-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-red-800 mb-3">
                                    Dose Administered (mg)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={dose}
                                    onChange={(e) => setDose(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                                    placeholder="e.g., 500"
                                />
                                <p className="text-sm text-gray-600 mt-2">Total dose administered intravenously</p>
                            </div>

                            {/* Concentration Input */}
                            <div className="bg-orange-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-orange-800 mb-3">
                                    Plasma Concentration (mg/L)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={concentration}
                                    onChange={(e) => setConcentration(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                    placeholder="e.g., 10"
                                />
                                <p className="text-sm text-gray-600 mt-2">Measured at time zero (C₀) after IV bolus</p>
                            </div>

                            {/* Patient Weight Input */}
                            <div className="bg-yellow-50 rounded-lg p-6">
                                <label className="block text-lg font-semibold text-yellow-800 mb-3">
                                    Patient Body Weight (kg) - Optional
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={patientWeight}
                                    onChange={(e) => setPatientWeight(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                                    placeholder="e.g., 70"
                                />
                                <p className="text-sm text-gray-600 mt-2">For Vd per kg calculation (default: 70 kg)</p>
                            </div>

                            {/* Sample Drugs */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Example Drugs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {sampleDrugs.map((drug, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setDose(drug.dose);
                                                setConcentration(drug.conc);
                                            }}
                                            className="bg-white border border-gray-300 rounded-lg p-3 hover:bg-red-50 transition-colors text-center"
                                        >
                                            <div className="font-semibold text-blue-600">{drug.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                Vd: {drug.vd} L/kg
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={calculateVd}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Calculate Vd
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
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-400 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Volume of Distribution Results</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">Volume of Distribution (Vd)</div>
                                        <div className="text-3xl font-bold text-red-600">
                                            {result.vd.toFixed(2)} L
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            ({result.vdPerKg.toFixed(3)} L/kg)
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="font-semibold text-gray-800 mb-2">Distribution Type</h4>
                                        <div className="text-lg font-semibold text-blue-600">
                                            {result.distributionType}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{result.interpretation}</p>
                                    </div>

                                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Clinical Significance</h4>
                                        <p className="text-sm text-gray-700">{result.clinicalSignificance}</p>
                                    </div>

                                    {/* Distribution Visualization */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-800 mb-3">Distribution Pattern</h4>
                                        <div className="flex items-center justify-center space-x-4">
                                            <div className="text-center">
                                                <Heart className="w-8 h-8 text-red-500 mx-auto mb-1" />
                                                <div className={`w-10 h-10 rounded-full ${result.vdPerKg < 0.3 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                                                <div className="text-xs mt-1">Plasma</div>
                                            </div>
                                            <div className="text-center">
                                                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                                                <div className={`w-12 h-12 rounded-full ${result.vdPerKg >= 0.3 && result.vdPerKg < 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                                                <div className="text-xs mt-1">Tissues</div>
                                            </div>
                                            <div className="text-center">
                                                <Brain className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                                                <div className={`w-14 h-14 rounded-full ${result.vdPerKg >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                                                <div className="text-xs mt-1">Deep Tissues</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formula</h3>
                            <div className="text-center text-xl font-mono bg-gray-50 p-4 rounded-lg">
                                Vd = Dose / C₀
                            </div>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>Where:</p>
                                <p>Vd = Volume of Distribution (L)</p>
                                <p>Dose = Administered dose (mg)</p>
                                <p>C₀ = Initial plasma concentration (mg/L)</p>
                            </div>
                        </div>

                        {/* Interpretation Guide */}
                        <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Vd Interpretation Guide</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Vd &lt; 0.1 L/kg</span>
                                    <span className="font-semibold text-red-600">Plasma only</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>0.1-0.3 L/kg</span>
                                    <span className="font-semibold text-orange-600">Extracellular</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>0.3-0.7 L/kg</span>
                                    <span className="font-semibold text-yellow-600">Body water</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>0.7-2 L/kg</span>
                                    <span className="font-semibold text-green-600">Tissue binding</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>&gt;2 L/kg</span>
                                    <span className="font-semibold text-purple-600">Extensive binding</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Applications */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Clinical Applications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-red-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                                <Heart className="w-5 h-5 mr-2" />
                                Dosing Adjustment
                            </h3>
                            <p className="text-sm text-gray-600">Helps determine loading doses and maintenance doses based on distribution characteristics.</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Toxicity Prediction
                            </h3>
                            <p className="text-sm text-gray-600">High Vd drugs may accumulate in tissues, leading to potential toxicity with repeated dosing.</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Elimination Half-life
                            </h3>
                            <p className="text-sm text-gray-600">Vd combined with clearance determines elimination half-life: t₁/₂ = 0.693 × Vd / CL</p>
                        </div>
                    </div>
                </div>

                {/* Drug Examples Table */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Volume of Distribution Examples</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-red-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Drug</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Vd (L/kg)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Compartment</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Clinical Significance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Warfarin</td>
                                    <td className="py-3 px-4">0.14</td>
                                    <td className="py-3 px-4">Plasma</td>
                                    <td className="py-3 px-4">Highly protein bound, minimal tissue distribution</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Gentamicin</td>
                                    <td className="py-3 px-4">0.25</td>
                                    <td className="py-3 px-4">Extracellular</td>
                                    <td className="py-3 px-4">Distributes in extracellular fluid, poor intracellular penetration</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-3 px-4">Theophylline</td>
                                    <td className="py-3 px-4">0.5</td>
                                    <td className="py-3 px-4">Total body water</td>
                                    <td className="py-3 px-4">Distributes throughout body water compartments</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <td className="py-3 px-4">Digoxin</td>
                                    <td className="py-3 px-4">7</td>
                                    <td className="py-3 px-4">Tissue binding</td>
                                    <td className="py-3 px-4">Extensive tissue binding, long half-life</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">Chloroquine</td>
                                    <td className="py-3 px-4">200</td>
                                    <td className="py-3 px-4">Extreme distribution</td>
                                    <td className="py-3 px-4">Extreme tissue accumulation, very long half-life</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}