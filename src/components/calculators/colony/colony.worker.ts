import { ColonyDetectionError, detectColonies, type CV } from "./detect";
import { OPENCV_URL, waitForCv } from "./opencv";
import type { Circle, DetectionResult, DetectionSettings, DetectionStep, RGBABuffer } from "./types";

/**
 * Runs OpenCV.js and the colony pipeline off the main thread, so the page stays
 * responsive on a slow phone. Bundled by webpack as a local chunk; OpenCV is
 * loaded with importScripts from our own origin (or the APK's files) — nothing
 * here touches the network beyond that, and the image never leaves the device.
 */

export type WorkerRequest =
  | { id: number; kind: "init" }
  | { id: number; kind: "detect"; buffer: RGBABuffer; settings: DetectionSettings; plate: Circle | null };

export type WorkerResponse =
  | { id: number; kind: "ready" }
  | { id: number; kind: "step"; step: DetectionStep }
  | { id: number; kind: "result"; result: DetectionResult }
  | { id: number; kind: "error"; stage: "init" | "detect"; message: string };

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
  importScripts: (url: string) => void;
  cv?: unknown;
};

let cvReady: Promise<CV> | null = null;

function loadCv(): Promise<CV> {
  if (!cvReady) {
    cvReady = (async () => {
      scope.importScripts(OPENCV_URL);
      return waitForCv(scope.cv);
    })();
    // A failed start may be retried by a later message.
    cvReady.catch(() => {
      cvReady = null;
    });
  }
  return cvReady;
}

scope.onmessage = async (event) => {
  const request = event.data;
  let cv: CV;
  try {
    cv = await loadCv();
  } catch (error) {
    scope.postMessage({ id: request.id, kind: "error", stage: "init", message: error instanceof Error ? error.message : String(error) });
    return;
  }
  if (request.kind === "init") {
    scope.postMessage({ id: request.id, kind: "ready" });
    return;
  }
  try {
    const result = detectColonies(cv, request.buffer, request.settings, {
      plate: request.plate,
      onStep: (step) => scope.postMessage({ id: request.id, kind: "step", step }),
    });
    scope.postMessage({ id: request.id, kind: "result", result });
  } catch (error) {
    scope.postMessage({
      id: request.id,
      kind: "error",
      stage: "detect",
      message: error instanceof ColonyDetectionError ? error.message : "Image analysis failed on this device.",
    });
  }
};
