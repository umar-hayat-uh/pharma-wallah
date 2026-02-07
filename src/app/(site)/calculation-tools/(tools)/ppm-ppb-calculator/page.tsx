"use client";
import { useState, useEffect } from 'react';
import { Calculator, BarChart3, RefreshCw, TrendingUp, Zap, AlertCircle } from 'lucide-react';

type ConcentrationUnit = 'ppm' | 'ppb' | 'ppt' | 'mg/L' | 'μg/L' | 'ng/L' | 'g/L' | 'mol/L' | 'M';
type SoluteType = 'solid' | 'liquid';
type SolutionType = 'water' | 'other';

export default function PpmPpbCalculator() {
  const [soluteType, setSoluteType] = useState<SoluteType>('solid');
  const [solutionType, setSolutionType] = useState<SolutionType>('water');
  const [mass, setMass] = useState<string>('1');
  const [volume, setVolume] = useState<string>('1');
  const [molecularWeight, setMolecularWeight] = useState<string>('58.44');
  const [density, setDensity] = useState<string>('1.0');
  const [fromUnit, setFromUnit] = useState<ConcentrationUnit>('mg/L');
  const [toUnit, setToUnit] = useState<ConcentrationUnit>('ppm');
  const [concentration, setConcentration] = useState<string>('');
  const [convertedValue, setConvertedValue] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [calculationMode, setCalculationMode] = useState<'mass-volume' | 'conversion'>('mass-volume');

  const concentrationUnits = [
    { value: 'ppm', label: 'ppm (mg/kg)', factor: 1e-6 },
    { value: 'ppb', label: 'ppb (μg/kg)', factor: 1e-9 },
    { value: 'ppt', label: 'ppt (ng/kg)', factor: 1e-12 },
    { value: 'mg/L', label: 'mg/L', factor: 1e-6 },
    { value: 'μg/L', label: 'μg/L', factor: 1e-9 },
    { value: 'ng/L', label: 'ng/L', factor: 1e-12 },
    { value: 'g/L', label: 'g/L', factor: 1e-3 },
    { value: 'mol/L', label: 'mol/L', factor: 1 },
    { value: 'M', label: 'Molar (M)', factor: 1 }
  ];

  const massUnits = ['mg', 'g', 'kg', 'μg'];
  const volumeUnits = ['L', 'mL', 'μL', 'm³'];

  const calculateConcentration = () => {
    if (calculationMode === 'mass-volume') {
      const massVal = parseFloat(mass);
      const volumeVal = parseFloat(volume);
      const densityVal = parseFloat(density);
      
      if (!isNaN(massVal) && !isNaN(volumeVal) && !isNaN(densityVal) && 
          massVal > 0 && volumeVal > 0 && densityVal > 0) {
        
        // Convert to mg/L first
        let resultMgL;
        
        if (soluteType === 'solid') {
          // For solids in water: ppm ≈ mg/L
          resultMgL = (massVal * 1000) / volumeVal; // assuming mass in g, volume in L
        } else {
          // For liquids: account for density
          const massOfSolute = massVal * densityVal; // mass in g
          resultMgL = (massOfSolute * 1000) / volumeVal;
        }
        
        // Convert to selected unit
        let result;
        switch (toUnit) {
          case 'ppm':
            result = solutionType === 'water' ? resultMgL : resultMgL / densityVal;
            break;
          case 'ppb':
            result = resultMgL * 1000;
            break;
          case 'ppt':
            result = resultMgL * 1000000;
            break;
          case 'mg/L':
            result = resultMgL;
            break;
          case 'μg/L':
            result = resultMgL * 1000;
            break;
          case 'ng/L':
            result = resultMgL * 1000000;
            break;
          case 'g/L':
            result = resultMgL / 1000;
            break;
          case 'mol/L':
          case 'M':
            const mw = parseFloat(molecularWeight);
            if (!isNaN(mw) && mw > 0) {
              result = (resultMgL / 1000) / mw;
            } else {
              result = null;
            }
            break;
          default:
            result = resultMgL;
        }
        
        setConvertedValue(result);
      } else {
        setConvertedValue(null);
      }
    } else {
      // Conversion mode
      const concVal = parseFloat(concentration);
      if (!isNaN(concVal) && concVal >= 0) {
        const fromFactor = concentrationUnits.find(u => u.value === fromUnit)?.factor || 1;
        const toFactor = concentrationUnits.find(u => u.value === toUnit)?.factor || 1;
        
        // Convert to base unit (fraction) then to target unit
        const baseValue = concVal * fromFactor;
        let result = baseValue / toFactor;
        
        // Special case for water: 1 mg/L ≈ 1 ppm
        if (solutionType === 'water' && fromUnit === 'mg/L' && toUnit === 'ppm') {
          result = concVal;
        } else if (solutionType === 'water' && fromUnit === 'ppm' && toUnit === 'mg/L') {
          result = concVal;
        }
        
        setConvertedValue(result);
      } else {
        setConvertedValue(null);
      }
    }
  };

  const resetCalculator = () => {
    setSoluteType('solid');
    setSolutionType('water');
    setMass('1');
    setVolume('1');
    setMolecularWeight('58.44');
    setDensity('1.0');
    setFromUnit('mg/L');
    setToUnit('ppm');
    setConcentration('');
    setConvertedValue(null);
  };

  const getInterpretation = (value: number, unit: ConcentrationUnit) => {
    let valueInPpm;
    
    // Convert to ppm for comparison
    switch (unit) {
      case 'ppm':
        valueInPpm = value;
        break;
      case 'ppb':
        valueInPpm = value / 1000;
        break;
      case 'ppt':
        valueInPpm = value / 1000000;
        break;
      case 'mg/L':
        valueInPpm = value;
        break;
      case 'μg/L':
        valueInPpm = value / 1000;
        break;
      case 'ng/L':
        valueInPpm = value / 1000000;
        break;
      case 'g/L':
        valueInPpm = value * 1000;
        break;
      default:
        valueInPpm = value;
    }
    
    if (valueInPpm < 0.001) return 'Ultra trace concentration';
    if (valueInPpm < 0.1) return 'Trace concentration';
    if (valueInPpm < 1) return 'Very low concentration';
    if (valueInPpm < 10) return 'Low concentration';
    if (valueInPpm < 100) return 'Moderate concentration';
    if (valueInPpm < 1000) return 'High concentration';
    return 'Very high concentration';
  };

  useEffect(() => {
    calculateConcentration();
  }, [soluteType, solutionType, mass, volume, molecularWeight, density, fromUnit, toUnit, concentration, calculationMode]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">PPM & PPB Calculator</h1>
                <p className="text-green-100 mt-2">Convert between concentration units and calculate dilutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Concentration Analysis</span>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Calculation Mode</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCalculationMode('mass-volume')}
              className={`p-4 rounded-xl transition-all ${calculationMode === 'mass-volume' ?
                'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg' :
                'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex flex-col items-center">
                <Calculator className="w-6 h-6 mb-2" />
                <span className="font-semibold">Mass to Concentration</span>
                <span className="text-sm mt-1">From mass and volume</span>
              </div>
            </button>
            <button
              onClick={() => setCalculationMode('conversion')}
              className={`p-4 rounded-xl transition-all ${calculationMode === 'conversion' ?
                'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg' :
                'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex flex-col items-center">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="font-semibold">Unit Conversion</span>
                <span className="text-sm mt-1">Between concentration units</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
              {calculationMode === 'mass-volume' ? 'Mass & Volume Inputs' : 'Unit Conversion'}
            </h2>

            {/* Solution Type */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Solution Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSolutionType('water')}
                  className={`py-2 rounded-lg transition-all ${solutionType === 'water' ?
                    'bg-gradient-to-r from-green-600 to-emerald-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Aqueous (Water)
                </button>
                <button
                  onClick={() => setSolutionType('other')}
                  className={`py-2 rounded-lg transition-all ${solutionType === 'other' ?
                    'bg-gradient-to-r from-green-600 to-emerald-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Other Solvent
                </button>
              </div>
              {solutionType === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Solvent Density (g/mL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-green-200 rounded-lg"
                    placeholder="e.g., 0.789 for ethanol"
                  />
                </div>
              )}
            </div>

            {calculationMode === 'mass-volume' ? (
              <>
                {/* Solute Type */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Solute Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSoluteType('solid')}
                      className={`py-3 rounded-lg transition-all flex flex-col items-center ${soluteType === 'solid' ?
                        'bg-gradient-to-r from-green-600 to-emerald-500 text-white' :
                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span>Solid</span>
                      <span className="text-xs">(powder, crystals)</span>
                    </button>
                    <button
                      onClick={() => setSoluteType('liquid')}
                      className={`py-3 rounded-lg transition-all flex flex-col items-center ${soluteType === 'liquid' ?
                        'bg-gradient-to-r from-green-600 to-emerald-500 text-white' :
                        'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <span>Liquid</span>
                      <span className="text-xs">(stock solution)</span>
                    </button>
                  </div>
                </div>

                {/* Input Fields for Mass-Volume Mode */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {soluteType === 'solid' ? 'Mass of Solid' : 'Volume of Liquid'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={mass}
                          onChange={(e) => setMass(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                          placeholder={soluteType === 'solid' ? 'e.g., 1' : 'e.g., 1'}
                        />
                        <div className="absolute right-3 top-3 text-gray-500">
                          {soluteType === 'solid' ? 'g' : 'mL'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Final Solution Volume
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                          placeholder="e.g., 1"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">L</div>
                      </div>
                    </div>
                  </div>

                  {soluteType === 'liquid' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Liquid Density (g/mL)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={density}
                          onChange={(e) => setDensity(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                          placeholder="e.g., 1.0"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">g/mL</div>
                      </div>
                    </div>
                  )}

                  {/* Target Unit Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Convert To
                    </label>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value as ConcentrationUnit)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      {concentrationUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>

                  {(toUnit === 'mol/L' || toUnit === 'M') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Molecular Weight
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={molecularWeight}
                          onChange={(e) => setMolecularWeight(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                          placeholder="e.g., 58.44"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">g/mol</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Conversion Mode Inputs */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Unit
                    </label>
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value as ConcentrationUnit)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg bg-white"
                    >
                      {concentrationUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To Unit
                    </label>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value as ConcentrationUnit)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg bg-white"
                    >
                      {concentrationUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Concentration Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={concentration}
                      onChange={(e) => setConcentration(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                      placeholder={`e.g., 1 ${fromUnit}`}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">{fromUnit}</div>
                  </div>
                </div>

                {(fromUnit === 'mol/L' || fromUnit === 'M' || toUnit === 'mol/L' || toUnit === 'M') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Molecular Weight (for molar conversions)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={molecularWeight}
                        onChange={(e) => setMolecularWeight(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-lg"
                        placeholder="e.g., 58.44"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">g/mol</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formula Toggle */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mt-6">
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-semibold text-green-700">Show Conversion Factors</span>
                <Zap className={`w-5 h-5 text-green-600 transform ${showFormula ? 'rotate-180' : ''}`} />
              </button>
              
              {showFormula && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-2">Key Relationships</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">For water solutions:</span> 1 ppm ≈ 1 mg/L</p>
                    <p><span className="font-semibold">1 ppm</span> = 1000 ppb = 1,000,000 ppt</p>
                    <p><span className="font-semibold">1 mg/L</span> = 1000 μg/L = 1,000,000 ng/L</p>
                    <p><span className="font-semibold">Molarity to ppm:</span> ppm = M × MW × 1000</p>
                    <p><span className="font-semibold">For other solvents:</span> ppm = (mg/L) ÷ density</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Note: These conversions assume dilute aqueous solutions at room temperature
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={calculateConcentration}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {calculationMode === 'mass-volume' ? 'Calculate Concentration' : 'Convert Units'}
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

          {/* Results Section */}
          <div className="space-y-6">
            {/* Result Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BarChart3 className="w-7 h-7 mr-3" />
                {calculationMode === 'mass-volume' ? 'Concentration Result' : 'Conversion Result'}
              </h2>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-100 mb-2">
                    Result
                  </div>
                  {convertedValue !== null ? (
                    <>
                      <div className="text-5xl md:text-6xl font-bold mb-2">
                        {convertedValue < 0.001 ? convertedValue.toExponential(3) : convertedValue.toFixed(4)}
                      </div>
                      <div className="text-2xl font-semibold">
                        {toUnit}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-green-100">
                      Enter Values
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Units Display */}
              {convertedValue !== null && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs opacity-80">In Scientific</div>
                    <div className="text-lg font-mono">{convertedValue.toExponential(3)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs opacity-80">Significant Digits</div>
                    <div className="text-lg font-bold">
                      {convertedValue.toPrecision(4)}
                    </div>
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {convertedValue !== null && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Interpretation:</div>
                      <div className="text-sm text-green-100">
                        {getInterpretation(convertedValue, toUnit)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Common Reference Values */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Concentration Ranges</h3>
              <div className="space-y-3">
                {[
                  { range: 'Drinking Water (Pb)', value: '0.015', unit: 'ppm', regulation: 'EPA limit' },
                  { range: 'Sea Water (Salt)', value: '35000', unit: 'ppm', regulation: 'Average' },
                  { range: 'Blood Alcohol (0.08%)', value: '800', unit: 'ppm', regulation: 'Legal limit' },
                  { range: 'Vitamin C in Orange', value: '500', unit: 'ppm', regulation: 'Typical' },
                  { range: 'Air (CO₂)', value: '420', unit: 'ppm', regulation: 'Current average' },
                  { range: 'Gold in Seawater', value: '0.000004', unit: 'ppm', regulation: 'Trace' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 rounded px-2">
                    <div>
                      <div className="font-medium text-gray-800">{item.range}</div>
                      <div className="text-xs text-gray-600">{item.regulation}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{item.value}</div>
                      <div className="text-xs text-gray-600">{item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Conversions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Conversions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border text-center">
                  <div className="text-xs text-gray-500">1 ppm =</div>
                  <div className="font-bold text-green-700">1000 ppb</div>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <div className="text-xs text-gray-500">1 ppb =</div>
                  <div className="font-bold text-green-700">1000 ppt</div>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <div className="text-xs text-gray-500">1 mg/L =</div>
                  <div className="font-bold text-green-700">1000 μg/L</div>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <div className="text-xs text-gray-500">1 M =</div>
                  <div className="font-bold text-green-700">MW g/L</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}