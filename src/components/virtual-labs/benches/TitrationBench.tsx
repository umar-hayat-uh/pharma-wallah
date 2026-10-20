"use client";

/**
 * Lab 1 bench controls. Every stage is here — not only the current one — so a student can
 * act out of order and get the engine's explanation, exactly as the brief asks; the
 * current stage is expanded and the 3D room mirrors every action.
 */
import { useEffect, useRef, useState } from "react";
import { INDICATORS } from "@/lib/virtual-labs/calculations/titration";
import { APPARATUS_OPTIONS, INDICATOR_OPTIONS, METHOD, SAMPLE_OPTIONS, TITRANT_OPTIONS, balanceDisplay, titrationVisual, type TitrationAction, type TitrationState } from "@/lib/virtual-labs/experiments/titration";
import { Btn, Choice, ReadingField, Section } from "../interface/ui";
import { FlaskSwatch, Lcd, ScaleWindow } from "./instruments2d";
import type { BenchProps } from "./types";

export function TitrationBench({ s, act, stepId, done, onFlow }: BenchProps<TitrationState, TitrationAction>) {
  const v = titrationVisual(s);
  const disp = balanceDisplay(s);
  return (
    <div className="space-y-2">
      <Section title="1 · Inspect the bench" current={stepId === "inspect"} done={done("inspect")}>
        <p className="text-sm text-[#3a3f47]">Select each piece of equipment — in the room, in the Steps list or in the Equipment tab — to read what it is and how it is used.</p>
      </Section>

      <Section title="2 · Set out the apparatus" current={stepId === "apparatus"} done={done("apparatus")}>
        <ApparatusPicker onConfirm={(ids) => act({ type: "chooseApparatus", ids })} disabled={s.apparatusOk} />
      </Section>

      <Section title="3 · Sample and reagents" current={stepId === "reagents"} done={done("reagents")}>
        <ReagentPicker s={s} onConfirm={(sample, titrant, indicator) => act({ type: "chooseReagents", sample, titrant, indicator })} />
      </Section>

      <Section title="4 · Weigh the sample" current={stepId === "weigh"} done={done("weigh")}>
        <Lcd value={`${disp.value.toFixed(4)} g`} sub={disp.stable ? "● stable" : "○ unstable — doors open"} />
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "placeBoat" })} disabled={s.boatOn}>Place boat on pan</Btn>
          <Btn size="sm" onClick={() => act({ type: "doors", closed: !s.doorsClosed })}>{s.doorsClosed ? "Open doors" : "Close doors"}</Btn>
          <Btn size="sm" onClick={() => act({ type: "tare" })}>Tare (→0)</Btn>
          <Btn size="sm" onClick={() => act({ type: "addSample", amount: "scoop" })}>+ Spatula scoop</Btn>
          <Btn size="sm" onClick={() => act({ type: "addSample", amount: "tap" })}>+ Tap</Btn>
          <Btn size="sm" onClick={() => act({ type: "removeSample" })}>− Remove a little</Btn>
        </div>
        <ReadingField label={`Record the mass (target ${METHOD.sampleTargetG[0].toFixed(2)}–${METHOD.sampleTargetG[1].toFixed(2)} g)`} unit="g" placeholder="0.0000" onSubmit={(value) => act({ type: "recordMass", value })} disabled={s.massRecorded !== null} hint="Close the doors and wait for 'stable' before reading." />
      </Section>

      <Section title="5 · Prepare the sample solution" current={stepId === "solution"} done={done("solution")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "transfer" })}>Transfer via funnel</Btn>
          <Btn size="sm" onClick={() => act({ type: "rinseBoat" })}>Rinse boat and funnel in</Btn>
          <Btn size="sm" onClick={() => act({ type: "dissolve" })}>Half-fill and swirl to dissolve</Btn>
        </div>
        <div className="flex items-start gap-3">
          <ScaleWindow label="Volumetric flask neck" level={s.flaskWaterMl > 0 ? s.flaskWaterMl : null} from={98} to={101} minor={0.5} major={1} mark={100} height={200} />
          <div className="flex flex-1 flex-wrap content-start gap-2">
            <p className="w-full text-xs text-[#4a4f57]">Bring the bottom of the meniscus to the mark. {s.flaskWaterMl > 0 && s.flaskWaterMl < 98 ? "The liquid is still below the neck." : ""}</p>
            {[20, 5, 1, 0.2, 0.05].map((ml) => (
              <Btn key={ml} size="sm" onClick={() => act({ type: "addWater", ml })}>+{ml} mL{ml === 0.05 ? " (drop)" : ""}</Btn>
            ))}
            <Btn size="sm" variant="soft" onClick={() => act({ type: "mixFlask" })}>Stopper and invert ×10</Btn>
            <Btn size="sm" variant="danger" onClick={() => act({ type: "discardFlask" })}>Discard and start again</Btn>
          </div>
        </div>
      </Section>

      <Section title="6 · Take the aliquot" current={stepId === "aliquot"} done={done("aliquot")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "rinsePipette" })}>Rinse pipette with sample solution</Btn>
          <Btn size="sm" onClick={() => act({ type: "pipette", style: "touch" })}>Pipette 20 mL — touch off the tip</Btn>
          <Btn size="sm" onClick={() => act({ type: "pipette", style: "blow" })}>Pipette 20 mL — blow out the last drop</Btn>
          <Btn size="sm" onClick={() => act({ type: "addDiluent" })}>Add ~25 mL water</Btn>
          <Btn size="sm" onClick={() => act({ type: "addIndicator" })}>Add 2 drops of indicator</Btn>
          <Btn size="sm" onClick={() => act({ type: "placeTile" })} disabled={s.tileUnder}>White tile under the flask</Btn>
        </div>
      </Section>

      <Section title="7 · Prepare the burette" current={stepId === "burette"} done={done("burette")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "rinseBurette" })}>Rinse with titrant (×2)</Btn>
          <Btn size="sm" onClick={() => act({ type: "fillBurette" })}>Fill through a funnel</Btn>
          <Btn size="sm" onClick={() => act({ type: "removeFunnel" })}>Remove funnel</Btn>
          <Btn size="sm" onClick={() => act({ type: "expelBubble" })}>Open stopcock fully: expel air bubble</Btn>
          <Btn size="sm" onClick={() => act({ type: "runToZero" })}>Run a little out to the zero region</Btn>
        </div>
        <BuretteReading s={s} />
        <ReadingField label="Initial reading" unit="mL" placeholder="0.00" onSubmit={(value) => act({ type: "recordInitial", value })} disabled={s.initialRecorded !== null || !s.buretteFilled} hint="Two decimal places — estimate the second between 0.1 mL divisions." />
      </Section>

      <Section title="8 · Titrate" current={stepId === "titrate"} done={done("titrate")}>
        <div className="flex items-start gap-3">
          <BuretteReading s={s} compact />
          <div className="flex-1 space-y-2">
            <FlaskSwatch rgba={v.flaskColour} volume={v.flaskVolume} label={`Conical flask: ${s.indicatorAdded ? "the colour of the solution as you would see it" : "no indicator yet"}`} />
            <div className="flex flex-wrap gap-2">
              <HoldButton onTick={() => act({ type: "addTitrant", ml: 0.1 })} onFlow={onFlow}>Hold: run a stream</HoldButton>
              {[1, 0.5, 0.1].map((ml) => (
                <Btn key={ml} size="sm" onClick={() => act({ type: "addTitrant", ml })}>+{ml.toFixed(2)} mL</Btn>
              ))}
              <Btn size="sm" onClick={() => act({ type: "addTitrant", ml: 0.05 })}>+1 drop</Btn>
              <Btn size="sm" onClick={() => act({ type: "addTitrant", ml: 0.025 })}>+½ drop (wash in)</Btn>
              <Btn size="sm" variant="soft" onClick={() => act({ type: "swirl" })}>Swirl</Btn>
              {!s.tileUnder && <Btn size="sm" onClick={() => act({ type: "placeTile" })}>Slide a white tile under the flask</Btn>}
            </div>
            {!s.swirled && <p className="text-xs text-amber-800">A patch of colour where the drop landed — swirl before you judge.</p>}
          </div>
        </div>
        <ReadingField label="Final reading" unit="mL" placeholder="0.00" onSubmit={(value) => act({ type: "recordFinal", value })} disabled={s.initialRecorded === null} />
        {s.titrations.length > 0 && (
          <div className="rounded-xl bg-[#16181d]/[0.03] p-2 text-sm">
            {s.titrations.map((t, i) => (
              <p key={i} className="tabular-nums">Titration {i + 1}: {t.initialRecorded.toFixed(2)} → {t.finalRecorded.toFixed(2)} mL · titre {(t.finalRecorded - t.initialRecorded).toFixed(2)} mL</p>
            ))}
            {s.titrations.length < 3 && s.titreEntered === null && (
              <Btn size="sm" variant="soft" className="mt-2" onClick={() => act({ type: "newTitration" })}>Repeat with a new aliquot (concordance)</Btn>
            )}
          </div>
        )}
      </Section>

      <Section title="9 · Calculate" current={stepId === "calculate"} done={done("calculate")}>
        <p className="rounded-xl bg-brandBlue/[0.05] p-3 font-mono text-xs leading-relaxed text-[#1b4f86]">
          assay % = titre (mL) × {METHOD.titrantMolar.toFixed(4)} mmol/mL ÷ 3 × 210.14 mg/mmol × (100 ÷ 20) ÷ (mass g × 1000) × 100
        </p>
        <CalcForm onSubmit={(titre, assay) => act({ type: "enterResults", titre, assay })} disabled={s.assayEntered !== null} />
      </Section>

      <Section title="10 · Compare with the limit" current={stepId === "compare"} done={done("compare")}>
        <p className="text-sm text-[#3a3f47]">Illustrative limit for this exercise: <strong>{METHOD.limits[0].toFixed(1)}–{METHOD.limits[1].toFixed(1)} %</strong> (a teaching value, not the monograph limit).</p>
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => act({ type: "verdict", value: "complies" })}>Complies</Btn>
          <Btn size="sm" onClick={() => act({ type: "verdict", value: "fails" })}>Does not comply</Btn>
        </div>
      </Section>
    </div>
  );
}

function BuretteReading({ s, compact }: { s: TitrationState; compact?: boolean }) {
  if (!s.buretteFilled) return <p className="text-xs text-[#4a4f57]">The burette is empty.</p>;
  const lv = s.level;
  const from = Math.max(-1, Math.floor(lv) - 1);
  return <ScaleWindow label="Burette, magnified at the meniscus" level={lv} from={from} to={from + 3} minor={0.1} major={1} invert height={compact ? 220 : 260} />;
}

function ApparatusPicker({ onConfirm, disabled }: { onConfirm(ids: string[]): void; disabled: boolean }) {
  const [sel, setSel] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      <fieldset className="grid gap-1.5" disabled={disabled}>
        <legend className="sr-only">Apparatus</legend>
        {APPARATUS_OPTIONS.map((o) => (
          <label key={o.id} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${sel.includes(o.id) ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/12"}`}>
            <input type="checkbox" className="mt-0.5 accent-[#1C7BD9]" checked={sel.includes(o.id)} onChange={(e) => setSel((x) => (e.target.checked ? [...x, o.id] : x.filter((y) => y !== o.id)))} />
            {o.name}
          </label>
        ))}
      </fieldset>
      <Btn variant="primary" size="sm" disabled={disabled} onClick={() => onConfirm(sel)}>Set out on the bench</Btn>
    </div>
  );
}

function ReagentPicker({ s, onConfirm }: { s: TitrationState; onConfirm(sample: string, titrant: string, indicator: string): void }) {
  const [sample, setSample] = useState<string | null>(s.sample);
  const [titrant, setTitrant] = useState<string | null>(s.titrant);
  const [ind, setInd] = useState<string | null>(s.indicator);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Sample</p>
      <Choice name="Sample" value={sample} onChange={setSample} options={SAMPLE_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
      <p className="text-sm font-semibold">Titrant</p>
      <Choice name="Titrant" value={titrant} onChange={setTitrant} options={TITRANT_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
      <p className="text-sm font-semibold">Indicator</p>
      <Choice name="Indicator" value={ind} onChange={setInd} options={INDICATOR_OPTIONS.map((o) => ({ id: o.id, label: `${INDICATORS[o.id].name} (pH ${INDICATORS[o.id].range[0]}–${INDICATORS[o.id].range[1]})` }))} />
      <Btn variant="primary" size="sm" disabled={!sample || !titrant || !ind} onClick={() => onConfirm(sample!, titrant!, ind!)}>Confirm selection</Btn>
    </div>
  );
}

function CalcForm({ onSubmit, disabled }: { onSubmit(titre: number, assay: number): void; disabled: boolean }) {
  const [t, setT] = useState("");
  const [a, setA] = useState("");
  return (
    <form
      className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(t.replace(",", ".")), Number(a.replace(",", ".")));
      }}
    >
      <label className="text-sm font-semibold">
        Mean titre (mL)
        <input inputMode="decimal" value={t} onChange={(e) => setT(e.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        Assay (% w/w)
        <input inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <Btn variant="primary" disabled={disabled || !t || !a} onClick={() => onSubmit(Number(t.replace(",", ".")), Number(a.replace(",", ".")))}>Check</Btn>
    </form>
  );
}

/** Press and hold to run titrant in a stream (0.1 mL every 160 ms); release closes the stopcock. */
function HoldButton({ onTick, onFlow, children }: { onTick(): void; onFlow?(on: boolean): void; children: React.ReactNode }) {
  const timer = useRef<number | null>(null);
  const tick = useRef(onTick);
  tick.current = onTick;
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    onFlow?.(false);
  };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button
      type="button"
      className="inline-flex min-h-9 select-none items-center rounded-xl bg-brandBlue px-3 text-sm font-semibold text-white active:bg-[#1667b8]"
      onPointerDown={() => {
        tick.current();
        onFlow?.(true);
        timer.current = window.setInterval(() => tick.current(), 160);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && tick.current()}
    >
      {children}
    </button>
  );
}
