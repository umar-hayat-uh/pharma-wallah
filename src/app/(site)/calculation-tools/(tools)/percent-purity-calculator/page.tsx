"use client";
import { useState } from 'react';
import { Calculator, Percent, AlertCircle, Info, FlaskConical, Beaker, Scale, BookOpen, Database, FileText, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
    interpretation: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const calculate = () => {
    const W = parseFloat(sampleWeight);
    const V = parseFloat(titrantVolume);
    const N = parseFloat(titrantNormality);
    const E = parseFloat(equivalentFactor);
    const D = parseFloat(dilutionFactor) || 1;

    if (isNaN(W) || isNaN(V) || isNaN(N) || isNaN(E) || W <= 0 || V <= 0 || N <= 0 || E <= 0) {
      alert('Please enter valid positive numbers');
      return;
    }

    const purity = (V * N * E * D * 100) / W;

    let status: 'compliant' | 'non-compliant' | 'marginal' = 'compliant';
    let message = '';
    let interpretation = '';

    if (purity >= 98.0 && purity <= 102.0) {
      status = 'compliant';
      message = 'Meets pharmacopoeial standards';
      interpretation = 'The assay result is within the accepted range (98‑102%). The sample is suitable for use.';
    } else if (purity >= 95.0 && purity < 98.0) {
      status = 'marginal';
      message = 'Borderline – investigate';
      interpretation = 'The purity is slightly below specification. Check for analytical errors, impurity interference, or degradation.';
    } else {
      status = 'non-compliant';
      message = 'Fails quality standards – reject';
      interpretation = 'The assay result is outside acceptable limits. The sample may be adulterated, degraded, or incorrectly prepared.';
    }

    setResult({ purity, status, message, interpretation });
  };

  const reset = () => {
    setSampleWeight('');
    setTitrantVolume('');
    setTitrantNormality('');
    setEquivalentFactor('');
    setDilutionFactor('1');
    setResult(null);
  };

  const examples = [
    { label: 'Aspirin', W: '0.5', V: '24.5', N: '0.1', E: '0.1802' },
    { label: 'Ascorbic Acid', W: '1.0', V: '48.2', N: '0.05', E: '0.1761' },
    { label: 'Paracetamol', W: '0.3', V: '15.8', N: '0.1', E: '0.1512' },
    { label: 'NaCl', W: '0.2', V: '34.2', N: '0.1', E: '0.05844' },
    { label: 'Amoxicillin', W: '0.5', V: '21.3', N: '0.1', E: '0.3644', D: '5' }
  ];
  const loadExample = (idx: number) => {
    const ex = examples[idx];
    setSampleWeight(ex.W);
    setTitrantVolume(ex.V);
    setTitrantNormality(ex.N);
    setEquivalentFactor(ex.E);
    setDilutionFactor(ex.D || '1');
  };

  const pieData = result ? [
    { name: 'Purity', value: result.purity },
    { name: 'Impurity', value: 100 - result.purity }
  ] : [];
  const COLORS = ['#3b82f6', '#ef4444'];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Percent className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Percent Purity (Assay) Calculator</h1>
                <p className="text-blue-100 mt-2">% Purity = (V·N·E·D·100)/W</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <FlaskConical className="w-5 h-5 text-white inline mr-2" />
              <span className="text-white font-semibold">Titrimetric Analysis</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                Assay Calculation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <label className="block text-lg font-semibold mb-3">Sample Weight (mg)</label>
                  <input type="number" step="0.001" min="0.001" value={sampleWeight} onChange={(e) => setSampleWeight(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg" />
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <label className="block text-lg font-semibold mb-3">Titrant Volume (mL)</label>
                  <input type="number" step="0.01" min="0.01" value={titrantVolume} onChange={(e) => setTitrantVolume(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-green-200 rounded-lg" />
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <label className="block text-lg font-semibold mb-3">Titrant Normality (N)</label>
                  <input type="number" step="0.001" min="0.001" value={titrantNormality} onChange={(e) => setTitrantNormality(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-purple-200 rounded-lg" />
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <label className="block text-lg font-semibold mb-3">Equivalent Factor (E)</label>
                  <input type="number" step="0.0001" min="0.0001" value={equivalentFactor} onChange={(e) => setEquivalentFactor(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-orange-200 rounded-lg" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <label className="block text-lg font-semibold mb-3">Dilution Factor (D)</label>
                <input type="number" step="1" min="1" value={dilutionFactor} onChange={(e) => setDilutionFactor(e.target.value)}
                  className="w-32 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg" />
              </div>

              <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Examples</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {examples.map((ex, idx) => (
                    <button key={idx} onClick={() => loadExample(idx)}
                      className="bg-white p-2 rounded-lg text-xs hover:bg-blue-100">
                      <div className="font-semibold">{ex.label}</div>
                      <div>V {ex.V} mL</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button onClick={calculate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 rounded-xl shadow-lg">
                  Calculate Purity
                </button>
                <button onClick={reset}
                  className="px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2" /> Reset
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <button onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full text-left">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  About Titrimetric Assay
                </h3>
                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showDetails && (
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <p><span className="font-semibold">Principle:</span> The volume of titrant of known concentration needed to react completely with the sample is used to calculate the amount of analyte.</p>
                  <p><span className="font-semibold">Equivalent factor (E):</span> Milliequivalent weight of the analyte (mg/mEq). For a compound with molecular weight M and n reacting equivalents, E = M / n.</p>
                  <p><span className="font-semibold">Acceptance criteria:</span> USP: 90‑110%; BP: 95‑105%; IP: 98‑102% of label claim.</p>
                  <p className="text-xs italic">Sources: USP General Chapter `&gt;`541, European Pharmacopoeia 2.5.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {result && (
              <>
                <div className={`rounded-2xl shadow-xl p-6 md:p-8 text-white ${result.status === 'compliant' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                    result.status === 'marginal' ? 'bg-gradient-to-br from-yellow-600 to-yellow-400' :
                      'bg-gradient-to-br from-red-600 to-red-400'
                  }`}>
                  <h2 className="text-2xl font-bold mb-4">Purity</h2>
                  <div className="bg-white/20 rounded-xl p-6 text-center">
                    <div className="text-5xl font-bold">{result.purity.toFixed(2)}%</div>
                    <div className="mt-2">{result.message}</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Composition</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Interpretation</h3>
                  <p className="text-sm">{result.interpretation}</p>
                </div>
              </>
            )}

            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pharmacopoeial Limits</h3>
              <p className="text-sm">USP: 90‑110%<br />BP: 95‑105%<br />IP: 98‑102%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}