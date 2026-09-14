import { detectSpots } from "./spots";
import type { DetectionOptions, DetectionResult, PixelBuffer } from "./types";

/**
 * Runs spot detection off the main thread, so dragging and zooming stay smooth
 * on a slow phone while the plate is analysed. Bundled by webpack from
 * `new Worker(new URL("./detect.worker.ts", import.meta.url))` — a local chunk,
 * not a remote script, so it works offline and inside the APK.
 */

export type DetectRequest = { id: number; buffer: PixelBuffer; options: DetectionOptions };
export type DetectResponse = { id: number; result?: DetectionResult; error?: string };

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<DetectRequest>) => void) | null;
  postMessage: (message: DetectResponse) => void;
};

scope.onmessage = (event) => {
  const { id, buffer, options } = event.data;
  try {
    scope.postMessage({ id, result: detectSpots(buffer, options) });
  } catch (error) {
    scope.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};
