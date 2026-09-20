"use client";

import { useMemo, useState } from "react";
import { Droplets, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  TextField,
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
  calculateBlood,
  calculateGeneral,
  calculatePlasma,
  calculateSerum,
  calculateUrine,
  type BloodMethod,
  type CalculatorType,
  type SerumMethod,
  type Solute,
  type UrineMethod,
} from "./_osmolality";

const TYPE_OPTIONS = [
  { value: "general" as const, label: "General", description: "Any solute mixture" },
  { value: "serum" as const, label: "Serum", description: "Na, glucose, BUN" },
  { value: "urine" as const, label: "Urine", description: "Electrolytes or SG" },
  { value: "plasma" as const, label: "Plasma", description: "With protein term" },
  { value: "blood" as const, label: "Whole blood", description: "Haematocrit weighted" },
];

const COMMON_SOLUTES = [
  { name: "NaCl", concentration: 154, dissociation: 2 },
  { name: "KCl", concentration: 5, dissociation: 2 },
  { name: "CaCl₂", concentration: 2.5, dissociation: 3 },
  { name: "Glucose", concentration: 5.5, dissociation: 1 },
  { name: "Urea", concentration: 5, dissociation: 1 },
];

const SERUM_SCENARIOS = [
  { label: "Normal", na: "140", glu: "100", bun: "15", eth: "0" },
  { label: "Hyperglycemia", na: "130", glu: "450", bun: "18", eth: "0" },
  { label: "Dehydration", na: "155", glu: "120", bun: "30", eth: "0" },
  { label: "Alcohol Intox", na: "140", glu: "100", bun: "15", eth: "300" },
];

const BLOOD_CONDITIONS = [
  { label: "Normal", hct: "45", plasma: "290", cell: "285" },
  { label: "Anemia", hct: "30", plasma: "290", cell: "285" },
  { label: "Polycythemia", hct: "55", plasma: "290", cell: "285" },
  { label: "Dehydration", hct: "50", plasma: "320", cell: "310" },
];

export default function OsmolalityCalculators() {
  const [calculatorType, setCalculatorType] = useState<CalculatorType>("general");

  // General
  const [solutes, setSolutes] = useState<Solute[]>([
    { id: 1, name: "NaCl", concentration: 150, dissociation: 2 },
    { id: 2, name: "Glucose", concentration: 5.5, dissociation: 1 },
  ]);
  const [newSolute, setNewSolute] = useState({ name: "", concentration: "", dissociation: "1" });
  const [temperature, setTemperature] = useState("25");

  // Serum
  const [serumNa, setSerumNa] = useState("140");
  const [serumGlu, setSerumGlu] = useState("100");
  const [serumBun, setSerumBun] = useState("15");
  const [serumEthanol, setSerumEthanol] = useState("0");
  const [serumMethod, setSerumMethod] = useState<SerumMethod>("standard");

  // Urine
  const [urineNa, setUrineNa] = useState("60");
  const [urineK, setUrineK] = useState("40");
  const [urineUrea, setUrineUrea] = useState("400");
  const [urineGlu, setUrineGlu] = useState("0");
  const [urineSg, setUrineSg] = useState("1.015");
  const [urineMethod, setUrineMethod] = useState<UrineMethod>("electrolytes");

  // Plasma
  const [plasmaNa, setPlasmaNa] = useState("142");
  const [plasmaK, setPlasmaK] = useState("4.0");
  const [plasmaGlu, setPlasmaGlu] = useState("5.5");
  const [plasmaUrea, setPlasmaUrea] = useState("5.0");
  const [albumin, setAlbumin] = useState("40");
  const [globulin, setGlobulin] = useState("30");

  // Blood
  const [hematocrit, setHematocrit] = useState("45");
  const [plasmaOsmolality, setPlasmaOsmolality] = useState("290");
  const [cellOsmolality, setCellOsmolality] = useState("285");
  const [bloodMethod, setBloodMethod] = useState<BloodMethod>("calculated");

  const result = useMemo(() => {
    switch (calculatorType) {
      case "general":
        return calculateGeneral(solutes, temperature);
      case "serum":
        return calculateSerum(serumNa, serumGlu, serumBun, serumEthanol, serumMethod);
      case "urine":
        return calculateUrine(urineNa, urineK, urineUrea, urineGlu, urineSg, urineMethod);
      case "plasma":
        return calculatePlasma(plasmaNa, plasmaK, plasmaGlu, plasmaUrea, albumin, globulin);
      case "blood":
        return calculateBlood(hematocrit, plasmaOsmolality, cellOsmolality, bloodMethod);
    }
  }, [
    calculatorType, solutes, temperature,
    serumNa, serumGlu, serumBun, serumEthanol, serumMethod,
    urineNa, urineK, urineUrea, urineGlu, urineSg, urineMethod,
    plasmaNa, plasmaK, plasmaGlu, plasmaUrea, albumin, globulin,
    hematocrit, plasmaOsmolality, cellOsmolality, bloodMethod,
  ]);

  const valid = Number.isFinite(result.osmolality);

  const tone: ResultTone = !valid
    ? "neutral"
    : /Normal|Isotonic|physiological/i.test(result.interpretation)
      ? "success"
      : /emergency|Severe|Highly/i.test(result.interpretation)
        ? "danger"
        : "warning";

  const addSolute = () => {
    if (!newSolute.name || !newSolute.concentration) return;
    const newId = solutes.length ? Math.max(...solutes.map((s) => s.id)) + 1 : 1;
    setSolutes([
      ...solutes,
      {
        id: newId,
        name: newSolute.name,
        concentration: parseFloat(newSolute.concentration),
        dissociation: parseFloat(newSolute.dissociation),
      },
    ]);
    setNewSolute({ name: "", concentration: "", dissociation: "1" });
  };

  return (
    <CalculatorShell
      title="Osmolality Calculators"
      subtitle="Five related calculations — a general solute mixture, serum, urine, plasma and whole blood — each with its own formula and clinical interpretation."
      icon={Droplets}
      eyebrow="Pharmaceutics"
      aside={
        <>
          <CalcAbout title="About osmolality">
            <p>
              Osmolality counts dissolved particles per kilogram of solvent, so a salt that
              dissociates into two ions contributes twice its molar concentration. It governs where
              water moves between compartments, which is why it underpins fluid therapy.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Checking whether a formulation will be isotonic with plasma",
                "Estimating serum osmolality from routine electrolytes",
                "Assessing renal concentrating ability from a urine sample",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Osmolality is per kg of solvent; osmolarity is per litre of solution. The two are close in dilute aqueous systems and are used loosely here.",
                "Several modes on this page have known defects — read the warning beside the result.",
                "Calculated serum osmolality cannot replace a measured one when a toxic alcohol is suspected.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Calculated osmolality"
        value={valid ? Math.round(result.osmolality) : null}
        unit="mOsm/kg H₂O"
        interpretation={valid ? result.interpretation : undefined}
        tone={tone}
        empty="Enter the values for the selected calculator."
      />

      {valid && (
        <LabNotice tone="info" title="Additional details">
          {result.details}
        </LabNotice>
      )}

      {/* Reported, not corrected — the maths is unchanged from the original page.
          Recorded in .claude/redesign-tracker.md. */}
      {calculatorType === "serum" && serumMethod !== "advanced" && (
        <LabNotice tone="warning" title="The osmolar gap here is always zero">
          A true osmolar gap is the <em>measured</em> osmolality minus the calculated one, and this
          page never asks for a measured value — it subtracts the calculated result from itself. Only
          the &ldquo;With ethanol&rdquo; mode produces a non-zero gap, and that is simply the ethanol
          term. &ldquo;Measured value&rdquo; mode returns the standard formula unchanged.
        </LabNotice>
      )}

      {calculatorType === "urine" && urineMethod === "measured" && (
        <LabNotice tone="warning" title="&ldquo;Direct input&rdquo; does not take a measured value">
          This mode returns the sodium field multiplied by 2, not an osmolality you have measured.
          Use the electrolyte or specific-gravity method instead.
        </LabNotice>
      )}

      {calculatorType === "urine" && (
        <LabNotice tone="info" title="Urine-to-plasma ratio uses a fixed plasma value">
          The ratio above divides by a hard-coded plasma osmolality of 290 mOsm/kg rather than the
          patient&apos;s own. Recalculate it by hand if the plasma osmolality is abnormal.
        </LabNotice>
      )}

      {calculatorType === "blood" && bloodMethod === "calculated" && (
        <LabNotice tone="warning" title="This mode ignores haematocrit">
          &ldquo;Standard calculation&rdquo; returns the plasma osmolality unchanged, so the
          haematocrit field has no effect. Switch to &ldquo;With haematocrit correction&rdquo; to
          weight plasma and cell compartments.
        </LabNotice>
      )}

      <CalcSection title="Calculator">
        <ModeSwitch<CalculatorType>
          label="Which osmolality"
          value={calculatorType}
          onChange={setCalculatorType}
          options={TYPE_OPTIONS}
        />
      </CalcSection>

      {calculatorType === "general" && (
        <CalcSection title="Solutes" description="Each solute contributes concentration × its dissociation factor i.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Solute</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">mmol/kg</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">i</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">mOsm/kg</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {solutes.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3">{s.name}</td>
                    <td className="py-2 pr-3 tabular-nums">{s.concentration}</td>
                    <td className="py-2 pr-3 tabular-nums">{s.dissociation}</td>
                    <td className="py-2 pr-3 tabular-nums font-medium">
                      {(s.concentration * s.dissociation).toFixed(1)}
                    </td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSolutes(solutes.filter((x) => x.id !== s.id))}
                        aria-label={`Remove ${s.name}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FieldGrid>
            <TextField
              label="New solute name"
              value={newSolute.name}
              onChange={(v) => setNewSolute({ ...newSolute, name: v })}
              placeholder="e.g. Mannitol"
            />
            <NumberField
              label="Concentration"
              value={newSolute.concentration}
              onChange={(v) => setNewSolute({ ...newSolute, concentration: v })}
              unit="mmol/kg"
              step="0.1"
              min={0}
            />
            <NumberField
              label="Dissociation factor i"
              value={newSolute.dissociation}
              onChange={(v) => setNewSolute({ ...newSolute, dissociation: v })}
              step="0.1"
              min={0}
              hint="NaCl = 2, glucose = 1, CaCl₂ = 3."
            />
            <NumberField
              label="Temperature"
              value={temperature}
              onChange={setTemperature}
              unit="°C"
              step="1"
              hint="Correction is 0.1% per °C from 25 °C."
            />
          </FieldGrid>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={addSolute}>
              <Plus className="mr-1.5 h-4 w-4" /> Add solute
            </Button>
            <span className="text-[13px] font-medium text-foreground/90">Common</span>
            {COMMON_SOLUTES.map((c) => (
              <Button
                key={c.name}
                type="button"
                variant="outline"
                size="sm"
                title={`${c.concentration} mmol/kg · i=${c.dissociation}`}
                onClick={() =>
                  setNewSolute({
                    name: c.name,
                    concentration: String(c.concentration),
                    dissociation: String(c.dissociation),
                  })
                }
              >
                {c.name}
              </Button>
            ))}
          </div>
        </CalcSection>
      )}

      {calculatorType === "serum" && (
        <CalcSection title="Serum chemistry" description="Sodium in mmol/L; glucose, BUN and ethanol in mg/dL.">
          <ModeSwitch<SerumMethod>
            label="Method"
            value={serumMethod}
            onChange={setSerumMethod}
            options={[
              { value: "standard", label: "Standard", description: "2Na + Glu/18 + BUN/2.8" },
              { value: "advanced", label: "With ethanol", description: "Adds ethanol/4.6" },
              { value: "measured", label: "Measured value", description: "Same as standard" },
            ]}
          />
          <FieldGrid>
            <NumberField label="Sodium (Na⁺)" value={serumNa} onChange={setSerumNa} unit="mmol/L" step="1" />
            <NumberField label="Glucose" value={serumGlu} onChange={setSerumGlu} unit="mg/dL" step="1" />
            <NumberField label="BUN" value={serumBun} onChange={setSerumBun} unit="mg/dL" step="1" />
            <NumberField
              label="Ethanol"
              value={serumEthanol}
              onChange={setSerumEthanol}
              unit="mg/dL"
              step="1"
              disabled={serumMethod !== "advanced"}
              hint={serumMethod === "advanced" ? "Divided by 4.6." : "Only used in the ethanol method."}
            />
          </FieldGrid>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[13px] font-medium text-foreground/90">Clinical scenario</span>
            {SERUM_SCENARIOS.map((s) => (
              <Button
                key={s.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSerumNa(s.na);
                  setSerumGlu(s.glu);
                  setSerumBun(s.bun);
                  setSerumEthanol(s.eth);
                }}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CalcSection>
      )}

      {calculatorType === "urine" && (
        <CalcSection title="Urine chemistry" description="Electrolytes and urea in mmol/L.">
          <ModeSwitch<UrineMethod>
            label="Method"
            value={urineMethod}
            onChange={setUrineMethod}
            options={[
              { value: "electrolytes", label: "From electrolytes", description: "2(Na+K) + urea + glucose" },
              { value: "specificGravity", label: "From specific gravity", description: "(SG − 1) × 40 000" },
              { value: "measured", label: "Direct input", description: "See the note above" },
            ]}
          />
          <FieldGrid>
            <NumberField label="Sodium (Na⁺)" value={urineNa} onChange={setUrineNa} unit="mmol/L" step="1" />
            <NumberField
              label="Potassium (K⁺)"
              value={urineK}
              onChange={setUrineK}
              unit="mmol/L"
              step="1"
              disabled={urineMethod !== "electrolytes"}
            />
            <NumberField
              label="Urea"
              value={urineUrea}
              onChange={setUrineUrea}
              unit="mmol/L"
              step="1"
              disabled={urineMethod !== "electrolytes"}
            />
            <NumberField
              label="Glucose"
              value={urineGlu}
              onChange={setUrineGlu}
              unit="mmol/L"
              step="1"
              disabled={urineMethod !== "electrolytes"}
            />
            <NumberField
              label="Specific gravity"
              value={urineSg}
              onChange={setUrineSg}
              step="0.001"
              disabled={urineMethod !== "specificGravity"}
              hint="Normal range 1.005–1.030."
            />
          </FieldGrid>
        </CalcSection>
      )}

      {calculatorType === "plasma" && (
        <CalcSection title="Plasma components" description="Electrolytes and small molecules in mmol/L; proteins in g/L.">
          <FieldGrid>
            <NumberField label="Sodium (Na⁺)" value={plasmaNa} onChange={setPlasmaNa} unit="mmol/L" step="1" />
            <NumberField label="Potassium (K⁺)" value={plasmaK} onChange={setPlasmaK} unit="mmol/L" step="0.1" />
            <NumberField label="Glucose" value={plasmaGlu} onChange={setPlasmaGlu} unit="mmol/L" step="0.1" />
            <NumberField label="Urea" value={plasmaUrea} onChange={setPlasmaUrea} unit="mmol/L" step="0.1" />
            <NumberField label="Albumin" value={albumin} onChange={setAlbumin} unit="g/L" step="1" />
            <NumberField label="Globulin" value={globulin} onChange={setGlobulin} unit="g/L" step="1" />
          </FieldGrid>
        </CalcSection>
      )}

      {calculatorType === "blood" && (
        <CalcSection title="Whole blood" description="Plasma and red-cell compartments weighted by haematocrit.">
          <ModeSwitch<BloodMethod>
            label="Method"
            value={bloodMethod}
            onChange={setBloodMethod}
            options={[
              { value: "calculated", label: "Standard calculation", description: "Blood ≈ plasma" },
              { value: "measured", label: "With haematocrit correction", description: "Weighted average" },
            ]}
          />
          <FieldGrid>
            <NumberField
              label="Haematocrit"
              value={hematocrit}
              onChange={setHematocrit}
              unit="%"
              step="1"
              min={0}
              max={100}
              hint={bloodMethod === "calculated" ? "Not used in this mode." : "Fraction of blood volume that is red cells."}
            />
            <NumberField label="Plasma osmolality" value={plasmaOsmolality} onChange={setPlasmaOsmolality} unit="mOsm/kg" step="1" />
            <NumberField label="Cell osmolality" value={cellOsmolality} onChange={setCellOsmolality} unit="mOsm/kg" step="1" />
          </FieldGrid>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[13px] font-medium text-foreground/90">Clinical condition</span>
            {BLOOD_CONDITIONS.map((c) => (
              <Button
                key={c.label}
                type="button"
                variant="outline"
                size="sm"
                title={`Hct ${c.hct}% | plasma ${c.plasma} | cells ${c.cell}`}
                onClick={() => {
                  setHematocrit(c.hct);
                  setPlasmaOsmolality(c.plasma);
                  setCellOsmolality(c.cell);
                }}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </CalcSection>
      )}

      {valid && (
        <CalcSection title="Working" description={result.formula}>
          <div>
            {result.rows.map((r) => (
              <ResultRow key={r.label} label={r.label} value={r.value} unit={r.unit} />
            ))}
            <ResultRow label="Total osmolality" value={result.osmolality.toFixed(1)} unit="mOsm/kg" />
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>
          <strong>General.</strong> Every solute contributes its molar concentration multiplied by
          its dissociation factor i (NaCl = 2, CaCl₂ = 3, glucose = 1), with an approximate
          temperature correction of 0.1% per °C away from 25 °C.
        </p>
        <Formula>Osmolality = Σ(concentration × i) × [1 + (T − 25) × 0.001]</Formula>
        <p>
          <strong>Serum</strong> uses the conventional US-unit formula, where 18 converts glucose and
          2.8 converts BUN from mg/dL to mmol/L:
        </p>
        <Formula>2 × Na⁺ + Glucose/18 + BUN/2.8 (+ Ethanol/4.6)</Formula>
        <p>
          <strong>Urine</strong> is either 2(Na⁺ + K⁺) + urea + glucose in mmol/L, or the
          specific-gravity approximation (SG − 1) × 40 000.
        </p>
        <p>
          <strong>Plasma</strong> works in SI units and adds a protein term of (albumin + globulin) ×
          0.08. Effective osmolality (tonicity) omits urea, which crosses membranes freely and so
          exerts no lasting osmotic force.
        </p>
        <Formula>2 × (Na⁺ + K⁺) + Glucose + Urea + (albumin + globulin) × 0.08</Formula>
        <p>
          <strong>Whole blood</strong> weights the plasma and red-cell compartments by haematocrit:
          plasma × (100 − Hct)/100 + cells × Hct/100.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Osmolality or osmolarity?",
            a: "Osmolality is particles per kilogram of solvent and is what a laboratory osmometer measures; osmolarity is per litre of solution and is what you calculate from concentrations. In dilute aqueous solutions they differ by only a few per cent, and this page uses the terms loosely, as the original tool did.",
          },
          {
            q: "Why does dividing glucose by 18 work?",
            a: "It converts mg/dL to mmol/L. Glucose has a molar mass of 180 g/mol, so 1 mmol/L is 18 mg/dL. BUN uses 2.8 for the same reason, allowing for urea carrying two nitrogen atoms.",
          },
          {
            q: "What is an osmolar gap for?",
            a: "It is the difference between measured and calculated osmolality, and a gap above about 10 mOsm/kg suggests an unmeasured osmole such as methanol or ethylene glycol. Note the warning on this page: without a measured value entered, the gap shown here cannot do that job.",
          },
          {
            q: "Why is urea excluded from effective osmolality?",
            a: "Because it crosses cell membranes freely and equilibrates on both sides, so it raises measured osmolality without driving any net water movement. Tonicity — what actually shifts water between compartments — counts only the effective osmoles, chiefly sodium and glucose.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
