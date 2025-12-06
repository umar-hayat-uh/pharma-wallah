"use client";
import { useState, useEffect } from 'react';
import {
    Calculator,
    Syringe,
    Droplet,
    Beaker,
    Shield,
    AlertCircle,
    RefreshCw,
    FlaskConical,
    Scale,
    Percent,
    CheckCircle,
    XCircle
} from 'lucide-react';

type ConcentrationUnit = 'mg/mL' | 'mcg/mL' | 'units/mL' | 'g/mL' | 'percent';
type VolumeUnit = 'mL' | 'L' | 'mcl';

export default function SterileDoseVolumeCalculator() {
    const [desiredDose, setDesiredDose] = useState<string>('500');
    const [desiredDoseUnit, setDesiredDoseUnit] = useState<string>('mg');
    const [concentration, setConcentration] = useState<string>('250');
    const [concentrationUnit, setConcentrationUnit] = useState<ConcentrationUnit>('mg/mL');
    const [calculatedVolume, setCalculatedVolume] = useState<number | null>(null);
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('mL');
    const [totalVolume, setTotalVolume] = useState<string>('');
    const [finalConcentration, setFinalConcentration] = useState<number | null>(null);
    const [isValid, setIsValid] = useState<boolean>(true);
    const [validationMessage, setValidationMessage] = useState<string>('');

    // Sample sterile preparations
    const samplePreparations = [
        {
            name: 'Vancomycin IV',
            desiredDose: '1000',
            desiredDoseUnit: 'mg',
            concentration: '50',
            concentrationUnit: 'mg/mL' as ConcentrationUnit,
            totalVolume: '250',
            notes: 'Standard infusion'
        },
        {
            name: 'Insulin',
            desiredDose: '10',
            desiredDoseUnit: 'units',
            concentration: '100',
            concentrationUnit: 'units/mL' as ConcentrationUnit,
            totalVolume: '0.1',
            notes: 'Subcutaneous'
        },
        {
            name: 'Heparin',
            desiredDose: '5000',
            desiredDoseUnit: 'units',
            concentration: '1000',
            concentrationUnit: 'units/mL' as ConcentrationUnit,
            totalVolume: '5',
            notes: 'IV push'
        },
        {
            name: 'Epinephrine',
            desiredDose: '0.3',
            desiredDoseUnit: 'mg',
            concentration: '1',
            concentrationUnit: 'mg/mL' as ConcentrationUnit,
            totalVolume: '0.3',
            notes: 'Anaphylaxis'
        },
        {
            name: 'Morphine',
            desiredDose: '4',
            desiredDoseUnit: 'mg',
            concentration: '10',
            concentrationUnit: 'mg/mL' as ConcentrationUnit,
            totalVolume: '0.4',
            notes: 'IV push'
        }
    ];

    const concentrationUnits = [
        { value: 'mg/mL', label: 'mg/mL' },
        { value: 'mcg/mL', label: 'mcg/mL' },
        { value: 'units/mL', label: 'units/mL' },
        { value: 'g/mL', label: 'g/mL' },
        { value: 'percent', label: '% (w/v)' }
    ];

    const doseUnits = [
        { value: 'mg', label: 'mg' },
        { value: 'mcg', label: 'mcg' },
        { value: 'g', label: 'g' },
        { value: 'units', label: 'units' }
    ];

    const volumeUnits = [
        { value: 'mL', label: 'mL' },
        { value: 'L', label: 'L' },
        { value: 'mcl', label: 'μL' }
    ];

    const calculateVolume = () => {
        // Validate inputs
        const dose = parseFloat(desiredDose);
        const conc = parseFloat(concentration);

        if (isNaN(dose) || isNaN(conc)) {
            setIsValid(false);
            setValidationMessage('Please enter valid numbers for dose and concentration');
            return;
        }

        if (conc <= 0) {
            setIsValid(false);
            setValidationMessage('Concentration must be greater than zero');
            return;
        }

        if (dose < 0) {
            setIsValid(false);
            setValidationMessage('Dose cannot be negative');
            return;
        }

        setIsValid(true);
        setValidationMessage('');

        let volume = dose / conc;

        // Handle percent concentration (w/v) - assuming % means g/100mL
        if (concentrationUnit === 'percent') {
            const percentConc = conc; // percentage value
            const gPer100mL = percentConc;
            const gPerMl = gPer100mL / 100;
            volume = dose / (gPerMl * 1000); // Convert dose in mg to g if needed
        }

        // Convert volume based on selected unit
        let finalVolume = volume;
        if (volumeUnit === 'L') {
            finalVolume = volume / 1000;
        } else if (volumeUnit === 'mcl') {
            finalVolume = volume * 1000;
        }

        setCalculatedVolume(finalVolume);

        // Calculate final concentration if total volume is provided
        if (totalVolume) {
            const totalVol = parseFloat(totalVolume);
            if (!isNaN(totalVol) && totalVol > 0) {
                const finalConc = dose / totalVol;
                setFinalConcentration(finalConc);
            } else {
                setFinalConcentration(null);
            }
        } else {
            setFinalConcentration(null);
        }
    };

    const resetCalculator = () => {
        setDesiredDose('500');
        setDesiredDoseUnit('mg');
        setConcentration('250');
        setConcentrationUnit('mg/mL');
        setCalculatedVolume(null);
        setVolumeUnit('mL');
        setTotalVolume('');
        setFinalConcentration(null);
        setIsValid(true);
        setValidationMessage('');
    };

    const loadSample = (index: number) => {
        const prep = samplePreparations[index];
        setDesiredDose(prep.desiredDose);
        setDesiredDoseUnit(prep.desiredDoseUnit);
        setConcentration(prep.concentration);
        setConcentrationUnit(prep.concentrationUnit);
        setTotalVolume(prep.totalVolume);

        // Trigger calculation
        setTimeout(() => calculateVolume(), 100);
    };

    const getVolumeSafetyAssessment = (volume: number) => {
        if (volume < 0.1) return {
            level: 'warning',
            message: 'Very small volume - use insulin syringe for accuracy',
            icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
        };
        if (volume > 10) return {
            level: 'warning',
            message: 'Large volume - consider diluting or adjusting concentration',
            icon: <AlertCircle className="w-5 h-5 text-orange-600" />
        };
        if (volume > 50) return {
            level: 'danger',
            message: 'Excessive volume - review dose and concentration',
            icon: <XCircle className="w-5 h-5 text-red-600" />
        };
        return {
            level: 'safe',
            message: 'Volume within typical administration range',
            icon: <CheckCircle className="w-5 h-5 text-green-600" />
        };
    };

    useEffect(() => {
        calculateVolume();
    }, [desiredDose, concentration, concentrationUnit, volumeUnit, totalVolume]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6 mt-16 md:mt-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <Syringe className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Sterile Dose Volume Calculator</h1>
                                <p className="text-blue-100 mt-2">Calculate injection volumes for sterile preparations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">For Professional Use</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Input Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Volume Calculation
                            </h2>

                            <div className="space-y-6">
                                {/* Desired Dose Input */}
                                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Scale className="w-5 h-5 mr-2 text-blue-600" />
                                        Desired Dose
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Dose Value
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={desiredDose}
                                                onChange={(e) => setDesiredDose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                                                placeholder="Enter dose"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Unit
                                            </label>
                                            <select
                                                value={desiredDoseUnit}
                                                onChange={(e) => setDesiredDoseUnit(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"
                                            >
                                                {doseUnits.map((unit) => (
                                                    <option key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Concentration Input */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FlaskConical className="w-5 h-5 mr-2 text-green-600" />
                                        Concentration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Concentration Value
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={concentration}
                                                onChange={(e) => setConcentration(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                                                placeholder="Enter concentration"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Unit
                                            </label>
                                            <select
                                                value={concentrationUnit}
                                                onChange={(e) => setConcentrationUnit(e.target.value as ConcentrationUnit)}
                                                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none bg-white"
                                            >
                                                {concentrationUnits.map((unit) => (
                                                    <option key={unit.value} value={unit.value}>
                                                        {unit.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">
                                        {concentrationUnit === 'percent' ?
                                            'Note: % concentration is calculated as g/100mL (w/v)' :
                                            'Concentration = amount of drug per mL'}
                                    </p>
                                </div>

                                {/* Additional Options */}
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Beaker className="w-5 h-5 mr-2 text-gray-600" />
                                        Additional Options
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Volume Unit
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {volumeUnits.map((unit) => (
                                                    <button
                                                        key={unit.value}
                                                        onClick={() => setVolumeUnit(unit.value as VolumeUnit)}
                                                        className={`py-3 rounded-lg transition-all ${volumeUnit === unit.value ?
                                                            'bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md' :
                                                            'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {unit.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Total Dilution Volume (Optional)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={totalVolume}
                                                onChange={(e) => setTotalVolume(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                                placeholder="e.g., 250"
                                            />
                                            <p className="text-sm text-gray-500 mt-2">
                                                Enter if you want to calculate final concentration
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Validation Message */}
                                {!isValid && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                                            <span className="text-red-700 font-semibold">{validationMessage}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateVolume}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-green-400 hover:from-blue-700 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                                    >
                                        <Calculator className="w-5 h-5 mr-2" />
                                        Calculate Volume
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset Calculator
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sample Preparations */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Syringe className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Sample Sterile Preparations
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {samplePreparations.map((prep, index) => (
                                    <button
                                        key={index}
                                        onClick={() => loadSample(index)}
                                        className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-2 border-blue-100 rounded-xl p-4 text-left transition-all hover:border-blue-300 hover:shadow-md group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-blue-700 text-lg group-hover:text-blue-800">
                                                {prep.name}
                                            </h3>
                                            <Droplet className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>Dose: {prep.desiredDose} {prep.desiredDoseUnit}</div>
                                            <div>Concentration: {prep.concentration} {prep.concentrationUnit}</div>
                                            <div>Total Volume: {prep.totalVolume} mL</div>
                                            <div className="text-blue-600 font-medium mt-2">{prep.notes}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Volume Result Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Syringe className="w-7 h-7 mr-3" />
                                Calculated Volume
                            </h2>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-sm font-semibold text-blue-100 mb-2">
                                        Volume to Administer
                                    </div>
                                    {calculatedVolume !== null ? (
                                        <>
                                            <div className="text-5xl md:text-6xl font-bold mb-2">
                                                {calculatedVolume.toFixed(calculatedVolume < 0.1 ? 3 : 2)}
                                            </div>
                                            <div className="text-2xl font-semibold">
                                                {volumeUnit}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold text-blue-100">
                                            Enter Values
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Formula */}
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-sm font-semibold mb-2">Formula Used</div>
                                <div className="text-sm font-mono bg-black/20 p-2 rounded">
                                    Volume = Desired Dose ÷ Concentration
                                </div>
                            </div>
                        </div>

                        {/* Safety Assessment */}
                        {calculatedVolume !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                    Safety Assessment
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-semibold text-gray-700">Volume Check</div>
                                            <div className="text-sm text-gray-600">Based on calculated volume</div>
                                        </div>
                                        {getVolumeSafetyAssessment(calculatedVolume).icon}
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-gray-700">
                                            {getVolumeSafetyAssessment(calculatedVolume).message}
                                        </p>
                                    </div>

                                    {/* Volume Guidelines */}
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                            <span className="text-gray-600">0.1 - 10 mL: Typical range</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                            <span className="text-gray-600">&lt; 0.1 mL: Use insulin syringe</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                            <span className="text-gray-600">&gt; 50 mL: Review dose</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Final Concentration */}
                        {finalConcentration !== null && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <Percent className="w-5 h-5 mr-2 text-green-600" />
                                    Final Concentration
                                </h3>
                                <div className="space-y-4">
                                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                                        <div className="text-4xl font-bold text-green-700 mb-2">
                                            {finalConcentration.toFixed(2)}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700">
                                            mg/mL in {totalVolume} mL
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            After dilution
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        This is the concentration after adding the dose to {totalVolume} mL of diluent.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Tips */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                                Sterile Preparation Tips
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
                                    <span>Aseptic technique must be maintained</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                                    <span>Double-check calculations with another professional</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3"></div>
                                    <span>Label all preparations with drug, dose, concentration, and expiration</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-3"></div>
                                    <span>Use appropriate syringe size for volume accuracy</span>
                                </li>
                            </ul>
                        </div>

                        {/* Volume Conversion Helper */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Volume Conversion</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">1 mL</span>
                                    <span className="font-semibold text-blue-600">= 1000 μL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">1 L</span>
                                    <span className="font-semibold text-green-600">= 1000 mL</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">1 teaspoon</span>
                                    <span className="font-semibold text-purple-600">≈ 5 mL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Administration Guidelines */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Administration Guidelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                            <h3 className="font-bold text-blue-700 mb-3 flex items-center">
                                <Syringe className="w-5 h-5 mr-2" />
                                Small Volumes (&lt; 1 mL)
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Use insulin syringes for accuracy</li>
                                <li>• Minimum measurable volume: 0.01 mL</li>
                                <li>• Consider dead space in syringe</li>
                                <li>• Ideal for subcutaneous injections</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                            <h3 className="font-bold text-green-700 mb-3 flex items-center">
                                <Beaker className="w-5 h-5 mr-2" />
                                Medium Volumes (1-10 mL)
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Use standard 3-10 mL syringes</li>
                                <li>• Suitable for IM injections</li>
                                <li>• Check muscle size for IM administration</li>
                                <li>• Divide large volumes between sites if needed</li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                            <h3 className="font-bold text-purple-700 mb-3 flex items-center">
                                <Droplet className="w-5 h-5 mr-2" />
                                Large Volumes (&gt; 10 mL)
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Typically for IV infusion</li>
                                <li>• Use appropriate IV bags/syringes</li>
                                <li>• Consider infusion rate and time</li>
                                <li>• Check for compatibility with diluent</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold text-yellow-700 mb-2">Important Disclaimer</p>
                            <p>
                                This calculator is for educational purposes only. All medication calculations should be
                                verified by qualified healthcare professionals. Always follow institutional protocols,
                                manufacturer guidelines, and professional standards when preparing and administering
                                sterile medications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}