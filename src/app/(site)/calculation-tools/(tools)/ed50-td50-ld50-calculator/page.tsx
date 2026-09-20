"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { Activity, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type ResultTone,
} from "@/components/calculators";
import { runProbitAnalysis, type DoseRow } from "./_probit";

const CLASS_TONE: Record<string, ResultTone> = {
  "HIGHLY TOXIC": "danger",
  TOXIC: "danger",
  "MODERATELY TOXIC": "warning",
  "SLIGHTLY TOXIC": "success",
  "PRACTICALLY NON‑TOXIC": "success",
};

const EXAMPLE_ROWS: DoseRow[] = [
  { dose: "10", response: "10", n: "20" },
  { dose: "20", response: "30", n: "20" },
  { dose: "40", response: "50", n: "20" },
  { dose: "80", response: "80", n: "20" },
];

export default function ProbitAnalysisCalculator() {
  const [rows, setRows] = useState<DoseRow[]>([{ dose: "", response: "", n: "" }]);
  const [animalType, setAnimalType] = useState("rat");
  const [animalWeight, setAnimalWeight] = useState("");
  const [strain, setStrain] = useState("");
  const [testDuration, setTestDuration] = useState("");
  const [routeOfAdmin, setRouteOfAdmin] = useState("oral");
  const [speciesType, setSpeciesType] = useState("rodent");

  const outcome = useMemo(() => runProbitAnalysis(rows), [rows]);
  const result = outcome?.ok ? outcome.result : null;

  // Only nag once the student has actually started entering data, so the page
  // opens on the result card's empty hint rather than an error.
  const startedEntering = rows.some((r) => r.dose || r.response || r.n);
  const errorMessage = outcome && !outcome.ok && startedEntering ? outcome.error : null;

  const addRow = () => setRows([...rows, { dose: "", response: "", n: "" }]);
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };
  const updateRow = (index: number, field: keyof DoseRow, value: string) =>
    setRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  const reset = () => {
    setRows([{ dose: "", response: "", n: "" }]);
    setAnimalType("rat");
    setAnimalWeight("");
    setStrain("");
    setTestDuration("");
    setRouteOfAdmin("oral");
    setSpeciesType("rodent");
  };

  const probitChartData = useMemo(() => {
    if (!result) return [];
    return result.lineData.map((p) => ({
      logDose: parseFloat(p.logDose.toFixed(4)),
      fittedProbit: p.fittedProbit,
    }));
  }, [result]);

  return (
    <CalculatorShell
      title="ED50 / TD50 / LD50 Probit Calculator"
      subtitle="Fits a weighted log-dose/probit regression to quantal dose-response data and reads the median dose, its 95% confidence interval and a goodness-of-fit test off the line."
      icon={Activity}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About probit analysis">
            <p>
              Quantal data — how many animals in each group responded — is not linear against dose.
              Probit analysis transforms the response percentage into normal-equivalent deviates and
              plots them against log dose, which straightens the sigmoid so the median dose can be
              read off a fitted line.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Working an LD50 out of an acute toxicity experiment",
                "Learning how a probit plot linearises a quantal dose-response curve",
                "Showing why 0% and 100% response groups cannot enter the regression",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This tool has known faults in its probit transform — read the warning beside the result before using any number from it.",
                "Groups responding 0% or 100% are excluded from the fit; their probits are infinite.",
                "LD50 values are species-, strain- and route-specific and do not transfer between them.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ResultCard
        label="LD50 (median dose)"
        value={result ? result.ld50.toFixed(1) : null}
        unit="mg/kg"
        interpretation={result ? `${result.classification} · ${result.riskLevel}` : undefined}
        tone={result ? (CLASS_TONE[result.classification] ?? "neutral") : "neutral"}
        empty="Enter at least three dose groups, each with a dose, a response percentage and a sample size."
      />

      {/* The migration copied the maths unchanged; these defects are reported, not
          repaired. Fixing them is logic work — see .claude/redesign-tracker.md. */}
      {result && (
        <LabNotice tone="danger" title="Known faults — do not quote these figures as results">
          <span className="block">
            <strong>ED50 is not calculated separately.</strong> The page reports the LD50 value as
            the ED50, and no TD50 is computed at all, despite the tool&apos;s name.
          </span>
          {result.slopeInverted && (
            <span className="mt-2 block">
              <strong>The fitted slope is negative ({result.slope.toFixed(2)}).</strong> A real
              dose-response line must rise: higher dose, higher response. The probit transform used
              here returns the upper-tail deviate for every proportion, so responses below 50% are
              placed above probit 5 instead of below it, which flips the line. The chi-square
              ({result.chiSquare}) and the confidence interval derived from that slope are unreliable
              for the same reason.
            </span>
          )}
        </LabNotice>
      )}

      {errorMessage && (
        <LabNotice tone="warning" title="Not enough usable data">
          {errorMessage}
        </LabNotice>
      )}

      <CalcSection
        title="Dose-response data"
        description="One row per dose group. Response is the percentage of the group that responded."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Dose (mg/kg)</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Response (%)</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Sample size (n)</th>
                <th className="py-2 text-left font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={row.dose}
                      onChange={(e) => updateRow(i, "dose", e.target.value)}
                      aria-label={`Dose for group ${i + 1}`}
                      placeholder="e.g. 10"
                      className="h-9"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={row.response}
                      onChange={(e) => updateRow(i, "response", e.target.value)}
                      aria-label={`Response percent for group ${i + 1}`}
                      placeholder="e.g. 30"
                      className="h-9"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={row.n}
                      onChange={(e) => updateRow(i, "n", e.target.value)}
                      aria-label={`Sample size for group ${i + 1}`}
                      placeholder="e.g. 20"
                      className="h-9"
                    />
                  </td>
                  <td className="py-2">
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(i)}
                        aria-label={`Remove group ${i + 1}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1.5 h-4 w-4" /> Add dose
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows(EXAMPLE_ROWS)}>
            Load example data
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      <CalcSection
        title="Study conditions"
        description="Recorded with the result for the lab record. These do not enter the calculation."
      >
        <FieldGrid>
          <SelectField
            label="Animal type"
            value={animalType}
            onChange={setAnimalType}
            options={[
              { value: "rat", label: "Rat" },
              { value: "mouse", label: "Mouse" },
              { value: "rabbit", label: "Rabbit" },
            ]}
          />
          <SelectField
            label="Species type"
            value={speciesType}
            onChange={setSpeciesType}
            options={[
              { value: "rodent", label: "Rodent" },
              { value: "non-rodent", label: "Non-rodent" },
            ]}
          />
          <SelectField
            label="Route of administration"
            value={routeOfAdmin}
            onChange={setRouteOfAdmin}
            options={[
              { value: "oral", label: "Oral" },
              { value: "ip", label: "Intraperitoneal" },
              { value: "iv", label: "Intravenous" },
            ]}
          />
          <NumberField
            label="Observation period"
            value={testDuration}
            onChange={setTestDuration}
            unit="days"
            step="1"
            min={0}
            placeholder="e.g. 14"
            hint="Acute studies conventionally run 14 days."
          />
          <NumberField
            label="Animal weight"
            value={animalWeight}
            onChange={setAnimalWeight}
            unit="g"
            step="1"
            min={0}
            placeholder="e.g. 200"
          />
          <TextField label="Strain" value={strain} onChange={setStrain} placeholder="e.g. Wistar" />
        </FieldGrid>
      </CalcSection>

      {result && (
        <CalcSection title="Regression results" description="The fitted probit line and what follows from it.">
          <div>
            <ResultRow label="LD50" value={result.ld50.toFixed(1)} unit="mg/kg" />
            <ResultRow
              label="95% confidence interval"
              value={`${result.confidenceInterval.lower.toFixed(1)} – ${result.confidenceInterval.upper.toFixed(1)}`}
              unit="mg/kg"
            />
            <ResultRow label="ED50 as reported" value={result.ed50.toFixed(1)} unit="mg/kg" badge="= LD50" badgeTone="destructive" />
            <ResultRow label="TD50" value="Not calculated" badge="missing" badgeTone="destructive" />
            <ResultRow label="Slope (b)" value={result.slope.toFixed(4)} badge={result.slopeInverted ? "inverted" : undefined} badgeTone="destructive" />
            <ResultRow label="Intercept (a)" value={result.intercept.toFixed(4)} />
            <ResultRow label="Fitted line" value={result.probitLineEquation} />
            <ResultRow label="Chi-square" value={result.chiSquare} badge={result.goodnessOfFit} badgeTone={result.goodnessOfFit.startsWith("GOOD") ? "success" : "destructive"} />
            <ResultRow label="Toxicity class (Hodge & Sterner)" value={`${result.classification} — ${result.riskLevel}`} />
          </div>
        </CalcSection>
      )}

      {result && probitChartData.length > 0 && (
        <CalcSection
          title="Probit plot"
          description="Observed probits against log dose, with the fitted regression line."
        >
          <div className="h-60 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 8, right: 12, bottom: 26, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="logDose"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  fontSize={11}
                  tickMargin={8}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: "log₁₀ dose (mg/kg)", position: "insideBottom", offset: -16, fontSize: 11 }}
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  dataKey="fittedProbit"
                  fontSize={11}
                  width={48}
                  tickFormatter={(v: number) => v.toFixed(1)}
                  label={{ value: "Probit", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <Tooltip formatter={(v) => [Number(v).toFixed(3), "Probit"]} labelFormatter={(l) => `log dose = ${l}`} />
                <Line
                  data={probitChartData}
                  type="monotone"
                  dataKey="fittedProbit"
                  stroke="#1C7BD9"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                  name="Fitted line"
                />
                <Scatter
                  data={result.scatterData.map((s) => ({ logDose: s.logDose, fittedProbit: s.observedProbit }))}
                  dataKey="fittedProbit"
                  fill="#0f172a"
                  isAnimationActive={false}
                  name="Observed"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      {result && result.mortalityRates.length > 0 && (
        <CalcSection title="Observed vs. expected response" description="How closely the fitted line reproduces each dose group.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Dose (mg/kg)</th>
                  <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Observed (%)</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Expected (%)</th>
                </tr>
              </thead>
              <tbody>
                {result.mortalityRates.map((m) => (
                  <tr key={m.dose} className="border-b border-border/60 last:border-b-0">
                    <td className="py-2 pr-3 tabular-nums">{m.dose}</td>
                    <td className="py-2 pr-3 tabular-nums">{m.observed.toFixed(1)}</td>
                    <td className="py-2 tabular-nums">{m.expected.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcSection>
      )}

      <FormulaNote title="How this is calculated">
        <p>
          Each group&apos;s response proportion p is converted to a probit — the standard normal
          deviate of p, shifted by 5 so ordinary values stay positive — and regressed against log
          dose, weighted by n·p·(1−p):
        </p>
        <Formula>Probit(p) = a + b × log₁₀(Dose)</Formula>
        <p>
          The median dose is the dose at probit 5 (50% response), so log(LD50) = (5 − a) / b. The 95%
          interval is that log value ± 1.96 standard errors, converted back out of logs.
        </p>
        <p>
          Goodness of fit is a chi-square comparing observed with expected responders, against a
          critical value for the degrees of freedom (number of usable points − 2). Toxicity bands are
          Hodge &amp; Sterner: highly toxic below 1 mg/kg, toxic to 50, moderately toxic to 500,
          slightly toxic to 5000, practically non-toxic above that.
        </p>
        <p>
          <strong>Caveat.</strong> The probit routine here returns the upper-tail deviate for every
          proportion instead of negating it below p = 0.5, so the fitted slope comes out with the
          wrong sign on real data. The numbers are reproduced exactly as the previous version of this
          page produced them; they have not been corrected.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why is the slope negative?",
            a: "It should not be — a higher dose must give a higher response. It is negative because of the probit transform fault described above the results: proportions below 50% are mapped above probit 5 rather than below it, which inverts the line. Treat the fitted slope, the chi-square and the confidence interval as unreliable.",
          },
          {
            q: "Why does the ED50 equal the LD50?",
            a: "Because the page assigns the LD50 value to the ED50 rather than fitting a separate effective-dose curve. A genuine ED50 needs its own quantal data for the therapeutic effect, not the lethal one. No TD50 is produced at all.",
          },
          {
            q: "Why were some of my dose groups ignored?",
            a: "Groups with a 0% or 100% response have no finite probit, so they cannot enter the regression. They still appear in the observed-versus-expected table. You need at least two groups strictly between 0% and 100%, and at least three valid rows overall.",
          },
          {
            q: "What does the weighting do?",
            a: "Each point is weighted by n·p·(1−p), which is largest near 50% response and smallest at the extremes. That gives most influence to the groups that pin down the median dose, and least to groups near the ends where a single animal swings the percentage a long way.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
