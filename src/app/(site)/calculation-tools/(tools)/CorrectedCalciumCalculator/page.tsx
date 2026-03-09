"use client";
import { useState, useEffect } from 'react';
import { Droplets, Calculator, Activity, RefreshCw, AlertCircle, Beaker, Info, BookOpen } from 'lucide-react';

type CalciumUnit = 'mg/dL' | 'mmol/L';
type AlbuminUnit = 'g/dL' | 'g/L';

export default function CorrectedCalciumCalculator() {
    const [calcium, setCalcium] = useState<string>('9.0');
    const [albumin, setAlbumin] = useState<string>('4.0');
    const [calciumUnit, setCalciumUnit] = useState<CalciumUnit>('mg/dL');
    const [albuminUnit, setAlbuminUnit] = useState<AlbuminUnit>('g/dL');
    const [correctedCalcium, setCorrectedCalcium] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calciumMgdlToMmol = 0.2495;
    const albuminGdlToGl = 10;

    const calculate = () => {
        let ca = parseFloat(calcium);
        let alb = parseFloat(albumin);
        if (isNaN(ca) || isNaN(alb)) return;

        if (calciumUnit === 'mmol/L') ca = ca / calciumMgdlToMmol;
        if (albuminUnit === 'g/L') alb = alb / albuminGdlToGl;

        const corrected = ca + 0.8 * (4 - alb);
        setCorrectedCalcium(corrected);

        if (corrected < 8.5) setInterpretation('Hypocalcemia');
        else if (corrected > 10.2) setInterpretation('Hypercalcemia');
        else setInterpretation('Normal');
    };

    useEffect(() => { calculate(); }, [calcium, albumin, calciumUnit, albuminUnit]);

    const reset = () => {
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

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setCalcium(p.ca);
        setAlbumin(p.alb);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-700 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Corrected Calcium Calculator</h1>
                                <p className="text-blue-100 mt-2">Adjusted Ca = measured Ca + 0.8 × (4 – albumin) </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Beaker className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Electrolyte Evaluation</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Input Parameters</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Calcium</label>
                                    <input type="number" step="0.1" value={calcium} onChange={(e) => setCalcium(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    <select value={calciumUnit} onChange={(e) => setCalciumUnit(e.target.value as CalciumUnit)}
                                        className="w-full mt-2 px-4 py-2 border rounded-lg">
                                        <option value="mg/dL">mg/dL</option>
                                        <option value="mmol/L">mmol/L</option>
                                    </select>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Albumin</label>
                                    <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    <select value={albuminUnit} onChange={(e) => setAlbuminUnit(e.target.value as AlbuminUnit)}
                                        className="w-full mt-2 px-4 py-2 border rounded-lg">
                                        <option value="g/dL">g/dL</option>
                                        <option value="g/L">g/L</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-purple-100">
                                            <div className="font-semibold">{p.name}</div>
                                            <div>Ca {p.ca}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-700 to-green-400 hover:from-purple-700 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    Why Correct?
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p>Albumin binds calcium; low albumin gives falsely low total calcium. Correction estimates ionized calcium.</p>
                                    <p>Formula less accurate in acidosis, alkalosis, or dysproteinemia. Ionized calcium is gold standard.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-700 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Corrected Calcium</h2>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold mb-2">{correctedCalcium?.toFixed(2) ?? '—'}</div>
                                <div className="text-sm">mg/dL</div>
                            </div>
                            {interpretation && (
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{interpretation}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Normal Ranges</h3>
                            <p className="text-sm">Total calcium: 8.5–10.2 mg/dL<br />Ionized calcium: 4.6–5.3 mg/dL<br />Albumin: 3.5–5.0 g/dL</p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Formula</h3>
                            <p className="text-sm font-mono">Corrected Ca = measured Ca + 0.8 × (4 – albumin)</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}