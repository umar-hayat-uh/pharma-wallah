"use client";
import { useState, useEffect } from 'react';
import { Calculator, Thermometer, Beaker, RefreshCw, Zap, AlertCircle, Flame, ChevronDown } from 'lucide-react';

type MassUnit = 'g' | 'kg';
type TempUnit = '°C' | 'K';
type HeatUnit = 'J' | 'kJ';

export default function HeatOfNeutralizationCalculator() {
  const [massAcid, setMassAcid] = useState<string>('100');
  const [massBase, setMassBase] = useState<string>('100');
  const [massUnitAcid, setMassUnitAcid] = useState<MassUnit>('g');
  const [massUnitBase, setMassUnitBase] = useState<MassUnit>('g');
  const [specificHeat, setSpecificHeat] = useState<string>('4.18');
  const [heatUnit, setHeatUnit] = useState<HeatUnit>('J');
  const [temp1, setTemp1] = useState<string>('25.0');
  const [temp2, setTemp2] = useState<string>('31.5');
  const [tempUnit, setTempUnit] = useState<TempUnit>('°C');
  const [moles, setMoles] = useState<string>('0.1');
  const [showMolarEnthalpy, setShowMolarEnthalpy] = useState<boolean>(false);
  const [heat, setHeat] = useState<number | null>(null);
  const [molarEnthalpy, setMolarEnthalpy] = useState<number | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const massToGrams = (value: number, unit: MassUnit): number =>
    unit === 'kg' ? value * 1000 : value;

  const joulesToUnit = (value: number, unit: HeatUnit): number =>
    unit === 'kJ' ? value / 1000 : value;

  const getTempInCelsius = (value: number, unit: TempUnit): number =>
    unit === 'K' ? value - 273.15 : value;

  const calculateHeat = () => {
    const ma = parseFloat(massAcid);
    const mb = parseFloat(massBase);
    const c = parseFloat(specificHeat);
    const t1 = parseFloat(temp1);
    const t2 = parseFloat(temp2);
    const mol = parseFloat(moles);

    if (isNaN(ma) || isNaN(mb) || isNaN(c) || isNaN(t1) || isNaN(t2) || ma <= 0 || mb <= 0 || c <= 0) {
      setHeat(null);
      setMolarEnthalpy(null);
      return;
    }

    const ma_g = massToGrams(ma, massUnitAcid);
    const mb_g = massToGrams(mb, massUnitBase);
    const t1_c = getTempInCelsius(t1, tempUnit);
    const t2_c = getTempInCelsius(t2, tempUnit);
    const deltaT = t2_c - t1_c;
    const deltaQ_joules = (ma_g + mb_g) * c * deltaT;
    setHeat(deltaQ_joules);

    if (showMolarEnthalpy && !isNaN(mol) && mol > 0) {
      setMolarEnthalpy((deltaQ_joules / 1000) / mol);
    } else {
      setMolarEnthalpy(null);
    }
  };

  const resetCalculator = () => {
    setMassAcid('100');
    setMassBase('100');
    setMassUnitAcid('g');
    setMassUnitBase('g');
    setSpecificHeat('4.18');
    setHeatUnit('J');
    setTemp1('25.0');
    setTemp2('31.5');
    setTempUnit('°C');
    setMoles('0.1');
    setShowMolarEnthalpy(false);
    setHeat(null);
    setMolarEnthalpy(null);
  };

  const getInterpretation = (value: number, isMolar: boolean = false) => {
    if (isMolar) {
      const absH = Math.abs(value);
      if (absH < 10) return 'Very weak neutralization';
      if (absH < 30) return 'Weak neutralization';
      if (absH < 50) return 'Moderate neutralization';
      if (absH < 70) return 'Strong neutralization';
      return 'Very strong neutralization';
    } else {
      const absQ = Math.abs(value);
      if (absQ < 100) return 'Small heat change';
      if (absQ < 1000) return 'Moderate heat change';
      if (absQ < 10000) return 'Large heat change';
      return 'Very large heat change';
    }
  };

  useEffect(() => {
    calculateHeat();
  }, [massAcid, massBase, massUnitAcid, massUnitBase, specificHeat, temp1, temp2, tempUnit, moles, showMolarEnthalpy, heatUnit]);

  const totalMass =
    !isNaN(parseFloat(massAcid)) && !isNaN(parseFloat(massBase))
      ? massToGrams(parseFloat(massAcid), massUnitAcid) + massToGrams(parseFloat(massBase), massUnitBase)
      : null;

  const deltaT =
    !isNaN(parseFloat(temp1)) && !isNaN(parseFloat(temp2))
      ? getTempInCelsius(parseFloat(temp2), tempUnit) - getTempInCelsius(parseFloat(temp1), tempUnit)
      : null;

  /* ── Shared input/select styles ── */
  const inputCls =
    'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition';
  const selectCls =
    'px-2 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition cursor-pointer';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg">
        <div className="px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Heat of Neutralization
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                Acid–base calorimetry calculator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-white text-sm font-medium">
            <Thermometer className="w-4 h-4" />
            Calorimetry
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ────────── INPUT CARD ────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 flex flex-col gap-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Experimental Data
          </h2>

          {/* Mass of Acid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Mass of Acid (m<sub>a</sub>)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={massAcid}
                onChange={(e) => setMassAcid(e.target.value)}
                className={inputCls}
                placeholder="e.g. 100"
              />
              <select
                value={massUnitAcid}
                onChange={(e) => setMassUnitAcid(e.target.value as MassUnit)}
                className={selectCls + ' w-16 flex-shrink-0'}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {/* Mass of Base */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Mass of Base (m<sub>b</sub>)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={massBase}
                onChange={(e) => setMassBase(e.target.value)}
                className={inputCls}
                placeholder="e.g. 100"
              />
              <select
                value={massUnitBase}
                onChange={(e) => setMassUnitBase(e.target.value as MassUnit)}
                className={selectCls + ' w-16 flex-shrink-0'}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {/* Specific Heat */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Specific Heat Capacity (c)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                value={specificHeat}
                onChange={(e) => setSpecificHeat(e.target.value)}
                className={inputCls}
                placeholder="e.g. 4.18"
              />
              <span className="flex-shrink-0 flex items-center px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm whitespace-nowrap">
                J/g·°C
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Default 4.18 for dilute aqueous solutions</p>
          </div>

          {/* Temperature row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Temperatures
              </label>
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value as TempUnit)}
                className={selectCls + ' text-xs'}
              >
                <option value="°C">°C</option>
                <option value="K">K</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  T₁ (Initial)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temp1}
                  onChange={(e) => setTemp1(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 25.0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  T₂ (Final)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temp2}
                  onChange={(e) => setTemp2(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 31.5"
                />
              </div>
            </div>
          </div>

          {/* Molar Enthalpy toggle */}
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMolarEnthalpy}
                onChange={(e) => setShowMolarEnthalpy(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400"
              />
              <span className="text-sm font-semibold text-slate-700">
                Calculate Molar Enthalpy (ΔH)
              </span>
            </label>
            {showMolarEnthalpy && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Moles of Limiting Reactant
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    value={moles}
                    onChange={(e) => setMoles(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 0.1"
                  />
                  <span className="flex-shrink-0 flex items-center px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm">
                    mol
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Moles of the limiting reactant</p>
              </div>
            )}
          </div>

          {/* Heat unit toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Display Heat In
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(['J', 'kJ'] as HeatUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setHeatUnit(u)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    heatUnit === u
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {u === 'J' ? 'Joules (J)' : 'Kilojoules (kJ)'}
                </button>
              ))}
            </div>
          </div>

          {/* Formula accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Show Formula
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showFormula ? 'rotate-180' : ''}`}
              />
            </button>
            {showFormula && (
              <div className="px-4 py-4 bg-white text-sm text-slate-700 space-y-3">
                <div className="bg-slate-100 rounded-lg p-3 text-center font-mono text-sm overflow-x-auto">
                  ΔQ = (m<sub>a</sub> + m<sub>b</sub>) × c × ΔT
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <p><span className="font-semibold text-slate-800">ΔQ</span> — Heat absorbed/released (J)</p>
                  <p><span className="font-semibold text-slate-800">m<sub>a</sub>, m<sub>b</sub></span> — Masses of acid and base solutions (g)</p>
                  <p><span className="font-semibold text-slate-800">c</span> — Specific heat capacity (J/g·°C)</p>
                  <p><span className="font-semibold text-slate-800">ΔT</span> — Temperature change (T₂ – T₁)</p>
                  <p><span className="font-semibold text-slate-800">ΔH</span> — ΔQ (kJ) ÷ moles of limiting reactant</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={calculateHeat}
              className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow transition-all duration-200 text-sm"
            >
              Calculate
            </button>
            <button
              onClick={resetCalculator}
              className="flex items-center gap-2 px-5 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* ────────── RESULTS COLUMN ────────── */}
        <div className="flex flex-col gap-5">

          {/* Heat result card */}
          <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl shadow-lg p-5 sm:p-6 text-white">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              Heat of Neutralization
            </h2>

            {/* Main value display */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 mb-4 text-center">
              <p className="text-xs font-semibold text-blue-100 mb-2 uppercase tracking-widest">
                Heat Change (ΔQ)
              </p>
              {heat !== null ? (
                <>
                  <p className="text-4xl sm:text-5xl font-bold mb-1 leading-none break-all">
                    {joulesToUnit(heat, heatUnit).toFixed(2)}
                  </p>
                  <p className="text-xl font-semibold mb-2">{heatUnit}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      heat >= 0 ? 'bg-emerald-400/30' : 'bg-blue-400/30'
                    }`}
                  >
                    {heat >= 0 ? '🔥 Exothermic' : '❄️ Endothermic'}
                  </span>
                </>
              ) : (
                <p className="text-blue-100 text-lg">Enter valid data above</p>
              )}
            </div>

            {/* Molar enthalpy */}
            {showMolarEnthalpy && molarEnthalpy !== null && (
              <div className="bg-white/10 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-blue-100 font-medium">Molar Enthalpy (ΔH)</p>
                  <p className="text-xs text-blue-200 mt-0.5">{getInterpretation(molarEnthalpy, true)}</p>
                </div>
                <p className="text-lg font-bold whitespace-nowrap">
                  {molarEnthalpy.toFixed(2)} kJ/mol
                </p>
              </div>
            )}

            {/* Interpretation */}
            {heat !== null && (
              <div className="bg-white/10 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold">Interpretation: </span>
                  <span className="text-blue-100">
                    {getInterpretation(heat)} – {heat > 0 ? 'heat released to surroundings.' : 'heat absorbed from surroundings.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Calculation details */}
          {heat !== null && totalMass !== null && deltaT !== null && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Calculation Breakdown</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Total mass</p>
                  <p className="font-semibold text-slate-800 text-sm">{totalMass.toFixed(2)} g</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-0.5">ΔT</p>
                  <p className="font-semibold text-slate-800 text-sm">{deltaT.toFixed(2)} °C</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-lg p-3">
                <p className="text-center font-mono text-xs sm:text-sm text-slate-700 break-words leading-relaxed">
                  ΔQ = {totalMass.toFixed(1)} g × {specificHeat} J/g·°C × {deltaT.toFixed(2)} °C
                  <br />= <span className="font-bold text-blue-700">{heat.toFixed(2)} J</span>
                </p>
              </div>
            </div>
          )}

          {/* Reference table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Typical Neutralization Enthalpies</h3>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs sm:text-sm min-w-[280px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 px-1 text-left font-semibold text-slate-600">Reaction</th>
                    <th className="py-2 px-1 text-left font-semibold text-slate-600 hidden sm:table-cell">Note</th>
                    <th className="py-2 px-1 text-right font-semibold text-slate-600">ΔH (kJ/mol)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { acid: 'HCl', base: 'NaOH', dH: '−57.9', note: 'Strong–strong' },
                    { acid: 'H₂SO₄', base: 'NaOH', dH: '−57.1', note: 'Per mol H⁺' },
                    { acid: 'CH₃COOH', base: 'NaOH', dH: '−55.8', note: 'Weak acid' },
                    { acid: 'HCl', base: 'NH₃', dH: '−51.6', note: 'Weak base' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-2 px-1 font-medium text-slate-800">
                        {row.acid} + {row.base}
                      </td>
                      <td className="py-2 px-1 text-slate-500 hidden sm:table-cell">{row.note}</td>
                      <td className="py-2 px-1 text-right font-bold text-blue-600">{row.dH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">Values at 25 °C. Negative = exothermic.</p>
          </div>

        </div>
      </div>
    </div>
  );
}