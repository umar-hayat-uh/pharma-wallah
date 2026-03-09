"use client";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Activity, Calculator, TrendingUp, RefreshCw, AlertCircle, Target, Info, BookOpen, Database, Eye, ChevronUp, ChevronDown } from 'lucide-react';

interface Peak { wavelength: number; absorbance: number; }

export default function UVVisPeakAnalyzer() {
    const [peaks, setPeaks] = useState<Peak[]>([
        { wavelength: 260, absorbance: 0.5 },
        { wavelength: 280, absorbance: 0.3 }
    ]);
    const [concentration, setConcentration] = useState<string>('0.001');
    const [pathLength, setPathLength] = useState<string>('1');
    const [purityRatio, setPurityRatio] = useState<number | null>(null);
    const [epsilon, setEpsilon] = useState<number | null>(null);
    const [spectrumData, setSpectrumData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const generateSpectrum = () => {
        const data = [];
        for (let wl = 200; wl <= 400; wl += 2) {
            let A = 0;
            peaks.forEach(p => {
                const dist = Math.abs(wl - p.wavelength);
                if (dist < 30) A += p.absorbance * Math.exp(-Math.pow(dist / 10, 2));
            });
            data.push({ wavelength: wl, absorbance: A });
        }
        setSpectrumData(data);
    };

    const analyze = () => {
        const conc = parseFloat(concentration);
        const A = peaks.length ? peaks[0].absorbance : 0;
        const b = parseFloat(pathLength);
        if (!isNaN(conc) && !isNaN(A) && !isNaN(b) && conc > 0 && b > 0) {
            setEpsilon(A / (conc * b));
        }

        const peak260 = peaks.find(p => Math.abs(p.wavelength - 260) < 5);
        const peak280 = peaks.find(p => Math.abs(p.wavelength - 280) < 5);
        if (peak260 && peak280 && peak280.absorbance > 0) {
            setPurityRatio(peak260.absorbance / peak280.absorbance);
        }
        generateSpectrum();
    };

    useEffect(() => { generateSpectrum(); }, [peaks]);

    const reset = () => {
        setPeaks([{ wavelength: 260, absorbance: 0.5 }, { wavelength: 280, absorbance: 0.3 }]);
        setConcentration('0.001');
        setPathLength('1');
        setPurityRatio(null);
        setEpsilon(null);
    };

    const addPeak = () => setPeaks([...peaks, { wavelength: 300, absorbance: 0.1 }]);
    const removePeak = (idx: number) => {
        if (peaks.length > 1) {
            const newPeaks = [...peaks];
            newPeaks.splice(idx, 1);
            setPeaks(newPeaks);
        }
    };
    const updatePeak = (idx: number, field: keyof Peak, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            const newPeaks = [...peaks];
            newPeaks[idx][field] = num;
            setPeaks(newPeaks);
        }
    };

    const examples = [
        { name: 'Pure DNA', peaks: [{ wavelength: 260, abs: 0.66 }, { wavelength: 280, abs: 0.33 }], ratio: 2.0 },
        { name: 'Pure RNA', peaks: [{ wavelength: 260, abs: 0.65 }, { wavelength: 280, abs: 0.32 }], ratio: 2.03 },
        { name: 'Pure Protein', peaks: [{ wavelength: 280, abs: 0.55 }, { wavelength: 260, abs: 0.28 }], ratio: 0.51 },
        { name: 'Contaminated', peaks: [{ wavelength: 260, abs: 0.5 }, { wavelength: 280, abs: 0.4 }], ratio: 1.25 }
    ];
    const loadExample = (idx: number) => {
        const ex = examples[idx];
        setPeaks(ex.peaks.map(p => ({ wavelength: p.wavelength, absorbance: p.abs })));
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">UV‑Vis Peak Analyzer</h1>
                                <p className="text-blue-100 mt-2">Purity & concentration from absorbance spectra</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Eye className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Spectral Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Peak Data
                            </h2>
                            <div className="space-y-4">
                                {peaks.map((p, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">Peak {idx + 1}</span>
                                            <button onClick={() => removePeak(idx)} disabled={peaks.length <= 1}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50">✕</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="λ (nm)" value={p.wavelength}
                                                onChange={(e) => updatePeak(idx, 'wavelength', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg" />
                                            <input type="number" step="0.01" placeholder="Absorbance" value={p.absorbance}
                                                onChange={(e) => updatePeak(idx, 'absorbance', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addPeak} className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50">
                                    + Add Peak
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <label className="block text-sm font-semibold mb-2">Concentration (M)</label>
                                    <input type="number" step="1e-6" value={concentration} onChange={(e) => setConcentration(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <label className="block text-sm font-semibold mb-2">Path length (cm)</label>
                                    <input type="number" step="0.1" value={pathLength} onChange={(e) => setPathLength(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Example Spectra</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {examples.map((ex, idx) => (
                                        <button key={idx} onClick={() => loadExample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{ex.name}</div>
                                            <div>A260/A280 = {ex.ratio.toFixed(2)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={analyze}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Analyze Peaks
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About UV‑Vis Analysis
                                </h3>
                                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Nucleic Acids:</span> Absorb at 260 nm (purines and pyrimidines).</p>
                                    <p><span className="font-semibold">Proteins:</span> Absorb at 280 nm (tryptophan, tyrosine).</p>
                                    <p><span className="font-semibold">Purity Ratios:</span> A260/A280 ~1.8‑2.0 for pure DNA, ~2.0 for RNA, ~0.6 for pure protein.</p>
                                    <p><span className="font-semibold">Concentration:</span> For DNA, conc (μg/mL) = A260 × 50 (dsDNA) or 40 (ssRNA).</p>
                                    <p className="text-xs italic">Sources: Sambrook et al., Molecular Cloning; Thermo Fisher Technical Guide.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {(purityRatio !== null || epsilon !== null) && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Results</h2>
                                {purityRatio !== null && (
                                    <div className="bg-white/20 rounded-xl p-4 mb-4 text-center">
                                        <div className="text-sm">A260/A280</div>
                                        <div className="text-4xl font-bold">{purityRatio.toFixed(2)}</div>
                                        <div className="text-sm mt-2">
                                            {purityRatio < 1.5 ? 'Protein contamination' :
                                                purityRatio < 1.8 ? 'Possible contamination' :
                                                    purityRatio < 2.1 ? 'Pure nucleic acid' : 'Phenol contamination'}
                                        </div>
                                    </div>
                                )}
                                {epsilon !== null && (
                                    <div className="bg-white/10 rounded-lg p-4 text-center">
                                        <div className="text-sm">Molar absorptivity ε</div>
                                        <div className="text-2xl font-bold">{epsilon.toFixed(0)} M⁻¹cm⁻¹</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Simulated Spectrum</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={spectrumData}
                                        margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="wavelength"
                                            tick={{ fontSize: 10 }}
                                            label={{ value: 'λ (nm)', position: 'insideBottom', offset: -15 }}
                                            height={50}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            label={{ value: 'Abs', angle: -90, position: 'insideLeft', offset: 15, dy: 20 }}
                                            width={50}
                                        />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="absorbance" stroke="#3b82f6" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Purity Standards</h3>
                            <p>DNA: 1.8‑2.0<br />RNA: 1.9‑2.1<br />Protein: 0.5‑0.6</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}