"use client";
import { useState } from 'react';
import { Thermometer, Wind, Droplets, Clock, RefreshCw, Info, Activity, Zap, Gauge, Filter, AlertCircle, BarChart3, Target } from 'lucide-react';

export default function ChemicalEngineeringCalculators() {
    const [activeTab, setActiveTab] = useState<'heat' | 'reynolds' | 'drying' | 'mixing'>('heat');

    return (
        <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Thermometer className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Chemical Engineering Calculators</h1>
                            <p className="text-gray-600 text-lg mt-2">Professional tools for process engineering calculations</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center mt-6">
                        <button
                            onClick={() => setActiveTab('heat')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'heat'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Thermometer className="w-5 h-5 mr-2" />
                            Heat Transfer Area
                        </button>
                        <button
                            onClick={() => setActiveTab('reynolds')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'reynolds'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Wind className="w-5 h-5 mr-2" />
                            Reynolds Number
                        </button>
                        <button
                            onClick={() => setActiveTab('drying')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'drying'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Droplets className="w-5 h-5 mr-2" />
                            Drying Rate
                        </button>
                        <button
                            onClick={() => setActiveTab('mixing')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'mixing'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Mixing Time Estimator
                        </button>
                    </div>
                </div>

                {/* Calculator Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {activeTab === 'heat' && <HeatTransferAreaCalculator />}
                    {activeTab === 'reynolds' && <ReynoldsNumberCalculator />}
                    {activeTab === 'drying' && <DryingRateCalculator />}
                    {activeTab === 'mixing' && <MixingTimeEstimator />}
                </div>

                {/* Quick Reference Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-6">
                        <Info className="w-8 h-8 text-green-400 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Engineering Reference Guide</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
                            <h4 className="font-bold text-red-800 mb-4">Heat Transfer</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>U (Water-Water)</span>
                                    <span className="font-semibold">800-1500 W/m²K</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>U (Steam-Water)</span>
                                    <span className="font-semibold">1500-4000 W/m²K</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>U (Gas-Gas)</span>
                                    <span className="font-semibold">10-50 W/m²K</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                            <h4 className="font-bold text-blue-800 mb-4">Flow Regimes</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Laminar Flow</span>
                                    <span className="font-semibold text-blue-600">Re {'<'}  2000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Transitional</span>
                                    <span className="font-semibold text-yellow-600">2000-4000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Turbulent Flow</span>
                                    <span className="font-semibold text-red-600">Re  {'>'}  4000</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6">
                            <h4 className="font-bold text-amber-800 mb-4">Drying Rates</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Constant Rate</span>
                                    <span className="font-semibold">1-5 kg/m²h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Falling Rate</span>
                                    <span className="font-semibold">0.1-1 kg/m²h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Critical Moisture</span>
                                    <span className="font-semibold">0.1-0.5 kg/kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                            <h4 className="font-bold text-purple-800 mb-4">Mixing Times</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Low Viscosity</span>
                                    <span className="font-semibold">30-120 s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Medium Viscosity</span>
                                    <span className="font-semibold">120-600 s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>High Viscosity</span>
                                    <span className="font-semibold">10-30 min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 1. Heat Transfer Area Calculator
function HeatTransferAreaCalculator() {
    const [heatTransferRate, setHeatTransferRate] = useState<string>('');
    const [temperatureDifference, setTemperatureDifference] = useState<string>('');
    const [overallCoefficient, setOverallCoefficient] = useState<string>('');
    const [unitSystem, setUnitSystem] = useState<'si' | 'imperial'>('si');
    const [result, setResult] = useState<{
        area: number;
        interpretation: string;
        heatExchangerType: string;
        color: string;
    } | null>(null);

    const calculateArea = () => {
        const Q = parseFloat(heatTransferRate);
        const ΔT = parseFloat(temperatureDifference);
        const U = parseFloat(overallCoefficient);

        if (isNaN(Q) || isNaN(ΔT) || isNaN(U) || Q <= 0 || ΔT <= 0 || U <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // A = Q / (U * ΔT)
        const area = Q / (U * ΔT);

        let interpretation = '';
        let heatExchangerType = '';
        let color = '';

        if (area < 5) {
            interpretation = 'Small heat exchanger required';
            heatExchangerType = 'Compact/Small Scale';
            color = 'text-blue-600';
        } else if (area >= 5 && area < 50) {
            interpretation = 'Medium sized heat exchanger';
            heatExchangerType = 'Shell & Tube (Medium)';
            color = 'text-green-600';
        } else if (area >= 50 && area < 200) {
            interpretation = 'Large heat exchanger required';
            heatExchangerType = 'Shell & Tube (Large)';
            color = 'text-orange-600';
        } else {
            interpretation = 'Very large industrial heat exchanger';
            heatExchangerType = 'Plate & Frame or Multiple Units';
            color = 'text-red-600';
        }

        setResult({
            area,
            interpretation,
            heatExchangerType,
            color
        });
    };

    const resetCalculator = () => {
        setHeatTransferRate('');
        setTemperatureDifference('');
        setOverallCoefficient('');
        setResult(null);
    };

    const typicalUValues = [
        { fluids: 'Water to Water', value: '850-1700', unit: 'W/m²K' },
        { fluids: 'Steam to Water', value: '1500-4000', unit: 'W/m²K' },
        { fluids: 'Oil to Water', value: '100-350', unit: 'W/m²K' },
        { fluids: 'Gas to Gas', value: '10-50', unit: 'W/m²K' },
        { fluids: 'Condensing Steam', value: '2000-6000', unit: 'W/m²K' },
    ];

    const heatExchangerTypes = [
        { type: 'Double Pipe', area: '0.1-2 m²', application: 'Small duties' },
        { type: 'Shell & Tube', area: '5-1000 m²', application: 'General process' },
        { type: 'Plate & Frame', area: '0.1-2000 m²', application: 'High efficiency' },
        { type: 'Air Cooled', area: '10-500 m²', application: 'No cooling water' },
        { type: 'Spiral', area: '0.5-200 m²', application: 'Viscous fluids' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Thermometer className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Heat Transfer Area Calculator</h2>
                    <p className="text-gray-600">Calculate required heat exchanger surface area</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                            Heat Transfer Rate (Q)
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={heatTransferRate}
                                onChange={(e) => setHeatTransferRate(e.target.value)}
                                className="flex-1 px-4 py-3 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder={unitSystem === 'si' ? "e.g., 100000 (W)" : "e.g., 341214 (BTU/h)"}
                            />
                            <select
                                value={unitSystem}
                                onChange={(e) => setUnitSystem(e.target.value as 'si' | 'imperial')}
                                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none"
                            >
                                <option value="si">W (Watts)</option>
                                <option value="imperial">BTU/h</option>
                            </select>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Total heat to be transferred</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Temperature Difference (ΔT)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={temperatureDifference}
                                onChange={(e) => setTemperatureDifference(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder={unitSystem === 'si' ? "e.g., 50 (°C)" : "e.g., 90 (°F)"}
                            />
                            <p className="text-xs text-gray-600 mt-1">LMTD or simple ΔT</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Overall U (W/m²K)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={overallCoefficient}
                                onChange={(e) => setOverallCoefficient(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 500"
                            />
                            <p className="text-xs text-gray-600 mt-1">Heat transfer coefficient</p>
                        </div>
                    </div>

                    {/* Heat Transfer Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Heat Exchanger Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full h-64">
                                {/* Hot fluid flow */}
                                <div className="absolute left-0 top-1/4 w-1/2">
                                    <div className="h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-r-lg opacity-70"></div>
                                    <div className="text-xs text-red-600 mt-1 text-center">Hot In</div>
                                </div>

                                {/* Cold fluid flow */}
                                <div className="absolute right-0 top-3/4 w-1/2">
                                    <div className="h-12 bg-gradient-to-l from-blue-400 to-blue-600 rounded-l-lg opacity-70"></div>
                                    <div className="text-xs text-blue-600 mt-1 text-center">Cold In</div>
                                </div>

                                {/* Heat exchanger body */}
                                <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-gradient-to-b from-gray-300 to-gray-400 rounded-xl border-4 border-gray-500">
                                    {/* Tubes */}
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-4 h-full bg-gradient-to-b from-blue-200 to-blue-300 rounded-full"
                                            style={{ left: `${(i + 1) * 10}%` }}
                                        />
                                    ))}

                                    {/* Heat flux visualization */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            {result && (
                                                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
                                            )}
                                            <div className="relative bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-600">Heat Transfer</div>
                                                    <div className="font-bold text-green-600">
                                                        {heatTransferRate ? `${parseFloat(heatTransferRate).toLocaleString()} W` : 'Q'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Temperature indicators */}
                                <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-xs font-bold text-red-600">Tₕ</span>
                                    </div>
                                </div>
                                <div className="absolute right-1/4 top-3/4 transform translate-x-1/2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs font-bold text-blue-600">T꜀</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formula */}
                        <div className="mt-4 text-center">
                            <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                A = Q / (U × ΔT)
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateArea}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Area
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Calculation Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Required Heat Transfer Area</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {result.area.toFixed(2)} m²
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.heatExchangerType}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Interpretation</div>
                                    <p className="text-gray-600">{result.interpretation}</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="font-semibold text-blue-800 mb-1">Calculation Details</div>
                                    <p className="text-sm text-blue-700">
                                        A = {heatTransferRate} W / ({overallCoefficient} W/m²K × {temperatureDifference} K) = {result.area.toFixed(2)} m²
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* U-Value Reference Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Zap className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Typical U-Values</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-red-50 to-orange-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Fluid Combination</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">U Value (W/m²K)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Range</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typicalUValues.map((value, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{value.fluids}</td>
                                            <td className="py-3 px-4">{value.value}</td>
                                            <td className="py-3 px-4 text-gray-600">{value.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Heat Exchanger Types */}
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Heat Exchanger Selection Guide</h3>
                        <div className="space-y-3">
                            {heatExchangerTypes.map((type, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{type.type}</div>
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                            {type.area}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">{type.application}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Reynolds Number Calculator
function ReynoldsNumberCalculator() {
    const [density, setDensity] = useState<string>('1000');
    const [velocity, setVelocity] = useState<string>('');
    const [diameter, setDiameter] = useState<string>('');
    const [viscosity, setViscosity] = useState<string>('0.001');
    const [fluidType, setFluidType] = useState<string>('water');
    const [result, setResult] = useState<{
        re: number;
        flowRegime: string;
        description: string;
        color: string;
        fFactor: number;
    } | null>(null);

    const calculateReynolds = () => {
        const ρ = parseFloat(density);
        const v = parseFloat(velocity);
        const D = parseFloat(diameter);
        const μ = parseFloat(viscosity);

        if (isNaN(ρ) || isNaN(v) || isNaN(D) || isNaN(μ) || ρ <= 0 || v <= 0 || D <= 0 || μ <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Re = (ρ * v * D) / μ
        const re = (ρ * v * D) / μ;

        let flowRegime = '';
        let description = '';
        let color = '';
        let fFactor = 0;

        if (re < 2000) {
            flowRegime = 'LAMINAR FLOW';
            description = 'Smooth, predictable flow with parallel streamlines';
            color = 'text-blue-600';
            fFactor = 64 / re; // Darcy friction factor for laminar flow
        } else if (re >= 2000 && re < 4000) {
            flowRegime = 'TRANSITIONAL FLOW';
            description = 'Unstable flow regime between laminar and turbulent';
            color = 'text-yellow-600';
            fFactor = 0.316 / Math.pow(re, 0.25); // Blasius approximation
        } else {
            flowRegime = 'TURBULENT FLOW';
            description = 'Chaotic flow with eddies and mixing';
            color = 'text-red-600';
            fFactor = 0.316 / Math.pow(re, 0.25); // Blasius for smooth pipe
        }

        setResult({
            re,
            flowRegime,
            description,
            color,
            fFactor
        });
    };

    const resetCalculator = () => {
        setDensity('1000');
        setVelocity('');
        setDiameter('');
        setViscosity('0.001');
        setResult(null);
    };

    const fluidProperties = [
        { fluid: 'Water (20°C)', density: '998', viscosity: '0.001002' },
        { fluid: 'Air (20°C)', density: '1.204', viscosity: '0.0000181' },
        { fluid: 'Ethanol (20°C)', density: '789', viscosity: '0.001200' },
        { fluid: 'Glycerin (20°C)', density: '1260', viscosity: '1.490' },
        { fluid: 'Oil (SAE 30)', density: '920', viscosity: '0.290' },
    ];

    const pipeSizes = [
        { nominal: '1/2"', diameter: '0.0157', flowRate: '0.1-0.5' },
        { nominal: '1"', diameter: '0.0266', flowRate: '0.3-1.5' },
        { nominal: '2"', diameter: '0.0525', flowRate: '1-5' },
        { nominal: '4"', diameter: '0.1023', flowRate: '5-20' },
        { nominal: '8"', diameter: '0.2027', flowRate: '20-100' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Wind className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Reynolds Number Calculator</h2>
                    <p className="text-gray-600">Calculate flow regime in pipes and channels</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Density (ρ) kg/m³
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={density}
                                onChange={(e) => setDensity(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 1000"
                            />
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Velocity (v) m/s
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={velocity}
                                onChange={(e) => setVelocity(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 2.5"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Diameter (D) m
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={diameter}
                                onChange={(e) => setDiameter(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 0.1"
                            />
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Viscosity (μ) Pa·s
                            </label>
                            <input
                                type="number"
                                step="0.000001"
                                min="0.000001"
                                value={viscosity}
                                onChange={(e) => setViscosity(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 0.001"
                            />
                        </div>
                    </div>

                    {/* Fluid Type Selector */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Select Common Fluid
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {fluidProperties.map((fluid, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDensity(fluid.density);
                                        setViscosity(fluid.viscosity);
                                    }}
                                    className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-blue-50 transition-colors text-center"
                                >
                                    <div className="text-xs font-semibold text-gray-800">{fluid.fluid.split(' ')[0]}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flow Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Flow Regime Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full h-48">
                                {/* Pipe */}
                                <div className="absolute top-1/2 left-0 right-0 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full transform -translate-y-1/2"></div>

                                {/* Flow arrows */}
                                <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
                                    {result ? (
                                        <div className="relative h-16 overflow-hidden">
                                            {/* Flow lines based on Reynolds number */}
                                            {Array.from({ length: result.re < 2000 ? 10 : result.re < 4000 ? 20 : 30 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`absolute h-1 rounded-full ${result.re < 2000
                                                            ? 'bg-blue-500 animate-[flowLaminar_2s_linear_infinite]'
                                                            : result.re < 4000
                                                                ? 'bg-yellow-500 animate-[flowTransitional_1s_ease-in-out_infinite]'
                                                                : 'bg-red-500 animate-[flowTurbulent_0.5s_ease-in-out_infinite]'
                                                        }`}
                                                    style={{
                                                        width: `${Math.random() * 30 + 20}%`,
                                                        top: `${(i + 1) * 5}px`,
                                                        left: '0%',
                                                        animationDelay: `${i * 0.1}s`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            Enter values to visualize flow
                                        </div>
                                    )}
                                </div>

                                {/* Velocity profile */}
                                {velocity && (
                                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow">
                                        <div className="text-xs text-gray-600">Velocity</div>
                                        <div className="font-bold text-green-600">{velocity} m/s</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Formula */}
                        <div className="mt-4 text-center">
                            <div className="text-sm font-mono bg-gray-800 text-white px-4 py-2 rounded-lg inline-block">
                                Re = (ρ × v × D) / μ
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateReynolds}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Re
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-blue-50 to-red-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Flow Analysis Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Reynolds Number</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {result.re.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.flowRegime}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Flow Characteristics</div>
                                    <p className="text-gray-600 text-sm">{result.description}</p>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="font-semibold text-blue-800 mb-1">Friction Factor (f)</div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {result.fFactor.toFixed(4)}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="font-semibold text-gray-700 mb-1">Calculation Details</div>
                                    <p className="text-sm text-gray-600">
                                        Re = ({density} × {velocity} × {diameter}) / {viscosity} = {result.re.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flow Regime Reference */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Activity className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Flow Regime Characteristics</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-blue-800">Laminar Flow (Re {'<'} 2000)</span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Parabolic Profile</span>
                                </div>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Smooth, parallel streamlines</li>
                                    <li>• Predictable flow patterns</li>
                                    <li>• Low pressure drop</li>
                                    <li>• Friction factor: f = 64/Re</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-yellow-800">Transitional (2000 ≤ Re {'<'}  4000)</span>
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Unstable</span>
                                </div>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Intermittent turbulence</li>
                                    <li>• Flow can flip between regimes</li>
                                    <li>• Difficult to predict</li>
                                    <li>• Avoid in design when possible</li>
                                </ul>
                            </div>

                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-red-800">Turbulent Flow (Re ≥ 4000)</span>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">High Mixing</span>
                                </div>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• Chaotic, eddying motion</li>
                                    <li>• Excellent mixing properties</li>
                                    <li>• Higher pressure drop</li>
                                    <li>• Friction factor: f = 0.316/Re^{0.25} (Blasius)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Common Pipe Sizes */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Common Pipe Sizes & Flow Rates</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white bg-opacity-50">
                                        <th className="py-2 px-3 text-left font-semibold text-gray-700">Nominal Size</th>
                                        <th className="py-2 px-3 text-left font-semibold text-gray-700">Diameter (m)</th>
                                        <th className="py-2 px-3 text-left font-semibold text-gray-700">Typical Flow (L/s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pipeSizes.map((pipe, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white bg-opacity-30' : ''}>
                                            <td className="py-2 px-3 font-medium">{pipe.nominal}</td>
                                            <td className="py-2 px-3">{pipe.diameter}</td>
                                            <td className="py-2 px-3">{pipe.flowRate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 3. Drying Rate Calculator
function DryingRateCalculator() {
    const [initialMoisture, setInitialMoisture] = useState<string>('');
    const [finalMoisture, setFinalMoisture] = useState<string>('');
    const [dryingTime, setDryingTime] = useState<string>('');
    const [materialMass, setMaterialMass] = useState<string>('');
    const [dryingArea, setDryingArea] = useState<string>('');
    const [dryingType, setDryingType] = useState<string>('convective');
    const [result, setResult] = useState<{
        dryingRate: number;
        avgRate: number;
        moistureRemoved: number;
        dryingPhase: string;
        color: string;
    } | null>(null);

    const calculateDryingRate = () => {
        const X1 = parseFloat(initialMoisture);
        const X2 = parseFloat(finalMoisture);
        const t = parseFloat(dryingTime);
        const M = parseFloat(materialMass);
        const A = parseFloat(dryingArea);

        if (isNaN(X1) || isNaN(X2) || isNaN(t) || isNaN(M) || isNaN(A) || t <= 0 || M <= 0 || A <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Moisture removed (kg water)
        const moistureRemoved = M * (X1 - X2);

        // Drying rate (kg water/m²·h)
        const dryingRate = (moistureRemoved / t) / A;

        // Average drying rate
        const avgRate = moistureRemoved / t;

        let dryingPhase = '';
        let color = '';

        if (X2 > 0.5) {
            dryingPhase = 'CONSTANT RATE PERIOD';
            color = 'text-blue-600';
        } else if (X2 > 0.1) {
            dryingPhase = 'FIRST FALLING RATE PERIOD';
            color = 'text-yellow-600';
        } else {
            dryingPhase = 'SECOND FALLING RATE PERIOD';
            color = 'text-red-600';
        }

        setResult({
            dryingRate,
            avgRate,
            moistureRemoved,
            dryingPhase,
            color
        });
    };

    const resetCalculator = () => {
        setInitialMoisture('');
        setFinalMoisture('');
        setDryingTime('');
        setMaterialMass('');
        setDryingArea('');
        setResult(null);
    };

    const materialProperties = [
        { material: 'Food Grains', initial: '0.20', final: '0.14', rate: '0.5-2' },
        { material: 'Ceramics', initial: '0.25', final: '0.02', rate: '0.1-1' },
        { material: 'Pharmaceuticals', initial: '0.15', final: '0.05', rate: '0.2-1.5' },
        { material: 'Wood', initial: '0.40', final: '0.12', rate: '0.05-0.3' },
        { material: 'Textiles', initial: '0.30', final: '0.08', rate: '1-5' },
    ];

    const dryingMethods = [
        { method: 'Convective Hot Air', rate: '0.5-5', energy: 'High' },
        { method: 'Spray Drying', rate: '10-100', energy: 'Very High' },
        { method: 'Freeze Drying', rate: '0.01-0.1', energy: 'Extreme' },
        { method: 'Vacuum Drying', rate: '0.1-2', energy: 'Medium' },
        { method: 'Microwave Drying', rate: '1-10', energy: 'Medium' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Droplets className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Drying Rate Calculator</h2>
                    <p className="text-gray-600">Calculate drying rates and moisture removal</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Initial Moisture (kg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={initialMoisture}
                                onChange={(e) => setInitialMoisture(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 0.25"
                            />
                            <p className="text-xs text-gray-600 mt-1">kg water/kg dry solid</p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Final Moisture (kg/kg)
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={finalMoisture}
                                onChange={(e) => setFinalMoisture(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 0.05"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Drying Time (h)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={dryingTime}
                                onChange={(e) => setDryingTime(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 8"
                            />
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Material Mass (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={materialMass}
                                onChange={(e) => setMaterialMass(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 100"
                            />
                        </div>

                        <div className="bg-amber-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Drying Area (m²)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={dryingArea}
                                onChange={(e) => setDryingArea(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-400 focus:outline-none"
                                placeholder="e.g., 10"
                            />
                        </div>
                    </div>

                    {/* Drying Type Selector */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Drying Method
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {dryingMethods.map((method, index) => (
                                <button
                                    key={index}
                                    onClick={() => setDryingType(method.method.toLowerCase().replace(' ', '-'))}
                                    className={`border rounded-lg p-2 transition-colors text-center ${dryingType === method.method.toLowerCase().replace(' ', '-')
                                            ? 'bg-green-100 border-green-400'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="text-xs font-semibold text-gray-800">{method.method.split(' ')[0]}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Drying Curve Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Drying Curve Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full h-64">
                                {/* Axes */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-400"></div>
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-400"></div>

                                {/* Drying curve */}
                                {initialMoisture && finalMoisture && dryingTime && (
                                    <>
                                        {/* Constant rate period */}
                                        <div
                                            className="absolute h-1 bg-blue-500 rounded-full"
                                            style={{
                                                width: '30%',
                                                left: '0%',
                                                top: `${(1 - parseFloat(initialMoisture) * 3) * 100}%`,
                                            }}
                                        />

                                        {/* First falling rate period */}
                                        <div
                                            className="absolute h-1 bg-yellow-500 rounded-full"
                                            style={{
                                                width: '40%',
                                                left: '30%',
                                                top: `${(1 - (parseFloat(initialMoisture) * 2 + parseFloat(finalMoisture)) * 1.5) * 100}%`,
                                                transform: 'rotate(-15deg)',
                                            }}
                                        />

                                        {/* Second falling rate period */}
                                        <div
                                            className="absolute h-1 bg-red-500 rounded-full"
                                            style={{
                                                width: '30%',
                                                left: '70%',
                                                top: `${(1 - parseFloat(finalMoisture) * 3) * 100}%`,
                                                transform: 'rotate(-45deg)',
                                            }}
                                        />

                                        {/* Moisture points */}
                                        <div
                                            className="absolute w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                left: '0%',
                                                top: `${(1 - parseFloat(initialMoisture) * 3) * 100}%`,
                                            }}
                                        />
                                        <div
                                            className="absolute w-4 h-4 bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                left: `${(parseFloat(dryingTime) / 10) * 100}%`,
                                                top: `${(1 - parseFloat(finalMoisture) * 3) * 100}%`,
                                            }}
                                        />

                                        {/* Labels */}
                                        <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0 h</div>
                                        <div className="absolute -bottom-6 right-0 text-xs text-gray-600">{dryingTime} h</div>
                                        <div className="absolute -top-6 left-0 text-xs text-gray-600">Moisture Content</div>
                                    </>
                                )}

                                {!initialMoisture && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                        Enter moisture values to see drying curve
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Drying phases legend */}
                        <div className="mt-4 flex justify-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                                <span className="text-xs">Constant Rate</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                                <span className="text-xs">Falling Rate I</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                <span className="text-xs">Falling Rate II</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateDryingRate}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Calculate Drying Rate
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Drying Analysis Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Drying Rate per Area</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {result.dryingRate.toFixed(3)} kg/m²·h
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.dryingPhase}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm font-semibold text-gray-600">Total Moisture Removed</div>
                                    <div className="text-xl font-bold text-blue-600 mt-1">
                                        {result.moistureRemoved.toFixed(2)} kg
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm font-semibold text-gray-600">Average Drying Rate</div>
                                    <div className="text-xl font-bold text-green-600 mt-1">
                                        {result.avgRate.toFixed(2)} kg/h
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="font-semibold text-gray-700 mb-1">Calculation Details</div>
                                <p className="text-sm text-gray-600">
                                    Moisture removed: {materialMass} kg × ({initialMoisture} - {finalMoisture}) = {result.moistureRemoved.toFixed(2)} kg water
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Drying rate: ({result.moistureRemoved.toFixed(2)} kg ÷ {dryingTime} h) ÷ {dryingArea} m² = {result.dryingRate.toFixed(3)} kg/m²·h
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Material Reference Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Filter className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Typical Material Drying Data</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-50 to-blue-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Material</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Initial (kg/kg)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Final (kg/kg)</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Rate (kg/m²h)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materialProperties.map((material, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{material.material}</td>
                                            <td className="py-3 px-4">{material.initial}</td>
                                            <td className="py-3 px-4">{material.final}</td>
                                            <td className="py-3 px-4">{material.rate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Drying Methods Comparison */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Drying Methods Comparison</h3>
                        <div className="space-y-3">
                            {dryingMethods.map((method, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{method.method}</div>
                                        <div className="flex space-x-2">
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                                                Rate: {method.rate}
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${method.energy === 'High' ? 'bg-red-100 text-red-800' :
                                                    method.energy === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-purple-100 text-purple-800'
                                                }`}>
                                                Energy: {method.energy}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 4. Mixing Time Estimator
function MixingTimeEstimator() {
    const [tankDiameter, setTankDiameter] = useState<string>('');
    const [impellerDiameter, setImpellerDiameter] = useState<string>('');
    const [impellerSpeed, setImpellerSpeed] = useState<string>('');
    const [fluidViscosity, setFluidViscosity] = useState<string>('0.001');
    const [fluidDensity, setFluidDensity] = useState<string>('1000');
    const [mixingType, setMixingType] = useState<string>('blending');
    const [result, setResult] = useState<{
        mixingTime: number;
        powerNumber: number;
        reynoldsNumber: number;
        flowRegime: string;
        color: string;
    } | null>(null);

    const calculateMixingTime = () => {
        const D = parseFloat(tankDiameter);
        const d = parseFloat(impellerDiameter);
        const N = parseFloat(impellerSpeed);
        const μ = parseFloat(fluidViscosity);
        const ρ = parseFloat(fluidDensity);

        if (isNaN(D) || isNaN(d) || isNaN(N) || isNaN(μ) || isNaN(ρ) || D <= 0 || d <= 0 || N <= 0 || μ <= 0 || ρ <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        // Reynolds number for mixing
        const Re = (ρ * N * Math.pow(d, 2)) / μ;

        // Determine power number based on Reynolds number and impeller type
        let Np = 0;
        let flowRegime = '';

        if (Re < 10) {
            Np = 70 / Re; // Laminar flow
            flowRegime = 'LAMINAR';
        } else if (Re < 10000) {
            Np = 70 / Math.pow(Re, 0.5); // Transitional
            flowRegime = 'TRANSITIONAL';
        } else {
            Np = 5.0; // Turbulent (typical for standard impellers)
            flowRegime = 'TURBULENT';
        }

        // Mixing time estimation (simplified correlation)
        // t_mix = K * (D/d)^2 * (1/N) * f(Re)
        let K = 0;
        switch (mixingType) {
            case 'blending':
                K = 4.0;
                break;
            case 'suspension':
                K = 8.0;
                break;
            case 'reaction':
                K = 6.0;
                break;
            case 'dispersion':
                K = 10.0;
                break;
            default:
                K = 5.0;
        }

        const mixingTime = K * Math.pow(D / d, 2) * (1 / N) * 60; // Convert to seconds

        let color = '';
        if (mixingTime < 60) {
            color = 'text-green-600';
        } else if (mixingTime < 300) {
            color = 'text-blue-600';
        } else if (mixingTime < 600) {
            color = 'text-yellow-600';
        } else {
            color = 'text-red-600';
        }

        setResult({
            mixingTime,
            powerNumber: Np,
            reynoldsNumber: Re,
            flowRegime,
            color
        });
    };

    const resetCalculator = () => {
        setTankDiameter('');
        setImpellerDiameter('');
        setImpellerSpeed('');
        setFluidViscosity('0.001');
        setFluidDensity('1000');
        setResult(null);
    };

    const impellerTypes = [
        { type: 'Rushton Turbine', Np: '5.0', flow: 'Radial', application: 'Gas dispersion' },
        { type: 'Pitched Blade', Np: '1.5', flow: 'Axial', application: 'Blending' },
        { type: 'Propeller', Np: '0.3', flow: 'Axial', application: 'Low power blending' },
        { type: 'Anchor', Np: '0.3', flow: 'Tangential', application: 'High viscosity' },
        { type: 'Helical Ribbon', Np: '0.5', flow: 'Axial/Tangential', application: 'Very high viscosity' },
    ];

    const mixingApplications = [
        { application: 'Blending Low Viscosity', time: '30-120 s', power: 'Low' },
        { application: 'Solid Suspension', time: '60-300 s', power: 'Medium' },
        { application: 'Gas Dispersion', time: '30-180 s', power: 'High' },
        { application: 'Liquid-Liquid Dispersion', time: '60-600 s', power: 'Medium-High' },
        { application: 'High Viscosity Blending', time: '300-1800 s', power: 'Medium' },
    ];

    return (
        <div>
            <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-green-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mixing Time Estimator</h2>
                    <p className="text-gray-600">Estimate mixing times for agitated vessels</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Tank Diameter (m)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={tankDiameter}
                                onChange={(e) => setTankDiameter(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                placeholder="e.g., 1.5"
                            />
                        </div>

                        <div className="bg-green-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Impeller Diameter (m)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={impellerDiameter}
                                onChange={(e) => setImpellerDiameter(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-green-300 rounded-lg focus:border-green-400 focus:outline-none"
                                placeholder="e.g., 0.5"
                            />
                            <p className="text-xs text-gray-600 mt-1">Typically D/3</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Impeller Speed (rps)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={impellerSpeed}
                                onChange={(e) => setImpellerSpeed(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-purple-300 rounded-lg focus:border-purple-400 focus:outline-none"
                                placeholder="e.g., 4"
                            />
                            <p className="text-xs text-gray-600 mt-1">Revolutions per second</p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Fluid Viscosity (Pa·s)
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                value={fluidViscosity}
                                onChange={(e) => setFluidViscosity(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-red-300 rounded-lg focus:border-red-400 focus:outline-none"
                                placeholder="e.g., 0.001"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-amber-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Fluid Density (kg/m³)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="1"
                                value={fluidDensity}
                                onChange={(e) => setFluidDensity(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-400 focus:outline-none"
                                placeholder="e.g., 1000"
                            />
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Mixing Objective
                            </label>
                            <select
                                value={mixingType}
                                onChange={(e) => setMixingType(e.target.value)}
                                className="w-full px-3 py-2 text-lg border-2 border-indigo-300 rounded-lg focus:border-indigo-400 focus:outline-none"
                            >
                                <option value="blending">Blending</option>
                                <option value="suspension">Solid Suspension</option>
                                <option value="reaction">Chemical Reaction</option>
                                <option value="dispersion">Dispersion</option>
                            </select>
                        </div>
                    </div>

                    {/* Mixing Visualization */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 text-center">Mixing Vessel Visualization</h3>
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full h-64">
                                {/* Tank */}
                                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-4 border-gray-400 rounded-3xl">
                                    {/* Fluid level */}
                                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-blue-300 to-blue-500 rounded-b-3xl">
                                        {/* Mixing patterns */}
                                        {result && (
                                            <>
                                                {/* Flow patterns */}
                                                {Array.from({ length: result.flowRegime === 'LAMINAR' ? 5 : result.flowRegime === 'TRANSITIONAL' ? 10 : 20 }).map((_, i) => {
                                                    const size = Math.random() * 20 + 10;
                                                    const x = Math.random() * 80 + 10;
                                                    const y = Math.random() * 60 + 20;
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`absolute rounded-full ${result.flowRegime === 'LAMINAR' ? 'bg-blue-400 opacity-30' :
                                                                    result.flowRegime === 'TRANSITIONAL' ? 'bg-green-400 opacity-40' :
                                                                        'bg-red-400 opacity-50'
                                                                }`}
                                                            style={{
                                                                width: `${size}px`,
                                                                height: `${size}px`,
                                                                left: `${x}%`,
                                                                top: `${y}%`,
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>

                                    {/* Impeller */}
                                    <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2">
                                        <div className="relative">
                                            {/* Shaft */}
                                            <div className="absolute left-1/2 bottom-0 w-2 h-24 bg-gray-600 transform -translate-x-1/2"></div>
                                            {/* Impeller blades */}
                                            {[0, 120, 240].map((rotation, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-16 h-4 bg-gray-700 rounded-lg"
                                                    style={{
                                                        left: '50%',
                                                        bottom: '24px',
                                                        transform: `translateX(-50%) rotate(${rotation + (result ? parseFloat(impellerSpeed) * 360 * 0.1 : 0)}deg)`,
                                                        transformOrigin: 'center 2px',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Speed indicator */}
                                {impellerSpeed && (
                                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow">
                                        <div className="text-xs text-gray-600">Speed</div>
                                        <div className="font-bold text-green-600">{impellerSpeed} rps</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Flow regime indicator */}
                        <div className="mt-4 flex justify-center">
                            {result && (
                                <div className={`px-4 py-2 rounded-full font-bold ${result.flowRegime === 'LAMINAR' ? 'bg-blue-100 text-blue-800' :
                                        result.flowRegime === 'TRANSITIONAL' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {result.flowRegime} FLOW
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={calculateMixingTime}
                            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Estimate Mixing Time
                        </button>
                        <button
                            onClick={resetCalculator}
                            className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results and Reference Section */}
                <div className="space-y-6">
                    {/* Results Card */}
                    {result && (
                        <div className="bg-gradient-to-br from-green-50 to-purple-50 border-2 border-green-400 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Mixing Analysis Results</h3>

                            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Estimated Mixing Time</div>
                                <div className="text-4xl font-bold text-green-400 mb-2">
                                    {result.mixingTime.toFixed(0)} seconds
                                </div>
                                <div className={`text-lg font-bold ${result.color}`}>
                                    {result.mixingTime < 60 ? 'Fast Mixing' : result.mixingTime < 300 ? 'Moderate' : 'Slow Mixing'}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-xs font-semibold text-gray-600">Power Number</div>
                                    <div className="text-lg font-bold text-blue-600 mt-1">
                                        {result.powerNumber.toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-xs font-semibold text-gray-600">Re Number</div>
                                    <div className="text-lg font-bold text-green-600 mt-1">
                                        {result.reynoldsNumber.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="text-xs font-semibold text-gray-600">D/d Ratio</div>
                                    <div className="text-lg font-bold text-purple-600 mt-1">
                                        {(parseFloat(tankDiameter) / parseFloat(impellerDiameter)).toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="font-semibold text-gray-700 mb-1">Mixing Parameters</div>
                                <p className="text-sm text-gray-600">
                                    Tank: Ø{tankDiameter}m | Impeller: Ø{impellerDiameter}m @ {impellerSpeed} rps
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Fluid: ρ={fluidDensity} kg/m³ | μ={fluidViscosity} Pa·s
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Impeller Types Reference */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                            <Gauge className="w-5 h-5 text-green-400 mr-2" />
                            <h3 className="text-lg font-bold text-gray-800">Impeller Types & Characteristics</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Impeller Type</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Nₚ</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Flow Pattern</th>
                                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Typical Application</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {impellerTypes.map((impeller, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100 bg-gray-50'}>
                                            <td className="py-3 px-4 font-medium">{impeller.type}</td>
                                            <td className="py-3 px-4">{impeller.Np}</td>
                                            <td className="py-3 px-4">{impeller.flow}</td>
                                            <td className="py-3 px-4 text-gray-600">{impeller.application}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mixing Applications Guide */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Mixing Applications Guide</h3>
                        <div className="space-y-3">
                            {mixingApplications.map((app, index) => (
                                <div key={index} className="bg-white rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold text-gray-800">{app.application}</div>
                                        <div className="flex space-x-2">
                                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                                                {app.time}
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${app.power === 'Low' ? 'bg-blue-100 text-blue-800' :
                                                    app.power === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                Power: {app.power}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center text-yellow-800">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="font-semibold">Design Note</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">
                                Actual mixing times may vary based on baffle configuration, fluid properties, and specific impeller design.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add CSS animations for flow visualization
const styles = `
@keyframes flowLaminar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes flowTransitional {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
}

@keyframes flowTurbulent {
  0% { transform: translateX(-100%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(10deg); }
  50% { transform: translateX(0%) rotate(0deg); }
  75% { transform: translateX(50%) rotate(-10deg); }
  100% { transform: translateX(100%) rotate(0deg); }
}
`;

// Add the styles to the document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}