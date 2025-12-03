"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical, Droplet } from 'lucide-react';

export default function DilutionCalculator() {
    // State variables for calculator inputs with proper TypeScript typing
    const [initialConcentration, setInitialConcentration] = useState(''); // C1 - Initial concentration
    const [initialVolume, setInitialVolume] = useState(''); // V1 - Initial volume
    const [finalConcentration, setFinalConcentration] = useState(''); // C2 - Final concentration
    const [finalVolume, setFinalVolume] = useState(''); // V2 - Final volume
    const [solveFor, setSolveFor] = useState('V2'); // Which variable to solve for
    const [result, setResult] = useState<{
        value?: string;
        solvent?: string;
        variable?: string;
        error?: string | null;
    } | null>(null); // Calculated result with proper TypeScript typing

    /**
     * Calculate dilution using the formula: C1 × V1 = C2 × V2
     * This is the dilution equation where:
     * C1 = Initial (stock) concentration
     * V1 = Initial (stock) volume
     * C2 = Final (diluted) concentration
     * V2 = Final (diluted) volume
     */
    const calculateDilution = () => {
        // Parse input values to floats
        const c1 = parseFloat(initialConcentration);
        const v1 = parseFloat(initialVolume);
        const c2 = parseFloat(finalConcentration);
        const v2 = parseFloat(finalVolume);

        let calculatedValue: number;
        let solventToAdd: number = 0;

        // Calculate based on which variable we're solving for
        switch (solveFor) {
            case 'V1':
                // Solve for V1: V1 = (C2 × V2) / C1
                if (isNaN(c1) || isNaN(c2) || isNaN(v2) || c1 <= 0 || c2 <= 0 || v2 <= 0) {
                    setResult({
                        error: 'Please enter valid positive numbers for C1, C2, and V2'
                    });
                    return;
                }
                if (c2 > c1) {
                    setResult({
                        error: 'Final concentration cannot be greater than initial concentration'
                    });
                    return;
                }
                calculatedValue = (c2 * v2) / c1;
                solventToAdd = v2 - calculatedValue;
                break;

            case 'V2':
                // Solve for V2: V2 = (C1 × V1) / C2
                if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c1 <= 0 || v1 <= 0 || c2 <= 0) {
                    setResult({
                        error: 'Please enter valid positive numbers for C1, V1, and C2'
                    });
                    return;
                }
                if (c2 > c1) {
                    setResult({
                        error: 'Final concentration cannot be greater than initial concentration'
                    });
                    return;
                }
                calculatedValue = (c1 * v1) / c2;
                solventToAdd = calculatedValue - v1;
                break;

            case 'C1':
                // Solve for C1: C1 = (C2 × V2) / V1
                if (isNaN(v1) || isNaN(c2) || isNaN(v2) || v1 <= 0 || c2 <= 0 || v2 <= 0) {
                    setResult({
                        error: 'Please enter valid positive numbers for V1, C2, and V2'
                    });
                    return;
                }
                calculatedValue = (c2 * v2) / v1;
                solventToAdd = v2 - v1;
                break;

            case 'C2':
                // Solve for C2: C2 = (C1 × V1) / V2
                if (isNaN(c1) || isNaN(v1) || isNaN(v2) || c1 <= 0 || v1 <= 0 || v2 <= 0) {
                    setResult({
                        error: 'Please enter valid positive numbers for C1, V1, and V2'
                    });
                    return;
                }
                calculatedValue = (c1 * v1) / v2;
                solventToAdd = v2 - v1;
                break;

            default:
                setResult({ error: 'Invalid calculation mode' });
                return;
        }

        // Store calculation results
        setResult({
            value: calculatedValue.toFixed(4),
            solvent: solventToAdd > 0 ? solventToAdd.toFixed(4) : '0',
            variable: solveFor,
            error: null
        });
    };

    /**
     * Reset all input fields and clear results
     */
    const handleReset = () => {
        setInitialConcentration('');
        setInitialVolume('');
        setFinalConcentration('');
        setFinalVolume('');
        setSolveFor('V2');
        setResult(null);
    };

    /**
     * Get the label for the variable being solved
     */
    const getVariableLabel = (variable: string): string => {
        const labels: { [key: string]: string } = {
            'C1': 'Initial Concentration (C₁)',
            'V1': 'Initial Volume (V₁)',
            'C2': 'Final Concentration (C₂)',
            'V2': 'Final Volume (V₂)'
        };
        return labels[variable] || variable;
    };

    return (
        <section id="dilution-calculator-section" className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
            <div className="mt-6 px-4 pb-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Droplet className="w-10 h-10 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Dilution Calculator
                            </h1>
                        </div>
                        <p className="text-gray-600 text-center">
                            Calculate dilution parameters using C₁V₁ = C₂V₂ formula
                        </p>
                    </div>

                    {/* Calculator Card */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Formula Display */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <FlaskConical className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="text-sm font-semibold text-blue-800">Dilution Formula</h3>
                            </div>
                            <p className="text-center text-blue-900 font-mono text-lg font-bold">
                                C₁ × V₁ = C₂ × V₂
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-blue-700">
                                <div className="text-center">
                                    <p><strong>C₁</strong> = Initial concentration</p>
                                    <p><strong>V₁</strong> = Initial volume</p>
                                </div>
                                <div className="text-center">
                                    <p><strong>C₂</strong> = Final concentration</p>
                                    <p><strong>V₂</strong> = Final volume</p>
                                </div>
                            </div>
                        </div>

                        {/* Solve For Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                What do you want to calculate?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['V2', 'V1', 'C2', 'C1'].map((variable) => (
                                    <button
                                        key={variable}
                                        onClick={() => setSolveFor(variable)}
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
                            {/* Initial Concentration Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Concentration (C₁)
                                    {solveFor === 'C1' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                </label>
                                <input
                                    type="number"
                                    value={initialConcentration}
                                    onChange={(e) => setInitialConcentration(e.target.value)}
                                    placeholder={solveFor === 'C1' ? 'This will be calculated' : 'Enter initial concentration'}
                                    disabled={solveFor === 'C1'}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                        solveFor === 'C1' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                    }`}
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Stock or original concentration (M, mM, μM, g/L, etc.)
                                </p>
                            </div>

                            {/* Initial Volume Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Volume (V₁)
                                    {solveFor === 'V1' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                </label>
                                <input
                                    type="number"
                                    value={initialVolume}
                                    onChange={(e) => setInitialVolume(e.target.value)}
                                    placeholder={solveFor === 'V1' ? 'This will be calculated' : 'Enter initial volume'}
                                    disabled={solveFor === 'V1'}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                        solveFor === 'V1' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                    }`}
                                    step="0.001"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Stock volume to use (mL, L, μL, etc.)
                                </p>
                            </div>

                            {/* Final Concentration Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Final Concentration (C₂)
                                    {solveFor === 'C2' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                </label>
                                <input
                                    type="number"
                                    value={finalConcentration}
                                    onChange={(e) => setFinalConcentration(e.target.value)}
                                    placeholder={solveFor === 'C2' ? 'This will be calculated' : 'Enter final concentration'}
                                    disabled={solveFor === 'C2'}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                        solveFor === 'C2' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                    }`}
                                    step="0.01"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Desired diluted concentration (same units as C₁)
                                </p>
                            </div>

                            {/* Final Volume Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Final Volume (V₂)
                                    {solveFor === 'V2' && <span className="text-blue-600 ml-2">← Calculating this</span>}
                                </label>
                                <input
                                    type="number"
                                    value={finalVolume}
                                    onChange={(e) => setFinalVolume(e.target.value)}
                                    placeholder={solveFor === 'V2' ? 'This will be calculated' : 'Enter final volume'}
                                    disabled={solveFor === 'V2'}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:border-blue-600 focus:outline-none transition-colors ${
                                        solveFor === 'V2' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                                    }`}
                                    step="0.001"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Total volume after dilution (same units as V₁)
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={calculateDilution}
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
                                    // Error Message Display
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-red-800 text-center font-medium">
                                            {result.error}
                                        </p>
                                    </div>
                                ) : (
                                    // Success Results Display
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                            Calculation Results
                                        </h3>

                                        {/* Calculated Value Result */}
                                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-1">
                                                {getVariableLabel(result.variable || '')}
                                            </p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {result.value}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {result.variable?.startsWith('C') ? 'Concentration units' : 'Volume units'}
                                            </p>
                                        </div>

                                        {/* Solvent to Add (for volume calculations) */}
                                        {(result.variable === 'V2' || result.variable === 'V1') && parseFloat(result.solvent || '0') > 0 && (
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center mb-1">
                                                    <Beaker className="w-4 h-4 text-green-600 mr-2" />
                                                    <p className="text-sm text-gray-600">Solvent to Add</p>
                                                </div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {result.solvent}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Volume of solvent (water, buffer, etc.) to add
                                                </p>
                                            </div>
                                        )}

                                        {/* Dilution Instructions */}
                                        {result.variable === 'V2' && (
                                            <div className="mt-4 bg-blue-50 rounded-lg p-4">
                                                <p className="text-xs font-semibold text-blue-800 mb-2">📝 Dilution Instructions:</p>
                                                <p className="text-xs text-blue-700">
                                                    Add <strong>{initialVolume}</strong> volume units of stock solution to a container, 
                                                    then add <strong>{result.solvent}</strong> volume units of solvent to reach 
                                                    a final volume of <strong>{result.value}</strong> volume units.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Information Section */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                About Dilution
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                The dilution equation C₁V₁ = C₂V₂ is fundamental in laboratory work. It states that 
                                the amount of solute remains constant during dilution. This calculator helps you determine 
                                any unknown parameter when you know the other three values.
                            </p>
                            
                            <div className="bg-blue-50 rounded-lg p-4 mb-3">
                                <p className="text-xs font-semibold text-blue-800 mb-2">💡 Important Notes:</p>
                                <ul className="text-xs text-blue-700 space-y-1.5">
                                    <li>• Concentration units must be the same for C₁ and C₂</li>
                                    <li>• Volume units must be the same for V₁ and V₂</li>
                                    <li>• Final concentration (C₂) should be less than initial concentration (C₁)</li>
                                    <li>• Always add stock solution to solvent, not vice versa</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-green-800 mb-2">📊 Common Applications:</p>
                                <ul className="text-xs text-green-700 space-y-1">
                                    <li>• Preparing working solutions from stock solutions</li>
                                    <li>• Serial dilutions for standard curves</li>
                                    <li>• Adjusting reagent concentrations</li>
                                    <li>• Sample preparation for analysis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}