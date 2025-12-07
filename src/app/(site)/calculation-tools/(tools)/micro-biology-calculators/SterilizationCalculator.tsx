"use client";
import { useState } from 'react';
import { Clock, Thermometer, Shield, RefreshCw, Info, AlertTriangle } from 'lucide-react';

export default function SterilizationCalculator() {
    const [temperature, setTemperature] = useState<string>('121');
    const [time, setTime] = useState<string>('');
    const [zValue, setZValue] = useState<string>('10');
    const [referenceTemp, setReferenceTemp] = useState<string>('121');
    const [sterilizationResult, setSterilizationResult] = useState<{
        f0Value: number;
        lethality: string;
        sterilizationLevel: string;
        description: string;
        color: string;
        decimalReduction: number;
    } | null>(null);

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
        const decimalReduction = t * Math.pow(10, (T - Tref) / 10);

        let lethality = '';
        let sterilizationLevel = '';
        let description = '';
        let color = '';

        if (f0Value >= 12) {
            lethality = 'COMPLETE';
            sterilizationLevel = 'Commercial Sterility';
            description = '12-log reduction of C. botulinum spores';
            color = 'text-green-600';
        } else if (f0Value >= 6) {
            lethality = 'HIGH';
            sterilizationLevel = 'Medical Sterility';
            description = '6-log reduction of most pathogens';
            color = 'text-blue-600';
        } else if (f0Value >= 3) {
            lethality = 'MODERATE';
            sterilizationLevel = 'Food Industry Standard';
            description = 'Suitable for canned foods';
            color = 'text-yellow-600';
        } else {
            lethality = 'PARTIAL';
            sterilizationLevel = 'Pasteurization Level';
            description = 'Reduces vegetative cells only';
            color = 'text-orange-600';
        }

        setSterilizationResult({
            f0Value,
            lethality,
            sterilizationLevel,
            description,
            color,
            decimalReduction
        });
    };

    const resetCalculator = () => {
        setTemperature('121');
        setTime('');
        setZValue('10');
        setReferenceTemp('121');
        setSterilizationResult(null);
    };

    const microorganisms = [
        { name: 'B. stearothermophilus', zValue: '10', d121: '4', description: 'Thermophile, sterility indicator' },
        { name: 'C. botulinum', zValue: '12', d121: '0.2', description: 'Toxin producer, food safety target' },
        { name: 'C. sporogenes', zValue: '11', d121: '0.8', description: 'Anaerobic spoilage organism' },
        { name: 'G. stearothermophilus', zValue: '9', d121: '3', description: 'Thermophilic flat sour' },
    ];

    const f0Standards = [
        { application: 'Medical Instruments', f0: '15', temp: '134', time: '3' },
        { application: 'Canned Low-Acid Foods', f0: '3', temp: '121', time: '15' },
        { application: 'Pharmaceuticals', f0: '8', temp: '121', time: '8' },
        { application: 'Culture Media', f0: '12', temp: '121', time: '15' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Sterilization Time Calculator (F₀ Value)</h2>
                    <p className="text-gray-600">Calculate equivalent lethality for thermal sterilization processes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Process Temperature (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 121"
                            />
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Process Time (minutes)
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
                        <div className="bg-purple-50 rounded-xl p-6">
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
                                <option value="15">15°C (Psychrophiles)</option>
                            </select>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Reference Temperature (°C)
                            </label>
                            <select
                                value={referenceTemp}
                                onChange={(e) => setReferenceTemp(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                            >
                                <option value="121">121°C (Standard)</option>
                                <option value="115">115°C (Low Temp)</option>
                                <option value="134">134°C (Flash)</option>
                                <option value="100">100°C (Boiling)</option>
                            </select>
                        </div>
                    </div>

                    {/* Temperature Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Temperature-Time Profile</h3>
                        <div className="relative h-48">
                            {/* Y-axis - Temperature */}
                            <div className="absolute left-0 top-0 bottom-0 w-12">
                                <div className="h-full flex flex-col justify-between text-xs text-gray-600">
                                    <div>140°C</div>
                                    <div>130°C</div>
                                    <div>120°C</div>
                                    <div>110°C</div>
                                    <div>100°C</div>
                                </div>
                            </div>

                            {/* Graph area */}
                            <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-b border-gray-300">
                                {/* Grid lines */}
                                <div className="absolute inset-0">
                                    {[0, 25, 50, 75, 100].map(percent => (
                                        <div
                                            key={percent}
                                            className="absolute w-full h-px bg-gray-200"
                                            style={{ top: `${percent}%` }}
                                        />
                                    ))}
                                    {[0, 25, 50, 75, 100].map(percent => (
                                        <div
                                            key={percent}
                                            className="absolute h-full w-px bg-gray-200"
                                            style={{ left: `${percent}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Reference temperature line */}
                                <div
                                    className="absolute left-0 right-0 h-1 bg-green-400 opacity-50"
                                    style={{ top: `${((140 - parseFloat(referenceTemp)) / 40) * 100}%` }}
                                />

                                {/* Process temperature point */}
                                {time && temperature && (
                                    <div
                                        className="absolute w-6 h-6 bg-red-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                        style={{
                                            left: `${(Math.min(parseFloat(time), 60) / 60) * 100}%`,
                                            top: `${((140 - parseFloat(temperature)) / 40) * 100}%`,
                                        }}
                                    >
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                )}

                                {/* Time axis */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
                                    <div>0 min</div>
                                    <div>15 min</div>
                                    <div>30 min</div>
                                    <div>45 min</div>
                                    <div>60 min</div>
                                </div>
                            </div>

                            {/* Temperature labels */}
                            <div className="absolute -left-2 top-0 transform -translate-y-1/2 text-xs text-gray-600">
                                Temp (°C)
                            </div>
                            <div className="absolute bottom-0 left-1/2 transform translate-y-6 -translate-x-1/2 text-xs text-gray-600">
                                Time (minutes)
                            </div>
                        </div>

                        {/* Process info */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-600">Process Temp</div>
                                <div className="font-bold text-red-600">{temperature}°C</div>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-600">Process Time</div>
                                <div className="font-bold text-blue-600">{time || '0'} min</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateSterilization}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate F₀ Value
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
                    {sterilizationResult && (
                        <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Sterilization Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">F₀ Value at {referenceTemp}°C</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {sterilizationResult.f0Value.toFixed(2)}
                                </div>
                                <div className={`text-lg font-bold ${sterilizationResult.color}`}>
                                    {sterilizationResult.sterilizationLevel}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Lethality Level</div>
                                    <p className="text-gray-600">{sterilizationResult.lethality}</p>
                                    <p className="text-sm text-gray-500 mt-1">{sterilizationResult.description}</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="font-semibold text-blue-800 mb-1">Decimal Reduction</div>
                                    <p className="text-blue-700">
                                        D-value at {temperature}°C = {sterilizationResult.decimalReduction.toFixed(2)} minutes
                                    </p>
                                </div>

                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <div className="font-semibold text-yellow-800 mb-1">Calculation Formula</div>
                                    <p className="text-sm text-yellow-700">
                                        F₀ = {time} × 10^(({temperature} - {referenceTemp})/{zValue}) = {sterilizationResult.f0Value.toFixed(2)} min
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Microorganisms Reference */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Thermometer className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Microorganism Z-values & D-values</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Microorganism</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Z-value (°C)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">D₁₂₁ (min)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {microorganisms.map((org, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{org.name}</td>
                                            <td className="py-3 px-4">{org.zValue}</td>
                                            <td className="py-3 px-4">{org.d121}</td>
                                            <td className="py-3 px-4 text-gray-600 text-xs">{org.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center text-purple-800 mb-1">
                                <Info className="w-4 h-4 mr-2" />
                                <span className="font-semibold">Key Terms</span>
                            </div>
                            <ul className="text-xs text-purple-700 space-y-1">
                                <li>• <strong>Z-value:</strong> Temperature change needed to change D-value 10-fold</li>
                                <li>• <strong>D-value:</strong> Time at temperature to reduce population by 90%</li>
                                <li>• <strong>F₀ value:</strong> Equivalent minutes at 121°C</li>
                            </ul>
                        </div>
                    </div>

                    {/* Industry Standards */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-400" />
                            Industry Sterilization Standards
                        </h3>
                        <div className="space-y-3">
                            {f0Standards.map((standard, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-gray-800">{standard.application}</div>
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                            F₀ ≥ {standard.f0}
                                        </div>
                                    </div>
                                    <div className="flex text-sm text-gray-600">
                                        <div className="mr-4">
                                            <span className="font-medium">Temp:</span> {standard.temp}°C
                                        </div>
                                        <div>
                                            <span className="font-medium">Time:</span> {standard.time} min
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center text-yellow-800">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                <span className="font-semibold">Safety Note</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                                Always validate sterilization processes with biological indicators for critical applications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}