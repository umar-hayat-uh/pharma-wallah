"use client";
import { useState, useEffect } from 'react';
import {
    LineChart,
    Calculator,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Target,
    Activity,
    Zap,
    Filter,
    Eye
} from 'lucide-react';

type PeakType = 'single' | 'multiple' | 'shoulder';

interface Peak {
    wavelength: number;
    absorbance: number;
    width?: number;
}

export default function UVVisPeakAnalyzer() {
    const [mode, setMode] = useState<PeakType>('single');
    const [wavelength, setWavelength] = useState<string>('260');
    const [absorbance, setAbsorbance] = useState<string>('0.5');
    const [concentration, setConcentration] = useState<string>('0.001');
    const [pathLength, setPathLength] = useState<string>('1');
    const [purityRatio, setPurityRatio] = useState<number | null>(null);
    const [epsilon, setEpsilon] = useState<number | null>(null);
    const [peaks, setPeaks] = useState<Peak[]>([
        { wavelength: 260, absorbance: 0.5 },
        { wavelength: 280, absorbance: 0.3 }
    ]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const analyzePeaks = () => {
        // Calculate epsilon from Beer-Lambert law
        const conc = parseFloat(concentration);
        const A = parseFloat(absorbance);
        const b = parseFloat(pathLength);

        if (!isNaN(conc) && !isNaN(A) && !isNaN(b) && conc > 0 && b > 0) {
            const calculatedEpsilon = A / (conc * b);
            setEpsilon(calculatedEpsilon);
        }

        // Calculate A260/A280 purity ratio
        if (peaks.length >= 2) {
            const peak260 = peaks.find(p => Math.abs(p.wavelength - 260) < 5);
            const peak280 = peaks.find(p => Math.abs(p.wavelength - 280) < 5);

            if (peak260 && peak280 && peak280.absorbance > 0) {
                const ratio = peak260.absorbance / peak280.absorbance;
                setPurityRatio(ratio);
            }
        }
    };

    const resetCalculator = () => {
        setWavelength('260');
        setAbsorbance('0.5');
        setConcentration('0.001');
        setPathLength('1');
        setPurityRatio(null);
        setEpsilon(null);
        setPeaks([
            { wavelength: 260, absorbance: 0.5 },
            { wavelength: 280, absorbance: 0.3 }
        ]);
    };

    const addPeak = () => {
        setPeaks([...peaks, { wavelength: 300, absorbance: 0.1 }]);
    };

    const removePeak = (index: number) => {
        if (peaks.length > 1) {
            const newPeaks = [...peaks];
            newPeaks.splice(index, 1);
            setPeaks(newPeaks);
        }
    };

    const updatePeak = (index: number, field: keyof Peak, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            const newPeaks = [...peaks];
            newPeaks[index] = { ...newPeaks[index], [field]: numValue };
            setPeaks(newPeaks);
        }
    };

    const sampleSpectra = [
        {
            name: 'Pure DNA',
            peaks: [
                { wavelength: 260, absorbance: 0.66 },
                { wavelength: 280, absorbance: 0.33 }
            ],
            ratio: '2.0',
            note: 'A260/A280 = 1.8-2.0'
        },
        {
            name: 'Pure RNA',
            peaks: [
                { wavelength: 260, absorbance: 0.65 },
                { wavelength: 280, absorbance: 0.32 }
            ],
            ratio: '2.0',
            note: 'A260/A280 = 1.9-2.1'
        },
        {
            name: 'Pure Protein',
            peaks: [
                { wavelength: 280, absorbance: 0.55 },
                { wavelength: 260, absorbance: 0.28 }
            ],
            ratio: '0.5',
            note: 'A260/A280 = 0.5-0.6'
        },
        {
            name: 'Contaminated',
            peaks: [
                { wavelength: 260, absorbance: 0.5 },
                { wavelength: 280, absorbance: 0.4 }
            ],
            ratio: '1.25',
            note: 'Possible protein contamination'
        }
    ];

    const loadSample = (index: number) => {
        const spectrum = sampleSpectra[index];
        setMode('multiple');
        setPeaks(spectrum.peaks);
    };

    const getPurityInterpretation = (ratio: number) => {
        if (ratio < 1.5) return 'Likely protein contamination';
        if (ratio < 1.7) return 'Possible protein contamination';
        if (ratio < 1.9) return 'Acceptable for RNA';
        if (ratio < 2.1) return 'Pure nucleic acid';
        if (ratio < 2.3) return 'Pure DNA/RNA';
        return 'Possible phenol contamination';
    };

    const getPeakType = (wavelength: number) => {
        if (wavelength >= 250 && wavelength <= 270) return 'Nucleic acid peak (260 nm)';
        if (wavelength >= 275 && wavelength <= 285) return 'Protein peak (280 nm)';
        if (wavelength >= 320 && wavelength <= 350) return 'NAD(P)H peak (340 nm)';
        if (wavelength >= 400 && wavelength <= 500) return 'Chromophore/color';
        return 'Other absorption';
    };

    useEffect(() => {
        analyzePeaks();
    }, [wavelength, absorbance, concentration, pathLength, peaks, mode]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <LineChart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">UV-Vis Peak Analyzer</h1>
                                <p className="text-blue-100 mt-2">Analyze UV-Vis spectra for purity and concentration</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Eye className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Spectral Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Peak Analysis
                            </h2>

                            {/* Mode Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Analysis Mode</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setMode('single')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'single' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Target className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Single Peak</span>
                                            <span className="text-sm mt-1">Concentration calculation</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('multiple')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'multiple' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Activity className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Multiple Peaks</span>
                                            <span className="text-sm mt-1">Purity assessment</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className={`p-4 rounded-xl transition-all ${showAdvanced ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Zap className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Advanced</span>
                                            <span className="text-sm mt-1">Additional parameters</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Single Peak Analysis */}
                            {mode === 'single' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Peak Parameters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Wavelength (nm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={wavelength}
                                                    onChange={(e) => setWavelength(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 260"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {getPeakType(parseFloat(wavelength))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Absorbance (A)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={absorbance}
                                                    onChange={(e) => setAbsorbance(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 0.5"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Peak Type</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {getPeakType(parseFloat(wavelength))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                            Concentration Calculation
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Path Length (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={pathLength}
                                                    onChange={(e) => setPathLength(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Concentration (M)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={concentration}
                                                    onChange={(e) => setConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                    placeholder="e.g., 0.001"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multiple Peaks Analysis */}
                            {mode === 'multiple' && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                                                Multiple Peak Data
                                            </h3>
                                            <button
                                                onClick={addPeak}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Add Peak
                                            </button>
                                        </div>

                                        <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                                            {peaks.map((peak, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-300">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-700">Peak {index + 1}</h4>
                                                        <button
                                                            onClick={() => removePeak(index)}
                                                            disabled={peaks.length <= 1}
                                                            className={`px-3 py-1 rounded text-sm ${peaks.length <= 1
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Wavelength (nm)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="1"
                                                                value={peak.wavelength}
                                                                onChange={(e) => updatePeak(index, 'wavelength', e.target.value)}
                                                                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg"
                                                                placeholder="e.g., 260"
                                                            />
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {getPeakType(peak.wavelength)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Absorbance (A)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.001"
                                                                value={peak.absorbance}
                                                                onChange={(e) => updatePeak(index, 'absorbance', e.target.value)}
                                                                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg"
                                                                placeholder="e.g., 0.5"
                                                            />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <div className="bg-gray-50 p-3 rounded-lg w-full">
                                                                <div className="text-xs font-semibold text-gray-600">Peak Significance</div>
                                                                <div className="text-xs text-gray-600">
                                                                    {peak.wavelength === 260 ? 'Nucleic acid' :
                                                                        peak.wavelength === 280 ? 'Protein' :
                                                                            'Other'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Concentration for calculation */}
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">For Molar Absorptivity Calculation</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Path Length (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={pathLength}
                                                    onChange={(e) => setPathLength(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg"
                                                    placeholder="e.g., 1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Concentration (M)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={concentration}
                                                    onChange={(e) => setConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg"
                                                    placeholder="e.g., 0.001"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Options */}
                            {showAdvanced && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Parameters</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Baseline Correction
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg"
                                                placeholder="e.g., 0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Peak Width (nm)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg"
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sample Spectra */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Spectra</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {sampleSpectra.map((spectrum, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-blue-700">{spectrum.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                A260/A280: {spectrum.ratio}<br />
                                                Peaks: {spectrum.peaks.length}
                                            </div>
                                            <div className="text-xs text-blue-600 mt-2">{spectrum.note}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={analyzePeaks}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Analyze Peaks
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

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Main Results */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <LineChart className="w-7 h-7 mr-3" />
                                Analysis Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center space-y-4">
                                    {/* Purity Ratio */}
                                    {purityRatio !== null && (
                                        <div>
                                            <div className="text-sm font-semibold text-blue-100 mb-1">A260/A280 Ratio</div>
                                            <div className="text-4xl font-bold mb-2">
                                                {purityRatio.toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Molar Absorptivity */}
                                    {epsilon !== null && (
                                        <div>
                                            <div className="text-sm font-semibold text-blue-100 mb-1">Molar Absorptivity</div>
                                            <div className="text-3xl font-bold mb-2">
                                                {epsilon.toFixed(0)}
                                            </div>
                                            <div className="text-lg font-semibold">
                                                M⁻¹cm⁻¹
                                            </div>
                                        </div>
                                    )}

                                    {purityRatio === null && epsilon === null && (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Peak Data
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Purity Status */}
                            {purityRatio !== null && (
                                <div className={`rounded-lg p-4 ${purityRatio >= 1.8 && purityRatio <= 2.0
                                        ? 'bg-green-500/30'
                                        : 'bg-yellow-500/30'
                                    }`}>
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Purity Status</div>
                                        <div className="text-lg font-bold">
                                            {getPurityInterpretation(purityRatio)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Peak Visualization */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Spectrum Visualization</h3>
                            <div className="h-48 relative border-l border-b border-gray-300">
                                {/* Simplified spectrum visualization */}
                                <svg className="w-full h-full">
                                    {/* X-axis */}
                                    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#9ca3af" strokeWidth="1" />

                                    {/* Y-axis */}
                                    <line x1="0" y1="0" x2="0" y2="100%" stroke="#9ca3af" strokeWidth="1" />

                                    {/* Peaks */}
                                    {peaks.map((peak, index) => {
                                        const x = (peak.wavelength - 200) / (400 - 200) * 100; // 200-400 nm range
                                        const y = (1 - Math.min(peak.absorbance, 1)) * 100; // 0-1 absorbance range
                                        return (
                                            <g key={index}>
                                                <circle
                                                    cx={`${x}%`}
                                                    cy={`${y}%`}
                                                    r="3"
                                                    fill="#3b82f6"
                                                    stroke="#1d4ed8"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={`${x}%`}
                                                    y={`${y - 10}%`}
                                                    textAnchor="middle"
                                                    className="text-xs fill-gray-600"
                                                >
                                                    {peak.wavelength} nm
                                                </text>
                                                <text
                                                    x={`${x}%`}
                                                    y={`${y - 20}%`}
                                                    textAnchor="middle"
                                                    className="text-xs fill-gray-600"
                                                >
                                                    A={peak.absorbance.toFixed(2)}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>

                        {/* Purity Standards */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Purity Standards
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { ratio: '1.8-2.0', material: 'Pure DNA', quality: 'Excellent' },
                                    { ratio: '1.9-2.1', material: 'Pure RNA', quality: 'Excellent' },
                                    { ratio: '0.5-0.6', material: 'Pure Protein', quality: 'Good' },
                                    { ratio: '<1.5', material: 'Contaminated', quality: 'Poor' },
                                    { ratio: '>2.3', material: 'Phenol contam.', quality: 'Poor' },
                                ].map((item, index) => (
                                    <div key={index} className={`p-3 rounded-lg border ${purityRatio !== null &&
                                            parseFloat(item.ratio.split('-')[0]) <= purityRatio &&
                                            parseFloat(item.ratio.split('-')[1] || item.ratio.split('>')[1] || item.ratio.split('<')[1]) >= purityRatio
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-gray-700">{item.material}</div>
                                                <div className="text-sm text-gray-600">A260/A280: {item.ratio}</div>
                                            </div>
                                            <div className={`px-3 py-1 rounded text-sm ${item.quality === 'Excellent' ? 'bg-green-100 text-green-700' :
                                                    item.quality === 'Good' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {item.quality}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">DNA Quantification:</div>
                                    <div className="text-gray-600 mt-1">Conc (μg/mL) = A₂₆₀ × 50 × dilution</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">RNA Quantification:</div>
                                    <div className="text-gray-600 mt-1">Conc (μg/mL) = A₂₆₀ × 40 × dilution</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Protein (BCA):</div>
                                    <div className="text-gray-600 mt-1">Conc from standard curve</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UV-Vis Principles */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">UV-Vis Spectroscopy Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Characteristic Peaks</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• DNA/RNA: 260 nm (nucleic acids)</p>
                                <p>• Proteins: 280 nm (aromatic amino acids)</p>
                                <p>• NAD(P)H: 340 nm (reduced form)</p>
                                <p>• FAD/FMN: 450 nm (oxidized)</p>
                                <p>• Cytochromes: 550-600 nm</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Purity Ratios</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• A260/A280: Nucleic acid purity</p>
                                <p>• A260/A230: Salt/organic contamination</p>
                                <p>• A320/A280: Turbidity/scattering</p>
                                <p>• A260/A280 ~2.0: Pure nucleic acid</p>
                                <p>• A260/A280 ~0.6: Pure protein</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Applications</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Concentration determination</p>
                                <p>• Purity assessment</p>
                                <p>• Enzyme kinetics</p>
                                <p>• Binding studies</p>
                                <p>• Quality control</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}