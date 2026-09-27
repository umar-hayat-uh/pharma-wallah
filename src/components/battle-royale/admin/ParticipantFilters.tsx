"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { PHARM_YEARS } from "@/lib/battle-royale/constants";

type Slot = { id: string; label: string };

const sel =
  "h-10 rounded-xl border border-[#16181d]/15 bg-white px-3 text-sm focus:border-[#1C7BD9] focus:outline-none focus:ring-4 focus:ring-[#1C7BD9]/15";

/** Filters live in the URL, so a filtered view can be refreshed, bookmarked or shared with the desk. */
export function ParticipantFilters({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [uni, setUni] = useState(params.get("university") ?? "");

  const set = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete("page");
    sp.delete("open");
    router.replace(`${pathname}?${sp}`, { scroll: false });
  };

  // Debounced text search.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((params.get("q") ?? "") !== q) set("q", q.trim());
    }, 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((params.get("university") ?? "") !== uni) set("university", uni.trim());
    }, 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uni]);

  const any = ["q", "year", "university", "slot", "status", "payment", "checkin"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative min-w-[16rem] flex-1">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#16181d]/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, phone or Player ID"
          className={`${sel} w-full pl-9`}
        />
      </label>
      <input value={uni} onChange={(e) => setUni(e.target.value)} placeholder="University" aria-label="University" className={`${sel} w-44`} />
      <select aria-label="Year" className={sel} value={params.get("year") ?? ""} onChange={(e) => set("year", e.target.value)}>
        <option value="">All years</option>
        {PHARM_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select aria-label="Slot" className={sel} value={params.get("slot") ?? ""} onChange={(e) => set("slot", e.target.value)}>
        <option value="">All slots</option>
        <option value="none">Walk-in (no slot)</option>
        {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
      <select aria-label="Registration status" className={sel} value={params.get("status") ?? ""} onChange={(e) => set("status", e.target.value)}>
        <option value="">Any status</option>
        <option value="registered">Registered</option>
        <option value="disqualified">Disqualified</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select aria-label="Fee" className={sel} value={params.get("payment") ?? ""} onChange={(e) => set("payment", e.target.value)}>
        <option value="">Any fee</option>
        <option value="paid">Paid / waived</option>
        <option value="unpaid">Fee due</option>
      </select>
      <select aria-label="Check-in" className={sel} value={params.get("checkin") ?? ""} onChange={(e) => set("checkin", e.target.value)}>
        <option value="">Any check-in</option>
        <option value="checked_in">Checked in (incl. late)</option>
        <option value="late">Late</option>
        <option value="not_checked_in">Not checked in</option>
      </select>
      {any && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            setUni("");
            router.replace(pathname, { scroll: false });
          }}
          className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-[#16181d]/60 hover:text-[#16181d]"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      )}
    </div>
  );
}
