"use client";
import { useState, useEffect } from "react";
import {
  Calculator,
  Thermometer,
  AlertCircle,
  RefreshCw,
  Flame,
  Zap,
} from "lucide-react";

interface TemperatureUnit {
  name: string;
  symbol: string;
  toKelvin: (temp: number) => number;
  fromKelvin: (temp: number) => number;
}

export default function HeatFormationCalculator() {
  const [solubility1, setSolubility1] = useState<string>("0.1");
  const [solubility2, setSolubility2] = useState<string>("0.2");
  const [temp1, setTemp1] = useState<string>("298");
  const [temp2, setTemp2] = useState<string>("308");
  const [tempUnit, setTempUnit] = useState<"K" | "C">("K");
  const [enthalpy, setEnthalpy] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const R = 8.314; // Gas constant J/(mol·K)

  const temperatureUnits: TemperatureUnit[] = [
    {
      name: "Kelvin",
      symbol: "K",
      toKelvin: (temp) => temp,
      fromKelvin: (temp) => temp,
    },
    {
      name: "Celsius",
      symbol: "C",
      toKelvin: (temp) => temp + 273.15,
      fromKelvin: (temp) => temp - 273.15,
    },
  ];

  const calculateEnthalpy = () => {
    const S1 = parseFloat(solubility1);
    const S2 = parseFloat(solubility2);
    const T1 = parseFloat(temp1);
    const T2 = parseFloat(temp2);

    if (
      !isNaN(S1) &&
      !isNaN(S2) &&
      !isNaN(T1) &&
      !isNaN(T2) &&
      S1 > 0 &&
      S2 > 0 &&
      T1 > 0 &&
      T2 > 0 &&
      T1 !== T2
    ) {
      // Convert temperatures to Kelvin if needed
      const T1K = tempUnit === "C" ? T1 + 273.15 : T1;
      const T2K = tempUnit === "C" ? T2 + 273.15 : T2;

      // Formula: ΔH = 2.303 × R × (logS₂ - logS₁) × (T₁ × T₂) / (T₂ - T₁)
      const deltaH =
        (2.303 * R * (Math.log10(S2) - Math.log10(S1)) * (T1K * T2K)) /
        (T2K - T1K);

      setEnthalpy(deltaH);
    } else {
      setEnthalpy(null);
    }
  };

  const resetCalculator = () => {
    setSolubility1("0.1");
    setSolubility2("0.2");
    setTemp1("298");
    setTemp2("308");
    setTempUnit("K");
    setEnthalpy(null);
  };

  const getEnthalpyInterpretation = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "exothermic" : "endothermic";

    if (absValue < 1000) return `Very small ${sign} process`;
    if (absValue < 10000) return `Small ${sign} process`;
    if (absValue < 50000) return `Moderate ${sign} process`;
    if (absValue < 100000) return `Large ${sign} process`;
    return `Very large ${sign} process`;
  };

  useEffect(() => {
    calculateEnthalpy();
  }, [solubility1, solubility2, temp1, temp2, tempUnit]);

  return (
    <section className="min-h-screen bg-white p-4 md:p-6 mt-16 md:mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-xl mr-4">
                <Flame className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Heat of Formation Calculator
                </h1>
                <p className="text-green-100 mt-2">
                  Calculate ΔH from solubility-temperature relationship
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
              <Thermometer className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">
                Thermodynamic Analysis
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calculator className="w-6 h-6 md:w-7 md:h-7 mr-2 text-green-600" />
              Solubility Data
            </h2>

            {/* Temperature Unit Selection */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Temperature Unit
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {temperatureUnits.map((unit) => (
                  <button
                    key={unit.symbol}
                    onClick={() => setTempUnit(unit.symbol as "K" | "C")}
                    className={`py-2 rounded-lg transition-all ${
                      tempUnit === unit.symbol
                        ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {unit.name} ({unit.symbol})
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Solubility at T₁ (S₁)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      value={solubility1}
                      onChange={(e) => setSolubility1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                      placeholder="e.g., 0.1"
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      mol/L
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature T₁
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={temp1}
                      onChange={(e) => setTemp1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                      placeholder={`e.g., ${tempUnit === "K" ? "298" : "25"}`}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      {tempUnit}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Solubility at T₂ (S₂)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      value={solubility2}
                      onChange={(e) => setSolubility2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                      placeholder="e.g., 0.2"
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      mol/L
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature T₂
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={temp2}
                      onChange={(e) => setTemp2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none"
                      placeholder={`e.g., ${tempUnit === "K" ? "308" : "35"}`}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      {tempUnit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Toggle */}
              <div className="bg-gradient-to-r from-green-50 to-green-50 rounded-xl p-4 border border-green-200">
                <button
                  onClick={() => setShowFormula(!showFormula)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-semibold text-green-700">
                    Show Formula
                  </span>
                  <Zap
                    className={`w-5 h-5 text-green-600 transform ${showFormula ? "rotate-180" : ""}`}
                  />
                </button>

                {showFormula && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">
                      Van't Hoff Equation
                    </h4>
                    <div className="text-center p-3 bg-gray-100 rounded-lg font-mono text-sm">
                      ΔH = 2.303 × R × (logS₂ - logS₁) × (T₁ × T₂) / (T₂ - T₁)
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">ΔH:</span> Enthalpy of
                        solution (J/mol)
                      </p>
                      <p>
                        <span className="font-semibold">R:</span> Gas constant =
                        8.314 J/(mol·K)
                      </p>
                      <p>
                        <span className="font-semibold">S₁, S₂:</span>{" "}
                        Solubilities at temperatures T₁ and T₂
                      </p>
                      <p>
                        <span className="font-semibold">T₁, T₂:</span> Absolute
                        temperatures in Kelvin
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Note: Positive ΔH indicates endothermic process,
                        negative indicates exothermic
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={calculateEnthalpy}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Calculate ΔH
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

          {/* Results Section */}
          <div className="space-y-6">
            {/* Result Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-2xl shadow-xl p-6 md:p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Flame className="w-7 h-7 mr-3" />
                Enthalpy Result
              </h2>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm font-semibold text-green-100 mb-2">
                    ΔH of Solution
                  </div>
                  {enthalpy !== null ? (
                    <>
                      <div className="text-5xl md:text-6xl font-bold mb-2 break-words">
                        {enthalpy > 0 ? "+" : ""}
                        {enthalpy.toFixed(1)}
                      </div>
                      <div className="text-2xl font-semibold">J/mol</div>
                      <div className="text-lg mt-2">
                        {enthalpy > 0 ? (
                          <span className="text-red-200">Endothermic</span>
                        ) : (
                          <span className="text-blue-200">Exothermic</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-green-100">
                      Enter Values
                    </div>
                  )}
                </div>
              </div>

              {/* Interpretation */}
              {enthalpy !== null && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold mb-1">Interpretation:</div>
                      <div className="text-sm text-green-100">
                        {getEnthalpyInterpretation(enthalpy)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Calculation Details */}
            {enthalpy !== null && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Calculation Details
                </h3>
                <div className="space-y-4">
                  {/* Parse temperatures safely */}
                  {(() => {
                    const t1Num = parseFloat(temp1);
                    const t2Num = parseFloat(temp2);
                    const t1K = tempUnit === "C" ? t1Num + 273.15 : t1Num;
                    const t2K = tempUnit === "C" ? t2Num + 273.15 : t2Num;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">
                              T₁ in Kelvin
                            </div>
                            <div className="font-semibold">
                              {t1K.toFixed(2)} K
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">
                              T₂ in Kelvin
                            </div>
                            <div className="font-semibold">
                              {t2K.toFixed(2)} K
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 overflow-x-auto">
                          <div className="text-center font-mono text-sm whitespace-normal break-words">
                            ΔH = 2.303 × 8.314 × (log({solubility2}) - log(
                            {solubility1})) × ({t1K.toFixed(2)} ×{" "}
                            {t2K.toFixed(2)}) / ({t2K.toFixed(2)} -{" "}
                            {t1K.toFixed(2)})
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            {/* Quick Reference */}
            <div className="bg-gradient-to-r from-green-50 to-green-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Common ΔH Values
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-700 font-semibold">
                      <th className="py-2 text-left">Substance</th>
                      <th className="py-2 text-left">Type</th>
                      <th className="py-2 text-right">ΔH (kJ/mol)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        substance: "NaOH in water",
                        enthalpy: "-44.5",
                        type: "Exothermic",
                      },
                      {
                        substance: "NH₄NO₃ in water",
                        enthalpy: "+25.7",
                        type: "Endothermic",
                      },
                      {
                        substance: "KCl in water",
                        enthalpy: "+17.2",
                        type: "Endothermic",
                      },
                      {
                        substance: "H₂SO₄ in water",
                        enthalpy: "-95.3",
                        type: "Exothermic",
                      },
                      {
                        substance: "NaCl in water",
                        enthalpy: "+3.9",
                        type: "Endothermic",
                      },
                    ].map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-green-100 hover:bg-green-50"
                      >
                        <td className="py-2 font-medium text-gray-800">
                          {item.substance}
                        </td>
                        <td className="py-2 text-gray-600">{item.type}</td>
                        <td
                          className={`py-2 text-right font-bold ${item.enthalpy.startsWith("-") ? "text-red-600" : "text-blue-600"}`}
                        >
                          {item.enthalpy} kJ/mol
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
