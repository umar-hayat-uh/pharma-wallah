"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  CircleDashed,
  Copy,
  Download,
  FileText,
  FlaskConical,
  Hand,
  ImagePlus,
  LoaderCircle,
  MousePointerClick,
  Plus,
  Redo2,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Trash2,
  Undo2,
  Upload,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalcSection, FieldGrid } from "../CalculatorShell";
import { NumberField } from "../NumberField";
import { ResultCard, ResultRow } from "../ResultCard";
import { LabNotice, TextField } from "../LabFields";
import { IS_MOBILE_APP } from "../lab-math";
import { TLCImageError, canvasFromPixels, canvasToBlob, loadImageBlob } from "../tlc/canvas";
import { newId } from "../tlc/storage";
import {
  DILUTION_PRESETS,
  VOLUME_PRESETS,
  calculateCfu,
  countWarning,
  formatDilution,
  formatPlain,
  formatScientific,
  parseDilution,
  parseVolume,
} from "./cfu";
import { OpenCvInitError, detectOnCanvas, prepareOpenCv } from "./client";
import { ColonyDetectionError, DEFAULT_SETTINGS } from "./detect";
import { annotatedFileName, downloadBlob, drawAnnotatedPlate, exportDate, resultText, type ExportSummary } from "./export";
import { ColonyStage, type StageMode } from "./ColonyStage";
import { createSamplePlate, type SampleColony } from "./sample";
import { compareCounts, matchDetections } from "./validation";
import type { Circle, Colony, DetectionResult, DetectionSettings, DetectionStep, QualityIssue } from "./types";

/**
 * Colony Counter & CFU Calculator — offline, on the device.
 *
 *   choose image → preview → Analyze → review (add / remove / undo) → CFU
 *
 * OpenCV.js runs in a Web Worker from a file served with the app; the image
 * is never uploaded. Automatic detection is a starting point: the final
 * verified count is the number of markers the student has kept, and that is
 * the only number the CFU calculation uses.
 */

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const HISTORY_LIMIT = 100;
const MANY_DETECTIONS = 500;
/** Size of the square marker for a manually added colony, as a fraction of the plate diameter. */
const MANUAL_BOX = 0.02;

const STEPS: Record<DetectionStep, string> = {
  1: "Preparing image",
  2: "Detecting plate",
  3: "Detecting colonies",
  4: "Preparing results",
};

const QUALITY_TEXT: Record<QualityIssue, string> = {
  "low-resolution": "The image resolution is low.",
  "too-dark": "The image is very dark.",
  "too-bright": "The image is very bright or washed out.",
  "low-contrast": "Colonies and agar have little contrast.",
  noisy: "The image is noisy or grainy.",
  "no-plate": "No suitable Petri plate was detected.",
  "large-region": "Some very large regions were found (glare, a smear or a lawn of growth).",
};

type Phase = "empty" | "preview" | "analyzing" | "review";
type CvState = "idle" | "loading" | "ready" | "error";

/** Dev fixture: a synthetic plate whose colony positions are known. */
type Truth = { colonies: SampleColony[]; label: string };

// Diameter sliders work on a log scale, because colony sizes span two orders of magnitude.
const D_MIN = 0.002;
const D_MAX = 0.25;
const toSlider = (d: number) => Math.round((Math.log(d / D_MIN) / Math.log(D_MAX / D_MIN)) * 100);
const fromSlider = (v: number) => D_MIN * (D_MAX / D_MIN) ** (v / 100);

export function ColonyCounter() {
  const [phase, setPhase] = useState<Phase>("empty");
  const [image, setImage] = useState<HTMLCanvasElement | null>(null);
  const [imageLabel, setImageLabel] = useState("");
  const [cvState, setCvState] = useState<CvState>("idle");
  const [step, setStep] = useState<DetectionStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<DetectionSettings>(DEFAULT_SETTINGS);
  const [analysedWith, setAnalysedWith] = useState<string>("");
  const [advanced, setAdvanced] = useState(false);

  const [plate, setPlate] = useState<Circle | null>(null);
  const [plateManual, setPlateManual] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [colonies, setColonies] = useState<Colony[]>([]);
  const [undoStack, setUndoStack] = useState<Colony[][]>([]);
  const [redoStack, setRedoStack] = useState<Colony[][]>([]);
  const [mode, setMode] = useState<StageMode>("pan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [manualCount, setManualCount] = useState("");
  const [dilutionChoice, setDilutionChoice] = useState<string>("-4");
  const [customDilution, setCustomDilution] = useState("");
  const [volumeChoice, setVolumeChoice] = useState<string>("0.1");
  const [customVolume, setCustomVolume] = useState("");
  const [sample, setSample] = useState("");
  const [status, setStatus] = useState("");

  const [validate, setValidate] = useState(false);
  const [truth, setTruth] = useState<Truth | null>(null);
  const [expected, setExpected] = useState("");

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    try {
      setTouch(window.matchMedia("(pointer: coarse)").matches);
      setValidate(new URLSearchParams(window.location.search).get("validate") === "1");
    } catch {
      // Defaults are fine.
    }
  }, []);

  // ── OpenCV ──────────────────────────────────────────────────────────────
  const warmUp = () => {
    if (cvState === "ready" || cvState === "loading") return;
    setCvState("loading");
    prepareOpenCv().then(
      () => setCvState("ready"),
      () => setCvState("error"),
    );
  };

  // ── Image ───────────────────────────────────────────────────────────────
  const startWith = (canvas: HTMLCanvasElement, label: string, fixture: Truth | null = null) => {
    setImage(canvas);
    setImageLabel(label);
    setTruth(fixture);
    setPhase("preview");
    setError(null);
    setDetection(null);
    setColonies([]);
    setUndoStack([]);
    setRedoStack([]);
    setPlate(null);
    setPlateManual(false);
    setSelectedId(null);
    setMode("pan");
    setConfirmReset(false);
    setStatus("");
    warmUp();
    window.requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openFile = async (file: File) => {
    setError(null);
    const typeOk = ACCEPTED.includes(file.type) || (file.type === "" && /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!typeOk) {
      setError("This image format is not supported. Choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("This image is larger than 10 MB. Take the photo at a lower resolution, or choose a smaller copy.");
      return;
    }
    try {
      const loaded = await loadImageBlob(file);
      const resized = loaded.scale < 1 ? ` · shown at ${loaded.canvas.width}×${loaded.canvas.height} of ${loaded.originalWidth}×${loaded.originalHeight}` : "";
      startWith(loaded.canvas, `${file.name}${resized}`);
    } catch (e) {
      setError(e instanceof TLCImageError ? e.message : "This image could not be opened. Try a JPG or PNG.");
    }
  };

  const openSample = (variant: "light" | "dark" = "light") => {
    try {
      const s = createSamplePlate({ variant, seed: variant === "light" ? 11 : 23 });
      startWith(
        canvasFromPixels(s.buffer),
        `Sample ${variant === "light" ? "nutrient agar" : "blood agar"} plate (drawn on this device)`,
        { colonies: s.colonies, label: `synthetic ${variant} plate, ${s.colonies.length} colonies (${s.touching} touching)` },
      );
      setSample(variant === "light" ? "Sample plate" : "Sample blood agar plate");
    } catch {
      setError("The sample plate could not be drawn on this device.");
    }
  };

  const replaceImage = () => {
    setImage(null);
    setPhase("empty");
    setDetection(null);
    setColonies([]);
    setUndoStack([]);
    setRedoStack([]);
    setTruth(null);
  };

  // ── Analysis ────────────────────────────────────────────────────────────
  const settingsKey = JSON.stringify({ settings, plate: plateManual ? plate : null });
  const dirty = phase === "review" && analysedWith !== settingsKey;

  const analyze = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }
    setPhase("analyzing");
    setError(null);
    setStep(1);
    setMode("pan");
    setSelectedId(null);
    try {
      const result = await detectOnCanvas(image, settings, plateManual ? plate : null, setStep);
      setCvState("ready");
      const found: Colony[] = result.colonies.map((c) => ({ ...c, id: newId() }));
      if (detection || colonies.length) {
        // Re-analysis replaces the markers; Undo brings the previous set back.
        setUndoStack((u) => [...u, colonies].slice(-HISTORY_LIMIT));
        setRedoStack([]);
      }
      setDetection(result);
      setColonies(found);
      setPlate(result.plate);
      setAnalysedWith(JSON.stringify({ settings, plate: plateManual ? result.plate : null }));
      setPhase("review");
    } catch (e) {
      if (e instanceof OpenCvInitError) {
        setCvState("error");
        setError("Offline image analysis could not be initialized. Please restart the tool and try again.");
      } else {
        setError(e instanceof ColonyDetectionError ? e.message : "Image analysis failed on this device. You can still count colonies by hand below.");
      }
      setPhase(detection ? "review" : "preview");
    } finally {
      setStep(null);
    }
  };

  const startManualPlate = () => {
    if (!image) return;
    setPlate((p) => p ?? { x: image.width / 2, y: image.height / 2, r: Math.min(image.width, image.height) * 0.45 });
    setPlateManual(true);
    setMode("plate");
    setSelectedId(null);
  };

  // ── Review: history ─────────────────────────────────────────────────────
  const commit = (next: Colony[]) => {
    setUndoStack((u) => [...u, colonies].slice(-HISTORY_LIMIT));
    setRedoStack([]);
    setColonies(next);
  };
  const undo = () => {
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, colonies]);
    setColonies(prev);
    setSelectedId(null);
  };
  const redo = () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, colonies]);
    setColonies(next);
    setSelectedId(null);
  };

  const addColony = (p: { x: number; y: number }) => {
    const side = Math.max(8, (plate?.r ?? 400) * 2 * MANUAL_BOX);
    const colony: Colony = { id: newId(), x: p.x, y: p.y, box: { x: p.x - side / 2, y: p.y - side / 2, width: side, height: side }, source: "manual" };
    commit([...colonies, colony]);
    setSelectedId(colony.id);
  };
  const removeColony = (id: string) => {
    commit(colonies.filter((c) => c.id !== id));
    setSelectedId(null);
  };

  const resetAnalysis = () => {
    setDetection(null);
    setColonies([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedId(null);
    setMode("pan");
    setConfirmReset(false);
    setPhase("preview");
    setStatus("");
  };

  // Keyboard: Ctrl/Cmd+Z, Shift+Ctrl/Cmd+Z, Delete.
  useEffect(() => {
    if (phase !== "review") return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        removeColony(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ── Counts ──────────────────────────────────────────────────────────────
  const autoDetected = detection?.colonies.length ?? 0;
  const autoKept = colonies.filter((c) => c.source === "auto").length;
  const manualAdded = colonies.length - autoKept;
  const removed = autoDetected - autoKept;
  const finalCount = colonies.length;
  const selectedIndex = colonies.findIndex((c) => c.id === selectedId);
  const selected = selectedIndex >= 0 ? colonies[selectedIndex] : null;
  const manualNumber = selected?.source === "manual" ? colonies.filter((c, i) => c.source === "manual" && i <= selectedIndex).length : 0;

  // ── CFU ─────────────────────────────────────────────────────────────────
  const counted = phase === "review";
  const countParse = (() => {
    if (counted) return { value: finalCount, error: undefined as string | undefined };
    const t = manualCount.trim();
    if (t === "") return { value: null, error: undefined };
    if (!/^\d+$/.test(t)) return { value: null, error: "Enter a whole number of colonies, 0 or more." };
    return { value: Number(t), error: undefined };
  })();
  const dilution =
    dilutionChoice === "custom" ? parseDilution(customDilution) : { value: 10 ** Number(dilutionChoice), error: undefined };
  const volume = volumeChoice === "custom" ? parseVolume(customVolume) : { value: Number(volumeChoice), error: undefined };
  const cfu =
    countParse.value !== null && dilution.value !== null && volume.value !== null
      ? calculateCfu({ colonies: countParse.value, dilution: dilution.value, volumeMl: volume.value })
      : null;
  const warning = countParse.value !== null ? countWarning(countParse.value) : null;

  const summary: ExportSummary = {
    finalCount,
    autoCount: autoDetected,
    manualCount: manualAdded,
    removedCount: removed,
    dilution: dilution.value,
    volumeMl: volume.value,
    cfuPerMl: cfu?.ok ? cfu.cfuPerMl : null,
    sample,
  };

  const flash = (text: string) => {
    setStatus(text);
    window.setTimeout(() => setStatus(""), 3000);
  };

  const downloadAnnotated = async () => {
    if (!image) return;
    try {
      const canvas = drawAnnotatedPlate(image, colonies, plate, summary);
      downloadBlob(await canvasToBlob(canvas, "image/png"), `${annotatedFileName()}.png`);
      flash("Annotated image downloaded.");
    } catch {
      flash("The annotated image could not be drawn on this device.");
    }
  };
  const downloadResult = () => {
    downloadBlob(new Blob([resultText(summary)], { type: "text/plain;charset=utf-8" }), `pharmawallah-colony-result-${exportDate()}.txt`);
    flash("Result downloaded.");
  };
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(resultText(summary));
      flash("Result copied to the clipboard.");
    } catch {
      flash("Copy is not available here.");
    }
  };

  // ── Warnings ────────────────────────────────────────────────────────────
  const quality = detection?.quality.filter((q) => q !== "no-plate") ?? [];
  const highDensity = !!detection && (detection.coverage > 0.25 || detection.splitGroups >= Math.max(8, autoDetected * 0.15));
  const tooMany = autoDetected > MANY_DETECTIONS;

  const metrics = useMemo(() => {
    if (!validate || !detection) return null;
    const auto = detection.colonies;
    const fromTruth = truth ? matchDetections(truth.colonies, auto) : null;
    const exp = Number(expected);
    const fromCount = expected.trim() && Number.isFinite(exp) ? compareCounts(exp, auto.length) : null;
    // From the student's corrections: removed = false positives, added = false negatives.
    const tp = autoKept;
    const fromReview = {
      truePositives: tp,
      falsePositives: removed,
      falseNegatives: manualAdded,
      precision: auto.length ? tp / auto.length : null,
      recall: tp + manualAdded ? tp / (tp + manualAdded) : null,
    };
    return { fromTruth, fromCount, fromReview };
  }, [validate, detection, truth, expected, autoKept, removed, manualAdded]);

  // ── Render ──────────────────────────────────────────────────────────────
  const take = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) openFile(file);
  };

  const inputs = (
    <>
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-hidden onChange={take} />
      {/* Capacitor offers the camera only for exactly image/* with capture. */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={take} />
    </>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <LabNotice tone="warning">
        Automated counting is an estimate. Always visually verify and correct detected colonies before using the result.
      </LabNotice>

      {error && (
        <LabNotice tone="danger" className="animate-calc-result motion-reduce:animate-none">
          {error}
        </LabNotice>
      )}

      {phase === "empty" && (
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) openFile(file);
          }}
          className="rounded-2xl border-2 border-dashed border-border bg-card px-5 py-8 text-center sm:px-8 sm:py-12"
        >
          <PlateGlyph />
          <h2 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground sm:text-2xl">Count colonies from a plate photo</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Automatically detect colonies from an agar plate image, review the count, and calculate CFU/mL.
          </p>
          <div className="mx-auto mt-6 grid max-w-md gap-2.5 sm:grid-cols-2">
            {touch && (
              <Button onClick={() => cameraRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
                <Camera />
                Take Photo
              </Button>
            )}
            <Button
              variant={touch ? "outline" : "default"}
              onClick={() => galleryRef.current?.click()}
              className={cn(!touch && "bg-blue-600 hover:bg-blue-700 sm:col-span-2")}
            >
              {touch ? <ImagePlus /> : <Upload />}
              {touch ? "Choose Image" : "Upload Plate Image"}
            </Button>
            <Button variant="ghost" onClick={() => openSample("light")} className="text-blue-700 sm:col-span-2">
              <FlaskConical />
              Try a sample plate
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Supported: JPG, JPEG, PNG, WEBP · Maximum file size: 10 MB</p>
          {inputs}
        </section>
      )}

      {phase === "empty" && (
        <p className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-900">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <strong className="font-semibold">Works offline.</strong> Your image stays on your device.
          </span>
        </p>
      )}

      {image && phase !== "empty" && (
        <div ref={stageRef} className="scroll-mt-24 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate font-mono text-[11px] text-muted-foreground" title={imageLabel}>
              {phase === "preview" ? "Original plate · " : ""}
              {imageLabel}
            </p>
            <Button variant="ghost" size="sm" onClick={replaceImage} className="text-muted-foreground">
              <ImagePlus />
              Replace Image
            </Button>
          </div>

          {phase === "review" && (
            <div className="flex flex-wrap items-center gap-2">
              <div role="radiogroup" aria-label="Stage mode" className="inline-flex rounded-xl bg-muted p-1">
                <ModeButton icon={Hand} label="Pan / select" active={mode === "pan"} onClick={() => setMode("pan")} />
                <ModeButton icon={Plus} label="Add colony" active={mode === "add"} onClick={() => setMode("add")} />
              </div>
              <div className="ml-auto flex gap-1">
                <Button variant="outline" size="icon" aria-label="Undo" title="Undo" disabled={!undoStack.length} onClick={undo}>
                  <Undo2 />
                </Button>
                <Button variant="outline" size="icon" aria-label="Redo" title="Redo" disabled={!redoStack.length} onClick={redo}>
                  <Redo2 />
                </Button>
              </div>
            </div>
          )}
          {phase === "review" && (
            <p className="text-[13px] leading-snug text-muted-foreground" aria-live="polite">
              {mode === "add"
                ? "Tap the centre of a missed colony to add it. Drag to move around; pinch or scroll to zoom."
                : mode === "plate"
                  ? "Drag the centre and the edge handle so the dashed circle sits just inside the dish wall."
                  : "Tap a marker to select it. Drag to move around; pinch or scroll to zoom."}
            </p>
          )}

          <div className="relative">
            <ColonyStage
              canvas={image}
              colonies={phase === "review" ? colonies : []}
              plate={plate}
              mode={mode}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAdd={addColony}
              onPlateChange={setPlate}
              className="h-[62svh] min-h-[340px] max-h-[720px] w-full"
            />
            {phase === "analyzing" && step && (
              <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70">
                <div role="status" className="w-64 rounded-2xl bg-white p-4 text-center shadow-lg">
                  <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-blue-600" />
                  <p className="mt-2 text-sm font-semibold text-foreground">Analyzing image…</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Step {step}/4</p>
                  <p className="text-sm text-muted-foreground">{STEPS[step]}</p>
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((s) => (
                      <span key={s} className={cn("h-1.5 rounded-full", s <= step ? "bg-blue-600" : "bg-muted")} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {mode === "plate" && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMode("pan");
                  if (!detection) setPlateManual(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setMode("pan");
                  analyze();
                }}
              >
                <Check />
                Use this plate
              </Button>
            </div>
          )}

          {phase === "preview" && mode !== "plate" && (
            <div className="space-y-3">
              <p className="rounded-xl bg-muted/60 px-3.5 py-3 text-sm leading-relaxed text-muted-foreground">
                For better detection, use a clear top-down image with even lighting, minimal glare, and a plain background.
              </p>
              {cvState === "loading" && (
                <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />
                  Preparing offline image analysis…
                </p>
              )}
              {cvState === "error" && !error && (
                <LabNotice tone="danger">
                  Offline image analysis could not be initialized. Please restart the tool and try again. You can still count
                  the plate by hand and enter the count below.
                </LabNotice>
              )}
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={analyze}>
                  <ScanSearch />
                  Analyze Colonies
                </Button>
                <Button variant="outline" onClick={startManualPlate}>
                  <CircleDashed />
                  Select plate manually
                </Button>
              </div>
            </div>
          )}

          {phase === "review" && selected && mode !== "plate" && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  Colony #{selectedIndex + 1}
                  {selected.source === "manual" && <span className="ml-1.5 text-sm font-medium text-emerald-700">· Manual #{manualNumber}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Detection type: {selected.source === "auto" ? "Automatic" : "Manual"}
                  {selected.split ? " · separated from a touching group" : ""}
                </p>
              </div>
              <Button variant="outline" className="h-11" onClick={() => removeColony(selected.id)}>
                <Trash2 />
                Remove Colony
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === "review" && detection && (
        <>
          {!detection.plateFound && !plateManual && (
            <LabNotice tone="warning" title="Automatic plate detection failed.">
              <p>No suitable Petri plate was detected. Try a clearer top-down image or select the plate manually.</p>
              <Button variant="outline" size="sm" className="mt-2 h-10 bg-white" onClick={startManualPlate}>
                <CircleDashed />
                Select Plate Manually
              </Button>
            </LabNotice>
          )}
          {autoDetected === 0 && (
            <LabNotice tone="info" title="No colonies were detected.">
              This does not necessarily mean that no colonies are present. Try adjusting detection settings or review the image
              manually.
            </LabNotice>
          )}
          {tooMany && (
            <LabNotice tone="warning" title="Many objects were detected.">
              Adjust sensitivity or minimum colony size and review the result carefully.
            </LabNotice>
          )}
          {highDensity && !tooMany && (
            <LabNotice tone="warning" title="High colony density">
              Some colonies may overlap and automatic counting may be less reliable. Please verify the count manually.
            </LabNotice>
          )}
          {quality.length > 0 && (
            <LabNotice tone="warning" title="Image quality may affect colony detection.">
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {quality.map((q) => (
                  <li key={q}>{QUALITY_TEXT[q]}</li>
                ))}
              </ul>
              <p className="mt-1.5">Try: better lighting · a top-down photograph · less glare · a clearer image.</p>
            </LabNotice>
          )}

          <CalcSection title="Colony count">
            <div className="rounded-xl bg-muted/50 px-4 py-2 text-sm">
              <CountRow label="Automatically detected" value={autoDetected} />
              <CountRow label="Manually added" value={manualAdded} sign="+" />
              <CountRow label="Removed" value={removed} sign="−" />
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">Final verified count</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">{finalCount}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The final verified count is the number of markers on the plate, and the number used for the CFU calculation.
              Analysed in {(detection.ms / 1000).toFixed(1)} s · {detection.polarity} colonies · {detection.method === "otsu" ? "Otsu" : "adaptive"} threshold
              {detection.splitGroups ? ` · ${detection.splitGroups} touching group${detection.splitGroups === 1 ? "" : "s"} separated` : ""}.
            </p>
            {confirmReset ? (
              <div role="alertdialog" aria-label="Reset colony detection?" className="rounded-xl border border-red-200 bg-red-50 p-3.5">
                <p className="font-semibold text-red-900">Reset colony detection?</p>
                <p className="text-sm text-red-900/90">This will remove all manual corrections.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="bg-white" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={resetAnalysis}>
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setConfirmReset(true)}>
                <RefreshCw />
                Reset Analysis
              </Button>
            )}
          </CalcSection>
        </>
      )}

      {image && (phase === "preview" || phase === "review") && mode !== "plate" && (
        <CalcSection title="Detection settings" description="The Automatic defaults suit most plates. Change them only when the markers are poor.">
          <div>
            <span className="text-sm font-medium text-foreground">Detection Method</span>
            <div role="radiogroup" aria-label="Detection method" className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  ["auto", "Automatic"],
                  ["dark", "Dark Colonies"],
                  ["light", "Light Colonies"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={settings.polarity === value}
                  onClick={() => setSettings((s) => ({ ...s, polarity: value }))}
                  className={cn(
                    "min-h-[44px] rounded-lg px-1.5 text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-sm",
                    settings.polarity === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Detection Sensitivity"
            value={settings.sensitivity}
            display={String(settings.sensitivity)}
            onChange={(v) => setSettings((s) => ({ ...s, sensitivity: v }))}
            low="Low"
            high="High"
            step={5}
          />

          <button
            type="button"
            aria-expanded={advanced}
            onClick={() => setAdvanced((a) => !a)}
            className="flex w-full items-center justify-between rounded-xl border border-border px-3.5 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50"
          >
            Advanced Detection Settings
            <ChevronDown className={cn("h-4 w-4 transition-transform", advanced && "rotate-180")} />
          </button>
          {advanced && (
            <div className="space-y-4 rounded-xl border border-border/80 p-3.5">
              <div>
                <span className="text-sm font-medium text-foreground">Threshold method</span>
                <div role="radiogroup" aria-label="Threshold method" className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                  {(
                    [
                      ["auto", "Automatic"],
                      ["otsu", "Otsu"],
                      ["adaptive", "Adaptive"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={settings.method === value}
                      onClick={() => setSettings((s) => ({ ...s, method: value }))}
                      className={cn(
                        "min-h-[40px] rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                        settings.method === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Adaptive copes better with uneven lighting across the plate.</p>
              </div>
              <Slider
                label="Minimum colony size"
                value={toSlider(settings.minDiameter)}
                display={sizeLabel(settings.minDiameter, plate)}
                onChange={(v) => setSettings((s) => ({ ...s, minDiameter: Math.min(fromSlider(v), s.maxDiameter * 0.8) }))}
                low="Smaller"
                high="Larger"
              />
              <Slider
                label="Maximum colony size"
                value={toSlider(settings.maxDiameter)}
                display={sizeLabel(settings.maxDiameter, plate)}
                onChange={(v) => setSettings((s) => ({ ...s, maxDiameter: Math.max(fromSlider(v), s.minDiameter * 1.25) }))}
                low="Smaller"
                high="Larger"
              />
              <Slider
                label="Minimum circularity"
                value={Math.round(settings.minCircularity * 100)}
                display={settings.minCircularity.toFixed(2)}
                onChange={(v) => setSettings((s) => ({ ...s, minCircularity: v / 100 }))}
                low="Any shape"
                high="Round only"
                step={5}
              />
              <Slider
                label="Blur strength"
                value={settings.blur}
                display={["None", "Light", "Medium", "Strong"][settings.blur]}
                onChange={(v) => setSettings((s) => ({ ...s, blur: v }))}
                max={3}
                step={1}
              />
              <Slider
                label="Morphology strength"
                value={settings.morphology}
                display={["None", "Light", "Medium", "Strong"][settings.morphology]}
                onChange={(v) => setSettings((s) => ({ ...s, morphology: v }))}
                max={3}
                step={1}
              />
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium text-foreground">Separate touching colonies</span>
                  <span className="block text-xs text-muted-foreground">Distance transform + watershed</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.watershed}
                  onChange={(e) => setSettings((s) => ({ ...s, watershed: e.target.checked }))}
                  className="h-6 w-6 accent-blue-600"
                />
              </label>
              <Button variant="ghost" size="sm" onClick={() => setSettings(DEFAULT_SETTINGS)}>
                Restore defaults
              </Button>
            </div>
          )}
          {phase === "review" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant={dirty ? "default" : "outline"} className={cn(dirty && "bg-blue-600 hover:bg-blue-700")} onClick={analyze}>
                <ScanSearch />
                Reanalyze
              </Button>
              <Button variant="outline" onClick={startManualPlate}>
                <CircleDashed />
                Adjust plate
              </Button>
            </div>
          )}
          {dirty && (
            <p className="text-xs text-muted-foreground">
              Settings changed. Reanalyze to apply them — this replaces the current markers (Undo brings them back).
            </p>
          )}
        </CalcSection>
      )}

      {/* ── CFU ─────────────────────────────────────────────────────────── */}
      <CalcSection
        title="CFU Calculation"
        description={counted ? "Uses the final verified count from the plate above." : "Analyze a plate above, or enter a count you made by hand."}
      >
        {counted ? (
          <div className="flex items-baseline justify-between rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Final colony count</span>
            <span className="text-xl font-bold tabular-nums">{finalCount}</span>
          </div>
        ) : (
          <NumberField
            label="Number of colonies"
            value={manualCount}
            onChange={setManualCount}
            step="1"
            min={0}
            unit="colonies"
            placeholder="e.g. 89"
            error={countParse.error}
          />
        )}

        <ChipGroup
          label="Dilution"
          value={dilutionChoice}
          onChange={setDilutionChoice}
          options={[...DILUTION_PRESETS.map((p) => ({ value: String(p.exponent), label: p.label })), { value: "custom", label: "Custom" }]}
        />
        {dilutionChoice === "custom" && (
          <TextField
            label="Custom dilution"
            value={customDilution}
            onChange={setCustomDilution}
            placeholder="e.g. 0.0001, 1e-4 or 10^-4"
            hint="As a fraction of the original sample, greater than 0 and at most 1."
            error={customDilution.trim() ? dilution.error : undefined}
          />
        )}

        <ChipGroup
          label="Volume plated"
          value={volumeChoice}
          onChange={setVolumeChoice}
          options={[...VOLUME_PRESETS.map((v) => ({ value: String(v), label: `${v} mL` })), { value: "custom", label: "Custom" }]}
        />
        {volumeChoice === "custom" && (
          <NumberField
            label="Custom volume plated"
            value={customVolume}
            onChange={setCustomVolume}
            unit="mL"
            step="0.01"
            min={0}
            error={customVolume.trim() ? volume.error : undefined}
          />
        )}

        <ResultCard
          label="CFU/mL"
          value={cfu?.ok ? formatScientific(cfu.cfuPerMl) : null}
          unit={cfu?.ok ? "CFU/mL" : undefined}
          tone={cfu?.ok ? (warning ? "warning" : "success") : "neutral"}
          interpretation={cfu?.ok ? `${formatPlain(cfu.cfuPerMl)} CFU/mL` : undefined}
          empty={cfu && !cfu.ok ? cfu.error : "Enter the colony count, dilution and volume plated."}
        />
        {cfu?.ok && (
          <div>
            <ResultRow label="Final colonies" value={countParse.value ?? 0} />
            <ResultRow label="Dilution" value={formatDilution(dilution.value!)} />
            <ResultRow label="Volume plated" value={volume.value!} unit="mL" />
            <ResultRow label="CFU/mL" value={formatPlain(cfu.cfuPerMl)} />
          </div>
        )}
        {warning && (
          <LabNotice tone="warning" title={warning.title}>
            {warning.text}
          </LabNotice>
        )}
        {cfu?.ok && (
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-sm">
            <p className="font-semibold text-foreground">Calculation Details</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Formula</p>
            <p className="font-mono text-[13px]">CFU/mL = Colonies ÷ (Dilution × Volume)</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Substitution</p>
            <p className="font-mono text-[13px]">
              {countParse.value} ÷ ({formatDilution(dilution.value!)} × {volume.value} mL)
            </p>
            <p className="font-mono text-[13px]">
              = {countParse.value} ÷ {formatScientific(cfu.divisor)} mL
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Result</p>
            <p className="font-mono text-[13px] font-semibold">
              {formatScientific(cfu.cfuPerMl)} CFU/mL = {formatPlain(cfu.cfuPerMl)} CFU/mL
            </p>
          </div>
        )}
      </CalcSection>

      {phase === "review" && (
        <CalcSection title="Save result">
          <FieldGrid>
            <TextField label="Sample / plate name" value={sample} onChange={setSample} placeholder="e.g. Tap water, plate 2" hint="Included in the saved result." />
          </FieldGrid>
          <div className="grid gap-2 sm:grid-cols-3">
            {!IS_MOBILE_APP && (
              <>
                <Button variant="outline" onClick={downloadAnnotated}>
                  <Download />
                  Download Annotated Image
                </Button>
                <Button variant="outline" onClick={downloadResult}>
                  <FileText />
                  Save Result
                </Button>
              </>
            )}
            <Button variant="outline" onClick={copyResult}>
              <Copy />
              Copy Result
            </Button>
          </div>
          {IS_MOBILE_APP && (
            <p className="text-xs text-muted-foreground">
              In the app, copy the result into your notes, and take a screenshot of the marked plate for your record.
            </p>
          )}
          <p aria-live="polite" className="min-h-[1rem] text-xs text-muted-foreground">
            {status}
          </p>
        </CalcSection>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        Automated image-based colony counting, done on your device with classical computer vision (OpenCV). Always verify
        detected colonies manually.
      </p>

      {validate && (
        <section className="rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-violet-900">
            <MousePointerClick className="h-4 w-4" />
            Validation mode (development only)
          </p>
          <p className="mt-1 text-xs text-violet-900/80">
            These figures describe the image in front of you. They are not an accuracy claim for real plates.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-white" onClick={() => openSample("light")}>
              Synthetic light fixture
            </Button>
            <Button variant="outline" size="sm" className="bg-white" onClick={() => openSample("dark")}>
              Synthetic dark fixture
            </Button>
          </div>
          <div className="mt-3 max-w-xs">
            <NumberField label="Expected colony count" value={expected} onChange={setExpected} step="1" min={0} />
          </div>
          {truth && <p className="mt-2 text-xs">Known positions: {truth.label}.</p>}
          {metrics && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {metrics.fromTruth && <MetricBlock title="Against known positions (automatic)" m={metrics.fromTruth} />}
              {metrics.fromCount && <MetricBlock title="Against expected count (automatic)" m={metrics.fromCount} />}
              <MetricBlock title="From your corrections" m={{ ...metrics.fromReview, expected: null, detected: autoDetected }} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function sizeLabel(fraction: number, plate: Circle | null): string {
  const mm = fraction * 90;
  const px = plate ? ` · ≈${Math.round(fraction * plate.r * 2)} px` : "";
  return `${mm < 1 ? mm.toFixed(1) : Math.round(mm)} mm on a 90 mm dish${px}`;
}

function CountRow({ label, value, sign }: { label: string; value: number; sign?: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">
        {sign && value > 0 ? `${sign} ` : ""}
        {value}
      </span>
    </div>
  );
}

function ModeButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        active ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Slider({
  label,
  value,
  display,
  onChange,
  low,
  high,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (v: number) => void;
  low?: string;
  high?: string;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">{display}</span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-8 w-full accent-blue-600"
      />
      {(low || high) && (
        <span className="flex justify-between text-[11px] text-muted-foreground">
          <span>{low}</span>
          <span>{high}</span>
        </span>
      )}
    </label>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <span className="text-[13px] font-medium text-foreground/90">{label}</span>
      <div role="radiogroup" aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-[44px] min-w-[3.5rem] rounded-xl border px-3 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
              value === o.value ? "border-blue-600 bg-blue-600 text-white" : "border-border bg-background text-foreground hover:border-foreground/25",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type MetricInput = {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number | null;
  recall: number | null;
  f1?: number | null;
  expected: number | null;
  detected: number;
  absoluteError?: number;
  percentError?: number | null;
};

function MetricBlock({ title, m }: { title: string; m: MetricInput }) {
  const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${(v * 100).toFixed(1)}%`);
  const f1 = m.f1 ?? (m.precision !== null && m.recall !== null && m.precision + m.recall > 0 ? (2 * m.precision * m.recall) / (m.precision + m.recall) : null);
  const rows: [string, string][] = [
    ["Expected", m.expected === null ? "—" : String(m.expected)],
    ["Automatic count", String(m.detected)],
    ["Correct detections", m.precision === null && m.expected !== null ? "—" : String(m.truePositives)],
    ["False positives", m.precision === null && m.expected !== null ? "—" : String(m.falsePositives)],
    ["False negatives", m.precision === null && m.expected !== null ? "—" : String(m.falseNegatives)],
    ["Absolute error", m.absoluteError === undefined ? "—" : String(m.absoluteError)],
    ["Percentage error", m.percentError === undefined || m.percentError === null ? "—" : `${m.percentError.toFixed(1)}%`],
    ["Precision", pct(m.precision)],
    ["Recall", pct(m.recall)],
    ["F1 score", pct(f1)],
  ];
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-semibold text-violet-900">{title}</p>
      <dl className="mt-1.5 space-y-0.5 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-mono tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <Badge variant="secondary" className="mt-2 text-[10px]">
        dev only
      </Badge>
    </div>
  );
}

function PlateGlyph() {
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-28 w-auto sm:h-32" aria-hidden="true">
      <circle cx="70" cy="70" r="60" fill="#f1e7cf" stroke="#cbd5e1" strokeWidth="4" />
      {[
        [48, 50, 6],
        [80, 42, 5],
        [92, 76, 7],
        [60, 88, 5],
        [42, 74, 4],
        [74, 100, 4],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#fffaf0" stroke="#e7dcc0" />
          <rect x={x - r - 3} y={y - r - 3} width={(r + 3) * 2} height={(r + 3) * 2} fill="none" stroke="#2563eb" strokeWidth="1.5" rx="1.5" />
        </g>
      ))}
    </svg>
  );
}
