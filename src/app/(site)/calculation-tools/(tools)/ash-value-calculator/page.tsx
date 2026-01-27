"use client";
import { useState } from 'react';
import { Calculator, Flame, AlertCircle, Info, Thermometer, Scale, Beaker } from 'lucide-react';

export default function AshValueCalculator() {
  const [crucibleWeight, setCrucibleWeight] = useState<string>('');
  const [sampleWeight, setSampleWeight] = useState<string>('');
  const [ashWeight, setAshWeight] = useState<string>('');
  const [ashType, setAshType] = useState<'total' | 'acid-insoluble' | 'sulfated'>('total');
  const [result, setResult] = useState<{
    ashValue: number;
    compliance: boolean;
    message: string;
  } | null>(null);

  const calculateAshValue = () => {
    const W1 = parseFloat(crucibleWeight);
    const W2 = parseFloat(sampleWeight);
    const W3 = parseFloat(ashWeight);

    if (isNaN(W1) || isNaN(W2) || isNaN(W3) || W1 <= 0 || W2 <= 0 || W3 <= 0) {
      alert('Please enter valid positive numbers for all fields');
      return;
    }

    // Formula: % Ash = [(W3 - W1) / W2] × 100
    const ashValue = ((W3 - W1) / W2) * 100;

    let compliance = false;
    let message = '';

    // Different limits for different ash types
    if (ashType === 'total') {
      compliance = ashValue <= 15.0; // General limit for total ash
      message = compliance 
        ? 'Within acceptable limits for total ash content'
        : 'Exceeds maximum allowable total ash content';
    } else if (ashType === 'acid-insoluble') {
      compliance = ashValue <= 5.0;
      message = compliance 
        ? 'Within acceptable limits for acid-insoluble ash'
        : 'Exceeds acid-insoluble ash limits - indicates high silica/sand content';
    } else {
      compliance = ashValue <= 20.0;
      message = compliance 
        ? 'Within acceptable limits for sulfated ash'
        : 'Exceeds sulfated ash limits - high inorganic residues';
    }

    setResult({
      ashValue,
      compliance,
      message
    });
  };

  const resetCalculator = () => {
    setCrucibleWeight('');
    setSampleWeight('');
    setAshWeight('');
    setAshType('total');
    setResult(null);
  };

  const exampleCalculations = [
    { label: 'Herbal Powder', crucible: '25.432', sample: '2.000', ash: '25.482', type: 'total' as const },
    { label: 'Plant Extract', crucible: '30.125', sample: '3.000', ash: '30.210', type: 'acid-insoluble' as const },
    { label: 'Crude Drug', crucible: '28.567', sample: '2.500', ash: '28.692', type: 'sulfated' as const },
    { label: 'Neem Leaves', crucible: '32.458', sample: '5.000', ash: '32.683', type: 'total' as const },
    { label: 'Turmeric', crucible: '29.345', sample: '4.000', ash: '29.545', type: 'acid-insoluble' as const },
  ];

  return (
    <section className="min-h-screen p-4 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-12 h-12 text-orange-600 mr-4" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">Ash Value Calculator</h1>
              <p className="text-gray-600">Calculate total ash, acid-insoluble ash, and sulfated ash values for herbal drugs and extracts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calculator Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Scale className="w-6 h-6 mr-2 text-orange-600" />
              Ash Content Calculation
            </h2>

            <div className="space-y-6">
              {/* Ash Type Selection */}
              <div className="bg-gray-50 rounded-lg p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-4">Select Ash Type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setAshType('total')}
                    className={`p-4 rounded-lg transition-all duration-300 ${ashType === 'total' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="font-semibold">Total Ash</div>
                    <div className="text-sm opacity-90">Direct incineration at 450°C</div>
                  </button>
                  <button
                    onClick={() => setAshType('acid-insoluble')}
                    className={`p-4 rounded-lg transition-all duration-300 ${ashType === 'acid-insoluble' ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="font-semibold">Acid-Insoluble</div>
                    <div className="text-sm opacity-90">HCl treatment after incineration</div>
                  </button>
                  <button
                    onClick={() => setAshType('sulfated')}
                    className={`p-4 rounded-lg transition-all duration-300 ${ashType === 'sulfated' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <div className="font-semibold">Sulfated Ash</div>
                    <div className="text-sm opacity-90">H₂SO₄ treatment before incineration</div>
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-orange-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-orange-800 mb-3">
                    Crucible Weight (W1) - g
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={crucibleWeight}
                    onChange={(e) => setCrucibleWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                    placeholder="e.g., 25.4321"
                  />
                  <p className="text-sm text-gray-600 mt-2">Weight of empty crucible (tared)</p>
                </div>

                <div className="bg-amber-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-amber-800 mb-3">
                    Sample Weight (W2) - g
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={sampleWeight}
                    onChange={(e) => setSampleWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., 2.0000"
                  />
                  <p className="text-sm text-gray-600 mt-2">Weight of accurately weighed sample</p>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <label className="block text-lg font-semibold text-red-800 mb-3">
                    Ash Weight (W3) - g
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={ashWeight}
                    onChange={(e) => setAshWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none"
                    placeholder="e.g., 25.4823"
                  />
                  <p className="text-sm text-gray-600 mt-2">Weight of crucible + ash after incineration</p>
                </div>
              </div>

              {/* Temperature Info */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-6">
                <div className="flex items-center">
                  <Thermometer className="w-6 h-6 text-orange-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Incineration Temperature</h4>
                    <p className="text-sm text-gray-600">
                      {ashType === 'total' 
                        ? '450°C until carbon-free (usually 2-4 hours)' 
                        : ashType === 'acid-insoluble'
                        ? '450°C, then treat with HCl and incinerate again'
                        : 'Treat with H₂SO₄, then incinerate at 600°C'}
                    </p>
                  </div>
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
                        setCrucibleWeight(example.crucible);
                        setSampleWeight(example.sample);
                        setAshWeight(example.ash);
                        setAshType(example.type);
                      }}
                      className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-orange-50 transition-colors text-center"
                    >
                      <div className="font-semibold text-orange-600">{example.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Crucible: {example.crucible}g
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={calculateAshValue}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-md hover:shadow-lg"
                >
                  Calculate {ashType === 'total' ? 'Total Ash' : ashType === 'acid-insoluble' ? 'Acid-Insoluble Ash' : 'Sulfated Ash'}
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
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-400 rounded-xl shadow-lg p-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Ash Value Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
                      <div className="text-sm font-semibold text-gray-600 mb-2">
                        {ashType === 'total' ? 'Total Ash Value' : ashType === 'acid-insoluble' ? 'Acid-Insoluble Ash Value' : 'Sulfated Ash Value'}
                      </div>
                      <div className={`text-4xl font-bold ${result.compliance ? 'text-green-600' : 'text-red-600'}`}>
                        {result.ashValue.toFixed(4)}%
                      </div>
                      <div className={`text-lg font-semibold mt-2 ${result.compliance ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Compliance Status</h4>
                        <div className={`text-xl font-bold text-center px-4 py-2 rounded-lg ${result.compliance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {result.compliance ? 'COMPLIANT' : 'NON-COMPLIANT'}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Limits for {ashType} Ash</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {ashType === 'total' && (
                            <>
                              <p>• Herbal drugs: ≤ 15.0%</p>
                              <p>• Plant extracts: ≤ 10.0%</p>
                              <p>• Crude drugs: ≤ 20.0%</p>
                              <p>• Vegetable drugs: ≤ 12.0%</p>
                            </>
                          )}
                          {ashType === 'acid-insoluble' && (
                            <>
                              <p>• Most herbal drugs: ≤ 5.0%</p>
                              <p>• Vegetable drugs: ≤ 2.0%</p>
                              <p>• Purified extracts: ≤ 1.0%</p>
                              <p>• Roots & barks: ≤ 3.0%</p>
                            </>
                          )}
                          {ashType === 'sulfated' && (
                            <>
                              <p>• Organic substances: ≤ 20.0%</p>
                              <p>• Heavy metal limits apply</p>
                              <p>• Inorganic residues</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ash Content Visualization */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Ash Content Scale</h4>
                    <div className="h-8 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative">
                      <div className="absolute top-0 bottom-0 w-1 bg-black" 
                        style={{ left: `${Math.min((result.ashValue / 30) * 100, 100)}%` }}>
                        <div className="absolute -top-8 -ml-6 text-sm font-semibold">
                          {result.ashValue.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>0%</span>
                      <span>10%</span>
                      <span>20%</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Acceptable</span>
                      <span>Marginal</span>
                      <span>High</span>
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
                <Calculator className="w-5 h-5 mr-2 text-orange-500" />
                Ash Value Formula
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-mono text-center text-orange-700 mb-2">
                  % Ash = [(W₃ - W₁) / W₂] × 100
                </div>
                <div className="text-sm text-gray-600 space-y-2 mt-3">
                  <p><strong>Where:</strong></p>
                  <p>• W₁ = Crucible weight (g)</p>
                  <p>• W₂ = Sample weight (g)</p>
                  <p>• W₃ = Crucible + Ash weight (g)</p>
                </div>
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="bg-orange-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                Ash Value Guidelines
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Types of Ash</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      <strong>Total Ash:</strong> Direct incineration at 450°C
                      <p className="text-xs mt-1">Indicates total inorganic content, soil, sand, and silica</p>
                    </li>
                    <li>
                      <strong>Acid-Insoluble Ash:</strong> HCl treatment after incineration
                      <p className="text-xs mt-1">Indicates silica and siliceous earth content (sand)</p>
                    </li>
                    <li>
                      <strong>Sulfated Ash:</strong> H₂SO₄ treatment before incineration
                      <p className="text-xs mt-1">For volatile substances, converts to stable sulfates</p>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Standard Limits (IP)</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Senna leaves: ≤ 12.0% total ash</li>
                    <li>• Digitalis leaves: ≤ 10.0% total ash</li>
                    <li>• Acacia: ≤ 4.0% total ash</li>
                    <li>• Agar: ≤ 5.0% total ash</li>
                    <li>• Most herbs: ≤ 2.0% acid-insoluble ash</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Procedure Steps */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Procedure Steps</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">1.</span>
                  <span>Weigh empty crucible (W₁) after drying in oven</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">2.</span>
                  <span>Add sample, spread evenly, weigh crucible + sample (W₂)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">3.</span>
                  <span>Heat gradually to 100°C to avoid spattering</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">4.</span>
                  <span>Incinerate at 450°C until carbon-free (2-4 hours)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">5.</span>
                  <span>Cool in desiccator for 30 minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">6.</span>
                  <span>Weigh crucible + ash (W₃)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-orange-600 mr-2">7.</span>
                  <span>Calculate percentage ash</span>
                </li>
              </ol>
            </div>

            {/* Significance Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Significance of Ash Value</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Indicates purity of crude drugs</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Detects adulteration with earthy matter</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Measures inorganic content</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Quality parameter for herbal drugs</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 font-bold mr-2">•</span>
                  <span>Essential for GMP compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Applications in Quality Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Beaker className="w-4 h-4 mr-2" />
                Herbal Drug Testing
              </h3>
              <p className="text-sm text-gray-600">Ensures crude herbal drugs are free from earthy matter, sand, and soil contamination.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Scale className="w-4 h-4 mr-2" />
                Adulteration Detection
              </h3>
              <p className="text-sm text-gray-600">Detects addition of inorganic materials like talc, chalk, or sand to increase weight.</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Pharmacopoeial Compliance
              </h3>
              <p className="text-sm text-gray-600">Meets standards set by IP, BP, USP, and other pharmacopoeias for drug purity.</p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Important Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Precautions</h4>
                <ul className="space-y-1">
                  <li>• Use porcelain or platinum crucibles</li>
                  <li>• Heat gradually to avoid spattering</li>
                  <li>• Cool in desiccator before weighing</li>
                  <li>• Perform in triplicate for accuracy</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Interpretation</h4>
                <ul className="space-y-1">
                  <li>• High ash = contamination/adulteration</li>
                  <li>• Acid-insoluble ash {'>'} 5% = sand/silica</li>
                  <li>• Compare with pharmacopoeial limits</li>
                  <li>• Consider plant part and origin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}