"use client";

import { useMemo, useState } from "react";
import { Activity, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    ModeSwitch,
    AdSlot,
    type ModeOption,
} from "@/components/calculators";

type SolveFor = "pH" | "pKa" | "ratio" | "concentrations";
type ConcUnit = "M" | "mM" | "μM" | "nM";

const MODES: ModeOption<SolveFor>[] = [
    { value: "pH", label: "pH", description: "From pKa and the base : acid ratio" },
    { value: "pKa", label: "pKa", description: "From pH and the ratio" },
    { value: "ratio", label: "Ratio [A⁻]/[HA]", description: "From pH and pKa" },
    { value: "concentrations", label: "From concentrations", description: "Ratio from [HA] and [A⁻]" },
];

const COMMON_RATIOS = [
    { label: "1:10", value: "0.1" },
    { label: "1:4", value: "0.25" },
    { label: "1:2", value: "0.5" },
    { label: "1:1", value: "1" },
    { label: "2:1", value: "2" },
    { label: "4:1", value: "4" },
    { label: "10:1", value: "10" },
];

const COMMON_BUFFERS = [
    { name: "Acetic Acid", pKa: "4.76", range: "3.8-5.8" },
    { name: "Phosphate (pKa2)", pKa: "7.20", range: "6.2-8.2" },
    { name: "HEPES", pKa: "7.55", range: "6.8-8.2" },
    { name: "Tris", pKa: "8.06", range: "7.0-9.0" },
    { name: "Borate", pKa: "9.24", range: "8.2-10.2" },
];

type Result = {
    /** Main value, formatted exactly as the previous page did (ratio 4 dp, otherwise 2 dp). */
    value: string;
    ratio: number;
    acidPct: string;
    basePct: string;
    bufferCapacity: string;
    bufferCapacityNumber: number;
    /** Only in "concentrations" mode, when a pKa was entered. */
    derivedPH: string | null;
    working: { label: string; value: string }[];
};

/**
 * Henderson–Hasselbalch, carried over line for line from the previous page:
 * same guards, same formulas, same toFixed precisions. It now runs on every
 * keystroke instead of on a Calculate button, and returns a message instead of
 * a result when the inputs cannot give one.
 */
function solve(
    solveFor: SolveFor,
    pH: string,
    pKa: string,
    ratio: string,
    acidConcentration: string,
    baseConcentration: string,
): { result: Result | null; message: string | null } {
    const phValue = parseFloat(pH);
    const pKaValue = parseFloat(pKa);
    const ratioValue = parseFloat(ratio);
    const acidConc = parseFloat(acidConcentration);
    const baseConc = parseFloat(baseConcentration);

    let calculatedValue: number;
    let acidFraction: number;
    let baseFraction: number;
    let derivedPH: string | null = null;
    const working: { label: string; value: string }[] = [];

    switch (solveFor) {
        case "pH":
            if (isNaN(pKaValue) || isNaN(ratioValue) || ratioValue <= 0) {
                return { result: null, message: "Enter a pKa and a base : acid ratio greater than 0." };
            }
            calculatedValue = pKaValue + Math.log10(ratioValue);
            acidFraction = 1 / (1 + ratioValue);
            baseFraction = ratioValue / (1 + ratioValue);
            working.push({
                label: "pH = pKa + log₁₀(ratio)",
                value: `${pKaValue} + log₁₀(${ratioValue}) = ${pKaValue} + (${Math.log10(ratioValue).toFixed(4)}) = ${calculatedValue.toFixed(2)}`,
            });
            break;

        case "pKa":
            if (isNaN(phValue) || isNaN(ratioValue) || ratioValue <= 0) {
                return { result: null, message: "Enter a pH and a base : acid ratio greater than 0." };
            }
            calculatedValue = phValue - Math.log10(ratioValue);
            acidFraction = 1 / (1 + ratioValue);
            baseFraction = ratioValue / (1 + ratioValue);
            working.push({
                label: "pKa = pH − log₁₀(ratio)",
                value: `${phValue} − (${Math.log10(ratioValue).toFixed(4)}) = ${calculatedValue.toFixed(2)}`,
            });
            break;

        case "ratio":
            if (isNaN(phValue) || isNaN(pKaValue)) {
                return { result: null, message: "Enter a pH and a pKa to find the ratio." };
            }
            calculatedValue = Math.pow(10, phValue - pKaValue);
            acidFraction = 1 / (1 + calculatedValue);
            baseFraction = calculatedValue / (1 + calculatedValue);
            working.push({
                label: "[A⁻]/[HA] = 10^(pH − pKa)",
                value: `10^(${phValue} − ${pKaValue}) = 10^${(phValue - pKaValue).toFixed(4)} = ${calculatedValue.toFixed(4)}`,
            });
            break;

        case "concentrations":
            if (isNaN(acidConc) || isNaN(baseConc) || acidConc < 0 || baseConc < 0) {
                return { result: null, message: "Enter both concentrations, [HA] and [A⁻] (0 or more)." };
            }
            if (acidConc === 0 && baseConc === 0) {
                return { result: null, message: "Both concentrations cannot be zero." };
            }
            calculatedValue = acidConc === 0 ? Infinity : baseConc / acidConc;
            acidFraction = acidConc / (acidConc + baseConc);
            baseFraction = baseConc / (acidConc + baseConc);
            if (!isNaN(pKaValue)) {
                const ph = pKaValue + Math.log10(calculatedValue);
                // The old page wrote this into the pH box; -Infinity (no base) showed as blank.
                derivedPH = Number.isFinite(ph) ? ph.toFixed(2) : null;
            }
            if (Number.isFinite(calculatedValue)) {
                working.push({
                    label: "[A⁻]/[HA]",
                    value: `${baseConc} ÷ ${acidConc} = ${calculatedValue.toFixed(4)}`,
                });
                if (derivedPH !== null) {
                    working.push({
                        label: "pH = pKa + log₁₀(ratio)",
                        value: `${pKaValue} + (${Math.log10(calculatedValue).toFixed(4)}) = ${derivedPH}`,
                    });
                }
            }
            break;
    }

    const bufferCapacity = 2.303 * (acidFraction * baseFraction) * 100;

    if (calculatedValue === Infinity || calculatedValue === -Infinity || isNaN(calculatedValue)) {
        return {
            result: null,
            message:
                solveFor === "concentrations"
                    ? "[HA] is 0, so the ratio is infinite — enter an acid concentration above 0."
                    : "These values give an infinite ratio — check the pH and pKa.",
        };
    }

    const isConc = solveFor === "concentrations";
    working.push(
        {
            label: isConc ? "% HA = [HA] ÷ ([HA] + [A⁻]) × 100" : "% HA = 1 ÷ (1 + ratio) × 100",
            value: `${(acidFraction * 100).toFixed(1)}%`,
        },
        {
            label: isConc ? "% A⁻ = [A⁻] ÷ ([HA] + [A⁻]) × 100" : "% A⁻ = ratio ÷ (1 + ratio) × 100",
            value: `${(baseFraction * 100).toFixed(1)}%`,
        },
        {
            label: "Buffer capacity = 2.303 × α(HA) × α(A⁻) × 100",
            value: `2.303 × ${acidFraction.toFixed(4)} × ${baseFraction.toFixed(4)} × 100 = ${bufferCapacity.toFixed(1)}%`,
        },
    );

    return {
        result: {
            value: solveFor === "ratio" ? calculatedValue.toFixed(4) : calculatedValue.toFixed(2),
            ratio: calculatedValue,
            acidPct: (acidFraction * 100).toFixed(1),
            basePct: (baseFraction * 100).toFixed(1),
            bufferCapacity: bufferCapacity.toFixed(1),
            bufferCapacityNumber: parseFloat(bufferCapacity.toFixed(1)),
            derivedPH,
            working,
        },
        message: null,
    };
}

/** A chip button — the kit has no chip group. */
function Chip({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={
                "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium tabular-nums transition-colors " +
                (selected ? "border-primary bg-primary/10 text-primary" : "bg-background hover:bg-muted active:bg-accent")
            }
        >
            {selected && <Check className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}

export default function PkaPhCalculator() {
    const [pH, setPH] = useState("");
    const [pKa, setPKa] = useState("");
    const [ratio, setRatio] = useState("");
    const [acidConcentration, setAcidConcentration] = useState("");
    const [baseConcentration, setBaseConcentration] = useState("");
    const [solveFor, setSolveFor] = useState<SolveFor>("pH");
    const [concentrationUnit, setConcentrationUnit] = useState<ConcUnit>("M");

    const { result, message } = useMemo(
        () => solve(solveFor, pH, pKa, ratio, acidConcentration, baseConcentration),
        [solveFor, pH, pKa, ratio, acidConcentration, baseConcentration],
    );

    const changeMode = (next: SolveFor) => {
        // The previous page kept the ratio box in sync with the concentrations and
        // wrote the derived pH into the pH box, so both carried over to the other
        // modes. Preserve that hand-off.
        if (solveFor === "concentrations" && result) {
            if (Number.isFinite(result.ratio)) setRatio(result.ratio.toFixed(4));
            if (result.derivedPH !== null) setPH(result.derivedPH);
        }
        setSolveFor(next);
    };

    const reset = () => {
        setPH("");
        setPKa("");
        setRatio("");
        setAcidConcentration("");
        setBaseConcentration("");
        setSolveFor("pH");
    };

    const negativeError = (raw: string) => {
        const v = parseFloat(raw);
        return raw !== "" && !isNaN(v) && v < 0 ? "Cannot be negative." : undefined;
    };
    const ratioError = (() => {
        const v = parseFloat(ratio);
        return ratio !== "" && !isNaN(v) && v <= 0 ? "The ratio must be greater than 0 (log of 0 is undefined)." : undefined;
    })();

    const resultLabel = solveFor === "pH" ? "pH" : solveFor === "pKa" ? "pKa" : "Ratio [A⁻]/[HA]";
    const interpretation = result
        ? `${result.basePct}% A⁻ (base) · ${result.acidPct}% HA (acid)` +
          (result.derivedPH !== null ? ` · pH ${result.derivedPH}` : "")
        : undefined;

    return (
        <CalculatorShell
            title="pKa & pH Calculator"
            subtitle="Solve the Henderson–Hasselbalch equation for pH, pKa or the base : acid ratio of a buffer."
            icon={Activity}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A buffer is a weak acid (HA) together with its conjugate base (A⁻). The
                            Henderson–Hasselbalch equation links the solution&apos;s pH, the acid&apos;s
                            pKa (the pH at which it is half ionised) and the ratio of the two forms.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Preparing a buffer to a target pH",
                                "Working out how ionised a drug is at a given pH",
                                "Checking a buffer's composition from its concentrations",
                            ]}
                        />
                        <div>
                            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Quick reference
                            </p>
                            <div className="mt-1">
                                <ResultRow label="pH = pKa" value="[A⁻] = [HA]" />
                                <ResultRow label="pH = pKa − 1" value="[A⁻]/[HA] = 0.1" />
                                <ResultRow label="pH = pKa + 1" value="[A⁻]/[HA] = 10" />
                            </div>
                        </div>
                        <CalcList
                            tone="caution"
                            title="Where it stops being reliable"
                            items={[
                                "Very dilute buffers, or very strong acids and bases",
                                "Concentrated solutions, where activity differs from concentration",
                                "Outside roughly pKa ± 1, where buffering is weak",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground/90">What do you want to calculate?</p>
                <ModeSwitch label="What do you want to calculate?" value={solveFor} onChange={changeMode} options={MODES} />
            </div>

            <ResultCard
                label={resultLabel}
                value={result?.value ?? null}
                interpretation={interpretation}
                tone="neutral"
                empty={message ?? "Enter the values below to see the result."}
                // Extreme ratios (e.g. 10^14) are long; let them wrap on a phone.
                className="[overflow-wrap:anywhere]"
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    {(solveFor === "pKa" || solveFor === "ratio") && (
                        <NumberField
                            label="pH"
                            value={pH}
                            onChange={setPH}
                            step="0.01"
                            min={0}
                            max={14}
                            placeholder="e.g. 7.4"
                            hint="Usually 0–14. Blood is 7.35–7.45."
                        />
                    )}
                    <NumberField
                        label={solveFor === "concentrations" ? "pKa (optional, to get pH)" : "pKa"}
                        value={pKa}
                        onChange={setPKa}
                        step="0.01"
                        placeholder="e.g. 4.76"
                        hint="The acid's pKa — tap a common buffer below to fill it in."
                    />
                    {solveFor !== "ratio" && solveFor !== "concentrations" && (
                        <NumberField
                            label="Ratio [A⁻]/[HA]"
                            value={ratio}
                            onChange={setRatio}
                            step="0.001"
                            min={0}
                            placeholder="e.g. 1"
                            hint="Base form ÷ acid form. 1 means equal amounts."
                            error={ratioError}
                        />
                    )}
                    {solveFor === "concentrations" && (
                        <>
                            <NumberField
                                label="[HA] — acid concentration"
                                value={acidConcentration}
                                onChange={setAcidConcentration}
                                units={["M", "mM", "μM", "nM"]}
                                unit={concentrationUnit}
                                onUnitChange={(next) => setConcentrationUnit(next as ConcUnit)}
                                step="0.001"
                                min={0}
                                placeholder="e.g. 0.1"
                                hint="The weak acid (protonated form)."
                                error={negativeError(acidConcentration)}
                            />
                            <NumberField
                                label="[A⁻] — base concentration"
                                value={baseConcentration}
                                onChange={setBaseConcentration}
                                unit={concentrationUnit}
                                step="0.001"
                                min={0}
                                placeholder="e.g. 0.05"
                                hint="The conjugate base (salt), in the same unit as [HA]."
                                error={negativeError(baseConcentration)}
                            />
                        </>
                    )}
                </FieldGrid>

                {solveFor !== "ratio" && solveFor !== "concentrations" && (
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Common ratios [A⁻] : [HA]</p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_RATIOS.map((r) => (
                                <Chip key={r.label} selected={ratio === r.value} onClick={() => setRatio(r.value)}>
                                    {r.label}
                                </Chip>
                            ))}
                        </div>
                    </div>
                )}

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Buffer composition">
                    <div>
                        <ResultRow label="% HA (acid form)" value={`${result.acidPct}%`} />
                        <ResultRow label="% A⁻ (base form)" value={`${result.basePct}%`} />
                        {result.derivedPH !== null && <ResultRow label="pH (from pKa)" value={result.derivedPH} />}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">Relative buffer capacity</span>
                            <span className="font-semibold tabular-nums text-foreground">{result.bufferCapacity}%</span>
                        </div>
                        <Progress
                            value={Math.min(100, result.bufferCapacityNumber)}
                            indicatorClassName="bg-emerald-500"
                            aria-label="Relative buffer capacity"
                        />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Working" description="The numbers you entered, substituted into each formula.">
                    <div className="divide-y divide-border/70">
                        {result.working.map((row) => (
                            <div key={row.label} className="py-3 first:pt-0 last:pb-0">
                                <p className="text-xs text-muted-foreground">{row.label}</p>
                                <p className="mt-1 font-mono text-[13px] text-foreground [overflow-wrap:anywhere]">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Common biological buffers" description="Tap a buffer to use its pKa and solve for pH.">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[18rem] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">Buffer</th>
                                <th className="py-2 pr-3 font-medium">pKa</th>
                                <th className="py-2 font-medium">pH range</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COMMON_BUFFERS.map((buffer) => {
                                const selected = pKa === buffer.pKa;
                                return (
                                    <tr key={buffer.name} className="border-b border-border/70 last:border-b-0">
                                        <td className="py-1 pr-3">
                                            <button
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() => {
                                                    setPKa(buffer.pKa);
                                                    setSolveFor("pH");
                                                }}
                                                className={
                                                    "flex min-h-[40px] w-full items-center gap-1.5 rounded-lg px-2 text-left font-medium transition-colors " +
                                                    (selected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")
                                                }
                                            >
                                                {selected && <Check className="h-3.5 w-3.5" />}
                                                {buffer.name}
                                            </button>
                                        </td>
                                        <td className="py-1 pr-3 font-semibold tabular-nums text-primary">{buffer.pKa}</td>
                                        <td className="py-1 tabular-nums text-muted-foreground">{buffer.range}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>pH = pKa + log₁₀([A⁻] / [HA])</Formula>
                <p>
                    [A⁻] is the conjugate base (ionised) form and [HA] the acid (un-ionised) form. Rearranged,
                    pKa = pH − log₁₀(ratio) and [A⁻]/[HA] = 10^(pH − pKa).
                </p>
                <Formula>% HA = 1 / (1 + ratio) × 100 &nbsp;·&nbsp; % A⁻ = ratio / (1 + ratio) × 100</Formula>
                <Formula>Relative buffer capacity = 2.303 × α(HA) × α(A⁻) × 100</Formula>
                <p>
                    α is the fraction of each form. The product α(HA)·α(A⁻) is largest when the two forms
                    are equal (pH = pKa), which is why a buffer works best within about one pH unit of its pKa.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which way round is the ratio?",
                        a: "Base over acid: [A⁻]/[HA]. A ratio above 1 means more of the base form, so the pH is above the pKa; below 1 means more acid form and a pH below the pKa.",
                    },
                    {
                        q: "Does the concentration unit matter?",
                        a: "No, as long as [HA] and [A⁻] are in the same unit — only their ratio enters the equation. The unit selector changes both fields together.",
                    },
                    {
                        q: "Why can't the ratio be zero?",
                        a: "log₁₀(0) is undefined (it heads to minus infinity). A solution with no base form at all is not a buffer, so the equation does not apply.",
                    },
                    {
                        q: "What does the relative buffer capacity show?",
                        a: "It is 2.303 × α(HA) × α(A⁻) × 100, which peaks at 57.6% when pH = pKa. Use it to compare compositions, not as an absolute buffer capacity — that also depends on the total buffer concentration.",
                    },
                    {
                        q: "How is this used for drugs?",
                        a: "For a weak acid drug, % A⁻ is the ionised fraction at that pH. The un-ionised fraction (% HA) is the one that crosses lipid membranes, so it predicts absorption and renal trapping.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
