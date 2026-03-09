"use client";
import { useState } from 'react';
import { Calculator, Grid3x3, Target, BarChart, TrendingUp, Percent, Circle, Box, Ruler, Layers, Scale } from 'lucide-react';

interface SieveData {
  mesh: number;
  opening: number;
  retained: string;
}

interface ParticleSizeData {
  size: string;
  percentage: string;
}

export default function SurfaceAreaParticleSizeCalculator() {
  const [method, setMethod] = useState<'sieve' | 'laser'>('sieve');
  const [sieveData, setSieveData] = useState<SieveData[]>([
    { mesh: 20, opening: 850, retained: '0' },
    { mesh: 40, opening: 425, retained: '5' },
    { mesh: 60, opening: 250, retained: '15' },
    { mesh: 80, opening: 180, retained: '25' },
    { mesh: 100, opening: 150, retained: '20' },
    { mesh: 200, opening: 75, retained: '15' },
    { mesh: 0, opening: 0, retained: '20' }, // Pan
  ]);
  const [particleData, setParticleData] = useState<ParticleSizeData[]>([
    { size: '1000', percentage: '5' },
    { size: '500', percentage: '15' },
    { size: '250', percentage: '25' },
    { size: '125', percentage: '20' },
    { size: '63', percentage: '15' },
    { size: '0', percentage: '20' },
  ]);
  const [density, setDensity] = useState<string>('1.5');
  const [results, setResults] = useState<{
    d10: number;
    d50: number;
    d90: number;
    meanDiameter: number;
    specificSurfaceArea: number;
    span: number;
    distribution: 'narrow' | 'moderate' | 'broad';
    cumulativeData: Array<{ size: number; cumulative: number }>;
  } | null>(null);

  const updateSieveData = (index: number, field: keyof SieveData, value: string) => {
    const newData = [...sieveData];
    newData[index] = { ...newData[index], [field]: value };
    setSieveData(newData);
  };

  const updateParticleData = (index: number, field: keyof ParticleSizeData, value: string) => {
    const newData = [...particleData];
    newData[index] = { ...newData[index], [field]: value };
    setParticleData(newData);
  };

  const addSieveRow = () => {
    setSieveData([...sieveData, { mesh: 0, opening: 0, retained: '0' }]);
  };

  const addParticleRow = () => {
    setParticleData([...particleData, { size: '0', percentage: '0' }]);
  };

  const calculateParticleSize = () => {
    if (method === 'sieve') {
      calculateFromSieve();
    } else {
      calculateFromLaser();
    }
  };

  const calculateFromSieve = () => {
    const validData = sieveData.filter(d => 
      parseFloat(d.retained) >= 0 && parseFloat(d.retained) <= 100
    );
    
    if (validData.length < 2) {
      alert('Please enter valid sieve analysis data');
      return;
    }

    const totalRetained = validData.reduce((sum, d) => sum + parseFloat(d.retained), 0);
    if (Math.abs(totalRetained - 100) > 5) {
      alert(`Total retained should be ~100% (current: ${totalRetained.toFixed(1)}%)`);
      return;
    }

    let cumulative = 0;
    const cumulativeData = validData.map(d => {
      cumulative += parseFloat(d.retained);
      return {
        size: d.opening,
        cumulative: 100 - cumulative
      };
    });

    const d10 = interpolateSize(cumulativeData, 10);
    const d50 = interpolateSize(cumulativeData, 50);
    const d90 = interpolateSize(cumulativeData, 90);

    const meanDiameter = Math.sqrt(d10 * d90);
    const span = (d90 - d10) / d50;
    const densityValue = parseFloat(density) || 1;
    const specificSurfaceArea = (6 / (densityValue * (d50 / 1000))) * 1000; // m²/kg

    let distribution: 'narrow' | 'moderate' | 'broad' = 'moderate';
    if (span < 1) distribution = 'narrow';
    else if (span > 2) distribution = 'broad';

    setResults({
      d10,
      d50,
      d90,
      meanDiameter,
      specificSurfaceArea,
      span,
      distribution,
      cumulativeData
    });
  };

  const calculateFromLaser = () => {
    const validData = particleData.filter(d => 
      parseFloat(d.percentage) >= 0 && parseFloat(d.percentage) <= 100
    );
    
    if (validData.length < 2) {
      alert('Please enter valid particle size distribution data');
      return;
    }

    const totalPercentage = validData.reduce((sum, d) => sum + parseFloat(d.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 5) {
      alert(`Total percentage should be ~100% (current: ${totalPercentage.toFixed(1)}%)`);
      return;
    }

    const sortedData = [...validData]
      .map(d => ({ size: parseFloat(d.size), percentage: parseFloat(d.percentage) }))
      .sort((a, b) => b.size - a.size);

    let cumulative = 0;
    const cumulativeData = sortedData.map(d => {
      cumulative += d.percentage;
      return {
        size: d.size,
        cumulative: 100 - cumulative
      };
    });

    const d10 = interpolateSize(cumulativeData, 10);
    const d50 = interpolateSize(cumulativeData, 50);
    const d90 = interpolateSize(cumulativeData, 90);

    const meanDiameter = sortedData.reduce((sum, d) => 
      sum + (d.size * d.percentage), 0
    ) / 100;

    const span = (d90 - d10) / d50;
    const densityValue = parseFloat(density) || 1;
    const specificSurfaceArea = (6 / (densityValue * (d50 / 1000))) * 1000;

    let distribution: 'narrow' | 'moderate' | 'broad' = 'moderate';
    if (span < 1) distribution = 'narrow';
    else if (span > 2) distribution = 'broad';

    setResults({
      d10,
      d50,
      d90,
      meanDiameter,
      specificSurfaceArea,
      span,
      distribution,
      cumulativeData
    });
  };

  const interpolateSize = (data: Array<{size: number, cumulative: number}>, target: number): number => {
    for (let i = 0; i < data.length - 1; i++) {
      const point1 = data[i];
      const point2 = data[i + 1];
      
      if (target >= point2.cumulative && target <= point1.cumulative) {
        const fraction = (target - point2.cumulative) / (point1.cumulative - point2.cumulative);
        return point2.size + fraction * (point1.size - point2.size);
      }
    }
    return data[0]?.size || 0;
  };

  const resetCalculator = () => {
    setSieveData([
      { mesh: 20, opening: 850, retained: '0' },
      { mesh: 40, opening: 425, retained: '5' },
      { mesh: 60, opening: 250, retained: '15' },
      { mesh: 80, opening: 180, retained: '25' },
      { mesh: 100, opening: 150, retained: '20' },
      { mesh: 200, opening: 75, retained: '15' },
      { mesh: 0, opening: 0, retained: '20' },
    ]);
    setParticleData([
      { size: '1000', percentage: '5' },
      { size: '500', percentage: '15' },
      { size: '250', percentage: '25' },
      { size: '125', percentage: '20' },
      { size: '63', percentage: '15' },
      { size: '0', percentage: '20' },
    ]);
    setDensity('1.5');
    setResults(null);
  };

  const loadExample = (type: 'fine' | 'coarse' | 'bimodal') => {
    if (method === 'sieve') {
      if (type === 'fine') {
        setSieveData([
          { mesh: 60, opening: 250, retained: '2' },
          { mesh: 80, opening: 180, retained: '8' },
          { mesh: 100, opening: 150, retained: '20' },
          { mesh: 200, opening: 75, retained: '40' },
          { mesh: 325, opening: 45, retained: '20' },
          { mesh: 0, opening: 0, retained: '10' },
        ]);
      } else if (type === 'coarse') {
        setSieveData([
          { mesh: 20, opening: 850, retained: '15' },
          { mesh: 40, opening: 425, retained: '30' },
          { mesh: 60, opening: 250, retained: '25' },
          { mesh: 80, opening: 180, retained: '15' },
          { mesh: 100, opening: 150, retained: '10' },
          { mesh: 200, opening: 75, retained: '5' },
          { mesh: 0, opening: 0, retained: '0' },
        ]);
      }
    } else {
      if (type === 'fine') {
        setParticleData([
          { size: '100', percentage: '5' },
          { size: '50', percentage: '15' },
          { size: '25', percentage: '30' },
          { size: '10', percentage: '30' },
          { size: '5', percentage: '15' },
          { size: '1', percentage: '5' },
        ]);
      } else if (type === 'coarse') {
        setParticleData([
          { size: '1000', percentage: '10' },
          { size: '500', percentage: '25' },
          { size: '250', percentage: '30' },
          { size: '125', percentage: '20' },
          { size: '63', percentage: '10' },
          { size: '0', percentage: '5' },
        ]);
      }
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Grid3x3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Surface Area & Particle Size Analyzer</h1>
                <p className="text-blue-100 mt-2">Calculate D10, D50, D90, mean diameter, and specific surface area</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => loadExample('fine')}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm"
              >
                Fine Powder
              </button>
              <button
                onClick={() => loadExample('coarse')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Coarse Granules
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Ruler className="w-6 h-6 mr-2 text-blue-600" />
                Particle Size Data Input
              </h2>

              {/* Method Selection */}
              <div className="mb-8">
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setMethod('sieve')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      method === 'sieve'
                        ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sieve Analysis
                  </button>
                  <button
                    onClick={() => setMethod('laser')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      method === 'laser'
                        ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Laser Diffraction
                  </button>
                </div>

                {/* Density Input */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    <Scale className="inline w-5 h-5 mr-2" />
                    Particle Density (g/cm³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full max-w-xs px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="1.5"
                  />
                  <p className="text-sm text-gray-600 mt-2">Required for surface area calculation.</p>
                </div>

                {/* Data Input Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {method === 'sieve' ? 'Sieve Analysis Data' : 'Particle Size Distribution'}
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          {method === 'sieve' ? (
                            <>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700">Sieve Mesh</th>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700">Opening (μm)</th>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700">% Retained</th>
                            </>
                          ) : (
                            <>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700">Size (μm)</th>
                              <th className="py-3 px-4 text-left font-semibold text-gray-700">% by Volume</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(method === 'sieve' ? sieveData : particleData).map((item, index) => {
                          const sieveItem = item as SieveData;
                          const particleItem = item as ParticleSizeData;
                          return (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                              {method === 'sieve' ? (
                                <>
                                  <td className="py-3 px-4">
                                    <input
                                      type="number"
                                      value={sieveItem.mesh}
                                      onChange={(e) => updateSieveData(index, 'mesh', e.target.value)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="number"
                                      step="1"
                                      value={sieveItem.opening}
                                      onChange={(e) => updateSieveData(index, 'opening', e.target.value)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={sieveItem.retained}
                                      onChange={(e) => updateSieveData(index, 'retained', e.target.value)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3 px-4">
                                    <input
                                      type="number"
                                      step="1"
                                      value={particleItem.size}
                                      onChange={(e) => updateParticleData(index, 'size', e.target.value)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={particleItem.percentage}
                                      onChange={(e) => updateParticleData(index, 'percentage', e.target.value)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={method === 'sieve' ? addSieveRow : addParticleRow}
                    className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    + Add Row
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={calculateParticleSize}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Calculate Particle Size
                </button>
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                >
                  Reset Data
                </button>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <BarChart className="w-6 h-6 mr-2 text-green-600" />
                  Particle Size Analysis Results
                </h2>

                {/* Key Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-blue-700 mb-2">D50 (Median)</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {results.d50.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-blue-600 mt-2">50% smaller</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-green-700 mb-2">D10</div>
                    <div className="text-3xl font-bold text-green-600">
                      {results.d10.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-green-600 mt-2">10% smaller</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-purple-700 mb-2">D90</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {results.d90.toFixed(1)} μm
                    </div>
                    <div className="text-sm text-purple-600 mt-2">90% smaller</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-orange-700 mb-2">Mean</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {results.meanDiameter.toFixed(1)} μm
                    </div>
                  </div>
                </div>

                {/* Secondary Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Specific Surface Area</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {results.specificSurfaceArea.toFixed(1)} m²/kg
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-yellow-700 mb-2">Span</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.span.toFixed(2)}
                    </div>
                  </div>
                  <div className={`rounded-xl p-6 ${
                    results.distribution === 'narrow'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                      : results.distribution === 'moderate'
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-100'
                      : 'bg-gradient-to-br from-red-50 to-rose-100'
                  }`}>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Distribution</div>
                    <div className={`text-2xl font-bold ${
                      results.distribution === 'narrow' ? 'text-green-600' : results.distribution === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {results.distribution.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Cumulative Distribution Chart */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cumulative Distribution</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="h-64 relative">
                      <div className="absolute inset-0">
                        {results.cumulativeData.map((point, index) => {
                          const x = Math.log10(Math.max(point.size, 1)) / 3 * 100;
                          const y = 100 - point.cumulative;
                          return (
                            <div
                              key={index}
                              className="absolute w-3 h-3 bg-blue-500 rounded-full -ml-1.5 -mt-1.5"
                              style={{ left: `${x}%`, top: `${y}%` }}
                            />
                          );
                        })}
                        <svg className="absolute inset-0">
                          <polyline
                            points={results.cumulativeData.map(p => 
                              `${Math.log10(Math.max(p.size, 1)) / 3 * 100},${100 - p.cumulative}`
                            ).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                        <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                        <span>1 μm</span><span>10 μm</span><span>100 μm</span><span>1000 μm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implications */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Implications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">Dissolution Rate</h4>
                      <p className="text-gray-600">
                        D50 {results.d50.toFixed(0)} μm – {results.d50 < 50 ? 'Fast' : 'Moderate'} dissolution.
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Flowability</h4>
                      <p className="text-gray-600">
                        Span {results.span.toFixed(2)} – {results.span < 1.5 ? 'Good flow' : 'May need glidant'}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Definitions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Key Definitions</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-1">D10, D50, D90</h4>
                  <p className="text-gray-600">Particle size below which 10%, 50%, 90% of particles fall.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-1">Span</h4>
                  <p className="text-gray-600">(D90 - D10) / D50 – measures distribution width.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-1">Specific Surface Area</h4>
                  <p className="text-gray-600">Surface area per unit mass (m²/kg).</p>
                </div>
              </div>
            </div>

            {/* Target Ranges */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Target Ranges</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-1">Tablet Formulation</h4>
                  <p>D50: 50–200 μm, Span &lt; 2.0</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-1">Inhalation</h4>
                  <p>D50: 1–5 μm, narrow distribution</p>
                </div>
              </div>
            </div>

            {/* Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Analysis Methods</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Layers className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <span><strong>Sieve:</strong> Mechanical, &gt;45 μm</span>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                  <span><strong>Laser diffraction:</strong> 0.1–3000 μm</span>
                </div>
              </div>
            </div>

            {/* Quality Impact */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quality Impact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Dissolution: smaller particles dissolve faster.</li>
                <li>• Bioavailability: affects absorption.</li>
                <li>• Flowability: critical for manufacturing.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}