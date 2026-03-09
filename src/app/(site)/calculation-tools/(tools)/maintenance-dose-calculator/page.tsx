"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    TrendingUp,
    Clock,
    RefreshCw,
    AlertCircle,
    BarChart,
    PieChart,
    Timer
} from 'lucide-react';

type DosingInterval = 'q4h' | 'q6h' | 'q8h' | 'q12h' | 'q24h' | 'q48h' | 'custom';

export default function MaintenanceDoseCalculator() {
    const [targetConcentration, setTargetConcentration] = useState<string>('10');
    const [clearance, setClearance] = useState<string>('5');
    const [bioavailability, setBioavailability] = useState<string>('100');
    const [dosingInterval, setDosingInterval] = useState<DosingInterval>('q12h');
    const [customInterval, setCustomInterval] = useState<string>('12');
    const [maintenanceDose, setMaintenanceDose] = useState<number | null>(null);
    const [steadyStateTime, setSteadyStateTime] = useState<number | null>(null);
    const [accumulationRatio, setAccumulationRatio] = useState<number | null>(null);
    const [useHalfLife, setUseHalfLife] = useState<boolean>(false);
    const [halfLife, setHalfLife] = useState<string>('6');

    const calculateMaintenanceDose = () => {
        const targetC = parseFloat(targetConcentration);
        const cl = parseFloat(clearance);
        const f = parseFloat(bioavailability) / 100;

        // Calculate interval in hours
        let intervalHours = 12; // default for q12h
        switch (dosingInterval) {
            case 'q4h': intervalHours = 4; break;
            case 'q6h': intervalHours = 6; break;
            case 'q8h': intervalHours = 8; break;
            case 'q12h': intervalHours = 12; break;
            case 'q24h': intervalHours = 24; break;
            case 'q48h': intervalHours = 48; break;
            case 'custom': intervalHours = parseFloat(customInterval) || 12; break;
        }

        if (isNaN(targetC) || isNaN(cl) || cl <= 0) return;

        // Basic maintenance dose calculation
        let md = targetC * cl * intervalHours;

        // Adjust for bioavailability if not 100%
        if (!isNaN(f)) {
            md /= f;
        }

        setMaintenanceDose(md);

        // Calculate steady-state time (4-5 half-lives)
        if (useHalfLife) {
            const t12 = parseFloat(halfLife);
            if (!isNaN(t12) && t12 > 0) {
                setSteadyStateTime(t12 * 4.32); // 4.32 half-lives to reach 95% steady state
            }
        } else {
            // Estimate half-life from clearance and typical Vd
            const typicalVd = 50; // Typical Vd in liters
            const ke = cl / typicalVd;
            const t12 = 0.693 / ke;
            setSteadyStateTime(t12 * 4.32);
        }

        // Calculate accumulation ratio: R = 1/(1 - e^(-ke*tau))
        if (useHalfLife) {
            const t12 = parseFloat(halfLife);
            if (!isNaN(t12) && t12 > 0) {
                const ke = 0.693 / t12;
                const r = 1 / (1 - Math.exp(-ke * intervalHours));
                setAccumulationRatio(r);
            }
        }
    };

    const resetCalculator = () => {
        setTargetConcentration('10');
        setClearance('5');
        setBioavailability('100');
        setDosingInterval('q12h');
        setCustomInterval('12');
        setMaintenanceDose(null);
        setSteadyStateTime(null);
        setAccumulationRatio(null);
        setUseHalfLife(false);
        setHalfLife('6');
    };

    const sampleDrugs = [
        {
            name: 'Vancomycin',
            targetC: '15',
            cl: '4.3',
            f: '100',
            interval: 'q12h' as DosingInterval,
            note: 'Trough: 10-15 mg/L, Peak: 25-40 mg/L'
        },
        {
            name: 'Digoxin',
            targetC: '1.2',
            cl: '0.048',
            f: '70',
            interval: 'q24h' as DosingInterval,
            note: 'Therapeutic: 0.8-2.0 mcg/L'
        },
        {
            name: 'Phenytoin',
            targetC: '15',
            cl: '0.03',
            f: '90',
            interval: 'q24h' as DosingInterval,
            note: 'Non-linear kinetics'
        },
        {
            name: 'Gentamicin',
            targetC: '8',
            cl: '4.3',
            f: '100',
            interval: 'q8h' as DosingInterval,
            note: 'Peak: 5-10 mg/L, Trough: <2 mg/L'
        }
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setTargetConcentration(drug.targetC);
        setClearance(drug.cl);
        setBioavailability(drug.f);
        setDosingInterval(drug.interval);
    };

    const getDosingFrequency = (interval: number) => {
        if (interval <= 6) return 'Multiple daily doses';
        if (interval <= 12) return 'Twice daily';
        if (interval <= 24) return 'Once daily';
        return 'Less than once daily';
    };

    useEffect(() => {
        calculateMaintenanceDose();
    }, [targetConcentration, clearance, bioavailability, dosingInterval, customInterval, useHalfLife, halfLife]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Maintenance Dose Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate maintenance doses to maintain therapeutic concentrations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Timer className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Steady State</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Maintenance Dose Calculation
                            </h2>

                            {/* Basic Parameters */}
                            <div className="space-y-6">
                                {/* Target Concentration */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                        Target Concentration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Desired Cₛₛ (mg/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={targetConcentration}
                                                onChange={(e) => setTargetConcentration(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 10"
                                            />
                                            <div className="text-xs text-gray-500 mt-2">
                                                Steady-state average concentration
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                <div className="text-sm font-semibold text-gray-600">Therapeutic Ranges</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Digoxin: 0.8-2.0 mcg/L<br />
                                                    Vancomycin: 10-20 mg/L (trough)<br />
                                                    Phenytoin: 10-20 mg/L
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clearance */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                                        Clearance
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Clearance (L/h)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={clearance}
                                                onChange={(e) => setClearance(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="e.g., 5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bioavailability F (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                value={bioavailability}
                                                onChange={(e) => setBioavailability(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dosing Interval */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-purple-600" />
                                        Dosing Interval
                                    </h3>

                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Interval (τ)
                                        </label>
                                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                            {(['q4h', 'q6h', 'q8h', 'q12h', 'q24h', 'q48h', 'custom'] as DosingInterval[]).map((interval) => (
                                                <button
                                                    key={interval}
                                                    onClick={() => setDosingInterval(interval)}
                                                    className={`py-3 rounded-lg transition-all ${dosingInterval === interval ?
                                                        'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                                        'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {interval === 'custom' ? 'Custom' : interval}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {dosingInterval === 'custom' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Custom Interval (hours)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={customInterval}
                                                    onChange={(e) => setCustomInterval(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                                    placeholder="e.g., 12"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Frequency</div>
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {getDosingFrequency(parseFloat(customInterval) || 12)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Advanced Options */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-gray-800">Advanced Parameters</h3>
                                        <button
                                            onClick={() => setUseHalfLife(!useHalfLife)}
                                            className={`px-4 py-2 rounded-lg ${useHalfLife ?
                                                'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {useHalfLife ? 'Using Half-Life' : 'Add Half-Life'}
                                        </button>
                                    </div>

                                    {useHalfLife && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Half-Life (t½, hours)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={halfLife}
                                                    onChange={(e) => setHalfLife(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                    placeholder="e.g., 6"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Accumulation</div>
                                                    <div className="text-lg font-bold text-purple-600">
                                                        {accumulationRatio ? `R = ${accumulationRatio.toFixed(2)}` : 'Calculate'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Formula Display */}
                                <div className="bg-white rounded-xl p-6 border border-gray-300">
                                    <h3 className="font-semibold text-gray-800 mb-3">Maintenance Dose Formula</h3>
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="font-mono text-lg mb-2">
                                            MD = (Cₛₛ × Cl × τ) ÷ F
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Where:<br />
                                            • Cₛₛ = Target steady-state concentration<br />
                                            • Cl = Clearance<br />
                                            • τ = Dosing interval<br />
                                            • F = Bioavailability fraction
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Drugs */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Example Drugs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {sampleDrugs.map((drug, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{drug.name}</div>
                                                <div className="text-xs text-gray-600 mt-2">
                                                    Target: {drug.targetC}<br />
                                                    Cl: {drug.cl} L/h<br />
                                                    Interval: {drug.interval}
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">{drug.note}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateMaintenanceDose}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Maintenance Dose
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
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Maintenance Dose Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Maintenance Dose
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Dose per Interval
                                    </div>
                                    {maintenanceDose !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {maintenanceDose.toFixed(1)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                mg
                                            </div>
                                            <div className="text-lg mt-4">
                                                Every {dosingInterval === 'custom' ? customInterval : dosingInterval.replace('q', '')} hours
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Daily Dose */}
                            {maintenanceDose !== null && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Total Daily Dose</div>
                                        <div className="text-2xl font-bold">
                                            {(maintenanceDose * (24 / (dosingInterval === 'custom' ? parseFloat(customInterval) || 12 : parseInt(dosingInterval.replace('q', '').replace('h', ''))))).toFixed(1)} mg/day
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Steady State Information */}
                        {steadyStateTime !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Timer className="w-5 h-5 mr-2 text-blue-600" />
                                    Steady State Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-center">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">Time to Steady State</div>
                                            <div className="text-2xl font-bold text-blue-700">
                                                {steadyStateTime.toFixed(1)} hours
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                (~{Math.ceil(steadyStateTime / 24)} days)
                                            </div>
                                        </div>
                                    </div>

                                    {accumulationRatio !== null && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Accumulation Ratio:</span>
                                                <span className="font-semibold">{accumulationRatio.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Peak/Trough Ratio:</span>
                                                <span className="font-semibold">
                                                    {Math.exp((0.693 / parseFloat(halfLife)) * (dosingInterval === 'custom' ? parseFloat(customInterval) || 12 : parseInt(dosingInterval.replace('q', '').replace('h', '')))).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dosing Strategy */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Dosing Strategy</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Frequency:</div>
                                    <div className="text-gray-600 mt-1">{getDosingFrequency(dosingInterval === 'custom' ? parseFloat(customInterval) || 12 : parseInt(dosingInterval.replace('q', '').replace('h', '')))}</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Timing:</div>
                                    <div className="text-gray-600 mt-1">Consistent intervals recommended</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Adjustments:</div>
                                    <div className="text-gray-600 mt-1">Based on therapeutic drug monitoring</div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Considerations */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Important Considerations
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Adjust for renal/hepatic impairment</li>
                                <li>• Consider drug interactions</li>
                                <li>• Monitor for efficacy and toxicity</li>
                                <li>• Loading dose may be needed initially</li>
                                <li>• Individualize based on patient factors</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Pharmacokinetic Principles */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Maintenance Dosing Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Steady State Concept</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Rate in = Rate out at steady state</p>
                                <p>• Achieved after 4-5 half-lives</p>
                                <p>• Independent of loading dose</p>
                                <p>• Maintenance dose replaces eliminated drug</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Accumulation</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• R = 1/(1 - e^(-k×τ))</p>
                                <p>• Depends on dosing interval relative to half-life</p>
                                <p>• Shorter interval = more accumulation</p>
                                <p>• Important for toxicity prediction</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Clinical Application</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Start with estimated dose</p>
                                <p>• Monitor concentrations at steady state</p>
                                <p>• Adjust based on therapeutic response</p>
                                <p>• Consider individual variability</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}