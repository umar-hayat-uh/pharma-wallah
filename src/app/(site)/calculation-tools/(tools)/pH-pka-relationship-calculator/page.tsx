"use client";
import { useState, useEffect } from 'react';
import { Calculator, Activity, TrendingDown, Clock, AlertCircle, PieChart } from 'lucide-react';

export default function PkaPhCalculator() {
    const [pH, setPH] = useState('');
    const [pKa, setPKa] = useState('');
    const [ratio, setRatio] = useState('');
    const [acidConcentration, setAcidConcentration] = useState('');
    const [baseConcentration, setBaseConcentration] = useState('');
    const [solveFor, setSolveFor] = useState('pH');
    const [concentrationUnit, setConcentrationUnit] = useState('M');
    const [showConcentrationInputs, setShowConcentrationInputs] = useState(false);
    const [result, setResult] = useState<{
        value?: string;
        details?: string;
        acidFraction?: string;
        baseFraction?: string;
        bufferCapacity?: string;
        error?: string | null;
    } | null>(null);

    const calculateHendersonHasselbalch = () => {
        const phValue = parseFloat(pH);
        const pKaValue = parseFloat(pKa);
        const ratioValue = parseFloat(ratio);
        const acidConc = parseFloat(acidConcentration);
        const baseConc = parseFloat(baseConcentration);

        let calculatedValue: number;
        let calculatedRatio: number;
        let acidFraction: number;
        let baseFraction: number;
        let bufferCapacity: number;

        try {
            switch (solveFor) {
                case 'pH':
                    if (isNaN(pKaValue) || isNaN(ratioValue) || ratioValue <= 0) {
                        setResult({ error: 'Please enter valid pKa and ratio' });
                        return;
                    }
                    calculatedValue = pKaValue + Math.log10(ratioValue);
                    calculatedRatio = ratioValue;
                    acidFraction = 1 / (1 + ratioValue);
                    baseFraction = ratioValue / (1 + ratioValue);
                    break;

                case 'pKa':
                    if (isNaN(phValue) || isNaN(ratioValue) || ratioValue <= 0) {
                        setResult({ error: 'Please enter valid pH and ratio' });
                        return;
                    }
                    calculatedValue = phValue - Math.log10(ratioValue);
                    calculatedRatio = ratioValue;
                    acidFraction = 1 / (1 + ratioValue);
                    baseFraction = ratioValue / (1 + ratioValue);
                    break;

                case 'ratio':
                    if (isNaN(phValue) || isNaN(pKaValue)) {
                        setResult({ error: 'Please enter valid pH and pKa values' });
                        return;
                    }
                    calculatedValue = Math.pow(10, phValue - pKaValue);
                    calculatedRatio = calculatedValue;
                    acidFraction = 1 / (1 + calculatedValue);
                    baseFraction = calculatedValue / (1 + calculatedValue);
                    break;

                case 'concentrations':
                    if (isNaN(acidConc) || isNaN(baseConc) || acidConc < 0 || baseConc < 0) {
                        setResult({ error: 'Please enter valid positive concentrations' });
                        return;
                    }
                    if (acidConc === 0 && baseConc === 0) {
                        setResult({ error: 'Both concentrations cannot be zero' });
                        return;
                    }
                    calculatedValue = acidConc === 0 ? Infinity : baseConc / acidConc;
                    calculatedRatio = calculatedValue;
                    acidFraction = acidConc / (acidConc + baseConc);
                    baseFraction = baseConc / (acidConc + baseConc);
                    
                    if (!isNaN(pKaValue)) {
                        setPH((pKaValue + Math.log10(calculatedValue)).toFixed(2));
                    }
                    break;

                default:
                    setResult({ error: 'Invalid calculation mode' });
                    return;
            }

            bufferCapacity = 2.303 * (acidFraction * baseFraction) * 100;

            if (calculatedValue === Infinity || calculatedValue === -Infinity || isNaN(calculatedValue)) {
                setResult({ error: 'Invalid calculation result' });
                return;
            }

            setResult({
                value: solveFor === 'ratio' ? calculatedValue.toFixed(4) : calculatedValue.toFixed(2),
                details: solveFor === 'ratio' ? `[A⁻]/[HA] = ${calculatedValue.toFixed(4)}` : 
                        solveFor === 'pH' ? `pH = ${calculatedValue.toFixed(2)}` : 
                        `pKa = ${calculatedValue.toFixed(2)}`,
                acidFraction: (acidFraction * 100).toFixed(1),
                baseFraction: (baseFraction * 100).toFixed(1),
                bufferCapacity: bufferCapacity.toFixed(1),
                error: null
            });

        } catch (error) {
            setResult({ error: 'An error occurred during calculation' });
        }
    };

    const handleReset = () => {
        setPH('');
        setPKa('');
        setRatio('');
        setAcidConcentration('');
        setBaseConcentration('');
        setSolveFor('pH');
        setResult(null);
    };

    const getVariableLabel = (variable: string): string => {
        const labels: { [key: string]: string } = {
            'pH': 'pH',
            'pKa': 'pKa',
            'ratio': 'Ratio [A⁻]/[HA]',
            'concentrations': 'Calculate from Concentrations'
        };
        return labels[variable] || variable;
    };

    useEffect(() => {
        if (solveFor === 'concentrations' && acidConcentration && baseConcentration) {
            const acid = parseFloat(acidConcentration);
            const base = parseFloat(baseConcentration);
            if (!isNaN(acid) && !isNaN(base) && acid >= 0 && base >= 0) {
                const calculatedRatio = acid === 0 ? Infinity : base / acid;
                setRatio(calculatedRatio === Infinity ? '' : calculatedRatio.toFixed(4));
            }
        }
    }, [acidConcentration, baseConcentration, solveFor]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">pKa & pH Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate buffer parameters using Henderson-Hasselbalch equation</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Buffer Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            {/* Formula Display */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <div className="flex items-center mb-2">
                                    <PieChart className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-blue-800">Henderson-Hasselbalch Equation</h3>
                                </div>
                                <p className="text-center text-blue-900 font-mono text-2xl font-bold">
                                    pH = pKa + log([A⁻]/[HA])
                                </p>
                            </div>

                            {/* Solve For Selector */}
                            <div className="mb-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-4">
                                    What do you want to calculate?
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['pH', 'pKa', 'ratio', 'concentrations'].map((variable) => (
                                        <button
                                            key={variable}
                                            onClick={() => {
                                                setSolveFor(variable);
                                                setShowConcentrationInputs(variable === 'concentrations');
                                            }}
                                            className={`p-4 rounded-xl transition-all ${
                                                solveFor === variable
                                                    ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <span className="font-semibold">{getVariableLabel(variable)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* pH Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            pH
                                            {solveFor === 'pH' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={pH}
                                            onChange={(e) => setPH(e.target.value)}
                                            placeholder={solveFor === 'pH' ? 'Calculating...' : 'Enter pH (0-14)'}
                                            disabled={solveFor === 'pH'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'pH' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            min="0"
                                            max="14"
                                            step="0.01"
                                        />
                                    </div>

                                    {/* pKa Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            pKa
                                            {solveFor === 'pKa' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={pKa}
                                            onChange={(e) => setPKa(e.target.value)}
                                            placeholder={solveFor === 'pKa' ? 'Calculating...' : 'Enter pKa'}
                                            disabled={solveFor === 'pKa'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'pKa' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Ratio Input */}
                                    {!showConcentrationInputs && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Ratio [A⁻]/[HA]
                                                {solveFor === 'ratio' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                            </label>
                                            <input
                                                type="number"
                                                value={ratio}
                                                onChange={(e) => setRatio(e.target.value)}
                                                placeholder={solveFor === 'ratio' ? 'Calculating...' : 'Enter ratio'}
                                                disabled={solveFor === 'ratio'}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                    solveFor === 'ratio' 
                                                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                        : 'border-blue-200 focus:border-blue-500'
                                                }`}
                                                step="0.001"
                                                min="0"
                                            />
                                        </div>
                                    )}

                                    {/* Concentration Inputs */}
                                    {showConcentrationInputs && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    [HA] - Acid Concentration
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        value={acidConcentration}
                                                        onChange={(e) => setAcidConcentration(e.target.value)}
                                                        placeholder="Enter acid concentration"
                                                        className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                                        step="0.001"
                                                        min="0"
                                                    />
                                                    <select 
                                                        value={concentrationUnit}
                                                        onChange={(e) => setConcentrationUnit(e.target.value)}
                                                        className="w-24 px-3 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                                    >
                                                        {['M', 'mM', 'μM', 'nM'].map(unit => (
                                                            <option key={unit} value={unit}>{unit}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    [A⁻] - Base Concentration
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        value={baseConcentration}
                                                        onChange={(e) => setBaseConcentration(e.target.value)}
                                                        placeholder="Enter base concentration"
                                                        className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                                        step="0.001"
                                                        min="0"
                                                    />
                                                    <span className="w-24 px-3 py-3 border-2 border-blue-200 rounded-lg bg-gray-50">
                                                        {concentrationUnit}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Quick Ratio Buttons */}
                                {!showConcentrationInputs && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Common Ratios:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: '1:10', value: '0.1' },
                                                { label: '1:4', value: '0.25' },
                                                { label: '1:2', value: '0.5' },
                                                { label: '1:1', value: '1' },
                                                { label: '2:1', value: '2' },
                                                { label: '4:1', value: '4' },
                                                { label: '10:1', value: '10' },
                                            ].map(({ label, value }) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() => setRatio(value)}
                                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateHendersonHasselbalch}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Results Section */}
                            {result && (
                                <div className="mt-6">
                                    {result.error ? (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                                <p className="text-red-800 font-medium">
                                                    {result.error}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                                Calculation Results
                                            </h3>

                                            {/* Main Result */}
                                            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {solveFor === 'pH' ? 'pH' : solveFor === 'pKa' ? 'pKa' : 'Ratio'}
                                                </p>
                                                <p className="text-4xl font-bold text-blue-600">
                                                    {result.value}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {result.details}
                                                </p>
                                            </div>

                                            {/* Buffer Composition */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">% HA (Acid Form)</p>
                                                    <p className="text-2xl font-bold text-red-500">
                                                        {result.acidFraction}%
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">% A⁻ (Base Form)</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {result.baseFraction}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Buffer Capacity */}
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">Relative Buffer Capacity</p>
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div 
                                                                className="bg-green-400 h-2.5 rounded-full" 
                                                                style={{ width: `${Math.min(100, parseFloat(result.bufferCapacity || '0'))}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <span className="ml-3 text-lg font-bold text-green-600">
                                                        {result.bufferCapacity}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Common Buffers */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Biological Buffers</h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Acetic Acid', pKa: '4.76', range: '3.8-5.8' },
                                    { name: 'Phosphate (pKa2)', pKa: '7.20', range: '6.2-8.2' },
                                    { name: 'HEPES', pKa: '7.55', range: '6.8-8.2' },
                                    { name: 'Tris', pKa: '8.06', range: '7.0-9.0' },
                                    { name: 'Borate', pKa: '9.24', range: '8.2-10.2' },
                                ].map((buffer) => (
                                    <div 
                                        key={buffer.name}
                                        className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                        onClick={() => {
                                            setPKa(buffer.pKa);
                                            setSolveFor('pH');
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{buffer.name}</span>
                                            <span className="font-bold text-blue-600">{buffer.pKa}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">pH range: {buffer.range}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">pH = pKa</span>
                                    <span className="font-semibold text-blue-600">[A⁻] = [HA]</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">pH = pKa - 1</span>
                                    <span className="font-semibold text-green-600">[A⁻]/[HA] = 0.1</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">pH = pKa + 1</span>
                                    <span className="font-semibold text-purple-600">[A⁻]/[HA] = 10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}