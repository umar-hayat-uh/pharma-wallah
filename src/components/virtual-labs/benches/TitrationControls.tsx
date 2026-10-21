"use client";

/**
 * Lab 1 instrument controllers (2026-10-21 — replaces the step-ordered TitrationBench).
 * Each controller opens only when the student selects its instrument in the room; the
 * run machine refuses an action from any other instrument. Every control on a controller
 * is a real operation of that instrument — there is no "complete step" anywhere.
 */
import { useState, type ComponentType } from "react";
import { INDICATORS } from "@/lib/virtual-labs/calculations/titration";
import { APPARATUS_OPTIONS, INDICATOR_OPTIONS, METHOD, SAMPLE_OPTIONS, TITRANT_OPTIONS, balanceDisplay, titrationVisual, type TitrationAction, type TitrationState } from "@/lib/virtual-labs/experiments/titration";
import { Btn, Choice, ReadingField } from "../interface/ui";
import { ActBtn, Group, Hl, HoldControl, useControlMode } from "../interface/controls";
import { FlaskSwatch, Lcd, ScaleWindow } from "./instruments2d";
import type { BenchProps } from "./types";

type P = BenchProps<TitrationState, TitrationAction>;

function Cupboard({ s, act }: P) {
  const [sel, setSel] = useState<string[]>([]);
  if (s.apparatusOk) return <p className="text-sm text-[#0f5c3e]">The burette, bulb pipette and volumetric flask are set out on the bench.</p>;
  return (
    <Hl type="chooseApparatus">
      <fieldset className="grid gap-1.5">
        <legend className="mb-1 text-sm text-[#3a3f47]">Tick what this assay needs, then set it out.</legend>
        {APPARATUS_OPTIONS.map((o) => (
          <label key={o.id} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${sel.includes(o.id) ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/12 bg-white"}`}>
            <input type="checkbox" className="mt-0.5 accent-[#1C7BD9]" checked={sel.includes(o.id)} onChange={(e) => setSel((x) => (e.target.checked ? [...x, o.id] : x.filter((y) => y !== o.id)))} />
            {o.name}
          </label>
        ))}
      </fieldset>
      <Btn variant="primary" size="sm" className="mt-2" onClick={() => act({ type: "chooseApparatus", ids: sel })}>Set out on the bench</Btn>
    </Hl>
  );
}

function Reagents({ s, act }: P) {
  const [sample, setSample] = useState<string | null>(s.sample);
  const [titrant, setTitrant] = useState<string | null>(s.titrant);
  const [ind, setInd] = useState<string | null>(s.indicator);
  return (
    <Hl type="chooseReagents">
      <div className="space-y-3">
        <Group title="Sample">
          <Choice name="Sample" value={sample} onChange={setSample} options={SAMPLE_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
        </Group>
        <Group title="Titrant">
          <Choice name="Titrant" value={titrant} onChange={setTitrant} options={TITRANT_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
        </Group>
        <Group title="Indicator">
          <Choice name="Indicator" value={ind} onChange={setInd} options={INDICATOR_OPTIONS.map((o) => ({ id: o.id, label: `${INDICATORS[o.id].name} (pH ${INDICATORS[o.id].range[0]}–${INDICATORS[o.id].range[1]})` }))} />
        </Group>
        <Btn variant="primary" size="sm" disabled={!sample || !titrant || !ind} onClick={() => act({ type: "chooseReagents", sample: sample!, titrant: titrant!, indicator: ind! })}>Take these to the bench</Btn>
      </div>
    </Hl>
  );
}

function Balance({ s, act }: P) {
  const disp = balanceDisplay(s);
  return (
    <div className="space-y-3">
      <Lcd value={`${disp.value.toFixed(4)} g`} sub={disp.stable ? "● stable" : "○ unstable — doors open"} />
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "placeBoat" }} disabled={s.boatOn}>Boat on pan</ActBtn>
        <ActBtn act={act} a={{ type: "doors", closed: !s.doorsClosed }}>{s.doorsClosed ? "Open doors" : "Close doors"}</ActBtn>
        <ActBtn act={act} a={{ type: "tare" }}>Tare → 0</ActBtn>
      </div>
      <Group title="Sample">
        <div className="flex flex-wrap gap-2">
          <ActBtn act={act} a={{ type: "addSample", amount: "scoop" }}>+ Scoop</ActBtn>
          <ActBtn act={act} a={{ type: "addSample", amount: "tap" }}>+ Tap</ActBtn>
          <ActBtn act={act} a={{ type: "removeSample" }}>− A little</ActBtn>
        </div>
      </Group>
      <Hl type="recordMass">
        <ReadingField label={`Record the mass (${METHOD.sampleTargetG[0].toFixed(2)}–${METHOD.sampleTargetG[1].toFixed(2)} g)`} unit="g" placeholder="0.0000" onSubmit={(value) => act({ type: "recordMass", value })} disabled={s.massRecorded !== null} />
      </Hl>
    </div>
  );
}

function VolFlask({ s, act }: P) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "transfer" }}>Tip sample in via funnel</ActBtn>
        <ActBtn act={act} a={{ type: "rinseBoat" }}>Rinse boat + funnel in</ActBtn>
        <ActBtn act={act} a={{ type: "dissolve" }}>Half-fill, swirl to dissolve</ActBtn>
      </div>
      <Group title="Make up to the mark" note="Wash bottle. Bring the bottom of the meniscus onto the mark.">
        <div className="flex items-start gap-3">
          <ScaleWindow label="Volumetric flask neck" level={s.flaskWaterMl > 0 ? s.flaskWaterMl : null} from={98} to={101} minor={0.5} major={1} mark={100} height={190} />
          <div className="flex flex-1 flex-wrap content-start gap-2">
            {[20, 5, 1, 0.2, 0.05].map((ml) => (
              <ActBtn key={ml} act={act} a={{ type: "addWater", ml }}>+{ml} mL{ml === 0.05 ? " (drop)" : ""}</ActBtn>
            ))}
            {s.flaskWaterMl > 0 && s.flaskWaterMl < 98 && <p className="w-full text-xs text-[#4a4f57]">The liquid is still below the neck.</p>}
          </div>
        </div>
      </Group>
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "mixFlask" }} variant="soft">Stopper, invert ×10</ActBtn>
        <ActBtn act={act} a={{ type: "discardFlask" }} variant="danger">Discard, start again</ActBtn>
      </div>
    </div>
  );
}

function Pipette({ act }: P) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActBtn act={act} a={{ type: "rinsePipette" }}>Rinse with sample solution</ActBtn>
      <ActBtn act={act} a={{ type: "pipette", style: "touch" }}>Deliver 20 mL — touch off</ActBtn>
      <ActBtn act={act} a={{ type: "pipette", style: "blow" }}>Deliver 20 mL — blow out</ActBtn>
    </div>
  );
}

function ConicalFlask({ s, act }: P) {
  const v = titrationVisual(s);
  return (
    <div className="space-y-3">
      <FlaskSwatch rgba={v.flaskColour} volume={v.flaskVolume} label={s.aliquotAcidMmol > 0 ? "Conical flask" : "Conical flask (empty)"} />
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "addDiluent" }}>+ ~25 mL water</ActBtn>
        <ActBtn act={act} a={{ type: "addIndicator" }}>+ 2 drops indicator</ActBtn>
        <ActBtn act={act} a={{ type: "placeTile" }} disabled={s.tileUnder}>White tile under</ActBtn>
        <ActBtn act={act} a={{ type: "swirl" }} variant="soft">Swirl</ActBtn>
      </div>
      {s.titrations.length > 0 && s.titrations.length < 3 && s.titreEntered === null && (
        <ActBtn act={act} a={{ type: "newTitration" }} variant="soft">Fresh flask: repeat for concordance</ActBtn>
      )}
    </div>
  );
}

function Burette({ s, act, onFlow }: P) {
  const learning = useControlMode() === "learning";
  const v = titrationVisual(s);
  const ready = s.initialRecorded !== null;
  const prepare = (
    <Group title="Prepare">
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "rinseBurette" }}>Rinse with titrant ×2</ActBtn>
        <ActBtn act={act} a={{ type: "fillBurette" }}>Fill via funnel</ActBtn>
        <ActBtn act={act} a={{ type: "removeFunnel" }}>Remove funnel</ActBtn>
        <ActBtn act={act} a={{ type: "expelBubble" }}>Open fully: clear tip</ActBtn>
        <ActBtn act={act} a={{ type: "runToZero" }}>Run out slowly to the scale</ActBtn>
      </div>
    </Group>
  );
  const scale = (
    <div className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] gap-3">
      <div>
        {s.buretteFilled ? (
          <ScaleWindow label="Burette, magnified at the meniscus" level={s.level} from={Math.max(-1, Math.floor(s.level) - 1)} to={Math.max(-1, Math.floor(s.level) - 1) + 3} minor={0.1} major={1} invert height={ready ? 200 : 230} />
        ) : (
          <p className="rounded-xl border border-dashed border-[#16181d]/20 p-3 text-xs text-[#4a4f57]">The burette is empty.</p>
        )}
        {s.buretteFilled && <Remaining level={s.level} />}
      </div>
      <div className="min-w-0 space-y-3">
        {!ready && (
          <Hl type="recordInitial">
            <ReadingField label="Initial reading" unit="mL" placeholder="0.00" onSubmit={(value) => act({ type: "recordInitial", value })} disabled={!s.buretteFilled} />
          </Hl>
        )}
        {ready && <p className="text-xs text-[#4a4f57]">Initial: <span className="font-mono font-semibold tabular-nums text-[#16181d]">{s.initialRecorded!.toFixed(2)} mL</span></p>}
        <FlaskSwatch rgba={v.flaskColour} volume={v.flaskVolume} label="Flask below" />
        {learning && ready && <p className="text-xs text-[#4a4f57]">≈ {(s.level - (s.initialRecorded ?? 0)).toFixed(1)} mL run in so far (Learning-mode aid; read the scale to 0.01 mL).</p>}
      </div>
    </div>
  );
  const stopcock = (
    <Group title="Stopcock" note={!s.swirled ? "Colour where the drop landed — swirl before you judge." : undefined}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <HoldControl type="addTitrant" label="Hold to open the stopcock" onTick={() => act({ type: "addTitrant", ml: 0.1 })} onFlow={onFlow}>Hold: open valve</HoldControl>
        <ActBtn act={act} a={{ type: "addTitrant", ml: 1 }}>+1.00 mL</ActBtn>
        <ActBtn act={act} a={{ type: "addTitrant", ml: 0.5 }}>+0.50 mL</ActBtn>
        <ActBtn act={act} a={{ type: "addTitrant", ml: 0.05 }}>+1 drop</ActBtn>
        <ActBtn act={act} a={{ type: "addTitrant", ml: 0.025 }}>+½ drop</ActBtn>
        <ActBtn act={act} a={{ type: "swirl" }} variant="soft">Swirl flask</ActBtn>
      </div>
      {!s.tileUnder && <ActBtn act={act} a={{ type: "placeTile" }}>Slide a white tile under</ActBtn>}
    </Group>
  );
  const final = (
    <Hl type="recordFinal">
      <ReadingField label="Final reading" unit="mL" placeholder="0.00" onSubmit={(value) => act({ type: "recordFinal", value })} disabled={!ready} />
    </Hl>
  );
  // Before the initial reading the burette is being prepared; after it, the stopcock is
  // what the student's hand is on — so it comes first and preparation folds away (on a
  // phone the sheet would otherwise put the valve below the fold).
  return ready ? (
    <div className="space-y-4">
      {stopcock}
      {scale}
      {final}
      <Titres s={s} />
      <details className="rounded-xl border border-[#16181d]/10 px-3 py-2">
        <summary className="cursor-pointer text-sm font-semibold">Refill and prepare</summary>
        <div className="mt-2">{prepare}</div>
      </details>
    </div>
  ) : (
    <div className="space-y-4">
      {prepare}
      {scale}
      {stopcock}
      {final}
      <Titres s={s} />
    </div>
  );
}

/** How much titrant is left, drawn — not printed, so the scale is still what gets read. */
function Remaining({ level }: { level: number }) {
  const left = Math.max(0, Math.min(1, (METHOD.buretteCapacityMl - Math.max(0, level)) / METHOD.buretteCapacityMl));
  return (
    <div className="mt-2" role="img" aria-label={left < 0.15 ? "Burette nearly empty" : "Titrant remaining in the burette"}>
      <p className="text-[11px] font-semibold text-[#4a4f57]">Remaining</p>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#16181d]/10">
        <div className={`h-full rounded-full ${left < 0.15 ? "bg-amber-500" : "bg-brandBlue/70"}`} style={{ width: `${left * 100}%` }} />
      </div>
    </div>
  );
}

function Titres({ s }: { s: TitrationState }) {
  if (!s.titrations.length) return null;
  return (
    <div className="rounded-xl bg-[#16181d]/[0.03] p-2 text-sm">
      {s.titrations.map((t, i) => (
        <p key={i} className="tabular-nums">Titration {i + 1}: {t.initialRecorded.toFixed(2)} → {t.finalRecorded.toFixed(2)} mL · titre {(t.finalRecorded - t.initialRecorded).toFixed(2)} mL</p>
      ))}
    </div>
  );
}

function Notebook({ s, act }: P) {
  const [t, setT] = useState("");
  const [a, setA] = useState("");
  const num = (x: string) => Number(x.replace(",", "."));
  return (
    <div className="space-y-4">
      <Titres s={s} />
      {s.massRecorded !== null && <p className="text-sm tabular-nums">Sample mass: {s.massRecorded.toFixed(4)} g · NaOH {METHOD.titrantMolar.toFixed(4)} M</p>}
      <p className="rounded-xl bg-brandBlue/[0.05] p-3 font-mono text-xs leading-relaxed text-[#1b4f86]">
        assay % = titre × {METHOD.titrantMolar.toFixed(4)} ÷ 3 × 210.14 × (100 ÷ 20) ÷ (mass g × 1000) × 100
      </p>
      <Hl type="enterResults">
        <form
          className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (t && a) act({ type: "enterResults", titre: num(t), assay: num(a) });
          }}
        >
          <label className="text-sm font-semibold">
            Mean titre (mL)
            <input inputMode="decimal" value={t} onChange={(e) => setT(e.target.value)} disabled={s.assayEntered !== null} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
          </label>
          <label className="text-sm font-semibold">
            Assay (% w/w)
            <input inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} disabled={s.assayEntered !== null} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
          </label>
          <Btn type="submit" variant="primary" disabled={s.assayEntered !== null || !t || !a}>Check</Btn>
        </form>
      </Hl>
      <Group title="Conclusion" note={`Illustrative limit ${METHOD.limits[0].toFixed(1)}–${METHOD.limits[1].toFixed(1)} % (a teaching value, not the monograph limit).`}>
        <div className="flex gap-2">
          <ActBtn act={act} a={{ type: "verdict", value: "complies" }}>Complies</ActBtn>
          <ActBtn act={act} a={{ type: "verdict", value: "fails" }}>Does not comply</ActBtn>
        </div>
      </Group>
    </div>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const TITRATION_CONTROLS: Record<string, ComponentType<P>> = {
  cupboard: Cupboard,
  reagents: Reagents,
  balance: Balance,
  "vol-flask": VolFlask,
  pipette: Pipette,
  "conical-flask": ConicalFlask,
  burette: Burette,
  notebook: Notebook,
};
