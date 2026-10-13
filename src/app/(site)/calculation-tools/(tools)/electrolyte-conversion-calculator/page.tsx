"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Atom, RefreshCw } from "lucide-react";
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
    LabNotice,
    ModeSwitch,
    type ModeOption,
} from "@/components/calculators";

type Electrolyte = {
    name: string;
    formula: string;
    molecularWeight: number;
    valence: number;
    commonForms: string[];
};

type ConversionType = "mmol_to_mg" | "mg_to_mmol" | "mEq_to_mg" | "mg_to_mEq";
type AmountUnit = "mg" | "mmol" | "mEq";

/* ── Reference data (unchanged) ───────────────────────────────────────────── */
const ELECTROLYTES: Record<string, Electrolyte> = {
    sodium: { name: "Sodium (Na⁺)", formula: "Na", molecularWeight: 22.99, valence: 1, commonForms: ["NaCl", "NaHCO₃"] },
    potassium: { name: "Potassium (K⁺)", formula: "K", molecularWeight: 39.1, valence: 1, commonForms: ["KCl", "KAcetate"] },
    calcium: { name: "Calcium (Ca²⁺)", formula: "Ca", molecularWeight: 40.08, valence: 2, commonForms: ["CaCl₂", "CaGluconate"] },
    magnesium: { name: "Magnesium (Mg²⁺)", formula: "Mg", molecularWeight: 24.31, valence: 2, commonForms: ["MgSO₄", "MgCl₂"] },
    chloride: { name: "Chloride (Cl⁻)", formula: "Cl", molecularWeight: 35.45, valence: 1, commonForms: ["NaCl", "KCl"] },
    bicarbonate: { name: "Bicarbonate (HCO₃⁻)", formula: "HCO₃", molecularWeight: 61.02, valence: 1, commonForms: ["NaHCO₃"] },
    phosphate: { name: "Phosphate (PO₄³⁻)", formula: "PO₄", molecularWeight: 94.97, valence: 3, commonForms: ["KPhosphate", "NaPhosphate"] },
};

const ELECTROLYTE_OPTIONS = Object.entries(ELECTROLYTES).map(([key, e]) => ({ value: key, label: e.name }));

const CLINICAL_SIGNIFICANCE: Record<string, string> = {
    sodium: "Normal serum sodium: 135-145 mEq/L. Critical for fluid balance and nerve function.",
    potassium: "Normal serum potassium: 3.5-5.0 mEq/L. Critical for cardiac function.",
    calcium: "Normal serum calcium: 8.5-10.2 mg/dL. Important for bone health and muscle function.",
    magnesium: "Normal serum magnesium: 1.7-2.2 mg/dL. Cofactor for many enzymes.",
    chloride: "Normal serum chloride: 98-106 mEq/L. Maintains electrical neutrality.",
    bicarbonate: "Normal serum bicarbonate: 22-28 mEq/L. Major blood buffer.",
    phosphate: "Normal serum phosphate: 2.5-4.5 mg/dL. Important for energy metabolism.",
};

const COMMON_CONVERSIONS: { electrolyte: string; type: ConversionType; value: number }[] = [
    { electrolyte: "sodium", type: "mEq_to_mg", value: 20 },
    { electrolyte: "potassium", type: "mEq_to_mg", value: 10 },
    { electrolyte: "calcium", type: "mEq_to_mg", value: 10 },
    { electrolyte: "magnesium", type: "mEq_to_mg", value: 12 },
    { electrolyte: "chloride", type: "mEq_to_mg", value: 20 },
];

const CONVERSION_UNITS: Record<ConversionType, { from: AmountUnit; to: AmountUnit }> = {
    mmol_to_mg: { from: "mmol", to: "mg" },
    mg_to_mmol: { from: "mg", to: "mmol" },
    mEq_to_mg: { from: "mEq", to: "mg" },
    mg_to_mEq: { from: "mg", to: "mEq" },
};

const REVERSE: Record<ConversionType, ConversionType> = {
    mmol_to_mg: "mg_to_mmol",
    mg_to_mmol: "mmol_to_mg",
    mEq_to_mg: "mg_to_mEq",
    mg_to_mEq: "mEq_to_mg",
};

const MODE_OPTIONS: ModeOption<ConversionType>[] = [
    { value: "mmol_to_mg", label: "mmol → mg", description: "Millimole to milligram" },
    { value: "mg_to_mmol", label: "mg → mmol", description: "Milligram to millimole" },
    { value: "mEq_to_mg", label: "mEq → mg", description: "Milliequivalent to milligram" },
    { value: "mg_to_mEq", label: "mg → mEq", description: "Milligram to milliequivalent" },
];

const PRECISION_OPTIONS = [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} digits` }));

/** The previous page's four conversions, unchanged. */
function convert(value: number, e: Electrolyte, type: ConversionType): number {
    switch (type) {
        case "mmol_to_mg":
            return value * e.molecularWeight;
        case "mg_to_mmol":
            return value / e.molecularWeight;
        case "mEq_to_mg":
            return value * (e.molecularWeight / e.valence);
        case "mg_to_mEq":
            return value / (e.molecularWeight / e.valence);
    }
}

/**
 * Unchanged from the previous page. Below 10,000 and above 0.001 the number is
 * rounded to `precision` decimal places; outside that band it switches to
 * scientific notation with `precision` significant figures.
 */
function formatNumber(num: number, precision: number): string {
    if (num === 0) return "0";
    if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
        return num.toExponential(precision - 1);
    }
    const factor = Math.pow(10, precision);
    const rounded = Math.round(num * factor) / factor;
    return rounded.toString();
}

const DEFAULTS = { value: "100", electrolyte: "sodium", type: "mmol_to_mg" as ConversionType, precision: "4" };

export default function ElectrolyteConversionCalculator() {
    const [inputValue, setInputValue] = useState(DEFAULTS.value);
    const [selectedElectrolyte, setSelectedElectrolyte] = useState(DEFAULTS.electrolyte);
    const [conversionType, setConversionType] = useState<ConversionType>(DEFAULTS.type);
    const [precision, setPrecision] = useState(DEFAULTS.precision);

    const electrolyte = ELECTROLYTES[selectedElectrolyte];
    const units = CONVERSION_UNITS[conversionType];
    const sigFigs = parseInt(precision);

    const parsed = parseFloat(inputValue);
    const inputError =
        inputValue.trim() !== "" && isNaN(parsed)
            ? "Enter a number."
            : parsed <= 0
              ? "The amount must be greater than zero."
              : undefined;

    /* Derived, not stored — the previous page refreshed state from a useEffect. */
    const result = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || value <= 0) return null;
        const converted = convert(value, electrolyte, conversionType);

        // The same amount in all three units, reached through the same formulas:
        // whichever unit was entered is turned into mg, and mg into the rest.
        const mg =
            units.from === "mg" ? value : units.from === "mmol" ? convert(value, electrolyte, "mmol_to_mg") : convert(value, electrolyte, "mEq_to_mg");
        const amounts: Record<AmountUnit, number> = {
            mg,
            mmol: units.from === "mmol" ? value : convert(mg, electrolyte, "mg_to_mmol"),
            mEq: units.from === "mEq" ? value : convert(mg, electrolyte, "mg_to_mEq"),
        };
        return { converted, amounts };
    }, [inputValue, electrolyte, conversionType, units.from]);

    const formatted = result ? formatNumber(result.converted, sigFigs) : null;

    const reset = () => {
        setInputValue(DEFAULTS.value);
        setSelectedElectrolyte(DEFAULTS.electrolyte);
        setConversionType(DEFAULTS.type);
        setPrecision(DEFAULTS.precision);
    };

    return (
        <CalculatorShell
            title="Electrolyte Conversion Calculator"
            subtitle="Converts an electrolyte amount between milligrams, millimoles (mmol) and milliequivalents (mEq) — for IV fluids, supplements and replacement doses."
            icon={Atom}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Electrolytes are prescribed in mEq or mmol, but salts are weighed in mg. A
                            millimole (mmol) counts particles; a milliequivalent (mEq) counts electrical
                            charge, so for an ion with a charge of 2 — calcium, magnesium — one mmol
                            carries two mEq.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Checking how many mg of an ion a prescribed mEq dose contains",
                                "Comparing a label in mg with an order in mmol",
                                "Reading potassium, sodium or magnesium replacement protocols",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "The mg figures are for the ion alone, not the salt — 1 g of KCl is not 1 g of potassium",
                                "Phosphate's charge varies with pH, so phosphate doses are best prescribed in mmol",
                                "Concentrated potassium must always be diluted and infused at a controlled rate",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Conversion type"
                value={conversionType}
                onChange={setConversionType}
                options={MODE_OPTIONS}
            />

            <ResultCard
                label={`${electrolyte.name} in ${units.to}`}
                value={formatted}
                unit={units.to}
                interpretation={result ? `${inputValue} ${units.from} = ${formatted} ${units.to}` : undefined}
                empty={`Enter an amount in ${units.from} greater than zero.`}
            />

            {result && <LabNotice title="Clinical significance">{CLINICAL_SIGNIFICANCE[selectedElectrolyte]}</LabNotice>}

            <CalcSection title="Convert">
                <FieldGrid>
                    <SelectField
                        label="Electrolyte"
                        value={selectedElectrolyte}
                        onChange={setSelectedElectrolyte}
                        options={ELECTROLYTE_OPTIONS}
                        hint={`MW ${electrolyte.molecularWeight} g/mol · valence ${electrolyte.valence}`}
                    />
                    <NumberField
                        label={`Amount (${units.from})`}
                        value={inputValue}
                        onChange={setInputValue}
                        unit={units.from}
                        placeholder="Enter value"
                        hint={`The amount of ${electrolyte.name.split(" ")[0].toLowerCase()} in ${units.from}.`}
                        error={inputError}
                    />
                </FieldGrid>

                <FieldGrid>
                    <SelectField
                        label="Precision"
                        value={precision}
                        onChange={setPrecision}
                        options={PRECISION_OPTIONS}
                        hint="Decimal places shown. Very large or small answers switch to scientific notation."
                    />
                    <div className="flex items-start sm:pt-[26px]">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConversionType(REVERSE[conversionType])}
                            className="w-full"
                        >
                            <ArrowUpDown />
                            Reverse: {units.to} → {units.from}
                        </Button>
                    </div>
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common electrolyte doses</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_CONVERSIONS.map((conv) => (
                            <button
                                key={conv.electrolyte}
                                type="button"
                                onClick={() => {
                                    setSelectedElectrolyte(conv.electrolyte);
                                    setConversionType(conv.type);
                                    setInputValue(conv.value.toString());
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {conv.value} mEq <span className="font-normal capitalize text-muted-foreground">· {conv.electrolyte}</span>
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
                <CalcSection
                    title="In every unit"
                    description={`${inputValue} ${units.from} of ${electrolyte.name} expressed as mg, mmol and mEq.`}
                >
                    <div>
                        {(["mg", "mmol", "mEq"] as AmountUnit[]).map((unit) => (
                            <ResultRow
                                key={unit}
                                label={unit === "mg" ? "Milligrams" : unit === "mmol" ? "Millimoles" : "Milliequivalents"}
                                value={formatNumber(result.amounts[unit], sigFigs)}
                                unit={unit}
                                badge={unit === units.to ? "Result" : unit === units.from ? "Input" : undefined}
                                badgeTone={unit === units.to ? "default" : "outline"}
                            />
                        ))}
                        <ResultRow label="Molecular weight" value={String(electrolyte.molecularWeight)} unit="g/mol" />
                        <ResultRow label="Valence" value={String(electrolyte.valence)} />
                        <ResultRow label="Common salt forms" value={electrolyte.commonForms.join(", ")} />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Electrolyte reference table">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[34rem] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Electrolyte</th>
                                <th className="px-3 py-2.5 font-medium">Symbol</th>
                                <th className="px-3 py-2.5 font-medium">Molecular weight</th>
                                <th className="px-3 py-2.5 font-medium">Valence</th>
                                <th className="px-3 py-2.5 font-medium">mEq per mmol</th>
                                <th className="px-3 py-2.5 font-medium">mg per mEq</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(ELECTROLYTES).map(([key, e]) => (
                                <tr
                                    key={key}
                                    className={
                                        key === selectedElectrolyte
                                            ? "border-b border-border/70 bg-primary/10"
                                            : "border-b border-border/70"
                                    }
                                >
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">{e.name}</td>
                                    <td className="px-3 py-2.5 font-mono">{e.formula}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{e.molecularWeight.toFixed(2)}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{e.valence}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{e.valence}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{(e.molecularWeight / e.valence).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>mg = mmol × Molecular Weight</Formula>
                <Formula>mg = mEq × (MW ÷ Valence)</Formula>
                <p>
                    The reverse conversions divide instead of multiply. MW ÷ valence is the equivalent
                    weight — the mass that carries one unit of charge. For monovalent ions (valence 1)
                    it equals the molecular weight, so 1 mmol = 1 mEq.
                </p>
                {result && (
                    <Formula>
                        {conversionType === "mmol_to_mg" && `${inputValue} × ${electrolyte.molecularWeight}`}
                        {conversionType === "mg_to_mmol" && `${inputValue} ÷ ${electrolyte.molecularWeight}`}
                        {conversionType === "mEq_to_mg" && `${inputValue} × (${electrolyte.molecularWeight} ÷ ${electrolyte.valence})`}
                        {conversionType === "mg_to_mEq" && `${inputValue} ÷ (${electrolyte.molecularWeight} ÷ ${electrolyte.valence})`}
                        {` = ${formatted} ${units.to}`}
                    </Formula>
                )}
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between mmol and mEq?",
                        a: "A millimole counts particles; a milliequivalent counts charge. mEq = mmol × valence, so for sodium, potassium and chloride they are the same number, while 1 mmol of calcium or magnesium is 2 mEq.",
                    },
                    {
                        q: "Are these mg of the salt or of the ion?",
                        a: "Of the ion alone. To find how much salt to weigh, use the salt's own molecular weight — for example KCl is 74.55 g/mol, so 1 mmol of potassium comes with 74.55 mg of KCl.",
                    },
                    {
                        q: "How many mg is 20 mEq of potassium?",
                        a: "20 × 39.1 ÷ 1 = 782 mg of potassium ion, which is supplied by about 1.49 g of potassium chloride.",
                    },
                    {
                        q: "Why is phosphate tricky?",
                        a: "At body pH phosphate exists as a mix of HPO₄²⁻ and H₂PO₄⁻, so its average charge is not a whole number. That is why phosphate replacement is usually prescribed in mmol rather than mEq.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
