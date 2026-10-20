"use client";

/** Lab 4 bench controls — microscopical identification of powdered clove. */
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair } from "lucide-react";
import { IDENTITY_OPTIONS, MOUNTANTS, REFERENCE_FEATURES, SAMPLE_JARS, type CloveAction, type CloveState } from "@/lib/virtual-labs/experiments/clove";
import { Btn, Choice, Section } from "../interface/ui";
import { MicroscopeView } from "./MicroscopeView";
import type { BenchProps } from "./types";

export function CloveBench({ s, act, stepId, done }: BenchProps<CloveState, CloveAction>) {
  return (
    <div className="space-y-2">
      <Section title="1 · Inspect the bench" current={stepId === "inspect"} done={done("inspect")}>
        <p className="text-sm text-[#3a3f47]">Select each item — in the room, the Steps list or the Equipment tab.</p>
      </Section>

      <Section title="2 · Select the sample" current={stepId === "sample"} done={done("sample")}>
        <Choice name="Sample jar" value={s.sample} onChange={(id) => act({ type: "chooseSample", id })} options={SAMPLE_JARS.map((j) => ({ id: j.id, label: j.name }))} />
      </Section>

      <Section title="3 · Prepare the slide" current={stepId === "prepare"} done={done("prepare")}>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "cleanSlide" })} disabled={s.slideCleaned}>Wipe slide and coverslip</Btn>
          <Btn size="sm" onClick={() => act({ type: "powder", amount: "small" })} disabled={!!s.powder}>A needle-tip of powder</Btn>
          <Btn size="sm" onClick={() => act({ type: "powder", amount: "large" })} disabled={!!s.powder}>A heaped spatula of powder</Btn>
        </div>
        <p className="text-sm font-semibold">Mountant</p>
        <div className="flex flex-wrap gap-2">
          {MOUNTANTS.map((m) => <Btn key={m.id} size="sm" variant={s.mountant === m.id ? "soft" : "secondary"} onClick={() => act({ type: "mountant", id: m.id })} disabled={!!s.mountant}>1–2 drops {m.name.toLowerCase()}</Btn>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => act({ type: "warm", how: "gentle" })} disabled={!!s.warmed}>Warm gently over the lamp</Btn>
          <Btn size="sm" onClick={() => act({ type: "warm", how: "boiled" })} disabled={!!s.warmed}>Boil it over the flame</Btn>
          <Btn size="sm" onClick={() => act({ type: "coverslip", method: "angled" })} disabled={!!s.coverslip}>Lower coverslip at 45°</Btn>
          <Btn size="sm" onClick={() => act({ type: "coverslip", method: "dropped" })} disabled={!!s.coverslip}>Drop coverslip flat</Btn>
          <Btn size="sm" onClick={() => act({ type: "blot" })} disabled={s.blotted}>Blot the edges</Btn>
        </div>
        {s.powder && <Btn size="sm" variant="danger" onClick={() => act({ type: "remount" })}>Discard this slide and prepare a new one</Btn>}
      </Section>

      <Section title="4 · Set up the microscope" current={stepId === "setup"} done={done("setup")}>
        <ScopeControls s={s} act={act} />
      </Section>

      <Section title="5 · Observe" current={stepId === "observe"} done={done("observe")}>
        <ScopeControls s={s} act={act} />
        <Btn size="sm" variant="ghost" onClick={() => act({ type: "iodineTest" })} disabled={s.iodineDone}>Separate mount: iodine test for starch</Btn>
        {s.iodineDone && <p className="text-sm text-[#3a3f47]">Iodine mount: no blue-black grains.</p>}
      </Section>

      <Section title="6 · Record the features" current={stepId === "checklist"} done={done("checklist")}>
        <Checklist onSubmit={(answers) => act({ type: "checklist", answers })} disabled={!!s.checklist} />
      </Section>

      <Section title="7 · Compare with the reference" current={stepId === "compare"} done={done("compare")}>
        <Reference />
        <Btn size="sm" variant="primary" onClick={() => act({ type: "compare" })} disabled={s.compared}>I have compared my observations</Btn>
      </Section>

      <Section title="8 · Identify" current={stepId === "identify"} done={done("identify")}>
        <Identify onSubmit={(identity, evidence) => act({ type: "identify", identity, evidence })} disabled={!!s.identity} />
      </Section>
    </div>
  );
}

export function ScopeControls({ s, act, large }: { s: CloveState; act(a: CloveAction): void; large?: boolean }) {
  return (
    <div className="space-y-3">
      <MicroscopeView s={s} large={large} />
      <div className="flex flex-wrap gap-2">
        <Btn size="sm" onClick={() => act({ type: "placeSlide" })} disabled={s.slideOnStage}>Slide onto the stage</Btn>
        <Btn size="sm" variant={s.light ? "soft" : "secondary"} onClick={() => act({ type: "light", on: !s.light })}>Lamp {s.light ? "on" : "off"}</Btn>
        {([4, 10, 40] as const).map((m) => (
          <Btn key={m} size="sm" variant={s.mag === m ? "soft" : "secondary"} onClick={() => act({ type: "objective", mag: m })} aria-pressed={s.mag === m}>{m}×</Btn>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#4a4f57]">Focus</p>
          <div className="grid grid-cols-2 gap-1.5">
            <Btn size="sm" onClick={() => act({ type: "coarse", dir: 1 })}>Coarse ▲</Btn>
            <Btn size="sm" onClick={() => act({ type: "fine", dir: 1 })}>Fine ▲</Btn>
            <Btn size="sm" onClick={() => act({ type: "coarse", dir: -1 })}>Coarse ▼</Btn>
            <Btn size="sm" onClick={() => act({ type: "fine", dir: -1 })}>Fine ▼</Btn>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#4a4f57]">Stage</p>
          <div className="grid grid-cols-3 gap-1">
            <span />
            <Btn size="sm" aria-label="Move the field up" onClick={() => act({ type: "stage", dx: 0, dy: -1 })}><ArrowUp className="h-4 w-4" aria-hidden /></Btn>
            <span />
            <Btn size="sm" aria-label="Move the field left" onClick={() => act({ type: "stage", dx: -1, dy: 0 })}><ArrowLeft className="h-4 w-4" aria-hidden /></Btn>
            <Btn size="sm" aria-label="Centre the stage" onClick={() => act({ type: "centre" })}><Crosshair className="h-4 w-4" aria-hidden /></Btn>
            <Btn size="sm" aria-label="Move the field right" onClick={() => act({ type: "stage", dx: 1, dy: 0 })}><ArrowRight className="h-4 w-4" aria-hidden /></Btn>
            <span />
            <Btn size="sm" aria-label="Move the field down" onClick={() => act({ type: "stage", dx: 0, dy: 1 })}><ArrowDown className="h-4 w-4" aria-hidden /></Btn>
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ onSubmit, disabled }: { onSubmit(a: Record<string, "present" | "absent">): void; disabled: boolean }) {
  const [a, setA] = useState<Record<string, "present" | "absent">>({});
  return (
    <div className="space-y-2">
      {REFERENCE_FEATURES.map((f) => (
        <fieldset key={f.id} className="rounded-xl border border-[#16181d]/10 bg-white p-2" disabled={disabled}>
          <legend className="sr-only">{f.label}</legend>
          <p className="text-sm">{f.label}</p>
          <div className="mt-1 flex gap-1.5">
            {(["present", "absent"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={a[f.id] === v} onClick={() => setA((x) => ({ ...x, [f.id]: v }))} className={`min-h-9 rounded-lg border px-3 text-xs font-semibold capitalize ${a[f.id] === v ? (v === "present" ? "border-brandGreen bg-brandGreen/10 text-[#0f5c3e]" : "border-[#16181d]/40 bg-[#16181d]/[0.06]") : "border-[#16181d]/12"}`}>{v}</button>
            ))}
          </div>
        </fieldset>
      ))}
      <Btn variant="primary" size="sm" disabled={disabled || Object.keys(a).length < REFERENCE_FEATURES.length} onClick={() => onSubmit(a)}>Record observations</Btn>
    </div>
  );
}

function Reference() {
  return (
    <div className="space-y-3">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-[#4a4f57]"><tr><th className="py-1">Feature</th><th className="py-1">Genuine clove</th></tr></thead>
        <tbody>
          {REFERENCE_FEATURES.map((f) => (
            <tr key={f.id} className="border-t border-[#16181d]/[0.06] align-top">
              <td className="py-1.5 pr-2">{f.label}<span className="mt-0.5 block text-xs text-[#4a4f57]">{f.description}</span></td>
              <td className="py-1.5 font-semibold">{f.expected === "present" ? "Present" : "Absent / few"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function Identify({ onSubmit, disabled }: { onSubmit(identity: string, evidence: string[]): void; disabled: boolean }) {
  const [id, setId] = useState<string | null>(null);
  const [ev, setEv] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      <Choice name="Identity" value={id} onChange={setId} options={IDENTITY_OPTIONS.map((o) => ({ id: o.id, label: o.name }))} />
      <p className="text-sm font-semibold">Evidence (choose at least three)</p>
      <div className="grid gap-1.5">
        {REFERENCE_FEATURES.map((f) => (
          <label key={f.id} className={`flex min-h-10 cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${ev.includes(f.id) ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/12"}`}>
            <input type="checkbox" className="mt-0.5 accent-[#1C7BD9]" checked={ev.includes(f.id)} disabled={disabled} onChange={(e) => setEv((x) => (e.target.checked ? [...x, f.id] : x.filter((y) => y !== f.id)))} />
            {f.expected === "present" ? f.label : `No ${f.label.toLowerCase()}`}
          </label>
        ))}
      </div>
      <Btn variant="primary" size="sm" disabled={disabled || !id || ev.length < 3} onClick={() => onSubmit(id!, ev)}>Submit identification</Btn>
    </div>
  );
}
