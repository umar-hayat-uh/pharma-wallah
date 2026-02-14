"use client";
import { useState, useEffect } from 'react';
import {
    Syringe,
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Target,
    Coffee,
    Scale,
    Droplets
} from 'lucide-react';

type RuleISF = '1500' | '1700' | '1800';
type RuleICR = '300' | '400' | '500';
type GlucoseUnit = 'mg/dL' | 'mmol/L';

export default function InsulinSensitivityCalculator() {
    const [totalDailyDose, setTotalDailyDose] = useState<string>('50');
    const [weight, setWeight] = useState<string>('');
    const [ruleISF, setRuleISF] = useState<RuleISF>('1800');
    const [ruleICR, setRuleICR] = useState<RuleICR>('500');
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');
    const [targetGlucose, setTargetGlucose] = useState<string>('120');
    const [currentGlucose, setCurrentGlucose] = useState<string>('200');
    const [carbIntake, setCarbIntake] = useState<string>('60');

    const [insulinSensitivityFactor, setInsulinSensitivityFactor] = useState<number | null>(null);
    const [insulinToCarbRatio, setInsulinToCarbRatio] = useState<number | null>(null);
    const [correctionDose, setCorrectionDose] = useState<number | null>(null);
    const [mealDose, setMealDose] = useState<number | null>(null);
    const [totalDose, setTotalDose] = useState<number | null>(null);

    // Conversion factor between mg/dL and mmol/L (18)
    const glucoseConversion = 18;

    const calculateISF = () => {
        const tdd = parseFloat(totalDailyDose);
        if (!isNaN(tdd) && tdd > 0) {
            const isf = parseInt(ruleISF) / tdd;
            setInsulinSensitivityFactor(isf);
        } else {
            setInsulinSensitivityFactor(null);
        }
    };

    const calculateICR = () => {
        const tdd = parseFloat(totalDailyDose);
        if (!isNaN(tdd) && tdd > 0) {
            const icr = parseInt(ruleICR) / tdd;
            setInsulinToCarbRatio(icr);
        } else {
            setInsulinToCarbRatio(null);
        }
    };

    const calculateCorrection = () => {
        if (insulinSensitivityFactor === null) return;
        const target = parseFloat(targetGlucose);
        const current = parseFloat(currentGlucose);
        if (!isNaN(target) && !isNaN(current)) {
            let diff = current - target;
            if (glucoseUnit === 'mmol/L') {
                diff *= glucoseConversion;
            }
            const dose = diff / insulinSensitivityFactor;
            setCorrectionDose(dose > 0 ? dose : 0);
        } else {
            setCorrectionDose(null);
        }
    };

    const calculateMeal = () => {
        if (insulinToCarbRatio === null) return;
        const carbs = parseFloat(carbIntake);
        if (!isNaN(carbs) && carbs > 0) {
            const dose = carbs / insulinToCarbRatio;
            setMealDose(dose);
        } else {
            setMealDose(null);
        }
    };

    useEffect(() => {
        if (correctionDose !== null && mealDose !== null) {
            setTotalDose(correctionDose + mealDose);
        } else if (correctionDose !== null) {
            setTotalDose(correctionDose);
        } else if (mealDose !== null) {
            setTotalDose(mealDose);
        } else {
            setTotalDose(null);
        }
    }, [correctionDose, mealDose]);

    const estimateTDDfromWeight = () => {
        const wt = parseFloat(weight);
        if (!isNaN(wt) && wt > 0) {
            // Common initial TDD estimate: 0.5 units/kg/day
            const estimated = wt * 0.5;
            setTotalDailyDose(estimated.toFixed(1));
        }
    };

    const resetCalculator = () => {
        setTotalDailyDose('50');
        setWeight('');
        setRuleISF('1800');
        setRuleICR('500');
        setGlucoseUnit('mg/dL');
        setTargetGlucose('120');
        setCurrentGlucose('200');
        setCarbIntake('60');
        setInsulinSensitivityFactor(null);
        setInsulinToCarbRatio(null);
        setCorrectionDose(null);
        setMealDose(null);
        setTotalDose(null);
    };

    // Sample patient profiles (based on medcentral typical cases)
    const samplePatients = [
        { name: 'Adult Type 1', tdd: '50', weight: '70', isfRule: '1800', icrRule: '500' },
        { name: 'Adolescent', tdd: '40', weight: '60', isfRule: '1700', icrRule: '400' },
        { name: 'Insulin Resistant', tdd: '100', weight: '100', isfRule: '1500', icrRule: '300' },
        { name: 'Elderly', tdd: '30', weight: '65', isfRule: '1800', icrRule: '500' },
        { name: 'Pediatric', tdd: '20', weight: '30', isfRule: '1800', icrRule: '500' },
    ];

    const loadSample = (index: number) => {
        const patient = samplePatients[index];
        setTotalDailyDose(patient.tdd);
        setWeight(patient.weight);
        setRuleISF(patient.isfRule as RuleISF);
        setRuleICR(patient.icrRule as RuleICR);
    };

    useEffect(() => {
        calculateISF();
        calculateICR();
    }, [totalDailyDose, ruleISF, ruleICR]);

    useEffect(() => {
        calculateCorrection();
    }, [insulinSensitivityFactor, targetGlucose, currentGlucose, glucoseUnit]);

    useEffect(() => {
        calculateMeal();
    }, [insulinToCarbRatio, carbIntake]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-rose-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Syringe className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Insulin Sensitivity Calculator</h1>
                                <p className="text-rose-100 mt-2">Based on MedCentral guidelines: ISF and ICR from Total Daily Dose</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Droplets className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Diabetes Management</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Patient Data & Rules
                            </h2>

                            <div className="space-y-6">
                                {/* TDD Input */}
                                <div className="bg-gradient-to-r from-blue-50 to-rose-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                                        Total Daily Dose (TDD) of Insulin
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                TDD (units/day)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={totalDailyDose}
                                                onChange={(e) => setTotalDailyDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500"
                                                placeholder="e.g., 50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Body Weight (kg) - optional
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    className="flex-1 px-4 py-3 border-2 border-rose-200 rounded-lg focus:border-rose-500"
                                                    placeholder="e.g., 70"
                                                />
                                                <button
                                                    onClick={estimateTDDfromWeight}
                                                    className="px-4 py-3 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"
                                                    title="Estimate TDD from weight (0.5 units/kg)"
                                                >
                                                    <Scale className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rule Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Insulin Sensitivity Factor (ISF) Rule
                                        </label>
                                        <div className="flex gap-2">
                                            {(['1500', '1700', '1800'] as RuleISF[]).map((rule) => (
                                                <button
                                                    key={rule}
                                                    onClick={() => setRuleISF(rule)}
                                                    className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${ruleISF === rule
                                                            ? 'bg-gradient-to-r from-blue-600 to-rose-400 text-white shadow'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {rule}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Rule: {ruleISF} ÷ TDD = mg/dL drop per unit
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Insulin-to-Carb Ratio (ICR) Rule
                                        </label>
                                        <div className="flex gap-2">
                                            {(['300', '400', '500'] as RuleICR[]).map((rule) => (
                                                <button
                                                    key={rule}
                                                    onClick={() => setRuleICR(rule)}
                                                    className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${ruleICR === rule
                                                            ? 'bg-gradient-to-r from-blue-600 to-rose-400 text-white shadow'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {rule}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Rule: {ruleICR} ÷ TDD = grams carbs per unit
                                        </p>
                                    </div>
                                </div>

                                {/* Glucose Units */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Glucose Units</h3>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="mg/dL"
                                                checked={glucoseUnit === 'mg/dL'}
                                                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                                className="mr-2"
                                            />
                                            mg/dL
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="mmol/L"
                                                checked={glucoseUnit === 'mmol/L'}
                                                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                                className="mr-2"
                                            />
                                            mmol/L
                                        </label>
                                    </div>
                                </div>

                                {/* Sample Patients */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Sample Patient Profiles</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {samplePatients.map((patient, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-blue-50 to-rose-50 hover:from-blue-100 hover:to-rose-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">{patient.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    TDD: {patient.tdd} U
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => { calculateISF(); calculateICR(); }}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-rose-400 hover:from-blue-700 hover:to-rose-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Sensitivity
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

                        {/* Correction and Meal Dosing */}
                        {(insulinSensitivityFactor !== null || insulinToCarbRatio !== null) && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Target className="w-6 h-6 mr-2" />
                                    Dosing Calculators
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Correction Dose */}
                                    <div className="bg-gradient-to-br from-blue-50 to-rose-50 rounded-xl p-5 border border-blue-200">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Correction Dose
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Target Glucose ({glucoseUnit})
                                                </label>
                                                <input
                                                    type="number"
                                                    value={targetGlucose}
                                                    onChange={(e) => setTargetGlucose(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Current Glucose ({glucoseUnit})
                                                </label>
                                                <input
                                                    type="number"
                                                    value={currentGlucose}
                                                    onChange={(e) => setCurrentGlucose(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg"
                                                />
                                            </div>
                                            {correctionDose !== null && (
                                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                                    <div className="text-sm text-gray-600">Recommended correction:</div>
                                                    <div className="text-2xl font-bold text-blue-700">{correctionDose.toFixed(1)} units</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meal Dose */}
                                    <div className="bg-gradient-to-br from-rose-50 to-blue-50 rounded-xl p-5 border border-rose-200">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Coffee className="w-5 h-5 mr-2 text-rose-600" />
                                            Meal Dose
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Carbohydrates (grams)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={carbIntake}
                                                    onChange={(e) => setCarbIntake(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg"
                                                />
                                            </div>
                                            {mealDose !== null && (
                                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                                    <div className="text-sm text-gray-600">Meal dose:</div>
                                                    <div className="text-2xl font-bold text-rose-700">{mealDose.toFixed(1)} units</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Total Dose */}
                                {totalDose !== null && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-rose-400 text-white rounded-xl">
                                        <div className="text-center">
                                            <div className="text-sm font-semibold">Total Insulin Dose (correction + meal)</div>
                                            <div className="text-4xl font-bold">{totalDose.toFixed(1)} units</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-rose-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Sensitivity Results
                            </h2>

                            <div className="space-y-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-blue-100 mb-1">Insulin Sensitivity Factor</div>
                                    {insulinSensitivityFactor !== null ? (
                                        <>
                                            <div className="text-3xl font-bold">{insulinSensitivityFactor.toFixed(1)}</div>
                                            <div className="text-lg">mg/dL per unit</div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-blue-100">Enter TDD</div>
                                    )}
                                </div>

                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-blue-100 mb-1">Insulin-to-Carb Ratio</div>
                                    {insulinToCarbRatio !== null ? (
                                        <>
                                            <div className="text-3xl font-bold">1 : {insulinToCarbRatio.toFixed(1)}</div>
                                            <div className="text-lg">grams per unit</div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-blue-100">Enter TDD</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Clinical Interpretation */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-rose-600" />
                                MedCentral Reference
                            </h3>
                            <p className="text-sm text-gray-600">
                                The 1800 rule (for rapid-acting insulin) and 500 rule are commonly used starting points. Adjust based on glucose patterns. Typical ISF ranges: sensitive {'>'} 50, average 30-50, resistant {'<'} 30 mg/dL/U.
                            </p>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-rose-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Rules</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span>ISF (rapid)</span><span>1800 / TDD</span></li>
                                <li className="flex justify-between"><span>ISF (regular)</span><span>1500 / TDD</span></li>
                                <li className="flex justify-between"><span>ICR</span><span>500 / TDD</span></li>
                                <li className="flex justify-between"><span>Initial TDD</span><span>0.5 U/kg/day</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}