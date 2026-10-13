"use client";

import { useCallback, useMemo, useState } from "react";
import { Pill, Plus, Trash2, Check, Copy } from "lucide-react";
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
  LabNotice,
  type ResultTone,
} from "@/components/calculators";
import {
  calculateMme,
  OPIOID_REGISTRY,
  FACTOR_DISCREPANCIES,
  type OpioidDrugId,
  type RegimenItem,
} from "./_mme";

interface PatientPreset {
  label: string;
  tag: string;
  items: Array<{ drugId: OpioidDrugId; dosePerAdmin: number; frequencyTimesPerDay: number }>;
  targetDrug: OpioidDrugId;
  crossToleranceReduction: number;
  concomitantBenzo: boolean;
}

const SAMPLE_PATIENTS: PatientPreset[] = [
  {
    label: "Moderate Chronic Pain",
    tag: "Oxycodone 20mg BID + PRN",
    items: [
      { drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 },
      { drugId: "oxycodone_po", dosePerAdmin: 5, frequencyTimesPerDay: 2 },
    ],
    targetDrug: "morphine_po",
    crossToleranceReduction: 30,
    concomitantBenzo: false,
  },
  {
    label: "IV to Oral Rotation",
    tag: "IV Dilaudid 1mg q4h → Oral",
    items: [{ drugId: "hydromorphone_iv", dosePerAdmin: 1.0, frequencyTimesPerDay: 6 }],
    targetDrug: "oxycodone_po",
    crossToleranceReduction: 35,
    concomitantBenzo: false,
  },
  {
    label: "High-Dose Cancer Pain",
    tag: "Fentanyl 50mcg/hr + Dilaudid",
    items: [
      { drugId: "fentanyl_patch", dosePerAdmin: 50, frequencyTimesPerDay: 1 },
      { drugId: "hydromorphone_po", dosePerAdmin: 4, frequencyTimesPerDay: 3 },
    ],
    targetDrug: "morphine_po",
    crossToleranceReduction: 25,
    concomitantBenzo: false,
  },
  {
    label: "Frail Senior on Sedatives",
    tag: "Hydrocodone + Diazepam (high risk)",
    items: [{ drugId: "hydrocodone_po", dosePerAdmin: 10, frequencyTimesPerDay: 4 }],
    targetDrug: "morphine_po",
    crossToleranceReduction: 50,
    concomitantBenzo: true,
  },
  {
    label: "Mild Post-Op Outpatient",
    tag: "Codeine 30mg q6h PRN",
    items: [{ drugId: "codeine_po", dosePerAdmin: 30, frequencyTimesPerDay: 3 }],
    targetDrug: "tramadol_po",
    crossToleranceReduction: 25,
    concomitantBenzo: false,
  },
];

const DRUG_OPTIONS = (Object.keys(OPIOID_REGISTRY) as OpioidDrugId[]).map((k) => ({
  value: k,
  label: OPIOID_REGISTRY[k].name,
}));

const ITEM_FREQUENCY_OPTIONS = [
  { value: "1", label: "1x daily (q24h / patch)" },
  { value: "2", label: "2x daily (q12h / BID)" },
  { value: "3", label: "3x daily (q8h / TID)" },
  { value: "4", label: "4x daily (q6h / QID)" },
  { value: "6", label: "6x daily (q4h PRN)" },
];

const TARGET_FREQUENCY_OPTIONS = [
  { value: "1", label: "Once daily (q24h / ER)" },
  { value: "2", label: "Twice daily (q12h / BID — standard)" },
  { value: "3", label: "Three times daily (q8h / TID)" },
  { value: "4", label: "Four times daily (q6h / QID)" },
  { value: "6", label: "Every 4 hours (q4h / acute)" },
];

const REDUCTION_OPTIONS = [
  { value: "0", label: "0% (no reduction — danger)" },
  { value: "25", label: "25% (clinical standard)" },
  { value: "30", label: "30% (clinical standard)" },
  { value: "35", label: "35% (clinical standard)" },
  { value: "50", label: "50% (frail / elderly / severe pain)" },
];

function riskTone(tier: string): ResultTone {
  if (tier.startsWith("Extreme") || tier.startsWith("High")) return "danger";
  if (tier.startsWith("Moderate") || tier.startsWith("Elevated")) return "warning";
  return "success";
}

export default function OpioidMMECalculator() {
  const [regimen, setRegimen] = useState<RegimenItem[]>([
    { id: "1", drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 },
    { id: "2", drugId: "oxycodone_po", dosePerAdmin: 5, frequencyTimesPerDay: 2 },
  ]);
  const [targetDrugId, setTargetDrugId] = useState<OpioidDrugId>("morphine_po");
  const [crossToleranceReduction, setCrossToleranceReduction] = useState(30);
  const [targetFrequency, setTargetFrequency] = useState(2);
  const [concomitantBenzo, setConcomitantBenzo] = useState(false);
  const [hasSleepApneaOrCopd, setHasSleepApneaOrCopd] = useState(false);
  const [hasRenalOrHepaticImpairment, setHasRenalOrHepaticImpairment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nextId, setNextId] = useState(3);

  const calculations = useMemo(
    () =>
      calculateMme(
        regimen,
        targetDrugId,
        crossToleranceReduction,
        targetFrequency,
        concomitantBenzo,
        hasSleepApneaOrCopd,
      ),
    [regimen, targetDrugId, crossToleranceReduction, targetFrequency, concomitantBenzo, hasSleepApneaOrCopd],
  );

  const addRegimenItem = () => {
    setRegimen([...regimen, { id: String(nextId), drugId: "morphine_po", dosePerAdmin: 0, frequencyTimesPerDay: 1 }]);
    setNextId(nextId + 1);
  };
  const removeRegimenItem = (id: string) => {
    if (regimen.length <= 1) return;
    setRegimen(regimen.filter((r) => r.id !== id));
  };
  const updateRegimenItem = (id: string, updates: Partial<RegimenItem>) =>
    setRegimen(regimen.map((r) => (r.id === id ? { ...r, ...updates } : r)));

  const loadPreset = (p: PatientPreset) => {
    setRegimen(p.items.map((item, idx) => ({ id: String(idx + 1), ...item })));
    setNextId(p.items.length + 1);
    setTargetDrugId(p.targetDrug);
    setCrossToleranceReduction(p.crossToleranceReduction);
    setConcomitantBenzo(p.concomitantBenzo);
  };

  const reset = () => {
    setRegimen([
      { id: "1", drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 },
      { id: "2", drugId: "oxycodone_po", dosePerAdmin: 5, frequencyTimesPerDay: 2 },
    ]);
    setTargetDrugId("morphine_po");
    setCrossToleranceReduction(30);
    setTargetFrequency(2);
    setConcomitantBenzo(false);
    setHasSleepApneaOrCopd(false);
    setHasRenalOrHepaticImpairment(false);
    setNextId(3);
  };

  // Consult note text is unchanged from the previous page.
  const copyConsultNote = useCallback(() => {
    const linesSummary = calculations.lineCalculations
      .map(
        (l) =>
          `  - ${l.config.name}: ${l.dosePerAdmin} ${l.config.unit} x ${l.frequencyTimesPerDay} times/day (${l.dailyQuantity} ${l.config.unit}/day) = ${l.itemDailyMme} MME/day`,
      )
      .join("\n");

    const note = `=== CLINICAL OPIOID CONVERSION & MME CONSULT NOTE ===
CURRENT REGIMEN BREAKDOWN:
${linesSummary}
TOTAL BASELINE MME: ${calculations.totalDailyMme} MME/day

CDC RISK STRATIFICATION:
- Risk Tier: ${calculations.riskTier}
- Naloxone (Narcan) Status: ${calculations.naloxoneMandated ? "MANDATORY CO-PRESCRIPTION INDICATED" : "Standard clinical discretion"}
- High-Risk Co-prescriptions: ${concomitantBenzo ? "YES (Concurrent Benzodiazepine/Sedative - FDA Boxed Warning)" : "None noted"}
- Organ Impairment: ${hasRenalOrHepaticImpairment ? "Renal/Hepatic impairment present (use caution, extend intervals)" : "None"}

ROTATED TARGET OPIOID REGIMEN:
- Target Drug: ${calculations.targetConfig.name} (${calculations.targetConfig.brand})
- Incomplete Cross-Tolerance Reduction Applied: ${crossToleranceReduction}% Safety Reduction
- 100% Equianalgesic 24h Dose: ${calculations.unadjusted24hTargetDose} ${calculations.targetConfig.unit}/day
- RECOMMENDED INITIAL 24h DOSE: ${calculations.safe24hTargetDose} ${calculations.targetConfig.unit}/day
- Dosing Schedule: ${calculations.safeDosePerAdmin} ${calculations.targetConfig.unit} administered ${targetFrequency} times daily (e.g. q${Math.round(24 / targetFrequency)}h)
- Breakthrough Pain (PRN) Rescue Dose: ${calculations.breakthroughDoseMin}–${calculations.breakthroughDoseMax} ${calculations.targetConfig.unit} orally q3–4h PRN (10–15% of total daily dose)

SAFETY DIRECTIVES:
${calculations.riskDirectives}
Guideline Standard: CDC 2022 Clinical Practice Guideline for Prescribing Opioids & NCCN Guidelines.
Generated: ${new Date().toLocaleString()}`;

    try {
      navigator.clipboard.writeText(note);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [calculations, crossToleranceReduction, targetFrequency, concomitantBenzo, hasRenalOrHepaticImpairment]);

  // Factors in the current regimen (or target) that differ from CDC 2022.
  const activeDiscrepancies = useMemo(() => {
    // Array.from, not a spread: this tsconfig has no downlevelIteration.
    const ids = Array.from(new Set<OpioidDrugId>([...regimen.map((r) => r.drugId), targetDrugId]));
    return ids
      .filter((id) => FACTOR_DISCREPANCIES[id])
      .map((id) => ({ id, name: OPIOID_REGISTRY[id].name, ...FACTOR_DISCREPANCIES[id]! }));
  }, [regimen, targetDrugId]);

  const patchRateSplit = targetDrugId === "fentanyl_patch" && targetFrequency > 1;

  return (
    <CalculatorShell
      title="Opioid MME & Equianalgesic Converter"
      subtitle="Totals a multi-drug regimen as daily morphine milligram equivalents, stratifies overdose risk against CDC thresholds, and works out a rotated dose with a cross-tolerance reduction."
      icon={Pill}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About MME">
            <p>
              Morphine milligram equivalents put every opioid in a regimen on one scale, so a total
              daily exposure can be compared against guideline thresholds. Rotation then runs that
              total back out to the new drug — and reduces it, because tolerance to one opioid does
              not transfer completely to another.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Adding up a regimen of scheduled plus breakthrough opioids",
                "Checking a total against the CDC 50 and 90 MME/day thresholds",
                "Working through an opioid rotation with a cross-tolerance reduction",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Two conversion factors on this page differ from the CDC 2022 table — see the note beside the result.",
                "Methadone and buprenorphine are not simple linear conversions and are not offered here.",
                "MME thresholds guide review and caution; they are not dose limits and must not override clinical judgement.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <LabNotice tone="warning" title="Educational tool — verify against your own protocol">
        Conversion ratios vary between references and between patients. Every opioid rotation must be
        checked against a current institutional protocol and an independent calculation before it
        reaches a patient.
      </LabNotice>

      <ResultCard
        label="Total daily morphine equivalent"
        value={calculations.totalDailyMme}
        unit="MME/day"
        interpretation={calculations.riskTier}
        tone={riskTone(calculations.riskTier)}
        empty="Enter at least one opioid in the regimen below."
      />

      <LabNotice
        tone={calculations.naloxoneMandated ? "danger" : "info"}
        title={calculations.naloxoneMandated ? "Naloxone co-prescription indicated" : "Clinical safety advisory"}
      >
        {calculations.riskDirectives}
      </LabNotice>

      {activeDiscrepancies.length > 0 && (
        // Reported, not corrected — the maths is unchanged from the original page.
        <LabNotice tone="warning" title="Conversion factors that differ from CDC 2022">
          {activeDiscrepancies.map((d) => (
            <span key={d.id} className="block">
              <strong>{d.name}</strong> uses ×{d.used} here; the CDC 2022 conversion table gives ×
              {d.cdc}. The MME above is therefore {(d.cdc / d.used).toFixed(1)}× lower than the CDC
              figure for that drug.
            </span>
          ))}
        </LabNotice>
      )}

      {patchRateSplit && (
        <LabNotice tone="danger" title="Patch rate is being divided by the dosing frequency">
          A transdermal patch delivers a constant rate, so its mcg/hr figure must not be split into
          doses. With &ldquo;{TARGET_FREQUENCY_OPTIONS.find((o) => o.value === String(targetFrequency))?.label}&rdquo;
          selected, the per-administration figure below is the 24-hour rate divided by {targetFrequency}.
          Select &ldquo;Once daily&rdquo; to read the correct patch rate.
        </LabNotice>
      )}

      <CalcSection
        title="Current regimen"
        description="Every scheduled and breakthrough opioid the patient is taking. A patch is entered as its mcg/hr rate."
      >
        <div className="space-y-4">
          {regimen.map((item, index) => {
            const config = OPIOID_REGISTRY[item.drugId];
            const line = calculations.lineCalculations[index];
            const isPatch = item.drugId === "fentanyl_patch";
            return (
              <div key={item.id} className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
                <FieldGrid>
                  <SelectField
                    label="Opioid"
                    value={item.drugId}
                    onChange={(v) => updateRegimenItem(item.id, { drugId: v as OpioidDrugId })}
                    options={DRUG_OPTIONS}
                  />
                  <NumberField
                    label="Dose per administration"
                    value={String(item.dosePerAdmin)}
                    onChange={(v) => updateRegimenItem(item.id, { dosePerAdmin: parseFloat(v) || 0 })}
                    unit={config.unit}
                    step="0.1"
                    min={0}
                    hint={isPatch ? "Patch delivery rate in mcg/hr." : `In ${config.unit}.`}
                  />
                  <SelectField
                    label="Frequency"
                    value={String(item.frequencyTimesPerDay)}
                    onChange={(v) => updateRegimenItem(item.id, { frequencyTimesPerDay: parseInt(v, 10) || 1 })}
                    options={ITEM_FREQUENCY_OPTIONS}
                    disabled={isPatch}
                    hint={isPatch ? "Not used — a patch is a continuous rate." : undefined}
                  />
                </FieldGrid>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                  <p className="text-xs text-muted-foreground">
                    {line?.dailyQuantity} {config.unit}/day × {config.multiplierToOralMorphine} ={" "}
                    <span className="font-semibold text-foreground">{line?.itemDailyMme} MME/day</span>
                  </p>
                  {regimen.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRegimenItem(item.id)}
                      aria-label={`Remove ${config.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={addRegimenItem}>
            <Plus className="mr-1.5 h-4 w-4" /> Add opioid
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      <CalcSection title="Clinical archetypes" description="One-click regimens for working through the method.">
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PATIENTS.map((p) => (
            <Button key={p.label} type="button" variant="outline" size="sm" title={p.tag} onClick={() => loadPreset(p)}>
              {p.label}
            </Button>
          ))}
        </div>
      </CalcSection>

      <CalcSection title="Rotation target" description="The opioid being rotated to, and the safety reduction applied.">
        <FieldGrid>
          <SelectField
            label="Target opioid"
            value={targetDrugId}
            onChange={(v) => setTargetDrugId(v as OpioidDrugId)}
            options={DRUG_OPTIONS}
          />
          <SelectField
            label="Dosing schedule"
            value={String(targetFrequency)}
            onChange={(v) => setTargetFrequency(parseInt(v, 10) || 1)}
            options={TARGET_FREQUENCY_OPTIONS}
          />
          <SelectField
            label="Incomplete cross-tolerance reduction"
            value={String(crossToleranceReduction)}
            onChange={(v) => setCrossToleranceReduction(parseInt(v, 10) || 0)}
            options={REDUCTION_OPTIONS}
            hint="25%–50% is standard practice."
          />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Patient risk modifiers" description="These change the risk tier and the naloxone recommendation.">
        <div className="space-y-2.5">
          {[
            {
              checked: concomitantBenzo,
              set: setConcomitantBenzo,
              label: "Concomitant benzodiazepines / CNS depressants (FDA boxed warning)",
            },
            {
              checked: hasSleepApneaOrCopd,
              set: setHasSleepApneaOrCopd,
              label: "Sleep apnoea / chronic COPD / respiratory disease",
            },
            {
              checked: hasRenalOrHepaticImpairment,
              set: setHasRenalOrHepaticImpairment,
              label: "Renal failure (CrCl < 30) or hepatic cirrhosis",
            },
          ].map((row) => (
            <label key={row.label} className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={row.checked}
                onChange={(e) => row.set(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <span className="leading-relaxed text-foreground/90">{row.label}</span>
            </label>
          ))}
        </div>
      </CalcSection>

      <CalcSection title="Rotated target prescription" description={`${crossToleranceReduction}% safety reduction applied.`}>
        <div>
          <ResultRow label="Target opioid" value={`${calculations.targetConfig.name} (${calculations.targetConfig.brand})`} />
          <ResultRow
            label="100% equianalgesic 24h dose"
            value={calculations.unadjusted24hTargetDose}
            unit={`${calculations.targetConfig.unit}/day`}
          />
          <ResultRow
            label="Recommended initial 24h dose"
            value={calculations.safe24hTargetDose}
            unit={`${calculations.targetConfig.unit}/day`}
            badge={`−${crossToleranceReduction}%`}
            badgeTone="success"
          />
          <ResultRow
            label={`Per administration (${targetFrequency}× daily, q${Math.round(24 / targetFrequency)}h)`}
            value={calculations.safeDosePerAdmin}
            unit={calculations.targetConfig.unit}
            badge={patchRateSplit ? "check — patch" : undefined}
            badgeTone="destructive"
          />
          <ResultRow
            label="Breakthrough (PRN) rescue dose, 10–15%"
            value={`${calculations.breakthroughDoseMin} – ${calculations.breakthroughDoseMax}`}
            unit={`${calculations.targetConfig.unit} q3–4h PRN`}
          />
          <ResultRow
            label="Naloxone co-prescription"
            value={calculations.naloxoneMandated ? "Indicated" : "Clinical discretion"}
            badge={calculations.naloxoneMandated ? "mandatory" : undefined}
            badgeTone="destructive"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={copyConsultNote}>
            {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
            {copied ? "Copied" : "Copy consult note"}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Do not exceed 3–4 breakthrough doses per 24 hours without reassessing the scheduled dose.
        </p>
      </CalcSection>

      <CalcSection title="Conversion factors used" description="Multipliers to oral morphine equivalent, as implemented on this page.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Opioid</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Unit</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">× to oral morphine</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Note</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(OPIOID_REGISTRY) as OpioidDrugId[]).map((k) => {
                const c = OPIOID_REGISTRY[k];
                const d = FACTOR_DISCREPANCIES[k];
                return (
                  <tr key={k} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3">{c.name}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{c.unit}</td>
                    <td className="py-2 pr-3 tabular-nums">× {c.multiplierToOralMorphine}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {d ? `CDC 2022 gives ×${d.cdc}` : c.brand}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>Each line of the regimen becomes a daily MME, and the lines are summed:</p>
        <Formula>line MME/day = dose × doses per day × factor to oral morphine</Formula>
        <p>
          A transdermal patch is the exception: its mcg/hr rate is taken as the daily quantity
          directly, because delivery is continuous.
        </p>
        <p>Rotation runs the total back out through the target drug&apos;s factor, then reduces it:</p>
        <Formula>24h target dose = total MME / target factor × (100 − reduction) / 100</Formula>
        <p>
          The per-administration dose divides that by the chosen frequency, and the breakthrough dose
          is 10–15% of the daily total. CDC tiers are read off the total: under 50 MME/day low, 50–89
          moderate, 90 and above high, 200 and above extreme. Every figure is rounded to one decimal.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why reduce the dose after converting?",
            a: "Tolerance to one opioid transfers only partly to another, so an exactly equianalgesic dose of the new drug can be effectively an overdose. Standard practice reduces the calculated dose by 25–50%, and more in frail or elderly patients, then titrates upward with breakthrough cover.",
          },
          {
            q: "Which factors here disagree with CDC 2022?",
            a: "Tramadol is ×0.1 on this page against the CDC's ×0.2, and oral hydromorphone is ×4 against ×5. Both understate the MME. They are left as the original tool had them so the migration changes no numbers, and the page flags them whenever either drug is in use.",
          },
          {
            q: "Why can't I convert methadone or buprenorphine?",
            a: "Neither has a fixed ratio. Methadone's conversion factor rises with the dose being switched from and it accumulates over days; buprenorphine is a partial agonist with high receptor affinity. Both need specialist protocols rather than a single multiplier.",
          },
          {
            q: "Does 90 MME/day mean the dose is unsafe?",
            a: "No. The CDC thresholds are prompts to review, not limits. Above 50 MME/day the guidance is to weigh benefit against harm and offer naloxone; at 90 and above to justify carefully and consider tapering. Patients with active cancer or in palliative care are explicitly outside that framing.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
