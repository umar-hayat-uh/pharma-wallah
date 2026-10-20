"use client";

/** Lab 2 bench controls — Simple Syrup. Every stage is available; the current one is open. */
import { useState } from "react";
import { APPEARANCE_OPTIONS, CONTAINER_OPTIONS, FORMULA, STORAGE_OPTIONS, batchFigures, syrupBalance, syrupVisual, type SyrupAction, type SyrupState } from "@/lib/virtual-labs/experiments/syrup";
import { sucroseForBatch } from "@/lib/virtual-labs/calculations/syrup";
import { Btn, Choice, ReadingField, Section } from "../interface/ui";
import { Lcd, ScaleWindow } from "./instruments2d";
import type { BenchProps } from "./types";

export function SyrupBench({ s, act, stepId, done }: BenchProps<SyrupState, SyrupAction>) {
  const v = syrupVisual(s);
  const f = batchFigures(s);
  const batch = s.batchMl ?? 100;
  // what the student sees, on the same 0.3 g threshold the engine uses for "undissolved"
  const left = Math.max(0, s.sucroseInBeaker - s.dissolvedG);
  const crystalText = s.sucroseInBeaker === 0 ? "No sucrose in the beaker yet." : left > 0.4 * s.sucroseInBeaker ? "A thick layer of crystals on the bottom." : left > 3 ? "Plenty of crystals still swirling." : left > 0.3 ? "A few crystals remain — look closely." : "No crystals visible: a clear liquid.";
  return (
    <div className="space-y-2">
      <Section title="1 · Inspect the bench" current={stepId === "inspect"} done={done("inspect")}>
        <p className="text-sm text-[#3a3f47]">Select each item — in the room, the Steps list or the Equipment tab — to read what it is and how it is used.</p>
      </Section>

      <Section title="2 · Calculate the formula" current={stepId === "calculate"} done={done("calculate")}>
        <p className="rounded-xl bg-brandBlue/[0.05] p-3 text-sm text-[#1b4f86]">
          {FORMULA.name}: {FORMULA.basis}. <span className="font-semibold">Illustrative formula</span> — configurable teaching values.
        </p>
        <CalcForm onSubmit={(batchMl, sucroseG, waterMl) => act({ type: "calculate", batchMl, sucroseG, waterMl })} disabled={s.calcSucrose !== null} />
      </Section>

      <Section title="3 · Weigh the sucrose" current={stepId === "weigh"} done={done("weigh")}>
        <Lcd value={`${syrupBalance(s).toFixed(2)} g`} sub={s.tareG ? "tared" : "not tared"} />
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "placeBoat" })} disabled={s.boatOn}>Weighing boat on the pan</Btn>
          <Btn size="sm" onClick={() => act({ type: "tare" })}>Tare (→0)</Btn>
          <Btn size="sm" onClick={() => act({ type: "addSucrose", amount: "large" })}>+ Large scoop</Btn>
          <Btn size="sm" onClick={() => act({ type: "addSucrose", amount: "scoop" })}>+ Small scoop</Btn>
          <Btn size="sm" onClick={() => act({ type: "addSucrose", amount: "tap" })}>+ Tap</Btn>
          <Btn size="sm" onClick={() => act({ type: "removeSucrose" })}>− Remove a little</Btn>
        </div>
        <ReadingField label={`Record the weight${s.calcSucrose ? ` (target ${s.calcSucrose.toFixed(2)} g)` : ""}`} unit="g" placeholder="0.00" onSubmit={(value) => act({ type: "recordMass", value })} disabled={s.massRecorded !== null} />
      </Section>

      <Section title="4 · Measure the water" current={stepId === "water"} done={done("water")}>
        <div className="flex items-start gap-3">
          <ScaleWindow label="Measuring cylinder, magnified" level={s.cylinderMl > 0 ? s.cylinderMl : null} from={Math.max(0, Math.floor(s.cylinderMl / 5) * 5 - 5)} to={Math.max(0, Math.floor(s.cylinderMl / 5) * 5 - 5) + 15} minor={1} major={5} height={220} />
          <div className="flex flex-1 flex-wrap content-start gap-2">
            {[10, 5, 1, 0.5].map((ml) => <Btn key={ml} size="sm" onClick={() => act({ type: "pourWater", ml })}>Pour +{ml} mL</Btn>)}
            {[-1, -0.5].map((ml) => <Btn key={ml} size="sm" onClick={() => act({ type: "pourWater", ml })}>Pour back {Math.abs(ml)} mL</Btn>)}
          </div>
        </div>
        <ReadingField label="Read the cylinder" unit="mL" placeholder="0.0" onSubmit={(value) => act({ type: "readCylinder", value })} disabled={s.beakerWaterG > 0} />
        <Btn size="sm" variant="soft" onClick={() => act({ type: "waterToBeaker" })}>Pour the water into the beaker</Btn>
      </Section>

      <Section title="5 · Dissolve" current={stepId === "dissolve"} done={done("dissolve")}>
        <div className="grid grid-cols-2 gap-2">
          <Lcd value={`${s.tempC.toFixed(1)} °C`} sub="thermometer" tone="amber" />
          <Lcd value={formatTime(s.elapsedS)} sub="elapsed" tone="blue" />
        </div>
        <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{crystalText}{v.yellow > 0.2 ? " The liquid has turned yellow." : ""}</p>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "beakerOnHotplate" })} disabled={s.onHotplate}>Beaker on the hot plate</Btn>
          {[0, 40, 60, 80, 100, 120].map((t) => (
            <Btn key={t} size="sm" variant={s.setpoint === t ? "soft" : "secondary"} onClick={() => act({ type: "setHeat", setpoint: t })}>{t === 0 ? "Heat off" : `${t} °C`}</Btn>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" variant={s.stirring ? "soft" : "secondary"} onClick={() => act({ type: "stir", on: !s.stirring })}>{s.stirring ? "Stop stirring" : "Stir with the rod"}</Btn>
          <Btn size="sm" onClick={() => act({ type: "sucroseToBeaker" })} disabled={s.sucroseInBeaker > 0}>Add the sucrose gradually</Btn>
          {[15, 30, 60, 120, 300].map((sec) => <Btn key={sec} size="sm" onClick={() => act({ type: "wait", seconds: sec })}>Wait {sec < 60 ? `${sec} s` : `${sec / 60} min`}</Btn>)}
        </div>
        <Btn size="sm" variant="primary" onClick={() => act({ type: "finishDissolving" })} disabled={s.dissolveDone}>Dissolution complete — move on</Btn>
      </Section>

      <Section title="6 · Cool and transfer" current={stepId === "cool"} done={done("cool")}>
        <Lcd value={`${s.tempC.toFixed(1)} °C`} sub="thermometer" tone="amber" />
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "setHeat", setpoint: 0 })}>Heat off</Btn>
          {[60, 120, 300].map((sec) => <Btn key={sec} size="sm" onClick={() => act({ type: "wait", seconds: sec })}>Wait {sec / 60} min</Btn>)}
        </div>
        <p className="text-sm font-semibold">Make up to volume in…</p>
        <Choice name="Vessel" value={s.vessel} onChange={(x) => act({ type: "chooseVessel", vessel: x as "cylinder" | "beaker-marks" })} options={[{ id: "cylinder", label: `A ${batch} mL measuring cylinder` }, { id: "beaker-marks", label: "The beaker's printed graduations" }]} />
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "transferToVessel" })}>Pour the syrup in</Btn>
          <Btn size="sm" onClick={() => act({ type: "rinseBeaker" })}>Rinse beaker and rod into it</Btn>
        </div>
      </Section>

      <Section title="7 · Make up to volume" current={stepId === "makeup"} done={done("makeup")}>
        <div className="flex items-start gap-3">
          <ScaleWindow label="Measuring cylinder with syrup, magnified" level={s.inVessel ? f.volumeNow : null} from={batch - 6} to={batch + 3} minor={1} major={5} mark={batch} liquid="#f5efd9" height={220} />
          <div className="flex flex-1 flex-wrap content-start gap-2">
            {[5, 1, 0.5, 0.2].map((ml) => <Btn key={ml} size="sm" onClick={() => act({ type: "qs", ml })}>+{ml} mL water</Btn>)}
            <Btn size="sm" variant="soft" onClick={() => act({ type: "mixAfterQs" })}>Stir to mix</Btn>
            <p className="w-full text-xs text-[#4a4f57]">Temperature now {s.tempC.toFixed(1)} °C.</p>
          </div>
        </div>
        <ReadingField label="Final volume" unit="mL" placeholder="0.0" onSubmit={(value) => act({ type: "readFinal", value })} disabled={s.finalRead !== null} />
      </Section>

      <Section title="8 · Pack and label" current={stepId === "pack"} done={done("pack")}>
        <Choice name="Container" value={s.container} onChange={(c) => act({ type: "pack", container: c })} options={CONTAINER_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
        <p className="text-sm font-semibold">Storage statement</p>
        <Choice name="Storage" value={s.storage} onChange={(x) => act({ type: "label", storage: x })} options={STORAGE_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} />
      </Section>

      <Section title="9 · Evaluate" current={stepId === "evaluate"} done={done("evaluate")}>
        <BottleSwatch yellow={v.yellow} crystals={v.appearance === "crystals"} thin={v.appearance === "thin"} />
        <p className="text-sm font-semibold">Appearance — what do you see?</p>
        <Choice name="Appearance" value={s.appearance} onChange={(x) => act({ type: "observe", appearance: x })} options={APPEARANCE_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} />
        <Btn size="sm" onClick={() => act({ type: "weighDensity" })} disabled={s.densityMassG !== null}>Weigh 50.0 mL in a tared cylinder</Btn>
        {s.densityMassG !== null && <Lcd value={`${s.densityMassG.toFixed(2)} g`} sub="50.0 mL of syrup" />}
        <ReadingField label="Density (g/mL)" unit="g/mL" placeholder="0.000" onSubmit={(value) => act({ type: "recordDensity", value })} disabled={s.densityRecorded !== null || s.densityMassG === null} />
      </Section>

      <Section title="10 · Batch record" current={stepId === "record"} done={done("record")}>
        <BatchRecord s={s} batch={batch} />
        <Btn variant="primary" size="sm" onClick={() => act({ type: "sign" })} disabled={s.signed}>Sign the batch record</Btn>
      </Section>
    </div>
  );
}

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function CalcForm({ onSubmit, disabled }: { onSubmit(batch: number, sucrose: number, water: number): void; disabled: boolean }) {
  const [batch, setBatch] = useState("100");
  const [suc, setSuc] = useState("");
  const [water, setWater] = useState("");
  const n = (x: string) => Number(x.replace(",", "."));
  return (
    <div className="grid gap-2 sm:grid-cols-3 sm:items-end">
      <label className="text-sm font-semibold">
        Batch size
        <select value={batch} onChange={(e) => setBatch(e.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 bg-white px-3">
          {FORMULA.batchOptionsMl.map((b) => <option key={b} value={b}>{b} mL</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Sucrose (g)
        <input inputMode="decimal" value={suc} onChange={(e) => setSuc(e.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        Starting water (mL)
        <input inputMode="decimal" value={water} onChange={(e) => setWater(e.target.value)} disabled={disabled} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-3 font-mono" />
      </label>
      <Btn variant="primary" className="sm:col-span-3" disabled={disabled || !suc || !water} onClick={() => onSubmit(n(batch), n(suc), n(water))}>Check calculation</Btn>
    </div>
  );
}

function BottleSwatch({ yellow, crystals, thin }: { yellow: number; crystals: boolean; thin: boolean }) {
  const r = 250 - 10 * yellow;
  const g = 246 - 70 * yellow;
  const b = 232 - 150 * yellow;
  return (
    <svg viewBox="0 0 120 150" className="h-32 w-auto" role="img" aria-label="Your syrup in its bottle, against a white background">
      <rect x="0" y="0" width="120" height="150" rx="10" fill="#ffffff" />
      <rect x="48" y="10" width="24" height="18" rx="3" fill="#2b2f35" />
      <path d="M40 30 H80 V44 Q96 52 96 66 V136 Q96 142 90 142 H30 Q24 142 24 136 V66 Q24 52 40 44 Z" fill={`rgba(${r},${g},${b},${thin ? 0.35 : 0.75})`} stroke="#8a5a20" strokeWidth="2" />
      {crystals && [0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={34 + i * 8} y={130 - (i % 3) * 3} width="5" height="5" fill="#ffffff" stroke="#c9c2b0" transform={`rotate(${i * 20} ${36 + i * 8} ${132})`} />)}
    </svg>
  );
}

function BatchRecord({ s, batch }: { s: SyrupState; batch: number }) {
  const f = batchFigures(s);
  const target = sucroseForBatch(FORMULA.sucroseGPer100mL, batch);
  const rows: [string, string][] = [
    ["Product", `${FORMULA.name} — for practice, not for use`],
    ["Batch no.", `VL-SY-${String(s.seed).padStart(6, "0")}`],
    ["Batch size", `${batch} mL`],
    ["Sucrose — required / weighed", `${target.toFixed(2)} g / ${s.massRecorded?.toFixed(2) ?? "—"} g`],
    ["Starting purified water", `${s.cylinderRead?.toFixed(1) ?? "—"} mL`],
    ["Process", `${s.heatDamageS > 0 ? `held ≥ ${FORMULA.overheatC} °C for ${s.heatDamageS} s` : "gentle heat"}; made up at ${s.madeUpAtC?.toFixed(0) ?? "—"} °C`],
    ["Final volume", `${s.finalRead?.toFixed(1) ?? "—"} mL`],
    ["Appearance", APPEARANCE_OPTIONS.find((o) => o.id === s.appearance)?.text ?? "—"],
    ["Density", s.densityRecorded !== null ? `${s.densityRecorded.toFixed(3)} g/mL` : "—"],
    ["Container / storage", `${CONTAINER_OPTIONS.find((o) => o.id === s.container)?.name ?? "—"} / ${STORAGE_OPTIONS.find((o) => o.id === s.storage)?.text ?? "—"}`],
    ["Strength (calculated, 20 °C)", f.volume20 ? `${f.wv.toFixed(1)} % w/v` : "—"],
  ];
  return (
    <dl className="divide-y divide-[#16181d]/[0.06] rounded-xl border border-[#16181d]/10 bg-white text-sm">
      {rows.map(([k, val]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2 px-3 py-1.5">
          <dt className="text-[#4a4f57]">{k}</dt>
          <dd className="[overflow-wrap:anywhere]">{val}</dd>
        </div>
      ))}
    </dl>
  );
}
