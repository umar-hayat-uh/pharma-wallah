"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Calculator,
  Check,
  CheckCheck,
  ChevronRight,
  CircleDot,
  Crop,
  Hand,
  History,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  Scan,
  ScanSearch,
  Trash2,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalcSection } from "../CalculatorShell";
import { LabNotice } from "../LabFields";
import {
  TLCImageError,
  canvasFromPixels,
  canvasToBlob,
  cropCanvas,
  downloadCanvas,
  drawAnnotatedPlate,
  loadImageBlob,
  loadImageFile,
  readPixels,
  rotateCanvas,
  thumbnailDataUrl,
  warpPerspective,
} from "./canvas";
import { detectSpotsOnCanvas } from "./detection";
import { isConvexClockwise, quadArea } from "./geometry";
import { PLATE_MAX_DIMENSION, detectPlate } from "./plate";
import { analyzePlate, formatRf, parseCalibrationCm } from "./rf";
import { buildTlcReport } from "./report";
import { createSamplePlate } from "./sample";
import { laneOrder } from "./spots";
import {
  DEFAULT_PREFERENCES,
  clearLocalData,
  deleteAnalysis,
  listAnalyses,
  newId,
  readPreferences,
  saveAnalysis,
  storageAvailable,
  writePreferences,
} from "./storage";
import { TLCStage, type StageTool } from "./TLCStage";
import { TLCResults } from "./TLCResults";
import { TLCUploader } from "./TLCUploader";
import type { Point, Quad, Rect, SavedAnalysis, SpotPolarity, TLCPreferences, TLCSpot } from "./types";

/**
 * The offline TLC Rf Analyzer.
 *
 *   upload → prepare (rotate / crop / perspective, all optional)
 *          → measure (baseline, solvent front, spots — detected or placed)
 *          → Calculate Rf → results
 *
 * Everything happens in this page: the photo is decoded to a canvas, analysed
 * with plain TypeScript (in a Web Worker where possible) and never sent
 * anywhere. The working canvas — after any rotation, crop or perspective
 * correction — is the one coordinate system every stored value uses.
 */

type Phase = "prepare" | "measure";
type Notice = { tone: "info" | "warning" | "danger"; text: string } | null;

const HISTORY_LIMIT = 4;
/** Detections this far (as a fraction of the run) outside the baseline–front band are ignored. */
const BAND_MARGIN = 0.04;

const HINTS: Record<StageTool, string> = {
  rotate: "Turn the plate so the baseline is level and the origin is at the bottom.",
  crop: "Drag across the plate, or drag the corners of the box, then apply the crop.",
  perspective: "Drag the four handles onto the corners of the plate, then correct the perspective.",
  baseline: "Tap where the samples were spotted. Drag the line or its round handle to adjust it.",
  front: "Tap the highest point the solvent reached. Drag the line to adjust it.",
  spot: "Tap the centre of each spot to add it. Drag a spot to move it.",
  pan: "Drag to move the plate; pinch or scroll to zoom. Lines and spots can still be dragged.",
};

const DEFAULT_NAME = /^Spot \d+$/;

/** Default names follow the marker number; names the student typed are kept. */
function renumber(spots: TLCSpot[]): TLCSpot[] {
  return spots.map((s, i) => (DEFAULT_NAME.test(s.name) ? { ...s, name: `Spot ${i + 1}` } : s));
}

function insetRect(w: number, h: number, f: number): Rect {
  return { x: w * f, y: h * f, width: w * (1 - 2 * f), height: h * (1 - 2 * f) };
}

function insetQuad(w: number, h: number, f: number): Quad {
  return [
    { x: w * f, y: h * f },
    { x: w * (1 - f), y: h * f },
    { x: w * (1 - f), y: h * (1 - f) },
    { x: w * f, y: h * (1 - f) },
  ];
}

/** Lets a "working…" state paint before a long synchronous canvas operation. */
const nextFrame = () => new Promise((resolve) => window.setTimeout(resolve, 30));

function errorText(error: unknown, fallback: string): string {
  return error instanceof TLCImageError ? error.message : fallback;
}

export function TLCAnalyzer() {
  // ── Image ───────────────────────────────────────────────────────────────
  const [original, setOriginal] = useState<HTMLCanvasElement | null>(null);
  const [working, setWorking] = useState<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<HTMLCanvasElement[]>([]);
  const [imageLabel, setImageLabel] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  // ── Tools ───────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("prepare");
  const [tool, setTool] = useState<StageTool>("pan");
  const [rotation, setRotation] = useState(0);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [quad, setQuad] = useState<Quad | null>(null);

  // ── Measurements ────────────────────────────────────────────────────────
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [solventFrontY, setSolventFrontY] = useState<number | null>(null);
  const [spots, setSpots] = useState<TLCSpot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);
  const [calibration, setCalibration] = useState("");
  const [sample, setSample] = useState("");

  // ── Preferences and local storage ──────────────────────────────────────
  const [prefs, setPrefs] = useState<TLCPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState<SavedAnalysis[]>([]);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [figure, setFigure] = useState<{ dataUrl: string; width: number; height: number } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => setPrefs(readPreferences()), []);
  const updatePrefs = (patch: Partial<TLCPreferences>) =>
    setPrefs((p) => {
      const next = { ...p, ...patch };
      writePreferences(next);
      return next;
    });

  const refreshSaved = useCallback(async () => {
    if (!storageAvailable()) return;
    try {
      setSaved(await listAnalyses());
      setSavedError(null);
    } catch {
      setSavedError("Saved analyses could not be read on this device.");
    }
  }, []);
  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const calib = parseCalibrationCm(calibration);
  const analysis = useMemo(
    () => analyzePlate({ baselineY, solventFrontY, spots, calibrationCm: calib.value }),
    [baselineY, solventFrontY, spots, calib.value],
  );
  const pendingSpots = spots.filter((s) => !s.accepted).length;
  const selectedIndex = spots.findIndex((s) => s.id === selectedId);
  const selected = selectedIndex >= 0 ? spots[selectedIndex] : null;
  const selectedRow = analysis.rows.find((r) => r.index === selectedIndex);
  const hasMeasurements = baselineY !== null || solventFrontY !== null || spots.length > 0;

  // The record's figure is redrawn shortly after the marks stop moving, not on every drag frame.
  useEffect(() => {
    if (!working || !calculated || analysis.errors.length || analysis.rows.length === 0) {
      setFigure(null);
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        const annotated = drawAnnotatedPlate(working, {
          baselineY,
          solventFrontY,
          spots,
          analysis,
          decimals: prefs.decimals,
          maxDimension: 900,
        });
        setFigure({ dataUrl: annotated.toDataURL("image/jpeg", 0.82), width: annotated.width, height: annotated.height });
      } catch {
        setFigure(null);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [working, calculated, analysis, baselineY, solventFrontY, spots, prefs.decimals]);

  const report = useMemo(
    () =>
      working && calculated
        ? buildTlcReport({
            analysis,
            baselineY,
            solventFrontY,
            calibrationCm: calib.value,
            decimals: prefs.decimals,
            sample,
            imageSize: { width: working.width, height: working.height },
            figure,
          })
        : null,
    [working, calculated, analysis, baselineY, solventFrontY, calib.value, prefs.decimals, sample, figure],
  );

  // ── Image lifecycle ─────────────────────────────────────────────────────
  const clearMeasurements = () => {
    setBaselineY(null);
    setSolventFrontY(null);
    setSpots([]);
    setSelectedId(null);
    setCalculated(false);
  };

  const startWith = (canvas: HTMLCanvasElement, label: string) => {
    setOriginal(canvas);
    setWorking(canvas);
    setHistory([]);
    setImageLabel(label);
    setRotation(0);
    setCropRect(null);
    setQuad(null);
    clearMeasurements();
    setCalibration("");
    setSample("");
    setPhase("prepare");
    setTool("pan");
    setNotice(null);
    setSaveStatus("");
    window.requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openFile = async (file: File) => {
    setBusy("Opening image…");
    setNotice(null);
    try {
      const loaded = await loadImageFile(file);
      const resized = loaded.scale < 1 ? ` · resized from ${loaded.originalWidth}×${loaded.originalHeight}` : "";
      startWith(loaded.canvas, `${file.name}${resized}`);
    } catch (error) {
      setNotice({ tone: "danger", text: errorText(error, "This image could not be opened. Try a JPG or PNG.") });
    } finally {
      setBusy(null);
    }
  };

  const openSample = async () => {
    setBusy("Drawing the sample plate…");
    await nextFrame();
    try {
      startWith(canvasFromPixels(createSamplePlate().buffer), "Sample plate (drawn on this device)");
      setSample("Sample plate");
      setNotice({
        tone: "info",
        text: "A practice plate: two reference lanes and a mixture. Try “Find plate”, correct the perspective, then measure.",
      });
    } catch (error) {
      setNotice({ tone: "danger", text: errorText(error, "The sample plate could not be drawn on this device.") });
    } finally {
      setBusy(null);
    }
  };

  const openSaved = async (item: SavedAnalysis) => {
    setBusy("Opening saved analysis…");
    try {
      const loaded = await loadImageBlob(item.image);
      startWith(loaded.canvas, `${item.name} · saved ${new Date(item.createdAt).toLocaleDateString()}`);
      // The image was saved at working size; rescale defensively in case a device decoded it smaller.
      const k = loaded.canvas.width / item.width;
      setBaselineY(item.baselineY === null ? null : item.baselineY * k);
      setSolventFrontY(item.solventFrontY === null ? null : item.solventFrontY * k);
      setSpots(item.spots.map((s) => ({ ...s, x: s.x * k, y: s.y * k, radius: s.radius && s.radius * k })));
      setCalibration(item.calibrationCm);
      updatePrefs({ decimals: item.decimals });
      setSample(item.name);
      setPhase("measure");
      setTool("pan");
      setCalculated(true);
    } catch (error) {
      setNotice({ tone: "danger", text: errorText(error, "This saved analysis could not be opened.") });
    } finally {
      setBusy(null);
    }
  };

  const closeImage = () => {
    setOriginal(null);
    setWorking(null);
    setHistory([]);
    clearMeasurements();
    setNotice(null);
    refreshSaved();
  };

  /** Replaces the working image. Marks made on the old image no longer line up, so they are cleared. */
  const commit = (next: HTMLCanvasElement, message: string) => {
    if (!working) return;
    setHistory((h) => [...h, working].slice(-HISTORY_LIMIT));
    setWorking(next);
    setCropRect(null);
    setQuad(null);
    setRotation(0);
    setTool("pan");
    const hadMarks = hasMeasurements;
    clearMeasurements();
    setNotice({ tone: "info", text: hadMarks ? `${message} The lines and spots were cleared — mark them on the new image.` : message });
  };

  const runImageOp = async (label: string, op: () => HTMLCanvasElement, message: string) => {
    setBusy(label);
    await nextFrame();
    try {
      commit(op(), message);
    } catch (error) {
      setNotice({ tone: "danger", text: errorText(error, "That change could not be applied on this device. Continue with the image as it is.") });
    } finally {
      setBusy(null);
    }
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setWorking(previous);
    setCropRect(null);
    setQuad(null);
    setRotation(0);
    clearMeasurements();
    setNotice({ tone: "info", text: "Undone." });
  };

  const resetImage = () => {
    if (!original || working === original) return;
    commit(original, "Back to the original image.");
  };

  const chooseTool = (next: StageTool) => {
    if (!working) return;
    if (next === "crop" && !cropRect) setCropRect(insetRect(working.width, working.height, 0.06));
    if (next === "perspective" && !quad) setQuad(insetQuad(working.width, working.height, 0.1));
    if (next !== "rotate") setRotation(0);
    setTool(next);
  };

  const findPlate = async () => {
    if (!working) return;
    setBusy("Looking for the plate…");
    await nextFrame();
    try {
      const w = working.width;
      const h = working.height;
      const k = Math.min(1, PLATE_MAX_DIMENSION / Math.max(w, h));
      const { buffer, scale } = readPixels(working, Math.max(1, Math.round(w * k) * Math.round(h * k)));
      const found = detectPlate(buffer);
      if (!found) {
        chooseTool("perspective");
        setNotice({
          tone: "warning",
          text: "The plate could not be found automatically. Drag the four corner handles onto the plate, or use Crop.",
        });
        return;
      }
      setQuad(found.quad.map((p) => ({ x: p.x / scale, y: p.y / scale })) as Quad);
      setTool("perspective");
      setRotation(0);
      setNotice({ tone: "info", text: "Plate found. Check the four corners, then press Correct perspective." });
    } catch {
      chooseTool("perspective");
      setNotice({ tone: "warning", text: "Automatic plate finding is not available on this device. Place the corners by hand." });
    } finally {
      setBusy(null);
    }
  };

  const correctPerspective = () => {
    if (!working || !quad) return;
    if (!isConvexClockwise(quad) || quadArea(quad) < 64) {
      setNotice({
        tone: "danger",
        text: "The corners must go round the plate in order — top-left, top-right, bottom-right, bottom-left.",
      });
      return;
    }
    runImageOp("Correcting perspective…", () => warpPerspective(working, quad), "Perspective corrected.");
  };

  // ── Measuring ───────────────────────────────────────────────────────────
  const goMeasure = () => {
    setRotation(0);
    setPhase("measure");
    setTool(baselineY === null ? "baseline" : solventFrontY === null ? "front" : "spot");
    setNotice(null);
  };

  // Placing a line for the first time moves on to the next thing to mark, so a
  // student can go baseline → front → spots with three taps. The drag that
  // placed the line keeps its target, so the switch never interrupts it.
  const placeBaseline = (y: number) => {
    if (baselineY === null && solventFrontY === null) setTool("front");
    setBaselineY(y);
  };
  const placeFront = (y: number) => {
    if (solventFrontY === null && spots.length === 0) setTool(baselineY === null ? "baseline" : "spot");
    setSolventFrontY(y);
  };

  const goPrepare = () => {
    setPhase("prepare");
    setTool("pan");
  };

  const addSpot = (p: Point) => {
    const spot: TLCSpot = { id: newId(), name: `Spot ${spots.length + 1}`, x: p.x, y: p.y, accepted: true, source: "manual" };
    setSpots((s) => [...s, spot]);
    setSelectedId(spot.id);
  };

  const moveSpot = (id: string, p: Point) =>
    setSpots((all) => all.map((s) => (s.id === id ? { ...s, x: p.x, y: p.y, accepted: true } : s)));

  const updateSpot = (id: string, patch: Partial<TLCSpot>) =>
    setSpots((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeSpot = (id: string) => {
    setSpots((all) => renumber(all.filter((s) => s.id !== id)));
    if (selectedId === id) setSelectedId(null);
  };

  const detect = async () => {
    if (!working) return;
    setBusy("Detecting spots…");
    setNotice(null);
    try {
      const found = await detectSpotsOnCanvas(working, {
        sensitivity: prefs.sensitivity,
        polarity: prefs.polarity,
      });

      // Pencil labels under the baseline and marks above the front are not spots.
      let ignored = 0;
      let candidates = found;
      if (baselineY !== null && solventFrontY !== null && baselineY > solventFrontY) {
        const margin = (baselineY - solventFrontY) * BAND_MARGIN;
        candidates = found.filter((s) => s.y <= baselineY + margin && s.y >= solventFrontY - margin);
        ignored = found.length - candidates.length;
      }

      const manual = spots.filter((s) => s.source === "manual");
      // A detection on top of a spot the student already placed is the same spot.
      const fresh = candidates.filter((d) => !manual.some((m) => Math.hypot(m.x - d.x, m.y - d.y) < Math.max(12, d.radius)));
      const autos: TLCSpot[] = fresh.map((d) => ({
        id: newId(),
        name: "Spot 0",
        x: d.x,
        y: d.y,
        radius: d.radius,
        confidence: d.confidence,
        accepted: false,
        source: "auto",
      }));
      const all = [...manual, ...autos];
      const order = laneOrder(all, working.width * 0.04);
      setSpots(renumber(order.map((i) => all[i])));
      setSelectedId(null);
      setTool("pan");

      if (autos.length === 0) {
        setNotice({
          tone: "warning",
          text: "Automatic spot detection could not identify clear spots. Please add them manually, or raise the sensitivity and try again.",
        });
      } else {
        setNotice({
          tone: "info",
          text: `${autos.length} possible spot${autos.length === 1 ? "" : "s"} found (dashed). Check each one, drag it onto the centre if needed, then confirm.${
            ignored ? ` ${ignored} mark${ignored === 1 ? "" : "s"} outside the baseline–front band ${ignored === 1 ? "was" : "were"} ignored.` : ""
          }${baselineY === null || solventFrontY === null ? " Set the baseline and front first to ignore marks outside the run." : ""}`,
        });
      }
    } catch {
      setNotice({ tone: "danger", text: "Automatic spot detection failed on this device. Please add the spots manually." });
    } finally {
      setBusy(null);
    }
  };

  const calculate = () => {
    setCalculated(true);
    window.requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const resetMeasurements = () => {
    clearMeasurements();
    setCalibration("");
    setTool("baseline");
    setPhase("measure");
    setNotice({ tone: "info", text: "Measurements cleared. Start again with the baseline." });
  };

  const downloadPlate = async () => {
    if (!working) return;
    try {
      const annotated = drawAnnotatedPlate(working, { baselineY, solventFrontY, spots, analysis, decimals: prefs.decimals });
      await downloadCanvas(annotated, (sample.trim() || "tlc-plate").replace(/[^\w-]+/g, "-").toLowerCase());
    } catch {
      setSaveStatus("The annotated plate could not be drawn on this device.");
    }
  };

  const save = async () => {
    if (!working) return;
    if (!storageAvailable()) {
      setSaveStatus("This browser does not allow saving on the device.");
      return;
    }
    setSaveStatus("Saving…");
    try {
      const name = sample.trim() || `TLC plate ${new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
      await saveAnalysis({
        id: newId(),
        name,
        createdAt: Date.now(),
        width: working.width,
        height: working.height,
        baselineY,
        solventFrontY,
        spots,
        calibrationCm: calibration,
        decimals: prefs.decimals,
        image: await canvasToBlob(working),
        thumbnail: thumbnailDataUrl(working),
      });
      setSaveStatus(`Saved as “${name}”. It is stored only in this browser and can be reopened from the start screen.`);
      refreshSaved();
    } catch {
      setSaveStatus("Could not save — the device may be out of storage space.");
    }
  };

  const clearAll = async () => {
    try {
      await clearLocalData();
      setSaved([]);
      setPrefs(DEFAULT_PREFERENCES);
      setNotice({ tone: "info", text: "Saved analyses and preferences were removed from this device." });
    } catch {
      setNotice({ tone: "danger", text: "Local data could not be cleared. Close other tabs of this page and try again." });
    }
  };

  const noticeBox = notice && (
    <LabNotice tone={notice.tone} className="animate-calc-result motion-reduce:animate-none">
      {notice.text}
    </LabNotice>
  );

  // ── Upload screen ───────────────────────────────────────────────────────
  if (!working) {
    return (
      <div className="space-y-4">
        {noticeBox}
        {busy && <BusyLine text={busy} />}
        <TLCUploader
          onFile={openFile}
          onSample={openSample}
          saved={saved}
          savedError={savedError}
          onOpenSaved={openSaved}
          onDeleteSaved={async (id) => {
            try {
              await deleteAnalysis(id);
            } finally {
              refreshSaved();
            }
          }}
          onClearLocal={clearAll}
          busy={busy !== null}
        />
      </div>
    );
  }

  // ── Editor ──────────────────────────────────────────────────────────────
  const measuring = phase === "measure";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div ref={stageRef} className="scroll-mt-24 space-y-3">
        {/* Step switch + image actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Analyzer step" className="inline-flex rounded-xl bg-muted p-1">
            {(
              [
                ["prepare", "1 · Prepare plate"],
                ["measure", "2 · Measure"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={phase === value}
                onClick={value === "measure" ? goMeasure : goPrepare}
                className={cn(
                  "h-10 rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  phase === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={closeImage} className="text-muted-foreground">
            <ImagePlus />
            Change image
          </Button>
        </div>

        <p className="truncate font-mono text-[11px] text-muted-foreground" title={imageLabel}>
          {imageLabel}
        </p>

        {/* Toolbar */}
        {measuring ? (
          <div className="grid grid-cols-4 gap-1.5">
            <ToolButton icon={ArrowDownToLine} label="Baseline" active={tool === "baseline"} done={baselineY !== null} onClick={() => setTool("baseline")} />
            <ToolButton icon={ArrowUpToLine} label="Solvent front" active={tool === "front"} done={solventFrontY !== null} onClick={() => setTool("front")} />
            <ToolButton icon={CircleDot} label="Add spot" active={tool === "spot"} onClick={() => setTool("spot")} />
            <ToolButton icon={Hand} label="Move" active={tool === "pan"} onClick={() => setTool("pan")} />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            <ToolButton icon={RotateCw} label="Rotate" active={tool === "rotate"} onClick={() => chooseTool("rotate")} />
            <ToolButton icon={Crop} label="Crop" active={tool === "crop"} onClick={() => chooseTool("crop")} />
            <ToolButton icon={Scan} label="Perspective" active={tool === "perspective"} onClick={() => chooseTool("perspective")} />
            <ToolButton icon={Hand} label="Move" active={tool === "pan"} onClick={() => chooseTool("pan")} />
          </div>
        )}
        <p className="min-h-[2.5rem] text-[13px] leading-snug text-muted-foreground" aria-live="polite">
          {HINTS[tool]}
        </p>

        <div className="relative">
          <TLCStage
            canvas={working}
            tool={tool}
            rotationPreview={tool === "rotate" ? rotation : 0}
            baselineY={baselineY}
            solventFrontY={solventFrontY}
            spots={spots}
            selectedId={selectedId}
            cropRect={cropRect}
            quad={quad}
            analysis={analysis}
            decimals={prefs.decimals}
            measuring={measuring}
            onBaseline={placeBaseline}
            onFront={placeFront}
            onSpotMove={moveSpot}
            onSpotAdd={addSpot}
            onSelect={setSelectedId}
            onCropChange={setCropRect}
            onQuadChange={setQuad}
            className="h-[62svh] min-h-[360px] max-h-[720px] w-full"
          />
          {busy && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/60">
              <BusyLine text={busy} />
            </div>
          )}
        </div>

        {noticeBox}

        {/* Tool-specific controls, directly under the plate where the thumb already is. */}
        {!measuring && (
          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4">
            {tool === "rotate" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" disabled={!!busy} onClick={() => runImageOp("Rotating…", () => rotateCanvas(working, -90), "Rotated 90° left.")}>
                    <RotateCcw />
                    90° left
                  </Button>
                  <Button variant="outline" disabled={!!busy} onClick={() => runImageOp("Rotating…", () => rotateCanvas(working, 90), "Rotated 90° right.")}>
                    <RotateCw />
                    90° right
                  </Button>
                </div>
                <label className="block">
                  <span className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Straighten</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{rotation.toFixed(1)}°</span>
                  </span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={0.5}
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="mt-2 h-8 w-full accent-blue-600"
                  />
                </label>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={rotation === 0 || !!busy}
                  onClick={() => runImageOp("Rotating…", () => rotateCanvas(working, rotation), `Rotated ${rotation.toFixed(1)}°. Crop off the empty corners next.`)}
                >
                  <Check />
                  Apply {rotation.toFixed(1)}°
                </Button>
              </div>
            )}
            {tool === "crop" && cropRect && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setCropRect(insetRect(working.width, working.height, 0.06))}>
                  Reset box
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!!busy}
                  onClick={() => runImageOp("Cropping…", () => cropCanvas(working, cropRect), "Cropped.")}
                >
                  <Crop />
                  Apply crop
                </Button>
              </div>
            )}
            {tool === "perspective" && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={!!busy} onClick={findPlate}>
                  <ScanSearch />
                  Find plate
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled={!quad || !!busy} onClick={correctPerspective}>
                  <Scan />
                  Correct perspective
                </Button>
              </div>
            )}
            {tool === "pan" && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={!!busy} onClick={findPlate}>
                  <ScanSearch />
                  Find plate
                </Button>
                <Button variant="outline" onClick={() => chooseTool("crop")}>
                  <Crop />
                  Crop by hand
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
              <Button variant="ghost" size="sm" disabled={history.length === 0 || !!busy} onClick={undo}>
                <Undo2 />
                Undo
              </Button>
              <Button variant="ghost" size="sm" disabled={working === original || !!busy} onClick={resetImage}>
                <History />
                Original image
              </Button>
              <Button size="sm" className="ml-auto h-11 bg-blue-600 px-4 hover:bg-blue-700" onClick={goMeasure}>
                {working === original ? "Plate is fine — measure" : "Continue to measure"}
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}

        {measuring && selected && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-700 text-sm font-bold text-white">
              {selectedIndex + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-semibold text-foreground">{selected.name}</span>
              <span className="block text-xs text-muted-foreground">
                {selected.accepted
                  ? selectedRow && selectedRow.result.rf !== null
                    ? `Rf ${formatRf(selectedRow.result.rf, prefs.decimals)}`
                    : "Set both lines to see its Rf"
                  : `Detected${selected.confidence !== undefined ? ` · ${Math.round(selected.confidence * 100)}% confidence` : ""} · not confirmed`}
              </span>
            </span>
            {!selected.accepted && (
              <Button size="sm" className="h-10 bg-blue-600 hover:bg-blue-700" onClick={() => updateSpot(selected.id, { accepted: true })}>
                <Check />
                Confirm
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-10" onClick={() => removeSpot(selected.id)}>
              <Trash2 />
              Delete
            </Button>
          </div>
        )}
      </div>

      {measuring && (
        <>
          <CalcSection title="Spot detection" description="Finds spots with local image processing. Every result is a suggestion for you to check.">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Sensitivity</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{prefs.sensitivity}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={prefs.sensitivity}
                  onChange={(e) => updatePrefs({ sensitivity: Number(e.target.value) })}
                  className="mt-2 h-8 w-full accent-blue-600"
                />
                <span className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Strong spots only</span>
                  <span>Faint spots too</span>
                </span>
              </label>
              <div>
                <span className="text-sm font-medium text-foreground">Spots look</span>
                <div role="radiogroup" aria-label="Spot appearance" className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                  {(
                    [
                      ["dark", "Dark / coloured"],
                      ["light", "Bright (UV)"],
                      ["any", "Either"],
                    ] as [SpotPolarity, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={prefs.polarity === value}
                      onClick={() => updatePrefs({ polarity: value })}
                      className={cn(
                        "min-h-[40px] rounded-lg px-1.5 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                        prefs.polarity === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={!!busy} onClick={detect}>
                {busy === "Detecting spots…" ? <LoaderCircle className="animate-spin" /> : <ScanSearch />}
                {spots.some((s) => s.source === "auto") ? "Re-detect" : "Detect spots"}
              </Button>
              <Button variant="outline" disabled={!!busy} onClick={() => setTool("spot")}>
                <CircleDot />
                Add spot
              </Button>
            </div>
          </CalcSection>

          <CalcSection
            title={`Spots · ${spots.length}`}
            description="Only confirmed spots are used in the results. Rename a spot to match its lane or compound."
          >
            {spots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No spots yet. Detect them, or choose Add spot and tap each one.</p>
            ) : (
              <>
                {pendingSpots > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSpots((all) => all.map((s) => ({ ...s, accepted: true })))}
                  >
                    <CheckCheck />
                    Confirm all {pendingSpots} detected
                  </Button>
                )}
                <ul className="divide-y divide-border/70">
                  {spots.map((spot, index) => {
                    const row = analysis.rows.find((r) => r.index === index);
                    return (
                      <li
                        key={spot.id}
                        className={cn(
                          "flex items-center gap-2 py-2.5",
                          spot.id === selectedId && "-mx-2 rounded-xl bg-amber-50/70 px-2",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(spot.id)}
                          aria-label={`Select ${spot.name} on the plate`}
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                            spot.accepted ? "bg-amber-700 text-white" : "border-2 border-dashed border-slate-400 text-slate-600",
                          )}
                        >
                          {index + 1}
                        </button>
                        <div className="min-w-0 flex-1">
                          <Input
                            value={spot.name}
                            maxLength={40}
                            aria-label={`Name of spot ${index + 1}`}
                            onChange={(e) => updateSpot(spot.id, { name: e.target.value })}
                            onBlur={(e) => !e.target.value.trim() && updateSpot(spot.id, { name: `Spot ${index + 1}` })}
                            className="h-10 text-sm"
                          />
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                            {spot.source === "auto" ? (
                              <Badge variant="secondary" className="text-[10px]">
                                Detected{spot.confidence !== undefined ? ` · ${Math.round(spot.confidence * 100)}%` : ""}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                Placed
                              </Badge>
                            )}
                            {row && row.result.rf !== null && (
                              <span className={cn("font-semibold tabular-nums", row.result.warning ? "text-amber-700" : "text-foreground")}>
                                Rf {formatRf(row.result.rf, prefs.decimals)}
                              </span>
                            )}
                          </span>
                        </div>
                        {spot.accepted ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Unconfirm ${spot.name}`}
                            title="Confirmed — tap to exclude"
                            onClick={() => updateSpot(spot.id, { accepted: false })}
                            className="text-emerald-600"
                          >
                            <Check />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => updateSpot(spot.id, { accepted: true })}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${spot.name}`}
                          onClick={() => removeSpot(spot.id)}
                          className="text-muted-foreground"
                        >
                          <Trash2 />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </CalcSection>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={resetMeasurements}>
              Reset measurements
            </Button>
            <Button onClick={calculate} className="bg-blue-600 hover:bg-blue-700">
              <Calculator />
              Calculate Rf
            </Button>
          </div>

          <div ref={resultsRef} className="scroll-mt-24">
            {calculated && (
              <TLCResults
                analysis={analysis}
                decimals={prefs.decimals}
                onDecimals={(d) => updatePrefs({ decimals: d })}
                calibration={calibration}
                calibrationError={calib.error}
                onCalibration={setCalibration}
                sample={sample}
                onSample={setSample}
                report={report}
                onReset={resetMeasurements}
                onDownloadPlate={downloadPlate}
                onSave={save}
                saveStatus={saveStatus}
                pendingSpots={pendingSpots}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  done,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  done?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center text-[11.5px] font-medium leading-tight transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1",
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
          : "border-border bg-card text-foreground hover:border-foreground/25",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
      {done && (
        <span
          className={cn(
            "absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full",
            active ? "bg-white text-blue-600" : "bg-emerald-500 text-white",
          )}
          aria-label="set"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function BusyLine({ text }: { text: string }) {
  return (
    <p role="status" className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-md">
      <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />
      {text}
    </p>
  );
}
