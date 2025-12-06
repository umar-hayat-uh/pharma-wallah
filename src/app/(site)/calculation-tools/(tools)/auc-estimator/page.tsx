"use client";
import { useState, useEffect } from 'react';
import {
    AreaChart,
    Calculator,
    TrendingUp,
    LineChart,
    RefreshCw,
    AlertCircle,
    Plus,
    Minus,
    Zap,
    PieChart
} from 'lucide-react';

type AUCUnit = 'mg·h/L' | 'μg·h/mL' | 'ng·h/mL';
type Method = 'single' | 'trapezoidal' | 'clearance';

interface ConcentrationPoint {
    time: number;
    concentration: number;
}

export default function AUCCalculator() {
    const [method, setMethod] = useState<Method>('single');
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
    const [showAdvanced, setShowAdvanced] = useState(false);

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

                // Calculate AUC using trapezoidal rule
                for (let i = 1; i < sortedPoints.length; i++) {
                    const prev = sortedPoints[i - 1];
                    const curr = sortedPoints[i];

                    const timeDiff = curr.time - prev.time;
                    const avgConc = (prev.concentration + curr.concentration) / 2;
                    calculatedAUC += avgConc * timeDiff;
                }

                // Estimate AUC to infinity using last point and elimination rate
                if (sortedPoints.length >= 3) {
                    const lastPoint = sortedPoints[sortedPoints.length - 1];
                    const secondLast = sortedPoints[sortedPoints.length - 2];

                    if (lastPoint.concentration > 0) {
                        const ke = Math.log(secondLast.concentration / lastPoint.concentration) /
                            (lastPoint.time - secondLast.time);

                        if (ke > 0) {
                            const aucTail = lastPoint.concentration / ke;
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
            name: 'Oral Immediate',
            points: [
                { time: 0, concentration: 0 },
                { time: 1, concentration: 4 },
                { time: 2, concentration: 6 },
                { time: 4, concentration: 4 },
                { time: 8, concentration: 2 },
            ]
        },
        {
            name: 'Sustained Release',
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
        if (aucValue < 10) return 'Low exposure - consider dose increase';
        if (aucValue < 50) return 'Moderate exposure - therapeutic range';
        if (aucValue < 100) return 'High exposure - monitor for toxicity';
        return 'Very high exposure - risk of toxicity';
    };

    useEffect(() => {
        calculateAUC();
    }, [method, dose, clearance, bioavailability, concentrationPoints, units]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <AreaChart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">AUC Calculator</h1>
                                <p className="text-blue-100 mt-2">Estimate Area Under the Curve using multiple methods</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <LineChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Exposure Assessment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                AUC Calculation Method
                            </h2>

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
                                        <span className="text-sm mt-1">AUC = Dose ÷ Cl</span>
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
                                        <span className="font-semibold">Trapezoidal Rule</span>
                                        <span className="text-sm mt-1">From concentration-time data</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className={`p-4 rounded-xl transition-all ${showAdvanced ?
                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <PieChart className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Advanced</span>
                                        <span className="text-sm mt-1">Additional parameters</span>
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
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                                        Dose & Clearance Method
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Dose (mg)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={dose}
                                                onChange={(e) => setDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Clearance (L/h)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={clearance}
                                                onChange={(e) => setClearance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bioavailability (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={bioavailability}
                                                onChange={(e) => setBioavailability(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {method === 'trapezoidal' && (
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <LineChart className="w-5 h-5 mr-2 text-green-600" />
                                        Concentration-Time Data
                                    </h3>

                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-gray-700">Time-Concentration Points</span>
                                            <button
                                                onClick={addConcentrationPoint}
                                                className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Point
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                                            {concentrationPoints.map((point, index) => (
                                                <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-600 mb-1">Time (h)</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={point.time}
                                                            onChange={(e) => updateConcentrationPoint(index, 'time', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-gray-600 mb-1">Concentration</label>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            value={point.concentration}
                                                            onChange={(e) => updateConcentrationPoint(index, 'concentration', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removeConcentrationPoint(index)}
                                                        disabled={concentrationPoints.length <= 2}
                                                        className={`p-2 rounded ${concentrationPoints.length <= 2 ?
                                                            'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                            'bg-red-100 hover:bg-red-200 text-red-600'
                                                            }`}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visualization Preview */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 mb-3">Data Preview</h4>
                                        <div className="h-40 relative border-l border-b border-gray-300">
                                            {/* This would be a proper chart in production */}
                                            <div className="absolute inset-0 flex items-end">
                                                {concentrationPoints.map((point, index) => (
                                                    <div
                                                        key={index}
                                                        className="absolute bottom-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"
                                                        style={{
                                                            left: `${(point.time / Math.max(...concentrationPoints.map(p => p.time))) * 100}%`,
                                                            bottom: `${(point.concentration / Math.max(...concentrationPoints.map(p => p.concentration))) * 100}%`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Options */}
                            {showAdvanced && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Parameters</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Elimination Rate (kₑ)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg"
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Volume of Distribution (Vd)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sample Profiles */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Profiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sampleProfiles.map((profile, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-center transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-blue-700">{profile.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                {profile.points.length} time points
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    onClick={calculateAUC}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate AUC
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
                        {/* AUC Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <AreaChart className="w-7 h-7 mr-3" />
                                AUC Results
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Area Under Curve
                                    </div>
                                    {auc !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {auc.toFixed(2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {units}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AUC to Infinity */}
                            {auc !== null && aucInf !== null && aucInf > auc && (
                                <div className="bg-white/10 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">AUC₀→∞ (with extrapolation)</div>
                                        <div className="text-2xl font-bold">{aucInf.toFixed(2)} {units}</div>
                                        <div className="text-xs mt-1 text-blue-100">
                                            Includes terminal phase extrapolation
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interpretation */}
                        {auc !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Interpretation
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getAUCInterpretation(auc)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Total exposure:</span>
                                            <span className="font-semibold">{auc.toFixed(2)} {units}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Average concentration:</span>
                                            <span className="font-semibold">
                                                {(auc / (concentrationPoints[concentrationPoints.length - 1]?.time || 1)).toFixed(2)} {units.split('·')[0]}/L
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AUC Visualizer */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">AUC Visualization</h3>
                            <div className="h-48 relative border-l border-b border-gray-300 mb-4">
                                <div className="absolute inset-0">
                                    {/* Simulated curve area */}
                                    <svg className="w-full h-full">
                                        <path
                                            d="M0,100 L20,60 L40,80 L60,40 L80,20 L100,10"
                                            fill="url(#gradient)"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            fillOpacity="0.3"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#34d399" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center text-sm text-gray-600">
                                Area under the concentration-time curve represents total drug exposure
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">AUC Applications</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Bioequivalence:</div>
                                    <div className="text-gray-600 mt-1">90% CI of AUC ratio 0.8-1.25</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Dose Adjustment:</div>
                                    <div className="text-gray-600 mt-1">AUC proportional to dose</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Toxicity Monitoring:</div>
                                    <div className="text-gray-600 mt-1">High AUC indicates risk</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pharmacokinetic Relationships */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">AUC Relationships</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Linear Pharmacokinetics</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">• AUC proportional to dose</p>
                                <p className="text-sm text-gray-600">• AUC = Dose ÷ Clearance</p>
                                <p className="text-sm text-gray-600">• Independent of dosing schedule</p>
                                <p className="text-sm text-gray-600">• Assumes first-order elimination</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Bioequivalence Criteria</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">• AUC ratio: 0.8-1.25 (90% CI)</p>
                                <p className="text-sm text-gray-600">• Cmax ratio: 0.8-1.25 (90% CI)</p>
                                <p className="text-sm text-gray-600">• Tmax similar (±20%)</p>
                                <p className="text-sm text-gray-600">• Same safety/efficacy profile</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Trapezoidal Rule</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">• AUC = Σ[(C₁ + C₂)/2 × (t₂ - t₁)]</p>
                                <p className="text-sm text-gray-600">• Linear interpolation between points</p>
                                <p className="text-sm text-gray-600">• Add tail: C_last/kₑ for AUC₀→∞</p>
                                <p className="text-sm text-gray-600">• Most accurate with frequent sampling</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}