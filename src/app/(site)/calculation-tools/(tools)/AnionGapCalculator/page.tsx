"use client";
import { useState, useEffect } from 'react';
import {
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Layers,
    Droplet
} from 'lucide-react';

export default function AnionGapCalculator() {
    const [sodium, setSodium] = useState<string>('140');
    const [chloride, setChloride] = useState<string>('104');
    const [bicarb, setBicarb] = useState<string>('24');
    const [albumin, setAlbumin] = useState<string>('4.0');
    const [useAlbuminCorrection, setUseAlbuminCorrection] = useState<boolean>(false);
    const [anionGap, setAnionGap] = useState<number | null>(null);
    const [correctedGap, setCorrectedGap] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    const calculateAnionGap = () => {
        const na = parseFloat(sodium);
        const cl = parseFloat(chloride);
        const hco3 = parseFloat(bicarb);
        const alb = parseFloat(albumin);

        if (isNaN(na) || isNaN(cl) || isNaN(hco3)) {
            setAnionGap(null);
            setCorrectedGap(null);
            setInterpretation('');
            return;
        }

        // Anion gap = Na - (Cl + HCO3)
        const ag = na - (cl + hco3);
        setAnionGap(ag);

        // Albumin-corrected anion gap (if albumin provided)
        if (!isNaN(alb) && useAlbuminCorrection) {
            // Corrected AG = AG + 2.5 × (4 - albumin)
            const corrected = ag + 2.5 * (4 - alb);
            setCorrectedGap(corrected);

            if (corrected > 12) setInterpretation('Elevated anion gap metabolic acidosis');
            else if (corrected < 6) setInterpretation('Low anion gap (consider causes)');
            else setInterpretation('Normal anion gap');
        } else {
            setCorrectedGap(null);
            if (ag > 12) setInterpretation('Elevated anion gap metabolic acidosis');
            else if (ag < 6) setInterpretation('Low anion gap (consider causes)');
            else setInterpretation('Normal anion gap');
        }
    };

    const resetCalculator = () => {
        setSodium('140');
        setChloride('104');
        setBicarb('24');
        setAlbumin('4.0');
        setUseAlbuminCorrection(false);
        setAnionGap(null);
        setCorrectedGap(null);
        setInterpretation('');
    };

    const samplePatients = [
        { name: 'Normal', na: '140', cl: '104', hco3: '24', alb: '4.0' },
        { name: 'DKA', na: '135', cl: '95', hco3: '10', alb: '4.5' },
        { name: 'Lactic acidosis', na: '138', cl: '100', hco3: '14', alb: '3.5' },
        { name: 'Hyperchloremic', na: '138', cl: '115', hco3: '18', alb: '4.0' },
        { name: 'Hypoalbuminemia', na: '140', cl: '108', hco3: '22', alb: '2.0' },
    ];

    const loadSample = (index: number) => {
        const patient = samplePatients[index];
        setSodium(patient.na);
        setChloride(patient.cl);
        setBicarb(patient.hco3);
        setAlbumin(patient.alb);
    };

    useEffect(() => {
        calculateAnionGap();
    }, [sodium, chloride, bicarb, albumin, useAlbuminCorrection]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-yellow-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Layers className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Anion Gap Calculator</h1>
                                <p className="text-yellow-100 mt-2">Assess metabolic acid-base disorders</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Droplet className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Acid-Base Assessment</span>
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
                                {/* Electrolytes */}
                                <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl p-6 border border-green-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sodium (mEq/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={sodium}
                                                onChange={(e) => setSodium(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500"
                                                placeholder="e.g., 140"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Chloride (mEq/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={chloride}
                                                onChange={(e) => setChloride(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500"
                                                placeholder="e.g., 104"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bicarbonate (mEq/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={bicarb}
                                                onChange={(e) => setBicarb(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500"
                                                placeholder="e.g., 24"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Albumin Correction */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useAlbuminCorrection}
                                            onChange={(e) => setUseAlbuminCorrection(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="font-semibold text-gray-700">Apply albumin correction</span>
                                    </label>
                                    {useAlbuminCorrection && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Albumin (g/dL)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={albumin}
                                                onChange={(e) => setAlbumin(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500"
                                                placeholder="e.g., 4.0"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Sample Patients */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Sample Cases</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {samplePatients.map((patient, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-green-50 to-yellow-50 hover:from-green-100 hover:to-yellow-100 border border-green-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-green-700">{patient.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Na: {patient.na} | Cl: {patient.cl}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateAnionGap}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-yellow-400 hover:from-green-700 hover:to-yellow-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
                        <div className="bg-gradient-to-br from-green-600 to-yellow-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-green-100 mb-2">
                                        Anion Gap
                                    </div>
                                    {anionGap !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {anionGap.toFixed(1)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                mEq/L
                                            </div>
                                            {correctedGap !== null && (
                                                <div className="mt-4">
                                                    <div className="text-sm font-semibold">Albumin-corrected</div>
                                                    <div className="text-3xl font-bold">{correctedGap.toFixed(1)} mEq/L</div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-green-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {interpretation && (
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">Interpretation</div>
                                    <div className="text-xl font-bold">{interpretation}</div>
                                </div>
                            )}
                        </div>

                        {/* Formula Reference */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-green-600" />
                                Formula
                            </h3>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-700">AG = Na – (Cl + HCO₃)</p>
                                <p className="text-sm text-gray-700 mt-2">Albumin-corrected AG = AG + 2.5 × (4 – Albumin)</p>
                                <p className="text-xs text-gray-500 mt-2">*Normal AG ~ 8-12 mEq/L (varies by lab)</p>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl shadow-lg p-6 border border-green-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Causes of Elevated AG</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">MUDPILES</span> mnemonic:</p>
                                <ul className="list-disc list-inside text-gray-600">
                                    <li>Methanol</li>
                                    <li>Uremia</li>
                                    <li>DKA</li>
                                    <li>Paraldehyde</li>
                                    <li>Iron / INH</li>
                                    <li>Lactic acidosis</li>
                                    <li>Ethanol / Ethylene glycol</li>
                                    <li>Salicylates</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Clinical Context</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3">Delta Gap</h3>
                            <p className="text-sm text-gray-600">Delta gap = (AG – 12) / (24 – HCO₃). Helps identify mixed disorders.</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                            <h3 className="font-bold text-yellow-700 mb-3">Urine Anion Gap</h3>
                            <p className="text-sm text-gray-600">UAG = (Na + K) – Cl. Helps differentiate renal from extrarenal causes of non-gap acidosis.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}