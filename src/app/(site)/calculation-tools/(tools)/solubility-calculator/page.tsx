"use client";
import { useState, useEffect } from 'react';
import { Calculator, Thermometer, AlertCircle, RefreshCw, Beaker, Zap, Droplet, Wind, FlaskRound as Flask } from 'lucide-react';

interface Unit {
  name: string;
  conversionFactor: number;
}

export default function SolubilityCalculator() {
  const [normality, setNormality] = useState<string>('1');
  const [gramWeight, setGramWeight] = useState<string>('58.5');
  const [selectedUnit, setSelectedUnit] = useState<'g/L' | 'mg/mL' | 'mol/L'>('g/L');
  const [solubility, setSolubility] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [significantFigures, setSignificantFigures] = useState<number>(4);

  const units: Unit[] = [
    { name: 'g/L', conversionFactor: 1 },
    { name: 'mg/mL', conversionFactor: 1 },
    { name: 'mol/L', conversionFactor: 1 }
  ];

  const calculateSolubility = () => {
    const N = parseFloat(normality);
    const GW = parseFloat(gramWeight);
    
    if (!isNaN(N) && !isNaN(GW) && N > 0 && GW > 0) {
      // Formula: S = N × G.W / 10
      let result = (N * GW) / 10;
      
      // Convert based on selected unit
      switch (selectedUnit) {
        case 'mg/mL':
          result *= 1000; // g/L to mg/mL
          break;
        case 'mol/L':
          result /= GW; // Convert to mol/L using molecular weight
          break;
      }
      
      setSolubility(result);
    } else {
      setSolubility(null);
    }
  };

  const resetCalculator = () => {
    setNormality('1');
    setGramWeight('58.5');
    setSelectedUnit('g/L');
    setSolubility(null);
  };

  const getSolubilityInterpretation = (value: number) => {
    if (value < 0.01) return 'Very low solubility - practically insoluble';
    if (value < 0.1) return 'Low solubility - sparingly soluble';
    if (value < 1) return 'Moderate solubility - slightly soluble';
    if (value < 10) return 'Good solubility - soluble';
    if (value < 100) return 'High solubility - freely soluble';
    return 'Very high solubility - very soluble';
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

  useEffect(() => {
    calculateSolubility();
  }, [normality, gramWeight, selectedUnit, significantFigures]);

  const commonSubstances = [
    { name: 'Sodium Chloride', formula: 'NaCl', solubility: '360' },
    { name: 'Sucrose', formula: 'C₁₂H₂₂O₁₁', solubility: '2000' },
    { name: 'Calcium Carbonate', formula: 'CaCO₃', solubility: '0.013' },
    { name: 'Silver Chloride', formula: 'AgCl', solubility: '0.0019' },
    { name: 'Glucose', formula: 'C₆H₁₂O₆', solubility: '910' },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Beaker className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Solubility Calculator</h1>
                <p className="text-blue-100 mt-2">Calculate solubility using normality formula: S = N × G.W / 10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <Thermometer className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Solubility Assessment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calculator Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
                Calculation Parameters
              </h2>

              {/* Units Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3">Output Unit</h3>
                <div className="grid grid-cols-3 gap-3">
                  {units.map((unit) => (
                    <button
                      key={unit.name}
                      onClick={() => setSelectedUnit(unit.name as 'g/L' | 'mg/mL' | 'mol/L')}
                      className={`py-3 rounded-lg transition-all ${selectedUnit === unit.name ?
                        'bg-gradient-to-r from-blue-600 to-green-400 text-white' :
                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {unit.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Normality (N)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={normality}
                        onChange={(e) => setNormality(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        placeholder="e.g., 1"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">eq/L</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Number of gram equivalent weight per liter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gram Equivalent Weight (G.W)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={gramWeight}
                        onChange={(e) => setGramWeight(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                        placeholder="e.g., 58.5 (for NaCl)"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">g/eq</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Molecular weight divided by n-factor</p>
                  </div>
                </div>

                {/* Significant Figures */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Significant Figures
                  </label>
                  <select
                    value={significantFigures}
                    onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                  >
                    {[2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} digits</option>
                    ))}
                  </select>
                </div>

                {/* Formula Toggle */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                  <button
                    onClick={() => setShowFormula(!showFormula)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-semibold text-blue-700">Show Formula</span>
                    <Zap className={`w-5 h-5 text-blue-600 transform ${showFormula ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showFormula && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-2">Solubility Formula</h4>
                      <div className="text-center p-3 bg-gray-100 rounded-lg font-mono">
                        S = N × G.W / 10
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <p><span className="font-semibold">S:</span> Solubility in g/L</p>
                        <p><span className="font-semibold">N:</span> Normality in eq/L</p>
                        <p><span className="font-semibold">G.W:</span> Gram equivalent weight in g/eq</p>
                        <p className="text-xs text-gray-600 mt-2">Note: This formula converts the result from g/100mL to g/L</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={calculateSolubility}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Calculate Solubility
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

          {/* Results and Info Sidebar */}
          <div className="space-y-6">
            {/* Solubility Result */}
            <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Beaker className="w-7 h-7 mr-3" />
                Solubility Result
              </h2>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-100 mb-2">
                    Solubility
                  </div>
                  {solubility !== null ? (
                    <>
                      <div className="text-5xl md:text-6xl font-bold mb-2 break-words">
                        {formatNumber(solubility)}
                      </div>
                      <div className="text-2xl font-semibold">
                        {selectedUnit}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-blue-100">
                      Enter Values
                    </div>
                  )}
                </div>
              </div>

              {/* Interpretation */}
              {solubility !== null && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Interpretation:</div>
                      <div className="text-sm text-blue-100">
                        {getSolubilityInterpretation(solubility)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Solubility Guidelines */}
            {solubility !== null && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Droplet className="w-5 h-5 mr-2 text-blue-600" />
                  Pharmacy Guidelines
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700">
                      {solubility < 0.1 && 'This substance has very low solubility. Consider using alternative solvents or warming the solution.'}
                      {solubility >= 0.1 && solubility < 10 && 'Moderate solubility. May require stirring or gentle heating for complete dissolution.'}
                      {solubility >= 10 && 'High solubility. Easy to prepare solutions at this concentration.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Common Substances */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Substances</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-700 font-semibold">
                      <th className="py-2 text-left">Substance</th>
                      <th className="py-2 text-center">Formula</th>
                      <th className="py-2 text-right">Solubility (g/L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonSubstances.map((sub, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800">{sub.name}</td>
                        <td className="py-2 text-center text-gray-600">{sub.formula}</td>
                        <td className="py-2 text-right font-semibold text-blue-600">{sub.solubility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Factors Affecting Solubility */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Factors Affecting Solubility</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Wind className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-700"><span className="font-semibold">Temperature:</span> Generally increases with temperature for solids.</span>
                </div>
                <div className="flex items-start">
                  <Flask className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700"><span className="font-semibold">pH:</span> Many drugs show pH-dependent solubility.</span>
                </div>
                <div className="flex items-start">
                  <Droplet className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-700"><span className="font-semibold">Particle size:</span> Smaller particles dissolve faster.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Details */}
        {solubility !== null && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Calculation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Normality (N):</span>
                  <span className="font-semibold">{normality} eq/L</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Gram Eq. Weight:</span>
                  <span className="font-semibold">{gramWeight} g/eq</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Formula:</span>
                  <span className="font-mono font-semibold">S = N × G.W / 10</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="text-center font-mono text-sm">
                  S = ({normality}) × ({gramWeight}) / 10 = {formatNumber((parseFloat(normality) * parseFloat(gramWeight)) / 10)} g/L
                </div>
                {selectedUnit !== 'g/L' && (
                  <div className="text-center font-mono text-sm mt-2 text-gray-600">
                    → {formatNumber(solubility)} {selectedUnit}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}