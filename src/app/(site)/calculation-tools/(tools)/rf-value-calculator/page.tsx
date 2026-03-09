"use client";
import { useState, useEffect } from 'react';
import { Move, Calculator, Ruler, RefreshCw, AlertCircle, TrendingUp, Target, Info, BookOpen, Database, ChevronUp , ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RfValueCalculator() {
    const [multiple, setMultiple] = useState(false);
    const [distSolvent, setDistSolvent] = useState<string>('10');
    const [distCompound, setDistCompound] = useState<string>('4');
    const [compoundDistances, setCompoundDistances] = useState<string[]>(['4','6','8']);
    const [solventDistances, setSolventDistances] = useState<string[]>(['10','10','10']);
    const [rfValues, setRfValues] = useState<number[]>([]);
    const [unit, setUnit] = useState<'cm'|'mm'>('cm');
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        if (multiple) {
            const vals = compoundDistances.map((c, i) => {
                const cd = parseFloat(c);
                const sd = parseFloat(solventDistances[i]);
                return !isNaN(cd) && !isNaN(sd) && sd > 0 ? cd / sd : 0;
            });
            setRfValues(vals);
        } else {
            const cd = parseFloat(distCompound);
            const sd = parseFloat(distSolvent);
            if (!isNaN(cd) && !isNaN(sd) && sd > 0) setRfValues([cd / sd]);
        }
    };

    useEffect(() => { calculate(); }, [distCompound, distSolvent, compoundDistances, solventDistances, multiple]);

    const reset = () => {
        setMultiple(false);
        setDistSolvent('10');
        setDistCompound('4');
        setCompoundDistances(['4','6','8']);
        setSolventDistances(['10','10','10']);
        setUnit('cm');
    };

    const addCompound = () => {
        setCompoundDistances([...compoundDistances, '']);
        setSolventDistances([...solventDistances, '10']);
    };
    const removeCompound = (idx: number) => {
        if (compoundDistances.length > 1) {
            setCompoundDistances(compoundDistances.filter((_, i) => i !== idx));
            setSolventDistances(solventDistances.filter((_, i) => i !== idx));
        }
    };
    const updateCompound = (idx: number, val: string) => {
        const newArr = [...compoundDistances];
        newArr[idx] = val;
        setCompoundDistances(newArr);
    };
    const updateSolvent = (idx: number, val: string) => {
        const newArr = [...solventDistances];
        newArr[idx] = val;
        setSolventDistances(newArr);
    };

    const examples = [
        { name: 'Medium polarity', compound: '4', solvent: '10', rf: '0.4' },
        { name: 'Non‑polar', compound: '7.5', solvent: '10', rf: '0.75' },
        { name: 'Polar', compound: '2', solvent: '10', rf: '0.2' },
        { name: 'Mixture', compounds: ['2','4','7'], solvent: '10' }
    ];
    const loadSample = (idx: number) => {
        const ex = examples[idx];
        if (ex.compounds) {
            setMultiple(true);
            setCompoundDistances(ex.compounds);
            setSolventDistances(Array(ex.compounds.length).fill(ex.solvent));
        } else {
            setMultiple(false);
            setDistCompound(ex.compound);
            setDistSolvent(ex.solvent);
        }
    };

    const getRfInterpretation = (rf: number) => {
        if (rf < 0.1) return 'Very polar – strongly retained';
        if (rf < 0.3) return 'Polar – good for separation';
        if (rf < 0.7) return 'Medium polarity – typical range';
        if (rf < 0.9) return 'Non‑polar – fast moving';
        return 'Very non‑polar – near solvent front';
    };

    const barData = rfValues.map((rf, i) => ({ name: `Spot ${i+1}`, rf }));

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Move className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Rf Value Calculator</h1>
                                <p className="text-blue-100 mt-2">Rf = distance compound / distance solvent</p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg">
                            <Ruler className="w-5 h-5 text-white inline mr-2" />
                            <span className="text-white font-semibold">TLC Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Distances</h2>
                                <button onClick={() => setMultiple(!multiple)}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-lg">
                                    {multiple ? 'Single' : 'Multiple'}
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <label className="text-sm font-semibold">Units</label>
                                <div className="grid grid-cols-2 gap-2 w-32 mt-2">
                                    {['cm','mm'].map(u => (
                                        <button key={u} onClick={() => setUnit(u as 'cm'|'mm')}
                                            className={`py-2 text-sm rounded-lg ${unit === u ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white' : 'bg-white border'}`}>
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!multiple ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Compound distance ({unit})</label>
                                        <input type="number" step="0.1" value={distCompound} onChange={(e) => setDistCompound(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Solvent distance ({unit})</label>
                                        <input type="number" step="0.1" value={distSolvent} onChange={(e) => setDistSolvent(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {compoundDistances.map((cd, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold">Spot {idx+1}</span>
                                                <button onClick={() => removeCompound(idx)} disabled={compoundDistances.length <= 1}
                                                    className="text-red-500 hover:text-red-700 disabled:opacity-50">✕</button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="number" step="0.1" placeholder={`Compound (${unit})`} value={cd}
                                                    onChange={(e) => updateCompound(idx, e.target.value)}
                                                    className="px-3 py-2 border rounded-lg" />
                                                <input type="number" step="0.1" placeholder={`Solvent (${unit})`} value={solventDistances[idx]}
                                                    onChange={(e) => updateSolvent(idx, e.target.value)}
                                                    className="px-3 py-2 border rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addCompound} className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50">
                                        + Add Spot
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-3">Examples</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {examples.map((ex, idx) => (
                                        <button key={idx} onClick={() => loadSample(idx)}
                                            className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                                            <div className="font-semibold">{ex.name}</div>
                                            <div>{ex.rf ? `Rf ${ex.rf}` : `${ex.compounds?.length} spots`}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                                    Calculate Rf
                                </button>
                                <button onClick={reset}
                                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 mr-2" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About TLC & Rf Values
                                </h3>
                                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {showDetails && (
                                <div className="mt-4 space-y-3 text-sm text-gray-600">
                                    <p><span className="font-semibold">Rf (Retention factor):</span> distance traveled by compound divided by distance traveled by solvent front.</p>
                                    <p><span className="font-semibold">Range:</span> 0 to 1. Ideal range 0.2‑0.8.</p>
                                    <p><span className="font-semibold">Factors affecting Rf:</span> stationary phase, mobile phase, temperature, chamber saturation, plate activity.</p>
                                    <p><span className="font-semibold">Applications:</span> reaction monitoring, purity checking, compound identification.</p>
                                    <p className="text-xs italic">Sources: Merck TLC Guide, Vogel’s Textbook of Practical Organic Chemistry.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {rfValues.length > 0 && (
                            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                <h2 className="text-2xl font-bold mb-4">Rf Values</h2>
                                {rfValues.map((rf, i) => (
                                    <div key={i} className="bg-white/20 rounded-lg p-3 mb-2 flex justify-between">
                                        <span>Spot {i+1}</span>
                                        <span className="font-bold">{rf.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Rf Comparison</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{fontSize:10}} />
                                        <YAxis domain={[0,1]} />
                                        <Tooltip />
                                        <Bar dataKey="rf" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {!multiple && rfValues[0] !== undefined && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Interpretation</h3>
                                <p>{getRfInterpretation(rfValues[0])}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Rf Guide</h3>
                            <p>0.0‑0.3: Polar<br />0.3‑0.7: Medium<br />0.7‑1.0: Non‑polar</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}