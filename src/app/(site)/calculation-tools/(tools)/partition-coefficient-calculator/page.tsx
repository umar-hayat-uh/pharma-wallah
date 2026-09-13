"use client";

import { useMemo, useRef, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  SelectField,
  TextField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabActions,
  LabNotice,
  type LabReportData,
} from "@/components/calculators";
import {
  CHART,
  CONCENTRATION_UNITS,
  ExampleChips,
  PendingCard,
  ReportSteps,
  ResultTable,
  StatTiles,
  StepBlock,
  chartSvg,
  FIGURE_HEIGHT,
  FIGURE_WIDTH,
  nextRowId,
} from "@/components/calculators/lab-analysis";
import { analysePartition, groupLabels, DEFAULT_REPLICATES } from "./_partition";
import { GRAPHS, groupSteps, groupTable, headline, n4, phTable, regressionEquation, reportSections, type GraphKind } from "./_report";
import { LogDGraph, PhGroupCard, blankPh, blankReadings, type PhState } from "./_parts";

// ─── EXAMPLES (inputs only — every result is calculated) ─────────────────────
//
// Example 1 reproduces the practical sheet's worked group: with Y = 0.0035 + 12.5X,
// B1's mean absorbances give Caq = 0.0066 and CoP ≈ 0.00338 mg/mL, so D ≈ 0.51 and
// log D ≈ −0.29. The absorbances were chosen from Y = a + bX; nothing below is a result.

type ExampleGroup = { aq: string[]; org: string[] };
type Example = {
  label: string;
  unit: string;
  ph: { pH: string; aq: [string, string]; org?: [string, string]; groups: ExampleGroup[] }[];
};

const EXAMPLES: Example[] = [
  {
    label: "Practical sheet: pH 4.5, 6.8, 7.4 (B1–B5)",
    unit: "mg/mL",
    ph: [
      {
        pH: "4.5",
        aq: ["0.0035", "12.5"],
        groups: [
          { aq: ["0.085", "0.086", "0.087"], org: ["0.0456", "0.0457", "0.0459"] },
          { aq: ["0.083", "0.084", "0.084"], org: ["0.0461", "0.0463", "0.0466"] },
        ],
      },
      { pH: "6.8", aq: ["0.0035", "12.5"], groups: [{ aq: ["0.104", "0.106", "0.105"], org: ["0.0262", "0.0258", "0.0265"] }] },
      {
        pH: "7.4",
        aq: ["0.0035", "12.5"],
        groups: [
          { aq: ["0.118", "0.120", "0.119"], org: ["0.0162", "0.0158", "0.0160"] },
          { aq: ["0.121", "0.122", "0.120"], org: ["0.0171", "0.0168", "0.0166"] },
        ],
      },
    ],
  },
  {
    label: "Separate organic-phase equation (2 readings)",
    unit: "µg/mL",
    ph: [
      {
        pH: "5.0",
        aq: ["0.0021", "0.0412"],
        org: ["0.0048", "0.0455"],
        groups: [
          { aq: ["0.372", "0.374"], org: ["0.059", "0.060"] },
          { aq: ["0.368", "0.371"], org: ["0.061", "0.062"] },
        ],
      },
      { pH: "6.0", aq: ["0.0021", "0.0412"], org: ["0.0048", "0.0455"], groups: [{ aq: ["0.248", "0.251"], org: ["0.186", "0.188"] }] },
      { pH: "7.0", aq: ["0.0021", "0.0412"], org: ["0.0048", "0.0455"], groups: [{ aq: ["0.125", "0.127"], org: ["0.345", "0.347"] }] },
    ],
  },
];

/** Readings padded to MAX_REPLICATES so the replicate stepper can grow without losing them. */
function padded(values: string[]): string[] {
  const out = blankReadings();
  values.forEach((v, i) => {
    out[i] = v;
  });
  return out;
}

function fromExample(example: Example): PhState[] {
  return example.ph.map((ph) => ({
    id: nextRowId(),
    pH: ph.pH,
    aqueous: { intercept: ph.aq[0], slope: ph.aq[1] },
    organic: ph.org ? { intercept: ph.org[0], slope: ph.org[1] } : { intercept: "", slope: "" },
    sameEquation: !ph.org,
    replicates: ph.groups[0].aq.length,
    groups: ph.groups.map((g) => ({ id: nextRowId(), aqueous: padded(g.aq), organic: padded(g.org) })),
  }));
}

const DEFAULT_UNIT = "µg/mL";

export default function PartitionCoefficientCalculatorPage() {
  const [sample, setSample] = useState("");
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [phGroups, setPhGroups] = useState<PhState[]>(() => [blankPh(DEFAULT_REPLICATES)]);
  const [submitted, setSubmitted] = useState(false);
  const [graph, setGraph] = useState<GraphKind>("ph");
  const resultRef = useRef<HTMLDivElement>(null);

  const analysis = useMemo(() => analysePartition(phGroups, submitted), [phGroups, submitted]);
  const labels = useMemo(() => groupLabels(phGroups), [phGroups]);
  const results = analysis.results;

  const updatePh = (id: number, fn: (current: PhState) => PhState) =>
    setPhGroups((current) => current.map((ph) => (ph.id === id ? fn(ph) : ph)));

  // A new pH group usually shares the calibration line and replicate count of the
  // last one. They are copied visibly (and said so), never applied behind the scenes.
  const addPh = () =>
    setPhGroups((current) => {
      const last = current[current.length - 1];
      const next = blankPh(last?.replicates ?? DEFAULT_REPLICATES);
      if (last && (last.aqueous.intercept.trim() || last.aqueous.slope.trim())) {
        next.aqueous = { ...last.aqueous };
        next.organic = { ...last.organic };
        next.sameEquation = last.sameEquation;
        next.note = `Calibration copied from pH group ${current.length} — change it if this pH was read against its own line.`;
      }
      return [...current, next];
    });

  // ── Chart data ──
  const chartData = useMemo(() => {
    const group = { ph: [] as { x: number; y: number; series: string }[], inverse: [] as { x: number; y: number; series: string }[] };
    const average = { ph: [] as { x: number; y: number; series: string }[], inverse: [] as { x: number; y: number; series: string }[] };
    results?.forEach((r) => {
      r.groups.forEach((g) => {
        if (!g.logD?.ok) return;
        group.ph.push({ x: r.pH, y: g.logD.value, series: `${g.label} · pH ${r.pHText}` });
        group.inverse.push({ x: r.hydrogen.inverse, y: g.logD.value, series: `${g.label} · pH ${r.pHText}` });
      });
      if (r.average.ok) {
        average.ph.push({ x: r.pH, y: r.average.value, series: `Average log D · pH ${r.pHText}` });
        average.inverse.push({ x: r.hydrogen.inverse, y: r.average.value, series: `Average log D · pH ${r.pHText}` });
      }
    });
    return { group, average };
  }, [results]);

  // ── Report: one description for Copy, PNG and Print ──
  const report = useMemo<LabReportData | null>(() => {
    if (!results || !analysis.regression) return null;
    const regression = analysis.regression[graph];
    const fit = regression.status === "fit" ? regression.fit : null;
    const hasPoints = analysis.points[graph].length > 0;
    const top = headline(results);

    return {
      title: "Partition / Distribution Coefficient",
      context: "Biopharmaceutics · log D and pH",
      sample: sample.trim() || undefined,
      result: top,
      warnings: analysis.warnings,
      sections: reportSections(analysis, unit),
      notes: [
        "D = CoP / Caq is a ratio of concentrations in the same unit, so the unit cancels.",
        "1/log D is the reciprocal of the average log D, as the practical sheet tabulates it — it is not 1/D.",
        "Regression lines use the group-level log D values. Values are rounded for display only; every step uses full precision.",
      ],
      figure: hasPoints
        ? {
            svg: chartSvg({
              xLabel: GRAPHS[graph].xLabel,
              yLabel: "log D",
              includeZeroY: true,
              series: [
                ...(fit
                  ? [{ name: "Regression line", points: [fit.xMin, fit.xMax].map((x) => ({ x, y: fit.slope * x + fit.intercept })), kind: "line" as const, color: CHART.line }]
                  : []),
                { name: "Group log D", points: analysis.points[graph], kind: "points", color: CHART.primary },
                { name: "Average log D per pH", points: analysis.averagePoints[graph], kind: "points", color: CHART.accent },
              ],
            }),
            width: FIGURE_WIDTH,
            height: FIGURE_HEIGHT,
            caption: fit
              ? `${GRAPHS[graph].title}: ${regressionEquation(graph, fit.slope, fit.intercept)}   R² = ${fit.r2 === null ? "undefined" : fit.r2.toFixed(4)}`
              : `${GRAPHS[graph].title}: ${"message" in regression ? regression.message : ""}`,
          }
        : undefined,
    };
  }, [results, analysis, unit, sample, graph]);

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setUnit(DEFAULT_UNIT);
    setGraph("ph");
    setPhGroups([blankPh(DEFAULT_REPLICATES)]);
  };

  const duplicateLabels = useMemo(() => {
    const counts: Record<string, number> = {};
    results?.forEach((r) => {
      counts[r.pHText] = (counts[r.pHText] ?? 0) + 1;
    });
    return counts;
  }, [results]);

  return (
    <CalculatorShell
      title="Partition / Distribution Coefficient Calculator"
      subtitle="D and log D from aqueous and organic phase absorbances at several pH values — average log D, 1/log D, [H+], 1/[H+] and both graphs, with every step shown."
      icon={Layers}
      eyebrow="Biopharmaceutics"
      aside={
        <>
          <CalcAbout title="About the distribution coefficient">
            <p>
              The <strong>distribution coefficient D</strong> is the ratio of drug concentration in the organic
              phase to that in the aqueous phase after shaking to equilibrium at a fixed pH. For an ionisable drug
              only the un-ionised form partitions well, so D — and log D — change with pH.
            </p>
            <CalcList
              title="The practical workflow"
              items={[
                "Read the absorbance of each phase in replicate and average",
                "Convert each average to concentration with X = (Y − a) / b",
                "D = CoP / Caq, then log D = log10(D)",
                "Average log D per pH, then 1/log D, [H+] and 1/[H+]",
                "Plot log D against pH and against 1/[H+]",
              ]}
            />
            <CalcList
              tone="caution"
              title="Read the result carefully"
              items={[
                "A negative concentration means the absorbance is below the intercept — log D is not calculated",
                "1/log D is the reciprocal of average log D, not 1/D",
                "Use the calibration line the phase was actually read against",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <CalcSection title="Experiment">
        <FieldGrid>
          <TextField label="Drug / sample name (optional)" value={sample} onChange={setSample} placeholder="e.g. Salicylic acid, n-octanol / buffer" hint="Printed on the lab record." />
          <SelectField
            label="Concentration unit (X)"
            value={unit}
            onChange={setUnit}
            options={CONCENTRATION_UNITS}
            hint="Shared by every calibration equation on this page. D is a ratio, so the unit cancels."
          />
        </FieldGrid>
        <ExampleChips
          items={EXAMPLES.map((example) => ({
            label: example.label,
            apply: () => {
              setUnit(example.unit);
              setPhGroups(fromExample(example));
            },
          }))}
        />
      </CalcSection>

      {phGroups.map((ph, index) => (
        <PhGroupCard
          key={ph.id}
          ph={ph}
          index={index + 1}
          labels={labels}
          unit={unit}
          onUnit={setUnit}
          show={submitted}
          cellErrors={analysis.cellErrors}
          canRemove={phGroups.length > 1}
          // Only the first pH group's aqueous equation reads a hand-off link from the
          // Calibration Curve Calculator — one line arrives, and it lands in one place.
          readFromUrl={index === 0}
          update={(fn) => updatePh(ph.id, fn)}
          onRemove={() => setPhGroups((current) => current.filter((p) => p.id !== ph.id))}
        />
      ))}

      <Button type="button" variant="outline" className="w-full border-dashed" onClick={addPh}>
        <Plus />
        Add pH group
      </Button>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="partition-coefficient" />

      <div ref={resultRef} className="scroll-mt-24 space-y-4">
        {results && analysis.regression ? (
          <>
            {analysis.warnings.map((warning) => (
              <LabNotice key={warning} tone="warning">{warning}</LabNotice>
            ))}

            <StatTiles
              tiles={results.map((r) => ({
                label: `pH ${r.pHText}${(duplicateLabels[r.pHText] ?? 0) > 1 ? ` (group ${r.index})` : ""} · average log D`,
                value: r.average.ok ? n4(r.average.value) : "—",
                note: r.average.ok
                  ? `1/log D = ${r.reciprocal?.ok ? n4(r.reciprocal.value) : "not calculable"} · n = ${r.used.length}`
                  : "not calculable",
                featured: true,
              }))}
            />

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Summary by pH</h2>
              <ResultTable caption="Average log D, 1/log D, [H+] and 1/[H+] for each pH" {...phTable(results)} highlightColumn={1} />
              <p className="text-xs text-muted-foreground">1/log D is the reciprocal of the average log D — not 1/D. [H+] in mol/L; 1/[H+] in L/mol.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Results by experimental group</h2>
              <ResultTable caption="Absorbance, concentration, D and log D for each experimental group" {...groupTable(results, unit)} highlightColumn={6} />
              <p className="text-xs text-muted-foreground">pH-level values (average log D, 1/log D, [H+], 1/[H+]) are shown on the first group row of each pH.</p>
            </section>

            <Tabs value={graph} onValueChange={(value) => setGraph(value as GraphKind)}>
              <TabsList aria-label="Graphs">
                <TabsTrigger value="ph">pH vs log D</TabsTrigger>
                <TabsTrigger value="inverse">1/[H+] vs log D</TabsTrigger>
              </TabsList>
              <TabsContent value="ph">
                <LogDGraph kind="ph" groupPoints={chartData.group.ph} averagePoints={chartData.average.ph} regression={analysis.regression.ph} />
              </TabsContent>
              <TabsContent value="inverse">
                <LogDGraph kind="inverse" groupPoints={chartData.group.inverse} averagePoints={chartData.average.inverse} regression={analysis.regression.inverse} />
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground">Download card and Print include the graph on the selected tab.</p>

            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
              <h2 className="text-[15px] font-semibold text-foreground">Calculation details</h2>
              {results.map((r) => (
                <div key={r.id} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">pH {r.pHText}</p>
                  {r.groups.map((g) => (
                    <StepBlock
                      key={g.id}
                      title={`${g.label} at pH ${r.pHText}`}
                      badge={g.logD?.ok ? { text: `log D = ${n4(g.logD.value)}`, tone: "ok" } : { text: "log D not calculable", tone: "error" }}
                      steps={groupSteps(r, g, unit)}
                    />
                  ))}
                </div>
              ))}
            </section>

            {report && (
              <FormulaNote title="Full lab record (tables and regression details)">
                <ReportSteps sections={report.sections.filter((s) => s.title.startsWith("Regression") || s.title.startsWith("Calibration") || s.title.startsWith("Absorbance"))} />
              </FormulaNote>
            )}
          </>
        ) : (
          <PendingCard submitted={submitted} message="Enter each pH, its calibration equation and every absorbance reading to calculate D and log D." />
        )}
      </div>

      <FormulaNote>
        <Formula>Average absorbance = (B₁ + B₂ + … + Bₙ) / n</Formula>
        <Formula>Y = a + bX &nbsp;→&nbsp; C = (Y − a) / b</Formula>
        <Formula>D = C(organic phase) / C(aqueous phase) = CoP / Caq</Formula>
        <Formula>log D = log10(D)</Formula>
        <Formula>Average log D = Σ(log D) / number of groups</Formula>
        <Formula>1/log D = 1 / average log D</Formula>
        <Formula>[H+] = 10^(−pH) mol/L &nbsp;·&nbsp; 1/[H+] = 10^(pH) L/mol</Formula>
        <p>
          Y is absorbance (AU), a the intercept and b the slope of the calibration line. The organic phase uses the
          aqueous equation unless you give it its own. Regression on the graphs is ordinary least squares on the
          group log D values.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why is 1/log D not the same as 1/D?", a: "The practical sheet tabulates the reciprocal of the average log D. 1/D would be the aqueous-to-organic ratio, a different quantity. This calculator shows 1/log D exactly as the sheet defines it and never substitutes 1/D." },
          { q: "Why is log D not calculated for one of my groups?", a: "log D needs D > 0, so both Caq and CoP must be positive. A zero or negative concentration means the mean absorbance is at or below the calibration intercept — check the blank, the dilution and the equation. That group is left out of the pH average and the calculator says so." },
          { q: "What is the difference between log P and log D?", a: "log P describes the un-ionised form only and does not depend on pH. log D is measured with whatever mixture of ionised and un-ionised drug exists at the chosen pH, which is why it changes along the pH series." },
          { q: "When is a regression line shown?", a: "Only with at least three valid group log D values spread over at least two different x values. A line through two points always has R² = 1, so no statistic is shown for it." },
        ]}
      />
    </CalculatorShell>
  );
}
