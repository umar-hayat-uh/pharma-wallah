"use client";
import { useState, useEffect } from 'react';
import { Calculator, Activity, RefreshCw, AlertCircle, Layers, Droplet, Info, BookOpen } from 'lucide-react';

export default function AnionGapCalculator() {
    const [sodium, setSodium] = useState<string>('140');
    const [chloride, setChloride] = useState<string>('104');
    const [bicarb, setBicarb] = useState<string>('24');
    const [albumin, setAlbumin] = useState<string>('4.0');
    const [useAlbuminCorrection, setUseAlbuminCorrection] = useState<boolean>(false);
    const [anionGap, setAnionGap] = useState<number | null>(null);
    const [correctedGap, setCorrectedGap] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');
    const [showDetails, setShowDetails] = useState<boolean>(false);

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

        const ag = na - (cl + hco3);
        setAnionGap(ag);

        if (!isNaN(alb) && useAlbuminCorrection) {
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

    useEffect(() => {
        calculateAnionGap();
    }, [sodium, chloride, bicarb, albumin, useAlbuminCorrection]);

    const reset = () => {
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

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setSodium(p.na);
        setChloride(p.cl);
        setBicarb(p.hco3);
        setAlbumin(p.alb);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Layers className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Anion Gap Calculator</h1>
                                <p className="text-blue-100 mt-2">AG = Na – (Cl + HCO₃) </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Droplet className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Acid‑Base Assessment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column – Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Electrolyte Values
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Sodium (mEq/L)</label>
                                    <input type="number" step="1" value={sodium} onChange={(e) => setSodium(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Chloride (mEq/L)</label>
                                    <input type="number" step="1" value={chloride} onChange={(e) => setChloride(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="text-sm font-semibold mb-2">Bicarbonate (mEq/L)</label>
                                    <input type="number" step="1" value={bicarb} onChange={(e) => setBicarb(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={useAlbuminCorrection} onChange={(e) => setUseAlbuminCorrection(e.target.checked)}
                                        className="w-4 h-4" />
                                    <span className="font-semibold text-gray-700">Apply albumin correction</span>
                                </label>
                                {useAlbuminCorrection && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-semibold mb-2">Albumin (g/dL)</label>
                                        <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                    </div>
                                )}
                            </div>

                            {/* Sample patients */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Sample Cases</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.name}</div>
                                            <div>Na {p.na}, Cl {p.cl}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculateAnionGap}
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
                                    About Anion Gap
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p>Anion gap estimates unmeasured anions (albumin, phosphates, sulfates).</p>
                                    <p>Normal AG: 8‑12 mEq/L (varies by lab).</p>
                                    <p>Albumin‑corrected AG = AG + 2.5 × (4 – albumin).</p>
                                    <p>High AG acidosis: MUDPILES (Methanol, Uremia, DKA, Paraldehyde, Iron/INH, Lactic acid, Ethanol/Ethylene glycol, Salicylates).</p>
                                    <p className="text-xs italic">Source: Kraut & Madias, NEJM 2007.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column – Results & Reference */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Anion Gap</h2>
                            <div className="bg-white/20 rounded-xl p-4 text-center">
                                <div className="text-4xl font-bold mb-2">{anionGap?.toFixed(1) ?? '—'}</div>
                                <div className="text-sm">{useAlbuminCorrection && correctedGap !== null ? `(corrected: ${correctedGap.toFixed(1)})` : ''}</div>
                            </div>
                            {interpretation && (
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{interpretation}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Causes of High AG
                            </h3>
                            <p className="text-sm">MUDPILES mnemonic: Methanol, Uremia, DKA, Paraldehyde, Iron/INH, Lactic acidosis, Ethanol/Ethylene glycol, Salicylates.</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delta Ratio</h3>
                            <p className="text-sm">ΔAG / ΔHCO₃ helps identify mixed disorders.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}