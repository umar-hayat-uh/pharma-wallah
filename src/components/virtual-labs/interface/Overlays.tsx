"use client";

/**
 * Viewport overlays: the interaction prompt, the latest feedback line, the control guide,
 * the pause menu and the touch walking pad.
 */
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, MousePointerClick, X } from "lucide-react";
import type { Feedback } from "@/lib/virtual-labs/engine/types";
import { Btn } from "./ui";

export function InteractionPrompt({ label, focused, onExitFocus }: { label: string | null; focused: string | null; onExitFocus(): void }) {
  if (focused) {
    return (
      <div className="pointer-events-auto absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#16181d]/10 bg-white/95 py-1 pl-4 pr-1 text-sm shadow-sm">
        <span className="font-semibold">{focused}</span>
        <span className="hidden text-[#4a4f57] sm:inline">· drag to turn · scroll to zoom</span>
        <Btn size="sm" variant="soft" onClick={onExitFocus}>Back <span className="hidden sm:inline">(Esc)</span></Btn>
      </div>
    );
  }
  if (!label) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#16181d]/10 bg-white/95 px-4 py-1.5 text-sm shadow-sm">
      <MousePointerClick className="h-4 w-4 text-brandBlue" aria-hidden />
      <span className="font-semibold">{label}</span>
      <span className="text-[#4a4f57]">— click or press E to inspect</span>
    </div>
  );
}

/** Everything the last action produced, mistakes (with their consequence) first. */
export function FeedbackLine({ feedback, inline }: { feedback: Feedback[]; inline?: boolean }) {
  const order = { error: 1, warn: 0, ok: 2, info: 3 } as const;
  const items = [...feedback].sort((a, b) => (a.mistake ? -1 : 0) - (b.mistake ? -1 : 0) || order[a.kind] - order[b.kind]).slice(0, 3);
  return (
    <div aria-live="polite" className={inline ? "flex flex-col gap-1.5" : "pointer-events-none absolute inset-x-3 bottom-3 hidden flex-col items-center gap-1.5 lg:flex"}>
      {items.map((f, i) => (
        <p key={`${i}-${f.text}`} className={`pointer-events-auto flex max-w-2xl items-start gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm ${f.kind === "error" ? "border-red-200 bg-red-50 text-red-900" : f.kind === "warn" ? "border-amber-200 bg-amber-50 text-amber-950" : f.kind === "ok" ? "border-brandGreen/30 bg-white text-[#0f5c3e]" : "border-[#16181d]/10 bg-white text-[#16181d]"}`}>
          {f.kind === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : f.kind === "info" ? <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          <span>
            {f.text}
            {f.mistake && <span className="mt-0.5 block text-xs opacity-90">{f.mistake.consequence}</span>}
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * Phones: the student is scrolled down to the bench controls, far from the 3D view, so
 * feedback appears as a toast at the bottom of the screen instead. It clears itself
 * (longer for mistakes, which carry an explanation) and can be dismissed with a tap.
 */
export function MobileToast({ feedback }: { feedback: Feedback[] }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!feedback.length) return;
    setShown(true);
    const t = window.setTimeout(() => setShown(false), feedback.some((f) => f.mistake || f.kind === "error") ? 9000 : 4500);
    return () => window.clearTimeout(t);
  }, [feedback]);
  if (!shown || !feedback.length) return null;
  return (
    <div className="vl-noprint fixed inset-x-3 bottom-3 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <button type="button" onClick={() => setShown(false)} className="block w-full text-left" aria-label="Dismiss message">
        <FeedbackLine feedback={feedback} inline />
      </button>
    </div>
  );
}

export function Dialog({ title, onClose, children }: { title: string; onClose(): void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0b1a2b]/40 p-4" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" autoFocus onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#16181d]/5" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ControlGuide() {
  const rows: [string, string][] = [
    ["Walk", "W A S D or arrow keys (click the room first) · on a phone, the round pad"],
    ["Look around", "Drag in the room (mouse or one finger)"],
    ["Inspect / use equipment", "Click or tap a highlighted item, or press E while hovering"],
    ["Close-up", "Drag to turn around the item, scroll to zoom, Esc or Back to leave"],
    ["Guided mode", "The camera takes you to the equipment each step needs"],
    ["Do the step", "Use the Bench panel — every action is there, so the whole experiment also works without the 3D view"],
    ["Hints", "Ask in the Steps panel — hints never cost marks"],
    ["Undo / reset", "In the Bench panel. Undo restores the bench, but a mistake stays in your record"],
  ];
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8rem_1fr] gap-3">
          <dt className="font-semibold">{k}</dt>
          <dd className="text-[#3a3f47]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A thumb pad for walking on touch screens: drag from the centre; release to stop. */
export function TouchPad({ onMove }: { onMove(x: number, z: number): void }) {
  const ref = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const handle = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const len = Math.min(1, Math.hypot(dx, dy));
    const a = Math.atan2(dy, dx);
    const x = Math.cos(a) * len;
    const y = Math.sin(a) * len;
    if (knob.current) knob.current.style.transform = `translate(${x * 28}px, ${y * 28}px)`;
    onMove(Math.abs(x) < 0.15 ? 0 : x, Math.abs(y) < 0.15 ? 0 : y);
  };
  const stop = () => {
    if (knob.current) knob.current.style.transform = "translate(0,0)";
    onMove(0, 0);
  };
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-auto absolute bottom-16 left-4 h-24 w-24 touch-none rounded-full border border-white/70 bg-white/45 shadow-sm"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        handle(e);
      }}
      onPointerMove={(e) => e.buttons && handle(e)}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <div ref={knob} className="absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full bg-brandBlue/80 shadow transition-transform duration-75" />
    </div>
  );
}
