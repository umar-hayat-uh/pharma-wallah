"use client";

// ============================================================
// The drawers: inventory, expiry, calculators, references, record, till
// ============================================================
//
// These are the things on the counter a pharmacist reaches for without leaving
// the counter. Each is self-contained and can be opened at any point in the
// workflow — the stage machine never depends on them, so opening the reference
// desk mid-check loses nothing.

import React, { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Copy, CreditCard, Download, Package, Printer, Search, Wallet } from "lucide-react";

import type { DocumentationDraft, Medicine, PaymentMethod, Scenario, StockLine, TrayItem } from "../types";
import { Button, Callout, Choice, EmptyNote, Field, KeyValue, Panel, RiskChip, inputClass } from "../kit";
import { DOC_FIELDS } from "../engine/scoring";
import { MEDICINES, medicine, medicineLabel, searchMedicines } from "../data/medicines";
import { COUNSELLING_TOPICS, SHELF_BAYS } from "../data/constants";
import { formatExpiry, toMonth } from "../engine/dates";
import { expiryStatus, reorderList, stockStatus, summariseExpiry, usablePacks } from "../engine/inventory";
import { buildTotals, formatPkr } from "../engine/pos";
import * as calc from "../engine/calculators";
import { cn } from "@/lib/utils";

// ─── Inventory ───────────────────────────────────────────────────────────────

export function InventoryPanel({
  stock,
  today,
  onDiscard,
  onReceive,
}: {
  stock: StockLine[];
  today: string;
  onDiscard: (medicineId: string, batchId: string) => void;
  onReceive: (medicineId: string, batchId: string, packs: number) => void;
}) {
  const [query, setQuery] = useState("");
  const month = toMonth(today);
  const lines = useMemo(() => {
    const matched = searchMedicines(query).map((m) => m.id);
    return stock.filter((l) => matched.indexOf(l.medicineId) !== -1);
  }, [stock, query]);
  const low = reorderList(stock, month);

  return (
    <div className="space-y-4">
      {low.length > 0 && (
        <Callout level="caution" title={`${low.length} line${low.length === 1 ? "" : "s"} at or below the reorder level`}>
          {low
            .slice(0, 4)
            .map((l) => {
              const m = medicine(l.medicineId);
              return m ? `${m.brand} ${m.strength}` : l.medicineId;
            })
            .join(", ")}
          {low.length > 4 ? ` and ${low.length - 4} more.` : "."}
        </Callout>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={cn(inputClass, "cph-field pl-9")}
          placeholder="Search stock…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stock"
        />
      </div>

      <ul className="space-y-2">
        {lines.map((line) => {
          const m = medicine(line.medicineId);
          if (!m) return null;
          const status = stockStatus(line, month);
          const usable = usablePacks(line, month);
          return (
            <li key={line.medicineId} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold leading-tight text-slate-900">
                    {m.brand} {m.strength}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">
                    {m.generic} · {m.form} · pack of {m.packSize}
                  </p>
                </div>
                <RiskChip level={status === "out" ? "critical" : status === "low" ? "caution" : "ok"}>
                  {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock"}
                </RiskChip>
              </div>
              <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
                <KeyValue k="Usable packs" v={usable} />
                <KeyValue k="Reorder level" v={line.reorderLevel} />
              </div>
              <ul className="mt-2 space-y-1.5">
                {line.batches.map((b) => {
                  const s = expiryStatus(b.expiry, month);
                  return (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                      <span className="text-[12px] font-semibold text-slate-700">{b.batchNo}</span>
                      <span className="text-[12px] tabular-nums text-slate-600">Exp {formatExpiry(b.expiry)}</span>
                      <span className="text-[12px] text-slate-500">{b.packs} packs</span>
                      {s === "expired" ? (
                        <Button size="sm" variant="danger" onClick={() => onDiscard(line.medicineId, b.id)}>
                          Discard
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => onReceive(line.medicineId, b.id, 10)}>
                          <Package className="h-3 w-3" /> +10
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      {lines.length === 0 && <EmptyNote>No stock line matches that search.</EmptyNote>}
    </div>
  );
}

export function ExpiryDashboard({ stock, today, onDiscard }: { stock: StockLine[]; today: string; onDiscard: (medicineId: string, batchId: string) => void }) {
  const month = toMonth(today);
  const summary = useMemo(() => summariseExpiry(stock, month), [stock, month]);

  const tile = (level: "critical" | "caution" | "ok", label: string, count: number) => (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <RiskChip level={level}>{label}</RiskChip>
      <p className="mt-2 text-[22px] font-extrabold leading-none tabular-nums text-slate-900">{count}</p>
      <p className="mt-1 text-[11.5px] text-slate-500">batch{count === 1 ? "" : "es"}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        {tile("critical", "Expired", summary.expired.length)}
        {tile("caution", "Expiring soon", summary.expiringSoon.length)}
        {tile("ok", "In date", summary.normalCount)}
      </div>

      <Panel eyebrow="Date check" title="Expired stock on the shelf" description="Out-of-date stock is removed, not sold and not counted.">
        {summary.expired.length === 0 ? (
          <EmptyNote>Nothing on the shelf is out of date.</EmptyNote>
        ) : (
          <ul className="space-y-2">
            {summary.expired.map(({ medicineId, batch }) => {
              const m = medicine(medicineId);
              return (
                <li key={batch.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
                  <span className="min-w-0 text-[13px] font-semibold text-rose-900">
                    {m ? `${m.brand} ${m.strength}` : medicineId}
                  </span>
                  <span className="text-[12px] tabular-nums text-rose-800">{batch.batchNo} · exp {formatExpiry(batch.expiry)}</span>
                  <Button size="sm" variant="danger" onClick={() => onDiscard(medicineId, batch.id)}>
                    Remove from shelf
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel eyebrow="Within six months" title="Expiring soon" description="Use these first, and watch that they outlast the courses they are dispensed for.">
        {summary.expiringSoon.length === 0 ? (
          <EmptyNote>Nothing is due to expire within six months.</EmptyNote>
        ) : (
          <ul className="space-y-1.5">
            {summary.expiringSoon.slice(0, 12).map(({ medicineId, batch }) => {
              const m = medicine(medicineId);
              return (
                <li key={batch.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <span className="text-[12.5px] font-semibold text-amber-900">{m ? `${m.brand} ${m.strength}` : medicineId}</span>
                  <span className="text-[12px] tabular-nums text-amber-800">exp {formatExpiry(batch.expiry)} · {batch.packs} packs</span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ─── Calculators ─────────────────────────────────────────────────────────────

type CalcId = "quantity" | "days" | "weight" | "paediatric" | "crcl" | "bmi" | "concentration" | "infusion" | "units";

const CALCS: { id: CalcId; label: string }[] = [
  { id: "quantity", label: "Quantity for a course" },
  { id: "days", label: "Days' supply" },
  { id: "weight", label: "Weight-based dose" },
  { id: "paediatric", label: "Paediatric rules" },
  { id: "crcl", label: "Creatinine clearance" },
  { id: "bmi", label: "BMI and BSA" },
  { id: "concentration", label: "Concentration and dilution" },
  { id: "infusion", label: "Infusion rate" },
  { id: "units", label: "Unit conversion" },
];

function Result({ result }: { result: calc.CalcResult | null }) {
  if (!result) {
    return <EmptyNote>Enter the values above. Nothing is shown until every figure needed is present — a calculator that guesses is worse than one that waits.</EmptyNote>;
  }
  return (
    <div className="rounded-xl border border-brandBlue/25 bg-brandBlue/[0.05] px-3.5 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brandBlue">Result</p>
      <p className="mt-1 text-[24px] font-extrabold leading-none tabular-nums text-slate-900">
        {result.value} <span className="text-[14px] font-bold text-slate-500">{result.unit}</span>
      </p>
      <ul className="mt-2.5 space-y-1">
        {result.working.map((w, i) => (
          <li key={i} className="font-mono text-[12px] leading-relaxed text-slate-600">
            {w}
          </li>
        ))}
      </ul>
      {result.note && <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{result.note}</p>}
    </div>
  );
}

export function CalculatorPanel({ prefill }: { prefill?: { weightKg?: number; ageYears?: number; scr?: number; female?: boolean } }) {
  const [tab, setTab] = useState<CalcId>("quantity");
  const [f, setF] = useState<Record<string, string>>({
    dose: "1",
    perDay: "3",
    days: "7",
    quantity: "21",
    mgkg: "40",
    weight: prefill && prefill.weightKg ? String(prefill.weightKg) : "",
    age: prefill && prefill.ageYears ? String(prefill.ageYears) : "",
    scr: prefill && prefill.scr ? String(prefill.scr) : "",
    height: "",
    adultDose: "500",
    c1: "10",
    v1: "",
    c2: "2",
    v2: "100",
    volume: "500",
    dropFactor: "20",
    minutes: "240",
    hours: "4",
    convValue: "1",
  });
  const [from, setFrom] = useState("g");
  const [to, setTo] = useState("mg");
  const [kind, setKind] = useState<calc.UnitKind>("mass");
  const n = (k: string) => Number(f[k]);
  const set = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const field = (k: string, label: string, hint?: string) => (
    <Field label={label} hint={hint}>
      {(id) => <input id={id} className={inputClass} inputMode="decimal" value={f[k]} onChange={(e) => set(k, e.target.value)} />}
    </Field>
  );

  let result: calc.CalcResult | null = null;
  if (tab === "quantity") result = calc.quantityForCourse(n("dose"), n("perDay"), n("days"));
  else if (tab === "days") result = calc.daysSupplyCalc(n("quantity"), n("dose"), n("perDay"));
  else if (tab === "weight") result = calc.weightBasedDose(n("mgkg"), n("weight"), n("perDay"));
  else if (tab === "crcl") result = calc.cockcroftGault(n("age"), n("weight"), n("scr"), !!(prefill && prefill.female));
  else if (tab === "bmi") result = calc.bmi(n("weight"), n("height"));
  else if (tab === "infusion") result = calc.dripRate(n("volume"), n("dropFactor"), n("minutes"));
  else if (tab === "units") result = calc.convertUnits(n("convValue"), from, to, kind);

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CALCS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.id)}
            aria-pressed={tab === c.id}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
              tab === c.id ? "border-brandBlue bg-brandBlue text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Panel title={CALCS.find((c) => c.id === tab)?.label}>
        <div className="grid gap-3 sm:grid-cols-2">
          {tab === "quantity" && (
            <>
              {field("dose", "Dose per administration")}
              {field("perDay", "Doses each day")}
              {field("days", "Days")}
            </>
          )}
          {tab === "days" && (
            <>
              {field("quantity", "Quantity supplied")}
              {field("dose", "Dose per administration")}
              {field("perDay", "Doses each day")}
            </>
          )}
          {tab === "weight" && (
            <>
              {field("mgkg", "mg/kg/day")}
              {field("weight", "Weight (kg)")}
              {field("perDay", "Doses each day", "Leave as is for a daily total only.")}
            </>
          )}
          {tab === "crcl" && (
            <>
              {field("age", "Age (years)")}
              {field("weight", "Weight (kg)")}
              {field("scr", "Serum creatinine (mg/dL)")}
            </>
          )}
          {tab === "bmi" && (
            <>
              {field("weight", "Weight (kg)")}
              {field("height", "Height (cm)")}
            </>
          )}
          {tab === "infusion" && (
            <>
              {field("volume", "Volume (mL)")}
              {field("dropFactor", "Drop factor (drops/mL)")}
              {field("minutes", "Time (minutes)")}
            </>
          )}
          {tab === "units" && (
            <>
              <Field label="Value">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.convValue} onChange={(e) => set("convValue", e.target.value)} />}</Field>
              <Field label="Kind">
                {(id) => (
                  <select
                    id={id}
                    className={inputClass}
                    value={kind}
                    onChange={(e) => {
                      const k = e.target.value as calc.UnitKind;
                      setKind(k);
                      setFrom(calc.UNIT_CHOICES[k][0]);
                      setTo(calc.UNIT_CHOICES[k][1]);
                    }}
                  >
                    <option value="mass">Mass</option>
                    <option value="volume">Volume</option>
                    <option value="weight">Body weight</option>
                    <option value="temperature">Temperature</option>
                  </select>
                )}
              </Field>
              <Field label="From">
                {(id) => (
                  <select id={id} className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
                    {calc.UNIT_CHOICES[kind].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="To">
                {(id) => (
                  <select id={id} className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
                    {calc.UNIT_CHOICES[kind].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                )}
              </Field>
            </>
          )}
        </div>

        {tab === "paediatric" && <PaediatricCalculators f={f} set={set} />}
        {tab === "concentration" && <ConcentrationCalculators f={f} set={set} />}

        {tab !== "paediatric" && tab !== "concentration" && (
          <div className="mt-4">
            <Result result={result} />
          </div>
        )}
      </Panel>

      <p className="text-[11.5px] leading-relaxed text-slate-500">
        These are teaching implementations of standard formulae, shown with their working. The site's full calculators
        at <span className="font-semibold">/calculation-tools</span> go further; nothing here replaces the current
        formulary or a prescriber's judgement.
      </p>
    </div>
  );
}

function PaediatricCalculators({ f, set }: { f: Record<string, string>; set: (k: string, v: string) => void }) {
  const adult = Number(f.adultDose);
  const weight = Number(f.weight);
  const age = Number(f.age);
  const height = Number(f.height);
  const bsa = calc.bsaMosteller(weight, height);
  return (
    <div className="mt-2 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Adult dose (mg)">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.adultDose} onChange={(e) => set("adultDose", e.target.value)} />}</Field>
        <Field label="Child weight (kg)">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.weight} onChange={(e) => set("weight", e.target.value)} />}</Field>
        <Field label="Child age (years)">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.age} onChange={(e) => set("age", e.target.value)} />}</Field>
        <Field label="Child height (cm)" hint="For the surface-area method.">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.height} onChange={(e) => set("height", e.target.value)} />}</Field>
      </div>
      <Callout level="caution" title="These rules are approximations">
        Clark's and Young's rules predate licensed paediatric dosing. Where a weight-based dose exists for the product,
        it supersedes both — use these to check an order looks sane, never to invent one.
      </Callout>
      <div className="space-y-2.5">
        <Result result={calc.clarksRule(adult, weight)} />
        <Result result={calc.youngsRule(adult, age)} />
        {bsa && <Result result={calc.bsaDose(adult, bsa.value)} />}
      </div>
    </div>
  );
}

function ConcentrationCalculators({ f, set }: { f: Record<string, string>; set: (k: string, v: string) => void }) {
  const num = (k: string) => (f[k] === "" ? null : Number(f[k]));
  return (
    <div className="mt-2 space-y-3">
      <p className="text-[12.5px] leading-relaxed text-slate-500">
        C₁V₁ = C₂V₂. Leave exactly one box empty and it will be solved for.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="C₁">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.c1} onChange={(e) => set("c1", e.target.value)} />}</Field>
        <Field label="V₁">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.v1} onChange={(e) => set("v1", e.target.value)} />}</Field>
        <Field label="C₂">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.c2} onChange={(e) => set("c2", e.target.value)} />}</Field>
        <Field label="V₂">{(id) => <input id={id} className={inputClass} inputMode="decimal" value={f.v2} onChange={(e) => set("v2", e.target.value)} />}</Field>
      </div>
      <Result result={calc.dilution(num("c1"), num("v1"), num("c2"), num("v2"))} />
    </div>
  );
}

// ─── Reference desk ──────────────────────────────────────────────────────────

export function ReferenceDesk({ focusId }: { focusId?: string | null }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(focusId || null);
  const results = useMemo(() => searchMedicines(query, MEDICINES).slice(0, 24), [query]);
  const open: Medicine | undefined = openId ? medicine(openId) : undefined;

  if (open) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
          ← Back to the reference desk
        </Button>
        <Panel eyebrow={open.generic} title={`${open.brand} ${open.strength}`} description={open.reference.summary}>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <KeyValue k="Form" v={open.form} />
            <KeyValue k="Pack" v={`${open.packSize} ${open.packUnit}`} />
            <KeyValue k="Storage" v={open.storage} />
            <KeyValue k="Legal status" v={open.otc ? "Pharmacy sale" : "Prescription only"} />
            {open.usualAdultDose && <KeyValue k="Usual adult dose" v={`${open.usualAdultDose.min}–${open.usualAdultDose.max} ${open.usualAdultDose.unit}`} />}
            {open.maxDailyDose && <KeyValue k="Maximum daily dose" v={`${open.maxDailyDose.value} ${open.maxDailyDose.unit}`} />}
          </div>
        </Panel>

        {([
          ["Indications", open.reference.indications],
          ["Contraindications", open.reference.contraindications],
          ["Adverse effects", open.reference.adverseEffects],
        ] as [string, string[]][]).map(([heading, list]) => (
          <Panel key={heading} title={heading}>
            <ul className="space-y-1.5">
              {list.map((x) => (
                <li key={x} className="flex gap-2 text-[13px] leading-relaxed text-slate-700">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                  {x}
                </li>
              ))}
            </ul>
          </Panel>
        ))}

        <Panel title="Pregnancy and breastfeeding">
          <p className="text-[13px] leading-relaxed text-slate-700">{open.reference.pregnancy}</p>
        </Panel>

        <Panel title="Counselling points" description="What a patient should leave the counter knowing.">
          <ul className="space-y-2.5">
            {COUNSELLING_TOPICS.map((t) => (
              <li key={t.id}>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{t.label}</p>
                <ul className="mt-1 space-y-1">
                  {open.counselling[t.id].points.map((p) => (
                    <li key={p} className="text-[13px] leading-relaxed text-slate-700">
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Panel>

        <p className="text-[11.5px] leading-relaxed text-slate-500">
          Educational reference material for this simulation. It does not replace the current formulary, the product's
          summary of product characteristics, or professional judgement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className={cn(inputClass, "cph-field pl-9")}
          placeholder="Search drug information…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search drug information"
        />
      </div>
      <ul className="space-y-1.5">
        {results.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setOpenId(m.id)}
              className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold leading-tight text-slate-900">{m.brand} {m.strength}</span>
                <span className="mt-0.5 block text-[12px] text-slate-500">{m.generic} · {m.form}</span>
              </span>
              <span className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-500">
                {SHELF_BAYS.find((b) => b.id === m.category)?.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Documentation ───────────────────────────────────────────────────────────

export function DocumentationPanel({
  draft,
  onChange,
  onConfirm,
  confirmed,
  preview,
  onCopy,
  onPrint,
}: {
  draft: DocumentationDraft;
  onChange: (field: keyof DocumentationDraft, value: string) => void;
  onConfirm: () => void;
  confirmed: boolean;
  preview: string[];
  onCopy: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel eyebrow="Intervention record" title="Document the encounter" description="What you assessed, what you supplied, what you advised and what you referred.">
        <div className="space-y-3">
          {DOC_FIELDS.map((field) => (
            <Field key={field.key} label={field.label}>
              {(id) => (
                <textarea
                  id={id}
                  rows={2}
                  className={cn(inputClass, "resize-y")}
                  value={draft[field.key]}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              )}
            </Field>
          ))}
        </div>
        <Button className="mt-4" onClick={onConfirm}>
          <ClipboardCheck className="h-4 w-4" /> {confirmed ? "Update the record" : "File the record"}
        </Button>
      </Panel>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Record</p>
        <div className="cph-label px-4 pb-4 pt-2">
          <pre className="whitespace-pre-wrap break-words font-sans text-[11.5px] leading-relaxed text-[#26303f]">{preview.join("\n")}</pre>
        </div>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="secondary" onClick={onPrint}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Till ────────────────────────────────────────────────────────────────────

const PAYMENT_COPY: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "cash", label: "Cash", icon: Wallet },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "digital", label: "Digital wallet", icon: Download },
];

export function PosPanel({
  tray,
  discount,
  onDiscount,
  payment,
  onPayment,
  onComplete,
  paid,
}: {
  tray: TrayItem[];
  discount: number;
  onDiscount: (amount: number) => void;
  payment: PaymentMethod | null;
  onPayment: (method: PaymentMethod) => void;
  onComplete: () => void;
  paid: boolean;
}) {
  const totals = useMemo(() => buildTotals(tray, discount), [tray, discount]);

  return (
    <div className="space-y-4">
      <Panel eyebrow="Till" title="Complete the sale">
        {totals.lines.length === 0 ? (
          <EmptyNote>Nothing is being supplied, so there is nothing to charge. A referral with no supply still completes the case.</EmptyNote>
        ) : (
          <ul className="space-y-1.5">
            {totals.lines.map((l) => (
              <li key={l.medicineId} className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-1.5 last:border-0">
                <span className="min-w-0 text-[13px] text-slate-700">{l.description}</span>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-slate-900">{formatPkr(l.totalPkr)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3">
          <KeyValue k="Subtotal" v={formatPkr(totals.subtotalPkr)} />
          <KeyValue k="Discount" v={`− ${formatPkr(totals.discountPkr)}`} />
          <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-slate-200 pt-2">
            <span className="text-[13px] font-bold text-slate-700">Total</span>
            <span className="text-[19px] font-extrabold tabular-nums text-slate-900">{formatPkr(totals.totalPkr)}</span>
          </div>
        </div>

        <Field label="Discount (Rs)" className="mt-3 max-w-[180px]">
          {(id) => (
            <input id={id} className={inputClass} inputMode="numeric" value={discount || ""} onChange={(e) => onDiscount(Number(e.target.value) || 0)} />
          )}
        </Field>
      </Panel>

      <Panel eyebrow="Payment" title="How are they paying?">
        <div className="grid gap-2 sm:grid-cols-3">
          {PAYMENT_COPY.map((p) => (
            <Choice key={p.id} selected={payment === p.id} onSelect={() => onPayment(p.id)} title={p.label} />
          ))}
        </div>
        <Button className="mt-3" onClick={onComplete} disabled={!payment || paid}>
          {paid ? "Transaction complete" : "Complete the transaction"}
        </Button>
        <p className="mt-2 text-[11.5px] leading-relaxed text-slate-500">
          Prices are indicative teaching values in PKR, not a price list.
        </p>
      </Panel>
    </div>
  );
}

// ─── Help ────────────────────────────────────────────────────────────────────

export function HelpPanel() {
  return (
    <div className="space-y-3">
      <Panel eyebrow="How the counter works" title="Observe · assess · decide · verify · dispense · counsel · document">
        <ul className="space-y-2.5 text-[13px] leading-relaxed text-slate-700">
          <li><strong>One action at a time.</strong> The blue button is always the next thing a pharmacist would do. Everything else is optional.</li>
          <li><strong>The checks do not tell you the answer.</strong> Each one lays out the evidence and asks for your verdict. What was actually there appears only once you have recorded one.</li>
          <li><strong>Mistakes do not end the case.</strong> A review tells you what to re-check and leaves you able to fix it. Only the state you finish in is scored.</li>
          <li><strong>Some problems stop the supply.</strong> A critical allergy or a contraindicated combination cannot be dispensed past — the way forward is to record an intervention.</li>
          <li><strong>Everything on the bench stays open to you.</strong> The reference desk, the calculators, the inventory and the patient's record can be opened at any point without losing your place.</li>
        </ul>
      </Panel>
      <Panel title="Keyboard">
        <ul className="space-y-1.5 text-[13px] text-slate-700">
          <li><kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold">Tab</kbd> moves through every control; the whole workflow is completable without a pointer.</li>
          <li><kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold">Esc</kbd> closes a drawer or dialog.</li>
        </ul>
      </Panel>
      <Callout level="review" title="Educational use only">
        Every patient, prescription, batch and price in this simulation is fictional. Doses and counselling points are
        teaching values and do not replace the current formulary, the product literature or professional judgement.
      </Callout>
    </div>
  );
}
