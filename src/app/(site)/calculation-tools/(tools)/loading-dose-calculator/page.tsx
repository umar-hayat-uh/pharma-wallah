"use client";
import { useState, useEffect } from 'react';
import {
    Zap,
    Calculator,
    Activity,
    Target,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    PieChart,
    Shield
} from 'lucide-react';

type AdministrationRoute = 'iv' | 'im' | 'oral' | 'sc';

export default function LoadingDoseCalculator() {
    const [targetConcentration, setTargetConcentration] = useState<string>('10');
    const [volumeDistribution, setVolumeDistribution] = useState<string>('50');
    const [bioavailability, setBioavailability] = useState<string>('100');
    const [administrationRoute, setAdministrationRoute] = useState<AdministrationRoute>('iv');
    const [loadingDose, setLoadingDose] = useState<number | null>(null);
    const [correctedLoadingDose, setCorrectedLoadingDose] = useState<number | null>(null);
    const [patientWeight, setPatientWeight] = useState<string>('70');
    const [weightBased, setWeightBased] = useState<boolean>(true);

    const calculateLoadingDose = () => {
        const targetC = parseFloat(targetConcentration);
        const vd = parseFloat(volumeDistribution);
        const f = parseFloat(bioavailability) / 100;
        const weight = parseFloat(patientWeight);

        if (isNaN(targetC) || isNaN(vd) || vd <= 0) return;

        // Basic loading dose calculation
        let ld = targetC * vd;

        // Adjust for bioavailability if not IV
        if (administrationRoute !== 'iv' && !isNaN(f)) {
            ld /= f;
        }

        // Calculate weight-based dose
        let weightBasedDose = ld;
        if (weightBased && !isNaN(weight) && weight > 0) {
            // Calculate Vd per kg if total Vd is provided
            const vdPerKg = vd / weight;
            weightBasedDose = targetC * vdPerKg * weight;

            // Adjust for bioavailability
            if (administrationRoute !== 'iv' && !isNaN(f)) {
                weightBasedDose /= f;
            }
        }

        setLoadingDose(ld);
        setCorrectedLoadingDose(weightBasedDose);
    };

    const resetCalculator = () => {
        setTargetConcentration('10');
        setVolumeDistribution('50');
        setBioavailability('100');
        setAdministrationRoute('iv');
        setLoadingDose(null);
        setCorrectedLoadingDose(null);
        setPatientWeight('70');
    };

    const sampleDrugs = [
        {
            name: 'Digoxin',
            targetC: '1.5',
            vd: '440',
            f: '100',
            route: 'iv' as AdministrationRoute,
            weightBased: true,
            note: 'Therapeutic range: 0.8-2.0 mcg/L'
        },
        {
            name: 'Vancomycin',
            targetC: '20',
            vd: '0.7',
            f: '100',
            route: 'iv' as AdministrationRoute,
            weightBased: true,
            note: 'Based on actual body weight'
        },
        {
            name: 'Phenytoin',
            targetC: '15',
            vd: '0.65',
            f: '90',
            route: 'oral' as AdministrationRoute,
            weightBased: true,
            note: 'Non-linear kinetics'
        },
        {
            name: 'Amiodarone',
            targetC: '1',
            vd: '66',
            f: '50',
            route: 'iv' as AdministrationRoute,
            weightBased: true,
            note: 'Large Vd due to tissue binding'
        }
    ];

    const loadSample = (index: number) => {
        const drug = sampleDrugs[index];
        setTargetConcentration(drug.targetC);
        setVolumeDistribution(drug.vd);
        setBioavailability(drug.f);
        setAdministrationRoute(drug.route);
        setWeightBased(drug.weightBased);
    };

    const getDoseSafety = (dose: number) => {
        if (dose < 10) return 'Very small dose - verify calculations';
        if (dose > 1000) return 'Large dose - consider divided loading';
        if (dose > 5000) return 'Very large dose - verify Vd and target concentration';
        return 'Dose appears reasonable';
    };

    useEffect(() => {
        calculateLoadingDose();
    }, [targetConcentration, volumeDistribution, bioavailability, administrationRoute, patientWeight, weightBased]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Loading Dose Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate initial loading doses to rapidly achieve therapeutic concentrations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Target className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Rapid Onset</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Loading Dose Calculation
                            </h2>

                            {/* Route Selection */}
                            <div className="mb-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">Administration Route</label>
                                <div className="grid grid-cols-4 gap-3">
                                    <button
                                        onClick={() => setAdministrationRoute('iv')}
                                        className={`p-3 rounded-lg transition-all ${administrationRoute === 'iv' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        IV Bolus
                                    </button>
                                    <button
                                        onClick={() => setAdministrationRoute('im')}
                                        className={`p-3 rounded-lg transition-all ${administrationRoute === 'im' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        IM
                                    </button>
                                    <button
                                        onClick={() => setAdministrationRoute('oral')}
                                        className={`p-3 rounded-lg transition-all ${administrationRoute === 'oral' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Oral
                                    </button>
                                    <button
                                        onClick={() => setAdministrationRoute('sc')}
                                        className={`p-3 rounded-lg transition-all ${administrationRoute === 'sc' ?
                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        SC
                                    </button>
                                </div>
                            </div>

                            {/* Calculation Inputs */}
                            <div className="space-y-6">
                                {/* Target Concentration */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Target className="w-5 h-5 mr-2 text-blue-600" />
                                        Target Concentration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Desired Concentration Cₚ (mg/L)
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
                                                Therapeutic concentration at steady state
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                <div className="text-sm font-semibold text-gray-600">Typical Ranges</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Digoxin: 0.8-2.0 mcg/L<br />
                                                    Vancomycin: 15-20 mg/L<br />
                                                    Phenytoin: 10-20 mg/L
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Volume of Distribution */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                                        Volume of Distribution
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Vd (L)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={volumeDistribution}
                                                onChange={(e) => setVolumeDistribution(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                                                placeholder="e.g., 50"
                                            />
                                            <div className="text-xs text-gray-500 mt-2">
                                                Apparent volume of distribution
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Patient Weight (kg)
                                                </label>
                                                <button
                                                    onClick={() => setWeightBased(!weightBased)}
                                                    className={`px-3 py-1 rounded text-sm ${weightBased ?
                                                        'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {weightBased ? 'Weight-based' : 'Fixed'}
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={patientWeight}
                                                onChange={(e) => setPatientWeight(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                placeholder="e.g., 70"
                                                disabled={!weightBased}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bioavailability */}
                                {administrationRoute !== 'iv' && (
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                                            Bioavailability Adjustment
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                                                    placeholder="e.g., 80"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                                    <div className="text-sm font-semibold text-gray-600">Typical F values</div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        IV: 100%<br />
                                                        IM: 75-100%<br />
                                                        Oral: 0-100%<br />
                                                        SC: 70-95%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Formula Display */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Loading Dose Formula</h3>
                                    <div className="p-4 bg-white rounded-lg border border-gray-300">
                                        <div className="font-mono text-lg mb-2">
                                            LD = (Cₚ × Vd) ÷ F
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Where:<br />
                                            • Cₚ = Target plasma concentration<br />
                                            • Vd = Volume of distribution<br />
                                            • F = Bioavailability fraction (1 for IV)
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
                                                    Target: {drug.targetC} mg/L<br />
                                                    Vd: {drug.vd} L{drug.weightBased ? '/kg' : ''}<br />
                                                    Route: {drug.route.toUpperCase()}
                                                </div>
                                                <div className="text-xs text-blue-600 mt-2">{drug.note}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateLoadingDose}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Loading Dose
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
                        {/* Loading Dose Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Zap className="w-7 h-7 mr-3" />
                                Loading Dose
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        {administrationRoute.toUpperCase()} Loading Dose
                                    </div>
                                    {loadingDose !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {correctedLoadingDose?.toFixed(1) || loadingDose.toFixed(1)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                mg
                                            </div>
                                            {weightBased && (
                                                <div className="text-lg mt-2">
                                                    {(correctedLoadingDose! / parseFloat(patientWeight)).toFixed(2)} mg/kg
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Comparison to IV dose */}
                            {administrationRoute !== 'iv' && loadingDose && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">Equivalent IV Dose</div>
                                        <div className="text-xl font-bold">
                                            {(parseFloat(targetConcentration) * parseFloat(volumeDistribution)).toFixed(1)} mg
                                        </div>
                                        <div className="text-xs mt-1 text-blue-100">
                                            Without bioavailability adjustment
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Safety Assessment */}
                        {loadingDose !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                    Safety Assessment
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getDoseSafety(correctedLoadingDose || loadingDose)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Initial concentration:</span>
                                            <span className="font-semibold">{targetConcentration} mg/L</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Time to therapeutic:</span>
                                            <span className="font-semibold">Immediate (IV) or ~30 min (non-IV)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Administration Guidance */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Administration Guidance</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">IV Bolus:</div>
                                    <div className="text-gray-600 mt-1">Administer over 1-5 minutes</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Divided Loading:</div>
                                    <div className="text-gray-600 mt-1">For large doses or risk of toxicity</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Monitoring:</div>
                                    <div className="text-gray-600 mt-1">Check levels 30 min post-dose</div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Considerations */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                                Clinical Considerations
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Adjust for renal/hepatic impairment</li>
                                <li>• Consider protein binding changes</li>
                                <li>• Monitor for adverse effects</li>
                                <li>• Calculate maintenance dose separately</li>
                                <li>• Verify with therapeutic drug monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Advanced Concepts */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Advanced Loading Concepts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">Divided Loading</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• For drugs with long half-life</p>
                                <p>• Reduces toxicity risk</p>
                                <p>• Example: Digoxin 50% initial, then 25% q6-8h</p>
                                <p>• Allows assessment of response</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Non-Linear Kinetics</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Phenytoin, Theophylline</p>
                                <p>• Michaelis-Menten kinetics</p>
                                <p>• Small dose increases cause large Cₚ changes</p>
                                <p>• Requires careful titration</p>
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5">
                            <h3 className="font-bold text-purple-700 mb-3">Loading in Special Populations</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Elderly: Reduced Vd, increased sensitivity</p>
                                <p>• Obesity: Use adjusted body weight</p>
                                <p>• Renal failure: Reduced clearance</p>
                                <p>• Pediatrics: Different Vd/kg</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}