"use client";

import { useCallback, useMemo, useState } from "react";
import { Beaker, Check, Copy } from "lucide-react";
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
  type ResultTone,
} from "@/components/calculators";
import {
  AMINO_ACID_SOURCES,
  DEXTROSE_SOURCES,
  ELECTROLYTE_DEFS,
  LIPID_SOURCES,
  calculateTpn,
  type LineType,
  type PatientPopulation,
} from "./_tpn";

const DEFAULT_ELECTROLYTES: Record<string, string> = {
  sodium: "100",
  potassium: "80",
  calcium: "10",
  magnesium: "12",
  phosphate: "20",
};

const toOptions = (sources: { id: string; label: string }[]) =>
  sources.map((s) => ({ value: s.id, label: s.label }));

export default function TPNCalculator() {
  const [population, setPopulation] = useState<PatientPopulation>("adult");
  const [weightKg, setWeightKg] = useState("70");
  const [totalFluidMlKg, setTotalFluidMlKg] = useState("30");
  const [totalFluidOverrideMl, setTotalFluidOverrideMl] = useState("");
  const [useFluidOverride, setUseFluidOverride] = useState(false);
  const [proteinGKgDay, setProteinGKgDay] = useState("1.2");
  const [aaSourceId, setAaSourceId] = useState("aa-10");
  const [dextroseGKgDay, setDextroseGKgDay] = useState("3");
  const [dexSourceId, setDexSourceId] = useState("dex-70");
  const [lipidGKgDay, setLipidGKgDay] = useState("1");
  const [lipSourceId, setLipSourceId] = useState("lip-20");
  const [lineType, setLineType] = useState<LineType>("central");
  const [electrolyteAmounts, setElectrolyteAmounts] = useState<Record<string, string>>(DEFAULT_ELECTROLYTES);
  const [insulinUnits, setInsulinUnits] = useState("0");
  const [heparinUnits, setHeparinUnits] = useState("0");
  const [mviMl, setMviMl] = useState("10");
  const [traceElementsMl, setTraceElementsMl] = useState("1");
  const [copied, setCopied] = useState(false);

  const aaSource = useMemo(
    () => AMINO_ACID_SOURCES.find((s) => s.id === aaSourceId) || AMINO_ACID_SOURCES[0],
    [aaSourceId],
  );
  const dexSource = useMemo(
    () => DEXTROSE_SOURCES.find((s) => s.id === dexSourceId) || DEXTROSE_SOURCES[0],
    [dexSourceId],
  );
  const lipSource = useMemo(
    () => LIPID_SOURCES.find((s) => s.id === lipSourceId) || LIPID_SOURCES[0],
    [lipSourceId],
  );

  const calc = useMemo(
    () =>
      calculateTpn({
        population, weightKg, totalFluidMlKg, useFluidOverride, totalFluidOverrideMl,
        proteinGKgDay, dextroseGKgDay, lipidGKgDay,
        aaSource, dexSource, lipSource, lineType, electrolyteAmounts, mviMl, traceElementsMl,
      }),
    [
      population, weightKg, totalFluidMlKg, useFluidOverride, totalFluidOverrideMl,
      proteinGKgDay, dextroseGKgDay, lipidGKgDay,
      aaSource, dexSource, lipSource, lineType, electrolyteAmounts, mviMl, traceElementsMl,
    ],
  );

  const osmTone: ResultTone = calc.exceedsPeripheralLimit
    ? "danger"
    : calc.nearPeripheralLimit
      ? "warning"
      : "success";

  const reset = () => {
    setPopulation("adult");
    setWeightKg("70");
    setTotalFluidMlKg("30");
    setUseFluidOverride(false);
    setTotalFluidOverrideMl("");
    setProteinGKgDay("1.2");
    setAaSourceId("aa-10");
    setDextroseGKgDay("3");
    setDexSourceId("dex-70");
    setLipidGKgDay("1");
    setLipSourceId("lip-20");
    setLineType("central");
    setElectrolyteAmounts(DEFAULT_ELECTROLYTES);
    setInsulinUnits("0");
    setHeparinUnits("0");
    setMviMl("10");
    setTraceElementsMl("1");
  };

  const copyOrder = useCallback(() => {
    const lytes = ELECTROLYTE_DEFS.map(
      (e) => `  - ${e.label}: ${electrolyteAmounts[e.id] || 0} ${e.unit}/day`,
    ).join("\n");
    const note = `=== TPN ADMIXTURE ORDER ===
PATIENT: ${population.toUpperCase()} | Weight ${calc.wt} kg | Line: ${lineType.toUpperCase()}
Target fluid: ${calc.targetFluidMl.toFixed(0)} mL/day

MACRONUTRIENTS:
  - ${aaSource.label}: ${calc.totalProteinG.toFixed(1)} g protein → ${calc.aaVolumeMl.toFixed(1)} mL (${calc.proteinKcal.toFixed(0)} kcal)
  - ${dexSource.label}: ${calc.totalDextroseG.toFixed(1)} g dextrose → ${calc.dexVolumeMl.toFixed(1)} mL (${calc.dextroseKcal.toFixed(0)} kcal)
  - ${lipSource.label}: ${calc.totalLipidG.toFixed(1)} g lipid → ${calc.lipVolumeMl.toFixed(1)} mL (${calc.lipidKcal.toFixed(0)} kcal)

ELECTROLYTES:
${lytes}

ADDITIVES: MVI ${mviMl} mL | Trace elements ${traceElementsMl} mL | Insulin ${insulinUnits} units | Heparin ${heparinUnits} units

TOTALS:
  - Total calories: ${calc.totalKcal.toFixed(0)} kcal (${calc.kcalPerKg.toFixed(1)} kcal/kg/day)
  - Non-protein calories: ${calc.nonProteinKcal.toFixed(0)} kcal | NPC:N ${calc.nonProteinKcalPerGN.toFixed(0)}:1 | Nitrogen ${calc.nitrogenG.toFixed(2)} g
  - Final osmolarity: ${calc.finalOsmolarity.toFixed(0)} mOsm/L
  - Component volume ${calc.totalVolumeMl.toFixed(1)} mL + free water ${calc.freeWaterNeededMl.toFixed(1)} mL = ${calc.finalBagVolumeMl.toFixed(0)} mL
  - Infusion rate over 24 h: ${calc.infusionRateMlHr.toFixed(1)} mL/hr
  - GIR: ${calc.girMgKgMin.toFixed(2)} mg/kg/min

Generated: ${new Date().toLocaleString()}`;
    try {
      navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [calc, population, lineType, aaSource, dexSource, lipSource, electrolyteAmounts, mviMl, traceElementsMl, insulinUnits, heparinUnits]);

  return (
    <CalculatorShell
      title="TPN Admixture Calculator"
      subtitle="Builds a total parenteral nutrition bag from weight-based macronutrient targets: volumes, calories, nitrogen balance, osmolarity and the ASPEN safety checks."
      icon={Beaker}
      eyebrow="Clinical & Hospital Pharmacy"
      aside={
        <>
          <CalcAbout title="About TPN compounding">
            <p>
              A TPN bag is prescribed per kilogram per day and then compounded backwards: grams of
              protein, dextrose and lipid become volumes of stock solution, and the difference from
              the fluid goal is made up with sterile water.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Converting g/kg/day targets into stock-solution volumes",
                "Checking whether an admixture can go down a peripheral line",
                "Verifying glucose infusion rate and the NPC:N ratio",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Osmolarity here is the standard clinical approximation (dextrose ~5, amino acids ~10 mOsm/g); lipids are treated as near-isotonic.",
                "Calcium and phosphate solubility is not modelled — always check a compatibility curve before compounding.",
                "Electrolyte stock volume is approximated at 0.05 mL per mEq or mmol.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <LabNotice tone="warning" title="Educational tool — not a compounding order">
        A real TPN order must be verified by a pharmacist against the institution&apos;s own stock
        concentrations, calcium-phosphate solubility curves and stability data before compounding.
      </LabNotice>

      <ResultCard
        label="Final osmolarity"
        value={calc.isValid ? calc.finalOsmolarity.toFixed(0) : null}
        unit="mOsm/L"
        interpretation={
          calc.exceedsPeripheralLimit
            ? "Exceeds the peripheral limit — central line required"
            : calc.nearPeripheralLimit
              ? "Approaching the peripheral limit (900 mOsm/L)"
              : lineType === "peripheral"
                ? "Acceptable for peripheral administration"
                : "Suitable for central line administration"
        }
        tone={osmTone}
        empty="Enter a weight and a fluid target above 0."
      />

      {calc.exceedsPeripheralLimit && (
        <LabNotice tone="danger" title="Osmolarity too high for a peripheral line">
          At {calc.finalOsmolarity.toFixed(0)} mOsm/L this admixture exceeds the 900 mOsm/L peripheral
          limit and carries a high risk of phlebitis and extravasation. Use a central line, or dilute
          the bag.
        </LabNotice>
      )}

      {calc.girExceedsMax && (
        <LabNotice tone="danger" title="Glucose infusion rate above the recommended maximum">
          GIR is {calc.girMgKgMin.toFixed(2)} mg/kg/min against a {population === "pediatric" ? "paediatric" : "adult"}{" "}
          maximum of about {calc.girMaxMgKgMin} mg/kg/min. Excess dextrose drives hyperglycaemia,
          lipogenesis and hepatic steatosis.
        </LabNotice>
      )}

      {calc.lipidExceedsMax && (
        <LabNotice tone="danger" title="Lipid dose above the recommended maximum">
          {parseFloat(lipidGKgDay)} g/kg/day exceeds the {calc.lipidMaxGKg} g/kg/day ceiling for this
          population. High lipid loads risk hypertriglyceridaemia and fat overload syndrome.
        </LabNotice>
      )}

      <CalcSection title="Patient & access">
        <div className="space-y-4">
          <ModeSwitch<PatientPopulation>
            label="Population"
            value={population}
            onChange={setPopulation}
            options={[
              { value: "adult", label: "Adult", description: "GIR max ~5, lipid max 2.5 g/kg" },
              { value: "pediatric", label: "Paediatric", description: "GIR max ~13, lipid max 3 g/kg" },
            ]}
          />
          <ModeSwitch<LineType>
            label="Access line type"
            value={lineType}
            onChange={setLineType}
            options={[
              { value: "central", label: "Central (CVC / PICC)", description: "No osmolarity limit" },
              { value: "peripheral", label: "Peripheral (PIV)", description: "Max ~900 mOsm/L" },
            ]}
          />
        </div>

        <FieldGrid>
          <NumberField
            label="Patient weight"
            value={weightKg}
            onChange={setWeightKg}
            unit="kg"
            step="0.1"
            min={0}
            error={weightKg.trim() !== "" && (parseFloat(weightKg) || 0) <= 0 ? "Weight must be greater than 0." : undefined}
          />
          <NumberField
            label="Total fluid requirement"
            value={totalFluidMlKg}
            onChange={setTotalFluidMlKg}
            unit="mL/kg"
            step="1"
            min={0}
            disabled={useFluidOverride}
            hint={`Target: ${calc.targetFluidMl.toFixed(0)} mL/day`}
          />
          {useFluidOverride && (
            <NumberField
              label="Total fluid override"
              value={totalFluidOverrideMl}
              onChange={setTotalFluidOverrideMl}
              unit="mL/day"
              step="10"
              min={0}
              hint="Absolute daily volume, replacing the per-kg target."
            />
          )}
        </FieldGrid>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={useFluidOverride}
            onChange={(e) => setUseFluidOverride(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <span className="leading-relaxed text-foreground/90">Set an absolute daily fluid volume instead of mL/kg</span>
        </label>
      </CalcSection>

      <CalcSection title="Macronutrients" description="Weight-based targets, converted to stock-solution volumes.">
        <FieldGrid>
          <NumberField
            label="Protein dose"
            value={proteinGKgDay}
            onChange={setProteinGKgDay}
            unit="g/kg/day"
            step="0.1"
            min={0}
            hint={`Total ${calc.totalProteinG.toFixed(1)} g/day → ${calc.aaVolumeMl.toFixed(1)} mL`}
          />
          <SelectField label="Amino acid source" value={aaSourceId} onChange={setAaSourceId} options={toOptions(AMINO_ACID_SOURCES)} />
          <NumberField
            label="Dextrose dose"
            value={dextroseGKgDay}
            onChange={setDextroseGKgDay}
            unit="g/kg/day"
            step="0.1"
            min={0}
            hint={`Total ${calc.totalDextroseG.toFixed(1)} g/day → ${calc.dexVolumeMl.toFixed(1)} mL`}
          />
          <SelectField label="Dextrose source" value={dexSourceId} onChange={setDexSourceId} options={toOptions(DEXTROSE_SOURCES)} />
          <NumberField
            label="Lipid dose"
            value={lipidGKgDay}
            onChange={setLipidGKgDay}
            unit="g/kg/day"
            step="0.1"
            min={0}
            hint={`Total ${calc.totalLipidG.toFixed(1)} g/day → ${calc.lipVolumeMl.toFixed(1)} mL`}
          />
          <SelectField label="Lipid source" value={lipSourceId} onChange={setLipSourceId} options={toOptions(LIPID_SOURCES)} />
        </FieldGrid>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Glucose infusion rate (GIR): {calc.girMgKgMin.toFixed(2)} mg/kg/min.{" "}
          {calc.girExceedsMax
            ? `Above the typical maximum of ~${calc.girMaxMgKgMin} mg/kg/min.`
            : `Within the typical range (max ~${calc.girMaxMgKgMin} mg/kg/min).`}
        </p>
      </CalcSection>

      <CalcSection title="Electrolytes" description="Per-day totals added to the bag.">
        <FieldGrid>
          {ELECTROLYTE_DEFS.map((e) => (
            <NumberField
              key={e.id}
              label={e.label}
              value={electrolyteAmounts[e.id] ?? ""}
              onChange={(v) => setElectrolyteAmounts({ ...electrolyteAmounts, [e.id]: v })}
              unit={e.unit}
              step="1"
              min={0}
              hint={population === "pediatric" ? e.pedRangePerKgDay : e.adultRangePerDay}
            />
          ))}
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Additives" description="Optional. MVI and trace elements add to the bag volume.">
        <FieldGrid>
          <NumberField label="Multivitamin (MVI)" value={mviMl} onChange={setMviMl} unit="mL" step="1" min={0} />
          <NumberField label="Trace elements" value={traceElementsMl} onChange={setTraceElementsMl} unit="mL" step="1" min={0} />
          <NumberField label="Insulin (regular)" value={insulinUnits} onChange={setInsulinUnits} unit="units" step="1" min={0} hint="Recorded on the order; adds no volume here." />
          <NumberField label="Heparin" value={heparinUnits} onChange={setHeparinUnits} unit="units" step="100" min={0} hint="Recorded on the order; adds no volume here." />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Final bag composition" description="What the compounder needs to draw up.">
        <div>
          <ResultRow label="Total calories" value={calc.totalKcal.toFixed(0)} unit="kcal" badge={`${calc.kcalPerKg.toFixed(1)} kcal/kg/day`} />
          <ResultRow label="Non-protein calories" value={calc.nonProteinKcal.toFixed(0)} unit="kcal" badge="dextrose + lipid" />
          <ResultRow
            label="NPC:N ratio"
            value={`${calc.nonProteinKcalPerGN.toFixed(0)}:1`}
            badge="target ~100–150:1"
            badgeTone={calc.nonProteinKcalPerGN >= 100 && calc.nonProteinKcalPerGN <= 150 ? "success" : "warning"}
          />
          <ResultRow label="Nitrogen" value={calc.nitrogenG.toFixed(2)} unit="g/day" />
          <ResultRow label="Protein calories" value={calc.proteinKcal.toFixed(0)} unit="kcal" />
          <ResultRow label="Dextrose calories" value={`${calc.dextroseKcal.toFixed(0)} kcal`} unit={`${calc.dextrosePctOfNonProtein.toFixed(0)}% of NPC`} />
          <ResultRow label="Lipid calories" value={`${calc.lipidKcal.toFixed(0)} kcal`} unit={`${calc.lipidPctOfNonProtein.toFixed(0)}% of NPC`} />
          <ResultRow label="Component volume" value={calc.totalVolumeMl.toFixed(1)} unit="mL" />
          <ResultRow label="Free water added" value={calc.freeWaterNeededMl.toFixed(1)} unit="mL" />
          <ResultRow label="Target fluid goal" value={calc.targetFluidMl.toFixed(0)} unit="mL" />
          <ResultRow label="Final bag volume" value={calc.finalBagVolumeMl.toFixed(0)} unit="mL" />
          <ResultRow label="Infusion rate over 24 h" value={calc.infusionRateMlHr.toFixed(1)} unit="mL/hr" />
        </div>

        {calc.volumeDifferenceMl > 0 && (
          <LabNotice tone="warning" title="Components exceed the fluid goal">
            The macronutrient volumes alone come to {calc.totalVolumeMl.toFixed(1)} mL, which is{" "}
            {calc.volumeDifferenceMl.toFixed(1)} mL over the {calc.targetFluidMl.toFixed(0)} mL target.
            Use more concentrated stock solutions or raise the fluid allowance.
          </LabNotice>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={copyOrder}>
            {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
            {copied ? "Copied" : "Copy order"}
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Bag volume breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Component</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Volume</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: aaSource.label, amt: `${calc.totalProteinG.toFixed(1)} g`, vol: calc.aaVolumeMl },
                { name: dexSource.label, amt: `${calc.totalDextroseG.toFixed(1)} g`, vol: calc.dexVolumeMl },
                { name: lipSource.label, amt: `${calc.totalLipidG.toFixed(1)} g`, vol: calc.lipVolumeMl },
                { name: "Electrolytes (approx. stock)", amt: "—", vol: calc.electrolyteAddedVolMl },
                { name: "Multivitamin + trace elements", amt: "—", vol: calc.mviVol + calc.traceVol },
                { name: "Sterile water (to volume)", amt: "—", vol: calc.freeWaterNeededMl },
              ].map((r) => (
                <tr key={r.name} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{r.name}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.amt}</td>
                  <td className="py-2 tabular-nums">{r.vol.toFixed(1)} mL</td>
                </tr>
              ))}
              <tr className="border-t border-border font-semibold">
                <td className="py-2 pr-3">Final bag</td>
                <td className="py-2 pr-3">—</td>
                <td className="py-2 tabular-nums">{calc.finalBagVolumeMl.toFixed(0)} mL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>Each macronutrient goes from a weight-based dose to grams, then to a stock volume:</p>
        <Formula>grams = dose (g/kg/day) × weight (kg)</Formula>
        <Formula>volume (mL) = grams / (concentration % / 100)</Formula>
        <p>
          Calories use 4 kcal/g for amino acids, 3.4 kcal/g for dextrose (monohydrate) and 10 kcal/g
          for 20% and 30% lipid emulsions (9 kcal/g for 10%). Nitrogen is 16% of amino acid grams.
        </p>
        <Formula>GIR (mg/kg/min) = dextrose g × 1000 / (weight × 1440)</Formula>
        <Formula>NPC:N = non-protein kcal / nitrogen g</Formula>
        <p>Osmolarity uses the standard clinical approximation:</p>
        <Formula>mOsm = (dextrose g × 5) + (amino acid g × 10) + Σ(electrolyte × mOsm factor)</Formula>
        <Formula>osmolarity (mOsm/L) = total mOsm / total volume (mL) × 1000</Formula>
        <p>
          Sterile water makes the component volume up to the fluid goal, and the infusion rate is the
          final bag volume over 24 hours. Peripheral administration is flagged above 900 mOsm/L, with
          a caution from 750.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why is dextrose 3.4 kcal/g rather than 4?",
            a: "Parenteral dextrose is the monohydrate, which carries a water molecule, so each gram yields about 3.4 kcal rather than the 4 kcal of anhydrous carbohydrate. Using 4 would overstate the calories by about 18%.",
          },
          {
            q: "What does the NPC:N ratio tell me?",
            a: "Whether there is enough non-protein energy for the amino acids to be used for building tissue instead of being burned for fuel. Around 100–150:1 suits most patients; a lower ratio suits catabolic or critically ill patients needing more protein, and a higher one suits stable patients.",
          },
          {
            q: "Why does osmolarity decide the line?",
            a: "A peripheral vein cannot tolerate a strongly hypertonic solution — above roughly 900 mOsm/L the risk of phlebitis, pain and extravasation climbs sharply. Central lines empty into a high-flow vessel where the admixture is diluted immediately, so they carry no practical limit.",
          },
          {
            q: "Does this check calcium-phosphate compatibility?",
            a: "No, and that is the most important thing it does not do. Calcium phosphate precipitation is a recognised cause of fatal pulmonary emboli in TPN. Always check the amounts against the manufacturer's solubility curve for the specific amino acid product and final volume.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
