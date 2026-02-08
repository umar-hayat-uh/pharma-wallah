"use client";
import { useState, useEffect } from 'react';
import { Weight, RefreshCw, AlertCircle, Droplet } from 'lucide-react';

type Substance = {
    name: string;
    density: number;
    category: string;
    commonUses: string[];
};

export default function DensityConversionCalculator() {
    const [mass, setMass] = useState<string>('100');
    const [volume, setVolume] = useState<string>('100');
    const [density, setDensity] = useState<string>('1');
    const [selectedSubstance, setSelectedSubstance] = useState<string>('water');
    const [calculationType, setCalculationType] = useState<'mass_to_volume' | 'volume_to_mass'>('mass_to_volume');
    const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
    const [massUnit, setMassUnit] = useState<'mg' | 'g' | 'kg'>('g');
    const [volumeUnit, setVolumeUnit] = useState<'mL' | 'L'>('mL');

    const substances: Record<string, Substance> = {
        water: {
            name: 'Water',
            density: 1.00,
            category: 'Solvent',
            commonUses: ['Diluent', 'Vehicle', 'Reconstitution']
        },
        ethanol: {
            name: 'Ethanol (95%)',
            density: 0.816,
            category: 'Solvent',
            commonUses: ['Extraction', 'Preservative', 'Tinctures']
        },
        glycerol: {
            name: 'Glycerol',
            density: 1.26,
            category: 'Vehicle',
            commonUses: ['Syrups', 'Ointments', 'Humectant']
        },
        propylene_glycol: {
            name: 'Propylene Glycol',
            density: 1.04,
            category: 'Vehicle',
            commonUses: ['Injectables', 'Topicals', 'Solvent']
        },
        mineral_oil: {
            name: 'Mineral Oil',
            density: 0.88,
            category: 'Vehicle',
            commonUses: ['Laxative', 'Ointment base', 'Lubricant']
        },
        olive_oil: {
            name: 'Olive Oil',
            density: 0.92,
            category: 'Vehicle',
            commonUses: ['Ointments', 'Emulsions', 'Carrier']
        },
        honey: {
            name: 'Honey',
            density: 1.42,
            category: 'Vehicle',
            commonUses: ['Cough syrups', 'Demulcent', 'Sweetener']
        }
    };

    const commonConversions = [
        { substance: 'water', mass: 100, volume: 100, type: 'mass_to_volume' as const },
        { substance: 'ethanol', mass: 100, volume: 122.5, type: 'mass_to_volume' as const },
        { substance: 'glycerol', mass: 100, volume: 79.4, type: 'mass_to_volume' as const },
        { substance: 'propylene_glycol', mass: 100, volume: 96.2, type: 'mass_to_volume' as const },
        { substance: 'mineral_oil', mass: 100, volume: 113.6, type: 'mass_to_volume' as const }
    ];

    const calculateConversion = () => {
        const massVal = parseFloat(mass);
        const volumeVal = parseFloat(volume);
        const densityVal = selectedSubstance === 'custom' ? parseFloat(density) : substances[selectedSubstance].density;

        if (isNaN(densityVal) || densityVal <= 0) {
            setCalculatedValue(null);
            return;
        }

        let result: number;

        if (calculationType === 'mass_to_volume') {
            // Mass to volume: Volume = Mass / Density
            result = massVal / densityVal;
        } else {
            // Volume to mass: Mass = Volume × Density
            result = volumeVal * densityVal;
        }

        setCalculatedValue(result);
    };

    const resetCalculator = () => {
        setMass('100');
        setVolume('100');
        setDensity('1');
        setSelectedSubstance('water');
        setCalculationType('mass_to_volume');
        setCalculatedValue(null);
    };

    const loadCommonConversion = (index: number) => {
        const conv = commonConversions[index];
        setSelectedSubstance(conv.substance);
        setCalculationType(conv.type);
        setMass(conv.mass.toString());
        calculateConversion();
    };

    const formatNumber = (num: number): string => {
        if (num === 0) return '0';
        if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
            return num.toExponential(3);
        }
        return num.toFixed(2);
    };

    const handleSubstanceChange = (substance: string) => {
        setSelectedSubstance(substance);
        if (substance !== 'custom') {
            setDensity(substances[substance].density.toFixed(3));
        }
    };

    useEffect(() => {
        calculateConversion();
    }, [mass, volume, density, selectedSubstance, calculationType, massUnit, volumeUnit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Weight className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Density-Based Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between mass and volume using density for liquid drug substances</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Droplet className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Liquid Compounding</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Weight className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Density Conversion
                            </h2>

                            {/* Calculation Type */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculation Type</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setCalculationType('mass_to_volume')}
                                        className={`p-4 rounded-lg transition-all ${calculationType === 'mass_to_volume' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-semibold">Mass → Volume</div>
                                        <div className="text-sm mt-1">Volume = Mass ÷ Density</div>
                                    </button>
                                    <button
                                        onClick={() => setCalculationType('volume_to_mass')}
                                        className={`p-4 rounded-lg transition-all ${calculationType === 'volume_to_mass' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-semibold">Volume → Mass</div>
                                        <div className="text-sm mt-1">Mass = Volume × Density</div>
                                    </button>
                                </div>
                            </div>

                            {/* Substance Selection */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Select Substance</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(substances).map(([key, substance]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleSubstanceChange(key)}
                                            className={`p-3 rounded-lg border transition-all ${selectedSubstance === key ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white border-transparent' :
                                                'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <div className="font-semibold">{substance.name}</div>
                                            <div className="text-xs mt-1">Density: {substance.density} g/mL</div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleSubstanceChange('custom')}
                                        className={`p-3 rounded-lg border transition-all ${selectedSubstance === 'custom' ?
                                            'bg-gradient-to-r from-purple-600 to-pink-400 text-white border-transparent' :
                                            'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <div className="font-semibold">Custom</div>
                                        <div className="text-xs mt-1">Enter density</div>
                                    </button>
                                </div>
                            </div>

                            {/* Input Values */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Input</h3>
                                        {calculationType === 'mass_to_volume' ? (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Mass ({massUnit})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={mass}
                                                    onChange={(e) => setMass(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Enter mass"
                                                />
                                                <div className="mt-3">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Mass Unit
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {(['mg', 'g', 'kg'] as const).map(unit => (
                                                            <button
                                                                key={unit}
                                                                onClick={() => setMassUnit(unit)}
                                                                className={`py-2 rounded ${massUnit === unit ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                            >
                                                                {unit}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Volume ({volumeUnit})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={volume}
                                                    onChange={(e) => setVolume(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="Enter volume"
                                                />
                                                <div className="mt-3">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Volume Unit
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(['mL', 'L'] as const).map(unit => (
                                                            <button
                                                                key={unit}
                                                                onClick={() => setVolumeUnit(unit)}
                                                                className={`py-2 rounded ${volumeUnit === unit ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                            >
                                                                {unit}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Density</h3>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Density (g/mL)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={density}
                                                onChange={(e) => setDensity(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="Enter density"
                                                disabled={selectedSubstance !== 'custom'}
                                            />
                                            {selectedSubstance !== 'custom' && (
                                                <div className="mt-3 text-sm text-gray-600">
                                                    Density of {substances[selectedSubstance].name}: {density} g/mL
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Common Conversions */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common Conversions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {commonConversions.map((conv, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadCommonConversion(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">
                                                    {conv.mass}g
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {substances[conv.substance].name}
                                                </div>
                                                <div className="text-sm font-bold text-gray-800 mt-1">
                                                    = {conv.volume}mL
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
                                        Calculate Conversion
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
                        {/* Calculation Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Weight className="w-7 h-7 mr-3" />
                                Calculation Result
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        {calculationType === 'mass_to_volume' ? `${mass} ${massUnit} of ${substances[selectedSubstance]?.name || 'Substance'}` :
                                            `${volume} ${volumeUnit} of ${substances[selectedSubstance]?.name || 'Substance'}`}
                                    </div>
                                    {calculatedValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {formatNumber(calculatedValue)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {calculationType === 'mass_to_volume' ? volumeUnit : massUnit}
                                            </div>
                                            <div className="text-sm mt-4 text-blue-100">
                                                Density: {density} g/mL
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Formula */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-sm font-semibold mb-1">Formula</div>
                                    <div className="font-mono text-xs">
                                        {calculationType === 'mass_to_volume' ? 'Volume = Mass ÷ Density' : 'Mass = Volume × Density'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Substance Information */}
                        {selectedSubstance !== 'custom' && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Substance Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            <strong>Name:</strong> {substances[selectedSubstance].name}<br />
                                            <strong>Density:</strong> {substances[selectedSubstance].density} g/mL<br />
                                            <strong>Category:</strong> {substances[selectedSubstance].category}<br />
                                            <strong>Uses:</strong> {substances[selectedSubstance].commonUses.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Density Comparison */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Density Comparison</h3>
                            <div className="space-y-3">
                                {Object.values(substances).map((substance, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-32 text-sm text-gray-700 font-medium">
                                            {substance.name}
                                        </div>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-green-400"
                                                style={{ width: `${(substance.density / 1.5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-16 text-right text-sm font-semibold">
                                            {substance.density}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compounding Tips */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Compounding Tips</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-blue-600">•</div>
                                    <span className="text-gray-700">Always measure liquids at room temperature (20-25°C)</span>
                                </div>
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-green-600">•</div>
                                    <span className="text-gray-700">Account for temperature effects on density</span>
                                </div>
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-purple-600">•</div>
                                    <span className="text-gray-700">Use calibrated glassware for volume measurements</span>
                                </div>
                                <div className="flex items-start p-3 bg-white/50 rounded-lg">
                                    <div className="mr-3 text-red-600">•</div>
                                    <span className="text-gray-700">Verify density values in USP/NF monographs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Density Reference Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Density Reference Table</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="p-3 text-left font-semibold text-gray-700">Substance</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Density (g/mL)</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Category</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Common Uses</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Temperature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(substances).map((substance, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 font-medium">{substance.name}</td>
                                        <td className="p-3">{substance.density.toFixed(3)}</td>
                                        <td className="p-3">{substance.category}</td>
                                        <td className="p-3 text-sm">{substance.commonUses.join(', ')}</td>
                                        <td className="p-3">20-25°C</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50">
                                    <td className="p-3 font-medium">Water (4°C)</td>
                                    <td className="p-3">1.000</td>
                                    <td className="p-3">Reference</td>
                                    <td className="p-3 text-sm">Standard reference</td>
                                    <td className="p-3">4°C</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">Ethanol (100%)</td>
                                    <td className="p-3">0.789</td>
                                    <td className="p-3">Solvent</td>
                                    <td className="p-3 text-sm">Tinctures, extracts</td>
                                    <td className="p-3">20°C</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}