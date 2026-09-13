"use client";

import { useMemo, useState } from "react";
import { Droplet, RefreshCw, Scale, Weight } from "lucide-react";
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
} from "@/components/calculators";

type PercentType = "wv" | "vv" | "ww";
type SolveFor = "solute" | "solvent" | "solution" | "percentage";

/* ── Units per percentage type (unchanged from the original page) ──────────── */
const UNITS: Record<PercentType, { solute: string[]; solvent: string[]; solution: string[] }> = {
    wv: { solute: ["g", "mg", "μg"], solvent: ["mL", "L", "μL"], solution: ["mL", "L", "μL"] },
    vv: { solute: ["mL", "L", "μL"], solvent: ["mL", "L", "μL"], solution: ["mL", "L", "μL"] },
    ww: { solute: ["g", "mg", "μg"], solvent: ["g", "mg", "μg"], solution: ["g", "mg", "μg"] },
};

const SOLVE_LABEL: Record<SolveFor, string> = {
    percentage: "Percentage (%)",
    solute: "Solute Amount",
    solvent: "Solvent Amount",
    solution: "Total Solution",
};

const TYPE_DESCRIPTION: Record<PercentType, string> = {
    wv: "Weight/Volume (w/v): Mass of solute per volume of solution",
    vv: "Volume/Volume (v/v): Volume of solute per volume of solution",
    ww: "Weight/Weight (w/w): Mass of solute per mass of solution",
};

const TYPE_FORMULA: Record<PercentType, string> = {
    wv: "% (w/v) = (solute weight / solution volume) × 100",
    vv: "% (v/v) = (solute volume / solution volume) × 100",
    ww: "% (w/w) = (solute weight / solution weight) × 100",
};

const COMMON_PERCENTAGES: Record<PercentType, string[]> = {
    wv: ["0.1", "0.5", "1.0", "5.0", "10.0", "20.0", "50.0"],
    vv: ["0.1", "0.5", "1.0", "5.0", "10.0", "25.0", "50.0", "70.0", "100.0"],
    ww: ["0.1", "0.5", "1.0", "5.0", "10.0", "20.0", "50.0"],
};

const COMMON_SOLUTIONS: { name: string; type: PercentType; percentage: string; solute: string; solvent: string }[] = [
    { name: "Physiological Saline", type: "wv", percentage: "0.9", solute: "NaCl", solvent: "Water" },
    { name: "Ethanol for Disinfection", type: "vv", percentage: "70", solute: "Ethanol", solvent: "Water" },
    { name: "Glucose Solution", type: "wv", percentage: "5", solute: "D-Glucose", solvent: "Water" },
    { name: "Acetic Acid (Vinegar)", type: "vv", percentage: "5", solute: "Acetic acid", solvent: "Water" },
    { name: "SDS Solution", type: "wv", percentage: "10", solute: "SDS", solvent: "Water" },
    { name: "Agarose Gel", type: "wv", percentage: "1", solute: "Agarose", solvent: "TAE/TBE buffer" },
];

const CONVERSION_ROWS = [
    { percentage: "0.1%", wv: "0.1g", vv: "0.1mL", ww: "0.1g", use: "Dilute standards" },
    { percentage: "0.5%", wv: "0.5g", vv: "0.5mL", ww: "0.5g", use: "Agar plates" },
    { percentage: "1%", wv: "1g", vv: "1mL", ww: "1g", use: "Staining solutions" },
    { percentage: "5%", wv: "5g", vv: "5mL", ww: "5g", use: "Blocking buffers" },
    { percentage: "10%", wv: "10g", vv: "10mL", ww: "10g", use: "SDS-PAGE gels" },
    { percentage: "20%", wv: "20g", vv: "20mL", ww: "20g", use: "Sugar solutions" },
    { percentage: "50%", wv: "50g", vv: "50mL", ww: "50g", use: "Glycerol stocks" },
];

/** Which inputs each "solve for" choice actually reads. */
const REQUIRED: Record<SolveFor, ("percentage" | "solute" | "solution")[]> = {
    percentage: ["solute", "solution"],
    solute: ["percentage", "solution"],
    solvent: ["solute", "solution"],
    solution: ["percentage", "solute"],
};

type Outcome = { value: string; unit: string; details: string } | { error: string };

/**
 * The original page's calculatePercentageSolution, moved into a pure function.
 * Every check, message, formula and the rounding (`decimals` places, then
 * Number#toString) is byte-for-byte the same. Note the original applies no unit
 * conversion — the result is labelled with the chosen unit as entered.
 */
function calculate(
    type: PercentType,
    solveFor: SolveFor,
    raw: { percentage: string; solute: string; solution: string },
    units: { solute: string; solvent: string; solution: string },
    decimals: number,
): Outcome {
    const pct = parseFloat(raw.percentage);
    const solute = parseFloat(raw.solute);
    const solution = parseFloat(raw.solution);
    const { solute: soluteUnit, solvent: solventUnit, solution: solutionUnit } = units;

    let calculatedValue: number;
    let calculatedUnit: string;
    let details: string;

    switch (solveFor) {
        case "percentage":
            if (type === "wv") {
                if (isNaN(solute) || isNaN(solution) || solution <= 0) return { error: "Please enter valid solute weight and solution volume" };
                calculatedValue = (solute / solution) * 100;
                calculatedUnit = "% (w/v)";
                details = `% (w/v) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
            } else if (type === "vv") {
                if (isNaN(solute) || isNaN(solution) || solution <= 0) return { error: "Please enter valid solute volume and solution volume" };
                calculatedValue = (solute / solution) * 100;
                calculatedUnit = "% (v/v)";
                details = `% (v/v) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
            } else {
                if (isNaN(solute) || isNaN(solution) || solution <= 0) return { error: "Please enter valid solute weight and solution weight" };
                calculatedValue = (solute / solution) * 100;
                calculatedUnit = "% (w/w)";
                details = `% (w/w) = (${solute}${soluteUnit} / ${solution}${solutionUnit}) × 100`;
            }
            break;

        case "solute":
            if (isNaN(pct) || pct <= 0) return { error: "Please enter a valid positive percentage" };
            if (type === "wv" || type === "vv") {
                if (isNaN(solution) || solution <= 0) return { error: "Please enter valid solution volume" };
            } else {
                if (isNaN(solution) || solution <= 0) return { error: "Please enter valid solution weight" };
            }
            calculatedValue = (pct / 100) * solution;
            calculatedUnit = soluteUnit;
            details = `Solute = (${pct}% / 100) × ${solution}${solutionUnit}`;
            break;

        case "solvent":
            if (type === "ww") {
                if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) return { error: "Please enter valid solution weight and solute weight" };
                if (solute > solution) return { error: "Solute weight cannot be greater than solution weight" };
            } else {
                if (isNaN(solution) || isNaN(solute) || solution <= 0 || solute < 0) return { error: "Please enter valid solution volume and solute amount" };
                if (solute > solution) return { error: "Solute cannot be greater than solution volume" };
            }
            calculatedValue = solution - solute;
            calculatedUnit = solventUnit;
            details = `Solvent = ${solution}${solutionUnit} - ${solute}${soluteUnit}`;
            break;

        case "solution":
            if (isNaN(pct) || pct <= 0) return { error: "Please enter a valid positive percentage" };
            if (isNaN(solute) || solute <= 0) return { error: "Please enter valid solute amount" };
            calculatedValue = solute / (pct / 100);
            calculatedUnit = solutionUnit;
            details = `Solution = ${solute}${soluteUnit} / (${pct}% / 100)`;
            break;
    }

    if (isNaN(calculatedValue) || calculatedValue < 0 || !isFinite(calculatedValue)) {
        return { error: "Invalid calculation result. Please check your inputs." };
    }

    const factor = Math.pow(10, decimals);
    const rounded = Math.round(calculatedValue * factor) / factor;
    // Math.round can hand back -0 for a tiny negative-zero product; never print it.
    return { value: (rounded === 0 ? 0 : rounded).toString(), unit: calculatedUnit, details };
}

function negativeError(raw: string): string | undefined {
    const value = parseFloat(raw);
    return !isNaN(value) && value < 0 ? "Cannot be negative." : undefined;
}

export default function PercentageSolutionCalculator() {
    const [type, setType] = useState<PercentType>("wv");
    const [solveFor, setSolveFor] = useState<SolveFor>("solute");
    const [percentage, setPercentage] = useState("");
    const [soluteValue, setSoluteValue] = useState("");
    const [solutionValue, setSolutionValue] = useState("");
    const [soluteUnit, setSoluteUnit] = useState("g");
    const [solventUnit, setSolventUnit] = useState("mL");
    const [solutionUnit, setSolutionUnit] = useState("mL");
    const [decimals, setDecimals] = useState(4);

    const units = UNITS[type];
    const isVolumeBased = type === "wv" || type === "vv";

    /*
     * Fixed stale-state bug: the original read the units of the PREVIOUS type
     * here (getUnits() closed over the old percentageType), so switching w/v →
     * v/v left the solute labelled "g". Units now follow the type just chosen.
     */
    const changeType = (next: PercentType) => {
        setType(next);
        setSoluteUnit(UNITS[next].solute[0]);
        setSolventUnit(UNITS[next].solvent[0]);
        setSolutionUnit(UNITS[next].solution[0]);
    };

    const required = REQUIRED[solveFor];
    const raw = { percentage, solute: soluteValue, solution: solutionValue };
    const nothingEntered = required.every((key) => raw[key].trim() === "");

    const outcome = useMemo(
        () =>
            calculate(
                type,
                solveFor,
                { percentage, solute: soluteValue, solution: solutionValue },
                { solute: soluteUnit, solvent: solventUnit, solution: solutionUnit },
                decimals,
            ),
        [type, solveFor, percentage, soluteValue, solutionValue, soluteUnit, solventUnit, solutionUnit, decimals],
    );

    const result = "error" in outcome ? null : outcome;
    const error = "error" in outcome && !nothingEntered ? outcome.error : null;

    const reset = () => {
        setPercentage("");
        setSoluteValue("");
        setSolutionValue("");
        setSolveFor("solute");
    };

    const soluteNoun = type === "vv" ? "volume" : "mass";
    const solutionNoun = type === "ww" ? "mass" : "volume";

    return (
        <CalculatorShell
            title="Percentage Solution Calculator"
            subtitle="Works out solute, solvent, final solution amount or strength for w/v, v/v and w/w percentage solutions."
            icon={Scale}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About percentage solutions">
                        <p>
                            A percentage solution states how much solute is in every 100 parts of the
                            finished solution. Which &ldquo;parts&rdquo; depends on the type.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-foreground">Weight/Volume (w/v)%</p>
                                <p>
                                    Mass of solute (g) per 100 mL of solution. Common for solids dissolved in
                                    liquids. Example: 1% (w/v) NaCl = 1g NaCl in 100mL water.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Volume/Volume (v/v)%</p>
                                <p>
                                    Volume of solute (mL) per 100 mL of solution. Common for liquids mixed with
                                    liquids. Example: 70% (v/v) ethanol = 70mL ethanol + 30mL water.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Weight/Weight (w/w)%</p>
                                <p>
                                    Mass of solute (g) per 100g of solution. Used when both components are
                                    weighed. Example: 10% (w/w) NaOH = 10g NaOH + 90g water.
                                </p>
                            </div>
                        </div>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Preparing saline, glucose, ethanol or stain solutions at the bench",
                                "Checking the strength of a solution you have already made",
                                "Scaling a percentage formula to a different final volume or mass",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Important notes"
                            items={[
                                "Always add solute to solvent, not vice versa (especially for concentrated acids/bases)",
                                "For w/v solutions, final volume is measured after dissolution",
                                "For w/w solutions, temperature affects density and weight measurements",
                                "Some solutes have significant volume change upon dissolution",
                                "No unit conversion is applied — numbers are used as entered, so pick matching units (g with mL, mL with mL, g with g)",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Percentage solution type"
                value={type}
                onChange={changeType}
                options={[
                    { value: "wv", label: "Weight/Volume (w/v)", description: "g per 100 mL", icon: Weight },
                    { value: "vv", label: "Volume/Volume (v/v)", description: "mL per 100 mL", icon: Droplet },
                    { value: "ww", label: "Weight/Weight (w/w)", description: "g per 100 g", icon: Scale },
                ]}
            />

            <ModeSwitch
                label="What do you want to calculate?"
                value={solveFor}
                onChange={setSolveFor}
                options={[
                    { value: "solute", label: "Solute Amount", description: "From % and final amount" },
                    { value: "solvent", label: "Solvent Amount", description: "Final amount − solute" },
                    { value: "solution", label: "Total Solution", description: "From % and solute" },
                    { value: "percentage", label: "Percentage (%)", description: "From solute and final amount" },
                ]}
            />

            <ResultCard
                label={SOLVE_LABEL[solveFor]}
                value={result?.value}
                unit={result?.unit}
                interpretation={result ? TYPE_DESCRIPTION[type].split(": ")[0] : undefined}
                empty={
                    error ??
                    (solveFor === "percentage"
                        ? `Enter the solute ${soluteNoun} and the final solution ${solutionNoun}.`
                        : solveFor === "solvent"
                          ? `Enter the final solution ${solutionNoun} and the solute amount.`
                          : solveFor === "solute"
                            ? `Enter the percentage and the final solution ${solutionNoun}.`
                            : `Enter the percentage and the solute ${soluteNoun}.`)
                }
            />

            <CalcSection title="Inputs" description={TYPE_DESCRIPTION[type]}>
                {required.includes("percentage") && (
                    <div className="space-y-3">
                        <NumberField
                            label="Percentage (%)"
                            value={percentage}
                            onChange={setPercentage}
                            unit="%"
                            step="0.01"
                            min={0}
                            max={type === "vv" ? 100 : undefined}
                            placeholder="e.g. 0.9"
                            hint={`The strength you want, as ${type === "wv" ? "g per 100 mL" : type === "vv" ? "mL per 100 mL" : "g per 100 g"}.`}
                            error={negativeError(percentage)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {COMMON_PERCENTAGES[type].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setPercentage(pct)}
                                    className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium tabular-nums hover:bg-muted active:bg-accent"
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <FieldGrid>
                    {required.includes("solute") && (
                        <NumberField
                            label={`Solute ${soluteNoun}`}
                            value={soluteValue}
                            onChange={setSoluteValue}
                            unit={soluteUnit}
                            units={units.solute}
                            onUnitChange={setSoluteUnit}
                            step="0.001"
                            min={0}
                            placeholder="e.g. 25"
                            hint={type === "vv" ? "Volume of the liquid being dissolved." : "Mass of the substance being dissolved."}
                            error={negativeError(soluteValue)}
                        />
                    )}
                    {required.includes("solution") && (
                        <NumberField
                            label={`Total solution ${solutionNoun}`}
                            value={solutionValue}
                            onChange={setSolutionValue}
                            unit={solutionUnit}
                            units={units.solution}
                            onUnitChange={setSolutionUnit}
                            step="0.001"
                            min={0}
                            placeholder="e.g. 500"
                            hint={
                                isVolumeBased
                                    ? "Final volume after making up — solute plus solvent, not solvent alone."
                                    : "Final mass of the whole solution — solute plus solvent."
                            }
                            error={negativeError(solutionValue)}
                        />
                    )}
                    <SelectField
                        label="Round to"
                        value={String(decimals)}
                        onChange={(next) => setDecimals(parseInt(next))}
                        options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} decimal places` }))}
                        hint="Decimal places in the result."
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try a common laboratory solution</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_SOLUTIONS.map((solution) => (
                            <button
                                key={solution.name}
                                type="button"
                                onClick={() => {
                                    changeType(solution.type);
                                    setPercentage(solution.percentage);
                                    setSolveFor("solution");
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-muted active:bg-accent"
                            >
                                {solution.name}
                                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                                    {solution.percentage}% {solution.type === "wv" ? "w/v" : solution.type === "vv" ? "v/v" : "w/w"}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Sets the type and percentage and switches to Total Solution — then enter how much solute you have.
                    </p>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
                    <Formula>{TYPE_FORMULA[type]}</Formula>
                    <div>
                        <ResultRow label={result.details} value={result.value} unit={result.unit} />
                    </div>
                    <LabNotice title="Preparation">
                        {solveFor === "solute" && (
                            <>
                                Weigh/measure <strong>{result.value} {result.unit}</strong> of solute and add to a container.
                                {isVolumeBased ? (
                                    <> Then add solvent to reach a final volume of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                ) : (
                                    <> Then add solvent to reach a final weight of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                )}
                            </>
                        )}
                        {solveFor === "solution" && (
                            <>
                                To prepare <strong>{result.value} {result.unit}</strong> of {percentage}% solution, weigh/measure{" "}
                                <strong>{soluteValue} {soluteUnit}</strong> of solute and add to a container.
                                {isVolumeBased ? <> Then add solvent to reach the final volume.</> : <> Then add solvent to reach the final weight.</>}
                            </>
                        )}
                        {solveFor === "solvent" && (
                            <>
                                Add <strong>{soluteValue} {soluteUnit}</strong> of solute to a container, then add{" "}
                                <strong>{result.value} {result.unit}</strong> of solvent to reach
                                {isVolumeBased ? (
                                    <> a final volume of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                ) : (
                                    <> a final weight of <strong>{solutionValue} {solutionUnit}</strong>.</>
                                )}
                            </>
                        )}
                        {solveFor === "percentage" && (
                            <>
                                The solution contains <strong>{soluteValue} {soluteUnit}</strong> of solute in{" "}
                                <strong>{solutionValue} {solutionUnit}</strong> of total solution, which corresponds to{" "}
                                <strong>{result.value} {result.unit}</strong>.
                            </>
                        )}
                    </LabNotice>
                </CalcSection>
            )}

            <CalcSection title="Common percentage conversions" description="How much solute is in 100 parts of solution at each strength.">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[520px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-4 py-2 font-medium sm:px-3">Percentage</th>
                                <th className="px-3 py-2 font-medium">w/v (g/100mL)</th>
                                <th className="px-3 py-2 font-medium">v/v (mL/100mL)</th>
                                <th className="px-3 py-2 font-medium">w/w (g/100g)</th>
                                <th className="px-3 py-2 font-medium">Common Use</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CONVERSION_ROWS.map((row) => (
                                <tr key={row.percentage} className="border-b border-border/60 last:border-b-0">
                                    <td className="px-4 py-2.5 font-semibold text-primary sm:px-3">{row.percentage}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{row.wv}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{row.vv}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{row.ww}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{row.use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>{TYPE_FORMULA.wv}</Formula>
                <Formula>{TYPE_FORMULA.vv}</Formula>
                <Formula>{TYPE_FORMULA.ww}</Formula>
                <Formula>Solute = (% / 100) × solution · Solution = solute / (% / 100) · Solvent = solution − solute</Formula>
                <p>
                    The solute is the substance being dissolved, the solvent is what it is dissolved in (usually
                    water), and the solution is the finished mixture of both. A percentage always refers to the
                    total solution, so a 0.9% (w/v) saline holds 0.9 g of NaCl in every 100 mL of finished
                    solution — not in 100 mL of water.
                </p>
                <p>
                    The calculator uses the numbers exactly as entered and does not convert between units, so
                    enter solute and solution in matching units (g with mL for w/v, mL with mL for v/v, g with g
                    for w/w).
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between w/v, v/v and w/w?",
                        a: "w/v is grams of solute per 100 mL of solution (solids in liquids, e.g. saline). v/v is millilitres of solute per 100 mL of solution (liquids in liquids, e.g. 70% ethanol). w/w is grams of solute per 100 g of solution (both weighed, e.g. ointments and concentrated acids).",
                    },
                    {
                        q: "Why does the solvent amount not equal solution minus solute for w/v?",
                        a: "Volumes are not always additive — many solutes change the volume when they dissolve, and in w/v you subtract a mass from a volume. In practice you dissolve the solute and make up to the final volume, rather than measuring the solvent separately. The solvent figure is only a rough guide outside w/w.",
                    },
                    {
                        q: "Do I need to convert units first?",
                        a: "Yes. This calculator does not convert units — it treats the numbers as entered and labels the answer with the unit you picked. For a true percentage, enter solute in g and solution in mL (w/v), mL and mL (v/v), or g and g (w/w).",
                    },
                    {
                        q: "Can a v/v percentage be above 100%?",
                        a: "No — the solute cannot occupy more than the whole solution. A w/v figure can exceed 100% for very soluble solids, since mass and volume are different quantities.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
