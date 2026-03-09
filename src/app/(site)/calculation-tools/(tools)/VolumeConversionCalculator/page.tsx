"use client";
import { useState, useEffect } from 'react';
import { Droplets, RefreshCw, AlertCircle, Beaker } from 'lucide-react';

type VolumeUnit = 'mL' | 'L' | 'μL' | 'm³' | 'gal' | 'fl oz' | 'tsp' | 'tbsp';

export default function VolumeConversionCalculator() {
    const [inputValue, setInputValue] = useState<string>('100');
    const [inputUnit, setInputUnit] = useState<VolumeUnit>('mL');
    const [outputUnit, setOutputUnit] = useState<VolumeUnit>('L');
    const [convertedValue, setConvertedValue] = useState<number | null>(null);
    const [significantFigures, setSignificantFigures] = useState<number>(4);

    const conversionFactors: Record<VolumeUnit, number> = {
        μL: 0.001,
        mL: 1,
        L: 1000,
        'm³': 1000000,
        tsp: 4.92892,
        tbsp: 14.7868,
        'fl oz': 29.5735,
        gal: 3785.41
    };

    const unitLabels: Record<VolumeUnit, string> = {
        μL: 'Microliter (μL)',
        mL: 'Milliliter (mL)',
        L: 'Liter (L)',
        'm³': 'Cubic Meter (m³)',
        tsp: 'Teaspoon (tsp)',
        tbsp: 'Tablespoon (tbsp)',
        'fl oz': 'Fluid Ounce (fl oz)',
        gal: 'Gallon (gal)'
    };

    const commonConversions = [
        { from: 'mL', to: 'L', value: 1000 },
        { from: 'L', to: 'mL', value: 2.5 },
        { from: 'tsp', to: 'mL', value: 1 },
        { from: 'tbsp', to: 'mL', value: 1 },
        { from: 'fl oz', to: 'mL', value: 30 }
    ];

    const calculateConversion = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) {
            setConvertedValue(null);
            return;
        }

        // Convert to mL (base unit) then to target unit
        const valueInMl = value * conversionFactors[inputUnit];
        const result = valueInMl / conversionFactors[outputUnit];
        setConvertedValue(result);
    };

    const resetCalculator = () => {
        setInputValue('100');
        setInputUnit('mL');
        setOutputUnit('L');
        setConvertedValue(null);
    };

    const loadCommonConversion = (index: number) => {
        const conv = commonConversions[index];
        setInputUnit(conv.from as VolumeUnit);
        setOutputUnit(conv.to as VolumeUnit);
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
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Volume Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between mL, L, μL, m³ for IV preparations and compounding</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Beaker className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">IV & Compounding</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Droplets className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Volume Conversion
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
                                                    placeholder="Enter volume value"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    From Unit
                                                </label>
                                                <select
                                                    value={inputUnit}
                                                    onChange={(e) => setInputUnit(e.target.value as VolumeUnit)}
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
                                                    onChange={(e) => setOutputUnit(e.target.value as VolumeUnit)}
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

                                {/* IV Bag Sizes */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common IV Bag Sizes</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { size: '50 mL', type: 'Pediatric' },
                                            { size: '100 mL', type: 'Small Volume' },
                                            { size: '250 mL', type: 'Standard' },
                                            { size: '500 mL', type: 'Large Volume' },
                                            { size: '1000 mL', type: 'Liter Bag' },
                                            { size: '3000 mL', type: 'TPN' },
                                            { size: '5 mL', type: 'Vial' },
                                            { size: '10 mL', type: 'Syringe' }
                                        ].map((bag, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    const match = bag.size.match(/(\d+)/);
                                                    if (match) {
                                                        setInputValue(match[1]);
                                                        setInputUnit('mL');
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{bag.size}</div>
                                                <div className="text-xs text-gray-600 mt-1">{bag.type}</div>
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
                                        Convert Volume
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
                                <Droplets className="w-7 h-7 mr-3" />
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

                        {/* IV Preparation Guidelines */}
                        {convertedValue !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    IV Preparation Guidelines
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {outputUnit === 'mL' && 'For IV push medications, verify total volume does not exceed recommended limits'}
                                            {outputUnit === 'L' && 'Large volume parenterals require strict aseptic technique'}
                                            {outputUnit === 'μL' && 'Microvolume measurements require calibrated micropipettes'}
                                            {outputUnit.includes('tsp') && 'Use oral syringes for accurate teaspoon measurements'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Common Volume Equivalents */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Volume Equivalents</h3>
                            <div className="space-y-3">
                                {[
                                    { label: '1 teaspoon (tsp)', value: '5 mL' },
                                    { label: '1 tablespoon (tbsp)', value: '15 mL' },
                                    { label: '1 fluid ounce (fl oz)', value: '30 mL' },
                                    { label: '1 cup (medical)', value: '240 mL' },
                                    { label: '1 pint (pt)', value: '473 mL' },
                                    { label: '1 quart (qt)', value: '946 mL' },
                                    { label: '1 gallon (gal)', value: '3785 mL' },
                                    { label: '1 drop (gtt)', value: '0.05 mL' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">{item.label}</span>
                                        <span className="font-semibold text-blue-600">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Drop Rate Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Drop Rate Reference</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Macrodrip (10 gtt/mL)</span>
                                    <span className="font-semibold text-blue-600">1 mL = 10 drops</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Microdrip (60 gtt/mL)</span>
                                    <span className="font-semibold text-green-600">1 mL = 60 drops</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">Blood (15 gtt/mL)</span>
                                    <span className="font-semibold text-purple-600">1 mL = 15 drops</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volume Conversion Reference */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Volume Conversion Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3">Metric Volume</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 L = 1000 mL</p>
                                <p>• 1 mL = 1000 μL</p>
                                <p>• 1 m³ = 1000 L</p>
                                <p>• Base unit: liter (L)</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3">US Customary</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 tsp = 5 mL</p>
                                <p>• 1 tbsp = 15 mL</p>
                                <p>• 1 fl oz = 30 mL</p>
                                <p>• 1 cup = 240 mL</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3">Pharmacy Measures</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 1 minim = 0.0616 mL</p>
                                <p>• 1 fluid drachm = 3.697 mL</p>
                                <p>• 1 fluid ounce = 29.57 mL</p>
                                <p>• 1 pint = 473.176 mL</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}