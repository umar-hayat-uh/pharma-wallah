"use client";
import { useState } from 'react';
import { Calculator, Microscope, Droplet, Clock, Ruler, Beaker, AlertCircle, RefreshCw, Eye, Filter, Activity } from 'lucide-react';

export default function MicrobiologyCalculators() {
    // Zone of Inhibition State
    const [zoneDiameter, setZoneDiameter] = useState<string>('');
    const [antibioticName, setAntibioticName] = useState<string>('');
    const [bacteriaType, setBacteriaType] = useState<string>('');
    const [zoneResult, setZoneResult] = useState<{
        interpretation: string;
        susceptibility: string;
        category: string;
        mm: number;
    } | null>(null);

    // CFU Calculator State
    const [dilutionFactor, setDilutionFactor] = useState<string>('');
    const [colonyCount, setColonyCount] = useState<string>('');
    const [volumePlated, setVolumePlated] = useState<string>('0.1');
    const [cfuResult, setCfuResult] = useState<{
        cfuPerML: number;
        concentration: string;
        colonies: number;
    } | null>(null);

    // Sterilization Time Calculator State
    const [temperature, setTemperature] = useState<string>('121');
    const [time, setTime] = useState<string>('');
    const [zValue, setZValue] = useState<string>('10');
    const [referenceTemp, setReferenceTemp] = useState<string>('121');
    const [sterilizationResult, setSterilizationResult] = useState<{
        f0Value: number;
        lethality: string;
        sterilizationLevel: string;
    } | null>(null);

    // Zone of Inhibition Calculation
    const calculateZone = () => {
        const diameter = parseFloat(zoneDiameter);

        if (isNaN(diameter) || diameter <= 0) {
            alert('Please enter a valid positive number for zone diameter');
            return;
        }

        let interpretation = '';
        let susceptibility = '';
        let category = '';

        // Standard interpretation for common antibiotics
        if (diameter >= 20) {
            susceptibility = 'SUSCEPTIBLE';
            category = 'High Sensitivity';
            interpretation = 'Organism is highly susceptible to this antibiotic';
        } else if (diameter >= 15 && diameter < 20) {
            susceptibility = 'INTERMEDIATE';
            category = 'Moderate Sensitivity';
            interpretation = 'Organism shows intermediate sensitivity';
        } else {
            susceptibility = 'RESISTANT';
            category = 'Resistant';
            interpretation = 'Organism is resistant to this antibiotic';
        }

        setZoneResult({
            interpretation,
            susceptibility,
            category,
            mm: diameter
        });
    };

    // CFU Calculation
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
        if (cfuPerML < 1000) {
            concentration = 'Low';
        } else if (cfuPerML >= 1000 && cfuPerML < 10000) {
            concentration = 'Moderate';
        } else {
            concentration = 'High';
        }

        setCfuResult({
            cfuPerML,
            concentration,
            colonies
        });
    };

    // Sterilization Time Calculation
    const calculateSterilization = () => {
        const T = parseFloat(temperature);
        const t = parseFloat(time);
        const Z = parseFloat(zValue);
        const Tref = parseFloat(referenceTemp);

        if (isNaN(T) || isNaN(t) || isNaN(Z) || isNaN(Tref) || t <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // F0 = t * 10^((T - Tref)/Z)
        const exponent = (T - Tref) / Z;
        const f0Value = t * Math.pow(10, exponent);

        let lethality = '';
        let sterilizationLevel = '';

        if (f0Value >= 12) {
            lethality = 'COMPLETE';
            sterilizationLevel = 'Commercial Sterility';
        } else if (f0Value >= 6) {
            lethality = 'HIGH';
            sterilizationLevel = 'Medical Sterility';
        } else {
            lethality = 'PARTIAL';
            sterilizationLevel = 'Pasteurization Level';
        }

        setSterilizationResult({
            f0Value,
            lethality,
            sterilizationLevel
        });
    };

    // Reset all calculators
    const resetAll = () => {
        setZoneDiameter('');
        setZoneResult(null);
        setDilutionFactor('');
        setColonyCount('');
        setCfuResult(null);
        setTemperature('121');
        setTime('');
        setSterilizationResult(null);
    };

    // Sample antibiotic data
    const sampleAntibiotics = [
        { name: 'Penicillin', sensitive: '≥29 mm', resistant: '≤28 mm' },
        { name: 'Tetracycline', sensitive: '≥19 mm', resistant: '≤14 mm' },
        { name: 'Ciprofloxacin', sensitive: '≥21 mm', resistant: '≤15 mm' },
        { name: 'Gentamicin', sensitive: '≥15 mm', resistant: '≤12 mm' },
        { name: 'Vancomycin', sensitive: '≥17 mm', resistant: '≤14 mm' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Microscope className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Microbiology Laboratory Calculators</h1>
                            <p className="text-gray-600 text-lg mt-2">Essential tools for microbiological analysis and quality control</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Zone of Inhibition Calculator */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center mb-6">
                            <Ruler className="w-8 h-8 text-green-400 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Zone of Inhibition Measurement</h2>
                        </div>

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

                            <div className="bg-blue-50 rounded-xl p-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Antibiotic Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={antibioticName}
                                    onChange={(e) => setAntibioticName(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    placeholder="e.g., Amoxicillin"
                                />
                            </div>

                            {/* Visual Petri Dish */}
                            <div className="relative bg-gray-100 rounded-2xl p-6 flex flex-col items-center">
                                <div className="relative w-64 h-64">
                                    {/* Petri dish outer circle */}
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>

                                    {/* Agar */}
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                    {/* Bacteria lawn */}
                                    <div className="absolute inset-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 opacity-80"></div>

                                    {/* Zone of inhibition */}
                                    {zoneDiameter && (
                                        <div
                                            className="absolute rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-300 shadow-lg"
                                            style={{
                                                width: `${Math.min(parseFloat(zoneDiameter) * 4, 200)}px`,
                                                height: `${Math.min(parseFloat(zoneDiameter) * 4, 200)}px`,
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-bold text-blue-600 bg-white bg-opacity-80 px-2 py-1 rounded">
                                                    {zoneDiameter} mm
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Antibiotic disk */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">AB</span>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">Visual representation of zone of inhibition</p>
                                </div>
                            </div>

                            <button
                                onClick={calculateZone}
                                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Analyze Zone
                            </button>

                            {zoneResult && (
                                <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Results</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-sm font-semibold text-gray-600">Diameter</div>
                                            <div className="text-2xl font-bold text-green-400">{zoneResult.mm} mm</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm ${zoneResult.susceptibility === 'SUSCEPTIBLE' ? 'bg-green-100' :
                                                zoneResult.susceptibility === 'INTERMEDIATE' ? 'bg-yellow-100' : 'bg-red-100'
                                            }`}>
                                            <div className="text-sm font-semibold text-gray-600">Susceptibility</div>
                                            <div className={`text-xl font-bold ${zoneResult.susceptibility === 'SUSCEPTIBLE' ? 'text-green-600' :
                                                    zoneResult.susceptibility === 'INTERMEDIATE' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {zoneResult.susceptibility}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-white rounded-lg p-4">
                                        <p className="text-gray-700">{zoneResult.interpretation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CFU Calculator */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center mb-6">
                            <Beaker className="w-8 h-8 text-green-400 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Colony Forming Unit Calculator</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-green-50 rounded-xl p-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Dilution Factor
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={dilutionFactor}
                                    onChange={(e) => setDilutionFactor(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                    placeholder="e.g., 1000"
                                />
                                <p className="text-sm text-gray-600 mt-2">e.g., 10⁻³ dilution = 1000</p>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Colony Count
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={colonyCount}
                                    onChange={(e) => setColonyCount(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    placeholder="e.g., 150"
                                />
                                <p className="text-sm text-gray-600 mt-2">Number of colonies counted</p>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Volume Plated (mL)
                                </label>
                                <select
                                    value={volumePlated}
                                    onChange={(e) => setVolumePlated(e.target.value)}
                                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                >
                                    <option value="0.1">0.1 mL</option>
                                    <option value="0.2">0.2 mL</option>
                                    <option value="0.5">0.5 mL</option>
                                    <option value="1">1.0 mL</option>
                                </select>
                            </div>

                            {/* Visual Colony Plate */}
                            <div className="relative bg-gray-100 rounded-2xl p-6 flex flex-col items-center">
                                <div className="relative w-64 h-64">
                                    {/* Petri dish */}
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 shadow-inner"></div>
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"></div>

                                    {/* Random colonies */}
                                    {colonyCount && Array.from({ length: Math.min(parseInt(colonyCount), 50) }).map((_, i) => {
                                        const size = Math.random() * 20 + 10;
                                        const x = Math.random() * 200 + 20;
                                        const y = Math.random() * 200 + 20;
                                        return (
                                            <div
                                                key={i}
                                                className="absolute rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-md"
                                                style={{
                                                    width: `${size}px`,
                                                    height: `${size}px`,
                                                    left: `${x}px`,
                                                    top: `${y}px`,
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Grid overlay */}
                                    <div className="absolute inset-4 opacity-20">
                                        <div className="h-full border-l border-gray-400 absolute left-1/3"></div>
                                        <div className="h-full border-l border-gray-400 absolute left-2/3"></div>
                                        <div className="w-full border-t border-gray-400 absolute top-1/3"></div>
                                        <div className="w-full border-t border-gray-400 absolute top-2/3"></div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600">Visual representation of bacterial colonies</p>
                                    {colonyCount && <p className="text-sm font-semibold text-gray-700">Counted: {colonyCount} colonies</p>}
                                </div>
                            </div>

                            <button
                                onClick={calculateCFU}
                                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate CFU/mL
                            </button>

                            {cfuResult && (
                                <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-400 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">CFU Results</h3>
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">CFU per mL</div>
                                        <div className="text-3xl font-bold text-green-400">
                                            {cfuResult.cfuPerML.toLocaleString('en-US', {
                                                maximumFractionDigits: 0
                                            })}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            Concentration: {cfuResult.concentration}
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-white rounded-lg p-4">
                                        <p className="text-gray-700">
                                            {cfuResult.colonies} colonies × {dilutionFactor} dilution factor ÷ {volumePlated} mL = {cfuResult.cfuPerML.toLocaleString()} CFU/mL
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sterilization Time Calculator */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center mb-6">
                            <Clock className="w-8 h-8 text-green-400 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-800">Sterilization Time (F₀ Value)</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Temperature (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                    />
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                        placeholder="e.g., 15"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Z-value (°C)
                                    </label>
                                    <select
                                        value={zValue}
                                        onChange={(e) => setZValue(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                    >
                                        <option value="10">10°C (B. stearothermophilus)</option>
                                        <option value="12">12°C (C. botulinum)</option>
                                        <option value="8">8°C (Thermophiles)</option>
                                    </select>
                                </div>

                                <div className="bg-amber-50 rounded-xl p-4">
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Reference Temp (°C)
                                    </label>
                                    <select
                                        value={referenceTemp}
                                        onChange={(e) => setReferenceTemp(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-400 focus:outline-none"
                                    >
                                        <option value="121">121°C (Standard)</option>
                                        <option value="115">115°C (Low Temp)</option>
                                        <option value="134">134°C (Flash)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sterilization Process Visualization */}
                            <div className="bg-gray-100 rounded-2xl p-6">
                                <h4 className="font-semibold text-gray-800 mb-4 text-center">Sterilization Process</h4>
                                <div className="relative h-32">
                                    {/* Temperature line */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300"></div>

                                    {/* Reference temperature marker */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2">
                                        <div className="w-2 h-16 bg-green-400 mx-auto"></div>
                                        <div className="text-xs mt-1 text-center">121°C Ref</div>
                                    </div>

                                    {/* Current temperature */}
                                    {temperature && (
                                        <div
                                            className="absolute top-1/2 transform -translate-y-1/2"
                                            style={{
                                                left: `${(parseFloat(temperature) - 100) * 2}%`,
                                            }}
                                        >
                                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                            <div className="text-xs mt-1 text-center whitespace-nowrap">
                                                {temperature}°C
                                            </div>
                                        </div>
                                    )}

                                    {/* Labels */}
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs">100°C</div>
                                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs">140°C</div>
                                </div>
                            </div>

                            <button
                                onClick={calculateSterilization}
                                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Calculate F₀ Value
                            </button>

                            {sterilizationResult && (
                                <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Sterilization Results</h3>
                                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                                        <div className="text-sm font-semibold text-gray-600 mb-2">F₀ Value</div>
                                        <div className="text-3xl font-bold text-green-400">
                                            {sterilizationResult.f0Value.toFixed(2)}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700 mt-2">
                                            Lethality: {sterilizationResult.lethality}
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-white rounded-lg p-4">
                                        <p className="text-gray-700">
                                            F₀ = {time} × 10^(({temperature} - {referenceTemp})/{zValue}) = {sterilizationResult.f0Value.toFixed(2)} minutes
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Level: {sterilizationResult.sterilizationLevel}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls and Info */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center mb-6">
                            <AlertCircle className="w-8 h-8 text-green-400 mr-3" />
                            <h3 className="text-xl font-bold text-gray-800">Quick Reference Guide</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">Zone of Inhibition Standards</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>≥20 mm</span>
                                        <span className="font-semibold text-green-600">Susceptible</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>15-19 mm</span>
                                        <span className="font-semibold text-yellow-600">Intermediate</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>≤14 mm</span>
                                        <span className="font-semibold text-red-600">Resistant</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-800 mb-2">Common Z-values</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>B. stearothermophilus</span>
                                        <span className="font-semibold">10°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>C. botulinum</span>
                                        <span className="font-semibold">12°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Thermophiles</span>
                                        <span className="font-semibold">8°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center mb-6">
                            <RefreshCw className="w-8 h-8 text-green-400 mr-3" />
                            <h3 className="text-xl font-bold text-gray-800">Controls</h3>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={resetAll}
                                className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-semibold py-4 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                            >
                                Reset All Calculators
                            </button>

                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Zone measurements should be taken from the back of the plate</li>
                                    <li>• CFU counts are valid between 30-300 colonies</li>
                                    <li>• F₀ value assumes ideal thermal conduction</li>
                                    <li>• Always validate with laboratory standards</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sample Antibiotics Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Antibiotic Susceptibility Standards</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Antibiotic</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Susceptible (mm)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Intermediate (mm)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Resistant (mm)</th>
                                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Organism</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sampleAntibiotics.map((ab, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="py-3 px-4 font-medium text-gray-800">{ab.name}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                                {ab.sensitive}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                                15-18 mm
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                                {ab.resistant}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">S. aureus</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}