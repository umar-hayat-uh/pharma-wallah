"use client";

import { useMemo, useState } from "react";
import { Scale, Droplets, FlaskConical, Beaker, RefreshCw, Check } from "lucide-react";
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
  ModeSwitch,
  AdSlot,
  type ModeOption,
} from "@/components/calculators";

type SubstanceType = "solid" | "liquid";
type VolumeUnit = "mL" | "L" | "μL";
type MassUnit = "g" | "mg" | "μg";
type CalculationMode = "concentration" | "amount";

/* ── Conversion tables (unchanged) ─────────────────────────────────────────── */
const volumeUnits: { unit: VolumeUnit; conversion: number }[] = [
  { unit: "μL", conversion: 0.000001 },
  { unit: "mL", conversion: 0.001 },
  { unit: "L", conversion: 1 },
];

const massUnits: { unit: MassUnit; conversion: number }[] = [
  { unit: "μg", conversion: 0.000001 },
  { unit: "mg", conversion: 0.001 },
  { unit: "g", conversion: 1 },
];

const MODE_OPTIONS: ModeOption<CalculationMode>[] = [
  { value: "concentration", label: "Molarity from amount", description: "You know how much you dissolved", icon: FlaskConical },
  { value: "amount", label: "Amount from target molarity", description: "You know the molarity you want", icon: Beaker },
];

const SUBSTANCE_OPTIONS: ModeOption<SubstanceType>[] = [
  { value: "solid", label: "Solid", description: "Weighed in g, mg or μg", icon: Scale },
  { value: "liquid", label: "Liquid", description: "Measured in mL, with sg and purity", icon: Droplets },
];

/** Reference solutions from the previous page. Tapping one fills the "amount" mode. */
const COMMON_SOLUTIONS: {
  name: string;
  weight: string;
  volume: string;
  amount: string;
  target: string;
  liquid?: { sg: string; purity: string };
}[] = [
  { name: "1M NaCl", weight: "58.44", volume: "1", amount: "58.44", target: "1" },
  { name: "0.1M HCl", weight: "36.46", volume: "1", amount: "8.3 mL*", target: "0.1", liquid: { sg: "1.19", purity: "37" } },
  { name: "0.5M NaOH", weight: "40.00", volume: "1", amount: "20.00", target: "0.5" },
  { name: "0.01M EDTA", weight: "372.24", volume: "1", amount: "3.7224", target: "0.01" },
  { name: "1M Tris-HCl", weight: "157.60", volume: "1", amount: "157.60", target: "1" },
];

/** Bands and wording carried over unchanged. */
const getMolarityInterpretation = (value: number) => {
  if (value < 0.000001) return "Trace concentration";
  if (value < 0.001) return "Very dilute solution";
  if (value < 0.01) return "Dilute solution";
  if (value < 0.1) return "Moderately dilute solution";
  if (value < 1) return "Standard concentration";
  if (value < 5) return "Concentrated solution";
  return "Very concentrated solution";
};

const positiveError = (raw: string) => {
  const v = parseFloat(raw);
  if (raw === "") return undefined;
  return isNaN(v) || v <= 0 ? "Must be greater than 0." : undefined;
};

export default function MolarityCalculator() {
  const [calculationMode, setCalculationMode] = useState<CalculationMode>("concentration");
  const [substanceType, setSubstanceType] = useState<SubstanceType>("solid");
  const [amount, setAmount] = useState<string>("1"); // used when mode = concentration
  const [targetMolarity, setTargetMolarity] = useState<string>("1"); // used when mode = amount
  const [molecularWeight, setMolecularWeight] = useState<string>("58.44");
  const [volume, setVolume] = useState<string>("1");
  const [specificGravity, setSpecificGravity] = useState<string>("1.0");
  const [purity, setPurity] = useState<string>("100");
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("L");
  const [massUnit, setMassUnit] = useState<MassUnit>("g");

  /*
   * Derived, not stored. The previous page recomputed into state from a
   * useEffect (and also offered a redundant Calculate button), which could
   * leave the "Calculation details" of a previous mode on screen. Guards,
   * formulas and precisions are unchanged; a NaN or Infinity result (empty
   * purity, 0% purity) now shows a message instead of "NaN" / "Infinity".
   */
  const calc = useMemo(() => {
    const mw = parseFloat(molecularWeight);
    const vol = parseFloat(volume);
    const sg = parseFloat(specificGravity);
    const pur = parseFloat(purity);

    if (isNaN(mw) || mw <= 0 || isNaN(vol) || vol <= 0 || sg <= 0 || pur < 0 || pur > 100) {
      let message = "Enter a molecular weight and a final volume above 0.";
      if (sg <= 0) message = "Specific gravity must be greater than 0.";
      if (pur < 0 || pur > 100) message = "Purity must be between 0 and 100%.";
      return { molarity: null, requiredAmount: null, message };
    }

    const volumeInLiters = vol * volumeUnits.find((u) => u.unit === volumeUnit)!.conversion;

    if (calculationMode === "concentration") {
      const amountVal = parseFloat(amount);
      if (isNaN(amountVal) || amountVal <= 0) {
        return { molarity: null, requiredAmount: null, message: "Enter the amount of substance (above 0)." };
      }
      let result: number;
      if (substanceType === "solid") {
        const massInGrams = amountVal * massUnits.find((u) => u.unit === massUnit)!.conversion;
        result = massInGrams / (mw * volumeInLiters);
      } else {
        result = (amountVal * sg * (pur / 100)) / (mw * volumeInLiters);
      }
      if (!Number.isFinite(result)) {
        return { molarity: null, requiredAmount: null, message: "Enter the specific gravity and purity of the liquid." };
      }
      return { molarity: result, requiredAmount: null, message: null };
    }

    const targetM = parseFloat(targetMolarity);
    if (isNaN(targetM) || targetM <= 0) {
      return { molarity: null, requiredAmount: null, message: "Enter the target molarity (above 0)." };
    }
    const required =
      substanceType === "solid"
        ? targetM * mw * volumeInLiters // mass in grams
        : (targetM * mw * volumeInLiters) / (sg * (pur / 100)); // volume of liquid in mL
    if (!Number.isFinite(required)) {
      return {
        molarity: null,
        requiredAmount: null,
        message:
          pur === 0
            ? "Purity is 0%, so no volume of this liquid can reach the target."
            : "Enter the specific gravity and purity of the liquid.",
      };
    }
    return { molarity: targetM, requiredAmount: required, message: null };
  }, [calculationMode, substanceType, amount, targetMolarity, molecularWeight, volume, specificGravity, purity, volumeUnit, massUnit]);

  const { molarity, requiredAmount } = calc;
  const hasResult = calculationMode === "concentration" ? molarity !== null : requiredAmount !== null;
  const litres = (parseFloat(volume) * volumeUnits.find((u) => u.unit === volumeUnit)!.conversion).toFixed(4);

  const substitution =
    calculationMode === "concentration"
      ? substanceType === "solid"
        ? `M = (${amount} ${massUnit} = ${(parseFloat(amount) * massUnits.find((u) => u.unit === massUnit)!.conversion).toFixed(4)} g) / (${molecularWeight} × ${litres})`
        : `M = (${amount} × ${specificGravity} × ${purity}%) / (${molecularWeight} × ${litres})`
      : substanceType === "solid"
        ? `Mass (g) = ${targetMolarity} × ${molecularWeight} × ${litres}`
        : `Volume (mL) = (${targetMolarity} × ${molecularWeight} × ${litres}) / (${specificGravity} × ${purity}%)`;

  const resetCalculator = () => {
    setCalculationMode("concentration");
    setSubstanceType("solid");
    setAmount("1");
    setTargetMolarity("1");
    setMolecularWeight("58.44");
    setVolume("1");
    setSpecificGravity("1.0");
    setPurity("100");
    setVolumeUnit("L");
    setMassUnit("g");
  };

  const loadSolution = (s: (typeof COMMON_SOLUTIONS)[number]) => {
    setCalculationMode("amount");
    setSubstanceType(s.liquid ? "liquid" : "solid");
    setMolecularWeight(s.weight);
    setTargetMolarity(s.target);
    setVolume(s.volume);
    setVolumeUnit("L");
    if (s.liquid) {
      setSpecificGravity(s.liquid.sg);
      setPurity(s.liquid.purity);
    }
  };

  const isSelected = (s: (typeof COMMON_SOLUTIONS)[number]) =>
    calculationMode === "amount" &&
    molecularWeight === s.weight &&
    targetMolarity === s.target &&
    volume === s.volume &&
    volumeUnit === "L" &&
    substanceType === (s.liquid ? "liquid" : "solid");

  return (
    <CalculatorShell
      title="Molarity Calculator"
      subtitle="Work out the molarity of a solution, or how much solid or liquid to use for a target molarity."
      icon={Scale}
      eyebrow="Pharmaceutical Chemistry"
      aside={
        <>
          <CalcAbout title="About molarity">
            <p>
              Molarity (M) is moles of solute per litre of <em>final</em> solution. It is the
              concentration unit used for reagents, buffers and standard solutions in the lab.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Preparing a stock or standard solution to a set molarity",
                "Checking the concentration of a solution you have made",
                "Diluting a concentrated liquid acid such as HCl or H₂SO₄",
              ]}
            />
            <CalcList
              tone="caution"
              title="Watch out for"
              items={[
                "Use the MW of the exact form you weigh — hydrates and salts differ",
                "Make up to the final volume; do not add the solute to that volume",
                "For liquids, sg and purity are on the bottle label or certificate",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-[13px] font-medium text-foreground/90">I want to calculate</p>
        <ModeSwitch label="I want to calculate" value={calculationMode} onChange={setCalculationMode} options={MODE_OPTIONS} />
      </div>

      {calculationMode === "concentration" ? (
        <ResultCard
          label="Molar concentration"
          value={molarity !== null ? (molarity < 0.001 ? molarity.toExponential(3) : molarity.toFixed(4)) : null}
          unit="mol/L (M)"
          interpretation={molarity !== null ? getMolarityInterpretation(molarity) : undefined}
          empty={calc.message ?? "Enter the values below to see the molarity."}
          className="[overflow-wrap:anywhere]"
        />
      ) : (
        <ResultCard
          label={substanceType === "solid" ? "Required mass" : "Required volume"}
          value={requiredAmount !== null ? requiredAmount.toFixed(4) : null}
          unit={substanceType === "solid" ? "g" : "mL"}
          interpretation={
            requiredAmount !== null
              ? `${substanceType === "solid" ? "Dissolve" : "Measure"} and make up to ${volume} ${volumeUnit} for ${targetMolarity} M`
              : undefined
          }
          empty={calc.message ?? "Enter the values below to see the required amount."}
          className="[overflow-wrap:anywhere]"
        />
      )}

      <CalcSection title="Inputs">
        <div className="space-y-2">
          <p className="text-[13px] font-medium text-foreground/90">Substance type</p>
          <ModeSwitch label="Substance type" value={substanceType} onChange={setSubstanceType} options={SUBSTANCE_OPTIONS} />
        </div>

        <FieldGrid>
          <NumberField
            label="Molecular weight (MW)"
            value={molecularWeight}
            onChange={setMolecularWeight}
            unit="g/mol"
            step="0.001"
            placeholder="e.g. 58.44 (for NaCl)"
            hint="From the label or formula, e.g. NaCl 58.44, glucose 180.16."
            error={positiveError(molecularWeight)}
          />

          {calculationMode === "concentration" ? (
            substanceType === "solid" ? (
              <NumberField
                label="Amount of solid"
                value={amount}
                onChange={setAmount}
                units={massUnits.map((u) => u.unit)}
                unit={massUnit}
                onUnitChange={(next) => setMassUnit(next as MassUnit)}
                step="0.001"
                placeholder="e.g. 1"
                hint="The mass you weighed out."
                error={positiveError(amount)}
              />
            ) : (
              <NumberField
                label="Amount of liquid (A)"
                value={amount}
                onChange={setAmount}
                unit="mL"
                step="0.001"
                placeholder="e.g. 1"
                hint="Volume of pure liquid (before dilution)."
                error={positiveError(amount)}
              />
            )
          ) : (
            <NumberField
              label="Target molarity (M)"
              value={targetMolarity}
              onChange={setTargetMolarity}
              unit="mol/L"
              step="0.001"
              placeholder="e.g. 1"
              hint="The concentration you want to prepare."
              error={positiveError(targetMolarity)}
            />
          )}

          {substanceType === "liquid" && (
            <>
              <NumberField
                label="Specific gravity (sg)"
                value={specificGravity}
                onChange={setSpecificGravity}
                unit="g/mL"
                step="0.001"
                placeholder="e.g. 1.0"
                hint="Density of the liquid, e.g. conc. HCl 1.19, conc. H₂SO₄ 1.84."
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
                hint="Assay % w/w on the bottle, e.g. conc. HCl 37%."
                error={(() => {
                  const v = parseFloat(purity);
                  return purity !== "" && !isNaN(v) && (v < 0 || v > 100) ? "Must be between 0 and 100." : undefined;
                })()}
              />
            </>
          )}

          <NumberField
            label="Final volume of solution"
            value={volume}
            onChange={setVolume}
            units={volumeUnits.map((u) => u.unit)}
            unit={volumeUnit}
            onUnitChange={(next) => setVolumeUnit(next as VolumeUnit)}
            step="0.001"
            placeholder="e.g. 1"
            hint="The volume you make the solution up to."
            error={positiveError(volume)}
          />
        </FieldGrid>

        <Button variant="outline" onClick={resetCalculator} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {calculationMode === "concentration" && molarity !== null && (
        <CalcSection title="In other units">
          <div>
            <ResultRow label="Millimolar" value={(molarity * 1000).toFixed(2)} unit="mM" />
            <ResultRow label="Micromolar" value={(molarity * 1000000).toFixed(2)} unit="μM" />
            <ResultRow label="Nanomolar" value={(molarity * 1000000000).toFixed(2)} unit="nM" />
          </div>
        </CalcSection>
      )}

      {hasResult && (
        <CalcSection title="Working" description="Your values substituted into the formula.">
          <div>
            <ResultRow label="Molecular weight" value={molecularWeight} unit="g/mol" />
            <ResultRow label="Final volume" value={`${volume} ${volumeUnit} = ${litres}`} unit="L" />
          </div>
          <p className="overflow-x-auto rounded-lg border border-border/70 bg-muted/60 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
            {substitution}
          </p>
        </CalcSection>
      )}

      <CalcSection title="Common solutions" description="Tap one to load it as a target molarity.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[18rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Solution</th>
                <th className="py-2 pr-3 font-medium">MW (g/mol)</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_SOLUTIONS.map((s) => {
                const selected = isSelected(s);
                return (
                  <tr key={s.name} className="border-b border-border/70 last:border-b-0">
                    <td className="py-1 pr-3">
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => loadSolution(s)}
                        className={
                          "flex min-h-[40px] w-full items-center gap-1.5 rounded-lg px-2 text-left font-medium transition-colors " +
                          (selected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")
                        }
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                        {s.name}
                      </button>
                    </td>
                    <td className="py-1 pr-3 tabular-nums text-muted-foreground">{s.weight}</td>
                    <td className="py-1 text-right">
                      <span className="font-semibold tabular-nums text-primary">{s.amount}</span>
                      <span className="block text-xs text-muted-foreground">in {s.volume}L</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">*For 37% concentrated HCl (specific gravity 1.19)</p>
      </CalcSection>

      <FormulaNote>
        <p className="font-semibold text-foreground">For solids</p>
        <Formula>M = (mass in g) / (MW × volume in L)</Formula>
        <p className="font-semibold text-foreground">For liquids</p>
        <Formula>M = (A × sg × purity%) / (MW × V)</Formula>
        <p>
          <strong>M</strong> molarity (mol/L) · <strong>MW</strong> molecular weight (g/mol) ·{" "}
          <strong>mass</strong> mass of solid, converted to grams · <strong>A</strong> amount of liquid (mL) ·{" "}
          <strong>sg</strong> specific gravity (g/mL) · <strong>purity%</strong> percentage purity, as a
          decimal · <strong>V</strong> final volume, converted to litres.
        </p>
        <p className="font-semibold text-foreground">To find the required amount</p>
        <Formula>Mass (g) = M_target × MW × V(L)</Formula>
        <Formula>Volume (mL) = (M_target × MW × V(L)) / (sg × purity%)</Formula>
        <p>
          For a liquid, A × sg gives the grams of liquid and × purity gives the grams of the actual
          solute in it; dividing by MW turns grams into moles.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Is the volume the solvent I add or the final volume?",
            a: "The final volume of solution. Dissolve the solute in less solvent, then make up to the mark in a volumetric flask. Adding the solute to the full volume of solvent gives a slightly lower molarity.",
          },
          {
            q: "Why do liquids need specific gravity and purity?",
            a: "Concentrated reagents are sold by volume but are not pure: conc. HCl is about 37% w/w with sg 1.19. Volume × sg gives grams of liquid, and × purity gives grams of HCl itself.",
          },
          {
            q: "Which molecular weight do I use for a hydrate?",
            a: "The MW of exactly what you weigh. CuSO₄·5H₂O is 249.68 g/mol, not the 159.61 g/mol of anhydrous CuSO₄ — using the wrong one gives an error of more than 50%.",
          },
          {
            q: "How do molarity and mM, μM and nM relate?",
            a: "1 M = 1,000 mM = 1,000,000 μM = 1,000,000,000 nM. Very small results are shown in scientific notation, e.g. 2.775e-7 M is 277.53 nM.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
