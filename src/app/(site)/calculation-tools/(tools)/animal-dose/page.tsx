"use client";

import { useCallback, useMemo, useState } from "react";
import { Rat, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  SelectField,
  TextField,
  ResultCard,
  ResultRow,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabNotice,
} from "@/components/calculators";
import {
  ANIMAL_PRESETS,
  calculateAnimalDose,
  fmt,
  fmtUg,
  type DoseUnit,
  type WeightUnit,
} from "./_animal";

export default function AnimalWeightDoseCalculator() {
  const [drugName, setDrugName] = useState("Paracetamol");
  const [animalSpecies, setAnimalSpecies] = useState("Mouse (25g)");
  const [adultDoseVal, setAdultDoseVal] = useState("500");
  const [adultDoseUnit, setAdultDoseUnit] = useState<DoseUnit>("mg");
  const [adultWeightVal, setAdultWeightVal] = useState("70");
  const [adultWeightUnit, setAdultWeightUnit] = useState<WeightUnit>("kg");
  const [animalWeightVal, setAnimalWeightVal] = useState("25");
  const [animalWeightUnit, setAnimalWeightUnit] = useState<WeightUnit>("g");
  const [stockConcVal, setStockConcVal] = useState("1.0");
  const [copied, setCopied] = useState(false);

  const selectedPreset = useMemo(
    () => ANIMAL_PRESETS.find((p) => p.name === animalSpecies) || ANIMAL_PRESETS[0],
    [animalSpecies],
  );

  const calc = useMemo(
    () =>
      calculateAnimalDose(
        adultDoseVal, adultDoseUnit, adultWeightVal, adultWeightUnit,
        animalWeightVal, animalWeightUnit, stockConcVal, selectedPreset,
      ),
    [
      adultDoseVal, adultDoseUnit, adultWeightVal, adultWeightUnit,
      animalWeightVal, animalWeightUnit, stockConcVal, selectedPreset,
    ],
  );

  const selectSpecies = (name: string) => {
    setAnimalSpecies(name);
    const p = ANIMAL_PRESETS.find((x) => x.name === name);
    if (!p) return;
    setAnimalWeightVal(String(p.defaultWeightG));
    setAnimalWeightUnit("g");
  };

  const reset = () => {
    setDrugName("Paracetamol");
    setAdultDoseVal("500");
    setAdultDoseUnit("mg");
    setAdultWeightVal("70");
    setAdultWeightUnit("kg");
    setAnimalSpecies("Mouse (25g)");
    setAnimalWeightVal("25");
    setAnimalWeightUnit("g");
    setStockConcVal("1.0");
  };

  // Protocol text is unchanged from the previous page.
  const copyProtocol = useCallback(() => {
    if (!calc) return;
    const lines = [
      "PHARMACOLOGY WEIGHT-BASED DOSE CALCULATION",
      "----------------------------------------",
      `• Drug / Compound : ${drugName || "Target Compound"}`,
      `• Adult Reference : ${adultDoseVal} ${adultDoseUnit} for ${adultWeightVal} ${adultWeightUnit}`,
      `• Animal Model    : ${animalSpecies} (${animalWeightVal} ${animalWeightUnit})`,
      "",
      "CALCULATION STEPS:",
      `1. Adult Dose / Gram = ${fmt(calc.adultDoseInMg)} mg ÷ ${fmt(calc.adultWeightInGrams)} g = ${fmt(calc.dosePerGram, 6)} mg/g`,
      `2. Animal Dose = ${fmt(calc.dosePerGram, 6)} mg/g × ${fmt(calc.animalWeightInGrams)} g = ${fmt(calc.animalDoseMg, 4)} mg (${fmtUg(calc.animalDoseMg)})`,
      `3. Syringe Volume = ${fmt(calc.animalDoseMg, 4)} mg ÷ ${stockConcVal} mg/ml = ${fmt(calc.injectionVolMl, 4)} ml`,
      "",
      `NORMALISED DOSE : ${fmt(calc.animalDoseMgPerKg, 3)} mg/kg`,
      `Generated: ${new Date().toLocaleString()}`,
    ];
    try {
      navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [calc, drugName, adultDoseVal, adultDoseUnit, adultWeightVal, adultWeightUnit, animalSpecies, animalWeightVal, animalWeightUnit, stockConcVal]);

  return (
    <CalculatorShell
      title="Animal Weight-Based Dose Calculator"
      subtitle="Scales a human reference dose down to a laboratory animal by body weight, and works out the syringe volume from the stock concentration."
      icon={Rat}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About animal dosing">
            <p>
              A bench experiment starts from a known human dose and scales it to the animal model.
              The simplest approach — the one used here — divides the dose by body weight and
              multiplies by the animal&apos;s weight.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Preparing a dosing schedule for a practical class",
                "Working out how much to draw from a stock vial",
                "Checking an injection volume against species limits",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This is linear weight scaling, not allometric body-surface-area scaling — see the note beside the result.",
                "Injection volume limits are species- and route-specific; exceeding them causes pain and tissue damage.",
                "Animal work requires ethics approval and trained supervision.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Target animal dose"
        value={calc ? fmt(calc.animalDoseMg, 4) : null}
        unit="mg"
        interpretation={
          calc
            ? `${fmtUg(calc.animalDoseMg)} · normalised ${fmt(calc.animalDoseMgPerKg, 3)} mg/kg`
            : undefined
        }
        tone={calc?.isOverVolume ? "danger" : "neutral"}
        empty="Enter an adult dose, an adult weight and an animal weight, all above 0."
      />

      {/* Reported, not corrected — the maths is the original's. Recorded in
          .claude/redesign-tracker.md. */}
      <LabNotice tone="warning" title="Linear scaling, not allometric">
        This tool scales strictly by body weight. Regulatory and published practice converts between
        species by body <em>surface area</em>, using Km factors (human 37, rat 6, mouse 3) — a mouse
        needs roughly 12× the human mg/kg dose, not the same one. The figure above will therefore be
        far lower than a literature rodent dose. Use it to follow the weight-proportion method, not
        to plan a study.
      </LabNotice>

      {calc?.isOverVolume && (
        <LabNotice tone="danger" title="Injection volume exceeds the species limit">
          {fmt(calc.injectionVolMl, 4)} mL is above the {selectedPreset.maxInjectVolMl} mL maximum
          usually accepted for a {animalSpecies.split(" (")[0].toLowerCase()}. Use a more
          concentrated stock, or split the dose between sites.
        </LabNotice>
      )}

      <CalcSection title="Drug & adult reference" description="The human dose the animal dose is scaled from.">
        <FieldGrid>
          <TextField
            label="Drug / compound name"
            value={drugName}
            onChange={setDrugName}
            placeholder="e.g. Paracetamol"
            hint="Recorded on the protocol only."
          />
          <NumberField
            label="Adult dose"
            value={adultDoseVal}
            onChange={setAdultDoseVal}
            units={["mg", "g", "mcg"]}
            unit={adultDoseUnit}
            onUnitChange={(v) => setAdultDoseUnit(v as DoseUnit)}
            step="0.01"
            min={0}
            hint="The usual human dose."
          />
          <NumberField
            label="Adult weight"
            value={adultWeightVal}
            onChange={setAdultWeightVal}
            units={["kg", "g", "lbs"]}
            unit={adultWeightUnit}
            onUnitChange={(v) => setAdultWeightUnit(v as WeightUnit)}
            step="0.1"
            min={0}
            hint="Conventionally a 70 kg adult."
          />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Animal model" description="Species sets the default body weight and the injection volume limit.">
        <FieldGrid>
          <SelectField
            label="Animal species"
            value={animalSpecies}
            onChange={selectSpecies}
            options={ANIMAL_PRESETS.map((p) => ({ value: p.name, label: p.name }))}
            hint={`Max injection volume ${selectedPreset.maxInjectVolMl} mL`}
          />
          <NumberField
            label="Animal body weight"
            value={animalWeightVal}
            onChange={setAnimalWeightVal}
            units={["g", "kg", "mg"]}
            unit={animalWeightUnit}
            onUnitChange={(v) => setAnimalWeightUnit(v as WeightUnit)}
            step="0.1"
            min={0}
            hint="Weigh the animal on the day."
          />
          <NumberField
            label="Stock vial concentration"
            value={stockConcVal}
            onChange={setStockConcVal}
            unit="mg/mL"
            step="0.01"
            min={0}
            hint="Calculates the exact volume to draw into the syringe."
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Species</span>
          {ANIMAL_PRESETS.map((p) => (
            <Button key={p.name} type="button" variant="outline" size="sm" onClick={() => selectSpecies(p.name)}>
              {p.name}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {calc && (
        <CalcSection title="Working" description="The practical notebook steps.">
          <div>
            <ResultRow
              label="1. Dose per gram = adult dose ÷ adult weight"
              value={`${fmt(calc.adultDoseInMg)} mg ÷ ${fmt(calc.adultWeightInGrams)} g = ${fmt(calc.dosePerGram, 6)}`}
              unit="mg/g"
            />
            <ResultRow
              label="2. Animal dose = dose/g × animal weight"
              value={`${fmt(calc.dosePerGram, 6)} × ${fmt(calc.animalWeightInGrams)} g = ${fmt(calc.animalDoseMg, 4)}`}
              unit="mg"
            />
            <ResultRow label="Animal dose in micrograms" value={fmtUg(calc.animalDoseMg)} />
            <ResultRow label="Normalised dose" value={fmt(calc.animalDoseMgPerKg, 3)} unit="mg/kg" />
            <ResultRow
              label={`3. Syringe volume (${stockConcVal} mg/mL stock)`}
              value={fmt(calc.injectionVolMl, 4)}
              unit="mL"
              badge={calc.isOverVolume ? `over ${selectedPreset.maxInjectVolMl} mL limit` : undefined}
              badgeTone="destructive"
            />
            <ResultRow label="Syringe volume in microlitres" value={fmt(calc.injectionVolUl, 2)} unit="µL" />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={copyProtocol}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy protocol"}
            </Button>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Species reference" description="Default weights and the injection volumes usually accepted.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Species</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Typical weight</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Max injection volume</th>
              </tr>
            </thead>
            <tbody>
              {ANIMAL_PRESETS.map((p) => (
                <tr key={p.name} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{p.name.split(" (")[0]}</td>
                  <td className="py-2 pr-3 tabular-nums">{p.defaultWeightG} g</td>
                  <td className="py-2 tabular-nums">{p.maxInjectVolMl} mL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>Everything is converted to milligrams and grams first, then scaled in two steps:</p>
        <Formula>dose per gram = adult dose (mg) / adult weight (g)</Formula>
        <Formula>animal dose (mg) = dose per gram × animal weight (g)</Formula>
        <p>The syringe volume follows from the stock concentration:</p>
        <Formula>volume (mL) = animal dose (mg) / stock concentration (mg/mL)</Formula>
        <p>
          Weight conversions are 1 kg = 1000 g and 1 lb = 453.59237 g; dose conversions are
          1 g = 1000 mg and 1 mcg = 0.001 mg. Because the scaling is linear, the normalised mg/kg
          figure always equals the adult mg/kg — that is a property of the method, not a bug.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why is my calculated mouse dose so much lower than the published one?",
            a: "Because this is linear weight scaling. Metabolic rate scales with roughly the ¾ power of body mass, not with mass itself, so a mouse clears a drug far faster per kilogram than a human. Converting by body surface area with Km factors (human 37, mouse 3) gives a mouse dose about 12× higher in mg/kg.",
          },
          {
            q: "How do I convert properly by surface area?",
            a: "Human equivalent dose (mg/kg) = animal dose (mg/kg) × (animal Km / human Km). Running it the other way, animal dose = human mg/kg × (37 / animal Km): 37/6 ≈ 6.2× for a rat, 37/3 ≈ 12.3× for a mouse.",
          },
          {
            q: "What if the syringe volume is too large?",
            a: "Raise the stock concentration so the same dose fits a smaller volume, or split the dose between injection sites if the protocol allows. The limits shown are conservative typical values — the accepted volume also depends on the route (IP tolerates more than IV or SC).",
          },
          {
            q: "Why does the mg/kg figure never change?",
            a: "Because linear scaling keeps the dose proportional to weight, so every animal receives the same mg/kg as the adult reference. It is shown so the number can be compared against literature mg/kg doses — where you will usually see the discrepancy described above.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
