"use client";
import { useState } from 'react';
import { Target, RefreshCw, Activity, Info } from 'lucide-react';

export default function DrugReceptorBindingAffinityTool() {
    const [kd, setKd] = useState<string>('');
    const [ki, setKi] = useState<string>('');
    const [ic50, setIc50] = useState<string>('');
    const [ligandConcentration, setLigandConcentration] = useState<string>('10');
    const [receptorConcentration, setReceptorConcentration] = useState<string>('1');
    const [result, setResult] = useState<{
        affinity: string;
        occupancy: number;
        classification: string;
        color: string;
        bindingConstant: number;
    } | null>(null);

    const calculateAffinity = () => {
        let bindingConstant = 0;
        let affinity = '';

        // Use whichever parameter is provided
        if (kd) {
            bindingConstant = parseFloat(kd);
            affinity = `Kd = ${bindingConstant} nM`;
        } else if (ki) {
            bindingConstant = parseFloat(ki);
            affinity = `Ki = ${bindingConstant} nM`;
        } else if (ic50) {
            bindingConstant = parseFloat(ic50);
            // Convert IC50 to Ki using Cheng-Prusoff approximation
            const L = parseFloat(ligandConcentration);
            const Km = 100; // Assumed for calculation
            const kiValue = bindingConstant / (1 + (L / Km));
            bindingConstant = kiValue;
            affinity = `IC50 = ${ic50} nM (Ki ≈ ${kiValue.toFixed(2)} nM)`;
        } else {
            alert('Please enter at least one binding parameter');
            return;
        }

        // Calculate receptor occupancy
        const L = parseFloat(ligandConcentration);
        const R = parseFloat(receptorConcentration);
        const occupancy = (L * R) / (bindingConstant + L) * 100;

        let classification = '';
        let color = '';

        if (bindingConstant < 0.1) {
            classification = 'ULTRA-HIGH AFFINITY';
            color = 'text-purple-600';
        } else if (bindingConstant < 1) {
            classification = 'HIGH AFFINITY';
            color = 'text-green-600';
        } else if (bindingConstant < 100) {
            classification = 'MEDIUM AFFINITY';
            color = 'text-blue-600';
        } else if (bindingConstant < 1000) {
            classification = 'LOW AFFINITY';
            color = 'text-yellow-600';
        } else {
            classification = 'VERY LOW AFFINITY';
            color = 'text-red-600';
        }

        setResult({
            affinity,
            occupancy: Math.min(occupancy, 100),
            classification,
            color,
            bindingConstant
        });
    };

    const resetCalculator = () => {
        setKd('');
        setKi('');
        setIc50('');
        setLigandConcentration('10');
        setReceptorConcentration('1');
        setResult(null);
    };

    const bindingParameters = [
        { parameter: 'Kd', description: 'Dissociation Constant', unit: 'nM', typical: '0.1-1000' },
        { parameter: 'Ki', description: 'Inhibition Constant', unit: 'nM', typical: '0.1-1000' },
        { parameter: 'IC50', description: 'Half-Maximal Inhibitory Conc.', unit: 'nM', typical: '1-10000' },
    ];

    const exampleDrugs = [
        { drug: 'Fentanyl (μ-opioid)', Kd: '0.1', affinity: 'Ultra-High' },
        { drug: 'Propranolol (β-blocker)', Kd: '1.0', affinity: 'High' },
        { drug: 'Aspirin (COX-1)', Kd: '100', affinity: 'Medium' },
        { drug: 'Warfarin (VKOR)', Kd: '1000', affinity: 'Low' },
        { drug: 'Penicillin (PBPs)', Kd: '10000', affinity: 'Very Low' },
    ];

    return (
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">

            <div className="max-w-7xl mx-auto  bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center mb-6">
                    <Target className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Drug-Receptor Binding Affinity Tool</h2>
                        <p className="text-gray-600">Calculate binding affinity and receptor occupancy</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Kd (nM)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={kd}
                                    onChange={(e) => setKd(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    placeholder="e.g., 10"
                                />
                                <p className="text-xs text-gray-600 mt-1">Dissociation constant</p>
                            </div>

                            <div className="bg-green-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Ki (nM)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={ki}
                                    onChange={(e) => setKi(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                    placeholder="e.g., 5"
                                />
                                <p className="text-xs text-gray-600 mt-1">Inhibition constant</p>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    IC50 (nM)
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={ic50}
                                    onChange={(e) => setIc50(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                    placeholder="e.g., 50"
                                />
                                <p className="text-xs text-gray-600 mt-1">Half-maximal inhibition</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Ligand [L] (nM)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={ligandConcentration}
                                    onChange={(e) => setLigandConcentration(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div className="bg-amber-50 rounded-xl p-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">
                                    Receptor [R] (nM)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={receptorConcentration}
                                    onChange={(e) => setReceptorConcentration(e.target.value)}
                                    className="w-full px-3 py-2 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-400 focus:outline-none"
                                    placeholder="e.g., 1"
                                />
                            </div>
                        </div>

                        {/* Binding Visualization */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4 text-center">Drug-Receptor Binding Visualization</h3>
                            <div className="relative h-48">
                                {/* Receptors */}
                                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                                    {[0, 1, 2].map(i => (
                                        <div
                                            key={i}
                                            className="absolute w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-blue-700"
                                            style={{ left: `${i * 30}px`, top: `${i * -15}px` }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Ligands */}
                                <div className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                                    {[0, 1, 2].map(i => (
                                        <div
                                            key={i}
                                            className="absolute w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full"
                                            style={{ left: `${i * 25}px`, top: `${i * 15}px` }}
                                        ></div>
                                    ))}
                                </div>

                                {/* Binding complex */}
                                {result && (
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="relative">
                                            {Array.from({ length: Math.min(Math.floor(result.occupancy / 33.3), 3) }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-4 border-purple-700"
                                                    style={{ left: `${i * 30}px`, top: `${i * -10}px` }}
                                                >
                                                    <div className="absolute inset-2 flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-purple-300 rounded-full"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Binding arrows */}
                                <div className="absolute top-1/2 left-1/3 right-1/3">
                                    <div className="h-1 bg-gradient-to-r from-green-400 to-blue-400 opacity-50"></div>
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-xs text-gray-600">
                                        Binding →
                                    </div>
                                </div>

                                {/* Occupancy indicator */}
                                {result && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-white px-4 py-2 rounded-lg shadow">
                                            <div className="text-sm font-bold text-purple-600">
                                                Occupancy: {result.occupancy.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Formula */}
                            <div className="mt-4 text-center">
                                <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                    Occupancy = ([L] × [R]) / (Kd + [L])
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={calculateAffinity}
                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Calculate Binding Parameters
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Results and Reference Section */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-400 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Binding Analysis Results</h3>

                                <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Binding Affinity</div>
                                    <div className={`text-3xl font-bold ${result.color} mb-2`}>
                                        {result.affinity}
                                    </div>
                                    <div className={`text-lg font-bold ${result.color}`}>
                                        {result.classification}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="font-semibold text-gray-700 mb-1">Receptor Occupancy</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {result.occupancy.toFixed(1)}%
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            At ligand concentration: {ligandConcentration} nM
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="font-semibold text-blue-800 mb-1">Binding Constant Interpretation</div>
                                        <p className="text-sm text-blue-700">
                                            Lower Kd/Ki values indicate stronger binding affinity
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Binding Parameters Reference */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <Activity className="w-5 h-5 text-green-400 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Binding Parameters Guide</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Parameter</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Range (nM)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bindingParameters.map((param, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                                <td className="py-3 px-4 font-medium">{param.parameter}</td>
                                                <td className="py-3 px-4 text-gray-600">{param.description}</td>
                                                <td className="py-3 px-4">{param.typical}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center text-yellow-800 mb-1">
                                    <Info className="w-4 h-4 mr-2" />
                                    <span className="font-semibold">Key Relationship</span>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Kd = Ki when [ligand] = [receptor]. For competitive inhibition: Ki = IC50 / (1 + [L]/Km)
                                </p>
                            </div>
                        </div>

                        {/* Example Drugs */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Example Drug Binding Affinities</h3>
                            <div className="space-y-3">
                                {exampleDrugs.map((drug, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setKd(drug.Kd)}
                                        className="w-full bg-white rounded-lg p-4 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-gray-800">{drug.drug}</div>
                                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                Kd: {drug.Kd} nM
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Affinity: <span className="font-bold">{drug.affinity}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
}