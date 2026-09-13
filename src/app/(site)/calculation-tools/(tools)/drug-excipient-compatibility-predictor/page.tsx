"use client";

import { useMemo, useState } from "react";
import { Atom, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    LabNotice,
    type ResultTone,
} from "@/components/calculators";

/** Joins class names; skips falsy entries. */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

type Risk = "low" | "medium" | "high";
type RiskLevel = "low" | "medium" | "high" | "critical";
type Compatibility = "compatible" | "caution" | "incompatible";

interface Choice {
    id: string;
    name: string;
    description: string;
    risk: Risk;
}

/* ── Lookup tables, scores and rules (unchanged from the original predictor) ── */
const DRUG_GROUPS: Choice[] = [
    { id: "1", name: "Primary Amine", description: "-NH₂ groups", risk: "high" },
    { id: "2", name: "Secondary Amine", description: "-NH- groups", risk: "medium" },
    { id: "3", name: "Ester", description: "-COOR groups", risk: "medium" },
    { id: "4", name: "Lactone", description: "Cyclic esters", risk: "high" },
    { id: "5", name: "Aldehyde", description: "-CHO groups", risk: "high" },
    { id: "6", name: "Ketone", description: "C=O groups", risk: "low" },
    { id: "7", name: "Alcohol", description: "-OH groups", risk: "low" },
    { id: "8", name: "Phenol", description: "Aromatic -OH", risk: "medium" },
    { id: "9", name: "Carboxylic Acid", description: "-COOH groups", risk: "medium" },
    { id: "10", name: "Thiol", description: "-SH groups", risk: "high" },
];

const EXCIPIENTS: Choice[] = [
    { id: "e1", name: "Lactose", description: "Reducing sugar", risk: "high" },
    { id: "e2", name: "Mannitol", description: "Sugar alcohol", risk: "low" },
    { id: "e3", name: "Microcrystalline Cellulose", description: "Cellulose polymer", risk: "low" },
    { id: "e4", name: "Povidone", description: "Polyvinylpyrrolidone", risk: "medium" },
    { id: "e5", name: "Croscarmellose Sodium", description: "Superdisintegrant", risk: "low" },
    { id: "e6", name: "Magnesium Stearate", description: "Lubricant", risk: "low" },
    { id: "e7", name: "Talc", description: "Glidant", risk: "low" },
    { id: "e8", name: "Silicon Dioxide", description: "Glidant", risk: "low" },
    { id: "e9", name: "Starch", description: "Polysaccharide", risk: "medium" },
    { id: "e10", name: "Gelatin", description: "Protein", risk: "medium" },
];

const FACTORS: Choice[] = [
    { id: "f1", name: "High Temperature", description: "Storage > 40°C", risk: "high" },
    { id: "f2", name: "High Humidity", description: "> 75% RH", risk: "high" },
    { id: "f3", name: "Light Exposure", description: "UV/Visible light", risk: "medium" },
    { id: "f4", name: "Oxygen Exposure", description: "Atmospheric oxygen", risk: "medium" },
    { id: "f5", name: "Low pH", description: "pH < 4", risk: "high" },
    { id: "f6", name: "High pH", description: "pH > 9", risk: "high" },
    { id: "f7", name: "Metal Ions", description: "Fe³⁺, Cu²⁺, etc.", risk: "high" },
    { id: "f8", name: "Aqueous Environment", description: "Moisture presence", risk: "medium" },
];

/** Points per selection. Drug groups and excipients: 3/2/1. Environmental factors: 4/2/1. */
const groupPoints = (risk: Risk) => (risk === "high" ? 3 : risk === "medium" ? 2 : 1);
const factorPoints = (risk: Risk) => (risk === "high" ? 4 : risk === "medium" ? 2 : 1);

const MAILLARD_POINTS = 5;
const ESTER_HYDROLYSIS_POINTS = 4;

const VERDICT: Record<Compatibility, string> = {
    compatible: "Low risk – Proceed with formulation.",
    caution: "Moderate risk – Requires stability studies.",
    incompatible: "High risk – Consider alternative excipients.",
};

const LEVEL_TONE: Record<RiskLevel, ResultTone> = {
    low: "success",
    medium: "warning",
    high: "warning",
    critical: "danger",
};

const RISK_CHIP: Record<Risk, string> = {
    high: "border-red-300 bg-red-50 dark:bg-red-950/30",
    medium: "border-amber-300 bg-amber-50 dark:bg-amber-950/30",
    low: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30",
};

const RISK_TEXT: Record<Risk, string> = {
    high: "text-red-700 dark:text-red-400",
    medium: "text-amber-700 dark:text-amber-400",
    low: "text-emerald-700 dark:text-emerald-400",
};

const EXAMPLE = { drugs: ["1", "3"], excipients: ["e1", "e4"], factors: ["f2", "f3"] };

/** Pure predictor — same scoring, ordering and messages as the original "Calculate Risk". */
function predict(drugs: string[], excipients: string[], factors: string[]) {
    if (drugs.length === 0 || excipients.length === 0) return null;

    let riskScore = 0;
    const potentialIssues: string[] = [];
    const recommendations: string[] = [];
    const breakdown: { label: string; points: number }[] = [];

    drugs.forEach((drugId) => {
        const drug = DRUG_GROUPS.find((d) => d.id === drugId);
        if (drug) {
            riskScore += groupPoints(drug.risk);
            breakdown.push({ label: `Drug: ${drug.name} (${drug.risk})`, points: groupPoints(drug.risk) });
        }
    });

    excipients.forEach((excId) => {
        const excipient = EXCIPIENTS.find((e) => e.id === excId);
        if (excipient) {
            riskScore += groupPoints(excipient.risk);
            breakdown.push({ label: `Excipient: ${excipient.name} (${excipient.risk})`, points: groupPoints(excipient.risk) });
        }
    });

    // Environmental factors, in table order (this is also the order issues are listed in).
    FACTORS.forEach((factor) => {
        if (factors.includes(factor.id)) {
            riskScore += factorPoints(factor.risk);
            potentialIssues.push(`${factor.name}: ${factor.description}`);
            breakdown.push({ label: `Condition: ${factor.name} (${factor.risk})`, points: factorPoints(factor.risk) });
        }
    });

    // Specific incompatibilities
    if (drugs.includes("1") && excipients.includes("e1")) {
        riskScore += MAILLARD_POINTS;
        potentialIssues.push("Maillard Reaction: Primary amines react with reducing sugars (lactose)");
        recommendations.push("Avoid lactose with primary amine drugs; use mannitol instead.");
        breakdown.push({ label: "Interaction: primary amine + lactose (Maillard)", points: MAILLARD_POINTS });
    }

    if (drugs.includes("3") && factors.includes("f6")) {
        riskScore += ESTER_HYDROLYSIS_POINTS;
        potentialIssues.push("Ester Hydrolysis: High pH accelerates ester degradation.");
        recommendations.push("Maintain neutral to acidic pH for ester drugs.");
        breakdown.push({ label: "Interaction: ester + high pH (hydrolysis)", points: ESTER_HYDROLYSIS_POINTS });
    }

    let riskLevel: RiskLevel;
    let compatibility: Compatibility;
    if (riskScore <= 5) {
        riskLevel = "low";
        compatibility = "compatible";
    } else if (riskScore <= 10) {
        riskLevel = "medium";
        compatibility = "caution";
    } else if (riskScore <= 15) {
        riskLevel = "high";
        compatibility = "caution";
    } else {
        riskLevel = "critical";
        compatibility = "incompatible";
    }

    if (factors.includes("f2")) recommendations.push("Use moisture barrier packaging (blister, desiccant).");
    if (factors.includes("f3")) recommendations.push("Use light-resistant packaging (amber glass, opaque containers).");
    if (drugs.some((id) => ["1", "2", "5", "10"].includes(id))) {
        recommendations.push("Consider adding antioxidant (BHT, vitamin E).");
    }

    return { riskScore, riskLevel, compatibility, potentialIssues, recommendations, breakdown };
}

/** A multi-select group of toggle chips. The kit has no chip group, so it lives here. */
function ChoiceGrid({
    label,
    hint,
    options,
    selected,
    onToggle,
    pointsFor,
}: {
    label: string;
    hint: string;
    options: Choice[];
    selected: string[];
    onToggle: (id: string) => void;
    pointsFor: (risk: Risk) => number;
}) {
    return (
        <div role="group" aria-label={label}>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-[13px] font-medium text-foreground/90">{label}</p>
                <p className="text-xs text-muted-foreground">
                    {selected.length ? `${selected.length} selected` : hint}
                </p>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {options.map((option) => {
                    const on = selected.includes(option.id);
                    return (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => onToggle(option.id)}
                            className={cn(
                                "flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                                on ? RISK_CHIP[option.risk] : "border-border bg-background hover:bg-muted/60",
                            )}
                        >
                            <span
                                className={cn(
                                    "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                                    on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                                )}
                                aria-hidden="true"
                            >
                                {on && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium leading-tight text-foreground">{option.name}</span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                            </span>
                            <span className={cn("shrink-0 text-right font-mono text-[11px] font-semibold uppercase", RISK_TEXT[option.risk])}>
                                {option.risk}
                                <span className="block font-normal normal-case text-muted-foreground">+{pointsFor(option.risk)}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function DrugExcipientCompatibilityPredictor() {
    const [drugs, setDrugs] = useState<string[]>([]);
    const [excipients, setExcipients] = useState<string[]>([]);
    const [factors, setFactors] = useState<string[]>([]);

    /*
     * Live. The original needed "Calculate Risk" and then kept showing the old
     * assessment after the selection changed; an alert() replaced the empty state.
     */
    const result = useMemo(() => predict(drugs, excipients, factors), [drugs, excipients, factors]);

    const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
        setter((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

    const reset = () => {
        setDrugs([]);
        setExcipients([]);
        setFactors([]);
    };

    const loadExample = () => {
        setDrugs(EXAMPLE.drugs);
        setExcipients(EXAMPLE.excipients);
        setFactors(EXAMPLE.factors);
    };

    return (
        <CalculatorShell
            title="Drug-Excipient Compatibility Predictor"
            subtitle="Scores the risk of a chemical interaction between a drug's functional groups, your excipients and storage conditions."
            icon={Atom}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this predictor">
                        <p>
                            A screening aid for pre-formulation. It adds points for each reactive
                            functional group, excipient and stress condition, adds extra points for
                            known problem pairs, and bands the total into a risk level.
                        </p>
                        <CalcList
                            title="Common interactions"
                            items={[
                                "Maillard reaction — primary amines + reducing sugars → brown discoloration",
                                "Ester hydrolysis — esters degrade in high pH / moisture",
                                "Oxidation — phenols and thiols oxidise with metal ions / O₂",
                            ]}
                        />
                        <CalcList
                            title="High-risk combinations"
                            items={[
                                "Amino drugs + lactose",
                                "Aspirin + alkaline excipients",
                                "Antioxidants + oxidising agents",
                            ]}
                        />
                        <CalcList
                            title="Testing strategy"
                            items={[
                                "Binary mixtures (drug + each excipient)",
                                "Accelerated conditions (40°C / 75% RH)",
                                "Monitor colour, assay and degradation products",
                                "Use DSC, FTIR and HPLC",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Limits"
                            items={[
                                "Only two specific interactions are modelled (Maillard, ester + high pH)",
                                "A low score is not proof of compatibility — confirm with stability studies",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Risk score"
                value={result ? result.riskScore : null}
                unit={result ? `${result.riskLevel} risk` : undefined}
                interpretation={result ? `${result.compatibility.toUpperCase()} — ${VERDICT[result.compatibility]}` : undefined}
                tone={result ? LEVEL_TONE[result.riskLevel] : "neutral"}
                empty="Select at least one drug functional group and one excipient to see the risk."
            />

            <CalcSection title="Formulation" description="Tap every group that applies. Each chip shows its risk and the points it adds.">
                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={loadExample}
                            className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                        >
                            Amine + ester drug with lactose, humid &amp; light
                        </button>
                    </div>
                </div>

                <ChoiceGrid
                    label="Drug functional groups"
                    hint="Pick at least one"
                    options={DRUG_GROUPS}
                    selected={drugs}
                    onToggle={toggle(setDrugs)}
                    pointsFor={groupPoints}
                />
                <ChoiceGrid
                    label="Excipients"
                    hint="Pick at least one"
                    options={EXCIPIENTS}
                    selected={excipients}
                    onToggle={toggle(setExcipients)}
                    pointsFor={groupPoints}
                />
                <ChoiceGrid
                    label="Environmental factors"
                    hint="Optional"
                    options={FACTORS}
                    selected={factors}
                    onToggle={toggle(setFactors)}
                    pointsFor={factorPoints}
                />

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (result.potentialIssues.length > 0 || result.recommendations.length > 0) && (
                <CalcSection title="Assessment">
                    {result.potentialIssues.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[13px] font-medium text-foreground/90">Potential compatibility issues</p>
                            {result.potentialIssues.map((issue) => (
                                <LabNotice key={issue} tone="danger">
                                    {issue}
                                </LabNotice>
                            ))}
                        </div>
                    )}
                    {result.recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[13px] font-medium text-foreground/90">Recommendations</p>
                            {result.recommendations.map((rec) => (
                                <div
                                    key={rec}
                                    className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Score breakdown" description="How the total was built up, point by point.">
                    <div>
                        {result.breakdown.map((row) => (
                            <ResultRow key={row.label} label={row.label} value={`+${row.points}`} />
                        ))}
                        <ResultRow
                            label="Total risk score"
                            value={result.riskScore}
                            badge={result.riskLevel.toUpperCase()}
                            badgeTone={result.riskLevel === "low" ? "success" : result.riskLevel === "critical" ? "destructive" : "warning"}
                        />
                        <ResultRow label="Overall compatibility" value={result.compatibility.toUpperCase()} />
                    </div>
                </CalcSection>
            )}

            <FormulaNote title="How the score is built">
                <Formula>Score = Σ drug groups + Σ excipients + Σ conditions + interaction penalties</Formula>
                <p>
                    Drug functional groups and excipients add 3 (high risk), 2 (medium) or 1 (low).
                    Environmental factors add 4 (high), 2 (medium) or 1 (low). Two specific
                    interactions add a penalty: primary amine + lactose (Maillard reaction) +5, and
                    ester + high pH (hydrolysis) +4.
                </p>
                <Formula>≤ 5 low · compatible &nbsp;|&nbsp; 6–10 medium · caution &nbsp;|&nbsp; 11–15 high · caution &nbsp;|&nbsp; &gt; 15 critical · incompatible</Formula>
                <p>
                    Formulation tips — for amine drugs, use mannitol instead of lactose; for ester drugs,
                    maintain an acidic pH and use desiccants; for oxidation-prone drugs, add antioxidants
                    and use a nitrogen blanket.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is lactose flagged as high risk?",
                        a: "Lactose is a reducing sugar. Its open-chain aldehyde reacts with primary amines in the Maillard reaction, giving brown discoloration and loss of drug — so the predictor adds a +5 penalty when both are selected. Mannitol, a non-reducing sugar alcohol, is the usual substitute.",
                    },
                    {
                        q: "Does 'compatible' mean I can skip stability testing?",
                        a: "No. The score is a screening heuristic built from a short list of groups and two known interactions. Confirm any formulation with binary drug–excipient mixtures under accelerated conditions (40°C / 75% RH), monitored by DSC, FTIR and HPLC.",
                    },
                    {
                        q: "Why do storage conditions weigh more than excipients?",
                        a: "High temperature, humidity, extreme pH and metal ions accelerate almost every degradation pathway at once, so a high-risk condition adds 4 points against 3 for a high-risk group.",
                    },
                    {
                        q: "My drug has several functional groups — select them all?",
                        a: "Yes. Every reactive group adds its own points, and the recommendations (for example, an antioxidant for amines, aldehydes and thiols) depend on which groups are present.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
