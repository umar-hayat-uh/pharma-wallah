"use client";
import { useState, useEffect } from 'react';
import { Scale, RefreshCw, AlertCircle, Calculator } from 'lucide-react';

type MassUnit = 'mg' | 'g' | 'kg' | 'lb' | 'oz' | 'mcg';

export default function MassConversionCalculator() {
    const [inputValue, setInputValue] = useState<string>('100');
    const [inputUnit, setInputUnit] = useState<MassUnit>('mg');
    const [outputUnit, setOutputUnit] = useState<MassUnit>('g');
    const [convertedValue, setConvertedValue] = useState<number | null>(null);
    const [significantFigures, setSignificantFigures] = useState<number>(4);

    const conversionFactors: Record<MassUnit, number> = {
        mg: 1,
        mcg: 0.001,
        g: 1000,
        kg: 1000000,
        lb: 453592.37,
        oz: 28349.5231
    };

    const unitLabels: Record<MassUnit, string> = {
        mg: 'Milligram (mg)',
        mcg: 'Microgram (mcg)',
        g: 'Gram (g)',
        kg: 'Kilogram (kg)',
        lb: 'Pound (lb)',
        oz: 'Ounce (oz)'
    };

    const commonConversions = [
        { from: 'mg', to: 'g', value: 1000 },
        { from: 'g', to: 'mg', value: 500 },
        { from: 'kg', to: 'lb', value: 1 },
        { from: 'lb', to: 'kg', value: 2.2 },
        { from: 'oz', to: 'g', value: 28.35 }
    ];

    const calculateConversion = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) {
            setConvertedValue(null);
            return;
        }

        // Convert to mg (base unit) then to target unit
        const valueInMg = value * conversionFactors[inputUnit];
        const result = valueInMg / conversionFactors[outputUnit];
        setConvertedValue(result);
    };

    const resetCalculator = () => {
        setInputValue('100');
        setInputUnit('mg');
        setOutputUnit('g');
        setConvertedValue(null);
    };

    const loadCommonConversion = (index: number) => {
        const conv = commonConversions[index];
        setInputUnit(conv.from as MassUnit);
        setOutputUnit(conv.to as MassUnit);
        setInputValue(conv.value.toString());
    };

    const formatNumber = (num: number): string => {
        if (num === 0) return '0';
        if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
            return num.toExponential(significantFigures - 1);
        }
        const factor = Math.pow(10, significantFigures);
        const rounded = Math.round(num * factor) / factor;
        return rounded.toString();
    };

    useEffect(() => {
        calculateConversion();
    }, [inputValue, inputUnit, outputUnit, significantFigures]);

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
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Mass Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between mg, g, kg, lb, oz for accurate dosage calculations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Calculator className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Precision Dosing</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Scale className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Mass Conversion
                            </h2>

                            {/* Conversion Inputs */}
                            <div className="space-y-6">
                                {/* Units Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Input</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Value
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Enter mass value"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    From Unit
                                                </label>
                                                <select
                                                    value={inputUnit}
                                                    onChange={(e) => setInputUnit(e.target.value as MassUnit)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                >
                                                    {Object.entries(unitLabels).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Output</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    To Unit
                                                </label>
                                                <select
                                                    value={outputUnit}
                                                    onChange={(e) => setOutputUnit(e.target.value as MassUnit)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                >
                                                    {Object.entries(unitLabels).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Significant Figures
                                                </label>
                                                <select
                                                    value={significantFigures}
                                                    onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                                >
                                                    {[2, 3, 4, 5, 6].map(num => (
                                                        <option key={num} value={num}>{num} digits</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Conversions */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common Pharmacy Conversions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {commonConversions.map((conv, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadCommonConversion(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">
                                                    {conv.value} {conv.from}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    → {conv.to}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateConversion}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Convert Mass
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
                        {/* Conversion Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Scale className="w-7 h-7 mr-3" />
                                Conversion Result
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        {inputValue} {unitLabels[inputUnit]} =
                                    </div>
                                    {convertedValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {formatNumber(convertedValue)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {unitLabels[outputUnit]}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Conversion Formula */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-sm font-semibold mb-1">Conversion Factor</div>
                                    <div className="font-mono text-sm">
                                        1 {inputUnit} = {(conversionFactors[outputUnit] / conversionFactors[inputUnit]).toFixed(6)} {outputUnit}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pharmacy Guidelines */}
                        {convertedValue !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Pharmacy Guidelines
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {inputUnit === 'mg' && outputUnit === 'g' && 'For oral solid dosage forms, typical tablet strengths range from 1mg to 1000mg'}
                                            {inputUnit === 'mcg' && outputUnit === 'mg' && 'Microgram to milligram conversions are critical for potent drugs like levothyroxine'}
                                            {inputUnit === 'g' && outputUnit === 'mg' && '1 gram = 1000 milligrams. Verify calculations for compounding accuracy.'}
                                            {inputUnit === 'kg' && outputUnit === 'lb' && 'Body weight conversions: important for pediatric and weight-based dosing'}
                                            {inputUnit === 'lb' && outputUnit === 'kg' && 'Always use kilograms for medication dosing calculations'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Common Equivalents */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Equivalents</h3>
                            <div className="space-y-3">
                                {[
                                    { label: '1 kilogram (kg)', value: '2.20462 pounds (lb)' },
                                    { label: '1 pound (lb)', value: '453.592 grams (g)' },
                                    { label: '1 ounce (oz)', value: '28.3495 grams (g)' },
                                    { label: '1 grain (gr)', value: '64.7989 milligrams (mg)' },
                                    { label: '1 gram (g)', value: '1000 milligrams (mg)' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">{item.label}</span>
                                        <span className="font-semibold text-blue-600">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Precision Settings */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Precision Settings</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Decimal Places:</span>
                                    <div className="flex space-x-2">
                                        {[2, 3, 4].map(places => (
                                            <button
                                                key={places}
                                                onClick={() => setSignificantFigures(places)}
                                                className={`px-3 py-1 rounded ${significantFigures === places ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {places}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>• Use 4+ decimals for compounding</p>
                                    <p>• Use 2-3 decimals for dosing</p>
                                    <p>• Always round at final step</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mass Conversion Reference */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Mass Conversion Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Metric System</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 kg = 1000 g</p>
                                <p>• 1 g = 1000 mg</p>
                                <p>• 1 mg = 1000 mcg</p>
                                <p>• Base unit: gram (g)</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3">Imperial System</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 lb = 16 oz</p>
                                <p>• 1 oz = 28.35 g</p>
                                <p>• 1 lb = 453.59 g</p>
                                <p>• 1 grain = 64.8 mg</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3">Pharmacy Specific</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 scruple = 20 grains</p>
                                <p>• 1 drachm = 60 grains</p>
                                <p>• 1 ounce (apoth) = 480 grains</p>
                                <p>• 1 pound (apoth) = 5760 grains</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}