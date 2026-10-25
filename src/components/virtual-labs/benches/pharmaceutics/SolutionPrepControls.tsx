"use client";

/**
 * Solution preparation & dilution — instrument controllers (2026-10-25). Each panel opens only when
 * its equipment is selected in the room (or the 2D bench plan); the run machine refuses an action from
 * any other instrument. Panels show what the instrument shows: the balance LCD prints its reading
 * (that is what a balance does); the volumetric flasks' necks and the pipette are DRAWN — the meniscus
 * against the mark — and never printed as numbers, so the student reads the mark, as at the bench.
 * Every number comes from the experiment module; nothing is computed here.
 */
import { useState, type ComponentType, type ReactNode } from "react";
import {
  ALIQUOT_VESSELS,
  KIT,
  METHOD,
  SOLUTE_OPTIONS,
  STOCK_VESSELS,
  balanceReading,
  flaskMixed,
  flaskMl,
  taskOf,
  workedSolution,
  type CalcId,
  type FlaskState,
  type SolutionPrepAction,
  type SolutionPrepState,
} from "@/lib/virtual-labs/experiments/pharmaceutics/solutionPrep";
import { Btn, Choice, ReadingField } from "../../interface/ui";
import { ActBtn, Group, Hl, useControlMode } from "../../interface/controls";
import { Lcd } from "../instruments2d";
import type { BenchProps } from "../types";
import { commonControls } from "./CommonControls";

type P = BenchProps<SolutionPrepState, SolutionPrepAction>;
type FlaskId = "flask-a" | "flask-b";

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{children}</p>;
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/**
 * A one-mark neck (flask or pipette), magnified: the mark ring and the true meniscus, no scale and no
 * number. The window covers only the last part of the fill, so a level far below shows as "not yet
 * in view" in words that give nothing away.
 */
function MarkView({ level, mark, from, to, label, narrow = false }: { level: number | null; mark: number; from: number; to: number; label: string; narrow?: boolean }) {
  const W = 120;
  const H = 200;
  const x0 = narrow ? 48 : 36;
  const x1 = narrow ? 72 : 84;
  const y = (v: number) => H - ((v - from) / (to - from)) * H;
  const inView = level !== null && level >= from;
  const ly = level === null ? H + 20 : Math.max(-10, y(Math.min(level, to + 0.2)));
  const my = y(mark);
  const dip = narrow ? 4 : 7;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[140px] rounded-xl border border-[#16181d]/10 bg-[#f7fafc]" role="img" aria-label={`${label}, magnified. Read the bottom of the meniscus against the mark at eye level.`}>
      <rect x={x0} y="0" width={x1 - x0} height={H} fill="#ffffff" opacity="0.6" />
      {inView && (
        <>
          <rect x={x0} y={ly - dip} width={x1 - x0} height={H - ly + dip} fill="#cfe6fb" opacity="0.8" />
          {/* concave meniscus: its bottom sits exactly at the true level */}
          <path d={`M${x0} ${ly - dip} Q${(x0 + x1) / 2} ${ly + dip} ${x1} ${ly - dip}`} fill="none" stroke="#3d79b8" strokeWidth="1.6" />
        </>
      )}
      {/* the graduation mark: a ring etched round the neck */}
      <line x1={x0 - 10} x2={x1 + 10} y1={my} y2={my} stroke="#1b1f26" strokeWidth="1.4" />
      <text x={x1 + 12} y={my + 4} fontSize="10" fill="#1b1f26">mark</text>
      <line x1={x0} x2={x0} y1="0" y2={H} stroke="#9fb3c6" />
      <line x1={x1} x2={x1} y1="0" y2={H} stroke="#9fb3c6" />
      {!inView && (
        <text x={W / 2} y={H - 12} fontSize="10" textAnchor="middle" fill="#4a4f57">{level === null ? "empty" : "level not yet in view"}</text>
      )}
    </svg>
  );
}

function FlaskNeck({ f, id }: { f: FlaskState; id: FlaskId }) {
  const ml = flaskMl(f);
  return <MarkView level={ml > 0 ? ml : null} mark={METHOD.flaskMl} from={METHOD.flaskMl - 0.8} to={METHOD.flaskMl + 0.3} label={id === "flask-a" ? "Neck of flask A" : "Neck of flask B"} />;
}

/** Words for a flask's condition — never its volume. */
function flaskWords(f: FlaskState) {
  const parts = [f.stoppered ? "stoppered" : "open"];
  if (f.solidG > METHOD.solidThresholdG) parts.push("crystals on the bottom");
  if (f.stoppered) parts.push(flaskMixed(f) ? "mixed" : f.inversions > 0 ? `inverted ${f.inversions}×` : "not yet mixed");
  if (f.labelled) parts.push("labelled");
  return parts.join(" · ");
}

function MakeUpButtons({ act, target }: { act: P["act"]; target: FlaskId }) {
  return (
    <Group title="Purified water">
      <Row>
        <ActBtn act={act} a={{ type: "addWater", target, amount: "fill" }}>Fill to the neck</ActBtn>
        <ActBtn act={act} a={{ type: "addWater", target, amount: "squirt" }}>Squirt</ActBtn>
        <ActBtn act={act} a={{ type: "addWater", target, amount: "drop" }}>1 drop</ActBtn>
        <ActBtn act={act} a={{ type: "addWater", target, amount: "drops5" }}>5 drops</ActBtn>
      </Row>
    </Group>
  );
}

function FinishButtons({ s, act, id }: { s: SolutionPrepState; act: P["act"]; id: FlaskId }) {
  const f = id === "flask-a" ? s.flaskA : s.flaskB;
  return (
    <Row>
      {f.solidG > METHOD.solidThresholdG && !f.stoppered && <ActBtn act={act} a={{ type: "swirl", flask: id }}>Swirl</ActBtn>}
      <ActBtn act={act} a={{ type: "stopper", flask: id, on: !f.stoppered }} variant={f.stoppered ? "soft" : "secondary"}>{f.stoppered ? "Unstopper" : "Stopper"}</ActBtn>
      <ActBtn act={act} a={{ type: "invert", flask: id }} disabled={!f.stoppered}>Invert ×5</ActBtn>
      <ActBtn act={act} a={{ type: "label", flask: id }} variant="primary" disabled={f.labelled}>{f.labelled ? "Labelled" : "Label"}</ActBtn>
    </Row>
  );
}

// ── Lab notebook ───────────────────────────────────────────────────────────

function Worked({ s, act, calc }: { s: SolutionPrepState; act: P["act"]; calc: CalcId }) {
  const mode = useControlMode();
  const viewed = s.worked[calc];
  if (viewed) {
    return (
      <ol className="list-decimal space-y-1 rounded-xl border border-brandBlue/20 bg-brandBlue/[0.04] py-2 pl-7 pr-3 text-sm">
        {workedSolution(s, calc).map((line) => <li key={line}>{line}</li>)}
        <li className="list-none text-xs text-[#4a4f57]">{viewed === "practical" ? "Viewed in Practical: −4 technique marks." : "Learning mode: free."}</li>
      </ol>
    );
  }
  if (mode === "practical" && s.attempts[calc] === 0) return <p className="text-xs text-[#4a4f57]">A worked solution is offered after your first attempt (it costs 4 technique marks).</p>;
  return (
    <ActBtn act={act} a={{ type: "worked", calc, mode }} variant="soft">
      {mode === "practical" ? "Show worked solution (−4 marks)" : "Show worked solution"}
    </ActBtn>
  );
}

function PlanForm({ act }: { act: P["act"] }) {
  const [stock, setStock] = useState<string | null>(null);
  const [aliquot, setAliquot] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <Group title="Make up the 100.0 mL volumes in">
        <Choice name="Final-volume vessel" value={stock} onChange={setStock} options={STOCK_VESSELS.map((o) => ({ id: o.id, label: o.text }))} />
      </Group>
      <Group title="Measure the stock for B with">
        <Choice name="Aliquot vessel" value={aliquot} onChange={setAliquot} options={ALIQUOT_VESSELS.map((o) => ({ id: o.id, label: o.text }))} />
      </Group>
      <Btn variant="primary" size="sm" disabled={!stock || !aliquot} onClick={() => stock && aliquot && act({ type: "plan", stock, aliquot })}>Confirm the plan</Btn>
    </div>
  );
}

function ResultsForm({ unit, act }: { unit: string; act: P["act"] }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const n = (x: string) => Number(x.trim().replace(",", "."));
  return (
    <form
      className="grid grid-cols-2 gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (a && b) act({ type: "recordResults", a: n(a), b: n(b) });
      }}
    >
      <label className="text-sm font-semibold">
        A ({unit})
        <input inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-2 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        B ({unit})
        <input inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-2 font-mono" />
      </label>
      <Btn type="submit" variant="primary" size="sm" className="col-span-2" disabled={!a || !b}>Record and verify</Btn>
    </form>
  );
}

function Notebook({ s, act }: P) {
  const t = taskOf(s);
  let entry: ReactNode;
  if (!s.identified) {
    entry = (
      <Group title="Identify the solute">
        <Hl type="identify">
          <Choice name="Solute" value={null} onChange={(choice) => act({ type: "identify", choice })} options={SOLUTE_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} />
        </Hl>
      </Group>
    );
  } else if (!s.planned) {
    entry = (
      <Hl type="plan">
        <PlanForm act={act} />
      </Hl>
    );
  } else if (s.calcMass === null) {
    entry = (
      <div className="space-y-2">
        <Hl type="calcMass">
          <ReadingField label={`Mass of NaCl for 100.0 mL of ${t.stockText}`} unit="g" placeholder="0.0000" buttonLabel="Check" onSubmit={(value) => act({ type: "calcMass", value })} />
        </Hl>
        <Worked s={s} act={act} calc="mass" />
      </div>
    );
  } else if (s.calcV1 === null) {
    entry = (
      <div className="space-y-2">
        <Hl type="calcDilution">
          <ReadingField label={`V₁ of stock for 100.0 mL of ${t.diluteText} (C₁V₁ = C₂V₂)`} unit="mL" placeholder="0.00" buttonLabel="Check" onSubmit={(value) => act({ type: "calcDilution", value })} />
        </Hl>
        <Worked s={s} act={act} calc="dilution" />
      </div>
    );
  } else if (s.results === null && s.flaskB.labelled) {
    entry = (
      <div className="space-y-2">
        <p className="text-sm font-semibold">Both concentrations from YOUR recorded mass and the glassware volumes, 4 significant figures:</p>
        <Hl type="recordResults">
          <ResultsForm unit={t.unit} act={act} />
        </Hl>
        <Worked s={s} act={act} calc="results" />
      </div>
    );
  } else {
    entry = (
      <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-3 gap-y-1 rounded-xl border border-[#16181d]/10 bg-white px-3 py-2 text-sm">
        <dt className="text-[#4a4f57]">Mass (calc. / recorded)</dt>
        <dd>{s.calcMass.toFixed(4)} g / {s.massRecorded !== null ? `${s.massRecorded.toFixed(4)} g` : "—"}</dd>
        <dt className="text-[#4a4f57]">V₁</dt>
        <dd>{s.calcV1.toFixed(2)} mL</dd>
        <dt className="text-[#4a4f57]">A / B</dt>
        <dd>{s.results ? `${s.results.a} / ${s.results.b} ${t.unit}` : "after both are labelled"}</dd>
      </dl>
    );
  }
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-brandBlue/[0.05] p-3 text-sm text-[#1b4f86]">
        <span className="font-semibold">Task:</span> prepare 100.0 mL of sodium chloride <span className="font-semibold">{t.stockText}</span> (A), then 100.0 mL of <span className="font-semibold">{t.diluteText}</span> (B) from it by dilution. <span className="text-xs">Teaching values — a practice solution, not for use.</span>
      </p>
      {entry}
    </div>
  );
}

// ── Analytical balance ─────────────────────────────────────────────────────

function Balance({ s, act }: P) {
  const reading = balanceReading(s);
  const sub = `● stable · ${s.boatOn ? (s.tareG ? "tared" : "not tared") : "pan empty"}`;
  return (
    <div className="space-y-3">
      <Lcd value={`${reading.toFixed(4)} g`} sub={sub} />
      {s.massRecorded === null ? (
        <>
          <Row>
            <ActBtn act={act} a={{ type: "placeBoat" }} disabled={s.boatOn}>Boat on pan</ActBtn>
            <ActBtn act={act} a={{ type: "tare" }}>Tare → 0</ActBtn>
          </Row>
          <Group title="Sodium chloride (spatula)">
            <Row>
              <ActBtn act={act} a={{ type: "addSolid", amount: "scoop" }}>+ Scoop</ActBtn>
              <ActBtn act={act} a={{ type: "addSolid", amount: "small" }}>+ Small</ActBtn>
              <ActBtn act={act} a={{ type: "addSolid", amount: "tap" }}>+ Tap</ActBtn>
              <ActBtn act={act} a={{ type: "removeSolid" }}>− A little</ActBtn>
            </Row>
          </Group>
          <Hl type="recordMass">
            <ReadingField label={`Record the mass${s.calcMass !== null ? ` (target ${s.calcMass.toFixed(4)} g ± ${METHOD.weighTolerance * 100} %)` : ""}`} unit="g" placeholder="0.0000" onSubmit={(value) => act({ type: "recordMass", value })} />
          </Hl>
        </>
      ) : (
        <>
          <Note>Recorded: {s.massRecorded.toFixed(4)} g.{s.boatUsed ? " The salt is in the beaker." : ""}</Note>
          {!s.boatUsed && <ActBtn act={act} a={{ type: "tipIntoBeaker" }} variant="primary">Tip the salt into the beaker</ActBtn>}
        </>
      )}
    </div>
  );
}

// ── Beaker and rod ─────────────────────────────────────────────────────────

function beakerWords(s: SolutionPrepState) {
  const b = s.beaker;
  if (s.transferred) return "Poured into flask A.";
  if (b.water === 0 && b.solidG === 0) return "Empty.";
  const water = b.water === 0 ? "no water yet" : `about ${Math.round(b.water / 5) * 5} mL of water`;
  const solid = b.solidG > 0.3 * (s.massRecorded ?? 1) ? "a heap of crystals" : b.solidG > METHOD.solidThresholdG ? "a few crystals left — look closely" : b.dissolvedG > 0 ? "no crystals: a clear solution" : "";
  return [water, solid].filter(Boolean).join(" · ");
}

function Beaker({ s, act }: P) {
  return (
    <div className="space-y-3">
      <Note>{beakerWords(s)}</Note>
      {!s.transferred && (
        <>
          <Row>
            {!s.boatUsed && <ActBtn act={act} a={{ type: "tipIntoBeaker" }}>Tip the salt in</ActBtn>}
            {s.boatUsed && !s.boatRinsed && <ActBtn act={act} a={{ type: "rinseBoat" }}>Wash the boat in</ActBtn>}
            <ActBtn act={act} a={{ type: "addWater", target: "beaker", amount: "portion" }}>+ {METHOD.beakerPortionMl} mL water</ActBtn>
            <ActBtn act={act} a={{ type: "stir" }}>Stir 30 s</ActBtn>
          </Row>
          <ActBtn act={act} a={{ type: "transfer" }} variant="primary">Pour into flask A, down the rod</ActBtn>
        </>
      )}
    </div>
  );
}

// ── Wash bottle ──────────────────────────────────────────────────────────

function RinseButtons({ s, act }: { s: SolutionPrepState; act: P["act"] }) {
  return (
    <Group title="Rinse into flask A" note={`Beaker ×${s.rinses.beaker} · rod ×${s.rinses.rod} · funnel ×${s.rinses.funnel}`}>
      <Row>
        {(["beaker", "rod", "funnel"] as const).map((item) => (
          <ActBtn key={item} act={act} a={{ type: "rinseInto", item }}>Rinse the {item}</ActBtn>
        ))}
      </Row>
    </Group>
  );
}

function WashBottle({ s, act }: P) {
  if (!s.transferred) {
    return (
      <div className="space-y-3">
        <Note>{beakerWords(s)}</Note>
        <Row>
          {s.boatUsed && !s.boatRinsed && <ActBtn act={act} a={{ type: "rinseBoat" }}>Wash the boat into the beaker</ActBtn>}
          <ActBtn act={act} a={{ type: "addWater", target: "beaker", amount: "portion" }}>+ {METHOD.beakerPortionMl} mL to the beaker</ActBtn>
        </Row>
      </div>
    );
  }
  if (!s.funnelRemoved) return <RinseButtons s={s} act={act} />;
  const target: FlaskId | null = !s.flaskA.labelled ? "flask-a" : s.aliquotMl !== null && !s.flaskB.labelled ? "flask-b" : null;
  if (!target) return <Note>Nothing to make up just now.</Note>;
  const f = target === "flask-a" ? s.flaskA : s.flaskB;
  return (
    <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3">
      <FlaskNeck f={f} id={target} />
      <div className="min-w-0 space-y-2">
        <p className="text-xs text-[#4a4f57]">Making up {target === "flask-a" ? "flask A" : "flask B"} · {flaskWords(f)}</p>
        <MakeUpButtons act={act} target={target} />
      </div>
    </div>
  );
}

// ── Volumetric flasks ──────────────────────────────────────────────────────

function FlaskA({ s, act }: P) {
  const f = s.flaskA;
  if (!s.transferred) {
    return (
      <div className="space-y-3">
        <Note>{s.funnelIn ? "Funnel in the neck. Pour the solution in from the beaker." : "Clean and empty."}</Note>
        <Row>
          {!s.funnelIn && <ActBtn act={act} a={{ type: "placeFunnel" }}>Funnel in the neck</ActBtn>}
          <ActBtn act={act} a={{ type: "transfer" }} variant="primary">Pour the beaker in</ActBtn>
        </Row>
      </div>
    );
  }
  if (!s.funnelRemoved) {
    return (
      <div className="space-y-3">
        <RinseButtons s={s} act={act} />
        <ActBtn act={act} a={{ type: "removeFunnel" }}>Lift the funnel out</ActBtn>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3">
        <FlaskNeck f={f} id="flask-a" />
        <div className="min-w-0 space-y-2">
          <p className="text-xs text-[#4a4f57]">{flaskWords(f)}</p>
          {s.results === null ? <MakeUpButtons act={act} target="flask-a" /> : <ActBtn act={act} a={{ type: "empty", flask: "flask-a" }}>Empty for disposal</ActBtn>}
        </div>
      </div>
      {s.results === null && <FinishButtons s={s} act={act} id="flask-a" />}
      {s.results === null && s.aliquotMl === null && (
        <ActBtn act={act} a={{ type: "discard", flask: "flask-a" }} variant="danger">Discard and prepare again</ActBtn>
      )}
    </div>
  );
}

function FlaskB({ s, act }: P) {
  const f = s.flaskB;
  if (s.aliquotMl === null && flaskMl(f) <= 0) return <Note>Clean and empty. The 10 mL aliquot of stock A is delivered into it with the pipette.</Note>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3">
        <FlaskNeck f={f} id="flask-b" />
        <div className="min-w-0 space-y-2">
          <p className="text-xs text-[#4a4f57]">{flaskWords(f)}</p>
          {s.results === null ? <MakeUpButtons act={act} target="flask-b" /> : <ActBtn act={act} a={{ type: "empty", flask: "flask-b" }}>Empty for disposal</ActBtn>}
        </div>
      </div>
      {s.results === null && (
        <>
          <FinishButtons s={s} act={act} id="flask-b" />
          <ActBtn act={act} a={{ type: "discard", flask: "flask-b" }} variant="danger">Discard and prepare again</ActBtn>
        </>
      )}
    </div>
  );
}

// ── Bulb pipette ─────────────────────────────────────────────────────────

function Pipette({ s, act }: P) {
  const p = s.pipette;
  if (s.aliquotMl !== null) return <Note>Aliquot delivered into flask B. Rinse the pipette at the sink at clean-up.</Note>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] gap-3">
        <MarkView level={p.ml > 0 ? p.ml : null} mark={METHOD.pipetteMl} from={METHOD.pipetteMl - 0.3} to={METHOD.pipetteMl + 0.5} label="Stem of the 10 mL pipette" narrow />
        <div className="min-w-0 space-y-2">
          {s.flaskA.stoppered && <ActBtn act={act} a={{ type: "stopper", flask: "flask-a", on: false }}>Unstopper flask A</ActBtn>}
          {p.ml <= 0 ? (
            <>
              <ActBtn act={act} a={{ type: "pipetteRinse" }}>{p.stockRinsed ? "✓ Rinsed with stock" : "Rinse with stock"}</ActBtn>
              <Row>
                <ActBtn act={act} a={{ type: "pipetteDraw", method: "filler" }} variant="primary">Draw up (filler)</ActBtn>
                <ActBtn act={act} a={{ type: "pipetteDraw", method: "mouth" }} variant="danger">By mouth</ActBtn>
              </Row>
            </>
          ) : (
            <>
              <Group title="Run down to the mark">
                <Row>
                  <ActBtn act={act} a={{ type: "pipetteDrain", amount: "little" }}>A little</ActBtn>
                  <ActBtn act={act} a={{ type: "pipetteDrain", amount: "drop" }}>1 drop</ActBtn>
                </Row>
              </Group>
              <ActBtn act={act} a={{ type: "pipetteDraw", method: "filler" }}>Draw up again</ActBtn>
            </>
          )}
        </div>
      </div>
      {p.ml > 0 && (
        <Group title="Deliver into flask B">
          <Row>
            <ActBtn act={act} a={{ type: "pipetteDeliver", style: "touch" }} variant="primary">Deliver, tip touched</ActBtn>
            <ActBtn act={act} a={{ type: "pipetteDeliver", style: "blow" }}>Deliver and blow out</ActBtn>
          </Row>
        </Group>
      )}
    </div>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const SOLUTION_PREP_CONTROLS: Record<string, ComponentType<P>> = {
  notebook: Notebook,
  balance: Balance,
  beaker: Beaker,
  water: WashBottle,
  "flask-a": FlaskA,
  pipette: Pipette,
  "flask-b": FlaskB,
  ...commonControls<SolutionPrepState, SolutionPrepAction>(KIT, (s) => s.bench),
};
