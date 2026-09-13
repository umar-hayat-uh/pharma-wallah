import React from "react";

/*
 * Whiteboard marker marks.
 *
 * Every path here was drawn by hand as coordinates — deliberately a little
 * uneven, overshooting where a real marker would — because a geometrically
 * perfect ellipse reads as vector clip-art, not as someone at a board.
 *
 * Each <path data-draw> is drawn on by useIndexMotion (DrawSVGPlugin), scrubbed
 * to scroll position so the page plays back like a whiteboard video, with the
 * marker pen riding the tip of the stroke. Without JavaScript, or under reduced
 * motion, the paths simply render fully drawn.
 *
 * All marks are decorative: aria-hidden, and pointer-events: none in the CSS.
 */

export type MarkerColor = "ink" | "blue" | "red" | "green" | "orange";

const STROKE: Record<MarkerColor, string> = {
  ink: "#22252b",
  blue: "#1c7bd9",
  red: "#e5484d",
  green: "#1f9d63",
  orange: "#f08c2e",
};

type Kind = "underline" | "circle" | "arrow" | "arrowUp" | "squiggle" | "check" | "star" | "tick";

const SHAPES: Record<Kind, { viewBox: string; paths: string[]; width: number; stretch?: boolean }> = {
  // A fast horizontal swipe, then a shorter second pass under it.
  underline: {
    viewBox: "0 0 300 30",
    paths: ["M4 14 C 60 8, 122 18, 182 11 S 268 8, 296 13", "M26 23 C 96 18, 176 24, 272 19"],
    width: 5,
    stretch: true,
  },
  // An open loop that overshoots its start, like a circle drawn in one go.
  circle: {
    viewBox: "0 0 220 130",
    paths: [
      "M 162 20 C 128 4, 44 6, 18 44 C -4 78, 42 124, 112 121 C 184 118, 214 86, 206 50 C 199 22, 160 6, 112 11",
    ],
    width: 4.5,
    // Stretched to the word it rings: a circle round "airplane" must be as
    // wide as "airplane". The uneven stroke this causes reads as marker.
    stretch: true,
  },
  // A curving shaft that lands on a two-stroke head.
  arrow: {
    viewBox: "0 0 170 100",
    paths: ["M8 14 C 58 2, 118 22, 150 78", "M124 70 L151 80 L156 52"],
    width: 4,
  },
  arrowUp: {
    viewBox: "0 0 120 150",
    paths: ["M96 144 C 94 96, 64 46, 22 16", "M20 46 L20 14 L50 12"],
    width: 4,
  },
  squiggle: {
    viewBox: "0 0 320 30",
    paths: ["M4 18 C 24 4, 40 4, 56 16 S 88 30, 108 16 S 140 2, 160 16 S 192 30, 212 16 S 244 2, 264 16 S 296 28, 316 14"],
    width: 4.5,
    stretch: true,
  },
  check: { viewBox: "0 0 60 50", paths: ["M6 26 L22 42 L54 6"], width: 5 },
  star: {
    viewBox: "0 0 60 60",
    paths: ["M30 4 L36 22 L56 23 L40 35 L46 55 L30 43 L13 55 L19 35 L4 23 L24 22 Z"],
    width: 3.5,
  },
  tick: { viewBox: "0 0 40 40", paths: ["M20 4 L20 36", "M4 20 L36 20"], width: 4 },
};

export function Mark({
  kind,
  color = "ink",
  className,
  style,
}: {
  kind: Kind;
  color?: MarkerColor;
  className?: string;
  style?: React.CSSProperties;
}) {
  const shape = SHAPES[kind];
  return (
    <svg
      className={`mark mark--${kind}${className ? ` ${className}` : ""}`}
      viewBox={shape.viewBox}
      preserveAspectRatio={shape.stretch ? "none" : "xMidYMid meet"}
      aria-hidden="true"
      focusable="false"
      data-draw-group=""
      style={style}
    >
      {shape.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          data-draw=""
          fill="none"
          stroke={STROKE[color]}
          strokeWidth={shape.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          // Marker ink is never fully opaque; the second pass reads lighter.
          opacity={i === 0 ? 0.92 : 0.7}
        />
      ))}
    </svg>
  );
}

/** A handwritten note in marker. Written on left-to-right by the motion hook. */
export function Note({
  children,
  color = "ink",
  className,
}: {
  children: React.ReactNode;
  color?: MarkerColor;
  className?: string;
}) {
  return (
    <span className={`note${className ? ` ${className}` : ""}`} style={{ color: STROKE[color] }} aria-hidden="true" data-write="">
      {children}
    </span>
  );
}
