"use client";
import { useState } from 'react';
import { Calculator, Droplets, Thermometer, Plus, Trash2, AlertCircle, FlaskConical, Eye, Syringe, Activity } from 'lucide-react';

interface Ingredient {
    id: number;
    name: string;
    concentration: string;
    concentrationUnit: 'w/v%' | 'mg/mL' | 'mM';
    eValue: string;
    category: 'drug' | 'preservative' | 'buffer' | 'other';
}

export default function IsotonicityCalculator() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: 1, name: 'Active Drug', concentration: '1', concentrationUnit: 'w/v%', eValue: '0.15', category: 'drug' },
        { id: 2, name: 'Benzalkonium Chloride', concentration: '0.01', concentrationUnit: 'w/v%', eValue: '0.16', category: 'preservative' },
        { id: 3, name: 'Sodium Chloride', concentration: '0', concentrationUnit: 'w/v%', eValue: '1.00', category: 'other' },
    ]);

    const [result, setResult] = useState<{
        naclEquivalent: number;
        naclToAdd: number;
        tonicity: 'hypotonic' | 'isotonic' | 'hypertonic';
        freezingPoint: number;
        osmolality: number;
    } | null>(null);

    const commonIngredients = [
        { name: 'Boric Acid', eValue: '0.50', category: 'buffer' },
        { name: 'Sodium Borate', eValue: '0.42', category: 'buffer' },
        { name: 'Dextrose', eValue: '0.18', category: 'other' },
        { name: 'Mannitol', eValue: '0.18', category: 'other' },
        { name: 'Glycerin', eValue: '0.34', category: 'other' },
        { name: 'Phenylephrine HCl', eValue: '0.32', category: 'drug' },
        { name: 'Tropicamide', eValue: '0.10', category: 'drug' },
        { name: 'Sodium Phosphate', eValue: '0.29', category: 'buffer' },
        { name: 'Potassium Phosphate', eValue: '0.40', category: 'buffer' },
    ];

    const addIngredient = () => {
        const newId = ingredients.length > 0 ? Math.max(...ingredients.map(i => i.id)) + 1 : 1;
        setIngredients([
            ...ingredients,
            {
                id: newId,
                name: '',
                concentration: '',
                concentrationUnit: 'w/v%',
                eValue: '',
                category: 'drug'
            }
        ]);
    };

    const removeIngredient = (id: number) => {
        if (ingredients.length <= 1) return;
        setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const updateIngredient = (id: number, field: keyof Ingredient, value: string) => {
        setIngredients(ingredients.map(ing =>
            ing.id === id ? { ...ing, [field]: value } : ing
        ));
    };

    const calculateIsotonicity = () => {
        let totalNaClEquivalent = 0;

        ingredients.forEach(ingredient => {
            const concentration = parseFloat(ingredient.concentration);
            const eValue = parseFloat(ingredient.eValue);

            if (isNaN(concentration) || isNaN(eValue) || concentration < 0) {
                return;
            }

            // Convert to w/v% if needed
            let concentrationPercent = concentration;
            if (ingredient.concentrationUnit === 'mg/mL') {
                concentrationPercent = concentration / 10; // 1% = 10 mg/mL
            } else if (ingredient.concentrationUnit === 'mM') {
                // Approximate conversion for small molecules (MW ~180) – simplified
                concentrationPercent = concentration * 0.001; // very rough
            }

            totalNaClEquivalent += concentrationPercent * eValue;
        });

        // NaCl required for isotonicity (0.9% NaCl is isotonic)
        const naclToAdd = Math.max(0, 0.9 - totalNaClEquivalent);

        // Determine tonicity
        let tonicity: 'hypotonic' | 'isotonic' | 'hypertonic' = 'isotonic';
        if (totalNaClEquivalent < 0.85) {
            tonicity = 'hypotonic';
        } else if (totalNaClEquivalent > 0.95) {
            tonicity = 'hypertonic';
        }

        // Calculate freezing point depression (ΔTf = 0.52°C for isotonic)
        const freezingPoint = -0.52 * (totalNaClEquivalent / 0.9);

        // Estimate osmolality (isotonic ~ 290 mOsm/kg)
        const osmolality = 290 * (totalNaClEquivalent / 0.9);

        setResult({
            naclEquivalent: totalNaClEquivalent,
            naclToAdd,
            tonicity,
            freezingPoint,
            osmolality
        });
    };

    const resetCalculator = () => {
        setIngredients([
            { id: 1, name: 'Active Drug', concentration: '1', concentrationUnit: 'w/v%', eValue: '0.15', category: 'drug' },
            { id: 2, name: 'Benzalkonium Chloride', concentration: '0.01', concentrationUnit: 'w/v%', eValue: '0.16', category: 'preservative' },
            { id: 3, name: 'Sodium Chloride', concentration: '0', concentrationUnit: 'w/v%', eValue: '1.00', category: 'other' },
        ]);
        setResult(null);
    };

    const addCommonIngredient = (ingredient: typeof commonIngredients[0]) => {
        const newId = ingredients.length > 0 ? Math.max(...ingredients.map(i => i.id)) + 1 : 1;
        setIngredients([
            ...ingredients,
            {
                id: newId,
                name: ingredient.name,
                concentration: '1',
                concentrationUnit: 'w/v%',
                eValue: ingredient.eValue,
                category: ingredient.category as any
            }
        ]);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Isotonicity Calculator</h1>
                                <p className="text-cyan-100 mt-2">Sodium chloride equivalents (E-values) for ophthalmic/parenteral formulations</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIngredients([
                                    { id: 1, name: 'Dextrose', concentration: '5', concentrationUnit: 'w/v%', eValue: '0.18', category: 'other' },
                                    { id: 2, name: 'Sodium Chloride', concentration: '0', concentrationUnit: 'w/v%', eValue: '1.00', category: 'other' },
                                ]);
                            }}
                            className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors text-sm"
                        >
                            IV Example
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <FlaskConical className="w-6 h-6 mr-2 text-cyan-600" />
                                Formulation Ingredients
                            </h2>

                            {/* Ingredients Table */}
                            <div className="overflow-x-auto mb-8">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Ingredient</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Concentration</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">E-Value</th>
                                            <th className="py-3 px-4 text-left font-semibold text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredients.map((ingredient) => (
                                            <tr key={ingredient.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="text"
                                                        value={ingredient.name}
                                                        onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                                                        placeholder="Name"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            value={ingredient.concentration}
                                                            onChange={(e) => updateIngredient(ingredient.id, 'concentration', e.target.value)}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                                                            placeholder="0.00"
                                                        />
                                                        <select
                                                            value={ingredient.concentrationUnit}
                                                            onChange={(e) => updateIngredient(ingredient.id, 'concentrationUnit', e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                                                        >
                                                            <option value="w/v%">w/v%</option>
                                                            <option value="mg/mL">mg/mL</option>
                                                            <option value="mM">mM</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={ingredient.eValue}
                                                        onChange={(e) => updateIngredient(ingredient.id, 'eValue', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                                                        placeholder="E-value"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => removeIngredient(ingredient.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        disabled={ingredients.length <= 1}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Ingredient Button */}
                            <button
                                onClick={addIngredient}
                                className="w-full py-3 border-2 border-dashed border-cyan-300 rounded-lg text-cyan-600 hover:bg-cyan-50 transition-colors flex items-center justify-center mb-8"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Another Ingredient
                            </button>

                            {/* Common Ingredients */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Ingredients</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {commonIngredients.map((ing, index) => (
                                        <button
                                            key={index}
                                            onClick={() => addCommonIngredient(ing)}
                                            className="p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg transition-colors text-left"
                                        >
                                            <div className="font-medium text-gray-800">{ing.name}</div>
                                            <div className="text-sm text-cyan-600">E: {ing.eValue}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={calculateIsotonicity}
                                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-400 hover:from-cyan-700 hover:to-blue-500 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
                                >
                                    Calculate Isotonicity
                                </button>
                                <button
                                    onClick={resetCalculator}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Results Display */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Thermometer className="w-6 h-6 mr-2 text-cyan-600" />
                                    Isotonicity Results
                                </h2>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className={`rounded-xl p-6 ${result.tonicity === 'isotonic' ? 'bg-gradient-to-br from-green-50 to-emerald-100' : result.tonicity === 'hypotonic' ? 'bg-gradient-to-br from-blue-50 to-cyan-100' : 'bg-gradient-to-br from-red-50 to-rose-100'}`}>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Tonicity</div>
                                        <div className={`text-2xl font-bold ${result.tonicity === 'isotonic' ? 'text-green-600' : result.tonicity === 'hypotonic' ? 'text-blue-600' : 'text-red-600'}`}>
                                            {result.tonicity.toUpperCase()}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            {result.tonicity === 'isotonic' ? 'Ideal' : result.tonicity === 'hypotonic' ? 'May cause irritation' : 'May cause pain'}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-cyan-700 mb-2">NaCl to Add</div>
                                        <div className="text-2xl font-bold text-cyan-600">
                                            {result.naclToAdd.toFixed(3)}%
                                        </div>
                                        <div className="text-sm text-cyan-600 mt-2">per 100 mL</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-purple-700 mb-2">Freezing Point</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {result.freezingPoint.toFixed(2)}°C
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-orange-700 mb-2">Osmolality</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {result.osmolality.toFixed(0)} mOsm/kg
                                        </div>
                                    </div>
                                </div>

                                {/* Tonicity Scale */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tonicity Scale</h3>
                                    <div className="h-12 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full relative">
                                        <div className="absolute top-0 bottom-0 w-1 bg-black" style={{ left: `${Math.min((result.naclEquivalent / 1.8) * 100, 100)}%` }}>
                                            <div className="absolute -top-8 -ml-6 text-sm font-semibold whitespace-nowrap">
                                                {result.naclEquivalent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span>0% (Water)</span>
                                        <span>0.9% (Isotonic)</span>
                                        <span>1.8% (Hypertonic)</span>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Syringe className="w-5 h-5 mr-2" />
                                        Formulation Instructions
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-2">
                                        To make this formulation isotonic, add <strong>{result.naclToAdd.toFixed(3)} g</strong> of sodium chloride per 100 mL.
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Alternatives: Dextrose {(result.naclToAdd / 0.18).toFixed(2)}%, Glycerin {(result.naclToAdd / 0.34).toFixed(2)}%, Boric acid {(result.naclToAdd / 0.50).toFixed(2)}%.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Formula Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-cyan-500" />
                                E-value Formula
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-lg font-mono text-center text-cyan-700 mb-3">
                                    Σ(C × E) = 0.9%
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>C = concentration (% w/v)</p>
                                    <p>E = NaCl equivalent</p>
                                    <p>0.9% = isotonic NaCl</p>
                                </div>
                            </div>
                        </div>

                        {/* Importance */}
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Eye className="w-5 h-5 mr-2 text-cyan-600" />
                                Why Isotonicity Matters
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Prevents ocular discomfort and tissue damage</li>
                                <li>• Essential for IV solutions (prevents hemolysis)</li>
                                <li>• Affects drug absorption</li>
                                <li>• Required by pharmacopoeias</li>
                            </ul>
                        </div>

                        {/* Common E-values */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common E-values</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Sodium Chloride</span><span className="font-bold text-cyan-600">1.00</span></div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Dextrose</span><span className="font-bold text-cyan-600">0.18</span></div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Boric Acid</span><span className="font-bold text-cyan-600">0.50</span></div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Glycerin</span><span className="font-bold text-cyan-600">0.34</span></div>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Guidelines</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Ophthalmic:</span> 0.6–1.1% NaCl equiv</p>
                                <p><span className="font-semibold">IV:</span> 0.45–0.9% acceptable</p>
                                <p><span className="font-semibold">IM:</span> small volumes can be hypertonic</p>
                                <p><span className="font-semibold">Neonatal:</span> strict isotonicity</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}