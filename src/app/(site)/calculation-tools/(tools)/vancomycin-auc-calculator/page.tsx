"use client";

import { useCallback, useMemo, useState } from "react";
import { Droplet, Check, Copy } from "lucide-react";
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
  assessTarget,
  calculateAdjBW,
  calculateBMI,
  calculateCrCl,
  calculateIBW,
  calculatePk,
  findAlternativeRegimens,
  findOptimalRegimen,
  recommendWeightMethod,
  type Sex,
  type WeightMethod,
} from "./_vanco";

interface PatientPreset {
  label: string;
  tag: string;
  age: string;
  sex: Sex;
  weight: string;
  weightUnit: "kg" | "lbs";
  height: string;
  heightUnit: "cm" | "in";
  scr: string;
  scrUnit: "mg/dL" | "umol/L";
}

const PATIENT_PRESETS: PatientPreset[] = [
  { label: "Normal Renal", tag: "CrCl ~100", age: "52", sex: "male", weight: "80", weightUnit: "kg", height: "178", heightUnit: "cm", scr: "1.0", scrUnit: "mg/dL" },
  { label: "Moderate CKD", tag: "CrCl ~48", age: "68", sex: "male", weight: "82", weightUnit: "kg", height: "175", heightUnit: "cm", scr: "1.5", scrUnit: "mg/dL" },
  { label: "Severe CKD G4", tag: "CrCl ~24", age: "75", sex: "female", weight: "62", weightUnit: "kg", height: "160", heightUnit: "cm", scr: "2.0", scrUnit: "mg/dL" },
  { label: "Hyperclearance", tag: "CrCl ~145", age: "28", sex: "male", weight: "85", weightUnit: "kg", height: "182", heightUnit: "cm", scr: "0.7", scrUnit: "mg/dL" },
  { label: "Obese Patient", tag: "BMI 36", age: "60", sex: "female", weight: "105", weightUnit: "kg", height: "165", heightUnit: "cm", scr: "1.2", scrUnit: "mg/dL" },
];

const INTERVAL_OPTIONS = [8, 12, 18, 24, 36, 48].map((h) => ({
  value: String(h),
  label: `q${h}h (every ${h}h)`,
}));

const INFUSION_OPTIONS = [
  { value: "1.0", label: "1.0 hr (≤ 1000 mg)" },
  { value: "1.5", label: "1.5 hrs (1250–1500 mg)" },
  { value: "2.0", label: "2.0 hrs (1750–2000 mg)" },
  { value: "2.5", label: "2.5 hrs (> 2000 mg)" },
];

const MIC_OPTIONS = [
  { value: "0.5", label: "0.5 mg/L" },
  { value: "1.0", label: "1.0 mg/L (standard BMD)" },
  { value: "1.5", label: "1.5 mg/L" },
  { value: "2.0", label: "2.0 mg/L (VISA borderline)" },
];

const STATUS_TONE: Record<string, ResultTone> = {
  therapeutic: "success",
  subtherapeutic: "warning",
  supratherapeutic: "danger",
};

export default function VancomycinAUCCalculator() {
  const [age, setAge] = useState("58");
  const [sex, setSex] = useState<Sex>("male");
  const [weightInput, setWeightInput] = useState("82");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightInput, setHeightInput] = useState("178");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [scrInput, setScrInput] = useState("1.1");
  const [scrUnit, setScrUnit] = useState<"mg/dL" | "umol/L">("mg/dL");
  const [dose, setDose] = useState("1250");
  const [interval, setInterval] = useState("12");
  const [infusionTime, setInfusionTime] = useState("1.5");
  const [mic, setMic] = useState("1.0");
  const [weightMethod, setWeightMethod] = useState<WeightMethod>("auto");
  const [copied, setCopied] = useState(false);

  const numAge = parseFloat(age) || 0;
  const rawWeight = parseFloat(weightInput) || 0;
  const rawHeight = parseFloat(heightInput) || 0;
  const rawScr = parseFloat(scrInput) || 0;
  const numDose = parseFloat(dose) || 0;
  const numInterval = parseFloat(interval) || 0;
  const numInfusionTime = parseFloat(infusionTime) || 1.0;
  const numMic = parseFloat(mic) || 1.0;

  const weightKg = useMemo(
    () => (weightUnit === "lbs" ? Math.round(rawWeight * 0.453592 * 10) / 10 : rawWeight),
    [rawWeight, weightUnit],
  );
  const heightInches = useMemo(
    () => (heightUnit === "cm" ? rawHeight / 2.54 : rawHeight),
    [rawHeight, heightUnit],
  );
  const heightCm = useMemo(
    () => (heightUnit === "in" ? rawHeight * 2.54 : rawHeight),
    [rawHeight, heightUnit],
  );
  const scrMgDl = useMemo(
    () => (scrUnit === "umol/L" ? Math.round((rawScr / 88.4) * 100) / 100 : rawScr),
    [rawScr, scrUnit],
  );

  const ibwKg = useMemo(
    () => (heightInches <= 0 ? 0 : Math.round(calculateIBW(heightInches, sex) * 10) / 10),
    [heightInches, sex],
  );
  const adjBwKg = useMemo(
    () => (weightKg <= 0 || ibwKg <= 0 ? 0 : Math.round(calculateAdjBW(weightKg, ibwKg) * 10) / 10),
    [weightKg, ibwKg],
  );
  const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);

  const { autoRecommendedMethod, autoReason } = useMemo(
    () => recommendWeightMethod(weightKg, ibwKg, bmi),
    [weightKg, ibwKg, bmi],
  );

  const resolvedMethod = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;

  const effectiveCrClWeight = useMemo(() => {
    if (resolvedMethod === "actual") return weightKg;
    if (resolvedMethod === "ibw") return ibwKg || weightKg;
    if (resolvedMethod === "adjbw") return adjBwKg || weightKg;
    return weightKg;
  }, [resolvedMethod, weightKg, ibwKg, adjBwKg]);

  const effectiveWeightLabel = useMemo(() => {
    if (resolvedMethod === "actual") return `Actual TBW (${weightKg} kg)`;
    if (resolvedMethod === "ibw") return `Ideal Body Weight (${ibwKg} kg)`;
    if (resolvedMethod === "adjbw") return `Adjusted Body Weight (${adjBwKg} kg)`;
    return `${effectiveCrClWeight} kg`;
  }, [resolvedMethod, weightKg, ibwKg, adjBwKg, effectiveCrClWeight]);

  const crcl = useMemo(() => {
    if (!numAge || !effectiveCrClWeight || !scrMgDl) return 0;
    return calculateCrCl(numAge, effectiveCrClWeight, scrMgDl, sex);
  }, [numAge, effectiveCrClWeight, scrMgDl, sex]);

  const pkResults = useMemo(
    () => calculatePk(weightKg, crcl, numDose, numInterval, numInfusionTime, numMic),
    [weightKg, crcl, numDose, numInterval, numInfusionTime, numMic],
  );

  const targetStatus = useMemo(
    () => (pkResults ? assessTarget(pkResults.aucMic) : null),
    [pkResults],
  );

  const optimalRegimen = useMemo(
    () => findOptimalRegimen(weightKg, crcl, numMic),
    [weightKg, crcl, numMic],
  );

  const alternativeRegimens = useMemo(
    () => (pkResults ? findAlternativeRegimens(weightKg, crcl, numMic, numDose, numInterval) : []),
    [pkResults, weightKg, crcl, numMic, numDose, numInterval],
  );

  const loadPreset = (p: PatientPreset) => {
    setAge(p.age);
    setSex(p.sex);
    setWeightInput(p.weight);
    setWeightUnit(p.weightUnit);
    setHeightInput(p.height);
    setHeightUnit(p.heightUnit);
    setScrInput(p.scr);
    setScrUnit(p.scrUnit);
  };

  const applyRegimen = (d: number, tau: number) => {
    setDose(String(d));
    setInterval(String(tau));
    setInfusionTime(d <= 1000 ? "1.0" : d <= 1500 ? "1.5" : d <= 2000 ? "2.0" : "2.5");
  };

  const reset = () => {
    setAge("58");
    setSex("male");
    setWeightInput("82");
    setWeightUnit("kg");
    setHeightInput("178");
    setHeightUnit("cm");
    setScrInput("1.1");
    setScrUnit("mg/dL");
    setDose("1250");
    setInterval("12");
    setInfusionTime("1.5");
    setMic("1.0");
    setWeightMethod("auto");
  };

  const copyConsultNote = useCallback(() => {
    if (!pkResults || !targetStatus) return;
    const note = `=== VANCOMYCIN AUC-GUIDED DOSING CONSULT (ASHP/IDSA 2020) ===
PATIENT:
- Age ${numAge} | Sex ${sex.toUpperCase()} | TBW ${weightKg} kg | Height ${Math.round(heightCm)} cm | BMI ${bmi} kg/m²
- SCr ${scrMgDl} mg/dL | Weight used for CrCl: ${effectiveWeightLabel}
- Cockcroft-Gault CrCl: ${crcl} mL/min

CURRENT REGIMEN: ${numDose} mg IV q${numInterval}h over ${numInfusionTime} h (MIC ${numMic} mg/L)
- AUC24: ${pkResults.auc24} mg·h/L | AUC24/MIC: ${pkResults.aucMic}
- Predicted Cmax,ss ${pkResults.cMaxSs} mcg/mL | Cmin,ss ${pkResults.cMinSs} mcg/mL
- Status: ${targetStatus.label}
- ${targetStatus.message}

PK PARAMETERS: Vd ${pkResults.Vd} L | ke ${pkResults.ke} hr⁻¹ | t½ ${pkResults.halfLife} h | CL ${pkResults.clearanceLhr} L/hr
LOADING DOSE: ${pkResults.recommendedLoadingDose} mg IV (25–35 mg/kg ABW, max 3000 mg)
${optimalRegimen ? `SUGGESTED REGIMEN: ${optimalRegimen.dose} mg q${optimalRegimen.interval}h → AUC/MIC ${optimalRegimen.aucMic}` : ""}

Generated: ${new Date().toLocaleString()}`;
    try {
      navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [pkResults, targetStatus, numAge, sex, weightKg, heightCm, bmi, scrMgDl, effectiveWeightLabel, crcl, numDose, numInterval, numInfusionTime, numMic, optimalRegimen]);

  return (
    <CalculatorShell
      title="Vancomycin AUC/MIC Dosing Calculator"
      subtitle="One-compartment PK modelling of AUC₂₄/MIC, steady-state peak and trough, loading dose and an optimised regimen, following the ASHP/IDSA 2020 AUC-guided approach."
      icon={Droplet}
      eyebrow="Clinical & Hospital Pharmacy"
      aside={
        <>
          <CalcAbout title="About AUC-guided dosing">
            <p>
              The 2020 ASHP/IDSA guideline moved vancomycin monitoring from trough-only targets to
              AUC₂₄/MIC, aiming for 400–600 mg·h/L. Troughs of 15–20 mcg/mL were found to overshoot
              that exposure and drive acute kidney injury without improving cure rates.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Choosing an empiric regimen from population PK before levels are back",
                "Checking whether a current regimen lands in the 400–600 window",
                "Understanding how CrCl drives ke, half-life and clearance",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This is population PK, not Bayesian fitting to measured levels. Confirm with serum concentrations.",
                "Not valid in unstable renal function, dialysis, CRRT, major burns or severe ascites.",
                "Vd is taken as 0.7 L/kg of actual body weight, which can misestimate in extremes of body habitus.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <LabNotice tone="warning" title="Educational tool — confirm with measured levels">
        Population estimates carry wide inter-patient variability. Therapeutic drug monitoring with
        actual serum concentrations, and a pharmacist&apos;s review, remain mandatory before dosing a
        patient.
      </LabNotice>

      <ResultCard
        label="AUC₂₄ / MIC ratio"
        value={pkResults ? pkResults.aucMic : null}
        unit="target 400–600"
        interpretation={targetStatus?.label}
        tone={targetStatus ? STATUS_TONE[targetStatus.type] : "neutral"}
        empty="Enter the patient's biometrics and a maintenance regimen."
      />

      {targetStatus && (
        <LabNotice
          tone={targetStatus.type === "therapeutic" ? "info" : targetStatus.type === "subtherapeutic" ? "warning" : "danger"}
          title="Clinical evaluation"
        >
          {targetStatus.message}
        </LabNotice>
      )}

      <CalcSection title="Patient biometrics & clearance" description="Cockcroft-Gault clearance drives the whole model.">
        <FieldGrid>
          <NumberField label="Age" value={age} onChange={setAge} unit="years" step="1" min={0} />
          <SelectField
            label="Biological sex"
            value={sex}
            onChange={(v) => setSex(v as Sex)}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female (×0.85)" },
            ]}
          />
          <NumberField
            label="Total body weight"
            value={weightInput}
            onChange={setWeightInput}
            units={["kg", "lbs"]}
            unit={weightUnit}
            onUnitChange={(v) => setWeightUnit(v as "kg" | "lbs")}
            step="0.1"
            min={0}
            hint={weightUnit === "lbs" ? `≈ ${weightKg} kg` : "Used for Vd (0.7 L/kg)."}
          />
          <NumberField
            label="Height"
            value={heightInput}
            onChange={setHeightInput}
            units={["cm", "in"]}
            unit={heightUnit}
            onUnitChange={(v) => setHeightUnit(v as "cm" | "in")}
            step="0.1"
            min={0}
            hint={`IBW ${ibwKg} kg · BMI ${bmi} kg/m²`}
          />
          <NumberField
            label="Serum creatinine"
            value={scrInput}
            onChange={setScrInput}
            units={["mg/dL", "umol/L"]}
            unit={scrUnit}
            onUnitChange={(v) => setScrUnit(v as "mg/dL" | "umol/L")}
            step="0.01"
            min={0}
            hint={scrUnit === "umol/L" ? `≈ ${scrMgDl} mg/dL` : "Must be at steady state."}
          />
        </FieldGrid>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-foreground/90">Weight used for CrCl</p>
          <ModeSwitch<WeightMethod>
            label="Weight method"
            value={weightMethod}
            onChange={setWeightMethod}
            options={[
              { value: "auto", label: "Auto", description: "Recommended" },
              { value: "actual", label: "Actual", description: `${weightKg} kg` },
              { value: "ibw", label: "IBW", description: `${ibwKg} kg` },
              { value: "adjbw", label: "AdjBW", description: `${adjBwKg} kg` },
            ]}
          />
          {weightMethod === "auto" && (
            <p className="text-xs leading-relaxed text-muted-foreground">{autoReason}</p>
          )}
        </div>

        <div>
          <ResultRow label="Weight applied" value={effectiveWeightLabel} />
          <ResultRow label="Cockcroft-Gault CrCl" value={crcl} unit="mL/min" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Patient archetype</span>
          {PATIENT_PRESETS.map((p) => (
            <Button key={p.label} type="button" variant="outline" size="sm" title={p.tag} onClick={() => loadPreset(p)}>
              {p.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Regimen parameters" description="The maintenance regimen being assessed.">
        <FieldGrid>
          <NumberField label="Maintenance dose" value={dose} onChange={setDose} unit="mg" step="50" min={0} />
          <SelectField label="Dosing interval" value={interval} onChange={setInterval} options={INTERVAL_OPTIONS} />
          <SelectField label="Infusion duration" value={infusionTime} onChange={setInfusionTime} options={INFUSION_OPTIONS} />
          <SelectField label="Target pathogen MIC" value={mic} onChange={setMic} options={MIC_OPTIONS} />
        </FieldGrid>
      </CalcSection>

      {optimalRegimen && (
        <CalcSection title="Auto-calculated target regimen" description="The candidate whose AUC₂₄/MIC lands closest to 500.">
          <div>
            <ResultRow
              label="Suggested regimen"
              value={`${optimalRegimen.dose} mg IV q${optimalRegimen.interval}h`}
              badge={`AUC/MIC ${optimalRegimen.aucMic}`}
              badgeTone="success"
            />
            <ResultRow label="Predicted trough" value={optimalRegimen.cMin} unit="mcg/mL" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyRegimen(optimalRegimen.dose, optimalRegimen.interval)}
          >
            Apply this regimen
          </Button>
        </CalcSection>
      )}

      {pkResults && (
        <CalcSection title="Exposure forecast & PK parameters" description="Steady-state values for the regimen entered above.">
          <div>
            <ResultRow label="24-hour AUC (exposure)" value={pkResults.auc24} unit="mg·h/L" />
            <ResultRow label="AUC₂₄ / MIC" value={pkResults.aucMic} badge={targetStatus?.label} badgeTone={targetStatus?.type === "therapeutic" ? "success" : "destructive"} />
            <ResultRow label="Total daily dose" value={pkResults.totalDailyDose} unit="mg/day" />
            <ResultRow label="Predicted peak (Cmax,ss)" value={pkResults.cMaxSs} unit="mcg/mL" />
            <ResultRow label="Predicted trough (Cmin,ss)" value={pkResults.cMinSs} unit="mcg/mL" />
            <ResultRow label="Volume of distribution (Vd)" value={pkResults.Vd} unit="L" />
            <ResultRow label="Elimination rate constant (ke)" value={pkResults.ke} unit="hr⁻¹" />
            <ResultRow label="Half-life (t½)" value={pkResults.halfLife} unit="hours" />
            <ResultRow label="Clearance" value={pkResults.clearanceLhr} unit="L/hr" />
            <ResultRow
              label="Recommended loading dose"
              value={pkResults.recommendedLoadingDose}
              unit="mg IV"
              badge="25–35 mg/kg"
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The loading dose is 25–35 mg/kg of actual body weight, rounded to the nearest 250 mg and
            capped at 3000 mg — for severe sepsis or critically ill patients.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={copyConsultNote}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy consult note"}
            </Button>
          </div>
        </CalcSection>
      )}

      {alternativeRegimens.length > 0 && (
        <CalcSection title="Alternative regimens reaching the 400–600 target" description="Other combinations for this patient's clearance.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Regimen</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">AUC₂₄</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">AUC/MIC</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Pred. trough</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alternativeRegimens.map((r) => (
                  <tr
                    key={`${r.dose}-${r.interval}`}
                    className={`border-b border-border/60 last:border-b-0 ${r.isCurrent ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-2 pr-3 font-medium">
                      {r.dose} mg q{r.interval}h{r.isCurrent && <span className="ml-2 text-xs text-muted-foreground">(current)</span>}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{r.auc24}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.aucMic}</td>
                    <td className="py-2 pr-3 tabular-nums">{r.cMin} mcg/mL</td>
                    <td className="py-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => applyRegimen(r.dose, r.interval)}>
                        Apply
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>Clearance is estimated from Cockcroft-Gault, then converted with the Matzke relation:</p>
        <Formula>CrCl = ((140 − age) × weight) / (72 × SCr) × 0.85 if female</Formula>
        <Formula>ke = 0.00083 × CrCl + 0.0044 (minimum 0.005 hr⁻¹)</Formula>
        <Formula>Vd = 0.7 L/kg × actual body weight · CL = Vd × ke · t½ = 0.693 / ke</Formula>
        <p>Steady-state concentrations come from the intermittent-infusion model:</p>
        <Formula>Cmax,ss = [D / (t_inf × Vd × ke)] × (1 − e^−ke·t_inf) / (1 − e^−ke·τ)</Formula>
        <Formula>Cmin,ss = Cmax,ss × e^−ke·(τ − t_inf)</Formula>
        <p>Exposure is then the daily dose over clearance:</p>
        <Formula>AUC₂₄ = total daily dose / CL · AUC₂₄/MIC = AUC₂₄ / MIC</Formula>
        <p>
          The weight used for CrCl follows a heuristic: actual body weight if the patient is below
          IBW, adjusted body weight (IBW + 0.4 × excess) if above 120% of IBW, otherwise IBW. The
          optimiser searches doses of 500–2000 mg against intervals of 8–48 h and picks the
          combination whose AUC/MIC is nearest 500.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why AUC rather than trough?",
            a: "Trough is a proxy, and a poor one. The 2020 ASHP/IDSA guideline found troughs of 15–20 mcg/mL routinely produce AUCs well above 600 mg·h/L, raising nephrotoxicity without improving outcomes. AUC₂₄/MIC of 400–600 is the exposure that actually correlates with cure in MRSA infection.",
          },
          {
            q: "Which weight should be used?",
            a: "Volume of distribution scales with actual body weight, so Vd always uses TBW here. Creatinine clearance is different: in obesity, actual weight overestimates renal function, so adjusted body weight is used above 120% of IBW, and IBW in normal-weight patients. The Auto setting applies that rule and explains its choice.",
          },
          {
            q: "Is a loading dose always needed?",
            a: "Not always, but without one it takes four to five half-lives to reach steady state — well over two days in renal impairment. In severe sepsis or critical illness, 25–35 mg/kg of actual body weight (capped around 3000 mg) gets therapeutic exposure immediately.",
          },
          {
            q: "When is this model not valid?",
            a: "Whenever renal function is not at steady state, or the one-compartment assumption breaks: acute kidney injury, haemodialysis, CRRT, extensive burns, severe ascites or major fluid shifts. Those patients need Bayesian dosing software fitted to measured concentrations.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
