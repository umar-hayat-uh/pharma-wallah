"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, FlaskConical, FlaskRound, Plus, Sigma, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabReport,
  LabActions,
  ModeSwitch,
  TextField,
  LabNotice,
  type LabReportData,
  toNumber,
  fieldError,
  formatSig,
  calculatorHref,
  molarMassFromFormula,
  MASS_TO_G,
  AMOUNT_TO_MOL,
} from "@/components/calculators";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Mode = "simple" | "reaction";
type MassUnit = "mg" | "g" | "kg";
type AmountUnit = MassUnit | "mmol" | "mol";

type ReactantRow = {
  id: number;
  name: string;
  formula: string;
  amount: string;
  unit: AmountUnit;
  mw: string;
  coeff: string;
};

type ProductRow = { id: number; name: string; formula: string; mw: string; coeff: string };

const MASS_UNITS: MassUnit[] = ["mg", "g", "kg"];
const AMOUNT_UNITS: AmountUnit[] = ["mg", "g", "kg", "mmol", "mol"];

const isMassUnit = (unit: AmountUnit): unit is MassUnit => unit in MASS_TO_G;

// ─── EXAMPLES ────────────────────────────────────────────────────────────────
// Molecular weights here are computed from the formula with IUPAC atomic
// weights, not typed from memory, so the examples cannot carry a wrong MW.

const mw = (formula: string) => {
  const result = molarMassFromFormula(formula);
  return result.ok ? result.molarMass.toFixed(2) : "";
};

const SIMPLE_EXAMPLES = [
  {
    label: "Aspirin from salicylic acid",
    amount: "2.00", unit: "g" as MassUnit,
    reactantMw: mw("C7H6O3"), productMw: mw("C9H8O4"),
    reactantCoeff: "1", productCoeff: "1",
  },
  {
    label: "Paracetamol from p-aminophenol",
    amount: "3.00", unit: "g" as MassUnit,
    reactantMw: mw("C6H7NO"), productMw: mw("C8H9NO2"),
    reactantCoeff: "1", productCoeff: "1",
  },
  {
    label: "Mg(OH)₂ from MgCl₂·6H₂O",
    amount: "8.00", unit: "g" as MassUnit,
    reactantMw: mw("MgCl2·6H2O"), productMw: mw("Mg(OH)2"),
    reactantCoeff: "1", productCoeff: "1",
  },
];

let nextId = 100;
const newId = () => ++nextId;

const REACTION_EXAMPLES: {
  label: string;
  reactants: Omit<ReactantRow, "id">[];
  products: Omit<ProductRow, "id">[];
}[] = [
  {
    label: "Aspirin synthesis",
    reactants: [
      { name: "Salicylic acid", formula: "C7H6O3", amount: "2.00", unit: "g", mw: mw("C7H6O3"), coeff: "1" },
      { name: "Acetic anhydride", formula: "C4H6O3", amount: "5.40", unit: "g", mw: mw("C4H6O3"), coeff: "1" },
    ],
    products: [
      { name: "Aspirin", formula: "C9H8O4", mw: mw("C9H8O4"), coeff: "1" },
      { name: "Acetic acid", formula: "C2H4O2", mw: mw("C2H4O2"), coeff: "1" },
    ],
  },
  {
    label: "Milk of magnesia (2 : 1)",
    reactants: [
      { name: "Sodium hydroxide", formula: "NaOH", amount: "4.00", unit: "g", mw: mw("NaOH"), coeff: "2" },
      { name: "Magnesium chloride hexahydrate", formula: "MgCl2·6H2O", amount: "8.00", unit: "g", mw: mw("MgCl2·6H2O"), coeff: "1" },
    ],
    products: [
      { name: "Magnesium hydroxide", formula: "Mg(OH)2", mw: mw("Mg(OH)2"), coeff: "1" },
      { name: "Sodium chloride", formula: "NaCl", mw: mw("NaCl"), coeff: "2" },
    ],
  },
];

const blankReactant = (): ReactantRow => ({ id: newId(), name: "", formula: "", amount: "", unit: "g", mw: "", coeff: "1" });
const blankProduct = (): ProductRow => ({ id: newId(), name: "", formula: "", mw: "", coeff: "1" });

// ─── PURE CALCULATION ────────────────────────────────────────────────────────

/** Relative tolerance for "these two reactants run out together". */
const TIE = 1e-9;

type ReactantResult = {
  row: ReactantRow;
  label: string;
  massG: number | null;
  mwValue: number | null;
  moles: number;
  coeff: number;
  ratio: number;
};

type ReactionResult = {
  reactants: ReactantResult[];
  extent: number;
  limiting: ReactantResult[];
  excess: (ReactantResult & { consumed: number; remaining: number; remainingG: number | null })[];
  products: { row: ProductRow; label: string; moles: number; massG: number | null; mwValue: number | null; coeff: number }[];
};

function reactantLabel(row: { name: string; formula: string }, index: number, kind: string) {
  return row.name.trim() || row.formula.trim() || `${kind} ${index + 1}`;
}

function computeReaction(reactants: ReactantRow[], products: ProductRow[]): ReactionResult | null {
  if (reactants.length === 0 || products.length === 0) return null;

  const reactantResults: ReactantResult[] = [];
  for (let index = 0; index < reactants.length; index++) {
    const row = reactants[index];
    const amount = toNumber(row.amount);
    const coeff = toNumber(row.coeff);
    const mwValue = toNumber(row.mw);
    if (amount === null || amount <= 0 || coeff === null || coeff <= 0) return null;

    let moles: number;
    let massG: number | null;
    if (isMassUnit(row.unit)) {
      // A mass cannot become moles without a molecular weight — never guess one.
      if (mwValue === null || mwValue <= 0) return null;
      massG = amount * MASS_TO_G[row.unit];
      moles = massG / mwValue;
    } else {
      if (mwValue !== null && mwValue <= 0) return null;
      moles = amount * AMOUNT_TO_MOL[row.unit];
      massG = mwValue ? moles * mwValue : null;
    }
    reactantResults.push({
      row, label: reactantLabel(row, index, "Reactant"),
      massG, mwValue, moles, coeff, ratio: moles / coeff,
    });
  }

  const productResults: ReactionResult["products"] = [];
  const extent = Math.min(...reactantResults.map((r) => r.ratio));
  for (let index = 0; index < products.length; index++) {
    const row = products[index];
    const coeff = toNumber(row.coeff);
    const mwValue = toNumber(row.mw);
    if (coeff === null || coeff <= 0 || mwValue === null || mwValue <= 0) return null;
    const moles = extent * coeff;
    productResults.push({
      row, label: reactantLabel(row, index, "Product"),
      moles, massG: moles * mwValue, mwValue, coeff,
    });
  }

  const isLimiting = (r: ReactantResult) => Math.abs(r.ratio - extent) <= TIE * Math.max(extent, 1e-300);
  const limiting = reactantResults.filter(isLimiting);
  const excess = reactantResults
    .filter((r) => !isLimiting(r))
    .map((r) => {
      const consumed = extent * r.coeff;
      const remaining = r.moles - consumed;
      return { ...r, consumed, remaining, remainingG: r.mwValue ? remaining * r.mwValue : null };
    });

  return { reactants: reactantResults, extent, limiting, excess, products: productResults };
}

// ─── UI PIECES ───────────────────────────────────────────────────────────────

/**
 * A molecular-weight field that can offer — never impose — the molar mass of
 * a formula. The student's typed value is what the calculation uses.
 */
function FormulaSuggestion({ formula, mwValue, onUse }: { formula: string; mwValue: string; onUse: (mw: string) => void }) {
  if (!formula.trim()) return null;
  const parsed = molarMassFromFormula(formula);
  if (!parsed.ok) {
    return <p className="text-xs text-amber-700">Formula not recognised: {parsed.error}</p>;
  }
  const suggestion = parsed.molarMass.toFixed(2);
  const entered = toNumber(mwValue);
  const matches = entered !== null && Math.abs(entered - parsed.molarMass) < 0.01;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span>
        {formula.trim()} = <span className="font-semibold tabular-nums text-foreground">{suggestion}</span> g/mol
        (IUPAC atomic weights)
      </span>
      {matches ? (
        <span className="font-medium text-green-700">matches your MW</span>
      ) : (
        <button
          type="button"
          onClick={() => onUse(suggestion)}
          className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Use {suggestion}
        </button>
      )}
    </p>
  );
}

function RowShell({ index, kind, onRemove, canRemove, children }: {
  index: number; kind: "Reactant" | "Product"; onRemove: () => void; canRemove: boolean; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className={kind === "Reactant" ? "grid h-6 w-6 place-items-center rounded-md bg-blue-600 text-xs text-white" : "grid h-6 w-6 place-items-center rounded-md bg-green-500 text-xs text-white"}>
            {index + 1}
          </span>
          {kind}
        </p>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${kind.toLowerCase()} ${index + 1}`}>
            <Trash2 />
            Remove
          </Button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function TheoreticalYieldCalculator() {
  const [mode, setMode] = useState<Mode>("simple");
  const [submitted, setSubmitted] = useState(false);
  const [sample, setSample] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  // Simple mode
  const [amount, setAmount] = useState("");
  const [amountUnit, setAmountUnit] = useState<MassUnit>("g");
  const [reactantMw, setReactantMw] = useState("");
  const [productMw, setProductMw] = useState("");
  const [reactantCoeff, setReactantCoeff] = useState("1");
  const [productCoeff, setProductCoeff] = useState("1");

  // Reaction mode
  const [reactants, setReactants] = useState<ReactantRow[]>([blankReactant(), blankReactant()]);
  const [products, setProducts] = useState<ProductRow[]>([blankProduct()]);
  const [targetId, setTargetId] = useState<number | null>(null);

  const updateReactant = (id: number, patch: Partial<ReactantRow>) =>
    setReactants((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const updateProduct = (id: number, patch: Partial<ProductRow>) =>
    setProducts((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  // ── Simple mode maths ──
  const simple = useMemo(() => {
    const m = toNumber(amount);
    const mwR = toNumber(reactantMw);
    const mwP = toNumber(productMw);
    const a = toNumber(reactantCoeff);
    const c = toNumber(productCoeff);
    if ([m, mwR, mwP, a, c].some((v) => v === null || v <= 0)) return null;
    const massG = m! * MASS_TO_G[amountUnit];
    const reactantMoles = massG / mwR!;
    const ratio = c! / a!;
    const productMoles = reactantMoles * ratio;
    const yieldG = productMoles * mwP!;
    return { massG, reactantMoles, ratio, productMoles, yieldG, mwR: mwR!, mwP: mwP!, a: a!, c: c!, m: m! };
  }, [amount, amountUnit, reactantMw, productMw, reactantCoeff, productCoeff]);

  // ── Reaction mode maths ──
  const reaction = useMemo(() => computeReaction(reactants, products), [reactants, products]);
  const target = reaction
    ? reaction.products.find((p) => p.row.id === targetId) ?? reaction.products[0]
    : null;

  // ── The lab record ──
  const report: LabReportData | null = useMemo(() => {
    const base = { title: "Theoretical Yield", context: "Chemistry / Preparation Lab", sample: sample.trim() || undefined };

    if (mode === "simple") {
      if (!simple) return null;
      return {
        ...base,
        result: { label: "Theoretical yield of product", value: formatSig(simple.yieldG, 4), unit: "g" },
        sections: [
          {
            title: "Given data",
            rows: [
              { label: "Mass of limiting reactant", value: amount.trim(), unit: amountUnit },
              { label: "Stoichiometric coefficient — reactant (a)", value: reactantCoeff.trim() },
              { label: "Stoichiometric coefficient — product (c)", value: productCoeff.trim() },
            ],
          },
          {
            title: "Molecular weights",
            rows: [
              { label: "Limiting reactant", value: reactantMw.trim(), unit: "g/mol" },
              { label: "Desired product", value: productMw.trim(), unit: "g/mol" },
            ],
          },
          {
            title: "Moles",
            formulas: [
              "Moles = Mass / Molecular weight",
              ...(amountUnit !== "g" ? [`Mass = ${amount.trim()} ${amountUnit} = ${formatSig(simple.massG, 6)} g`] : []),
              `Moles of reactant = ${amountUnit === "g" ? amount.trim() : formatSig(simple.massG, 6)} g / ${reactantMw.trim()} g/mol = ${formatSig(simple.reactantMoles, 5)} mol`,
            ],
          },
          {
            title: "Limiting reagent",
            lines: [
              "Entered as the limiting reactant. This mode does not compare reactants — use Reaction stoichiometry mode to determine which reactant limits the yield.",
            ],
          },
          {
            title: "Stoichiometric ratio",
            formulas: [`Product : reactant = c : a = ${productCoeff.trim()} : ${reactantCoeff.trim()} = ${formatSig(simple.ratio, 5)}`],
          },
          {
            title: "Product moles",
            formulas: [
              "Product moles = Reactant moles × (c / a)",
              `= ${formatSig(simple.reactantMoles, 5)} × ${formatSig(simple.ratio, 5)} = ${formatSig(simple.productMoles, 5)} mol`,
            ],
          },
          {
            title: "Theoretical yield",
            formulas: [
              "Theoretical yield = Product moles × Product molecular weight",
              `= ${formatSig(simple.productMoles, 5)} mol × ${productMw.trim()} g/mol = ${formatSig(simple.yieldG, 5)} g`,
            ],
            rows: [
              { label: "Theoretical yield", value: formatSig(simple.yieldG, 4), unit: "g" },
              // Sub-gram preparations are usually weighed and recorded in mg.
              ...(simple.yieldG < 1
                ? [{ label: "Theoretical yield (mg)", value: formatSig(simple.yieldG * 1000, 4), unit: "mg" }]
                : []),
            ],
          },
        ],
        notes: [
          "Theoretical yield assumes complete conversion of the limiting reactant with no side reactions or losses.",
          "Molecular weights are as entered. For a hydrate, use the molecular weight of the hydrate you actually weighed.",
        ],
      };
    }

    if (!reaction || !target) return null;
    const equation = `${reaction.reactants.map((r) => `${formatSig(r.coeff, 4)} ${r.row.formula.trim() || r.label}`).join(" + ")} → ${reaction.products
      .map((p) => `${formatSig(p.coeff, 4)} ${p.row.formula.trim() || p.label}`)
      .join(" + ")}`;
    const limitingNames = reaction.limiting.map((r) => r.label).join(" and ");

    return {
      ...base,
      result: {
        label: `Theoretical yield of ${target.label}`,
        value: target.massG !== null ? formatSig(target.massG, 4) : "—",
        unit: "g",
      },
      warnings:
        reaction.limiting.length > 1
          ? [`${limitingNames} are present in exactly stoichiometric proportions — they are consumed together and there is no single limiting reactant.`]
          : undefined,
      sections: [
        {
          title: "Given data",
          formulas: [equation],
          table: {
            columns: ["Reactant", "Formula", "Amount", "Coefficient"],
            rows: reaction.reactants.map((r) => [r.label, r.row.formula.trim() || "—", `${r.row.amount.trim()} ${r.row.unit}`, formatSig(r.coeff, 4)]),
          },
        },
        {
          title: "Molecular weights",
          rows: [
            ...reaction.reactants.map((r) => ({ label: r.label, value: r.mwValue ? r.row.mw.trim() : "not entered", unit: r.mwValue ? "g/mol" : undefined })),
            ...reaction.products.map((p) => ({ label: p.label, value: p.row.mw.trim(), unit: "g/mol" })),
          ],
        },
        {
          title: "Moles",
          formulas: reaction.reactants.map((r) =>
            r.massG !== null && isMassUnit(r.row.unit)
              ? `n(${r.label}) = ${r.row.unit === "g" ? r.row.amount.trim() : `${r.row.amount.trim()} ${r.row.unit} = ${formatSig(r.massG, 6)}`} g / ${r.row.mw.trim()} g/mol = ${formatSig(r.moles, 5)} mol`
              : `n(${r.label}) = ${r.row.amount} ${r.row.unit} = ${formatSig(r.moles, 5)} mol`,
          ),
        },
        {
          title: "Limiting reagent",
          table: {
            columns: ["Reactant", "Moles", "Coefficient", "Moles ÷ coefficient", "Role"],
            rows: reaction.reactants.map((r) => [
              r.label, formatSig(r.moles, 5), formatSig(r.coeff, 4), formatSig(r.ratio, 5),
              reaction.limiting.includes(r) ? "Limiting" : "Excess",
            ]),
          },
          lines: [
            `The reactant with the smallest moles ÷ coefficient runs out first: ${limitingNames}.`,
            ...reaction.excess.map(
              (r) => `${r.label} is in excess: ${formatSig(r.consumed, 5)} mol consumed, ${formatSig(r.remaining, 5)} mol left over${r.remainingG !== null ? ` (${formatSig(r.remainingG, 4)} g)` : ""}.`,
            ),
          ],
        },
        {
          title: "Stoichiometric ratio",
          formulas: [
            `Reaction extent ξ = min(n ÷ coefficient) = ${formatSig(reaction.extent, 5)} mol`,
            ...reaction.products.map((p) => `${p.label} : ${reaction.limiting[0].label} = ${formatSig(p.coeff, 4)} : ${formatSig(reaction.limiting[0].coeff, 4)}`),
          ],
        },
        {
          title: "Product moles",
          formulas: reaction.products.map((p) => `n(${p.label}) = ξ × ${formatSig(p.coeff, 4)} = ${formatSig(reaction.extent, 5)} × ${formatSig(p.coeff, 4)} = ${formatSig(p.moles, 5)} mol`),
        },
        {
          title: "Theoretical yield",
          formulas: reaction.products.map((p) => `m(${p.label}) = ${formatSig(p.moles, 5)} mol × ${p.row.mw.trim()} g/mol = ${formatSig(p.massG!, 5)} g`),
          table: {
            columns: ["Product", "Theoretical moles", "Theoretical mass"],
            rows: reaction.products.map((p) => [p.label, `${formatSig(p.moles, 5)} mol`, `${formatSig(p.massG!, 4)} g`]),
          },
        },
      ],
      notes: [
        "Theoretical yield assumes complete conversion of the limiting reactant with no side reactions or losses.",
        "Molecular weights are as entered by the student; formula-derived values use IUPAC standard atomic weights.",
      ],
    };
  }, [mode, simple, reaction, target, sample, amount, amountUnit, reactantMw, productMw, reactantCoeff, productCoeff]);

  // ── Validation ──
  const show = submitted;
  const simpleErrors = {
    amount: fieldError(amount, { show }),
    reactantMw: fieldError(reactantMw, { show }),
    productMw: fieldError(productMw, { show }),
    reactantCoeff: fieldError(reactantCoeff, { show }),
    productCoeff: fieldError(productCoeff, { show }),
  };

  const calculate = () => {
    setSubmitted(true);
    // Let the errors or the card render, then bring whichever it is into view.
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setAmount(""); setAmountUnit("g"); setReactantMw(""); setProductMw(""); setReactantCoeff("1"); setProductCoeff("1");
    setReactants([blankReactant(), blankReactant()]);
    setProducts([blankProduct()]);
    setTargetId(null);
  };

  const yieldGrams = mode === "simple" ? simple?.yieldG ?? null : target?.massG ?? null;
  const productName = mode === "simple" ? "" : target?.label ?? "";

  return (
    <CalculatorShell
      title="Theoretical Yield Calculator"
      subtitle="The maximum mass of product a reaction can give — from the limiting reactant and the balanced equation."
      icon={FlaskConical}
      aside={
        <>
          <CalcAbout title="About theoretical yield">
            <p>
              <strong>Theoretical yield</strong> is the mass of product you would isolate if the limiting
              reactant were converted completely, with no side reactions and nothing lost during filtration,
              washing, drying or recrystallisation. It is the denominator of every percentage yield.
            </p>
            <CalcList
              title="The three steps"
              items={[
                "Convert each reactant's mass to moles using its molecular weight",
                "Divide by the coefficient in the balanced equation — the smallest value is the limiting reactant",
                "Scale by the product's coefficient and multiply by its molecular weight",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you trust it"
              items={[
                "The equation must be balanced — coefficients come from you, not from the calculator",
                "Use the MW of the form you weighed: a hydrate, a salt or a free base differ",
                "A liquid reagent measured by volume must be converted to mass with its density first",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="Calculation mode"
        value={mode}
        onChange={(next) => { setMode(next); setSubmitted(false); }}
        options={[
          { value: "simple", label: "Simple", description: "One limiting reactant → one product", icon: Sigma },
          { value: "reaction", label: "Reaction stoichiometry", description: "Find the limiting reactant", icon: FlaskRound },
        ]}
      />

      <CalcSection title="Experiment">
        <TextField
          label="Preparation / sample name (optional)"
          value={sample}
          onChange={setSample}
          placeholder="e.g. Preparation of aspirin — Batch 2"
          hint="Printed on the lab result card."
        />
      </CalcSection>

      {mode === "simple" ? (
        <CalcSection title="Reactant and product" description="Enter the limiting reactant — the one that runs out first.">
          <FieldGrid>
            <NumberField
              label="Mass of limiting reactant"
              value={amount}
              onChange={setAmount}
              units={MASS_UNITS}
              unit={amountUnit}
              onUnitChange={(u) => setAmountUnit(u as MassUnit)}
              min={0}
              error={simpleErrors.amount}
              hint="As weighed."
            />
            <NumberField
              label="Molecular weight of limiting reactant"
              value={reactantMw}
              onChange={setReactantMw}
              unit="g/mol"
              min={0}
              error={simpleErrors.reactantMw}
            />
            <NumberField
              label="Molecular weight of desired product"
              value={productMw}
              onChange={setProductMw}
              unit="g/mol"
              min={0}
              error={simpleErrors.productMw}
            />
            <div className="hidden sm:block" />
            <NumberField
              label="Coefficient of reactant (a)"
              value={reactantCoeff}
              onChange={setReactantCoeff}
              min={0}
              step="1"
              error={simpleErrors.reactantCoeff}
              hint="From the balanced equation."
            />
            <NumberField
              label="Coefficient of product (c)"
              value={productCoeff}
              onChange={setProductCoeff}
              min={0}
              step="1"
              error={simpleErrors.productCoeff}
              hint="From the balanced equation."
            />
          </FieldGrid>

          <MwHelper onUseReactant={setReactantMw} onUseProduct={setProductMw} reactantMw={reactantMw} productMw={productMw} />

          <Examples
            items={SIMPLE_EXAMPLES.map((example) => ({
              label: example.label,
              apply: () => {
                setAmount(example.amount); setAmountUnit(example.unit);
                setReactantMw(example.reactantMw); setProductMw(example.productMw);
                setReactantCoeff(example.reactantCoeff); setProductCoeff(example.productCoeff);
              },
            }))}
          />
        </CalcSection>
      ) : (
        <>
          <CalcSection title="Reactants" description="Name | Formula | Amount | Unit | Molecular weight | Coefficient">
            {reactants.map((row, index) => {
              const massUnit = isMassUnit(row.unit);
              return (
                <RowShell
                  key={row.id}
                  index={index}
                  kind="Reactant"
                  canRemove={reactants.length > 1}
                  onRemove={() => setReactants((rows) => rows.filter((r) => r.id !== row.id))}
                >
                  <FieldGrid>
                    <TextField label="Name" value={row.name} onChange={(v) => updateReactant(row.id, { name: v })} placeholder="e.g. Salicylic acid" />
                    <TextField label="Formula" value={row.formula} onChange={(v) => updateReactant(row.id, { formula: v })} placeholder="e.g. C7H6O3" inputClassName="font-mono" />
                    <NumberField
                      label="Amount"
                      value={row.amount}
                      onChange={(v) => updateReactant(row.id, { amount: v })}
                      units={AMOUNT_UNITS}
                      unit={row.unit}
                      onUnitChange={(u) => updateReactant(row.id, { unit: u as AmountUnit })}
                      min={0}
                      error={fieldError(row.amount, { show })}
                    />
                    <NumberField
                      label={massUnit ? "Molecular weight" : "Molecular weight (optional)"}
                      value={row.mw}
                      onChange={(v) => updateReactant(row.id, { mw: v })}
                      unit="g/mol"
                      min={0}
                      error={fieldError(row.mw, { show, required: massUnit })}
                      hint={massUnit ? undefined : "Only needed to report the excess as a mass."}
                    />
                    <NumberField
                      label="Stoichiometric coefficient"
                      value={row.coeff}
                      onChange={(v) => updateReactant(row.id, { coeff: v })}
                      min={0}
                      step="1"
                      error={fieldError(row.coeff, { show })}
                    />
                  </FieldGrid>
                  <FormulaSuggestion formula={row.formula} mwValue={row.mw} onUse={(v) => updateReactant(row.id, { mw: v })} />
                </RowShell>
              );
            })}
            <Button variant="outline" className="w-full border-dashed" onClick={() => setReactants((rows) => [...rows, blankReactant()])} disabled={reactants.length >= 6}>
              <Plus />
              Add reactant
            </Button>
          </CalcSection>

          <CalcSection title="Products" description="Name | Formula | Molecular weight | Coefficient. Choose the desired product.">
            {products.map((row, index) => (
              <RowShell
                key={row.id}
                index={index}
                kind="Product"
                canRemove={products.length > 1}
                onRemove={() => setProducts((rows) => rows.filter((r) => r.id !== row.id))}
              >
                <FieldGrid>
                  <TextField label="Name" value={row.name} onChange={(v) => updateProduct(row.id, { name: v })} placeholder="e.g. Aspirin" />
                  <TextField label="Formula" value={row.formula} onChange={(v) => updateProduct(row.id, { formula: v })} placeholder="e.g. C9H8O4" inputClassName="font-mono" />
                  <NumberField
                    label="Molecular weight"
                    value={row.mw}
                    onChange={(v) => updateProduct(row.id, { mw: v })}
                    unit="g/mol"
                    min={0}
                    error={fieldError(row.mw, { show })}
                  />
                  <NumberField
                    label="Stoichiometric coefficient"
                    value={row.coeff}
                    onChange={(v) => updateProduct(row.id, { coeff: v })}
                    min={0}
                    step="1"
                    error={fieldError(row.coeff, { show })}
                  />
                </FieldGrid>
                <FormulaSuggestion formula={row.formula} mwValue={row.mw} onUse={(v) => updateProduct(row.id, { mw: v })} />
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-foreground">
                  <input
                    type="radio"
                    name="target-product"
                    className="h-4 w-4 accent-blue-600"
                    checked={(targetId ?? products[0].id) === row.id}
                    onChange={() => setTargetId(row.id)}
                  />
                  Desired product (headline result and percentage-yield hand-off)
                </label>
              </RowShell>
            ))}
            <Button variant="outline" className="w-full border-dashed" onClick={() => setProducts((rows) => [...rows, blankProduct()])} disabled={products.length >= 4}>
              <Plus />
              Add product
            </Button>
          </CalcSection>

          <CalcSection>
            <Examples
              items={REACTION_EXAMPLES.map((example) => ({
                label: example.label,
                apply: () => {
                  const nextReactants = example.reactants.map((r) => ({ ...r, id: newId() }));
                  const nextProducts = example.products.map((p) => ({ ...p, id: newId() }));
                  setReactants(nextReactants);
                  setProducts(nextProducts);
                  setTargetId(nextProducts[0].id);
                },
              }))}
            />
            <LabNotice tone="info">
              Molecular weights are never filled in for you. Type the MW from your manual, or type a formula and
              press <strong>Use</strong> to accept the value computed from IUPAC atomic weights.
            </LabNotice>
          </CalcSection>
        </>
      )}

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="theoretical-yield">
        {yieldGrams !== null && (
          <Button asChild className="col-span-2 bg-green-500 text-white hover:bg-green-600 sm:col-span-1">
            <a
              href={calculatorHref("percentage-yield-calculator", {
                theoretical: yieldGrams.toPrecision(6),
                unit: "g",
                ...(productName ? { product: productName } : {}),
                ...(sample.trim() ? { sample: sample.trim() } : {}),
              })}
            >
              Use theoretical yield for percentage yield
              <ArrowRight />
            </a>
          </Button>
        )}
      </LabActions>

      <div ref={reportRef} className="scroll-mt-24">
        {report ? (
          <LabReport data={report} />
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : mode === "simple"
                  ? "Enter the mass, both molecular weights and the coefficients."
                  : "Enter every reactant's amount, MW and coefficient, and each product's MW and coefficient."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>Moles = Mass / Molecular weight</Formula>
        <Formula>Product moles = Reactant moles × (Product coefficient / Reactant coefficient)</Formula>
        <Formula>Theoretical yield = Product moles × Product molecular weight</Formula>
        <p>
          With several reactants, divide each reactant&apos;s moles by its coefficient. The smallest quotient is the
          reaction extent ξ — the number of &ldquo;reaction units&rdquo; that can actually happen — and belongs to the
          limiting reactant. Every product forms as ξ × its coefficient; every other reactant is left over by its
          moles − ξ × its coefficient.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why is the limiting reactant not simply the one with the smallest mass?", a: "Because reactions consume moles in the ratio of the balanced equation, not grams. A heavy molecule gives few moles per gram, and a coefficient of 2 means that reactant is used twice as fast. Only moles ÷ coefficient compares reactants fairly." },
          { q: "My reagent is a liquid measured in mL. What do I enter?", a: "Convert the volume to mass first: mass (g) = volume (mL) × density (g/mL). For acetic anhydride, 5.0 mL × 1.08 g/mL = 5.4 g. Then enter the mass with its molecular weight." },
          { q: "Which molecular weight do I use for a hydrate?", a: "The one for the material you weighed. Magnesium chloride hexahydrate (MgCl₂·6H₂O, about 203.3 g/mol) gives far fewer moles per gram than anhydrous MgCl₂ (about 95.2 g/mol). Using the wrong one is the commonest source of an impossible percentage yield." },
          { q: "Can percentage yield exceed 100%?", a: "Not in reality, but it often does on paper: a product that is still wet, contains solvent, or is contaminated with an excess reagent weighs more than pure product. Treat a result above 100% as a sign to dry, purify or re-weigh." },
        ]}
      />
    </CalculatorShell>
  );
}

/** Quick molar-mass lookup for Simple mode, where there are no formula columns. */
function MwHelper({ onUseReactant, onUseProduct, reactantMw, productMw }: {
  onUseReactant: (mw: string) => void; onUseProduct: (mw: string) => void; reactantMw: string; productMw: string;
}) {
  const [reactantFormula, setReactantFormula] = useState("");
  const [productFormula, setProductFormula] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 p-3.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        {open ? "Hide" : "Optional:"} molecular weight from a formula
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <FieldGrid>
            <div className="space-y-1.5">
              <TextField label="Reactant formula" value={reactantFormula} onChange={setReactantFormula} placeholder="e.g. C7H6O3" inputClassName="font-mono" />
              <FormulaSuggestion formula={reactantFormula} mwValue={reactantMw} onUse={onUseReactant} />
            </div>
            <div className="space-y-1.5">
              <TextField label="Product formula" value={productFormula} onChange={setProductFormula} placeholder="e.g. C9H8O4" inputClassName="font-mono" />
              <FormulaSuggestion formula={productFormula} mwValue={productMw} onUse={onUseProduct} />
            </div>
          </FieldGrid>
          <p className="text-xs text-muted-foreground">
            Supports brackets and hydrates, e.g. Ca(OH)2, K4[Fe(CN)6], CuSO4·5H2O. Nothing changes until you press Use.
          </p>
        </div>
      )}
    </div>
  );
}

function Examples({ items }: { items: { label: string; apply: () => void }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Try a worked example</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.apply}
            className="min-h-[36px] rounded-full border bg-background px-3 py-2 text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
