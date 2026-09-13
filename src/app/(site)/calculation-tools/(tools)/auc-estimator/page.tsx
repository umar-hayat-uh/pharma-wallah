"use client";

import { useMemo, useState } from "react";
import { Activity, LineChart, Plus, RefreshCw, Trash2, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    type ResultTone,
} from "@/components/calculators";

type AUCUnit = "mg·h/L" | "μg·h/mL" | "ng·h/mL";
type Method = "single" | "trapezoidal" | "clearance";

interface ConcentrationPoint {
    time: number;
    concentration: number;
}

/** A row as typed. Kept as strings so a half-typed or cleared field is not silently a number. */
interface PointRow {
    id: number;
    time: string;
    concentration: string;
}

const METHODS: ModeOption<Method>[] = [
    { value: "single", label: "From dose and CL", description: "AUC = Dose × F / CL", icon: Zap },
    { value: "trapezoidal", label: "Trapezoidal", description: "From concentration–time data", icon: LineChart },
    { value: "clearance", label: "Multiple doses", description: "Not available yet", icon: Activity },
];

const UNITS: AUCUnit[] = ["mg·h/L", "μg·h/mL", "ng·h/mL"];

/** The concentration unit that pairs with each AUC unit (a label only — nothing is converted). */
const CONC_UNIT: Record<AUCUnit, string> = {
    "mg·h/L": "mg/L",
    "μg·h/mL": "μg/mL",
    "ng·h/mL": "ng/mL",
};

const DEFAULT_POINTS: ConcentrationPoint[] = [
    { time: 0, concentration: 0 },
    { time: 1, concentration: 8 },
    { time: 2, concentration: 6 },
    { time: 4, concentration: 4 },
    { time: 8, concentration: 2 },
];

const SAMPLE_PROFILES: { name: string; points: ConcentrationPoint[] }[] = [
    {
        name: "IV Bolus",
        points: [
            { time: 0, concentration: 10 },
            { time: 1, concentration: 8 },
            { time: 2, concentration: 6 },
            { time: 4, concentration: 4 },
            { time: 8, concentration: 2 },
        ],
    },
    {
        name: "Oral IR",
        points: [
            { time: 0, concentration: 0 },
            { time: 1, concentration: 4 },
            { time: 2, concentration: 6 },
            { time: 4, concentration: 4 },
            { time: 8, concentration: 2 },
        ],
    },
    {
        name: "SR",
        points: [
            { time: 0, concentration: 0 },
            { time: 2, concentration: 3 },
            { time: 4, concentration: 5 },
            { time: 8, concentration: 4 },
            { time: 12, concentration: 2 },
        ],
    },
];

const DEFAULTS = { dose: "100", clearance: "5", bioavailability: "100" };

let nextRowId = 1;
const toRows = (points: ConcentrationPoint[]): PointRow[] =>
    points.map((p) => ({ id: nextRowId++, time: String(p.time), concentration: String(p.concentration) }));

/* Exposure bands (unchanged). Tones added for the result card. */
function getAUCInterpretation(aucValue: number): { text: string; tone: ResultTone } {
    if (aucValue < 10) return { text: "Low exposure – consider dose increase", tone: "warning" };
    if (aucValue < 50) return { text: "Moderate exposure – therapeutic range", tone: "success" };
    if (aucValue < 100) return { text: "High exposure – monitor for toxicity", tone: "warning" };
    return { text: "Very high exposure – toxicity risk", tone: "danger" };
}

/** A finite number from a typed string, or null. */
function parse(raw: string): number | null {
    if (raw.trim() === "") return null;
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : null;
}

function numberError(raw: string, { allowZero, allowNegative }: { allowZero: boolean; allowNegative?: boolean }) {
    if (raw.trim() === "") return "Required.";
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value < 0 && !allowNegative) return "Cannot be negative.";
    if (value === 0 && !allowZero) return "Must be greater than zero.";
    return undefined;
}

/** Plain number for a formula label: 1.2500 → "1.25". */
const plain = (value: number, digits = 4) => String(Number(value.toFixed(digits)));

export default function AUCCalculator() {
    const [method, setMethod] = useState<Method>("trapezoidal");
    const [dose, setDose] = useState(DEFAULTS.dose);
    const [clearance, setClearance] = useState(DEFAULTS.clearance);
    const [bioavailability, setBioavailability] = useState(DEFAULTS.bioavailability);
    const [rows, setRows] = useState<PointRow[]>(() => toRows(DEFAULT_POINTS));
    const [units, setUnits] = useState<AUCUnit>("mg·h/L");

    const concUnit = CONC_UNIT[units];

    /*
     * Derived with useMemo instead of a useEffect writing into state. The old
     * page sorted the concentration array IN PLACE while rendering its chart;
     * that array is frozen by the chart library, so editing any row or loading
     * an example profile threw "Cannot assign to read only property" and
     * crashed the page. Sorting now happens on a copy. It also showed
     * "AUC 0.00 – Low exposure" (or NaN) for missing inputs; those show the
     * empty state. The trapezoidal and extrapolation arithmetic is unchanged.
     */
    const single = useMemo(() => {
        const doseVal = parse(dose);
        const cl = parse(clearance);
        const fPct = parse(bioavailability);
        if (doseVal === null || cl === null || fPct === null) return null;
        if (doseVal <= 0 || cl <= 0 || fPct <= 0) return null;
        const f = fPct / 100;
        const auc = (doseVal * f) / cl;
        return Number.isFinite(auc) ? { auc, f } : null;
    }, [dose, clearance, bioavailability]);

    const trapezoid = useMemo(() => {
        const points: ConcentrationPoint[] = [];
        for (let i = 0; i < rows.length; i++) {
            const time = parse(rows[i].time);
            const concentration = parse(rows[i].concentration);
            if (time === null || concentration === null || concentration < 0) return null;
            points.push({ time, concentration });
        }

        // Sort points by time
        const sortedPoints = [...points].sort((a, b) => a.time - b.time);

        // Linear trapezoidal rule
        let calculatedAUC = 0;
        const segments: { from: number; to: number; timeDiff: number; avgConc: number; area: number }[] = [];
        for (let i = 1; i < sortedPoints.length; i++) {
            const prev = sortedPoints[i - 1];
            const curr = sortedPoints[i];
            const timeDiff = curr.time - prev.time;
            const avgConc = (prev.concentration + curr.concentration) / 2;
            calculatedAUC += avgConc * timeDiff;
            segments.push({ from: prev.time, to: curr.time, timeDiff, avgConc, area: avgConc * timeDiff });
        }

        // Extrapolate to infinity using terminal elimination rate
        let calculatedAUCinf = 0;
        let ke: number | null = null;
        let tail: number | null = null;
        let noTailReason = "";
        if (sortedPoints.length >= 3) {
            const lastPoint = sortedPoints[sortedPoints.length - 1];
            const secondLast = sortedPoints[sortedPoints.length - 2];

            if (lastPoint.concentration > 0) {
                const kel =
                    Math.log(secondLast.concentration / lastPoint.concentration) /
                    (lastPoint.time - secondLast.time);
                if (kel > 0) {
                    ke = kel;
                    const aucTail = lastPoint.concentration / kel;
                    tail = aucTail;
                    calculatedAUCinf = calculatedAUC + aucTail;
                } else {
                    noTailReason = "the last two concentrations are not falling, so no elimination rate can be fitted.";
                }
            } else {
                noTailReason = "the last concentration is zero, so nothing is left to extrapolate.";
            }
        } else {
            noTailReason = "at least three time points are needed.";
        }

        if (!Number.isFinite(calculatedAUC)) return null;

        // The old page showed AUC₀→∞ only when it exceeded AUC₀→t.
        const showInf = calculatedAUCinf > calculatedAUC;
        if (!showInf && !noTailReason) noTailReason = "the extrapolated tail is zero.";

        return {
            auc: calculatedAUC,
            aucInf: showInf ? calculatedAUCinf : null,
            ke: showInf ? ke : null,
            tail: showInf ? tail : null,
            noTailReason,
            segments,
            sortedPoints,
            last: sortedPoints[sortedPoints.length - 1],
            secondLast: sortedPoints[sortedPoints.length - 2],
        };
    }, [rows]);

    const auc = method === "single" ? single?.auc ?? null : method === "trapezoidal" ? trapezoid?.auc ?? null : null;
    const interpretation = auc !== null ? getAUCInterpretation(auc) : null;

    const updateRow = (id: number, field: "time" | "concentration", value: string) => {
        setRows((previous) => previous.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const addConcentrationPoint = () => {
        setRows((previous) => {
            // A step after the latest time entered (the old page added lastTime + 1).
            let lastTime = 0;
            previous.forEach((row) => {
                const t = parse(row.time);
                if (t !== null && t > lastTime) lastTime = t;
            });
            return [...previous, { id: nextRowId++, time: String(lastTime + 1), concentration: "0" }];
        });
    };

    const removeConcentrationPoint = (id: number) => {
        setRows((previous) => (previous.length > 2 ? previous.filter((row) => row.id !== id) : previous));
    };

    const loadSample = (profile: (typeof SAMPLE_PROFILES)[number]) => {
        setMethod("trapezoidal");
        setRows(toRows(profile.points));
    };

    const reset = () => {
        setDose(DEFAULTS.dose);
        setClearance(DEFAULTS.clearance);
        setBioavailability(DEFAULTS.bioavailability);
        setRows(toRows(DEFAULT_POINTS));
    };

    const emptyText =
        method === "single"
            ? "Enter a dose, a clearance and the bioavailability to see the AUC."
            : method === "trapezoidal"
              ? "Enter a time and a concentration (not negative) for every point."
              : "This method has no inputs yet — use From dose and CL, or Trapezoidal.";

    return (
        <CalculatorShell
            title="AUC Calculator"
            subtitle="Works out the area under the concentration–time curve (AUC) from measured levels with the trapezoidal rule, or from dose and clearance."
            icon={LineChart}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>AUC — area under the curve</strong> — is the total drug exposure: the
                            plasma concentration added up over time. It is the basis of bioavailability,
                            bioequivalence and clearance calculations.
                        </p>
                        <CalcList
                            title="Where AUC is used"
                            items={[
                                "Bioequivalence: 90% CI of AUC ratio 0.8-1.25",
                                "Dose adjustment: AUC proportional to dose",
                                "Toxicity monitoring: High AUC indicates risk",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "The unit selector only labels the answer — enter concentrations in the matching unit",
                                "The exposure bands are generic and ignore the unit and the drug",
                                "Extrapolation uses only the last two points, which is sensitive to a noisy last sample",
                                "The linear trapezoidal rule overestimates the falling part of the curve",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={method} onChange={setMethod} options={METHODS} />

            <ResultCard
                label={method === "trapezoidal" ? "Area under curve, to last sample" : "Area under curve"}
                value={auc !== null ? auc.toFixed(2) : null}
                unit={units}
                interpretation={interpretation?.text}
                tone={interpretation?.tone ?? "neutral"}
                empty={emptyText}
            />

            <CalcSection title="Inputs">
                <SelectField
                    label="AUC units"
                    value={units}
                    onChange={(next) => setUnits(next as AUCUnit)}
                    options={UNITS}
                    hint={`Labels the result. Enter concentrations in ${concUnit} — nothing is converted.`}
                />

                {method === "single" && (
                    <FieldGrid>
                        <NumberField
                            label="Dose (mg)"
                            value={dose}
                            onChange={setDose}
                            unit="mg"
                            min={0}
                            error={dose.trim() === "" ? undefined : numberError(dose, { allowZero: false })}
                            hint="The single dose given."
                        />
                        <NumberField
                            label="Clearance CL (L/h)"
                            value={clearance}
                            onChange={setClearance}
                            unit="L/h"
                            min={0}
                            error={clearance.trim() === "" ? undefined : numberError(clearance, { allowZero: false })}
                            hint="Total body clearance; adults often 1–10 L/h."
                        />
                        <NumberField
                            label="Bioavailability F (%)"
                            value={bioavailability}
                            onChange={setBioavailability}
                            unit="%"
                            min={0}
                            error={
                                bioavailability.trim() === ""
                                    ? undefined
                                    : numberError(bioavailability, { allowZero: false })
                            }
                            hint="100 for an IV dose; lower for most oral doses."
                        />
                    </FieldGrid>
                )}

                {method === "trapezoidal" && (
                    <div className="space-y-3">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Concentration–time data, in any order — points are sorted by time before
                            calculating. At least two points.
                        </p>
                        <div className="space-y-3">
                            {rows.map((row, index) => (
                                <div
                                    key={row.id}
                                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-border/70 bg-muted/30 p-2.5 sm:gap-3 sm:p-3"
                                >
                                    <NumberField
                                        label={`Time ${index + 1} (h)`}
                                        value={row.time}
                                        onChange={(value) => updateRow(row.id, "time", value)}
                                        step="0.1"
                                        error={numberError(row.time, { allowZero: true, allowNegative: true })}
                                    />
                                    <NumberField
                                        label={`Conc. (${concUnit})`}
                                        value={row.concentration}
                                        onChange={(value) => updateRow(row.id, "concentration", value)}
                                        step="0.001"
                                        min={0}
                                        error={numberError(row.concentration, { allowZero: true })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeConcentrationPoint(row.id)}
                                        disabled={rows.length <= 2}
                                        aria-label={`Remove point ${index + 1}`}
                                        className="mt-[26px] grid h-12 w-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-background disabled:hover:text-muted-foreground"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            onClick={addConcentrationPoint}
                            className="w-full border-dashed"
                        >
                            <Plus />
                            Add point
                        </Button>
                    </div>
                )}

                {method === "clearance" && (
                    <LabNotice tone="info" title="Not available yet">
                        The multiple-dose method has no inputs in this tool, so it cannot give a result. For a
                        dosing interval at steady state, AUC over one interval equals Dose × F / CL — use{" "}
                        <strong>From dose and CL</strong> with the maintenance dose, or{" "}
                        <strong>Trapezoidal</strong> with levels measured across one interval.
                    </LabNotice>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Try an example profile (fills the trapezoidal method)
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PROFILES.map((profile) => (
                            <button
                                key={profile.name}
                                type="button"
                                onClick={() => loadSample(profile)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {profile.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">
                                    {profile.points.length} time points
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {method === "single" && single && (
                <CalcSection title="Working">
                    <div>
                        <ResultRow
                            label={`AUC = (${dose} × ${plain(single.f)}) ÷ ${clearance}`}
                            value={single.auc.toFixed(2)}
                            unit={units}
                        />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        For a single dose this is already the total exposure, AUC₀→∞ — there is no tail to add.
                    </p>
                </CalcSection>
            )}

            {method === "trapezoidal" && trapezoid && (
                <CalcSection title="Working" description="Each trapezoid's area is the mean concentration × the time step.">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[18rem] text-sm tabular-nums">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="py-2 pr-3 font-medium">Interval (h)</th>
                                    <th className="py-2 pr-3 text-right font-medium">Δt (h)</th>
                                    <th className="py-2 pr-3 text-right font-medium">Mean C</th>
                                    <th className="py-2 text-right font-medium">Area</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trapezoid.segments.map((s, i) => (
                                    <tr key={i} className="border-b border-border/60">
                                        <td className="py-2 pr-3 text-muted-foreground">
                                            {s.from} → {s.to}
                                        </td>
                                        <td className="py-2 pr-3 text-right">{plain(s.timeDiff)}</td>
                                        <td className="py-2 pr-3 text-right">{plain(s.avgConc)}</td>
                                        <td className="py-2 text-right font-medium text-foreground">{s.area.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="py-2 pr-3 font-medium text-foreground" colSpan={3}>
                                        AUC₀→t (sum)
                                    </td>
                                    <td className="py-2 text-right font-semibold text-foreground">
                                        {trapezoid.auc.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {trapezoid.aucInf !== null && trapezoid.ke !== null && trapezoid.tail !== null ? (
                        <div>
                            <ResultRow
                                label={`kₑ = ln(${trapezoid.secondLast.concentration} ÷ ${trapezoid.last.concentration}) ÷ (${trapezoid.last.time} − ${trapezoid.secondLast.time})`}
                                value={trapezoid.ke.toFixed(3)}
                                unit="h⁻¹"
                            />
                            <ResultRow
                                label={`Tail = ${trapezoid.last.concentration} ÷ kₑ`}
                                value={trapezoid.tail.toFixed(2)}
                                unit={units}
                            />
                            <ResultRow
                                label="AUC₀→∞ (extrapolated)"
                                value={trapezoid.aucInf.toFixed(2)}
                                unit={units}
                            />
                        </div>
                    ) : (
                        <LabNotice tone="info">
                            AUC₀→∞ is not extrapolated: {trapezoid.noTailReason}
                        </LabNotice>
                    )}
                </CalcSection>
            )}

            {method === "trapezoidal" && trapezoid && (
                <CalcSection title="Concentration–time profile" description={`Concentration (${concUnit}) against time (h), sorted by time.`}>
                    <div className="-ml-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trapezoid.sortedPoints} margin={{ top: 10, right: 12, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={["dataMin", "dataMax"]}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Time (h)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    width={44}
                                    label={{ value: `Conc (${concUnit})`, angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value} ${concUnit}`, "Concentration"]}
                                    labelFormatter={(label) => `${label} h`}
                                />
                                <Area
                                    type="linear"
                                    dataKey="concentration"
                                    stroke="#2563EB"
                                    fill="#2563EB"
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>AUC₀→t = Σ (Cᵢ₋₁ + Cᵢ) / 2 × (tᵢ − tᵢ₋₁)</Formula>
                <Formula>kₑ = ln(Cₙ₋₁ / Cₙ) / (tₙ − tₙ₋₁)     AUC₀→∞ = AUC₀→t + Cₙ / kₑ</Formula>
                <Formula>AUC = Dose × F / CL</Formula>
                <p>
                    The <strong>linear trapezoidal rule</strong> joins neighbouring samples with straight lines
                    and adds up the trapezoids underneath. Cₙ is the last measured concentration and tₙ its
                    time; kₑ is the elimination rate constant estimated from the last two points.
                </p>
                <p>
                    Sampling stops before the drug is gone, so the area after the last sample (Cₙ / kₑ) is
                    added to give the total exposure AUC₀→∞. From dose and clearance, F is the bioavailable
                    fraction (100% = 1) and CL the clearance in L/h, giving mg·h/L.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between AUC₀→t and AUC₀→∞?",
                        a: "AUC₀→t is the area up to the last blood sample. AUC₀→∞ adds an estimate of the area after it, assuming the level keeps falling at the same first-order rate. Bioavailability and clearance calculations need AUC₀→∞.",
                    },
                    {
                        q: "Why is there no AUC₀→∞ for my data?",
                        a: "Extrapolation needs at least three points, a last concentration above zero, and a last concentration lower than the one before. If the curve is still rising or flat at the end, no elimination rate can be fitted.",
                    },
                    {
                        q: "Linear or log trapezoidal rule?",
                        a: "This tool uses the linear rule for every interval. On the falling part of a curve it slightly overestimates the area; many regulatory analyses switch to the log-linear rule once concentrations decline.",
                    },
                    {
                        q: "Does changing the unit convert my numbers?",
                        a: "No. The selector only labels the answer. Enter concentrations in the matching unit (mg/L for mg·h/L). Note that 1 mg/L equals 1 μg/mL, but ng/mL values are 1000 times larger.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
