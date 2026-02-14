"use client";
import { useState, useEffect } from 'react';
import {
    Activity,
    Calculator,
    FlaskConical,
    RefreshCw,
    AlertCircle,
    GitMerge,
    Sigma
} from 'lucide-react';

type AntagonismType = 'competitive' | 'noncompetitive' | 'uncompetitive';

export default function AntagonismSimulator() {
    const [antagType, setAntagType] = useState<AntagonismType>('competitive');
    const [agonistConc, setAgonistConc] = useState<string>('10');
    const [antagonistConc, setAntagonistConc] = useState<string>('5');
    const [ka, setKa] = useState<string>('0.5'); // agonist affinity (1/µM)
    const [kb, setKb] = useState<string>('0.2'); // antagonist affinity (1/µM)
    const [emax, setEmax] = useState<string>('100');
    const [response, setResponse] = useState<number | null>(null);
    const [ec50Shift, setEc50Shift] = useState<number | null>(null);
    const [units] = useState<'µM' | 'nM' | 'mM'>('µM');

    const calculateResponse = () => {
        const A = parseFloat(agonistConc);
        const B = parseFloat(antagonistConc);
        const KdA = 1 / parseFloat(ka);  // dissociation constant for agonist
        const KdB = 1 / parseFloat(kb);  // dissociation constant for antagonist
        const Em = parseFloat(emax);

        if (isNaN(A) || isNaN(B) || isNaN(KdA) || isNaN(KdB) || isNaN(Em) || A <= 0) return;

        let occupancy = 0;
        let ec50Ratio = 1;

        switch (antagType) {
            case 'competitive':
                // Fraction of receptors occupied by agonist in presence of competitive antagonist
                occupancy = A / (A + KdA * (1 + B / KdB));
                ec50Ratio = 1 + B / KdB;  // shift to right (apparent EC50 increase)
                break;
            case 'noncompetitive':
                // Antagonist reduces Emax, no EC50 change
                occupancy = (A / (A + KdA)) * (1 - B / (B + KdB));
                ec50Ratio = 1; // no shift
                break;
            case 'uncompetitive':
                // Antagonist binds only to agonist‑receptor complex
                occupancy = (A / (A + KdA)) * (KdB / (KdB + B));
                ec50Ratio = 1; // both Emax and EC50 may change, simplified here
                break;
        }

        setResponse(occupancy * Em);
        setEc50Shift(ec50Ratio);
    };

    useEffect(() => {
        calculateResponse();
    }, [antagType, agonistConc, antagonistConc, ka, kb, emax]);

    const reset = () => {
        setAntagType('competitive');
        setAgonistConc('10');
        setAntagonistConc('5');
        setKa('0.5');
        setKb('0.2');
        setEmax('100');
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <GitMerge className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Antagonism Simulator</h1>
                                <p className="text-blue-100 mt-2">Model receptor‑antagonist interactions</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Sigma className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Pharmacodynamics</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Antagonism Parameters
                            </h2>

                            {/* Antagonism type selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setAntagType('competitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'competitive'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <Activity className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Competitive</span>
                                        <span className="text-xs mt-1">EC50 ↑, Emax ↔</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAntagType('noncompetitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'noncompetitive'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <FlaskConical className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Non‑competitive</span>
                                        <span className="text-xs mt-1">Emax ↓, EC50 ↔</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setAntagType('uncompetitive')}
                                    className={`p-4 rounded-xl transition-all ${antagType === 'uncompetitive'
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <GitMerge className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Uncompetitive</span>
                                        <span className="text-xs mt-1">Both affected</span>
                                    </div>
                                </button>
                            </div>

                            {/* Input fields */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Concentration Units</h3>
                                    <div className="text-sm text-gray-600 mb-2">All concentrations in {units}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Agonist Concentration [A] ({units})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={agonistConc}
                                            onChange={(e) => setAgonistConc(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Antagonist Concentration [B] ({units})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={antagonistConc}
                                            onChange={(e) => setAntagonistConc(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Agonist Affinity (kₐ) ({units}⁻¹)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={ka}
                                            onChange={(e) => setKa(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Antagonist Affinity (k_b) ({units}⁻¹)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={kb}
                                            onChange={(e) => setKb(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Maximal Response (Emax, %)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={emax}
                                            onChange={(e) => setEmax(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateResponse}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Simulate
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Response
                            </h2>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">Predicted Effect</div>
                                    {response !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {response.toFixed(1)}%
                                            </div>
                                            <div className="text-xl">of Emax</div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">Enter values</div>
                                    )}
                                </div>
                            </div>
                            {ec50Shift !== null && (
                                <div className="bg-white/10 rounded-lg p-4">
                                    <div className="text-center">
                                        <div className="text-sm font-semibold mb-1">EC₅₀ shift factor</div>
                                        <div className="text-2xl font-bold">{ec50Shift.toFixed(2)}x</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Interpretation
                            </h3>
                            <p className="text-sm text-gray-700">
                                {antagType === 'competitive' &&
                                    'Competitive antagonist shifts the dose‑response curve right without affecting maximum. Higher agonist dose can overcome blockade.'}
                                {antagType === 'noncompetitive' &&
                                    'Non‑competitive antagonist reduces the maximum response. Increasing agonist concentration cannot fully overcome the effect.'}
                                {antagType === 'uncompetitive' &&
                                    'Uncompetitive antagonist binds only to the agonist‑receptor complex, reducing both potency and efficacy.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}