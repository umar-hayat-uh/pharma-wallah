/**
 * The Pharmaceutics room's shared bench mechanics (2026-10-25): the three cabinets
 * equipment is retrieved from and returned to, the sink and tap, and the segregated
 * waste station. Every shortlisted Pharmaceutics experiment embeds a `BenchCommon` in
 * its state and routes these actions through `commonKit(cfg).apply` before its own.
 *
 * PURE (no React, no renderer), like the rest of the engine. What it enforces:
 *  - an item must be retrieved before the experiment may use it (`need()`), and only
 *    from the cabinet it lives in, with that cabinet open;
 *  - the tap must be running to rinse, and only retrieved items can be rinsed;
 *  - waste goes only to its correct stream. A wrong stream is REFUSED (the waste stays
 *    pending) and recorded as a technique mistake; a hazardous waste offered to the sink
 *    is refused with a heavier mistake. Nothing hazardous is ever accepted by the sink,
 *    the sink takes nothing while the tap is off, and dilution is never a route to it.
 *
 * Streams follow the NIH Drain Discharge Guide and Waste Disposal Guide ("any
 * pharmaceutical waste must be handled as chemical waste"); ethanol is never sink waste at
 * any strength here — stricter than some rules, on purpose (we teach the strictest).
 * Sources and the review: docs/virtual-labs/PHARMACEUTICS_REFERENCE_DATA.md.
 */
import type { ControllerDef, EquipmentDef, Feedback } from "../../engine/types";
import { info, mistake, ok, refuse } from "../../engine/machine";

export type CabinetId = "cabinet-glass" | "cabinet-instruments" | "cabinet-reagents";
/** `sink` is only for water and wastes explicitly classified as safe to rinse away. */
export type WasteStream = "sink" | "aqueous" | "organic" | "chemical-solid" | "solid" | "glass";

export const CABINETS: { id: CabinetId; name: string }[] = [
  { id: "cabinet-glass", name: "Glassware cupboard" },
  { id: "cabinet-instruments", name: "Apparatus cabinet" },
  { id: "cabinet-reagents", name: "Reagent cabinet" },
];

export const WASTE_STREAMS: { id: WasteStream; name: string; detail: string }[] = [
  { id: "sink", name: "Sink (with running water)", detail: "Only water and drug-free solutions the procedure names as sink-safe (e.g. sodium chloride, sucrose, plain phosphate buffer). Diluting something never makes it sink-safe." },
  { id: "aqueous", name: "Aqueous chemical waste", detail: "Labelled container for aqueous solutions containing a drug or reagent, and glycerol–water mixtures." },
  { id: "organic", name: "Non-halogenated organic waste", detail: "Labelled solvent container (e.g. ethanol at any strength). Never the sink." },
  { id: "chemical-solid", name: "Chemical / pharmaceutical solid waste", detail: "Drug powder, drug-bearing filters, weighing boats and dried residues." },
  { id: "solid", name: "Non-hazardous solid waste", detail: "Clean weighing boats and papers, tissues, used gloves — nothing carrying a drug." },
  { id: "glass", name: "Broken glass & sharps", detail: "Capillaries, Pasteur pipettes, broken glassware, needles." },
];

export interface StoredItem {
  id: string; // an equipment id of the experiment
  name: string;
  cabinet: CabinetId;
}

export interface WasteItem {
  id: string;
  name: string;
  /** The ONE correct stream. */
  stream: WasteStream;
  /** Why that stream — shown after a wrong choice and in Learning. */
  why: string;
  /** True when the material must never reach a drain (drives the heavier sink mistake). */
  hazardous: boolean;
  /** Over-cautious streams also accepted (e.g. NaCl solution into the aqueous container) — with a note, no mistake. */
  alsoOk?: WasteStream[];
}

export interface CommonConfig {
  stored: StoredItem[];
  waste: WasteItem[];
}

export interface BenchCommon {
  open: CabinetId | null;
  /** Retrieved items now on the bench. */
  out: string[];
  tap: boolean;
  rinsed: string[];
  /** Waste ids the experiment has produced and not yet disposed of. */
  pending: string[];
  disposed: { id: string; stream: WasteStream }[];
}

export type CommonAction =
  | { type: "cabinet"; cabinet: CabinetId; open: boolean }
  | { type: "retrieve"; item: string }
  | { type: "return"; item: string }
  | { type: "tap"; on: boolean }
  | { type: "rinse"; item: string }
  | { type: "dispose"; waste: string; stream: WasteStream };

export const COMMON_ACTION_TYPES = ["cabinet", "retrieve", "return", "tap", "rinse", "dispose"] as const;

export function isCommonAction(a: { type: string }): a is CommonAction {
  return (COMMON_ACTION_TYPES as readonly string[]).includes(a.type);
}

/** What the room draws for the shared fixtures. */
export interface CommonVisual {
  open: CabinetId | null;
  out: string[];
  tap: boolean;
  /** Item being rinsed right now (the last rinse), for the water-over-glass animation. */
  rinsing: string | null;
  /** Items disposed per stream — bins show a fill level. */
  waste: Record<WasteStream, number>;
}

export function commonKit(cfg: CommonConfig) {
  const storedById = new Map(cfg.stored.map((x) => [x.id, x]));
  const wasteById = new Map(cfg.waste.map((x) => [x.id, x]));
  const cabinetName = (c: CabinetId) => CABINETS.find((x) => x.id === c)?.name ?? "cabinet";

  const initial = (): BenchCommon => ({ open: null, out: [], tap: false, rinsed: [], pending: [], disposed: [] });

  /**
   * Apply a shared action, or return null when the action is not one of ours.
   * `inUse(item)` lets the experiment veto returning something still holding material.
   */
  function apply(
    b: BenchCommon,
    a: CommonAction,
    ctx: { inUse?(item: string): boolean } = {},
  ): { bench: BenchCommon; feedback: Feedback[]; changed: boolean } {
    const same = (fb: Feedback[]) => ({ bench: b, feedback: fb, changed: false });
    switch (a.type) {
      case "cabinet": {
        if (!CABINETS.some((x) => x.id === a.cabinet)) return same([refuse("There is no such cabinet in this lab.")]);
        if (a.open) {
          if (b.open === a.cabinet) return same([refuse(`The ${cabinetName(a.cabinet)} is already open.`)]);
          return { bench: { ...b, open: a.cabinet }, feedback: [ok(`${cabinetName(a.cabinet)} open.`)], changed: true };
        }
        if (b.open !== a.cabinet) return same([refuse(`The ${cabinetName(a.cabinet)} is already closed.`)]);
        return { bench: { ...b, open: null }, feedback: [ok(`${cabinetName(a.cabinet)} closed.`)], changed: true };
      }
      case "retrieve": {
        const it = storedById.get(a.item);
        if (!it) return same([refuse("That item is not stored in this lab's cabinets.")]);
        if (b.out.includes(it.id)) return same([refuse(`The ${it.name} is already on the bench.`)]);
        if (b.open !== it.cabinet) return same([refuse(`Open the ${cabinetName(it.cabinet)} first — the ${it.name} is kept there.`)]);
        return { bench: { ...b, out: [...b.out, it.id] }, feedback: [ok(`${it.name} taken to its place on the bench.`)], changed: true };
      }
      case "return": {
        const it = storedById.get(a.item);
        if (!it || !b.out.includes(it.id)) return same([refuse("That item is not out on the bench.")]);
        if (ctx.inUse?.(it.id)) return same([refuse(`The ${it.name} still holds material — empty and dispose of it first.`)]);
        if (b.open !== it.cabinet) return same([refuse(`Open the ${cabinetName(it.cabinet)} to put the ${it.name} away.`)]);
        return { bench: { ...b, out: b.out.filter((x) => x !== it.id) }, feedback: [ok(`${it.name} returned to the ${cabinetName(it.cabinet)}.`)], changed: true };
      }
      case "tap": {
        if (b.tap === a.on) return same([refuse(a.on ? "The tap is already running." : "The tap is already off.")]);
        return { bench: { ...b, tap: a.on }, feedback: [ok(a.on ? "Tap on." : "Tap off.")], changed: true };
      }
      case "rinse": {
        const it = storedById.get(a.item);
        if (!it || !b.out.includes(it.id)) return same([refuse("Take the item out of its cabinet before rinsing it.")]);
        if (!b.tap) return same([refuse("Turn the tap on to rinse.")]);
        return {
          bench: { ...b, rinsed: b.rinsed.includes(it.id) ? b.rinsed : [...b.rinsed, it.id] },
          feedback: [ok(`${it.name} rinsed with tap water, then with purified water.`)],
          changed: true,
        };
      }
      case "dispose": {
        const w = wasteById.get(a.waste);
        if (!w || !b.pending.includes(w.id)) return same([refuse("There is nothing of that to dispose of yet.")]);
        if (a.stream === "sink" && w.stream === "sink" && !b.tap) {
          return same([refuse("Turn the tap on first — sink-safe waste goes down with plenty of running water.")]);
        }
        if (a.stream !== w.stream && w.alsoOk?.includes(a.stream)) {
          const best = WASTE_STREAMS.find((s) => s.id === w.stream)!.name;
          return {
            bench: { ...b, pending: b.pending.filter((x) => x !== w.id), disposed: [...b.disposed, { id: w.id, stream: a.stream }] },
            feedback: [info(`Accepted — safe, if more cautious than needed. ${w.name} may go to: ${best}. ${w.why}`)],
            changed: true,
          };
        }
        if (a.stream !== w.stream) {
          const target = WASTE_STREAMS.find((s) => s.id === w.stream)!.name;
          if (a.stream === "sink" && w.hazardous) {
            return same([
              mistake("waste-hazard-to-sink", 8, `Tried to pour ${w.name} down the sink.`, `Refused: ${w.name} must never reach a drain. It goes to: ${target}. ${w.why}`),
            ]);
          }
          return same([mistake("waste-wrong-stream", 4, `Offered ${w.name} to the wrong waste stream.`, `Refused — it belongs in: ${target}. ${w.why}`)]);
        }
        return {
          bench: { ...b, pending: b.pending.filter((x) => x !== w.id), disposed: [...b.disposed, { id: w.id, stream: w.stream }] },
          feedback: [ok(`${w.name} → ${WASTE_STREAMS.find((s) => s.id === w.stream)!.name}.`)],
          changed: true,
        };
      }
    }
  }

  /** Precondition for the experiment's own actions: null when every item is on the bench. */
  function need(b: BenchCommon, ...items: string[]): Feedback | null {
    for (const id of items) {
      const it = storedById.get(id);
      if (it && !b.out.includes(id)) return refuse(`Get the ${it.name} from the ${cabinetName(it.cabinet)} first.`);
    }
    return null;
  }

  /** Mark waste as produced (idempotent): it must then be disposed of before the bench is complete. */
  function produce(b: BenchCommon, ...ids: string[]): BenchCommon {
    const add = ids.filter((id) => wasteById.has(id) && !b.pending.includes(id) && !b.disposed.some((d) => d.id === id));
    return add.length ? { ...b, pending: [...b.pending, ...add] } : b;
  }

  const allDisposed = (b: BenchCommon) => b.pending.length === 0;

  function visual(b: BenchCommon, lastRinse: string | null = null): CommonVisual {
    const waste = { sink: 0, aqueous: 0, organic: 0, "chemical-solid": 0, solid: 0, glass: 0 } as Record<WasteStream, number>;
    for (const d of b.disposed) waste[d.stream] += 1;
    return { open: b.open, out: b.out, tap: b.tap, rinsing: b.tap ? lastRinse : null, waste };
  }

  /** Controllers for the fixtures. Merge into the experiment's own `controllers`. */
  const controllers: ControllerDef[] = [
    ...CABINETS.filter((c) => cfg.stored.some((s) => s.cabinet === c.id)).map((c) => ({
      id: c.id,
      name: c.name,
      equipment: [c.id],
      actions: ["cabinet", "retrieve", "return"],
      // each cabinet operates only its own door and its own contents
      accepts: (x: unknown) => {
        const a = x as CommonAction;
        if (a.type === "cabinet") return a.cabinet === c.id;
        if (a.type === "retrieve" || a.type === "return") return storedById.get(a.item)?.cabinet === c.id;
        return false;
      },
      brief: "Open it, take out what the procedure needs, and put each item back when you are done.",
      howTo: ["Open the door.", "Take out an item — it goes to its place on the bench.", "Return items before you finish."],
    })),
    {
      id: "sink",
      name: "Sink and tap",
      equipment: ["sink"],
      actions: ["tap", "rinse"],
      brief: "Rinse glassware here with tap water, then purified water. Only sink-safe aqueous waste goes down the drain.",
      howTo: ["Turn the tap on.", "Rinse the item.", "Turn the tap off."],
    },
    {
      id: "waste-station",
      name: "Waste station",
      equipment: ["waste-station"],
      actions: ["dispose"],
      brief: "Segregated, labelled containers. Choose the right one for each waste.",
      howTo: ["Pick the waste.", "Choose the container it belongs in."],
    },
  ];

  const equipment: EquipmentDef[] = [
    ...CABINETS.filter((c) => cfg.stored.some((s) => s.cabinet === c.id)).map((c) => ({
      id: c.id,
      name: c.name,
      description: `Storage: ${cfg.stored.filter((s) => s.cabinet === c.id).map((s) => s.name).join(", ")}.`,
      use: "Retrieve and return apparatus.",
    })),
    { id: "sink", name: "Sink and tap", description: "Laboratory sink with a swan-neck tap.", use: "Rinsing glassware; sink-safe aqueous waste only." },
    { id: "waste-station", name: "Segregated waste station", description: WASTE_STREAMS.filter((s) => s.id !== "sink").map((s) => s.name).join(" · "), use: "Disposing of each waste in its own container." },
  ];

  return { cfg, initial, apply, need, produce, allDisposed, visual, controllers, equipment, storedById, wasteById };
}
