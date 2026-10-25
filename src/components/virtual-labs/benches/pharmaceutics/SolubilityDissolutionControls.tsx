"use client";

/**
 * Solubility & Dissolution Studies — instrument controllers (2026-10-25). One panel per
 * controller in experiments/pharmaceutics/solubilityDissolution.ts, opened only by selecting
 * its equipment in the room (or the 2D bench plan); the run machine refuses an action from
 * any other instrument. Panels show what the instrument shows (balance and spectrophotometer
 * LCDs, the thermometer and tachometer, the cylinder's meniscus, the flask's contents) — never
 * a value the student is meant to read or judge for themselves. Every number comes from the
 * pure experiment; nothing is computed here.
 *
 * Sized for the phone bottom sheet (≤ ~58 % of 390 × 844): instrument readout first, then the
 * two or three controls the hand is on.
 */
import { useState, type ComponentType, type ReactNode } from "react";
import {
  KIT,
  METHOD,
  balanceReading,
  expected,
  nextToMeasure,
  profile,
  solidG,
  spectroDisplay,
  workedSolution,
  type CalcId,
  type SolubilityDissolutionAction,
  type SolubilityDissolutionState,
} from "@/lib/virtual-labs/experiments/pharmaceutics/solubilityDissolution";
import { Choice, ReadingField } from "../../interface/ui";
import { ActBtn, Group, Hl, useControlMode } from "../../interface/controls";
import { Lcd, ScaleWindow } from "../instruments2d";
import type { BenchProps } from "../types";
import { commonControls } from "./CommonControls";

type S = SolubilityDissolutionState;
type A = SolubilityDissolutionAction;
type P = BenchProps<S, A>;

const USP_TERMS = ["Very soluble", "Freely soluble", "Soluble", "Sparingly soluble", "Slightly soluble", "Very slightly soluble", "Practically insoluble"];

const num = (x: string) => Number(x.trim().replace(",", ".").replace(/[−–]/g, "-"));
const mmss = (min: number) => `${Math.floor(min)}:${String(Math.round((min % 1) * 60)).padStart(2, "0")}`;

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{children}</p>;
}
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
function Simulated() {
  return <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] leading-snug text-amber-900">SIMULATED release (teaching model) — modelled on, not compliant with, the USP test.</p>;
}
function Field({ label, value, onChange, unit }: { label: string; value: string; onChange(v: string): void; unit?: string }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <span className="relative mt-1 block">
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="vl-input h-11 w-full rounded-xl border border-[#16181d]/15 px-3 pr-14 font-mono" />
        {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4a4f57]">{unit}</span>}
      </span>
    </label>
  );
}

// ── Drawings (true state, no values printed) ──────────────────────────────

/** The conical flask: water level and, if any, the undissolved powder on its floor. */
function FlaskView({ s }: { s: S }) {
  const solid = solidG(s);
  const dots = Math.min(60, Math.round(solid * 40));
  const water = s.flask.waterMl > 0;
  const desc = !water ? "Empty conical flask." : solid > 0.01 ? "Conical flask of water with undissolved white powder lying on the bottom." : s.flask.drugG > 0 ? "Conical flask of clear liquid; no undissolved powder is visible." : "Conical flask of clear water.";
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-auto" role="img" aria-label={desc}>
      <clipPath id="sd-flask"><path d="M48 8 L72 8 L72 40 L104 110 Q106 116 98 116 L22 116 Q14 116 16 110 L48 40 Z" /></clipPath>
      {water && <rect x="0" y="62" width="120" height="56" fill="#d8ebfa" clipPath="url(#sd-flask)" />}
      {Array.from({ length: dots }, (_, i) => (
        <circle key={i} cx={24 + ((i * 37) % 72)} cy={113 - ((i * 13) % 5) - Math.floor(i / 18) * 2} r="1.6" fill="#fafafa" stroke="#9aa3ad" strokeWidth="0.4" />
      ))}
      <path d="M48 8 L72 8 L72 40 L104 110 Q106 116 98 116 L22 116 Q14 116 16 110 L48 40 Z" fill="none" stroke="#7c8b99" strokeWidth="2" />
      {s.flask.stoppered && <rect x="50" y="2" width="20" height="9" rx="2" fill="#b9c3cc" />}
    </svg>
  );
}

function Schedule({ s }: { s: S }) {
  return (
    <ul className="flex flex-wrap gap-1.5 text-xs" aria-label="Sampling schedule">
      {METHOD.schedule.map((p) => {
        const x = s.samples.find((y) => y.nominal === p);
        const missed = s.missed.includes(p);
        return (
          <li key={p} className={`rounded-full px-2 py-0.5 font-semibold ${x ? "bg-brandGreen/15 text-[#137a52]" : missed ? "bg-red-50 text-red-700" : "bg-[#16181d]/[0.06] text-[#3a3f47]"}`}>
            {p} min{x ? (x.late ? " · late" : " ✓") : missed ? " · missed" : ""}
          </li>
        );
      })}
    </ul>
  );
}

// ── Calculations: hints live in the procedure panel; worked solutions here ──

function Worked({ s, act, calc }: { s: S; act: P["act"]; calc: CalcId }) {
  const mode = useControlMode();
  const c = s.calc[calc];
  if (c.worked) {
    return (
      <ol className="list-decimal space-y-1 rounded-xl bg-brandBlue/[0.05] py-2 pl-7 pr-3 text-[13px] text-[#1b4f86]">
        {workedSolution(s, calc).map((l, i) => <li key={i}>{l}</li>)}
      </ol>
    );
  }
  const locked = mode === "practical" && c.attempts === 0;
  return (
    <div className="space-y-1">
      <ActBtn act={act} a={{ type: "worked", calc, mode }} variant="soft" disabled={locked}>Show worked solution</ActBtn>
      <p className="text-[11px] text-[#4a4f57]">{mode === "learning" ? "Learning mode: free, any time." : locked ? "Practical: opens after one attempt of your own, and costs 3 technique marks." : "Practical: costs 3 technique marks."}</p>
    </div>
  );
}

function SolubilityCalc({ s, act }: { s: S; act: P["act"] }) {
  const [g, setG] = useState("");
  const [m, setM] = useState("");
  return (
    <Group title="Solubility" note={`Aliquot ${METHOD.aliquotMl.toFixed(2)} mL; residue = final constant mass − empty dish.`}>
      <Hl type="calcSolubility">
        <div className="grid grid-cols-2 gap-2">
          <Field label="g/100 mL" value={g} onChange={setG} />
          <Field label="mg/mL" value={m} onChange={setM} />
        </div>
        <ActBtn act={act} variant="primary" className="mt-2 w-full" disabled={!g || !m} a={{ type: "calcSolubility", gPer100: num(g), mgPerMl: num(m) }}>Check</ActBtn>
      </Hl>
      <Worked s={s} act={act} calc="solubility" />
    </Group>
  );
}

function PartsCalc({ s, act }: { s: S; act: P["act"] }) {
  const [p, setP] = useState("");
  const [term, setTerm] = useState(USP_TERMS[0]);
  return (
    <Group title="Parts of solvent and USP term">
      <Hl type="calcParts">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Parts of water" value={p} onChange={setP} unit="mL/g" />
          <label className="text-sm font-semibold">
            USP term
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 bg-white px-2 text-sm">
              {USP_TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <ActBtn act={act} variant="primary" className="mt-2 w-full" disabled={!p} a={{ type: "calcParts", parts: num(p), term }}>Check</ActBtn>
      </Hl>
      <Worked s={s} act={act} calc="parts" />
    </Group>
  );
}

function OneNumberCalc({ s, act, calc, title, label, unit, make, type, note }: { s: S; act: P["act"]; calc: CalcId; title: string; label: string; unit: string; make(v: number): A; type: string; note?: string }) {
  const [v, setV] = useState("");
  return (
    <Group title={title} note={note}>
      <Hl type={type}>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1"><Field label={label} value={v} onChange={setV} unit={unit} /></div>
          <ActBtn act={act} variant="primary" disabled={!v} a={make(num(v))}>Check</ActBtn>
        </div>
      </Hl>
      <Worked s={s} act={act} calc={calc} />
    </Group>
  );
}

function Verdict({ s, act }: { s: S; act: P["act"] }) {
  const [v, setV] = useState<string | null>(null);
  return (
    <Group title="Verdict" note={`Teaching criterion: one unit ≥ Q + 5 % = ${METHOD.q + 5} % at ${METHOD.qTimeMin} min (modelled on USP ⟨711⟩ S1; not a compliance test).`}>
      <Hl type="verdict">
        <Choice
          name="Verdict"
          value={v}
          onChange={setV}
          options={[
            { id: "meets", label: `Meets: ≥ ${METHOD.q + 5} % at ${METHOD.qTimeMin} min` },
            { id: "fails", label: `Below ${METHOD.q + 5} % — would go to stage S2` },
            { id: "not-determinable", label: "Cannot be assessed — the 30-min sample is missing" },
          ]}
        />
        <ActBtn act={act} variant="primary" className="mt-2 w-full" disabled={!v} a={{ type: "verdict", verdict: (v ?? "meets") as "meets" | "fails" | "not-determinable" }}>Record verdict</ActBtn>
      </Hl>
    </Group>
  );
}

/** The dissolution profile — from RECORDED samples only (the same rows the report prints). */
function ProfileChart({ s }: { s: S }) {
  const rows = profile(s);
  const W = 340;
  const H = 200;
  const L = 34;
  const R = W - 8;
  const T = 10;
  const B = 172;
  const X = (t: number) => L + (t / 50) * (R - L);
  const Y = (p: number) => B - (Math.min(110, Math.max(0, p)) / 110) * (B - T);
  const line = (k: "corrected" | "uncorrected") => rows.map((r) => `${X(r.t)},${Y(r[k])}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-[#16181d]/10 bg-white" role="img" aria-label={`Dissolution profile of your ${rows.length} recorded samples: % dissolved, corrected and uncorrected, against time.`}>
      {[0, 20, 40, 60, 80, 100].map((p) => (
        <g key={p}>
          <line x1={L} x2={R} y1={Y(p)} y2={Y(p)} stroke="#eef2f6" />
          <text x={L - 5} y={Y(p) + 3} fontSize="9" textAnchor="end" fill="#4a4f57">{p}</text>
        </g>
      ))}
      {[0, 10, 20, 30, 40, 50].map((t) => <text key={t} x={X(t)} y={B + 13} fontSize="9" textAnchor="middle" fill="#4a4f57">{t}</text>)}
      <line x1={L} x2={R} y1={Y(METHOD.q + 5)} y2={Y(METHOD.q + 5)} stroke="#d97706" strokeDasharray="4 3" />
      <text x={R - 2} y={Y(METHOD.q + 5) - 3} fontSize="9" textAnchor="end" fill="#b45309">Q + 5 %</text>
      <line x1={X(METHOD.qTimeMin)} x2={X(METHOD.qTimeMin)} y1={T} y2={B} stroke="#d97706" strokeDasharray="2 3" />
      <line x1={L} x2={R} y1={B} y2={B} stroke="#16181d" />
      <line x1={L} x2={L} y1={T} y2={B} stroke="#16181d" />
      {rows.length > 1 && <polyline points={line("uncorrected")} fill="none" stroke="#9fb3c6" strokeDasharray="3 2" />}
      {rows.length > 1 && <polyline points={line("corrected")} fill="none" stroke="#1C7BD9" strokeWidth="1.6" />}
      {rows.map((r, i) => <circle key={i} cx={X(r.t)} cy={Y(r.corrected)} r="3.5" fill="#21B67A" stroke="#fff" />)}
      <text x={(L + R) / 2} y={H - 3} fontSize="10" textAnchor="middle" fill="#16181d">time (min)</text>
      <text x={9} y={(T + B) / 2} fontSize="10" textAnchor="middle" fill="#16181d" transform={`rotate(-90 9 ${(T + B) / 2})`}>% of label</text>
    </svg>
  );
}

function ProfileTable({ s }: { s: S }) {
  const rows = profile(s);
  if (!rows.length) return <p className="text-sm text-[#4a4f57]">No absorbance recorded yet.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-[#16181d]/10">
      <table className="w-full text-left text-[13px] tabular-nums">
        <thead className="bg-[#16181d]/[0.03] text-[11px] uppercase tracking-wide text-[#4a4f57]">
          <tr><th className="px-2 py-1">t (min)</th><th className="px-2 py-1">A</th><th className="px-2 py-1">DF</th><th className="px-2 py-1">mg/mL</th><th className="px-2 py-1">% corr.</th><th className="px-2 py-1">% uncorr.</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.nominal} className="border-t border-[#16181d]/[0.06]">
              <td className="px-2 py-1">{r.t.toFixed(1)}</td><td className="px-2 py-1">{r.a.toFixed(3)}</td><td className="px-2 py-1">{r.df}</td><td className="px-2 py-1">{r.cMgPerMl.toFixed(4)}</td><td className="px-2 py-1 font-semibold">{r.corrected.toFixed(1)}</td><td className="px-2 py-1">{r.uncorrected.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Panels ────────────────────────────────────────────────────────────────

function Notebook({ s, act }: P) {
  const e = expected(s);
  const solDone = s.calcParts !== null;
  return (
    <div className="space-y-3">
      <Group title="Activity" note="Solubility first: the sink check before the tablet goes in needs your solubility result.">
        <Hl type="activity">
          <Row>
            <ActBtn act={act} a={{ type: "activity", activity: "solubility" }} variant={s.activity === "solubility" ? "primary" : "secondary"}>A · Solubility{solDone ? " ✓" : ""}</ActBtn>
            <ActBtn act={act} a={{ type: "activity", activity: "dissolution" }} variant={s.activity === "dissolution" ? "primary" : "secondary"}>B · Dissolution{s.verdict ? " ✓" : ""}</ActBtn>
          </Row>
        </Hl>
      </Group>
      {s.activity === "solubility" ? (
        <>
          {s.calcSol ? <Note>Solubility {s.calcSol.gPer100.toFixed(3)} g/100 mL = {s.calcSol.mgPerMl.toFixed(2)} mg/mL.</Note> : e.gPer100 !== null ? <SolubilityCalc s={s} act={act} /> : <Note>Dry the residue to constant mass; the calculation opens with your weighings.</Note>}
          {s.calcSol && (s.calcParts ? <Note>{s.calcParts.parts.toFixed(1)} parts of water per part → {s.calcParts.term}.</Note> : <PartsCalc s={s} act={act} />)}
        </>
      ) : (
        <>
          {s.sinkMl !== null ? (
            <Note>Sink check: the dose saturates {s.sinkMl.toFixed(1)} mL; {METHOD.mediumMl} mL is {(METHOD.mediumMl / s.sinkMl).toFixed(1)}× that.</Note>
          ) : s.calcSol ? (
            <OneNumberCalc s={s} act={act} calc="sink" title="Sink-condition check" label={`Volume ${METHOD.doseMg} mg would saturate`} unit="mL" type="calcSink" make={(volumeMl) => ({ type: "calcSink", volumeMl })} note="Sink conditions: medium ≥ 3 × this volume." />
          ) : (
            <Note>Finish the solubility activity first: the sink check uses its result.</Note>
          )}
          {profile(s).length > 0 && (
            <Group title="Profile (your recorded samples)">
              <ProfileChart s={s} />
              <Simulated />
            </Group>
          )}
          {s.vessel.stopped && s.samples.every((x) => x.absRecorded !== null) && (
            <>
              {s.qPercent !== null ? (
                <Note>{s.qPercent.toFixed(1)} % dissolved at {METHOD.qTimeMin} min (corrected).</Note>
              ) : e.q !== null ? (
                <OneNumberCalc s={s} act={act} calc="dissolved" title={`% dissolved at ${METHOD.qTimeMin} min (corrected)`} label="% of label claim" unit="%" type="calcDissolved" make={(percent) => ({ type: "calcDissolved", percent })} />
              ) : null}
              {s.verdict ? <Note>Verdict recorded.</Note> : (s.qPercent !== null || e.q === null) && <Verdict s={s} act={act} />}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Balance({ s, act }: P) {
  const reading = balanceReading(s);
  const dishOn = s.dish.where === "balance";
  const canRecord = dishOn && (s.emptyRecorded === null || (s.dish.ovenH > 0 && s.dish.liquidMl === 0));
  return (
    <div className="space-y-2.5">
      <Lcd value={`${reading.toFixed(4)} g`} sub={dishOn ? "dish on the pan" : s.boat.on ? "boat on the pan" : "pan empty"} />
      {canRecord && (
        <Hl type="recordMass">
          <ReadingField key={`${s.weighings.length}-${s.emptyRecorded}`} label={s.emptyRecorded === null ? "Empty dish mass" : "Dish + residue"} unit="g" placeholder="0.0000" onSubmit={(value) => act({ type: "recordMass", value })} />
        </Hl>
      )}
      <Group title="Powder">
        <Row>
          <ActBtn act={act} a={{ type: "placeBoat" }}>{s.boat.on ? "Boat off" : "Boat on"}</ActBtn>
          <ActBtn act={act} a={{ type: "tare" }} disabled={!s.boat.on}>Tare</ActBtn>
          <ActBtn act={act} a={{ type: "addDrug" }} disabled={!s.boat.on}>Add a scoop</ActBtn>
          <ActBtn act={act} a={{ type: "drugToFlask" }} disabled={s.boat.drugG <= 0} variant="primary">Tip into flask</ActBtn>
        </Row>
      </Group>
      <Row>
        <ActBtn act={act} a={{ type: "dishOnBalance" }}>{dishOn ? "Dish off the pan" : "Dish on the pan"}</ActBtn>
      </Row>
      {(s.emptyRecorded !== null || s.weighings.length > 0) && (
        <p className="text-xs text-[#4a4f57]">
          Recorded: empty {s.emptyRecorded?.toFixed(4) ?? "—"} g{s.weighings.map((w) => ` · ${w.g.toFixed(4)} g (${w.ovenH} h)`).join("")}
        </p>
      )}
    </div>
  );
}

function Water({ act }: P) {
  return <ActBtn act={act} a={{ type: "dispenseWater" }} variant="primary">Dispense {METHOD.waterMl}.0 mL into the flask</ActBtn>;
}

function Flask({ s, act }: P) {
  return (
    <div className="flex items-start gap-3">
      <FlaskView s={s} />
      <div className="min-w-0 space-y-2">
        <Row>
          <ActBtn act={act} a={{ type: "dispenseWater" }} disabled={s.flask.waterMl > 0}>Add water</ActBtn>
          <ActBtn act={act} a={{ type: "stopper" }}>{s.flask.stoppered ? "Unstopper" : "Stopper"}</ActBtn>
          <ActBtn act={act} a={{ type: "flaskToBath" }} disabled={s.flask.inBath}>Into the bath</ActBtn>
        </Row>
        <p className="text-xs text-[#4a4f57]">{s.flask.inBath ? "Clamped in the shaking bath." : "On the bench."}</p>
      </div>
    </div>
  );
}

function WaterBath({ s, act }: P) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Lcd value={s.bath.setC ? `${s.bath.setC.toFixed(1)} °C` : "OFF"} sub="bath" tone="blue" />
        <Lcd value={`${s.eqH} h`} sub="shaken at this setting" tone="blue" />
      </div>
      {s.flask.inBath && <div className="flex items-center gap-3"><FlaskView s={s} /><p className="text-xs text-[#4a4f57]">Look at the flask&apos;s floor before you sample.</p></div>}
      <Group title="Set-point">
        <Row>
          {[0, ...METHOD.bathOptions].map((c) => <ActBtn key={c} act={act} a={{ type: "bathSet", c }} variant={s.bath.setC === c ? "soft" : "secondary"}>{c ? `${c} °C` : "Off"}</ActBtn>)}
          <ActBtn act={act} a={{ type: "shake", on: !s.bath.shaking }} variant={s.bath.shaking ? "soft" : "secondary"}>{s.bath.shaking ? "Shaker off" : "Shaker on"}</ActBtn>
        </Row>
      </Group>
      <Group title="Time">
        <Row>{[1, 4, 12, 24].map((h) => <ActBtn key={h} act={act} a={{ type: "waitHours", hours: h }}>+{h} h</ActBtn>)}</Row>
      </Group>
      <ActBtn act={act} a={{ type: "warmFilter" }} disabled={s.filterWarm}>{s.filterWarm ? "Syringe filter warm ✓" : "Warm the syringe filter here"}</ActBtn>
    </div>
  );
}

function Syringe({ s, act }: P) {
  return (
    <div className="space-y-2">
      <Note>{s.syringeMl > 0 ? `${s.syringeMl} mL of filtrate in the syringe.` : s.filterWarm ? `Syringe and filter at ${s.bath.setC} °C.` : "Syringe and filter at room temperature."}</Note>
      <Row>
        <ActBtn act={act} a={{ type: "warmFilter" }} disabled={s.filterWarm}>Pre-warm in the bath</ActBtn>
        <ActBtn act={act} a={{ type: "filter" }} variant="primary" disabled={s.filtrateGPerMl !== null}>Draw and filter ~{METHOD.filterDrawMl} mL</ActBtn>
      </Row>
    </div>
  );
}

function Dilutions({ s, act }: { s: S; act: P["act"] }) {
  const i = nextToMeasure(s);
  if (i < 0) return <p className="text-sm text-[#4a4f57]">No sample waiting.</p>;
  const x = s.samples[i];
  return (
    <Group title={`Sample ${i + 1} (${x.nominal} min)`} note={x.df ? `Prepared: ${x.df === 1 ? "undiluted" : `1 in ${x.df}`}.` : "Dilute with medium so the reading falls in the calibration range."}>
      <Hl type="dilute">
        <Row>{METHOD.dilutions.map((f) => <ActBtn key={f} act={act} a={{ type: "dilute", factor: f }} variant={x.df === f ? "soft" : "secondary"}>{f === 1 ? "Neat" : `1 in ${f}`}</ActBtn>)}</Row>
      </Hl>
    </Group>
  );
}

function Pipette({ s, act }: P) {
  return (
    <div className="space-y-2.5">
      <ActBtn act={act} a={{ type: "pipetteToDish" }} variant="primary" disabled={s.dish.liquidMl > 0 || s.dish.ovenH > 0}>Pipette {METHOD.aliquotMl.toFixed(2)} mL into the dish</ActBtn>
      {s.samples.length > 0 && <Dilutions s={s} act={act} />}
    </div>
  );
}

function dishText(s: S) {
  const d = s.dish;
  if (d.liquidMl > 0) return `${d.liquidMl.toFixed(2)} mL of filtrate in the dish.`;
  if (d.residueG > 0) return `White residue, dried ${d.ovenH} h${d.hot ? " — still hot" : ""}.`;
  return "Empty, clean and dry.";
}

function Dish({ s, act }: P) {
  return (
    <div className="space-y-2">
      <Note>{dishText(s)}</Note>
      <Row>
        <ActBtn act={act} a={{ type: "dishOnBalance" }}>{s.dish.where === "balance" ? "Off the balance" : "On the balance"}</ActBtn>
        <ActBtn act={act} a={{ type: "pipetteToDish" }} disabled={s.dish.liquidMl > 0 || s.dish.ovenH > 0}>Pipette aliquot in</ActBtn>
        <ActBtn act={act} a={{ type: "dishToOven" }}>Into the oven</ActBtn>
        <ActBtn act={act} a={{ type: "cool" }} disabled={!s.dish.hot}>Desiccator</ActBtn>
      </Row>
    </div>
  );
}

function Oven({ s, act }: P) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Lcd value={s.oven.setC ? `${s.oven.setC} °C` : "OFF"} sub="oven" tone="amber" />
        <Lcd value={`${s.dish.ovenH} h`} sub="dish dried" tone="amber" />
      </div>
      <Note>{s.dish.where === "oven" ? "The dish is on the oven shelf." : dishText(s)}</Note>
      <Row>
        {[0, ...METHOD.ovenOptions].map((c) => <ActBtn key={c} act={act} a={{ type: "ovenSet", c }} variant={s.oven.setC === c ? "soft" : "secondary"}>{c ? `${c} °C` : "Off"}</ActBtn>)}
      </Row>
      <Row>
        {s.dish.where === "oven" ? (
          <>
            <ActBtn act={act} a={{ type: "dry", hours: 1 }}>Dry 1 h</ActBtn>
            <ActBtn act={act} a={{ type: "dry", hours: 2 }}>Dry 2 h</ActBtn>
            <ActBtn act={act} a={{ type: "removeDish" }} variant="primary">Take out (tongs)</ActBtn>
          </>
        ) : (
          <>
            <ActBtn act={act} a={{ type: "dishToOven" }}>Dish in</ActBtn>
            <ActBtn act={act} a={{ type: "cool" }} disabled={!s.dish.hot}>Cool in the desiccator</ActBtn>
          </>
        )}
      </Row>
    </div>
  );
}

function Cylinder({ s, act }: P) {
  const near = s.cyl.ml >= 750;
  return (
    <div className="flex items-start gap-3">
      <ScaleWindow label="1000 mL measuring cylinder, magnified" level={s.cyl.ml > 0 ? s.cyl.ml : null} from={near ? 800 : 0} to={1000} minor={near ? 10 : 50} major={near ? 50 : 200} liquid="#e4f0fb" height={200} />
      <div className="min-w-0 flex-1 space-y-2">
        <Row>{[100, 50, 10, 5, -5, -10].map((ml) => <ActBtn key={ml} act={act} a={{ type: "pourMedium", ml }}>{ml > 0 ? `+${ml}` : ml}</ActBtn>)}</Row>
        <Hl type="readCylinder">
          <ReadingField key={s.cyl.ml} label="Volume read" unit="mL" onSubmit={(value) => act({ type: "readCylinder", value })} disabled={s.cyl.ml <= 0} />
        </Hl>
        <ActBtn act={act} a={{ type: "mediumToVessel" }} variant="primary" disabled={s.cyl.read === null}>Pour into the vessel</ActBtn>
      </div>
    </div>
  );
}

function TesterReadout({ s }: { s: S }) {
  const v = s.vessel;
  return (
    <div className="grid grid-cols-3 gap-2">
      <Lcd value={`${v.tempC.toFixed(1)}`} sub="°C medium" tone="blue" />
      <Lcd value={`${v.running && !v.stopped ? v.rpm : 0}`} sub={`rpm (set ${v.rpm})`} tone="blue" />
      <Lcd value={mmss(v.t)} sub="timer" tone="blue" />
    </div>
  );
}

function VerifyForm({ s, act }: { s: S; act: P["act"] }) {
  const [t, setT] = useState("");
  const [r, setR] = useState("");
  return (
    <Hl type="verify">
      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <Field label="Thermometer" value={t} onChange={setT} unit="°C" />
        <Field label="Tachometer" value={r} onChange={setR} unit="rpm" />
        <ActBtn act={act} variant="primary" disabled={!t || !r} a={{ type: "verify", tempC: num(t), rpm: num(r) }}>Verify</ActBtn>
      </div>
      {s.vessel.verified && <p className="mt-1 text-xs text-[#137a52]">Verified {s.vessel.verified.tempC.toFixed(1)} °C, {s.vessel.verified.rpm} rpm.</p>}
    </Hl>
  );
}

function Tester({ s, act }: P) {
  const v = s.vessel;
  return (
    <div className="space-y-2.5">
      <TesterReadout s={s} />
      {!v.tabletIn ? (
        <>
          <Row>
            {METHOD.testerTempOptions.map((c) => <ActBtn key={c} act={act} a={{ type: "testerTemp", c }} variant={v.setC === c ? "soft" : "secondary"}>{c} °C</ActBtn>)}
          </Row>
          <Row>
            {METHOD.rpmOptions.map((rpm) => <ActBtn key={rpm} act={act} a={{ type: "testerRpm", rpm }} variant={v.rpm === rpm ? "soft" : "secondary"}>{rpm} rpm</ActBtn>)}
          </Row>
          <Row>{[0.5, 1, 5].map((m) => <ActBtn key={m} act={act} a={{ type: "waitMin", minutes: m }}>+{m} min</ActBtn>)}</Row>
          <VerifyForm s={s} act={act} />
          <ActBtn act={act} a={{ type: "dropTablet" }} variant="primary">Drop the tablet and start</ActBtn>
        </>
      ) : (
        <>
          <Schedule s={s} />
          <Row>
            {[0.5, 1, 5].map((m) => <ActBtn key={m} act={act} a={{ type: "waitMin", minutes: m }} disabled={v.stopped}>+{m} min</ActBtn>)}
            <ActBtn act={act} a={{ type: "replace" }} disabled={!v.pendingReplace}>Replace {METHOD.sampleMl} mL</ActBtn>
            <ActBtn act={act} a={{ type: "stopTest" }} disabled={v.stopped}>Stop</ActBtn>
          </Row>
          <Simulated />
        </>
      )}
      {(v.stopped || !v.tabletIn) && <Row>{v.setC > 0 && <ActBtn act={act} a={{ type: "testerTemp", c: 0 }}>Heater off</ActBtn>}</Row>}
    </div>
  );
}

function Sampler({ s, act }: P) {
  const v = s.vessel;
  return (
    <div className="space-y-2.5">
      <TesterReadout s={s} />
      <Schedule s={s} />
      <Row>
        <ActBtn act={act} a={{ type: "withdraw" }} variant="primary" disabled={!v.running || v.stopped}>Withdraw {METHOD.sampleMl} mL</ActBtn>
        <ActBtn act={act} a={{ type: "replace" }} disabled={!v.pendingReplace}>Replace with warm medium</ActBtn>
      </Row>
      <Row>{[0.5, 1, 5].map((m) => <ActBtn key={m} act={act} a={{ type: "waitMin", minutes: m }} disabled={!v.running || v.stopped}>+{m} min</ActBtn>)}</Row>
    </div>
  );
}

function Spectro({ s, act }: P) {
  const d = spectroDisplay(s);
  const i = nextToMeasure(s);
  return (
    <div className="space-y-2.5">
      <Lcd value={d === null ? "—" : d === "OVER" ? "OVER" : `A ${d.toFixed(3)}`} sub={`243 nm · ${s.spectro.cuvette === "blank" ? "blank" : s.spectro.cuvette === "sample" ? `sample ${i + 1}` : "no cuvette"}`} />
      {s.spectro.cuvette === "sample" && typeof d === "number" && (
        <Hl type="recordAbs">
          <ReadingField key={`${i}-${s.samples[i]?.df}`} label={`Absorbance, sample ${i + 1}`} placeholder="0.000" onSubmit={(value) => act({ type: "recordAbs", value })} />
        </Hl>
      )}
      <Row>
        <ActBtn act={act} a={{ type: "blank" }}>{s.spectro.blanked ? "Re-blank" : "Blank on medium"}</ActBtn>
        <ActBtn act={act} a={{ type: "loadSample" }} disabled={i < 0}>Load next sample</ActBtn>
      </Row>
      {s.samples.length > 0 && <Dilutions s={s} act={act} />}
      <p className="text-[11px] text-[#4a4f57]">Teaching calibration: A = {METHOD.slope}·C (µg/mL) + {METHOD.intercept}, linear to A = {METHOD.linearMax.toFixed(1)}. A real test compares with USP Acetaminophen RS.</p>
      <ProfileTable s={s} />
    </div>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel, plus the shared fixtures. */
export const SOLUBILITY_DISSOLUTION_CONTROLS: Record<string, ComponentType<P>> = {
  ...commonControls<S, A>(KIT, (s) => s.bench),
  notebook: Notebook,
  balance: Balance,
  water: Water,
  flask: Flask,
  "water-bath": WaterBath,
  syringe: Syringe,
  pipette: Pipette,
  dish: Dish,
  oven: Oven,
  cylinder: Cylinder,
  tester: Tester,
  sampler: Sampler,
  spectro: Spectro,
};
