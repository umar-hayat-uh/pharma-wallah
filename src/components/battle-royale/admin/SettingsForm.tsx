"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminFetch, useMutation } from "./client";
import { Field, Notice, inputClass } from "../ui";
import type { PublicSettings } from "@/lib/battle-royale/types";

export function SettingsForm({ initial }: { initial: PublicSettings }) {
  const [s, setS] = useState({
    eventTitle: initial.eventTitle,
    tagline: initial.tagline,
    eventDate: initial.eventDate ?? "",
    reportingTime: initial.reportingTime,
    venue: initial.venue,
    entryFee: String(initial.entryFee),
    contactText: initial.contactText,
    round1Count: String(initial.roundCounts[0]),
    round2Count: String(initial.roundCounts[1]),
    round3Count: String(initial.roundCounts[2]),
    speedBonusEnabled: initial.speedBonusEnabled,
    speedBonusMax: String(initial.speedBonusMax),
    winnersCount: String(initial.winnersCount),
    registrationOpen: initial.registrationOpen,
    competitionOpen: initial.competitionOpen,
    showFullNames: initial.showFullNames,
    rules: initial.rules.length ? initial.rules : [""],
  });
  const { run, pending, error, message } = useMutation();
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((prev) => ({ ...prev, [k]: v }));

  const save = () =>
    run(() => adminFetch("/api/battle-royale/admin/settings", "PATCH", { ...s, rules: s.rules.map((r) => r.trim()).filter(Boolean) }), "Settings saved.");

  const box = "space-y-4 rounded-2xl border border-[#16181d]/10 bg-white p-5";
  const check = (k: "speedBonusEnabled" | "registrationOpen" | "competitionOpen" | "showFullNames", label: string, hint: string) => (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" className="mt-0.5 h-4 w-4" checked={s[k]} onChange={(e) => set(k, e.target.checked)} />
      <span><span className="font-semibold">{label}</span><span className="block text-[#16181d]/55">{hint}</span></span>
    </label>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="grid max-w-5xl gap-5 lg:grid-cols-2">
      <section className={box}>
        <h2 className="font-semibold">Event</h2>
        <Field id="st-title" label="Event title"><input id="st-title" className={inputClass} value={s.eventTitle} onChange={(e) => set("eventTitle", e.target.value)} /></Field>
        <Field id="st-tag" label="Tagline"><input id="st-tag" className={inputClass} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="st-date" label="Event date"><input id="st-date" type="date" className={inputClass} value={s.eventDate} onChange={(e) => set("eventDate", e.target.value)} /></Field>
          <Field id="st-report" label="Reporting time" hint="e.g. 9:30 AM"><input id="st-report" className={inputClass} value={s.reportingTime} onChange={(e) => set("reportingTime", e.target.value)} /></Field>
        </div>
        <Field id="st-venue" label="Venue"><input id="st-venue" className={inputClass} value={s.venue} onChange={(e) => set("venue", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="st-fee" label="Entry fee (Rs.)"><input id="st-fee" type="number" min={0} className={inputClass} value={s.entryFee} onChange={(e) => set("entryFee", e.target.value)} /></Field>
          <Field id="st-win" label="Winners (Top N)"><input id="st-win" type="number" min={1} max={100} className={inputClass} value={s.winnersCount} onChange={(e) => set("winnersCount", e.target.value)} /></Field>
        </div>
        <Field id="st-contact" label="Contact line" hint="Shown on the instructions page."><input id="st-contact" className={inputClass} value={s.contactText} onChange={(e) => set("contactText", e.target.value)} /></Field>
      </section>

      <section className={box}>
        <h2 className="font-semibold">Battle & scoring</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field id="st-r1" label="Round 1 words"><input id="st-r1" type="number" min={1} max={20} className={inputClass} value={s.round1Count} onChange={(e) => set("round1Count", e.target.value)} /></Field>
          <Field id="st-r2" label="Round 2 boards"><input id="st-r2" type="number" min={1} max={5} className={inputClass} value={s.round2Count} onChange={(e) => set("round2Count", e.target.value)} /></Field>
          <Field id="st-r3" label="Round 3 MCQs"><input id="st-r3" type="number" min={1} max={40} className={inputClass} value={s.round3Count} onChange={(e) => set("round3Count", e.target.value)} /></Field>
        </div>
        <p className="text-xs text-[#16181d]/55">Points and time limits are set per question on the Questions page.</p>
        {check("speedBonusEnabled", "Speed bonus", "A fully correct answer earns extra points that fall to 0 as its timer runs out.")}
        <Field id="st-bonus" label="Maximum speed bonus"><input id="st-bonus" type="number" min={0} max={50} className={inputClass} value={s.speedBonusMax} onChange={(e) => set("speedBonusMax", e.target.value)} /></Field>
        {check("competitionOpen", "Battles can start", "Off before the event opens and after closing.")}
        {check("registrationOpen", "Online registration open", "The desk can always register walk-ins.")}
        {check("showFullNames", "Full names on the public leaderboard", "Off shows “Ayesha K.” — nobody's email or phone is ever shown.")}
      </section>

      <section className={`${box} lg:col-span-2`}>
        <h2 className="font-semibold">Rules</h2>
        <p className="text-sm text-[#16181d]/55">Shown, numbered, on the public instructions page.</p>
        <ol className="space-y-2">
          {s.rules.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 font-mono text-sm text-[#16181d]/50">{i + 1}.</span>
              <input aria-label={`Rule ${i + 1}`} className={inputClass} value={r} onChange={(e) => set("rules", s.rules.map((x, k) => (k === i ? e.target.value : x)))} />
              <button type="button" aria-label={`Remove rule ${i + 1}`} onClick={() => set("rules", s.rules.filter((_, k) => k !== i))} className="px-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ol>
        {s.rules.length < 30 && (
          <button type="button" onClick={() => set("rules", [...s.rules, ""])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C7BD9]"><Plus className="h-4 w-4" /> Add rule</button>
        )}
      </section>

      <div className="flex items-center gap-4 lg:col-span-2">
        <button type="submit" disabled={pending} className="h-11 rounded-xl bg-[#1C7BD9] px-6 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save settings"}</button>
        {error && <Notice tone="red" className="flex-1">{error}</Notice>}
        {message && <Notice tone="green" className="flex-1">{message}</Notice>}
      </div>
    </form>
  );
}
