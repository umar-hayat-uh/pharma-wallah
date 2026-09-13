"use client";

import { useMemo, useState } from "react";
import { Droplets, Plus, RefreshCw, Trash2 } from "lucide-react";
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
    TextField,
    type ResultTone,
} from "@/components/calculators";

type ConcentrationUnit = "w/v%" | "mg/mL" | "mM";
type Category = "drug" | "preservative" | "buffer" | "other";

interface Ingredient {
    id: number;
    name: string;
    concentration: string;
    concentrationUnit: ConcentrationUnit;
    eValue: string;
    category: Category;
}

type Tonicity = "hypotonic" | "isotonic" | "hypertonic";

/* ── Starting formulation, examples and E-values (unchanged) ──────────────── */
const DEFAULT_INGREDIENTS: Ingredient[] = [
    { id: 1, name: "Active Drug", concentration: "1", concentrationUnit: "w/v%", eValue: "0.15", category: "drug" },
    { id: 2, name: "Benzalkonium Chloride", concentration: "0.01", concentrationUnit: "w/v%", eValue: "0.16", category: "preservative" },
    { id: 3, name: "Sodium Chloride", concentration: "0", concentrationUnit: "w/v%", eValue: "1.00", category: "other" },
];

const IV_EXAMPLE: Ingredient[] = [
    { id: 1, name: "Dextrose", concentration: "5", concentrationUnit: "w/v%", eValue: "0.18", category: "other" },
    { id: 2, name: "Sodium Chloride", concentration: "0", concentrationUnit: "w/v%", eValue: "1.00", category: "other" },
];

const COMMON_INGREDIENTS: { name: string; eValue: string; category: Category }[] = [
    { name: "Boric Acid", eValue: "0.50", category: "buffer" },
    { name: "Sodium Borate", eValue: "0.42", category: "buffer" },
    { name: "Dextrose", eValue: "0.18", category: "other" },
    { name: "Mannitol", eValue: "0.18", category: "other" },
    { name: "Glycerin", eValue: "0.34", category: "other" },
    { name: "Phenylephrine HCl", eValue: "0.32", category: "drug" },
    { name: "Tropicamide", eValue: "0.10", category: "drug" },
    { name: "Sodium Phosphate", eValue: "0.29", category: "buffer" },
    { name: "Potassium Phosphate", eValue: "0.40", category: "buffer" },
];

const TONICITY_NOTE: Record<Tonicity, string> = {
    isotonic: "Ideal",
    hypotonic: "May cause irritation",
    hypertonic: "May cause pain",
};

const TONICITY_TONE: Record<Tonicity, ResultTone> = {
    isotonic: "success",
    hypotonic: "warning",
    hypertonic: "danger",
};

/** toFixed without ever printing "-0.00". */
function fixed(value: number, digits: number): string {
    const text = value.toFixed(digits);
    return Number(text) === 0 ? (0).toFixed(digits) : text;
}

/** Concentration converted to % w/v — the previous page's factors, unchanged. */
function toPercent(concentration: number, unit: ConcentrationUnit): number {
    let concentrationPercent = concentration;
    if (unit === "mg/mL") {
        concentrationPercent = concentration / 10; // 1% = 10 mg/mL
    } else if (unit === "mM") {
        // Approximate conversion for small molecules (MW ~180) – simplified
        concentrationPercent = concentration * 0.001; // very rough
    }
    return concentrationPercent;
}

export default function IsotonicityCalculator() {
    const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);

    const nextId = () => (ingredients.length > 0 ? Math.max(...ingredients.map((i) => i.id)) + 1 : 1);

    const addIngredient = () => {
        setIngredients([
            ...ingredients,
            { id: nextId(), name: "", concentration: "", concentrationUnit: "w/v%", eValue: "", category: "drug" },
        ]);
    };

    const addCommonIngredient = (ingredient: (typeof COMMON_INGREDIENTS)[number]) => {
        setIngredients([
            ...ingredients,
            {
                id: nextId(),
                name: ingredient.name,
                concentration: "1",
                concentrationUnit: "w/v%",
                eValue: ingredient.eValue,
                category: ingredient.category,
            },
        ]);
    };

    const removeIngredient = (id: number) => {
        if (ingredients.length <= 1) return;
        setIngredients(ingredients.filter((ing) => ing.id !== id));
    };

    const updateIngredient = (id: number, field: keyof Ingredient, value: string) => {
        setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)));
    };

    /*
     * Live, derived from the ingredient list. The previous page stored the
     * result on Calculate, so editing a row (or loading the IV example) left an
     * out-of-date result showing. The arithmetic is unchanged; a row with a
     * missing or negative concentration, or a missing E-value, is skipped
     * exactly as before.
     */
    const result = useMemo(() => {
        let totalNaClEquivalent = 0;
        const contributions: { id: number; name: string; percent: number; eValue: number; contribution: number }[] = [];

        ingredients.forEach((ingredient) => {
            const concentration = parseFloat(ingredient.concentration);
            const eValue = parseFloat(ingredient.eValue);
            if (isNaN(concentration) || isNaN(eValue) || concentration < 0) return;

            const percent = toPercent(concentration, ingredient.concentrationUnit);
            const contribution = percent * eValue;
            totalNaClEquivalent += contribution;
            contributions.push({ id: ingredient.id, name: ingredient.name, percent, eValue, contribution });
        });

        // NaCl required for isotonicity (0.9% NaCl is isotonic)
        const naclToAdd = Math.max(0, 0.9 - totalNaClEquivalent);

        let tonicity: Tonicity = "isotonic";
        if (totalNaClEquivalent < 0.85) tonicity = "hypotonic";
        else if (totalNaClEquivalent > 0.95) tonicity = "hypertonic";

        // Freezing point depression (ΔTf = 0.52 °C for isotonic)
        const freezingPoint = -0.52 * (totalNaClEquivalent / 0.9);
        // Estimated osmolality (isotonic ~ 290 mOsm/kg)
        const osmolality = 290 * (totalNaClEquivalent / 0.9);

        return { naclEquivalent: totalNaClEquivalent, naclToAdd, tonicity, freezingPoint, osmolality, contributions };
    }, [ingredients]);

    const markerLeft = Math.max(0, Math.min((result.naclEquivalent / 1.8) * 100, 100));

    return (
        <CalculatorShell
            title="Isotonicity Calculator"
            subtitle="Uses sodium chloride equivalents (E-values) to check whether an eye drop or injection is isotonic, and how much sodium chloride to add if it is not."
            icon={Droplets}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A solution with the same osmotic pressure as body fluids (0.9% sodium chloride) is
                            isotonic. The E-value of an ingredient is the mass of sodium chloride that has the
                            same osmotic effect as 1 g of that ingredient, so each ingredient&apos;s
                            contribution can be expressed as &quot;% NaCl&quot; and added up.
                        </p>
                        <CalcList
                            title="Why isotonicity matters"
                            items={[
                                "Prevents ocular discomfort and tissue damage",
                                "Essential for IV solutions (prevents hemolysis)",
                                "Affects drug absorption",
                                "Required by pharmacopoeias",
                            ]}
                        />
                        <CalcList
                            title="Guidelines"
                            items={[
                                "Ophthalmic: 0.6–1.1% NaCl equiv",
                                "IV: 0.45–0.9% acceptable",
                                "IM: small volumes can be hypertonic",
                                "Neonatal: strict isotonicity",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "The mM conversion assumes a small molecule (MW about 180) and is very rough — enter % w/v or mg/mL where you can",
                                "E-values vary with concentration; use the value listed for a concentration close to yours",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Sodium chloride to add"
                value={fixed(result.naclToAdd, 3)}
                unit="g per 100 mL"
                interpretation={`${result.tonicity.toUpperCase()} — ${TONICITY_NOTE[result.tonicity]} · NaCl equivalent ${fixed(result.naclEquivalent, 2)}%`}
                tone={TONICITY_TONE[result.tonicity]}
            />

            <CalcSection title="Isotonicity results">
                <div>
                    <ResultRow
                        label="Tonicity"
                        value={result.tonicity.toUpperCase()}
                        badge={TONICITY_NOTE[result.tonicity]}
                        badgeTone={result.tonicity === "isotonic" ? "success" : result.tonicity === "hypotonic" ? "warning" : "destructive"}
                    />
                    <ResultRow label="Total NaCl equivalent, Σ(C × E)" value={`${fixed(result.naclEquivalent, 2)}%`} />
                    <ResultRow label="NaCl to add" value={`${fixed(result.naclToAdd, 3)}%`} unit="per 100 mL" />
                    <ResultRow label="Freezing point" value={`${fixed(result.freezingPoint, 2)}°C`} />
                    <ResultRow label="Osmolality" value={fixed(result.osmolality, 0)} unit="mOsm/kg" />
                </div>

                <div>
                    <p className="mb-8 text-sm font-medium text-foreground">Tonicity scale</p>
                    <div className="relative h-4 rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400">
                        <div
                            className="absolute -bottom-1 -top-1 w-1 -translate-x-1/2 rounded-full bg-foreground"
                            style={{ left: `${markerLeft}%` }}
                        >
                            <span
                                className="absolute -top-6 text-xs font-semibold tabular-nums text-foreground"
                                style={{
                                    left: "50%",
                                    // Keep the label inside the bar at either end.
                                    transform: `translateX(${markerLeft < 10 ? "-10%" : markerLeft > 90 ? "-90%" : "-50%"})`,
                                }}
                            >
                                {fixed(result.naclEquivalent, 2)}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
                        <span>0% (Water)</span>
                        <span className="text-center">0.9% (Isotonic)</span>
                        <span className="text-right">1.8% (Hypertonic)</span>
                    </div>
                </div>
            </CalcSection>

            <CalcSection
                title="Formulation ingredients"
                description="Each ingredient's concentration and E-value. Rows missing either value are left out of the total."
            >
                <div className="space-y-3">
                    {ingredients.map((ingredient, index) => {
                        const concentration = parseFloat(ingredient.concentration);
                        const eValue = parseFloat(ingredient.eValue);
                        return (
                            <div key={ingredient.id} className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
                                <div className="flex items-end gap-2">
                                    <TextField
                                        label={`Ingredient ${index + 1}`}
                                        value={ingredient.name}
                                        onChange={(value) => updateIngredient(ingredient.id, "name", value)}
                                        placeholder="Name"
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeIngredient(ingredient.id)}
                                        disabled={ingredients.length <= 1}
                                        aria-label={`Remove ${ingredient.name || `ingredient ${index + 1}`}`}
                                        className="h-12 w-12 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                                <FieldGrid className="mt-3">
                                    <NumberField
                                        label="Concentration"
                                        value={ingredient.concentration}
                                        onChange={(value) => updateIngredient(ingredient.id, "concentration", value)}
                                        units={["w/v%", "mg/mL", "mM"]}
                                        unit={ingredient.concentrationUnit}
                                        onUnitChange={(value) => updateIngredient(ingredient.id, "concentrationUnit", value)}
                                        step="0.001"
                                        placeholder="0.00"
                                        error={concentration < 0 ? "Cannot be negative — this row is left out." : undefined}
                                    />
                                    <NumberField
                                        label="E-value (NaCl equivalent)"
                                        value={ingredient.eValue}
                                        onChange={(value) => updateIngredient(ingredient.id, "eValue", value)}
                                        step="0.001"
                                        placeholder="E-value"
                                        hint={ingredient.eValue.trim() === "" ? "Needed for this row to count." : undefined}
                                        error={eValue < 0 ? "E-values are never negative — check this value." : undefined}
                                    />
                                </FieldGrid>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={addIngredient}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                    <Plus className="h-4 w-4" />
                    Add Another Ingredient
                </button>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Add a common ingredient (at 1% w/v)</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_INGREDIENTS.map((ing) => (
                            <button
                                key={ing.name}
                                type="button"
                                onClick={() => addCommonIngredient(ing)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {ing.name} <span className="font-normal text-muted-foreground">E: {ing.eValue}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setIngredients(IV_EXAMPLE)}
                            className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                        >
                            IV Example <span className="font-normal text-muted-foreground">Dextrose 5%</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIngredients(DEFAULT_INGREDIENTS)}
                            className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                        >
                            Eye drop <span className="font-normal text-muted-foreground">drug 1% + BAK 0.01%</span>
                        </button>
                    </div>
                </div>

                <Button variant="outline" onClick={() => setIngredients(DEFAULT_INGREDIENTS)} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            <CalcSection title="Working" description="Each counted ingredient converted to % w/v and multiplied by its E-value.">
                <div>
                    {result.contributions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No row has both a concentration and an E-value yet.</p>
                    ) : (
                        result.contributions.map((row, index) => (
                            <ResultRow
                                key={row.id}
                                label={row.name || `Ingredient ${index + 1}`}
                                value={`${Number(row.percent.toPrecision(6))}% × ${row.eValue} = ${Number(row.contribution.toPrecision(6))}`}
                                unit="% NaCl"
                            />
                        ))
                    )}
                </div>
            </CalcSection>

            <CalcSection title="Formulation instructions">
                <p className="text-sm leading-relaxed text-foreground">
                    To make this formulation isotonic, add <strong>{fixed(result.naclToAdd, 3)} g</strong> of sodium
                    chloride per 100 mL.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Alternatives: Dextrose {fixed(result.naclToAdd / 0.18, 2)}%, Glycerin {fixed(result.naclToAdd / 0.34, 2)}%,
                    Boric acid {fixed(result.naclToAdd / 0.5, 2)}%.
                </p>
            </CalcSection>

            <CalcSection title="Common E-values">
                <div>
                    <ResultRow label="Sodium Chloride" value="1.00" />
                    <ResultRow label="Dextrose" value="0.18" />
                    <ResultRow label="Boric Acid" value="0.50" />
                    <ResultRow label="Glycerin" value="0.34" />
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Σ(C × E) = 0.9%</Formula>
                <p>C = concentration (% w/v), E = NaCl equivalent, 0.9% = isotonic NaCl.</p>
                <Formula>NaCl to add (g/100 mL) = 0.9 − Σ(C × E), never below 0</Formula>
                <Formula>Freezing point ≈ −0.52 °C × Σ(C × E) / 0.9</Formula>
                <Formula>Osmolality ≈ 290 mOsm/kg × Σ(C × E) / 0.9</Formula>
                <p>
                    Concentrations are converted to % w/v first: mg/mL ÷ 10, and mM × 0.001 (a rough
                    approximation). The formulation is called isotonic when Σ(C × E) is between 0.85% and
                    0.95%, hypotonic below and hypertonic above. An alternative tonicity agent replaces the
                    sodium chloride in proportion to its E-value (e.g. dextrose: NaCl to add ÷ 0.18).
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What exactly is an E-value?",
                        a: "The grams of sodium chloride that produce the same osmotic effect as 1 g of the substance. Boric acid has E = 0.50, so 1 g of boric acid behaves osmotically like 0.5 g of NaCl.",
                    },
                    {
                        q: "Where do I find an ingredient's E-value?",
                        a: "Remington, the Merck Index and most pharmaceutics textbooks tabulate them. A common list is built into this page; for anything else, type the value into the E-value field.",
                    },
                    {
                        q: "Why does the Sodium Chloride row start at 0?",
                        a: "It is there so you can check a finished formula: enter the NaCl you plan to add and confirm the tonicity reads ISOTONIC. Leave it at 0 to see how much the other ingredients still need.",
                    },
                    {
                        q: "Can a hypertonic solution be used?",
                        a: "Sometimes. Small-volume intramuscular injections and some eye drops tolerate hypertonicity, but it can sting or cause pain; large-volume IV fluids and neonatal products should be kept isotonic.",
                    },
                    {
                        q: "Is the osmolality figure measured?",
                        a: "No — it is scaled from the NaCl equivalent (0.9% ≈ 290 mOsm/kg). It is a teaching estimate; a product's real osmolality is measured with an osmometer.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
