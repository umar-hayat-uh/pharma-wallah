"use client";
import { useState } from 'react';
import { Microscope, Ruler, Beaker, Clock, AlertCircle, Thermometer } from 'lucide-react';
import CFUCalculator from './CFUCalculator';

export default function MicrobiologyCalculators() {
    return (
        <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 mt-20">
            <div className="max-w-7xl mx-auto">
                 {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <Microscope className="w-12 h-12 text-green-400 mr-4" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">CFU  Calculators</h1>
                            <p className="text-gray-600 text-lg mt-2">This tool calculates Colony Forming Units (CFU) per milliliter or gram of a sample, a fundamental technique in pharmaceutical microbiology and quality control</p>
                        </div>
                    </div>
                </div>
                {/* Calculator Content */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <CFUCalculator />
                </div>
            </div>
        </section>
    )
}