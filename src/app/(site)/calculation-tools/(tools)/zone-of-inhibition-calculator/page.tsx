"use client";
import { useState } from 'react';
import { Ruler, Info, RefreshCw, Eye, Circle, Shield, AlertTriangle, Beaker } from 'lucide-react';

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
            interpretation = 'Organism shows excellent response to antibiotic (zone ≥20 mm)';
            recommendation = 'First-line treatment option recommended';
        } else if (diameter >= 15 && diameter < 20) {
            susceptibility = 'INTERMEDIATE';
            category = 'Moderate Sensitivity';
            interpretation = 'Organism shows intermediate response (15‑19 mm)';
            recommendation = 'Consider higher dose or combination therapy';
        } else {
            susceptibility = 'RESISTANT';
            category = 'Resistant';
            interpretation = 'Organism shows resistance to this antibiotic (<15 mm)';
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Ruler className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Zone of Inhibition Calculator</h1>
                                <p className="text-blue-100 mt-2">Kirby‑Bauer disk diffusion susceptibility test </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">CLSI Standards</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                                Zone Measurement
                            </h2>

                            {/* Visual Petri Dish */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                                <h3 className="font-bold text-gray-800 mb-4 text-center">Petri Dish Visualization</h3>
                                <div className="relative flex items-center justify-center">
                                    <div className="relative w-80 h-80">
                                        {/* Petri dish outer circle */}
                                        <div className="absolute inset-0 rounded-full border-8 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>

                                        {/* Agar */}
                                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                        {/* Bacteria lawn */}
                                        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 opacity-90">
                                            {Array.from({ length: 200 }).map((_, i) => (
                                                <div key={i} className="absolute rounded-full bg-red-700 opacity-20"
                                                    style={{
                                                        width: `${Math.random() * 4 + 1}px`,
                                                        height: `${Math.random() * 4 + 1}px`,
                                                        left: `${Math.random() * 100}%`,
                                                        top: `${Math.random() * 100}%`,
                                                    }} />
                                            ))}
                                        </div>

                                        {/* Zone of inhibition */}
                                        {zoneDiameter && (
                                            <div className="absolute rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-300 shadow-lg"
                                                style={{
                                                    width: `${Math.min(parseFloat(zoneDiameter) * 3, 250)}px`,
                                                    height: `${Math.min(parseFloat(zoneDiameter) * 3, 250)}px`,
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                }}>
                                                <div className="absolute inset-0 rounded-full">
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <div key={i} className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent"
                                                            style={{ transform: `rotate(${i * 22.5}deg)`, top: '50%' }} />
                                                    ))}
                                                </div>
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

                            {/* Input Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Zone Diameter (mm)
                                    </label>
                                    <input type="number" step="0.1" min="0.1" value={zoneDiameter}
                                        onChange={(e) => setZoneDiameter(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" 
                                        placeholder="e.g., 25.5" />
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Antibiotic Name (optional)
                                    </label>
                                    <input type="text" value={antibioticName} onChange={(e) => setAntibioticName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" 
                                        placeholder="e.g., Amoxicillin" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bacteria Type (optional)
                                    </label>
                                    <input type="text" value={bacteriaType} onChange={(e) => setBacteriaType(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" 
                                        placeholder="e.g., S. aureus" />
                                </div>
                            </div>

                            {/* Sample Measurements */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Measurements</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleMeasurements.map((sample, idx) => (
                                        <button key={idx} onClick={() => setZoneDiameter(sample.diameter)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{sample.name}</div>
                                            <div>{sample.diameter} mm · {sample.status}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={calculateZone}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Analyze Zone
                                </button>
                                <button onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results & Info */}
                    <div className="space-y-6">
                        {zoneResult && (
                            <div className={`rounded-2xl shadow-xl p-6 text-white ${
                                zoneResult.susceptibility === 'SUSCEPTIBLE' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                                zoneResult.susceptibility === 'INTERMEDIATE' ? 'bg-gradient-to-br from-yellow-600 to-yellow-400' :
                                'bg-gradient-to-br from-red-600 to-red-400'
                            }`}>
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <Ruler className="w-7 h-7 mr-3" />
                                    Result
                                </h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{zoneResult.susceptibility}</div>
                                    <div className="text-lg">{zoneResult.category}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{zoneResult.interpretation}</p>
                                    <p className="text-sm mt-2"><strong>Recommendation:</strong> {zoneResult.recommendation}</p>
                                </div>
                            </div>
                        )}

                        {/* CLSI Reference Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-blue-600" />
                                CLSI Zone Diameter Breakpoints (mm)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-2 px-3 text-left">Antibiotic</th>
                                            <th className="py-2 px-3 text-left">S (≥)</th>
                                            <th className="py-2 px-3 text-left">I</th>
                                            <th className="py-2 px-3 text-left">R (≤)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Ampicillin</td><td>17</td><td>14‑16</td><td>13</td></tr>
                                        <tr className="bg-gray-50"><td>Cefotaxime</td><td>26</td><td>23‑25</td><td>22</td></tr>
                                        <tr><td>Ciprofloxacin</td><td>21</td><td>16‑20</td><td>15</td></tr>
                                        <tr className="bg-gray-50"><td>Gentamicin</td><td>15</td><td>13‑14</td><td>12</td></tr>
                                        <tr><td>Tetracycline</td><td>19</td><td>15‑18</td><td>14</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Source: CLSI M100, 2023</p>
                        </div>

                        {/* Interpretation Guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Interpretation</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center"><Circle className="w-3 h-3 fill-green-400 text-green-400 mr-2" /> Susceptible: Effective therapy</div>
                                <div className="flex items-center"><Circle className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-2" /> Intermediate: Possible with higher dose</div>
                                <div className="flex items-center"><Circle className="w-3 h-3 fill-red-400 text-red-400 mr-2" /> Resistant: Not effective</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}