"use client";
import { useState, useEffect } from 'react';
import { Calculator, Droplets, Scale, RefreshCw, Beaker, Zap } from 'lucide-react';

type SubstanceType = 'solid' | 'liquid';
type VolumeUnit = 'mL' | 'L' | 'μL';
type MassUnit = 'g' | 'mg' | 'μg';

export default function MolarityCalculator() {
  const [substanceType, setSubstanceType] = useState<SubstanceType>('solid');
  const [amount, setAmount] = useState<string>('1');
  const [molecularWeight, setMolecularWeight] = useState<string>('58.44');
  const [volume, setVolume] = useState<string>('1');
  const [specificGravity, setSpecificGravity] = useState<string>('1.0');
  const [purity, setPurity] = useState<string>('100');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
  const [massUnit, setMassUnit] = useState<MassUnit>('g');
  const [molarity, setMolarity] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const volumeUnits: { unit: VolumeUnit; conversion: number }[] = [
    { unit: 'μL', conversion: 0.000001 },
    { unit: 'mL', conversion: 0.001 },
    { unit: 'L', conversion: 1 }
  ];

  const massUnits: { unit: MassUnit; conversion: number }[] = [
    { unit: 'μg', conversion: 0.000001 },
    { unit: 'mg', conversion: 0.001 },
    { unit: 'g', conversion: 1 }
  ];

  const calculateMolarity = () => {
    const amountVal = parseFloat(amount);
    const mw = parseFloat(molecularWeight);
    const vol = parseFloat(volume);
    const sg = parseFloat(specificGravity);
    const pur = parseFloat(purity);
    
    if (!isNaN(amountVal) && !isNaN(mw) && !isNaN(vol) && 
        amountVal > 0 && mw > 0 && vol > 0 && sg > 0 && pur >= 0 && pur <= 100) {
      
      let result;
      
      if (substanceType === 'solid') {
        // Convert mass to grams
        const massInGrams = amountVal * massUnits.find(u => u.unit === massUnit)!.conversion;
        // Convert volume to liters
        const volumeInLiters = vol * volumeUnits.find(u => u.unit === volumeUnit)!.conversion;
        
        // Formula: M = (mass in g) / (MW × volume in L)
        result = massInGrams / (mw * volumeInLiters);
      } else {
        // For liquids: M = (A × sg × purity%) / (MW × V)
        const volumeInLiters = vol * volumeUnits.find(u => u.unit === volumeUnit)!.conversion;
        result = (amountVal * sg * (pur / 100)) / (mw * volumeInLiters);
      }
      
      setMolarity(result);
    } else {
      setMolarity(null);
    }
  };

  const resetCalculator = () => {
    setSubstanceType('solid');
    setAmount('1');
    setMolecularWeight('58.44');
    setVolume('1');
    setSpecificGravity('1.0');
    setPurity('100');
    setVolumeUnit('L');
    setMassUnit('g');
    setMolarity(null);
  };

  const getMolarityInterpretation = (value: number) => {
    if (value < 0.000001) return 'Trace concentration';
    if (value < 0.001) return 'Very dilute solution';
    if (value < 0.01) return 'Dilute solution';
    if (value < 0.1) return 'Moderately dilute solution';
    if (value < 1) return 'Standard concentration';
    if (value < 5) return 'Concentrated solution';
    return 'Very concentrated solution';
  };

  useEffect(() => {
    calculateMolarity();
  }, [substanceType, amount, molecularWeight, volume, specificGravity, purity, volumeUnit, massUnit]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Molarity Calculator</h1>
                <p className="text-purple-100 mt-2">Calculate molar concentration for solids and liquids</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <Droplets className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Concentration Analysis</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
              Calculation Parameters
            </h2>

            {/* Substance Type Selection */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Substance Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSubstanceType('solid')}
                  className={`py-3 rounded-lg transition-all flex flex-col items-center ${substanceType === 'solid' ?
                    'bg-gradient-to-r from-purple-600 to-pink-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Scale className="w-5 h-5 mb-1" />
                  <span>Solid</span>
                </button>
                <button
                  onClick={() => setSubstanceType('liquid')}
                  className={`py-3 rounded-lg transition-all flex flex-col items-center ${substanceType === 'liquid' ?
                    'bg-gradient-to-r from-purple-600 to-pink-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Droplets className="w-5 h-5 mb-1" />
                  <span>Liquid</span>
                </button>
              </div>
            </div>

            {/* Common Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Molecular Weight (MW)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={molecularWeight}
                    onChange={(e) => setMolecularWeight(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                    placeholder="e.g., 58.44 (for NaCl)"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">g/mol</div>
                </div>
              </div>

              {substanceType === 'solid' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount of Solid
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.001"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                          placeholder="e.g., 1"
                        />
                      </div>
                      <select
                        value={massUnit}
                        onChange={(e) => setMassUnit(e.target.value as MassUnit)}
                        className="px-4 py-3 border-2 border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      >
                        {massUnits.map((unit) => (
                          <option key={unit.unit} value={unit.unit}>{unit.unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount of Liquid
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                        placeholder="e.g., 1"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">mL</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Volume of pure liquid (before dilution)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specific Gravity (sg)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={specificGravity}
                          onChange={(e) => setSpecificGravity(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                          placeholder="e.g., 1.0"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">g/mL</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Purity (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={purity}
                          onChange={(e) => setPurity(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                          placeholder="e.g., 100"
                        />
                        <div className="absolute right-3 top-3 text-gray-500">%</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Final Volume of Solution
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.001"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                    className="px-4 py-3 border-2 border-purple-200 rounded-lg bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  >
                    {volumeUnits.map((unit) => (
                      <option key={unit.unit} value={unit.unit}>{unit.unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formula Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-semibold text-purple-700">Show Formula</span>
                  <Zap className={`w-5 h-5 text-purple-600 transform ${showFormula ? 'rotate-180' : ''}`} />
                </button>
                
                {showFormula && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">
                      {substanceType === 'solid' ? 'For Solids:' : 'For Liquids:'}
                    </h4>
                    <div className="text-center p-3 bg-gray-100 rounded-lg font-mono text-sm mb-3">
                      {substanceType === 'solid' 
                        ? 'M = (mass in g) / (MW × volume in L)'
                        : 'M = (A × sg × purity%) / (MW × V)'}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="font-semibold">M:</span> Molarity (mol/L)</p>
                      <p><span className="font-semibold">MW:</span> Molecular weight (g/mol)</p>
                      {substanceType === 'solid' ? (
                        <p><span className="font-semibold">mass:</span> Mass of solid (convert to grams)</p>
                      ) : (
                        <>
                          <p><span className="font-semibold">A:</span> Amount of liquid (mL)</p>
                          <p><span className="font-semibold">sg:</span> Specific gravity (g/mL)</p>
                          <p><span className="font-semibold">purity%:</span> Percentage purity (decimal)</p>
                        </>
                      )}
                      <p><span className="font-semibold">V:</span> Final volume (convert to liters)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={calculateMolarity}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Calculate Molarity
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

          {/* Results Section */}
          <div className="space-y-6">
            {/* Result Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Beaker className="w-7 h-7 mr-3" />
                Molarity Result
              </h2>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-purple-100 mb-2">
                    Molar Concentration
                  </div>
                  {molarity !== null ? (
                    <>
                      <div className="text-5xl md:text-6xl font-bold mb-2">
                        {molarity < 0.001 ? molarity.toExponential(3) : molarity.toFixed(4)}
                      </div>
                      <div className="text-2xl font-semibold">
                        mol/L (M)
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-purple-100">
                      Enter Values
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Units */}
              {molarity !== null && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xs opacity-80">mM</div>
                    <div className="text-lg font-bold">{(molarity * 1000).toFixed(2)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xs opacity-80">μM</div>
                    <div className="text-lg font-bold">{(molarity * 1000000).toFixed(2)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xs opacity-80">nM</div>
                    <div className="text-lg font-bold">{(molarity * 1000000000).toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculation Details */}
            {molarity !== null && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Calculation Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Molecular Weight</div>
                      <div className="font-semibold">{molecularWeight} g/mol</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Final Volume</div>
                      <div className="font-semibold">{volume} {volumeUnit} = {(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)} L</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-center font-mono text-sm">
                      {substanceType === 'solid' 
                        ? `M = (${amount} ${massUnit} = ${(parseFloat(amount) * massUnits.find(u => u.unit === massUnit)!.conversion).toFixed(4)} g) / (${molecularWeight} × ${(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)})`
                        : `M = (${amount} × ${specificGravity} × ${purity}%) / (${molecularWeight} × ${(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)})`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Common Solutions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Solutions</h3>
              <div className="space-y-3">
                {[
                  { name: '1M NaCl', weight: '58.44', volume: '1', amount: '58.44' },
                  { name: '0.1M HCl', weight: '36.46', volume: '1', amount: '8.3 mL*' },
                  { name: '0.5M NaOH', weight: '40.00', volume: '1', amount: '20.00' },
                  { name: '0.01M EDTA', weight: '372.24', volume: '1', amount: '3.7224' },
                  { name: '1M Tris-HCl', weight: '157.60', volume: '1', amount: '157.60' },
                ].map((solution, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-purple-100 hover:bg-white/50 rounded px-2">
                    <div>
                      <div className="font-medium text-gray-800">{solution.name}</div>
                      <div className="text-xs text-gray-600">MW: {solution.weight} g/mol</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">{solution.amount}</div>
                      <div className="text-xs text-gray-600">in {solution.volume}L</div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">*For 37% concentrated HCl (specific gravity 1.19)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}