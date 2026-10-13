"use client";

import { useCallback, useMemo, useState } from "react";
import { Stethoscope, Check, Copy } from "lucide-react";
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
import {
  calculateRules,
  cockcroftGault,
  toEffectiveScr,
  toScrMgDl,
  toWeightKg,
  FRAILTY_MULTIPLIER,
  FRAILTY_LABEL,
  type FrailtyStatus,
  type GeriatricRule,
  type ScrUnit,
  type WeightUnit,
} from "./_geriatric";

interface DrugPreset {
  name: string;
  brand: string;
  category: string;
  adultDoseMg: number;
  frequency: string;
  route: string;
  beersWarning: string | null;
  clinicalPearls: string;
}

/* ── Drug monographs — content unchanged from the pre-migration page ─────── */
const GERIATRIC_DRUG_PRESETS: DrugPreset[] = [
  {
    name: "Apixaban",
    brand: "Eliquis",
    category: "Anticoagulant (DOAC)",
    adultDoseMg: 5,
    frequency: "BID (twice daily)",
    route: "Oral",
    beersWarning: null,
    clinicalPearls:
      "Reduce to 2.5 mg BID if patient meets ≥ 2 ABC criteria: Age ≥ 80, Weight ≤ 60 kg, or SCr ≥ 1.5 mg/dL.",
  },
  {
    name: "Digoxin",
    brand: "Lanoxin",
    category: "Cardiac Glycoside / Inotrope",
    adultDoseMg: 0.25,
    frequency: "Daily",
    route: "Oral",
    beersWarning:
      "AGS Beers Criteria High Risk: Doses > 0.125 mg/day offer no additional benefit and drastically increase mortality & toxicity.",
    clinicalPearls:
      "Target geriatric serum trough: 0.5–0.9 ng/mL. Max recommended geriatric dose is 0.125 mg/day (or 0.0625 mg QOD in CKD).",
  },
  {
    name: "Gabapentin",
    brand: "Neurontin",
    category: "GABA Analogue / Neuropathic",
    adultDoseMg: 300,
    frequency: "TID (3 times daily)",
    route: "Oral",
    beersWarning:
      "Fall & Sedation Risk: Severe CNS depression and ataxia when combined with opioids or in renal impairment.",
    clinicalPearls:
      "Exclusively renally eliminated. Start elderly at 100 mg QHS and titrate slowly based on CrCl.",
  },
  {
    name: "Metformin",
    brand: "Glucophage",
    category: "Biguanide / Antidiabetic",
    adultDoseMg: 1000,
    frequency: "BID (twice daily)",
    route: "Oral",
    beersWarning: null,
    clinicalPearls:
      "Contraindicated if eGFR < 30 mL/min/1.73m². Max 1000 mg/day if eGFR 30–44 mL/min. Monitor B12 deficiency.",
  },
  {
    name: "Citalopram",
    brand: "Celexa",
    category: "SSRI Antidepressant",
    adultDoseMg: 40,
    frequency: "Daily",
    route: "Oral",
    beersWarning: "QTc Prolongation Warning: Maximum dose is 20 mg/day in patients ≥ 60 years old.",
    clinicalPearls:
      "FDA warning: Geriatric max dose is 20 mg/day due to risk of Torsades de Pointes and hyponatremia/SIADH.",
  },
  {
    name: "Lorazepam",
    brand: "Ativan",
    category: "Benzodiazepine",
    adultDoseMg: 1,
    frequency: "TID PRN",
    route: "Oral",
    beersWarning:
      "AGS Beers Criteria Strongly Avoid: Drastically increases risk of cognitive impairment, delirium, falls, and hip fractures.",
    clinicalPearls:
      "If unavoidable for acute crisis, use LOT (Lorazepam, Oxazepam, Temazepam) due to lack of active oxidative metabolites, at 50% dose.",
  },
  {
    name: "Levothyroxine",
    brand: "Synthroid",
    category: "Thyroid Hormone",
    adultDoseMg: 0.1,
    frequency: "Daily",
    route: "Oral",
    beersWarning: null,
    clinicalPearls:
      "In elderly patients with coronary artery disease (CAD), start low at 12.5–25 mcg/day to avoid precipitating myocardial ischemia.",
  },
];

interface PatientPreset {
  name: string;
  tag: string;
  age: string;
  sex: "male" | "female";
  weight: string;
  weightUnit: WeightUnit;
  scr: string;
  scrUnit: ScrUnit;
  frailty: FrailtyStatus;
  adultDose: string;
  rule: GeriatricRule;
}

const PATIENT_PRESETS: PatientPreset[] = [
  { name: "Fit Senior", tag: "Age 68, CrCl ~80", age: "68", sex: "male", weight: "76", weightUnit: "kg", scr: "0.9", scrUnit: "mg/dL", frailty: "robust", adultDose: "100", rule: "start_low_50" },
  { name: "Frail CKD 3b", tag: "Age 82, CrCl ~28", age: "82", sex: "female", weight: "54", weightUnit: "kg", scr: "1.4", scrUnit: "mg/dL", frailty: "frail", adultDose: "100", rule: "frailty_adjusted" },
  { name: "Sarcopenic Low SCr", tag: "Age 88, SCr 0.5", age: "88", sex: "female", weight: "45", weightUnit: "kg", scr: "0.5", scrUnit: "mg/dL", frailty: "frail", adultDose: "100", rule: "renal_crcl" },
  { name: "Polypharmacy Fall Risk", tag: "Age 79, multi-morbid", age: "79", sex: "male", weight: "70", weightUnit: "kg", scr: "1.3", scrUnit: "mg/dL", frailty: "pre_frail", adultDose: "100", rule: "start_low_33" },
  { name: "Extreme Age (92y)", tag: "CrCl ~20 mL/min", age: "92", sex: "female", weight: "48", weightUnit: "kg", scr: "1.6", scrUnit: "mg/dL", frailty: "severely_frail", adultDose: "100", rule: "frailty_adjusted" },
];

const RULE_OPTIONS = [
  { value: "start_low_50" as const, label: "Start low 50%", description: "Standard geriatric start" },
  { value: "start_low_33" as const, label: "Conservative 33%", description: "CNS-active / narrow TI" },
  { value: "renal_crcl" as const, label: "Renal scaled", description: "Proportional to CrCl" },
  { value: "frailty_adjusted" as const, label: "Frailty + renal", description: "Multi-factorial" },
];

export default function GeriatricDosingCalculator() {
  const [age, setAge] = useState("78");
  const [sex, setSex] = useState<"male" | "female">("female");
  const [weightInput, setWeightInput] = useState("62");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [scrInput, setScrInput] = useState("1.2");
  const [scrUnit, setScrUnit] = useState<ScrUnit>("mg/dL");
  const [roundLowScr, setRoundLowScr] = useState(true);
  const [frailty, setFrailty] = useState<FrailtyStatus>("pre_frail");
  const [adultDose, setAdultDose] = useState("100");
  const [doseUnit, setDoseUnit] = useState("mg");
  const [rule, setRule] = useState<GeriatricRule>("start_low_50");
  const [selectedDrug, setSelectedDrug] = useState("custom");
  const [copied, setCopied] = useState(false);

  const numAge = parseFloat(age) || 65;
  const rawWeight = parseFloat(weightInput) || 0;
  const rawScr = parseFloat(scrInput) || 0;
  const numAdultDose = parseFloat(adultDose) || 0;

  const weightKg = useMemo(() => toWeightKg(rawWeight, weightUnit), [rawWeight, weightUnit]);
  const scrMgDl = useMemo(() => toScrMgDl(rawScr, scrUnit), [rawScr, scrUnit]);
  const effectiveScr = useMemo(() => toEffectiveScr(scrMgDl, roundLowScr), [scrMgDl, roundLowScr]);

  const crcl = useMemo(
    () => cockcroftGault(numAge, weightKg, effectiveScr, sex),
    [numAge, weightKg, effectiveScr, sex],
  );
  const unadjustedCrcl = useMemo(
    () => cockcroftGault(numAge, weightKg, scrMgDl, sex),
    [numAge, weightKg, scrMgDl, sex],
  );

  const frailtyMultiplier = FRAILTY_MULTIPLIER[frailty];

  const ruleCalculations = useMemo(
    () => calculateRules(numAdultDose, crcl, frailtyMultiplier, rule),
    [numAdultDose, crcl, frailtyMultiplier, rule],
  );

  const activeDrugMonograph = useMemo(
    () => GERIATRIC_DRUG_PRESETS.find((d) => d.name === selectedDrug) ?? null,
    [selectedDrug],
  );

  const scrWasRounded = roundLowScr && scrMgDl < 0.8 && scrMgDl > 0;

  const selectDrug = (drugName: string) => {
    setSelectedDrug(drugName);
    const drug = GERIATRIC_DRUG_PRESETS.find((d) => d.name === drugName);
    if (drug) {
      setAdultDose(drug.adultDoseMg.toString());
      setDoseUnit("mg");
      if (drug.name === "Digoxin" || drug.name === "Lorazepam") setRule("start_low_33");
      else if (drug.name === "Gabapentin" || drug.name === "Metformin") setRule("renal_crcl");
    }
  };

  const loadPatientPreset = (p: PatientPreset) => {
    setAge(p.age);
    setSex(p.sex);
    setWeightInput(p.weight);
    setWeightUnit(p.weightUnit);
    setScrInput(p.scr);
    setScrUnit(p.scrUnit);
    setFrailty(p.frailty);
    setAdultDose(p.adultDose);
    setRule(p.rule);
  };

  const reset = () => {
    setAge("78");
    setSex("female");
    setWeightInput("62");
    setWeightUnit("kg");
    setScrInput("1.2");
    setScrUnit("mg/dL");
    setRoundLowScr(true);
    setFrailty("pre_frail");
    setAdultDose("100");
    setDoseUnit("mg");
    setRule("start_low_50");
    setSelectedDrug("custom");
  };

  // Consult note text is unchanged from the previous page.
  const copyConsultNote = useCallback(() => {
    if (!ruleCalculations) return;
    const note = `=== GERIATRIC PHARMACOTHERAPY & DOSING CONSULT ===
PATIENT DEMOGRAPHICS & PHYSIOLOGY:
- Age: ${numAge} yrs | Sex: ${sex.toUpperCase()} | Weight: ${weightKg} kg (${rawWeight} ${weightUnit})
- Serum Creatinine: ${scrMgDl} mg/dL ${scrWasRounded ? `(Sarcopenia-Adjusted to 0.8 mg/dL)` : ""}
- Cockcroft-Gault CrCl: ${crcl} mL/min (Unadjusted: ${unadjustedCrcl} mL/min)
- Frailty Staging: ${frailty.replace("_", " ").toUpperCase()} (Multi-factor scale: ${(frailtyMultiplier * 100).toFixed(0)}%)

DRUG & DOSING EVALUATION:
- Drug: ${activeDrugMonograph ? `${activeDrugMonograph.name} (${activeDrugMonograph.brand})` : "Custom Agent"}
- Standard Adult Dose: ${numAdultDose} ${doseUnit}
- RECOMMENDED GERIATRIC DOSE: ${ruleCalculations.activeDose} ${doseUnit} (${ruleCalculations.reductionPercent}% Dose Reduction)
- Applied Dosing Strategy: ${ruleCalculations.activeRuleLabel}
- Clinical Rationale: ${ruleCalculations.activeRationale}

2023 AGS BEERS CRITERIA & MEDICATION SAFETY:
${activeDrugMonograph?.beersWarning ? `[BEERS CRITERIA ALERT]: ${activeDrugMonograph.beersWarning}` : "No direct high-risk Beers criteria violations identified for selected dosing."}
${activeDrugMonograph?.clinicalPearls ? `[CLINICAL PEARLS]: ${activeDrugMonograph.clinicalPearls}` : ""}

PRINCIPLE: "Start Low, Go Slow, but Go Until Goal." Titrate in 2-4 week intervals based on clinical efficacy and adverse effects.
Generated: ${new Date().toLocaleString()}`;

    try {
      navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [
    ruleCalculations, numAge, sex, weightKg, rawWeight, weightUnit, scrMgDl, scrWasRounded,
    crcl, unadjustedCrcl, frailty, frailtyMultiplier, activeDrugMonograph, numAdultDose, doseUnit,
  ]);

  return (
    <CalculatorShell
      title="Geriatric Dosing & Safety Calculator"
      subtitle="Applies 'start low, go slow' dose reductions against Cockcroft-Gault clearance and a frailty index, with AGS Beers Criteria alerts for high-risk drugs."
      icon={Stethoscope}
      eyebrow="Clinical & Hospital Pharmacy"
      aside={
        <>
          <CalcAbout title="About geriatric dosing">
            <p>
              Ageing lowers renal clearance, hepatic mass and lean body weight while raising body fat,
              so the same dose reaches a higher concentration and lingers longer. The standard
              response is to start well below the adult dose and titrate slowly to effect.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Choosing a starting dose for a patient over 65",
                "Comparing a renal-scaled dose with a flat 50% reduction",
                "Checking a drug against the AGS Beers Criteria",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Cockcroft-Gault needs a stable creatinine; it is meaningless in acute kidney injury.",
                "Proportional renal scaling suits renally cleared drugs — it is not right for every agent.",
                "A low creatinine in a frail elder usually means low muscle mass, not good kidneys.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label={ruleCalculations?.activeRuleLabel ?? "Recommended geriatric dose"}
        value={ruleCalculations ? ruleCalculations.activeDose : null}
        unit={doseUnit}
        interpretation={
          ruleCalculations
            ? `${ruleCalculations.reductionPercent}% reduction vs adult standard (${numAdultDose} ${doseUnit})`
            : undefined
        }
        tone={ruleCalculations ? (ruleCalculations.reductionPercent >= 60 ? "warning" : "success") : "neutral"}
        empty="Enter a standard adult dose above 0."
      />

      {ruleCalculations && (
        <LabNotice tone="info" title="Clinical directive">
          {ruleCalculations.activeRationale}
        </LabNotice>
      )}

      {activeDrugMonograph?.beersWarning && (
        <LabNotice tone="danger" title="AGS Beers Criteria alert">
          {activeDrugMonograph.beersWarning}
        </LabNotice>
      )}

      <CalcSection title="Dosing rule">
        <ModeSwitch<GeriatricRule>
          label="Geriatric dosing strategy"
          value={rule}
          onChange={setRule}
          options={RULE_OPTIONS}
        />
      </CalcSection>

      <CalcSection title="Patient biometrics & clearance" description="Cockcroft-Gault needs age, weight, sex and a stable serum creatinine.">
        <FieldGrid>
          <NumberField
            label="Age"
            value={age}
            onChange={setAge}
            unit="years"
            step="1"
            min={0}
            hint="This tool is intended for patients aged 65 and over."
          />
          <SelectField
            label="Biological sex"
            value={sex}
            onChange={(v) => setSex(v as "male" | "female")}
            options={[
              { value: "female", label: "Female (×0.85)" },
              { value: "male", label: "Male" },
            ]}
          />
          <NumberField
            label="Weight"
            value={weightInput}
            onChange={setWeightInput}
            units={["kg", "lbs"]}
            unit={weightUnit}
            onUnitChange={(v) => setWeightUnit(v as WeightUnit)}
            step="0.1"
            min={0}
            hint={weightUnit === "lbs" ? `≈ ${weightKg} kg` : "Actual body weight."}
          />
          <NumberField
            label="Serum creatinine"
            value={scrInput}
            onChange={setScrInput}
            units={["mg/dL", "umol/L"]}
            unit={scrUnit}
            onUnitChange={(v) => setScrUnit(v as ScrUnit)}
            step="0.01"
            min={0}
            hint={scrUnit === "umol/L" ? `≈ ${scrMgDl} mg/dL` : "Must be at steady state."}
          />
        </FieldGrid>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={roundLowScr}
            onChange={(e) => setRoundLowScr(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <span className="leading-relaxed text-foreground/90">
            Round a serum creatinine below 0.8 mg/dL up to 0.8 (sarcopenia correction)
          </span>
        </label>

        <div>
          <ResultRow label="Cockcroft-Gault CrCl" value={crcl} unit="mL/min" />
          {scrWasRounded && (
            <ResultRow
              label="Uncorrected CrCl (using SCr as entered)"
              value={unadjustedCrcl}
              unit="mL/min"
              badge="would overestimate"
              badgeTone="warning"
            />
          )}
        </div>
      </CalcSection>

      <CalcSection title="Frailty staging" description="Scales the dose in the multi-factorial rule.">
        <ModeSwitch<FrailtyStatus>
          label="Frailty status"
          value={frailty}
          onChange={setFrailty}
          options={(Object.keys(FRAILTY_LABEL) as FrailtyStatus[]).map((k) => ({
            value: k,
            label: FRAILTY_LABEL[k].label,
            description: FRAILTY_LABEL[k].sub,
          }))}
        />
      </CalcSection>

      <CalcSection title="Drug & adult dose" description="Pick a monograph or type any standard adult dose.">
        <FieldGrid>
          <SelectField
            label="Drug"
            value={selectedDrug}
            onChange={selectDrug}
            options={[
              { value: "custom", label: "Custom agent" },
              ...GERIATRIC_DRUG_PRESETS.map((d) => ({ value: d.name, label: `${d.name} (${d.brand})` })),
            ]}
          />
          <NumberField
            label="Standard adult dose"
            value={adultDose}
            onChange={setAdultDose}
            unit={doseUnit}
            step="0.01"
            min={0}
            hint="The usual adult dose before any geriatric reduction."
            error={
              adultDose.trim() !== "" && (!Number.isFinite(numAdultDose) || numAdultDose <= 0)
                ? "Adult dose must be greater than 0."
                : undefined
            }
          />
        </FieldGrid>

        {activeDrugMonograph && (
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
            <p className="text-[13px] font-semibold text-foreground">
              {activeDrugMonograph.name} ({activeDrugMonograph.brand})
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeDrugMonograph.category} · {activeDrugMonograph.route} · {activeDrugMonograph.frequency}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">
              {activeDrugMonograph.clinicalPearls}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Patient archetype</span>
          {PATIENT_PRESETS.map((p) => (
            <Button key={p.name} type="button" variant="outline" size="sm" title={p.tag} onClick={() => loadPatientPreset(p)}>
              {p.name}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {ruleCalculations && (
        <CalcSection title="Dose comparison across the four rules" description="What each strategy gives for this patient and drug.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Rule</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Dose</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Reduction</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Basis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "start_low_50", name: "Start low 50% rule", dose: ruleCalculations.dose50, basis: "Flat half of the adult dose" },
                  { key: "start_low_33", name: "Conservative 33% rule", dose: ruleCalculations.dose33, basis: "CNS-active / narrow therapeutic index" },
                  { key: "renal_crcl", name: "Renal clearance scaled", dose: ruleCalculations.doseRenal, basis: `CrCl ${crcl} mL/min → ${ruleCalculations.renalFactor}% (floor 20%)` },
                  { key: "frailty_adjusted", name: "Frailty & renal adjusted", dose: ruleCalculations.doseFrailty, basis: `CrCl × ${(frailtyMultiplier * 100).toFixed(0)}% frailty (floor 15%)` },
                ].map((r) => (
                  <tr key={r.key} className={`border-b border-border/60 last:border-b-0 ${rule === r.key ? "bg-primary/5" : ""}`}>
                    <td className="py-2 pr-3 font-medium">{r.name}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.dose} {doseUnit}</td>
                    <td className="py-2 pr-3 tabular-nums">−{Math.round(((numAdultDose - r.dose) / numAdultDose) * 100)}%</td>
                    <td className="py-2 text-xs text-muted-foreground">{r.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={copyConsultNote}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy consult note"}
            </Button>
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>Creatinine clearance comes from Cockcroft-Gault:</p>
        <Formula>CrCl = ((140 − age) × weight kg) / (72 × SCr mg/dL) × 0.85 if female</Formula>
        <p>
          With the sarcopenia option on, a creatinine below 0.8 mg/dL is raised to 0.8 first, because
          a low value in a frail elder reflects lost muscle rather than good kidney function and would
          otherwise inflate the clearance.
        </p>
        <p>The four dosing rules are then:</p>
        <Formula>50% rule: dose = adult × 0.5</Formula>
        <Formula>33% rule: dose = adult × 0.333</Formula>
        <Formula>Renal: dose = adult × clamp(CrCl/100, 0.2, 1.0)</Formula>
        <Formula>Frailty: dose = adult × clamp(CrCl/100 × frailty, 0.15, 1.0)</Formula>
        <p>
          Frailty coefficients are 100% robust, 85% pre-frail, 70% frail and 55% severely frail. The
          clamps stop the renal rule falling below a fifth of the adult dose, and the combined rule
          below 15%. All doses are rounded to two decimals.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why round a low creatinine up to 0.8?",
            a: "Creatinine comes from muscle. A frail 88-year-old with little muscle can have a creatinine of 0.5 mg/dL and still have poor kidneys; feeding that number into Cockcroft-Gault produces a flatteringly high clearance and an unsafe dose. Rounding to 0.8 is a common, deliberately conservative convention — it is not universal, so check local practice.",
          },
          {
            q: "Which rule should I use?",
            a: "Renal scaling suits drugs cleared mainly by the kidney, such as gabapentin or metformin. The 33% rule suits CNS-active, anticholinergic or narrow therapeutic index agents. The flat 50% rule is the general default, and the frailty rule combines renal function with overall physiological reserve for multi-morbid patients.",
          },
          {
            q: "Should I use Cockcroft-Gault or eGFR?",
            a: "For drug dosing, Cockcroft-Gault — most dosing studies and package inserts are built on it, and it uses actual body weight. Reported eGFR (CKD-EPI) is normalised to 1.73 m² body surface area and is intended for staging chronic kidney disease, not for calculating a dose.",
          },
          {
            q: "What are the Beers Criteria?",
            a: "An American Geriatrics Society list of medications that are potentially inappropriate in older adults, because the risk of harm outweighs the benefit or a safer alternative exists. Benzodiazepines and digoxin above 0.125 mg/day are flagged here. A Beers listing is a prompt to review, not an absolute prohibition.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
