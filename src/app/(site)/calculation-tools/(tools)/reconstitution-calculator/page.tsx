"use client";

import { useCallback, useMemo, useState } from "react";
import { Syringe, Check, Copy, ExternalLink } from "lucide-react";
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
  RECONSTITUTION_DATABASE,
  calculateReconstitution,
  type CalcMode,
} from "./_recon";

type ActiveModule = "vial" | "bag";

const CARRIER_OPTIONS = [
  { value: "50", label: "50 mL (small volume IVPB)" },
  { value: "100", label: "100 mL (standard IVPB bag)" },
  { value: "250", label: "250 mL (vancomycin / diluted)" },
  { value: "500", label: "500 mL (moderate volume)" },
  { value: "1000", label: "1000 mL (1 litre continuous)" },
];

export default function ReconstitutionCalculator() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("vial");
  const [selectedPresetId, setSelectedPresetId] = useState("ceftriaxone-1g-iv");
  const [calcMode, setCalcMode] = useState<CalcMode>("doseToVol");

  const [vialStrength, setVialStrength] = useState("1000");
  const [vialStrengthUnit, setVialStrengthUnit] = useState<"mg" | "g">("mg");
  const [displacementVol, setDisplacementVol] = useState("0.4");
  const [diluentAdded, setDiluentAdded] = useState("9.6");
  const [targetConc, setTargetConc] = useState("100");
  const [prescribedDose, setPrescribedDose] = useState("750");
  const [prescribedDoseUnit, setPrescribedDoseUnit] = useState<"mg" | "g">("mg");
  const [withdrawalVol, setWithdrawalVol] = useState("7.5");

  const [carrierBagVol, setCarrierBagVol] = useState("100");
  const [infusionDurationMin, setInfusionDurationMin] = useState("30");

  const [copied, setCopied] = useState(false);

  const activePreset = useMemo(
    () => RECONSTITUTION_DATABASE.find((p) => p.id === selectedPresetId) ?? null,
    [selectedPresetId],
  );

  const calc = useMemo(
    () =>
      calculateReconstitution({
        vialStrength, vialStrengthUnit, displacementVol, diluentAdded, targetConc,
        prescribedDose, prescribedDoseUnit, withdrawalVol, calcMode,
        carrierBagVol, infusionDurationMin,
      }),
    [
      vialStrength, vialStrengthUnit, displacementVol, diluentAdded, targetConc,
      prescribedDose, prescribedDoseUnit, withdrawalVol, calcMode,
      carrierBagVol, infusionDurationMin,
    ],
  );

  const selectPreset = (id: string) => {
    setSelectedPresetId(id);
    // "custom" keeps whatever is already typed in, as the original page did.
    if (id === "custom") return;

    const p = RECONSTITUTION_DATABASE.find((x) => x.id === id);
    if (!p) return;
    setVialStrength(String(p.vialStrengthMg));
    setVialStrengthUnit("mg");
    setDisplacementVol(String(p.displacementVolMl));
    setDiluentAdded(String(p.standardDiluentVolMl));
    setTargetConc(String(p.resultingConcMgMl));

    // A 1 g vial defaults to a 750 mg partial dose; anything else to the whole vial.
    const defaultDose = p.vialStrengthMg === 1000 ? 750 : p.vialStrengthMg;
    setPrescribedDose(String(defaultDose));
    setPrescribedDoseUnit("mg");
  };

  const reset = () => {
    selectPreset("ceftriaxone-1g-iv");
    setCalcMode("doseToVol");
    setPrescribedDose("750");
    setPrescribedDoseUnit("mg");
    setWithdrawalVol("7.5");
    setCarrierBagVol("100");
    setInfusionDurationMin("30");
  };

  // Compounding record text is unchanged from the previous page.
  const copyLog = useCallback(() => {
    const drugLabel = activePreset ? `${activePreset.drugName} (${activePreset.brandName})` : "Parenteral Drug";
    const text = `=== STERILE COMPOUNDING & RECONSTITUTION RECORD ===
DRUG: ${drugLabel}
- Vial Strength: ${calc.totalVialMg} mg
- Powder Displacement: ${calc.powderDisplacement.toFixed(2)} mL
- Diluent to Add: ${calc.diluentVolume.toFixed(2)} mL
- Total Reconstituted Yield: ${calc.finalReconstitutedVol.toFixed(2)} mL
- Yield Concentration: ${calc.finalConcMgMl.toFixed(2)} mg/mL

DOSE PREPARATION:
- Target Ordered Dose: ${calc.calculatedDeliveredDoseMg.toFixed(1)} mg
- Volume to Withdraw: ${calc.calculatedWithdrawalVol.toFixed(2)} mL (${calc.vialFractionUsed.toFixed(1)}% of vial)

SECONDARY IV BAG DILUTION (IF APPLICABLE):
- Carrier Solution: ${carrierBagVol} mL (0.9% NS / D5W)
- Total IVPB Volume: ${calc.totalBagVolume.toFixed(1)} mL
- Infusion Concentration: ${calc.finalBagConc.toFixed(2)} mg/mL
- Infusion Duration: ${infusionDurationMin} min
- Smart Pump Rate: ${calc.infusionRateMlHr.toFixed(1)} mL/hr (${calc.doseDeliveryRateMgMin.toFixed(1)} mg/min)

STABILITY & STORAGE:
- Room Temp: ${activePreset?.stability.roomTemp || "Standard aseptic protocol"}
- Refrigerated: ${activePreset?.stability.refrigerated || "Standard aseptic protocol"}
- Clinical Notes: ${activePreset?.clinicalNotes || "Standard sterile technique"}
Generated: ${new Date().toLocaleString()}
===================================================`.trim();
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard permission (insecure context, old WebView).
    }
  }, [calc, activePreset, carrierBagVol, infusionDurationMin]);

  const overdraw = calc.isValid && calc.vialFractionUsed > 100;

  return (
    <CalculatorShell
      title="Reconstitution & IV Compounding Calculator"
      subtitle="Works out diluent volume, yield concentration and the syringe volume for a parenteral vial, then the carrier bag dilution and smart-pump rate."
      icon={Syringe}
      eyebrow="Clinical & Hospital Pharmacy"
      aside={
        <>
          <CalcAbout title="About reconstitution">
            <p>
              A lyophilised vial occupies volume of its own, so the diluent added is not the final
              volume. Ignoring that powder displacement makes the yield concentration wrong, and with
              it every dose drawn from the vial.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Reconstituting a powder vial to a stated concentration",
                "Drawing a partial dose from a reconstituted vial",
                "Programming an IV piggyback rate on a smart pump",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Displacement values vary between manufacturers — check the package insert for the product in hand.",
                "Stability data here is a teaching reference, not a substitute for the current label.",
                "Compounding must follow USP <797> aseptic technique inside an ISO Class 5 environment.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <LabNotice tone="warning" title="Educational tool — verify against the package insert">
        Vial displacement volumes, stability windows and diluent compatibility differ between
        manufacturers and products. Always confirm against the current label before compounding.
      </LabNotice>

      {calcMode === "volToDose" ? (
        <ResultCard
          label="Delivered patient dose"
          value={calc.isValid ? calc.calculatedDeliveredDoseMg.toFixed(1) : null}
          unit="mg"
          interpretation={
            calc.isValid
              ? `${calc.calculatedWithdrawalVol.toFixed(2)} mL @ ${calc.finalConcMgMl.toFixed(1)} mg/mL`
              : undefined
          }
          tone={overdraw ? "danger" : "neutral"}
          empty="Enter a vial strength and a diluent volume."
        />
      ) : (
        <ResultCard
          label="Syringe volume to withdraw"
          value={calc.isValid ? calc.calculatedWithdrawalVol.toFixed(2) : null}
          unit="mL"
          interpretation={
            calc.isValid
              ? `Yields ${calc.calculatedDeliveredDoseMg.toFixed(1)} mg (${calc.vialFractionUsed.toFixed(1)}% of vial)`
              : undefined
          }
          tone={overdraw ? "danger" : "neutral"}
          empty="Enter a vial strength and a diluent volume."
        />
      )}

      {overdraw && (
        <LabNotice tone="danger" title="Dose exceeds a single vial">
          The volume needed is {calc.vialFractionUsed.toFixed(1)}% of the reconstituted vial — more
          than one vial is required for this dose.
        </LabNotice>
      )}

      <CalcSection title="Module">
        <ModeSwitch<ActiveModule>
          label="Compounding stage"
          value={activeModule}
          onChange={setActiveModule}
          options={[
            { value: "vial", label: "1 · Vial reconstitution", description: "Diluent, yield, syringe" },
            { value: "bag", label: "2 · IV bag & pump rate", description: "Carrier, rate, final conc" },
          ]}
        />
      </CalcSection>

      <CalcSection title="Drug" description="Pick a monograph to load its vial strength, displacement and standard diluent.">
        <SelectField
          label="Parenteral drug"
          value={selectedPresetId}
          onChange={selectPreset}
          options={[
            ...RECONSTITUTION_DATABASE.map((p) => ({
              value: p.id,
              label: `${p.drugName} — ${p.vialLabel} (${p.route})`,
            })),
            { value: "custom", label: "Custom drug — manual entry (any vial)" },
          ]}
        />
        {activePreset && (
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
            <p className="text-[13px] font-semibold text-foreground">
              {activePreset.drugName}{" "}
              <span className="font-normal text-muted-foreground">({activePreset.brandName})</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Diluents: {activePreset.recommendedDiluents.join(", ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Stability — room temp: {activePreset.stability.roomTemp} · refrigerated:{" "}
              {activePreset.stability.refrigerated}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">
              {activePreset.clinicalNotes}
            </p>
            {activePreset.fdaLink && (
              <a
                href={activePreset.fdaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                DailyMed monograph <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </CalcSection>

      {activeModule === "vial" ? (
        <>
          <CalcSection title="Calculation mode">
            <ModeSwitch<CalcMode>
              label="What to solve for"
              value={calcMode}
              onChange={setCalcMode}
              options={[
                { value: "doseToVol", label: "Dose → volume", description: "Syringe volume for a dose" },
                { value: "volToDose", label: "Volume → dose", description: "Dose in a measured volume" },
                { value: "targetConc", label: "Target conc → diluent", description: "Diluent for a concentration" },
              ]}
            />
          </CalcSection>

          <CalcSection title="Vial & diluent" description="Powder displacement is what makes the yield volume exceed the diluent added.">
            <FieldGrid>
              <NumberField
                label="Total drug in vial"
                value={vialStrength}
                onChange={setVialStrength}
                units={["mg", "g"]}
                unit={vialStrengthUnit}
                onUnitChange={(v) => setVialStrengthUnit(v as "mg" | "g")}
                step="1"
                min={0}
                hint="Labelled active drug per vial."
              />
              <NumberField
                label="Powder displacement volume"
                value={displacementVol}
                onChange={setDisplacementVol}
                unit="mL"
                step="0.01"
                min={0}
                hint="Volume the dry powder itself occupies (USP <797>)."
              />
              {calcMode === "targetConc" ? (
                <NumberField
                  label="Target concentration"
                  value={targetConc}
                  onChange={setTargetConc}
                  unit="mg/mL"
                  step="0.1"
                  min={0}
                  hint={`Needs ${calc.diluentVolume.toFixed(2)} mL diluent.`}
                />
              ) : (
                <NumberField
                  label="Diluent volume to add"
                  value={diluentAdded}
                  onChange={setDiluentAdded}
                  unit="mL"
                  step="0.1"
                  min={0}
                  hint={`Yields ${calc.finalReconstitutedVol.toFixed(2)} mL total solution.`}
                />
              )}
              {calcMode === "volToDose" ? (
                <NumberField
                  label="Volume withdrawn in syringe"
                  value={withdrawalVol}
                  onChange={setWithdrawalVol}
                  unit="mL"
                  step="0.01"
                  min={0}
                  hint="Volume measured in the syringe."
                />
              ) : (
                <NumberField
                  label="Prescribed patient dose"
                  value={prescribedDose}
                  onChange={setPrescribedDose}
                  units={["mg", "g"]}
                  unit={prescribedDoseUnit}
                  onUnitChange={(v) => setPrescribedDoseUnit(v as "mg" | "g")}
                  step="1"
                  min={0}
                  hint="Ordered dose on the prescription."
                />
              )}
            </FieldGrid>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={reset}>
                Reset
              </Button>
            </div>
          </CalcSection>
        </>
      ) : (
        <CalcSection title="Secondary IV piggyback" description="Carrier dilution and pump programming for the withdrawn dose.">
          <FieldGrid>
            <SelectField
              label="IV carrier bag volume"
              value={carrierBagVol}
              onChange={setCarrierBagVol}
              options={CARRIER_OPTIONS}
              hint="Standard compatible 0.9% NS or D5W bag."
            />
            <NumberField
              label="Target infusion duration"
              value={infusionDurationMin}
              onChange={setInfusionDurationMin}
              unit="mins"
              step="5"
              min={0}
              hint={`≈ ${(parseFloat(infusionDurationMin) / 60 || 0).toFixed(2)} hours`}
            />
          </FieldGrid>

          <div>
            <ResultRow label="Total infusion volume" value={calc.totalBagVolume.toFixed(1)} unit="mL" badge="carrier + drug syringe" />
            <ResultRow label="Smart pump rate" value={calc.infusionRateMlHr.toFixed(1)} unit="mL/hr" />
            <ResultRow label="Final bag concentration" value={calc.finalBagConc.toFixed(2)} unit="mg/mL" />
            <ResultRow label="Dose delivery rate" value={calc.doseDeliveryRateMgMin.toFixed(1)} unit="mg/min" />
          </div>
        </CalcSection>
      )}

      {calc.isValid && (
        <CalcSection title="Compounding output" description="The full reconstitution record.">
          <div>
            <ResultRow label="Vial strength" value={calc.totalVialMg} unit="mg" />
            <ResultRow label="Diluent to add" value={calc.diluentVolume.toFixed(2)} unit="mL" />
            <ResultRow label="Powder displacement" value={`+${calc.powderDisplacement.toFixed(2)}`} unit="mL" />
            <ResultRow label="Total vial yield" value={calc.finalReconstitutedVol.toFixed(2)} unit="mL" />
            <ResultRow label="Vial concentration" value={calc.finalConcMgMl.toFixed(1)} unit="mg/mL" />
            <ResultRow label="Syringe volume to withdraw" value={calc.calculatedWithdrawalVol.toFixed(2)} unit="mL" />
            <ResultRow
              label="Delivered dose"
              value={calc.calculatedDeliveredDoseMg.toFixed(1)}
              unit="mg"
              badge={`${calc.vialFractionUsed.toFixed(1)}% of vial`}
              badgeTone={overdraw ? "destructive" : "secondary"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={copyLog}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? "Copied" : "Copy log"}
            </Button>
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>
          The powder itself takes up space, so the final volume is the diluent plus the displacement:
        </p>
        <Formula>final volume = diluent added + powder displacement</Formula>
        <Formula>concentration = total drug in vial / final volume</Formula>
        <p>From there the syringe volume follows directly, or the dose in a measured volume:</p>
        <Formula>volume to withdraw = dose / concentration</Formula>
        <Formula>delivered dose = volume withdrawn × concentration</Formula>
        <p>Working the other way, to hit a target concentration:</p>
        <Formula>diluent = (vial strength / target concentration) − displacement</Formula>
        <p>For the secondary bag, the drug volume adds to the carrier:</p>
        <Formula>total IVPB volume = carrier volume + syringe volume</Formula>
        <Formula>pump rate (mL/hr) = total volume / duration (min) × 60</Formula>
        <p>
          Doses are converted to milligrams before any division, and the vial fraction used is the
          syringe volume as a percentage of the total yield.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why does powder displacement matter?",
            a: "Because it changes the concentration. Adding 9.6 mL to a 1 g ceftriaxone vial with 0.4 mL displacement gives 10 mL at 100 mg/mL. Assuming 9.6 mL final volume would give 104 mg/mL, and every dose drawn from the vial would be about 4% short.",
          },
          {
            q: "Where do I find the displacement value?",
            a: "In the package insert, usually in the reconstitution table as the difference between the diluent volume and the stated yield. It is product- and manufacturer-specific, so the values preloaded here are typical rather than authoritative.",
          },
          {
            q: "Should the drug volume count toward the bag total?",
            a: "Yes, when the drug is added into the carrier bag — a 100 mL bag plus a 22.4 mL syringe infuses 122.4 mL, and programming the pump for 100 mL would leave part of the dose behind. Some institutions use a fixed overfill allowance instead; follow local policy.",
          },
          {
            q: "Can I use any diluent?",
            a: "No. Several of these drugs are incompatible with particular solutions — ceftriaxone must never meet a calcium-containing fluid such as Lactated Ringer's. Use only the diluents listed on the monograph for the product.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
