"use client";

import { useMemo, useState } from "react";
import { Beaker, RefreshCw } from "lucide-react";
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
    formatSig,
} from "@/components/calculators";

/** Worked examples covering a small molecule, a sugar and a protein. */
const EXAMPLES = [
    { name: "Glucose 1 mg/mL", conc: "1", mw: "180.16" },
    { name: "Sucrose 0.5 mg/mL", conc: "0.5", mw: "342.3" },
    { name: "Albumin (BSA) 2.5 mg/mL", conc: "2.5", mw: "66430" },
];

/** Error text for a field that must be a positive number; silent while empty. */
function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function MgMlMolarityCalculator() {
    const [concentration, setConcentration] = useState("");
    const [molarMass, setMolarMass] = useState("");

    /*
     * Derived live from the inputs (the previous page waited for a Calculate
     * press). Arithmetic and rounding unchanged: 1 mg/mL = 1 g/L, so
     * M = concentration ÷ molar mass; mM = M × 1000 (4 dp); µM = M × 1,000,000 (2 dp).
     */
    const result = useMemo(() => {
        const concentrationValue = parseFloat(concentration);
        const molarMassValue = parseFloat(molarMass);

        if (
            isNaN(concentrationValue) ||
            isNaN(molarMassValue) ||
            concentrationValue <= 0 ||
            molarMassValue <= 0
        ) {
            return null;
        }

        // Convert mg/mL to g/L (1 mg/mL = 1 g/L)
        const concentrationInGperL = concentrationValue;
        const molarityValue = concentrationInGperL / molarMassValue;
        if (!Number.isFinite(molarityValue)) return null;

        return {
            concentrationValue,
            molarMassValue,
            molarity: molarityValue,
            molarityMilli: molarityValue * 1000,
            molarityMicro: molarityValue * 1000000,
        };
    }, [concentration, molarMass]);

    const reset = () => {
        setConcentration("");
        setMolarMass("");
    };

    return (
        <CalculatorShell
            title="mg/mL to Molarity Calculator"
            subtitle="Converts a concentration in mg/mL into molarity, and shows it in M, mM and µM."
            icon={Beaker}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About mg/mL to molarity">
                        <p>
                            Converting mg/mL to molarity is a routine step in biochemistry and pharmacology —
                            drug and protein stocks are usually weighed, but assays and literature quote
                            molar concentrations. The key is that 1 mg/mL equals 1 g/L, so dividing by the
                            molar mass gives moles per litre directly.
                        </p>
                        <CalcList
                            title="Quick reference"
                            items={["1 M = 1000 mM (millimolar)", "1 M = 1,000,000 µM (micromolar)", "1 mg/mL = 1 g/L"]}
                        />
                        <CalcList
                            title="Use it when"
                            items={[
                                "Turning a weighed drug or protein stock into a molar concentration",
                                "Comparing your stock with an IC₅₀ or Kd quoted in µM or nM",
                                "Planning a dilution that is written in molar units",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Use the molar mass of the exact salt or hydrate you weighed",
                                "For proteins, the molecular weight in daltons equals g/mol",
                                "A concentration in µg/mL must be divided by 1000 first",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Molarity"
                value={result ? result.molarity.toFixed(6) : null}
                unit="M (mol/L)"
                interpretation={
                    result ? `${result.molarityMilli.toFixed(4)} mM · ${result.molarityMicro.toFixed(2)} µM` : undefined
                }
                empty="Enter the concentration in mg/mL and the molecular weight — both greater than zero."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Concentration (mg/mL)"
                        value={concentration}
                        onChange={setConcentration}
                        unit="mg/mL"
                        step="0.01"
                        placeholder="e.g. 1"
                        hint="Milligrams per millilitre — the same number as g/L."
                        error={positiveError(concentration)}
                    />
                    <NumberField
                        label="Molecular weight (g/mol)"
                        value={molarMass}
                        onChange={setMolarMass}
                        unit="g/mol"
                        step="0.01"
                        placeholder="e.g. 180.16"
                        hint="Also known as molar mass (g/mol or g·mol⁻¹)."
                        error={positiveError(molarMass)}
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                type="button"
                                onClick={() => {
                                    setConcentration(example.conc);
                                    setMolarMass(example.mw);
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
                <CalcSection title="Working" description="Your numbers substituted into the formula, then scaled to smaller units.">
                    <div>
                        <ResultRow label="Concentration in g/L" value={`${result.concentrationValue}`} unit="g/L" />
                        <ResultRow
                            label="Molarity = g/L ÷ g/mol"
                            value={`${result.concentrationValue} ÷ ${result.molarMassValue} = ${result.molarity.toFixed(6)}`}
                            unit="M"
                        />
                        <ResultRow label="Millimolar (× 1000)" value={result.molarityMilli.toFixed(4)} unit="mM" />
                        <ResultRow label="Micromolar (× 1,000,000)" value={result.molarityMicro.toFixed(2)} unit="µM" />
                        {/* The rounded figures above collapse to zero for very dilute
                            solutions; the same value to 4 significant figures does not. */}
                        <ResultRow label="Molarity (4 significant figures)" value={formatSig(result.molarity, 4)} unit="M" />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Molarity (M) = Concentration (mg/mL) ÷ Molecular weight (g/mol)</Formula>
                <Formula>M = (mg/mL) ÷ (g/mol) = (g/L) ÷ (g/mol) = mol/L</Formula>
                <p>
                    A milligram is a thousandth of a gram and a millilitre is a thousandth of a litre, so the
                    thousands cancel: <strong>1 mg/mL = 1 g/L</strong>. Dividing grams per litre by grams per
                    mole leaves moles per litre. Multiply by 1000 for mM and by 1,000,000 for µM.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is 1 mg/mL the same as 1 g/L?",
                        a: "Both the numerator and the denominator are scaled by 1000: 1 mg is 0.001 g and 1 mL is 0.001 L. The factors cancel, so the number stays the same and the calculation reduces to dividing by the molecular weight.",
                    },
                    {
                        q: "My concentration is in µg/mL — what do I enter?",
                        a: "Divide by 1000 to get mg/mL first. 500 µg/mL is 0.5 mg/mL. For % w/v, multiply by 10: a 1% w/v solution is 10 mg/mL.",
                    },
                    {
                        q: "What molecular weight do I use for a protein?",
                        a: "The molecular weight in daltons (Da) or kilodaltons (kDa) — 1 Da equals 1 g/mol, so 66.43 kDa is 66,430 g/mol. Use the mass of the form you have, including tags or glycosylation if they are part of it.",
                    },
                    {
                        q: "Why does the molarity show 0.000000 M?",
                        a: "The molarity is rounded to 6 decimal places, so very dilute solutions round to zero. Read the µM figure, or the 4-significant-figure value in the Working section.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
