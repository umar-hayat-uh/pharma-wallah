"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the stage control panels
// ============================================================
//
// One panel per stage of the experiment. Each is presentation plus the
// student's actions; every decision about whether an action is allowed, and
// every consequence of it, lives in `useLabMachine` and `engine.ts`.
//
// Every stage that involves dragging also offers a tap or button route to the
// same outcome — a lab is used on phones, and drag-only interfaces exclude
// keyboard and assistive-technology users entirely.

import React from "react";
import {
  AlertTriangle,
  Check,
  CircleDashed,
  DoorClosed,
  DoorOpen,
  Play,
  RotateCcw,
  Sparkles,
  Thermometer,
  Wand2,
} from "lucide-react";

import {
  ANTIBIOTICS,
  INTERPRETATION_SYSTEMS,
  MAX_DISKS,
  MIN_DISKS,
  ORGANISMS,
} from "./data";
import { AgarBottle, ColonyPlate, Incubator, SterileSwab, TurbidityTube } from "./equipment";
import type { CoverageReport } from "./engine";
import type { AgarDepth, TurbidityBand } from "./types";
import type { LabState } from "./useLabMachine";

/** The reducer owns the experiment's shape, so its state type is the authority. */
export type StageState = LabState;

export interface StageActions {
  selectOrganism: (id: string) => void;
  setInterpretationSystem: (id: string) => void;
  prepareSuspension: () => void;
  setTurbidity: (band: TurbidityBand) => void;
  setAgarDepth: (depth: AgarDepth) => void;
  pourPlate: () => void;
  sweep: (angleDeg: number) => void;
  rimPass: () => void;
  resetLawn: () => void;
  selectDisk: (id: string | null) => void;
  removeDisk: (id: string) => void;
  autoArrange: () => void;
  beginTrayDrag: (id: string, e: React.PointerEvent) => void;
  setDoorOpen: (open: boolean) => void;
  loadPlate: () => void;
  setIncubation: (patch: { tempC?: number; hours?: number }) => void;
  startIncubation: () => void;
}

export interface StageContext {
  state: StageState;
  coverage: CoverageReport;
  selectedDiskId: string | null;
  doorOpen: boolean;
  plateLoaded: boolean;
  actions: StageActions;
}

// ─── Small shared pieces ────────────────────────────────────

function StageCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4">{children}</div>;
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
      {children}
    </p>
  );
}

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brandBlue px-4 py-2.5 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2";
const SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition-colors enabled:hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2";

// ─── 1. Intro — choose the isolate ──────────────────────────

export function IntroStage({ state, actions }: StageContext) {
  return (
    <div className="space-y-4">
      <StageCard>
        <Legend>Culture collection — choose the isolate to test</Legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {ORGANISMS.map((org) => {
            const selected = state.organismId === org.id;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => actions.selectOrganism(org.id)}
                aria-pressed={selected}
                className={`text-left rounded-2xl border-2 p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  selected ? "border-brandBlue bg-brandBlue/[0.05]" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
                    style={{ background: org.color }}
                  >
                    {org.gram === "positive" ? "G+" : "G−"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold italic text-slate-900 leading-tight">{org.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{org.strain}</p>
                    <p className="text-[12px] text-slate-600 leading-relaxed mt-1.5">{org.morphology}</p>
                  </div>
                  {selected && <Check className="h-4 w-4 shrink-0 text-brandBlue" aria-hidden />}
                </div>
              </button>
            );
          })}
        </div>
      </StageCard>

      <StageCard>
        <label htmlFor="sim-system" className="block">
          <Legend>How results will be reported</Legend>
        </label>
        <select
          id="sim-system"
          value={state.interpretationSystemId}
          onChange={(e) => actions.setInterpretationSystem(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-800"
        >
          {INTERPRETATION_SYSTEMS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
          Interpretive criteria are configuration, not a constant. You can change this at any point —
          the diameters you measure will not change, only the words the report uses.
        </p>
      </StageCard>
    </div>
  );
}

// ─── 2. Inoculum ────────────────────────────────────────────

const TURBIDITY_OPTIONS: { band: TurbidityBand; label: string; density: number; hint: string }[] = [
  { band: "light", label: "Too light", density: 0.12, hint: "lines still sharp" },
  { band: "standard", label: "Matches the standard", density: 0.45, hint: "lines just blurred" },
  { band: "heavy", label: "Too heavy", density: 0.9, hint: "lines barely visible" },
];

export function InoculumStage({ state, actions }: StageContext) {
  return (
    <div className="space-y-4">
      <StageCard>
        <Legend>Step 1 — suspend the colonies</Legend>
        <div className="flex flex-wrap items-center gap-4">
          <ColonyPlate color={state.organismId ? ORGANISMS.find((o) => o.id === state.organismId)?.color : undefined} />
          <div className="flex-1 min-w-[180px]">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Take three to five well-isolated colonies of the same morphology from the pure culture and
              emulsify them in sterile saline until no clumps remain.
            </p>
            <button type="button" className={PRIMARY} onClick={actions.prepareSuspension} disabled={state.suspensionPrepared}>
              {state.suspensionPrepared ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  Suspension prepared
                </>
              ) : (
                "Suspend colonies in saline"
              )}
            </button>
          </div>
        </div>
      </StageCard>

      <StageCard>
        <Legend>Step 2 — standardise against the turbidity standard</Legend>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Hold the tube against a card of black lines in good light and compare it with the standard.
          This is the single biggest controllable source of error in the whole method.
        </p>
        <div
          className="grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Inoculum density"
        >
          {TURBIDITY_OPTIONS.map((opt) => {
            const selected = state.turbidity === opt.band;
            return (
              <button
                key={opt.band}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!state.suspensionPrepared}
                onClick={() => actions.setTurbidity(opt.band)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  selected
                    ? opt.band === "standard"
                      ? "border-brandGreen bg-brandGreen/[0.07]"
                      : "border-amber-400 bg-amber-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <TurbidityTube density={opt.density} label={opt.label} highlighted={selected && opt.band === "standard"} />
                <span className="text-[11px] font-bold text-slate-800 text-center leading-tight">{opt.label}</span>
                <span className="text-[10px] text-slate-500 text-center leading-tight">{opt.hint}</span>
              </button>
            );
          })}
        </div>
        {!state.suspensionPrepared && (
          <p className="mt-2 text-[12px] font-semibold text-slate-500">Suspend the colonies first.</p>
        )}
      </StageCard>
    </div>
  );
}

// ─── 3. Plate preparation ───────────────────────────────────

const DEPTH_OPTIONS: { depth: AgarDepth; label: string; detail: string }[] = [
  { depth: "thin", label: "About 2 mm", detail: "drug spreads further — zones read large" },
  { depth: "standard", label: "4 mm", detail: "the depth the method assumes" },
  { depth: "thick", label: "About 6 mm", detail: "drug held back — zones read small" },
];

export function PlatePreparationStage({ state, actions }: StageContext) {
  return (
    <div className="space-y-4">
      <StageCard>
        <Legend>Pour the Mueller-Hinton agar</Legend>
        <div className="flex flex-wrap items-start gap-4">
          <AgarBottle selected={!state.plateReady} />
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Mueller-Hinton agar is used because it is low in inhibitors of sulphonamides and
              trimethoprim, supports most non-fastidious pathogens, and behaves reproducibly batch to
              batch. Depth matters because the drug diffuses in three dimensions.
            </p>
            <fieldset disabled={state.plateReady} className="mb-3">
              <legend className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2">
                Depth to pour
              </legend>
              <div className="grid gap-2">
                {DEPTH_OPTIONS.map((opt) => (
                  <label
                    key={opt.depth}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border-2 p-2.5 transition-colors ${
                      state.agarDepth === opt.depth
                        ? opt.depth === "standard"
                          ? "border-brandGreen bg-brandGreen/[0.07]"
                          : "border-amber-400 bg-amber-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="agar-depth"
                      value={opt.depth}
                      checked={state.agarDepth === opt.depth}
                      onChange={() => actions.setAgarDepth(opt.depth)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brandBlue"
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="block text-[12px] text-slate-600">{opt.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" className={PRIMARY} onClick={actions.pourPlate} disabled={state.plateReady || !state.agarDepth}>
              {state.plateReady ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  Plate poured and dry
                </>
              ) : (
                "Pour the plate"
              )}
            </button>
            {!state.agarDepth && !state.plateReady && (
              <p className="mt-2 text-[12px] font-semibold text-slate-500">Choose a depth first.</p>
            )}
          </div>
        </div>
      </StageCard>
    </div>
  );
}

// ─── 4. Inoculation ─────────────────────────────────────────

const SWEEPS = [
  { angle: 0, label: "Horizontal pass" },
  { angle: 60, label: "Turn 60° and repeat" },
  { angle: 120, label: "Turn 60° again" },
];

export function InoculationStage({ state, coverage, actions }: StageContext) {
  const pct = Math.round(coverage.fraction * 100);
  return (
    <div className="space-y-4">
      <StageCard>
        <Legend>Swab the plate</Legend>
        <div className="flex flex-wrap items-start gap-4">
          <SterileSwab wet />
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Drag across the plate to swab it, or use the buttons below for a complete pass in each
              orientation. Three orientations plus a rim pass is what turns separate streaks into one
              confluent lawn.
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
              {SWEEPS.map((s, i) => {
                const done = state.orientations.includes(i);
                return (
                  <button
                    key={s.angle}
                    type="button"
                    className={`${SECONDARY} justify-start ${done ? "border-brandGreen/40 bg-brandGreen/[0.06] text-brandGreen" : ""}`}
                    onClick={() => actions.sweep(s.angle)}
                  >
                    {done ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : <CircleDashed className="h-4 w-4 shrink-0" aria-hidden />}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className={`${SECONDARY} ${state.rimPass ? "border-brandGreen/40 bg-brandGreen/[0.06] text-brandGreen" : ""}`}
                onClick={actions.rimPass}
                disabled={state.rimPass}
              >
                {state.rimPass ? <Check className="h-4 w-4" aria-hidden /> : <CircleDashed className="h-4 w-4" aria-hidden />}
                Run the swab round the rim
              </button>
              <button type="button" className={SECONDARY} onClick={actions.resetLawn}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Start the lawn again
              </button>
            </div>
          </div>
        </div>
      </StageCard>

      <StageCard>
        <Legend>Lawn coverage</Legend>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <p className="text-sm text-slate-600">Target: an even lawn across the whole surface</p>
          <p className="text-xl font-black tabular-nums text-slate-900" aria-live="polite">
            {pct}%
          </p>
        </div>
        <div
          className="h-2.5 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Agar surface covered"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${coverage.fraction >= 0.85 ? "bg-brandGreen" : "bg-amber-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 grid gap-1.5 text-[13px]">
          {[
            [coverage.fraction >= 0.85, `Whole surface covered (${pct}% of 85% needed)`],
            [coverage.orientations >= 3, `Three streak orientations (${coverage.orientations} of 3)`],
            [coverage.rimPass, "Rim pass completed"],
          ].map(([done, label]) => (
            <p key={String(label)} className={`flex items-center gap-2 ${done ? "text-brandGreen font-semibold" : "text-slate-500"}`}>
              {done ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <CircleDashed className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {label}
            </p>
          ))}
        </div>
        {!coverage.uniform && coverage.fraction > 0.3 && (
          <p className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[12.5px] text-amber-900 leading-relaxed">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden />
            The bacterial lawn is not yet uniform. You can incubate it anyway and see what a patchy lawn
            does to the zone edges — or repeat the swabbing pattern first.
          </p>
        )}
      </StageCard>
    </div>
  );
}

// ─── 5. Disk placement ──────────────────────────────────────

export function DiskPlacementStage({ state, selectedDiskId, actions }: StageContext) {
  const placedIds = state.placements.map((p) => p.antibioticId);
  const full = state.placements.length >= MAX_DISKS;

  return (
    <div className="space-y-4">
      <StageCard>
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <Legend>Antibiotic disks</Legend>
          <p className="text-[11px] font-bold text-slate-500 tabular-nums">
            {state.placements.length} / {MAX_DISKS} placed · need {MIN_DISKS}
          </p>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Tap a disk to pick it up, then tap the plate to place it — or drag it straight across. The
          plate holds {MAX_DISKS} at correct spacing, so choosing the panel is part of the exercise.
        </p>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
          {ANTIBIOTICS.map((a) => {
            const placed = placedIds.includes(a.id);
            const selected = selectedDiskId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                disabled={placed || (full && !placed)}
                aria-pressed={selected}
                aria-label={`${a.name} ${a.diskContent}${placed ? ", already on the plate" : ""}`}
                onPointerDown={(e) => {
                  if (!placed && !full) actions.beginTrayDrag(a.id, e);
                }}
                onClick={() => !placed && !full && actions.selectDisk(selected ? null : a.id)}
                className={`flex touch-none flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  selected ? "scale-[1.03] shadow-md" : "hover:border-slate-300"
                }`}
                style={{ borderColor: placed ? "#e2e8f0" : selected ? a.color : `${a.color}44` }}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full border-2 text-[10px] font-black"
                  style={{ borderColor: a.color, color: a.color, background: `${a.color}12` }}
                >
                  {a.id}
                </span>
                <span className="text-[9.5px] font-bold text-slate-600 leading-none text-center">{a.diskContent}</span>
              </button>
            );
          })}
        </div>

        {selectedDiskId && (
          <p className="mt-3 rounded-xl bg-brandBlue/[0.06] px-3 py-2 text-[12.5px] font-semibold text-brandBlue">
            {ANTIBIOTICS.find((a) => a.id === selectedDiskId)?.name} is in the forceps — tap the plate to
            place it.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={SECONDARY} onClick={actions.autoArrange} disabled={state.placements.length < 2}>
            <Wand2 className="h-4 w-4" aria-hidden />
            Space the placed disks evenly
          </button>
        </div>
      </StageCard>

      {state.placements.length > 0 && (
        <StageCard>
          <Legend>On the plate</Legend>
          <div className="grid gap-2">
            {state.placements.map((p) => {
              const a = ANTIBIOTICS.find((x) => x.id === p.antibioticId);
              return (
                <div key={p.antibioticId} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[10px] font-black"
                    style={{ borderColor: a?.color, color: a?.color }}
                  >
                    {p.antibioticId}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-slate-900 truncate">{a?.name}</span>
                    <span className="block text-[11px] text-slate-500 tabular-nums">
                      {Math.hypot(p.x, p.y).toFixed(0)} mm from centre
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.removeDisk(p.antibioticId)}
                    className="rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 text-[12px] text-slate-500 leading-relaxed">
            You can lift and re-place disks here because this is a simulation. On a real plate a disk
            that has touched the agar cannot be moved — diffusion has already started.
          </p>
        </StageCard>
      )}
    </div>
  );
}

// ─── 6. Incubation ──────────────────────────────────────────

export function IncubationStage({ state, doorOpen, plateLoaded, actions }: StageContext) {
  const running = state.incubationRunning;
  const done = state.incubationProgress >= 100;
  return (
    <div className="space-y-4">
      <StageCard>
        <Legend>Incubator</Legend>
        <div className="flex flex-wrap gap-4">
          <div className="w-[150px] shrink-0 mx-auto sm:mx-0">
            <Incubator
              progress={state.incubationProgress}
              tempC={state.incubationTempC}
              hours={state.incubationHours}
              doorOpen={doorOpen}
              plateLoaded={plateLoaded}
              done={done}
            />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2.5">
            <button
              type="button"
              className={`${SECONDARY} w-full justify-between`}
              onClick={() => actions.setDoorOpen(!doorOpen)}
              disabled={running}
            >
              <span className="inline-flex items-center gap-2">
                {doorOpen ? <DoorOpen className="h-4 w-4" aria-hidden /> : <DoorClosed className="h-4 w-4" aria-hidden />}
                {doorOpen ? "Close the door" : "Open the door"}
              </span>
            </button>

            <button
              type="button"
              className={`${SECONDARY} w-full justify-between`}
              onClick={actions.loadPlate}
              disabled={!doorOpen || plateLoaded || running}
            >
              <span className="inline-flex items-center gap-2">
                {plateLoaded ? <Check className="h-4 w-4 text-brandGreen" aria-hidden /> : <CircleDashed className="h-4 w-4" aria-hidden />}
                {plateLoaded ? "Plate loaded, inverted" : "Load the inverted plate"}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Temperature
                </span>
                <select
                  value={state.incubationTempC}
                  onChange={(e) => actions.setIncubation({ tempC: Number(e.target.value) })}
                  disabled={running || done}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
                >
                  {[30, 35, 37, 42].map((t) => (
                    <option key={t} value={t}>{`${t} °C`}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Duration
                </span>
                <select
                  value={state.incubationHours}
                  onChange={(e) => actions.setIncubation({ hours: Number(e.target.value) })}
                  disabled={running || done}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
                >
                  {[16, 18, 24].map((h) => (
                    <option key={h} value={h}>{`${h} hours`}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              className={`${PRIMARY} w-full`}
              onClick={actions.startIncubation}
              disabled={!plateLoaded || doorOpen || running || done}
            >
              <Play className="h-4 w-4" aria-hidden />
              {done ? "Cycle complete" : running ? `Incubating… ${Math.round(state.incubationProgress)}%` : "Start incubation"}
            </button>

            <p className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] text-slate-600 leading-relaxed" aria-live="polite">
              {!plateLoaded
                ? "Open the door, then load the plate."
                : doorOpen
                  ? "Close the door before starting the cycle."
                  : done
                    ? "The lawn has grown in. Move on to observe the plate."
                    : running
                      ? "Running. The simulated cycle is compressed — a real one takes 16 to 18 hours."
                      : "Ready to start."}
            </p>
          </div>
        </div>
      </StageCard>

      <StageCard>
        <Legend>Why these settings</Legend>
        <div className="grid gap-2 text-[13px] text-slate-600 leading-relaxed">
          <p className="flex gap-2">
            <Thermometer className="h-4 w-4 shrink-0 text-brandBlue mt-0.5" aria-hidden />
            Standard testing is at 35 ± 2 °C in air. A CO₂ incubator lowers the agar pH and shifts the
            zones for several drug classes, so it is used only where a method specifically calls for it.
          </p>
          <p className="flex gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-brandBlue mt-0.5" aria-hidden />
            The plate is inverted so condensation cannot drop onto the agar and smear the lawn. It goes
            in within about 15 minutes of the disks being applied, so diffusion and growth start together.
          </p>
        </div>
      </StageCard>
    </div>
  );
}
