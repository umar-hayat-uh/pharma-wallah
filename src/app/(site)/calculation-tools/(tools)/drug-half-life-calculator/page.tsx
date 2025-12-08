"use client";
import { useState, useEffect } from 'react';
import { Clock, RefreshCw, Zap } from 'lucide-react';

export default function DrugHalfLifeCalculator() {
    const [halfLife, setHalfLife] = useState<string>('');
    const [dose, setDose] = useState<string>('');
    const [interval, setInterval] = useState<string>('24');
    const [doses, setDoses] = useState<string>('5');
    const [eliminationConstant, setEliminationConstant] = useState<string>('');
    const [result, setResult] = useState<{
        ke: number;
        steadyState: number;
        timeToSteady: number;
        accumulation: number;
        trough: number;
        peak: number;
    } | null>(null);

    useEffect(() => {
        if (halfLife) {
            const ke = 0.693 / parseFloat(halfLife);
            setEliminationConstant(ke.toFixed(4));
        }
    }, [halfLife]);

    const calculatePharmacokinetics = () => {
        const t_half = parseFloat(halfLife);
        const D = parseFloat(dose);
        const tau = parseFloat(interval);
        const n = parseFloat(doses);
        const ke = parseFloat(eliminationConstant);

        if (isNaN(t_half) || isNaN(D) || isNaN(tau) || isNaN(n) || t_half <= 0 || D <= 0 || tau <= 0 || n <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Calculate elimination constant if not provided
        const Ke = ke || (0.693 / t_half);

        // Steady state concentration factor
        const accumulationFactor = 1 / (1 - Math.exp(-Ke * tau));

        // Time to reach steady state (4-5 half-lives)
        const timeToSteady = t_half * 4.32;

        // Trough concentration approximation
        const trough = D * (Math.exp(-Ke * tau) / (1 - Math.exp(-Ke * tau)));

        // Peak concentration approximation
        const peak = D / (1 - Math.exp(-Ke * tau));

        // Accumulation ratio
        const accumulation = 1 / (1 - Math.exp(-Ke * tau));

        setResult({
            ke: Ke,
            steadyState: accumulationFactor,
            timeToSteady,
            accumulation,
            trough,
            peak
        });
    };

    const resetCalculator = () => {
        setHalfLife('');
        setDose('');
        setInterval('24');
        setDoses('5');
        setEliminationConstant('');
        setResult(null);
    };

    const exampleDrugs = [
        { drug: 'Amoxicillin', halfLife: '1.3', dose: '500', interval: '8', comment: 'Short half-life' },
        { drug: 'Metformin', halfLife: '6.2', dose: '500', interval: '12', comment: 'Medium half-life' },
        { drug: 'Digoxin', halfLife: '36', dose: '0.125', interval: '24', comment: 'Long half-life' },
        { drug: 'Warfarin', halfLife: '40', dose: '5', interval: '24', comment: 'Very long half-life' },
        { drug: 'Aspirin', halfLife: '0.25', dose: '325', interval: '4', comment: 'Very short half-life' },
    ];

    const halfLifeInterpretation = [
        { range: '< 4 hours', classification: 'Short', dosing: 'Multiple daily doses' },
        { range: '4-24 hours', classification: 'Medium', dosing: 'Once or twice daily' },
        { range: '24-48 hours', classification: 'Long', dosing: 'Once daily' },
        { range: '> 48 hours', classification: 'Very Long', dosing: 'Loading dose required' },
    ];

    return (
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">

            <div className="max-w-7xl mx-auto  bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center mb-6">
                    <Clock className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Drug Half-Life Calculator (Multiple Dose)</h2>
                        <p className="text-gray-600">Calculate pharmacokinetic parameters for multiple dosing regimens</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Half-Life (t½) hours
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={halfLife}
                                    onChange={(e) => setHalfLife(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    placeholder="e.g., 6"
                                />
                            </div>

                            <div className="bg-green-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Dose (mg)
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={dose}
                                    onChange={(e) => setDose(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                    placeholder="e.g., 500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Dosing Interval (hours)
                                </label>
                                <select
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                >
                                    <option value="4">Q4H (6x daily)</option>
                                    <option value="6">Q6H (4x daily)</option>
                                    <option value="8">Q8H (3x daily)</option>
                                    <option value="12">Q12H (2x daily)</option>
                                    <option value="24">Q24H (1x daily)</option>
                                    <option value="48">Q48H (Every 2 days)</option>
                                </select>
                            </div>

                            <div className="bg-red-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Number of Doses
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={doses}
                                    onChange={(e) => setDoses(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Elimination Rate Constant (ke) 1/h
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                value={eliminationConstant}
                                onChange={(e) => setEliminationConstant(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                                placeholder="Auto-calculated from half-life"
                                readOnly={!!halfLife}
                            />
                            <p className="text-xs text-gray-600 mt-1">ke = 0.693 / t½</p>
                        </div>

                        {/* Plasma Concentration Curve */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4 text-center">Multiple Dose Plasma Concentration</h3>
                            <div className="relative h-48">
                                {/* Grid */}
                                <div className="absolute inset-0">
                                    {/* Horizontal grid lines */}
                                    {[0, 25, 50, 75, 100].map(y => (
                                        <div key={y} className="absolute w-full h-px bg-gray-300" style={{ top: `${100 - y}%` }} />
                                    ))}
                                    {/* Vertical grid lines */}
                                    {[0, 25, 50, 75, 100].map(x => (
                                        <div key={x} className="absolute h-full w-px bg-gray-300" style={{ left: `${x}%` }} />
                                    ))}
                                </div>

                                {/* Axes */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800"></div>
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800"></div>

                                {/* Concentration curve */}
                                {result && (
                                    <svg className="absolute inset-0 w-full h-full">
                                        {/* Generate sawtooth pattern for multiple doses */}
                                        {Array.from({ length: parseInt(doses) }).map((_, doseNum) => {
                                            const startX = (doseNum * 20);
                                            const peakY = 80 - (doseNum * 5); // Accumulating peaks
                                            const troughY = 40 + (doseNum * 5); // Accumulating troughs

                                            return (
                                                <g key={doseNum}>
                                                    {/* Exponential decay from peak to trough */}
                                                    <path
                                                        d={`M ${startX},${100 - peakY} Q ${startX + 5},${100 - (peakY + troughY) / 2} ${startX + 10},${100 - troughY}`}
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="2"
                                                    />
                                                    {/* Next dose administration */}
                                                    {doseNum < parseInt(doses) - 1 && (
                                                        <line
                                                            x1={startX + 10}
                                                            y1={100 - troughY}
                                                            x2={startX + 20}
                                                            y2={100 - (troughY - 10)}
                                                            stroke="#3b82f6"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                                </g>
                                            );
                                        })}

                                        {/* Steady state line */}
                                        <line
                                            x1="0"
                                            y1="20"
                                            x2="100"
                                            y2="20"
                                            stroke="#ef4444"
                                            strokeWidth="1"
                                            strokeDasharray="5,5"
                                        />
                                    </svg>
                                )}

                                {/* Labels */}
                                <div className="absolute -bottom-6 left-0 text-xs text-gray-600">Time 0</div>
                                <div className="absolute -bottom-6 right-0 text-xs text-gray-600">
                                    {parseInt(doses) * parseInt(interval)} hours
                                </div>
                                <div className="absolute -left-8 top-0 text-xs text-gray-600 -rotate-90">Concentration</div>

                                {/* Steady state label */}
                                {result && (
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-white px-2 py-1 rounded shadow text-xs font-bold text-red-600">
                                            Steady State
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 flex justify-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                                    <span className="text-xs">Concentration</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                    <span className="text-xs">Next Dose</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1 border border-dashed"></div>
                                    <span className="text-xs">Steady State</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={calculatePharmacokinetics}
                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Calculate PK Parameters
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
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Pharmacokinetic Analysis</h3>

                                <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Elimination Rate Constant</div>
                                    <div className="text-3xl font-bold text-green-400 mb-2">
                                        {result.ke.toFixed(4)} h⁻¹
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">
                                        Half-Life: {halfLife} hours
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-xs font-semibold text-gray-600">Accumulation Ratio</div>
                                        <div className="text-xl font-bold text-blue-600 mt-1">
                                            {result.accumulation.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="text-xs font-semibold text-gray-600">Time to Steady State</div>
                                        <div className="text-xl font-bold text-green-600 mt-1">
                                            {result.timeToSteady.toFixed(1)} hours
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Dosing Regimen</div>
                                        <p className="text-gray-600">
                                            {dose} mg every {interval} hours for {doses} doses
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <div className="font-semibold text-purple-800 mb-1">Key Formulas</div>
                                        <div className="text-sm text-purple-700 space-y-1">
                                            <div>ke = 0.693 / t½</div>
                                            <div>Accumulation = 1 / (1 - e^(-ke × τ))</div>
                                            <div>Steady State ≈ 4.32 × t½</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Half-Life Interpretation */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <Zap className="w-5 h-5 text-green-400 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Half-Life Interpretation Guide</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Half-Life Range</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Classification</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Dosing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {halfLifeInterpretation.map((hl, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                                <td className="py-3 px-4 font-medium">{hl.range}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${hl.classification === 'Short' ? 'bg-blue-100 text-blue-800' :
                                                        hl.classification === 'Medium' ? 'bg-green-100 text-green-800' :
                                                            hl.classification === 'Long' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {hl.classification}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{hl.dosing}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Example Drugs */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Example Drug Half-Lives</h3>
                            <div className="space-y-3">
                                {exampleDrugs.map((drug, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setHalfLife(drug.halfLife);
                                            setDose(drug.dose);
                                            setInterval(drug.interval);
                                        }}
                                        className="w-full bg-white rounded-lg p-4 hover:bg-yellow-50 transition-colors text-left"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800">{drug.drug}</div>
                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                t½: {drug.halfLife}h
                                            </div>
                                        </div>
                                        <div className="flex text-sm text-gray-600">
                                            <div className="mr-4">
                                                <span className="font-medium">Dose:</span> {drug.dose}mg
                                            </div>
                                            <div>
                                                <span className="font-medium">Interval:</span> Q{drug.interval}H
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{drug.comment}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}