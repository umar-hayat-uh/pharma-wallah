"use client";
import { useState, useEffect } from 'react';
import { Atom, RefreshCw, AlertCircle, Battery } from 'lucide-react';

type Electrolyte = {
    name: string;
    formula: string;
    molecularWeight: number;
    valence: number;
    commonForms: string[];
};

type ConversionType = 'mmol_to_mg' | 'mg_to_mmol' | 'mEq_to_mg' | 'mg_to_mEq';

export default function ElectrolyteConversionCalculator() {
    const [inputValue, setInputValue] = useState<string>('100');
    const [selectedElectrolyte, setSelectedElectrolyte] = useState<string>('sodium');
    const [conversionType, setConversionType] = useState<ConversionType>('mmol_to_mg');
    const [convertedValue, setConvertedValue] = useState<number | null>(null);
    const [significantFigures, setSignificantFigures] = useState<number>(4);

    const electrolytes: Record<string, Electrolyte> = {
        sodium: {
            name: 'Sodium (Na⁺)',
            formula: 'Na',
            molecularWeight: 22.99,
            valence: 1,
            commonForms: ['NaCl', 'NaHCO₃']
        },
        potassium: {
            name: 'Potassium (K⁺)',
            formula: 'K',
            molecularWeight: 39.10,
            valence: 1,
            commonForms: ['KCl', 'KAcetate']
        },
        calcium: {
            name: 'Calcium (Ca²⁺)',
            formula: 'Ca',
            molecularWeight: 40.08,
            valence: 2,
            commonForms: ['CaCl₂', 'CaGluconate']
        },
        magnesium: {
            name: 'Magnesium (Mg²⁺)',
            formula: 'Mg',
            molecularWeight: 24.31,
            valence: 2,
            commonForms: ['MgSO₄', 'MgCl₂']
        },
        chloride: {
            name: 'Chloride (Cl⁻)',
            formula: 'Cl',
            molecularWeight: 35.45,
            valence: 1,
            commonForms: ['NaCl', 'KCl']
        },
        bicarbonate: {
            name: 'Bicarbonate (HCO₃⁻)',
            formula: 'HCO₃',
            molecularWeight: 61.02,
            valence: 1,
            commonForms: ['NaHCO₃']
        },
        phosphate: {
            name: 'Phosphate (PO₄³⁻)',
            formula: 'PO₄',
            molecularWeight: 94.97,
            valence: 3,
            commonForms: ['KPhosphate', 'NaPhosphate']
        }
    };

    const commonConversions = [
        { electrolyte: 'sodium', type: 'mEq_to_mg' as ConversionType, value: 20 },
        { electrolyte: 'potassium', type: 'mEq_to_mg' as ConversionType, value: 10 },
        { electrolyte: 'calcium', type: 'mEq_to_mg' as ConversionType, value: 10 },
        { electrolyte: 'magnesium', type: 'mEq_to_mg' as ConversionType, value: 12 },
        { electrolyte: 'chloride', type: 'mEq_to_mg' as ConversionType, value: 20 }
    ];

    const calculateConversion = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || value <= 0) {
            setConvertedValue(null);
            return;
        }

        const electrolyte = electrolytes[selectedElectrolyte];
        let result: number;

        switch (conversionType) {
            case 'mmol_to_mg':
                // mmol → mg: mmol × molecular weight
                result = value * electrolyte.molecularWeight;
                break;
            case 'mg_to_mmol':
                // mg → mmol: mg ÷ molecular weight
                result = value / electrolyte.molecularWeight;
                break;
            case 'mEq_to_mg':
                // mEq → mg: mEq × (molecular weight ÷ valence)
                result = value * (electrolyte.molecularWeight / electrolyte.valence);
                break;
            case 'mg_to_mEq':
                // mg → mEq: mg ÷ (molecular weight ÷ valence)
                result = value / (electrolyte.molecularWeight / electrolyte.valence);
                break;
            default:
                result = 0;
        }

        setConvertedValue(result);
    };

    const resetCalculator = () => {
        setInputValue('100');
        setSelectedElectrolyte('sodium');
        setConversionType('mmol_to_mg');
        setConvertedValue(null);
    };

    const loadCommonConversion = (index: number) => {
        const conv = commonConversions[index];
        setSelectedElectrolyte(conv.electrolyte);
        setConversionType(conv.type);
        setInputValue(conv.value.toString());
    };

    const formatNumber = (num: number): string => {
        if (num === 0) return '0';
        if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
            return num.toExponential(significantFigures - 1);
        }
        const factor = Math.pow(10, significantFigures);
        const rounded = Math.round(num * factor) / factor;
        return rounded.toString();
    };

    const getConversionLabel = () => {
        switch (conversionType) {
            case 'mmol_to_mg': return 'mmol → mg';
            case 'mg_to_mmol': return 'mg → mmol';
            case 'mEq_to_mg': return 'mEq → mg';
            case 'mg_to_mEq': return 'mg → mEq';
            default: return '';
        }
    };

    const getResultUnit = () => {
        switch (conversionType) {
            case 'mmol_to_mg': return 'mg';
            case 'mg_to_mmol': return 'mmol';
            case 'mEq_to_mg': return 'mg';
            case 'mg_to_mEq': return 'mEq';
            default: return '';
        }
    };

    useEffect(() => {
        calculateConversion();
    }, [inputValue, selectedElectrolyte, conversionType, significantFigures]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Atom className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Electrolyte Conversion Calculator</h1>
                                <p className="text-blue-100 mt-2">Convert between mmol, mEq, and mg for electrolyte therapy</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Battery className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Critical Care</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Atom className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Electrolyte Conversion
                            </h2>

                            {/* Conversion Inputs */}
                            <div className="space-y-6">
                                {/* Electrolyte Selection */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Electrolyte Selection</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {Object.entries(electrolytes).map(([key, electrolyte]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedElectrolyte(key)}
                                                className={`p-3 rounded-lg border transition-all ${selectedElectrolyte === key ?
                                                    'bg-gradient-to-r from-blue-600 to-green-400 text-white border-transparent' :
                                                    'bg-white border-blue-200 text-gray-700 hover:bg-blue-50'}`}
                                            >
                                                <div className="font-semibold">{electrolyte.name.split(' ')[0]}</div>
                                                <div className="text-xs mt-1">{electrolyte.formula}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Conversion Type */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Type</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => setConversionType('mmol_to_mg')}
                                            className={`p-4 rounded-lg transition-all ${conversionType === 'mmol_to_mg' ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <div className="font-semibold">mmol → mg</div>
                                            <div className="text-xs mt-1">Millimole to Milligram</div>
                                        </button>
                                        <button
                                            onClick={() => setConversionType('mg_to_mmol')}
                                            className={`p-4 rounded-lg transition-all ${conversionType === 'mg_to_mmol' ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <div className="font-semibold">mg → mmol</div>
                                            <div className="text-xs mt-1">Milligram to Millimole</div>
                                        </button>
                                        <button
                                            onClick={() => setConversionType('mEq_to_mg')}
                                            className={`p-4 rounded-lg transition-all ${conversionType === 'mEq_to_mg' ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <div className="font-semibold">mEq → mg</div>
                                            <div className="text-xs mt-1">Milliequivalent to Milligram</div>
                                        </button>
                                        <button
                                            onClick={() => setConversionType('mg_to_mEq')}
                                            className={`p-4 rounded-lg transition-all ${conversionType === 'mg_to_mEq' ?
                                                'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' :
                                                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <div className="font-semibold">mg → mEq</div>
                                            <div className="text-xs mt-1">Milligram to Milliequivalent</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Input Value */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Input Value
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="Enter value"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Significant Figures
                                            </label>
                                            <select
                                                value={significantFigures}
                                                onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                            >
                                                {[2, 3, 4, 5, 6].map(num => (
                                                    <option key={num} value={num}>{num} digits</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Common Electrolyte Doses */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Common Electrolyte Doses</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {commonConversions.map((conv, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadCommonConversion(index)}
                                                className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-blue-700">
                                                    {conv.value} mEq
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1 capitalize">
                                                    {conv.electrolyte}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateConversion}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Convert Electrolyte
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
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Conversion Result */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Atom className="w-7 h-7 mr-3" />
                                Conversion Result
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        {inputValue} {getConversionLabel().split('→')[0]} =
                                    </div>
                                    {convertedValue !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {formatNumber(convertedValue)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {getResultUnit()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Electrolyte Info */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="text-sm font-semibold mb-1">
                                        {electrolytes[selectedElectrolyte].name}
                                    </div>
                                    <div className="text-xs">
                                        MW: {electrolytes[selectedElectrolyte].molecularWeight} g/mol
                                        | Valence: {electrolytes[selectedElectrolyte].valence}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Significance */}
                        {convertedValue !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Clinical Significance
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {selectedElectrolyte === 'sodium' && 'Normal serum sodium: 135-145 mEq/L. Critical for fluid balance and nerve function.'}
                                            {selectedElectrolyte === 'potassium' && 'Normal serum potassium: 3.5-5.0 mEq/L. Critical for cardiac function.'}
                                            {selectedElectrolyte === 'calcium' && 'Normal serum calcium: 8.5-10.2 mg/dL. Important for bone health and muscle function.'}
                                            {selectedElectrolyte === 'magnesium' && 'Normal serum magnesium: 1.7-2.2 mg/dL. Cofactor for many enzymes.'}
                                            {selectedElectrolyte === 'chloride' && 'Normal serum chloride: 98-106 mEq/L. Maintains electrical neutrality.'}
                                            {selectedElectrolyte === 'bicarbonate' && 'Normal serum bicarbonate: 22-28 mEq/L. Major blood buffer.'}
                                            {selectedElectrolyte === 'phosphate' && 'Normal serum phosphate: 2.5-4.5 mg/dL. Important for energy metabolism.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Common Salt Forms */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Common Salt Forms</h3>
                            <div className="space-y-3">
                                {electrolytes[selectedElectrolyte].commonForms.map((form, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700 font-medium">{form}</span>
                                        <span className="text-xs text-gray-500">Salt form</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conversion Formulas */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Conversion Formulas</h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">mmol → mg</div>
                                    <div className="font-mono text-xs">mg = mmol × Molecular Weight</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">mEq → mg</div>
                                    <div className="font-mono text-xs">mg = mEq × (MW ÷ Valence)</div>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-1">For monovalent ions</div>
                                    <div className="font-mono text-xs">1 mmol = 1 mEq</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Electrolyte Reference Table */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Electrolyte Reference Table</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                    <th className="p-3 text-left font-semibold text-gray-700">Electrolyte</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Symbol</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Molecular Weight</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">Valence</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">mEq per mmol</th>
                                    <th className="p-3 text-left font-semibold text-gray-700">mg per mEq</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(electrolytes).map((electrolyte, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">{electrolyte.name}</td>
                                        <td className="p-3 font-mono">{electrolyte.formula}</td>
                                        <td className="p-3">{electrolyte.molecularWeight.toFixed(2)}</td>
                                        <td className="p-3">{electrolyte.valence}</td>
                                        <td className="p-3">{electrolyte.valence}</td>
                                        <td className="p-3">{(electrolyte.molecularWeight / electrolyte.valence).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}