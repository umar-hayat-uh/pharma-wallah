"use client";
import { useState } from 'react';
import { Calculator, BarChart3, AlertCircle, Layers, TrendingUp, Scale, FlaskConical, Activity } from 'lucide-react';

export default function CompressibilityIndexCalculator() {
    const [initialVolume, setInitialVolume] = useState<string>('');
    const [finalVolume, setFinalVolume] = useState<string>('');
    const [mass, setMass] = useState<string>('');
    const [result, setResult] = useState<{
        compressibilityIndex: number;
        bulkDensity: number;
        tappedDensity: number;
        hausnerRatio: number;
        interpretation: string;
        flowCharacter: string;
        recommendation: string;
    } | null>(null);

    const calculateCompressibility = () => {
        const V0 = parseFloat(initialVolume);
        const Vf = parseFloat(finalVolume);
        const m = parseFloat(mass);

        if (isNaN(V0) || isNaN(Vf) || isNaN(m) || V0 <= 0 || Vf <= 0 || m <= 0) {
            alert('Please enter valid positive numbers for all fields');
            return;
        }

        if (Vf >= V0) {
            alert('Final volume must be less than initial volume after tapping');
            return;
        }

        // Calculate densities
        const bulkDensity = m / V0;
        const tappedDensity = m / Vf;

        // Calculate compressibility index (Carr's index)
        const compressibilityIndex = ((V0 - Vf) / V0) * 100;

        // Calculate Hausner ratio
        const hausnerRatio = V0 / Vf;

        // Interpretation and recommendations (USP/Ph. Eur. standards)
        let interpretation = '';
        let flowCharacter = '';
        let recommendation = '';

        if (compressibilityIndex < 10) {
            interpretation = 'Excellent flow';
            flowCharacter = 'Free-flowing';
            recommendation = 'Suitable for direct compression. No glidant needed.';
        } else if (compressibilityIndex >= 10 && compressibilityIndex < 15) {
            interpretation = 'Good flow';
            flowCharacter = 'Free-flowing to cohesive';
            recommendation = 'May require minimal glidant for consistent flow.';
        } else if (compressibilityIndex >= 15 && compressibilityIndex < 20) {
            interpretation = 'Fair flow';
            flowCharacter = 'Cohesive';
            recommendation = 'Glidant recommended. Consider granulation if problematic.';
        } else if (compressibilityIndex >= 20 && compressibilityIndex < 25) {
            interpretation = 'Passable flow';
            flowCharacter = 'Cohesive';
            recommendation = 'Needs glidant. Granulation advised for high-speed tableting.';
        } else if (compressibilityIndex >= 25 && compressibilityIndex < 31) {
            interpretation = 'Poor flow';
            flowCharacter = 'Very cohesive';
            recommendation = 'Granulation necessary. Glidant may not suffice.';
        } else {
            interpretation = 'Very poor flow';
            flowCharacter = 'Extremely cohesive';
            recommendation = 'Not suitable for direct compression. Wet granulation required.';
        }

        setResult({
            compressibilityIndex,
            bulkDensity,
            tappedDensity,
            hausnerRatio,
            interpretation,
            flowCharacter,
            recommendation
        });
    };

    const resetCalculator = () => {
        setInitialVolume('');
        setFinalVolume('');
        setMass('');
        setResult(null);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Compressibility Index Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate powder flow properties using Carr's Index and Hausner Ratio</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">USP/Ph. Eur. Standards</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Layers className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
                                Powder Properties
                            </h2>

                            {/* Input Fields */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Scale className="inline w-4 h-4 mr-1" /> Powder Mass (g)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                min="0.001"
                                                value={mass}
                                                onChange={(e) => setMass(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 25.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FlaskConical className="inline w-4 h-4 mr-1" /> Initial Volume (mL)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={initialVolume}
                                                onChange={(e) => setInitialVolume(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 50.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Layers className="inline w-4 h-4 mr-1" /> Tapped Volume (mL)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={finalVolume}
                                                onChange={(e) => setFinalVolume(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="e.g., 40.0"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        *Tapped volume after standard tapping procedure (e.g., 500–1250 taps).
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateCompressibility}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Compressibility
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                                    Flowability Results
                                </h2>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-blue-700 mb-2">Carr's Index</div>
                                        <div className={`text-3xl font-bold ${result.compressibilityIndex < 15 ? 'text-green-600' : result.compressibilityIndex < 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {result.compressibilityIndex.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-blue-600 mt-2">USP Limit: ≤20% (good)</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-green-700 mb-2">Hausner Ratio</div>
                                        <div className={`text-3xl font-bold ${result.hausnerRatio < 1.18 ? 'text-green-600' : result.hausnerRatio < 1.35 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {result.hausnerRatio.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-green-600 mt-2">Target: &lt;1.25</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-purple-700 mb-2">Bulk Density</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {result.bulkDensity.toFixed(3)} g/mL
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-orange-700 mb-2">Tapped Density</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {result.tappedDensity.toFixed(3)} g/mL
                                        </div>
                                    </div>
                                </div>

                                {/* Interpretation */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Flow Character</h3>
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <span className="text-3xl font-bold text-blue-600 block">{result.interpretation}</span>
                                            <span className="text-gray-600">({result.flowCharacter})</span>
                                        </div>
                                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                                            <span className="font-semibold text-gray-700">Recommendation:</span>
                                            <p className="text-sm text-gray-600 max-w-md">{result.recommendation}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Formula & Details */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculation Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p><span className="font-semibold">Carr's Index:</span> CI = (V₀ - Vₜ)/V₀ × 100</p>
                                            <p><span className="font-semibold">Hausner Ratio:</span> HR = V₀ / Vₜ</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p><span className="font-semibold">Bulk Density:</span> ρ_b = m / V₀ = {result.bulkDensity.toFixed(3)} g/mL</p>
                                            <p><span className="font-semibold">Tapped Density:</span> ρ_t = m / Vₜ = {result.tappedDensity.toFixed(3)} g/mL</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Flowability Scale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Carr's Index Scale</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span className="font-semibold">5–15%</span>
                                    <span className="text-sm">Excellent – Good</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                    <span className="font-semibold">16–20%</span>
                                    <span className="text-sm">Fair</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                    <span className="font-semibold">21–25%</span>
                                    <span className="text-sm">Passable</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                                    <span className="font-semibold">26–31%</span>
                                    <span className="text-sm">Poor</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <span className="font-semibold">&gt;31%</span>
                                    <span className="text-sm">Very Poor</span>
                                </div>
                            </div>
                        </div>

                        {/* Hausner Ratio Scale */}
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Hausner Ratio Scale</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-2 bg-white rounded">
                                    <span className="font-semibold">&lt; 1.18</span>
                                    <span className="text-green-600">Excellent</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white rounded">
                                    <span className="font-semibold">1.18 – 1.25</span>
                                    <span className="text-blue-600">Good</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white rounded">
                                    <span className="font-semibold">1.25 – 1.35</span>
                                    <span className="text-yellow-600">Fair</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white rounded">
                                    <span className="font-semibold">1.35 – 1.45</span>
                                    <span className="text-orange-600">Poor</span>
                                </div>
                                <div className="flex justify-between p-2 bg-white rounded">
                                    <span className="font-semibold">&gt; 1.45</span>
                                    <span className="text-red-600">Very Poor</span>
                                </div>
                            </div>
                        </div>

                        {/* Test Procedure */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                                USP Procedure
                            </h3>
                            <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-5">
                                <li>Weigh 25–100g of powder accurately.</li>
                                <li>Pour into graduated cylinder (without compaction).</li>
                                <li>Read initial unsettled volume V₀.</li>
                                <li>Tap cylinder 500 times (USP I) or until volume change &lt;2 mL.</li>
                                <li>Read tapped volume Vₜ.</li>
                                <li>Calculate CI and HR.</li>
                            </ol>
                        </div>

                        {/* Applications */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Tablet compression formulation</li>
                                <li>• Capsule filling optimization</li>
                                <li>• Powder blending assessment</li>
                                <li>• Excipient selection</li>
                                <li>• Process validation (QbD)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Reference Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Flowability Classification Reference</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Carr's Index (%)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Hausner Ratio</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Flow Character</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="py-2 px-4">&lt;10</td><td>1.00–1.11</td><td>Excellent</td><td>Glidants, free-flowing granules</td></tr>
                                <tr className="border-b bg-gray-50"><td>11–15</td><td>1.12–1.18</td><td>Good</td><td>Lactose, MCC</td></tr>
                                <tr className="border-b"><td>16–20</td><td>1.19–1.25</td><td>Fair</td><td>Starch, some APIs</td></tr>
                                <tr className="border-b bg-gray-50"><td>21–25</td><td>1.26–1.34</td><td>Passable</td><td>Fine powders, cohesive blends</td></tr>
                                <tr className="border-b"><td>26–31</td><td>1.35–1.45</td><td>Poor</td><td>Very cohesive, need granulation</td></tr>
                                <tr><td>&gt;31</td><td>&gt;1.45</td><td>Very Poor</td><td>Extremely cohesive, must granulate</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}