"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RefreshCw } from "lucide-react";
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
    type ResultTone,
} from "@/components/calculators";

type DosingRule = "young" | "clark" | "fried" | "mgkg";
type WeightUnit = "kg" | "lbs";

interface DrugPreset {
    name: string;
    category: string;
    adultDose: string;
    weightKg: string;
    ageYears: string;
    rule: DosingRule;
    mgPerKgTarget?: string;
    notes: string;
}

/* ── Constants (unchanged from the original page) ─────────────────────────── */
const KG_TO_LBS = 2.20462;
const STANDARD_ADULT_KG = 70; // baseline for the high/low dose check
const HIGH_FACTOR = 1.75;
const LOW_FACTOR = 0.35;

const COMMON_DRUGS: DrugPreset[] = [
    { name: "Paracetamol", category: "Antipyretic / Analgesic", adultDose: "1000", weightKg: "20", ageYears: "5", rule: "mgkg", mgPerKgTarget: "15", notes: "10-15 mg/kg every 4-6h (max 60 mg/kg/day)" },
    { name: "Ibuprofen", category: "NSAID / Anti-inflammatory", adultDose: "400", weightKg: "20", ageYears: "5", rule: "mgkg", mgPerKgTarget: "10", notes: "5-10 mg/kg every 6-8h (max 40 mg/kg/day)" },
    { name: "Amoxicillin", category: "Antibiotic", adultDose: "500", weightKg: "15", ageYears: "3", rule: "mgkg", mgPerKgTarget: "25", notes: "25-45 mg/kg/day divided q12h" },
    { name: "Prednisolone", category: "Corticosteroid", adultDose: "40", weightKg: "20", ageYears: "5", rule: "mgkg", mgPerKgTarget: "1", notes: "1-2 mg/kg/day in 1-2 divided doses" },
    { name: "Diphenhydramine", category: "Antihistamine", adultDose: "50", weightKg: "18", ageYears: "4", rule: "young", mgPerKgTarget: "1.25", notes: "1.25 mg/kg every 6h (max 300 mg/day)" },
];

const RULE_OPTIONS: { value: DosingRule; label: string; description: string }[] = [
    { value: "mgkg", label: "mg/kg dose", description: "Gold standard" },
    { value: "young", label: "Young's rule", description: "Age 1–12 yrs" },
    { value: "clark", label: "Clark's rule", description: "Weight-based" },
    { value: "fried", label: "Fried's rule", description: "Infants < 1 yr" },
];

function positive(raw: string): number {
    const value = parseFloat(raw);
    return isNaN(value) || value <= 0 ? 0 : value;
}

function positiveError(raw: string, what: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    return isNaN(value) || value <= 0 ? `${what} must be greater than 0.` : undefined;
}

export default function PediatricDosingCalculator() {
    const [weight, setWeight] = useState("20");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [age, setAge] = useState("5");
    const [adultDose, setAdultDose] = useState("500");
    const [mgKgInput, setMgKgInput] = useState("15");
    const [rule, setRule] = useState<DosingRule>("mgkg");
    const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const weightKg = useMemo(() => {
        const raw = parseFloat(weight);
        if (isNaN(raw) || raw <= 0) return 0;
        return weightUnit === "lbs" ? raw / KG_TO_LBS : raw;
    }, [weight, weightUnit]);
    const weightLbs = weightKg * KG_TO_LBS;
    const ageNum = positive(age);
    const adultDoseNum = positive(adultDose);
    const mgKgTargetNum = positive(mgKgInput);

    /* Every rule is computed at once for the comparison table — arithmetic verbatim from the original. */
    const calculations = useMemo(() => {
        if (weightKg <= 0 || ageNum <= 0) return null;

        // Young's: [age / (age + 12)] × adult dose
        const youngDose = adultDoseNum > 0 ? adultDoseNum * (ageNum / (ageNum + 12)) : 0;
        // Clark's: [weight (lbs) / 150] × adult dose
        const clarkDose = adultDoseNum > 0 ? adultDoseNum * (weightLbs / 150) : 0;
        // Fried's: [age in months / 150] × adult dose
        const friedDose = adultDoseNum > 0 ? adultDoseNum * ((ageNum * 12) / 150) : 0;
        // mg/kg: target mg/kg × weight (kg)
        const mgkgDose = mgKgTargetNum > 0 ? mgKgTargetNum * weightKg : 0;

        let activeDose = 0;
        let ruleName = "";
        let formulaString = "";

        switch (rule) {
            case "young":
                activeDose = youngDose;
                ruleName = "Young's Rule";
                formulaString = `${ageNum}y / (${ageNum}y + 12) × ${adultDoseNum} mg`;
                break;
            case "clark":
                activeDose = clarkDose;
                ruleName = "Clark's Rule";
                formulaString = `${weightLbs.toFixed(1)} lbs / 150 × ${adultDoseNum} mg`;
                break;
            case "fried":
                activeDose = friedDose;
                ruleName = "Fried's Rule";
                formulaString = `${(ageNum * 12).toFixed(0)} mos / 150 × ${adultDoseNum} mg`;
                break;
            case "mgkg":
            default:
                activeDose = mgkgDose;
                ruleName = "mg/kg Standard Dosing";
                formulaString = `${mgKgTargetNum} mg/kg × ${weightKg.toFixed(1)} kg`;
                break;
        }

        const calculatedMgPerKg = weightKg > 0 ? activeDose / weightKg : 0;
        const adultFraction = adultDoseNum > 0 ? (activeDose / adultDoseNum) * 100 : 0;

        let interpretation: { level: "normal" | "high" | "low"; text: string; description: string; tone: ResultTone } = {
            level: "normal",
            text: "Appropriate pediatric dose range",
            description: "Calculated dose matches standard expected safety margins.",
            // mg/kg mode performs no range check, so it is not painted as a green "pass".
            tone: rule === "mgkg" ? "neutral" : "success",
        };

        if (rule !== "mgkg" && adultDoseNum > 0) {
            const standardAdultMgPerKg = adultDoseNum / STANDARD_ADULT_KG;
            if (calculatedMgPerKg > standardAdultMgPerKg * HIGH_FACTOR) {
                interpretation = {
                    level: "high",
                    text: "High Dose Alert — Verification Advised",
                    description: "Calculated dose yields a high mg/kg ratio compared to standard adult limits. Verify pediatric guideline.",
                    tone: "danger",
                };
            } else if (calculatedMgPerKg < standardAdultMgPerKg * LOW_FACTOR) {
                interpretation = {
                    level: "low",
                    text: "Subtherapeutic / Low Dose Alert",
                    description: "Calculated dose may fall below minimum effective pediatric concentration.",
                    tone: "warning",
                };
            }
        }

        return {
            activeDose,
            ruleName,
            formulaString,
            calculatedMgPerKg,
            adultFraction,
            interpretation,
            youngDose,
            clarkDose,
            friedDose,
            mgkgDose,
        };
    }, [weightKg, weightLbs, ageNum, adultDoseNum, mgKgTargetNum, rule]);

    /*
     * The original printed "0.0 mg — Appropriate pediatric dose range" when the
     * active method's dose input was empty. A zero dose is not an answer, so the
     * headline waits for that input instead. Every non-zero figure is unchanged.
     */
    const activeInputMissing = rule === "mgkg" ? mgKgTargetNum <= 0 : adultDoseNum <= 0;
    const showDose = calculations !== null && !activeInputMissing;

    const selectDrug = (drug: DrugPreset) => {
        setSelectedDrug(drug.name);
        setWeight(drug.weightKg);
        setWeightUnit("kg");
        setAge(drug.ageYears);
        setAdultDose(drug.adultDose);
        setRule(drug.rule);
        if (drug.mgPerKgTarget) setMgKgInput(drug.mgPerKgTarget);
    };

    const reset = () => {
        setWeight("");
        setAge("");
        setAdultDose("");
        setMgKgInput("");
        setSelectedDrug(null);
    };

    const copySummary = async () => {
        if (!calculations) return;
        const summary = `Pediatric Dose: ${calculations.activeDose.toFixed(1)} mg (${calculations.ruleName})\nPatient: ${weightKg.toFixed(1)} kg, ${ageNum} years\nDose Rate: ${calculations.calculatedMgPerKg.toFixed(2)} mg/kg`;
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            // No clipboard access (insecure context / old WebView): nothing to do.
        }
    };

    const weightHint =
        weightUnit === "lbs" && weightKg > 0
            ? `≈ ${weightKg.toFixed(1)} kg`
            : weightUnit === "kg" && weightKg > 0
              ? `≈ ${weightLbs.toFixed(1)} lbs`
              : "Required — the child's current weight.";

    const selected = COMMON_DRUGS.find((d) => d.name === selectedDrug);

    const emptyText =
        calculations === null
            ? "Enter the child's weight and age to calculate a dose."
            : rule === "mgkg"
              ? "Enter the target dose in mg/kg to calculate the dose."
              : "Enter the adult dose in mg to apply this rule.";

    const comparisonRows: { key: DosingRule; label: string; dose: string; perKg: string }[] = [
        {
            key: "mgkg",
            label: "mg/kg Standard",
            dose: calculations ? `${calculations.mgkgDose.toFixed(1)} mg` : "—",
            perKg: mgKgTargetNum > 0 ? `${mgKgTargetNum.toFixed(1)}` : "—",
        },
        {
            key: "young",
            label: "Young's (Age)",
            dose: calculations && adultDoseNum > 0 ? `${calculations.youngDose.toFixed(1)} mg` : "—",
            perKg: calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.youngDose / weightKg).toFixed(1)}` : "—",
        },
        {
            key: "clark",
            label: "Clark's (Weight)",
            dose: calculations && adultDoseNum > 0 ? `${calculations.clarkDose.toFixed(1)} mg` : "—",
            perKg: calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.clarkDose / weightKg).toFixed(1)}` : "—",
        },
        {
            key: "fried",
            label: "Fried's (Infants)",
            dose: calculations && adultDoseNum > 0 ? `${calculations.friedDose.toFixed(1)} mg` : "—",
            perKg: calculations && weightKg > 0 && adultDoseNum > 0 ? `${(calculations.friedDose / weightKg).toFixed(1)}` : "—",
        },
    ];

    return (
        <CalculatorShell
            title="Pediatric Dosing Calculator"
            subtitle="Calculates a child's dose by body weight (mg/kg) and compares it with the classic Young's, Clark's and Fried's rules."
            icon={Baby}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Children are not small adults — body water, organ maturity and clearance all
                            change with age. Modern practice doses most medicines by weight (mg/kg) from a
                            paediatric formulary. The older rules scale an adult dose by age or weight and
                            are kept here for teaching and cross-checking.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Choose mg/kg (recommended) or one of the historical rules — or tap a drug preset.",
                                "Enter the child's weight (kg or lbs), age, and the target mg/kg or the adult dose.",
                                "Read the dose, its mg/kg and % of the adult dose, then compare all four methods in the table.",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Before giving a dose"
                            items={[
                                "Verify against a paediatric formulary (BNF for Children, Harriet Lane) — these rules only estimate.",
                                "Check the maximum single and daily dose; never exceed the adult dose.",
                                "Adjust for renal or hepatic impairment and hydration state.",
                                "Check whether a mg/kg figure is per dose or per day before using it.",
                            ]}
                        />
                        <p className="text-xs italic">
                            References: Johns Hopkins ABX Guide, Harriet Lane Handbook, Pediatric Dosage Handbook (Lexicomp).
                        </p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={rule} onChange={setRule} options={RULE_OPTIONS} />

            {rule !== "mgkg" && (
                <LabNotice tone="warning" title="Historical rule">
                    These rules estimate a dose from standard adult parameters. In current practice,
                    weight-based (mg/kg) guidelines from formularies (BNF for Children, Harriet Lane)
                    supersede them.
                </LabNotice>
            )}

            <ResultCard
                label={`Dose · ${RULE_OPTIONS.find((o) => o.value === rule)?.label ?? ""}`}
                value={showDose && calculations ? calculations.activeDose.toFixed(1) : null}
                unit="mg"
                interpretation={showDose ? calculations?.interpretation.text : undefined}
                tone={showDose ? calculations?.interpretation.tone ?? "neutral" : "neutral"}
                empty={emptyText}
            />

            <CalcSection title="Patient & dose">
                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try a drug preset</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_DRUGS.map((d) => {
                            const isSelected = selectedDrug === d.name;
                            return (
                                <button
                                    key={d.name}
                                    type="button"
                                    onClick={() => selectDrug(d)}
                                    aria-pressed={isSelected}
                                    className={
                                        "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors " +
                                        (isSelected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "bg-background hover:bg-muted active:bg-accent")
                                    }
                                >
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                    {d.name}
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                        {d.mgPerKgTarget ? `${d.mgPerKgTarget} mg/kg` : `${d.adultDose}mg adult`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {selected && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{selected.name}</span> ({selected.category}):{" "}
                            {selected.notes}
                        </p>
                    )}
                </div>

                <FieldGrid>
                    <NumberField
                        label="Weight"
                        value={weight}
                        onChange={(v) => {
                            setWeight(v);
                            setSelectedDrug(null);
                        }}
                        units={["kg", "lbs"]}
                        unit={weightUnit}
                        onUnitChange={(next) => setWeightUnit(next as WeightUnit)}
                        step="0.1"
                        min={0.1}
                        placeholder="e.g. 20"
                        hint={weightHint}
                        error={positiveError(weight, "Weight")}
                    />
                    <NumberField
                        label="Age"
                        value={age}
                        onChange={(v) => {
                            setAge(v);
                            setSelectedDrug(null);
                        }}
                        unit="years"
                        step="0.1"
                        min={0.05}
                        placeholder="e.g. 5"
                        hint={ageNum > 0 ? `≈ ${(ageNum * 12).toFixed(0)} months` : "Required — use decimals for infants (6 months = 0.5)."}
                        error={positiveError(age, "Age")}
                    />
                    <NumberField
                        label="Target dose (mg/kg)"
                        value={mgKgInput}
                        onChange={(v) => {
                            setMgKgInput(v);
                            setSelectedDrug(null);
                        }}
                        unit="mg/kg"
                        step="0.1"
                        min={0.1}
                        placeholder="e.g. 15"
                        hint={
                            rule === "mgkg"
                                ? "Per-kg single dose target, from the formulary."
                                : "Used by the mg/kg row of the comparison table."
                        }
                        error={positiveError(mgKgInput, "Target dose")}
                    />
                    <NumberField
                        label="Adult dose (mg)"
                        value={adultDose}
                        onChange={(v) => {
                            setAdultDose(v);
                            setSelectedDrug(null);
                        }}
                        unit="mg"
                        step="1"
                        min={1}
                        placeholder="e.g. 500"
                        hint={
                            rule === "mgkg"
                                ? "Standard 70 kg adult dose — used for % of adult dose and the other rules."
                                : "Standard 70 kg adult dose."
                        }
                        error={positiveError(adultDose, "Adult dose")}
                    />
                </FieldGrid>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {calculations && showDose && (
                <CalcSection title="Dose check" description="Your values in the formula, and how the dose compares.">
                    <div>
                        <ResultRow label={calculations.formulaString} value={calculations.activeDose.toFixed(1)} unit="mg" />
                        <ResultRow label="Dose per kg" value={calculations.calculatedMgPerKg.toFixed(2)} unit="mg/kg" />
                        <ResultRow label="% of adult dose" value={`${calculations.adultFraction.toFixed(1)}%`} />
                    </div>

                    {adultDoseNum > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Child dose fraction</span>
                                <span className="font-semibold tabular-nums text-foreground">
                                    {calculations.activeDose.toFixed(0)} mg / {adultDoseNum} mg
                                </span>
                            </div>
                            <div
                                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                                role="img"
                                aria-label={`${calculations.adultFraction.toFixed(1)}% of the adult dose`}
                            >
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                                    style={{ width: `${Math.min(calculations.adultFraction, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <LabNotice
                        tone={
                            calculations.interpretation.level === "high"
                                ? "danger"
                                : calculations.interpretation.level === "low"
                                  ? "warning"
                                  : "info"
                        }
                        title={calculations.interpretation.text}
                    >
                        {calculations.interpretation.description}
                    </LabNotice>

                    <Button variant="outline" onClick={copySummary} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Summary copied" : "Copy dose summary"}
                    </Button>
                </CalcSection>
            )}

            <CalcSection title="Multi-rule comparison" description="The same child and doses through all four methods.">
                <div className="overflow-x-auto rounded-xl border border-border/80">
                    <table className="w-full min-w-[300px] text-left text-sm">
                        <thead className="border-b border-border/80 bg-muted/60 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2.5 font-medium">Rule</th>
                                <th className="px-3 py-2.5 text-right font-medium">Dose</th>
                                <th className="px-3 py-2.5 text-right font-medium">mg/kg</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            {comparisonRows.map((row) => {
                                const active = row.key === rule;
                                return (
                                    <tr key={row.key} className={active ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground"}>
                                        <td className="px-3 py-2.5">
                                            <span className="flex flex-wrap items-center gap-1.5">
                                                {row.label}
                                                {active && (
                                                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                                                        Active
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums">{row.dose}</td>
                                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums">{row.perKg}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>mg/kg: Dose = target (mg/kg) × weight (kg)</Formula>
                <p>Safest and most widely accepted in current clinical practice.</p>
                <Formula>Young&apos;s rule: Dose = [age (years) / (age + 12)] × adult dose</Formula>
                <p>Based on age, for children aged 1–12. Tends to underestimate for older children.</p>
                <Formula>Clark&apos;s rule: Dose = [weight (lbs) / 150] × adult dose</Formula>
                <p>Assumes a standard adult weighs 150 lbs (68–70 kg). Weights entered in kg are converted (1 kg = 2.20462 lbs).</p>
                <Formula>Fried&apos;s rule: Dose = [age (months) / 150] × adult dose</Formula>
                <p>Developed for infants under 1–2 years.</p>
                <p>
                    For the three rules, the dose check compares the child&apos;s mg/kg with the adult dose
                    spread over 70 kg: above 1.75× that figure is flagged high, below 0.35× low.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which method should I use?",
                        a: "mg/kg, with the target taken from a paediatric formulary for that drug and indication. Young's, Clark's and Fried's rules predate modern paediatric pharmacokinetics; they are useful for exams and as a rough cross-check, not for choosing a real dose.",
                    },
                    {
                        q: "Is the mg/kg figure per dose or per day?",
                        a: "It depends on the reference. Paracetamol is quoted per dose (15 mg/kg every 4–6 h); amoxicillin and prednisolone are often quoted per day, then divided. This calculator multiplies whatever mg/kg you enter by the weight — divide a daily total into doses yourself.",
                    },
                    {
                        q: "Why do the rules give such different answers?",
                        a: "Each scales the adult dose by a different proxy — age in years, age in months, or weight — and none accounts for how drug clearance actually matures. The comparison table makes that spread visible.",
                    },
                    {
                        q: "Can I enter the weight in pounds?",
                        a: "Yes. Switch the unit next to weight to lbs. The calculator converts to kg for mg/kg and uses pounds directly for Clark's rule.",
                    },
                    {
                        q: "What does the high or low dose alert mean?",
                        a: "It appears only for the three historical rules. It compares the child's calculated mg/kg with the adult dose divided by 70 kg; a large difference suggests the rule is a poor fit for this child and a formulary dose should be checked.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
