"use client";

import { useMemo, useState } from "react";
import { Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
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
  AdSlot,
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

/* ── Reference affinities (values unchanged from the original page) ──────── */
const EXAMPLE_DRUGS = [
  { drug: "Fentanyl (μ-opioid)", Kd: "0.1", affinity: "Ultra-high" },
  { drug: "Propranolol (β-blocker)", Kd: "1.0", affinity: "High" },
  { drug: "Aspirin (COX-1)", Kd: "100", affinity: "Medium" },
  { drug: "Warfarin (VKOR)", Kd: "1000", affinity: "Low" },
  { drug: "Penicillin (PBPs)", Kd: "10000", affinity: "Very low" },
];

/* ── Pure calculation — bands, Cheng-Prusoff and rounding copied verbatim ── */
interface BindingResult {
  affinity: string;
  occupancy: number;
  classification: string;
  tone: ResultTone;
  bindingConstant: number;
  bmax: number;
  L: number;
  bound: number;
  source: "Kd" | "Ki" | "IC50";
}

type BindingOutcome = { ok: true; result: BindingResult } | { ok: false; error: string };

function computeBinding(
  kd: string,
  ki: string,
  ic50: string,
  radioligandKd: string,
  ligandConcentration: string,
  receptorConcentration: string,
): BindingOutcome | null {
  const L = parseFloat(ligandConcentration);
  const Bmax = parseFloat(receptorConcentration);

  // The original treated 0 and NaN alike here (`!L`), and so does this.
  if (!L || L <= 0 || !Bmax || Bmax <= 0) {
    return { ok: false, error: "Ligand concentration [L] and Bmax must be positive numbers." };
  }

  let bindingConstant = 0;
  let affinity = "";
  let source: BindingResult["source"];

  if (kd) {
    bindingConstant = parseFloat(kd);
    affinity = `Kd = ${bindingConstant} nM`;
    source = "Kd";
  } else if (ki) {
    bindingConstant = parseFloat(ki);
    affinity = `Ki = ${bindingConstant} nM`;
    source = "Ki";
  } else if (ic50) {
    const ic50Value = parseFloat(ic50);
    const Km = parseFloat(radioligandKd);
    if (!Km || Km <= 0) {
      return { ok: false, error: "Enter a valid radioligand Kd (Km) to convert IC50 to Ki." };
    }
    // Cheng-Prusoff: Ki = IC50 / (1 + [L*]/Km).
    const kiValue = ic50Value / (1 + L / Km);
    bindingConstant = kiValue;
    affinity = `IC50 = ${ic50Value} nM → Ki ≈ ${kiValue.toFixed(3)} nM (Cheng-Prusoff)`;
    source = "IC50";
  } else {
    return { ok: false, error: "Enter at least one binding parameter (Kd, Ki, or IC50)." };
  }

  if (!bindingConstant || bindingConstant <= 0) {
    return { ok: false, error: "Please enter a valid, positive value." };
  }

  const occupancy = (L / (bindingConstant + L)) * 100;

  let classification = "";
  let tone: ResultTone = "neutral";
  if (bindingConstant < 0.1) {
    classification = "ULTRA-HIGH AFFINITY";
    tone = "success";
  } else if (bindingConstant < 1) {
    classification = "HIGH AFFINITY";
    tone = "success";
  } else if (bindingConstant < 100) {
    classification = "MEDIUM AFFINITY";
    tone = "neutral";
  } else if (bindingConstant < 1000) {
    classification = "LOW AFFINITY";
    tone = "warning";
  } else {
    classification = "VERY LOW AFFINITY";
    tone = "danger";
  }

  return {
    ok: true,
    result: {
      affinity,
      occupancy: Math.min(occupancy, 100),
      classification,
      tone,
      bindingConstant,
      bmax: Bmax,
      L,
      bound: (Bmax * L) / (bindingConstant + L),
      source,
    },
  };
}

export default function DrugReceptorBindingAffinityTool() {
  const [kd, setKd] = useState("");
  const [ki, setKi] = useState("");
  const [ic50, setIc50] = useState("");
  const [radioligandKd, setRadioligandKd] = useState("100");
  const [ligandConcentration, setLigandConcentration] = useState("10");
  const [receptorConcentration, setReceptorConcentration] = useState("1");

  const outcome = useMemo(
    () => computeBinding(kd, ki, ic50, radioligandKd, ligandConcentration, receptorConcentration),
    [kd, ki, ic50, radioligandKd, ligandConcentration, receptorConcentration],
  );

  // Results are derived, so an invalid entry clears the figure instead of
  // leaving the previous answer on screen beside the error (the original kept it).
  const result = outcome?.ok ? outcome.result : null;
  const anyParameterEntered = Boolean(kd || ki || ic50);
  const errorMessage = outcome && !outcome.ok && anyParameterEntered ? outcome.error : null;

  // Binding isotherm and Scatchard transform, on the original's log sweep.
  const { curveData, scatchardData } = useMemo(() => {
    if (!result) return { curveData: [], scatchardData: [] };
    const { bindingConstant, bmax } = result;
    const curve: { logL: number; conc: number; bound: number; occupancy: number }[] = [];
    const scatchard: { bound: number; boundOverFree: number }[] = [];

    for (let logL = -3; logL <= 3.0001; logL += 0.15) {
      const conc = Math.pow(10, logL) * bindingConstant;
      const bound = (bmax * conc) / (bindingConstant + conc);
      const occPercent = (conc / (bindingConstant + conc)) * 100;
      curve.push({
        logL: parseFloat(logL.toFixed(2)),
        conc: parseFloat(conc.toFixed(4)),
        bound: parseFloat(bound.toFixed(4)),
        occupancy: parseFloat(occPercent.toFixed(2)),
      });

      // Scatchard: Bound/Free vs Bound, assuming free ≈ [L]. The near-zero point
      // is skipped to avoid the divide-by-zero blow-up, as in the original.
      if (conc > bindingConstant / 100) {
        scatchard.push({
          bound: parseFloat(bound.toFixed(4)),
          boundOverFree: parseFloat((bound / conc).toFixed(4)),
        });
      }
    }
    return { curveData: curve, scatchardData: scatchard.sort((a, b) => a.bound - b.bound) };
  }, [result]);

  const positiveError = (raw: string, name: string) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    return n <= 0 ? `${name} must be greater than 0.` : undefined;
  };

  const reset = () => {
    setKd("");
    setKi("");
    setIc50("");
    setRadioligandKd("100");
    setLigandConcentration("10");
    setReceptorConcentration("1");
  };

  return (
    <CalculatorShell
      title="Drug-Receptor Binding Affinity Tool"
      subtitle="Turns Kd, Ki or an IC50 into receptor occupancy, classifies the affinity, and plots the binding isotherm and its Scatchard transform."
      icon={Target}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About binding affinity">
            <p>
              Kd is the concentration of drug that occupies half the receptors — so a{" "}
              <em>lower</em> Kd means a tighter-binding, more potent ligand. Occupancy at any
              concentration follows from Kd alone, which is why affinity, not dose, is the first thing
              measured about a new ligand.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Converting a competition-assay IC50 into a Ki",
                "Working out what fraction of receptors a concentration will occupy",
                "Reading a Scatchard plot and recovering Kd and Bmax from it",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "All concentrations here are in nanomolar. Mixing units is the usual source of a wrong answer.",
                "Occupancy is not effect: spare receptors and signal amplification mean a drug can produce a maximal response at well under full occupancy.",
                "The Scatchard plot assumes free ligand ≈ total ligand, which holds only when the receptor is far more dilute than the ligand.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Receptor occupancy"
        value={result ? result.occupancy.toFixed(1) : null}
        unit="%"
        interpretation={result ? result.classification : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter one of Kd, Ki or IC50, with a ligand concentration and Bmax."
      />

      {result && (
        <LabNotice tone="info" title={result.affinity}>
          At [L] = {result.L} nM, {result.occupancy.toFixed(1)}% of receptors are occupied
          (independent of Bmax). Bound = {result.bound.toFixed(3)} nM out of a Bmax of {result.bmax}{" "}
          nM.
        </LabNotice>
      )}

      {errorMessage && (
        <LabNotice tone="warning" title="Check the inputs">
          {errorMessage}
        </LabNotice>
      )}

      <CalcSection
        title="Binding parameters"
        description="Enter only one of Kd, Ki or IC50 — they are read in that order of priority."
      >
        <FieldGrid>
          <NumberField
            label="Kd"
            value={kd}
            onChange={setKd}
            unit="nM"
            step="0.001"
            min={0}
            placeholder="e.g. 1"
            hint="Dissociation constant. Takes priority over Ki and IC50."
            error={positiveError(kd, "Kd")}
          />
          <NumberField
            label="Ki"
            value={ki}
            onChange={setKi}
            unit="nM"
            step="0.001"
            min={0}
            placeholder="e.g. 500"
            hint="Inhibition constant. Used when Kd is blank."
            error={positiveError(ki, "Ki")}
          />
          <NumberField
            label="IC50"
            value={ic50}
            onChange={setIc50}
            unit="nM"
            step="0.001"
            min={0}
            placeholder="e.g. 100"
            hint="Converted to Ki by Cheng-Prusoff. Used when Kd and Ki are blank."
            error={positiveError(ic50, "IC50")}
          />
          {ic50 && !kd && !ki && (
            <NumberField
              label="Radioligand Kd (Km)"
              value={radioligandKd}
              onChange={setRadioligandKd}
              unit="nM"
              step="0.001"
              min={0}
              placeholder="e.g. 100"
              hint="The tracer's own Kd — needed for the Cheng-Prusoff conversion."
              error={positiveError(radioligandKd, "Radioligand Kd")}
            />
          )}
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Assay conditions">
        <FieldGrid>
          <NumberField
            label="Ligand [L]"
            value={ligandConcentration}
            onChange={setLigandConcentration}
            unit="nM"
            step="0.001"
            min={0}
            placeholder="e.g. 10"
            hint="Free ligand concentration at the receptor."
            error={positiveError(ligandConcentration, "Ligand concentration")}
          />
          <NumberField
            label="Bmax / receptor total"
            value={receptorConcentration}
            onChange={setReceptorConcentration}
            unit="nM"
            step="0.001"
            min={0}
            placeholder="e.g. 1"
            hint="Total receptor concentration. Scales the amount bound, not the occupancy."
            error={positiveError(receptorConcentration, "Bmax")}
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Try a reference drug</span>
          {EXAMPLE_DRUGS.map((d) => (
            <Button
              key={d.drug}
              type="button"
              variant="outline"
              size="sm"
              title={`Kd ${d.Kd} nM — ${d.affinity}`}
              onClick={() => {
                setKd(d.Kd);
                setKi("");
                setIc50("");
              }}
            >
              {d.drug.split(" ")[0]}
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="How the occupancy and bound amount were obtained.">
          <div>
            <ResultRow label="Binding constant used" value={result.bindingConstant.toFixed(4)} unit="nM" badge={result.source} />
            <ResultRow label="Ligand concentration [L]" value={result.L} unit="nM" />
            <ResultRow label="Occupancy = [L] / (Kd + [L])" value={`${result.occupancy.toFixed(1)} %`} />
            <ResultRow label="Bound = Bmax × [L] / (Kd + [L])" value={result.bound.toFixed(3)} unit="nM" />
            <ResultRow label="Out of Bmax" value={result.bmax} unit="nM" />
            <ResultRow label="Affinity class" value={result.classification} />
          </div>
        </CalcSection>
      )}

      {curveData.length > 0 && (
        <>
          <CalcSection
            title="Binding isotherm"
            description="Fractional occupancy against log ligand concentration. The dashed line marks Kd, where occupancy is 50%."
          >
            <div className="h-60 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="logL"
                    fontSize={11}
                    tickMargin={8}
                    tickFormatter={(v: number) => v.toFixed(0)}
                    label={{ value: "log ([L] / Kd)", position: "insideBottom", offset: -14, fontSize: 11 }}
                  />
                  <YAxis fontSize={11} width={48} domain={[0, 100]} tickFormatter={(v: number) => v.toFixed(0)} />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(1)} %`, "Occupancy"]}
                    labelFormatter={(l) => `log([L]/Kd) = ${l}`}
                  />
                  <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 3" />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 3" />
                  <Line type="monotone" dataKey="occupancy" stroke="#1C7BD9" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CalcSection>

          <CalcSection
            title="Scatchard plot"
            description="Bound/Free against Bound. The slope is −1/Kd and the x-intercept is Bmax."
          >
            <div className="h-56 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scatchardData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="bound"
                    type="number"
                    fontSize={11}
                    tickMargin={8}
                    tickFormatter={(v: number) => v.toFixed(2)}
                    label={{ value: "Bound (nM)", position: "insideBottom", offset: -14, fontSize: 11 }}
                  />
                  <YAxis fontSize={11} width={52} tickFormatter={(v: number) => v.toFixed(2)} />
                  <Tooltip
                    formatter={(v) => [Number(v).toFixed(4), "Bound / Free"]}
                    labelFormatter={(l) => `Bound = ${l} nM`}
                  />
                  <Line type="monotone" dataKey="boundOverFree" stroke="#21B67A" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CalcSection>
        </>
      )}

      <CalcSection title="Reference affinities" description="Where some familiar drugs sit on this scale.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Drug (target)</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Kd (nM)</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Class</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_DRUGS.map((d) => (
                <tr key={d.drug} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{d.drug}</td>
                  <td className="py-2 pr-3 tabular-nums">{d.Kd}</td>
                  <td className="py-2 text-muted-foreground">{d.affinity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Bands used here: ultra-high below 0.1 nM, high 0.1–1, medium 1–100, low 100–1000, very low
          above 1000 nM.
        </p>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>Single-site (Langmuir) binding. Fractional occupancy depends only on Kd and [L]:</p>
        <Formula>occupancy = [L] / (Kd + [L])</Formula>
        <p>The amount actually bound scales that by the receptor density:</p>
        <Formula>Bound = Bmax × [L] / (Kd + [L])</Formula>
        <p>
          When an IC50 from a competition assay is entered, it is converted to Ki with the
          Cheng-Prusoff equation, where [L*] is the radioligand concentration (taken here as the
          entered [L]) and Km is the radioligand&apos;s own Kd:
        </p>
        <Formula>Ki = IC50 / (1 + [L*] / Km)</Formula>
        <p>
          The Scatchard transform rearranges the isotherm to a straight line: plotting Bound/Free
          against Bound gives a slope of −1/Kd and an x-intercept of Bmax. It assumes free ligand is
          approximately equal to total ligand.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Does Bmax change the occupancy?",
            a: "No. Occupancy is a fraction and depends only on [L] and Kd. Bmax scales how much ligand is bound in absolute terms (nM), which is what the Scatchard plot and the 'bound' figure use.",
          },
          {
            q: "When can I use IC50 as if it were Ki?",
            a: "Only when the radioligand concentration is far below its own Kd — then the Cheng-Prusoff correction factor approaches 1. Otherwise IC50 overstates Ki, and the assay conditions must be corrected for.",
          },
          {
            q: "Which field wins if I fill in more than one?",
            a: "Kd, then Ki, then IC50. Clear the higher-priority field to use a lower one — the radioligand Kd field only appears when IC50 is the value being used.",
          },
          {
            q: "Why is 90% occupancy reached so far above the Kd?",
            a: "Because the isotherm is hyperbolic: 50% occupancy needs [L] = Kd, but 90% needs 9 × Kd and 99% needs 99 × Kd. That flattening is why increasing a dose gives diminishing returns near the top of the curve.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
