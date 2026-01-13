"use client";
import { useState } from 'react';
import { Beaker, Calculator, RefreshCw, Info } from 'lucide-react';

export default function CFUCalculator() {
    const [dilutionFactor, setDilutionFactor] = useState<string>('100');
    const [colonyCount, setColonyCount] = useState<string>('');
    const [volumePlated, setVolumePlated] = useState<string>('0.1');
    const [cfuResult, setCfuResult] = useState<{
        cfuPerML: number;
        concentration: string;
        colonies: number;
        validity: string;
        color: string;
    } | null>(null);

    const calculateCFU = () => {
        const dilution = parseFloat(dilutionFactor);
        const colonies = parseFloat(colonyCount);
        const volume = parseFloat(volumePlated);

        if (isNaN(dilution) || isNaN(colonies) || isNaN(volume) || dilution <= 0 || colonies < 0 || volume <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const cfuPerML = (colonies * dilution) / volume;

        let concentration = '';
        let color = '';
        let validity = '';

        if (colonies < 30) {
            validity = '⚠️ TOO FEW COLONIES - Increase sample volume';
        } else if (colonies > 300) {
            validity = '⚠️ TOO MANY COLONIES - Increase dilution factor';
        } else {
            validity = '✓ VALID COUNT';
        }

        if (cfuPerML < 100) {
            concentration = 'Very Low';
            color = 'text-blue-600';
        } else if (cfuPerML < 1000) {
            concentration = 'Low';
            color = 'text-green-600';
        } else if (cfuPerML < 10000) {
            concentration = 'Moderate';
            color = 'text-yellow-600';
        } else if (cfuPerML < 100000) {
            concentration = 'High';
            color = 'text-orange-600';
        } else {
            concentration = 'Very High';
            color = 'text-red-600';
        }

        setCfuResult({
            cfuPerML,
            concentration,
            colonies,
            validity,
            color
        });
    };

    const resetCalculator = () => {
        setDilutionFactor('100');
        setColonyCount('');
        setVolumePlated('0.1');
        setCfuResult(null);
    };

    const sampleCalculations = [
        { dilution: '10', colonies: '250', volume: '1.0', result: '2,500 CFU/mL' },
        { dilution: '100', colonies: '45', volume: '0.1', result: '45,000 CFU/mL' },
        { dilution: '1000', colonies: '150', volume: '0.5', result: '300,000 CFU/mL' },
        { dilution: '10000', colonies: '30', volume: '0.1', result: '3,000,000 CFU/mL' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Beaker className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Colony Forming Unit (CFU) Calculator</h2>
                    <p className="text-gray-600">Calculate bacterial concentration from serial dilution plating</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Dilution Factor
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                value={dilutionFactor}
                                onChange={(e) => setDilutionFactor(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 100"
                            />
                            <p className="text-xs text-gray-600 mt-1">e.g., 10⁻² = 100</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Colony Count
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={colonyCount}
                                onChange={(e) => setColonyCount(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 150"
                            />
                            <p className="text-xs text-gray-600 mt-1">Counted colonies</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Volume (mL)
                            </label>
                            <select
                                value={volumePlated}
                                onChange={(e) => setVolumePlated(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                            >
                                <option value="0.1">0.1 mL</option>
                                <option value="0.2">0.2 mL</option>
                                <option value="0.5">0.5 mL</option>
                                <option value="1.0">1.0 mL</option>
                            </select>
                        </div>
                    </div>

                    {/* Visual Plate Representation */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Colony Plate Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-80 h-80">
                                {/* Petri dish */}
                                <div className="absolute inset-0 rounded-full border-8 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>
                                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                {/* Grid overlay */}
                                <div className="absolute inset-4 opacity-30">
                                    <div className="h-full border-l border-gray-400 absolute left-1/3"></div>
                                    <div className="h-full border-l border-gray-400 absolute left-2/3"></div>
                                    <div className="w-full border-t border-gray-400 absolute top-1/3"></div>
                                    <div className="w-full border-t border-gray-400 absolute top-2/3"></div>
                                </div>

                                {/* Colonies visualization */}
                                {colonyCount ? (
                                    <>
                                        {Array.from({ length: Math.min(parseInt(colonyCount), 200) }).map((_, i) => {
                                            const size = Math.random() * 15 + 5;
                                            const x = Math.random() * 80 + 10;
                                            const y = Math.random() * 80 + 10;
                                            const opacity = Math.random() * 0.3 + 0.7;
                                            return (
                                                <div
                                                    key={i}
                                                    className="absolute rounded-full bg-gradient-to-br from-gray-800 to-gray-600 shadow-md"
                                                    style={{
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        left: `${x}%`,
                                                        top: `${y}%`,
                                                        opacity: opacity,
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* Count display */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="bg-white bg-opacity-90 px-6 py-3 rounded-xl shadow-lg">
                                                <div className="text-2xl font-bold text-gray-800 text-center">{colonyCount}</div>
                                                <div className="text-sm text-gray-600 text-center">colonies</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-4 rounded-full flex items-center justify-center">
                                        <div className="text-gray-500 text-center">
                                            <div className="text-lg mb-2">Enter colony count</div>
                                            <div className="text-sm">to visualize plate</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Count validity indicator */}
                        {colonyCount && (
                            <div className="mt-4 text-center">
                                {parseInt(colonyCount) < 30 ? (
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                                        <Info className="w-4 h-4 mr-2" />
                                        Too few colonies (＜30)
                                    </div>
                                ) : parseInt(colonyCount) > 300 ? (
                                    <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full">
                                        <Info className="w-4 h-4 mr-2" />
                                        Too many colonies (＞300)
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                                        <Info className="w-4 h-4 mr-2" />
                                        Optimal count (30-300)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateCFU}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate CFU/mL
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {cfuResult && (
                        <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">CFU Calculation Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">CFU per Milliliter</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {cfuResult.cfuPerML.toLocaleString('en-US', {
                                        maximumFractionDigits: 0
                                    })}
                                </div>
                                <div className={`text-lg font-bold ${cfuResult.color}`}>
                                    {cfuResult.concentration} Concentration
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Calculation</div>
                                    <p className="text-gray-600 text-sm">
                                        CFU/mL = ({cfuResult.colonies} colonies × {dilutionFactor}) ÷ {volumePlated} mL
                                    </p>
                                </div>

                                <div className={`rounded-lg p-4 ${cfuResult.validity.includes('VALID') ? 'bg-green-100 text-green-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    <div className="font-semibold mb-1">Count Validity</div>
                                    <p className="text-sm">{cfuResult.validity}</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="font-semibold text-blue-800 mb-1">Dilution Factor: {dilutionFactor}</div>
                                    <p className="text-sm text-blue-700">
                                        This corresponds to a {Math.log10(parseFloat(dilutionFactor)).toFixed(0)}⁻¹⁰ dilution
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reference Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Calculator className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">CFU Calculation Reference</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Dilution</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Colonies</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Volume (mL)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">CFU/mL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleCalculations.map((calc, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">10⁻² = {calc.dilution}</td>
                                            <td className="py-3 px-4">{calc.colonies}</td>
                                            <td className="py-3 px-4">{calc.volume}</td>
                                            <td className="py-3 px-4 font-bold text-green-600">{calc.result}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center text-yellow-800 mb-2">
                                <Info className="w-4 h-4 mr-2" />
                                <span className="font-semibold">Important Guidelines</span>
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Optimal colony count range: 30-300 colonies per plate</li>
                                <li>• Count only distinct, well-separated colonies</li>
                                <li>• Report CFU/mL with appropriate significant figures</li>
                                <li>• Always include dilution factor in results</li>
                            </ul>
                        </div>
                    </div>

                    {/* Concentration Interpretation */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Concentration Interpretation Guide</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                                    <span>＜100 CFU/mL</span>
                                </div>
                                <span className="font-semibold text-blue-600">Very Low</span>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                                    <span>100-1,000 CFU/mL</span>
                                </div>
                                <span className="font-semibold text-green-600">Low</span>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                                    <span>1,000-10,000 CFU/mL</span>
                                </div>
                                <span className="font-semibold text-yellow-600">Moderate</span>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 mr-3"></div>
                                    <span>10,000-100,000 CFU/mL</span>
                                </div>
                                <span className="font-semibold text-orange-600">High</span>
                            </div>
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                                    <span>＞100,000 CFU/mL</span>
                                </div>
                                <span className="font-semibold text-red-600">Very High</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}