/**
 * LAB 4 — Pharmacognosy: microscopical identification of powdered clove
 * (Syzygium aromaticum (L.) Merr. & L.M.Perry, the dried flower buds).
 *
 * The microscope view is a SCHEMATIC ILLUSTRATION drawn from the reference description
 * below — not photomicrographs — and says so wherever it is shown. The reference
 * characters and their sources are in `REFERENCE_FEATURES`; nothing is drawn that the
 * reference does not describe. Whether a student has *seen* a feature is decided by the
 * optics model (calculations/microscopy.ts): it must be in the field, in focus and at a
 * magnification that resolves it.
 */
import type { ControllerDef, ExperimentDefinition, ExperimentReport, Feedback, ObservationSection, Suggestion } from "../engine/types";
import { info, mistake, ok, refuse } from "../engine/machine";
import { OBJECTIVES, fieldOfViewUm, generateSlide, recognisable, totalMagnification, type ElementSpec, type ScopeView, type SlideElement } from "../calculations/microscopy";
import { LABS } from "../catalog";

/** What the slide contains. Counts are relative abundance for drawing, not measurements. */
export const CLOVE_ELEMENTS: ElementSpec[] = [
  { type: "oil-gland", count: 34, size: [80, 180] },
  { type: "pollen", count: 160, size: [15, 20] },
  { type: "cluster-crystal", count: 130, size: [8, 15], needsClearing: true },
  { type: "spiral-vessel", count: 14, size: [24, 40] },
  { type: "epidermis", count: 12, size: [25, 35], needsClearing: true },
  { type: "fibre", count: 5, size: [150, 380] },
  { type: "sclereid", count: 2, size: [40, 70] },
];

export interface ReferenceFeature {
  id: string;
  label: string;
  /** What genuine powdered clove shows. */
  expected: "present" | "absent";
  /** Diagnostic for clove itself (vs merely compatible). */
  diagnostic: boolean;
  /** The slide element type the student must see, if present. */
  element?: string;
  description: string;
}

export const REFERENCE_FEATURES: ReferenceFeature[] = [
  { id: "oil-gland", label: "Parenchyma with large oval schizogenous oil glands", expected: "present", diagnostic: true, element: "oil-gland", description: "Fragments of the hypanthium parenchyma containing large oval oil cavities (schizogenous glands), often broken across; the most abundant element." },
  { id: "pollen", label: "Pollen grains, triangular (tetrahedral) in outline, about 15–20 µm", expected: "present", diagnostic: true, element: "pollen", description: "Numerous small, smooth pollen grains, triangular in outline with a pore at each angle." },
  { id: "cluster-crystal", label: "Cluster crystals of calcium oxalate, about 10–15 µm", expected: "present", diagnostic: true, element: "cluster-crystal", description: "Small rosette (cluster) crystals in the parenchyma; best seen after clearing in chloral hydrate." },
  { id: "spiral-vessel", label: "Small spirally thickened vessels", expected: "present", diagnostic: false, element: "spiral-vessel", description: "Narrow vessels/tracheids with spiral thickening from the vascular strands." },
  { id: "epidermis", label: "Epidermis with thick cuticle and anomocytic stomata", expected: "present", diagnostic: false, element: "epidermis", description: "Polygonal epidermal cells with a thick cuticle and stomata of the anomocytic (ranunculaceous) type." },
  { id: "fibre", label: "A few thick-walled lignified fibres", expected: "present", diagnostic: false, element: "fibre", description: "Occasional spindle-shaped fibres with thick, slightly lignified walls." },
  { id: "sclereids-many", label: "Numerous sclereids (stone cells)", expected: "absent", diagnostic: true, description: "Genuine clove has few or none. Many thick-walled pitted sclereids indicate clove STALKS." },
  { id: "prisms", label: "Prism crystals of calcium oxalate", expected: "absent", diagnostic: true, description: "Prismatic crystals are characteristic of clove STALKS, not the buds." },
  { id: "starch", label: "Starch grains", expected: "absent", diagnostic: true, description: "Clove buds contain no starch. Starch indicates MOTHER CLOVES (the fruits)." },
  { id: "trichomes", label: "Covering trichomes", expected: "absent", diagnostic: false, description: "Clove has no hairs." },
];

export const SAMPLE_JARS = [
  { id: "clove", name: "Caryophylli flos — Clove, powdered (jar PG-07)", correct: true },
  { id: "stalk", name: "Clove stalks, powdered (jar PG-08)", correct: false, why: "This jar is clove STALKS — the reference adulterant, not the drug. The practical asks you to identify clove." },
  { id: "cinnamon", name: "Cinnamon bark, powdered (jar PG-03)", correct: false, why: "This is cinnamon bark. Read the label against the practical sheet before taking a sample." },
  { id: "fennel", name: "Fennel fruit, powdered (jar PG-11)", correct: false, why: "This is fennel. Read the label against the practical sheet before taking a sample." },
] as const;

export const MOUNTANTS = [
  { id: "chloral", name: "Chloral hydrate solution", correct: true, why: "Chloral hydrate clears the tissue — dissolves cell contents and starch, swells the walls — so crystals, glands and stomata stand out." },
  { id: "water", name: "Water", correct: false, why: "A water mount does not clear the tissue: cell contents hide the crystals and the stomata. Use chloral hydrate for the general powder examination (water or iodine are for starch)." },
  { id: "iodine", name: "Iodine solution (N/50)", correct: false, why: "Iodine is a test reagent for starch, not a clearing mountant. Use chloral hydrate for the general examination; iodine can be used afterwards as a separate starch test." },
] as const;

export const IDENTITY_OPTIONS = [
  { id: "clove", name: "Clove (Syzygium aromaticum, flower bud)", correct: true },
  { id: "stalk", name: "Clove stalks", correct: false },
  { id: "cinnamon", name: "Cinnamon bark", correct: false },
  { id: "fennel", name: "Fennel fruit", correct: false },
];

const KEY_ITEMS = ["microscope", "slides", "coverslips", "chloral", "jars", "lamp", "needle", "blotting"] as const;
const CORE = ["oil-gland", "pollen", "cluster-crystal", "spiral-vessel", "epidermis"];

export interface CloveState {
  seed: number;
  inspected: string[];
  sample: string | null;
  slideCleaned: boolean;
  powder: "small" | "large" | null;
  mountant: string | null;
  warmed: "gentle" | "boiled" | null;
  coverslip: "angled" | "dropped" | null;
  blotted: boolean;
  // microscope
  slideOnStage: boolean;
  light: boolean;
  mag: 4 | 10 | 40;
  focusErrUm: number;
  stageX: number;
  stageY: number;
  focusedLow: boolean;
  usedFineAtHigh: boolean;
  seen: string[];
  fieldsVisited: number;
  // identification
  iodineDone: boolean;
  checklist: Record<string, "present" | "absent"> | null;
  compared: boolean;
  identity: string | null;
  evidence: string[];
}

export type CloveAction =
  | { type: "inspect"; id: string }
  | { type: "chooseSample"; id: string }
  | { type: "cleanSlide" }
  | { type: "powder"; amount: "small" | "large" }
  | { type: "mountant"; id: string }
  | { type: "warm"; how: "gentle" | "boiled" }
  | { type: "coverslip"; method: "angled" | "dropped" }
  | { type: "blot" }
  | { type: "placeSlide" }
  | { type: "light"; on: boolean }
  | { type: "objective"; mag: 4 | 10 | 40 }
  | { type: "coarse"; dir: 1 | -1 }
  | { type: "fine"; dir: 1 | -1 }
  | { type: "stage"; dx: number; dy: number }
  | { type: "centre" }
  | { type: "remount" }
  | { type: "iodineTest" }
  | { type: "checklist"; answers: Record<string, "present" | "absent"> }
  | { type: "compare" }
  | { type: "identify"; identity: string; evidence: string[] };

export const COARSE_UM = 50;
export const FINE_UM = 1;

export function slideOf(s: CloveState): SlideElement[] {
  return s.powder ? generateSlide(s.seed, CLOVE_ELEMENTS, s.powder) : [];
}

export const cleared = (s: CloveState) => s.mountant === "chloral" && s.warmed !== null;

export function view(s: CloveState): ScopeView {
  return { mag: s.mag, stageX: s.stageX, stageY: s.stageY, focusErrUm: s.focusErrUm, light: s.light, slideOn: s.slideOnStage };
}

/**
 * Elements a poor mount hides: a heaped mount buries two thirds of them, a coverslip
 * dropped flat traps air over a quarter. One rule, used by the engine (what counts as
 * seen) AND the eyepiece (what is drawn hidden), so the two can never disagree.
 */
export function obscured(s: CloveState, e: SlideElement): boolean {
  return s.powder === "large" ? e.id % 3 !== 0 : s.coverslip === "dropped" ? e.id % 4 === 0 : false;
}

/** Recognisable elements now. */
export function visibleNow(s: CloveState): SlideElement[] {
  return recognisable(view(s), slideOf(s), cleared(s), CLOVE_ELEMENTS).filter((e) => !obscured(s, e));
}

function withSeen(st: CloveState): CloveState {
  const types = new Set(st.seen);
  for (const e of visibleNow(st)) types.add(e.type);
  return types.size === st.seen.length ? st : { ...st, seen: Array.from(types) };
}

const initial = (seed: number): CloveState => ({
  seed,
  inspected: [],
  sample: null,
  slideCleaned: false,
  powder: null,
  mountant: null,
  warmed: null,
  coverslip: null,
  blotted: false,
  slideOnStage: false,
  light: false,
  mag: 4,
  focusErrUm: 600,
  stageX: 0,
  stageY: 0,
  focusedLow: false,
  usedFineAtHigh: false,
  seen: [],
  fieldsVisited: 0,
  iodineDone: false,
  checklist: null,
  compared: false,
  identity: null,
  evidence: [],
});

function apply(s: CloveState, a: CloveAction): { state: CloveState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<CloveState>, ...fb: Feedback[]) => ({ state: withSeen({ ...s, ...patch }), feedback: fb });
  const mountReady = s.coverslip !== null;

  switch (a.type) {
    case "inspect":
      return s.inspected.includes(a.id) ? same() : next({ inspected: [...s.inspected, a.id] });

    case "chooseSample": {
      const j = SAMPLE_JARS.find((x) => x.id === a.id);
      if (!j) return same();
      if (!j.correct) return same(mistake(`sample-${j.id}`, 4, `${j.name}: wrong jar.`, (j as { why: string }).why));
      return next({ sample: j.id }, ok("Clove powder selected. Dark brown, strongly aromatic."));
    }

    case "cleanSlide":
      return next({ slideCleaned: true }, ok("Slide and coverslip wiped clean and grease-free."));

    case "powder": {
      if (!s.sample) return same(refuse("Choose the sample first."));
      if (s.powder) return same(info("Powder is already on the slide."));
      const fb: Feedback[] = [];
      if (!s.slideCleaned) fb.push(mistake("dirty-slide", 2, "Powder placed on an unwiped slide.", "Grease and dust on the slide show up as artefacts and stop the mountant spreading evenly."));
      if (a.amount === "large") fb.push(mistake("too-much-powder", 6, "A heaped spatula of powder.", "Too much powder makes a thick, crowded mount: elements overlap, light cannot pass, and most features cannot be recognised. Use as much as covers the tip of a needle or small spatula."));
      return next({ powder: a.amount }, ...fb, info("Powder placed at the centre of the slide."));
    }

    case "mountant": {
      if (!s.powder) return same(refuse("Put a small amount of powder on the slide first."));
      if (s.mountant) return same(info("The mountant is already added."));
      const m = MOUNTANTS.find((x) => x.id === a.id);
      if (!m) return same();
      const fb: Feedback[] = m.correct ? [ok(m.why)] : [mistake(`mountant-${m.id}`, 6, `${m.name} used as the mountant.`, m.why)];
      return next({ mountant: m.id }, ...fb);
    }

    case "warm": {
      if (!s.mountant) return same(refuse("Add the mountant first."));
      if (s.warmed) return same(info("Already warmed."));
      if (a.how === "boiled") return next({ warmed: "boiled" }, mistake("boiled", 4, "The mount was boiled over the flame.", "Boiling drives off the mountant, leaves air bubbles and can crack the slide. Warm gently, just until the first bubbles appear, then let it cool."));
      return next({ warmed: "gentle" }, ok(s.mountant === "chloral" ? "Warmed gently: the powder is clearing." : "Warmed gently."));
    }

    case "coverslip": {
      if (!s.mountant) return same(refuse("Add the mountant before the coverslip."));
      if (s.coverslip) return same(info("The coverslip is on."));
      if (a.method === "dropped") return next({ coverslip: "dropped" }, mistake("bubbles", 4, "Coverslip dropped flat onto the drop.", "Dropping it flat traps air bubbles: their thick black rims are artefacts that hide what is beneath. Lower it from one edge at 45° with a needle."));
      return next({ coverslip: "angled" }, ok("Coverslip lowered from one edge at 45° — no air bubbles."));
    }

    case "blot":
      if (!mountReady) return same(refuse("Put the coverslip on first."));
      return next({ blotted: true }, ok("Excess mountant blotted from the edges."));

    case "placeSlide": {
      if (!mountReady) return same(refuse("Finish preparing the slide (powder, mountant, coverslip) first."));
      if (s.slideOnStage) return same(info("The slide is on the stage."));
      const fb: Feedback[] = [];
      if (!s.blotted) fb.push(mistake("not-blotted", 2, "Slide placed with mountant running from under the coverslip.", "Excess chloral hydrate wets the stage and can reach the objective lens. Blot the edges first."));
      return next({ slideOnStage: true, mag: 4 }, ...fb, ok("Slide clipped on the stage, specimen over the aperture."));
    }

    case "light":
      return next({ light: a.on });

    case "objective": {
      if (![4, 10, 40].includes(a.mag)) return same();
      const fb: Feedback[] = [];
      if (a.mag === 40 && !s.focusedLow) fb.push(mistake("high-first", 4, "Turned to 40× before focusing at low power.", "Always find and focus the specimen at low power first. The high-power objective has a working distance of well under a millimetre — focusing it blindly risks driving it into the slide."));
      return next({ mag: a.mag }, ...fb, info(`${a.mag}× objective (total ${totalMagnification(a.mag)}×, field ${(fieldOfViewUm(a.mag) / 1000).toFixed(2)} mm).`));
    }

    case "coarse": {
      if (!s.slideOnStage) return same(refuse("Place the slide on the stage first."));
      const fb: Feedback[] = [];
      if (s.mag === 40) fb.push(mistake("coarse-high", 6, "Coarse focus used with the 40× objective.", "At high power use the fine focus only. One turn of the coarse knob moves further than the objective's working distance — the lens can crush the coverslip and the slide."));
      const focusErrUm = Math.max(-300, Math.min(1200, s.focusErrUm - a.dir * COARSE_UM));
      const focusedLow = s.focusedLow || (s.mag !== 40 && Math.abs(focusErrUm) <= OBJECTIVES[s.mag].dofUm);
      return next({ focusErrUm, focusedLow }, ...fb);
    }

    case "fine": {
      if (!s.slideOnStage) return same(refuse("Place the slide on the stage first."));
      const focusErrUm = s.focusErrUm - a.dir * FINE_UM;
      const focusedLow = s.focusedLow || (s.mag !== 40 && Math.abs(focusErrUm) <= OBJECTIVES[s.mag].dofUm);
      return next({ focusErrUm, focusedLow, usedFineAtHigh: s.usedFineAtHigh || s.mag === 40 });
    }

    case "stage": {
      if (!s.slideOnStage) return same(refuse("Place the slide on the stage first."));
      if (!Number.isFinite(a.dx) || !Number.isFinite(a.dy) || Math.abs(a.dx) > 1 || Math.abs(a.dy) > 1) return same();
      const step = fieldOfViewUm(s.mag) * 0.6;
      const stageX = Math.max(-2600, Math.min(2600, s.stageX + a.dx * step));
      const stageY = Math.max(-2000, Math.min(2000, s.stageY + a.dy * step));
      return next({ stageX, stageY, fieldsVisited: s.fieldsVisited + 1 });
    }

    case "remount":
      // A poor mount is remade, not worked around: the earlier mistakes stay on the record.
      if (!s.powder) return same(info("There is no mount to replace yet."));
      return next(
        { slideCleaned: false, powder: null, mountant: null, warmed: null, coverslip: null, blotted: false, slideOnStage: false, focusErrUm: 600, mag: 4, stageX: 0, stageY: 0, focusedLow: false },
        info("Slide discarded. Prepare a fresh mount — a needle-tip of powder in chloral hydrate."),
      );

    case "centre":
      if (!s.slideOnStage) return same(refuse("Place the slide on the stage first."));
      return next({ stageX: 0, stageY: 0 }, info("Stage centred under the coverslip."));

    case "iodineTest":
      if (!s.sample) return same(refuse("Choose the sample first."));
      if (s.iodineDone) return same(info("Starch test already done."));
      return next({ iodineDone: true }, ok("Separate mount in N/50 iodine: no blue-black grains — starch is absent."));

    case "checklist": {
      const core = CORE.filter((t) => s.seen.includes(t)).length;
      if (core < 4 || !s.usedFineAtHigh) {
        return same(refuse(`Observe more before deciding: you have recognised ${core} of the 5 main elements, ${s.usedFineAtHigh ? "" : "and have not yet examined at 40× with the fine focus. "}Scan several fields at 10× and 40×.`));
      }
      const missing = REFERENCE_FEATURES.filter((f) => !a.answers[f.id]);
      if (missing.length) return same(refuse("Mark every feature as present or absent."));
      const fb: Feedback[] = [];
      for (const f of REFERENCE_FEATURES) {
        const said = a.answers[f.id];
        if (said === "present" && f.expected === "present" && f.element && !s.seen.includes(f.element)) {
          fb.push(mistake(`unseen-${f.id}`, 3, `"${f.label}" marked present, but you have not observed it yet.`, "Record only what you have seen. Find it in the field before ticking it."));
        } else if (said !== f.expected) {
          fb.push(mistake(`checklist-${f.id}`, 4, `"${f.label}": ${said}?`, f.description));
        }
      }
      return next({ checklist: a.answers }, ...fb, ok("Observations recorded on the checklist."));
    }

    case "compare":
      if (!s.checklist) return same(refuse("Complete the checklist before comparing with the reference."));
      return next({ compared: true }, ok("Compared with the reference description."));

    case "identify": {
      if (!s.compared) return same(refuse("Compare your observations with the reference first."));
      const id = IDENTITY_OPTIONS.find((o) => o.id === a.identity);
      if (!id) return same();
      const ev = a.evidence.filter((e) => REFERENCE_FEATURES.some((f) => f.id === e));
      if (ev.length < 3) return same(refuse("Support the identification with at least three observations."));
      const fb: Feedback[] = [];
      if (!id.correct) return same(mistake("identity", 10, `${id.name} is not supported by your observations.`, "Oil glands, triangular pollen and cluster crystals together, with no starch and few sclereids, identify clove buds."));
      const diagnostic = ev.filter((e) => REFERENCE_FEATURES.find((f) => f.id === e)?.diagnostic);
      if (diagnostic.length < 2) fb.push(mistake("weak-evidence", 3, "Your evidence leans on non-specific features.", "Spiral vessels, fibres and epidermis occur in many plant powders. The oil glands, the triangular pollen and the absence of starch and of many sclereids are what make it clove."));
      return next({ identity: id.id, evidence: ev }, ...fb, ok("Identification submitted: powdered clove."));
    }
  }
}

const STEP_DONE: Record<string, (s: CloveState) => boolean> = {
  inspect: (s) => KEY_ITEMS.every((k) => s.inspected.includes(k)),
  sample: (s) => s.sample === "clove",
  prepare: (s) => s.coverslip !== null && s.blotted,
  setup: (s) => s.slideOnStage && s.light && s.focusedLow,
  observe: (s) => CORE.filter((t) => s.seen.includes(t)).length >= 4 && s.usedFineAtHigh,
  checklist: (s) => s.checklist !== null,
  compare: (s) => s.compared,
  identify: (s) => s.identity !== null,
};

// ── Instruments (2026-10-21): the bench is operated from the equipment, not from step cards ──

const CONTROLLERS: ControllerDef[] = [
  { id: "jars", name: "Sample jars", equipment: ["jars"], actions: ["chooseSample"], brief: "Read the labels and take a sample of the drug the practical names.", howTo: ["Pick a jar up to read its label.", "Take a sample only from the jar the practical sheet asks for."], nearby: ["prep"] },
  { id: "prep", name: "Slide preparation", equipment: ["slides", "needle", "chloral", "lamp", "coverslips", "blotting"], actions: ["cleanSlide", "powder", "mountant", "warm", "coverslip", "blot", "remount", "iodineTest"], brief: "Make a cleared powder mount; the iodine starch test is a separate mount.", howTo: ["Wipe the slide, then a needle-tip of powder and 1–2 drops of mountant.", "Warm gently, lower the coverslip from one edge, blot the edges."], nearby: ["jars", "microscope"] },
  { id: "microscope", name: "Compound microscope", equipment: ["microscope"], actions: ["placeSlide", "light", "objective", "coarse", "fine", "stage", "centre"], brief: "Focus at low power, then examine at 40× with the fine focus.", howTo: ["Slide on, lamp on, 4× or 10× and the coarse knob until particles are crisp.", "At 40× use only the fine knob; move the stage to scan new fields."], nearby: ["prep", "notebook"] },
  { id: "notebook", name: "Lab notebook", equipment: ["notebook"], actions: ["checklist", "compare", "identify"], brief: "Record what you saw, compare it with the reference, then identify the powder.", howTo: ["Mark present only what you have seen in the eyepiece.", "The reference opens once your checklist is recorded."], nearby: ["microscope"] },
];

/**
 * Learning mode: the next correct move. It names an instrument and a control type only —
 * never which jar, which features are present or what the powder is. It reads the slide
 * (`seen`) only through the observe step's own completion rule, so it gives nothing away
 * about what is in the field.
 * Null while the bench is being inspected and for the identification itself, which is the
 * judgement the practical assesses.
 */
function suggest(s: CloveState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  if (!STEP_DONE.inspect(s)) return null; // inspection is finding, not operating
  if (!STEP_DONE.sample(s)) return to("jars", "chooseSample");
  if (!STEP_DONE.prepare(s)) {
    if (!s.powder) return to("prep", s.slideCleaned ? "powder" : "cleanSlide");
    if (!s.mountant) return to("prep", "mountant");
    // a water or iodine mount never clears: the only way on is a fresh slide
    if (s.mountant !== "chloral") return to("prep", "remount");
    if (!s.warmed) return to("prep", "warm");
    if (!s.coverslip) return to("prep", "coverslip");
    return to("prep", "blot");
  }
  const mic = (action: string) => to("microscope", action);
  // the focus pointer follows the image the student can see: coarse while it is a blur,
  // fine once a coarse turn would jump past the focal plane (and always fine at 40×)
  const focusKnob = () => (s.mag === 40 || Math.abs(s.focusErrUm) < COARSE_UM ? "fine" : "coarse");
  // An uncleared mount hides the crystals and the epidermis, so observation cannot be
  // finished on it: warm a chloral mount (allowed under the coverslip), remake any other.
  if (!STEP_DONE.observe(s) && !cleared(s)) return to("prep", s.mountant === "chloral" ? "warm" : "remount");
  if (!STEP_DONE.setup(s)) {
    if (!s.slideOnStage) return mic("placeSlide");
    if (!s.light) return mic("light");
    if (s.mag === 40) return mic("objective"); // back to low power to find the specimen
    return mic(focusKnob());
  }
  if (!STEP_DONE.observe(s)) {
    if (!s.slideOnStage) return mic("placeSlide");
    if (!s.light) return mic("light");
    if (Math.abs(s.focusErrUm) > OBJECTIVES[s.mag].dofUm) return mic(focusKnob());
    if (s.mag === 4) return mic("objective");
    // scan a few fields at 10× for the large elements, then go up for pollen and crystals
    if (s.mag === 10) return mic(s.fieldsVisited < 3 ? "stage" : "objective");
    return mic(s.usedFineAtHigh ? "stage" : "fine");
  }
  if (!s.checklist) return s.iodineDone ? to("notebook", "checklist") : to("prep", "iodineTest");
  if (!s.compared) return to("notebook", "compare");
  return null; // the identification is the student's own conclusion
}

function observations(s: CloveState): ObservationSection[] {
  const names: Record<string, string> = { "oil-gland": "Oil glands in parenchyma", pollen: "Triangular pollen grains", "cluster-crystal": "Cluster crystals", "spiral-vessel": "Spiral vessels", epidermis: "Epidermis with stomata", fibre: "Fibres", sclereid: "Sclereid (occasional)" };
  return [
    {
      title: "Mount",
      rows: [
        { label: "Sample", value: s.sample === "clove" ? "Clove, powdered (PG-07)" : "—", source: "recorded" },
        { label: "Mountant", value: s.mountant ? MOUNTANTS.find((m) => m.id === s.mountant)!.name + (s.warmed ? `, warmed (${s.warmed})` : "") : "—", source: "recorded" },
        { label: "Coverslip", value: s.coverslip ? (s.coverslip === "angled" ? "lowered at 45°, no bubbles" : "dropped — air bubbles") : "—", source: "observed" },
      ],
    },
    {
      title: "Elements recognised (schematic view)",
      rows: s.seen.length ? s.seen.map((t) => ({ label: names[t] ?? t, value: "seen", source: "observed" as const })) : [{ label: "Nothing yet", value: "—", source: "observed" }],
    },
    {
      title: "Identification",
      rows: [
        { label: "Starch test (iodine)", value: s.iodineDone ? "negative — no blue-black grains" : "not done", source: "observed" },
        { label: "Identified as", value: s.identity ? IDENTITY_OPTIONS.find((o) => o.id === s.identity)!.name : "—", source: "recorded" },
        { label: "Evidence", value: s.evidence.length ? s.evidence.map((e) => REFERENCE_FEATURES.find((f) => f.id === e)!.label).join("; ") : "—", source: "recorded" },
      ],
    },
  ];
}

function report(s: CloveState): ExperimentReport {
  const right = s.checklist ? REFERENCE_FEATURES.filter((f) => s.checklist![f.id] === f.expected).length : 0;
  return {
    headline: s.identity === "clove" ? "Identified: powdered clove (Syzygium aromaticum)" : "Not identified",
    calculations: [
      { label: "Fields of view", expression: `eyepiece field number ${18} mm ÷ objective`, result: "4×: 4.50 mm · 10×: 1.80 mm · 40×: 0.45 mm" },
      { label: "Pollen grain size", expression: "about 1/25 of the 40× field (450 µm)", result: "≈ 15–20 µm" },
    ],
    outcome: [
      { label: "Checklist", value: s.checklist ? `${right} of ${REFERENCE_FEATURES.length} correct` : "—", verdict: right === REFERENCE_FEATURES.length ? "pass" : "fail" },
      { label: "Main elements recognised", value: `${CORE.filter((t) => s.seen.includes(t)).length} of 5`, verdict: "info" },
      { label: "Identification", value: s.identity ? IDENTITY_OPTIONS.find((o) => o.id === s.identity)!.name : "—", verdict: s.identity === "clove" ? "pass" : "fail" },
    ],
    learning: [
      "Identify a powder from a combination of elements — no single one is enough — and from what is absent as well as what is present.",
      "Numerous sclereids and prism crystals point to clove stalks; starch points to mother cloves.",
      "The view in this lab is a schematic illustration drawn from the reference description. Practise on real mounts and reference slides as well.",
    ],
  };
}

export const CLOVE: ExperimentDefinition<CloveState, CloveAction> = {
  meta: LABS["powdered-clove"],
  principle: [
    "Clove is the dried flower bud of Syzygium aromaticum. Powdered crude drugs are identified microscopically by their characteristic elements — cell types, cell contents, crystals, pollen — and by the absence of elements that would indicate an adulterant.",
    "Chloral hydrate is the usual mountant for a general examination: when warmed it clears the tissue, so crystals, glands and stomata are visible. Starch is tested separately with iodine.",
    "Start at low power to find and focus the specimen; switch to high power and use only the fine focus. Field of view = eyepiece field number ÷ objective magnification (18 mm ÷ 40 = 0.45 mm), which lets you estimate sizes.",
    "The microscope image in this lab is a SCHEMATIC ILLUSTRATION drawn from the reference description, not a photomicrograph. Element sizes are to scale; their appearance is simplified.",
  ],
  safety: [
    "Chloral hydrate is harmful if swallowed and irritates skin and eyes: gloves, no mouth contact, wipe spills.",
    "Warm slides gently over a low flame or on a hot plate, holding them with a slide holder; never point a warming slide at anyone.",
    "Carry the microscope with two hands — one on the arm, one under the base. Clean any mountant from the objectives with lens tissue.",
  ],
  equipment: [
    { id: "microscope", name: "Compound microscope", description: "Bright-field microscope with 4×, 10× and 40× objectives and a 10× eyepiece.", use: "Examines the cleared powder mount.", spec: "Eyepiece 10×, field number 18 mm; objectives 4× (NA 0.10), 10× (0.25), 40× (0.65)" },
    { id: "slides", name: "Microscope slides", description: "Clean glass slides, 76 × 26 mm.", use: "Carry the mount." },
    { id: "coverslips", name: "Coverslips", description: "Thin glass squares, 22 × 22 mm.", use: "Lowered at 45° onto the mount to exclude air." },
    { id: "chloral", name: "Reagent bottles with droppers", description: "Chloral hydrate solution, water and N/50 iodine.", use: "Chloral hydrate clears the mount; iodine tests for starch.", safety: "Chloral hydrate is harmful — gloves." },
    { id: "jars", name: "Crude-drug sample jars", description: "Labelled jars of powdered crude drugs.", use: "Choose the correctly labelled clove powder." },
    { id: "lamp", name: "Spirit lamp", description: "Small flame for warming slides.", use: "Warms the chloral hydrate mount gently to clear it.", safety: "Open flame." },
    { id: "needle", name: "Mounted needle and spatula", description: "Tools for taking a small amount of powder and lowering the coverslip.", use: "A needle-tip of powder; lowering the coverslip at 45°." },
    { id: "blotting", name: "Blotting paper", description: "Absorbent paper strips.", use: "Removes excess mountant from the coverslip edges." },
    { id: "notebook", name: "Lab notebook", description: "The powder-microscopy record sheet, with the reference description of powdered clove.", use: "The feature checklist, the comparison with the reference and the identification are recorded here." },
  ],
  materials: [
    { id: "clove", name: "Clove, powdered (jar PG-07)", detail: "Dried flower buds of Syzygium aromaticum, dark brown, strongly aromatic" },
    { id: "chloral", name: "Chloral hydrate solution", detail: "Clearing agent", hazard: "Harmful if swallowed; irritant." },
    { id: "iodine", name: "Iodine solution N/50", detail: "Starch test" },
  ],
  steps: [
    { id: "inspect", title: "Inspect the bench", objective: "Inspect the microscope, slides, coverslips, reagents, sample jars, spirit lamp, needle and blotting paper.", hints: ["Select each item to read about it."], focus: [...KEY_ITEMS] },
    { id: "sample", title: "Select the sample", objective: "Take the correctly labelled jar of powdered clove.", hints: ["Read every label: two jars are clove-related."], focus: ["jars"] },
    { id: "prepare", title: "Prepare the slide", objective: "Clean slide → a little powder → chloral hydrate → warm gently → coverslip at 45° → blot.", hints: ["As much powder as covers a needle tip.", "Lower the coverslip from one edge to keep air out."], focus: ["slides", "needle", "chloral", "lamp", "coverslips", "blotting"], safety: "Chloral hydrate is harmful; warm gently." },
    { id: "setup", title: "Set up the microscope", objective: "Place the slide on the stage, switch on the light, and focus at low power.", hints: ["Start with the 4× or 10× objective and the coarse focus.", "The image is sharp when the edges of particles are crisp."], focus: ["microscope"] },
    { id: "observe", title: "Observe", objective: "Scan several fields at 10× and 40× (fine focus only) and find at least four of the five main elements.", hints: ["Oil glands are large — look at 10×. Pollen and crystals are small — use 40×.", "Move the stage to new fields; focus with the fine knob at 40×."], focus: ["microscope"] },
    { id: "checklist", title: "Record the features", objective: "Mark each feature on the checklist in the lab notebook as present or absent.", hints: ["Mark only what you have seen as present.", "The iodine test (a separate mount, at the slide-preparation station) settles whether starch is present."], focus: ["notebook"] },
    { id: "compare", title: "Compare with the reference", objective: "Compare your observations with the reference description.", hints: ["The reference description is in the lab notebook, under your recorded checklist."], focus: ["notebook"] },
    { id: "identify", title: "Identify", objective: "Name the drug and choose the observations that support it.", hints: ["Use diagnostic features, including what is absent."], focus: ["notebook"] },
  ],
  questions: [
    { id: "q1", kind: "viva", prompt: "Which pair of elements is most characteristic of powdered clove?", options: ["Starch grains and cork", "Oil glands in parenchyma and triangular pollen grains", "Stone cells and prism crystals", "Covering trichomes and starch"], answer: 1, explanation: "The schizogenous oil glands and the small triangular pollen grains are the hallmark of clove buds." },
    { id: "q2", kind: "interpretation", prompt: "A clove powder shows many sclereids and prism crystals. It is probably adulterated with…", options: ["Mother cloves", "Clove stalks", "Cinnamon", "Pepper"], answer: 1, explanation: "Clove stalks contain numerous sclereids and prism crystals of calcium oxalate." },
    { id: "q3", kind: "interpretation", prompt: "Starch grains in a clove powder suggest…", options: ["Mother cloves (the fruits)", "Clove stalks", "Correct clearing", "Genuine clove buds"], answer: 0, explanation: "Clove buds have no starch; mother cloves do." },
    { id: "q4", kind: "design", prompt: "Why is chloral hydrate used as the mountant?", options: ["It stains starch blue", "It clears the tissue so crystals and cell structures are visible", "It preserves the slide for years", "It is the cheapest reagent"], answer: 1, explanation: "Chloral hydrate dissolves cell contents and starch and swells walls, clearing the mount." },
    { id: "q5", kind: "design", prompt: "Why is the coverslip lowered at an angle?", options: ["To spread the powder", "To exclude air bubbles", "To heat the mount", "To stop the slide sliding"], answer: 1, explanation: "Lowering from one edge pushes air out ahead of the liquid." },
    { id: "q6", kind: "calculation", prompt: "With a 10× eyepiece (field number 18 mm) and a 40× objective, the field of view is…", options: ["4.5 mm", "1.8 mm", "0.45 mm", "0.18 mm"], answer: 2, explanation: "18 mm ÷ 40 = 0.45 mm (450 µm)." },
    { id: "q7", kind: "viva", prompt: "At high power you should focus with…", options: ["The coarse knob", "The fine knob only", "The condenser", "The stage clips"], answer: 1, explanation: "The 40× objective's working distance is very small; the coarse knob risks crushing the slide." },
  ],
  initial,
  apply,
  controllers: CONTROLLERS,
  suggest,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

export function cloveVisual(s: CloveState) {
  return {
    sample: s.sample,
    slideStage: s.coverslip ? 3 : s.mountant ? 2 : s.powder ? 1 : s.slideCleaned ? 0.5 : 0,
    onStage: s.slideOnStage,
    light: s.light,
    mag: s.mag,
    focus: s.focusErrUm,
    stageX: s.stageX,
    stageY: s.stageY,
  };
}
