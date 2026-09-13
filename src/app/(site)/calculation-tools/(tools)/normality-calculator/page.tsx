"use client";

import { useMemo, useState } from "react";
import { Droplets, RefreshCw, Scale } from "lucide-react";
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
} from "@/components/calculators";
import { cn } from "@/lib/utils";

type SubstanceType = "solid" | "liquid";
type VolumeUnit = "mL" | "L" | "μL";
type MassUnit = "g" | "mg" | "μg";
type CalculationMode = "concentration" | "amount";
type EqMethod = "eqWeight" | "molecularWeight";

interface Chemical {
  name: string;
  formula: string;
  molecularWeight: number;
  nFactor: number;
  eqWeight: number;
}

/* ── Reference data (unchanged from the original page) ───────────────────── */
const CHEMICALS: Chemical[] = [
  { name: "Hydrochloric Acid", formula: "HCl", molecularWeight: 36.46, nFactor: 1, eqWeight: 36.46 },
  { name: "Sulfuric Acid", formula: "H₂SO₄", molecularWeight: 98.08, nFactor: 2, eqWeight: 49.04 },
  { name: "Sodium Hydroxide", formula: "NaOH", molecularWeight: 40.0, nFactor: 1, eqWeight: 40.0 },
  { name: "Calcium Hydroxide", formula: "Ca(OH)₂", molecularWeight: 74.09, nFactor: 2, eqWeight: 37.05 },
  { name: "Potassium Permanganate", formula: "KMnO₄", molecularWeight: 158.03, nFactor: 5, eqWeight: 31.61 },
  { name: "Sodium Carbonate", formula: "Na₂CO₃", molecularWeight: 105.99, nFactor: 2, eqWeight: 53.0 },
];

const VOLUME_TO_L: Record<VolumeUnit, number> = { "μL": 0.000001, mL: 0.001, L: 1 };
const MASS_TO_G: Record<MassUnit, number> = { "μg": 0.000001, mg: 0.001, g: 1 };

const N_FACTOR_GUIDE = [
  { type: "Acids", examples: "HCl:1, H₂SO₄:2, H₃PO₄:3", rule: "Number of H⁺ ions" },
  { type: "Bases", examples: "NaOH:1, Ca(OH)₂:2", rule: "Number of OH⁻ ions" },
  { type: "Salts", examples: "Na₂CO₃:2, KMnO₄:5", rule: "Total charge" },
  { type: "Redox Agents", examples: "KMnO₄:5, K₂Cr₂O₇:6", rule: "Electrons transferred" },
];

function getNormalityInterpretation(value: number) {
  if (value < 0.001) return "Very dilute solution";
  if (value < 0.01) return "Dilute solution";
  if (value < 0.1) return "Moderately dilute solution";
  if (value < 1) return "Standard concentration";
  if (value < 5) return "Concentrated solution";
  return "Very concentrated solution";
}

/** The original's display rule for normality. */
const formatNormality = (n: number) => (n < 0.001 ? n.toExponential(3) : n.toFixed(4));

/** MW ÷ n when both are valid — the original then wrote it back, rounded to 2 dp, as the equivalent weight. */
function eqFromMw(mwRaw: string, nfRaw: string): number | null {
  const mw = parseFloat(mwRaw);
  const nf = parseFloat(nfRaw);
  return !isNaN(mw) && !isNaN(nf) && mw > 0 && nf > 0 ? mw / nf : null;
}

function positiveError(raw: string, message = "Must be greater than 0."): string | undefined {
  const value = parseFloat(raw);
  return !isNaN(value) && value <= 0 ? message : undefined;
}

export default function NormalityCalculator() {
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("concentration");
  const [substanceType, setSubstanceType] = useState<SubstanceType>("solid");
  const [amount, setAmount] = useState("1");
  const [targetNormality, setTargetNormality] = useState("1");
  const [eqWeight, setEqWeight] = useState("36.46");
  const [volume, setVolume] = useState("1");
  const [specificGravity, setSpecificGravity] = useState("1.0");
  const [purity, setPurity] = useState("100");
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("L");
  const [massUnit, setMassUnit] = useState<MassUnit>("g");
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [calculateBy, setCalculateBy] = useState<EqMethod>("eqWeight");
  const [molecularWeight, setMolecularWeight] = useState("36.46");
  const [nFactor, setNFactor] = useState("1");

  /*
   * The original kept the equivalent-weight field in sync from a useEffect: in
   * MW mode, whenever MW and n were valid it stored (MW / n).toFixed(2). That
   * stored value is what "Use Equivalent Weight" shows afterwards, and what MW
   * mode falls back to when MW or n becomes invalid — so it is kept, written at
   * the same moments, from the handlers instead of an effect.
   */
  const syncEq = (method: EqMethod, mwRaw: string, nfRaw: string) => {
    const eq = eqFromMw(mwRaw, nfRaw);
    if (method === "molecularWeight" && eq !== null) setEqWeight(eq.toFixed(2));
  };

  const loadChemical = (chemical: Chemical) => {
    setSelectedChemical(chemical);
    setMolecularWeight(chemical.molecularWeight.toString());
    setNFactor(chemical.nFactor.toString());
    setEqWeight(chemical.eqWeight.toString());
    syncEq(calculateBy, chemical.molecularWeight.toString(), chemical.nFactor.toString());
  };

  const changeMethod = (method: EqMethod) => {
    setCalculateBy(method);
    syncEq(method, molecularWeight, nFactor);
  };

  const result = useMemo(() => {
    const vol = parseFloat(volume);
    const sg = parseFloat(specificGravity);
    const pur = parseFloat(purity);

    // In MW mode the unrounded MW / n is used; otherwise (or if MW/n is invalid) the stored Eq.W.
    const fromMw = calculateBy === "molecularWeight" ? eqFromMw(molecularWeight, nFactor) : null;
    const finalEqWeight = fromMw ?? parseFloat(eqWeight);

    // Validation is the original's, including sg/purity for solids (NaN sg or purity slip through).
    if (isNaN(finalEqWeight) || finalEqWeight <= 0 || isNaN(vol) || vol <= 0 || sg <= 0 || pur < 0 || pur > 100) {
      return null;
    }

    const volumeInLiters = vol * VOLUME_TO_L[volumeUnit];

    if (calculationMode === "concentration") {
      const amountVal = parseFloat(amount);
      if (isNaN(amountVal) || amountVal <= 0) return null;

      const normality =
        substanceType === "solid"
          ? (amountVal * MASS_TO_G[massUnit]) / (finalEqWeight * volumeInLiters)
          : (amountVal * sg * (pur / 100)) / (finalEqWeight * volumeInLiters);

      // A blank specific gravity or purity gave "NaN" on the original page; show nothing instead.
      if (!isFinite(normality)) return null;
      return { kind: "concentration" as const, normality, volumeInLiters };
    }

    const targetN = parseFloat(targetNormality);
    if (isNaN(targetN) || targetN <= 0) return null;

    const requiredAmount =
      substanceType === "solid"
        ? targetN * finalEqWeight * volumeInLiters // grams
        : (targetN * finalEqWeight * volumeInLiters) / (sg * (pur / 100)); // mL of liquid

    if (!isFinite(requiredAmount)) return null;
    return { kind: "amount" as const, requiredAmount, volumeInLiters };
  }, [
    calculationMode, substanceType, amount, targetNormality, eqWeight, volume,
    specificGravity, purity, volumeUnit, massUnit, calculateBy, molecularWeight, nFactor,
  ]);

  const reset = () => {
    setCalculationMode("concentration");
    setSubstanceType("solid");
    setAmount("1");
    setTargetNormality("1");
    setEqWeight("36.46");
    setVolume("1");
    setSpecificGravity("1.0");
    setPurity("100");
    setVolumeUnit("L");
    setMassUnit("g");
    setSelectedChemical(null);
    setCalculateBy("eqWeight");
    setMolecularWeight("36.46");
    setNFactor("1");
  };

  const isLiquid = substanceType === "liquid";
  const litres = (parseFloat(volume) * VOLUME_TO_L[volumeUnit]).toFixed(4);

  const headline =
    result?.kind === "concentration"
      ? formatNormality(result.normality)
      : result?.kind === "amount"
        ? result.requiredAmount.toFixed(4)
        : null;

  const purityValue = parseFloat(purity);
  const purityError =
    !isNaN(purityValue) && (purityValue < 0 || purityValue > 100) ? "Purity must be between 0 and 100%." : undefined;

  return (
    <CalculatorShell
      title="Normality Calculator"
      subtitle="Calculates the normality of a solution, or how much solid or liquid reagent you need for a target normality."
      icon={Scale}
      eyebrow="Pharmaceutical Chemistry"
      aside={
        <>
          <CalcAbout title="About normality">
            <p>
              Normality (N) is the number of gram equivalents of a substance per litre of solution. One
              equivalent is the amount that supplies or reacts with one mole of H⁺, OH⁻ or electrons, so
              normality counts reacting capacity rather than molecules.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Preparing standard acid, base or redox solutions for titration",
                "Converting between the mass of a solid and the normality it gives",
                "Diluting a concentrated liquid reagent (e.g. conc. H₂SO₄ or HCl) to a set normality",
              ]}
            />
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                n-factor guidelines
              </p>
              <div className="mt-2.5 space-y-2">
                {N_FACTOR_GUIDE.map((item) => (
                  <div key={item.type} className="rounded-lg border border-border/70 px-3 py-2">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm font-medium text-foreground">
                      {item.type}
                      <span className="text-xs font-normal text-primary">{item.rule}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.examples}</p>
                  </div>
                ))}
              </div>
            </div>
            <CalcList
              tone="caution"
              title="Read with care"
              items={[
                "The n-factor depends on the reaction: KMnO₄ is 5 in acid but 3 in neutral solution",
                "For liquids, purity is the % w/w assay on the bottle label and sg its specific gravity",
                "Always add concentrated acid to water, never water to acid",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="I want to calculate"
        value={calculationMode}
        onChange={setCalculationMode}
        options={[
          { value: "concentration", label: "Normality from amount", description: "You know how much you dissolved" },
          { value: "amount", label: "Amount from target normality", description: "How much to weigh or measure" },
        ]}
      />

      <ModeSwitch
        label="Substance type"
        value={substanceType}
        onChange={setSubstanceType}
        options={[
          { value: "solid", label: "Solid", description: "Weighed, e.g. NaOH pellets", icon: Scale },
          { value: "liquid", label: "Liquid", description: "Measured, e.g. conc. H₂SO₄", icon: Droplets },
        ]}
      />

      <ResultCard
        label={
          calculationMode === "concentration" ? "Normality" : isLiquid ? "Required Volume" : "Required Mass"
        }
        value={headline}
        unit={calculationMode === "concentration" ? "N (eq/L)" : isLiquid ? "mL" : "g"}
        interpretation={
          result?.kind === "concentration"
            ? getNormalityInterpretation(result.normality)
            : result?.kind === "amount"
              ? `${isLiquid ? "Measure" : "Weigh"} this, then make up to ${volume} ${volumeUnit} for ${targetNormality} N`
              : undefined
        }
        className={cn(headline && headline.length > 10 && "[&>p:first-of-type>span:first-child]:break-all [&>p:first-of-type>span:first-child]:text-4xl")}
        empty={
          calculationMode === "concentration"
            ? `Enter the equivalent weight, the ${isLiquid ? "liquid volume, specific gravity, purity" : "mass"} and the final volume.`
            : `Enter the equivalent weight, target normality${isLiquid ? ", specific gravity, purity" : ""} and final volume.`
        }
      />

      <CalcSection title="Reagent" description="Pick a common reagent, or enter its equivalent weight yourself.">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick chemical selection</p>
          <div className="flex flex-wrap gap-2">
            {CHEMICALS.map((chemical) => {
              const active = selectedChemical?.formula === chemical.formula;
              return (
                <button
                  key={chemical.formula}
                  type="button"
                  onClick={() => loadChemical(chemical)}
                  aria-pressed={active}
                  className={cn(
                    "min-h-[40px] rounded-full border px-3 py-2 text-left text-xs font-medium",
                    active ? "border-primary bg-primary/10 text-primary" : "bg-background hover:bg-muted active:bg-accent",
                  )}
                >
                  {chemical.formula}
                  <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{chemical.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ModeSwitch
          label="Equivalent weight method"
          value={calculateBy}
          onChange={changeMethod}
          options={[
            { value: "eqWeight", label: "Use Equivalent Weight", description: "You know Eq.W" },
            { value: "molecularWeight", label: "Use MW & n-factor", description: "Eq.W = MW ÷ n" },
          ]}
        />

        {calculateBy === "eqWeight" ? (
          <NumberField
            label="Gram equivalent weight (Eq.W)"
            value={eqWeight}
            onChange={(next) => {
              setEqWeight(next);
              setSelectedChemical(null);
            }}
            unit="g/eq"
            step="0.001"
            placeholder="e.g. 36.46"
            hint="MW divided by n-factor. HCl 36.46, NaOH 40.00, H₂SO₄ 49.04."
            error={positiveError(eqWeight)}
          />
        ) : (
          <FieldGrid>
            <NumberField
              label="Molecular weight (MW)"
              value={molecularWeight}
              onChange={(next) => {
                setMolecularWeight(next);
                setSelectedChemical(null);
                syncEq(calculateBy, next, nFactor);
              }}
              unit="g/mol"
              step="0.001"
              placeholder="e.g. 36.46"
              hint="From the label or a periodic table."
              error={positiveError(molecularWeight)}
            />
            <NumberField
              label="n-factor"
              value={nFactor}
              onChange={(next) => {
                setNFactor(next);
                setSelectedChemical(null);
                syncEq(calculateBy, molecularWeight, next);
              }}
              unit="eq/mol"
              step="1"
              placeholder="e.g. 1 for HCl"
              hint="Acidity, basicity, or redox electrons."
              error={positiveError(nFactor, "Must be greater than 0 — the last valid Eq.W is used until then.")}
            />
          </FieldGrid>
        )}
      </CalcSection>

      <CalcSection title="Inputs">
        <FieldGrid>
          {calculationMode === "concentration" ? (
            isLiquid ? (
              <NumberField
                label="Amount of liquid (A)"
                value={amount}
                onChange={setAmount}
                unit="mL"
                step="0.001"
                placeholder="e.g. 2.8"
                hint="Volume of the concentrated liquid reagent taken."
                error={positiveError(amount)}
              />
            ) : (
              <NumberField
                label="Amount of solid"
                value={amount}
                onChange={setAmount}
                unit={massUnit}
                units={["g", "mg", "μg"]}
                onUnitChange={(next) => setMassUnit(next as MassUnit)}
                step="0.001"
                placeholder="e.g. 1"
                hint="Mass weighed out and dissolved."
                error={positiveError(amount)}
              />
            )
          ) : (
            <NumberField
              label="Target normality (N)"
              value={targetNormality}
              onChange={setTargetNormality}
              unit="eq/L"
              step="0.001"
              placeholder="e.g. 0.1"
              hint="Titrants are usually 0.01–1 N."
              error={positiveError(targetNormality)}
            />
          )}

          <NumberField
            label="Final volume of solution (V)"
            value={volume}
            onChange={setVolume}
            unit={volumeUnit}
            units={["mL", "L", "μL"]}
            onUnitChange={(next) => setVolumeUnit(next as VolumeUnit)}
            step="0.001"
            placeholder="e.g. 1"
            hint="Volume after making up in a volumetric flask."
            error={positiveError(volume)}
          />

          {isLiquid && (
            <>
              <NumberField
                label="Specific gravity (sg)"
                value={specificGravity}
                onChange={setSpecificGravity}
                unit="g/mL"
                step="0.001"
                placeholder="e.g. 1.0"
                hint="On the label: conc. H₂SO₄ ≈ 1.84, conc. HCl ≈ 1.19."
                error={positiveError(specificGravity)}
              />
              <NumberField
                label="Purity (%)"
                value={purity}
                onChange={setPurity}
                unit="%"
                step="0.1"
                min={0}
                max={100}
                placeholder="e.g. 100"
                hint="Assay on the label: conc. H₂SO₄ ≈ 98%, conc. HCl ≈ 37%."
                error={purityError}
              />
            </>
          )}
        </FieldGrid>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
          <div>
            <ResultRow label="Equivalent weight" value={eqWeight} unit="g/eq" />
            <ResultRow label="Final volume" value={`${volume} ${volumeUnit} = ${litres}`} unit="L" />
            {calculateBy === "molecularWeight" && (
              <>
                <ResultRow label="Molecular weight" value={molecularWeight} unit="g/mol" />
                <ResultRow label="n-factor" value={nFactor} unit="eq/mol" />
              </>
            )}
            {selectedChemical && (
              <ResultRow
                label={`${selectedChemical.formula} · ${selectedChemical.name}`}
                value={`MW ${selectedChemical.molecularWeight} · n ${selectedChemical.nFactor} · Eq.W ${selectedChemical.eqWeight.toFixed(2)}`}
              />
            )}
          </div>
          <Formula>
            {calculationMode === "concentration"
              ? substanceType === "solid"
                ? `N = (${amount} ${massUnit} = ${(parseFloat(amount) * MASS_TO_G[massUnit]).toFixed(4)} g) / (${eqWeight} × ${litres})`
                : `N = (${amount} × ${specificGravity} × ${purity}%) / (${eqWeight} × ${litres})`
              : substanceType === "solid"
                ? `Mass (g) = ${targetNormality} × ${eqWeight} × ${litres}`
                : `Volume (mL) = (${targetNormality} × ${eqWeight} × ${litres}) / (${specificGravity} × ${purity}%)`}
            {" = "}
            <strong>{headline}</strong>
          </Formula>
        </CalcSection>
      )}

      <FormulaNote>
        <p className="font-medium text-foreground">For solids:</p>
        <Formula>N = (mass in g) / (Eq.W × volume in L)</Formula>
        <p className="font-medium text-foreground">For liquids:</p>
        <Formula>N = (A × sg × purity%) / (Eq.W × V)</Formula>
        <Formula>Required mass (g) = N × Eq.W × V · Required volume (mL) = (N × Eq.W × V) / (sg × purity%)</Formula>
        <p>
          <strong className="text-foreground">N</strong> — normality (eq/L). <strong className="text-foreground">Eq.W</strong> —
          equivalent weight = MW / n. <strong className="text-foreground">mass</strong> — mass of solid, converted to
          grams. <strong className="text-foreground">A</strong> — amount of liquid (mL).{" "}
          <strong className="text-foreground">sg</strong> — specific gravity (g/mL).{" "}
          <strong className="text-foreground">purity%</strong> — percentage purity, used as a decimal.{" "}
          <strong className="text-foreground">V</strong> — final volume, converted to litres.
        </p>
        <p>
          For a liquid, A × sg gives the mass of liquid taken, and × purity leaves only the mass of the pure
          substance. Dividing mass by Eq.W gives equivalents; dividing by litres gives normality.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What is the difference between normality and molarity?",
            a: "Molarity counts moles per litre; normality counts equivalents per litre. N = M × n-factor, so 1 M H₂SO₄ (n = 2) is 2 N, while 1 M HCl (n = 1) is 1 N.",
          },
          {
            q: "How do I find the n-factor?",
            a: "For acids it is the number of replaceable H⁺, for bases the number of OH⁻, for salts the total cation charge, and for oxidising or reducing agents the electrons gained or lost per molecule in that reaction.",
          },
          {
            q: "Why does the liquid mode need specific gravity and purity?",
            a: "Concentrated reagents are measured by volume but are not pure. Volume × specific gravity gives the mass of liquid, and purity tells you how much of that mass is the actual acid or base.",
          },
          {
            q: "Why is my result shown in scientific notation?",
            a: "Normalities below 0.001 N are shown as, for example, 2.743e-8 — that means 2.743 × 10⁻⁸ N. Check the mass unit if you did not expect such a dilute solution.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
