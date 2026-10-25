"use client";

/**
 * The Pharmaceutics room's shared instrument panels (2026-10-25): each cabinet, the sink
 * and tap, and the segregated waste station. Opened, like every controller, only by
 * selecting the fixture in the room. Every button dispatches a `CommonAction`; the rules
 * (what must be open, what may go where) live in experiments/pharmaceutics/common.ts.
 *
 * Usage in an experiment's controls map:
 *   ...commonControls<MyState, MyAction>(KIT, (s) => s.bench)
 */
import type { ComponentType } from "react";
import { CABINETS, WASTE_STREAMS, type BenchCommon, type CabinetId, type CommonAction, type commonKit } from "@/lib/virtual-labs/experiments/pharmaceutics/common";
import { ActBtn, Group, Hl } from "../../interface/controls";
import type { BenchProps } from "../types";

type Kit = ReturnType<typeof commonKit>;

export function commonControls<S, A extends { type: string }>(kit: Kit, bench: (s: S) => BenchCommon): Record<string, ComponentType<BenchProps<S, A>>> {
  const out: Record<string, ComponentType<BenchProps<S, A>>> = {};
  const act = (p: BenchProps<S, A>) => (a: CommonAction) => p.act(a as unknown as A);

  for (const c of CABINETS) {
    const items = kit.cfg.stored.filter((x) => x.cabinet === c.id);
    if (!items.length) continue;
    const Cabinet = (p: BenchProps<S, A>) => {
      const b = bench(p.s);
      const open = b.open === c.id;
      const a = act(p);
      return (
        <div className="space-y-3">
          <Hl type="cabinet">
            <ActBtn act={a} a={{ type: "cabinet", cabinet: c.id as CabinetId, open: !open }} variant={open ? "soft" : "primary"}>
              {open ? `Close the ${c.name.toLowerCase()}` : `Open the ${c.name.toLowerCase()}`}
            </ActBtn>
          </Hl>
          <Group title={open ? "Inside" : "Contents (open the door to reach them)"}>
            <ul className="space-y-1.5">
              {items.map((it) => {
                const isOut = b.out.includes(it.id);
                return (
                  <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#16181d]/10 px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="font-semibold">{it.name}</span>
                      <span className="ml-1 text-xs text-[#4a4f57]">{isOut ? "· on the bench" : "· in the cabinet"}</span>
                    </span>
                    {isOut ? (
                      <Hl type="return">
                        <ActBtn act={a} a={{ type: "return", item: it.id }} disabled={!open}>Put back</ActBtn>
                      </Hl>
                    ) : (
                      <Hl type="retrieve">
                        <ActBtn act={a} a={{ type: "retrieve", item: it.id }} disabled={!open} variant="primary">Take out</ActBtn>
                      </Hl>
                    )}
                  </li>
                );
              })}
            </ul>
          </Group>
        </div>
      );
    };
    out[c.id] = Cabinet;
  }

  out["sink"] = function Sink(p: BenchProps<S, A>) {
    const b = bench(p.s);
    const a = act(p);
    const rinsable = kit.cfg.stored.filter((it) => b.out.includes(it.id));
    return (
      <div className="space-y-3">
        <Hl type="tap">
          <ActBtn act={a} a={{ type: "tap", on: !b.tap }} variant={b.tap ? "soft" : "secondary"}>{b.tap ? "Turn the tap off" : "Turn the tap on"}</ActBtn>
        </Hl>
        <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm" aria-live="polite">{b.tap ? "Water running." : "Tap off."}</p>
        <Group title="Rinse" note="Tap water, then a final rinse with purified water.">
          {rinsable.length === 0 ? (
            <p className="text-sm text-[#4a4f57]">Nothing on the bench to rinse yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {rinsable.map((it) => (
                <Hl key={it.id} type="rinse">
                  <ActBtn act={a} a={{ type: "rinse", item: it.id }} disabled={!b.tap}>
                    {b.rinsed.includes(it.id) ? `✓ ${it.name}` : `Rinse the ${it.name.toLowerCase()}`}
                  </ActBtn>
                </Hl>
              ))}
            </div>
          )}
        </Group>
        <p className="text-xs text-amber-800">Only water and wastes the procedure names as sink-safe go down the drain. Everything else goes to the waste station.</p>
      </div>
    );
  };

  out["waste-station"] = function Waste(p: BenchProps<S, A>) {
    const b = bench(p.s);
    const a = act(p);
    const pending = b.pending.map((id) => kit.wasteById.get(id)!).filter(Boolean);
    return (
      <div className="space-y-3">
        {pending.length === 0 ? (
          <p className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm">No waste waiting. {b.disposed.length ? `${b.disposed.length} disposed of correctly.` : ""}</p>
        ) : (
          pending.map((w) => (
            <Group key={w.id} title={w.name}>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {WASTE_STREAMS.map((st) => (
                  <Hl key={st.id} type="dispose">
                    <ActBtn act={a} a={{ type: "dispose", waste: w.id, stream: st.id }} className="w-full justify-start text-left" title={st.detail}>
                      {st.name}
                    </ActBtn>
                  </Hl>
                ))}
              </div>
            </Group>
          ))
        )}
      </div>
    );
  };

  return out;
}
