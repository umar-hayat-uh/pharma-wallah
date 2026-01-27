"use client";
import { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, Plus, Trash2, BarChart3 } from 'lucide-react';

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
        probitLineEquation: string;
        confidenceInterval: { lower: number; upper: number };
        chiSquare: number;
        goodnessOfFit: string;
        mortalityRates: Array<{ dose: number; observed: number; expected: number }>;
        classification: string;
        riskLevel: string;
        color: string;
    } | null>(null);

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

    // Probit transformation function
    const probitTransform = (p: number): number => {
        // Normal distribution quantile function (probit) approximation
        // Add 5 to convert to probit scale (mean=5, SD=1)
        const x = Math.sqrt(-2 * Math.log(p));
        const probit = x - ((0.010328 * x + 0.802853) * x + 2.515517) / 
                      (((0.001308 * x + 0.189269) * x + 1.432788) * x + 1);
        return probit + 5;
    };

    // Calculate probit regression
    const calculateProbitRegression = () => {
        // Filter valid data points
        const validData = doseResponseData.filter(d => 
            d.dose && d.response && d.n && 
            parseFloat(d.dose) > 0 && 
            parseFloat(d.response) >= 0 && 
            parseFloat(d.n) > 0
        );

        if (validData.length < 3) {
            alert('Please enter at least 3 valid dose-response data points for probit analysis');
            return;
        }

        // Convert to numbers and calculate proportions
        const data = validData.map(d => ({
            dose: parseFloat(d.dose),
            response: parseFloat(d.response),
            n: parseFloat(d.n),
            p: parseFloat(d.response) / 100, // Convert percentage to proportion
            logDose: Math.log10(parseFloat(d.dose))
        }));

        // Sort by dose
        data.sort((a, b) => a.dose - b.dose);

        // Apply probit transformation
        const transformedData = data.map(d => ({
            ...d,
            probit: probitTransform(d.p),
            weight: d.n * d.p * (1 - d.p) // Weight for regression
        }));

        // Weighted linear regression: probit = a + b * logDose
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumW = 0;
        
        transformedData.forEach(d => {
            const w = d.weight;
            sumX += w * d.logDose;
            sumY += w * d.probit;
            sumXY += w * d.logDose * d.probit;
            sumX2 += w * d.logDose * d.logDose;
            sumW += w;
        });

        const meanX = sumX / sumW;
        const meanY = sumY / sumW;
        const Sxx = sumX2 - (sumX * sumX) / sumW;
        const Sxy = sumXY - (sumX * sumY) / sumW;
        
        const b = Sxy / Sxx; // Slope
        const a = meanY - b * meanX; // Intercept

        // Calculate LD50 (probit = 5)
        const logLD50 = (5 - a) / b;
        const ld50 = Math.pow(10, logLD50);

        // Calculate ED50 (or TD50) - for non-lethal endpoints
        const logED50 = (5 - a) / b; // Same calculation for 50% effect
        const ed50 = Math.pow(10, logED50);

        // Calculate confidence intervals (approximate)
        const n = data.length;
        const residualVariance = transformedData.reduce((sum, d) => {
            const predicted = a + b * d.logDose;
            return sum + d.weight * Math.pow(d.probit - predicted, 2);
        }, 0) / (n - 2);

        const se = Math.sqrt(residualVariance / (b * b * Sxx));
        const tValue = 2.0; // Approximate for 95% CI with n>20
        
        const logLD50Lower = logLD50 - tValue * se;
        const logLD50Upper = logLD50 + tValue * se;
        
        const confidenceInterval = {
            lower: Math.pow(10, logLD50Lower),
            upper: Math.pow(10, logLD50Upper)
        };

        // Calculate Chi-square goodness of fit
        let chiSquare = 0;
        const mortalityRates = data.map(d => {
            const expectedProbit = a + b * Math.log10(d.dose);
            const expectedP = 1 / (1 + Math.exp(-(expectedProbit - 5) * Math.PI / Math.sqrt(3))); // Convert back to probability
            const expectedDeaths = expectedP * d.n;
            const observedDeaths = d.p * d.n;
            
            const chi = Math.pow(observedDeaths - expectedDeaths, 2) / 
                       (expectedDeaths * (1 - expectedP));
            chiSquare += chi;
            
            return {
                dose: d.dose,
                observed: d.p * 100,
                expected: expectedP * 100
            };
        });

        // Determine classification based on LD50
        let classification = '';
        let riskLevel = '';
        let color = '';

        if (ld50 < 1) {
            classification = 'HIGHLY TOXIC';
            riskLevel = 'EXTREME RISK';
            color = 'text-red-600';
        } else if (ld50 < 50) {
            classification = 'TOXIC';
            riskLevel = 'HIGH RISK';
            color = 'text-orange-600';
        } else if (ld50 < 500) {
            classification = 'MODERATELY TOXIC';
            riskLevel = 'MODERATE RISK';
            color = 'text-yellow-600';
        } else if (ld50 < 5000) {
            classification = 'SLIGHTLY TOXIC';
            riskLevel = 'LOW RISK';
            color = 'text-green-600';
        } else {
            classification = 'PRACTICALLY NON-TOXIC';
            riskLevel = 'VERY LOW RISK';
            color = 'text-blue-600';
        }

        // Goodness of fit assessment
        const degreesOfFreedom = n - 2;
        const criticalValue = degreesOfFreedom > 0 ? 
            (degreesOfFreedom === 1 ? 3.84 : 
             degreesOfFreedom === 2 ? 5.99 : 
             degreesOfFreedom === 3 ? 7.81 : 9.49) : 0;
        
        const goodnessOfFit = chiSquare < criticalValue ? 
            'GOOD FIT (p > 0.05)' : 'POOR FIT (p < 0.05)';

        setResult({
            ed50,
            ld50,
            slope: b,
            probitLineEquation: `Probit = ${a.toFixed(2)} + ${b.toFixed(2)} × log(Dose)`,
            confidenceInterval,
            chiSquare: parseFloat(chiSquare.toFixed(3)),
            goodnessOfFit,
            mortalityRates,
            classification,
            riskLevel,
            color
        });
    };

    const resetCalculator = () => {
        setDoseResponseData([{ dose: '', response: '', n: '' }]);
        setAnimalType('rat');
        setAnimalWeight('');
        setStrain('');
        setTestDuration('');
        setResult(null);
    };

    const animalSpecies = {
        rodent: ['Rat', 'Mouse', 'Guinea Pig', 'Hamster'],
        nonRodent: ['Rabbit', 'Dog', 'Monkey', 'Pig', 'Cat'],
        other: ['Zebrafish', 'Drosophila', 'C. elegans']
    };

    const routeOptions = [
        'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 
        'Intraperitoneal', 'Inhalation', 'Dermal'
    ];

    const exampleStudies = [
        {
            name: 'Acute Oral Toxicity - Rats',
            animal: 'Rat',
            strain: 'Wistar',
            weight: '200-250g',
            doses: ['50', '100', '200', '400', '800'],
            responses: ['0', '10', '40', '70', '90'],
            n: '10'
        },
        {
            name: 'Rodent LD50 Study',
            animal: 'Mouse',
            strain: 'Swiss Albino',
            weight: '20-25g',
            doses: ['5', '10', '20', '40', '80'],
            responses: ['0', '20', '50', '80', '100'],
            n: '8'
        },
        {
            name: 'Subchronic Toxicity',
            animal: 'Rabbit',
            strain: 'New Zealand White',
            weight: '2-3kg',
            doses: ['10', '30', '100', '300'],
            responses: ['0', '0', '30', '60'],
            n: '6'
        }
    ];

    const loadExample = (index: number) => {
        const example = exampleStudies[index];
        const dataPoints = example.doses.map((dose, i) => ({
            dose,
            response: example.responses[i],
            n: example.n
        }));
        setDoseResponseData(dataPoints);
        setAnimalType(example.animal.toLowerCase());
        setStrain(example.strain);
        setAnimalWeight(example.weight.split('-')[0]);
    };

    return (
        <section className="min-h-screen p-4 mt-20 max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl shadow-lg">
                <div className="flex items-center mb-6">
                    <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Probit Analysis Calculator</h2>
                        <p className="text-gray-600">Calculate ED50/LD50 using probit regression method</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Animal Study Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">Animal Study Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Animal Type
                                    </label>
                                    <select
                                        value={animalType}
                                        onChange={(e) => setAnimalType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="rat">Rat</option>
                                        <option value="mouse">Mouse</option>
                                        <option value="rabbit">Rabbit</option>
                                        <option value="dog">Dog</option>
                                        <option value="monkey">Monkey</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Species Type
                                    </label>
                                    <select
                                        value={speciesType}
                                        onChange={(e) => setSpeciesType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="rodent">Rodent</option>
                                        <option value="nonRodent">Non-Rodent</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Route of Administration
                                    </label>
                                    <select
                                        value={routeOfAdmin}
                                        onChange={(e) => setRouteOfAdmin(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        {routeOptions.map(route => (
                                            <option key={route.toLowerCase()} value={route.toLowerCase()}>
                                                {route}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Test Duration (days)
                                    </label>
                                    <input
                                        type="number"
                                        value={testDuration}
                                        onChange={(e) => setTestDuration(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 14"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Strain/Breed
                                    </label>
                                    <input
                                        type="text"
                                        value={strain}
                                        onChange={(e) => setStrain(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Wistar, Sprague-Dawley"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Avg. Weight (g)
                                    </label>
                                    <input
                                        type="number"
                                        value={animalWeight}
                                        onChange={(e) => setAnimalWeight(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dose-Response Data Input */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Dose-Response Data</h3>
                                <button
                                    onClick={addDataPoint}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Dose
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dose (mg/kg)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Response (%)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sample Size (n)</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {doseResponseData.map((point, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={point.dose}
                                                        onChange={(e) => updateDataPoint(index, 'dose', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                        placeholder="e.g., 10"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="100"
                                                        value={point.response}
                                                        onChange={(e) => updateDataPoint(index, 'response', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                        placeholder="0-100"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={point.n}
                                                        onChange={(e) => updateDataPoint(index, 'n', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                                        placeholder="e.g., 10"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => removeDataPoint(index)}
                                                        disabled={doseResponseData.length === 1}
                                                        className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                <p>Note: Enter dose in mg/kg body weight. Response is percentage of animals showing effect.</p>
                            </div>
                        </div>

                        {/* Example Studies */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Example Studies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {exampleStudies.map((study, index) => (
                                    <button
                                        key={index}
                                        onClick={() => loadExample(index)}
                                        className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                                    >
                                        <div className="font-semibold text-gray-800 mb-2">{study.name}</div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Animal: {study.animal}</div>
                                            <div>Strain: {study.strain}</div>
                                            <div>Doses: {study.doses.length} levels</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={calculateProbitRegression}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Perform Probit Analysis
                            </button>
                            <button
                                onClick={resetCalculator}
                                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="space-y-6">
                        {/* Results Card */}
                        {result && (
                            <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Probit Analysis Results</h3>

                                <div className="space-y-6">
                                    {/* LD50/ED50 Values */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">LD50</div>
                                            <div className="text-3xl font-bold text-green-600">
                                                {result.ld50.toFixed(1)} mg/kg
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                95% CI: {result.confidenceInterval.lower.toFixed(1)} - {result.confidenceInterval.upper.toFixed(1)} mg/kg
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                            <div className="text-sm font-semibold text-gray-600 mb-1">ED50</div>
                                            <div className="text-3xl font-bold text-blue-600">
                                                {result.ed50.toFixed(1)} mg/kg
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Effective dose for 50% response
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Classification */}
                                    <div className={`rounded-xl p-4 ${result.color.replace('text', 'bg')} bg-opacity-20 border ${result.color.replace('text', 'border')} border-opacity-30`}>
                                        <div className="font-semibold text-gray-700 mb-1">Toxicity Classification</div>
                                        <div className={`text-xl font-bold ${result.color} mb-2`}>
                                            {result.classification}
                                        </div>
                                        <div className="font-semibold">{result.riskLevel}</div>
                                    </div>

                                    {/* Regression Parameters */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                                        <div className="font-semibold text-gray-700 mb-3">Regression Parameters</div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Probit Line Equation:</span>
                                                <span className="font-mono font-bold">{result.probitLineEquation}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Slope:</span>
                                                <span className="font-bold">{result.slope.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Chi-square:</span>
                                                <span className="font-bold">{result.chiSquare}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Goodness of Fit:</span>
                                                <span className="font-bold">{result.goodnessOfFit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Observed vs Expected Table */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className="font-semibold text-gray-700 mb-3">Observed vs Expected Response</div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Dose (mg/kg)</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Observed %</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Expected %</th>
                                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Difference</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {result.mortalityRates.map((rate, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2 font-medium">{rate.dose}</td>
                                                            <td className="px-4 py-2">{rate.observed.toFixed(1)}%</td>
                                                            <td className="px-4 py-2">{rate.expected.toFixed(1)}%</td>
                                                            <td className="px-4 py-2">
                                                                <span className={Math.abs(rate.observed - rate.expected) > 10 ? 'text-red-600' : 'text-green-600'}>
                                                                    {(rate.observed - rate.expected).toFixed(1)}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Study Summary */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                                        <div className="font-semibold text-gray-700 mb-2">Study Summary</div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Animal: {animalType.charAt(0).toUpperCase() + animalType.slice(1)}</div>
                                            <div>Route: {routeOfAdmin}</div>
                                            {strain && <div>Strain: {strain}</div>}
                                            {animalWeight && <div>Avg Weight: {animalWeight}g</div>}
                                            {testDuration && <div>Duration: {testDuration} days</div>}
                                            <div>Data Points: {doseResponseData.filter(d => d.dose && d.response).length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Probit Analysis Guide */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Probit Analysis Guide</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="font-semibold text-gray-800 mb-1">Method Overview</div>
                                    <p className="text-sm text-gray-600">
                                        Probit analysis transforms dose-response data to fit a linear model using the probit (probability unit) scale. 
                                        It provides statistically robust ED50/LD50 estimates with confidence intervals.
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="font-semibold text-gray-800 mb-1">Minimum Requirements</div>
                                    <p className="text-sm text-gray-600">
                                        • At least 3 dose levels with partial responses (between 10-90%)<br/>
                                        • At least 5 animals per dose group recommended<br/>
                                        • Include control group (0% response) if possible
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="font-semibold text-gray-800 mb-1">Interpretation</div>
                                    <p className="text-sm text-gray-600">
                                        • Goodness of Fit (Chi-square) &lt; critical value indicates good model fit<br/>
                                        • Narrow confidence intervals indicate precise estimate<br/>
                                        • Steep slope indicates sensitive response to dose changes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}