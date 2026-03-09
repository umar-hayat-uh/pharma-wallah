"use client";
import { useState } from 'react';
import { 
  Calculator, Flame, AlertCircle, Info, Thermometer, Scale, 
  Beaker, FileText, BookOpen, Database, FlaskConical, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

export default function AshValueCalculator() {
    const [crucibleWeight, setCrucibleWeight] = useState<string>('');
    const [sampleWeight, setSampleWeight] = useState<string>('');
    const [ashWeight, setAshWeight] = useState<string>('');
    const [ashType, setAshType] = useState<'total' | 'acid-insoluble' | 'sulfated'>('total');
    const [result, setResult] = useState<{
        ashValue: number;
        compliance: boolean;
        message: string;
        interpretation: string;
    } | null>(null);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const calculate = () => {
        const W1 = parseFloat(crucibleWeight);
        const W2 = parseFloat(sampleWeight);
        const W3 = parseFloat(ashWeight);
        
        if (isNaN(W1) || isNaN(W2) || isNaN(W3) || W1 <= 0 || W2 <= 0 || W3 <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }
        
        // % Ash = ((W3 - W1) / W2) × 100 
        const ash = ((W3 - W1) / W2) * 100;

        let compliance = false;
        let message = '';
        let interpretation = '';
        
        // Pharmacopoeial limits based on ash type 
        if (ashType === 'total') {
            compliance = ash <= 15.0;
            message = compliance 
                ? 'Within pharmacopoeial limits for herbal drugs' 
                : 'Exceeds typical total ash limit (≤15%)';
            interpretation = compliance
                ? 'Total ash represents the complete inorganic residue after incineration at 450°C. This value includes both physiological ash (intrinsic minerals from the plant) and non-physiological ash (contaminants like soil, sand, and dust). '
                : 'High total ash may indicate contamination with earthy matter, adulteration with inorganic fillers, or improper cleaning during harvesting. Investigate source and handling procedures. ';
        } else if (ashType === 'acid-insoluble') {
            compliance = ash <= 5.0;
            message = compliance 
                ? 'Within acceptable limits for acid-insoluble ash' 
                : 'Exceeds acid-insoluble ash limit - indicates high silica/sand content';
            interpretation = compliance
                ? 'Acid-insoluble ash measures siliceous matter (sand, silica, soil) that remains after treating total ash with dilute HCl. This specifically detects exogenous contamination from improper cleaning. '
                : 'Elevated acid-insoluble ash strongly suggests contamination with earthy material during harvesting, drying, or storage. This is a critical purity indicator for herbal drugs. ';
        } else {
            compliance = ash <= 20.0;
            message = compliance 
                ? 'Within typical limits for sulfated ash' 
                : 'Exceeds sulfated ash limit - high inorganic residues';
            interpretation = compliance
                ? 'Sulfated ash (residue on ignition) converts metals to their sulfates or oxides using H₂SO₄. This method is preferred for volatile organic substances and provides stable, reproducible results. '
                : 'High sulfated ash indicates excessive metal-containing additives or inorganic impurities. Common in polymers, lubricants, and pharmaceutical excipients. ';
        }
        
        setResult({ ashValue: ash, compliance, message, interpretation });
    };

    const reset = () => {
        setCrucibleWeight('');
        setSampleWeight('');
        setAshWeight('');
        setAshType('total');
        setResult(null);
    };

    const examples = [
        { label: 'Senna Leaves', crucible: '25.432', sample: '2.000', ash: '25.682', type: 'total' as const, limit: '≤12%' },
        { label: 'Digitalis', crucible: '30.125', sample: '3.000', ash: '30.395', type: 'total' as const, limit: '≤10%' },
        { label: 'Acacia Gum', crucible: '28.567', sample: '2.500', ash: '28.647', type: 'acid-insoluble' as const, limit: '≤1%' },
        { label: 'Rhubarb Root', crucible: '32.458', sample: '5.000', ash: '33.208', type: 'acid-insoluble' as const, limit: '≤2%' },
        { label: 'Cellulose', crucible: '29.345', sample: '4.000', ash: '29.425', type: 'sulfated' as const, limit: '≤0.5%' },
    ];

    const loadExample = (idx: number) => {
        const ex = examples[idx];
        setCrucibleWeight(ex.crucible);
        setSampleWeight(ex.sample);
        setAshWeight(ex.ash);
        setAshType(ex.type);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Flame className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Ash Value Calculator</h1>
                                <p className="text-blue-100 mt-2">Total Ash · Acid‑Insoluble Ash · Sulfated Ash</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Pharmacopoeial Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Input Area - Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                                Ash Content Calculation
                            </h2>

                            {/* Ash Type Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    onClick={() => setAshType('total')}
                                    className={`p-4 rounded-xl transition-all text-left ${
                                        ashType === 'total' 
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Beaker className="w-6 h-6 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block">Total Ash</span>
                                            <span className="text-xs opacity-90">Complete incineration at 450°C</span>
                                            <span className="text-xs block mt-1 opacity-80">Measures total inorganic content</span>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAshType('acid-insoluble')}
                                    className={`p-4 rounded-xl transition-all text-left ${
                                        ashType === 'acid-insoluble' 
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <FlaskConical className="w-6 h-6 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block">Acid‑Insoluble</span>
                                            <span className="text-xs opacity-90">HCl treatment after incineration</span>
                                            <span className="text-xs block mt-1 opacity-80">Detects silica, sand, soil contamination</span>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setAshType('sulfated')}
                                    className={`p-4 rounded-xl transition-all text-left ${
                                        ashType === 'sulfated' 
                                            ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Thermometer className="w-6 h-6 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block">Sulfated Ash</span>
                                            <span className="text-xs opacity-90">H₂SO₄ treatment, 600°C</span>
                                            <span className="text-xs block mt-1 opacity-80">Converts metals to stable sulfates</span>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Input Fields */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <Scale className="w-5 h-5 mr-2 text-blue-600" />
                                    Weights (grams)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Crucible (W₁)</label>
                                        <input type="number" step="0.0001" min="0.0001" value={crucibleWeight} 
                                            onChange={(e) => setCrucibleWeight(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500" 
                                            placeholder="e.g., 25.4321" />
                                        <p className="text-xs text-gray-500 mt-1">Empty crucible after drying</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sample (W₂)</label>
                                        <input type="number" step="0.0001" min="0.0001" value={sampleWeight} 
                                            onChange={(e) => setSampleWeight(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500" 
                                            placeholder="e.g., 2.0000" />
                                        <p className="text-xs text-gray-500 mt-1">Accurately weighed sample</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Crucible + Ash (W₃)</label>
                                        <input type="number" step="0.0001" min="0.0001" value={ashWeight} 
                                            onChange={(e) => setAshWeight(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500" 
                                            placeholder="e.g., 25.4823" />
                                        <p className="text-xs text-gray-500 mt-1">After incineration to constant weight</p>
                                    </div>
                                </div>
                            </div>

                            {/* Temperature Info */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Thermometer className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-gray-800">Incineration Conditions: </span>
                                        <span className="text-sm text-gray-600">
                                            {ashType === 'total' ? '450°C until carbon-free (2-4 hours)' :
                                             ashType === 'acid-insoluble' ? '450°C, then boil with 2M HCl, filter, ignite at 450°C again' :
                                             'Treat with H₂SO₄, incinerate at 600°C in closed system (hazardous fumes)'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Example Samples */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <Database className="w-5 h-5 mr-2 text-blue-600" />
                                    Reference Samples (Pharmacopoeial Standards)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {examples.map((ex, idx) => (
                                        <button key={idx} onClick={() => loadExample(idx)}
                                            className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border border-blue-200 rounded-lg p-3 text-left transition-all hover:shadow-md"
                                            title={`Limit: ${ex.limit}`}>
                                            <div className="font-semibold text-blue-700 text-sm">{ex.label}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {ex.type}<br /><span className="font-mono">{ex.ash}%</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={calculate}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Calculate Ash Value
                                </button>
                                <button onClick={reset}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center">
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Detailed Information Panel */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full text-left">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                                    About Ash Value Analysis
                                </h3>
                                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            
                            {showDetails && (
                                <div className="mt-4 space-y-4 text-sm text-gray-600">
                                    <p><span className="font-semibold">Definition:</span> Ash value refers to the inorganic residue remaining after complete combustion of organic matter. It indicates the mineral content and purity of a substance.</p>
                                    <p><span className="font-semibold">Types of Ash:</span></p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-medium">Total Ash:</span> Complete inorganic content (physiological + non-physiological).</li>
                                        <li><span className="font-medium">Acid-Insoluble Ash:</span> Siliceous matter (sand, silica, soil) that resists HCl.</li>
                                        <li><span className="font-medium">Sulfated Ash:</span> Metals converted to sulfates using H₂SO₄; standard for pharmaceuticals.</li>
                                    </ul>
                                    <p><span className="font-semibold">Significance:</span> Ash analysis detects adulteration, ensures pharmacopoeial compliance, and verifies inorganic excipient levels.</p>
                                    <p><span className="font-semibold">Formula:</span> % Ash = [(W₃ - W₁) / W₂] × 100, where W₁ = crucible, W₂ = sample, W₃ = crucible + ash.</p>
                                    <p className="text-xs text-gray-500 italic">Sources: Testronix Instruments, Nikopharmed, ASTM, Kintek, PubMed, European Pharmacopoeia, Precisa</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results & Information - Right Column */}
                    <div className="space-y-6">
                        {result && (
                            <div className={`rounded-2xl shadow-xl p-6 md:p-8 text-white ${
                                result.compliance ? 'bg-gradient-to-br from-green-600 to-green-400' : 'bg-gradient-to-br from-red-600 to-red-400'
                            }`}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <Scale className="w-7 h-7 mr-3" />
                                    Ash Value
                                </h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-4 text-center">
                                    <div className="text-5xl font-bold mb-2">{result.ashValue.toFixed(2)}%</div>
                                    <div className="text-lg font-semibold">
                                        {ashType === 'total' ? 'Total Ash' : ashType === 'acid-insoluble' ? 'Acid-Insoluble Ash' : 'Sulfated Ash'}
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4 text-center">
                                    <p className="font-semibold">{result.message}</p>
                                </div>
                            </div>
                        )}

                        {/* Ash Scale Visualization */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                    Ash Scale & Limits
                                </h3>
                                <div className="h-8 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative">
                                    <div className="absolute top-0 bottom-0 w-1 bg-black"
                                        style={{ left: `${Math.min((result.ashValue / 30) * 100, 100)}%` }}>
                                        <div className="absolute -top-6 -ml-6 text-xs font-semibold whitespace-nowrap text-gray-700">
                                            {result.ashValue.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600 mt-2">
                                    <span>0%</span><span>10%</span><span>20%</span><span>30%</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                                    <div className="text-center p-2 bg-green-50 rounded-lg">
                                        <div className="font-semibold text-green-700">Acceptable</div>
                                        <div className="text-xs text-gray-600">
                                            {ashType === 'total' ? '<8%' : ashType === 'acid-insoluble' ? '<2%' : '<10%'}
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                        <div className="font-semibold text-yellow-700">Marginal</div>
                                        <div className="text-xs text-gray-600">
                                            {ashType === 'total' ? '8-15%' : ashType === 'acid-insoluble' ? '2-5%' : '10-20%'}
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 rounded-lg">
                                        <div className="font-semibold text-red-700">High</div>
                                        <div className="text-xs text-gray-600">
                                            {ashType === 'total' ? '>15%' : ashType === 'acid-insoluble' ? '>5%' : '>20%'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interpretation Panel */}
                        {result && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                    Interpretation
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed">{result.interpretation}</p>
                            </div>
                        )}

                        {/* Formula Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                                Formula
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-lg font-mono text-center text-blue-700 mb-2">% Ash = ((W₃ - W₁) / W₂) × 100</p>
                                <div className="text-xs text-gray-600 space-y-1 mt-2">
                                    <p><span className="font-medium">W₁</span> = Crucible weight (g)</p>
                                    <p><span className="font-medium">W₂</span> = Sample weight (g)</p>
                                    <p><span className="font-medium">W₃</span> = Crucible + Ash weight (g)</p>
                                </div>
                            </div>
                        </div>

                        {/* Pharmacopoeial Limits */}
                        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                Pharmacopoeial Limits
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <p className="font-semibold">Total Ash</p>
                                    <p>• Herbal drugs: ≤ 15%</p>
                                    <p>• Plant extracts: ≤ 10%</p>
                                    <p>• Senna leaves: ≤ 12%</p>
                                    <p>• Digitalis leaves: ≤ 10%</p>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <p className="font-semibold">Acid-Insoluble Ash</p>
                                    <p>• Most herbs: ≤ 5%</p>
                                    <p>• Vegetable drugs: ≤ 2%</p>
                                    <p>• Purified extracts: ≤ 1%</p>
                                    <p className="text-xs mt-1 italic">Indicates silica/sand contamination</p>
                                </div>
                                <div className="p-3 bg-white/50 rounded-lg">
                                    <p className="font-semibold">Sulfated Ash</p>
                                    <p>• Organic substances: ≤ 20%</p>
                                    <p>• Cellulose derivatives: ≤ 0.5%</p>
                                    <p>• Pharmaceutical excipients: varies</p>
                                </div>
                            </div>
                        </div>

                        {/* Applications */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Applications</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span><span className="font-medium">Pharmaceuticals:</span> Purity testing of APIs, excipients, herbal drugs</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span><span className="font-medium">Food Industry:</span> Mineral content, quality control, adulteration detection</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span><span className="font-medium">Cosmetics:</span> Purity of natural ingredients, inorganic residues</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span><span className="font-medium">Research:</span> Marker for digestibility studies (AIA)</span>
                                </div>
                            </div>
                        </div>

                        {/* Working Mechanism */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Working Mechanism</h3>
                            <ol className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start"><span className="font-bold text-blue-600 mr-2">1.</span>Weigh empty crucible (W₁) after drying to constant weight</li>
                                <li className="flex items-start"><span className="font-bold text-blue-600 mr-2">2.</span>Add sample, weigh crucible + sample (total = W₁ + W₂)</li>
                                <li className="flex items-start"><span className="font-bold text-blue-600 mr-2">3.</span>Heat gradually to 100°C to avoid spattering, then incinerate at 450-600°C</li>
                                <li className="flex items-start"><span className="font-bold text-blue-600 mr-2">4.</span>Cool in desiccator, weigh crucible + ash (W₃)</li>
                                <li className="flex items-start"><span className="font-bold text-blue-600 mr-2">5.</span>Calculate: % Ash = ((W₃ - W₁) / W₂) × 100</li>
                            </ol>
                            <p className="text-xs text-gray-500 mt-3">
                                For acid-insoluble ash: treat total ash with HCl, filter, ignite residue<br />
                                For sulfated ash: moisten with H₂SO₄ before ignition
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}