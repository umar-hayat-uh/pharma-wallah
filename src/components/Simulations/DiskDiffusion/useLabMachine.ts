"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the experiment state machine
// ============================================================
//
// One reducer owns the whole experiment. The stage list is explicit and a
// stage only unlocks when its prerequisites are genuinely met, so a student
// cannot measure a plate they never inoculated — in either mode. Guided and
// free-practice differ in how much the interface says, not in what it allows.

import { useCallback, useMemo, useReducer } from "react";

import {
  ANTIBIOTIC_BY_ID,
  DEFAULT_INTERPRETATION_SYSTEM_ID,
  MAX_DISKS,
  MIN_DISKS,
  ORGANISM_BY_ID,
} from "./data";
import {
  checkMeasurement,
  checkPlacement,
  computeZone,
  defaultDiskLayout,
  evaluateCoverage,
  newExperimentSeed,
  type CoverageReport,
  type PlacementCheck,
} from "./engine";
import type {
  AgarDepth,
  DiskPlacement,
  FeedbackEntry,
  FeedbackTone,
  LabMode,
  LabStage,
  Measurement,
  TurbidityBand,
} from "./types";

export const STAGE_ORDER: LabStage[] = [
  "intro",
  "inoculum",
  "plate-preparation",
  "inoculation",
  "disk-placement",
  "incubation",
  "growth",
  "measurement",
  "results",
  "completed",
];

export const STAGE_LABELS: Record<LabStage, { title: string; short: string; instruction: string }> = {
  intro: {
    title: "Set up the experiment",
    short: "Set up",
    instruction: "Choose the isolate to test and the way results will be reported.",
  },
  inoculum: {
    title: "Prepare and standardise the inoculum",
    short: "Inoculum",
    instruction:
      "Suspend colonies in sterile saline, then adjust the suspension against the turbidity standard.",
  },
  "plate-preparation": {
    title: "Prepare the Mueller-Hinton plate",
    short: "Plate",
    instruction: "Pour the agar to an even depth and confirm the surface is dry.",
  },
  inoculation: {
    title: "Inoculate the agar surface",
    short: "Inoculate",
    instruction:
      "Swab the whole surface in three orientations, then run the swab around the rim.",
  },
  "disk-placement": {
    title: "Apply the antibiotic disks",
    short: "Disks",
    instruction: "Place four to six disks, well spaced and clear of the rim.",
  },
  incubation: {
    title: "Incubate the plate",
    short: "Incubate",
    instruction: "Load the inverted plate, close the door and run the cycle.",
  },
  growth: {
    title: "Observe growth and zones",
    short: "Observe",
    instruction: "Watch the lawn grow in and the zones of inhibition appear.",
  },
  measurement: {
    title: "Measure the zones",
    short: "Measure",
    instruction:
      "Drag the calliper across each zone, through the centre of its disk, and record the diameter.",
  },
  results: {
    title: "Interpret the results",
    short: "Results",
    instruction: "Read each diameter against the criteria in force and report a category.",
  },
  completed: {
    title: "Experiment complete",
    short: "Complete",
    instruction: "Review what you did, what it means, and what to try next.",
  },
};

export interface LabState {
  mode: LabMode;
  stage: LabStage;
  /** Furthest stage reached, so completed steps stay navigable. */
  furthest: LabStage;
  seed: string;
  interpretationSystemId: string;

  organismId: string | null;

  suspensionPrepared: boolean;
  turbidity: TurbidityBand | null;

  agarDepth: AgarDepth | null;
  plateReady: boolean;

  /** Coverage-grid cells the swab has touched, as row * GRID + col. */
  coveredCells: number[];
  orientations: number[];
  rimPass: boolean;

  placements: DiskPlacement[];
  spacingViolations: number;

  incubationTempC: number;
  incubationHours: number;
  incubationProgress: number;
  incubationRunning: boolean;

  /** True zone diameters, fixed once the plate has grown. */
  zones: Record<string, number>;
  measurements: Record<string, Measurement>;

  feedback: FeedbackEntry[];
}

type Action =
  | { type: "reset"; mode: LabMode }
  | { type: "set-mode"; mode: LabMode }
  | { type: "go"; stage: LabStage }
  | { type: "advance" }
  | { type: "back" }
  | { type: "select-organism"; organismId: string }
  | { type: "set-interpretation"; systemId: string }
  | { type: "prepare-suspension" }
  | { type: "set-turbidity"; band: TurbidityBand }
  | { type: "set-agar-depth"; depth: AgarDepth }
  | { type: "pour-plate" }
  | { type: "swab"; cells: number[]; orientation: number }
  | { type: "rim-pass" }
  | { type: "reset-lawn" }
  | { type: "place-disk"; antibioticId: string; x: number; y: number }
  | { type: "move-disk"; antibioticId: string; x: number; y: number }
  | { type: "remove-disk"; antibioticId: string }
  | { type: "auto-arrange" }
  | { type: "rejected-placement"; check: PlacementCheck; antibioticId: string }
  | { type: "start-incubation" }
  | { type: "set-incubation"; tempC?: number; hours?: number }
  | { type: "incubation-progress"; value: number }
  | { type: "finish-incubation" }
  | { type: "record-measurement"; antibioticId: string; a: Point; b: Point; centre: Point }
  | { type: "clear-measurement"; antibioticId: string }
  | { type: "feedback"; entry: Omit<FeedbackEntry, "id" | "stage"> & { stage?: LabStage } }
  | { type: "dismiss-feedback"; id: string };

interface Point {
  x: number;
  y: number;
}

function initialState(mode: LabMode): LabState {
  return {
    mode,
    stage: "intro",
    furthest: "intro",
    seed: newExperimentSeed(),
    interpretationSystemId: DEFAULT_INTERPRETATION_SYSTEM_ID,
    organismId: null,
    suspensionPrepared: false,
    turbidity: null,
    agarDepth: null,
    plateReady: false,
    coveredCells: [],
    orientations: [],
    rimPass: false,
    placements: [],
    spacingViolations: 0,
    incubationTempC: 35,
    incubationHours: 18,
    incubationProgress: 0,
    incubationRunning: false,
    zones: {},
    measurements: {},
    feedback: [],
  };
}

/** Feedback ids are monotonic rather than time-based: React 18 StrictMode runs
 *  reducers twice in development, and `Date.now()` collided into duplicate keys
 *  (MEMORY.md gotcha 103's sibling). */
let feedbackCounter = 0;
function pushFeedback(
  list: FeedbackEntry[],
  stage: LabStage,
  tone: FeedbackTone,
  title: string,
  detail: string,
): FeedbackEntry[] {
  feedbackCounter += 1;
  const entry: FeedbackEntry = { id: `fb-${feedbackCounter}`, tone, title, detail, stage };
  // Newest first, and capped — the log teaches, it is not an audit trail.
  return [entry, ...list].slice(0, 30);
}

export function coverageOf(state: LabState): CoverageReport {
  return evaluateCoverage(
    new Set(state.coveredCells),
    new Set(state.orientations),
    state.rimPass,
  );
}

/** Has everything this stage requires actually been done? */
export function stageComplete(state: LabState, stage: LabStage): boolean {
  switch (stage) {
    case "intro":
      return state.organismId !== null;
    case "inoculum":
      return state.suspensionPrepared && state.turbidity !== null;
    case "plate-preparation":
      return state.plateReady;
    case "inoculation":
      return coverageOf(state).fraction >= 0.6;
    case "disk-placement":
      return state.placements.length >= MIN_DISKS;
    case "incubation":
      return state.incubationProgress >= 100;
    case "growth":
      return Object.keys(state.zones).length > 0;
    case "measurement":
      return (
        state.placements.length > 0 &&
        state.placements.every((p) => p.antibioticId in state.measurements)
      );
    case "results":
      return true;
    case "completed":
      return true;
    default:
      return false;
  }
}

/** A stage is reachable only when every stage before it is complete. */
export function stageUnlocked(state: LabState, stage: LabStage): boolean {
  const target = STAGE_ORDER.indexOf(stage);
  for (let i = 0; i < target; i += 1) {
    if (!stageComplete(state, STAGE_ORDER[i])) return false;
  }
  return true;
}

function reducer(state: LabState, action: Action): LabState {
  switch (action.type) {
    case "reset":
      return initialState(action.mode);

    case "set-mode":
      return { ...state, mode: action.mode };

    case "go": {
      if (!stageUnlocked(state, action.stage)) return state;
      const furthest =
        STAGE_ORDER.indexOf(action.stage) > STAGE_ORDER.indexOf(state.furthest)
          ? action.stage
          : state.furthest;
      return { ...state, stage: action.stage, furthest };
    }

    case "advance": {
      const next = STAGE_ORDER[STAGE_ORDER.indexOf(state.stage) + 1];
      if (!next || !stageUnlocked(state, next)) return state;
      const furthest =
        STAGE_ORDER.indexOf(next) > STAGE_ORDER.indexOf(state.furthest) ? next : state.furthest;
      return { ...state, stage: next, furthest };
    }

    case "back": {
      const prev = STAGE_ORDER[STAGE_ORDER.indexOf(state.stage) - 1];
      return prev ? { ...state, stage: prev } : state;
    }

    case "select-organism": {
      const organism = ORGANISM_BY_ID[action.organismId];
      if (!organism) return state;
      return {
        ...state,
        organismId: action.organismId,
        feedback: pushFeedback(
          state.feedback,
          "intro",
          "info",
          `Isolate selected: ${organism.short}`,
          organism.clinicalNote,
        ),
      };
    }

    case "set-interpretation":
      return { ...state, interpretationSystemId: action.systemId };

    case "prepare-suspension":
      return {
        ...state,
        suspensionPrepared: true,
        feedback: pushFeedback(
          state.feedback,
          "inoculum",
          "success",
          "Colonies suspended",
          "Three to five colonies of the same morphology, emulsified in sterile saline until no clumps remain.",
        ),
      };

    case "set-turbidity": {
      const band = action.band;
      const tone: FeedbackTone = band === "standard" ? "success" : "warn";
      const detail =
        band === "standard"
          ? "Matched to the turbidity standard. Swab the plate within about 15 minutes — the suspension keeps growing on the bench."
          : band === "heavy"
            ? "Your inoculum is too dense. A heavy inoculum puts more organisms in the path of the diffusing drug, so the zones on this plate will read smaller than they should. You can dilute it and try again."
            : "Your inoculum is too light. Fewer organisms means growth is held back further from the disk, so the zones will read larger than they should — a resistant isolate can look susceptible. You can add more colony material.";
      return {
        ...state,
        turbidity: band,
        feedback: pushFeedback(
          state.feedback,
          "inoculum",
          tone,
          band === "standard" ? "Inoculum standardised" : "Inoculum outside the standard",
          detail,
        ),
      };
    }

    case "set-agar-depth":
      return { ...state, agarDepth: action.depth };

    case "pour-plate": {
      const depth = state.agarDepth ?? "standard";
      const tone: FeedbackTone = depth === "standard" ? "success" : "warn";
      return {
        ...state,
        agarDepth: depth,
        plateReady: true,
        feedback: pushFeedback(
          state.feedback,
          "plate-preparation",
          tone,
          depth === "standard" ? "Plate poured to 4 mm" : `Plate poured ${depth}`,
          depth === "standard"
            ? "An even 4 mm layer, surface dry. The drug diffuses through the agar in three dimensions, so an even depth is what makes zones comparable."
            : depth === "thin"
              ? "A thin layer lets the antibiotic spread further sideways, so zones on this plate will read larger than they should."
              : "A thick layer holds the antibiotic back, so zones on this plate will read smaller than they should.",
        ),
      };
    }

    case "swab": {
      if (!state.plateReady) return state;
      const cells = new Set(state.coveredCells);
      action.cells.forEach((c) => cells.add(c));
      const orientations = new Set(state.orientations);
      orientations.add(action.orientation);
      return {
        ...state,
        coveredCells: Array.from(cells),
        orientations: Array.from(orientations),
      };
    }

    case "rim-pass":
      if (!state.plateReady || state.rimPass) return state;
      return {
        ...state,
        rimPass: true,
        feedback: pushFeedback(
          state.feedback,
          "inoculation",
          "success",
          "Rim swabbed",
          "The straight passes miss the margin of the plate; the rim pass picks it up so the lawn reaches the edge.",
        ),
      };

    case "reset-lawn":
      return { ...state, coveredCells: [], orientations: [], rimPass: false };

    case "place-disk": {
      if (state.placements.length >= MAX_DISKS) return state;
      if (state.placements.some((p) => p.antibioticId === action.antibioticId)) return state;
      const antibiotic = ANTIBIOTIC_BY_ID[action.antibioticId];
      return {
        ...state,
        placements: [
          ...state.placements,
          { antibioticId: action.antibioticId, x: action.x, y: action.y },
        ],
        feedback: pushFeedback(
          state.feedback,
          "disk-placement",
          "success",
          `${antibiotic?.name ?? action.antibioticId} ${antibiotic?.diskContent ?? ""} placed`,
          "The disk is in contact with the agar and diffusion has started. In a real laboratory it cannot be moved now — lifting it leaves a partial zone behind.",
        ),
      };
    }

    case "move-disk":
      return {
        ...state,
        placements: state.placements.map((p) =>
          p.antibioticId === action.antibioticId ? { ...p, x: action.x, y: action.y } : p,
        ),
      };

    case "remove-disk":
      return {
        ...state,
        placements: state.placements.filter((p) => p.antibioticId !== action.antibioticId),
      };

    case "auto-arrange": {
      const layout = defaultDiskLayout(state.placements.length);
      return {
        ...state,
        placements: state.placements.map((p, i) => ({ ...p, ...layout[i] })),
        feedback: pushFeedback(
          state.feedback,
          "disk-placement",
          "info",
          "Disks arranged evenly",
          "Spacing set to the maximum the plate allows for this many disks. In the laboratory you would place them by eye against a template.",
        ),
      };
    }

    case "rejected-placement": {
      const antibiotic = ANTIBIOTIC_BY_ID[action.antibioticId];
      const name = antibiotic?.name ?? action.antibioticId;
      const problem = action.check.problem;
      const detail =
        problem === "too-close"
          ? `These disks are too close together (${action.check.nearestMm?.toFixed(0)} mm centre to centre). Overlapping inhibition zones have no readable edge, so keep them at least 24 mm apart.`
          : problem === "too-close-to-edge"
            ? "The disk is too near the rim. A zone that runs off the agar cannot be measured — keep disks at least 15 mm in from the edge."
            : "The disk must make proper contact with the agar surface. Drop it inside the plate.";
      return {
        ...state,
        spacingViolations: state.spacingViolations + 1,
        feedback: pushFeedback(
          state.feedback,
          "disk-placement",
          "warn",
          `${name} not placed`,
          detail,
        ),
      };
    }

    case "set-incubation":
      return {
        ...state,
        incubationTempC: action.tempC ?? state.incubationTempC,
        incubationHours: action.hours ?? state.incubationHours,
      };

    case "start-incubation":
      if (state.incubationRunning || state.incubationProgress >= 100) return state;
      return { ...state, incubationRunning: true, incubationProgress: 0 };

    case "incubation-progress":
      return { ...state, incubationProgress: Math.min(100, action.value) };

    case "finish-incubation": {
      const organism = state.organismId ? ORGANISM_BY_ID[state.organismId] : null;
      if (!organism) return state;
      const coverage = coverageOf(state);
      const conditions = {
        turbidity: state.turbidity ?? "standard",
        agarDepth: state.agarDepth ?? "standard",
        coverage: coverage.fraction,
        seed: state.seed,
      };
      const zones: Record<string, number> = {};
      state.placements.forEach((p) => {
        zones[p.antibioticId] = computeZone(organism, p.antibioticId, conditions);
      });

      let feedback = pushFeedback(
        state.feedback,
        "incubation",
        "success",
        "Incubation complete",
        `${state.incubationHours} h at ${state.incubationTempC} °C in air. The lawn has grown in and the zones can be read.`,
      );
      if (!coverage.uniform) {
        feedback = pushFeedback(
          feedback,
          "growth",
          "warn",
          "The bacterial lawn is not uniform",
          "Growth is patchy rather than confluent, so the zone edges are ragged and the diameters you measure will be less reliable. Repeating the swabbing pattern — three orientations plus the rim — is what fixes this.",
        );
      }
      return { ...state, incubationRunning: false, incubationProgress: 100, zones, feedback };
    }

    case "record-measurement": {
      const trueDiameter = state.zones[action.antibioticId];
      if (trueDiameter === undefined) return state;
      const check = checkMeasurement(action.a, action.b, action.centre, trueDiameter);
      const recorded = Math.round(Math.hypot(action.b.x - action.a.x, action.b.y - action.a.y));
      const antibiotic = ANTIBIOTIC_BY_ID[action.antibioticId];
      const name = antibiotic?.name ?? action.antibioticId;

      const measurement: Measurement = {
        antibioticId: action.antibioticId,
        recorded,
        errorMm: check.errorMm,
        throughCentre: check.throughCentre,
      };

      let feedback = state.feedback;
      if (!check.throughCentre) {
        feedback = pushFeedback(
          feedback,
          "measurement",
          "warn",
          `${name}: measure through the centre`,
          "Your calliper line does not pass through the disk. Measure the complete diameter of the zone, across its widest part and through the centre of the disk — a chord reads short. The reading has been recorded; you can measure it again.",
        );
      } else if (check.errorMm > 2) {
        feedback = pushFeedback(
          feedback,
          "measurement",
          "warn",
          `${name}: check the zone edge`,
          "Your reading is more than 2 mm from the edge of the clear area. Read the point where growth stops completely, at the widest part of the zone, and remember the 6 mm disk is included in the diameter.",
        );
      } else {
        feedback = pushFeedback(
          feedback,
          "measurement",
          "success",
          `${name}: ${recorded} mm recorded`,
          "Measured through the disk centre, to the nearest millimetre.",
        );
      }

      return {
        ...state,
        measurements: { ...state.measurements, [action.antibioticId]: measurement },
        feedback,
      };
    }

    case "clear-measurement": {
      const next = { ...state.measurements };
      delete next[action.antibioticId];
      return { ...state, measurements: next };
    }

    case "feedback":
      return {
        ...state,
        feedback: pushFeedback(
          state.feedback,
          action.entry.stage ?? state.stage,
          action.entry.tone,
          action.entry.title,
          action.entry.detail,
        ),
      };

    case "dismiss-feedback":
      return { ...state, feedback: state.feedback.filter((f) => f.id !== action.id) };

    default:
      return state;
  }
}

export function useLabMachine(initialMode: LabMode = "guided") {
  const [state, dispatch] = useReducer(reducer, initialMode, initialState);

  const organism = state.organismId ? ORGANISM_BY_ID[state.organismId] : null;
  const coverage = useMemo(() => coverageOf(state), [state]);

  /**
   * Try to place a disk. Returns whether it landed, so the caller can animate
   * a rejection — the reducer records the teaching feedback either way.
   */
  const tryPlaceDisk = useCallback(
    (antibioticId: string, x: number, y: number) => {
      const check = checkPlacement({ x, y }, state.placements, antibioticId);
      if (!check.ok) {
        dispatch({ type: "rejected-placement", check, antibioticId });
        return false;
      }
      if (state.placements.some((p) => p.antibioticId === antibioticId)) {
        dispatch({ type: "move-disk", antibioticId, x, y });
      } else {
        dispatch({ type: "place-disk", antibioticId, x, y });
      }
      return true;
    },
    [state.placements],
  );

  return { state, dispatch, organism, coverage, tryPlaceDisk };
}
