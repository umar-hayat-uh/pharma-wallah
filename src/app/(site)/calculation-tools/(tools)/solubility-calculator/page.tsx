"use client";

import { useMemo, useState } from "react";
import { Beaker, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    SelectField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    ModeSwitch,
    LabNotice,
    type ModeOption,
} from "@/components/calculators";

type OutputUnit = "g/L" | "mg/mL" | "mol/L";

const UNIT_OPTIONS: ModeOption<OutputUnit>[] = [
    { value: "g/L", label: "g/L", description: "Grams per litre" },
    { value: "mg/mL", label: "mg/mL", description: "Milligrams per millilitre" },
    { value: "mol/L", label: "mol/L", description: "Moles per litre" },
];

const SIG_FIG_OPTIONS = [2, 3, 4, 5, 6].map((num) => ({ value: String(num), label: `${num} digits` }));

/* ── Reference data (unchanged) ───────────────────────────────────────────── */
const COMMON_SUBSTANCES = [
    { name: "Sodium Chloride", formula: "NaCl", solubility: "360" },
    { name: "Sucrose", formula: "C₁₂H₂₂O₁₁", solubility: "2000" },
    { name: "Calcium Carbonate", formula: "CaCO₃", solubility: "0.013" },
    { name: "Silver Chloride", formula: "AgCl", solubility: "0.0019" },
    { name: "Glucose", formula: "C₆H₁₂O₆", solubility: "910" },
];

/** Worked examples: equivalent weights of common reagents. */
const EXAMPLES = [
    { name: "1 N NaCl", n: "1", gw: "58.5" },
    { name: "0.5 N H₂SO₄", n: "0.5", gw: "49.04" },
    { name: "0.1 N HCl", n: "0.1", gw: "36.46" },
];

const DEFAULTS = { normality: "1", gramWeight: "58.5", unit: "g/L" as OutputUnit, sigFigs: "4" };

/* ── Unchanged interpretation bands, applied to the value in the chosen unit ── */
function getSolubilityInterpretation(value: number): string {
    if (value < 0.01) return "Very low solubility - practically insoluble";
    if (value < 0.1) return "Low solubility - sparingly soluble";
    if (value < 1) return "Moderate solubility - slightly soluble";
    if (value < 10) return "Good solubility - soluble";
    if (value < 100) return "High solubility - freely soluble";
    return "Very high solubility - very soluble";
}

function getPharmacyGuideline(value: number): string {
    if (value < 0.1) return "This substance has very low solubility. Consider using alternative solvents or warming the solution.";
    if (value < 10) return "Moderate solubility. May require stirring or gentle heating for complete dissolution.";
    return "High solubility. Easy to prepare solutions at this concentration.";
}

/**
 * Unchanged display rule: exponential notation (with `digits − 1` decimals) for
 * ≥ 10000 or < 0.001, otherwise rounded to `digits` decimal places.
 */
function formatNumber(num: number, significantFigures: number): string {
    if (num === 0) return "0";
    if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
        return num.toExponential(significantFigures - 1);
    }
    const factor = Math.pow(10, significantFigures);
    const rounded = Math.round(num * factor) / factor;
    return rounded.toString();
}

function positiveError(raw: string, name: string): string | undefined {
    if (raw.trim() === "") return `Enter the ${name}.`;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function SolubilityCalculator() {
    const [normality, setNormality] = useState(DEFAULTS.normality);
    const [gramWeight, setGramWeight] = useState(DEFAULTS.gramWeight);
    const [selectedUnit, setSelectedUnit] = useState<OutputUnit>(DEFAULTS.unit);
    const [sigFigs, setSigFigs] = useState(DEFAULTS.sigFigs);
    const significantFigures = parseInt(sigFigs);

    /*
     * Derived rather than refreshed from a useEffect. Arithmetic unchanged:
     * S = N × G.W / 10 (g/L), then × 1000 for "mg/mL" or ÷ G.W for "mol/L".
     */
    const result = useMemo(() => {
        const N = parseFloat(normality);
        const GW = parseFloat(gramWeight);
        if (isNaN(N) || isNaN(GW) || N <= 0 || GW <= 0) return null;

        const baseGL = (N * GW) / 10;
        let solubility = baseGL;
        switch (selectedUnit) {
            case "mg/mL":
                solubility *= 1000;
                break;
            case "mol/L":
                solubility /= GW;
                break;
        }
        if (!Number.isFinite(solubility)) return null;
        return { solubility, baseGL };
    }, [normality, gramWeight, selectedUnit]);

    const reset = () => {
        setNormality(DEFAULTS.normality);
        setGramWeight(DEFAULTS.gramWeight);
        setSelectedUnit(DEFAULTS.unit);
        setSigFigs(DEFAULTS.sigFigs);
    };

    return (
        <CalculatorShell
            title="Solubility Calculator"
            subtitle="Calculates solubility from normality and gram equivalent weight with S = N × G.W / 10."
            icon={Beaker}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Solubility is the amount of a substance that dissolves in a given amount of
                            solvent. This tool relates it to normality (N — gram equivalents per litre) and
                            gram equivalent weight (G.W — molecular weight divided by the n-factor), then
                            reads the result against a solubility scale.
                        </p>
                        <CalcList
                            title="Factors affecting solubility"
                            items={[
                                "Temperature: generally increases with temperature for solids.",
                                "pH: many drugs show pH-dependent solubility.",
                                "Particle size: smaller particles dissolve faster.",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "The interpretation is read from the number in the unit you chose, so it can change when you switch units",
                                "Use the gram equivalent weight (MW ÷ n-factor), not the molecular weight, for acids, bases and salts with n > 1",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Solubility"
                value={result ? formatNumber(result.solubility, significantFigures) : null}
                unit={selectedUnit}
                interpretation={result ? getSolubilityInterpretation(result.solubility) : undefined}
                empty="Enter a normality and gram equivalent weight, both greater than zero."
            />

            {result && <LabNotice title="Pharmacy guidelines">{getPharmacyGuideline(result.solubility)}</LabNotice>}

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Normality, N (eq/L)"
                        value={normality}
                        onChange={setNormality}
                        unit="eq/L"
                        step="0.001"
                        placeholder="e.g. 1"
                        hint="Number of gram equivalent weights per litre."
                        error={positiveError(normality, "normality")}
                    />
                    <NumberField
                        label="Gram equivalent weight, G.W (g/eq)"
                        value={gramWeight}
                        onChange={setGramWeight}
                        unit="g/eq"
                        step="0.001"
                        placeholder="e.g. 58.5 (for NaCl)"
                        hint="Molecular weight divided by the n-factor. NaCl is 58.5 g/eq."
                        error={positiveError(gramWeight, "gram equivalent weight")}
                    />
                </FieldGrid>

                <div className="space-y-1.5">
                    <p className="text-[13px] font-medium text-foreground/90">Output unit</p>
                    <ModeSwitch label="Output unit" value={selectedUnit} onChange={setSelectedUnit} options={UNIT_OPTIONS} />
                </div>

                <SelectField
                    label="Significant figures"
                    value={sigFigs}
                    onChange={setSigFigs}
                    options={SIG_FIG_OPTIONS}
                    hint="Ordinary values are rounded to this many decimal places; very large or small ones switch to scientific notation."
                />

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                type="button"
                                onClick={() => {
                                    setNormality(example.n);
                                    setGramWeight(example.gw);
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {example.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="Your values substituted into S = N × G.W / 10.">
                    <div>
                        <ResultRow label="Normality (N)" value={normality} unit="eq/L" />
                        <ResultRow label="Gram equivalent weight" value={gramWeight} unit="g/eq" />
                        <ResultRow
                            label="Substitution"
                            value={`(${normality}) × (${gramWeight}) / 10 = ${formatNumber(result.baseGL, significantFigures)}`}
                            unit="g/L"
                        />
                        {selectedUnit !== "g/L" && (
                            <ResultRow
                                label={`Converted to ${selectedUnit}`}
                                value={formatNumber(result.solubility, significantFigures)}
                                unit={selectedUnit}
                            />
                        )}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Common substances" description="Approximate aqueous solubility at room temperature.">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[20rem] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Substance</th>
                                <th className="px-3 py-2.5 font-medium">Formula</th>
                                <th className="px-4 py-2.5 text-right font-medium sm:px-3">Solubility (g/L)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMMON_SUBSTANCES.map((sub) => (
                                <tr key={sub.name} className="border-b border-border/70 last:border-b-0">
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">{sub.name}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{sub.formula}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground sm:px-3">
                                        {sub.solubility}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>S = N × G.W / 10</Formula>
                <p>
                    <strong>S</strong> — solubility in g/L. <strong>N</strong> — normality in eq/L.{" "}
                    <strong>G.W</strong> — gram equivalent weight in g/eq.
                </p>
                <p>Note: this formula converts the result from g/100mL to g/L.</p>
                <p>
                    For the other output units the calculator multiplies the g/L figure by 1000 (mg/mL) or
                    divides it by the gram equivalent weight (mol/L).
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is a gram equivalent weight?",
                        a: "The molecular weight divided by the n-factor — the number of H⁺ or OH⁻ ions exchanged, or the total charge for a salt. HCl (n = 1) has G.W 36.46 g/eq; H₂SO₄ (n = 2) has 98.08 ÷ 2 = 49.04 g/eq.",
                    },
                    {
                        q: "What is normality?",
                        a: "The number of gram equivalents of solute per litre of solution. For a substance with n-factor 1 it equals molarity; for H₂SO₄ a 1 M solution is 2 N.",
                    },
                    {
                        q: "Why did the interpretation change when I switched units?",
                        a: "The solubility scale is applied to the number shown, in whichever unit is selected. The same solution gives a larger number in mg/mL and a smaller one in mol/L, so it lands in a different band.",
                    },
                    {
                        q: "What does the significant figures setting do?",
                        a: "For ordinary values it sets how many decimal places are kept (trailing zeros are dropped). For values of 10,000 or more, or below 0.001, the result switches to scientific notation with that many significant figures.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
