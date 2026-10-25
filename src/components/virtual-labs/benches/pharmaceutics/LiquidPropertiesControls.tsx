"use client";

/**
 * Physical Properties of Liquids — the instrument controllers (2026-10-25). Each panel opens only
 * when its instrument is selected in the room (or the 2D bench plan); the run machine refuses an
 * action from any other. Panels put the instrument first (phone bottom sheet ≤ ~58 % of the
 * screen): the bath and balance LCDs, the stopwatch with a MAGNIFIED view of the timing mark, and
 * the capillary's millimetre scale. The scales are drawn, never printed — the student reads them.
 * No number is computed here: every value comes from the experiment module.
 */
import { useState, type ComponentType, type ReactNode } from "react";
import {
  ACTIVITIES,
  CALC_KEYS,
  CALC_LABEL,
  KIT,
  LIQUID_NAME,
  METHOD,
  SAMPLE_ID,
  liquidPropertiesVisual,
  meanTime,
  resultsTable,
  stopwatchSeconds,
  timingView,
  workedSolution,
  type CalcKey,
  type Liquid,
  type LiquidPropertiesAction,
  type LiquidPropertiesState,
} from "@/lib/virtual-labs/experiments/pharmaceutics/liquidProperties";
import { LIQUIDS } from "@/lib/virtual-labs/calculations/liquidProperties";
import { Choice, ReadingField } from "../../interface/ui";
import { ActBtn, Group, Hl, HoldControl, useControlMode } from "../../interface/controls";
import { Lcd, ScaleWindow } from "../instruments2d";
import type { BenchProps } from "../types";
import { commonControls } from "./CommonControls";

type P = BenchProps<LiquidPropertiesState, LiquidPropertiesAction>;

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{children}</p>;
}
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
function Simulated() {
  return <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] leading-snug text-amber-900">Simulated readings from published property data (teaching model).</p>;
}
const short = (l: Liquid) => (l === "water" ? "Water" : l === "ethanol" ? "Ethanol" : "Glycerol 50 %");
const inBathFor = (s: LiquidPropertiesState, since: number) => `${Math.max(0, s.minute - since)} min in the bath`;

function WaitButtons({ act }: { act: P["act"] }) {
  return (
    <Row>
      {METHOD.waitOptionsMin.map((m) => (
        <ActBtn key={m} act={act} a={{ type: "wait", minutes: m }}>Wait {m} min</ActBtn>
      ))}
    </Row>
  );
}

/** Buttons for each liquid whose bottle is on the bench. */
function LiquidButtons({ s, act, make, label }: { s: LiquidPropertiesState; act: P["act"]; make(l: Liquid): LiquidPropertiesAction; label(l: Liquid): string }) {
  const out = LIQUIDS.filter((l) => s.bench.out.includes(SAMPLE_ID[l]));
  if (!out.length) return <p className="text-xs text-[#4a4f57]">Take the sample bottles out of the reagent cabinet first.</p>;
  return (
    <Row>
      {out.map((l) => (
        <ActBtn key={l} act={act} a={make(l)}>{label(l)}</ActBtn>
      ))}
    </Row>
  );
}

// ── Lab notebook: activity selector, calculations, results ─────────────────

function Notebook({ s, act }: P) {
  const [tab, setTab] = useState<"work" | "results">("work");
  return (
    <div className="space-y-3">
      <Hl type="selectActivity">
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Activity">
          {ACTIVITIES.map((a) => (
            <ActBtn key={a.id} act={act} a={{ type: "selectActivity", activity: a.id }} variant={s.activity === a.id ? "primary" : "secondary"} className="w-full px-2 text-xs" title={a.name}>
              {a.short}
            </ActBtn>
          ))}
        </div>
      </Hl>
      <div className="flex gap-1 text-xs" role="tablist">
        {(["work", "results"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-9 rounded-lg px-3 font-semibold ${tab === t ? "bg-brandBlue/10 text-brandBlue" : "text-[#4a4f57]"}`}>
            {t === "work" ? "Data & calculations" : "Results"}
          </button>
        ))}
      </div>
      {tab === "work" ? <ActivityWork s={s} act={act} /> : <Results s={s} />}
    </div>
  );
}

function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-[#16181d]/[0.06] rounded-xl border border-[#16181d]/10 bg-white text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2 px-3 py-1.5">
          <dt className="text-[#4a4f57]">{k}</dt>
          <dd className="font-mono tabular-nums [overflow-wrap:anywhere]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ActivityWork({ s, act }: Pick<P, "s" | "act">) {
  const f = (x: number | undefined | null, dp: number, u: string) => (x === undefined || x === null ? "—" : `${x.toFixed(dp)} ${u}`);
  const rows: [string, string][] =
    s.activity === "density"
      ? [["m₁ empty, dry", f(s.dens.empty, 4, "g")], ...LIQUIDS.map((l) => [`m with ${short(l).toLowerCase()}`, f(s.dens.filled[l], 4, "g")] as [string, string])]
      : s.activity === "viscosity"
        ? [["Charge volume", s.chargeRef !== null ? `${s.chargeRef} mL` : "—"], ...LIQUIDS.map((l) => [short(l), s.times[l].length ? `${s.times[l].map((t) => t.toFixed(2)).join(" · ")}${meanTime(s, l) !== null ? ` → ${meanTime(s, l)!.toFixed(2)} s` : " s"}` : "—"] as [string, string])]
        : LIQUIDS.map((l) => [`Rise, ${short(l).toLowerCase()}`, f(s.rise[l], 1, "mm")] as [string, string]);
  return (
    <div className="space-y-3">
      <DataTable rows={rows} />
      <Group title="Calculations" note="From your own readings. Each step has hints in the procedure panel.">
        <div className="space-y-2">
          {CALC_KEYS[s.activity].map((k) => (
            <CalcRow key={k} s={s} act={act} k={k} />
          ))}
        </div>
      </Group>
    </div>
  );
}

function CalcRow({ s, act, k }: Pick<P, "s" | "act"> & { k: CalcKey }) {
  const mode = useControlMode();
  const lab = CALC_LABEL[k];
  const done = s.calc[k] !== undefined;
  const shown = s.solutions.includes(k);
  const ws = shown ? workedSolution(s, k) : null;
  const canOpen = mode === "learning" || (s.attempts[k] ?? 0) >= 1;
  return (
    <div className="rounded-xl border border-[#16181d]/10 p-2">
      {done ? (
        <p className="text-sm">
          <span className="text-[#4a4f57]">{lab.label}: </span>
          <span className="font-mono font-semibold">{s.calc[k]!.toFixed(lab.dp)} {lab.unit}</span>
        </p>
      ) : (
        <Hl type="calc">
          <ReadingField label={lab.label} unit={lab.unit || undefined} placeholder={(0).toFixed(lab.dp)} buttonLabel="Check" onSubmit={(value) => act({ type: "calc", key: k, value })} />
        </Hl>
      )}
      {!shown && !done && (
        <ActBtn act={act} a={{ type: "solution", key: k, mode }} variant="soft" disabled={!canOpen} className="mt-2" title={canOpen ? undefined : "Practical: opens after your first attempt"}>
          {mode === "practical" ? `Worked solution (−3 marks)${canOpen ? "" : " · after one attempt"}` : "Worked solution"}
        </ActBtn>
      )}
      {ws && (
        <ol className="mt-2 space-y-1 text-xs text-[#1b4f86]">
          {ws.lines.map((x, i) => (
            <li key={i} className="[overflow-wrap:anywhere]">{x}</li>
          ))}
          <li className="font-semibold">= {ws.result}</li>
        </ol>
      )}
    </div>
  );
}

/** Results table and a comparison chart across the three liquids (each property relative to water, so all three share an axis). */
function Results({ s }: { s: LiquidPropertiesState }) {
  const rows = resultsTable(s);
  const props = [
    { id: "rho", name: "Density", unit: "g/mL", dp: 4 },
    { id: "eta", name: "Viscosity", unit: "mPa·s", dp: 3 },
    { id: "gamma", name: "Surface tension", unit: "mN/m", dp: 2 },
  ] as const;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[#16181d]/10">
        <table className="w-full min-w-[300px] text-xs">
          <thead className="bg-[#16181d]/[0.03] text-left">
            <tr>
              <th className="px-2 py-1.5">25 °C</th>
              {props.map((p) => (
                <th key={p.id} className="px-2 py-1.5">{p.name} <span className="font-normal">({p.unit})</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.liquid} className="border-t border-[#16181d]/[0.06] align-top">
                <th className="px-2 py-1.5 text-left font-semibold">{short(r.liquid)}</th>
                {props.map((p) => {
                  const c = r[p.id];
                  const measured = c.diff !== null || (r.liquid === "water" && p.id === "gamma" && c.value !== null);
                  return (
                    <td key={p.id} className="px-2 py-1.5 font-mono tabular-nums">
                      {c.value === null ? "—" : c.value.toFixed(p.dp)}
                      <span className="block text-[10px] text-[#4a4f57]">
                        {measured && c.diff !== null ? `ref ${c.ref.toFixed(p.dp)} · ${c.diff >= 0 ? "+" : ""}${c.diff.toFixed(1)} %` : r.liquid === "water" ? "reference" : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CompareChart rows={rows} />
      <p className="text-[11px] text-[#4a4f57]">References: CRC Handbook / IAPWS / Jasper 1972 / Volk & Kähler 2018 / Cheng 2008. Glycerol–water surface tension is an unverified teaching estimate; published ethanol viscosities differ by about 3 %.</p>
    </div>
  );
}

/** Grouped bars: each property as a ratio to water (water = 1), from the student's results where recorded. */
function CompareChart({ rows }: { rows: ReturnType<typeof resultsTable> }) {
  const groups = [
    { id: "rho", name: "ρ" },
    { id: "eta", name: "η" },
    { id: "gamma", name: "γ" },
  ] as const;
  const water = rows[0];
  const colour: Record<Liquid, string> = { water: "#1C7BD9", ethanol: "#f59e0b", glycerol: "#21B67A" };
  const W = 300;
  const H = 150;
  const max = 6; // η of the glycerol mixture is about 5.6 × water's
  const y = (v: number) => H - 20 - (Math.min(v, max) / max) * (H - 34);
  return (
    <figure className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-white" role="img" aria-label="Bar chart: density, viscosity and surface tension of each liquid relative to water.">
        {[0, 1, 2, 4, 6].map((g) => (
          <g key={g}>
            <line x1="26" x2={W - 6} y1={y(g)} y2={y(g)} stroke="#e5e9ee" />
            <text x="20" y={y(g) + 3} fontSize="9" textAnchor="end" fill="#4a4f57">{g}</text>
          </g>
        ))}
        {groups.map((g, gi) =>
          rows.map((r, li) => {
            const c = r[g.id];
            const v = c.value === null ? null : c.value / water[g.id].ref;
            const x = 40 + gi * 88 + li * 24;
            return v === null ? null : <rect key={`${g.id}-${r.liquid}`} x={x} y={y(v)} width="20" height={H - 20 - y(v)} fill={colour[r.liquid]} rx="2" />;
          }),
        )}
        {groups.map((g, gi) => (
          <text key={g.id} x={40 + gi * 88 + 34} y={H - 6} fontSize="11" textAnchor="middle" fill="#16181d">{g.name} ÷ water</text>
        ))}
      </svg>
      <figcaption className="flex flex-wrap gap-3 text-[11px] text-[#4a4f57]">
        {LIQUIDS.map((l) => (
          <span key={l} className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: colour[l] }} />{short(l)}</span>
        ))}
      </figcaption>
    </figure>
  );
}

// ── Water bath + thermometer ─────────────────────────────────────────────────

function Bath({ s, act }: P) {
  const v = liquidPropertiesVisual(s);
  const items: string[] = [];
  if (s.pyc.inBath) items.push(`pycnometer · ${inBathFor(s, s.pyc.since)}`);
  if (s.visc.clamped && s.visc.charge) items.push(`viscometer · ${inBathFor(s, s.visc.since)}`);
  if (s.beaker.inBath) items.push(`beaker · ${inBathFor(s, s.beaker.since)}`);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Lcd value={s.bath.thermo ? `${v.bathC.toFixed(1)} °C` : "— °C"} sub={s.bath.thermo ? "thermometer" : "probe not in bath"} tone="amber" />
        <Lcd value={s.bath.set === null ? "OFF" : `${s.bath.set.toFixed(1)}`} sub="set-point °C" tone="blue" />
      </div>
      <Hl type="recordBathTemp">
        <ReadingField label="Record the bath temperature" unit="°C" placeholder="0.0" disabled={!s.bath.thermo || s.bath.checked !== null} onSubmit={(value) => act({ type: "recordBathTemp", value })} />
      </Hl>
      <Group title="Set-point">
        <div className="grid grid-cols-4 gap-1.5">
          {METHOD.setpoints.map((c) => (
            <ActBtn key={c} act={act} a={{ type: "setBath", c }} variant={s.bath.set === c ? "soft" : "secondary"}>{c} °C</ActBtn>
          ))}
        </div>
      </Group>
      <Row>
        {s.bath.thermo ? <ActBtn act={act} a={{ type: "thermoOut" }}>Thermometer out</ActBtn> : <ActBtn act={act} a={{ type: "thermoIn" }}>Thermometer in</ActBtn>}
      </Row>
      <WaitButtons act={act} />
      {items.length > 0 && <Note>In the bath: {items.join("; ")}.</Note>}
    </div>
  );
}

// ── Analytical balance ──────────────────────────────────────────────────────

function Balance({ s, act }: P) {
  const v = liquidPropertiesVisual(s);
  return (
    <div className="space-y-3">
      <Lcd value={`${v.balance.reading.toFixed(4)} g`} sub={s.pyc.onBalance ? "● stable · doors closed" : "pan empty"} />
      <Row>
        <ActBtn act={act} a={{ type: "pycWeigh" }} disabled={s.pyc.onBalance}>Pycnometer onto the pan</ActBtn>
      </Row>
      <Hl type="recordMass">
        <ReadingField label="Record the mass" unit="g" placeholder="0.0000" disabled={!s.pyc.onBalance} onSubmit={(value) => act({ type: "recordMass", value })} />
      </Hl>
    </div>
  );
}

// ── Pycnometer ──────────────────────────────────────────────────────────────

function pycState(s: LiquidPropertiesState) {
  const p = s.pyc;
  if (!p.content) return p.residue ? `Empty, wet with ${LIQUID_NAME[p.residue]}` : "Empty, clean and dry";
  const where = p.onBalance ? "on the balance" : p.inBath ? `in the bath (${inBathFor(s, p.since).replace(" in the bath", "")})` : "on the bench";
  return `${LIQUID_NAME[p.content]} · ${p.stoppered ? `stoppered${p.wetOutside ? ", outside wet" : ""}` : "unstoppered"} · ${where}`;
}

function Pycnometer({ s, act }: P) {
  const p = s.pyc;
  return (
    <div className="space-y-3">
      <Note>{pycState(s)}</Note>
      {!p.content ? (
        <>
          <Group title="Fill with">
            <LiquidButtons s={s} act={act} make={(l) => ({ type: "pycFill", liquid: l })} label={short} />
          </Group>
          <Group title="Between liquids">
            <Row>
              <ActBtn act={act} a={{ type: "pycDry" }}>Dry (warm air)</ActBtn>
            </Row>
            <LiquidButtons s={s} act={act} make={(l) => ({ type: "pycRinseWith", liquid: l })} label={(l) => `Rinse with ${short(l).toLowerCase()}`} />
          </Group>
        </>
      ) : (
        <>
          <Row>
            {!p.stoppered && !p.inBath && <ActBtn act={act} a={{ type: "pycToBath" }}>Into the bath</ActBtn>}
            {!p.stoppered && <ActBtn act={act} a={{ type: "pycStopper" }} variant="primary">Insert stopper</ActBtn>}
            {p.stoppered && p.wetOutside && <ActBtn act={act} a={{ type: "pycWipe" }}>Wipe the outside</ActBtn>}
            <ActBtn act={act} a={{ type: "pycEmpty" }} variant="soft">Empty</ActBtn>
          </Row>
          {!p.stoppered && <WaitButtons act={act} />}
        </>
      )}
    </div>
  );
}

// ── Ostwald viscometer + pipette ────────────────────────────────────────────

function Viscometer({ s, act }: P) {
  const v = s.visc;
  // No default: choosing the same volume as for water is part of the method, so it is not pre-selected.
  const [ml, setMl] = useState<string | null>(null);
  const status = v.charge ? `${v.chargeMl} mL of ${LIQUID_NAME[v.charge]} · ${inBathFor(s, v.since)}` : v.residue ? `Empty, wet with ${LIQUID_NAME[v.residue]}` : "Empty, clean and dry";
  return (
    <div className="space-y-3">
      <Note>{v.clamped ? "Clamped vertically in the bath. " : "On the bench. "}{status}</Note>
      {!v.charge ? (
        <>
          <Row>
            {!v.clamped && <ActBtn act={act} a={{ type: "viscClamp" }}>Clamp in the bath</ActBtn>}
            {!v.clamped && <ActBtn act={act} a={{ type: "viscDry" }}>Dry (warm air)</ActBtn>}
          </Row>
          {v.clamped && (
            <Group title="Charge with the pipette" note="The same volume for every liquid.">
              <Hl type="viscCharge">
                <Choice name="Volume" value={ml} onChange={setMl} options={METHOD.chargeOptionsMl.map((x) => ({ id: String(x), label: `${x} mL` }))} />
              </Hl>
              {ml === null ? <p className="text-xs text-[#4a4f57]">Choose the volume first.</p> : <LiquidButtons s={s} act={act} make={(l) => ({ type: "viscCharge", liquid: l, ml: Number(ml) })} label={(l) => `Charge ${short(l).toLowerCase()}`} />}
            </Group>
          )}
        </>
      ) : (
        <>
          <Row>
            <ActBtn act={act} a={{ type: "viscDraw" }} variant="primary" disabled={v.flowing || v.display !== null}>Draw up & release</ActBtn>
            <ActBtn act={act} a={{ type: "viscEmpty" }} variant="soft">Unclamp & empty</ActBtn>
          </Row>
          <WaitButtons act={act} />
          <p className="text-xs text-[#4a4f57]">Time the flow with the stopwatch.</p>
        </>
      )}
    </div>
  );
}

// ── Stopwatch: magnified timing mark first ──────────────────────────────────

/** A magnified window on the stem at the next timing mark. The meniscus is drawn where it is; nothing is printed. */
function MarkLens({ s }: { s: LiquidPropertiesState }) {
  const tv = timingView(s);
  const W = 160;
  const H = 130;
  const mid = H / 2;
  const pxPerMm = 6;
  const y = tv.mark ? mid - Math.max(-12, Math.min(12, tv.offsetMm)) * pxPerMm : H - 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[180px] rounded-xl border border-[#16181d]/10 bg-[#f7fafc]" role="img" aria-label={tv.mark ? `Magnified ${tv.mark} timing mark with the falling meniscus. Start or stop the watch as the meniscus crosses the line.` : "Viscometer stem, magnified. Release the liquid to begin a run."}>
      <rect x="62" y="0" width="36" height={H} fill="#ffffff" stroke="#9fb3c6" />
      {tv.mark && <rect x="62" y={y} width="36" height={H - y} fill="#cfe6fb" opacity="0.85" />}
      {tv.mark && <path d={`M62 ${y - 4} Q80 ${y + 5} 98 ${y - 4}`} stroke="#4a7fb3" strokeWidth="2" fill="none" />}
      <line x1="52" x2="108" y1={mid} y2={mid} stroke="#1b1f26" strokeWidth="2" />
      <text x="112" y={mid + 4} fontSize="11" fontWeight="600" fill="#1b1f26">{tv.mark === "lower" ? "lower" : "upper"}</text>
    </svg>
  );
}

function Stopwatch({ s, act, onFlow }: P) {
  const sw = stopwatchSeconds(s);
  const v = s.visc;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] gap-3">
        <MarkLens s={s} />
        <div className="min-w-0 space-y-2">
          <Lcd value={`${sw.seconds.toFixed(2)} s`} sub={sw.running ? "running" : v.display !== null ? "stopped" : "ready"} tone="blue" />
          {sw.running || v.start10 === null ? (
            sw.running ? (
              <ActBtn act={act} a={{ type: "stopWatch" }} variant="danger" className="w-full">Stop</ActBtn>
            ) : (
              <ActBtn act={act} a={{ type: "startWatch" }} variant="primary" className="w-full" disabled={!v.flowing}>Start</ActBtn>
            )
          ) : null}
        </div>
      </div>
      {v.flowing && (
        <Group title="Watch the meniscus fall">
          <div className="grid grid-cols-3 gap-1.5">
            <HoldControl type="flow" label="Hold to watch the meniscus fall" every={100} onTick={() => act({ type: "flow", seconds: 1 })} onFlow={onFlow}>Hold: watch</HoldControl>
            {[...METHOD.flowStepsS].reverse().map((sec) => (
              <ActBtn key={sec} act={act} a={{ type: "flow", seconds: sec }}>+{sec} s</ActBtn>
            ))}
          </div>
        </Group>
      )}
      {v.display !== null ? (
        <Hl type="recordTime">
          <ReadingField label="Record the flow time" unit="s" placeholder="0.00" onSubmit={(value) => act({ type: "recordTime", value })} />
        </Hl>
      ) : (
        !v.flowing && v.charge && <ActBtn act={act} a={{ type: "viscDraw" }}>Draw up & release (next run)</ActBtn>
      )}
      {v.charge && s.times[v.charge].length > 0 && <Note>{short(v.charge)}: {s.times[v.charge].map((t) => t.toFixed(2)).join(" · ")} s</Note>}
      <Simulated />
    </div>
  );
}

// ── Capillary rise ──────────────────────────────────────────────────────────

function Capillary({ s, act }: P) {
  const c = s.cap;
  const b = s.beaker;
  const from = c.dipped ? Math.max(0, Math.floor(c.readMm / 5) * 5 - 5) : 0;
  return (
    <div className="space-y-3">
      {c.dipped ? (
        <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3">
          <ScaleWindow label="Capillary beside its millimetre scale, magnified" level={c.readMm} from={from} to={from + 15} minor={0.5} major={5} unit="mm" liquid="#cfe6fb" height={210} />
          <div className="min-w-0 space-y-2">
            <p className="text-xs text-[#4a4f57]">Zero of the scale at the liquid surface in the beaker. Read the bottom of the meniscus.</p>
            <Hl type="recordRise">
              <ReadingField label="Rise" unit="mm" placeholder="0.0" onSubmit={(value) => act({ type: "recordRise", value })} disabled={s.rise[c.dipped] !== undefined} />
            </Hl>
            <ActBtn act={act} a={{ type: "capLift" }} variant="soft">Lift out</ActBtn>
          </div>
        </div>
      ) : (
        <Note>
          Capillary {c.discarded ? "discarded" : `${c.vertical ? "vertical" : "not checked against the plumb line"}, ${s.bench.rinsed.includes("capillary") ? "cleaned" : "not yet cleaned"}`}. Beaker: {b.liquid ? `${LIQUID_NAME[b.liquid]}${b.inBath ? `, ${inBathFor(s, b.since)}` : ", on the bench"}` : "empty"}.
        </Note>
      )}
      {!c.dipped && (
        <>
          <Row>
            {!c.vertical && <ActBtn act={act} a={{ type: "capAlign" }}>Set vertical (plumb line)</ActBtn>}
            {b.liquid && !b.inBath && <ActBtn act={act} a={{ type: "beakerToBath" }}>Beaker into the bath</ActBtn>}
            {b.liquid && b.inBath && <ActBtn act={act} a={{ type: "capDip" }} variant="primary">Dip the capillary</ActBtn>}
            {b.liquid && <ActBtn act={act} a={{ type: "beakerEmpty" }} variant="soft">Empty the beaker</ActBtn>}
            {!c.discarded && <ActBtn act={act} a={{ type: "capDiscard" }} variant="soft">Discard capillary</ActBtn>}
          </Row>
          {!b.liquid && (
            <Group title="Fill the beaker with">
              <LiquidButtons s={s} act={act} make={(l) => ({ type: "beakerFill", liquid: l })} label={short} />
            </Group>
          )}
          {b.liquid && <WaitButtons act={act} />}
        </>
      )}
      <Simulated />
    </div>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const LIQUID_PROPERTIES_CONTROLS: Record<string, ComponentType<P>> = {
  notebook: Notebook,
  bath: Bath,
  balance: Balance,
  pycnometer: Pycnometer,
  viscometer: Viscometer,
  stopwatch: Stopwatch,
  capillary: Capillary,
  ...commonControls<LiquidPropertiesState, LiquidPropertiesAction>(KIT, (s) => s.bench),
};
