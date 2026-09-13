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

/** Worked examples, so a student can see a sensible answer before typing their own. */
const EXAMPLES = [
    { name: "1 M NaCl, 100 mL", mass: "5.844", mw: "58.44", volume: "0.1" },
    { name: "Glucose in 250 mL", mass: "0.5", mw: "180.16", volume: "0.25" },
    { name: "0.1 M NaOH, 1 L", mass: "4", mw: "40.00", volume: "1" },
];

/** Error text for a field that must be a positive number; silent while empty. */
function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function MassMolarityCalculator() {
    const [mass, setMass] = useState("");
    const [molarMass, setMolarMass] = useState("");
    const [volume, setVolume] = useState("");

    /*
     * Derived live from the inputs. The previous page computed only on a
     * Calculate press; the arithmetic and the 4-decimal rounding are unchanged:
     * moles = mass ÷ molar mass, molarity = moles ÷ volume (L).
     */
    const result = useMemo(() => {
        const massValue = parseFloat(mass);
        const molarMassValue = parseFloat(molarMass);
        const volumeValue = parseFloat(volume);

        if (
            isNaN(massValue) ||
            isNaN(molarMassValue) ||
            isNaN(volumeValue) ||
            massValue <= 0 ||
            molarMassValue <= 0 ||
            volumeValue <= 0
        ) {
            return null;
        }

        const moles = massValue / molarMassValue;
        const molarity = moles / volumeValue;
        if (!Number.isFinite(moles) || !Number.isFinite(molarity)) return null;

        return {
            molarity,
            moles,
            massValue,
            molarMassValue,
            volumeValue,
        };
    }, [mass, molarMass, volume]);

    const reset = () => {
        setMass("");
        setMolarMass("");
        setVolume("");
    };

    return (
        <CalculatorShell
            title="Mass Molarity Calculator"
            subtitle="Works out the molarity of a solution from the mass of solute you weighed, its molar mass and the final volume."
            icon={Beaker}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About molarity">
                        <p>
                            Molarity (M) is the number of moles of solute in one litre of solution. It is
                            one of the most common ways to state a concentration in chemistry. To get it,
                            first turn the mass you weighed into moles by dividing by the molar mass, then
                            divide by the volume in litres.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Preparing a standard solution from a weighed solid",
                                "Checking the concentration written on a lab label",
                                "Converting a recipe given in grams into mol/L",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Volume is the final volume of solution, not the volume of solvent added",
                                "Use the molar mass of the form you weighed — hydrates weigh more per mole",
                                "Enter the volume in litres: 250 mL is 0.25 L",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Molarity"
                value={result ? result.molarity.toFixed(4) : null}
                unit="M (mol/L)"
                interpretation={result ? `${result.moles.toFixed(4)} mol of solute` : undefined}
                empty="Enter the mass, molar mass and volume — all greater than zero."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Mass of solute (g)"
                        value={mass}
                        onChange={setMass}
                        unit="g"
                        step="0.01"
                        placeholder="e.g. 5.844"
                        hint="The mass you weighed on the balance, in grams."
                        error={positiveError(mass)}
                    />
                    <NumberField
                        label="Molar mass (g/mol)"
                        value={molarMass}
                        onChange={setMolarMass}
                        unit="g/mol"
                        step="0.01"
                        placeholder="e.g. 58.44"
                        hint="Also called molecular weight. NaCl is 58.44 g/mol."
                        error={positiveError(molarMass)}
                    />
                    <NumberField
                        label="Volume of solution (L)"
                        value={volume}
                        onChange={setVolume}
                        unit="L"
                        step="0.001"
                        placeholder="e.g. 0.1"
                        hint="Final volume in litres — 100 mL is 0.1 L."
                        error={positiveError(volume)}
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
                                    setMass(example.mass);
                                    setMolarMass(example.mw);
                                    setVolume(example.volume);
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
                <CalcSection title="Working" description="The numbers you entered, substituted into the formula.">
                    <div>
                        <ResultRow
                            label="Moles = mass ÷ molar mass"
                            value={`${result.massValue} ÷ ${result.molarMassValue} = ${result.moles.toFixed(4)}`}
                            unit="mol"
                        />
                        <ResultRow
                            label="Molarity = moles ÷ volume"
                            value={`${formatSig(result.moles, 4)} ÷ ${result.volumeValue} = ${result.molarity.toFixed(4)}`}
                            unit="M"
                        />
                        {/* The substitution above uses moles to 4 significant figures, so
                            it does not look off by rounding. 4 decimals shows 0.0000 for very dilute solutions, so the
                            unrounded value is given as well, to 4 significant figures. */}
                        <ResultRow label="Molarity (4 significant figures)" value={formatSig(result.molarity, 4)} unit="M" />
                        <ResultRow label="Same as" value="mol/L or mol·L⁻¹" />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Molarity (M) = (Mass ÷ Molar mass) ÷ Volume</Formula>
                <Formula>M = (g ÷ g·mol⁻¹) ÷ L = mol·L⁻¹</Formula>
                <p>
                    <strong>Mass</strong> is the solute in grams, <strong>molar mass</strong> is in g/mol
                    and <strong>volume</strong> is the final volume of solution in litres. Dividing mass by
                    molar mass gives the amount in moles; dividing that by the volume gives moles per litre.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "My volume is in millilitres — what do I enter?",
                        a: "Divide by 1000 first. 250 mL is 0.25 L and 50 mL is 0.05 L. Entering 250 instead of 0.25 gives an answer 1000 times too small.",
                    },
                    {
                        q: "Is molarity the same as molality?",
                        a: "No. Molarity is moles per litre of solution; molality is moles per kilogram of solvent. They are close for dilute aqueous solutions but differ for concentrated ones, and molarity changes slightly with temperature because volume does.",
                    },
                    {
                        q: "Why does the result show 0.0000 M?",
                        a: "The result is rounded to 4 decimal places, so anything below 0.00005 M rounds to zero. The Working section also gives the value to 4 significant figures, which shows very dilute concentrations properly.",
                    },
                    {
                        q: "Which molar mass should I use for a hydrate?",
                        a: "The molar mass of exactly what you weighed. Copper sulfate pentahydrate (CuSO₄·5H₂O) is 249.68 g/mol, while anhydrous CuSO₄ is 159.61 g/mol — using the wrong one gives a concentration about 1.6 times off.",
                    },
                    {
                        q: "How do I convert molarity to millimolar?",
                        a: "Multiply by 1000. 0.0111 M is 11.1 mM, and 1 M is 1000 mM.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
