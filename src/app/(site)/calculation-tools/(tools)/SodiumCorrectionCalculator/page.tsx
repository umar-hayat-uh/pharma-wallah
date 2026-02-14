"use client";
import { useState, useEffect } from 'react';
import {
    Droplets,
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Thermometer
} from 'lucide-react';

type GlucoseUnit = 'mg/dL' | 'mmol/L';

export default function SodiumCorrectionCalculator() {
    const [sodium, setSodium] = useState<string>('135');
    const [glucose, setGlucose] = useState<string>('100');
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');
    const [correctedSodium, setCorrectedSodium] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    const calculateCorrectedSodium = () => {
        let na = parseFloat(sodium);
        let glu = parseFloat(glucose);

        if (isNaN(na) || isNaN(glu)) {
            setCorrectedSodium(null);
            setInterpretation('');
            return;
        }

        // Convert glucose to mg/dL if needed
        if (glucoseUnit === 'mmol/L') {
            glu = glu * 18; // 1 mmol/L = 18 mg/dL
        }

        // Corrected sodium formula for hyperglycemia
        // Corrected Na = measured Na + 0.016 * (glucose - 100)
        const corrected = na + 0.016 * (glu - 100);
        setCorrectedSodium(corrected);

        // Interpretation (using corrected value)
        if (corrected < 135) setInterpretation('Hyponatremia');
        else if (corrected > 145) setInterpretation('Hypernatremia');
        else setInterpretation('Normal');
    };

    const resetCalculator = () => {
        setSodium('135');
        setGlucose('100');
        setGlucoseUnit('mg/dL');
        setCorrectedSodium(null);
        setInterpretation('');
    };

    const samplePatients = [
        { name: 'Normal', na: '140', glu: '100' },
        { name: 'Hyperglycemia', na: '128', glu: '400' },
        { name: 'DKA', na: '125', glu: '600' },
        { name: 'Mild hyponatremia', na: '132', glu: '120' },
        { name: 'Hypernatremia', na: '148', glu: '90' },
    ];

    const loadSample = (index: number) => {
        const patient = samplePatients[index];
        setSodium(patient.na);
        setGlucose(patient.glu);
    };

    useEffect(() => {
        calculateCorrectedSodium();
    }, [sodium, glucose, glucoseUnit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Sodium Correction Calculator</h1>
                                <p className="text-blue-100 mt-2">Corrects sodium for hyperglycemia (hyponatremia management)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Electrolyte Evaluation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Input Parameters
                            </h2>

                            <div className="space-y-6">
                                {/* Units */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Glucose Units</h3>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="mg/dL"
                                                checked={glucoseUnit === 'mg/dL'}
                                                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                                className="mr-2"
                                            />
                                            mg/dL
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="mmol/L"
                                                checked={glucoseUnit === 'mmol/L'}
                                                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                                className="mr-2"
                                            />
                                            mmol/L
                                        </label>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Serum Sodium (mEq/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={sodium}
                                                onChange={(e) => setSodium(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:border-cyan-500"
                                                placeholder="e.g., 135"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Serum Glucose
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={glucose}
                                                onChange={(e) => setGlucose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-cyan-200 rounded-lg focus:border-cyan-500"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Patients */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Sample Cases</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {samplePatients.map((patient, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-cyan-700">{patient.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Na: {patient.na} | Glu: {patient.glu}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateCorrectedSodium}
                                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-400 hover:from-cyan-700 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-cyan-600 to-blue-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-cyan-100 mb-2">
                                        Corrected Sodium
                                    </div>
                                    {correctedSodium !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {correctedSodium.toFixed(1)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                mEq/L
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-cyan-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {interpretation && (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">Interpretation</div>
                                    <div className="text-2xl font-bold">{interpretation}</div>
                                </div>
                            )}
                        </div>

                        {/* Formula Reference */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-cyan-600" />
                                Formula
                            </h3>
                            <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                                <p className="text-sm text-gray-700">
                                    Corrected Na = Measured Na + 0.016 × (Glucose - 100)
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    *Glucose in mg/dL. For mmol/L, glucose is converted (1 mmol/L = 18 mg/dL).
                                </p>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-cyan-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Normal Ranges</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Sodium</span>
                                    <span className="font-semibold text-cyan-600">135-145 mEq/L</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Glucose (fasting)</span>
                                    <span className="font-semibold text-blue-600">70-100 mg/dL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Clinical Context</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-200">
                            <h3 className="font-bold text-cyan-700 mb-3">Why Correct?</h3>
                            <p className="text-sm text-gray-600">Hyperglycemia causes osmotic shift of water into extracellular space, diluting sodium. Corrected sodium reflects true sodium after glucose normalization.</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Clinical Use</h3>
                            <p className="text-sm text-gray-600">Helps differentiate true hyponatremia from dilutional hyponatremia in diabetic patients. Guides fluid management.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}