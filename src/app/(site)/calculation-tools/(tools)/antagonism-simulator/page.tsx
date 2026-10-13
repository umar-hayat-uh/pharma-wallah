"use client";

import { useMemo, useState } from "react";
import { GitMerge } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  ModeSwitch,
  LabNotice,
} from "@/components/calculators";

type AntagonismType = "competitive" | "noncompetitive" | "uncompetitive";

const TYPE_OPTIONS = [
  { value: "competitive" as const, label: "Competitive", description: "EC₅₀ ↑, Emax ↔" },
  { value: "noncompetitive" as const, label: "Non-competitive", description: "Emax ↓, EC₅₀ ↔" },
  { value: "uncompetitive" as const, label: "Uncompetitive", description: "Both affected" },
];

const TYPE_NOTE: Record<AntagonismType, string> = {
  competitive:
    "The antagonist competes for the same site, so enough agonist still reaches the full effect — the curve shifts right without losing height.",
  noncompetitive:
    "The antagonist acts at a separate site and cannot be outcompeted, so the maximum attainable effect falls.",
  uncompetitive:
    "The antagonist binds only the agonist-occupied receptor, so both the potency and the ceiling are affected.",
};

/* ── Pure calculation — the original's equations and rounding, unchanged ──── */
interface AntagonismResult {
  response: number;
  ec50Shift: number;
  occupancy: number;
  KdA: number;
  KdB: number;
  Em: number;
  A: number;
  B: number;
}

function occupancyFor(type: AntagonismType, A: number, B: number, KdA: number, KdB: number): number {
  switch (type) {
    case "competitive":
      // Gaddum equation for competitive antagonism.
      return A / (A + KdA * (1 + B / KdB));
    case "noncompetitive":
      return (A / (A + KdA)) * (1 - B / (B + KdB));
    case "uncompetitive":
      return (A / (A + KdA)) * (KdB / (KdB + B));
  }
}

function computeAntagonism(
  type: AntagonismType,
  agonistRaw: string,
  antagonistRaw: string,
  kaRaw: string,
  kbRaw: string,
  emaxRaw: string,
): AntagonismResult | null {
  const A = parseFloat(agonistRaw);
  const B = parseFloat(antagonistRaw);
  const KdA = 1 / parseFloat(kaRaw);
  const KdB = 1 / parseFloat(kbRaw);
  const Em = parseFloat(emaxRaw);

  if (
    !Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(KdA) ||
    !Number.isFinite(KdB) || !Number.isFinite(Em) || A <= 0
  ) {
    return null;
  }

  const occupancy = occupancyFor(type, A, B, KdA, KdB);
  // Schild: the dose ratio for a competitive antagonist is 1 + [B]/Kd(B).
  const ec50Shift = type === "competitive" ? 1 + B / KdB : 1;

  return { response: occupancy * Em, ec50Shift, occupancy, KdA, KdB, Em, A, B };
}

export default function AntagonismSimulator() {
  const [antagType, setAntagType] = useState<AntagonismType>("competitive");
  const [agonistConc, setAgonistConc] = useState("10");
  const [antagonistConc, setAntagonistConc] = useState("5");
  const [ka, setKa] = useState("0.5");
  const [kb, setKb] = useState("0.2");
  const [emax, setEmax] = useState("100");

  const units = "µM";

  const result = useMemo(
    () => computeAntagonism(antagType, agonistConc, antagonistConc, ka, kb, emax),
    [antagType, agonistConc, antagonistConc, ka, kb, emax],
  );

  // Dose-response curve on a log axis relative to Kd(A), as on the original page.
  const curveData = useMemo(() => {
    if (!result) return [];
    const { B, KdB, Em } = result;
    const rows: { logConc: number; response: number; noAntagonist: number }[] = [];
    for (let logA = -2; logA <= 2.0001; logA += 0.1) {
      const conc = Math.pow(10, logA);
      const occ =
        antagType === "competitive"
          ? conc / (conc + 1 * (1 + B / KdB))
          : antagType === "noncompetitive"
            ? (conc / (conc + 1)) * (1 - B / (B + KdB))
            : (conc / (conc + 1)) * (KdB / (KdB + B));
      rows.push({
        logConc: Number(logA.toFixed(2)),
        response: occ * Em,
        // Reference curve with no antagonist present, for comparison.
        noAntagonist: (conc / (conc + 1)) * Em,
      });
    }
    return rows;
  }, [result, antagType]);

  const fieldError = (raw: string, name: string, mustBePositive: boolean) => {
    if (raw.trim() === "") return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return `Enter ${name} as a number.`;
    if (mustBePositive && n <= 0) return `${name} must be greater than 0.`;
    if (!mustBePositive && n < 0) return `${name} cannot be negative.`;
    return undefined;
  };

  const reset = () => {
    setAntagType("competitive");
    setAgonistConc("10");
    setAntagonistConc("5");
    setKa("0.5");
    setKb("0.2");
    setEmax("100");
  };

  return (
    <CalculatorShell
      title="Antagonism Simulator"
      subtitle="Models how a competitive, non-competitive or uncompetitive antagonist changes the response to an agonist, and the Schild dose ratio it produces."
      icon={GitMerge}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About receptor antagonism">
            <p>
              An antagonist reduces the effect of an agonist, but how it does so depends on where it
              binds. The three classical cases differ in whether more agonist can overcome the block
              — and that difference is what a dose-response curve reveals.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Learning why a competitive block shifts the curve right but keeps Emax",
                "Interpreting a Schild plot or a dose-ratio experiment",
                "Seeing how antagonist affinity changes the size of the shift",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This is a teaching model of receptor occupancy. It assumes occupancy equals effect, with no spare receptors, no signal amplification and no partial agonism.",
                "Affinities are entered as k (1/µM), so the dissociation constant Kd used in the equations is 1/k.",
                "The non-competitive and uncompetitive options currently produce identical numbers — see the note below the result.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="Predicted effect"
        value={result ? result.response.toFixed(1) : null}
        unit="% of Emax"
        interpretation={result ? `EC₅₀ shift factor ${result.ec50Shift.toFixed(2)}×` : undefined}
        tone={result ? (result.ec50Shift > 1 ? "warning" : "neutral") : "neutral"}
        empty="Enter an agonist concentration above 0, with the affinities and Emax."
      />

      {result && (
        <LabNotice tone="info" title={TYPE_OPTIONS.find((o) => o.value === antagType)?.label}>
          {TYPE_NOTE[antagType]}
        </LabNotice>
      )}

      {result && antagType === "uncompetitive" && (
        // Reported, not corrected — the maths is the original's. Recorded in
        // .claude/redesign-tracker.md.
        <LabNotice tone="warning" title="This model does not distinguish uncompetitive antagonism">
          The uncompetitive expression here, Kd(B)/(Kd(B)+[B]), is algebraically the same as the
          non-competitive one, 1 − [B]/([B]+Kd(B)), so both options return the same number. A true
          uncompetitive antagonist would also shift the EC₅₀ leftward, which this model does not do.
        </LabNotice>
      )}

      <CalcSection title="Antagonism type">
        <ModeSwitch<AntagonismType>
          label="Type of antagonism"
          value={antagType}
          onChange={setAntagType}
          options={TYPE_OPTIONS}
        />
      </CalcSection>

      <CalcSection
        title="Parameters"
        description="Concentrations and affinities. Affinity k is the reciprocal of the dissociation constant Kd."
      >
        <FieldGrid>
          <NumberField
            label={`Agonist [A]`}
            value={agonistConc}
            onChange={setAgonistConc}
            unit={units}
            step="0.1"
            min={0}
            placeholder="e.g. 10"
            hint="Concentration of agonist at the receptor."
            error={fieldError(agonistConc, "Agonist concentration", true)}
          />
          <NumberField
            label={`Antagonist [B]`}
            value={antagonistConc}
            onChange={setAntagonistConc}
            unit={units}
            step="0.1"
            min={0}
            placeholder="e.g. 5"
            hint="Set to 0 to see the agonist alone."
            error={fieldError(antagonistConc, "Antagonist concentration", false)}
          />
          <NumberField
            label="Agonist affinity kₐ"
            value={ka}
            onChange={setKa}
            unit={`${units}⁻¹`}
            step="0.01"
            min={0}
            placeholder="e.g. 0.5"
            hint={result ? `Kd(A) = 1/kₐ = ${result.KdA.toFixed(2)} ${units}` : "Kd(A) = 1/kₐ"}
            error={fieldError(ka, "Agonist affinity", true)}
          />
          <NumberField
            label="Antagonist affinity k_b"
            value={kb}
            onChange={setKb}
            unit={`${units}⁻¹`}
            step="0.01"
            min={0}
            placeholder="e.g. 0.2"
            hint={result ? `Kd(B) = 1/k_b = ${result.KdB.toFixed(2)} ${units}` : "Kd(B) = 1/k_b"}
            error={fieldError(kb, "Antagonist affinity", true)}
          />
          <NumberField
            label="Maximal response Emax"
            value={emax}
            onChange={setEmax}
            unit="%"
            step="1"
            min={0}
            placeholder="e.g. 100"
            hint="The system's ceiling with no antagonist present."
            error={fieldError(emax, "Emax", false)}
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Try an example</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAntagType("competitive");
              setAgonistConc("10");
              setAntagonistConc("5");
              setKa("0.5");
              setKb("0.2");
              setEmax("100");
            }}
          >
            Competitive block
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAntagonistConc("0");
            }}
          >
            Agonist alone
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="The occupancy calculation behind the effect.">
          <div>
            <ResultRow label="Kd(A) = 1 / kₐ" value={result.KdA.toFixed(3)} unit={units} />
            <ResultRow label="Kd(B) = 1 / k_b" value={result.KdB.toFixed(3)} unit={units} />
            <ResultRow label="Fractional occupancy" value={result.occupancy.toFixed(4)} />
            <ResultRow label="Effect = occupancy × Emax" value={result.response.toFixed(1)} unit="%" />
            <ResultRow
              label="EC₅₀ shift (dose ratio)"
              value={`${result.ec50Shift.toFixed(2)}×`}
              badge={result.ec50Shift > 1 ? "Rightward shift" : "No shift"}
              badgeTone={result.ec50Shift > 1 ? "warning" : "secondary"}
            />
          </div>
        </CalcSection>
      )}

      {curveData.length > 0 && (
        <CalcSection
          title="Dose-response curve"
          description="Effect against log agonist concentration, expressed relative to Kd(A). The dashed line is the same agonist with no antagonist present."
        >
          <div className="h-60 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 8, right: 12, bottom: 24, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="logConc"
                  fontSize={11}
                  tickMargin={8}
                  tickFormatter={(v: number) => v.toFixed(0)}
                  label={{ value: "log [A] / Kd(A)", position: "insideBottom", offset: -14, fontSize: 11 }}
                />
                <YAxis fontSize={11} width={48} tickFormatter={(v: number) => v.toFixed(0)} />
                <Tooltip
                  formatter={(v, name) => [
                    `${Number(v).toFixed(1)} %`,
                    name === "response" ? "With antagonist" : "Agonist alone",
                  ]}
                  labelFormatter={(l) => `log [A]/Kd = ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="noAntagonist"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Line type="monotone" dataKey="response" stroke="#1C7BD9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>
          Effect is taken as fractional receptor occupancy multiplied by Emax. Affinities are entered
          as k, so Kd = 1/k throughout.
        </p>
        <p>
          <strong>Competitive</strong> — the Gaddum equation. The antagonist raises the apparent Kd of
          the agonist but not the ceiling:
        </p>
        <Formula>occupancy = [A] / ([A] + Kd(A) × (1 + [B]/Kd(B)))</Formula>
        <p>
          The bracketed term is the Schild dose ratio: the factor by which the agonist concentration
          must rise to restore the original effect.
        </p>
        <Formula>dose ratio = 1 + [B] / Kd(B)</Formula>
        <p>
          <strong>Non-competitive</strong> — occupancy of the agonist site is unchanged, but a
          fraction of receptors is removed from the pool, lowering the attainable maximum:
        </p>
        <Formula>occupancy = [A]/([A] + Kd(A)) × (1 − [B]/([B] + Kd(B)))</Formula>
        <p>
          <strong>Uncompetitive</strong> — written here as [A]/([A]+Kd(A)) × Kd(B)/(Kd(B)+[B]), which
          is the same expression rearranged, so it returns the same value as the non-competitive case.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What does the EC₅₀ shift factor mean?",
            a: "It is the dose ratio: how many times more agonist is needed, in the presence of the antagonist, to produce the effect the agonist alone produced. A factor of 2 means the concentration must double. It is only defined for competitive antagonism, so the other two modes show 1.00×.",
          },
          {
            q: "Why does the competitive curve keep its maximum?",
            a: "Because the block is surmountable. Agonist and antagonist compete for the same site, so raising the agonist concentration far enough restores full occupancy — the curve moves right but does not get shorter.",
          },
          {
            q: "How do I enter affinity if I know Kd?",
            a: "Enter its reciprocal. A Kd of 2 µM is an affinity of 0.5 µM⁻¹; a Kd of 5 µM is 0.2 µM⁻¹. The calculated Kd is shown under each affinity field so you can check it.",
          },
          {
            q: "Why do non-competitive and uncompetitive give the same answer?",
            a: "Because the two expressions used here are algebraically identical. This is a limitation of the model, flagged on screen rather than silently changed; a genuine uncompetitive antagonist would lower Emax and also shift the EC₅₀ to the left.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
