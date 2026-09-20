"use client";

import { useCallback, useMemo, useState } from "react";
import { Activity, Check, Copy, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  renalDrugsDatabase,
  calculateAdjBW,
  calculateBMI,
  calculateCKDEPI2021,
  calculateCrCl,
  calculateIBW,
  getKDIGOStage,
  type DrugCategory,
  type PatientScenario,
} from "./_renal";

type WeightMethod = "auto" | "actual" | "ibw" | "adjbw";

const PATIENT_SCENARIOS: PatientScenario[] = [
  { label: "Normal CrCl", desc: "CrCl ~105", age: "35", sex: "male", weight: "75", weightUnit: "kg", height: "178", heightUnit: "cm", scr: "0.9", scrUnit: "mg/dL" },
  { label: "Moderate CKD", desc: "CrCl ~42", age: "68", sex: "male", weight: "84", weightUnit: "kg", height: "176", heightUnit: "cm", scr: "1.6", scrUnit: "mg/dL" },
  { label: "Severe CKD G4", desc: "CrCl ~22", age: "74", sex: "female", weight: "62", weightUnit: "kg", height: "160", heightUnit: "cm", scr: "2.1", scrUnit: "mg/dL" },
  { label: "ESRD / Dialysis", desc: "CrCl ~8", age: "60", sex: "male", weight: "70", weightUnit: "kg", height: "172", heightUnit: "cm", scr: "6.5", scrUnit: "mg/dL" },
  { label: "Elderly Sarcopenic", desc: "CrCl ~28", age: "84", sex: "female", weight: "48", weightUnit: "kg", height: "155", heightUnit: "cm", scr: "1.1", scrUnit: "mg/dL" },
];

const CATEGORIES: DrugCategory[] = [
  "All",
  "Antibiotics",
  "Antivirals & Antifungals",
  "Anticoagulants",
  "Cardiovascular",
  "Endocrine & Diabetes",
  "Neurology & Analgesics",
  "Rheumatology & Gout",
];

const STATUS_TONE: Record<string, ResultTone> = {
  safe: "success",
  monitored: "neutral",
  caution: "warning",
  contraindicated: "danger",
};

export default function RenalDosingAdjuster() {
  const [age, setAge] = useState("68");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weightInput, setWeightInput] = useState("84");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightInput, setHeightInput] = useState("176");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [scrInput, setScrInput] = useState("1.6");
  const [scrUnit, setScrUnit] = useState<"mg/dL" | "umol/L">("mg/dL");
  const [weightMethod, setWeightMethod] = useState<WeightMethod>("auto");
  const [selectedDrugId, setSelectedDrugId] = useState("vancomycin");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DrugCategory>("All");
  const [copied, setCopied] = useState(false);

  const numAge = parseFloat(age) || 0;
  const rawWeight = parseFloat(weightInput) || 0;
  const rawHeight = parseFloat(heightInput) || 0;
  const rawScr = parseFloat(scrInput) || 0;

  const weightKg = useMemo(
    () => (weightUnit === "lbs" ? Math.round(rawWeight * 0.45359237 * 10) / 10 : rawWeight),
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

  const { autoRecommendedMethod, autoReason } = useMemo(() => {
    if (!weightKg || !ibwKg) {
      return { autoRecommendedMethod: "actual" as const, autoReason: "Standard weight basis." };
    }
    if (weightKg < ibwKg) {
      return {
        autoRecommendedMethod: "actual" as const,
        autoReason: "Underweight (TBW < IBW): Actual total body weight recommended.",
      };
    }
    if (weightKg > 1.2 * ibwKg) {
      return {
        autoRecommendedMethod: "adjbw" as const,
        autoReason: `Obese (BMI ${bmi} kg/m²; TBW > 120% IBW): Adjusted Body Weight recommended to prevent clearance overestimation.`,
      };
    }
    return {
      autoRecommendedMethod: "ibw" as const,
      autoReason: "Normal Weight: Ideal Body Weight (IBW) standard for Cockcroft-Gault estimation.",
    };
  }, [weightKg, ibwKg, bmi]);

  const resolvedMethod = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;

  const effectiveWeightUsed = useMemo(() => {
    if (resolvedMethod === "actual") return weightKg;
    if (resolvedMethod === "ibw") return ibwKg || weightKg;
    if (resolvedMethod === "adjbw") return adjBwKg || weightKg;
    return weightKg;
  }, [resolvedMethod, weightKg, ibwKg, adjBwKg]);

  const effectiveWeightLabel = useMemo(() => {
    if (resolvedMethod === "actual") return `Actual TBW (${weightKg} kg)`;
    if (resolvedMethod === "ibw") return `Ideal Body Weight (${ibwKg} kg)`;
    if (resolvedMethod === "adjbw") return `Adjusted Body Weight (${adjBwKg} kg)`;
    return `${effectiveWeightUsed} kg`;
  }, [resolvedMethod, weightKg, ibwKg, adjBwKg, effectiveWeightUsed]);

  const calculatedCrCl = useMemo(
    () => calculateCrCl(numAge, effectiveWeightUsed, scrMgDl, sex),
    [numAge, effectiveWeightUsed, scrMgDl, sex],
  );
  const calculatedEGFR = useMemo(
    () => calculateCKDEPI2021(numAge, scrMgDl, sex),
    [numAge, scrMgDl, sex],
  );
  const kdigoStage = useMemo(() => getKDIGOStage(calculatedEGFR), [calculatedEGFR]);

  const filteredDrugs = useMemo(
    () =>
      renalDrugsDatabase.filter((drug) => {
        const matchesCategory = selectedCategory === "All" || drug.category === selectedCategory;
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !searchLower ||
          drug.name.toLowerCase().includes(searchLower) ||
          (drug.brandName && drug.brandName.toLowerCase().includes(searchLower)) ||
          drug.indication.toLowerCase().includes(searchLower) ||
          drug.category.toLowerCase().includes(searchLower);
        return matchesCategory && matchesSearch;
      }),
    [searchTerm, selectedCategory],
  );

  const selectedDrug = useMemo(
    () => renalDrugsDatabase.find((d) => d.id === selectedDrugId) || renalDrugsDatabase[0],
    [selectedDrugId],
  );

  const currentRecommendation = useMemo(() => {
    if (!selectedDrug) return null;
    for (const tier of selectedDrug.adjustments) {
      if (calculatedCrCl >= tier.minCrCl && calculatedCrCl <= tier.maxCrCl) return tier;
    }
    return selectedDrug.adjustments[0];
  }, [selectedDrug, calculatedCrCl]);

  const loadScenario = (sc: PatientScenario) => {
    setAge(sc.age);
    setSex(sc.sex);
    setWeightInput(sc.weight);
    setWeightUnit(sc.weightUnit);
    setHeightInput(sc.height);
    setHeightUnit(sc.heightUnit);
    setScrInput(sc.scr);
    setScrUnit(sc.scrUnit);
  };

  const reset = () => {
    loadScenario(PATIENT_SCENARIOS[1]);
    setWeightMethod("auto");
    setSelectedDrugId("vancomycin");
    setSearchTerm("");
    setSelectedCategory("All");
  };

  // Chart note text is unchanged from the previous page.
  const copyChartNote = useCallback(() => {
    if (!selectedDrug || !currentRecommendation) return;
    const noteText = `=== CLINICAL RENAL DOSING CONSULTATION NOTE ===
PATIENT BIOMETRICS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Weight: ${weightKg} kg (TBW) | IBW: ${ibwKg} kg | AdjBW: ${adjBwKg} kg | BMI: ${bmi} kg/m²
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit})
- Cockcroft-Gault CrCl: ${calculatedCrCl} mL/min [Based on ${effectiveWeightLabel}]
- CKD-EPI (2021) eGFR: ${calculatedEGFR ?? "N/A"} mL/min/1.73m² (${kdigoStage?.stage ?? "N/A"})

MEDICATION: ${selectedDrug.name} (${selectedDrug.brandName ?? "Generic"})
- Category: ${selectedDrug.category}
- Usual Normal Dosing: ${selectedDrug.usualDose}

RENAL RECOMMENDATION:
- CrCl Range: ${currentRecommendation.crclRangeLabel}
- Recommended Dose: ${currentRecommendation.dose}
- Dosing Interval: ${currentRecommendation.interval}
- Clinical Notes: ${currentRecommendation.notes ?? "Standard administration"}
${selectedDrug.dialysisGuidance ? `- HD / CRRT Guidance: HD: ${selectedDrug.dialysisGuidance.hemodialysis ?? "N/A"} | CRRT: ${selectedDrug.dialysisGuidance.crrt ?? "N/A"}` : ""}

OFFICIAL REFERENCE:
- ${selectedDrug.source} (${selectedDrug.reference})
- Verified Review: ${selectedDrug.lastReviewed}

DISCLAIMER: Clinical decision support tool. Verify with official FDA package inserts and institutional guidelines before prescribing.`;
    try {
      navigator.clipboard.writeText(noteText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [
    selectedDrug, currentRecommendation, numAge, sex, weightKg, ibwKg, adjBwKg, bmi,
    scrMgDl, rawScr, scrUnit, calculatedCrCl, effectiveWeightLabel, calculatedEGFR, kdigoStage,
  ]);

  return (
    <CalculatorShell
      title="Renal Dosing Adjuster"
      subtitle="Pairs Cockcroft-Gault creatinine clearance and CKD-EPI 2021 eGFR with evidence-based dose tiers for 20 renally cleared medicines."
      icon={Activity}
      eyebrow="Clinical & Hospital Pharmacy"
      aside={
        <>
          <CalcAbout title="About renal dose adjustment">
            <p>
              Most renally cleared drugs are labelled against creatinine clearance bands, not eGFR.
              This tool calculates both, then reads the dose tier the patient&apos;s CrCl falls into
              for the selected medicine.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Checking whether a drug needs a renal dose reduction",
                "Comparing Cockcroft-Gault CrCl against CKD-EPI eGFR and KDIGO stage",
                "Looking up dialysis or CRRT guidance for a medicine",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Both equations assume a stable creatinine — neither is valid in acute kidney injury.",
                "Dose tiers come from FDA labelling and are a starting point, not a substitute for the current package insert.",
                "Creatinine reflects muscle mass, so a frail patient's clearance is easily overestimated.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <LabNotice tone="warning" title="Clinical decision support — verify before prescribing">
        Confirm every recommendation against the official FDA package insert and your institution&apos;s
        guidelines. This tool does not know the indication, the severity of infection, or the
        patient&apos;s other medicines.
      </LabNotice>

      <ResultCard
        label="Cockcroft-Gault CrCl"
        value={calculatedCrCl > 0 ? calculatedCrCl : null}
        unit="mL/min"
        interpretation={
          calculatedCrCl > 0
            ? `${effectiveWeightLabel} · CKD-EPI eGFR ${calculatedEGFR} (${kdigoStage.stage})`
            : undefined
        }
        tone={calculatedCrCl >= 60 ? "success" : calculatedCrCl >= 30 ? "warning" : "danger"}
        empty="Enter age, weight, height and a serum creatinine, all above 0."
      />

      {currentRecommendation && (
        <LabNotice
          tone={
            currentRecommendation.status === "contraindicated"
              ? "danger"
              : currentRecommendation.status === "caution"
                ? "warning"
                : "info"
          }
          title={`${selectedDrug.name} — ${currentRecommendation.crclRangeLabel}`}
        >
          <span className="block">
            <strong>Dose:</strong> {currentRecommendation.dose} · <strong>Interval:</strong>{" "}
            {currentRecommendation.interval}
          </span>
          {currentRecommendation.notes && <span className="mt-1 block">{currentRecommendation.notes}</span>}
        </LabNotice>
      )}

      {selectedDrug.criticalWarning && (
        <LabNotice tone="danger" title="Critical clinical warning">
          {selectedDrug.criticalWarning}
        </LabNotice>
      )}

      <CalcSection title="Patient biometrics" description="Cockcroft-Gault needs a stable serum creatinine.">
        <FieldGrid>
          <NumberField label="Age" value={age} onChange={setAge} unit="years" step="1" min={0} />
          <SelectField
            label="Biological sex"
            value={sex}
            onChange={(v) => setSex(v as "male" | "female")}
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
            hint={weightUnit === "lbs" ? `≈ ${weightKg} kg` : undefined}
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

        <div>
          <ResultRow label="IBW (Devine)" value={ibwKg} unit="kg" />
          <ResultRow label="AdjBW (40%)" value={adjBwKg} unit="kg" />
          <ResultRow label="BMI" value={bmi} unit="kg/m²" />
        </div>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-foreground/90">CrCl weight basis</p>
          <ModeSwitch<WeightMethod>
            value={weightMethod}
            onChange={setWeightMethod}
            label="Weight basis"
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
          <ResultRow label="Cockcroft-Gault CrCl" value={calculatedCrCl} unit="mL/min" badge="dosing standard" />
          <ResultRow
            label="CKD-EPI (2021, race-free) eGFR"
            value={calculatedEGFR}
            unit="mL/min/1.73 m²"
            badge={`Stage ${kdigoStage.stage}`}
            badgeTone={calculatedEGFR >= 60 ? "success" : calculatedEGFR >= 30 ? "warning" : "destructive"}
          />
          <ResultRow label="KDIGO category" value={kdigoStage.description} />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Patient scenario</span>
          {PATIENT_SCENARIOS.map((sc) => (
            <Button key={sc.label} type="button" variant="outline" size="sm" title={sc.desc} onClick={() => loadScenario(sc)}>
              {sc.label}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset defaults
          </Button>
        </div>
      </CalcSection>

      <CalcSection
        title="Renal pharmacopeia"
        description={`${filteredDrugs.length} of ${renalDrugsDatabase.length} medications shown.`}
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by drug, brand, indication or class"
              aria-label="Search medications"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                type="button"
                variant={selectedCategory === c ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          <SelectField
            label="Medication"
            value={selectedDrugId}
            onChange={setSelectedDrugId}
            options={
              filteredDrugs.length
                ? filteredDrugs.map((d) => ({
                    value: d.id,
                    label: `${d.name}${d.brandName ? ` (${d.brandName})` : ""} — ${d.category}`,
                  }))
                : [{ value: selectedDrugId, label: `${selectedDrug.name} (no match for this filter)` }]
            }
          />
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
          <p className="text-[13px] font-semibold text-foreground">
            {selectedDrug.name}
            {selectedDrug.brandName && (
              <span className="font-normal text-muted-foreground"> ({selectedDrug.brandName})</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{selectedDrug.category}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">
            <strong>Indication:</strong> {selectedDrug.indication}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">
            <strong>Usual dose:</strong> {selectedDrug.usualDose}
          </p>
          {selectedDrug.link && (
            <a
              href={selectedDrug.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              {selectedDrug.source} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CalcSection>

      {currentRecommendation && (
        <CalcSection
          title={`Active recommendation (patient CrCl ${calculatedCrCl} mL/min)`}
          description="The tier the patient's clearance falls into."
        >
          <div>
            <ResultRow
              label="CrCl range"
              value={currentRecommendation.crclRangeLabel}
              badge={currentRecommendation.status}
              badgeTone={
                currentRecommendation.status === "contraindicated"
                  ? "destructive"
                  : currentRecommendation.status === "caution"
                    ? "warning"
                    : "success"
              }
            />
            <ResultRow label="Adjusted dose" value={currentRecommendation.dose} />
            <ResultRow label="Dosing interval" value={currentRecommendation.interval} />
            {currentRecommendation.notes && <ResultRow label="Clinical notes" value={currentRecommendation.notes} />}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={copyChartNote}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy chart consultation"}
            </Button>
          </div>
        </CalcSection>
      )}

      <CalcSection title="All dose tiers" description={`Every band published for ${selectedDrug.name}.`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">CrCl range</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Dose</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Interval</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedDrug.adjustments.map((tier) => {
                const active = tier === currentRecommendation;
                return (
                  <tr
                    key={tier.crclRangeLabel}
                    className={`border-b border-border/60 last:border-b-0 ${active ? "bg-primary/5 font-medium" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      {tier.crclRangeLabel}
                      {active && <span className="ml-2 text-xs text-primary">← patient</span>}
                    </td>
                    <td className="py-2 pr-3">{tier.dose}</td>
                    <td className="py-2 pr-3">{tier.interval}</td>
                    <td className="py-2 text-xs capitalize text-muted-foreground">{tier.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedDrug.dialysisGuidance && (
          <div>
            {selectedDrug.dialysisGuidance.hemodialysis && (
              <ResultRow label="Haemodialysis" value={selectedDrug.dialysisGuidance.hemodialysis} />
            )}
            {selectedDrug.dialysisGuidance.crrt && (
              <ResultRow label="CRRT" value={selectedDrug.dialysisGuidance.crrt} />
            )}
            {selectedDrug.dialysisGuidance.peritoneal && (
              <ResultRow label="Peritoneal dialysis" value={selectedDrug.dialysisGuidance.peritoneal} />
            )}
          </div>
        )}

        {selectedDrug.clinicalPearls && selectedDrug.clinicalPearls.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[13px] font-semibold text-foreground/90">Clinical pearls</p>
            <ul className="space-y-1">
              {selectedDrug.clinicalPearls.map((pearl) => (
                <li key={pearl} className="flex gap-2 text-[13px] leading-relaxed text-foreground/90">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {pearl}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Source: {selectedDrug.source} ({selectedDrug.reference}) · last reviewed{" "}
          {selectedDrug.lastReviewed}.
        </p>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>Creatinine clearance for dosing uses Cockcroft-Gault:</p>
        <Formula>CrCl = ((140 − age) × weight kg) / (72 × SCr mg/dL) × 0.85 if female</Formula>
        <p>
          The weight is chosen by a heuristic: actual body weight if the patient is below IBW,
          adjusted body weight (IBW + 0.4 × excess) above 120% of IBW, otherwise Devine IBW
          (50 kg male / 45.5 kg female, + 2.3 kg per inch over 5 feet).
        </p>
        <p>Kidney function for staging uses CKD-EPI 2021, which no longer includes a race term:</p>
        <Formula>eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.209 × 0.9938^age × 1.012 if female</Formula>
        <p>
          κ is 0.7 for women and 0.9 for men; α is −0.241 and −0.302 respectively. KDIGO stages are
          G1 ≥ 90, G2 60–89, G3a 45–59, G3b 30–44, G4 15–29 and G5 below 15 mL/min/1.73 m².
        </p>
        <p>
          The dose tier is then matched on <strong>CrCl</strong>, not eGFR, because that is what FDA
          labelling uses.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why does the tool dose on CrCl but stage on eGFR?",
            a: "Because they answer different questions. Almost all renal dosing bands in FDA labelling were derived with Cockcroft-Gault, which uses actual body weight and is not normalised to body surface area. CKD-EPI eGFR is normalised to 1.73 m² and is the standard for staging chronic kidney disease, so it is shown alongside for context.",
          },
          {
            q: "Which weight should Cockcroft-Gault use?",
            a: "IBW in normal-weight patients, actual weight if the patient is below their IBW, and adjusted body weight once actual weight exceeds 120% of IBW. Using actual weight in obesity substantially overestimates clearance and can lead to overdosing. The Auto setting applies this and states its reasoning.",
          },
          {
            q: "Can I use this in acute kidney injury?",
            a: "No. Both equations assume creatinine is at steady state. In rapidly changing renal function the serum creatinine lags behind the true clearance, so the calculated value will be too high while the patient is deteriorating and too low while they recover.",
          },
          {
            q: "Why are the eGFR and CrCl values so different for my patient?",
            a: "They use different inputs. Cockcroft-Gault is weight-driven, so a heavy patient gets a higher CrCl and a light or sarcopenic one a lower one; CKD-EPI ignores weight entirely and normalises to body surface area. Large divergence is expected at the extremes of body size — which is exactly where prescribing needs most care.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
