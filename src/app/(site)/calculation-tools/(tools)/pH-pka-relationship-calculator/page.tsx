"use client";
import { useState, useEffect } from 'react';
import { Calculator, Beaker, FlaskConical, Droplet, Activity, LineChart, AlertCircle } from 'lucide-react';

export default function PkaPhCalculator() {
    // State variables for calculator inputs
    const [pH, setPH] = useState('');
    const [pKa, setPKa] = useState('');
    const [ratio, setRatio] = useState('');
    const [acidConcentration, setAcidConcentration] = useState('');
    const [baseConcentration, setBaseConcentration] = useState('');
    const [solveFor, setSolveFor] = useState('pH'); // 'pH', 'pKa', 'ratio', 'concentrations'
    const [result, setResult] = useState<{
        value?: string;
        details?: string;
        acidFraction?: string;
        baseFraction?: string;
        bufferCapacity?: string;
        error?: string | null;
    } | null>(null);

    // Units state
    const [concentrationUnit, setConcentrationUnit] = useState('M');
    const [showConcentrationInputs, setShowConcentrationInputs] = useState(false);

    /**
     * Calculate using Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA])
     */
    const calculateHendersonHasselbalch = () => {
        // Parse input values
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
                    // pH = pKa + log(ratio)
                    if (isNaN(pKaValue) || isNaN(ratioValue) || ratioValue <= 0) {
                        setResult({
                            error: 'Please enter valid pKa and ratio (ratio must be positive)'
                        });
                        return;
                    }
                    calculatedValue = pKaValue + Math.log10(ratioValue);
                    calculatedRatio = ratioValue;
                    acidFraction = 1 / (1 + ratioValue);
                    baseFraction = ratioValue / (1 + ratioValue);
                    break;

                case 'pKa':
                    // pKa = pH - log(ratio)
                    if (isNaN(phValue) || isNaN(ratioValue) || ratioValue <= 0) {
                        setResult({
                            error: 'Please enter valid pH and ratio (ratio must be positive)'
                        });
                        return;
                    }
                    calculatedValue = phValue - Math.log10(ratioValue);
                    calculatedRatio = ratioValue;
                    acidFraction = 1 / (1 + ratioValue);
                    baseFraction = ratioValue / (1 + ratioValue);
                    break;

                case 'ratio':
                    // ratio = 10^(pH - pKa)
                    if (isNaN(phValue) || isNaN(pKaValue)) {
                        setResult({
                            error: 'Please enter valid pH and pKa values'
                        });
                        return;
                    }
                    calculatedValue = Math.pow(10, phValue - pKaValue);
                    calculatedRatio = calculatedValue;
                    acidFraction = 1 / (1 + calculatedValue);
                    baseFraction = calculatedValue / (1 + calculatedValue);
                    break;

                case 'concentrations':
                    // Calculate ratio from concentrations: [base]/[acid]
                    if (isNaN(acidConc) || isNaN(baseConc) || acidConc < 0 || baseConc < 0) {
                        setResult({
                            error: 'Please enter valid positive concentrations'
                        });
                        return;
                    }
                    if (acidConc === 0 && baseConc === 0) {
                        setResult({
                            error: 'Both concentrations cannot be zero'
                        });
                        return;
                    }
                    calculatedValue = acidConc === 0 ? Infinity : baseConc / acidConc;
                    calculatedRatio = calculatedValue;
                    acidFraction = acidConc / (acidConc + baseConc);
                    baseFraction = baseConc / (acidConc + baseConc);
                    
                    // Calculate pH if pKa is provided
                    if (!isNaN(pKaValue)) {
                        setPH((pKaValue + Math.log10(calculatedValue)).toFixed(2));
                    }
                    break;

                default:
                    setResult({ error: 'Invalid calculation mode' });
                    return;
            }

            // Calculate buffer capacity (approximation)
            bufferCapacity = 2.303 * (acidFraction * baseFraction) * 100;

            // Handle special cases
            if (calculatedValue === Infinity || calculatedValue === -Infinity) {
                setResult({
                    error: 'Calculation resulted in infinite value. Check your inputs.'
                });
                return;
            }

            if (isNaN(calculatedValue)) {
                setResult({
                    error: 'Invalid calculation result. Please check your inputs.'
                });
                return;
            }

            // Store calculation results
            setResult({
                value: solveFor === 'ratio' 
                    ? calculatedValue.toFixed(4)
                    : calculatedValue.toFixed(2),
                details: solveFor === 'ratio' 
                    ? `[A⁻]/[HA] = ${calculatedValue.toFixed(4)}` 
                    : solveFor === 'pH'
                    ? `pH = ${calculatedValue.toFixed(2)}`
                    : `pKa = ${calculatedValue.toFixed(2)}`,
                acidFraction: (acidFraction * 100).toFixed(1),
                baseFraction: (baseFraction * 100).toFixed(1),
                bufferCapacity: bufferCapacity.toFixed(1),
                error: null
            });

        } catch (error) {
            setResult({
                error: 'An error occurred during calculation. Please check your inputs.'
            });
        }
    };

    /**
     * Reset all input fields and clear results
     */
    const handleReset = () => {
        setPH('');
        setPKa('');
        setRatio('');
        setAcidConcentration('');
        setBaseConcentration('');
        setSolveFor('pH');
        setResult(null);
    };

    /**
     * Generate titration curve data points
     */
    const generateTitrationCurve = () => {
        if (!pKa || isNaN(parseFloat(pKa))) return [];
        
        const pKaValue = parseFloat(pKa);
        const points = [];
        
        for (let ph = 0; ph <= 14; ph += 0.5) {
            const ratio = Math.pow(10, ph - pKaValue);
            const baseFraction = (ratio / (1 + ratio)) * 100;
            const acidFraction = 100 - baseFraction;
            
            points.push({
                pH: ph,
                ratio: ratio,
                basePercent: baseFraction,
                acidPercent: acidFraction
            });
        }
        
        return points;
    };

    /**
     * Get the label for the variable being solved
     */
    const getVariableLabel = (variable: string): string => {
        const labels: { [key: string]: string } = {
            'pH': 'pH',
            'pKa': 'pKa',
            'ratio': 'Ratio [A⁻]/[HA]',
            'concentrations': 'Calculate from Concentrations'
        };
        return labels[variable] || variable;
    };

    /**
     * Get buffer effectiveness message
     */
    const getBufferEffectiveness = (ph: number, pKa: number): string => {
        const diff = Math.abs(ph - pKa);
        if (diff <= 0.5) return "Excellent buffer capacity (pH within ±0.5 of pKa)";
        if (diff <= 1.0) return "Good buffer capacity (pH within ±1.0 of pKa)";
        if (diff <= 1.5) return "Moderate buffer capacity (pH within ±1.5 of pKa)";
        return "Poor buffer capacity (pH more than ±1.5 from pKa)";
    };

    // Auto-calculate when inputs change for some modes
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

    const titrationCurveData = generateTitrationCurve();

    return (
        <section id="pka-ph-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="mt-6 px-4 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Activity className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                pKa & pH Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Calculate buffer parameters using the Henderson-Hasselbalch equation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calculator Card */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8">
                            {/* Formula Display */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <LineChart className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-blue-600">Henderson-Hasselbalch Equation</h3>
                                </div>
                                <p className="text-center text-blue-800 font-mono text-lg font-bold">
                                    pH = pKa + log([A⁻]/[HA])
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-blue-700">
                                    <div className="text-center">
                                        <p><strong>pH</strong> = Solution acidity</p>
                                        <p><strong>pKa</strong> = Acid dissociation constant</p>
                                    </div>
                                    <div className="text-center">
                                        <p><strong>[A⁻]</strong> = Conjugate base concentration</p>
                                        <p><strong>[HA]</strong> = Weak acid concentration</p>
                                    </div>
                                </div>
                            </div>

                            {/* Solve For Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    What do you want to calculate?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['pH', 'pKa', 'ratio', 'concentrations'].map((variable) => (
                                        <button
                                            key={variable}
                                            onClick={() => {
                                                setSolveFor(variable);
                                                if (variable === 'concentrations') {
                                                    setShowConcentrationInputs(true);
                                                } else {
                                                    setShowConcentrationInputs(false);
                                                }
                                            }}
                                            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                                                solveFor === variable
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {getVariableLabel(variable)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-5">
                                {/* pH Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        pH
                                        {solveFor === 'pH' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={pH}
                                        onChange={(e) => setPH(e.target.value)}
                                        placeholder={solveFor === 'pH' ? 'This will be calculated' : 'Enter pH (0-14)'}
                                        disabled={solveFor === 'pH'}
                                        min="0"
                                        max="14"
                                        step="0.01"
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                            solveFor === 'pH' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                        }`}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Solution acidity (typically 0-14 scale)
                                    </p>
                                </div>

                                {/* pKa Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        pKa
                                        {solveFor === 'pKa' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={pKa}
                                        onChange={(e) => setPKa(e.target.value)}
                                        placeholder={solveFor === 'pKa' ? 'This will be calculated' : 'Enter pKa'}
                                        disabled={solveFor === 'pKa'}
                                        step="0.01"
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                            solveFor === 'pKa' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                        }`}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Acid dissociation constant (typical range: 0-14)
                                    </p>
                                </div>

                                {/* Ratio Input */}
                                {!showConcentrationInputs && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ratio [A⁻]/[HA]
                                            {solveFor === 'ratio' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={ratio}
                                            onChange={(e) => setRatio(e.target.value)}
                                            placeholder={solveFor === 'ratio' ? 'This will be calculated' : 'Enter ratio (e.g., 1 for equal amounts)'}
                                            disabled={solveFor === 'ratio'}
                                            step="0.001"
                                            min="0"
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                                solveFor === 'ratio' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                            }`}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Base-to-acid concentration ratio (must be ≥ 0)
                                        </p>
                                    </div>
                                )}

                                {/* Concentration Inputs */}
                                {showConcentrationInputs && (
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-gray-700">Concentration Inputs</h4>
                                            <div className="flex items-center">
                                                <span className="text-xs text-gray-500 mr-2">Unit:</span>
                                                <select 
                                                    value={concentrationUnit}
                                                    onChange={(e) => setConcentrationUnit(e.target.value)}
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                >
                                                    {['M', 'mM', 'μM', 'nM'].map(unit => (
                                                        <option key={unit} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                [HA] - Acid Concentration
                                            </label>
                                            <input
                                                type="number"
                                                value={acidConcentration}
                                                onChange={(e) => setAcidConcentration(e.target.value)}
                                                placeholder="Enter acid concentration"
                                                step="0.001"
                                                min="0"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Weak acid concentration ({concentrationUnit})
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                [A⁻] - Base Concentration
                                            </label>
                                            <input
                                                type="number"
                                                value={baseConcentration}
                                                onChange={(e) => setBaseConcentration(e.target.value)}
                                                placeholder="Enter base concentration"
                                                step="0.001"
                                                min="0"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Conjugate base concentration ({concentrationUnit})
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Ratio Buttons */}
                                {!showConcentrationInputs && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={calculateHendersonHasselbalch}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <Calculator className="w-5 h-5 mr-2" />
                                    Calculate
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 bg-green-400 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
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
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-400 rounded-lg p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                                Calculation Results
                                            </h3>

                                            {/* Main Result */}
                                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {solveFor === 'pH' ? 'pH' : solveFor === 'pKa' ? 'pKa' : 'Ratio'}
                                                </p>
                                                <p className="text-3xl font-bold text-blue-600">
                                                    {result.value}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {result.details}
                                                </p>
                                            </div>

                                            {/* Buffer Composition */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">% HA (Acid Form)</p>
                                                    <p className="text-2xl font-bold text-red-500">
                                                        {result.acidFraction}%
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1">% A⁻ (Base Form)</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {result.baseFraction}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Buffer Capacity */}
                                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
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
                                                {pH && pKa && !isNaN(parseFloat(pH)) && !isNaN(parseFloat(pKa)) && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        {getBufferEffectiveness(parseFloat(pH), parseFloat(pKa))}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Buffer Range Info */}
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <p className="text-xs font-semibold text-blue-800 mb-2">🎯 Effective Buffer Range:</p>
                                                <p className="text-xs text-blue-700">
                                                    This buffer is most effective when pH is within ±1.0 unit of pKa (pKa - 1 to pKa + 1).
                                                    Maximum buffer capacity occurs at pH = pKa (ratio = 1:1).
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Information and Common Buffers */}
                        <div className="space-y-6">
                            {/* Common Biological Buffers */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Common Biological Buffers</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Acetic Acid', pKa: '4.76', range: '3.8-5.8' },
                                        { name: 'Phosphate (pKa2)', pKa: '7.20', range: '6.2-8.2' },
                                        { name: 'HEPES', pKa: '7.55', range: '6.8-8.2' },
                                        { name: 'Tris', pKa: '8.06', range: '7.0-9.0' },
                                        { name: 'Borate', pKa: '9.24', range: '8.2-10.2' },
                                        { name: 'Carbonate (pKa1)', pKa: '6.35', range: '5.4-7.4' },
                                        { name: 'Carbonate (pKa2)', pKa: '10.33', range: '9.3-11.3' },
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

                            {/* Key Concepts */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Key Concepts</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">What is pKa?</h4>
                                        <p className="text-xs text-gray-600">
                                            pKa is the negative base-10 logarithm of the acid dissociation constant (Ka).
                                            It indicates the pH at which half of the molecules are protonated.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Buffer Capacity</h4>
                                        <p className="text-xs text-gray-600">
                                            Maximum buffer capacity occurs at pH = pKa (ratio = 1:1).
                                            Buffers are most effective within ±1 pH unit of their pKa.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">When pH = pKa</h4>
                                        <p className="text-xs text-gray-600">
                                            [HA] = [A⁻] (50% acid, 50% base form)
                                            The buffer has maximum resistance to pH changes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Reference */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Ratio [A⁻]/[HA]</span>
                                        <span className="text-sm font-semibold text-gray-800">pH - pKa</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">0.1</span>
                                        <span className="text-sm font-semibold text-gray-800">-1.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">1.0</span>
                                        <span className="text-sm font-semibold text-gray-800">0.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">10.0</span>
                                        <span className="text-sm font-semibold text-gray-800">+1.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">100.0</span>
                                        <span className="text-sm font-semibold text-gray-800">+2.0</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    For every 10× change in ratio, pH changes by 1 unit relative to pKa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Titration Curve Visualization */}
                    {titrationCurveData.length > 0 && (
                        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Titration Curve (pKa = {pKa})</h3>
                            <div className="h-64 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Simplified titration curve visualization */}
                                    <div className="w-full h-48 relative border border-gray-300 rounded-lg p-2">
                                        {/* Grid lines */}
                                        <div className="absolute inset-0 grid grid-cols-14 grid-rows-1 gap-0">
                                            {Array.from({ length: 15 }).map((_, i) => (
                                                <div key={i} className="border-r border-gray-200"></div>
                                            ))}
                                        </div>
                                        
                                        {/* Curve */}
                                        <div className="absolute inset-0">
                                            {titrationCurveData.map((point, index) => {
                                                if (index === 0) return null;
                                                const prev = titrationCurveData[index - 1];
                                                const x1 = (prev.pH / 14) * 100;
                                                const y1 = 100 - (prev.basePercent);
                                                const x2 = (point.pH / 14) * 100;
                                                const y2 = 100 - (point.basePercent);
                                                
                                                return (
                                                    <div key={index}>
                                                        <div 
                                                            className="absolute w-0.5 h-0.5 bg-blue-600 rounded-full"
                                                            style={{
                                                                left: `${x2}%`,
                                                                top: `${y2}%`,
                                                                transform: 'translate(-50%, -50%)'
                                                            }}
                                                        />
                                                        <div 
                                                            className="absolute bg-blue-200 opacity-30"
                                                            style={{
                                                                left: `${x1}%`,
                                                                top: `${y1}%`,
                                                                width: `${x2 - x1}%`,
                                                                height: '2px',
                                                                transform: `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* pKa line */}
                                        <div 
                                            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                            style={{ left: `${(parseFloat(pKa) / 14) * 100}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600">
                                                pKa = {pKa}
                                            </div>
                                        </div>
                                        
                                        {/* Axes labels */}
                                        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-500">
                                            pH (0 to 14)
                                        </div>
                                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-500">
                                            % Base Form
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Shows how the percentage of base form changes with pH for this pKa value.
                                The red line indicates the pKa point where [HA] = [A⁻].
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}