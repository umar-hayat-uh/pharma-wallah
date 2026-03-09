"use client";
import { useState } from 'react';
import { Heart, AlertTriangle, Activity, TrendingUp, Shield, Info, BookOpen, RefreshCw, Pill, Droplet } from 'lucide-react';

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
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateCHADS = () => {
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
            recommendation = 'No anticoagulation required. Consider aspirin if no contraindications.';
            annualRisk = 0.2; // per 100 patient-years
        } else if (score === 1) {
            riskLevel = 'medium';
            riskDescription = 'Moderate stroke risk';
            recommendation = 'Consider oral anticoagulation based on patient preference and bleeding risk. [citation:4]';
            annualRisk = 1.3;
        } else if (score === 2) {
            riskLevel = 'high';
            riskDescription = 'High stroke risk';
            recommendation = 'Oral anticoagulation recommended (warfarin, DOACs). [citation:4]';
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

        setResults({ score, riskLevel, riskDescription, recommendation, annualRisk });
    };

    const calculateHASBLED = () => {
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
            recommendation = 'Monitor regularly. No special precautions. [citation:1][citation:8]';
            annualRisk = 1.1;
        } else if (score === 3) {
            riskLevel = 'medium';
            riskDescription = 'Moderate bleeding risk';
            recommendation = 'Monitor more frequently (every 3‑6 months). Address modifiable risk factors. Consider lower dose NOACs if appropriate. [citation:1]';
            annualRisk = 3.7;
        } else if (score === 4) {
            riskLevel = 'high';
            riskDescription = 'High bleeding risk';
            recommendation = 'Frequent monitoring required. Address modifiable risk factors urgently. [citation:1][citation:8]';
            annualRisk = 8.7;
        } else {
            riskLevel = 'very-high';
            riskDescription = 'Very high bleeding risk';
            recommendation = 'Specialist review needed. Consider alternative strategies. [citation:8]';
            annualRisk = 12.5 + (score - 4) * 2;
        }

        setResults({ score, riskLevel, riskDescription, recommendation, annualRisk });
    };

    const reset = () => {
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

    // DOAC dosing based on age/weight/renal function [citation:2][citation:5]
    const doacDosing = [
        { drug: 'Apixaban', standard: '5mg BID', reduced: '2.5mg BID', criteria: 'Age ≥80 + weight ≤60kg + Cr ≥1.5mg/dL' },
        { drug: 'Rivaroxaban', standard: '20mg daily', reduced: '15mg daily', criteria: 'CrCl 15-49 mL/min' },
        { drug: 'Dabigatran', standard: '150mg BID', reduced: '110mg BID', criteria: 'Age ≥80, CrCl 30-50, concomitant verapamil' },
        { drug: 'Edoxaban', standard: '60mg daily', reduced: '30mg daily', criteria: 'CrCl 15-50, weight ≤60kg' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Anticoagulation Risk Tools</h1>
                                <p className="text-blue-100 mt-2">CHA₂DS₂‑VASc & HAS‑BLED scores for stroke/bleeding risk assessment</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">ESC 2024 Guidelines [citation:1]</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Calculator Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex gap-4 mb-6">
                                <button onClick={() => { setTool('chads'); setResults(null); }}
                                    className={`flex-1 py-4 rounded-xl font-semibold transition-all ${tool === 'chads' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    CHA₂DS₂‑VASc (Stroke Risk)
                                </button>
                                <button onClick={() => { setTool('hasbled'); setResults(null); }}
                                    className={`flex-1 py-4 rounded-xl font-semibold transition-all ${tool === 'hasbled' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    HAS‑BLED (Bleeding Risk)
                                </button>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {tool === 'chads' ? 'CHA₂DS₂‑VASc Risk Factors' : 'HAS‑BLED Risk Factors'}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tool === 'chads' ? (
                                    <>
                                        {[
                                            { id: 'chf', label: 'Congestive Heart Failure', pts: 1 },
                                            { id: 'hypertension', label: 'Hypertension', pts: 1 },
                                            { id: 'ageOver75', label: 'Age ≥75 years', pts: 2 },
                                            { id: 'diabetes', label: 'Diabetes Mellitus', pts: 1 },
                                            { id: 'strokeTIA', label: 'Stroke/TIA/Thromboembolism', pts: 2 },
                                            { id: 'vascularDisease', label: 'Vascular Disease', pts: 1 },
                                            { id: 'age65to74', label: 'Age 65‑74 years', pts: 1 },
                                            { id: 'female', label: 'Female Sex', pts: 1 },
                                        ].map(f => (
                                            <div key={f.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={chadsFactors[f.id as keyof typeof chadsFactors]} onChange={(e) => setChadsFactors({ ...chadsFactors, [f.id]: e.target.checked })} />
                                                    <span className="text-sm">{f.label}</span>
                                                </label>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{f.pts} pts</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { id: 'hypertension', label: 'Hypertension', desc: 'SBP >160 mmHg [citation:3][citation:8]' },
                                            { id: 'abnormalRenal', label: 'Abnormal Renal Function', desc: 'Dialysis, Cr >2.26 mg/dL [citation:3][citation:8]' },
                                            { id: 'abnormalLiver', label: 'Abnormal Liver Function', desc: 'Cirrhosis, bilirubin >2× ULN, enzymes >3× ULN [citation:3]' },
                                            { id: 'stroke', label: 'Stroke', desc: 'History of stroke (ischemic or hemorrhagic) [citation:3]' },
                                            { id: 'bleeding', label: 'Bleeding History', desc: 'Major bleeding or predisposition [citation:3][citation:8]' },
                                            { id: 'labileINR', label: 'Labile INR', desc: 'Time in therapeutic range <60% [citation:3][citation:8]' },
                                            { id: 'elderly', label: 'Elderly', desc: 'Age >65 years [citation:3][citation:8]' },
                                            { id: 'drugsAlcohol', label: 'Drugs/Alcohol', desc: 'Antiplatelets, NSAIDs, or >8 units/week [citation:3][citation:8][citation:10]' },
                                        ].map(f => (
                                            <div key={f.id} className="bg-gray-50 p-4 rounded-lg">
                                                <label className="flex items-start gap-2">
                                                    <input type="checkbox" className="mt-1" checked={hasbledFactors[f.id as keyof typeof hasbledFactors]} onChange={(e) => setHasbledFactors({ ...hasbledFactors, [f.id]: e.target.checked })} />
                                                    <div>
                                                        <span className="font-medium text-sm">{f.label}</span>
                                                        <p className="text-xs text-gray-600">{f.desc}</p>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={tool === 'chads' ? calculateCHADS : calculateHASBLED}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Score
                                </button>
                                <button onClick={loadExample}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                                    Load Example
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        {results && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">
                                    {tool === 'chads' ? 'CHA₂DS₂‑VASc Results' : 'HAS-BLED Results'}
                                </h3>

                                {/* Score Display */}
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">
                                            Annual {tool === 'chads' ? 'Stroke' : 'Bleeding'} Risk
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {results.annualRisk.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="text-sm font-semibold text-gray-600 mb-1">
                                            Guideline Recommendation
                                        </div>
                                        <div className="text-sm font-medium text-gray-800">
                                            {tool === 'chads' ? (
                                                results.score === 0 ? 'No OAC' :
                                                results.score === 1 ? 'Consider OAC' :
                                                'OAC indicated'
                                            ) : (
                                                results.score >= 3 ? 'High risk – monitor closely' : 'Standard care'
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Recommendation */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{results.recommendation}</p>
                                    </div>
                                </div>

                                {/* Risk Scale Visualization */}
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Risk Scale</h4>
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
                                            <div className="absolute -top-6 -ml-6 text-xs font-semibold whitespace-nowrap">
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
                        )}

                        {/* Detailed Information Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Guidelines & Risk Factors
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-6 space-y-6 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-blue-700 mb-2">CHA₂DS₂‑VASc [citation:4]</h4>
                                        <p className="text-gray-600">Validated tool for estimating annual stroke risk in non‑valvular AF. Score ≥2 in men, ≥3 in women indicates need for OAC. [citation:9]</p>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-red-700 mb-2">HAS‑BLED [citation:1][citation:3]</h4>
                                        <p className="text-gray-600">Most widely used bleeding risk tool. Score ≥3 indicates high risk – identify and modify risk factors. [citation:2]</p>
                                        <ul className="list-disc list-inside mt-2 text-gray-600">
                                            <li><span className="font-medium">Modifiable:</span> Hypertension, labile INR, drugs/alcohol [citation:8]</li>
                                            <li><span className="font-medium">Potentially modifiable:</span> Renal/liver function, anemia</li>
                                            <li><span className="font-medium">Non‑modifiable:</span> Age, stroke history, bleeding history [citation:8]</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2">DOAC Dosing Considerations [citation:2][citation:5]</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr><th className="py-2 px-3 text-left">Drug</th><th>Standard</th><th>Reduced</th><th>Criteria</th></tr>
                                                </thead>
                                                <tbody>
                                                    {doacDosing.map((d, i) => (
                                                        <tr key={i} className="border-b"><td className="py-2 px-3 font-medium">{d.drug}</td><td>{d.standard}</td><td>{d.reduced}</td><td className="text-xs">{d.criteria}</td></tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <p className="text-xs text-gray-600 italic">
                                            References: ESC 2024 Guidelines [citation:1], ARC‑HBR Criteria 2019 [citation:2][citation:5], ACC/AHA 2023 [citation:4], Queensland Health [citation:8], Merck Manual [citation:10]
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                Quick Reference
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-700 mb-2">CHA₂DS₂‑VASc</h4>
                                    <div className="space-y-1 text-sm">
                                        <div>0: Low risk (no OAC)</div>
                                        <div>1: Moderate (consider OAC)</div>
                                        <div>≥2 (men) / ≥3 (women): OAC indicated [citation:4][citation:9]</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-red-700 mb-2">HAS‑BLED</h4>
                                    <div className="space-y-1 text-sm">
                                        <div>≤2: Low bleeding risk</div>
                                        <div>≥3: High bleeding risk – frequent monitoring [citation:1][citation:8]</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Pill className="w-5 h-5 mr-2 text-blue-600" />
                                DOAC Preference [citation:6]
                            </h3>
                            <p className="text-sm mb-3">In older adults, apixaban and dabigatran preferred over rivaroxaban and warfarin due to lower bleeding risk.</p>
                            <div className="bg-white/50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600">2023 Beers Criteria: caution with rivaroxaban and warfarin in elderly [citation:6]</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Droplet className="w-5 h-5 mr-2 text-blue-600" />
                                Monitoring
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li>• CBC, renal/liver function annually</li>
                                <li>• TTR target {'>'}65% for warfarin [citation:9]</li>
                                <li>• Reassess at every visit [citation:1]</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}