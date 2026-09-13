"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/calculators";

/* ── Constants (unchanged from the original page) ─────────────────────────── */

/** z-value for a 90% two-sided interval (large-n approximation). */
const T_VALUE = 1.645;
const BE_LOWER = 0.8;
const BE_UPPER = 1.25;

/** The CI chart's axis, in percent. */
const AXIS_MIN = 70;
const AXIS_MAX = 130;
const AXIS_TICKS = [70, 80, 100, 125, 130];

type Study = {
    name: string;
    testAUC: string;
    testSD: string;
    refAUC: string;
    refSD: string;
    testCmax: string;
    testCmaxSD: string;
    refCmax: string;
    refCmaxSD: string;
    n: string;
};

const SAMPLE_STUDIES: Study[] = [
    { name: "Generic Drug A", testAUC: "95", testSD: "12", refAUC: "100", refSD: "10", testCmax: "28", testCmaxSD: "3", refCmax: "30", refCmaxSD: "4", n: "24" },
    { name: "Modified Release", testAUC: "105", testSD: "18", refAUC: "100", refSD: "15", testCmax: "22", testCmaxSD: "4", refCmax: "30", refCmaxSD: "5", n: "36" },
    { name: "Different Salt", testAUC: "88", testSD: "20", refAUC: "100", refSD: "18", testCmax: "26", testCmaxSD: "5", refCmax: "30", refCmaxSD: "6", n: "48" },
];

const DEFAULTS = {
    testAUC: "85",
    testAUC_SD: "15",
    referenceAUC: "100",
    referenceAUC_SD: "12",
    testCmax: "25",
    testCmax_SD: "4",
    referenceCmax: "30",
    referenceCmax_SD: "5",
    sampleSize: "24",
    alpha: "0.05",
};

/* ── Pure maths ───────────────────────────────────────────────────────────── */

type Interval = {
    ratio: number;
    se: number;
    /** Bounds as fractions (0.8 = 80%). */
    lower: number;
    upper: number;
};

/**
 * Ratio of means with a simplified standard error from the two coefficients of
 * variation — exactly the arithmetic of the original page.
 */
function interval(test: number, testSD: number, ref: number, refSD: number, n: number): Interval {
    const ratio = test / ref;
    const se = Math.sqrt(Math.pow(testSD / test, 2) + Math.pow(refSD / ref, 2)) / Math.sqrt(n);
    return { ratio, se, lower: ratio - T_VALUE * se, upper: ratio + T_VALUE * se };
}

/** The original page's status wording, on percentage bounds. */
function statusOf(lower: number, upper: number) {
    if (lower >= 80 && upper <= 125) return "Bioequivalent";
    if (lower < 80 && upper > 125) return "Variable - More data needed";
    if (upper < 80) return "Underperforming";
    if (lower > 125) return "Overperforming";
    return "Not Bioequivalent";
}

const parse = (value: string) => parseFloat(value);

function positiveError(value: string) {
    if (value.trim() === "") return undefined;
    const v = parse(value);
    if (!Number.isFinite(v)) return "Enter a number.";
    if (v <= 0) return "Must be greater than 0.";
    return undefined;
}

function sdError(value: string) {
    if (value.trim() === "") return undefined;
    const v = parse(value);
    if (!Number.isFinite(v)) return "Enter a number.";
    if (v < 0) return "A standard deviation cannot be negative.";
    return undefined;
}

const validMean = (value: string) => Number.isFinite(parse(value)) && parse(value) > 0;
const validSD = (value: string) => Number.isFinite(parse(value)) && parse(value) >= 0;

export default function BioequivalenceCalculator() {
    const [testAUC, setTestAUC] = useState(DEFAULTS.testAUC);
    const [testAUC_SD, setTestAUC_SD] = useState(DEFAULTS.testAUC_SD);
    const [referenceAUC, setReferenceAUC] = useState(DEFAULTS.referenceAUC);
    const [referenceAUC_SD, setReferenceAUC_SD] = useState(DEFAULTS.referenceAUC_SD);
    const [testCmax, setTestCmax] = useState(DEFAULTS.testCmax);
    const [testCmax_SD, setTestCmax_SD] = useState(DEFAULTS.testCmax_SD);
    const [referenceCmax, setReferenceCmax] = useState(DEFAULTS.referenceCmax);
    const [referenceCmax_SD, setReferenceCmax_SD] = useState(DEFAULTS.referenceCmax_SD);
    const [sampleSize, setSampleSize] = useState(DEFAULTS.sampleSize);
    const [alpha, setAlpha] = useState(DEFAULTS.alpha);

    /*
     * Derived live from the inputs. The old page stored the intervals in state
     * from a useEffect, and read the *previous* render's Cmax interval when
     * deciding the verdict — so the verdict on first load ignored Cmax, and an
     * emptied field left stale numbers on screen. The arithmetic is unchanged.
     */
    const result = useMemo(() => {
        if (!validMean(testAUC) || !validMean(referenceAUC) || !validSD(testAUC_SD) || !validSD(referenceAUC_SD)) {
            return null;
        }
        const n = parse(sampleSize);
        if (!Number.isFinite(n) || n <= 0) return null;

        const tA = parse(testAUC);
        const rA = parse(referenceAUC);
        const tSD = parse(testAUC_SD);
        const rSD = parse(referenceAUC_SD);

        const auc = interval(tA, tSD, rA, rSD, n);

        // Cmax is assessed whenever all four of its values are usable.
        const cmaxComplete =
            validMean(testCmax) && validMean(referenceCmax) && validSD(testCmax_SD) && validSD(referenceCmax_SD);
        const cmax = cmaxComplete
            ? interval(parse(testCmax), parse(testCmax_SD), parse(referenceCmax), parse(referenceCmax_SD), n)
            : null;

        const aucPass = auc.lower >= BE_LOWER && auc.upper <= BE_UPPER;
        const cmaxPass = cmax ? cmax.lower >= BE_LOWER && cmax.upper <= BE_UPPER : true;

        // Simplified power estimate, as on the original page.
        const cv = (Math.sqrt(tSD ** 2 + rSD ** 2) / ((tA + rA) / 2)) * 100;
        const power = Math.min(100, Math.max(0, 100 - cv * 2));

        return { auc, cmax, aucPass, cmaxPass, bioequivalent: aucPass && cmaxPass, cv, power, n };
    }, [testAUC, testAUC_SD, referenceAUC, referenceAUC_SD, testCmax, testCmax_SD, referenceCmax, referenceCmax_SD, sampleSize]);

    const loadStudy = (study: Study) => {
        setTestAUC(study.testAUC);
        setTestAUC_SD(study.testSD);
        setReferenceAUC(study.refAUC);
        setReferenceAUC_SD(study.refSD);
        setTestCmax(study.testCmax);
        setTestCmax_SD(study.testCmaxSD);
        setReferenceCmax(study.refCmax);
        setReferenceCmax_SD(study.refCmaxSD);
        setSampleSize(study.n);
    };

    const reset = () => {
        setTestAUC(DEFAULTS.testAUC);
        setTestAUC_SD(DEFAULTS.testAUC_SD);
        setReferenceAUC(DEFAULTS.referenceAUC);
        setReferenceAUC_SD(DEFAULTS.referenceAUC_SD);
        setTestCmax(DEFAULTS.testCmax);
        setTestCmax_SD(DEFAULTS.testCmax_SD);
        setReferenceCmax(DEFAULTS.referenceCmax);
        setReferenceCmax_SD(DEFAULTS.referenceCmax_SD);
        setSampleSize(DEFAULTS.sampleSize);
        setAlpha(DEFAULTS.alpha);
    };

    const pct = (fraction: number) => (fraction * 100).toFixed(1);
    const aucText = result ? `${pct(result.auc.lower)}–${pct(result.auc.upper)}%` : "";
    const cmaxText = result?.cmax ? `${pct(result.cmax.lower)}–${pct(result.cmax.upper)}%` : "";

    let interpretation: string | undefined;
    if (result) {
        const parts = [`AUC 90% CI ${aucText}`];
        if (result.cmax) parts.push(`Cmax 90% CI ${cmaxText}`);
        const summary = parts.join(" · ");
        if (!result.cmax) {
            interpretation = `${result.bioequivalent ? "Bioequivalent on AUC" : "Not bioequivalent"} — ${summary}. Cmax not entered, so it was not assessed.`;
        } else if (result.bioequivalent) {
            interpretation = `Bioequivalent — ${summary}, both inside 80–125%.`;
        } else {
            const failed = [!result.aucPass && "AUC", !result.cmaxPass && "Cmax"].filter(Boolean).join(" and ");
            interpretation = `Not bioequivalent — ${failed} outside 80–125%. ${summary}.`;
        }
    }

    const cmaxAnyEntered = [testCmax, testCmax_SD, referenceCmax, referenceCmax_SD].some((v) => v.trim() !== "");

    return (
        <CalculatorShell
            title="Bioequivalence Calculator"
            subtitle="Checks whether a test product's AUC and Cmax 90% confidence intervals fall inside the 80–125% acceptance range against a reference product."
            icon={Scale}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Two products are <strong>bioequivalent</strong> when they deliver the same drug
                            to the bloodstream at the same rate and to the same extent. Regulators judge this
                            from the ratio of the test (T) to the reference (R) product for two exposure
                            measures: <strong>AUC</strong> (area under the concentration–time curve — how
                            much drug) and <strong>Cmax</strong> (peak concentration — how fast).
                        </p>
                        <CalcList
                            title="Regulatory guidelines"
                            items={[
                                "FDA/EMA: the 90% CI of AUC and Cmax must lie within 80–125%",
                                "Sample size: typically 18–24 subjects for adequate power",
                                "Design: randomised, two-period crossover",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Simplifications in this tool"
                            items={[
                                "Uses the arithmetic ratio of means, not the geometric mean ratio of log-transformed data",
                                "Standard error is estimated from the two CVs and N, not from a crossover ANOVA",
                                "Uses z = 1.645 whatever N is, rather than a t-value",
                                "The power figure is a rough heuristic (100 − 2 × CV), not a formal power calculation",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Bioequivalence verdict"
                value={result ? (result.bioequivalent ? "Pass" : "Fail") : null}
                interpretation={interpretation}
                tone={result ? (result.bioequivalent ? "success" : "danger") : "neutral"}
                empty="Enter the mean and SD of AUC for the test and reference products, and the number of subjects."
            />

            <CalcSection title="Study design">
                <FieldGrid>
                    <NumberField
                        label="Sample size (N, subjects)"
                        value={sampleSize}
                        onChange={setSampleSize}
                        step="1"
                        min={1}
                        hint="Typically 18–24 subjects in a crossover study."
                        error={positiveError(sampleSize)}
                    />
                    <SelectField
                        label="Alpha (α)"
                        value={alpha}
                        onChange={setAlpha}
                        options={[
                            { value: "0.05", label: "0.05 (90% CI)" },
                            { value: "0.1", label: "0.10 (80% CI)" },
                        ]}
                        hint="The interval is always computed with z = 1.645 (the 90% CI), whichever alpha is chosen."
                    />
                </FieldGrid>
            </CalcSection>

            <CalcSection
                title="AUC — primary endpoint"
                description="Mean and standard deviation (SD). Any unit (e.g. ng·h/mL), as long as test and reference use the same one."
            >
                <FieldGrid>
                    <NumberField label="Test — mean AUC" value={testAUC} onChange={setTestAUC} step="0.001" error={positiveError(testAUC)} />
                    <NumberField label="Test — SD" value={testAUC_SD} onChange={setTestAUC_SD} step="0.001" error={sdError(testAUC_SD)} />
                    <NumberField label="Reference — mean AUC" value={referenceAUC} onChange={setReferenceAUC} step="0.001" error={positiveError(referenceAUC)} />
                    <NumberField label="Reference — SD" value={referenceAUC_SD} onChange={setReferenceAUC_SD} step="0.001" error={sdError(referenceAUC_SD)} />
                </FieldGrid>
            </CalcSection>

            <CalcSection
                title="Cmax — secondary endpoint"
                description="Peak concentration, mean and SD, in the same unit for both products (e.g. ng/mL)."
            >
                <FieldGrid>
                    <NumberField label="Test — mean Cmax" value={testCmax} onChange={setTestCmax} step="0.001" error={positiveError(testCmax)} />
                    <NumberField label="Test — SD" value={testCmax_SD} onChange={setTestCmax_SD} step="0.001" error={sdError(testCmax_SD)} />
                    <NumberField label="Reference — mean Cmax" value={referenceCmax} onChange={setReferenceCmax} step="0.001" error={positiveError(referenceCmax)} />
                    <NumberField label="Reference — SD" value={referenceCmax_SD} onChange={setReferenceCmax_SD} step="0.001" error={sdError(referenceCmax_SD)} />
                </FieldGrid>
                {result && !result.cmax && cmaxAnyEntered && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Cmax is incomplete, so it is left out of the verdict until all four values are entered.
                    </p>
                )}
            </CalcSection>

            <CalcSection title="Try an example study">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {SAMPLE_STUDIES.map((study) => (
                        <button
                            key={study.name}
                            type="button"
                            onClick={() => loadStudy(study)}
                            className="min-h-[44px] rounded-xl border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary/40 active:bg-accent"
                        >
                            <span className="block text-sm font-semibold text-foreground">{study.name}</span>
                            <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                                AUC T {study.testAUC}±{study.testSD} · R {study.refAUC}±{study.refSD} · N {study.n}
                            </span>
                        </button>
                    ))}
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="90% confidence intervals" description="Shaded band = 80–125% acceptance range.">
                    <CiBar name="AUC" lower={result.auc.lower * 100} upper={result.auc.upper * 100} />
                    {result.cmax && <CiBar name="Cmax" lower={result.cmax.lower * 100} upper={result.cmax.upper * 100} />}
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Working">
                    <div>
                        <ResultRow label="AUC ratio (T / R)" value={pct(result.auc.ratio)} unit="%" />
                        <ResultRow label="AUC standard error" value={result.auc.se.toFixed(4)} />
                        <ResultRow
                            label="AUC 90% CI"
                            value={aucText}
                            badge={result.aucPass ? "Pass" : "Fail"}
                            badgeTone={result.aucPass ? "success" : "destructive"}
                        />
                        {result.cmax && (
                            <>
                                <ResultRow label="Cmax ratio (T / R)" value={pct(result.cmax.ratio)} unit="%" />
                                <ResultRow label="Cmax standard error" value={result.cmax.se.toFixed(4)} />
                                <ResultRow
                                    label="Cmax 90% CI"
                                    value={cmaxText}
                                    badge={result.cmaxPass ? "Pass" : "Fail"}
                                    badgeTone={result.cmaxPass ? "success" : "destructive"}
                                />
                            </>
                        )}
                        <ResultRow label="Pooled AUC CV (for power)" value={result.cv.toFixed(1)} unit="%" />
                        <ResultRow label="Estimated power" value={`${result.power.toFixed(0)}%`} />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Ratio = mean(Test) ÷ mean(Reference)</Formula>
                <Formula>SE = √[(SD_T ÷ mean_T)² + (SD_R ÷ mean_R)²] ÷ √N</Formula>
                <Formula>90% CI = Ratio ± 1.645 × SE</Formula>
                <Formula>Power ≈ 100 − 2 × CV, where CV = √(SD_T² + SD_R²) ÷ [(mean_T + mean_R) ÷ 2] × 100</Formula>
                <p>
                    Each SD is turned into a coefficient of variation (SD ÷ mean), the two are combined,
                    and dividing by √N shrinks the uncertainty as more subjects are studied. The product
                    passes when the whole interval — not just the ratio — sits inside 80–125% for both
                    AUC and Cmax.
                </p>
                <p>
                    Formal studies log-transform the data, run an ANOVA on the crossover design and use a
                    t-value with the study&apos;s degrees of freedom. This tool is an approximation for
                    learning how N, variability and the ratio drive the result.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why 80–125% and not 80–120%?",
                        a: "The limits are symmetric on a log scale: ln(0.8) = −0.223 and ln(1.25) = +0.223. A test product 20% lower than the reference is as far from equivalence as one 25% higher.",
                    },
                    {
                        q: "My ratio is 95% — why does it still fail?",
                        a: "The verdict depends on the whole confidence interval, not the ratio. High variability (large SDs) or too few subjects widen the interval until one end crosses 80% or 125%. Try increasing N to see the interval narrow.",
                    },
                    {
                        q: "Which units should I use for AUC and Cmax?",
                        a: "Any — the calculation only uses ratios, so units cancel. What matters is that the test and reference values are in the same unit.",
                    },
                    {
                        q: "Does the alpha selector change the interval?",
                        a: "No. The calculation always uses z = 1.645, which corresponds to the 90% interval that regulators require (two one-sided tests at α = 0.05).",
                    },
                    {
                        q: "What does 'Variable - More data needed' mean?",
                        a: "The interval is so wide that it runs below 80% and above 125% at the same time. The study cannot say whether the products differ — usually a sign of high variability or too few subjects.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/**
 * One confidence interval drawn on a 70–130% axis with the acceptance band
 * shaded. Positions are clamped so an interval off the axis still reads as
 * "beyond the edge" instead of disappearing.
 */
function CiBar({ name, lower, upper }: { name: string; lower: number; upper: number }) {
    const status = statusOf(lower, upper);
    const pass = lower >= 80 && upper <= 125;
    const toPos = (value: number) => Math.min(100, Math.max(0, ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100));
    const left = toPos(lower);
    const right = toPos(upper);
    const bandLeft = toPos(80);
    const bandRight = toPos(125);

    return (
        <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                <span className="flex items-center gap-2">
                    <span className="font-mono text-sm tabular-nums text-foreground">
                        {lower.toFixed(1)}–{upper.toFixed(1)}%
                    </span>
                    <Badge variant={pass ? "success" : "destructive"}>{status}</Badge>
                </span>
            </div>
            <div className="relative h-12 rounded-lg bg-muted/70">
                <div
                    className="absolute inset-y-0 border-x border-emerald-500/50 bg-emerald-500/15"
                    style={{ left: `${bandLeft}%`, width: `${bandRight - bandLeft}%` }}
                    aria-hidden="true"
                />
                <div
                    className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${pass ? "bg-primary" : "bg-red-500"}`}
                    style={{ left: `${left}%`, width: `${Math.max(right - left, 0.8)}%` }}
                    aria-hidden="true"
                />
            </div>
            <div className="relative mt-1 h-4 font-mono text-[11px] text-muted-foreground" aria-hidden="true">
                {AXIS_TICKS.map((tick) => (
                    <span
                        key={tick}
                        className="absolute -translate-x-1/2"
                        style={{ left: `${toPos(tick)}%` }}
                    >
                        {tick}
                    </span>
                ))}
            </div>
        </div>
    );
}
