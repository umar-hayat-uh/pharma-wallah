"use client";
import { useState, useEffect } from 'react';
import {
    Beaker,
    Calculator,
    TrendingUp,
    RefreshCw,
    AlertCircle,
    Eye,
    Target,
    Activity,
    Gauge,
    LineChart
} from 'lucide-react';

type MolarityUnit = 'M' | 'mM' | 'μM' | 'nM';
type PathLengthUnit = 'cm' | 'mm' | 'm';

export default function BeerLambertCalculator() {
    const [method, setMethod] = useState<'absorbance' | 'concentration' | 'epsilon'>('absorbance');
    const [epsilon, setEpsilon] = useState<string>('5000');
    const [concentration, setConcentration] = useState<string>('0.001');
    const [pathLength, setPathLength] = useState<string>('1');
    const [absorbance, setAbsorbance] = useState<string>('0.5');
    const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
    const [molarityUnit, setMolarityUnit] = useState<MolarityUnit>('M');
    const [pathLengthUnit, setPathLengthUnit] = useState<PathLengthUnit>('cm');
    const [transmittance, setTransmittance] = useState<number | null>(null);

    const calculate = () => {
        const eps = parseFloat(epsilon);
        const conc = parseFloat(concentration);
        const b = parseFloat(pathLength);
        const A = parseFloat(absorbance);

        let result = 0;

        // Convert concentration to M for calculations
        let concM = conc;
        switch (molarityUnit) {
            case 'mM': concM = conc / 1000; break;
            case 'μM': concM = conc / 1000000; break;
            case 'nM': concM = conc / 1000000000; break;
        }

        // Convert path length to cm for calculations
        let bCm = b;
        switch (pathLengthUnit) {
            case 'mm': bCm = b / 10; break;
            case 'm': bCm = b * 100; break;
        }

        switch (method) {
            case 'absorbance':
                if (!isNaN(eps) && !isNaN(concM) && !isNaN(bCm)) {
                    result = eps * concM * bCm;
                    setAbsorbance(result.toFixed(4));
                }
                break;
            case 'concentration':
                if (!isNaN(A) && !isNaN(eps) && !isNaN(bCm) && eps > 0 && bCm > 0) {
                    result = A / (eps * bCm);

                    // Convert back to selected unit
                    switch (molarityUnit) {
                        case 'M': break;
                        case 'mM': result *= 1000; break;
                        case 'μM': result *= 1000000; break;
                        case 'nM': result *= 1000000000; break;
                    }
                    setConcentration(result.toFixed(8));
                }
                break;
            case 'epsilon':
                if (!isNaN(A) && !isNaN(concM) && !isNaN(bCm) && concM > 0 && bCm > 0) {
                    result = A / (concM * bCm);
                    setEpsilon(result.toFixed(0));
                }
                break;
        }

        setCalculatedValue(result);

        // Calculate transmittance
        if (!isNaN(A)) {
            const T = Math.pow(10, -A) * 100;
            setTransmittance(T);
        }
    };

    const resetCalculator = () => {
        setEpsilon('5000');
        setConcentration('0.001');
        setPathLength('1');
        setAbsorbance('0.5');
        setCalculatedValue(null);
        setTransmittance(null);
    };

    const sampleCompounds = [
        {
            name: 'NADH',
            epsilon: '6220',
            lambda: '340',
            concentration: '0.0001',
            unit: 'M' as MolarityUnit,
            note: 'Reduced form at 340 nm'
        },
        {
            name: 'DNA',
            epsilon: '6600',
            lambda: '260',
            concentration: '0.00005',
            unit: 'M' as MolarityUnit,
            note: 'Double-stranded at 260 nm'
        },
        {
            name: 'Protein',
            epsilon: '55000',
            lambda: '280',
            concentration: '0.0001',
            unit: 'M' as MolarityUnit,
            note: 'BSA at 280 nm'
        },
        {
            name: 'Methylene Blue',
            epsilon: '95000',
            lambda: '665',
            concentration: '0.00001',
            unit: 'M' as MolarityUnit,
            note: 'At 665 nm'
        }
    ];

    const loadSample = (index: number) => {
        const compound = sampleCompounds[index];
        setMethod('absorbance');
        setEpsilon(compound.epsilon);
        setConcentration(compound.concentration);
        setMolarityUnit(compound.unit);
    };

    const getAbsorbanceInterpretation = (A: number) => {
        if (A < 0.1) return 'Very low - may need higher concentration or longer pathlength';
        if (A < 0.5) return 'Ideal for accurate measurements';
        if (A < 1.0) return 'Good range';
        if (A < 2.0) return 'High - consider dilution for accurate reading';
        return 'Too high - dilute sample';
    };

    useEffect(() => {
        calculate();
    }, [method, epsilon, concentration, pathLength, absorbance, molarityUnit, pathLengthUnit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Beer-Lambert Law Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate absorbance, concentration, or molar absorptivity</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Eye className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Spectrophotometry</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Beer-Lambert Law Calculation
                            </h2>

                            {/* Method Selection */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Calculate</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setMethod('absorbance')}
                                        className={`p-4 rounded-xl transition-all ${method === 'absorbance' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <TrendingUp className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Absorbance (A)</span>
                                            <span className="text-sm mt-1">A = ε × c × l</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMethod('concentration')}
                                        className={`p-4 rounded-xl transition-all ${method === 'concentration' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Target className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Concentration (c)</span>
                                            <span className="text-sm mt-1">c = A/(ε × l)</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMethod('epsilon')}
                                        className={`p-4 rounded-xl transition-all ${method === 'epsilon' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Activity className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">Molar Absorptivity (ε)</span>
                                            <span className="text-sm mt-1">ε = A/(c × l)</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Units Selection */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Concentration Unit</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['M', 'mM', 'μM', 'nM'] as MolarityUnit[]).map((unit) => (
                                                <button
                                                    key={unit}
                                                    onClick={() => setMolarityUnit(unit)}
                                                    className={`py-2 rounded-lg transition-all ${molarityUnit === unit ?
                                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                                                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {unit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Path Length Unit</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['cm', 'mm', 'm'] as PathLengthUnit[]).map((unit) => (
                                                <button
                                                    key={unit}
                                                    onClick={() => setPathLengthUnit(unit)}
                                                    className={`py-2 rounded-lg transition-all ${pathLengthUnit === unit ?
                                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                                                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {unit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-6">
                                {/* Molar Absorptivity */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                                        Molar Absorptivity (ε)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                ε (M⁻¹cm⁻¹)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={epsilon}
                                                onChange={(e) => setEpsilon(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 5000"
                                                disabled={method === 'epsilon'}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                <div className="text-sm font-semibold text-gray-600">Typical Values</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    DNA: 6600 (260 nm)<br />
                                                    Protein: 55,000 (280 nm)<br />
                                                    NADH: 6,220 (340 nm)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Concentration */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Target className="w-5 h-5 mr-2 text-green-600" />
                                        Concentration (c)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Concentration
                                            </label>
                                            <input
                                                type="number"
                                                step="0.000000001"
                                                value={concentration}
                                                onChange={(e) => setConcentration(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="e.g., 0.001"
                                                disabled={method === 'concentration'}
                                            />
                                            <div className="text-xs text-gray-500 mt-2">
                                                Unit: {molarityUnit}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Path Length (l)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={pathLength}
                                                onChange={(e) => setPathLength(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="e.g., 1"
                                            />
                                            <div className="text-xs text-gray-500 mt-2">
                                                Unit: {pathLengthUnit}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Absorbance */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                                        Absorbance (A)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Absorbance (A)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={absorbance}
                                                onChange={(e) => setAbsorbance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                placeholder="e.g., 0.5"
                                                disabled={method === 'absorbance'}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                <div className="text-sm font-semibold text-gray-600">Ideal Range</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Optimal: 0.1 - 1.0 A<br />
                                                    Maximum reliable: ~2.0 A<br />
                                                    Minimum reliable: ~0.05 A
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Formula Display */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Beer-Lambert Law</h3>
                                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                                        <div className="font-mono text-lg mb-2 text-center">
                                            A = ε × c × l
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Where:<br />
                                            • A = Absorbance (unitless)<br />
                                            • ε = Molar absorptivity (M⁻¹cm⁻¹)<br />
                                            • c = Concentration (mol/L)<br />
                                            • l = Path length (cm)
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Compounds */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Compounds</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {sampleCompounds.map((compound, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{compound.name}</div>
                                                <div className="text-xs text-gray-600 mt-2">
                                                    ε: {compound.epsilon} M⁻¹cm⁻¹<br />
                                                    λ: {compound.lambda} nm<br />
                                                    c: {compound.concentration} {compound.unit}
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">{compound.note}</div>
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
                        {/* Calculated Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Eye className="w-7 h-7 mr-3" />
                                {method === 'absorbance' ? 'Absorbance' :
                                    method === 'concentration' ? 'Concentration' :
                                        'Molar Absorptivity'}
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Calculated Value
                                    </div>
                                    {calculatedValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {method === 'concentration' ?
                                                    parseFloat(calculatedValue.toFixed(8)).toString() :
                                                    calculatedValue.toFixed(4)
                                                }
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {method === 'absorbance' ? 'A (unitless)' :
                                                    method === 'concentration' ? `${molarityUnit}` :
                                                        'M⁻¹cm⁻¹'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transmittance */}
                            {transmittance !== null && (
                                <div className="bg-white/10 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Transmittance (T)</div>
                                        <div className="text-2xl font-bold">{transmittance.toFixed(2)}%</div>
                                        <div className="text-xs mt-1 text-blue-100">
                                            T = 10^(-A) × 100%
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        {calculatedValue !== null && method === 'absorbance' && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Measurement Quality
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getAbsorbanceInterpretation(calculatedValue)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Absorbance (A):</span>
                                            <span className="font-semibold">{calculatedValue.toFixed(4)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Transmittance (T):</span>
                                            <span className="font-semibold">{transmittance?.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">%T:</span>
                                            <span className="font-semibold">{transmittance?.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Absorbance Scale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Absorbance Scale</h3>
                            <div className="space-y-3">
                                {[
                                    { value: 0.1, label: '0.1 A', quality: 'Minimum reliable' },
                                    { value: 0.5, label: '0.5 A', quality: 'Optimal range' },
                                    { value: 1.0, label: '1.0 A', quality: 'Still accurate' },
                                    { value: 2.0, label: '2.0 A', quality: 'Maximum reliable' },
                                    { value: 3.0, label: '>2.0 A', quality: 'Too high - dilute' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-16 text-sm text-gray-600">
                                            {item.label}
                                        </div>
                                        <div className="flex-1 h-6 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg"></div>
                                        <div className="w-32 text-right text-xs text-gray-600">
                                            {item.quality}
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
                                    <div className="font-semibold text-gray-700">Relationship:</div>
                                    <div className="text-gray-600 mt-1">A = -log₁₀(T)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Transmittance:</div>
                                    <div className="text-gray-600 mt-1">T = 10^(-A)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">%T:</div>
                                    <div className="text-gray-600 mt-1">%T = T × 100%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beer-Lambert Law Details */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Beer-Lambert Law Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Assumptions</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Monochromatic light</p>
                                <p>• Non-scattering medium</p>
                                <p>• No chemical interactions</p>
                                <p>• Homogeneous solution</p>
                                <p>• No fluorescence</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Limitations</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Deviations at high concentrations</p>
                                <p>• Chemical equilibria shifts</p>
                                <p>• Scattering in turbid solutions</p>
                                <p>• Stray light effects</p>
                                <p>• Polychromatic light</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Applications</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Concentration determination</p>
                                <p>• Purity assessment</p>
                                <p>• Reaction kinetics</p>
                                <p>• Quality control</p>
                                <p>• Compound identification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}