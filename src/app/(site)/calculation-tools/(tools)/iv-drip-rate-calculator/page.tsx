"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplet, RefreshCw } from "lucide-react";
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
    type ResultTone,
} from "@/components/calculators";

type TimeUnit = "hours" | "minutes";
type DropFactor = "10" | "15" | "20" | "60";

interface InfusionPreset {
    name: string;
    tag: string;
    volume: string;
    time: string;
    timeUnit: TimeUnit;
    dropFactor: DropFactor;
    notes: string;
}

const DROP_FACTORS: { value: DropFactor; label: string; description: string }[] = [
    { value: "10", label: "10 gtt/mL", description: "Blood set — blood & blood products" },
    { value: "15", label: "15 gtt/mL", description: "Macrodrip — standard IV fluids" },
    { value: "20", label: "20 gtt/mL", description: "Standard — general infusions" },
    { value: "60", label: "60 gtt/mL", description: "Microdrip — paediatric / ICU" },
];

/** Common clinical set-ups (unchanged from the original page). */
const PRESETS: InfusionPreset[] = [
    { name: "Standard NS", tag: "1000mL / 8h", volume: "1000", time: "8", timeUnit: "hours", dropFactor: "20", notes: "Routine adult maintenance hydration" },
    { name: "Antibiotic (IVPB)", tag: "100mL / 30m", volume: "100", time: "30", timeUnit: "minutes", dropFactor: "15", notes: "Intermittent secondary infusion" },
    { name: "Pediatric IVF", tag: "100mL / 2h", volume: "100", time: "2", timeUnit: "hours", dropFactor: "60", notes: "Microdrip calibrated for precision" },
    { name: "Emergency Bolus", tag: "500mL / 30m", volume: "500", time: "30", timeUnit: "minutes", dropFactor: "15", notes: "Rapid fluid resuscitation" },
    { name: "Slow KVO Line", tag: "250mL / 24h", volume: "250", time: "24", timeUnit: "hours", dropFactor: "60", notes: "Keep Vein Open patency maintenance" },
];

const QUICK_VOLUMES = ["50", "100", "250", "500", "1000"];

/** Parsed like the original: anything non-numeric or ≤ 0 counts as 0. */
function positive(raw: string): number {
    const value = parseFloat(raw);
    return isNaN(value) || value <= 0 ? 0 : value;
}

/** "Must be > 0" only once the user has typed something. */
function positiveError(raw: string, what: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    return isNaN(value) || value <= 0 ? `${what} must be greater than 0.` : undefined;
}

/** Strips binary floating-point noise (8.3 h → 498 min, not 498.00000000000006). */
function clean(value: number): number {
    return parseFloat(value.toFixed(6));
}

export default function IVDripRateCalculator() {
    const [volume, setVolume] = useState("1000");
    const [time, setTime] = useState("8");
    const [timeUnit, setTimeUnit] = useState<TimeUnit>("hours");
    const [dropFactor, setDropFactor] = useState<DropFactor>("20");
    const [activePreset, setActivePreset] = useState<string | null>("Standard NS (1000mL / 8h)");
    const [copied, setCopied] = useState(false);

    const volNum = positive(volume);
    const timeNum = positive(time);
    const factorNum = positive(dropFactor);

    /* The arithmetic, rounding and rate bands are the original page's, verbatim. */
    const results = useMemo(() => {
        if (volNum <= 0 || timeNum <= 0 || factorNum <= 0) return null;

        const timeInMinutes = timeUnit === "hours" ? timeNum * 60 : timeNum;
        const timeInHours = timeUnit === "hours" ? timeNum : timeNum / 60;

        // Drip rate = (volume in mL × drop factor) / time in minutes
        const rawDripRate = (volNum * factorNum) / timeInMinutes;
        const dripRateRounded = Math.round(rawDripRate);
        const dripRateExact = Math.round(rawDripRate * 10) / 10;

        // Infusion rate = volume in mL / time in hours
        const rawInfusionRate = volNum / timeInHours;
        const infusionRateExact = Math.round(rawInfusionRate * 10) / 10;

        // Bedside count: seconds per drop = 60 / drip rate
        const secondsPerDrop = rawDripRate > 0 ? (60 / rawDripRate).toFixed(1) : "0";

        const totalDrops = Math.round(volNum * factorNum);

        let velocity: { label: string; tone: ResultTone } = { label: "Standard Rate", tone: "neutral" };
        if (rawInfusionRate >= 500) velocity = { label: "Rapid Bolus Rate", tone: "warning" };
        else if (rawInfusionRate <= 25) velocity = { label: "Low / KVO Rate", tone: "neutral" };

        return {
            dripRateRounded,
            dripRateExact,
            infusionRateExact,
            timeInMinutes,
            timeInHours,
            secondsPerDrop,
            totalDrops,
            velocity,
        };
    }, [volNum, timeNum, timeUnit, factorNum]);

    const durationHint =
        timeNum > 0 && timeUnit === "hours"
            ? `Total duration = ${(timeNum * 60).toFixed(0)} minutes`
            : timeNum > 0 && timeUnit === "minutes"
              ? `Total duration = ${(timeNum / 60).toFixed(2)} hours`
              : "Enter the duration in hours or minutes.";

    const selectPreset = (p: InfusionPreset) => {
        setActivePreset(`${p.name} (${p.tag})`);
        setVolume(p.volume);
        setTime(p.time);
        setTimeUnit(p.timeUnit);
        setDropFactor(p.dropFactor);
    };

    const reset = () => {
        setVolume("");
        setTime("");
        setTimeUnit("hours");
        setDropFactor("20");
        setActivePreset(null);
    };

    const copySummary = async () => {
        if (!results) return;
        const summary = `IV Infusion Summary:\n• Drip Rate: ${results.dripRateRounded} gtt/min (${results.dripRateExact} exact)\n• Infusion Pump Rate: ${results.infusionRateExact} mL/hr\n• Timing: 1 drop every ${results.secondsPerDrop} seconds\n• Parameters: ${volNum} mL over ${timeNum} ${timeUnit} (Factor: ${dropFactor} gtt/mL)`;
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            // No clipboard access (insecure context / old WebView): nothing to do.
        }
    };

    return (
        <CalculatorShell
            title="IV Drip Rate Calculator"
            subtitle="Works out the gravity drip rate (drops per minute), the pump rate (mL/hr) and the drop interval for an IV infusion."
            icon={Droplet}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A gravity line is set by counting drops in the drip chamber and adjusting the
                            roller clamp; an electronic pump is programmed in mL/hr. This calculator gives
                            both from the same three values, plus how many seconds should pass between
                            drops so the rate can be checked with a watch.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Enter the fluid volume in mL (or tap a bag size) and the infusion time in hours or minutes.",
                                "Pick the drop factor printed on the IV tubing package: 10 (blood), 15 or 20 (macrodrip), or 60 (microdrip).",
                                "Program a pump in mL/hr, or set a gravity clamp to the gtt/min (count one drop every N seconds).",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Safety"
                            items={[
                                "Independently double-check high-alert IV medicines — electrolytes, vasopressors, heparin, insulin.",
                                "Inspect the insertion site routinely for infiltration, phlebitis or extravasation.",
                                "Gravity rates drift as the bag empties or the patient moves — recount regularly.",
                            ]}
                        />
                        <p className="text-xs italic">
                            Guideline source: Infusion Nurses Society (INS) Standards of Practice &amp; clinical
                            pharmacology nursing manuals.
                        </p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <div className="space-y-3">
                <ResultCard
                    label="Gravity drip rate"
                    value={results ? results.dripRateRounded : null}
                    unit="gtt/min"
                    interpretation={results ? `${results.velocity.label} · ${results.dripRateExact} gtt/min exact` : undefined}
                    tone={results?.velocity.tone ?? "neutral"}
                    empty="Enter the fluid volume and the infusion duration to calculate the rates."
                />

                {results && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border/80 bg-card px-4 py-3.5">
                            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Pump rate
                            </p>
                            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-foreground">
                                <span className="text-2xl font-bold tabular-nums tracking-[-0.03em] sm:text-3xl">
                                    {results.infusionRateExact}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">mL/hr</span>
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/80 bg-card px-4 py-3.5">
                            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                Drop interval
                            </p>
                            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-foreground">
                                <span className="text-sm text-muted-foreground">1 drop every</span>
                                <span className="text-2xl font-bold tabular-nums tracking-[-0.03em] sm:text-3xl">
                                    {results.secondsPerDrop}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">s</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <CalcSection title="Clinical presets" description="Tap one to fill in a typical set-up.">
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => {
                        const selected = activePreset === `${p.name} (${p.tag})`;
                        return (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => selectPreset(p)}
                                aria-pressed={selected}
                                title={p.notes}
                                className={
                                    "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors " +
                                    (selected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "bg-background hover:bg-muted active:bg-accent")
                                }
                            >
                                {selected && <Check className="h-3.5 w-3.5" />}
                                {p.name}
                                <span className="font-mono text-[11px] text-muted-foreground">{p.tag}</span>
                            </button>
                        );
                    })}
                </div>
                {activePreset && (
                    <p className="text-xs text-muted-foreground">
                        {PRESETS.find((p) => `${p.name} (${p.tag})` === activePreset)?.notes}
                    </p>
                )}
            </CalcSection>

            <CalcSection title="Infusion parameters">
                <FieldGrid>
                    <div className="space-y-2">
                        <NumberField
                            label="Total volume"
                            value={volume}
                            onChange={(v) => {
                                setVolume(v);
                                setActivePreset(null);
                            }}
                            unit="mL"
                            step="1"
                            min={1}
                            placeholder="e.g. 1000"
                            hint="The volume in the bag or syringe to be given."
                            error={positiveError(volume, "Volume")}
                        />
                        <div className="flex flex-wrap gap-1.5" aria-label="Common bag sizes">
                            {QUICK_VOLUMES.map((vol) => (
                                <button
                                    key={vol}
                                    type="button"
                                    onClick={() => {
                                        setVolume(vol);
                                        setActivePreset(null);
                                    }}
                                    aria-pressed={volume === vol}
                                    className={
                                        "min-h-[40px] rounded-lg border px-2.5 text-xs font-medium tabular-nums transition-colors " +
                                        (volume === vol
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "bg-background text-muted-foreground hover:bg-muted")
                                    }
                                >
                                    {vol} mL
                                </button>
                            ))}
                        </div>
                    </div>

                    <NumberField
                        label="Infusion duration"
                        value={time}
                        onChange={(v) => {
                            setTime(v);
                            setActivePreset(null);
                        }}
                        units={[
                            { value: "hours", label: "hours" },
                            { value: "minutes", label: "minutes" },
                        ]}
                        unit={timeUnit}
                        onUnitChange={(next) => {
                            setTimeUnit(next as TimeUnit);
                            setActivePreset(null);
                        }}
                        step={timeUnit === "hours" ? "0.25" : "1"}
                        min={0.1}
                        placeholder={timeUnit === "hours" ? "e.g. 8" : "e.g. 60"}
                        hint={durationHint}
                        error={positiveError(time, "Duration")}
                    />
                </FieldGrid>

                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">
                        IV tubing drop factor (gtt/mL)
                    </p>
                    <ModeSwitch
                        label="IV tubing drop factor"
                        value={dropFactor}
                        onChange={(next) => {
                            setDropFactor(next);
                            setActivePreset(null);
                        }}
                        options={DROP_FACTORS}
                    />
                    <p className="text-xs text-muted-foreground">
                        Printed on the IV tubing package. gtt = drops.
                    </p>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {results && (
                <CalcSection title="Working" description="Your values plugged into the formulas.">
                    <div>
                        <ResultRow label="Fluid volume" value={volNum} unit="mL" />
                        <ResultRow
                            label="Total infusion time"
                            value={`${timeNum} ${timeUnit} (${clean(results.timeInMinutes)} min)`}
                        />
                        <ResultRow label="IV set drop calibration" value={dropFactor} unit="drops/mL" />
                        <ResultRow
                            label={`Drip rate = (${volNum} mL × ${dropFactor} gtt/mL) ÷ ${clean(results.timeInMinutes)} min`}
                            value={results.dripRateExact}
                            unit="gtt/min"
                        />
                        <ResultRow label="Rounded to whole drops" value={results.dripRateRounded} unit="gtt/min" />
                        <ResultRow
                            label={`Pump rate = ${volNum} mL ÷ ${clean(results.timeInHours)} h`}
                            value={results.infusionRateExact}
                            unit="mL/hr"
                        />
                        <ResultRow label="Drop interval = 60 s ÷ drip rate" value={results.secondsPerDrop} unit="s" />
                        <ResultRow label="Total drops in the bag" value={results.totalDrops.toLocaleString()} unit="gtt" />
                    </div>

                    <Button variant="outline" onClick={copySummary} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Infusion summary copied" : "Copy calculation summary"}
                    </Button>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Drip rate (gtt/min) = (volume [mL] × drop factor [gtt/mL]) ÷ time [min]</Formula>
                <p>For gravity lines. Round to the nearest whole drop per minute — you cannot count part of a drop.</p>
                <Formula>Infusion rate (mL/hr) = total volume [mL] ÷ time [hours]</Formula>
                <p>Programmed into electronic smart infusion pumps.</p>
                <Formula>Drop interval (s) = 60 ÷ drip rate [gtt/min]</Formula>
                <p>Lets you adjust the roller clamp accurately with a second hand.</p>
                <p className="font-medium text-foreground">Drop factor standards</p>
                <div role="list" className="space-y-1">
                    <p role="listitem"><strong>10 gtt/mL:</strong> blood and thick, viscous fluids</p>
                    <p role="listitem"><strong>15–20 gtt/mL:</strong> standard adult macrodrip tubing</p>
                    <p role="listitem"><strong>60 gtt/mL:</strong> microdrip (1 mL = 60 drops, so mL/hr = gtt/min)</p>
                </div>
                <p>
                    The rate label is read from mL/hr: 500 mL/hr or more is flagged as a rapid bolus rate,
                    25 mL/hr or less as a low / KVO (keep vein open) rate.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Where do I find the drop factor?",
                        a: "It is printed on the IV administration set packaging, as gtt/mL (drops per millilitre). Macrodrip sets are usually 10, 15 or 20 gtt/mL; microdrip (paediatric) sets are 60 gtt/mL. Using the wrong factor gives a wrong drip rate even if the arithmetic is right.",
                    },
                    {
                        q: "Why do I get two different rates?",
                        a: "They answer different questions. mL/hr is the volume per hour, which is what an electronic pump is set to. gtt/min is the number of drops per minute, which is what you count when a line runs by gravity. With a 60 gtt/mL microdrip set the two numbers are the same.",
                    },
                    {
                        q: "Should I use the rounded or the exact drip rate?",
                        a: "Set a gravity line to the rounded whole number — drops cannot be counted in fractions. The exact value is shown so you can check your working against a textbook answer.",
                    },
                    {
                        q: "My time is in minutes — does that matter?",
                        a: "Switch the unit next to the duration to minutes. The calculator converts to minutes for the drip rate and to hours for the pump rate, so either unit gives the same answer.",
                    },
                    {
                        q: "How do I check the rate at the bedside?",
                        a: "Use the drop interval. If it says 1 drop every 1.4 seconds, watch the drip chamber for 15–60 seconds and adjust the roller clamp until the drops match that pace.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
