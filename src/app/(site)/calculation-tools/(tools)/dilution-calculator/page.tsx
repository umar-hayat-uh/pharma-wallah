"use client";

import { useMemo, useState } from "react";
import { Droplet, RefreshCw } from "lucide-react";
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
    LabNotice,
    formatSig,
    type ModeOption,
} from "@/components/calculators";

type Variable = "V2" | "V1" | "C2" | "C1";

const VARIABLE_LABELS: Record<Variable, string> = {
    C1: "Initial Concentration (C₁)",
    V1: "Initial Volume (V₁)",
    C2: "Final Concentration (C₂)",
    V2: "Final Volume (V₂)",
};

/** Lower-case names for running text, where the symbol keeps its capital. */
const VARIABLE_NAMES: Record<Variable, string> = {
    C1: "initial concentration",
    V1: "initial volume",
    C2: "final concentration",
    V2: "final volume",
};

const MODE_OPTIONS: ModeOption<Variable>[] = [
    { value: "V2", label: VARIABLE_LABELS.V2, description: "V₂ = C₁V₁ ÷ C₂" },
    { value: "V1", label: VARIABLE_LABELS.V1, description: "V₁ = C₂V₂ ÷ C₁" },
    { value: "C2", label: VARIABLE_LABELS.C2, description: "C₂ = C₁V₁ ÷ V₂" },
    { value: "C1", label: VARIABLE_LABELS.C1, description: "C₁ = C₂V₂ ÷ V₁" },
];

const FIELD_HINTS: Record<Variable, string> = {
    C1: "Concentration of the stock. Any unit — but the same unit as C₂.",
    V1: "Volume of stock taken. Any unit — but the same unit as V₂.",
    C2: "Concentration you want after diluting. Same unit as C₁.",
    V2: "Total volume after diluting. Same unit as V₁.",
};

/** Worked examples, one per mode. */
const EXAMPLES: { name: string; solveFor: Variable; values: Partial<Record<Variable, string>> }[] = [
    { name: "10 → 2 mg/mL, 5 mL stock", solveFor: "V2", values: { C1: "10", V1: "5", C2: "2" } },
    { name: "50 mg/mL in 200 mL from 1000 mg/mL", solveFor: "V1", values: { C1: "1000", C2: "50", V2: "200" } },
    { name: "10 mL of 5% made to 50 mL", solveFor: "C2", values: { C1: "5", V1: "10", V2: "50" } },
];

type Outcome =
    | { kind: "empty" }
    | { kind: "error"; message: string }
    | { kind: "ok"; value: number; solvent: number };

/**
 * Unchanged from the previous page: the same validation order, messages and
 * formulas for each unknown. The only difference is that it now runs live.
 */
function solve(solveFor: Variable, c1: number, v1: number, c2: number, v2: number): Outcome {
    switch (solveFor) {
        case "V1":
            if (isNaN(c1) || isNaN(c2) || isNaN(v2) || c1 <= 0 || c2 <= 0 || v2 <= 0) {
                return { kind: "error", message: "Please enter valid positive numbers for C1, C2, and V2" };
            }
            if (c2 > c1) return { kind: "error", message: "Final concentration cannot be greater than initial concentration" };
            {
                const value = (c2 * v2) / c1;
                return { kind: "ok", value, solvent: v2 - value };
            }
        case "V2":
            if (isNaN(c1) || isNaN(v1) || isNaN(c2) || c1 <= 0 || v1 <= 0 || c2 <= 0) {
                return { kind: "error", message: "Please enter valid positive numbers for C1, V1, and C2" };
            }
            if (c2 > c1) return { kind: "error", message: "Final concentration cannot be greater than initial concentration" };
            {
                const value = (c1 * v1) / c2;
                return { kind: "ok", value, solvent: value - v1 };
            }
        case "C1":
            if (isNaN(v1) || isNaN(c2) || isNaN(v2) || v1 <= 0 || c2 <= 0 || v2 <= 0) {
                return { kind: "error", message: "Please enter valid positive numbers for V1, C2, and V2" };
            }
            return { kind: "ok", value: (c2 * v2) / v1, solvent: v2 - v1 };
        case "C2":
            if (isNaN(c1) || isNaN(v1) || isNaN(v2) || c1 <= 0 || v1 <= 0 || v2 <= 0) {
                return { kind: "error", message: "Please enter valid positive numbers for C1, V1, and V2" };
            }
            return { kind: "ok", value: (c1 * v1) / v2, solvent: v2 - v1 };
    }
}

export default function DilutionCalculator() {
    const [values, setValues] = useState<Record<Variable, string>>({ C1: "", V1: "", C2: "", V2: "" });
    const [solveFor, setSolveFor] = useState<Variable>("V2");

    const inputs = (["C1", "V1", "C2", "V2"] as Variable[]).filter((v) => v !== solveFor);
    const setValue = (key: Variable, next: string) => setValues((prev) => ({ ...prev, [key]: next }));

    const outcome = useMemo<Outcome>(() => {
        // Before every needed field has something in it, say what to enter rather
        // than flashing the "valid positive numbers" error at a half-filled form.
        if (inputs.some((key) => values[key].trim() === "")) return { kind: "empty" };
        const out = solve(
            solveFor,
            parseFloat(values.C1),
            parseFloat(values.V1),
            parseFloat(values.C2),
            parseFloat(values.V2),
        );
        if (out.kind === "ok" && !Number.isFinite(out.value)) return { kind: "empty" };
        return out;
    }, [values, solveFor]);

    const ok = outcome.kind === "ok" ? outcome : null;
    const valueText = ok ? ok.value.toFixed(4) : null;
    // Unchanged rule: solvent is shown (to 4 dp) only when solving for a volume and it is positive.
    const solventText = ok ? (ok.solvent > 0 ? ok.solvent.toFixed(4) : "0") : null;
    const showSolvent = ok !== null && (solveFor === "V1" || solveFor === "V2") && parseFloat(solventText || "0") > 0;
    const isVolume = solveFor === "V1" || solveFor === "V2";

    const known = (key: Variable) => (key === solveFor ? (ok ? ok.value : NaN) : parseFloat(values[key]));
    const c1 = known("C1");
    const c2 = known("C2");
    const v1 = known("V1");
    const v2 = known("V2");

    const substitution: Record<Variable, string> = {
        V2: `(${values.C1} × ${values.V1}) ÷ ${values.C2}`,
        V1: `(${values.C2} × ${values.V2}) ÷ ${values.C1}`,
        C2: `(${values.C1} × ${values.V1}) ÷ ${values.V2}`,
        C1: `(${values.C2} × ${values.V2}) ÷ ${values.V1}`,
    };

    const reset = () => {
        setValues({ C1: "", V1: "", C2: "", V2: "" });
        setSolveFor("V2");
    };

    return (
        <CalculatorShell
            title="Dilution Calculator"
            subtitle="Solves C₁V₁ = C₂V₂ for whichever of the four values you need — how much stock to take, the final volume, or the resulting concentration."
            icon={Droplet}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About dilution">
                        <p>
                            The dilution equation C₁V₁ = C₂V₂ states that the amount of solute remains constant
                            during dilution: adding solvent increases the volume and lowers the concentration,
                            but the quantity of drug stays the same.
                        </p>
                        <CalcList
                            title="Important notes"
                            items={[
                                "Concentration units must be the same for C₁ and C₂",
                                "Volume units must be the same for V₁ and V₂",
                                "Final concentration (C₂) should be less than initial concentration (C₁)",
                            ]}
                        />
                        <CalcList
                            title="Common applications"
                            items={[
                                "Preparing working solutions from stock",
                                "Serial dilutions for standard curves",
                                "Sample preparation for analysis",
                            ]}
                        />
                        <CalcList
                            title="Quick reference"
                            items={["C₁V₁ = C₂V₂ — basic formula", "Dilution factor = C₁/C₂", "Volume to add = V₂ − V₁"]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="What do you want to calculate?" value={solveFor} onChange={setSolveFor} options={MODE_OPTIONS} />

            <ResultCard
                label={VARIABLE_LABELS[solveFor]}
                value={valueText}
                unit={isVolume ? "(same unit as V)" : "(same unit as C)"}
                interpretation={
                    showSolvent ? `Solvent to add: ${solventText}` : undefined
                }
                empty={`Enter ${inputs[0]}, ${inputs[1]} and ${inputs[2]} to calculate the ${VARIABLE_NAMES[solveFor]}.`.replace(/([CV])([12])/g, (_, l: string, d: string) => l + (d === "1" ? "₁" : "₂"))}
            />

            {outcome.kind === "error" && <LabNotice tone="danger">{outcome.message}</LabNotice>}

            <CalcSection title="Inputs">
                <FieldGrid>
                    {inputs.map((key) => (
                        <NumberField
                            key={key}
                            label={VARIABLE_LABELS[key]}
                            value={values[key]}
                            onChange={(next) => setValue(key, next)}
                            step={key.startsWith("V") ? "0.001" : "0.01"}
                            placeholder={`Enter ${key.replace("1", "₁").replace("2", "₂")}`}
                            hint={FIELD_HINTS[key]}
                            error={
                                values[key].trim() !== "" && !(parseFloat(values[key]) > 0)
                                    ? "Must be a number greater than zero."
                                    : undefined
                            }
                        />
                    ))}
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                type="button"
                                onClick={() => {
                                    setSolveFor(example.solveFor);
                                    setValues({ C1: "", V1: "", C2: "", V2: "", ...example.values });
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-left text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
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

            {ok && (
                <CalcSection title="Working" description="Your values substituted into the rearranged equation.">
                    <div>
                        <ResultRow
                            label={`${solveFor.replace("1", "₁").replace("2", "₂")} = ${MODE_OPTIONS.find((m) => m.value === solveFor)?.description?.split(" = ")[1]}`}
                            value={`${substitution[solveFor]} = ${valueText}`}
                        />
                        {showSolvent && <ResultRow label="Solvent to add = V₂ − V₁" value={solventText as string} />}
                        <ResultRow label="Amount of solute, C₁ × V₁" value={formatSig(c1 * v1, 4)} />
                        <ResultRow label="Amount of solute, C₂ × V₂" value={formatSig(c2 * v2, 4)} />
                        <ResultRow label="Dilution factor, C₁ ÷ C₂" value={formatSig(c1 / c2, 4)} />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>C₁ × V₁ = C₂ × V₂</Formula>
                <p>
                    <strong>C₁</strong> = initial (stock) concentration, <strong>V₁</strong> = initial volume of
                    stock taken, <strong>C₂</strong> = final concentration, <strong>V₂</strong> = final volume.
                </p>
                <p>
                    Both sides are the amount of solute, which does not change when you add solvent.
                    Rearrange for the unknown: V₂ = C₁V₁ ÷ C₂, V₁ = C₂V₂ ÷ C₁, C₂ = C₁V₁ ÷ V₂, C₁ = C₂V₂ ÷ V₁.
                    When solving for a volume, the solvent to add is V₂ − V₁.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which units should I use?",
                        a: "Any, as long as C₁ and C₂ share one concentration unit and V₁ and V₂ share one volume unit. The answer comes out in that same unit — enter mL and you get mL.",
                    },
                    {
                        q: "Is V₂ the volume of solvent I add?",
                        a: "No. V₂ is the total final volume. The solvent to add is V₂ − V₁: to make 25 mL from 5 mL of stock, add 20 mL of diluent.",
                    },
                    {
                        q: "Why does it say the final concentration cannot be greater?",
                        a: "Diluting can only lower a concentration. If C₂ is larger than C₁ the inputs are probably swapped, or you need to concentrate the solution instead, which this equation does not describe.",
                    },
                    {
                        q: "What is the dilution factor?",
                        a: "C₁ ÷ C₂, which equals V₂ ÷ V₁. A dilution factor of 5 means a 1 in 5 dilution: one part stock made up to five parts in total.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
