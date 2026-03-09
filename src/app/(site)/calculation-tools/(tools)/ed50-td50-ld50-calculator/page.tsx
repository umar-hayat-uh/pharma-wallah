"use client";
import { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, Plus, Trash2, BarChart3, Target } from 'lucide-react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter } from 'recharts';

export default function ProbitAnalysisCalculator() {
    const [doseResponseData, setDoseResponseData] = useState([
        { dose: '', response: '', n: '' }
    ]);
    const [animalType, setAnimalType] = useState('rat');
    const [animalWeight, setAnimalWeight] = useState('');
    const [strain, setStrain] = useState('');
    const [testDuration, setTestDuration] = useState('');
    const [routeOfAdmin, setRouteOfAdmin] = useState('oral');
    const [speciesType, setSpeciesType] = useState('rodent');
    const [result, setResult] = useState<{
        ed50: number;
        ld50: number;
        slope: number;
        intercept: number;
        probitLineEquation: string;
        confidenceInterval: { lower: number; upper: number };
        chiSquare: number;
        goodnessOfFit: string;
        mortalityRates: Array<{ dose: number; observed: number; expected: number }>;
        classification: string;
        riskLevel: string;
        color: string;
    } | null>(null);
    const [lineData, setLineData] = useState<any[]>([]);
    const [scatterData, setScatterData] = useState<any[]>([]);

    // Probit transformation (inverse of standard normal CDF + 5)
    const probitTransform = (p: number): number => {
        if (p <= 0) return -Infinity;
        if (p >= 1) return Infinity;
        // Approximation by Hastings (1955)
        const t = Math.sqrt(-2 * Math.log(p));
        const probit = t - ((0.010328 * t + 0.802853) * t + 2.515517) /
            (((0.001308 * t + 0.189269) * t + 1.432788) * t + 1);
        return probit + 5;
    };

    const calculateProbitRegression = () => {
        // Filter valid data points
        const validData = doseResponseData.filter(d =>
            d.dose && d.response && d.n &&
            parseFloat(d.dose) > 0 &&
            parseFloat(d.response) >= 0 &&
            parseFloat(d.n) > 0
        );

        if (validData.length < 3) {
            alert('Please enter at least 3 valid dose‑response data points for probit analysis');
            return;
        }

        // Convert to numbers and calculate proportions
        const data = validData.map(d => ({
            dose: parseFloat(d.dose),
            response: parseFloat(d.response),
            n: parseFloat(d.n),
            p: parseFloat(d.response) / 100,
            logDose: Math.log10(parseFloat(d.dose))
        }));

        data.sort((a, b) => a.dose - b.dose);

        // Apply probit transformation, exclude 0% and 100%
        const transformable = data.filter(d => d.p > 0 && d.p < 1);
        if (transformable.length < 2) {
            alert('Need at least two points with response between 0% and 100%');
            return;
        }

        const transformed = transformable.map(d => ({
            ...d,
            probit: probitTransform(d.p),
            weight: d.n * d.p * (1 - d.p)
        }));

        // Weighted linear regression: probit = a + b * logDose
        let sumW = 0, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        transformed.forEach(d => {
            const w = d.weight;
            sumW += w;
            sumX += w * d.logDose;
            sumY += w * d.probit;
            sumXY += w * d.logDose * d.probit;
            sumX2 += w * d.logDose * d.logDose;
        });

        const meanX = sumX / sumW;
        const meanY = sumY / sumW;
        const Sxx = sumX2 - sumX * sumX / sumW;
        const Sxy = sumXY - sumX * sumY / sumW;

        const slope = Sxy / Sxx;
        const intercept = meanY - slope * meanX;

        // LD50 (probit = 5)
        const logLD50 = (5 - intercept) / slope;
        const ld50 = Math.pow(10, logLD50);
        const ed50 = ld50;

        // Confidence intervals (approximate)
        const residualVariance = transformed.reduce((sum, d) => {
            const pred = intercept + slope * d.logDose;
            return sum + d.weight * Math.pow(d.probit - pred, 2);
        }, 0) / (transformed.length - 2);
        const seLog = Math.sqrt(residualVariance / (slope * slope * Sxx));
        const tValue = 1.96; // 95% CI
        const logLower = logLD50 - tValue * seLog;
        const logUpper = logLD50 + tValue * seLog;
        const confidenceInterval = {
            lower: Math.pow(10, logLower),
            upper: Math.pow(10, logUpper)
        };

        // Chi-square goodness of fit
        let chiSquare = 0;
        const mortalityRates = data.map(d => {
            const expectedProbit = intercept + slope * Math.log10(d.dose);
            const expectedP = 1 / (1 + Math.exp(-(expectedProbit - 5) * Math.PI / Math.sqrt(3)));
            const expectedDeaths = expectedP * d.n;
            const observedDeaths = d.p * d.n;
            const chi = Math.pow(observedDeaths - expectedDeaths, 2) / (expectedDeaths * (1 - expectedP));
            chiSquare += chi;
            return {
                dose: d.dose,
                observed: d.p * 100,
                expected: expectedP * 100
            };
        });
        const df = transformed.length - 2;
        const criticalChi = df === 1 ? 3.84 : df === 2 ? 5.99 : df === 3 ? 7.81 : 9.49;
        const goodnessOfFit = chiSquare < criticalChi ? 'GOOD FIT (p > 0.05)' : 'POOR FIT (p < 0.05)';

        // Toxicity classification (Hodge & Sterner)
        let classification = '', riskLevel = '', color = '';
        if (ld50 < 1) { classification = 'HIGHLY TOXIC'; riskLevel = 'EXTREME RISK'; color = 'text-red-600'; }
        else if (ld50 < 50) { classification = 'TOXIC'; riskLevel = 'HIGH RISK'; color = 'text-orange-600'; }
        else if (ld50 < 500) { classification = 'MODERATELY TOXIC'; riskLevel = 'MODERATE RISK'; color = 'text-yellow-600'; }
        else if (ld50 < 5000) { classification = 'SLIGHTLY TOXIC'; riskLevel = 'LOW RISK'; color = 'text-green-600'; }
        else { classification = 'PRACTICALLY NON‑TOXIC'; riskLevel = 'VERY LOW RISK'; color = 'text-blue-600'; }

        setResult({
            ed50, ld50, slope, intercept,
            probitLineEquation: `Probit = ${intercept.toFixed(2)} + ${slope.toFixed(2)} × log(Dose)`,
            confidenceInterval, chiSquare: parseFloat(chiSquare.toFixed(3)),
            goodnessOfFit, mortalityRates, classification, riskLevel, color
        });

        // Prepare line data (continuous regression line) over the full log dose range of observed data
        const logDoses = data.map(d => Math.log10(d.dose));
        const minLog = Math.min(...logDoses);
        const maxLog = Math.max(...logDoses);
        const linePoints = [];
        for (let i = 0; i <= 100; i++) {
            const logDose = minLog + (maxLog - minLog) * i / 100;
            const fittedProbit = intercept + slope * logDose;
            linePoints.push({ logDose, fittedProbit });
        }
        setLineData(linePoints);

        // Scatter data (observed probits) – only for points with 0% < p < 100%
        const scatterPoints = data
            .filter(d => d.p > 0 && d.p < 1)
            .map(d => ({
                logDose: Math.log10(d.dose),
                observedProbit: probitTransform(d.p)
            }));
        setScatterData(scatterPoints);
    };

    const addDataPoint = () => {
        setDoseResponseData([...doseResponseData, { dose: '', response: '', n: '' }]);
    };

    const removeDataPoint = (index: number) => {
        if (doseResponseData.length > 1) {
            const newData = [...doseResponseData];
            newData.splice(index, 1);
            setDoseResponseData(newData);
        }
    };

    const updateDataPoint = (index: number, field: string, value: string) => {
        const newData = [...doseResponseData];
        newData[index] = { ...newData[index], [field]: value };
        setDoseResponseData(newData);
    };

    const resetCalculator = () => {
        setDoseResponseData([{ dose: '', response: '', n: '' }]);
        setAnimalType('rat');
        setAnimalWeight('');
        setStrain('');
        setTestDuration('');
        setResult(null);
        setLineData([]);
        setScatterData([]);
    };

    const exampleStudies = [
        { name: 'Acute Oral Toxicity - Rats', animal: 'Rat', strain: 'Wistar', weight: '200', doses: ['50','100','200','400','800'], responses: ['0','10','40','70','90'], n: '10' },
        { name: 'Rodent LD50 Study', animal: 'Mouse', strain: 'Swiss Albino', weight: '20', doses: ['5','10','20','40','80'], responses: ['0','20','50','80','100'], n: '8' },
        { name: 'Subchronic Toxicity', animal: 'Rabbit', strain: 'New Zealand', weight: '2000', doses: ['10','30','100','300'], responses: ['0','0','30','60'], n: '6' }
    ];

    const loadExample = (index: number) => {
        const ex = exampleStudies[index];
        const dataPoints = ex.doses.map((d, i) => ({ dose: d, response: ex.responses[i], n: ex.n }));
        setDoseResponseData(dataPoints);
        setAnimalType(ex.animal.toLowerCase());
        setStrain(ex.strain);
        setAnimalWeight(ex.weight);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Probit Analysis Calculator</h1>
                                <p className="text-blue-100 mt-2">LD₅₀/ED₅₀ via maximum likelihood probit regression</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Finney&#39;s method</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Animal Study Details */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Animal Study Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Animal Type</label>
                                    <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="rat">Rat</option><option value="mouse">Mouse</option><option value="rabbit">Rabbit</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Species Type</label>
                                    <select value={speciesType} onChange={(e) => setSpeciesType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="rodent">Rodent</option><option value="nonRodent">Non‑Rodent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Route</label>
                                    <select value={routeOfAdmin} onChange={(e) => setRouteOfAdmin(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="oral">Oral</option><option value="ip">IP</option><option value="iv">IV</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
                                    <input type="number" value={testDuration} onChange={(e) => setTestDuration(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Strain</label>
                                    <input type="text" value={strain} onChange={(e) => setStrain(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (g)</label>
                                    <input type="number" value={animalWeight} onChange={(e) => setAnimalWeight(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                        </div>

                        {/* Dose‑Response Data Table */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Dose‑Response Data</h3>
                                <button onClick={addDataPoint}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    <Plus className="w-4 h-4" /> Add Dose
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Dose (mg/kg)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Response (%)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Sample Size (n)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {doseResponseData.map((point, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3">
                                                    <input type="number" step="0.001" value={point.dose}
                                                        onChange={(e) => updateDataPoint(idx, 'dose', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., 10" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input type="number" step="0.1" min="0" max="100" value={point.response}
                                                        onChange={(e) => updateDataPoint(idx, 'response', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input type="number" min="1" value={point.n}
                                                        onChange={(e) => updateDataPoint(idx, 'n', e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => removeDataPoint(idx)} disabled={doseResponseData.length === 1}
                                                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Response % = (number responding / n) × 100</p>
                        </div>

                        {/* Example Studies */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
                            <h3 className="font-bold text-gray-800 mb-4">Example Studies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {exampleStudies.map((study, idx) => (
                                    <button key={idx} onClick={() => loadExample(idx)}
                                        className="bg-white rounded-lg p-4 hover:shadow-md text-left">
                                        <div className="font-semibold text-blue-700">{study.name}</div>
                                        <div className="text-xs text-gray-600 mt-2">{study.animal} · {study.doses.length} doses</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button onClick={calculateProbitRegression}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                Perform Probit Analysis
                            </button>
                            <button onClick={resetCalculator}
                                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-colors">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="space-y-6">
                        {result && (
                            <>
                                <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 text-white">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                                        <Target className="w-7 h-7 mr-3" />
                                        LD₅₀ / ED₅₀
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/20 rounded-xl p-4 text-center">
                                            <div className="text-sm font-semibold">LD₅₀</div>
                                            <div className="text-3xl font-bold">{result.ld50.toFixed(1)} mg/kg</div>
                                            <div className="text-xs">95% CI: {result.confidenceInterval.lower.toFixed(1)}–{result.confidenceInterval.upper.toFixed(1)}</div>
                                        </div>
                                        <div className="bg-white/20 rounded-xl p-4 text-center">
                                            <div className="text-sm font-semibold">ED₅₀</div>
                                            <div className="text-3xl font-bold">{result.ed50.toFixed(1)} mg/kg</div>
                                        </div>
                                    </div>
                                    <div className={`mt-4 rounded-xl p-4 ${result.color.replace('text', 'bg')} bg-opacity-20 border`}>
                                        <div className="text-sm font-semibold">Classification</div>
                                        <div className={`text-xl font-bold ${result.color}`}>{result.classification}</div>
                                        <div className="text-sm">{result.riskLevel}</div>
                                    </div>
                                </div>

                                {/* Probit Plot */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Probit Regression</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="logDose"
                                                    type="number"
                                                    domain={['auto', 'auto']}
                                                    label={{ value: 'log Dose', position: 'insideBottom', offset: -5 }}
                                                />
                                                <YAxis
                                                    domain={[0, 10]}
                                                    label={{ value: 'Probit', angle: -90, position: 'insideLeft' }}
                                                />
                                                <Tooltip />
                                                {/* Regression line */}
                                                <Line
                                                    data={lineData}
                                                    type="monotone"
                                                    dataKey="fittedProbit"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="Fitted line"
                                                />
                                                {/* Observed points */}
                                                <Scatter
                                                    data={scatterData}
                                                    fill="#3b82f6"
                                                    name="Observed"
                                                    shape="circle"
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">Fitted line: {result.probitLineEquation}</p>
                                </div>

                                {/* Fit Statistics */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Goodness of Fit</h3>
                                    <p className="text-sm">χ² = {result.chiSquare}</p>
                                    <p className="text-sm">{result.goodnessOfFit}</p>
                                </div>
                            </>
                        )}

                        {/* Probit Guide */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                                Probit Guide
                            </h3>
                            <ul className="text-sm space-y-2">
                                <li>• Minimum 3 doses with partial responses (10–90%)</li>
                                <li>• Natural response rate (controls) can be entered separately</li>
                                <li>• Slope &gt; 0 indicates increased effect with dose</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}