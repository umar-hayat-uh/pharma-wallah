"use client";
import { useState } from 'react';
import { Calculator, RefreshCw, Activity, Heart, Brain, AlertCircle, Filter, Droplet, Scale } from 'lucide-react';

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
        const W = patientWeight ? parseFloat(patientWeight) : 70; // default 70kg

        if (isNaN(D) || isNaN(Cp) || D <= 0 || Cp <= 0) {
            alert('Please enter valid positive numbers for dose and concentration');
            return;
        }

        // Vd = Dose / C0 [citation:2]
        const vd = D / Cp;
        const vdPerKg = vd / W;

        // Interpretation per MSD Manual [citation:2]
        let interpretation = '';
        let distributionType = '';
        let clinicalSignificance = '';

        if (vdPerKg < 0.1) {
            interpretation = 'Confined to plasma compartment';
            distributionType = 'Plasma Volume';
            clinicalSignificance = 'Highly protein bound, minimal tissue distribution.';
        } else if (vdPerKg < 0.3) {
            interpretation = 'Distributed in extracellular fluid';
            distributionType = 'Extracellular Fluid';
            clinicalSignificance = 'Moderate tissue distribution, limited intracellular penetration.';
        } else if (vdPerKg < 0.7) {
            interpretation = 'Distributed in total body water';
            distributionType = 'Total Body Water';
            clinicalSignificance = 'Good distribution throughout body water compartments.';
        } else if (vdPerKg < 2) {
            interpretation = 'Moderate tissue binding';
            distributionType = 'Tissue Binding';
            clinicalSignificance = 'Significant tissue binding, longer half-life expected.';
        } else if (vdPerKg < 10) {
            interpretation = 'Extensive tissue binding';
            distributionType = 'Extensive Distribution';
            clinicalSignificance = 'High tissue affinity, very long half-life, accumulates in tissues.';
        } else {
            interpretation = 'Extreme tissue binding and accumulation';
            distributionType = 'Extreme Distribution';
            clinicalSignificance = 'Very high tissue affinity, potential for long-term accumulation.';
        }

        setResult({ vd, vdPerKg, interpretation, distributionType, clinicalSignificance });
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Volume of Distribution (Vd) Calculator</h1>
                                <p className="text-blue-100 mt-2">Apparent volume of distribution per MSD Manual</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">PK Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Enter Pharmacokinetic Parameters
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Dose Administered (mg)
                                    </label>
                                    <input type="number" step="0.001" value={dose} onChange={(e) => setDose(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg"
                                        placeholder="e.g., 500" />
                                    <p className="text-sm text-gray-600 mt-2">Total dose administered intravenously</p>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Plasma Concentration C₀ (mg/L)
                                    </label>
                                    <input type="number" step="0.001" value={concentration} onChange={(e) => setConcentration(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg"
                                        placeholder="e.g., 10" />
                                    <p className="text-sm text-gray-600 mt-2">Measured at time zero after IV bolus</p>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Patient Body Weight (kg) – Optional
                                    </label>
                                    <input type="number" step="0.1" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)}
                                        className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg"
                                        placeholder="e.g., 70" />
                                </div>

                                {/* Sample Drugs */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {sampleDrugs.map((drug, index) => (
                                            <button key={index} onClick={() => { setDose(drug.dose); setConcentration(drug.conc); }}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center">
                                                <div className="font-semibold text-blue-700">{drug.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">Vd: {drug.vd} L/kg</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={calculateVd}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                        Calculate Vd
                                    </button>
                                    <button onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    <div className="space-y-6">
                        {result && (
                            <>
                                <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <Activity className="w-7 h-7 mr-3" />
                                        Vd Results
                                    </h2>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                        <div className="text-sm font-semibold text-blue-100 mb-2">Volume of Distribution</div>
                                        <div className="text-4xl font-bold mb-2">{result.vd.toFixed(2)} L</div>
                                        <div className="text-xl">({result.vdPerKg.toFixed(3)} L/kg)</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <div className="text-center">
                                            <div className="text-sm font-semibold mb-1">{result.distributionType}</div>
                                            <div className="text-sm">{result.interpretation}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Distribution Visualization */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Distribution Pattern</h3>
                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="text-center">
                                            <Heart className="w-8 h-8 text-red-500 mx-auto mb-1" />
                                            <div className={`w-12 h-12 rounded-full ${result.vdPerKg < 0.3 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gray-200'}`} />
                                            <div className="text-xs mt-1">Plasma</div>
                                        </div>
                                        <div className="text-center">
                                            <Filter className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                            <div className={`w-14 h-14 rounded-full ${result.vdPerKg >= 0.3 && result.vdPerKg < 2 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gray-200'}`} />
                                            <div className="text-xs mt-1">Tissues</div>
                                        </div>
                                        <div className="text-center">
                                            <Brain className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                                            <div className={`w-16 h-16 rounded-full ${result.vdPerKg >= 2 ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gray-200'}`} />
                                            <div className="text-xs mt-1">Deep Tissues</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Significance */}
                                <div className="bg-yellow-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                        <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                        Clinical Significance
                                    </h3>
                                    <p className="text-sm text-gray-700">{result.clinicalSignificance}</p>
                                </div>
                            </>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Formula</h3>
                            <div className="text-center text-xl font-mono bg-gray-50 p-4 rounded-lg">Vd = Dose / C₀</div>
                            <p className="text-xs text-gray-500 mt-2">Per MSD Manual [citation:2]</p>
                        </div>

                        {/* Vd Interpretation Guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Vd Interpretation</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span>&lt;0.1 L/kg</span><span className="font-semibold">Plasma only</span></div>
                                <div className="flex justify-between"><span>0.1-0.3 L/kg</span><span className="font-semibold">Extracellular</span></div>
                                <div className="flex justify-between"><span>0.3-0.7 L/kg</span><span className="font-semibold">Body water</span></div>
                                <div className="flex justify-between"><span>0.7-2 L/kg</span><span className="font-semibold">Tissue binding</span></div>
                                <div className="flex justify-between"><span>&gt;2 L/kg</span><span className="font-semibold">Extensive binding</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}