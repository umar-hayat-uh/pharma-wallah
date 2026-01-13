"use client";
import { Microscope } from 'lucide-react';
import SterilizationCalculator from './SterilizationCalculator';

export default function MicrobiologyCalculators() {
    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                 {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Microscope className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Sterilization Calculator</h1>
                            <p className="text-gray-600 text-lg mt-2">This tool calculates the equivalent sterilization time at 121.1°C (F0 value), a fundamental technique for validating moist heat sterilization processes in pharmaceutical manufacturing and hospital settings.</p>
                        </div>
                    </div>
                </div>
                {/* Calculator Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <SterilizationCalculator />
                </div>
            </div>
        </section>
    )
}