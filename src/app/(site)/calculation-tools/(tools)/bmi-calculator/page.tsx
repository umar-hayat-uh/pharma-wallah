"use client";
import { useState } from 'react';
import { Calculator, Scale, Activity, AlertCircle, Heart, TrendingUp, Users, Info, BookOpen, RefreshCw } from 'lucide-react';

export default function BMICalculator() {
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [result, setResult] = useState<{
        bmi: number;
        category: string;
        risk: string;
        idealWeight: { min: number; max: number };
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const h = parseFloat(height) / 100;
        const w = parseFloat(weight);
        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            alert('Enter valid positive numbers');
            return;
        }
        const bmi = w / (h * h);
        let category = '', risk = '';
        if (bmi < 16) { category = 'Severe Thinness'; risk = 'Very high'; }
        else if (bmi < 17) { category = 'Moderate Thinness'; risk = 'High'; }
        else if (bmi < 18.5) { category = 'Mild Thinness'; risk = 'Moderate'; }
        else if (bmi < 25) { category = 'Normal'; risk = 'Low'; }
        else if (bmi < 30) { category = 'Overweight'; risk = 'Moderate'; }
        else if (bmi < 35) { category = 'Obese Class I'; risk = 'High'; }
        else if (bmi < 40) { category = 'Obese Class II'; risk = 'Very high'; }
        else { category = 'Obese Class III'; risk = 'Extremely high'; }

        const idealMin = 18.5 * h * h;
        const idealMax = 24.9 * h * h;

        setResult({
            bmi,
            category,
            risk,
            idealWeight: { min: parseFloat(idealMin.toFixed(1)), max: parseFloat(idealMax.toFixed(1)) }
        });
    };

    const reset = () => {
        setHeight('');
        setWeight('');
        setResult(null);
    };

    const samplePatients = [
        { name: 'Underweight', height: '170', weight: '50' },
        { name: 'Normal', height: '170', weight: '65' },
        { name: 'Overweight', height: '170', weight: '80' },
        { name: 'Obese I', height: '170', weight: '95' },
        { name: 'Obese II', height: '170', weight: '110' },
    ];

    const loadSample = (idx: number) => {
        const p = samplePatients[idx];
        setHeight(p.height);
        setWeight(p.weight);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">BMI Calculator</h1>
                                <p className="text-blue-100 mt-2">Weight classification & cardiovascular risk</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Heart className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Metabolic Health</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Measurements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold">Height (cm)</label>
                                    <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg mt-2" />
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                                    <label className="text-sm font-semibold">Weight (kg)</label>
                                    <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg mt-2" />
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {samplePatients.map((p, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{p.name}</div>
                                            <div>{p.height}cm/{p.weight}kg</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate BMI
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About BMI
                                </h3>
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-2 text-sm text-gray-600">
                                    <p>BMI correlates with body fat but doesn't distinguish muscle from fat.</p>
                                    <p>Ideal range 18.5–24.9 kg/m².</p>
                                    <p>Limitations: athletes, elderly, different ethnicities.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {result && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">BMI</h2>
                                <div className="bg-white/20 rounded-xl p-4 text-center">
                                    <div className="text-4xl font-bold mb-2">{result.bmi.toFixed(1)}</div>
                                    <div className="text-lg">{result.category}</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 mt-4">
                                    <p>Health risk: {result.risk}</p>
                                    <p className="mt-2">Ideal weight: {result.idealWeight.min} – {result.idealWeight.max} kg</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4">WHO Classification</h3>
                            <div className="space-y-1 text-sm">
                                <div>&lt;16.0: Severe thinness</div>
                                <div>16.0–16.9: Moderate thinness</div>
                                <div>17.0–18.4: Mild thinness</div>
                                <div>18.5–24.9: Normal</div>
                                <div>25.0–29.9: Overweight</div>
                                <div>30.0–34.9: Obese I</div>
                                <div>35.0–39.9: Obese II</div>
                                <div>≥40.0: Obese III</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}