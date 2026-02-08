"use client";
import { useState, useEffect } from 'react';
import { PieChart, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

type StrengthFormat = 'percent' | 'ratio' | 'wv' | 'ww' | 'vv';

export default function StrengthConversionCalculator() {
    const [inputValue, setInputValue] = useState<string>('1');
    const [inputFormat, setInputFormat] = useState<StrengthFormat>('percent');
    const [outputFormat, setOutputFormat] = useState<StrengthFormat>('ratio');
    const [convertedValue, setConvertedValue] = useState<string | null>(null);
    const [massUnit, setMassUnit] = useState<'mg' | 'g'>('mg');
    const [volumeUnit, setVolumeUnit] = useState<'mL' | 'L'>('mL');
    const [density, setDensity] = useState<string>('1');

    const formatLabels: Record<StrengthFormat, string> = {
        percent: 'Percentage (%)',
        ratio: 'Ratio Strength (1:X)',
        wv: 'Weight/Volume (wv)',
        ww: 'Weight/Weight (ww)',
        vv: 'Volume/Volume (vv)'
    };

    const commonStrengths = [
        { label: '1% Solution', value: '1', format: 'percent' as StrengthFormat },
        { label: '1:1000 Ratio', value: '1000', format: 'ratio' as StrengthFormat },
        { label: '5 mg/mL', value: '5', format: 'wv' as StrengthFormat },
        { label: '0.1% ww', value: '0.1', format: 'percent' as StrengthFormat },
        { label: '10% Solution', value: '10', format: 'percent' as StrengthFormat }
    ];

    const calculateConversion = () => {
        const value = parseFloat(inputValue);
        const densityVal = parseFloat(density);
        
        if (isNaN(value) || value <= 0) {
            setConvertedValue(null);
            return;
        }

        let result: number;
        let unit: string = '';

        // Convert input to percentage first
        let percentage: number;
        switch (inputFormat) {
            case 'percent':
                percentage = value;
                break;
            case 'ratio':
                percentage = (1 / value) * 100;
                break;
            case 'wv':
                percentage = (value / (massUnit === 'mg' ? 10 : 10000)) * (volumeUnit === 'mL' ? 1 : 0.001);
                break;
            case 'ww':
                percentage = value / (massUnit === 'mg' ? 10 : 10000);
                break;
            case 'vv':
                percentage = value * densityVal;
                break;
        }

        // Convert percentage to output format
        switch (outputFormat) {
            case 'percent':
                result = percentage;
                unit = '%';
                break;
            case 'ratio':
                result = 100 / percentage;
                unit = `1:${result.toFixed(0)}`;
                break;
            case 'wv':
                result = percentage * (massUnit === 'mg' ? 10 : 10000) * (volumeUnit === 'mL' ? 1 : 1000);
                unit = `${massUnit}/${volumeUnit}`;
                break;
            case 'ww':
                result = percentage * (massUnit === 'mg' ? 10 : 10000);
                unit = `${massUnit}/${massUnit}`;
                break;
            case 'vv':
                result = percentage / densityVal;
                unit = 'vv';
                break;
        }

        setConvertedValue(`${result.toFixed(4)} ${unit}`);
    };

    const resetCalculator = () => {
        setInputValue('1');
        setInputFormat('percent');
        setOutputFormat('ratio');
        setConvertedValue(null);
        setMassUnit('mg');
        setVolumeUnit('mL');
        setDensity('1');
    };

    const loadCommonStrength = (index: number) => {
        const strength = commonStrengths[index];
        setInputValue(strength.value);
        setInputFormat(strength.format);
    };

    useEffect(() => {
        calculateConversion();
    }, [inputValue, inputFormat, outputFormat, massUnit, volumeUnit, density]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <PieChart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Strength Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between %, ratio, wv, ww formats for pharmacy compounding</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Compounding</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <PieChart className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Strength Conversion
                            </h2>

                            {/* Conversion Inputs */}
                            <div className="space-y-6">
                                {/* Format Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Input Format</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Format
                                                </label>
                                                <select
                                                    value={inputFormat}
                                                    onChange={(e) => setInputFormat(e.target.value as StrengthFormat)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                >
                                                    {Object.entries(formatLabels).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Value
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Enter strength value"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Output Format</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Format
                                                </label>
                                                <select
                                                    value={outputFormat}
                                                    onChange={(e) => setOutputFormat(e.target.value as StrengthFormat)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                >
                                                    {Object.entries(formatLabels).map(([key, label]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Mass Unit
                                                    </label>
                                                    <select
                                                        value={massUnit}
                                                        onChange={(e) => setMassUnit(e.target.value as 'mg' | 'g')}
                                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                                                    >
                                                        <option value="mg">mg</option>
                                                        <option value="g">g</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Volume Unit
                                                    </label>
                                                    <select
                                                        value={volumeUnit}
                                                        onChange={(e) => setVolumeUnit(e.target.value as 'mL' | 'L')}
                                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                                                    >
                                                        <option value="mL">mL</option>
                                                        <option value="L">L</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Density Input for vv conversions */}
                                {(inputFormat === 'vv' || outputFormat === 'vv') && (
                                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Density Correction</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Density (g/mL)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={density}
                                                    onChange={(e) => setDensity(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                                                    placeholder="Enter density"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm text-gray-600">
                                                        Required for accurate vv conversions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Common Strengths */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common Pharmacy Strengths</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {commonStrengths.map((strength, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadCommonStrength(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{strength.label}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {strength.value} {strength.format === 'percent' ? '%' : ''}
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
                                        Convert Strength
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
                                <PieChart className="w-7 h-7 mr-3" />
                                Conversion Result
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        {inputValue} {formatLabels[inputFormat]} =
                                    </div>
                                    {convertedValue !== null ? (
                                        <>
                                            <div className="text-4xl md:text-5xl font-bold mb-2 break-all">
                                                {convertedValue.split(' ')[0]}
                                            </div>
                                            <div className="text-xl font-semibold">
                                                {convertedValue.split(' ').slice(1).join(' ')}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interpretation */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-sm font-semibold mb-1">Interpretation</div>
                                    <div className="text-xs">
                                        {convertedValue && `This represents the concentration in ${formatLabels[outputFormat].toLowerCase()} format`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Applications */}
                        {convertedValue !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Applications
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {outputFormat === 'percent' && 'Percentage strengths are commonly used for topical preparations and solutions.'}
                                            {outputFormat === 'ratio' && 'Ratio strengths are often used for dilute solutions (e.g., epinephrine 1:1000).'}
                                            {outputFormat === 'wv' && 'Weight/volume is standard for solutions where solute is solid and solvent is liquid.'}
                                            {outputFormat === 'ww' && 'Weight/weight is used for ointments, creams, and other semisolid preparations.'}
                                            {outputFormat === 'vv' && 'Volume/volume is used for liquid-liquid mixtures (e.g., alcohol solutions).'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Strength Equivalents */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Equivalents</h3>
                            <div className="space-y-3">
                                {[
                                    { strength: '1%', equivalent: '1 g/100 mL', type: 'wv' },
                                    { strength: '1:100', equivalent: '1%', type: 'ratio' },
                                    { strength: '1 mg/mL', equivalent: '0.1%', type: 'wv' },
                                    { strength: '5%', equivalent: '50 mg/mL', type: 'wv' },
                                    { strength: '0.1%', equivalent: '1 mg/mL', type: 'wv' },
                                    { strength: '1:1000', equivalent: '0.1%', type: 'ratio' },
                                    { strength: '1:10,000', equivalent: '0.01%', type: 'ratio' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">{item.strength}</span>
                                        <span className="font-semibold text-blue-600">{item.equivalent}</span>
                                        <span className="text-xs text-gray-500">{item.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compounding Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Compounding Tips</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-blue-600">•</div>
                                    <span className="text-gray-700">Always verify the final concentration matches prescription</span>
                                </div>
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-green-600">•</div>
                                    <span className="text-gray-700">Use appropriate precision for balance measurements</span>
                                </div>
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-purple-600">•</div>
                                    <span className="text-gray-700">Document all calculations in compounding record</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strength Conversion Reference */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Strength Conversion Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Percentage Strengths</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1% = 1 g/100 mL (wv)</p>
                                <p>• 1% = 1 g/100 g (ww)</p>
                                <p>• 1% = 1 mL/100 mL (vv)</p>
                                <p>• For wv: % = (g solute/100 mL) × 100</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3">Ratio Strengths</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1:X means 1 part in X parts total</p>
                                <p>• 1:1000 = 0.1%</p>
                                <p>• 1:10,000 = 0.01%</p>
                                <p>• Convert to %: (1/X) × 100</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3">Weight/Volume</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Common format: mg/mL</p>
                                <p>• 1 mg/mL = 0.1%</p>
                                <p>• 10 mg/mL = 1%</p>
                                <p>• 50 mg/mL = 5%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}