"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, CornerDownLeft, Search } from "lucide-react";
import { SUBJECTS } from "@/lib/courses/registry";
import { cn } from "@/lib/utils";
import { REFERENCE_LINKS, STUDY_LINKS, unitHref } from "./dashboard-data";

/*
 * ⌘K / Ctrl+K. Dependency-free (no cmdk, no Radix Dialog — neither is
 * installed), with the combobox pattern: the input keeps focus, ↑/↓ move the
 * active option, Enter opens it, Escape closes and focus returns to where it was.
 *
 * Units come from the course registry, so a newly registered subject is
 * searchable without touching this file.
 */

type Item = { key: string; label: string; hint: string; href: string; group: string; icon: React.ComponentType<{ className?: string }> };

const ITEMS: Item[] = [
  ...STUDY_LINKS.map((l) => ({ key: l.href, label: l.label, hint: l.blurb, href: l.href, group: "Study", icon: l.icon })),
  ...REFERENCE_LINKS.map((l) => ({ key: l.href, label: l.label, hint: l.blurb, href: l.href, group: "Reference", icon: l.icon })),
  ...SUBJECTS.flatMap((s) =>
    s.units.map((u, i) => ({
      key: `${s.slug}/${u.id}`,
      label: u.title,
      hint: `${s.title} · Unit ${i + 1}`,
      href: unitHref(s.slug, u.id),
      group: "Units",
      icon: BookOpen,
    })),
  ),
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS.filter((i) => i.group !== "Units").concat(ITEMS.filter((i) => i.group === "Units").slice(0, 4));
    const words = q.split(/\s+/);
    return ITEMS.filter((i) => {
      const hay = `${i.label} ${i.hint}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    }).slice(0, 30);
  }, [query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open) return null;

  const go = (item?: Item) => {
    if (!item) return;
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-[#061224]/45 animate-in fade-in duration-200" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a unit or tool"
        className="d-panel relative w-full max-w-[600px] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 ease-out-expo"
      >
        <div className="flex h-14 items-center gap-3 border-b border-[var(--line)] px-4">
          <Search className="h-[18px] w-[18px] shrink-0 text-[var(--ink-3)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search units, tools and references…"
            role="combobox"
            aria-expanded="true"
            aria-controls="pw-dash-palette"
            aria-activedescendant={results[index] ? `pw-dash-opt-${index}` : undefined}
            className="h-full flex-1 border-0 text-[16px] placeholder:text-[var(--ink-3)]"
          />
          <kbd className="rounded-md border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--ink-3)]">Esc</kbd>
        </div>

        <ul ref={listRef} id="pw-dash-palette" role="listbox" className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-[14px] text-[var(--ink-3)]">Nothing matches “{query}”.</li>
          )}
          {results.map((item, i) => {
            const heading = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const on = i === index;
            return (
              <li key={item.key} role="presentation">
                {heading && <p className="d-eyebrow px-3 pb-2 pt-3">{heading}</p>}
                <div
                  id={`pw-dash-opt-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={on}
                  onMouseMove={() => setIndex(i)}
                  onClick={() => go(item)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5",
                    on ? "bg-[var(--panel-2)]" : "",
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", on ? "text-[var(--blue)]" : "text-[var(--ink-3)]")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-medium">{item.label}</span>
                    <span className="block truncate text-[12.5px] text-[var(--ink-3)]">{item.hint}</span>
                  </span>
                  {on ? (
                    <CornerDownLeft className="h-4 w-4 shrink-0 text-[var(--ink-3)]" />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-transparent" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
