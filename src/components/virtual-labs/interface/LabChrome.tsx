"use client";

/**
 * The immersive lab's on-screen chrome (2026-10-21): the top bar, the instrument
 * controller dock, the Learning-mode "next" prompt and the info card for equipment that is
 * only inspected. Solid surfaces only — no backdrop-filter over the live canvas (CLAUDE.md
 * §6 rule 16), and every target is at least 40 px.
 */
import { forwardRef, type ReactNode } from "react";
import { BookOpenText, ChevronDown, ChevronUp, Eye, HelpCircle, ListChecks, LogOut, Maximize, Menu, Minimize, Undo2, X } from "lucide-react";
import type { ControllerDef, LabMode } from "@/lib/virtual-labs/engine/types";

const ICON_BTN = "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#16181d] hover:bg-[#16181d]/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandBlue";

export const TopBar = forwardRef<HTMLDivElement, {
  title: string;
  mode: LabMode;
  done: number;
  total: number;
  objective: string | null;
  objectivesOpen: boolean;
  fullscreen: boolean | null; // null = not supported here
  onExit(): void;
  onObjectives(): void;
  onNotebook(): void;
  onHelp(): void;
  onMenu(): void;
  onFullscreen(): void;
}>(function TopBar(p, ref) {
  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 top-0 z-20 px-2 pt-2 sm:px-3" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))", paddingLeft: "max(0.5rem, env(safe-area-inset-left))", paddingRight: "max(0.5rem, env(safe-area-inset-right))" }}>
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-[#16181d]/10 bg-white/95 p-1 shadow-sm">
        <button type="button" onClick={p.onExit} className={ICON_BTN} aria-label="Leave the lab">
          <LogOut className="h-5 w-5 -scale-x-100" aria-hidden />
        </button>
        <button type="button" onClick={p.onObjectives} className={`${ICON_BTN} ${p.objectivesOpen ? "bg-brandBlue/10 text-brandBlue" : ""}`} aria-label={p.objectivesOpen ? "Hide objectives" : "Show objectives"} aria-pressed={p.objectivesOpen}>
          <ListChecks className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1 px-1">
          <p className="flex items-center gap-2 truncate text-sm font-bold text-[#16181d]">
            <span className="truncate">{p.title}</span>
            <span className={`hidden shrink-0 rounded-full px-2 py-px text-[11px] font-semibold sm:inline ${p.mode === "learning" ? "bg-brandBlue/10 text-brandBlue" : "bg-[#16181d]/[0.07] text-[#3a3f47]"}`}>{p.mode === "learning" ? "Learning" : "Practical"}</span>
          </p>
          <p className="truncate text-xs text-[#4a4f57]" aria-live="polite">
            <span className="font-semibold tabular-nums">{p.done}/{p.total}</span>
            {p.objective ? <> · {p.objective}</> : <span className="sm:hidden"> · {p.mode === "learning" ? "Learning" : "Practical"}</span>}
          </p>
        </div>
        <button type="button" onClick={p.onNotebook} className={ICON_BTN} aria-label="Notebook: your readings and record">
          <BookOpenText className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" onClick={p.onHelp} className={`${ICON_BTN} hidden sm:grid`} aria-label="Help and theory">
          <HelpCircle className="h-5 w-5" aria-hidden />
        </button>
        {p.fullscreen !== null && (
          <button type="button" onClick={p.onFullscreen} className={ICON_BTN} aria-label={p.fullscreen ? "Exit full screen" : "Full screen"}>
            {p.fullscreen ? <Minimize className="h-5 w-5" aria-hidden /> : <Maximize className="h-5 w-5" aria-hidden />}
          </button>
        )}
        <button type="button" onClick={p.onMenu} className={ICON_BTN} aria-label="Pause, settings and mode">
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
});

/**
 * The open instrument's controller. Desktop: a dock on the right that leaves the room in
 * view. Phones: a bottom sheet that can be collapsed to its header, so the student can
 * watch the instrument while operating it.
 */
export const ControllerDock = forwardRef<HTMLDivElement, {
  controller: ControllerDef;
  mode: LabMode;
  nearby: ControllerDef[];
  collapsed: boolean;
  canUndo: boolean;
  onCollapse(c: boolean): void;
  onClose(): void;
  onNearby(c: ControllerDef): void;
  onUndo(): void;
  children: ReactNode;
}>(function ControllerDock(p, ref) {
  const c = p.controller;
  return (
    <section
      ref={ref}
      aria-label={`${c.name} controls`}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex max-h-[58%] flex-col rounded-t-3xl border border-[#16181d]/10 bg-white shadow-[0_-8px_30px_rgba(11,26,43,0.12)] lg:inset-x-auto lg:bottom-3 lg:right-3 lg:top-[4.25rem] lg:max-h-none lg:w-[400px] lg:rounded-3xl lg:shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button type="button" tabIndex={-1} onClick={() => p.onCollapse(!p.collapsed)} className="mx-auto mt-2 block h-1.5 w-10 shrink-0 rounded-full bg-[#16181d]/20 lg:hidden" aria-hidden />
      <div className="flex items-start gap-2 border-b border-[#16181d]/[0.08] px-3 pb-2 pt-1 lg:px-4 lg:pt-3">
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="text-base font-bold text-[#16181d]">{c.name}</h2>
          {!p.collapsed && <p className="text-xs text-[#4a4f57]">{c.brief}</p>}
        </div>
        <button type="button" onClick={() => p.onCollapse(!p.collapsed)} className={`${ICON_BTN} lg:hidden`} aria-label={p.collapsed ? "Expand controls" : "Collapse controls"}>
          {p.collapsed ? <ChevronUp className="h-5 w-5" aria-hidden /> : <ChevronDown className="h-5 w-5" aria-hidden />}
        </button>
        <button type="button" onClick={p.onClose} className={ICON_BTN} aria-label={`Put down the ${c.name.toLowerCase()} (close controls)`}>
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      {!p.collapsed && (
        <>
          <div className="vl-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 pb-3 pt-2 lg:px-4">
            {p.mode === "learning" && c.howTo.length > 0 && (
              <ul className="vl-list space-y-0.5 rounded-xl bg-brandBlue/[0.05] px-3 py-2 text-xs text-[#1b4f86]">
                {c.howTo.map((h) => <li key={h}>{h}</li>)}
              </ul>
            )}
            {p.children}
          </div>
          <footer className="flex flex-wrap items-center gap-1.5 border-t border-[#16181d]/[0.08] px-3 py-2 lg:px-4">
            <button type="button" onClick={p.onUndo} disabled={!p.canUndo} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#3a3f47] hover:bg-[#16181d]/5 disabled:opacity-40">
              <Undo2 className="h-4 w-4" aria-hidden />Undo
            </button>
            {p.nearby.length > 0 && <span className="ml-auto text-[11px] text-[#4a4f57]">Also here:</span>}
            {p.nearby.map((n) => (
              <button key={n.id} type="button" onClick={() => p.onNearby(n)} className="inline-flex min-h-9 items-center rounded-full border border-[#16181d]/12 px-3 text-xs font-semibold hover:border-brandBlue/50 hover:text-brandBlue">
                {n.name}
              </button>
            ))}
          </footer>
        </>
      )}
    </section>
  );
});

/** Learning mode: what to operate next, with a "Show me" that only moves the camera. */
export function NextPrompt({ label, onShow }: { label: string; onShow?(): void }) {
  return (
    <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-brandGreen/40 bg-white py-1 pl-3 pr-1 text-sm shadow-sm">
      <span className="h-2 w-2 shrink-0 rounded-full bg-brandGreen" aria-hidden />
      <span className="min-w-0 truncate"><span className="font-semibold text-[#137a52]">Next:</span> {label}</span>
      {onShow && (
        <button type="button" onClick={onShow} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-brandGreen/10 px-2.5 text-xs font-semibold text-[#137a52] hover:bg-brandGreen/20">
          <Eye className="h-3.5 w-3.5" aria-hidden />Show me
        </button>
      )}
    </div>
  );
}

/** Equipment the student can inspect but not operate in this experiment. */
export function InfoCard({ name, use, spec, safety, onClose }: { name: string; use: string; spec?: string; safety?: string; onClose(): void }) {
  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[#16181d]/10 bg-white p-3 text-sm shadow-sm">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-bold">{name}</p>
        <button type="button" onClick={onClose} className="-m-1 grid h-8 w-8 place-items-center rounded-lg hover:bg-[#16181d]/5" aria-label="Close">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <p className="mt-1 text-[#3a3f47]">{use}</p>
      {spec && <p className="mt-1 text-xs text-[#4a4f57]">{spec}</p>}
      {safety && <p className="mt-1 text-xs text-amber-800">{safety}</p>}
    </div>
  );
}
