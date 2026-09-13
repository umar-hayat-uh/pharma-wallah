"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Activity, BookOpenCheck, ChevronDown, LayoutGrid, LogOut, Menu, Moon, RefreshCw, Search, Sun, Target, Trophy, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { REFERENCE_LINKS, STUDY_LINKS } from "./dashboard-data";

export const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "syllabus", label: "Syllabus", icon: BookOpenCheck },
  { id: "practice", label: "Practice", icon: Target },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "milestones", label: "Milestones", icon: Trophy },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** shadcn's ghost button, re-pointed at the dashboard's tokens so it works in both themes. */
export const GHOST = "text-[var(--ink-2)] hover:bg-[var(--panel-2)] hover:text-[var(--ink)]";

export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - 76;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

function Wordmark() {
  return (
    <Link href="/dashboard" aria-label="PharmaWallah dashboard" className="flex h-9 items-center">
      <Image
        src="/images/logo/logo.svg"
        alt="PharmaWallah"
        width={116}
        height={34}
        priority
        className="h-auto w-[116px] [.dark_&]:brightness-0 [.dark_&]:invert"
      />
    </Link>
  );
}

// ─── Navigation body, shared by the rail and the mobile sheet ────────────

function NavBody({ active, onNavigate }: { active: SectionId; onNavigate?: () => void }) {
  return (
    <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-7 overflow-y-auto px-3 pb-6">
      <div>
        <p className="d-eyebrow px-3 pb-3">Dashboard</p>
        <ul className="space-y-0.5">
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpTo(s.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    "d-link group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14.5px] font-medium",
                    on ? "bg-[var(--panel)] text-[var(--ink)] shadow-[var(--shadow)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#1c7bd9] to-[#21b67a] transition-opacity duration-300",
                      on ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <s.icon className={cn("h-[18px] w-[18px]", on ? "text-[var(--blue)]" : "text-[var(--ink-3)] group-hover:text-[var(--ink-2)]")} />
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="d-eyebrow px-3 pb-3">Study</p>
        <ul className="space-y-0.5">
          {STUDY_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className="d-link group flex h-9 items-center gap-3 rounded-xl px-3 text-[14px] text-[var(--ink-2)] hover:bg-[var(--panel)] hover:text-[var(--ink)]"
              >
                <l.icon className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--blue)]" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="d-eyebrow px-3 pb-3">Reference</p>
        <ul className="space-y-0.5">
          {REFERENCE_LINKS.slice(0, 4).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                className="d-link group flex h-9 items-center gap-3 rounded-xl px-3 text-[14px] text-[var(--ink-2)] hover:bg-[var(--panel)] hover:text-[var(--ink)]"
              >
                <l.icon className="h-4 w-4 text-[var(--ink-3)] group-hover:text-[var(--blue)]" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// ─── Desktop rail ────────────────────────────────────────────────────────

export function Rail({ active, user }: { active: SectionId; user: React.ReactNode }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] flex-col border-r border-[var(--line)] bg-[var(--board)] lg:flex">
      <div className="flex h-[68px] shrink-0 items-center px-6">
        <Wordmark />
      </div>
      <NavBody active={active} />
      <div className="shrink-0 border-t border-[var(--line)] p-3">{user}</div>
    </aside>
  );
}

// ─── Mobile sheet ────────────────────────────────────────────────────────

export function MobileSheet({
  open, onClose, active, user,
}: { open: boolean; onClose: () => void; active: SectionId; user: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);

  return (
    // `invisible` once closed (after the slide-out) keeps every link in the sheet out of the tab order.
    <div className={cn("fixed inset-0 z-50 transition-[visibility] duration-500 lg:hidden", open ? "visible" : "invisible")}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-[#061224]/45 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-[var(--board)] shadow-2xl transition-transform duration-500 ease-out-expo",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Wordmark />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu" className={GHOST}>
            <X />
          </Button>
        </div>
        <NavBody active={active} onNavigate={onClose} />
        <div className="shrink-0 border-t border-[var(--line)] p-3">{user}</div>
      </div>
    </div>
  );
}

// ─── Account ─────────────────────────────────────────────────────────────

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AccountMenu({
  name, email, onSignOut, placement = "up",
}: { name: string; email?: string; onSignOut: () => void; placement?: "up" | "down" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "d-link flex w-full items-center gap-3 rounded-xl text-left hover:bg-[var(--panel)]",
          placement === "up" ? "p-2" : "p-1",
        )}
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(135deg,#1C7BD9,#21B67A)" }}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
        {placement === "up" && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{name}</span>
            <span className="block truncate text-[12px] text-[var(--ink-3)]">{email}</span>
          </span>
        )}
        {placement === "up" && <ChevronDown className={cn("h-4 w-4 text-[var(--ink-3)] transition-transform", open ? "" : "rotate-180")} />}
        {placement === "down" && <span className="sr-only">Account menu</span>}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "d-panel absolute z-50 w-64 p-1.5 animate-in fade-in zoom-in-95 duration-200",
            placement === "up" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2",
          )}
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-[14px] font-semibold">{name}</p>
            <p className="truncate text-[12.5px] text-[var(--ink-3)]">{email}</p>
          </div>
          <Separator className="my-1 bg-[var(--line)]" />
          <button
            role="menuitem"
            type="button"
            onClick={onSignOut}
            className="d-link flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-[14px] text-[var(--ink-2)] hover:bg-[var(--panel-2)] hover:text-[var(--ink)]"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────

export function TopBar({
  active, onMenu, onSearch, onRefresh, refreshing, dark, onToggleDark, account,
}: {
  active: SectionId;
  onMenu: () => void;
  onSearch: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  dark: boolean;
  onToggleDark: () => void;
  account: React.ReactNode;
}) {
  const label = SECTIONS.find((s) => s.id === active)?.label ?? "Overview";
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <header className="d-topbar sticky top-0 z-20">
      <div className="mx-auto flex h-[64px] max-w-[1240px] items-center gap-2 px-4 sm:px-8">
        <Button variant="ghost" size="icon" onClick={onMenu} aria-label="Open menu" className={cn(GHOST, "-ml-2 lg:hidden")}>
          <Menu />
        </Button>

        <p className="d-eyebrow min-w-0 truncate" aria-live="polite">
          <span className="hidden sm:inline">Dashboard</span>
          <span className="hidden text-[var(--line-2)] sm:inline">/</span>
          <span className="text-[var(--ink)]">{label}</span>
        </p>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={onSearch}
            className="d-link hidden h-10 w-[260px] items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-[14px] text-[var(--ink-3)] hover:border-[var(--line-2)] md:flex"
          >
            <Search className="h-4 w-4" />
            Jump to a unit or tool
            <kbd className="ml-auto rounded-md border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10.5px]">
              {mac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" onClick={onSearch} aria-label="Search" className={cn(GHOST, "md:hidden")}>
            <Search />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh progress" disabled={refreshing} className={GHOST}>
            <RefreshCw className={cn(refreshing && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label={dark ? "Use light theme" : "Use dark theme"} className={GHOST}>
            {dark ? <Sun /> : <Moon />}
          </Button>
          <div className="lg:hidden">{account}</div>
        </div>
      </div>
    </header>
  );
}
