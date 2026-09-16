"use client";

import { Home, LayoutGrid, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type HubView = "home" | "browse" | "saved";

const ITEMS: { view: HubView; label: string; icon: typeof Home }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "browse", label: "Browse", icon: LayoutGrid },
  { view: "saved", label: "Saved", icon: Star },
];

/**
 * The home screen's bottom bar. Fixed and opaque — a blurred fixed bar
 * re-blurs everything scrolling beneath it on every frame (MEMORY gotcha 51).
 */
export function BottomNav({ view, onChange, savedCount }: { view: HubView; onChange: (v: HubView) => void; savedCount: number }) {
  return (
    <nav
      aria-label="App sections"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-white shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.35)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 px-3 pt-1.5">
        {ITEMS.map(({ view: v, label, icon: Icon }) => {
          const active = v === view;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "grid h-8 w-14 place-items-center rounded-full transition-[background-color,transform] duration-300 ease-out-expo",
                  active ? "scale-100 bg-primary/10 text-primary" : "scale-95 text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && v === "saved" && "fill-primary/20")} />
                {v === "saved" && savedCount > 0 && (
                  <span className="absolute right-[calc(50%-1.9rem)] top-1 min-w-[1.1rem] rounded-full bg-emerald-500 px-1 text-center text-[10px] font-bold leading-[1.1rem] text-white">
                    {savedCount}
                  </span>
                )}
              </span>
              <span className={cn("text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
