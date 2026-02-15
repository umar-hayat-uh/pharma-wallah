"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical, Droplet, Scale, Weight, Thermometer, AlertCircle } from 'lucide-react';

export default function PercentageSolutionCalculator() {
    // State variables for calculator inputs
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
                            setResult({
                                error: 'Please enter valid solute weight and solution volume'
                            });
                            return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (w/v)';
                        details = `% (w/v) = (${solute}g / ${solution}mL) × 100`;
                    } else if (percentageType === 'vv') {
                        // % (v/v) = (solute volume / solution volume) × 100
                        if (isNaN(solute) || isNaN(solution) || solution <= 0) {
                            setResult({
                                error: 'Please enter valid solute volume and solution volume'
                            });
                            return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (v/v)';
                        details = `% (v/v) = (${solute}mL / ${solution}mL) × 100`;
                    } else {
                        // % (w/w) = (solute weight / solution weight) × 100
                        if (isNaN(solute) || isNaN(solution) || solution <= 0) {
                            setResult({
                                error: 'Please enter valid solute weight and solution weight'
                            });
                            return;
                        }
                        calculatedValue = (solute / solution) * 100;
                        calculatedUnit = '% (w/w)';
                        details = `% (w/w) = (${solute}g / ${solution}g) × 100`;
                    }
                    break;

                case 'solute':
                    // Calculate solute amount
                    if (isNaN(pct) || pct <= 0) {
                        setResult({
                            error: 'Please enter a valid positive percentage'
                        });
                        return;
                    }

                    if (solveFor === 'solute' && percentageType === 'wv') {
                        // Solute weight = (% (w/v) / 100) × solution volume
                        if (isNaN(solution) || solution <= 0) {
                            setResult({
                                error: 'Please enter valid solution volume'
                            });
                            return;
                        }
                        calculatedValue = (pct / 100) * solution;
                        calculatedUnit = soluteUnit;
                        details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
                    } else if (solveFor === 'solute' && percentageType === 'vv') {
                        // Solute volume = (% (v/v) / 100) × solution volume
                        if (isNaN(solution) || solution <= 0) {
                            setResult({
                                error: 'Please enter valid solution volume'
                            });
                            return;
                        }
                        calculatedValue = (pct / 100) * solution;
                        calculatedUnit = soluteUnit;
                        details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
                    } else if (solveFor === 'solute' && percentageType === 'ww') {
                        // Solute weight = (% (w/w) / 100) × solution weight
                        if (isNaN(solution) || solution <= 0) {
                            setResult({
                                error: 'Please enter valid solution weight'
                            });
                            return;
                        }
                        calculatedValue = (pct / 100) * solution;
                        calculatedUnit = soluteUnit;
                        details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
                    } else {
                        setResult({ error: 'Invalid calculation' });
                        return;
                    }
                    break;

                case 'solvent':
                    // Calculate solvent amount (only needed for w/w usually)
                    if (percentageType === 'ww') {
                        // Solvent weight = solution weight - solute weight
                        if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) {
                            setResult({
                                error: 'Please enter valid solution weight and solute weight'
                            });
                            return;
                        }
                        if (solute > solution) {
                            setResult({
                                error: 'Solute weight cannot be greater than solution weight'
                            });
                            return;
                        }
                        calculatedValue = solution - solute;
                        calculatedUnit = solventUnit;
                        details = `Solvent = ${solution}${solutionUnit} - ${solute}${soluteUnit}`;
                    } else {
                        // For w/v and v/v, solvent is typically not calculated directly
                        if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) {
                            setResult({
                                error: 'Please enter valid solution volume and solute amount'
                            });
                            return;
                        }
                        if (solute > solution) {
                            setResult({
                                error: 'Solute cannot be greater than solution volume'
                            });
                            return;
                        }
                        calculatedValue = solution - solute;
                        calculatedUnit = solventUnit;
                        details = `Solvent = ${solution}${solutionUnit} - ${solute}${soluteUnit}`;
                    }
                    break;

                case 'solution':
                    // Calculate solution amount
                    if (isNaN(pct) || pct <= 0) {
                        setResult({
                            error: 'Please enter a valid positive percentage'
                        });
                        return;
                    }

                    if (percentageType === 'wv') {
                        // Solution volume = solute weight / (% (w/v) / 100)
                        if (isNaN(solute) || solute <= 0) {
                            setResult({
                                error: 'Please enter valid solute weight'
                            });
                            return;
                        }
                        calculatedValue = solute / (pct / 100);
                        calculatedUnit = solutionUnit;
                        details = `Solution = ${solute}${soluteUnit} / (${pct}% / 100)`;
                    } else if (percentageType === 'vv') {
                        // Solution volume = solute volume / (% (v/v) / 100)
                        if (isNaN(solute) || solute <= 0) {
                            setResult({
                                error: 'Please enter valid solute volume'
                            });
                            return;
                        }
                        calculatedValue = solute / (pct / 100);
                        calculatedUnit = solutionUnit;
                        details = `Solution = ${solute}${soluteUnit} / (${pct}% / 100)`;
                    } else {
                        // Solution weight = solute weight / (% (w/w) / 100)
                        if (isNaN(solute) || solute <= 0) {
                            setResult({
                                error: 'Please enter valid solute weight'
                            });
                            return;
                        }
                        calculatedValue = solute / (pct / 100);
                        calculatedUnit = solutionUnit;
                        details = `Solution = ${solute}${soluteUnit} / (${pct}% / 100)`;
                    }
                    break;

                default:
                    setResult({ error: 'Invalid calculation mode' });
                    return;
            }

            // Handle special cases
            if (isNaN(calculatedValue) || calculatedValue < 0) {
                setResult({
                    error: 'Invalid calculation result. Please check your inputs.'
                });
                return;
            }

            // Store calculation results
            setResult({
                value: calculatedValue.toFixed(4),
                unit: calculatedUnit,
                details: details,
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
        setPercentage('');
        setSoluteValue('');
        setSolventValue('');
        setSolutionValue('');
        setSolveFor('solute');
        setResult(null);
    };

    /**
     * Update units when percentage type changes
     */
    const handlePercentageTypeChange = (type: string) => {
        setPercentageType(type);
        const units = getUnits();
        setSoluteUnit(units.solute[0]);
        setSolventUnit(units.solvent[0]);
        setSolutionUnit(units.solution[0]);
        setResult(null);
    };

    /**
     * Get the label for what we're solving for
     */
    const getSolveForLabel = (type: string): string => {
        const labels: { [key: string]: string } = {
            'percentage': 'Percentage (%)',
            'solute': 'Solute Amount',
            'solvent': 'Solvent Amount',
            'solution': 'Total Solution'
        };
        return labels[type] || type;
    };

    /**
     * Get type description
     */
    const getTypeDescription = (type: string): string => {
        switch (type) {
            case 'wv': return 'Weight/Volume (w/v): Mass of solute per volume of solution';
            case 'vv': return 'Volume/Volume (v/v): Volume of solute per volume of solution';
            case 'ww': return 'Weight/Weight (w/w): Mass of solute per mass of solution';
            default: return '';
        }
    };

    /**
     * Get formula based on type
     */
    const getFormula = (type: string): string => {
        switch (type) {
            case 'wv': return '% (w/v) = (solute weight / solution volume) × 100';
            case 'vv': return '% (v/v) = (solute volume / solution volume) × 100';
            case 'ww': return '% (w/w) = (solute weight / solution weight) × 100';
            default: return '';
        }
    };

    /**
     * Get common percentages for quick selection
     */
    const getCommonPercentages = () => {
        switch (percentageType) {
            case 'wv':
                return ['0.1', '0.5', '1.0', '5.0', '10.0', '20.0', '50.0'];
            case 'vv':
                return ['0.1', '0.5', '1.0', '5.0', '10.0', '25.0', '50.0', '70.0', '100.0'];
            case 'ww':
                return ['0.1', '0.5', '1.0', '5.0', '10.0', '20.0', '50.0'];
            default:
                return ['0.1', '1.0', '5.0', '10.0', '20.0', '50.0'];
        }
    };

    const units = getUnits();
    const commonPercentages = getCommonPercentages();

    return (
        <section id="percentage-solution-calculator-section pt-0" className='min-h-screen bg-white'>
            <div className="mt-6 px-4 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mr-3" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                Percentage Solution Calculator
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 text-center">
                            Calculate weight/volume (w/v), volume/volume (v/v), and weight/weight (w/w) percentage solutions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Calculator Card */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 sm:p-8">
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
                                                    ? 'bg-green-600 text-white shadow-md'
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
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <Calculator className="w-5 h-5 text-green-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-green-600">Formula</h3>
                                </div>
                                <p className="text-center text-green-800 font-mono text-sm sm:text-lg font-bold">
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
                                                    ? 'bg-green-600 text-white shadow-md'
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
                                <div>
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
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-green-600 focus:outline-none transition-colors ${solveFor === 'percentage' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {/* Quick percentage buttons */}
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {percentageType === 'vv' ? 'Enter percentage (0-100%)' : 'Enter percentage'}
                                    </p>
                                </div>

                                {/* Solute Input */}
                                <div>
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
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-green-600 focus:outline-none transition-colors ${solveFor === 'solute' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <select
                                            value={soluteUnit}
                                            onChange={(e) => setSoluteUnit(e.target.value)}
                                            disabled={solveFor === 'solute'}
                                            className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                        >
                                            {units.solute.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {percentageType === 'wv' ? 'Weight of solute' :
                                            percentageType === 'vv' ? 'Volume of solute' :
                                                'Weight of solute'}
                                    </p>
                                </div>

                                {/* Solvent Input (for w/w calculations) */}
                                {(percentageType === 'ww' || solveFor === 'solvent') && (
                                    <div>
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
                                                className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-green-600 focus:outline-none transition-colors ${solveFor === 'solvent' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                    }`}
                                            />
                                            <select
                                                value={solventUnit}
                                                onChange={(e) => setSolventUnit(e.target.value)}
                                                disabled={solveFor === 'solvent'}
                                                className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                            >
                                                {units.solvent.map(unit => (
                                                    <option key={unit} value={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {percentageType === 'wv' ? 'Volume of solvent (for w/v)' :
                                                percentageType === 'vv' ? 'Volume of solvent (for v/v)' :
                                                    'Weight of solvent (for w/w)'}
                                        </p>
                                    </div>
                                )}

                                {/* Solution Input */}
                                <div>
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
                                            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:border-green-600 focus:outline-none transition-colors ${solveFor === 'solution' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                                }`}
                                        />
                                        <select
                                            value={solutionUnit}
                                            onChange={(e) => setSolutionUnit(e.target.value)}
                                            disabled={solveFor === 'solution'}
                                            className="w-full sm:w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
                                        >
                                            {units.solution.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {percentageType === 'wv' ? 'Total volume of solution' :
                                            percentageType === 'vv' ? 'Total volume of solution' :
                                                'Total weight of solution'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button
                                    onClick={calculatePercentageSolution}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
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
                                        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                                Calculation Results
                                            </h3>

                                            {/* Main Result */}
                                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {getSolveForLabel(solveFor)}
                                                </p>
                                                <p className="text-2xl sm:text-3xl font-bold text-green-600 break-words">
                                                    {result.value} <span className="text-lg sm:text-xl">{result.unit}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {result.details}
                                                </p>
                                            </div>

                                            {/* Preparation Instructions */}
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <p className="text-xs font-semibold text-green-800 mb-2">📝 Preparation Instructions:</p>
                                                <p className="text-xs text-green-700">
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
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Information and Examples */}
                        <div className="space-y-6">
                            {/* Key Concepts */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
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
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Common Laboratory Solutions</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Physiological Saline', type: 'w/v', percentage: '0.9', solute: 'NaCl', solvent: 'Water' },
                                        { name: 'Ethanol for Disinfection', type: 'v/v', percentage: '70', solute: 'Ethanol', solvent: 'Water' },
                                        { name: 'Glucose Solution', type: 'w/v', percentage: '5', solute: 'D-Glucose', solvent: 'Water' },
                                        { name: 'Acetic Acid (Vinegar)', type: 'v/v', percentage: '5', solute: 'Acetic acid', solvent: 'Water' },
                                        { name: 'SDS Solution', type: 'w/v', percentage: '10', solute: 'SDS', solvent: 'Water' },
                                        { name: 'Agarose Gel', type: 'w/v', percentage: '1', solute: 'Agarose', solvent: 'TAE/TBE buffer' },
                                    ].map((solution) => (
                                        <div
                                            key={solution.name}
                                            className="p-3 hover:bg-green-50 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => {
                                                setPercentageType(solution.type === 'w/v' ? 'wv' : solution.type === 'v/v' ? 'vv' : 'ww');
                                                setPercentage(solution.percentage);
                                                setSolveFor('solution');
                                            }}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-800">{solution.name}</span>
                                                <span className="font-bold text-green-600">{solution.percentage}%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {solution.solute} in {solution.solvent} ({solution.type})
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Reference */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-lg p-6 border-2 border-green-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">1% (w/v)</span>
                                        <span className="text-sm font-semibold text-gray-800">1g in 100mL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">5% (w/v)</span>
                                        <span className="text-sm font-semibold text-gray-800">5g in 100mL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">10% (w/v)</span>
                                        <span className="text-sm font-semibold text-gray-800">10g in 100mL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">1% (v/v)</span>
                                        <span className="text-sm font-semibold text-gray-800">1mL in 100mL</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">50% (v/v)</span>
                                        <span className="text-sm font-semibold text-gray-800">50mL in 100mL</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    Remember: For w/v and v/v, percentage is always based on final volume, not solvent volume.
                                </p>
                            </div>

                            {/* Important Notes */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Important Notes</h3>
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
                    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Common Percentage Conversions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-green-50">
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
                                            <td className="py-2 px-3 font-medium text-green-600">{row.percentage}</td>
                                            <td className="py-2 px-3">{row.wv}</td>
                                            <td className="py-2 px-3">{row.vv}</td>
                                            <td className="py-2 px-3">{row.ww}</td>
                                            <td className="py-2 px-3 text-gray-600">{row.use}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Note: These are equivalent amounts per 100 mL or 100 g of final solution.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}