"use client";

import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalcSection, FieldGrid } from "../CalculatorShell";
import { NumberField } from "../NumberField";
import { ResultCard } from "../ResultCard";
import { LabActions, type LabReportData } from "../LabReport";
import { LabNotice, TextField } from "../LabFields";
import { IS_MOBILE_APP } from "../lab-math";
import { describeRf, formatCm, formatPx, formatRf } from "./rf";
import type { PlateAnalysis } from "./types";

/**
 * TLC Analysis Results: the solvent run, one row per confirmed spot, the
 * optional cm calibration, and the lab-record actions. Values outside 0–1 are
 * shown with a warning, never hidden.
 */
export function TLCResults({
  analysis,
  decimals,
  onDecimals,
  calibration,
  calibrationError,
  onCalibration,
  sample,
  onSample,
  report,
  onReset,
  onDownloadPlate,
  onSave,
  saveStatus,
  pendingSpots,
}: {
  analysis: PlateAnalysis;
  decimals: 2 | 3;
  onDecimals: (d: 2 | 3) => void;
  calibration: string;
  calibrationError?: string;
  onCalibration: (value: string) => void;
  sample: string;
  onSample: (value: string) => void;
  report: LabReportData | null;
  onReset: () => void;
  onDownloadPlate: () => void;
  onSave: () => void;
  saveStatus: string;
  /** Detected spots the student has not confirmed yet. */
  pendingSpots: number;
}) {
  const calibrated = analysis.pixelsPerCm !== null;
  const run = analysis.solventDistancePx;
  const single = analysis.rows.length === 1 ? analysis.rows[0] : null;
  const anyWarning = analysis.rows.some((r) => r.result.warning);
  // Bands (describeRf) are read from the value as displayed, so "0.30" is never labelled "Polar" (< 0.3).

  return (
    <div className="space-y-4 sm:space-y-5">
      {analysis.errors.map((error) => (
        <LabNotice key={error} tone="danger">
          {error}
        </LabNotice>
      ))}

      <ResultCard
        label={single ? `Rf · ${single.spot.name}` : "Baseline → solvent front"}
        value={
          analysis.errors.length
            ? null
            : single
              ? formatRf(single.result.rf, decimals)
              : run !== null
                ? calibrated
                  ? formatCm(run / analysis.pixelsPerCm!).replace(" cm", "")
                  : String(Math.round(run))
                : null
        }
        unit={single ? undefined : calibrated ? "cm" : "px"}
        tone={anyWarning ? "warning" : analysis.rows.length ? "success" : "neutral"}
        interpretation={
          single && single.result.rf !== null
            ? single.result.warning
              ? "Check the spot and solvent-front positions."
              : describeRf(Number(formatRf(single.result.rf, decimals)))
            : analysis.rows.length
              ? `${analysis.rows.length} spot${analysis.rows.length === 1 ? "" : "s"} measured${calibrated && run !== null ? ` · ${formatPx(run)}` : ""}`
              : "No confirmed spots yet"
        }
        empty={analysis.errors.length ? "No Rf until the lines are fixed — see above." : "Set the baseline and the solvent front to measure the plate."}
      />

      {analysis.warnings.map((warning) => (
        <LabNotice key={warning} tone="warning">
          {warning}
        </LabNotice>
      ))}
      {pendingSpots > 0 && (
        <LabNotice tone="info">
          {pendingSpots === 1 ? "One detected spot is" : `${pendingSpots} detected spots are`} not confirmed and
          not included below. Confirm them in the spot list.
        </LabNotice>
      )}

      <CalcSection title="TLC analysis results" description="Distances from the baseline to the centre of each spot.">
        {run !== null && (
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-muted/50 px-3.5 py-3">
            <span className="text-sm text-muted-foreground">Baseline → solvent front</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatPx(run)}
              {calibrated && <span className="ml-2 font-normal text-muted-foreground">= {formatCm(run / analysis.pixelsPerCm!)}</span>}
            </span>
          </div>
        )}

        {analysis.errors.length > 0 ? (
          // A table of dashes says nothing; the error above says what to fix.
          <p className="text-sm text-muted-foreground">Fix the lines on the plate to see each spot&apos;s Rf.</p>
        ) : analysis.rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No confirmed spots. Detect spots or add them with the Spot tool, then confirm them.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[18rem] text-sm">
              <thead>
                <tr className="border-b text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Spot</th>
                  <th className="py-2 pr-3 text-right font-medium">Distance</th>
                  <th className="py-2 text-right font-medium">Rf</th>
                </tr>
              </thead>
              <tbody>
                {analysis.rows.map((row) => (
                  <tr key={row.spot.id} className="border-b border-border/70 last:border-b-0 align-top">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-700 text-xs font-bold text-white">
                          {row.index + 1}
                        </span>
                        <span className="font-medium text-foreground [overflow-wrap:anywhere]">{row.spot.name}</span>
                      </span>
                      {row.result.warning && <p className="mt-1 text-xs text-amber-700">{row.result.warning}</p>}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">
                      {calibrated ? (
                        <>
                          <span className="block font-medium">{formatCm(row.distanceCm)}</span>
                          <span className="block text-xs text-muted-foreground">{formatPx(row.result.compoundDistance)}</span>
                        </>
                      ) : (
                        formatPx(row.result.compoundDistance)
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <span className={cn("text-base font-bold tabular-nums", row.result.warning ? "text-amber-700" : "text-foreground")}>
                        {formatRf(row.result.rf, decimals)}
                      </span>
                      {row.result.rf !== null && !row.result.warning && (
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {describeRf(Number(formatRf(row.result.rf, decimals))).split(" – ")[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Decimal places</span>
          <div role="radiogroup" aria-label="Decimal places" className="inline-flex rounded-xl bg-muted p-1">
            {([2, 3] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={decimals === d}
                onClick={() => onDecimals(d)}
                className={cn(
                  "h-10 min-w-[3.25rem] rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  decimals === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {d === 2 ? "0.00" : "0.000"}
              </button>
            ))}
          </div>
        </div>
      </CalcSection>

      <CalcSection
        title="Physical distance calibration"
        description="Optional. Rf needs no calibration — enter the solvent-front distance you measured with a ruler to see distances in cm too."
      >
        <FieldGrid>
          <NumberField
            label="Measured solvent front distance"
            value={calibration}
            onChange={onCalibration}
            unit="cm"
            step="0.1"
            min={0}
            placeholder="e.g. 6"
            error={calibrationError}
            hint={
              calibrated
                ? `${analysis.pixelsPerCm!.toFixed(2)} px per cm on this image.`
                : "Baseline to solvent front, measured on the plate."
            }
          />
          <TextField
            label="Plate / sample name"
            value={sample}
            onChange={onSample}
            placeholder="e.g. Aspirin purity, 7:3 hexane:EtOAc"
            hint="Printed on the lab record and used when saving."
          />
        </FieldGrid>
      </CalcSection>

      <LabActions report={report} onReset={onReset} fileName="tlc-rf-analysis">
        {!IS_MOBILE_APP && (
          <Button variant="outline" disabled={!report} onClick={onDownloadPlate}>
            <Download />
            Annotated plate
          </Button>
        )}
        <Button variant="outline" onClick={onSave} disabled={analysis.errors.length > 0}>
          <Save />
          Save analysis
        </Button>
      </LabActions>
      {saveStatus && (
        <div aria-live="polite" className="-mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="secondary">On this device</Badge>
          <span>{saveStatus}</span>
        </div>
      )}
    </div>
  );
}
