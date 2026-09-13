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
} from "@/components/calculators";

type TempUnit = "K" | "C";

const R = 8.314; // Gas constant J/(mol·K)

const TEMP_UNITS = [
    { value: "K", label: "K" },
    { value: "C", label: "°C" },
];

const DEFAULTS = { s1: "0.1", s2: "0.2", t1: "298", t2: "308", unit: "K" as TempUnit };

/* ── Reference values (unchanged) ─────────────────────────────────────────── */
const COMMON_VALUES = [
    { substance: "NaOH in water", enthalpy: "-44.5", type: "Exothermic" },
    { substance: "NH₄NO₃ in water", enthalpy: "+25.7", type: "Endothermic" },
    { substance: "KCl in water", enthalpy: "+17.2", type: "Endothermic" },
    { substance: "H₂SO₄ in water", enthalpy: "-95.3", type: "Exothermic" },
    { substance: "NaCl in water", enthalpy: "+3.9", type: "Endothermic" },
];

/** Unchanged size bands. */
function getEnthalpyInterpretation(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "exothermic" : "endothermic";

    if (absValue < 1000) return `Very small ${sign} process`;
    if (absValue < 10000) return `Small ${sign} process`;
    if (absValue < 50000) return `Moderate ${sign} process`;
    if (absValue < 100000) return `Large ${sign} process`;
    return `Very large ${sign} process`;
}

function fieldError(raw: string, what: string): string | undefined {
    if (raw.trim() === "") return `Enter ${what}.`;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function HeatFormationCalculator() {
    const [solubility1, setSolubility1] = useState(DEFAULTS.s1);
    const [solubility2, setSolubility2] = useState(DEFAULTS.s2);
    const [temp1, setTemp1] = useState(DEFAULTS.t1);
    const [temp2, setTemp2] = useState(DEFAULTS.t2);
    const [tempUnit, setTempUnit] = useState<TempUnit>(DEFAULTS.unit);

    /*
     * Derived rather than refreshed from a useEffect. Validation and arithmetic
     * unchanged: every value must be > 0 in the unit entered, T₁ ≠ T₂, and
     * ΔH = 2.303 × R × (log S₂ − log S₁) × (T₁ × T₂) / (T₂ − T₁) with T in kelvin.
     */
    const result = useMemo(() => {
        const S1 = parseFloat(solubility1);
        const S2 = parseFloat(solubility2);
        const T1 = parseFloat(temp1);
        const T2 = parseFloat(temp2);

        if (isNaN(S1) || isNaN(S2) || isNaN(T1) || isNaN(T2) || S1 <= 0 || S2 <= 0 || T1 <= 0 || T2 <= 0 || T1 === T2) {
            return null;
        }

        const T1K = tempUnit === "C" ? T1 + 273.15 : T1;
        const T2K = tempUnit === "C" ? T2 + 273.15 : T2;
        const deltaH = (2.303 * R * (Math.log10(S2) - Math.log10(S1)) * (T1K * T2K)) / (T2K - T1K);
        if (!Number.isFinite(deltaH)) return null;

        return { deltaH, T1K, T2K };
    }, [solubility1, solubility2, temp1, temp2, tempUnit]);

    const sameTemps =
        temp1.trim() !== "" && temp2.trim() !== "" && parseFloat(temp1) === parseFloat(temp2) ? "T₂ must differ from T₁." : undefined;

    const reset = () => {
        setSolubility1(DEFAULTS.s1);
        setSolubility2(DEFAULTS.s2);
        setTemp1(DEFAULTS.t1);
        setTemp2(DEFAULTS.t2);
        setTempUnit(DEFAULTS.unit);
    };

    const unitLabel = tempUnit === "K" ? "K" : "°C";

    return (
        <CalculatorShell
            title="Heat of Formation Calculator"
            subtitle="Estimates the enthalpy change of solution (ΔH) from the solubility of a substance at two temperatures, using the van't Hoff equation."
            icon={Flame}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            How much of a solid dissolves changes with temperature, and the size of that change
                            reflects the heat absorbed or released as it dissolves. Measure solubility at two
                            temperatures and the van&apos;t Hoff equation turns the pair into ΔH of solution.
                        </p>
                        <CalcList
                            title="Reading the sign"
                            items={[
                                "Positive ΔH — endothermic: solubility rises as temperature rises",
                                "Negative ΔH — exothermic: solubility falls as temperature rises",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Assumes ΔH stays constant between the two temperatures — keep them reasonably close",
                                "Both solubilities must be in the same unit; the unit itself cancels out",
                                "Temperatures in °C must be above 0 °C for this calculator to accept them",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="ΔH of solution"
                value={result ? `${result.deltaH > 0 ? "+" : ""}${result.deltaH.toFixed(1)}` : null}
                unit="J/mol"
                interpretation={
                    result
                        ? `${result.deltaH > 0 ? "Endothermic" : "Exothermic"} · ${getEnthalpyInterpretation(result.deltaH)}`
                        : undefined
                }
                empty="Enter two solubilities and two different temperatures, all greater than zero."
            />

            <CalcSection title="Solubility data">
                <FieldGrid>
                    <NumberField
                        label="Solubility at T₁, S₁ (mol/L)"
                        value={solubility1}
                        onChange={setSolubility1}
                        unit="mol/L"
                        step="0.0001"
                        placeholder="e.g. 0.1"
                        hint="Solubility measured at the first temperature."
                        error={fieldError(solubility1, "S₁")}
                    />
                    <NumberField
                        label={`Temperature T₁ (${unitLabel})`}
                        value={temp1}
                        onChange={setTemp1}
                        units={TEMP_UNITS}
                        unit={tempUnit}
                        onUnitChange={(next) => setTempUnit(next as TempUnit)}
                        step="0.1"
                        placeholder={`e.g. ${tempUnit === "K" ? "298" : "25"}`}
                        hint="Room temperature is 298 K (25 °C)."
                        error={fieldError(temp1, "T₁")}
                    />
                    <NumberField
                        label="Solubility at T₂, S₂ (mol/L)"
                        value={solubility2}
                        onChange={setSolubility2}
                        unit="mol/L"
                        step="0.0001"
                        placeholder="e.g. 0.2"
                        hint="Solubility measured at the second temperature, in the same unit as S₁."
                        error={fieldError(solubility2, "S₂")}
                    />
                    <NumberField
                        label={`Temperature T₂ (${unitLabel})`}
                        value={temp2}
                        onChange={setTemp2}
                        units={TEMP_UNITS}
                        unit={tempUnit}
                        onUnitChange={(next) => setTempUnit(next as TempUnit)}
                        step="0.1"
                        placeholder={`e.g. ${tempUnit === "K" ? "308" : "35"}`}
                        hint="Both temperatures share one unit — changing either switches both."
                        error={fieldError(temp2, "T₂") ?? sameTemps}
                    />
                </FieldGrid>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="Temperatures converted to kelvin, then substituted into the equation.">
                    <div>
                        <ResultRow label="T₁ in kelvin" value={result.T1K.toFixed(2)} unit="K" />
                        <ResultRow label="T₂ in kelvin" value={result.T2K.toFixed(2)} unit="K" />
                    </div>
                    <p className="overflow-x-auto rounded-lg border border-border/70 bg-muted/60 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground">
                        ΔH = 2.303 × 8.314 × (log({solubility2}) − log({solubility1})) × ({result.T1K.toFixed(2)} ×{" "}
                        {result.T2K.toFixed(2)}) / ({result.T2K.toFixed(2)} − {result.T1K.toFixed(2)})
                        <br />= {result.deltaH > 0 ? "+" : ""}
                        {result.deltaH.toFixed(1)} J/mol
                    </p>
                </CalcSection>
            )}

            <CalcSection title="Common ΔH values" description="Enthalpy of solution in water.">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[20rem] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Substance</th>
                                <th className="px-3 py-2.5 font-medium">Type</th>
                                <th className="px-4 py-2.5 text-right font-medium sm:px-3">ΔH (kJ/mol)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMMON_VALUES.map((item) => (
                                <tr key={item.substance} className="border-b border-border/70 last:border-b-0">
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">{item.substance}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{item.type}</td>
                                    <td
                                        className={
                                            item.enthalpy.startsWith("-")
                                                ? "px-4 py-2.5 text-right font-semibold tabular-nums text-red-600 sm:px-3"
                                                : "px-4 py-2.5 text-right font-semibold tabular-nums text-blue-600 sm:px-3"
                                        }
                                    >
                                        {item.enthalpy} kJ/mol
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote title="Van't Hoff equation">
                <Formula>ΔH = 2.303 × R × (log S₂ − log S₁) × (T₁ × T₂) / (T₂ − T₁)</Formula>
                <p>
                    <strong>ΔH</strong> — enthalpy of solution (J/mol). <strong>R</strong> — gas constant = 8.314
                    J/(mol·K). <strong>S₁, S₂</strong> — solubilities at temperatures T₁ and T₂.{" "}
                    <strong>T₁, T₂</strong> — absolute temperatures in kelvin (°C inputs have 273.15 added).
                </p>
                <p>
                    Note: positive ΔH indicates an endothermic process, negative an exothermic one. The 2.303
                    converts natural logarithms to base-10 logarithms.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What unit should the solubilities be in?",
                        a: "Any, as long as S₁ and S₂ use the same one. The equation uses the ratio S₂/S₁ (through the difference of their logarithms), so mol/L, g/L or g/100 mL all give the same ΔH.",
                    },
                    {
                        q: "Why must temperatures be in kelvin?",
                        a: "The equation comes from thermodynamics, where temperature is absolute. Using °C directly would give a wrong product T₁ × T₂. Enter °C if you prefer — the calculator adds 273.15 before substituting.",
                    },
                    {
                        q: "How do I convert J/mol to kJ/mol?",
                        a: "Divide by 1000. A result of +52903.1 J/mol is +52.9 kJ/mol, which is how the reference table lists its values.",
                    },
                    {
                        q: "Why does it need two different temperatures?",
                        a: "ΔH comes from how solubility changes between them. If T₁ equals T₂ the denominator is zero and there is nothing to compare, so the calculator waits for two different values.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
