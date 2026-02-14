"use client";
import { useState, useEffect } from 'react';
import {
    Droplets,
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Beaker
} from 'lucide-react';

type CalciumUnit = 'mg/dL' | 'mmol/L';
type AlbuminUnit = 'g/dL' | 'g/L';

export default function CorrectedCalciumCalculator() {
    const [calcium, setCalcium] = useState<string>('9.0');
    const [albumin, setAlbumin] = useState<string>('4.0');
    const [calciumUnit, setCalciumUnit] = useState<CalciumUnit>('mg/dL');
    const [albuminUnit, setAlbuminUnit] = useState<AlbuminUnit>('g/dL');
    const [correctedCalcium, setCorrectedCalcium] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    // Conversion factors
    const calciumMgdlToMmol = 0.2495; // 1 mg/dL = 0.2495 mmol/L
    const albuminGdlToGl = 10; // 1 g/dL = 10 g/L

    const calculateCorrectedCalcium = () => {
        let ca = parseFloat(calcium);
        let alb = parseFloat(albumin);

        if (isNaN(ca) || isNaN(alb)) {
            setCorrectedCalcium(null);
            setInterpretation('');
            return;
        }

        // Convert to standard units for formula (mg/dL and g/dL)
        if (calciumUnit === 'mmol/L') {
            ca = ca / calciumMgdlToMmol;
        }
        if (albuminUnit === 'g/L') {
            alb = alb / albuminGdlToGl;
        }

        // Corrected calcium formula: Corrected Ca = measured Ca + 0.8 * (4 - albumin)
        const corrected = ca + 0.8 * (4 - alb);
        setCorrectedCalcium(corrected);

        // Interpretation
        if (corrected < 8.5) setInterpretation('Hypocalcemia');
        else if (corrected > 10.2) setInterpretation('Hypercalcemia');
        else setInterpretation('Normal');
    };

    const resetCalculator = () => {
        setCalcium('9.0');
        setAlbumin('4.0');
        setCalciumUnit('mg/dL');
        setAlbuminUnit('g/dL');
        setCorrectedCalcium(null);
        setInterpretation('');
    };

    const samplePatients = [
        { name: 'Normal', ca: '9.0', alb: '4.0' },
        { name: 'Hypoalbuminemia', ca: '8.0', alb: '2.5' },
        { name: 'Hypercalcemia', ca: '11.0', alb: '4.0' },
        { name: 'CKD', ca: '8.5', alb: '3.0' },
        { name: 'Cirrhosis', ca: '8.2', alb: '2.0' },
    ];

    const loadSample = (index: number) => {
        const patient = samplePatients[index];
        setCalcium(patient.ca);
        setAlbumin(patient.alb);
    };

    useEffect(() => {
        calculateCorrectedCalcium();
    }, [calcium, albumin, calciumUnit, albuminUnit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Corrected Calcium Calculator</h1>
                                <p className="text-blue-100 mt-2">Adjusts serum calcium for albumin levels</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Beaker className="w-5 h-5 text-white" />
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
                                    <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Calcium</label>
                                            <select
                                                value={calciumUnit}
                                                onChange={(e) => setCalciumUnit(e.target.value as CalciumUnit)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                            >
                                                <option value="mg/dL">mg/dL</option>
                                                <option value="mmol/L">mmol/L</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Albumin</label>
                                            <select
                                                value={albuminUnit}
                                                onChange={(e) => setAlbuminUnit(e.target.value as AlbuminUnit)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                                            >
                                                <option value="g/dL">g/dL</option>
                                                <option value="g/L">g/L</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Serum Calcium
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={calcium}
                                                onChange={(e) => setCalcium(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500"
                                                placeholder="e.g., 9.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Serum Albumin
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={albumin}
                                                onChange={(e) => setAlbumin(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500"
                                                placeholder="e.g., 4.0"
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
                                                className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-purple-700">{patient.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Ca: {patient.ca} | Alb: {patient.alb}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateCorrectedCalcium}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-400 hover:from-purple-700 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
                        <div className="bg-gradient-to-br from-purple-600 to-blue-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-purple-100 mb-2">
                                        Corrected Calcium
                                    </div>
                                    {correctedCalcium !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {correctedCalcium.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                mg/dL
                                            </div>
                                            {calciumUnit !== 'mg/dL' && (
                                                <div className="text-sm mt-2">
                                                    ({(correctedCalcium * calciumMgdlToMmol).toFixed(2)} mmol/L)
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-purple-100">
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
                                <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                                Formula
                            </h3>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-700">
                                    Corrected Ca (mg/dL) = Measured Ca + 0.8 × (4 - Albumin)
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    *Assumes albumin in g/dL. Adjusts for hypoalbuminemia.
                                </p>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Normal Ranges</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Total Calcium</span>
                                    <span className="font-semibold text-purple-600">8.5-10.2 mg/dL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Ionized Calcium</span>
                                    <span className="font-semibold text-blue-600">4.6-5.3 mg/dL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Albumin</span>
                                    <span className="font-semibold text-purple-600">3.5-5.0 g/dL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Clinical Context</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3">Why Correct?</h3>
                            <p className="text-sm text-gray-600">Albumin binds calcium. Low albumin gives falsely low total calcium. Corrected calcium estimates free (ionized) calcium.</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Limitations</h3>
                            <p className="text-sm text-gray-600">Formula less accurate in acidosis, alkalosis, or dysproteinemia. Ionized calcium measurement is gold standard.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}