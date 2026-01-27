"use client";
import { useState, useEffect } from 'react';
import { Calculator, Scale, BarChart, AlertCircle, CheckCircle, XCircle, TrendingUp, Target, Percent, GitCompare } from 'lucide-react';

export default function ContentUniformityCalculator() {
  const [units, setUnits] = useState<string[]>(Array(10).fill(''));
  const [labelClaim, setLabelClaim] = useState<string>('100');
  const [results, setResults] = useState<{
    mean: number;
    standardDeviation: number;
    relativeStandardDeviation: number;
    acceptanceValue: number;
    min: number;
    max: number;
    passesStage1: boolean;
    passesStage2: boolean;
    finalResult: 'PASS' | 'FAIL' | 'TEST STAGE 2';
    individualResults: Array<{ value: number; percentage: number; status: 'PASS' | 'FAIL' }>;
  } | null>(null);

  const handleUnitChange = (index: number, value: string) => {
    const newUnits = [...units];
    newUnits[index] = value;
    setUnits(newUnits);
  };

  const calculateUniformity = () => {
    const numericUnits = units
      .map(unit => parseFloat(unit))
      .filter(unit => !isNaN(unit) && unit > 0);

    if (numericUnits.length < 10) {
      alert('Please enter at least 10 valid unit weights/contents');
      return;
    }

    const label = parseFloat(labelClaim);
    if (isNaN(label) || label <= 0) {
      alert('Please enter a valid label claim value');
      return;
    }

    // Calculate basic statistics
    const sum = numericUnits.reduce((a, b) => a + b, 0);
    const mean = sum / numericUnits.length;
    const min = Math.min(...numericUnits);
    const max = Math.max(...numericUnits);

    // Calculate standard deviation
    const squaredDiffs = numericUnits.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (numericUnits.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const relativeStandardDeviation = (standardDeviation / mean) * 100;

    // Calculate Acceptance Value (AV) per USP <905>
    let M = 0;
    const averagePercentage = (mean / label) * 100;

    if (averagePercentage >= 98.5 && averagePercentage <= 101.5) {
      M = mean;
    } else if (averagePercentage < 98.5) {
      M = label * 0.985;
    } else {
      M = label * 1.015;
    }

    const k = 2.4; // Acceptability constant for n=10
    const acceptanceValue = Math.abs(M - mean) + (k * standardDeviation);

    // Stage 1 criteria
    const passesStage1 = acceptanceValue <= 15;
    const individualResults = numericUnits.map(value => {
      const percentage = (value / label) * 100;
      return {
        value,
        percentage,
        status: (percentage >= 85 && percentage <= 115 ? 'PASS' as const : 'FAIL' as const)
      };
    });

    // Stage 2 criteria (if needed)
    const passesStage2 = acceptanceValue <= 25;

    let finalResult: 'PASS' | 'FAIL' | 'TEST STAGE 2' = 'PASS';
    if (passesStage1 && individualResults.every(r => r.status === 'PASS')) {
      finalResult = 'PASS';
    } else if (!passesStage1 && passesStage2 && individualResults.filter(r => r.status === 'PASS').length >= 24) {
      finalResult = 'TEST STAGE 2';
    } else {
      finalResult = 'FAIL';
    }

    setResults({
      mean,
      standardDeviation,
      relativeStandardDeviation,
      acceptanceValue,
      min,
      max,
      passesStage1,
      passesStage2,
      finalResult,
      individualResults
    });
  };

  const resetCalculator = () => {
    setUnits(Array(10).fill(''));
    setLabelClaim('100');
    setResults(null);
  };

  const addMoreUnits = () => {
    setUnits([...units, ...Array(5).fill('')]);
  };

  const exampleData = {
    passing: ['98.5', '99.2', '100.1', '100.5', '99.8', '100.2', '99.9', '100.3', '99.7', '100.0'],
    borderline: ['97.5', '98.8', '99.1', '100.5', '101.2', '102.5', '98.7', '99.9', '100.1', '101.8'],
    failing: ['88.5', '92.1', '95.3', '97.8', '99.2', '101.5', '103.2', '104.8', '106.5', '108.2']
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <GitCompare className="w-12 h-12 text-blue-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Content Uniformity Calculator</h1>
                <p className="text-gray-600">Evaluate dosage unit consistency using AV (Acceptance Value) per USP/Ph. Eur. standards</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUnits(exampleData.passing);
                  setLabelClaim('100');
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Passing Example
              </button>
              <button
                onClick={() => {
                  setUnits(exampleData.borderline);
                  setLabelClaim('100');
                }}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Borderline Example
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calculator Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-blue-600" />
                Enter Unit Weights/Contents
              </h2>

              {/* Label Claim Input */}
              <div className="mb-8 bg-blue-50 rounded-xl p-6">
                <label className="block text-lg font-semibold text-blue-800 mb-3">
                  Label Claim (mg or %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={labelClaim}
                  onChange={(e) => setLabelClaim(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="100"
                />
                <p className="text-sm text-gray-600 mt-2">Reference value for percentage calculations</p>
              </div>

              {/* Unit Inputs Grid */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Individual Unit Data</h3>
                  <button
                    onClick={addMoreUnits}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    + Add 5 More Units
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {units.map((unit, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit {index + 1}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={unit}
                        onChange={(e) => handleUnitChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={calculateUniformity}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
                >
                  Calculate Uniformity
                </button>
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <BarChart className="w-6 h-6 mr-2 text-blue-600" />
                  Uniformity Results
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-blue-700 mb-2">Acceptance Value (AV)</div>
                    <div className={`text-3xl font-bold ${results.acceptanceValue <= 15 ? 'text-green-600' : results.acceptanceValue <= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {results.acceptanceValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600 mt-2">USP Limit: ≤ 15.0</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-green-700 mb-2">Relative Standard Deviation</div>
                    <div className={`text-3xl font-bold ${results.relativeStandardDeviation <= 6 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {results.relativeStandardDeviation.toFixed(2)}%
                    </div>
                    <div className="text-sm text-green-600 mt-2">Typical target: ≤ 6%</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-purple-700 mb-2">Range</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {results.min.toFixed(1)} - {results.max.toFixed(1)}
                    </div>
                    <div className="text-sm text-purple-600 mt-2">Min to Max values</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-orange-700 mb-2">Mean Value</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {results.mean.toFixed(2)}
                    </div>
                    <div className="text-sm text-orange-600 mt-2">Average of all units</div>
                  </div>
                </div>

                {/* Final Result */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 ${results.finalResult === 'PASS' ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200' : results.finalResult === 'TEST STAGE 2' ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-200' : 'bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Final Result</h3>
                        <p className="text-gray-600">
                          {results.finalResult === 'PASS' 
                            ? 'Batch PASSES content uniformity requirements (Stage 1)' 
                            : results.finalResult === 'TEST STAGE 2'
                            ? 'Test additional units (Stage 2 required)'
                            : 'Batch FAILS content uniformity requirements'}
                        </p>
                      </div>
                      <div className={`text-4xl font-bold ${results.finalResult === 'PASS' ? 'text-green-600' : results.finalResult === 'TEST STAGE 2' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {results.finalResult}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Unit Results */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Unit Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Unit</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Value</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">% of Label</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.individualResults.map((unit, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{index + 1}</td>
                            <td className="py-3 px-4">{unit.value.toFixed(2)}</td>
                            <td className="py-3 px-4">{unit.percentage.toFixed(1)}%</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${unit.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {unit.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution Analysis</h3>
                  <div className="h-48 relative">
                    <div className="absolute inset-0 flex items-end">
                      {results.individualResults.map((unit, index) => {
                        const height = Math.min((unit.percentage - 85) / 30 * 100, 100);
                        return (
                          <div
                            key={index}
                            className={`flex-1 mx-0.5 ${unit.status === 'PASS' ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ height: `${height}%` }}
                            title={`Unit ${index + 1}: ${unit.percentage.toFixed(1)}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-300" />
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                      <span>85%</span>
                      <span>100%</span>
                      <span>115%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Guidelines */}
          <div className="space-y-8">
            {/* Formula Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                USP {'<905>'}Formula
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-lg font-mono text-center text-blue-700 mb-3">
                  AV = |M - X̄| + k·s
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Where:</strong></p>
                  <p>• AV = Acceptance Value</p>
                  <p>• M = Reference value (98.5-101.5%)</p>
                  <p>• X̄ = Sample mean</p>
                  <p>• k = Acceptability constant (2.4 for n=10)</p>
                  <p>• s = Sample standard deviation</p>
                </div>
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Acceptance Criteria
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">Stage 1 (n=10)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AV ≤ 15.0</li>
                    <li>• All units 85.0-115.0%</li>
                    <li>• No unit outside 75.0-125.0%</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">Stage 2 (n=30)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• AV ≤ 25.0</li>
                    <li>• ≥ 24 units 85.0-115.0%</li>
                    <li>• All units 75.0-125.0%</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Guidelines
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Required for all solid oral dosage forms (tablets, capsules)</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Perform on finished product and during stability studies</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Use validated analytical method for content determination</span>
                </div>
                <div className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>High RSD ({'>'}6%) indicates formulation or process issues</span>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center p-3 bg-white rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-gray-700">Batch release testing</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg">
                  <Percent className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-gray-700">Process validation</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg">
                  <Scale className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-gray-700">Stability testing</span>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg">
                  <BarChart className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-gray-700">Formulation development</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}