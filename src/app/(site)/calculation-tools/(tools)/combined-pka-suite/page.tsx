"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Zap,
    Target,
    LineChart,
    PieChart,
    BarChart
} from 'lucide-react';

type CalculationMode = 'ka-to-pka' | 'pka-to-ka' | 'ionization' | 'ph-from-pka';

export default function pKaSuiteCalculator() {
    const [mode, setMode] = useState<CalculationMode>('ka-to-pka');
    const [ka, setKa] = useState<string>('1.8e-5');
    const [pka, setPka] = useState<string>('4.74');
    const [ph, setPh] = useState<string>('4.0');
    const [concentration, setConcentration] = useState<string>('0.1');
    const [result, setResult] = useState<number | null>(null);
    const [ionizationPercent, setIonizationPercent] = useState<number | null>(null);
    const [conjugateForm, setConjugateForm] = useState<string>('');
    const [showScientific, setShowScientific] = useState<boolean>(true);

    const calculate = () => {
        switch (mode) {
            case 'ka-to-pka':
                const kaValue = parseFloat(ka.includes('e') ? ka : ka) || parseFloat(ka);
                if (!isNaN(kaValue) && kaValue > 0) {
                    const calculatedPka = -Math.log10(kaValue);
                    setResult(calculatedPka);
                    setPka(calculatedPka.toFixed(2));
                }
                break;

            case 'pka-to-ka':
                const pkaValue = parseFloat(pka);
                if (!isNaN(pkaValue)) {
                    const calculatedKa = Math.pow(10, -pkaValue);
                    setResult(calculatedKa);
                    setKa(calculatedKa.toExponential(2));
                }
                break;

            case 'ionization':
                const pkaIon = parseFloat(pka);
                const phIon = parseFloat(ph);
                if (!isNaN(pkaIon) && !isNaN(phIon)) {
                    // Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
                    const ratio = Math.pow(10, phIon - pkaIon);
                    const percentIonized = (ratio / (1 + ratio)) * 100;
                    const percentUnionized = 100 - percentIonized;

                    setResult(ratio);
                    setIonizationPercent(percentIonized);
                    setConjugateForm(percentIonized > 50 ? 'Deprotonated (A⁻)' : 'Protonated (HA)');
                }
                break;

            case 'ph-from-pka':
                const pkaPh = parseFloat(pka);
                const conc = parseFloat(concentration);
                if (!isNaN(pkaPh) && !isNaN(conc) && conc > 0) {
                    // For weak acid: pH = 1/2(pKa - log(C))
                    const calculatedPh = 0.5 * (pkaPh - Math.log10(conc));
                    setResult(calculatedPh);
                    setPh(calculatedPh.toFixed(2));
                }
                break;
        }
    };

    const resetCalculator = () => {
        setKa('1.8e-5');
        setPka('4.74');
        setPh('4.0');
        setConcentration('0.1');
        setResult(null);
        setIonizationPercent(null);
        setConjugateForm('');
    };

    const sampleAcids = [
        {
            name: 'Acetic Acid',
            ka: '1.8e-5',
            pka: '4.74',
            type: 'Weak acid',
            note: 'Vinegar component'
        },
        {
            name: 'Aspirin',
            ka: '3.0e-4',
            pka: '3.52',
            type: 'Weak acid',
            note: 'Salicylic acid derivative'
        },
        {
            name: 'Ammonium Ion',
            ka: '5.6e-10',
            pka: '9.25',
            type: 'Weak acid',
            note: 'Conjugate acid of ammonia'
        },
        {
            name: 'Water',
            ka: '1.0e-14',
            pka: '14.00',
            type: 'Very weak acid',
            note: 'Autoionization'
        }
    ];

    const loadSample = (index: number) => {
        const acid = sampleAcids[index];
        setKa(acid.ka);
        setPka(acid.pka);
        setMode('ka-to-pka');
    };

    const getAcidStrength = (pkaValue: number) => {
        if (pkaValue < 0) return 'Strong acid';
        if (pkaValue < 4) return 'Moderately strong acid';
        if (pkaValue < 10) return 'Weak acid';
        if (pkaValue < 14) return 'Very weak acid';
        return 'Extremely weak acid';
    };

    const getIonizationInterpretation = (percent: number) => {
        if (percent < 10) return 'Predominantly unionized';
        if (percent < 40) return 'Mostly unionized';
        if (percent < 60) return 'Approximately equal amounts';
        if (percent < 90) return 'Mostly ionized';
        return 'Predominantly ionized';
    };

    useEffect(() => {
        calculate();
    }, [mode, ka, pka, ph, concentration, showScientific]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">pKa Suite Calculator</h1>
                                <p className="text-blue-100 mt-2">Complete acid-base ionization and pKa calculations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Acid-Base Chemistry</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                pKa Suite Tools
                            </h2>

                            {/* Mode Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Calculation Mode</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => setMode('ka-to-pka')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'ka-to-pka' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <TrendingUp className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Kₐ to pKₐ</span>
                                            <span className="text-sm mt-1">pKₐ = -log₁₀(Kₐ)</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('pka-to-ka')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'pka-to-ka' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <BarChart className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">pKₐ to Kₐ</span>
                                            <span className="text-sm mt-1">Kₐ = 10^(-pKₐ)</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('ionization')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'ionization' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <PieChart className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Ionization</span>
                                            <span className="text-sm mt-1">pH = pKₐ + log([A⁻]/[HA])</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('ph-from-pka')}
                                        className={`p-4 rounded-xl transition-all ${mode === 'ph-from-pka' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Target className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">pH from pKₐ</span>
                                            <span className="text-sm mt-1">pH ≈ ½(pKₐ - logC)</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Scientific Notation Toggle */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">Display Format</h3>
                                    <button
                                        onClick={() => setShowScientific(!showScientific)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${showScientific
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {showScientific ? 'Scientific Notation' : 'Decimal'}
                                    </button>
                                </div>
                            </div>

                            {/* Input Fields Based on Mode */}
                            <div className="space-y-6">
                                {/* Kₐ Input */}
                                {(mode === 'ka-to-pka' || mode === 'pka-to-ka') && (
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                            Acid Dissociation Constant
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Kₐ Value
                                                </label>
                                                <input
                                                    type="text"
                                                    value={ka}
                                                    onChange={(e) => setKa(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 1.8e-5 or 0.000018"
                                                    disabled={mode === 'pka-to-ka'}
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Enter as decimal or scientific notation
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    pKₐ Value
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={pka}
                                                    onChange={(e) => setPka(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 4.74"
                                                    disabled={mode === 'ka-to-pka'}
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    pKₐ = -log₁₀(Kₐ)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ionization State Input */}
                                {mode === 'ionization' && (
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                                                Acid-Base Parameters
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        pKₐ Value
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={pka}
                                                        onChange={(e) => setPka(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                        placeholder="e.g., 4.74"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        pH
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={ph}
                                                        onChange={(e) => setPh(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                        placeholder="e.g., 4.0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* pH from pKₐ Input */}
                                {mode === 'ph-from-pka' && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-purple-600" />
                                            Weak Acid pH Calculation
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    pKₐ Value
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={pka}
                                                    onChange={(e) => setPka(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 4.74"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Concentration (M)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={concentration}
                                                    onChange={(e) => setConcentration(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 0.1"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Molar concentration of weak acid
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Formula Display */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Formulas</h3>
                                    <div className="space-y-4">
                                        {mode === 'ka-to-pka' && (
                                            <div className="p-4 bg-white rounded-lg border border-gray-300">
                                                <div className="font-mono text-lg mb-2">pKₐ = -log₁₀(Kₐ)</div>
                                                <div className="text-sm text-gray-600">
                                                    Where Kₐ is the acid dissociation constant
                                                </div>
                                            </div>
                                        )}
                                        {mode === 'pka-to-ka' && (
                                            <div className="p-4 bg-white rounded-lg border border-gray-300">
                                                <div className="font-mono text-lg mb-2">Kₐ = 10^(-pKₐ)</div>
                                                <div className="text-sm text-gray-600">
                                                    Where pKₐ is the negative log of Kₐ
                                                </div>
                                            </div>
                                        )}
                                        {mode === 'ionization' && (
                                            <div className="p-4 bg-white rounded-lg border border-gray-300">
                                                <div className="font-mono text-lg mb-2">pH = pKₐ + log([A⁻]/[HA])</div>
                                                <div className="text-sm text-gray-600">
                                                    Henderson-Hasselbalch equation for weak acids
                                                </div>
                                            </div>
                                        )}
                                        {mode === 'ph-from-pka' && (
                                            <div className="p-4 bg-white rounded-lg border border-gray-300">
                                                <div className="font-mono text-lg mb-2">pH ≈ ½(pKₐ - log₁₀C)</div>
                                                <div className="text-sm text-gray-600">
                                                    Approximation for weak acid solution pH
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sample Acids */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Acids</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {sampleAcids.map((acid, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{acid.name}</div>
                                                <div className="text-xs text-gray-600 mt-2">
                                                    Kₐ: {acid.ka}<br />
                                                    pKₐ: {acid.pka}<br />
                                                    Type: {acid.type}
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">{acid.note}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculate}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
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
                        {/* Main Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                {mode === 'ka-to-pka' ? 'pKₐ Result' :
                                    mode === 'pka-to-ka' ? 'Kₐ Result' :
                                        mode === 'ionization' ? 'Ionization Ratio' :
                                            'pH Result'}
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Calculated Value
                                    </div>
                                    {result !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {mode === 'ka-to-pka' ? result.toFixed(2) :
                                                    mode === 'pka-to-ka' ?
                                                        (showScientific ? result.toExponential(2) : result.toFixed(10)) :
                                                        mode === 'ionization' ? result.toFixed(3) :
                                                            result.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {mode === 'ka-to-pka' ? 'pKₐ' :
                                                    mode === 'pka-to-ka' ? 'Kₐ' :
                                                        mode === 'ionization' ? '[A⁻]/[HA]' :
                                                            'pH'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Results */}
                            {ionizationPercent !== null && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Ionized Form</div>
                                        <div className="text-2xl font-bold">{ionizationPercent.toFixed(1)}%</div>
                                        <div className="text-xs mt-1 text-blue-100">
                                            {conjugateForm}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        {result !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Interpretation
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {mode === 'ka-to-pka' ? getAcidStrength(result) :
                                                mode === 'ionization' && ionizationPercent ? getIonizationInterpretation(ionizationPercent) :
                                                    mode === 'ph-from-pka' ?
                                                        (result < 7 ? 'Acidic solution' : result > 7 ? 'Basic solution' : 'Neutral solution') :
                                                        'Result calculated'}
                                        </p>
                                    </div>

                                    {mode === 'ionization' && ionizationPercent !== null && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Ionized (A⁻):</span>
                                                <span className="font-semibold">{ionizationPercent.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Unionized (HA):</span>
                                                <span className="font-semibold">{(100 - ionizationPercent).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Ratio [A⁻]/[HA]:</span>
                                                <span className="font-semibold">{result.toFixed(3)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ionization Visualization */}
                        {mode === 'ionization' && ionizationPercent !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Ionization Distribution</h3>
                                <div className="h-48 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        {/* Ionized bar */}
                                        <div
                                            className="h-32 bg-gradient-to-r from-blue-400 to-green-400 rounded-l-lg transition-all duration-500"
                                            style={{ width: `${ionizationPercent}%` }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                                A⁻
                                            </div>
                                        </div>
                                        {/* Unionized bar */}
                                        <div
                                            className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-r-lg transition-all duration-500"
                                            style={{ width: `${100 - ionizationPercent}%` }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                                                HA
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-sm">
                                        <div className="text-center">
                                            <div className="font-semibold text-blue-600">Ionized</div>
                                            <div>{ionizationPercent.toFixed(1)}%</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-purple-600">Unionized</div>
                                            <div>{(100 - ionizationPercent).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Acid Strength Guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Acid Strength Guide</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-red-700">Strong acids:</div>
                                    <div className="text-gray-600 mt-1">pKₐ &lt; 0 (HCl, H₂SO₄)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-orange-700">Moderate acids:</div>
                                    <div className="text-gray-600 mt-1">pKₐ 0-4 (Acetic acid)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-blue-700">Weak acids:</div>
                                    <div className="text-gray-600 mt-1">pKₐ 4-10 (Ammonium)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-purple-700">Very weak:</div>
                                    <div className="text-gray-600 mt-1">pKₐ  &lt; 10 (Water)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acid-Base Principles */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Acid-Base Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Kₐ and pKₐ</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Kₐ = [H⁺][A⁻]/[HA]</p>
                                <p>• pKₐ = -log₁₀(Kₐ)</p>
                                <p>• Larger Kₐ = stronger acid</p>
                                <p>• Smaller pKₐ = stronger acid</p>
                                <p>• pKₐ = pH when [HA] = [A⁻]</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Ionization State</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• pH &lt; pKₐ: Predominantly HA</p>
                                <p>• pH = pKₐ: 50% ionized</p>
                                <p>• pH &gt; pKₐ: Predominantly A⁻</p>
                                <p>• Affects solubility</p>
                                <p>• Affects membrane permeability</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Applications</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Buffer preparation</p>
                                <p>• Drug absorption prediction</p>
                                <p>• Protein structure</p>
                                <p>• Analytical method development</p>
                                <p>• Solubility optimization</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}