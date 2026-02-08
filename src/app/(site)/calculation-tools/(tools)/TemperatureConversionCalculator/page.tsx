"use client";
import { useState, useEffect } from 'react';
import { Thermometer, RefreshCw, AlertCircle, Snowflake, Flame } from 'lucide-react';

type TemperatureUnit = 'C' | 'F' | 'K';

export default function TemperatureConversionCalculator() {
    const [inputValue, setInputValue] = useState<string>('25');
    const [inputUnit, setInputUnit] = useState<TemperatureUnit>('C');
    const [outputUnit, setOutputUnit] = useState<TemperatureUnit>('F');
    const [convertedValue, setConvertedValue] = useState<number | null>(null);
    const [significantFigures, setSignificantFigures] = useState<number>(1);
    const [storageCondition, setStorageCondition] = useState<string>('');

    const commonTemperatures = [
        { label: 'Room Temp', C: 25, F: 77, context: 'Ideal for most medications' },
        { label: 'Refrigerator', C: 4, F: 39.2, context: '2-8°C standard range' },
        { label: 'Freezer', C: -20, F: -4, context: 'Long-term storage' },
        { label: 'Body Temp', C: 37, F: 98.6, context: 'Normal human body' },
        { label: 'Controlled Room', C: 20, F: 68, context: 'USP controlled room temp' }
    ];

    const calculateConversion = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) {
            setConvertedValue(null);
            return;
        }

        let result: number;

        // Convert to Celsius first
        let tempInC: number;
        switch (inputUnit) {
            case 'C':
                tempInC = value;
                break;
            case 'F':
                tempInC = (value - 32) * 5/9;
                break;
            case 'K':
                tempInC = value - 273.15;
                break;
        }

        // Convert from Celsius to output unit
        switch (outputUnit) {
            case 'C':
                result = tempInC;
                break;
            case 'F':
                result = (tempInC * 9/5) + 32;
                break;
            case 'K':
                result = tempInC + 273.15;
                break;
        }

        setConvertedValue(result);
        updateStorageCondition(tempInC);
    };

    const updateStorageCondition = (tempC: number) => {
        if (tempC <= -15) {
            setStorageCondition('Freezer storage - suitable for long-term preservation');
        } else if (tempC >= 2 && tempC <= 8) {
            setStorageCondition('Refrigerated storage - maintain cold chain');
        } else if (tempC >= 15 && tempC <= 25) {
            setStorageCondition('Controlled room temperature - most medications');
        } else if (tempC > 25 && tempC <= 30) {
            setStorageCondition('Warm storage - monitor stability');
        } else if (tempC > 30) {
            setStorageCondition('Excessive heat - stability compromised');
        } else {
            setStorageCondition('Special storage conditions required');
        }
    };

    const resetCalculator = () => {
        setInputValue('25');
        setInputUnit('C');
        setOutputUnit('F');
        setConvertedValue(null);
        setStorageCondition('');
    };

    const loadCommonTemperature = (index: number) => {
        const temp = commonTemperatures[index];
        setInputValue(temp.C.toString());
        setInputUnit('C');
        setOutputUnit('F');
    };

    const formatNumber = (num: number): string => {
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
                                <Thermometer className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Temperature Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between °C, °F, K for storage and stability monitoring</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Thermometer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Stability Monitoring</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Thermometer className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Temperature Conversion
                            </h2>

                            {/* Temperature Display */}
                            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-xl p-6 mb-6">
                                <div className="flex items-center justify-center space-x-4">
                                    <div className="text-center">
                                        <div className="text-5xl md:text-6xl font-bold text-white">
                                            {inputValue}°{inputUnit}
                                        </div>
                                        <div className="text-blue-100 mt-2">Input Temperature</div>
                                    </div>
                                    <div className="text-white text-3xl">→</div>
                                    <div className="text-center">
                                        <div className="text-5xl md:text-6xl font-bold text-white">
                                            {convertedValue !== null ? `${formatNumber(convertedValue)}°${outputUnit}` : '--'}
                                        </div>
                                        <div className="text-blue-100 mt-2">Converted Temperature</div>
                                    </div>
                                </div>
                            </div>

                            {/* Conversion Inputs */}
                            <div className="space-y-6">
                                {/* Units Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Input</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Temperature
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Enter temperature"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    From Unit
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => setInputUnit('C')}
                                                        className={`py-3 rounded-lg transition-all ${inputUnit === 'C' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        °C
                                                    </button>
                                                    <button
                                                        onClick={() => setInputUnit('F')}
                                                        className={`py-3 rounded-lg transition-all ${inputUnit === 'F' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        °F
                                                    </button>
                                                    <button
                                                        onClick={() => setInputUnit('K')}
                                                        className={`py-3 rounded-lg transition-all ${inputUnit === 'K' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        K
                                                    </button>
                                                </div>
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
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        onClick={() => setOutputUnit('C')}
                                                        className={`py-3 rounded-lg transition-all ${outputUnit === 'C' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        °C
                                                    </button>
                                                    <button
                                                        onClick={() => setOutputUnit('F')}
                                                        className={`py-3 rounded-lg transition-all ${outputUnit === 'F' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        °F
                                                    </button>
                                                    <button
                                                        onClick={() => setOutputUnit('K')}
                                                        className={`py-3 rounded-lg transition-all ${outputUnit === 'K' ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        K
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Decimal Places
                                                </label>
                                                <select
                                                    value={significantFigures}
                                                    onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                                >
                                                    {[0, 1, 2].map(num => (
                                                        <option key={num} value={num}>{num} decimal{num !== 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Common Storage Temperatures */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common Storage Temperatures</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {commonTemperatures.map((temp, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadCommonTemperature(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{temp.label}</div>
                                                <div className="text-lg font-bold text-gray-800">{temp.C}°C</div>
                                                <div className="text-xs text-gray-600 mt-1">{temp.F}°F</div>
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
                                        Convert Temperature
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
                        {/* Storage Conditions */}
                        {storageCondition && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-xl font-bold mb-4 flex items-center">
                                    <AlertCircle className="w-6 h-6 mr-3" />
                                    Storage Condition
                                </h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                    <p className="text-sm">{storageCondition}</p>
                                </div>
                            </div>
                        )}

                        {/* Temperature Scale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Temperature Scale</h3>
                            <div className="space-y-4">
                                <div className="h-48 relative bg-gradient-to-b from-blue-500 via-green-400 to-red-500 rounded-lg overflow-hidden">
                                    {/* Temperature markers */}
                                    {[-20, 0, 4, 8, 15, 20, 25, 30, 37].map(temp => (
                                        <div
                                            key={temp}
                                            className="absolute left-0 right-0 flex items-center"
                                            style={{ top: `${((temp + 20) / 60) * 100}%` }}
                                        >
                                            <div className="w-4 h-px bg-white"></div>
                                            <div className="ml-2 text-xs text-white font-semibold">
                                                {temp}°C | {Math.round((temp * 9/5) + 32)}°F
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* USP Storage Definitions */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">USP Storage Definitions</h3>
                            <div className="space-y-3">
                                {[
                                    { range: '-25°C to -10°C', label: 'Freezer', icon: <Snowflake className="w-4 h-4" /> },
                                    { range: '2°C to 8°C', label: 'Refrigerator', icon: <Snowflake className="w-4 h-4" /> },
                                    { range: '8°C to 15°C', label: 'Cool', icon: <Thermometer className="w-4 h-4" /> },
                                    { range: '15°C to 25°C', label: 'Room Temperature', icon: <Thermometer className="w-4 h-4" /> },
                                    { range: '20°C to 25°C', label: 'Controlled Room Temp', icon: <Thermometer className="w-4 h-4" /> },
                                    { range: '30°C to 40°C', label: 'Warm', icon: <Flame className="w-4 h-4" /> },
                                    { range: '40°C to 50°C', label: 'Excessive Heat', icon: <Flame className="w-4 h-4" /> }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="mr-3 text-gray-500">{item.icon}</div>
                                            <div>
                                                <div className="font-semibold text-gray-700">{item.label}</div>
                                                <div className="text-xs text-gray-500">{item.range}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conversion Formulas */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Conversion Formulas</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">°C to °F</div>
                                    <div className="font-mono text-xs">°F = (°C × 9/5) + 32</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">°F to °C</div>
                                    <div className="font-mono text-xs">°C = (°F - 32) × 5/9</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">°C to K</div>
                                    <div className="font-mono text-xs">K = °C + 273.15</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Critical Temperature Reference */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Critical Temperature Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3 flex items-center">
                                <Snowflake className="w-5 h-5 mr-2" />
                                Cold Storage
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Vaccines: 2-8°C (35-46°F)</p>
                                <p>• Insulin: 2-8°C (unopened)</p>
                                <p>• Biologicals: 2-8°C</p>
                                <p>• Freezer: -20°C (-4°F)</p>
                                <p>• Ultra-low: -80°C (-112°F)</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3 flex items-center">
                                <Thermometer className="w-5 h-5 mr-2" />
                                Room Temperature
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Controlled RT: 20-25°C</p>
                                <p>• Extended RT: 15-30°C</p>
                                <p>• Most oral solids: 15-30°C</p>
                                <p>• Opened insulin: ≤25°C</p>
                                <p>• Capsules: 15-25°C</p>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                            <h3 className="font-bold text-red-700 mb-3 flex items-center">
                                <Flame className="w-5 h-5 mr-2" />
                                Stability Limits
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Protein denaturation: &gt;40°C</p>
                                <p>• Accelerated testing: 40°C</p>
                                <p>• Glass transition: varies</p>
                                <p>• Melting point: varies</p>
                                <p>• Degradation: &gt;30°C</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}