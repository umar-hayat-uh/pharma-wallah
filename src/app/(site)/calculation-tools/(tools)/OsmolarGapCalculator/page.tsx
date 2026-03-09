"use client";
import { useState, useEffect } from 'react';
import {
    Calculator,
    Activity,
    RefreshCw,
    AlertCircle,
    Beaker,
    FlaskConical
} from 'lucide-react';

type GlucoseUnit = 'mg/dL' | 'mmol/L';
type BUNUnit = 'mg/dL' | 'mmol/L';

export default function OsmolarGapCalculator() {
    const [sodium, setSodium] = useState<string>('140');
    const [glucose, setGlucose] = useState<string>('100');
    const [bun, setBun] = useState<string>('15');
    const [ethanol, setEthanol] = useState<string>('0');
    const [measuredOsm, setMeasuredOsm] = useState<string>('290');
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mg/dL');
    const [bunUnit, setBunUnit] = useState<BUNUnit>('mg/dL');
    const [includeEthanol, setIncludeEthanol] = useState<boolean>(false);
    const [calculatedOsm, setCalculatedOsm] = useState<number | null>(null);
    const [osmolarGap, setOsmolarGap] = useState<number | null>(null);
    const [interpretation, setInterpretation] = useState<string>('');

    const calculateOsmolarGap = () => {
        let na = parseFloat(sodium);
        let glu = parseFloat(glucose);
        let bunVal = parseFloat(bun);
        let etoh = parseFloat(ethanol);

        if (isNaN(na) || isNaN(glu) || isNaN(bunVal)) {
            setCalculatedOsm(null);
            setOsmolarGap(null);
            setInterpretation('');
            return;
        }

        // Convert glucose and BUN to mg/dL if needed
        if (glucoseUnit === 'mmol/L') {
            glu = glu * 18;
        }
        if (bunUnit === 'mmol/L') {
            bunVal = bunVal * 2.8; // 1 mmol/L = 2.8 mg/dL (BUN)
        }

        // Calculated osmolarity: 2*Na + glucose/18 + BUN/2.8
        let calcOsm = 2 * na + (glu / 18) + (bunVal / 2.8);
        if (includeEthanol && !isNaN(etoh)) {
            // Ethanol in mg/dL, divided by 4.6
            calcOsm += etoh / 4.6;
        }
        setCalculatedOsm(calcOsm);

        const measured = parseFloat(measuredOsm);
        if (!isNaN(measured)) {
            const gap = measured - calcOsm;
            setOsmolarGap(gap);

            if (gap > 10) setInterpretation('Elevated osmolar gap – possible toxic alcohol ingestion');
            else if (gap < -10) setInterpretation('Low osmolar gap (check measured value)');
            else setInterpretation('Normal osmolar gap');
        } else {
            setOsmolarGap(null);
            setInterpretation('');
        }
    };

    const resetCalculator = () => {
        setSodium('140');
        setGlucose('100');
        setBun('15');
        setEthanol('0');
        setMeasuredOsm('290');
        setGlucoseUnit('mg/dL');
        setBunUnit('mg/dL');
        setIncludeEthanol(false);
        setCalculatedOsm(null);
        setOsmolarGap(null);
        setInterpretation('');
    };

    const samplePatients = [
        { name: 'Normal', na: '140', glu: '100', bun: '15', measured: '290' },
        { name: 'Ethanol ingestion', na: '140', glu: '100', bun: '15', etoh: '150', measured: '320' },
        { name: 'Methanol poisoning', na: '138', glu: '95', bun: '12', measured: '340' },
        { name: 'Renal failure', na: '135', glu: '110', bun: '80', measured: '315' },
        { name: 'DKA', na: '128', glu: '450', bun: '25', measured: '310' },
    ];

    const loadSample = (index: number) => {
        const patient = samplePatients[index];
        setSodium(patient.na);
        setGlucose(patient.glu);
        setBun(patient.bun);
        setEthanol(patient.etoh || '0');
        setMeasuredOsm(patient.measured);
        setIncludeEthanol(!!patient.etoh);
    };

    useEffect(() => {
        calculateOsmolarGap();
    }, [sodium, glucose, bun, ethanol, measuredOsm, glucoseUnit, bunUnit, includeEthanol]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white/20 p-3 rounded-xl mr-4">
                                <FlaskConical className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Osmolar Gap Calculator</h1>
                                <p className="text-red-100 mt-2">Detect unmeasured osmoles (toxic alcohols)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Beaker className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">Toxicology Screening</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Calculator */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                                Input Parameters
                            </h2>

                            <div className="space-y-6">
                                {/* Units */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Units</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Glucose</label>
                                            <select
                                                value={glucoseUnit}
                                                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                            >
                                                <option value="mg/dL">mg/dL</option>
                                                <option value="mmol/L">mmol/L</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">BUN</label>
                                            <select
                                                value={bunUnit}
                                                onChange={(e) => setBunUnit(e.target.value as BUNUnit)}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500"
                                            >
                                                <option value="mg/dL">mg/dL</option>
                                                <option value="mmol/L">mmol/L</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Sodium (mEq/L)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={sodium}
                                                onChange={(e) => setSodium(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500"
                                                placeholder="e.g., 140"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Glucose
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={glucose}
                                                onChange={(e) => setGlucose(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                BUN
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={bun}
                                                onChange={(e) => setBun(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500"
                                                placeholder="e.g., 15"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Measured Osmolality (mOsm/kg)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={measuredOsm}
                                                onChange={(e) => setMeasuredOsm(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500"
                                                placeholder="e.g., 290"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ethanol */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={includeEthanol}
                                            onChange={(e) => setIncludeEthanol(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <span className="font-semibold text-gray-700">Include Ethanol</span>
                                    </label>
                                    {includeEthanol && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Ethanol (mg/dL)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={ethanol}
                                                onChange={(e) => setEthanol(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-lg focus:border-orange-500"
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Sample Patients */}
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-800 mb-4">Sample Cases</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {samplePatients.map((patient, index) => (
                                            <button
                                                key={index}
                                                onClick={() => loadSample(index)}
                                                className="bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 rounded-lg p-3 text-center transition-all hover:shadow-md"
                                            >
                                                <div className="font-semibold text-orange-700">{patient.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Na: {patient.na}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={calculateOsmolarGap}
                                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-400 hover:from-orange-700 hover:to-red-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Calculate
                                    </button>
                                    <button
                                        onClick={resetCalculator}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-orange-600 to-red-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Activity className="w-7 h-7 mr-3" />
                                Results
                            </h2>

                            <div className="space-y-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-orange-100 mb-1">Calculated Osmolality</div>
                                    {calculatedOsm !== null ? (
                                        <div className="text-3xl font-bold">{calculatedOsm.toFixed(1)} mOsm/kg</div>
                                    ) : (
                                        <div className="text-xl font-bold text-orange-100">Enter Values</div>
                                    )}
                                </div>

                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                                    <div className="text-sm font-semibold text-orange-100 mb-1">Osmolar Gap</div>
                                    {osmolarGap !== null ? (
                                        <>
                                            <div className="text-5xl font-bold mb-2">
                                                {osmolarGap.toFixed(1)}
                                            </div>
                                            <div className="text-xl">
                                                mOsm/kg
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-orange-100">Enter Measured</div>
                                    )}
                                </div>
                            </div>

                            {interpretation && (
                                <div className="mt-4 bg-white/10 rounded-lg p-4 text-center">
                                    <div className="text-sm font-semibold mb-1">Interpretation</div>
                                    <div className="text-lg font-bold">{interpretation}</div>
                                </div>
                            )}
                        </div>

                        {/* Formula Reference */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                                Formula
                            </h3>
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-gray-700">Calc Osm = 2×Na + Glucose/18 + BUN/2.8</p>
                                <p className="text-sm text-gray-700 mt-1">With ethanol: + Ethanol/4.6</p>
                                <p className="text-xs text-gray-500 mt-2">*All units in mg/dL. Glucose/18 converts to mmol/L, BUN/2.8 converts to urea nitrogen in mmol/L.</p>
                            </div>
                        </div>

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border border-orange-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Causes of Elevated Gap</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>Ethanol</li>
                                <li>Methanol</li>
                                <li>Ethylene glycol</li>
                                <li>Isopropanol</li>
                                <li>Renal failure (BUN)</li>
                                <li>Diabetic ketoacidosis (ketones)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Clinical Context</h2>
                    <p className="text-gray-600">Osmolar gap {'>'} 10 suggests presence of unmeasured osmoles. Common in toxic alcohol ingestion. Normal gap varies by lab (typically -10 to +10).</p>
                </div>
            </div>
        </section>
    );
}