"use client";
import { useState, useEffect } from 'react';
import {
    Calculator,
    TrendingUp,
    LineChart,
    RefreshCw,
    AlertCircle,
    Plus,
    Minus,
    Zap,
    PieChart,
    Activity
} from 'lucide-react';
import { AreaChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

type AUCUnit = 'mg·h/L' | 'μg·h/mL' | 'ng·h/mL';
type Method = 'single' | 'trapezoidal' | 'clearance';

interface ConcentrationPoint {
    time: number;
    concentration: number;
}

export default function AUCCalculator() {
    const [method, setMethod] = useState<Method>('trapezoidal');
    const [dose, setDose] = useState<string>('100');
    const [clearance, setClearance] = useState<string>('5');
    const [bioavailability, setBioavailability] = useState<string>('100');
    const [concentrationPoints, setConcentrationPoints] = useState<ConcentrationPoint[]>([
        { time: 0, concentration: 0 },
        { time: 1, concentration: 8 },
        { time: 2, concentration: 6 },
        { time: 4, concentration: 4 },
        { time: 8, concentration: 2 },
    ]);
    const [auc, setAuc] = useState<number | null>(null);
    const [aucInf, setAucInf] = useState<number | null>(null);
    const [units, setUnits] = useState<AUCUnit>('mg·h/L');
    const [ke, setKe] = useState<number | null>(null);

    const calculateAUC = () => {
        let calculatedAUC = 0;
        let calculatedAUCinf = 0;

        switch (method) {
            case 'single':
                const doseVal = parseFloat(dose);
                const cl = parseFloat(clearance);
                const f = parseFloat(bioavailability) / 100;

                if (!isNaN(doseVal) && !isNaN(cl) && cl > 0) {
                    calculatedAUC = (doseVal * f) / cl;
                    calculatedAUCinf = calculatedAUC;
                }
                break;

            case 'trapezoidal':
                // Sort points by time
                const sortedPoints = [...concentrationPoints].sort((a, b) => a.time - b.time);

                // Linear trapezoidal rule [citation:5]
                for (let i = 1; i < sortedPoints.length; i++) {
                    const prev = sortedPoints[i - 1];
                    const curr = sortedPoints[i];
                    const timeDiff = curr.time - prev.time;
                    const avgConc = (prev.concentration + curr.concentration) / 2;
                    calculatedAUC += avgConc * timeDiff;
                }

                // Extrapolate to infinity using terminal elimination rate [citation:5]
                if (sortedPoints.length >= 3) {
                    const lastPoint = sortedPoints[sortedPoints.length - 1];
                    const secondLast = sortedPoints[sortedPoints.length - 2];

                    if (lastPoint.concentration > 0) {
                        const kel = Math.log(secondLast.concentration / lastPoint.concentration) /
                                   (lastPoint.time - secondLast.time);
                        if (kel > 0) {
                            setKe(kel);
                            const aucTail = lastPoint.concentration / kel;
                            calculatedAUCinf = calculatedAUC + aucTail;
                        }
                    }
                }
                break;
        }

        setAuc(calculatedAUC);
        setAucInf(calculatedAUCinf);
    };

    const addConcentrationPoint = () => {
        const lastTime = concentrationPoints[concentrationPoints.length - 1]?.time || 0;
        setConcentrationPoints([
            ...concentrationPoints,
            { time: lastTime + 1, concentration: 0 }
        ]);
    };

    const removeConcentrationPoint = (index: number) => {
        if (concentrationPoints.length > 2) {
            const newPoints = [...concentrationPoints];
            newPoints.splice(index, 1);
            setConcentrationPoints(newPoints);
        }
    };

    const updateConcentrationPoint = (index: number, field: 'time' | 'concentration', value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            const newPoints = [...concentrationPoints];
            newPoints[index] = { ...newPoints[index], [field]: numValue };
            setConcentrationPoints(newPoints);
        }
    };

    const resetCalculator = () => {
        setDose('100');
        setClearance('5');
        setBioavailability('100');
        setConcentrationPoints([
            { time: 0, concentration: 0 },
            { time: 1, concentration: 8 },
            { time: 2, concentration: 6 },
            { time: 4, concentration: 4 },
            { time: 8, concentration: 2 },
        ]);
        setAuc(null);
        setAucInf(null);
        setKe(null);
    };

    const sampleProfiles = [
        {
            name: 'IV Bolus',
            points: [
                { time: 0, concentration: 10 },
                { time: 1, concentration: 8 },
                { time: 2, concentration: 6 },
                { time: 4, concentration: 4 },
                { time: 8, concentration: 2 },
            ]
        },
        {
            name: 'Oral IR',
            points: [
                { time: 0, concentration: 0 },
                { time: 1, concentration: 4 },
                { time: 2, concentration: 6 },
                { time: 4, concentration: 4 },
                { time: 8, concentration: 2 },
            ]
        },
        {
            name: 'SR',
            points: [
                { time: 0, concentration: 0 },
                { time: 2, concentration: 3 },
                { time: 4, concentration: 5 },
                { time: 8, concentration: 4 },
                { time: 12, concentration: 2 },
            ]
        }
    ];

    const loadSample = (index: number) => {
        const profile = sampleProfiles[index];
        setMethod('trapezoidal');
        setConcentrationPoints(profile.points);
    };

    const getAUCInterpretation = (aucValue: number) => {
        if (aucValue < 10) return 'Low exposure – consider dose increase';
        if (aucValue < 50) return 'Moderate exposure – therapeutic range';
        if (aucValue < 100) return 'High exposure – monitor for toxicity';
        return 'Very high exposure – toxicity risk';
    };

    useEffect(() => {
        calculateAUC();
    }, [method, dose, clearance, bioavailability, concentrationPoints]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">AUC Calculator</h1>
                                <p className="text-blue-100 mt-2">Area Under the Curve using linear trapezoidal rule</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <LineChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Exposure Assessment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Calculation Method
                            </h2>

                            {/* Method Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setMethod('single')}
                                    className={`p-4 rounded-xl transition-all ${method === 'single' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Zap className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">From Dose & Cl</span>
                                        <span className="text-xs mt-1">AUC = Dose / Cl</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('trapezoidal')}
                                    className={`p-4 rounded-xl transition-all ${method === 'trapezoidal' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <LineChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Trapezoidal</span>
                                        <span className="text-xs mt-1">From concentration data</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMethod('clearance')}
                                    className={`p-4 rounded-xl transition-all ${method === 'clearance' ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Clearance</span>
                                        <span className="text-xs mt-1">From multiple doses</span>
                                    </div>
                                </button>
                            </div>

                            {/* Units Selection */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['mg·h/L', 'μg·h/mL', 'ng·h/mL'] as AUCUnit[]).map((unit) => (
                                        <button
                                            key={unit}
                                            onClick={() => setUnits(unit)}
                                            className={`py-2 rounded-lg transition-all ${units === unit ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                                                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inputs based on method */}
                            {method === 'single' && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Dose & Clearance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                            <input type="number" value={dose} onChange={(e) => setDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Clearance (L/h)</label>
                                            <input type="number" value={clearance} onChange={(e) => setClearance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bioavailability (%)</label>
                                            <input type="number" value={bioavailability} onChange={(e) => setBioavailability(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {method === 'trapezoidal' && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Concentration-Time Data</h3>

                                    <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                                        {concentrationPoints.map((point, index) => (
                                            <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                                                <div className="flex-1">
                                                    <label className="block text-xs text-gray-600 mb-1">Time (h)</label>
                                                    <input type="number" step="0.1" value={point.time}
                                                        onChange={(e) => updateConcentrationPoint(index, 'time', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs text-gray-600 mb-1">Concentration</label>
                                                    <input type="number" step="0.001" value={point.concentration}
                                                        onChange={(e) => updateConcentrationPoint(index, 'concentration', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded" />
                                                </div>
                                                <button onClick={() => removeConcentrationPoint(index)}
                                                    disabled={concentrationPoints.length <= 2}
                                                    className={`p-2 rounded ${concentrationPoints.length <= 2 ?
                                                        'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                        'bg-red-100 hover:bg-red-200 text-red-600'}`}>
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={addConcentrationPoint}
                                        className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center">
                                        <Plus className="w-5 h-5 mr-2" /> Add Point
                                    </button>
                                </div>
                            )}

                            {/* Sample Profiles */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Profiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sampleProfiles.map((profile, index) => (
                                        <button key={index} onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-center">
                                            <div className="font-semibold text-blue-700">{profile.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">{profile.points.length} time points</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={calculateAUC}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Calculate AUC
                                </button>
                                <button onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Sidebar */}
                    <div className="space-y-6">
                        {/* AUC Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <AreaChart className="w-7 h-7 mr-3" />
                                AUC Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">Area Under Curve</div>
                                    {auc !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">{auc.toFixed(2)}</div>
                                            <div className="text-2xl font-semibold">{units}</div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">Enter Values</div>
                                    )}
                                </div>
                            </div>

                            {aucInf !== null && auc !== null && aucInf > auc && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">AUC₀→∞ (extrapolated)</div>
                                        <div className="text-2xl font-bold">{aucInf.toFixed(2)} {units}</div>
                                        {ke && <div className="text-xs mt-1">kₑ = {ke.toFixed(3)} h⁻¹</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Concentration-Time Chart */}
                        {method === 'trapezoidal' && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Profile Visualization</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={concentrationPoints.sort((a,b) => a.time - b.time)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" label="Time (h)" />
                                            <YAxis label={{ value: 'Conc', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="concentration" stroke="#3b82f6" fill="#93c5fd" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Interpretation */}
                        {auc !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Interpretation
                                </h3>
                                <p className="text-gray-700">{getAUCInterpretation(auc)}</p>
                            </div>
                        )}

                        {/* AUC Applications */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">AUC Applications</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <span className="font-semibold">Bioequivalence:</span> 90% CI of AUC ratio 0.8-1.25
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <span className="font-semibold">Dose adjustment:</span> AUC proportional to dose
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <span className="font-semibold">Toxicity monitoring:</span> High AUC indicates risk
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}