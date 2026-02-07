"use client";
import { useState } from 'react';
import { Heart, AlertTriangle, Activity, TrendingUp, Shield, Droplet, Thermometer, Clock } from 'lucide-react';

export default function AnticoagulationRiskCalculator() {
    const [tool, setTool] = useState<'chads' | 'hasbled'>('chads');
    const [chadsFactors, setChadsFactors] = useState({
        chf: false,
        hypertension: false,
        ageOver75: false,
        diabetes: false,
        strokeTIA: false,
        vascularDisease: false,
        age65to74: false,
        female: false
    });
    const [hasbledFactors, setHasbledFactors] = useState({
        hypertension: false,
        abnormalRenal: false,
        abnormalLiver: false,
        stroke: false,
        bleeding: false,
        labileINR: false,
        elderly: false,
        drugsAlcohol: false
    });
    const [results, setResults] = useState<{
        score: number;
        riskLevel: 'low' | 'medium' | 'high' | 'very-high';
        riskDescription: string;
        recommendation: string;
        annualRisk: number;
    } | null>(null);

    const calculateCHADSScore = () => {
        let score = 0;
        
        if (chadsFactors.chf) score += 1;
        if (chadsFactors.hypertension) score += 1;
        if (chadsFactors.ageOver75) score += 2;
        if (chadsFactors.diabetes) score += 1;
        if (chadsFactors.strokeTIA) score += 2;
        if (chadsFactors.vascularDisease) score += 1;
        if (chadsFactors.age65to74) score += 1;
        if (chadsFactors.female) score += 1;

        let riskLevel: 'low' | 'medium' | 'high' | 'very-high' = 'low';
        let riskDescription = '';
        let recommendation = '';
        let annualRisk = 0;

        if (score === 0) {
            riskLevel = 'low';
            riskDescription = 'Low stroke risk';
            recommendation = 'No anticoagulation required. Consider aspirin 75-100mg daily if no contraindications.';
            annualRisk = 0;
        } else if (score === 1) {
            riskLevel = 'medium';
            riskDescription = 'Moderate stroke risk';
            recommendation = 'Consider oral anticoagulation (OAC) based on patient preference and bleeding risk.';
            annualRisk = 1.3;
        } else if (score === 2) {
            riskLevel = 'high';
            riskDescription = 'High stroke risk';
            recommendation = 'Oral anticoagulation recommended (warfarin, DOACs).';
            annualRisk = 2.2;
        } else if (score === 3) {
            riskLevel = 'high';
            riskDescription = 'High stroke risk';
            recommendation = 'Oral anticoagulation strongly recommended.';
            annualRisk = 3.2;
        } else {
            riskLevel = 'very-high';
            riskDescription = 'Very high stroke risk';
            recommendation = 'Oral anticoagulation essential. Consider higher intensity monitoring.';
            annualRisk = 4.0 + (score - 3) * 1.5;
        }

        setResults({
            score,
            riskLevel,
            riskDescription,
            recommendation,
            annualRisk
        });
    };

    const calculateHASBLEDScore = () => {
        let score = 0;
        
        if (hasbledFactors.hypertension) score += 1;
        if (hasbledFactors.abnormalRenal) score += 1;
        if (hasbledFactors.abnormalLiver) score += 1;
        if (hasbledFactors.stroke) score += 1;
        if (hasbledFactors.bleeding) score += 1;
        if (hasbledFactors.labileINR) score += 1;
        if (hasbledFactors.elderly) score += 1;
        if (hasbledFactors.drugsAlcohol) score += 1;

        let riskLevel: 'low' | 'medium' | 'high' | 'very-high' = 'low';
        let riskDescription = '';
        let recommendation = '';
        let annualRisk = 0;

        if (score <= 2) {
            riskLevel = 'low';
            riskDescription = 'Low bleeding risk';
            recommendation = 'Monitor regularly. No special precautions required.';
            annualRisk = 1.1;
        } else if (score === 3) {
            riskLevel = 'medium';
            riskDescription = 'Moderate bleeding risk';
            recommendation = 'Monitor more frequently (every 3-6 months). Consider lower dose NOACs.';
            annualRisk = 3.7;
        } else if (score === 4) {
            riskLevel = 'high';
            riskDescription = 'High bleeding risk';
            recommendation = 'Frequent monitoring required. Consider HAS-BLED modifiable risk factor management.';
            annualRisk = 8.7;
        } else {
            riskLevel = 'very-high';
            riskDescription = 'Very high bleeding risk';
            recommendation = 'Requires specialist hematology review. Consider alternative strategies.';
            annualRisk = 12.5 + (score - 4) * 2;
        }

        setResults({
            score,
            riskLevel,
            riskDescription,
            recommendation,
            annualRisk
        });
    };

    const resetCalculator = () => {
        if (tool === 'chads') {
            setChadsFactors({
                chf: false,
                hypertension: false,
                ageOver75: false,
                diabetes: false,
                strokeTIA: false,
                vascularDisease: false,
                age65to74: false,
                female: false
            });
        } else {
            setHasbledFactors({
                hypertension: false,
                abnormalRenal: false,
                abnormalLiver: false,
                stroke: false,
                bleeding: false,
                labileINR: false,
                elderly: false,
                drugsAlcohol: false
            });
        }
        setResults(null);
    };

    const loadExample = () => {
        if (tool === 'chads') {
            setChadsFactors({
                chf: true,
                hypertension: true,
                ageOver75: false,
                diabetes: true,
                strokeTIA: true,
                vascularDisease: false,
                age65to74: true,
                female: true
            });
        } else {
            setHasbledFactors({
                hypertension: true,
                abnormalRenal: true,
                abnormalLiver: false,
                stroke: false,
                bleeding: true,
                labileINR: true,
                elderly: true,
                drugsAlcohol: false
            });
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Anticoagulation Risk/Benefit Tools</h1>
                                <p className="text-blue-100 mt-2">Calculate CHA₂DS₂-VASc (stroke risk) and HAS-BLED (bleeding risk) scores</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Clinical Decision Support</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            {/* Tool Selection */}
                            <div className="mb-6">
                                <label className="block text-lg font-semibold text-gray-800 mb-4">
                                    Select Risk Assessment Tool
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setTool('chads');
                                            setResults(null);
                                        }}
                                        className={`p-4 rounded-xl transition-all ${tool === 'chads'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <TrendingUp className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">CHA₂DS₂-VASc</span>
                                            <span className="text-sm mt-1">Stroke Risk in AFib</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTool('hasbled');
                                            setResults(null);
                                        }}
                                        className={`p-4 rounded-xl transition-all ${tool === 'hasbled'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <AlertTriangle className="w-8 h-8 mb-2" />
                                            <span className="font-semibold">HAS-BLED</span>
                                            <span className="text-sm mt-1">Bleeding Risk</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Risk Factors */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {tool === 'chads' ? 'CHA₂DS₂-VASc Risk Factors' : 'HAS-BLED Risk Factors'}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tool === 'chads' ? (
                                        <>
                                            {[
                                                { id: 'chf', label: 'Congestive Heart Failure', points: 1 },
                                                { id: 'hypertension', label: 'Hypertension', points: 1 },
                                                { id: 'ageOver75', label: 'Age ≥75 years', points: 2 },
                                                { id: 'diabetes', label: 'Diabetes Mellitus', points: 1 },
                                                { id: 'strokeTIA', label: 'Stroke/TIA/Thromboembolism', points: 2 },
                                                { id: 'vascularDisease', label: 'Vascular Disease', points: 1 },
                                                { id: 'age65to74', label: 'Age 65-74 years', points: 1 },
                                                { id: 'female', label: 'Female Sex', points: 1 },
                                            ].map((factor) => (
                                                <div key={factor.id} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={factor.id}
                                                                checked={chadsFactors[factor.id as keyof typeof chadsFactors]}
                                                                onChange={(e) => setChadsFactors(prev => ({
                                                                    ...prev,
                                                                    [factor.id]: e.target.checked
                                                                }))}
                                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={factor.id} className="ml-3 font-medium text-gray-800">
                                                                {factor.label}
                                                            </label>
                                                        </div>
                                                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                                                            {factor.points} point{factor.points > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {[
                                                { id: 'hypertension', label: 'Hypertension', description: 'SBP >160 mmHg' },
                                                { id: 'abnormalRenal', label: 'Abnormal Renal Function', description: 'Dialysis, transplant, Cr >2.26 mg/dL' },
                                                { id: 'abnormalLiver', label: 'Abnormal Liver Function', description: 'Cirrhosis, bilirubin >2× normal, AST/ALT/AP >3× normal' },
                                                { id: 'stroke', label: 'Stroke', description: 'History of stroke' },
                                                { id: 'bleeding', label: 'Bleeding', description: 'History of major bleeding or predisposition' },
                                                { id: 'labileINR', label: 'Labile INR', description: 'Time in therapeutic range <60%' },
                                                { id: 'elderly', label: 'Elderly', description: 'Age >65 years' },
                                                { id: 'drugsAlcohol', label: 'Drugs/Alcohol', description: 'Concomitant drugs, alcohol abuse' },
                                            ].map((factor) => (
                                                <div key={factor.id} className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-start">
                                                        <input
                                                            type="checkbox"
                                                            id={factor.id}
                                                            checked={hasbledFactors[factor.id as keyof typeof hasbledFactors]}
                                                            onChange={(e) => setHasbledFactors(prev => ({
                                                                ...prev,
                                                                [factor.id]: e.target.checked
                                                            }))}
                                                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-1"
                                                        />
                                                        <div className="ml-3">
                                                            <label htmlFor={factor.id} className="font-medium text-gray-800">
                                                                {factor.label}
                                                            </label>
                                                            <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={tool === 'chads' ? calculateCHADSScore : calculateHASBLEDScore}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Calculate {tool === 'chads' ? 'CHA₂DS₂-VASc Score' : 'HAS-BLED Score'}
                                </button>
                                <button
                                    onClick={loadExample}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                                >
                                    Load Example
                                </button>
                                <button
                                    onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Results Section */}
                            {results && (
                                <div className="mt-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                            {tool === 'chads' ? 'CHA₂DS₂-VASc Results' : 'HAS-BLED Results'}
                                        </h3>

                                        {/* Score Display */}
                                        <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-gray-600 mb-1">
                                                    Total Score
                                                </div>
                                                <div className={`text-5xl md:text-6xl font-bold mb-2 ${
                                                    results.riskLevel === 'low' ? 'text-green-600' :
                                                    results.riskLevel === 'medium' ? 'text-yellow-600' :
                                                    results.riskLevel === 'high' ? 'text-orange-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {results.score}
                                                </div>
                                                <div className={`text-lg font-semibold ${
                                                    results.riskLevel === 'low' ? 'text-green-700' :
                                                    results.riskLevel === 'medium' ? 'text-yellow-700' :
                                                    results.riskLevel === 'high' ? 'text-orange-700' :
                                                    'text-red-700'
                                                }`}>
                                                    {results.riskDescription}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Annual Risk */}
                                        <div className="bg-white rounded-xl p-6 mb-4 shadow-sm">
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-gray-600 mb-1">
                                                    Estimated Annual Risk
                                                </div>
                                                <div className="text-3xl font-bold text-blue-600">
                                                    {results.annualRisk.toFixed(1)}%
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {tool === 'chads' 
                                                        ? 'Annual stroke risk without anticoagulation'
                                                        : 'Annual major bleeding risk with anticoagulation'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6">
                                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                                Clinical Recommendation
                                            </h4>
                                            <p className="text-gray-700">{results.recommendation}</p>
                                        </div>

                                        {/* Risk Interpretation */}
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">Risk Interpretation</h4>
                                            <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative">
                                                <div className="absolute top-0 bottom-0 w-1 bg-black" 
                                                    style={{ 
                                                        left: `${Math.min(
                                                            tool === 'chads' 
                                                                ? (results.score / 9) * 100 
                                                                : (results.score / 8) * 100, 
                                                            100
                                                        )}%` 
                                                    }}>
                                                    <div className="absolute -top-8 -ml-6 text-sm font-semibold">
                                                        Score: {results.score}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 mt-2">
                                                <span>Low</span>
                                                <span>Moderate</span>
                                                <span>High</span>
                                                <span>Very High</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* About CHA₂DS₂-VASc */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">About CHA₂DS₂-VASc</h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <p>
                                    CHA₂DS₂-VASc is a clinical prediction score for estimating stroke risk in patients with atrial fibrillation (AF).
                                </p>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-blue-700 mb-1">Scoring:</h4>
                                    <ul className="space-y-1">
                                        <li>• Congestive heart failure: 1 point</li>
                                        <li>• Hypertension: 1 point</li>
                                        <li>• Age ≥75: 2 points</li>
                                        <li>• Diabetes: 1 point</li>
                                        <li>• Stroke/TIA/TE: 2 points</li>
                                        <li>• Vascular disease: 1 point</li>
                                        <li>• Age 65-74: 1 point</li>
                                        <li>• Female sex: 1 point</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* About HAS-BLED */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">About HAS-BLED</h3>
                            <div className="space-y-4 text-sm text-gray-600">
                                <p>
                                    HAS-BLED estimates bleeding risk in patients on anticoagulation for atrial fibrillation.
                                </p>
                                <div className="bg-red-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-red-700 mb-1">Scoring:</h4>
                                    <ul className="space-y-1">
                                        <li>• Hypertension: 1 point</li>
                                        <li>• Abnormal renal/liver function: 1 point each</li>
                                        <li>• Stroke: 1 point</li>
                                        <li>• Bleeding: 1 point</li>
                                        <li>• Labile INR: 1 point</li>
                                        <li>• Elderly ({'>'}65): 1 point</li>
                                        <li>• Drugs/alcohol: 1 point</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">CHA₂DS₂-VASc = 0</span>
                                    <span className="font-semibold text-green-600">No OAC</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">CHA₂DS₂-VASc ≥2</span>
                                    <span className="font-semibold text-red-600">OAC indicated</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="text-gray-700">HAS-BLED ≥3</span>
                                    <span className="font-semibold text-orange-600">Monitor closely</span>
                                </div>
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Anticoagulants</h3>
                            <div className="space-y-3 text-sm">
                                {[
                                    { name: 'Apixaban', dose: '5mg BID', indications: 'Stroke prevention in AF' },
                                    { name: 'Rivaroxaban', dose: '20mg daily', indications: 'Stroke prevention in AF' },
                                    { name: 'Dabigatran', dose: '150mg BID', indications: 'Stroke prevention in AF' },
                                    { name: 'Warfarin', dose: 'Variable', indications: 'INR 2.0-3.0' },
                                ].map((drug, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="font-semibold text-blue-700">{drug.name}</div>
                                        <div className="text-gray-600">{drug.dose} • {drug.indications}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}