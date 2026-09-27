"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, HelpCircle, LayoutDashboard, Mail, Settings, Trophy, Users, CalendarClock } from "lucide-react";
import { Crest } from "../ui";
import { SlipHost } from "./SlipHost";
import { BR_BASE } from "@/lib/battle-royale/constants";
import type { AdminRole } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

const A = `${BR_BASE}/admin`;
const NAV = [
  { href: A, label: "Overview", icon: LayoutDashboard, role: "desk" },
  { href: `${A}/participants`, label: "Participants", icon: Users, role: "desk" },
  { href: `${A}/sessions`, label: "Sessions", icon: CalendarClock, role: "admin" },
  { href: `${A}/questions`, label: "Questions", icon: HelpCircle, role: "admin" },
  { href: `${A}/results`, label: "Results", icon: Trophy, role: "admin" },
  { href: `${A}/emails`, label: "Emails", icon: Mail, role: "admin" },
  { href: `${A}/settings`, label: "Settings", icon: Settings, role: "admin" },
] as const;

/** Sidebar on desktop, a scrolling tab row on phones. */
export function AdminShell({ email, role, children }: { email: string; role: AdminRole; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const items = NAV.filter((n) => role === "admin" || n.role === "desk");
  const isActive = (href: string) => (href === A ? pathname === A : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-[#f4f6f9] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-[#16181d]/10 bg-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-4">
          <Crest size={34} />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Battle Royale</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#16181d]/50">Admin · {role}</p>
          </div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                isActive(href) ? "bg-[#1C7BD9]/10 text-[#1462b0]" : "text-[#16181d]/65 hover:bg-[#16181d]/[0.04] hover:text-[#16181d]",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-[#16181d]/10 px-5 py-4 text-xs text-[#16181d]/55 lg:block">
          <p className="truncate">{email}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href={`${BR_BASE}/leaderboard`} className="inline-flex items-center gap-1.5 hover:text-[#16181d]"><BarChart3 className="h-3.5 w-3.5" /> Public leaderboard</Link>
            <Link href={BR_BASE} className="inline-flex items-center gap-1.5 hover:text-[#16181d]"><ExternalLink className="h-3.5 w-3.5" /> Event page</Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      <SlipHost />
    </div>
  );
}

export function AdminHeader({ title, lead, actions }: { title: string; lead?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-sm text-[#16181d]/60">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
