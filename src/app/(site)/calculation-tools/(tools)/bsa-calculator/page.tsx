"use client";
import { useState, useEffect } from 'react';
import { Ruler, Scale, Calculator, Activity, AlertCircle, TrendingUp, Target, Info, BookOpen, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BSACalculator() {
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [formula, setFormula] = useState<'mosteller' | 'dubois'>('mosteller');
    const [result, setResult] = useState<{
        bsa: number;
        category: string;
        clinicalUse: string;
        dosingAdjustment: string;
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculateBSA = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        let bsa: number;
        if (formula === 'mosteller') {
            bsa = Math.sqrt((h * w) / 3600);
        } else {
            bsa = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
        }

        let category = '', clinicalUse = '', dosingAdjustment = '';
        if (bsa < 1.2) {
            category = 'Small';
            clinicalUse = 'Pediatric or small adult dosing';
            dosingAdjustment = 'Consider lower starting doses for chemotherapy';
        } else if (bsa <= 2.0) {
            category = 'Normal';
            clinicalUse = 'Standard adult dosing';
            dosingAdjustment = 'Use standard protocols';
        } else {
            category = 'Large';
            clinicalUse = 'Increased dosing may be required';
            dosingAdjustment = 'May require dose adjustment';
        }

        setResult({ bsa, category, clinicalUse, dosingAdjustment });
    };

    useEffect(() => {
        if (height && weight) calculateBSA();
    }, [height, weight, formula]);

    const reset = () => {
        setHeight('');
        setWeight('');
        setResult(null);
    };

    const samplePatients = [
        { label: 'Pediatric', height: '130', weight: '28' },
        { label: 'Average adult', height: '170', weight: '70' },
        { label: 'Obese', height: '175', weight: '120' },
        { label: 'Elderly', height: '165', weight: '55' },
        { label: 'Athletic', height: '185', weight: '85' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Ruler className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Body Surface Area (BSA) Calculator</h1>
                                <p className="text-blue-100 mt-2">Mosteller: √[(cm·kg)/3600] </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Target className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Chemotherapy Dosing</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Measurements</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                                    <label className="text-sm font-semibold mb-2">Height (cm)</label>
                                    <input type="number" step="0.1" min="1" value={height} onChange={(e) => setHeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" placeholder="e.g., 170" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                                    <label className="text-sm font-semibold mb-2">Weight (kg)</label>
                                    <input type="number" step="0.1" min="1" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" placeholder="e.g., 70" />
                                </div>
                            </div>

                            {/* Formula selection */}
                            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Select Formula</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setFormula('mosteller')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${formula === 'mosteller' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        Mosteller
                                    </button>
                                    <button onClick={() => setFormula('dubois')}
                                        className={`py-3 px-4 rounded-lg font-medium transition-all ${formula === 'dubois' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}>
                                        DuBois
                                    </button>
                                </div>
                            </div>

                            {/* Example patients */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => { setHeight(p.height); setWeight(p.weight); }}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.label}</div>
                                            <div>{p.height}cm/{p.weight}kg</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculateBSA}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate BSA
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About BSA
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p>Mosteller (1987): BSA = √(cm·kg/3600). Most commonly used.</p>
                                    <p>DuBois (1916): BSA = 0.007184 × cm^0.725 × kg^0.425. More accurate but rarely needed.</p>
                                    <p>Used for chemotherapy dosing, cardiac index, and burn assessment.</p>
                                    <p className="text-xs italic">Sources: Mosteller RD, N Engl J Med 1987; Du Bois D, Arch Intern Med 1916.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Body Surface Area</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.bsa.toFixed(4)} m²</div>
                                    <div className="text-lg">{result.category}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p className="text-sm">{result.clinicalUse}</p>
                                    <p className="text-sm mt-2">{result.dosingAdjustment}</p>
                                </div>
                            </div>
                        )}

                        {/* BSA scale */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                                BSA Reference Ranges
                            </h3>

                            {/* Increased margin-top to prevent label overlap with title */}
                            <div className="relative mt-8 mb-2">
                                {/* The Gradient Track */}
                                <div className="h-4 bg-gradient-to-r from-blue-300 via-green-300 to-yellow-400 rounded-full w-full" />

                                {result && (
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-red-600 transition-all duration-500 ease-out"
                                        style={{ left: `${Math.min(((result.bsa - 1) / (3 - 1)) * 100, 100)}%` }}
                                    >
                                        {/* The Label - Positioned as a tooltip bubble */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-md">
                                            {result.bsa.toFixed(2)} m²
                                            {/* Tiny arrow pointing down */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Range Labels */}
                            <div className="flex justify-between text-[10px] font-medium text-gray-500 px-1">
                                <span>1.0 (Small)</span>
                                <span>1.7 (Avg)</span>
                                <span>2.5</span>
                                <span>3.0 (Large)</span>
                            </div>
                        </div>

                        {/* Drug examples */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">BSA‑based Drugs</h3>
                            <p className="text-sm">Carboplatin, Docetaxel, Doxorubicin, Cyclophosphamide</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}