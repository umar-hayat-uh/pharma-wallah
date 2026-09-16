"use client";

import Link from "next/link";
import {
  Activity,
  Beaker,
  Calculator,
  ChevronRight,
  Droplets,
  FlaskRound,
  HeartPulse,
  Microscope,
  Pill,
  Scale,
  Star,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppTool } from "../_data/catalogue";

/**
 * Category identity: an icon (mirroring the web hub) and a hue. The hues are
 * muted and sit around the brand blue/green, so the catalogue reads as one
 * product rather than a rainbow.
 */
export const CATEGORY_STYLE: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  "pharma-chem": { icon: Beaker, from: "#2563eb", to: "#38bdf8" },
  "unit-conversion": { icon: Scale, from: "#0f766e", to: "#2dd4bf" },
  pharmaceutics: { icon: Pill, from: "#4f46e5", to: "#818cf8" },
  "biopharmaceutics-pharmacokinetics": { icon: Activity, from: "#0369a1", to: "#22d3ee" },
  pharmacology: { icon: HeartPulse, from: "#be123c", to: "#fb7185" },
  "pharmaceutical-analysis": { icon: Microscope, from: "#6d28d9", to: "#a78bfa" },
  physiology: { icon: Droplets, from: "#b91c1c", to: "#f87171" },
  microbiology: { icon: Syringe, from: "#15803d", to: "#4ade80" },
  "pharmaceutical-engineering": { icon: FlaskRound, from: "#b45309", to: "#fbbf24" },
  "clinical-hospital-pharmacy": { icon: Stethoscope, from: "#1d4ed8", to: "#21b67a" },
  more: { icon: Calculator, from: "#475569", to: "#94a3b8" },
};

export const styleFor = (category: string) => CATEGORY_STYLE[category] ?? CATEGORY_STYLE.more;

export function CategoryIcon({ category, size = "md" }: { category: string; size?: "sm" | "md" | "lg" }) {
  const s = styleFor(category);
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center text-white shadow-sm",
        size === "sm" && "h-9 w-9 rounded-xl",
        size === "md" && "h-11 w-11 rounded-2xl",
        size === "lg" && "h-12 w-12 rounded-2xl",
      )}
      style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
      aria-hidden="true"
    >
      <Icon className={size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5"} />
    </span>
  );
}

export const toolHref = (slug: string) => `/calculation-tools/${slug}`;

/** One tool as a readable row: icon, full name, what it computes. */
export function ToolRow({
  tool,
  index = 0,
  saved,
  onToggleSaved,
}: {
  tool: AppTool;
  index?: number;
  saved?: boolean;
  onToggleSaved?: (slug: string) => void;
}) {
  return (
    <li className="pw-rise flex items-center gap-1" style={{ ["--i" as string]: Math.min(index, 14) }}>
      <Link
        href={toolHref(tool.slug)}
        className="pw-press flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-primary/5"
      >
        <CategoryIcon category={tool.category} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            {tool.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{tool.desc}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
      </Link>
      {onToggleSaved && (
        <button
          type="button"
          onClick={() => onToggleSaved(tool.slug)}
          aria-label={saved ? `Remove ${tool.name} from saved` : `Save ${tool.name}`}
          aria-pressed={saved}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted-foreground active:bg-muted"
        >
          <Star className={cn("h-[18px] w-[18px]", saved && "fill-amber-400 text-amber-500")} />
        </button>
      )}
    </li>
  );
}

/** A compact card for the horizontal Recent / Saved rows. */
export function ToolChip({ tool, index = 0 }: { tool: AppTool; index?: number }) {
  return (
    <Link
      href={toolHref(tool.slug)}
      className="pw-rise pw-press flex w-[8.5rem] shrink-0 flex-col gap-2.5 rounded-2xl border border-border/80 bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ ["--i" as string]: index }}
    >
      <CategoryIcon category={tool.category} size="sm" />
      <span className="line-clamp-2 text-[12.5px] font-semibold leading-[1.25] text-foreground">{tool.short}</span>
    </Link>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3 px-4">
      <h2 className="text-[15px] font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      {action}
    </div>
  );
}
