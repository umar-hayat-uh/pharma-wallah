import { ColonyDetectionError, PROCESSING_MAX, detectColonies, type CV } from "./detect";
import { OPENCV_URL, waitForCv } from "./opencv";
import type { WorkerRequest, WorkerResponse } from "./colony.worker";
import type { Circle, DetectionResult, DetectionSettings, DetectionStep } from "./types";

/**
 * The page's side of colony detection. Prefers the Web Worker; if the worker
 * cannot start (an old WebView, a blocked chunk), OpenCV is loaded on the main
 * thread from the same local file and the same pipeline runs there. Only one
 * OpenCV instance is ever started per page.
 */

export class OpenCvInitError extends Error {}

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;
let mainCv: Promise<CV> | null = null;

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./colony.worker.ts", import.meta.url));
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

function retireWorker() {
  workerBroken = true;
  worker?.terminate();
  worker = null;
}

// Omit<> over a union keeps only shared keys; distribute it over each member instead.
type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;

function ask(w: Worker, request: WithoutId<WorkerRequest>, onStep?: (s: DetectionStep) => void, transfer: Transferable[] = []) {
  return new Promise<WorkerResponse>((resolve, reject) => {
    const id = nextId++;
    // A worker that never answers (a chunk that failed silently) is treated like one that errored.
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("worker-timeout"));
    }, 90000);
    const cleanup = () => {
      window.clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.id !== id) return;
      if (msg.kind === "step") {
        onStep?.(msg.step);
        return;
      }
      cleanup();
      resolve(msg);
    };
    const onError = () => {
      cleanup();
      reject(new Error("worker-error"));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ ...request, id } as WorkerRequest, transfer);
  });
}

function loadMainThreadCv(): Promise<CV> {
  if (!mainCv) {
    mainCv = new Promise<CV>((resolve, reject) => {
      const win = window as unknown as { cv?: unknown };
      if (win.cv) {
        waitForCv(win.cv).then(resolve, reject);
        return;
      }
      const script = document.createElement("script");
      script.src = OPENCV_URL;
      script.async = true;
      script.onload = () => waitForCv(win.cv).then(resolve, reject);
      script.onerror = () => reject(new Error("opencv.js could not be loaded."));
      document.head.appendChild(script);
    });
    mainCv.catch(() => {
      mainCv = null;
    });
  }
  return mainCv;
}

/** Starts OpenCV ahead of time ("Preparing offline image analysis…"). */
export async function prepareOpenCv(): Promise<void> {
  const w = getWorker();
  if (w) {
    try {
      const reply = await ask(w, { kind: "init" });
      if (reply.kind === "ready") return;
    } catch {
      // fall through to the main thread
    }
    retireWorker();
  }
  try {
    await loadMainThreadCv();
  } catch (error) {
    throw new OpenCvInitError(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Detects colonies on `canvas` (any size). A copy of at most PROCESSING_MAX
 * pixels is analysed; results come back in `canvas` pixels.
 */
export async function detectOnCanvas(
  canvas: HTMLCanvasElement,
  settings: DetectionSettings,
  plate: Circle | null,
  onStep: (step: DetectionStep) => void,
): Promise<DetectionResult> {
  onStep(1);
  const k = Math.min(1, PROCESSING_MAX / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * k));
  const height = Math.max(1, Math.round(canvas.height * k));
  const small = document.createElement("canvas");
  small.width = width;
  small.height = height;
  const ctx = small.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new ColonyDetectionError("This device could not create an image canvas.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const scaledPlate = plate ? { x: plate.x * k, y: plate.y * k, r: plate.r * k } : null;

  let result: DetectionResult | null = null;
  const w = getWorker();
  if (w) {
    try {
      const copy = new Uint8ClampedArray(data);
      const reply = await ask(w, { kind: "detect", buffer: { data: copy, width, height }, settings, plate: scaledPlate }, onStep, [copy.buffer]);
      if (reply.kind === "result") result = reply.result;
      else if (reply.kind === "error" && reply.stage === "detect") throw new ColonyDetectionError(reply.message);
      else retireWorker();
    } catch (error) {
      if (error instanceof ColonyDetectionError) throw error;
      retireWorker();
    }
  }
  if (!result) {
    let cv: CV;
    try {
      cv = await loadMainThreadCv();
    } catch (error) {
      throw new OpenCvInitError(error instanceof Error ? error.message : String(error));
    }
    // Let the progress line paint before the main thread is busy.
    await new Promise((resolve) => window.setTimeout(resolve, 30));
    result = detectColonies(cv, { data, width, height }, settings, { plate: scaledPlate, onStep });
  }

  const back = 1 / k;
  return {
    ...result,
    plate: { x: result.plate.x * back, y: result.plate.y * back, r: result.plate.r * back },
    colonies: result.colonies.map((c) => ({
      ...c,
      x: c.x * back,
      y: c.y * back,
      area: c.area !== undefined ? c.area * back * back : undefined,
      box: { x: c.box.x * back, y: c.box.y * back, width: c.box.width * back, height: c.box.height * back },
    })),
    processingScale: result.processingScale * k,
  };
}
