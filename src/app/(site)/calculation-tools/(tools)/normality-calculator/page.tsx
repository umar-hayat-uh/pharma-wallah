"use client";
import { useState, useEffect } from 'react';
import { Calculator, Scale, Droplets, RefreshCw, Beaker, Zap, AlertCircle } from 'lucide-react';

type SubstanceType = 'solid' | 'liquid';
type VolumeUnit = 'mL' | 'L' | 'μL';
type MassUnit = 'g' | 'mg' | 'μg';

interface Chemical {
  name: string;
  formula: string;
  molecularWeight: number;
  nFactor: number;
  eqWeight: number;
}

export default function NormalityCalculator() {
  const [substanceType, setSubstanceType] = useState<SubstanceType>('solid');
  const [amount, setAmount] = useState<string>('1');
  const [eqWeight, setEqWeight] = useState<string>('36.46');
  const [volume, setVolume] = useState<string>('1');
  const [specificGravity, setSpecificGravity] = useState<string>('1.0');
  const [purity, setPurity] = useState<string>('100');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
  const [massUnit, setMassUnit] = useState<MassUnit>('g');
  const [normality, setNormality] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [calculateBy, setCalculateBy] = useState<'eqWeight' | 'molecularWeight'>('eqWeight');
  const [molecularWeight, setMolecularWeight] = useState<string>('36.46');
  const [nFactor, setNFactor] = useState<string>('1');

  const chemicals: Chemical[] = [
    { name: 'Hydrochloric Acid', formula: 'HCl', molecularWeight: 36.46, nFactor: 1, eqWeight: 36.46 },
    { name: 'Sulfuric Acid', formula: 'H₂SO₄', molecularWeight: 98.08, nFactor: 2, eqWeight: 49.04 },
    { name: 'Sodium Hydroxide', formula: 'NaOH', molecularWeight: 40.00, nFactor: 1, eqWeight: 40.00 },
    { name: 'Calcium Hydroxide', formula: 'Ca(OH)₂', molecularWeight: 74.09, nFactor: 2, eqWeight: 37.05 },
    { name: 'Potassium Permanganate', formula: 'KMnO₄', molecularWeight: 158.03, nFactor: 5, eqWeight: 31.61 },
    { name: 'Sodium Carbonate', formula: 'Na₂CO₃', molecularWeight: 105.99, nFactor: 2, eqWeight: 53.00 },
  ];

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

  const calculateNormality = () => {
    const amountVal = parseFloat(amount);
    const eqWeightVal = parseFloat(eqWeight);
    const vol = parseFloat(volume);
    const sg = parseFloat(specificGravity);
    const pur = parseFloat(purity);
    const mw = parseFloat(molecularWeight);
    const nf = parseFloat(nFactor);
    
    let finalEqWeight = eqWeightVal;
    
    if (calculateBy === 'molecularWeight' && !isNaN(mw) && !isNaN(nf) && mw > 0 && nf > 0) {
      finalEqWeight = mw / nf;
      setEqWeight(finalEqWeight.toFixed(2));
    }
    
    if (!isNaN(amountVal) && !isNaN(finalEqWeight) && !isNaN(vol) && 
        amountVal > 0 && finalEqWeight > 0 && vol > 0 && sg > 0 && pur >= 0 && pur <= 100) {
      
      let result;
      
      if (substanceType === 'solid') {
        // Convert mass to grams
        const massInGrams = amountVal * massUnits.find(u => u.unit === massUnit)!.conversion;
        // Convert volume to liters
        const volumeInLiters = vol * volumeUnits.find(u => u.unit === volumeUnit)!.conversion;
        
        // Formula: N = (mass in g) / (eq. weight × volume in L)
        result = massInGrams / (finalEqWeight * volumeInLiters);
      } else {
        // For liquids: N = (A × sg × purity%) / (eq. weight × V)
        const volumeInLiters = vol * volumeUnits.find(u => u.unit === volumeUnit)!.conversion;
        result = (amountVal * sg * (pur / 100)) / (finalEqWeight * volumeInLiters);
      }
      
      setNormality(result);
    } else {
      setNormality(null);
    }
  };

  const resetCalculator = () => {
    setSubstanceType('solid');
    setAmount('1');
    setEqWeight('36.46');
    setVolume('1');
    setSpecificGravity('1.0');
    setPurity('100');
    setVolumeUnit('L');
    setMassUnit('g');
    setNormality(null);
    setSelectedChemical(null);
    setCalculateBy('eqWeight');
    setMolecularWeight('36.46');
    setNFactor('1');
  };

  const loadChemical = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    setMolecularWeight(chemical.molecularWeight.toString());
    setNFactor(chemical.nFactor.toString());
    setEqWeight(chemical.eqWeight.toString());
  };

  const getNormalityInterpretation = (value: number) => {
    if (value < 0.001) return 'Very dilute solution';
    if (value < 0.01) return 'Dilute solution';
    if (value < 0.1) return 'Moderately dilute solution';
    if (value < 1) return 'Standard concentration';
    if (value < 5) return 'Concentrated solution';
    return 'Very concentrated solution';
  };

  useEffect(() => {
    calculateNormality();
  }, [substanceType, amount, eqWeight, volume, specificGravity, purity, volumeUnit, massUnit, calculateBy, molecularWeight, nFactor]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 p-4 md:p-6 mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-500 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Scale className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Normality Calculator</h1>
                <p className="text-indigo-100 mt-2">Calculate normality for acids, bases, and redox reagents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <Beaker className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Titration Analysis</span>
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
                    'bg-gradient-to-r from-indigo-600 to-violet-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Scale className="w-5 h-5 mb-1" />
                  <span>Solid</span>
                </button>
                <button
                  onClick={() => setSubstanceType('liquid')}
                  className={`py-3 rounded-lg transition-all flex flex-col items-center ${substanceType === 'liquid' ?
                    'bg-gradient-to-r from-indigo-600 to-violet-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Droplets className="w-5 h-5 mb-1" />
                  <span>Liquid</span>
                </button>
              </div>
            </div>

            {/* Chemical Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Chemical Selection</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {chemicals.map((chemical) => (
                  <button
                    key={chemical.formula}
                    onClick={() => loadChemical(chemical)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${selectedChemical?.formula === chemical.formula ?
                      'bg-gradient-to-r from-indigo-600 to-violet-500 text-white' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="font-medium">{chemical.formula}</div>
                    <div className="text-xs opacity-80">{chemical.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation Method */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Calculation Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCalculateBy('eqWeight')}
                  className={`py-2 rounded-lg transition-all ${calculateBy === 'eqWeight' ?
                    'bg-gradient-to-r from-indigo-600 to-violet-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Using Equivalent Weight
                </button>
                <button
                  onClick={() => setCalculateBy('molecularWeight')}
                  className={`py-2 rounded-lg transition-all ${calculateBy === 'molecularWeight' ?
                    'bg-gradient-to-r from-indigo-600 to-violet-500 text-white' :
                    'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Using MW & n-factor
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {calculateBy === 'eqWeight' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gram Equivalent Weight
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={eqWeight}
                      onChange={(e) => setEqWeight(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      placeholder="e.g., 36.46"
                    />
                    <div className="absolute right-3 top-3 text-gray-500">g/eq</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">MW divided by n-factor</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
                        placeholder="e.g., 36.46"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">g/mol</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      n-factor
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={nFactor}
                        onChange={(e) => setNFactor(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
                        placeholder="e.g., 1 for HCl"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">eq/mol</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Acidity, basicity, or redox electrons</p>
                  </div>
                </div>
              )}

              {substanceType === 'solid' ? (
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
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
                        placeholder="e.g., 1"
                      />
                    </div>
                    <select
                      value={massUnit}
                      onChange={(e) => setMassUnit(e.target.value as MassUnit)}
                      className="px-4 py-3 border-2 border-indigo-200 rounded-lg bg-white"
                    >
                      {massUnits.map((unit) => (
                        <option key={unit.unit} value={unit.unit}>{unit.unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
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
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
                        placeholder="e.g., 1"
                      />
                      <div className="absolute right-3 top-3 text-gray-500">mL</div>
                    </div>
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
                          className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
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
                          className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
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
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                    className="px-4 py-3 border-2 border-indigo-200 rounded-lg bg-white"
                  >
                    {volumeUnits.map((unit) => (
                      <option key={unit.unit} value={unit.unit}>{unit.unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Formula Toggle */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-200">
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-semibold text-indigo-700">Show Formula</span>
                  <Zap className={`w-5 h-5 text-indigo-600 transform ${showFormula ? 'rotate-180' : ''}`} />
                </button>
                
                {showFormula && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">
                      {substanceType === 'solid' ? 'For Solids:' : 'For Liquids:'}
                    </h4>
                    <div className="text-center p-3 bg-gray-100 rounded-lg font-mono text-sm mb-3">
                      {substanceType === 'solid' 
                        ? 'N = (mass in g) / (Eq.W × volume in L)'
                        : 'N = (A × sg × purity%) / (Eq.W × V)'}
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p><span className="font-semibold">N:</span> Normality (eq/L)</p>
                      <p><span className="font-semibold">Eq.W:</span> Equivalent weight = MW / n</p>
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
                  onClick={calculateNormality}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Calculate Normality
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
            <div className="bg-gradient-to-br from-indigo-600 to-violet-500 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Scale className="w-7 h-7 mr-3" />
                Normality Result
              </h2>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-indigo-100 mb-2">
                    Normality
                  </div>
                  {normality !== null ? (
                    <>
                      <div className="text-5xl md:text-6xl font-bold mb-2">
                        {normality < 0.001 ? normality.toExponential(3) : normality.toFixed(4)}
                      </div>
                      <div className="text-2xl font-semibold">
                        N (eq/L)
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-indigo-100">
                      Enter Values
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Chemical Info */}
              {selectedChemical && (
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{selectedChemical.formula}</div>
                      <div className="text-sm text-indigo-200">{selectedChemical.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">MW: {selectedChemical.molecularWeight}</div>
                      <div className="text-sm">n: {selectedChemical.nFactor}</div>
                      <div className="text-sm font-bold">Eq.W: {selectedChemical.eqWeight.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {normality !== null && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Interpretation:</div>
                      <div className="text-sm text-indigo-100">
                        {getNormalityInterpretation(normality)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculation Details */}
            {normality !== null && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Calculation Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Equivalent Weight</div>
                      <div className="font-semibold">{eqWeight} g/eq</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500">Final Volume</div>
                      <div className="font-semibold">{volume} {volumeUnit} = {(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)} L</div>
                    </div>
                  </div>
                  
                  {calculateBy === 'molecularWeight' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-gray-500">Molecular Weight</div>
                        <div className="font-semibold">{molecularWeight} g/mol</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <div className="text-xs text-gray-500">n-factor</div>
                        <div className="font-semibold">{nFactor} eq/mol</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="text-center font-mono text-sm">
                      {substanceType === 'solid' 
                        ? `N = (${amount} ${massUnit} = ${(parseFloat(amount) * massUnits.find(u => u.unit === massUnit)!.conversion).toFixed(4)} g) / (${eqWeight} × ${(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)})`
                        : `N = (${amount} × ${specificGravity} × ${purity}%) / (${eqWeight} × ${(parseFloat(volume) * volumeUnits.find(u => u.unit === volumeUnit)!.conversion).toFixed(4)})`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* n-factor Reference */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl shadow-lg p-6 border border-indigo-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">n-factor Guidelines</h3>
              <div className="space-y-3">
                {[
                  { type: 'Acids', examples: 'HCl:1, H₂SO₄:2, H₃PO₄:3', rule: 'Number of H⁺ ions' },
                  { type: 'Bases', examples: 'NaOH:1, Ca(OH)₂:2', rule: 'Number of OH⁻ ions' },
                  { type: 'Salts', examples: 'Na₂CO₃:2, KMnO₄:5', rule: 'Total charge' },
                  { type: 'Redox Agents', examples: 'KMnO₄:5, K₂Cr₂O₇:6', rule: 'Electrons transferred' },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border">
                    <div className="font-semibold text-gray-800">{item.type}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.examples}</div>
                    <div className="text-xs text-indigo-600 mt-1">{item.rule}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}