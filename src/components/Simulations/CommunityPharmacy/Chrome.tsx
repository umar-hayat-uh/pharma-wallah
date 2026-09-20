"use client";

// ============================================================
// The counter's chrome: header, stage rail, control panel, bench
// ============================================================
//
// These three pieces are what stop a simulation this wide from feeling like a
// dashboard. The header states where you are; the rail states the workflow;
// the dock is everything you can reach for without leaving it.
//
// Both fixed bars are opaque. `backdrop-filter` on a fixed element was
// measured as this site's main scroll-lag source (MEMORY gotcha 51), and this
// page scrolls a lot.

import React from "react";
import { ChevronLeft, Lock, Settings, X } from "lucide-react";

import type { PanelId, Stage } from "./types";
import { PANELS, STAGE_COPY } from "./data/constants";
import { Button } from "./kit";
import {
  BenchButton,
  CalculatorArt,
  PrinterArt,
  ReferenceArt,
  RxPadArt,
  ScaleArt,
  ScannerArt,
  TrayArt,
} from "./environment/objects";
import { cn } from "@/lib/utils";

// ─── Header ──────────────────────────────────────────────────────────────────

export function CounterHeader({
  caseNumber,
  queueCount,
  progress,
  onExit,
  onHelp,
  title,
}: {
  caseNumber: number | null;
  queueCount: number;
  progress: number;
  onExit: () => void;
  onHelp: () => void;
  title: string;
}) {
  return (
    <header className="cph-bar sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-3 py-2.5 sm:px-5">
        <button
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden text-[13px] font-bold sm:inline">Exit</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
            PharmaWallah · Community pharmacy simulation
          </p>
          <p className="truncate text-[13.5px] font-bold leading-tight text-slate-900">{title}</p>
        </div>

        <dl className="hidden items-center gap-5 md:flex">
          {caseNumber !== null && (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Case</dt>
              <dd className="text-[13px] font-extrabold tabular-nums text-slate-800">#{String(caseNumber).padStart(3, "0")}</dd>
            </div>
          )}
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Queue</dt>
            <dd className="text-[13px] font-extrabold tabular-nums text-slate-800">{queueCount}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Shift</dt>
            <dd className="text-[13px] font-extrabold text-slate-800">Morning</dd>
          </div>
        </dl>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden w-[110px] sm:block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Progress</span>
              <span className="text-[11px] font-extrabold tabular-nums text-slate-600">{progress}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="cph-step-line h-full rounded-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={onHelp}
            aria-label="How the counter works"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-slate-100 sm:hidden">
        <div className="cph-step-line h-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

// ─── Stage rail ──────────────────────────────────────────────────────────────

export function StageRail({
  flow,
  current,
  isComplete,
  isUnlocked,
  isSkipped,
  onGo,
}: {
  flow: Stage[];
  current: Stage;
  isComplete: (s: Stage) => boolean;
  isUnlocked: (s: Stage) => boolean;
  isSkipped: (s: Stage) => boolean;
  onGo: (s: Stage) => void;
}) {
  const visible = flow.filter((s) => s !== "complete" && !isSkipped(s));
  return (
    <nav aria-label="Workflow" className="-mx-1 overflow-x-auto px-1 pb-1">
      <ol className="flex min-w-max items-center gap-1">
        {visible.map((stage, index) => {
          const copy = STAGE_COPY[stage];
          const done = isComplete(stage);
          const active = current === stage;
          const unlocked = isUnlocked(stage);
          return (
            <li key={stage} className="flex items-center">
              {index > 0 && <span className={cn("mx-1 h-px w-3 shrink-0", done ? "bg-brandGreen" : "bg-slate-200")} aria-hidden />}
              <button
                type="button"
                onClick={() => onGo(stage)}
                disabled={!unlocked}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
                  active
                    ? "border-brandBlue bg-brandBlue text-white"
                    : done
                      ? "border-brandGreen/40 bg-brandGreen/[0.08] text-emerald-800 hover:bg-brandGreen/[0.14]"
                      : unlocked
                        ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
                )}
              >
                {!unlocked && <Lock className="h-3 w-3" aria-hidden />}
                {copy ? copy.title : stage}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── The bench ───────────────────────────────────────────────────────────────

/** The objects on the counter. Each opens a drawer without losing your place. */
export function Bench({ onOpen, active, trayCount }: { onOpen: (panel: PanelId) => void; active: PanelId | null; trayCount: number }) {
  return (
    <div className="cph-counter px-3 py-2.5">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
        <BenchButton art={<RxPadArt />} label="Prescription" onClick={() => onOpen("prescription")} active={active === "prescription"} />
        <BenchButton art={<ScannerArt />} label="Checks" onClick={() => onOpen("interactions")} active={active === "interactions"} />
        <BenchButton art={<TrayArt />} label="Tray" onClick={() => onOpen("dispensing")} active={active === "dispensing"} badge={trayCount || undefined} />
        <BenchButton art={<PrinterArt />} label="Labels" onClick={() => onOpen("dispensing")} active={false} />
        <BenchButton art={<ScaleArt />} label="Inventory" onClick={() => onOpen("inventory")} active={active === "inventory"} />
        <BenchButton art={<CalculatorArt />} label="Calculators" onClick={() => onOpen("calculations")} active={active === "calculations"} />
        <BenchButton art={<ReferenceArt />} label="References" onClick={() => onOpen("references")} active={active === "references"} />
      </div>
    </div>
  );
}

// ─── Control panel ───────────────────────────────────────────────────────────

const PANEL_ORDER: PanelId[] = ["queue", "prescription", "interactions", "dispensing", "counselling", "inventory", "calculations", "references", "documentation", "help"];

/** The floating dock on a large screen. */
export function ControlDock({ active, onOpen }: { active: PanelId | null; onOpen: (p: PanelId | null) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 hidden justify-center px-4 lg:flex">
      <div className="cph-dock pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl px-1.5 py-1.5">
        {PANEL_ORDER.map((id) => {
          const meta = PANELS.find((p) => p.id === id);
          if (!meta) return null;
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(on ? null : id)}
              aria-pressed={on}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
                on ? "bg-brandBlue text-white" : "text-slate-600 hover:bg-slate-100",
              )}
              title={meta.blurb}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The phone's bottom navigation — five destinations and a More sheet. */
const MOBILE_PRIMARY: PanelId[] = ["queue", "prescription", "interactions", "dispensing", "counselling"];

export function MobileNav({
  active,
  onOpen,
  onMore,
}: {
  active: PanelId | null;
  onOpen: (p: PanelId | null) => void;
  onMore: () => void;
}) {
  return (
    <nav aria-label="Sections" className="cph-bar fixed inset-x-0 bottom-0 z-40 border-b-0 border-t lg:hidden">
      <ul className="mx-auto flex w-full max-w-lg items-stretch">
        {MOBILE_PRIMARY.map((id) => {
          const meta = PANELS.find((p) => p.id === id);
          if (!meta) return null;
          const on = active === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onOpen(on ? null : id)}
                aria-pressed={on}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-bold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brandBlue",
                  on ? "text-brandBlue" : "text-slate-500",
                )}
              >
                <span className={cn("h-1 w-6 rounded-full", on ? "bg-brandBlue" : "bg-transparent")} aria-hidden />
                {meta.label.split(" ")[0]}
              </button>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMore}
            className="flex w-full flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-bold leading-tight text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brandBlue"
          >
            <span className="h-1 w-6 rounded-full bg-transparent" aria-hidden />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function MoreSheetContent({ onOpen }: { onOpen: (p: PanelId) => void }) {
  const rest: PanelId[] = ["inventory", "calculations", "references", "documentation", "help"];
  return (
    <ul className="space-y-2">
      {rest.map((id) => {
        const meta = PANELS.find((p) => p.id === id);
        if (!meta) return null;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onOpen(id)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-slate-900">{meta.label}</span>
                <span className="mt-0.5 block text-[12px] text-slate-500">{meta.blurb}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ─── The review notice ───────────────────────────────────────────────────────

/**
 * What the student sees instead of "Wrong!".
 *
 * It names what to re-check and leaves them able to fix it. Nothing is scored
 * until the case is submitted, so a corrected mistake costs nothing.
 */
export function ReviewNoticeCard({
  title,
  body,
  items,
  tone,
  onDismiss,
}: {
  title: string;
  body: string;
  items: string[];
  tone: "critical" | "caution" | "review" | "ok";
  onDismiss: () => void;
}) {
  const border = tone === "critical" ? "border-rose-300 bg-rose-50" : tone === "caution" ? "border-orange-200 bg-orange-50" : "border-amber-200 bg-amber-50";
  return (
    <div className={cn("cph-enter rounded-2xl border px-4 py-3.5", border)} role="status">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-700">{body}</p>
          <ul className="mt-2 space-y-1">
            {items.map((i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-700">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ top: "calc(var(--cph-top, 0px) + 4.5rem)" }}
      role="status"
      aria-live="polite"
    >
      <div className="cph-enter pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.7)]">
        <span className="text-[12.5px] font-semibold text-slate-800">{message}</span>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
