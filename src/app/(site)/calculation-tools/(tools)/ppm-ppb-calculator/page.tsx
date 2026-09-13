"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, BarChart3, Droplets, FlaskConical, RefreshCw, Scale, Waves } from "lucide-react";
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
  ModeSwitch,
  LabNotice,
} from "@/components/calculators";
import { cn } from "@/lib/utils";

type ConcentrationUnit = "ppm" | "ppb" | "ppt" | "mg/L" | "μg/L" | "ng/L" | "g/L" | "mol/L" | "M";
type SoluteType = "solid" | "liquid";
type SolutionType = "water" | "other";
type Mode = "mass-volume" | "conversion";

/* ── Units and factors (unchanged from the original page) ────────────────── */
const CONCENTRATION_UNITS: { value: ConcentrationUnit; label: string; factor: number }[] = [
  { value: "ppm", label: "ppm (mg/kg)", factor: 1e-6 },
  { value: "ppb", label: "ppb (μg/kg)", factor: 1e-9 },
  { value: "ppt", label: "ppt (ng/kg)", factor: 1e-12 },
  { value: "mg/L", label: "mg/L", factor: 1e-6 },
  { value: "μg/L", label: "μg/L", factor: 1e-9 },
  { value: "ng/L", label: "ng/L", factor: 1e-12 },
  { value: "g/L", label: "g/L", factor: 1e-3 },
  { value: "mol/L", label: "mol/L", factor: 1 },
  { value: "M", label: "Molar (M)", factor: 1 },
];

const UNIT_OPTIONS = CONCENTRATION_UNITS.map((u) => ({ value: u.value, label: u.label }));
const isMolar = (unit: ConcentrationUnit) => unit === "mol/L" || unit === "M";

const REFERENCE_VALUES = [
  { range: "Drinking Water (Pb)", value: "0.015", unit: "ppm", regulation: "EPA limit" },
  { range: "Sea Water (Salt)", value: "35000", unit: "ppm", regulation: "Average" },
  { range: "Blood Alcohol (0.08%)", value: "800", unit: "ppm", regulation: "Legal limit" },
  { range: "Vitamin C in Orange", value: "500", unit: "ppm", regulation: "Typical" },
  { range: "Air (CO₂)", value: "420", unit: "ppm", regulation: "Current average" },
  { range: "Gold in Seawater", value: "0.000004", unit: "ppm", regulation: "Trace" },
];

const QUICK_CONVERSIONS = [
  { from: "1 ppm =", to: "1000 ppb" },
  { from: "1 ppb =", to: "1000 ppt" },
  { from: "1 mg/L =", to: "1000 μg/L" },
  { from: "1 M =", to: "MW g/L" },
];

type Example = {
  name: string;
  note: string;
  mode: Mode;
  soluteType?: SoluteType;
  solutionType: SolutionType;
  mass?: string;
  volume?: string;
  density?: string;
  molecularWeight?: string;
  fromUnit?: ConcentrationUnit;
  toUnit: ConcentrationUnit;
  concentration?: string;
};

const EXAMPLES: Example[] = [
  { name: "1 g salt in 1 L", note: "→ ppm", mode: "mass-volume", soluteType: "solid", solutionType: "water", mass: "1", volume: "1", toUnit: "ppm" },
  { name: "0.25 g NaCl in 2 L", note: "→ M", mode: "mass-volume", soluteType: "solid", solutionType: "water", mass: "0.25", volume: "2", molecularWeight: "58.44", toUnit: "M" },
  { name: "0.5 mL ethanol in 10 L", note: "→ ppm", mode: "mass-volume", soluteType: "liquid", solutionType: "water", mass: "0.5", volume: "10", density: "0.789", toUnit: "ppm" },
  { name: "Lead limit 15 ppb", note: "→ ppm", mode: "conversion", solutionType: "water", fromUnit: "ppb", toUnit: "ppm", concentration: "15" },
  { name: "2 g/L", note: "→ ng/L", mode: "conversion", solutionType: "water", fromUnit: "g/L", toUnit: "ng/L", concentration: "2" },
];

/** The original's interpretation bands, including its unit → ppm mapping. */
function getInterpretation(value: number, unit: ConcentrationUnit) {
  let valueInPpm;
  switch (unit) {
    case "ppm": valueInPpm = value; break;
    case "ppb": valueInPpm = value / 1000; break;
    case "ppt": valueInPpm = value / 1000000; break;
    case "mg/L": valueInPpm = value; break;
    case "μg/L": valueInPpm = value / 1000; break;
    case "ng/L": valueInPpm = value / 1000000; break;
    case "g/L": valueInPpm = value * 1000; break;
    default: valueInPpm = value;
  }
  if (valueInPpm < 0.001) return "Ultra trace concentration";
  if (valueInPpm < 0.1) return "Trace concentration";
  if (valueInPpm < 1) return "Very low concentration";
  if (valueInPpm < 10) return "Low concentration";
  if (valueInPpm < 100) return "Moderate concentration";
  if (valueInPpm < 1000) return "High concentration";
  return "Very high concentration";
}

/** The original's display rule. */
const formatValue = (value: number) => (value < 0.001 ? value.toExponential(3) : value.toFixed(4));

function positiveError(raw: string): string | undefined {
  const value = parseFloat(raw);
  return !isNaN(value) && value <= 0 ? "Must be greater than 0." : undefined;
}

export default function PpmPpbCalculator() {
  const [calculationMode, setCalculationMode] = useState<Mode>("mass-volume");
  const [soluteType, setSoluteType] = useState<SoluteType>("solid");
  const [solutionType, setSolutionType] = useState<SolutionType>("water");
  const [mass, setMass] = useState("1");
  const [volume, setVolume] = useState("1");
  const [molecularWeight, setMolecularWeight] = useState("58.44");
  const [density, setDensity] = useState("1.0");
  const [fromUnit, setFromUnit] = useState<ConcentrationUnit>("mg/L");
  const [toUnit, setToUnit] = useState<ConcentrationUnit>("ppm");
  const [concentration, setConcentration] = useState("");

  /*
   * The original's calculateConcentration, derived instead of stored. Every
   * branch, factor and guard is the same — including the ones listed as
   * suspected issues in the migration report (density applied to ppm only,
   * molar factors of 1 in conversion mode).
   */
  const result = useMemo(() => {
    if (calculationMode === "mass-volume") {
      const massVal = parseFloat(mass);
      const volumeVal = parseFloat(volume);
      const densityVal = parseFloat(density);

      if (isNaN(massVal) || isNaN(volumeVal) || isNaN(densityVal) || massVal <= 0 || volumeVal <= 0 || densityVal <= 0) {
        return null;
      }

      const resultMgL =
        soluteType === "solid"
          ? (massVal * 1000) / volumeVal // mass in g, volume in L
          : (massVal * densityVal * 1000) / volumeVal; // liquid: mL × g/mL → g

      let value: number | null;
      switch (toUnit) {
        case "ppm": value = solutionType === "water" ? resultMgL : resultMgL / densityVal; break;
        case "ppb": value = resultMgL * 1000; break;
        case "ppt": value = resultMgL * 1000000; break;
        case "mg/L": value = resultMgL; break;
        case "μg/L": value = resultMgL * 1000; break;
        case "ng/L": value = resultMgL * 1000000; break;
        case "g/L": value = resultMgL / 1000; break;
        case "mol/L":
        case "M": {
          const mw = parseFloat(molecularWeight);
          value = !isNaN(mw) && mw > 0 ? resultMgL / 1000 / mw : null;
          break;
        }
        default: value = resultMgL;
      }
      if (value === null || !isFinite(value)) return null;
      return { kind: "mass" as const, value, resultMgL, massVal, volumeVal, densityVal };
    }

    const concVal = parseFloat(concentration);
    if (isNaN(concVal) || concVal < 0) return null;

    const fromFactor = CONCENTRATION_UNITS.find((u) => u.value === fromUnit)?.factor || 1;
    const toFactor = CONCENTRATION_UNITS.find((u) => u.value === toUnit)?.factor || 1;
    const baseValue = concVal * fromFactor;
    let value = baseValue / toFactor;
    const waterShortcut =
      solutionType === "water" &&
      ((fromUnit === "mg/L" && toUnit === "ppm") || (fromUnit === "ppm" && toUnit === "mg/L"));
    if (waterShortcut) value = concVal; // Special case for water: 1 mg/L ≈ 1 ppm

    if (!isFinite(value)) return null;
    return { kind: "conversion" as const, value, concVal, fromFactor, toFactor, baseValue, waterShortcut };
  }, [soluteType, solutionType, mass, volume, molecularWeight, density, fromUnit, toUnit, concentration, calculationMode]);

  const reset = () => {
    setSoluteType("solid");
    setSolutionType("water");
    setMass("1");
    setVolume("1");
    setMolecularWeight("58.44");
    setDensity("1.0");
    setFromUnit("mg/L");
    setToUnit("ppm");
    setConcentration("");
  };

  const applyExample = (example: Example) => {
    setCalculationMode(example.mode);
    setSolutionType(example.solutionType);
    if (example.soluteType) setSoluteType(example.soluteType);
    if (example.mass) setMass(example.mass);
    if (example.volume) setVolume(example.volume);
    if (example.density) setDensity(example.density);
    if (example.molecularWeight) setMolecularWeight(example.molecularWeight);
    if (example.fromUnit) setFromUnit(example.fromUnit);
    setToUnit(example.toUnit);
    if (example.concentration) setConcentration(example.concentration);
  };

  const isMass = calculationMode === "mass-volume";
  const isLiquid = soluteType === "liquid";
  const showDensity = isMass && (isLiquid || solutionType === "other");
  const showMw = isMass ? isMolar(toUnit) : isMolar(fromUnit) || isMolar(toUnit);
  const headline = result ? formatValue(result.value) : null;

  const conversionStep = (mgL: string, d: number) => {
    switch (toUnit) {
      case "ppm": return solutionType === "water" ? `ppm = ${mgL} (aqueous: 1 mg/L ≈ 1 ppm)` : `ppm = ${mgL} ÷ ${d}`;
      case "ppb": return `ppb = ${mgL} × 1000`;
      case "ppt": return `ppt = ${mgL} × 1,000,000`;
      case "mg/L": return `mg/L = ${mgL}`;
      case "μg/L": return `μg/L = ${mgL} × 1000`;
      case "ng/L": return `ng/L = ${mgL} × 1,000,000`;
      case "g/L": return `g/L = ${mgL} ÷ 1000`;
      default: return `${toUnit} = ${mgL} ÷ 1000 ÷ ${molecularWeight}`;
    }
  };

  return (
    <CalculatorShell
      title="PPM & PPB Calculator"
      subtitle="Works out a concentration in ppm, ppb, mg/L or molarity from a weighed mass, or converts between concentration units."
      icon={BarChart3}
      eyebrow="Pharmaceutical Chemistry"
      aside={
        <>
          <CalcAbout title="About ppm and ppb">
            <p>
              Parts per million (ppm) and parts per billion (ppb) describe very small amounts of one substance in
              another: 1 ppm is one part in 10⁶, 1 ppb one part in 10⁹. In dilute water solutions, where 1 L weighs
              about 1 kg, 1 ppm is effectively 1 mg/L and 1 ppb is 1 μg/L.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Reporting trace impurities, heavy metals or residual solvents",
                "Preparing a dilute standard from a weighed solid or measured liquid",
                "Comparing a result with a limit given in a different unit",
              ]}
            />
            <div>
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Quick conversions
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {QUICK_CONVERSIONS.map((item) => (
                  <div key={item.from} className="rounded-lg border border-border/70 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">{item.from}</p>
                    <p className="text-sm font-semibold text-foreground">{item.to}</p>
                  </div>
                ))}
              </div>
            </div>
            <CalcList
              tone="caution"
              title="Read with care"
              items={[
                "These conversions assume dilute aqueous solutions at room temperature",
                "ppm is by mass; mg/L is by volume — they are equal only when the solution's density is about 1 g/mL",
                "Unit Conversion mode uses fixed factors and does not use molecular weight for molar units",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="Calculation mode"
        value={calculationMode}
        onChange={setCalculationMode}
        options={[
          { value: "mass-volume", label: "Mass to Concentration", description: "From mass and volume", icon: Scale },
          { value: "conversion", label: "Unit Conversion", description: "Between concentration units", icon: ArrowLeftRight },
        ]}
      />

      <ResultCard
        label={isMass ? "Concentration result" : "Conversion result"}
        value={headline}
        unit={toUnit}
        interpretation={result ? getInterpretation(result.value, toUnit) : undefined}
        className={cn(headline && headline.length > 10 && "[&>p:first-of-type>span:first-child]:break-all [&>p:first-of-type>span:first-child]:text-4xl")}
        empty={
          isMass
            ? isMolar(toUnit)
              ? "Enter the amount of solute, the final volume and the molecular weight."
              : "Enter the amount of solute and the final solution volume."
            : "Enter a concentration value to convert."
        }
      />

      <CalcSection title="Inputs">
        <ModeSwitch
          label="Solution type"
          value={solutionType}
          onChange={setSolutionType}
          options={[
            { value: "water", label: "Aqueous (Water)", description: "1 mg/L ≈ 1 ppm", icon: Waves },
            { value: "other", label: "Other Solvent", description: "ppm = mg/L ÷ density", icon: FlaskConical },
          ]}
        />

        {isMass && (
          <ModeSwitch
            label="Solute type"
            value={soluteType}
            onChange={setSoluteType}
            options={[
              { value: "solid", label: "Solid", description: "Powder, crystals", icon: Scale },
              { value: "liquid", label: "Liquid", description: "Stock solution", icon: Droplets },
            ]}
          />
        )}

        {isMass ? (
          <FieldGrid>
            <NumberField
              label={isLiquid ? "Volume of liquid" : "Mass of solid"}
              value={mass}
              onChange={setMass}
              unit={isLiquid ? "mL" : "g"}
              step="0.001"
              placeholder="e.g. 1"
              hint={isLiquid ? "Volume of the liquid solute added, in mL." : "Mass weighed out, in grams (1 mg = 0.001 g)."}
              error={positiveError(mass)}
            />
            <NumberField
              label="Final solution volume"
              value={volume}
              onChange={setVolume}
              unit="L"
              step="0.001"
              placeholder="e.g. 1"
              hint="Total volume after making up, in litres (250 mL = 0.25 L)."
              error={positiveError(volume)}
            />
            {showDensity && (
              <NumberField
                label={isLiquid ? "Liquid density" : "Solvent density"}
                value={density}
                onChange={setDensity}
                unit="g/mL"
                step="0.001"
                placeholder={isLiquid ? "e.g. 1.0" : "e.g. 0.789 for ethanol"}
                hint={
                  isLiquid && solutionType === "other"
                    ? "One value is used for both the liquid's density and the solvent density."
                    : isLiquid
                      ? "Converts the liquid's volume to mass. Ethanol 0.789, glycerol 1.26."
                      : "Ethanol 0.789, methanol 0.792, acetone 0.784."
                }
                error={positiveError(density)}
              />
            )}
            <SelectField
              label="Convert to"
              value={toUnit}
              onChange={(next) => setToUnit(next as ConcentrationUnit)}
              options={UNIT_OPTIONS}
              hint="The unit the result is reported in."
            />
            {showMw && (
              <NumberField
                label="Molecular weight"
                value={molecularWeight}
                onChange={setMolecularWeight}
                unit="g/mol"
                step="0.001"
                placeholder="e.g. 58.44"
                hint="Needed for molarity. NaCl 58.44, glucose 180.16."
                error={positiveError(molecularWeight)}
              />
            )}
          </FieldGrid>
        ) : (
          <>
            <FieldGrid>
              <SelectField
                label="From unit"
                value={fromUnit}
                onChange={(next) => setFromUnit(next as ConcentrationUnit)}
                options={UNIT_OPTIONS}
              />
              <SelectField
                label="To unit"
                value={toUnit}
                onChange={(next) => setToUnit(next as ConcentrationUnit)}
                options={UNIT_OPTIONS}
              />
              <NumberField
                label="Concentration value"
                value={concentration}
                onChange={setConcentration}
                unit={fromUnit}
                step="0.001"
                placeholder={`e.g. 1 ${fromUnit}`}
                hint="The value you want to convert. Zero is allowed."
                error={!isNaN(parseFloat(concentration)) && parseFloat(concentration) < 0 ? "Cannot be negative." : undefined}
              />
              {showMw && (
                <NumberField
                  label="Molecular weight (for molar conversions)"
                  value={molecularWeight}
                  onChange={setMolecularWeight}
                  unit="g/mol"
                  step="0.001"
                  placeholder="e.g. 58.44"
                  hint="Not used by Unit Conversion — see the note below."
                />
              )}
            </FieldGrid>
            {showMw && (
              <LabNotice tone="warning">
                Unit Conversion treats mol/L and M with a fixed factor of 1 and does not use the molecular weight. To
                get a molarity from a mass, use Mass to Concentration.
              </LabNotice>
            )}
          </>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.name}
                type="button"
                onClick={() => applyExample(example)}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-muted active:bg-accent"
              >
                {example.name}
                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{example.note}</span>
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {result && headline && (
        <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
          {result.kind === "mass" ? (
            <>
              <Formula>
                {isLiquid
                  ? `mg/L = (${mass} mL × ${density} g/mL × 1000) / ${volume} L = ${formatValue(result.resultMgL)}`
                  : `mg/L = (${mass} g × 1000) / ${volume} L = ${formatValue(result.resultMgL)}`}
              </Formula>
              <Formula>
                {conversionStep(formatValue(result.resultMgL), result.densityVal)} = <strong>{headline}</strong>
              </Formula>
            </>
          ) : (
            <Formula>
              {result.waterShortcut
                ? `Aqueous: 1 mg/L ≈ 1 ppm, so ${concentration} ${fromUnit} = `
                : `${concentration} ${fromUnit} × ${result.fromFactor} ÷ ${result.toFactor} = `}
              <strong>
                {headline} {toUnit}
              </strong>
            </Formula>
          )}
          <div>
            <ResultRow label="In scientific notation" value={result.value.toExponential(3)} unit={toUnit} />
            <ResultRow label="To 4 significant digits" value={result.value.toPrecision(4)} unit={toUnit} />
          </div>
        </CalcSection>
      )}

      <CalcSection title="Common concentration ranges" description="Real-world values in ppm, for a sense of scale.">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[340px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium sm:px-0">Description</th>
                <th className="px-3 py-2 font-medium">Regulation</th>
                <th className="px-4 py-2 text-right font-medium sm:px-0">Value</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_VALUES.map((item) => (
                <tr key={item.range} className="border-b border-border/60 last:border-b-0">
                  <td className="px-4 py-2.5 font-medium text-foreground sm:px-0">{item.range}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.regulation}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right sm:px-0">
                    <span className="font-semibold tabular-nums text-primary">{item.value}</span>
                    <span className="ml-1 font-mono text-xs text-muted-foreground">{item.unit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p className="font-medium text-foreground">Mass to Concentration</p>
        <Formula>Solid: mg/L = (mass in g × 1000) / volume in L</Formula>
        <Formula>Liquid: mg/L = (volume in mL × density × 1000) / volume in L</Formula>
        <p>
          The mg/L figure is then reported in the chosen unit: ppb and μg/L × 1000, ppt and ng/L × 1,000,000, g/L ÷
          1000, and mol/L = mg/L ÷ 1000 ÷ MW.
        </p>
        <p className="font-medium text-foreground">Key relationships</p>
        <Formula>For water solutions: 1 ppm ≈ 1 mg/L</Formula>
        <Formula>1 ppm = 1000 ppb = 1,000,000 ppt</Formula>
        <Formula>1 mg/L = 1000 μg/L = 1,000,000 ng/L</Formula>
        <Formula>Molarity to ppm: ppm = M × MW × 1000</Formula>
        <Formula>For other solvents: ppm = (mg/L) ÷ density</Formula>
        <p className="font-medium text-foreground">Unit Conversion</p>
        <Formula>result = value × factor(from) ÷ factor(to)</Formula>
        <p>
          Factors: ppm and mg/L 10⁻⁶, ppb and μg/L 10⁻⁹, ppt and ng/L 10⁻¹², g/L 10⁻³, mol/L and M 1. Note: these
          conversions assume dilute aqueous solutions at room temperature.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Is 1 ppm always equal to 1 mg/L?",
            a: "Only for dilute water solutions, where a litre weighs about a kilogram. ppm is a mass ratio (mg per kg); mg/L is mass per volume. For a solvent with a different density, divide mg/L by the density in g/mL to get ppm.",
          },
          {
            q: "What units should I enter the mass and volume in?",
            a: "Mass of a solid in grams, volume of a liquid solute in millilitres, and the final solution volume in litres. Convert first: 5 mg is 0.005 g, and 250 mL is 0.25 L.",
          },
          {
            q: "Why is the result shown like 2.500e-4?",
            a: "Results below 0.001 are shown in scientific notation: 2.500e-4 means 2.500 × 10⁻⁴. The Working section also gives every result in scientific notation and to 4 significant digits.",
          },
          {
            q: "How do I convert ppm to molarity properly?",
            a: "Divide mg/L by 1000 to get g/L, then by the molecular weight to get mol/L. Use Mass to Concentration with 'Convert to' set to M — Unit Conversion does not use the molecular weight.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
