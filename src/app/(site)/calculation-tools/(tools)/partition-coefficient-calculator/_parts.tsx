"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CartesianGrid, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberField, formatScientific, formatSig } from "@/components/calculators";
import {
  AXIS_TICK,
  CHART,
  CalibrationFields,
  ChartLegend,
  ChartPanel,
  CountStepper,
  DataTable,
  makeTooltip,
  niceAxis,
  nextRowId,
  tickLabel,
  type Point,
} from "@/components/calculators/lab-analysis";
import {
  MAX_PH,
  MAX_REPLICATES,
  MIN_PH,
  MIN_REPLICATES,
  pHError,
  type ExperimentalGroupInput,
  type PhGroupInput,
  type Regression,
} from "./_partition";
import { GRAPHS, regressionEquation, type GraphKind } from "./_report";

/* ─── State helpers ──────────────────────────────────────────────────────── */

/** A pH group plus a UI-only note (e.g. "equation copied from pH group 1"). */
export type PhState = PhGroupInput & { note?: string };

export const blankReadings = () => Array.from({ length: MAX_REPLICATES }, () => "");

export const blankGroup = (): ExperimentalGroupInput => ({ id: nextRowId(), aqueous: blankReadings(), organic: blankReadings() });

export const blankPh = (replicates = 3): PhState => ({
  id: nextRowId(),
  pH: "",
  aqueous: { intercept: "", slope: "" },
  organic: { intercept: "", slope: "" },
  sameEquation: true,
  replicates,
  groups: [blankGroup()],
});

/* ─── One pH group ───────────────────────────────────────────────────────── */

export function PhGroupCard({
  ph,
  index,
  labels,
  unit,
  onUnit,
  show,
  cellErrors,
  canRemove,
  readFromUrl,
  update,
  onRemove,
}: {
  ph: PhState;
  index: number;
  labels: Record<number, string>;
  unit: string;
  onUnit: (unit: string) => void;
  show: boolean;
  cellErrors: Record<string, string>;
  canRemove: boolean;
  /** Only the first pH group's aqueous equation consumes the calibration hand-off link. */
  readFromUrl: boolean;
  update: (fn: (current: PhState) => PhState) => void;
  onRemove: () => void;
}) {
  const first = labels[ph.groups[0]?.id];
  const last = labels[ph.groups[ph.groups.length - 1]?.id];

  const setGroup = (groupId: number, fn: (g: ExperimentalGroupInput) => ExperimentalGroupInput) =>
    update((current) => ({ ...current, groups: current.groups.map((g) => (g.id === groupId ? fn(g) : g)) }));

  return (
    <Card className="space-y-5 rounded-2xl border-border/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:text-base">
          <span className="h-3.5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
          pH group {index}
          {ph.pH.trim() !== "" && !pHError(ph.pH, false) && <span className="font-normal text-muted-foreground">· pH {ph.pH.trim()}</span>}
        </h2>
        <Badge variant="secondary">{first === last ? first : `${first}–${last}`}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto text-muted-foreground hover:text-destructive"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 />
          Remove pH group
        </Button>
      </div>

      {ph.note && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">{ph.note}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="pH of the aqueous phase"
          value={ph.pH}
          onChange={(value) => update((c) => ({ ...c, pH: value }))}
          min={MIN_PH}
          max={MAX_PH}
          placeholder="e.g. 7.4"
          error={cellErrors[`${ph.id}:pH`]}
          hint={`${MIN_PH}–${MAX_PH}`}
        />
        <CountStepper
          label="Replicate readings per phase"
          value={ph.replicates}
          min={MIN_REPLICATES}
          max={MAX_REPLICATES}
          onChange={(value) => update((c) => ({ ...c, replicates: value }))}
          hint={`${MIN_REPLICATES}–${MAX_REPLICATES}; applies to every group at this pH.`}
        />
      </div>

      <div className="space-y-3 rounded-xl border bg-muted/30 p-3 sm:p-4">
        <CalibrationFields
          title={ph.sameEquation ? "Calibration equation (aqueous and organic phase)" : "Aqueous phase equation"}
          intercept={ph.aqueous.intercept}
          slope={ph.aqueous.slope}
          unit={unit}
          onIntercept={(value) => update((c) => ({ ...c, aqueous: { ...c.aqueous, intercept: value } }))}
          onSlope={(value) => update((c) => ({ ...c, aqueous: { ...c.aqueous, slope: value } }))}
          onUnit={onUnit}
          show={show}
          readFromUrl={readFromUrl}
        />
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border bg-card px-3.5 py-2.5">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
            checked={ph.sameEquation}
            onChange={(event) => {
              const checked = event.target.checked;
              update((c) => ({ ...c, sameEquation: checked }));
            }}
          />
          <span className="text-sm">
            <span className="font-medium text-foreground">Organic phase uses the same equation</span>
            <span className="block text-xs text-muted-foreground">
              {ph.sameEquation
                ? "CoP is calculated with the equation above. Untick if the organic phase was read against its own calibration line."
                : "CoP is calculated with the organic phase equation below."}
            </span>
          </span>
        </label>
        {!ph.sameEquation && (
          <CalibrationFields
            title="Organic phase equation"
            intercept={ph.organic.intercept}
            slope={ph.organic.slope}
            unit={unit}
            onIntercept={(value) => update((c) => ({ ...c, organic: { ...c.organic, intercept: value } }))}
            onSlope={(value) => update((c) => ({ ...c, organic: { ...c.organic, slope: value } }))}
            onUnit={onUnit}
            show={show}
            readFromUrl={false}
          />
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">
          Experimental groups <span className="font-normal text-muted-foreground">— absorbance readings (AU)</span>
        </p>
        {ph.groups.map((group) => {
          const label = labels[group.id];
          const rows = Array.from({ length: ph.replicates }, (_, i) => ({
            id: i,
            cells: { aq: group.aqueous[i] ?? "", org: group.organic[i] ?? "" },
          }));
          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{label}</span>
                <span className="text-xs text-muted-foreground">pH {ph.pH.trim() || "—"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-destructive"
                  disabled={ph.groups.length <= 1}
                  onClick={() => update((c) => ({ ...c, groups: c.groups.filter((g) => g.id !== group.id) }))}
                >
                  <Trash2 />
                  Remove group
                </Button>
              </div>
              <DataTable
                caption={`${label} absorbance readings, aqueous and organic phase`}
                columns={[
                  { key: "aq", header: "Aqueous", unit: "AU", placeholder: "0.000" },
                  { key: "org", header: "Organic", unit: "AU", placeholder: "0.000" },
                ]}
                rows={rows}
                rowHeader={(i) => `${label} · R${i + 1}`}
                onCell={(readingIndex, key, value) =>
                  setGroup(group.id, (g) => {
                    const phase = key === "aq" ? "aqueous" : "organic";
                    const next = [...g[phase]];
                    next[readingIndex] = value;
                    return { ...g, [phase]: next };
                  })
                }
                cellError={(i, key) => cellErrors[`${group.id}:${i}:${key}`]}
                rowMessage={(i) => {
                  const aq = cellErrors[`${group.id}:${i}:aq`];
                  const org = cellErrors[`${group.id}:${i}:org`];
                  if (!aq && !org) return undefined;
                  return { tone: "error", text: [aq && `Aqueous: ${aq}`, org && `Organic: ${org}`].filter(Boolean).join(" ") };
                }}
              />
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={() => update((c) => ({ ...c, groups: [...c.groups, blankGroup()] }))}
        >
          <Plus />
          Add experimental group
        </Button>
      </div>
    </Card>
  );
}

/* ─── Graphs ─────────────────────────────────────────────────────────────── */

type Datum = Point & { series: string };

/** Tick text that never overflows: "2.5 × 10⁷" instead of "25000000". */
function axisTick(value: number, ticks: number[]): string {
  const text = tickLabel(value, ticks);
  return /e/.test(text) ? formatScientific(value, 2) : text;
}

export function LogDGraph({
  kind,
  groupPoints,
  averagePoints,
  regression,
}: {
  kind: GraphKind;
  groupPoints: Datum[];
  averagePoints: Datum[];
  regression: Regression;
}) {
  const graph = GRAPHS[kind];
  const fit = regression.status === "fit" ? regression.fit : null;

  const axes = useMemo(() => {
    const xs = [...groupPoints, ...averagePoints].map((p) => p.x);
    // 1/[H+] spans orders of magnitude: fewer, wider ticks so labels do not collide on a phone.
    const xAxis = niceAxis(xs, { includeZero: kind === "inverse", target: kind === "inverse" ? 4 : 6 });
    const line = fit ? [fit.xMin, fit.xMax].map((x) => ({ x, y: fit.slope * x + fit.intercept, series: "Regression line" })) : [];
    // log D = 0 (D = 1, equal distribution) is always on the axis.
    const yAxis = niceAxis([...groupPoints, ...averagePoints, ...line].map((p) => p.y), { includeZero: true });
    return { xAxis, yAxis, line };
  }, [groupPoints, averagePoints, fit, kind]);

  const Tip = useMemo(
    () =>
      makeTooltip([
        { key: "x", label: graph.xLabel, format: (v) => (kind === "inverse" ? formatScientific(v, 4) : formatSig(v, 4)) },
        { key: "y", label: "log D", format: (v) => formatSig(v, 4).replace(/^-/, "−") },
      ]),
    [graph.xLabel, kind],
  );

  return (
    <ChartPanel
      title={graph.title}
      heightClass="h-[350px]"
      footer={
        <div className="space-y-2">
          {fit ? (
            <div className="space-y-1">
              <p className="font-mono text-[13px] text-foreground">{regressionEquation(kind, fit.slope, fit.intercept)}</p>
              <p className="tabular-nums">
                Slope {formatSig(fit.slope, 4).replace(/^-/, "−")} · Intercept {formatSig(fit.intercept, 4).replace(/^-/, "−")} · R²{" "}
                {fit.r2 === null ? "undefined (every log D identical)" : fit.r2.toFixed(4)} · n = {fit.n} group values
              </p>
            </div>
          ) : (
            <p className="font-medium text-amber-800">{"message" in regression ? regression.message : null}</p>
          )}
          <ChartLegend
            items={[
              { label: "Group log D", color: CHART.primary, shape: "dot" },
              { label: "Average log D per pH", color: CHART.accent, shape: "diamond" },
              ...(fit ? [{ label: "Regression line (group values)", color: CHART.line, shape: "line" as const }] : []),
            ]}
          />
        </div>
      }
    >
      <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 8 }}>
        <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          domain={axes.xAxis.domain}
          ticks={axes.xAxis.ticks}
          tickFormatter={(v: number) => axisTick(v, axes.xAxis.ticks)}
          tick={AXIS_TICK}
          stroke={CHART.axis}
          label={{ value: graph.xLabel, position: "insideBottom", offset: -16, fontSize: 12, fill: CHART.ink }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={axes.yAxis.domain}
          ticks={axes.yAxis.ticks}
          tickFormatter={(v: number) => axisTick(v, axes.yAxis.ticks)}
          tick={AXIS_TICK}
          stroke={CHART.axis}
          width={56}
          label={{ value: "log D", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: CHART.ink, style: { textAnchor: "middle" } }}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={(props) => <Tip active={props.active} payload={props.payload} />} />
        {fit && (
          <Scatter
            name="Regression line"
            data={axes.line}
            line={{ stroke: CHART.line, strokeWidth: 2 }}
            shape={() => <g />}
            legendType="none"
            isAnimationActive={false}
          />
        )}
        <Scatter name="Group log D" data={groupPoints} fill={CHART.primary} stroke="#fff" strokeWidth={1.5} isAnimationActive={false} />
        <Scatter name="Average log D per pH" data={averagePoints} fill={CHART.accent} shape="diamond" isAnimationActive={false} />
      </ScatterChart>
    </ChartPanel>
  );
}
