"use client";

/**
 * Lab 4 instrument controllers (2026-10-21 — replaces the step-ordered CloveBench and its
 * separate "Eyepiece" tab). Each controller opens only when the student selects its
 * equipment in the room or on the 2D bench plan; the run machine refuses an action from
 * any other instrument. The eyepiece lives on the microscope, where the focus, objective
 * and stage controls that change it are.
 */
import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { Crosshair, Maximize2, Minimize2 } from "lucide-react";
import { fieldOfViewUm, totalMagnification } from "@/lib/virtual-labs/calculations/microscopy";
import { IDENTITY_OPTIONS, MOUNTANTS, REFERENCE_FEATURES, SAMPLE_JARS, type CloveAction, type CloveState } from "@/lib/virtual-labs/experiments/clove";
import { Btn, Choice } from "../interface/ui";
import { ActBtn, Group, Hl, HoldControl, useControlMode } from "../interface/controls";
import { MicroscopeView } from "./MicroscopeView";
import type { BenchProps } from "./types";

type P = BenchProps<CloveState, CloveAction>;

const AMOUNT = { small: "needle-tip of powder", large: "heaped spatula of powder" } as const;
const MOUNTANT_SHORT: Record<string, string> = { chloral: "Chloral hydrate", water: "Water", iodine: "Iodine N/50" };

/** What is on the slide, as the student would see it on the bench. Records actions, never judges them. */
function SlideStatus({ s }: { s: CloveState }) {
  const items: string[] = [];
  if (s.slideCleaned) items.push("wiped");
  if (s.powder) items.push(AMOUNT[s.powder]);
  if (s.mountant) items.push(MOUNTANT_SHORT[s.mountant] ?? s.mountant);
  if (s.warmed) items.push(s.warmed === "gentle" ? "warmed gently" : "boiled");
  if (s.coverslip) items.push(s.coverslip === "angled" ? "coverslip at 45°" : "coverslip dropped flat");
  if (s.blotted) items.push("edges blotted");
  return (
    <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-xs text-[#3a3f47]">
      <span className="font-semibold">Slide: </span>
      {items.length ? items.join(" · ") : "a clean slide is in the box."}
      {s.slideOnStage && <span className="font-semibold"> — on the microscope stage</span>}
    </p>
  );
}

function Jars({ s, act }: P) {
  const [pick, setPick] = useState<string | null>(null);
  if (s.sample) return <p className="text-sm text-[#0f5c3e]">Sample taken from jar PG-07: dark brown, strongly aromatic powder.</p>;
  const jar = SAMPLE_JARS.find((j) => j.id === pick);
  return (
    <div className="space-y-2">
      <Choice name="Pick up a jar to read its label" value={pick} onChange={setPick} options={SAMPLE_JARS.map((j) => ({ id: j.id, label: j.name }))} />
      <ActBtn act={act} a={{ type: "chooseSample", id: pick ?? "" }} variant="primary" disabled={!jar}>
        {jar ? `Take a sample from ${jar.name.match(/PG-\d+/)?.[0] ?? "this jar"}` : "Pick up a jar first"}
      </ActBtn>
    </div>
  );
}

function Prep({ s, act }: P) {
  return (
    <div className="space-y-3">
      <SlideStatus s={s} />
      <Group title="Slide and powder">
        <div className="flex flex-wrap gap-2">
          <ActBtn act={act} a={{ type: "cleanSlide" }} disabled={s.slideCleaned}>Wipe slide + coverslip</ActBtn>
          <ActBtn act={act} a={{ type: "powder", amount: "small" }} disabled={!!s.powder}>Needle-tip of powder</ActBtn>
          <ActBtn act={act} a={{ type: "powder", amount: "large" }} disabled={!!s.powder}>Heaped spatula</ActBtn>
        </div>
      </Group>
      <Group title="Mountant · 1–2 drops">
        <div className="flex flex-wrap gap-2">
          {MOUNTANTS.map((m) => (
            <ActBtn key={m.id} act={act} a={{ type: "mountant", id: m.id }} variant={s.mountant === m.id ? "soft" : "secondary"} disabled={!!s.mountant}>{MOUNTANT_SHORT[m.id] ?? m.name}</ActBtn>
          ))}
        </div>
      </Group>
      <Group title="Spirit lamp">
        <div className="flex flex-wrap gap-2">
          <ActBtn act={act} a={{ type: "warm", how: "gentle" }} disabled={!!s.warmed}>Warm gently</ActBtn>
          <ActBtn act={act} a={{ type: "warm", how: "boiled" }} disabled={!!s.warmed}>Boil over the flame</ActBtn>
        </div>
      </Group>
      <Group title="Coverslip and blotting paper">
        <div className="flex flex-wrap gap-2">
          <ActBtn act={act} a={{ type: "coverslip", method: "angled" }} disabled={!!s.coverslip}>Lower at 45° (needle)</ActBtn>
          <ActBtn act={act} a={{ type: "coverslip", method: "dropped" }} disabled={!!s.coverslip}>Drop it flat</ActBtn>
          <ActBtn act={act} a={{ type: "blot" }} disabled={s.blotted}>Blot the edges</ActBtn>
        </div>
      </Group>
      {s.powder && <ActBtn act={act} a={{ type: "remount" }} variant="danger">Discard slide, make a new one</ActBtn>}
      <Group title="Starch test · separate mount" note={s.iodineDone ? "Iodine mount: no blue-black grains." : undefined}>
        <ActBtn act={act} a={{ type: "iodineTest" }} disabled={s.iodineDone}>Mount a little powder in iodine N/50</ActBtn>
      </Group>
    </div>
  );
}

const KNOBS = [
  { type: "coarse", dir: 1, label: "Coarse ▲", aria: "Coarse focus knob, turn up", every: 260 },
  { type: "coarse", dir: -1, label: "Coarse ▼", aria: "Coarse focus knob, turn down", every: 260 },
  { type: "fine", dir: 1, label: "Fine ▲", aria: "Fine focus knob, turn up", every: 90 },
  { type: "fine", dir: -1, label: "Fine ▼", aria: "Fine focus knob, turn down", every: 90 },
] as const;

function FocusKnobs({ act, className }: { act(a: CloveAction): void; className: string }) {
  return (
    <div className={className}>
      {KNOBS.map((k) => (
        <HoldControl key={k.aria} type={k.type} label={k.aria} every={k.every} onTick={() => act({ type: k.type, dir: k.dir })}>{k.label}</HoldControl>
      ))}
    </div>
  );
}

/**
 * The eyepiece doubles as the stage: dragging the field moves the slide under the
 * objective (the image follows the finger), one stage action per drag, so a phone student
 * can scan without taking their eyes off the view. The arrow pad does the same by button.
 */
function DragField({ s, act, children }: { s: CloveState; act(a: CloveAction): void; children: ReactNode }) {
  const start = useRef<{ x: number; y: number; w: number } | null>(null);
  const live = s.slideOnStage && s.light;
  return (
    <div
      className={live ? "cursor-grab [touch-action:none] active:cursor-grabbing" : ""}
      onPointerDown={(e) => {
        if (!live) return;
        start.current = { x: e.clientX, y: e.clientY, w: e.currentTarget.getBoundingClientRect().width };
      }}
      onPointerUp={(e) => {
        const st = start.current;
        start.current = null;
        if (!st || !live) return;
        const mx = e.clientX - st.x;
        const my = e.clientY - st.y;
        if (Math.hypot(mx, my) < 8) return; // a tap, not a drag
        // one stage action moves 0.6 of a field width; the drag's share of the field sets how far
        const clamp = (v: number) => Math.max(-1, Math.min(1, Math.round(v * 100) / 100));
        act({ type: "stage", dx: clamp(-mx / st.w / 0.6), dy: clamp(-my / st.w / 0.6) });
      }}
      onPointerCancel={() => (start.current = null)}
    >
      {children}
    </div>
  );
}

function Microscope({ s, act }: P) {
  const learning = useControlMode() === "learning";
  const [big, setBig] = useState(false);
  const prepared = s.coverslip !== null;
  return (
    <div className="space-y-3">
      {/* Phones: the sheet cannot hold the eyepiece and every control at once, so the focus
          knobs sit beside the field and the nosepiece right under it — the student watches the
          image sharpen and change magnification while operating. "Enlarge" gives the field the
          full width for close inspection. The desktop dock has room for the large field. */}
      <div className={big ? "" : "grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-2 lg:block"}>
        <DragField s={s} act={act}>
          <MicroscopeView s={s} large />
        </DragField>
        {!big && <FocusKnobs act={act} className="grid gap-1.5 lg:hidden" />}
      </div>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Nosepiece: objective lens">
        {([4, 10, 40] as const).map((m) => (
          <ActBtn key={m} act={act} a={{ type: "objective", mag: m }} variant={s.mag === m ? "soft" : "secondary"} title={s.mag === m ? "In use" : undefined}>{m}×{s.mag === m ? " ●" : ""}</ActBtn>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 text-xs text-[#3a3f47]">
          <span className="font-semibold">{s.slideOnStage ? "Slide on the stage" : prepared ? "Slide ready — not on the stage" : "No slide prepared"}</span>
          {" · "}lamp {s.light ? "on" : "off"} · {s.mag}× objective ({totalMagnification(s.mag)}×), field {(fieldOfViewUm(s.mag) / 1000).toFixed(2)} mm
          {s.slideOnStage && s.light ? " · drag the field to move the stage" : ""}
          {learning && s.mag === 40 && <span className="font-semibold text-[#137a52]"> · at 40×, fine knob only</span>}
        </p>
        <Btn size="sm" variant="ghost" className="lg:hidden" onClick={() => setBig((b) => !b)} aria-pressed={big}>
          {big ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          <span className="ml-1">{big ? "Smaller" : "Enlarge"}</span>
        </Btn>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActBtn act={act} a={{ type: "placeSlide" }} disabled={s.slideOnStage}>Clip slide on stage</ActBtn>
        <ActBtn act={act} a={{ type: "light", on: !s.light }} variant={s.light ? "soft" : "secondary"}>{s.light ? "Lamp off" : "Lamp on"}</ActBtn>
      </div>
      <div className={`grid gap-3 ${big ? "grid-cols-2" : "grid-cols-1 lg:grid-cols-2"}`}>
        <div className={big ? "" : "hidden lg:block"}>
          <Group title="Focus" note="Hold to keep turning.">
            <FocusKnobs act={act} className="grid grid-cols-2 gap-1.5" />
          </Group>
        </div>
        <Group title="Stage">
          <div className="grid max-w-[15rem] grid-cols-3 gap-1">
            <span />
            <HoldControl type="stage" label="Move the field up" every={420} onTick={() => act({ type: "stage", dx: 0, dy: -1 })}>▲</HoldControl>
            <span />
            <HoldControl type="stage" label="Move the field left" every={420} onTick={() => act({ type: "stage", dx: -1, dy: 0 })}>◀</HoldControl>
            <ActBtn act={act} a={{ type: "centre" }} className="!min-h-12 !px-0" title="Centre the stage"><Crosshair className="h-4 w-4" role="img" aria-label="Centre the stage" /></ActBtn>
            <HoldControl type="stage" label="Move the field right" every={420} onTick={() => act({ type: "stage", dx: 1, dy: 0 })}>▶</HoldControl>
            <span />
            <HoldControl type="stage" label="Move the field down" every={420} onTick={() => act({ type: "stage", dx: 0, dy: 1 })}>▼</HoldControl>
            <span />
          </div>
        </Group>
      </div>
    </div>
  );
}

function Notebook({ s, act }: P) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[#3a3f47]">
        Starch test (iodine): {s.iodineDone ? "no blue-black grains" : "not done yet — a separate mount at the slide-preparation station"}.
      </p>
      {!s.checklist ? (
        <Hl type="checklist">
          <Checklist onSubmit={(answers) => act({ type: "checklist", answers })} />
        </Hl>
      ) : (
        <>
          <Group title="Your record against the reference" note="The reference opens only once your own observations are recorded, so the record is what you saw.">
            <Reference mine={s.checklist} />
          </Group>
          <ActBtn act={act} a={{ type: "compare" }} variant="primary" disabled={s.compared}>{s.compared ? "Compared with the reference" : "I have compared my observations"}</ActBtn>
        </>
      )}
      {s.compared && (
        s.identity ? (
          <p className="text-sm text-[#0f5c3e]">Identified as {IDENTITY_OPTIONS.find((o) => o.id === s.identity)?.name}.</p>
        ) : (
          <Hl type="identify">
            <Identify onSubmit={(identity, evidence) => act({ type: "identify", identity, evidence })} />
          </Hl>
        )
      )}
    </div>
  );
}

function Checklist({ onSubmit }: { onSubmit(a: Record<string, "present" | "absent">): void }) {
  const [a, setA] = useState<Record<string, "present" | "absent">>({});
  const left = REFERENCE_FEATURES.length - Object.keys(a).length;
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold">Feature checklist</p>
      {REFERENCE_FEATURES.map((f) => (
        <fieldset key={f.id} className="flex items-center gap-2 rounded-xl border border-[#16181d]/10 bg-white px-2 py-1.5">
          <legend className="sr-only">{f.label}</legend>
          <p className="min-w-0 flex-1 text-xs leading-snug">{f.label}</p>
          {(["present", "absent"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={a[f.id] === v} onClick={() => setA((x) => ({ ...x, [f.id]: v }))} className={`min-h-9 shrink-0 rounded-lg border px-2 text-[11px] font-semibold capitalize ${a[f.id] === v ? (v === "present" ? "border-brandGreen bg-brandGreen/10 text-[#0f5c3e]" : "border-[#16181d]/40 bg-[#16181d]/[0.06]") : "border-[#16181d]/12"}`}>{v}</button>
          ))}
        </fieldset>
      ))}
      <Btn variant="primary" size="sm" disabled={left > 0} onClick={() => onSubmit(a)}>{left > 0 ? `Record observations (${left} to mark)` : "Record observations"}</Btn>
    </div>
  );
}

/** The verified reference description, side by side with what the student recorded. */
function Reference({ mine }: { mine: Record<string, "present" | "absent"> }) {
  return (
    <div className="space-y-3">
      <ul className="vl-list space-y-1.5">
        {REFERENCE_FEATURES.map((f) => (
          <li key={f.id} className="rounded-xl border border-[#16181d]/[0.08] px-2.5 py-1.5 text-xs">
            <p className="text-sm">{f.label}</p>
            <p className="mt-0.5 text-[#4a4f57]">{f.description}</p>
            <p className="mt-0.5 font-semibold">
              Genuine clove: {f.expected === "present" ? "present" : "absent / few"} · <span className="text-brandBlue">your record: {mine[f.id] ?? "—"}</span>
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#4a4f57]">Sources: Jackson &amp; Snowdon, <em>Atlas of Microscopy of Medicinal Plants, Culinary Herbs and Spices</em> (on the UoK reading list); Ayurvedic Pharmacopoeia of India, Vol. I (Lavanga: pollen 15–20 µm, rosette crystals 10–15 µm; stone cells and prisms in stalks); British Pharmaceutical Codex 1911 (stalks: sclerenchymatous cells; mother cloves: starch).</p>
      <figure className="rounded-xl border border-amber-200 bg-amber-50/50 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/models/virtual-labs/specimens/clove-oil-glands-commons.jpg" alt="Photograph through a microscope eyepiece of a fragment of clove powder with several round oil glands." className="mx-auto max-h-64 rounded-lg" loading="lazy" />
        <figcaption className="mt-1 text-xs text-amber-950">
          Reference photograph contributed to Wikimedia Commons as clove-powder oil glands under a light microscope (no scale bar). <strong>Not yet confirmed by our reviewer.</strong> Photo: آية تاج الدين, <a className="underline" href="https://commons.wikimedia.org/wiki/File:Oil_glands_of_clove_powder_under_light_microscope.jpg" target="_blank" rel="noreferrer">Wikimedia Commons</a>, <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>.
        </figcaption>
      </figure>
    </div>
  );
}

function Identify({ onSubmit }: { onSubmit(identity: string, evidence: string[]): void }) {
  const [id, setId] = useState<string | null>(null);
  const [ev, setEv] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Identification</p>
      <Choice name="Identity" value={id} onChange={setId} options={IDENTITY_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
      <p className="text-sm font-semibold">Evidence (at least three)</p>
      <div className="grid gap-1.5">
        {REFERENCE_FEATURES.map((f) => (
          <label key={f.id} className={`flex min-h-10 cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-xs ${ev.includes(f.id) ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/12"}`}>
            <input type="checkbox" className="mt-0.5 accent-[#1C7BD9]" checked={ev.includes(f.id)} onChange={(e) => setEv((x) => (e.target.checked ? [...x, f.id] : x.filter((y) => y !== f.id)))} />
            {f.expected === "present" ? f.label : `No ${f.label.toLowerCase()}`}
          </label>
        ))}
      </div>
      <Btn variant="primary" size="sm" disabled={!id || ev.length < 3} onClick={() => onSubmit(id!, ev)}>Submit identification</Btn>
    </div>
  );
}

/** Controller id (experiment `controllers[].id`) → its panel. */
export const CLOVE_CONTROLS: Record<string, ComponentType<P>> = {
  jars: Jars,
  prep: Prep,
  microscope: Microscope,
  notebook: Notebook,
};
