"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the workspace
// ============================================================
//
// The bench. It owns the layout, the pointer interactions on the plate, and
// the two timed processes (incubation, then the zones appearing). Everything
// it decides, it decides by asking the state machine — this file holds no
// rules about what is or is not allowed.
//
// Layout: a controls column beside the plate on desktop; on a phone the plate
// comes first, then the controls, then the action bar, with nothing horizontally
// scrollable.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
  X,
} from "lucide-react";

import PetriDish, { CALIPER_GRAB_MM, plateMmFromClient, type Caliper } from "./PetriDish";
import {
  DiskPlacementStage,
  IncubationStage,
  InoculationStage,
  InoculumStage,
  IntroStage,
  PlatePreparationStage,
  type StageActions,
  type StageContext,
} from "./stages";
import MeasurementTool from "./MeasurementTool";
import ResultsDashboard from "./ResultsDashboard";
import CompletionScreen from "./CompletionScreen";
import {
  ANTIBIOTIC_BY_ID,
  DISK_DIAMETER_MM,
  MIN_DISKS,
  PLATE_RADIUS_MM,
} from "./data";
import {
  cellsUnderSwab,
  orientationBucket,
  rimCells,
  scoreTechnique,
  sweepCells,
} from "./engine";
import { generateReport } from "./report";
import {
  STAGE_LABELS,
  STAGE_ORDER,
  stageComplete,
  stageUnlocked,
  type LabState,
} from "./useLabMachine";
import type { FeedbackEntry, LabStage, Organism } from "./types";

/** Stages that put something on the bench rather than a plate on screen. */
const PLATE_HIDDEN: LabStage[] = ["results", "completed"];

export interface SimulationWorkspaceProps {
  state: LabState;
  dispatch: React.Dispatch<any>;
  organism: Organism | null;
  coverage: ReturnType<typeof import("./engine").evaluateCoverage>;
  tryPlaceDisk: (antibioticId: string, x: number, y: number) => boolean;
  onReviewGuide: () => void;
  /** Called once when the experiment first reaches "completed". */
  onComplete?: (summary: { techniquePercent: number; organismName: string }) => void;
}

export default function SimulationWorkspace({
  state,
  dispatch,
  organism,
  coverage,
  tryPlaceDisk,
  onReviewGuide,
  onComplete,
}: SimulationWorkspaceProps) {
  const reduceMotion = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);

  // ── Local, purely presentational state ────────────────────
  const [selectedDiskId, setSelectedDiskId] = useState<string | null>(null);
  const [activeDiskId, setActiveDiskId] = useState<string | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [plateLoaded, setPlateLoaded] = useState(false);
  const [caliper, setCaliper] = useState<Caliper | null>(null);
  const [zoom, setZoom] = useState(1);
  const [zoneReveal, setZoneReveal] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [trayGhost, setTrayGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  const [trayDragging, setTrayDragging] = useState(false);
  /**
   * Live drag bookkeeping.
   *
   * It is a ref rather than state because the window listeners below are
   * installed once per drag and would otherwise close over a stale `moved`.
   * `moved` is what separates a drag from a tap: on a tap the pointerdown must
   * do nothing and let the button's own onClick toggle the selection, which is
   * how tap-to-select then tap-the-plate works. Selecting on pointerdown as
   * well meant the click immediately toggled it back off and nothing was ever
   * in the forceps.
   */
  const trayDragRef = useRef<{ id: string; startX: number; startY: number; moved: boolean } | null>(null);
  const [draggingCaliper, setDraggingCaliper] = useState<"a" | "b" | null>(null);
  const [draggingDiskId, setDraggingDiskId] = useState<string | null>(null);

  /** Cells painted during the current swab stroke, and where it started. */
  const strokeRef = useRef<{ cells: Set<number>; from: { x: number; y: number } } | null>(null);

  // ── Incubation: a compressed, controlled cycle ────────────
  useEffect(() => {
    if (!state.incubationRunning) return;
    const id = window.setInterval(() => {
      dispatch({ type: "incubation-progress", value: Math.min(100, state.incubationProgress + 2) });
    }, 45);
    return () => window.clearInterval(id);
    // `state.incubationProgress` is intentionally in the deps: each tick
    // re-creates the interval from the value the reducer actually committed,
    // rather than a stale closure.
  }, [state.incubationRunning, state.incubationProgress, dispatch]);

  useEffect(() => {
    if (state.incubationRunning && state.incubationProgress >= 100) {
      dispatch({ type: "finish-incubation" });
    }
  }, [state.incubationRunning, state.incubationProgress, dispatch]);

  // ── The zones appear gradually once the plate is read ─────
  useEffect(() => {
    if (state.stage !== "growth" || Object.keys(state.zones).length === 0) return;
    if (reduceMotion) {
      setZoneReveal(1);
      return;
    }
    setZoneReveal(0);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1600);
      // Ease out so the edges settle rather than snapping into place.
      setZoneReveal(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.stage, state.zones, reduceMotion]);

  // Any stage at or past measurement shows the zones fully.
  useEffect(() => {
    if (STAGE_ORDER.indexOf(state.stage) >= STAGE_ORDER.indexOf("measurement")) setZoneReveal(1);
  }, [state.stage]);

  const technique = useMemo(
    () =>
      scoreTechnique({
        turbidity: state.turbidity ?? "standard",
        agarDepth: state.agarDepth ?? "standard",
        coverage,
        diskCount: state.placements.length,
        spacingViolations: state.spacingViolations,
        measurements: Object.values(state.measurements),
        expectedMeasurements: state.placements.length,
      }),
    [state, coverage],
  );

  const completedRef = useRef(false);
  useEffect(() => {
    if (state.stage === "completed" && !completedRef.current && organism) {
      completedRef.current = true;
      onComplete?.({ techniquePercent: technique.percent, organismName: organism.name });
    }
    if (state.stage !== "completed") completedRef.current = false;
  }, [state.stage, organism, technique.percent, onComplete]);

  // ── Plate interaction ─────────────────────────────────────

  const centreCaliperOn = useCallback(
    (diskId: string) => {
      const p = state.placements.find((d) => d.antibioticId === diskId);
      if (!p) return;
      // Start at 20 mm across — a plausible opening guess, never the answer.
      setCaliper({ a: { x: p.x - 10, y: p.y }, b: { x: p.x + 10, y: p.y } });
    },
    [state.placements],
  );

  const selectForMeasurement = useCallback(
    (diskId: string) => {
      setActiveDiskId(diskId);
      const existing = state.measurements[diskId];
      const p = state.placements.find((d) => d.antibioticId === diskId);
      if (!p) return;
      const half = (existing?.recorded ?? 20) / 2;
      setCaliper({ a: { x: p.x - half, y: p.y }, b: { x: p.x + half, y: p.y } });
    },
    [state.measurements, state.placements],
  );

  const handlePlateDown = useCallback(
    (p: { x: number; y: number }) => {
      if (state.stage === "inoculation") {
        if (!state.plateReady) return;
        strokeRef.current = { cells: new Set(cellsUnderSwab(p.x, p.y, 4)), from: p };
        return;
      }
      if (state.stage === "disk-placement") {
        // A disk already in the forceps always places, even if the tap lands on
        // a neighbour — otherwise trying to put one too close silently dragged
        // the neighbour away instead of explaining the spacing rule. Grabbing an
        // existing disk to move it is what a tap does with an empty hand.
        if (selectedDiskId) return;
        const hit = state.placements.find(
          (d) => Math.hypot(d.x - p.x, d.y - p.y) <= DISK_DIAMETER_MM / 2 + 2,
        );
        if (hit) setDraggingDiskId(hit.antibioticId);
        return;
      }
      if (state.stage === "measurement" && caliper) {
        const da = Math.hypot(caliper.a.x - p.x, caliper.a.y - p.y);
        const db = Math.hypot(caliper.b.x - p.x, caliper.b.y - p.y);
        if (Math.min(da, db) <= CALIPER_GRAB_MM) setDraggingCaliper(da <= db ? "a" : "b");
      }
    },
    [state.stage, state.plateReady, state.placements, caliper, selectedDiskId],
  );

  const handlePlateMove = useCallback(
    (p: { x: number; y: number }) => {
      if (state.stage === "inoculation" && strokeRef.current) {
        const stroke = strokeRef.current;
        cellsUnderSwab(p.x, p.y, 4).forEach((c) => stroke.cells.add(c));
        // Commit continuously so the lawn appears under the finger rather than
        // only when it lifts; the orientation is settled on pointer-up.
        dispatch({
          type: "swab",
          cells: Array.from(stroke.cells),
          orientation: orientationBucket(p.x - stroke.from.x, p.y - stroke.from.y),
        });
        return;
      }
      if (state.stage === "disk-placement" && draggingDiskId) {
        dispatch({ type: "move-disk", antibioticId: draggingDiskId, x: p.x, y: p.y });
        return;
      }
      if (state.stage === "measurement" && draggingCaliper && caliper) {
        setCaliper({ ...caliper, [draggingCaliper]: p } as Caliper);
      }
    },
    [state.stage, draggingDiskId, draggingCaliper, caliper, dispatch],
  );

  const handlePlateUp = useCallback(
    (p: { x: number; y: number }) => {
      if (state.stage === "inoculation" && strokeRef.current) {
        const stroke = strokeRef.current;
        strokeRef.current = null;
        const dx = p.x - stroke.from.x;
        const dy = p.y - stroke.from.y;
        // A tap with no travel has no orientation; ignore it rather than
        // crediting a streak the student never made.
        if (Math.hypot(dx, dy) > 6) {
          dispatch({
            type: "swab",
            cells: Array.from(stroke.cells),
            orientation: orientationBucket(dx, dy),
          });
        }
        return;
      }
      if (state.stage === "disk-placement") {
        if (draggingDiskId) {
          const moved = tryPlaceDisk(draggingDiskId, p.x, p.y);
          if (!moved) dispatch({ type: "auto-arrange" });
          setDraggingDiskId(null);
          return;
        }
        if (selectedDiskId) {
          if (tryPlaceDisk(selectedDiskId, p.x, p.y)) setSelectedDiskId(null);
        }
        return;
      }
      if (state.stage === "measurement") setDraggingCaliper(null);
    },
    [state.stage, draggingDiskId, selectedDiskId, tryPlaceDisk, dispatch],
  );

  // ── Dragging a disk out of the tray ───────────────────────
  useEffect(() => {
    if (!trayDragging) return;
    const move = (e: PointerEvent) => {
      const d = trayDragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
      if (d.moved) setTrayGhost({ id: d.id, x: e.clientX, y: e.clientY });
    };
    const up = (e: PointerEvent) => {
      const d = trayDragRef.current;
      trayDragRef.current = null;
      setTrayDragging(false);
      setTrayGhost(null);
      // A tap never places: the button's onClick picks the disk up instead.
      if (!d || !d.moved) return;
      const rect = plateRef.current?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) return;
      const mm = plateMmFromClient(rect, e.clientX, e.clientY, 1, null);
      if (tryPlaceDisk(d.id, mm.x, mm.y)) setSelectedDiskId(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [trayDragging, tryPlaceDisk]);

  // ── Stage actions handed to the panels ────────────────────
  const actions: StageActions = useMemo(
    () => ({
      selectOrganism: (id) => dispatch({ type: "select-organism", organismId: id }),
      setInterpretationSystem: (id) => dispatch({ type: "set-interpretation", systemId: id }),
      prepareSuspension: () => dispatch({ type: "prepare-suspension" }),
      setTurbidity: (band) => dispatch({ type: "set-turbidity", band }),
      setAgarDepth: (depth) => dispatch({ type: "set-agar-depth", depth }),
      pourPlate: () => dispatch({ type: "pour-plate" }),
      sweep: (angle) =>
        dispatch({
          type: "swab",
          cells: sweepCells(angle),
          orientation: Math.round(angle / 60) % 3,
        }),
      rimPass: () => {
        dispatch({ type: "swab", cells: rimCells(), orientation: 0 });
        dispatch({ type: "rim-pass" });
      },
      resetLawn: () => dispatch({ type: "reset-lawn" }),
      selectDisk: (id) => setSelectedDiskId(id),
      removeDisk: (id) => dispatch({ type: "remove-disk", antibioticId: id }),
      autoArrange: () => dispatch({ type: "auto-arrange" }),
      beginTrayDrag: (id, e) => {
        trayDragRef.current = { id, startX: e.clientX, startY: e.clientY, moved: false };
        setTrayDragging(true);
      },
      setDoorOpen: (open) => setDoorOpen(open),
      loadPlate: () => setPlateLoaded(true),
      setIncubation: (patch) => dispatch({ type: "set-incubation", ...patch }),
      startIncubation: () => dispatch({ type: "start-incubation" }),
    }),
    [dispatch],
  );

  const ctx: StageContext = {
    state,
    coverage,
    selectedDiskId,
    doorOpen,
    plateLoaded,
    actions,
  };

  // ── Navigation ────────────────────────────────────────────
  const stageIndex = STAGE_ORDER.indexOf(state.stage);
  const canAdvance = stageComplete(state, state.stage) && stageIndex < STAGE_ORDER.length - 1;
  const nextStage = STAGE_ORDER[stageIndex + 1];

  const restart = useCallback(() => {
    setSelectedDiskId(null);
    setActiveDiskId(null);
    setDoorOpen(false);
    setPlateLoaded(false);
    setCaliper(null);
    setZoom(1);
    setZoneReveal(0);
    dispatch({ type: "reset", mode: state.mode });
  }, [dispatch, state.mode]);

  const downloadReport = useCallback(async () => {
    if (!organism) return;
    setDownloading(true);
    try {
      await generateReport({
        organism,
        placements: state.placements,
        measurements: state.measurements,
        zones: state.zones,
        interpretationSystemId: state.interpretationSystemId,
        turbidity: state.turbidity ?? "standard",
        agarDepth: state.agarDepth ?? "standard",
        coveragePercent: Math.round(coverage.fraction * 100),
        incubationTempC: state.incubationTempC,
        incubationHours: state.incubationHours,
        techniquePercent: technique.percent,
        seed: state.seed,
      });
    } catch {
      dispatch({
        type: "feedback",
        entry: {
          tone: "error",
          title: "The report could not be generated",
          detail: "The PDF library failed to load. Check the connection and try again.",
        },
      });
    } finally {
      setDownloading(false);
    }
  }, [organism, state, coverage.fraction, technique.percent, dispatch]);

  const summary = useMemo(
    () => [
      { label: "Medium", value: "Mueller-Hinton agar" },
      { label: "Agar depth", value: state.agarDepth ?? "—" },
      { label: "Inoculum", value: state.turbidity ?? "—" },
      { label: "Lawn coverage", value: `${Math.round(coverage.fraction * 100)}%` },
      {
        label: "Incubation",
        value: `${state.incubationHours} h at ${state.incubationTempC} °C, in air`,
      },
      { label: "Antibiotics tested", value: String(state.placements.length) },
      { label: "Technique score", value: `${technique.percent}%` },
      { label: "Experiment seed", value: state.seed },
    ],
    [state, coverage.fraction, technique.percent],
  );

  const caliperMm = caliper ? Math.hypot(caliper.b.x - caliper.a.x, caliper.b.y - caliper.a.y) : null;

  // ── Render ────────────────────────────────────────────────

  const showPlate = !PLATE_HIDDEN.includes(state.stage);
  const lawnDensity =
    state.incubationProgress >= 100 ? 1 : state.incubationProgress > 0 ? state.incubationProgress / 100 : 0.35;

  return (
    <div className="space-y-4">
      {/* Stage rail */}
      <nav aria-label="Experiment stages" className="rounded-2xl border border-slate-200 bg-white p-2.5">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {STAGE_ORDER.filter((s) => s !== "completed").map((s, i) => {
            const unlocked = stageUnlocked(state, s);
            const done = stageComplete(state, s) && STAGE_ORDER.indexOf(s) < stageIndex;
            const current = s === state.stage;
            return (
              <button
                key={s}
                type="button"
                disabled={!unlocked}
                aria-current={current ? "step" : undefined}
                onClick={() => dispatch({ type: "go", stage: s })}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  current
                    ? "bg-brandBlue text-white"
                    : done
                      ? "bg-brandGreen/[0.12] text-brandGreen"
                      : "bg-slate-100 text-slate-500 enabled:hover:bg-slate-200"
                }`}
              >
                <span className="tabular-nums opacity-70">{i + 1}</span>
                {STAGE_LABELS[s].short}
                {done && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {STAGE_LABELS[state.stage].title}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">{STAGE_LABELS[state.stage].instruction}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onReviewGuide}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Lab guide
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-bold text-slate-600 transition-colors hover:border-red-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Restart
          </button>
        </div>
      </div>

      {/* Results and completion take the full width — they are the output, not
          a control panel beside a plate. */}
      {state.stage === "results" && organism && (
        <ResultsDashboard
          organism={organism}
          placements={state.placements}
          measurements={state.measurements}
          zones={state.zones}
          interpretationSystemId={state.interpretationSystemId}
          selectedDiskId={activeDiskId}
          onSelectDisk={setActiveDiskId}
          summary={summary}
          onDownloadReport={downloadReport}
          downloading={downloading}
        />
      )}

      {state.stage === "completed" && organism && (
        <CompletionScreen
          score={technique}
          organismName={organism.name}
          checklist={[
            { label: "Inoculum prepared and standardised", done: stageComplete(state, "inoculum") },
            { label: "Mueller-Hinton plate poured", done: state.plateReady },
            { label: "Agar surface inoculated", done: coverage.fraction >= 0.6 },
            { label: `${MIN_DISKS} or more antibiotic disks applied`, done: state.placements.length >= MIN_DISKS },
            { label: "Incubation completed", done: state.incubationProgress >= 100 },
            { label: "All zones measured", done: stageComplete(state, "measurement") },
          ]}
          measurementsRecorded={Object.keys(state.measurements).length}
          measurementsExpected={state.placements.length}
          accurateMeasurements={
            Object.values(state.measurements).filter((m) => m.throughCentre && m.errorMm <= 2).length
          }
          lessons={dedupeLessons(state.feedback)}
          onReviewResults={() => dispatch({ type: "go", stage: "results" })}
          onReviewGuide={onReviewGuide}
          onRepeat={restart}
        />
      )}

      {/* The bench: plate beside controls */}
      {showPlate && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          {/* Plate. The grid item is left to stretch to the full row height and
              the card inside it is what sticks — `items-start` would collapse
              the item to the card's own height, leaving sticky no travel and
              scrolling the plate away while the controls are still in use. */}
          <div className="lg:order-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 lg:sticky lg:top-24">
            <div
              ref={plateRef}
              className="mx-auto aspect-square w-full max-w-[min(78vw,340px)] lg:max-w-[320px]"
            >
              <PetriDish
                organism={organism}
                agarPoured={state.plateReady}
                coveredCells={state.coveredCells}
                lawnDensity={lawnDensity}
                placements={state.placements}
                zones={state.stage === "growth" || stageIndex >= STAGE_ORDER.indexOf("growth") ? state.zones : {}}
                zoneReveal={zoneReveal}
                measurements={state.measurements}
                activeDiskId={state.stage === "measurement" ? activeDiskId : null}
                showPlacementGuides={state.stage === "disk-placement"}
                showCoverage={state.stage === "inoculation"}
                caliper={state.stage === "measurement" ? caliper : null}
                zoom={state.stage === "measurement" ? zoom : 1}
                interactive={["inoculation", "disk-placement", "measurement"].includes(state.stage)}
                cursor={
                  state.stage === "inoculation"
                    ? "crosshair"
                    : state.stage === "disk-placement" && selectedDiskId
                      ? "copy"
                      : undefined
                }
                onPointerDownMm={handlePlateDown}
                onPointerMoveMm={handlePlateMove}
                onPointerUpMm={handlePlateUp}
                onDiskActivate={state.stage === "measurement" ? selectForMeasurement : undefined}
              />
            </div>

            <p className="mt-3 text-center text-[12px] text-slate-500 leading-relaxed">
              {plateHint(state.stage, Boolean(selectedDiskId), organism)}
            </p>
          </div>
          </div>

          {/* Controls */}
          <div className="lg:order-1">
            {state.stage === "intro" && <IntroStage {...ctx} />}
            {state.stage === "inoculum" && <InoculumStage {...ctx} />}
            {state.stage === "plate-preparation" && <PlatePreparationStage {...ctx} />}
            {state.stage === "inoculation" && <InoculationStage {...ctx} />}
            {state.stage === "disk-placement" && <DiskPlacementStage {...ctx} />}
            {state.stage === "incubation" && <IncubationStage {...ctx} />}
            {state.stage === "growth" && <GrowthPanel state={state} organism={organism} reveal={zoneReveal} />}
            {state.stage === "measurement" && (
              <MeasurementTool
                placements={state.placements}
                measurements={state.measurements}
                selectedDiskId={activeDiskId}
                caliperMm={caliperMm}
                zoom={zoom}
                onSelectDisk={selectForMeasurement}
                onZoomChange={setZoom}
                onCentreCaliper={() => activeDiskId && centreCaliperOn(activeDiskId)}
                onNudge={(delta) =>
                  setCaliper((c) => {
                    if (!c) return c;
                    const len = Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y) || 1;
                    const ux = (c.b.x - c.a.x) / len;
                    const uy = (c.b.y - c.a.y) / len;
                    return {
                      a: { x: c.a.x - (ux * delta) / 2, y: c.a.y - (uy * delta) / 2 },
                      b: { x: c.b.x + (ux * delta) / 2, y: c.b.y + (uy * delta) / 2 },
                    };
                  })
                }
                onClear={(id) => dispatch({ type: "clear-measurement", antibioticId: id })}
                onRecord={() => {
                  const p = state.placements.find((d) => d.antibioticId === activeDiskId);
                  if (!p || !caliper || !activeDiskId) return;
                  dispatch({
                    type: "record-measurement",
                    antibioticId: activeDiskId,
                    a: caliper.a,
                    b: caliper.b,
                    centre: { x: p.x, y: p.y },
                  });
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Feedback log */}
      <FeedbackLog entries={state.feedback} onDismiss={(id) => dispatch({ type: "dismiss-feedback", id })} />

      {/* Action bar */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-2 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:mx-0 sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={() => dispatch({ type: "back" })}
          disabled={stageIndex === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition-colors enabled:hover:border-slate-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <p className="hidden sm:block min-w-0 flex-1 truncate text-center text-[12.5px] font-semibold text-slate-500">
          {canAdvance
            ? `Ready: ${STAGE_LABELS[nextStage].title}`
            : STAGE_LABELS[state.stage].instruction}
        </p>

        <button
          type="button"
          onClick={() => dispatch({ type: "advance" })}
          disabled={!canAdvance}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:bg-slate-200 disabled:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
        >
          {nextStage === "completed" ? "Finish" : "Continue"}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* The disk following the pointer out of the tray */}
      {trayGhost && (
        <div
          className="pointer-events-none fixed z-50 grid h-11 w-11 place-items-center rounded-full border-2 bg-white text-[11px] font-black shadow-lg"
          style={{
            left: trayGhost.x - 22,
            top: trayGhost.y - 22,
            borderColor: ANTIBIOTIC_BY_ID[trayGhost.id]?.color,
            color: ANTIBIOTIC_BY_ID[trayGhost.id]?.color,
          }}
          aria-hidden
        >
          {trayGhost.id}
        </div>
      )}
    </div>
  );
}

// ─── Growth observation panel ───────────────────────────────

function GrowthPanel({
  state,
  organism,
  reveal,
}: {
  state: LabState;
  organism: Organism | null;
  reveal: number;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
          Reading the plate
        </p>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          The lawn has grown in and the zones are appearing. Examine the plate with the lid off, by
          reflected light against a dark background, before you measure anything.
        </p>
        <div className="grid gap-2">
          {[
            ["Bacterial growth", "The confluent lawn — the background against which everything else is read."],
            ["Clear zone", "Where the drug concentration stayed high enough to inhibit this organism."],
            ["Antibiotic disk", `The ${DISK_DIAMETER_MM} mm paper disk at the centre of each zone.`],
            ["Zone edge", "The point where growth stops completely. That is what you measure to."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-3">
              <p className="text-[13px] font-bold text-slate-900">{title}</p>
              <p className="text-[12.5px] text-slate-600 leading-relaxed mt-0.5">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2">
          What the plate shows
        </p>
        <p className="text-sm text-slate-600 leading-relaxed" aria-live="polite">
          {reveal < 0.98 ? "Zones developing…" : growthSummary(state)}
        </p>
        {organism && (
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600 leading-relaxed">
            {organism.clinicalNote}
          </p>
        )}
        <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
          Do not read the diameters off the screen — measure them in the next stage. The lab records
          what you measured, not what the plate knows.
        </p>
      </div>
    </div>
  );
}

// ─── Feedback log ───────────────────────────────────────────

const TONE_STYLE = {
  success: { box: "border-brandGreen/30 bg-brandGreen/[0.06]", text: "text-brandGreen", Icon: CheckCircle2 },
  info: { box: "border-brandBlue/25 bg-brandBlue/[0.05]", text: "text-brandBlue", Icon: Info },
  warn: { box: "border-amber-200 bg-amber-50", text: "text-amber-700", Icon: AlertTriangle },
  error: { box: "border-red-200 bg-red-50", text: "text-red-700", Icon: AlertTriangle },
} as const;

function FeedbackLog({
  entries,
  onDismiss,
}: {
  entries: FeedbackEntry[];
  onDismiss: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  if (entries.length === 0) return null;
  const shown = entries.slice(0, 4);

  return (
    <section aria-label="Laboratory feedback" className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
        Feedback
      </p>
      {/* `aria-live` so a correction is announced without moving focus away
          from whatever the student is doing. */}
      <div aria-live="polite" className="space-y-2">
        <AnimatePresence initial={false}>
          {shown.map((entry) => {
            const tone = TONE_STYLE[entry.tone];
            return (
              <motion.div
                key={entry.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 rounded-2xl border p-3 ${tone.box}`}
              >
                <tone.Icon className={`h-4 w-4 shrink-0 mt-0.5 ${tone.text}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-extrabold ${tone.text}`}>{entry.title}</p>
                  <p className="text-[12.5px] text-slate-700 leading-relaxed mt-0.5">{entry.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(entry.id)}
                  aria-label={`Dismiss: ${entry.title}`}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * What the incubated plate shows. Only mentions disks without a zone when there
 * actually are some — "the rest" when there is no rest read as a contradiction.
 */
function growthSummary(state: LabState): string {
  const total = state.placements.length;
  const withZone = Object.values(state.zones).filter((z) => z > DISK_DIAMETER_MM).length;
  const without = total - withZone;
  if (without === 0) {
    return `All ${total} disks produced a measurable zone. Measure each one across its widest part in the next stage.`;
  }
  if (withZone === 0) {
    return `None of the ${total} disks produced a zone — growth reaches the disk edge on every one. That is a real and reportable result, recorded as ${DISK_DIAMETER_MM} mm.`;
  }
  return `${withZone} of ${total} disks produced a measurable zone. The other ${without === 1 ? "one shows" : `${without} show`} growth right up to the disk edge — a real and reportable result, recorded as ${DISK_DIAMETER_MM} mm.`;
}

function plateHint(stage: LabStage, hasSelectedDisk: boolean, organism: Organism | null): string {
  switch (stage) {
    case "intro":
      return organism
        ? `An empty dish, ready for agar. Testing ${organism.short}.`
        : "An empty dish. Choose an isolate to begin.";
    case "inoculum":
      return "The plate waits while the suspension is standardised.";
    case "plate-preparation":
      return "Choose a depth and pour — the agar fills the dish.";
    case "inoculation":
      return "Drag across the agar to swab it. The dotted cells are what the swab has not reached yet.";
    case "disk-placement":
      return hasSelectedDisk
        ? "Tap inside the dashed guide to place the disk, or drag a placed disk to move it."
        : "Pick a disk from the panel, then tap the plate. The dashed circle is the 15 mm edge margin.";
    case "incubation":
      return "The plate is in the incubator. Nothing to do on the agar itself.";
    case "growth":
      return "Zones appear where the drug held growth back.";
    case "measurement":
      return "Drag either calliper end to the edge of the clear zone, through the centre of the disk.";
    default:
      return "";
  }
}

/** Keep one copy of each teaching point for the completion screen. */
function dedupeLessons(feedback: FeedbackEntry[]): FeedbackEntry[] {
  const seen = new Set<string>();
  return feedback
    .filter((f) => f.tone === "warn" || f.tone === "error")
    .filter((f) => {
      if (seen.has(f.title)) return false;
      seen.add(f.title);
      return true;
    })
    .slice(0, 5);
}

/** Exported so the shell can show the same plate radius in its copy. */
export { PLATE_RADIUS_MM };
