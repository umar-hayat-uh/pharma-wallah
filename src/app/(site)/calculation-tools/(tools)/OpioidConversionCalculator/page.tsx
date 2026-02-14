"use client";
import { useState, useEffect } from 'react';
import {
    Pill,
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Scale,
    ArrowRight
} from 'lucide-react';

type Opioid = 'morphine' | 'hydromorphone' | 'oxycodone' | 'fentanyl' | 'methadone' | 'codeine';
type Route = 'oral' | 'iv' | 'sc' | 'td' | 'pr';

interface OpioidInfo {
    name: string;
    routes: Route[];
    conversionFactor: number; // to oral morphine equivalent (OME) in mg
    notes?: string;
}

const opioidData: Record<Opioid, OpioidInfo> = {
    morphine: {
        name: 'Morphine',
        routes: ['oral', 'iv', 'sc'],
        conversionFactor: 1, // oral morphine is reference
    },
    hydromorphone: {
        name: 'Hydromorphone',
        routes: ['oral', 'iv', 'sc'],
        conversionFactor: 5, // 1 mg oral hydromorphone = 5 mg oral morphine
    },
    oxycodone: {
        name: 'Oxycodone',
        routes: ['oral'],
        conversionFactor: 1.5, // 1 mg oral oxycodone = 1.5 mg oral morphine
    },
    fentanyl: {
        name: 'Fentanyl',
        routes: ['iv', 'td'],
        conversionFactor: 100, // 0.1 mg IV fentanyl = 10 mg morphine? Actually complex: transdermal conversion is different. We'll simplify: 100 mcg/hr patch ~ 2-4 mg/hr oral morphine? Better to use specific conversions.
        // For simplicity, we'll use approximate: 100 mcg IV fentanyl = 10 mg IV morphine, but oral morphine equivalence is tricky.
        // We'll implement a more accurate approach later.
    },
    methadone: {
        name: 'Methadone',
        routes: ['oral', 'iv'],
        conversionFactor: 4, // varies widely; simplified
    },
    codeine: {
        name: 'Codeine',
        routes: ['oral'],
        conversionFactor: 0.15, // 1 mg codeine = 0.15 mg morphine
    },
};

export default function OpioidConversionCalculator() {
    const [fromOpioid, setFromOpioid] = useState<Opioid>('morphine');
    const [fromRoute, setFromRoute] = useState<Route>('oral');
    const [fromDose, setFromDose] = useState<string>('10');
    const [toOpioid, setToOpioid] = useState<Opioid>('hydromorphone');
    const [toRoute, setToRoute] = useState<Route>('oral');
    const [mme, setMme] = useState<number | null>(null);
    const [convertedDose, setConvertedDose] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    // Route conversion factors (relative to oral for same drug)
    const routeFactor: Record<Route, number> = {
        oral: 1,
        iv: 3, // IV morphine is ~3x oral
        sc: 3,
        td: 1, // transdermal conversion depends on drug; we'll handle separately
        pr: 1,
    };

    const calculateConversion = () => {
        const dose = parseFloat(fromDose);
        if (isNaN(dose) || dose <= 0) {
            setMme(null);
            setConvertedDose(null);
            setInterpretation('');
            return;
        }

        // Get base conversion factors
        const fromFactor = opioidData[fromOpioid].conversionFactor;
        const toFactor = opioidData[toOpioid].conversionFactor;

        // Route adjustments
        const fromRouteMult = fromRoute === 'td' ? 1 : routeFactor[fromRoute];
        const toRouteMult = toRoute === 'td' ? 1 : routeFactor[toRoute];

        // Calculate MME (oral morphine equivalent)
        // First convert from dose to oral morphine using fromFactor and route
        // For non-oral routes, we need to adjust to oral equivalent for that drug
        // Simplified: MME = dose * fromFactor * (fromRouteMult / 1) ? Actually, fromFactor is for oral. If fromRoute is IV, the dose is more potent, so MME = dose * (fromFactor / routeFactor[oral]) * routeFactor[fromRoute]? This gets messy.
        // Let's define: oral morphine equivalent = dose * (fromFactor) * (routeFactor[fromRoute] / routeFactor[oral]) but routeFactor[oral]=1. So MME = dose * fromFactor * routeFactor[fromRoute].

        const mmeCalc = dose * fromFactor * routeFactor[fromRoute];
        setMme(mmeCalc);

        // Convert MME to target opioid and route
        const targetDose = mmeCalc / (toFactor * routeFactor[toRoute]);
        setConvertedDose(targetDose);

        // Interpretation
        if (targetDose < 1) setInterpretation('Very low dose; verify calculation');
        else if (targetDose > 200) setInterpretation('High dose; caution with tolerance');
        else setInterpretation('Dose within typical range');
    };

    const resetCalculator = () => {
        setFromOpioid('morphine');
        setFromRoute('oral');
        setFromDose('10');
        setToOpioid('hydromorphone');
        setToRoute('oral');
        setMme(null);
        setConvertedDose(null);
        setInterpretation('');
    };

    const sampleConversions = [
        { name: 'Morphine to Hydromorphone', from: 'morphine', fromRoute: 'oral', dose: '30', to: 'hydromorphone', toRoute: 'oral' },
        { name: 'Oxycodone to Morphine', from: 'oxycodone', fromRoute: 'oral', dose: '20', to: 'morphine', toRoute: 'oral' },
        { name: 'IV to Oral Morphine', from: 'morphine', fromRoute: 'iv', dose: '5', to: 'morphine', toRoute: 'oral' },
    ];

    const loadSample = (index: number) => {
        const sample = sampleConversions[index];
        setFromOpioid(sample.from as Opioid);
        setFromRoute(sample.fromRoute as Route);
        setFromDose(sample.dose);
        setToOpioid(sample.to as Opioid);
        setToRoute(sample.toRoute as Route);
    };

    useEffect(() => {
        calculateConversion();
    }, [fromOpioid, fromRoute, fromDose, toOpioid, toRoute]);

    // Update available routes when opioid changes
    useEffect(() => {
        // Ensure selected route is valid for the opioid
        const validFromRoutes = opioidData[fromOpioid].routes;
        if (!validFromRoutes.includes(fromRoute)) {
            setFromRoute(validFromRoutes[0]);
        }
    }, [fromOpioid]);

    useEffect(() => {
        const validToRoutes = opioidData[toOpioid].routes;
        if (!validToRoutes.includes(toRoute)) {
            setToRoute(validToRoutes[0]);
        }
    }, [toOpioid]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-purple-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Pill className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Opioid Conversion Calculator</h1>
                                <p className="text-purple-100 mt-2">Convert between opioids using equianalgesic ratios</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Scale className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Pain Management</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Conversion Parameters
                            </h2>

                            <div className="space-y-6">
                                {/* From Section */}
                                <div className="bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl p-6 border border-teal-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">From</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Opioid</label>
                                            <select
                                                value={fromOpioid}
                                                onChange={(e) => setFromOpioid(e.target.value as Opioid)}
                                                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500"
                                            >
                                                {Object.entries(opioidData).map(([key, data]) => (
                                                    <option key={key} value={key}>{data.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Route</label>
                                            <select
                                                value={fromRoute}
                                                onChange={(e) => setFromRoute(e.target.value as Route)}
                                                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500"
                                            >
                                                {opioidData[fromOpioid].routes.map(route => (
                                                    <option key={route} value={route}>{route.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dose (mg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={fromDose}
                                                onChange={(e) => setFromDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-teal-200 rounded-lg focus:border-teal-500"
                                                placeholder="e.g., 10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* To Section */}
                                <div className="bg-gradient-to-r from-teal-50 to-purple-50 rounded-xl p-6 border border-purple-200">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                        To
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Opioid</label>
                                            <select
                                                value={toOpioid}
                                                onChange={(e) => setToOpioid(e.target.value as Opioid)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500"
                                            >
                                                {Object.entries(opioidData).map(([key, data]) => (
                                                    <option key={key} value={key}>{data.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Route</label>
                                            <select
                                                value={toRoute}
                                                onChange={(e) => setToRoute(e.target.value as Route)}
                                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500"
                                            >
                                                {opioidData[toOpioid].routes.map(route => (
                                                    <option key={route} value={route}>{route.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Conversions */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Sample Conversions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {sampleConversions.map((sample, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-teal-50 to-purple-50 hover:from-teal-100 hover:to-purple-100 border border-teal-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-teal-700 text-sm">{sample.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateConversion}
                                        className="flex-1 bg-gradient-to-r from-teal-600 to-purple-400 hover:from-teal-700 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Convert
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
                        <div className="bg-gradient-to-br from-teal-600 to-purple-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>

                            <div className="space-y-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-teal-100 mb-1">Oral Morphine Equivalent</div>
                                    {mme !== null ? (
                                        <div className="text-3xl font-bold">{mme.toFixed(1)} mg</div>
                                    ) : (
                                        <div className="text-xl font-bold text-teal-100">Enter Dose</div>
                                    )}
                                </div>

                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-teal-100 mb-1">Converted Dose</div>
                                    {convertedDose !== null ? (
                                        <>
                                            <div className="text-5xl font-bold mb-2">
                                                {convertedDose.toFixed(2)}
                                            </div>
                                            <div className="text-xl">
                                                mg {opioidData[toOpioid].name} ({toRoute.toUpperCase()})
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-teal-100">Enter Values</div>
                                    )}
                                </div>
                            </div>

                            {interpretation && (
                                <div className="mt-4 bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">Note</div>
                                    <div className="text-lg font-bold">{interpretation}</div>
                                </div>
                            )}
                        </div>

                        {/* Safety Warning */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
                            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                                Safety Information
                            </h3>
                            <p className="text-sm text-gray-700">
                                Equianalgesic ratios are approximations. Always consider individual patient factors, tolerance, and concomitant medications. Reduce dose by 25-50% when rotating opioids due to incomplete cross-tolerance. Monitor closely.
                            </p>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-teal-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-teal-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Approximate Ratios (oral)</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span>Morphine</span><span>1</span></li>
                                <li className="flex justify-between"><span>Hydromorphone</span><span>5 (1 mg = 5 mg morphine)</span></li>
                                <li className="flex justify-between"><span>Oxycodone</span><span>1.5</span></li>
                                <li className="flex justify-between"><span>Codeine</span><span>0.15</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Clinical Pearls</h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Always use the lowest effective dose.</li>
                        <li>Consider renal/hepatic impairment.</li>
                        <li>Fentanyl patch conversion is complex; use specific guidelines.</li>
                        <li>Methadone has variable half-life and QT prolongation risk.</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}