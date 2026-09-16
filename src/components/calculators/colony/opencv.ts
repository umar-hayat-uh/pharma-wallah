import type { CV } from "./detect";

/**
 * Where OpenCV.js lives, and how to wait for it.
 *
 * `new URL(…, import.meta.url)` makes webpack copy the 10.8 MB opencv.js
 * (WASM embedded) into the build as a static asset — hashed, served from our
 * own origin, and packaged inside the APK. It is never parsed or minified by
 * the bundler, and never fetched from a CDN. It is loaded only when the colony
 * counter asks for it, never with the rest of the site.
 */
export const OPENCV_URL = new URL("@techstark/opencv-js/dist/opencv.js", import.meta.url).href;

type CvLike = CV & { then?: (cb: (m: CV) => void) => unknown; onRuntimeInitialized?: () => void; Mat?: unknown };

/**
 * Resolves once the OpenCV runtime is ready. The Emscripten module object has
 * its own `then`, so it must never be passed to `resolve` — that recurses
 * forever. It is resolved wrapped, and its `then` removed once ready.
 */
export function waitForCv(candidate: unknown, timeoutMs = 60000): Promise<CV> {
  return new Promise<CV>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("OpenCV took too long to start.")), timeoutMs);
    const done = (m: CV) => {
      clearTimeout(timer);
      delete (m as CvLike).then;
      resolve(m);
    };
    if (!candidate) {
      clearTimeout(timer);
      reject(new Error("OpenCV did not load."));
      return;
    }
    if (candidate instanceof Promise) {
      candidate.then((m: CV) => done(m), reject);
      return;
    }
    const m = candidate as CvLike;
    if (typeof m.then === "function") {
      m.then((ready) => done(ready));
      return;
    }
    if (typeof m.Mat === "function") {
      done(m);
      return;
    }
    m.onRuntimeInitialized = () => done(m);
  });
}
