"use client";

/**
 * Building blocks for instrument controllers (2026-10-21 upgrade).
 *
 * A controller is the control set a student gets by selecting one instrument in the
 * room. Its buttons are `ActBtn`s: each one performs exactly one engine action, and in
 * Learning mode the control that makes the next correct move is ringed ("try this") —
 * the demonstration the brief asks for, without ever pressing it for the student.
 * Practical mode never rings anything.
 */
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type { LabMode } from "@/lib/virtual-labs/engine/types";
import { Btn } from "./ui";

interface ControlCtx {
  mode: LabMode;
  /** The action type Learning mode suggests next, if it belongs to the open instrument. */
  suggested: string | null;
}

const Ctx = createContext<ControlCtx>({ mode: "practical", suggested: null });

export function ControlProvider({ mode, suggested, children }: ControlCtx & { children: ReactNode }) {
  return <Ctx.Provider value={{ mode, suggested: mode === "learning" ? suggested : null }}>{children}</Ctx.Provider>;
}

export const useControlMode = () => useContext(Ctx).mode;

const RING = "ring-2 ring-brandGreen ring-offset-2 ring-offset-white";

/** True when Learning mode is pointing at this action type. */
export function useSuggested(type: string | string[]) {
  const { suggested } = useContext(Ctx);
  if (!suggested) return false;
  return Array.isArray(type) ? type.includes(suggested) : type === suggested;
}

/** A button that performs one action. `a.type` decides whether Learning mode rings it. */
export function ActBtn<A extends { type: string }>({ a, act, children, variant = "secondary", disabled, className = "", title }: { a: A; act(a: A): void; children: ReactNode; variant?: "primary" | "secondary" | "soft" | "danger"; disabled?: boolean; className?: string; title?: string }) {
  const on = useSuggested(a.type);
  return (
    <Btn size="sm" variant={variant} disabled={disabled} title={title} onClick={() => act(a)} className={`relative ${on ? RING : ""} ${className}`}>
      {children}
      {on && <TryThis />}
    </Btn>
  );
}

/** Rings any block (a reading field, a form) when Learning mode points at one of its actions. */
export function Hl({ type, children }: { type: string | string[]; children: ReactNode }) {
  const on = useSuggested(Array.isArray(type) ? type : [type]);
  return <div className={`rounded-xl transition ${on ? `${RING} p-2` : ""}`}>{children}{on && <p className="mt-1 text-xs font-semibold text-[#137a52]">Next: this one.</p>}</div>;
}

/** A corner dot (no layout shift) plus a screen-reader word. */
function TryThis() {
  return (
    <>
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brandGreen" aria-hidden />
      <span className="sr-only"> (suggested next)</span>
    </>
  );
}

/** A labelled group of controls inside a controller. */
export function Group({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4a4f57]">{title}</h3>
      {children}
      {note && <p className="text-xs text-[#4a4f57]">{note}</p>}
    </section>
  );
}

/**
 * A press-and-hold control — a burette stopcock, a pump. Fires `onTick` immediately and
 * then every `every` ms while held; releasing (or the pointer leaving) closes it. Space /
 * Enter add one tick per press, so it works from a keyboard.
 */
export function HoldControl({ onTick, onFlow, children, every = 160, type, label }: { onTick(): void; onFlow?(on: boolean): void; children: ReactNode; every?: number; type: string; label: string }) {
  const timer = useRef<number | null>(null);
  const tick = useRef(onTick);
  tick.current = onTick;
  const on = useSuggested(type);
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    onFlow?.(false);
  };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-2xl bg-brandBlue px-4 text-sm font-semibold text-white [touch-action:none] active:bg-[#1667b8] ${on ? RING : ""}`}
      onPointerDown={(e) => {
        e.preventDefault();
        tick.current();
        onFlow?.(true);
        timer.current = window.setInterval(() => tick.current(), every);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && tick.current()}
    >
      {children}
    </button>
  );
}
