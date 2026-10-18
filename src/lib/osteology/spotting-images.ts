/**
 * SERVER-ONLY: the spotting-image map.
 *
 * An image id names its answer ("bone-humerus-left-anterior"), so the files are
 * published under content-hash names (scripts/osteology/hash-images.mjs) and only the
 * server knows which hash is which. Import this from route handlers, server pages and
 * tests — never from a "use client" module, or the map ships to the browser.
 * (The `server-only` package is not installed in this repo; this comment is the guard.)
 */
import imagesJson from "./generated/spotting-images.json";

export type SpottingImage = {
  id: string;
  /** Published file name (content hash), under /images/osteology/spotting. */
  file: string;
  kind: "bone" | "joint";
  model: string;
  side: "right" | "left" | "midline";
  /** Bones: the requested view (lateral/medial relative to the bone's side). Highlighted-
   *  ligament joint images: the absolute direction they were taken from. */
  view: string;
  highlight?: string | null;
  bytes: number;
  /** Landmarks visible in this image, as fractions of the frame (x right, y down). */
  markers: { name: string; mesh: string; x: number; y: number }[];
};

export const SPOTTING_IMAGES = (imagesJson as unknown as { images: SpottingImage[] }).images;

export const spottingSrc = (img: SpottingImage) => `/images/osteology/spotting/${img.file}`;

const VIEW_WORDS: Record<string, string> = {
  anterior: "anterior", posterior: "posterior", superior: "superior", inferior: "inferior",
  lateral: "lateral", medial: "medial", right: "right-side", left: "left-side",
};

/** Viewpoint words for alt text and captions — never the name of the structure. */
export const viewWords = (img: SpottingImage) => `${VIEW_WORDS[img.view] ?? img.view} view`;
