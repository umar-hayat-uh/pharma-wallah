"use client";
import { useState, useEffect } from 'react';
import { Syringe, Calculator, Activity, RefreshCw, AlertCircle, Target, Coffee, Scale, Droplets, Info, BookOpen, Heart } from 'lucide-react';

type RuleISF = '1500' | '1700' | '1800' | '2000' | '2200';
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
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const glucoseConversion = 18; // 1 mmol/L = 18 mg/dL

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
            if (glucoseUnit === 'mmol/L') diff *= glucoseConversion;
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
        calculateISF();
        calculateICR();
    }, [totalDailyDose, ruleISF, ruleICR]);

    useEffect(() => {
        calculateCorrection();
    }, [insulinSensitivityFactor, targetGlucose, currentGlucose, glucoseUnit]);

    useEffect(() => {
        calculateMeal();
    }, [insulinToCarbRatio, carbIntake]);

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
            const estimated = wt * 0.55; // standard initial factor 
            setTotalDailyDose(estimated.toFixed(1));
        }
    };

    const reset = () => {
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

    const samplePatients = [
        { name: 'Adult Type 1', tdd: '50', weight: '70', isfRule: '1800', icrRule: '500' },
        { name: 'Adolescent', tdd: '40', weight: '60', isfRule: '1700', icrRule: '400' },
        { name: 'Insulin Resistant', tdd: '100', weight: '100', isfRule: '1500', icrRule: '300' },
        { name: 'Elderly', tdd: '30', weight: '65', isfRule: '2000', icrRule: '500' },
        { name: 'Very Sensitive', tdd: '20', weight: '50', isfRule: '2200', icrRule: '500' },
    ];

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setTotalDailyDose(p.tdd);
        setWeight(p.weight);
        setRuleISF(p.isfRule as RuleISF);
        setRuleICR(p.icrRule as RuleICR);
    };

    const isfInterpretation = (isf: number): string => {
        if (isf > 50) return 'Very sensitive';
        if (isf > 30) return 'Average';
        if (isf > 15) return 'Moderately resistant';
        return 'Highly resistant';
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header – reference gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Syringe className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Insulin Sensitivity Calculator</h1>
                                <p className="text-blue-100 mt-2">ISF = Rule ÷ TDD · ICR = Rule ÷ TDD </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Heart className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Diabetes Management</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column – Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Patient Data & Rules
                            </h2>

                            {/* TDD Input */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                                    Total Daily Dose (TDD)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            TDD (units/day)
                                        </label>
                                        <input type="number" step="1" value={totalDailyDose}
                                            onChange={(e) => setTotalDailyDose(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500"
                                            placeholder="e.g., 50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Body weight (kg) – optional
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" step="0.1" value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-green-200 rounded-lg"
                                                placeholder="e.g., 70" />
                                            <button onClick={estimateTDDfromWeight}
                                                className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                                title="Estimate TDD from weight (0.55 units/kg) ">
                                                <Scale className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    TDD = basal + bolus insulin over 24 h. Weight‑based estimate ~0.55 units/kg .
                                </p>
                            </div>

                            {/* Rule Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Insulin Sensitivity Factor (ISF) Rule
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['1500', '1700', '1800', '2000', '2200'] as RuleISF[]).map((rule) => (
                                            <button key={rule} onClick={() => setRuleISF(rule)}
                                                className={`flex-1 py-2 px-1 rounded-lg text-sm font-semibold transition-all ${
                                                    ruleISF === rule
                                                        ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}>
                                                {rule}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ISF = {ruleISF} ÷ TDD (mg/dL per unit) .
                                        Higher rule = more sensitive.
                                    </p>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Insulin‑to‑Carb Ratio (ICR) Rule
                                    </label>
                                    <div className="flex gap-2">
                                        {(['300', '400', '500'] as RuleICR[]).map((rule) => (
                                            <button key={rule} onClick={() => setRuleICR(rule)}
                                                className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                                                    ruleICR === rule
                                                        ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}>
                                                {rule}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        ICR = {ruleICR} ÷ TDD (grams carb per unit) .
                                        500 for rapid‑acting, 450 for regular.
                                    </p>
                                </div>
                            </div>

                            {/* Glucose Units */}
                            <div className="bg-gray-50 rounded-xl p-4 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Glucose Units</h3>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" value="mg/dL" checked={glucoseUnit === 'mg/dL'}
                                            onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                            className="mr-2" />
                                        mg/dL
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" value="mmol/L" checked={glucoseUnit === 'mmol/L'}
                                            onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                            className="mr-2" />
                                        mmol/L
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">For mmol/L, ISF values are divided by 18.</p>
                            </div>

                            {/* Sample Patients */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Example Profiles</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.name}</div>
                                            <div>TDD {p.tdd} U</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={() => { calculateISF(); calculateICR(); }}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg">
                                    Calculate Sensitivity
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Correction & Meal Dosing */}
                        {(insulinSensitivityFactor !== null || insulinToCarbRatio !== null) && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Target className="w-6 h-6 mr-2 text-green-600" />
                                    Dosing Calculators
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Correction Dose */}
                                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 border border-blue-200">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Target className="w-5 h-5 mr-2 text-blue-600" />
                                            Correction Dose
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Target Glucose ({glucoseUnit})
                                                </label>
                                                <input type="number" value={targetGlucose}
                                                    onChange={(e) => setTargetGlucose(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Current Glucose ({glucoseUnit})
                                                </label>
                                                <input type="number" value={currentGlucose}
                                                    onChange={(e) => setCurrentGlucose(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg" />
                                            </div>
                                            {correctionDose !== null && (
                                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                                    <div className="text-sm text-gray-600">Correction:</div>
                                                    <div className="text-2xl font-bold text-blue-700">{correctionDose.toFixed(1)} units</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meal Dose */}
                                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
                                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <Coffee className="w-5 h-5 mr-2 text-green-600" />
                                            Meal Dose
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Carbohydrates (grams)
                                                </label>
                                                <input type="number" value={carbIntake}
                                                    onChange={(e) => setCarbIntake(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-green-200 rounded-lg" />
                                            </div>
                                            {mealDose !== null && (
                                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                                    <div className="text-sm text-gray-600">Meal dose:</div>
                                                    <div className="text-2xl font-bold text-green-700">{mealDose.toFixed(1)} units</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {totalDose !== null && (
                                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl">
                                        <div className="text-center">
                                            <div className="text-sm font-semibold">Total Insulin Dose (correction + meal)</div>
                                            <div className="text-4xl font-bold">{totalDose.toFixed(1)} units</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Detailed Information Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Insulin Sensitivity
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">ISF (1800 rule):</span> 1 unit lowers glucose by 1800/TDD mg/dL .</p>
                                    <p><span className="font-semibold">ICR (500 rule):</span> 1 unit covers 500/TDD grams carb .</p>
                                    <p><span className="font-semibold">1500 rule</span> for regular insulin; <span className="font-semibold">2200 rule</span> for very sensitive patients .</p>
                                    <p><span className="font-semibold">Weight‑based TDD:</span> 0.4–1.0 units/kg depending on resistance .</p>
                                    <p><span className="font-semibold">Clinical categories:</span> ISF &gt;50 = sensitive, 30–50 = average, 15–30 = resistant, &lt;15 = very resistant .</p>
                                    <p className="text-xs text-gray-500 italic">Sources: UC Davis , Iowa , RCH , FPnotebook , MedCentral .</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column – Results & Reference */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Sensitivity Results
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-sm font-semibold text-blue-100">Insulin Sensitivity Factor</div>
                                    {insulinSensitivityFactor !== null ? (
                                        <>
                                            <div className="text-3xl font-bold">{insulinSensitivityFactor.toFixed(1)}</div>
                                            <div className="text-lg">mg/dL per unit</div>
                                            <div className="text-sm mt-1 text-green-100">{isfInterpretation(insulinSensitivityFactor)}</div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold">Enter TDD</div>
                                    )}
                                </div>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-sm font-semibold text-blue-100">Insulin‑to‑Carb Ratio</div>
                                    {insulinToCarbRatio !== null ? (
                                        <>
                                            <div className="text-3xl font-bold">1 : {insulinToCarbRatio.toFixed(1)}</div>
                                            <div className="text-lg">grams per unit</div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold">Enter TDD</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                                Quick Reference
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span>ISF (rapid)</span><span>1800 / TDD</span></div>
                                <div className="flex justify-between"><span>ISF (regular)</span><span>1500 / TDD</span></div>
                                <div className="flex justify-between"><span>ICR</span><span>500 / TDD</span></div>
                                <div className="flex justify-between"><span>Initial TDD</span><span>0.55 × weight (kg) </span></div>
                                <div className="flex justify-between mt-3"><span>Sensitive</span><span>ISF &gt;50</span></div>
                                <div className="flex justify-between"><span>Average</span><span>ISF 30–50</span></div>
                                <div className="flex justify-between"><span>Resistant</span><span>ISF &lt;30</span></div>
                            </div>
                        </div>

                        {/* Physiology */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Physiology </h3>
                            <p className="text-sm">
                                Insulin sensitivity is affected by age, weight, physical activity, illness, and medications.
                                Always adjust based on glucose patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}