"use client";

import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";

type VolumeUnit = "mL" | "L";

const presetMolarMass: Record<string, number> = {
    NaCl: 58.44,
    HCl: 36.46,
    NaOH: 40.0,
    Glucose: 180.16,
    H2SO4: 98.079,
    KCl: 74.55,
};

export default function MolarityCalculatorBox() {
    const [mass, setMass] = useState("");
    const [molarMass, setMolarMass] = useState("");
    const [moles, setMoles] = useState("");
    const [volume, setVolume] = useState("");
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("mL");
    const [calcMode, setCalcMode] = useState<"molarity" | "moles" | "volume">(
        "molarity"
    );
    const [preset, setPreset] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [formula, setFormula] = useState<string | null>(null);
    const [interpretation, setInterpretation] = useState<string | null>(null);

    const invalid = (val: string) =>
        val.trim() !== "" && (isNaN(parseFloat(val)) || parseFloat(val) < 0);

    const handlePresetChange = (v: string) => {
        setPreset(v);
        setMolarMass(v in presetMolarMass ? presetMolarMass[v].toString() : "");
    };

    const handleCalculate = () => {
        setResult(null);
        setFormula(null);
        setInterpretation(null);

        const m = parseFloat(mass);
        const mm = parseFloat(molarMass);
        const mol = parseFloat(moles);
        const vol = parseFloat(volume);

        if (!vol || vol <= 0) {
            setResult("Volume must be greater than 0.");
            return;
        }

        const liters = volumeUnit === "mL" ? vol / 1000 : vol;
        let finalMoles: number | null = null;

        if (calcMode === "molarity") {
            if (!isNaN(mol) && mol > 0) finalMoles = mol;
            else if (!isNaN(m) && !isNaN(mm) && mm > 0) finalMoles = m / mm;
            else {
                setResult("Provide moles OR both mass and molar mass.");
                return;
            }
            const M = finalMoles / liters;
            setResult(`${M.toFixed(6)} M`);
            setFormula(`M = ${finalMoles.toFixed(6)} mol / ${liters} L`);
            setInterpretation(
                `The solution has a concentration of ${M.toFixed(6)} mol/L`
            );
        } else if (calcMode === "moles") {
            if (!isNaN(m) && !isNaN(mm) && mm > 0) finalMoles = m / mm;
            else {
                setResult("Provide mass and molar mass to calculate moles.");
                return;
            }
            setResult(`${finalMoles.toFixed(6)} mol`);
            setFormula(`n = ${m} g / ${mm} g/mol`);
            setInterpretation(`The solution contains ${finalMoles.toFixed(6)} moles.`);
        } else if (calcMode === "volume") {
            if (!isNaN(mol) && mol > 0) finalMoles = mol;
            else if (!isNaN(m) && !isNaN(mm) && mm > 0) finalMoles = m / mm;
            else {
                setResult("Provide moles OR mass & molar mass to calculate volume.");
                return;
            }
            setResult(`${liters.toFixed(6)} L`);
            setFormula(`V = n / M`);
            setInterpretation(
                `Required solution volume to achieve concentration: ${liters.toFixed(
                    6
                )} L`
            );
        }
    };

    const handleReset = () => {
        setMass("");
        setMolarMass("");
        setMoles("");
        setVolume("");
        setPreset("");
        setResult(null);
        setFormula(null);
        setInterpretation(null);
    };

    const renderInputLabel = (label: string, tooltip?: string) => (
        <div className="flex items-center gap-1 mb-1 font-medium">
            <span>{label}</span>
            {tooltip && (
                <span className="relative group">
                    <Info size={16} className="text-gray-400 cursor-pointer" />
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 text-xs p-2 rounded-md bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {tooltip}
                    </span>
                </span>
            )}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white/20 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Molarity Calculator
            </h2>

            {/* Mode & Preset */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={calcMode}
                    onChange={(e) =>
                        setCalcMode(e.target.value as "molarity" | "moles" | "volume")
                    }
                    className="w-full md:w-auto p-3 rounded-lg border border-black/10 cursor-pointer bg-white/10 text-gray-800 transition shadow-sm focus:outline-none"
                >
                    <option value="molarity">Calculate Molarity (M)</option>
                    <option value="moles">Calculate Moles</option>
                    <option value="volume">Calculate Volume</option>
                </select>

                <select
                    value={preset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full md:flex-1 p-3 rounded-lg border border-blac/10 bg-white/10  cursor-pointer text-gray-800  transition shadow-sm focus:outline-none"
                >
                    <option value="">-- Custom Compound --</option>
                    {Object.keys(presetMolarMass).map((key) => (
                        <option key={key} value={key}>
                            {key}
                        </option>
                    ))}
                </select>
            </div>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    {renderInputLabel(
                        "Mass (g)",
                        "The mass of the substance you are dissolving."
                    )}
                    <input
                        value={mass}
                        type="number"
                        onChange={(e) => setMass(e.target.value)}
                        className={`w-full p-3 rounded-lg border transition ${invalid(mass)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200"
                            }`}
                        placeholder="e.g. 5"
                    />
                    {invalid(mass) && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={14} /> Enter valid number
                        </p>
                    )}
                </div>

                <div>
                    {renderInputLabel(
                        "Molar Mass (g/mol)",
                        "Mass of one mole of substance. Sum of atomic masses."
                    )}
                    <input
                        value={molarMass}
                        type="number"
                        onChange={(e) => setMolarMass(e.target.value)}
                        className={`w-full p-3 rounded-lg border transition ${invalid(molarMass)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200"
                            }`}
                        placeholder="e.g. 58.44"
                    />
                    {invalid(molarMass) && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={14} /> Enter valid number
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    {renderInputLabel(
                        "Moles (mol)",
                        "Amount of substance (6.022×10^23 particles per mole)"
                    )}
                    <input
                        value={moles}
                        type="number"
                        onChange={(e) => setMoles(e.target.value)}
                        className={`w-full p-3 rounded-lg border transition ${invalid(moles)
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200"
                            }`}
                        placeholder="e.g. 0.0856"
                    />
                    {invalid(moles) && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={14} /> Enter valid number
                        </p>
                    )}
                </div>

                <div>
                    {renderInputLabel(
                        "Volume",
                        "Total solution volume. Use liters for molarity."
                    )}
                    <div className="flex gap-2">
                        <input
                            value={volume}
                            type="number"
                            onChange={(e) => setVolume(e.target.value)}
                            className={`flex-1 p-3 rounded-lg border transition ${invalid(volume)
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200"
                                }`}
                            placeholder="e.g. 500"
                        />
                        <select
                            value={volumeUnit}
                            onChange={(e) =>
                                setVolumeUnit(e.target.value as VolumeUnit)
                            }
                            className="px-3 border border-black/10 bg-white/20 rounded-lg text-gray-800 transition shadow-sm focus:outline-none cursor-pointer"
                        >
                            <option value="L" className="border-none">L</option>
                            <option value="mL">mL</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleCalculate}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                    Calculate
                </button>
                <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                    Reset
                </button>
            </div>

            {/* Results */}
            {result && (
                <div className="mt-6 p-5 rounded-xl bg-white/30 backdrop-blur-md text-center shadow-inner">
                    <p className="text-2xl font-bold text-gray-800">{result}</p>
                    {formula && <p className="mt-2 text-gray-700">{formula}</p>}
                    {interpretation && (
                        <p className="mt-1 text-gray-600">{interpretation}</p>
                    )}
                </div>
            )}
        </div>
    );
}
