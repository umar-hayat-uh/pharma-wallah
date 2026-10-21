"use client";

/**
 * Lab 2 instrument controllers — Simple Syrup (2026-10-21, replaces the step-ordered
 * SyrupBench). Each panel opens only when its instrument is selected in the room (or the
 * 2D bench plan), and the run machine refuses an action from any other instrument. Panels
 * show what the instrument shows — the balance's LCD, the thermometer, the state of the
 * beaker — and the 2D cylinder draws its meniscus without printing it, so a volume is
 * still read, as at the bench.
 */
import { useState, type ComponentType, type ReactNode } from "react";
import { APPEARANCE_OPTIONS, CONTAINER_OPTIONS, FORMULA, STORAGE_OPTIONS, batchFigures, syrupVisual, type SyrupAction, type SyrupState } from "@/lib/virtual-labs/experiments/syrup";
import { sucroseForBatch } from "@/lib/virtual-labs/calculations/syrup";
import { Btn, Choice, ReadingField } from "../interface/ui";
import { ActBtn, Group, Hl } from "../interface/controls";
import { Lcd, ScaleWindow } from "./instruments2d";
import type { BenchProps } from "./types";

type P = BenchProps<SyrupState, SyrupAction>;

const HEAT_SETTINGS = [0, 40, 60, 80, 100, 120];

function formatTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

/** What the student sees in the beaker, on the same 0.3 g threshold the engine uses for "undissolved". */
function crystalText(s: SyrupState) {
  const left = Math.max(0, s.sucroseInBeaker - s.dissolvedG);
  if (s.sucroseInBeaker === 0) return "No sucrose in the beaker yet.";
  if (left > 0.4 * s.sucroseInBeaker) return "A thick layer of crystals on the bottom.";
  if (left > 3) return "Plenty of crystals still swirling.";
  if (left > 0.3) return "A few crystals remain — look closely.";
  return "No crystals visible: a clear liquid.";
}

function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{children}</p>;
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

/** The thermometer in the beaker; the hot plate adds the timer (the beaker sheet stays short on phones). */
function Thermometer({ s, timer = false }: { s: SyrupState; timer?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Lcd value={`${s.tempC.toFixed(1)} °C`} sub="thermometer" tone="amber" />
      {timer && <Lcd value={formatTime(s.elapsedS)} sub="elapsed" tone="blue" />}
    </div>
  );
}

function WaitButtons({ act, options }: { act: P["act"]; options: number[] }) {
  return (
    <Row>
      {options.map((sec) => (
        <ActBtn key={sec} act={act} a={{ type: "wait", seconds: sec }}>Wait {sec < 60 ? `${sec} s` : `${sec / 60} min`}</ActBtn>
      ))}
    </Row>
  );
}

function StirToggle({ s, act }: Pick<P, "s" | "act">) {
  return (
    <ActBtn act={act} a={{ type: "stir", on: !s.stirring }} variant={s.stirring ? "soft" : "secondary"}>
      {s.stirring ? "Stop stirring" : "Stir with the rod"}
    </ActBtn>
  );
}

// ── Batch record (lab notebook) ─────────────────────────────────────────────

function Notebook({ s, act }: P) {
  const batch = s.batchMl ?? 100;
  return (
    <div className="space-y-3">
      {s.calcSucrose === null ? (
        <>
          <p className="rounded-xl bg-brandBlue/[0.05] p-3 text-sm text-[#1b4f86]">
            {FORMULA.name}: {FORMULA.basis}. <span className="font-semibold">Illustrative formula</span> — configurable teaching values.
          </p>
          <Hl type="calculate">
            <CalcForm onSubmit={(batchMl, sucroseG, waterMl) => act({ type: "calculate", batchMl, sucroseG, waterMl })} />
          </Hl>
        </>
      ) : (
        <BatchRecord s={s} batch={batch} />
      )}
      {s.densityMassG !== null && s.densityRecorded === null && (
        <Hl type="recordDensity">
          <ReadingField label={`Density: ${s.densityMassG.toFixed(2)} g ÷ 50.0 mL`} unit="g/mL" placeholder="0.000" onSubmit={(value) => act({ type: "recordDensity", value })} />
        </Hl>
      )}
      {s.calcSucrose !== null && (
        <ActBtn act={act} a={{ type: "sign" }} variant="primary" disabled={s.signed}>{s.signed ? "Signed" : "Sign the batch record"}</ActBtn>
      )}
    </div>
  );
}

function CalcForm({ onSubmit }: { onSubmit(batch: number, sucrose: number, water: number): void }) {
  const [batch, setBatch] = useState("100");
  const [suc, setSuc] = useState("");
  const [water, setWater] = useState("");
  const n = (x: string) => Number(x.replace(",", "."));
  return (
    <form
      className="grid grid-cols-3 gap-2 sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (suc && water) onSubmit(n(batch), n(suc), n(water));
      }}
    >
      <label className="text-sm font-semibold">
        Batch
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 bg-white px-2">
          {FORMULA.batchOptionsMl.map((b) => <option key={b} value={b}>{b} mL</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Sucrose (g)
        <input inputMode="decimal" value={suc} onChange={(e) => setSuc(e.target.value)} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-2 font-mono" />
      </label>
      <label className="text-sm font-semibold">
        Water (mL)
        <input inputMode="decimal" value={water} onChange={(e) => setWater(e.target.value)} className="vl-input mt-1 h-11 w-full rounded-xl border border-[#16181d]/15 px-2 font-mono" />
      </label>
      <Btn type="submit" variant="primary" size="sm" className="col-span-3" disabled={!suc || !water}>Check calculation</Btn>
    </form>
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
    ["Starting purified water", `${s.calcWater ?? "—"} mL planned · ${s.cylinderRead?.toFixed(1) ?? "—"} mL measured`],
    ["Process", `${s.heatDamageS > 0 ? `held ≥ ${FORMULA.overheatC} °C for ${s.heatDamageS} s` : "gentle heat"}; made up at ${s.madeUpAtC?.toFixed(0) ?? "—"} °C`],
    ["Final volume", `${s.finalRead?.toFixed(1) ?? "—"} mL`],
    ["Appearance", APPEARANCE_OPTIONS.find((o) => o.id === s.appearance)?.text ?? "—"],
    ["Density", s.densityRecorded !== null ? `${s.densityRecorded.toFixed(3)} g/mL` : "—"],
    ["Container / storage", `${CONTAINER_OPTIONS.find((o) => o.id === s.container)?.name ?? "—"} / ${STORAGE_OPTIONS.find((o) => o.id === s.storage)?.text ?? "—"}`],
    ["Strength (calculated, 20 °C)", s.finalRead !== null && f.volume20 ? `${f.wv.toFixed(1)} % w/v` : "—"],
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

// ── Top-pan balance ─────────────────────────────────────────────────────────

function Balance({ s, act }: P) {
  const v = syrupVisual(s);
  const densityOn = s.densityMassG !== null && s.densityRecorded === null;
  // The syrup model has no draught or drift: a top-pan balance reading to 0.01 g settles
  // at once, so the display is always stable. What does change is the tare.
  const sub = densityOn ? "● stable · 50.0 mL of syrup, tared cylinder" : `● stable · ${s.tareG ? "tared" : "not tared"}`;
  return (
    <div className="space-y-3">
      <Lcd value={`${v.balance.toFixed(2)} g`} sub={sub} />
      {s.massRecorded === null ? (
        <>
          <Row>
            <ActBtn act={act} a={{ type: "placeBoat" }} disabled={s.boatOn}>Boat on pan</ActBtn>
            <ActBtn act={act} a={{ type: "tare" }}>Tare → 0</ActBtn>
          </Row>
          <Group title="Sucrose">
            <Row>
              <ActBtn act={act} a={{ type: "addSucrose", amount: "large" }}>+ Large scoop</ActBtn>
              <ActBtn act={act} a={{ type: "addSucrose", amount: "scoop" }}>+ Small scoop</ActBtn>
              <ActBtn act={act} a={{ type: "addSucrose", amount: "tap" }}>+ Tap</ActBtn>
              <ActBtn act={act} a={{ type: "removeSucrose" }}>− A little</ActBtn>
            </Row>
          </Group>
          <Hl type="recordMass">
            <ReadingField label={`Record the weight${s.calcSucrose !== null ? ` (target ${s.calcSucrose.toFixed(2)} g)` : ""}`} unit="g" placeholder="0.00" onSubmit={(value) => act({ type: "recordMass", value })} />
          </Hl>
        </>
      ) : (
        <Note>Sucrose weighed: {s.massRecorded.toFixed(2)} g recorded.{s.sucroseInBeaker === 0 ? " Add it to the water in the beaker." : ""}</Note>
      )}
      {s.finalRead !== null && (
        <Group title="Density check" note="Density = mass ÷ volume.">
          <ActBtn act={act} a={{ type: "weighDensity" }} disabled={s.densityMassG !== null}>Weigh 50.0 mL in a tared cylinder</ActBtn>
          {densityOn && (
            <Hl type="recordDensity">
              <ReadingField label="Density" unit="g/mL" placeholder="0.000" onSubmit={(value) => act({ type: "recordDensity", value })} />
            </Hl>
          )}
          {s.densityRecorded !== null && <p className="text-sm">Recorded: {s.densityRecorded.toFixed(3)} g/mL.</p>}
        </Group>
      )}
    </div>
  );
}

// ── Measuring cylinder ──────────────────────────────────────────────────────

function Cylinder({ s, act }: P) {
  const batch = s.batchMl ?? 100;
  const f = batchFigures(s);
  if (s.inVessel) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3">
          <ScaleWindow label="Measuring cylinder with syrup, magnified" level={f.volumeNow} from={batch - 6} to={batch + 3} minor={1} major={5} mark={batch} liquid="#f5efd9" height={210} />
          <div className="min-w-0 space-y-2">
            <p className="text-xs text-[#4a4f57]">Syrup at {s.tempC.toFixed(1)} °C.</p>
            {!s.rinsed && <ActBtn act={act} a={{ type: "rinseBeaker" }}>Rinse beaker + rod in</ActBtn>}
            <Group title="Purified water">
              <Row>
                {[5, 1, 0.5, 0.2].map((ml) => <ActBtn key={ml} act={act} a={{ type: "qs", ml }}>+{ml} mL</ActBtn>)}
              </Row>
            </Group>
            <ActBtn act={act} a={{ type: "mixAfterQs" }} variant="soft">Stir to mix</ActBtn>
          </div>
        </div>
        {s.finalRead === null && s.tempC > FORMULA.makeUpMaxC && (
          <Group title="Let it stand">
            <WaitButtons act={act} options={[60, 120, 300]} />
          </Group>
        )}
        <Hl type="readFinal">
          <ReadingField label="Final volume" unit="mL" placeholder="0.0" onSubmit={(value) => act({ type: "readFinal", value })} disabled={s.finalRead !== null} />
        </Hl>
      </div>
    );
  }
  if (s.beakerWaterG > 0) {
    return (
      <div className="space-y-3">
        <Note>{s.cylinderRead?.toFixed(1) ?? "—"} mL of purified water went into the beaker. The cylinder is empty.</Note>
        {s.dissolveDone ? (
          <MakeUpIn s={s} act={act} batch={batch} />
        ) : (
          <p className="text-xs text-[#4a4f57]">The syrup is made up to volume in it once it has dissolved and cooled.</p>
        )}
      </div>
    );
  }
  const from = Math.max(0, Math.floor(s.cylinderMl / 5) * 5 - 5);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3">
        <ScaleWindow label="Measuring cylinder, magnified" level={s.cylinderMl > 0 ? s.cylinderMl : null} from={from} to={from + 15} minor={1} major={5} height={210} />
        <div className="min-w-0 space-y-2">
          <Group title="Pour in">
            <Row>
              {[10, 5, 1, 0.5].map((ml) => <ActBtn key={ml} act={act} a={{ type: "pourWater", ml }}>+{ml} mL</ActBtn>)}
            </Row>
          </Group>
          <Group title="Pour back">
            <Row>
              {[-1, -0.5].map((ml) => <ActBtn key={ml} act={act} a={{ type: "pourWater", ml }}>−{Math.abs(ml)} mL</ActBtn>)}
            </Row>
          </Group>
        </div>
      </div>
      <Hl type="readCylinder">
        <ReadingField label={`Read the cylinder${s.calcWater !== null ? ` (planned ${s.calcWater} mL)` : ""}`} unit="mL" placeholder="0.0" onSubmit={(value) => act({ type: "readCylinder", value })} />
      </Hl>
      <ActBtn act={act} a={{ type: "waterToBeaker" }} variant="soft">Pour into the beaker</ActBtn>
    </div>
  );
}

/** The make-up vessel choice and the transfer — on the beaker and the cylinder alike. */
function MakeUpIn({ s, act, batch }: { s: SyrupState; act: P["act"]; batch: number }) {
  return (
    <Group title="Make up to volume in…">
      <Hl type="chooseVessel">
        <Choice name="Vessel" value={s.vessel} onChange={(x) => act({ type: "chooseVessel", vessel: x as "cylinder" | "beaker-marks" })} options={[{ id: "cylinder", label: `A ${batch} mL measuring cylinder` }, { id: "beaker-marks", label: "The beaker's printed graduations" }]} />
      </Hl>
      <ActBtn act={act} a={{ type: "transferToVessel" }}>Pour the syrup in</ActBtn>
    </Group>
  );
}

// ── Beaker: the mixing vessel ───────────────────────────────────────────────

function preparationState(s: SyrupState) {
  if (s.inVessel) return "Transferred to the cylinder";
  if (s.dissolveDone) return s.tempC > FORMULA.makeUpMaxC ? "Dissolved — cooling" : "Dissolved — cool, ready to transfer";
  if (s.beakerWaterG === 0 && s.sucroseInBeaker === 0) return "Empty";
  if (s.sucroseInBeaker === 0) return "Starting water only";
  if (s.beakerWaterG === 0) return "Dry sucrose only";
  return "Dissolving";
}

function Beaker({ s, act }: P) {
  const v = syrupVisual(s);
  const batch = s.batchMl ?? 100;
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl border border-[#16181d]/10 bg-white px-3 py-2 text-sm">
        <dt className="text-[#4a4f57]">State</dt>
        <dd className="font-semibold">{preparationState(s)}</dd>
        <dt className="text-[#4a4f57]">Mixing</dt>
        <dd className="font-semibold">{s.inVessel ? "—" : s.stirring ? "Stirring" : "Still"}</dd>
        <dt className="text-[#4a4f57]">Position</dt>
        <dd>{s.onHotplate ? `On the hot plate${s.setpoint ? `, ${s.setpoint} °C` : ", off"}` : "On the bench"}</dd>
      </dl>
      {!s.inVessel && (
        <>
          <Thermometer s={s} />
          <Note>{crystalText(s)}{v.yellow > 0 ? " The liquid has turned yellow." : ""}</Note>
        </>
      )}
      {!s.dissolveDone && (
        <>
          <Group title="Charge the beaker">
            <Row>
              <ActBtn act={act} a={{ type: "waterToBeaker" }} disabled={s.beakerWaterG > 0}>Pour in the measured water</ActBtn>
              <ActBtn act={act} a={{ type: "sucroseToBeaker" }} disabled={s.sucroseInBeaker > 0}>Add the sucrose gradually</ActBtn>
              <ActBtn act={act} a={{ type: "beakerOnHotplate" }} disabled={s.onHotplate}>Onto the hot plate</ActBtn>
            </Row>
          </Group>
          <Group title="Mix">
            <Row>
              <StirToggle s={s} act={act} />
            </Row>
            <WaitButtons act={act} options={[15, 30, 60, 120, 300]} />
          </Group>
          <ActBtn act={act} a={{ type: "finishDissolving" }} variant="primary">Dissolution complete</ActBtn>
        </>
      )}
      {s.dissolveDone && !s.inVessel && (
        <>
          <Group title="Cool">
            <WaitButtons act={act} options={[60, 120, 300]} />
          </Group>
          <MakeUpIn s={s} act={act} batch={batch} />
        </>
      )}
      {s.inVessel && (s.rinsed ? <Note>Rinsed into the cylinder — nothing left behind.</Note> : <ActBtn act={act} a={{ type: "rinseBeaker" }}>Rinse beaker + rod into the cylinder</ActBtn>)}
    </div>
  );
}

// ── Hot plate ───────────────────────────────────────────────────────────────

function HotPlate({ s, act }: P) {
  return (
    <div className="space-y-3">
      <Thermometer s={s} timer />
      {!s.onHotplate && !s.inVessel && <ActBtn act={act} a={{ type: "beakerOnHotplate" }}>Put the beaker on the plate</ActBtn>}
      <Group title={`Heat · set ${s.setpoint ? `${s.setpoint} °C` : "off"}`}>
        <div className="grid grid-cols-3 gap-2">
          {HEAT_SETTINGS.map((t) => (
            <ActBtn key={t} act={act} a={{ type: "setHeat", setpoint: t }} variant={s.setpoint === t ? "soft" : "secondary"}>{t === 0 ? "Off" : `${t} °C`}</ActBtn>
          ))}
        </div>
      </Group>
      {!s.inVessel && (
        <>
          <Note>{crystalText(s)}</Note>
          <Row>
            <StirToggle s={s} act={act} />
          </Row>
          <WaitButtons act={act} options={[15, 30, 60, 120, 300]} />
          {!s.dissolveDone && <ActBtn act={act} a={{ type: "finishDissolving" }} variant="primary">Dissolution complete</ActBtn>}
        </>
      )}
    </div>
  );
}

// ── Stirring rod ────────────────────────────────────────────────────────────

function Rod({ s, act }: P) {
  return (
    <div className="space-y-3">
      {s.inVessel ? (
        <>
          <Note>{s.mixedAfterQs ? "Mixed since the last water was added." : "Water added at the top has not been stirred through."}</Note>
          <ActBtn act={act} a={{ type: "mixAfterQs" }} variant="soft">Stir the cylinder to mix</ActBtn>
        </>
      ) : (
        <>
          <Note>{s.stirring ? "Stirring the beaker." : "Resting in the beaker."} {crystalText(s)}</Note>
          <Row>
            <StirToggle s={s} act={act} />
          </Row>
        </>
      )}
    </div>
  );
}

// ── Dispensing bottle ───────────────────────────────────────────────────────

function Bottle({ s, act }: P) {
  const v = syrupVisual(s);
  if (s.finalRead === null) return <Note>Clean, dry and empty. The syrup is packed once its final volume is recorded.</Note>;
  return (
    <div className="space-y-3">
      <Group title="Container">
        <Hl type="pack">
          <Choice name="Container" value={s.container} onChange={(c) => act({ type: "pack", container: c })} options={CONTAINER_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
        </Hl>
      </Group>
      {s.container && (
        <Group title="Storage statement">
          <Hl type="label">
            <Choice name="Storage" value={s.storage} onChange={(x) => act({ type: "label", storage: x })} options={STORAGE_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} />
          </Hl>
        </Group>
      )}
      {s.labelled && (
        <Group title="Appearance — what do you see?">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <BottleSwatch yellow={v.yellow} crystals={v.appearance === "crystals"} thin={v.appearance === "thin"} />
            <Hl type="observe">
              <Choice name="Appearance" value={s.appearance} onChange={(x) => act({ type: "observe", appearance: x })} options={APPEARANCE_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} />
            </Hl>
          </div>
        </Group>
      )}
    </div>
  );
}

function BottleSwatch({ yellow, crystals, thin }: { yellow: number; crystals: boolean; thin: boolean }) {
  const r = 250 - 10 * yellow;
  const g = 246 - 70 * yellow;
  const b = 232 - 150 * yellow;
  return (
    <svg viewBox="0 0 120 150" className="h-28 w-auto" role="img" aria-label="Your syrup in its bottle, against a white background">
      <rect x="0" y="0" width="120" height="150" rx="10" fill="#ffffff" />
      <rect x="48" y="10" width="24" height="18" rx="3" fill="#2b2f35" />
      <path d="M40 30 H80 V44 Q96 52 96 66 V136 Q96 142 90 142 H30 Q24 142 24 136 V66 Q24 52 40 44 Z" fill={`rgba(${r},${g},${b},${thin ? 0.35 : 0.75})`} stroke="#8a5a20" strokeWidth="2" />
      {crystals && [0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={34 + i * 8} y={130 - (i % 3) * 3} width="5" height="5" fill="#ffffff" stroke="#c9c2b0" transform={`rotate(${i * 20} ${36 + i * 8} ${132})`} />)}
    </svg>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const SYRUP_CONTROLS: Record<string, ComponentType<P>> = {
  notebook: Notebook,
  balance: Balance,
  cylinder: Cylinder,
  beaker: Beaker,
  hotplate: HotPlate,
  rod: Rod,
  bottle: Bottle,
};
