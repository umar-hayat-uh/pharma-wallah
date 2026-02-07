"use client";
import { useState } from 'react';
import { Droplet, Clock, Calculator, TrendingUp, Thermometer, Activity, RefreshCw } from 'lucide-react';

export default function IVDripRateCalculator() {
    const [volume, setVolume] = useState<string>('1000');
    const [time, setTime] = useState<string>('8');
    const [timeUnit, setTimeUnit] = useState<'hours' | 'minutes'>('hours');
    const [dropFactor, setDropFactor] = useState<string>('20');
    const [dripRate, setDripRate] = useState<number | null>(null);
    const [infusionRate, setInfusionRate] = useState<number | null>(null);

    const calculateDripRate = () => {
        const volumeValue = parseFloat(volume);
        const timeValue = parseFloat(time);
        const dropFactorValue = parseFloat(dropFactor);

        if (isNaN(volumeValue) || isNaN(timeValue) || isNaN(dropFactorValue) || 
            volumeValue <= 0 || timeValue <= 0 || dropFactorValue <= 0) {
            alert('Please enter valid positive numbers for all fields');
            return;
        }

        // Convert time to minutes if in hours
        const timeInMinutes = timeUnit === 'hours' ? timeValue * 60 : timeValue;
        
        // Calculate drip rate: (Volume × Drop Factor) / Time (minutes)
        const calculatedDripRate = (volumeValue * dropFactorValue) / timeInMinutes;
        setDripRate(Math.round(calculatedDripRate * 10) / 10); // Round to 1 decimal
        
        // Calculate infusion rate: Volume / Time (hours)
        const timeInHours = timeUnit === 'hours' ? timeValue : timeValue / 60;
        const calculatedInfusionRate = volumeValue / timeInHours;
        setInfusionRate(Math.round(calculatedInfusionRate * 10) / 10);
    };

    const resetCalculator = () => {
        setVolume('1000');
        setTime('8');
        setTimeUnit('hours');
        setDropFactor('20');
        setDripRate(null);
        setInfusionRate(null);
    };

    const loadPreset = (type: 'standard' | 'pediatric' | 'emergency') => {
        switch (type) {
            case 'standard':
                setVolume('1000');
                setTime('8');
                setDropFactor('20');
                break;
            case 'pediatric':
                setVolume('100');
                setTime('2');
                setDropFactor('60');
                break;
            case 'emergency':
                setVolume('500');
                setTime('0.5'); // 30 minutes
                setDropFactor('15');
                break;
        }
    };

    const commonDropFactors = [
        { value: '10', label: '10 gtt/mL (Blood)' },
        { value: '15', label: '15 gtt/mL (Standard)' },
        { value: '20', label: '20 gtt/mL (Standard)' },
        { value: '60', label: '60 gtt/mL (Microdrip)' },
    ];

    const commonInfusions = [
        { name: 'Normal Saline', volume: '1000', time: '8', factor: '20' },
        { name: 'D5W', volume: '1000', time: '12', factor: '20' },
        { name: 'Antibiotic', volume: '100', time: '0.5', factor: '15' },
        { name: 'Maintenance IVF', volume: '1000', time: '24', factor: '20' },
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Droplet className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">IV Drip Rate Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate IV drip rates (gtt/min) and infusion rates (mL/hr)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">IV Therapy</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            {/* Formula Display */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <div className="flex items-center mb-2">
                                    <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="text-sm font-semibold text-blue-800">IV Drip Rate Formula</h3>
                                </div>
                                <p className="text-center text-blue-900 font-mono text-2xl font-bold">
                                    Drip Rate = (Volume × Drop Factor) ÷ Time
                                </p>
                                <p className="text-center text-sm text-blue-700 mt-2">
                                    Units: gtt/min = (mL × gtt/mL) ÷ minutes
                                </p>
                            </div>

                            {/* Input Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Volume Input */}
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Volume (mL)
                                        </label>
                                        <input
                                            type="number"
                                            step="1"
                                            min="1"
                                            value={volume}
                                            onChange={(e) => setVolume(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder="e.g., 1000"
                                        />
                                        <p className="text-sm text-gray-600 mt-2">Total IV fluid volume</p>
                                    </div>

                                    {/* Time Input */}
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-lg font-semibold text-gray-800">
                                                Time
                                            </label>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setTimeUnit('hours')}
                                                    className={`px-3 py-1 text-sm rounded-lg ${timeUnit === 'hours' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-200 text-gray-700'}`}
                                                >
                                                    Hours
                                                </button>
                                                <button
                                                    onClick={() => setTimeUnit('minutes')}
                                                    className={`px-3 py-1 text-sm rounded-lg ${timeUnit === 'minutes' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-200 text-gray-700'}`}
                                                >
                                                    Minutes
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                            placeholder={timeUnit === 'hours' ? 'e.g., 8' : 'e.g., 60'}
                                        />
                                        <p className="text-sm text-gray-600 mt-2">Infusion duration</p>
                                    </div>

                                    {/* Drop Factor Input */}
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                                            Drop Factor (gtt/mL)
                                        </label>
                                        <select
                                            value={dropFactor}
                                            onChange={(e) => setDropFactor(e.target.value)}
                                            className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                        >
                                            {commonDropFactors.map((factor) => (
                                                <option key={factor.value} value={factor.value}>
                                                    {factor.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-gray-600 mt-2">IV set calibration</p>
                                    </div>
                                </div>

                                {/* Common Drop Factors */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Drop Factors</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {commonDropFactors.map((factor) => (
                                            <button
                                                key={factor.value}
                                                onClick={() => setDropFactor(factor.value)}
                                                className={`p-4 rounded-lg text-center transition-all ${
                                                    dropFactor === factor.value
                                                        ? 'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md'
                                                        : 'bg-white hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="font-semibold">{factor.value} gtt/mL</div>
                                                <div className="text-sm mt-1">{factor.label.split('(')[1].replace(')', '')}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Common Infusions */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Common IV Infusions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {commonInfusions.map((infusion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setVolume(infusion.volume);
                                                    setTime(infusion.time);
                                                    setDropFactor(infusion.factor);
                                                    setTimeUnit('hours');
                                                }}
                                                className="p-4 bg-white rounded-lg text-center hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="font-semibold text-blue-700">{infusion.name}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {infusion.volume}mL over {infusion.time}h
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={calculateDripRate}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate Drip Rate
                                    </button>
                                    <button
                                        onClick={() => loadPreset('standard')}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                                    >
                                        Standard Infusion
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
                                    >
                                        <RefreshCw className="inline w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Results Section */}
                            {dripRate !== null && infusionRate !== null && (
                                <div className="mt-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-green-400 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                            IV Infusion Results
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Drip Rate Result */}
                                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-gray-600 mb-1">
                                                        Drip Rate
                                                    </div>
                                                    <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-2">
                                                        {dripRate}
                                                    </div>
                                                    <div className="text-2xl font-semibold text-gray-700">
                                                        gtt/min
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        Drops per minute
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Infusion Rate Result */}
                                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-gray-600 mb-1">
                                                        Infusion Rate
                                                    </div>
                                                    <div className="text-5xl md:text-6xl font-bold text-green-600 mb-2">
                                                        {infusionRate}
                                                    </div>
                                                    <div className="text-2xl font-semibold text-gray-700">
                                                        mL/hr
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        Milliliters per hour
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calculation Details */}
                                        <div className="bg-white rounded-xl p-6">
                                            <h4 className="font-semibold text-gray-800 mb-3">Calculation Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Formula:</span>
                                                    <span className="font-mono">({volume} × {dropFactor}) ÷ {timeUnit === 'hours' ? time + ' × 60' : time}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Time in minutes:</span>
                                                    <span className="font-semibold">{timeUnit === 'hours' ? parseFloat(time) * 60 : time} min</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total drops:</span>
                                                    <span className="font-semibold">{parseFloat(volume) * parseFloat(dropFactor)} gtt</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Infusion duration:</span>
                                                    <span className="font-semibold">
                                                        {timeUnit === 'hours' 
                                                            ? `${time} hours (${parseFloat(time) * 60} minutes)`
                                                            : `${time} minutes (${(parseFloat(time) / 60).toFixed(1)} hours)`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drip Rate Visualization */}
                                        <div className="mt-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6">
                                            <h4 className="font-semibold text-gray-800 mb-3">Drip Rate Visualization</h4>
                                            <div className="flex items-center justify-center space-x-4">
                                                {Array.from({ length: Math.min(10, Math.round(dripRate / 2)) }).map((_, i) => (
                                                    <div key={i} className="relative">
                                                        <div className="w-8 h-12 bg-gradient-to-b from-blue-400 to-green-400 rounded-t-lg"></div>
                                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 text-center mt-4">
                                                Visual representation: ~{dripRate} drops per minute
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Clinical Scenarios */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Clinical Scenarios</h3>
                            <div className="space-y-4">
                                <button
                                    onClick={() => loadPreset('standard')}
                                    className="w-full p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                                >
                                    <div className="font-semibold text-blue-700">Standard Maintenance</div>
                                    <div className="text-sm text-gray-600 mt-1">1000mL NS over 8 hours</div>
                                </button>
                                <button
                                    onClick={() => loadPreset('pediatric')}
                                    className="w-full p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                                >
                                    <div className="font-semibold text-green-700">Pediatric Fluid</div>
                                    <div className="text-sm text-gray-600 mt-1">100mL D5W over 2 hours</div>
                                </button>
                                <button
                                    onClick={() => loadPreset('emergency')}
                                    className="w-full p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition-colors"
                                >
                                    <div className="font-semibold text-red-700">Emergency Bolus</div>
                                    <div className="text-sm text-gray-600 mt-1">500mL NS over 30 minutes</div>
                                </button>
                            </div>
                        </div>

                        {/* Drop Factor Guide */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Drop Factor Guide</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-blue-700">10 gtt/mL</div>
                                        <div className="text-gray-600">Blood administration sets</div>
                                    </div>
                                    <Activity className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-blue-700">15-20 gtt/mL</div>
                                        <div className="text-gray-600">Standard macrodrip sets</div>
                                    </div>
                                    <Droplet className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-blue-700">60 gtt/mL</div>
                                        <div className="text-gray-600">Microdrip/pediatric sets</div>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Reference</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <Clock className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                                    <span><strong>Time Conversion:</strong> 1 hour = 60 minutes</span>
                                </div>
                                <div className="flex items-start">
                                    <Calculator className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                                    <span><strong>Formula:</strong> (mL × gtt/mL) ÷ minutes = gtt/min</span>
                                </div>
                                <div className="flex items-start">
                                    <Thermometer className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                                    <span><strong>Accuracy:</strong> Round to nearest whole drop</span>
                                </div>
                                <div className="flex items-start">
                                    <Droplet className="w-4 h-4 text-purple-600 mr-2 mt-0.5" />
                                    <span><strong>Verification:</strong> Always double-check calculations</span>
                                </div>
                            </div>
                        </div>

                        {/* Safety Notes */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-red-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Safety Notes</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Always verify calculations with another nurse
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Use infusion pumps when available
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Monitor IV site regularly for infiltration
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    Adjust rates based on patient response
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}