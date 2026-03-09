"use client";
import { useState, useEffect } from 'react';
import { Droplets, Calculator, Activity, RefreshCw, AlertCircle, Thermometer, Info, BookOpen } from 'lucide-react';

type GlucoseUnit = 'mg/dL' | 'mmol/L';

export default function SodiumCorrectionCalculator() {
    const [sodium, setSodium] = useState<string>('135');
    const [glucose, setGlucose] = useState<string>('100');
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');
    const [correctedSodium, setCorrectedSodium] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [showDetails, setShowDetails] = useState<boolean>(false);

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
        const corrected = na + 0.016 * (glu - 100);
        setCorrectedSodium(corrected);

        // Interpretation (using corrected value)
        if (corrected < 135) setInterpretation('Hyponatremia');
        else if (corrected > 145) setInterpretation('Hypernatremia');
        else setInterpretation('Normal');
    };

    useEffect(() => {
        calculateCorrectedSodium();
    }, [sodium, glucose, glucoseUnit]);

    const reset = () => {
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

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setSodium(p.na);
        setGlucose(p.glu);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Sodium Correction Calculator</h1>
                                <p className="text-blue-100 mt-2">Corrected Na = measured Na + 0.016 × (glucose – 100) </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Electrolyte Evaluation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column – inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Patient Data
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Sodium (mEq/L)</label>
                                    <input type="number" step="1" value={sodium} onChange={(e) => setSodium(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Glucose</label>
                                    <input type="number" step="1" value={glucose} onChange={(e) => setGlucose(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                            </div>

                            {/* Units selection */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Glucose units</h3>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value="mg/dL" checked={glucoseUnit === 'mg/dL'} onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)} />
                                        <span>mg/dL</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" value="mmol/L" checked={glucoseUnit === 'mmol/L'} onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)} />
                                        <span>mmol/L</span>
                                    </label>
                                </div>
                            </div>

                            {/* Sample cases */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold mb-3">Example cases</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.name}</div>
                                            <div>Na {p.na}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={calculateCorrectedSodium}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Details panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Sodium Correction
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p>In hyperglycemia, water shifts from intracellular to extracellular space, lowering measured sodium. Corrected value estimates sodium after glucose normalization.</p>
                                    <p>Formula: corrected Na = measured Na + 0.016 × (glucose – 100) for glucose in mg/dL. </p>
                                    <p>Clinical use: differentiate true hyponatremia from dilutional hyponatremia in diabetic patients. </p>
                                    <p className="text-xs italic">Sources: Katz MA, N Engl J Med 1973; Hillier TA et al., J Am Soc Nephrol 1999.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column – results & reference */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Corrected Sodium</h2>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold mb-2">{correctedSodium?.toFixed(1) ?? '—'}</div>
                                <div className="text-sm">mEq/L</div>
                            </div>
                            {interpretation && (
                                <div className="bg-white/10 rounded-lg p-4 mt-4 text-center">
                                    <p className="text-lg font-semibold">{interpretation}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Normal Ranges
                            </h3>
                            <p className="text-sm">Sodium: 135–145 mEq/L<br />Glucose (fasting): 70–100 mg/dL</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Formula</h3>
                            <p className="text-sm font-mono">Naₑ = Naₘ + 0.016 × (G – 100)</p>
                            <p className="text-xs text-gray-600 mt-2">(glucose in mg/dL)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}