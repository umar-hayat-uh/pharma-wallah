"use client";
import { useState } from 'react';
import { Microscope, Ruler, Beaker, Clock, AlertCircle, Thermometer } from 'lucide-react';
import ZoneOfInhibitionCalculator from './ZoneOfInhibitionCalculator';
import CFUCalculator from './CFUCalculator';
import SterilizationCalculator from './SterilizationCalculator';

export default function MicrobiologyCalculators() {
    const [activeTab, setActiveTab] = useState<'zone' | 'cfu' | 'sterilization'>('zone');

    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Microscope className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Microbiology Laboratory Calculators</h1>
                            <p className="text-gray-600 text-lg mt-2">Professional tools for microbiological analysis and quality control</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center mt-6">
                        <button
                            onClick={() => setActiveTab('zone')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'zone'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Ruler className="w-5 h-5 mr-2" />
                            Zone of Inhibition
                        </button>
                        <button
                            onClick={() => setActiveTab('cfu')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'cfu'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Beaker className="w-5 h-5 mr-2" />
                            CFU Calculator
                        </button>
                        <button
                            onClick={() => setActiveTab('sterilization')}
                            className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === 'sterilization'
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Sterilization Time
                        </button>
                    </div>
                </div>

                {/* Calculator Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {activeTab === 'zone' && <ZoneOfInhibitionCalculator />}
                    {activeTab === 'cfu' && <CFUCalculator />}
                    {activeTab === 'sterilization' && <SterilizationCalculator />}
                </div>

                {/* Quick Reference Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center mb-6">
                        <AlertCircle className="w-8 h-8 text-green-400 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Microbiology Quick Reference Guide</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-green-50 rounded-xl p-6">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center">
                                <Ruler className="w-5 h-5 mr-2" />
                                Zone Interpretation
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span>≥20 mm</span>
                                    <span className="font-bold text-green-600">Susceptible</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span>15-19 mm</span>
                                    <span className="font-bold text-yellow-600">Intermediate</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span>≤14 mm</span>
                                    <span className="font-bold text-red-600">Resistant</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6">
                            <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                                <Beaker className="w-5 h-5 mr-2" />
                                CFU Guidelines
                            </h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Valid Count Range</div>
                                    <div className="text-2xl font-bold text-blue-600">30-300 colonies</div>
                                    <div className="text-sm text-gray-600 mt-1">Optimal for accurate counting</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Too Few Colonies</div>
                                    <div className="text-sm text-gray-600">Increase sample volume or decrease dilution</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Too Many Colonies</div>
                                    <div className="text-sm text-gray-600">Decrease sample volume or increase dilution</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-6">
                            <h4 className="font-bold text-purple-800 mb-4 flex items-center">
                                <Thermometer className="w-5 h-5 mr-2" />
                                Sterilization Standards
                            </h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Medical Sterilization</div>
                                    <div className="font-bold text-purple-600">F₀ ≥ 12 minutes</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Food Industry</div>
                                    <div className="font-bold text-purple-600">F₀ ≥ 3 minutes</div>
                                </div>
                                <div className="p-3 bg-white rounded-lg">
                                    <div className="font-semibold text-gray-700">Pasteurization</div>
                                    <div className="font-bold text-purple-600">F₀ 1-3 minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}