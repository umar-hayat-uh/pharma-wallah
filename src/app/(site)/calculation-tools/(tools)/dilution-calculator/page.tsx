"use client";
import { useState } from 'react';
import { Calculator, Beaker, FlaskConical, Droplet, Clock, Activity, PieChart, TrendingDown } from 'lucide-react';

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
     */
    const calculateDilution = () => {
        const c1 = parseFloat(initialConcentration);
        const v1 = parseFloat(initialVolume);
        const c2 = parseFloat(finalConcentration);
        const v2 = parseFloat(finalVolume);

        let calculatedValue: number;
        let solventToAdd: number = 0;

        switch (solveFor) {
            case 'V1':
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

        setResult({
            value: calculatedValue.toFixed(4),
            solvent: solventToAdd > 0 ? solventToAdd.toFixed(4) : '0',
            variable: solveFor,
            error: null
        });
    };

    const handleReset = () => {
        setInitialConcentration('');
        setInitialVolume('');
        setFinalConcentration('');
        setFinalVolume('');
        setSolveFor('V2');
        setResult(null);
    };

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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplet className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Dilution Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate dilution parameters using C₁V₁ = C₂V₂ formula</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <FlaskConical className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Laboratory Tools</span>
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
                                    <FlaskConical className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-blue-800">Dilution Formula</h3>
                                </div>
                                <p className="text-center text-blue-900 font-mono text-2xl font-bold">
                                    C₁ × V₁ = C₂ × V₂
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-blue-700">
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
                                <label className="block text-lg font-semibold text-gray-800 mb-4">
                                    What do you want to calculate?
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['V2', 'V1', 'C2', 'C1'].map((variable) => (
                                        <button
                                            key={variable}
                                            onClick={() => setSolveFor(variable)}
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
                                    {/* Initial Concentration */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Initial Concentration (C₁)
                                            {solveFor === 'C1' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={initialConcentration}
                                            onChange={(e) => setInitialConcentration(e.target.value)}
                                            placeholder={solveFor === 'C1' ? 'Calculating...' : 'Enter C₁'}
                                            disabled={solveFor === 'C1'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'C1' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Initial Volume */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Initial Volume (V₁)
                                            {solveFor === 'V1' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={initialVolume}
                                            onChange={(e) => setInitialVolume(e.target.value)}
                                            placeholder={solveFor === 'V1' ? 'Calculating...' : 'Enter V₁'}
                                            disabled={solveFor === 'V1'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'V1' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            step="0.001"
                                        />
                                    </div>

                                    {/* Final Concentration */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Final Concentration (C₂)
                                            {solveFor === 'C2' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={finalConcentration}
                                            onChange={(e) => setFinalConcentration(e.target.value)}
                                            placeholder={solveFor === 'C2' ? 'Calculating...' : 'Enter C₂'}
                                            disabled={solveFor === 'C2'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'C2' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Final Volume */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Final Volume (V₂)
                                            {solveFor === 'V2' && <span className="text-blue-600 ml-2">← Calculating</span>}
                                        </label>
                                        <input
                                            type="number"
                                            value={finalVolume}
                                            onChange={(e) => setFinalVolume(e.target.value)}
                                            placeholder={solveFor === 'V2' ? 'Calculating...' : 'Enter V₂'}
                                            disabled={solveFor === 'V2'}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                                solveFor === 'V2' 
                                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                                                    : 'border-blue-200 focus:border-blue-500'
                                            }`}
                                            step="0.001"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateDilution}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Dilution
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
                                            <p className="text-red-800 text-center font-medium">
                                                {result.error}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                                Calculation Results
                                            </h3>

                                            <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {getVariableLabel(result.variable || '')}
                                                </p>
                                                <p className="text-4xl font-bold text-blue-600">
                                                    {result.value}
                                                </p>
                                            </div>

                                            {(result.variable === 'V2' || result.variable === 'V1') && parseFloat(result.solvent || '0') > 0 && (
                                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                                    <div className="flex items-center mb-2">
                                                        <Beaker className="w-5 h-5 text-green-600 mr-2" />
                                                        <p className="text-sm text-gray-600">Solvent to Add</p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-green-600">
                                                        {result.solvent}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Information Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                About Dilution
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                The dilution equation C₁V₁ = C₂V₂ states that the amount of solute remains constant during dilution.
                            </p>
                            
                            <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                <p className="text-sm font-semibold text-blue-800 mb-2">💡 Important Notes:</p>
                                <ul className="text-sm text-blue-700 space-y-1.5">
                                    <li>• Concentration units must be the same for C₁ and C₂</li>
                                    <li>• Volume units must be the same for V₁ and V₂</li>
                                    <li>• Final concentration (C₂) should be less than initial concentration (C₁)</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-green-800 mb-2">📊 Common Applications:</p>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Preparing working solutions from stock</li>
                                    <li>• Serial dilutions for standard curves</li>
                                    <li>• Sample preparation for analysis</li>
                                </ul>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">C₁V₁ = C₂V₂</span>
                                    <span className="font-semibold text-blue-600">Basic Formula</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Dilution Factor</span>
                                    <span className="font-semibold text-green-600">C₁/C₂</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Volume to Add</span>
                                    <span className="font-semibold text-purple-600">V₂ - V₁</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}