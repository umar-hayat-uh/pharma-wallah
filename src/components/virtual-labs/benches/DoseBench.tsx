"use client";

/** Lab 3 bench controls — graded dose–response on a simulated isolated tissue. */
import { useMemo, useState } from "react";
import { molarLabel } from "@/lib/virtual-labs/calculations/doseResponse";
import { MODEL, VARIABLE_OPTIONS, stockFor, tableRows, type DoseAction, type DoseState } from "@/lib/virtual-labs/experiments/doseResponse";
import { Btn, Choice, ReadingField, Section } from "../interface/ui";
import { Lcd } from "./instruments2d";
import type { BenchProps } from "./types";

export function DoseBench({ s, act, stepId, done }: BenchProps<DoseState, DoseAction>) {
  const [ind, setInd] = useState<string | null>(null);
  const [dep, setDep] = useState<string | null>(null);
  const [conc, setConc] = useState<number>(MODEL.concentrations[0]);
  const pending = s.trials.find((t) => t.recordedMm === null);
  return (
    <div className="space-y-2">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Simulated observations from a documented teaching model — not animal or patient data. Concentrations are organ-bath concentrations, not doses.</p>
      <Section title="1 · Inspect the apparatus" current={stepId === "inspect"} done={done("inspect")}>
        <p className="text-sm text-[#3a3f47]">Select each item — in the room, the Steps list or the Equipment tab.</p>
      </Section>

      <Section title="2 · Define the experiment" current={stepId === "design"} done={done("design")}>
        <p className="text-sm font-semibold">Independent variable (what you change)</p>
        <Choice name="Independent variable" value={ind} onChange={setInd} options={VARIABLE_OPTIONS.independent.map((o) => ({ id: o.id, label: o.text }))} />
        <p className="text-sm font-semibold">Dependent variable (what you measure)</p>
        <Choice name="Dependent variable" value={dep} onChange={setDep} options={VARIABLE_OPTIONS.dependent.map((o) => ({ id: o.id, label: o.text }))} />
        <Btn size="sm" variant="primary" disabled={!ind || !dep || s.variablesOk} onClick={() => act({ type: "variables", independent: ind!, dependent: dep! })}>Confirm</Btn>
      </Section>

      <Section title="3 · Set up the bath" current={stepId === "setup"} done={done("setup")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "fillBath" })} disabled={s.bathFilled}>Fill with salt solution</Btn>
          <Btn size="sm" variant={s.thermostatOn ? "soft" : "secondary"} onClick={() => act({ type: "thermostat", on: !s.thermostatOn })}>Circulator {s.thermostatOn ? "on (37 °C)" : "off"}</Btn>
          <Btn size="sm" variant={s.aerationOn ? "soft" : "secondary"} onClick={() => act({ type: "aeration", on: !s.aerationOn })}>Aeration {s.aerationOn ? "on" : "off"}</Btn>
          <Btn size="sm" onClick={() => act({ type: "mountTissue" })} disabled={s.tissueMounted}>Mount the tissue</Btn>
          <Btn size="sm" onClick={() => act({ type: "setTension" })} disabled={s.tensionSet}>Set 1 g resting tension</Btn>
          <Btn size="sm" onClick={() => act({ type: "zeroRecorder" })} disabled={s.recorderZeroed}>Zero the recorder</Btn>
        </div>
      </Section>

      <Section title="4 · Equilibrate" current={stepId === "equilibrate"} done={done("equilibrate")}>
        <div className="grid grid-cols-2 gap-2">
          <Lcd value={`${s.tempC.toFixed(1)} °C`} sub="bath" tone="blue" />
          <Lcd value={`${s.equilibratedMin} min`} sub="equilibration" tone="blue" />
        </div>
        <div className="flex flex-wrap gap-2">{[1, 2, 5, 10].map((m) => <Btn key={m} size="sm" onClick={() => act({ type: "wait", minutes: m })}>Wait {m} min</Btn>)}</div>
      </Section>

      <Section title="5 · Run the trials" current={stepId === "trials"} done={done("trials")}>
        <label className="block text-sm font-semibold">
          Bath concentration
          <select value={conc} onChange={(e) => setConc(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 bg-white px-3">
            {MODEL.concentrations.map((c) => {
              const st = stockFor(c);
              return <option key={c} value={c}>{molarLabel(c)} — {st.ul} µL of {molarLabel(st.stock)} stock</option>;
            })}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" variant="primary" onClick={() => act({ type: "addDose", c: conc })}>Add to the bath</Btn>
          <Btn size="sm" onClick={() => act({ type: "wash" })}>Wash out (×3)</Btn>
          {[1, 2].map((m) => <Btn key={m} size="sm" variant="ghost" onClick={() => act({ type: "wait", minutes: m })}>Rest {m} min</Btn>)}
        </div>
        <RecorderStrip trace={s.trials.map((t) => t.trueMm)} pending={!!pending} />
        <ReadingField label="Peak height of the latest response" unit="mm" placeholder="0.0" onSubmit={(value) => act({ type: "recordResponse", value })} disabled={!pending} hint="Baseline to the top of the peak, to the nearest 0.5 mm." />
        <DataTable s={s} />
      </Section>

      <Section title="6 · Plot the curve" current={stepId === "plot"} done={done("plot")}>
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => act({ type: "plot", axis: "linear" })}>Plot: linear axis</Btn>
          <Btn size="sm" onClick={() => act({ type: "plot", axis: "log" })}>Plot: log axis</Btn>
        </div>
        {(s.plottedLinear || s.plottedLog) && <Graph s={s} />}
      </Section>

      <Section title="7 · Estimate Emax and EC50" current={stepId === "analyse"} done={done("analyse")}>
        {s.plottedLog && <Graph s={s} guide forceLog />}
        <EstimateForm disabled={s.logEc50Entered !== null} onSubmit={(emaxMm, logEc50) => act({ type: "estimate", emaxMm, logEc50 })} />
      </Section>

      <Section title="8 · Find the unknown concentration" current={stepId === "unknown"} done={done("unknown")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "wash" })}>Wash out (×3)</Btn>
          <Btn size="sm" variant="primary" onClick={() => act({ type: "addUnknown" })}>Add test sample U</Btn>
        </div>
        <RecorderStrip trace={s.trials.map((t) => t.trueMm)} pending={!!pending} />
        <ReadingField label="Peak height for sample U" unit="mm" placeholder="0.0" onSubmit={(value) => act({ type: "recordResponse", value })} disabled={!pending} />
        {s.logEc50Entered !== null && <Graph s={s} guide forceLog />}
        <ReadingField label="log concentration of U (read from your curve)" placeholder="e.g. −6.9" onSubmit={(logC) => act({ type: "estimateUnknown", logC })} disabled={s.unknownLogEntered !== null} buttonLabel="Submit" />
      </Section>
    </div>
  );
}

/** The recorder trace with a millimetre grid — the student measures the latest peak. */
export function RecorderStrip({ trace, pending }: { trace: number[]; pending: boolean }) {
  const shown = trace.slice(-6);
  const W = 360;
  const H = 230;
  const base = 210;
  const k = 4; // px per mm
  const step = (W - 40) / 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-[#fbfdff]" role="img" aria-label={`Recorder trace of the last ${shown.length} responses with a millimetre grid. ${pending ? "The latest peak is waiting to be measured." : ""}`}>
      {Array.from({ length: 51 }, (_, mm) => (
        <g key={mm}>
          <line x1="34" x2={W - 4} y1={base - mm * k} y2={base - mm * k} stroke={mm % 5 === 0 ? "#b9c9d8" : "#e3ebf2"} strokeWidth={mm % 5 === 0 ? 1 : 0.6} />
          {mm % 10 === 0 && <text x="4" y={base - mm * k + 4} fontSize="10" fill="#4a4f57">{mm}</text>}
        </g>
      ))}
      <text x="4" y="12" fontSize="9" fill="#4a4f57">mm</text>
      <path
        d={
          `M34 ${base} ` +
          shown
            .map((mm, i) => {
              const x0 = 34 + i * step;
              return `L${x0 + step * 0.2} ${base} L${x0 + step * 0.32} ${base - mm * k} L${x0 + step * 0.46} ${base - mm * k * 0.985} L${x0 + step * 0.62} ${base} L${x0 + step} ${base}`;
            })
            .join(" ")
        }
        fill="none"
        stroke="#1C7BD9"
        strokeWidth="1.8"
      />
      {pending && shown.length > 0 && <circle cx={34 + (shown.length - 1) * step + step * 0.39} cy={base - shown[shown.length - 1] * k - 8} r="4" fill="#21B67A" />}
    </svg>
  );
}

function DataTable({ s }: { s: DoseState }) {
  const rows = tableRows(s);
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-[#16181d]/10">
      <table className="w-full text-left text-sm tabular-nums">
        <thead className="bg-[#16181d]/[0.03] text-xs uppercase tracking-wide text-[#4a4f57]">
          <tr><th className="px-2 py-1.5">Conc.</th><th className="px-2 py-1.5">log C</th><th className="px-2 py-1.5">Response</th><th className="px-2 py-1.5">% max</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.c} className="border-t border-[#16181d]/[0.06]"><td className="px-2 py-1">{molarLabel(r.c)}</td><td className="px-2 py-1">{r.logC.toFixed(1)}</td><td className="px-2 py-1">{r.mean.toFixed(1)} mm{r.n > 1 ? ` (n=${r.n})` : ""}</td><td className="px-2 py-1">{r.pct.toFixed(0)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Response vs concentration, linear or log axis, with an optional movable read-off guide. */
export function Graph({ s, guide, forceLog }: { s: DoseState; guide?: boolean; forceLog?: boolean }) {
  const [log, setLog] = useState(forceLog || s.plottedLog);
  const [gy, setGy] = useState(23);
  const rows = tableRows(s);
  const W = 360;
  const H = 240;
  const L = 40;
  const B = 205;
  const T = 12;
  const R = W - 10;
  const xmin = log ? -9.5 : 0;
  const xmax = log ? -4.5 : Math.max(...rows.map((r) => r.c)) * 1.05;
  const ymax = 50;
  const X = (c: number) => L + (((log ? Math.log10(c) : c) - xmin) / (xmax - xmin)) * (R - L);
  const Y = (mm: number) => B - (mm / ymax) * (B - T);
  const pts = rows.map((r) => [X(r.c), Y(r.mean)] as const);
  // where the guide meets the student's own (straight-segment) curve
  const cross = useMemo(() => {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const yy = Y(gy);
      if ((y0 - yy) * (y1 - yy) <= 0 && y0 !== y1) return x0 + ((yy - y0) / (y1 - y0)) * (x1 - x0);
    }
    return null;
  }, [pts, gy]); // eslint-disable-line react-hooks/exhaustive-deps
  const xTicks = log ? Array.from({ length: 51 }, (_, i) => -9.5 + i * 0.1) : Array.from({ length: 6 }, (_, i) => (xmax / 5) * i);
  return (
    <div className="space-y-2">
      {!forceLog && (
        <div className="flex gap-1 text-xs">
          <button type="button" onClick={() => setLog(false)} className={`rounded-lg px-2 py-1 font-semibold ${!log ? "bg-brandBlue text-white" : "bg-[#16181d]/5"}`} disabled={!s.plottedLinear}>Linear</button>
          <button type="button" onClick={() => setLog(true)} className={`rounded-lg px-2 py-1 font-semibold ${log ? "bg-brandBlue text-white" : "bg-[#16181d]/5"}`} disabled={!s.plottedLog}>Log</button>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-white" role="img" aria-label={`Graph of your responses against ${log ? "log concentration" : "concentration"}.`}>
        {[0, 10, 20, 30, 40, 50].map((mm) => (
          <g key={mm}>
            <line x1={L} x2={R} y1={Y(mm)} y2={Y(mm)} stroke="#eef2f6" />
            <text x={L - 6} y={Y(mm) + 3} fontSize="9" textAnchor="end" fill="#4a4f57">{mm}</text>
          </g>
        ))}
        {xTicks.map((v, i) => {
          const major = log ? Math.abs(v * 2 - Math.round(v * 2)) < 1e-6 : true;
          const x = L + ((v - xmin) / (xmax - xmin)) * (R - L);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={B} y2={B + (major ? 6 : 3)} stroke="#4a4f57" strokeWidth={major ? 1 : 0.6} />
              {major && (log ? Math.abs(v - Math.round(v)) < 1e-6 : true) && <text x={x} y={B + 16} fontSize="9" textAnchor="middle" fill="#4a4f57">{log ? v.toFixed(0) : (v * 1e6).toFixed(2)}</text>}
            </g>
          );
        })}
        <line x1={L} x2={R} y1={B} y2={B} stroke="#16181d" />
        <line x1={L} x2={L} y1={T} y2={B} stroke="#16181d" />
        <text x={(L + R) / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="#16181d">{log ? "log₁₀ [agonist] (M)" : "[agonist] (µM)"}</text>
        <text x={10} y={(T + B) / 2} fontSize="10" textAnchor="middle" fill="#16181d" transform={`rotate(-90 10 ${(T + B) / 2})`}>Response (mm)</text>
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#1C7BD9" strokeWidth="1.6" />}
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#21B67A" stroke="#fff" />)}
        {guide && (
          <>
            <line x1={L} x2={R} y1={Y(gy)} y2={Y(gy)} stroke="#d97706" strokeDasharray="4 3" />
            {cross !== null && <line x1={cross} x2={cross} y1={Y(gy)} y2={B} stroke="#d97706" strokeDasharray="4 3" />}
          </>
        )}
      </svg>
      {guide && (
        <label className="block text-xs font-semibold text-[#4a4f57]">
          Read-off guide (drag to a response, then read the axis where the dashed line lands)
          <input type="range" min={0} max={50} step={0.5} value={gy} onChange={(e) => setGy(Number(e.target.value))} className="mt-1 w-full accent-[#d97706]" />
        </label>
      )}
    </div>
  );
}

function EstimateForm({ onSubmit, disabled }: { onSubmit(emax: number, logEc50: number): void; disabled: boolean }) {
  const [e, setE] = useState("");
  const [l, setL] = useState("");
  const n = (x: string) => Number(x.replace(",", ".").replace("−", "-"));
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-semibold">
        Emax (mm)
        <input inputMode="decimal" value={e} onChange={(x) => setE(x.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        log EC50
        <input inputMode="decimal" value={l} onChange={(x) => setL(x.target.value)} disabled={disabled} placeholder="e.g. −7.0" className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <Btn variant="primary" disabled={disabled || !e || !l} onClick={() => onSubmit(n(e), n(l))}>Check</Btn>
    </div>
  );
}
