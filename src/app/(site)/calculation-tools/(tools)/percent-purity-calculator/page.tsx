"use client";
import { useState } from 'react';
import { Calculator, Percent, AlertCircle, Info, FlaskConical, Beaker, Droplets } from 'lucide-react';

export default function PercentPurityCalculator() {
  const [sampleWeight, setSampleWeight] = useState<string>('');
  const [titrantVolume, setTitrantVolume] = useState<string>('');
  const [titrantNormality, setTitrantNormality] = useState<string>('');
  const [equivalentFactor, setEquivalentFactor] = useState<string>('');
  const [dilutionFactor, setDilutionFactor] = useState<string>('1');
  const [result, setResult] = useState<{
    purity: number;
    status: 'compliant' | 'non-compliant' | 'marginal';
    message: string;
  } | null>(null);

  const calculatePurity = () => {
    const W = parseFloat(sampleWeight);
    const V = parseFloat(titrantVolume);
    const N = parseFloat(titrantNormality);
    const E = parseFloat(equivalentFactor);
    const D = parseFloat(dilutionFactor) || 1;

    if (isNaN(W) || isNaN(V) || isNaN(N) || isNaN(E) || W <= 0 || V <= 0 || N <= 0 || E <= 0) {
      alert('Please enter valid positive numbers for all required fields');
      return;
    }

    // Formula: % Purity = (V × N × E × D × 100) / W
    const purity = (V * N * E * D * 100) / W;

    let status: 'compliant' | 'non-compliant' | 'marginal' = 'compliant';
    let message = '';

    if (purity >= 98.0 && purity <= 102.0) {
      status = 'compliant';
      message = 'Sample meets pharmacopoeial standards';
    } else if (purity >= 95.0 && purity < 98.0) {
      status = 'marginal';
      message = 'Sample is borderline - requires investigation';
    } else {
      status = 'non-compliant';
      message = 'Sample fails quality standards - reject batch';
    }

    setResult({
      purity,
      status,
      message
    });
  };

  const resetCalculator = () => {
    setSampleWeight('');
    setTitrantVolume('');
    setTitrantNormality('');
    setEquivalentFactor('');
    setDilutionFactor('1');
    setResult(null);
  };

  const exampleCalculations = [
    { label: 'Aspirin Tablet', W: '0.5', V: '24.5', N: '0.1', E: '0.1802', D: '1' },
    { label: 'Ascorbic Acid', W: '1.0', V: '48.2', N: '0.05', E: '0.1761', D: '1' },
    { label: 'Paracetamol', W: '0.3', V: '15.8', N: '0.1', E: '0.1512', D: '10' },
    { label: 'Sodium Chloride', W: '0.2', V: '34.2', N: '0.1', E: '0.05844', D: '1' },
    { label: 'Amoxicillin', W: '0.5', V: '21.3', N: '0.1', E: '0.3644', D: '5' },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Percent className="w-12 h-12 text-blue-600 mr-4" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">Percent Purity (Assay %) Calculator</h1>
              <p className="text-gray-600">Calculate assay percentage using titrimetric analysis for quality control</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calculator Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Beaker className="w-6 h-6 mr-2 text-blue-600" />
              Assay Calculation
            </h2>

            <div className="space-y-6">
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-blue-800 mb-3">
                    Sample Weight (W) - mg
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={sampleWeight}
                    onChange={(e) => setSampleWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 0.500"
                  />
                  <p className="text-sm text-gray-600 mt-2">Weight of sample taken for assay</p>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-green-800 mb-3">
                    Titrant Volume (V) - mL
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={titrantVolume}
                    onChange={(e) => setTitrantVolume(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="e.g., 24.50"
                  />
                  <p className="text-sm text-gray-600 mt-2">Volume of titrant consumed at endpoint</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-purple-800 mb-3">
                    Titrant Normality (N) - N
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={titrantNormality}
                    onChange={(e) => setTitrantNormality(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., 0.100"
                  />
                  <p className="text-sm text-gray-600 mt-2">Exact normality of standard solution</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-orange-800 mb-3">
                    Equivalent Factor (E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={equivalentFactor}
                    onChange={(e) => setEquivalentFactor(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., 0.1802"
                  />
                  <p className="text-sm text-gray-600 mt-2">Milliequivalent weight factor</p>
                </div>
              </div>

              {/* Dilution Factor */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-2">
                      Dilution Factor (D)
                    </label>
                    <p className="text-sm text-gray-600">Factor if sample was diluted (default: 1)</p>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={dilutionFactor}
                    onChange={(e) => setDilutionFactor(e.target.value)}
                    className="w-32 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-gray-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Example Calculations */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Example Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {exampleCalculations.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSampleWeight(example.W);
                        setTitrantVolume(example.V);
                        setTitrantNormality(example.N);
                        setEquivalentFactor(example.E);
                        setDilutionFactor(example.D);
                      }}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className="font-semibold text-blue-600">{example.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        W: {example.W}mg, V: {example.V}mL
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={calculatePurity}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  Calculate Purity
                </button>
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                >
                  Reset Calculator
                </button>
              </div>

              {/* Results Display */}
              {result && (
                <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-400 rounded-xl shadow-lg p-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Assay Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                      <div className="text-sm font-semibold text-gray-600 mb-2">Percent Purity</div>
                      <div className={`text-4xl font-bold ${result.status === 'compliant' ? 'text-green-600' : result.status === 'marginal' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {result.purity.toFixed(2)}%
                      </div>
                      <div className={`text-lg font-semibold mt-2 ${result.status === 'compliant' ? 'text-green-700' : result.status === 'marginal' ? 'text-yellow-700' : 'text-red-700'}`}>
                        {result.message}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Compliance Status</h4>
                        <div className={`text-xl font-bold text-center px-4 py-2 rounded-lg ${result.status === 'compliant' ? 'bg-green-100 text-green-800' : result.status === 'marginal' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {result.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Acceptance Criteria</h4>
                        <div className="text-sm text-gray-600">
                          <p>• USP Standard: 90.0% - 110.0%</p>
                          <p>• BP Standard: 95.0% - 105.0%</p>
                          <p>• IP Standard: 98.0% - 102.0%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purity Scale */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Purity Scale</h4>
                    <div className="h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full relative">
                      <div className="absolute top-0 bottom-0 w-1 bg-black" 
                        style={{ left: `${Math.min(Math.max((result.purity - 80) / 30 * 100, 0), 100)}%` }}>
                        <div className="absolute -top-8 -ml-6 text-sm font-semibold">
                          {result.purity.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>80%</span>
                      <span>90%</span>
                      <span>100%</span>
                      <span>110%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low Purity</span>
                      <span>Acceptable Range</span>
                      <span>High Purity</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar with Guidelines */}
          <div className="space-y-6">
            {/* Formula Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                Assay Formula
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-mono text-center text-blue-700 mb-2">
                  % Purity = (V × N × E × D × 100) / W
                </div>
                <div className="text-sm text-gray-600 space-y-2 mt-3">
                  <p><strong>Where:</strong></p>
                  <p>• V = Titrant volume (mL)</p>
                  <p>• N = Titrant normality (N)</p>
                  <p>• E = Equivalent factor (g/mEq)</p>
                  <p>• D = Dilution factor</p>
                  <p>• W = Sample weight (mg)</p>
                </div>
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="bg-blue-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                Purity Guidelines
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Acceptance Criteria</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• USP: 90.0% - 110.0% of label claim</li>
                    <li>• BP: 95.0% - 105.0% of label claim</li>
                    <li>• IP: 98.0% - 102.0% of label claim</li>
                    <li>• EP: 95.0% - 105.0% of label claim</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Common Factors (E)</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Aspirin (C₉H₈O₄): 0.1802</li>
                    <li>• Ascorbic Acid (C₆H₈O₆): 0.1761</li>
                    <li>• Paracetamol (C₈H₉NO₂): 0.1512</li>
                    <li>• Sodium Chloride (NaCl): 0.05844</li>
                    <li>• Sodium Bicarbonate (NaHCO₃): 0.08401</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Procedure Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Procedure Steps</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">1.</span>
                  <span>Accurately weigh the sample using analytical balance</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">2.</span>
                  <span>Dissolve in appropriate solvent in volumetric flask</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">3.</span>
                  <span>Add appropriate indicator (phenolphthalein, methyl orange, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">4.</span>
                  <span>Titrate with standard solution from burette</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">5.</span>
                  <span>Note the endpoint volume (color change)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-2">6.</span>
                  <span>Calculate percentage purity using the formula</span>
                </li>
              </ol>
            </div>

            {/* Common Titrants */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Titrants</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="font-medium">NaOH Solution</span>
                  <span className="text-blue-600 font-semibold">0.1 N</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="font-medium">HCl Solution</span>
                  <span className="text-blue-600 font-semibold">0.1 N</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="font-medium">KMnO₄ Solution</span>
                  <span className="text-blue-600 font-semibold">0.1 N</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="font-medium">Na₂S₂O₃ Solution</span>
                  <span className="text-blue-600 font-semibold">0.1 N</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Applications & Importance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FlaskConical className="w-4 h-4 mr-2" />
                Quality Control
              </h3>
              <p className="text-sm text-gray-600">Ensures batch-to-batch consistency and meets pharmacopoeial standards for pharmaceutical products.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Droplets className="w-4 h-4 mr-2" />
                Raw Material Testing
              </h3>
              <p className="text-sm text-gray-600">Verifies purity of active pharmaceutical ingredients (APIs) and excipients before manufacturing.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Stability Studies
              </h3>
              <p className="text-sm text-gray-600">Monitors degradation of drugs over time under various storage conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}