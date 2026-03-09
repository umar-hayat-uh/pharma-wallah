"use client";
import { useState, useEffect } from 'react';
import { Beaker, Calculator, TrendingUp, RefreshCw, AlertCircle, Eye, Target, Activity,ChevronUp, Info,ChevronDown, BookOpen, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

type MolarityUnit = 'M' | 'mM' | 'μM' | 'nM';
type PathLengthUnit = 'cm' | 'mm' | 'm';

export default function BeerLambertCalculator() {
    const [method, setMethod] = useState<'absorbance' | 'concentration' | 'epsilon'>('absorbance');
    const [epsilon, setEpsilon] = useState<string>('5000');
    const [concentration, setConcentration] = useState<string>('0.001');
    const [pathLength, setPathLength] = useState<string>('1');
    const [absorbance, setAbsorbance] = useState<string>('0.5');
    const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
    const [molarityUnit, setMolarityUnit] = useState<MolarityUnit>('M');
    const [pathLengthUnit, setPathLengthUnit] = useState<PathLengthUnit>('cm');
    const [transmittance, setTransmittance] = useState<number | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const eps = parseFloat(epsilon);
        const conc = parseFloat(concentration);
        const b = parseFloat(pathLength);
        const A = parseFloat(absorbance);

        let result = 0;

        // Convert concentration to M
        let concM = conc;
        switch (molarityUnit) {
            case 'mM': concM = conc / 1000; break;
            case 'μM': concM = conc / 1e6; break;
            case 'nM': concM = conc / 1e9; break;
        }

        // Convert path length to cm
        let bCm = b;
        switch (pathLengthUnit) {
            case 'mm': bCm = b / 10; break;
            case 'm': bCm = b * 100; break;
        }

        switch (method) {
            case 'absorbance':
                if (!isNaN(eps) && !isNaN(concM) && !isNaN(bCm)) {
                    result = eps * concM * bCm;
                    setAbsorbance(result.toFixed(4));
                }
                break;
            case 'concentration':
                if (!isNaN(A) && !isNaN(eps) && !isNaN(bCm) && eps > 0 && bCm > 0) {
                    result = A / (eps * bCm);
                    switch (molarityUnit) {
                        case 'M': break;
                        case 'mM': result *= 1000; break;
                        case 'μM': result *= 1e6; break;
                        case 'nM': result *= 1e9; break;
                    }
                    setConcentration(result.toFixed(8));
                }
                break;
            case 'epsilon':
                if (!isNaN(A) && !isNaN(concM) && !isNaN(bCm) && concM > 0 && bCm > 0) {
                    result = A / (concM * bCm);
                    setEpsilon(result.toFixed(0));
                }
                break;
        }

        setCalculatedValue(result);

        const AVal = parseFloat(absorbance);
        if (!isNaN(AVal)) setTransmittance(Math.pow(10, -AVal) * 100);

        // Generate calibration curve
        const data = [];
        const maxConc = concM * 2;
        for (let i = 0; i <= 20; i++) {
            const c = (i / 20) * maxConc;
            data.push({ conc: c * (molarityUnit === 'M' ? 1 : molarityUnit === 'mM' ? 1000 : molarityUnit === 'μM' ? 1e6 : 1e9), abs: eps * c * bCm });
        }
        setChartData(data);
    };

    useEffect(() => { calculate(); }, [method, epsilon, concentration, pathLength, absorbance, molarityUnit, pathLengthUnit]);

    const reset = () => {
        setEpsilon('5000');
        setConcentration('0.001');
        setPathLength('1');
        setAbsorbance('0.5');
        setMolarityUnit('M');
        setPathLengthUnit('cm');
        setCalculatedValue(null);
        setTransmittance(null);
    };

    const sampleCompounds = [
        { name: 'NADH', epsilon: '6220', lambda: '340', conc: '0.0001', unit: 'M', note: 'Reduced form at 340 nm' },
        { name: 'DNA', epsilon: '6600', lambda: '260', conc: '0.00005', unit: 'M', note: 'Double‑stranded at 260 nm' },
        { name: 'BSA', epsilon: '55000', lambda: '280', conc: '0.0001', unit: 'M', note: 'Protein at 280 nm' },
        { name: 'Methylene Blue', epsilon: '95000', lambda: '665', conc: '0.00001', unit: 'M', note: 'At 665 nm' }
    ];

    const loadSample = (idx: number) => {
        const c = sampleCompounds[idx];
        setEpsilon(c.epsilon);
        setConcentration(c.conc);
        setMolarityUnit(c.unit as MolarityUnit);
    };

    const getAbsorbanceInterpretation = (A: number) => {
        if (A < 0.1) return 'Very low – may need higher concentration or longer pathlength';
        if (A < 0.5) return 'Ideal for accurate measurements';
        if (A < 1.0) return 'Good range';
        if (A < 2.0) return 'High – consider dilution';
        return 'Too high – dilute sample';
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Beer‑Lambert Law Calculator</h1>
                                <p className="text-blue-100 mt-2">A = ε · c · l</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Eye className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">Spectrophotometry</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Calculation Method
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <button onClick={() => setMethod('absorbance')}
                                    className={`p-4 rounded-xl transition-all ${method === 'absorbance' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <TrendingUp className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="text-sm font-semibold">Absorbance (A)</span>
                                </button>
                                <button onClick={() => setMethod('concentration')}
                                    className={`p-4 rounded-xl transition-all ${method === 'concentration' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Target className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="text-sm font-semibold">Concentration (c)</span>
                                </button>
                                <button onClick={() => setMethod('epsilon')}
                                    className={`p-4 rounded-xl transition-all ${method === 'epsilon' ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    <Activity className="w-8 h-8 mb-2 mx-auto" />
                                    <span className="text-sm font-semibold">Molar absorptivity (ε)</span>
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold">Concentration</label>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {(['M','mM','μM','nM'] as MolarityUnit[]).map(u => (
                                                <button key={u} onClick={() => setMolarityUnit(u)}
                                                    className={`py-2 text-sm rounded-lg ${molarityUnit === u ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold">Path length</label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {(['cm','mm','m'] as PathLengthUnit[]).map(u => (
                                                <button key={u} onClick={() => setPathLengthUnit(u)}
                                                    className={`py-2 text-sm rounded-lg ${pathLengthUnit === u ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                    <label className="block text-sm font-semibold mb-2">Molar absorptivity ε (M⁻¹cm⁻¹)</label>
                                    <input type="number" step="1" value={epsilon} onChange={(e) => setEpsilon(e.target.value)}
                                        disabled={method === 'epsilon'}
                                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                </div>
                                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                    <label className="block text-sm font-semibold mb-2">Concentration c ({molarityUnit})</label>
                                    <input type="number" step="any" value={concentration} onChange={(e) => setConcentration(e.target.value)}
                                        disabled={method === 'concentration'}
                                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                </div>
                                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                                    <label className="block text-sm font-semibold mb-2">Path length l ({pathLengthUnit})</label>
                                    <input type="number" step="0.01" value={pathLength} onChange={(e) => setPathLength(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg" />
                                </div>
                                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                                    <label className="block text-sm font-semibold mb-2">Absorbance A</label>
                                    <input type="number" step="0.001" value={absorbance} onChange={(e) => setAbsorbance(e.target.value)}
                                        disabled={method === 'absorbance'}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Common Compounds</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {sampleCompounds.map((c, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{c.name}</div>
                                            <div>ε {c.epsilon} · {c.lambda} nm</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        {/* Details Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Beer‑Lambert Law
                                </h3>
                                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> The Beer‑Lambert law states that absorbance is proportional to concentration and path length: A = ε · c · l.</p>
                                    <p><span className="font-semibold">Terms:</span> ε = molar absorptivity (L·mol⁻¹·cm⁻¹), c = concentration (mol/L), l = path length (cm).</p>
                                    <p><span className="font-semibold">Assumptions:</span> Monochromatic light, non‑scattering medium, no chemical interactions, homogeneous solution.</p>
                                    <p><span className="font-semibold">Transmittance:</span> T = 10⁻ᴬ · 100%.</p>
                                    <p><span className="font-semibold">Applications:</span> Concentration determination, purity assessment, reaction kinetics, quality control.</p>
                                    <p className="text-xs italic">Sources: IUPAC, USP General Chapter `&gt;`851 Harris’ Quantitative Chemical Analysis.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {calculatedValue !== null && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <Eye className="w-7 h-7 mr-3" />
                                    {method === 'absorbance' ? 'Absorbance' : method === 'concentration' ? 'Concentration' : 'Molar absorptivity'}
                                </h2>
                                <div className="bg-white/20 rounded-xl p-6 text-center">
                                    <div className="text-5xl font-bold mb-2">
                                        {method === 'concentration' ? calculatedValue.toExponential(4) : calculatedValue.toFixed(4)}
                                    </div>
                                    <div className="text-xl">
                                        {method === 'absorbance' ? 'A' : method === 'concentration' ? molarityUnit : 'M⁻¹cm⁻¹'}
                                    </div>
                                </div>
                                {transmittance !== null && (
                                    <div className="bg-white/10 rounded-lg p-4 mt-4 text-center">
                                        <div className="text-sm">Transmittance</div>
                                        <div className="text-2xl font-bold">{transmittance.toFixed(2)}%</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Calibration Curve</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="conc" tick={{fontSize:10}} />
                                        <YAxis tick={{fontSize:10}} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="abs" stroke="#3b82f6" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {method === 'absorbance' && calculatedValue !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Quality</h3>
                                <p>{getAbsorbanceInterpretation(calculatedValue)}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Beer‑Lambert Law</h3>
                            <p className="text-sm font-mono">A = ε · c · l</p>
                            <p className="text-xs mt-2">T = 10⁻ᴬ · 100%</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}