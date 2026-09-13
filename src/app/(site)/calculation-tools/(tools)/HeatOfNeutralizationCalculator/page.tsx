"use client";

import { useMemo, useState } from "react";
import { Flame, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    ModeSwitch,
    type ModeOption,
} from "@/components/calculators";

type MassUnit = "g" | "kg";
type TempUnit = "°C" | "K";
type HeatUnit = "J" | "kJ";

const TEMP_UNITS = [
    { value: "C", label: "°C" },
    { value: "K", label: "K" },
];

const HEAT_UNIT_OPTIONS: ModeOption<HeatUnit>[] = [
    { value: "J", label: "Joules (J)" },
    { value: "kJ", label: "Kilojoules (kJ)" },
];

const DEFAULTS = {
    massAcid: "100",
    massBase: "100",
    specificHeat: "4.18",
    temp1: "25.0",
    temp2: "31.5",
    moles: "0.1",
};

/* ── Reference data (unchanged) ───────────────────────────────────────────── */
const TYPICAL_ENTHALPIES = [
    { acid: "HCl", base: "NaOH", dH: "−57.9", note: "Strong–strong" },
    { acid: "H₂SO₄", base: "NaOH", dH: "−57.1", note: "Per mol H⁺" },
    { acid: "CH₃COOH", base: "NaOH", dH: "−55.8", note: "Weak acid" },
    { acid: "HCl", base: "NH₃", dH: "−51.6", note: "Weak base" },
];

/* ── Unchanged conversions and bands ──────────────────────────────────────── */
const massToGrams = (value: number, unit: MassUnit): number => (unit === "kg" ? value * 1000 : value);
const joulesToUnit = (value: number, unit: HeatUnit): number => (unit === "kJ" ? value / 1000 : value);
const getTempInCelsius = (value: number, unit: TempUnit): number => (unit === "K" ? value - 273.15 : value);

function getInterpretation(value: number, isMolar = false): string {
    if (isMolar) {
        const absH = Math.abs(value);
        if (absH < 10) return "Very weak neutralization";
        if (absH < 30) return "Weak neutralization";
        if (absH < 50) return "Moderate neutralization";
        if (absH < 70) return "Strong neutralization";
        return "Very strong neutralization";
    }
    const absQ = Math.abs(value);
    if (absQ < 100) return "Small heat change";
    if (absQ < 1000) return "Moderate heat change";
    if (absQ < 10000) return "Large heat change";
    return "Very large heat change";
}

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return "Required.";
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function HeatOfNeutralizationCalculator() {
    const [massAcid, setMassAcid] = useState(DEFAULTS.massAcid);
    const [massBase, setMassBase] = useState(DEFAULTS.massBase);
    const [massUnitAcid, setMassUnitAcid] = useState<MassUnit>("g");
    const [massUnitBase, setMassUnitBase] = useState<MassUnit>("g");
    const [specificHeat, setSpecificHeat] = useState(DEFAULTS.specificHeat);
    const [heatUnit, setHeatUnit] = useState<HeatUnit>("J");
    const [temp1, setTemp1] = useState(DEFAULTS.temp1);
    const [temp2, setTemp2] = useState(DEFAULTS.temp2);
    const [tempUnit, setTempUnit] = useState<TempUnit>("°C");
    const [moles, setMoles] = useState(DEFAULTS.moles);
    const [showMolarEnthalpy, setShowMolarEnthalpy] = useState(false);

    /*
     * Derived rather than refreshed from a useEffect. Arithmetic unchanged:
     * ΔQ (J) = (m_acid + m_base in g) × c × (T₂ − T₁ in °C); ΔH (kJ/mol) = ΔQ/1000 ÷ moles.
     */
    const result = useMemo(() => {
        const ma = parseFloat(massAcid);
        const mb = parseFloat(massBase);
        const c = parseFloat(specificHeat);
        const t1 = parseFloat(temp1);
        const t2 = parseFloat(temp2);
        const mol = parseFloat(moles);

        if (isNaN(ma) || isNaN(mb) || isNaN(c) || isNaN(t1) || isNaN(t2) || ma <= 0 || mb <= 0 || c <= 0) {
            return null;
        }

        const totalMass = massToGrams(ma, massUnitAcid) + massToGrams(mb, massUnitBase);
        const deltaT = getTempInCelsius(t2, tempUnit) - getTempInCelsius(t1, tempUnit);
        const heat = totalMass * c * deltaT;
        if (!Number.isFinite(heat)) return null;

        const molarEnthalpy = showMolarEnthalpy && !isNaN(mol) && mol > 0 ? heat / 1000 / mol : null;
        return { heat, totalMass, deltaT, molarEnthalpy };
    }, [massAcid, massBase, massUnitAcid, massUnitBase, specificHeat, temp1, temp2, tempUnit, moles, showMolarEnthalpy]);

    const reset = () => {
        setMassAcid(DEFAULTS.massAcid);
        setMassBase(DEFAULTS.massBase);
        setMassUnitAcid("g");
        setMassUnitBase("g");
        setSpecificHeat(DEFAULTS.specificHeat);
        setHeatUnit("J");
        setTemp1(DEFAULTS.temp1);
        setTemp2(DEFAULTS.temp2);
        setTempUnit("°C");
        setMoles(DEFAULTS.moles);
        setShowMolarEnthalpy(false);
    };

    const tempError = (raw: string) => (raw.trim() === "" ? "Required." : isNaN(parseFloat(raw)) ? "Enter a number." : undefined);
    const molesError = showMolarEnthalpy && moles.trim() !== "" && !(parseFloat(moles) > 0) ? "Must be greater than zero." : undefined;

    return (
        <CalculatorShell
            title="Heat of Neutralization Calculator"
            subtitle="Acid–base calorimetry: works out the heat released when an acid and a base are mixed, from their masses and the temperature rise."
            icon={Flame}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            When an acid neutralises a base in a coffee-cup calorimeter, the heat given out warms
                            the mixture. Measuring that temperature rise, together with the mass and specific heat
                            capacity of the solution, gives the heat change ΔQ. Dividing by the moles of the
                            limiting reactant gives the molar enthalpy of neutralization.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Writing up a calorimetry practical",
                                "Comparing strong and weak acids or bases",
                                "Checking a textbook ΔQ = mcΔT problem",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Assumes no heat is lost to the cup or the air — real results come out slightly low",
                                "The specific heat default (4.18 J/g·°C) is for dilute aqueous solutions",
                                "The molar value takes the sign of the temperature change (positive when the mixture warms); by convention an exothermic ΔH is written with a minus sign, as in the table",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Heat change (ΔQ)"
                value={result ? joulesToUnit(result.heat, heatUnit).toFixed(2) : null}
                unit={heatUnit}
                interpretation={
                    result
                        ? `${result.heat >= 0 ? "Exothermic" : "Endothermic"} · ${getInterpretation(result.heat)} – ${
                              result.heat > 0 ? "heat released to surroundings." : "heat absorbed from surroundings."
                          }`
                        : undefined
                }
                empty="Enter valid data: both masses and the specific heat must be greater than zero, and both temperatures filled in."
            />

            {showMolarEnthalpy && (
                <ResultCard
                    label="Molar enthalpy (ΔH)"
                    value={result?.molarEnthalpy != null ? result.molarEnthalpy.toFixed(2) : null}
                    unit="kJ/mol"
                    interpretation={result?.molarEnthalpy != null ? getInterpretation(result.molarEnthalpy, true) : undefined}
                    empty="Enter the moles of the limiting reactant (greater than zero)."
                />
            )}

            <CalcSection title="Experimental data">
                <FieldGrid>
                    <NumberField
                        label="Mass of acid, m_acid"
                        value={massAcid}
                        onChange={setMassAcid}
                        units={["g", "kg"]}
                        unit={massUnitAcid}
                        onUnitChange={(next) => setMassUnitAcid(next as MassUnit)}
                        step="0.1"
                        placeholder="e.g. 100"
                        hint="Mass of the acid solution. 100 mL of dilute solution ≈ 100 g."
                        error={positiveError(massAcid)}
                    />
                    <NumberField
                        label="Mass of base, m_base"
                        value={massBase}
                        onChange={setMassBase}
                        units={["g", "kg"]}
                        unit={massUnitBase}
                        onUnitChange={(next) => setMassUnitBase(next as MassUnit)}
                        step="0.1"
                        placeholder="e.g. 100"
                        hint="Mass of the base solution."
                        error={positiveError(massBase)}
                    />
                    <NumberField
                        label="Specific heat capacity, c (J/g·°C)"
                        value={specificHeat}
                        onChange={setSpecificHeat}
                        unit="J/g·°C"
                        step="0.001"
                        placeholder="e.g. 4.18"
                        hint="Default 4.18 for dilute aqueous solutions."
                        error={positiveError(specificHeat)}
                        className="sm:col-span-2"
                    />
                    <NumberField
                        label="T₁ — initial temperature"
                        value={temp1}
                        onChange={setTemp1}
                        units={TEMP_UNITS}
                        unit={tempUnit === "K" ? "K" : "C"}
                        onUnitChange={(next) => setTempUnit(next === "K" ? "K" : "°C")}
                        step="0.1"
                        placeholder="e.g. 25.0"
                        hint="Temperature of the solutions before mixing."
                        error={tempError(temp1)}
                    />
                    <NumberField
                        label="T₂ — final temperature"
                        value={temp2}
                        onChange={setTemp2}
                        units={TEMP_UNITS}
                        unit={tempUnit === "K" ? "K" : "C"}
                        onUnitChange={(next) => setTempUnit(next === "K" ? "K" : "°C")}
                        step="0.1"
                        placeholder="e.g. 31.5"
                        hint="Highest temperature reached. Both share one unit."
                        error={tempError(temp2)}
                    />
                </FieldGrid>

                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 sm:p-4">
                    <label className="flex min-h-[44px] cursor-pointer select-none items-center gap-3">
                        <input
                            type="checkbox"
                            checked={showMolarEnthalpy}
                            onChange={(e) => setShowMolarEnthalpy(e.target.checked)}
                            className="h-5 w-5 shrink-0 rounded accent-blue-600"
                        />
                        <span className="text-sm font-medium text-foreground">Calculate molar enthalpy (ΔH)</span>
                    </label>
                    {showMolarEnthalpy && (
                        <NumberField
                            label="Moles of limiting reactant (mol)"
                            value={moles}
                            onChange={setMoles}
                            unit="mol"
                            step="0.001"
                            placeholder="e.g. 0.1"
                            hint="Concentration × volume in litres of whichever reactant runs out first."
                            error={molesError}
                            className="mt-2"
                        />
                    )}
                </div>

                <div className="space-y-1.5">
                    <p className="text-[13px] font-medium text-foreground/90">Display heat in</p>
                    <ModeSwitch label="Display heat in" value={heatUnit} onChange={setHeatUnit} options={HEAT_UNIT_OPTIONS} />
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="Masses converted to grams and temperatures to °C, then substituted.">
                    <div>
                        <ResultRow label="Total mass, m_acid + m_base" value={result.totalMass.toFixed(2)} unit="g" />
                        <ResultRow label="ΔT = T₂ − T₁" value={result.deltaT.toFixed(2)} unit="°C" />
                        {result.molarEnthalpy !== null && (
                            <ResultRow
                                label="ΔH = ΔQ (kJ) ÷ moles"
                                value={`${(result.heat / 1000).toFixed(4)} ÷ ${moles} = ${result.molarEnthalpy.toFixed(2)}`}
                                unit="kJ/mol"
                            />
                        )}
                    </div>
                    <p className="overflow-x-auto rounded-lg border border-border/70 bg-muted/60 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground">
                        ΔQ = {result.totalMass.toFixed(1)} g × {specificHeat} J/g·°C × {result.deltaT.toFixed(2)} °C
                        <br />= <strong>{result.heat.toFixed(2)} J</strong>
                    </p>
                </CalcSection>
            )}

            <CalcSection title="Typical neutralization enthalpies" description="Values at 25 °C. Negative = exothermic.">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[20rem] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Reaction</th>
                                <th className="px-3 py-2.5 font-medium">Note</th>
                                <th className="px-4 py-2.5 text-right font-medium sm:px-3">ΔH (kJ/mol)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TYPICAL_ENTHALPIES.map((row) => (
                                <tr key={`${row.acid}-${row.base}`} className="border-b border-border/70 last:border-b-0">
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">
                                        {row.acid} + {row.base}
                                    </td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{row.note}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground sm:px-3">
                                        {row.dH}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>ΔQ = (m_acid + m_base) × c × ΔT</Formula>
                <Formula>ΔH = ΔQ (kJ) ÷ moles of limiting reactant</Formula>
                <p>
                    <strong>ΔQ</strong> — heat absorbed/released (J). <strong>m_acid, m_base</strong> — masses of the acid
                    and base solutions (g). <strong>c</strong> — specific heat capacity (J/g·°C).{" "}
                    <strong>ΔT</strong> — temperature change (T₂ − T₁). <strong>ΔH</strong> — ΔQ in kJ divided by
                    the moles of the limiting reactant.
                </p>
                <p>
                    A temperature change in kelvin is the same size as in °C, so K inputs give the same ΔT.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why use the mass of both solutions?",
                        a: "After mixing, the whole solution absorbs the heat, so the heat capacity is that of the combined mass. For dilute solutions 1 mL is taken as about 1 g, so 50 mL acid + 50 mL base is 100 g.",
                    },
                    {
                        q: "How do I find the moles of the limiting reactant?",
                        a: "Multiply concentration (mol/L) by volume (L) for each reactant; the smaller number is limiting. 50 mL of 1.0 M HCl is 0.050 mol.",
                    },
                    {
                        q: "Why is my value lower than the textbook −57 kJ/mol?",
                        a: "Some heat escapes to the cup, thermometer and air, and weak acids or bases use energy to ionise first. Both make the measured value smaller than for a strong acid with a strong base.",
                    },
                    {
                        q: "Should ΔH be negative?",
                        a: "By convention, yes — neutralization is exothermic, so ΔH is written with a minus sign (for example −57.9 kJ/mol). This calculator follows the sign of ΔT, so a warming mixture gives a positive number — add the minus sign when you write it up.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
