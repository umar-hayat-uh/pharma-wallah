"use client";

import { Fragment, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { fmt, fmtConc, fmtUg, type ComputedChain } from "./_math";

/*
 * The bench, drawn: the stock beaker, every tube, the transfer between them and
 * the syringe at the end.
 *
 * Two encodings, both read straight from the computed chain:
 *  - liquid height = the tube's total volume, against the fullest vessel;
 *  - liquid depth of colour = concentration on a log scale, from the stock
 *    (deepest) to the most dilute tube (palest) — a 1:10 step is always the
 *    same visible fade, which is how a student should think about a series.
 *
 * Everything is plain markup, fully drawn on the server: the GSAP run in
 * _useBenchMotion.ts only ever adds a travelling drop and a glow over this,
 * it never hides anything first (MEMORY.md gotcha 65). The data-* hooks are
 * what that hook animates.
 */

/** brandBlue #1C7BD9 — literal, because it is mixed with a computed alpha. */
const LIQUID = "28, 123, 217";

function tint(conc: number, c0: number, cMin: number): number {
  if (!(conc > 0) || !(c0 > 0)) return 0.1;
  const span = Math.log10(c0 / cMin);
  if (!(span > 0)) return 0.82;
  const depth = 1 - Math.log10(c0 / conc) / span;
  return 0.14 + 0.68 * Math.min(1, Math.max(0, depth));
}

type Props = {
  chain: ComputedChain;
  deliverVol: number;
  withinTolerance: boolean;
  className?: string;
};

export const BenchRack = forwardRef<HTMLDivElement, Props>(function BenchRack(
  { chain, deliverVol, withinTolerance, className },
  ref,
) {
  const stock = chain.rows[0];
  const tubes = chain.rows.slice(1);
  const maxVol = Math.max(...chain.rows.map((r) => r.newTotalVol), 0);
  const positive = chain.rows.map((r) => r.conc).filter((c) => c > 0);
  const cMin = positive.length ? Math.min(...positive) : stock.conc;
  const level = (vol: number) => (maxVol > 0 ? Math.min(1, Math.max(0.08, vol / maxVol)) : 0.08);
  const last = chain.rows[chain.rows.length - 1];

  const summary = [
    `Stock ${fmtConc(stock.conc)} mg/mL`,
    ...tubes.map((r) => `${fmt(r.aliquot)} mL into Tube ${r.stepNumber}, ${fmtConc(r.conc)} mg/mL`),
    `${fmt(deliverVol)} mL into the syringe, ${fmt(chain.doseDelivered, 5)} mg`,
  ].join("; ");

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/80 bg-muted/30",
        // Lab-paper dots: the rack is a drawing of the bench, not a chart.
        "bg-[radial-gradient(circle,rgba(148,163,184,0.30)_1px,transparent_1px)] [background-size:18px_18px]",
        className,
      )}
    >
      <div data-bench-scroller className="overflow-x-auto px-3 pb-3 pt-4 [scrollbar-width:thin] sm:px-6 sm:pb-4 sm:pt-5">
        {/* w-max keeps a long chain scrollable; min-w-full plus flexible
            transfer cells spreads a short one across the bench instead of
            huddling it at the left. */}
        <div
          role="img"
          aria-label={`Dilution chain: ${summary}`}
          className="relative flex w-max min-w-full items-start justify-center"
        >
          {/* The rack: a bar the tubes stand in, and the bench line under them. */}
          <span className="absolute inset-x-2 top-[8.75rem] h-2.5 rounded-full bg-slate-300/45" aria-hidden="true" />
          <span className="absolute inset-x-0 top-[11.35rem] h-[3px] rounded-full bg-slate-300/70" aria-hidden="true" />
          <Vessel
            kind="beaker"
            eyebrow="Stock"
            name="Tube 0"
            conc={stock.conc}
            vol={stock.newTotalVol}
            level={level(stock.newTotalVol)}
            alpha={tint(stock.conc, stock.conc, cMin)}
          />

          {tubes.map((r) => (
            <Fragment key={r.id}>
              <Transfer volume={r.aliquot} />
              <Vessel
                kind="tube"
                eyebrow={`1:${fmt(r.dilutionFactor, 1)}×`}
                name={`Tube ${r.stepNumber}`}
                conc={r.conc}
                vol={r.newTotalVol}
                level={level(r.newTotalVol)}
                alpha={tint(r.conc, stock.conc, cMin)}
              />
            </Fragment>
          ))}

          <Transfer volume={deliverVol} final />
          <Syringe
            dose={chain.doseDelivered}
            alpha={tint(last.conc, stock.conc, cMin)}
            ok={withinTolerance}
          />
        </div>
      </div>
    </div>
  );
});

/* ─── Pieces ─────────────────────────────────────────────────────────────── */

function Vessel({
  kind,
  eyebrow,
  name,
  conc,
  vol,
  level,
  alpha,
}: {
  kind: "beaker" | "tube";
  eyebrow: string;
  name: string;
  conc: number;
  vol: number;
  level: number;
  alpha: number;
}) {
  const beaker = kind === "beaker";
  return (
    <div data-bench-vessel className="relative flex w-[5.5rem] shrink-0 flex-col items-center text-center">
      <span
        className={cn(
          "mb-2 inline-flex h-6 items-center rounded-full px-2 font-mono text-[10.5px] font-medium tabular-nums tracking-[0.04em]",
          beaker ? "bg-foreground/[0.06] uppercase tracking-[0.14em] text-foreground/80" : "bg-primary/10 text-primary",
        )}
      >
        {eyebrow}
      </span>

      <div
        data-glass
        className={cn(
          "relative h-[9rem] overflow-hidden border-2 border-slate-300/90 bg-white/95 shadow-[0_6px_14px_-8px_rgba(15,23,42,0.25)]",
          beaker ? "w-[4.5rem] rounded-b-[14px] rounded-t-[4px]" : "w-[3rem] rounded-b-[1.5rem] rounded-t-[5px]",
        )}
      >
        {/* Liquid. Height is volume, colour depth is concentration. CSS owns
            the level transition; GSAP never tweens this element's transform. */}
        <div
          data-liquid
          className="absolute inset-x-0 bottom-0 h-full origin-bottom transition-[transform,background-color] duration-700 ease-out-expo motion-reduce:transition-none"
          style={{ transform: `scaleY(${level})`, backgroundColor: `rgba(${LIQUID}, ${alpha})` }}
        />
        {/* Graduations and the glass highlight sit above the liquid, unscaled. */}
        <div className="pointer-events-none absolute left-0 top-[18%] flex h-[62%] flex-col justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("block h-px bg-slate-400/70", i % 2 ? "w-1.5" : "w-2.5")} />
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-[22%] top-2 w-[3px] rounded-full bg-white/60" aria-hidden="true" />
        <span data-splash className="pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-soft-light" aria-hidden="true" />
      </div>

      <span className="mt-3.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{name}</span>
      <span data-conc className="mt-0.5 text-[15px] font-semibold tabular-nums leading-tight tracking-[-0.02em] text-foreground">
        {fmtConc(conc)}
      </span>
      <span className="font-mono text-[10.5px] text-muted-foreground">mg/mL</span>
      <span className="mt-1 rounded bg-card/90 px-1 font-mono text-[10.5px] tabular-nums text-foreground/70">{fmt(vol)} mL</span>
    </div>
  );
}

/** A pipette transfer: a dashed arc, an overlay the run draws, and its drop. */
function Transfer({ volume, final = false }: { volume: number; final?: boolean }) {
  return (
    <div data-bench-link className="relative flex min-w-[4.25rem] max-w-[8rem] flex-1 flex-col items-center pt-12" aria-hidden="true">
      <svg viewBox="0 0 68 46" className="h-[46px] w-[68px] overflow-visible">
        <path d="M6 42 C 14 2, 54 2, 62 42" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
        <path d="M57 35 L62 42 L65 33.5" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          data-flow
          d="M6 42 C 14 2, 54 2, 62 42"
          fill="none"
          stroke={final ? "#21B67A" : "#1C7BD9"}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0"
        />
        <circle data-drop cx="6" cy="42" r="3.5" fill={final ? "#21B67A" : "#1C7BD9"} opacity="0" />
      </svg>
      <span className="-mt-1 rounded-md bg-card px-1 font-mono text-[11px] font-medium tabular-nums text-foreground/80">
        {fmt(volume)} mL
      </span>
    </div>
  );
}

/** Barrel 84 units tall; the drawn volume fills 62% of it — a picture, not a scale. */
const BARREL_TOP = 16;
const BARREL_BOTTOM = 100;
const FILL = 0.62;

function Syringe({ dose, alpha, ok }: { dose: number; alpha: number; ok: boolean }) {
  const fillH = (BARREL_BOTTOM - BARREL_TOP) * FILL;
  const stopperY = BARREL_BOTTOM - fillH - 5;
  return (
    <div data-bench-syringe className="relative flex w-[5.75rem] shrink-0 flex-col items-center text-center">
      <span
        className={cn(
          "mb-2 inline-flex h-6 items-center rounded-full px-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]",
          ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900",
        )}
      >
        {ok ? "±5% ok" : "Check"}
      </span>
      <svg viewBox="0 0 44 128" className="h-[9rem] w-[3.1rem]" aria-hidden="true">
        <g data-plunger data-travel={fillH}>
          <rect x="11" y="0" width="22" height="4" rx="1.5" fill="#94a3b8" />
          <rect x="20" y="4" width="4" height={stopperY - 4} fill="#cbd5e1" />
          <rect x="13.5" y={stopperY} width="17" height="5" rx="1" fill="#64748b" />
        </g>
        <rect
          data-syringe-fill
          x="13"
          y={BARREL_BOTTOM - fillH}
          width="18"
          height={fillH}
          fill={`rgba(${LIQUID}, ${alpha})`}
        />
        <line x1="6" y1={BARREL_TOP} x2="38" y2={BARREL_TOP} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <rect x="12" y={BARREL_TOP} width="20" height={BARREL_BOTTOM - BARREL_TOP} rx="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="12" x2={i % 2 ? 16 : 19} y1={30 + i * 14} y2={30 + i * 14} stroke="#94a3b8" strokeWidth="1" />
        ))}
        <rect x="18.5" y={BARREL_BOTTOM} width="7" height="6" rx="1" fill="#94a3b8" />
        <line x1="22" y1={BARREL_BOTTOM + 6} x2="22" y2="127" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="mt-3.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Syringe</span>
      <span data-dose className="mt-0.5 text-[15px] font-semibold tabular-nums leading-tight tracking-[-0.02em] text-foreground">
        {fmtUg(dose)}
      </span>
      <span className="font-mono text-[10.5px] text-muted-foreground">dose</span>
      <span className="mt-1 rounded bg-card/90 px-1 font-mono text-[10.5px] tabular-nums text-foreground/70">{fmt(dose, 5)} mg</span>
    </div>
  );
}
