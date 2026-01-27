"use client";
import { useState } from 'react';
import { Calculator, AlertTriangle, Shield, FlaskConical, Zap, Thermometer, Droplet, Beaker, TestTube, Atom } from 'lucide-react';

interface CompatibilityFactor {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  selected: boolean;
}

interface ChemicalGroup {
  id: string;
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export default function DrugExcipientCompatibilityPredictor() {
  const [drugGroups, setDrugGroups] = useState<ChemicalGroup[]>([
    { id: '1', name: 'Primary Amine', description: '-NH₂ groups', risk: 'high' },
    { id: '2', name: 'Secondary Amine', description: '-NH- groups', risk: 'medium' },
    { id: '3', name: 'Ester', description: '-COOR groups', risk: 'medium' },
    { id: '4', name: 'Lactone', description: 'Cyclic esters', risk: 'high' },
    { id: '5', name: 'Aldehyde', description: '-CHO groups', risk: 'high' },
    { id: '6', name: 'Ketone', description: 'C=O groups', risk: 'low' },
    { id: '7', name: 'Alcohol', description: '-OH groups', risk: 'low' },
    { id: '8', name: 'Phenol', description: 'Aromatic -OH', risk: 'medium' },
    { id: '9', name: 'Carboxylic Acid', description: '-COOH groups', risk: 'medium' },
    { id: '10', name: 'Thiol', description: '-SH groups', risk: 'high' },
  ]);

  const [excipientGroups, setExcipientGroups] = useState<ChemicalGroup[]>([
    { id: 'e1', name: 'Lactose', description: 'Reducing sugar', risk: 'high' },
    { id: 'e2', name: 'Mannitol', description: 'Sugar alcohol', risk: 'low' },
    { id: 'e3', name: 'Microcrystalline Cellulose', description: 'Cellulose polymer', risk: 'low' },
    { id: 'e4', name: 'Povidone', description: 'Polyvinylpyrrolidone', risk: 'medium' },
    { id: 'e5', name: 'Croscarmellose Sodium', description: 'Superdisintegrant', risk: 'low' },
    { id: 'e6', name: 'Magnesium Stearate', description: 'Lubricant', risk: 'low' },
    { id: 'e7', name: 'Talc', description: 'Glidant', risk: 'low' },
    { id: 'e8', name: 'Silicon Dioxide', description: 'Glidant', risk: 'low' },
    { id: 'e9', name: 'Starch', description: 'Polysaccharide', risk: 'medium' },
    { id: 'e10', name: 'Gelatin', description: 'Protein', risk: 'medium' },
  ]);

  const [compatibilityFactors, setCompatibilityFactors] = useState<CompatibilityFactor[]>([
    { id: 'f1', name: 'High Temperature', description: 'Storage > 40°C', riskLevel: 'high', selected: false },
    { id: 'f2', name: 'High Humidity', description: '> 75% RH', riskLevel: 'high', selected: false },
    { id: 'f3', name: 'Light Exposure', description: 'UV/Visible light', riskLevel: 'medium', selected: false },
    { id: 'f4', name: 'Oxygen Exposure', description: 'Atmospheric oxygen', riskLevel: 'medium', selected: false },
    { id: 'f5', name: 'Low pH', description: 'pH < 4', riskLevel: 'high', selected: false },
    { id: 'f6', name: 'High pH', description: 'pH > 9', riskLevel: 'high', selected: false },
    { id: 'f7', name: 'Metal Ions', description: 'Fe³⁺, Cu²⁺, etc.', riskLevel: 'high', selected: false },
    { id: 'f8', name: 'Aqueous Environment', description: 'Moisture presence', riskLevel: 'medium', selected: false },
  ]);

  const [selectedDrugGroups, setSelectedDrugGroups] = useState<string[]>([]);
  const [selectedExcipientGroups, setSelectedExcipientGroups] = useState<string[]>([]);
  const [results, setResults] = useState<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    potentialIssues: string[];
    recommendations: string[];
    compatibility: 'compatible' | 'caution' | 'incompatible';
  } | null>(null);

  const toggleDrugGroup = (id: string) => {
    setSelectedDrugGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleExcipientGroup = (id: string) => {
    setSelectedExcipientGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const toggleFactor = (id: string) => {
    setCompatibilityFactors(prev =>
      prev.map(factor =>
        factor.id === id ? { ...factor, selected: !factor.selected } : factor
      )
    );
  };

  const calculateCompatibility = () => {
    if (selectedDrugGroups.length === 0 || selectedExcipientGroups.length === 0) {
      alert('Please select at least one drug group and one excipient group');
      return;
    }

    let riskScore = 0;
    const potentialIssues: string[] = [];
    const recommendations: string[] = [];

    // Calculate risk from selected drug groups
    selectedDrugGroups.forEach(drugId => {
      const drug = drugGroups.find(d => d.id === drugId);
      if (drug) {
        if (drug.risk === 'high') riskScore += 3;
        else if (drug.risk === 'medium') riskScore += 2;
        else riskScore += 1;
      }
    });

    // Calculate risk from selected excipient groups
    selectedExcipientGroups.forEach(excId => {
      const excipient = excipientGroups.find(e => e.id === excId);
      if (excipient) {
        if (excipient.risk === 'high') riskScore += 3;
        else if (excipient.risk === 'medium') riskScore += 2;
        else riskScore += 1;
      }
    });

    // Add risk from environmental factors
    compatibilityFactors.forEach(factor => {
      if (factor.selected) {
        if (factor.riskLevel === 'high') riskScore += 4;
        else if (factor.riskLevel === 'medium') riskScore += 2;
        else riskScore += 1;
        potentialIssues.push(`${factor.name}: ${factor.description}`);
      }
    });

    // Check for specific incompatibilities
    const hasPrimaryAmine = selectedDrugGroups.includes('1');
    const hasLactose = selectedExcipientGroups.includes('e1');
    if (hasPrimaryAmine && hasLactose) {
      riskScore += 5;
      potentialIssues.push('Maillard Reaction: Primary amines react with reducing sugars (lactose)');
      recommendations.push('Avoid lactose with primary amine drugs');
      recommendations.push('Use non-reducing sugars like mannitol instead');
    }

    const hasEster = selectedDrugGroups.includes('3');
    const hasHighPH = compatibilityFactors.find(f => f.id === 'f6' && f.selected);
    if (hasEster && hasHighPH) {
      riskScore += 4;
      potentialIssues.push('Ester Hydrolysis: High pH accelerates ester degradation');
      recommendations.push('Maintain neutral to acidic pH for ester drugs');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let compatibility: 'compatible' | 'caution' | 'incompatible';
    
    if (riskScore <= 5) {
      riskLevel = 'low';
      compatibility = 'compatible';
    } else if (riskScore <= 10) {
      riskLevel = 'medium';
      compatibility = 'caution';
    } else if (riskScore <= 15) {
      riskLevel = 'high';
      compatibility = 'caution';
    } else {
      riskLevel = 'critical';
      compatibility = 'incompatible';
    }

    // Add general recommendations
    if (compatibilityFactors.some(f => f.id === 'f2' && f.selected)) {
      recommendations.push('Use moisture barrier packaging');
    }
    if (compatibilityFactors.some(f => f.id === 'f3' && f.selected)) {
      recommendations.push('Use light-resistant packaging');
    }
    if (selectedDrugGroups.some(id => ['1', '2', '5', '10'].includes(id))) {
      recommendations.push('Consider antioxidant addition');
    }

    setResults({
      riskScore,
      riskLevel,
      potentialIssues,
      recommendations,
      compatibility
    });
  };

  const resetCalculator = () => {
    setSelectedDrugGroups([]);
    setSelectedExcipientGroups([]);
    setCompatibilityFactors(prev => prev.map(f => ({ ...f, selected: false })));
    setResults(null);
  };

  const loadExample = () => {
    setSelectedDrugGroups(['1', '3']); // Primary amine + Ester
    setSelectedExcipientGroups(['e1', 'e4']); // Lactose + Povidone
    setCompatibilityFactors(prev => 
      prev.map(f => 
        f.id === 'f2' || f.id === 'f3' ? { ...f, selected: true } : { ...f, selected: false }
      )
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <Atom className="w-12 h-12 text-orange-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Drug-Excipient Compatibility Predictor</h1>
                <p className="text-gray-600">Risk assessment tool for chemical interactions between drugs and excipients</p>
              </div>
            </div>
            <button
              onClick={loadExample}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calculator Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FlaskConical className="w-6 h-6 mr-2 text-orange-600" />
                Chemical Properties Selection
              </h2>

              {/* Drug Functional Groups */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Beaker className="w-5 h-5 mr-2" />
                  Drug Functional Groups
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {drugGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => toggleDrugGroup(group.id)}
                      className={`p-3 rounded-lg text-left transition-all ${selectedDrugGroups.includes(group.id)
                        ? group.risk === 'high'
                          ? 'bg-red-100 border-2 border-red-300'
                          : group.risk === 'medium'
                          ? 'bg-yellow-100 border-2 border-yellow-300'
                          : 'bg-green-100 border-2 border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{group.name}</div>
                      <div className="text-sm text-gray-600">{group.description}</div>
                      <div className={`text-xs font-semibold mt-1 ${group.risk === 'high' ? 'text-red-600' : group.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {group.risk.toUpperCase()} RISK
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Excipient Types */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <TestTube className="w-5 h-5 mr-2" />
                  Excipient Types
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {excipientGroups.map(group => (
                    <button
                      key={group.id}
                      onClick={() => toggleExcipientGroup(group.id)}
                      className={`p-3 rounded-lg text-left transition-all ${selectedExcipientGroups.includes(group.id)
                        ? group.risk === 'high'
                          ? 'bg-red-100 border-2 border-red-300'
                          : group.risk === 'medium'
                          ? 'bg-yellow-100 border-2 border-yellow-300'
                          : 'bg-green-100 border-2 border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{group.name}</div>
                      <div className="text-sm text-gray-600">{group.description}</div>
                      <div className={`text-xs font-semibold mt-1 ${group.risk === 'high' ? 'text-red-600' : group.risk === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {group.risk.toUpperCase()} RISK
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environmental Factors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Thermometer className="w-5 h-5 mr-2" />
                  Environmental Factors
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {compatibilityFactors.map(factor => (
                    <button
                      key={factor.id}
                      onClick={() => toggleFactor(factor.id)}
                      className={`p-3 rounded-lg text-left transition-all ${factor.selected
                        ? factor.riskLevel === 'high'
                          ? 'bg-red-100 border-2 border-red-300'
                          : factor.riskLevel === 'medium'
                          ? 'bg-yellow-100 border-2 border-yellow-300'
                          : 'bg-green-100 border-2 border-green-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{factor.name}</div>
                      <div className="text-sm text-gray-600">{factor.description}</div>
                      <div className={`text-xs font-semibold mt-1 ${factor.riskLevel === 'high' ? 'text-red-600' : factor.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {factor.riskLevel.toUpperCase()} RISK
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={calculateCompatibility}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
                >
                  Calculate Compatibility Risk
                </button>
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
                >
                  Reset Selection
                </button>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                  Compatibility Assessment Results
                </h2>

                {/* Risk Summary */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 ${results.compatibility === 'compatible'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200'
                    : results.compatibility === 'caution'
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-100 border-2 border-yellow-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200'
                  }`}>
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Overall Compatibility</h3>
                        <p className="text-gray-600">
                          {results.compatibility === 'compatible'
                            ? 'Low risk of incompatibility - Proceed with formulation'
                            : results.compatibility === 'caution'
                            ? 'Moderate risk - Requires stability studies'
                            : 'High risk - Consider alternative excipients'}
                        </p>
                      </div>
                      <div className={`text-4xl font-bold mt-4 md:mt-0 ${results.compatibility === 'compatible'
                        ? 'text-green-600'
                        : results.compatibility === 'caution'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                      }`}>
                        {results.compatibility.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Score and Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Risk Score</div>
                    <div className={`text-4xl font-bold ${results.riskScore <= 5
                      ? 'text-green-600'
                      : results.riskScore <= 10
                      ? 'text-yellow-600'
                      : results.riskScore <= 15
                      ? 'text-orange-600'
                      : 'text-red-600'
                    }`}>
                      {results.riskScore}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">Higher score indicates greater risk</div>
                  </div>

                  <div className={`rounded-xl p-6 ${results.riskLevel === 'low'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-100'
                    : results.riskLevel === 'medium'
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100'
                    : results.riskLevel === 'high'
                    ? 'bg-gradient-to-br from-orange-50 to-red-100'
                    : 'bg-gradient-to-br from-red-50 to-rose-100'
                  }`}>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Risk Level</div>
                    <div className={`text-3xl font-bold ${results.riskLevel === 'low'
                      ? 'text-green-600'
                      : results.riskLevel === 'medium'
                      ? 'text-yellow-600'
                      : results.riskLevel === 'high'
                      ? 'text-orange-600'
                      : 'text-red-600'
                    }`}>
                      {results.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {results.riskLevel === 'low'
                        ? 'Minimal risk - Standard formulation'
                        : results.riskLevel === 'medium'
                        ? 'Moderate risk - Monitor closely'
                        : results.riskLevel === 'high'
                        ? 'High risk - Extensive testing needed'
                        : 'Critical risk - Avoid combination'
                      }
                    </div>
                  </div>
                </div>

                {/* Potential Issues */}
                {results.potentialIssues.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-red-500" />
                      Potential Compatibility Issues
                    </h3>
                    <div className="space-y-3">
                      {results.potentialIssues.map((issue, index) => (
                        <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-red-700">{issue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-500" />
                      Recommendations
                    </h3>
                    <div className="space-y-3">
                      {results.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-green-700">{rec}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Guidelines */}
          <div className="space-y-8">
            {/* Common Interactions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Common Interactions</h3>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="font-semibold text-red-700 mb-1">Maillard Reaction</div>
                  <p className="text-red-600">Primary amines + Reducing sugars → Brown discoloration</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-semibold text-yellow-700 mb-1">Ester Hydrolysis</div>
                  <p className="text-yellow-600">Esters degrade in high pH/moisture</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-orange-700 mb-1">Oxidation</div>
                  <p className="text-orange-600">Phenols/thiols oxidize with metal ions/O₂</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-700 mb-1">Complexation</div>
                  <p className="text-blue-600">Drugs complex with PVP/polysaccharides</p>
                </div>
              </div>
            </div>

            {/* Testing Strategy */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Testing Strategy</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 mr-2"></div>
                  <span>Binary mixtures (drug + each excipient)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 mr-2"></div>
                  <span>Accelerated conditions (40°C/75% RH)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 mr-2"></div>
                  <span>Monitor: Color, assay, degradation products</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 mr-2"></div>
                  <span>Use DSC, FTIR, HPLC for analysis</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 mr-2"></div>
                  <span>Test for 2-4 weeks initially</span>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">High-Risk Combinations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center p-2 bg-red-50 rounded-lg">
                  <span className="text-red-700 font-medium">Amino drugs + Lactose</span>
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded-lg">
                  <span className="text-red-700 font-medium">Aspirin + Alkaline excipients</span>
                </div>
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700 font-medium">Vitamins + Reducing sugars</span>
                </div>
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700 font-medium">Antioxidants + Oxidizing agents</span>
                </div>
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-700 font-medium">Protein drugs + Surfactants</span>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Formulation Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-1">For Amine Drugs</h4>
                  <p>Use mannitol instead of lactose</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-1">For Ester Drugs</h4>
                  <p>Maintain acidic pH, use desiccants</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-1">For Oxidation-Prone</h4>
                  <p>Add antioxidants, use nitrogen blanket</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-1">General</h4>
                  <p>Start compatibility studies early in development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}