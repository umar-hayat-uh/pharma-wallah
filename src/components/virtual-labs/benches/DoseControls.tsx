"use client";

/**
 * Lab 3 instrument controllers (2026-10-21 — replaces the step-ordered DoseBench).
 * Graded dose–response on a SIMULATED isolated tissue. Each controller opens only when the
 * student selects its instrument in the room; the run machine refuses an action from any
 * other instrument. The dose selector, "add to bath" and the live trace live together on
 * the dosing station; the data table and the graph are built only from responses the
 * student actually recorded, and they live on the recorder.
 */
import { useMemo, useState, type ComponentType } from "react";
import { Minus, Plus } from "lucide-react";
import { molarLabel } from "@/lib/virtual-labs/calculations/doseResponse";
import { MODEL, VARIABLE_OPTIONS, stockFor, tableRows, type DoseAction, type DoseState } from "@/lib/virtual-labs/experiments/doseResponse";
import { Btn, Choice, ReadingField } from "../interface/ui";
import { ActBtn, Group, Hl } from "../interface/controls";
import { Lcd } from "./instruments2d";
import type { BenchProps } from "./types";

type P = BenchProps<DoseState, DoseAction>;

const pendingOf = (s: DoseState) => s.trials.find((t) => t.recordedMm === null);

function Simulated() {
  return <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] leading-snug text-amber-900">Simulated responses (teaching model) — not animal data.</p>;
}

function BathReadout({ s }: { s: DoseState }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Lcd value={`${s.tempC.toFixed(1)} °C`} sub="bath" tone="blue" />
      <Lcd value={`${s.equilibratedMin} min`} sub="since mounting" tone="blue" />
    </div>
  );
}

function WaitButtons({ act, minutes }: { act: P["act"]; minutes: number[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {minutes.map((m) => (
        <ActBtn key={m} act={act} a={{ type: "wait", minutes: m }}>Wait {m} min</ActBtn>
      ))}
    </div>
  );
}

function Notebook({ s, act }: P) {
  const [ind, setInd] = useState<string | null>(null);
  const [dep, setDep] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {s.variablesOk ? (
        <p className="text-sm text-[#0f5c3e]">Independent: agonist concentration. Dependent: contraction height. Controlled: temperature, tension, bath volume, contact time.</p>
      ) : (
        <Hl type="variables">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Independent variable (you change)</p>
            <Choice name="Independent variable" value={ind} onChange={setInd} options={VARIABLE_OPTIONS.independent.map((o) => ({ id: o.id, label: o.text }))} />
            <p className="text-sm font-semibold">Dependent variable (you measure)</p>
            <Choice name="Dependent variable" value={dep} onChange={setDep} options={VARIABLE_OPTIONS.dependent.map((o) => ({ id: o.id, label: o.text }))} />
            <ActBtn act={act} variant="primary" disabled={!ind || !dep} a={{ type: "variables", independent: ind ?? "", dependent: dep ?? "" }}>Write in the notebook</ActBtn>
          </div>
        </Hl>
      )}
      {tableRows(s).length > 0 && (
        <Group title="Recorded responses">
          <DataTable s={s} />
        </Group>
      )}
    </div>
  );
}

function OrganBath({ s, act }: P) {
  return (
    <div className="space-y-3">
      <BathReadout s={s} />
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "fillBath" }} disabled={s.bathFilled}>Fill with salt solution</ActBtn>
        <ActBtn act={act} a={{ type: "wash" }}>Wash out (×3)</ActBtn>
      </div>
      <Group title="Time">
        <WaitButtons act={act} minutes={[1, 2, 5, 10]} />
      </Group>
    </div>
  );
}

function Thermostat({ s, act }: P) {
  return (
    <div className="space-y-3">
      <BathReadout s={s} />
      <ActBtn act={act} a={{ type: "thermostat", on: !s.thermostatOn }} variant={s.thermostatOn ? "soft" : "secondary"}>
        {s.thermostatOn ? `On, set ${MODEL.targetC} °C — switch off` : `Switch on (${MODEL.targetC} °C)`}
      </ActBtn>
      <Group title="Time">
        <WaitButtons act={act} minutes={[2, 5, 10]} />
      </Group>
    </div>
  );
}

function Aerator({ s, act }: P) {
  return (
    <ActBtn act={act} a={{ type: "aeration", on: !s.aerationOn }} variant={s.aerationOn ? "soft" : "secondary"}>
      {s.aerationOn ? "Aeration on — turn off" : "Turn aeration on"}
    </ActBtn>
  );
}

function Tissue({ s, act }: P) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActBtn act={act} a={{ type: "mountTissue" }} disabled={s.tissueMounted}>Mount the tissue strip</ActBtn>
      <ActBtn act={act} a={{ type: "setTension" }} disabled={s.tensionSet}>Set 1 g resting tension</ActBtn>
    </div>
  );
}

/**
 * The dosing station: the dose selector is the micropipette's own setting — choosing a bath
 * concentration sets the stock and the volume that give it, as the student would work out
 * at the bench. "Add to the bath" runs the trial; the response appears on the live trace.
 */
function Dosing({ s, act }: P) {
  // The controller unmounts while the student washes out at the bath; a real pipette keeps
  // its setting, so the selector comes back on the last concentration given, not on 10⁻⁹ M.
  const [i, setI] = useState(() => {
    const lastStd = s.trials.filter((t) => !t.unknown).at(-1);
    return lastStd ? Math.max(0, MODEL.concentrations.indexOf(lastStd.c)) : 0;
  });
  const c = MODEL.concentrations[i];
  const st = stockFor(c);
  const pending = pendingOf(s);
  const tested = tableRows(s).find((r) => r.c === c)?.n ?? 0;
  const last = MODEL.concentrations.length - 1;
  return (
    // Sized for a phone's bottom sheet: selector, Add, trace and reading field fit in one view,
    // so a trial is select → add → read → record without scrolling.
    <div className="space-y-2.5">
      <div className="space-y-2" role="group" aria-label="Dose selector">
        <div className="flex items-stretch gap-2">
          <Btn size="sm" aria-label="Lower concentration" disabled={i === 0} onClick={() => setI((x) => Math.max(0, x - 1))} className="min-h-12 w-12 shrink-0">
            <Minus className="size-4" aria-hidden />
          </Btn>
          <output aria-live="polite" aria-label="Selected bath concentration" className="block min-w-0 flex-1 rounded-xl border border-[#16181d]/12 bg-white px-3 py-1.5 text-center">
            <span data-conc className="block font-mono text-lg font-semibold tabular-nums">{molarLabel(c)}</span>
            <span className="block text-[11px] text-[#4a4f57]">
              {st.ul} µL of {molarLabel(st.stock)} stock{tested ? ` · tested ×${tested}` : ""}
            </span>
          </output>
          <Btn size="sm" aria-label="Higher concentration" disabled={i === last} onClick={() => setI((x) => Math.min(last, x + 1))} className="min-h-12 w-12 shrink-0">
            <Plus className="size-4" aria-hidden />
          </Btn>
        </div>
        {/* A peak must be read before the next dose (the bench refuses one anyway), so while
            it waits the reading field takes the Add button's place — next to the trace. */}
        {pending ? (
          <Hl type="recordResponse">
            <ReadingField key={s.trials.length} label={pending.unknown ? "Peak for sample U, baseline to top" : "Latest peak, baseline to top"} unit="mm" placeholder="0.0" onSubmit={(value) => act({ type: "recordResponse", value })} />
          </Hl>
        ) : (
          <ActBtn act={act} variant="primary" a={{ type: "addDose", c }} className="w-full">Add to the bath</ActBtn>
        )}
      </div>
      <RecorderStrip trace={s.trials.map((t) => t.trueMm)} pending={!!pending} k={3.2} />
      {s.logEc50Entered !== null && (
        <Group title="Test sample U" note="Wash out first, exactly as for a standard.">
          <ActBtn act={act} a={{ type: "addUnknown" }}>Add 100 µL of sample U</ActBtn>
        </Group>
      )}
      <Simulated />
    </div>
  );
}

/** The recorder: the trace, the data built from recorded trials only, and the graph. */
function Recorder({ s, act }: P) {
  const pending = pendingOf(s);
  const plotted = s.plottedLinear || s.plottedLog;
  return (
    <div className="space-y-3">
      <Simulated />
      {!s.recorderZeroed && <ActBtn act={act} a={{ type: "zeroRecorder" }}>Zero the baseline</ActBtn>}
      <RecorderStrip trace={s.trials.map((t) => t.trueMm)} pending={!!pending} k={3.2} />
      {pending && (
        <Hl type="recordResponse">
          <ReadingField key={s.trials.length} label={pending.unknown ? "Peak height for sample U" : "Peak height of the latest response"} unit="mm" placeholder="0.0" onSubmit={(value) => act({ type: "recordResponse", value })} />
        </Hl>
      )}
      <DataTable s={s} />
      <Group title="Plot">
        <div className="flex gap-2">
          <ActBtn act={act} a={{ type: "plot", axis: "linear" }}>Linear axis</ActBtn>
          <ActBtn act={act} a={{ type: "plot", axis: "log" }}>Log axis</ActBtn>
        </div>
        {/* remount when a new axis is plotted, so the newest plot is the one shown */}
        {plotted && <Graph key={`${s.plottedLinear}-${s.plottedLog}`} s={s} guide={s.plottedLog} />}
      </Group>
      {s.plottedLog && (
        <Hl type="estimate">
          <EstimateForm disabled={s.logEc50Entered !== null} onSubmit={(emaxMm, logEc50) => act({ type: "estimate", emaxMm, logEc50 })} />
        </Hl>
      )}
      {s.logEc50Entered !== null && (
        <Hl type="estimateUnknown">
          <ReadingField label="log concentration of U (from your curve)" placeholder="e.g. −6.9" onSubmit={(logC) => act({ type: "estimateUnknown", logC })} disabled={s.unknownLogEntered !== null} buttonLabel="Submit" />
        </Hl>
      )}
    </div>
  );
}

/** The recorder trace with a millimetre grid — the student measures the latest peak. */
function RecorderStrip({ trace, pending, k = 4 }: { trace: number[]; pending: boolean; /** px per mm */ k?: number }) {
  const shown = trace.slice(-6);
  const W = 360;
  const base = 50 * k + 10;
  const H = base + 20;
  const step = (W - 40) / 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-[#fbfdff]" role="img" aria-label={`Recorder trace of the last ${shown.length} responses with a millimetre grid. ${pending ? "The latest peak is waiting to be measured." : ""}`}>
      {Array.from({ length: 51 }, (_, mm) => (
        <g key={mm}>
          <line x1="34" x2={W - 4} y1={base - mm * k} y2={base - mm * k} stroke={mm % 5 === 0 ? "#b9c9d8" : "#e3ebf2"} strokeWidth={mm % 5 === 0 ? 1 : 0.6} />
          {mm % 10 === 0 && <text x="4" y={base - mm * k + 4} fontSize="10" fill="#4a4f57">{mm}</text>}
        </g>
      ))}
      <text x="4" y={H - 3} fontSize="9" fill="#4a4f57">mm</text>
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
function Graph({ s, guide }: { s: DoseState; guide?: boolean }) {
  const [log, setLog] = useState(s.plottedLog);
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
      <div className="flex gap-1 text-xs" role="group" aria-label="Graph axis">
        <button type="button" onClick={() => setLog(false)} className={`min-h-8 rounded-lg px-2.5 font-semibold ${!log ? "bg-brandBlue text-white" : "bg-[#16181d]/5"}`} disabled={!s.plottedLinear}>Linear</button>
        <button type="button" onClick={() => setLog(true)} className={`min-h-8 rounded-lg px-2.5 font-semibold ${log ? "bg-brandBlue text-white" : "bg-[#16181d]/5"}`} disabled={!s.plottedLog}>Log</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-white" role="img" aria-label={`Graph of your recorded responses against ${log ? "log concentration" : "concentration"}.`}>
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
          Read-off guide: drag to a response, read the axis where the dashed line lands
          <input type="range" min={0} max={50} step={0.5} value={gy} onChange={(e) => setGy(Number(e.target.value))} className="mt-1 w-full accent-[#d97706]" />
        </label>
      )}
    </div>
  );
}

function EstimateForm({ onSubmit, disabled }: { onSubmit(emax: number, logEc50: number): void; disabled: boolean }) {
  const [e, setE] = useState("");
  const [l, setL] = useState("");
  const n = (x: string) => Number(x.replace(",", ".").replace(/[−–]/g, "-"));
  return (
    <form
      className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(x) => {
        x.preventDefault();
        if (e && l) onSubmit(n(e), n(l));
      }}
    >
      <label className="text-sm font-semibold">
        Emax (mm)
        <input inputMode="decimal" value={e} onChange={(x) => setE(x.target.value)} disabled={disabled} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        log EC50
        <input inputMode="decimal" value={l} onChange={(x) => setL(x.target.value)} disabled={disabled} placeholder="e.g. −7.0" className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <Btn type="submit" variant="primary" disabled={disabled || !e || !l} className="col-span-2 sm:col-span-1">Check</Btn>
    </form>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const DOSE_CONTROLS: Record<string, ComponentType<P>> = {
  notebook: Notebook,
  "organ-bath": OrganBath,
  thermostat: Thermostat,
  aerator: Aerator,
  tissue: Tissue,
  dosing: Dosing,
  recorder: Recorder,
};
