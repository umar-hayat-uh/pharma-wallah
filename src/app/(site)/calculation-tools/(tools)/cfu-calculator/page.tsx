"use client";
import { useState, useEffect } from 'react';
import { Beaker, Calculator, RefreshCw, Info, BookOpen, AlertCircle, Activity, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CFUCalculator() {
    const [dilutionFactor, setDilutionFactor] = useState<string>('100');
    const [colonyCount, setColonyCount] = useState<string>('');
    const [volumePlated, setVolumePlated] = useState<string>('0.1');
    const [sampleType, setSampleType] = useState<string>('water');
    const [cfuResult, setCfuResult] = useState<{
        cfuPerML: number;
        concentration: string;
        colonies: number;
        validity: string;
        color: string;
        interpretation: string;
    } | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    // Sample type reference limits (CFU/mL)
    const typeLimits = {
        water: { acceptable: 100, marginal: 500, high: 1000 },
        food: { acceptable: 1000, marginal: 10000, high: 100000 },
        urine: { acceptable: 10000, marginal: 100000, high: 1000000 },
    };

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
        let interpretation = '';

        // Colony count validity
        if (colonies < 30) {
            validity = '⚠️ TOO FEW COLONIES – Increase sample volume';
        } else if (colonies > 300) {
            validity = '⚠️ TOO MANY COLONIES – Increase dilution factor';
        } else {
            validity = '✓ VALID COUNT (30–300 CFU) ';
        }

        // Concentration category based on sample type
        const limits = typeLimits[sampleType as keyof typeof typeLimits];
        if (cfuPerML < limits.acceptable) {
            concentration = 'Acceptable';
            color = 'text-green-600';
            interpretation = 'Within acceptable limits for this sample type.';
        } else if (cfuPerML < limits.marginal) {
            concentration = 'Marginal';
            color = 'text-yellow-600';
            interpretation = 'Borderline – may require investigation.';
        } else if (cfuPerML < limits.high) {
            concentration = 'High';
            color = 'text-orange-600';
            interpretation = 'Elevated count – potential contamination.';
        } else {
            concentration = 'Very High';
            color = 'text-red-600';
            interpretation = 'Exceeds acceptable limits – reject sample.';
        }

        setCfuResult({
            cfuPerML,
            concentration,
            colonies,
            validity,
            color,
            interpretation
        });

        // Prepare bar chart data for sample dilutions
        const dilutions = [1, 10, 100, 1000, 10000];
        const data = dilutions.map(d => ({
            dilution: `10⁻${Math.log10(d)}`,
            cfu: (colonies * d) / volume,
        }));
        setChartData(data);
    };

    useEffect(() => {
        if (colonyCount) calculateCFU();
    }, [dilutionFactor, colonyCount, volumePlated, sampleType]);

    const reset = () => {
        setDilutionFactor('100');
        setColonyCount('');
        setVolumePlated('0.1');
        setSampleType('water');
        setCfuResult(null);
        setChartData([]);
    };

    const sampleScenarios = [
        { name: 'Water Testing', dilution: '100', colonies: '45', volume: '0.1', type: 'water' },
        { name: 'Urine Culture', dilution: '1000', colonies: '150', volume: '0.01', type: 'urine' },
        { name: 'Food Sample', dilution: '1000', colonies: '250', volume: '0.1', type: 'food' },
        { name: 'Air Monitoring', dilution: '10', colonies: '80', volume: '0.5', type: 'water' },
    ];

    const loadScenario = (idx: number) => {
        const s = sampleScenarios[idx];
        setDilutionFactor(s.dilution);
        setColonyCount(s.colonies);
        setVolumePlated(s.volume);
        setSampleType(s.type);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">CFU Calculator</h1>
                                <p className="text-blue-100 mt-2">Colony Forming Units per mL – CFU/mL = (colonies × dilution) / volume plated </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Microbial Enumeration</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs & Visualization */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Plate Count Parameters
                            </h2>

                            {/* Input Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Dilution Factor
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={dilutionFactor}
                                        onChange={(e) => setDilutionFactor(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500"
                                        placeholder="e.g., 100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">10⁻² = 100, 10⁻³ = 1000</p>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Colony Count
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={colonyCount}
                                        onChange={(e) => setColonyCount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500"
                                        placeholder="e.g., 150"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Counted colonies (30–300 optimal)</p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Volume Plated (mL)
                                    </label>
                                    <select
                                        value={volumePlated}
                                        onChange={(e) => setVolumePlated(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500"
                                    >
                                        <option value="0.1">0.1 mL</option>
                                        <option value="0.2">0.2 mL</option>
                                        <option value="0.5">0.5 mL</option>
                                        <option value="1.0">1.0 mL</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sample Type Selection */}
                            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Sample Type (for interpretation)
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setSampleType('water')}
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                            sampleType === 'water' 
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Water
                                    </button>
                                    <button
                                        onClick={() => setSampleType('food')}
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                            sampleType === 'food' 
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Food
                                    </button>
                                    <button
                                        onClick={() => setSampleType('urine')}
                                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                            sampleType === 'urine' 
                                                ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Urine
                                    </button>
                                </div>
                            </div>

                            {/* Visual Petri Dish */}
                            <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                                <h3 className="font-bold text-gray-800 mb-4 text-center">Plate Visualization</h3>
                                <div className="relative flex items-center justify-center">
                                    <div className="relative w-80 h-80">
                                        {/* Petri dish */}
                                        <div className="absolute inset-0 rounded-full border-8 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>
                                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                        {/* Colonies */}
                                        {colonyCount && parseFloat(colonyCount) > 0 ? (
                                            Array.from({ length: Math.min(parseFloat(colonyCount), 200) }).map((_, i) => {
                                                const size = Math.random() * 12 + 4;
                                                const x = Math.random() * 80 + 10;
                                                const y = Math.random() * 80 + 10;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute rounded-full bg-gradient-to-br from-gray-800 to-gray-600 shadow-md"
                                                        style={{
                                                            width: `${size}px`,
                                                            height: `${size}px`,
                                                            left: `${x}%`,
                                                            top: `${y}%`,
                                                        }}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                Enter colony count
                                            </div>
                                        )}

                                        {/* Count display */}
                                        {colonyCount && parseFloat(colonyCount) > 0 && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white">
                                                    <span className="text-lg font-bold text-gray-800">{colonyCount}</span>
                                                    <span className="text-xs text-gray-600 ml-1">colonies</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Validity indicator */}
                                {colonyCount && (
                                    <div className="mt-4 text-center">
                                        {parseFloat(colonyCount) < 30 ? (
                                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                <Info className="w-4 h-4 mr-2" />
                                                Too few colonies (&gt;30) – increase sample volume
                                            </div>
                                        ) : parseFloat(colonyCount) > 300 ? (
                                            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm">
                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                Too many colonies (&gt;300) – increase dilution
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                                                <Activity className="w-4 h-4 mr-2" />
                                                Valid count (30–300) 
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Dilution Series Chart */}
                            {chartData.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">CFU at Different Dilutions</h3>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="dilution" />
                                                <YAxis scale="log" domain={['auto', 'auto']} />
                                                <Tooltip />
                                                <Bar dataKey="cfu" fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Expected CFU/mL if same sample were plated at different dilutions.</p>
                                </div>
                            )}

                            {/* Example Scenarios */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Scenarios</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleScenarios.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => loadScenario(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100"
                                        >
                                            <div className="font-semibold">{s.name}</div>
                                            <div>{s.colonies} colonies @ {s.dilution}×</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button
                                    onClick={calculateCFU}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg"
                                >
                                    Calculate CFU/mL
                                </button>
                                <button
                                    onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About CFU Enumeration
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">CFU (Colony Forming Unit):</span> A measure of viable bacterial or fungal cells capable of forming a colony on an agar plate. </p>
                                    <p><span className="font-semibold">Formula:</span> CFU/mL = (number of colonies × dilution factor) / volume plated (mL) </p>
                                    <p><span className="font-semibold">Countable range:</span> 30–300 colonies per plate for statistical validity . Plates with {"<"}30 colonies yield unreliable counts; {"">""}300 colonies may lead to overcrowding and inaccurate counting .</p>
                                    <p><span className="font-semibold">Dilution factor:</span> The reciprocal of the dilution used. For a 10⁻³ dilution, dilution factor = 1000. </p>
                                    <p><span className="font-semibold">Applications:</span> Water quality testing (coliforms), food microbiology, urine culture, environmental monitoring, pharmaceutical sterility testing .</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Results & Reference */}
                    <div className="space-y-6">
                        {/* Result Card */}
                        {cfuResult && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <Beaker className="w-7 h-7 mr-3" />
                                    CFU/mL
                                </h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                                    <div className="text-5xl font-bold mb-2">
                                        {cfuResult.cfuPerML.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className={`text-xl font-bold ${cfuResult.color}`}>
                                        {cfuResult.concentration}
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm mb-2">{cfuResult.interpretation}</p>
                                    <p className="text-xs mt-2">{cfuResult.validity}</p>
                                </div>
                            </div>
                        )}

                        {/* Sample Type Limits Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Typical Limits by Sample Type
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-2 px-3 text-left">Sample</th>
                                            <th className="py-2 px-3 text-left">Acceptable</th>
                                            <th className="py-2 px-3 text-left">Marginal</th>
                                            <th className="py-2 px-3 text-left">High</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Drinking water</td><td>&lt;100</td><td>100–500</td><td>&gt;500</td></tr>
                                        <tr className="bg-gray-50"><td>Food</td><td>&lt;1,000</td><td>1,000–10,000</td><td>&gt;10,000</td></tr>
                                        <tr><td>Urine (midstream)</td><td>&lt;10,000</td><td>10,000–100,000</td><td>&gt;100,000</td></tr>
                                        <tr className="bg-gray-50"><td>Environmental air</td><td>&lt;500</td><td>500–2,000</td><td>&gt;2,000</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Limits vary by regulatory standard (USP, EPA, ISO). </p>
                        </div>

                        {/* Formula Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Formula </h3>
                            <p className="text-sm font-mono">CFU/mL = (colonies × dilution factor) / volume plated</p>
                            <p className="text-xs text-gray-600 mt-2">Example: (150 × 100) / 0.1 = 150,000 CFU/mL</p>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                QC Guidelines 
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>• Count plates with 30–300 colonies</li>
                                <li>• Average duplicate plates if within 20%</li>
                                <li>• Report as CFU/mL (or CFU/g for solid samples)</li>
                                <li>• Use appropriate significant figures (e.g., 1.5 × 10⁵)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}