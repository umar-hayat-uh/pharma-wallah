"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical, Droplet, Scale, Weight, Thermometer, AlertCircle, RefreshCw } from 'lucide-react';

export default function PercentageSolutionCalculator() {
    // ... (state variables unchanged) ...
    const [percentageType, setPercentageType] = useState('wv'); // 'wv', 'vv', 'ww'
    const [solveFor, setSolveFor] = useState('solute'); // 'solute', 'solvent', 'percentage', 'solution'
    const [percentage, setPercentage] = useState('');
    const [soluteValue, setSoluteValue] = useState('');
    const [solventValue, setSolventValue] = useState('');
    const [solutionValue, setSolutionValue] = useState('');

    // Units state
    const [soluteUnit, setSoluteUnit] = useState('g');
    const [solventUnit, setSolventUnit] = useState('mL');
    const [solutionUnit, setSolutionUnit] = useState('mL');

    // Result state
    const [result, setResult] = useState<{
        value?: string;
        unit?: string;
        details?: string;
        error?: string | null;
    } | null>(null);

    const [significantFigures, setSignificantFigures] = useState<number>(4);

    /**
     * Get units based on percentage type
     */
    const getUnits = () => {
        switch (percentageType) {
            case 'wv': // Weight/Volume
                return {
                    solute: ['g', 'mg', 'μg'],
                    solvent: ['mL', 'L', 'μL'],
                    solution: ['mL', 'L', 'μL']
                };
            case 'vv': // Volume/Volume
                return {
                    solute: ['mL', 'L', 'μL'],
                    solvent: ['mL', 'L', 'μL'],
                    solution: ['mL', 'L', 'μL']
                };
            case 'ww': // Weight/Weight
                return {
                    solute: ['g', 'mg', 'μg'],
                    solvent: ['g', 'mg', 'μg'],
                    solution: ['g', 'mg', 'μg']
                };
            default:
                return {
                    solute: ['g', 'mg', 'μg'],
                    solvent: ['mL', 'L', 'μL'],
                    solution: ['mL', 'L', 'μL']
                };
        }
    };

    /**
     * Calculate percentage solution
     */
    const calculatePercentageSolution = () => {
        const pct = parseFloat(percentage);
        const solute = parseFloat(soluteValue);
        const solvent = parseFloat(solventValue);
        const solution = parseFloat(solutionValue);

        let calculatedValue: number;
        let calculatedUnit: string;
        let details: string;

        try {
            switch (solveFor) {
                case 'percentage':
                    // Calculate percentage
                    if (percentageType === 'wv') {
                        // % (w/v) = (solute weight / solution volume) × 100
                        if (isNaN(solute) || isNaN(solution) || solution <= 0) {
                            setResult({ error: 'Please enter valid solute weight and solution volume' }); return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (w/v)';
                        details = `% (w/v) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
                    } else if (percentageType === 'vv') {
                        // % (v/v) = (solute volume / solution volume) × 100
                        if (isNaN(solute) || isNaN(solution) || solution <= 0) {
                            setResult({ error: 'Please enter valid solute volume and solution volume' }); return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (v/v)';
                        details = `% (v/v) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
                    } else {
                        // % (w/w) = (solute weight / solution weight) × 100
                        if (isNaN(solute) || isNaN(solution) || solution <= 0) {
                            setResult({ error: 'Please enter valid solute weight and solution weight' }); return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (w/w)';
                        details = `% (w/w) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
                    }
                    break;

                case 'solute':
                    // Calculate solute amount
                    if (isNaN(pct) || pct <= 0) {
                        setResult({ error: 'Please enter a valid positive percentage' }); return;
                    }
                    if (percentageType === 'wv' || percentageType === 'vv') {
                        if (isNaN(solution) || solution <= 0) {
                            setResult({ error: 'Please enter valid solution volume' }); return;
                        }
                        calculatedValue = (pct / 100) * solution;
                        calculatedUnit = soluteUnit;
                        details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
                    } else { // ww
                        if (isNaN(solution) || solution <= 0) {
                            setResult({ error: 'Please enter valid solution weight' }); return;
                        }
                        calculatedValue = (pct / 100) * solution;
                        calculatedUnit = soluteUnit;
                        details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
                    }
                    break;

                case 'solvent':
                    // Calculate solvent amount
                    if (percentageType === 'ww') {
                        if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) {
                            setResult({ error: 'Please enter valid solution weight and solute weight' }); return;
                        }
                        if (solute > solution) {
                            setResult({ error: 'Solute weight cannot be greater than solution weight' }); return;
                        }
                        calculatedValue = solution - solute;
                        calculatedUnit = solventUnit;
                        details = `Solvent = ${solution}${solutionUnit} - ${solute}${soluteUnit}`;
                    } else {
                        if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) {
                            setResult({ error: 'Please enter valid solution volume and solute amount' }); return;
                        }
                        if (solute > solution) {
                            setResult({ error: 'Solute cannot be greater than solution volume' }); return;
                        }
                        calculatedValue = solution - solute;
                        calculatedUnit = solventUnit;
                        details = `Solvent = ${solution}${solutionUnit} - ${solute}${soluteUnit}`;
                    }
                    break;

                case 'solution':
                    // Calculate solution amount
                    if (isNaN(pct) || pct <= 0) {
                        setResult({ error: 'Please enter a valid positive percentage' }); return;
                    }
                    if (isNaN(solute) || solute <= 0) {
                        setResult({ error: 'Please enter valid solute amount' }); return;
                    }
                    calculatedValue = solute / (pct / 100);
                    calculatedUnit = solutionUnit;
                    details = `Solution = ${solute}${soluteUnit} / (${pct}% / 100)`;
                    break;

                default:
                    setResult({ error: 'Invalid calculation mode' }); return;
            }

            if (isNaN(calculatedValue) || calculatedValue < 0) {
                setResult({ error: 'Invalid calculation result. Please check your inputs.' }); return;
            }

            const factor = Math.pow(10, significantFigures);
            const rounded = Math.round(calculatedValue * factor) / factor;

            setResult({
                value: rounded.toString(),
                unit: calculatedUnit,
                details: details,
                error: null
            });

        } catch (error) {
            setResult({ error: 'An error occurred during calculation. Please check your inputs.' });
        }
    };

    const resetCalculator = () => {
        setPercentage('');
        setSoluteValue('');
        setSolventValue('');
        setSolutionValue('');
        setSolveFor('solute');
        setResult(null);
    };

    const handlePercentageTypeChange = (type: string) => {
        setPercentageType(type);
        const units = getUnits();
        setSoluteUnit(units.solute[0]);
        setSolventUnit(units.solvent[0]);
        setSolutionUnit(units.solution[0]);
        setResult(null);
    };

    const getSolveForLabel = (type: string): string => {
        const labels: { [key: string]: string } = {
            'percentage': 'Percentage (%)',
            'solute': 'Solute Amount',
            'solvent': 'Solvent Amount',
            'solution': 'Total Solution'
        };
        return labels[type] || type;
    };

    const getTypeDescription = (type: string): string => {
        switch (type) {
            case 'wv': return 'Weight/Volume (w/v): Mass of solute per volume of solution';
            case 'vv': return 'Volume/Volume (v/v): Volume of solute per volume of solution';
            case 'ww': return 'Weight/Weight (w/w): Mass of solute per mass of solution';
            default: return '';
        }
    };

    const getFormula = (type: string): string => {
        switch (type) {
            case 'wv': return '% (w/v) = (solute weight / solution volume) × 100';
            case 'vv': return '% (v/v) = (solute volume / solution volume) × 100';
            case 'ww': return '% (w/w) = (solute weight / solution weight) × 100';
            default: return '';
        }
    };

    const getCommonPercentages = () => {
        switch (percentageType) {
            case 'wv': return ['0.1', '0.5', '1.0', '5.0', '10.0', '20.0', '50.0'];
            case 'vv': return ['0.1', '0.5', '1.0', '5.0', '10.0', '25.0', '50.0', '70.0', '100.0'];
            case 'ww': return ['0.1', '0.5', '1.0', '5.0', '10.0', '20.0', '50.0'];
            default: return ['0.1', '1.0', '5.0', '10.0', '20.0', '50.0'];
        }
    };

    const commonSolutions = [
        { name: 'Physiological Saline', type: 'w/v', percentage: '0.9', solute: 'NaCl', solvent: 'Water' },
        { name: 'Ethanol for Disinfection', type: 'v/v', percentage: '70', solute: 'Ethanol', solvent: 'Water' },
        { name: 'Glucose Solution', type: 'w/v', percentage: '5', solute: 'D-Glucose', solvent: 'Water' },
        { name: 'Acetic Acid (Vinegar)', type: 'v/v', percentage: '5', solute: 'Acetic acid', solvent: 'Water' },
        { name: 'SDS Solution', type: 'w/v', percentage: '10', solute: 'SDS', solvent: 'Water' },
        { name: 'Agarose Gel', type: 'w/v', percentage: '1', solute: 'Agarose', solvent: 'TAE/TBE buffer' },
    ];

    const units = getUnits();
    const commonPercentages = getCommonPercentages();

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Percentage Solution Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate w/v, v/v, and w/w percentage solutions for laboratory preparations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Calculator className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Solution Prep</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
                                Solution Parameters
                            </h2>

                            {/* Percentage Type Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Percentage Solution Type
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'wv', label: 'Weight/Volume (w/v)', icon: <Weight className="w-4 h-4 mr-2" /> },
                                        { id: 'vv', label: 'Volume/Volume (v/v)', icon: <Droplet className="w-4 h-4 mr-2" /> },
                                        { id: 'ww', label: 'Weight/Weight (w/w)', icon: <Scale className="w-4 h-4 mr-2" /> },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => handlePercentageTypeChange(type.id)}
                                            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${percentageType === type.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type.icon}
                                            <span className="hidden xs:inline">{type.label}</span>
                                            <span className="xs:hidden">{type.id.toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {getTypeDescription(percentageType)}
                                </p>
                            </div>

                            {/* Formula Display */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-blue-600">Formula</h3>
                                </div>
                                <p className="text-center text-blue-800 font-mono text-sm sm:text-lg font-bold">
                                    {getFormula(percentageType)}
                                </p>
                            </div>

                            {/* Solve For Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    What do you want to calculate?
                                </label>
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                                    {['solute', 'solvent', 'solution', 'percentage'].map((variable) => (
                                        <button
                                            key={variable}
                                            onClick={() => setSolveFor(variable)}
                                            className={`py-3 px-4 rounded-lg font-semibold transition-all ${solveFor === variable
                                                    ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getSolveForLabel(variable)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-5">
                                {/* Percentage Input */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Percentage (%)
                                        {solveFor === 'percentage' && <span className="text-green-600 ml-2">← Calculating this</span>}
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="number"
                                            value={percentage}
                                            onChange={(e) => setPercentage(e.target.value)}
                                            placeholder={solveFor === 'percentage' ? 'This will be calculated' : 'Enter percentage'}
                                            disabled={solveFor === 'percentage'}
                                            min="0"
                                            max={percentageType === 'vv' ? '100' : undefined}
                                            step="0.01"
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors ${solveFor === 'percentage' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {commonPercentages.map((pct) => (
                                                <button
                                                    key={pct}
                                                    type="button"
                                                    onClick={() => setPercentage(pct)}
                                                    disabled={solveFor === 'percentage'}
                                                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {pct}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Solute Input */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Solute Amount
                                        {solveFor === 'solute' && <span className="text-green-600 ml-2">← Calculating this</span>}
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="number"
                                            value={soluteValue}
                                            onChange={(e) => setSoluteValue(e.target.value)}
                                            placeholder={solveFor === 'solute' ? 'This will be calculated' : 'Enter solute amount'}
                                            disabled={solveFor === 'solute'}
                                            step="0.001"
                                            min="0"
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors ${solveFor === 'solute' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <select
                                            value={soluteUnit}
                                            onChange={(e) => setSoluteUnit(e.target.value)}
                                            disabled={solveFor === 'solute'}
                                            className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        >
                                            {units.solute.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Solvent Input */}
                                {(percentageType === 'ww' || solveFor === 'solvent') && (
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Solvent Amount
                                            {solveFor === 'solvent' && <span className="text-green-600 ml-2">← Calculating this</span>}
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="number"
                                                value={solventValue}
                                                onChange={(e) => setSolventValue(e.target.value)}
                                                placeholder={solveFor === 'solvent' ? 'This will be calculated' : 'Enter solvent amount'}
                                                disabled={solveFor === 'solvent'}
                                                step="0.001"
                                                min="0"
                                                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-green-500 focus:outline-none transition-colors ${solveFor === 'solvent' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                    }`}
                                            />
                                            <select
                                                value={solventUnit}
                                                onChange={(e) => setSolventUnit(e.target.value)}
                                                disabled={solveFor === 'solvent'}
                                                className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                            >
                                                {units.solvent.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Solution Input */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Solution Amount
                                        {solveFor === 'solution' && <span className="text-green-600 ml-2">← Calculating this</span>}
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="number"
                                            value={solutionValue}
                                            onChange={(e) => setSolutionValue(e.target.value)}
                                            placeholder={solveFor === 'solution' ? 'This will be calculated' : 'Enter total solution amount'}
                                            disabled={solveFor === 'solution'}
                                            step="0.001"
                                            min="0"
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none transition-colors ${solveFor === 'solution' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <select
                                            value={solutionUnit}
                                            onChange={(e) => setSolutionUnit(e.target.value)}
                                            disabled={solveFor === 'solution'}
                                            className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        >
                                            {units.solution.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Significant Figures */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Significant Figures
                                    </label>
                                    <select
                                        value={significantFigures}
                                        onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                    >
                                        {[2, 3, 4, 5, 6].map(num => (
                                            <option key={num} value={num}>{num} digits</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button
                                    onClick={calculatePercentageSolution}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate Solution
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

                    {/* Results and Info Sidebar */}
                    <div className="space-y-6">
                        {/* Result Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <Beaker className="w-7 h-7 mr-3" />
                                    Solution Result
                                </h2>

                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold text-blue-100 mb-2">
                                            {getSolveForLabel(solveFor)}
                                        </div>
                                        {result.error ? (
                                            <div className="text-xl font-bold text-red-200">{result.error}</div>
                                        ) : (
                                            <>
                                                <div className="text-5xl md:text-6xl font-bold mb-2 break-words">
                                                    {result.value}
                                                </div>
                                                <div className="text-2xl font-semibold">
                                                    {result.unit}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {!result.error && result.details && (
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <div className="font-mono text-sm text-center">
                                            {result.details}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preparation Instructions */}
                        {result && !result.error && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FlaskConical className="w-5 h-5 mr-2 text-blue-600" />
                                    Preparation Instructions
                                </h3>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-gray-700">
                                        {solveFor === 'solute' && (
                                            <>
                                                Weigh/measure <strong>{result.value} {result.unit}</strong> of solute and add to a container.
                                                {percentageType === 'wv' || percentageType === 'vv' ? (
                                                    <> Then add solvent to reach a final volume of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                                ) : (
                                                    <> Then add solvent to reach a final weight of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                                )}
                                            </>
                                        )}
                                        {solveFor === 'solution' && (
                                            <>
                                                To prepare <strong>{result.value} {result.unit}</strong> of {percentage}% solution,
                                                weigh/measure <strong>{soluteValue} {soluteUnit}</strong> of solute and add to a container.
                                                {percentageType === 'wv' || percentageType === 'vv' ? (
                                                    <> Then add solvent to reach the final volume.</>
                                                ) : (
                                                    <> Then add solvent to reach the final weight.</>
                                                )}
                                            </>
                                        )}
                                        {solveFor === 'solvent' && (
                                            <>
                                                Add <strong>{soluteValue} {soluteUnit}</strong> of solute to a container,
                                                then add <strong>{result.value} {result.unit}</strong> of solvent to reach
                                                {percentageType === 'wv' || percentageType === 'vv' ? (
                                                    <> a final volume of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                                ) : (
                                                    <> a final weight of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                                )}
                                            </>
                                        )}
                                        {solveFor === 'percentage' && (
                                            <>
                                                The solution contains <strong>{soluteValue} {soluteUnit}</strong> of solute in
                                                <strong> {solutionValue} {solutionUnit}</strong> of total solution,
                                                which corresponds to <strong>{result.value}% {result.unit}</strong>.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Key Concepts */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Key Concepts</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Weight/Volume (w/v)%</h4>
                                    <p className="text-xs text-gray-600">
                                        Mass of solute (g) per 100 mL of solution. Common for solids dissolved in liquids.
                                        Example: 1% (w/v) NaCl = 1g NaCl in 100mL water.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Volume/Volume (v/v)%</h4>
                                    <p className="text-xs text-gray-600">
                                        Volume of solute (mL) per 100 mL of solution. Common for liquids mixed with liquids.
                                        Example: 70% (v/v) ethanol = 70mL ethanol + 30mL water.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Weight/Weight (w/w)%</h4>
                                    <p className="text-xs text-gray-600">
                                        Mass of solute (g) per 100g of solution. Used when both components are weighed.
                                        Example: 10% (w/w) NaOH = 10g NaOH + 90g water.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Common Solutions */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Laboratory Solutions</h3>
                            <div className="space-y-3">
                                {commonSolutions.map((solution) => (
                                    <div
                                        key={solution.name}
                                        className="p-3 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                        onClick={() => {
                                            setPercentageType(solution.type === 'w/v' ? 'wv' : solution.type === 'v/v' ? 'vv' : 'ww');
                                            setPercentage(solution.percentage);
                                            setSolveFor('solution');
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{solution.name}</span>
                                            <span className="font-bold text-blue-600">{solution.percentage}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {solution.solute} in {solution.solvent} ({solution.type})
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                                Important Notes
                            </h3>
                            <ul className="text-xs text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Always add solute to solvent, not vice versa (especially for concentrated acids/bases)
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    For w/v solutions, final volume is measured after dissolution
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    For w/w solutions, temperature affects density and weight measurements
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Some solutes have significant volume change upon dissolution
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Conversion Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Common Percentage Conversions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Percentage</th>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">w/v (g/100mL)</th>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">v/v (mL/100mL)</th>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">w/w (g/100g)</th>
                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Common Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { percentage: '0.1%', wv: '0.1g', vv: '0.1mL', ww: '0.1g', use: 'Dilute standards' },
                                    { percentage: '0.5%', wv: '0.5g', vv: '0.5mL', ww: '0.5g', use: 'Agar plates' },
                                    { percentage: '1%', wv: '1g', vv: '1mL', ww: '1g', use: 'Staining solutions' },
                                    { percentage: '5%', wv: '5g', vv: '5mL', ww: '5g', use: 'Blocking buffers' },
                                    { percentage: '10%', wv: '10g', vv: '10mL', ww: '10g', use: 'SDS-PAGE gels' },
                                    { percentage: '20%', wv: '20g', vv: '20mL', ww: '20g', use: 'Sugar solutions' },
                                    { percentage: '50%', wv: '50g', vv: '50mL', ww: '50g', use: 'Glycerol stocks' },
                                ].map((row, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="py-2 px-3 font-medium text-blue-600">{row.percentage}</td>
                                        <td className="py-2 px-3">{row.wv}</td>
                                        <td className="py-2 px-3">{row.vv}</td>
                                        <td className="py-2 px-3">{row.ww}</td>
                                        <td className="py-2 px-3 text-gray-600">{row.use}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}