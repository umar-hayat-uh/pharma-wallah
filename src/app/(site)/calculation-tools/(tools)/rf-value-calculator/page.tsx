"use client";
import { useState, useEffect } from 'react';
import {
    Move,
    Calculator,
    Ruler,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    Target,
    Activity,
    Zap,
    LineChart
} from 'lucide-react';

export default function RfValueCalculator() {
    const [distanceSolvent, setDistanceSolvent] = useState<string>('10');
    const [distanceCompound, setDistanceCompound] = useState<string>('4');
    const [rfValue, setRfValue] = useState<number | null>(null);
    const [multipleCompounds, setMultipleCompounds] = useState<boolean>(false);
    const [compoundDistances, setCompoundDistances] = useState<string[]>(['4', '6', '8']);
    const [solventDistances, setSolventDistances] = useState<string[]>(['10', '10', '10']);
    const [rfValues, setRfValues] = useState<number[]>([]);
    const [unit, setUnit] = useState<'cm' | 'mm'>('cm');

    const calculateRf = () => {
        if (multipleCompounds) {
            const rfArray: number[] = [];
            for (let i = 0; i < compoundDistances.length; i++) {
                const compoundDist = parseFloat(compoundDistances[i]);
                const solventDist = parseFloat(solventDistances[i]);

                if (!isNaN(compoundDist) && !isNaN(solventDist) && solventDist > 0) {
                    rfArray.push(compoundDist / solventDist);
                }
            }
            setRfValues(rfArray);
            setRfValue(null);
        } else {
            const compoundDist = parseFloat(distanceCompound);
            const solventDist = parseFloat(distanceSolvent);

            if (!isNaN(compoundDist) && !isNaN(solventDist) && solventDist > 0) {
                const rf = compoundDist / solventDist;
                setRfValue(rf);
                setRfValues([]);
            }
        }
    };

    const resetCalculator = () => {
        setDistanceSolvent('10');
        setDistanceCompound('4');
        setRfValue(null);
        setMultipleCompounds(false);
        setCompoundDistances(['4', '6', '8']);
        setSolventDistances(['10', '10', '10']);
        setRfValues([]);
    };

    const addCompound = () => {
        setCompoundDistances([...compoundDistances, '']);
        setSolventDistances([...solventDistances, '10']);
    };

    const removeCompound = (index: number) => {
        if (compoundDistances.length > 1) {
            const newCompounds = [...compoundDistances];
            const newSolvents = [...solventDistances];
            newCompounds.splice(index, 1);
            newSolvents.splice(index, 1);
            setCompoundDistances(newCompounds);
            setSolventDistances(newSolvents);
        }
    };

    const updateCompoundDistance = (index: number, value: string) => {
        const newDistances = [...compoundDistances];
        newDistances[index] = value;
        setCompoundDistances(newDistances);
    };

    const updateSolventDistance = (index: number, value: string) => {
        const newDistances = [...solventDistances];
        newDistances[index] = value;
        setSolventDistances(newDistances);
    };

    const sampleTLC = [
        {
            name: 'TLC Plate A',
            compound: '4',
            solvent: '10',
            rf: '0.4',
            note: 'Medium polarity compound'
        },
        {
            name: 'TLC Plate B',
            compound: '7.5',
            solvent: '10',
            rf: '0.75',
            note: 'Non-polar compound'
        },
        {
            name: 'TLC Plate C',
            compound: '2',
            solvent: '10',
            rf: '0.2',
            note: 'Polar compound'
        },
        {
            name: 'Multiple Spots',
            compounds: ['2', '4', '7'],
            solvent: '10',
            rfs: ['0.2', '0.4', '0.7'],
            note: 'Mixture separation'
        }
    ];

    const loadSample = (index: number) => {
        const sample = sampleTLC[index];
        if (sample.compounds) {
            setMultipleCompounds(true);
            setCompoundDistances(sample.compounds);
            setSolventDistances(Array(sample.compounds.length).fill(sample.solvent));
        } else {
            setMultipleCompounds(false);
            setDistanceCompound(sample.compound);
            setDistanceSolvent(sample.solvent);
        }
    };

    const getRfInterpretation = (rf: number) => {
        if (rf < 0.1) return 'Very polar - strongly retained';
        if (rf < 0.3) return 'Polar - good for separation';
        if (rf < 0.7) return 'Medium polarity - typical range';
        if (rf < 0.9) return 'Non-polar - fast moving';
        return 'Very non-polar - near solvent front';
    };

    useEffect(() => {
        calculateRf();
    }, [distanceSolvent, distanceCompound, multipleCompounds, compoundDistances, solventDistances, unit]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Move className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Rf Value Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate retention factors for thin-layer chromatography</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Ruler className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">TLC Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Rf Value Calculation
                            </h2>

                            {/* Single/Multiple Mode Toggle */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-lg font-semibold text-gray-800">Calculation Mode</label>
                                    <button
                                        onClick={() => setMultipleCompounds(!multipleCompounds)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${multipleCompounds
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {multipleCompounds ? 'Multiple Compounds' : 'Single Compound'}
                                    </button>
                                </div>
                            </div>

                            {/* Units Selection */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Distance Units</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['cm', 'mm']).map((distUnit) => (
                                                <button
                                                    key={distUnit}
                                                    onClick={() => setUnit(distUnit as 'cm' | 'mm')}
                                                    className={`py-2 rounded-lg transition-all ${unit === distUnit ?
                                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                                                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {distUnit}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                            <div className="text-sm font-semibold text-gray-600">Note</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Use same units for both distances
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Single Compound Mode */}
                            {!multipleCompounds && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Distance Measurements
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Distance Traveled by Compound ({unit})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={distanceCompound}
                                                    onChange={(e) => setDistanceCompound(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 4"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    From origin to compound spot center
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Distance Traveled by Solvent ({unit})
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={distanceSolvent}
                                                    onChange={(e) => setDistanceSolvent(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                    placeholder="e.g., 10"
                                                />
                                                <div className="text-xs text-gray-500 mt-2">
                                                    From origin to solvent front
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multiple Compounds Mode */}
                            {multipleCompounds && (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Activity className="w-5 h-5 mr-2 text-green-600" />
                                                Multiple Compound Distances
                                            </div>
                                            <button
                                                onClick={addCompound}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                Add Spot
                                            </button>
                                        </h3>

                                        <div className="space-y-4 max-h-80 overflow-y-auto p-2">
                                            {compoundDistances.map((distance, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-300">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-700">Spot {index + 1}</h4>
                                                        <button
                                                            onClick={() => removeCompound(index)}
                                                            disabled={compoundDistances.length <= 1}
                                                            className={`px-3 py-1 rounded text-sm ${compoundDistances.length <= 1
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                }`}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Compound Distance ({unit})
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={distance}
                                                                onChange={(e) => updateCompoundDistance(index, e.target.value)}
                                                                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg"
                                                                placeholder="Distance"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Solvent Distance ({unit})
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={solventDistances[index]}
                                                                onChange={(e) => updateSolventDistance(index, e.target.value)}
                                                                className="w-full px-4 py-2 border-2 border-green-200 rounded-lg"
                                                                placeholder="Distance"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formula Display */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Rf Value Formula</h3>
                                <div className="p-4 bg-white rounded-lg border border-gray-300">
                                    <div className="font-mono text-lg mb-2 text-center">
                                        Rf = Distance Traveled by Compound ÷ Distance Traveled by Solvent
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Where:<br />
                                        • Rf = Retention factor (0 to 1)<br />
                                        • Distance measured from origin<br />
                                        • Same units must be used for both distances
                                    </div>
                                </div>
                            </div>

                            {/* Sample TLC Plates */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Example TLC Plates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {sampleTLC.map((sample, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-blue-700">{sample.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                {sample.compounds
                                                    ? `${sample.compounds.length} spots`
                                                    : `Rf: ${sample.rf}`
                                                }
                                            </div>
                                            <div className="text-xs text-blue-600 mt-2">{sample.note}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={calculateRf}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate Rf Values
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

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Rf Value Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <TrendingUp className="w-7 h-7 mr-3" />
                                {multipleCompounds ? 'Rf Values' : 'Rf Value'}
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-4">
                                        Retention Factor(s)
                                    </div>

                                    {!multipleCompounds && rfValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {rfValue.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                Rf
                                            </div>
                                        </>
                                    ) : multipleCompounds && rfValues.length > 0 ? (
                                        <div className="space-y-3">
                                            {rfValues.map((rf, index) => (
                                                <div key={index} className="bg-white/10 rounded-lg p-3">
                                                    <div className="font-semibold">Spot {index + 1}</div>
                                                    <div className="text-3xl font-bold">{rf.toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rf Range Info */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-sm font-semibold mb-1">Valid Range</div>
                                    <div className="text-lg font-bold">0.0 to 1.0</div>
                                    <div className="text-xs mt-1 text-blue-100">
                                        Typical range: 0.2-0.8
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interpretation */}
                        {rfValue !== null && !multipleCompounds && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Polarity Assessment
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getRfInterpretation(rfValue)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Compound distance:</span>
                                            <span className="font-semibold">{distanceCompound} {unit}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Solvent distance:</span>
                                            <span className="font-semibold">{distanceSolvent} {unit}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TLC Plate Visualization */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">TLC Plate Diagram</h3>
                            <div className="h-48 relative border border-gray-300 rounded-lg bg-gradient-to-b from-blue-50 to-transparent">
                                {/* TLC plate visualization */}
                                <div className="absolute inset-0 p-4">
                                    {/* Origin line */}
                                    <div className="absolute left-4 right-4 h-px bg-gray-800 top-8"></div>
                                    <div className="absolute left-4 text-xs text-gray-600 top-4">Origin</div>

                                    {/* Solvent front */}
                                    <div className="absolute left-4 right-4 h-px bg-gray-800 top-32"></div>
                                    <div className="absolute right-4 text-xs text-gray-600 top-28">Solvent Front</div>

                                    {/* Compound spots */}
                                    {multipleCompounds ? (
                                        rfValues.map((rf, index) => {
                                            const position = 8 + (rf * 24); // Scale for visualization
                                            return (
                                                <div
                                                    key={index}
                                                    className="absolute w-8 h-1 bg-gradient-to-r from-blue-600 to-green-400 rounded-full"
                                                    style={{
                                                        left: '50%', top: `${position}px`, transform: 'translateX(-50%)'
                                                    }}
                                                >
                                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                                                        Rf = {rf.toFixed(2)}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : rfValue !== null ? (
                                        <div
                                            className="absolute w-8 h-1 bg-gradient-to-r from-blue-600 to-green-400 rounded-full"
                                            style={{ left: '50%', top: `${8 + (rfValue * 24)}px`, transform: 'translateX(-50%)' }}
                                        >
                                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                                                Rf = {rfValue.toFixed(2)}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Rf Value Guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Rf Value Guide</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Low Rf (0.0-0.3):</div>
                                    <div className="text-gray-600 mt-1">Polar compounds, strongly retained</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Medium Rf (0.3-0.7):</div>
                                    <div className="text-gray-600 mt-1">Good separation, typical range</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">High Rf (0.7-1.0):</div>
                                    <div className="text-gray-600 mt-1">Non-polar, moves with solvent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TLC Principles */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">TLC Analysis Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Factors Affecting Rf</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Stationary phase polarity</p>
                                <p>• Mobile phase composition</p>
                                <p>• Temperature</p>
                                <p>• Plate activity</p>
                                <p>• Chamber saturation</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Applications</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Reaction monitoring</p>
                                <p>• Purity checking</p>
                                <p>• Compound identification</p>
                                <p>• Separation optimization</p>
                                <p>• Preparative TLC guidance</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Best Practices</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Mark origin before development</p>
                                <p>• Mark solvent front immediately</p>
                                <p>• Use pencil for markings</p>
                                <p>• Allow proper drying</p>
                                <p>• Use UV light for visualization</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}