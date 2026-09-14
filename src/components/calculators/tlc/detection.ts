import { readPixels } from "./canvas";
import { MAX_PIXELS, detectSpots } from "./spots";
import type { DetectResponse } from "./detect.worker";
import type { DetectedSpot, DetectionOptions } from "./types";

/**
 * Spot detection on a canvas, in a Web Worker when one can be started and on
 * the main thread otherwise. Either way the result is in the canvas's own
 * pixels, and nothing leaves the device.
 */

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./detect.worker.ts", import.meta.url));
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

function inWorker(w: Worker, message: { buffer: Parameters<typeof detectSpots>[0]; options: DetectionOptions }) {
  return new Promise<ReturnType<typeof detectSpots>>((resolve, reject) => {
    const id = nextId++;
    // A worker that never answers (a chunk that failed silently) falls back like one that errored.
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("worker"));
    }, 20000);
    const cleanup = () => {
      window.clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const onMessage = (event: MessageEvent<DetectResponse>) => {
      if (event.data.id !== id) return;
      cleanup();
      if (event.data.result) resolve(event.data.result);
      else reject(new Error(event.data.error ?? "Detection failed."));
    };
    const onError = () => {
      cleanup();
      reject(new Error("worker"));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    // The pixel buffer is transferred, not copied.
    w.postMessage({ id, ...message }, [message.buffer.data.buffer]);
  });
}

export async function detectSpotsOnCanvas(canvas: HTMLCanvasElement, options: DetectionOptions): Promise<DetectedSpot[]> {
  const { buffer, scale } = readPixels(canvas, MAX_PIXELS);
  const w = getWorker();
  let result: ReturnType<typeof detectSpots> | null = null;
  if (w) {
    try {
      result = await inWorker(w, { buffer: { ...buffer, data: buffer.data.slice() }, options });
    } catch (error) {
      if (error instanceof Error && error.message !== "worker") throw error;
      // The worker chunk could not start (an old WebView, a blocked script) — run here instead.
      workerBroken = true;
      worker?.terminate();
      worker = null;
    }
  }
  if (!result) {
    // Let the "Detecting…" state paint before the main thread is busy.
    await new Promise((resolve) => window.setTimeout(resolve, 30));
    result = detectSpots(buffer, options);
  }
  return result.spots.map((s) => ({
    ...s,
    x: s.x / scale,
    y: s.y / scale,
    radius: s.radius / scale,
    area: s.area / (scale * scale),
  }));
}
