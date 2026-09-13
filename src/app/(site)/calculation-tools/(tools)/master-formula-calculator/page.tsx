"use client";

import { useMemo, useRef, useState } from "react";
import { Calculator, FlaskConical, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  fieldError,
  toNumber,
} from "@/components/calculators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BATCH_UNITS,
  INGREDIENT_UNITS,
  compatibleBatchUnits,
  formatAmount,
  formatFactor,
  isPercent,
  isQs,
  scaleFormula,
  type IngredientInput,
} from "./_scale";

// ─── EXAMPLE ─────────────────────────────────────────────────────────────────

/**
 * The worked example the tool was specified with. A teaching example of the
 * arithmetic, not a pharmacopoeial formula — the official monographs differ.
 */
const EXAMPLE = {
  name: "Simple Syrup",
  masterQty: "1000",
  masterUnit: "mL",
  desiredQty: "100",
  desiredUnit: "mL",
  ingredients: [
    { name: "Sucrose", quantity: "650", unit: "g" },
    { name: "Purified Water", quantity: "350", unit: "mL" },
  ],
};

const blankRow = (id: number): IngredientInput => ({ id, name: "", quantity: "", unit: "g" });

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function MasterFormulaCalculator() {
  // Row ids only need to be stable React keys; a counter is enough.
  const nextId = useRef(3);
  const [formulation, setFormulation] = useState("");
  const [masterQty, setMasterQty] = useState("");
  const [masterUnit, setMasterUnit] = useState("mL");
  const [desiredQty, setDesiredQty] = useState("");
  const [desiredUnit, setDesiredUnit] = useState("mL");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([blankRow(1), blankRow(2)]);
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Derived from the inputs, never copied into state, so an edit after
  // Calculate updates the card instead of leaving a stale answer on screen.
  const result = useMemo(
    () => scaleFormula(masterQty, masterUnit, desiredQty, desiredUnit, ingredients),
    [masterQty, masterUnit, desiredQty, desiredUnit, ingredients],
  );

  const desiredUnits = compatibleBatchUnits(masterUnit);

  const changeMasterUnit = (unit: string) => {
    setMasterUnit(unit);
    // 1000 mL of syrup cannot be scaled to 50 tablets — keep the desired unit
    // in the same family, falling back to the master's own unit.
    if (!compatibleBatchUnits(unit).includes(desiredUnit)) setDesiredUnit(unit);
  };

  const updateRow = (id: number, patch: Partial<IngredientInput>) =>
    setIngredients((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () => setIngredients((rows) => [...rows, blankRow(nextId.current++)]);

  const removeRow = (id: number) =>
    setIngredients((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setFormulation("");
    setMasterQty(""); setMasterUnit("mL");
    setDesiredQty(""); setDesiredUnit("mL");
    setIngredients([blankRow(nextId.current++), blankRow(nextId.current++)]);
    setSubmitted(false);
  };

  const loadExample = () => {
    setFormulation(EXAMPLE.name);
    setMasterQty(EXAMPLE.masterQty); setMasterUnit(EXAMPLE.masterUnit);
    setDesiredQty(EXAMPLE.desiredQty); setDesiredUnit(EXAMPLE.desiredUnit);
    setIngredients(EXAMPLE.ingredients.map((row) => ({ ...row, id: nextId.current++ })));
  };

  const errors = {
    masterQty: fieldError(masterQty, { show: submitted }),
    desiredQty: fieldError(desiredQty, { show: submitted }),
  };

  const rowErrors = (row: IngredientInput): string | undefined => {
    if (submitted && !row.name.trim()) return "Enter the ingredient name, or remove this row.";
    if (isQs(row.unit)) return undefined;
    const quantityError = fieldError(row.quantity, { show: submitted });
    if (quantityError) return `Quantity: ${quantityError}`;
    if (isPercent(row.unit) && (toNumber(row.quantity) ?? 0) > 100) return "A percentage cannot be more than 100.";
    return undefined;
  };

  const title = formulation.trim() || "Unnamed formulation";
  const hasPercent = result?.ingredients.some((row) => row.kind === "percent");
  const hasQs = result?.ingredients.some((row) => row.kind === "qs");

  return (
    <CalculatorShell
      title="Master Formula Calculator"
      subtitle="Enter a master formula and the quantity you want to prepare — every ingredient is scaled for you, in its own unit."
      icon={FlaskConical}
      eyebrow="Dosage Form Lab"
      aside={
        <>
          <CalcAbout title="About the master formula">
            <p>
              A <strong>master formula</strong> lists every ingredient needed to make a standard batch of a
              preparation — say 1000 mL of syrup or 100 g of ointment. In the lab you rarely make the full batch,
              so each quantity is multiplied by the same <strong>scaling factor</strong>.
            </p>
            <CalcList
              title="Works for any dosage form"
              items={[
                "Syrups, elixirs, solutions and suspensions (mL, L)",
                "Ointments, creams, pastes and powders (g, kg)",
                "Tablets, capsules and suppositories (counts)",
              ]}
            />
            <CalcList
              tone="caution"
              title="Common mistakes"
              items={[
                "Dividing the wrong way round — it is desired ÷ master",
                "Scaling a percentage: 10% stays 10% in any batch size",
                "Mixing L and mL in the batch size — this page converts for you",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Formulation" description="The master batch the formula is written for, and how much you want to make.">
        <TextField
          label="Formulation name"
          value={formulation}
          onChange={setFormulation}
          placeholder="e.g. Simple Syrup"
        />
        <FieldGrid>
          <NumberField
            label="Master formula batch size"
            value={masterQty}
            onChange={setMasterQty}
            units={BATCH_UNITS}
            unit={masterUnit}
            onUnitChange={changeMasterUnit}
            min={0}
            placeholder="1000"
            error={errors.masterQty}
            hint="The quantity the master formula makes."
          />
          <NumberField
            label="Desired quantity"
            value={desiredQty}
            onChange={setDesiredQty}
            units={desiredUnits}
            unit={desiredUnit}
            onUnitChange={setDesiredUnit}
            min={0}
            placeholder="100"
            error={errors.desiredQty}
            hint="The quantity you want to prepare."
          />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Master formula ingredients" description="Enter each ingredient exactly as it appears in the master formula.">
        {/* Column labels from sm up; on a phone each field carries a placeholder and an aria-label instead. */}
        <div
          aria-hidden="true"
          className="hidden gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_6.5rem_2.75rem]"
        >
          <span>Ingredient</span>
          <span>Quantity</span>
          <span>Unit</span>
          <span />
        </div>

        <div className="space-y-3">
          {ingredients.map((row, index) => {
            const error = rowErrors(row);
            return (
              <div key={row.id} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0">
                <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_2.75rem] gap-2 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_6.5rem_2.75rem]">
                  <Input
                    value={row.name}
                    maxLength={80}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                    placeholder={`Ingredient ${index + 1}`}
                    aria-label={`Ingredient ${index + 1} name`}
                    aria-invalid={submitted && !row.name.trim() ? true : undefined}
                    className="col-span-3 sm:col-span-1"
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    value={isQs(row.unit) ? "" : row.quantity}
                    disabled={isQs(row.unit)}
                    onChange={(event) => updateRow(row.id, { quantity: event.target.value })}
                    placeholder={isQs(row.unit) ? "q.s." : "Quantity"}
                    aria-label={`Ingredient ${index + 1} quantity`}
                    aria-invalid={error?.startsWith("Quantity") ? true : undefined}
                    className="font-medium"
                  />
                  <SelectField
                    aria-label={`Ingredient ${index + 1} unit`}
                    value={row.unit}
                    onChange={(unit) => updateRow(row.id, { unit })}
                    options={INGREDIENT_UNITS}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={ingredients.length === 1}
                    aria-label={`Remove ingredient ${index + 1}`}
                    className="h-12 w-11 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 />
                  </Button>
                </div>
                {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
              </div>
            );
          })}
        </div>

        <Button type="button" variant="outline" onClick={addRow} className="w-full border-dashed">
          <Plus />
          Add ingredient
        </Button>
      </CalcSection>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button onClick={calculate} className="col-span-2 bg-blue-600 hover:bg-blue-700 sm:col-span-1">
          <Calculator />
          Calculate
        </Button>
        <Button variant="outline" onClick={reset}>
          <RefreshCw />
          Reset
        </Button>
        <Button variant="outline" onClick={loadExample}>
          <FlaskConical />
          Load example
        </Button>
      </div>

      <div ref={resultRef} className="scroll-mt-24" aria-live="polite">
        {submitted && result ? (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="h-1 bg-gradient-to-r from-brandBlue to-brandGreen" aria-hidden="true" />

            <dl className="grid grid-cols-1 divide-y divide-border/70 border-b border-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                ["Formulation", title],
                ["Required Quantity", `${formatAmount(toNumber(desiredQty) ?? 0)} ${desiredUnit}`],
                ["Scaling Factor", formatFactor(result.factor)],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-3.5 sm:px-5 sm:py-4">
                  <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-lg font-bold tracking-[-0.02em] text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/50">
                    <th scope="col" className="px-4 py-2.5 font-semibold text-foreground sm:px-5">Ingredient</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-foreground sm:px-5">
                      Master Formula
                      <span className="block text-xs font-normal text-muted-foreground">
                        {formatAmount(toNumber(masterQty) ?? 0)} {masterUnit}
                      </span>
                    </th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-foreground sm:px-5">
                      Required Quantity
                      <span className="block text-xs font-normal text-muted-foreground">
                        {formatAmount(toNumber(desiredQty) ?? 0)} {desiredUnit}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.ingredients.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-foreground sm:px-5">{row.name}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground sm:px-5">{row.master}</td>
                      <td className="px-4 py-3 font-bold tabular-nums text-foreground sm:px-5">{row.required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(hasPercent || hasQs) && (
              <div className="space-y-1 border-t border-border/70 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-5">
                {hasPercent && <p><strong className="text-foreground">%</strong> — a concentration, so it is the same in any batch size and is not multiplied.</p>}
                {hasQs && <p><strong className="text-foreground">q.s.</strong> — add enough to make up to the required quantity.</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Scaled formula</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : "Enter the master formula and the quantity to prepare, then press Calculate."}
            </p>
          </div>
        )}
      </div>

      {submitted && result && (
        <FormulaNote title="Calculation Details">
          <Formula>Scaling Factor = Desired Quantity ÷ Master Formula Quantity</Formula>
          {result.conversion && <p>First, the desired quantity in the master formula&apos;s unit: {result.conversion}</p>}
          <Formula>
            {formatAmount(result.desiredInMasterUnit)} ÷ {formatAmount(toNumber(masterQty) ?? 0)} = {formatFactor(result.factor)}
          </Formula>
          <p className="font-medium text-foreground">For each ingredient:</p>
          <Formula>Required Quantity = Master Formula Quantity × Scaling Factor</Formula>
          <div className="space-y-1.5 font-mono text-[13px] text-foreground">
            {result.ingredients.map((row) => (
              <p key={row.id}>{row.working}</p>
            ))}
          </div>
        </FormulaNote>
      )}

      <CalcFaq
        items={[
          { q: "What is a scaling factor?", a: "The number every ingredient is multiplied by to change the batch size. It is the desired quantity divided by the master formula quantity: to make 100 mL from a 1000 mL formula, 100 ÷ 1000 = 0.1, so each quantity becomes one tenth." },
          { q: "Can I scale a formula up as well as down?", a: "Yes. If the desired quantity is larger than the master batch the factor is greater than 1 — making 2 L from a 500 mL formula gives 2000 ÷ 500 = 4." },
          { q: "Why is a percentage ingredient not scaled?", a: "A percentage is a concentration, not an amount. A preparation containing 10% glycerin contains 10% glycerin whether you make 1000 mL or 100 mL, so the percentage is carried over unchanged." },
          { q: "How should I enter 'q.s.' (quantity sufficient)?", a: "Choose q.s. as the unit. It has no quantity of its own — in the scaled formula it becomes 'q.s. to' the required quantity, meaning add enough of that ingredient to make up the final volume or weight." },
        ]}
      />
    </CalculatorShell>
  );
}
