"use client";
import { useState, useEffect } from 'react';
import {
    Scale,
    Calculator,
    TrendingUp,
    BarChart,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Percent,
    Zap
} from 'lucide-react';

export default function BioequivalenceCalculator() {
    const [testAUC, setTestAUC] = useState<string>('85');
    const [testAUC_SD, setTestAUC_SD] = useState<string>('15');
    const [referenceAUC, setReferenceAUC] = useState<string>('100');
    const [referenceAUC_SD, setReferenceAUC_SD] = useState<string>('12');
    const [testCmax, setTestCmax] = useState<string>('25');
    const [testCmax_SD, setTestCmax_SD] = useState<string>('4');
    const [referenceCmax, setReferenceCmax] = useState<string>('30');
    const [referenceCmax_SD, setReferenceCmax_SD] = useState<string>('5');
    const [sampleSize, setSampleSize] = useState<string>('24');
    const [alpha, setAlpha] = useState<string>('0.05');
    const [confidenceInterval, setConfidenceInterval] = useState<[number, number] | null>(null);
    const [cmaxCI, setCmaxCI] = useState<[number, number] | null>(null);
    const [isBioequivalent, setIsBioequivalent] = useState<boolean | null>(null);

    const calculateBioequivalence = () => {
        // Calculate geometric mean ratio and confidence interval
        const testAUCVal = parseFloat(testAUC);
        const refAUCVal = parseFloat(referenceAUC);
        const testAUC_SDVal = parseFloat(testAUC_SD);
        const refAUC_SDVal = parseFloat(referenceAUC_SD);
        const n = parseFloat(sampleSize);
        const alphaVal = parseFloat(alpha);

        if (isNaN(testAUCVal) || isNaN(refAUCVal) || n <= 0) return;

        // Calculate ratio (Test/Reference)
        const ratio = testAUCVal / refAUCVal;

        // Simplified confidence interval calculation (in reality, this uses log-transformed data)
        const se = Math.sqrt(
            (Math.pow(testAUC_SDVal, 2) / testAUCVal) +
            (Math.pow(refAUC_SDVal, 2) / refAUCVal)
        ) / Math.sqrt(n);

        const tValue = 2.064; // Approximate t-value for 90% CI with n=24
        const lowerCI = ratio - tValue * se;
        const upperCI = ratio + tValue * se;

        setConfidenceInterval([lowerCI * 100, upperCI * 100]);

        // Calculate Cmax CI (simplified)
        const testCmaxVal = parseFloat(testCmax);
        const refCmaxVal = parseFloat(referenceCmax);
        const testCmax_SDVal = parseFloat(testCmax_SD);
        const refCmax_SDVal = parseFloat(referenceCmax_SD);

        let cmaxLowerCI = 0;
        let cmaxUpperCI = 0;

        if (!isNaN(testCmaxVal) && !isNaN(refCmaxVal)) {
            const cmaxRatio = testCmaxVal / refCmaxVal;
            const cmaxSE = Math.sqrt(
                (Math.pow(testCmax_SDVal, 2) / testCmaxVal) +
                (Math.pow(refCmax_SDVal, 2) / refCmaxVal)
            ) / Math.sqrt(n);

            cmaxLowerCI = cmaxRatio - tValue * cmaxSE;
            cmaxUpperCI = cmaxRatio + tValue * cmaxSE;
            setCmaxCI([cmaxLowerCI * 100, cmaxUpperCI * 100]);
        }

        // Check bioequivalence criteria (80-125%)
        const isAUCBioequivalent = lowerCI >= 0.8 && upperCI <= 1.25;
        const isCmaxBioequivalent = cmaxCI ? cmaxLowerCI >= 0.8 && cmaxUpperCI <= 1.25 : true;

        setIsBioequivalent(isAUCBioequivalent && isCmaxBioequivalent);
    };

    const resetCalculator = () => {
        setTestAUC('85');
        setTestAUC_SD('15');
        setReferenceAUC('100');
        setReferenceAUC_SD('12');
        setTestCmax('25');
        setTestCmax_SD('4');
        setReferenceCmax('30');
        setReferenceCmax_SD('5');
        setSampleSize('24');
        setAlpha('0.05');
        setConfidenceInterval(null);
        setCmaxCI(null);
        setIsBioequivalent(null);
    };

    const sampleStudies = [
        {
            name: 'Generic Drug A',
            testAUC: '95', testSD: '12',
            refAUC: '100', refSD: '10',
            testCmax: '28', testCmaxSD: '3',
            refCmax: '30', refCmaxSD: '4',
            n: '24'
        },
        {
            name: 'Modified Release',
            testAUC: '105', testSD: '18',
            refAUC: '100', refSD: '15',
            testCmax: '22', testCmaxSD: '4',
            refCmax: '30', refCmaxSD: '5',
            n: '36'
        },
        {
            name: 'Different Salt',
            testAUC: '88', testSD: '20',
            refAUC: '100', refSD: '18',
            testCmax: '26', testCmaxSD: '5',
            refCmax: '30', refCmaxSD: '6',
            n: '48'
        }
    ];

    const loadSample = (index: number) => {
        const study = sampleStudies[index];
        setTestAUC(study.testAUC);
        setTestAUC_SD(study.testSD);
        setReferenceAUC(study.refAUC);
        setReferenceAUC_SD(study.refSD);
        setTestCmax(study.testCmax);
        setTestCmax_SD(study.testCmaxSD);
        setReferenceCmax(study.refCmax);
        setReferenceCmax_SD(study.refCmaxSD);
        setSampleSize(study.n);
    };

    const getBioequivalenceStatus = (lower: number, upper: number) => {
        if (lower >= 80 && upper <= 125) return 'Bioequivalent';
        if (lower < 80 && upper > 125) return 'Variable - More data needed';
        if (upper < 80) return 'Underperforming';
        if (lower > 125) return 'Overperforming';
        return 'Not Bioequivalent';
    };

    useEffect(() => {
        calculateBioequivalence();
    }, [testAUC, referenceAUC, testAUC_SD, referenceAUC_SD, sampleSize, alpha]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Bioequivalence Calculator</h1>
                                <p className="text-blue-100 mt-2">Assess bioequivalence using 90% confidence intervals</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Regulatory Assessment</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Bioequivalence Parameters
                            </h2>

                            {/* Study Design */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Study Design</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Sample Size (N)
                                        </label>
                                        <input
                                            type="number"
                                            value={sampleSize}
                                            onChange={(e) => setSampleSize(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 24"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Alpha (α)
                                        </label>
                                        <select
                                            value={alpha}
                                            onChange={(e) => setAlpha(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="0.05">0.05 (90% CI)</option>
                                            <option value="0.1">0.10 (80% CI)</option>
                                            <option value="0.01">0.01 (98% CI)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="bg-white p-4 rounded-lg border border-gray-300 w-full">
                                            <div className="text-sm font-semibold text-gray-600">Power</div>
                                            <div className="text-lg font-bold text-blue-600">
                                                {parseInt(sampleSize) >= 24 ? '≥80%' : 'Insufficient'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AUC Parameters */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                    AUC Parameters (Primary Endpoint)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Test Formulation */}
                                    <div>
                                        <h4 className="font-semibold text-blue-700 mb-3">Test Formulation</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Mean AUC (mg·h/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={testAUC}
                                                    onChange={(e) => setTestAUC(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Standard Deviation
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={testAUC_SD}
                                                    onChange={(e) => setTestAUC_SD(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reference Formulation */}
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-3">Reference Formulation</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Mean AUC (mg·h/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={referenceAUC}
                                                    onChange={(e) => setReferenceAUC(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Standard Deviation
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={referenceAUC_SD}
                                                    onChange={(e) => setReferenceAUC_SD(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cmax Parameters */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                                    Cmax Parameters (Secondary Endpoint)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Test Formulation */}
                                    <div>
                                        <h4 className="font-semibold text-purple-700 mb-3">Test Formulation</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Mean Cmax (mg/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={testCmax}
                                                    onChange={(e) => setTestCmax(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Standard Deviation
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={testCmax_SD}
                                                    onChange={(e) => setTestCmax_SD(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reference Formulation */}
                                    <div>
                                        <h4 className="font-semibold text-pink-700 mb-3">Reference Formulation</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Mean Cmax (mg/L)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={referenceCmax}
                                                    onChange={(e) => setReferenceCmax(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Standard Deviation
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={referenceCmax_SD}
                                                    onChange={(e) => setReferenceCmax_SD(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Studies */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Example Studies</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {sampleStudies.map((study, index) => (
                                        <button
                                            key={index}
                                            onClick={() => loadSample(index)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-4 text-left transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-blue-700">{study.name}</div>
                                            <div className="text-xs text-gray-600 mt-2">
                                                Test: {study.testAUC}±{study.testSD} | Ref: {study.refAUC}±{study.refSD}
                                            </div>
                                            <div className="text-xs text-gray-600">N={study.n}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={calculateBioequivalence}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Assess Bioequivalence
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
                        {/* Bioequivalence Result */}
                        <div className={`rounded-2xl shadow-xl p-6 md:p-8 text-white ${isBioequivalent === true ? 'bg-gradient-to-br from-green-600 to-green-400' :
                                isBioequivalent === false ? 'bg-gradient-to-br from-red-600 to-red-400' :
                                    'bg-gradient-to-br from-blue-600 to-green-400'
                            }`}>
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Scale className="w-7 h-7 mr-3" />
                                Bioequivalence Result
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    {isBioequivalent !== null ? (
                                        <>
                                            <div className="text-4xl font-bold mb-4">
                                                {isBioequivalent ? 'BIOEQUIVALENT' : 'NOT BIOEQUIVALENT'}
                                            </div>
                                            <div className="flex items-center justify-center text-2xl mb-2">
                                                {isBioequivalent ?
                                                    <CheckCircle className="w-8 h-8 mr-2" /> :
                                                    <XCircle className="w-8 h-8 mr-2" />
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold">
                                            Enter Study Data
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ratio */}
                            {confidenceInterval && (
                                <div className="bg-white/10 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">AUC Ratio (Test/Reference)</div>
                                        <div className="text-2xl font-bold">
                                            {((parseFloat(testAUC) / parseFloat(referenceAUC)) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confidence Intervals */}
                        {confidenceInterval && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">90% Confidence Intervals</h3>

                                {/* AUC CI */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-blue-700">AUC</span>
                                        <span className={`font-bold ${confidenceInterval[0] >= 80 && confidenceInterval[1] <= 125 ?
                                                'text-green-600' : 'text-red-600'
                                            }`}>
                                            {getBioequivalenceStatus(confidenceInterval[0], confidenceInterval[1])}
                                        </span>
                                    </div>
                                    <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                                        <div className="absolute inset-0 flex items-center">
                                            {/* Scale markers */}
                                            <div className="absolute left-0 w-full h-1 bg-gray-300"></div>
                                            {[70, 80, 100, 125, 130].map((pos) => (
                                                <div key={pos} className="absolute flex flex-col items-center"
                                                    style={{ left: `${((pos - 70) / (130 - 70)) * 100}%` }}>
                                                    <div className="h-3 w-px bg-gray-400"></div>
                                                    <div className="text-xs mt-1">{pos}%</div>
                                                </div>
                                            ))}

                                            {/* Acceptable range */}
                                            <div className="absolute h-12 bg-green-200 opacity-30"
                                                style={{ left: '14.3%', width: '42.9%' }}></div>

                                            {/* Confidence interval bar */}
                                            <div className="absolute h-6 bg-gradient-to-r from-blue-400 to-green-400 rounded"
                                                style={{
                                                    left: `${((confidenceInterval[0] - 70) / (130 - 70)) * 100}%`,
                                                    width: `${((confidenceInterval[1] - confidenceInterval[0]) / (130 - 70)) * 100}%`
                                                }}>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-xs font-bold text-white">
                                                        {confidenceInterval[0].toFixed(1)}-{confidenceInterval[1].toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cmax CI */}
                                {cmaxCI && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-purple-700">Cmax</span>
                                            <span className={`font-bold ${cmaxCI[0] >= 80 && cmaxCI[1] <= 125 ?
                                                    'text-green-600' : 'text-red-600'
                                                }`}>
                                                {getBioequivalenceStatus(cmaxCI[0], cmaxCI[1])}
                                            </span>
                                        </div>
                                        <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                                            <div className="absolute inset-0 flex items-center">
                                                {/* Scale markers */}
                                                <div className="absolute left-0 w-full h-1 bg-gray-300"></div>
                                                {[70, 80, 100, 125, 130].map((pos) => (
                                                    <div key={pos} className="absolute flex flex-col items-center"
                                                        style={{ left: `${((pos - 70) / (130 - 70)) * 100}%` }}>
                                                        <div className="h-3 w-px bg-gray-400"></div>
                                                        <div className="text-xs mt-1">{pos}%</div>
                                                    </div>
                                                ))}

                                                {/* Acceptable range */}
                                                <div className="absolute h-12 bg-green-200 opacity-30"
                                                    style={{ left: '14.3%', width: '42.9%' }}></div>

                                                {/* Confidence interval bar */}
                                                <div className="absolute h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded"
                                                    style={{
                                                        left: `${((cmaxCI[0] - 70) / (130 - 70)) * 100}%`,
                                                        width: `${((cmaxCI[1] - cmaxCI[0]) / (130 - 70)) * 100}%`
                                                    }}>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-xs font-bold text-white">
                                                            {cmaxCI[0].toFixed(1)}-{cmaxCI[1].toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Criteria Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Bioequivalence Criteria</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Primary Endpoint (AUC)</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        90% CI must fall within 80-125%
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Secondary Endpoint (Cmax)</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        90% CI should be within 80-125%
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700">Study Design</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Randomized, crossover, fasting/fed as appropriate
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Regulatory Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Regulatory Requirements
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• FDA: 90% CI of AUC and Cmax within 80-125%</li>
                                <li>• EMA: Same as FDA for immediate release</li>
                                <li>• Tmax: No formal limits but should be comparable</li>
                                <li>• Highly variable drugs: widened acceptance limits</li>
                                <li>• Narrow therapeutic index: stricter criteria</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Statistical Methods */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Statistical Methods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h3 className="font-bold text-blue-700 mb-3">ANOVA for Bioequivalence</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Log-transform AUC and Cmax data</p>
                                <p>• Two-period, two-sequence crossover design</p>
                                <p>• Sequence, period, and treatment effects</p>
                                <p>• Subject effects as random</p>
                                <p>• Calculate geometric mean ratio</p>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5">
                            <h3 className="font-bold text-green-700 mb-3">Acceptance Criteria</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• 90% CI of ratio within 80-125%</p>
                                <p>• Powered to detect 20% difference</p>
                                <p>• At least 80% statistical power</p>
                                <p>• Balanced design with adequate washout</p>
                                <p>• Valid analytical method</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}