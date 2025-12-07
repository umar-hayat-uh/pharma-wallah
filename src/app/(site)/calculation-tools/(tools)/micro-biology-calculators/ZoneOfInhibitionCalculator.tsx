"use client";
import { useState } from 'react';
import { Ruler, Info, RefreshCw, Eye, Circle } from 'lucide-react';

export default function ZoneOfInhibitionCalculator() {
    const [zoneDiameter, setZoneDiameter] = useState<string>('');
    const [antibioticName, setAntibioticName] = useState<string>('');
    const [bacteriaType, setBacteriaType] = useState<string>('');
    const [zoneResult, setZoneResult] = useState<{
        interpretation: string;
        susceptibility: string;
        category: string;
        mm: number;
        recommendation: string;
    } | null>(null);

    const calculateZone = () => {
        const diameter = parseFloat(zoneDiameter);

        if (isNaN(diameter) || diameter <= 0) {
            alert('Please enter a valid positive number for zone diameter');
            return;
        }

        let interpretation = '';
        let susceptibility = '';
        let category = '';
        let recommendation = '';

        if (diameter >= 20) {
            susceptibility = 'SUSCEPTIBLE';
            category = 'High Sensitivity';
            interpretation = 'Organism shows excellent response to antibiotic';
            recommendation = 'First-line treatment option recommended';
        } else if (diameter >= 15 && diameter < 20) {
            susceptibility = 'INTERMEDIATE';
            category = 'Moderate Sensitivity';
            interpretation = 'Organism shows intermediate response';
            recommendation = 'Consider higher dose or combination therapy';
        } else {
            susceptibility = 'RESISTANT';
            category = 'Resistant';
            interpretation = 'Organism shows resistance to this antibiotic';
            recommendation = 'Choose alternative antibiotic therapy';
        }

        setZoneResult({
            interpretation,
            susceptibility,
            category,
            mm: diameter,
            recommendation
        });
    };

    const resetCalculator = () => {
        setZoneDiameter('');
        setAntibioticName('');
        setBacteriaType('');
        setZoneResult(null);
    };

    const sampleMeasurements = [
        { name: 'Penicillin vs S. aureus', diameter: '32', status: 'Susceptible' },
        { name: 'Gentamicin vs E. coli', diameter: '18', status: 'Intermediate' },
        { name: 'Vancomycin vs MRSA', diameter: '15', status: 'Resistant' },
        { name: 'Ciprofloxacin vs P. aeruginosa', diameter: '25', status: 'Susceptible' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Ruler className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Zone of Inhibition Measurement Tool</h2>
                    <p className="text-gray-600">Measure antibiotic susceptibility using disk diffusion method</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-green-50 rounded-xl p-6">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                            Zone Diameter (mm)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={zoneDiameter}
                            onChange={(e) => setZoneDiameter(e.target.value)}
                            className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                            placeholder="e.g., 25.5"
                        />
                        <p className="text-sm text-gray-600 mt-2">Measure the clear zone diameter in millimeters</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Antibiotic Name
                            </label>
                            <input
                                type="text"
                                value={antibioticName}
                                onChange={(e) => setAntibioticName(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., Amoxicillin"
                            />
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Bacteria Type
                            </label>
                            <input
                                type="text"
                                value={bacteriaType}
                                onChange={(e) => setBacteriaType(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., S. aureus"
                            />
                        </div>
                    </div>

                    {/* Visual Petri Dish */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Zone of Inhibition Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-80 h-80">
                                {/* Petri dish outer circle */}
                                <div className="absolute inset-0 rounded-full border-8 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>

                                {/* Agar */}
                                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                {/* Bacteria lawn */}
                                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 opacity-90">
                                    {/* Bacteria dots */}
                                    {Array.from({ length: 200 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute rounded-full bg-red-700 opacity-20"
                                            style={{
                                                width: `${Math.random() * 4 + 1}px`,
                                                height: `${Math.random() * 4 + 1}px`,
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Zone of inhibition */}
                                {zoneDiameter ? (
                                    <div
                                        className="absolute rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 shadow-lg"
                                        style={{
                                            width: `${Math.min(parseFloat(zoneDiameter) * 3, 250)}px`,
                                            height: `${Math.min(parseFloat(zoneDiameter) * 3, 250)}px`,
                                            left: '50%',
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        {/* Clear zone pattern */}
                                        <div className="absolute inset-0 rounded-full">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                                                    style={{
                                                        transform: `rotate(${i * 22.5}deg)`,
                                                        top: '50%',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 shadow-lg flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">Enter diameter to see zone</span>
                                    </div>
                                )}

                                {/* Antibiotic disk */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-lg flex items-center justify-center border-4 border-gray-600">
                                    <span className="text-white text-xs font-bold">AB</span>
                                </div>

                                {/* Measurement lines */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 opacity-30"></div>
                                <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-400 opacity-30"></div>

                                {/* Diameter label */}
                                {zoneDiameter && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2">
                                        <div className="relative">
                                            <div className="absolute -left-8 -right-8 h-1 bg-green-400 opacity-50"></div>
                                            <div className="absolute left-1/2 -top-8 transform -translate-x-1/2 text-xs font-bold text-green-600">
                                                {zoneDiameter} mm
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateZone}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Analyze Zone
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
                    {zoneResult && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <div className="text-sm font-semibold text-gray-600">Zone Diameter</div>
                                    <div className="text-3xl font-bold text-green-400 mt-1">{zoneResult.mm} mm</div>
                                </div>
                                <div className={`rounded-xl p-4 shadow-sm ${zoneResult.susceptibility === 'SUSCEPTIBLE' ? 'bg-green-100' :
                                        zoneResult.susceptibility === 'INTERMEDIATE' ? 'bg-yellow-100' : 'bg-red-100'
                                    }`}>
                                    <div className="text-sm font-semibold text-gray-600">Interpretation</div>
                                    <div className={`text-xl font-bold mt-1 ${zoneResult.susceptibility === 'SUSCEPTIBLE' ? 'text-green-600' :
                                            zoneResult.susceptibility === 'INTERMEDIATE' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {zoneResult.susceptibility}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Clinical Significance</div>
                                    <p className="text-gray-600 text-sm">{zoneResult.interpretation}</p>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="font-semibold text-yellow-800 mb-1">Recommendation</div>
                                    <p className="text-yellow-700 text-sm">{zoneResult.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reference Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Info className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Antibiotic Susceptibility Reference Table (CLSI Standards)</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Antibiotic</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">S (mm)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">I (mm)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">R (mm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">Ampicillin</td>
                                        <td className="py-3 px-4">≥17</td>
                                        <td className="py-3 px-4">14-16</td>
                                        <td className="py-3 px-4">≤13</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <td className="py-3 px-4 font-medium">Cefotaxime</td>
                                        <td className="py-3 px-4">≥26</td>
                                        <td className="py-3 px-4">23-25</td>
                                        <td className="py-3 px-4">≤22</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">Ciprofloxacin</td>
                                        <td className="py-3 px-4">≥21</td>
                                        <td className="py-3 px-4">16-20</td>
                                        <td className="py-3 px-4">≤15</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <td className="py-3 px-4 font-medium">Gentamicin</td>
                                        <td className="py-3 px-4">≥15</td>
                                        <td className="py-3 px-4">13-14</td>
                                        <td className="py-3 px-4">≤12</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Tetracycline</td>
                                        <td className="py-3 px-4">≥19</td>
                                        <td className="py-3 px-4">15-18</td>
                                        <td className="py-3 px-4">≤14</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center text-xs text-gray-500">
                            <Circle className="w-3 h-3 mr-1 fill-green-400 text-green-400" />
                            <span className="mr-3">S = Susceptible</span>
                            <Circle className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            <span className="mr-3">I = Intermediate</span>
                            <Circle className="w-3 h-3 mr-1 fill-red-400 text-red-400" />
                            <span>R = Resistant</span>
                        </div>
                    </div>

                    {/* Sample Measurements */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Example Measurements</h3>
                        <div className="space-y-3">
                            {sampleMeasurements.map((sample, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                    <div>
                                        <div className="font-medium text-gray-800">{sample.name}</div>
                                        <div className="text-sm text-gray-600">{sample.diameter} mm zone</div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${sample.status === 'Susceptible' ? 'bg-green-100 text-green-800' :
                                            sample.status === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {sample.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}